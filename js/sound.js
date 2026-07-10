/**
 * 音效管理器 (Web Audio API 程序化生成)
 */
class SoundManager {
    constructor() {
        this.enabled = true;
        this.musicEnabled = true;
        this.volume = 0.7;
        this.ctx = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API 不可用');
        }
    }

    _getGain(vol = 1) {
        if (!this.ctx) return null;
        const gain = this.ctx.createGain();
        gain.gain.value = this.volume * vol * (this.enabled ? 1 : 0);
        gain.connect(this.ctx.destination);
        return gain;
    }

    _ensureInit() {
        if (!this.initialized) this.init();
    }

    _playTone(freq, duration, type = 'sine', vol = 0.3) {
        this._ensureInit();
        if (!this.ctx || !this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this._getGain(vol);
        if (!gain) return;
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    _playNoise(duration, vol = 0.2) {
        this._ensureInit();
        if (!this.ctx || !this.enabled) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this._getGain(vol);
        if (!gain) return;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        source.connect(filter);
        filter.connect(gain);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        source.start(this.ctx.currentTime);
        source.stop(this.ctx.currentTime + duration);
    }

    // === 游戏音效 ===

    slice() {
        this._playNoise(0.08, 0.15);
        this._playTone(800, 0.06, 'sine', 0.1);
    }

    combo(level) {
        const baseFreq = 600 + level * 150;
        this._playTone(baseFreq, 0.1, 'sine', 0.2);
        setTimeout(() => {
            this._playTone(baseFreq * 1.25, 0.1, 'sine', 0.2);
        }, 50);
        if (level >= 5) {
            setTimeout(() => {
                this._playTone(baseFreq * 1.5, 0.15, 'sine', 0.25);
            }, 100);
        }
    }

    bombExplode() {
        this._playTone(60, 0.5, 'sawtooth', 0.5);
        this._playTone(40, 0.6, 'triangle', 0.4);
        this._playNoise(0.3, 0.3);
    }

    miss() {
        this._playTone(200, 0.3, 'sine', 0.15);
        setTimeout(() => this._playTone(150, 0.3, 'sine', 0.12), 100);
    }

    gameOver() {
        this._playTone(400, 0.2, 'sine', 0.2);
        setTimeout(() => this._playTone(300, 0.2, 'sine', 0.2), 150);
        setTimeout(() => this._playTone(200, 0.3, 'sine', 0.2), 300);
        setTimeout(() => this._playTone(100, 0.5, 'sine', 0.25), 450);
    }

    buttonClick() {
        this._playTone(500, 0.05, 'sine', 0.1);
    }

    newHighScore() {
        [523, 659, 784, 1047].forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 0.2, 'sine', 0.2), i * 100);
        });
    }

    countdown() {
        this._playTone(880, 0.15, 'square', 0.08);
    }
}
