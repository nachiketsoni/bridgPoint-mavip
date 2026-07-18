/* ===================================================================
   Shared nav behaviour for pages still on the old design system.
   Deliberately dependency-free (no GSAP/Lenis) — these pages already
   run their own js/main.js + js/product.js + js/animations.js for the
   rest of the page, and pulling in smooth-scroll here would change
   their whole scroll feel for the sake of the nav bar alone. The
   Services/Industries dropdowns need no JS at all (pure CSS hover).
   =================================================================== */
(function () {
  'use strict';

  var navEl = document.getElementById('siteNav');
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('mobileMenu');
  var lastY = 0;

  if (navEl) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      navEl.classList.toggle('is-scrolled', y > 40);
      if (y > lastY && y > 200) navEl.classList.add('is-hidden');
      else navEl.classList.remove('is-hidden');
      lastY = y;
    }, { passive: true });
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-active', open);
      document.documentElement.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        burger.classList.remove('is-active');
        document.documentElement.style.overflow = '';
      });
    });
  }
})();
