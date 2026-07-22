// Bridgpoint — "Product" concept interactions
// (works alongside main.js, which still handles .reveal fade-ins and [data-count] counters)

document.addEventListener('DOMContentLoaded', () => {
  /* Sticky nav shrink/blur — deferred to animations.js when GSAP is loaded */
  const nav = document.querySelector('.p-nav');
  if (nav && typeof gsap === 'undefined') {
    const onScroll = () => {
      if (window.scrollY > 16) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu toggle */
  const toggle = document.querySelector('.p-nav-toggle');
  const mobileMenu = document.querySelector('.p-mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  /* Hero panel chart bars — trigger CSS transform once visible */
  const panel = document.querySelector('.p-panel');
  if (panel && 'IntersectionObserver' in window) {
    const pio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          pio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    pio.observe(panel);
  } else if (panel) {
    panel.classList.add('in-view');
  }

  /* Globe network line draw-in — delegated to animations.js when GSAP is available */
  const globeLines = document.querySelectorAll('.p-globe-line');
  if (globeLines.length && 'IntersectionObserver' in window && typeof gsap === 'undefined') {
    const gio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.closest('.p-globe-panel').classList.add('in-view');
          gio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    globeLines.forEach(el => gio.observe(el));
  }

  /* Subtle tilt on practice cards — deferred to animations.js when GSAP is loaded */
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('.p-practice-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* Interactive diagnostic quiz */
  initQuiz();

  /* Contact modal — must run regardless of whether the page has a quiz */
  initContactModal();

  /* Practice cards: make entire card clickable, redirect to link inside.
     Delegate to the link's own click so the animated page-transition
     listener in animations.js (bound to the <a>) still gets to run —
     clicking the icon inside the link previously bypassed it entirely. */
  document.querySelectorAll('.p-practice-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const link = card.querySelector('.p-card-link');
      if (link) link.click();
    });
  });

  /* Motion polish: cursor + magnetic buttons
     — deferred to animations.js when GSAP is loaded (richer versions there) */
  if (typeof gsap === 'undefined') {
    initCursor();
    initMagneticButtons();
  }

  /* Fixed bridge-arch */
  initFixedArc();
});

function initFixedArc() {
  const path = document.querySelector('.p-fixed-arc .arc-line');
  const spark = document.querySelector('.p-fixed-arc .arc-spark');
  if (!path || !spark) return;
  if (window.matchMedia('(max-width: 640px)').matches) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion) {
    const totalLength = path.getTotalLength();
    path.style.strokeDasharray = totalLength;
    path.style.strokeDashoffset = totalLength;
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.2,.8,.2,1)';
      path.style.strokeDashoffset = '0';
    });

    // The spark's continuous glide is driven by the <animateMotion> baked
    // into the SVG (see FIXED_ARC in build_product_site.py) — declarative
    // SMIL, so it loops at a steady pace on its own, unaffected by scroll,
    // page jank, or anything else in main-thread JS.
    const anim = spark.querySelector('animateMotion');
    if (anim && typeof anim.beginElement === 'function') {
      try { anim.beginElement(); } catch (e) { /* harmless if unsupported */ }
    }
  } else {
    // Respect reduced-motion: keep the spark still at the arch's start.
    const anim = spark.querySelector('animateMotion');
    if (anim) anim.remove();
  }
}

function initCursor() {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'p-cursor-dot';
  document.body.appendChild(dot);

  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
  let shown = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!shown) { curX = mouseX; curY = mouseY; shown = true; dot.classList.add('visible'); }
  });
  window.addEventListener('mouseleave', () => dot.classList.remove('visible'));
  window.addEventListener('mouseenter', () => dot.classList.add('visible'));

  function raf() {
    curX += (mouseX - curX) * 0.5;
    curY += (mouseY - curY) * 0.5;
    dot.style.left = curX + 'px';
    dot.style.top = curY + 'px';
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  const hoverTargets = 'a, button, .p-quiz-option, input, select, textarea, .p-card, .p-practice-card, .p-tile';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) dot.classList.add('hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) dot.classList.remove('hover');
  });
}

