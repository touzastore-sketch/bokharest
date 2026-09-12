// Luxury Tactile Haptic Feedback Utility for Bokharest Black
// Combines native Web Vibration API with subtle micro-acoustic tactile impulse fallback

type HapticType = 'tab' | 'order' | 'add' | 'stepper' | 'favorite' | 'toggle' | 'refresh' | 'success';

class HapticsManager {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Lazy init audio context on first user interaction to comply with browser autoplay policies
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bb_haptics_enabled');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bb_haptics_enabled', enabled ? 'true' : 'false');
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        try {
          this.audioCtx = new AudioCtxClass();
        } catch {
          // Ignore context creation failure
        }
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Produces an ultra-subtle, luxury damped acoustic click (resembling a native mechanical shutter or physical Taptic Engine)
   */
  private playMicroAcousticImpulse(freq: number, duration: number, gainValue: number = 0.04) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      // Fast exponential pitch drop for physical mechanical click feel
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.35), ctx.currentTime + duration);

      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Gracefully ignore audio synthesis errors
    }
  }

  /**
   * Trigger vibration with safety guard for iframe and platform permissions
   */
  private vibrate(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently caught if sandboxed iframe restricts vibration
      }
    }
  }

  /**
   * Navigation tab tap: Crisp, ultra-light tactile tick
   */
  public tab() {
    if (!this.isEnabled) return;
    this.vibrate(12);
    this.playMicroAcousticImpulse(240, 0.022, 0.025);
  }

  /**
   * Add to order / cart: Affirmative, satisfying medium tactile impulse
   */
  public add() {
    if (!this.isEnabled) return;
    this.vibrate([16, 35, 20]);
    this.playMicroAcousticImpulse(380, 0.035, 0.04);
  }

  /**
   * Quantity Stepper (+/-): Crisp, sharp micro-tick
   */
  public stepper() {
    if (!this.isEnabled) return;
    this.vibrate(8);
    this.playMicroAcousticImpulse(320, 0.018, 0.025);
  }

  /**
   * Order placed or confirmed: Deep, celebratory luxury double-burst
   */
  public order() {
    if (!this.isEnabled) return;
    this.vibrate([25, 45, 30, 45, 50]);
    this.playMicroAcousticImpulse(420, 0.05, 0.055);
    setTimeout(() => {
      this.playMicroAcousticImpulse(580, 0.06, 0.045);
    }, 90);
  }

  /**
   * Favorite toggled: Soft pleasant tactile bounce
   */
  public favorite() {
    if (!this.isEnabled) return;
    this.vibrate([10, 30, 14]);
    this.playMicroAcousticImpulse(440, 0.028, 0.03);
  }

  /**
   * Filter / Pill toggle: Subtle light switch
   */
  public toggle() {
    if (!this.isEnabled) return;
    this.vibrate(10);
    this.playMicroAcousticImpulse(280, 0.02, 0.025);
  }

  /**
   * Pull-to-refresh activation or completion
   */
  public refresh() {
    if (!this.isEnabled) return;
    this.vibrate([14, 40, 24]);
    this.playMicroAcousticImpulse(350, 0.04, 0.035);
  }

  /**
   * General purpose trigger
   */
  public trigger(type: HapticType = 'tab') {
    switch (type) {
      case 'tab': return this.tab();
      case 'order': return this.order();
      case 'add': return this.add();
      case 'stepper': return this.stepper();
      case 'favorite': return this.favorite();
      case 'toggle': return this.toggle();
      case 'refresh': return this.refresh();
      case 'success': return this.order();
    }
  }
}

export const haptic = new HapticsManager();
