(() => {
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/FSJXCEYWHR';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header: dark on hero, light on scroll
  const header = document.getElementById('header');
  const onScroll = () => {
    const past = window.scrollY > 60;
    header?.classList.toggle('header--dark', !past);
    header?.classList.toggle('header--light', past);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Burger
  const burger = document.getElementById('burger');
  const navMob = document.getElementById('navMob');
  burger?.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    navMob?.classList.toggle('open');
  });
  navMob?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger?.classList.remove('is-open');
    navMob.classList.remove('open');
  }));

  // Form → Cloudflare Worker → Telegram
  const form = document.getElementById('leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.contact) {
      alert('Заполните имя и контактные данные');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = '✓ Заявка отправлена';
      form.reset();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Ошибка — попробуй ещё раз';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    }
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Animated counters
  const animateCount = el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1400, start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); countIO.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));
})();
