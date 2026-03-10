/**
 * Scroll Controller
 * Maps scroll input to camera Z position with ultra-smooth interpolation.
 * Supports scroll locking for cinematic sequences.
 */

const MAX_SCROLL = 5000;

let scrollTarget = 0;
let scrollCurrent = 0;
let scrollProgress = 0;
let scrollVelocity = 0;
let scrollLocked = false;    // when true, user scroll input is ignored
let scrollCinemaValue = -1; // when >= 0, overrides progress for cinematic playback

function initScrollController() {
    window.addEventListener('wheel', (e) => {
        if (scrollLocked) return; // ignore input during cinematic
        scrollTarget += e.deltaY * 0.8;
        scrollTarget = Math.max(0, Math.min(MAX_SCROLL, scrollTarget));
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (scrollLocked) return;
        const delta = touchStartY - e.touches[0].clientY;
        touchStartY = e.touches[0].clientY;
        scrollTarget += delta * 2.5;
        scrollTarget = Math.max(0, Math.min(MAX_SCROLL, scrollTarget));
    }, { passive: true });
}

function updateScroll() {
    if (scrollCinemaValue >= 0) {
        // Cinematic override — use the provided value directly
        scrollProgress = scrollCinemaValue;
        // Keep target in sync so when we unlock it continues from here
        scrollCurrent = scrollCinemaValue * MAX_SCROLL;
        scrollTarget = scrollCurrent;
        scrollVelocity = 0;
        return scrollProgress;
    }

    const diff = scrollTarget - scrollCurrent;
    scrollVelocity += diff * 0.006;
    scrollVelocity *= 0.85;
    scrollCurrent += scrollVelocity;
    if (Math.abs(diff) < 0.5) {
        scrollCurrent = scrollTarget;
        scrollVelocity = 0;
    }
    scrollProgress = scrollCurrent / MAX_SCROLL;
    return scrollProgress;
}

function getScrollProgress() { return scrollProgress; }

/** Lock user input (for cinematic sequences) */
function lockScroll() {
    scrollLocked = true;
}

/** Unlock — user can scroll again from current position */
function unlockScroll() {
    scrollLocked = false;
    scrollCinemaValue = -1;
}

/** During cinematic, drive scroll to a specific progress value (0-1) */
function setCinemaProgress(value) {
    scrollCinemaValue = Math.max(0, Math.min(1, value));
    scrollCurrent = scrollCinemaValue * MAX_SCROLL;
    scrollTarget = scrollCurrent;
}

function resetScroll() {
    scrollTarget = 0;
    scrollCurrent = 0;
    scrollProgress = 0;
    scrollVelocity = 0;
    scrollLocked = false;
    scrollCinemaValue = -1;
}

export {
    initScrollController, updateScroll, getScrollProgress,
    resetScroll, lockScroll, unlockScroll, setCinemaProgress
};
