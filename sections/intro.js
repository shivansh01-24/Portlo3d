/**
 * Intro Section — Remastered
 *
 * Each letter of "SHIVANSH" bounces in from a random direction
 * (left, right, top, bottom) with spring physics, rotation, and personality.
 * Letters land one by one, then settle into the final name.
 * Subtitle and decorative elements follow.
 * Finally, the white screen transitions to dark and fades away.
 */

let introComplete = false;
let onCompleteCallback = null;

// ── Letter entrance configurations ──
// Each letter gets a unique entrance direction and style
const LETTER_CONFIG = [
    { char: 'S', from: 'left', delay: 300, color: '#00ff88', rotation: -180 },
    { char: 'H', from: 'top', delay: 550, color: '#00ccff', rotation: 360 },
    { char: 'I', from: 'right', delay: 750, color: '#ff00aa', rotation: -270 },
    { char: 'V', from: 'bottom', delay: 950, color: '#ffaa00', rotation: 180 },
    { char: 'A', from: 'left', delay: 1150, color: '#00ff88', rotation: -360 },
    { char: 'N', from: 'top', delay: 1350, color: '#00ccff', rotation: 270 },
    { char: 'S', from: 'right', delay: 1550, color: '#ff00aa', rotation: -180 },
    { char: 'H', from: 'bottom', delay: 1750, color: '#ffaa00', rotation: 360 },
];

/**
 * Create and display the intro overlay
 * @param {Function} onComplete — called when the intro finishes and overlay is removed
 */
