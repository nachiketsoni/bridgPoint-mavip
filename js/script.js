/* ===================================================================
   BRIDGPOINT — CONCEPT REDESIGN — script.js
   Lenis smooth scroll + GSAP/ScrollTrigger storytelling + two Canvas2D
   scenes + one shared Three.js WebGL scene (hero -> converge section).
   =================================================================== */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* =================================================================
     LENIS SMOOTH SCROLL
     ================================================================= */
  var lenis = new Lenis({
    duration: 1.15,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    wheelMultiplier: 1
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;

  /* =================================================================
     PRELOADER
     ================================================================= */
  (function preloader() {
    var fill = document.getElementById('loaderFill');
    var count = document.getElementById('loaderCount');
    var loader = document.getElementById('loader');
    var obj = { v: 0 };

    lenis.stop();

    var tl = gsap.timeline({
      onComplete: function () {
        document.body.classList.remove('r-loading');
        lenis.start();
        gsap.to(loader, {
          yPercent: -100, duration: 0.9, ease: 'power4.inOut',
          onComplete: function () { loader.style.display = 'none'; }
        });
        revealHero();
        initScrollAnimations();
        ScrollTrigger.refresh();
      }
    });

    tl.to(obj, {
      v: 100, duration: reducedMotion ? 0.4 : 1.8, ease: 'power2.inOut',
      onUpdate: function () {
        var v = Math.floor(obj.v);
        fill.style.width = v + '%';
        count.textContent = v;
      }
    });
  })();

  /* =================================================================
     HERO REVEAL (runs once, after preloader clears)
     ================================================================= */
  function revealHero() {
    var tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'power4.out' } });
    tl.to('.r-hero-top', { opacity: 1, duration: 0.7 }, 0)
      .from('.r-hero-line-inner', { yPercent: 120, duration: 1.1, stagger: 0.12 }, 0.1)
      .from('.r-hero-sub', { opacity: 0, y: 24, duration: 0.9 }, 0.55)
      .from('.r-hero-actions .r-btn', { opacity: 0, y: 18, duration: 0.8, stagger: 0.1 }, 0.65)
      .from('.r-scroll-cue', { opacity: 0, duration: 0.8 }, 0.9);
  }
  gsap.set('.r-hero-top', { opacity: 0 });

  /* =================================================================
     NAV — scroll state, hide-on-scroll-down, burger menu
     ================================================================= */
  (function nav() {
    var navEl = document.getElementById('siteNav');
    var burger = document.getElementById('navBurger');
    var menu = document.getElementById('mobileMenu');
    var lastY = 0;

    lenis.on('scroll', function (e) {
      var y = e.scroll;
      navEl.classList.toggle('is-scrolled', y > 40);
      if (y > lastY && y > 200) navEl.classList.add('is-hidden');
      else navEl.classList.remove('is-hidden');
      lastY = y;
    });

    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-active', open);
      document.documentElement.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        burger.classList.remove('is-active');
      });
    });

    document.querySelectorAll('[data-scroll-to]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        lenis.scrollTo(btn.getAttribute('data-scroll-to'), { offset: -90, duration: 1.3 });
      });
    });
  })();

  /* =================================================================
     CUSTOM CURSOR + MAGNETIC BUTTONS
     ================================================================= */
  (function cursor() {
    if (window.matchMedia('(hover:none)').matches) return;

    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    var label = document.getElementById('cursorLabel');

    var dotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' });
    var dotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' });
    var ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
    var ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

    window.addEventListener('mousemove', function (e) {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    });

    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest('a, button, [data-magnetic]');
      if (!el) return;
      ring.classList.add('is-active');
      label.textContent = el.getAttribute('data-cursor-text') || '';
    });
    document.addEventListener('mouseout', function (e) {
      var el = e.target.closest('a, button, [data-magnetic]');
      if (!el) return;
      ring.classList.remove('is-active');
      label.textContent = '';
    });

    // Magnetic pull
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1,0.4)' });
      var my = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1,0.4)' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.35);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('mouseleave', function () { mx(0); my(0); });
    });
  })();

  /* =================================================================
     HERO PARTICLE FIELD — Canvas2D constellation, mouse-reactive
     ================================================================= */
  (function particleField() {
    var canvas = document.getElementById('particleCanvas');
    var ctx = canvas.getContext('2d');
    var section = document.getElementById('hero');
    var particles = [], w, h, dpr, raf, running = false;
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = section.offsetWidth;
      h = section.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(90, Math.floor((w * h) / 16000));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        var dx = mouse.x - p.x, dy = mouse.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) { p.x -= dx / dist * 0.6; p.y -= dy / dist * 0.6; }
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var ddx = p.x - q.x, ddy = p.y - q.y;
          var d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 118) {
            ctx.strokeStyle = 'rgba(108,76,255,' + (0.22 * (1 - d / 118)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(20,18,31,0.32)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    function start() { if (running || reducedMotion) return; running = true; tick(); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    window.addEventListener('mousemove', function (e) {
      var r = section.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    window.addEventListener('resize', debounce(resize, 200));

    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.01 }).observe(section);

    resize();
  })();

  /* =================================================================
     "OUR PERSPECTIVE" — flowing connective-line canvas
     ================================================================= */
  (function flowField() {
    var canvas = document.getElementById('flowCanvas');
    var section = document.getElementById('perspective');
    if (!canvas || !section) return;
    var ctx = canvas.getContext('2d');
    var w, h, dpr, raf, running = false, t = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = section.offsetWidth;
      h = section.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    var colors = ['rgba(124,92,255,0.5)', 'rgba(56,189,248,0.4)', 'rgba(236,73,153,0.3)'];

    function tick() {
      if (!running) return;
      t += 0.006;
      ctx.clearRect(0, 0, w, h);
      for (var line = 0; line < 3; line++) {
        ctx.beginPath();
        var amp = h * (0.06 + line * 0.03);
        var baseY = h * (0.3 + line * 0.22);
        for (var x = 0; x <= w; x += 12) {
          var y = baseY + Math.sin(x * 0.006 + t * (1 + line * 0.4) + line) * amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = colors[line];
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    }

    function start() { if (running || reducedMotion) return; running = true; tick(); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    window.addEventListener('resize', debounce(resize, 200));
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.01 }).observe(section);

    resize();
  })();

  /* =================================================================
     THREE.JS — shared WebGL scene (Hero core object -> Converge morph)
     ================================================================= */
  var Scene3D = (function () {
    var fallback = { convergeProgress: 0, _smoothed: 0, visible: false };
    if (reducedMotion || !window.THREE) return fallback;

    // WebGL isn't guaranteed (older devices, disabled GPU, some headless
    // environments) — degrade to the fallback stub instead of leaving
    // Scene3D undefined for the scroll-trigger code below to crash on.
    try {
      return build();
    } catch (err) {
      console.warn('Bridgpoint: WebGL scene unavailable, skipping 3D layer.', err);
      return fallback;
    }

    function build() {
      var canvas = document.getElementById('webglCanvas');
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 8);

      scene.add(new THREE.AmbientLight(0x8877ff, 0.6));
      var light1 = new THREE.PointLight(0x7c5cff, 3, 40); light1.position.set(5, 4, 6); scene.add(light1);
      var light2 = new THREE.PointLight(0x38bdf8, 2, 40); light2.position.set(-5, -3, 4); scene.add(light2);

      var world = new THREE.Group(); scene.add(world);

      // Starfield stays centred on the full canvas — it's faint ambience,
      // not a solid shape, so it can safely sit behind the copy.
      var starCount = 700;
      var starGeo = new THREE.BufferGeometry();
      var starPos = new Float32Array(starCount * 3);
      for (var i = 0; i < starCount; i++) {
        var r = 6 + Math.random() * 9;
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos((Math.random() * 2) - 1);
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i * 3 + 2] = r * Math.cos(phi);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.028, transparent: true, opacity: 0.5 });
      var stars = new THREE.Points(starGeo, starMat);
      world.add(stars);

      // The core + nodes live in their own group, offset to the right of
      // centre so the solid wireframe sits clear of the copy column (which
      // is left-aligned, max-width 640px). .r-webgl-fixed's clip-path masks
      // out the left portion of the canvas as a hard guarantee on top of this.
      var focal = new THREE.Group();
      focal.position.set(2.8, -0.1, 0);
      world.add(focal);

      // Core wireframe + subtle glass shell
      var core = new THREE.Group(); focal.add(core);
      var icoGeo = new THREE.IcosahedronGeometry(1.15, 1);
      var wireMat = new THREE.LineBasicMaterial({ color: 0x9c86ff, transparent: true, opacity: 0.55 });
      var wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(icoGeo), wireMat);
      core.add(wireframe);
      var shellMat = new THREE.MeshStandardMaterial({ color: 0x7c5cff, roughness: 0.25, metalness: 0.3, transparent: true, opacity: 0.14 });
      var shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), shellMat);
      core.add(shell);

      // Four orbiting "discipline" nodes — converge into the core on scroll.
      // Kept tight around the focal point (not the old wide scatter) so
      // they stay within the visible right-hand region throughout.
      var nodeColors = [0x7c5cff, 0x38bdf8, 0xec4899, 0xffd9a0];
      var scattered = [
        new THREE.Vector3(-1.7, 1.5, -1.0),
        new THREE.Vector3(1.9, -1.4, 0.6),
        new THREE.Vector3(-1.4, -1.7, 1.5),
        new THREE.Vector3(1.7, 1.6, -0.7)
      ];
      var nodes = nodeColors.map(function (c, i) {
        var mat = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.7, roughness: 0.3 });
        var mesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), mat);
        mesh.position.copy(scattered[i]);
        focal.add(mesh);
        return mesh;
      });

      function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      resize();
      window.addEventListener('resize', debounce(resize, 200));

      var mouseX = 0, mouseY = 0, rotX = 0, rotY = 0;
      window.addEventListener('mousemove', function (e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      });

      var api = { convergeProgress: 0, _smoothed: 0, visible: false };

      var labelEls = document.querySelectorAll('#convergeLabels [data-node]');
      var titleEl = document.getElementById('convergeTitle');
      var titleSwapped = false;
      var thresholds = [0.15, 0.4, 0.65, 0.9];

      // Crossfades the headline instead of snapping it instantly — the raw
      // innerHTML swap read as an abrupt, jarring change against the slow
      // 3D convergence happening around it.
      function swapTitle(html) {
        gsap.to(titleEl, {
          opacity: 0, y: -8, duration: 0.28, ease: 'power2.in',
          onComplete: function () {
            titleEl.innerHTML = html;
            gsap.fromTo(titleEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
          }
        });
      }

      function loop() {
        requestAnimationFrame(loop);
        if (!api.visible) return;

        api._smoothed += (api.convergeProgress - api._smoothed) * 0.08;
        var p = api._smoothed;

        // Parallax rotates the focal group in place (around its own offset
        // centre) rather than the whole world — orbiting world around the
        // scene origin would swing the offset sphere sideways and risk
        // drifting back over the copy on wide mouse movements.
        rotX += (mouseY * 0.16 - rotX) * 0.04;
        rotY += (mouseX * 0.22 - rotY) * 0.04;
        focal.rotation.x = rotX;
        focal.rotation.y = rotY;

        core.rotation.y += 0.0026 + p * 0.006;
        core.rotation.x += 0.0009;
        stars.rotation.y += 0.0006;

        camera.position.z = 8 - p * 2.6;

        shellMat.opacity = 0.14 + p * 0.34;
        wireMat.opacity = 0.55 + p * 0.35;

        nodes.forEach(function (mesh, i) {
          mesh.position.copy(scattered[i]).multiplyScalar(1 - p);
          mesh.scale.setScalar(1 - p * 0.55);
          mesh.material.emissiveIntensity = 0.7 + p * 1.2;
          if (labelEls[i]) labelEls[i].classList.toggle('is-active', p > thresholds[i]);
        });

        if (titleEl) {
          if (p > 0.55 && !titleSwapped) {
            titleSwapped = true;
            swapTitle('One team.<br>One point of view.');
          } else if (p <= 0.55 && titleSwapped) {
            titleSwapped = false;
            swapTitle('Four disciplines.<br>Working as one.');
          }
        }

        renderer.render(scene, camera);
      }
      loop();

      return api;
    } // end build()
  })();

  /* =================================================================
     WEBGL LAYER VISIBILITY — only while Converge is on screen.
     The hero and every other section are the brand's light theme, and
     a pale-purple wireframe barely reads against a white background —
     so the wireframe/starfield is reserved for the one deliberately
     dark section, where it actually has contrast to read against.
     That also makes it a single, stronger reveal moment rather than a
     continuous background element.
     ================================================================= */
  function webglVisibility() {
    var layer = document.getElementById('webglCanvas');

    // #converge isn't pinned, so it's on screen only as long as it takes
    // to scroll past — visible for that whole span, top-bottom to bottom-top.
    ScrollTrigger.create({
      trigger: '#converge', start: 'top bottom', end: 'bottom top',
      onToggle: function (self) {
        layer.classList.toggle('is-visible', self.isActive);
        Scene3D.visible = self.isActive;
      }
    });
  }

  /* =================================================================
     SCROLL-DRIVEN ANIMATION TIMELINES (built after preloader completes)
     ================================================================= */
  function initScrollAnimations() {

    // ---- generic fade-up reveal for section heads & misc blocks ----
    gsap.utils.toArray('.r-story-head, .r-flow-inner .r-eyebrow, .r-gallery-head, .r-stepper-head, .r-industries-head, .r-testimonials-inner > .r-eyebrow, .r-cta-title')
      .forEach(function (el) {
        gsap.from(el, {
          opacity: 0, y: 44, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        });
      });

    // ---- stepper rows: colour reveal (accent index + ink heading) instead
    //      of a fade — CSS transitions handle the actual animation off
    //      the .is-revealed class, staggered slightly per row ----
    ScrollTrigger.batch('.r-stepper-row', {
      start: 'top 90%',
      onEnter: function (els) {
        els.forEach(function (el, i) {
          gsap.delayedCall(i * 0.08, function () { el.classList.add('is-revealed'); });
        });
      }
    });
    ScrollTrigger.batch('.r-card', {
      start: 'top 92%',
      onEnter: function (els) { gsap.from(els, { opacity: 0, y: 24, duration: 0.6, stagger: 0.05, ease: 'power3.out' }); }
    });

    // ---- storytelling cards: fade/slide in as each scrolls into view ----
    ScrollTrigger.batch('[data-story-card]', {
      start: 'top 88%',
      onEnter: function (els) { gsap.to(els, { opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }); }
    });

    // ---- perspective section: pointers light up one at a time on scroll ----
    // Trigger is the list itself, not the (much taller, 120vh, vertically
    // centred) .r-flow section — a section-edge-based start/end doesn't
    // line up with when the centred content is actually on screen, which
    // was firing the whole reveal well before/after the list was visible.
    (function () {
      var items = document.querySelectorAll('#flowText > li');
      if (!items.length) return;
      ScrollTrigger.create({
        trigger: '#flowText', start: 'top 70%', end: 'bottom 60%', scrub: true,
        onUpdate: function (self) {
          var idx = Math.floor(self.progress * items.length);
          items.forEach(function (el, i) { el.classList.toggle('is-lit', i < idx); });
        }
      });
    })();

    // ---- converge (3D) section: drive Scene3D.convergeProgress from scroll ----
    // Not pinned — progress just tracks the section's own (unpinned) scroll
    // range, so the title swap/label activations/convergence unfold across
    // however long #converge naturally takes to pass through the viewport.
    ScrollTrigger.create({
      trigger: '#converge', start: 'top bottom', end: 'bottom top', scrub: 1.2,
      onUpdate: function (self) { Scene3D.convergeProgress = self.progress; }
    });

    // ---- marquee auto-scroll (CSS-independent, GSAP-driven for consistent speed) ----
    gsap.utils.toArray('.r-marquee-track').forEach(function (track, i) {
      var dir = track.parentElement.getAttribute('data-dir') === 'right' ? 1 : -1;
      gsap.to(track, {
        xPercent: 50 * dir, duration: 30 + i * 4, ease: 'none', repeat: -1
      });
    });

    // ---- highlight whichever stepper row is passing through viewport centre ----
    // (Industries moved from a single-column list to a card grid, where
    // "whichever is centred" no longer means anything — several cards can
    // share the same row — so this is stepper-only now.)
    ['.r-stepper-row'].forEach(function (selector) {
      gsap.utils.toArray(selector).forEach(function (row) {
        ScrollTrigger.create({
          trigger: row, start: 'top center', end: 'bottom center',
          toggleClass: { targets: row, className: 'is-focus' }
        });
      });
    });

    webglVisibility();
  }

  /* =================================================================
     TESTIMONIALS SLIDER
     ================================================================= */
  (function testimonials() {
    var stage = document.getElementById('testimonialStage');
    var items = stage.querySelectorAll('.r-testimonial');
    var dots = document.querySelectorAll('#testimonialDots button');
    var idx = 0, timer;

    function show(i) {
      idx = (i + items.length) % items.length;
      items.forEach(function (el, n) { el.classList.toggle('active', n === idx); });
      dots.forEach(function (el, n) { el.classList.toggle('active', n === idx); });
    }
    function next() { show(idx + 1); }
    function restart() { clearInterval(timer); timer = setInterval(next, 5000); }

    dots.forEach(function (dot, i) { dot.addEventListener('click', function () { show(i); restart(); }); });
    stage.addEventListener('mouseenter', function () { clearInterval(timer); });
    stage.addEventListener('mouseleave', restart);

    restart();
  })();

  /* =================================================================
     UTILS
     ================================================================= */
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

})();
