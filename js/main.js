// Bridgpoint — interactions

document.addEventListener('DOMContentLoaded', () => {
  /* Sticky nav shrink — handled by animations.js when GSAP is available */
  const nav = document.querySelector('.p-nav') || document.querySelector('.nav');
  if (nav && typeof gsap === 'undefined') {
    const onScroll = () => {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu toggle */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  /* Scroll reveal — delegated to GSAP/animations.js when available */
  if (typeof gsap === 'undefined') {
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(el => io.observe(el));
    } else {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
    }
  }

  /* Bridge-arc draw-in on scroll, plus travelling spark along the path */
  const startSparks = (el) => {
    el.querySelectorAll('animateMotion').forEach((am) => {
      try { am.beginElement(); } catch (e) { /* SMIL not supported — spark just stays static, harmless */ }
    });
  };
  const arcEls = document.querySelectorAll('.arc-motif, .map-lines');
  if ('IntersectionObserver' in window && arcEls.length) {
    const aio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          startSparks(entry.target);
          aio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    arcEls.forEach(el => aio.observe(el));
  } else {
    arcEls.forEach(el => { el.classList.add('in-view'); startSparks(el); });
  }

  /* Animated counters */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.count.includes('.') ? 1 : 0;
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        let display = value.toFixed(decimals);
        if (decimals === 0 && value >= 1000) {
          display = Math.round(value).toLocaleString('en-US');
        }
        el.textContent = display + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(el => cio.observe(el));
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* Contact form (static demo) */
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = 'thank-you.html';
    });
  }
});
