/**
 * 炸弹类
 */
class Bomb {
    constructor(x, y, vx, vy, scale = 1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = CONFIG.BOMB_RADIUS * scale;
        this.scale = scale;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 4;
        this.alive = true;
        this.exploded = false;
        this.fuseSparkTimer = 0;
    }

    update(dt) {
        if (!this.alive) return;
        this.vy += CONFIG.GRAVITY * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        this.fuseSparkTimer += dt;
    }

    draw(ctx) {
        if (!this.alive) return;
        const r = this.radius;
        const x = this.x;
        const y = this.y;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);

        // 炸弹主体球
        const bodyGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.1, 0, 0, r);
        bodyGrad.addColorStop(0, '#424242');
        bodyGrad.addColorStop(0.6, '#212121');
        bodyGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // 金属环
        ctx.strokeStyle = '#757575';
        ctx.lineWidth = Math.max(2, r * 0.08);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#9E9E9E';
        ctx.lineWidth = Math.max(1, r * 0.04);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
        ctx.stroke();

        // 导火线底座
        ctx.fillStyle = '#616161';
        ctx.beginPath();
        ctx.arc(0, -r * 0.85, r * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // 导火线
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = Math.max(2, r * 0.08);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.85);
        ctx.quadraticCurveTo(r * 0.2, -r * 1.2, r * 0.15, -r * 1.35);
        ctx.stroke();

        // 火花闪烁
        if (Math.sin(this.fuseSparkTimer * 20) > 0) {
            const sparkGrad = ctx.createRadialGradient(r * 0.15, -r * 1.35, 0, r * 0.15, -r * 1.35, r * 0.2);
            sparkGrad.addColorStop(0, '#FFFFFF');
            sparkGrad.addColorStop(0.3, '#FFEB3B');
            sparkGrad.addColorStop(0.7, '#FF5722');
            sparkGrad.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = sparkGrad;
            ctx.beginPath();
            ctx.arc(r * 0.15, -r * 1.35, r * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }

        // 危险标记 X
        ctx.strokeStyle = 'rgba(255,0,0,0.6)';
        ctx.lineWidth = Math.max(2, r * 0.1);
        ctx.lineCap = 'round';
        const markSize = r * 0.4;
        ctx.beginPath();
        ctx.moveTo(-markSize, -markSize);
        ctx.lineTo(markSize, markSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(markSize, -markSize);
        ctx.lineTo(-markSize, markSize);
        ctx.stroke();

        ctx.restore();
    }
}
