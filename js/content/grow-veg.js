/* GV · Grow vegetables: garden planning, peppers, salad greens, cucumbers, summer squash, beans, peas,
   root crops, onions & leeks, brassicas. Real meters (unit: 1). Plants are built from extruded leaf
   outlines, lathes and tubes (same kit and look as grow.js); each walkthrough reveals the crop stage by
   stage: seed, seedling, young plant, flowering, fruit, harvest. */
(function () {
  const TB = window.TB;
  const DS = THREE.DoubleSide;
  const GARDEN = (o) =>
    Object.assign({ unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 10 }, tex: ['wood_planks', 'forrest_ground_01', 'pine_bark'] }, o);

  /* ================= plant kit (copied from grow.js, plus new shapes) ================= */
  const leafMat = (K, c, r) => K.std(c || 0x4f8f3a, { roughness: r || 0.7, side: DS });
  const soilMat = (K, c) => K.bumpy(c || 0x5a4030, TB.tex.speckle(), 0.03, { roughness: 1 });
  // Ovate leaf outline, base at origin, tip at (0, L). serr = toothed edge.
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
  function strapPts(L, W) {
    return [[W / 2, 0], [W / 2, L * 0.75], [W * 0.15, L], [-W * 0.15, L], [-W / 2, L * 0.75], [-W / 2, 0]];
  }
  // Palmate, heart-based leaf (squash, cucumber): lobes tips on a polar curve, sinus at the petiole.
  function lobedPts(R, depth, lobes, n) {
    n = n || 50;
    lobes = lobes || 5;
    const cy = R * (1 - depth);
    const out = [];
    for (let i = 0; i <= n; i++) {
      const th = -Math.PI + 0.12 + (i / n) * (2 * Math.PI - 0.24);
      const r = R * (1 - depth * (1 - Math.cos(lobes * th)) / 2) * (i % 2 ? 0.97 : 1);
      out.push([Math.sin(th) * r, cy + Math.cos(th) * r]);
    }
    out.push([0, 0]);
    return out;
  }
  // Pinnate, deeply cut frond (carrot tops, curly kale edge), base at origin.
  function pinnatePts(L, W, n) {
    n = n || 7;
    const R = [[0.0, 0]];
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1);
      const w = W * Math.sin(Math.PI * Math.min(1, t * 1.15)) + W * 0.08;
      R.push([w * 0.18, (t - 0.5 / (n + 1)) * L]);
      R.push([w, t * L]);
    }
    R.push([W * 0.05, L]);
    const out = R.slice();
    for (let i = R.length - 2; i >= 1; i--) out.push([-R[i][0], R[i][1]]);
    return out;
  }
  // A group whose +Y points outward at compass angle yaw (deg) and elevation elev (deg above horizontal).
  const orient = (K, p, pos, yaw, elev) => K.group(K.group(p, pos, [0, yaw, 0]), [0, 0, 0], [90 - elev, 0, 0]);
  function leaf(K, p, pos, yaw, elev, L, W, mat, serr) {
    const g = orient(K, p, pos, yaw, elev);
    K.ext(g, leafPts(L, W, 10, serr), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  function shape(K, p, pos, yaw, elev, pts, mat) {
    const g = orient(K, p, pos, yaw, elev);
    K.ext(g, pts, 0.0012, mat, [0, 0, -0.0006], null, 0);
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
  // Long-stalked palmate leaf: petiole from pos out along yaw, blade at the end.
  function stalkLeaf(K, p, pos, yaw, elev, stalk, R, depth, mat, stemMat, bladeElev) {
    const c = Math.cos(yaw * K.DEG), s = Math.sin(yaw * K.DEG);
    const e = elev * K.DEG;
    const end = [pos[0] + c * Math.cos(e) * stalk, pos[1] + Math.sin(e) * stalk, pos[2] + s * Math.cos(e) * stalk];
    K.bar(p, pos, end, 0.0035 * (R / 0.1 + 0.4), stemMat);
    shape(K, p, end, yaw, bladeElev == null ? 8 : bladeElev, lobedPts(R, depth, 5), mat);
    return end;
  }
  // Tiny seedling: stem, two cotyledons, optional true leaves.
  function seedling(K, p, pos, h, trueLeaves, mats, yaw) {
    const g = K.group(p, pos, [0, yaw || 0, 0]);
    K.cyl(g, [0.0012, 0.0016, h, 6], mats.stem, [0, h / 2, 0]);
    [0, 180].forEach((a) => leaf(K, g, [0, h, 0], a, 22, 0.011 + h * 0.08, 0.0045, mats.coty));
    if (trueLeaves) [90, 270].forEach((a) => leaf(K, g, [0, h * 0.98, 0], a, 48, trueLeaves, trueLeaves * 0.42, mats.leaf, true));
    return g;
  }
  // 5-petal flower made of petal leaves around a center.
  function flower(K, p, pos, petal, center, r, elev, yaw) {
    const g = K.group(p, pos, [0, yaw || 0, 0]);
    for (let k = 0; k < 5; k++) leaf(K, g, [0, 0, 0], k * 72, elev, r, r * 0.62, petal);
    K.sph(g, r * 0.28, center, [0, elev < 0 ? -r * 0.1 : r * 0.1, 0]);
    return g;
  }
  // Water drops falling in a column (animated in tick when fx matches).
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
  // Cedar raised bed of any size: Lx along x, Wz along z. Returns the soil surface height.
  function vbed(K, name, label, Lx, Wz, H, soilC, open) {
    const g = K.part(name, [0, 0, 0], null, label);
    const cedar = K.pbr('wood_planks', [0.4, 1.2], { color: 0xd8a27a }, 'wood');
    const t = 0.038;
    const rows = Math.max(1, Math.round(H / 0.14));
    for (let r = 0; r < rows; r++) {
      const y = 0.07 + r * 0.14;
      K.box(g, [Lx, 0.135, t], cedar, [0, y, -Wz / 2 + t / 2], null, 0.004);
      if (!open) K.box(g, [Lx, 0.135, t], cedar, [0, y, Wz / 2 - t / 2], null, 0.004);
      [-1, 1].forEach((s) => K.box(g, [t, 0.135, Wz - 2 * t], cedar, [s * (Lx / 2 - t / 2), y, 0], null, 0.004));
    }
    const top = rows * 0.14 - 0.035;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => K.box(g, [0.07, rows * 0.14, 0.07], cedar, [sx * (Lx / 2 - 0.075), rows * 0.07, sz * (Wz / 2 - 0.075)], null, 0.004));
    K.box(g, [Lx - 2 * t, top, open ? Wz - t : Wz - 2 * t], soilMat(K, soilC || 0x4a3526), [0, top / 2, open ? t / 2 : 0], null, 0.004);
    return top;
  }
  // Flat worked-soil patch on the lawn (in-ground beds and rows).
  function plot(K, name, label, Lx, Wz, color) {
    const g = K.part(name, [0, 0, 0], null, label);
    K.box(g, [Lx, 0.04, Wz], soilMat(K, color || 0x4f3a2a), [0, 0.02, 0], null, 0.02);
    return g;
  }
  // Bypass hand pruners as a part (there is no pruner tool in the tool kit).
  function pruners(K, name, pos, rot, label) {
    const g = K.part(name, pos, null, label || 'Bypass pruners, wiped with alcohol');
    const r = K.group(g, [0, 0, 0], rot || [0, 0, 0]);
    const blade = K.std(0xc9ced3, { metalness: 1, roughness: 0.25 });
    K.ext(r, [[0, 0], [0.012, 0.01], [0.01, 0.055], [0.0, 0.065], [-0.006, 0.03]], 0.003, blade, [0, 0, 0.002], null, 0);
    K.ext(r, [[0, 0], [-0.01, 0.012], [-0.012, 0.045], [-0.004, 0.05], [0.003, 0.02]], 0.004, K.std(0x5a5f64, { metalness: 0.8, roughness: 0.4 }), [0, 0, -0.004], null, 0);
    K.cyl(r, [0.006, 0.006, 0.012, 12], 'steel', [0, 0, 0], [90, 0, 0]);
    K.bar(r, [0.004, -0.005, 0.002], [0.03, -0.19, 0.002], 0.009, K.std(0xc8352b, { roughness: 0.5 }));
    K.bar(r, [-0.004, -0.005, -0.002], [-0.025, -0.19, -0.002], 0.009, K.std(0xc8352b, { roughness: 0.5 }));
    return g;
  }
  // Soil thermometer stuck in the ground.
  function soilThermo(K, name, pos, label) {
    const th = K.part(name, pos, null, label);
    K.cyl(th, [0.003, 0.003, 0.14, 8], 'steel', [0, 0.02, 0]);
    K.cyl(th, [0.03, 0.03, 0.012, 24], 'steel', [0, 0.095, 0], [70, 0, 0]);
    K.cyl(th, [0.026, 0.026, 0.002, 24], K.std(0xf4f2ea, { roughness: 0.5 }), [0, 0.097, 0.006], [70, 0, 0]);
    K.box(th, [0.002, 0.018, 0.001], K.std(0xc8302a), [0.004, 0.1, 0.009], [70, 0, -40], 0);
    return th;
  }
  // Wire hoops + fabric over a row or bed (row cover / insect netting). Runs along x.
  function tunnel(K, name, pos, len, rad, label, opacity, color) {
    const g = K.part(name, pos, null, label);
    const n = Math.max(2, Math.round(len / 0.6) + 1);
    for (let k = 0; k < n; k++) K.tor(g, [rad, 0.004, 180], 'steel', [-len / 2 + (k * len) / (n - 1), 0, 0], [0, 90, 0]);
    const arc = [];
    for (let k = 0; k <= 24; k++) arc.push([Math.cos((k / 24) * Math.PI) * (rad + 0.006), Math.sin((k / 24) * Math.PI) * (rad + 0.006)]);
    for (let k = 24; k >= 0; k--) arc.push([Math.cos((k / 24) * Math.PI) * (rad + 0.003), Math.sin((k / 24) * Math.PI) * (rad + 0.003)]);
    K.ext(K.group(g, [-len / 2 - 0.03, 0, 0], [0, 90, 0]), arc, len + 0.06, K.std(color || 0xf4f4f0, { transparent: true, opacity: opacity || 0.45, side: DS, roughness: 1 }), [0, 0, 0], null, 0);
    [-1, 1].forEach((s) => K.box(g, [len + 0.2, 0.04, 0.12], K.std(0x6a6e60, { roughness: 1 }), [0, 0.02, s * (rad + 0.04)], null, 0.01));
    return g;
  }
  // Plant label stake.
  function label(K, p, pos, color) {
    K.bar(p, pos, [pos[0], pos[1] + 0.13, pos[2]], 0.003, K.std(0xf2f2ee, { roughness: 0.6 }));
    K.box(p, [0.04, 0.03, 0.003], K.std(color || 0xf2f2ee, { roughness: 0.6 }), [pos[0], pos[1] + 0.14, pos[2]], [-25, 0, 0], 0.003);
  }
  // Harvest basket (woven) with optional contents callback.
  function basket(K, p, pos, r, fill) {
    const g = K.group(p, pos);
    K.lathe(g, [[0, 0], [r * 0.75, 0], [r, r * 0.9], [r * 0.97, r * 0.9], [r * 0.72, 0.006], [0, 0.006]], K.bumpy(0xa87a48, TB.tex.weave(), 0.006, { roughness: 0.9, side: DS }));
    K.tor(g, [r, 0.008], K.std(0x8a5e34, { roughness: 0.9 }), [0, r * 0.9, 0], [90, 0, 0]);
    if (fill) fill(g, r * 0.8);
    return g;
  }

  /* ---------- crop shapes ---------- */
  // Pepper: one stem that forks into 2–3 branches, each forking again (fruit hangs at the forks).
  function pepperPlant(K, p, base, H, M, yaw, nb) {
    const g = K.group(p, base, [0, yaw || 0, 0]);
    const r0 = 0.004 + H * 0.008;
    const f1 = [0, H * 0.36, 0];
    K.tube(g, [[0, 0, 0], [0.004, H * 0.18, 0.002], f1], r0, M.stem);
    const anchors = [];
    nb = nb || 3;
    [0.12, 0.22].forEach((y, k) => leaf(K, g, [0, H * y, 0], k * 160 + 30, 18, H * 0.16, H * 0.07, M.leaf));
    for (let b = 0; b < nb; b++) {
      const a = (b / nb) * Math.PI * 2 + 0.4;
      const mid = [Math.cos(a) * H * 0.13, H * 0.62, Math.sin(a) * H * 0.13];
      K.tube(g, [f1, [mid[0] * 0.45, H * 0.5, mid[2] * 0.45], mid], r0 * 0.7, M.stem);
      anchors.push({ p: [f1[0] + Math.cos(a) * 0.035, f1[1] - 0.01, f1[2] + Math.sin(a) * 0.035], a });
      [-1, 1].forEach((c) => {
        const a2 = a + c * 0.5;
        const tip = [Math.cos(a2) * H * 0.3, H * (0.94 + 0.05 * c), Math.sin(a2) * H * 0.3];
        K.tube(g, [mid, [(mid[0] + tip[0]) / 2, (mid[1] + tip[1]) / 2 + H * 0.04, (mid[2] + tip[2]) / 2], tip], r0 * 0.5, M.stem);
        const yd = (a2 * 180) / Math.PI;
        leaf(K, g, tip, -yd + 90, 25, H * 0.2, H * 0.085, M.leaf);
        leaf(K, g, [(mid[0] + tip[0]) / 2, (mid[1] + tip[1]) / 2 + H * 0.03, (mid[2] + tip[2]) / 2], -yd + 90 + c * 70, 12, H * 0.22, H * 0.095, c > 0 ? M.leaf : M.leaf2);
        leaf(K, g, [(mid[0] + tip[0]) / 2, (mid[1] + tip[1]) / 2 + H * 0.03, (mid[2] + tip[2]) / 2], -yd + 90 - c * 110, 8, H * 0.2, H * 0.09, M.leaf2);
        anchors.push({ p: [mid[0] + Math.cos(a2) * 0.03, mid[1] - 0.012, mid[2] + Math.sin(a2) * 0.03], a: a2, tip });
      });
      leaf(K, g, mid, -((a * 180) / Math.PI) + 90 + 180, 15, H * 0.22, H * 0.1, M.leaf);
    }
    // convert anchors to the parent's frame (group only yawed + translated)
    const cy = Math.cos((yaw || 0) * K.DEG), sy = Math.sin((yaw || 0) * K.DEG);
    const toP = (q) => [base[0] + q[0] * cy + q[2] * sy, base[1] + q[1], base[2] - q[0] * sy + q[2] * cy];
    return anchors.map((o) => ({ p: toP(o.p), tip: o.tip ? toP(o.tip) : null }));
  }
  function youngPepper(K, p, base, H, M, yaw) {
    const g = K.group(p, base, [0, yaw || 0, 0]);
    K.cyl(g, [0.0025, 0.0035, H, 6], M.stem, [0, H / 2, 0]);
    for (let k = 0; k < 7; k++) leaf(K, g, [0, H * (0.35 + k * 0.1), 0], k * 137, 25 + k * 4, 0.05 + (k < 4 ? 0.01 : -0.01), 0.022, k % 2 ? M.leaf : M.leaf2);
    return g;
  }
  // Blocky 4-lobed bell pepper hanging from a fork.
  function bell(K, p, pos, mat, calyx, s) {
    s = s || 1;
    const g = K.group(p, pos);
    K.bar(g, [0, 0.02 * s, 0], [0, -0.004 * s, 0], 0.004 * s, calyx);
    K.cyl(g, [0.01 * s, 0.022 * s, 0.01 * s, 10], calyx, [0, -0.008 * s, 0]);
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + 0.3;
      K.sph(g, 0.026 * s, mat, [Math.cos(a) * 0.014 * s, -0.04 * s, Math.sin(a) * 0.014 * s], [0.9, 1.5, 0.9]);
    }
    return g;
  }
  // Slender chili (cayenne/jalapeño shape) hanging down.
  function chili(K, p, pos, mat, calyx, s, lean) {
    s = s || 1;
    const g = K.group(p, pos, [lean || 0, 0, (lean || 0) * 0.7]);
    K.bar(g, [0, 0.018 * s, 0], [0, -0.002 * s, 0], 0.0025 * s, calyx);
    K.cyl(g, [0.005 * s, 0.009 * s, 0.006 * s, 8], calyx, [0, -0.004 * s, 0]);
    K.lathe(g, [[0, 0], [0.0065, 0.004], [0.0085, 0.018], [0.008, 0.05], [0.0062, 0.075], [0.0035, 0.09], [0, 0.096]].map(([r, y]) => [r * s, y * s]), mat, [0, -0.006 * s, 0], [180, 0, 0]);
    return g;
  }

  /* =====================================================================
     1 · Peppers: raised bed, 8 plants on an 18″ grid, sweet bells or hot chilies
     ===================================================================== */
  const PEP_X = [-0.69, -0.23, 0.23, 0.69];
  const PEP_Z = [-0.3, 0.3];
  TB.model(
    'vegPepper',
    GARDEN({ cam: [1.9, 1.35, 2.1], at: [0, 0.4, 0],
      hidden: ['thermo', 'compost', 'holes', 'starts', 'young', 'collars', 'stakes', 'mulch', 'plants', 'flowers', 'firstFlowers', 'bellsGreen', 'bellsRipe', 'chiliGreen', 'chiliRipe', 'problems', 'aphids', 'pruners', 'harvest', 'cover', 'drip'] }),
    (K) => {
      const T = vbed(K, 'bed', 'Raised bed (4×8 ft), 8+ hours of sun', 2.44, 1.22, 0.28, 0x4a3526);
      const M = { stem: K.std(0x5f8a3a, { roughness: 0.75 }), leaf: leafMat(K, 0x2f6a2a, 0.45), leaf2: leafMat(K, 0x3a7a30, 0.45) };
      const calyx = K.std(0x4f7a2e, { roughness: 0.6 });
      const greenP = K.phys(0x2f7a22, { roughness: 0.2, clearcoat: 0.8 });
      const redP = K.phys(0xc8201a, { roughness: 0.2, clearcoat: 0.8 });
      const yelP = K.phys(0xf2b414, { roughness: 0.22, clearcoat: 0.8 });
      const chiliG = K.phys(0x3f8a2a, { roughness: 0.25, clearcoat: 0.7 });
      const chiliR = K.phys(0xd0281a, { roughness: 0.22, clearcoat: 0.8 });
      soilThermo(K, 'thermo', [0.95, T, 0.45], 'Soil thermometer: 65°F+ at 4″ deep');
      const comp = K.part('compost', [0, T + 0.01, 0], null, '1–2″ compost + balanced fertilizer, mixed in');
      K.box(comp, [2.36, 0.02, 1.14], soilMat(K, 0x2e2018), [0, 0, 0], null, 0.005);
      const S = T + 0.02;
      const holes = K.part('holes', [0, S + 0.001, 0], null, 'Holes 18″ apart, as deep as the pot');
      PEP_X.forEach((x) => PEP_Z.forEach((z) => {
        K.cyl(holes, [0.06, 0.06, 0.003, 20], K.std(0x2a1c12, { roughness: 1 }), [x, 0, z]);
        K.sph(holes, 0.05, soilMat(K, 0x4a3426), [x + 0.09, 0, z + 0.05], [1.2, 0.4, 1]);
      }));
      // hardened-off transplants in 4″ pots beside the bed
      const starts = K.part('starts', [0, 0, 0.95], null, 'Hardened-off transplants, 6–8″ tall, no flowers yet');
      const potM = K.std(0x232426, { roughness: 0.6 });
      PEP_X.forEach((x, i) => PEP_Z.forEach((z, j) => {
        const g = K.group(starts, [x * 0.55 + j * 0.06, 0, j * 0.13]);
        K.lathe(g, [[0, 0], [0.04, 0], [0.05, 0.095], [0.046, 0.095], [0.036, 0.004], [0, 0.004]], potM, [0, 0, 0], [0, 45, 0], 4);
        K.cyl(g, [0.046, 0.04, 0.004, 4], soilMat(K, 0x3e2c20), [0, 0.088, 0], [0, 45, 0]);
        youngPepper(K, g, [0, 0.09, 0], 0.14, M, i * 50 + j * 90);
      }));
      const young = K.part('young', [0, 0, 0], null, 'Transplants set at the same depth they grew in the pot');
      PEP_X.forEach((x, i) => PEP_Z.forEach((z, j) => youngPepper(K, young, [x, S, z], 0.17, M, i * 70 + j * 33)));
      const collars = K.part('collars', [0, S, 0], null, 'Cardboard cutworm collars, 1″ into the soil');
      PEP_X.forEach((x) => PEP_Z.forEach((z) => K.cyl(collars, [0.03, 0.03, 0.07, 16, true], K.std(0xb8946a, { roughness: 0.9, side: DS }), [x, 0.02, z])));
      const stakes = K.part('stakes', [0, S, 0], null, '3–4 ft bamboo stakes, 3″ from each stem');
      const bamboo = K.std(0xc8b070, { roughness: 0.6 });
      const tieM = K.std(0x58a04a, { roughness: 0.8 });
      PEP_X.forEach((x) => PEP_Z.forEach((z) => {
        K.cyl(stakes, [0.006, 0.007, 0.95, 8], bamboo, [x + 0.07, 0.3, z - 0.03]);
        [0.18, 0.4].forEach((y) => K.tor(stakes, [0.032, 0.003], tieM, [x + 0.04, y, z - 0.015], [90, 0, 0]).scale.set(1.4, 0.8, 1));
      }));
      const mulch = K.part('mulch', [0, S + 0.02, 0], null, '2–3″ straw once the soil is warm');
      K.box(mulch, [2.36, 0.035, 1.14], K.bumpy(0xd9c27e, TB.tex.speckle(), 0.03, { roughness: 1 }), [0, 0, 0], null, 0.015);
      K.rep(90, (i) => K.box(mulch, [0.09, 0.004, 0.004], K.std(0xe6d08e, { roughness: 1 }), [Math.sin(i * 12.7) * 1.1, 0.019, Math.cos(i * 7.3) * 0.53], [0, (i * 53) % 180, 0], 0));
      // mature plants and everything that hangs on them
      const plants = K.part('plants', [0, 0, 0], null, 'Bushy plants, 18–30″ tall');
      const flowers = K.part('flowers', [0, 0, 0], null, 'Small white flowers at each fork');
      const first = K.part('firstFlowers', [0, 0, 0], null, 'Early flowers on new transplants (pinch these)');
      const bG = K.part('bellsGreen', [0, 0, 0], null, 'Green bells: full size, firm and glossy');
      const bR = K.part('bellsRipe', [0, 0, 0], null, 'Ripe color: 2–4 weeks after green, sweeter');
      const cG = K.part('chiliGreen', [0, 0, 0], null, 'Green chilies (jalapeño stage)');
      const cR = K.part('chiliRipe', [0, 0, 0], null, 'Ripe red chilies: hottest and best for drying');
      const petal = K.std(0xf6f4ec, { roughness: 0.6, side: DS });
      const ctr = K.std(0xd8c84a, { roughness: 0.6 });
      PEP_X.forEach((x, i) => PEP_Z.forEach((z, j) => {
        const yaw = i * 70 + j * 33;
        const an = pepperPlant(K, plants, [x, S + 0.02, z], 0.58 + ((i + j) % 3) * 0.04, M, yaw, 3);
        flower(K, first, [x + 0.012, S + 0.2, z], petal, ctr, 0.011, -35, yaw);
        an.forEach((o, k) => {
          if (o.tip) flower(K, flowers, [o.tip[0], o.tip[1] - 0.02, o.tip[2]], petal, ctr, 0.012, -35, k * 40);
          if (k % 2 === 0 || k === 3) {
            bell(K, bG, o.p, greenP, calyx, 0.95 + (k % 3) * 0.08);
            bell(K, bR, o.p, (i + j + k) % 3 === 0 ? yelP : (k % 2 ? greenP : redP), calyx, 1.05);
          }
          if (k > 0) {
            const lean = ((k * 37) % 30) - 15;
            chili(K, cG, o.p, chiliG, calyx, 0.95, lean);
            chili(K, cR, o.p, k % 3 === 0 ? chiliG : chiliR, calyx, 1, lean);
          }
        });
      }));
      // problems: blossom-end rot and sunscald on two fruits, aphids under leaves
      const prob = K.part('problems', [0, 0, 0], null, 'Blossom-end rot (dark, sunken base) and sunscald (pale, papery patch)');
      const berG = K.group(prob, [PEP_X[3] + 0.18, S + 0.25, PEP_Z[1] + 0.12]);
      bell(K, berG, [0, 0, 0], greenP, calyx, 1.05);
      K.sph(berG, 0.018, K.std(0x2a2018, { roughness: 1 }), [0, -0.072, 0], [1.2, 0.35, 1.2]);
      const scG = K.group(prob, [PEP_X[3] + 0.05, S + 0.3, PEP_Z[1] + 0.2]);
      bell(K, scG, [0, 0, 0], redP, calyx, 1.05);
      K.sph(scG, 0.02, K.std(0xe8e0c4, { roughness: 0.9 }), [0.022, -0.04, 0.018], [0.6, 1, 0.8]);
      const aph = K.part('aphids', [PEP_X[1], S + 0.3, PEP_Z[0]], null, 'Aphids on new growth (hose off or insecticidal soap)');
      const aphM = K.std(0x8ab04a, { roughness: 0.6 });
      K.rep(28, (k) => K.sph(aph, 0.0035, aphM, [Math.sin(k * 2.3) * 0.03, 0.02 + Math.cos(k * 1.7) * 0.012, Math.cos(k * 3.1) * 0.03], [1, 0.7, 1.4]));
      leaf(K, aph, [0, 0.03, 0], 0, -10, 0.09, 0.04, M.leaf2);
      pruners(K, 'pruners', [PEP_X[2] + 0.1, S + 0.36, PEP_Z[1] + 0.22], [0, 35, -40], 'Pruners: cut, don’t pull (branches snap)');
      const hv = K.part('harvest', [1.6, 0, 0.6], null, 'Harvest: cut with ½″ of stem; store at 45–50°F');
      basket(K, hv, [0, 0, 0], 0.2, (g, r) => {
        for (let k = 0; k < 9; k++) bell(K, g, [Math.cos(k * 2.4) * r * 0.5 * (k % 3) * 0.6, 0.2 + (k % 3) * 0.02, Math.sin(k * 2.4) * r * 0.5 * (k % 3) * 0.6], [redP, yelP, greenP][k % 3], calyx, 1.1);
        for (let k = 0; k < 6; k++) chili(K, g, [-0.07 + k * 0.03, 0.235, 0.05], chiliR, calyx, 1, 80);
      });
      const cover = tunnel(K, 'cover', [0, S, 0], 2.36, 0.5, 'Row cover on hoops for cold nights (below 55°F)', 0.45);
      const drip = K.part('drip', [0, S + 0.006, 0], null, 'Drip line along each row, under the mulch');
      PEP_Z.forEach((z) => K.cyl(drip, [0.007, 0.007, 2.3, 10], 'black', [0, 0, z + 0.07], [0, 0, 90]));
      K.tube(drip, [[1.15, 0, 0.37], [1.3, -0.05, 0.45], [1.4, -S, 0.65], [1.8, -S, 0.4]], 0.007, 'black');
      return {};
    }
  );

  const G = [];
  /* @@GUIDES@@ */

  TB.category({
    id: 'grow-veg',
    icon: 'veg',
    code: 'VEG',
    name: 'Vegetables',
    domain: 'grow',
    kind: 'grow',
    blurb: 'Plan the plot, then grow peppers, salad greens, cucumbers, squash, beans, peas, roots, onions and cabbage-family crops',
    repairs: G,
  });
})();
