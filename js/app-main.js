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
    initSoundManager();
    initInputHandlers();
    initVideoPlayer();

    // Initialize state manager (must be before restore)
    if (typeof initStateManager === 'function') {
        initStateManager();
    }

    // Setup menu event listeners
    setupMenuListeners();

    // Show loading screen then try to restore state or go to menu
    console.log('⏳ Starting loading timer...');
    setTimeout(function() {
        console.log('🔄 Timer finished...');

        // Try to restore previous state
        var stateRestored = false;
        if (typeof restoreAppState === 'function') {
            stateRestored = restoreAppState();
        }

        // If no state restored, go to menu
        if (!stateRestored) {
            console.log('📋 No state to restore, going to menu...');
            showScreen(SCREEN_IDS.MENU);
            window.history.pushState({ screen: SCREEN_IDS.MENU }, '', '');
        }
    }, APP_CONFIG.LOADING_SCREEN_DURATION);
});

// Show "Coming soon" message for features under development
function showComingSoonMessage(category) {
    console.log('📋 Showing coming soon message for:', category);

    // Play select sound
    if (typeof playSelectSound === 'function') {
        playSelectSound();
    }

    // Category names in Vietnamese
    var categoryNames = {
        'movies': 'Phim',
        'news': 'Tin Tức',
        'music': 'Âm Nhạc'
    };
    var categoryName = categoryNames[category] || category;

    // Create overlay
    var overlay = document.createElement('div');
    overlay.style.cssText = '\
        position: fixed;\
        top: 0;\
        left: 0;\
        width: 100%;\
        height: 100%;\
        background: rgba(0, 0, 0, 0.85);\
        display: flex;\
        align-items: center;\
        justify-content: center;\
        z-index: 9999;\
        animation: fadeIn 0.3s ease-in-out;\
    ';

    // Create message box
    var messageBox = document.createElement('div');
    messageBox.style.cssText = '\
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\
        padding: 50px 80px;\
        border-radius: 20px;\
        text-align: center;\
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);\
        animation: slideIn 0.4s ease-out;\
    ';

    // Create icon
    var icon = document.createElement('div');
    icon.style.cssText = '\
        font-size: 80px;\
        margin-bottom: 20px;\
    ';
    icon.textContent = '🚧';

    // Create title
    var title = document.createElement('h2');
    title.style.cssText = '\
        color: white;\
        font-size: 42px;\
        margin: 0 0 20px 0;\
        font-weight: bold;\
    ';
    title.textContent = categoryName;

    // Create message
    var message = document.createElement('p');
    message.style.cssText = '\
        color: rgba(255, 255, 255, 0.9);\
        font-size: 28px;\
        margin: 0;\
    ';
    message.textContent = 'Tính năng đang phát triển';

    // Create sub message
    var subMessage = document.createElement('p');
    subMessage.style.cssText = '\
        color: rgba(255, 255, 255, 0.7);\
        font-size: 22px;\
        margin: 15px 0 0 0;\
    ';
    subMessage.textContent = 'Vui lòng quay lại sau!';

    // Add animations
    var style = document.createElement('style');
    style.textContent = '\
        @keyframes fadeIn {\
            from { opacity: 0; }\
            to { opacity: 1; }\
        }\
        @keyframes fadeOut {\
            from { opacity: 1; }\
            to { opacity: 0; }\
        }\
        @keyframes slideIn {\
            from {\
                transform: translateY(-50px);\
                opacity: 0;\
            }\
            to {\
                transform: translateY(0);\
                opacity: 1;\
            }\
        }\
    ';

    // Assemble
    document.head.appendChild(style);
    messageBox.appendChild(icon);
    messageBox.appendChild(title);
    messageBox.appendChild(message);
    messageBox.appendChild(subMessage);
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);

    // Auto dismiss after 3 seconds
    setTimeout(function() {
        overlay.style.animation = 'fadeOut 0.3s ease-in-out';
        setTimeout(function() {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 300);
    }, 3000);

    // Click to dismiss
    overlay.addEventListener('click', function() {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    });

    console.log('✅ Coming soon message shown');
}

