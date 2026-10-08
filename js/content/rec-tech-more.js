/* rec-tech-more · Recreation & Tech: hoop, grill and laptop variants; new camping, basketball,
   grill and tech guides. Every scene here is built in real meters (unit: 1). */
(function () {
  const V = (base, o) => Object.assign({}, base, o);
  const DRIVE = { env: 'garden', unit: 1, tex: ['asphalt_02'], ground: { tex: 'asphalt_02', repeat: 8, radius: 9 } };
  const PATIO = { env: 'garden', unit: 1, tex: ['interlocking_concrete_pavers'], ground: { tex: 'interlocking_concrete_pavers', repeat: 6, radius: 6 } };
  const WOODS = { env: 'garden', unit: 1, tex: ['forrest_ground_01', 'wood_planks'], ground: { tex: 'forrest_ground_01', repeat: 8, radius: 10 } };
  const DESK = { env: 'studio', unit: 1, tex: ['plank_flooring', 'oak_wood_planks'], ground: { tex: 'plank_flooring', repeat: 4, radius: 4 } };
  const glow = (K, c, i) => K.std(c || 0xfff1cc, { emissive: c || 0xffc870, emissiveIntensity: i == null ? 1 : i });
  const blackMetal = (K) => K.std(0x1d1f22, { metalness: 0.6, roughness: 0.45 });
  const enamel = (K, c) => K.paint(c || 0x17181a, { metalness: 0.2, roughness: 0.3 });

  /* ---------- shared hoop pieces: 12-hook rim, net, backboard ---------- */
  // Rim (18″ ID, 5/8″ rod) centred at p. Adds 'rim', 'netHooks', 'net' (+ 'newNet' and 'tear').
  function rimSet(K, p, opts) {
    opts = opts || {};
    const R = 0.2286;
    const orange = K.std(0xe0621f, { roughness: 0.4, metalness: 0.3 });
    const rim = K.part('rim', p, null, 'Rim (18″, breakaway)');
    K.tor(rim, [R + 0.008, 0.008], orange, [0, 0, 0], [90, 0, 0]);
    K.box(rim, [0.16, 0.06, 0.09], orange, [0, -0.025, -R - 0.05], null, 0.006); // spring housing
    K.box(rim, [0.2, 0.18, 0.012], orange, [0, -0.06, -R - 0.1], null, 0.004); // mounting plate
    K.bar(rim, [-0.07, 0, -R - 0.02], [-0.03, -0.07, -R - 0.09], 0.006, orange);
    K.bar(rim, [0.07, 0, -R - 0.02], [0.03, -0.07, -R - 0.09], 0.006, orange);
    const hooks = K.part('netHooks', p, null, 'Net hooks (12)');
    K.rep(12, (i) => {
      const a = (i / 12) * Math.PI * 2;
      K.tor(hooks, [0.012, 0.0025, 200], orange, [Math.cos(a) * (R + 0.006), -0.016, Math.sin(a) * (R + 0.006)], [0, -a * 57.3, 90]);
    });
    const netMat = K.std(0xf4f4f4, { wireframe: true, roughness: 1 });
    const net = K.part('net', [p[0], p[1] - 0.22, p[2]], null, opts.netLabel || 'Old net (torn)');
    K.cyl(net, [R, 0.13, 0.42, 12, true], netMat);
    K.cyl(net, [R * 0.92, 0.12, 0.3, 12, true], netMat, [0, 0.05, 0], [0, 15, 0]);
    const tear = K.part('tear', [0.16, 0.0, 0.1], net, 'Torn loops');
    K.box(tear, [0.05, 0.12, 0.01], K.std(0xc9b9a0, { roughness: 1 }), [0, 0, 0], [0, -30, 8], 0);
    const nn = K.part('newNet', [p[0], p[1] - 0.23, p[2]], null, 'New all-weather net');
    const nm = K.std(0xffffff, { wireframe: true, roughness: 0.8 });
    K.cyl(nn, [R + 0.004, 0.14, 0.45, 12, true], nm);
    K.cyl(nn, [R * 0.9, 0.13, 0.32, 12, true], nm, [0, 0.06, 0], [0, 15, 0]);
    return rim;
  }
  // Backboard w × h centred at p (face toward +z). Shooter's square sits with its bottom at rimY.
  function board(K, p, w, h, rimY, label, glass) {
    const b = K.part('board', p, null, label);
    const pane = glass
      ? K.phys(0xdfeef5, { transparent: true, opacity: 0.35, roughness: 0.05, clearcoat: 1 })
      : K.std(0xe9eef2, { transparent: true, opacity: 0.6, roughness: 0.15 });
    K.box(b, [w, h, 0.012], pane, [0, 0, 0], null, 0);
    const fr = K.std(0x2a2d31, { metalness: 0.6, roughness: 0.4 });
    K.box(b, [w + 0.04, 0.04, 0.05], fr, [0, h / 2, 0], null, 0.006);
    K.box(b, [w + 0.04, 0.05, 0.06], fr, [0, -h / 2, 0], null, 0.006);
    K.box(b, [0.04, h, 0.05], fr, [-w / 2, 0, 0], null, 0.006);
    K.box(b, [0.04, h, 0.05], fr, [w / 2, 0, 0], null, 0.006);
    const y0 = rimY - p[1];
    const wl = K.std(0xffffff, { roughness: 0.5 });
    K.box(b, [0.61, 0.05, 0.004], wl, [0, y0 + 0.457, 0.008], null, 0);
    K.box(b, [0.61, 0.05, 0.004], wl, [0, y0 + 0.025, 0.008], null, 0);
    K.box(b, [0.05, 0.457, 0.004], wl, [-0.28, y0 + 0.23, 0.008], null, 0);
    K.box(b, [0.05, 0.457, 0.004], wl, [0.28, y0 + 0.23, 0.008], null, 0);
    K.box(b, [w * 0.92, 0.03, 0.04], fr, [0, -0.1, -0.04], null, 0.004); // rear strut
    K.box(b, [0.04, h * 0.85, 0.04], fr, [-0.25, 0, -0.04], null, 0.004);
    K.box(b, [0.04, h * 0.85, 0.04], fr, [0.25, 0, -0.04], null, 0.004);
    return b;
  }

  /* ================= Portable hoop (54″ board, 35-gal base) ================= */
  TB.model(
    'hoopPortable',
    V(DRIVE, { cam: [5.6, 2.6, 5.4], at: [0, 1.75, -0.4], hidden: ['newNet', 'hose', 'funnel', 'sand', 'fill', 'weights', 'cap'] }),
    (K) => {
      const shell = K.std(0x15171a, { roughness: 0.8 });
      const base = K.part('base', [0, 0, -1.15], null, 'Base tank (HDPE, ≈35 gal)');
      // side profile (world z, y) extruded across x
      const prof = [[0.42, 0], [-0.42, 0], [-0.42, 0.13], [-0.08, 0.3], [0.42, 0.3]];
      K.ext(K.group(base, [-0.6, 0.0, 0], [0, 90, 0]), prof, 1.2, shell, [0, 0, 0], [0, 0, 0], 0.025);
      K.rep(5, (i) => K.box(base, [1.16, 0.012, 0.03], K.std(0x1d2023, { roughness: 0.8 }), [0, 0.305, -0.38 + i * 0.07], null, 0.003)); // grip ribs
      [-0.52, 0.52].forEach((x) => {
        K.cyl(base, [0.075, 0.075, 0.05, 24], 'rubber', [x, 0.075, 0.43], [0, 0, 90]);
        K.cyl(base, [0.03, 0.03, 0.055, 16], 'grey', [x, 0.075, 0.43], [0, 0, 90]);
      });
      const fill = K.part('fill', [0, 0, -1.15], null, 'Water level (2″ below top)');
      const water = K.box(fill, [1.1, 0.24, 0.76], K.std(0x5fa6e0, { transparent: true, opacity: 0.55, roughness: 0.1 }), [0, 0.12, -0.04], null, 0.02);
      const cap = K.part('cap', [-0.3, 0.33, -1.5], null, 'Fill cap (removed)');
      K.cyl(cap, [0.055, 0.055, 0.035, 24], 'black');
      const capOn = K.part('fillCap', [-0.3, 0.31, -1.46], null, 'Fill cap');
      K.cyl(capOn, [0.055, 0.055, 0.035, 24], K.std(0x111214, { roughness: 0.6 }));
      K.rep(4, (i) => K.box(capOn, [0.09, 0.012, 0.012], K.std(0x111214), [0, 0.02, 0], [0, i * 45, 0], 0.002));
      // pole: lower and middle sections (3.5″ round) leaning forward
      const steel = K.std(0x2b2e33, { metalness: 0.7, roughness: 0.4 });
      const pole = K.part('pole', [0, 0, 0], null, 'Pole (3 sections)');
      const P0 = [0, 0.24, -1.12];
      const P1 = [0, 2.55, -0.72];
      K.bar(pole, P0, P1, 0.045, steel);
      const lerp = (t) => [P0[0] + (P1[0] - P0[0]) * t, P0[1] + (P1[1] - P0[1]) * t, P0[2] + (P1[2] - P0[2]) * t];
      const pb = K.part('poleBolts', [0, 0, 0], null, 'Pole section bolts');
      [0.32, 0.64].forEach((t) => {
        const q = lerp(t);
        K.cyl(pole, [0.049, 0.049, 0.06, 24], steel, q, [-10, 0, 0]);
        K.nut(pb, 0.018, 0.009, 'chrome', [0.055, q[1], q[2]], [0, 0, 90]);
        K.nut(pb, 0.018, 0.009, 'chrome', [-0.055, q[1], q[2]], [0, 0, 90]);
      });
      const bb = K.part('baseBolts', [0, 0, 0], null, 'Pole-to-base bracket bolts');
      K.box(bb, [0.16, 0.12, 0.14], steel, [0, 0.28, -1.12], null, 0.01);
      [[-0.06, 0.3], [0.06, 0.3]].forEach(([x, y]) => K.nut(bb, 0.02, 0.01, 'chrome', [x * 1.5, y, -1.05], [90, 0, 0]));
      const brace = K.part('brace', [0, 0, 0], null, 'Support strut');
      K.bar(brace, [0, 0.3, -1.5], [0, 1.25, -0.95], 0.022, steel);
      // telescoping upper section + lift handle
      const up = K.part('upperPole', [0, 0, 0], null, 'Telescoping upper pole');
      K.bar(up, lerp(0.86), [0, 3.12, -0.62], 0.038, K.std(0x3a3e44, { metalness: 0.7, roughness: 0.35 }));
      const lift = K.part('lift', [0, 1.75, -0.86], null, 'Height-adjust handle (7½–10 ft)');
      K.box(lift, [0.06, 0.14, 0.06], 'black', [0, 0, 0.04], null, 0.01);
      K.bar(lift, [0, 0.06, 0.06], [0, -0.22, 0.32], 0.014, 'black');
      K.cyl(lift, [0.02, 0.02, 0.12, 12], 'rubber', [0, -0.24, 0.34], [0, 0, 90]);
      K.box(lift, [0.02, 0.24, 0.035], 'white', [0.045, 0.2, -0.02], [-10, 0, 0], 0.002);
      const arms = K.part('arms', [0, 0, 0], null, 'Parallel lift arms');
      K.bar(arms, [0, 2.95, -0.66], [0, 3.1, -0.06], 0.022, steel);
      K.bar(arms, [0, 3.3, -0.6], [0, 3.45, -0.06], 0.022, steel);
      K.bar(arms, [0, 2.95, -0.66], [0, 3.3, -0.6], 0.02, steel);
      board(K, [0, 3.33, 0], 1.37, 0.84, 3.05, 'Backboard (54″ polycarbonate)');
      rimSet(K, [0, 3.05, 0.025 + 0.12 + 0.2286]);
      const rb = K.part('rimBolts', [0, 2.99, -0.035], null, 'Rim bolts (4, behind board)');
      [[-0.06, 0.04], [0.06, 0.04], [-0.06, -0.04], [0.06, -0.04]].forEach(([x, y]) => K.nut(rb, 0.019, 0.01, 'chrome', [x, y, 0], [90, 0, 0]));
      // fill gear
      const hose = K.part('hose', [0, 0, 0], null, 'Garden hose');
      K.tube(hose, [[-0.3, 0.42, -1.46], [-0.4, 0.55, -1.6], [-0.9, 0.1, -1.9], [-2.2, 0.03, -1.6]], 0.012, K.std(0x2f8a3e, { roughness: 0.6 }));
      K.cyl(hose, [0.014, 0.014, 0.08, 12], 'brass', [-0.3, 0.38, -1.46]);
      const fun = K.part('funnel', [-0.3, 0.34, -1.46], null, 'Funnel');
      K.lathe(fun, [[0.02, 0], [0.025, 0.06], [0.14, 0.2], [0.15, 0.21]], K.std(0xd9a53a, { roughness: 0.5 }));
      const sand = K.part('sand', [-1.05, 0, -1.3], null, 'Play sand (50 lb bags)');
      const bag = K.std(0xd8c7a0, { roughness: 1 });
      K.rep(4, (i) => K.box(sand, [0.42, 0.11, 0.3], bag, [(i % 2) * 0.05, 0.055 + Math.floor(i / 2) * 0.11, (i % 2) * 0.32], [0, i * 7, 0], 0.04));
      const wt = K.part('weights', [0, 0.36, -1.33], null, 'Sandbag weights on the base');
      [-0.38, 0.38].forEach((x) => K.box(wt, [0.36, 0.1, 0.24], K.std(0x3e4a36, { roughness: 1 }), [x, 0, 0], null, 0.04));
      const ball = K.part('ball', [-1.0, 0.12, 1.6], null, 'Ball');
      K.sph(ball, 0.12, K.std(0xc8622a, { roughness: 0.7 }));
      return {
        tick(t, fx) {
          if (fx === 'fill') {
            const k = 0.25 + ((t * 0.15) % 0.75);
            water.scale.y = k;
            water.position.y = 0.12 * k;
          } else {
            water.scale.y = 1;
            water.position.y = 0.12;
          }
          if (fx === 'bounce') K.parts.ball.position.y = 0.12 + Math.abs(Math.sin(t * 3)) * 0.7;
        },
      };
    }
  );

  /* ================= In-ground hoop on an anchor kit (build) ================= */
  const HOOP_AO = ['aoPolePad', 'aoBoardPad', 'aoLight', 'aoLines'];
  TB.model(
    'hoopAnchor',
    V(DRIVE, {
      cam: [6.0, 3.0, 6.2], at: [0, 1.7, -0.5], floor: false, ground: null, tex: ['forrest_ground_01', 'aerial_grass_rock', 'brushed_concrete'], assets: ['cement_bag'],
      hidden: ['layout', 'spoil', 'cage', 'anchor', 'template', 'braces', 'concrete', 'bags', 'levelNuts', 'pole', 'topNuts', 'arms', 'crank', 'board', 'rim', 'netHooks', 'net', 'newNet', 'tear', 'rimBolts'].concat(HOOP_AO),
    }),
    (K) => {
      const HZ = -1.0; // hole centre (z)
      const R = 0.305; // 24″ hole
      const D = 1.22; // 48″ deep
      const soil = K.part('soil', [0, 0, 0], null, 'Soil');
      const dirt = K.pbr('forrest_ground_01', [3, 3], { color: 0x9a7a5a }, 'dirt');
      const hole = K.circle(0, 0, R, 40).reverse();
      K.ext(K.group(soil, [0, 0, HZ]), [[-6, -5], [6, -5], [6, 7], [-6, 7]], 1.6, dirt, [0, 0, 0], [90, 0, 0], 0, [hole]);
      const grass = K.pbr('aerial_grass_rock', [5, 5], {}, 'grass');
      K.ext(K.group(soil, [0, 0.03, HZ]), [[-6, -5], [6, -5], [6, 0.55], [-6, 0.55]], 0.03, grass, [0, 0, 0], [90, 0, 0], 0, [hole]);
      const slab = K.part('slab', [0, 0, 0], null, 'Driveway slab');
      K.box(slab, [6, 0.1, 5.45], K.pbr('brushed_concrete', [4, 4], {}, 'concrete'), [0, 0.05, 2.275], null, 0.01);
      const turf = K.part('turf', [0, 0, HZ], null, 'Lawn (dig here)');
      K.cyl(turf, [R, R, D, 40], dirt, [0, -D / 2, 0]);
      K.cyl(turf, [R, R, 0.03, 40], grass, [0, 0.015, 0]);
      const lay = K.part('layout', [0, 0.035, HZ], null, 'Layout: 24″ circle, 3 ft behind slab edge');
      K.tor(lay, [R, 0.012], K.std(0xff6a1a, { roughness: 0.6 }), [0, 0, 0], [90, 0, 0]);
      K.box(lay, [0.02, 0.01, 0.55], K.std(0xff6a1a), [0, 0, 0.3], null, 0);
      [[-2.6, 0.5], [2.6, 0.5]].forEach(([x, z]) => K.box(lay, [0.03, 0.4, 0.03], 'woodLight', [x, 0.17, z], null, 0.004));
      K.bar(lay, [-2.6, 0.3, 0.5], [2.6, 0.3, 0.5], 0.003, 'yellow');
      const spoil = K.part('spoil', [1.2, 0, HZ - 0.6], null, 'Spoil pile (on a tarp)');
      K.box(spoil, [1.4, 0.01, 1.2], K.std(0x2f5d8a, { roughness: 0.8 }), [0, 0.035, 0], null, 0);
      K.sph(spoil, 0.55, dirt, [0, 0.04, 0], [1, 0.45, 0.85]);
      // rebar cage + J-bolt anchor + template
      const cage = K.part('cage', [0, 0, HZ], null, 'Rebar cage (#4 bar)');
      const rebar = K.std(0x6b4a33, { metalness: 0.5, roughness: 0.7 });
      K.rep(4, (i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        K.bar(cage, [Math.cos(a) * 0.21, -D + 0.08, Math.sin(a) * 0.21], [Math.cos(a) * 0.21, -0.18, Math.sin(a) * 0.21], 0.0064, rebar);
      });
      [-1.0, -0.6, -0.25].forEach((y) => K.tor(cage, [0.21, 0.0064], rebar, [0, y, 0], [90, 0, 0]));
      const anc = K.part('anchor', [0, 0, HZ], null, 'Anchor kit: four ¾″ J-bolts');
      const galv = K.std(0xb9bec2, { metalness: 0.85, roughness: 0.35 });
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
        const x = sx * 0.1;
        const z = sz * 0.1;
        K.bar(anc, [x, -0.7, z], [x, 0.11, z], 0.0095, galv);
        K.bar(anc, [x, -0.7, z], [x * 1.9, -0.76, z * 1.9], 0.0095, galv);
        K.rep(10, (i) => K.tor(anc, [0.0095, 0.0018], galv, [x, 0.02 + i * 0.009, z], [90, 0, 0]));
      });
      const tpl = K.part('template', [0, 0.1, HZ], null, 'Bolt template (keeps the pattern square)');
      K.box(tpl, [0.32, 0.008, 0.32], K.std(0x7f8a93, { metalness: 0.7, roughness: 0.4 }), [0, 0, 0], null, 0);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
        K.nut(tpl, 0.029, 0.016, galv, [sx * 0.1, 0.012, sz * 0.1]);
        K.nut(tpl, 0.029, 0.016, galv, [sx * 0.1, -0.02, sz * 0.1]);
      });
      const br = K.part('braces', [0, 0.05, HZ], null, '2×4 braces holding the template');
      [-0.12, 0.12].forEach((z) => K.box(br, [1.3, 0.089, 0.038], 'woodLight', [0, 0, z], null, 0.004));
      const conc = K.part('concrete', [0, 0, HZ], null, 'Concrete footing (≈½ cu yd)');
      K.cyl(conc, [R - 0.002, R - 0.002, D, 40], K.std(0x9d9c96, { roughness: 0.95 }), [0, -D / 2 + 0.005, 0]);
      K.cone(conc, [R - 0.002, 0.03, 40], K.std(0xa5a49e, { roughness: 0.9 }), [0, 0.02, 0]);
      const bags = K.part('bags', [-1.4, 0.03, HZ - 0.3], null, '80 lb concrete mix bags');
      const bagM = K.std(0xb9a77d, { roughness: 1 });
      K.rep(6, (i) => {
        const g = K.glb(bags, 'cement_bag', { size: 0.6 }, [(i % 3) * 0.5, Math.floor(i / 3) * 0.14, 0], [0, i * 11, 0]);
        if (!g) K.box(bags, [0.45, 0.13, 0.32], bagM, [(i % 3) * 0.5, 0.065 + Math.floor(i / 3) * 0.13, 0], [0, i * 11, 0], 0.04);
      });
      const ln = K.part('levelNuts', [0, 0.05, HZ], null, 'Leveling nuts + washers');
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
        K.nut(ln, 0.029, 0.016, galv, [sx * 0.1, 0, sz * 0.1]);
        K.cyl(ln, [0.025, 0.025, 0.004, 20], galv, [sx * 0.1, 0.012, sz * 0.1]);
      });
      // pole on its base plate
      const steel = K.std(0x2a2d31, { metalness: 0.7, roughness: 0.4 });
      const pole = K.part('pole', [0, 0.064, HZ], null, '5″ square pole + base plate');
      K.box(pole, [0.33, 0.019, 0.33], steel, [0, 0.0095, 0], null, 0.003);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([sx, sz]) => K.box(pole, [sx ? 0.1 : 0.012, 0.12, sz ? 0.1 : 0.012], steel, [sx * 0.11, 0.075, sz * 0.11], null, 0.002));
      K.box(pole, [0.127, 3.2, 0.127], steel, [0, 1.62, 0], null, 0.008);
      K.box(pole, [0.135, 0.01, 0.135], 'black', [0, 3.22, 0], null, 0.002);
      const tn = K.part('topNuts', [0, 0.1, HZ], null, 'Top nuts + washers');
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
        K.cyl(tn, [0.025, 0.025, 0.004, 20], galv, [sx * 0.1, -0.015, sz * 0.1]);
        K.nut(tn, 0.029, 0.016, galv, [sx * 0.1, -0.005, sz * 0.1]);
      });
      const arms = K.part('arms', [0, 0, 0], null, 'Extension arms (3 ft overhang)');
      K.box(arms, [0.05, 0.05, 0.95], steel, [0, 3.0, HZ + 0.52], null, 0.005);
      K.box(arms, [0.05, 0.05, 0.95], steel, [0, 3.42, HZ + 0.52], null, 0.005);
      K.box(arms, [0.2, 0.62, 0.05], steel, [0, 3.21, -0.07], null, 0.005);
      const crank = K.part('crank', [0, 0, 0], null, 'Crank height adjuster');
      K.box(crank, [0.07, 0.12, 0.06], 'black', [0.1, 1.35, HZ], null, 0.008);
      K.bar(crank, [0.1, 1.42, HZ], [0.03, 2.98, HZ + 0.2], 0.012, 'chrome');
      K.bar(crank, [0.14, 1.35, HZ], [0.22, 1.35, HZ], 0.006, 'chrome');
      K.bar(crank, [0.22, 1.35, HZ], [0.22, 1.25, HZ + 0.08], 0.006, 'chrome');
      K.cyl(crank, [0.015, 0.015, 0.07, 12], 'black', [0.22, 1.23, HZ + 0.1], [0, 0, 90]);
      board(K, [0, 3.355, 0], 1.52, 0.91, 3.05, 'Backboard (60″ tempered glass)', true);
      rimSet(K, [0, 3.05, 0.025 + 0.152 + 0.2286], { netLabel: 'All-weather net' });
      const rb = K.part('rimBolts', [0, 2.99, -0.035], null, 'Rim bolts');
      [[-0.06, 0.04], [0.06, 0.04], [-0.06, -0.04], [0.06, -0.04]].forEach(([x, y]) => K.nut(rb, 0.019, 0.01, 'chrome', [x, y, 0], [90, 0, 0]));
      // add-ons
      const pad = K.part('aoPolePad', [0, 0.1, HZ], null, 'Pole pad');
      K.box(pad, [0.21, 1.5, 0.21], K.std(0x1f3f7a, { roughness: 0.85 }), [0, 0.8, 0], null, 0.03);
      const bpad = K.part('aoBoardPad', [0, 2.9, 0], null, 'Backboard edge pad');
      K.box(bpad, [1.58, 0.06, 0.1], K.std(0x1f3f7a, { roughness: 0.85 }), [0, 0, 0], null, 0.02);
      K.box(bpad, [0.06, 0.4, 0.1], K.std(0x1f3f7a, { roughness: 0.85 }), [-0.79, 0.18, 0], null, 0.02);
      K.box(bpad, [0.06, 0.4, 0.1], K.std(0x1f3f7a, { roughness: 0.85 }), [0.79, 0.18, 0], null, 0.02);
      const lt = K.part('aoLight', [-2.6, 0, -0.9], null, 'LED court light on a 14 ft pole');
      K.cyl(lt, [0.05, 0.06, 4.3, 16], blackMetal(K), [0, 2.15, 0]);
      K.box(lt, [0.3, 0.3, 0.22], K.std(0x30343a, { roughness: 0.5 }), [0.15, 4.2, 0.2], [-40, 30, 0], 0.02);
      K.box(lt, [0.26, 0.26, 0.01], glow(K, 0xffffff, 1.4), [0.2, 4.13, 0.28], [-40, 30, 0], 0);
      const lines = K.part('aoLines', [0, 0.101, 0], null, 'Painted key & free-throw line');
      const pl = K.std(0xffffff, { roughness: 0.6 });
      K.box(lines, [3.66, 0.002, 0.05], pl, [0, 0, 4.6], null, 0);
      K.box(lines, [0.05, 0.002, 4.6], pl, [-1.83, 0, 2.3], null, 0);
      K.box(lines, [0.05, 0.002, 4.6], pl, [1.83, 0, 2.3], null, 0);
      K.tor(lines, [1.83, 0.025, 180], pl, [0, 0, 4.6], [90, 0, 0]);
      const ball = K.part('ball', [-1.0, 0.22, 1.6], null, 'Ball');
      K.sph(ball, 0.12, K.std(0xc8622a, { roughness: 0.7 }));
      return {
        tick(t, fx) {
          if (fx === 'bounce') K.parts.ball.position.y = 0.22 + Math.abs(Math.sin(t * 3)) * 0.7;
        },
      };
    }
  );

  /* ================= 22″ charcoal kettle ================= */
  TB.model(
    'kettle',
    V(PATIO, { cam: [1.5, 1.45, 1.6], at: [0, 0.65, 0], assets: ['metal_trash_can'], hidden: ['chimney', 'paper', 'chimneyFire', 'coals', 'dripPan', 'food', 'can', 'scraper', 'soapy'] }),
    (K) => {
      const en = enamel(K);
      const RIM = 0.7;
      const bowl = K.part('bowl', [0, 0, 0], null, 'Kettle bowl (porcelain enamel)');
      K.lathe(bowl, [[0.0, 0.43], [0.1, 0.442], [0.18, 0.48], [0.24, 0.54], [0.275, 0.61], [0.288, 0.68], [0.29, RIM]], en);
      K.tor(bowl, [0.29, 0.004], en, [0, RIM, 0], [90, 0, 0]);
      [-1, 1].forEach((s) => {
        K.box(bowl, [0.05, 0.03, 0.04], 'black', [s * 0.3, 0.66, 0], null, 0.006);
        K.box(bowl, [0.12, 0.025, 0.03], K.std(0x222222, { roughness: 0.6 }), [s * 0.36, 0.66, 0], null, 0.01);
      });
      // three legs, two wheels, ash catcher
      const legs = K.part('legs', [0, 0, 0], null, 'Legs + wheels');
      const al = K.std(0xb7bcc0, { metalness: 0.9, roughness: 0.35 });
      [90, 210, 330].forEach((d, i) => {
        const a = (d * Math.PI) / 180;
        K.bar(legs, [Math.cos(a) * 0.22, 0.55, Math.sin(a) * 0.22], [Math.cos(a) * 0.34, 0.03, Math.sin(a) * 0.34], 0.012, al);
        if (i) K.cyl(legs, [0.08, 0.08, 0.035, 24], 'rubber', [Math.cos(a) * 0.37, 0.08, Math.sin(a) * 0.37], [0, -d, 90]);
      });
      K.tor(legs, [0.29, 0.005], al, [0, 0.2, 0], [90, 0, 0]);
      const ash = K.part('ashPan', [0, 0.17, 0], null, 'Ash catcher');
      K.lathe(ash, [[0, 0], [0.17, 0.0], [0.19, 0.06]], al);
      const ashPile = K.part('ash', [0, 0, 0], null, 'Old ash');
      const ashM = K.std(0xb8b4ae, { roughness: 1 });
      K.sph(ashPile, 0.12, ashM, [0, 0.452, 0], [1.4, 0.18, 1.4]);
      K.sph(ashPile, 0.12, ashM, [0, 0.18, 0], [1.2, 0.2, 1.2]);
      const vents = K.part('vents', [0, 0, 0], null, 'Bottom vents (One-Touch)');
      K.rep(3, (i) => K.box(vents, [0.08, 0.004, 0.03], al, [Math.cos(i * 2.09) * 0.07, 0.448, Math.sin(i * 2.09) * 0.07], [0, -i * 120, 0], 0));
      K.bar(vents, [0, 0.44, 0], [0.27, 0.5, 0.12], 0.005, al);
      K.cyl(vents, [0.012, 0.012, 0.03, 12], 'black', [0.28, 0.5, 0.125], [0, 0, 90]);
      // grates
      const cg = K.part('coalGrate', [0, 0.53, 0], null, 'Charcoal grate');
      K.rep(13, (i) => K.box(cg, [0.006, 0.006, 0.36 - Math.abs(i - 6) * 0.03], al, [-0.18 + i * 0.03, 0, 0], null, 0));
      K.box(cg, [0.38, 0.008, 0.008], al, [0, -0.005, 0.12], null, 0);
      K.box(cg, [0.38, 0.008, 0.008], al, [0, -0.005, -0.12], null, 0);
      const grate = K.part('cookGrate', [0, 0.69, 0], null, 'Cooking grate (hinged sides)');
      K.tor(grate, [0.272, 0.004], al, [0, 0, 0], [90, 0, 0]);
      K.rep(23, (i) => {
        const x = -0.264 + i * 0.024;
        const L = 2 * Math.sqrt(Math.max(0, 0.272 * 0.272 - x * x));
        K.box(grate, [0.005, 0.005, L], al, [x, 0, 0], null, 0);
      });
      K.box(grate, [0.55, 0.006, 0.006], al, [0, -0.004, 0.18], null, 0);
      K.box(grate, [0.55, 0.006, 0.006], al, [0, -0.004, -0.18], null, 0);
      [-1, 1].forEach((s) => K.tor(grate, [0.03, 0.004, 180], al, [s * 0.272, 0.01, 0], [0, s > 0 ? 0 : 180, 90]));
      const grime = K.part('grime', [0, 0.696, 0], null, 'Carbon + grease on the grate');
      K.rep(7, (i) => K.box(grime, [0.08 + (i % 3) * 0.02, 0.004, 0.06], K.std(0x2a1d14, { roughness: 1 }), [-0.18 + i * 0.06, 0, ((i * 37) % 5) * 0.05 - 0.1], [0, i * 23, 0], 0));
      // lid
      const lid = K.part('lid', [0, RIM, 0], null, 'Lid');
      K.lathe(lid, [[0.293, 0.0], [0.286, 0.06], [0.25, 0.14], [0.18, 0.205], [0.09, 0.242], [0, 0.25]], en);
      K.box(lid, [0.16, 0.03, 0.035], 'black', [0, 0.29, 0], null, 0.012);
      K.box(lid, [0.025, 0.04, 0.03], al, [-0.065, 0.262, 0], null, 0.004);
      K.box(lid, [0.025, 0.04, 0.03], al, [0.065, 0.262, 0], null, 0.004);
      K.box(lid, [0.2, 0.004, 0.08], al, [0, 0.255, 0], null, 0);
      const lv = K.part('lidVent', [0.15, 0.207, 0], lid, 'Lid vent (damper)');
      K.cyl(lv, [0.055, 0.055, 0.006, 24], al, [0, 0, 0], [0, 0, -37]);
      K.box(lv, [0.04, 0.01, 0.012], al, [0.02, 0.012, 0], [0, 0, -37], 0.003);
      const th = K.part('thermo', [-0.15, 0.2, 0.06], lid, 'Lid thermometer');
      K.cyl(th, [0.03, 0.03, 0.012, 24], 'chrome', [0, 0, 0], [30, 0, 40]);
      K.cyl(th, [0.025, 0.025, 0.013, 24], K.std(0xf4f4f0), [0.001, 0.001, 0], [30, 0, 40]);
      // fire gear
      const paper = K.part('paper', [0.06, 0.535, 0], null, 'Two sheets of newspaper (or lighter cubes)');
      K.sph(paper, 0.07, K.std(0xe8e2d0, { roughness: 1 }), [0, 0.01, 0], [1.2, 0.35, 1.2]);
      const ch = K.part('chimney', [0.06, 0.535, 0], null, 'Chimney starter');
      K.cyl(ch, [0.085, 0.085, 0.3, 32, true], al, [0, 0.19, 0]);
      K.cyl(ch, [0.085, 0.085, 0.004, 32], al, [0, 0.11, 0]);
      K.rep(8, (i) => K.box(ch, [0.02, 0.025, 0.004], 'black', [Math.cos(i * 0.785) * 0.086, 0.06, Math.sin(i * 0.785) * 0.086], [0, -i * 45 + 90, 0], 0));
      K.bar(ch, [0.085, 0.3, 0], [0.2, 0.3, 0], 0.006, al);
      K.bar(ch, [0.085, 0.14, 0], [0.2, 0.14, 0], 0.006, al);
      K.box(ch, [0.03, 0.2, 0.03], 'black', [0.21, 0.22, 0], null, 0.01);
      const ember = K.std(0x3a2a22, { emissive: 0xff4a10, emissiveIntensity: 0.6, roughness: 1 });
      const coalM = K.std(0x26221f, { roughness: 1 });
      const briq = (p, x, y, z, m) => K.sph(p, 0.022, m, [x, y, z], [1, 0.7, 1]);
      K.rep(26, (i) => briq(ch, Math.cos(i * 2.4) * 0.05 * ((i % 3) / 2 + 0.3), 0.3 + Math.floor(i / 9) * 0.03, Math.sin(i * 2.4) * 0.05 * ((i % 3) / 2 + 0.3), i % 4 ? ember : coalM));
      const chf = K.part('chimneyFire', [0.06, 0.88, 0], null, 'Flames out of the chimney');
      const flames = [];
      K.rep(6, (i) => flames.push(K.cone(chf, [0.03, 0.12, 10], i % 2 ? 'fire' : 'flame', [Math.cos(i) * 0.04, 0.03, Math.sin(i) * 0.04])));
      const coals = K.part('coals', [0, 0.545, 0], null, 'Lit coals banked on one side');
      const emberM = K.std(0x3a2a22, { emissive: 0xff4a10, emissiveIntensity: 0.8, roughness: 1 });
      K.rep(70, (i) => {
        const a = (i * 2.399) % (Math.PI * 2);
        const r = Math.sqrt((i % 23) / 23) * 0.14;
        const x = -0.12 + Math.cos(a) * r * 0.75;
        const z = Math.sin(a) * r * 1.3;
        briq(coals, x, 0.012 + (i % 3) * 0.02 + (0.14 - r) * 0.3, z, i % 5 ? emberM : coalM);
      });
      const pan = K.part('dripPan', [0.13, 0.545, 0], null, 'Foil drip pan (cool side)');
      K.box(pan, [0.2, 0.05, 0.28], K.std(0xc9ccd0, { metalness: 0.9, roughness: 0.35 }), [0, 0.025, 0], null, 0.006);
      K.box(pan, [0.18, 0.004, 0.26], K.std(0x7fb7e0, { transparent: true, opacity: 0.7 }), [0, 0.035, 0], null, 0);
      const food = K.part('food', [0.13, 0.72, 0], null, 'Whole chicken (indirect side)');
      K.sph(food, 0.09, K.std(0xb76b33, { roughness: 0.5 }), [0, 0.04, 0], [1, 0.75, 1.25]);
      K.sph(food, 0.03, K.std(0xa55e2c, { roughness: 0.5 }), [0.06, 0.04, 0.1], [1, 1, 1.6]);
      K.sph(food, 0.03, K.std(0xa55e2c, { roughness: 0.5 }), [-0.06, 0.04, 0.1], [1, 1, 1.6]);
      const can = K.part('can', [0.75, 0, 0.3], null, 'Metal ash can');
      K.glb(can, 'metal_trash_can', { height: 0.6 }, [0, 0, 0]) || K.cyl(can, [0.2, 0.18, 0.6, 24], 'grey', [0, 0.3, 0]);
      const scr = K.part('scraper', [0, 0.6, 0.12], null, 'Plastic scraper');
      K.box(scr, [0.08, 0.004, 0.06], K.std(0x3a7bd5), [0, 0, 0], [0, 0, 30], 0);
      K.box(scr, [0.02, 0.15, 0.015], K.std(0x3a7bd5), [0.05, 0.08, 0], [0, 0, 30], 0.004);
      const soapy = K.part('soapy', [0, 0.72, 0.3], null, 'Soapy water rinse');
      K.rep(5, (i) => K.sph(soapy, 0.012, K.std(0xffffff, { transparent: true, opacity: 0.6 }), [-0.05 + i * 0.025, 0, 0]));
      return {
        tick(t, fx) {
          const on = fx === 'glow' || fx === 'fire';
          emberM.emissiveIntensity = on ? 0.8 + 0.5 * Math.sin(t * 3) : 0.5;
          ember.emissiveIntensity = on ? 0.7 + 0.4 * Math.sin(t * 4) : 0.4;
          flames.forEach((f, i) => f.scale.set(1, 0.7 + 0.4 * Math.abs(Math.sin(t * 9 + i)), 1));
        },
      };
    }
  );

  /* ================= Pellet grill (hopper, auger, fire pot, hot-rod igniter) ================= */
  TB.model(
    'pellet',
    V(PATIO, { cam: [1.8, 1.6, 2.0], at: [0, 0.8, 0], hidden: ['vac', 'foil', 'smoke'] }),
    (K) => {
      const body = enamel(K, 0x202224);
      const X = 0.45; // half barrel length
      const R = 0.24;
      const Y = 0.86;
      const half = (r0, r1, a0, a1) => K.circle(0, 0, r1, 24, a0, a1).concat(K.circle(0, 0, r0, 24, a1, a0));
      const barrel = K.part('barrel', [0, 0, 0], null, 'Cook chamber');
      K.ext(K.group(barrel, [-X, Y, 0], [0, 90, 0]), half(R - 0.008, R, Math.PI, Math.PI * 2), 2 * X, body);
      [-X, X].forEach((x) => K.ext(K.group(barrel, [x - 0.003, Y, 0], [0, 90, 0]), K.circle(0, 0, R, 24, Math.PI, Math.PI * 2), 0.006, body));
      const legs = K.part('legs', [0, 0, 0], null, 'Legs, shelf + wheels');
      [[-0.38, -0.2], [0.38, -0.2], [-0.38, 0.2], [0.38, 0.2]].forEach(([x, z]) => K.box(legs, [0.035, Y - 0.12, 0.035], body, [x, (Y - 0.12) / 2, z], null, 0.006));
      K.box(legs, [0.82, 0.015, 0.42], body, [0, 0.22, 0], null, 0.004);
      [-0.38, 0.38].forEach((x) => K.cyl(legs, [0.07, 0.07, 0.04, 20], 'rubber', [x, 0.07, 0.24], [0, 0, 90]));
      const lid = K.part('lid', [0, Y, -R], null, 'Lid');
      K.ext(K.group(lid, [-X, 0, R], [0, 90, 0]), half(R - 0.008, R + 0.004, 0, Math.PI), 2 * X, body);
      [-X, X].forEach((x) => K.ext(K.group(lid, [x - 0.003, 0, R], [0, 90, 0]), K.circle(0, 0, R + 0.004, 24, 0, Math.PI), 0.006, body));
      K.bar(lid, [-0.3, 0.12, 2 * R + 0.07], [0.3, 0.12, 2 * R + 0.07], 0.012, 'chrome');
      K.bar(lid, [-0.3, 0.12, 2 * R + 0.07], [-0.3, 0.1, 2 * R - 0.02], 0.01, 'chrome');
      K.bar(lid, [0.3, 0.12, 2 * R + 0.07], [0.3, 0.1, 2 * R - 0.02], 0.01, 'chrome');
      K.cyl(lid, [0.028, 0.028, 0.012, 24], 'chrome', [0.15, R - 0.02, R + 0.18], [-50, 0, 0]);
      const stack = K.part('chimney', [X - 0.08, Y + 0.05, -R + 0.02], null, 'Smoke stack');
      K.cyl(stack, [0.04, 0.04, 0.3, 20], body, [0, 0.15, -0.04], [0, 0, 0]);
      K.cyl(stack, [0.06, 0.06, 0.01, 20], body, [0, 0.32, -0.04]);
      const smoke = K.part('smoke', [X - 0.08, Y + 0.45, -R - 0.02], null, 'Thin blue smoke');
      const puffs = [];
      K.rep(5, (i) => puffs.push(K.sph(smoke, 0.05 + i * 0.015, K.std(0xd8dde6, { transparent: true, opacity: 0.35, roughness: 1 }), [0, i * 0.09, 0])));
      // hopper + controller
      const hop = K.part('hopper', [-X - 0.18, 0, 0], null, 'Pellet hopper');
      K.box(hop, [0.32, 0.38, 0.38], body, [0, 0.82, 0], null, 0.01);
      K.box(hop, [0.34, 0.02, 0.4], body, [0, 1.02, 0], null, 0.006);
      K.box(hop, [0.18, 0.02, 0.025], 'chrome', [0, 1.04, 0.16], null, 0.006);
      const pel = K.part('pellets', [-X - 0.18, 0.95, 0], null, 'Hardwood pellets');
      K.box(pel, [0.28, 0.01, 0.34], K.bumpy(0x9c6a3c, K.tex.speckle(), 0.01, { roughness: 1 }), [0, 0, 0], null, 0);
      const ctl = K.part('controller', [-X - 0.18, 0.84, 0.195], null, 'Controller + temp display');
      K.box(ctl, [0.22, 0.16, 0.012], K.std(0x111214, { roughness: 0.3 }), [0, 0, 0], null, 0.006);
      K.box(ctl, [0.1, 0.045, 0.004], 'screen', [-0.04, 0.035, 0.007], null, 0);
      K.cyl(ctl, [0.025, 0.025, 0.02, 24], 'chrome', [0.06, -0.02, 0.012], [90, 0, 0]);
      K.box(ctl, [0.02, 0.01, 0.004], 'ledG', [-0.07, -0.05, 0.007], null, 0);
      const auger = K.part('auger', [0, 0, 0], null, 'Auger tube + motor');
      K.bar(auger, [-X - 0.18, 0.66, 0], [-0.08, 0.66, 0], 0.025, K.std(0x6d7175, { metalness: 0.8, roughness: 0.4 }));
      K.box(auger, [0.12, 0.1, 0.1], K.std(0x6d7175, { metalness: 0.8 }), [-X - 0.18, 0.6, 0], null, 0.01);
      const fan = K.part('fan', [-0.25, 0.58, 0.08], null, 'Induction fan');
      K.box(fan, [0.1, 0.07, 0.1], K.std(0x444a50, { metalness: 0.6 }), [0, 0, 0], null, 0.008);
      const pot = K.part('firePot', [0, 0.62, 0], null, 'Fire pot (burn pot)');
      const potM = K.std(0x5c534a, { metalness: 0.6, roughness: 0.7 });
      K.cyl(pot, [0.065, 0.055, 0.1, 24, true], potM, [0, 0.03, 0]);
      K.cyl(pot, [0.055, 0.055, 0.004, 24], potM, [0, -0.018, 0]);
      K.rep(10, (i) => K.cyl(pot, [0.006, 0.006, 0.004, 8], 'black', [Math.cos(i * 0.628) * 0.061, 0.0, Math.sin(i * 0.628) * 0.061], [90, -i * 36, 0]));
      const potAsh = K.part('ash', [0, 0.625, 0], null, 'Ash + unburned pellets');
      K.cyl(potAsh, [0.055, 0.055, 0.03, 20], K.std(0xb0aaa2, { roughness: 1 }), [0, 0.0, 0]);
      K.rep(8, (i) => K.cyl(potAsh, [0.0035, 0.0035, 0.015, 6], K.std(0x9c6a3c), [Math.cos(i) * 0.03, 0.018, Math.sin(i) * 0.03], [90, i * 40, 0]));
      const ign = K.part('igniter', [0, 0, 0], null, 'Hot-rod igniter');
      const rodM = K.std(0x8a8f94, { metalness: 0.8, roughness: 0.4, emissive: 0xff3300, emissiveIntensity: 0 });
      K.bar(ign, [-0.16, 0.6, -0.02], [-0.03, 0.615, -0.02], 0.0045, rodM);
      K.box(ign, [0.03, 0.025, 0.025], 'white', [-0.17, 0.6, -0.02], null, 0.004);
      const baffle = K.part('baffle', [0, 0.7, 0], null, 'Heat baffle');
      K.box(baffle, [0.36, 0.006, 0.3], K.std(0x55585c, { metalness: 0.7, roughness: 0.5 }), [0, 0, 0], null, 0);
      [-1, 1].forEach((s) => K.box(baffle, [0.36, 0.04, 0.006], K.std(0x55585c, { metalness: 0.7 }), [0, -0.02, s * 0.15], null, 0));
      const drip = K.part('dripTray', [0, 0.75, 0], null, 'Drip tray (slopes to grease chute)');
      K.box(drip, [0.86, 0.006, 0.36], K.std(0x6b6f74, { metalness: 0.7, roughness: 0.5 }), [0, 0, 0], [0, 0, -3], 0);
      const foil = K.part('foil', [0, 0.756, 0], null, 'Fresh foil liner');
      K.box(foil, [0.84, 0.003, 0.35], K.std(0xdfe3e7, { metalness: 0.9, roughness: 0.25 }), [0, 0, 0], [0, 0, -3], 0);
      const grime = K.part('grime', [0, 0.76, 0], null, 'Old grease + drippings');
      K.rep(6, (i) => K.box(grime, [0.1, 0.004, 0.07], K.std(0x2a1d14, { roughness: 1 }), [-0.3 + i * 0.12, 0.002 - i * 0.002, ((i * 3) % 4) * 0.06 - 0.09], [0, 0, -3], 0));
      const chute = K.part('bucket', [X + 0.06, 0.55, -0.12], null, 'Grease chute + bucket');
      K.box(chute, [0.06, 0.12, 0.05], body, [-0.02, 0.12, 0], [0, 0, 20], 0.004);
      K.cyl(chute, [0.055, 0.05, 0.12, 20], 'steel', [0.02, 0, 0]);
      const grates = K.part('grates', [0, Y - 0.005, 0], null, 'Porcelain grates');
      K.rep(17, (i) => K.box(grates, [0.005, 0.008, 0.44], K.std(0x2a2c2e, { roughness: 0.5 }), [-0.4 + i * 0.05, 0, 0], null, 0));
      [-0.2, 0, 0.2].forEach((z) => K.box(grates, [0.84, 0.006, 0.006], K.std(0x2a2c2e), [0, -0.006, z], null, 0));
      const rtd = K.part('rtd', [-X + 0.03, Y + 0.03, -0.17], null, 'Temp probe (RTD)');
      K.bar(rtd, [0, 0, 0], [0, 0.12, 0], 0.004, 'chrome');
      const vac = K.part('vac', [0, 0, 0], null, 'Shop-vac hose (cold ash only)');
      K.tube(vac, [[0.02, 0.66, 0.02], [0.05, 0.95, 0.15], [0.3, 1.25, 0.5], [0.9, 0.6, 0.9], [1.3, 0.1, 0.9]], 0.022, K.std(0x37393c, { roughness: 0.7 }));
      K.cyl(vac, [0.02, 0.026, 0.12, 16], K.std(0x2a6fc0), [0.025, 0.7, 0.04], [10, 0, 0]);
      return {
        tick(t, fx) {
          const hot = fx === 'ignite';
          rodM.emissiveIntensity = hot ? 1.2 + 0.4 * Math.sin(t * 5) : 0;
          rodM.color.setHex(hot ? 0xff6a30 : 0x8a8f94);
          puffs.forEach((p, i) => {
            p.position.y = ((t * 0.12 + i * 0.09) % 0.45);
            p.material.opacity = 0.35 * (1 - p.position.y / 0.45);
          });
        },
      };
    }
  );

  /* ================= 3-burner gas grill, burners + igniter detail ================= */
  TB.model(
    'gasGrill',
    V(PATIO, { cam: [1.3, 1.65, 1.5], at: [0, 0.9, 0], assets: ['propane_tank'], hidden: ['newBurner', 'newElectrode', 'soap', 'flames', 'spark', 'vbrush'] }),
    (K) => {
      const body = enamel(K, 0x1e2023);
      const ss = K.std(0xc9cdd1, { metalness: 0.9, roughness: 0.3 });
      const W = 0.66;
      const D = 0.46;
      const cart = K.part('cart', [0, 0, 0], null, 'Cart');
      [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]].forEach(([x, z]) => K.box(cart, [0.035, 0.74, 0.035], body, [x, 0.37, z], null, 0.006));
      K.box(cart, [0.64, 0.015, 0.42], body, [0, 0.12, 0], null, 0.004);
      [-0.3, 0.3].forEach((x) => K.cyl(cart, [0.06, 0.06, 0.035, 20], 'rubber', [x, 0.06, -0.21], [0, 0, 90]));
      [-1, 1].forEach((s) => K.box(cart, [0.32, 0.02, 0.44], ss, [s * (W / 2 + 0.17), 0.9, 0], null, 0.006));
      const fb = K.part('firebox', [0, 0, 0], null, 'Firebox');
      const fbM = K.std(0x2a2b2d, { metalness: 0.4, roughness: 0.6 });
      K.box(fb, [W, 0.012, D], fbM, [0, 0.74, 0], null, 0);
      K.box(fb, [W, 0.25, 0.012], fbM, [0, 0.865, -D / 2], null, 0);
      K.box(fb, [0.012, 0.25, D], fbM, [-W / 2, 0.865, 0], null, 0);
      K.box(fb, [0.012, 0.25, D], fbM, [W / 2, 0.865, 0], null, 0);
      K.box(fb, [W, 0.17, 0.012], fbM, [0, 0.825, D / 2], null, 0);
      K.box(fb, [W, 0.08, 0.012], body, [0, 0.95, D / 2], null, 0);
      const panel = K.part('panel', [0, 0.82, D / 2 + 0.045], null, 'Control panel');
      K.box(panel, [W + 0.02, 0.16, 0.012], ss, [0, 0, 0], [-12, 0, 0], 0.004);
      const knobs = K.part('knobs', [0, 0.81, D / 2 + 0.07], null, 'Burner knobs');
      [-0.2, 0, 0.2].forEach((x) => {
        K.cyl(knobs, [0.032, 0.035, 0.035, 24], 'black', [x, 0, 0], [78, 0, 0]);
        K.box(knobs, [0.008, 0.035, 0.006], 'chrome', [x, 0.003, 0.02], [-12, 0, 0], 0);
      });
      const btn = K.part('igniterBtn', [0.27, 0.8, D / 2 + 0.06], null, 'Igniter button (AA battery inside)');
      K.cyl(btn, [0.018, 0.018, 0.02, 20], 'red', [0, 0, 0], [78, 0, 0]);
      K.cyl(btn, [0.026, 0.026, 0.008, 20], 'chrome', [0, 0, -0.008], [78, 0, 0]);
      const man = K.part('manifold', [0, 0.8, D / 2 + 0.02], null, 'Gas manifold + valves');
      K.bar(man, [-0.32, 0, 0], [0.32, 0, 0], 0.011, 'brass');
      [-0.2, 0, 0.2].forEach((x) => K.box(man, [0.035, 0.035, 0.035], 'brass', [x, 0, 0.0], null, 0.004));
      const ori = K.part('orifice', [0, 0.8, D / 2 - 0.005], null, 'Valve orifice (brass jet)');
      K.cyl(ori, [0.006, 0.008, 0.03, 12], 'brass', [0, 0, 0], [90, 0, 0]);
      // burners: front venturi end slips over orifice, back end pinned
      const tubeOf = (p, x, mat) => {
        K.cyl(p, [0.016, 0.016, D - 0.06, 20], mat, [x, 0.8, -0.01], [90, 0, 0]);
        K.cyl(p, [0.02, 0.02, 0.06, 20], mat, [x, 0.8, D / 2 - 0.04], [90, 0, 0]);
        K.cyl(p, [0.022, 0.022, 0.025, 20], 'black', [x, 0.8, D / 2 - 0.055], [90, 0, 0]); // air shutter
        K.rep(12, (i) => K.box(p, [0.005, 0.003, 0.006], 'black', [x - 0.011, 0.81, -0.19 + i * 0.03], null, 0));
        K.rep(12, (i) => K.box(p, [0.005, 0.003, 0.006], 'black', [x + 0.011, 0.81, -0.19 + i * 0.03], null, 0));
        K.box(p, [0.02, 0.006, 0.03], mat, [x, 0.79, -D / 2 + 0.03], null, 0);
      };
      const burners = K.part('burners', [0, 0, 0], null, 'Side burners');
      tubeOf(burners, -0.2, ss);
      tubeOf(burners, 0.2, ss);
      const old = K.part('oldBurner', [0, 0, 0], null, 'Rusted center burner');
      tubeOf(old, 0, K.std(0x7a4a2c, { metalness: 0.3, roughness: 0.9 }));
      K.box(old, [0.014, 0.012, 0.05], K.std(0x3a2416, { roughness: 1 }), [0.008, 0.808, -0.05], null, 0); // rust-through
      const nb = K.part('newBurner', [0, 0, 0], null, 'New stainless burner');
      tubeOf(nb, 0, K.std(0xdfe3e7, { metalness: 0.95, roughness: 0.2 }));
      const pins = K.part('pins', [0, 0.79, -D / 2 + 0.008], null, 'Rear cotter pins / screws');
      [-0.2, 0, 0.2].forEach((x) => K.tor(pins, [0.01, 0.002], 'chrome', [x, 0, 0], [0, 90, 0]));
      // igniter electrodes + collector boxes
      const elec = (p, x, mat) => {
        K.box(p, [0.012, 0.03, 0.025], K.std(0xf2f0ea, { roughness: 0.4 }), [x + 0.035, 0.81, 0.14], null, 0.003);
        K.bar(p, [x + 0.035, 0.828, 0.14], [x + 0.024, 0.83, 0.14], 0.0015, mat || 'steel');
      };
      const coll = K.part('collectors', [0, 0, 0], null, 'Collector boxes');
      [-0.2, 0, 0.2].forEach((x) => K.box(coll, [0.04, 0.035, 0.04], K.std(0x9ea3a8, { metalness: 0.8, roughness: 0.4 }), [x + 0.035, 0.8, 0.14], null, 0.002));
      const oe = K.part('electrode', [0, 0, 0], null, 'Old electrode (cracked)');
      elec(oe, 0, K.std(0x5a4a3a));
      K.box(oe, [0.013, 0.002, 0.026], 'black', [0.035, 0.815, 0.14], null, 0);
      const ne = K.part('newElectrode', [0, 0, 0], null, 'New electrode + wire');
      elec(ne, 0);
      const wires = K.part('wires', [0, 0, 0], null, 'Igniter wires');
      [-0.2, 0, 0.2].forEach((x, i) => K.tube(wires, [[x + 0.035, 0.79, 0.14], [x + 0.05, 0.75, 0.2], [0.15 + i * 0.03, 0.72, D / 2 + 0.01], [0.27, 0.79, D / 2 + 0.04]], 0.0022, i === 1 ? 'white' : 'black'));
      const spark = K.part('spark', [0.024, 0.83, 0.14], null, 'Spark');
      const sparkM = K.std(0xbfe4ff, { emissive: 0x8fd0ff, emissiveIntensity: 2 });
      K.sph(spark, 0.006, sparkM);
      const tents = K.part('tents', [0, 0, 0], null, 'Heat tents (flavorizer bars)');
      [-0.2, 0, 0.2].forEach((x) => {
        K.box(tents, [0.05, 0.003, D - 0.04], ss, [x - 0.018, 0.87, 0], [0, 0, 40], 0);
        K.box(tents, [0.05, 0.003, D - 0.04], ss, [x + 0.018, 0.87, 0], [0, 0, -40], 0);
      });
      const grates = K.part('grates', [0, 0.93, 0], null, 'Cast-iron grates (2)');
      const ci = K.std(0x2b2826, { roughness: 0.6, metalness: 0.3 });
      [-0.16, 0.16].forEach((x) => {
        K.rep(10, (i) => K.box(grates, [0.012, 0.014, D - 0.03], ci, [x - 0.14 + i * 0.031, 0, 0], null, 0.002));
        [-0.18, 0, 0.18].forEach((z) => K.box(grates, [0.31, 0.01, 0.012], ci, [x, -0.008, z], null, 0.002));
      });
      const lid = K.part('lid', [0, 0.99, -D / 2], null, 'Lid');
      K.box(lid, [W + 0.02, 0.05, D + 0.02], body, [0, 0.025, D / 2], null, 0.01);
      K.cyl(lid, [D / 2 + 0.01, D / 2 + 0.01, W + 0.02, 32, false], body, [0, 0.05, D / 2], [0, 0, 90]).scale.set(0.45, 1, 1);
      K.bar(lid, [-0.25, 0.12, D + 0.07], [0.25, 0.12, D + 0.07], 0.012, 'chrome');
      [-0.25, 0.25].forEach((x) => K.bar(lid, [x, 0.12, D + 0.07], [x, 0.08, D + 0.005], 0.01, 'chrome'));
      const tank = K.part('tank', [0.12, 0.13, 0], null, 'Propane tank (20 lb)');
      K.glb(tank, 'propane_tank', { height: 0.46 }, [0, 0, 0]) || K.cyl(tank, [0.15, 0.15, 0.46, 24], 'white', [0, 0.23, 0]);
      const valve = K.part('valve', [0.12, 0.62, 0], null, 'Tank valve');
      K.cyl(valve, [0.04, 0.04, 0.012, 20], 'black', [0, 0.02, 0]);
      const reg = K.part('regulator', [0, 0, 0], null, 'Regulator + hose');
      K.cyl(reg, [0.035, 0.035, 0.04, 20], 'chrome', [0.12, 0.6, 0.06], [90, 0, 0]);
      K.tube(reg, [[0.12, 0.6, 0.08], [0.25, 0.55, 0.15], [0.3, 0.7, 0.22], [0.32, 0.8, D / 2 + 0.02]], 0.008, 'black');
      const soap = K.part('soap', [0.12, 0.6, 0.1], null, 'Soapy water (leak test)');
      K.rep(5, (i) => K.sph(soap, 0.01 + (i % 2) * 0.006, K.std(0xffffff, { transparent: true, opacity: 0.55 }), [-0.04 + i * 0.02, 0.015, 0]));
      const fl = K.part('flames', [0, 0.82, 0], null, 'Blue flames, yellow tips');
      const cones = [];
      const blue = K.std(0x4f8dff, { emissive: 0x2a6aff, emissiveIntensity: 1.3, transparent: true, opacity: 0.85 });
      [-0.2, 0, 0.2].forEach((x) => K.rep(12, (i) => [-1, 1].forEach((s) => cones.push(K.cone(fl, [0.006, 0.03, 8], blue, [x + s * 0.016, 0.01, -0.19 + i * 0.03], [0, 0, -s * 30])))));
      const vb = K.part('vbrush', [0, 0.85, 0.36], null, 'Venturi brush');
      K.bar(vb, [0, 0, 0], [0, -0.05, -0.1], 0.003, 'steel');
      K.cyl(vb, [0.015, 0.015, 0.08, 10], K.std(0x8a6a40, { roughness: 1 }), [0, -0.06, -0.14], [70, 0, 0]);
      return {
        tick(t, fx) {
          cones.forEach((c, i) => c.scale.set(1, 0.8 + 0.3 * Math.sin(t * 15 + i), 1));
          sparkM.emissiveIntensity = fx === 'spark' ? (Math.sin(t * 20) > 0.3 ? 3 : 0) : 2;
        },
      };
    }
  );

  /* ================= Camping hammock between two trees ================= */
  TB.model(
    'hammock',
    V(WOODS, { cam: [1.2, 1.9, 6.2], at: [0, 1.0, 0], hidden: ['straps', 'biners', 'suspension', 'hammockBody', 'ridgeline', 'angleGuide', 'tarp', 'tarpLines', 'stakes', 'drips'] }),
    (K) => {
      const TX = 2.2; // trees at ±2.2 m (14½ ft apart)
      const SY = 1.75; // strap height
      const EX = 1.38; // gathered ends (ridgeline 2.76 m)
      const EY = SY - (TX - 0.17 - EX) * Math.tan(Math.PI / 6); // 30° suspension
      const SIT = 0.46; // 18″ sit height
      const trees = K.part('trees', [0, 0, 0], null, 'Two live trees, 6″+ thick');
      const bark = K.bumpy(0x5b4636, K.tex.speckle(), 0.03, { roughness: 1 });
      const leaf = K.std(0x4e7a3a, { roughness: 1 });
      [-TX, TX].forEach((x, i) => {
        K.cyl(trees, [0.16, 0.2, 7.5, 20], bark, [x, 3.75, 0]);
        K.cyl(trees, [0.24, 0.2, 0.25, 20], bark, [x, 0.12, 0]);
        K.bar(trees, [x, 4.4, 0], [x + (i ? 0.9 : -0.9), 5.4, 0.3], 0.06, bark);
        [[0, 7.6, 0, 1.6], [0.8, 6.8, 0.4, 1.2], [-0.7, 6.9, -0.5, 1.3]].forEach(([dx, y, dz, r]) => K.sph(trees, r, leaf, [x + dx, y, dz], [1, 0.7, 1]));
      });
      const straps = K.part('straps', [0, 0, 0], null, 'Tree straps (1″ polyester webbing)');
      const web = K.std(0x2f6b4f, { roughness: 0.85 });
      [-1, 1].forEach((s) => {
        const x = s * TX;
        K.tor(straps, [0.17, 0.006], web, [x, SY, 0], [90, 0, 0]);
        K.tor(straps, [0.17, 0.006], web, [x, SY + 0.03, 0], [90, 0, 0]);
        K.tube(straps, [[x - s * 0.17, SY, 0], [x - s * 0.22, SY - 0.12, 0.02], [x - s * 0.25, SY - 0.5, 0.06], [x - s * 0.22, SY - 0.75, 0.05]], 0.005, web);
        K.rep(5, (i) => K.box(straps, [0.02, 0.012, 0.03], K.std(0x1f4a36), [x - s * 0.24, SY - 0.2 - i * 0.12, 0.06], null, 0.003)); // daisy-chain loops
      });
      const biners = K.part('biners', [0, 0, 0], null, 'Carabiners (rated, locking)');
      [-1, 1].forEach((s) => K.tor(biners, [0.035, 0.005], K.std(0xc23a2a, { metalness: 0.7, roughness: 0.3 }), [s * (TX - 0.19), SY - 0.04, 0], [0, 90, 0]));
      const sus = K.part('suspension', [0, 0, 0], null, 'Suspension at 30°');
      [-1, 1].forEach((s) => K.bar(sus, [s * (TX - 0.19), SY - 0.07, 0], [s * EX, EY, 0], 0.004, K.std(0x222326)));
      const drips = K.part('drips', [0, 0, 0], null, 'Drip lines (stop rain wicking)');
      [-1, 1].forEach((s) => {
        const px = s * (TX - 0.5);
        const py = SY - 0.07 - (TX - 0.19 - (TX - 0.5)) * Math.tan(Math.PI / 6);
        K.bar(drips, [px, py, 0], [px, py - 0.18, 0], 0.003, 'yellow');
      });
      // hammock body: custom surface sagging between the gathered ends
      const hb = K.part('hammockBody', [0, 0, 0], null, 'Gathered-end hammock (11 ft)');
      const T = K.THREE;
      const nu = 40;
      const nv = 12;
      const pos = [];
      const idx = [];
      const sag = EY - SIT;
      for (let i = 0; i <= nu; i++) {
        const u = i / nu;
        const s = Math.sin(Math.PI * u);
        const w = 0.62 * Math.pow(s, 0.7);
        for (let j = 0; j <= nv; j++) {
          const v = (j / nv) * 2 - 1;
          const x = -EX + 2 * EX * u + v * 0.12 * s;
          const y = EY - sag * Math.pow(s, 1.3) + 0.22 * s * v * v - 0.05 * s;
          pos.push(x, y, v * w);
        }
      }
      for (let i = 0; i < nu; i++)
        for (let j = 0; j < nv; j++) {
          const a = i * (nv + 1) + j;
          idx.push(a, a + nv + 1, a + 1, a + 1, a + nv + 1, a + nv + 2);
        }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      const fab = K.std(0xd9792b, { roughness: 0.9, side: T.DoubleSide });
      hb.add(new T.Mesh(g, fab));
      [-1, 1].forEach((s) => K.sph(hb, 0.03, K.std(0x9c5a1f), [s * EX, EY, 0], [1.6, 1, 1]));
      const rl = K.part('ridgeline', [0, 0, 0], null, 'Structural ridgeline (83% of length)');
      K.bar(rl, [-EX, EY, 0], [EX, EY, 0], 0.0025, K.std(0xeeeeee));
      K.box(rl, [0.18, 0.08, 0.04], K.std(0x2a2c30), [0.3, EY - 0.05, 0], null, 0.01); // gear pouch
      const ag = K.part('angleGuide', [TX - 0.19, SY - 0.07, 0.02], null, '30° from horizontal');
      const wedge = [[0, 0]].concat(K.circle(0, 0, 0.6, 16, Math.PI, Math.PI + Math.PI / 6));
      K.ext(ag, wedge, 0.004, K.std(0xffd23a, { transparent: true, opacity: 0.55, emissive: 0xffb000, emissiveIntensity: 0.3 }));
      K.bar(ag, [0, 0, 0.003], [-0.7, 0, 0.003], 0.004, 'white');
      // tarp: ridgeline above + sloped panels + guylines + stakes
      const TY = SY + 0.38;
      const tl = K.part('tarpLines', [0, 0, 0], null, 'Tarp ridgeline + guylines');
      K.bar(tl, [-TX + 0.17, TY, 0], [TX - 0.17, TY, 0], 0.003, 'yellow');
      const tarp = K.part('tarp', [0, 0, 0], null, 'Rain tarp (hex, 12 ft)');
      const tm = K.std(0x42618a, { roughness: 0.8, side: T.DoubleSide });
      [-1, 1].forEach((s) => {
        const pts = [[-1.8, TY], [1.8, TY], [1.5, TY - 0.95], [0, TY - 1.05], [-1.5, TY - 0.95]];
        const tp = new T.BufferGeometry();
        const v3 = pts.map(([x, y]) => [x, y, y === TY ? 0 : s * 1.0]);
        const flat = [];
        [[0, 1, 2], [0, 2, 3], [0, 3, 4]].forEach((tri) => tri.forEach((k) => flat.push(...v3[k])));
        tp.setAttribute('position', new T.Float32BufferAttribute(flat, 3));
        tp.computeVertexNormals();
        tarp.add(new T.Mesh(tp, tm));
        [[1.5, -1.2], [0, -1.3], [-1.5, -1.2]].forEach(([x]) => {
          const cz = s * (x ? 1.0 : 1.0);
          K.bar(tl, [x, TY - (x ? 0.95 : 1.05), cz], [x * 1.1, 0.04, s * 1.8], 0.002, 'yellow');
        });
      });
      const st = K.part('stakes', [0, 0, 0], null, 'Tent stakes');
      [-1, 1].forEach((s) => [1.65, 0, -1.65].forEach((x) => K.bar(st, [x, 0.06, s * 1.8], [x, -0.05, s * 1.75], 0.006, 'chrome')));
      const deadwood = K.part('hazard', [-0.9, 5.6, 0.2], null, 'Dead limb overhead (avoid)');
      K.bar(deadwood, [0, 0, 0], [0.9, 0.3, -0.2], 0.04, K.std(0x8a7a66, { roughness: 1 }));
      K.bar(K.parts.hazard, [0, 0, 0], [-1.3, -0.5, 0], 0.035, K.std(0x8a7a66, { roughness: 1 }));
      return {};
    }
  );

  /* ================= Two-burner camp stove on a picnic table ================= */
  TB.model(
    'campStove',
    V(WOODS, { cam: [0.9, 1.35, 1.1], at: [0.05, 0.85, 0], hidden: ['wind', 'regulator', 'cylinder', 'pot', 'flames', 'soap', 'cleaner', 'cap', 'lighter'] }),
    (K) => {
      const wood = K.pbr('wood_planks', [0.5, 1.5], { color: 0xb08a5c }, 'wood');
      const table = K.part('table', [0, 0, 0], null, 'Picnic table');
      K.rep(5, (i) => K.box(table, [1.8, 0.04, 0.14], wood, [0, 0.74, -0.31 + i * 0.155], null, 0.006));
      [-0.65, 0.65].forEach((x) => {
        K.bar(table, [x, 0.72, -0.3], [x, 0, 0.5], 0.035, wood);
        K.bar(table, [x, 0.72, 0.3], [x, 0, -0.5], 0.035, wood);
        K.box(table, [0.06, 0.06, 1.5], wood, [x, 0.42, 0], null, 0.006);
      });
      [-0.62, 0.62].forEach((z) => K.box(table, [1.8, 0.04, 0.24], wood, [0, 0.44, z], null, 0.006));
      const Y0 = 0.76;
      const green = K.std(0x2c6e3a, { roughness: 0.45, metalness: 0.3 });
      const base = K.part('stove', [0, Y0, 0], null, 'Stove case');
      K.box(base, [0.56, 0.085, 0.32], green, [0, 0.0425, 0], null, 0.008);
      K.box(base, [0.52, 0.004, 0.28], K.std(0x2a2b2d, { metalness: 0.6, roughness: 0.5 }), [0, 0.086, 0], null, 0);
      K.rep(4, (i) => K.box(base, [0.04, 0.01, 0.04], 'rubber', [i % 2 ? 0.24 : -0.24, -0.002, i < 2 ? 0.13 : -0.13], null, 0.003));
      K.box(base, [0.1, 0.006, 0.02], 'chrome', [0, 0.06, 0.163], null, 0.002); // latch
      const burners = K.part('burners', [0, Y0 + 0.088, 0], null, 'Burners (10,000 BTU each)');
      [-0.13, 0.13].forEach((x) => {
        K.cyl(burners, [0.055, 0.06, 0.012, 32], K.std(0x3a3b3d, { metalness: 0.8, roughness: 0.4 }), [x, 0.006, 0]);
        K.cyl(burners, [0.03, 0.03, 0.006, 24], K.std(0x5a5c5f, { metalness: 0.8 }), [x, 0.014, 0]);
        K.rep(20, (i) => K.box(burners, [0.004, 0.002, 0.004], 'black', [x + Math.cos(i * 0.314) * 0.048, 0.013, Math.sin(i * 0.314) * 0.048], null, 0));
      });
      const grate = K.part('grate', [0, Y0 + 0.115, 0], null, 'Pot grate');
      K.rep(9, (i) => K.box(grate, [0.004, 0.006, 0.26], 'chrome', [-0.24 + i * 0.06, 0, 0], null, 0));
      [-0.1, 0, 0.1].forEach((z) => K.box(grate, [0.52, 0.006, 0.004], 'chrome', [0, -0.004, z], null, 0));
      const knobs = K.part('knobs', [0, Y0 + 0.045, 0.165], null, 'Burner valves');
      [-0.13, 0.13].forEach((x) => {
        K.cyl(knobs, [0.022, 0.022, 0.018, 20], 'black', [x, 0, 0.005], [90, 0, 0]);
        K.box(knobs, [0.006, 0.03, 0.006], 'black', [x, 0, 0.014], null, 0);
      });
      const lid = K.part('lid', [0, Y0 + 0.09, -0.16], null, 'Lid + rear wind panel');
      K.box(lid, [0.56, 0.32, 0.018], green, [0, 0.16, -0.009], null, 0.006);
      const wind = K.part('wind', [0, Y0 + 0.09, 0], null, 'Side wind baffles');
      [-1, 1].forEach((s) => K.box(wind, [0.006, 0.16, 0.3], green, [s * 0.285, 0.08, -0.005], null, 0.002));
      const oring = K.part('oring', [0.29, Y0 + 0.045, 0.05], null, 'Regulator inlet + O-ring');
      K.cyl(oring, [0.012, 0.012, 0.012, 20], 'brass', [0, 0, 0], [0, 0, 90]);
      K.tor(oring, [0.012, 0.0025], 'black', [0.006, 0, 0], [0, 90, 0]);
      const reg = K.part('regulator', [0, 0, 0], null, 'Pressure regulator');
      K.cyl(reg, [0.012, 0.012, 0.09, 16], 'brass', [0.33, Y0 + 0.045, 0.05], [0, 0, 90]);
      K.cyl(reg, [0.03, 0.03, 0.04, 20], K.std(0x2a2b2d, { metalness: 0.6 }), [0.36, Y0 + 0.045, 0.05], [0, 0, 90]);
      const cyl = K.part('cylinder', [0, 0, 0], null, '1 lb propane cylinder');
      const cylM = K.std(0x2d6fc7, { metalness: 0.4, roughness: 0.35 });
      K.cyl(cyl, [0.055, 0.055, 0.17, 32], cylM, [0.48, Y0 + 0.058, 0.05], [0, 0, 90]);
      K.sph(cyl, 0.055, cylM, [0.565, Y0 + 0.058, 0.05], [0.35, 1, 1]);
      K.cyl(cyl, [0.02, 0.03, 0.03, 20], 'chrome', [0.385, Y0 + 0.058, 0.05], [0, 0, 90]);
      const cap = K.part('cap', [0.62, Y0 + 0.02, 0.2], null, 'Cylinder cap (keep it)');
      K.cyl(cap, [0.025, 0.025, 0.03, 20], 'black');
      const soap = K.part('soap', [0.38, Y0 + 0.07, 0.05], null, 'Soapy water');
      K.rep(5, (i) => K.sph(soap, 0.008 + (i % 2) * 0.004, K.std(0xffffff, { transparent: true, opacity: 0.55 }), [-0.04 + i * 0.02, 0, 0.02]));
      const fl = K.part('flames', [0, Y0 + 0.1, 0], null, 'Blue flame ring');
      const cones = [];
      const blue = K.std(0x4f8dff, { emissive: 0x2a6aff, emissiveIntensity: 1.3, transparent: true, opacity: 0.85 });
      [-0.13, 0.13].forEach((x) => K.rep(18, (i) => {
        const a = i * 0.349;
        cones.push(K.cone(fl, [0.005, 0.025, 8], blue, [x + Math.cos(a) * 0.048, 0.006, Math.sin(a) * 0.048], [Math.sin(a) * 25, 0, -Math.cos(a) * 25]));
      }));
      const pot = K.part('pot', [-0.13, Y0 + 0.12, 0], null, 'Pot (fits the grate)');
      K.cyl(pot, [0.1, 0.095, 0.14, 32], K.std(0x9aa0a6, { metalness: 0.9, roughness: 0.3 }), [0, 0.07, 0]);
      K.cyl(pot, [0.102, 0.102, 0.01, 32], 'black', [0, 0.145, 0]);
      K.bar(pot, [0.1, 0.11, 0], [0.22, 0.12, 0], 0.008, 'black');
      const cl = K.part('cleaner', [0.13, Y0 + 0.03, 0.15], null, 'Pipe cleaner (burner jet + tube)');
      K.tube(cl, [[0, 0, 0], [0.02, 0.04, 0.05], [0.05, 0.05, 0.1]], 0.003, K.std(0xf1f1f1, { roughness: 1 }));
      const lt = K.part('lighter', [-0.08, Y0 + 0.12, 0.08], null, 'Long lighter');
      K.box(lt, [0.2, 0.015, 0.02], 'red', [0.08, 0, 0], [0, 25, 0], 0.004);
      K.bar(lt, [0, 0, 0], [-0.04, -0.01, 0.02], 0.004, 'chrome');
      return {
        tick(t) {
          cones.forEach((c, i) => c.scale.set(1, 0.8 + 0.3 * Math.sin(t * 14 + i), 1));
        },
      };
    }
  );

  /* ================= Laptop, upside down on a desk, bottom cover off ================= */
  TB.model(
    'laptop',
    V(DESK, { cam: [0.32, 1.12, 0.42], at: [0, 0.77, 0], hidden: ['air', 'pick', 'newSsd', 'newRam', 'enclosure', 'paste'] }),
    (K) => {
      const desk = K.part('desk', [0, 0, 0], null, 'Desk');
      K.box(desk, [1.3, 0.035, 0.7], K.pbr('oak_wood_planks', [1, 1], {}, 'woodLight'), [0, 0.7325, 0], null, 0.006);
      [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]].forEach(([x, z]) => K.box(desk, [0.04, 0.715, 0.04], 'black', [x, 0.3575, z], null, 0.005));
      K.box(desk, [0.5, 0.003, 0.36], K.std(0x3a4a5c, { roughness: 1 }), [0, 0.7515, 0], null, 0); // soft mat
      const Y = 0.753;
      const alu = K.std(0x9ea4aa, { metalness: 0.85, roughness: 0.35 });
      const lw = 0.357;
      const ld = 0.245;
      const shell = K.part('chassis', [0, 0, 0], null, 'Laptop (upside down)');
      K.box(shell, [lw, 0.006, ld], alu, [0, Y + 0.003, 0], null, 0.004); // lid (display down)
      K.box(shell, [lw, 0.002, ld], K.std(0x23262a, { roughness: 0.5 }), [0, Y + 0.007, 0], null, 0); // keyboard deck
      K.box(shell, [lw, 0.012, 0.003], alu, [0, Y + 0.013, ld / 2 - 0.0015], null, 0);
      K.box(shell, [lw, 0.012, 0.003], alu, [0, Y + 0.013, -ld / 2 + 0.0015], null, 0);
      K.box(shell, [0.003, 0.012, ld], alu, [lw / 2 - 0.0015, Y + 0.013, 0], null, 0);
      K.box(shell, [0.003, 0.012, ld], alu, [-lw / 2 + 0.0015, Y + 0.013, 0], null, 0);
      K.rep(2, (i) => K.box(shell, [0.06, 0.012, 0.012], 'black', [i ? 0.12 : -0.12, Y + 0.012, -ld / 2 - 0.004], null, 0.003)); // hinges
      const IY = Y + 0.009; // inside floor
      const mb = K.part('motherboard', [0, IY, -0.055], null, 'Motherboard');
      K.box(mb, [0.33, 0.0016, 0.115], K.std(0x1f4a35, { roughness: 0.6 }), [0, 0.0008, 0], null, 0);
      K.rep(6, (i) => K.box(mb, [0.008, 0.002, 0.006], 'black', [-0.15 + i * 0.012, 0.002, 0.045], null, 0));
      const bat = K.part('battery', [0, IY, 0.065], null, 'Battery');
      K.box(bat, [0.27, 0.006, 0.09], K.std(0x2a2d31, { roughness: 0.5 }), [0, 0.003, 0], null, 0.002);
      K.box(bat, [0.08, 0.0005, 0.04], K.std(0xf1f1f1), [0.06, 0.0063, 0], null, 0);
      const bc = K.part('batConn', [0.03, IY + 0.003, 0.017], null, 'Battery connector');
      K.box(bc, [0.022, 0.004, 0.008], 'offwhite', [0, 0, 0], null, 0.001);
      K.tube(bc, [[-0.008, 0.001, 0.003], [-0.006, 0.001, 0.008], [-0.004, 0.002, 0.012]], 0.0012, 'black');
      K.tube(bc, [[0.008, 0.001, 0.003], [0.006, 0.001, 0.008], [0.004, 0.002, 0.012]], 0.0012, 'red');
      // cooling: two blower fans, heat pipes, fin stacks at the rear vents
      const blades = [];
      const fans = K.part('fans', [0, 0, 0], null, 'Blower fans (2)');
      [-0.11, 0.11].forEach((x) => {
        K.cyl(fans, [0.036, 0.036, 0.0015, 32], K.std(0x1a1b1d, { roughness: 0.5 }), [x, IY + 0.002, -0.06]);
        K.tor(fans, [0.037, 0.0025, 290], K.std(0x1a1b1d), [x, IY + 0.006, -0.06], [90, 0, x > 0 ? 200 : -20]);
        const b = K.group(fans, [x, IY + 0.006, -0.06]);
        K.cyl(b, [0.012, 0.012, 0.007, 20], 'black');
        K.rep(24, (i) => K.box(b, [0.019, 0.006, 0.0012], K.std(0x2a2b2e), [Math.cos(i * 0.2618) * 0.022, 0, Math.sin(i * 0.2618) * 0.022], [0, -i * 15 - 20, 0], 0));
        blades.push(b);
      });
      const fins = K.part('fins', [0, 0, 0], null, 'Heatsink fins (rear vents)');
      const finM = K.std(0xc77b4a, { metalness: 0.85, roughness: 0.35 });
      [-0.11, 0.11].forEach((x) => K.rep(20, (i) => K.box(fins, [0.0006, 0.008, 0.016], finM, [x - 0.032 + i * 0.0034, IY + 0.005, -0.108], null, 0)));
      const hp = K.part('heatpipe', [0, 0, 0], null, 'Copper heat pipes');
      const cu = K.std(0xc8794a, { metalness: 0.9, roughness: 0.3 });
      K.box(hp, [0.05, 0.003, 0.04], cu, [0, IY + 0.004, -0.03], null, 0.001);
      K.tube(hp, [[0, IY + 0.006, -0.03], [-0.05, IY + 0.007, -0.06], [-0.1, IY + 0.007, -0.1], [-0.13, IY + 0.007, -0.1]], 0.003, cu);
      K.tube(hp, [[0, IY + 0.006, -0.03], [0.05, IY + 0.007, -0.06], [0.1, IY + 0.007, -0.1], [0.13, IY + 0.007, -0.1]], 0.003, cu);
      const paste = K.part('paste', [0, IY + 0.0065, -0.03], null, 'Fresh thermal paste');
      K.cyl(paste, [0.007, 0.007, 0.001, 16], K.std(0x9aa0a6, { roughness: 0.5 }));
      const dust = K.part('dust', [0, 0, 0], null, 'Dust mat on the fins');
      const dm = K.std(0x9b9389, { transparent: true, opacity: 0.85, roughness: 1 });
      [-0.11, 0.11].forEach((x) => {
        K.box(dust, [0.07, 0.003, 0.006], dm, [x, IY + 0.01, -0.099], null, 0);
        K.sph(dust, 0.018, dm, [x + 0.01, IY + 0.007, -0.05], [1.2, 0.15, 0.8]);
      });
      // memory and storage
      const slot = K.part('ramSlot', [0.07, IY + 0.002, 0.0], null, 'SO-DIMM slot + latches');
      K.box(slot, [0.072, 0.004, 0.006], 'black', [0, 0.002, -0.017], null, 0.001);
      K.box(slot, [0.004, 0.006, 0.03], K.std(0xd8dde2, { metalness: 0.9 }), [-0.037, 0.003, 0], null, 0.0008);
      K.box(slot, [0.004, 0.006, 0.03], K.std(0xd8dde2, { metalness: 0.9 }), [0.037, 0.003, 0], null, 0.0008);
      const dimm = (name, label, pcb) => {
        const p = K.part(name, [0.07, IY + 0.0055, 0.0], null, label);
        K.box(p, [0.0676, 0.001, 0.03], K.std(pcb, { roughness: 0.6 }), [0, 0, 0], null, 0);
        K.rep(4, (i) => K.box(p, [0.011, 0.0012, 0.009], 'black', [-0.024 + i * 0.016, 0.001, 0.003], null, 0));
        K.box(p, [0.064, 0.0011, 0.003], 'brass', [0, 0, -0.0135], null, 0);
        return p;
      };
      dimm('ram', 'RAM module (8 GB)', 0x245a3c);
      dimm('newRam', 'New RAM (32 GB kit)', 0x1c2f6a);
      const m2 = (name, label, col) => {
        const p = K.part(name, [-0.07, IY + 0.0035, 0.004], null, label);
        K.box(p, [0.08, 0.0009, 0.022], K.std(col, { roughness: 0.5 }), [0, 0, 0], null, 0);
        K.box(p, [0.024, 0.0012, 0.016], 'black', [0.01, 0.001, 0], null, 0);
        K.box(p, [0.012, 0.0012, 0.012], 'black', [-0.02, 0.001, 0], null, 0);
        K.box(p, [0.04, 0.0003, 0.018], K.std(0xf4f4f4), [0.0, 0.0018, 0], null, 0);
        K.box(p, [0.004, 0.001, 0.02], 'brass', [0.04, 0, 0], null, 0);
        return p;
      };
      m2('ssd', 'Old SSD (M.2 2280, 256 GB)', 0x1b4a2c);
      m2('newSsd', 'New NVMe SSD (2 TB)', 0x111316);
      const ms = K.part('m2Slot', [-0.112, IY + 0.002, 0.004], null, 'M.2 slot');
      K.box(ms, [0.006, 0.004, 0.024], 'black', [0, 0.001, 0], null, 0.001);
      const sc = K.part('ssdScrew', [-0.029, IY + 0.004, 0.004], null, 'M.2 retaining screw');
      K.screw(sc, 0.0025, 0.003, 'chrome', [0, 0.0015, 0]);
      // bottom cover with screws
      const bp = K.part('bottomPanel', [0, Y + 0.0205, 0], null, 'Bottom cover');
      K.box(bp, [lw, 0.0015, ld], alu, [0, 0, 0], null, 0);
      K.rep(2, (i) => K.box(bp, [0.3, 0.004, 0.01], 'rubber', [0, 0.002, i ? 0.1 : -0.1], null, 0.002));
      [-0.11, 0.11].forEach((x) => K.rep(12, (i) => K.box(bp, [0.003, 0.0005, 0.03], 'black', [x - 0.033 + i * 0.006, 0.0008, -0.04], null, 0)));
      const screws = K.part('screws', [0, Y + 0.0215, 0], null, 'Bottom screws (10, mixed lengths)');
      [[-0.17, -0.115], [-0.06, -0.115], [0.06, -0.115], [0.17, -0.115], [-0.17, 0], [0.17, 0], [-0.17, 0.115], [-0.06, 0.115], [0.06, 0.115], [0.17, 0.115]].forEach(([x, z]) =>
        K.screw(screws, 0.004, 0.004, 'black', [x, 0.0012, z])
      );
      // helpers
      const air = K.part('air', [-0.14, Y + 0.12, -0.02], null, 'Compressed air (upright, short bursts)');
      K.cyl(air, [0.033, 0.033, 0.18, 24], K.std(0x3a8ad8, { roughness: 0.4 }), [0, 0.09, 0]);
      K.box(air, [0.03, 0.025, 0.04], 'black', [0, 0.19, 0.01], null, 0.004);
      K.bar(air, [0, 0.19, 0.03], [0.03, 0.12, 0.09], 0.0015, 'red');
      const pick = K.part('pick', [0.18, Y + 0.02, 0.12], null, 'Plastic opening pick');
      K.ext(pick, [[0, 0], [0.03, 0], [0, 0.03]], 0.0006, K.std(0x3a7bd5, { transparent: true, opacity: 0.85 }), [0, 0, 0], [90, 0, 0]);
      const enc = K.part('enclosure', [0.33, Y + 0.008, 0.08], null, 'USB M.2 enclosure (for cloning)');
      K.box(enc, [0.1, 0.012, 0.032], K.std(0x60666c, { metalness: 0.8, roughness: 0.35 }), [0, 0, 0], null, 0.003);
      K.tube(enc, [[-0.05, 0, 0], [-0.1, 0.002, 0.03], [-0.15, 0.004, 0.06], [-0.1785, 0.012, 0.06]], 0.002, 'black');
      return {
        tick(t, fx) {
          blades.forEach((b) => (b.rotation.y = fx === 'run' ? -t * 25 : 0));
        },
      };
    }
  );

  /* ================= Single-story house, walls cut away: mesh Wi-Fi ================= */
  const MESH_AO = ['aoOutdoor', 'aoUps', 'aoSwitch', 'aoCam'];
  TB.model(
    'meshHome',
    V(DESK, {
      env: 'garden', cam: [7.5, 10.5, 10.5], at: [0, 0, 0.3], tex: ['plank_flooring', 'interlocking_concrete_pavers', 'aerial_grass_rock'],
      ground: { tex: 'aerial_grass_rock', repeat: 12, radius: 14 },
      hidden: ['mainNode', 'node2', 'node3', 'ethCable', 'covMain', 'cov2', 'cov3', 'phone', 'deadZone'].concat(MESH_AO),
    }),
    (K) => {
      const H = 1.0; // cut-away wall height
      const floor = K.pbr('plank_flooring', [6, 4], {}, 'woodLight');
      const house = K.part('house', [0, 0, 0], null, 'House (walls cut away)');
      K.box(house, [12, 0.12, 9], floor, [0, 0.06, 0], null, 0);
      const wall = K.std(0xeeebe5, { roughness: 0.92 });
      const ext = K.std(0xc9c2b4, { roughness: 0.9 });
      const W = (x1, z1, x2, z2, m) => {
        const L = Math.hypot(x2 - x1, z2 - z1);
        K.box(house, [x1 === x2 ? 0.12 : L, H, x1 === x2 ? L : 0.12], m || wall, [(x1 + x2) / 2, 0.12 + H / 2, (z1 + z2) / 2], null, 0.01);
      };
      W(-6, -4.5, 6, -4.5, ext); W(-6, 4.5, -1.4, 4.5, ext); W(-0.4, 4.5, 6, 4.5, ext); W(-6, -4.5, -6, 4.5, ext); W(6, -4.5, 6, 4.5, ext);
      W(-2, 1.2, -2, 4.5); W(-6, 1.2, -3.0, 1.2); W(-2.0, 1.2, -2.2, 1.2); W(2, -4.5, 2, -1.2); W(2, -0.2, 2, 4.5); W(-6, -1.0, -2.8, -1.0); W(-1.8, -1.0, -1.6, -1.0);
      W(2, 0.8, 6, 0.8); W(-2, -4.5, -2, -1.0);
      const pat = K.part('patio', [0, 0, -6.0], null, 'Back patio (dead zone)');
      K.box(pat, [5, 0.06, 2.8], K.pbr('interlocking_concrete_pavers', [3, 2], {}, 'concrete'), [3, 0.03, 0], null, 0);
      K.box(pat, [0.9, 0.45, 0.9], 'wood', [2.5, 0.25, 0.1], null, 0.02);
      // furniture
      const f = K.part('furniture', [0, 0.12, 0], null, 'Furniture');
      K.box(f, [2.2, 0.8, 0.9], K.std(0x6a7f99, { roughness: 1 }), [-0.2, 0.4, -3.6], null, 0.06); // sofa
      K.box(f, [1.5, 0.6, 0.06], 'black', [-0.2, 0.6, 0.6], null, 0.01); // TV
      K.box(f, [1.6, 0.5, 0.4], 'woodDark', [-0.2, 0.25, 0.8], null, 0.02);
      K.box(f, [1.6, 0.55, 2.0], K.std(0xe9e2d4, { roughness: 1 }), [4.3, 0.28, -3.2], null, 0.06); // bed back
      K.box(f, [1.6, 0.55, 2.0], K.std(0xe9e2d4, { roughness: 1 }), [4.3, 0.28, 2.8], null, 0.06);
      K.box(f, [1.4, 0.75, 0.7], 'woodLight', [-4.6, 0.375, 3.6], null, 0.02); // office desk
      K.box(f, [3.6, 0.9, 0.62], 'offwhite', [-4.0, 0.45, -4.1], null, 0.02); // kitchen
      K.box(f, [1.6, 0.9, 0.9], 'offwhite', [-4.0, 0.45, -2.4], null, 0.02);
      const modem = K.part('modem', [-4.9, 0.87, 3.7], null, 'Modem / ISP gateway');
      K.box(modem, [0.06, 0.25, 0.2], 'white', [0, 0.125, 0], null, 0.01);
      K.sph(modem, 0.01, 'ledG', [0.032, 0.2, 0.06]);
      const old = K.part('oldRouter', [-4.5, 0.87, 3.6], null, 'Old router');
      K.box(old, [0.3, 0.05, 0.2], 'black', [0, 0.025, 0], null, 0.01);
      K.rep(3, (i) => K.box(old, [0.012, 0.18, 0.012], 'black', [-0.1 + i * 0.1, 0.13, -0.08], null, 0.003));
      const node = (name, label, p) => {
        const g = K.part(name, p, null, label);
        K.cyl(g, [0.06, 0.065, 0.2, 32], 'white', [0, 0.1, 0]);
        K.cyl(g, [0.045, 0.045, 0.004, 24], K.std(0x5ab0ff, { emissive: 0x2a8cff, emissiveIntensity: 1.2 }), [0, 0.202, 0]);
        return g;
      };
      node('mainNode', 'Main mesh node (router)', [-4.15, 0.87, 3.45]);
      node('node2', 'Satellite 1 (hallway, halfway)', [0.2, 0.62, 0.8]);
      node('node3', 'Satellite 2 (back bedroom)', [3.3, 0.12, -0.6]);
      const eth = K.part('ethCable', [0, 0, 0], null, 'Ethernet backhaul (optional)');
      K.tube(eth, [[-4.3, 0.9, 3.6], [-4.3, 0.14, 3.0], [-2.1, 0.14, 1.3], [0.2, 0.14, 1.0], [0.2, 0.62, 0.8]], 0.025, 'blue');
      const ringsets = [];
      const cov = (name, label, p, r, c) => {
        const g = K.part(name, p, null, label);
        const m = K.std(c, { transparent: true, opacity: 0.45, emissive: c, emissiveIntensity: 0.6 });
        const rs = [0, 1, 2].map(() => K.tor(g, [1, 0.03], m, [0, 0.3, 0], [90, 0, 0]));
        K.cyl(g, [r, r, 0.01, 48], K.std(c, { transparent: true, opacity: 0.12 }), [0, 0.06, 0]);
        ringsets.push({ rs, r });
        return g;
      };
      cov('covMain', 'Coverage: main node', [-4.3, 0.2, 3.6], 4.2, 0x3a8ad8);
      cov('cov2', 'Coverage: satellite 1', [0.2, 0.2, 0.8], 4.2, 0x3ac0a8);
      cov('cov3', 'Coverage: satellite 2', [3.3, 0.2, -0.6], 4.6, 0x7a6ad8);
      const dz = K.part('deadZone', [3.8, 0.15, -4.2], null, 'Dead zone: back bedroom + patio');
      K.cyl(dz, [2.4, 2.4, 0.02, 40], K.std(0xe0483a, { transparent: true, opacity: 0.35, emissive: 0xe0483a, emissiveIntensity: 0.4 }));
      const phone = K.part('phone', [2.5, 0.52, -5.9], null, 'Phone running a speed test');
      K.box(phone, [0.08, 0.16, 0.012], 'black', [0, 0.08, 0], [-60, 0, 0], 0.006);
      K.box(phone, [0.07, 0.14, 0.002], 'screen', [0, 0.085, 0.006], [-60, 0, 0], 0);
      // add-ons
      const out = node('aoOutdoor', 'Outdoor-rated mesh node', [4.0, 1.4, -4.62]);
      K.box(out, [0.18, 0.06, 0.06], 'grey', [0, 0.1, 0.06], null, 0.01);
      const ups = K.part('aoUps', [-4.0, 0.12, 3.75], null, 'UPS battery backup');
      K.box(ups, [0.12, 0.3, 0.32], 'black', [0, 0.15, 0], null, 0.01);
      K.box(ups, [0.002, 0.04, 0.08], 'screen', [0.061, 0.24, 0], null, 0);
      const sw = K.part('aoSwitch', [0.4, 0.62, 0.8], null, 'Gigabit switch at the TV');
      K.box(sw, [0.18, 0.03, 0.1], 'grey', [0, 0.015, 0], null, 0.004);
      K.rep(5, (i) => K.box(sw, [0.004, 0.006, 0.002], 'ledG', [-0.06 + i * 0.025, 0.02, 0.051], null, 0));
      const cam = K.part('aoCam', [6.08, 2.0, -4.4], null, 'Wi-Fi security camera');
      K.box(cam, [0.06, 0.06, 0.06], 'white', [0, 0, 0], null, 0.01);
      K.cyl(cam, [0.035, 0.035, 0.1, 20], 'white', [0.06, -0.03, 0.05], [0, 45, 70]);
      return {
        tick(t, fx) {
          ringsets.forEach(({ rs, r }, k) =>
            rs.forEach((ring, i) => {
              const s = 0.3 + (((t * 0.35 + i / 3 + k * 0.1) % 1) * (r - 0.3));
              ring.scale.set(s, s, s);
            })
          );
          if (K.parts.deadZone) K.parts.deadZone.children[0].material.emissiveIntensity = fx === 'dead' ? 0.6 + 0.4 * Math.sin(t * 4) : 0.4;
        },
      };
    }
  );

  /* ================= Interior wall: Cat6 drop to a keystone wall jack ================= */
  TB.model(
    'ethJack',
    V(DESK, { cam: [1.1, 1.0, 1.7], at: [0.1, 0.55, 0], hidden: ['outline', 'finder', 'jabSaw', 'fishTape', 'cable', 'slack', 'bracket', 'jack', 'punch', 'plate', 'patch', 'tester', 'plateHole'] }),
    (K) => {
      const t = 0.0127;
      const JX = 0.2;
      const JY = 0.4;
      const ow = 0.057;
      const oh = 0.095;
      const dw = K.std(0xeeebe5, { roughness: 0.92 });
      const wall = K.part('wall', [0, 0, 0], null, 'Drywall');
      const hole = [[JX - ow / 2, JY - oh / 2], [JX + ow / 2, JY - oh / 2], [JX + ow / 2, JY + oh / 2], [JX - ow / 2, JY + oh / 2]].reverse();
      K.ext(wall, [[-1.2, 0], [1.2, 0], [1.2, 2.44], [-1.2, 2.44]], t, dw, [0, 0, -t], null, 0, [hole]);
      K.box(wall, [2.4, 0.09, 0.012], 'offwhite', [0, 0.045, 0.006], null, 0.003);
      const patch = K.part('patchPiece', [JX, JY, -t / 2], null, 'Drywall (cut here)');
      K.box(patch, [ow, oh, t], dw, [0, 0, 0], null, 0);
      const studs = K.part('studs', [0, 0, 0], null, 'Studs (16″ o.c.)');
      const pine = K.std(0xdcbc8c, { roughness: 0.8 });
      [-0.813, -0.406, 0, 0.406, 0.813].forEach((x) => K.box(studs, [0.038, 2.36, 0.089], pine, [x, 1.22, -t - 0.0445], null, 0.002));
      K.box(studs, [2.4, 0.038, 0.089], pine, [0, 0.019, -t - 0.0445], null, 0.002);
      const plates = K.part('topPlate', [0, 0, 0], null, 'Double top plate');
      K.box(plates, [2.4, 0.076, 0.089], pine, [0, 2.402, -t - 0.0445], null, 0.002);
      const ph = K.part('plateHole', [JX, 2.442, -t - 0.0445], null, '¾″ hole through the top plate');
      K.cyl(ph, [0.0095, 0.0095, 0.003, 16], 'black');
      const outline = K.part('outline', [JX, JY, 0.0005], null, 'Traced outline (level)');
      const pen = K.std(0x333333);
      K.box(outline, [ow, 0.0015, 0.001], pen, [0, oh / 2, 0], null, 0);
      K.box(outline, [ow, 0.0015, 0.001], pen, [0, -oh / 2, 0], null, 0);
      K.box(outline, [0.0015, oh, 0.001], pen, [ow / 2, 0, 0], null, 0);
      K.box(outline, [0.0015, oh, 0.001], pen, [-ow / 2, 0, 0], null, 0);
      const finder = K.part('finder', [-0.0, 0.5, 0.02], null, 'Stud finder');
      K.box(finder, [0.07, 0.15, 0.035], K.std(0xf2c230, { roughness: 0.5 }), [0, 0, 0], null, 0.01);
      K.box(finder, [0.04, 0.03, 0.002], 'screen', [0, 0.03, 0.018], null, 0);
      const saw = K.part('jabSaw', [JX - 0.02, JY + 0.03, 0.0], null, 'Jab saw');
      K.box(saw, [0.004, 0.12, 0.012], 'steel', [0, -0.03, -0.0], [0, 0, 20], 0);
      K.box(saw, [0.03, 0.13, 0.03], 'gripYellow', [0.04, 0.09, 0.03], [0, 0, 20], 0.008);
      const fish = K.part('fishTape', [0, 0, 0], null, 'Fish tape');
      K.tube(fish, [[JX, 2.7, -t - 0.045], [JX, 2.44, -t - 0.045], [JX + 0.01, 1.2, -t - 0.05], [JX, JY + 0.02, -t - 0.03], [JX, JY, 0.02]], 0.002, 'steel');
      K.cyl(fish, [0.14, 0.14, 0.04, 32], K.std(0xf2c230), [JX, 2.85, -0.1], [90, 0, 0]);
      const cable = K.part('cable', [0, 0, 0], null, 'Cat6 cable (in the stud bay)');
      const blueJ = K.std(0x2f7fd0, { roughness: 0.6 });
      K.tube(cable, [[JX, 2.75, -t - 0.045], [JX, 2.44, -t - 0.045], [JX - 0.02, 1.2, -t - 0.06], [JX, JY + 0.06, -t - 0.04], [JX, JY, -t - 0.01]], 0.003, blueJ);
      const slack = K.part('slack', [0, 0, 0], null, '12″ of slack, labeled');
      K.tube(slack, [[JX, JY, -t - 0.01], [JX, JY, 0.03], [JX + 0.05, JY - 0.1, 0.12], [JX + 0.02, JY - 0.2, 0.14]], 0.003, blueJ);
      K.box(slack, [0.012, 0.025, 0.012], 'white', [JX + 0.05, JY - 0.1, 0.12], null, 0.002);
      const br = K.part('bracket', [JX, JY, 0], null, 'Low-voltage old-work bracket');
      const lv = K.std(0x1d1f22, { roughness: 0.6 });
      K.ext(br, [[-0.036, -0.059], [0.036, -0.059], [0.036, 0.059], [-0.036, 0.059]], 0.002, lv, [0, 0, 0], null, 0, [[[-ow / 2, -oh / 2], [ow / 2, -oh / 2], [ow / 2, oh / 2], [-ow / 2, oh / 2]].reverse()]);
      [-1, 1].forEach((s) => K.box(br, [0.02, 0.012, 0.005], lv, [s * 0.03, s * 0.035, -t - 0.004], null, 0.001));
      const jack = K.part('jack', [JX, JY, 0.004], null, 'Cat6 keystone jack (T568B)');
      K.box(jack, [0.0165, 0.021, 0.03], K.std(0xf7f7f4, { roughness: 0.4 }), [0, 0, -0.012], null, 0.002);
      K.box(jack, [0.012, 0.009, 0.004], 'black', [0, -0.002, 0.0035], null, 0.001);
      const cols = [0xf0a060, 0xe8742a, 0x9fe0a0, 0x2f7fd0, 0xa8c8f0, 0x3fa04a, 0xc8a080, 0x6b4a2a];
      cols.forEach((c, i) => K.box(jack, [0.0016, 0.0016, 0.006], K.std(c), [-0.006 + (i % 4) * 0.004, i < 4 ? 0.006 : -0.006, -0.03], null, 0));
      K.tube(jack, [[0, 0, -0.03], [0, 0, -0.06], [0, -0.01, -0.09]], 0.003, blueJ);
      const punch = K.part('punch', [JX + 0.02, JY + 0.05, 0.08], null, '110 punch-down tool');
      K.cyl(punch, [0.015, 0.015, 0.12, 16], 'gripYellow', [0, 0.07, 0]);
      K.bar(punch, [0, 0.01, 0], [0, -0.03, 0], 0.003, 'steel');
      const plate = K.part('plate', [JX, JY, 0.003], null, '1-port wall plate');
      K.ext(plate, [[-0.035, -0.057], [0.035, -0.057], [0.035, 0.057], [-0.035, 0.057]], 0.005, K.std(0xf4f2ec, { roughness: 0.4 }), [0, 0, 0], null, 0.0015, [[[-0.0085, -0.011], [0.0085, -0.011], [0.0085, 0.011], [-0.0085, 0.011]].reverse()]);
      const pc = K.part('patch', [0, 0, 0], null, 'Patch cord to your PC/TV');
      K.tube(pc, [[JX, JY, 0.015], [JX, JY - 0.05, 0.05], [JX + 0.2, 0.05, 0.25], [JX + 0.6, 0.02, 0.4]], 0.003, K.std(0x7a7f86));
      K.box(pc, [0.012, 0.009, 0.022], K.std(0xdfe8ef, { transparent: true, opacity: 0.8 }), [JX, JY - 0.002, 0.016], null, 0.002);
      const tester = K.part('tester', [JX + 0.15, 0.08, 0.3], null, 'Cable tester (all 8 lights in order)');
      K.box(tester, [0.08, 0.03, 0.14], K.std(0xf2c230, { roughness: 0.5 }), [0, 0.015, 0], null, 0.006);
      const tl = [];
      K.rep(8, (i) => tl.push(K.box(tester, [0.006, 0.003, 0.006], K.std(0x2a2a2a, { emissive: 0x2fcf55, emissiveIntensity: 0 }), [0.025, 0.031, -0.05 + i * 0.012], null, 0)));
      return {
        tick(tt, fx) {
          tl.forEach((l, i) => (l.material.emissiveIntensity = fx === 'test' && Math.floor(tt * 3) % 8 === i ? 2 : 0.0));
        },
      };
    }
  );

  /* ======================================================================
     BASKETBALL: portable-hoop variants + two new guides
     ====================================================================== */
  const LOWER = (d) => ({ board: [0, d, 0], rim: [0, d, 0], netHooks: [0, d, 0], net: [0, d, 0], newNet: [0, d, 0], rimBolts: [0, d, 0], arms: [0, d, 0], upperPole: [0, d, 0] });
  const PORT_SAFE = 'Never lower or raise a portable hoop while anyone is hanging on it, and keep hands out of the lift arms.';

  const net = TB.repair('basketball', 'hoop-net');
  net.variants = [
    { id: 'inground', name: 'In-ground hoop', blurb: 'Pole set in concrete with a crank or lever height adjuster.' },
    {
      id: 'portable',
      name: 'Portable hoop',
      blurb: 'Water- or sand-filled base on wheels, telescoping pole with a lift handle.',
      model: 'hoopPortable',
      time: '20–30 min',
      summary: 'Drop the board to its lowest (often 7½′) setting with the lift handle so the rim is at shoulder height, cut off the old net, and loop the new one onto all 12 hooks.',
      intro: { hi: ['net', 'tear'] },
      safety: ['Never lower or raise a portable hoop while anyone is hanging on it, and keep hands out of the lift arms; they close like scissors.', 'If your model has no height adjuster, use a stepladder on flat pavement on the court side, never standing on the base.', 'Make sure the base is filled before you work on it; an empty base can tip when you pull on the rim.'],
      tools: ['Replacement net (12-loop, all-weather nylon or poly)', 'Scissors or snips', 'Flat screwdriver (opens pinched hooks)', 'Stepladder (fixed-height hoops only)', 'Work gloves'],
      steps: [
        { t: 'Lower the board', d: 'Grip the lift handle with both hands, take the weight, release the lock (squeeze the trigger or pull the knob) and lower the board to the lowest mark. Let the handle lock into place.', why: 'At 7½′ the rim is at chest-to-shoulder height for most adults, so you can work without a ladder.', tip: 'The handle is spring-assisted, so it may push up as you release it. Keep a firm grip until it clicks into the next notch.', ok: 'You hear the lock click and the board stays put when you let go of the handle.', v: { cam: [2.4, 1.8, 2.6], at: [0, 1.7, -0.6], hi: ['lift'], mv: LOWER(-0.76) } },
        { t: 'Cut off the old net', d: 'Snip each old loop at the hook and pull the pieces off. Look at each hook as you go for breaks or sharp burrs.', why: 'Sun-rotted nylon is brittle and tangled; cutting is faster and won’t bend the hooks.', tip: 'Drop the scraps straight into a bag. Loose net bits blow into the grass and get tangled in the mower.', ok: 'All 12 hooks are bare and none are snapped off.', v: { cam: [1.1, 2.3, 1.6], at: [0, 2.15, 0.37], hi: ['net', 'netHooks'], mv: { net: [0.8, -2.0, 0.8] }, tool: { id: 'pliers', at: [0.2, 2.27, 0.48], rot: [0, 0, -90], anim: 'squeeze' } } },
        { t: 'Open any pinched hooks', d: 'If a hook is squeezed shut, slide a flat screwdriver into the gap and twist gently to open it just enough for a loop to pass.', why: 'Hooks get pinched when nets are yanked off. A loop forced through a closed hook frays fast.', tip: 'Open it only a little, about the thickness of the net cord. Too wide and the loop can slip off during play; close it back with pliers if you overdo it.', ok: 'Every hook has a small, even gap you could slip the net cord through.', v: { cam: [0.9, 2.35, 1.3], at: [0, 2.27, 0.37], hi: ['netHooks'], hide: ['net'], tool: { id: 'flatScrewdriver', at: [0.22, 2.27, 0.45], rot: [0, 0, -40] } } },
        { t: 'Hook the loops', d: 'Push each top loop up through a hook from inside the rim and pull it back down over the hook’s tip. Go around in order until all 12 are on.', why: 'Looping it over the hook tip locks the net on; skipping one makes it hang crooked.', tip: 'Hang the first loop at the front of the rim, facing you, then work left. Counting to 12 at the end tells you instantly if one was missed.', ok: 'From below, the net hangs straight and even, and a hard tug on any loop doesn’t pull it off.', v: { cam: [1.2, 2.2, 1.7], at: [0, 2.1, 0.37], hi: ['newNet', 'netHooks'], show: ['newNet'] } },
        { t: 'Raise and shoot', d: 'Lift the board back to 10′ (the handle clicks at each height setting) and take a few shots.', why: 'A few made shots settle the loops evenly on the hooks.', tip: 'Check the height sticker or measure from the pavement to the top of the rim; the 10′ mark on some models reads a bit off once the base settles.', ok: 'The lock clicks at 10′, and the ball drops cleanly through the net.', v: { cam: [5.6, 2.6, 5.4], at: [0, 1.75, -0.4], hi: ['newNet', 'lift'], mv: LOWER(0), fx: 'bounce' } },
      ],
    },
  ];

  const rimg = TB.repair('basketball', 'hoop-rim');
  rimg.variants = [
    { id: 'inground', name: 'In-ground hoop', blurb: 'Pole set in concrete or bolted to an anchor kit.' },
    {
      id: 'portable',
      name: 'Portable hoop',
      blurb: 'Wobble usually comes from the pole joints, the base bracket, or a base that’s lost water.',
      model: 'hoopPortable',
      time: '30–60 min',
      cost: '$0–40',
      summary: 'A portable hoop flexes at four places: the rim bolts, the lift-arm pivots, the bolted pole sections and the base bracket. Tighten each, then top off the base, because a half-empty base lets the whole thing rock.',
      intro: { hi: ['rimBolts', 'poleBolts', 'baseBolts'] },
      safety: ['Never lower or raise a portable hoop while anyone is hanging on it, and keep hands out of the lift arms.', 'Work with the board lowered. Don’t climb the base or pole.', 'A portable hoop must never be used with an unfilled base. It can tip with one dunk.', 'Snug bolts evenly; overtightening cracks plastic backboards and crushes thin-wall pole tubing.'],
      causes: [['Loose pole-section bolts', 'The sections slip-fit and rock once their bolts back off.'], ['Low base fill', 'Water evaporates or leaks out through a loose cap or a crack.'], ['Worn arm pivots', 'Dry bushings let the board rattle.'], ['Loose rim nuts', 'Every shot shakes them.']],
      tools: ['Socket set and ratchet (½″, 9/16″, ¾″ typical)', 'Combination wrenches (for holding bolt heads)', 'Blue (removable) thread locker', 'Silicone spray', 'Garden hose (to top off)', 'Flashlight'],
      steps: [
        { t: 'Lower the board', d: 'Grip the lift handle, release the lock and bring the board down to its lowest setting. Let it click into place.', why: 'You can reach the rim and arm bolts from the ground instead of a ladder.', tip: 'If the handle won’t release, take the weight off it by pushing up slightly, then squeeze the trigger.', ok: 'The lock clicks and the board stays put when you let go.', v: { cam: [2.4, 1.8, 2.6], at: [0, 1.7, -0.6], hi: ['lift'], mv: LOWER(-0.76) } },
        { t: 'Tighten the rim nuts', d: 'From behind the board, snug the four rim nuts a little at a time in a criss-cross pattern until the lock washers are flat, then a quarter turn more. Add blue thread locker to any nut that keeps loosening.', why: 'Even tightening keeps the rim level and stops it from cracking a polycarbonate board.', tip: 'If the bolt spins with the nut, hold the bolt head from the front with a combination wrench while you turn the nut.', ok: 'Shaking the rim by hand, you feel no clunk at the bracket.', v: { cam: [0.9, 2.4, -1.0], at: [0, 2.25, -0.04], hi: ['rimBolts', 'rim'], tool: { id: 'ratchet', at: [0.06, 2.27, -0.06], rot: [-90, 0, 0], anim: 'turn' } } },
        { t: 'Tighten and lube the arm pivots', d: 'Snug each pivot bolt until the arm has no side play but still swings freely, then mist the pivots with silicone spray and run the board up and down once.', why: 'Overtightened pivots bind the lift; loose ones rattle on every shot.', tip: 'If the lift gets stiff after tightening, back that nut off an eighth of a turn. Wipe off overspray so it doesn’t collect grit.', ok: 'The board moves smoothly, and pushing an arm sideways shows no wiggle.', v: { cam: [1.6, 2.6, 0.6], at: [0, 2.5, -0.4], hi: ['arms'], tool: { id: 'lubeSpray', at: [0.25, 2.3, -0.62], rot: [0, 0, 30] } } },
        { t: 'Tighten the pole sections', d: 'Check the bolts at each pole joint and snug them. The sections should feel like one solid post.', why: 'Slip-fit sections are the most common source of wobble on portable hoops.', tip: 'Draw a paint-pen line across each tightened nut and bracket. If the line breaks later, you know which one moved.', ok: 'Pushing the pole at shoulder height, you feel no knock or play at the joints.', v: { cam: [1.5, 1.4, 0.4], at: [0, 1.2, -0.95], hi: ['poleBolts', 'pole'], tool: { id: 'comboWrench', at: [0.07, 0.98, -0.95], rot: [0, 0, 90], anim: 'turn' } } },
        { t: 'Check the base bracket', d: 'Tighten the bolts where the pole meets the base and the support strut (the angled brace).', why: 'This joint carries the whole leverage of the board, so a little looseness here becomes a big sway at the rim.', tip: 'Shine a flashlight into the joint. Shiny worn metal around a bolt hole means it’s been moving; tighten and check it again after a week.', ok: 'Rocking the pole by hand, the base and pole move together as one piece.', v: { cam: [1.4, 0.9, -0.2], at: [0, 0.3, -1.1], hi: ['baseBolts', 'brace'], tool: { id: 'ratchet', at: [0.09, 0.3, -1.03], rot: [-90, 0, 0], anim: 'turn' } } },
        { t: 'Top off the base', d: 'Unscrew the fill cap and check the level. Top it up with a garden hose to about 2″ below the opening (or the level your manual shows) and screw the cap back on hand-tight.', why: 'A base that has lost a third of its water weighs a third less, and the hoop rocks on every rebound.', tip: 'Can’t see the water level? Tap down the side of the base with your knuckles: it sounds hollow above the water and dull below it.', ok: 'The water is about 2″ below the opening and the cap is snug with no drips.', v: { cam: [1.3, 1.3, -2.6], at: [0, 0.2, -1.2], hi: ['fill', 'fillCap'], show: ['fill', 'hose'], xray: true, fx: 'fill' } },
        { t: 'Raise and test', d: 'Raise to 10′ and shoot. Only the breakaway rim should flex.', why: 'Real shots load the joints the way play does.', tip: 'Still wobbly? Check for a cracked base or a bent lower pole; those can’t be fixed by tightening.', ok: 'Shots bang off the board with a solid thud and the pole settles in about a second.', v: { cam: [5.6, 2.6, 5.4], at: [0, 1.75, -0.4], hi: ['rim'], hide: ['hose', 'fill'], mv: LOWER(0), fx: 'bounce' } },
      ],
    },
  ];

  TB.more('basketball', [
    {
      id: 'portable-hoop-base',
      title: 'Fill and anchor a portable hoop base',
      model: 'hoopPortable',
      level: 1,
      time: '1–2 hrs',
      cost: '$0–80',
      summary: 'A portable hoop is only as safe as its base. Fill it in its final spot with water (or sand), leave about 2″ of air at the top, protect it from freezing, and add weight in windy places.',
      intro: { hi: ['base', 'fillCap'] },
      safety: ['Fill the base where the hoop will stay. A 35-gal base weighs about 290 lb full of water and 400+ lb with sand.', 'Never play on a hoop with an empty or partly filled base.', 'In high winds lower the board and tip the hoop onto its back, or strap it down. Wind on the board can tip it.', 'Keep it at least 10′ from overhead power lines.'],
      causes: [['Water', 'Free and easy to drain later. Needs antifreeze or less fill where it freezes, and can slowly evaporate.'], ['Sand', 'About 50% heavier for the same volume and never freezes, but it’s slow to pour and hard to get out.'], ['Sand plus water', 'Pour sand first, then water to fill the gaps between grains for the most weight.']],
      tools: ['Garden hose', 'Wide-mouth funnel', 'Non-toxic RV antifreeze (cold climates)', 'Dry play sand, about 9–10 × 50 lb bags for a 35-gal base (if using sand)', 'Household bleach (1 tbsp, stops algae)', 'Level', 'Sandbags (windy sites)'],
      steps: [
        { t: 'Park it for good', d: 'Roll the hoop to a level spot with the base 2–4′ behind the court edge and the board over the playing surface. Lay a level on the base to check.', why: 'Once full it’s very hard to move, and a base on a slope leans the whole pole.', tip: 'Tip the hoop onto its wheels by pulling the pole toward you from the front; have a helper on the other side for an assembled hoop.', ok: 'The level’s bubble is centered both ways on the base, and the rim hangs over the court.', v: { cam: [3.6, 1.8, 0.2], at: [0, 0.4, -1.0], hi: ['base'], tool: { id: 'level', at: [0, 0.32, -1.3], rot: [0, 90, 0], scale: 0.8 } } },
        { t: 'Open the fill port', d: 'Unscrew the fill cap and set it somewhere it won’t get lost.', why: 'Some bases have two ports; fill through one and leave the other open so air can escape.', tip: 'Drop the cap in your pocket. Lost caps are the most common reason bases slowly lose their water.', ok: 'The port is open and you can see into the empty base.', v: { cam: [1.0, 1.1, -2.4], at: [-0.3, 0.3, -1.4], hi: ['fillCap'], hide: ['fillCap'], show: ['cap'] } },
        { t: 'Fill with water', d: 'Run the hose in until the water is about 2″ below the port. Add 1 tbsp of bleach. Where it freezes, mix in non-toxic RV antifreeze per your manual, or fill only about ¾ full so ice has room to expand.', why: 'The air space at the top gives the water room to expand; antifreeze keeps ice from splitting the plastic.', tip: 'Never use car antifreeze; it’s toxic to pets and kids. RV antifreeze is pink and labeled non-toxic.', ok: 'Shining a flashlight in, the water is about 2″ below the opening.', v: { cam: [1.6, 1.4, -2.8], at: [0, 0.25, -1.2], hi: ['fill', 'hose'], show: ['hose', 'fill'], xray: true, fx: 'fill' } },
        { t: 'Or fill with sand', d: 'For sand, pour dry play sand through a wide funnel a bag at a time, rocking the base or tapping its sides now and then so it packs into the corners.', why: 'Damp sand clumps in the funnel and leaves voids; dry sand flows and packs tight.', tip: 'Funnel clogging? Poke it with a stick. Cutting the bottom off a 2-liter bottle makes a cheap wide funnel.', ok: 'Sand is up to the port level and doesn’t settle more after you tap the base.', v: { cam: [1.6, 1.4, -2.8], at: [-0.5, 0.3, -1.4], hi: ['funnel', 'sand'], show: ['funnel', 'sand'], hide: ['hose'] } },
        { t: 'Cap it and check for leaks', d: 'Screw the cap on hand-tight, dry the base with a towel, and check the seams and cap again after an hour.', why: 'A slow leak empties a base over a summer without anyone noticing.', tip: 'If a seam weeps, mark it and drain below that level; small cracks can be patched with a plastic-welding kit, big ones mean a new base.', ok: 'After an hour, the pavement under the base and around the cap is dry.', v: { cam: [1.0, 1.1, -2.4], at: [-0.3, 0.3, -1.4], hi: ['fillCap'], show: ['fillCap'], hide: ['cap', 'funnel', 'fill'] } },
        { t: 'Add weight where it’s windy', d: 'Lay sandbags on the base, behind the pole, or use a ground-anchor strap kit if your hoop maker offers one.', why: 'A large backboard acts like a sail. Extra weight at the back of the base resists tipping.', tip: 'Before a storm, lower the board to the lowest setting; it catches less wind down low.', ok: 'Pushing hard on the front of the pole at chest height, the back of the base doesn’t lift.', v: { cam: [2.8, 1.6, -3.2], at: [0, 0.3, -1.2], hi: ['weights'], show: ['weights'], hide: ['sand'] } },
        { t: 'Check the bolts and play', d: 'Snug the base bracket and pole bolts, set the height and shoot. Tighten all the bolts again after the first week.', why: 'New hoops settle as the base takes the weight, and bolts loosen slightly.', tip: 'Put a reminder in your phone for one week out; that second tightening stops most future wobbles.', ok: 'The hoop feels solid on rebounds, with no knocking at the joints.', v: { cam: [5.6, 2.6, 5.4], at: [0, 1.75, -0.4], hi: ['baseBolts', 'poleBolts'], fx: 'bounce' } },
      ],
      learn: {
        how: 'The board and rim sit well in front of the pole, so their weight and every shot try to tip the hoop forward. The heavy base behind the pole is the counterweight. The farther the board overhangs and the bigger it is, the more base weight it needs, which is why manufacturers list a minimum fill.',
        specs: [['Typical base', '27–44 gal'], ['Water', '8.3 lb/gal'], ['Dry sand', '≈ 12–13 lb/gal (about 50% heavier)'], ['Headspace', '≈ 2″ below the port'], ['Winter water fill without antifreeze', '≤ 75% full'], ['Bleach', '1 tbsp per base'], ['Power lines', '≥ 10′ away']],
        terms: [['Overhang', 'Distance from pole to board face.'], ['RV antifreeze', 'Propylene-glycol antifreeze that’s non-toxic to pets.'], ['Base gel', 'Polymer that turns water into a heavy gel and slows leaks.']],
        mistakes: ['Filling it on the driveway and trying to roll it later.', 'Using car (ethylene glycol) antifreeze.', 'Filling to the brim and cracking the base in a freeze.', 'Pouring damp sand.'],
        tips: ['Sand plus water: pour sand first, then top off with water to fill the gaps between grains for maximum weight.', 'Write the fill date and fill type on the base with a paint marker.'],
      },
      pro: 'The base is cracked, the pole is bent, or you want to convert to a permanent in-ground system.',
      tricks: [
        ['Fill it where it lives', 'Decide the spot first. Rolling a full 300 lb base across a driveway is how wheels and bases crack.'],
        ['Bottle funnel', 'Cut the bottom off a 2-liter soda bottle for a wide funnel that sand flows through without clogging.'],
        ['Dry the sand', 'Bags from outdoors can be damp. Spread sand on a tarp in the sun for an afternoon, or buy bagged play sand stored indoors.'],
        ['Hollow-tap gauge', 'Knock down the side of the base with your knuckles; the sound changes from hollow to dull at the water line.'],
        ['Lower before storms', 'Drop the board to its lowest setting before big wind. It cuts the tipping force a lot.'],
        ['Paint the date', 'Write the fill date and whether you used antifreeze on the base. Next fall you’ll know what’s in it.'],
      ],
      refs: [
        ['Tips for filling a portable basketball hoop (DICK’S Sporting Goods ProTips)', 'https://www.dickssportinggoods.com/protips/sports-and-activities/basketball/tips-for-filling-a-portable-basketball-hoop'],
        ['Basketball hoop installation (Goalrilla)', 'https://www.goalrilla.com/installation'],
        ['Rule No. 1: Court dimensions and equipment (NBA Official Rules)', 'https://official.nba.com/rule-no-1-court-dimensions-equipment/'],
      ],
    },
    {
      id: 'hoop-anchor-install',
      title: 'Install an in-ground hoop on an anchor kit',
      model: 'hoopAnchor',
      kind: 'build',
      level: 3,
      time: '2 days + 3-day cure',
      cost: '$250–600 (plus the hoop)',
      summary: 'An anchor kit sets four J-bolts in a deep concrete footing. After at least a 72-hour cure, the pole bolts onto them, is plumbed with leveling nuts, and can be unbolted if you ever move.',
      intro: { show: ['concrete', 'levelNuts', 'pole', 'topNuts', 'arms', 'crank', 'board', 'rim', 'netHooks', 'net', 'rimBolts'], preview: true, spin: true },
      safety: ['Call 811 at least 3 business days before digging to have buried utilities marked.', 'Keep the hoop at least 10′ clear of overhead power lines.', 'Standing the pole and hanging the board takes at least 3 strong adults or a rented lift. A 60–72″ glass board weighs 100+ lb.', 'Wear gloves, long sleeves and eye protection with wet concrete; it causes chemical burns.'],
      causes: [['Position for overhang', 'Pole center about 3′ behind the court edge puts the board 2–4′ over the playing surface (check your model’s overhang).'], ['Square to the court', 'Use a string line along the slab edge so the board faces straight down the court.'], ['Hole size', 'Typical big systems want about 24″ across × 48″ deep; some kits call for 16–18″. Colder areas or soft soil may need it deeper. Follow your manual.']],
      tools: ['Post-hole digger and spade', 'Tape measure, string line, marking paint', 'Anchor kit (J-bolts, template, nuts, washers)', '#4 rebar and tie wire (if your manual shows it)', 'High-strength concrete mix, about 21 × 80 lb bags for a 24″ × 48″ hole (about 10 for 16″ × 48″)', 'Wheelbarrow and hoe (or a rented mixer)', '4′ level', 'Wrenches and sockets (15/16″ for ⅝″ bolts, 1⅛″ for ¾″ bolts)', '2×4 braces and screws', 'Ladders or a rented lift', 'Helpers (3)'],
      steps: [
        { t: 'Mark the spot', d: 'After utilities are marked, find the court centerline, measure 3′ back from the slab edge (or your model’s distance) and paint a circle the size of the hole.', why: 'That offset gives the right overhang so players don’t run into the pole.', tip: 'Stretch a string between two stakes along the slab edge. Measuring square off that string keeps the board aimed straight down the court.', ok: 'The paint circle is centered on the court’s centerline, the right distance behind the edge.', v: { cam: [3.0, 2.4, 2.2], at: [0, 0, -0.6], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [0.04, 0.06, -0.45], rot: [0, 90, 0] } } },
        { t: 'Dig the hole', d: 'Dig the hole to your manual’s size (often 24″ across and 48″ deep) with straight sides and a flat bottom. Pile the dirt on a tarp.', why: 'Straight sides and full depth give the footing the weight and soil grip that keep a 10′ lever from leaning.', tip: 'Hit a rock you can’t lift? Pry it with a digging bar. A post-hole digger works faster below 2′ than a shovel.', ok: 'The tape reads full depth at the center and edges, and the sides drop straight down.', v: { cam: [2.2, 2.4, 1.0], at: [0, -0.3, -1.0], hi: ['soil'], show: ['spoil'], hide: ['turf', 'layout'], tool: { id: 'shovel', at: [0.12, -0.4, -1.05], rot: [8, 30, -10], anim: 'push' } } },
        { t: 'Build the cage and anchor', d: 'Thread the J-bolts through the template with a nut and washer above and below it. If your manual shows rebar, tie a simple cage with wire and set it in the hole on bricks so it’s off the dirt.', why: 'The template locks the bolt pattern exactly to the pole’s base plate; rebar keeps the footing from cracking.', tip: 'Measure the bolt pattern corner to corner both ways; equal diagonals mean the bolts are square.', ok: 'All four bolts stand straight and parallel, and both diagonal measurements match.', v: { cam: [1.6, 0.9, 0.4], at: [0, -0.5, -1.0], hi: ['cage', 'anchor', 'template'], show: ['cage', 'anchor', 'template'], xray: true } },
        { t: 'Set height, square and level', d: 'Rest the template on 2×4 braces screwed across the hole so the bolts stick up the height the kit shows (often about 4″ above grade). Square it to the string line and level it both ways.', why: 'A level template means a plumb pole without fighting the leveling nuts later.', tip: 'Mark the bolt height on one bolt with tape. If the template sinks while pouring, you’ll see it at a glance.', ok: 'The bubble is centered both ways on the template, and one edge runs parallel to the string.', v: { cam: [1.3, 1.0, 0.2], at: [0, 0.1, -1.0], hi: ['template', 'braces'], show: ['braces'], tool: { id: 'level', at: [0, 0.125, -1.0], rot: [0, 0, 0], scale: 0.8 } } },
        { t: 'Pour the footing', d: 'Mix concrete to a thick oatmeal consistency and pour it in layers, poking each layer with a stick or rebar to work out air pockets. Keep concrete off the threads, and recheck level as you go.', why: 'Voids weaken the footing, and a bumped template is easy to miss until the pole leans.', tip: 'Too much water weakens concrete. Add it slowly; a scoop should hold its shape and not run off the hoe.', ok: 'The concrete is up to the top, the threads are clean, and the template is still level.', v: { cam: [2.2, 1.6, 0.8], at: [0, -0.2, -1.0], hi: ['concrete', 'bags'], show: ['concrete', 'bags'], xray: true } },
        { t: 'Crown and cure 72 hours', d: 'Trowel the top with a slight crown (higher in the middle) so water runs off, cover the threads with tape or a bag, and let it cure at least 72 hours; many makers say wait until day 5.', why: 'Concrete gains most of its early strength in the first week. Loading it early can crack it around the bolts.', tip: 'Mist the concrete and cover it with plastic for the first few days in hot weather. Slow-curing concrete is stronger.', ok: 'After 3 days, a fingernail or key scratched across the top leaves no mark.', v: { cam: [1.4, 1.1, 0.0], at: [0, 0.05, -1.0], hi: ['concrete'], hide: ['bags', 'spoil'], tool: { id: 'trowel', at: [0.18, 0.04, -0.9], rot: [0, 30, 70] } } },
        { t: 'Strip the template, set leveling nuts', d: 'Remove the braces and template. Thread a leveling nut and washer onto each bolt, all at the same height.', why: 'The lower nuts are how you’ll plumb the pole in a few minutes.', tip: 'Lay a level across the nuts in both directions and adjust them before the pole goes on; it saves heavy lifting later.', ok: 'All four lower washers are level with each other.', v: { cam: [1.0, 0.8, -0.2], at: [0, 0.05, -1.0], hi: ['levelNuts', 'anchor'], show: ['levelNuts'], hide: ['braces', 'template'], tool: { id: 'comboWrench', at: [0.1, 0.06, -0.9], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Stand the pole', d: 'With at least two helpers, lift the pole’s base plate onto the bolts and add the top washers and nuts finger-tight.', why: 'Finger-tight nuts hold it safely while still letting you adjust plumb.', tip: 'Walk it up: one person holds the base plate on the bolts while two walk the top up hand-over-hand.', ok: 'All four bolts pass through the plate and every nut is started by hand.', v: { cam: [3.4, 2.2, 1.6], at: [0, 1.2, -1.0], hi: ['pole', 'topNuts'], show: ['pole', 'topNuts'] } },
        { t: 'Plumb and tighten', d: 'Hold a level on two sides of the pole. Raise or lower the leveling nuts to correct, then tighten the top nuts firmly with a wrench.', why: 'A pole that’s out of plumb at the base is inches out at the rim.', tip: 'Many makers want the pole leaning very slightly backward, away from the court, so the board sits plumb once loaded; check your manual.', ok: 'The bubble is centered on two adjacent sides of the pole, and the top nuts won’t turn further.', v: { cam: [1.6, 1.3, 0.6], at: [0, 0.8, -1.0], hi: ['pole', 'levelNuts', 'topNuts'], tool: { id: 'level', at: [0.065, 1.0, -1.0], rot: [0, 90, 90], scale: 0.9 } } },
        { t: 'Hang the board and rim', d: 'Bolt on the extension arms and crank, lift the backboard on, then mount the rim and net. Crank to 10′ and check with a tape from the pavement to the top of the rim.', why: 'Hanging the arms before the board keeps the heavy lift short and controlled.', tip: 'Most systems let you hang the board with the arms at their lowest setting; it’s safer and needs a shorter ladder.', ok: 'The tape reads 10′ to the top of the rim, and the board face is vertical.', v: { cam: [6.0, 3.0, 6.2], at: [0, 1.8, -0.4], hi: ['board', 'rim', 'arms'], show: ['arms', 'crank', 'board', 'rim', 'netHooks', 'net', 'rimBolts'], fx: 'bounce' } },
      ],
      learn: {
        how: 'An in-ground hoop is a 10′ lever with a heavy board on the end. The concrete footing works like a buried anchor: its weight plus the soil pressing on its sides resist the bending at the base. An anchor kit separates the footing from the pole, so the pole can be plumbed with nuts, replaced, or removed without breaking concrete.',
        specs: [['Hole (typical)', '24″ dia × 48″ deep (some kits 16–18″)'], ['Concrete', '≈ 0.47 cu yd for 24″ × 48″ (≈ 21 × 80 lb bags)'], ['Thread above grade', 'per kit, often ≈ 4″'], ['Cure before loading', '72 hr minimum, day 5 preferred'], ['Rim height', '10′'], ['Helpers', '3 adults']],
        terms: [['Anchor kit', 'J-bolts and a template cast in the footing.'], ['Leveling nuts', 'Nuts under the base plate used to plumb the pole.'], ['Overhang', 'Distance from pole to board face.'], ['Plumb', 'Truly vertical.'], ['Crown', 'Slight dome on top of concrete so water runs off.']],
        mistakes: ['Skipping 811.', 'Letting concrete cover the threads.', 'Loading the footing before 72 hours.', 'Standing the pole without enough help.', 'Adding too much water to the mix.'],
        tips: ['Order ready-mix or rent a mixer; 21 bags by hand is a long day.', 'Put a bag over the threads with tape before you pour.'],
      },
      pro: 'You hit rock or utilities, the yard is sloped or soft, or you’re setting a heavy 72″ glass system. Many dealers offer installation.',
      tricks: [
        ['Template on braces', 'Screw two 2×4s across the hole and hang the template from them. It can’t sink or tilt while you pour.'],
        ['Count the bags', 'Each 80 lb bag makes about 0.6 cubic feet. Multiply your hole’s volume by 1.1 for waste and buy a couple extra.'],
        ['Protect the threads', 'Tape a plastic bag over each bolt before pouring. Concrete on threads means a long night with a wire brush.'],
        ['Rent the help', 'A material lift or a dealer install is often worth it for 60″+ glass boards. Dropping one ends the project.'],
        ['Lean back a hair', 'Check your manual: many want the pole set a touch back from plumb so the board’s weight pulls it true.'],
        ['Stack the job', 'Dig and pour on day 1, assemble the board and arms on sawhorses while it cures, stand it on day 5.'],
      ],
      refs: [
        ['Basketball hoop installation (Goalrilla)', 'https://www.goalrilla.com/installation'],
        ['How to install a Goalrilla basketball hoop (Goalrilla)', 'https://www.goalrilla.com/pages/installation-diy'],
        ['Call 811 before you dig (Common Ground Alliance)', 'https://call811.com/'],
        ['Setting posts with concrete (QUIKRETE)', 'https://www.quikrete.com/athome/video-setting-posts.asp'],
      ],
      addons: [
        { id: 'polepad', part: 'aoPolePad', name: 'Pole pad', cat: 'Safety', blurb: 'Foam wrap on the pole for drives to the hoop.', cost: [60, 150], how: 'Wrap it around the lower pole and close the hook-and-loop seam. Match the pole size (4″, 5″ or 6″).', needs: ['Basketball pole pad'], shop: 'Basketball pole pad 5 inch' },
        { id: 'boardpad', part: 'aoBoardPad', name: 'Backboard pad', cat: 'Safety', blurb: 'Padding along the bottom edge of the board.', cost: [60, 140], how: 'Bolt or strap it to the backboard frame per the pad maker.', needs: ['Backboard edge pad'], shop: 'Backboard edge padding 60 inch' },
        { id: 'light', part: 'aoLight', name: 'LED court light', cat: 'Lighting', blurb: 'A pole-mounted flood for evening games.', cost: [250, 700], how: 'Set a light pole in its own small footing and run outdoor cable in conduit to a GFCI circuit. Aim it from the side so it doesn’t glare at the shooter.', needs: ['LED flood light', 'Light pole', 'UF cable or conduit', 'GFCI protection'], shop: 'LED sport court light' },
        { id: 'lines', part: 'aoLines', name: 'Painted key + free-throw line', cat: 'Finish', blurb: '12 ft lane and a 15 ft free-throw line.', cost: [40, 120], how: 'Snap chalk lines, mask with painter’s tape and roll on two thin coats of court or porch paint.', needs: ['Court paint', 'Painter’s tape', 'Chalk line'], shop: 'Driveway basketball court stencil kit' },
      ],
    },
  ]);

  /* ======================================================================
     GRILL: charcoal + pellet variants, burner/igniter swap, two-zone setup
     ====================================================================== */
  const LID_OFF = { lid: [0.62, -0.7, 0.25] };
  const light = TB.repair('grill', 'grill-light');
  light.variants = [
    { id: 'gas', name: 'Gas grill', blurb: 'Propane or natural gas with burner knobs and an igniter.' },
    {
      id: 'charcoal',
      name: 'Charcoal kettle',
      blurb: 'Coals that won’t catch, go out, or never get hot.',
      model: 'kettle',
      title: 'Charcoal won’t light or stay lit',
      time: '25–35 min',
      cost: '$0–30',
      summary: 'Charcoal needs air from below and room for ash to fall. Empty the old ash, open the vents, and light with a chimney starter instead of lighter fluid. The coals are ready when the top ones are lightly covered in gray ash, about 15–20 minutes.',
      intro: { hi: ['ash', 'vents'] },
      safety: ['Grill on a non-combustible surface at least 10′ from the house, deck rails and overhangs, never in a garage, tent or porch: burning charcoal makes carbon monoxide.', 'Never add lighter fluid to lit or warm coals. The flame can run back up the stream.', 'Wear heat-resistant gloves; a lit chimney is well over 1,000 °F inside and the handle gets hot.', 'Set the lit chimney only on the charcoal grate or bare concrete, never on grass or a wooden deck.'],
      causes: [['Ash choking the vents', 'Old ash blocks the bottom vents so the fire starves.'], ['Vents closed', 'Closing the lid vent or bottom vents smothers the fire.'], ['Damp charcoal', 'Bags stored outside absorb moisture.'], ['Too little fuel', 'Briquettes need neighbors to stay lit.']],
      tools: ['Chimney starter', 'Charcoal (a full chimney holds about 80–100 briquettes)', 'Newspaper (2 sheets) or 2 paraffin lighter cubes', 'Long lighter', 'Heat-resistant gloves', 'Metal ash can with a lid'],
      steps: [
        { t: 'Lid off, vents open', d: 'Take the lid off and open the bottom vents fully (slide the handle under the bowl until the holes are wide open).', why: 'Fire needs oxygen from below. Closed vents are the most common reason coals die.', tip: 'Look under the bowl while you move the handle; you’ll see the vent blades slide open over the holes.', ok: 'Looking in from the top, you can see daylight through the vent holes in the bottom of the bowl.', v: { cam: [1.3, 1.4, 1.4], at: [0, 0.55, 0], hi: ['vents', 'lid'], mv: LID_OFF } },
        { t: 'Clear the old ash', d: 'Sweep the vent handle back and forth a few times so the blades push ash into the catcher, then empty it into a metal can, only if the ash is completely cold.', why: 'Ash piled over the vents blocks airflow even when they’re open.', tip: 'Not sure the ash is cold? Hold your hand over it, then pour a little water on it in the can and put the lid on. Coals hide in ash for days.', ok: 'The bottom of the bowl is clear and the vent holes are open.', v: { cam: [1.1, 0.9, 1.3], at: [0, 0.3, 0], hi: ['ash', 'ashPan', 'can'], show: ['can'], hide: ['ash'] } },
        { t: 'Load the chimney', d: 'Crumple two sheets of newspaper loosely (or set two lighter cubes) on the charcoal grate, set the chimney over them, and fill the top with charcoal. Half full for a short cook, full for searing.', why: 'The chimney’s tall shape pulls air up through the coals so they light evenly without fluid.', tip: 'Paper balled too tight just smolders. Crumple it into loose rings with air in them, and a drizzle of cooking oil on the paper makes it burn longer.', ok: 'The chimney sits flat on the grate, paper is tucked underneath, and charcoal is level with the top.', v: { cam: [1.0, 1.25, 1.1], at: [0.06, 0.7, 0], hi: ['chimney', 'paper'], show: ['chimney', 'paper'], hide: ['can'] } },
        { t: 'Light and wait', d: 'Light the paper through the side holes in two or three spots. Wait 15–20 minutes until the top coals are lightly covered in gray ash and you see flames at the top.', why: 'Dumping too early leaves black, unlit briquettes on top that smother the rest.', tip: 'Paper burned out but coals didn’t catch? Lift the chimney, add one more loose sheet, and relight. Usually the paper was too tight or the charcoal was damp.', ok: 'The top layer has a thin gray coat, and orange glow shows through the chimney holes.', v: { cam: [1.1, 1.3, 1.2], at: [0.06, 0.75, 0], hi: ['chimney', 'chimneyFire'], show: ['chimneyFire'], fx: 'fire', tool: { id: 'gloves', at: [0.35, 0.72, 0.15], rot: [0, -30, 0] } } },
        { t: 'Dump and arrange', d: 'Wearing gloves, grab both handles and pour the coals onto the charcoal grate. Spread them evenly, or bank them to one side for two-zone cooking.', why: 'Spread coals give even heat; banked coals give a hot side and a cool side.', tip: 'Pour low and slowly so the coals don’t bounce. Use long tongs, not your gloves, to move single coals.', ok: 'All the coals are in the grill, glowing, with no black briquettes on top.', v: { cam: [1.0, 1.3, 1.1], at: [0, 0.55, 0], hi: ['coals'], show: ['coals'], hide: ['chimney', 'chimneyFire', 'paper'], fx: 'glow' } },
        { t: 'Grate on, lid on, preheat', d: 'Set the cooking grate, put the lid on with the lid vent fully open, and preheat 10 minutes.', why: 'With the lid on, the kettle works like a chimney, and a hot grate sears instead of sticking.', tip: 'Set the empty chimney on concrete or the charcoal grate to cool; it stays dangerously hot for 30 minutes.', ok: 'The lid thermometer climbs past 450 °F, and you can only hold your hand 5″ above the grate for 2–3 seconds.', v: { cam: [1.5, 1.45, 1.6], at: [0, 0.65, 0], hi: ['lidVent', 'lid'], mv: { lid: [0, 0, 0] }, fx: 'glow' } },
      ],
      learn: {
        how: 'Charcoal burns where oxygen reaches it. Air enters the bottom vents, passes through the coals, and leaves through the lid vent. Open vents mean more air and more heat; closing them slows the fire. Ash that builds up underneath blocks that path.',
        specs: [['Full chimney', '≈ 80–100 briquettes'], ['Ready', '15–20 min, lightly ashed over'], ['Bottom vent', 'open to light; adjust to control heat'], ['Lid vent', 'never fully closed while cooking'], ['Distance from house', '≥ 10′']],
        terms: [['Chimney starter', 'Metal tube that lights charcoal with paper.'], ['Ashed over', 'Coals covered in light gray ash: ready to cook.'], ['Lump charcoal', 'Irregular natural charcoal; lights faster, burns hotter.'], ['Hand test', 'How long you can hold your hand above the grate: 2–3 s is high heat.']],
        mistakes: ['Squirting fluid on lit coals.', 'Lighting with vents closed.', 'Dumping the chimney too early.', 'Storing charcoal where it gets damp.'],
        tips: ['Store charcoal in a lidded bin to keep it dry.', 'A couple of drops of cooking oil on the newspaper makes it burn longer.'],
      },
      pro: 'The bowl is rusted through or the leg sockets are broken; a replacement kettle usually costs less than parts.',
      tricks: [
        ['Lidded bin for charcoal', 'Charcoal soaks up humidity and lights badly. Keep it in a lidded plastic or metal bin.'],
        ['Half chimney for most cooks', 'Burgers and chicken on a kettle rarely need more than half a chimney. Save fuel and get gentler heat.'],
        ['Light it on the grill', 'Set the chimney on the charcoal grate to light it. If anything spills, it lands in the grill.'],
        ['Lump lights faster', 'Lump charcoal catches in about 10 minutes and burns hotter; briquettes last longer and burn more evenly.'],
        ['Hand test for heat', 'Hold your palm 5″ above the grate: 2–3 seconds is high, 5–7 is medium, 10 is low.'],
      ],
      refs: [
        ['Chimney starter 101 (Weber)', 'https://www.weber.com/US/en/blog/burning-questions/chimney-starter-101/weber-29681.html'],
        ['Grilling safety tips (NFPA)', 'https://www.nfpa.org/education-and-research/home-fire-safety/grilling'],
        ['Proper disposal of ashes (U.S. Fire Administration)', 'https://www.usfa.fema.gov/gallery/pictographs/pictograph43.html'],
      ],
    },
    {
      id: 'pellet',
      name: 'Pellet grill',
      blurb: 'Fan runs, but the fire never starts or keeps going out.',
      model: 'pellet',
      title: 'Pellet grill won’t ignite',
      level: 2,
      time: '30–60 min',
      cost: '$0–45',
      summary: 'A pellet grill that won’t light almost always has a fire pot packed with ash, damp pellets, or an empty auger. Vacuum the pot out cold, check that the igniter glows, prime the auger, and it lights.',
      intro: { hi: ['firePot', 'igniter'] },
      safety: ['Unplug the grill before reaching inside.', 'Vacuum only cold ash. Warm embers can start a fire inside a shop vac.', 'Never add pellets by hand to a hot fire pot; it can flare up in your face.', 'Use the grill’s shutdown cycle; pulling the plug while it’s lit can let fire creep back up the auger tube (burnback).'],
      causes: [['Fire pot full of ash', 'Ash blocks the air holes and buries the igniter.'], ['Wet or swollen pellets', 'Pellets that got damp turn to sawdust and jam the auger.'], ['Failed igniter', 'The rod should glow red-orange within a few minutes.'], ['Empty auger', 'After running out of pellets, the auger tube needs priming before pellets reach the pot.']],
      tools: ['Shop vac (use only on cold ash)', 'Plastic grill scraper', 'Phillips screwdriver', 'Fresh, dry pellets', 'Flashlight', 'Multimeter (optional, to test the igniter)'],
      steps: [
        { t: 'Unplug and let it cool', d: 'Make sure the grill is off and fully cool to the touch, then unplug it from the outlet.', why: 'You’re about to put your hands and a vacuum where the fire lives.', tip: 'Shut down normally if it’s running. If it just failed to light, wait 15 minutes anyway; there can be smoldering pellets in the pot.', ok: 'The lid and barrel feel cool, and the power cord is out of the outlet.', v: { cam: [1.8, 1.6, 2.0], at: [-0.2, 0.8, 0], hi: ['controller'] } },
        { t: 'Check the pellets', d: 'Open the hopper. Good pellets are shiny and snap cleanly in half. Scoop out any that are swollen, soft, crumbly or sawdusty.', why: 'Moisture ruins pellets; sawdust packs into the auger like a plug.', tip: 'Bad pellets at the bottom? Empty the hopper through its clean-out door (if it has one) and run fresh pellets. Store pellets in a sealed bucket indoors.', ok: 'The pellets in the hopper snap with a crack and leave little dust in your hand.', v: { cam: [-0.4, 1.6, 1.4], at: [-0.63, 0.9, 0], hi: ['pellets', 'hopper'], xray: true } },
        { t: 'Strip the cook chamber', d: 'Open the lid and lift out the grates, the drip tray (the slanted metal sheet) and the heat baffle (the plate over the fire pot).', why: 'The fire pot sits under all three.', tip: 'Lay them on cardboard in order of removal, so they go back in the same order.', ok: 'You can see the round fire pot at the bottom of the barrel.', v: { cam: [1.3, 1.7, 1.3], at: [0, 0.75, 0], hi: ['grates', 'dripTray', 'baffle'], rt: { lid: [-100, 0, 0] }, mv: { grates: [0, 0.6, 0.9], dripTray: [0, 0.4, 0.9], grime: [0, 0.4, 0.9], baffle: [0.9, -0.5, 0.4] } } },
        { t: 'Vacuum the fire pot', d: 'Vacuum all the ash out of the fire pot and the barrel floor. Clear each small air hole in the pot with a screwdriver tip.', why: 'A packed pot is the number-one cause of failed starts; the igniter needs air and fresh pellets touching it.', tip: 'Use the shop vac’s crevice tool and a dry filter. Never vacuum near anything warm.', ok: 'The pot is bare metal inside and every air hole is open.', v: { cam: [0.6, 1.2, 0.8], at: [0, 0.64, 0], hi: ['firePot', 'ash'], show: ['vac'], hide: ['ash'] } },
        { t: 'Test the igniter', d: 'Plug in, start the grill on Smoke (or its startup setting), and look into the pot with the flashlight from a safe distance. The igniter rod should glow red-orange within about 1–3 minutes and the fan should run.', why: 'No glow means a failed igniter, usually a plug-in part replaced from under the fire pot.', tip: 'Don’t touch or lean over the pot. If it doesn’t glow in 5 minutes, unplug, and test the igniter with a multimeter (most read about 40–70 ohms).', ok: 'You see the rod glow orange in the pot and hear the fan hum.', v: { cam: [0.5, 1.1, 0.7], at: [-0.06, 0.62, 0], hi: ['igniter', 'fan'], hide: ['vac'], fx: 'ignite' } },
        { t: 'Prime the auger', d: 'Use the controller’s prime or feed feature (or let it run on Smoke) until pellets drop into the pot.', why: 'After running out, the auger tube is empty, and the igniter times out before pellets arrive.', tip: 'Stop priming once a small pile covers the igniter, about a handful. Too many pellets smother the fire and cause a big puff of smoke.', ok: 'A small mound of pellets sits in the pot over the igniter.', v: { cam: [0.4, 1.2, 1.1], at: [-0.3, 0.66, 0], hi: ['auger', 'controller'], xray: true } },
        { t: 'Reassemble and start', d: 'Put back the heat baffle, drip tray and grates. Start it per the manual; older models want the lid open for the first 4–5 minutes, many newer ones want it closed.', why: 'Following the startup sequence lets the fire establish before the fan ramps up.', tip: 'Thick white smoke for more than 10 minutes means the fire didn’t catch; shut down, let it cool and check the pot again.', ok: 'After 10–15 minutes, smoke from the chimney turns thin and bluish and the temperature climbs.', v: { cam: [1.8, 1.6, 2.0], at: [0, 0.85, 0], hi: ['chimney', 'smoke'], mv: { grates: [0, 0, 0], dripTray: [0, 0, 0], grime: [0, 0, 0], baffle: [0, 0, 0] }, rt: { lid: [0, 0, 0] }, show: ['smoke'], fx: 'smoke' } },
      ],
      learn: {
        how: 'A pellet grill is a wood-fired oven run by a computer. An auger (a rotating screw) carries pellets from the hopper to a small fire pot. A hot-rod igniter lights them, a fan feeds air, and the controller speeds or slows the auger to hold your set temperature, reading a probe inside the chamber.',
        specs: [['Igniter glow', '≈ 1–3 min'], ['Igniter (typical)', '120 V, 200–300 W'], ['Vacuum fire pot', 'every 3–5 cooks; deep clean every ≈ 20 hr'], ['Startup', '10–15 min to thin blue smoke'], ['Pellets', 'store dry, sealed']],
        terms: [['Fire pot (burn pot)', 'Cup where pellets burn.'], ['Hot-rod igniter', 'Heating element that lights pellets.'], ['Auger', 'Screw that feeds pellets.'], ['RTD', 'Temperature probe the controller reads.'], ['Burnback', 'Fire creeping up the auger tube toward the hopper.']],
        mistakes: ['Vacuuming warm ash.', 'Adding pellets by hand to a hot pot.', 'Unplugging instead of using the shutdown cycle.', 'Leaving pellets in the hopper through a damp season.'],
        tips: ['Keep the hopper covered and buy pellets in sealed bags.', 'Run a vacuum pass every few cooks to prevent this entirely.'],
      },
      pro: 'The igniter glows but the fan or auger won’t turn, the controller shows error codes after cleaning, or the auger is jammed solid with swollen pellets.',
      tricks: [
        ['Snap test', 'A good pellet snaps cleanly. If it bends or crumbles, it’s wet; dump it.'],
        ['Bucket storage', 'Store pellets in a lidded 5-gal bucket indoors. A bag left on the grill shelf soaks up dew overnight.'],
        ['Vacuum habit', 'A 2-minute fire-pot vacuum every few cooks prevents almost every failed start.'],
        ['Empty the hopper for storage', 'Before a long break or winter, run the hopper low and vacuum out the rest so pellets don’t swell in the auger.'],
        ['Spare igniter', 'Igniters are cheap and fail eventually. Keep the right one on the shelf for your model.'],
      ],
      refs: [
        ['Cleaning your Traeger pellet grill (Traeger Support)', 'https://support.traeger.com/hc/en-us/articles/4407219978395'],
        ['How to clean your Traeger fire pot (Ace Hardware)', 'https://www.acehardware.com/tips/grilling/grill-maintenance/how-to-clean-your-traeger-fire-pot/'],
        ['Grilling safety tips (NFPA)', 'https://www.nfpa.org/education-and-research/home-fire-safety/grilling'],
      ],
    },
  ];

  const clean = TB.repair('grill', 'grill-clean');
  clean.variants = [
    { id: 'gas', name: 'Gas grill', blurb: 'Grates, heat tents and burner ports.' },
    {
      id: 'charcoal',
      name: 'Charcoal kettle',
      blurb: 'Grate, bowl, lid and the ash system.',
      model: 'kettle',
      time: '30–45 min',
      summary: 'Brush the grate hot, then once everything is cold, empty the ash, scrape the carbon flakes off the inside of the lid and bowl, and wash the grate.',
      intro: { hi: ['grime', 'ash'] },
      safety: ['Ash can hold live embers for days. Empty only fully cold ash into a metal can with a lid, wet it down, and keep the can 10′ from the house.', 'Check grates for loose wire bristles after brushing, or use a bristle-free scraper.'],
      causes: [['Grease on the grate', 'Burnt-on drippings make food stick.'], ['Flaking “paint” in the lid', 'That’s carbonized grease, not enamel. It falls onto food.'], ['Ash buildup', 'Blocks vents and holds moisture that rusts the bowl.']],
      tools: ['Bristle-free scraper or grill brush', 'Plastic scraper', 'Metal ash can with lid', 'Bucket of warm soapy water', 'Non-abrasive sponge', 'Paper towels and cooking oil'],
      steps: [
        { t: 'Brush the grate hot', d: 'At the end of a cook (or after 10 minutes of preheat), brush or scrape the grate with the lid off, wearing a grill glove.', why: 'Heat turns grease to brittle carbon that brushes right off.', tip: 'No scraper? Crumple foil into a ball and scrub with it held in long tongs.', ok: 'The bars look dull gray, not black and shiny with grease.', v: { cam: [1.1, 1.4, 1.2], at: [0, 0.7, 0], hi: ['cookGrate', 'grime'], show: ['coals'], mv: LID_OFF, fx: 'glow', tool: { id: 'wireBrush', at: [0.05, 0.705, 0.05], rot: [0, 0, 60], anim: 'slide' } } },
        { t: 'Let it go cold, then empty ash', d: 'Wait until the kettle is completely cold (overnight is safest). Sweep the vent blades and dump the ash catcher into a metal can.', why: 'Ash looks dead long before it is; plastic bins and paper bags of ash have burned down garages.', tip: 'Pour a little water into the can over the ash and close the lid; that settles the dust and kills any hidden ember.', ok: 'The bowl bottom and ash catcher are empty, and the can lid is on.', v: { cam: [1.1, 0.9, 1.3], at: [0, 0.3, 0], hi: ['ash', 'ashPan', 'can'], show: ['can'], hide: ['coals', 'grime'] } },
        { t: 'Scrape the lid and bowl', d: 'Lift out the grates and scrape the inside of the lid and bowl with a plastic scraper.', why: 'Those black flakes are built-up carbon. A plastic scraper removes them without chipping the porcelain enamel.', tip: 'Do this over a trash bag or on the lawn; the flakes are messy but harmless.', ok: 'Running your hand inside the lid, it feels smooth, with no loose flakes.', v: { cam: [1.0, 1.3, 1.1], at: [0, 0.55, 0], hi: ['bowl', 'scraper'], show: ['scraper'], hide: ['ash'], mv: { cookGrate: [0.7, -0.4, -0.3], coalGrate: [0.7, -0.4, -0.6] } } },
        { t: 'Wash the grate', d: 'Scrub the grate in warm soapy water with a non-abrasive sponge, rinse, and dry.', why: 'Soap lifts the grease film that brushing leaves behind.', tip: 'Heavy crust? Soak the grate in hot soapy water in a tub or trash bag for an hour first.', ok: 'Wiping a bar with a paper towel leaves it only faintly gray.', v: { cam: [1.2, 1.2, 1.4], at: [0.5, 0.4, 0], hi: ['cookGrate', 'soapy'], show: ['soapy'], hide: ['scraper'] } },
        { t: 'Reassemble and oil', d: 'Set the charcoal grate and cooking grate back, wipe the cooking grate with a thin film of high-heat oil, and refit the lid.', why: 'A light coat of oil protects the plated steel from rust between cooks.', tip: 'Make sure the grate handles line up with the hinged sections so you can add coals during long cooks.', ok: 'Grates sit flat, the lid seats evenly all the way around, and the vents slide freely.', v: { cam: [1.5, 1.45, 1.6], at: [0, 0.65, 0], hi: ['cookGrate'], hide: ['soapy', 'can'], mv: { cookGrate: [0, 0, 0], coalGrate: [0, 0, 0], lid: [0, 0, 0] } } },
      ],
      learn: {
        how: 'Fat that drips onto coals vaporizes; some condenses back on the cooler lid and bowl and slowly bakes into carbon. Meanwhile ash collects below. Ash is alkaline and holds moisture, so left in the kettle it rusts the bottom from the inside.',
        specs: [['Ash safe to dump', 'fully cold (48 hr, or doused)'], ['Ash can', 'metal with lid, 10′ from buildings'], ['Deep clean', 'every 5–10 cooks'], ['Grate brushing', 'hot, every cook']],
        terms: [['Carbon flakes', 'Baked-on grease that looks like peeling paint.'], ['One-Touch', 'Weber’s sweeping vent blades that push ash into the catcher.'], ['Porcelain enamel', 'The glassy coating inside the kettle; chips if scraped with metal.']],
        mistakes: ['Dumping warm ash in a plastic bin.', 'Using steel wool on porcelain enamel.', 'Leaving ash in over winter.'],
        tips: ['Line the ash catcher with foil for quick dumping.', 'A ball of crumpled foil held in tongs works as a scrubber.'],
      },
      pro: 'The bowl has rusted through; a replacement bowl rarely makes sense over a new kettle.',
      tricks: [
        ['Foil the ash catcher', 'A sheet of foil in the ash catcher turns emptying into a lift-and-fold job.'],
        ['Wet the ash', 'A splash of water on ash in the can kills embers and keeps dust down.'],
        ['Plastic, not metal, inside', 'Metal scrapers chip the enamel and start rust. A plastic putty knife is all the bowl needs.'],
        ['Clean before storing', 'Empty the ash before winter and store the kettle covered; ash plus moisture eats bowls.'],
        ['Clean hot, every time', 'A quick brush at the end of every cook means the deep clean takes minutes.'],
      ],
      refs: [
        ['Proper disposal of ashes (U.S. Fire Administration)', 'https://www.usfa.fema.gov/gallery/pictographs/pictograph43.html'],
        ['Grilling safety tips (NFPA)', 'https://www.nfpa.org/education-and-research/home-fire-safety/grilling'],
        ['Injuries from wire grill-cleaning brushes (CDC MMWR)', 'https://www.cdc.gov/mmwr/preview/mmwrhtml/mm6126a3.htm'],
      ],
    },
    {
      id: 'pellet',
      name: 'Pellet grill',
      blurb: 'Grates, drip tray, fire pot ash and grease bucket.',
      model: 'pellet',
      time: '45–60 min',
      cost: '$5–25',
      summary: 'Pellet grills need ash vacuumed out of the fire pot every few cooks, a scraped drip tray, and an emptied grease bucket. Do it cold and unplugged.',
      intro: { hi: ['grime', 'firePot', 'ash'] },
      safety: ['Unplug and cool the grill completely before cleaning.', 'Vacuum only cold ash.', 'A grease-caked drip tray is how most pellet-grill grease fires start. If one starts, keep the lid closed and run the shutdown cycle; never use water.'],
      causes: [['Ash in the fire pot and barrel', 'Leads to failed starts and temperature swings.'], ['Grease on the drip tray', 'Can ignite at high temperatures.'], ['Full grease bucket', 'Overflows down the leg.'], ['Dirty temp probe', 'Gives the controller a wrong reading.']],
      tools: ['Shop vac', 'Plastic grill scraper', 'Heavy-duty foil or drip-tray liners', 'Grill degreaser and paper towels', 'Grease-bucket liner', 'Grill brush'],
      steps: [
        { t: 'Shut down, unplug, cool', d: 'Run the shutdown cycle (press the shutdown button and let the fan run until it stops on its own), let it cool completely, then unplug.', why: 'The shutdown cycle burns off pellets in the pot so nothing smolders while you clean.', tip: 'Plan cleaning for the morning after a cook; the grill is cool and the grease has set up.', ok: 'The fan has stopped, the barrel feels cool, and the cord is unplugged.', v: { cam: [1.8, 1.6, 2.0], at: [-0.2, 0.8, 0], hi: ['controller'] } },
        { t: 'Brush and lift the grates', d: 'Brush the grates, then lift them out.', why: 'Grates come out first to reach everything else.', tip: 'Brush first while they’re in the grill so crumbs fall onto the drip tray, not the ground.', ok: 'The grates are out and the drip tray is visible.', v: { cam: [1.3, 1.7, 1.3], at: [0, 0.86, 0], hi: ['grates'], rt: { lid: [-100, 0, 0] }, mv: { grates: [0, 0.6, 0.9] }, tool: { id: 'wireBrush', at: [0, 0.87, 0.05], rot: [0, 0, 60], anim: 'slide' } } },
        { t: 'Scrape the drip tray', d: 'Scrape grease toward the grease chute with a plastic scraper, then peel off the old foil or liner and lay a fresh one.', why: 'Old grease on the tray is fuel for a flare-up.', tip: 'Never cover the grease outlet slot with foil; grease will pool on the tray instead of draining.', ok: 'The tray is clean and the grease outlet is open.', v: { cam: [1.2, 1.5, 1.2], at: [0, 0.75, 0], hi: ['dripTray', 'grime'], tool: { id: 'puttyKnife', at: [0.1, 0.765, 0.05], rot: [0, 0, 60], anim: 'slide' } } },
        { t: 'Vacuum the ash', d: 'Lift out the drip tray and baffle, then vacuum the fire pot and barrel floor.', why: 'Ash holds moisture, rusts the barrel, and smothers the fire pot.', tip: 'Hold the vac nozzle in the fire pot for a few seconds; the pot’s air holes clear best with suction straight down.', ok: 'The pot is bare metal with open air holes, and the barrel floor has no gray drifts.', v: { cam: [0.6, 1.2, 0.8], at: [0, 0.64, 0], hi: ['firePot', 'ash'], show: ['vac'], hide: ['ash', 'grime'], mv: { dripTray: [0, 0.4, 0.9], baffle: [0.9, -0.5, 0.4] } } },
        { t: 'Clean the probe and empty the bucket', d: 'Wipe the temperature probe (the thin metal rod inside the barrel wall) with degreaser on a paper towel. Empty and reline the grease bucket.', why: 'A greasy probe reads low, so the grill runs hot.', tip: 'Pull the probe gently straight; never bend it. Grease in the bucket solidifies if cold, so scrape it into the trash, not down a drain.', ok: 'The probe is shiny, and the bucket has a fresh liner.', v: { cam: [0.9, 1.3, 0.5], at: [0.1, 0.8, -0.1], hi: ['rtd', 'bucket'], hide: ['vac'] } },
        { t: 'Reassemble', d: 'Set the baffle back centered over the fire pot, then the freshly lined drip tray and grates. Close the lid.', why: 'A baffle off-center gives uneven heat and can cause hot spots on the tray.', tip: 'Most baffles have tabs or notches that drop into place. If it rocks, it isn’t seated.', ok: 'The baffle sits flat and centered, the tray slopes toward the grease chute, and the lid closes flush.', v: { cam: [1.8, 1.6, 2.0], at: [0, 0.85, 0], hi: ['foil', 'baffle'], show: ['foil'], mv: { dripTray: [0, 0, 0], baffle: [0, 0, 0], grates: [0, 0, 0] }, rt: { lid: [0, 0, 0] } } },
      ],
      learn: {
        how: 'Wood pellets leave about 1% of their weight as ash, which collects in the fire pot and barrel. Grease runs down the slanted drip tray into a chute and bucket. Both build up quietly until the grill stops lighting or catches fire.',
        specs: [['Vacuum fire pot', 'every 3–5 cooks'], ['Deep clean', 'every ≈ 20 cook hours'], ['Drip tray liner', 'every 3–5 cooks'], ['Grease bucket', 'check each cook']],
        terms: [['Heat baffle', 'Plate over the fire pot that spreads heat.'], ['Drip tray', 'Slanted plate carrying grease to the bucket.'], ['RTD probe', 'The grill’s built-in thermometer.']],
        mistakes: ['Vacuuming warm ash.', 'Using oven cleaner on the controller or painted parts.', 'Skipping the drip tray.', 'Covering the grease outlet with foil.'],
        tips: ['Fold foil around the tray edges, never over the grease outlet.'],
      },
      pro: 'The fire pot is rusted through, or the controller throws errors after cleaning.',
      tricks: [
        ['Tray liners save time', 'Disposable drip-tray liners make the dirtiest job a 30-second swap.'],
        ['Clean after fatty cooks', 'Brisket and pork butt drop a lot of grease. Clean the tray after each long fatty cook, not on a schedule.'],
        ['Dedicated shop vac', 'A small shop vac with a fine-dust filter kept by the grill makes the habit easy.'],
        ['Kitty-litter grease', 'Pour a scoop of cat litter in the grease bucket to soak up grease for easy dumping.'],
        ['Inspect the gasket', 'While it’s open, check the lid seal; a flattened gasket leaks smoke and heat.'],
      ],
      refs: [
        ['Cleaning your Traeger pellet grill (Traeger Support)', 'https://support.traeger.com/hc/en-us/articles/4407219978395'],
        ['How to clean your Traeger fire pot (Ace Hardware)', 'https://www.acehardware.com/tips/grilling/grill-maintenance/how-to-clean-your-traeger-fire-pot/'],
        ['Grilling safety tips (NFPA)', 'https://www.nfpa.org/education-and-research/home-fire-safety/grilling'],
      ],
    },
  ];

  TB.more('grill', [
    {
      id: 'grill-burner-replace',
      title: 'Replace a gas grill burner and igniter',
      model: 'gasGrill',
      level: 2,
      time: '45–90 min',
      cost: '$25–90',
      summary: 'A rusted burner gives uneven heat and big yellow flames; a cracked electrode just clicks. Both come out with a screwdriver once the grates and heat tents are off. Order parts by the model number on the grill’s data label.',
      intro: { hi: ['oldBurner', 'electrode'] },
      safety: ['Turn every knob off, close the tank valve and disconnect the regulator before starting.', 'Work only on a cold grill.', 'Leak-test the regulator connection with soapy water after reconnecting; never with a flame.', 'Light the grill with the lid open, and if a burner doesn’t light in 5 seconds, turn it off and wait 5 minutes.'],
      causes: [['Rusted-through burner', 'Holes or splits make big uneven flames.'], ['Cracked ceramic electrode', 'Spark jumps to the wrong place or not at all.'], ['Dead igniter battery', 'Check the AA/AAA first.'], ['Spiders in the venturi', 'Yellow, lazy flames.']],
      tools: ['Replacement burner (model-specific)', 'Replacement electrode or igniter kit', 'Phillips screwdriver', 'Needle-nose pliers', 'Venturi brush', 'Wire brush', 'Soapy water and brush', 'AA or AAA battery', 'Penetrating oil (for rusted screws)'],
      steps: [
        { t: 'Gas off, regulator off', d: 'Turn every knob off, close the tank valve (clockwise until it stops) and unscrew the regulator from the tank.', why: 'You’ll be removing parts that carry gas.', tip: 'Snap a phone photo of the burners and wiring before you start; it’s your reassembly map.', ok: 'All knobs point to OFF and the regulator hangs free of the tank.', v: { cam: [0.9, 1.0, 1.0], at: [0.12, 0.65, 0.05], hi: ['valve', 'regulator', 'knobs'], tool: { id: 'gloves', at: [0.3, 0.62, 0.2], rot: [0, -20, 0] } } },
        { t: 'Remove grates and heat tents', d: 'Open the lid and lift out the grates and heat tents (the metal V-shaped shields over each burner).', why: 'They sit directly over the burners.', tip: 'Lay them on cardboard in the order they came out; tents are often different sizes.', ok: 'You can see the burner tubes running front to back.', v: { cam: [1.1, 1.6, 1.2], at: [0, 0.85, 0], hi: ['grates', 'tents'], rt: { lid: [-95, 0, 0] }, mv: { grates: [0.9, -0.03, 0.2], tents: [0, 0.5, 0.6] } } },
        { t: 'Unpin the old burner', d: 'Remove the cotter pin or screw at the back of the burner, unclip the electrode, then lift the back and slide the burner off the gas valve.', why: 'The front of the burner (the venturi) just slips over the brass orifice; it isn’t threaded.', tip: 'Rusted screw? Spray penetrating oil, wait 10 minutes, then turn with firm downward pressure. If the head strips, grip it with locking pliers.', ok: 'The old burner lifts out freely, and you can see the small brass orifice where its front end was.', v: { cam: [0.8, 1.3, -0.5], at: [0, 0.8, -0.1], hi: ['oldBurner', 'pins'], mv: { oldBurner: [0, 0.3, -0.12] }, tool: { id: 'screwdriver', at: [0, 0.8, -0.24], rot: [-90, 0, 0], anim: 'turn' } } },
        { t: 'Clean the orifice and firebox', d: 'Brush out the firebox floor and look into the brass orifice with a flashlight for blockage. Clear spider webs from the burner opening.', why: 'A blocked orifice or webbing starves even a new burner of gas or air.', tip: 'Never drill out or enlarge an orifice; its hole size sets the flame. Tap it gently or replace it if it’s blocked.', ok: 'The orifice hole is open and round, and the firebox floor is free of rust flakes and grease.', v: { cam: [0.4, 1.0, 0.9], at: [0, 0.8, 0.22], hi: ['orifice'], show: ['vbrush'], hide: ['oldBurner'] } },
        { t: 'Swap the electrode', d: 'Pull the old wire off the igniter module, unclip the electrode from the collector box (the little metal box beside the burner), and fit the new one. Route the wire away from the burner.', why: 'A wire draped over a hot surface melts; the electrode should sit square in the collector.', tip: 'Buying a kit? Match the wire length and connector shape to the old one; take it to the store with you.', ok: 'The new electrode clicks into its holder, and the wire runs along the frame, not over the burner.', v: { cam: [0.4, 1.1, 0.6], at: [0.035, 0.81, 0.14], hi: ['newElectrode', 'collectors', 'wires'], show: ['newElectrode'], hide: ['electrode', 'vbrush'], tool: { id: 'pliers', at: [0.06, 0.83, 0.16], rot: [0, 0, -90], anim: 'squeeze' } } },
        { t: 'Install the new burner', d: 'Slide the venturi end fully over the orifice, lay the back on its support and replace the pin or screw.', why: 'If the venturi misses the orifice, gas burns outside the burner, under the control panel.', tip: 'Look from below with a flashlight: the brass orifice tip should be inside the burner opening, not resting beside it.', ok: 'The burner sits level and doesn’t shift when nudged, with the orifice inside the opening.', v: { cam: [0.8, 1.2, 0.9], at: [0, 0.8, 0.1], hi: ['newBurner', 'orifice'], show: ['newBurner'] } },
        { t: 'Test the spark', d: 'Fit a fresh battery in the igniter button and press it in dim light. Look for a strong blue spark between the electrode tip and the burner, a gap of about ⅛–3/16″.', why: 'Test with the gas still off so you can see the spark clearly and adjust the gap.', tip: 'Weak or no spark? Bend the electrode bracket gently to close the gap, and check the wire is pushed fully onto the module.', ok: 'You hear a sharp snap and see a bright blue spark jump right at the burner ports every press.', v: { cam: [0.3, 0.98, 0.4], at: [0.03, 0.82, 0.14], hi: ['spark', 'igniterBtn'], show: ['spark'], fx: 'spark' } },
        { t: 'Reassemble and leak test', d: 'Refit heat tents and grates. Reconnect the regulator, open the tank slowly, and brush soapy water on the connection.', why: 'Growing bubbles mean a leak: tighten and retest before lighting.', tip: 'If bubbles keep forming after you tighten, close the tank and replace the regulator; the seal is damaged.', ok: 'The soap film on every connection stays flat with no growing bubbles.', v: { cam: [0.7, 0.9, 0.9], at: [0.12, 0.62, 0.05], hi: ['soap', 'regulator'], show: ['soap'], hide: ['spark'], mv: { grates: [0, 0, 0], tents: [0, 0, 0] } } },
        { t: 'Light and check the flame', d: 'Lid open, light the burner and look at the flame: steady blue, ½–1″ tall, with small yellow tips. If it’s lazy and yellow and your burner has an air shutter, open it a little.', why: 'Mostly yellow flames mean too little air and leave soot on food.', tip: 'Flame lifting off the burner or roaring? The shutter is too open; close it slightly.', ok: 'Blue flames run evenly along the whole burner with a soft, steady hiss.', v: { cam: [1.0, 1.4, 1.1], at: [0, 0.85, 0], hi: ['flames', 'newBurner'], show: ['flames'], hide: ['soap', 'grates', 'tents'] } },
      ],
      learn: {
        how: 'Gas leaves the valve through a tiny brass orifice and shoots into the burner’s venturi tube, pulling air in with it. The air shutter sets the mix. The gas-air mixture leaves through the burner’s ports and burns. The igniter is a piezo or battery spark generator that fires a spark from the electrode tip to the burner, right where gas flows into the collector box.',
        specs: [['Electrode gap', '⅛–3/16″ (3–5 mm)'], ['Good flame', 'blue, ½–1″, yellow tips'], ['Burner life', '3–7 years typical'], ['Igniter battery', 'AA or AAA'], ['Failed light', 'off, wait 5 min']],
        terms: [['Venturi', 'Flared inlet where gas and air mix.'], ['Orifice', 'Brass jet that meters gas.'], ['Collector box', 'Metal box that catches gas around the electrode.'], ['Carryover tube', 'Channel that lights neighbor burners.'], ['Air shutter', 'Sliding sleeve on some burners that sets how much air mixes in.']],
        mistakes: ['Missing the orifice with the venturi.', 'Letting igniter wires touch hot metal.', 'Buying a “universal” burner that’s the wrong length.', 'Drilling out a blocked orifice.'],
        tips: ['Order parts by the model number on the cart’s data plate.', 'Stainless burners last years longer than painted steel.'],
      },
      pro: 'The manifold or valves leak, the regulator is damaged, or the grill is natural gas plumbed into the house.',
      tricks: [
        ['Order by model number', 'The data label (often inside the cart door or on the back of the firebox) gives the exact model. “Universal” parts often don’t fit.'],
        ['Take the old part shopping', 'Bring the old burner and electrode to the store and compare length, mounting holes and wire ends side by side.'],
        ['Penetrating oil the night before', 'Spray rusty burner screws the day before and they’ll usually come out instead of stripping.'],
        ['Spark test in the dark', 'At dusk the spark is easy to see. A spark that jumps to the frame instead of the burner means the gap or wire routing is wrong.'],
        ['Stainless is worth it', 'Stainless burners and heat tents cost a little more and outlast painted steel two to three times.'],
        ['Replace in pairs', 'If one burner has rusted through, the others are close behind; doing them all at once saves another teardown.'],
      ],
      refs: [
        ['Weber grills troubleshooting: regulator problems and more (BBQ Host)', 'https://bbqhost.com/weber-grills-troubleshooting/'],
        ['Grilling safety tips (NFPA)', 'https://www.nfpa.org/education-and-research/home-fire-safety/grilling'],
        ['Gas grill parts and troubleshooting (Char-Broil)', 'https://www.charbroil.com/how-to/grill-maintenance'],
      ],
    },
    {
      id: 'grill-two-zone',
      title: 'Set up a charcoal grill for two-zone cooking',
      model: 'kettle',
      level: 1,
      time: '30 min',
      cost: '$0–10',
      summary: 'Bank the coals on one side and leave the other side empty with a drip pan. You get a hot zone for searing and a cool zone where thick food roasts gently like an oven, with the lid vent pulling heat across it.',
      intro: { hi: ['coals', 'dripPan'], show: ['coals', 'dripPan', 'food'], preview: true, fx: 'glow' },
      safety: ['Set up on a non-combustible surface, at least 10′ from the house, deck rails and overhangs.', 'Use heat-resistant gloves and long tongs.', 'Never close both vents completely while cooking; the fire dies and the lid fills with stale smoke.', 'Cook to safe internal temperatures and check with a thermometer, not by color.'],
      causes: [['Thick food burns outside, raw inside', 'Direct heat is too intense for anything over about 1½″ thick.'], ['Flare-ups', 'Fat dripping onto coals; the cool zone is the escape.'], ['Smoking or roasting', 'Indirect heat at 225–350 °F.']],
      tools: ['Chimney starter and charcoal', 'Foil drip pan', 'Heat-resistant gloves', 'Long tongs', 'Instant-read or probe thermometer', 'Water'],
      steps: [
        { t: 'Clear ash, open vents', d: 'Empty the old ash, open the bottom vents fully and take off the lid.', why: 'Full airflow helps the fire get established.', tip: 'Do the ash dump while the kettle is cold before you light the chimney.', ok: 'The vent holes are clear and fully open.', v: { cam: [1.3, 1.4, 1.4], at: [0, 0.55, 0], hi: ['vents', 'ashPan'], hide: ['ash'], mv: LID_OFF } },
        { t: 'Light a chimney', d: 'Light a half to full chimney. Wait 15–20 minutes until the top coals are lightly covered in gray ash.', why: 'Less fuel for lower, longer indirect cooks; a full chimney for searing.', tip: 'For cooks over 2 hours, add 8–10 unlit briquettes to the coal pile every hour, or use the snake method (a C-shaped line of coals around the edge).', ok: 'The top coals are gray-coated and glowing.', v: { cam: [1.1, 1.3, 1.2], at: [0.06, 0.75, 0], hi: ['chimney', 'chimneyFire'], show: ['chimney', 'chimneyFire', 'paper'], fx: 'fire' } },
        { t: 'Bank the coals', d: 'Wearing gloves, pour the coals onto one side of the charcoal grate only, piled against the wall.', why: 'Coals on one side make the direct zone; the empty side becomes the indirect zone.', tip: 'Charcoal baskets or a few bricks hold the coals in a neat bank so they don’t spread into the cool side.', ok: 'Coals fill about half the grate, and the other half is empty.', v: { cam: [0.9, 1.35, 0.9], at: [-0.1, 0.55, 0], hi: ['coals'], show: ['coals'], hide: ['chimney', 'chimneyFire', 'paper'], fx: 'glow', tool: { id: 'gloves', at: [-0.38, 0.62, 0.2], rot: [0, 30, 0] } } },
        { t: 'Drip pan on the cool side', d: 'Set a foil pan on the empty side and add a cup or two of water.', why: 'It catches drippings so they don’t flare, and water evens out the heat.', tip: 'Check the water every hour on long cooks; a dry pan of grease can smoke and burn.', ok: 'The pan sits flat on the empty side with water in it.', v: { cam: [0.9, 1.35, 0.9], at: [0.13, 0.57, 0], hi: ['dripPan'], show: ['dripPan'], fx: 'glow' } },
        { t: 'Food over the pan', d: 'Set the cooking grate, sear over the coals if you want, then move the food over the drip pan.', why: 'Searing first gives crust; the cool side finishes the inside without burning.', tip: 'Put the thickest part of the meat facing the coals; it needs the most heat.', ok: 'The food sits over the pan, not over the coals.', v: { cam: [1.0, 1.3, 1.0], at: [0.1, 0.72, 0], hi: ['food', 'cookGrate'], show: ['food'], fx: 'glow' } },
        { t: 'Lid vent over the food', d: 'Put the lid on with its vent above the food, opposite the coals.', why: 'Hot air from the coals is pulled across the food on its way out, like a convection oven.', tip: 'The lid thermometer sits over the cool side this way too, so it reads the air your food actually cooks in.', ok: 'The lid vent is directly over the drip pan.', v: { cam: [1.5, 1.45, 1.6], at: [0, 0.8, 0], hi: ['lidVent', 'lid'], mv: { lid: [0, 0, 0] } } },
        { t: 'Steer the temperature', d: 'Start with the bottom vent about half open and the top mostly open. Close the bottom vent a little to cool down, open it to heat up, and wait 10–15 minutes between changes.', why: 'The bottom vent controls how much air feeds the fire; big changes overshoot.', tip: 'Check food with a thermometer: 165 °F for chicken, 145 °F for whole cuts of pork and beef (plus a 3-minute rest).', ok: 'The grill holds within about 25 °F of your target for 30 minutes.', v: { cam: [1.3, 1.25, 1.3], at: [0, 0.75, 0], hi: ['vents', 'thermo'], fx: 'glow' } },
      ],
      learn: {
        how: 'Direct heat is mostly radiant heat from the coals, great for searing thin food fast. Indirect heat cooks with hot air moving through the closed kettle, like an oven. Putting the lid vent over the food pulls that air across it before it leaves.',
        specs: [['Low and slow', '225–275 °F'], ['Roasting', '325–375 °F'], ['Direct searing', '450 °F+'], ['Poultry done', '165 °F'], ['Whole cuts of pork and beef', '145 °F + 3 min rest'], ['Ground beef', '160 °F']],
        terms: [['Two-zone', 'One hot side, one cool side.'], ['Indirect', 'Food beside, not over, the fire.'], ['Snake method', 'Briquettes in a C around the rim for long low cooks.'], ['Carryover', 'Temperature rise in meat after it comes off the heat.']],
        mistakes: ['Lid vent over the coals.', 'Chasing the temperature with big vent changes.', 'Opening the lid every few minutes.', 'Judging doneness by color.'],
        tips: ['Each lid opening adds 5–15 minutes of cook time.', 'Trust the meat probe more than the lid dial; the dial reads up near the dome.'],
      },
      pro: 'Not really needed; for competition smoking, a dedicated smoker holds temperature with less tending.',
      tricks: [
        ['Small vent moves', 'Move the bottom vent a quarter at a time and wait 10–15 minutes. Kettles react slowly.'],
        ['Reverse sear', 'For thick steaks, cook on the cool side to 10–15 °F below your target, then finish 1–2 minutes a side over the coals.'],
        ['Charcoal baskets', 'Two wire baskets keep coals banked neatly and make it easy to switch which side is hot.'],
        ['Probe at the grate', 'A dual-probe thermometer with one probe clipped at grate level on the cool side tells you the real cooking temperature.'],
        ['If you’re looking, you’re not cooking', 'Every peek lets heat out. Use the probe and keep the lid closed.'],
        ['Wood chunks for smoke', 'Add one or two fist-sized wood chunks on the coals for smoke flavor; chips burn up in minutes.'],
      ],
      refs: [
        ['Safe minimum internal temperature chart (USDA FSIS)', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart'],
        ['Chimney starter 101 (Weber)', 'https://www.weber.com/US/en/blog/burning-questions/chimney-starter-101/weber-29681.html'],
        ['Grilling safety tips (NFPA)', 'https://www.nfpa.org/education-and-research/home-fire-safety/grilling'],
      ],
    },
  ]);

  /* ======================================================================
     CAMPING: hammock + camp stove
     ====================================================================== */
  TB.more('camping', [
    {
      id: 'hang-hammock',
      title: 'Hang a camping hammock',
      model: 'hammock',
      level: 1,
      time: '15–30 min',
      cost: '$0 (with your hammock)',
      summary: 'Wide straps around two healthy trees, suspension at about 30° from horizontal, and an 18″ sit height. That sag is what makes a hammock comfortable and keeps the load on the trees reasonable.',
      intro: { show: ['straps', 'biners', 'suspension', 'hammockBody', 'ridgeline', 'tarp', 'tarpLines', 'stakes', 'drips'], preview: true },
      safety: ['Look up: never hang under dead limbs or dead trees (“widowmakers”).', 'Use only live trees at least 6″ thick, and never hang from a single tree and a post or car.', 'Keep the sit height low (about 18″). A fall from a hammock hung at chest height can injure you.', 'Use 1″ or wider tree straps. Thin rope cuts into bark and damages trees, and many parks ban it.'],
      causes: [['Hung too tight', 'A flat, tight hang squeezes you like a banana and multiplies the force on the anchors.'], ['Too much sag', 'Butt drags on the ground and the edges fold over you.'], ['Rain gets in', 'Water runs along the straps into the hammock without drip lines.']],
      tools: ['Hammock with suspension', 'Tree straps, 1″+ webbing (2)', 'Locking carabiners (2)', 'Structural ridgeline (optional)', 'Tarp + guylines + stakes', 'Small mallet or rock'],
      steps: [
        { t: 'Pick two healthy trees', d: 'Find two live trees 12–15 ft apart, at least 6″ thick, and check overhead for dead branches.', why: 'Distance sets how high your straps go; a dead limb is the real hazard in the woods.', v: { cam: [1.2, 3.2, 6.6], at: [-0.5, 3.0, 0], hi: ['trees', 'hazard'] } },
        { t: 'Wrap the straps', d: 'Wrap each strap around a trunk at about head height and feed the end through its loop. Set both at the same height.', why: 'Wide webbing spreads the load so it doesn’t cut bark, and matching heights keep the hammock level.', v: { cam: [3.4, 2.0, 1.8], at: [2.2, 1.6, 0], hi: ['straps'], show: ['straps'] } },
        { t: 'Clip in the hammock', d: 'Clip a carabiner to a strap loop on each side so the hammock hangs centered.', why: 'Using the daisy-chain loops lets you fine-tune length without retying.', v: { cam: [3.0, 1.8, 2.0], at: [1.8, 1.4, 0], hi: ['biners', 'suspension'], show: ['biners', 'suspension', 'hammockBody', 'ridgeline'] } },
        { t: 'Set the 30° angle', d: 'Adjust strap height or loops until the suspension runs about 30° below horizontal. A finger-gun with thumb up sighted along it is close to 30°.', why: 'At 30° each strap carries about your body weight. Pull it flat and the force can triple.', v: { cam: [3.2, 1.7, 1.6], at: [1.7, 1.4, 0], hi: ['angleGuide', 'suspension'], show: ['angleGuide'] } },
        { t: 'Check the sit height', d: 'Sit in the middle. Your seat should be about 18″ off the ground, like a chair.', why: 'Low enough to be safe, high enough not to bottom out once the fabric stretches.', v: { cam: [0.4, 1.2, 3.4], at: [0, 0.6, 0], hi: ['hammockBody', 'ridgeline'], hide: ['angleGuide'], tool: { id: 'tape', at: [0.1, 0.0, 0.3], rot: [0, 0, 0] } } },
        { t: 'Add drip lines', d: 'Tie a short cord to each suspension line inside the tarp so it hangs below.', why: 'Rain runs down the straps; the drip line sheds it before it reaches the hammock.', v: { cam: [2.8, 1.6, 2.4], at: [1.6, 1.2, 0], hi: ['drips'], show: ['drips'] } },
        { t: 'Pitch the tarp', d: 'Run a ridgeline about 1 ft above the hammock suspension, drape the tarp over and stake the guylines out.', why: 'A tarp that overhangs each end by 6″ or more keeps you dry in blowing rain.', v: { cam: [2.0, 2.8, 6.0], at: [0, 1.2, 0], hi: ['tarp', 'tarpLines', 'stakes'], show: ['tarp', 'tarpLines', 'stakes'], tool: { id: 'hammer', at: [1.65, 0.08, 1.8], rot: [0, 0, 90], anim: 'swing' } } },
        { t: 'Lie on the diagonal', d: 'Lie at a slight angle, head to one side of center and feet to the other.', why: 'On the diagonal the fabric pulls flat under you instead of curling you into a banana.', v: { cam: [0.6, 2.4, 3.2], at: [0, 0.6, 0], hi: ['hammockBody'] } },
      ],
      learn: {
        how: 'Rope tension depends on angle. A strap at 30° below horizontal carries about the hanger’s full weight; flatten it to 10° and it’s nearly three times that. A deep sag also lets you lie diagonally, which flattens the fabric. A structural ridgeline (about 83% of the hammock length) locks in the same sag every time.',
        specs: [['Hang angle', '≈30°'], ['Sit height', '16–19″'], ['Tree spacing', '12–15 ft'], ['Strap width', '≥ 1″'], ['Ridgeline', '≈83% of hammock length']],
        terms: [['Widowmaker', 'Dead limb that can fall.'], ['Drip line', 'Cord that diverts rain from the suspension.'], ['Structural ridgeline', 'Fixed cord between hammock ends that sets the sag.'], ['Daisy chain', 'Strap with sewn loops for quick adjusting.']],
        mistakes: ['Hanging it banjo-tight.', 'Using thin rope on trees.', 'Hanging too high.'],
        tips: ['Most hammocks feel best with your head slightly higher than your feet.', 'An underquilt beats a sleeping pad for cold nights.'],
      },
      pro: 'Not needed. For group sites, check campground rules; some ban hammocks on young trees.',
    },
    {
      id: 'camp-stove',
      title: 'Set up and maintain a two-burner camp stove',
      model: 'campStove',
      level: 1,
      time: '15 min setup · 20 min cleaning',
      cost: '$5–15',
      summary: 'Hand-tighten the regulator into the stove and the 1 lb cylinder into the regulator, leak-test, light with the lid and wind baffles up. Afterward, clean the burners and clear the jets so spiders don’t move in.',
      intro: { show: ['wind', 'regulator', 'cylinder', 'pot', 'flames'], preview: true },
      safety: ['Use outdoors only, never in a tent, camper or vestibule: it makes carbon monoxide.', 'Keep 4 ft from tents and anything that burns, and never leave it lit unattended.', 'Leak-test with soapy water, never a flame.', 'Don’t use pots so large they shade the regulator and cylinder; heat there can vent gas.'],
      causes: [['Weak flame', 'Cold cylinder, wind, or a partly blocked jet.'], ['Yellow flame', 'Spiders or debris in the burner tube.'], ['Gas smell', 'Cross-threaded or loose connection, worn O-ring.']],
      tools: ['1 lb propane cylinders', 'Long lighter or matches', 'Spray bottle of soapy water', 'Soft cloth + mild dish soap', 'Pipe cleaner', 'Small brush'],
      steps: [
        { t: 'Set it on a stable table', d: 'Put the stove on a level, sturdy table in the open. Open the lid and lock the side wind baffles.', why: 'A level stove keeps pots from sliding; the baffles block wind that steals most of the heat.', v: { cam: [0.9, 1.35, 1.1], at: [0, 0.85, 0], hi: ['lid', 'wind'], show: ['wind'] } },
        { t: 'Valves off, check the O-ring', d: 'Turn both burner valves fully off. Look into the regulator inlet for a clean, uncracked O-ring.', why: 'A missing or cracked O-ring is the most common source of leaks.', v: { cam: [0.55, 1.0, 0.5], at: [0.28, 0.8, 0.05], hi: ['knobs', 'oring'] } },
        { t: 'Attach regulator and cylinder', d: 'Screw the regulator into the stove hand-tight. Remove the cylinder’s cap and screw the cylinder into the regulator hand-tight, never cross-threaded.', why: 'These connections seal with O-rings, not force. Wrenches crack them.', v: { cam: [0.8, 1.05, 0.7], at: [0.42, 0.82, 0.05], hi: ['regulator', 'cylinder'], show: ['regulator', 'cylinder', 'cap'] } },
        { t: 'Leak test', d: 'Spray soapy water on both connections. Growing bubbles mean a leak: back off, re-seat and retest.', why: 'Propane is heavier than air and pools around your feet and table.', v: { cam: [0.6, 1.0, 0.6], at: [0.38, 0.82, 0.05], hi: ['soap', 'regulator'], show: ['soap'] } },
        { t: 'Light it', d: 'Hold a lit lighter at the burner edge, then open its valve slowly. Adjust to a steady blue flame.', why: 'Flame first, then gas, so unburned gas never builds up under the grate.', v: { cam: [0.7, 1.15, 0.8], at: [0.13, 0.88, 0], hi: ['flames', 'knobs'], show: ['flames', 'lighter'], hide: ['soap'] } },
        { t: 'Cook with the baffles up', d: 'Set the pot centered on the grate. Keep the lid and baffles up while cooking.', why: 'Centered pots heat evenly and keep heat away from the regulator.', v: { cam: [0.9, 1.25, 1.0], at: [-0.1, 0.9, 0], hi: ['pot'], show: ['pot'], hide: ['lighter'] } },
        { t: 'Shut down and disconnect', d: 'Close the valves, let the stove cool, unscrew the cylinder and put its cap back on.', why: 'A cylinder left attached can slowly leak through the regulator during storage.', v: { cam: [0.8, 1.05, 0.7], at: [0.42, 0.82, 0.05], hi: ['cylinder', 'cap'], hide: ['flames', 'pot', 'cylinder'] } },
        { t: 'Clean and clear the jets', d: 'Wipe the case with mild soapy water. Lift the burner caps, and run a pipe cleaner through the burner tubes.', why: 'Spiders love the burner tubes. Webs cause yellow, sooty flames and can make gas burn outside the burner.', v: { cam: [0.55, 1.1, 0.6], at: [0.13, 0.84, 0.05], hi: ['burners', 'cleaner'], show: ['cleaner'], hide: ['regulator'] } },
      ],
      learn: {
        how: 'The 1 lb cylinder holds liquid propane at around 100–150 psi. The regulator drops that to a steady low pressure, and each valve meters gas to a jet in the burner tube, where it mixes with air and burns at the ring of ports. Wind blows the flame sideways, so baffles matter more than burner size.',
        specs: [['Burners', '≈10,000 BTU each'], ['1 lb cylinder', '≈1 hr on high (both burners)'], ['Cold weather', 'Output drops below about 40 °F'], ['Clearance', '4 ft from tents and combustibles']],
        terms: [['Regulator', 'Lowers cylinder pressure to burner pressure.'], ['Jet / orifice', 'Small brass hole that meters gas.'], ['Wind baffle', 'Folding panels that shield flames.']],
        mistakes: ['Using a wrench on the cylinder.', 'Cooking in a tent vestibule.', 'Storing with the cylinder attached.'],
        tips: ['Keep a cylinder in your jacket on cold mornings for better pressure.', 'An adapter hose lets you run from a 20 lb tank on longer trips.'],
      },
      pro: 'The regulator leaks with a new O-ring, or the valves won’t shut off fully. Replace the regulator or the stove.',
    },
  ]);

  /* ======================================================================
     TECH: laptop variant of overheating + three new guides
     ====================================================================== */
  const PANEL_OFF = { bottomPanel: [0.34, -0.019, 0.05] };
  const hot = TB.repair('tech', 'pc-overheat');
  hot.variants = [
    { id: 'desktop', name: 'Desktop PC', blurb: 'Tower case with a removable side panel.' },
    {
      id: 'laptop',
      name: 'Laptop',
      blurb: 'Fans roar, bottom gets hot, or it slows down under load.',
      model: 'laptop',
      level: 2,
      time: '30–60 min',
      cost: '$5–15',
      summary: 'Laptop fans pull air across a small stack of fins at the back vents, and dust mats right against those fins. Open the bottom cover, disconnect the battery, and clear the fins and fan blades.',
      intro: { hi: ['dust', 'fins'], fx: 'run' },
      safety: ['Shut down fully (not sleep), unplug the charger and disconnect the internal battery before cleaning.', 'Hold each fan still while using air; spinning it too fast can damage the bearing.', 'Ground yourself on metal first and work on a hard surface, not carpet.', 'Opening may void the warranty; check first.'],
      causes: [['Dust mat on the fins', 'Felt-like layer right behind the vent.'], ['Blocked vents', 'Using it on a bed or couch.'], ['Old thermal paste', 'Laptops 4+ years old.'], ['Worn fan', 'Grinding or rattling.']],
      tools: ['Precision screwdriver set (Phillips #0/#00, Torx T5)', 'Plastic opening picks', 'Compressed air or electric duster', 'Soft brush', 'Toothpick (to hold fans)', 'Temperature monitor app'],
      steps: [
        { t: 'Check temps first', d: 'With a monitor app, note CPU temps at idle and under load, and feel the exhaust at the rear vent.', why: 'A before-and-after number shows whether the cleaning worked.', v: { cam: [0.32, 1.12, 0.42], at: [0, 0.77, 0], hi: ['fins'], xray: true, fx: 'run' } },
        { t: 'Shut down and remove the screws', d: 'Shut down, unplug, flip onto a soft cloth and remove the bottom screws. Keep them in order; lengths differ.', why: 'A long screw in a short hole can punch through the keyboard.', v: { cam: [0.3, 1.05, 0.35], at: [0, 0.775, 0], hi: ['screws'], tool: { id: 'screwdriver', at: [0.17, 0.775, 0.115], rot: [0, 0, 0], anim: 'turn' } } },
        { t: 'Pop the bottom cover', d: 'Slide a plastic pick into the seam near a hinge and work around, releasing the clips.', why: 'Metal tools scratch the case and can short the board.', v: { cam: [0.32, 1.0, 0.42], at: [0.1, 0.77, 0], hi: ['bottomPanel', 'pick'], show: ['pick'], hide: ['screws'], mv: PANEL_OFF } },
        { t: 'Disconnect the battery', d: 'Pull the battery connector straight out by its plastic body, not the wires.', why: 'The board stays powered from the battery even when the laptop looks off.', v: { cam: [0.12, 0.92, 0.2], at: [0.03, 0.765, 0.02], hi: ['batConn'], hide: ['pick'], mv: { batConn: [0, 0, 0.012] } } },
        { t: 'Hold the fans and blow the fins', d: 'Hold each fan with a toothpick and blow short bursts through the fins from inside, toward the vent.', why: 'The dust mat sits on the fan side of the fins; blowing outward pushes it out of the laptop.', v: { cam: [0.0, 1.0, 0.25], at: [-0.11, 0.77, -0.08], hi: ['fins', 'fans', 'air'], show: ['air'], hide: ['dust'] } },
        { t: 'Brush the blades', d: 'Brush each fan blade and the heat pipe area. Look for a worn fan or dried paste if it’s an older machine.', why: 'Dust on the blades unbalances the fan and makes it noisy.', v: { cam: [0.15, 1.0, 0.25], at: [0.11, 0.77, -0.06], hi: ['fans', 'heatpipe'], hide: ['air'], fx: 'run' } },
        { t: 'Reconnect, close, recheck', d: 'Reconnect the battery, refit the cover and screws, and rerun the same load test.', why: 'A dusty laptop usually drops 10–20 °C and gets noticeably quieter.', v: { cam: [0.32, 1.12, 0.42], at: [0, 0.77, 0], hi: ['bottomPanel'], show: ['screws'], mv: { bottomPanel: [0, 0, 0], batConn: [0, 0, 0] }, fx: 'run' } },
      ],
      learn: {
        how: 'Heat from the processor travels through copper heat pipes to a thin stack of fins at the rear vent. A blower fan pushes air through the fins and out. Because the fins are packed tightly, dust from inside builds a felt mat on their inlet face, and the fan just pushes against it.',
        specs: [['Idle CPU', '35–55 °C'], ['Heavy load', '75–95 °C'], ['Throttling', '≈ 95–100 °C'], ['Clean every', '12–18 months']],
        terms: [['Heat pipe', 'Sealed copper tube that moves heat quickly.'], ['Blower fan', 'Centrifugal fan that blows sideways.'], ['Throttling', 'Automatic slowdown to limit heat.']],
        mistakes: ['Blowing in from the vent (packs dust deeper).', 'Letting fans spin under air.', 'Leaving the battery connected.'],
        tips: ['A cheap laptop stand that lifts the back improves airflow a lot.', 'Search “iFixit” plus your model for exact screw maps.'],
      },
      pro: 'Temps stay high after cleaning (thermal paste or a failing fan), or the laptop is glued shut.',
    },
  ];

  TB.more('tech', [
    {
      id: 'mesh-wifi',
      title: 'Set up a mesh Wi-Fi system',
      model: 'meshHome',
      kind: 'build',
      level: 1,
      time: '1–2 hrs',
      cost: '$150–500',
      summary: 'Replace one router with a main node plus satellites placed halfway between it and the dead zones. One network name covers the house, and an optional Ethernet backhaul makes it as fast as wired.',
      intro: { show: ['mainNode', 'node2', 'node3', 'covMain', 'cov2', 'cov3'], preview: true },
      safety: ['Write down your ISP login and current Wi-Fi name and password before unplugging anything.', 'Keep nodes in open air, not in cabinets or behind TVs; they get warm.'],
      causes: [['Map first', 'Run a speed test in every room to find the dead zones.'], ['Placement rule', 'Satellites go halfway between good signal and the dead zone, usually 30–40 ft and no more than 2 walls apart.'], ['ISP gateway', 'If your modem is also a router, plan to put it in bridge mode or turn its Wi-Fi off.']],
      tools: ['Mesh kit (main + 1–2 satellites)', 'Ethernet cable (included)', 'Phone with the mesh app', 'Speed test app', 'Optional: Cat6 for wired backhaul'],
      steps: [
        { t: 'Map the dead zones', d: 'Run a speed test in each room and the yard, and note where it drops off.', why: 'Placement should solve real weak spots, not guesses.', v: { cam: [7.5, 10.5, 10.5], at: [1, 0, -1.5], hi: ['deadZone', 'phone'], show: ['deadZone', 'phone'], fx: 'dead' } },
        { t: 'Swap in the main node', d: 'Unplug the modem and old router. Connect the main node to the modem with Ethernet, power the modem, wait two minutes, then power the node.', why: 'The modem learns the new router’s address only when it restarts.', v: { cam: [-1.8, 3.2, 6.6], at: [-4.5, 0.9, 3.6], hi: ['mainNode', 'modem'], show: ['mainNode'], hide: ['oldRouter'] } },
        { t: 'Set it up in the app', d: 'Follow the app. Reuse your old Wi-Fi name and password so every device reconnects on its own. Let it update firmware.', why: 'Same name and password means no re-pairing printers, TVs and smart plugs.', v: { cam: [-1.8, 3.2, 6.6], at: [-4.5, 0.9, 3.6], hi: ['mainNode'], show: ['covMain'] } },
        { t: 'Place satellite 1 halfway', d: 'Put the first satellite in the open, about halfway toward the dead zone, ideally at table height or higher.', why: 'A satellite at the edge of coverage has a weak link back, so everything behind it is slow too.', v: { cam: [4.0, 7.0, 8.0], at: [-1, 0.5, 1.5], hi: ['node2'], show: ['node2', 'cov2'] } },
        { t: 'Place satellite 2', d: 'Add the next one toward the far bedroom and patio, again in line of sight of satellite 1 where you can.', why: 'Each hop should have a strong link; check the app’s placement indicator.', v: { cam: [8.5, 7.5, 4.5], at: [2.5, 0.3, -2.0], hi: ['node3'], show: ['node3', 'cov3'] } },
        { t: 'Wire the backhaul if you can', d: 'If there’s Ethernet in the walls, connect a satellite to it. The app detects wired backhaul automatically.', why: 'Wired backhaul frees all the wireless bandwidth for your devices.', v: { cam: [-1.0, 6.0, 7.5], at: [-2.0, 0.3, 2.0], hi: ['ethCable'], show: ['ethCable'] } },
        { t: 'Retest every room', d: 'Run the speed test again in each spot, including the patio.', why: 'If a room is still weak, move the nearest satellite a few feet; small moves matter.', v: { cam: [7.5, 10.5, 10.5], at: [0, 0, 0], hi: ['covMain', 'cov2', 'cov3', 'phone'], hide: ['deadZone'] } },
      ],
      learn: {
        how: 'A mesh system is several radios that act as one network. The main node routes your internet; satellites repeat it, talking to each other over a dedicated backhaul link (wireless or Ethernet) and to your devices on the regular bands. Your phone hops to the nearest node as you walk around.',
        specs: [['Node spacing', '30–40 ft, ≤ 2 walls'], ['Coverage per node', '≈1,500–2,000 sq ft'], ['Wired backhaul', 'Cat5e or better'], ['Wi-Fi 6/6E/7', 'Pick 6E or 7 for many devices']],
        terms: [['Backhaul', 'The link between nodes.'], ['Bridge mode', 'Turns an ISP gateway into a plain modem.'], ['Double NAT', 'Two routers in a row; causes gaming and VPN issues.'], ['SSID', 'Network name.']],
        mistakes: ['Putting satellites in the dead zone itself.', 'Hiding nodes in cabinets.', 'Leaving the ISP gateway’s Wi-Fi on with the same name.'],
        tips: ['Elevate nodes; signal spreads out and slightly down.', 'Give the main node a battery backup and the network survives short outages.'],
      },
      pro: 'You want Ethernet run through finished walls to every node, or your ISP gateway can’t be bridged.',
      addons: [
        { id: 'outdoor', part: 'aoOutdoor', name: 'Outdoor node', cat: 'Tech', blurb: 'Weather-rated node for the patio and yard.', cost: [150, 300], how: 'Mount it on an exterior wall under the eave, within sight of an indoor node, and plug it into a GFCI outlet with a bubble cover.', needs: ['Outdoor mesh node', 'In-use outlet cover'], shop: 'Outdoor mesh wifi satellite' },
        { id: 'ups', part: 'aoUps', name: 'Battery backup (UPS)', cat: 'Safety', blurb: 'Keeps modem and main node up through blips.', cost: [60, 150], how: 'Plug the modem and main node into the battery-side outlets.', needs: ['UPS battery backup'], shop: 'UPS battery backup for router' },
        { id: 'switch', part: 'aoSwitch', name: 'Gigabit switch at the TV', cat: 'Tech', blurb: 'Wire the TV, console and streamer off a satellite’s port.', cost: [20, 40], how: 'Connect the satellite’s spare Ethernet port to a 5-port switch and patch each device in.', needs: ['5-port gigabit switch', 'Ethernet cables'], shop: '5 port gigabit switch' },
        { id: 'cam', part: 'aoCam', name: 'Wi-Fi security camera', cat: 'Safety', blurb: 'Now there’s signal at the back of the house.', cost: [50, 200], how: 'Mount it at 8–10 ft on the back corner, aimed along the yard.', needs: ['Wi-Fi security camera'], shop: 'Outdoor wifi security camera' },
      ],
    },
    {
      id: 'ssd-upgrade',
      title: 'Upgrade a laptop’s SSD and RAM',
      model: 'laptop',
      kind: 'build',
      level: 2,
      time: '1–2 hrs (plus cloning)',
      cost: '$80–300',
      summary: 'Clone the old drive to a bigger NVMe SSD over USB, then swap it and the RAM under the bottom cover. Most laptops with removable parts take 30 minutes once you’re in.',
      intro: { hi: ['ssd', 'ram'] },
      safety: ['Back up your files before anything else.', 'Shut down fully, unplug, and disconnect the internal battery before touching parts.', 'Touch bare metal to discharge static; handle modules by their edges.', 'Check your model’s manual: some laptops have soldered RAM or storage.'],
      causes: [['Check compatibility', 'Note the SSD size (2280, 2242), interface (NVMe/SATA), and RAM type (DDR4/DDR5 SO-DIMM) from the manual or a scan tool.'], ['Clone or fresh install', 'Cloning keeps everything; a fresh install is cleaner on old systems.'], ['Matched RAM', 'Install a matched pair for dual-channel speed.']],
      tools: ['New M.2 NVMe SSD', 'SO-DIMM RAM kit', 'USB M.2 enclosure (for cloning)', 'Cloning software', 'Precision screwdrivers', 'Plastic opening picks', 'Anti-static wrist strap'],
      steps: [
        { t: 'Clone the drive', d: 'Put the new SSD in a USB enclosure, plug it in and clone the old drive with your cloning software.', why: 'You boot straight into your existing system after the swap; the enclosure later becomes a handy backup drive.', v: { cam: [0.55, 1.1, 0.55], at: [0.25, 0.77, 0.06], hi: ['enclosure'], show: ['enclosure', 'newSsd'], mv: { newSsd: [0.4, 0.004, 0.076] }, xray: true } },
        { t: 'Shut down and open the cover', d: 'Shut down, unplug, flip onto a soft cloth and remove the bottom screws in order.', why: 'Screws often differ in length; keep a map.', v: { cam: [0.3, 1.05, 0.35], at: [0, 0.775, 0], hi: ['screws'], hide: ['enclosure', 'newSsd'], mv: { newSsd: [0, 0, 0] }, tool: { id: 'screwdriver', at: [-0.17, 0.775, 0.115], rot: [0, 0, 0], anim: 'turn' } } },
        { t: 'Lift the cover', d: 'Pry the seam with a plastic pick starting at a hinge corner, then lift the cover off.', why: 'Clips release cleanly when you work around the edge.', v: { cam: [0.32, 1.0, 0.42], at: [0.1, 0.77, 0], hi: ['bottomPanel', 'pick'], show: ['pick'], hide: ['screws'], mv: PANEL_OFF } },
        { t: 'Disconnect the battery', d: 'Unplug the battery connector by its plastic body.', why: 'Live power while swapping modules can damage them.', v: { cam: [0.12, 0.92, 0.2], at: [0.03, 0.765, 0.02], hi: ['batConn'], hide: ['pick'], mv: { batConn: [0, 0, 0.012] } } },
        { t: 'Remove the old SSD', d: 'Undo the single retaining screw; the SSD springs up at an angle. Slide it out of the slot.', why: 'M.2 cards sit at about 30° when free; never bend them flat by force.', v: { cam: [-0.05, 0.92, 0.18], at: [-0.07, 0.765, 0.004], hi: ['ssd', 'ssdScrew'], mv: { ssd: [-0.04, 0.03, 0], ssdScrew: [0, 0.02, 0] }, rt: { ssd: [0, 0, 18] }, tool: { id: 'screwdriver', at: [-0.029, 0.79, 0.004], rot: [0, 0, 0], anim: 'turn' } } },
        { t: 'Install the new SSD', d: 'Slide the cloned SSD into the slot at an angle, press it flat and refit the screw.', why: 'The notch only fits one way, and the screw stops it lifting out of the contacts.', v: { cam: [-0.05, 0.92, 0.18], at: [-0.07, 0.765, 0.004], hi: ['newSsd', 'm2Slot'], show: ['newSsd'], hide: ['ssd'], mv: { ssdScrew: [0, 0, 0] } } },
        { t: 'Swap the RAM', d: 'Spread the two side clips; the module pops up. Pull it out, insert the new one at 30° until the gold edge disappears, and press down until it clicks.', why: 'Seated halfway, RAM causes no-boot or random crashes.', v: { cam: [0.14, 0.92, 0.18], at: [0.07, 0.765, 0.0], hi: ['newRam', 'ramSlot'], show: ['newRam'], hide: ['ram'] } },
        { t: 'Close up and boot', d: 'Reconnect the battery, refit the cover and screws, and boot. Confirm the new memory and drive size in system info.', why: 'If it doesn’t boot from the new SSD, set it as first boot device in BIOS/UEFI.', v: { cam: [0.32, 1.12, 0.42], at: [0, 0.77, 0], hi: ['bottomPanel'], show: ['screws'], mv: { bottomPanel: [0, 0, 0], batConn: [0, 0, 0] } } },
      ],
      learn: {
        how: 'An M.2 NVMe SSD plugs straight into a PCIe slot on the motherboard, which is why it’s several times faster than older SATA drives. SO-DIMM is the laptop size of RAM. Both are standard parts in many laptops, so upgrading them is one of the cheapest ways to make an older machine feel new.',
        specs: [['Common SSD size', 'M.2 2280 (22 × 80 mm)'], ['Insert angle', '≈30°'], ['RAM (DDR4)', '260-pin SO-DIMM'], ['RAM (DDR5)', '262-pin SO-DIMM']],
        terms: [['NVMe', 'Fast protocol for SSDs on PCIe.'], ['SO-DIMM', 'Laptop memory module.'], ['Clone', 'Exact copy of a drive.'], ['Dual-channel', 'Two matched modules for more bandwidth.']],
        mistakes: ['Buying SATA M.2 for an NVMe-only slot (or vice versa).', 'Mixing DDR4 and DDR5.', 'Forgetting the battery connector.'],
        tips: ['Look up your exact model on the memory maker’s compatibility tool.', 'Keep the old SSD as a backup until the new one has run a week.'],
      },
      pro: 'RAM or storage is soldered, the laptop is under warranty, or you need data recovered from a failing drive.',
    },
    {
      id: 'ethernet-jack',
      title: 'Run Ethernet to a wall jack',
      model: 'ethJack',
      level: 2,
      time: '2–3 hrs',
      cost: '$30–80',
      summary: 'Drop Cat6 down an interior wall from the attic, set a low-voltage bracket, punch the wires onto a keystone jack in T568B order and test every pair.',
      intro: { show: ['bracket', 'jack', 'plate', 'cable', 'plateHole', 'patch'], preview: true },
      safety: ['Stay out of stud bays with electrical boxes or cables; keep Ethernet at least 6–12″ from power cables and cross them at 90°.', 'In the attic, step only on joists and wear a dust mask.', 'Don’t drill fire-blocking or top plates on fire-rated walls without checking code.'],
      causes: [['Faster, steadier than Wi-Fi', 'For desktop PCs, TVs, consoles and mesh backhaul.'], ['Pick the bay', 'An interior wall below an accessible attic is easiest.'], ['Pick the standard', 'T568B is the common U.S. color order; just use the same on both ends.']],
      tools: ['Cat6 solid-copper cable', 'Cat6 keystone jack + 1-port wall plate', 'Low-voltage old-work bracket', 'Stud finder', 'Jab saw', 'Drill + ¾″ spade or auger bit (long)', 'Fish tape or glow rods', '110 punch-down tool', 'Cable tester', 'Utility knife / cable stripper'],
      steps: [
        { t: 'Find a clear stud bay', d: 'Use a stud finder to mark the studs and check the bay is free of wiring and pipes.', why: 'The cable must drop straight from the attic, so the bay needs to be clear top to bottom.', v: { cam: [0.6, 0.8, 1.2], at: [0.2, 0.5, 0], hi: ['finder', 'wall'], show: ['finder'] } },
        { t: 'Trace and cut the opening', d: 'Level the bracket against the wall at outlet height, trace its opening, then cut along the line with a jab saw.', why: 'A tight cut lets the bracket wings clamp firmly.', v: { cam: [0.45, 0.55, 0.6], at: [0.2, 0.4, 0], hi: ['outline', 'jabSaw'], show: ['outline', 'jabSaw'], hide: ['finder'] } },
        { t: 'Drill the top plate', d: 'In the attic, locate the same bay (measure from a corner or a pipe) and drill a ¾″ hole down through the top plate.', why: 'Drilling dead-center in the plate avoids exiting into the drywall.', v: { cam: [0.7, 2.9, 0.8], at: [0.2, 2.42, -0.06], hi: ['plateHole', 'topPlate'], show: ['plateHole'], hide: ['outline', 'jabSaw', 'patchPiece'], tool: { id: 'drill', at: [0.2, 2.442, -0.057], rot: [0, 0, 0], anim: 'spin' } } },
        { t: 'Fish the cable down', d: 'Push a fish tape down from the attic to the opening, tape the cable to it and pull it up through. Leave 12″ of slack and label both ends.', why: 'Slack lets you re-terminate later; labels save guessing at the other end.', v: { cam: [1.1, 1.4, 1.4], at: [0.2, 1.3, -0.03], hi: ['fishTape', 'cable', 'slack'], show: ['fishTape', 'cable', 'slack'], xray: true } },
        { t: 'Set the bracket', d: 'Feed the cable through the bracket, push it into the opening and tighten the screws until the wings clamp the drywall.', why: 'Low-voltage brackets have no back, so cable can be bent gently without crushing.', v: { cam: [0.35, 0.5, 0.45], at: [0.2, 0.4, 0], hi: ['bracket'], show: ['bracket'], hide: ['fishTape'], tool: { id: 'screwdriver', at: [0.23, 0.435, 0.003], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Punch down the jack', d: 'Strip 2″ of jacket, lay each conductor in its T568B slot (twists kept within ½″) and seat it with the punch-down tool, blade toward the cut end.', why: 'Untwisting too much causes crosstalk and failed Cat6 tests.', v: { cam: [0.4, 0.55, 0.5], at: [0.2, 0.42, 0.1], hi: ['jack', 'punch'], show: ['jack', 'punch'], mv: { jack: [0, 0.0, 0.12] } } },
        { t: 'Mount the plate', d: 'Snap the jack into the wall plate, tuck the slack into the wall and screw the plate to the bracket.', why: 'Loose loops in the bay are fine; sharp kinks are not.', v: { cam: [0.35, 0.5, 0.5], at: [0.2, 0.4, 0], hi: ['plate', 'jack'], show: ['plate'], hide: ['punch', 'slack'], mv: { jack: [0, 0, 0] } } },
        { t: 'Terminate the far end and test', d: 'Terminate the attic end into a jack or patch panel the same way, then run a cable tester across the link.', why: 'All eight lights in order means every wire is right; a crossed pair shows up immediately.', v: { cam: [0.6, 0.55, 0.9], at: [0.3, 0.25, 0.15], hi: ['tester', 'patch'], show: ['tester', 'patch'], fx: 'test' } },
      ],
      learn: {
        how: 'Ethernet sends data over four twisted pairs. The twists cancel interference, which is why Cat6 rules limit how much you untwist at a jack. A keystone jack uses insulation-displacement slots: the punch-down tool pushes each wire between sharp contacts that cut through the insulation, then trims the excess.',
        specs: [['Max run', '328 ft (100 m)'], ['Cat6 speed', '1 Gb/s (10 Gb/s ≤ 180 ft)'], ['Untwist limit', '≤ ½″'], ['Min bend radius', '4× cable diameter'], ['T568B', 'W/O, O, W/G, B, W/B, G, W/Br, Br']],
        terms: [['Keystone', 'Snap-in jack module.'], ['Punch-down', 'Tool that seats and trims wires.'], ['T568B', 'Common U.S. color order.'], ['Old-work bracket', 'Low-voltage ring that clamps to existing drywall.']],
        mistakes: ['Using CCA (copper-clad) cable.', 'Running alongside electrical cable.', 'Stapling the cable tight.'],
        tips: ['Pull two cables while the wall is open; the second is nearly free.', 'Use a pull string and leave it in the wall for next time.'],
      },
      pro: 'There’s fire blocking in the bay, it’s an exterior wall full of insulation, or you want a whole-house structured wiring panel.',
    },
  ]);
})();
