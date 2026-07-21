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

  /* Contact form */
  const form = document.querySelector('#contact-form');
  if (form) {
    const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz7PLkjFjuMJ2BDHLHW87uXps34Q3XIsKWVH3u0wou0G7GPUOOzoFfEbXcxY0X0RJkfIA/exec';
    const EMAIL_SERVICE_ID = 'service_auugpye';
    const EMAIL_TEMPLATE_ID = 'template_s4lfbei';
    const EMAIL_PUBLIC_KEY = 'DHv_rOf79O2FSwQhb';
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="p-btn-spinner"></span>';
      }

      const data = {
        fname: form.querySelector('#fname')?.value || '',
        lname: form.querySelector('#lname')?.value || '',
        company: form.querySelector('#company')?.value || '',
        designation: form.querySelector('#designation')?.value || '',
        email: form.querySelector('#email')?.value || '',
        phone: form.querySelector('#phone')?.value || '',
        country: form.querySelector('#country')?.value || '',
        industry: form.querySelector('#industry')?.value || '',
        size: form.querySelector('#size')?.value || '',
        interest: form.querySelector('#interest')?.value || '',
        message: form.querySelector('#message')?.value || '',
        timeline: form.querySelector('#timeline')?.value || ''
      };

      const sheetRequest = fetch(SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      }).catch(() => {});

      const emailRequest = (typeof emailjs !== 'undefined')
        ? emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, {
          first_name: data.fname,
          last_name: data.lname,
          full_name: `${data.fname} ${data.lname}`.trim(),
          company: data.company,
          designation: data.designation || 'Not provided',
          email: data.email,
          phone: data.phone || 'Not provided',
          country: data.country || 'Not provided',
          industry: data.industry || 'Not provided',
          company_size: data.size,
          interest: data.interest,
          message: data.message,
          timeline: data.timeline,
          to_email: 'hello@bridgpoint.com'
        }, EMAIL_PUBLIC_KEY).catch(() => {})
        : Promise.resolve();

      Promise.allSettled([sheetRequest, emailRequest]).then(() => {
        window.location.href = 'thank-you.html';
      });
    });
  }
});
