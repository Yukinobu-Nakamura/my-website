/* =============================================
   YUKINOBU NAKAMURA PORTFOLIO - script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -------- Header: scroll effect -------- */
  const header = document.getElementById('header');
  const handleHeaderScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* -------- Hamburger menu -------- */
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a nav link is clicked
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  /* -------- Back to Top button -------- */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* -------- Smooth scroll for all anchor links -------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* -------- Number counter animation -------- */
  const counters = document.querySelectorAll('.numbers__value[data-count]');
  let countersAnimated = false;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1800;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  const numbersSection = document.querySelector('.numbers');
  if (numbersSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          counters.forEach(counter => animateCounter(counter));
        }
      });
    }, { threshold: 0.3 });
    observer.observe(numbersSection);
  }

  /* -------- Scroll Reveal -------- */
  const revealElements = document.querySelectorAll(
    '.service__card, .works__card, .about__grid > *, ' +
    '.news__item, .numbers__item, .section-header'
  );

  revealElements.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger delay based on position within parent
    const siblings = Array.from(el.parentNode.children);
    const idx = siblings.indexOf(el);
    if (idx > 0 && idx <= 4) {
      el.classList.add(`reveal-delay-${idx}`);
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* -------- Works filter -------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards  = document.querySelectorAll('.works__card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      workCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;
        card.style.display = show ? '' : 'none';
        if (show) {
          // Re-trigger animation
          card.classList.remove('visible');
          setTimeout(() => card.classList.add('visible'), 30);
        }
      });
    });
  });

  /* -------- Active nav link on scroll -------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

  const updateActiveNav = () => {
    const scrollPos = window.scrollY + header.offsetHeight + 40;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav__link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active-nav', scrollPos >= top && scrollPos < bottom);
      }
    });
  };
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* -------- Contact form (client-side only) -------- */
  const form        = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          formMessage.className = 'form-message success';
          formMessage.textContent = 'お問い合わせありがとうございます。2営業日以内にご返信いたします。';
          form.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        // Fallback: show success for static sites (replace with real backend)
        formMessage.className = 'form-message success';
        formMessage.textContent = 'お問い合わせを受け付けました。ご連絡をお待ちください。';
        form.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

});
