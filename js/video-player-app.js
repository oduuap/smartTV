// ============================================
// Video Player - HLS Player Management
// ============================================

// HLS player instance (global)
var hlsPlayer = null;
var videoHideTimeout = null;
var videoPositionSaveInterval = null;

// Play video function
function playVideo(videoData) {
    var title = videoData.title;
    var videoUrl = videoData.videoUrl;
    var type = videoData.type;
    var commentators = videoData.commentators;
    var matchInfo = videoData.matchInfo;

    console.log('========================================');
    console.log('▶️ PLAY VIDEO CALLED');
    console.log('Title:', title);
    console.log('Video URL:', videoUrl);
    console.log('Type:', type);
    console.log('========================================');

    if (!videoUrl) {
        console.error('❌ ERROR: No video URL provided');
        alert('Không có URL video!');
        return;
    }

    var videoPlayer = document.getElementById('video-player');
    var videoTitle = document.getElementById('video-title');
    var videoCommentatorsDiv = document.getElementById('video-commentators');

    if (!videoPlayer || !videoTitle) {
        console.error('❌ ERROR: Video player elements not found');
        console.log('videoPlayer:', videoPlayer);
        console.log('videoTitle:', videoTitle);
        return;
    }

    console.log('✅ Video player elements found');

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
        console.log('🧹 Cleaning up previous HLS instance');
        hlsPlayer.destroy();
        hlsPlayer = null;
    }

    // Stop and clear video player
    videoPlayer.pause();
    videoPlayer.src = '';
    videoPlayer.load();

    showScreen(SCREEN_IDS.PLAYER);

    // Setup event listeners to show info on user interaction
    setupVideoInfoBehavior();

    // Show video info initially
    showVideoInfo();

    // Add video element event listeners for debugging
    videoPlayer.addEventListener('loadstart', function() {
        console.log('📺 Video: loadstart event');
    });
    videoPlayer.addEventListener('loadedmetadata', function() {
        console.log('📺 Video: loadedmetadata event');
        console.log('Video duration:', videoPlayer.duration);
        console.log('Video readyState:', videoPlayer.readyState);
    });
    videoPlayer.addEventListener('canplay', function() {
        console.log('📺 Video: canplay event');
    });
    videoPlayer.addEventListener('playing', function() {
        console.log('✅ Video: playing event - VIDEO IS PLAYING!');

        // Start tracking video position
        startVideoPositionTracking();
    });
    videoPlayer.addEventListener('pause', function() {
        console.log('⏸️  Video: pause event');

        // Save position when paused
        if (typeof saveVideoPosition === 'function' && currentMatchId) {
            saveVideoPosition(currentMatchId, videoPlayer.currentTime, videoPlayer.duration);
        }
    });
    videoPlayer.addEventListener('ended', function() {
        console.log('🏁 Video: ended event');

        // Clear saved position when video ends
        if (typeof clearVideoPosition === 'function' && currentMatchId) {
            clearVideoPosition(currentMatchId);
        }
    });
    videoPlayer.addEventListener('waiting', function() {
        console.log('⏳ Video: waiting event - buffering');
    });
    videoPlayer.addEventListener('error', function(e) {
        console.error('❌ Video element error:', e);
        if (videoPlayer.error) {
            console.error('Error code:', videoPlayer.error.code);
            console.error('Error message:', videoPlayer.error.message);
        }
    });

    // Check if HLS stream
    if (type === 'hls' || videoUrl.includes('.m3u8')) {
        console.log('🎥 Detected HLS stream (.m3u8)');

        // Check for HLS.js availability
        console.log('Checking HLS.js availability...');
        console.log('typeof Hls:', typeof Hls);

        if (typeof Hls !== 'undefined') {
            console.log('✅ HLS.js is loaded');
            console.log('HLS.isSupported():', Hls.isSupported());

            if (Hls.isSupported()) {
                console.log('🚀 Using HLS.js for playback');

                hlsPlayer = new Hls({
                    debug: true, // Enable debug logging
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                console.log('Loading source:', videoUrl);
                hlsPlayer.loadSource(videoUrl);

                console.log('Attaching to media element');
                hlsPlayer.attachMedia(videoPlayer);

                hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function() {
                    console.log('✅ HLS: MANIFEST_PARSED - Starting playback');
                    videoPlayer.play().then(function() {
                        console.log('✅ Video play() promise resolved');
                    }).catch(function(error) {
                        console.error('❌ Video play() error:', error);
                        console.error('Error name:', error.name);
                        console.error('Error message:', error.message);
                    });
                });

                // Error handling with recovery
                hlsPlayer.on(Hls.Events.ERROR, function(event, data) {
                    console.error('❌ HLS Error Event:', event);
                    console.error('Error data:', data);
                    console.error('Error type:', data.type);
                    console.error('Error details:', data.details);
                    console.error('Fatal:', data.fatal);

                    if (data.fatal) {
                        switch(data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log('🔄 Network error, trying to recover...');
                                hlsPlayer.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log('🔄 Media error, trying to recover...');
                                hlsPlayer.recoverMediaError();
                                break;
                            default:
                                console.error('💀 Fatal error, cannot recover');
                                hlsPlayer.destroy();
                                hlsPlayer = null;
                                alert('Không thể phát video. Lỗi: ' + data.details);
                                break;
                        }
                    }
                });
            } else {
                console.log('⚠️ HLS.js not supported, trying native HLS');
                tryNativeHLS(videoPlayer, videoUrl);
            }
        } else {
            console.log('⚠️ HLS.js not loaded, trying native HLS');
            tryNativeHLS(videoPlayer, videoUrl);
        }
    } else {
        console.log('🎥 Regular video (not HLS)');
        videoPlayer.src = videoUrl;
        videoPlayer.play().then(function() {
            console.log('✅ Video play() promise resolved');
        }).catch(function(error) {
            console.error('❌ Video play() error:', error);
        });
    }
}

