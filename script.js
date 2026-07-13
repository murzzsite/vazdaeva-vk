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
      burstConfetti();
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

  // Scroll progress bar
  const bar = document.createElement('div');
  bar.className = 'scroll-bar';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });

  // Confetti burst (used on successful form submit + easter egg)
  function burstConfetti(originEl) {
    const colors = ['#D6146E', '#FF5CA8', '#FFD84D', '#B6F09C', '#7FC4FF', '#1D3B78'];
    const rect = originEl ? originEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 3, width: 0 };
    const cx = rect.left + rect.width / 2;
    const cy = rect.top;
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('span');
      p.className = 'confetti-piece';
      const size = 6 + Math.random() * 6;
      p.style.width = size + 'px';
      p.style.height = size * .4 + 'px';
      p.style.background = colors[i % colors.length];
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 220;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist - 80 + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      p.style.animationDuration = (1.1 + Math.random() * .7) + 's';
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  // Easter egg: type "vk" anywhere to unlock a bonus surprise
  let keyBuf = '';
  let eggUsed = false;
  window.addEventListener('keydown', e => {
    if (e.key.length !== 1) return;
    keyBuf = (keyBuf + e.key.toLowerCase()).slice(-2);
    if (keyBuf === 'vk' && !eggUsed) {
      eggUsed = true;
      showEasterEgg();
    }
  });

  function showEasterEgg() {
    burstConfetti();
    const toast = document.createElement('div');
    toast.className = 'egg-toast';
    toast.innerHTML = `
      <span class="egg-toast__emoji">🎨</span>
      <div>
        <strong>Пасхалка найдена!</strong>
        <p>В тариф «С поддержкой» уже включён бонус — урок <b>«Основы дизайна в Figma»</b>. Не все это замечают ;)</p>
      </div>
      <button class="egg-toast__close" aria-label="Закрыть">×</button>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    const remove = () => { toast.classList.remove('is-visible'); setTimeout(() => toast.remove(), 400); };
    toast.querySelector('.egg-toast__close').addEventListener('click', remove);
    setTimeout(remove, 9000);
  }

  // Niche checker
  const nicheSelect = document.getElementById('nicheSelect');
  const nicheBtn = document.getElementById('nicheBtn');
  const nicheResult = document.getElementById('nicheResult');
  const NICHE_VERDICTS = {
    green: {
      icon: '🟢', cls: 'niche-card--green', title: 'Отличный выбор',
      text: 'Модерация ВКонтакте почти всегда пропускает такую рекламу с первого раза. В модулях 6–7 курса разбираем, как быстро выйти на первые заявки именно в таких нишах.'
    },
    yellow: {
      icon: '🟡', cls: 'niche-card--yellow', title: 'Реклама пройдёт — но нужны правила',
      text: 'Здесь важно знать формулировки и требования площадки, иначе объявление просто не пропустят. В курсе разбираем именно такие кейсы — с готовыми формулировками, которые проходят модерацию.'
    },
    blue: {
      icon: '🔵', cls: 'niche-card--blue', title: 'Долгий цикл сделки',
      text: 'Реклама сработает, но потребуется бюджет на тесты и терпение — заявки приходят не сразу. В модуле про аналитику показываем, как считать окупаемость на дистанции.'
    },
    red: {
      icon: '🔴', cls: 'niche-card--red', title: 'Высокий риск блокировки',
      text: 'Такую рекламу модерация блокирует почти всегда. Если это твоя ниша — напиши Анне в заявке, подскажем обходные пути продвижения без прямой рекламы.'
    }
  };
  nicheBtn?.addEventListener('click', () => {
    const val = nicheSelect.value;
    if (!val) { nicheSelect.focus(); return; }
    const v = NICHE_VERDICTS[val];
    nicheResult.innerHTML = `
      <div class="niche-card ${v.cls}">
        <span class="niche-card__icon">${v.icon}</span>
        <div><strong>${v.title}</strong><p>${v.text}</p></div>
      </div>`;
  });

  // Honest countdown to end of day (discount is "today")
  const cdEl = document.getElementById('cdTimer');
  if (cdEl) {
    const tick = () => {
      const now = new Date();
      const end = new Date(now); end.setHours(23, 59, 59, 999);
      let diff = Math.max(0, end - now);
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor(diff / 60000) % 60).padStart(2, '0');
      const s = String(Math.floor(diff / 1000) % 60).padStart(2, '0');
      cdEl.textContent = `${h}:${m}:${s}`;
    };
    tick();
    setInterval(tick, 1000);
  }
})();
