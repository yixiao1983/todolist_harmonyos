/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Audio Synthesizer for Focus White Noise using Web Audio API
export class FocusAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private crackleInterval: number | null = null;
  private activeTheme: 'RAIN' | 'WAVE' | 'FOREST' | 'FIRE' | 'NONE' = 'NONE';
  private currentVolume: number = 0.5;

  constructor() {
    // Initialized lazily on first user play gesture due to browser policy
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Helper to generate pre-filled audio buffers for noise types
  private getNoiseBuffer(type: 'white' | 'pink' | 'brown', seconds: number = 4): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; // for pink
    let lastOut = 0.0; // for brown

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'white') {
        data[i] = white;
      } else if (type === 'pink') {
        // Paul Kellet's refined pink noise approximation
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = pink * 0.11; // scale back
      } else if (type === 'brown') {
        // Brown noise (random walk rumble)
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // boost back
      }
    }
    return buffer;
  }

  public play(theme: 'RAIN' | 'WAVE' | 'FOREST' | 'FIRE' | 'NONE', volume: number = 0.5) {
    this.stop();
    this.activeTheme = theme;
    this.currentVolume = volume;

    if (theme === 'NONE') return;

    this.initContext();
    if (!this.ctx) return;

    // Create central master volume
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime); // keep comfortable
    this.gainNode.connect(this.ctx.destination);

    if (theme === 'RAIN') {
      // Deep pink noise rumble + high frequency crackles
      const pinkBuffer = this.getNoiseBuffer('pink', 4);
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = pinkBuffer;
      this.noiseNode.loop = true;

      // Low pass filter is used to create muffled drop sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.noiseNode.connect(filter);
      filter.connect(this.gainNode);
      this.noiseNode.start();

      // Synthesize individual crackling raindrops
      this.crackleInterval = window.setInterval(() => {
        if (!this.ctx || !this.gainNode || Math.random() > 0.6) return;
        
        // Single click/splatter sound
        const osc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.04);
        
        clickGain.gain.setValueAtTime(0.005 + Math.random() * 0.015, this.ctx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
        
        osc.connect(clickGain);
        clickGain.connect(this.gainNode);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      }, 70);

    } else if (theme === 'WAVE') {
      // Ocean wave breathing wash
      const pinkBuffer = this.getNoiseBuffer('pink', 6);
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = pinkBuffer;
      this.noiseNode.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(350, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(1.0, this.ctx.currentTime);

      // Modulating volume and filter frequency dynamically using an LFO
      // to create wave washing on the beach shore (~8s cycle)
      this.lfoNode = this.ctx.createOscillator();
      this.lfoNode.type = 'sine';
      this.lfoNode.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 0.12 Hz (approx 8.3s cycle)

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(150, this.ctx.currentTime); // range for frequency sweep

      const washVol = this.ctx.createGain();
      washVol.gain.setValueAtTime(0.1, this.ctx.currentTime);

      // Connect LFO to bandpass frequency
      this.lfoNode.connect(lfoGain);
      lfoGain.connect(bandpass.frequency);

      // Also connect a attenuated LFO to wave volume
      const volLfoGain = this.ctx.createGain();
      volLfoGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.lfoNode.connect(volLfoGain);
      
      const volBias = this.ctx.createGain();
      volBias.gain.setValueAtTime(0.5, this.ctx.currentTime);
      volLfoGain.connect(volBias.gain);

      // Central connection
      this.noiseNode.connect(bandpass);
      bandpass.connect(volBias);
      volBias.connect(this.gainNode);

      this.noiseNode.start();
      this.lfoNode.start();

    } else if (theme === 'FOREST') {
      // Low whispering wind in trees
      const brownBuffer = this.getNoiseBuffer('brown', 5);
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = brownBuffer;
      this.noiseNode.loop = true;

      const resonance = this.ctx.createBiquadFilter();
      resonance.type = 'bandpass';
      resonance.frequency.setValueAtTime(150, this.ctx.currentTime);
      resonance.Q.setValueAtTime(0.8, this.ctx.currentTime);

      // Low frequency oscillator for wind gust swell (~12s cycle)
      this.lfoNode = this.ctx.createOscillator();
      this.lfoNode.type = 'sine';
      this.lfoNode.frequency.setValueAtTime(0.08, this.ctx.currentTime);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(80, this.ctx.currentTime);

      this.lfoNode.connect(lfoGain);
      lfoGain.connect(resonance.frequency);

      this.noiseNode.connect(resonance);
      resonance.connect(this.gainNode);

      this.noiseNode.start();
      this.lfoNode.start();

    } else if (theme === 'FIRE') {
      // Low brown rumble for the fire logs + random crackling sparks
      const brownBuffer = this.getNoiseBuffer('brown', 4);
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = brownBuffer;
      this.noiseNode.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(250, this.ctx.currentTime);

      this.noiseNode.connect(lowpass);
      lowpass.connect(this.gainNode);
      this.noiseNode.start();

      // Quick random snapping ember spark synthesis
      this.crackleInterval = window.setInterval(() => {
        if (!this.ctx || !this.gainNode || Math.random() > 0.45) return;

        const osc = this.ctx.createOscillator();
        const crackleGain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2000 + Math.random() * 3000, this.ctx.currentTime);
        
        crackleGain.gain.setValueAtTime(0.008 + Math.random() * 0.012, this.ctx.currentTime);
        crackleGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.015);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(4000, this.ctx.currentTime);

        osc.connect(filter);
        filter.connect(crackleGain);
        crackleGain.connect(this.gainNode);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.02);
      }, 120);
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.ctx && this.gainNode) {
      // Smoothly ramp transitions to prevent clicks
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(Math.max(volume * 0.4, 0.0001), this.ctx.currentTime + 0.1);
    }
  }

  public stop() {
    // Clear crackles
    if (this.crackleInterval) {
      clearInterval(this.crackleInterval);
      this.crackleInterval = null;
    }

    // Stop active buffer nodes smoothly
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
      } catch (e) {}
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }

    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
      } catch (e) {}
      this.lfoNode.disconnect();
      this.lfoNode = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    this.activeTheme = 'NONE';
  }

  // Synthesize custom dual haptic buzzes using actual linear vibrating wave (beeper sound in speaker)
  // as sensory feedback since browser can't trigger native motor directly
  public synthesizeHapticChime() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime); // low satisfying hum

      // Double-pulse haptic rhythm
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      // Pulse 2
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.25, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch (e) {}
  }
}
