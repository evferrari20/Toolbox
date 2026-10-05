/* GRW · Grow: real gardening (seed starting, tomatoes, soil, trees, pruning, herbs, pollinator beds,
   watering, garlic & potatoes). Real meters (unit: 1). Plants are built from extruded leaf outlines,
   lathes and tubes; walkthroughs show each growth stage appearing in turn. */
(function () {
  const DS = THREE.DoubleSide;
  const AO = TB.AO;
  const GARDEN = (o) =>
    Object.assign({ unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 10 }, tex: ['wood_planks', 'forrest_ground_01', 'pine_bark', 'interlocking_concrete_pavers'] }, o);

  /* ---------- plant kit ---------- */
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
  // Long strap leaf (garlic, grasses, iris).
  function strapPts(L, W) {
    return [[W / 2, 0], [W / 2, L * 0.75], [W * 0.15, L], [-W * 0.15, L], [-W / 2, L * 0.75], [-W / 2, 0]];
  }
  // A group whose +Y points outward at compass angle yaw (deg) and elevation elev (deg above horizontal).
  const orient = (K, p, pos, yaw, elev) => K.group(K.group(p, pos, [0, yaw, 0]), [0, 0, 0], [90 - elev, 0, 0]);
  function leaf(K, p, pos, yaw, elev, L, W, mat, serr) {
    const g = orient(K, p, pos, yaw, elev);
    K.ext(g, leafPts(L, W, 10, serr), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  function strap(K, p, pos, yaw, elev, L, W, mat, bend) {
    const g = orient(K, p, pos, yaw, elev);
    if (!bend) {
      K.ext(g, strapPts(L, W), 0.0012, mat, [0, 0, -0.0006], null, 0);
      return g;
    }
    // two segments so long leaves arch over
    K.ext(g, [[W / 2, 0], [W / 2, L * 0.55], [-W / 2, L * 0.55], [-W / 2, 0]], 0.0012, mat, [0, 0, -0.0006], null, 0);
    const g2 = K.group(g, [0, L * 0.55, 0], [bend, 0, 0]);
    K.ext(g2, strapPts(L * 0.45, W * 0.95), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  // Tomato-style compound leaf: rachis with paired toothed leaflets.
  function compound(K, p, pos, yaw, elev, L, mat, stemMat) {
    const g = orient(K, p, pos, yaw, elev);
    K.bar(g, [0, 0, 0], [0, L, 0.0], 0.0022, stemMat);
    [0.32, 0.58, 0.82].forEach((t, i) => {
      const s = 1 - i * 0.12;
      [-1, 1].forEach((sd) => {
        const lg = K.group(g, [0, t * L, 0], [0, 0, sd * -58]);
        K.ext(lg, leafPts(L * 0.3 * s, L * 0.11 * s, 8, true), 0.0012, mat, [0, 0, -0.0006], null, 0);
      });
    });
    K.ext(K.group(g, [0, L * 0.95, 0]), leafPts(L * 0.3, L * 0.12, 8, true), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  // Tiny seedling: stem, two cotyledons, optional true leaves.
  function seedling(K, p, pos, h, trueLeaves, mats, yaw) {
    const g = K.group(p, pos, [0, yaw || 0, 0]);
    K.cyl(g, [0.0012, 0.0016, h, 6], mats.stem, [0, h / 2, 0]);
    [0, 180].forEach((a) => leaf(K, g, [0, h, 0], a, 22, 0.011 + h * 0.08, 0.0045, mats.coty));
    if (trueLeaves) [90, 270].forEach((a) => leaf(K, g, [0, h * 0.98, 0], a, 48, trueLeaves, trueLeaves * 0.42, mats.leaf, true));
    return g;
  }
  // Hook-shaped sprout just breaking the surface.
  function sprout(K, p, pos, mats, yaw) {
    const g = K.group(p, pos, [0, yaw || 0, 0]);
    K.tube(g, [[0, 0, 0], [0, 0.012, 0], [0.003, 0.018, 0], [0.007, 0.016, 0]], 0.0011, mats.stem);
    leaf(K, g, [0.007, 0.016, 0], 90, -40, 0.007, 0.003, mats.coty);
    return g;
  }
  // Water drops falling in a column (animated in tick when fx matches).
  function rain(K, p, from, n, spread, fall) {
    const drops = [];
    for (let i = 0; i < n; i++) {
      const d = K.sph(p, 0.006, 'water', [from[0] + (Math.sin(i * 7.3) * spread), from[1], from[2] + Math.cos(i * 3.1) * spread], [0.8, 1.6, 0.8]);
      d.userData.noPick = true;
      drops.push({ d, y0: from[1], k: i / n });
    }
    return (t, on) => drops.forEach((o) => {
      o.d.visible = on;
      if (on) o.d.position.y = o.y0 - fall * ((t * 1.3 + o.k) % 1);
    });
  }
  const spinner = (meshes) => (on) => meshes.forEach((m) => (m.visible = on));

  /* =====================================================================
     1 · Seed-starting shelf: heat mat, 72-cell flat, dome, LED shop light
     ===================================================================== */
  const SEED_AO = ['aoTimer', 'aoThermo', 'aoRefl', 'aoHygro'];
  TB.model(
    'growSeeds',
    { unit: 1, env: 'studio', cam: [1.25, 1.3, 1.45], at: [0, 0.85, 0], tex: ['plank_flooring'], ground: { tex: 'plank_flooring', repeat: 5, radius: 6 },
      hidden: ['light', 'mat', 'premix', 'tray', 'cells', 'mix', 'seeds', 'dome', 'sprouts', 'doubles', 'seedlings', 'fan', 'pots', 'harden'].concat(SEED_AO) },
    (K) => {
      const chrome = K.std(0xd9dde1, { metalness: 0.9, roughness: 0.25 });
      const blackPl = K.std(0x1b1c1e, { roughness: 0.55 });
      const mats = { stem: K.std(0x7fae4f, { roughness: 0.7 }), coty: leafMat(K, 0x86b84f), leaf: leafMat(K, 0x3f8a36) };
      const mixMat = soilMat(K, 0x3e2c20);
      K.box(null, [3.4, 2.6, 0.04], K.std(0xeeebe5, { roughness: 0.92 }), [0, 1.3, -0.6], null, 0);
      // wire shelving unit (48×18″) with three shelves
      const shelf = K.part('shelf', [0, 0, 0], null, 'Wire shelf unit (48×18″)');
      [[-0.6, -0.23], [0.6, -0.23], [-0.6, 0.23], [0.6, 0.23]].forEach(([x, z]) => K.cyl(shelf, [0.012, 0.012, 1.6, 12], chrome, [x, 0.8, z]));
      [0.2, 0.75, 1.45].forEach((y) => {
        K.box(shelf, [1.22, 0.025, 0.012], chrome, [0, y - 0.01, 0.23], null, 0.003);
        K.box(shelf, [1.22, 0.025, 0.012], chrome, [0, y - 0.01, -0.23], null, 0.003);
        for (let i = 0; i < 25; i++) K.cyl(shelf, [0.0025, 0.0025, 0.46, 6], chrome, [-0.6 + i * 0.05, y, 0], [90, 0, 0]);
        [-0.12, 0, 0.12].forEach((z) => K.cyl(shelf, [0.003, 0.003, 1.2, 6], chrome, [0, y - 0.004, z], [0, 0, 90]));
      });
      // LED shop light on chains
      const light = K.part('light', [0, 1.12, 0], null, 'LED shop light, 2–4″ above leaves, 14–16 hr/day');
      K.box(light, [1.15, 0.035, 0.13], K.std(0xf1f1ee, { metalness: 0.3, roughness: 0.4 }), [0, 0, 0], null, 0.006);
      const tubes = [];
      [-0.035, 0.035].forEach((z) => tubes.push(K.box(light, [1.08, 0.012, 0.03], K.std(0xffffff, { emissive: 0xf4f7ff, emissiveIntensity: 1.3 }), [0, -0.022, z], null, 0.004)));
      [-0.5, 0.5].forEach((x) => {
        K.tor(light, [0.01, 0.0025], chrome, [x, 0.03, 0], [0, 90, 0]);
        for (let k = 0; k < 22; k++) K.tor(light, [0.008, 0.0016], chrome, [x, 0.045 + k * 0.024, 0], [0, k % 2 ? 90 : 0, 0]);
      });
      K.tube(light, [[0.56, 0, 0.06], [0.62, 0.0, 0.2], [0.64, -0.5, 0.25], [0.6, -0.9, 0.28]], 0.003, K.std(0x222222, { roughness: 0.6 }));
      const lamp = new THREE.SpotLight(0xf6f8ff, 1.4, 1.6, Math.PI / 2.6, 0.7, 1.4);
      lamp.position.set(0, -0.03, 0);
      lamp.target.position.set(0, -1, 0);
      light.add(lamp, lamp.target);
      // heat mat
      const mat = K.part('mat', [-0.27, 0.756, 0], null, 'Seedling heat mat (10×20″) — soil 75–80°F');
      K.box(mat, [0.53, 0.004, 0.26], K.std(0x202022, { roughness: 0.8 }), [0, 0, 0], null, 0);
      const matGlow = K.box(mat, [0.5, 0.002, 0.23], K.std(0xff6a2a, { emissive: 0xff4a10, emissiveIntensity: 0.9, transparent: true, opacity: 0.55 }), [0, 0.003, 0], null, 0);
      K.tube(mat, [[0.265, 0, 0.1], [0.32, 0, 0.12], [0.35, -0.2, 0.2], [0.32, -0.55, 0.22]], 0.003, K.std(0x222222, { roughness: 0.6 }));
      // pre-moistened mix in a tub
      const pre = K.part('premix', [0.3, 0.755, 0], null, 'Seed-starting mix, pre-moistened like a wrung-out sponge');
      K.lathe(pre, [[0, 0.004], [0.14, 0.004], [0.17, 0.14], [0.18, 0.15], [0.175, 0.15], [0.16, 0.14], [0.13, 0], [0, 0]], K.std(0x6a8a9e, { roughness: 0.5 }));
      K.cyl(pre, [0.162, 0.15, 0.01, 32], mixMat, [0, 0.11, 0]);
      K.rep(18, (i) => K.sph(pre, 0.004, K.std(0xf2f0e8, { roughness: 1 }), [Math.cos(i * 2.3) * 0.12 * ((i % 5) / 5 + 0.2), 0.116, Math.sin(i * 2.3) * 0.12 * ((i % 5) / 5 + 0.2)]));
      const bag = K.group(pre, [0.55, -0.75, 0.1], [0, -20, -8]);
      K.box(bag, [0.3, 0.45, 0.1], K.std(0x5f8f3e, { roughness: 0.6 }), [0, 0.225, 0], null, 0.03);
      K.box(bag, [0.24, 0.16, 0.002], K.std(0xf1ead6, { roughness: 0.8 }), [0, 0.27, 0.051], null, 0);
      // 1020 tray + 72-cell insert
      const tray = K.part('tray', [-0.27, 0.758, 0], null, '1020 tray (no holes) for bottom watering');
      K.box(tray, [0.54, 0.004, 0.275], blackPl, [0, 0.002, 0], null, 0);
      [-1, 1].forEach((s) => {
        K.box(tray, [0.54, 0.06, 0.004], blackPl, [0, 0.03, s * 0.1355], null, 0);
        K.box(tray, [0.004, 0.06, 0.275], blackPl, [s * 0.268, 0.03, 0], null, 0);
      });
      const cx = (i) => -0.27 - 0.264 + 0.022 + i * 0.044;
      const cz = (j) => -0.132 + 0.022 + j * 0.044;
      const cells = K.part('cells', [0, 0, 0], null, '72-cell insert (1½″ cells)');
      for (let i = 0; i <= 12; i++) K.box(cells, [0.0015, 0.055, 0.264], blackPl, [-0.27 - 0.264 + i * 0.044, 0.79, 0], null, 0);
      for (let j = 0; j <= 6; j++) K.box(cells, [0.528, 0.055, 0.0015], blackPl, [-0.27, 0.79, -0.132 + j * 0.044], null, 0);
      const mix = K.part('mix', [-0.27, 0.811, 0], null, 'Mix firmed into every cell');
      K.box(mix, [0.526, 0.004, 0.262], mixMat, [0, 0, 0], null, 0);
      const seeds = K.part('seeds', [0, 0, 0], null, '2 seeds per cell, 2–3× their width deep');
      const seedMat = K.std(0xe8d9b0, { roughness: 0.8 });
      const sprouts = K.part('sprouts', [0, 0, 0], null, 'Sprouts — dome off, lights on');
      const doubles = K.part('doubles', [0, 0, 0], null, 'Extra sprouts (thin these)');
      const seedlings = K.part('seedlings', [0, 0, 0], null, 'Seedlings with first true leaves');
      for (let i = 0; i < 12; i++)
        for (let j = 0; j < 6; j++) {
          const x = cx(i);
          const z = cz(j);
          const v = Math.sin(i * 12.9 + j * 78.2);
          K.sph(seeds, 0.0018, seedMat, [x - 0.006, 0.8135, z + 0.003], [1.3, 0.7, 1]);
          K.sph(seeds, 0.0018, seedMat, [x + 0.006, 0.8135, z - 0.002], [1.3, 0.7, 1]);
          sprout(K, sprouts, [x - 0.004, 0.813, z], mats, (i * 47 + j * 91) % 360);
          if ((i + j) % 3 === 0) sprout(K, doubles, [x + 0.007, 0.813, z + 0.005], mats, (i * 31 + j * 13) % 360);
          seedling(K, seedlings, [x, 0.813, z], 0.045 + v * 0.01, 0.02 + v * 0.004, mats, (i * 47 + j * 91) % 360);
        }
      // dome
      const dome = K.part('dome', [-0.27, 0.818, 0], null, 'Humidity dome (vents closed)');
      const clear = K.std(0xe4f1f7, { transparent: true, opacity: 0.25, roughness: 0.05 });
      K.box(dome, [0.54, 0.005, 0.275], clear, [0, 0.075, 0], null, 0.002);
      [-1, 1].forEach((s) => {
        K.box(dome, [0.54, 0.075, 0.003], clear, [0, 0.037, s * 0.137], null, 0);
        K.box(dome, [0.003, 0.075, 0.275], clear, [s * 0.269, 0.037, 0], null, 0);
      });
      [-0.15, 0.15].forEach((x) => K.box(dome, [0.06, 0.008, 0.03], K.std(0xcfd9de, { roughness: 0.4 }), [x, 0.08, 0], null, 0.003));
      // clip fan
      const fan = K.part('fan', [0.57, 1.0, 0.23], null, 'Clip fan on low (sturdier stems)');
      const fg = K.group(fan, [0, 0, 0], [0, -55, 0]);
      K.box(fg, [0.04, 0.05, 0.04], 'dark', [0, -0.05, -0.02], null, 0.006);
      K.tor(fg, [0.075, 0.004], 'dark', [0, 0.03, 0.02]);
      const hub = K.group(fg, [0, 0.03, 0.02]);
      K.rep(4, (k) => K.box(K.group(hub, [0, 0, 0], [0, 0, k * 90]), [0.02, 0.06, 0.003], K.std(0x3a3d42, { roughness: 0.5 }), [0, 0.035, 0], [0, 25, 0], 0));
      K.cyl(fg, [0.03, 0.03, 0.05, 16], 'dark', [0, 0.03, -0.015], [90, 0, 0]);
      // potted-up seedlings in 4″ pots (second tray, right side)
      const pots = K.part('pots', [0.3, 0.758, 0], null, 'Potted up into 4″ pots, buried to the leaves');
      K.box(pots, [0.54, 0.004, 0.275], blackPl, [0, 0.002, 0], null, 0);
      const potMat = K.std(0x2a2b2d, { roughness: 0.6 });
      for (let i = 0; i < 5; i++)
        for (let j = 0; j < 2; j++) {
          const x = -0.21 + i * 0.105;
          const z = -0.0525 + j * 0.105;
          K.lathe(pots, [[0, 0.004], [0.036, 0.004], [0.05, 0.095], [0.052, 0.1], [0.046, 0.1], [0.032, 0.006], [0, 0.006]], potMat, [x, 0, z], null, 4).rotation.y = Math.PI / 4;
          K.cyl(pots, [0.045, 0.04, 0.004, 4], mixMat, [x, 0.088, z], [0, 45, 0]);
          seedling(K, pots, [x, 0.09, z], 0.06, 0.04, mats, i * 70 + j * 33);
          leaf(K, pots, [x, 0.12, z], i * 70 + j * 33 + 45, 55, 0.035, 0.014, mats.leaf, true);
          leaf(K, pots, [x, 0.13, z], i * 70 + j * 33 + 225, 60, 0.03, 0.012, mats.leaf, true);
        }
      // hardening off: crate by the door with a shade cloth
      const hard = K.part('harden', [0.1, 0, 0.75], null, 'Hardening off: outdoors 1 hr → full day over 7–10 days');
      K.box(hard, [0.62, 0.3, 0.36], K.pbr('wood_planks', [0.5, 0.4], { color: 0xc8a070 }, 'woodLight'), [0, 0.15, 0], null, 0.01);
      const shade = K.std(0x2d3a2f, { transparent: true, opacity: 0.55, side: DS, roughness: 1 });
      [-0.28, 0.28].forEach((x) => K.tor(hard, [0.2, 0.004, 180], 'steel', [x, 0.3, 0], [0, 90, 0]));
      K.cyl(hard, [0.2, 0.2, 0.58, 24, true], shade, [0, 0.3, 0], [0, 0, 90]);

      /* add-ons */
      const tmr = K.part('aoTimer', [0.45, 0.2, 0.15], null, 'Outlet timer / smart plug (16 on, 8 off)');
      K.box(tmr, [0.32, 0.04, 0.06], K.std(0xf2f2ee, { roughness: 0.5 }), [-0.1, 0.03, 0], null, 0.008);
      K.box(tmr, [0.06, 0.08, 0.05], K.std(0xf8f8f6, { roughness: 0.4 }), [0.0, 0.08, 0], null, 0.01);
      K.sph(tmr, 0.005, 'ledB', [0.0, 0.1, 0.026]);
      const th = K.part('aoThermo', [-0.62, 0.68, 0.24], null, 'Heat-mat thermostat with soil probe');
      K.box(th, [0.1, 0.13, 0.035], K.std(0x2d2f33, { roughness: 0.5 }), [0, 0, 0], null, 0.01);
      K.box(th, [0.06, 0.03, 0.003], 'screen', [0, 0.03, 0.018], null, 0);
      K.tube(th, [[0.03, 0.06, 0], [0.12, 0.14, -0.05], [0.2, 0.135, -0.1], [0.25, 0.13, -0.12]], 0.002, 'black');
      K.cyl(th, [0.003, 0.003, 0.05, 8], 'steel', [0.26, 0.125, -0.12], [0, 0, 20]);
      const refl = K.part('aoRefl', [0, 0, 0], null, 'Reflective Mylar panels');
      const mylar = K.std(0xe6eaee, { metalness: 1, roughness: 0.15, side: DS });
      K.box(refl, [1.2, 0.68, 0.003], mylar, [0, 1.1, -0.24], null, 0);
      [-0.61, 0.61].forEach((x) => K.box(refl, [0.003, 0.68, 0.46], mylar, [x, 1.1, 0], null, 0));
      const hyg = K.part('aoHygro', [-0.05, 0.76, 0.17], null, 'Thermometer-hygrometer (aim 65–75°F, 50–70% RH)');
      K.box(hyg, [0.06, 0.06, 0.018], K.std(0xf4f4f1, { roughness: 0.4 }), [0, 0.03, 0], [-20, 0, 0], 0.006);
      K.box(hyg, [0.045, 0.035, 0.002], 'screen', [0, 0.033, 0.01], [-20, 0, 0], 0);

      return {
        tick(t, fx) {
          const f = fx || '';
          tubes.forEach((m) => (m.visible = f !== 'off'));
          lamp.intensity = f === 'off' ? 0 : 1.4;
          matGlow.visible = f.includes('heat');
          hub.rotation.z = t * 14;
        },
      };
    }
  );
