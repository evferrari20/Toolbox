/* BYB · More backyard builds: pergola, grill island, ground-level deck, privacy screen,
   stepping-stone path, standing planter, cornhole boards. Each has add-ons. Meters (unit: 1). */
(function () {
  const AO = TB.AO;
  const G = (o) =>
    Object.assign(
      { unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 10 }, tex: ['wood_planks', 'interlocking_concrete_pavers', 'gravel_floor', 'forrest_ground_01', 'pine_bark'] },
      o
    );
  const cedarOf = (K) => K.pbr('wood_planks', [0.4, 1.2], { color: 0xd8a27a }, 'wood');
  const ptOf = (K) => K.pbr('wood_planks', [0.4, 1.2], { color: 0xb3a27a }, 'woodLight');
  const glow = (K, c, i) => K.std(c || 0xfff1cc, { emissive: c || 0xffc870, emissiveIntensity: i == null ? 1 : i });
  const blackMetal = (K) => K.std(0x1d1f22, { metalness: 0.6, roughness: 0.45 });
  const fabric = (K, c, o) => K.std(c, Object.assign({ roughness: 1 }, o || {}));
  const stakesAndLines = (K, name, label, pts, y) => {
    const g = K.part(name, [0, 0, 0], null, label);
    pts.forEach(([x, z]) => K.box(g, [0.03, (y || 0.3) + 0.05, 0.03], 'woodLight', [x, ((y || 0.3) + 0.05) / 2, z], null, 0.004));
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      K.bar(g, [a[0], y || 0.3, a[1]], [b[0], y || 0.3, b[1]], 0.003, 'yellow');
    }
    return g;
  };
  const addonIds = (list) => list.map((a) => a.part);

  /* ===================== 1 · Pergola ===================== */
  const PERG_AO = ['aoString', 'aoFan', 'aoCurtains', 'aoCanopy', 'aoVines', 'aoLounge', 'aoSpeaker'];
  TB.model(
    'pergola',
    G({ cam: [6.0, 4.0, 6.4], at: [0, 1.3, 0], assets: ['planter_box_02'], hidden: ['layout', 'holes', 'footings', 'posts', 'braceTemp', 'beams', 'rafters', 'ties', 'braces', 'purlins'].concat(PERG_AO) }),
    (K) => {
      const S = 1.68;
      const H = 2.62;
      const cedar = cedarOf(K);
      K.box(null, [4.6, 0.04, 4.6], K.pbr('interlocking_concrete_pavers', [4, 4], {}, 'concrete'), [0, 0.02, 0], null, 0.004);
      const corners = [[S, S], [S, -S], [-S, -S], [-S, S]];
      stakesAndLines(K, 'layout', 'Layout: 12×12 ft, diagonals equal', corners.map(([x, z]) => [x * 1.12, z * 1.12]), 0.35);
      const holes = K.part('holes', [0, 0.042, 0], null, 'Footing holes (below frost line)');
      corners.forEach(([x, z]) => K.cyl(holes, [0.17, 0.17, 0.004, 24], 'dark', [x, 0, z]));
      const ft = K.part('footings', [0, 0.04, 0], null, 'Concrete footings + post bases');
      corners.forEach(([x, z]) => {
        K.cyl(ft, [0.16, 0.16, 0.05, 24], K.std(0x9b9a94, { roughness: 1 }), [x, 0.02, z]);
        K.box(ft, [0.16, 0.08, 0.16], K.std(0x8d9399, { metalness: 0.8, roughness: 0.35 }), [x, 0.08, z], null, 0.004);
      });
      const posts = K.part('posts', [0, 0.06, 0], null, '6×6 cedar posts');
      corners.forEach(([x, z]) => K.box(posts, [0.14, H, 0.14], cedar, [x, H / 2, z], null, 0.006));
      const bt = K.part('braceTemp', [0, 0, 0], null, 'Temporary 2×4 braces');
      corners.forEach(([x, z]) => {
        K.bar(bt, [x, 1.4, z], [x * 1.45, 0.02, z], 0.02, 'woodLight');
        K.bar(bt, [x, 1.4, z], [x, 0.02, z * 1.45], 0.02, 'woodLight');
      });
      const beams = K.part('beams', [0, 0, 0], null, 'Doubled 2×10 beams, through-bolted');
      [-1, 1].forEach((sz) =>
        [-1, 1].forEach((side) => K.box(beams, [4.5, 0.235, 0.038], cedar, [0, H - 0.06, sz * S + side * (0.07 + 0.019)], null, 0.004))
      );
      corners.forEach(([x, z]) => K.cyl(beams, [0.008, 0.008, 0.22, 8], 'steel', [x, H - 0.06, z], [90, 0, 0]));
      const rafters = K.part('rafters', [0, 0, 0], null, '2×8 rafters, 16″ o.c.');
      const ties = K.part('ties', [0, 0, 0], null, 'Hurricane ties');
      for (let i = 0; i <= 10; i++) {
        const x = -2.0 + i * 0.4;
        K.ext(rafters, [[-2.3, 0], [2.3, 0], [2.3, 0.08], [2.15, 0.184], [-2.15, 0.184], [-2.3, 0.08]], 0.038, cedar, [x + 0.019, H + 0.06, 0], [0, -90, 0], 0.003);
        [-1, 1].forEach((sz) => K.box(ties, [0.045, 0.06, 0.002], K.std(0xb7bec4, { metalness: 0.85, roughness: 0.3 }), [x, H + 0.09, sz * (S + 0.11)], null, 0));
      }
      const braces = K.part('braces', [0, 0, 0], null, '4×4 knee braces at 45°');
      corners.forEach(([x, z]) => K.box(braces, [0.09, 0.85, 0.09], cedar, [x - Math.sign(x) * 0.3, H - 0.46, z], [0, 0, Math.sign(x) * 45], 0.004));
      const purl = K.part('purlins', [0, 0, 0], null, '2×2 purlins (shade slats)');
      for (let j = 0; j <= 16; j++) K.box(purl, [4.4, 0.038, 0.038], cedar, [0, H + 0.06 + 0.184 + 0.019, -2.0 + j * 0.25], null, 0.003);

      /* add-ons */
      const sl = K.part('aoString', [0, 0, 0], null, 'Zig-zag café lights');
      const bulb = glow(K);
      let prev = null;
      for (let i = 0; i <= 6; i++) {
        const A = [-1.5 + i * 0.5, H - 0.12, (i % 2 ? 1 : -1) * (S + 0.05)];
        if (prev) {
          for (let k = 1; k <= 8; k++) {
            const t = k / 8;
            const p = [prev[0] + (A[0] - prev[0]) * t, prev[1] - Math.sin(Math.PI * t) * 0.35, prev[2] + (A[2] - prev[2]) * t];
            const q = [prev[0] + (A[0] - prev[0]) * (t - 1 / 8), prev[1] - Math.sin(Math.PI * (t - 1 / 8)) * 0.35, prev[2] + (A[2] - prev[2]) * (t - 1 / 8)];
            K.bar(sl, q, p, 0.004, 'black');
            if (k < 8) K.sph(sl, 0.03, bulb, [p[0], p[1] - 0.05, p[2]]);
          }
        }
        prev = A;
      }
      const fan = K.part('aoFan', [0, H + 0.06, 0], null, 'Wet-rated ceiling fan');
      const fm = K.std(0x2b2b2b, { metalness: 0.6, roughness: 0.4 });
      K.cyl(fan, [0.012, 0.012, 0.45, 10], fm, [0, -0.22, 0]);
      K.lathe(fan, [[0, 0.04], [0.09, 0.02], [0.12, -0.04], [0.0, -0.07]], fm, [0, -0.48, 0]);
      K.rep(5, (i) => {
        const b = K.group(fan, [0, -0.5, 0], [0, i * 72, 0]);
        K.box(b, [0.6, 0.01, 0.14], K.std(0x3a2f26, { roughness: 0.6 }), [0.42, 0, 0], [12, 0, 0], 0.004);
      });
      const cur = K.part('aoCurtains', [0, 0, 0], null, 'Outdoor curtains on rods');
      K.cyl(cur, [0.012, 0.012, 3.5, 10], blackMetal(K), [-S - 0.12, H - 0.25, 0], [90, 0, 0]);
      K.cyl(cur, [0.012, 0.012, 3.5, 10], blackMetal(K), [0, H - 0.25, -S - 0.12], [0, 0, 90]);
      [-1.2, 1.2].forEach((z) => {
        const g = K.group(cur, [-S - 0.12, (H - 0.25) / 2, z]);
        K.rep(6, (k) => K.box(g, [0.02, H - 0.3, 0.12], fabric(K, 0xf1ebdf), [Math.sin(k) * 0.03, 0, -0.3 + k * 0.11], null, 0.008));
      });
      [-1.2, 1.2].forEach((x) => {
        const g = K.group(cur, [x, (H - 0.25) / 2, -S - 0.12]);
        K.rep(6, (k) => K.box(g, [0.12, H - 0.3, 0.02], fabric(K, 0xf1ebdf), [-0.3 + k * 0.11, 0, Math.sin(k) * 0.03], null, 0.008));
      });
      const can = K.part('aoCanopy', [0, H + 0.3, 0], null, 'Slide-wire shade canopy');
      const canMat = fabric(K, 0xe2d6bf, { side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
      K.rep(5, (i) => K.box(can, [4.0, 0.008, 0.74], canMat, [0, -0.03 * (i % 2), -1.6 + i * 0.8], [i % 2 ? 4 : -4, 0, 0], 0));
      const vines = K.part('aoVines', [0, 0, 0], null, 'Planters with climbing vines');
      [[S + 0.3, S - 0.1], [-S - 0.3, S - 0.1]].forEach(([x, z], k) => {
        K.glb(vines, 'planter_box_02', { height: 0.45 }, [x, 0.04, z]) || K.box(vines, [0.6, 0.45, 0.35], 'wood', [x, 0.26, z]);
        const leaf = K.std(0x4f8a3a, { roughness: 0.9 });
        const pts = [];
        for (let t = 0; t <= 14; t++) pts.push([Math.sign(x) * (S + 0.02) + Math.sin(t * 1.3) * 0.08, 0.45 + t * 0.17, z + 0.1 + Math.cos(t * 1.3) * 0.08]);
        K.tube(vines, pts, 0.012, K.std(0x5b4a2e, { roughness: 1 }));
        pts.forEach((p, i) => i % 1 === 0 && K.sph(vines, 0.07, leaf, p, [1.3, 0.6, 1]));
      });
      const lounge = K.part('aoLounge', [0, 0.04, 0], null, 'Outdoor sectional + table');
      const frame = K.std(0x6a5844, { roughness: 0.8 });
      const cush = fabric(K, 0xe8e2d4);
      K.box(lounge, [2.2, 0.32, 0.8], frame, [0, 0.16, -1.0], null, 0.02);
      K.box(lounge, [2.2, 0.4, 0.15], frame, [0, 0.52, -1.33], null, 0.02);
      K.box(lounge, [0.8, 0.32, 1.4], frame, [-1.1 + 0.4, 0.16, -0.0], null, 0.02);
      K.box(lounge, [2.1, 0.12, 0.7], cush, [0, 0.38, -0.98], null, 0.04);
      K.box(lounge, [0.7, 0.12, 1.3], cush, [-0.7, 0.38, 0.05], null, 0.04);
      K.rep(3, (i) => K.box(lounge, [0.62, 0.42, 0.14], cush, [-0.7 + i * 0.7, 0.62, -1.24], [-10, 0, 0], 0.05));
      K.box(lounge, [0.9, 0.38, 0.6], K.pbr('wood_planks', [0.5, 0.5], { color: 0xd8a27a }, 'wood'), [0.4, 0.19, 0.1], null, 0.02);
      const spk = K.part('aoSpeaker', [0, 0, 0], null, 'Beam-mounted outdoor speakers');
      [-1.2, 1.2].forEach((x) => {
        K.box(spk, [0.16, 0.24, 0.14], K.std(0xf2f2ef, { roughness: 0.5 }), [x, H - 0.3, -S - 0.16], [-15, 0, 0], 0.02);
        K.cyl(spk, [0.05, 0.05, 0.005, 20], 'dark', [x, H - 0.33, -S - 0.08], [75, 0, 0]);
      });
    }
  );

  /* ===================== 2 · Grill island ===================== */
  const GI_AO = ['aoFridge', 'aoLED', 'aoStools', 'aoPizza', 'aoSink', 'aoString', 'aoSpeaker'];
  TB.model(
    'grillIsland',
    G({ cam: [3.2, 2.2, 3.4], at: [0, 0.6, 0], tex: ['interlocking_concrete_pavers', 'stacked_stone_wall', 'granite_tile', 'wood_planks'], assets: [], hidden: ['layout', 'block', 'backer', 'veneer', 'counter', 'grill', 'doors', 'utilities'].concat(GI_AO) }),
    (K) => {
      const L = 2.44, D = 0.76, Hb = 0.8;
      K.box(null, [5, 0.04, 4], K.pbr('interlocking_concrete_pavers', [4, 3.2], {}, 'concrete'), [0, 0.02, 0], null, 0.004);
      stakesAndLines(K, 'layout', 'Chalk layout on the patio', [[-L / 2, -D / 2], [L / 2, -D / 2], [L / 2, D / 2], [-L / 2, D / 2]], 0.045);
      const rect = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      const openings = [rect(-0.95, -0.35, 0.14, 0.64).reverse(), rect(0.4, 0.95, 0.12, 0.72).reverse()];
      const front = (name, label, z, depth, mat) => {
        const g = K.part(name, [0, 0.04, 0], null, label);
        K.ext(g, rect(-L / 2, L / 2, 0, Hb), depth, mat, [0, 0, z], null, 0.004, openings);
        K.box(g, [L, Hb, depth], mat, [0, Hb / 2, -z - depth / 2 + 0.0], null, 0.004);
        K.box(g, [depth, Hb, D - 2 * depth], mat, [L / 2 - depth / 2, Hb / 2, 0], null, 0.004);
        K.box(g, [depth, Hb, D - 2 * depth], mat, [-L / 2 + depth / 2, Hb / 2, 0], null, 0.004);
        return g;
      };
      const blk = front('block', 'Concrete-block shell (8″ CMU)', D / 2 - 0.19, 0.19, K.std(0x9d9c97, { roughness: 1 }));
      K.rep(4, (i) => K.box(blk, [L + 0.002, 0.008, D + 0.002], K.std(0x8a8984, { roughness: 1 }), [0, 0.2 * (i + 1), 0], null, 0));
      front('backer', 'Cement board + scratch coat', D / 2, 0.012, K.std(0xb9b7b0, { roughness: 1 })).scale.set(1.005, 1, 1.03);
      const stone = K.pbr('stacked_stone_wall', [1.6, 0.6], { roughness: 1 }, 'stone');
      front('veneer', 'Stacked-stone veneer', D / 2 + 0.012, 0.03, stone).scale.set(1.03, 1, 1.08);
      const counter = K.part('counter', [0, Hb + 0.04 + 0.04, 0], null, 'Granite countertop (1¼″ overhang)');
      K.ext(counter, rect(-L / 2 - 0.06, L / 2 + 0.06, -D / 2 - 0.06, D / 2 + 0.08), 0.04, K.pbr('granite_tile', [1.5, 0.6], { roughness: 0.35 }, 'offwhite'), [0, 0, 0], [90, 0, 0], 0.004, [rect(-0.38, 0.42, -0.28, 0.22).reverse()]);
      const grill = K.part('grill', [0.02, Hb + 0.08, -0.03], null, 'Drop-in gas grill');
      const ss = K.std(0xc7cbcf, { metalness: 0.9, roughness: 0.28 });
      K.box(grill, [0.78, 0.25, 0.48], ss, [0, -0.12, 0], null, 0.006);
      K.box(grill, [0.84, 0.02, 0.54], ss, [0, 0.01, 0], null, 0.004);
      K.ext(grill, [[-0.38, 0], [0.38, 0], [0.38, 0.12], [0.3, 0.22], [-0.3, 0.22], [-0.38, 0.12]], 0.44, ss, [0, 0.02, -0.22], null, 0.01);
      K.cyl(grill, [0.012, 0.012, 0.6, 12], 'chrome', [0, 0.2, 0.25], [0, 0, 90]);
      K.box(grill, [0.8, 0.1, 0.03], ss, [0, -0.06, 0.255], null, 0.004);
      K.rep(4, (i) => K.cyl(grill, [0.022, 0.022, 0.025, 20], 'dark', [-0.27 + i * 0.18, -0.06, 0.28], [90, 0, 0]));
      const doors = K.part('doors', [0, 0.04, D / 2 + 0.045], null, 'Stainless access doors + drawers');
      K.box(doors, [0.29, 0.5, 0.02], ss, [-0.8, 0.39, 0], null, 0.004);
      K.box(doors, [0.29, 0.5, 0.02], ss, [-0.5, 0.39, 0], null, 0.004);
      [-0.68, -0.62].forEach((x) => K.box(doors, [0.012, 0.2, 0.02], 'chrome', [x, 0.42, 0.02], null, 0.003));
      K.rep(3, (i) => {
        K.box(doors, [0.53, 0.19, 0.02], ss, [0.675, 0.215 + i * 0.198, 0], null, 0.004);
        K.box(doors, [0.2, 0.012, 0.02], 'chrome', [0.675, 0.27 + i * 0.198, 0.02], null, 0.003);
      });
      const util = K.part('utilities', [0, 0.04, 0], null, 'Gas line, shutoff & GFCI outlet');
      K.tube(util, [[-1.6, 0.0, -0.3], [-1.35, 0.15, -0.3], [-1.22, 0.3, -0.25]], 0.012, 'brass');
      K.box(util, [0.06, 0.06, 0.06], 'yellow', [-1.3, 0.2, -0.27], null, 0.006);
      K.box(util, [0.012, 0.12, 0.08], K.std(0xf4f4f1, { roughness: 0.4 }), [L / 2 + 0.05, 0.6, 0], null, 0.004);

      /* add-ons */
      const fr = K.part('aoFridge', [0.675, 0.04, D / 2 + 0.06], null, 'Outdoor-rated fridge');
      K.box(fr, [0.54, 0.6, 0.03], ss, [0, 0.42, 0], null, 0.006);
      K.box(fr, [0.42, 0.42, 0.006], K.std(0x24303a, { roughness: 0.05, transparent: true, opacity: 0.8 }), [0, 0.44, 0.016], null, 0.004);
      K.box(fr, [0.4, 0.016, 0.02], 'chrome', [0, 0.68, 0.03], null, 0.004);
      const led = K.part('aoLED', [0, Hb + 0.065, D / 2 + 0.06], null, 'LED strip under the counter lip');
      K.box(led, [L, 0.006, 0.01], glow(K, 0xfff3d8, 1.4), [0, 0, 0], null, 0);
      K.box(led, [L, 0.4, 0.002], K.std(0xfff1cc, { transparent: true, opacity: 0.12, emissive: 0xffe2a8, emissiveIntensity: 0.5, depthWrite: false }), [0, -0.2, 0.01], null, 0);
      const st = K.part('aoStools', [0, 0, 0], null, 'Counter-height stools');
      [-0.7, 0, 0.7].forEach((x) => {
        const s = K.group(st, [x, 0.04, -D / 2 - 0.45]);
        K.cyl(s, [0.2, 0.2, 0.05, 24], K.pbr('wood_planks', [0.3, 0.3], { color: 0xc89466 }, 'wood'), [0, 0.64, 0]);
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => K.bar(s, [a * 0.13, 0.62, b * 0.13], [a * 0.18, 0, b * 0.18], 0.012, blackMetal(K)));
        K.tor(s, [0.16, 0.008], blackMetal(K), [0, 0.25, 0], [90, 0, 0]);
      });
      const pz = K.part('aoPizza', [-0.85, Hb + 0.08, -0.05], null, 'Countertop pizza oven');
      K.box(pz, [0.5, 0.06, 0.5], K.std(0x2a2b2d, { roughness: 0.5 }), [0, 0.03, 0], null, 0.01);
      K.sph(pz, 0.24, K.std(0xb8442b, { roughness: 0.7 }), [0, 0.06, 0], [1, 0.75, 1]);
      K.box(pz, [0.22, 0.12, 0.08], 'dark', [0, 0.1, 0.22], null, 0.03);
      K.cyl(pz, [0.04, 0.04, 0.2, 16], 'steel', [0, 0.32, -0.05]);
      const sink = K.part('aoSink', [0.82, Hb + 0.081, -0.05], null, 'Bar sink + faucet');
      K.box(sink, [0.36, 0.006, 0.32], ss, [0, 0, 0], null, 0.002);
      K.box(sink, [0.3, 0.005, 0.26], K.std(0x7d8389, { metalness: 0.9, roughness: 0.3 }), [0, 0.002, 0], null, 0.002);
      K.tube(sink, [[0, 0, -0.2], [0, 0.3, -0.2], [0, 0.36, -0.12], [0, 0.3, -0.04]], 0.012, 'chrome');
      AO.stringLights(K, 'aoString', [[-2.2, -1.7], [2.2, -1.7], [2.2, 1.7], [-2.2, 1.7]], 2.7, true);
      AO.speaker(K, 'aoSpeaker', [1.6, 0.04, 0.9]);
    }
  );

  /* ===================== 3 · Ground-level deck ===================== */
  const DK_AO = ['aoLights', 'aoBench', 'aoPlanters', 'aoScreen', 'aoRug', 'aoString'];
  TB.model(
    'deckPlatform',
    G({ cam: [5.2, 3.4, 5.6], at: [0, 0.3, 0], tex: ['wood_floor_deck', 'wood_planks', 'gravel_floor', 'forrest_ground_01'], assets: ['planter_box_01', 'painted_wooden_bench'], hidden: ['layout', 'base', 'blocks', 'beams', 'joists', 'rim', 'decking', 'fascia'].concat(DK_AO) }),
    (K) => {
      const S = 1.83;
      const pt = ptOf(K);
      stakesAndLines(K, 'layout', 'Layout: 12×12 ft, squared', [[-S - 0.1, -S - 0.1], [S + 0.1, -S - 0.1], [S + 0.1, S + 0.1], [-S - 0.1, S + 0.1]], 0.4);
      const base = K.part('base', [0, 0.02, 0], null, 'Fabric + 3″ gravel');
      K.box(base, [2 * S + 0.3, 0.04, 2 * S + 0.3], K.pbr('gravel_floor', [3, 3], {}, 'stone'), [0, 0, 0], null, 0.004);
      const blocks = K.part('blocks', [0, 0.04, 0], null, 'Precast deck blocks (level)');
      [-1.5, 0, 1.5].forEach((x) =>
        [-1.5, 0, 1.5].forEach((z) => {
          K.cone(blocks, [0.2, 0.2, 4], K.std(0x9b9a94, { roughness: 1 }), [x, 0.1, z], [0, 45, 0]);
          K.box(blocks, [0.2, 0.06, 0.2], K.std(0x9b9a94, { roughness: 1 }), [x, 0.16, z], null, 0.004);
        })
      );
      const beams = K.part('beams', [0, 0, 0], null, 'Doubled 2×8 beams in the block slots');
      [-1.5, 0, 1.5].forEach((z) => K.box(beams, [2 * S, 0.184, 0.076], pt, [0, 0.2 + 0.092, z], null, 0.004));
      const joists = K.part('joists', [0, 0, 0], null, '2×6 joists, 16″ o.c.');
      for (let i = 0; i < 10; i++) K.box(joists, [0.038, 0.14, 2 * S - 0.08], pt, [-S + 0.04 + i * 0.4, 0.384 + 0.07, 0], null, 0.003);
      const rim = K.part('rim', [0, 0, 0], null, 'Rim joists + hangers');
      [-1, 1].forEach((s) => K.box(rim, [2 * S, 0.14, 0.038], pt, [0, 0.454, s * (S - 0.019)], null, 0.003));
      [-1, 1].forEach((s) => K.box(rim, [0.038, 0.14, 2 * S], pt, [s * (S - 0.019), 0.454, 0], null, 0.003));
      const dk = K.part('decking', [0, 0, 0], null, '5/4 deck boards, ⅛″ gaps');
      const deckMat = K.pbr('wood_floor_deck', [2, 0.25], { color: 0xd6a57a }, 'wood');
      for (let i = 0; i < 26; i++) K.box(dk, [2 * S + 0.02, 0.025, 0.137], deckMat, [0, 0.537, -S + 0.07 + i * 0.1405], null, 0.004);
      const fas = K.part('fascia', [0, 0, 0], null, 'Fascia trim');
      [-1, 1].forEach((s) => K.box(fas, [2 * S + 0.06, 0.18, 0.019], deckMat, [0, 0.46, s * (S + 0.01)], null, 0.003));
      [-1, 1].forEach((s) => K.box(fas, [0.019, 0.18, 2 * S + 0.06], deckMat, [s * (S + 0.01), 0.46, 0], null, 0.003));
      const top = 0.55;
      const lights = K.part('aoLights', [0, 0, 0], null, 'Low-voltage fascia lights');
      for (let i = -3; i <= 3; i++) K.cyl(lights, [0.02, 0.02, 0.01, 16], glow(K, 0xfff1cc, 1.6), [i * 0.5, 0.48, S + 0.025], [90, 0, 0]);
      const bench = K.part('aoBench', [0, top, -S + 0.25], null, 'Built-in bench');
      K.box(bench, [2.4, 0.04, 0.4], deckMat, [0, 0.43, 0], null, 0.004);
      [-1.05, 0, 1.05].forEach((x) => K.box(bench, [0.09, 0.42, 0.35], deckMat, [x, 0.21, 0], null, 0.004));
      const pl = K.part('aoPlanters', [0, top, 0], null, 'Corner planters');
      [[S - 0.35, S - 0.35], [-S + 0.35, S - 0.35]].forEach(([x, z]) => K.glb(pl, 'planter_box_01', { height: 0.5 }, [x, 0, z]) || K.box(pl, [0.5, 0.5, 0.5], 'wood', [x, 0.25, z]));
      const scr = K.part('aoScreen', [0, top, -S + 0.05], null, 'Slat privacy screen');
      [-1.6, 0, 1.6].forEach((x) => K.box(scr, [0.09, 1.8, 0.09], deckMat, [x, 0.9, 0], null, 0.004));
      for (let i = 0; i < 12; i++) K.box(scr, [3.4, 0.12, 0.019], deckMat, [0, 0.55 + i * 0.105, 0.055], null, 0.003);
      AO.rug(K, 'aoRug', [2.4, 1.7], [0, top, 0.3]);
      AO.stringLights(K, 'aoString', [[-S + 0.1, -S + 0.1], [S - 0.1, -S + 0.1], [S - 0.1, S - 0.1], [-S + 0.1, S - 0.1]], 2.6, true);
      K.parts.aoString.position.y = top;
    }
  );

  /* ===================== 4 · Horizontal slat privacy screen ===================== */
  const PS_AO = ['aoSconce', 'aoPlanters', 'aoShelf', 'aoString', 'aoSpeaker'];
  TB.model(
    'privacyScreen',
    G({ cam: [3.6, 2.0, 4.6], at: [0, 0.9, 0], assets: ['planter_box_01', 'potted_plant_02'], hidden: ['layout', 'holes', 'posts', 'concrete', 'slatsLow', 'slatsHigh', 'cap', 'trim'].concat(PS_AO) }),
    (K) => {
      const X = [-2.44, 0, 2.44];
      const H = 1.83;
      const cedar = cedarOf(K);
      K.box(null, [6, 0.03, 2.4], K.pbr('gravel_floor', [5, 2], {}, 'stone'), [0, 0.015, 0.9], null, 0.004);
      const lay = K.part('layout', [0, 0, 0], null, 'String line + post marks (8 ft o.c.)');
      X.forEach((x) => K.box(lay, [0.03, 0.4, 0.03], 'woodLight', [x, 0.2, 0.25], null, 0.004));
      K.bar(lay, [-2.8, 0.3, 0], [2.8, 0.3, 0], 0.003, 'yellow');
      const holes = K.part('holes', [0, 0.034, 0], null, '10″ holes, 30″+ deep');
      X.forEach((x) => K.cyl(holes, [0.13, 0.13, 0.004, 24], 'dark', [x, 0, 0]));
      const posts = K.part('posts', [0, 0, 0], null, '4×4 posts, plumb');
      X.forEach((x) => K.box(posts, [0.09, H + 0.05, 0.09], ptOf(K), [x, (H + 0.05) / 2, 0], null, 0.004));
      const conc = K.part('concrete', [0, 0.035, 0], null, 'Concrete, crowned to shed water');
      X.forEach((x) => K.cone(conc, [0.14, 0.04, 24], K.std(0x9b9a94, { roughness: 1 }), [x, 0.0, 0]));
      const slat = (name, label, from, to) => {
        const g = K.part(name, [0, 0, 0.0545], null, label);
        for (let i = from; i < to; i++) K.box(g, [4.97, 0.14, 0.019], cedar, [0, 0.12 + i * 0.153, 0], null, 0.003);
        return g;
      };
      slat('slatsLow', '1×6 cedar slats, ½″ gaps (bottom half)', 0, 6);
      slat('slatsHigh', 'Top half', 6, 11);
      const cap = K.part('cap', [0, H + 0.04, 0.02], null, '2×6 cap');
      K.box(cap, [5.05, 0.038, 0.14], cedar, [0, 0, 0], null, 0.004);
      const trim = K.part('trim', [0, 0, 0.075], null, '1×4 trim over each post');
      X.forEach((x) => K.box(trim, [0.089, H - 0.05, 0.019], cedar, [x, H / 2, 0], null, 0.003));
      const sc = K.part('aoSconce', [0, 0, 0.11], null, 'Outdoor wall sconces');
      [-2.44, 2.44].forEach((x) => {
        K.box(sc, [0.1, 0.2, 0.03], blackMetal(K), [x, 1.45, 0], null, 0.01);
        K.cyl(sc, [0.05, 0.05, 0.16, 16, true], K.std(0x1d1f22, { metalness: 0.6, roughness: 0.45, side: THREE.DoubleSide }), [x, 1.42, 0.07]);
        K.cyl(sc, [0.04, 0.04, 0.12, 16], glow(K, 0xfff1cc, 1.4), [x, 1.42, 0.07]);
      });
      const pl = K.part('aoPlanters', [0, 0.03, 0.45], null, 'Planters along the base');
      [-1.6, 0, 1.6].forEach((x) => K.glb(pl, 'planter_box_01', { height: 0.45 }, [x, 0, 0]) || K.box(pl, [0.6, 0.45, 0.35], 'wood', [x, 0.22, 0]));
      const sh = K.part('aoShelf', [0, 0, 0.13], null, 'Cedar plant shelves');
      [[-1.2, 1.0], [1.2, 1.3]].forEach(([x, y]) => {
        K.box(sh, [0.9, 0.03, 0.18], cedar, [x, y, 0], null, 0.004);
        [-0.3, 0.3].forEach((dx) => K.box(sh, [0.03, 0.12, 0.12], blackMetal(K), [x + dx, y - 0.07, -0.03], null, 0.004));
        K.glb(sh, 'potted_plant_02', { height: 0.3 }, [x - 0.2, y + 0.015, 0]) || K.sph(sh, 0.1, 'green', [x - 0.2, y + 0.12, 0]);
        K.glb(sh, 'potted_plant_02', { height: 0.24 }, [x + 0.22, y + 0.015, 0]) || null;
      });
      const sl = K.part('aoString', [0, 0, 0.12], null, 'String lights along the cap');
      const bulb = glow(K);
      for (let s = 0; s < 2; s++) {
        const a = X[s], b = X[s + 1];
        for (let k = 0; k <= 10; k++) {
          const t = k / 10;
          const p = [a + (b - a) * t, H - 0.02 - Math.sin(Math.PI * t) * 0.3, 0];
          if (k) K.bar(sl, [a + (b - a) * (t - 0.1), H - 0.02 - Math.sin(Math.PI * (t - 0.1)) * 0.3, 0], p, 0.004, 'black');
          if (k && k < 10) K.sph(sl, 0.03, bulb, [p[0], p[1] - 0.05, 0]);
        }
      }
      const spk = K.part('aoSpeaker', [0, 1.5, 0.15], null, 'Outdoor speaker on the center post');
      K.box(spk, [0.16, 0.24, 0.14], K.std(0x2a2b2d, { roughness: 0.5 }), [0, 0, 0], [-10, 0, 0], 0.02);
      K.cyl(spk, [0.05, 0.05, 0.005, 20], 'grey', [0, -0.02, 0.07], [80, 0, 0]);
    }
  );

  /* ===================== 5 · Stepping-stone path ===================== */
  const SP_AO = ['aoLights', 'aoArbor', 'aoThyme', 'aoBench', 'aoBirdbath'];
  const PATH = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    PATH.push([-3 + t * 6, Math.sin(t * Math.PI * 1.3) * 1.2 - (t - 0.5) * 2.2]);
  }
  TB.model(
    'steppingPath',
    G({ cam: [4.2, 3.6, 5.0], at: [0, 0, 0], tex: ['stacked_stone_wall', 'forrest_ground_01', 'wood_planks'], assets: ['painted_wooden_bench', 'potted_plant_01'], hidden: ['hose', 'stones', 'outline', 'holes', 'sand', 'joints'].concat(SP_AO) }),
    (K) => {
      const hose = K.part('hose', [0, 0.02, 0], null, 'Garden hose laying out the curve');
      K.tube(hose, PATH.map(([x, z]) => [x, 0, z]), 0.018, 'green');
      const stoneMat = K.std(0x7a7369, { roughness: 0.95 });
      const shape = (i) => {
        const pts = [];
        for (let k = 0; k < 9; k++) {
          const a = (k / 9) * Math.PI * 2;
          const r = 0.24 + 0.05 * Math.sin(a * 3 + i * 1.7) + 0.03 * Math.cos(a * 5 + i);
          pts.push([Math.cos(a) * r * 1.15, Math.sin(a) * r]);
        }
        return pts;
      };
      const stones = K.part('stones', [0, 0, 0], null, 'Flagstone steppers (2″ thick)');
      const outline = K.part('outline', [0, 0.012, 0], null, 'Traced outline of each stone');
      const holes = K.part('holes', [0, 0.008, 0], null, 'Sod cut, dug to stone depth + 1″');
      const sand = K.part('sand', [0, 0.012, 0], null, '1″ leveling sand');
      PATH.forEach(([x, z], i) => {
        const ang = i * 37;
        const at = (p, y) => K.group(p, [x, y, z], [0, ang, 0]);
        K.ext(at(stones, 0.055), shape(i), 0.05, stoneMat, [0, 0, 0], [90, 0, 0], 0.008);
        K.tube(at(outline, 0.006), shape(i).map(([a, b]) => [a * 1.05, 0, b * 1.05]), 0.008, 'yellow', true);
        K.ext(at(holes, 0.004), shape(i).map(([a, b]) => [a * 1.06, b * 1.06]), 0.004, K.pbr('forrest_ground_01', [0.5, 0.5], {}, 'dirt'), [0, 0, 0], [90, 0, 0], 0);
        K.ext(at(sand, 0.008), shape(i), 0.004, K.std(0xd9c49a, { roughness: 1 }), [0, 0, 0], [90, 0, 0], 0);
      });
      const joints = K.part('joints', [0, 0.006, 0], null, 'Soil swept into gaps, watered');
      PATH.forEach(([x, z], i) => K.ext(K.group(joints, [x, 0.004, z], [0, i * 37, 0]), shape(i).map(([a, b]) => [a * 1.1, b * 1.1]), 0.002, K.std(0x5d4a35, { roughness: 1 }), [0, 0, 0], [90, 0, 0], 0));
      const lp = PATH.filter((_, i) => i % 2).map(([x, z], i) => [x + 0.15, z + (i % 2 ? 0.55 : -0.55)]);
      AO.stakeLights(K, 'aoLights', lp, 'Solar path lights');
      const arbor = K.part('aoArbor', [PATH[0][0] - 0.2, 0, PATH[0][1]], null, 'Cedar garden arbor');
      const cedar = cedarOf(K);
      [[-0.6, -0.35], [-0.6, 0.35], [0.6, -0.35], [0.6, 0.35]].forEach(([z, x]) => K.box(arbor, [0.07, 2.2, 0.07], cedar, [x, 1.1, z], null, 0.004));
      K.rep(7, (i) => K.box(arbor, [1.0, 0.09, 0.038], cedar, [0, 2.2, -0.75 + i * 0.25], null, 0.003));
      [-0.35, 0.35].forEach((x) => K.box(arbor, [0.038, 0.14, 1.7], cedar, [x, 2.1, 0], null, 0.003));
      const thyme = K.part('aoThyme', [0, 0.01, 0], null, 'Creeping thyme between stones');
      PATH.forEach(([x, z], i) => {
        if (!i) return;
        const [px, pz] = PATH[i - 1];
        K.sph(thyme, 0.11, K.std(0x3f6b2a, { roughness: 1 }), [(x + px) / 2, 0, (z + pz) / 2], [1.4, 0.3, 1.0]);
        K.sph(thyme, 0.035, K.std(0x9b6fc0, { roughness: 1 }), [(x + px) / 2 + 0.05, 0.03, (z + pz) / 2], [1.4, 0.4, 1]);
      });
      AO.bench(K, 'aoBench', [PATH[8][0] + 0.6, 0, PATH[8][1] - 0.4], -60, 'Garden bench at the end');
      const bb = K.part('aoBirdbath', [0.6, 0, 1.2], null, 'Birdbath');
      K.lathe(bb, [[0, 0], [0.16, 0], [0.12, 0.05], [0.06, 0.12], [0.05, 0.6], [0.07, 0.65], [0.3, 0.72], [0.32, 0.76], [0.0, 0.7]], K.std(0xb9b1a3, { roughness: 1 }));
      K.cyl(bb, [0.28, 0.28, 0.01, 32], 'water', [0, 0.745, 0]);
    }
  );

  /* ===================== 6 · Standing cedar planter ===================== */
  const PL_AO = ['aoCasters', 'aoTrellis', 'aoDrip', 'aoSensor', 'aoLights'];
  TB.model(
    'planterBox',
    G({ cam: [1.9, 1.5, 2.2], at: [0, 0.5, 0], ground: { tex: 'interlocking_concrete_pavers', repeat: 6, radius: 6 }, assets: ['potted_plant_02', 'grass_medium_01'], hidden: ['lumber', 'legs', 'aprons', 'sides', 'bottom', 'shelf', 'liner', 'soil', 'plants'].concat(PL_AO) }),
    (K) => {
      const L = 1.2, W = 0.55, top = 0.8;
      const cedar = cedarOf(K);
      const lum = K.part('lumber', [0.2, 0, 0.9], null, 'Cut list: 4×4 legs, 1×6 sides, 1×4 slats');
      K.rep(6, (i) => K.box(lum, [1.25, 0.019, 0.14], cedar, [0, 0.01 + i * 0.02, (i % 3) * 0.16 - 0.16], null, 0.003));
      K.rep(4, (i) => K.box(lum, [0.09, 0.09, 0.8], cedar, [0.75 + (i % 2) * 0.1, 0.045 + Math.floor(i / 2) * 0.09, 0], null, 0.004));
      const legs = K.part('legs', [0, 0, 0], null, '4×4 legs');
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => K.box(legs, [0.09, top, 0.09], cedar, [sx * (L / 2 - 0.045), top / 2, sz * (W / 2 - 0.045)], null, 0.004));
      const ap = K.part('aprons', [0, 0, 0], null, 'End frames (short sides)');
      [-1, 1].forEach((sx) => [0, 1].forEach((r) => K.box(ap, [0.019, 0.14, W - 0.02], cedar, [sx * (L / 2 + 0.0095), top - 0.07 - r * 0.142, 0], null, 0.003)));
      const sides = K.part('sides', [0, 0, 0], null, 'Long sides (2 rows of 1×6)');
      [-1, 1].forEach((sz) => [0, 1].forEach((r) => K.box(sides, [L + 0.04, 0.14, 0.019], cedar, [0, top - 0.07 - r * 0.142, sz * (W / 2 + 0.0095)], null, 0.003)));
      const bot = K.part('bottom', [0, top - 0.29, 0], null, 'Bottom slats (¼″ drainage gaps) on cleats');
      K.rep(13, (i) => K.box(bot, [0.083, 0.019, W - 0.1], cedar, [-L / 2 + 0.1 + i * 0.0835, 0, 0], null, 0.002));
      [-1, 1].forEach((sz) => K.box(bot, [L - 0.18, 0.038, 0.038], cedar, [0, -0.028, sz * (W / 2 - 0.07)], null, 0.003));
      const shelf = K.part('shelf', [0, 0.18, 0], null, 'Lower shelf');
      K.rep(5, (i) => K.box(shelf, [L - 0.18, 0.019, 0.083], cedar, [0, 0, -0.18 + i * 0.09], null, 0.002));
      const liner = K.part('liner', [0, top - 0.275, 0], null, 'Landscape-fabric liner');
      K.box(liner, [L - 0.06, 0.004, W - 0.06], K.std(0x3a3a3a, { roughness: 1 }), [0, 0, 0], null, 0);
      const soil = K.part('soil', [0, top - 0.04, 0], null, 'Potting mix');
      K.box(soil, [L - 0.06, 0.02, W - 0.06], K.pbr('forrest_ground_01', [1, 0.5], {}, 'dirt'), [0, 0, 0], null, 0);
      const plants = K.part('plants', [0, top - 0.03, 0], null, 'Herbs & greens');
      [-0.4, -0.13, 0.14, 0.4].forEach((x, i) => K.glb(plants, i % 2 ? 'potted_plant_02' : 'grass_medium_01', i % 2 ? { height: 0.26 } : { node: 'grass_medium_01_mid_a_LOD0', height: 0.22 }, [x, 0, 0]) || K.sph(plants, 0.09, 'green', [x, 0.09, 0]));
      const cas = K.part('aoCasters', [0, 0, 0], null, 'Locking casters');
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
        K.cyl(cas, [0.035, 0.035, 0.025, 20], 'dark', [sx * (L / 2 - 0.045), 0.035, sz * (W / 2 - 0.045)], [90, 0, 0]);
        K.box(cas, [0.06, 0.012, 0.06], 'steel', [sx * (L / 2 - 0.045), 0.075, sz * (W / 2 - 0.045)], null, 0.002);
      });
      const tr = K.part('aoTrellis', [0, top, -W / 2 - 0.02], null, 'Back trellis');
      [-1, 1].forEach((s) => K.box(tr, [0.038, 1.0, 0.038], cedar, [s * (L / 2 - 0.05), 0.5, 0], null, 0.003));
      K.rep(6, (i) => K.box(tr, [L - 0.1, 0.019, 0.019], cedar, [0, 0.15 + i * 0.16, 0], null, 0.002));
      K.rep(5, (i) => K.box(tr, [0.019, 0.95, 0.019], cedar, [-0.4 + i * 0.2, 0.5, 0.0], null, 0.002));
      const drip = K.part('aoDrip', [0, top - 0.025, 0], null, 'Drip line + Wi-Fi timer');
      K.cyl(drip, [0.006, 0.006, L - 0.15, 8], 'black', [0, 0, 0], [0, 0, 90]);
      K.tube(drip, [[L / 2 - 0.07, 0, 0], [L / 2 + 0.1, -0.1, 0], [L / 2 + 0.15, -0.6, 0.1], [L / 2 + 0.35, -0.74, 0.3]], 0.007, 'black');
      K.box(drip, [0.09, 0.13, 0.06], K.std(0x2f6fde, { roughness: 0.4 }), [L / 2 + 0.4, -0.7, 0.3], null, 0.01);
      AO.sensor(K, 'aoSensor', [0.25, top - 0.05, 0.1]);
      const lt = K.part('aoLights', [0, top - 0.02, W / 2 + 0.03], null, 'LED strip under the lip');
      K.box(lt, [L, 0.006, 0.008], glow(K, 0xfff1cc, 1.3), [0, 0, 0], null, 0);
    }
  );

  /* ===================== 7 · Cornhole boards ===================== */
  const CH_AO = ['aoLED', 'aoWrap', 'aoScore', 'aoCaddy', 'aoHandles', 'aoSpeaker'];
  TB.model(
    'cornhole',
    G({ cam: [11, 6, 0.5], at: [0, 0.2, 0], assets: [], hidden: ['ply', 'frames', 'topsSolid', 'tops', 'legs', 'paint', 'poly', 'bags'].concat(CH_AO) }),
    (K) => {
      const ply = K.pbr('wood_planks', [0.6, 1.2], { color: 0xe6c9a0 }, 'woodLight');
      const frameMat = ptOf(K);
      const boardParts = {};
      const mk = (name, label) => (boardParts[name] = K.part(name, [0, 0, 0], null, label));
      mk('frames', '2×4 frames');
      mk('topsSolid', '½″ plywood tops, glued & screwed');
      mk('tops', 'Tops with 6″ holes');
      mk('legs', 'Folding legs (12″ back height)');
      mk('paint', 'Primer + paint');
      mk('poly', 'Polyurethane clear coat');
      mk('aoLED', 'LED hole and edge lights');
      mk('aoWrap', 'Vinyl graphics wrap');
      mk('aoHandles', 'Carry handles');
      const hole = K.circle(0, 0.381, 0.0762, 32).reverse();
      const outline = [[-0.305, -0.61], [0.305, -0.61], [0.305, 0.61], [-0.305, 0.61]];
      [4.1, -4.1].forEach((zc) => {
        const ry = zc > 0 ? 0 : 180;
        const sub = (part) => {
          const b = K.group(boardParts[part], [0, 0, zc], [0, ry, 0]);
          return { b, t: K.group(b, [0, 0.2, 0], [-9.8, 0, 0]) };
        };
        let s = sub('frames');
        [-1, 1].forEach((sx) => K.box(s.t, [0.038, 0.089, 1.22], frameMat, [sx * 0.286, -0.064, 0], null, 0.003));
        [-1, 1].forEach((sz) => K.box(s.t, [0.534, 0.089, 0.038], frameMat, [0, -0.064, sz * 0.591], null, 0.003));
        s = sub('topsSolid');
        K.ext(s.t, outline, 0.019, ply, [0, 0, 0], [90, 0, 0], 0.002);
        s = sub('tops');
        K.ext(s.t, outline, 0.019, ply, [0, 0, 0], [90, 0, 0], 0.002, [hole]);
        s = sub('legs');
        [-1, 1].forEach((sx) => K.box(s.b, [0.038, 0.27, 0.089], frameMat, [sx * 0.25, 0.135, 0.52], null, 0.003));
        [-1, 1].forEach((sx) => K.cyl(s.b, [0.012, 0.012, 0.01, 12], 'steel', [sx * 0.272, 0.26, 0.52], [0, 0, 90]));
        s = sub('paint');
        K.ext(s.t, outline, 0.002, K.std(zc > 0 ? 0x2f6fde : 0x2f6fde, { roughness: 0.5 }), [0, 0.0022, 0], [90, 0, 0], 0, [hole]);
        K.ext(s.t, [[-0.305, -0.2], [0.305, -0.2], [0.305, -0.08], [-0.305, -0.08]], 0.002, K.std(0xffcc33, { roughness: 0.5 }), [0, 0.0032, 0], [90, 0, 0], 0);
        s = sub('poly');
        K.ext(s.t, outline, 0.001, K.std(0xffffff, { transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0.1 }), [0, 0.0045, 0], [90, 0, 0], 0, [hole]);
        s = sub('aoLED');
        K.tor(s.t, [0.078, 0.005, 360], glow(K, 0xbfe3ff, 1.8), [0, 0.003, 0.381], [90, 0, 0]);
        [-1, 1].forEach((sx) => K.box(s.t, [0.006, 0.008, 1.2], glow(K, 0xbfe3ff, 1.6), [sx * 0.307, -0.03, 0], null, 0));
        s = sub('aoWrap');
        K.ext(s.t, [[-0.305, -0.61], [0.305, -0.61], [0.305, -0.25], [-0.305, 0.1]], 0.002, K.std(0xe5782a, { roughness: 0.4 }), [0, 0.006, 0], [90, 0, 0], 0);
        K.ext(s.t, K.circle(0.12, -0.42, 0.09, 24), 0.002, K.std(0xffffff, { roughness: 0.4 }), [0, 0.0075, 0], [90, 0, 0], 0);
        s = sub('aoHandles');
        [-1, 1].forEach((sx) => K.tor(s.t, [0.05, 0.008, 180], 'dark', [sx * 0.31, -0.06, -0.1], [0, sx * 90, 180]));
      });
      const plyPile = K.part('ply', [1.2, 0, 0], null, '2×4 ft sheets of ½″ plywood + 2×4s');
      K.box(plyPile, [0.61, 0.013, 1.22], ply, [0, 0.0065, 0], null, 0.002);
      K.box(plyPile, [0.61, 0.013, 1.22], ply, [0, 0.0195, 0], [0, 4, 0], 0.002);
      K.rep(4, (i) => K.box(plyPile, [0.089, 0.038, 1.6], frameMat, [0.45, 0.02 + i * 0.04, 0], null, 0.003));
      const bags = K.part('bags', [0, 0, 0], null, 'Eight 16-oz bags');
      [[0.15, 4.0, 'red'], [-0.1, 3.7, 'red'], [0.4, 3.4, 'red'], [-0.3, 4.25, 'blue'], [0.0, 4.4, 'blue'], [-0.6, -3.2, 'blue'], [-0.45, -3.0, 'red'], [0.5, -3.3, 'blue']].forEach(([x, z, c], i) =>
        K.box(bags, [0.15, 0.035, 0.15], K.std(c === 'red' ? 0xc0392b : 0x1f4e9c, { roughness: 1 }), [x, z > 3.7 && z < 4.5 && Math.abs(x) < 0.3 ? 0.27 : 0.02, z], [0, i * 23, 0], 0.03)
      );
      const sc = K.part('aoScore', [-1.1, 0, 0], null, 'Scoreboard tower');
      K.box(sc, [0.09, 1.0, 0.09], cedarOf(K), [0, 0.5, 0], null, 0.004);
      [-1, 1].forEach((s) => {
        K.cyl(sc, [0.005, 0.005, 0.5, 8], 'steel', [0, 0.85 + s * 0.06, 0], [90, 0, 0]);
        K.rep(5, (i) => K.cyl(sc, [0.02, 0.02, 0.025, 16], K.std(s > 0 ? 0xc0392b : 0x1f4e9c), [0, 0.85 + s * 0.06, -0.2 + i * 0.03], [90, 0, 0]));
      });
      const caddy = K.part('aoCaddy', [1.0, 0, 3.0], null, 'Bag tote + drink caddy');
      K.box(caddy, [0.4, 0.3, 0.25], K.std(0x2e5c3a, { roughness: 1 }), [0, 0.15, 0], null, 0.03);
      K.tor(caddy, [0.12, 0.012, 180], 'dark', [0, 0.3, 0], [0, 0, 0]);
      AO.speaker(K, 'aoSpeaker', [-1.2, 0, 2.2]);
    }
  );

  /* ===================== Guides ===================== */
  const tools = (...a) => a;
  TB.more('backyard', [
    {
      id: 'pergola',
      title: 'Build a freestanding pergola',
      model: 'pergola',
      level: 3,
      time: '2–3 weekends',
      cost: '$1,800–4,500',
      summary: 'A 12×12 ft cedar pergola on concrete footings: four 6×6 posts, doubled 2×10 beams, 2×8 rafters and 2×2 shade slats. It turns a bare patio into an outdoor room.',
      intro: { show: ['posts', 'footings', 'beams', 'rafters', 'ties', 'braces', 'purlins'], preview: true, spin: true },
      safety: ['Call 811 before digging footings.', 'Check setbacks and permit rules; many towns require a permit for structures over 120–200 sq ft.', 'Beams and rafters are heavy and you’ll be on ladders. Work with at least one helper.', 'Wear eye protection when cutting and drilling overhead.'],
      causes: [['Size it for furniture', '12×12 fits a sectional or a 6-seat table with walk-around room.'], ['Orient for shade', 'Rafters running east–west and slats north–south cast the most midday shade.'], ['Plan footings', 'Footing depth must reach below your frost line.']],
      tools: tools('Post-hole digger or auger', 'Concrete + 12″ form tubes', 'Post bases (galvanized)', '4 ft level & post level', 'Circular saw & speed square', 'Drill/driver + ½″ bit', 'Carriage bolts, structural screws, hurricane ties', 'Ladders (two)', 'Cedar: 6×6 posts, 2×10, 2×8, 2×2'),
      steps: [
        { t: 'Lay out and square', d: 'Stake the four post centers 11 ft apart and check that both diagonals match.', why: 'Equal diagonals mean a square frame, so beams and rafters land evenly on every post.', v: { cam: [5.6, 3.8, 6.0], at: [0, 0, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [1.9, 0.35, 1.9], rot: [0, 45, 0], scale: 1.4 } } },
        { t: 'Dig the footings', d: 'Dig 12″ holes below your frost line (often 30–48″). Set form tubes flush with the patio.', why: 'Footings below the frost line can’t heave when the ground freezes, so the frame stays square.', v: { cam: [4.4, 3.0, 4.6], at: [1.68, 0, 1.68], hi: ['holes'], show: ['holes'], hide: ['layout'], tool: { id: 'shovel', at: [1.95, 0.04, 1.5], rot: [10, 40, -15], anim: 'push' } } },
        { t: 'Pour and set post bases', d: 'Fill with concrete, then set galvanized post bases in the wet concrete on a string line. Cure 2–3 days.', why: 'Post bases keep end grain off the concrete so the posts don’t wick water and rot.', v: { cam: [3.6, 2.2, 3.8], at: [1.68, 0.05, 1.68], hi: ['footings'], show: ['footings'], hide: ['holes'], tool: { id: 'trowel', at: [1.9, 0.12, 1.9], rot: [0, 30, 60] } } },
        { t: 'Stand and brace the posts', d: 'Bolt each 6×6 into its base. Plumb two faces with a post level and hold it with two temporary braces.', why: 'A post a ¼″ out of plumb at the base is over an inch out at the beam.', v: { cam: [5.6, 3.4, 6.0], at: [0, 1.2, 0], hi: ['posts', 'braceTemp'], show: ['posts', 'braceTemp'], tool: { id: 'level', at: [1.75, 1.2, 1.6], rot: [0, 0, 90], scale: 1.4 } } },
        { t: 'Mount the beams', d: 'Snap a level line on all posts, clamp a 2×10 to each side of a post pair, then through-bolt with two ½″ carriage bolts per post.', why: 'Sandwiching the posts lets the bolts carry the load in shear, which is far stronger than nails or screws alone.', v: { cam: [5.2, 3.2, 1.2], at: [0, 2.4, 1.68], hi: ['beams'], show: ['beams'], tool: { id: 'drill', at: [1.68, 2.56, 1.85], rot: [90, 0, 0], anim: 'spin', scale: 1.3 } } },
        { t: 'Set the rafters', d: 'Cut decorative ends on the 2×8s, then set them on the beams 16″ on center. Fasten each with a hurricane tie.', why: 'Hurricane ties keep wind from lifting the roof frame off the beams.', v: { cam: [4.8, 4.4, 4.8], at: [0, 2.7, 0], hi: ['rafters', 'ties'], show: ['rafters', 'ties'], tool: { id: 'drill', at: [0.4, 2.8, 1.8], rot: [90, 0, 0], anim: 'spin', scale: 1.3 } } },
        { t: 'Add knee braces', d: 'Cut 4×4 braces with 45° ends and screw them between each post and beam. Then remove the temporary braces.', why: 'Knee braces make triangles that stop the whole frame from racking side to side.', v: { cam: [4.4, 2.4, 3.2], at: [1.4, 2.2, 1.68], hi: ['braces'], show: ['braces'], hide: ['braceTemp'], tool: { id: 'handsaw', at: [2.4, 0.8, 2.4], rot: [0, 45, 0], anim: 'slide', scale: 1.2 } } },
        { t: 'Lay the purlins', d: 'Screw 2×2 slats across the rafters about 10″ apart.', why: 'Purlins add shade and stiffen the rafters. Closer spacing means more shade.', v: { cam: [4.6, 4.8, 4.2], at: [0, 2.8, 0], hi: ['purlins'], show: ['purlins'] } },
        { t: 'Seal or stain', d: 'Let cedar dry a few weeks, then apply a penetrating oil stain to all surfaces, especially cut ends.', why: 'UV turns cedar silver-grey. Stain slows that and seals the end grain against water.', v: { cam: [6.0, 4.0, 6.4], at: [0, 1.3, 0], hi: ['posts', 'beams', 'rafters'], tool: { id: 'roller', at: [1.6, 1.2, 1.85], rot: [0, 0, 0], scale: 1.2 } } },
      ],
      learn: {
        how: 'A pergola is a simple post-and-beam frame. The rafters and slats carry almost no snow load, so the important parts are the connections: posts anchored to footings, beams bolted through posts, and rafters tied to beams. Knee braces form triangles, the only shape that can’t fold, which keeps the open frame from racking in wind.',
        specs: [['Post size', '6×6 for 12 ft spans'], ['Beam', 'Doubled 2×10'], ['Rafter spacing', '16–24″ o.c.'], ['Typical height', '8–9 ft to beam'], ['Footing', '12″ dia, below frost line']],
        terms: [['Purlin', 'Small members across the rafters for shade.'], ['Knee brace', 'Diagonal between post and beam.'], ['Hurricane tie', 'Metal connector that holds rafters to beams.'], ['Carriage bolt', 'Round-head bolt for wood-to-wood connections.']],
        mistakes: ['Skipping footings and setting posts on pavers.', 'Nailing beams instead of bolting them.', 'Not sealing cut ends.'],
        tips: ['Pre-stain all lumber before assembly; it’s faster on the ground than on a ladder.', 'Order 10% extra cedar for culls and cutting mistakes.'],
      },
      pro: 'You want it attached to the house, spans over 14 ft, a solid roof, or your area has high wind or snow-load requirements.',
      addons: [
        { id: 'string', part: 'aoString', name: 'Zig-zag café lights', cat: 'Lighting', blurb: 'Warm LED strands criss-crossing under the rafters.', cost: [80, 220], how: 'Screw cup hooks into the inside faces of the beams every 18″ and zig-zag the strands between them.', needs: ['Commercial LED string lights', 'Cup hooks', 'Outdoor smart plug'], shop: 'Outdoor LED string lights' },
        { id: 'fan', part: 'aoFan', name: 'Wet-rated ceiling fan', cat: 'Comfort', blurb: 'Moves air on still summer nights.', cost: [180, 450], how: 'Add a 2×8 block between two rafters at the center, mount a fan-rated box, and run outdoor-rated cable in conduit down a post to a GFCI circuit. Have an electrician make the connection if you’re not sure.', needs: ['Wet-rated fan', 'Fan-rated box', 'UF cable or conduit', 'GFCI protection'], shop: 'Wet rated outdoor ceiling fan' },
        { id: 'curtains', part: 'aoCurtains', name: 'Outdoor curtains', cat: 'Comfort', blurb: 'Soft privacy and afternoon shade on two sides.', cost: [120, 350], how: 'Mount curtain rods under the beams with outdoor brackets. Use solution-dyed acrylic panels with grommets.', needs: ['Outdoor curtain panels', 'Black steel rods + brackets'], shop: 'Outdoor curtain panels' },
        { id: 'canopy', part: 'aoCanopy', name: 'Slide-wire canopy', cat: 'Comfort', blurb: 'Retractable fabric shade over the slats.', cost: [200, 600], how: 'Run stainless cables across the top on eye bolts and clip the canopy rings onto them. It slides open and closed by hand.', needs: ['Slide-wire canopy kit', 'Stainless cable + turnbuckles'], shop: 'Pergola slide wire canopy' },
        { id: 'vines', part: 'aoVines', name: 'Climbing vines', cat: 'Garden', blurb: 'Planters at two posts with wisteria, clematis or jasmine.', cost: [80, 250], how: 'Set planters at the sunniest posts and run galvanized wire or a trellis panel up the post to guide the vines.', needs: ['2 large planters', 'Climbing plants', 'Vine wire + eye screws'], shop: 'Climbing plant trellis wire kit' },
        { id: 'lounge', part: 'aoLounge', name: 'Sectional + coffee table', cat: 'Comfort', blurb: 'Deep seating sized to the 12×12 footprint.', cost: [900, 3000], how: 'Leave 3 ft walkways on two sides. Look for quick-dry foam and solution-dyed fabric.', needs: ['Outdoor sectional', 'Coffee table'], shop: 'Outdoor sectional' },
        { id: 'speaker', part: 'aoSpeaker', name: 'Beam-mounted speakers', cat: 'Tech', blurb: 'A pair of weatherproof speakers aimed at the seating.', cost: [150, 500], how: 'Bracket them under the beams and run speaker wire inside a post groove to a weatherproof amp or Wi-Fi streamer.', needs: ['Outdoor speakers (pair)', 'Speaker wire (direct burial)', 'Streaming amp'], shop: 'Outdoor patio speakers' },
      ],
    },
    {
      id: 'grill-island',
      title: 'Build an outdoor grill island',
      model: 'grillIsland',
      level: 4,
      time: '3–4 weekends',
      cost: '$2,500–7,000',
      summary: 'An 8 ft block-and-stone island with a granite top, a drop-in gas grill and stainless storage. The block shell makes it permanent and fireproof.',
      intro: { show: ['block', 'backer', 'veneer', 'counter', 'grill', 'doors', 'utilities'], preview: true, spin: true },
      safety: ['Gas and electrical lines must be run and inspected by licensed pros in most areas.', 'Use the grill maker’s insulated jacket if the island has any combustible material.', 'Cutting block and stone throws silica dust. Wear a respirator and use a wet saw.', 'Island needs a level, solid base: an existing patio or a 4″ slab.'],
      causes: [['Pick the grill first', 'Cutout sizes come from the grill’s spec sheet.'], ['Plan utilities', 'Gas line, GFCI outlet and (optional) water line before building.'], ['Leave landing space', 'At least 12″ of counter on one side of the grill, 18″ preferred.']],
      tools: tools('Concrete block (8×8×16) + construction adhesive', 'Rebar + mortar (for cores)', 'Cement board + screws', 'Stone veneer + mortar', 'Granite slab (fabricated)', 'Drop-in grill + access doors', 'Level, square, chalk line', 'Masonry saw (rent)', 'Trowels & grout bag'),
      steps: [
        { t: 'Lay out on the slab', d: 'Snap chalk lines for an 8×2½ ft footprint at least 10 ft from the house.', why: 'Clearance to the house keeps heat and grease smoke away from siding and windows.', v: { cam: [2.8, 2.6, 3.0], at: [0, 0.1, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [1.25, 0.05, 0.4], rot: [0, 0, 0], scale: 1.4 } } },
        { t: 'Run the utilities', d: 'Have the gas line stubbed up with a shutoff and a GFCI outlet circuit run before the block goes up.', why: 'It’s much easier to build around stubbed utilities than to break into a finished island.', v: { cam: [-2.6, 1.6, 1.6], at: [-1.2, 0.3, 0], hi: ['utilities'], show: ['utilities'] } },
        { t: 'Stack the block shell', d: 'Dry-lay the first course, then glue or mortar four courses, leaving door and drawer openings. Fill the corner cores with rebar and mortar.', why: 'Block is fireproof and won’t rot. Grouted corners lock the shell together.', v: { cam: [3.0, 2.0, 3.2], at: [0, 0.4, 0], hi: ['block'], show: ['block'], hide: ['layout'], tool: { id: 'level', at: [0, 0.86, 0.3], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Skin with cement board', d: 'Screw cement board to the block and apply a scratch coat of mortar.', why: 'Gives the stone a flat, uniform surface with good grip.', v: { cam: [3.0, 2.0, 3.2], at: [0, 0.4, 0], hi: ['backer'], show: ['backer'], tool: { id: 'trowel', at: [0.9, 0.5, 0.45], rot: [0, 0, 70] } } },
        { t: 'Set the stone veneer', d: 'Butter each stone and press it on, staggering joints. Start at the corners with L-shaped corner pieces.', why: 'Corner pieces make it look like solid stone instead of a thin face.', v: { cam: [2.6, 1.4, 2.8], at: [0, 0.4, 0.35], hi: ['veneer'], show: ['veneer'], tool: { id: 'trowel', at: [-0.9, 0.6, 0.45], rot: [0, 0, 70] } } },
        { t: 'Install the countertop', d: 'Set the fabricated granite on a bed of construction adhesive, with 1¼″ overhang and the grill cutout centered.', why: 'Have the fabricator template from the finished shell so the cutout fits the grill exactly.', v: { cam: [2.8, 2.4, 3.0], at: [0, 0.9, 0], hi: ['counter'], show: ['counter'] } },
        { t: 'Drop in the grill and doors', d: 'Lower the grill into the cutout, connect gas with the supplied flex line and leak-test with soapy water. Fit doors and drawers.', why: 'Soapy water bubbles at any leak. Never test with a flame.', v: { cam: [2.6, 2.0, 2.6], at: [0, 0.8, 0.2], hi: ['grill', 'doors'], show: ['grill', 'doors'], tool: { id: 'adjWrench', at: [-1.25, 0.34, -0.25], anim: 'turn' } } },
        { t: 'Seal and first cook', d: 'Seal the granite and stone with a penetrating sealer, then burn the grill in on high for 20 minutes.', why: 'Sealer keeps grease from staining porous stone.', v: { cam: [3.2, 2.2, 3.4], at: [0, 0.6, 0], hi: ['counter', 'veneer'] } },
      ],
      learn: {
        how: 'Outdoor kitchens fail in two ways: water and heat. A block shell on a solid base doesn’t rot, settle or burn, and stone veneer adds a durable, weather-proof skin. Grills need ventilation below and an insulated jacket if anything combustible is nearby. Vents in the island let leaking gas escape instead of pooling.',
        specs: [['Counter height', '36″'], ['Bar height', '42″'], ['Landing space', '12–18″ beside the grill'], ['Island vents', 'Two, on opposite sides (propane: low)'], ['Clearance to house', '≥ 10 ft (check local code)']],
        terms: [['CMU', 'Concrete masonry unit, a.k.a. cinder block.'], ['Insulated jacket', 'Steel liner that lets a grill sit near combustibles.'], ['Scratch coat', 'Mortar base layer that the stone grips.']],
        mistakes: ['Building before buying the grill.', 'No vents in a propane island.', 'Wood framing with no insulated jacket.'],
        tips: ['Put the island where the cook faces guests, not the house wall.', 'Add a second outlet for blenders and lights.'],
      },
      pro: 'Gas lines, electrical circuits and water/drain lines. Also any island on a deck.',
      addons: [
        { id: 'fridge', part: 'aoFridge', name: 'Outdoor fridge', cat: 'Comfort', blurb: 'UL-rated under-counter fridge in the right bay.', cost: [700, 2200], how: 'Size the right opening to the fridge’s cutout spec and give it a dedicated GFCI outlet. Front-venting models can sit flush.', needs: ['Outdoor-rated fridge', 'Dedicated GFCI outlet'], shop: 'Outdoor rated refrigerator' },
        { id: 'led', part: 'aoLED', name: 'Under-counter LEDs', cat: 'Lighting', blurb: 'Warm strip under the counter lip that washes the stone.', cost: [60, 150], how: 'Rout a shallow channel under the granite overhang and glue in an IP67 LED strip. Run it from a low-voltage driver inside the island.', needs: ['IP67 LED strip (2700 K)', 'Low-voltage driver', 'Aluminum channel'], shop: 'IP67 LED strip warm white' },
        { id: 'stools', part: 'aoStools', name: 'Counter stools', cat: 'Comfort', blurb: 'Three stools on the guest side.', cost: [250, 750], how: 'Allow 24″ of counter per stool and a 12″ overhang for knees, with corbels under it.', needs: ['Counter-height stools (24″ seat)'], shop: 'Outdoor counter height stools' },
        { id: 'pizza', part: 'aoPizza', name: 'Pizza oven', cat: 'Comfort', blurb: 'Countertop gas or wood pizza oven.', cost: [300, 900], how: 'Set it on the left landing space on its own heat-proof feet. Gas models can share the line with a tee and shutoff.', needs: ['Countertop pizza oven', 'Peel + infrared thermometer'], shop: 'Countertop pizza oven' },
        { id: 'sink', part: 'aoSink', name: 'Bar sink', cat: 'Finish', blurb: 'Stainless prep sink with a faucet.', cost: [250, 900], how: 'Needs a water supply and a drain (dry well or tie-in). Have the counter fabricator cut for it, and a plumber run the lines.', needs: ['Bar sink + faucet', 'Water line', 'Drain or dry well'], shop: 'Outdoor bar sink' },
        { ...TB.repair('backyard', 'fire-pit').addons.find((a) => a.id === 'string') },
        { id: 'speaker', part: 'aoSpeaker', name: 'Rock speaker', cat: 'Tech', blurb: 'Weatherproof speaker near the cook.', cost: [80, 250], how: 'Keep it a few feet away from the grill’s heat.', needs: ['Outdoor speaker'], shop: 'Outdoor rock speaker' },
      ],
    },
    {
      id: 'deck-platform',
      title: 'Build a ground-level deck',
      model: 'deckPlatform',
      level: 3,
      time: '2 weekends',
      cost: '$1,500–4,000',
      summary: 'A 12×12 ft floating deck on precast deck blocks. It isn’t attached to the house, sits under 30″ tall, and in many towns needs no permit or footings.',
      intro: { show: ['base', 'blocks', 'beams', 'joists', 'rim', 'decking', 'fascia'], preview: true, spin: true },
      safety: ['Call 811 before digging.', 'Check local rules: many places skip permits for detached decks under 30″ high and 200 sq ft.', 'Wear eye protection and use a dust mask when cutting treated lumber.'],
      causes: [['Choose a flat spot', 'Blocks handle about 6″ of slope; more needs footings.'], ['Pick decking', 'Pressure-treated, cedar or composite (needs 12″ joist spacing on angles).'], ['Plan the layout', 'Board direction and where you’ll step on.']],
      tools: tools('Deck blocks (9)', 'Landscape fabric + gravel', 'Pressure-treated 2×8 & 2×6', 'Joist hangers + nails', 'Deck boards + deck screws', 'Circular saw & speed square', 'Drill/driver', '4 ft level, string line', '⅛″ spacers'),
      steps: [
        { t: 'Lay out and square', d: 'Stake the 12×12 outline and adjust until both diagonals match.', why: 'A square frame keeps the decking lines straight to the last board.', v: { cam: [5.2, 3.4, 5.6], at: [0, 0, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [1.9, 0.4, 1.9], rot: [0, 45, 0], scale: 1.4 } } },
        { t: 'Prep the base', d: 'Strip sod, level the area, lay landscape fabric, and spread 3″ of compacted gravel.', why: 'Gravel drains water away and stops weeds from growing up between the boards.', v: { cam: [5.2, 3.4, 5.6], at: [0, 0, 0], hi: ['base'], show: ['base'], tool: { id: 'shovel', at: [2.1, 0.06, 1.2], rot: [10, 40, -15], anim: 'push' } } },
        { t: 'Set and level the blocks', d: 'Place nine blocks in a 3×3 grid about 5 ft apart. Level them all to a string line, shimming with gravel underneath.', why: 'Every block at the same height means no shimming the beams later.', v: { cam: [4.2, 2.6, 4.4], at: [0, 0.1, 0], hi: ['blocks'], show: ['blocks'], tool: { id: 'level', at: [0, 0.2, 1.5], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Drop in the beams', d: 'Set doubled 2×8 beams into the block slots across each row.', why: 'The slots hold the beams in place with no fasteners into the concrete.', v: { cam: [4.6, 2.8, 4.8], at: [0, 0.25, 0], hi: ['beams'], show: ['beams'] } },
        { t: 'Build the joist frame', d: 'Lay 2×6 joists across the beams 16″ on center, then nail rim joists to their ends with joist hangers.', why: 'Joist spacing sets how stiff the floor feels. Composite decking on a diagonal needs 12″.', v: { cam: [4.6, 3.0, 4.8], at: [0, 0.4, 0], hi: ['joists', 'rim'], show: ['joists', 'rim'], tool: { id: 'hammer', at: [1.8, 0.5, 1.4], rot: [0, -40, 0], anim: 'tap', scale: 1.4 } } },
        { t: 'Lay the decking', d: 'Start with a straight board along one edge. Screw two screws per joist and gap boards ⅛″ with spacers.', why: 'Gaps let water drain and boards swell without buckling.', v: { cam: [4.4, 3.2, 4.8], at: [0, 0.5, 0], hi: ['decking'], show: ['decking'], tool: { id: 'drill', at: [0.4, 0.58, 1.2], rot: [0, 0, 0], anim: 'spin', scale: 1.4 } } },
        { t: 'Trim and fascia', d: 'Snap a line and trim the board ends flush, then screw fascia boards around the rim.', why: 'Cutting all the ends at once on a line gives a crisp edge.', v: { cam: [3.6, 1.4, 3.8], at: [1.4, 0.45, 1.6], hi: ['fascia'], show: ['fascia'], tool: { id: 'handsaw', at: [1.84, 0.6, 0.6], rot: [0, 0, 0], anim: 'slide', scale: 1.2 } } },
        { t: 'Finish', d: 'Wait for treated lumber to dry (water beads soak in), then apply a deck stain or sealer.', why: 'Wet pressure-treated wood rejects stain; it just peels.', v: { cam: [5.2, 3.4, 5.6], at: [0, 0.3, 0], hi: ['decking'], tool: { id: 'roller', at: [0.6, 0.6, 0.6], rot: [0, 0, 0], scale: 1.2 } } },
      ],
      learn: {
        how: 'A floating deck rests on the ground instead of hanging off the house. The blocks spread the load over the soil, beams span between blocks, and joists span between beams. Because it’s detached and low, it can move a little with frost without damaging anything.',
        specs: [['Joist spacing', '16″ o.c. (12″ for diagonal composite)'], ['2×6 joist span', '≈ 9 ft at 16″ o.c.'], ['Board gap', '⅛″'], ['Max height (no railing)', '< 30″']],
        terms: [['Deck block', 'Precast concrete pier with slots for a beam.'], ['Rim joist', 'Joist around the outside edge.'], ['Fascia', 'Finish board covering the rim.']],
        mistakes: ['Skipping the gravel and fabric.', 'Screws too close to board ends (splits).', 'Staining wet treated lumber.'],
        tips: ['Crown every joist up; they flatten under load.', 'Use hidden fasteners on composite for a clean look.'],
      },
      pro: 'The deck will be over 30″ high, attached to the house, or on a slope over 6″.',
      addons: [
        { id: 'lights', part: 'aoLights', name: 'Fascia lights', cat: 'Lighting', blurb: 'Low-voltage puck lights around the edge.', cost: [100, 250], how: 'Drill the fascia for the pucks before installing it and run the cable along the inside of the rim to a transformer.', needs: ['Low-voltage deck lights', 'Transformer', '12/2 cable'], shop: 'Low voltage deck lights' },
        { id: 'bench', part: 'aoBench', name: 'Built-in bench', cat: 'Comfort', blurb: 'An 8 ft bench along the back edge.', cost: [120, 300], how: 'Frame bench supports from 2×6 and screw them through the decking into joists. Use the same decking for the seat.', needs: ['2×6 framing', 'Matching deck boards', 'Structural screws'], shop: 'Deck bench brackets' },
        { id: 'planters', part: 'aoPlanters', name: 'Corner planters', cat: 'Garden', blurb: 'Two planter boxes to soften the corners.', cost: [80, 300], how: 'Use planters with feet or a drip tray so wet soil doesn’t sit on the decking.', needs: ['2 planter boxes', 'Potting mix'], shop: 'Cedar planter box' },
        { id: 'screen', part: 'aoScreen', name: 'Privacy screen', cat: 'Finish', blurb: 'Slat wall on the back edge.', cost: [300, 700], how: 'Bolt 4×4 posts to the rim joist with ½″ through-bolts and blocking, then screw on horizontal slats.', needs: ['4×4 posts', 'Deck boards for slats', '½″ through-bolts'], shop: 'Deck privacy screen' },
        { id: 'rug', part: 'aoRug', name: 'Outdoor rug', cat: 'Finish', blurb: 'Defines the seating zone.', cost: [60, 200], how: 'Lift it after rain so the boards underneath can dry.', needs: ['Outdoor rug'], shop: 'Outdoor rug 6x9' },
        { id: 'string', part: 'aoString', name: 'String lights', cat: 'Lighting', blurb: 'Posts at the corners with café lights.', cost: [150, 350], how: 'Through-bolt 4×4 posts to the rim joist at the corners.', needs: ['4×4 posts', 'String lights'], shop: 'Outdoor LED string lights' },
      ],
    },
    {
      id: 'privacy-screen',
      title: 'Build a horizontal slat privacy screen',
      model: 'privacyScreen',
      level: 2,
      time: '1–2 days',
      cost: '$450–1,100',
      summary: 'A 16 ft modern cedar screen with horizontal 1×6 slats and ½″ gaps. It blocks views while letting air through, and goes up in a weekend.',
      intro: { show: ['posts', 'concrete', 'slatsLow', 'slatsHigh', 'cap', 'trim'], preview: true, spin: true },
      safety: ['Call 811 before digging post holes.', 'Most towns limit fence and screen height (often 6 ft in back yards). Check before building.', 'Wear eye protection when cutting and screwing.'],
      causes: [['Mark the sight line', 'Sit where you’ll use the space and mark what you want to hide.'], ['Pick the gap', '½″ gaps hide most views; ¼″ is almost solid.'], ['Post spacing', '8 ft max for 1×6 slats to avoid sag.']],
      tools: tools('Post-hole digger', '4×4 posts (pressure-treated) + concrete', '1×6 cedar boards', '2×6 cap, 1×4 trim', 'Drill/driver + exterior screws', 'Circular saw', '4 ft level, string line', '½″ spacer block'),
      steps: [
        { t: 'Lay out the line', d: 'Run a string line and mark post centers 8 ft apart.', why: '8 ft is the longest span a 1×6 cedar slat can go without sagging over time.', v: { cam: [3.6, 2.0, 4.6], at: [0, 0.2, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [1.2, 0.3, 0.1], rot: [0, 0, 0], scale: 1.4 } } },
        { t: 'Dig the holes', d: 'Dig 10″ holes, one-third of the post height deep (30″ for 6 ft) or below frost line.', why: 'The buried part resists wind pushing on the big flat screen.', v: { cam: [3.2, 2.0, 3.4], at: [0, 0, 0], hi: ['holes'], show: ['holes'], hide: ['layout'], tool: { id: 'shovel', at: [0.3, 0.04, 0.3], rot: [10, 40, -15], anim: 'push' } } },
        { t: 'Set posts in concrete', d: 'Set each post, plumb it on two faces, brace it, and fill with concrete crowned above grade.', why: 'A crown sheds water away from the post so it doesn’t sit in a puddle.', v: { cam: [3.6, 2.0, 4.4], at: [0, 0.9, 0], hi: ['posts', 'concrete'], show: ['posts', 'concrete'], tool: { id: 'level', at: [0.06, 1.0, 0.06], rot: [0, 0, 90], scale: 1.4 } } },
        { t: 'Hang the bottom slats', d: 'Start 3″ above grade. Level the first board, screw it to each post, then use a ½″ spacer for each board above.', why: 'A dead-level first board keeps every slat straight. Spacers make the gaps identical.', v: { cam: [3.2, 1.2, 3.6], at: [0, 0.5, 0], hi: ['slatsLow'], show: ['slatsLow'], tool: { id: 'drill', at: [0, 0.6, 0.12], rot: [90, 0, 0], anim: 'spin', scale: 1.3 } } },
        { t: 'Finish the slats', d: 'Keep going to the top, checking level every few boards.', why: 'Small errors add up; check and adjust with the spacer as you go.', v: { cam: [3.6, 2.0, 4.6], at: [0, 1.2, 0], hi: ['slatsHigh'], show: ['slatsHigh'], tool: { id: 'level', at: [-1.2, 1.5, 0.1], rot: [0, 0, 0], scale: 1.4 } } },
        { t: 'Cap and trim', d: 'Trim the posts flush, screw a 2×6 cap along the top and 1×4 trim over each post.', why: 'The cap keeps rain off the post tops and the trim hides the slat ends and screws.', v: { cam: [3.2, 2.4, 3.6], at: [0, 1.6, 0], hi: ['cap', 'trim'], show: ['cap', 'trim'] } },
      ],
      learn: {
        how: 'A screen is a sail. Wind pressure on 100 sq ft of slats is substantial, so posts must be deep and set in concrete. The gaps help: they let some wind through, cutting the load compared to a solid fence.',
        specs: [['Post spacing', '≤ 8 ft'], ['Post depth', '⅓ of height, below frost line'], ['Slat gap', '¼–¾″'], ['Fasteners', 'Stainless or coated exterior screws']],
        terms: [['Cap', 'Board across the top.'], ['Trim', 'Vertical board covering the post and slat ends.'], ['Crown', 'Sloped concrete top that sheds water.']],
        mistakes: ['Posts too shallow.', 'Spans over 8 ft.', 'Using bright steel screws on cedar (black stains).'],
        tips: ['Pre-stain both sides before installing; the back is impossible to reach later.'],
      },
      pro: 'It’s on a property line with disputes, over 6 ft, or holding back soil.',
      addons: [
        { id: 'sconce', part: 'aoSconce', name: 'Wall sconces', cat: 'Lighting', blurb: 'Two cylinder lights on the outer posts.', cost: [80, 250], how: 'Low-voltage sconces are easiest: run the cable behind the trim to a transformer. 120 V needs a weatherproof box and an electrician.', needs: ['2 outdoor sconces', 'Low-voltage cable & transformer'], shop: 'Outdoor cylinder wall light' },
        { id: 'planters', part: 'aoPlanters', name: 'Base planters', cat: 'Garden', blurb: 'Three planters with grasses along the base.', cost: [120, 400], how: 'Keep planters 2″ off the slats so the bottom boards can dry.', needs: ['3 planter boxes', 'Ornamental grasses'], shop: 'Long planter box' },
        { id: 'shelf', part: 'aoShelf', name: 'Plant shelves', cat: 'Finish', blurb: 'Cedar shelves on black steel brackets.', cost: [50, 120], how: 'Screw brackets through the slats into a 2×4 cleat behind them so the weight doesn’t hang on one slat.', needs: ['Cedar 1×8', 'Steel shelf brackets', '2×4 cleats'], shop: 'Black steel shelf brackets' },
        { id: 'string', part: 'aoString', name: 'String lights', cat: 'Lighting', blurb: 'Café lights draped along the top.', cost: [40, 120], how: 'Screw cup hooks under the cap at each post.', needs: ['String lights', 'Cup hooks'], shop: 'Outdoor LED string lights' },
        { id: 'speaker', part: 'aoSpeaker', name: 'Outdoor speaker', cat: 'Tech', blurb: 'Weatherproof speaker on the center post.', cost: [80, 250], how: 'Mount it on the post trim, angled down toward the seating area.', needs: ['Outdoor speaker + bracket'], shop: 'Outdoor wall speaker' },
      ],
    },
    {
      id: 'stepping-path',
      title: 'Lay a stepping-stone path',
      model: 'steppingPath',
      level: 1,
      time: '1 day',
      cost: '$150–600',
      summary: 'Flagstone steppers set flush in the lawn on a sand bed. They protect the grass from foot traffic and let the mower run right over them.',
      intro: { show: ['stones', 'joints'], preview: true, spin: true },
      safety: ['Call 811 if digging deeper than a few inches.', 'Flagstones are heavy and sharp-edged. Wear gloves and lift with your legs.'],
      causes: [['Follow the natural route', 'Watch where people already walk; that’s your path.'], ['Spacing', '24″ center to center fits most strides.'], ['Stone size', '16–24″ across, 1½–2″ thick.']],
      tools: tools('Flagstone steppers', 'Garden hose (layout)', 'Flat spade', 'Leveling sand', '2 ft level', 'Rubber mallet', 'Wheelbarrow'),
      steps: [
        { t: 'Lay out the curve', d: 'Shape a garden hose into the path line and look at it from the house.', why: 'Gentle curves look natural and are easy to walk.', v: { cam: [4.2, 3.6, 5.0], at: [0, 0, 0], hi: ['hose'], show: ['hose'] } },
        { t: 'Place and walk the stones', d: 'Set stones along the hose at your natural stride and walk it. Adjust until it feels right.', why: 'Testing your stride before digging is the difference between a path you use and one you avoid.', v: { cam: [3.6, 2.6, 4.0], at: [0, 0, 0], hi: ['stones'], show: ['stones'], mv: { stones: [0, 0.03, 0] } } },
        { t: 'Trace each stone', d: 'Cut around each stone with a flat spade, then set the stone aside.', why: 'The cut gives an exact outline, so the stone fits snugly with no gaps.', v: { cam: [3.0, 2.2, 3.4], at: [-0.8, 0, 0.6], hi: ['outline'], show: ['outline'], hide: ['stones', 'hose'], tool: { id: 'shovel', at: [-0.9, 0.04, 0.6], rot: [0, 0, -8], anim: 'push' } } },
        { t: 'Dig to depth', d: 'Remove sod and soil to the stone thickness plus 1″.', why: 'The extra inch is for the sand bed that makes leveling easy.', v: { cam: [3.0, 2.2, 3.4], at: [-0.8, 0, 0.6], hi: ['holes'], show: ['holes'], hide: ['outline'] } },
        { t: 'Add sand', d: 'Spread 1″ of sand in each hole and smooth it.', why: 'Sand lets you nudge each stone level and drains water from underneath.', v: { cam: [3.0, 2.2, 3.4], at: [-0.8, 0, 0.6], hi: ['sand'], show: ['sand'] } },
        { t: 'Set and level', d: 'Set each stone, tap it down with a rubber mallet until it sits flush with the soil, and check with a level.', why: 'Flush stones let the mower pass over and don’t trip anyone.', v: { cam: [3.0, 2.0, 3.4], at: [-0.8, 0, 0.6], hi: ['stones'], show: ['stones'], mv: { stones: [0, 0, 0] }, tool: { id: 'hammer', at: [-0.8, 0.08, 0.7], rot: [0, -40, 0], anim: 'tap', scale: 1.5 } } },
        { t: 'Backfill and water', d: 'Sweep soil into any gaps around each stone, press it in and water well.', why: 'Watering settles the soil around the stones so they lock in place.', v: { cam: [4.2, 3.6, 5.0], at: [0, 0, 0], hi: ['joints'], show: ['joints'], tool: { id: 'wateringCan', at: [0.6, 0.1, -0.5], rot: [0, 40, 0] } } },
      ],
      learn: {
        how: 'A stepping-stone path works because each stone spreads your weight over the soil and the sand bed below drains water away. Setting them flush means grass grows up to the edge and the mower glides over.',
        specs: [['Stone spacing', '≈ 24″ center to center'], ['Sand bed', '1″'], ['Stone thickness', '1½–2″'], ['Gap between stones', '3–6″']],
        terms: [['Flagstone', 'Flat natural stone split into slabs.'], ['Stepper', 'Single stone in a path.']],
        mistakes: ['Spacing to your measuring tape instead of your stride.', 'Stones sitting proud of the grass.', 'Skipping the sand.'],
        tips: ['Pick stones with a flat bottom; they rock less and level faster.'],
      },
      pro: 'You’re building steps on a slope or a path that must be wheelchair-accessible.',
      addons: [
        { id: 'lights', part: 'aoLights', name: 'Solar path lights', cat: 'Lighting', blurb: 'Stake lights alternating along the path.', cost: [40, 140], how: 'Place them 12″ off the path edge, alternating sides, 6–8 ft apart.', needs: ['Solar stake lights'], shop: 'Solar path lights' },
        { id: 'arbor', part: 'aoArbor', name: 'Garden arbor', cat: 'Finish', blurb: 'Cedar arch marking the entrance.', cost: [150, 500], how: 'Set the four legs in 18″ holes with gravel and tamp them firm, or anchor them to buried stakes.', needs: ['Cedar arbor kit', 'Ground anchors'], shop: 'Cedar garden arbor' },
        { id: 'thyme', part: 'aoThyme', name: 'Creeping thyme', cat: 'Garden', blurb: 'Fragrant ground cover between the stones.', cost: [30, 90], how: 'Plant plugs 6–12″ apart in the gaps. It handles foot traffic and smells great when stepped on.', needs: ['Creeping thyme plugs'], shop: 'Creeping thyme plugs' },
        { id: 'bench', part: 'aoBench', name: 'Garden bench', cat: 'Comfort', blurb: 'A destination at the end of the path.', cost: [150, 450], how: 'Set it on two leveled steppers so the legs stay dry.', needs: ['Garden bench'], shop: 'Garden bench' },
        { id: 'birdbath', part: 'aoBirdbath', name: 'Birdbath', cat: 'Garden', blurb: 'Stone birdbath beside the path.', cost: [60, 250], how: 'Place it in partial shade near shrubs for cover, and change the water every couple of days.', needs: ['Birdbath'], shop: 'Stone birdbath' },
      ],
    },
    {
      id: 'planter-box',
      title: 'Build a standing cedar planter',
      model: 'planterBox',
      level: 1,
      time: '4–6 hrs',
      cost: '$90–180',
      summary: 'A waist-high 4×2 ft cedar planter with a storage shelf. No bending to garden, and it fits on a patio, deck or balcony.',
      intro: { show: ['legs', 'aprons', 'sides', 'bottom', 'shelf', 'liner', 'soil', 'plants'], preview: true, spin: true },
      safety: ['Wear eye protection when cutting.', 'Filled planters are heavy (150+ lb); check deck or balcony load limits.'],
      causes: [['Pick a sunny spot', 'Vegetables need 6–8 hours of sun.'], ['Choose cedar', 'Naturally rot-resistant and safe for edibles.'], ['Plan depth', '8–10″ of soil is plenty for herbs and greens.']],
      tools: tools('Cedar 4×4 (2), 1×6 (4), 1×4 (4)', 'Exterior screws 1¼″ and 2½″', 'Drill/driver', 'Circular or miter saw', 'Staple gun + landscape fabric', 'Square & tape'),
      steps: [
        { t: 'Cut everything', d: 'Cut four 30″ legs, four 48″ long sides, four 22″ short sides, bottom slats and shelf boards.', why: 'Cutting all parts first makes assembly fast and keeps matching pieces identical.', v: { cam: [1.9, 1.3, 2.4], at: [0.4, 0.1, 0.8], hi: ['lumber'], show: ['lumber'], tool: { id: 'handsaw', at: [0.4, 0.15, 1.0], rot: [0, 90, 0], anim: 'slide', scale: 1.2 } } },
        { t: 'Build the end frames', d: 'Screw two short boards across each pair of legs, flush with the top.', why: 'Square end frames make the long sides drop right into place.', v: { cam: [1.9, 1.5, 2.2], at: [0, 0.5, 0], hi: ['legs', 'aprons'], show: ['legs', 'aprons'], hide: ['lumber'], tool: { id: 'drill', at: [0.62, 0.72, 0.1], rot: [0, 0, 90], anim: 'spin', scale: 1.2 } } },
        { t: 'Add the long sides', d: 'Connect the end frames with the long boards, two rows per side.', why: 'Check diagonals across the top; equal means square.', v: { cam: [1.9, 1.5, 2.2], at: [0, 0.6, 0], hi: ['sides'], show: ['sides'], tool: { id: 'drill', at: [0.3, 0.72, 0.3], rot: [90, 0, 0], anim: 'spin', scale: 1.2 } } },
        { t: 'Cleats and bottom slats', d: 'Screw 2×2 cleats inside the long sides, then lay slats across them with ¼″ gaps.', why: 'Gaps let water drain. Soggy roots rot.', v: { cam: [1.4, 1.8, 1.4], at: [0, 0.5, 0], hi: ['bottom'], show: ['bottom'], xray: true } },
        { t: 'Lower shelf', d: 'Add shelf boards between the legs about 7″ off the ground.', why: 'The shelf also braces the legs against racking.', v: { cam: [1.9, 0.9, 2.0], at: [0, 0.2, 0], hi: ['shelf'], show: ['shelf'] } },
        { t: 'Line it', d: 'Staple landscape fabric inside the box, over the slats and up the sides.', why: 'Fabric holds soil in while still letting water out, and protects the wood.', v: { cam: [1.4, 1.9, 1.4], at: [0, 0.6, 0], hi: ['liner'], show: ['liner'] } },
        { t: 'Fill and plant', d: 'Fill with a quality potting mix (not garden soil) and plant.', why: 'Potting mix stays light and drains well in containers; garden soil compacts.', v: { cam: [1.9, 1.5, 2.2], at: [0, 0.7, 0], hi: ['soil', 'plants'], show: ['soil', 'plants'], tool: { id: 'trowel', at: [0.3, 0.85, 0.15], rot: [0, 0, 60] } } },
      ],
      learn: {
        how: 'Raised containers warm faster in spring and drain better than in-ground beds. Waist height takes the bending out of gardening. Because they’re small, they dry out faster, so consistent watering matters more.',
        specs: [['Working height', '30–34″'], ['Soil depth', '8–10″'], ['Slat gap', '¼″'], ['Fill weight', '≈ 40 lb/cu ft wet']],
        terms: [['Cleat', 'Strip that supports the bottom slats.'], ['Potting mix', 'Soilless mix of peat or coir, bark and perlite.']],
        mistakes: ['No drainage gaps.', 'Using garden soil.', 'Treated lumber with an unknown preservative for edibles.'],
        tips: ['Put it on casters before filling if you’ll want to move it.'],
      },
      pro: 'You’re putting a large planter on an upper-floor balcony; check the structure first.',
      addons: [
        { id: 'casters', part: 'aoCasters', name: 'Locking casters', cat: 'Finish', blurb: 'Roll it into the sun or out of the way.', cost: [25, 60], how: 'Screw 3″ locking casters rated for 150+ lb each to the bottom of the legs before filling.', needs: ['4 locking casters (150 lb+)'], shop: 'Heavy duty locking casters' },
        { id: 'trellis', part: 'aoTrellis', name: 'Back trellis', cat: 'Garden', blurb: 'Cedar lattice for peas, beans and cucumbers.', cost: [20, 50], how: 'Screw the uprights to the inside of the back legs.', needs: ['Cedar 1×2 and 2×2'], shop: 'Cedar lattice' },
        { id: 'drip', part: 'aoDrip', name: 'Drip + Wi-Fi timer', cat: 'Tech', blurb: 'Waters on schedule while you’re away.', cost: [40, 110], how: 'Run ¼″ drip line along the soil and connect to a faucet timer with a pressure regulator.', needs: ['Wi-Fi faucet timer', 'Drip kit'], shop: 'Wifi hose faucet timer' },
        { id: 'sensor', part: 'aoSensor', name: 'Moisture sensor', cat: 'Tech', blurb: 'Pairs with the timer to skip rainy days.', cost: [25, 60], how: 'Push it to root depth between plants.', needs: ['Soil moisture sensor'], shop: 'Wireless soil moisture sensor' },
        { id: 'lights', part: 'aoLights', name: 'LED lip light', cat: 'Lighting', blurb: 'Soft glow under the front edge.', cost: [25, 60], how: 'Stick a solar or plug-in IP65 LED strip under the top edge.', needs: ['IP65 LED strip'], shop: 'Solar LED strip outdoor' },
      ],
    },
  ]);

  // Cornhole lives in Recreation as a build.
  const cornholeGuide = {
    id: 'cornhole',
    title: 'Build regulation cornhole boards',
    model: 'cornhole',
    level: 2,
    time: '1 weekend',
    cost: '$80–200',
    summary: 'A pair of 2×4 ft boards with 6″ holes, built to American Cornhole Association specs from plywood and 2×4s. Paint them your colors.',
    intro: { show: ['frames', 'tops', 'legs', 'paint', 'poly', 'bags'], preview: true, spin: true },
    safety: ['Wear eye and hearing protection when cutting.', 'Use a dust mask while sanding and when spraying finish.'],
    causes: [['Use ½″ cabinet-grade plywood', 'Smooth faces give a consistent slide.'], ['Regulation sizes', '24×48″ tops, 6″ hole centered 9″ from the top edge.'], ['Plan colors', 'Paint both boards to match, with team colors on the bags.']],
    tools: tools('½″ plywood (2 pieces, 24×48″)', '2×4s (4 × 8 ft)', 'Wood glue + 1¼″ and 2½″ screws', 'Jigsaw', 'Drill + spade bit', 'Circular saw', '3/8″ carriage bolts, washers, nuts', 'Sander (120/220 grit)', 'Primer, paint, water-based polyurethane'),
    steps: [
      { t: 'Cut the parts', d: 'Cut two 24×48″ tops, 2×4 frame sides (48″) and ends (21″), and four legs.', why: 'Matching parts make two boards that play identically.', v: { cam: [3.0, 2.0, 1.4], at: [1.2, 0.1, 0], hi: ['ply'], show: ['ply'], tool: { id: 'handsaw', at: [1.2, 0.1, 0.3], rot: [0, 0, 0], anim: 'slide', scale: 1.2 } } },
      { t: 'Build the frames', d: 'Glue and screw the 2×4s into 24×48″ rectangles. Check that the diagonals match.', why: 'A square frame keeps the top flat and the hole aligned.', v: { cam: [2.6, 1.6, 5.4], at: [0, 0.15, 4.1], hi: ['frames'], show: ['frames'], hide: ['ply'], tool: { id: 'drill', at: [0.3, 0.25, 4.6], rot: [0, 0, 90], anim: 'spin', scale: 1.2 } } },
      { t: 'Attach the tops', d: 'Glue the frame tops and screw the plywood down every 6″. Countersink the screws.', why: 'Glue stops the top from drumming when bags land.', v: { cam: [2.6, 1.6, 5.4], at: [0, 0.2, 4.1], hi: ['topsSolid'], show: ['topsSolid'], tool: { id: 'drill', at: [0.2, 0.32, 4.4], rot: [0, 0, 0], anim: 'spin', scale: 1.2 } } },
      { t: 'Cut the hole', d: 'Mark the hole center 9″ from the top and 12″ from each side. Drill a starter hole, cut the 6″ circle with a jigsaw, and sand the edge smooth.', why: 'Regulation placement makes your boards play like any tournament set.', v: { cam: [1.6, 1.4, 5.6], at: [0, 0.25, 4.5], hi: ['tops'], show: ['tops'], hide: ['topsSolid'], tool: { id: 'drill', at: [0, 0.3, 4.48], rot: [0, 0, 0], anim: 'spin', scale: 1.2 } } },
      { t: 'Add folding legs', d: 'Bolt legs inside the back of each frame with ⅜″ carriage bolts. Cut the leg bottoms so the back of the board stands 12″ high.', why: 'Regulation: 12″ at the back, 2½–4″ at the front. That’s the slide angle players expect.', v: { cam: [2.0, 0.8, 5.6], at: [0, 0.15, 4.6], hi: ['legs'], show: ['legs'], tool: { id: 'adjWrench', at: [0.3, 0.26, 4.62], rot: [0, 0, 90], anim: 'turn' } } },
      { t: 'Sand, prime and paint', d: 'Sand to 220, prime, then paint. Mask stripes or a logo with painter’s tape.', why: 'Primer seals the plywood so paint dries smooth instead of soaking in.', v: { cam: [2.6, 1.6, 5.4], at: [0, 0.2, 4.1], hi: ['paint'], show: ['paint'], tool: { id: 'roller', at: [0.3, 0.35, 3.9], rot: [0, 0, 0], scale: 1.1 } } },
      { t: 'Seal and play', d: 'Apply 3 coats of water-based polyurethane, sanding lightly between coats. Set boards 27 ft apart, front edge to front edge.', why: 'Poly gives the slick, even slide; water-based won’t yellow over your colors.', v: { cam: [11, 6, 0.5], at: [0, 0.2, 0], hi: ['poly', 'bags'], show: ['poly', 'bags'] } },
    ],
    learn: {
      how: 'Cornhole boards are a ramp with a target. Board slope, surface slickness and bag fill all change how a bag slides. Regulation specs exist so every set plays the same: if your board is too slick or too steep, bags slide off; too rough, and they stop dead.',
      specs: [['Board', '24 × 48″'], ['Hole', '6″, centered 9″ from top'], ['Back height', '12″'], ['Front height', '2½–4″'], ['Distance', '27 ft front to front'], ['Bag', '6×6″, 15.5–16 oz']],
      terms: [['Cornhole', '3 points: bag through the hole.'], ['Woody', '1 point: bag on the board.'], ['Foul line', 'Front edge of the board.']],
      mistakes: ['Using construction plywood (rough, warps).', 'Oil-based poly over light colors (yellows).', 'Legs that wobble; add a cross brace.'],
      tips: ['Glue-and-screw a center brace under each top to stop bounce.', 'Store boards flat and dry to prevent warping.'],
    },
    pro: 'Not needed. This is a great first woodworking project.',
    addons: [
      { id: 'led', part: 'aoLED', name: 'LED hole + edge lights', cat: 'Lighting', blurb: 'Glowing hole rings and edges for night games.', cost: [30, 80], how: 'Stick the LED ring inside the hole and run strips under the frame lip to a battery pack under the board.', needs: ['Cornhole LED kit (ring + strips)'], shop: 'Cornhole LED light kit' },
      { id: 'wrap', part: 'aoWrap', name: 'Custom vinyl wrap', cat: 'Finish', blurb: 'Team colors or your logo printed on vinyl.', cost: [60, 160], how: 'Apply the wrap after priming and before poly, squeegee from the center out and trim the hole with a sharp knife.', needs: ['Printed vinyl wraps (pair)', 'Squeegee', 'Utility knife'], shop: 'Cornhole board wraps' },
      { id: 'score', part: 'aoScore', name: 'Scoreboard tower', cat: 'Finish', blurb: 'Slide-bead scorekeeper on a post.', cost: [30, 70], how: 'Set it beside one board, out of the throwing lane.', needs: ['Cornhole scoreboard'], shop: 'Cornhole scoreboard' },
      { id: 'caddy', part: 'aoCaddy', name: 'Bag tote + caddy', cat: 'Comfort', blurb: 'Holds bags and drinks between rounds.', cost: [20, 50], how: 'Keep bags dry; damp bags get heavy and play slow.', needs: ['Bag tote / drink caddy'], shop: 'Cornhole bag caddy' },
      { id: 'handles', part: 'aoHandles', name: 'Carry handles', cat: 'Finish', blurb: 'Recessed handles in the frame sides.', cost: [10, 25], how: 'Screw flush handles to the frame sides before painting.', needs: ['2 recessed handles'], shop: 'Recessed carry handle' },
      { id: 'speaker', part: 'aoSpeaker', name: 'Rock speaker', cat: 'Tech', blurb: 'Music for the tailgate.', cost: [80, 250], how: 'Set it beside the scoreboard.', needs: ['Outdoor speaker'], shop: 'Outdoor rock speaker' },
    ],
  };
  TB.more('backyard', [cornholeGuide]);
})();
