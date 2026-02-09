// ============================================
// SmartTV App - Main Initialization
// ============================================

// Auto scale viewport for web testing
function setupViewportScaling() {
    function updateScale() {
        var scaleX = window.innerWidth / 1920;
        var scaleY = window.innerHeight / 1080;
        var scale = Math.min(scaleX, scaleY);

        document.documentElement.style.setProperty('--scale-factor', scale);
        console.log('📐 Viewport scale factor:', scale);
    }

    updateScale();
    window.addEventListener('resize', updateScale);
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('========================================');
    console.log('✅ SmartTV App Initialized');
    console.log('📱 Platform:', navigator.userAgent);
    console.log('📺 Window size:', window.innerWidth + 'x' + window.innerHeight);
    console.log('========================================');

    // Check if HLS.js is loaded
    console.log('🔍 Checking dependencies...');
    console.log('HLS.js loaded:', typeof Hls !== 'undefined');
    if (typeof Hls !== 'undefined') {
        console.log('HLS.js version:', Hls.version || 'unknown');
        console.log('HLS.isSupported():', Hls.isSupported());
    }

    // Check video element support
    var testVideo = document.createElement('video');
    console.log('Video element support:');
    console.log('  - MP4:', testVideo.canPlayType('video/mp4'));
    console.log('  - WebM:', testVideo.canPlayType('video/webm'));
    console.log('  - HLS (native):', testVideo.canPlayType('application/vnd.apple.mpegurl'));
    console.log('  - M3U8:', testVideo.canPlayType('application/x-mpegURL'));

    console.log('========================================');

    // Setup viewport scaling for web testing
    setupViewportScaling();

    // Initialize all modules
    initScreenManager();
    initInputHandlers();
    initVideoPlayer();

    // Setup menu event listeners
    setupMenuListeners();

    // Show loading screen for 2 seconds then go to menu
    console.log('⏳ Starting loading timer...');
    setTimeout(function() {
        console.log('🔄 Timer finished, switching to menu...');
        showScreen(SCREEN_IDS.MENU);
        window.history.pushState({ screen: SCREEN_IDS.MENU }, '', '');
    }, APP_CONFIG.LOADING_SCREEN_DURATION);
});

// Setup menu event listeners
function setupMenuListeners() {
    // Menu items click
    var menuItems = document.querySelectorAll('#screen-menu .menu-item');
    console.log('📋 Found ' + menuItems.length + ' menu items');

    menuItems.forEach(function(item, index) {
        var category = item.getAttribute('data-category');
        console.log('Menu item ' + (index + 1) + ': category="' + category + '"');

        item.addEventListener('click', function() {
            var category = this.getAttribute('data-category');
            console.log('🖱️  Clicked menu item: ' + category);

            if (category === 'sports') {
                console.log('🏀 Loading sports screen...');
                showSportsScreen();
            }
        });
    });

    // Back buttons
    document.querySelectorAll('.back-button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            showScreen(SCREEN_IDS.MENU);
        });
    });

    document.querySelectorAll('.back-button-player').forEach(function(btn) {
        btn.addEventListener('click', function() {
            stopVideo();
            showScreen(SCREEN_IDS.SPORTS);
        });
    });
}

// Show sports screen with football matches
async function showSportsScreen() {
    console.log('=== 🏀 showSportsScreen() CALLED ===');

    showScreen(SCREEN_IDS.SPORTS);
    console.log('✅ Switched to screen-sports');

    var sportsList = document.querySelector('.sports-list');
    console.log('📋 sportsList element:', sportsList);

    if (!sportsList) {
        console.error('❌ sportsList element not found');
        return;
    }

    // Force display grid
    sportsList.style.display = 'grid';
    sportsList.style.gridTemplateColumns = 'repeat(3, 1fr)';
    sportsList.style.gap = '25px';

    // Show loading message with SmartTV style
    showLoadingIndicator(sportsList, 'Đang tải trận đấu');

    // Load matches from API
    await loadMatchesFromAPI();

    // Render matches
    renderMatchList(footballMatches, sportsList, playMatchById);

    // Update focusable elements and set focus to first item
    updateFocusableElements();
    setFocus(0);
}

// Play match by ID (call API to get video link)
async function playMatchById(matchId) {
    console.log('========================================');
    console.log('🎬 PLAY MATCH BY ID CALLED');
    console.log('Match ID:', matchId);
    console.log('========================================');

    try {
        // Load match detail and video URL
        console.log('📡 Calling loadMatchDetail API...');
        var result = await loadMatchDetail(matchId);

        console.log('📦 API Result:', result);
        console.log('Success:', result.success);
        console.log('Video URL:', result.videoUrl);

        if (!result.success || !result.videoUrl) {
            console.error('❌ No video link found from APIs');
            console.error('Result:', JSON.stringify(result, null, 2));
            alert('Không tìm thấy link video cho trận đấu này!\n\nVui lòng thử trận khác hoặc kiểm tra kết nối mạng.');
            return;
        }

        // Get match info for title
        var match = footballMatches.find(function(m) {
            return m.matchId === matchId;
        });
        var matchData = result.matchData;
        var title = match ? match.title : (matchData ? matchData.homeName + ' vs ' + matchData.awayName : 'Live Video');

        console.log('🎯 Preparing video data...');
        console.log('Title:', title);
        console.log('Video URL:', result.videoUrl);

        // Play video
        playVideo({
            title: title,
            videoUrl: result.videoUrl,
            type: 'hls',
            commentators: matchData ? matchData.listCommentators || [] : [],
            matchInfo: matchData ? {
                league: matchData.leagueName,
                homeScore: matchData.homeScore,
                awayScore: matchData.awayScore,
                status: matchData.status,
                commentator: matchData.commentator,
                commentatorAvatar: matchData.avatar || (match ? match.commentatorAvatar : null)
            } : null
        });
    } catch (error) {
        console.error('========================================');
        console.error('❌ CRITICAL ERROR in playMatchById');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('========================================');
        alert('Không thể tải video. Vui lòng thử lại!\n\nLỗi: ' + error.message);
    }
}

// TEST FUNCTION - Play a test video to verify player works
window.testVideo = function() {
    console.log('🧪 Testing video player with sample HLS stream...');
    playVideo({
        title: 'TEST VIDEO - Big Buck Bunny',
        videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        type: 'hls',
        commentators: [],
        matchInfo: null
    });
};

console.log('💡 TIP: Gõ testVideo() trong console để test video player');

console.log('✅ App Main loaded');
