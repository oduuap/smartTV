// ============================================
// Input Handler - Keyboard/Remote Control
// ============================================

// Focus state (global)
var focusedIndex = 0;
var focusableElements = [];

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

// Move focus in specified direction
function moveFocus(direction) {
    var newIndex = focusedIndex;

    // For menu screen and sports screen, use grid navigation
    if (currentScreen === SCREEN_IDS.MENU || currentScreen === SCREEN_IDS.SPORTS) {
        var columns = currentScreen === SCREEN_IDS.MENU ? GRID_CONFIG.MENU_COLUMNS : GRID_CONFIG.SPORTS_COLUMNS;

        if (direction === 'left') {
            newIndex = Math.max(0, focusedIndex - 1);
        } else if (direction === 'right') {
            newIndex = Math.min(focusableElements.length - 1, focusedIndex + 1);
        } else if (direction === 'up') {
            // Move up 1 row
            newIndex = Math.max(0, focusedIndex - columns);
        } else if (direction === 'down') {
            // Move down 1 row
            newIndex = Math.min(focusableElements.length - 1, focusedIndex + columns);
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
    }
}

// Initialize input handlers
function initInputHandlers() {
    // Setup keyboard navigation
    document.addEventListener('keydown', handleKeyPress);

    // Additional back button handler for webOS - capture phase
    document.addEventListener('keydown', function(event) {
        if (event.keyCode === KEY_CODES.BACK_WEBOS) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
    }, true); // Use capture phase

    console.log('✅ Input handlers initialized');
}

console.log('✅ Input Handler loaded');
