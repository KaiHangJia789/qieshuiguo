/**
 * 粒子与粒子系统
 */
class Particle {
    constructor(x, y, vx, vy, color, life, size = 4) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.gravity = CONFIG.GRAVITY * 0.5;
        this.friction = 0.98;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) {
            this.alive = false;
            return;
        }
        this.vy += this.gravity * dt;
        this.vx *= this.friction;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx, scale = 1) {
        const alpha = Math.max(0, this.life / this.maxLife);
        const size = this.size * scale * (0.5 + 0.5 * alpha);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ScoreFloat {
    constructor(x, y, text, color = '#FFFFFF') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = CONFIG.SCORE_FLOAT_DURATION;
        this.maxLife = this.life;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) {
            this.alive = false;
            return;
        }
        this.y -= 120 * dt; // 向上飘
    }

    draw(ctx, scale = 1) {
        const alpha = Math.max(0, this.life / this.maxLife);
        const progress = 1 - this.life / this.maxLife;
        const size = (22 + progress * 10) * scale;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 3;
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.scoreFloats = [];
    }

    emit(x, y, count, config) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (config.minSpeed || 100) + Math.random() * (config.maxSpeed || 300);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - (config.upwardBias || 0);
            const life = (config.minLife || 0.3) + Math.random() * (config.maxLife || 0.7);
            const size = (config.minSize || 2) + Math.random() * (config.maxSize || 4);
            const color = Array.isArray(config.colors)
                ? config.colors[Math.floor(Math.random() * config.colors.length)]
                : config.color || '#FFFFFF';
            this.particles.push(new Particle(x, y, vx, vy, color, life, size));
        }
    }

    emitJuice(x, y, fruitType) {
        const colors = this._getJuiceColors(fruitType);
        this.emit(x, y, CONFIG.JUICE_PARTICLE_COUNT, {
            colors: colors,
            minSpeed: 80,
            maxSpeed: 350,
            upwardBias: 150,
            minLife: 0.3,
            maxLife: 0.9,
            minSize: 2,
            maxSize: 5
        });
    }

    emitExplosion(x, y) {
        // 火光
        this.emit(x, y, CONFIG.EXPLOSION_PARTICLE_COUNT, {
            colors: ['#FF5722', '#FF9800', '#FFEB3B', '#FF0000', '#FF6D00'],
            minSpeed: 150,
            maxSpeed: 500,
            upwardBias: 0,
            minLife: 0.3,
            maxLife: 1.2,
            minSize: 3,
            maxSize: 8
        });
        // 烟雾
        this.emit(x, y, 15, {
            colors: ['#757575', '#9E9E9E', '#616161', '#BDBDBD'],
            minSpeed: 30,
            maxSpeed: 120,
            upwardBias: -200,
            minLife: 0.5,
            maxLife: 1.5,
            minSize: 4,
            maxSize: 10
        });
    }

    addScoreFloat(x, y, text, color = '#FFFFFF') {
        this.scoreFloats.push(new ScoreFloat(x, y, text, color));
    }

    _getJuiceColors(fruitType) {
        const colorMap = {
            watermelon: ['#FF5252', '#E53935', '#FF8A80', '#FFCDD2'],
            apple: ['#FFF9C4', '#FFEB3B', '#FFFF8D', '#FFFFFF'],
            banana: ['#FFFDE7', '#FFF9C4', '#FFEB3B', '#FFFFFF'],
            orange: ['#FFE0B2', '#FFCC80', '#FF9800', '#FFF3E0']
        };
        return colorMap[fruitType] || ['#FFFFFF', '#FFCDD2'];
    }

    update(dt) {
        this.particles.forEach(p => p.update(dt));
        this.scoreFloats.forEach(s => s.update(dt));
        this.particles = this.particles.filter(p => p.alive);
        this.scoreFloats = this.scoreFloats.filter(s => s.alive);
    }

    draw(ctx, scale = 1) {
        this.particles.forEach(p => p.draw(ctx, scale));
        this.scoreFloats.forEach(s => s.draw(ctx, scale));
    }

    clear() {
        this.particles = [];
        this.scoreFloats = [];
    }
}
