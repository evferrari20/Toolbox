/* TIERS · Complexity tiers (Starter · Classic · Showpiece · Luxury) for the paver patio, raised garden bed,
   path lights and backyard court builds. Classic = the original guide in backyard.js. Scenes in meters (unit: 1). */
(function () {
  const AO = TB.AO;
  const DEG = Math.PI / 180;

  /* ---------- shared helpers ---------- */
  const rng = (seed) => {
    let x = seed || 7;
    return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646;
  };
  const glow = (K, c, i) => K.std(c || 0xfff1cc, { emissive: c || 0xffc870, emissiveIntensity: i == null ? 1.6 : i });
  const blackMetal = (K) => K.std(0x1d1f22, { metalness: 0.6, roughness: 0.45 });
  const cedarMat = (K, r) => K.pbr('wood_planks', r || [2, 0.3], { color: 0xd8a27a }, 'wood');
  const paintMat = (K, c) => K.std(c || 0xff7a1a, { emissive: c || 0xff5a00, emissiveIntensity: 0.3 });
  // Painted rectangle outline on the ground.
  function paintRect(K, parent, x0, z0, x1, z1, color) {
    const m = paintMat(K, color);
    const w = 0.03;
    K.box(parent, [x1 - x0, 0.004, w], m, [(x0 + x1) / 2, 0.012, z0], null, 0);
    K.box(parent, [x1 - x0, 0.004, w], m, [(x0 + x1) / 2, 0.012, z1], null, 0);
    K.box(parent, [w, 0.004, z1 - z0], m, [x0, 0.012, (z0 + z1) / 2], null, 0);
    K.box(parent, [w, 0.004, z1 - z0], m, [x1, 0.012, (z0 + z1) / 2], null, 0);
  }
  // Corner stakes with mason line at height h.
  function stakeLine(K, parent, x0, z0, x1, z1, h) {
    const o = 0.25;
    [[x0 - o, z0 - o], [x1 + o, z0 - o], [x1 + o, z1 + o], [x0 - o, z1 + o]].forEach(([x, z]) => K.box(parent, [0.035, h + 0.1, 0.035], 'woodLight', [x, (h + 0.1) / 2, z]));
    K.bar(parent, [x0 - o, h, z0], [x1 + o, h, z0], 0.003, 'yellow');
    K.bar(parent, [x0 - o, h, z1], [x1 + o, h, z1], 0.003, 'yellow');
    K.bar(parent, [x0, h, z0 - o], [x0, h, z1 + o], 0.003, 'yellow');
    K.bar(parent, [x1, h, z0 - o], [x1, h, z1 + o], 0.003, 'yellow');
  }
  // Row of blocks from a=[x,z] to b=[x,z]; local block length bl, height h, depth d, base y.
  function blockRow(K, parent, a, b, y, h, d, mat, bl, offset) {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const L = Math.hypot(dx, dz);
    const g = K.group(parent, [a[0], y, a[1]], [0, Math.atan2(-dz, dx) / DEG, 0]);
    bl = bl || 0.45;
    let x = offset ? -bl / 2 : 0;
    while (x < L - 0.01) {
      const x0 = Math.max(0, x);
      const x1 = Math.min(L, x + bl);
      if (x1 - x0 > 0.04) K.box(g, [x1 - x0 - 0.006, h - 0.004, d], mat, [(x0 + x1) / 2, h / 2, 0], null, 0.008);
      x += bl;
    }
    return g;
  }
  // Irregular flagstone (top at y = top).
  function flag(K, parent, cx, cz, r, seed, mat, h, top) {
    const rr = rng(seed);
    const pts = [];
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rr() * 0.4;
      const k = r * (0.78 + rr() * 0.3);
      pts.push([cx + Math.cos(a) * k * 1.1, cz + Math.sin(a) * k * 0.9]);
    }
    return K.ext(parent, pts, h, mat, [0, top, 0], [90, 0, 0], 0.008);
  }
  // Simple procedural tree (trunk + clustered canopy).
  function tree(K, parent, x, z, h, seed) {
    const g = K.group(parent, [x, 0, z]);
    K.cyl(g, [0.09, 0.14, h * 0.55, 12], 'bark', [0, h * 0.275, 0]);
    K.bar(g, [0, h * 0.45, 0], [0.4, h * 0.7, 0.1], 0.05, 'bark');
    K.bar(g, [0, h * 0.5, 0], [-0.35, h * 0.72, -0.15], 0.045, 'bark');
    const leaf = K.std(0x4f7d3a, { roughness: 0.9 });
    const leaf2 = K.std(0x62914a, { roughness: 0.9 });
    const rr = rng(seed || 3);
    for (let i = 0; i < 9; i++) {
      const a = rr() * Math.PI * 2;
      const rad = rr() * 0.7;
      K.sph(g, 0.55 + rr() * 0.3, i % 2 ? leaf : leaf2, [Math.cos(a) * rad, h * 0.72 + rr() * h * 0.22, Math.sin(a) * rad], [1, 0.8, 1]);
    }
    return g;
  }
  // Procedural vegetable plants: 'leafy' (lettuce/chard rosette), 'tomato' (staked, with fruit), 'herb' (mounded).
  function veg(K, parent, x, y, z, kind, s, seed) {
    s = s || 1;
    const g = K.group(parent, [x, y, z], [0, ((seed || 1) * 47) % 360, 0]);
    const rr = rng(seed || 5);
    const lg = K.std(0x2c5a1f, { roughness: 0.9 });
    const lg2 = K.std(0x3d7329, { roughness: 0.9 });
    if (kind === 'tomato') {
      K.cyl(g, [0.008, 0.008, 0.9 * s, 6], 'woodLight', [0.05, 0.45 * s, 0]);
      K.cyl(g, [0.012, 0.015, 0.75 * s, 6], K.std(0x3f6b2a), [0, 0.37 * s, 0]);
      for (let i = 0; i < 22; i++) {
        const a = rr() * Math.PI * 2;
        const h = 0.12 + rr() * 0.62;
        const r = 0.06 + rr() * 0.1;
        K.sph(g, (0.03 + rr() * 0.02) * s, i % 2 ? lg : lg2, [Math.cos(a) * r * s, h * s, Math.sin(a) * r * s], [1.4, 0.6, 1]);
      }
      for (let i = 0; i < 5; i++) {
        const a = rr() * Math.PI * 2;
        K.sph(g, 0.022 * s, i % 2 ? 'red' : K.std(0xe0702a, { roughness: 0.4 }), [Math.cos(a) * 0.07 * s, (0.25 + rr() * 0.35) * s, Math.sin(a) * 0.07 * s]);
      }
    } else if (kind === 'herb') {
      for (let i = 0; i < 14; i++) {
        const a = rr() * Math.PI * 2;
        const r = rr() * 0.07;
        K.sph(g, (0.025 + rr() * 0.02) * s, i % 3 ? lg2 : lg, [Math.cos(a) * r * s, (0.03 + rr() * 0.1) * s, Math.sin(a) * r * s]);
      }
    } else {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const l = K.group(g, [Math.cos(a) * 0.04 * s, 0.04 * s, Math.sin(a) * 0.04 * s], [0, -a / DEG, 35]);
        K.sph(l, 0.07 * s, i % 2 ? lg : lg2, [0.05 * s, 0, 0], [1.1, 0.25, 0.6]);
      }
      K.sph(g, 0.045 * s, lg2, [0, 0.05 * s, 0], [1, 0.8, 1]);
    }
    return g;
  }
  const chairs = (K, parent, pts) =>
    pts.forEach(([x, y, z, ry]) => K.glb(parent, 'outdoor_table_chair_set_01', { node: 'outdoor_table_chair_set_01_chair_01', height: 0.86 }, [x, y, z], [0, ry, 0]) || K.box(parent, [0.5, 0.45, 0.5], 'wood', [x, y + 0.22, z]));
  const pick = (g, ids) => ids.map((id) => g.addons.find((a) => a.id === id)).filter(Boolean);
  const ao = (o) => o; // add-on literal (for readability)

  /* =====================================================================================
     PAVER PATIO
     ===================================================================================== */

  // Starter: pea-gravel patio with steel edging and a flagstone stepping-stone entry.
  TB.model(
    'patioGravel',
    {
      cam: [4.4, 3.2, 4.8], at: [0, 0.1, 0.3], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 10 },
      tex: ['gravel_floor', 'forrest_ground_01', 'granite_tile', 'wood_planks'], assets: ['outdoor_table_chair_set_01', 'potted_plant_01', 'potted_plant_02', 'planter_box_01'],
      hidden: ['layout', 'dig', 'fabric', 'base', 'edging', 'gravel', 'pads', 'furniture', 'aoString', 'aoSolar', 'aoUmbrella', 'aoSpeaker'],
    },
    (K) => {
      const W = 3.6;
      const D = 3.0;
      const lay = K.part('layout', [0, 0, 0], null, 'Stakes, string & marking paint (12 × 10 ft)');
      stakeLine(K, lay, -W / 2, -D / 2, W / 2, D / 2, 0.25);
      paintRect(K, lay, -W / 2, -D / 2, W / 2, D / 2);
      const dig = K.part('dig', [0, 0.006, 0], null, 'Sod stripped, dug 4″ deep');
      K.box(dig, [W + 0.12, 0.012, D + 0.12], K.pbr('forrest_ground_01', [3, 3], {}, 'dirt'));
      const fab = K.part('fabric', [0, 0.016, 0], null, 'Landscape fabric, seams lapped 6″');
      const fm = K.bumpy(0x2b2b2b, TB.tex.weave(), 0.01, { roughness: 1 });
      K.box(fab, [W, 0.004, D], fm);
      K.rep(3, (i) => K.box(fab, [W, 0.006, 0.006], K.std(0x444444), [0, 0.003, -D / 2 + (i + 1) * (D / 4)], null, 0));
      K.rep(10, (i) => K.box(fab, [0.03, 0.006, 0.008], 'steel', [-W / 2 + 0.15 + (i % 5) * 0.82, 0.004, i < 5 ? -D / 2 + 0.1 : D / 2 - 0.1], null, 0));
      const base = K.part('base', [0, 0.04, 0], null, '2″ compacted ¾″ crushed stone');
      K.box(base, [W - 0.01, 0.04, D - 0.01], K.pbr('gravel_floor', [3, 3], { color: 0x9a958c }, 'stone'), [0, 0, 0], null, 0);
      const edge = K.part('edging', [0, 0, 0], null, 'Steel landscape edging (top ½″ above gravel)');
      const steel = K.std(0x3a3a3a, { metalness: 0.8, roughness: 0.5 });
      K.box(edge, [W + 0.01, 0.11, 0.005], steel, [0, 0.055, D / 2], null, 0);
      K.box(edge, [W + 0.01, 0.11, 0.005], steel, [0, 0.055, -D / 2], null, 0);
      K.box(edge, [0.005, 0.11, D], steel, [W / 2, 0.055, 0], null, 0);
      K.box(edge, [0.005, 0.11, D], steel, [-W / 2, 0.055, 0], null, 0);
      K.rep(8, (i) => K.box(edge, [0.04, 0.03, 0.012], steel, [-W / 2 + 0.25 + i * 0.45, 0.095, D / 2 + 0.008], null, 0));
      const gravel = K.part('gravel', [0, 0.075, 0], null, '2″ pea gravel, raked smooth');
      K.box(gravel, [W - 0.01, 0.03, D - 0.01], K.pbr('gravel_floor', [4, 4], { color: 0xdcccb4 }, 'stone'), [0, 0, 0], null, 0);
      const rr = rng(21);
      const pebble = K.std(0xcbb79a, { roughness: 0.8 });
      for (let i = 0; i < 30; i++) K.sph(gravel, 0.01 + rr() * 0.008, pebble, [(rr() - 0.5) * (W - 0.1), 0.017, (rr() - 0.5) * (D - 0.1)], [1.3, 0.6, 1]);
      const pads = K.part('pads', [0, 0, 0], null, 'Flagstone stepping stones (24″ on center)');
      const fm2 = K.pbr('granite_tile', [0.5, 0.5], { color: 0xc9b597, roughness: 0.85 }, 'stone');
      [[0.25, 1.95, 1], [-0.1, 2.6, 2], [0.2, 3.25, 3], [-0.05, 3.9, 4]].forEach(([x, z, s]) => flag(K, pads, x, z, 0.27, s * 13, fm2, 0.045, 0.04));
      [[-0.9, 0.9, 5], [0.95, -0.85, 6]].forEach(([x, z, s]) => flag(K, pads, x, z, 0.3, s * 17, fm2, 0.03, 0.105));
      const fur = K.part('furniture', [0, 0.09, 0], null, 'Bistro set & planters');
      K.glb(fur, 'outdoor_table_chair_set_01', { height: 0.86 }, [0, 0, -0.2]) || K.box(fur, [0.9, 0.75, 0.9], 'wood', [0, 0.37, -0.2]);
      K.glb(fur, 'potted_plant_01', { height: 1.1 }, [1.45, 0, -1.15]);
      K.glb(fur, 'potted_plant_02', { height: 0.7 }, [-1.45, 0, -1.15]);
      K.glb(fur, 'planter_box_01', { height: 0.42 }, [-1.3, 0, 1.0], [0, 90, 0]);
      // add-ons
      AO.stringLights(K, 'aoString', [[-2.0, -1.7], [2.0, -1.7], [2.0, 1.7], [-2.0, 1.7]], 2.6, true);
      const sl = [];
      for (let i = 0; i < 4; i++) sl.push([-W / 2 + 0.45 + i * 0.9, D / 2 + 0.25], [-W / 2 + 0.45 + i * 0.9, -D / 2 - 0.25]);
      AO.stakeLights(K, 'aoSolar', sl, 'Solar edge lights');
      AO.umbrella(K, 'aoUmbrella', [1.25, 0.09, -1.0], 'Offset umbrella');
      AO.speaker(K, 'aoSpeaker', [-1.5, 0.09, 0.3]);
    }
  );

  // Showpiece: two-level paver patio with a seat wall, steps, soldier border and a circle-kit inlay.
  TB.model(
    'patioTerrace',
    {
      cam: [6.4, 4.6, 7.2], at: [0, 0.3, -0.3], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 14, radius: 12 },
      tex: ['interlocking_concrete_pavers', 'gravel_floor', 'forrest_ground_01', 'stacked_stone_wall', 'brushed_concrete', 'wood_planks'],
      assets: ['outdoor_table_chair_set_01', 'potted_plant_01', 'potted_plant_02', 'planter_box_02', 'shrub_02', 'grass_medium_01'],
      hidden: ['layout', 'excavate', 'base', 'wall1', 'wall2', 'fill', 'steps', 'stepLights', 'seatWall', 'seatCap', 'capLights', 'wallCap', 'sand', 'pavers', 'circle', 'border', 'upper', 'edge', 'jsand', 'furniture', 'aoString', 'aoUmbrella', 'aoHeater', 'aoRug', 'aoSpeaker'],
    },
    (K) => {
      // lower level x[-2.5,2.5] z[-0.2,2.6]; upper terrace x[-2.5,2.5] z[-3.4,-0.2] at +0.46
      const X = 2.5;
      const ZB = -3.4;
      const ZF = -0.2;
      const ZL = 2.6;
      const UP = 0.46;
      const block = K.pbr('stacked_stone_wall', [0.5, 0.3], { roughness: 1, color: 0xcfc6b8 }, 'stone');
      const capMat = K.pbr('brushed_concrete', [0.6, 0.3], { color: 0xbfb8ac }, 'concrete');
      const lay = K.part('layout', [0, 0, 0], null, 'Layout: lower patio, terrace, steps');
      paintRect(K, lay, -X, ZF, X, ZL);
      paintRect(K, lay, -X, ZB, X, ZF, 0x2f6fde);
      K.tor(lay, [1.1, 0.012, 360], paintMat(K), [0, 0.014, 1.25], [90, 0, 0]);
      const ex = K.part('excavate', [0, 0.006, 0], null, 'Excavated & compacted subgrade');
      K.box(ex, [2 * X + 0.4, 0.012, ZL - ZB + 0.4], K.pbr('forrest_ground_01', [5, 5], {}, 'dirt'), [0, 0, (ZL + ZB) / 2]);
      const base = K.part('base', [0, 0.05, 0], null, 'Compacted gravel base (6″ under walls)');
      K.box(base, [2 * X + 0.2, 0.1, ZL - ZB + 0.2], K.pbr('gravel_floor', [5, 5], {}, 'stone'), [0, 0, (ZL + ZB) / 2], null, 0);
      // perimeter retaining wall around the terrace (gap for steps)
      const runs = (y, h, off) => {
        const g = [];
        g.push([[-X + 0.15, ZB + 0.15], [X - 0.15, ZB + 0.15]]);
        g.push([[-X + 0.15, ZB + 0.15], [-X + 0.15, ZF - 0.15]]);
        g.push([[X - 0.15, ZB + 0.15], [X - 0.15, ZF - 0.15]]);
        g.push([[-X, ZF - 0.15], [-0.95, ZF - 0.15]]);
        g.push([[0.95, ZF - 0.15], [X, ZF - 0.15]]);
        return g;
      };
      ['wall1', 'wall2'].forEach((nm, c) => {
        const w = K.part(nm, [0, 0.1 + c * 0.18, 0], null, c ? 'Second course + compacted fill' : 'First wall course (leveled on the base)');
        runs().forEach(([a, b]) => blockRow(K, w, a, b, 0, 0.18, 0.3, block, 0.45, c % 2));
      });
      const fill = K.part('fill', [0, 0.2, (ZB + ZF) / 2], null, 'Gravel fill, compacted in 4″ lifts');
      K.box(fill, [2 * X - 0.6, 0.2, ZF - ZB - 0.6], K.pbr('gravel_floor', [3, 3], {}, 'stone'), [0, 0, 0], null, 0);
      const wc = K.part('wallCap', [0, 0.46, 0], null, 'Wall coping caps (glued)');
      runs().forEach(([a, b]) => blockRow(K, wc, a, b, 0, 0.05, 0.36, capMat, 0.6, 0));
      // steps (block risers with paver treads) in the opening
      const pvMat = K.pbr('interlocking_concrete_pavers', [1, 0.4], {}, 'concrete');
      const st = K.part('steps', [0, 0, 0], null, 'Block steps with paver treads (7″ risers)');
      blockRow(K, st, [-0.95, ZF + 0.18], [0.95, ZF + 0.18], 0.1, 0.18, 0.36, block, 0.45, 0);
      K.box(st, [1.95, 0.05, 0.42], capMat, [0, 0.305, ZF + 0.19], null, 0.006);
      blockRow(K, st, [-0.95, ZF - 0.15], [0.95, ZF - 0.15], 0.1, 0.32, 0.3, block, 0.45, 1);
      K.box(st, [1.9, 0.04, 0.3], pvMat, [0, 0.44, ZF - 0.15], null, 0.004);
      const sL = K.part('stepLights', [0, 0, 0], null, 'Riser lights (low voltage)');
      const lm = glow(K, 0xfff1cc, 1.8);
      [-0.55, 0.55].forEach((x) => {
        K.box(sL, [0.12, 0.025, 0.012], lm, [x, 0.22, ZF + 0.37], null, 0);
        K.box(sL, [0.12, 0.025, 0.012], lm, [x, 0.38, ZF + 0.005], null, 0);
      });
      // seat wall on the back of the terrace
      const sw = K.part('seatWall', [0, UP, 0], null, 'Seat wall (2 courses, 18″ seat)');
      [0, 1].forEach((c) => {
        blockRow(K, sw, [-X + 0.3, ZB + 0.45], [X - 0.3, ZB + 0.45], c * 0.19, 0.19, 0.3, block, 0.45, c);
        blockRow(K, sw, [-X + 0.45, ZB + 0.6], [-X + 0.45, ZB + 1.6], c * 0.19, 0.19, 0.3, block, 0.45, c);
        blockRow(K, sw, [X - 0.45, ZB + 0.6], [X - 0.45, ZB + 1.6], c * 0.19, 0.19, 0.3, block, 0.45, c);
      });
      const sc = K.part('seatCap', [0, UP + 0.38, 0], null, 'Seat-wall cap, 14″ deep');
      K.box(sc, [2 * X - 0.5, 0.06, 0.4], capMat, [0, 0.03, ZB + 0.47], null, 0.01);
      K.box(sc, [0.4, 0.06, 1.15], capMat, [-X + 0.45, 0.03, ZB + 1.1], null, 0.01);
      K.box(sc, [0.4, 0.06, 1.15], capMat, [X - 0.45, 0.03, ZB + 1.1], null, 0.01);
      const cl = K.part('capLights', [0, UP + 0.37, 0], null, 'Under-cap LED lights');
      for (let i = 0; i < 6; i++) K.box(cl, [0.14, 0.012, 0.02], lm, [-1.75 + i * 0.7, 0, ZB + 0.66], null, 0);
      const plc = new THREE.PointLight(0xffd59a, 0.8, 2.5, 2);
      plc.position.set(0, -0.1, ZB + 0.8);
      cl.add(plc);
      // lower field: sand, pavers, circle kit, soldier border
      const sand = K.part('sand', [0, 0.112, 0], null, '1″ screeded bedding sand (both levels)');
      K.box(sand, [2 * X, 0.024, ZL - ZF], K.std(0xcdb48a, { roughness: 1 }), [0, 0, (ZL + ZF) / 2 + 0.1], null, 0);
      K.box(sand, [2 * X - 0.6, 0.024, ZF - ZB - 0.6], K.std(0xcdb48a, { roughness: 1 }), [0, 0.3, (ZB + ZF) / 2], null, 0);
      const pv = K.part('pavers', [0, 0.124, 0], null, 'Lower field pavers (herringbone)');
      K.box(pv, [2 * X - 0.4, 0.06, ZL - ZF - 0.2], K.pbr('interlocking_concrete_pavers', [4, 2.4], {}, 'concrete'), [0, 0.03, (ZL + ZF) / 2 + 0.1], null, 0.004);
      const circ = K.part('circle', [0, 0.186, 1.25], null, 'Circle-kit inlay (8 ft)');
      const cA = K.std(0xb59a78, { roughness: 0.85 });
      const cB = K.std(0x6d655c, { roughness: 0.85 });
      K.cyl(circ, [0.12, 0.12, 0.004, 24], cB, [0, 0.002, 0]);
      for (let r = 0; r < 5; r++) {
        const r0 = 0.13 + r * 0.19;
        const r1 = r0 + 0.18;
        const n = Math.round((2 * Math.PI * (r0 + 0.09)) / 0.2);
        for (let i = 0; i < n; i++) {
          const a0 = (i / n) * Math.PI * 2 + 0.006;
          const a1 = ((i + 1) / n) * Math.PI * 2 - 0.006;
          const pts = [[Math.cos(a0) * r0, Math.sin(a0) * r0], [Math.cos(a1) * r0, Math.sin(a1) * r0], [Math.cos(a1) * r1, Math.sin(a1) * r1], [Math.cos(a0) * r1, Math.sin(a0) * r1]];
          K.ext(circ, pts, 0.006, r === 4 ? cB : cA, [0, 0.004, 0], [90, 0, 0], 0);
        }
      }
      const bord = K.part('border', [0, 0, 0], null, 'Charcoal soldier-course border');
      const bm = K.std(0x4d4a46, { roughness: 0.85 });
      const soldier = (a, b, y) => {
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const n = Math.round(L / 0.1);
        const g = K.group(bord, [a[0], y, a[1]], [0, Math.atan2(-(b[1] - a[1]), b[0] - a[0]) / DEG, 0]);
        for (let i = 0; i < n; i++) K.box(g, [0.096, 0.062, 0.2], bm, [(i + 0.5) * (L / n), 0.031, 0], null, 0.004);
      };
      soldier([-X + 0.1, ZL - 0.1], [X - 0.1, ZL - 0.1], 0.122);
      soldier([-X + 0.1, ZF + 0.42], [-X + 0.1, ZL - 0.2], 0.122);
      soldier([X - 0.1, ZF + 0.42], [X - 0.1, ZL - 0.2], 0.122);
      soldier([-X + 0.1, ZF + 0.1], [-1.0, ZF + 0.1], 0.122);
      soldier([1.0, ZF + 0.1], [X - 0.1, ZF + 0.1], 0.122);
      const up = K.part('upper', [0, UP - 0.06, (ZB + ZF) / 2], null, 'Terrace pavers (running bond)');
      K.box(up, [2 * X - 0.6, 0.06, ZF - ZB - 0.6], K.pbr('interlocking_concrete_pavers', [3.5, 2.4], { color: 0xd9cdb8 }, 'concrete'), [0, 0.03, 0], null, 0.004);
      const edge = K.part('edge', [0, 0.13, 0], null, 'Edge restraint, spiked every 12″');
      K.box(edge, [2 * X + 0.04, 0.05, 0.03], 'black', [0, 0, ZL + 0.015]);
      K.box(edge, [0.03, 0.05, ZL - ZF], 'black', [X + 0.015, 0, (ZL + ZF) / 2]);
      K.box(edge, [0.03, 0.05, ZL - ZF], 'black', [-X - 0.015, 0, (ZL + ZF) / 2]);
      const js = K.part('jsand', [0, 0.187, 0], null, 'Polymeric joint sand');
      K.box(js, [2 * X - 0.2, 0.002, ZL - ZF - 0.1], K.std(0xe2d6b8, { transparent: true, opacity: 0.3, roughness: 1 }), [0, 0, (ZL + ZF) / 2 + 0.05], null, 0);
      const fur = K.part('furniture', [0, 0, 0], null, 'Dining set, lounge chairs & planting');
      K.glb(fur, 'outdoor_table_chair_set_01', { height: 0.86 }, [0, UP, -1.75]) || K.box(fur, [0.9, 0.75, 0.9], 'wood', [0, UP + 0.37, -1.75]);
      chairs(K, fur, [[-1.1, 0.186, 1.7, 150], [1.1, 0.186, 1.7, -150]]);
      K.glb(fur, 'planter_box_02', { height: 0.45 }, [-2.0, UP, -0.75], [0, 0, 0]);
      K.glb(fur, 'potted_plant_01', { height: 1.1 }, [2.0, UP, -0.75]);
      K.glb(fur, 'potted_plant_02', { height: 0.7 }, [2.1, 0.186, 2.2]);
      K.glb(fur, 'shrub_02', { node: 'shrub_02_b', height: 1.3 }, [-1.6, 0, -4.0]);
      K.glb(fur, 'shrub_02', { node: 'shrub_02_c', height: 1.1 }, [1.8, 0, -3.95], [0, 40, 0]);
      K.glb(fur, 'grass_medium_01', { node: 'grass_medium_01_tall_b_LOD0', height: 0.45 }, [-2.9, 0, 1.2]);
      K.glb(fur, 'grass_medium_01', { node: 'grass_medium_01_large_a_LOD0', height: 0.4 }, [2.9, 0, 0.6]);
      // add-ons
      AO.stringLights(K, 'aoString', [[-2.8, -3.6], [2.8, -3.6], [2.8, 2.8], [-2.8, 2.8]], 2.9, true);
      AO.umbrella(K, 'aoUmbrella', [1.6, UP, -2.3], 'Offset umbrella');
      AO.heater(K, 'aoHeater', [-1.7, UP, -2.4]);
      AO.rug(K, 'aoRug', [2.0, 2.0], [0, 0.188, 1.25]);
      AO.speaker(K, 'aoSpeaker', [-2.0, 0.186, 2.2]);
    }
  );

  // Luxury: large-format porcelain, louvered pergola over dining, built-in linear gas fire wall.
  TB.model(
    'patioLuxe',
    {
      cam: [7.4, 4.8, 7.6], at: [0, 0.8, -0.3], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 14, radius: 13 },
      tex: ['concrete_floor_01', 'gravel_floor', 'forrest_ground_01', 'stacked_stone_wall', 'brushed_concrete', 'wood_planks'],
      assets: ['outdoor_table_chair_set_01', 'painted_wooden_bench', 'potted_plant_01', 'planter_box_02', 'shrub_02', 'grass_medium_01'],
      hidden: ['permit', 'layout', 'excavate', 'footings', 'gasLine', 'base', 'sand', 'porcelain', 'edge', 'posts', 'beams', 'louvers', 'pergolaLights', 'fireBox', 'fireClad', 'burner', 'fireGlass', 'gasFlame', 'furniture', 'aoShade', 'aoHeaterIR', 'aoSpeaker', 'aoRug', 'aoPath'],
    },
    (K) => {
      const X = 3.3;
      const Z0 = -2.7;
      const Z1 = 2.7;
      const permit = K.part('permit', [3.9, 0, 3.1], null, 'Permits (pergola footings + gas)');
      K.box(permit, [0.04, 0.6, 0.04], 'woodLight', [0, 0.3, 0]);
      K.box(permit, [0.3, 0.22, 0.01], 'white', [0, 0.6, 0.03]);
      const lay = K.part('layout', [0, 0, 0], null, 'Layout: 22 × 18 ft patio, pergola posts, fire wall');
      paintRect(K, lay, -X, Z0, X, Z1);
      paintRect(K, lay, -X + 0.15, -2.3, 0.75, 1.5, 0x2f6fde);
      paintRect(K, lay, 1.0, -2.55, 3.1, -1.95, 0xd23a3a);
      const ex = K.part('excavate', [0, 0.006, 0], null, 'Excavated 9″, sloped ⅛″ per ft');
      K.box(ex, [2 * X + 0.4, 0.012, Z1 - Z0 + 0.4], K.pbr('forrest_ground_01', [5, 5], {}, 'dirt'));
      // pergola footprint
      const PX0 = -X + 0.3;
      const PX1 = 0.6;
      const PZ0 = -2.3;
      const PZ1 = 1.5;
      const postXY = [[PX0, PZ0], [PX1, PZ0], [PX1, PZ1], [PX0, PZ1]];
      const ft = K.part('footings', [0, 0, 0], null, 'Pergola footings: 12″ piers, 42″ deep');
      postXY.forEach(([x, z]) => {
        K.cyl(ft, [0.16, 0.16, 1.1, 24], K.std(0x9a9890, { transparent: true, opacity: 0.6 }), [x, -0.45, z]);
        K.cyl(ft, [0.16, 0.16, 0.02, 24], 'concrete', [x, 0.12, z]);
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => K.cyl(ft, [0.008, 0.008, 0.1, 8], 'steel', [x + a * 0.06, 0.16, z + b * 0.06]));
      });
      const gl = K.part('gasLine', [0, 0, 0], null, 'Gas line to the fire wall (licensed fitter)');
      K.box(gl, [0.25, 0.01, 3.2], K.pbr('forrest_ground_01', [1, 4], {}, 'dirt'), [3.9, 0.012, -4.0]);
      K.tube(gl, [[3.9, 0.03, -5.6], [3.9, 0.03, -2.9], [2.4, 0.06, -2.4], [2.05, 0.15, -2.25]], 0.02, 'yellow');
      const base = K.part('base', [0, 0.06, 0], null, '6″ compacted gravel base');
      K.box(base, [2 * X + 0.2, 0.12, Z1 - Z0 + 0.2], K.pbr('gravel_floor', [5, 5], {}, 'stone'), [0, 0, 0], null, 0);
      const sand = K.part('sand', [0, 0.135, 0], null, '1″ screeded bedding (open-graded chip)');
      K.box(sand, [2 * X, 0.03, Z1 - Z0], K.std(0xb9b2a4, { roughness: 1 }), [0, 0, 0], null, 0);
      // porcelain 24×48 (0.6 × 1.2) on a 5 mm joint
      const por = K.part('porcelain', [0, 0.15, 0], null, '2 cm porcelain pavers, 24 × 48″');
      const tileMat = K.pbr('concrete_floor_01', [0.5, 0.25], { color: 0xe4ddd0, roughness: 0.55 }, 'offwhite');
      const tileMat2 = K.pbr('concrete_floor_01', [0.5, 0.25], { color: 0xd8d0c2, roughness: 0.55 }, 'offwhite');
      K.box(por, [2 * X, 0.012, Z1 - Z0], K.std(0x8d877c, { roughness: 1 }), [0, 0.006, 0], null, 0);
      let k = 0;
      for (let row = 0; row < 9; row++) {
        const z = Z0 + 0.3 + row * 0.6;
        const off = row % 2 ? 0.6 : 0;
        for (let x = -X - off; x < X; x += 1.2) {
          const x0 = Math.max(-X, x);
          const x1 = Math.min(X, x + 1.2);
          if (x1 - x0 < 0.1) continue;
          K.box(por, [x1 - x0 - 0.006, 0.02, 0.594], k++ % 3 ? tileMat : tileMat2, [(x0 + x1) / 2, 0.01, z], null, 0.003);
        }
      }
      const edge = K.part('edge', [0, 0.11, 0], null, 'Concrete edge restraint (toe-in)');
      const em = K.pbr('brushed_concrete', [3, 0.2], { color: 0xa8a39a }, 'concrete');
      K.box(edge, [2 * X + 0.2, 0.08, 0.1], em, [0, 0, Z1 + 0.05], null, 0.01);
      K.box(edge, [2 * X + 0.2, 0.08, 0.1], em, [0, 0, Z0 - 0.05], null, 0.01);
      K.box(edge, [0.1, 0.08, Z1 - Z0], em, [X + 0.05, 0, 0], null, 0.01);
      K.box(edge, [0.1, 0.08, Z1 - Z0], em, [-X - 0.05, 0, 0], null, 0.01);
      // pergola
      const alu = K.std(0x2d3033, { metalness: 0.55, roughness: 0.4 });
      const top = 2.75;
      const posts = K.part('posts', [0, 0.17, 0], null, 'Aluminum posts on anchor bolts (6″)');
      postXY.forEach(([x, z]) => {
        K.box(posts, [0.15, top, 0.15], alu, [x, top / 2, z], null, 0.008);
        K.box(posts, [0.26, 0.012, 0.26], alu, [x, 0.006, z], null, 0);
      });
      const beams = K.part('beams', [0, 0.17 + top, 0], null, 'Perimeter beams with gutters');
      K.box(beams, [PX1 - PX0 + 0.15, 0.24, 0.12], alu, [(PX0 + PX1) / 2, -0.12, PZ0], null, 0.006);
      K.box(beams, [PX1 - PX0 + 0.15, 0.24, 0.12], alu, [(PX0 + PX1) / 2, -0.12, PZ1], null, 0.006);
      K.box(beams, [0.12, 0.24, PZ1 - PZ0], alu, [PX0, -0.12, (PZ0 + PZ1) / 2], null, 0.006);
      K.box(beams, [0.12, 0.24, PZ1 - PZ0], alu, [PX1, -0.12, (PZ0 + PZ1) / 2], null, 0.006);
      const lv = K.part('louvers', [0, 0.17 + top - 0.1, 0], null, 'Motorized louvered roof blades');
      const blades = [];
      const nb = 18;
      for (let i = 0; i < nb; i++) {
        const z = PZ0 + 0.12 + ((i + 0.5) * (PZ1 - PZ0 - 0.24)) / nb;
        const b = K.group(lv, [(PX0 + PX1) / 2, 0, z]);
        K.box(b, [PX1 - PX0 - 0.12, 0.025, 0.2], K.std(0xe8e6e1, { metalness: 0.3, roughness: 0.45 }), [0, 0, 0], null, 0.004);
        blades.push(b);
      }
      const pl = K.part('pergolaLights', [0, 0.17 + top - 0.245, 0], null, 'Integrated LED perimeter lighting');
      const lm = glow(K, 0xfff1cc, 1.6);
      K.box(pl, [PX1 - PX0 - 0.1, 0.01, 0.03], lm, [(PX0 + PX1) / 2, 0, PZ0 + 0.07], null, 0);
      K.box(pl, [PX1 - PX0 - 0.1, 0.01, 0.03], lm, [(PX0 + PX1) / 2, 0, PZ1 - 0.07], null, 0);
      K.box(pl, [0.03, 0.01, PZ1 - PZ0 - 0.1], lm, [PX0 + 0.07, 0, (PZ0 + PZ1) / 2], null, 0);
      K.box(pl, [0.03, 0.01, PZ1 - PZ0 - 0.1], lm, [PX1 - 0.07, 0, (PZ0 + PZ1) / 2], null, 0);
      const ppl = new THREE.PointLight(0xffe0b0, 0.9, 5, 2);
      ppl.position.set((PX0 + PX1) / 2, -0.3, (PZ0 + PZ1) / 2);
      pl.add(ppl);
      // linear fire wall (lounge side)
      const FX = 2.05;
      const FZ = -2.25;
      const fb = K.part('fireBox', [FX, 0.17, FZ], null, 'Block frame with cross-vents');
      K.box(fb, [2.2, 0.55, 0.06], 'grey', [0, 0.275, 0.27]);
      K.box(fb, [2.2, 0.55, 0.06], 'grey', [0, 0.275, -0.27]);
      K.box(fb, [0.06, 0.55, 0.6], 'grey', [1.07, 0.275, 0]);
      K.box(fb, [0.06, 0.55, 0.6], 'grey', [-1.07, 0.275, 0]);
      const fc = K.part('fireClad', [FX, 0.17, FZ], null, 'Stacked-stone veneer & concrete cap');
      K.box(fc, [2.26, 0.56, 0.66], K.pbr('stacked_stone_wall', [1.6, 0.5], { roughness: 1, color: 0x9c958a }, 'stone'), [0, 0.28, 0], null, 0.01);
      const capM = K.pbr('brushed_concrete', [1, 0.3], { color: 0x6f6c66 }, 'dark');
      K.box(fc, [2.36, 0.06, 0.18], capM, [0, 0.59, 0.27], null, 0.01);
      K.box(fc, [2.36, 0.06, 0.18], capM, [0, 0.59, -0.27], null, 0.01);
      K.box(fc, [0.2, 0.06, 0.36], capM, [1.08, 0.59, 0], null, 0.01);
      K.box(fc, [0.2, 0.06, 0.36], capM, [-1.08, 0.59, 0], null, 0.01);
      [[-0.6, 0.335], [0.6, 0.335], [-0.6, -0.335], [0.6, -0.335]].forEach(([x, z]) => K.box(fc, [0.22, 0.06, 0.01], 'black', [x, 0.12, z], null, 0));
      const bu = K.part('burner', [FX, 0.72, FZ], null, 'Stainless trough burner + key valve');
      K.box(bu, [1.9, 0.05, 0.36], K.std(0xc9ced3, { metalness: 0.9, roughness: 0.25 }));
      K.box(bu, [1.6, 0.02, 0.02], 'steel', [0, 0.03, 0]);
      K.cyl(bu, [0.035, 0.035, 0.01, 20], 'chrome', [0.8, -0.32, 0.335], [90, 0, 0]);
      const gls = K.part('fireGlass', [FX, 0.745, FZ], null, 'Fire glass (1–2″ deep)');
      const gm = K.phys(0x2f8fd0, { roughness: 0.05, metalness: 0.2, clearcoat: 1, transparent: true, opacity: 0.9 });
      const rr = rng(9);
      for (let i = 0; i < 220; i++) K.sph(gls, 0.014 + rr() * 0.008, gm, [(rr() - 0.5) * 1.84, rr() * 0.015, (rr() - 0.5) * 0.3], [1, 0.7, 1]);
      const gf = K.part('gasFlame', [FX, 0.76, FZ], null, 'Flames');
      const flames = [];
      for (let i = 0; i < 12; i++) {
        const c2 = K.cone(gf, [0.06, 0.32, 12], i % 2 ? 'fire' : 'flame', [-0.77 + i * 0.14, 0.16, 0]);
        c2.userData.h = 0.32;
        c2.castShadow = false;
        flames.push(c2);
      }
      const fl = new THREE.PointLight(0xff9a3a, 1.3, 6, 2);
      fl.position.set(0, 0.4, 0.3);
      gf.add(fl);
      const fur = K.part('furniture', [0, 0.17, 0], null, 'Dining set, lounge seating & planters');
      K.glb(fur, 'outdoor_table_chair_set_01', { height: 0.86 }, [(PX0 + PX1) / 2, 0, (PZ0 + PZ1) / 2]) || K.box(fur, [1, 0.75, 1], 'wood', [(PX0 + PX1) / 2, 0.37, (PZ0 + PZ1) / 2]);
      K.glb(fur, 'painted_wooden_bench', { height: 0.89 }, [FX, 0, 0.2], [0, 0, 0]) || K.box(fur, [1.4, 0.45, 0.45], 'wood', [FX, 0.22, 0.2]);
      chairs(K, fur, [[3.0, 0, -0.9, -100], [1.1, 0, -0.9, 100]]);
      K.glb(fur, 'planter_box_02', { height: 0.45 }, [-X + 0.35, 0, 2.3]);
      K.glb(fur, 'potted_plant_01', { height: 1.2 }, [3.0, 0, 2.2]);
      K.glb(fur, 'shrub_02', { node: 'shrub_02_b', height: 1.3 }, [0.2, -0.17, -3.3]);
      K.glb(fur, 'shrub_02', { node: 'shrub_02_c', height: 1.2 }, [3.6, -0.17, -3.2], [0, 40, 0]);
      K.glb(fur, 'grass_medium_01', { node: 'grass_medium_01_tall_b_LOD0', height: 0.5 }, [-3.7, -0.17, 0.4]);
      // add-ons
      const shade = K.part('aoShade', [0, 0.17, 0], null, 'Motorized side screen');
      K.box(shade, [0.14, 0.14, PZ1 - PZ0 - 0.15], alu, [PX0, top - 0.32, (PZ0 + PZ1) / 2], null, 0.01);
      K.box(shade, [0.01, 1.7, PZ1 - PZ0 - 0.25], K.std(0x5a5650, { roughness: 1, transparent: true, opacity: 0.82, side: THREE.DoubleSide }), [PX0 + 0.01, top - 1.25, (PZ0 + PZ1) / 2], null, 0);
      const ir = K.part('aoHeaterIR', [0, 0.17 + top - 0.3, PZ0 + 0.12], null, 'Infrared heater (beam-mounted)');
      K.box(ir, [0.9, 0.09, 0.12], alu, [(PX0 + PX1) / 2, 0, 0], [-30, 0, 0], 0.01);
      K.box(ir, [0.8, 0.012, 0.06], K.std(0xff6a2a, { emissive: 0xff4a10, emissiveIntensity: 1.2 }), [(PX0 + PX1) / 2, -0.04, 0.03], [-30, 0, 0], 0);
      AO.speaker(K, 'aoSpeaker', [3.0, 0.17, 1.2]);
      AO.rug(K, 'aoRug', [2.6, 2.2], [FX, 0.172, -0.9]);
      const pp = [];
      for (let i = 0; i < 5; i++) pp.push([-X + 0.6 + i * 1.4, Z1 + 0.35]);
      AO.stakeLights(K, 'aoPath', pp, 'Edge path lights');
      return {
        tick(t, fx) {
          const open = fx === 'louvers' ? 0.5 + 0.5 * Math.sin(t * 0.8) : fx === 'closed' ? 0 : 1;
          blades.forEach((b) => (b.rotation.x = open * 1.2));
          flames.forEach((c, i) => {
            const s = 0.8 + 0.25 * Math.sin(t * (7 + i) + i * 1.7);
            c.scale.set(1, s, 1);
            c.position.y = (c.userData.h * s) / 2;
          });
          fl.intensity = gf.visible ? 1.1 + 0.3 * Math.sin(t * 11) : 0;
        },
      };
    }
  );

  const patio = TB.repair('backyard', 'paver-patio');
  const patioAdd = {
    solar: ao({ id: 'solar', part: 'aoSolar', name: 'Solar edge lights', cat: 'Lighting', blurb: 'Stake lights along the edging, no wiring.', cost: [40, 140], how: 'Push the stakes in just outside the steel edging, 3–4 ft apart, where they get afternoon sun.', needs: ['8 solar stake lights'], shop: 'Solar path lights' }),
    shade: ao({ id: 'shade', part: 'aoShade', name: 'Motorized side screen', cat: 'Comfort', blurb: 'Drop-down screen that blocks low sun and wind.', cost: [1200, 3500], how: 'Order it sized to the pergola bay from the pergola maker so it bolts to the beam and runs in the post tracks. The motor needs a GFCI circuit.', needs: ['Motorized pergola screen', 'GFCI-protected circuit'], shop: 'Motorized pergola screen' }),
    heaterIR: ao({ id: 'heaterIR', part: 'aoHeaterIR', name: 'Infrared heater', cat: 'Comfort', blurb: 'Beam-mounted electric heater that warms people, not air.', cost: [400, 1200], how: 'Mount at the height and clearance the maker lists (often 7 ft+) on a dedicated 240 V or 120 V circuit run by an electrician.', needs: ['Outdoor infrared heater (1500–3000 W)', 'Dedicated circuit (electrician)'], shop: 'Outdoor infrared patio heater' }),
    path: ao({ id: 'path', part: 'aoPath', name: 'Edge path lights', cat: 'Lighting', blurb: 'Lights along the lawn edge of the patio.', cost: [60, 200], how: 'Space them 5–6 ft apart a foot off the edge. Solar is simplest; low-voltage ties into the pergola transformer.', needs: ['5 path lights'], shop: 'Low voltage path lights' }),
  };
  const patioBase = { id: 'classic', name: 'Classic: concrete pavers', blurb: 'A 10 × 8 ft herringbone paver patio on a compacted gravel base.', level: 3, time: '2–3 days', cost: '$8–15 per sq ft' };
  patio.variants = [
    {
      id: 'starter',
      name: 'Starter: pea gravel + stepping stones',
      blurb: 'A 12 × 10 ft pea-gravel patio held by steel edging, with a flagstone stepping-stone entry.',
      level: 1,
      time: '1 weekend',
      cost: '$3–6 per sq ft',
      model: 'patioGravel',
      summary: 'The fastest, cheapest patio that still looks deliberate: a 6″ dig, landscape fabric, 4″ of packed crushed stone, crisp steel edging and 2″ of pea gravel on top, with flagstones leading in from the lawn. No mortar, no cutting, and rain soaks straight through.',
      intro: { show: ['dig', 'fabric', 'base', 'edging', 'gravel', 'pads', 'furniture'], spin: true, preview: true },
      safety: ['Call 811 (the free “call before you dig” line) at least 3 business days before digging, and wait until every utility has flagged the yard.', 'Wear gloves when handling steel edging; the cut ends are razor-sharp.', 'A plate compactor (rental machine that packs gravel by vibrating) is loud and heavy: wear ear protection and closed-toe boots, and let the rental shop show you the throttle and handle.', 'Lift with your legs and move gravel by wheelbarrow; bulk stone weighs about 2,700 lb per cubic yard.'],
      causes: [['Size', '12 × 10 ft fits a bistro set and two lounge chairs with room to walk around them.'], ['Gravel choice', '⅜″ pea gravel (small, smooth, round stones) is comfortable underfoot. Crushed stone packs firmer but feels sharp to bare feet.'], ['Drainage', 'Water drains through gravel, but the spot still shouldn’t be the low point where the yard puddles after rain.'], ['Order by the ton', 'For 120 sq ft: about 2 tons of ¾″ crushed stone for the 4″ base and 1¼ tons of pea gravel for the 2″ top. Bulk from a landscape yard costs a fraction of bagged.']],
      tools: ['Tape measure, 4 wooden stakes & mason line (strong string)', 'Marking paint', 'Flat spade, square shovel & landscape rake', 'Plate compactor (rental) or a hand tamper', 'Woven landscape fabric + U-shaped garden staples', 'Steel landscape edging (≈ 44 ft) with its stakes', 'Rubber mallet, sledge or hammer & a scrap 2×4 block', '¾″ crushed stone (≈ 2 tons) + ⅜″ pea gravel (≈ 1¼ tons)', 'Wheelbarrow & garden hose', '4 ft level', 'Flagstones (6), 1½–2″ thick'],
      steps: [
        { t: 'Lay out the rectangle', d: 'Drive a stake at each corner of a 12 × 10 ft rectangle and tie mason line around them. Measure both diagonals, corner to corner, and nudge stakes until the two numbers match (about 15′7″). Then spray marking paint along the strings.', why: 'A rectangle with equal diagonals has four square corners, so the edging runs parallel to the house and the patio looks planned.', tip: 'Run the long side parallel to the house first and measure off that line; if the diagonals won’t agree, move only the two far stakes, never the ones on the house side.', ok: 'Both diagonals read the same within ½″, and the painted outline is a clean rectangle.', v: { cam: [4.0, 3.2, 4.2], at: [0, 0, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [1.8, 0.02, 1.5], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Strip sod and dig 6″', d: 'Slice the grass off in strips with a flat spade, then dig the whole rectangle 6″ below the lawn. Keep the bottom flat and rake out roots and rocks. Stack good sod in a shady spot to patch bare areas later.', why: '6″ holds 4″ of packed base plus 2″ of pea gravel, so the finished surface ends up level with the lawn.', tip: 'Tie a string across the hole at lawn height and check depth with a tape every few feet; if you dig a spot too deep, fill it with base stone, not loose soil, which would settle.', ok: 'A tape measured down from the string reads about 6″ everywhere, and the bottom feels firm, not spongy.', v: { cam: [4.0, 3.0, 4.2], at: [0, 0, 0], hi: ['dig'], show: ['dig'], tool: { id: 'shovel', at: [1.2, 0.02, 0.8], rot: [10, 40, -15], anim: 'push' } } },
        { t: 'Tamp and lay fabric', d: 'Pack the soil with the compactor or tamper until your boot barely dents it. Roll woven landscape fabric over the whole bottom, overlap the seams 6″, and run it up the sides. Pin it with staples every 2–3 ft.', why: 'Fabric is a separator: it keeps the stone from slowly sinking into the soil and stops most weeds coming up from below.', tip: 'Buy woven fabric, the kind that looks like a tarp. Thin felt-like fabric tears under a shovel, and if it does tear, just lay a patch with a 6″ overlap.', ok: 'No soil shows anywhere, seams overlap, and the fabric lies flat without wrinkles or air pockets.', v: { cam: [3.6, 2.8, 3.8], at: [0, 0, 0], hi: ['fabric'], show: ['fabric'], hide: ['layout'] } },
        { t: 'Install the steel edging', d: 'Stand the steel edging around the outline against the fabric. Drive its stakes (about every 30″) through the slots, tapping on a scrap block, so the top finishes ½″ above where the gravel will be and about level with the lawn.', why: 'Edging is what keeps a gravel patio crisp. Without it the stones wander into the lawn within a season.', tip: 'Hammer on a scrap 2×4 laid on top of the edging, never directly; that keeps the top edge straight and unbent. If a stake hits a rock, pull it and move over 2″.', ok: 'Sight down each side: the edging runs straight, stands upright, and doesn’t move when you push on it with your foot.', v: { cam: [3.6, 2.2, 4.0], at: [1.2, 0.05, 1.0], hi: ['edging'], show: ['edging'], tool: { id: 'hammer', at: [1.6, 0.14, 1.52], rot: [0, -20, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Spread and compact the base', d: 'Wheel in ¾″ crushed stone and spread a 2″ layer. Mist it with the hose and run the compactor over it twice. Add a second 2″ layer and repeat, for 4″ total.', why: 'Crushed stone has sharp edges that lock together when packed, so chairs won’t sink. Two thin layers pack solid all the way through; one thick one stays loose underneath.', tip: 'Damp stone packs much tighter than dry; it should feel like moist sand, not soupy. If the compactor leaves a groove, the layer was too thick or too wet: let it dry an hour and go over it again.', ok: 'You can walk across it in boots without leaving prints, and it sounds and feels solid, not crunchy.', v: { cam: [3.6, 2.8, 3.8], at: [0, 0, 0], hi: ['base'], show: ['base'], tool: { id: 'level', at: [-0.5, 0.065, 0.2], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Rake in the pea gravel', d: 'Dump the pea gravel in a few piles and rake it out about 2″ deep, level and ½″ below the top of the edging. Use the back of the rake for the final pass.', why: 'At 2″ it’s firm to walk on. Deeper than about 3″ feels like walking on a beach and chair legs sink.', tip: 'Push a pencil into the gravel in a few spots to check depth: the base should stop it about 2″ down. If chairs still wobble later, rake a thin spot thinner rather than adding more gravel.', ok: 'The gravel looks even, the edging shows a small ½″ lip all around, and it feels firm underfoot.', v: { cam: [3.8, 2.8, 4.0], at: [0, 0.05, 0], hi: ['gravel'], show: ['gravel'], tool: { id: 'shovel', at: [1.0, 0.09, 0.6], rot: [20, 40, -20], anim: 'push' } } },
        { t: 'Set the stepping stones', d: 'Lay flagstones from the lawn to the patio, centered about 24″ apart. Cut around each one with the spade, dig out the soil, add 1″ of sand or stone dust, and tap the stone until its top is flush with the grass.', why: 'Flush stones don’t catch a mower blade or a toe, and a 24″ spacing matches a normal walking stride.', tip: 'Walk the route normally first and drop a coin where each foot lands; set stones on the coins. If a stone rocks, lift it and scrape sand from under the high corner.', ok: 'Each stone sits flush with the grass and doesn’t rock or clunk when you stand on one edge.', v: { cam: [2.4, 1.8, 5.6], at: [0, 0.05, 2.6], hi: ['pads'], show: ['pads'], tool: { id: 'hammer', at: [0.3, 0.12, 2.6], rot: [0, -30, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Furnish it', d: 'Set the bistro set and planters on the gravel, then rake the gravel smooth again around the feet. Hose off any dust.', why: 'Wide feet spread the weight so they sink less into loose stone.', tip: 'If chair legs dig in, add wide plastic glides or set each foot on a buried flat paver; tables sit best on a pair of hidden pavers.', ok: 'Chairs sit level and don’t sink when you sit and lean back.', v: { cam: [4.4, 3.2, 4.8], at: [0, 0.2, 0.3], hi: ['furniture'], show: ['furniture'] } },
      ],
      learn: {
        how: 'A gravel patio is a permeable surface: rain soaks through the stones and fabric into the soil, so there’s no runoff to manage. The packed crushed-stone base carries the weight, the fabric keeps the layers separate, and the steel edging stops the loose top layer from spreading.',
        specs: [['Dig depth', '6″'], ['Base', '4″ of ¾″ crushed stone, packed in two 2″ layers'], ['Top layer', '2″ of ⅜″ pea gravel'], ['Edging above gravel', '½″'], ['Base for 120 sq ft at 4″', '≈ 1.5 yd³ (≈ 2 tons)'], ['Pea gravel for 120 sq ft at 2″', '≈ 0.75 yd³ (≈ 1–1¼ tons)'], ['Stepping-stone spacing', '≈ 24″ center to center']],
        terms: [['Pea gravel', 'Small, smooth, rounded stones about ⅜″ across.'], ['Crushed stone', 'Angular, machine-crushed rock that locks together when packed.'], ['Plate compactor', 'Rental machine with a vibrating steel plate that packs gravel.'], ['Permeable', 'Lets water drain through instead of running off.'], ['Landscape fabric', 'Woven cloth that keeps soil and stone layers apart.']],
        mistakes: ['Skipping the crushed-stone base (chairs sink).', 'Spreading pea gravel 3″ or deeper (it feels like sand).', 'Plastic edging that heaves and curls.', 'Edging set too low, so gravel spills into the lawn.'],
        tips: ['Order gravel by the ton from a landscape yard; bags cost 3–4× as much.', 'Ask the yard for “¾″ clean” or “road base” for the base layer and dump the truck on a tarp on the driveway.'],
      },
      pro: 'The area holds water after storms, sits on a slope steeper than about 1″ per 4 ft, or you want it to handle a car.',
      tricks: [['Have the stone dumped close', 'Ask the yard to dump the two piles on tarps as close to the patio as the truck can get; every 10 ft less wheelbarrow travel saves you hours.'], ['Rent the compactor for half a day', 'Do all the digging first, then rent the compactor for one session to pack the soil and both base layers back to back.'], ['Use a gravel stabilizer grid if chairs sink', 'Plastic honeycomb grid panels under the pea gravel stop it shifting; it’s a cheap fix if furniture keeps sinking.'], ['Pick a darker or mixed gravel', 'Mixed-color pea gravel hides leaves and dirt far better than bright white.'], ['Leaf blower, not rake, in fall', 'Blow leaves off on a low setting; raking pulls gravel into the lawn.'], ['Top up every few years', 'Gravel slowly works into the base. A few bags raked in every 2–3 years keeps it looking fresh.']],
      refs: [['How to Lay Pea Gravel (Angi)', 'https://www.angi.com/articles/how-to-lay-pea-gravel.htm'], ['Gravel Patio Project Guide (Hello Gravel)', 'https://hellogravel.com/projects/gravel-patio/'], ['Call Before You Dig (811)', 'https://call811.com/']],
      addons: [patioAdd.solar].concat(pick(patio, ['string', 'umbrella', 'speaker'])),
    },
    patioBase,
    {
      id: 'showpiece',
      name: 'Showpiece: two-level terrace + seat wall',
      blurb: 'A raised dining terrace with steps and a lit seat wall over a lower patio with a circle inlay and charcoal border.',
      level: 3,
      time: '1–2 weeks',
      cost: '$25–45 per sq ft',
      model: 'patioTerrace',
      summary: 'Two outdoor rooms in one: a raised dining terrace held up by a short block retaining wall with a built-in seat wall and lit caps, wide block steps with riser lights, and a lower lounge patio with an 8 ft circle inlay framed in a charcoal border. Everything sits on one deep, compacted gravel base, so the levels stay put.',
      intro: { show: ['base', 'wall1', 'wall2', 'fill', 'steps', 'stepLights', 'seatWall', 'seatCap', 'capLights', 'wallCap', 'pavers', 'circle', 'border', 'upper', 'edge', 'furniture'], spin: true, preview: true },
      safety: ['Call 811 (the free “call before you dig” line) at least 3 business days before digging.', 'Check permits: many towns require one for retaining walls over 24–30″ tall and for steps; walls holding back a slope or driveway need an engineer.', 'Keep this terrace wall under 2 ft. Any walking surface more than 30″ above the ground next to it needs a guard (a railing at least 36″ tall) under the residential code.', 'Cut block and pavers with a wet saw or a splitter, wearing eye and ear protection and a respirator; dry-cutting concrete makes silica dust that scars lungs.', 'Use low-voltage (12 V) lighting only, with the transformer plugged into a GFCI outlet (the kind with test and reset buttons) under a weatherproof “in-use” bubble cover.'],
      causes: [['Plan the levels', 'Two 7″ risers (14″ total) is a comfortable change. Every riser must match within ⅜″, and treads (the part you step on) should be at least 12″ deep outdoors.'], ['Size each room', 'A 10 × 10 ft dining terrace fits a table for six; the lower patio is the lounge.'], ['Order extra', 'Pavers +10%, wall block +5%, and a circle kit sized to the lounge area (8–10 ft).'], ['Slope for water', 'Both levels fall ⅛–¼″ per foot away from the house so rain runs off, never toward the walls or the door.']],
      tools: ['Tape, stakes, mason line, line level & marking paint', 'Mini excavator or shovels; plate compactor (rental)', '¾″ crushed paver base (≈ 12 tons), ¾″ clean drain stone & concrete sand', 'Retaining-wall block + caps (+5%)', 'Concrete/landscape block adhesive & caulk gun', '4 ft level, torpedo level, rubber mallet & dead-blow hammer', 'Pavers, circle kit & soldier-border pavers (+10%)', 'Two 1″ screed pipes & a straight 2×4', 'Wet saw or paver splitter (rental)', 'Edge restraint + 10″ spikes', 'Polymeric sand, push broom & leaf blower', 'Low-voltage transformer, 12/2 cable, cap & riser lights'],
      steps: [
        { t: 'Lay out both levels', d: 'Spray-paint the lower patio, terrace, step opening and circle center. Then stretch mason lines at both finished heights, using a line level so each falls ⅛–¼″ per foot away from the house. Mark the heights on the stakes with tape.', why: 'Every depth, wall course and step height you set later is measured from these strings, so they are the plan in physical form.', tip: 'Put a nail through the tape on each stake at the string height; if a string gets bumped during digging, you can retie it to the nail in seconds.', ok: 'The line level bubble shows a slight, even fall away from the house on every string, and the two heights differ by exactly the planned 14″.', v: { cam: [6.4, 4.6, 7.0], at: [0, 0, -0.4], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [2.5, 0.02, 1.2], rot: [0, 90, 0], scale: 1.8 } } },
        { t: 'Excavate and compact', d: 'Dig the whole footprint about 8″ below the lower patio’s finished height, plus 6″ past every edge. Dig the wall trench 2″ deeper and 2 ft wide. Run the plate compactor over the bare soil, two passes each way.', why: 'Walls and pavers share one stable footing, so the two levels move together instead of cracking apart where they meet.', tip: 'Measure down from the strings with a tape every few feet as you dig. If you hit soft, wet or black organic soil, dig it out and replace it with base stone; packing it just traps the problem.', ok: 'Your boot leaves no mark on the compacted soil and the tape reads the target depth everywhere.', v: { cam: [6.4, 4.6, 7.0], at: [0, 0, -0.4], hi: ['excavate'], show: ['excavate'], hide: ['layout'], tool: { id: 'shovel', at: [1.8, 0.02, 1.4], rot: [10, 40, -15], anim: 'push', scale: 1.2 } } },
        { t: 'Build the base', d: 'Spread crushed paver base in 2″ layers. Mist each layer and pack it with two compactor passes before adding the next. Build up 6″ under the wall trench and 4″ under the patio areas, keeping the slope.', why: 'Thin layers pack solid all the way through. The thicker pad under the wall stops it from settling and tipping.', tip: 'Paint a depth mark on a stick and push it into each new layer before packing; if the compactor leaves ridges, the stone is too dry, so mist it and go again.', ok: 'The base sounds solid, a straight 2×4 laid across it shows gaps no bigger than ⅜″, and the tape to the strings reads right.', v: { cam: [6.4, 4.6, 7.0], at: [0, 0, -0.4], hi: ['base'], show: ['base'], hide: ['excavate'] } },
        { t: 'Set the first wall course', d: 'Lay a 1″ layer of sand on the wall pad, then set the first row of block tight end to end on it. Level every block side to side and front to back, tapping it down with a dead-blow hammer. This row should sit below the finished paving.', why: 'A dead-level, partly buried first course is the whole wall. Any error doubles by the time you reach the cap, and the buried part keeps the base from sliding.', tip: 'Start at the lowest point and at a corner or step, not the middle. If a block sits high, lift it and scrape sand away rather than hammering it hard, which can crack the lip on the back.', ok: 'A 4 ft level across several blocks shows the bubble centered both ways, and string pulled along the fronts touches every block.', v: { cam: [1.6, 3.4, 3.4], at: [-1.0, 0.1, -1.6], hi: ['wall1'], show: ['wall1'], tool: [{ id: 'level', at: [-1.6, 0.285, -0.35], rot: [0, 0, 0], scale: 2 }, { id: 'hammer', at: [-2.3, 0.33, -0.35], rot: [0, 20, 0], anim: 'tap', scale: 1.5 }] } },
        { t: 'Build up and backfill', d: 'Stack the second course so every joint sits over the middle of a block below. Fill the hollow cores and a 12″ zone behind the wall with clean drain stone. Fill the rest of the terrace with crushed base in 4″ layers, packing each one, up to the terrace base height.', why: 'Drain stone lets water out instead of building pressure behind the wall. Packing in layers stops the terrace from settling and shoving the wall forward.', tip: 'Keep the big compactor about 3 ft back from the wall; use a hand tamper right behind the blocks so the vibration doesn’t push them out of line.', ok: 'A string along the wall face is still straight after backfilling, and the fill doesn’t give underfoot.', v: { cam: [5.6, 4.0, 3.4], at: [0, 0.2, -1.8], hi: ['wall2', 'fill'], show: ['wall2', 'fill'] } },
        { t: 'Build the steps', d: 'Stack block in the opening to make 7″ risers (the vertical part of a step), with treads at least 12″ deep. Glue cap or paver treads on with two beads of block adhesive. Notch or set the riser lights in the face as you go and feed their wires back.', why: 'Equal steps matter more than anything else on a stair: your feet expect the same height every time, and the code limit for difference is just ⅜″.', tip: 'Make a story stick: mark 7″ and 14″ on a straight board and check each riser against it. If one comes out short, add a thin paver under the tread rather than shimming with sand.', ok: 'Each riser measures 7″ ±⅛″, treads feel solid, and a level on each tread shows a tiny tilt forward for water to run off.', v: { cam: [3.2, 2.2, 3.4], at: [0, 0.3, -0.4], hi: ['steps', 'stepLights'], show: ['steps', 'stepLights'], tool: { id: 'level', at: [0, 0.335, 0.0], rot: [0, 0, 0], scale: 1.8 } } },
        { t: 'Seat wall and caps', d: 'Build two courses of seat wall along the back of the terrace for about an 18″ seat height. Run the light wire behind the block before capping. Then glue the caps on with two beads of adhesive and the LED lights tucked under the overhang.', why: 'About 18″ is chair-seat height, so it works as a real bench; wiring it before capping keeps every wire hidden and protected.', tip: 'Dry-lay all the caps first and number them with chalk; cut the odd one in the middle, not at the ends. Test each light before gluing the cap above it.', ok: 'The cap tops line up with a straight edge, nothing wobbles when you sit on them, and every light glows on a test.', v: { cam: [4.8, 3.6, 2.4], at: [0, 0.6, -2.4], hi: ['seatWall', 'seatCap', 'capLights', 'wallCap'], show: ['seatWall', 'seatCap', 'capLights', 'wallCap'], tool: { id: 'caulkGun', at: [1.0, 0.95, -2.95], rot: [0, 0, -70], scale: 1.4 } } },
        { t: 'Screed and lay the lower field', d: 'Set two 1″ pipes on the base, fill between with concrete sand, and drag a straight 2×4 along them to strike the sand flat. Set the circle kit at its center mark first, then lay the herringbone pavers around it, stepping only on laid pavers. Cut pieces to meet the circle.', why: 'Starting with the circle locks the focal point in place; the field is far easier to cut to fit the circle than the other way round.', tip: 'Never walk on screeded sand. If you leave a footprint, rake and re-screed that patch. Snap a chalk line every few rows to keep the herringbone straight.', ok: 'The circle sits centered on your mark, and the pavers around it are flat and in straight lines when you sight across them.', v: { cam: [3.6, 3.4, 4.6], at: [0, 0.15, 1.2], hi: ['sand', 'pavers', 'circle'], show: ['sand', 'pavers', 'circle'], tool: { id: 'hammer', at: [0.8, 0.22, 1.9], rot: [0, -40, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Border, terrace field and edges', d: 'Lay the charcoal border pavers (end to end, short side out) around the lower patio. Screed and pave the terrace the same way. Spike edge restraint, a plastic or aluminum strip, tight against every open edge every 12″.', why: 'The border frames the pattern and gives cut pieces something solid to push against; edging keeps the whole field from creeping outward.', tip: 'Fill the gaps at the edges with pieces at least half a paver wide. If a cut would be smaller, shift the border or recut the neighbor so both are bigger.', ok: 'Push hard on an edge paver with your foot: it doesn’t shift, and the edging is snug against it all the way around.', v: { cam: [5.6, 3.6, 5.2], at: [0, 0.2, 0.3], hi: ['border', 'upper', 'edge'], show: ['border', 'upper', 'edge'], tool: { id: 'hammer', at: [2.53, 0.2, 1.4], rot: [0, 0, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Lock the joints and furnish', d: 'On a dry day, run the compactor (with its rubber pad) over the pavers, sweep polymeric sand into the joints, compact again and top up. Blow every grain off the surface, then mist gently until the joints are wet. Keep off for 24 hours.', why: 'Polymeric sand has a binder that hardens when wet, making flexible joints that resist weeds, ants and washout.', tip: 'Read the bag for rain-free time (usually 24 hours). Any sand left on top turns into a hazy film, so blow off twice. If haze happens, a polymeric haze remover fixes it.', ok: 'Joints are filled to just below the paver chamfer (the bevelled edge), the surface is clean, and the next day the joints feel firm to a fingernail.', v: { cam: [6.4, 4.4, 7.0], at: [0, 0.4, -0.4], hi: ['jsand', 'furniture'], show: ['jsand', 'furniture'], hide: ['sand'] } },
      ],
      learn: {
        how: 'A two-level patio is a short retaining wall holding a compacted gravel fill, with pavers on both levels. The wall resists the sideways push of the fill with its weight and the small setback of each course, and drain stone behind it lets water out so no pressure builds up. Steps are tiny walls with treads. Because everything sits on one base, the levels stay in step with each other.',
        specs: [['Riser height', '6–7½″, all within ⅜″ of each other'], ['Tread depth', '≥ 12″ outdoors'], ['Seat height', '17–19″'], ['Base under walls', '6″ compacted, 2 ft wide'], ['Drain stone behind wall', '12″'], ['Base under pavers', '4″ compacted'], ['Sand bed', '1″'], ['Slope', '⅛–¼″ per ft away from the house'], ['Circle kit', '8–10 ft for a lounge area']],
        terms: [['Retaining wall', 'A wall that holds back soil or fill.'], ['Soldier course', 'Pavers set end to end in a line, short side out, as a border.'], ['Circle kit', 'Pre-cut tapered pavers that assemble into a circle.'], ['Lift', 'One compacted layer of fill.'], ['Coping (cap)', 'The flat units on top of a wall.'], ['Riser and tread', 'The vertical face of a step, and the flat part you step on.']],
        mistakes: ['Dumping all the fill in at once (it settles for years).', 'Uneven step risers.', 'No drain stone behind the wall.', 'Running light wire after the caps are glued.'],
        tips: ['Rent a paver splitter for the circle and border cuts; it’s quicker and dust-free.', 'Use 2700K warm LEDs under caps and in risers.'],
      },
      pro: 'The grade change is more than about 2 ft, the wall holds back a slope or a driveway, or local code requires an engineered wall or stair guards.',
      tricks: [['Order from one supplier, one lot', 'Get all the block, caps and pavers from the same production run so the color matches; pull from several pallets as you work to blend any variation.'], ['Mark heights on the house', 'Snap a chalk line on the foundation at each finished height. It survives the dig, unlike stakes that get knocked over.'], ['Pre-wire with spare conduit', 'Lay a 1″ PVC pipe under the terrace before the base goes in; future lights or a speaker cable slide through without lifting pavers.'], ['Splitter beats saw for walls', 'A rented block splitter makes clean, dust-free breaks and gives cut ends a natural rough face that matches the block.'], ['Glue caps in cool weather carefully', 'Block adhesive skins slowly below 40°F; check the tube’s temperature range and keep it in a warm car until you use it.'], ['If a paver settles later', 'Pry it out with two flat screwdrivers, add sand under it, tap it back flush, and re-sand the joints.']],
      refs: [['Basic Installation for Retaining Walls (Allan Block)', 'https://allanblock.com/installation/residential-installation/basic-installation'], ['Raised Patio Walls (Allan Block)', 'https://allanblock.com/retaining-walls/raised-patio.aspx'], ['Call Before You Dig (811)', 'https://call811.com/']],
      addons: pick(patio, ['string', 'umbrella', 'heater', 'rug', 'speaker']),
    },
    {
      id: 'luxury',
      name: 'Luxury: porcelain, pergola + fire wall',
      blurb: 'Large-format porcelain, a louvered aluminum pergola over the dining zone and a built-in linear gas fire wall.',
      level: 4,
      time: '3–5 weeks (incl. permits)',
      cost: '$45–90 per sq ft',
      model: 'patioLuxe',
      summary: 'An outdoor room: 24 × 48″ porcelain pavers on a deep compacted base, a motorized louvered aluminum pergola with built-in LED lighting over the dining table, and a stone-clad linear gas fire wall for the lounge. Pergola footings, wiring and the gas line need permits and licensed trades; your part is planning, choosing and the porcelain prep.',
      intro: { show: ['base', 'sand', 'porcelain', 'edge', 'posts', 'beams', 'louvers', 'pergolaLights', 'fireBox', 'fireClad', 'burner', 'fireGlass', 'gasFlame', 'furniture'], spin: true, preview: true },
      safety: ['Gas piping and connections must be done by a licensed gas fitter with a permit, a pressure test and an inspection.', 'Pergola footings and electrical (motor, lights, heaters) usually need permits. Outdoor circuits must be GFCI-protected (a breaker or outlet with test and reset buttons that cuts power in a fraction of a second if current leaks).', 'Porcelain is heavy and sharp-edged: lift 24 × 48″ tiles with two people or suction-cup lifters, wear cut-resistant gloves, and cut wet with a respirator for silica dust.', 'Keep the fire feature’s listed clearances to the pergola roof, furniture and walls (in the burner manual), and never enclose a gas burner without the vents its maker requires.'],
      causes: [['Zones', 'Dining under cover, lounge by the fire, with a 3 ft walkway between them.'], ['Porcelain method', '2 cm (¾″) porcelain can be set on a compacted gravel base with a screeded bedding layer, on pedestals, or bonded to a concrete slab. Use the method your tile maker approves for warranty.'], ['Utilities first', 'Plan gas, power and drainage runs before any base goes in so nothing has to be dug up later.'], ['Slip resistance', 'Choose an outdoor-rated, textured finish (R11 or a wet DCOF above 0.50) so it isn’t slick in rain.']],
      tools: ['Permits: pergola footings, gas, electrical', 'Mini excavator & plate compactor', 'Auger or digger for pergola footings + concrete', '¾″ crushed base (≈ 20 tons) + ¼″ chip or concrete sand for bedding', '2 cm porcelain pavers 24 × 48″ (+10%)', '4–5 mm plastic paver spacers', 'Suction-cup lifters & white rubber mallet', 'Wet tile saw with a porcelain diamond blade', 'Concrete edge restraint (bagged concrete)', 'Louvered pergola kit + anchor bolts', 'Linear burner kit, key valve & vent kits (gas fitter)', 'Block, stone veneer, concrete caps & fire glass', 'Polymeric sand rated for narrow porcelain joints'],
      steps: [
        { t: 'Design and permits', d: 'Draw the patio to scale with dining, lounge and a 3 ft walkway. Choose the pergola and burner, then apply for permits for the footings, gas and electrical. Mark where every pipe and wire must run under the patio.', why: 'The pergola anchors, gas line and wiring all go in before the pavers, so they have to be decided first.', tip: 'Lay the porcelain size on your drawing as a grid and slide the pergola posts so they land on joints or tile centers; posts that land on random slivers look accidental.', ok: 'You have permit approvals in hand and a drawing showing every post, pipe and wire with measurements from the house.', v: { cam: [7.0, 4.6, 7.2], at: [0, 0, -0.3], hi: ['permit', 'layout'], show: ['permit', 'layout'], tool: { id: 'tape', at: [3.3, 0.02, 1.0], rot: [0, 90, 0], scale: 1.8 } } },
        { t: 'Excavate and grade', d: 'Dig 9″ below the finished height and 8–10″ past every edge, sloping the bottom ⅛″ per foot away from the house. Compact the soil with two passes of the plate compactor each way.', why: 'Porcelain is thin and stiff, so it shows any settling as a rocking or cracked tile; the base must be deeper and flatter than for concrete pavers.', tip: 'Run strings at finished height and measure down every 4 ft. If the soil is clay that pumps up water when compacted, lay woven geotextile fabric before the base.', ok: 'Every measurement from the strings reads 9″ (within ½″) and the subgrade doesn’t dent under your boot.', v: { cam: [7.0, 4.6, 7.2], at: [0, 0, -0.3], hi: ['excavate'], show: ['excavate'], hide: ['layout'], tool: { id: 'shovel', at: [1.8, 0.02, 1.6], rot: [10, 40, -15], anim: 'push', scale: 1.2 } } },
        { t: 'Pour pergola footings', d: 'Dig the footings to the size on the pergola maker’s drawings (often 2 × 2 ft, and always below your frost depth). After the inspector signs off, pour concrete and set the anchor bolts in the maker’s template, square and level.', why: 'A louvered roof catches wind like a sail and holds snow when closed; each post needs its own deep footing, not just the pavers.', tip: 'Check the template’s diagonal between footings before the concrete sets; you have about 20 minutes to nudge it. Wrap the bolt threads in tape so concrete doesn’t gum them.', ok: 'The diagonal measurements between all four bolt groups match and the templates are level both ways.', v: { cam: [4.2, 2.4, 3.4], at: [-1.2, -0.2, -0.4], hi: ['footings'], show: ['footings'], xray: true, tool: { id: 'level', at: [0.6, 0.15, 1.5], rot: [0, 0, 0], scale: 1.4 } } },
        { t: 'Gas line (licensed fitter)', d: 'The fitter trenches from the gas meter or tank to the fire wall, runs approved pipe at least 12″ deep (with a tracer wire on plastic pipe), pressure-tests it, and caps it until the burner is in.', why: 'Burial depth, pipe type and testing are set by the fuel gas code; gas leaks are explosive, so this is never DIY.', tip: 'Ask the fitter to leave a photo of the open trench with a tape measure in it; it proves the depth for the inspector and shows you exactly where the line runs.', ok: 'The fitter shows you a pressure test that held with no drop, and the inspection is signed off.', v: { cam: [6.2, 4.0, 0.4], at: [3.0, 0, -3.0], hi: ['gasLine'], show: ['gasLine'] } },
        { t: 'Base and bedding', d: 'Spread crushed base in 2″ layers and pack each with the compactor until you have 6″. Then spread 1″ of ¼″ chip (or the tile maker’s bedding), pack it lightly once, and screed it dead flat along 1″ pipes with a straight board.', why: 'Porcelain isn’t compacted after laying, so the bedding must be firm and flat before the tiles go down; open chip also drains instead of pumping mud.', tip: 'Check the base with a 10 ft straight board: gaps over ¼″ show through big tiles. Fix highs and lows in the base, never by making the bedding thicker.', ok: 'A 10 ft straightedge shows no gap over ⅛″ on the bedding, and the surface still slopes ⅛″ per foot.', v: { cam: [7.0, 4.6, 7.2], at: [0, 0, -0.3], hi: ['base', 'sand'], show: ['base', 'sand'], hide: ['excavate'] } },
        { t: 'Lay the porcelain', d: 'With suction lifters, lower each tile straight down onto the bedding, offsetting rows by a third of a tile. Put 4–5 mm spacers in the joints. Tap with a white rubber mallet until each tile is flush with its neighbors.', why: 'Never run a plate compactor over porcelain; it cracks. A one-third offset hides the slight bow that long tiles have.', tip: 'Slide your fingertip across each joint; if you feel a step, lift that tile and add or scrape bedding. Snap a chalk line every few rows so joints stay straight over 20+ ft.', ok: 'Your fingertip glides across joints without catching, and the joints line up along the chalk lines.', v: { cam: [4.0, 2.6, 4.2], at: [1.0, 0.15, 1.0], hi: ['porcelain'], show: ['porcelain'], hide: ['sand'], tool: { id: 'hammer', at: [1.2, 0.2, 1.3], rot: [0, -40, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Edges and joints', d: 'Pour a concrete toe (a wedge of concrete against the outer tile edges, below the surface) all around as the edge restraint. Once it hardens, pull the spacers, sweep porcelain-rated polymeric sand into the joints, blow the surface clean, and mist to set it.', why: 'Large tiles move as one sheet; the concrete toe stops the whole field from creeping, and the joint sand keeps out weeds and ants.', tip: 'Wet the porcelain first with a fine mist if the sand maker says so; porcelain is so smooth that dry dust can bond to it as haze. Rinse any haze off within the time on the bag.', ok: 'Joints are full to just below the surface and the tiles are clean, with no white film when dry.', v: { cam: [3.0, 1.8, 4.6], at: [2.6, 0.12, 2.4], hi: ['edge'], show: ['edge'] } },
        { t: 'Raise the pergola', d: 'Bolt the posts to the anchors and plumb them (check vertical on two sides with a level). Bolt on the beams, drop in the louver blades, and let the electrician connect the motor and lights.', why: 'Plumb posts let the blades close tight and the built-in gutters drain to the corner downspouts.', tip: 'Snug all bolts first, check that the frame is square and plumb, then tighten fully; tightening one corner hard first can pull the others out.', ok: 'A level shows each post plumb on two faces, and the louvers open and close smoothly without rubbing.', v: { cam: [3.4, 3.4, 5.6], at: [-1.3, 1.6, -0.4], hi: ['posts', 'beams', 'louvers', 'pergolaLights'], show: ['posts', 'beams', 'louvers', 'pergolaLights'], fx: 'louvers', tool: { id: 'level', at: [0.53, 1.3, 1.5], rot: [0, 0, 90], scale: 1.6 } } },
        { t: 'Build the fire wall', d: 'Build the block frame with vents on opposite sides (often at least 18 sq in each; follow the burner manual). Clad it in stone veneer and caps. The fitter then sets the burner and key valve, connects the gas and leak-tests every joint.', why: 'Cross-ventilation lets any leaked gas escape before it can build up, and everything near the flame must be noncombustible (can’t burn).', tip: 'With propane, put vents low: propane is heavier than air and pools at the bottom. A soapy-water spray on each joint shows a leak as growing bubbles.', ok: 'The vents are open and unblocked, and the soap test shows no bubbles at any fitting.', v: { cam: [3.6, 1.8, 0.4], at: [2.05, 0.5, -2.25], hi: ['fireBox', 'fireClad', 'burner'], show: ['fireBox', 'fireClad', 'burner'], tool: { id: 'caulkGun', at: [1.2, 0.85, -2.0], rot: [0, 0, -70], scale: 1.3 } } },
        { t: 'Fire glass, light and furnish', d: 'Pour fire glass to the depth in the burner manual, usually about 1″ over the burner (a little more on natural gas). Light it as the manual says, then set the dining set under the pergola and lounge seating by the fire.', why: 'Too much glass chokes the flame and makes soot; too little leaves the burner exposed.', tip: 'Rinse new fire glass in a bucket first; the dust burns as a white film. A yellow, lazy flame that leaves soot usually means glass is too deep or the air mixer needs adjusting.', ok: 'The flame burns evenly along the whole trough with no sooty smoke and no gas smell.', v: { cam: [7.0, 4.2, 7.0], at: [0, 0.8, -0.4], hi: ['fireGlass', 'gasFlame', 'furniture'], show: ['fireGlass', 'gasFlame', 'furniture'] } },
      ],
      learn: {
        how: 'Porcelain pavers are dense, nearly waterproof and stain-resistant, but thin and stiff, so they rely on a flat, firm base rather than interlock. The pergola is its own structure on its own footings, and the gas fire wall is a vented, noncombustible box around a listed burner. Utilities run under the base first, then the surface goes on top.',
        specs: [['Porcelain thickness', '2 cm (¾″)'], ['Joint width', '4–5 mm (≈ 3/16″)'], ['Base', '6″ compacted in 2″ layers'], ['Bedding', '1″, pre-packed and screeded'], ['Row offset', '⅓ tile for 48″ tiles'], ['Pergola footings', 'Per maker’s drawings, below frost depth'], ['Gas pipe cover', '≥ 12″ (typical fuel gas code)'], ['Burner vents', '≥ 18 sq in each, opposite sides (typical)'], ['Fire glass', '≈ 1″ over the burner (check manual)']],
        terms: [['Large-format', 'Tiles 24″ or longer on a side.'], ['Running bond', 'Each row offset from the one before.'], ['Louvered roof', 'Rotating blades that open for sun or close against rain.'], ['Key valve', 'Gas shut-off valve opened with a removable key.'], ['Tracer wire', 'Wire buried with plastic gas pipe so it can be found later.']],
        mistakes: ['Plate-compacting porcelain.', 'Setting pergola posts on the pavers instead of footings.', 'Forgetting gas and power sleeves before the base goes in.', 'A fire enclosure with no vents.'],
        tips: ['Run a spare 2″ sleeve under the patio to each zone for future wiring.', 'A textured (R11) porcelain is much less slippery when wet.'],
      },
      pro: 'Always for the gas line and connection, the pergola footings if engineered, and wiring the pergola motor, lights and heaters. Many people also hire the porcelain install; it’s precise, heavy work.',
      tricks: [['Buy 10% extra from one lot', 'Porcelain colors shift between production runs; spares from the same lot make a cracked tile an easy swap later.'], ['Rent good suction lifters', 'Two-cup lifters let two people set a 48″ tile straight down without dragging the bedding; they’re cheap to rent and save your fingers.'], ['Lay out from the pergola, not the edge', 'Center the tile grid on the pergola or fire wall, since that’s where eyes go, and put the cuts at the outer edges.'], ['Sleeve everything', 'Run empty 2″ pipes under the base to each corner before laying tile; adding a wire later is then a 10-minute pull.'], ['Fix a rocking tile', 'Lift it with suction cups, scrape or add bedding under the high or low corner, and set it again; never shim with a stick or stone.'], ['Get the fire wall approved first', 'Ask the inspector to look at your vent openings before the veneer goes on; changing them after is a demolition job.']],
      refs: [['How to Install Porcelain Pavers on Gravel and Sand (TileBar)', 'https://www.tilebar.com/learn/how-to-install-porcelain-pavers-typical-installation-on-a-compact-gravel-and-sand-bed/'], ['Porcelain Pavers Installation Manual (MSI)', 'https://cdn.msisurfaces.com/files/flyers/porcelain-pavers-installation-manual.pdf'], ['CodeNotes: Underground Gas Piping (ICC)', 'https://www.iccsafe.org/building-safety-journal/bsj-dives/codenotes-underground-gas-piping-system-requirements-in-the-i-codes/'], ['Flex Linear Trough Burner Manual (HPC)', 'https://fireplacedoorsonline.com/images/companies/1/Images/HPC/HPC%20Fire%20Inserts/FPPK%20Flex%20Linear%20Trough.pdf']],
      addons: [patioAdd.shade, patioAdd.heaterIR, patioAdd.path].concat(pick(patio, ['rug', 'speaker'])),
    },
  ];
  patio.defaultVariant = 'classic';
  /* =====================================================================================
     RAISED GARDEN BED
     ===================================================================================== */

  // Starter: 4×4 ft corner-bracket kit bed plus three fabric grow bags.
  TB.model(
    'bedStarter',
    {
      cam: [2.6, 2.0, 2.8], at: [0, 0.2, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 8 },
      tex: ['forrest_ground_01', 'wood_planks'], assets: ['potted_plant_02', 'grass_medium_01', 'watering_can_metal_01', 'cardboard_box_01'],
      hidden: ['site', 'kit', 'corners', 'boards1', 'boards2', 'cardboard', 'soil', 'plants', 'bags', 'bagSoil', 'bagPlants', 'mulch', 'aoTower', 'aoSolar', 'aoSoaker', 'aoHoops'],
    },
    (K) => {
      const S = 1.22;
      const BX = -0.4;
      const bh = 0.14;
      const comp = K.std(0x7a6654, { roughness: 0.7 });
      const brk = K.std(0x26292c, { roughness: 0.6 });
      const site = K.part('site', [0, 0, 0], null, 'Level, sunny spot (6–8 hr sun)');
      paintRect(K, site, BX - S / 2 - 0.05, -S / 2 - 0.05, BX + S / 2 + 0.05, S / 2 + 0.05);
      K.box(site, [S, 0.008, S], K.pbr('forrest_ground_01', [1.5, 1.5], {}, 'dirt'), [BX, 0.004, 0], null, 0);
      const kit = K.part('kit', [0, 0, 0], null, 'Kit: 8 boards + 4 corner brackets');
      K.glb(kit, 'cardboard_box_01', { height: 0.25 }, [0.9, 0, 1.2], [0, 20, 0]) || K.box(kit, [0.5, 0.25, 0.4], 'woodLight', [0.9, 0.125, 1.2]);
      K.rep(4, (i) => K.box(kit, [S, 0.025, bh], comp, [-0.2, 0.0125 + (i % 2) * 0.026, 1.0 + Math.floor(i / 2) * 0.17], null, 0.004));
      K.rep(4, (i) => K.box(kit, [S, 0.025, bh], comp, [-0.2, 0.0125 + (i % 2) * 0.026, 1.4 + Math.floor(i / 2) * 0.17], null, 0.004));
      const corners = K.part('corners', [0, 0, 0], null, 'Corner brackets (stake into soil)');
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
        const x = BX + sx * (S / 2 - 0.03);
        const z = sz * (S / 2 - 0.03);
        K.box(corners, [0.07, 2 * bh + 0.04, 0.07], brk, [x, bh + 0.02, z], null, 0.008);
        K.box(corners, [0.08, 0.02, 0.08], brk, [x, 2 * bh + 0.05, z], null, 0.006);
        K.cyl(corners, [0.012, 0.004, 0.18, 8], brk, [x, -0.05, z]);
      });
      for (let c = 0; c < 2; c++) {
        const b = K.part('boards' + (c + 1), [0, c * bh + bh / 2 + 0.005, 0], null, c ? 'Second row of boards' : 'Bottom row of boards');
        K.box(b, [S - 0.1, bh - 0.004, 0.025], comp, [BX, 0, S / 2 - 0.03], null, 0.004);
        K.box(b, [S - 0.1, bh - 0.004, 0.025], comp, [BX, 0, -S / 2 + 0.03], null, 0.004);
        K.box(b, [0.025, bh - 0.004, S - 0.1], comp, [BX + S / 2 - 0.03, 0, 0], null, 0.004);
        K.box(b, [0.025, bh - 0.004, S - 0.1], comp, [BX - S / 2 + 0.03, 0, 0], null, 0.004);
      }
      const cb = K.part('cardboard', [BX, 0.012, 0], null, 'Cardboard liner (smothers grass)');
      K.box(cb, [S - 0.08, 0.006, S - 0.08], K.std(0xa9845a, { roughness: 1 }), [0, 0, 0], null, 0);
      K.box(cb, [S - 0.08, 0.008, 0.01], K.std(0x8a6a44), [0, 0.001, 0.1], null, 0);
      const soil = K.part('soil', [BX, 2 * bh - 0.03, 0], null, 'Raised-bed mix (≈ 10 cu ft)');
      K.box(soil, [S - 0.08, 0.02, S - 0.08], K.pbr('forrest_ground_01', [1.5, 1.5], {}, 'dirt'), [0, 0, 0], null, 0);
      const mulch = K.part('mulch', [BX, 2 * bh - 0.017, 0], null, 'Straw mulch (1–2″)');
      const straw = K.std(0xd8bf7a, { roughness: 1 });
      const rr = rng(4);
      for (let i = 0; i < 60; i++) K.box(mulch, [0.08, 0.004, 0.006], straw, [(rr() - 0.5) * (S - 0.15), 0.002, (rr() - 0.5) * (S - 0.15)], [0, rr() * 180, 0], 0);
      const plants = K.part('plants', [BX, 2 * bh - 0.02, 0], null, 'Square-foot planting (16 squares)');
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
          const x = -0.38 + i * 0.38;
          const z = -0.38 + j * 0.38;
          veg(K, plants, x, 0, z, (i + j) % 2 ? 'herb' : 'leafy', 1.2, i * 3 + j + 1);
        }
      const bagMat = K.std(0x2e2f31, { roughness: 1, side: THREE.DoubleSide });
      const bagPos = [[0.75, -0.5], [0.85, 0.05], [0.72, 0.6]];
      const bags = K.part('bags', [0, 0, 0], null, '10-gal fabric grow bags');
      bagPos.forEach(([x, z]) => {
        K.cyl(bags, [0.19, 0.18, 0.3, 28, true], bagMat, [x, 0.15, z]);
        K.cyl(bags, [0.18, 0.18, 0.006, 28], bagMat, [x, 0.003, z]);
        K.box(bags, [0.05, 0.08, 0.01], bagMat, [x + 0.19, 0.27, z], [0, 90, 0], 0);
        K.box(bags, [0.05, 0.08, 0.01], bagMat, [x - 0.19, 0.27, z], [0, 90, 0], 0);
      });
      const bs = K.part('bagSoil', [0, 0, 0], null, 'Potting mix');
      bagPos.forEach(([x, z]) => K.cyl(bs, [0.185, 0.185, 0.02, 24], K.pbr('forrest_ground_01', [0.4, 0.4], {}, 'dirt'), [x, 0.27, z]));
      const bp = K.part('bagPlants', [0, 0.28, 0], null, 'Tomato, pepper & herbs');
      bagPos.forEach(([x, z], i) => veg(K, bp, x, 0, z, 'tomato', 0.9 + i * 0.1, i + 7));
      K.glb(null, 'watering_can_metal_01', { height: 0.3 }, [-1.4, 0, 0.9], [0, 60, 0]);
      // add-ons
      const tw = K.part('aoTower', [BX, 2 * bh, 0.1], null, 'Obelisk tomato tower');
      const tm = K.std(0x2f4a3a, { metalness: 0.5, roughness: 0.5 });
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => K.bar(tw, [a * 0.2, -0.05, b * 0.2], [0, 1.5, 0], 0.008, tm));
      [0.35, 0.7, 1.05].forEach((y) => K.tor(tw, [0.2 * (1 - y / 1.55) * 1.41, 0.006, 360], tm, [0, y, 0], [90, 0, 45]));
      K.sph(tw, 0.03, tm, [0, 1.52, 0]);
      const sl = [];
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => sl.push([BX + a * (S / 2 + 0.2), b * (S / 2 + 0.2)]));
      AO.stakeLights(K, 'aoSolar', sl, 'Solar stake lights');
      const sk = K.part('aoSoaker', [BX, 2 * bh - 0.012, 0], null, 'Soaker hose + faucet timer');
      const pts = [];
      for (let i = 0; i <= 60; i++) {
        const a = i * 0.32;
        const r = 0.05 + i * 0.008;
        pts.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
      }
      K.tube(sk, pts, 0.008, K.std(0x2a2a2a, { roughness: 0.9 }));
      K.tube(sk, [[pts[60][0], 0, pts[60][2]], [S / 2 + 0.05, 0.05, 0.2], [S / 2 + 0.6, -0.2, -0.9]], 0.009, K.std(0x2e6b3a, { roughness: 0.6 }));
      K.box(sk, [0.1, 0.14, 0.06], K.std(0x2f6fde, { roughness: 0.4 }), [S / 2 + 0.6, -0.15, -0.92], null, 0.012);
      const hp = K.part('aoHoops', [BX, 2 * bh, 0], null, 'Hoops + insect netting');
      [-0.45, 0, 0.45].forEach((z) => K.tor(hp, [S / 2 - 0.06, 0.007, 180], K.std(0xf4f4f4, { roughness: 0.5 }), [0, 0, z], [0, 0, 0]));
      const rr2 = S / 2 - 0.05;
      const band = K.circle(0, 0, rr2, 24, 0, Math.PI).concat(K.circle(0, 0, rr2 - 0.004, 24, 0, Math.PI).reverse());
      K.ext(hp, band, S - 0.12, K.std(0xf8f8f4, { transparent: true, opacity: 0.35, roughness: 0.9, side: THREE.DoubleSide }), [0, 0, -(S - 0.12) / 2], [0, 0, 0]);
    }
  );

  // Showpiece: two tiered cedar beds with cap rails, a gravel path and an arch trellis between them.
  TB.model(
    'bedTiered',
    {
      cam: [3.8, 3.0, 4.4], at: [0, 0.6, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 10 },
      tex: ['wood_planks', 'forrest_ground_01', 'gravel_floor'], assets: ['potted_plant_02', 'shrub_04', 'grass_medium_01', 'watering_can_metal_01', 'painted_wooden_bench'],
      hidden: ['layout', 'dig', 'posts', 'lower1', 'lowerTop', 'cloth', 'upper', 'capRail', 'arch', 'soil', 'path', 'plants', 'climbers', 'aoDrip', 'aoSensor', 'aoSolar', 'aoBench'],
    },
    (K) => {
      const W = 1.22;
      const L = 2.44;
      const CX = 1.145;
      const bh = 0.14;
      const cedar = cedarMat(K);
      const cedarCap = K.pbr('wood_planks', [2, 0.3], { color: 0xc98f62 }, 'wood');
      const lay = K.part('layout', [0, 0, 0], null, 'Layout: two 4×8 beds, 3½ ft path');
      [-1, 1].forEach((s) => paintRect(K, lay, s * CX - W / 2, -L / 2, s * CX + W / 2, L / 2));
      paintRect(K, lay, -0.5, -L / 2 - 0.4, 0.5, L / 2 + 0.4, 0x2f6fde);
      const dig = K.part('dig', [0, 0.005, 0], null, 'Sod removed, leveled');
      K.box(dig, [2 * CX + W + 0.2, 0.01, L + 0.8], K.pbr('forrest_ground_01', [3, 3], {}, 'dirt'));
      const posts = K.part('posts', [0, 0, 0], null, '4×4 corner posts (lower tier)');
      const lower1 = K.part('lower1', [0, bh / 2, 0], null, 'Lower tier: bottom row of 2×6');
      const lowerTop = K.part('lowerTop', [0, 0, 0], null, 'Lower tier: rows 2 and 3');
      const cloth = K.part('cloth', [0, 0.012, 0], null, 'Hardware cloth + cardboard');
      const upper = K.part('upper', [0, 3 * bh, 0], null, 'Upper tier (2 rows, back half)');
      const cap = K.part('capRail', [0, 0, 0], null, '2×6 cap rails, mitered');
      const soil = K.part('soil', [0, 0, 0], null, 'Soil mix, both tiers');
      const plants = K.part('plants', [0, 0, 0], null, 'Vegetables & herbs');
      const sideBoards = (parent, cx, w, l, y) => {
        K.box(parent, [w, bh - 0.004, 0.038], cedar, [cx, y, l / 2 - 0.019]);
        K.box(parent, [w, bh - 0.004, 0.038], cedar, [cx, y, -l / 2 + 0.019]);
        K.box(parent, [0.038, bh - 0.004, l - 0.076], cedar, [cx + w / 2 - 0.019, y, 0]);
        K.box(parent, [0.038, bh - 0.004, l - 0.076], cedar, [cx - w / 2 + 0.019, y, 0]);
      };
      const capRect = (cx, w, l, y) => {
        K.box(cap, [w + 0.06, 0.025, 0.14], cedarCap, [cx, y, l / 2 - 0.02], null, 0.004);
        K.box(cap, [w + 0.06, 0.025, 0.14], cedarCap, [cx, y, -l / 2 + 0.02], null, 0.004);
        K.box(cap, [0.14, 0.025, l - 0.2], cedarCap, [cx + w / 2 - 0.02, y, 0], null, 0.004);
        K.box(cap, [0.14, 0.025, l - 0.2], cedarCap, [cx - w / 2 + 0.02, y, 0], null, 0.004);
      };
      [-1, 1].forEach((s) => {
        const cx = s * CX;
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => K.box(posts, [0.09, 3 * bh, 0.09], cedar, [cx + a * (W / 2 - 0.08), (3 * bh) / 2, b * (L / 2 - 0.08)]));
        sideBoards(lower1, cx, W, L, 0);
        sideBoards(lowerTop, cx, W, L, bh * 1.5);
        sideBoards(lowerTop, cx, W, L, bh * 2.5);
        K.box(cloth, [W - 0.08, 0.004, L - 0.08], K.std(0x9aa3ab, { metalness: 0.7, roughness: 0.4, wireframe: true }), [cx, 0, 0]);
        K.box(cloth, [W - 0.1, 0.004, L - 0.1], K.std(0xa9845a, { roughness: 1 }), [cx, 0.004, 0], null, 0);
        // upper tier on the outer half
        const ux = cx + s * (W / 4);
        sideBoards(upper, ux, W / 2, L - 0.3, bh / 2);
        sideBoards(upper, ux, W / 2, L - 0.3, bh * 1.5);
        capRect(cx, W, L, 3 * bh + 0.012);
        capRect(ux, W / 2, L - 0.3, 5 * bh + 0.012);
        const dirt = K.pbr('forrest_ground_01', [1.5, 2], {}, 'dirt');
        K.box(soil, [W / 2 - 0.04, 0.02, L - 0.1], dirt, [cx - s * (W / 4), 3 * bh - 0.04, 0], null, 0);
        K.box(soil, [W / 2 - 0.08, 0.02, L - 0.4], dirt, [ux, 5 * bh - 0.04, 0], null, 0);
        for (let i = 0; i < 4; i++) {
          const z = -0.9 + i * 0.6;
          veg(K, plants, cx - s * (W / 4), 3 * bh - 0.03, z, i % 2 ? 'herb' : 'leafy', 1.3, i + (s > 0 ? 10 : 20));
          if (i % 2) veg(K, plants, ux, 5 * bh - 0.03, z, 'tomato', 1, i + (s > 0 ? 30 : 40));
          else K.glb(plants, 'grass_medium_01', { node: 'grass_medium_01_mid_a_LOD0', height: 0.32 }, [ux, 5 * bh - 0.03, z]) || veg(K, plants, ux, 5 * bh - 0.03, z, 'herb', 1.4, i);
        }
      });
      const path = K.part('path', [0, 0.02, 0], null, 'Pea-gravel path over fabric');
      K.box(path, [2 * CX - W - 0.02, 0.03, L + 0.8], K.pbr('gravel_floor', [1, 3], { color: 0xd6c6ad }, 'stone'), [0, 0, 0], null, 0);
      // arch trellis spanning the path, legs inside each bed
      const arch = K.part('arch', [0, 0, 0], null, 'Arch trellis (cattle panel on cedar legs)');
      const aw = 0.62;
      const legTop = 1.55;
      const steel = K.std(0x4a4f45, { metalness: 0.6, roughness: 0.5 });
      [-1, 1].forEach((s) =>
        [-0.32, 0.32].forEach((z) => {
          K.box(arch, [0.05, legTop + 0.1, 0.05], cedar, [s * aw, legTop / 2 + 0.05, z], null, 0.004);
        })
      );
      for (let i = 0; i <= 6; i++) {
        const z = -0.3 + i * 0.1;
        K.tor(arch, [aw, 0.004, 180], steel, [0, legTop, z], [0, 0, 0]);
        [-1, 1].forEach((s) => K.bar(arch, [s * aw, 3 * bh, z], [s * aw, legTop, z], 0.004, steel));
      }
      for (let k = 0; k <= 12; k++) {
        const a = (k / 12) * Math.PI;
        K.bar(arch, [Math.cos(a) * aw, legTop + Math.sin(a) * aw, -0.32], [Math.cos(a) * aw, legTop + Math.sin(a) * aw, 0.32], 0.004, steel);
      }
      [0.6, 0.9, 1.2].forEach((y) => [-1, 1].forEach((s) => K.bar(arch, [s * aw, y, -0.32], [s * aw, y, 0.32], 0.004, steel)));
      const cl = K.part('climbers', [0, 0, 0], null, 'Beans & cucumbers on the arch');
      const leaf = K.std(0x2c5a1f, { roughness: 0.9 });
      const leaf2 = K.std(0x3d7329, { roughness: 0.9 });
      const rr = rng(12);
      for (let i = 0; i < 120; i++) {
        const side = i % 2 ? 1 : -1;
        const t = rr();
        let x, y;
        if (t < 0.55) {
          x = side * aw;
          y = 0.5 + t * 1.9;
        } else {
          const a = ((t - 0.55) / 0.45) * (Math.PI / 2);
          x = side * Math.cos(a) * aw;
          y = legTop + Math.sin(a) * aw;
        }
        K.sph(cl, 0.035 + rr() * 0.025, i % 3 ? leaf : leaf2, [x + (rr() - 0.5) * 0.08, y, (rr() - 0.5) * 0.62], [1, 0.6, 1.2]);
      }
      K.glb(null, 'watering_can_metal_01', { height: 0.3 }, [0.25, 0.035, 1.45], [0, -30, 0]);
      // add-ons
      const drip = K.part('aoDrip', [0, 0, 0], null, 'Drip lines + Wi-Fi faucet timer');
      [-1, 1].forEach((s) => {
        const cx = s * CX;
        K.cyl(drip, [0.008, 0.008, L - 0.2, 8], 'black', [cx - s * (W / 4), 3 * bh - 0.025, 0], [90, 0, 0]);
        K.cyl(drip, [0.008, 0.008, L - 0.5, 8], 'black', [cx + s * (W / 4), 5 * bh - 0.025, 0], [90, 0, 0]);
      });
      K.tube(drip, [[-CX, 0.05, -L / 2 - 0.05], [0, 0.03, -L / 2 - 0.15], [CX, 0.05, -L / 2 - 0.05]], 0.009, 'black');
      K.tube(drip, [[0, 0.03, -L / 2 - 0.15], [0, 0.03, -L / 2 - 0.8]], 0.009, 'black');
      K.box(drip, [0.1, 0.14, 0.06], K.std(0x2f6fde, { roughness: 0.4 }), [0, 0.07, -L / 2 - 0.85], null, 0.012);
      AO.sensor(K, 'aoSensor', [-CX - W / 4, 3 * bh - 0.03, 0.3]);
      const sol = K.part('aoSolar', [0, 0, 0], null, 'Solar post-cap lights');
      [-1, 1].forEach((s) =>
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => {
          const x = s * CX + a * (W / 2 - 0.02);
          const z = b * (L / 2 - 0.02);
          K.box(sol, [0.1, 0.05, 0.1], blackMetal(K), [x, 3 * bh + 0.06, z], null, 0.006);
          K.box(sol, [0.08, 0.02, 0.08], glow(K, 0xfff1cc, 1.1), [x, 3 * bh + 0.03, z], null, 0.004);
        })
      );
      AO.bench(K, 'aoBench', [0, 0.035, -L / 2 - 0.5], 0, 'Garden bench at the path end');
    }
  );

  // Luxury: U-shaped corten-steel beds around a decomposed-granite courtyard with seating ledges, drip and lighting.
  TB.model(
    'bedCorten',
    {
      cam: [5.0, 4.0, 5.8], at: [0, 0.5, -0.5], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 12, radius: 11 },
      tex: ['rusty_metal', 'forrest_ground_01', 'gravel_floor', 'wood_floor_deck', 'pine_bark'], assets: ['shrub_02', 'shrub_04', 'grass_medium_01', 'potted_plant_02', 'outdoor_table_chair_set_01'],
      hidden: ['layout', 'grade', 'beds', 'braces', 'supply', 'wire', 'fill', 'soil', 'drip', 'ledges', 'ledgeLights', 'lights', 'transformer', 'plants', 'dg', 'aoSensor', 'aoString', 'aoSpeaker', 'aoCover'],
    },
    (K) => {
      const H = 0.76;
      const t = 0.012;
      const rust = K.bumpy(0x8b4a2b, TB.tex.speckle(), 0.006, { roughness: 0.85, metalness: 0.25 });
      const beds = [
        { x0: -2.7, x1: 2.7, z0: -2.2, z1: -1.3 },
        { x0: -2.7, x1: -1.8, z0: -1.25, z1: 1.0 },
        { x0: 1.8, x1: 2.7, z0: -1.25, z1: 1.0 },
      ];
      const lay = K.part('layout', [0, 0, 0], null, 'Layout: U of beds around a courtyard');
      beds.forEach((b) => paintRect(K, lay, b.x0, b.z0, b.x1, b.z1));
      paintRect(K, lay, -1.8, -1.3, 1.8, 1.6, 0x2f6fde);
      const grade = K.part('grade', [0, 0.005, 0], null, 'Graded & compacted pad');
      K.box(grade, [5.8, 0.01, 4.2], K.pbr('forrest_ground_01', [4, 3], {}, 'dirt'), [0, 0, -0.5]);
      const bedP = K.part('beds', [0, 0, 0], null, 'Corten steel beds, 30″ tall');
      const brace = K.part('braces', [0, 0, 0], null, 'Internal cross braces');
      const fill = K.part('fill', [0, 0, 0], null, 'Bottom: logs & branches (hugel layer)');
      const soil = K.part('soil', [0, 0, 0], null, 'Raised-bed soil mix');
      const drip = K.part('drip', [0, 0, 0], null, 'Inline drip lines, 12″ apart');
      const dirt = K.pbr('forrest_ground_01', [2, 1], {}, 'dirt');
      const bark = K.pbr('pine_bark', [1, 2], {}, 'bark');
      const rr = rng(31);
      beds.forEach((b) => {
        const w = b.x1 - b.x0;
        const d = b.z1 - b.z0;
        const cx = (b.x0 + b.x1) / 2;
        const cz = (b.z0 + b.z1) / 2;
        K.box(bedP, [w, H, t], rust, [cx, H / 2, b.z0 + t / 2], null, 0);
        K.box(bedP, [w, H, t], rust, [cx, H / 2, b.z1 - t / 2], null, 0);
        K.box(bedP, [t, H, d - 2 * t], rust, [b.x0 + t / 2, H / 2, cz], null, 0);
        K.box(bedP, [t, H, d - 2 * t], rust, [b.x1 - t / 2, H / 2, cz], null, 0);
        // rolled top lip
        K.box(bedP, [w + 0.02, 0.025, 0.035], rust, [cx, H, b.z0 + 0.01], null, 0.008);
        K.box(bedP, [w + 0.02, 0.025, 0.035], rust, [cx, H, b.z1 - 0.01], null, 0.008);
        K.box(bedP, [0.035, 0.025, d], rust, [b.x0 + 0.01, H, cz], null, 0.008);
        K.box(bedP, [0.035, 0.025, d], rust, [b.x1 - 0.01, H, cz], null, 0.008);
        const long = w > d;
        const n = Math.max(1, Math.floor((long ? w : d) / 1.2));
        for (let i = 1; i <= n; i++) {
          const f = i / (n + 1);
          if (long) K.bar(brace, [b.x0 + f * w, H * 0.6, b.z0], [b.x0 + f * w, H * 0.6, b.z1], 0.008, 'steel');
          else K.bar(brace, [b.x0, H * 0.6, b.z0 + f * d], [b.x1, H * 0.6, b.z0 + f * d], 0.008, 'steel');
        }
        for (let i = 0; i < Math.round(w * d * 5); i++) {
          const g = K.group(fill, [b.x0 + 0.1 + rr() * (w - 0.2), 0.08 + rr() * 0.2, b.z0 + 0.1 + rr() * (d - 0.2)], [0, rr() * 180, 90]);
          K.cyl(g, [0.05, 0.06, Math.min(0.6, Math.min(w, d) - 0.15), 10], bark);
        }
        K.box(fill, [w - 0.03, 0.02, d - 0.03], K.std(0x5b4632, { roughness: 1 }), [cx, 0.35, cz], null, 0);
        K.box(soil, [w - 0.03, 0.02, d - 0.03], dirt, [cx, H - 0.06, cz], null, 0);
        const lines = long ? [b.z0 + 0.3, b.z1 - 0.3] : [b.x0 + 0.3, b.x1 - 0.3];
        lines.forEach((c) => {
          if (long) K.cyl(drip, [0.007, 0.007, w - 0.2, 8], 'black', [cx, H - 0.045, c], [0, 0, 90]);
          else K.cyl(drip, [0.007, 0.007, d - 0.2, 8], 'black', [c, H - 0.045, cz], [90, 0, 0]);
        });
      });
      // supply: standpipe with backflow, filter, Wi-Fi timer and a 3-zone manifold
      const sup = K.part('supply', [0, 0, 0], null, 'Supply: backflow, filter, regulator, Wi-Fi timer');
      K.cyl(sup, [0.02, 0.02, 0.7, 12], 'copper', [3.0, 0.35, -2.5]);
      K.cyl(sup, [0.03, 0.03, 0.1, 12], 'brass', [3.0, 0.72, -2.5], [90, 0, 0]);
      K.box(sup, [0.12, 0.16, 0.07], K.std(0x2f6fde, { roughness: 0.4 }), [3.0, 0.55, -2.42], null, 0.012);
      K.box(sup, [0.06, 0.04, 0.004], 'screen', [3.0, 0.58, -2.385], null, 0);
      K.cyl(sup, [0.025, 0.025, 0.1, 12], K.std(0xdedede, { transparent: true, opacity: 0.7 }), [3.0, 0.4, -2.42]);
      K.tube(sup, [[3.0, 0.05, -2.45], [2.85, 0.02, -2.35], [-2.6, 0.02, -2.35]], 0.012, 'black');
      [-2.2, 0, 2.2].forEach((x) => K.tube(sup, [[x, 0.02, -2.35], [x, 0.1, -2.25], [x, H - 0.05, -2.18]], 0.009, 'black'));
      const wire = K.part('wire', [0, 0, 0], null, 'Low-voltage cable (buried 6″)');
      K.tube(wire, [[3.1, 0.6, -2.7], [3.1, 0.02, -2.6], [2.9, 0.02, 1.2], [-2.9, 0.02, 1.2], [-2.9, 0.02, -2.6]], 0.008, K.std(0x3a3a3a));
      const tr = K.part('transformer', [3.1, 0.62, -2.72], null, 'Smart low-voltage transformer on post');
      K.box(tr, [0.09, 1.2, 0.09], K.std(0x2a2c2e, { roughness: 0.6 }), [0, -0.02, -0.08], null, 0.006);
      K.box(tr, [0.22, 0.28, 0.12], K.std(0x2b2e31, { metalness: 0.5, roughness: 0.4 }), [0, 0.0, 0.0], null, 0.01);
      K.sph(tr, 0.008, 'ledB', [0.06, 0.08, 0.062]);
      // seating ledges on the inner faces
      const ipe = K.pbr('wood_floor_deck', [2, 0.3], { color: 0x9a6a48 }, 'woodDark');
      const led = K.part('ledges', [0, H + 0.02, 0], null, 'Ipe seating ledges (14″ deep)');
      K.box(led, [3.6, 0.04, 0.36], ipe, [0, 0, -1.3 + 0.08], null, 0.006);
      K.box(led, [0.36, 0.04, 2.25], ipe, [-1.8 + 0.08, 0, -0.13], null, 0.006);
      K.box(led, [0.36, 0.04, 2.25], ipe, [1.8 - 0.08, 0, -0.13], null, 0.006);
      const ll = K.part('ledgeLights', [0, H - 0.005, 0], null, 'LED strip under the ledges');
      const strip = glow(K, 0xffd9a0, 2);
      K.box(ll, [3.5, 0.008, 0.015], strip, [0, 0, -1.3 + 0.24], null, 0);
      K.box(ll, [0.015, 0.008, 2.15], strip, [-1.8 + 0.24, 0, -0.13], null, 0);
      K.box(ll, [0.015, 0.008, 2.15], strip, [1.8 - 0.24, 0, -0.13], null, 0);
      const pll = new THREE.PointLight(0xffd59a, 0.8, 3, 2);
      pll.position.set(0, -0.3, -0.6);
      ll.add(pll);
      const lights = K.part('lights', [0, 0, 0], null, 'Spike spotlights in the beds');
      const m = blackMetal(K);
      [[-2.25, -0.2], [2.25, -0.2], [-1.0, -1.75], [1.0, -1.75]].forEach(([x, z]) => {
        const g = K.group(lights, [x, H - 0.05, z], [0, 0, 0]);
        K.cyl(g, [0.01, 0.01, 0.1, 8], m, [0, 0.05, 0]);
        const h = K.group(g, [0, 0.12, 0], [-30, 0, 0]);
        K.cyl(h, [0.03, 0.026, 0.09, 16], m, [0, 0, 0], [90, 0, 0]);
        K.cyl(h, [0.026, 0.026, 0.004, 16], glow(K, 0xfff4dc, 2), [0, 0, 0.047], [90, 0, 0]);
      });
      const dg = K.part('dg', [0, 0.02, -0.15], null, 'Stabilized decomposed-granite courtyard');
      K.box(dg, [3.55, 0.04, 2.25], K.pbr('gravel_floor', [3, 2], { color: 0xd8b98a }, 'stone'), [0, 0, 0], null, 0);
      K.box(dg, [3.55, 0.04, 0.6], K.pbr('gravel_floor', [3, 1], { color: 0xd8b98a }, 'stone'), [0, 0, 1.4], null, 0);
      chairs(K, dg, [[-0.6, 0.02, 0.4, 160], [0.6, 0.02, 0.4, -160]]);
      const plants = K.part('plants', [0, H - 0.05, 0], null, 'Vegetables, herbs & ornamental grasses');
      for (let i = 0; i < 7; i++) {
        const x = -2.3 + i * 0.77;
        if (i % 2) K.glb(plants, 'shrub_04', { height: 0.5 }, [x, 0, -1.75], [0, i * 40, 0]) || veg(K, plants, x, 0, -1.75, 'herb', 2, i);
        else veg(K, plants, x, 0, -1.75, 'tomato', 1.1, i + 50);
      }
      [-2.25, 2.25].forEach((x) =>
        [-0.8, -0.3, 0.2, 0.7].forEach((z, j) => (j === 1 ? K.glb(plants, 'grass_medium_01', { node: 'grass_medium_01_tall_b_LOD0', height: 0.45 }, [x, 0, z]) : null) || veg(K, plants, x, 0, z, j % 2 ? 'herb' : 'leafy', 1.5, j + (x > 0 ? 60 : 70)))
      );
      // add-ons
      AO.sensor(K, 'aoSensor', [-2.3, H - 0.06, 0.35]);
      AO.stringLights(K, 'aoString', [[-1.7, -1.15], [1.7, -1.15], [1.7, 1.6], [-1.7, 1.6]], 2.5, true);
      AO.speaker(K, 'aoSpeaker', [1.3, 0.04, 1.4]);
      const cov = K.part('aoCover', [0, H, -1.75], null, 'Hoops + frost cloth (back bed)');
      for (let i = 0; i < 5; i++) K.tor(cov, [0.4, 0.007, 180], K.std(0xf4f4f4, { roughness: 0.5 }), [-2.2 + i * 1.1, 0, 0], [0, 90, 0]);
      const band = K.circle(0, 0, 0.41, 24, 0, Math.PI).concat(K.circle(0, 0, 0.405, 24, 0, Math.PI).reverse());
      K.ext(cov, band, 4.6, K.std(0xf8f8f4, { transparent: true, opacity: 0.35, roughness: 0.9, side: THREE.DoubleSide }), [-2.3, 0, 0], [0, 90, 0]);
    }
  );

  const bed = TB.repair('backyard', 'garden-bed');
  const bedAdd = {
    tower: ao({ id: 'tower', part: 'aoTower', name: 'Obelisk tomato tower', cat: 'Garden', blurb: 'Steel obelisk that holds up tomatoes or climbing beans.', cost: [25, 70], how: 'Push the legs 6–8″ into the soil at planting time, before roots spread, and tie stems to it loosely as they grow.', needs: ['Steel garden obelisk (5 ft)', 'Soft plant ties'], shop: 'Garden obelisk trellis' }),
    solar: ao({ id: 'solar', part: 'aoSolar', name: 'Solar stake lights', cat: 'Lighting', blurb: 'A glow at each corner, no wiring.', cost: [25, 70], how: 'Push them in a foot outside each corner where they get afternoon sun.', needs: ['4 solar stake lights'], shop: 'Solar path lights' }),
    soaker: ao({ id: 'soaker', part: 'aoSoaker', name: 'Soaker hose + timer', cat: 'Tech', blurb: 'A coiled soaker hose on a battery timer waters at the roots.', cost: [30, 70], how: 'Coil the hose 8–12″ apart across the bed under the mulch and set the timer for 20–30 minutes early in the morning.', needs: ['25 ft soaker hose', 'Battery faucet timer', 'Pressure regulator (25 psi)'], shop: 'Soaker hose faucet timer' }),
    hoops: ao({ id: 'hoops', part: 'aoHoops', name: 'Hoops + insect netting', cat: 'Garden', blurb: 'Keeps cabbage moths, birds and cats off seedlings.', cost: [20, 50], how: 'Push hoops inside the frame every 18″ and drape fine netting over them, weighing the edges with bricks or clips.', needs: ['3 garden hoops', 'Insect netting', 'Clips'], shop: 'Garden hoops insect netting' }),
    bench: ao({ id: 'bench', part: 'aoBench', name: 'Garden bench', cat: 'Comfort', blurb: 'A seat at the end of the path, facing the arch.', cost: [150, 450], how: 'Set it on two pavers so the legs stay out of wet gravel.', needs: ['Outdoor bench', '2 pavers'], shop: 'Outdoor garden bench' }),
    string: ao({ id: 'string', part: 'aoString', name: 'Café string lights', cat: 'Lighting', blurb: 'Four posts and warm bulbs over the courtyard.', cost: [150, 350], how: 'Set posts in concrete at the courtyard corners, run a guide wire, and clip the lights to it with a gentle sag. Plug into a GFCI outlet or the transformer’s 120 V outlet.', needs: ['4×4 posts', 'LED string lights', 'Guide wire kit', 'Concrete'], shop: 'Outdoor LED string lights' }),
    speaker: ao({ id: 'speaker', part: 'aoSpeaker', name: 'Rock speaker', cat: 'Tech', blurb: 'Weatherproof speaker that hides among the plants.', cost: [80, 250], how: 'Low-voltage landscape speakers can share the lighting cable trench; Bluetooth models just need charging.', needs: ['Outdoor speaker'], shop: 'Outdoor rock speaker' }),
    cover: ao({ id: 'cover', part: 'aoCover', name: 'Hoops + frost cloth', cat: 'Garden', blurb: 'Stretch the season 4–6 weeks on the back bed.', cost: [30, 80], how: 'Clip hoops to the inside of the steel walls and drape frost cloth over them on cold nights.', needs: ['5 steel hoops', 'Frost cloth', 'Clips'], shop: 'Garden hoops frost cloth' }),
  };
  bed.variants = [
    {
      id: 'starter',
      name: 'Starter: 4×4 kit bed + grow bags',
      blurb: 'A snap-together corner-bracket bed and three fabric grow bags. Up in an hour, no saw needed.',
      level: 1,
      time: '1–2 hrs',
      cost: '$60–150',
      model: 'bedStarter',
      summary: 'The easiest way to start growing food: a 4 × 4 ft snap-together kit bed about 11″ deep, lined with cardboard and filled with raised-bed mix, plus three 10-gallon fabric grow bags for tomatoes and peppers. No saw, no screws, done in an afternoon.',
      intro: { show: ['site', 'corners', 'boards1', 'boards2', 'soil', 'mulch', 'plants', 'bags', 'bagSoil', 'bagPlants'], spin: true, preview: true },
      safety: ['Bagged soil weighs 30–50 lb: lift with your legs, or have it delivered to the spot.', 'Wear gloves when handling soil and compost, and wash your hands before eating.', 'Make sure the kit is food-safe: untreated cedar, composite or powder-coated metal, never old railroad ties or painted scrap wood.'],
      causes: [['Sun', '6–8 hours of direct sun for fruiting crops like tomatoes and peppers; 4–6 hours is enough for lettuce and herbs.'], ['Size', '4 × 4 ft gives 16 one-foot squares, and you can reach the middle from any side without stepping on the soil.'], ['Bags or bed?', 'Grow bags give deep, warm roots for tomatoes and peppers and can be moved to chase the sun.'], ['How much soil', 'The bed takes about 13–15 cu ft (roughly eight to ten 1.5 cu ft bags). Each 10-gal bag takes about 1.3 cu ft of potting mix.']],
      tools: ['4 × 4 ft raised-bed kit (boards + corner brackets)', 'Rubber mallet', '2 ft or 4 ft level', 'Flat spade or sod cutter', 'Plain brown cardboard (tape and labels removed)', 'Raised-bed soil mix (≈ 13–15 cu ft)', 'Three 10-gal fabric grow bags', 'Potting mix (≈ 4 cu ft)', 'Straw or shredded-leaf mulch', 'Trowel, hose & watering can'],
      steps: [
        { t: 'Pick the spot', d: 'Choose a level spot with 6–8 hours of direct sun, close enough for a hose to reach. Mark a 4 × 4 ft square and slice off the grass or pull the weeds inside it.', why: 'Sunlight is the plant’s food factory, so sun decides your harvest more than anything else, and a nearby hose means you’ll actually water.', tip: 'Check the spot at 9 am, noon and 3 pm on a sunny day and snap a photo each time; if it’s shaded in two of the three, pick a different spot.', ok: 'The square is clear of grass, and your photos show it in full sun for most of the day.', v: { cam: [2.6, 2.4, 2.8], at: [-0.4, 0, 0], hi: ['site'], show: ['site'], tool: { id: 'tape', at: [0.25, 0.02, 0.66], rot: [0, 0, 0], scale: 1.4 } } },
        { t: 'Unpack the kit', d: 'Lay out all the boards and corner brackets on the grass and count them against the parts list in the instructions.', why: 'Finding a missing bracket now beats finding it with half a bed assembled.', tip: 'If a part is missing or cracked, photograph it next to the parts list and email the seller; most ship replacements free. Don’t substitute wood screws into plastic brackets.', ok: 'Every part on the list is in front of you, with no cracked brackets.', v: { cam: [2.2, 2.0, 3.4], at: [0, 0.05, 1.1], hi: ['kit'], show: ['kit'] } },
        { t: 'Set the corners and bottom row', d: 'Stand a corner bracket at each corner of the square and slide the bottom boards into their slots. Tap each board down with the rubber mallet until it seats fully in the bracket.', why: 'Fully seated bottom boards rest on the ground, so soil can’t leak out under the frame.', tip: 'Tap on the top of the board, not the bracket, and use a scrap of wood between the mallet and board if it’s soft cedar. If a board won’t go in, check you have it the right way up; many have a tongue on top.', ok: 'You hear a dull thud change to a solid knock as each board bottoms out, and there’s no gap between the boards and the ground.', v: { cam: [2.2, 1.6, 2.4], at: [-0.4, 0.1, 0], hi: ['corners', 'boards1'], show: ['corners', 'boards1'], hide: ['kit'], tool: { id: 'hammer', at: [0.15, 0.17, 0.3], rot: [0, -30, 0], anim: 'tap', scale: 1.4 } } },
        { t: 'Add the second row and level', d: 'Stack the second row of boards into the brackets. Lay the level across the top in both directions; dig a little soil from under the high corner or push it down until the bubble centers.', why: 'A level bed waters evenly; a tilted one drains to the low side and dries out on the high side.', tip: 'Level now while it’s empty: once full, a bed weighs over half a ton and won’t budge. If the ground slopes a lot, dig the uphill side in instead of propping up the downhill side.', ok: 'The bubble sits between the lines along every side and across both diagonals.', v: { cam: [2.2, 1.8, 2.4], at: [-0.4, 0.2, 0], hi: ['boards2'], show: ['boards2'], tool: { id: 'level', at: [-0.4, 0.3, 0.58], rot: [0, 0, 0], scale: 1.2 } } },
        { t: 'Line with cardboard', d: 'Pull off any tape and labels, then lay plain brown cardboard over the whole bottom, overlapping the edges 6″ so no grass shows. Soak it with the hose until it’s limp.', why: 'Wet cardboard blocks light so the grass underneath dies, then it rots into the soil within a season and lets worms move up.', tip: 'Two layers are better than one for tough grass. Avoid shiny printed boxes; they have plastic coatings that don’t break down.', ok: 'No green shows anywhere through the cardboard, and it feels soft and soggy.', v: { cam: [1.6, 2.4, 1.6], at: [-0.4, 0.05, 0], hi: ['cardboard'], show: ['cardboard'] } },
        { t: 'Fill the bed', d: 'Empty the raised-bed mix in, raking it level. Every 3–4″, water it well to settle it. Stop about 1″ below the top of the boards.', why: 'Bagged raised-bed mix is light and drains well; watering as you fill settles it now so it doesn’t sink 2–3″ after the first rain.', tip: 'Cut the bags open on the bed and lift from the bottom so it pours out; it saves scooping. Clumps of dry peat that shed water just need a few minutes of slow sprinkling.', ok: 'The soil feels evenly moist when you squeeze a handful (it holds together, then crumbles) and sits about 1″ below the rim.', v: { cam: [2.4, 2.2, 2.6], at: [-0.4, 0.2, 0], hi: ['soil'], show: ['soil'], tool: { id: 'shovel', at: [0.4, 0.05, 0.9], rot: [20, 40, -20], anim: 'push' } } },
        { t: 'Fill the grow bags', d: 'Set the bags on level ground near the bed, ideally on gravel or pavers. Fill them with potting mix, not garden soil, to 2″ below the rim, watering halfway up.', why: 'Potting mix stays fluffy and drains in a container; garden soil packs down hard and suffocates roots.', tip: 'Put the bags in their final spot before filling; a full 10-gal bag weighs 40–60 lb wet. Fold the top edge down once if the bag stands up floppy.', ok: 'Each bag stands upright on its own, and the mix is moist all the way down when you push a finger in.', v: { cam: [2.4, 1.6, 2.2], at: [0.8, 0.15, 0], hi: ['bags', 'bagSoil'], show: ['bags', 'bagSoil'] } },
        { t: 'Plant and mulch', d: 'Plant one tomato or pepper per bag, burying tomatoes deeper than they came. Fill the bed in a 1 ft grid (check the plant tags for how many per square). Water deeply, then spread 1–2″ of straw around the plants.', why: 'Tomato stems grow new roots where they’re buried. Mulch keeps soil evenly moist and can cut watering by about a third.', tip: 'Keep straw an inch away from stems so they stay dry. If a seedling wilts on day one, shade it with a lawn chair for an afternoon; it’s transplant shock and usually passes.', ok: 'Seedlings stand upright the next morning and the soil under the mulch is damp to your second knuckle.', v: { cam: [2.6, 2.0, 2.8], at: [0, 0.25, 0], hi: ['plants', 'bagPlants', 'mulch'], show: ['plants', 'bagPlants', 'mulch'] } },
      ],
      learn: {
        how: 'A kit bed is a frame that holds loose, rich soil above the ground, so roots get air and drainage even over hard clay. Fabric grow bags breathe through their sides: when a root tip hits the air at the wall it stops and branches, which “air-prunes” the roots into a dense, healthy ball instead of circling.',
        specs: [['Bed size', '4 × 4 ft, ≈ 11″ deep'], ['Soil for the bed', '≈ 13–15 cu ft'], ['Grow bag', '10 gal (≈ 1.3 cu ft) per tomato'], ['Sun', '6–8 hr for fruiting crops'], ['Mulch', '1–2″ straw'], ['Watering', '≈ 1″ of water a week, more in heat']],
        terms: [['Square-foot gardening', 'Planting in a 1 ft grid with a set number of plants per square.'], ['Air pruning', 'Roots stop growing when they hit air at the bag wall, then branch.'], ['Raised-bed mix', 'A bagged blend of compost, topsoil or peat and bark that drains well.'], ['Transplant shock', 'Temporary wilting after moving a seedling.']],
        mistakes: ['Filling grow bags with garden soil.', 'Setting the bed in part shade.', 'Letting grow bags dry out in midsummer heat (check daily).'],
        tips: ['Group the grow bags so they shade each other’s sides on hot days.'],
      },
      pro: 'Rarely needed. Call a landscaper if the only sunny spot is on a slope that needs terracing.',
      tricks: [['The finger test', 'Push a finger into the soil to the second knuckle; water only when it’s dry there. It beats watering on a schedule.'], ['Buy bulk if you’ll build more', 'Bagged mix is easy for one bed; for two or more, a cubic yard delivered from a garden center is usually cheaper.'], ['Saucer-free bags on pavers', 'Set grow bags on pavers or gravel, not straight on grass, so they drain and don’t kill a square of lawn.'], ['Top up every spring', 'Soil shrinks as it breaks down. Add 1–2″ of compost each spring instead of replacing it.'], ['Stake tomatoes on day one', 'Push the cage or stake in at planting time; doing it later tears roots.'], ['Wilting at noon is normal', 'Leaves often droop on a hot afternoon and recover by evening. If they’re still limp in the morning, water.']],
      refs: [['Starting Raised Beds (UConn Home & Garden Education Center)', 'https://homegarden.cahnr.uconn.edu/?p=19122'], ['Quick and Easy Raised Bed Design (Penn State Extension)', 'https://extension.psu.edu/quick-and-easy-raised-bed-design-for-urban-growers'], ['Simple Raised Garden Bed on a Budget (Univ. of Arkansas Extension)', 'https://www.uaex.uada.edu/yard-garden/vegetables/docs/Simple%20Raised%20Garden%20Bed%20on%20a%20Budget.pdf']],
      addons: [bedAdd.tower, bedAdd.solar, bedAdd.soaker, bedAdd.hoops],
    },
    { id: 'classic', name: 'Classic: 4×8 cedar bed', blurb: 'A 4 × 8 ft cedar bed, three boards high, with corner posts.', level: 1, time: '3–4 hrs', cost: '$120–300' },
    {
      id: 'showpiece',
      name: 'Showpiece: tiered beds + arch trellis',
      blurb: 'Two tiered cedar beds with cap rails, a gravel path between them and an arch you walk under.',
      level: 2,
      time: '2–3 days',
      cost: '$700–1,500',
      model: 'bedTiered',
      summary: 'A kitchen-garden centerpiece: two 4 × 8 ft cedar beds, each with a raised back tier, mitered cap rails you can sit on, a pea-gravel path between them, and a 7 ft cattle-panel arch over the path for beans and cucumbers to climb.',
      intro: { show: ['posts', 'lower1', 'lowerTop', 'upper', 'capRail', 'arch', 'soil', 'path', 'plants', 'climbers'], spin: true, preview: true },
      safety: ['Use untreated cedar or redwood for anything touching soil. Many extension services accept modern pressure-treated lumber, but untreated cedar avoids the question entirely.', 'Cattle panel (heavy welded-wire livestock fencing) is springy with sharp cut ends: wear gloves and eye protection and have a helper when bending it.', 'Wear eye protection when cutting, hearing protection with a miter saw, and keep fingers 6″ from the blade.', 'Call 811 (the free “call before you dig” line) before driving T-posts.'],
      causes: [['Layout', 'Beds 4 ft wide, path 3–3½ ft so a wheelbarrow fits.'], ['Tiers', 'The back tier adds 11″ of soil (27½″ total) for carrots and potatoes and puts tall plants behind short ones.'], ['Arch', 'Run the path north–south if you can, so the arch’s shadow sweeps across the path instead of sitting on one bed all day.'], ['Soil', 'Both beds take about 4½ cubic yards; order it delivered in bulk.']],
      tools: ['Miter saw or circular saw + speed square', 'Drill/driver, ⅛″ drill bit & 3″ exterior deck or structural screws', 'Cedar 2×6 (≈ 36 boards, 8 ft)', 'Cedar 4×4 (for corner posts) & 2×4 (for cleats)', '½″ hardware cloth & heavy staples', 'Woven landscape fabric + pea gravel (≈ 1 yd³)', 'One 16 ft × 50″ cattle panel', 'Four 6 ft steel T-posts + post driver', 'Bolt cutters, zip ties & fence clips', 'Level, framing square & tape', 'Soil mix (≈ 4½ yd³)'],
      steps: [
        { t: 'Lay out the beds and path', d: 'Mark two 4 × 8 ft rectangles side by side with a 3½ ft path between them, using stakes and string. Check that each rectangle’s diagonals match and that the path is the same width at both ends.', why: 'An even path width is what makes the arch fit and the whole garden look built in.', tip: 'Cut a scrap stick exactly 3½ ft long and use it as a spacer at both ends of the path; it’s faster and more accurate than a tape.', ok: 'Each rectangle’s diagonals match within ½″ and the spacer stick fits snugly at both ends of the path.', v: { cam: [3.6, 3.4, 4.0], at: [0, 0, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [0.5, 0.02, 1.6], rot: [0, 90, 0], scale: 1.4 } } },
        { t: 'Strip sod and level', d: 'Slice the sod off under both beds and the path with a flat spade. Rake the ground smooth and level, cutting high spots rather than piling soil on low ones, then tamp it firm.', why: 'Grass left under the path grows up through the gravel, and level ground keeps the bed walls from twisting.', tip: 'Lay a straight 8 ft board with a level on top across the area; shave down wherever the bubble runs away from. Flip removed sod upside down in the compost pile.', ok: 'A level on a long board reads level across both bed areas, and no grass roots remain.', v: { cam: [3.6, 3.2, 4.0], at: [0, 0, 0], hi: ['dig'], show: ['dig'], hide: ['layout'], tool: { id: 'shovel', at: [1.2, 0.02, 0.9], rot: [10, 40, -15], anim: 'push' } } },
        { t: 'Build the lower frames', d: 'Cut eight 16½″ corner posts from 4×4. Cut the end boards 45″ long. Drill ⅛″ pilot holes, then fix the bottom 2×6 row to the posts with two 3″ screws at each board end. Check each frame’s diagonals before adding more.', why: 'Equal diagonals mean a square frame, so the cap miters close tight later. Pilot holes stop cedar from splitting near the ends.', tip: 'Set the drill clutch around 10 and let it slip as the screw head reaches the wood; overdriving buries the head and splits cedar. If a screw strips, drive a new one ½″ away.', ok: 'Both diagonals on each frame match within ¼″ and the frame doesn’t rack when you push a corner.', v: { cam: [3.0, 2.0, 3.0], at: [1.1, 0.1, 0.4], hi: ['posts', 'lower1'], show: ['posts', 'lower1'], tool: { id: 'drill', at: [1.72, 0.08, 1.15], rot: [90, 0, 0], anim: 'spin', scale: 1.4 } } },
        { t: 'Finish the lower walls', d: 'Stack rows two and three on top, keeping the joints tight, and screw every board into the posts with two 3″ screws per end.', why: 'Screwing into the posts, not into each other, lets the boards swell and shrink without splitting, and three rows give 16½″ of soil.', tip: 'Start each screw at a slight angle toward the post center so it can’t blow out the side of the post. Check the top with a level as you go.', ok: 'The walls are tight with no gaps between rows, and the top edge is level all around.', v: { cam: [3.4, 2.4, 3.6], at: [0, 0.2, 0], hi: ['lowerTop'], show: ['lowerTop'], tool: { id: 'drill', at: [1.72, 0.36, 1.15], rot: [90, 0, 0], anim: 'spin', scale: 1.4 } } },
        { t: 'Line the bottoms', d: 'Lay ½″ hardware cloth (stiff welded-wire mesh) across each bed bottom, run it 2″ up the inside walls, and staple it every 4″. Cover it with wet plain cardboard.', why: 'Hardware cloth stops gophers and moles tunneling in from below; cardboard smothers weeds and then rots away.', tip: 'Cut the mesh with tin snips and fold the cut edge under; raw wire ends catch gloves. Overlap two pieces by 6″ and tie them with wire if one roll isn’t wide enough.', ok: 'No gaps show at the edges or seams, and the mesh doesn’t lift when you press the corners.', v: { cam: [2.4, 3.2, 2.4], at: [0, 0.05, 0], hi: ['cloth'], show: ['cloth'], xray: true } },
        { t: 'Build the upper tiers', d: 'For each bed, build a 2 × 8 ft box, two boards high, with 4×4 or 2×4 corner posts. Set it on the back half of the lower frame and screw it to the lower posts at the back and to 2×4 cleats (short boards) screwed inside the lower walls.', why: 'The upper tier adds 11″ more soil for carrots and potatoes and lifts tall plants to the back, where they won’t shade the short ones.', tip: 'Let the upper box’s front wall sit on soil-filled cleats, not on loose soil; soil settles and the box would tip forward.', ok: 'Push hard on the upper box: it doesn’t rock, and its top edge is level.', v: { cam: [3.4, 2.4, 3.6], at: [0, 0.5, 0], hi: ['upper'], show: ['upper'], tool: { id: 'drill', at: [1.75, 0.6, 1.07], rot: [90, 0, 0], anim: 'spin', scale: 1.4 } } },
        { t: 'Add the cap rails', d: 'Cut 2×6 caps with 45° miters at the corners so they overhang the outside by 1″. Pilot-drill and screw them down into the posts and wall tops with 3″ screws.', why: 'The cap stiffens the top edge, sheds rain off the end grain, and gives you a seat while you weed.', tip: 'Cut miters a hair long, test-fit, and shave to fit; a gap is permanent. If a miter opens up, a dab of exterior glue and a screw through the corner closes it.', ok: 'The miters close tight with no visible gap, and the cap doesn’t flex when you sit on it.', v: { cam: [2.6, 2.0, 2.8], at: [1.1, 0.5, 0.6], hi: ['capRail'], show: ['capRail'], tool: { id: 'drill', at: [1.7, 0.47, 1.18], rot: [0, 0, 0], anim: 'spin', scale: 1.4 } } },
        { t: 'Raise the arch', d: 'Drive a 6 ft steel T-post 2 ft deep inside each bed at the four corners of the arch, with the feet about 5 ft apart across the path. With a helper, bow the 16 ft cattle panel up between them and zip-tie or clip it to the posts every foot.', why: 'Posts inside the beds use the weight of the soil around them to hold the arch steady in wind, and the panel’s spring keeps the curve.', tip: 'Bend the panel by walking the two ends toward each other, never by pushing the middle; it can snap back. Wear eye protection and keep your face out of the curve.', ok: 'The arch stands about 7 ft tall at the top, is centered over the path, and doesn’t sway when you shake it.', v: { cam: [3.0, 2.2, 3.6], at: [0, 1.2, 0], hi: ['arch'], show: ['arch'], tool: { id: 'level', at: [-0.62, 1.0, 0.36], rot: [0, 0, 90], scale: 1.4 } } },
        { t: 'Fill and gravel the path', d: 'Fill both tiers with soil mix, watering every 4″ to settle it. Lay landscape fabric on the path, then spread 2″ of pea gravel over it.', why: 'Settling the soil as you fill keeps it from dropping 3″ after the first rain, and fabric keeps the path weed-free.', tip: 'Shovel straight from the delivery pile into a wheelbarrow and tip it on a tarp in the bed corner, then rake out; it saves your back and the cap rails.', ok: 'The soil sits 1–2″ below the caps after watering, and the path gravel is even and firm.', v: { cam: [3.4, 2.8, 3.8], at: [0, 0.3, 0], hi: ['soil', 'path'], show: ['soil', 'path'], tool: { id: 'shovel', at: [0.3, 0.05, 1.5], rot: [20, 40, -20], anim: 'push' } } },
        { t: 'Plant and train the climbers', d: 'Plant the beds, putting tall crops in the upper tiers. Sow pole beans or plant cucumbers along the base of each arch side. When runners reach 6″, weave or tie them loosely onto the panel.', why: 'Climbers need a nudge to find the support; once on the panel they cover the arch in 6–8 weeks.', tip: 'Tie with soft strips of old T-shirt in a loose figure 8. If a vine heads for the path instead, gently turn it back toward the panel every few days.', ok: 'Within two weeks the runners are wrapping the panel on their own.', v: { cam: [3.8, 3.0, 4.4], at: [0, 0.8, 0], hi: ['plants', 'climbers'], show: ['plants', 'climbers'] } },
      ],
      learn: {
        how: 'Each bed is a box frame holding soil; the upper tier is a smaller box sitting on the lower one and fastened to its posts and cleats. The arch is a single 16 ft cattle panel bent between steel posts, which turns a walking path into vertical growing space.',
        specs: [['Bed size', '4 × 8 ft each'], ['Lower tier depth', '16½″ (three 2×6)'], ['Upper tier depth', '27½″ total at the back'], ['Path width', '3–3½ ft'], ['Arch', '16 ft × 50″ panel, feet ≈ 5 ft apart, ≈ 7 ft tall'], ['Screws', '3″ exterior, 2 per board end'], ['Soil', '≈ 4½ yd³ total']],
        terms: [['Cattle panel', 'Heavy welded-wire livestock panel; bends into a strong arch.'], ['Cap rail', 'Flat board across the top edge of the bed.'], ['Cleat', 'Short board screwed inside a frame to carry another part.'], ['Miter', 'An angled cut, usually 45°, that joins boards at a corner.'], ['Hardware cloth', 'Stiff welded-wire mesh with small openings.']],
        mistakes: ['A path too narrow for a wheelbarrow.', 'Planting tall crops in front of short ones.', 'Not anchoring the arch posts deep enough.', 'Skipping pilot holes (cedar splits).'],
        tips: ['Pre-drill every screw near board ends; cedar splits easily.'],
      },
      pro: 'You want beds over 24″ tall along their full length (they need internal bracing) or a long arched tunnel over a slope.',
      tricks: [['Buy the panel locally', 'Farm stores sell cattle panels for a fraction of “garden arch” prices; bring a truck or ask them to bend it gently into a U for the drive home.'], ['Pick construction-grade cedar wisely', 'Choose boards with tight knots and no cracks at the ends; sort the straightest for the visible top rows and caps.'], ['Seal the caps only', 'Leave the soil-side wood raw, but an exterior oil on the cap rails keeps the seat from going gray and splintery.'], ['Make a cut list', 'Write every board length before you start and cut all the same-length pieces at once with a stop block; it’s faster and they match.'], ['Fix a split board', 'If a board end splits as you screw it, back the screw out, squeeze in exterior glue, clamp it, and redrive the screw 1″ away.'], ['Grow cool and warm crops', 'Lettuce and spinach planted under the arch enjoy its summer shade.']],
      refs: [['Cattle Panel Trellis (Bob Vila)', 'https://www.bobvila.com/diy/cattle-panel-trellis/'], ['Starting Raised Beds (UConn Home & Garden Education Center)', 'https://homegarden.cahnr.uconn.edu/?p=19122'], ['Raised Beds: Will They Work for You? (Oregon State Extension FS 270)', 'https://extension.oregonstate.edu/sites/extd8/files/catalog/auto/FS270.pdf']],
      addons: [bedAdd.bench].concat(pick(bed, ['drip', 'sensor', 'solar'])),
    },
    {
      id: 'luxury',
      name: 'Luxury: corten courtyard garden',
      blurb: 'Three 30″ corten-steel beds around a granite courtyard, with seating ledges, drip irrigation and lighting.',
      level: 3,
      time: '4–6 days',
      cost: '$4,000–9,000',
      model: 'bedCorten',
      summary: 'A garden room: a U of 30″-tall corten steel beds around a stabilized decomposed-granite courtyard, with ipe seating ledges and hidden LED strips, a Wi-Fi drip system, spike lights in the beds, and a bottom layer of logs so the tall beds need less soil.',
      intro: { show: ['beds', 'soil', 'ledges', 'ledgeLights', 'lights', 'transformer', 'supply', 'plants', 'dg'], spin: true, preview: true },
      safety: ['Corten panels have sharp edges and weigh 60–120 lb: wear cut-resistant gloves and lift with a helper.', 'Call 811 (the free “call before you dig” line) before trenching for water and lighting.', 'Use low-voltage (12 V) lighting only, plugged into a GFCI outlet (the kind with test and reset buttons) under a weatherproof in-use cover; any new 120 V outlet needs an electrician.', 'Install a backflow preventer on the irrigation supply (often required by code) so garden water can never be sucked back into your drinking water.', 'Ipe dust irritates skin and lungs: cut it outdoors with a dust mask and long sleeves.'],
      causes: [['Height', '30″ beds are easy on the back and become seats with a ledge.'], ['Corten finish', 'Corten (weathering steel) rusts to a stable brown skin in 6–12 months. The early rusty runoff stains concrete and light stone, so keep beds on gravel or DG.'], ['Utilities first', 'Water and lighting lines go in before the courtyard surface.'], ['Soil volume', 'Three tall beds hold about 6 yd³; a log layer in the bottom third cuts that by roughly a third.']],
      tools: ['Corten bed kits (30″ tall) with braces', 'Socket set & ratchet', '4 ft level, string & a few flat pavers for shims', 'Plate compactor (rental)', 'Crushed base + stabilized decomposed granite', 'Logs & branches (untreated hardwood)', 'Compost + raised-bed soil mix (≈ 4–6 yd³)', 'Backflow preventer, 150-mesh filter, 25 psi pressure regulator & Wi-Fi timer', '½″ drip tubing, inline drip line (12″ emitters), fittings & end caps', 'Ipe 1×6 ledges, brackets & stainless steel screws', 'Low-voltage transformer, 12/2 direct-burial cable, spike lights, LED strip & waterproof connectors', 'Drill/driver with countersink bit'],
      steps: [
        { t: 'Plan and lay out', d: 'Mark the three beds in a U around a 12 × 9 ft courtyard with marking paint. Then paint the routes for the water line (from the hose bib or irrigation tap) and the light cable (from the outdoor outlet).', why: 'Planning the utilities first means you never dig through a finished courtyard later.', tip: 'Lay a garden hose along each utility route to see how it bends around corners; smooth curves are easier to trench and pull cable through.', ok: 'Every bed, the courtyard, and both utility routes are painted on the ground, and measurements match your sketch.', v: { cam: [5.0, 4.4, 5.6], at: [0, 0, -0.5], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [1.8, 0.02, 1.0], rot: [0, 90, 0], scale: 1.6 } } },
        { t: 'Grade and compact', d: 'Strip the sod across the whole area. Rake it flat with a gentle fall away from the house (about ⅛″ per foot), then run the plate compactor over it twice each way.', why: 'A full 30″ bed of wet soil weighs several tons; soft spots make it sink and lean.', tip: 'Water the dirt lightly the night before; slightly damp soil compacts far better than dust. If the compactor bounces, the ground is too dry.', ok: 'Your boot leaves no print, and a level on a long board shows a slight, even fall away from the house.', v: { cam: [5.0, 4.4, 5.6], at: [0, 0, -0.5], hi: ['grade'], show: ['grade'], hide: ['layout'], tool: { id: 'shovel', at: [1.4, 0.02, 0.8], rot: [10, 40, -15], anim: 'push' } } },
        { t: 'Set and level the beds', d: 'Bolt the panels together loosely, stand each bed in place, then level its top edge both directions, tucking flat pavers under low corners. Tighten all bolts once it’s level.', why: 'The top edge is what you see; even ½″ out of level shows along a 12 ft run.', tip: 'Leave bolts finger-tight until the bed is level and square, then tighten from the middle outward. A strip of tape across each panel joint keeps fingers off the sharp edge while you work.', ok: 'The level reads true along every top edge, and the corners measure square.', v: { cam: [4.6, 3.0, 4.0], at: [0, 0.4, -1.0], hi: ['beds'], show: ['beds'], tool: { id: 'level', at: [0.6, 0.79, -1.3], rot: [0, 0, 0], scale: 2 } } },
        { t: 'Install the cross braces', d: 'Bolt the steel cross braces from wall to wall inside each bed at about two-thirds of the height, at the spacing in the kit instructions.', why: 'Wet soil pushes outward hard; braces stop long walls from bulging into a belly.', tip: 'Measure the bed width at the top and bottom before and after bracing; they should match. If a wall already bows in or out, set the brace to the correct width and it pulls it straight.', ok: 'The walls measure the same width top, middle and bottom.', v: { cam: [3.6, 3.4, 1.6], at: [0, 0.4, -1.8], hi: ['braces'], show: ['braces'], xray: true, tool: { id: 'ratchet', at: [0.9, 0.46, -2.18], rot: [0, 0, 90], anim: 'turn', scale: 1.2 } } },
        { t: 'Run water and power', d: 'At the water supply, connect in order: backflow preventer, filter, pressure regulator (25 psi), then the Wi-Fi timer. Bury ½″ tubing to each bed and up inside it. Trench direct-burial 12/2 cable at least 6″ deep from the outlet to a transformer post.', why: 'The order protects the parts: the regulator brings house pressure down so drip fittings don’t blow apart, and the filter keeps emitters from clogging.', tip: 'Flow arrows are printed on the backflow preventer, filter and regulator; point them all away from the faucet. If a fitting leaks, unscrew and add plumber’s tape on threaded parts only, not on compression fittings.', ok: 'With the water on, nothing drips at the supply, and the cable lies flat at 6″ deep in every trench.', v: { cam: [4.6, 2.6, 0.4], at: [2.2, 0.3, -2.3], hi: ['supply', 'wire', 'transformer'], show: ['supply', 'wire', 'transformer'] } },
        { t: 'Fill the beds', d: 'Lay logs and branches in the bottom third of each bed, packing gaps with twigs. Add 3–4″ of compost, then fill with raised-bed mix, soaking every 6″ to settle it.', why: 'The wood layer (a method called hugelkultur) cuts soil cost and soaks up water like a sponge as it slowly rots.', tip: 'Use hardwood logs, never cedar, walnut or treated wood. Expect the soil to sink a few inches the first year as the wood breaks down; top up with compost each spring.', ok: 'Soil sits 2″ below the rim after watering and squeezes into a moist ball that crumbles.', v: { cam: [3.8, 3.4, 2.2], at: [0, 0.4, -1.4], hi: ['fill', 'soil'], show: ['fill', 'soil'], xray: true, tool: { id: 'shovel', at: [1.0, 0.75, -1.4], rot: [20, 40, -20], anim: 'push' } } },
        { t: 'Lay the drip lines', d: 'Connect inline drip line (tubing with built-in drippers every 12″) to the riser in each bed. Run rows 12″ apart, pin them on the soil surface, run the water for a minute to flush dirt out, then cap the ends.', why: 'Flushing before capping clears out soil that would plug the tiny emitters.', tip: 'Run the system for 10 minutes, then dig a small hole between two emitters: water should have spread there. If not, add a row or run longer.', ok: 'Every emitter makes a wet spot the size of a dinner plate within 10 minutes.', v: { cam: [3.0, 3.0, 0.8], at: [0, 0.7, -1.75], hi: ['drip'], show: ['drip'] } },
        { t: 'Fit the seating ledges', d: 'Screw brackets to the inner walls, then fix ipe boards on top so they overhang the courtyard by 4″. Pre-drill and countersink every hole and use stainless steel screws.', why: 'A 14″ ledge at 30″ high makes a comfortable perch and hides the LED strip underneath.', tip: 'Ipe is so hard that screws snap without a pilot hole. Rub wax on the screw threads; if one breaks, cut it flush and drill a new hole ½″ away.', ok: 'The ledges sit flat with even overhang and don’t flex when you sit on the edge.', v: { cam: [3.2, 2.2, 2.4], at: [0.8, 0.7, -0.8], hi: ['ledges'], show: ['ledges'], tool: { id: 'drill', at: [1.7, 0.84, 0.3], rot: [0, 0, 0], anim: 'spin', scale: 1.3 } } },
        { t: 'Add the lights', d: 'Stick the LED strip under each ledge in an aluminum channel, set spike lights in the beds, and join everything to the cable with waterproof gel-filled connectors. Turn the transformer on at dusk and adjust the aim.', why: 'Light from under the ledges and up through the plants makes the space glow at night without glare in your eyes.', tip: 'Check that every light is the same color temperature (2700K is warm white). If the far light is dim, measure the voltage there and move the transformer to a higher output tap.', ok: 'All lights come on together at dusk with matching warm color, and the meter shows about 11–12 V at the farthest one.', v: { cam: [4.4, 3.0, 4.4], at: [0, 0.6, -0.8], hi: ['ledgeLights', 'lights'], show: ['ledgeLights', 'lights'] } },
        { t: 'Plant and finish the courtyard', d: 'Plant the beds. Then spread stabilized decomposed granite (crushed granite with a binder) over 3–4″ of compacted base, in two 1½″ layers. Mist and compact each layer, then water it in to set.', why: 'Stabilized DG packs nearly as firm as pavers but still drains, and it looks natural next to the steel.', tip: 'Keep it damp, not wet, while compacting; puddles wash the binder out. Stay off it for 2–3 days while it cures.', ok: 'The surface is firm, flat and doesn’t leave shoe prints after it cures.', v: { cam: [5.0, 4.0, 5.8], at: [0, 0.5, -0.5], hi: ['plants', 'dg'], show: ['plants', 'dg'] } },
      ],
      learn: {
        how: 'Corten (weathering) steel forms a tight rust layer that protects the steel underneath, so the beds need no paint. Tall beds hold a lot of soil, so they rely on internal braces and a layer of wood at the bottom. A drip system on a smart timer waters each bed at the roots, and low-voltage lighting turns the courtyard into an evening space.',
        specs: [['Bed height', '30″'], ['Steel', '16-gauge corten'], ['Drip pressure', '≈ 25 psi'], ['Drip line', 'Emitters every 12″, rows 12″ apart'], ['Ledge depth', '14″'], ['Low-voltage cable depth', '≥ 6″'], ['DG', '3″ in two layers over a compacted base'], ['Soil (3 beds)', '≈ 6 yd³ (≈ 4 with a log layer)']],
        terms: [['Corten', 'Weathering steel that forms a protective rust patina.'], ['Hugelkultur', 'Burying wood in a bed to hold water and feed the soil.'], ['Backflow preventer', 'Valve that stops irrigation water from flowing back into the house supply.'], ['Decomposed granite', 'Finely crushed granite that packs into a firm surface.'], ['Pressure regulator', 'Fitting that lowers water pressure to what drip parts can take.']],
        mistakes: ['Setting corten beds right next to light concrete (rust runoff stains it).', 'Skipping braces on long beds.', 'Burying drip lines deep in the soil.', 'No pressure regulator (fittings pop apart).'],
        tips: ['Mist new corten with water a few times a week to speed up an even patina.'],
      },
      pro: 'For a new 120 V outlet or hardwired transformer, an irrigation tap off the main water line, or a site that needs retaining walls.',
      tricks: [['Protect paving during the rust phase', 'For the first year, keep a gravel strip or a plastic sheet under any corten that touches light stone or concrete; rust runoff stains permanently.'], ['Speed an even patina safely', 'Wet-dry cycles build the patina: hose the steel and let it dry in the sun every day or two. Skip salt sprays; salt keeps corten from forming its protective layer.'], ['Label your drip zones', 'Put each bed on its own timer zone; herbs and tomatoes want different watering.'], ['Fill with a mini skid steer', 'Rent a walk-behind loader for a day to move 6 yards of soil; wheelbarrows to 30″ rims are brutal.'], ['If a drip line stops', 'Pull the end cap and flush; most clogs are soil that got in during install. Clean the filter screen each spring.'], ['Oil the ipe once', 'An ipe oil with UV blocker keeps the ledges rich brown; leave them unoiled and they weather to silver.']],
      refs: [['Raised Bed Drip Kit Instructions (DIG Corp)', 'https://digcorp.com/?p=17046'], ['Starting Raised Beds (UConn Home & Garden Education Center)', 'https://homegarden.cahnr.uconn.edu/?p=19122'], ['Understanding the NEC for Outdoor Buried Wiring (Super Bright LEDs)', 'https://www.superbrightleds.com/blog/understanding-the-nec-code-for-outdoor-buried-electrical-wiring.html'], ['Call Before You Dig (811)', 'https://call811.com/']],
      addons: [bedAdd.string, bedAdd.speaker, bedAdd.cover].concat(pick(bed, ['sensor'])),
    },
  ];
  bed.defaultVariant = 'classic';

  /* =====================================================================================
     PATH LIGHTS
     ===================================================================================== */
  const beamMat = (K, o) => K.std(0xfff1c8, { transparent: true, opacity: o || 0.08, emissive: 0xffe2a0, emissiveIntensity: 0.4, depthWrite: false, side: THREE.DoubleSide });
  // Low-voltage path light (hat style).
  function hatLight(K, parent, x, z, y, gm) {
    const g = K.group(parent, [x, y || 0, z]);
    K.cyl(g, [0.012, 0.012, 0.45, 10], 'blackOxide', [0, 0.22, 0]);
    K.cone(g, [0.13, 0.1, 24], K.std(0x1e1f21, { metalness: 0.7, roughness: 0.4 }), [0, 0.52, 0]);
    K.cyl(g, [0.05, 0.06, 0.06, 16], gm, [0, 0.45, 0]);
    K.cone(g, [0.02, 0.15, 8], 'black', [0, -0.05, 0], [180, 0, 0]);
    K.cyl(g, [0.5, 0.5, 0.003, 32], K.std(0xffe7b0, { transparent: true, opacity: 0.12, emissive: 0xffd28a, emissiveIntensity: 0.5, depthWrite: false }), [0, 0.006, 0]);
    return g;
  }
  // Brass bullet uplight aimed up/out with a visible beam.
  function bullet(K, parent, x, z, ry, tilt, beamLen, y) {
    const s = K.group(parent, [x, y || 0, z], [0, ry || 0, 0]);
    const brass = K.std(0x8a6a3a, { metalness: 0.8, roughness: 0.4 });
    K.cyl(s, [0.01, 0.01, 0.12, 8], brass, [0, 0.06, 0]);
    const head = K.group(s, [0, 0.14, 0], [-(tilt == null ? 15 : tilt), 0, 0]);
    K.cyl(head, [0.035, 0.03, 0.12, 16], brass, [0, 0, 0], [90, 0, 0]);
    K.cyl(head, [0.03, 0.03, 0.005, 16], glow(K, 0xfff4dc, 2), [0, 0, 0.062], [90, 0, 0]);
    const L = beamLen || 2.2;
    K.cone(head, [0.3 * L * 0.5, L, 20, true], beamMat(K, 0.07), [0, 0, 0.06 + L / 2], [-90, 0, 0]);
    return s;
  }
  function house(K, x0, x1, z, h, door) {
    const wall = K.pbr('brick_wall_001', [(x1 - x0) / 1.6, h / 1.6], {}, 'stone');
    K.box(null, [x1 - x0, h, 0.2], wall, [(x0 + x1) / 2, h / 2, z]);
    K.box(null, [x1 - x0 + 0.2, 0.25, 0.4], K.std(0x5a5d61, { roughness: 0.6 }), [(x0 + x1) / 2, h + 0.1, z + 0.05]);
    if (door) {
      K.box(null, [door[1], 2.1, 0.05], K.std(0x3d4a5c, { roughness: 0.4 }), [door[0], 1.05 + (door[2] || 0), z + 0.11]);
      K.box(null, [door[1] + 0.16, 2.2, 0.04], 'offwhite', [door[0], 1.1 + (door[2] || 0), z + 0.1]);
      K.sph(null, 0.03, 'brass', [door[0] + door[1] / 2 - 0.1, 1.0 + (door[2] || 0), z + 0.15]);
    }
  }
  function windowAt(K, x, y, z, w, h) {
    K.box(null, [w + 0.12, h + 0.12, 0.05], 'offwhite', [x, y, z + 0.1]);
    K.box(null, [w, h, 0.03], K.phys(0x8fb3cc, { roughness: 0.05, metalness: 0.3, clearcoat: 1 }), [x, y, z + 0.12]);
    K.box(null, [0.03, h, 0.04], 'offwhite', [x, y, z + 0.13]);
  }

  // Starter: solar stake lights along the walk, no wiring.
  TB.model(
    'pathSolar',
    {
      cam: [4.6, 3.2, 4.8], at: [0, 0.2, -0.2], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10 },
      tex: ['interlocking_concrete_pavers', 'brick_wall_001'], assets: ['shrub_02', 'cardboard_box_01'],
      hidden: ['sunCheck', 'boxes', 'flags', 'pilots', 'lights', 'aoSpot', 'aoFlood', 'aoNumber', 'aoString'],
    },
    (K) => {
      const path = K.part('path', [0, 0.01, 0], null, 'Walkway');
      K.box(path, [0.9, 0.02, 5], K.pbr('interlocking_concrete_pavers', [1, 5], {}, 'concrete'));
      house(K, -1.6, 3.4, -2.6, 2.4, [0, 0.9]);
      K.glb(null, 'shrub_02', { node: 'shrub_02_a', height: 0.8 }, [-1.3, 0, -1.2]);
      K.glb(null, 'shrub_02', { node: 'shrub_02_d', height: 0.9 }, [-1.4, 0, 1.0]);
      const P = [[-0.65, -1.9], [0.65, -0.95], [-0.65, 0], [0.65, 0.95], [-0.65, 1.9], [0.65, 2.3]];
      const sun = K.part('sunCheck', [0, 0.012, 0], null, 'Full-sun strips (6–8 hr direct sun)');
      const sm = K.std(0xffd84a, { transparent: true, opacity: 0.35, emissive: 0xffc020, emissiveIntensity: 0.3, depthWrite: false });
      K.box(sun, [0.4, 0.004, 4.4], sm, [0.68, 0, 0.2], null, 0);
      K.box(sun, [0.4, 0.004, 4.4], sm, [-0.68, 0, 0.2], null, 0);
      K.box(sun, [1.0, 0.005, 1.2], K.std(0x223344, { transparent: true, opacity: 0.35, depthWrite: false }), [-1.2, 0, -1.6], null, 0);
      const bx = K.part('boxes', [1.5, 0, 1.4], null, 'Lights unboxed, switched ON, charging');
      K.glb(bx, 'cardboard_box_01', { height: 0.25 }, [0.3, 0, 0.2], [0, 20, 0]) || K.box(bx, [0.4, 0.25, 0.3], 'woodLight', [0.3, 0.125, 0.2]);
      const bm = blackMetal(K);
      K.rep(3, (i) => {
        const g = K.group(bx, [-0.2 + i * 0.14, 0.02, -0.15], [90, 0, 0]);
        K.cyl(g, [0.07, 0.07, 0.015, 16], bm, [0, 0, 0]);
        K.box(g, [0.06, 0.004, 0.06], K.std(0x1b2a4a, { metalness: 0.3, roughness: 0.2 }), [0, 0.01, 0], null, 0);
      });
      const fl = K.part('flags', [0, 0, 0], null, 'Marking flags, 6 ft apart, staggered');
      P.forEach(([x, z]) => {
        K.cyl(fl, [0.003, 0.003, 0.5, 6], 'steel', [x, 0.25, z]);
        K.box(fl, [0.1, 0.07, 0.003], 'orange', [x + 0.05, 0.46, z], null, 0);
      });
      const pi = K.part('pilots', [0, 0.003, 0], null, 'Pilot holes (6″ deep)');
      P.forEach(([x, z]) => K.cyl(pi, [0.02, 0.02, 0.004, 12], 'black', [x + 0.03, 0, z]));
      AO.stakeLights(K, 'lights', P, 'Solar path lights (4–6″ in the ground)');
      const lp = K.parts.lights;
      P.forEach(([x, z]) => K.cyl(lp, [0.45, 0.45, 0.003, 28], K.std(0xffe7b0, { transparent: true, opacity: 0.1, emissive: 0xffd28a, emissiveIntensity: 0.5, depthWrite: false }), [x, 0.022, z]));
      const pl = new THREE.PointLight(0xffe0b0, 0.7, 3, 2);
      pl.position.set(0, 0.5, 0);
      lp.add(pl);
      // add-ons
      const sp = K.part('aoSpot', [-1.0, 0, -0.9], null, 'Solar spotlight on the shrub');
      K.cyl(sp, [0.01, 0.01, 0.3, 8], bm, [0, 0.15, 0]);
      K.box(sp, [0.16, 0.01, 0.12], K.std(0x1b2a4a, { metalness: 0.3, roughness: 0.2 }), [0, 0.32, 0.05], [-25, 0, 0], 0);
      bullet(K, sp, 0, 0.12, 200, 25, 1.2);
      AO.flood(K, 'aoFlood', [1.6, 2.0, -2.48], 0, 'Solar motion floodlight');
      K.box(K.parts.aoFlood, [0.22, 0.012, 0.16], K.std(0x1b2a4a, { metalness: 0.3, roughness: 0.2 }), [0, 0.12, 0.05], [-20, 0, 0], 0);
      const num = K.part('aoNumber', [1.0, 1.5, -2.49], null, 'Solar lit house numbers');
      K.box(num, [0.5, 0.18, 0.03], bm, [0, 0, 0], null, 0.01);
      K.box(num, [0.46, 0.14, 0.004], glow(K, 0xfff1cc, 0.8), [0, 0, 0.017], null, 0);
      [-0.12, 0, 0.12].forEach((x) => K.box(num, [0.06, 0.1, 0.006], 'black', [x, 0, 0.02], null, 0.002));
      AO.stringLights(K, 'aoString', [[-1.1, -2.2], [1.1, -0.8], [-1.1, 0.8], [1.1, 2.4]], 2.4, false, 'Solar string lights on posts');
    }
  );

  // Showpiece: full lighting plan — path lights, tree uplights and wall wash on a smart transformer.
  TB.model(
    'pathPlan',
    {
      cam: [6.6, 4.6, 7.6], at: [-0.4, 1.2, -0.6], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 12, radius: 11 },
      tex: ['interlocking_concrete_pavers', 'brick_wall_001', 'pine_bark', 'forrest_ground_01'], assets: ['shrub_02', 'grass_medium_01'],
      hidden: ['plan', 'transformer', 'trench', 'cables', 'hubs', 'pathLights', 'treeUps', 'wallWash', 'zones', 'aoFlood', 'aoNumber', 'aoUplight', 'aoString'],
    },
    (K) => {
      const WZ = -3.2;
      house(K, -4.2, 4.2, WZ, 3.0, [0, 0.95]);
      windowAt(K, -2.3, 1.5, WZ, 1.2, 1.1);
      windowAt(K, 2.3, 1.5, WZ, 1.2, 1.1);
      K.box(null, [1.4, 0.15, 0.6], 'concrete', [0, 0.075, WZ + 0.4], null, 0.01);
      const path = K.part('path', [0, 0.01, 0], null, 'Front walk');
      K.box(path, [1.0, 0.02, 6.0], K.pbr('interlocking_concrete_pavers', [1.2, 6], {}, 'concrete'), [0, 0, 0.0]);
      const mulch = K.pbr('pine_bark', [4, 1], { color: 0x6a4a34 }, 'bark');
      K.box(null, [3.4, 0.03, 1.0], mulch, [-2.4, 0.015, WZ + 0.6], null, 0);
      K.box(null, [3.4, 0.03, 1.0], mulch, [2.4, 0.015, WZ + 0.6], null, 0);
      [[-3.2, 'shrub_02_b', 1.0], [-1.5, 'shrub_02_a', 0.8], [1.5, 'shrub_02_d', 0.9], [3.2, 'shrub_02_c', 1.0]].forEach(([x, node, h]) => K.glb(null, 'shrub_02', { node, height: h }, [x, 0, WZ + 0.65]));
      K.cyl(null, [1.1, 1.1, 0.03, 32], mulch, [-2.6, 0.015, 1.2]);
      tree(K, null, -2.6, 1.2, 4.6, 8);
      K.glb(null, 'grass_medium_01', { node: 'grass_medium_01_tall_b_LOD0', height: 0.5 }, [-2.0, 0, 1.7]);
      // plan
      const plan = K.part('plan', [0, 0, 0], null, 'Lighting plan: flags at each fixture');
      const flagAt = (x, z, c) => {
        K.cyl(plan, [0.003, 0.003, 0.5, 6], 'steel', [x, 0.25, z]);
        K.box(plan, [0.1, 0.07, 0.003], c, [x + 0.05, 0.46, z], null, 0);
      };
      const PL = [[-0.8, -2.0], [0.8, -1.0], [-0.8, 0.0], [0.8, 1.0], [-0.8, 2.0], [0.8, 2.8]];
      PL.forEach(([x, z]) => flagAt(x, z, 'yellow'));
      [[-2.0, 0.6], [-3.2, 1.6]].forEach(([x, z]) => flagAt(x, z, 'blue'));
      [[-3.3, WZ + 0.3], [-1.3, WZ + 0.3], [1.3, WZ + 0.3], [3.3, WZ + 0.3]].forEach(([x, z]) => flagAt(x, z, 'red'));
      const tr = K.part('transformer', [3.9, 0.55, WZ + 0.18], null, '300 W smart transformer (Wi-Fi, astronomic timer)');
      K.box(tr, [0.3, 0.4, 0.14], K.std(0x2b2e31, { metalness: 0.5, roughness: 0.4 }), [0, 0, 0], null, 0.012);
      K.box(tr, [0.14, 0.07, 0.01], 'screen', [0, 0.1, 0.075], null, 0);
      K.box(null, [0.12, 0.18, 0.05], 'offwhite', [3.5, 0.5, WZ + 0.12]);
      const zones = K.part('zones', [3.9, 0.48, WZ + 0.26], null, 'App zones: Path · Trees · House');
      ['ledG', 'ledB', 'ledR'].forEach((m, i) => K.sph(zones, 0.012, m, [-0.06 + i * 0.06, 0, 0]));
      const trench = K.part('trench', [0, 0.012, 0], null, '6″ slit trenches');
      const dm = K.std(0x5a4330, { roughness: 1 });
      K.box(trench, [3.0, 0.01, 0.05], dm, [2.4, 0, WZ + 0.3], null, 0);
      K.box(trench, [0.05, 0.01, 6.0], dm, [0.62, 0, 0.0], null, 0);
      K.box(trench, [3.0, 0.01, 0.05], dm, [-0.9, 0, 0.4], null, 0);
      const cab = K.part('cables', [0, 0, 0], null, 'Home runs: 12/2 cable to each hub');
      K.tube(cab, [[3.9, 0.35, WZ + 0.2], [3.7, 0.02, WZ + 0.3], [0.62, 0.02, WZ + 0.3], [0.62, 0.02, 0.4]], 0.011, 'black');
      K.tube(cab, [[3.92, 0.35, WZ + 0.2], [3.75, 0.025, WZ + 0.34], [-3.6, 0.025, WZ + 0.34]], 0.011, K.std(0x333333));
      K.tube(cab, [[0.62, 0.02, 0.4], [-2.3, 0.02, 0.4], [-2.3, 0.02, 1.0]], 0.011, 'black');
      const hubs = K.part('hubs', [0, 0, 0], null, 'Hub junctions (equal-length leads)');
      [[0.62, 0.4], [-2.3, 1.0], [-1.0, WZ + 0.34]].forEach(([x, z]) => {
        K.cyl(hubs, [0.07, 0.08, 0.08, 16], K.std(0x2d5a2d, { roughness: 0.6 }), [x, 0.04, z]);
        K.cyl(hubs, [0.075, 0.075, 0.015, 16], K.std(0x1f3f1f), [x, 0.085, z]);
      });
      const pathL = K.part('pathLights', [0, 0, 0], null, 'Path lights (brass, 2700K, 3 W)');
      const gm = glow(K, 0xfff1c8, 2);
      PL.forEach(([x, z]) => hatLight(K, pathL, x, z, 0, gm));
      const ppl = new THREE.PointLight(0xffd59a, 0.9, 3.5, 2);
      ppl.position.set(0, 0.4, 0);
      pathL.add(ppl);
      const ups = K.part('treeUps', [0, 0, 0], null, 'Tree uplights (2 × 7 W, 36° beam)');
      bullet(K, ups, -2.0, 0.6, 210, 8, 3.6);
      bullet(K, ups, -3.2, 1.6, 40, 8, 3.6);
      const tpl = new THREE.PointLight(0xfff0d0, 1.2, 5, 2);
      tpl.position.set(-2.6, 2.6, 1.6);
      ups.add(tpl);
      const ww = K.part('wallWash', [0, 0, 0], null, 'Wall-wash lights (60° flood)');
      const wash = K.std(0xffe2a8, { transparent: true, opacity: 0.22, emissive: 0xffc878, emissiveIntensity: 0.8, depthWrite: false });
      [-3.3, -1.3, 1.3, 3.3].forEach((x) => {
        bullet(K, ww, x, WZ + 0.3, 180, 70, 0.1);
        const pts = [[-0.08, 0.15], [0.08, 0.15], [0.7, 2.6], [-0.7, 2.6]];
        K.ext(ww, pts, 0.002, wash, [x, 0, WZ + 0.105], [0, 0, 0], 0);
      });
      // add-ons
      AO.flood(K, 'aoFlood', [3.0, 2.5, WZ + 0.12], 0);
      const num = K.part('aoNumber', [-0.95, 1.7, WZ + 0.11], null, 'Lit house numbers');
      K.box(num, [0.5, 0.18, 0.03], blackMetal(K), [0, 0, 0], null, 0.01);
      K.box(num, [0.46, 0.14, 0.004], glow(K, 0xfff1cc, 0.8), [0, 0, 0.017], null, 0);
      [-0.12, 0, 0.12].forEach((x) => K.box(num, [0.06, 0.1, 0.006], 'black', [x, 0, 0.02], null, 0.002));
      AO.uplights(K, 'aoUplight', [[-1.5, WZ + 1.15, 180], [1.5, WZ + 1.15, 180]], 'Shrub uplights');
      AO.stringLights(K, 'aoString', [[1.6, 1.0], [1.6, 3.2], [3.6, 3.2], [3.6, 1.0]], 2.5, true, 'Café lights over a seating spot');
    }
  );

  // Luxury: lit paver steps, in-ground well lights, café lights and app-controlled zones.
  TB.model(
    'pathLux',
    {
      cam: [5.8, 3.8, 6.4], at: [0, 0.9, -0.6], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 12, radius: 11 },
      tex: ['interlocking_concrete_pavers', 'brick_wall_001', 'stacked_stone_wall', 'brushed_concrete', 'concrete_floor_01'], assets: ['shrub_02', 'outdoor_table_chair_set_01', 'planter_box_02', 'potted_plant_01'],
      hidden: ['plan', 'transformer', 'conduit', 'wellCans', 'wellLights', 'coreHoles', 'stepLights', 'pathLights', 'paverLights', 'posts', 'strings', 'zones', 'aoFlood', 'aoNumber', 'aoSpeaker', 'aoUplight'],
    },
    (K) => {
      const WZ = -3.3;
      const UP = 0.45;
      house(K, -3.6, 3.6, WZ, 3.4, null);
      // glass sliding door
      K.box(null, [2.4, 2.3, 0.05], K.std(0x2d3033, { metalness: 0.5, roughness: 0.4 }), [0, UP + 1.15, WZ + 0.11], null, 0.01);
      K.box(null, [2.3, 2.2, 0.03], K.phys(0x8fb3cc, { roughness: 0.05, metalness: 0.3, clearcoat: 1 }), [0, UP + 1.15, WZ + 0.13], null, 0);
      K.box(null, [0.04, 2.2, 0.04], K.std(0x2d3033), [0, UP + 1.15, WZ + 0.15], null, 0);
      const block = K.pbr('stacked_stone_wall', [2, 0.3], { roughness: 1, color: 0xcfc6b8 }, 'stone');
      const capM = K.pbr('brushed_concrete', [2, 0.2], { color: 0xbfb8ac }, 'concrete');
      const pav = K.pbr('concrete_floor_01', [3, 1.5], { color: 0xd9d4ca }, 'concrete');
      // terrace (existing)
      K.box(null, [7.0, UP - 0.05, 3.0], block, [0, (UP - 0.05) / 2, WZ + 0.1 + 1.5], null, 0.01);
      K.box(null, [7.1, 0.05, 3.1], capM, [0, UP - 0.025, WZ + 0.1 + 1.5], null, 0.01);
      K.box(null, [6.8, 0.004, 2.8], pav, [0, UP + 0.002, WZ + 0.1 + 1.5], null, 0);
      const TF = WZ + 0.1 + 3.0; // terrace front edge z
      // steps (existing): 3 risers of 15 cm, 36 cm treads
      for (let i = 0; i < 2; i++) {
        const z = TF + 0.18 + i * 0.36;
        const top = UP - 0.15 * (i + 1);
        K.box(null, [1.6, top, 0.36], block, [0, top / 2, z], null, 0.006);
        K.box(null, [1.66, 0.04, 0.4], capM, [0, top - 0.02, z], null, 0.006);
      }
      const walk = K.pbr('interlocking_concrete_pavers', [1.2, 3], {}, 'concrete');
      K.box(null, [1.4, 0.02, 3.4], walk, [0, 0.01, TF + 0.72 + 1.7]);
      K.glb(null, 'outdoor_table_chair_set_01', { height: 0.86 }, [-1.8, UP, WZ + 1.6]);
      K.glb(null, 'planter_box_02', { height: 0.45 }, [2.6, UP, WZ + 0.7]);
      K.glb(null, 'potted_plant_01', { height: 1.1 }, [1.6, UP, WZ + 0.5]);
      [[-2.2, 'shrub_02_b'], [2.2, 'shrub_02_c'], [-3.4, 'shrub_02_a']].forEach(([x, node]) => K.glb(null, 'shrub_02', { node, height: 1.0 }, [x, 0, TF + 0.8]));
      const plan = K.part('plan', [0, 0, 0], null, 'Zone plan: steps · walls · path · café lights');
      const fm = (x, y, z, c) => {
        K.cyl(plan, [0.003, 0.003, 0.4, 6], 'steel', [x, y + 0.2, z]);
        K.box(plan, [0.09, 0.06, 0.003], c, [x + 0.045, y + 0.37, z], null, 0);
      };
      [-2.6, -1.4, 1.4, 2.6].forEach((x) => fm(x, UP, WZ + 0.4, 'red'));
      [[-0.9, TF + 1.4], [0.9, TF + 2.3], [-0.9, TF + 3.2]].forEach(([x, z]) => fm(x, 0, z, 'yellow'));
      [[-3.2, WZ + 0.4], [3.2, WZ + 0.4], [3.2, TF - 0.2], [-3.2, TF - 0.2]].forEach(([x, z]) => fm(x, UP, z, 'blue'));
      const tr = K.part('transformer', [3.0, UP + 0.6, WZ + 0.2], null, '600 W multi-zone smart transformer');
      K.box(tr, [0.36, 0.5, 0.16], K.std(0x2b2e31, { metalness: 0.5, roughness: 0.4 }), [0, 0, 0], null, 0.012);
      K.box(tr, [0.18, 0.08, 0.01], 'screen', [0, 0.14, 0.085], null, 0);
      const zones = K.part('zones', [3.0, UP + 0.48, WZ + 0.29], null, 'App zones & scenes');
      ['ledG', 'ledB', 'ledR', 'ledG'].forEach((m, i) => K.sph(zones, 0.012, m, [-0.09 + i * 0.06, 0, 0]));
      const cd = K.part('conduit', [0, 0, 0], null, 'Sleeves & trench (6″ deep)');
      const pvc = K.std(0x8d9196, { roughness: 0.5 });
      K.tube(cd, [[3.0, UP + 0.3, WZ + 0.2], [3.2, UP + 0.02, WZ + 0.4], [3.2, UP + 0.02, TF - 0.2], [3.3, 0.05, TF + 0.2], [1.0, 0.02, TF + 0.9], [1.0, 0.02, TF + 4.0]], 0.02, pvc);
      K.tube(cd, [[3.2, UP + 0.02, WZ + 0.4], [-3.2, UP + 0.02, WZ + 0.4]], 0.018, pvc);
      K.box(cd, [0.06, 0.01, 3.4], K.std(0x5a4330, { roughness: 1 }), [1.0, 0.012, TF + 2.3], null, 0);
      const cans = K.part('wellCans', [0, UP, WZ + 0.4], null, 'Well-light cans on gravel sumps');
      const wellX = [-2.6, -1.4, 1.4, 2.6];
      wellX.forEach((x) => {
        K.cyl(cans, [0.09, 0.09, 0.012, 24], K.pbr('gravel_floor', [0.2, 0.2], {}, 'stone'), [x, 0.004, 0]);
        K.cyl(cans, [0.065, 0.065, 0.01, 24], K.std(0x6a6d70, { metalness: 0.7, roughness: 0.4 }), [x, 0.01, 0]);
      });
      const wl = K.part('wellLights', [0, UP, WZ + 0.4], null, 'In-ground well lights grazing the wall');
      const wash = K.std(0xffe2a8, { transparent: true, opacity: 0.2, emissive: 0xffc878, emissiveIntensity: 0.8, depthWrite: false });
      wellX.forEach((x) => {
        K.cyl(wl, [0.07, 0.07, 0.01, 24], K.std(0x8a6a3a, { metalness: 0.8, roughness: 0.4 }), [x, 0.016, 0]);
        K.cyl(wl, [0.05, 0.05, 0.004, 24], glow(K, 0xfff4dc, 2.2), [x, 0.022, 0]);
        K.ext(wl, [[-0.1, 0.02], [0.1, 0.02], [0.35, 2.9], [-0.35, 2.9]], 0.002, wash, [x, 0, -0.29], [0, 0, 0], 0);
      });
      const wpl = new THREE.PointLight(0xffd8a0, 0.9, 4, 2);
      wpl.position.set(0, 1.2, -0.1);
      wl.add(wpl);
      const holes = K.part('coreHoles', [0, 0, 0], null, 'Core-drilled riser openings');
      const stepL = K.part('stepLights', [0, 0, 0], null, 'Recessed step lights (louvered)');
      const sg = glow(K, 0xfff1cc, 2);
      for (let i = 0; i < 3; i++) {
        const z = TF + i * 0.36 + 0.005;
        const y = UP - 0.15 * i - 0.08;
        [-0.45, 0.45].forEach((x) => {
          K.box(holes, [0.1, 0.06, 0.01], 'black', [x, y, z], null, 0);
          K.box(stepL, [0.11, 0.065, 0.012], K.std(0x2a2c2f, { metalness: 0.6, roughness: 0.4 }), [x, y, z + 0.003], null, 0.002);
          K.box(stepL, [0.09, 0.012, 0.004], sg, [x, y - 0.012, z + 0.01], null, 0);
          K.ext(stepL, [[-0.05, 0], [0.05, 0], [0.18, 0.36], [-0.18, 0.36]], 0.002, wash, [x, y - 0.075, z], [90, 0, 0], 0);
        });
      }
      const pathL = K.part('pathLights', [0, 0, 0], null, 'Modern bollard path lights');
      const bm = K.std(0x2a2c2f, { metalness: 0.6, roughness: 0.4 });
      [[-0.95, TF + 1.4], [0.95, TF + 2.3], [-0.95, TF + 3.2]].forEach(([x, z]) => {
        K.box(pathL, [0.1, 0.55, 0.1], bm, [x, 0.275, z], null, 0.01);
        K.box(pathL, [0.012, 0.06, 0.082], sg, [x + (x < 0 ? 0.051 : -0.051), 0.48, z], null, 0);
        K.cyl(pathL, [0.45, 0.45, 0.003, 28], K.std(0xffe7b0, { transparent: true, opacity: 0.12, emissive: 0xffd28a, emissiveIntensity: 0.5, depthWrite: false }), [x + (x < 0 ? 0.3 : -0.3), 0.022, z]);
      });
      const pvl = K.part('paverLights', [0, UP + 0.002, TF - 0.12], null, 'LED paver lights in the terrace edge');
      for (let i = 0; i < 6; i++) {
        const x = [-3.0, -2.2, -1.4, 1.4, 2.2, 3.0][i];
        K.box(pvl, [0.2, 0.006, 0.1], sg, [x, 0, 0], null, 0);
      }
      const posts = K.part('posts', [0, UP, 0], null, 'Steel posts for café lights');
      const PP = [[-3.3, WZ + 0.3], [3.3, WZ + 0.3], [3.3, TF - 0.15], [-3.3, TF - 0.15]];
      PP.forEach(([x, z]) => {
        K.box(posts, [0.08, 2.8, 0.08], bm, [x, 1.4, z], null, 0.006);
        K.box(posts, [0.22, 0.01, 0.22], bm, [x, 0.005, z], null, 0);
      });
      const strings = K.part('strings', [0, UP, 0], null, 'Café string lights (zigzag)');
      const bulb = glow(K, 0xfff1cc, 2.2);
      const run = (A, B) => {
        const n = Math.max(6, Math.round(Math.hypot(B[0] - A[0], B[1] - A[1]) / 0.45));
        let prev = null;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const p = [A[0] + (B[0] - A[0]) * t, 2.75 - Math.sin(Math.PI * t) * 0.35, A[1] + (B[1] - A[1]) * t];
          if (prev) K.bar(strings, prev, p, 0.004, 'black');
          if (i > 0 && i < n) K.sph(strings, 0.032, bulb, [p[0], p[1] - 0.05, p[2]]);
          prev = p;
        }
      };
      run(PP[0], PP[2]);
      run(PP[1], PP[3]);
      run(PP[0], PP[3]);
      run(PP[1], PP[2]);
      const spl = new THREE.PointLight(0xffd59a, 0.7, 5, 2);
      spl.position.set(0, 2.3, WZ + 1.6);
      strings.add(spl);
      // add-ons
      AO.flood(K, 'aoFlood', [-3.0, 2.9, WZ + 0.12], 0);
      const num = K.part('aoNumber', [1.8, UP + 1.6, WZ + 0.11], null, 'Lit house numbers');
      K.box(num, [0.5, 0.18, 0.03], blackMetal(K), [0, 0, 0], null, 0.01);
      K.box(num, [0.46, 0.14, 0.004], glow(K, 0xfff1cc, 0.8), [0, 0, 0.017], null, 0);
      [-0.12, 0, 0.12].forEach((x) => K.box(num, [0.06, 0.1, 0.006], 'black', [x, 0, 0.02], null, 0.002));
      AO.speaker(K, 'aoSpeaker', [-2.6, UP, WZ + 2.5], 'Landscape speaker (zone-controlled)');
      AO.uplights(K, 'aoUplight', [[-2.2, TF + 1.5, 180], [2.2, TF + 1.5, 180]], 'Shrub uplights');
    }
  );

  const pth = TB.repair('backyard', 'path-lights');
  const pthAdd = {
    spot: ao({ id: 'spot', part: 'aoSpot', name: 'Solar spotlight', cat: 'Lighting', blurb: 'Separate-panel solar spot that uplights a shrub.', cost: [25, 60], how: 'Stake the light at the shrub and run its panel lead out to where it gets full sun.', needs: ['Solar spotlight with remote panel'], shop: 'Solar spotlight remote panel' }),
    flood: ao({ id: 'flood', part: 'aoFlood', name: 'Solar motion floodlight', cat: 'Safety', blurb: 'Bright motion light with no wiring.', cost: [30, 90], how: 'Screw it to the wall 8–10 ft up with the panel facing south, and aim the sensor down the walk.', needs: ['Solar motion floodlight', 'Masonry anchors'], shop: 'Solar motion flood light' }),
    number: ao({ id: 'number', part: 'aoNumber', name: 'Solar house numbers', cat: 'Finish', blurb: 'Lit address plaque that charges itself.', cost: [40, 120], how: 'Mount at eye level by the door where the panel gets sun; 4″+ numbers read from the street.', needs: ['Solar address plaque'], shop: 'Solar lighted address plaque' }),
    string: ao({ id: 'string', part: 'aoString', name: 'Solar string lights', cat: 'Lighting', blurb: 'Zigzag café lights over the walk on four posts.', cost: [60, 160], how: 'Set posts in post spikes or concrete, run a guide wire, and clip on the lights with the panel on the sunniest post.', needs: ['Solar string lights', '4 posts', 'Guide wire kit'], shop: 'Solar string lights outdoor' }),
    stringLV: ao({ id: 'string', part: 'aoString', name: 'Café lights', cat: 'Lighting', blurb: 'Café lights over a seating spot, switched by the smart transformer.', cost: [150, 350], how: 'Plug them into the transformer’s switched 120 V outlet (if it has one) so the app turns them on with the rest.', needs: ['LED string lights', '4×4 posts', 'Guide wire kit'], shop: 'Outdoor LED string lights' }),
    speaker: ao({ id: 'speaker', part: 'aoSpeaker', name: 'Landscape speaker', cat: 'Tech', blurb: 'Rock speaker that shares the lighting trench.', cost: [120, 400], how: 'Run speaker wire in the same trench (not the same cable) back to an outdoor amp, or use a battery Bluetooth model.', needs: ['Outdoor rock speaker', 'Direct-burial speaker wire'], shop: 'Outdoor rock speaker' }),
  };
  pth.variants = [
    {
      id: 'starter',
      name: 'Starter: solar stake lights',
      blurb: 'Six solar path lights staggered along the walk. No wiring, no trench, done in under an hour.',
      level: 1,
      time: '30–60 min',
      cost: '$40–150',
      model: 'pathSolar',
      summary: 'The simplest way to light a walk: six solar stake lights spaced 6–8 ft apart, staggered side to side. There’s no wiring at all, so placement is everything: each light needs a full day of direct sun on its little panel to glow all evening.',
      intro: { show: ['lights'], spin: true, preview: true },
      safety: ['Stakes only go 4–6″ deep, but if you know a utility line runs right along the walk, call 811 (the free “call before you dig” line) first.', 'Don’t hammer on the light heads; make a pilot hole and push instead.', 'Recycle old rechargeable batteries at a hardware store drop-off; don’t put them in the trash.'],
      causes: [['Sun', '6–8 hours of direct sun on the panel; avoid eaves, trees and the shady side of the house.'], ['Spacing', '6–8 ft apart, staggered; closer near steps or turns.'], ['Brightness', 'Look for 10+ lumens (a measure of light output) and warm white, about 2700–3000K, which looks like a cozy indoor bulb.'], ['Night light nearby', 'A porch light or streetlight can fool the dusk sensor so the light never turns on.']],
      tools: ['Solar path lights (6)', 'Marking flags', 'Tape measure', 'Long screwdriver or ½″ metal rod for pilot holes', 'Watering can (for hard soil)', 'Soft cloth'],
      steps: [
        { t: 'Check the sun', d: 'On a sunny day, look along the walk in the morning, at noon and mid-afternoon. Mark the strips that stay sunny with a stick or flag; skip spots under eaves, trees or the house’s shadow.', why: 'A solar light only stores what its panel collects: half a day of shade means half an evening of light.', tip: 'Take a phone photo of the walk at each check from the same spot; comparing the three shows the shady patches instantly.', ok: 'You have marked spots along both sides that get sun in all three checks.', v: { cam: [3.6, 3.0, 3.8], at: [0, 0, 0], hi: ['sunCheck'], show: ['sunCheck'] } },
        { t: 'Switch on and charge', d: 'Unbox the lights, pull any plastic battery tab, and slide the switch under the panel to ON (or AUTO). Leave them in full sun for a whole day before installing.', why: 'Many lights ship switched off. A full first charge wakes the batteries up so they reach full run time sooner.', tip: 'Cover a panel with your hand in daylight: the LED should come on within a few seconds. If it doesn’t, check the switch and that the battery sits + to + in its holder.', ok: 'Each light switches on when you cover its panel, and off again when you uncover it.', v: { cam: [2.6, 1.6, 3.2], at: [1.5, 0.1, 1.4], hi: ['boxes'], show: ['boxes'] } },
        { t: 'Flag the spots', d: 'Push a marking flag every 6–8 ft along the walk, alternating sides, about 6″ back from the edge. Put one at each step or turn.', why: 'Staggered lights make pools of light that overlap down the walk without looking like an airport runway.', tip: 'Cut a stick to your spacing and lay it along the walk instead of measuring each time. Stand at the door and look: adjust any flag that doesn’t look evenly spaced from there.', ok: 'Flags zig-zag evenly down the walk, all about the same distance from the edge.', v: { cam: [3.4, 2.4, 3.6], at: [0, 0.2, 0], hi: ['flags'], show: ['flags'], hide: ['boxes', 'sunCheck'], tool: { id: 'tape', at: [0.65, 0.02, -0.4], rot: [0, 90, 0], scale: 1.4 } } },
        { t: 'Make pilot holes', d: 'Push a long screwdriver or metal rod about 6″ into the soil at each flag and wiggle it slightly. If the ground is hard, soak each spot with a watering can and wait 10 minutes.', why: 'Plastic stakes snap if you force them into hard or rocky soil; a pilot hole lets them slide in.', tip: 'If you hit a rock, move over 2″ and try again rather than forcing it. In very dry clay, pour a cup of water in the hole itself.', ok: 'The rod slides in to 6″ without you having to lean your full weight on it.', v: { cam: [1.8, 1.2, 1.8], at: [0.65, 0.05, 0.95], hi: ['pilots'], show: ['pilots'], tool: { id: 'screwdriver', at: [0.68, 0.0, 0.95], rot: [0, 0, 0], anim: 'push', scale: 1.4 } } },
        { t: 'Set the lights', d: 'Push each light straight down into its hole by the stake or pole, not the head, until the stake is fully in the ground. Look at it from two sides to make sure it stands straight up.', why: 'Plumb (straight up and down) lights look intentional; leaning ones look forgotten, and a tilted panel collects less sun.', tip: 'If a light leans, pull it, pack the hole with soil, firm it with your heel, and push it in again 1″ over.', ok: 'Every light stands straight from both directions and doesn’t wobble when you flick it.', v: { cam: [3.4, 2.4, 3.6], at: [0, 0.2, 0], hi: ['lights'], show: ['lights'], hide: ['flags', 'pilots'] } },
        { t: 'Check at dusk', d: 'Go out an hour after sunset and look at the walk. Move any dim light to a sunnier spot, and wipe all panels clean with a damp cloth.', why: 'Placement and clean panels decide brightness; dirt or pollen on a panel can cut charging noticeably.', tip: 'If one light stays off near the porch light, it’s seeing that light as daylight: move it a few feet or turn its sensor away. If a light dies after a year, replace its battery with the same rechargeable type (never regular alkaline).', ok: 'All six glow at similar brightness and the walk has no dark gaps between pools of light.', v: { cam: [4.0, 2.6, 4.2], at: [0, 0.2, 0], hi: ['lights'], fx: 'on' } },
      ],
      learn: {
        how: 'Each light has a small solar panel that charges a rechargeable battery during the day. A light sensor turns the LED on at dusk, and it runs until the battery runs low. No wiring means no transformer, but brightness and run time depend entirely on how much sun the panel gets.',
        specs: [['Spacing', '6–8 ft, staggered'], ['Sun', '6–8 hr direct'], ['Stake depth', '4–6″'], ['Typical output', '5–30 lumens'], ['First charge', 'A full sunny day, switched ON'], ['Battery life', '1–2 years (rechargeable AA/AAA NiMH)']],
        terms: [['Lumens', 'How much light a fixture puts out.'], ['NiMH', 'Nickel-metal hydride, the rechargeable battery type in most solar lights.'], ['Color temperature', 'Warm (2700K) to cool (5000K) white.'], ['Dusk sensor', 'A tiny light sensor that switches the LED on when it gets dark.']],
        mistakes: ['Putting lights in shade.', 'Forgetting to switch them ON.', 'Spacing them too close (runway look).', 'Replacing rechargeable batteries with regular alkaline ones.'],
        tips: ['Replace batteries with the same type and capacity (mAh, printed on the battery) when they fade, usually every 1–2 years.'],
      },
      pro: 'Not needed. Step up to low-voltage wired lighting if you want brighter, more reliable light.',
      tricks: [['Buy one, test, then buy the rest', 'Put a single light in your actual spot for a few nights before buying six; brightness claims on boxes vary a lot.'], ['Upgrade the battery', 'A higher-capacity rechargeable (say 1200 mAh instead of 600) of the same type and size often doubles run time on cheap lights.'], ['Winter reality', 'Short, cloudy days mean short run times. Switch them off and store them for winter in snowy climates to save the batteries.'], ['Clean panels monthly', 'A wipe with a damp microfiber cloth after pollen season restores brightness.'], ['Revive a cloudy panel', 'Yellowed plastic panels can be polished clear with headlight-restoration compound, then sealed with clear spray.'], ['Mower-proof them', 'Set them 6″ back from the lawn edge, not right on it, so the mower and trimmer miss them.']],
      refs: [['Solar Path Light Owner’s Manual (Home Depot product PDF)', 'https://images.thdstatic.com/catalog/pdfImages/81/8171a39f-23ca-4d44-9f2a-c941d2cd9998.pdf'], ['How to Plan an LED Landscape Lighting Installation (Super Bright LEDs)', 'https://www.superbrightleds.com/blog/planning-for-an-led-landscape-lighting-installation.html'], ['Call Before You Dig (811)', 'https://call811.com/']],
      addons: [pthAdd.spot, pthAdd.flood, pthAdd.number, pthAdd.string],
    },
    { id: 'classic', name: 'Classic: low-voltage path lights', blurb: 'Three 12 V path lights on a plug-in transformer, cable in a slit trench.', level: 1, time: '2–3 hrs', cost: '$150–500' },
    {
      id: 'showpiece',
      name: 'Showpiece: full lighting plan',
      blurb: 'Path lights, tree uplights and a wall wash on hub wiring and a smart Wi-Fi transformer.',
      level: 2,
      time: '1–2 days',
      cost: '$900–2,500',
      model: 'pathPlan',
      summary: 'A designed front-yard lighting plan: six brass path lights, two uplights on the tree, and four wall-wash lights on the house, all on hub wiring from a 300 W smart low-voltage transformer with app-controlled zones and a timer that follows sunset.',
      intro: { show: ['transformer', 'cables', 'hubs', 'pathLights', 'treeUps', 'wallWash', 'zones'], spin: true, preview: true, fx: 'on' },
      safety: ['Plug the transformer into a GFCI outlet (the kind with test and reset buttons) with a weatherproof in-use “bubble” cover; if there isn’t one, have an electrician add it.', 'Call 811 (the free “call before you dig” line) before trenching.', 'Keep the total fixture load under 80% of the transformer’s rating so it runs cool.', 'Use waterproof direct-burial connectors only; indoor wire nuts and tape corrode and fail outdoors.', 'Unplug the transformer whenever you cut or join cable; 12 V won’t shock you, but a short can melt connectors.'],
      causes: [['Plan layers', 'Path lights (safety), uplights (trees and features), wall wash (house): each layer on its own zone.'], ['Size the transformer', 'Add up the fixture watts, multiply by 1.25, and pick a transformer at least that big. 12 LED fixtures at 4–7 W is about 60 W, so a 300 W unit leaves room to grow.'], ['Hub wiring', 'Run one cable from the transformer to each hub, then equal-length leads from the hub to each fixture, so all get the same voltage.'], ['One color', 'Pick one color temperature, usually 2700K warm white, for every fixture.']],
      tools: ['300 W smart transformer (multi-tap, Wi-Fi)', '12/2 and 10/2 direct-burial low-voltage cable', '6 path lights, 2 uplights (narrow 36° beam), 4 wash lights (wide 60° beam)', 'Hub junctions & gel-filled direct-burial connectors', 'Flat spade or rental trencher', 'Digital multimeter', 'Marking flags in 3 colors', 'Drill, masonry bit & anchors', 'Wire stripper'],
      steps: [
        { t: 'Draw the plan and flag it', d: 'Sketch the yard from above. Decide what each light does (light the path, uplight the tree, wash the house) and push a flag at every fixture spot, one flag color per zone. Add up the watts on your sketch.', why: 'Lighting in layers, each with its own job, is what makes a pro install look calm instead of cluttered.', tip: 'Walk the yard at night with a strong flashlight and point it where each fixture would go; you’ll see right away which spots matter and which cause glare.', ok: 'Every fixture has a colored flag, and your sketch lists the total watts per zone.', v: { cam: [5.6, 4.0, 6.0], at: [0, 0.3, -0.6], hi: ['plan'], show: ['plan'], tool: { id: 'tape', at: [0.8, 0.02, 0.5], rot: [0, 90, 0], scale: 1.6 } } },
        { t: 'Mount the smart transformer', d: 'Screw the transformer to the wall at least 12″ above the ground next to the GFCI outlet, using masonry anchors on brick. Plug it in and pair it with its app over Wi-Fi.', why: 'Off the ground it stays dry and clear of sprinklers and snow; pairing now lets you test each zone as you wire it.', tip: 'Check your phone shows at least two bars of Wi-Fi at that wall before drilling. If it doesn’t, add a mesh Wi-Fi point inside or choose a model with a range extender.', ok: 'The transformer is solid on the wall, its status light shows connected, and the app can switch it on and off.', v: { cam: [5.0, 1.6, -0.6], at: [3.8, 0.6, -3.0], hi: ['transformer'], show: ['transformer'], tool: { id: 'drill', at: [3.9, 0.85, -2.98], rot: [-90, 0, 0], anim: 'spin' } } },
        { t: 'Trench the home runs', d: 'Cut a slit trench about 6″ deep from the transformer to each hub location by pushing a flat spade in and rocking it. Lay one cable (the home run) in each trench, leaving 2 ft of slack at each end.', why: 'A separate run to each hub, instead of one long daisy chain, keeps the farthest lights from getting dim.', tip: 'Water the lawn the day before; damp soil slices cleanly. Lift the sod flap, lay the cable, and step the flap back down so the lawn hardly shows it.', ok: 'Cable sits at 6″ in every trench with a coil of slack at both ends.', v: { cam: [5.6, 4.6, 5.4], at: [0, 0, -0.8], hi: ['trench', 'cables'], show: ['trench', 'cables'], hide: ['plan'], tool: { id: 'shovel', at: [0.65, 0.02, -0.6], rot: [5, 0, -8], anim: 'push' } } },
        { t: 'Set the hubs', d: 'At each hub, cut the fixture leads to equal lengths. Join them to the home run with gel-filled direct-burial connectors, matching wire to wire (ribbed side to ribbed side).', why: 'Equal leads from a hub give every fixture the same voltage, so they match in brightness.', tip: 'Strip ½″ of insulation and twist the copper tight before the connector; loose strands cause flickering. Wrap the joined bundle in a valve box or bury it with a flag so you can find it later.', ok: 'Tug each wire: none pull out of the connectors, and the gel squeezes out a little around each one.', v: { cam: [1.8, 1.2, 1.6], at: [0.6, 0.05, 0.4], hi: ['hubs'], show: ['hubs'], tool: { id: 'linemans', at: [0.66, 0.1, 0.42], rot: [0, 0, 0], anim: 'squeeze' } } },
        { t: 'Install the path lights', d: 'Push the path-light stakes in 8–10 ft apart, alternating sides, 6–12″ back from the walk edge. Connect each to its hub lead.', why: 'Lights set back from the edge light the walk and plants instead of shining into eyes or getting kicked.', tip: 'Coil 2 ft of extra lead under the mulch at each fixture; it lets you move a light later without splicing.', ok: 'Each path light stands plumb and lights a pool that just meets the next one.', v: { cam: [4.0, 2.4, 4.4], at: [0, 0.3, 0.4], hi: ['pathLights'], show: ['pathLights'] } },
        { t: 'Uplight the tree', d: 'Stake two uplights on opposite sides of the trunk, 1–2 ft out from it, and aim each into the canopy.', why: 'Lighting a tree from two sides gives it depth and shape; a single light makes it look flat.', tip: 'Point uplights away from where people sit or walk; if you can see the bulb from the patio or the street, tilt it more or add a glare shield.', ok: 'At night the trunk and the underside of the leaves glow evenly with no single hot spot.', v: { cam: [1.0, 2.4, 5.2], at: [-2.6, 1.8, 1.2], hi: ['treeUps'], show: ['treeUps'] } },
        { t: 'Wash the house wall', d: 'Stake the wide wash fixtures 18–24″ out from the house between windows, aimed up the wall.', why: 'Too close makes harsh scallops of light; set back, the beam spreads into an even wash.', tip: 'Never aim at windows. If light lands on glass, slide the fixture sideways or reduce its tilt.', ok: 'The wall shows a smooth, soft wash with no bright circles at the bottom and no light on the windows.', v: { cam: [0.6, 1.8, 2.4], at: [0, 1.2, -3.0], hi: ['wallWash'], show: ['wallWash'] } },
        { t: 'Test voltage and aim at night', d: 'After dark, set your multimeter to AC volts and touch its probes to the connectors at each hub. Aim for about 11–12 V (most LED fixtures accept roughly 9–15 V; check the label). If a hub reads low, move its home run to a higher tap on the transformer. Fine-tune every aim.', why: 'Voltage drops along cable, and aiming in daylight is guesswork; at night you see the real glare and coverage.', tip: 'Have a helper stand at the street and at the front door while you adjust; aim from where people actually look.', ok: 'Each hub reads within the target range and the lights look equally bright.', v: { cam: [6.6, 4.6, 7.6], at: [-0.4, 1.2, -0.6], hi: ['pathLights', 'treeUps', 'wallWash'], fx: 'on', tool: { id: 'multimeter', at: [0.9, 0.0, 0.6], rot: [0, -30, 0], scale: 1 } } },
        { t: 'Set app zones and bury', d: 'In the app, group fixtures into zones: path, tree and house. Set them to turn on at dusk, with the house and tree off at 11 pm and the path on later. Then close the trenches and press the sod down.', why: 'Zones let the house wash shut off late while path lights stay on for safety, saving power and keeping neighbors happy.', tip: 'Take photos of the open trenches with a tape measure in frame before burying; you’ll know exactly where the cables are when you plant or aerate.', ok: 'Each zone switches on and off from the app on its own, and the lawn is closed with no cable showing.', v: { cam: [4.6, 1.4, -1.0], at: [3.8, 0.6, -3.0], hi: ['transformer', 'zones'], show: ['zones'], hide: ['trench'], fx: 'on' } },
      ],
      learn: {
        how: 'A transformer steps 120 V household power down to about 12–15 V, low enough to be safe to touch. Cable loses voltage over distance, so pros run separate home runs to hubs near groups of fixtures and give each fixture an equal lead. A smart transformer adds Wi-Fi, a timer that follows sunset by date and location, and zones you can switch separately.',
        specs: [['Fixture voltage', '≈ 11–12 V (LED range often 9–15 V)'], ['Cable depth', '≥ 6″'], ['Path spacing', '8–10 ft'], ['Uplight beam', '15–36° for trees'], ['Wash beam', '60–120°, 18–24″ from the wall'], ['Load', '≤ 80% of rating'], ['Cable', '12/2 to ≈ 100 ft, 10/2 for longer runs']],
        terms: [['Home run', 'A cable straight from the transformer to a hub.'], ['Hub', 'Junction where one run splits into equal fixture leads.'], ['Tap', 'Transformer output (12, 13, 14, 15 V) used to make up for voltage drop.'], ['Astronomic timer', 'Timer that tracks sunset by date and location.'], ['Voltage drop', 'Voltage lost as current travels along a long cable.']],
        mistakes: ['Daisy-chaining all fixtures on one long run.', 'Aiming lights at windows or neighbors.', 'Mixing color temperatures.', 'Using wire nuts and tape underground.'],
        tips: ['Stick to one color temperature (2700K) across every fixture.', 'Leave a coil of extra cable at each fixture so you can move it later.'],
      },
      pro: 'You need a new outdoor outlet or circuit, more than about 300 W of lighting, or lights mounted up in trees (climbing and mounting).',
      tricks: [['Mock it up with flashlights', 'Before buying, set cheap LED flashlights on the ground where fixtures would go and look at the yard at night; it’s a free design preview.'], ['Fewer, better lights', 'Six well-placed fixtures look more expensive than twenty; darkness between pools of light is part of the design.'], ['Label the transformer', 'Tag each home run at the transformer with its zone name; future you will thank you.'], ['Flickering light?', 'Nine times out of ten it’s a loose connector or corrosion at the fixture socket; reseat it and add dielectric grease.'], ['Buy fixtures with replaceable lamps', 'Fixtures that take a standard MR16 or bi-pin LED lamp can be repaired; sealed cheap fixtures get thrown away.'], ['Check every spring', 'Walk the system at night each spring: re-aim lights pushed by growing plants and trim leaves off lenses.']],
      refs: [['Landscape Lighting Hub Connections (VOLT Lighting)', 'https://www.voltlighting.com/article-landscape-lighting-hub-connections/p/article-hub-connections'], ['Landscape Lighting Voltage Drop and Wiring Methods (Landscape Architect)', 'https://landscapearchitect.com/landscape-articles/landscape-lighting-voltage-drop-and-wiring-methods'], ['Understanding the NEC for Outdoor Buried Wiring (Super Bright LEDs)', 'https://www.superbrightleds.com/blog/understanding-the-nec-code-for-outdoor-buried-electrical-wiring.html'], ['How to Plan an LED Landscape Lighting Installation (Super Bright LEDs)', 'https://www.superbrightleds.com/blog/planning-for-an-led-landscape-lighting-installation.html']],
      addons: [pthAdd.stringLV].concat(pick(pth, ['uplight', 'flood', 'number'])),
    },
    {
      id: 'luxury',
      name: 'Luxury: lit steps, well lights + app scenes',
      blurb: 'Recessed step lights, in-ground well lights grazing the house, paver lights, café lights and app-controlled scenes.',
      level: 3,
      time: '2–4 days',
      cost: '$3,000–8,000',
      model: 'pathLux',
      summary: 'A full evening scene: louvered step lights core-drilled into each riser, in-ground well lights grazing the house wall, LED paver lights at the terrace edge, low bollard path lights and café lights, all on a 600 W multi-zone smart transformer with one-tap app scenes.',
      intro: { show: ['transformer', 'wellCans', 'wellLights', 'stepLights', 'pathLights', 'paverLights', 'posts', 'strings', 'zones'], spin: true, preview: true, fx: 'on' },
      safety: ['Core-drill wet with a diamond bit, and wear eye and ear protection and a respirator; dry-drilling masonry makes silica dust that scars lungs.', 'Call 811 (the free “call before you dig” line) before trenching.', 'The transformer needs a GFCI outlet (test and reset buttons) with an in-use bubble cover; 120 V café lights need GFCI protection too.', 'Well lights must be rated for in-ground use (and for drive-over if they’re in a driveway).', 'Unplug the transformer before cutting or joining any cable.'],
      causes: [['Zones', 'Steps and path (safety, on all evening), house wash, terrace café lights, garden: each on its own zone.'], ['Retrofit or new?', 'Step lights are easiest set while building the steps; in existing steps you core-drill the risers.'], ['Drainage', 'Well lights need a gravel pocket under them or they fill with water and fail.'], ['Transformer size', 'Total fixture watts × 1.25 must stay under the rating; 600 W with zones leaves room to add later.']],
      tools: ['600 W multi-zone smart transformer', 'Step lights (6), well lights (4), paver lights (6), bollards (3)', 'Hammer drill or core drill + diamond core bits & water bottle', '¾″ PVC sleeves & 10/2 + 12/2 direct-burial cable', 'Drainage gravel for well-light pockets', 'Steel posts, base plates & café lights + guide wire kit', 'Digital multimeter', 'Gel-filled direct-burial connectors', 'Flat spade & post-hole digger'],
      steps: [
        { t: 'Plan the zones', d: 'Flag every fixture spot and write its zone on the flag: steps and path, house wash, terrace café lights. Total the watts for each zone.', why: 'Zones decide the wiring: each zone is its own cable run from the transformer.', tip: 'Use a different flag color per zone and photograph the yard from an upstairs window; it becomes your wiring map.', ok: 'Every fixture has a flag and zone, and each zone’s watts are under its transformer output limit.', v: { cam: [5.8, 4.2, 6.4], at: [0, 0.4, -0.6], hi: ['plan'], show: ['plan'], tool: { id: 'tape', at: [0.9, 0.02, 1.6], rot: [0, 90, 0], scale: 1.6 } } },
        { t: 'Mount the transformer', d: 'Mount the multi-zone transformer on the house at least 12″ above grade next to the GFCI outlet, and pair it with the app.', why: 'A multi-zone unit switches each run separately from one box, and up off the ground it stays dry.', tip: 'Leave a foot of wall space below it for the cable bundle and a drip loop (a downward U in each cable so rain drips off before reaching the box).', ok: 'The transformer is solid on the wall and every zone toggles in the app.', v: { cam: [4.8, 1.8, -1.0], at: [3.0, 1.0, -3.1], hi: ['transformer'], show: ['transformer'], tool: { id: 'drill', at: [3.0, 1.3, -3.08], rot: [-90, 0, 0], anim: 'spin' } } },
        { t: 'Trench and sleeve', d: 'Trench about 6″ deep to each zone. Slide ¾″ PVC sleeves (empty pipes) under the terrace edge and along the wall base wherever cable passes under paving.', why: 'Sleeves let you pull or replace cable later without lifting pavers.', tip: 'Leave a pull string in every sleeve and tape both ends shut. If a sleeve won’t push through, a garden hose jetting water will bore a path under the paving.', ok: 'Each sleeve has a pull string, and both ends are taped and marked.', v: { cam: [5.6, 3.6, 3.4], at: [1.6, 0.3, -1.0], hi: ['conduit'], show: ['conduit'], hide: ['plan'], tool: { id: 'shovel', at: [1.0, 0.02, 1.6], rot: [5, 0, -8], anim: 'push' } } },
        { t: 'Set the well-light cans', d: 'At each spot, lift a paver and dig 6″ deeper than the can. Fill the bottom with gravel, then set the can so its rim sits flush with the paving and level.', why: 'Without a gravel pocket under it, rain pools in the can and the fixture fails.', tip: 'Pour a bucket of water into the hole before setting the can: if it drains in a few minutes, you’re fine; if not, dig deeper and add more gravel.', ok: 'The rim is flush with the pavers, the bubble on a small level is centered, and a test bucket of water drains away.', v: { cam: [1.4, 2.0, -0.6], at: [-1.4, 0.5, -2.9], hi: ['wellCans'], show: ['wellCans'], tool: { id: 'level', at: [-1.4, 0.47, -2.9], rot: [0, 0, 0], scale: 1.2 } } },
        { t: 'Core-drill the risers', d: 'Mark each light center on a riser (the vertical face of the step). Drill with a diamond core bit, keeping it wet with a squeeze bottle. Start tilted to score the surface, then ease the bit straight.', why: 'Water keeps the diamond bit cool and the silica dust down; starting at an angle stops the bit skating.', tip: 'Drill at the speed in the bit instructions and let the weight do the work. If it stops cutting, it’s glazed: drill a few seconds into a cinder block to expose fresh diamonds.', ok: 'Each hole is round, clean-edged and the size the fixture calls for.', v: { cam: [2.0, 1.2, 2.2], at: [0.4, 0.25, 0.4], hi: ['coreHoles'], show: ['coreHoles'], tool: { id: 'drill', at: [0.45, 0.37, 0.05], rot: [-90, 0, 0], anim: 'spin' } } },
        { t: 'Install the step lights', d: 'Fish each fixture lead through its hole to the cable, connect it, then press the louvered light into the riser and tap it flush with a rubber mallet.', why: 'Louvers aim light down onto the tread, so steps are lit without glare in people’s eyes.', tip: 'Test each light before pressing it in. If one is loose in its hole, a bead of exterior silicone around the body holds it.', ok: 'Every step light sits flush and lights its tread evenly with no glare when you walk toward it.', v: { cam: [2.0, 1.2, 2.2], at: [0.4, 0.25, 0.4], hi: ['stepLights'], show: ['stepLights'], hide: ['coreHoles'], tool: { id: 'hammer', at: [-0.45, 0.4, 0.1], rot: [0, 30, 0], anim: 'tap', scale: 1.3 } } },
        { t: 'Path bollards and paver lights', d: 'Set the bollards (short post lights) along the walk and swap edge pavers for LED paver lights, running their leads through the sleeves.', why: 'Low bollards light the walk without glare; paver lights outline the terrace edge so nobody steps off it.', tip: 'Set paver lights a hair below the surrounding pavers (about 1/16″) so mowers, shovels and heels don’t catch them.', ok: 'The walk is lit end to end, and the terrace edge glows as a clear line.', v: { cam: [4.6, 2.6, 4.2], at: [0, 0.3, 0.6], hi: ['pathLights', 'paverLights'], show: ['pathLights', 'paverLights'] } },
        { t: 'Café-light posts', d: 'Bolt the steel posts to the terrace corners (on footings or through-bolted to the wall). Stretch a steel guide wire between them, then clip the café lights to it in a zigzag 8–9 ft up.', why: 'The guide wire carries the weight and wind load, so the light strand never holds itself up.', tip: 'Tension the guide wire with a turnbuckle so it sags only a few inches; if the lights sway in wind, add a clip every bulb.', ok: 'The wire is taut, the strand hangs in even swoops, and posts stay plumb with the lights on.', v: { cam: [6.0, 3.6, 4.4], at: [0, 2.0, -1.6], hi: ['posts', 'strings'], show: ['posts', 'strings'], tool: { id: 'level', at: [3.3, 1.5, -0.25], rot: [0, 0, 90], scale: 1.6 } } },
        { t: 'Well lights and testing', d: 'Drop the fixtures into the well-light cans and connect each zone. After dark, measure voltage at the last fixture of every run with a multimeter and move runs to a higher tap if they read low.', why: 'Each zone can sit on its own tap, so near and far lights match.', tip: 'Aim grazing lights 6–12″ from a textured wall to show off the stone. If you see a bright stripe at the bottom of the wall, tilt the fixture back a few degrees.', ok: 'Each run reads about 11–12 V at the far end and the wall glows evenly.', v: { cam: [4.2, 2.6, 2.0], at: [0, 1.2, -2.6], hi: ['wellLights'], show: ['wellLights'], fx: 'on', tool: { id: 'multimeter', at: [2.0, 0.45, -2.6], rot: [0, -30, 0], scale: 1 } } },
        { t: 'Build app scenes', d: 'In the app create scenes: “Arrive” (path, steps, wash), “Dinner” (café lights, wash dimmed) and “Late” (steps only). Set the steps zone to dusk-to-midnight.', why: 'Scenes turn many lights into one tap and keep the yard dark when no one’s outside.', tip: 'Give scenes names your family will say out loud if you link a voice assistant; short and distinct works best.', ok: 'Each scene recalls correctly with one tap, and the lights follow the schedule the next night.', v: { cam: [5.8, 3.8, 6.4], at: [0, 0.9, -0.6], hi: ['zones', 'transformer'], show: ['zones'], fx: 'on' } },
      ],
      learn: {
        how: 'This is the same 12 V system as a basic kit, scaled up: a large multi-zone transformer feeds separate runs for each layer of light. Fixtures built into hardscape (step lights in risers, well lights in the paving, paver lights at the edge) need sleeves and drainage planned in, so they can be serviced without tearing anything up.',
        specs: [['Transformer', '600 W, multi-zone'], ['Cable depth', '≥ 6″, in sleeves under paving'], ['Step light height', '6–8″ above the tread'], ['Well light sump', '6″ gravel'], ['Café light height', '8–9 ft'], ['Fixture voltage', '≈ 11–12 V (check the label)'], ['Grazing distance', '6–12″ from the wall']],
        terms: [['Well light', 'Fixture recessed in the ground, aimed up.'], ['Grazing', 'Lighting a textured wall from close below to show its texture.'], ['Scene', 'A saved set of zone levels recalled with one tap.'], ['Core drill', 'Hollow diamond bit that cuts a clean round hole in masonry.'], ['Bollard', 'A short post-style light.']],
        mistakes: ['Well lights without drainage.', 'Glare from unshielded step lights.', 'Running every fixture on one zone.', 'No sleeves under paving.'],
        tips: ['Set step lights on every riser or every other one, never randomly.', 'Grazing works best within 6–12″ of a textured wall.'],
      },
      pro: 'For new circuits, café lights hardwired to 120 V, large transformers, or core drilling finished stone you can’t replace.',
      tricks: [['Practice core drilling', 'Drill two test holes in a spare paver or block before touching the steps; you’ll learn the bit’s speed and feel.'], ['Buy fixtures from one line', 'Same maker, same finish, same color temperature: mismatched whites are the giveaway of a DIY job.'], ['Dimmable zones', 'Choose a transformer with per-zone dimming; most scenes look best at 60–80%.'], ['Water in a well light?', 'Unscrew the lens, dry it, check the gasket, and dig the gravel pocket deeper; a fixture that fills again needs a better drain.'], ['Map it', 'Draw a simple map of every cable, hub and sleeve and tape it inside the transformer cover.'], ['Mind the neighbors', 'Shield lights so you can’t see bulbs from the street or next door; many towns limit light spilling past the property line.']],
      refs: [['Landscape Lighting Hub Connections (VOLT Lighting)', 'https://www.voltlighting.com/article-landscape-lighting-hub-connections/p/article-hub-connections'], ['Landscape Lighting Voltage Drop and Wiring Methods (Landscape Architect)', 'https://landscapearchitect.com/landscape-articles/landscape-lighting-voltage-drop-and-wiring-methods'], ['Understanding the NEC for Outdoor Buried Wiring (Super Bright LEDs)', 'https://www.superbrightleds.com/blog/understanding-the-nec-code-for-outdoor-buried-electrical-wiring.html'], ['Call Before You Dig (811)', 'https://call811.com/']],
      addons: [pthAdd.speaker].concat(pick(pth, ['uplight', 'flood', 'number'])),
    },
  ];
  pth.defaultVariant = 'classic';

  /* =====================================================================================
     BACKYARD COURT
     ===================================================================================== */
  // Straight painted line from (x0,z0) to (x1,z1) at height y.
  function line(K, parent, x0, z0, x1, z1, y, mat, w) {
    w = w || 0.05;
    const L = Math.hypot(x1 - x0, z1 - z0);
    const g = K.group(parent, [(x0 + x1) / 2, y, (z0 + z1) / 2], [0, Math.atan2(-(z1 - z0), x1 - x0) / DEG, 0]);
    K.box(g, [L + w, 0.002, w], mat, [0, 0, 0], null, 0);
  }
  // Flat arc on the ground, centered (cx,cz), radius r, from angle a0 to a1 (deg, 0 = +x, 90 = +z).
  function arc(K, parent, cx, cz, r, a0, a1, y, mat, w) {
    const n = Math.max(8, Math.round((a1 - a0) / 6));
    let prev = null;
    for (let i = 0; i <= n; i++) {
      const a = (a0 + ((a1 - a0) * i) / n) * DEG;
      const p = [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
      if (prev) line(K, parent, prev[0], prev[1], p[0], p[1], y, mat, w);
      prev = p;
    }
  }
  // Filled flat sector on the ground (top at y).
  function sector(K, parent, cx, cz, r, a0, a1, y, mat) {
    const pts = [[cx, cz]].concat(K.circle(cx, cz, r, 32, a0 * DEG, a1 * DEG));
    return K.ext(parent, pts, 0.002, mat, [0, y, 0], [90, 0, 0], 0);
  }
  // Hoop: pole set behind the board; local +z faces the court. Returns { pole, board } groups.
  function hoop(K, poleP, boardP, opts) {
    const o = Object.assign({ boardW: 1.83, boardH: 1.07, overhang: 1.2, pole: 0.15, color: 0x24272b }, opts || {});
    const pm = K.std(o.color, { metalness: 0.5, roughness: 0.45 });
    if (poleP) {
    K.box(poleP, [o.pole, 3.25, o.pole], pm, [0, 1.62, 0], null, 0.01);
    K.box(poleP, [0.12, 0.12, o.overhang], pm, [0, 3.1, o.overhang / 2], null, 0.008);
    K.bar(poleP, [0, 2.6, 0.05], [0, 3.05, o.overhang - 0.1], 0.03, pm);
    K.box(poleP, [0.5, 0.02, 0.5], pm, [0, 0.01, 0], null, 0);
    }
    // board
    const glass = K.phys(0xe6f0f7, { transparent: true, opacity: 0.45, roughness: 0.03, clearcoat: 1 });
    K.box(boardP, [o.boardW, o.boardH, 0.03], glass, [0, 0, 0], null, 0.01);
    const edge = K.std(0x2a2c2f, { metalness: 0.6, roughness: 0.4 });
    K.box(boardP, [o.boardW + 0.04, 0.04, 0.05], edge, [0, o.boardH / 2, 0], null, 0.01);
    K.box(boardP, [o.boardW + 0.04, 0.04, 0.05], edge, [0, -o.boardH / 2, 0], null, 0.01);
    K.box(boardP, [0.04, o.boardH, 0.05], edge, [o.boardW / 2, 0, 0], null, 0.01);
    K.box(boardP, [0.04, o.boardH, 0.05], edge, [-o.boardW / 2, 0, 0], null, 0.01);
    // rim at 10 ft, 6″ above the board's bottom edge (board group sits at 2.90 m + half the board height)
    const rimY = -o.boardH / 2 + 0.15;
    const wm = K.std(0xffffff, { roughness: 0.4 });
    K.box(boardP, [0.61, 0.04, 0.005], wm, [0, rimY + 0.17, 0.017], null, 0);
    K.box(boardP, [0.04, 0.45, 0.005], wm, [-0.285, rimY + 0.37, 0.017], null, 0);
    K.box(boardP, [0.04, 0.45, 0.005], wm, [0.285, rimY + 0.37, 0.017], null, 0);
    K.box(boardP, [0.61, 0.04, 0.005], wm, [0, rimY + 0.58, 0.017], null, 0);
    K.box(boardP, [0.2, 0.12, 0.12], 'orange', [0, rimY + 0.03, 0.08], null, 0.01);
    K.tor(boardP, [0.23, 0.01, 360], 'orange', [0, rimY, 0.38], [90, 0, 0]);
    K.cyl(boardP, [0.23, 0.15, 0.42, 16, true], K.std(0xffffff, { wireframe: true, side: THREE.DoubleSide }), [0, rimY - 0.21, 0.38]);
    return rimY;
  }

  // Starter: portable hoop on the driveway with stenciled lines.
  TB.model(
    'courtDriveway',
    {
      cam: [5.6, 4.2, 6.4], at: [-0.6, 1.0, -1.2], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 12, radius: 12 },
      tex: ['concrete_floor_01', 'brick_wall_001'], assets: ['cardboard_box_01', 'cement_bag', 'garden_hose_wall_mounted_01'],
      hidden: ['spot', 'kit', 'base', 'baseFill', 'pole', 'board', 'clean', 'layout', 'lines', 'aoRebound', 'aoFlood', 'aoPad', 'aoTracker'],
    },
    (K) => {
      const GZ = -5.2;
      // garage + driveway (existing)
      K.box(null, [8.6, 3.0, 0.2], K.pbr('brick_wall_001', [5, 2], {}, 'stone'), [0.4, 1.5, GZ]);
      K.box(null, [8.8, 0.25, 0.5], K.std(0x5a5d61, { roughness: 0.6 }), [0.4, 3.1, GZ + 0.1]);
      const door = K.group(null, [0, 0, GZ + 0.11]);
      K.box(door, [4.9, 2.15, 0.05], K.std(0xf0eee8, { roughness: 0.5 }), [0, 1.08, 0], null, 0.01);
      for (let i = 1; i < 4; i++) K.box(door, [4.9, 0.02, 0.06], K.std(0xd8d6d0), [0, i * 0.54, 0], null, 0);
      const drive = K.pbr('concrete_floor_01', [3, 5], { color: 0xc4c1ba }, 'concrete');
      K.box(null, [6.0, 0.06, 10.0], drive, [0, 0.03, 0], null, 0.01);
      K.box(null, [6.0, 0.003, 0.012], 'dark', [0, 0.062, 0.0], null, 0);
      K.box(null, [0.012, 0.003, 10.0], 'dark', [0, 0.062, 0], null, 0);
      const Y = 0.062;
      // hoop on the left edge facing +x
      const H = K.group(null, [-3.45, 0, -1.5], [0, 90, 0]);
      const spot = K.part('spot', [0, 0, 0], null, 'Flattest spot, 2+ ft clear of the garage');
      K.box(spot, [1.0, 0.004, 1.0], paintMat(K), [-2.9, Y + 0.002, -1.5], null, 0);
      const kit = K.part('kit', [1.6, Y, 2.4], null, 'Hoop kit: base, pole sections, board');
      K.glb(kit, 'cardboard_box_01', { height: 0.35 }, [0, 0, 0], [0, 15, 0]) || K.box(kit, [0.6, 0.35, 0.5], 'woodLight', [0, 0.175, 0]);
      K.box(kit, [1.5, 0.12, 0.95], K.std(0xb8a27a, { roughness: 0.9 }), [-0.9, 0.06, 0.8], [0, 10, 0], 0.01);
      K.rep(3, (i) => K.cyl(kit, [0.05, 0.05, 1.1, 12], 'dark', [0.4, 0.05 + i * 0.1, 0.7 + i * 0.02], [0, 0, 90]));
      const base = K.part('base', [0, 0, 0], H, 'Portable base (35 gal)');
      const bp = K.std(0x1d1f22, { roughness: 0.6 });
      K.box(base, [1.15, 0.3, 0.75], bp, [0, 0.15, -0.35], null, 0.06);
      K.box(base, [0.5, 0.08, 0.5], bp, [0, 0.32, -0.35], null, 0.03);
      K.cyl(base, [0.05, 0.05, 0.05, 16], 'dark', [0.35, 0.32, -0.55]);
      [[-0.5, -0.65], [0.5, -0.65]].forEach(([x, z]) => K.cyl(base, [0.06, 0.06, 0.05, 16], 'black', [x, 0.06, z], [0, 0, 90]));
      const fill = K.part('baseFill', [0, 0, 0], H, 'Sand fill (≈ 250 lb)');
      K.box(fill, [1.1, 0.26, 0.7], K.std(0xd8c39a, { transparent: true, opacity: 0.6, roughness: 1 }), [0, 0.15, -0.35], null, 0.05);
      K.glb(fill, 'cement_bag', { height: 0.16 }, [0.9, 0, -0.6], [0, 30, 0]) || K.box(fill, [0.45, 0.16, 0.3], K.std(0xd8c39a), [0.9, 0.08, -0.6]);
      K.cone(fill, [0.08, 0.15, 16, true], 'orange', [0.35, 0.42, -0.55], [180, 0, 0]);
      const pole = K.part('pole', [0, 0.32, -0.35], H, '3-piece steel pole');
      const pm = K.std(0x24272b, { metalness: 0.5, roughness: 0.45 });
      K.bar(pole, [0, 0, 0], [0, 3.0, 0.3], 0.055, pm);
      K.bar(pole, [0, 0.05, -0.15], [0, 1.4, 0.18], 0.025, pm);
      K.bar(pole, [0, 2.75, 0.27], [0, 2.95, 0.4], 0.03, pm);
      K.bar(pole, [0, 2.5, 0.24], [0, 2.7, 0.4], 0.03, pm);
      K.box(pole, [0.12, 0.04, 0.05], 'yellow', [0, 1.2, 0.16], null, 0.01);
      const board = K.part('board', [0, 3.32, 0.42], H, '54″ backboard & rim at 10 ft');
      hoop(K, null, board, { boardW: 1.37, boardH: 0.84 });
      const clean = K.part('clean', [0.6, Y + 0.001, -1.5], null, 'Pressure-washed, dry surface');
      K.box(clean, [4.4, 0.002, 4.4], K.std(0x8e8b84, { transparent: true, opacity: 0.45, roughness: 0.2 }), [0, 0, 0], null, 0);
      const BX = -3.45 + 0.42 + 0.03; // board face x
      const FT = BX + 4.57;
      const lay = K.part('layout', [0, 0, 0], null, 'Stencil & painter’s tape layout');
      const tape = K.std(0x3f7fd8, { roughness: 0.7 });
      line(K, lay, BX - 0.6, -3.33, FT, -3.33, Y + 0.003, tape, 0.05);
      line(K, lay, BX - 0.6, 0.33, FT, 0.33, Y + 0.003, tape, 0.05);
      line(K, lay, FT, -3.33, FT, 0.33, Y + 0.003, tape, 0.05);
      K.box(lay, [0.9, 0.004, 0.9], K.std(0xe8e4dc, { roughness: 0.8 }), [FT + 0.55, Y + 0.004, -1.5], null, 0);
      const lines = K.part('lines', [0, 0, 0], null, 'Painted lane, free-throw line & circle');
      const wp = K.std(0xffffff, { roughness: 0.5 });
      K.box(lines, [FT - BX + 0.6, 0.002, 3.66], K.std(0x8e2626, { roughness: 0.6 }), [(BX - 0.6 + FT) / 2, Y + 0.002, -1.5], null, 0);
      line(K, lines, BX - 0.6, -3.33, FT, -3.33, Y + 0.004, wp);
      line(K, lines, BX - 0.6, 0.33, FT, 0.33, Y + 0.004, wp);
      line(K, lines, FT, -3.33, FT, 0.33, Y + 0.004, wp);
      arc(K, lines, FT, -1.5, 1.83, -90, 90, Y + 0.004, wp);
      // add-ons
      const rb = K.part('aoRebound', [0, 0, 0], H, 'Ball-return net');
      K.bar(rb, [-0.5, 2.9, 0.55], [0.5, 2.9, 0.55], 0.015, 'dark');
      K.bar(rb, [-0.5, 2.9, 0.55], [-0.35, 0.3, 1.5], 0.015, 'dark');
      K.bar(rb, [0.5, 2.9, 0.55], [0.35, 0.3, 1.5], 0.015, 'dark');
      K.ext(rb, [[-0.5, 2.9], [0.5, 2.9], [0.35, 0.3], [-0.35, 0.3]], 0.01, K.std(0x1c1c1c, { wireframe: true }), [0, 0, 1.0], [-20, 0, 0]);
      AO.flood(K, 'aoFlood', [-2.2, 2.6, GZ + 0.12], 0, 'Garage-mounted LED flood');
      const pad = K.part('aoPad', [0, 0.35, -0.3], H, 'Pole pad');
      K.cyl(pad, [0.12, 0.12, 1.4, 16], K.std(0x2f4f9e, { roughness: 0.8 }), [0, 0.7, 0.07], [6, 0, 0]);
      const cam = K.part('aoTracker', [0, 3.85, 0.3], H, 'Shot-tracking camera');
      K.box(cam, [0.14, 0.09, 0.08], K.std(0x15171a, { roughness: 0.3 }), [0, 0, 0.1], [-15, 0, 0], 0.01);
      K.cyl(cam, [0.025, 0.025, 0.02, 16], K.std(0x0d1a2a, { roughness: 0.05, emissive: 0x3a7bff, emissiveIntensity: 0.4 }), [0, -0.01, 0.145], [75, 0, 0]);
    }
  );

  // Showpiece: 30 × 30 ft slab with sport tile, in-ground 60″ hoop, LED poles and ball-stop net.
  TB.model(
    'courtTile',
    {
      cam: [9.5, 7.0, 10.5], at: [0, 1.0, -0.8], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 18, radius: 16 },
      tex: ['concrete_floor_01', 'gravel_floor', 'forrest_ground_01'], assets: ['cement_bag', 'painted_wooden_bench'],
      hidden: ['layout', 'dig', 'anchors', 'conduit', 'gravel', 'forms', 'rebar', 'slab', 'joints', 'tiles', 'key', 'lines', 'pole', 'board', 'lightPoles', 'netPosts', 'net', 'aoBench', 'aoTracker', 'aoRebound', 'aoSpeaker'],
    },
    (K) => {
      const X = 4.57;
      const Z0 = -5.2;
      const Z1 = 3.95;
      const CZ = (Z0 + Z1) / 2;
      const top = 0.2;
      const lay = K.part('layout', [0, 0, 0], null, 'Layout: 30 × 30 ft');
      stakeLine(K, lay, -X, Z0, X, Z1, 0.3);
      const dig = K.part('dig', [0, 0.005, 0], null, 'Excavated 8″, graded 1%');
      K.box(dig, [2 * X + 0.4, 0.01, Z1 - Z0 + 0.4], K.pbr('forrest_ground_01', [6, 6], {}, 'dirt'), [0, 0, CZ]);
      const PZ = Z0 + 0.3;
      const an = K.part('anchors', [0, 0, 0], null, 'Footings: hoop (4 ft deep) + 2 light poles');
      const ghost = K.std(0x8f8d86, { transparent: true, opacity: 0.6 });
      [[0, PZ, 0.3], [-X + 0.3, Z0 + 0.3, 0.25], [X - 0.3, Z0 + 0.3, 0.25]].forEach(([x, z, r]) => {
        K.cyl(an, [r, r, 1.25, 24], ghost, [x, -0.5, z]);
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => K.cyl(an, [0.012, 0.012, 0.25, 8], 'steel', [x + a * 0.12, 0.2, z + b * 0.12]));
      });
      const cd = K.part('conduit', [0, 0, 0], null, 'Conduit to the light poles');
      K.tube(cd, [[X - 0.3, 0.05, Z0 + 0.3], [X - 0.3, -0.25, Z0 + 1.0], [X - 0.3, -0.25, Z1 + 1.5]], 0.025, 'pvc');
      K.tube(cd, [[-X + 0.3, 0.05, Z0 + 0.3], [-X + 0.3, -0.25, Z0 + 0.9], [X - 0.4, -0.25, Z0 + 0.9]], 0.025, 'pvc');
      const gv = K.part('gravel', [0, 0.05, CZ], null, '4″ compacted gravel');
      K.box(gv, [2 * X, 0.08, Z1 - Z0], K.pbr('gravel_floor', [6, 6], {}, 'stone'), [0, 0, 0], null, 0);
      const forms = K.part('forms', [0, 0.15, 0], null, '2×6 forms, staked');
      K.box(forms, [2 * X + 0.1, 0.14, 0.05], 'wood', [0, 0, Z1 + 0.03]);
      K.box(forms, [2 * X + 0.1, 0.14, 0.05], 'wood', [0, 0, Z0 - 0.03]);
      K.box(forms, [0.05, 0.14, Z1 - Z0], 'wood', [X + 0.03, 0, CZ]);
      K.box(forms, [0.05, 0.14, Z1 - Z0], 'wood', [-X - 0.03, 0, CZ]);
      const rb = K.part('rebar', [0, 0.14, 0], null, '#4 rebar, 18″ grid, on chairs');
      for (let x = -X + 0.15; x < X; x += 0.46) K.bar(rb, [x, 0, Z0 + 0.1], [x, 0, Z1 - 0.1], 0.007, 'forged');
      for (let z = Z0 + 0.15; z < Z1; z += 0.46) K.bar(rb, [-X + 0.1, 0.014, z], [X - 0.1, 0.014, z], 0.007, 'forged');
      const slab = K.part('slab', [0, 0.15, CZ], null, '5″ slab, steel-trowel smooth finish');
      K.box(slab, [2 * X, 0.1, Z1 - Z0], K.pbr('concrete_floor_01', [5, 5], { color: 0xb8b5ae }, 'concrete'), [0, 0, 0], null, 0.01);
      const jt = K.part('joints', [0, top + 0.001, CZ], null, 'Saw-cut control joints (≈ 10 ft)');
      [-1.52, 1.52].forEach((x) => K.box(jt, [0.012, 0.002, Z1 - Z0], 'dark', [x, 0, 0], null, 0));
      [-3.0, 0, 3.0].forEach((z) => K.box(jt, [2 * X, 0.002, 0.012], 'dark', [0, 0, z], null, 0));
      const tiles = K.part('tiles', [0, top, CZ], null, 'Interlocking sport tiles (12″)');
      K.box(tiles, [2 * X, 0.013, Z1 - Z0], K.std(0x262b33, { roughness: 0.6 }), [0, 0.0065, 0], null, 0);
      const gl = K.std(0x15181d, { roughness: 0.7 });
      for (let x = -X + 0.3048; x < X; x += 0.3048) K.box(tiles, [0.006, 0.002, Z1 - Z0], gl, [x, 0.0135, 0], null, 0);
      for (let z = -(Z1 - Z0) / 2 + 0.3048; z < (Z1 - Z0) / 2; z += 0.3048) K.box(tiles, [2 * X, 0.002, 0.006], gl, [0, 0.0135, z], null, 0);
      const T = top + 0.0145;
      const BF = PZ + 1.22; // board face
      const RZ = BF + 0.38; // rim center
      const FT = BF + 4.57;
      const key = K.part('key', [0, 0, 0], null, 'Blue key & outer-court tiles');
      K.box(key, [3.66, 0.002, FT - Z0], K.std(0x1f4fae, { roughness: 0.55 }), [0, T, (FT + Z0) / 2], null, 0);
      sector(K, key, 0, FT, 1.83, 0, 180, T + 0.001, K.std(0x1f4fae, { roughness: 0.55 }));
      const lines = K.part('lines', [0, 0, 0], null, 'Snap-in line tiles');
      const wp = K.std(0xffffff, { roughness: 0.5 });
      const L2 = T + 0.002;
      line(K, lines, -X + 0.05, Z0 + 0.05, X - 0.05, Z0 + 0.05, L2, wp);
      line(K, lines, -X + 0.05, Z0 + 0.05, -X + 0.05, Z1 - 0.05, L2, wp);
      line(K, lines, X - 0.05, Z0 + 0.05, X - 0.05, Z1 - 0.05, L2, wp);
      line(K, lines, -1.83, Z0, -1.83, FT, L2, wp);
      line(K, lines, 1.83, Z0, 1.83, FT, L2, wp);
      line(K, lines, -1.83, FT, 1.83, FT, L2, wp);
      arc(K, lines, 0, FT, 1.83, 0, 180, L2, wp);
      const a3 = Math.acos((X - 0.15) / 6.02) / DEG;
      arc(K, lines, 0, RZ, 6.02, a3, 180 - a3, L2, wp);
      const pole = K.part('pole', [0, top, PZ], null, '5″ in-ground pole, 4 ft overhang');
      const board = K.part('board', [0, 3.35, BF], null, '60″ tempered-glass board, rim at 10 ft');
      hoop(K, pole, board, { boardW: 1.52, boardH: 0.9, overhang: 1.22, pole: 0.13 });
      const lp = K.part('lightPoles', [0, 0, 0], null, '18 ft LED light poles (2 × 300 W)');
      const lm = glow(K, 0xffffff, 1.6);
      [-1, 1].forEach((s) => {
        const x = s * (X - 0.3);
        const z = Z0 + 0.3;
        K.cyl(lp, [0.06, 0.08, 5.5, 16], 'dark', [x, 2.75 + top, z]);
        const head = K.group(lp, [x - s * 0.3, 5.45 + top, z + 0.3], [0, s * -35, 0]);
        K.box(head, [0.6, 0.1, 0.35], 'dark', [0, 0, 0], [25, 0, 0], 0.02);
        K.box(head, [0.55, 0.01, 0.3], lm, [0, -0.06, 0.02], [25, 0, 0], 0);
        K.cone(head, [2.6, 5.0, 24, true], beamMat(K, 0.022), [0, -2.45, 1.4], [-25, 0, 0]);
      });
      const lpl = new THREE.PointLight(0xffffff, 1.0, 12, 2);
      lpl.position.set(0, 4, -1);
      lp.add(lpl);
      const np = K.part('netPosts', [0, 0, Z0 - 0.4], null, 'Net posts (2 ft footings)');
      [-4.3, -1.45, 1.45, 4.3].forEach((x) => K.cyl(np, [0.04, 0.04, 4.6, 12], 'dark', [x, 2.3, 0]));
      K.bar(np, [-4.3, 4.55, 0], [4.3, 4.55, 0], 0.01, 'steel');
      const net = K.part('net', [0, 0, Z0 - 0.4], null, '15 ft ball-stop netting');
      K.box(net, [8.6, 4.4, 0.01], K.std(0x1c1c1c, { wireframe: true }), [0, 2.3, 0], null, 0);
      K.box(net, [8.6, 4.4, 0.005], K.std(0x1c1c1c, { transparent: true, opacity: 0.18, depthWrite: false }), [0, 2.3, 0], null, 0);
      K.glb(null, 'cement_bag', { height: 0.18 }, [5.8, 0, 2.4], [0, 30, 0]);
      // add-ons
      AO.bench(K, 'aoBench', [X + 1.0, 0, -0.5], -90, 'Courtside bench');
      const cam = K.part('aoTracker', [0, top + 3.95, PZ], null, 'Shot-tracking camera');
      K.box(cam, [0.14, 0.09, 0.08], K.std(0x15171a, { roughness: 0.3 }), [0, 0, 0.1], [-15, 0, 0], 0.01);
      K.cyl(cam, [0.025, 0.025, 0.02, 16], K.std(0x0d1a2a, { roughness: 0.05, emissive: 0x3a7bff, emissiveIntensity: 0.4 }), [0, -0.01, 0.145], [75, 0, 0]);
      const rnet = K.part('aoRebound', [0, top, PZ + 0.3], null, 'Ball-return net');
      K.bar(rnet, [-0.5, 2.9, -0.2], [0.5, 2.9, -0.2], 0.015, 'dark');
      K.bar(rnet, [-0.5, 2.9, -0.2], [-0.3, 0.1, 1.0], 0.015, 'dark');
      K.bar(rnet, [0.5, 2.9, -0.2], [0.3, 0.1, 1.0], 0.015, 'dark');
      K.ext(rnet, [[-0.5, 2.9], [0.5, 2.9], [0.3, 0.1], [-0.3, 0.1]], 0.01, K.std(0x1c1c1c, { wireframe: true }), [0, 0, 0.3], [-23, 0, 0]);
      AO.speaker(K, 'aoSpeaker', [X + 0.8, 0, 1.6]);
    }
  );

  // Luxury: full 50 × 47 ft half court, acrylic system, 72″ glass hoop, 4 LED poles, fencing, bleachers.
  TB.model(
    'courtPro',
    {
      cam: [17, 11, 10], at: [0, 1.0, -0.6], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 24, radius: 24 },
      tex: ['concrete_floor_01', 'gravel_floor', 'forrest_ground_01'], assets: ['painted_wooden_bench'],
      hidden: ['layout', 'dig', 'footings', 'conduit', 'gravel', 'forms', 'rebar', 'slab', 'cure', 'resurfacer', 'colorCoats', 'key', 'lines', 'pole', 'board', 'padding', 'lights', 'fence', 'gate', 'seating', 'aoTracker', 'aoScore', 'aoRebound', 'aoShade', 'aoSpeaker'],
    },
    (K) => {
      const X = 8.4;
      const Z0 = -8.2;
      const Z1 = 7.9;
      const CZ = (Z0 + Z1) / 2;
      const CW = 7.62;
      const BL = -7.17; // baseline
      const HC = 7.16; // half-court line
      const top = 0.22;
      const lay = K.part('layout', [0, 0, 0], null, 'Layout: 56 × 53 ft pad (50 × 47 ft court + apron)');
      stakeLine(K, lay, -X, Z0, X, Z1, 0.3);
      const dig = K.part('dig', [0, 0.005, 0], null, 'Excavated & laser-graded (1% fall)');
      K.box(dig, [2 * X + 0.6, 0.01, Z1 - Z0 + 0.6], K.pbr('forrest_ground_01', [8, 8], {}, 'dirt'), [0, 0, CZ]);
      const PZ = BL - 0.25;
      const ft = K.part('footings', [0, 0, 0], null, 'Footings: hoop, 4 light poles, fence posts');
      const ghost = K.std(0x8f8d86, { transparent: true, opacity: 0.6 });
      K.cyl(ft, [0.38, 0.38, 1.4, 24], ghost, [0, -0.55, PZ]);
      const LP = [[-X + 0.25, Z0 + 0.25], [X - 0.25, Z0 + 0.25], [-X + 0.25, Z1 - 0.25], [X - 0.25, Z1 - 0.25]];
      LP.forEach(([x, z]) => K.cyl(ft, [0.3, 0.3, 1.3, 20], ghost, [x, -0.5, z]));
      const FP = [];
      for (let x = -X; x <= X + 0.01; x += (2 * X) / 7) FP.push([x, Z0], [x, Z1]);
      for (let z = Z0 + (Z1 - Z0) / 6; z < Z1 - 0.1; z += (Z1 - Z0) / 6) FP.push([-X, z], [X, z]);
      FP.forEach(([x, z]) => K.cyl(ft, [0.15, 0.15, 0.9, 12], ghost, [x, -0.35, z]));
      const cd = K.part('conduit', [0, 0, 0], null, 'Conduit loop to every light pole');
      K.tube(cd, [[LP[0][0], -0.3, LP[0][1]], [LP[1][0], -0.3, LP[1][1]], [LP[3][0], -0.3, LP[3][1]], [LP[2][0], -0.3, LP[2][1]], [LP[2][0] - 2, -0.3, LP[2][1] + 1]], 0.03, 'pvc');
      const gv = K.part('gravel', [0, 0.05, CZ], null, '4–6″ compacted base');
      K.box(gv, [2 * X, 0.08, Z1 - Z0], K.pbr('gravel_floor', [8, 8], {}, 'stone'), [0, 0, 0], null, 0);
      const forms = K.part('forms', [0, 0.16, 0], null, 'Steel forms');
      K.box(forms, [2 * X + 0.1, 0.14, 0.05], 'forged', [0, 0, Z1 + 0.03]);
      K.box(forms, [2 * X + 0.1, 0.14, 0.05], 'forged', [0, 0, Z0 - 0.03]);
      K.box(forms, [0.05, 0.14, Z1 - Z0], 'forged', [X + 0.03, 0, CZ]);
      K.box(forms, [0.05, 0.14, Z1 - Z0], 'forged', [-X - 0.03, 0, CZ]);
      const rb = K.part('rebar', [0, 0.15, 0], null, '#4 rebar, 12″ grid');
      for (let x = -X + 0.2; x < X; x += 0.6) K.bar(rb, [x, 0, Z0 + 0.1], [x, 0, Z1 - 0.1], 0.008, 'forged');
      for (let z = Z0 + 0.2; z < Z1; z += 0.6) K.bar(rb, [-X + 0.1, 0.016, z], [X - 0.1, 0.016, z], 0.008, 'forged');
      const slab = K.part('slab', [0, 0.16, CZ], null, '5″ post-tensioned or rebar slab, broom-free finish');
      K.box(slab, [2 * X, 0.12, Z1 - Z0], K.pbr('concrete_floor_01', [8, 8], { color: 0xb8b5ae }, 'concrete'), [0, 0, 0], null, 0.01);
      const cure = K.part('cure', [0, top + 0.004, CZ], null, 'Wet cure under curing blankets (28 days)');
      K.rep(4, (i) => K.box(cure, [2 * X - 0.2, 0.008, (Z1 - Z0) / 4 - 0.1], K.std(0xf2f2f0, { roughness: 0.9 }), [0, 0, -(Z1 - Z0) / 2 + (i + 0.5) * ((Z1 - Z0) / 4)], null, 0));
      const rs = K.part('resurfacer', [0, top + 0.002, CZ], null, 'Acrylic resurfacer (2 coats)');
      K.box(rs, [2 * X, 0.004, Z1 - Z0], K.std(0x6f706c, { roughness: 0.8 }), [0, 0, 0], null, 0);
      const T = top + 0.005;
      const cc = K.part('colorCoats', [0, T, 0], null, 'Color coats: green apron, blue court');
      K.box(cc, [2 * X, 0.002, Z1 - Z0], K.std(0x1f5236, { roughness: 0.7 }), [0, 0, CZ], null, 0);
      K.box(cc, [2 * CW, 0.003, HC - BL], K.std(0x1c4478, { roughness: 0.65 }), [0, 0.001, (HC + BL) / 2], null, 0);
      const BFz = BL + 1.22;
      const RZ = BFz + 0.38;
      const FT = BL + 5.79;
      const key = K.part('key', [0, T + 0.003, 0], null, 'Red key (16 ft) & center circle');
      const red = K.std(0x8e2626, { roughness: 0.6 });
      K.box(key, [4.88, 0.002, FT - BL], red, [0, 0, (FT + BL) / 2], null, 0);
      sector(K, key, 0, FT, 1.83, 0, 180, 0.001, red);
      sector(K, key, 0, HC, 1.83, 180, 360, 0.001, red);
      const lines = K.part('lines', [0, 0, 0], null, 'Textured white line paint');
      const wp = K.std(0xffffff, { roughness: 0.5 });
      const L2 = T + 0.006;
      line(K, lines, -CW, BL, CW, BL, L2, wp);
      line(K, lines, -CW, BL, -CW, HC, L2, wp);
      line(K, lines, CW, BL, CW, HC, L2, wp);
      line(K, lines, -CW, HC, CW, HC, L2, wp);
      line(K, lines, -2.44, BL, -2.44, FT, L2, wp);
      line(K, lines, 2.44, BL, 2.44, FT, L2, wp);
      line(K, lines, -2.44, FT, 2.44, FT, L2, wp);
      arc(K, lines, 0, FT, 1.83, 0, 180, L2, wp);
      arc(K, lines, 0, HC, 1.83, 180, 360, L2, wp);
      const cz3 = RZ + Math.sqrt(7.24 * 7.24 - 6.71 * 6.71);
      line(K, lines, -6.71, BL, -6.71, cz3, L2, wp);
      line(K, lines, 6.71, BL, 6.71, cz3, L2, wp);
      const a3 = Math.acos(6.71 / 7.24) / DEG;
      arc(K, lines, 0, RZ, 7.24, a3, 180 - a3, L2, wp);
      arc(K, lines, 0, RZ, 1.22, 0, 180, L2, wp);
      const pole = K.part('pole', [0, top, PZ], null, '6″ in-ground pole, 5 ft overhang');
      const board = K.part('board', [0, 3.435, BFz], null, '72″ tempered-glass board, breakaway rim');
      hoop(K, pole, board, { boardW: 1.83, boardH: 1.07, overhang: BFz - PZ, pole: 0.16 });
      const pad = K.part('padding', [0, top, PZ], null, 'Pole & board padding');
      const pm = K.std(0x1f3a7a, { roughness: 0.85 });
      K.box(pad, [0.26, 1.8, 0.26], pm, [0, 0.95, 0], null, 0.03);
      K.box(pad, [1.9, 0.08, 0.1], pm, [0, 2.9 - top - 0.03, BFz - PZ], null, 0.02);
      const lights = K.part('lights', [0, 0, 0], null, '4 × 20 ft LED poles (400 W each)');
      const lm = glow(K, 0xffffff, 1.6);
      LP.forEach(([x, z]) => {
        K.cyl(lights, [0.07, 0.1, 6.1, 16], 'dark', [x, 3.05 + top, z]);
        const yaw = Math.atan2(-x, -z) / DEG;
        const head = K.group(lights, [x, 6.05 + top, z], [0, yaw, 0]);
        K.box(head, [0.7, 0.12, 0.4], 'dark', [0, 0, 0.3], [25, 0, 0], 0.02);
        K.box(head, [0.62, 0.012, 0.34], lm, [0, -0.07, 0.32], [25, 0, 0], 0);
        K.cone(head, [3.2, 6.0, 24, true], beamMat(K, 0.02), [0, -2.9, 1.8], [-28, 0, 0]);
      });
      const lpl = new THREE.PointLight(0xffffff, 1.0, 18, 2);
      lpl.position.set(0, 5, -1);
      lights.add(lpl);
      const fence = K.part('fence', [0, 0, 0], null, '10 ft black vinyl chain-link fence');
      const fm = K.std(0x1d1f22, { metalness: 0.5, roughness: 0.5 });
      const mesh = K.std(0x1d1f22, { transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
      FP.forEach(([x, z]) => K.cyl(fence, [0.04, 0.04, 3.1, 10], fm, [x, 1.55 + top, z]));
      const runF = (a, b, skip) => {
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const g = K.group(fence, [(a[0] + b[0]) / 2, top, (a[1] + b[1]) / 2], [0, Math.atan2(-(b[1] - a[1]), b[0] - a[0]) / DEG, 0]);
        K.cyl(g, [0.022, 0.022, L, 8], fm, [0, 3.05, 0], [0, 0, 90]);
        if (skip) {
          K.box(g, [L / 2 - 0.8, 3.0, 0.004], mesh, [-(L / 4 + 0.4), 1.5, 0], null, 0);
          K.box(g, [L / 2 - 0.8, 3.0, 0.004], mesh, [L / 4 + 0.4, 1.5, 0], null, 0);
        } else K.box(g, [L, 3.0, 0.004], mesh, [0, 1.5, 0], null, 0);
      };
      runF([-X, Z0], [X, Z0]);
      runF([-X, Z0], [-X, Z1]);
      runF([X, Z0], [X, Z1], true);
      runF([-X, Z1], [X, Z1]);
      const gate = K.part('gate', [X, top, CZ], null, '4 ft walk gate');
      K.box(gate, [0.04, 2.1, 1.2], fm, [0, 1.05, 0], null, 0.01);
      K.box(gate, [0.01, 2.0, 1.1], mesh, [0, 1.05, 0], null, 0);
      const seat = K.part('seating', [X + 1.6, 0, CZ], null, '3-row aluminum bleacher');
      const al = K.std(0xb8bec4, { metalness: 0.8, roughness: 0.35 });
      for (let r = 0; r < 3; r++) {
        K.box(seat, [0.3, 0.04, 4.6], al, [-0.2 + r * 0.55, 0.42 + r * 0.38, 0], null, 0.01);
        K.box(seat, [0.25, 0.03, 4.6], al, [0.05 + r * 0.55, 0.22 + r * 0.38, 0], null, 0.01);
      }
      [-2.1, 0, 2.1].forEach((z) => {
        K.bar(seat, [-0.35, 0, z], [1.0, 1.2, z], 0.025, al);
        K.bar(seat, [1.0, 0, z], [1.0, 1.2, z], 0.025, al);
        K.bar(seat, [-0.35, 0, z], [1.0, 0, z], 0.025, al);
      });
      // add-ons
      const cam = K.part('aoTracker', [0, top + 4.05, PZ], null, 'Shot-tracking camera');
      K.box(cam, [0.14, 0.09, 0.08], K.std(0x15171a, { roughness: 0.3 }), [0, 0, 0.1], [-15, 0, 0], 0.01);
      K.cyl(cam, [0.025, 0.025, 0.02, 16], K.std(0x0d1a2a, { roughness: 0.05, emissive: 0x3a7bff, emissiveIntensity: 0.4 }), [0, -0.01, 0.145], [75, 0, 0]);
      const sc = K.part('aoScore', [-X + 0.06, top + 2.2, CZ], null, 'Wireless LED scoreboard');
      K.box(sc, [0.1, 0.9, 1.8], K.std(0x15171a, { roughness: 0.4 }), [0, 0, 0], null, 0.02);
      K.box(sc, [0.01, 0.25, 0.5], K.std(0xff4a1a, { emissive: 0xff3a10, emissiveIntensity: 1.4 }), [0.055, 0.15, -0.45], null, 0);
      K.box(sc, [0.01, 0.25, 0.5], K.std(0xff4a1a, { emissive: 0xff3a10, emissiveIntensity: 1.4 }), [0.055, 0.15, 0.45], null, 0);
      K.box(sc, [0.01, 0.18, 0.6], K.std(0xffc21a, { emissive: 0xffa010, emissiveIntensity: 1.4 }), [0.055, -0.22, 0], null, 0);
      const rnet = K.part('aoRebound', [0, top, PZ + 0.3], null, 'Ball-return net');
      K.bar(rnet, [-0.5, 2.9, -0.2], [0.5, 2.9, -0.2], 0.015, 'dark');
      K.bar(rnet, [-0.5, 2.9, -0.2], [-0.3, 0.1, 1.0], 0.015, 'dark');
      K.bar(rnet, [0.5, 2.9, -0.2], [0.3, 0.1, 1.0], 0.015, 'dark');
      K.ext(rnet, [[-0.5, 2.9], [0.5, 2.9], [0.3, 0.1], [-0.3, 0.1]], 0.01, K.std(0x1c1c1c, { wireframe: true }), [0, 0, 0.3], [-23, 0, 0]);
      const sh = K.part('aoShade', [X + 1.9, 0, CZ], null, 'Shade sail over the bleachers');
      [[-0.8, -2.6, 3.2], [1.4, -2.6, 2.6], [1.4, 2.6, 2.6], [-0.8, 2.6, 3.2]].forEach(([x, z, h]) => K.cyl(sh, [0.05, 0.05, h, 12], fm, [x, h / 2, z]));
      K.ext(sh, [[-0.8, -2.6], [1.4, -2.6], [1.4, 2.6], [-0.8, 2.6]], 0.01, K.std(0xe8e0cf, { roughness: 0.95, side: THREE.DoubleSide }), [0, 2.9, 0], [90, 0, 0], 0);
      AO.speaker(K, 'aoSpeaker', [X - 0.6, top, Z1 - 0.8]);
    }
  );

  const court = TB.repair('backyard', 'court-build');
  const courtAdd = {
    flood: ao({ id: 'flood', part: 'aoFlood', name: 'Garage floodlight', cat: 'Lighting', blurb: 'LED flood on the garage for evening games.', cost: [40, 150], how: 'Replace an existing garage light with a 3,000–5,000 lumen LED flood aimed at the hoop, or have an electrician add a box.', needs: ['LED flood light (3,000–5,000 lm)', 'Weatherproof box'], shop: 'LED flood light outdoor' }),
    pad: ao({ id: 'pad', part: 'aoPad', name: 'Pole pad', cat: 'Safety', blurb: 'Foam wrap so drives to the hoop don’t end at the pole.', cost: [30, 80], how: 'Measure the pole diameter and wrap the pad around it with the Velcro seam facing away from the court.', needs: ['Pole pad (fits your pole size)'], shop: 'Basketball pole pad' }),
    speaker: ao({ id: 'speaker', part: 'aoSpeaker', name: 'Courtside speaker', cat: 'Tech', blurb: 'Weatherproof speaker off the playing area.', cost: [80, 300], how: 'Keep it 3+ ft outside the court edge and pick an IPX5+ model.', needs: ['Outdoor speaker'], shop: 'Outdoor rock speaker' }),
    score: ao({ id: 'score', part: 'aoScore', name: 'LED scoreboard', cat: 'Tech', blurb: 'Wireless scoreboard and shot clock on the fence.', cost: [400, 1500], how: 'Bolt it to fence posts at eye height outside the playing lines. Wireless models run on a 120 V outlet and a handheld remote.', needs: ['Wireless outdoor scoreboard', 'Fence mounting kit'], shop: 'Outdoor wireless scoreboard' }),
    shade: ao({ id: 'shade', part: 'aoShade', name: 'Shade sail', cat: 'Comfort', blurb: 'Fabric sail over the bleachers.', cost: [500, 2000], how: 'Set steel posts in concrete footings, sized by the sail maker, and tension the sail with turnbuckles; take it down in storms.', needs: ['Shade sail', 'Steel posts + footings', 'Turnbuckles'], shop: 'Shade sail kit' }),
  };
  court.variants = [
    {
      id: 'starter',
      name: 'Starter: driveway + portable hoop',
      blurb: 'A 54″ portable hoop on the driveway with a stenciled lane and free-throw line. Playing the same weekend.',
      level: 1,
      time: '4–6 hrs + paint dry',
      cost: '$300–900',
      model: 'courtDriveway',
      summary: 'No concrete to pour: set up a portable hoop at the edge of the driveway, fill its base completely with sand, and paint a regulation lane and free-throw line with a stencil kit. You can be shooting the same weekend.',
      intro: { show: ['base', 'baseFill', 'pole', 'board', 'lines'], spin: true, preview: true },
      safety: ['Fill the base completely; a half-filled portable hoop can tip over on a windy day or when someone hangs on it.', 'Raise the pole and board with two or three people, and look up first: stay at least 10 ft from overhead power lines.', 'Never hang on the rim of a portable hoop; the base can lift and the whole thing can fall.', 'Keep play away from the street: set the hoop so missed shots roll toward the yard, not traffic.', 'Lay the hoop down or drain/secure it before big storms, as the manual directs.'],
      causes: [['Spot', 'The flattest part of the drive, 2+ ft from the garage and away from the street.'], ['Hoop size', '44–54″ boards fit driveways; a 54″ acrylic board is the best value for rebound and look.'], ['Fill', 'Sand is heavier than water and won’t freeze; water is easy to empty if you’ll move the hoop. In freezing weather water must be mixed with non-toxic antifreeze or only fill to 75%.'], ['Paint', 'Use an exterior acrylic made for driveways or courts: concrete/porch-and-floor or sport-court paint on concrete, a paint labeled for asphalt on blacktop.']],
      tools: ['Portable hoop kit', 'Socket set & wrenches (sizes in the manual)', 'Dry play sand (enough to fill the base, often 300–400 lb) + a funnel', '4 ft level', 'Pressure washer or stiff broom & degreaser', 'Court stencil kit or a string-and-pencil compass for the circle', 'Painter’s tape, chalk line & tape measure', 'Exterior driveway/court paint + roller & brush'],
      steps: [
        { t: 'Pick the spot', d: 'Find the flattest area at the edge of the driveway, away from the street and 2+ ft from the garage door. Lay a 4 ft level on the ground where the base will sit, both directions.', why: 'A base on a slope tilts the pole, which makes the hoop easier to tip and puts the rim off level.', tip: 'If the drive slopes, face the board uphill so the base’s heavy end is on the high side. Check where the basketball rolls after a missed shot: you want it rolling toward the yard.', ok: 'The bubble sits within one line of center both ways, and the spot is clear of the street.', v: { cam: [3.2, 2.4, 1.6], at: [-2.9, 0.1, -1.5], hi: ['spot'], show: ['spot'], tool: { id: 'level', at: [-2.9, 0.07, -1.2], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Unpack and check the parts', d: 'Lay out the base, pole sections, extension arms and board on a blanket. Sort the hardware into piles or a muffin tin by the letters in the manual and count it.', why: 'Sorting first stops you using a short bolt where a long one carries the load.', tip: 'Tape each hardware bag to its page in the manual. If a part is missing, call the maker’s parts line with the part letter; don’t swap in a random bolt.', ok: 'Every hardware letter in the parts list has a pile with the right count.', v: { cam: [3.4, 2.2, 5.0], at: [1.2, 0.2, 2.6], hi: ['kit'], show: ['kit'] } },
        { t: 'Assemble the base', d: 'Bolt the wheels to the base as the manual shows, then set the base in its final spot with the fill hole facing up.', why: 'Once full, the base weighs hundreds of pounds, so put it where it will live before filling.', tip: 'Snug nuts with a wrench until the washer stops spinning, then a quarter turn more; overtightening cracks plastic. If a bolt won’t line up, loosen its neighbors first.', ok: 'The base sits flat with no rocking, wheels clear of the ground when the base is level.', v: { cam: [2.0, 1.6, 0.4], at: [-3.4, 0.2, -1.5], hi: ['base'], show: ['base'], hide: ['kit'], tool: { id: 'ratchet', at: [-3.9, 0.3, -1.0], rot: [0, 0, 90], anim: 'turn', scale: 1.2 } } },
        { t: 'Fill with sand', d: 'Pour dry play sand through a funnel into the base until it’s completely full, tapping the sides to settle it. Screw the cap on tight.', why: 'Sand is roughly 1½ times as heavy as the same volume of water and won’t freeze and crack the base.', tip: 'Cut the bottom off a 2-liter bottle for a funnel and poke the sand down with a broom handle when it bridges. Sand must be bone dry; damp sand clogs the funnel. If you use water, follow the manual for antifreeze in winter.', ok: 'Sand reaches the very top of the fill hole and doesn’t sink after you rock the base.', v: { cam: [2.0, 1.6, 0.4], at: [-3.4, 0.2, -1.5], hi: ['baseFill'], show: ['baseFill'] } },
        { t: 'Raise the pole and board', d: 'Assemble the pole sections and bolt the board and arms on while it lies on the ground. Then, with two helpers, walk the pole up hand over hand and bolt it to the base.', why: 'Bolting the board on at ground level is far safer than lifting it 10 ft onto a standing pole.', tip: 'One person pins the base with a foot while two walk the pole up. If it starts to tip sideways, set it down and reset rather than fighting it.', ok: 'All pole bolts are tight, the pole stands upright, and the board doesn’t shift when you push it.', v: { cam: [3.6, 3.2, 2.4], at: [-3.0, 1.8, -1.5], hi: ['pole', 'board'], show: ['pole', 'board'], tool: { id: 'ratchet', at: [-3.6, 0.6, -1.5], rot: [0, 0, 90], anim: 'turn', scale: 1.2 } } },
        { t: 'Set the height', d: 'Use the crank or lever to set the rim height: 10 ft to the top of the rim for regulation, lower for kids. Check it with a tape from the driveway to the rim top.', why: 'Regulation height is 10 ft; kids learn good form faster at 8–9 ft.', tip: 'Mark the 10 ft setting on the height scale with a paint pen once you’ve measured it; the printed numbers are often off by an inch or two.', ok: 'The tape reads 10 ft (or your chosen height) at the rim top, and the rim looks level from the free-throw spot.', v: { cam: [1.4, 2.4, 1.6], at: [-2.6, 2.4, -1.5], hi: ['board'], tool: { id: 'tape', at: [-2.6, 0.08, -1.5], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Clean the driveway', d: 'Scrub oil spots with degreaser, then pressure-wash or scrub the court area. Let it dry for a full sunny day.', why: 'Paint won’t stick to dust, oil or damp pavement; it peels within weeks.', tip: 'Tape a 2 × 2 ft square of plastic to the drive overnight; if it’s wet underneath in the morning, the slab is still too damp to paint.', ok: 'The surface is evenly dry and light in color, and tape sticks firmly to it.', v: { cam: [5.0, 3.8, 4.6], at: [0.4, 0, -1.5], hi: ['clean'], show: ['clean'] } },
        { t: 'Lay out with the stencil', d: 'Hang a plumb line from the board face to find the spot under it. Measure 15 ft out from that spot for the free-throw line, then tape the 12 ft wide lane (6 ft each side of center). Set the stencil or string compass for the 6 ft radius circle.', why: 'Measuring from the backboard face, not the pole, puts the lines where the rules say.', tip: 'Check the lane is square by measuring its diagonals; they should match. Run tape on the outside of each line so the 2″ line ends up the right size.', ok: 'The free-throw line is 15 ft from the board face and the lane diagonals match.', v: { cam: [4.4, 3.6, 3.4], at: [0, 0, -1.5], hi: ['layout'], show: ['layout'], hide: ['clean'], tool: { id: 'tape', at: [1.6, 0.07, -3.3], rot: [0, 90, 0], scale: 1.6 } } },
        { t: 'Paint the lines', d: 'Roll the lane color and let it dry per the can. Then paint the 2″ white lines and pull the tape at a low angle while the paint is still wet.', why: 'Pulling tape wet leaves a clean edge instead of tearing dried paint off with it.', tip: 'Brush a thin coat of the base color over the tape edges first; it seals them so the white can’t bleed underneath. If a line bleeds, touch it up with a small artist’s brush.', ok: 'Lines are crisp with no bleed, and the paint is dry to the touch before anyone plays (usually 24–72 hours for traffic).', v: { cam: [5.6, 4.2, 4.4], at: [-0.4, 0.5, -1.5], hi: ['lines'], show: ['lines'], hide: ['layout'], tool: { id: 'roller', at: [1.2, 0.07, -1.5], rot: [0, 90, 0], anim: 'slide' } } },
      ],
      learn: {
        how: 'A portable hoop is a weighted base with a pole leaning out over the court. The filled base counterbalances the board hanging out front, which is why it must be completely full. Driveway lines are painted on the existing surface, so prep (clean, dry, and cured if new) decides how long they last.',
        specs: [['Rim height', '10 ft to the top of the rim'], ['Free-throw line', '15 ft from the backboard face'], ['Lane width', '12 ft (high school and college)'], ['Center circle / free-throw circle radius', '6 ft'], ['Line width', '2″'], ['New concrete', 'Wait 28 days before painting']],
        terms: [['Overhang', 'Distance from the pole to the backboard face.'], ['Lane (key)', 'Painted area under the hoop.'], ['Stencil kit', 'Templates for laying out regulation lines.'], ['Plumb line', 'A string with a weight, used to find the point straight below something.']],
        mistakes: ['Half-filled base.', 'Painting fresh concrete (wait 28 days).', 'Measuring the free-throw line from the pole.', 'Using plain water in a base in freezing weather.'],
        tips: ['In freezing climates use sand, or a water and non-toxic RV antifreeze mix as the manual allows; never plain water filled to the top.'],
      },
      pro: 'Not needed for this setup. Step up to a slab and an in-ground hoop if the driveway slopes too much to play on.',
      tricks: [['Sandbags beat bulk sand', 'Dry play sand in 50 lb bags pours cleanly; bulk sand from a yard is damp and clogs the funnel.'], ['Add sandbags on the base', 'For extra stability, lay two or three sandbags on the back of the base where the manual allows.'], ['Line paint that lasts', 'Textured court line paint grips better and lasts longer than glossy house paint, which gets slippery when wet.'], ['Use a string compass', 'Tie a string to a nail at the circle center and a pencil at 6 ft; it draws a perfect arc for free.'], ['If the hoop wobbles', 'Re-tighten all pole bolts after the first week of play; they settle in.'], ['Move it the easy way', 'With the board lowered all the way, tip the base onto its wheels with a foot on the base and walk it; never roll it with the rim at full height.']],
      refs: [['Tips for Filling a Portable Basketball Hoop (Dick’s Sporting Goods)', 'https://dickssportinggoods.com/protips/sports-and-activities/basketball/tips-for-filling-a-portable-basketball-hoop'], ['Portable Basketball Goal: Sand vs. Water (Livestrong)', 'https://www.livestrong.com/article/351170-portable-basketball-goal-sand-vs-water/'], ['How to Install a Basketball Hoop (Goalrilla)', 'https://www.goalrilla.com/installation']],
      addons: [courtAdd.flood, courtAdd.pad].concat(pick(court, ['rebound', 'tracker'])),
    },
    { id: 'classic', name: 'Classic: 20 × 20 ft slab', blurb: 'A 4″ concrete slab with an in-ground hoop and painted key.', level: 3, time: '1–2 weeks (incl. cure)', cost: '$4,000–9,000' },
    {
      id: 'showpiece',
      name: 'Showpiece: 30 × 30 sport-tile court',
      blurb: 'A bigger slab with two-tone interlocking sport tile, a 60″ glass hoop, LED light poles and ball-stop netting.',
      level: 3,
      time: '3–4 weeks (incl. cure)',
      cost: '$15,000–30,000',
      model: 'courtTile',
      summary: 'A 30 × 30 ft court with room for the key and most of a 3-point arc: a flat, reinforced slab with the hoop and light-pole footings poured first, snap-together polypropylene sport tile in two colors with inlaid lines, a 60″ tempered-glass hoop, two LED light poles and 15 ft ball-stop netting behind the hoop.',
      intro: { show: ['slab', 'tiles', 'key', 'lines', 'pole', 'board', 'lightPoles', 'netPosts', 'net'], spin: true, preview: true },
      safety: ['Call 811 (the free “call before you dig” line) before digging footings.', 'Light poles and their circuit need permits and a licensed electrician; outdoor circuits must be GFCI-protected (they cut power instantly if current leaks).', 'Wet concrete is caustic and burns skin: wear waterproof gloves, long sleeves, boots and eye protection, and rinse splashes right away.', 'Raise the glass board with a lift or a crew of four; tempered glass boards weigh 150+ lb.'],
      causes: [['Size', '30 × 30 ft fits the key and the top of a high-school 3-point arc (19′9″); the arc’s corners run past the sides, which is normal for backyard courts.'], ['Surface', 'Sport tile is cushioned, drains through its grid and dries fast after rain, but it needs a flat slab without bumps.'], ['Footings first', 'Hoop and light-pole footings and electrical conduit go in before the slab is poured.'], ['Slope', '0.5–1% to one side so water runs off under the tiles.']],
      tools: ['Stakes, string & laser level', 'Skid steer & plate compactor (rentals)', '2×6 forms & stakes', '#4 rebar, tie wire & rebar chairs', 'Hoop anchor kit + light-pole anchor bolts', 'Schedule 40 PVC conduit', '3,000+ psi concrete (≈ 14 yd³ at 5″)', 'Bull float, edger, groover & a medium-bristle broom', 'Sport tiles (≈ 900 sq ft) + line tiles', 'In-ground 60″ glass hoop', 'LED light poles (2)', 'Netting posts, cable & 15 ft net'],
      steps: [
        { t: 'Lay out 30 × 30', d: 'Stake the square, then measure both diagonals and adjust until they match (about 42′5″). Set strings at the finished slab height, falling 0.5–1% (about 2–3½″ over 30 ft) toward one side.', why: 'Sport tile shows every low spot as a puddle, so the slope must be built into the slab itself.', tip: 'Use a rented laser level and a grade rod; it reads heights across 30 ft far more accurately than a line level. Put the low side away from the house.', ok: 'The diagonals match within ½″, and the laser shows an even fall from the high side to the low side.', v: { cam: [9.5, 7.0, 10.0], at: [0, 0, -0.6], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [4.6, 0.3, 3.9], rot: [0, 45, 0], scale: 1.4 } } },
        { t: 'Excavate and grade', d: 'Remove about 9″ of soil (4″ of gravel plus a 5″ slab) and compact the bare subgrade with two passes each way.', why: 'Soft or root-filled soil settles under concrete and cracks it; a firm subgrade and a thicker slab span weak spots.', tip: 'Have the excavated soil hauled away or placed where you want a berm before you start; 10+ cubic yards of dirt is a big pile.', ok: 'Your boot leaves no mark on the subgrade, and the depth from the strings reads 9″ everywhere.', v: { cam: [9.5, 7.0, 10.0], at: [0, 0, -0.6], hi: ['dig'], show: ['dig'], hide: ['layout'] } },
        { t: 'Pour the footings', d: 'Auger the hoop footing to the maker’s size (often 16–24″ wide and 48″ deep) and the two light-pole footings to the pole maker’s size. Set each anchor-bolt template level and square to the court, then fill with concrete.', why: 'The hoop and light poles catch wind like sails; deep footings stop them leaning, which a slab alone can’t resist.', tip: 'Measure from the court’s baseline string to the template twice before the concrete stiffens; a hoop 2″ off center is permanent. Give it at least 72 hours before bolting anything on.', ok: 'Each template is level both ways and sits exactly where the plan shows.', v: { cam: [6.4, 3.4, 0.4], at: [0, -0.3, -4.6], hi: ['anchors'], show: ['anchors'], xray: true } },
        { t: 'Run conduit', d: 'Trench conduit from each light-pole footing back toward the house panel before the gravel goes in, with a pull string inside. The electrician sizes and inspects it.', why: 'Conduit under the slab can never be added later without cutting concrete.', tip: 'Add one spare empty conduit to the hoop end for a future scoreboard or speaker; it costs a few dollars now.', ok: 'Conduit ends stick up at every pole and the panel side, capped and with pull strings, and the inspector has signed off.', v: { cam: [8.0, 4.4, 3.6], at: [1.0, -0.2, -2.0], hi: ['conduit'], show: ['conduit'], xray: true } },
        { t: 'Gravel, forms and rebar', d: 'Spread and compact 4″ of crushed gravel. Set 2×6 forms to the strings and stake them every 3 ft. Tie #4 rebar in an 18″ grid and lift it onto chairs (small plastic stands) so it sits in the middle of the slab.', why: 'Rebar only holds cracks closed if it’s inside the concrete, not lying on the gravel.', tip: 'Walk the grid before the pour and push down on it: if it sinks, add chairs. Tie every other crossing with wire twists.', ok: 'Rebar sits 2–2½″ above the gravel everywhere and the forms don’t move when kicked.', v: { cam: [8.4, 5.6, 8.4], at: [0, 0.1, -0.6], hi: ['gravel', 'forms', 'rebar'], show: ['gravel', 'forms', 'rebar'], hide: ['dig'] } },
        { t: 'Pour and finish', d: 'Pour, screed (strike flat) off the forms, bull float, and edge. When the shine leaves the surface, give it the finish the tile maker asks for, usually a light-to-medium broom. Saw-cut control joints within 24 hours.', why: 'Tile needs a flat slab; a light texture lets it drain and grip, while bumps and ridges make tiles rock and click.', tip: 'Hire a finishing crew for this; 14 yards sets fast. Pull the broom in one direction only, straight across, and rinse it often so it doesn’t drag lumps.', ok: 'A 10 ft straightedge shows no gap over ¼″, and the texture is even across the whole slab.', v: { cam: [9.5, 7.0, 10.0], at: [0, 0.1, -0.6], hi: ['slab', 'joints'], show: ['slab', 'joints'], hide: ['rebar', 'gravel'], tool: { id: 'trowel', at: [1.0, 0.21, 1.0], rot: [0, 0, 0], anim: 'slide' } } },
        { t: 'Snap in the tiles', d: 'After the slab cures (about 28 days, or as the tile maker says), snap a center line. Start in the middle and snap tiles together outward, leaving the edge gap the maker specifies (often a court 2–3″ smaller than the slab).', why: 'Starting at the center keeps rows straight and puts any cut tiles at the edges; the gap gives room to expand on hot days.', tip: 'Tiles snap easier in warm sun; in cold weather keep the boxes in a garage. If a row starts to drift, pop it out and re-snap rather than forcing it.', ok: 'Rows run straight along your chalk line and the tiles lie flat with no humps.', v: { cam: [7.4, 5.4, 7.6], at: [0, 0.2, -0.6], hi: ['tiles'], show: ['tiles'], hide: ['forms'], tool: { id: 'hammer', at: [0.6, 0.23, 0.6], rot: [0, -40, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Key and line tiles', d: 'Swap in the colored key tiles and the white line tiles, measuring from the spot under the backboard face: free-throw line 15 ft out, lane 12 ft wide.', why: 'Inlaid line tiles are colored all the way through, so they never fade or need repainting.', tip: 'Lay all the line tiles loose first and walk around to check before snapping them in; a pry tool or flat screwdriver pops a wrong tile out easily.', ok: 'Lines measure correctly and run straight when you sight down them.', v: { cam: [6.4, 6.4, 6.4], at: [0, 0.2, -1.6], hi: ['key', 'lines'], show: ['key', 'lines'] } },
        { t: 'Install the hoop', d: 'Bolt the pole to the anchor and plumb it (straight up) using the leveling nuts under the base plate. Lift the glass board on with a crew or lift, then set the rim to 10 ft.', why: 'A plumb pole puts the rim square to the court; even a ½″ lean shows from the free-throw line.', tip: 'Check plumb with a level on two sides of the pole, adjusting one nut a quarter turn at a time; tighten the top nuts only when both read plumb.', ok: 'The level bubble is centered on two faces of the pole and a tape reads 10 ft to the rim top.', v: { cam: [4.4, 3.6, 1.4], at: [0, 2.0, -4.2], hi: ['pole', 'board'], show: ['pole', 'board'], tool: { id: 'level', at: [0.08, 1.4, -4.9], rot: [0, 0, 90], scale: 1.6 } } },
        { t: 'Lights and ball-stop net', d: 'The electrician stands the LED poles on their anchors and connects them. Set the net posts in their footings, run a top cable, and hang the 15 ft netting from it.', why: 'Netting behind the hoop keeps missed shots out of gardens, streets and neighbors’ yards.', tip: 'Aim the lights down and slightly inward from the sides, never toward houses; a quick night test from the neighbor’s side of the fence saves complaints.', ok: 'At night the court is evenly lit with no dark corners, and the net hangs taut without sagging.', v: { cam: [9.5, 6.4, 10.0], at: [0, 2.0, -1.0], hi: ['lightPoles', 'netPosts', 'net'], show: ['lightPoles', 'netPosts', 'net'] } },
      ],
      learn: {
        how: 'The slab is the structure; the tile is a floating surface on top. Interlocking polypropylene tiles flex slightly underfoot, drain through their open grid, and grow and shrink with temperature, so they need edge gaps. The hoop and lights stand on their own deep footings, tied to the slab only at the surface.',
        specs: [['Court', '30 × 30 ft'], ['Slab', '4–5″, 3,000+ psi, #4 rebar, on 4″ gravel'], ['Slope', '0.5–1%'], ['Slab finish', 'Light-to-medium broom (per tile maker)'], ['3-point arc (HS)', '19′9″'], ['Rim height', '10 ft'], ['Net height', '15 ft'], ['Concrete', '≈ 14 yd³ at 5″']],
        terms: [['Sport tile', 'Interlocking plastic court tile laid over a slab.'], ['Overhang', 'Pole-to-board distance; 4 ft keeps players clear of the pole.'], ['Anchor bolts', 'Bolts cast into a footing to hold a pole base.'], ['Control joint', 'A sawn groove that makes the slab crack in a straight, planned line.'], ['Rebar chair', 'A small stand that holds steel bars mid-slab.']],
        mistakes: ['A slab with ridges or bumps under the tile.', 'Forgetting conduit before the pour.', 'No expansion gap at the tile edges.', 'Measuring lines from the pole instead of the board face.'],
        tips: ['Order a few spare tiles of each color for repairs; dye lots change.'],
      },
      pro: 'The slab pour and finishing, the electrical for the lights, and usually lifting the glass board.',
      tricks: [['Pour footings a week early', 'Footings cured before slab day are one less thing to coordinate, and the anchor templates can’t get bumped by the pour crew.'], ['Ask for the tile maker’s slab spec sheet', 'Hand it to the concrete contractor before they bid; finish, flatness and slope are spelled out there.'], ['Pick a lighter color', 'Lighter tile colors stay cooler in summer sun than dark blue or black.'], ['Blow, don’t hose', 'A leaf blower clears tile courts fastest; the grid drains water on its own.'], ['Replacing a damaged tile', 'Pop it out with a flat bar, snap in a spare from the same lot; no tools beyond that.'], ['Plan for wind', 'Ball-stop nets act like sails; lower or loosen them before big storms.']],
      refs: [['Subsurface Preparation for Sport Tile Courts (VersaCourt)', 'https://www.versacourt.com/subsurface-preparation.html'], ['Base Specifications: Concrete (VersaCourt PDF)', 'https://versacourt.com/cmss_files/attachmentlibrary/Base-Specifications--Concrete.pdf'], ['Basketball Hoop Installation (Goalrilla)', 'https://www.goalrilla.com/installation'], ['Call Before You Dig (811)', 'https://call811.com/']],
      addons: [courtAdd.speaker].concat(pick(court, ['bench', 'tracker', 'rebound'])),
    },
    {
      id: 'luxury',
      name: 'Luxury: full half court, fenced + lit',
      blurb: 'A 50 × 47 ft half court with an acrylic surface, 72″ glass hoop, four LED poles, 10 ft fencing and bleachers.',
      level: 4,
      time: '6–8 weeks (incl. 28-day cure)',
      cost: '$40,000–90,000',
      model: 'courtPro',
      summary: 'A full regulation half court: 50 × 47 ft plus a safety apron, a reinforced slab on a vapor barrier with every footing and conduit in place before the pour, a multi-coat acrylic surface in blue, green and red, NBA-style 3-point line, a 72″ glass hoop with a 5 ft overhang, four LED poles, 10 ft black chain-link fencing with a gate, and bleacher seating.',
      intro: { show: ['slab', 'resurfacer', 'colorCoats', 'key', 'lines', 'pole', 'board', 'padding', 'lights', 'fence', 'gate', 'seating'], spin: true, preview: true },
      safety: ['This is a contractor project with permits: grading, drainage, electrical, fencing and sometimes lighting curfews.', 'Call 811 (the free “call before you dig” line) before any digging.', 'Acrylic coatings: ventilate, wear gloves and eye protection, and keep them off skin; acid etching needs a respirator and acid-resistant gloves.', 'Lights must be aimed and shielded to avoid glare on neighbors; many towns regulate light spill and hours.', 'Wet concrete is caustic: waterproof gloves, boots and eye protection for anyone near the pour.'],
      causes: [['Size', 'A half court is 50 ft wide × 47 ft deep; add a 3–5 ft apron (run-off zone) and room for the fence.'], ['Surface', 'A textured acrylic system over concrete is what most outdoor school and park courts use: smooth, colorful, with cushioned options.'], ['Neighbors', 'Check noise, lighting and fence-height rules before designing.'], ['Drainage', 'Slope the slab about 1% in one plane, side to side or end to end, never toward the house.']],
      tools: ['Permits & site plan', 'Laser level, skid steer, roller compactor', 'Steel forms', '#4 rebar (or post-tensioning by the contractor)', '10-mil vapor retarder sheeting', 'Hoop anchor + 4 light-pole anchors + fence-post footings', 'Conduit & pull boxes', 'Concrete (≈ 45 yd³)', 'Curing blankets (no curing compound)', 'Acrylic resurfacer, color coats & line paint', 'Squeegees, rollers, tape', '72″ glass in-ground hoop + pole and board pads', 'LED light poles (4)', '10 ft chain-link fence + gate', 'Bleachers'],
      steps: [
        { t: 'Plan, permit and lay out', d: 'Have a site plan drawn showing drainage, setbacks, lighting and fencing, and pull the permits. Then stake the pad corners and set heights with a laser level.', why: 'A court this size changes how water moves across the whole yard; the plan decides where it goes.', tip: 'Ask for the light-level plan (a map of foot-candles, the brightness on the court) with the permit set; inspectors and neighbors often want to see it.', ok: 'You hold approved permits and the stakes match the plan’s measurements and diagonals.', v: { cam: [15, 10.5, 15], at: [0, 0, -0.4], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [8.4, 0.3, 7.9], rot: [0, 45, 0], scale: 2 } } },
        { t: 'Excavate and grade', d: 'Strip the topsoil, excavate to the plan depth, and laser-grade the subgrade to the 1% fall. Roll-compact it until a loaded truck barely leaves a rut.', why: 'The subgrade carries everything; soft spots become cracks that show through the acrylic.', tip: 'Do a proof-roll: drive a loaded skid steer slowly over every foot. Any spot that pumps or ruts gets dug out and replaced with stone.', ok: 'The proof-roll shows no ruts or springy spots, and laser readings match the plan within ¼″.', v: { cam: [15, 10.5, 15], at: [0, 0, -0.4], hi: ['dig'], show: ['dig'], hide: ['layout'] } },
        { t: 'Pour all the footings', d: 'Pour the hoop footing, four light-pole footings and fence-post footings, setting each anchor template to string lines, level and square.', why: 'Every post on a court carries wind load, and all of them must be in before the slab covers the ground.', tip: 'Have the hoop maker’s template checked against the baseline and center line by two people independently before the concrete stiffens.', ok: 'Every template sits at its plan location, level both ways, with bolt threads protected.', v: { cam: [13, 6.0, 9.0], at: [0, -0.4, -2.0], hi: ['footings'], show: ['footings'], xray: true } },
        { t: 'Conduit, base, forms and rebar', d: 'Run conduit with pull strings to every pole. Compact the gravel base, lay a 10-mil vapor retarder (taped plastic sheeting) over it, set steel forms, and tie the rebar grid on chairs.', why: 'The vapor retarder stops ground moisture rising into the slab, which would blister the acrylic later; one continuous slab on a good base gives the fewest joints.', tip: 'Overlap the plastic 12″ and tape the seams; patch any tear before the rebar goes on. Keep chairs on small plates so they don’t poke through it.', ok: 'The plastic is continuous and taped, and the rebar sits mid-slab on chairs everywhere.', v: { cam: [14, 9.0, 13], at: [0, 0, -0.4], hi: ['conduit', 'gravel', 'forms', 'rebar'], show: ['conduit', 'gravel', 'forms', 'rebar'], hide: ['dig'], xray: true } },
        { t: 'Pour, finish and cure 28 days', d: 'Pour the slab in one day, float it flat and give it a medium broom finish. Then keep it wet under curing blankets for 28 days. Do not use spray curing compound.', why: 'Acrylic bonds only to fully cured, clean concrete; curing compounds and trapped moisture make the coating peel or blister.', tip: 'Ask the finisher for a uniform broom pulled straight across the court; swirl marks or a glass-smooth trowel finish give the acrylic nothing to grip.', ok: 'The slab is evenly textured with no smooth patches, and it stays dark and damp under the blankets.', v: { cam: [15, 10.5, 15], at: [0, 0, -0.4], hi: ['slab', 'cure'], show: ['slab', 'cure'], hide: ['rebar', 'gravel', 'conduit'] } },
        { t: 'Acrylic resurfacer', d: 'Remove the blankets and flood the slab with water. Mark any spot where water covers a nickel and patch it. Acid-etch or prime as the coating maker says, then squeegee two coats of acrylic resurfacer.', why: 'The flood test finds low spots that would hold puddles; the resurfacer fills pores and gives the color coats an even base.', tip: 'Do the flood test on a cool morning and outline puddles with chalk an hour later as they shrink. Apply coatings only within the temperature range on the pail (often above 50°F and rising).', ok: 'After patching no puddle covers a nickel, and the resurfacer looks uniform with no bare spots.', v: { cam: [10, 7.0, 10], at: [0, 0, 0], hi: ['resurfacer'], show: ['resurfacer'], hide: ['cure', 'forms'], tool: { id: 'roller', at: [1.0, 0.23, 1.0], rot: [0, 90, 0], anim: 'slide', scale: 1.4 } } },
        { t: 'Color coats', d: 'Squeegee two color coats: green apron, blue court, and red key and center circle, letting each coat dry fully.', why: 'Two thin coats wear far better than one thick one and hide squeegee marks.', tip: 'Work in long straight passes with a wet edge, and turn 90° between coats; overlapping half-dry coating leaves lap marks.', ok: 'Colors are even with no streaks or lap marks when viewed from a low angle.', v: { cam: [13, 10, 13], at: [0, 0, -0.4], hi: ['colorCoats', 'key'], show: ['colorCoats', 'key'] } },
        { t: 'Paint the lines', d: 'Snap and tape every line, measuring from the spot under the backboard face. Seal the tape edges with a thin coat of clear primer or the base color, then roll textured white line paint.', why: 'Sealing the tape edges first gives razor-sharp lines with no bleed into the textured surface.', tip: 'Use a long string and nail as a compass for the 23′9″ arc. Pull tape as soon as the line paint loses its wet shine.', ok: 'Lines measure correctly, are 2″ wide, and have crisp edges with no bleed.', v: { cam: [8.0, 9.0, 6.0], at: [0, 0, -2.4], hi: ['lines'], show: ['lines'], tool: { id: 'roller', at: [2.44, 0.23, -4.0], rot: [0, 0, 0], anim: 'slide' } } },
        { t: 'Install the glass hoop', d: 'Bolt the 6″ pole to the anchor, plumb it with the leveling nuts, lift on the 72″ board, set the rim at 10 ft, and wrap the pole and board edges in pads.', why: 'A 5 ft overhang and padding keep players from slamming into steel when they drive to the basket.', tip: 'Check plumb on two faces and the rim height with a tape again after the board is on; its weight can tip the pole slightly before final tightening.', ok: 'The pole is plumb on two faces, the rim reads 10 ft, and pads cover all hard edges facing the court.', v: { cam: [6.0, 4.4, -1.4], at: [0, 2.0, -6.6], hi: ['pole', 'board', 'padding'], show: ['pole', 'board', 'padding'], tool: { id: 'level', at: [0.1, 1.4, -7.42], rot: [0, 0, 90], scale: 1.6 } } },
        { t: 'Lights, fence and seating', d: 'The electrician stands the four LED poles, connects them and aims them. Hang the fence fabric and gate, and set the bleachers outside the fence on level pads.', why: 'Corner poles aimed inward light the court evenly with less glare over the fence.', tip: 'Do the aiming at night with the fixtures’ shields on, and check from the property line. Set the gate to swing out so play doesn’t block it.', ok: 'The court reads 20–30 foot-candles fairly evenly on a light meter (or phone app), and no fixture glares into neighboring windows.', v: { cam: [17, 11, 10], at: [0, 1.0, -0.6], hi: ['lights', 'fence', 'gate', 'seating'], show: ['lights', 'fence', 'gate', 'seating'] } },
      ],
      learn: {
        how: 'A pro-style court is a layered system: compacted subgrade, gravel base, vapor retarder, reinforced slab, then a thin acrylic system (resurfacer, color coats, line paint) bonded to the fully cured concrete. Hoops, lights and fences each stand on their own footings, with conduit placed before the pour. The acrylic is sand-textured for grip and is recoated every 5–8 years.',
        specs: [['Half court', '50 × 47 ft'], ['3-point (NBA)', '23′9″, 22′ in the corners'], ['Key', '16 ft wide (NBA)'], ['Free-throw line', '15 ft from the board face'], ['Slab', '5″ reinforced, medium broom, on a vapor retarder'], ['Cure before acrylic', '28 days, no curing compound'], ['Flood test', 'No puddle deeper than a nickel'], ['Lighting', '≈ 20–30 fc for recreation'], ['Fence', '10 ft']],
        terms: [['Acrylic resurfacer', 'Sand-filled acrylic that levels and seals the slab.'], ['Color coat', 'Pigmented, textured acrylic finish layer.'], ['Flood test', 'Wetting the slab to find puddles before coating.'], ['Breakaway rim', 'Rim that flexes under a dunk and snaps back.'], ['Foot-candle', 'A measure of how much light lands on a surface.'], ['Vapor retarder', 'Plastic sheeting under a slab that blocks ground moisture.']],
        mistakes: ['Coating before the slab is fully cured.', 'Using a spray curing compound.', 'Skipping the flood test.', 'Aiming lights outward over the fence.'],
        tips: ['Ask for a light-level plan (foot-candles) with the lights; 20–30 fc is plenty for backyard play.'],
      },
      pro: 'Hire a sport-court contractor for the slab and acrylic system, a licensed electrician for lighting, and a fence contractor. Your job is planning, permits and choices.',
      tricks: [['Hire one court builder for both slab and coating', 'When one company does the concrete and the acrylic, there’s no finger-pointing if the coating fails.'], ['Ask for references you can visit', 'Look at a court the builder coated 3–5 years ago; cracks and fading tell you more than photos.'], ['Pick colors for heat', 'Lighter blues and greens stay noticeably cooler underfoot than dark colors.'], ['Clean with a blower and soft broom', 'Leaves and sap stain acrylic; clear them weekly and hose off bird droppings promptly.'], ['Hairline cracks are normal', 'Concrete courts get fine cracks; have them filled with acrylic crack filler at the next recoat rather than ignoring wide ones.'], ['Schedule recoats', 'Plan to recoat every 5–8 years; doing it before the surface wears through is far cheaper.']],
      refs: [['Resurfacing Tennis Courts: Best Practices (SportMaster)', 'https://www.sportmaster.net/10_best_practices/'], ['Plexipave Textured Acrylic Color Surfacing Spec (California Sports Surfaces)', 'https://www.californiasportssurfaces.com/wp-content/uploads/2022/04/Plexipave-CSI-Spec.doc'], ['Sports Field Lighting Standards Guide (FSG)', 'https://fsg.com/sports-field-lighting-standards-layouts-complete-guide/'], ['Basketball Hoop Installation (Goalrilla)', 'https://www.goalrilla.com/installation']],
      addons: [courtAdd.score, courtAdd.shade, courtAdd.speaker].concat(pick(court, ['tracker', 'rebound'])),
    },
  ];
  court.defaultVariant = 'classic';
})();