// Setup menu event listeners
function setupMenuListeners() {
    // Menu items click
    var menuItems = document.querySelectorAll('#screen-menu .menu-item');
    console.log('📋 Found ' + menuItems.length + ' menu items');

    menuItems.forEach(function(item, index) {
        item.addEventListener('click', function() {
            var category = this.getAttribute('data-category');
            console.log('Menu clicked:', category);

            if (category === 'sports') {
                // Use setTimeout to prevent blocking UI
                setTimeout(function() {
                    showSportsScreen();
                }, 10);
            } else if (category === 'movies' || category === 'news' || category === 'music') {
                // Show "Coming soon" message for other categories
                showComingSoonMessage(category);
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
function showSportsScreen() {
    showScreen(SCREEN_IDS.SPORTS);

    var sportsList = document.querySelector('.sports-list');
    if (!sportsList) {
        console.error('sportsList not found');
        return;
    }

    // Clear any inline styles (let CSS handle it)
    sportsList.style.display = '';
    sportsList.style.gridTemplateColumns = '';
    sportsList.style.gap = '';

    // Show loading message with SmartTV style
    showLoadingIndicator(sportsList, 'Đang tải trận đấu');

    // Load matches from API — callback-based (compatible with webOS 3.0/3.5)
    loadMatchesFromAPI(function() {
        // Render matches
        renderMatchList(footballMatches, sportsList, playMatchById);

        // Scroll to top
        var sportsScreen = document.getElementById(SCREEN_IDS.SPORTS);
        if (sportsScreen) {
            sportsScreen.scrollTop = 0;
        }

        // Update focusable elements after DOM is painted
        setTimeout(function() {
            updateFocusableElements();
            if (focusableElements.length > 1) {
                setFocus(1); // Skip back button, focus on first match item
            } else if (focusableElements.length === 1) {
                setFocus(0);
            }
        }, 50);
    });
}

// Play match by ID — callback-based (compatible with webOS 3.0/3.5)
function playMatchById(matchId) {
    console.log('========================================');
    console.log('🎬 PLAY MATCH BY ID CALLED');
    console.log('Match ID:', matchId);
    console.log('========================================');

    currentMatchId = matchId;

    console.log('📡 Calling loadMatchDetail API...');
    loadMatchDetail(matchId, function(result) {
        console.log('📦 API Result received');
        console.log('Success:', result.success);
        console.log('Video URL:', result.videoUrl);

        if (!result.success || !result.videoUrl) {
            console.error('❌ No video link found from APIs');
            if (typeof showErrorMessage === 'function') {
                showErrorMessage('Không tìm thấy link video cho trận đấu này! Vui lòng thử trận khác.');
            } else {
                alert('Không tìm thấy link video cho trận đấu này!\n\nVui lòng thử trận khác hoặc kiểm tra kết nối mạng.');
            }
            currentMatchId = null;
            return;
        }

        // Find match info for title
        var match = null;
        for (var i = 0; i < footballMatches.length; i++) {
            if (footballMatches[i].matchId === matchId) {
                match = footballMatches[i];
                break;
            }
        }
        var matchData = result.matchData;
        var title = match ? match.title : (matchData ? matchData.homeName + ' vs ' + matchData.awayName : 'Live Video');

        console.log('🎯 Preparing video data...');
        console.log('Title:', title);

        // Check if there's a saved position for this video
        var savedPosition = null;
        if (typeof getSavedVideoPosition === 'function') {
            savedPosition = getSavedVideoPosition(matchId);
        }

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

        // Resume from saved position if available
        if (savedPosition && savedPosition > 0) {
            console.log('⏩ Will resume from saved position:', savedPosition, 'seconds');
            setTimeout(function() {
                var videoPlayer = document.getElementById('video-player');
                if (videoPlayer) {
                    videoPlayer.currentTime = savedPosition;
                    console.log('✅ Resumed playback from:', savedPosition, 'seconds');

                    var videoInfo = document.querySelector('.video-info');
                    if (videoInfo) {
                        var resumeMsg = document.createElement('div');
                        resumeMsg.style.cssText = 'background: rgba(0,212,255,0.9); padding: 10px 20px; border-radius: 5px; margin-top: 10px; font-size: 20px;';
                        resumeMsg.textContent = '⏩ Tiếp tục từ ' + Math.floor(savedPosition / 60) + ':' + (Math.floor(savedPosition % 60)).toString().padStart(2, '0');
                        videoInfo.appendChild(resumeMsg);
                        setTimeout(function() { resumeMsg.parentNode && resumeMsg.parentNode.removeChild(resumeMsg); }, 3000);
                    }
                }
            }, 3000);
        }
    });
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
