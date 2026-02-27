// ============================================
// State Manager - App State Persistence
// ============================================

// Global state variables
var currentMatchId = null;
var autoSaveInterval = null;
var STATE_SAVE_INTERVAL = 5000; // Save every 5 seconds
var STATE_EXPIRY_TIME = 3600000; // 1 hour (in milliseconds)

// Save current app state to localStorage
function saveAppState() {
    try {
        var state = {
            screen: currentScreen,
            matchId: currentMatchId,
            timestamp: Date.now(),
            version: '1.0.0'
        };

        // Save video position if playing
        var videoPlayer = document.getElementById('video-player');
        if (currentScreen === SCREEN_IDS.PLAYER && videoPlayer && !videoPlayer.paused) {
            state.videoPosition = videoPlayer.currentTime;
            state.videoDuration = videoPlayer.duration;
        }

        localStorage.setItem('smarttv_app_state', JSON.stringify(state));
        console.log('💾 App state saved:', state);
    } catch (error) {
        console.error('❌ Error saving app state:', error);
    }
}

// Restore app state from localStorage
function restoreAppState() {
    try {
        var savedState = localStorage.getItem('smarttv_app_state');

        if (!savedState) {
            console.log('ℹ️  No saved state found');
            return false;
        }

        var state = JSON.parse(savedState);
        console.log('📂 Found saved state:', state);

        // Check if state is expired (older than 1 hour)
        var timeDiff = Date.now() - state.timestamp;
        if (timeDiff > STATE_EXPIRY_TIME) {
            console.log('⏰ Saved state expired (older than 1 hour)');
            localStorage.removeItem('smarttv_app_state');
            return false;
        }

        console.log('✅ Restoring app state...');
        console.log('  - Screen:', state.screen);
        console.log('  - Match ID:', state.matchId);
        console.log('  - Video Position:', state.videoPosition);
        console.log('  - Time diff:', Math.round(timeDiff / 1000), 'seconds ago');

        // Restore based on saved screen
        if (state.screen === SCREEN_IDS.PLAYER && state.matchId) {
            // Restore video playback
            console.log('🎬 Restoring video playback...');
            currentMatchId = state.matchId;

            // Play the match and resume position
            playMatchById(state.matchId).then(function() {
                if (state.videoPosition) {
                    setTimeout(function() {
                        var videoPlayer = document.getElementById('video-player');
                        if (videoPlayer) {
                            videoPlayer.currentTime = state.videoPosition;
                            console.log('⏩ Resumed video at:', state.videoPosition, 'seconds');
                        }
                    }, 2000); // Wait for video to load
                }
            });

            return true;
        } else if (state.screen === SCREEN_IDS.SPORTS) {
            // Restore sports list
            console.log('🏀 Restoring sports screen...');
            showSportsScreen();
            return true;
        } else if (state.screen === SCREEN_IDS.MENU) {
            // Just go to menu (default behavior)
            console.log('📋 State was on menu, no restore needed');
            return false;
        }

        return false;
    } catch (error) {
        console.error('❌ Error restoring app state:', error);
        localStorage.removeItem('smarttv_app_state');
        return false;
    }
}

// Clear saved app state
function clearAppState() {
    try {
        localStorage.removeItem('smarttv_app_state');
        console.log('🗑️  App state cleared');
    } catch (error) {
        console.error('❌ Error clearing app state:', error);
    }
}

// Start auto-save interval
function startAutoSave() {
    // Clear existing interval if any
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }

    // Save state every 5 seconds
    autoSaveInterval = setInterval(function() {
        saveAppState();
    }, STATE_SAVE_INTERVAL);

    console.log('⏰ Auto-save started (every ' + (STATE_SAVE_INTERVAL / 1000) + ' seconds)');
}

// Stop auto-save interval
function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log('⏰ Auto-save stopped');
    }
}

// Initialize state manager
function initStateManager() {
    console.log('💾 Initializing state manager...');

    // Save state before page unload (AC/DC off, browser close)
    window.addEventListener('beforeunload', function() {
        console.log('🔌 beforeunload event - Saving state...');
        saveAppState();
    });

    // Save state when page visibility changes (TV standby)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('👁️  Page hidden - Saving state...');
            saveAppState();
        } else {
            console.log('👁️  Page visible - Resuming...');
        }
    });

    // WebOS app lifecycle events
    document.addEventListener('webOSRelaunch', function() {
        console.log('🔄 webOS Relaunch event');
        // App was relaunched, try to restore state
        setTimeout(function() {
            restoreAppState();
        }, 1000);
    });

    // Start auto-save
    startAutoSave();

    console.log('✅ State manager initialized');
}

// Save video playback position
function saveVideoPosition(matchId, position, duration) {
    try {
        var key = 'video_position_' + matchId;
        var data = {
            position: position,
            duration: duration,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(data));
        console.log('📍 Video position saved:', matchId, '→', position, 'seconds');
    } catch (error) {
        console.error('❌ Error saving video position:', error);
    }
}

// Get saved video position
function getSavedVideoPosition(matchId) {
    try {
        var key = 'video_position_' + matchId;
        var saved = localStorage.getItem(key);

        if (!saved) {
            return null;
        }

        var data = JSON.parse(saved);

        // Check if saved position is not too old (24 hours)
        var timeDiff = Date.now() - data.timestamp;
        if (timeDiff > 86400000) { // 24 hours
            localStorage.removeItem(key);
            return null;
        }

        console.log('📍 Found saved video position:', matchId, '→', data.position, 'seconds');
        return data.position;
    } catch (error) {
        console.error('❌ Error getting video position:', error);
        return null;
    }
}

// Clear video position
function clearVideoPosition(matchId) {
    try {
        var key = 'video_position_' + matchId;
        localStorage.removeItem(key);
        console.log('🗑️  Video position cleared:', matchId);
    } catch (error) {
        console.error('❌ Error clearing video position:', error);
    }
}

console.log('✅ State Manager loaded');
