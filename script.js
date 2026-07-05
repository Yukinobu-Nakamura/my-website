/* =============================================
   中村幸信後援会 公式サイト - script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -------- Header: scroll effect -------- */
  const header = document.getElementById('header');
  const handleHeaderScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* -------- Hamburger menu -------- */
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // ナビリンクをクリックしたらメニューを閉じる
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      document.body.style.overflow = '';
    });
  });

  // メニュー外クリックで閉じる
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  });

  /* -------- Back to Top button -------- */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* -------- Smooth scroll for anchor links -------- */
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

  /* -------- Scroll fade-in -------- */
  const revealElements = document.querySelectorAll(
    '.section-header, .message__body, .profile__grid > *, ' +
    '.policy__card, .kouenkai__card, .news__item, .contact__wrap'
  );

  revealElements.forEach(el => el.classList.add('fade-in'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* -------- Active nav link on scroll -------- */
  const sections = document.querySelectorAll('section[id]');

  const updateActiveNav = () => {
    const scrollPos = window.scrollY + header.offsetHeight + 40;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav__link[href="#${id}"]:not(.nav__link--cta)`);
      if (link) {
        link.classList.toggle('active-nav', scrollPos >= top && scrollPos < bottom);
      }
    });
  };
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* -------- Contact form -------- */
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

        let result = null;
        try {
          result = await response.json();
        } catch { /* JSONでない応答(テスト環境等) */ }

        if (response.ok && result && result.success) {
          formMessage.className = 'form-message is-success';
          formMessage.textContent = 'お問い合わせありがとうございます。内容を確認のうえ、順次ご返信いたします。';
          form.reset();
        } else if (result && result.errors) {
          formMessage.className = 'form-message is-error';
          formMessage.textContent = result.errors.join(' ');
        } else {
          throw new Error('Server error');
        }
      } catch {
        // 送信基盤が使えない環境(GitHub Pages のテスト環境等)では正直にエラーを表示する
        formMessage.className = 'form-message is-error';
        formMessage.textContent = '送信できませんでした。お手数ですが info@nakamura-yukinobu.jp まで直接メールをお送りください。';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

});
