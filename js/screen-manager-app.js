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

    // Update focusable elements to include dialog buttons
    updateFocusableElements();

    // Focus on "No" button by default (safer choice)
    var noButton = dialog.querySelector('.dialog-btn-no');
    if (noButton) {
        var index = focusableElements.indexOf(noButton);
        if (index >= 0) {
            setFocus(index);
            console.log('Focused on NO button at index:', index);
        }
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

    console.log('✅ Exit dialog shown, flag set to:', isExitDialogOpen);
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

    // Try to close the app
    if (window.close) {
        window.close();
    } else if (typeof window.webOSSystem !== 'undefined' && window.webOSSystem.close) {
        window.webOSSystem.close();
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
        stopVideo();
        showScreen(SCREEN_IDS.SPORTS);
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

        // Use handleBackButton() to ensure dialog is shown
        handleBackButton();
    });

    console.log('✅ Screen manager initialized');
}

console.log('✅ Screen Manager loaded');
