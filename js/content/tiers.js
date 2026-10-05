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
      for (let i = 0; i < 70; i++) K.sph(gravel, 0.012 + rr() * 0.008, pebble, [(rr() - 0.5) * (W - 0.1), 0.017, (rr() - 0.5) * (D - 0.1)], [1.3, 0.6, 1]);
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
      K.glb(fur, 'painted_wooden_bench', { height: 0.89 }, [FX, 0, 0.2], [0, 180, 0]) || K.box(fur, [1.4, 0.45, 0.45], 'wood', [FX, 0.22, 0.2]);
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
      summary: 'The fastest, cheapest patio that still looks deliberate: a shallow dig, landscape fabric, a firm crushed-stone base, crisp steel edging and pea gravel, with flagstones leading in from the lawn.',
      intro: { show: ['dig', 'fabric', 'base', 'edging', 'gravel', 'pads', 'furniture'], spin: true, preview: true },
      safety: ['Call 811 at least 3 business days before you dig.', 'Wear gloves when handling steel edging; cut ends are razor-sharp.', 'Lift gravel bags and flagstones with your legs, and use a wheelbarrow for anything over 40 lb.'],
      causes: [['Size', '12 × 10 ft fits a bistro set and two lounge chairs.'], ['Gravel choice', '⅜″ pea gravel is comfortable underfoot; crushed stone packs firmer but feels sharper.'], ['Drainage', 'Gravel drains through, so slope matters less, but keep the area out of low spots.']],
      tools: ['Tape measure, stakes & mason line', 'Marking paint', 'Flat spade & square shovel', 'Hand tamper (or rented plate compactor)', 'Landscape fabric + staples', 'Steel edging (≈ 44 ft) + stakes', 'Rubber mallet & scrap block', '¾″ crushed stone (≈ 2.5 tons) + pea gravel (≈ 2.5 tons)', 'Landscape rake', 'Flagstones (6)'],
      steps: [
        { t: 'Lay out the rectangle', d: 'Set stakes and string 12 × 10 ft, check the diagonals match, then spray-paint the outline.', why: 'Equal diagonals mean square corners, so the steel edging runs straight and parallel to the house.', v: { cam: [4.0, 3.2, 4.2], at: [0, 0, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [1.8, 0.02, 1.5], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Strip sod and dig 4″', d: 'Slice off the sod and dig 4″ below the lawn, keeping the bottom flat. Rake out roots and stones.', why: '4″ holds 2″ of firm base plus 2″ of pea gravel, so the surface ends up level with the lawn.', v: { cam: [4.0, 3.0, 4.2], at: [0, 0, 0], hi: ['dig'], show: ['dig'], tool: { id: 'shovel', at: [1.2, 0.02, 0.8], rot: [10, 40, -15], anim: 'push' } } },
        { t: 'Tamp and lay fabric', d: 'Tamp the soil firm, then roll out landscape fabric with 6″ overlaps and pin it every 2–3 ft.', why: 'Fabric keeps gravel from sinking into the soil and stops weeds from coming up through it.', v: { cam: [3.6, 2.8, 3.8], at: [0, 0, 0], hi: ['fabric'], show: ['fabric'], hide: ['layout'] } },
        { t: 'Install the steel edging', d: 'Stake steel edging around the outline, driving it through a scrap block so the top ends ½″ above where the gravel will be.', why: 'Edging is what keeps a gravel patio looking crisp. Without it the stones migrate into the lawn within a season.', v: { cam: [2.6, 1.4, 2.8], at: [1.4, 0.05, 1.2], hi: ['edging'], show: ['edging'], tool: { id: 'hammer', at: [1.6, 0.14, 1.52], rot: [0, -20, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Spread and compact the base', d: 'Spread 2″ of ¾″ crushed stone, wet it, and compact until you can walk on it without leaving prints.', why: 'Angular crushed stone locks together under the round pea gravel, so chairs don’t sink.', v: { cam: [3.6, 2.8, 3.8], at: [0, 0, 0], hi: ['base'], show: ['base'], tool: { id: 'level', at: [-0.5, 0.065, 0.2], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Rake in the pea gravel', d: 'Dump the pea gravel in piles, then rake it out 2″ deep and level, just below the edging.', why: 'More than 2–3″ of pea gravel feels like walking on a beach; less exposes the base.', v: { cam: [3.8, 2.8, 4.0], at: [0, 0.05, 0], hi: ['gravel'], show: ['gravel'], tool: { id: 'shovel', at: [1.0, 0.09, 0.6], rot: [20, 40, -20], anim: 'push' } } },
        { t: 'Set the stepping stones', d: 'Lay flagstones from the lawn into the patio on a 24″ stride. Dig each one in so its top sits flush and tap it until it doesn’t rock.', why: 'Flush stones won’t catch a mower blade or a toe. A 24″ stride matches a normal step.', v: { cam: [2.4, 1.8, 5.6], at: [0, 0.05, 2.6], hi: ['pads'], show: ['pads'], tool: { id: 'hammer', at: [0.3, 0.12, 2.6], rot: [0, -30, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Furnish it', d: 'Set the bistro set and planters, and rake the gravel smooth again around the feet.', why: 'Wide-footed furniture sinks less into gravel; add plastic glides if chairs dig in.', v: { cam: [4.4, 3.2, 4.8], at: [0, 0.2, 0.3], hi: ['furniture'], show: ['furniture'] } },
      ],
      learn: {
        how: 'A gravel patio is a permeable surface: rain soaks straight through the stones and the fabric into the soil, so there’s no runoff to manage. The crushed-stone base carries the load and the steel edging holds the loose top layer in place.',
        specs: [['Dig depth', '4″'], ['Base', '2″ ¾″ crushed stone'], ['Top layer', '2″ ⅜″ pea gravel'], ['Edging above gravel', '½″'], ['Gravel per 100 sq ft at 2″', '≈ 0.6 yd³ (≈ 0.9 tons)']],
        terms: [['Pea gravel', 'Small, smooth, rounded stones.'], ['Crushed stone', 'Angular stone that locks together when compacted.'], ['Permeable', 'Lets water drain through instead of running off.']],
        mistakes: ['Skipping the crushed-stone base (chairs sink).', 'Laying pea gravel too deep.', 'Plastic edging that heaves and curls.'],
        tips: ['Order gravel by the ton from a landscape yard; bags cost 3–4× as much.'],
      },
      pro: 'The area holds water after storms, sits on a slope steeper than about 1″ per 4 ft, or you want it to handle vehicles.',
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
      summary: 'Two outdoor rooms in one: a raised dining terrace held by a block retaining wall with a built-in seat wall and LED caps, wide block steps with riser lights, and a lower lounge patio with an 8 ft circle-kit inlay framed in a charcoal soldier border.',
      intro: { show: ['base', 'wall1', 'wall2', 'fill', 'steps', 'stepLights', 'seatWall', 'seatCap', 'capLights', 'wallCap', 'pavers', 'circle', 'border', 'upper', 'edge', 'furniture'], spin: true, preview: true },
      safety: ['Call 811 before digging, and check permit rules; many towns require a permit for walls over 24–30″ or for steps.', 'Keep the terrace wall under 2 ft unless it’s engineered, and add a guard if any drop exceeds 30″.', 'Cut block and pavers wet, with eye, ear and dust protection (silica).', 'Low-voltage lighting only: plug the transformer into a GFCI outlet with an in-use cover.'],
      causes: [['Plan the levels', 'Two 7″ risers (14″ total) is a comfortable change; 11–12″ treads are the minimum depth.'], ['Size each room', 'A 10 × 10 ft dining terrace fits a table for six; the lower patio is the lounge.'], ['Order extra', 'Pavers +10%, wall block +5%, and a circle kit sized to the lounge area.']],
      tools: ['Tape, stakes, mason line & marking paint', 'Mini excavator or shovels; plate compactor', 'Paver base (≈ 12 tons) & concrete sand', 'Retaining-wall block + caps', 'Masonry adhesive & caulk gun', '4 ft level, rubber mallet & dead-blow hammer', 'Pavers, circle kit and soldier-border pavers', 'Screed pipes & 2×4', 'Wet saw or paver splitter', 'Edge restraint + spikes', 'Polymeric sand', 'Low-voltage transformer, wire & cap/riser lights'],
      steps: [
        { t: 'Lay out both levels', d: 'Paint the lower patio, the terrace, the step opening and the circle center. Set strings at both finished heights with ⅛″ per ft slope away from the house.', why: 'Every height you set later comes off these strings, so check them twice.', v: { cam: [6.4, 4.6, 7.0], at: [0, 0, -0.4], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [2.5, 0.02, 1.2], rot: [0, 90, 0], scale: 1.8 } } },
        { t: 'Excavate and compact', d: 'Dig 8″ below the lower finished height across the whole footprint, plus 6″ past the edges, and compact the subgrade.', why: 'Walls and pavers share one stable footing, so the two levels move together, not apart.', v: { cam: [6.4, 4.6, 7.0], at: [0, 0, -0.4], hi: ['excavate'], show: ['excavate'], hide: ['layout'], tool: { id: 'shovel', at: [1.8, 0.02, 1.4], rot: [10, 40, -15], anim: 'push', scale: 1.2 } } },
        { t: 'Build the base', d: 'Add paver base in 2″ lifts, wetting and compacting each, to 6″ under the walls and 4″ under the patio.', why: 'Thin lifts compact all the way through. The thicker pad under walls stops them from settling.', v: { cam: [6.4, 4.6, 7.0], at: [0, 0, -0.4], hi: ['base'], show: ['base'], hide: ['excavate'] } },
        { t: 'Set the first wall course', d: 'Lay the terrace wall’s first course on the base, leveling every block side to side and front to back.', why: 'A dead-level first course is the whole wall. Every error doubles by the cap.', v: { cam: [4.0, 2.4, 1.6], at: [-1.5, 0.15, -1.2], hi: ['wall1'], show: ['wall1'], tool: [{ id: 'level', at: [-1.6, 0.285, -0.35], rot: [0, 0, 0], scale: 2 }, { id: 'hammer', at: [-2.3, 0.33, -0.35], rot: [0, 20, 0], anim: 'tap', scale: 1.5 }] } },
        { t: 'Build up and backfill', d: 'Stagger the second course, then fill behind the walls with gravel in 4″ lifts, compacting each lift up to the terrace height.', why: 'Compacting in lifts stops the terrace from settling and pushing the wall out.', v: { cam: [5.6, 4.0, 3.4], at: [0, 0.2, -1.8], hi: ['wall2', 'fill'], show: ['wall2', 'fill'] } },
        { t: 'Build the steps', d: 'Stack block risers 7″ high in the opening, glue paver or cap treads on top, and set riser lights in the face as you go.', why: 'Equal risers matter more than anything else on a stair; a ¼″ difference trips people.', v: { cam: [2.6, 1.4, 2.6], at: [0, 0.3, -0.2], hi: ['steps', 'stepLights'], show: ['steps', 'stepLights'], tool: { id: 'level', at: [0, 0.335, 0.0], rot: [0, 0, 0], scale: 1.8 } } },
        { t: 'Seat wall and caps', d: 'Build two courses of seat wall on the back of the terrace, run the light wire behind them, then glue the caps on with LEDs underneath.', why: 'About 18″ seat height with a 14″ cap makes a real bench; hidden wiring keeps it clean.', v: { cam: [3.6, 2.6, 0.4], at: [0, 0.7, -2.8], hi: ['seatWall', 'seatCap', 'capLights', 'wallCap'], show: ['seatWall', 'seatCap', 'capLights', 'wallCap'], tool: { id: 'caulkGun', at: [1.0, 1.0, -2.9], rot: [0, 0, -70], scale: 1.4 } } },
        { t: 'Screed and lay the lower field', d: 'Screed 1″ of sand, set the circle kit first at its center mark, then lay the herringbone field around it and cut the pieces that meet the circle.', why: 'Starting with the circle locks in the focal point; the field is easier to cut to it than the other way around.', v: { cam: [3.6, 3.4, 4.6], at: [0, 0.15, 1.2], hi: ['sand', 'pavers', 'circle'], show: ['sand', 'pavers', 'circle'], tool: { id: 'hammer', at: [0.8, 0.22, 1.9], rot: [0, -40, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Border, terrace field and edges', d: 'Lay the charcoal soldier course around the lower patio, pave the terrace, and spike edge restraint along every open edge.', why: 'A soldier border frames the pattern and gives the cut field pieces something solid to lock against.', v: { cam: [5.6, 3.6, 5.2], at: [0, 0.2, 0.3], hi: ['border', 'upper', 'edge'], show: ['border', 'upper', 'edge'], tool: { id: 'hammer', at: [2.53, 0.2, 1.4], rot: [0, 0, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Lock the joints and furnish', d: 'Compact the pavers, sweep in polymeric sand, compact again, blow off the dust and mist it. Wait a day before setting furniture.', why: 'Polymeric sand hardens into flexible joints that resist weeds, ants and washout.', v: { cam: [6.4, 4.4, 7.0], at: [0, 0.4, -0.4], hi: ['jsand', 'furniture'], show: ['jsand', 'furniture'], hide: ['sand'] } },
      ],
      learn: {
        how: 'A two-level patio is a short retaining wall holding a compacted gravel fill, with pavers on top of both levels. The wall resists the sideways push of the fill; its weight, the setback of each course and a compacted base keep it in line. Steps are just tiny walls with treads. Because everything sits on one base, the levels stay in step with each other.',
        specs: [['Riser height', '6–7½″, all equal'], ['Tread depth', '≥ 12″'], ['Seat height', '17–19″'], ['Base under walls', '6″'], ['Base under pavers', '4″'], ['Circle kit', '8–10 ft for a lounge area']],
        terms: [['Soldier course', 'Pavers set end to end in a line, short side out, as a border.'], ['Circle kit', 'Pre-cut tapered pavers that assemble into a circle.'], ['Lift', 'One compacted layer of fill.'], ['Coping', 'Cap units on top of a wall.']],
        mistakes: ['Dumping all the fill in at once (it settles for years).', 'Uneven step risers.', 'Running light wire after the caps are glued.'],
        tips: ['Rent a paver splitter for the circle and border cuts; it’s quicker and dust-free.', 'Use 2700K warm LEDs under caps and in risers.'],
      },
      pro: 'The grade change is more than about 2 ft, the wall holds back a slope or a driveway, or local code requires an engineered wall or stair guards.',
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
      summary: 'An outdoor room: 24 × 48″ porcelain pavers on a compacted base, a motorized louvered pergola with built-in LED lighting over the dining table, and a stone-clad linear gas fire wall for the lounge. Pergola footings, wiring and the gas line need permits and licensed trades.',
      intro: { show: ['base', 'sand', 'porcelain', 'edge', 'posts', 'beams', 'louvers', 'pergolaLights', 'fireBox', 'fireClad', 'burner', 'fireGlass', 'gasFlame', 'furniture'], spin: true, preview: true },
      safety: ['Gas lines and connections must be done by a licensed gas fitter with a permit and pressure test.', 'Pergola footings and electrical (motor, lights, heaters) usually need permits; the electrical must be on GFCI circuits.', 'Porcelain is heavy and sharp-edged: lift 24 × 48″ tiles with two people or a suction lifter, and cut them wet.', 'Keep the fire feature’s clearances from the pergola roof and furniture per the burner maker.'],
      causes: [['Zones', 'Dining under cover, lounge by the fire; leave a 3 ft walkway between them.'], ['Porcelain method', '2 cm porcelain can be sand-set on a well-compacted base, or set on pedestals or a slab; pick the maker’s approved method.'], ['Utilities', 'Plan gas and electrical runs before the base goes in so nothing has to be dug up later.']],
      tools: ['Permits: pergola footings, gas, electrical', 'Mini excavator & plate compactor', 'Auger for 12″ footings + concrete', 'Paver base (≈ 20 tons) + ¼″ chip bedding', '2 cm porcelain pavers 24 × 48″ (+10%)', 'Suction lifters & rubber mallet', 'Wet tile saw with porcelain blade', 'Concrete edge restraint', 'Louvered pergola kit + anchor bolts', 'Linear burner kit & key valve (gas fitter)', 'Stone veneer, concrete caps, fire glass', 'Polymeric sand rated for porcelain'],
      steps: [
        { t: 'Design and permits', d: 'Lay out dining, lounge and walkway zones, pick the pergola and burner, and pull permits for footings, gas and electrical.', why: 'The pergola anchors, gas line and wiring all go in before the pavers, so they have to be planned first.', v: { cam: [7.0, 4.6, 7.2], at: [0, 0, -0.3], hi: ['permit', 'layout'], show: ['permit', 'layout'], tool: { id: 'tape', at: [3.3, 0.02, 1.0], rot: [0, 90, 0], scale: 1.8 } } },
        { t: 'Excavate and grade', d: 'Dig 9″ below finished height, 8–10″ past the edges, sloped ⅛″ per ft away from the house, and compact the subgrade.', why: 'Porcelain is thin and rigid; it shows any settling, so the base has to be thicker and flatter than for concrete pavers.', v: { cam: [7.0, 4.6, 7.2], at: [0, 0, -0.3], hi: ['excavate'], show: ['excavate'], hide: ['layout'], tool: { id: 'shovel', at: [1.8, 0.02, 1.6], rot: [10, 40, -15], anim: 'push', scale: 1.2 } } },
        { t: 'Pour pergola footings', d: 'Auger four 12″ holes below frost depth, pour concrete, and set the anchor bolts with the maker’s template.', why: 'A louvered roof catches wind and holds snow; it needs real footings, not pavers, under each post.', v: { cam: [4.2, 2.4, 3.4], at: [-1.2, -0.2, -0.4], hi: ['footings'], show: ['footings'], xray: true, tool: { id: 'level', at: [0.6, 0.15, 1.5], rot: [0, 0, 0], scale: 1.4 } } },
        { t: 'Gas line (licensed fitter)', d: 'The fitter trenches from the house to the fire wall location, runs approved pipe, pressure-tests it and caps it.', why: 'Burial depth, pipe type and testing are set by code; gas work is never DIY.', v: { cam: [6.2, 4.0, 0.4], at: [3.0, 0, -3.0], hi: ['gasLine'], show: ['gasLine'] } },
        { t: 'Base and bedding', d: 'Compact 6″ of base in 2″ lifts, then screed 1″ of ¼″ chip (or the maker’s bedding) dead flat.', why: 'An open-graded chip bed drains and doesn’t pump under porcelain the way sand can.', v: { cam: [7.0, 4.6, 7.2], at: [0, 0, -0.3], hi: ['base', 'sand'], show: ['base', 'sand'], hide: ['excavate'] } },
        { t: 'Lay the porcelain', d: 'Set tiles straight down with suction lifters in a running bond, 3/16″ joints, and tap each with a rubber mallet until flush with its neighbors.', why: 'Never run a plate compactor over porcelain: it cracks. Each tile is bedded by hand instead.', v: { cam: [4.0, 2.6, 4.2], at: [1.0, 0.15, 1.0], hi: ['porcelain'], show: ['porcelain'], hide: ['sand'], tool: { id: 'hammer', at: [1.2, 0.2, 1.3], rot: [0, -40, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Edges and joints', d: 'Pour a concrete toe-in edge restraint around the perimeter, then sweep in porcelain-rated polymeric sand and mist it.', why: 'Large tiles move as a unit; the restraint stops the whole field from creeping.', v: { cam: [3.0, 1.8, 4.6], at: [2.6, 0.12, 2.4], hi: ['edge'], show: ['edge'] } },
        { t: 'Raise the pergola', d: 'Bolt the posts to the anchors, plumb them, bolt on the perimeter beams, then drop in the louver blades and connect the motor and LED strips.', why: 'Plumb posts let the blades close tight and the gutters drain to the corner downspouts.', v: { cam: [3.4, 3.4, 5.6], at: [-1.3, 1.6, -0.4], hi: ['posts', 'beams', 'louvers', 'pergolaLights'], show: ['posts', 'beams', 'louvers', 'pergolaLights'], fx: 'louvers', tool: { id: 'level', at: [0.53, 1.3, 1.5], rot: [0, 0, 90], scale: 1.6 } } },
        { t: 'Build the fire wall', d: 'Build a block frame with vents on both long sides, clad it in stone veneer and caps, then the fitter sets the trough burner and key valve and leak-tests.', why: 'Cross-ventilation lets any leaked gas escape. Every finish within reach of the flame must be noncombustible.', v: { cam: [3.6, 1.8, 0.4], at: [2.05, 0.5, -2.25], hi: ['fireBox', 'fireClad', 'burner'], show: ['fireBox', 'fireClad', 'burner'], tool: { id: 'caulkGun', at: [1.2, 0.85, -2.0], rot: [0, 0, -70], scale: 1.3 } } },
        { t: 'Fire glass, light and furnish', d: 'Pour fire glass 1–2″ deep, light the burner per the maker, then set the dining set under the pergola and lounge seating by the fire.', why: 'Too much glass chokes the flame and makes soot; too little exposes the burner.', v: { cam: [7.0, 4.2, 7.0], at: [0, 0.8, -0.4], hi: ['fireGlass', 'gasFlame', 'furniture'], show: ['fireGlass', 'gasFlame', 'furniture'] } },
      ],
      learn: {
        how: 'Porcelain pavers are dense, nearly waterproof and stain-resistant, but thin and rigid, so they rely on a flat, firm base rather than interlock. The pergola is a separate structure on its own footings, and the gas fire wall is a ventilated noncombustible box around a listed burner. Utilities run under the base first, then the surface goes on top.',
        specs: [['Porcelain thickness', '2 cm (¾″)'], ['Joint width', '3/16″ (5 mm)'], ['Base', '6″ compacted'], ['Bedding', '1″ ¼″ chip'], ['Pergola footings', '12″ dia, below frost'], ['Burner', '60–90k BTU (linear)']],
        terms: [['Large-format', 'Tiles 24″ or longer on a side.'], ['Running bond', 'Each row offset by half a tile.'], ['Louvered roof', 'Rotating blades that open for sun or close against rain.'], ['Key valve', 'Gas valve opened with a removable key.']],
        mistakes: ['Plate-compacting porcelain.', 'Setting pergola posts on the pavers instead of footings.', 'Forgetting gas and power sleeves before the base goes in.'],
        tips: ['Run a spare 2″ sleeve under the patio to each zone for future wiring.', 'A slight texture (R11) porcelain is much less slippery when wet.'],
      },
      pro: 'Always for the gas line and connection, and for wiring the pergola motor, lights and heaters. Many people also hire the porcelain install; it’s precise, heavy work.',
      addons: [patioAdd.shade, patioAdd.heaterIR, patioAdd.path].concat(pick(patio, ['rug', 'speaker'])),
    },
  ];
  patio.defaultVariant = 'classic';
})();
