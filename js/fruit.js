/**
 * 水果类 和 半水果碎片类
 */
class Fruit {
    constructor(typeDef, x, y, vx, vy, scale = 1) {
        this.type = typeDef;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = typeDef.radius * scale;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 6;
        this.scale = scale;
        this.sliced = false;
        this.missed = false;
        this.alive = true;
    }

    update(dt) {
        if (!this.alive) return;
        this.vy += CONFIG.GRAVITY * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
    }

    draw(ctx) {
        if (!this.alive) return;
        const r = this.radius;
        const x = this.x;
        const y = this.y;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);

        switch (this.type.name) {
            case 'watermelon': this._drawWatermelon(ctx, r); break;
            case 'apple': this._drawApple(ctx, r); break;
            case 'banana': this._drawBanana(ctx, r); break;
            case 'orange': this._drawOrange(ctx, r); break;
            default: this._drawGeneric(ctx, r);
        }

        ctx.restore();
    }

    _drawWatermelon(ctx, r) {
        // 外皮
        const outerGrad = ctx.createRadialGradient(-r * 0.15, -r * 0.15, r * 0.1, 0, 0, r);
        outerGrad.addColorStop(0, '#66BB6A');
        outerGrad.addColorStop(0.85, this.type.outerColor);
        outerGrad.addColorStop(1, '#1B5E20');
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // 条纹
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = r * 0.12;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * r * 0.4, Math.sin(angle) * r * 0.4);
            const endAngle = angle + Math.PI * 0.4;
            ctx.quadraticCurveTo(
                Math.cos(angle + Math.PI * 0.2) * r * 0.7,
                Math.sin(angle + Math.PI * 0.2) * r * 0.7,
                Math.cos(endAngle) * r * 0.95,
                Math.sin(endAngle) * r * 0.95
            );
            ctx.stroke();
        }

        // 高光
        const hlGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 0, -r * 0.2, -r * 0.2, r * 0.5);
        hlGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
        hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hlGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawApple(ctx, r) {
        // 主体
        const bodyGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.05, 0, 0, r);
        bodyGrad.addColorStop(0, '#FF5252');
        bodyGrad.addColorStop(0.7, this.type.outerColor);
        bodyGrad.addColorStop(1, '#8E0000');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // 茎
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = Math.max(2, r * 0.07);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.9);
        ctx.quadraticCurveTo(r * 0.15, -r * 1.2, r * 0.2, -r * 1.3);
        ctx.stroke();

        // 叶子
        ctx.fillStyle = this.type.leafColor;
        ctx.beginPath();
        ctx.ellipse(r * 0.25, -r * 1.15, r * 0.25, r * 0.1, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        const hlGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 0, -r * 0.1, -r * 0.1, r * 0.4);
        hlGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
        hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hlGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawBanana(ctx, r) {
        // 香蕉是弯曲的椭圆
        const rx = r * 1.4;
        const ry = r * 0.7;

        // 主体
        ctx.fillStyle = this.type.midColor;
        ctx.beginPath();
        // 绘制弯曲的形状 (使用贝塞尔曲线)
        ctx.moveTo(-rx * 0.7, ry * 0.3);
        ctx.bezierCurveTo(-rx * 0.5, -ry * 0.9, rx * 0.5, -ry * 0.6, rx * 0.8, ry * 0.1);
        ctx.bezierCurveTo(rx * 0.7, ry * 0.5, 0, ry * 0.9, -rx * 0.7, ry * 0.3);
        ctx.fill();

        // 描边
        ctx.strokeStyle = this.type.outerColor;
        ctx.lineWidth = Math.max(1.5, r * 0.06);
        ctx.stroke();

        // 两端棕色点
        ctx.fillStyle = this.type.tipColor;
        ctx.beginPath();
        ctx.arc(-rx * 0.65, ry * 0.35, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rx * 0.75, ry * 0.15, r * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = r * 0.15;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-rx * 0.5, -ry * 0.3);
        ctx.quadraticCurveTo(0, -ry * 0.6, rx * 0.4, -ry * 0.1);
        ctx.stroke();
    }

    _drawOrange(ctx, r) {
        // 主体
        const bodyGrad = ctx.createRadialGradient(-r * 0.15, -r * 0.2, r * 0.05, 0, 0, r);
        bodyGrad.addColorStop(0, '#FFB74D');
        bodyGrad.addColorStop(0.6, this.type.midColor);
        bodyGrad.addColorStop(1, this.type.outerColor);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // 纹理小点
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + this.rotation * 0.3;
            const dist = r * (0.4 + Math.random() * 0.03);
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, r * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }

        // 顶部小凹
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(0, -r * 0.85, r * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        const hlGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, -r * 0.1, -r * 0.1, r * 0.35);
        hlGrad.addColorStop(0, 'rgba(255,255,255,0.3)');
        hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hlGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawGeneric(ctx, r) {
        const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
        grad.addColorStop(0, this.type.midColor);
        grad.addColorStop(1, this.type.outerColor);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 获取切片角度（由刀刃方向决定）
     */
    getSliceAngle(bladeSegments) {
        if (bladeSegments.length === 0) return 0;
        // 使用最近的线段方向
        let closestDist = Infinity;
        let closestAngle = 0;
        for (const seg of bladeSegments) {
            const dist = Blade.distToSegment(this.x, this.y, seg.x1, seg.y1, seg.x2, seg.y2);
            if (dist < closestDist) {
                closestDist = dist;
                closestAngle = Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1);
            }
        }
        return closestAngle;
    }
}

