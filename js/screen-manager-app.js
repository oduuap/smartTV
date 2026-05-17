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
            // Skip auto-focus for sports screen (will be set after data loads)
            if (screenId !== SCREEN_IDS.SPORTS) {
                updateFocusableElements();
                if (focusableElements.length > 0) {
                    setFocus(0);
                }
            }

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

// Show exit confirmation dialog
function showExitConfirmDialog() {
    console.log('📋 Showing exit confirmation dialog');

    var dialog = document.getElementById('exit-confirm-dialog');
    if (!dialog) {
        console.error('Exit confirm dialog not found');
        return;
    }

    // Set flag
    isExitDialogOpen = true;

    // Show dialog
    dialog.style.display = 'flex';

    // Override focusable elements to ONLY dialog buttons (not menu behind it)
    focusableElements = Array.from(dialog.querySelectorAll('.focusable'));
    focusedIndex = 0;

    // Focus on "No" button by default (index 1, safer choice)
    if (focusableElements.length > 1) {
        setFocus(1);
        console.log('Focused on NO button at index: 1');
    } else if (focusableElements.length > 0) {
        setFocus(0);
    }

    // Setup button click handlers
    var yesButton = dialog.querySelector('.dialog-btn-yes');
    var noButtonElement = dialog.querySelector('.dialog-btn-no');

    if (yesButton) {
        yesButton.onclick = function() {
            console.log('User confirmed exit');
            hideExitConfirmDialog();
            exitApp();
        };
    }

    if (noButtonElement) {
        noButtonElement.onclick = function() {
            console.log('User cancelled exit');
            hideExitConfirmDialog();
        };
    }

    console.log('✅ Exit dialog shown, focusable count:', focusableElements.length);
}

// Hide exit confirmation dialog
function hideExitConfirmDialog() {
    console.log('📋 Hiding exit confirmation dialog');

    // Clear flag
    isExitDialogOpen = false;

    var dialog = document.getElementById('exit-confirm-dialog');
    if (dialog) {
        dialog.style.display = 'none';
    }

    // Restore focus to menu screen
    updateFocusableElements();
    setFocus(0);

    console.log('✅ Exit dialog hidden, flag set to:', isExitDialogOpen);
}

// Exit the app
function exitApp() {
    console.log('🚪 Exiting app...');

    // Clean up video if playing
    if (currentScreen === SCREEN_IDS.PLAYER) {
        stopVideo();
    }

    // On webOS: use webOSSystem.close() (correct API)
    if (typeof window.webOSSystem !== 'undefined' && window.webOSSystem.close) {
        console.log('Closing via webOSSystem.close()');
        window.webOSSystem.close();
    } else if (typeof window.close === 'function') {
        console.log('Closing via window.close()');
        window.close();
    } else {
        console.log('Cannot close app from browser');
    }
}

// Global flag to track dialog state
var isExitDialogOpen = false;

// Handle back button navigation
function handleBackButton() {
    console.log('Back button pressed, current screen:', currentScreen, 'dialog open:', isExitDialogOpen);

    // Check if exit dialog is open
    if (isExitDialogOpen) {
        // If dialog is open, BACK = cancel (same as clicking "No")
        console.log('Dialog is open, cancelling exit');
        hideExitConfirmDialog();
        return;
    }

    if (currentScreen === SCREEN_IDS.PLAYER) {
        console.log('Player screen - going back to sports');

        // Store the match ID before stopping video
        var lastWatchedMatchId = currentMatchId;

        stopVideo();
        showScreen(SCREEN_IDS.SPORTS);

        // Update focusable elements FIRST
        updateFocusableElements();

        // Restore focus to the match item that was playing
        if (lastWatchedMatchId) {
            setTimeout(function() {
                restoreFocusToMatch(lastWatchedMatchId);
            }, 50); // Small delay to ensure DOM is ready
        } else {
            // No match ID, focus on first match item
            if (focusableElements.length > 1) {
                setFocus(1); // Skip back button
            }
        }

        // Clear currentMatchId after restoring focus
        currentMatchId = null;
    } else if (currentScreen === SCREEN_IDS.SPORTS) {
        console.log('Sports screen - going back to menu');
        showScreen(SCREEN_IDS.MENU);
    } else if (currentScreen === SCREEN_IDS.MENU) {
        // At main menu, show confirmation dialog
        console.log('Menu screen - showing exit confirmation');
        showExitConfirmDialog();
    }
}

// Initialize screen manager
function initScreenManager() {
    // CRITICAL: webOSLaunch — fired on first launch
    // Must call webOSSystem.ready() so webOS exits the system loading screen.
    // Without this, webOS 3.0/3.5 shows infinite loading.
    document.addEventListener('webOSLaunch', function(event) {
        console.log('webOSLaunch event received');
        try {
            var params = event.detail ? JSON.parse(event.detail) : {};
            console.log('Launch params:', params);
        } catch (e) {
            console.warn('Could not parse launch params:', e);
        }
        if (typeof window.webOSSystem !== 'undefined' && window.webOSSystem.ready) {
            window.webOSSystem.ready();
            console.log('✅ webOSSystem.ready() called on webOSLaunch');
        }
    });

    // webOSRelaunch — app already running, user opens it again
    document.addEventListener('webOSRelaunch', function(event) {
        console.log('webOSRelaunch event received');
        try {
            var params = event.detail ? JSON.parse(event.detail) : {};
            console.log('Relaunch params:', params);
        } catch (e) {
            console.warn('Could not parse relaunch params:', e);
        }
        if (currentScreen === SCREEN_IDS.PLAYER) {
            stopVideo();
        }
        showScreen(SCREEN_IDS.MENU);
        if (typeof window.webOSSystem !== 'undefined' && window.webOSSystem.ready) {
            window.webOSSystem.ready();
        }
    });

    document.addEventListener('webOSLocaleChange', function() {
        console.log('webOS Locale change');
    });

    // Back button via platformBack (hardware back key on remote)
    if (typeof window.webOSSystem !== 'undefined') {
        window.webOSSystem.platformBack = function() {
            handleBackButton();
        };
    }

    // Prevent browser unload dialog
    window.onbeforeunload = null;

    // Handle browser back button (popstate)
    window.addEventListener('popstate', function() {
        console.log('Popstate event:', currentScreen);
        handleBackButton();
    });

    // Fallback: some older firmware may not fire webOSLaunch at all.
    // Call ready() after a short delay to ensure the app is never stuck.
    if (typeof window.webOSSystem !== 'undefined' && window.webOSSystem.ready) {
        setTimeout(function() {
            window.webOSSystem.ready();
            console.log('✅ webOSSystem.ready() called (fallback)');
        }, 200);
    }

    console.log('✅ Screen manager initialized');
}

console.log('✅ Screen Manager loaded');
