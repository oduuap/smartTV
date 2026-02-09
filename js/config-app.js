// ============================================
// Configuration & Constants (Global Variables)
// ============================================

// API Configuration
var APP_CONFIG = {
    API_URL: 'https://api-ls.cdnokvip.com/api', // API base URL cho tất cả requests
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    LOADING_SCREEN_DURATION: 1000, // 1 second (giảm từ 3s)
    VIDEO_INFO_DISPLAY_DURATION: 10000, // 10 seconds
    VIDEO_INFO_FADE_DURATION: 500 // 0.5 seconds
};

// Screen IDs
var SCREEN_IDS = {
    LOADING: 'screen-loading',
    MENU: 'screen-menu',
    SPORTS: 'screen-sports',
    PLAYER: 'screen-player'
};

// Remote Control Key Codes
var KEY_CODES = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 13,
    BACK_WEBOS: 461,
    BACKSPACE: 8,
    ESCAPE: 27,
    PLAY: 415
};

// Grid Configuration
var GRID_CONFIG = {
    MENU_COLUMNS: 4,
    SPORTS_COLUMNS: 3
};

console.log('✅ Config loaded');
