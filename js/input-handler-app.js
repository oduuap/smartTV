// ============================================
// Input Handler - Keyboard/Remote Control
// ============================================

// Focus state (global)
var focusedIndex = 0;
var focusableElements = [];

// Throttle to prevent key stuck on TV
var isNavigating = false;
var NAV_THROTTLE_MS = 80; // 80ms delay between navigation

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

    // For menu screen and sports screen, use grid navigation
    if (currentScreen === SCREEN_IDS.MENU || currentScreen === SCREEN_IDS.SPORTS) {
        var columns = currentScreen === SCREEN_IDS.MENU ? GRID_CONFIG.MENU_COLUMNS : GRID_CONFIG.SPORTS_COLUMNS;
        var totalItems = focusableElements.length;
        var currentRow = Math.floor(focusedIndex / columns);
        var currentCol = focusedIndex % columns;
        var totalRows = Math.ceil(totalItems / columns);

        if (direction === 'left') {
            // Move left within row, stop at left edge
            if (currentCol > 0) {
                newIndex = focusedIndex - 1;
            }
        } else if (direction === 'right') {
            // Move right within row, stop at right edge or last item
            if (currentCol < columns - 1 && focusedIndex < totalItems - 1) {
                newIndex = focusedIndex + 1;
            }
        } else if (direction === 'up') {
            // Move up 1 row
            var targetIndex = focusedIndex - columns;
            if (targetIndex >= 0) {
                newIndex = targetIndex;
            }
        } else if (direction === 'down') {
            // Move down 1 row with smart column handling
            var targetIndex = focusedIndex + columns;
            if (targetIndex < totalItems) {
                // Target exists, move there
                newIndex = targetIndex;
            } else if (currentRow < totalRows - 1) {
                // Last row: move to last item if we're beyond it
                var lastRowStart = (totalRows - 1) * columns;
                var lastRowItems = totalItems - lastRowStart;
                var targetCol = Math.min(currentCol, lastRowItems - 1);
                newIndex = lastRowStart + targetCol;
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

    setFocus(newIndex);
}

// Handle keyboard/remote key press
function handleKeyPress(event) {
    console.log('Key pressed:', event.keyCode);

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

// Initialize input handlers
function initInputHandlers() {
    console.log('🎮 Initializing input handlers...');

    // Setup keyboard navigation
    document.addEventListener('keydown', handleKeyPress);

    // Setup Magic Remote pointer support
    initMagicRemote();

    console.log('✅ Input handlers initialized');
    console.log('📋 Focusable elements:', focusableElements.length);
}

console.log('✅ Input Handler loaded');
