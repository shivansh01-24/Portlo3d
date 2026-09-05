/**
 * SHIVANSH SRIVASTAVA — BUTTERY SMOOTH 120FPS LUXURY PORTFOLIO ENGINE
 * Features:
 * 1. Deep Space Atmospheric Starfield Engine with Twinkling Dust
 * 2. Precision Neon Bezier Wave Ribbon (Directly Beneath Content, Waist Arc)
 * 3. Smooth Momentum Inertia Scroll & 8-Scene Left Rail Tracker (01 to 08)
 * 4. 3D Projects Depth Carousel Slider (Prev/Next, Pagination & Touch/Swipe)
 * 5. Horizontal Tech Stack Icon Slider
 * 6. Interactive Experience Timeline Curve & Parallax Ridges
 * 7. 3D Certificate Orbital Fan Stack & Fullscreen Modal Inspector
 * 8. Real-Time Live IST Digital Clock
 * 9. Scroll-Triggered Reveal Engine (Bi-directional "Hide & Come")
 * 10. Specular Sheen 3D Tilt Physics & Magnetic Spring Cursor Tracking
 */

(function () {
  'use strict';

  /* ==========================================================================
     GLOBAL STATE & MOUSE TRACKING
     ========================================================================== */
  const state = {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    targetMouseX: window.innerWidth / 2,
    targetMouseY: window.innerHeight / 2,
    scrollY: 0,
    targetScrollY: 0,
    isLoaded: false,
    activeSection: '01',
    activeProjectIndex: 0
  };

  window.addEventListener('mousemove', (e) => {
    state.targetMouseX = e.clientX;
    state.targetMouseY = e.clientY;
  }, { passive: true });

  /* ==========================================================================
     01. CINEMATIC INTRO & LOADER
     ========================================================================== */
  const loader = {
    overlay: document.getElementById('loader-overlay'),
    bar: document.getElementById('loader-bar'),
    count: document.getElementById('loader-count'),
    seed: document.getElementById('light-seed'),
    progress: 0,

    init() {
      if (!this.overlay) return;
      if (window.location.search.includes('skip_loader')) {
        this.overlay.style.display = 'none';
        this.overlay.classList.add('is-hidden');
        document.body.classList.remove('is-loading');
        state.isLoaded = true;
        revealHero();
        return;
      }
      const interval = setInterval(() => {
        this.progress += Math.floor(Math.random() * 9) + 4;
        if (this.progress >= 100) {
          this.progress = 100;
          clearInterval(interval);
          this.finish();
        }
        if (this.bar) this.bar.style.width = `${this.progress}%`;
        if (this.count) this.count.textContent = `${String(this.progress).padStart(2, '0')}%`;
      }, 30);
    },

    finish() {
      setTimeout(() => {
        if (this.overlay) this.overlay.classList.add('is-hidden');
        if (this.seed) {
          this.seed.classList.add('expand');
          setTimeout(() => {
            document.body.classList.remove('is-loading');
            state.isLoaded = true;
            revealHero();
          }, 300);
        }
      }, 200);
    }
  };

  function revealHero() {
    const revealItems = document.querySelectorAll('.hero-stage .reveal-item');
    revealItems.forEach((el) => {
      const delay = parseFloat(el.getAttribute('data-delay') || '0');
      setTimeout(() => {
        el.classList.add('is-revealed');
      }, delay * 1000);
    });
  }

  /* ==========================================================================
     02. ATMOSPHERIC STARFIELD & REALISTIC COSMIC SKY ENGINE
     ========================================================================== */
  const atmosphere = {
    canvas: document.getElementById('atmosphere-canvas'),
    ctx: null,
    stars: [],
    numStars: 220,

    init() {
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      for (let i = 0; i < this.numStars; i++) {
        const isPulsar = Math.random() < 0.08;
        this.stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: isPulsar ? Math.random() * 1.8 + 1.2 : Math.random() * 1.1 + 0.3,
          isPulsar: isPulsar,
          baseAlpha: Math.random() * 0.6 + 0.25,
          twinkleSpeed: Math.random() * 0.03 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
          speedY: (Math.random() - 0.5) * 0.08,
          speedX: (Math.random() - 0.5) * 0.08
        });
      }
      this.animate();
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    animate() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let star of this.stars) {
        star.twinklePhase += star.twinkleSpeed;
        const alpha = Math.max(0.08, Math.min(1.0, star.baseAlpha + Math.sin(star.twinklePhase) * 0.35));

        star.x += star.speedX;
        star.y += star.speedY;

        if (star.x < 0) star.x = this.canvas.width;
        if (star.x > this.canvas.width) star.x = 0;
        if (star.y < 0) star.y = this.canvas.height;
        if (star.y > this.canvas.height) star.y = 0;

        if (star.isPulsar && alpha > 0.65) {
          // 4-point celestial diffraction cross
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${(alpha - 0.5) * 0.6})`;
          this.ctx.lineWidth = 0.8;
          const flareLen = star.radius * 4.5;
          this.ctx.beginPath();
          this.ctx.moveTo(star.x - flareLen, star.y);
          this.ctx.lineTo(star.x + flareLen, star.y);
          this.ctx.moveTo(star.x, star.y - flareLen);
          this.ctx.lineTo(star.x, star.y + flareLen);
          this.ctx.stroke();
        }

        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      requestAnimationFrame(() => this.animate());
    }
  };

  /* ==========================================================================
     03. PRECISION NEON WAVE ENGINE (UNDER CONTENT & THROUGH WAIST)
     ========================================================================== */
  const waveEngine = {
    canvas: document.getElementById('neon-wave-canvas'),
    ctx: null,
    time: 0,
    travelLightX: 0,

    init() {
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });
      this.animate();
    },

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * (window.devicePixelRatio || 1);
      this.canvas.height = rect.height * (window.devicePixelRatio || 1);
    },

    animate() {
      if (!this.ctx) return;
      this.time += 0.02;
      const w = this.canvas.width;
      const h = this.canvas.height;

      this.ctx.clearRect(0, 0, w, h);

      // Trajectory calibrated directly under content and through waist
      const startX = 0;
      const startY = h * 0.78;
      const peakX = w * 0.42;
      const peakY = h * 0.70 + Math.sin(this.time * 1.5) * 5;
      const waistX = w * 0.74;
      const waistY = h * 0.78 + Math.cos(this.time * 1.2) * 4;
      const endX = w;
      const endY = h * 0.76;

      // 1. Broad atmospheric neon aura
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.bezierCurveTo(w * 0.20, startY - 4, w * 0.32, peakY + 6, peakX, peakY);
      this.ctx.bezierCurveTo(w * 0.54, peakY - 4, w * 0.65, waistY, waistX, waistY);
      this.ctx.bezierCurveTo(w * 0.84, waistY, w * 0.94, endY - 4, endX, endY);

      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      this.ctx.lineWidth = 5.5 * (window.devicePixelRatio || 1);
      this.ctx.shadowColor = '#ffffff';
      this.ctx.shadowBlur = 28;
      this.ctx.stroke();

      // 2. High-precision luminous core line
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.bezierCurveTo(w * 0.20, startY - 4, w * 0.32, peakY + 6, peakX, peakY);
      this.ctx.bezierCurveTo(w * 0.54, peakY - 4, w * 0.65, waistY, waistX, waistY);
      this.ctx.bezierCurveTo(w * 0.84, waistY, w * 0.94, endY - 4, endX, endY);

      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      this.ctx.lineWidth = 2.0 * (window.devicePixelRatio || 1);
      this.ctx.shadowColor = '#ffffff';
      this.ctx.shadowBlur = 14;
      this.ctx.stroke();

      // 3. Traveling bright pulse
      this.travelLightX += 4.5;
      if (this.travelLightX > w) this.travelLightX = 0;

      let curY = startY;
      const curX = this.travelLightX;
      if (curX <= peakX) {
        const t = curX / peakX;
        curY = (1 - t) * startY + t * peakY;
      } else if (curX <= waistX) {
        const t = (curX - peakX) / (waistX - peakX);
        curY = (1 - t) * peakY + t * waistY;
      } else {
        const t = (curX - waistX) / (w - waistX);
        curY = (1 - t) * waistY + t * endY;
      }

      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#ffffff';
      this.ctx.shadowBlur = 24;
      this.ctx.beginPath();
      this.ctx.arc(curX, curY, 3.5 * (window.devicePixelRatio || 1), 0, Math.PI * 2);
      this.ctx.fill();

      requestAnimationFrame(() => this.animate());
    }
  };

  /* ==========================================================================
     04. SMOOTH MOMENTUM SCROLL & 8-SCENE LEFT RAIL TRACKER (01 to 08)
     ========================================================================== */
  const smoothScroll = {
    pip: document.getElementById('track-pip'),
    fill: document.getElementById('track-line-fill'),
    trackTopNum: document.getElementById('track-current-num'),
    navLinks: document.querySelectorAll('.nav-link'),

    init() {
      window.addEventListener('scroll', () => {
        state.targetScrollY = window.scrollY;
      }, { passive: true });

      // Smooth Jump Navigation
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href').substring(1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      this.updateLoop();
    },

    updateLoop() {
      state.scrollY += (state.targetScrollY - state.scrollY) * 0.14;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, state.scrollY / maxScroll)) : 0;

      if (this.fill) this.fill.style.height = `${progress * 100}%`;
      if (this.pip) this.pip.style.top = `${progress * 100}%`;

      // Track Active Scene 01 to 08
      const sections = document.querySelectorAll('section[data-section-id]');
      let currentSectionId = '01';
      let currentSectionName = 'hero';

      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.2) {
          currentSectionId = sec.getAttribute('data-section-id');
          currentSectionName = sec.getAttribute('id');
        }
      });

      if (this.trackTopNum && this.trackTopNum.textContent !== currentSectionId) {
        this.trackTopNum.textContent = currentSectionId;
      }

      this.navLinks.forEach((link) => {
        const secAttr = link.getAttribute('data-section');
        if (secAttr === currentSectionName) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      requestAnimationFrame(() => this.updateLoop());
    }
  };

  /* ==========================================================================
     05. 3D PROJECTS CAROUSEL SLIDER (CONTINUOUS ROTATING 3D DECK)
     ========================================================================== */
  const projectCarousel = {
    slides: document.querySelectorAll('.project-slide-card'),
    pills: document.querySelectorAll('.pag-pill'),
    prevBtn: document.getElementById('proj-prev-btn'),
    nextBtn: document.getElementById('proj-next-btn'),
    track: document.getElementById('projects-track'),
    currentIndex: 0,
    timer: null,
    isHovered: false,

    init() {
      this.slides = document.querySelectorAll('.project-slide-card');
      this.pills = document.querySelectorAll('.pag-pill');
      if (!this.slides.length) return;

      this.updateSlides();
      this.startAutoRotate();

      // Pause on hover over track/cards, resume on mouse leave
      if (this.track) {
        this.track.addEventListener('mouseenter', () => {
          this.isHovered = true;
          this.stopAutoRotate();
        });
        this.track.addEventListener('mouseleave', () => {
          this.isHovered = false;
          this.startAutoRotate();
        });
      }

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.rotatePrev();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.rotateNext();
        });
      }

      this.pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          this.currentIndex = parseInt(pill.getAttribute('data-index') || '0', 10);
          this.updateSlides();
        });
      });

      // Direct Card Click Navigation
      this.slides.forEach((slide) => {
        slide.addEventListener('click', (e) => {
          if (e.target.closest('a') || e.target.closest('button')) return;
          const idx = parseInt(slide.getAttribute('data-project-index') || '0', 10);
          if (this.currentIndex !== idx) {
            this.currentIndex = idx;
            this.updateSlides();
          }
        });
      });

      // Touch / Swipe Gesture
      let touchStartX = 0;
      if (this.track) {
        this.track.addEventListener('touchstart', (e) => {
          touchStartX = e.touches[0].clientX;
        }, { passive: true });

        this.track.addEventListener('touchend', (e) => {
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) {
              this.rotateNext();
            } else {
              this.rotatePrev();
            }
          }
        }, { passive: true });
      }
    },

    startAutoRotate() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (!this.isHovered) {
          this.rotateNext();
        }
      }, 4200);
    },

    stopAutoRotate() {
      if (this.timer) clearInterval(this.timer);
    },

    rotateNext() {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
      this.updateSlides();
    },

    rotatePrev() {
      this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
      this.updateSlides();
    },

    updateSlides() {
      this.slides.forEach((slide, idx) => {
        slide.classList.remove('active-center', 'left-peek', 'right-peek');
        if (idx === this.currentIndex) {
          slide.classList.add('active-center');
        } else if (idx === (this.currentIndex - 1 + this.slides.length) % this.slides.length) {
          slide.classList.add('left-peek');
        } else if (idx === (this.currentIndex + 1) % this.slides.length) {
          slide.classList.add('right-peek');
        }
      });

      this.pills.forEach((pill, idx) => {
        if (idx === this.currentIndex) {
          pill.classList.add('is-active');
        } else {
          pill.classList.remove('is-active');
        }
      });
    }
  };

  /* ==========================================================================
     06. TECH STACK HORIZONTAL CAROUSEL
     ========================================================================== */
  const techSlider = {
    track: document.getElementById('tech-carousel-track'),
    prevBtn: document.getElementById('tech-prev-btn'),
    nextBtn: document.getElementById('tech-next-btn'),

    init() {
      if (!this.track) return;

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => {
          this.track.scrollBy({ left: -260, behavior: 'smooth' });
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => {
          this.track.scrollBy({ left: 260, behavior: 'smooth' });
        });
      }
    }
  };

  /* ==========================================================================
     07. 3D CARD TILT & SPECULAR SHEEN PHYSICS
     ========================================================================== */
  function init3DTiltCards() {
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     08. 3D CERTIFICATE AUTO-ORBITING CAROUSEL ENGINE
     ========================================================================== */
  const certOrbitEngine = {
    cards: [],
    stage: document.getElementById('cert-orbital-stage'),
    prevBtn: document.getElementById('cert-prev-btn'),
    nextBtn: document.getElementById('cert-next-btn'),
    counterBadge: document.getElementById('cert-counter-badge'),
    dotsContainer: document.getElementById('cert-dots-container'),
    activePosIndex: 0,
    timer: null,
    isHovered: false,

    init() {
      this.cards = Array.from(document.querySelectorAll('.fan-card'));
      if (!this.cards.length) return;

      this.createDots();
      this.updatePositions();
      this.startAutoOrbit();

      // Pause on hover, resume on mouse leave
      if (this.stage) {
        this.stage.addEventListener('mouseenter', () => {
          this.isHovered = true;
          this.stopAutoOrbit();
        });
        this.stage.addEventListener('mouseleave', () => {
          this.isHovered = false;
          this.startAutoOrbit();
        });

        // Touch swipe support for mobile/tablets
        let touchStartX = 0;
        this.stage.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        this.stage.addEventListener('touchend', (e) => {
          const touchEndX = e.changedTouches[0].screenX;
          const diff = touchEndX - touchStartX;
          if (diff > 45) this.rotatePrev();
          else if (diff < -45) this.rotateNext();
        }, { passive: true });
      }

      // Prev / Next Orbit Buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.rotatePrev();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.rotateNext();
        });
      }

      // Direct Card Click
      this.cards.forEach((card, idx) => {
        card.addEventListener('click', (e) => {
          const pos = (idx - this.activePosIndex + this.cards.length) % this.cards.length;
          if (pos !== 0) {
            e.stopPropagation();
            this.activePosIndex = idx;
            this.updatePositions();
          } else {
            // Already in center: open modal
            const imgSrc = card.getAttribute('data-cert-img');
            const docSrc = card.getAttribute('data-cert-doc') || imgSrc;
            const title = card.getAttribute('data-cert-title');
            const issuer = card.getAttribute('data-cert-issuer');
            const grade = card.getAttribute('data-cert-grade');
            const certId = card.getAttribute('data-cert-id');
            certModal.open(imgSrc, title, issuer, grade, certId, docSrc);
          }
        });
      });
    },

    createDots() {
      if (!this.dotsContainer) return;
      this.dotsContainer.innerHTML = '';
      this.cards.forEach((card, idx) => {
        const dot = document.createElement('button');
        dot.className = `cert-dot ${idx === this.activePosIndex ? 'is-active' : ''}`;
        dot.setAttribute('aria-label', `View certificate ${idx + 1}`);
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activePosIndex = idx;
          this.updatePositions();
        });
        this.dotsContainer.appendChild(dot);
      });
    },

    startAutoOrbit() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (!this.isHovered && !document.getElementById('cert-modal')?.classList.contains('is-active')) {
          this.rotateNext();
        }
      }, 4200);
    },

    stopAutoOrbit() {
      if (this.timer) clearInterval(this.timer);
    },

    rotateNext() {
      this.activePosIndex = (this.activePosIndex + 1) % this.cards.length;
      this.updatePositions();
    },

    rotatePrev() {
      this.activePosIndex = (this.activePosIndex - 1 + this.cards.length) % this.cards.length;
      this.updatePositions();
    },

    updatePositions() {
      const total = this.cards.length;
      this.cards.forEach((card, idx) => {
        // Clear all pos-* classes
        for (let i = 0; i < total; i++) {
          card.classList.remove(`pos-${i}`);
        }
        const pos = (idx - this.activePosIndex + total) % total;
        card.classList.add(`pos-${pos}`);
      });

      // Update dots
      if (this.dotsContainer) {
        const dots = this.dotsContainer.querySelectorAll('.cert-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('is-active', idx === this.activePosIndex);
        });
      }

      // Update counter badge
      if (this.counterBadge && this.cards[this.activePosIndex]) {
        const activeCard = this.cards[this.activePosIndex];
        const title = activeCard.getAttribute('data-cert-title') || 'Certificate';
        const shortTitle = title.split(':')[0].trim();
        const numStr = String(this.activePosIndex + 1).padStart(2, '0');
        const totalStr = String(total).padStart(2, '0');
        this.counterBadge.textContent = `${numStr} / ${totalStr} • ${shortTitle}`;
      }
    }
  };

  /* ==========================================================================
     FULLSCREEN CERTIFICATE LIGHTBOX MODAL
     ========================================================================== */
  const certModal = {
    overlay: document.getElementById('cert-modal'),
    img: document.getElementById('cert-modal-img'),
    title: document.getElementById('cert-modal-title'),
    issuer: document.getElementById('cert-modal-issuer'),
    grade: document.getElementById('cert-modal-grade'),
    id: document.getElementById('cert-modal-id'),
    download: document.getElementById('cert-modal-download'),
    closeBtn: document.getElementById('cert-modal-close'),
    backdrop: document.getElementById('cert-modal-backdrop'),

    init() {
      if (!this.overlay) return;

      if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
      if (this.backdrop) this.backdrop.addEventListener('click', () => this.close());

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.overlay.classList.contains('is-active')) {
          this.close();
        }
      });
    },

    open(imgSrc, title, issuer, grade, certId, docSrc) {
      if (this.img) this.img.src = imgSrc;
      if (this.title) this.title.textContent = title;
      if (this.issuer) this.issuer.textContent = issuer;
      if (this.grade) this.grade.textContent = grade;
      if (this.id) this.id.textContent = certId;
      if (this.download) {
        this.download.href = docSrc || imgSrc;
        this.download.setAttribute('download', (docSrc || imgSrc).split('/').pop());
      }

      this.overlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.overlay.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  };

  /* ==========================================================================
     09. REAL-TIME LIVE IST DIGITAL CLOCK
     ========================================================================== */
  function initLiveISTClock() {
    const digitsEl = document.getElementById('clock-time-digits');
    const secEl = document.getElementById('clock-time-sec');
    const ampmEl = document.getElementById('clock-time-ampm');
    const dateEl = document.getElementById('clock-date-str');
    if (!digitsEl) return;

    function update() {
      const now = new Date();
      
      const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      let hours = istDate.getHours();
      const minutes = String(istDate.getMinutes()).padStart(2, '0');
      const seconds = String(istDate.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = String(hours).padStart(2, '0');

      digitsEl.textContent = `${hoursStr}:${minutes}`;
      if (secEl) secEl.textContent = seconds;
      if (ampmEl) ampmEl.textContent = ampm;

      if (dateEl) {
        const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' };
        dateEl.textContent = new Intl.DateTimeFormat('en-US', options).format(now);
      }
    }

    update();
    setInterval(update, 1000);
  }

  /* ==========================================================================
     10. SCROLL-TRIGGERED REVEAL ENGINE (Bi-directional "Hide & Come")
     ========================================================================== */
  const scrollReveal = {
    init() {
      const targets = document.querySelectorAll(
        '.section-header, .about-text-column, .about-card-column, .cap-card, ' +
        '.project-slide-card, .milestone-node, .tech-bento-card, ' +
        '.fan-card, .contact-info-col, .contact-form-col, .contact-clock-col, ' +
        '.footer-center-content, .scroll-reveal'
      );

      // Stagger Delays for Grid Children
      const gridContainers = document.querySelectorAll(
        '.about-capabilities-grid, .timeline-nodes-row, .tech-grid-bento, .cert-fan-stack'
      );

      gridContainers.forEach((container) => {
        const children = container.children;
        Array.from(children).forEach((child, index) => {
          const delay = (index % 6) * 0.12;
          child.style.transitionDelay = `${delay}s`;
        });
      });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            entry.target.classList.remove('is-hidden-scroll', 'is-faded-top');
          } else {
            const rect = entry.target.getBoundingClientRect();
            if (rect.top > window.innerHeight * 0.95) {
              entry.target.classList.remove('is-revealed', 'is-faded-top');
              entry.target.classList.add('is-hidden-scroll');
            } else if (rect.bottom < window.innerHeight * 0.1) {
              entry.target.classList.remove('is-revealed', 'is-hidden-scroll');
              entry.target.classList.add('is-faded-top');
            }
          }
        });
      }, {
        threshold: [0, 0.08, 0.5],
        rootMargin: '20px 0px -20px 0px'
      });

      targets.forEach((el) => observer.observe(el));
    }
  };

  /* ==========================================================================
     11. MAGNETIC BUTTONS & SPRING CURSOR TRACKING
     ========================================================================== */
  function initCursorAndMagnetics() {
    const cursorGlow = document.getElementById('cursor-glow');
    const cursorDot = document.getElementById('cursor-dot');

    function animateCursor() {
      state.mouseX += (state.targetMouseX - state.mouseX) * 0.16;
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.16;

      if (cursorGlow) {
        cursorGlow.style.left = `${state.mouseX}px`;
        cursorGlow.style.top = `${state.mouseY}px`;
      }
      if (cursorDot) {
        cursorDot.style.left = `${state.targetMouseX}px`;
        cursorDot.style.top = `${state.targetMouseY}px`;
      }
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const magneticButtons = document.querySelectorAll('.magnetic-btn');
    magneticButtons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  /* ==========================================================================
     12. CONTACT FORM SUBMISSION FEEDBACK
     ========================================================================== */
  function initContactForm() {
    const form = document.querySelector('.glass-message-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('.submit-msg-btn');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>MESSAGE SENT!</span> <span class="btn-star">✓</span>';
        submitBtn.style.background = '#22c55e';
        submitBtn.style.color = '#ffffff';
        form.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.style.color = '';
        }, 3000);
      }
    });
  }

  /* ==========================================================================
     DOM INITIALIZATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    loader.init();
    atmosphere.init();
    waveEngine.init();
    smoothScroll.init();
    projectCarousel.init();
    techSlider.init();
    init3DTiltCards();
    certOrbitEngine.init();
    certModal.init();
    initLiveISTClock();
    initContactForm();
    initCursorAndMagnetics();
    scrollReveal.init();
  });

})();
