/* Toolbox UI: routing, pages, walkthrough sync, Learn mode and saved progress. */
(function () {
  const TB = window.TB;
  const $ = (s, el) => (el || document).querySelector(s);
  const main = $('#main');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('tb:' + k);
        return v == null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('tb:' + k, JSON.stringify(v));
      } catch (e) {}
    },
  };

  const byId = {};
  for (const c of TB.categories) for (const r of c.repairs) byId[r.id] = { cat: c, rep: r };

  /* ---------- Learn mode ---------- */
  const toggle = $('#learn');
  function setLearn(on) {
    document.body.classList.toggle('learn', on);
    toggle.setAttribute('aria-checked', on ? 'true' : 'false');
    $('.learn-state', toggle).textContent = on ? 'ON' : 'OFF';
    store.set('learn', on);
  }
  toggle.addEventListener('click', () => setLearn(!document.body.classList.contains('learn')));
  setLearn(store.get('learn', false));

  /* ---------- Shared bits ---------- */
  const LEVEL = { 1: 'Easy', 2: 'Moderate', 3: 'Advanced' };
  const level = (n) =>
    `<span class="pill lvl-${n}"><span class="dots">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>${LEVEL[n]}</span>`;
  const progressOf = (r) => (store.get('done:' + r.id, []) || []).length;
  const ICON = {
    prev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>',
    next: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 3 5 5-5 5"/></svg>',
    play: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z"/></svg>',
    pause: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3.5" y="2.5" width="3" height="11" rx="1"/><rect x="9.5" y="2.5" width="3" height="11" rx="1"/></svg>',
    reset: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2.5 8a5.5 5.5 0 1 0 1.7-4"/><path d="M2.5 2.5v3h3"/></svg>',
    xray: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="12" height="12" rx="2" stroke-dasharray="2 2"/><circle cx="8" cy="8" r="2.5"/></svg>',
    tag: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2 2h6l6 6-6 6-6-6z"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor"/></svg>',
  };

  let viewer = null;
  let playTimer = null;
  function teardown() {
    clearInterval(playTimer);
    playTimer = null;
    if (viewer) viewer.destroy();
    viewer = null;
  }

  /* ---------- Home ---------- */
  function renderHome() {
    const total = TB.categories.reduce((n, c) => n + c.repairs.length, 0);
    let html = `<header class="home-head">
      <h1>What needs fixing?</h1>
      <p>${total} repairs across ${TB.categories.length} categories. Every one comes with a 3D walkthrough you can turn, zoom and step through, plus the tools, causes and a clear point where you should call a pro.</p>
      <span class="learn-hint">Turn on <b>Learn mode</b> (top right) to see how each system works, why every step matters, key numbers and common mistakes.</span>
    </header>`;
    for (const d of TB.DOMAINS) {
      const cats = TB.categories.filter((c) => c.domain === d.id);
      if (!cats.length) continue;
      html += `<section class="domain"><div class="domain-head"><h2>${d.name}</h2><p>${d.blurb}</p></div><div class="cat-grid">`;
      for (const c of cats) {
        html += `<a class="cat-card" href="#${c.id}">
          <div class="cat-top"><span class="code">${c.code}</span><span class="count">${c.repairs.length} repairs</span></div>
          <h3>${esc(c.name)}</h3>
          <ul>${c.repairs.map((r) => `<li>${esc(r.title)}</li>`).join('')}</ul>
        </a>`;
      }
      html += `</div></section>`;
    }
    main.innerHTML = html;
    document.title = 'Toolbox';
  }

  /* ---------- Category ---------- */
  function repCard(r) {
    const done = progressOf(r);
    return `<a class="rep-card" href="#${byId[r.id].cat.id}.${r.id}">
      <h3>${esc(r.title)}</h3>
      <p>${esc(r.summary)}</p>
      <div class="meta">${level(r.level)}<span class="pill">${r.time}</span><span class="pill">${r.cost}</span><span class="pill d3">3D · ${r.steps.length} steps</span>${
        done ? `<span class="pill prog">${done}/${r.steps.length} done</span>` : ''
      }</div>
    </a>`;
  }
  function renderCategory(c) {
    main.innerHTML = `<nav class="crumbs"><a href="#">All categories</a><span class="sep">/</span><span>${esc(c.name)}</span></nav>
      <header class="cat-head"><span class="code" style="width:fit-content">${c.code}</span><h1>${esc(c.name)}</h1><p>${esc(c.blurb)}</p></header>
      <div class="rep-list">${c.repairs.map(repCard).join('')}</div>`;
    document.title = c.name + ' · Toolbox';
  }

  /* ---------- Repair ---------- */
  function renderRepair(c, r) {
    const doneSet = new Set(store.get('done:' + r.id, []));
    const toolSet = new Set(store.get('tools:' + r.id, []));
    const L = r.learn || {};
    const steps = r.steps;
    const n = steps.length;

    main.innerHTML = `<nav class="crumbs"><a href="#">All categories</a><span class="sep">/</span><a href="#${c.id}">${esc(c.name)}</a><span class="sep">/</span><span>${esc(r.title)}</span></nav>
    <div class="repair">
      <div class="stage-col">
        <div class="stage" id="stage">
          <div class="stage-tools">
            <button class="tool-btn" id="t-reset" title="Return camera to this step">${ICON.reset}<span>View</span></button>
            <button class="tool-btn" id="t-xray" aria-pressed="false" title="See through housings">${ICON.xray}<span>X-ray</span></button>
            <button class="tool-btn" id="t-labels" aria-pressed="true" title="Show part labels">${ICON.tag}<span>Labels</span></button>
          </div>
          <div class="pick-toast" id="pick"></div>
          <div class="stage-hint">Drag to rotate · scroll or pinch to zoom · tap a part to name it</div>
        </div>
        <div class="walk" aria-live="polite">
          <div class="walk-top"><span class="walk-step" id="w-step"></span><span class="walk-title" id="w-title"></span></div>
          <p class="walk-text" id="w-text"></p>
          <div class="walk-ctrl">
            <button class="btn" id="w-prev" aria-label="Previous step">${ICON.prev}</button>
            <button class="btn primary" id="w-next">Start${ICON.next}</button>
            <button class="btn" id="w-play" aria-label="Play walkthrough">${ICON.play}</button>
            <div class="ticks" id="w-ticks">${['Overview'].concat(steps.map((s) => s.t)).map((t, i) => `<button title="${esc(i ? i + '. ' + t : t)}" data-i="${i}" aria-label="${esc(t)}"></button>`).join('')}</div>
          </div>
        </div>
      </div>

      <article class="doc">
        <header class="doc-head">
          <span class="code" style="width:fit-content">${c.code} · ${esc(c.name)}</span>
          <h1>${esc(r.title)}</h1>
          <div class="meta">${level(r.level)}<span class="pill">${r.time}</span><span class="pill">${r.cost}</span></div>
          <p class="summary">${esc(r.summary)}</p>
        </header>

        ${L.how ? `<section class="section learn-only learn-panel"><h2>How it works</h2><p class="how">${esc(L.how)}</p>
          ${L.specs && L.specs.length ? `<div class="specs">${L.specs.map(([k, v]) => `<div class="spec"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>` : ''}
        </section>` : ''}

        <section class="section box safety"><h2>Safety first</h2><ul>${r.safety.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></section>

        <section class="section"><h2>Likely causes</h2><div class="causes">${r.causes
          .map(([t, d], i) => `<div class="cause"><span class="n">${i + 1}</span><b>${esc(t)}</b><p>${esc(d)}</p></div>`)
          .join('')}</div></section>

        <section class="section"><h2>Tools & parts · tap to check off</h2><ul class="tools">${r.tools
          .map((t, i) => `<li><button data-tool="${i}" aria-pressed="${toolSet.has(i)}">${esc(t)}</button></li>`)
          .join('')}</ul></section>

        <section class="section"><h2>Steps · tap the number to mark done</h2><ol class="steps" id="steps">${steps
          .map(
            (s, i) => `<li class="step ${doneSet.has(i) ? 'done' : ''}" id="s${i + 1}">
              <button class="step-num" data-done="${i}" aria-pressed="${doneSet.has(i)}" aria-label="Mark step ${i + 1} done">${i + 1}</button>
              <div class="step-t"><span>${esc(s.t)}</span><button class="view" data-go="${i + 1}">Show in 3D</button></div>
              <p class="step-d">${esc(s.d)}</p>
              <div>${s.tip ? `<p class="step-tip">${esc(s.tip)}</p>` : ''}${s.why ? `<div class="why learn-only"><b>WHY</b><span>${esc(s.why)}</span></div>` : ''}</div>
            </li>`
          )
          .join('')}</ol>
          <div class="reset-row" style="margin-top:10px"><span id="prog-text"></span><button class="linkbtn" id="clear">Clear my progress</button></div>
        </section>

        ${L.terms && L.terms.length ? `<section class="section learn-only"><h2>Know the terms</h2><dl class="terms">${L.terms.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl></section>` : ''}

        ${(L.mistakes && L.mistakes.length) || (L.tips && L.tips.length) ? `<section class="section learn-only"><div class="two">
          ${L.mistakes && L.mistakes.length ? `<div class="card"><h3>Common mistakes</h3><ul class="mlist bad">${L.mistakes.map((m) => `<li><span>${esc(m)}</span></li>`).join('')}</ul></div>` : ''}
          ${L.tips && L.tips.length ? `<div class="card"><h3>Pro tips</h3><ul class="mlist good">${L.tips.map((m) => `<li><span>${esc(m)}</span></li>`).join('')}</ul></div>` : ''}
        </div></section>` : ''}

        <section class="section box pro"><h2>Call a pro if</h2><p>${esc(r.pro)}</p></section>
      </article>
    </div>`;
    document.title = r.title + ' · Toolbox';

    /* tools strike-through */
    main.querySelectorAll('[data-tool]').forEach((b) =>
      b.addEventListener('click', () => {
        const i = +b.dataset.tool;
        toolSet.has(i) ? toolSet.delete(i) : toolSet.add(i);
        b.setAttribute('aria-pressed', toolSet.has(i));
        store.set('tools:' + r.id, [...toolSet]);
      })
    );

    /* step done toggles */
    const progText = $('#prog-text');
    const paintProg = () => {
      progText.textContent = `${doneSet.size} of ${n} steps done`;
      main.querySelectorAll('#w-ticks button').forEach((b) => b.classList.toggle('done', +b.dataset.i > 0 && doneSet.has(+b.dataset.i - 1)));
    };
    main.querySelectorAll('[data-done]').forEach((b) =>
      b.addEventListener('click', () => {
        const i = +b.dataset.done;
        doneSet.has(i) ? doneSet.delete(i) : doneSet.add(i);
        b.setAttribute('aria-pressed', doneSet.has(i));
        b.closest('.step').classList.toggle('done', doneSet.has(i));
        store.set('done:' + r.id, [...doneSet]);
        paintProg();
      })
    );
    $('#clear').addEventListener('click', () => {
      doneSet.clear();
      toolSet.clear();
      store.set('done:' + r.id, []);
      store.set('tools:' + r.id, []);
      main.querySelectorAll('.step').forEach((s) => s.classList.remove('done'));
      main.querySelectorAll('[data-done],[data-tool]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      paintProg();
    });

    /* 3D walkthrough */
    const stage = $('#stage');
    const pickEl = $('#pick');
    let pickT;
    viewer = new TB.Viewer(stage, {
      onPick(_, label) {
        pickEl.textContent = label;
        pickEl.classList.add('show');
        clearTimeout(pickT);
        pickT = setTimeout(() => pickEl.classList.remove('show'), 1800);
      },
    });
    viewer.load(r.model);
    const states = TB.buildStates(steps, r.model, r.intro);
    let cur = 0;
    const poseAt = (i) => (i === 0 ? r.intro || {} : steps[i - 1].v || {});

    function go(i, opts) {
      opts = opts || {};
      cur = Math.max(0, Math.min(n, i));
      viewer.go(poseAt(cur), states[cur], opts.animate !== false);
      $('#w-step').textContent = cur === 0 ? 'Overview' : `Step ${cur} of ${n}`;
      $('#w-title').textContent = cur === 0 ? r.title : steps[cur - 1].t;
      $('#w-text').textContent = cur === 0 ? 'Press Start to walk through the repair. Highlighted parts glow yellow.' : steps[cur - 1].d;
      $('#w-prev').disabled = cur === 0;
      const nx = $('#w-next');
      nx.innerHTML = (cur === 0 ? 'Start' : cur === n ? 'Back to start' : 'Next step') + ICON.next;
      main.querySelectorAll('#w-ticks button').forEach((b) => b.classList.toggle('cur', +b.dataset.i === cur));
      main.querySelectorAll('.step').forEach((s, k) => s.classList.toggle('cur', k === cur - 1));
      if (opts.scroll && cur > 0 && innerWidth > 980) {
        const el = $('#s' + cur);
        const r2 = el.getBoundingClientRect();
        if (r2.top < 80 || r2.bottom > innerHeight) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    function stopPlay() {
      clearInterval(playTimer);
      playTimer = null;
      $('#w-play').innerHTML = ICON.play;
      $('#w-play').setAttribute('aria-label', 'Play walkthrough');
    }
    $('#w-prev').addEventListener('click', () => (stopPlay(), go(cur - 1, { scroll: true })));
    $('#w-next').addEventListener('click', () => (stopPlay(), go(cur === n ? 0 : cur + 1, { scroll: true })));
    $('#w-play').addEventListener('click', () => {
      if (playTimer) return stopPlay();
      if (cur === n) go(0);
      $('#w-play').innerHTML = ICON.pause;
      $('#w-play').setAttribute('aria-label', 'Pause walkthrough');
      go(cur + 1, { scroll: true });
      playTimer = setInterval(() => {
        if (cur >= n) return stopPlay();
        go(cur + 1, { scroll: true });
      }, 5200);
    });
    main.querySelectorAll('#w-ticks button').forEach((b) => b.addEventListener('click', () => (stopPlay(), go(+b.dataset.i))));
    main.querySelectorAll('[data-go]').forEach((b) =>
      b.addEventListener('click', () => {
        stopPlay();
        go(+b.dataset.go);
        if (innerWidth <= 980) stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
    );
    $('#t-reset').addEventListener('click', () => {
      const p = poseAt(cur);
      const v = TB.MODELS[r.model].view;
      viewer.setCam(p.cam || v.cam, p.at || v.at, true);
    });
    $('#t-xray').addEventListener('click', (e) => {
      const b = e.currentTarget;
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on);
      viewer.setXray(on);
    });
    $('#t-labels').addEventListener('click', (e) => {
      const b = e.currentTarget;
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on);
      viewer.setLabels(on);
    });
    keyHandler = (e) => {
      if (/input|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') (stopPlay(), go(cur + 1, { scroll: true }));
      if (e.key === 'ArrowLeft') (stopPlay(), go(cur - 1, { scroll: true }));
    };
    paintProg();
    go(0, { animate: false });
  }
  let keyHandler = null;
  document.addEventListener('keydown', (e) => keyHandler && keyHandler(e));

  /* ---------- Search ---------- */
  const q = $('#q');
  function renderSearch(term) {
    const t = term.toLowerCase().trim();
    const hits = [];
    for (const c of TB.categories)
      for (const r of c.repairs) {
        const hay = [r.title, r.summary, c.name, ...r.causes.map((x) => x[0]), ...r.tools].join(' ').toLowerCase();
        if (t.split(/\s+/).every((w) => hay.includes(w))) hits.push({ c, r, score: r.title.toLowerCase().includes(t) ? 0 : 1 });
      }
    hits.sort((a, b) => a.score - b.score);
    main.innerHTML = `<header class="cat-head"><h1>Results for “${esc(term)}”</h1><p>${hits.length} repair${hits.length === 1 ? '' : 's'}</p></header>
      <div class="results">${
        hits.length
          ? hits.map(({ c, r }) => `<a class="result" href="#${c.id}.${r.id}"><small>${c.code} · ${esc(c.name)}</small><b>${esc(r.title)}</b><span style="color:var(--ink-soft)">${esc(r.summary)}</span></a>`).join('')
          : '<p class="empty">Nothing matched. Try a part name like “faucet”, “tire” or “breaker”.</p>'
      }</div>`;
  }
  q.addEventListener('input', () => {
    if (q.value.trim()) {
      teardown();
      keyHandler = null;
      renderSearch(q.value);
    } else route();
  });

  /* ---------- Router ---------- */
  function route() {
    teardown();
    keyHandler = null;
    const h = decodeURIComponent(location.hash.slice(1));
    const [cid, rid] = h.split('.');
    const c = TB.categories.find((x) => x.id === cid);
    if (c && rid && byId[rid]) renderRepair(c, byId[rid].rep);
    else if (c) renderCategory(c);
    else renderHome();
  }
  window.addEventListener('hashchange', () => {
    q.value = '';
    route();
    window.scrollTo(0, 0);
  });
  route();
})();
