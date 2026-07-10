/**
 * 游戏配置常量
 */
const CONFIG = {
    // 基础物理
    GRAVITY: 700,                    // 重力加速度 (px/s²)
    FRUIT_SPAWN_INTERVAL: 1.8,       // 初始水果生成间隔 (秒)
    MIN_SPAWN_INTERVAL: 0.4,         // 最小生成间隔
    MAX_FRUITS_ON_SCREEN: 12,        // 屏幕最大水果数
    FRUIT_MIN_VY: 1000,              // 水果最小向上速度 (px/s) 手机也能飞到中部
    FRUIT_MAX_VY: 1500,              // 水果最大向上速度 (px/s)
    SIZE_BOOST: 2.0,                 // 手机端水果放大倍数
    FRUIT_VX_RANGE: 250,             // 水果水平速度范围 (±)

    // 炸弹
    BOMB_CHANCE: 0.12,               // 炸弹出现概率
    BOMB_RADIUS: 35,

    // 生命值
    INITIAL_LIVES: 3,
    MAX_LIVES: 5,

    // 连击
    COMBO_TIMEOUT: 1.2,              // 连击超时 (秒)
    COMBO_BONUS_MULTIPLIER: 0.5,     // 每个连击额外加成分数倍率

    // 难度
    DIFFICULTY_INCREASE_RATE: 0.04,  // 每秒难度增长率
    MAX_DIFFICULTY: 5,               // 最大难度倍率
    SPEED_INCREASE_RATE: 0.03,       // 速度增长率

    // 刀光
    BLADE_TRAIL_MAX: 25,             // 最大轨迹点
    BLADE_TRAIL_LIFETIME: 0.22,      // 轨迹点存活时间（延长以便慢速滑动也有足够轨迹）
    BLADE_MIN_VELOCITY: 30,          // 触发切割的最小速度（降低以便慢速也能切）

    // 特效
    JUICE_PARTICLE_COUNT: 12,        // 果汁粒子数量
    EXPLOSION_PARTICLE_COUNT: 30,    // 爆炸粒子数量
    SCORE_FLOAT_DURATION: 1.0,       // 得分飘字持续时长

    // 限时模式
    TIMED_MODE_DURATION: 60,         // 限时模式时长 (秒)

    // 闯关模式
    LEVEL_TARGETS: [30, 60, 100, 150, 210, 280, 360, 450, 550, 660],

    // 水果类型定义
    FRUIT_TYPES: [
        {
            name: 'watermelon',
            label: '西瓜',
            outerColor: '#2E7D32',
            midColor: '#4CAF50',
            innerColor: '#FF5252',
            seedColor: '#1B1B1B',
            radius: 42,
            score: 3,
            weight: 1
        },
        {
            name: 'apple',
            label: '苹果',
            outerColor: '#C62828',
            midColor: '#E53935',
            innerColor: '#FFF9C4',
            leafColor: '#66BB6A',
            radius: 32,
            score: 1,
            weight: 2
        },
        {
            name: 'banana',
            label: '香蕉',
            outerColor: '#F9A825',
            midColor: '#FDD835',
            innerColor: '#FFFDE7',
            tipColor: '#8D6E63',
            radius: 26,
            score: 1,
            weight: 2
        },
        {
            name: 'orange',
            label: '橙子',
            outerColor: '#E65100',
            midColor: '#FF9800',
            innerColor: '#FFE0B2',
            radius: 30,
            score: 1,
            weight: 2
        }
    ],

    // 刀刃皮肤
    BLADE_SKINS: [
        { name: 'default', label: '默认', trail: '#FFFFFF', glow: '#4FC3F7' },
        { name: 'fire', label: '烈焰', trail: '#FF5722', glow: '#FF9800' },
        { name: 'ice', label: '寒冰', trail: '#81D4FA', glow: '#E1F5FE' },
        { name: 'thunder', label: '雷电', trail: '#FFEB3B', glow: '#FFC107' }
    ]
};