// Try native HLS playback (for Safari, webOS)
function tryNativeHLS(videoPlayer, videoUrl) {
    console.log('🍎 Trying native HLS playback');
    console.log('Checking canPlayType for application/vnd.apple.mpegurl');

    var canPlayHLS = videoPlayer.canPlayType('application/vnd.apple.mpegurl');
    console.log('canPlayType result:', canPlayHLS);

    if (canPlayHLS) {
        console.log('✅ Native HLS is supported');
        videoPlayer.src = videoUrl;
        console.log('Set video source to:', videoUrl);

        videoPlayer.load();
        console.log('Called video.load()');

        // Try to play after a short delay
        setTimeout(function() {
            console.log('Attempting to play video...');
            videoPlayer.play().then(function() {
                console.log('✅ Native HLS playback started successfully');
            }).catch(function(error) {
                console.error('❌ Native HLS play() error:', error);
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                alert('Không thể phát video. Vui lòng thử lại!');
            });
        }, 500);
    } else {
        console.error('❌ Native HLS is NOT supported');
        alert('Trình duyệt không hỗ trợ phát video HLS');
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

// Start tracking video position
function startVideoPositionTracking() {
    // Clear existing interval
    if (videoPositionSaveInterval) {
        clearInterval(videoPositionSaveInterval);
    }

    // Save position every 5 seconds
    videoPositionSaveInterval = setInterval(function() {
        var videoPlayer = document.getElementById('video-player');
        if (videoPlayer && !videoPlayer.paused && currentMatchId) {
            if (typeof saveVideoPosition === 'function') {
                saveVideoPosition(currentMatchId, videoPlayer.currentTime, videoPlayer.duration);
            }
        }
    }, 5000); // Every 5 seconds

    console.log('📍 Video position tracking started');
}

// Stop tracking video position
function stopVideoPositionTracking() {
    if (videoPositionSaveInterval) {
        clearInterval(videoPositionSaveInterval);
        videoPositionSaveInterval = null;
        console.log('📍 Video position tracking stopped');
    }
}

// Stop video and cleanup
function stopVideo() {
    var videoPlayer = document.getElementById('video-player');
    var playerContainer = document.querySelector('.player-container');

    // Save final position before stopping
    if (videoPlayer && currentMatchId && typeof saveVideoPosition === 'function') {
        saveVideoPosition(currentMatchId, videoPlayer.currentTime, videoPlayer.duration);
    }

    // Stop position tracking
    stopVideoPositionTracking();

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

    // Clear current match ID
    currentMatchId = null;

    console.log('Video stopped and cleaned up');
}

// Initialize video player on load
function initVideoPlayer() {
    console.log('🎬 Initializing video player...');

    var videoPlayer = document.getElementById('video-player');
    if (!videoPlayer) {
        console.error('❌ Video player element not found!');
        return;
    }

    console.log('✅ Video player element found');
    console.log('Video element properties:');
    console.log('  - readyState:', videoPlayer.readyState);
    console.log('  - networkState:', videoPlayer.networkState);
    console.log('  - controls:', videoPlayer.controls);
    console.log('  - autoplay:', videoPlayer.autoplay);
}

console.log('✅ Video Player loaded');
