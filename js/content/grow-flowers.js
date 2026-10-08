/* GW · Grow: flowers (bulbs, dahlias, sunflowers, container pots, dividing perennials) and grower skills
   (compost, no-dig beds, organic pest control, seed saving, harvest/cure/store). Real meters (unit: 1).
   Plant helpers are copied from grow.js so the section looks consistent. */
(function () {
  const TB = window.TB;
  const DS = THREE.DoubleSide;
  const GARDEN = (o) =>
    Object.assign({ unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 10 }, tex: ['wood_planks', 'forrest_ground_01', 'pine_bark', 'interlocking_concrete_pavers'] }, o);
  const FLW = [];
  const SKL = [];

  /* ---------- plant kit (copied from grow.js) ---------- */
  const leafMat = (K, c, r) => K.std(c || 0x4f8f3a, { roughness: r || 0.7, side: DS });
  const soilMat = (K, c) => K.bumpy(c || 0x5a4030, TB.tex.speckle(), 0.03, { roughness: 1 });
  function leafPts(L, W, n, serr) {
    n = n || 10;
    const R = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      let w = Math.pow(Math.sin(Math.PI * t), 0.8) * W * (1 - 0.3 * t);
      if (serr && i % 2 && i < n) w *= 0.78;
      R.push([w, t * L]);
    }
    const out = R.slice();
    for (let i = n - 1; i >= 1; i--) out.push([-R[i][0], R[i][1]]);
    return out;
  }
  // Heart-shaped leaf (sunflower, sweet potato vine, hosta-ish when wide).
  function heartPts(L, W, n) {
    n = n || 12;
    const R = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const w = W * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.08)), 0.7) * (1 - 0.55 * t) * (t < 0.08 ? 0.6 + t * 5 : 1);
      R.push([w, t * L - 0.08 * L * (1 - Math.min(1, t * 6))]);
    }
    const out = [[0, 0]].concat(R.slice(1));
    for (let i = n - 1; i >= 1; i--) out.push([-R[i][0], R[i][1]]);
    return out;
  }
  function strapPts(L, W) {
    return [[W / 2, 0], [W / 2, L * 0.75], [W * 0.15, L], [-W * 0.15, L], [-W / 2, L * 0.75], [-W / 2, 0]];
  }
  const orient = (K, p, pos, yaw, elev) => K.group(K.group(p, pos, [0, yaw, 0]), [0, 0, 0], [90 - elev, 0, 0]);
  function leaf(K, p, pos, yaw, elev, L, W, mat, serr) {
    const g = orient(K, p, pos, yaw, elev);
    K.ext(g, leafPts(L, W, 10, serr), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  function heart(K, p, pos, yaw, elev, L, W, mat) {
    const g = orient(K, p, pos, yaw, elev);
    K.ext(g, heartPts(L, W), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  function strap(K, p, pos, yaw, elev, L, W, mat, bend) {
    const g = orient(K, p, pos, yaw, elev);
    if (!bend) {
      K.ext(g, strapPts(L, W), 0.0012, mat, [0, 0, -0.0006], null, 0);
      return g;
    }
    K.ext(g, [[W / 2, 0], [W / 2, L * 0.55], [-W / 2, L * 0.55], [-W / 2, 0]], 0.0012, mat, [0, 0, -0.0006], null, 0);
    const g2 = K.group(g, [0, L * 0.55, 0], [bend, 0, 0]);
    K.ext(g2, strapPts(L * 0.45, W * 0.95), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  function compound(K, p, pos, yaw, elev, L, mat, stemMat, pairs) {
    const g = orient(K, p, pos, yaw, elev);
    K.bar(g, [0, 0, 0], [0, L, 0.0], 0.0022, stemMat);
    (pairs || [0.32, 0.58, 0.82]).forEach((t, i) => {
      const s = 1 - i * 0.12;
      [-1, 1].forEach((sd) => {
        const lg = K.group(g, [0, t * L, 0], [0, 0, sd * -58]);
        K.ext(lg, leafPts(L * 0.3 * s, L * 0.13 * s, 8, true), 0.0012, mat, [0, 0, -0.0006], null, 0);
      });
    });
    K.ext(K.group(g, [0, L * 0.95, 0]), leafPts(L * 0.32, L * 0.14, 8, true), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  function rain(K, p, from, n, spread, fall) {
    const drops = [];
    for (let i = 0; i < n; i++) {
      const d = K.sph(p, 0.006, 'water', [from[0] + Math.sin(i * 7.3) * spread, from[1], from[2] + Math.cos(i * 3.1) * spread], [0.8, 1.6, 0.8]);
      d.userData.noPick = true;
      drops.push({ d, y0: from[1], k: i / n });
    }
    return (t, on) => drops.forEach((o) => {
      o.d.visible = on;
      if (on) o.d.position.y = o.y0 - fall * ((t * 1.3 + o.k) % 1);
    });
  }
  function specks(K, p, n, y, mat, size, w, d) {
    for (let i = 0; i < n; i++) K.cyl(p, [size, size, size * 0.6, 6], mat, [Math.sin(i * 12.99) * w, y, Math.cos(i * 7.77 + i * i * 0.01) * d]);
  }
  // Cedar bed with the front board left off so the cut soil face shows what happens underground.
  function cutBed(K, name, label, W, D, H, T, soilColor) {
    const g = K.part(name, [0, 0, 0], null, label);
    const cedar = K.pbr('wood_planks', [0.4, 1.2], { color: 0xd8a27a }, 'wood');
    const rows = Math.max(1, Math.round(H / 0.14));
    const bh = H / rows;
    for (let r = 0; r < rows; r++) {
      const y = bh / 2 + r * bh;
      K.box(g, [W + 0.076, bh - 0.004, 0.038], cedar, [0, y, -D / 2 - 0.019], null, 0.004);
      [-1, 1].forEach((s) => K.box(g, [0.038, bh - 0.004, D], cedar, [s * (W / 2 + 0.019), y, 0], null, 0.004));
    }
    K.box(g, [W, T, D], soilMat(K, soilColor), [0, T / 2, 0], null, 0.003);
    return g;
  }
  // Half (back) lathe: a pot or bin cut open toward +z.
  function halfLathe(K, p, pts, mat, pos) {
    const geo = new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), 40, Math.PI / 2, Math.PI);
    const m = new THREE.Mesh(geo, (typeof mat === 'string' ? K.m[mat] : mat).clone());
    m.material.side = DS;
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    p.add(m);
    return m;
  }
  // Half cylinder (back half) with a flat cut face at z = 0: a soil layer in a cut-away container.
  function halfLayer(K, p, r0, r1, y0, y1, mat, faceMat) {
    const h = y1 - y0;
    const geo = new THREE.CylinderGeometry(r1, r0, h, 40, 1, false, Math.PI / 2, Math.PI);
    const m = new THREE.Mesh(geo, typeof mat === 'string' ? K.m[mat] : mat);
    m.position.set(0, (y0 + y1) / 2, 0);
    p.add(m);
    K.ext(p, [[-r0, y0], [r0, y0], [r1, y1], [-r1, y1]], 0.002, faceMat || mat, [0, 0, -0.001], null, 0);
    return m;
  }
  function daisy(K, p, h, n, petal, center, droop, M) {
    for (let s = 0; s < n; s++) {
      const a = s * 2.4;
      const top = [Math.cos(a) * 0.07, h * (0.85 + (s % 3) * 0.08), Math.sin(a) * 0.07];
      K.bar(p, [0, 0, 0], top, 0.003, M.stem);
      K.lathe(p, [[0.008, 0], [0.025, -droop * 0.3], [0.045, -droop]], petal, top);
      K.sph(p, 0.016, center, [top[0], top[1] + 0.006, top[2]], [1, droop > 0.01 ? 1.2 : 0.7, 1]);
    }
  }
  function rootFan(K, p, x, top, depth, spread, n, mat, z) {
    for (let k = 0; k < n; k++) {
      const a = -1 + (2 * k) / (n - 1);
      const d = depth * (0.55 + 0.45 * Math.cos(a * 1.2));
      K.tube(p, [[x, top, z], [x + a * spread * 0.3, top - d * 0.35, z], [x + a * spread * 0.7, top - d * 0.75, z], [x + a * spread, top - d, z]], 0.0018, mat);
    }
  }
  const potLathe = (R, H) => {
    const rb = R * 0.74;
    return [[0, 0.012], [rb - 0.012, 0.012], [R - 0.012, H - 0.03], [R - 0.012, H], [R + 0.014, H], [R + 0.014, H - 0.04], [R, H - 0.04], [rb, 0], [0, 0]];
  };
  // A soil thermometer stuck in the ground (dial up).
  function soilThermo(K, name, pos, label) {
    const th = K.part(name, pos, null, label);
    K.cyl(th, [0.003, 0.003, 0.14, 8], 'steel', [0, 0.02, 0]);
    K.cyl(th, [0.03, 0.03, 0.012, 24], 'steel', [0, 0.095, 0], [70, 0, 0]);
    K.cyl(th, [0.026, 0.026, 0.002, 24], K.std(0xf4f2ea, { roughness: 0.5 }), [0, 0.097, 0.006], [70, 0, 0]);
    K.box(th, [0.002, 0.018, 0.001], 'red', [0, 0.1, 0.009], [70, 0, 30], 0);
    return th;
  }
  // Garden (spading) fork lying or standing; origin at the tine tips, handle up +Y.
  function gardenFork(K, name, pos, rot, label) {
    const g = K.part(name, pos, null, label || 'Garden fork');
    const r = K.group(g, [0, 0, 0], rot || [0, 0, 0]);
    [-0.045, -0.015, 0.015, 0.045].forEach((x) => K.bar(r, [x, 0, 0], [x * 0.9, 0.26, 0], 0.0045, 'forged'));
    K.box(r, [0.11, 0.025, 0.02], 'forged', [0, 0.27, 0], null, 0.004);
    K.cyl(r, [0.014, 0.016, 0.12, 12], 'forged', [0, 0.34, 0]);
    K.cyl(r, [0.016, 0.016, 0.7, 12], 'hickory', [0, 0.74, 0]);
    K.box(r, [0.11, 0.02, 0.03], 'gripBlack', [0, 1.1, 0], null, 0.008);
    return g;
  }


  TB.category({
    id: 'grow-flowers',
    icon: 'flower',
    code: 'FLW',
    name: 'Flowers',
    domain: 'grow',
    kind: 'grow',
    blurb: 'Bulbs, dahlias, sunflowers, container pots and dividing perennials, season by season',
    repairs: FLW,
  });
  TB.category({
    id: 'grow-skills',
    icon: 'sprout',
    code: 'SKL',
    name: 'Grower skills',
    domain: 'grow',
    kind: 'grow',
    blurb: 'Compost, no-dig beds, organic pest control, seed saving and storing the harvest',
    repairs: SKL,
  });
})();
