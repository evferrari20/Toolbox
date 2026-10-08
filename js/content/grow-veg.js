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
  /* ---------- Guide: peppers ---------- */
  const PS = 0.265; // pepper bed soil surface
  const PEP_SWEET_STEPS = [
    { t: 'Get sturdy transplants', d: 'Buy or grow 6–8″ transplants with 4–8 dark green leaves, a pencil-thick stem and no flowers or fruit yet. From seed, sow ¼″ deep 8–10 weeks before your last frost on a heat mat at 80–85°F, then harden them off outdoors for 7–10 days.', why: 'Peppers need a long, warm season, so almost everyone outside the Deep South starts with transplants. A short, stocky plant re-roots fast; a tall one already in bloom stalls for weeks.', tip: 'Slide a plant out of its pot at the store: you want white roots reaching the edges, not a brown mat circling the bottom. Skip any with spotted leaves; bacterial spot rides in on transplants.', ok: 'The plants stand upright on their own, leaves are deep green with no spots, and they have spent at least a week outside without wilting.', v: { cam: [0.5, 0.75, 2.0], at: [0, 0.12, 0.95], hi: ['starts'], show: ['starts'] } },
    { t: 'Wait for warm soil', d: 'Push a soil thermometer 4″ deep in the morning. Plant once it reads 65°F (60°F at the very least) and night air stays above 55°F, usually 2–3 weeks after your average last frost date.', why: 'Pepper roots barely grow in cold soil. A cold night under 55°F can make the plant drop its first flowers and sit stunted for a month, so early planting rarely means an earlier harvest.', tip: 'If you are itching to plant, lay black plastic over the bed for a week first; it can warm the top 4″ by 5–10°F. Cut X-shaped slits in it to plant through.', ok: 'Three mornings in a row the dial reads 65°F or more, and the 10-day forecast shows no nights below 55°F.', v: { cam: [1.5, 0.75, 1.2], at: [0.9, 0.3, 0.45], hi: ['thermo'], show: ['thermo'] } },
    { t: 'Feed the bed, lightly', d: 'Spread 1–2″ of finished compost plus a balanced fertilizer at the label rate (about 2–3 lb of an organic 5-5-5 or 1 lb of 10-10-10 per 100 sq ft) and mix it into the top 6″. Aim for a soil pH of 6.2–6.8.', why: 'Peppers want steady, moderate food. Too much nitrogen at planting grows a big leafy bush that sets fruit late, so go easy now and feed again once fruit appears.', tip: 'A 4×8 bed is 32 sq ft, about a third of 100 sq ft. Weigh the fertilizer on a kitchen scale once and mark the level on a cup so you never have to guess again.', ok: 'The bed surface is even, dark and crumbly, with no white fertilizer lumps visible.', v: { cam: [1.7, 1.3, 1.8], at: [0, 0.25, 0], hi: ['compost'], show: ['compost'], hide: ['thermo'], tool: { id: 'trowel', at: [0.5, PS + 0.02, 0.2], rot: [20, 0, -25], anim: 'push' } } },
    { t: 'Dig holes 18″ apart', d: 'Mark two rows 24″ apart down the bed and dig holes every 18″ (24″ for big bells or habaneros), as deep and a bit wider than the pots. In open ground, use rows 30–36″ apart.', why: 'Close spacing lets the leaves meet and shade the fruit, which protects them from sunscald. Wider than 24″ wastes space; tighter than 12″ invites leaf diseases.', tip: 'Cut a stick to exactly 18″ and use it as a spacer. It is faster than a tape and you can leave it in the bed for planting the next crop.', ok: 'You have 8 evenly spaced holes in two staggered or straight rows, each about 4″ deep.', v: { cam: [1.2, 1.0, 1.4], at: [0, 0.27, 0], hi: ['holes'], show: ['holes'], tool: { id: 'trowel', at: [0.23, PS + 0.02, 0.3], rot: [20, 0, -20], anim: 'push' } } },
    { t: 'Plant and water in', d: 'Water the pots an hour ahead. Tip each plant out, set it at the same depth it grew (not deeper, unlike tomatoes), firm the soil, and slip a cardboard collar 1″ into the soil around the stem. Give each plant a quart to a half-gallon of water.', why: 'Pepper stems do not root along their length the way tomato stems do, so burying them deeper just risks stem rot. The collar stops cutworms, grubs that chew through young stems at night.', tip: 'Plant on a cloudy afternoon or in the evening. A toilet-paper tube cut in half makes a perfect collar.', ok: 'Each plant stands straight at the same soil line it had in the pot, and water soaks in without pooling.', v: { cam: [1.2, 1.0, 1.4], at: [0, 0.3, 0], hi: ['young', 'collars'], show: ['young', 'collars'], hide: ['holes', 'starts'], tool: { id: 'wateringCan', at: [0.5, 0.55, 0.32], rot: [0, 180, 25], scale: 0.9 } } },
    { t: 'Stake them now', d: 'Push a 3–4 ft bamboo stake 8–12″ deep, 3″ from each stem on the side away from the sun’s afternoon side. As plants grow, loop soft ties in a loose figure-8 around stake and main stem at 8″ and 16″.', why: 'Pepper branches are brittle. A plant loaded with fruit snaps at the fork in the first windy storm. A stake placed now misses the roots; one pushed in later spears them.', tip: 'Small tomato cages also work well for peppers and need no tying. For a row, the Florida weave (twine woven between stakes every 2–3 plants) is quick.', ok: 'The stake doesn’t wobble when you push it, and ties leave a finger’s width of slack around the stem.', v: { cam: [1.5, 1.0, 1.6], at: [0, 0.45, 0], hi: ['stakes'], show: ['stakes'], hide: ['collars'], tool: { id: 'hammer', at: [0.3, PS + 0.68, 0.27], rot: [0, 0, 0], anim: 'tap' } } },
    { t: 'Pinch early flowers', d: 'For the first 2–3 weeks after planting, pinch off any flower buds and tiny fruit with your fingers. Let flowers stay once the plant is about 12″ tall and putting out new leaves.', why: 'A small plant that sets fruit early pours its energy into that one pepper and stops growing. Removing early blooms builds a bigger frame that carries many more fruit later.', tip: 'If the plant came from the store already blooming, pinching is especially worth it. Snap the bud stalk off where it meets the branch; don’t tear the branch tip.', ok: 'The young plants have no buds or fruit, and new leaves are appearing at the top every few days.', v: { cam: [0.62, 0.62, 0.9], at: [0.23, 0.42, 0.3], hi: ['firstFlowers'], show: ['firstFlowers'] } },
    { t: 'Cover on cold nights', d: 'If nights dip below 55°F after planting, drape row cover (frost cloth) over hoops before sunset and remove it the next morning once it’s above 60°F. Take it off for good when nights stay above 60°F.', why: 'Cold nights cause flower drop and purple, stalled leaves. Row cover holds 2–4°F of the soil’s heat and also keeps flea beetles off young leaves.', tip: 'Weigh the edges with sandbags or boards, not rocks on the fabric itself; rocks tear it in wind. Clothespins hold the cloth to the hoops.', ok: 'The cover reaches the soil on all sides with no gaps, and leaves under it look perky the next morning.', v: { cam: [2.2, 1.4, 2.3], at: [0, 0.4, 0], hi: ['cover'], show: ['cover'], hide: ['firstFlowers'] } },
    { t: 'Mulch and set up watering', d: 'Once the soil has warmed (early summer), lay a drip line or soaker hose along each row and cover the bed with 2–3″ of straw or shredded leaves, kept 2″ off the stems. Aim for 1–2″ of water a week, at the soil.', why: 'Peppers are shallow-rooted. Mulch keeps the top few inches evenly moist and cool, which prevents blossom-end rot and flower drop in hot spells. Water on leaves spreads bacterial spot.', tip: 'Water deeply, then wait until the top 1–2″ of soil is dry to your finger before watering again. In a heat wave above 90°F that might be every 2–3 days.', ok: 'Push a finger into the soil under the mulch: it feels like a wrung-out sponge 3–4″ down, a day after watering.', v: { cam: [1.7, 1.2, 1.9], at: [0, 0.3, 0], hi: ['mulch', 'drip'], show: ['mulch', 'drip'], hide: ['cover'] } },
    { t: 'Feed when fruit sets', d: 'When the first peppers are the size of a walnut, side-dress each plant with about 1 tablespoon of 10-10-10 (or ½ cup of an organic 5-5-5) scattered in a ring 4–6″ from the stem, then water it in. Repeat once 3–4 weeks later.', why: 'Fruit set is when the plant’s demand for nutrients jumps. Feeding earlier, just before flowering, pushes leaves instead of fruit.', tip: 'If leaves are pale and growth is slow, a half-strength fish emulsion drench gives a quick boost without overdoing nitrogen.', ok: 'Plants are 18–30″ tall with dark green leaves, white flowers at the forks and small fruit forming.', v: { cam: [1.9, 1.3, 2.0], at: [0, 0.55, 0], hi: ['plants', 'bellsGreen'], show: ['plants', 'flowers', 'bellsGreen'], hide: ['young'] } },
    { t: 'Scout weekly for problems', d: 'Once a week, check leaf undersides and fruit. Hose off aphids or spray insecticidal soap. Pick off fruit with a dark, sunken base (blossom-end rot) or a pale, papery patch (sunscald). Remove leaves with small dark, greasy spots (bacterial spot).', why: 'Blossom-end rot comes from uneven watering, not a lack of calcium in most soils. Sunscald happens when fruit loses its leaf shade. Catching problems early keeps them from spreading.', tip: 'If bacterial spot shows up, a copper spray every 7–10 days protects new growth, and next year buy varieties with BLS resistance codes. Pull plants with whole wilted branches and yellow mottled leaves (virus).', ok: 'New leaves are clean and glossy, and fewer than 1 fruit in 10 shows a spot or patch.', v: { cam: [1.4, 1.0, 1.5], at: [0.3, 0.5, 0.05], hi: ['problems', 'aphids'], show: ['problems', 'aphids'] } },
    { t: 'Harvest green or wait for color', d: 'Bells are ready green once they are full size, firm and glossy, about 60–90 days after transplanting. For red, yellow or orange, leave them 2–4 more weeks. Cut the stem with pruners, leaving ½″ attached.', why: 'Green and colored peppers are the same fruit at different ages; the ripe ones are sweeter and richer in vitamins A and C. Pulling tears branches because pepper wood is brittle.', tip: 'Picking the first fruits green keeps the plant setting more. Once you have enough, let the rest ripen. A fruit that has started to blush finishes coloring on the counter in a few days.', ok: 'The pepper feels heavy and hard when squeezed gently, the skin is shiny, and the cut stem is clean.', v: { cam: [1.0, 0.8, 1.2], at: [0.3, 0.55, 0.3], hi: ['bellsRipe', 'pruners'], show: ['bellsRipe', 'pruners'], hide: ['bellsGreen', 'problems', 'aphids'] } },
    { t: 'Store, then clear the bed', d: 'Keep peppers unwashed at 45–50°F with high humidity for up to 2–3 weeks, or in a bag in the fridge crisper for about a week. Before the first frost, pick every fruit, then pull the plants and compost healthy ones.', why: 'Below 45°F peppers get chilling injury: pits, soft spots and rot. Frost kills the whole plant in one night, so a forecast of 32°F means harvest everything.', tip: 'Peppers freeze well without blanching: wash, slice, spread on a tray to freeze, then bag. Rotate peppers out of this bed for 3 years (also tomatoes, potatoes, eggplant).', ok: 'The fruits stay firm with smooth, unwrinkled skin for at least a week after picking.', v: { cam: [2.1, 1.0, 1.9], at: [1.2, 0.25, 0.4], hi: ['harvest'], show: ['harvest'], hide: ['pruners'] } },
  ];
  const PEP_HOT_STEPS = [
    { t: 'Start early or buy transplants', d: 'Sow hot pepper seeds ¼″ deep 8–10 weeks before your last frost (10–12 weeks for habaneros and other Capsicum chinense types) on a heat mat at 80–90°F. Expect 7–21 days to sprout. Harden off 7–10 days before planting.', why: 'Hot peppers, especially habaneros, grow slowly and need 90–120 days of warm weather after transplanting. Cool soil can delay germination by weeks.', tip: 'Label every cell. Jalapeño, cayenne and habanero seedlings look identical, and the difference matters a lot in the kitchen.', ok: 'Seedlings are 6–8″ tall, sturdy and dark green, and they have stood outside all day without wilting.', v: { cam: [0.5, 0.75, 2.0], at: [0, 0.12, 0.95], hi: ['starts'], show: ['starts'] } },
    { t: 'Wait for warm soil', d: 'Plant when the soil 4″ down reads 65°F or more and nights stay above 55°F, usually 2–3 weeks after the last frost. Hot types are even more cold-sensitive than bells.', why: 'Cold soil stunts roots and cold nights drop flowers. A hot pepper set back in May may not ripen before fall frost.', tip: 'Short season (under 120 frost-free days)? Choose early types: jalapeño, Hungarian wax, cayenne, or early-hybrid habaneros listed around 70–90 days.', ok: 'Morning soil readings stay at 65°F or more for 3 days in a row.', v: { cam: [1.5, 0.75, 1.2], at: [0.9, 0.3, 0.45], hi: ['thermo'], show: ['thermo'] } },
    { t: 'Prepare a lean, well-drained bed', d: 'Mix 1″ of compost and half the usual balanced fertilizer (about 1–1.5 lb of an organic 5-5-5 per 100 sq ft) into the top 6″. Hot peppers want pH 6.0–6.8 and sharp drainage.', why: 'Rich soil makes huge plants with fewer, milder pods. Soggy soil invites Phytophthora root rot, which collapses whole plants.', tip: 'In heavy clay, build the row into a 6–8″ high raised mound so roots never sit in water after a storm.', ok: 'A hole filled with water drains completely within a few hours.', v: { cam: [1.7, 1.3, 1.8], at: [0, 0.25, 0], hi: ['compost'], show: ['compost'], hide: ['thermo'], tool: { id: 'trowel', at: [0.5, PS + 0.02, 0.2], rot: [20, 0, -25], anim: 'push' } } },
    { t: 'Space 18–24″ apart', d: 'Dig holes 18″ apart for jalapeños and cayennes and 24″ for habaneros and big bushy types, in rows 24–36″ apart. Make each hole as deep as the pot.', why: 'Habaneros can reach 3–4 ft wide. Crowded plants stay damp and get leaf spots, but leaves touching slightly shade the fruit from sunscald.', tip: 'Plant a single row of 2–3 hot plants at the end of the bed; most households can’t use more than that.', ok: 'Holes are evenly spaced and the same depth as the pots.', v: { cam: [1.2, 1.0, 1.4], at: [0, 0.27, 0], hi: ['holes'], show: ['holes'], tool: { id: 'trowel', at: [0.23, PS + 0.02, 0.3], rot: [20, 0, -20], anim: 'push' } } },
    { t: 'Plant at pot depth', d: 'Water the pots first, set plants at the same depth they grew, firm the soil and water each with a quart or two. Add cardboard collars against cutworms.', why: 'Pepper stems don’t form roots when buried, so deeper planting only risks rot.', tip: 'Wash your hands after smoking or handling tobacco before touching pepper plants: tobacco mosaic virus spreads on fingers.', ok: 'Each plant sits at its original soil line and the water soaks straight in.', v: { cam: [1.2, 1.0, 1.4], at: [0, 0.3, 0], hi: ['young', 'collars'], show: ['young', 'collars'], hide: ['holes', 'starts'], tool: { id: 'wateringCan', at: [0.5, 0.55, 0.32], rot: [0, 180, 25], scale: 0.9 } } },
    { t: 'Stake for the fruit load', d: 'Push a 3–4 ft stake 8–12″ deep beside each plant now and tie the main stem loosely as it grows. Habaneros may need two stakes or a small cage.', why: 'A loaded hot pepper carries 50–100 pods on brittle branches; wind or heavy rain splits them at the forks.', tip: 'Use soft garden tape or strips of old T-shirt. Twine and wire cut into stems as they thicken.', ok: 'The plant stays upright when you shake the stake gently.', v: { cam: [1.5, 1.0, 1.6], at: [0, 0.45, 0], hi: ['stakes'], show: ['stakes'], hide: ['collars'], tool: { id: 'hammer', at: [0.3, PS + 0.68, 0.27], rot: [0, 0, 0], anim: 'tap' } } },
    { t: 'Protect from cold, then mulch', d: 'Use row cover on hoops for nights below 55°F. When nights stay above 60°F, remove it, run drip or soaker lines along the rows, and spread 2–3″ of straw 2″ away from the stems.', why: 'Steady moisture stops blossom drop and blossom-end rot. Mulch keeps the shallow roots cool in summer heat.', tip: 'In hot desert climates, 30% shade cloth over the bed in the afternoon prevents sunscald and flower drop above 95°F.', ok: 'Soil under the mulch stays evenly moist 3″ down between waterings.', v: { cam: [1.7, 1.2, 1.9], at: [0, 0.3, 0], hi: ['mulch', 'drip'], show: ['mulch', 'drip'] } },
    { t: 'Water deeply, feed at fruit set', d: 'Give 1–2″ of water a week. When the first pods form, side-dress with about 1 tablespoon of 10-10-10 per plant (or ½ cup of an organic 5-5-5) and water it in; repeat once a month later.', why: 'Fruit set is when the plant needs food most. Steady water keeps pods smooth.', tip: 'For hotter pods, ease off watering slightly once most fruit is full size and starting to color: mild drought stress raises capsaicin. Don’t let plants wilt for days, though.', ok: 'The plants are bushy and dark green, with white flowers and clusters of green pods.', v: { cam: [1.9, 1.3, 2.0], at: [0, 0.55, 0], hi: ['plants', 'chiliGreen'], show: ['plants', 'flowers', 'chiliGreen'], hide: ['young'] } },
    { t: 'Scout for pests and spots', d: 'Check weekly. Hose off aphids or use insecticidal soap. Remove fruit with dark sunken ends or pale papery patches. In the East, pepper maggot flies lay eggs in fruit in July; a fine mesh cover over the plants keeps them out.', why: 'Most pepper problems are cheap to stop early and expensive to fix once they spread.', tip: 'If leaves show small dark, water-soaked spots, stop overhead watering and spray copper every 7–10 days in wet weather.', ok: 'Leaf undersides are clean and the pods are smooth and glossy.', v: { cam: [1.4, 1.0, 1.5], at: [0.3, 0.5, 0.05], hi: ['problems', 'aphids'], show: ['problems', 'aphids'] } },
    { t: 'Harvest wearing gloves', d: 'Pick jalapeños green when 3–3½″ long and firm (about 65–75 days from transplant) or let any type ripen to red, orange or yellow for full heat and flavor. Habaneros take 90–120 days. Cut the stems with pruners and wear nitrile gloves.', why: 'Capsaicin, the hot compound, sits in the white ribs inside and soaks into skin. It burns eyes for hours and soap barely removes it.', tip: 'Fine tan lines (corking) on jalapeños are normal and a sign of a mature, hotter pod. If you do burn your hands, rub them with vegetable oil, then wash with dish soap.', ok: 'The pods are glossy and firm, and the cut stems are clean with no torn bark on the branch.', v: { cam: [1.0, 0.8, 1.2], at: [0.3, 0.55, 0.3], hi: ['chiliRipe', 'pruners'], show: ['chiliRipe', 'pruners'], hide: ['chiliGreen', 'problems', 'aphids'] } },
    { t: 'Dry, freeze or store', d: 'Store fresh pods at 45–50°F for 1–2 weeks. Dry fully red pods on a string in a warm, airy spot for 3–4 weeks, or in a dehydrator at 125–135°F. Freeze whole or sliced. Pick everything before the first frost.', why: 'Thin-walled cayennes and Thai types dry easily; thick jalapeños are better smoked (chipotle), pickled or frozen.', tip: 'Work with dried hot peppers by an open window and wear a dust mask when grinding them; the dust is a strong irritant.', ok: 'Dried pods snap or crumble and rattle when shaken, with no soft spots or mold.', v: { cam: [2.1, 1.0, 1.9], at: [1.2, 0.25, 0.4], hi: ['harvest'], show: ['harvest'], hide: ['pruners'] } },
  ];
  G.push({
    id: 'grow-peppers',
    title: 'Grow sweet and hot peppers',
    model: 'vegPepper',
    level: 2,
    time: '1–2 hrs to plant, then 15 min a week; 60–120 days to harvest',
    cost: '$25–80',
    summary: 'Set sturdy, hardened-off transplants into warm soil (65°F) 18″ apart, stake them at planting, and keep the water steady under mulch. Feed lightly at planting and again when fruit sets, and cut, never pull, the peppers green or fully colored.',
    intro: { show: ['plants', 'bellsRipe', 'stakes', 'mulch'], preview: true, spin: true },
    card: [
      ['Sun', 'Full sun, 8+ hours'],
      ['Plant when', '2–3 weeks after last frost; soil 65°F at 4″, nights above 55°F'],
      ['Spacing', '18″ apart (24″ for big types), rows 24–36″'],
      ['Depth', 'Seeds ¼″; transplants at their pot depth'],
      ['Soil pH', '6.2–6.8, well drained'],
      ['Water', '1–2″ per week, evenly, at the soil'],
      ['Feed', 'Light balanced feed at planting; side-dress at first fruit set'],
      ['Days to harvest', 'Bells 60–90 from transplant (green), +2–4 weeks for color; hot 65–120'],
      ['Good neighbours', 'Basil, onions, carrots, lettuce at the edges'],
      ['Watch for', 'Blossom drop, blossom-end rot, sunscald, aphids, bacterial spot'],
    ],
    safety: [
      'Wear nitrile gloves to cut and handle hot peppers, and never touch your eyes, nose or contact lenses until you have washed your hands twice with dish soap.',
      'Copper sprays and insecticidal soaps are pesticides: read and follow the label, wear gloves and eye protection, and keep kids and pets away until the spray dries.',
      'Pepper leaves and stems belong to the nightshade family; keep pets from chewing them.',
    ],
    causes: [
      ['Sweet or hot?', 'Bells (California Wonder, Ace, King of the North for short seasons) are the most demanding. Frying types (Carmen, Lunchbox snack peppers) set more fruit in cool or hot summers. Hot types run from mild (Anaheim, poblano) to medium (jalapeño, Hungarian wax), hot (cayenne, Thai) and very hot (habanero, Scotch bonnet).'],
      ['Count your warm days', 'Days to maturity on the tag usually count from transplanting. You need that many days of warm weather after the soil reaches 65°F, plus 2–4 weeks if you want ripe color. Short season? Pick early varieties and use black plastic.'],
      ['Ground, raised bed or pot', 'Raised beds warm and drain fastest. A single pepper grows well in a 5-gallon (or larger) container of potting mix; pots dry out daily in summer, so check them every morning.'],
      ['Resistance codes', 'Seed catalogs list resistance after the name: BLS (bacterial leaf spot), TMV (tobacco mosaic), PVY (potato virus Y), Phyto (Phytophthora). If you lost plants to one of these before, buy resistant types.'],
    ],
    tools: ['Transplants (6–8″, hardened off)', 'Soil thermometer', 'Compost', 'Balanced fertilizer', 'Trowel', '3–4 ft bamboo stakes + soft ties', 'Row cover + hoops', 'Straw mulch', 'Drip line or soaker hose', 'Bypass pruners', 'Nitrile gloves (hot peppers)'],
    steps: PEP_SWEET_STEPS,
    tricks: [
      ['Match the plant to the summer', 'Where nights stay cool, grow snack and frying peppers and early bells; where days top 90°F, grow cayennes, Anaheims and habaneros, which hold their flowers better in heat.'],
      ['Black plastic jump-start', 'Covering the bed with black plastic for a week before planting and planting through slits gives peppers a 1–2 week head start in cool regions.'],
      ['Basket of colors, one plant', 'Pick the first fruit of each plant green, then let the rest go to full color. You get early peppers and sweet ripe ones from the same bush.'],
      ['Fixing flower drop', 'Flowers falling off is almost always temperature (nights under 55–60°F or days over 90°F) or drought, not pests. Wait for milder weather and keep watering steady; plants start setting again.'],
      ['Overwinter a favorite', 'Peppers are perennials. Before frost, cut a plant back to a 6–8″ Y-shaped frame, pot it, keep it cool (50–60°F) and barely moist indoors, and replant it in spring for an early crop.'],
      ['Isolate for seed saving', 'Sweet and hot peppers cross through bees. Saved seed from a bell grown next to a habanero can give spicy bells next year, though this year’s fruit tastes normal.'],
    ],
    learn: {
      how: 'Peppers (Capsicum) are warm-season plants from the American tropics. The stem grows straight up, then splits into two or three branches at a fork, and each branch keeps forking; a flower forms at every fork, which is why fruit hangs at the joints. Flowers only set fruit when nights are between about 60 and 75°F, so cold nights and heat waves both make them drop. A green pepper is simply an unripe one: as it ripens, chlorophyll breaks down and red or yellow pigments build up, along with sugar and vitamin C. In hot peppers, capsaicin is made in the white ribs (placenta) that hold the seeds, and dry, hot weather at ripening raises it.',
      specs: [['Germination', '80–85°F soil (hot types up to 90°F); 7–21 days'], ['Start indoors', '8–10 weeks before last frost (10–12 for habanero)'], ['Transplant', 'Soil ≥ 65°F at 4″; nights > 55°F'], ['Spacing', '18–24″ in the row, rows 24–36″'], ['Soil pH', '6.2–6.8'], ['Water', '1–2″/week'], ['Fruit set', 'Best with nights 60–75°F; drops above 90°F days'], ['Storage', '45–50°F, 90–95% humidity, 2–3 weeks; chilling injury below 45°F']],
      terms: [['Hardening off', 'Getting indoor-grown plants used to sun, wind and cool nights over 7–10 days.'], ['Side-dress', 'Scattering fertilizer on the soil beside growing plants, then watering it in.'], ['Blossom-end rot', 'A dark, leathery, sunken patch on the bottom of the fruit caused by calcium not reaching the fruit, almost always due to uneven watering.'], ['Sunscald', 'A pale, papery patch where hot sun hit fruit no longer shaded by leaves.'], ['Capsaicin', 'The compound that makes hot peppers hot; measured in Scoville heat units.'], ['Corking', 'Fine tan cracks on jalapeño skin as it matures; harmless.']],
      mistakes: ['Planting in cold May soil to get a head start.', 'Burying the stem deep like a tomato.', 'Heavy nitrogen before flowering (big plants, few peppers).', 'Watering in fits and starts (blossom-end rot).', 'Pulling peppers off by hand and breaking branches.', 'Rubbing your eyes after handling hot peppers.'],
      tips: ['Peppers grow beautifully in 5-gallon pots of potting mix on a sunny patio.', 'A 2″ layer of mulch can cut watering by a third.', 'Ripe red bells have roughly twice the vitamin C of green ones.'],
    },
    pro: 'Whole plants wilt and collapse even though the soil is moist, or a dark lesion girdles stems at the soil line (likely Phytophthora blight or a wilt). Bag a plant and take it to your county extension office or plant diagnostic clinic before you replant that bed.',
    refs: [
      ['Growing Peppers in the Home Garden (University of Maryland Extension)', 'https://extension.umd.edu/sites/extension.umd.edu/files/2026-02/Peppers.pdf'],
      ['Peppers (Mississippi State University Extension)', 'https://extension.msstate.edu/lawn-and-garden/vegetable-gardens/peppers'],
      ['Growing peppers in home gardens (University of Minnesota Extension)', 'https://extension.umn.edu/vegetables/growing-peppers-home-gardens'],
      ['Peppers (UConn Home & Garden Education Center)', 'https://homegarden.cahnr.uconn.edu/wp-content/uploads/sites/3479/2022/08/Peppers.pdf'],
      ['Field Pepper Production (Johnny’s Selected Seeds)', 'https://www.johnnyseeds.com/on/demandware.static/-/Library-Sites-JSSSharedLibrary/default/dw304af179/assets/information/7655-field-pepper-production.pdf'],
      ['Pepper postharvest handling (UC Davis Postharvest Center)', 'https://postharvest.ucdavis.edu/node/8026'],
    ],
    variants: [
      { id: 'sweet', name: 'Sweet bell peppers', blurb: 'Blocky bells and snack peppers: picked green or left to ripen red, yellow or orange.' },
      {
        id: 'hot',
        name: 'Hot peppers',
        blurb: 'Jalapeño, cayenne and habanero: longer season, leaner soil, gloves at harvest, and drying.',
        level: 2,
        time: '1–2 hrs to plant; 65–120 days to harvest',
        summary: 'Start hot peppers early (habaneros 10–12 weeks), plant into warm, well-drained and not-too-rich soil 18–24″ apart, stake them, keep water steady, and harvest with gloves on, green or fully ripe. Dry thin-walled types, freeze or pickle the rest.',
        intro: { show: ['plants', 'chiliRipe', 'stakes', 'mulch'], preview: true, spin: true },
        card: [
          ['Sun', 'Full sun, 8+ hours'],
          ['Plant when', '2–3 weeks after last frost; soil 65°F, nights above 55°F'],
          ['Spacing', '18″ (jalapeño, cayenne) to 24″ (habanero), rows 24–36″'],
          ['Depth', 'Seeds ¼″; transplants at pot depth'],
          ['Soil pH', '6.0–6.8, sharply drained'],
          ['Water', '1–2″ per week; slightly less as pods ripen'],
          ['Feed', 'Half rate at planting; side-dress at fruit set'],
          ['Days to harvest', 'Jalapeño 65–75, cayenne 70–80, habanero 90–120 from transplant'],
          ['Watch for', 'Slow germination, cold stall, aphids, pepper maggot, Phytophthora'],
        ],
        tools: ['Hot pepper transplants', 'Soil thermometer', 'Compost', 'Balanced fertilizer (half rate)', 'Stakes + soft ties', 'Row cover', 'Straw mulch', 'Drip line', 'Pruners', 'Nitrile gloves', 'Twine or dehydrator for drying'],
        steps: PEP_HOT_STEPS,
        tricks: [
          ['Heat dial', 'Heat depends on variety first, then weather: hot, dry, sunny weeks at ripening make the hottest pods from the same plant.'],
          ['Gloves for knives too', 'Wear gloves for slicing as well as picking, and wash the cutting board and knife in hot soapy water before cutting anything else.'],
          ['Ristra drying', 'Thread a needle with fishing line through the stems of fully red cayennes or Anaheims and hang the string in a warm, airy room out of direct sun.'],
        ],
      },
    ],
  });

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
