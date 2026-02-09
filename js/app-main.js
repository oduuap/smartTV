// ============================================
// SmartTV App - Main Initialization
// ============================================

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ SmartTV App Initialized');
    console.log('📱 Platform:', navigator.userAgent);

    // Initialize all modules
    initScreenManager();
    initInputHandlers();

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
    console.log('🎬 Loading video for match: ' + matchId);

    try {
        // Load match detail and video URL
        var result = await loadMatchDetail(matchId);

        if (!result.success || !result.videoUrl) {
            console.error('❌ No video link found from APIs');
            alert('Không tìm thấy link video cho trận đấu này!');
            return;
        }

        // Get match info for title
        var match = footballMatches.find(function(m) {
            return m.matchId === matchId;
        });
        var matchData = result.matchData;
        var title = match ? match.title : (matchData ? matchData.homeName + ' vs ' + matchData.awayName : 'Live Video');

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
        console.error('❌ Error loading video stream:', error);
        alert('Không thể tải video. Vui lòng thử lại!');
    }
}

console.log('✅ App Main loaded');