/**
 * 被切开的水果碎片
 */
class HalfFruit {
    constructor(fruit, side, sliceAngle) {
        this.x = fruit.x;
        this.y = fruit.y;
        this.type = fruit.type;
        this.radius = fruit.radius;
        this.rotation = fruit.rotation;
        this.sliceAngle = sliceAngle;
        this.side = side; // 'left' or 'right'

        // 两半朝相反方向飞出
        const perpAngle = sliceAngle + Math.PI / 2;
        const direction = side === 'left' ? -1 : 1;
        const speed = 150 + Math.random() * 200;
        this.vx = fruit.vx * 0.5 + Math.cos(perpAngle) * direction * speed;
        this.vy = fruit.vy * 0.5 + Math.sin(perpAngle) * direction * speed - 100;

        this.rotationSpeed = fruit.rotationSpeed + direction * (3 + Math.random() * 5);
        this.alive = true;
    }

    update(dt) {
        this.vy += CONFIG.GRAVITY * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
    }

    draw(ctx) {
        const r = this.radius;
        const x = this.x;
        const y = this.y;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.sliceAngle);

        // 裁剪区域：只画一半
        ctx.beginPath();
        if (this.side === 'left') {
            // 左半：从 PI/2 到 3*PI/2（即左半圆）
            ctx.arc(0, 0, r * 1.05, Math.PI / 2, Math.PI * 1.5);
        } else {
            // 右半：从 -PI/2 到 PI/2（即右半圆）
            ctx.arc(0, 0, r * 1.05, -Math.PI / 2, Math.PI / 2);
        }
        ctx.closePath();
        ctx.clip();

        // 绘制完整水果（被裁剪后只显示一半）
        ctx.rotate(-this.sliceAngle + this.rotation);
        switch (this.type.name) {
            case 'watermelon': this._drawWatermelonCut(ctx, r); break;
            case 'apple': this._drawAppleCut(ctx, r); break;
            case 'banana': this._drawBananaCut(ctx, r); break;
            case 'orange': this._drawOrangeCut(ctx, r); break;
            default: this._drawGenericCut(ctx, r);
        }

        ctx.restore();
    }

    // === 切面绘制（包含果肉色内层） ===

    _drawWatermelonCut(ctx, r) {
        const outerGrad = ctx.createRadialGradient(-r * 0.15, -r * 0.15, r * 0.1, 0, 0, r);
        outerGrad.addColorStop(0, '#66BB6A');
        outerGrad.addColorStop(0.7, this.type.outerColor);
        outerGrad.addColorStop(0.85, this.type.innerColor);
        outerGrad.addColorStop(1, '#1B5E20');
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // 种子
        ctx.fillStyle = this.type.seedColor;
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            const d = r * 0.45;
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, r * 0.06, r * 0.1, a, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawAppleCut(ctx, r) {
        const bodyGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.05, 0, 0, r);
        bodyGrad.addColorStop(0, '#FF5252');
        bodyGrad.addColorStop(0.5, this.type.outerColor);
        bodyGrad.addColorStop(0.7, this.type.innerColor);
        bodyGrad.addColorStop(1, '#8E0000');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawBananaCut(ctx, r) {
        ctx.fillStyle = this.type.innerColor;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.type.midColor;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawOrangeCut(ctx, r) {
        const bodyGrad = ctx.createRadialGradient(-r * 0.15, -r * 0.2, r * 0.05, 0, 0, r);
        bodyGrad.addColorStop(0, '#FFB74D');
        bodyGrad.addColorStop(0.4, this.type.innerColor);
        bodyGrad.addColorStop(0.7, this.type.midColor);
        bodyGrad.addColorStop(1, this.type.outerColor);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawGenericCut(ctx, r) {
        const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
        grad.addColorStop(0, this.type.innerColor);
        grad.addColorStop(1, this.type.outerColor);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }
}
