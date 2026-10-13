/* ALK · Rangkuman UTS — shared behaviour (vanilla JS, no build step) */
(function () {
  'use strict';
  var root = document.documentElement;
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- Theme ---------- */
  var saved = store.get('alk:theme', null);
  if (saved) root.setAttribute('data-theme', saved);
  // Halaman materi meniru presentasinya: default terang (kecuali K1 yang memang gelap)
  else if (/\bk[2-6]\b/.test(document.body.className)) root.setAttribute('data-theme', 'light');

  var PAGES = [
    { id: 'k1', href: 'profitability.html', short: 'K1 Profitabilitas', title: 'Profitability Analysis', color: '--c1' },
    { id: 'k2', href: 'credit-risk.html', short: 'K2 Risiko Kredit', title: 'Credit Risk Analysis', color: '--c2' },
    { id: 'k3', href: 'revenue.html', short: 'K3 Pendapatan', title: 'Revenue & Operating Income', color: '--c3' },
    { id: 'k4', href: 'operating-assets.html', short: 'K4 Aset Operasi', title: 'Operating Assets', color: '--c4' },
    { id: 'k5', href: 'liabilities.html', short: 'K5 Liabilitas', title: 'Liabilities & Nonowner Financing', color: '--c5' },
    { id: 'k6', href: 'equity.html', short: 'K6 Ekuitas', title: 'Equity & Owner Financing', color: '--c6' }
  ];
  var EXTRA = [
    { id: 'rumus', href: 'rumus.html', short: 'Bank Rumus' },
    { id: 'kuis', href: 'kuis.html', short: 'Kuis Campuran' }
  ];
  window.ALK = { pages: PAGES, store: store };

  var pageId = document.body.getAttribute('data-page') || 'home';

  /* ---------- Site header (injected so every page stays in sync) ---------- */
  var header = document.querySelector('header.site');
  if (header) {
    var links = PAGES.concat(EXTRA).map(function (p) {
      var dot = p.color ? '<i style="background:var(' + p.color + ')"></i>' : '';
      return '<a href="' + p.href + '"' + (p.id === pageId ? ' aria-current="page"' : '') + '>' + dot + p.short + '</a>';
    }).join('');
    header.innerHTML = '<div class="row">' +
      '<a class="brand" href="index.html" aria-label="Beranda"><span class="dot">ALK</span><span class="txt">Rangkuman UTS</span></a>' +
      '<nav class="chapters" aria-label="Materi">' + links + '</nav>' +
      (document.body.classList.contains('k1') ? '' :
      '<button class="icon-btn" id="themeBtn" type="button" aria-label="Ganti tema terang/gelap">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>') +
      '</div>';
    var cur = header.querySelector('[aria-current="page"]');
    if (cur && cur.scrollIntoView) { try { cur.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {} }
    var tb = document.getElementById('themeBtn');
    if (tb) tb.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark' ||
        (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next); store.set('alk:theme', next);
    });
  }

  /* ---------- Pager (prev/next chapter) ---------- */
  var pager = document.querySelector('.pager[data-auto]');
  if (pager) {
    var i = PAGES.findIndex(function (p) { return p.id === pageId; });
    var prev = PAGES[i - 1], next = PAGES[i + 1];
    pager.innerHTML =
      (prev ? '<a href="' + prev.href + '"><small>← Sebelumnya</small><b>' + prev.title + '</b></a>' : '<a href="index.html"><small>← Kembali</small><b>Beranda</b></a>') +
      (next ? '<a href="' + next.href + '"><small>Berikutnya →</small><b>' + next.title + '</b></a>' : '<a href="kuis.html"><small>Lanjut →</small><b>Kuis Campuran</b></a>');
  }

  /* ---------- "Tandai paham" progress ---------- */
  var done = store.get('alk:done', {});
  var doneBtns = document.querySelectorAll('button.done[data-done]');
  function paintDone() {
    doneBtns.forEach(function (b) {
      var on = !!done[b.dataset.done];
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? 'Sudah paham' : 'Tandai paham';
      var sec = b.closest('section');
      if (sec && sec.id) {
        var a = document.querySelector('nav.toc a[href="#' + sec.id + '"]');
        if (a) a.classList.toggle('ok', on);
      }
    });
  }
  doneBtns.forEach(function (b) {
    b.type = 'button';
    b.addEventListener('click', function () {
      done[b.dataset.done] = !done[b.dataset.done];
      if (!done[b.dataset.done]) delete done[b.dataset.done];
      store.set('alk:done', done); paintDone();
    });
  });
  paintDone();
  if (doneBtns.length && /^k\d$/.test(pageId)) store.set('alk:total:' + pageId, doneBtns.length);
  window.ALK.progress = function (id) {
    var d = store.get('alk:done', {}), n = 0;
    Object.keys(d).forEach(function (k) { if (k.indexOf(id + '-') === 0) n++; });
    return { done: n, total: store.get('alk:total:' + id, null) };
  };

  /* ---------- TOC active section ---------- */
  var tocLinks = document.querySelectorAll('nav.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove('on'); });
          map[e.target.id].classList.add('on');
          try { map[e.target.id].scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (x) {}
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Flip cards ---------- */
  document.querySelectorAll('.flip').forEach(function (f) {
    f.setAttribute('type', 'button');
    f.setAttribute('aria-pressed', 'false');
    f.addEventListener('click', function () {
      f.classList.toggle('on'); f.setAttribute('aria-pressed', f.classList.contains('on'));
    });
  });

  /* ---------- Segmented controls: [data-seg] with buttons[data-v] ---------- */
  window.ALK.seg = function (el, cb) {
    var bs = el.querySelectorAll('button');
    function pick(b) { bs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); cb(b.dataset.v, b); }
    bs.forEach(function (b) { b.type = 'button'; b.addEventListener('click', function () { pick(b); }); });
    var first = el.querySelector('[aria-pressed="true"]') || bs[0];
    if (first) pick(first);
  };

  /* ---------- Bars & reveal: animate only things below the fold ---------- */
  function arm(sel, cls) {
    if (!('IntersectionObserver' in window)) return;
    var vh = window.innerHeight;
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('armed'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.getBoundingClientRect().top > vh) { el.classList.add('armed'); obs.observe(el); }
    });
  }
  arm('.bars', 'armed');
  arm('.rv', 'armed');

  /* ---------- Formatting helpers ---------- */
  window.ALK.fmt = function (n, d) {
    if (!isFinite(n)) return '–';
    return Number(n).toLocaleString('id-ID', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  };
  window.ALK.pct = function (n, d) { return window.ALK.fmt(n * 100, d == null ? 1 : d) + '%'; };
  window.ALK.$ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- Quiz engine ---------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  window.ALK.quiz = function (el, items, opts) {
    opts = opts || {};
    function render(list) {
      var right = 0, answered = 0;
      el.innerHTML = '';
      var bar = document.createElement('div'); bar.className = 'quiz-bar';
      bar.innerHTML = '<span class="score">0 / ' + list.length + '</span><span class="meter"><i></i></span><button class="btn ghost" type="button">Ulangi & acak</button>';
      el.appendChild(bar);
      bar.querySelector('button').addEventListener('click', function () { render(shuffle(items).slice(0, opts.limit || items.length)); });
      list.forEach(function (it, qi) {
        var q = document.createElement('div'); q.className = 'q';
        var tag = it.tag ? '<span class="tag">' + it.tag + '</span>' : '';
        q.innerHTML = '<div class="qt">' + tag + (qi + 1) + '. ' + it.q + '</div><div class="opts"></div><div class="why"></div>';
        var box = q.querySelector('.opts');
        it.o.forEach(function (o, oi) {
          var b = document.createElement('button'); b.type = 'button';
          b.innerHTML = '<span class="l">' + 'ABCD'[oi] + '</span><span>' + o + '</span>';
          b.addEventListener('click', function () {
            if (q.classList.contains('answered')) return;
            q.classList.add('answered'); answered++;
            box.querySelectorAll('button').forEach(function (x, xi) { x.disabled = true; if (xi === it.a) x.classList.add('right'); });
            if (oi === it.a) right++; else b.classList.add('wrong');
            q.querySelector('.why').innerHTML = (oi === it.a ? '<b class="good">Benar.</b> ' : '<b class="bad">Kurang tepat.</b> ') + (it.w || '');
            bar.querySelector('.score').textContent = right + ' / ' + list.length;
            bar.querySelector('.meter i').style.width = (answered / list.length * 100) + '%';
          });
          box.appendChild(b);
        });
        el.appendChild(q);
      });
    }
    render(opts.shuffle ? shuffle(items).slice(0, opts.limit || items.length) : items);
  };

  document.querySelectorAll('[data-quiz]').forEach(function (el) {
    var key = el.getAttribute('data-quiz');
    if (!window.QUIZ) return;
    if (key === 'all') return; // kuis.html handles its own mount
    if (window.QUIZ[key]) window.ALK.quiz(el, window.QUIZ[key]);
  });
})();
