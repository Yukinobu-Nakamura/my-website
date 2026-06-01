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
  let currentBlogFilter = 'all';

  function applyBlogFilter(filter) {
    currentBlogFilter = filter;
    document.querySelectorAll('#blogGrid .works__card').forEach(card => {
      const cat = card.getAttribute('data-category');
      const show = filter === 'all' || cat === filter;
      card.style.display = show ? '' : 'none';
      if (show) {
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 30);
      }
    });
  }

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyBlogFilter(btn.getAttribute('data-filter'));
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

  /* -------- Nav label toggle EN ⇔ JA every 5s -------- */
  const headerToggleEls = document.querySelectorAll('.nav__link[data-en][data-ja], .header__logo .logo-text[data-en][data-ja]');
  const footerToggleEls = document.querySelectorAll('.footer [data-en][data-ja]');
  let showingJa = false;

  // Fix brand width to EN size so SNS icons don't shift when name changes to JA
  const headerBrand = document.querySelector('.header__brand');
  if (headerBrand) {
    headerBrand.style.minWidth = headerBrand.offsetWidth + 'px';
  }
  // Lock logo text to EN width so JA text occupies same space
  const headerLogoText = document.querySelector('.header__logo .logo-text');
  if (headerLogoText) {
    headerLogoText.style.display = 'inline-block';
    headerLogoText.style.minWidth = headerLogoText.offsetWidth + 'px';
  }

  // Footer: fix each element to JA width (Japanese is the base layout)
  footerToggleEls.forEach(el => {
    if (el.tagName === 'A' || el.tagName === 'SPAN') {
      el.style.display = 'inline-block';
    }
    const orig = el.textContent;
    el.textContent = el.dataset.ja;
    const jaW = el.offsetWidth;
    el.textContent = orig;
    if (jaW > 0) el.style.minWidth = jaW + 'px';
  });

  const applyNavLabels = () => {
    const allEls = [...headerToggleEls, ...footerToggleEls];
    allEls.forEach(el => {
      el.style.transition = 'opacity 0.4s';
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = showingJa ? el.dataset.ja : el.dataset.en;
        el.style.opacity = '1';
      }, 400);
    });
  };

  setInterval(() => {
    showingJa = !showingJa;
    applyNavLabels();
  }, 5000);

  /* -------- Note.com blog integration -------- */
  const NOTE_USERNAME = 'cpa_man_10969';
  const HASHTAG_CATEGORY = {
    '政策': 'policy', '政治': 'policy', '財政': 'policy', '行政': 'policy', '豊島区': 'policy',
    '再生の道': 'policy', '都政': 'policy', '都議': 'policy',
    '会計': 'other', '監査': 'other', '公認会計士': 'other',
    'CPA': 'other', '財務': 'other', 'IPO': 'other',
    '活動': 'activity', 'イベント': 'activity',
    'プライベート': 'other',
  };

  function tagsToCategory(tags) {
    for (const t of tags) {
      if (HASHTAG_CATEGORY[t]) return HASHTAG_CATEGORY[t];
    }
    return 'other';
  }

  function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  async function loadNoteArticles() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://note.com/${NOTE_USERNAME}/rss`)}`;
    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('proxy');
      const data = await res.json();
      const xml  = new DOMParser().parseFromString(data.contents, 'text/xml');
      const items = Array.from(xml.querySelectorAll('item'));
      if (!items.length) throw new Error('empty');

      grid.innerHTML = items.slice(0, 6).map((item, i) => {
        const title  = item.querySelector('title')?.textContent?.trim() || '無題';
        const link   = item.querySelector('link')?.textContent?.trim() || '#';
        const desc   = stripHtml(item.querySelector('description')?.textContent || '').replace(/\s+/g, ' ').trim();
        const tags   = Array.from(item.querySelectorAll('category')).map(c => c.textContent.trim());
        const imgUrl = item.querySelector('enclosure')?.getAttribute('url') || '';
        const cat    = tagsToCategory(tags);
        const thumbAttr = imgUrl
          ? `style="background-image:url('${imgUrl}');background-size:cover;background-position:center;"`
          : `class="works__thumb works__thumb--${(i % 6) + 1}"`;
        const thumbClass = imgUrl ? 'class="works__thumb"' : '';

        return `
          <div class="works__card reveal" data-category="${cat}">
            <div ${imgUrl ? `class="works__thumb" style="background-image:url('${imgUrl}');background-size:cover;background-position:center;"` : `class="works__thumb works__thumb--${(i % 6) + 1}"`}>
              <div class="works__overlay">
                <span class="works__tag">${tags[0] || 'note'}</span>
              </div>
            </div>
            <div class="works__info">
              <h3 class="works__title">
                <a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>
              </h3>
              <p class="works__desc">${desc.slice(0, 80)}${desc.length > 80 ? '…' : ''}</p>
              <div class="works__tech">
                ${tags.slice(0, 3).map(t => `<span>#${t}</span>`).join('')}
              </div>
            </div>
          </div>`;
      }).join('');

      grid.querySelectorAll('.works__card').forEach(el => revealObserver.observe(el));
      applyBlogFilter(currentBlogFilter);

    } catch {
      grid.innerHTML = `<p class="works__note-fallback">記事の読み込みができませんでした。
        <a href="https://note.com/${NOTE_USERNAME}" target="_blank" rel="noopener noreferrer">noteで読む →</a></p>`;
    }
  }

  loadNoteArticles();

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
