// Sound effects manager for Math Hopper
// Uses Web Audio API to generate sounds programmatically (no external assets needed)

const STORAGE_KEY = 'math-hopper-sound-muted';

export type SoundName =
  | 'jump'
  | 'coin'
  | 'questionBlock'
  | 'correctAnswer'
  | 'wrongAnswer'
  | 'enemyStomp'
  | 'loseLife'
  | 'levelComplete'
  | 'gameOver'
  | 'buttonClick';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private muted: boolean = false;
  private initialized: boolean = false;

  constructor() {
    this.loadMutedState();
  }

  private loadMutedState(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    } catch (e) {
      console.error('Failed to load muted state:', e);
    }
  }

  private saveMutedState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, String(this.muted));
    } catch (e) {
      console.error('Failed to save muted state:', e);
    }
  }

  // Initialize audio context (must be called after user interaction)
  public init(): void {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.error('Failed to initialize audio context:', e);
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.saveMutedState();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // Play a sound by name
  public play(soundName: SoundName): void {
    if (this.muted || !this.audioContext) return;

    // Ensure context is running (may be suspended)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (soundName) {
      case 'jump':
        this.playJump();
        break;
      case 'coin':
        this.playCoin();
        break;
      case 'questionBlock':
        this.playQuestionBlock();
        break;
      case 'correctAnswer':
        this.playCorrectAnswer();
        break;
      case 'wrongAnswer':
        this.playWrongAnswer();
        break;
      case 'enemyStomp':
        this.playEnemyStomp();
        break;
      case 'loseLife':
        this.playLoseLife();
        break;
      case 'levelComplete':
        this.playLevelComplete();
        break;
      case 'gameOver':
        this.playGameOver();
        break;
      case 'buttonClick':
        this.playButtonClick();
        break;
    }
  }

  // Create an oscillator with envelope
  private createOscillator(
    type: OscillatorType,
    frequency: number,
    duration: number,
    volume: number = 0.3,
    attack: number = 0.01,
    decay: number = 0.1
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // ADSR envelope (simplified)
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + attack + decay);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Play a frequency sweep
  private playFrequencySweep(
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    const now = this.audioContext.currentTime;

    oscillator.frequency.setValueAtTime(startFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Individual sound implementations

  private playJump(): void {
    // Quick upward sweep - bouncy sound
    this.playFrequencySweep(150, 400, 0.15, 'sine', 0.25);
  }

  private playCoin(): void {
    // Two-note chime
    this.createOscillator('sine', 988, 0.1, 0.2);  // B5
    setTimeout(() => {
      this.createOscillator('sine', 1319, 0.15, 0.2);  // E6
    }, 75);
  }

  private playQuestionBlock(): void {
    // Pop sound - quick frequency drop
    this.playFrequencySweep(600, 200, 0.1, 'sine', 0.3);
  }

  private playCorrectAnswer(): void {
    // Happy fanfare - ascending notes
    const notes = [523, 659, 784, 1047];  // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator('sine', freq, 0.2, 0.25);
      }, i * 100);
    });
  }

  private playWrongAnswer(): void {
    // Gentle buzz - not scary for kids
    this.createOscillator('sine', 200, 0.3, 0.2, 0.01, 0.1);
    setTimeout(() => {
      this.createOscillator('sine', 150, 0.3, 0.15);
    }, 150);
  }

  private playEnemyStomp(): void {
    // Squish sound - quick downward sweep
    this.playFrequencySweep(400, 80, 0.12, 'sine', 0.3);
  }

  private playLoseLife(): void {
    // Gentle "ouch" - descending notes
    const notes = [440, 350, 280];  // A4, descending
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator('sine', freq, 0.15, 0.2);
      }, i * 80);
    });
  }

  private playLevelComplete(): void {
    // Victory fanfare - triumphant ascending melody
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047];  // C major scale
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator('sine', freq, 0.25, 0.25);
        // Add harmony
        if (i >= 4) {
          this.createOscillator('sine', freq * 1.25, 0.25, 0.15);  // Major third
        }
      }, i * 100);
    });
  }

  private playGameOver(): void {
    // Sad trombone - descending notes
    const notes = [392, 370, 349, 330];  // G4, F#4, F4, E4
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator('sawtooth', freq, 0.4, 0.15);
      }, i * 300);
    });
  }

  private playButtonClick(): void {
    // Quick click sound
    this.createOscillator('sine', 800, 0.05, 0.15);
  }
}

// Singleton instance
const soundManager = new SoundManager();

export default soundManager;

// Helper function to ensure sound is initialized after user interaction
export function initSoundOnInteraction(): void {
  const init = () => {
    soundManager.init();
    document.removeEventListener('click', init);
    document.removeEventListener('keydown', init);
    document.removeEventListener('touchstart', init);
  };

  document.addEventListener('click', init);
  document.addEventListener('keydown', init);
  document.addEventListener('touchstart', init);
}
