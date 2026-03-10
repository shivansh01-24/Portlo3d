/**
 * Intro Section — Cinematic Remaster
 *
 * PHASE 1 — START SCREEN:  Blurry space canvas behind name + "CLICK TO ENTER"
 * PHASE 2 — ENTER:         Asteroid belt accelerates, milky way brightens
 * PHASE 3 — IMPACT:        One asteroid strikes a space station — shockwave flash
 * PHASE 4 — BLACKOUT:      Screen cuts to black
 * PHASE 5 — EYE OPEN:      Slow eyelid animation, blurry → sharp, sees the door
 */

let introComplete = false;
let onCompleteCallback = null;

function createIntro(onComplete) {
    onCompleteCallback = onComplete;

    // ── Inject all keyframes ──
    const KF = document.createElement('style');
    KF.textContent = `
    @keyframes iBounceL  { 0%{transform:translateX(-120vw) rotate(-180deg) scale(.3);opacity:0}
                           55%{transform:translateX(25px) rotate(12deg) scale(1.12);opacity:1}
                           75%{transform:translateX(-8px) rotate(-4deg) scale(.97)}
                           100%{transform:none} }
    @keyframes iBounceR  { 0%{transform:translateX(120vw) rotate(180deg) scale(.3);opacity:0}
                           55%{transform:translateX(-25px) rotate(-12deg) scale(1.12);opacity:1}
                           75%{transform:translateX(8px) rotate(4deg) scale(.97)}
                           100%{transform:none} }
    @keyframes iBounceT  { 0%{transform:translateY(-120vh) rotate(360deg) scale(.3);opacity:0}
                           55%{transform:translateY(22px) rotate(-9deg) scale(1.12);opacity:1}
                           75%{transform:translateY(-10px) rotate(4deg) scale(.97)}
                           100%{transform:none} }
    @keyframes iBounceB  { 0%{transform:translateY(120vh) rotate(-360deg) scale(.3);opacity:0}
                           55%{transform:translateY(-22px) rotate(9deg) scale(1.12);opacity:1}
                           75%{transform:translateY(10px) rotate(-4deg) scale(.97)}
                           100%{transform:none} }
    @keyframes iSettle   { 0%{color:var(--ac);text-shadow:0 0 30px var(--ac)}
                           100%{color:rgba(255,255,255,.9);text-shadow:0 0 8px rgba(255,255,255,.3)} }
    @keyframes iSubtitle { 0%{opacity:0;letter-spacing:24px} 100%{opacity:1;letter-spacing:9px} }
    @keyframes iPulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.97)} }
    @keyframes iArrow    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
    @keyframes iFlash    { 0%{opacity:0} 15%{opacity:1} 100%{opacity:0} }
    @keyframes iShake    { 0%,100%{transform:translate(0)} 20%{transform:translate(-8px,5px)}
                           40%{transform:translate(7px,-6px)} 60%{transform:translate(-5px,8px)}
                           80%{transform:translate(9px,-4px)} }
    @keyframes iEyeOpen  { 0%{clip-path:inset(50% 0 50% 0)} 100%{clip-path:inset(0% 0 0% 0)} }
    @keyframes iBlur     { 0%{filter:blur(18px) brightness(.6)} 100%{filter:blur(0px) brightness(1)} }
    @keyframes iParticle { 0%{transform:translateY(0) scale(1);opacity:.9}
                           100%{transform:translateY(-55px) scale(0);opacity:0} }
    `;
    document.head.appendChild(KF);

    // ════════════════════════════════════════
    //  OVERLAY
    // ════════════════════════════════════════
    const OV = document.createElement('div');
    OV.id = 'intro-overlay';
    OV.style.cssText = `
        position:fixed;top:0;left:0;width:100vw;height:100vh;
        overflow:hidden;z-index:1000;background:#000;
    `;
    document.body.appendChild(OV);

    // ── Space canvas (stars + milky way + asteroids) ──
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;filter:blur(0px)';
    cvs.width  = window.innerWidth;
    cvs.height = window.innerHeight;
    OV.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    const W = cvs.width, H = cvs.height;

    // ── Stars ──
    const STAR_N = 800;
    const stars = Array.from({ length: STAR_N }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.4 + Math.random() * 1.4,
        bright: 0.3 + Math.random() * 0.7,
        twinkle: Math.random() * Math.PI * 2,
    }));

    // ── Asteroids ──
    const AST_N = 22;
    const asts  = Array.from({ length: AST_N }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
        r:  4 + Math.random() * 12,
        angle: Math.random() * Math.PI * 2,
        spin:  (Math.random() - 0.5) * 0.02,
        gray:  100 + Math.floor(Math.random() * 80),
        speed: 1,               // multiplied during acceleration
        isImpactor: i === 0,    // first one will hit
    }));

    // ── Blurry text group ──
    const textGroup = document.createElement('div');
    textGroup.style.cssText = `
        position:absolute;top:0;left:0;width:100%;height:100%;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        filter:blur(8px);transition:filter 1.5s ease;pointer-events:none;
    `;
    OV.appendChild(textGroup);

    // Letters row
    const LETTERS = [
        { ch:'S', from:'L', ac:'#00ff88', delay:200 },
        { ch:'H', from:'T', ac:'#00ccff', delay:420 },
        { ch:'I', from:'R', ac:'#ff00aa', delay:600 },
        { ch:'V', from:'B', ac:'#ffaa00', delay:780 },
        { ch:'A', from:'L', ac:'#00ff88', delay:960 },
        { ch:'N', from:'T', ac:'#00ccff', delay:1140 },
        { ch:'S', from:'R', ac:'#ff00aa', delay:1320 },
        { ch:'H', from:'B', ac:'#ffaa00', delay:1500 },
    ];
    const letterRow = document.createElement('div');
    letterRow.style.cssText = 'display:flex;align-items:center;gap:3px;';
    textGroup.appendChild(letterRow);

    const letterEls = LETTERS.map(cfg => {
        const span = document.createElement('span');
        span.textContent = cfg.ch;
        span.style.cssText = `
            font-family:'Georgia','Palatino',serif;font-size:78px;font-weight:700;
            color:${cfg.ac};text-shadow:0 0 22px ${cfg.ac};opacity:0;
            display:inline-block;will-change:transform,opacity;--ac:${cfg.ac};
        `;
        letterRow.appendChild(span);
        return { el: span, cfg };
    });

    const subtitle = document.createElement('div');
    subtitle.textContent = 'Full-Stack Developer';
    subtitle.style.cssText = `
        font-family:'Courier New',monospace;font-size:14px;letter-spacing:24px;
        text-transform:uppercase;color:rgba(200,200,220,.8);opacity:0;margin-top:24px;
    `;
    textGroup.appendChild(subtitle);

    // ── Click-to-Enter button (below text group) ──
    const enterDiv = document.createElement('div');
    enterDiv.style.cssText = `
        position:absolute;bottom:10%;left:50%;transform:translateX(-50%);
        display:flex;flex-direction:column;align-items:center;gap:10px;
        opacity:0;transition:opacity 1.2s ease;pointer-events:auto;cursor:pointer;
    `;
    enterDiv.innerHTML = `
        <div style="font-family:'Courier New',monospace;font-size:15px;letter-spacing:5px;
            text-transform:uppercase;color:#fff;text-shadow:0 0 16px #8866ff;
            animation:iPulse 1.8s ease-in-out infinite;">
            ◈ &nbsp; CLICK TO ENTER &nbsp; ◈
        </div>
        <div style="color:#8866ff;font-size:22px;animation:iArrow 1.2s ease-in-out infinite;">▼</div>
    `;
    OV.appendChild(enterDiv);

    // ── Shockwave overlay ──
    const shockDiv = document.createElement('div');
    shockDiv.style.cssText = `
        position:absolute;top:0;left:0;width:100%;height:100%;
        background:radial-gradient(circle at 60% 40%, #ff8833, #ff4400 30%, transparent 70%);
        opacity:0;pointer-events:none;
    `;
    OV.appendChild(shockDiv);

    // ── Eye overlay ──
    const eyeTop = document.createElement('div');
    eyeTop.style.cssText = `
        position:absolute;top:0;left:0;width:100%;height:50%;
        background:#000;transform:translateY(0%);transition:transform 3.5s cubic-bezier(0.4,0,0.2,1);
    `;
    const eyeBot = document.createElement('div');
    eyeBot.style.cssText = `
        position:absolute;bottom:0;left:0;width:100%;height:50%;
        background:#000;transform:translateY(0%);transition:transform 3.5s cubic-bezier(0.4,0,0.2,1);
    `;
    const eyeBlur = document.createElement('div');
    eyeBlur.style.cssText = `
        position:absolute;top:0;left:0;width:100%;height:100%;
        background:#000;opacity:1;transition:opacity 3s ease 1s;pointer-events:none;
    `;
    // These start hidden — added during eye-open phase
    OV.appendChild(eyeBlur);

    // ════════════════════════════════════════
    //  ANIMATION STATE
    // ════════════════════════════════════════
    let phase     = 'idle';    // idle → entering → impact → black → eyes
    let started   = false;
    let t0        = 0;         // time of phase start
    let impactX   = W * 0.6, impactY = H * 0.38;
    let rafHandle = null;

    // ── Canvas draw loop ──
    function draw() {
        rafHandle = requestAnimationFrame(draw);
        const now = performance.now() * 0.001;

        ctx.fillStyle = '#000008';
        ctx.fillRect(0, 0, W, H);

        // Milky way band
        const mwGrad = ctx.createLinearGradient(0, H * 0.3, W, H * 0.7);
        const mwAlpha = phase === 'entering' ? Math.min(0.12, (now - t0) * 0.025) : (phase === 'idle' ? 0.04 : 0);
        mwGrad.addColorStop(0, 'transparent');
        mwGrad.addColorStop(0.5, `rgba(180,140,255,${mwAlpha})`);
        mwGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = mwGrad;
        ctx.fillRect(0, 0, W, H);

        // Stars
        stars.forEach(s => {
            s.twinkle += 0.01;
            const a = s.bright * (0.7 + 0.3 * Math.sin(s.twinkle));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
            ctx.fill();
        });

        // Asteroids
        if (phase !== 'black' && phase !== 'eyes') {
            const spd = phase === 'entering' ? Math.min(12, 1 + (now - t0) * 2.2) : 1;

            asts.forEach(a => {
                if (phase === 'entering' && a.isImpactor) {
                    // Aim at impact point
                    const dx = impactX - a.x, dy = impactY - a.y;
                    const d  = Math.sqrt(dx * dx + dy * dy);
                    if (d > 5) {
                        a.vx += (dx / d) * 0.15;
                        a.vy += (dy / d) * 0.15;
                        const len = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
                        a.vx = (a.vx / len) * spd * 0.7;
                        a.vy = (a.vy / len) * spd * 0.7;
                    }
                } else {
                    a.x += a.vx * spd;
                    a.y += a.vy * spd;
                    if (a.x < -50) a.x = W + 40;
                    if (a.x > W + 50) a.x = -40;
                    if (a.y < -50) a.y = H + 40;
                    if (a.y > H + 50) a.y = -40;
                }
                a.angle += a.spin * spd;

                // Draw asteroid (irregular polygon)
                ctx.save();
                ctx.translate(a.x, a.y);
                ctx.rotate(a.angle);
                ctx.beginPath();
                for (let k = 0; k < 7; k++) {
                    const ang = (k / 7) * Math.PI * 2;
                    const jit = a.r * (0.7 + Math.sin(k * 3.1) * 0.3);
                    k === 0 ? ctx.moveTo(Math.cos(ang) * jit, Math.sin(ang) * jit)
                            : ctx.lineTo(Math.cos(ang) * jit, Math.sin(ang) * jit);
                }
                ctx.closePath();
                const gv = a.gray;
                // Speed streaks on impactor
                if (a.isImpactor && phase === 'entering') {
                    const streak = ctx.createLinearGradient(0, 0, -a.vx * 12, -a.vy * 12);
                    streak.addColorStop(0, `rgba(255,180,100,0.9)`);
                    streak.addColorStop(1, 'transparent');
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(-a.vx * 15, -a.vy * 15);
                    ctx.strokeStyle = streak;
                    ctx.lineWidth = a.r * 0.8;
                    ctx.stroke();
                    ctx.fillStyle = '#ffaa55';
                } else {
                    ctx.fillStyle = `rgb(${gv},${gv},${gv})`;
                }
                ctx.fill();
                ctx.restore();
            });
        }
    }
    draw();

    // ════════════════════════════════════════
    //  LETTER ANIMATION
    // ════════════════════════════════════════
    const animMap = { L: 'iBounceL', R: 'iBounceR', T: 'iBounceT', B: 'iBounceB' };
    letterEls.forEach(({ el, cfg }) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.animation = `${animMap[cfg.from]} 0.85s cubic-bezier(0.34,1.56,0.64,1) forwards`;
        }, cfg.delay);
    });

    const lastLetterTime = LETTERS[LETTERS.length - 1].delay + 900;

    // Settle letters + show subtitle
    setTimeout(() => {
        letterEls.forEach(({ el, cfg }, i) => {
            setTimeout(() => {
                el.style.animation = 'iSettle 0.7s ease forwards';
                el.style.setProperty('--ac', cfg.ac);
            }, i * 55);
        });
    }, lastLetterTime);

    setTimeout(() => {
        subtitle.style.animation = 'iSubtitle 1.1s cubic-bezier(0.25,0.46,0.45,0.94) forwards';
    }, lastLetterTime + 600);

    // Show enter button and un-blur text
    setTimeout(() => {
        textGroup.style.filter = 'blur(0px)';
        enterDiv.style.opacity = '1';
        phase = 'waiting';
    }, lastLetterTime + 1400);

    // ════════════════════════════════════════
    //  CLICK TO ENTER
    // ════════════════════════════════════════
    function startAsteroidSequence() {
        if (started) return;
        started = true;
        enterDiv.style.opacity = '0';
        enterDiv.style.pointerEvents = 'none';
        phase = 'entering';
        t0    = performance.now() * 0.001;

        // Space station mesh (simple visual) at impact point
        const station = document.createElement('div');
        station.style.cssText = `
            position:absolute;
            left:${impactX - 18}px;top:${impactY - 18}px;
            width:36px;height:36px;
            border:2px solid #88aaff;border-radius:4px;
            box-shadow:0 0 12px #4466ff,0 0 4px #fff;
            opacity:0.7;
        `;
        OV.appendChild(station);

        // After 5s — IMPACT
        setTimeout(() => {
            phase = 'impact';
            station.style.display = 'none';

            // Flash + shake
            shockDiv.style.opacity = '0.95';
            shockDiv.style.transition = 'opacity 0.08s ease';
            OV.style.animation = 'iShake 0.4s ease';
            setTimeout(() => { shockDiv.style.opacity = '0'; shockDiv.style.transition = 'opacity 1.5s ease'; }, 80);

            // Expand impact ring
            const ring = document.createElement('div');
            ring.style.cssText = `
                position:absolute;left:${impactX}px;top:${impactY}px;
                width:0;height:0;border-radius:50%;
                border:3px solid #ff8833;
                transform:translate(-50%,-50%);
                animation:iFlash 1.4s ease forwards;
                box-shadow:0 0 30px #ff4400;
                transition:width 1.2s ease,height 1.2s ease;
            `;
            OV.appendChild(ring);
            requestAnimationFrame(() => {
                ring.style.width = '600px';
                ring.style.height = '600px';
            });

            // Debris particles
            for (let d = 0; d < 25; d++) {
                const db = document.createElement('div');
                const ang = Math.random() * Math.PI * 2;
                const spd = 40 + Math.random() * 120;
                db.style.cssText = `
                    position:absolute;left:${impactX}px;top:${impactY}px;
                    width:${3 + Math.random() * 5}px;height:${3 + Math.random() * 5}px;
                    background:${Math.random() > .5 ? '#ff8833' : '#ffcc55'};
                    border-radius:50%;animation:iParticle 1.2s ease forwards;
                    transform:translate(${Math.cos(ang)*spd}px,${Math.sin(ang)*spd}px);
                `;
                OV.appendChild(db);
                setTimeout(() => db.remove(), 1400);
            }

            // BLACKOUT after 1.2s
            setTimeout(() => {
                phase = 'black';
                OV.style.animation = '';
                OV.style.transition = 'background 0.5s ease';
                OV.style.background = '#000';
                cancelAnimationFrame(rafHandle);
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, W, H);

                // EYE OPEN after 1.5s
                setTimeout(() => {
                    phase = 'eyes';
                    OV.appendChild(eyeTop);
                    OV.appendChild(eyeBot);

                    // Slowly reveal — eyelids slide apart
                    setTimeout(() => {
                        eyeTop.style.transform = 'translateY(-100%)';
                        eyeBot.style.transform = 'translateY(100%)';
                        eyeBlur.style.opacity  = '0';

                        // After eyelids open, fade the whole overlay
                        setTimeout(() => {
                            OV.style.transition = 'opacity 1.8s ease';
                            OV.style.opacity = '0';
                            setTimeout(() => {
                                OV.remove();
                                KF.remove();
                                introComplete = true;
                                if (onCompleteCallback) onCompleteCallback();
                            }, 1900);
                        }, 3800);
                    }, 300);
                }, 1500);
            }, 1200);
        }, 5000);
    }

    OV.addEventListener('click', startAsteroidSequence);

    // Also allow keyboard Enter
    const keyHandler = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            startAsteroidSequence();
            window.removeEventListener('keydown', keyHandler);
        }
    };
    window.addEventListener('keydown', keyHandler);
}

function isIntroComplete() { return introComplete; }

export { createIntro, isIntroComplete };
