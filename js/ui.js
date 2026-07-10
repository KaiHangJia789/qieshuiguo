/**
 * UI管理器 —— 菜单、HUD、结算页面
 */
class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.cacheDOM();
    }

    cacheDOM() {
        this.elements = {
            menuScreen: document.getElementById('menuScreen'),
            hud: document.getElementById('hud'),
            pauseScreen: document.getElementById('pauseScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            settingsScreen: document.getElementById('settingsScreen'),
            tutorialScreen: document.getElementById('tutorialScreen'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            bestDisplay: document.getElementById('bestDisplay'),
            livesDisplay: document.getElementById('livesDisplay'),
            comboDisplay: document.getElementById('comboDisplay'),
            timerDisplay: document.getElementById('timerDisplay'),
            finalScore: document.getElementById('finalScore'),
            finalBest: document.getElementById('finalBest'),
            finalTime: document.getElementById('finalTime'),
            finalCombo: document.getElementById('finalCombo'),
            finalNewBest: document.getElementById('finalNewBest'),
            levelTarget: document.getElementById('levelTarget'),
            levelProgress: document.getElementById('levelProgress'),
            modeLabel: document.getElementById('modeLabel')
        };
    }

    // === 画面切换 ===

    showScreen(screenId) {
        const screens = ['menuScreen', 'hud', 'pauseScreen', 'gameOverScreen', 'settingsScreen', 'tutorialScreen'];
        screens.forEach(id => {
            const el = this.elements[id];
            if (el) el.classList.add('hidden');
        });
        const target = this.elements[screenId];
        if (target) target.classList.remove('hidden');
    }

    showMenu() {
        this.showScreen('menuScreen');
    }

    showHUD() {
        this.showScreen('hud');
        this.updateHUD();
    }

    showPause() {
        this.showScreen('pauseScreen');
    }

    showGameOver() {
        this.showScreen('gameOverScreen');
    }

    showSettings() {
        this.showScreen('settingsScreen');
    }

    showTutorial() {
        this.showScreen('tutorialScreen');
    }

    // === HUD 更新 ===

    updateHUD() {
        const g = this.game;
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = g.score;
        }
        if (this.elements.bestDisplay) {
            this.elements.bestDisplay.textContent = g.highScore;
        }
        if (this.elements.livesDisplay) {
            this._drawHearts(g.lives);
        }
        if (this.elements.comboDisplay) {
            if (g.combo >= 3) {
                this.elements.comboDisplay.textContent = `🔥 ${g.combo} 连击! x${(1 + (g.combo - 1) * CONFIG.COMBO_BONUS_MULTIPLIER).toFixed(1)}`;
                this.elements.comboDisplay.classList.add('active');
                this.elements.comboDisplay.classList.remove('fade-out');
            } else if (g.combo > 0) {
                this.elements.comboDisplay.textContent = `${g.combo} 连击`;
                this.elements.comboDisplay.classList.remove('active');
            } else {
                this.elements.comboDisplay.textContent = '';
                this.elements.comboDisplay.classList.remove('active');
            }
        }
        if (this.elements.timerDisplay && g.mode === 'timed') {
            const remaining = Math.max(0, CONFIG.TIMED_MODE_DURATION - g.gameTime);
            this.elements.timerDisplay.textContent = `${Math.ceil(remaining)}s`;
            this.elements.timerDisplay.classList.remove('hidden');
        }
        if (this.elements.modeLabel) {
            const modeNames = { classic: '经典无尽', timed: '限时挑战', levels: '闯关模式', casual: '休闲模式' };
            this.elements.modeLabel.textContent = modeNames[g.mode] || '经典无尽';
        }
        if (g.mode === 'levels') {
            if (this.elements.levelTarget) {
                this.elements.levelTarget.textContent = `关卡 ${g.currentLevel}  目标: ${g.levelTarget} 分`;
                this.elements.levelTarget.classList.remove('hidden');
            }
            if (this.elements.levelProgress) {
                const progress = Math.min(100, (g.score / g.levelTarget) * 100);
                this.elements.levelProgress.style.width = progress + '%';
                const bar = document.getElementById('levelProgressBar');
                if (bar) bar.classList.remove('hidden');
            }
        } else {
            const bar = document.getElementById('levelProgressBar');
            if (bar) bar.classList.add('hidden');
        }
    }

    _drawHearts(lives) {
        const container = this.elements.livesDisplay;
        if (!container) return;
        let html = '';
        for (let i = 0; i < CONFIG.MAX_LIVES; i++) {
            html += i < lives
                ? '<span class="heart filled">❤️</span>'
                : '<span class="heart empty">🖤</span>';
        }
        container.innerHTML = html;
    }

    // === 结算页 ===

    showGameOverStats(score, highScore, isNewBest, gameTime, maxCombo) {
        if (this.elements.finalScore) this.elements.finalScore.textContent = score;
        if (this.elements.finalBest) this.elements.finalBest.textContent = highScore;
        if (this.elements.finalTime) {
            const mins = Math.floor(gameTime / 60);
            const secs = Math.floor(gameTime % 60);
            this.elements.finalTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        if (this.elements.finalCombo) this.elements.finalCombo.textContent = maxCombo;
        if (this.elements.finalNewBest) {
            this.elements.finalNewBest.classList.toggle('hidden', !isNewBest);
        }
    }

    // === 教程 ===

    updateTutorialStep(step) {
        const steps = document.querySelectorAll('.tutorial-step');
        steps.forEach(s => s.classList.add('hidden'));
        const current = document.querySelector(`.tutorial-step[data-step="${step}"]`);
        if (current) current.classList.remove('hidden');

        // 更新圆点
        const dots = document.querySelectorAll('.tutorial-dots span');
        dots.forEach((dot, i) => {
            dot.textContent = (i + 1) === step ? '●' : '○';
            dot.style.color = (i + 1) === step ? '#FFD54F' : 'rgba(255,255,255,0.3)';
        });
    }
}
