/* ALK · Rangkuman UTS — shared behaviour v2 (vanilla JS, no build step) */
(function () {
  'use strict';
  var root = document.documentElement, body = document.body;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var PAGES = [
    { id: 'k1', href: 'profitability.html', code: 'K1', nm: 'Profitabilitas', title: 'Profitability Analysis', color: '--c1' },
    { id: 'k2', href: 'credit-risk.html', code: 'K2', nm: 'Risiko Kredit', title: 'Credit Risk Analysis', color: '--c2' },
    { id: 'k3', href: 'revenue.html', code: 'K3', nm: 'Pendapatan', title: 'Revenue & Operating Income', color: '--c3' },
    { id: 'k4', href: 'operating-assets.html', code: 'K4', nm: 'Aset Operasi', title: 'Operating Assets', color: '--c4' },
    { id: 'k5', href: 'liabilities.html', code: 'K5', nm: 'Liabilitas', title: 'Liabilities & Nonowner Financing', color: '--c5' },
    { id: 'k6', href: 'equity.html', code: 'K6', nm: 'Ekuitas', title: 'Equity & Owner Financing', color: '--c6' }
  ];
  var EXTRA = [
    { id: 'rumus', href: 'rumus.html', code: 'Rumus', nm: '' },
    { id: 'istilah', href: 'istilah.html', code: 'Kamus', nm: '' },
    { id: 'kuis', href: 'kuis.html', code: 'Kuis', nm: '' }
  ];
  var pageId = body.getAttribute('data-page') || 'home';
  var isChapter = /^k\d$/.test(pageId);
  var ALK = window.ALK = { pages: PAGES, store: store, $: $ };

  /* ---------- Toast ---------- */
  var toastEl, toastT;
  ALK.toast = function (msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 1900);
  };

  /* ---------- Theme: auto (ikuti presentasi) → terang → gelap ---------- */
  var MODES = ['auto', 'light', 'dark'];
  var LABEL = { auto: 'Tema: ikuti presentasi', light: 'Tema: terang', dark: 'Tema: gelap' };
  var ICON = {
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
  };
  var mode = store.get('alk:theme', 'auto');
  if (MODES.indexOf(mode) < 0) mode = 'auto';
  function applyTheme() {
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode);
    else if (pageId === 'k1') root.setAttribute('data-theme', 'dark');      // presentasi K1 gelap
    else if (isChapter) root.setAttribute('data-theme', 'light');           // K2–K6 terang
    else root.removeAttribute('data-theme');                                // beranda: ikuti sistem
  }
  applyTheme();

  /* ---------- Site header ---------- */
  var header = $('header.site');
  if (header) {
    var links = PAGES.concat(EXTRA).map(function (p) {
      var cur = p.id === pageId;
      var dot = p.color ? '<i style="background:var(' + p.color + ')"></i>' : '';
      return '<a href="' + p.href + '"' + (cur ? ' aria-current="page"' : '') + ' title="' + (p.title || p.code) + '">' + dot + '<b>' + p.code + '</b>' + (p.nm ? '<span class="nm">&nbsp;' + p.nm + '</span>' : '') + '</a>';
    }).join('');
    header.innerHTML = '<div class="row">' +
      '<a class="brand" href="index.html" aria-label="Beranda"><span class="dot">ALK</span><span class="txt">Rangkuman UTS</span></a>' +
      '<nav class="chapters" aria-label="Materi">' + links + '</nav>' +
      '<button class="icon-btn" id="themeBtn" type="button"></button></div>';
    var nav = $('nav.chapters', header), cur = $('[aria-current="page"]', header);
    if (cur) nav.scrollLeft = cur.offsetLeft - nav.clientWidth / 2 + cur.offsetWidth / 2;
    var tb = $('#themeBtn');
    var paintBtn = function () { tb.innerHTML = ICON[mode]; tb.setAttribute('aria-label', LABEL[mode] + ' (ketuk untuk ganti)'); tb.title = LABEL[mode]; };
    paintBtn();
    tb.addEventListener('click', function () {
      mode = MODES[(MODES.indexOf(mode) + 1) % 3]; store.set('alk:theme', mode); applyTheme(); paintBtn(); ALK.toast(LABEL[mode]);
    });
  }

  /* ---------- Reading progress, hide-on-scroll header, back to top ---------- */
  var bar = document.createElement('div'); bar.className = 'readbar'; bar.setAttribute('aria-hidden', 'true'); body.appendChild(bar);
  var top = document.createElement('button'); top.className = 'totop'; top.type = 'button'; top.setAttribute('aria-label', 'Kembali ke atas');
  top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  body.appendChild(top);
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h) : 0);
    if (y > lastY + 8 && y > 160) body.classList.add('hdr-hide');
    else if (y < lastY - 8 || y < 80) body.classList.remove('hdr-hide');
    top.classList.toggle('on', y > 900);
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  // Saat lompat via anchor, tampilkan lagi header agar konteks tetap terlihat
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href^="#"]'); if (a) body.classList.remove('hdr-hide'); });

  /* ---------- Pager ---------- */
  var pager = $('.pager[data-auto]');
  if (pager) {
    var i = PAGES.findIndex(function (p) { return p.id === pageId; });
    var prev = PAGES[i - 1], next = PAGES[i + 1];
    pager.innerHTML =
      (prev ? '<a href="' + prev.href + '"><small>← Sebelumnya</small><b>' + prev.title + '</b></a>' : '<a href="index.html"><small>← Kembali</small><b>Beranda</b></a>') +
      (next ? '<a href="' + next.href + '"><small>Berikutnya →</small><b>' + next.title + '</b></a>' : '<a href="kuis.html"><small>Lanjut →</small><b>Kuis Campuran</b></a>');
  }

  /* ---------- Glossary flip cards: <div class="terms" data-terms="ROE|ROA"> ---------- */
  var G = {};
  (window.GLOSSARY || []).forEach(function (g) { G[g[0]] = g; });
  ALK.glossary = G;
  $$('.terms[data-terms]').forEach(function (box) {
    var keys = box.getAttribute('data-terms').split('|').map(function (k) { return k.trim(); }).filter(function (k) { return G[k]; });
    if (!keys.length) { box.remove(); return; }
    box.innerHTML = '<span class="tl">Istilah &amp; singkatan · ketuk kartu</span><div class="row">' + keys.map(function (k) {
      var g = G[k];
      return '<button class="flip" type="button"><span class="flip-in"><span class="face front"><span class="ab">' + g[0] + '</span><span class="hint">' + (g[1] && g[1] !== g[0] ? 'ketuk: kepanjangan' : 'ketuk: artinya') + '</span></span><span class="face back"><b>' + g[1] + '</b>' + g[2] + '</span></span></button>';
    }).join('') + '</div>';
  });

  /* ---------- Flip cards ---------- */
  $$('.flip').forEach(function (f) {
    f.setAttribute('type', 'button'); f.setAttribute('aria-pressed', 'false');
    f.addEventListener('click', function () { var on = f.classList.toggle('on'); f.setAttribute('aria-pressed', on); });
  });

  /* ---------- "Tandai paham" progress ---------- */
  var done = store.get('alk:done', {});
  var doneBtns = $$('button.done[data-done]');
  function paintDone() {
    doneBtns.forEach(function (b) {
      var on = !!done[b.dataset.done];
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? 'Sudah paham' : 'Tandai paham';
      var sec = b.closest('section');
      if (sec && sec.id) { var a = $('nav.toc a[href="#' + sec.id + '"]'); if (a) a.classList.toggle('ok', on); }
    });
  }
  doneBtns.forEach(function (b) {
    b.type = 'button';
    b.addEventListener('click', function () {
      if (done[b.dataset.done]) delete done[b.dataset.done]; else done[b.dataset.done] = 1;
      store.set('alk:done', done); paintDone();
      var n = doneBtns.filter(function (x) { return done[x.dataset.done]; }).length;
      ALK.toast(done[b.dataset.done] ? 'Ditandai paham · ' + n + ' / ' + doneBtns.length + ' bagian' : 'Tanda dihapus');
    });
  });
  paintDone();
  if (doneBtns.length && isChapter) store.set('alk:total:' + pageId, doneBtns.length);
  ALK.progress = function (id) {
    var d = store.get('alk:done', {}), n = 0;
    Object.keys(d).forEach(function (k) { if (k.indexOf(id + '-') === 0) n++; });
    return { done: n, total: store.get('alk:total:' + id, null) };
  };

  /* ---------- TOC active section (geser container, bukan halaman) ---------- */
  var tocRow = $('nav.toc .row'), tocLinks = $$('nav.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || !map[e.target.id]) return;
        tocLinks.forEach(function (a) { a.classList.remove('on'); a.removeAttribute('aria-current'); });
        var a = map[e.target.id]; a.classList.add('on'); a.setAttribute('aria-current', 'location');
        var left = a.offsetLeft - tocRow.clientWidth / 2 + a.offsetWidth / 2;
        tocRow.scrollTo({ left: left, behavior: reduce ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Segmented controls ---------- */
  ALK.seg = function (el, cb) {
    var bs = $$('button', el);
    el.setAttribute('role', 'group');
    function pick(b) { bs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); cb(b.dataset.v, b); }
    bs.forEach(function (b) { b.type = 'button'; b.addEventListener('click', function () { pick(b); }); });
    var first = $('[aria-pressed="true"]', el) || bs[0];
    if (first) pick(first);
  };

  /* ---------- Range fill (track terisi sampai thumb) ---------- */
  function fill(r) { var mn = +r.min || 0, mx = +r.max || 100; r.style.setProperty('--fill', ((r.value - mn) / (mx - mn) * 100) + '%'); }
  document.addEventListener('input', function (e) { if (e.target.type === 'range') fill(e.target); });
  ALK.refreshRanges = function () { $$('input[type=range]').forEach(fill); };
  ALK.refreshRanges();
  // nilai slider yang diubah lewat preset (JS) juga perlu diperbarui
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.seg')) setTimeout(ALK.refreshRanges, 0); });

  /* ---------- Bars: animasi hanya untuk yang di bawah layar ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var vh = window.innerHeight;
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('armed'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    $$('.bars').forEach(function (el) { if (el.getBoundingClientRect().top > vh) { el.classList.add('armed'); obs.observe(el); } });
  }

  /* ---------- Formatting ---------- */
  ALK.fmt = function (n, d) {
    if (!isFinite(n)) return '–';
    return Number(n).toLocaleString('id-ID', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  };

  /* ---------- Quiz: satu soal per layar, umpan balik langsung, ulas yang salah ---------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  ALK.quiz = function (el, items, opts) {
    opts = opts || {};
    var list, idx, res, answered;
    var box = document.createElement('div'); box.className = 'qz'; box.tabIndex = -1;
    el.innerHTML = ''; el.appendChild(box);
    function start(src) { list = src; idx = 0; res = []; draw(); }
    function fresh() { return opts.shuffle ? shuffle(items).slice(0, opts.limit || items.length) : items.slice(); }
    function dots() { return '<span class="qz-dots" aria-hidden="true">' + list.map(function (_, i) { return '<i class="' + (res[i] === true ? 'r' : res[i] === false ? 'w' : i === idx ? 'c' : '') + '"></i>'; }).join('') + '</span>'; }
    function score() { return res.filter(function (x) { return x === true; }).length; }
    function draw() {
      if (idx >= list.length) return end();
      answered = false;
      var it = list[idx];
      box.innerHTML = '<div class="qz-top"><span>Soal <b>' + (idx + 1) + '</b> dari ' + list.length + '</span><span>Benar <b>' + score() + '</b></span>' + dots() + '</div>' +
        '<div class="qz-card"><div class="qz-q">' + (it.tag ? '<span class="tag">' + it.tag + '</span>' : '') + it.q + '</div><div class="qz-opts" role="group" aria-label="Pilihan jawaban"></div>' +
        '<div class="qz-fb" hidden aria-live="polite"></div><div class="qz-act"><span class="kb">Tekan A–D atau 1–4 untuk menjawab</span><button class="btn" type="button" hidden>Lanjut →</button></div></div>';
      var opt = $('.qz-opts', box);
      it.o.forEach(function (o, oi) {
        var b = document.createElement('button'); b.type = 'button';
        b.innerHTML = '<span class="l">' + 'ABCD'[oi] + '</span><span>' + o + '</span>';
        b.addEventListener('click', function () { answer(oi); });
        opt.appendChild(b);
      });
      $('.qz-act .btn', box).addEventListener('click', next);
    }
    function answer(oi) {
      if (answered) return; answered = true;
      var it = list[idx], ok = oi === it.a; res[idx] = ok;
      $$('.qz-opts button', box).forEach(function (b, bi) { b.disabled = true; if (bi === it.a) b.classList.add('right'); if (bi === oi && !ok) b.classList.add('wrong'); });
      var fb = $('.qz-fb', box); fb.hidden = false;
      fb.innerHTML = (ok ? '<b class="good">Benar.</b> ' : '<b class="bad">Kurang tepat.</b> Jawaban: <b>' + 'ABCD'[it.a] + '</b>. ') + (it.w || '');
      $('.qz-top', box).innerHTML = '<span>Soal <b>' + (idx + 1) + '</b> dari ' + list.length + '</span><span>Benar <b>' + score() + '</b></span>' + dots();
      var nb = $('.qz-act .btn', box); nb.hidden = false; nb.textContent = idx + 1 < list.length ? 'Lanjut →' : 'Lihat hasil →';
      $('.qz-act .kb', box).textContent = 'Enter untuk lanjut';
      nb.focus({ preventScroll: true });
    }
    function next() { idx++; draw(); keepInView(); }
    function keepInView() { var r = box.getBoundingClientRect(); if (r.top < 90 || r.top > window.innerHeight * .6) box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); }
    function end() {
      var s = score(), wrong = list.filter(function (_, i) { return res[i] === false; });
      var pct = Math.round(s / list.length * 100);
      box.innerHTML = '<div class="qz-card qz-end"><span class="small muted">Hasil</span><span class="big">' + s + ' / ' + list.length + '</span><p>' +
        (pct >= 80 ? 'Mantap, sudah siap ujian untuk bagian ini.' : pct >= 50 ? 'Lumayan. Ulas soal yang salah, lalu coba lagi.' : 'Baca ulang bagian terkait, lalu ulangi kuisnya.') + '</p>' +
        (wrong.length ? '<div class="qz-rev">' + wrong.map(function (w) { return '<div><b>' + w.q + '</b><br><span class="good">✓ ' + w.o[w.a] + '</span><br><span class="small muted">' + (w.w || '') + '</span></div>'; }).join('') + '</div>' : '') +
        '<div class="cta" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">' + (wrong.length ? '<button class="btn" type="button" data-a="wrong">Ulangi yang salah (' + wrong.length + ')</button>' : '') + '<button class="btn ghost" type="button" data-a="all">Acak ulang semua</button></div></div>';
      $$('[data-a]', box).forEach(function (b) { b.addEventListener('click', function () { start(b.dataset.a === 'wrong' ? wrong : shuffle(items).slice(0, opts.limit || items.length)); keepInView(); }); });
    }
    // Keyboard: hanya saat kuis terlihat di layar
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test(document.activeElement.tagName)) return;
      var r = box.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) return;
      var k = e.key.toLowerCase(), m = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      if (!answered && m.hasOwnProperty(k) && list[idx] && m[k] < list[idx].o.length) { e.preventDefault(); answer(m[k]); }
      else if (answered && e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); next(); }
    });
    start(fresh());
  };

  $$('[data-quiz]').forEach(function (el) {
    var key = el.getAttribute('data-quiz');
    if (window.QUIZ && window.QUIZ[key]) ALK.quiz(el, window.QUIZ[key]);
  });
})();
