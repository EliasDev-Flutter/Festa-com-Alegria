// Audio synthesizer & player for party notifications on iPhone

class NotificationSoundManager {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play cute party notification sounds via Web Audio API or custom file
  public play(preset: 'chime' | 'fanfare' | 'ding' | 'custom', customUrl?: string): void {
    if (preset === 'custom' && customUrl) {
      try {
        const audio = new Audio(customUrl);
        audio.play().catch((err) => {
          console.warn('Could not play custom audio file, falling back to chime', err);
          this.playChime();
        });
        return;
      } catch {
        this.playChime();
        return;
      }
    }

    switch (preset) {
      case 'fanfare':
        this.playFanfare();
        break;
      case 'ding':
        this.playDing();
        break;
      case 'chime':
      default:
        this.playChime();
        break;
    }
  }

  // Chime Mágico (Sweet celebratory party chime)
  public playChime(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.55);
      });
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Buzina de Festa / Fanfarra alegre
  public playFanfare(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = [
        { f: 587.33, d: 0.1, t: 0.0 }, // D5
        { f: 587.33, d: 0.1, t: 0.12 }, // D5
        { f: 587.33, d: 0.1, t: 0.24 }, // D5
        { f: 880.0, d: 0.35, t: 0.36 }, // A5
      ];

      notes.forEach(({ f, d, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0, now + t);
        gain.gain.linearRampToValueAtTime(0.25, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + d + 0.05);
      });
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Ding Delicado
  public playDing(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.51, now); // E6

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }
}

export const soundManager = new NotificationSoundManager();
