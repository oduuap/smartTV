// ============================================
// Video Player - HLS Player Management
// ============================================

// HLS player instance (global)
var hlsPlayer = null;
var videoHideTimeout = null;

// Play video function
function playVideo(videoData) {
    var title = videoData.title;
    var videoUrl = videoData.videoUrl;
    var type = videoData.type;
    var commentators = videoData.commentators;
    var matchInfo = videoData.matchInfo;

    console.log('▶️ Playing video:', title);
    console.log('Video URL:', videoUrl);

    if (!videoUrl) {
        console.error('No video URL provided');
        return;
    }

    var videoPlayer = document.getElementById('video-player');
    var videoTitle = document.getElementById('video-title');
    var videoCommentatorsDiv = document.getElementById('video-commentators');

    if (!videoPlayer || !videoTitle) {
        console.error('Video player elements not found');
        return;
    }

    videoTitle.textContent = title;

    // Render commentators if available
    if (commentators && commentators.length > 0) {
        videoCommentatorsDiv.innerHTML = commentators.map(function(blv) {
            return '\
                <div class="blv-item">\
                    <img src="' + blv.avatar + '" alt="' + blv.commentator + '" onerror="this.src=\'https://via.placeholder.com/40x40?text=BLV\'">\
                    <span>' + blv.commentator + '</span>\
                </div>\
            ';
        }).join('');
    } else if (matchInfo && matchInfo.commentator) {
        videoCommentatorsDiv.innerHTML = '\
            <div class="blv-item">\
                <img src="' + (matchInfo.commentatorAvatar || 'https://via.placeholder.com/40x40?text=BLV') + '" alt="' + matchInfo.commentator + '">\
                <span>' + matchInfo.commentator + '</span>\
            </div>\
        ';
    } else {
        videoCommentatorsDiv.innerHTML = '';
    }

    // Clean up previous HLS instance
    if (hlsPlayer) {
        hlsPlayer.destroy();
        hlsPlayer = null;
    }

    showScreen(SCREEN_IDS.PLAYER);

    // Setup event listeners to show info on user interaction
    setupVideoInfoBehavior();

    // Show video info initially
    showVideoInfo();

    // Check if HLS stream
    if (type === 'hls' || videoUrl.includes('.m3u8')) {
        // Use HLS.js for HLS streams
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            hlsPlayer = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsPlayer.loadSource(videoUrl);
            hlsPlayer.attachMedia(videoPlayer);

            hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function() {
                videoPlayer.play().catch(function(error) {
                    console.error('Error playing video:', error);
                });
            });

            // Error handling with recovery
            hlsPlayer.on(Hls.Events.ERROR, function(event, data) {
                console.error('HLS Error:', data);
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Network error, trying to recover...');
                            hlsPlayer.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('Media error, trying to recover...');
                            hlsPlayer.recoverMediaError();
                            break;
                        default:
                            console.error('Fatal error, cannot recover');
                            hlsPlayer.destroy();
                            hlsPlayer = null;
                            break;
                    }
                }
            });
        }
        // Native HLS support (Safari, webOS)
        else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = videoUrl;
            videoPlayer.addEventListener('loadedmetadata', function() {
                videoPlayer.play().catch(function(error) {
                    console.error('Error playing video:', error);
                });
            });
        } else {
            console.error('HLS is not supported in this browser');
            alert('Trình duyệt không hỗ trợ phát video HLS');
        }
    } else {
        // Regular video (MP4, FLV, etc.)
        videoPlayer.src = videoUrl;
        videoPlayer.play().catch(function(error) {
            console.error('Error playing video:', error);
        });
    }
}

// Setup video info behavior (show on mouse/key events)
function setupVideoInfoBehavior() {
    var playerContainer = document.querySelector('.player-container');
    var videoPlayer = document.getElementById('video-player');

    if (playerContainer) {
        // Remove old listeners if any
        playerContainer.removeEventListener('mousemove', showVideoInfo);
        document.removeEventListener('keydown', showVideoInfoOnKey);

        // Add new listeners
        playerContainer.addEventListener('mousemove', showVideoInfo);
        document.addEventListener('keydown', showVideoInfoOnKey);

        // Also show info when video is clicked
        if (videoPlayer) {
            videoPlayer.removeEventListener('click', showVideoInfo);
            videoPlayer.addEventListener('click', showVideoInfo);
        }
    }
}

// Show video info on key press (wrapper to avoid showing on back button)
function showVideoInfoOnKey(event) {
    // Don't show info if back button is pressed
    if (event.keyCode !== KEY_CODES.BACK_WEBOS &&
        event.keyCode !== KEY_CODES.BACKSPACE &&
        event.keyCode !== KEY_CODES.ESCAPE) {
        showVideoInfo();
    }
}

// Show video info overlay
function showVideoInfo() {
    var videoInfo = document.querySelector('.video-info');
    if (videoInfo) {
        videoInfo.style.display = 'block';
        videoInfo.style.opacity = '1';

        // Clear previous timeout
        if (videoHideTimeout) {
            clearTimeout(videoHideTimeout);
        }

        // Set new timeout to hide after configured duration
        videoHideTimeout = setTimeout(function() {
            videoInfo.style.opacity = '0';
            setTimeout(function() {
                videoInfo.style.display = 'none';
            }, APP_CONFIG.VIDEO_INFO_FADE_DURATION);
        }, APP_CONFIG.VIDEO_INFO_DISPLAY_DURATION);
    }
}

// Stop video and cleanup
function stopVideo() {
    var videoPlayer = document.getElementById('video-player');
    var playerContainer = document.querySelector('.player-container');

    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.src = '';
    }

    // Clear hide timeout
    if (videoHideTimeout) {
        clearTimeout(videoHideTimeout);
        videoHideTimeout = null;
    }

    // Remove event listeners
    if (playerContainer) {
        playerContainer.removeEventListener('mousemove', showVideoInfo);
    }
    document.removeEventListener('keydown', showVideoInfoOnKey);
    if (videoPlayer) {
        videoPlayer.removeEventListener('click', showVideoInfo);
    }

    // Clean up HLS player
    if (hlsPlayer) {
        hlsPlayer.destroy();
        hlsPlayer = null;
    }

    console.log('Video stopped and cleaned up');
}

console.log('✅ Video Player loaded');
