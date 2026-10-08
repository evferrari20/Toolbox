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

  /* =====================================================================
     1 · Spring bulbs planted in fall: cut-away bed + lasagna pot
     ===================================================================== */
  function bulbMats(K) {
    return {
      tunic: K.bumpy(0xa8794a, TB.tex.speckle(), 0.01, { roughness: 0.9 }),
      dTunic: K.bumpy(0xb89a6a, TB.tex.speckle(), 0.01, { roughness: 0.9 }),
      root: K.std(0xeee6d0, { roughness: 0.8 }),
      sprout: K.std(0xd8e6a8, { roughness: 0.7 }),
      stem: K.std(0x6f9a4a, { roughness: 0.7 }),
      tleaf: leafMat(K, 0x6f9a78, 0.55),
      dleaf: leafMat(K, 0x5f9a5a, 0.55),
      yellow: leafMat(K, 0xc8b24a, 0.8),
      red: K.std(0xd42a3a, { roughness: 0.45, side: DS }),
      pink: K.std(0xe86a9a, { roughness: 0.45, side: DS }),
      dPetal: K.std(0xf6e27a, { roughness: 0.5, side: DS }),
      trumpet: K.std(0xf2a62a, { roughness: 0.5, side: DS }),
      pod: K.std(0x8aa85a, { roughness: 0.6 }),
      muscari: K.std(0x4a5ac8, { roughness: 0.6 }),
      crocus: K.std(0x9a6ad8, { roughness: 0.5, side: DS }),
    };
  }
  const tulipBulbPts = (s) => [[0, 0], [0.016 * s, 0.003 * s], [0.023 * s, 0.017 * s], [0.021 * s, 0.033 * s], [0.01 * s, 0.047 * s], [0.002 * s, 0.056 * s], [0, 0.057 * s]];
  const daffBulbPts = (s) => [[0, 0], [0.02 * s, 0.004 * s], [0.028 * s, 0.022 * s], [0.025 * s, 0.042 * s], [0.012 * s, 0.058 * s], [0.008 * s, 0.075 * s], [0, 0.08 * s]];
  // One tulip, split into the parts the walkthrough shows at each stage.
  function tulipPlant(K, P, pos, h, yaw, col, M) {
    const [x, y, z] = pos;
    if (P.shoots) [0, 140].forEach((a) => strap(K, P.shoots, [x, y, z], yaw + a, 80, 0.06, 0.03, M.tleaf));
    if (P.fol) {
      const top = [x + Math.sin(yaw) * 0.02, y + h, z + Math.cos(yaw) * 0.02];
      K.bar(P.fol, [x, y, z], top, 0.0035, M.stem);
      [0, 130, 250].forEach((a, k) => strap(K, P.fol, [x, y + 0.01 + k * 0.03, z], yaw + a, 66 - k * 6, 0.22 - k * 0.03, 0.05 - k * 0.006, M.tleaf, -22));
      if (P.fl) K.lathe(P.fl, [[0, 0], [0.014, 0.003], [0.024, 0.018], [0.027, 0.038], [0.024, 0.058], [0.02, 0.066]], col, top);
      if (P.pods) K.cyl(P.pods, [0.008, 0.006, 0.03, 10], M.pod, [top[0], top[1] + 0.015, top[2]]);
    }
    if (P.yellow) [0, 130, 250].forEach((a, k) => strap(K, P.yellow, [x, y + 0.01, z], yaw + a, 18 + k * 8, 0.22 - k * 0.03, 0.05 - k * 0.006, M.yellow, 10));
  }
  function daffPlant(K, P, pos, h, yaw, M) {
    const [x, y, z] = pos;
    if (P.shoots) [0, 90, 180, 270].forEach((a) => strap(K, P.shoots, [x, y, z], yaw + a, 84, 0.07, 0.014, M.dleaf));
    if (P.fol) {
      const top = [x, y + h, z];
      K.bar(P.fol, [x, y, z], top, 0.0035, M.stem);
      [0, 90, 180, 270].forEach((a, k) => strap(K, P.fol, [x, y + 0.005, z], yaw + a + 20, 74 - (k % 2) * 8, 0.3 - (k % 2) * 0.04, 0.014, M.dleaf, -12));
      if (P.fl) {
        K.bar(P.fl, top, [top[0] + Math.sin(yaw * K.DEG) * 0.02, top[1] + 0.01, top[2] + Math.cos(yaw * K.DEG) * 0.02], 0.003, M.stem);
        const head = orient(K, P.fl, [top[0] + Math.sin(yaw * K.DEG) * 0.02, top[1] + 0.01, top[2] + Math.cos(yaw * K.DEG) * 0.02], yaw, -12);
        for (let k = 0; k < 6; k++) leaf(K, head, [0, 0.004, 0], k * 60, 6, 0.032, 0.011, M.dPetal);
        K.lathe(head, [[0.004, 0], [0.011, 0.006], [0.012, 0.022], [0.016, 0.03]], M.trumpet);
      }
      if (P.pods) K.sph(P.pods, 0.009, M.pod, [top[0] + Math.sin(yaw * K.DEG) * 0.02, top[1] + 0.008, top[2] + Math.cos(yaw * K.DEG) * 0.02], [1, 1.4, 1]);
    }
    if (P.yellow) [0, 90, 180, 270].forEach((a, k) => strap(K, P.yellow, [x, y + 0.005, z], yaw + a + 20, 14 + k * 5, 0.28, 0.014, M.yellow, 8));
  }
  function muscari(K, p, pos, M, h) {
    const g = K.group(p, pos);
    for (let k = 0; k < 5; k++) strap(K, g, [0, 0, 0], k * 72, 40, 0.12, 0.006, M.dleaf, -20);
    K.bar(g, [0, 0, 0], [0, h, 0], 0.002, M.stem);
    for (let k = 0; k < 14; k++) K.sph(g, 0.0045, M.muscari, [Math.cos(k * 2.4) * 0.006 * (1 - k / 16), h - 0.035 + k * 0.0028, Math.sin(k * 2.4) * 0.006 * (1 - k / 16)], [1, 1.2, 1]);
  }
  function crocus(K, p, pos, M) {
    const g = K.group(p, pos);
    for (let k = 0; k < 4; k++) strap(K, g, [0, 0, 0], k * 90 + 20, 70, 0.1, 0.004, M.dleaf);
    K.bar(g, [0, 0, 0], [0, 0.07, 0], 0.002, M.sprout);
    K.lathe(g, [[0, 0], [0.008, 0.004], [0.014, 0.018], [0.015, 0.032], [0.011, 0.04]], M.crocus, [0, 0.07, 0]);
  }

  const BT = 0.36; // soil surface in the bulb bed
  const BFZ = 0.4; // cut face of the bed
  const TUL = [];
  const DAF = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) TUL.push([-0.68 + i * 0.13, BFZ - 0.015 - j * 0.135, j === 0]);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) DAF.push([0.14 + i * 0.165, BFZ - 0.015 - j * 0.16, j === 0]);
  const LAS = [-1.3, 0, 0.3]; // lasagna pot position
  TB.model(
    'gwBulbs',
    GARDEN({ cam: [2.0, 1.3, 2.2], at: [0, 0.35, 0],
      hidden: ['thermo', 'crate', 'pit', 'spoil', 'fert', 'bulbs', 'roots', 'cage', 'mulch', 'shoots', 'foliage', 'flowers', 'pods', 'yellow',
        'pot', 'potMix1', 'layer1', 'potMix2', 'layer2', 'potMix3', 'layer3', 'potTop', 'potCage', 'potShoots', 'potBloom'] }),
    (K) => {
      const M = bulbMats(K);
      cutBed(K, 'bed', 'Sunny, well-drained bed (front cut away to show the depth)', 1.6, 0.8, 0.42, BT, 0x5a4030);
      soilThermo(K, 'thermo', [0.55, BT, 0.25], 'Soil thermometer: 55°F or cooler at 6″ deep');
      // crate of bulbs
      const crate = K.part('crate', [1.25, 0, 0.6], null, 'Fresh bulbs: firm, heavy, no mold (tulips & daffodils)');
      const wd = K.pbr('wood_planks', [0.4, 0.3], { color: 0xc89a6a }, 'woodLight');
      [-1, 1].forEach((s) => {
        K.box(crate, [0.46, 0.14, 0.015], wd, [0, 0.07, s * 0.15], null, 0.003);
        K.box(crate, [0.015, 0.14, 0.3], wd, [s * 0.225, 0.07, 0], null, 0.003);
      });
      K.box(crate, [0.46, 0.012, 0.3], wd, [0, 0.006, 0], null, 0.002);
      for (let k = 0; k < 14; k++) K.lathe(crate, tulipBulbPts(1), M.tunic, [-0.19 + (k % 7) * 0.032, 0.11, -0.1 + Math.floor(k / 7) * 0.05]);
      for (let k = 0; k < 8; k++) K.lathe(crate, daffBulbPts(1), M.dTunic, [0.06 + (k % 4) * 0.045, 0.1, -0.09 + Math.floor(k / 4) * 0.08]);
      K.box(crate, [0.18, 0.12, 0.002], K.std(0xf1ead6, { roughness: 0.8 }), [0, 0.09, 0.158], null, 0);
      // planting pit (whole area dug 8″ down) + spoil
      const pit = K.part('pit', [0, 0, 0], null, 'Whole bed area dug 8″ deep (one wide hole, not 50 little ones)');
      const dark = K.std(0x24170e, { roughness: 1 });
      K.box(pit, [1.46, 0.004, 0.7], dark, [0, BT + 0.002, -0.0], null, 0);
      K.box(pit, [1.46, 0.2, 0.004], dark, [0, BT - 0.1, BFZ + 0.0015], null, 0);
      const spoil = K.part('spoil', [1.15, 0, -0.35], null, 'Dug soil on a tarp (it all goes back in)');
      K.box(spoil, [0.8, 0.006, 0.6], K.std(0x2f5f8f, { roughness: 0.7 }), [0, 0.003, 0], [0, 15, 0], 0);
      K.lathe(spoil, [[0, 0.22], [0.15, 0.19], [0.3, 0.07], [0.36, 0.0], [0, 0]], soilMat(K, 0x5a4232), [0, 0.005, 0]);
      const fert = K.part('fert', [0, BT + 0.004, 0], null, 'Bulb fertilizer per soil test, mixed into the pit bottom');
      specks(K, fert, 110, 0, K.std(0xd8cfb8, { roughness: 0.8 }), 0.005, 0.7, 0.33);
      // bulbs on the cut face (front row), pointed end up
      const bulbs = K.part('bulbs', [0, 0, 0], null, 'Bulbs pointy end up: base 6–8″ deep, 4–6″ apart');
      const roots = K.part('roots', [0, 0, 0], null, 'Fall roots: bulbs root for 4–6 weeks before the ground freezes');
      const TB0 = BT - 0.19;
      TUL.filter((q) => q[2]).forEach(([x]) => {
        K.lathe(bulbs, tulipBulbPts(1), M.tunic, [x, TB0, BFZ]);
        rootFan(K, roots, x, TB0, 0.1, 0.05, 6, M.root, BFZ + 0.004);
      });
      DAF.filter((q) => q[2]).forEach(([x]) => {
        K.lathe(bulbs, daffBulbPts(1.05), M.dTunic, [x, TB0 + 0.005, BFZ]);
        rootFan(K, roots, x, TB0 + 0.005, 0.11, 0.06, 7, M.root, BFZ + 0.004);
      });
      // hardware cloth
      const cage = K.part('cage', [0, BT + 0.004, 0], null, '½″ hardware cloth over tulips (squirrels and voles)');
      const wireM = K.std(0x9aa0a6, { metalness: 0.7, roughness: 0.45 });
      for (let i = 0; i <= 28; i++) K.bar(cage, [-0.74 + i * 0.026, 0, -0.38], [-0.74 + i * 0.026, 0, 0.38], 0.0012, wireM);
      for (let j = 0; j <= 28; j++) K.bar(cage, [-0.74, 0, -0.38 + j * 0.027], [-0.02, 0, -0.38 + j * 0.027], 0.0012, wireM);
      // mulch
      const mulch = K.part('mulch', [0, BT + 0.025, 0], null, '2–3″ shredded-leaf mulch once the ground freezes');
      K.box(mulch, [1.6, 0.05, 0.8], K.bumpy(0x8a5a32, TB.tex.speckle(), 0.03, { roughness: 1 }), [0, 0, 0], null, 0.01);
      K.rep(110, (i) => K.box(mulch, [0.035, 0.003, 0.025], K.std([0xb06a2a, 0x7a4a24, 0xc8903a][i % 3], { roughness: 1 }), [Math.sin(i * 12.7) * 0.76, 0.026, Math.cos(i * 7.3) * 0.37], [0, (i * 53) % 180, 0], 0));
      // spring growth (split into stages)
      const P = {
        shoots: K.part('shoots', [0, 0, 0], null, 'Spring shoots: feed lightly now'),
        fol: K.part('foliage', [0, 0, 0], null, 'Leaves: the bulb’s solar panels for next year'),
        yellow: K.part('yellow', [0, 0, 0], null, 'Foliage yellowing ~6 weeks after bloom: now it can go'),
      };
      P.fl = K.part('flowers', [0, 0, 0], P.fol, 'Blooms: daffodils first, tulips 2–4 weeks later');
      P.pods = K.part('pods', [0, 0, 0], P.fol, 'Seed pods forming (snap off)');
      TUL.forEach(([x, z, front], i) => tulipPlant(K, P, [x, BT, front ? z + 0.005 : z], 0.42 + Math.sin(i * 3.1) * 0.03, (i * 47) % 360, i % 5 === 2 ? M.pink : M.red, M));
      DAF.forEach(([x, z], i) => daffPlant(K, P, [x, BT, z], 0.36 + Math.sin(i * 2.3) * 0.03, 180 + Math.sin(i) * 50, M));
      // front-row sprouts on the cut face
      TUL.filter((q) => q[2]).forEach(([x]) => K.bar(P.shoots, [x, TB0 + 0.056, BFZ + 0.003], [x, BT, BFZ + 0.003], 0.003, M.sprout));
      DAF.filter((q) => q[2]).forEach(([x]) => K.bar(P.shoots, [x, TB0 + 0.085, BFZ + 0.003], [x, BT, BFZ + 0.003], 0.003, M.sprout));
      const water = K.part('water', [0, 0, 0], null, 'Soak after planting');
      const drops = rain(K, water, [0, BT + 0.55, 0.05], 16, 0.35, 0.5);

      /* lasagna pot (variant) */
      const pot = K.part('pot', LAS, null, '16″ frost-proof pot, 14″ deep, drainage holes (cut away)');
      const potM = K.std(0x3a4a5a, { roughness: 0.45 });
      halfLathe(K, pot, potLathe(0.2, 0.36), potM);
      [[-0.12, 0.06], [0.12, 0.06], [0, -0.13]].forEach(([x, z]) => K.box(pot, [0.06, 0.03, 0.05], K.std(0x9a6a4a, { roughness: 0.8 }), [x, -0.015, z], null, 0.006));
      pot.position.y = 0.03;
      const mixM = soilMat(K, 0x3a2a1e);
      const faceM = K.std(0x2e2018, { roughness: 1 });
      const rAt = (y) => 0.2 * 0.74 + (0.2 - 0.012 - 0.2 * 0.74) * Math.min(1, (y - 0.012) / (0.36 - 0.042)) - 0.004;
      const layer = (name, y0, y1, label) => {
        const g = K.part(name, [LAS[0], 0.03, LAS[2]], null, label);
        halfLayer(K, g, rAt(y0), rAt(y1), y0, y1, mixM, faceM);
        return g;
      };
      layer('potMix1', 0.014, 0.08, 'Bottom: 2–3″ of potting mix (no gravel)');
      const l1 = K.part('layer1', [LAS[0], 0.03, LAS[2]], null, 'Layer 1 (deepest): daffodils, noses up, almost touching');
      [-0.1, -0.05, 0, 0.05, 0.1].forEach((x) => K.lathe(l1, daffBulbPts(1), M.dTunic, [x, 0.08, 0.0]));
      [-0.075, -0.025, 0.025, 0.075].forEach((x) => K.lathe(l1, daffBulbPts(1), M.dTunic, [x, 0.08, -0.07]));
      layer('potMix2', 0.08, 0.19, '2″ of mix over the daffodil noses');
      const l2 = K.part('layer2', [LAS[0], 0.03, LAS[2]], null, 'Layer 2: tulips, set between the noses below');
      [-0.125, -0.075, -0.025, 0.025, 0.075, 0.125].forEach((x) => K.lathe(l2, tulipBulbPts(1), M.tunic, [x, 0.19, 0.0]));
      [-0.1, -0.05, 0, 0.05, 0.1].forEach((x) => K.lathe(l2, tulipBulbPts(1), M.tunic, [x, 0.19, -0.08]));
      layer('potMix3', 0.19, 0.26, '2″ of mix over the tulips');
      const l3 = K.part('layer3', [LAS[0], 0.03, LAS[2]], null, 'Layer 3 (top): grape hyacinths & crocus');
      for (let k = 0; k < 9; k++) K.lathe(l3, tulipBulbPts(0.45), k % 2 ? M.tunic : M.dTunic, [-0.14 + k * 0.035, 0.26, 0.0]);
      for (let k = 0; k < 7; k++) K.lathe(l3, tulipBulbPts(0.45), M.tunic, [-0.11 + k * 0.035, 0.26, -0.1]);
      layer('potTop', 0.26, 0.325, 'Top: 2″ of mix, finished 1″ below the rim');
      const pc = K.part('potCage', [LAS[0], 0.03 + 0.33, LAS[2]], null, 'Hardware-cloth lid while it chills');
      K.cyl(pc, [0.21, 0.21, 0.003, 32], K.std(0x9aa0a6, { metalness: 0.7, roughness: 0.45, wireframe: true }), [0, 0.005, 0]);
      const pshoot = K.part('potShoots', [LAS[0], 0.03 + 0.325, LAS[2]], null, 'Late winter: shoots up, move it into the sun');
      for (let k = 0; k < 18; k++) strap(K, pshoot, [Math.cos(k * 2.4) * 0.14 * ((k % 4) + 1) / 4, 0, Math.sin(k * 2.4) * 0.14 * ((k % 4) + 1) / 4 - 0.04], k * 40, 82, 0.05 + (k % 3) * 0.02, 0.012 + (k % 2) * 0.01, k % 2 ? M.tleaf : M.dleaf);
      const pb = K.part('potBloom', [LAS[0], 0.03 + 0.325, LAS[2]], null, 'Bloom in waves: small bulbs → daffodils → tulips');
      const PB = { fol: K.group(pb, [0, 0, 0]) };
      PB.fl = K.group(pb, [0, 0, 0]);
      [-0.1, 0, 0.1].forEach((x, i) => daffPlant(K, PB, [x, 0, -0.1], 0.32, 170 + i * 10, M));
      [-0.12, -0.04, 0.04, 0.12].forEach((x, i) => tulipPlant(K, PB, [x, 0, -0.02], 0.4, i * 70, i % 2 ? M.pink : M.red, M));
      for (let k = 0; k < 6; k++) muscari(K, pb, [-0.15 + k * 0.06, 0, 0.09 + (k % 2) * 0.03], M, 0.15);
      for (let k = 0; k < 4; k++) crocus(K, pb, [-0.12 + k * 0.08, 0, 0.14], M);
      const potWater = K.part('potWater', [0, 0, 0], null, 'Water until it drains');
      const drops2 = rain(K, potWater, [LAS[0], 0.75, LAS[2]], 10, 0.1, 0.35);
      return { tick(t, fx) { drops(t, fx === 'water'); drops2(t, fx === 'potwater'); } };
    }
  );

  const BC = { cam: [0.55, 0.55, 1.45], at: [0, 0.25, 0.35] };
  const BTOP = { cam: [1.5, 1.2, 1.7], at: [0, 0.4, 0] };
  const PC = { cam: [-0.75, 0.6, 1.25], at: [-1.3, 0.22, 0.3] };
  FLW.push({
    id: 'spring-bulbs',
    title: 'Plant spring bulbs in fall (tulips and daffodils)',
    model: 'gwBulbs',
    level: 1,
    time: '1–2 hrs for 50–100 bulbs, then 5–7 months to bloom',
    cost: '$25–90',
    summary: 'In fall, once the soil 6″ down is 55°F or cooler, plant tulip and daffodil bulbs pointy end up with their bases 6–8″ deep in well-drained soil. Water them in, guard tulips from squirrels, mulch after the ground freezes, and let the leaves die back naturally after spring bloom.',
    card: [
      ['Sun', 'Full sun to half-day sun in spring (6+ hours)'],
      ['Plant when', 'Soil 55°F or cooler at 6″; Sept–Nov in zones 3–7, about 6 weeks before the ground freezes'],
      ['Depth', '3× the bulb’s height to its base: 6–8″ for tulips and daffodils, 3–4″ for crocus and grape hyacinth'],
      ['Spacing', 'Tulips 4–6″, daffodils 5–6″, small bulbs 2–3″'],
      ['Soil', 'Well-drained, pH 6.0–7.0; never soggy'],
      ['Cold needed', 'Tulips 12–16 weeks below 50°F; daffodils about 12–15 weeks'],
      ['Water', 'Soak at planting; 1″ a week in a dry fall until the ground freezes'],
      ['Bloom', 'Daffodils early to mid spring, tulips mid to late spring'],
      ['Zones', 'Tulips 3–7 (8–9 with pre-chilled bulbs as annuals); daffodils 3–8'],
      ['Watch for', 'Squirrels, voles and deer on tulips; rot in wet soil'],
    ],
    intro: { show: ['foliage', 'flowers'], preview: true, spin: true },
    safety: [
      'Wear gloves: daffodil sap and tulip bulb skins cause itchy rashes (“daffodil itch,” “tulip fingers”) in some people.',
      'All parts of daffodils, and tulip bulbs, are poisonous to dogs, cats and people if eaten. Store bags of bulbs out of reach and away from onions in the kitchen.',
      'Lift with your legs when moving bags of soil, compost or mulch, and kneel on a pad rather than bending over for an hour.',
    ],
    causes: [
      ['Pick the right bulbs', 'Buy big, firm, heavy bulbs (tulips 12 cm+ around, daffodils “double-nose” or DN1) with no soft spots or blue mold. For tulips that come back, choose Darwin hybrids, Fosteriana or species tulips; most fancy tulips are best treated as one-year annuals. Daffodils come back and spread for decades.'],
      ['Time it by soil, not the calendar', 'Plant when nights are in the 40s and the soil 6″ down reads 55°F or less: usually late September in zone 3–4, October in zones 5–6, November in zone 7. Too early and tulips sprout in a warm spell; too late and roots can’t form before the freeze.'],
      ['Warm-winter areas (zone 8 and up)', 'Tulips won’t get enough cold. Buy pre-chilled bulbs, or chill them yourself in paper bags in the fridge at 35–45°F for 12–14 weeks (no fruit in that fridge: ripening apples give off ethylene that kills the flower inside), then plant in late December or January.'],
      ['Site and drainage', 'Bulbs rot in soggy ground. Choose a spot where water never puddles, under deciduous trees is fine (they bloom before the leaves come out), and somewhere you’ll see from a window in March and April.'],
      ['Design', 'Plant in groups of 10–25 of one kind, not single rows. Mix early, mid and late varieties to stretch the show over 8–10 weeks. Put tulips where the yellowing leaves will later be hidden by perennials.'],
    ],
    tools: ['Tulip and daffodil bulbs', 'Soil thermometer', 'Round-point shovel or bulb auger', 'Garden fork', 'Trowel', 'Tarp', 'Bulb or balanced fertilizer (per soil test)', '½″ hardware cloth (for tulips)', 'Shredded leaves or bark mulch', 'Garden gloves', 'Kneeling pad', 'Plant labels', 'Hose or watering can'],
    steps: [
      { t: 'Check the soil temperature', d: 'Push a soil thermometer 6″ into the bed in the morning. When it reads 55°F or less for a few days running, and nights are in the 40s, it’s planting time. Until then, keep bulbs in a cool, dry, airy spot in their mesh bags.', why: 'Bulbs need warm-ish soil to grow roots but cool soil so the shoot doesn’t start. 55°F is the switch point.', tip: 'If you can’t plant right away, store bulbs at 50–60°F in paper or mesh bags, never sealed plastic: they sweat and mold within a week.', ok: 'The thermometer needle sits at or below 55°F at 6″ deep.', v: { cam: [1.2, 0.8, 1.2], at: [0.4, 0.35, 0.2], hi: ['thermo', 'bed'], show: ['thermo'] } },
      { t: 'Sort the bulbs', d: 'Open the bags and squeeze each bulb. Keep firm, heavy ones; toss any that are soft, hollow or covered in fuzzy mold. A little loose skin or a dusting of blue-green mold that wipes off is fine.', why: 'A rotten bulb won’t bloom and can spread rot to its neighbors.', tip: 'Big bulbs carry a bigger flower already formed inside. A tulip bulb the size of a golf ball beats two the size of grapes.', ok: 'Every bulb you keep feels as firm as a fresh onion.', v: { cam: [1.9, 0.75, 1.3], at: [1.25, 0.1, 0.6], hi: ['crate'], show: ['crate'], hide: ['thermo'], tool: { id: 'gloves', at: [1.55, 0.02, 0.85], rot: [0, 30, 0] } } },
      { t: 'Dig one wide hole', d: 'For a group, dig out the whole area 8″ deep instead of many small holes, and pile the soil on a tarp. Loosen the bottom another 2–3″ with a fork.', why: 'One big hole is faster, every bulb ends up at the same depth so they bloom together, and the loose bottom lets roots dive and water drain.', tip: 'Measure depth with a ruler or mark 8″ on your trowel handle with tape. Beginners almost always plant too shallow.', ok: 'A ruler laid across the hole reads 8″ to the bottom everywhere.', v: { cam: BTOP.cam, at: BTOP.at, hi: ['pit', 'spoil'], show: ['pit', 'spoil'], hide: ['crate'], tool: { id: 'shovel', at: [0.4, BT, 0.1], rot: [15, 40, -20], anim: 'push' } } },
      { t: 'Feed the bottom (only if needed)', d: 'If a soil test shows low phosphorus, mix bulb fertilizer into the bottom of the hole at the label rate (roughly 1 tablespoon per square foot of a 5-10-10 or similar), then cover it with 1″ of soil so it doesn’t touch the bulbs.', why: 'The flower for next spring is already inside the bulb. Fertilizer feeds the roots and next year’s bulb, not this spring’s bloom.', tip: 'Skip bone meal: modern bone meal adds little, and dogs and raccoons dig it up along with your bulbs.', ok: 'The fertilizer is evenly scattered and covered by a thin layer of soil.', v: { cam: BTOP.cam, at: BTOP.at, hi: ['fert'], show: ['fert'] } },
      { t: 'Set bulbs pointy end up', d: 'Press tulips in 4–6″ apart and daffodils 5–6″ apart, pointed tip up and flat root plate down, so their bases sit 6–8″ below the final soil surface. If you can’t tell which end is up, lay the bulb on its side.', why: 'Depth protects bulbs from freeze-thaw heaving, summer heat and digging animals, and gives tall stems a firm anchor.', tip: 'Deeper planting (8″) helps tulips come back more years; shallow ones split into small non-flowering bulbs.', ok: 'Looking down, you see neat rows of pointed tips, none touching.', v: { cam: BC.cam, at: BC.at, hi: ['bulbs'], show: ['bulbs'], hide: ['fert'], tool: { id: 'trowel', at: [-0.3, BT + 0.02, 0.38], rot: [20, 0, -20] } } },
      { t: 'Backfill and soak', d: 'Rake the soil back over the bulbs without knocking them over and firm it gently with your palms. Water until the soil is moist 8″ down, about 1 gallon per square foot. Label the spot.', why: 'Watering settles soil around the bulbs and triggers root growth right away.', tip: 'Push a label or a short stake at each group. In spring you’ll know where not to dig, and in fall where to add more.', ok: 'A finger pushed in 3″ feels cool and damp, and the bed surface is level.', v: { cam: BTOP.cam, at: BTOP.at, hi: ['bed'], hide: ['pit', 'spoil'], fx: 'water', tool: { id: 'wateringCan', at: [0.2, BT + 0.35, 0.3], rot: [0, 200, 25] } } },
      { t: 'Guard the tulips from squirrels', d: 'Lay ½″ hardware cloth (stiff wire mesh) flat over the tulip area, pin it at the corners, and cover it with an inch of soil or mulch. Shoots grow straight through the holes. Daffodils need nothing; animals leave them alone.', why: 'Squirrels and chipmunks dig fresh-planted tulips the first night. Voles and deer love them too, while daffodils are poisonous to them.', tip: 'If squirrels are bad, interplant daffodils around tulips or plant tulips in a buried wire basket. Clean up bulb skins after planting: the smell draws diggers.', ok: 'The mesh lies flat, every edge is pinned, and no soil is disturbed the next morning.', v: { cam: BTOP.cam, at: BTOP.at, hi: ['cage'], show: ['cage'] } },
      { t: 'Water in a dry fall, then mulch', d: 'If fall is dry, give 1″ of water a week until the ground freezes. After it freezes hard, spread 2–3″ of shredded leaves or bark over the bed.', why: 'The bulbs are growing roots all fall. Mulch added after the freeze keeps the soil frozen through winter thaws, which stops early sprouting and frost heaving.', tip: 'Mulching too early keeps the soil warm and invites voles to nest. Wait for the first hard freeze.', ok: 'An even 2–3″ blanket covers the whole bed with no bare patches.', v: { cam: BC.cam, at: BC.at, hi: ['roots', 'mulch'], show: ['roots', 'mulch'] } },
      { t: 'Feed the spring shoots', d: 'When shoots poke up in late winter, pull the mulch back to 1″ and scatter a balanced fertilizer (like 10-10-10 at 1 lb per 100 sq ft, or an organic equal) around them. Water it in.', why: 'Feeding while leaves are growing builds next year’s bulb. Shoots shrug off frost; snow on them is fine.', tip: 'If deer browse your tulips, spray a repellent as soon as shoots appear and repeat after rain. It’s much easier to stop them before the first taste.', ok: 'Green tips are showing evenly across the bed and the fertilizer is watered in.', v: { cam: BC.cam, at: BC.at, hi: ['shoots'], show: ['shoots'], hide: ['mulch', 'cage'] } },
      { t: 'Enjoy and cut flowers', d: 'Cut tulips when buds show full color but are still closed, and daffodils when the bud bends sideways (“goose-neck”). Cut low but leave at least two leaves on each plant.', why: 'Buds cut early last 5–7 days in a vase. The leaves you leave behind feed the bulb.', tip: 'Daffodil stems leak a sap that wilts other flowers. Stand them alone in water for 6–12 hours, then rinse and mix them in, without recutting.', ok: 'Each cut plant still has at least two full leaves.', v: { cam: BTOP.cam, at: [0, 0.55, 0], hi: ['flowers'], show: ['foliage'], hide: ['shoots'] } },
      { t: 'Deadhead, keep the leaves', d: 'When flowers fade, snap off the spent head and swelling seed pod just under it. Leave all the leaves and stems standing, and water if spring is dry.', why: 'Making seed burns energy the bulb needs. The leaves are the bulb’s solar panels: they refill it for next year.', tip: 'Don’t braid, fold or rubber-band daffodil leaves to tidy them. That cuts their light and shrinks next year’s blooms.', ok: 'No flower heads or pods remain, and all leaves are green and upright.', v: { cam: BTOP.cam, at: [0, 0.5, 0], hi: ['pods'], hide: ['flowers'] } },
      { t: 'Cut back when yellow; plan next fall', d: 'About 6 weeks after bloom, when leaves are yellow and pull away with a gentle tug, cut them off at the ground. Mark crowded daffodil clumps to dig and divide then, or next fall.', why: 'Leaves removed while green mean small bulbs and no flowers next year. Crowded daffodils bloom less every year until divided.', tip: 'Plant annuals or let perennials grow over the spot to hide the yellowing leaves. If tulips come back small and leafy, replace them; that’s normal for most hybrids.', ok: 'Yellow leaves come away with a light tug and leave clean ground.', v: { cam: BTOP.cam, at: [0, 0.4, 0], hi: ['yellow'], show: ['yellow'], hide: ['foliage'] } },
    ],
    learn: {
      how: 'A spring bulb is a packed lunch: a tulip or daffodil bulb is a short underground stem wrapped in fleshy leaves (scales) full of stored starch, with next spring’s flower already formed in the middle. In fall it grows roots. Over winter, weeks of cold below about 50°F switch on the hormones that let the flower stem stretch in spring; without that cold, tulips stay short or don’t bloom. After flowering, the leaves photosynthesize for about six weeks and refill the bulb, which then rests through summer. Hybrid tulips tend to split into several small bulbs after a year or two, so they fade, while daffodils keep making flowering-size bulbs and spread into clumps.',
      specs: [['Soil temp to plant', '≤ 55°F at 6″'], ['Depth (to base)', '6–8″ tulips & daffodils; 3–4″ small bulbs'], ['Spacing', 'Tulips 4–6″, daffodils 5–6″'], ['Cold period', 'Tulips 12–16 weeks < 50°F'], ['Pre-chill (zone 8+)', '35–45°F, 12–14 weeks, no fruit nearby'], ['Fall fertilizer', 'Only per soil test, ~1 tbsp/sq ft 5-10-10'], ['Spring feed', '1 lb 10-10-10 per 100 sq ft at emergence'], ['Mulch', '2–3″ after the ground freezes'], ['Leaves stay', '≈ 6 weeks after bloom, until yellow']],
      terms: [['Basal plate', 'The flat bottom of the bulb where roots grow. It goes down.'], ['Tunic', 'The papery brown skin around tulip and daffodil bulbs.'], ['Naturalize', 'To come back and spread on its own year after year, like daffodils in a meadow.'], ['Pre-chilled', 'Bulbs given their cold period in a cooler so they can bloom in warm-winter areas.'], ['Deadheading', 'Removing spent flowers before they set seed.'], ['Hardware cloth', 'Stiff galvanized wire mesh, sold in rolls; ½″ squares stop squirrels but let shoots through.']],
      mistakes: ['Planting too shallow (3–4″ for tulips).', 'Planting in soggy ground or where a downspout drains.', 'Cutting or braiding the leaves right after bloom.', 'Storing bulbs in sealed plastic or a warm car.', 'Planting in single file instead of groups (looks thin).', 'Mulching before the ground freezes.'],
      tips: ['Buy early for the best selection and plant later; just keep the bulbs cool and dry.', 'Take a phone photo of the bed in full bloom: next fall you’ll see exactly where the gaps are.', 'Late-season bulb sales offer real bargains; bulbs planted as late as December still bloom if the ground can be dug.'],
    },
    tricks: [
      ['Squirrel-proof by mixing', 'Plant tulips in the middle of a daffodil ring. Diggers that hit a daffodil bulb first tend to give up.'],
      ['Stretch the season', 'Choose one early, one mid and one late variety of each, and the bed blooms for 8–10 weeks instead of two.'],
      ['Mark with a golf tee', 'Push a golf tee next to each group. Next fall you can add bulbs without spearing the old ones.'],
      ['Overplant for color', 'Sow pansies or forget-me-nots on top in fall. They bloom with the bulbs and hide bare soil.'],
      ['Dig a test hole', 'Fill a hole with water. If it hasn’t drained in a few hours, plant bulbs in a raised bed or on a mound.'],
      ['If shoots come up in a December warm spell', 'Leave them. The leaf tips may brown, but the flower bud is safe deep in the bulb. Just add mulch around them.'],
      ['Annual tulips, perennial daffodils', 'Budget for replacing tulips every 1–3 years and spend your “forever” money on daffodils, alliums and species tulips.'],
    ],
    refs: [
      ['Growing bulbs: true or false (University of Illinois Extension)', 'https://extension.illinois.edu/sites/default/files/growing_bulbs_true_false.pdf'],
      ['Narcissus key growing information (Johnny’s Selected Seeds)', 'https://www.johnnyseeds.com/growers-library/flowers/narcissus/narcissus-key-growing-information.html'],
      ['What temperature to plant daffodil bulbs (Longfield Gardens)', 'https://www.longfield-gardens.com/blogs/daffodil-care/what-temperature-to-plant-daffodil-bulbs-for-spring-success'],
      ['When to plant daffodil and tulip bulbs (Longfield Gardens)', 'https://www.longfield-gardens.com/blogs/tulip-care/when-do-you-plant-daffodil-and-tulip-bulbs-for-spring-color'],
      ['Fall bulbs in containers (Rutgers Cooperative Extension)', 'https://archive.sebs.rutgers.edu/wp-content/uploads/Fall-Bulbs-in-Containers-2025-09-23.pdf'],
    ],
    pro: 'Not usually needed. If whole groups rot or come up stunted and streaked year after year, send a bulb and some soil to your extension plant clinic before replanting there; it may be a disease such as tulip fire or basal rot.',
    variants: [
      { id: 'ground', name: 'In the ground', blurb: 'Groups of tulips and daffodils in a sunny bed.' },
      {
        id: 'lasagna',
        name: 'Layered “lasagna” pot',
        blurb: 'Three layers of bulbs in one pot for 6–10 weeks of waves of bloom.',
        level: 1,
        time: '45 min, then 12–16 weeks of chilling',
        cost: '$40–90',
        summary: 'Stack bulbs in layers in one deep pot: daffodils at the bottom, tulips in the middle, grape hyacinths and crocus on top, with 2″ of potting mix between. Chill the pot 12–16 weeks at 35–45°F, then bring it into the sun for waves of bloom from early to late spring.',
        intro: { show: ['pot', 'potMix1', 'layer1', 'potMix2', 'layer2', 'potMix3', 'layer3', 'potTop', 'potBloom'], preview: true, spin: true },
        tools: ['Frost-proof pot 14–18″ wide, 12–16″ deep, with drainage holes', 'Fresh potting mix (about 1.5 cu ft)', 'Mesh or screen for the hole', '10–12 daffodil bulbs', '12–15 tulip bulbs', '20–30 grape hyacinth and crocus bulbs', 'Pot feet', 'Hardware cloth circle', 'Watering can', 'Label'],
        steps: [
          { t: 'Pick a frost-proof pot', d: 'Use a pot at least 14″ wide and 12–16″ deep with drainage holes, made of plastic, fiberglass, resin or thick glazed ceramic. Set it on pot feet where it will spend the winter.', why: 'The deepest bulbs need about 8″ of mix above them. Terra-cotta soaks up water, freezes and cracks.', tip: 'A heavy pot is hard to move once filled with wet soil. Put it on a plant dolly before filling if it has to travel to the garage.', ok: 'Light shows through the drainage hole and the pot sits level on its feet.', v: { cam: PC.cam, at: PC.at, hi: ['pot'], show: ['pot'] } },
          { t: 'Add the base layer of mix', d: 'Cover the hole with a scrap of screen, then add 2–3″ of fresh, slightly damp potting mix. No gravel, no garden soil.', why: 'Gravel at the bottom actually holds water up in the mix (a perched water table). Garden soil packs solid in a pot.', tip: 'Moisten the mix in a bucket first until it feels like a wrung-out sponge; dry mix repels water.', ok: 'An even, lightly firmed layer 2–3″ deep.', v: { cam: PC.cam, at: PC.at, hi: ['potMix1'], show: ['potMix1'] } },
          { t: 'Layer 1: daffodils', d: 'Set the biggest, latest-blooming bulbs, usually daffodils, noses up, nearly touching (about ½″ apart).', why: 'Big bulbs need the most soil above them, and the latest bloomers grow up through the layers above.', tip: 'Crowding is fine in a pot: bulbs bring their own food for this spring and you want a full display.', ok: 'The whole floor is covered with upright bulbs, none lying on its side.', v: { cam: PC.cam, at: PC.at, hi: ['layer1'], show: ['layer1'] } },
          { t: 'Cover, then layer 2: tulips', d: 'Add about 2″ of mix, just covering the daffodil noses. Set tulips on top, placing each one between the noses below.', why: 'Staggering lets the lower shoots grow up through the gaps instead of bending around a bulb.', tip: 'Put the flat side of each tulip bulb facing the pot wall: the first big leaf grows from that side and drapes nicely over the edge.', ok: 'Tulips sit in the gaps, and you can’t see any daffodil noses.', v: { cam: PC.cam, at: PC.at, hi: ['potMix2', 'layer2'], show: ['potMix2', 'layer2'] } },
          { t: 'Cover, then layer 3: small bulbs', d: 'Add another 2″ of mix. Scatter grape hyacinths and crocus over it about 1″ apart, pointy ends up.', why: 'Small bulbs bloom first and only need 3–4″ of soil over them.', tip: 'Soak crocus and grape hyacinth bulbs for an hour first if they look shriveled.', ok: 'Small bulbs cover the surface evenly.', v: { cam: PC.cam, at: PC.at, hi: ['potMix3', 'layer3'], show: ['potMix3', 'layer3'] } },
          { t: 'Top off and water', d: 'Fill with mix to 1″ below the rim, firm lightly, and water slowly until it runs from the hole. Label the pot with what’s inside and the date.', why: 'The gap below the rim holds water so it soaks in instead of running off.', tip: 'Lay a circle of hardware cloth on top before squirrels find it. Remove it when shoots are 2″ tall.', ok: 'Water drips from the bottom and the surface sits 1″ below the rim.', v: { cam: PC.cam, at: PC.at, hi: ['potTop', 'potCage'], show: ['potTop', 'potCage'], fx: 'potwater', tool: { id: 'wateringCan', at: [-1.15, 0.65, 0.35], rot: [0, 200, 25] } } },
          { t: 'Chill 12–16 weeks', d: 'Keep the pot at 35–45°F: an unheated garage, shed or cold porch works. Water lightly every 2–4 weeks so the mix stays barely damp. In zones 7–8, it can stay outdoors against a north wall.', why: 'Bulbs in pots are far less protected than in the ground: the mix can freeze solid and kill roots, while too warm a spot means no cold signal.', tip: 'Put a cheap min-max thermometer next to the pot. If the garage drops below 25°F, cover the pot with an old blanket or move it nearer the house wall.', ok: 'After about 12 weeks, white roots peek out of the drainage hole and green tips show.', v: { cam: PC.cam, at: PC.at, hi: ['pot'] } },
          { t: 'Bring it into the sun', d: 'When shoots are up and hard freezes are mostly over, move the pot to a sunny spot, remove the mesh and water whenever the top inch is dry.', why: 'Sun keeps stems short and sturdy; shade makes them stretch and flop.', tip: 'If a hard freeze below 25°F is forecast after the pot is out, roll it back into the garage for the night.', ok: 'Shoots are deep green and stocky, not pale and stretched.', v: { cam: PC.cam, at: [-1.3, 0.35, 0.3], hi: ['potShoots'], show: ['potShoots'], hide: ['potCage'] } },
          { t: 'Enjoy the waves', d: 'Crocus and grape hyacinths open first, then daffodils, then tulips, over 6–10 weeks. Feed every 2 weeks with half-strength liquid fertilizer and snip faded flowers.', why: 'The bulbs are now growing on their own reserves plus what the leaves make, so a light feed helps the late tulips.', tip: 'Turn the pot a quarter turn every few days so stems don’t all lean toward the light.', ok: 'Something new opens every week or two.', v: { cam: [-0.5, 0.75, 1.4], at: [-1.3, 0.45, 0.3], hi: ['potBloom'], show: ['potBloom'], hide: ['potShoots'] } },
          { t: 'After bloom: replant or compost', d: 'Let the leaves yellow, then knock out the pot. Plant the daffodils and grape hyacinths in the garden 6–8″ and 3–4″ deep; compost the tulips and start fresh next fall.', why: 'Daffodils and small bulbs recover and bloom again in the ground. Tulips forced in a pot rarely rebloom well.', tip: 'Shake the old mix into a garden bed as a soil conditioner rather than reusing it for next year’s bulbs.', ok: 'The daffodils are in the ground, labeled, with their leaves still attached.', v: { cam: PC.cam, at: [-1.3, 0.35, 0.3], hi: ['potBloom'] } },
        ],
        tricks: [
          ['Plan the waves', 'Buy one early (crocus), one mid (daffodil) and one late (tulip) variety and check the bloom times on the tags so the layers overlap rather than all open at once.'],
          ['Use the fridge in warm zones', 'In zone 8–9, chill the bulbs in paper bags in the fridge for 12–14 weeks, then plant the pot in late December.'],
          ['Make two pots', 'Make a second identical pot and keep it 2 weeks behind in a colder spot to double the show.'],
          ['Wrap, don’t heat', 'In a very cold garage, bubble-wrap the sides of the pot. Insulation is enough; never move it into the warm house to protect it.'],
          ['Gift it', 'A labeled lasagna pot planted in October makes a living spring present.'],
        ],
      },
    ],
  });

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
