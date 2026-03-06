// ============================================
// Sound Manager - Simple Sound Effects
// ============================================

// Audio Context for sound effects
var audioContext = null;
var soundEnabled = true;

// Initialize Audio Context
function initSoundManager() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('✅ Sound Manager initialized');
    } catch (error) {
        console.warn('⚠️ Web Audio API not supported:', error);
        soundEnabled = false;
    }
}

// Play focus sound (when navigating menu items)
function playFocusSound() {
    if (!soundEnabled || !audioContext) return;

    try {
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800; // Hz
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.warn('Sound playback error:', error);
    }
}

// Play select sound (when selecting an item)
function playSelectSound() {
    if (!soundEnabled || !audioContext) return;

    try {
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 1200; // Hz
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
        console.warn('Sound playback error:', error);
    }
}

// Play back sound
function playBackSound() {
    if (!soundEnabled || !audioContext) return;

    try {
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 600; // Hz
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.warn('Sound playback error:', error);
    }
}

// Play error sound
function playErrorSound() {
    if (!soundEnabled || !audioContext) return;

    try {
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 300; // Hz - Lower frequency for error
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.warn('Sound playback error:', error);
    }
}

// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    console.log('Sound ' + (soundEnabled ? 'enabled' : 'disabled'));
    return soundEnabled;
}

console.log('✅ Sound Manager loaded');
