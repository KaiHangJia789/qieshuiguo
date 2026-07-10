/**
 * 刀光轨迹管理器
 */
class Blade {
    constructor() {
        this.points = [];           // {x, y, time}
        this.active = false;        // 是否正在滑动
        this.lastX = 0;
        this.lastY = 0;
        this.velocity = 0;          // 当前滑动速度
        this.skin = CONFIG.BLADE_SKINS[0];
    }

    setSkin(skinName) {
        const skin = CONFIG.BLADE_SKINS.find(s => s.name === skinName);
        if (skin) this.skin = skin;
    }

    start(x, y) {
        this.active = true;
        this.points = [{ x, y, time: performance.now() / 1000 }];
        this.lastX = x;
        this.lastY = y;
        this.velocity = 0;
    }

    move(x, y) {
        if (!this.active) return;
        const now = performance.now() / 1000;
        const dx = x - this.lastX;
        const dy = y - this.lastY;
        const dist = Math.hypot(dx, dy);
        const dt = now - (this.points.length > 0 ? this.points[this.points.length - 1].time : now);

        // 计算速度
        if (dt > 0.001) {
            this.velocity = dist / dt;
        }

        // 降低采样距离阈值，慢速滑动也能产生轨迹
        if (dist > 2 || this.points.length === 0) {
            this.points.push({ x, y, time: now });
        }

        this.lastX = x;
        this.lastY = y;

        // 限制轨迹点数量
        while (this.points.length > CONFIG.BLADE_TRAIL_MAX) {
            this.points.shift();
        }
    }

    end() {
        this.active = false;
    }

    update(dt) {
        const now = performance.now() / 1000;
        // 移除过期轨迹点
        this.points = this.points.filter(
            p => now - p.time < CONFIG.BLADE_TRAIL_LIFETIME
        );
        // 如果没有活跃且轨迹为空，降低速度
        if (!this.active && this.points.length === 0) {
            this.velocity = 0;
        }
    }

    draw(ctx, scale = 1) {
        if (this.points.length < 2) return;

        const now = performance.now() / 1000;

        // 绘制光晕（外层）
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 外层大光晕
        for (let i = 1; i < this.points.length; i++) {
            const p0 = this.points[i - 1];
            const p1 = this.points[i];
            const age = (now - p1.time) / CONFIG.BLADE_TRAIL_LIFETIME;
            if (age >= 1) continue;

            const alpha = (1 - age) * 0.3;
            const width = (1 - age) * 12 * scale;

            ctx.strokeStyle = this.skin.glow;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = width + 6;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
        }

        // 内层亮线
        for (let i = 1; i < this.points.length; i++) {
            const p0 = this.points[i - 1];
            const p1 = this.points[i];
            const age = (now - p1.time) / CONFIG.BLADE_TRAIL_LIFETIME;
            if (age >= 1) continue;

            const alpha = (1 - age) * 0.9;
            const width = (1 - age) * 4 * scale;

            ctx.strokeStyle = this.skin.trail;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
        }

        // 最内层白线
        for (let i = 1; i < this.points.length; i++) {
            const p0 = this.points[i - 1];
            const p1 = this.points[i];
            const age = (now - p1.time) / CONFIG.BLADE_TRAIL_LIFETIME;
            if (age >= 1) continue;

            const alpha = (1 - age) * 0.8;
            const width = (1 - age) * 1.5 * scale;

            ctx.strokeStyle = '#FFFFFF';
            ctx.globalAlpha = alpha;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * 获取轨迹线段列表，用于碰撞检测
     */
    getSegments() {
        const segments = [];
        for (let i = 1; i < this.points.length; i++) {
            segments.push({
                x1: this.points[i - 1].x,
                y1: this.points[i - 1].y,
                x2: this.points[i].x,
                y2: this.points[i].y
            });
        }
        return segments;
    }

    /**
     * 点 p(px,py) 到线段 (x1,y1)-(x2,y2) 的距离
     */
    static distToSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const nearX = x1 + t * dx;
        const nearY = y1 + t * dy;
        return Math.hypot(px - nearX, py - nearY);
    }
}
