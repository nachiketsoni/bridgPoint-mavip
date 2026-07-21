
/* =============================================================
   BRIDGPOINT — Premium Animation Engine
   Stack: GSAP + ScrollTrigger + Lenis + SplitType
   ============================================================= */

(function () {
  'use strict';

  /* ── Reduced-motion gate ── */
  const NO_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PAGE_TRANSITION_KEY = 'bp-page-transition';

  function hasPendingPageTransition() {
    try {
      return sessionStorage.getItem(PAGE_TRANSITION_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  /* ── Loader ── */
  function initLoader() {
    const loader = document.getElementById('bp-loader');
    if (!loader) {
      initAll();
      return;
    }

    // The outgoing wipe already covers the page. Keeping the loader here would
    // interrupt the matching incoming wipe on the destination page.
    if (hasPendingPageTransition()) {
      loader.style.display = 'none';
      initAll();
      return;
    }

    const bar = loader.querySelector('.bp-loader-bar-fill');
    const count = loader.querySelector('.bp-loader-count');
    let pct = 0;
    const tick = setInterval(() => {
      pct = Math.min(pct + Math.random() * 18, 95);
      if (bar) bar.style.transform = `scaleX(${pct / 100})`;
      if (count) count.textContent = Math.floor(pct) + '%';
    }, 80);

    const finishLoader = () => {
      clearInterval(tick);
      if (bar) bar.style.transform = 'scaleX(1)';
      if (count) count.textContent = '100%';
      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0, duration: 0.7, ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            initAll();
          }
        });
      }, 300);
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Force finish loader after 500ms if already interactive, but clear if load fires first
      const t = setTimeout(finishLoader, 500);
      window.addEventListener('load', () => {
        clearTimeout(t);
        finishLoader();
      });
    } else {
      window.addEventListener('load', finishLoader);
      // Fallback failsafe: force loader to clear in 2.5 seconds max
      setTimeout(finishLoader, 2500);
    }
  }

  /* ── Lenis smooth scroll ── */
  function initLenis() {
    if (NO_MOTION) return;
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on('scroll', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    });
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenisInstance = lenis;
  }

  /* ── Hero ── */
  function initHero() {
    /* Smooth block reveal of headline */
    const h1 = document.querySelector('.p-hero h1');
    if (h1) {
      gsap.from(h1, {
        opacity: 0, y: 30,
        duration: 0.9, ease: 'power3.out',
        delay: 0.25
      });
    }

    /* Paragraph + actions */
    gsap.from(['.p-hero-copy p', '.p-hero-actions', '.p-hero-note'], {
      opacity: 0, y: 30, duration: 0.8, ease: 'power3.out',
      stagger: 0.12, delay: 0.55
    });

    /* Float cards parallax & scroll animations */
    if (!NO_MOTION) {
      const cardA = document.querySelector('.p-float-card.a');
      const cardB = document.querySelector('.p-float-card.b');
      if (cardA) {
        gsap.to(cardA, {
          y: -24, duration: 3.8, ease: 'sine.inOut', yoyo: true, repeat: -1
        });
      }
      if (cardB) {
        gsap.to(cardB, {
          y: 16, duration: 4.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1
        });
      }

      const wrapA = document.querySelector('.p-float-card-wrap.a');
      if (wrapA) {
        gsap.to(wrapA, {
          scrollTrigger: {
            trigger: '.p-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          },
          y: -80,
          ease: 'none'
        });
      }

      const wrapB = document.querySelector('.p-float-card-wrap.b');
      if (wrapB) {
        gsap.to(wrapB, {
          scrollTrigger: {
            trigger: '.p-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          },
          y: 60,
          ease: 'none'
        });
      }

      const panel = document.querySelector('.p-hero-visual .p-panel');
      if (panel) {
        gsap.to(panel, {
          scrollTrigger: {
            trigger: '.p-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          },
          y: -30,
          ease: 'none'
        });
      }

      const pulseEl = document.querySelector('.p-hero-pulse');
      if (pulseEl) {
        gsap.to(pulseEl, {
          scrollTrigger: {
            trigger: '.p-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          },
          y: 40,
          ease: 'none'
        });
      }

      const shapePlus = document.querySelector('.p-hero-shape.shape-plus');
      if (shapePlus) {
        gsap.to(shapePlus, {
          scrollTrigger: {
            trigger: '.p-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          },
          y: -50,
          ease: 'none'
        });
      }

      const shapeCircle = document.querySelector('.p-hero-shape.shape-circle');
      if (shapeCircle) {
        gsap.to(shapeCircle, {
          scrollTrigger: {
            trigger: '.p-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          },
          y: 30,
          ease: 'none'
        });
      }

      const heroArc = document.querySelector('.p-hero-arc');
      if (heroArc) {
        gsap.to(heroArc, {
          scrollTrigger: {
            trigger: '.p-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          },
          y: -20,
          ease: 'none'
        });
      }
    }

    /* Hero visual 3D tilt on mouse */
    const visual = document.querySelector('.p-hero-visual');
    if (visual && !NO_MOTION) {
      document.addEventListener('mousemove', e => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const rx = ((e.clientY - cy) / cy) * -6;
        const ry = ((e.clientX - cx) / cx) * 8;
        gsap.to(visual, {
          rotateX: rx, rotateY: ry, transformPerspective: 900,
          duration: 0.6, ease: 'power2.out'
        });
      });
    }

    /* Chart bars stagger on load */
    const bars = gsap.utils.toArray('.p-chart-bar');
    if (bars.length) {
      gsap.fromTo(bars,
        { scaleY: 0 },
        { scaleY: 1, duration: 1.1, ease: 'power4.out', stagger: 0.08, delay: 0.7 }
      );
    }
  }

  /* ── Scroll reveal (replaces simple IntersectionObserver) ── */
  function initScrollReveals() {
    /* Generic fade-up */
    gsap.utils.toArray('.reveal:not(.in-view)').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, y: 40, duration: 0.85, ease: 'power3.out'
      });
    });

    /* Industry tiles */
    gsap.utils.toArray('.p-tile').forEach((tile, i) => {
      gsap.from(tile, {
        scrollTrigger: { trigger: tile, start: 'top 88%' },
        opacity: 0, y: 24, scale: 0.95,
        duration: 0.55, ease: 'power3.out', delay: i * 0.04
      });
    });
  }

  /* ── Section heading split text ── */
  function initSectionHeadings() {
    if (typeof SplitType === 'undefined') return;
    gsap.utils.toArray('section h2').forEach(h2 => {
      const split = new SplitType(h2, { types: 'lines' });
      gsap.from(split.lines, {
        scrollTrigger: { trigger: h2, start: 'top 82%' },
        opacity: 0, y: 35, rotateX: -20, transformPerspective: 600,
        duration: 0.8, ease: 'power4.out', stagger: 0.1
      });
    });
  }

  /* ── 3D card tilt (enhanced) ── */
  function initCardTilt() {
    const selector = '.p-practice-card, .p-metric-card, .p-compare-card, .p-quiz';
    gsap.utils.toArray(selector).forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const xp = (e.clientX - r.left) / r.width - 0.5;
        const yp = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotateX: -yp * 10, rotateY: xp * 10,
          transformPerspective: 800,
          translateZ: 16,
          boxShadow: `${-xp * 20}px ${-yp * 20}px 50px rgba(108,76,255,0.15)`,
          duration: 0.4, ease: 'power2.out', overwrite: 'auto'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0, rotateY: 0, translateZ: 0,
          boxShadow: 'var(--p-shadow-sm)',
          duration: 0.6, ease: 'power3.out', overwrite: 'auto'
        });
      });
    });
  }

  /* Dynamic Injection of Micro-Animations/Decorations into All Sections (across all pages) */
  function injectSectionMicroDecorations() {
    if (NO_MOTION) return;

    const sections = gsap.utils.toArray('.p-section, .p-page-hero, .p-hero');

    const sparkSvg = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%;"><path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"/></svg>';
    const matrixSvg = '<svg viewBox="0 0 100 100" style="width:80px;height:80px;"><circle cx="10" cy="10" r="3" fill="var(--p-accent)"/><circle cx="50" cy="10" r="3" fill="var(--p-accent)"/><circle cx="90" cy="10" r="3" fill="var(--p-accent)"/><circle cx="10" cy="50" r="3" fill="var(--p-accent)"/><circle cx="50" cy="50" r="3" fill="var(--p-accent)"/><circle cx="90" cy="50" r="3" fill="var(--p-accent)"/><circle cx="10" cy="90" r="3" fill="var(--p-accent)"/><circle cx="50" cy="90" r="3" fill="var(--p-accent)"/><circle cx="90" cy="90" r="3" fill="var(--p-accent)"/></svg>';
    const ringSvg = '<svg viewBox="0 0 100 100" style="width:130px;height:130px;"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(108,76,255,0.08)" stroke-width="1.5"/><circle cx="50" cy="50" r="30" fill="none" stroke="rgba(56,189,248,0.1)" stroke-width="1" stroke-dasharray="3 3"/><circle cx="90" cy="50" r="4" fill="var(--p-accent)"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="12s" repeatCount="indefinite"/></circle><circle cx="80" cy="50" r="3" fill="#38bdf8"><animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="8s" repeatCount="indefinite"/></circle></svg>';

    function ensure(sec, className, styles, html) {
      const selector = '.' + className.trim().split(/\s+/).join('.');
      if (sec.querySelector(selector)) return null;
      const el = document.createElement('div');
      el.className = className;
      Object.assign(el.style, styles);
      if (html) el.innerHTML = html;
      sec.insertBefore(el, sec.firstChild);
      return el;
    }

    sections.forEach((sec, idx) => {
      const pos = window.getComputedStyle(sec).position;
      if (pos === 'static' || !pos) sec.style.position = 'relative';

      const mod = idx % 4;

      if (!sec.querySelector('.bp-deco-spark') && !sec.querySelector('.bp-dot-matrix') && !sec.querySelector('.bp-orbit-ring')) {
        if (mod === 0) {
          ensure(sec, 'bp-deco-spark', { top: '12%', left: '6%' }, sparkSvg);
          ensure(sec, 'bp-dot-matrix', { bottom: '10%', right: '5%' }, matrixSvg);
        } else if (mod === 1) {
          ensure(sec, 'bp-orbit-ring', { top: '15%', right: '8%' }, ringSvg);
          ensure(sec, 'bp-deco-spark alt', { bottom: '12%', left: '7%' }, sparkSvg);
        } else {
          ensure(sec, 'bp-deco-spark', { top: '8%', right: '10%' }, sparkSvg);
          ensure(sec, 'bp-deco-spark alt', { bottom: '15%', left: '9%' }, sparkSvg);
        }
      }

      const orbA = ensure(sec, 'bp-mini-orb orb-a', { top: mod % 2 === 0 ? '18%' : '68%', left: mod % 2 === 0 ? '12%' : '8%' });
      const orbB = ensure(sec, 'bp-mini-orb orb-b', { top: mod % 2 === 0 ? '72%' : '22%', right: mod % 2 === 0 ? '11%' : '14%' });
      const dash = ensure(sec, 'bp-motion-dash', { top: mod < 2 ? '28%' : '78%', right: mod < 2 ? '22%' : '18%' });
      const bracket = ensure(sec, 'bp-corner-bracket', { bottom: mod % 2 === 0 ? '18%' : '12%', left: mod % 2 === 0 ? '18%' : '72%' });
      const scan = ensure(sec, 'bp-scan-line', { top: mod % 2 === 0 ? '34%' : '62%' });

      [orbA, orbB, dash, bracket, scan].forEach((el, localIdx) => {
        if (!el) return;
        el.style.setProperty('--bp-delay', ((idx % 5) * 0.35 + localIdx * 0.18) + 's');
        el.style.setProperty('--bp-drift', idx % 2 === 0 ? '1' : '-1');
      });
    });
  }

  /* ── Parallax sections ── */
  function initParallax() {
    if (NO_MOTION) return;

    /* Orb parallax in hero */
    gsap.utils.toArray('.p-orb').forEach((orb, i) => {
      const dir = i % 2 === 0 ? -60 : 60;
      gsap.to(orb, {
        scrollTrigger: { trigger: '.p-hero', scrub: 1.5 },
        y: dir, ease: 'none'
      });
    });

    /* Background aurora shift per alt-section */
    gsap.utils.toArray('.p-section.alt').forEach(sec => {
      gsap.to(sec, {
        scrollTrigger: { trigger: sec, scrub: 2 },
        backgroundPosition: '50% 80%', ease: 'none'
      });
    });

    /* Globe panel subtle rise */
    const globe = document.querySelector('.p-globe-panel');
    if (globe) {
      gsap.from(globe, {
        scrollTrigger: { trigger: globe, start: 'top 80%' },
        y: 40, opacity: 0
      });
    }

    /* Global background micro-elements parallax */
    gsap.utils.toArray('.p-section, .p-page-hero, .p-hero').forEach(sec => {
      const sparks = sec.querySelectorAll('.bp-deco-spark');
      const matrix = sec.querySelectorAll('.bp-dot-matrix');
      const rings = sec.querySelectorAll('.bp-orbit-ring');
      const subtle = sec.querySelectorAll('.bp-mini-orb, .bp-motion-dash, .bp-corner-bracket, .bp-scan-line');

      sparks.forEach((spark, idx) => {
        gsap.to(spark, {
          scrollTrigger: {
            trigger: sec,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          },
          y: idx % 2 === 0 ? -40 : 40,
          ease: 'none'
        });
      });

      matrix.forEach(mat => {
        gsap.to(mat, {
          scrollTrigger: {
            trigger: sec,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          },
          y: -35,
          ease: 'none'
        });
      });

      rings.forEach(ring => {
        gsap.to(ring, {
          scrollTrigger: {
            trigger: sec,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.8
          },
          y: -50,
          ease: 'none'
        });
      });

      subtle.forEach((el, idx) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: sec,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.6
          },
          x: idx % 2 === 0 ? 18 : -18,
          y: idx % 3 === 0 ? -28 : 22,
          ease: 'none'
        });
      });
    });
  }

  /* ── Stepper Scroll Scrub ── */
  function initStepperScrub() {
    if (NO_MOTION) return;
    const stepper = document.querySelector('.p-stepper');
    if (!stepper) return;

    const steps = gsap.utils.toArray('.p-step');
    const lines = gsap.utils.toArray('.p-step-line');

    if (window.innerWidth >= 900) {
      // Desktop: precise timeline linked to scroll scrub
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stepper,
          start: 'top 80%',
          end: 'bottom 55%',
          scrub: 1
        }
      });

      steps.forEach((step, i) => {
        const icon = step.querySelector('.p-step-icon');
        if (icon) {
          gsap.set(icon, { transition: 'none' });
        }

        // Step reveals
        tl.fromTo(step,
          { opacity: 0.25, y: 15 },
          { opacity: 1, y: 0, duration: 0.5 },
          i * 1.5
        );
        tl.fromTo(icon,
          { scale: 0.8, boxShadow: '0 0 0 rgba(108,76,255,0)' },
          { scale: 1.15, boxShadow: '0 0 24px rgba(108,76,255,0.4)', duration: 0.3 },
          i * 1.5
        );
        tl.to(icon, { scale: 1, duration: 0.2 }, (i * 1.5) + 0.3);

        // Draw connecting line to next step
        if (i < steps.length - 1 && lines[i]) {
          tl.fromTo(lines[i],
            { scaleX: 0, transformOrigin: 'left' },
            { scaleX: 1, duration: 0.8, ease: 'none' },
            (i * 1.5) + 0.5
          );
        }
      });
    } else {
      // Mobile: basic individual scroll scrub reveals
      steps.forEach((step) => {
        gsap.fromTo(step,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: step,
              start: 'top 90%',
              end: 'top 75%',
              scrub: 1
            }
          }
        );
      });
    }
  }

  /* ── Magnetic buttons (enhanced) ── */
  function initMagnetic() {
    if (NO_MOTION) return;
    document.querySelectorAll('.p-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 20;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 10;
        gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)', overwrite: 'auto' });
      });
      /* Press feedback */
      btn.addEventListener('mousedown', () => gsap.to(btn, { scale: 0.94, duration: 0.12 }));
      btn.addEventListener('mouseup', () => gsap.to(btn, { scale: 1, duration: 0.3, ease: 'elastic.out(1,0.4)' }));
    });
  }

  /* ── Final CTA animated gradient ── */
  function initCTASection() {
    const cta = document.querySelector('.p-final');
    if (!cta || NO_MOTION) return;
    gsap.fromTo(cta, { backgroundPosition: '0% 50%' }, {
      scrollTrigger: { trigger: cta, scrub: 2 },
      backgroundPosition: '100% 50%', ease: 'none'
    });
    /* Reveal */
    gsap.from('.p-final-inner > *', {
      scrollTrigger: { trigger: cta, start: 'top 75%' },
      opacity: 0, y: 40, stagger: 0.15, duration: 0.9, ease: 'power4.out'
    });
  }

  /* ── Nav shrink & active link highlight ── */
  function initNav() {
    const nav = document.querySelector('.p-nav');
    if (!nav) return;
    ScrollTrigger.create({
      start: 'top -60',
      onUpdate: self => {
        nav.classList.toggle('scrolled', self.scroll() > 60);
      }
    });
  }

  /* ── Cursor morphing (enhanced) ── */
  function initCursorMorph() {
    if (NO_MOTION) return;
    if (window.matchMedia('(hover:none),(pointer:coarse)').matches) return;
    const ring = document.getElementById('bp-cursor-ring');
    const dot = document.getElementById('bp-cursor-dot');
    if (!ring || !dot) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let visible = false;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (!visible) {
        visible = true;
        gsap.to([ring, dot], {  opacity: 1, duration: 0.3 });
      }
    });

    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      gsap.set(ring, { x: rx - 20, y: ry - 20 });
      gsap.set(dot, { x: mx - 4, y: my - 4 });
    });

    const hoverEls = 'a, button, .p-practice-card, .p-tile, .p-pill, input, select, textarea';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverEls)) {
        gsap.to(ring, { scale: 1.8, borderColor: 'var(--accent)', duration: 0.3 });
        gsap.to(dot, { scale: 0, duration: 0.2 });
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverEls)) {
        gsap.to(ring, { scale: 1, borderColor: 'rgba(108,76,255,0.5)', duration: 0.3 });
        gsap.to(dot, { scale: 1, duration: 0.2 });
      }
    });
  }

  /* ── Particles canvas ── */
  function initParticles() {
    const canvas = document.getElementById('bp-particles');
    if (!canvas || NO_MOTION) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = 700;
    window.addEventListener('resize', () => { W = canvas.width = window.innerWidth; });

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.5 + 0.15
    }));

    let mouseX = W / 2, mouseY = H / 2;
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          p.vx -= (dx / dist) * 0.04;
          p.vy -= (dy / dist) * 0.04;
        }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108,76,255,${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Blob morphing SVG ── */
  function initBlobs() {
    const blobs = document.querySelectorAll('.bp-blob');
    if (!blobs.length || NO_MOTION) return;
    blobs.forEach((blob, i) => {
      gsap.to(blob, {
        scale: 1.15,
        x: i % 2 === 0 ? 30 : -30,
        y: i % 2 === 0 ? -20 : 20,
        duration: 5 + i * 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.8
      });
    });
  }

  /* ── Lateral motion lanes ── */
  function initLateralMotionSection() {
    if (NO_MOTION) return;
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.utils.toArray('.bp-lateral-motion-section').forEach(section => {
      const topLane = section.querySelector('.bp-lateral-lane.lane-top');
      const bottomLane = section.querySelector('.bp-lateral-lane.lane-bottom');
      if (!topLane || !bottomLane) return;

      gsap.fromTo(topLane,
        { xPercent: -8 },
        {
          xPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4
          }
        }
      );

      gsap.fromTo(bottomLane,
        { xPercent: 8 },
        {
          xPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4
          }
        }
      );
    });
  }

  /* ── Morphing SVG/DOM Network ── */
  function initMorphingNetwork() {
    const container = document.querySelector('.bp-morph-container');
    if (!container) return;

    const strategy = container.querySelector('.node-strategy');
    const research = container.querySelector('.node-research');
    const creative = container.querySelector('.node-creative');
    const marketing = container.querySelector('.node-marketing');
    const core = container.querySelector('.bp-node-core');
    const siloRings = container.querySelectorAll('.bp-silo-ring');
    const netLines = container.querySelectorAll('.bp-net-line');
    const coreGlow = container.querySelector('.bp-core-glow');

    const splitEl = container.querySelector('.bp-morph-split');
    const leftCol = container.querySelector('.bp-morph-left');
    const rightCol = container.querySelector('.bp-morph-right');

    if (!strategy || !research || !creative || !marketing) return;

    // Calculate centering translation for right visual column on desktop
    let translateX = 0;
    const isDesktop = window.innerWidth >= 900;
    if (isDesktop && rightCol && splitEl && leftCol) {
      const rectSplit = splitEl.getBoundingClientRect();
      const rectRight = rightCol.getBoundingClientRect();
      const centerSplit = rectSplit.left + rectSplit.width / 2;
      const centerRight = rectRight.left + rectRight.width / 2;
      translateX = centerSplit - centerRight;

      // Set initial centered / invisible state
      gsap.set(rightCol, { x: translateX });
      gsap.set(leftCol, { opacity: 0, x: -40 });
    }

    const cards = container.querySelectorAll('.bp-morph-card');
    if (cards.length === 2) {
      // Card 1 (Traditional) is always active/visible on top
      gsap.set(cards[0], { opacity: 1, y: 0, pointerEvents: 'auto' });
      // Card 2 (Bridgpoint Model) starts hidden
      gsap.set(cards[1], { opacity: 0, y: 40, pointerEvents: 'none' });
    }

    // Set initial absolute percentage positions (scattered)
    gsap.set(strategy, { left: '22%', top: '22%' });
    gsap.set(research, { left: '78%', top: '22%' });
    gsap.set(creative, { left: '22%', top: '78%' });
    gsap.set(marketing, { left: '78%', top: '78%' });

    // Core centering + hidden scale
    gsap.set(core, { xPercent: -50, yPercent: -50, scale: 0 });

    // GSAP ScrollTrigger timeline - Scrubbed scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.bp-morph-container',
        start: 'top 15%',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: self => {
          // Dynamically swap sublabels
          if (self.progress > 0.45) {
            strategy.querySelector('.node-sub').textContent = 'Connected';
            research.querySelector('.node-sub').textContent = 'Connected';
            creative.querySelector('.node-sub').textContent = 'Connected';
            marketing.querySelector('.node-sub').textContent = 'Connected';
          } else {
            strategy.querySelector('.node-sub').textContent = 'Consultants';
            research.querySelector('.node-sub').textContent = 'Researchers';
            creative.querySelector('.node-sub').textContent = 'Agencies';
            marketing.querySelector('.node-sub').textContent = 'Digital';
          }
        }
      }
    });

    // Animate right column gliding from center to its grid cell
    if (isDesktop && rightCol) {
      tl.fromTo(rightCol, { x: translateX }, { x: 0, duration: 1.2, ease: 'power2.inOut' }, 0);
    }
    // Animate left copy columns fading and sliding in
    if (isDesktop && leftCol) {
      tl.fromTo(leftCol, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 1.0, ease: 'power2.out' }, 0.2);
    }
    // Animate Card 2 fading and sliding up directly below Card 1
    if (cards.length === 2) {
      tl.fromTo(cards[1],
        { opacity: 0, y: 40, pointerEvents: 'none' },
        { opacity: 1, y: 0, pointerEvents: 'auto', duration: 1.0, ease: 'power2.out' },
        0.4
      );
    }

    // Morph DOM Positions to unified diamond shape with explicit fromTo values
    tl.fromTo(strategy, { left: '22%', top: '22%' }, { left: '50%', top: '20%', duration: 1.2, ease: 'power2.inOut' }, 0)
      .fromTo(research, { left: '78%', top: '22%' }, { left: '80%', top: '50%', duration: 1.2, ease: 'power2.inOut' }, 0)
      .fromTo(creative, { left: '22%', top: '78%' }, { left: '20%', top: '50%', duration: 1.2, ease: 'power2.inOut' }, 0)
      .fromTo(marketing, { left: '78%', top: '78%' }, { left: '50%', top: '80%', duration: 1.2, ease: 'power2.inOut' }, 0);

    // Fade out scattered silos, scale in central core + diamond networks
    tl.fromTo(siloRings, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.5, duration: 0.8, ease: 'power2.inOut' }, 0)
      .fromTo(core, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.5)' }, 0.4)
      .fromTo(coreGlow, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.4)
      .fromTo(netLines, { opacity: 0 }, { opacity: 0.8, duration: 1.0, ease: 'power2.out', stagger: 0.05 }, 0.2);

    // Scroll parallax on background SVG relative to foreground nodes
    const svgEl = container.querySelector('.bp-morph-svg');
    if (svgEl) {
      tl.fromTo(svgEl, { y: -25 }, { y: 25, ease: 'none' }, 0);
    }

    // Mouse-interactive 3D tilt effect on hover
    const visual = container.querySelector('.bp-morph-visual');
    if (rightCol && visual) {
      rightCol.addEventListener('mousemove', e => {
        const rect = rightCol.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Tilt percentages from center (-0.5 to 0.5)
        const tiltX = (x / rect.width) - 0.5;
        const tiltY = (y / rect.height) - 0.5;

        // Tilt bounds (max rotation 18 degrees)
        const rotX = -tiltY * 36;
        const rotY = tiltX * 36;

        gsap.to(visual, {
          rotateX: rotX,
          rotateY: rotY,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      rightCol.addEventListener('mouseleave', () => {
        gsap.to(visual, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    }
  }

  /* ── Logo marquee mouse-speed ── */
  function initMarquee() {
    const track = document.querySelector('.p-marquee-track');
    if (!track) return;
    let speed = 26;
    window.addEventListener('mousemove', () => {
      speed = 14;
      clearTimeout(window._marqueeTimer);
      window._marqueeTimer = setTimeout(() => { speed = 26; }, 1000);
    });
  }

  /* ── Challenge Pills Scroll Scrub ── */
  function initPillsScrub() {
    if (NO_MOTION) return;
    const pills = gsap.utils.toArray('.p-pill');
    if (!pills.length) return;

    pills.forEach((pill, i) => {
      const fromLeft = i % 2 === 0;
      gsap.fromTo(pill,
        {
          opacity: 0,
          x: fromLeft ? -45 : 45,
          scale: 0.93
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          scrollTrigger: {
            trigger: pill,
            start: 'top 92%',
            end: 'top 75%',
            scrub: 1.2
          }
        }
      );
    });
  }

  /* ── Text Highlight Scroll Scrub ── */
  function initTextHighlightScrub() {
    if (NO_MOTION) return;
    if (typeof SplitType === 'undefined') return;

    const els = document.querySelectorAll('.p-scroll-highlight');
    els.forEach(el => {
      const split = new SplitType(el, { types: 'words' });
      gsap.fromTo(split.words,
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'top 32%',
            scrub: 1
          }
        }
      );
    });
  }

  /* ── Practice Cards Scroll Scrub (Parallax + Clip path reveal) ── */
  function initPracticeCardsScrub() {
    if (NO_MOTION) return;
    const cards = gsap.utils.toArray('.p-practice-card');
    if (!cards.length) return;

    cards.forEach((card, i) => {
      const photo = card.querySelector('.p-practice-photo');
      const img = card.querySelector('.p-practice-photo img');

      // Parallax card sliding entry
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 70%',
            scrub: 1
          }
        }
      );

      if (img && photo) {
        // Enlarge image to give space for parallax translation
        gsap.set(img, { scale: 1.25, yPercent: -15, transformOrigin: 'center center', transition: 'none' });

        // Clip-path diagonal or vertical wipe reveal
        gsap.fromTo(img,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            scrollTrigger: {
              trigger: photo,
              start: 'top 85%',
              end: 'bottom 65%',
              scrub: 1
            }
          }
        );

        // Slow parallax scroll shift inside the frame
        gsap.to(img, {
          yPercent: 15,
          scrollTrigger: {
            trigger: photo,
            start: 'top 95%',
            end: 'bottom 15%',
            scrub: true
          }
        });
      }
    });
  }

  /* ── Metric Cards Scroll Scrub (directional entry) ── */
  function initMetricsScrub() {
    if (NO_MOTION) return;
    const cards = gsap.utils.toArray('.p-metric-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      const dir = card.dataset.metricDir || 'down';
      const from = dir === 'left' ? { opacity: 0, x: -60, y: 0, scale: 0.92 }
        : dir === 'right' ? { opacity: 0, x: 60, y: 0, scale: 0.92 }
          : { opacity: 0, x: 0, y: 40, scale: 0.94 };

      gsap.fromTo(card, from,
        {
          opacity: 1, x: 0, y: 0, scale: 1,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 68%',
            scrub: 1.2
          }
        }
      );
    });
  }

  /* ── Floating Insight Card Scroll Scrub ── */
  function initInsightCard() {
    if (NO_MOTION) return;
    if (window.innerWidth < 900) return;

    const card = document.querySelector('#bp-insight-card');
    const section = document.querySelector('#bp-metrics-section');
    if (!card || !section) return;

    const numEl = card.querySelector('.bp-insight-number');
    const sublabel = card.querySelector('.bp-insight-sublabel');
    const sparkLine = card.querySelector('.bp-spark-line');
    const tags = card.querySelectorAll('.bp-insight-tags span');

    // ── Phase 1: card slides in from right edge (scrubbed to scroll) ──
    gsap.fromTo(card,
      { xPercent: 130, opacity: 0 },
      {
        xPercent: 0,
        opacity: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          end: 'top 30%',
          scrub: 1.4
        }
      }
    );

    // ── Phase 2: interior elements animate once card is ~in position ──
    ScrollTrigger.create({
      trigger: section,
      start: 'top 40%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();

        // Big number counts up
        tl.to(numEl, {
          opacity: 1, y: 0, duration: 0.55, ease: 'power3.out'
        }, 0);

        // Sublabel fades in
        tl.to(sublabel, {
          opacity: 1, duration: 0.4, ease: 'power2.out'
        }, 0.18);

        // Sparkline draws itself
        if (sparkLine) {
          tl.to(sparkLine, {
            strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut'
          }, 0.3);
        }

        // Tags stagger up
        tl.to(tags, {
          opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)', stagger: 0.06
        }, 0.55);

        // Trigger the shine sweep
        tl.call(() => {
          card.classList.add('bp-shine');
          setTimeout(() => card.classList.remove('bp-shine'), 950);
        }, null, 0.45);
      }
    });

    // ── Phase 3: subtle float while section is in view ──
    ScrollTrigger.create({
      trigger: section,
      start: 'top 30%',
      end: 'bottom 70%',
      onUpdate: (self) => {
        // Gentle Y drift tied to scroll progress
        gsap.to(card, {
          y: self.progress * -22,
          duration: 0.4,
          ease: 'none',
          overwrite: 'auto'
        });
      }
    });
  }

  /* ── SVG Globe Connection Lines Scroll Scrub ── */
  function initGlobeScrub() {
    if (NO_MOTION) return;
    const panel = document.querySelector('.p-globe-panel');
    if (!panel) return;

    const lines = panel.querySelectorAll('.p-globe-line');
    const nodes = panel.querySelectorAll('.p-globe-node:not(.hi)');
    const mainNode = panel.querySelector('.p-globe-node.hi');
    const pulse = panel.querySelector('.p-globe-pulse');

    // The SVG paths use pathLength="1" — dash coords are normalised to [0, 1].
    // The CSS transition has been removed from .p-globe-line so GSAP scrub has
    // full control. Reset to pathLength-space initial state (hidden).
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });

    // SVG circles need svgOrigin (user-unit coords) not 'center'
    nodes.forEach(node => {
      const cx = parseFloat(node.getAttribute('cx')) || 0;
      const cy = parseFloat(node.getAttribute('cy')) || 0;
      gsap.set(node, { svgOrigin: `${cx} ${cy}`, scale: 0, opacity: 0 });
    });
    if (mainNode) {
      const cx = parseFloat(mainNode.getAttribute('cx')) || 0;
      const cy = parseFloat(mainNode.getAttribute('cy')) || 0;
      gsap.set(mainNode, { svgOrigin: `${cx} ${cy}`, scale: 0.5 });
    }
    if (pulse) gsap.set(pulse, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top 82%',
        end: 'bottom 45%',
        scrub: 1.5
      }
    });

    // 1 — Draw connection paths scrubbed to scroll (pathLength space: 1 → 0)
    tl.to(lines, {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: 'power2.inOut',
      stagger: 0.15
    }, 0);

    // 2 — MEA hub node scales up first
    if (mainNode) {
      tl.to(mainNode, {
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)'
      }, 0.2);
    }

    // 3 — Regional endpoint nodes pop in once paths are ~halfway drawn
    tl.to(nodes, {
      scale: 1, opacity: 1,
      duration: 0.5,
      ease: 'back.out(1.8)',
      stagger: 0.12
    }, 0.9);

    // 4 — Pulse ring fades in, then activate CSS pulse loop via dedicated class
    //     (using bp-globe-pulse-active, NOT in-view, so the in-view CSS rule's
    //      stroke-dashoffset:0 override can never conflict with the scrub tween)
    if (pulse) {
      tl.to(pulse, {
        opacity: 1, duration: 0.4, ease: 'power2.out',
        onComplete: () => panel.classList.add('bp-globe-pulse-active')
      }, 1.5);
    } else {
      tl.call(() => panel.classList.add('bp-globe-pulse-active'), null, 1.5);
    }
  }

  /* Helper to format slug to page name */
  function getPageTitleFromSlug(slug) {
    if (!slug || slug === 'index' || slug === '') return 'Home';
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /* ── Page transition (staggered bars with page name) ── */
  function initPageTransitions() {
    if (NO_MOTION) return;
    const overlay = document.getElementById('bp-page-overlay');
    if (!overlay) return;
    const transitionKey = PAGE_TRANSITION_KEY;

    const readTransitionFlag = () => {
      try {
        return sessionStorage.getItem(transitionKey) === '1';
      } catch (_) {
        return false;
      }
    };

    const setTransitionFlag = () => {
      try {
        sessionStorage.setItem(transitionKey, '1');
      } catch (_) { }
    };

    const clearTransitionFlag = () => {
      try {
        sessionStorage.removeItem(transitionKey);
      } catch (_) { }
    };

    const currentSlug = location.pathname.split('/').pop().replace('.html', '');
    const currentTitle = getPageTitleFromSlug(currentSlug);
    const shouldPlayEnter = readTransitionFlag();
    clearTransitionFlag();

    const barDuration = 0.7;
    const barStagger = 0.055;
    const barEase = 'power3.inOut';
    const textDuration = 0.3;

    const bg = overlay.querySelector('.bp-transition-bg');
    const bars = gsap.utils.toArray(overlay.querySelectorAll('.bp-transition-bar'));
    const textGroup = overlay.querySelector('.bp-transition-content');
    const eyebrow = overlay.querySelector('.bp-transition-eyebrow');
    const pagename = overlay.querySelector('.bp-transition-pagename');
    let isTransitioning = false;

    const transitionEls = [bg, textGroup, eyebrow, pagename, ...bars];

    const showOverlay = () => {
      overlay.style.visibility = 'visible';
      overlay.style.pointerEvents = 'all';
    };

    const hideOverlay = () => {
      overlay.style.pointerEvents = 'none';
      overlay.style.visibility = 'hidden';
      gsap.killTweensOf(transitionEls);
      gsap.set(bg, { opacity: 0 });
      gsap.set(bars, { yPercent: 100 });
      gsap.set(textGroup, { opacity: 0, y: 0 });
      gsap.set(eyebrow, { opacity: 0, y: 15 });
      gsap.set(pagename, { opacity: 0, y: 20 });
      isTransitioning = false;
    };

    if (!shouldPlayEnter) {
      hideOverlay();
    } else {
      showOverlay();
      gsap.set(bg, { opacity: 0 });
      gsap.set(bars, { yPercent: 0 });
      gsap.set(textGroup, { opacity: 1, y: 0 });
      gsap.set(eyebrow, { opacity: 1, y: 0 });
      gsap.set(pagename, { opacity: 1, y: 0 });

      let enterFallback;
      const finishEnter = () => {
        clearTimeout(enterFallback);
        hideOverlay();
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      };

      const inTl = gsap.timeline({ onComplete: finishEnter });
      enterFallback = setTimeout(finishEnter, 1800);

      inTl.to(eyebrow, { opacity: 0, y: -15, duration: textDuration, ease: 'power2.in' }, 0);
      inTl.to(pagename, { opacity: 0, y: -20, duration: textDuration, ease: 'power2.in' }, 0.05);
      inTl.to(bars, { yPercent: -100, duration: barDuration, ease: barEase, stagger: barStagger }, 0.2);
    }

    window.addEventListener('pageshow', event => {
      if (event.persisted) {
        clearTransitionFlag();
        hideOverlay();
      }
    });

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      if (link.getAttribute('target') === '_blank' || link.hasAttribute('download')) return;

      let destination;
      try {
        destination = new URL(href, location.href);
      } catch (_) {
        return;
      }

      if (destination.origin !== location.origin) return;

      link.addEventListener('click', e => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (destination.pathname === location.pathname && destination.search === location.search) return;
        if (isTransitioning) return;

        isTransitioning = true;
        e.preventDefault();
        showOverlay();
        gsap.killTweensOf(transitionEls);

        let nextName = link.getAttribute('data-transition-text') || link.textContent.trim().replace(/\s+/g, ' ');
        if (!nextName || nextName.length > 20 || link.classList.contains('p-nav-logo') || link.querySelector('img')) {
          const targetSlug = destination.pathname.split('/').pop().replace('.html', '');
          nextName = getPageTitleFromSlug(targetSlug);
        }

        pagename.textContent = nextName;

        gsap.set(bg, { opacity: 0 });
        gsap.set(bars, { yPercent: 100 });
        gsap.set(textGroup, { opacity: 1, y: 0 });
        gsap.set(eyebrow, { opacity: 0, y: 15 });
        gsap.set(pagename, { opacity: 0, y: 20 });

        let navFallback;
        let didNavigate = false;
        const navigate = () => {
          if (didNavigate) return;
          didNavigate = true;
          clearTimeout(navFallback);
          setTransitionFlag();
          window.location.href = destination.href;
        };

        const outTl = gsap.timeline({ onComplete: navigate });
        navFallback = setTimeout(navigate, 1800);

        outTl.to(bars, { yPercent: 0, duration: barDuration, ease: barEase, stagger: barStagger }, 0);
        outTl.to(eyebrow, { opacity: 1, y: 0, duration: textDuration, ease: 'power2.out' }, 0.22);
        outTl.to(pagename, { opacity: 1, y: 0, duration: textDuration, ease: 'power2.out' }, 0.28);
      });
    });
  }

  /* ── Scroll indicator bounce ── */
  function initScrollIndicator() {
    const ind = document.querySelector('.bp-scroll-indicator');
    if (!ind || NO_MOTION) return;
    gsap.to(ind, { y: 10, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    ScrollTrigger.create({
      start: 'top -100',
      onUpdate: self => { ind.style.opacity = self.scroll() > 100 ? '0' : '1'; }
    });
  }

  /* ── Inject breathing aurora into every .p-final that lacks one ── */
  function initGlobalCTAAurora() {
    if (NO_MOTION) return;
    document.querySelectorAll('.p-final').forEach(el => {
      if (el.querySelector('.bp-cta-aurora')) return; // already present
      const aurora = document.createElement('div');
      aurora.className = 'bp-cta-aurora';
      aurora.setAttribute('aria-hidden', 'true');
      el.insertBefore(aurora, el.firstChild);
    });
  }

  /* ── Master init ── */
  function initAll() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    initLenis();
    initHero();
    injectSectionMicroDecorations(); // must run before initParallax so elements exist
    initGlobalCTAAurora();           // inject aurora into every Final CTA across all pages
    initScrollReveals();
    initSectionHeadings();
    initCardTilt();
    initParallax();
    initStepperScrub();
    initPillsScrub();
    initTextHighlightScrub();
    initPracticeCardsScrub();
    initMetricsScrub();
    initInsightCard();
    initGlobeScrub();
    initMagnetic();
    initCTASection();
    initNav();
    initCursorMorph();
    initParticles();
    initBlobs();
    initLateralMotionSection();
    initMorphingNetwork();
    initMarquee();
    initPageTransitions();
    initScrollIndicator();
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }

})();
