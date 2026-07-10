/**
 * 切水果游戏 —— 主控制器
 */
class Game {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scale = 1;
        this.width = 0;
        this.height = 0;

        // 游戏对象
        this.fruits = [];
        this.halfFruits = [];
        this.bombs = [];
        this.blade = new Blade();
        this.particles = new ParticleSystem();

        // 管理器
        this.sound = new SoundManager();
        this.storage = new StorageManager();
        this.ui = new UIManager(this);

        // 游戏状态
        this.state = 'menu';        // menu | playing | paused | gameover
        this.mode = 'classic';      // classic | timed | levels | casual
        this.score = 0;
        this.highScore = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = 0;
        this.gameTime = 0;
        this.difficulty = 1;
        this.spawnTimer = 0;
        this.fruitsSliced = 0;
        this.fruitsMissed = 0;

        // 闯关模式
        this.currentLevel = 1;
        this.levelTarget = CONFIG.LEVEL_TARGETS[0] || 30;

        // 时间
        this.lastTime = 0;
        this.deltaTime = 0;

        // 屏幕震动
        this.screenShake = 0;
        this.shakeX = 0;
        this.shakeY = 0;

        // 输入
        this.isMouseDown = false;

        // 设置
        this.settings = this.storage.getSettings();

        this.init();
    }

    // ==================== 初始化 ====================

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.setupInput();
        this.applySettings();
        this.loadHighScore();
        this.ui.showMenu();
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        // 尺寸缩放（按宽度比，确保水果大小合适）
        this.scale = Math.min(this.width / 800, this.height / 600);
        // 速度缩放（按高度比，确保水果能飞到中上部）
        this.velScale = this.height / 600;
    }

    applySettings() {
        this.sound.enabled = this.settings.soundEnabled;
        this.sound.musicEnabled = this.settings.musicEnabled;
        this.sound.volume = this.settings.volume;
        this.blade.setSkin(this.settings.bladeSkin || 'default');
    }

    loadHighScore() {
        this.highScore = this.storage.getHighScore(this.mode);
    }

    // ==================== 输入处理 ====================

    setupInput() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e.clientX, e.clientY));
        this.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e.clientX, e.clientY));
        this.canvas.addEventListener('mouseup', () => this.onPointerUp());
        this.canvas.addEventListener('mouseleave', () => this.onPointerUp());

        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            this.onPointerDown(t.clientX, t.clientY);
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            this.onPointerMove(t.clientX, t.clientY);
        }, { passive: false });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onPointerUp();
        }, { passive: false });
        this.canvas.addEventListener('touchcancel', () => this.onPointerUp());

        // 键盘
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'p') {
                if (this.state === 'playing') this.pause();
                else if (this.state === 'paused') this.resume();
            }
        });
    }

    onPointerDown(x, y) {
        this.sound.init();
        this.isMouseDown = true;
        this.blade.start(x, y);

        if (this.state === 'menu') {
            // 点击任意位置开始
            this.startGame();
        } else if (this.state === 'gameover') {
            // 延迟一下避免误触
            setTimeout(() => {
                if (this.state === 'gameover') {
                    this.ui.showMenu();
                    this.state = 'menu';
                }
            }, 500);
        }
    }

    onPointerMove(x, y) {
        if (!this.isMouseDown) return;
        this.blade.move(x, y);
    }

    onPointerUp() {
        this.isMouseDown = false;
        this.blade.end();
    }

    // ==================== 游戏控制 ====================

    startGame() {
        this.resetGameState();
        this.state = 'playing';
        this.ui.showHUD();
        this.spawnTimer = 0.5; // 初始延迟0.5秒，快速看到水果
    }

    resetGameState() {
        this.fruits = [];
        this.halfFruits = [];
        this.bombs = [];
        this.particles.clear();
        this.score = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = 0;
        this.gameTime = 0;
        this.difficulty = 1;
        this.spawnTimer = 0;
        this.fruitsSliced = 0;
        this.fruitsMissed = 0;
        this.screenShake = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.currentLevel = 1;
        this.levelTarget = CONFIG.LEVEL_TARGETS[0] || 30;
        this.loadHighScore();
    }

    pause() {
        if (this.state !== 'playing') return;
        this.state = 'paused';
        this.ui.showPause();
    }

    resume() {
        if (this.state !== 'paused') return;
        this.state = 'playing';
        this.lastTime = performance.now();
        this.ui.showHUD();
    }

    gameOver() {
        this.state = 'gameover';
        this.blade.end();
        this.sound.gameOver();

        const isNewBest = this.storage.setHighScore(this.mode, this.score);
        if (isNewBest) {
            this.sound.newHighScore();
            this.highScore = this.score;
        }
        this.storage.addToLeaderboard(this.mode, {
            score: this.score,
            time: this.gameTime,
            combo: this.maxCombo,
            level: this.currentLevel
        });

        // 闯关模式：检查是否过关
        if (this.mode === 'levels' && this.score >= this.levelTarget) {
            this.currentLevel++;
            this.storage.setUnlockedLevels(this.currentLevel);
            if (this.currentLevel <= CONFIG.LEVEL_TARGETS.length) {
                this.levelTarget = CONFIG.LEVEL_TARGETS[this.currentLevel - 1];
            }
        }

        this.ui.showGameOverStats(this.score, this.highScore, isNewBest, this.gameTime, this.maxCombo);
        this.ui.showGameOver();
    }

    // ==================== 游戏循环 ====================

    gameLoop(timestamp) {
        requestAnimationFrame((t) => this.gameLoop(t));

        this.deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;
        const dt = this.deltaTime;

        if (this.state === 'playing') {
            this.update(dt);
        }

        // 处理屏幕震动衰减
        if (this.screenShake > 0) {
            this.screenShake *= Math.pow(0.05, dt);
            if (this.screenShake < 0.1) this.screenShake = 0;
            this.shakeX = (Math.random() - 0.5) * this.screenShake * 2;
            this.shakeY = (Math.random() - 0.5) * this.screenShake * 2;
        }

        // 刀刃轨迹始终更新（用于动画）
        this.blade.update(dt);
        this.particles.update(dt);

        this.render();
    }

    update(dt) {
        this.gameTime += dt;

        // 难度递增
        this.difficulty = Math.min(CONFIG.MAX_DIFFICULTY,
            1 + this.gameTime * CONFIG.DIFFICULTY_INCREASE_RATE);

        // 限时模式检查
        if (this.mode === 'timed' && this.gameTime >= CONFIG.TIMED_MODE_DURATION) {
            this.gameOver();
            return;
        }

        // 闯关模式：检查是否达标过关
        if (this.mode === 'levels' && this.score >= this.levelTarget) {
            this.currentLevel++;
            this.storage.setUnlockedLevels(this.currentLevel);
            this.levelTarget = CONFIG.LEVEL_TARGETS[Math.min(this.currentLevel - 1, CONFIG.LEVEL_TARGETS.length - 1)];
            // 播放过关特效
            this.particles.emit(this.width / 2, this.height / 2, 40, {
                colors: ['#FFD700', '#FFA000', '#FFEB3B', '#FFFFFF'],
                minSpeed: 100, maxSpeed: 400,
                upwardBias: 0, minLife: 0.5, maxLife: 1.5,
                minSize: 3, maxSize: 7
            });
        }

        // 生成水果
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnWave();
            this.spawnTimer = CONFIG.FRUIT_SPAWN_INTERVAL / this.difficulty;
        }

        // 更新水果
        this.fruits.forEach(f => f.update(dt));
        this.halfFruits.forEach(h => h.update(dt));
        this.bombs.forEach(b => b.update(dt));

        // 左右边界反弹
        this.applyBoundaryBounce();

        // 碰撞检测
        this.checkCollisions();

        // 检查漏掉的水果
        this.checkMissed();

        // 清理离屏对象
        this.cleanup();

        // 连击计时器
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        // 更新 HUD
        this.ui.updateHUD();
    }

    // ==================== 生成 ====================

    spawnWave() {
        const count = Math.min(
            1 + Math.floor(this.difficulty * 0.8),
            5
        );
        for (let i = 0; i < count; i++) {
            // 随机延迟
            setTimeout(() => {
                if (this.state === 'playing') {
                    this.spawnOne();
                }
            }, i * (100 + Math.random() * 200));
        }
    }

    spawnOne() {
        // 休闲模式无炸弹
        const includeBomb = this.mode !== 'casual' && Math.random() < CONFIG.BOMB_CHANCE;

        if (includeBomb) {
            this.spawnBomb();
        } else {
            this.spawnFruit();
        }
    }

    spawnFruit() {
        // 只计算存活的水果，死掉的（已切/已漏）不算
        const aliveCount = this.fruits.filter(f => f.alive).length;
        if (aliveCount >= CONFIG.MAX_FRUITS_ON_SCREEN) return;

        // 选择水果类型（加权随机）
        const types = CONFIG.FRUIT_TYPES;
        const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
        let rand = Math.random() * totalWeight;
        let typeDef = types[0];
        for (const t of types) {
            rand -= t.weight;
            if (rand <= 0) { typeDef = t; break; }
        }

        const x = this.width * (0.15 + Math.random() * 0.7);
        const y = this.height + typeDef.radius * this.scale * CONFIG.SIZE_BOOST + 20;
        const vx = (Math.random() - 0.5) * CONFIG.FRUIT_VX_RANGE * 2 * this.scale;
        // 开局50%速度，随难度缓慢提升
        const speedMult = 0.5 + (this.difficulty - 1) * 0.25;
        // 使用 velScale（高度比）确保水果能飞到屏幕中上部
        const vy = -(CONFIG.FRUIT_MIN_VY + Math.random() * (CONFIG.FRUIT_MAX_VY - CONFIG.FRUIT_MIN_VY))
            * this.velScale * speedMult;

        const fruit = new Fruit(typeDef, x, y, vx, vy, this.scale * CONFIG.SIZE_BOOST);
        this.fruits.push(fruit);
    }

    spawnBomb() {
        if (this.bombs.length >= 3) return;

        const x = this.width * (0.15 + Math.random() * 0.7);
        const y = this.height + CONFIG.BOMB_RADIUS * this.scale * CONFIG.SIZE_BOOST + 20;
        const vx = (Math.random() - 0.5) * CONFIG.FRUIT_VX_RANGE * 1.5 * this.scale;
        // 开局50%速度，随难度缓慢提升
        const speedMult = 0.5 + (this.difficulty - 1) * 0.25;
        // 使用 velScale（高度比）确保炸弹能飞到屏幕中上部
        const vy = -(CONFIG.FRUIT_MIN_VY + Math.random() * (CONFIG.FRUIT_MAX_VY - CONFIG.FRUIT_MIN_VY))
            * this.velScale * speedMult;

        const bomb = new Bomb(x, y, vx, vy, this.scale * CONFIG.SIZE_BOOST);
        this.bombs.push(bomb);
    }

    // ==================== 碰撞检测 ====================

    checkCollisions() {
        // 降低速度阈值，保证慢速滑动也能切割（从100降到30）
        if (this.blade.velocity < 30 * this.scale && this.blade.points.length < 3) return;
        const segments = this.blade.getSegments();
        if (segments.length === 0) return;

        // 检测水果
        for (const fruit of this.fruits) {
            if (fruit.sliced || !fruit.alive) continue;
            if (this._checkBladeHit(fruit, segments)) {
                this.sliceFruit(fruit, segments);
            }
        }

        // 检测炸弹
        for (const bomb of this.bombs) {
            if (bomb.exploded || !bomb.alive) continue;
            if (this._checkBladeHit(bomb, segments)) {
                this.explodeBomb(bomb);
            }
        }
    }

    _checkBladeHit(obj, segments) {
        // 快速 AABB 预检
        const r = obj.radius;
        for (const seg of segments) {
            const minX = Math.min(seg.x1, seg.x2) - r;
            const maxX = Math.max(seg.x1, seg.x2) + r;
            const minY = Math.min(seg.y1, seg.y2) - r;
            const maxY = Math.max(seg.y1, seg.y2) + r;
            if (obj.x >= minX && obj.x <= maxX && obj.y >= minY && obj.y <= maxY) {
                const dist = Blade.distToSegment(obj.x, obj.y, seg.x1, seg.y1, seg.x2, seg.y2);
                if (dist < r) return true;
            }
        }
        return false;
    }

    sliceFruit(fruit, segments) {
        fruit.sliced = true;
        fruit.alive = false;
        this.fruitsSliced++;

        // 获取切片角度
        const sliceAngle = fruit.getSliceAngle(segments);

        // 创建两半
        this.halfFruits.push(new HalfFruit(fruit, 'left', sliceAngle));
        this.halfFruits.push(new HalfFruit(fruit, 'right', sliceAngle));

        // 果汁粒子
        this.particles.emitJuice(fruit.x, fruit.y, fruit.type.name);

        // 连击
        this.comboTimer = CONFIG.COMBO_TIMEOUT;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        // 计分
        const multiplier = 1 + (this.combo - 1) * CONFIG.COMBO_BONUS_MULTIPLIER;
        const points = Math.round(fruit.type.score * multiplier);
        this.score += points;

        // 得分飘字
        let floatText = `+${points}`;
        let floatColor = '#FFFFFF';
        if (this.combo >= 3) {
            floatText = `+${points} x${this.combo}`;
            floatColor = this.combo >= 7 ? '#FFD700' : this.combo >= 5 ? '#FF9800' : '#FFEB3B';
        }
        this.particles.addScoreFloat(fruit.x, fruit.y, floatText, floatColor);

        // 音效
        if (this.combo >= 3) {
            this.sound.combo(Math.min(this.combo, 10));
        } else {
            this.sound.slice();
        }
    }

    explodeBomb(bomb) {
        bomb.exploded = true;
        bomb.alive = false;

        // 爆炸特效
        this.particles.emitExplosion(bomb.x, bomb.y);
        this.screenShake = 15 * this.scale;
        this.sound.bombExplode();

        // 直接游戏结束
        this.lives = 0;
        this.state = 'gameover';
        this.blade.end();
        setTimeout(() => this.gameOver(), 400);
    }

    // ==================== 漏掉检测 ====================

    checkMissed() {
        const margin = 60 * this.scale;
        for (const fruit of this.fruits) {
            if (fruit.sliced || fruit.missed || !fruit.alive) continue;
            if (fruit.y > this.height + fruit.radius + margin) {
                fruit.missed = true;
                fruit.alive = false;
                this.fruitsMissed++;

                // 休闲模式不掉血
                if (this.mode !== 'casual') {
                    this.lives--;
                    this.sound.miss();

                    // 红色闪烁提示
                    this.particles.addScoreFloat(
                        this.width / 2, this.height * 0.3,
                        '✗', '#FF5252'
                    );
                }

                if (this.lives <= 0) {
                    setTimeout(() => this.gameOver(), 200);
                }
            }
        }

        // 炸弹漏掉不惩罚（只移除）
        for (const bomb of this.bombs) {
            if (bomb.exploded || !bomb.alive) continue;
            if (bomb.y > this.height + bomb.radius + margin) {
                bomb.alive = false;
            }
        }
    }

    // ==================== 边界反弹 ====================

    applyBoundaryBounce() {
        const objs = [
            ...this.fruits.filter(f => f.alive),
            ...this.bombs.filter(b => b.alive)
        ];
        for (const obj of objs) {
            const r = obj.radius;
            // 左边界反弹
            if (obj.x - r < 0) {
                obj.x = r;
                obj.vx = Math.abs(obj.vx) * 0.7; // 反弹并减损
            }
            // 右边界反弹
            if (obj.x + r > this.width) {
                obj.x = this.width - r;
                obj.vx = -Math.abs(obj.vx) * 0.7;
            }
        }
    }

    // ==================== 清理 ====================

    cleanup() {
        // 清理死水果（已切/已漏），及时释放数组空间
        this.fruits = this.fruits.filter(f => f.alive);
        // 清理半水果碎片
        const margin = 150 * this.scale;
        this.halfFruits = this.halfFruits.filter(h =>
            h.y < this.height + margin &&
            h.y > -margin &&
            h.x > -margin &&
            h.x < this.width + margin
        );
        // 清理死炸弹
        this.bombs = this.bombs.filter(b => b.alive);
    }

    // ==================== 渲染 ====================

    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // 【关键】必须先清除画布，再绘制背景
        ctx.clearRect(0, 0, w, h);

        ctx.save();

        // 屏幕震动
        if (this.screenShake > 0) {
            ctx.translate(this.shakeX, this.shakeY);
        }

        // 背景（覆盖整个画布，包含震动偏移量）
        this._drawBackground(ctx);

        // 游戏对象
        this.halfFruits.forEach(f => f.draw(ctx));
        this.fruits.forEach(f => {
            if (f.alive) f.draw(ctx);
        });
        this.bombs.forEach(b => {
            if (b.alive) b.draw(ctx);
        });

        // 粒子
        this.particles.draw(ctx, this.scale);

        // 刀光
        this.blade.draw(ctx, this.scale);

        ctx.restore();

        // 调试：在画布上显示游戏状态
        if (this.state === 'playing' && this.fruits.length === 0 && this.bombs.length === 0 && this.gameTime > 1) {
            // 如果游戏在运行但没有任何水果，显示提示（可能是 bug）
            // 不显示任何内容，静默处理
        }
    }

    _drawBackground(ctx) {
        const w = this.width;
        const h = this.height;

        // 先画背景（覆盖整个画布，含震动偏移补偿）
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换确保背景全覆盖

        // 渐变天空
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#1A0A2E');
        skyGrad.addColorStop(0.3, '#16213E');
        skyGrad.addColorStop(0.6, '#0F3460');
        skyGrad.addColorStop(1, '#1A1A2E');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // 星星
        if (this._stars) {
            for (const star of this._stars) {
                const twinkle = 0.5 + 0.5 * Math.sin(star.phase + this.gameTime * 3);
                ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.7})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            this._generateStars(w, h);
        }

        // 底部光晕
        const bottomGlow = ctx.createRadialGradient(w / 2, h + 100, 0, w / 2, h, w * 0.8);
        bottomGlow.addColorStop(0, 'rgba(100, 50, 150, 0.15)');
        bottomGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bottomGlow;
        ctx.fillRect(0, h * 0.5, w, h * 0.5);

        ctx.restore();
    }

    _generateStars(w, h) {
        this._stars = [];
        for (let i = 0; i < 60; i++) {
            this._stars.push({
                x: Math.random() * w,
                y: Math.random() * h * 0.7,
                size: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    // ==================== 模式切换 ====================

    setMode(mode) {
        this.mode = mode;
        this.loadHighScore();
        this.resetGameState();
    }
}

// ==================== 启动 ====================

let game;

function setupPWA() {
    // 静态 manifest.json 已在 index.html 中引用

    // 注册 Service Worker（HTTPS 下触发 PWA 安装的关键）
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        navigator.serviceWorker.register('sw.js').then(function(reg) {
            console.log('SW registered:', reg.scope);
        }).catch(function(err) {
            console.log('SW failed:', err);
        });
    }

    // 如果是独立文件打开（非服务器），显示安装引导
    if (location.protocol === 'file:') {
        setTimeout(function() {
            var banner = document.createElement('div');
            banner.id = 'installBanner';
            banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:100;background:rgba(0,0,0,0.9);color:#FFD54F;padding:14px 16px;text-align:center;font-size:14px;font-family:"Microsoft YaHei","PingFang SC",sans-serif;animation:slideUp 0.4s ease;';
            banner.innerHTML = '📱 <b>添加到桌面</b>：浏览器菜单 → 「添加到主屏幕」<br><small style="color:#aaa;">之后就像 App 一样使用！</small>';
            var close = document.createElement('button');
            close.textContent = '✕';
            close.style.cssText = 'position:absolute;top:4px;right:8px;background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:4px 8px;';
            close.onclick = function() { banner.remove(); };
            banner.appendChild(close);
            document.body.appendChild(banner);
            var style = document.createElement('style');
            style.textContent = '@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}';
            document.head.appendChild(style);
        }, 1000);
    }
}

function initGame() {
    setupPWA();
    game = new Game();
    window.game = game;

    bindButtons();
}

function bindButtons() {
    // 开始按钮
    const btnStart = document.getElementById('btnStart');
    if (btnStart) btnStart.addEventListener('click', (e) => {
        e.stopPropagation();
        game.sound.init();
        game.sound.buttonClick();
        game.startGame();
    });

    // 模式选择
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            game.sound.init();
            game.sound.buttonClick();
            const mode = btn.dataset.mode;
            game.setMode(mode);
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 暂停
    const btnPause = document.getElementById('btnPause');
    if (btnPause) btnPause.addEventListener('click', (e) => {
        e.stopPropagation();
        game.pause();
    });

    // 继续
    const btnResume = document.getElementById('btnResume');
    if (btnResume) btnResume.addEventListener('click', () => game.resume());

    // 重新开始（暂停页）
    const btnRestartPause = document.getElementById('btnRestartPause');
    if (btnRestartPause) btnRestartPause.addEventListener('click', (e) => {
        e.stopPropagation();
        game.sound.buttonClick();
        game.startGame();
    });

    // 再来一局（结算页）
    const btnPlayAgain = document.getElementById('btnPlayAgain');
    if (btnPlayAgain) btnPlayAgain.addEventListener('click', (e) => {
        e.stopPropagation();
        game.sound.buttonClick();
        game.startGame();
    });

    // 返回菜单
    const btnMenu = document.getElementById('btnMenu');
    if (btnMenu) btnMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        game.sound.buttonClick();
        game.state = 'menu';
        game.ui.showMenu();
    });

    const btnMenu2 = document.getElementById('btnMenu2');
    if (btnMenu2) btnMenu2.addEventListener('click', (e) => {
        e.stopPropagation();
        game.sound.buttonClick();
        game.state = 'menu';
        game.ui.showMenu();
    });

    // 设置
    const btnSettings = document.getElementById('btnSettings');
    if (btnSettings) btnSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        game.sound.buttonClick();
        game.ui.showSettings();
    });

    const btnCloseSettings = document.getElementById('btnCloseSettings');
    if (btnCloseSettings) btnCloseSettings.addEventListener('click', () => {
        game.sound.buttonClick();
        game.ui.showMenu();
    });

    // 音效开关
    const btnSoundToggle = document.getElementById('btnSoundToggle');
    if (btnSoundToggle) btnSoundToggle.addEventListener('click', () => {
        game.settings.soundEnabled = !game.settings.soundEnabled;
        game.applySettings();
        game.storage.setSettings(game.settings);
        btnSoundToggle.textContent = game.settings.soundEnabled ? '🔊 音效：开' : '🔇 音效：关';
    });

    // 音量
    const volSlider = document.getElementById('volumeSlider');
    if (volSlider) volSlider.addEventListener('input', (e) => {
        game.settings.volume = parseFloat(e.target.value);
        game.applySettings();
        game.storage.setSettings(game.settings);
    });

    // 刀刃皮肤
    document.querySelectorAll('.skin-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const skin = opt.dataset.skin;
            game.settings.bladeSkin = skin;
            game.applySettings();
            game.storage.setSettings(game.settings);
            document.querySelectorAll('.skin-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        });
    });

    // 画质
    document.querySelectorAll('.quality-option').forEach(opt => {
        opt.addEventListener('click', () => {
            game.settings.quality = opt.dataset.quality;
            game.storage.setSettings(game.settings);
            document.querySelectorAll('.quality-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        });
    });

    // 重置最高分
    const btnResetScore = document.getElementById('btnResetScore');
    if (btnResetScore) btnResetScore.addEventListener('click', () => {
        if (confirm('确定要重置所有模式的最高分吗？')) {
            ['classic', 'timed', 'levels', 'casual'].forEach(m => {
                game.storage.remove(`highscore_${m}`);
                game.storage.remove(`leaderboard_${m}`);
            });
            game.storage.set('unlocked_levels', 1);
            game.loadHighScore();
            alert('最高分已重置！');
        }
    });

    // 教程
    const btnTutorial = document.getElementById('btnTutorial');
    if (btnTutorial) btnTutorial.addEventListener('click', (e) => {
        e.stopPropagation();
        game.sound.buttonClick();
        game.ui.showTutorial();
        game._tutorialStep = 1;
        game.ui.updateTutorialStep(1);
    });

    const btnCloseTutorial = document.getElementById('btnCloseTutorial');
    if (btnCloseTutorial) btnCloseTutorial.addEventListener('click', () => {
        game.sound.buttonClick();
        game.ui.showMenu();
    });

    // 教程区点击切换步骤
    const tutorialContent = document.querySelector('.tutorial-content');
    if (tutorialContent) {
        tutorialContent.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            game._tutorialStep = (game._tutorialStep || 1) + 1;
            if (game._tutorialStep > 5) game._tutorialStep = 1;
            game.ui.updateTutorialStep(game._tutorialStep);
        });
    }
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initGame);