function createIntro(onComplete) {
    onCompleteCallback = onComplete;

    // ── Inject keyframe animations ──
    const styleEl = document.createElement('style');
    styleEl.textContent = `
    @keyframes bounceFromLeft {
      0%   { transform: translateX(-120vw) rotate(-180deg) scale(0.3); opacity: 0; }
      50%  { transform: translateX(30px) rotate(15deg) scale(1.15); opacity: 1; }
      70%  { transform: translateX(-10px) rotate(-5deg) scale(0.95); }
      85%  { transform: translateX(5px) rotate(2deg) scale(1.02); }
      100% { transform: translateX(0) rotate(0deg) scale(1); }
    }
    @keyframes bounceFromRight {
      0%   { transform: translateX(120vw) rotate(180deg) scale(0.3); opacity: 0; }
      50%  { transform: translateX(-30px) rotate(-15deg) scale(1.15); opacity: 1; }
      70%  { transform: translateX(10px) rotate(5deg) scale(0.95); }
      85%  { transform: translateX(-5px) rotate(-2deg) scale(1.02); }
      100% { transform: translateX(0) rotate(0deg) scale(1); }
    }
    @keyframes bounceFromTop {
      0%   { transform: translateY(-120vh) rotate(360deg) scale(0.3); opacity: 0; }
      50%  { transform: translateY(25px) rotate(-10deg) scale(1.15); opacity: 1; }
      70%  { transform: translateY(-12px) rotate(5deg) scale(0.95); }
      85%  { transform: translateY(5px) rotate(-2deg) scale(1.02); }
      100% { transform: translateY(0) rotate(0deg) scale(1); }
    }
    @keyframes bounceFromBottom {
      0%   { transform: translateY(120vh) rotate(-360deg) scale(0.3); opacity: 0; }
      50%  { transform: translateY(-25px) rotate(10deg) scale(1.15); opacity: 1; }
      70%  { transform: translateY(12px) rotate(-5deg) scale(0.95); }
      85%  { transform: translateY(-5px) rotate(2deg) scale(1.02); }
      100% { transform: translateY(0) rotate(0deg) scale(1); }
    }
    @keyframes letterSettle {
      0%   { color: var(--accent-color); text-shadow: 0 0 30px var(--accent-color); transform: scale(1); }
      50%  { color: #0a0a0a; text-shadow: none; transform: scale(1.05); }
      100% { color: #0a0a0a; text-shadow: none; transform: scale(1); }
    }
    @keyframes subtitleSlide {
      0%   { opacity: 0; transform: translateY(20px); letter-spacing: 20px; }
      100% { opacity: 1; transform: translateY(0); letter-spacing: 8px; }
    }
    @keyframes lineExpand {
      0%   { width: 0; opacity: 0; }
      100% { width: 80px; opacity: 1; }
    }
    @keyframes floatParticle {
      0%   { transform: translateY(0) scale(1); opacity: 0.8; }
      50%  { transform: translateY(-30px) scale(1.5); opacity: 0.3; }
      100% { transform: translateY(-60px) scale(0); opacity: 0; }
    }
    @keyframes bgToDark {
      0%   { background: #ffffff; }
      100% { background: #0a0a0a; }
    }
  `;
    document.head.appendChild(styleEl);

    // ── Overlay container ──
    const overlay = document.createElement('div');
    overlay.id = 'intro-overlay';
    overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    overflow: hidden;
  `;

    // ── Floating particles container (decorative) ──
    const particlesContainer = document.createElement('div');
    particlesContainer.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
  `;
    overlay.appendChild(particlesContainer);

    // Spawn decorative particles when letters land
    function spawnLandingParticles(x, y, color) {
        for (let i = 0; i < 6; i++) {
            const p = document.createElement('div');
            const size = 4 + Math.random() * 6;
            const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
            const dist = 20 + Math.random() * 30;
            p.style.cssText = `
        position: absolute;
        left: ${x + Math.cos(angle) * dist}px;
        top: ${y + Math.sin(angle) * dist}px;
        width: ${size}px; height: ${size}px;
        background: ${color};
        border-radius: 50%;
        animation: floatParticle ${0.6 + Math.random() * 0.4}s ease-out forwards;
        pointer-events: none;
      `;
            particlesContainer.appendChild(p);
            setTimeout(() => p.remove(), 1200);
        }
    }

    // ── Letters container ──
    const lettersRow = document.createElement('div');
    lettersRow.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    position: relative;
    z-index: 1;
    height: 100px;
  `;

    // ── Create each letter element ──
    const letterElements = [];
    LETTER_CONFIG.forEach((cfg) => {
        const letter = document.createElement('span');
        letter.textContent = cfg.char;
        letter.style.cssText = `
      font-family: 'Georgia', 'Palatino', serif;
      font-size: 72px;
      font-weight: 700;
      color: ${cfg.color};
      display: inline-block;
      opacity: 0;
      text-shadow: 0 0 20px ${cfg.color};
      --accent-color: ${cfg.color};
      will-change: transform, opacity;
    `;
        lettersRow.appendChild(letter);
        letterElements.push({ el: letter, config: cfg });
    });

    overlay.appendChild(lettersRow);

    // ── Subtitle ──
    const subtitle = document.createElement('div');
    subtitle.textContent = 'Software Engineer';
    subtitle.style.cssText = `
    font-family: 'Courier New', monospace;
    font-size: 15px;
    letter-spacing: 20px;
    text-transform: uppercase;
    color: #888888;
    opacity: 0;
    margin-top: 28px;
    position: relative;
    z-index: 1;
  `;
    overlay.appendChild(subtitle);

    // ── Decorative line ──
    const line = document.createElement('div');
    line.style.cssText = `
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #0a0a0a, transparent);
    margin-top: 18px;
    opacity: 0;
    position: relative;
    z-index: 1;
  `;
    overlay.appendChild(line);

    document.body.appendChild(overlay);

    // ═══════════════════════════════════════════
    //  ANIMATION SEQUENCE
    // ═══════════════════════════════════════════

    // 1. Letters bounce in one by one
    letterElements.forEach(({ el, config }, index) => {
        const animName = `bounceFrom${capitalize(config.from)}`;
        const duration = 0.8;

        setTimeout(() => {
            el.style.opacity = '1';
            el.style.animation = `${animName} ${duration}s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;

            // Spawn particles when letter "lands"
            setTimeout(() => {
                const rect = el.getBoundingClientRect();
                spawnLandingParticles(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    config.color
                );
            }, duration * 500);
        }, config.delay);
    });

    // 2. After all letters land, settle to final black color
    const allLettersLanded = LETTER_CONFIG[LETTER_CONFIG.length - 1].delay + 900;

    setTimeout(() => {
        letterElements.forEach(({ el, config }, i) => {
            setTimeout(() => {
                el.style.animation = `letterSettle 0.6s ease forwards`;
                el.style.setProperty('--accent-color', config.color);
            }, i * 60);
        });
    }, allLettersLanded);

    // 3. Subtitle slides in
    const subtitleTime = allLettersLanded + 700;
    setTimeout(() => {
        subtitle.style.animation = 'subtitleSlide 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        line.style.animation = 'lineExpand 0.8s ease 0.3s forwards';
    }, subtitleTime);

    // 4. Hold and enjoy the moment
    const holdTime = subtitleTime + 2000;

    // 5. Transition to dark
    setTimeout(() => {
        overlay.style.animation = 'bgToDark 1s ease forwards';

        // Invert text colors
        letterElements.forEach(({ el, config }) => {
            el.style.transition = 'color 1s ease, text-shadow 1s ease';
            el.style.color = '#ffffff';
            el.style.textShadow = `0 0 15px ${config.color}`;
        });
        subtitle.style.transition = 'color 1s ease';
        subtitle.style.color = '#aaaaaa';
        line.style.transition = 'background 1s ease';
        line.style.background = 'linear-gradient(90deg, transparent, #ffffff, transparent)';
    }, holdTime);

    // 6. Fade out overlay entirely
    const fadeOutTime = holdTime + 1800;
    setTimeout(() => {
        overlay.style.transition = 'opacity 1.2s ease';
        overlay.style.opacity = '0';

        setTimeout(() => {
            overlay.remove();
            styleEl.remove();
            introComplete = true;
            if (onCompleteCallback) onCompleteCallback();
        }, 1300);
    }, fadeOutTime);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function isIntroComplete() {
    return introComplete;
}

export { createIntro, isIntroComplete };
