// ============================================
// Screen Manager - Navigation & History
// ============================================

// Current screen state (global)
var currentScreen = SCREEN_IDS.LOADING;

// Show specific screen
function showScreen(screenId) {
    console.log('📺 Switching to screen: ' + screenId);

    try {
        // Remove all focused states before switching screens
        var focusedElements = document.querySelectorAll('.focused');
        focusedElements.forEach(function(el) {
            el.classList.remove('focused');
        });

        // Hide all screens
        var allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(function(screen) {
            screen.classList.remove('active');
        });

        // Show target screen
        var targetScreen = document.getElementById(screenId);

        if (targetScreen) {
            targetScreen.classList.add('active');
            currentScreen = screenId;

            // Push state to history to handle back button
            if (screenId !== SCREEN_IDS.MENU) {
                try {
                    window.history.pushState({ screen: screenId }, '', '');
                } catch (historyError) {
                    console.warn('History API not available:', historyError);
                }
            }

            // Update focusable elements and set initial focus
            updateFocusableElements();
            setFocus(0);

            // Save app state after screen transition
            if (typeof saveAppState === 'function') {
                saveAppState();
            }

            console.log('✅ Successfully switched to screen: ' + screenId);
        } else {
            console.error('❌ Screen not found: ' + screenId);
        }
    } catch (error) {
        console.error('❌ Error in showScreen:', error);
    }
}

// Handle back button navigation
function handleBackButton() {
    console.log('Back button pressed, current screen:', currentScreen);

    if (currentScreen === SCREEN_IDS.PLAYER) {
        stopVideo();
        showScreen(SCREEN_IDS.SPORTS);
    } else if (currentScreen === SCREEN_IDS.SPORTS) {
        showScreen(SCREEN_IDS.MENU);
    } else if (currentScreen === SCREEN_IDS.MENU) {
        // At main menu, close the app
        if (window.close) {
            window.close();
        } else {
            console.log('Cannot close app from browser');
        }
    }
}

// Initialize screen manager
function initScreenManager() {
    // Setup WebOS back button integration
    if (typeof window.webOSSystem !== 'undefined') {
        window.webOSSystem.platformBack = function() {
            handleBackButton();
        };
    }

    // Prevent exit confirmation dialog
    window.onbeforeunload = null;

    // Handle webOS events
    document.addEventListener('webOSRelaunch', function() {
        console.log('webOS Relaunch event');
    });

    document.addEventListener('webOSLocaleChange', function() {
        console.log('webOS Locale change');
    });

    // WebOS back button handler (legacy)
    if (typeof window.PalmSystem !== 'undefined') {
        window.addEventListener('load', function() {
            if (window.Mojo && window.Mojo.stageController) {
                window.Mojo.stageController.pushScene({
                    name: 'main',
                    disableSceneScroller: true
                });
            }
        });
    }

    // Handle browser back button
    window.addEventListener('popstate', function() {
        console.log('Popstate event:', currentScreen);

        if (currentScreen === SCREEN_IDS.PLAYER) {
            stopVideo();
            showScreen(SCREEN_IDS.SPORTS);
        } else if (currentScreen === SCREEN_IDS.SPORTS) {
            showScreen(SCREEN_IDS.MENU);
        } else {
            // At main menu, close app
            if (window.close) {
                window.close();
            }
        }
    });

    console.log('✅ Screen manager initialized');
}

console.log('✅ Screen Manager loaded');
