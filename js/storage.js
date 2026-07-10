/**
 * 本地存储管理器
 */
class StorageManager {
    constructor() {
        this.prefix = 'fruitninja_';
    }

    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            return value !== null ? JSON.parse(value) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
        } catch (e) { /* ignore */ }
    }

    // === 最高分 ===
    getHighScore(mode = 'classic') {
        return this.get(`highscore_${mode}`, 0);
    }

    setHighScore(mode, score) {
        const current = this.getHighScore(mode);
        if (score > current) {
            this.set(`highscore_${mode}`, score);
            return true;
        }
        return false;
    }

    // === 设置 ===
    getSettings() {
        return this.get('settings', {
            soundEnabled: true,
            musicEnabled: true,
            volume: 0.7,
            bladeSkin: 'default',
            quality: 'high'
        });
    }

    setSettings(settings) {
        this.set('settings', settings);
    }

    // === 排行榜 ===
    getLeaderboard(mode = 'classic') {
        return this.get(`leaderboard_${mode}`, []);
    }

    addToLeaderboard(mode, entry) {
        const board = this.getLeaderboard(mode);
        board.push({ ...entry, date: Date.now() });
        board.sort((a, b) => b.score - a.score);
        const trimmed = board.slice(0, 20); // 保留前20名
        this.set(`leaderboard_${mode}`, trimmed);
        return trimmed;
    }

    // === 解锁 ===
    getUnlockedLevels() {
        return this.get('unlocked_levels', 1);
    }

    setUnlockedLevels(level) {
        const current = this.getUnlockedLevels();
        if (level > current) {
            this.set('unlocked_levels', level);
        }
    }
}
