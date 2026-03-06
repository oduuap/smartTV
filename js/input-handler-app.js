// ============================================
// Input Handler - Keyboard/Remote Control
// ============================================

// Focus state (global)
var focusedIndex = 0;
var focusableElements = [];

// Throttle to prevent key stuck on TV
var isNavigating = false;
var NAV_THROTTLE_MS = 10; // 10ms delay between navigation (very fast response)

// Update focusable elements based on current screen
function updateFocusableElements() {
    var activeScreen = document.getElementById(currentScreen);

    if (activeScreen) {
        focusableElements = Array.from(activeScreen.querySelectorAll('.focusable'));
        focusedIndex = 0;
    }
}

// Set focus to specific element by index
function setFocus(index) {
    // Remove focus from all elements
    focusableElements.forEach(function(el) {
        el.classList.remove('focused');
    });

    // Add focus to target element
    if (focusableElements[index]) {
        focusedIndex = index;
        focusableElements[index].classList.add('focused');
        focusableElements[index].focus();

        // Play focus sound
        if (typeof playFocusSound === 'function') {
            playFocusSound();
        }

        // Scroll into view for sports list (smooth scroll)
        if (currentScreen === SCREEN_IDS.SPORTS) {
            focusableElements[index].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    }
}

// Move focus in specified direction (throttled to prevent stuck)
function moveFocus(direction) {
    // Throttle navigation to prevent key stuck on TV
    if (isNavigating) {
        return;
    }

    isNavigating = true;
    setTimeout(function() {
        isNavigating = false;
    }, NAV_THROTTLE_MS);

    var newIndex = focusedIndex;

    // Simple navigation for main menu (4 items in a row)
    if (currentScreen === SCREEN_IDS.MENU) {
        var totalItems = focusableElements.length;

        if (direction === 'left' && focusedIndex > 0) {
            newIndex = focusedIndex - 1;
        } else if (direction === 'right' && focusedIndex < totalItems - 1) {
            newIndex = focusedIndex + 1;
        }
        // Up/down do nothing in main menu (horizontal only)
    }
    // Grid navigation for sports screen
    else if (currentScreen === SCREEN_IDS.SPORTS) {
        var columns = GRID_CONFIG.SPORTS_COLUMNS;
        var totalItems = focusableElements.length;
        var isBackButton = focusedIndex === 0;

        if (isBackButton) {
            // Back button: only down allowed
            if (direction === 'down' && totalItems > 1) {
                newIndex = 1; // Go to first match item
            }
        } else {
            // Regular grid navigation (skip back button at index 0)
            var gridIndex = focusedIndex - 1; // Adjust for back button
            var currentRow = Math.floor(gridIndex / columns);
            var currentCol = gridIndex % columns;

            if (direction === 'left') {
                if (currentCol > 0 && focusedIndex > 1) {
                    newIndex = focusedIndex - 1;
                }
            } else if (direction === 'right') {
                if (currentCol < columns - 1 && focusedIndex + 1 < totalItems) {
                    var nextGridIndex = gridIndex + 1;
                    var nextRow = Math.floor(nextGridIndex / columns);
                    if (nextRow === currentRow) {
                        newIndex = focusedIndex + 1;
                    }
                }
            } else if (direction === 'up') {
                if (currentRow === 0) {
                    newIndex = 0; // First row: go to back button
                } else {
                    newIndex = focusedIndex - columns;
                }
            } else if (direction === 'down') {
                var targetIndex = focusedIndex + columns;
                if (targetIndex < totalItems) {
                    newIndex = targetIndex;
                }
            }
        }
    } else {
        // For other screens, use up/down navigation
        if (direction === 'up') {
            newIndex = Math.max(0, focusedIndex - 1);
        } else if (direction === 'down') {
            newIndex = Math.min(focusableElements.length - 1, focusedIndex + 1);
        } else if (direction === 'left') {
            newIndex = Math.max(0, focusedIndex - 1);
        } else if (direction === 'right') {
            newIndex = Math.min(focusableElements.length - 1, focusedIndex + 1);
        }
    }

    // Only set focus if changed
    if (newIndex !== focusedIndex) {
        setFocus(newIndex);
    }
}

// Handle keyboard/remote key press
function handleKeyPress(event) {
    // Only log important keys (not arrow keys to reduce spam)
    if (event.keyCode === KEY_CODES.ENTER || event.keyCode === KEY_CODES.BACK_WEBOS) {
        console.log('Key pressed:', event.keyCode);
    }

    switch(event.keyCode) {
        case KEY_CODES.LEFT: // Left arrow
            moveFocus('left');
            event.preventDefault();
            break;
        case KEY_CODES.UP: // Up arrow
            moveFocus('up');
            event.preventDefault();
            break;
        case KEY_CODES.RIGHT: // Right arrow
            moveFocus('right');
            event.preventDefault();
            break;
        case KEY_CODES.DOWN: // Down arrow
            moveFocus('down');
            event.preventDefault();
            break;
        case KEY_CODES.ENTER: // Enter/OK button
            console.log('ENTER pressed on index:', focusedIndex);

            // Play select sound
            if (typeof playSelectSound === 'function') {
                playSelectSound();
            }

            if (focusableElements[focusedIndex]) {
                focusableElements[focusedIndex].click();
            }
            event.preventDefault();
            break;
        case KEY_CODES.BACK_WEBOS: // Back button (webOS)
        case KEY_CODES.BACKSPACE: // Backspace (for testing)
        case KEY_CODES.ESCAPE: // Escape (for testing)
            // Prevent default immediately
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            // Play back sound
            if (typeof playBackSound === 'function') {
                playBackSound();
            }

            handleBackButton();

            // Return false to prevent any further handling
            return false;
        case KEY_CODES.PLAY: // Play button
        case KEY_CODES.PAUSE: // Pause button
            var videoPlayer = document.getElementById('video-player');
            if (currentScreen === SCREEN_IDS.PLAYER && videoPlayer) {
                if (videoPlayer.paused) {
                    videoPlayer.play();
                } else {
                    videoPlayer.pause();
                }
            }
            event.preventDefault();
            break;
        case KEY_CODES.STOP: // Stop button
            console.log('STOP key pressed');
            if (currentScreen === SCREEN_IDS.PLAYER) {
                stopVideo();
                showScreen(SCREEN_IDS.SPORTS);
            }
            event.preventDefault();
            break;
        case KEY_CODES.FAST_FORWARD: // Fast Forward (skip 10 seconds)
            var videoPlayer = document.getElementById('video-player');
            if (currentScreen === SCREEN_IDS.PLAYER && videoPlayer) {
                videoPlayer.currentTime = Math.min(videoPlayer.currentTime + 10, videoPlayer.duration || videoPlayer.currentTime + 10);
                console.log('Fast forward: +10s, current time:', videoPlayer.currentTime);
            }
            event.preventDefault();
            break;
        case KEY_CODES.REWIND: // Rewind (back 10 seconds)
            var videoPlayer = document.getElementById('video-player');
            if (currentScreen === SCREEN_IDS.PLAYER && videoPlayer) {
                videoPlayer.currentTime = Math.max(videoPlayer.currentTime - 10, 0);
                console.log('Rewind: -10s, current time:', videoPlayer.currentTime);
            }
            event.preventDefault();
            break;
        case KEY_CODES.HOME_WEBOS: // HOME key - Return to Launcher Bar
            console.log('HOME key pressed - Returning to Launcher Bar');
            event.preventDefault();
            event.stopPropagation();

            // Clean up video if playing
            if (currentScreen === SCREEN_IDS.PLAYER) {
                stopVideo();
            }

            // On webOS, minimize app to show Launcher Bar
            if (typeof window.webOSSystem !== 'undefined') {
                try {
                    console.log('Attempting to activate Launcher Bar via webOS API');
                    // Use webOS API to minimize app
                    if (window.webOSSystem.activate) {
                        window.webOSSystem.activate();
                    }
                    // Alternative: use PalmServiceBridge
                    if (window.PalmServiceBridge) {
                        var bridge = new window.PalmServiceBridge();
                        bridge.call('palm://com.webos.service.applicationmanager/launch',
                            '{"id":"com.webos.app.home"}');
                    }
                } catch (e) {
                    console.error('Cannot activate Launcher Bar:', e);
                }
            } else {
                console.log('Not on webOS - HOME key simulation (go to menu)');
                // For testing on browser
                showScreen(SCREEN_IDS.MENU);
            }
            return false;
        case KEY_CODES.EXIT_WEBOS: // EXIT key - Return to Live TV
            console.log('EXIT key pressed - Returning to Live TV');
            event.preventDefault();
            event.stopPropagation();

            // Clean up video if playing
            if (currentScreen === SCREEN_IDS.PLAYER) {
                stopVideo();
            }

            // On webOS, switch to Live TV
            if (typeof window.webOSSystem !== 'undefined') {
                try {
                    console.log('Attempting to launch Live TV via webOS API');
                    // Use webOS API to launch Live TV
                    if (window.PalmServiceBridge) {
                        var bridge = new window.PalmServiceBridge();
                        bridge.call('palm://com.webos.service.applicationmanager/launch',
                            '{"id":"com.webos.app.livetv"}');
                    } else if (window.webOSSystem.close) {
                        // Alternative: close app (will return to previous app or TV)
                        window.webOSSystem.close();
                    }
                } catch (e) {
                    console.error('Cannot activate Live TV:', e);
                }
            } else {
                console.log('Not on webOS - EXIT key simulation (close window)');
                // For testing on browser - close or go to menu
                if (window.close) {
                    window.close();
                } else {
                    showScreen(SCREEN_IDS.MENU);
                }
            }
            return false;
    }
}

// Initialize Magic Remote pointer support
function initMagicRemote() {
    console.log('🖱️  Initializing Magic Remote pointer support...');

    var lastPointerTarget = null;
    var pointerMoveTimeout = null;

    // Track pointer movement (Magic Remote)
    document.addEventListener('mousemove', function(e) {
        // Throttle pointer movement to prevent excessive updates
        if (pointerMoveTimeout) {
            return;
        }

        pointerMoveTimeout = setTimeout(function() {
            pointerMoveTimeout = null;
        }, 50); // 50ms throttle

        // Get element under pointer
        var target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return;

        // Find closest focusable element
        var focusable = target.classList.contains('focusable') ? target : target.closest('.focusable');

        // Update focus if pointer moved to new focusable element
        if (focusable && focusable !== lastPointerTarget) {
            var index = focusableElements.indexOf(focusable);
            if (index >= 0) {
                setFocus(index);
                lastPointerTarget = focusable;
                console.log('🖱️  Pointer focus changed to index:', index);
            }
        }
    });

    // Handle pointer clicks (Magic Remote OK button via pointer)
    document.addEventListener('click', function(e) {
        var target = e.target.closest('.focusable');
        if (target) {
            console.log('🖱️  Pointer click on focusable element');
            // Click event will bubble up naturally
        }
    });

    // Show cursor for Magic Remote
    document.body.style.cursor = 'auto';

    // Add hover effects via CSS
    var style = document.createElement('style');
    style.textContent = '\
        .focusable:hover {\
            cursor: pointer;\
        }\
        body {\
            cursor: auto !important;\
        }\
    ';
    document.head.appendChild(style);

    console.log('✅ Magic Remote pointer support initialized');
}

// Prevent scroll wheel from affecting focus
var scrollProtectionTimer = null;
function preventScrollWheelFocus() {
    // Prevent scroll wheel on sports screen from losing focus
    var sportsScreen = document.getElementById(SCREEN_IDS.SPORTS);
    if (sportsScreen) {
        sportsScreen.addEventListener('wheel', function(e) {
            // Throttle scroll protection
            if (scrollProtectionTimer) return;

            scrollProtectionTimer = setTimeout(function() {
                scrollProtectionTimer = null;
                if (currentScreen === SCREEN_IDS.SPORTS && focusableElements[focusedIndex]) {
                    focusableElements[focusedIndex].classList.add('focused');
                }
            }, 50);
        });
    }
}

// Initialize input handlers
function initInputHandlers() {
    console.log('🎮 Initializing input handlers...');

    // Setup keyboard navigation
    document.addEventListener('keydown', handleKeyPress);

    // Setup Magic Remote pointer support
    initMagicRemote();

    // Prevent scroll wheel from losing focus
    preventScrollWheelFocus();

    console.log('✅ Input handlers initialized');
    console.log('📋 Focusable elements:', focusableElements.length);
}

// Restore focus to match item by matchId
function restoreFocusToMatch(matchId) {
    console.log('🎯 Restoring focus to match:', matchId);
    console.log('Focusable elements count:', focusableElements.length);

    // Find the match item with this matchId
    var matchItems = document.querySelectorAll('.match-item');
    console.log('Match items found:', matchItems.length);

    var targetIndex = -1;

    matchItems.forEach(function(item, index) {
        var itemMatchId = item.getAttribute('data-match-id');
        if (itemMatchId === matchId) {
            // +1 because index 0 is back button
            targetIndex = index + 1;
            console.log('✅ Found match at index:', targetIndex, 'matchId:', itemMatchId);
        }
    });

    if (targetIndex >= 0 && targetIndex < focusableElements.length) {
        console.log('Setting focus to index:', targetIndex);
        setFocus(targetIndex);

        // Scroll to the element
        if (focusableElements[targetIndex]) {
            focusableElements[targetIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }

        console.log('✅ Focus restored to match item');
    } else {
        console.warn('⚠️ Could not find match item (targetIndex:', targetIndex, ', focusableElements.length:', focusableElements.length, ')');
        console.warn('Focusing on first match item instead');

        if (focusableElements.length > 1) {
            setFocus(1); // First match (skip back button)
        } else if (focusableElements.length === 1) {
            setFocus(0); // Only back button
        }
    }
}

console.log('✅ Input Handler loaded');
