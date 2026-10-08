/* GF · Grow: Fruit & berries (FRT) and Herbs (HRB). Real meters (unit: 1). Plants are built from extruded
   leaf outlines, lathes and tubes (same plant kit as grow.js, copied here because those helpers are private);
   walkthroughs reveal each growth stage in turn: planting → young → flowering → fruit → pruning / renovation. */
(function () {
  const TB = window.TB;
  const DS = THREE.DoubleSide;
  const DEG = Math.PI / 180;
  const GARDEN = (o) =>
    Object.assign({ unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 10 }, tex: ['wood_planks', 'forrest_ground_01', 'pine_bark', 'interlocking_concrete_pavers'] }, o);

  /* ---------- plant kit (copied from grow.js so the section looks consistent) ---------- */
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
  // Narrow needle / strap leaf.
  function strapPts(L, W) {
    return [[W / 2, 0], [W / 2, L * 0.75], [W * 0.15, L], [-W * 0.15, L], [-W / 2, L * 0.75], [-W / 2, 0]];
  }
  // Palmately lobed leaf (fig, grape): five rounded lobes around a base at the origin.
  function lobedPts(L, deep) {
    const pts = [];
    const n = 60;
    for (let i = 0; i <= n; i++) {
      const a = -Math.PI * 0.95 + (i / n) * Math.PI * 1.9;
      const lobe = 1 - deep * Math.pow(Math.abs(Math.sin(a * 2.5)), 0.7);
      const r = L * 0.55 * lobe * (0.75 + 0.25 * Math.cos(a));
      pts.push([Math.sin(a) * r, L * 0.42 + Math.cos(a) * r]);
    }
    pts.push([0, 0.0]);
    return pts;
  }
  // Direction vector for compass yaw (deg) and elevation (deg): matches orient() below.
  const dir = (yaw, elev) => [Math.sin(yaw * DEG) * Math.cos(elev * DEG), Math.sin(elev * DEG), Math.cos(yaw * DEG) * Math.cos(elev * DEG)];
  const add = (a, b, s) => [a[0] + b[0] * (s == null ? 1 : s), a[1] + b[1] * (s == null ? 1 : s), a[2] + b[2] * (s == null ? 1 : s)];
  // A group whose +Y points outward at compass angle yaw (deg) and elevation elev (deg above horizontal).
  const orient = (K, p, pos, yaw, elev) => K.group(K.group(p, pos, [0, yaw, 0]), [0, 0, 0], [90 - elev, 0, 0]);
  function leaf(K, p, pos, yaw, elev, L, W, mat, serr) {
    const g = orient(K, p, pos, yaw, elev);
    K.ext(g, leafPts(L, W, 10, serr), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  function needle(K, p, pos, yaw, elev, L, W, mat) {
    const g = orient(K, p, pos, yaw, elev);
    K.ext(g, strapPts(L, W), 0.001, mat, [0, 0, -0.0005], null, 0);
    return g;
  }
  function lobed(K, p, pos, yaw, elev, L, mat, deep) {
    const g = orient(K, p, pos, yaw, elev);
    K.ext(g, lobedPts(L, deep == null ? 0.35 : deep), 0.0015, mat, [0, 0, -0.0007], null, 0);
    return g;
  }
  function specks(K, p, n, y, mat, size, w, d) {
    for (let i = 0; i < n; i++) K.cyl(p, [size, size, size * 0.6, 6], mat, [Math.sin(i * 12.99) * w, y, Math.cos(i * 7.77 + i * i * 0.01) * d]);
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
  function pruners(K, name, pos, rot, label) {
    const g = K.part(name, pos, null, label || 'Bypass pruners (stems up to ¾″)');
    const r = K.group(g, [0, 0, 0], rot || [0, 0, 0]);
    const blade = K.std(0xc9ced3, { metalness: 1, roughness: 0.25 });
    K.ext(r, [[0, 0], [0.012, 0.01], [0.01, 0.055], [0.0, 0.065], [-0.006, 0.03]], 0.003, blade, [0, 0, 0.002], null, 0);
    K.ext(r, [[0, 0], [-0.01, 0.012], [-0.012, 0.045], [-0.004, 0.05], [0.003, 0.02]], 0.004, K.std(0x5a5f64, { metalness: 0.8, roughness: 0.4 }), [0, 0, -0.004], null, 0);
    K.cyl(r, [0.006, 0.006, 0.012, 12], 'steel', [0, 0, 0], [90, 0, 0]);
    K.bar(r, [0.004, -0.005, 0.002], [0.03, -0.19, 0.002], 0.009, K.std(0xc8352b, { roughness: 0.5 }));
    K.bar(r, [-0.004, -0.005, -0.002], [-0.025, -0.19, -0.002], 0.009, K.std(0xc8352b, { roughness: 0.5 }));
    return g;
  }
  function loppers(K, name, pos, rot) {
    const g = K.part(name, pos, null, 'Bypass loppers (½–1½″ branches)');
    const r = K.group(g, [0, 0, 0], rot || [0, 0, 0]);
    const blade = K.std(0xc9ced3, { metalness: 1, roughness: 0.25 });
    K.ext(r, [[0, 0], [0.02, 0.02], [0.016, 0.1], [0, 0.12], [-0.01, 0.05]], 0.004, blade, [0, 0, 0.002], null, 0);
    K.ext(r, [[0, 0], [-0.018, 0.02], [-0.02, 0.08], [-0.006, 0.09], [0.004, 0.03]], 0.006, K.std(0x5a5f64, { metalness: 0.8, roughness: 0.4 }), [0, 0, -0.006], null, 0);
    K.bar(r, [0.006, -0.01, 0], [0.09, -0.68, 0], 0.012, K.std(0x2a2c2f, { metalness: 0.5, roughness: 0.4 }));
    K.bar(r, [-0.006, -0.01, 0], [-0.07, -0.68, 0], 0.012, K.std(0x2a2c2f, { metalness: 0.5, roughness: 0.4 }));
    K.bar(r, [0.08, -0.6, 0], [0.095, -0.76, 0], 0.017, 'gripBlack');
    K.bar(r, [-0.062, -0.6, 0], [-0.075, -0.76, 0], 0.017, 'gripBlack');
    return g;
  }
  // Bag of product (fertilizer, sulfur, peat) with a label.
  function sack(K, p, pos, size, color, yaw, label) {
    const g = K.group(p, pos, [0, yaw || 0, 0]);
    K.box(g, size, K.std(color, { roughness: 0.65 }), [0, size[1] / 2, 0], [-6, 0, 0], Math.min(0.03, size[2] * 0.3));
    K.box(g, [size[0] * 0.72, size[1] * 0.36, 0.002], K.std(label || 0xf1ead6, { roughness: 0.8 }), [0, size[1] * 0.58, size[2] / 2 + 0.004], [-6, 0, 0], 0);
    return g;
  }
  // Nursery pot (tapered, black) from y=0 to H with rim radius R.
  function nurseryPot(K, p, pos, R, H, mat) {
    const rb = R * 0.8;
    return K.lathe(p, [[0, 0.004], [rb, 0.004], [R, H - 0.01], [R + 0.008, H], [R + 0.008, H - 0.012], [R - 0.004, H - 0.012], [rb - 0.004, 0.012], [0, 0.012]], mat || K.std(0x1f2022, { roughness: 0.6 }), pos);
  }
  // Big pot with rolled rim, outer radius R at the top, height H.
  const potLathe = (R, H) => {
    const rb = R * 0.78;
    return [[0, 0.015], [rb - 0.015, 0.015], [R - 0.015, H - 0.035], [R - 0.015, H], [R + 0.018, H], [R + 0.018, H - 0.05], [R, H - 0.05], [rb, 0], [0, 0]];
  };

  /* =====================================================================
     1 · Strawberries: matted-row bed through planting, runners, harvest and renovation
     ===================================================================== */
  function strawPlant(K, p, pos, s, M, o) {
    o = o || {};
    const g = K.group(p, pos, [0, o.yaw || 0, 0]);
    K.cyl(g, [0.01 * s, 0.014 * s, 0.022 * s, 8], M.crown, [0, 0.006 * s, 0]);
    const n = o.n || 6;
    for (let k = 0; k < n; k++) {
      const az = k * (360 / n) + 17;
      const el = 48 + (k % 3) * 10;
      const L = (0.1 + (k % 2) * 0.025) * s;
      const tip = add([0, 0.012 * s, 0], dir(az, el), L);
      K.bar(g, [0, 0.012 * s, 0], tip, 0.0017 * s, M.stem);
      [-48, 0, 48].forEach((d) => leaf(K, g, tip, az + d, 12 + (k % 2) * 8, 0.05 * s, 0.021 * s, k % 2 ? M.leaf : M.leaf2, true));
    }
    return g;
  }
  function strawFlower(K, p, pos, s, M) {
    const g = K.group(p, pos);
    for (let k = 0; k < 5; k++) K.sph(g, 0.0075 * s, M.petal, [Math.sin(k * 1.2566) * 0.008 * s, 0, Math.cos(k * 1.2566) * 0.008 * s], [1, 0.25, 1]);
    K.sph(g, 0.0045 * s, M.eye, [0, 0.002 * s, 0], [1, 0.6, 1]);
    return g;
  }
  function berry(K, p, pos, s, mat, M, tilt) {
    const g = K.group(p, pos, [180 + (tilt || 0), 0, 0]);
    K.lathe(g, [[0, 0], [0.006 * s, 0.006 * s], [0.011 * s, 0.016 * s], [0.0125 * s, 0.022 * s], [0.009 * s, 0.027 * s], [0, 0.028 * s]], mat, [0, 0, 0], null, 16);
    for (let k = 0; k < 5; k++) K.cone(g, [0.003 * s, 0.012 * s, 4], M.calyx, [Math.sin(k * 1.2566) * 0.006 * s, 0.028 * s, Math.cos(k * 1.2566) * 0.006 * s], [Math.cos(k * 1.2566) * -70, 0, Math.sin(k * 1.2566) * 70]);
    return g;
  }
  const SB_ROWS = [0.25, -0.82]; // row centers (3½ ft apart)
  const SB_MOM = [-0.92, -0.46, 0, 0.46, 0.92]; // mother plants 18″ apart
  TB.model(
    'frtStrawberry',
    GARDEN({ cam: [2.3, 1.35, 2.2], at: [0, 0.05, -0.25],
      hidden: ['testKit', 'compost', 'bareroot', 'holes', 'mothers', 'mothersFl', 'runners', 'winter', 'matted', 'flowers', 'straw', 'berries', 'net', 'mower', 'mowedEdge', 'mowedMid', 'tilled', 'fert', 'regrow', 'hills', 'hillFl', 'hillRun', 'hillBerries', 'drip'] }),
    (K) => {
      const M = {
        crown: K.std(0x7a5a3a, { roughness: 0.9 }), stem: K.std(0x6f9a3e, { roughness: 0.7 }),
        leaf: leafMat(K, 0x3f7d2e, 0.55), leaf2: leafMat(K, 0x4b8b36, 0.55), petal: K.std(0xfbfaf4, { roughness: 0.6 }), eye: K.std(0xf0c020, { roughness: 0.7 }),
        red: K.phys(0xd5202a, { roughness: 0.3, clearcoat: 0.7 }), pink: K.phys(0xf08a7a, { roughness: 0.35, clearcoat: 0.5 }), white: K.phys(0xe8eec8, { roughness: 0.4, clearcoat: 0.3 }),
        calyx: K.std(0x4f8a34, { roughness: 0.7 }), runner: K.std(0xa0603a, { roughness: 0.6 }), root: K.std(0x6a4a32, { roughness: 0.9 }),
      };
      const Y = 0.05; // soil surface
      const bed = K.part('bed', [0, 0, 0], null, 'Weed-free bed in full sun, loosened 8–12″ deep');
      K.box(bed, [2.6, Y, 2.1], soilMat(K, 0x5a4232), [0, Y / 2, -0.28], null, 0.02);
      SB_ROWS.forEach((z) => K.box(bed, [2.5, 0.025, 0.56], soilMat(K, 0x50392a), [0, Y + 0.008, z], null, 0.01));
      const Ys = Y + 0.02; // top of the row
      // soil test kit
      const kit = K.part('testKit', [1.05, Ys, 0.72], null, 'Soil test: aim for pH 5.8–6.5');
      K.box(kit, [0.18, 0.04, 0.12], K.std(0x2f6fae, { roughness: 0.5 }), [0, 0.02, 0], [0, 15, 0], 0.008);
      K.rep(3, (i) => K.cyl(kit, [0.008, 0.008, 0.08, 12], K.std([0x7fbf5a, 0xe0a03a, 0x8a6ad0][i], { transparent: true, opacity: 0.8, roughness: 0.1 }), [-0.04 + i * 0.04, 0.08, 0.0]));
      K.box(kit, [0.12, 0.002, 0.08], K.std(0xfafaf6, { roughness: 0.8 }), [0.05, 0.042, 0.1], [0, -10, 0], 0);
      // compost layer
      const comp = K.part('compost', [0, Ys + 0.004, 0], null, '2–3″ compost worked in');
      SB_ROWS.forEach((z) => K.box(comp, [2.48, 0.012, 0.55], K.pbr('forrest_ground_01', [2, 0.5], { color: 0x5a4433 }, soilMat(K, 0x2e2018)), [0, 0, z], null, 0.006));
      // bare-root bundle in a bucket of water
      const bare = K.part('bareroot', [1.0, 0, 0.75], null, 'Bare-root plants: roots trimmed to 4–5″, soaked 20–60 min');
      K.lathe(bare, [[0, 0.004], [0.11, 0.004], [0.13, 0.22], [0.135, 0.23], [0.128, 0.23], [0.105, 0.012], [0, 0.012]], K.std(0xe9e6de, { roughness: 0.45 }));
      K.cyl(bare, [0.122, 0.12, 0.004, 32], 'water', [0, 0.17, 0]);
      for (let k = 0; k < 7; k++) {
        const a = k * 0.9;
        const bx = Math.cos(a) * 0.05, bz = Math.sin(a) * 0.05;
        K.cyl(bare, [0.009, 0.011, 0.02, 8], M.crown, [bx, 0.23, bz]);
        for (let r = 0; r < 6; r++) K.bar(bare, [bx, 0.22, bz], [bx + Math.sin(r * 2.1) * 0.025, 0.1, bz + Math.cos(r * 1.7) * 0.025], 0.0018, M.root);
        [0, 120, 240].forEach((az) => leaf(K, bare, [bx, 0.24, bz], az + k * 40, 60, 0.04, 0.018, M.leaf2, true));
      }
      // planting holes: fan-shaped, roots spread
      const holes = K.part('holes', [0, Ys + 0.001, 0], null, 'Holes deep enough for straight-down roots');
      SB_ROWS.forEach((z) => SB_MOM.forEach((x) => K.cyl(holes, [0.06, 0.06, 0.004, 20], K.std(0x2a1d14, { roughness: 1 }), [x, 0, z])));
      // mother plants (year 1)
      const moms = K.part('mothers', [0, Ys, 0], null, 'Mother plants 18–24″ apart, crown half above the soil');
      const momFl = K.part('mothersFl', [0, Ys, 0], null, 'First-year blossoms: pinch every one off');
      SB_ROWS.forEach((z, r) => SB_MOM.forEach((x, i) => {
        strawPlant(K, moms, [x, 0, z], 0.85, M, { yaw: i * 50 + r * 20, n: 5 });
        [0, 1].forEach((f) => strawFlower(K, momFl, [x + (f ? 0.05 : -0.04), 0.075, z + (f ? 0.03 : -0.05)], 1, M));
      }));
      // runners + daughters (summer of year 1)
      const runs = K.part('runners', [0, Ys, 0], null, 'Runners rooting daughter plants into an 18–24″ wide row');
      SB_ROWS.forEach((z, r) => SB_MOM.forEach((x, i) => {
        [[0.2, 0.12], [-0.18, -0.16], [0.08, -0.2], [-0.1, 0.18]].forEach(([dx, dz], k) => {
          if (r === 1 && k > 1) return;
          const d = [x + dx, 0.0, z + dz];
          K.tube(runs, [[x, 0.01, z], [x + dx * 0.35, 0.03, z + dz * 0.35], [x + dx * 0.75, 0.02, z + dz * 0.75], d], 0.0016, M.runner);
          strawPlant(K, runs, d, 0.45, M, { yaw: k * 90 + i * 30, n: 3 });
        });
      }));
      // winter straw over the rows
      const straw = K.bumpy(0xd9c27e, TB.tex.speckle(), 0.03, { roughness: 1 });
      const strawBit = K.std(0xe6d08e, { roughness: 1 });
      const win = K.part('winter', [0, Ys, 0], null, 'Winter: 3–5″ loose straw once soil holds near 40°F');
      SB_ROWS.forEach((z) => {
        K.box(win, [2.48, 0.1, 0.62], straw, [0, 0.05, z], null, 0.04);
        K.rep(40, (i) => K.box(win, [0.1, 0.004, 0.004], strawBit, [Math.sin(i * 12.7) * 1.2, 0.101, z + Math.cos(i * 7.3) * 0.28], [0, (i * 53) % 180, 0], 0));
      });
      // year-2 matted row
      const mat = K.part('matted', [0, Ys, 0], null, 'Matted row, year 2: plants 6–9″ apart, row 18–24″ wide');
      const MAT = [];
      SB_ROWS.forEach((z, r) => {
        for (let i = 0; i < (r ? 7 : 11); i++) for (let j = 0; j < 3; j++) {
          const x = -1.05 + i * (r ? 0.35 : 0.21) + (j % 2) * 0.08;
          const zz = z - 0.2 + j * 0.2 + Math.sin(i * 3.1 + j) * 0.03;
          MAT.push([x, zz, r]);
          strawPlant(K, mat, [x, 0, zz], 0.75 + ((i + j) % 3) * 0.08, M, { yaw: i * 47 + j * 83, n: r ? 4 : 5 });
        }
      });
      const fl = K.part('flowers', [0, Ys, 0], null, 'Spring bloom (frost below 30°F kills open blossoms)');
      const bs = K.part('berries', [0, Ys, 0], null, 'Fruit 4–6 weeks after bloom: pick when fully red');
      MAT.forEach(([x, z, r], k) => {
        if (r && k % 2) return;
        strawFlower(K, fl, [x + 0.04, 0.07, z + 0.03], 1, M);
        if (k % 2) strawFlower(K, fl, [x - 0.03, 0.065, z - 0.04], 1, M);
        const col = [M.red, M.red, M.pink, M.white][k % 4];
        berry(K, bs, [x + 0.06, 0.03, z + 0.05], 1.15, col, M, 20);
        if (k % 3 === 0) berry(K, bs, [x - 0.05, 0.03, z - 0.04], 1.0, M.red, M, -15);
      });
      // straw mulch under the plants and in the aisles
      const sm = K.part('straw', [0, Y, 0], null, 'Straw raked into the aisles and under the fruit');
      K.box(sm, [2.5, 0.02, 0.5], straw, [0, 0.012, (SB_ROWS[0] + SB_ROWS[1]) / 2], null, 0.008);
      K.box(sm, [2.5, 0.02, 0.18], straw, [0, 0.012, 0.66], null, 0.008);
      K.rep(70, (i) => K.box(sm, [0.09, 0.004, 0.004], strawBit, [Math.sin(i * 12.7) * 1.2, 0.024, -0.29 + Math.cos(i * 7.3) * 0.24], [0, (i * 53) % 180, 0], 0));
      SB_ROWS.forEach((z) => K.box(sm, [2.48, 0.006, 0.55], straw, [0, 0.022, z], null, 0));
      // bird netting on hoops
      const net = K.part('net', [0, Ys, SB_ROWS[0]], null, 'Bird netting on hoops (¾″ mesh), edges pinned down');
      const netM = K.std(0x1c1c1c, { roughness: 0.8, wireframe: true, transparent: true, opacity: 0.55 });
      for (let k = 0; k < 4; k++) K.tor(net, [0.36, 0.004, 180], 'steel', [-1.1 + k * 0.733, 0, 0], [0, 90, 0]);
      K.cyl(net, [0.37, 0.37, 2.3, 28, true], netM, [0, 0, 0], [0, 0, 90]);
      // renovation: mower, mowed crowns, tilled edges, fertilizer, regrowth
      const mw = K.part('mower', [0.55, Y, 0.25], null, 'Rotary mower set high: leaves cut 1″ above the crowns');
      const deck = K.group(mw, [0, 0.12, 0], [0, 90, 0]);
      K.cyl(deck, [0.26, 0.27, 0.11, 32], K.std(0xc8322a, { roughness: 0.4, metalness: 0.2 }), [0, 0.0, 0]);
      K.cyl(deck, [0.12, 0.12, 0.12, 20], K.std(0x222326, { roughness: 0.5 }), [0, 0.1, -0.03]);
      [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([x, z]) => K.cyl(deck, [0.075, 0.075, 0.04, 20], 'rubber', [x, -0.04, z], [0, 0, 90]));
      K.bar(deck, [-0.12, 0.08, -0.25], [-0.2, 0.9, -0.85], 0.012, 'black');
      K.bar(deck, [0.12, 0.08, -0.25], [0.2, 0.9, -0.85], 0.012, 'black');
      K.bar(deck, [-0.2, 0.9, -0.85], [0.2, 0.9, -0.85], 0.014, 'gripBlack');
      const stub = K.std(0x6f8f3a, { roughness: 0.8 });
      const mE = K.part('mowedEdge', [0, Ys, 0], null, 'Old plants at the row edges (till these out)');
      const mM = K.part('mowedMid', [0, Ys, 0], null, 'Mowed crowns: leaf stubs 1″ high');
      MAT.forEach(([x, z, r]) => {
        const edge = Math.abs(z - SB_ROWS[r]) > 0.12;
        const g = K.group(edge ? mE : mM, [x, 0, z]);
        K.cyl(g, [0.012, 0.015, 0.02, 8], M.crown, [0, 0.008, 0]);
        K.rep(5, (q) => K.bar(g, [0, 0.012, 0], [Math.sin(q * 1.3) * 0.012, 0.035, Math.cos(q * 1.3) * 0.012], 0.0016, stub));
      });
      const till = K.part('tilled', [0, Ys + 0.004, 0], null, 'Edges tilled or hoed: 12″ strip of the youngest plants left');
      SB_ROWS.forEach((z) => [-1, 1].forEach((sd) => K.box(till, [2.48, 0.012, 0.17], soilMat(K, 0x6a4c36), [0, 0, z + sd * 0.2], null, 0.005)));
      const fert = K.part('fert', [-1.0, Y, 0.78], null, 'Balanced fertilizer: about 5 lb 10-10-10 per 100 ft of row');
      sack(K, fert, [0, 0, 0], [0.26, 0.34, 0.1], 0x2b6db3, 20);
      K.lathe(fert, [[0, 0], [0.04, 0], [0.045, 0.06], [0.04, 0.06], [0.036, 0.004], [0, 0.004]], K.std(0xf2c230, { roughness: 0.4 }), [0.24, 0, 0.12]);
      specks(K, K.group(fert, [1.0, Ys - Y + 0.008, SB_ROWS[0] - 0.78]), 70, 0, K.std(0x7fa6c8, { roughness: 0.6 }), 0.004, 1.2, 0.08);
      const rg = K.part('regrow', [0, Ys, 0], null, 'Fresh leaves 3–4 weeks later; runners refill the row by fall');
      MAT.forEach(([x, z, r], k) => {
        if (Math.abs(z - SB_ROWS[r]) > 0.12) return;
        strawPlant(K, rg, [x, 0, z], 0.6, M, { yaw: k * 61, n: 4 });
      });
      // day-neutral hill system: double row, 12″ apart, runners snipped
      const hills = K.part('hills', [0, Ys, 0], null, 'Hill system: plants 12″ apart in a double row');
      const hFl = K.part('hillFl', [0, Ys, 0], null, 'Blossoms for the first 6 weeks: pinch them');
      const hRun = K.part('hillRun', [0, Ys, 0], null, 'Runners: snip every one');
      const hBer = K.part('hillBerries', [0, Ys, 0], null, 'Berries from midsummer to frost');
      for (let i = 0; i < 8; i++) [0.1, 0.4].forEach((z, j) => {
        const x = -1.05 + i * 0.3 + j * 0.15;
        if (x > 1.15) return;
        strawPlant(K, hills, [x, 0, z], 0.9, M, { yaw: i * 53 + j * 31, n: 6 });
        strawFlower(K, hFl, [x + 0.04, 0.08, z + 0.03], 1, M);
        strawFlower(K, hFl, [x - 0.03, 0.075, z - 0.04], 1, M);
        const dx = (i % 2 ? 1 : -1) * 0.13;
        K.tube(hRun, [[x, 0.01, z], [x + dx * 0.4, 0.035, z + 0.03], [x + dx * 0.8, 0.02, z + 0.05], [x + dx, 0.0, z + 0.06]], 0.0016, M.runner);
        strawPlant(K, hRun, [x + dx, 0, z + 0.06], 0.35, M, { n: 3 });
        berry(K, hBer, [x + 0.07, 0.03, z + 0.05], 1.15, M.red, M, 20);
        berry(K, hBer, [x - 0.06, 0.03, z - 0.05], 1.0, i % 2 ? M.red : M.pink, M, -15);
      });
      const drip = K.part('drip', [0, Ys + 0.006, 0], null, 'Drip tape or soaker hose under the mulch');
      [0.25, -0.82].forEach((z) => K.cyl(drip, [0.007, 0.007, 2.5, 10], 'black', [0, 0, z], [0, 0, 90]));
      K.tube(drip, [[1.25, 0, 0.25], [1.4, -0.03, 0.4], [1.6, -Ys, 0.7], [1.9, -Ys, 0.8]], 0.007, 'black');
    }
  );

  /* @@MORE_MODELS@@ */

  /* =====================================================================
     Guides
     ===================================================================== */
  /* @@GUIDES@@ */
})();