function initMagneticButtons() {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  const strength = 14;
  document.querySelectorAll('.p-btn').forEach(btn => {
    btn.classList.add('magnet-active');
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      const dx = (x / r.width) * strength;
      const dy = (y / r.height) * strength - 2;
      btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

function initQuiz() {
  const quiz = document.querySelector('#quiz');
  if (!quiz) return;

  const steps = quiz.querySelectorAll('.p-quiz-step[data-step]');
  const numberedSteps = quiz.querySelectorAll('.p-quiz-step[data-step="0"], .p-quiz-step[data-step="1"], .p-quiz-step[data-step="2"]');
  const dots = quiz.querySelectorAll('.p-quiz-progress span');
  const resultStep = quiz.querySelector('.p-quiz-result');
  let answers = [];
  let current = 0;

  const RESULTS = {
    consulting: {
      title: 'Business Consulting',
      text: "It sounds like strategic clarity is what you need most right now — defining direction, evaluating opportunities and building a plan your team can actually execute.",
      href: 'business-consulting.html',
      cta: 'Explore Business Consulting',
    },
    research: {
      title: 'Market Research',
      text: "It sounds like you need evidence before you decide — understanding customers, competitors or demand so your next move is grounded in fact, not assumption.",
      href: 'market-research.html',
      cta: 'Explore Market Research',
    },
    brand: {
      title: 'Brand & Marketing',
      text: "It sounds like market presence is the priority — building a brand customers trust and marketing that creates measurable demand.",
      href: 'brand-marketing.html',
      cta: 'Explore Brand & Marketing',
    },
  };

  function showStep(index) {
    numberedSteps.forEach(s => s.classList.remove('active'));
    resultStep.classList.remove('active');
    if (index < 3) {
      quiz.querySelector(`.p-quiz-step[data-step="${index}"]`).classList.add('active');
    } else {
      resultStep.classList.add('active');
    }
    dots.forEach((d, i) => d.classList.toggle('done', i < index || index >= 3));
  }

  function renderResult() {
    const tally = {};
    answers.forEach(a => { tally[a] = (tally[a] || 0) + 1; });
    const winner = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
    const r = RESULTS[winner];
    resultStep.innerHTML = `
      <h3>${r.title}</h3>
      <p>${r.text}</p>
      <a href="${r.href}" class="p-btn p-btn-accent">${r.cta}</a>
      <button class="p-quiz-restart" type="button">Retake the diagnostic</button>
    `;
    resultStep.querySelector('.p-quiz-restart').addEventListener('click', () => {
      answers = [];
      current = 0;
      showStep(0);
    });
  }

  quiz.querySelectorAll('.p-quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      answers[current] = btn.dataset.value;
      current++;
      if (current < 3) {
        showStep(current);
      } else {
        renderResult();
        showStep(3);
      }
    });
  });

  quiz.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      current = Math.max(0, current - 1);
      showStep(current);
    });
  });
}

function initContactModal() {
  const modal = document.getElementById('contactModal');
  const trigger = document.getElementById('contactModalTrigger');
  const close = document.getElementById('contactClose');
  const overlay = document.getElementById('contactOverlay');
  const form = document.getElementById('contactForm');

  if (!modal || !trigger || !close || !overlay || !form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  let isSubmitting = false;

  function waitForEmailJS(callback) {
    if (typeof emailjs !== 'undefined') {
      callback();
    } else {
      setTimeout(() => { waitForEmailJS(callback); }, 100);
    }
  }

  function openModal(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', openModal);
  close.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  function attachFormHandler() {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (isSubmitting || typeof emailjs === 'undefined') return false;

      isSubmitting = true;
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const subject = document.getElementById('contactSubject').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !subject || !message) {
        submitBtn.textContent = 'Please fill all fields';
        isSubmitting = false;
        setTimeout(() => { submitBtn.textContent = 'Send Message'; }, 2000);
        return false;
      }

      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      emailjs.send('service_auugpye', 'template_lro2czl', {
        from_name: name, from_email: email, to_email: 'hello@bridgpoint.com',
        subject: subject, message: message, reply_to: email
      }).then(() => {
        submitBtn.textContent = 'Message sent!';
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          isSubmitting = false;
          closeModal();
          form.reset();
        }, 2000);
      }).catch(() => {
        submitBtn.textContent = 'Error sending message';
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          isSubmitting = false;
        }, 3000);
      });
      return false;
    }, true);
  }

  waitForEmailJS(() => {
    if (typeof emailjs !== 'undefined') emailjs.init('DHv_rOf79O2FSwQhb');
    attachFormHandler();
  });

  setTimeout(() => { if (!form.onsubmit) attachFormHandler(); }, 5000);
}
