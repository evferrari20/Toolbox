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
    { unit: 1, env: 'studio', cam: [1.55, 1.45, 1.85], at: [0, 0.9, 0], tex: ['plank_flooring'], ground: { tex: 'plank_flooring', repeat: 5, radius: 6 },
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

  /* =====================================================================
     2 · Tomatoes: two plants 28″ apart, stakes or cages, stage by stage
     ===================================================================== */
  // One leader (main stem) from base along a leaning direction, with compound leaves, trusses and suckers.
  function tomatoLeader(K, g, base, az, tilt, H, o) {
    const d = [Math.sin(tilt * K.DEG) * Math.cos(az * K.DEG), Math.cos(tilt * K.DEG), Math.sin(tilt * K.DEG) * Math.sin(az * K.DEG)];
    const at = (s, wob) => [base[0] + d[0] * s + Math.sin(s * 23) * (wob || 0.008), base[1] + d[1] * s, base[2] + d[2] * s + Math.cos(s * 19) * (wob || 0.008)];
    const pts = [];
    for (let k = 0; k <= 8; k++) pts.push(at((H * k) / 8));
    K.tube(g, pts, o.r || 0.007, o.stem);
    const n = Math.max(3, Math.floor(H / 0.12));
    for (let i = 0; i < n; i++) {
      const s = 0.07 + (i / n) * (H - 0.06);
      const p = at(s);
      const yaw = az + i * 137;
      const L = 0.26 - (i / n) * 0.12;
      const tgt = i < (o.low || 0) && o.lowPart ? o.lowPart : g;
      compound(K, tgt, p, yaw, i < 2 ? -5 : 18 + (i / n) * 25, L * (o.scale || 1), i % 2 ? o.leaf : o.leaf2, o.stem);
      if (o.suckers && i >= 1 && i < n - 1) {
        const sg = orient(K, o.suckers, [p[0], p[1] + 0.012, p[2]], yaw, 55);
        K.bar(sg, [0, 0, 0], [0, 0.07, 0], 0.003, o.stem);
        leaf(K, sg, [0, 0.07, 0], 0, 70, 0.03, 0.012, o.leaf, true);
        leaf(K, sg, [0, 0.05, 0], 180, 50, 0.025, 0.01, o.leaf, true);
      }
      if ((o.fruit || o.flowers) && i >= 2 && i % 3 === 2) {
        const tg = orient(K, g, p, yaw + 180, 10);
        K.tube(tg, [[0, 0, 0], [0, 0.05, 0.0], [0, 0.08, -0.03], [0, 0.1, -0.05]], 0.002, o.stem);
        const cnt = o.fruit ? 4 : 5;
        for (let f = 0; f < cnt; f++) {
          const fp = [Math.sin(f * 2.1) * 0.025, 0.06 + f * 0.012, -0.05 - (f % 2) * 0.02];
          if (o.fruit) {
            const ripe = (i + f) % 4;
            const col = [o.red, o.red, o.orange, o.green][ripe];
            K.sph(tg, 0.028 - f * 0.002, col, fp, [1, 0.88, 1]);
          } else {
            K.cone(tg, [0.008, 0.012, 6], o.flower, [fp[0], fp[1], fp[2] - 0.01], [180, 0, 0]);
          }
        }
      }
    }
    return at(H);
  }
  function tomatoMats(K) {
    return {
      stem: K.std(0x6f9a3e, { roughness: 0.75 }),
      leaf: leafMat(K, 0x3f7f30),
      leaf2: leafMat(K, 0x4a8c38),
      red: K.phys(0xd8321e, { roughness: 0.25, clearcoat: 0.6 }),
      orange: K.phys(0xe8742a, { roughness: 0.3, clearcoat: 0.5 }),
      green: K.phys(0x8fb84a, { roughness: 0.3, clearcoat: 0.4 }),
      flower: K.std(0xf2d22c, { roughness: 0.6 }),
    };
  }
  const TOM_X = [-0.36, 0.36];
  const TOM_AO = ['aoDrip', 'aoSensor', 'aoBasil'];
  TB.model(
    'growTomato',
    GARDEN({ cam: [1.9, 1.35, 2.1], at: [0, 0.6, 0],
      hidden: ['thermo', 'stakes', 'cages', 'holes', 'potted', 'lowerSet', 'transplant', 'mulch', 'young', 'suckers', 'lowLeaves', 'ties1', 'ties2', 'mature', 'bushYoung', 'bush'].concat(TOM_AO) }),
    (K) => {
      const M = tomatoMats(K);
      const bed = K.part('bed', [0, 0, 0], null, 'Bed amended with 2″ compost, full sun (8 hr)');
      K.box(bed, [1.8, 0.03, 0.9], soilMat(K, 0x4a3526), [0, 0.015, 0], null, 0.01);
      const th = K.part('thermo', [0.62, 0.03, 0.3], null, 'Soil thermometer: 60°F+ at 4″ deep');
      K.cyl(th, [0.003, 0.003, 0.14, 8], 'steel', [0, 0.02, 0]);
      K.cyl(th, [0.03, 0.03, 0.012, 24], 'steel', [0, 0.095, 0], [70, 0, 0]);
      K.cyl(th, [0.026, 0.026, 0.002, 24], K.std(0xf4f2ea, { roughness: 0.5 }), [0, 0.097, 0.006], [70, 0, 0]);
      const stakes = K.part('stakes', [0, 0, 0], null, '8 ft 2×2 stakes, 12–18″ deep, 4″ from stem');
      TOM_X.forEach((x) => K.box(stakes, [0.038, 1.9, 0.038], K.pbr('wood_planks', [0.2, 1], { color: 0xc89a6a }, 'wood'), [x, 0.95, -0.1], null, 0.004));
      const cages = K.part('cages', [0, 0, 0], null, 'Heavy wire cages (20″ dia, 5 ft tall)');
      const wire = K.std(0x7c8288, { metalness: 0.7, roughness: 0.5 });
      TOM_X.forEach((x) => {
        for (let k = 0; k < 9; k++) K.tor(cages, [0.25, 0.003], wire, [x, 0.2 + k * 0.15, 0], [90, 0, 0]);
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          K.bar(cages, [x + Math.cos(a) * 0.25, 0.0, Math.sin(a) * 0.25], [x + Math.cos(a) * 0.25, 1.4, Math.sin(a) * 0.25], 0.003, wire);
        }
      });
      const holes = K.part('holes', [0, 0.031, 0], null, 'Deep holes (or a trench) for each plant');
      TOM_X.forEach((x) => {
        K.cyl(holes, [0.11, 0.11, 0.003, 24], K.std(0x2a1c12, { roughness: 1 }), [x, 0, 0.02]);
        K.sph(holes, 0.1, soilMat(K, 0x5a4232), [x + 0.2, 0, 0.18], [1.2, 0.4, 1]);
      });
      // seedlings in 4″ pots (before planting) with lower leaves to strip
      const potted = K.part('potted', [0, 0, 0.42], null, '10–12″ transplants, hardened off');
      const lower = K.part('lowerSet', [0, 0, 0], potted, 'Lower leaves (pinch off before planting)');
      TOM_X.forEach((x) => {
        const g = K.group(potted, [x * 0.6, 0.03, 0]);
        K.lathe(g, [[0, 0], [0.04, 0], [0.052, 0.1], [0.046, 0.1], [0.034, 0.004], [0, 0.004]], K.std(0x2a2b2d, { roughness: 0.6 }), [0, 0, 0], null, 4);
        K.cyl(g, [0.046, 0.04, 0.004, 4], soilMat(K, 0x3e2c20), [0, 0.092, 0], [0, 45, 0]);
        tomatoLeader(K, g, [0, 0.09, 0], 0, 3, 0.26, { stem: M.stem, leaf: M.leaf, leaf2: M.leaf2, r: 0.004, scale: 0.55, low: 2, lowPart: K.group(lower, [x * 0.6, 0.03, 0]) });
      });
      // planted deep: only the top 4–6″ shows
      const tr = K.part('transplant', [0, 0.03, 0], null, 'Planted deep — roots form along the buried stem');
      TOM_X.forEach((x) => tomatoLeader(K, tr, [x, 0, 0], 0, 3, 0.15, { stem: M.stem, leaf: M.leaf, leaf2: M.leaf2, r: 0.004, scale: 0.5 }));
      const mulch = K.part('mulch', [0, 0.03, 0], null, '2–3″ straw mulch (after soil warms)');
      const straw = K.bumpy(0xd9c27e, TB.tex.speckle(), 0.03, { roughness: 1 });
      K.box(mulch, [1.78, 0.04, 0.88], straw, [0, 0.02, 0], null, 0.015);
      const strawBit = K.std(0xe6d08e, { roughness: 1 });
      K.rep(90, (i) => K.box(mulch, [0.09, 0.004, 0.004], strawBit, [Math.sin(i * 12.7) * 0.85, 0.042, Math.cos(i * 7.3) * 0.42], [0, (i * 53) % 180, 0], 0));
      // young plant (3–4 weeks) with first flower truss, suckers and low leaves
      const young = K.part('young', [0, 0.03, 0], null, 'Indeterminate plant, 3–4 weeks in');
      const suck = K.part('suckers', [0, 0, 0], young, 'Suckers in the leaf axils (pinch at 2–4″)');
      const low = K.part('lowLeaves', [0, 0, 0], young, 'Leaves touching soil (remove to 12″ up)');
      TOM_X.forEach((x) => tomatoLeader(K, young, [x, 0, 0], 90, 2, 0.72, Object.assign({}, M, { r: 0.006, flowers: true, suckers: suck, low: 2, lowPart: low })));
      const ties1 = K.part('ties1', [0, 0, 0], null, 'Soft ties, figure-8, every 8–12″');
      const ties2 = K.part('ties2', [0, 0, 0], null, 'More ties as it climbs');
      const tieMat = K.std(0x58a04a, { roughness: 0.8 });
      TOM_X.forEach((x) => {
        [0.25, 0.55].forEach((y) => K.tor(ties1, [0.035, 0.004], tieMat, [x, y, -0.05], [90, 0, 0]).scale.set(1.3, 0.8, 1));
        [0.85, 1.15, 1.45].forEach((y) => K.tor(ties2, [0.035, 0.004], tieMat, [x, y, -0.05], [90, 0, 0]).scale.set(1.3, 0.8, 1));
      });
      const mature = K.part('mature', [0, 0.03, 0], null, 'Staked, single-leader plant with ripening trusses');
      TOM_X.forEach((x, k) => tomatoLeader(K, mature, [x, 0, 0], 90, 2, 1.62, Object.assign({}, M, { r: 0.009, fruit: true, scale: 1.05 })));
      // determinate: bushier, caged
      const detOpts = (fruit) => Object.assign({}, M, { r: 0.007, fruit, flowers: !fruit });
      const bushYoung = K.part('bushYoung', [0, 0.03, 0], null, 'Determinate plant growing into its cage');
      const bush = K.part('bush', [0, 0.03, 0], null, 'Determinate bush: fruit ripens over 3–4 weeks');
      TOM_X.forEach((x) => {
        [0, 120, 240].forEach((az, k) => tomatoLeader(K, bushYoung, [x, 0.05, 0], az, 22, 0.45, detOpts(false)));
        [0, 90, 180, 270].forEach((az, k) => tomatoLeader(K, bush, [x, 0.05, 0], az, 24 + k * 3, 0.95 - k * 0.05, detOpts(true)));
      });

      /* add-ons */
      const drip = K.part('aoDrip', [0, 0.065, 0.08], null, 'Drip line, 12″ emitters, on a timer');
      K.cyl(drip, [0.008, 0.008, 1.75, 10], 'black', [0, 0, 0], [0, 0, 90]);
      K.rep(6, (i) => K.cyl(drip, [0.011, 0.011, 0.018, 10], K.std(0x6a2a2a, { roughness: 0.5 }), [-0.75 + i * 0.3, 0, 0], [0, 0, 90]));
      K.tube(drip, [[0.87, 0, 0], [1.0, -0.03, 0.05], [1.2, -0.06, 0.4], [1.4, -0.06, 0.6]], 0.008, 'black');
      K.box(drip, [0.09, 0.13, 0.06], K.std(0x2f6fde, { roughness: 0.4 }), [1.45, 0.0, 0.62], null, 0.01);
      AO.sensor(K, 'aoSensor', [0.02, 0.1, 0.25], 'Soil moisture sensor (water at 30–40% VWC)');
      const basil = K.part('aoBasil', [0, 0.03, 0], null, 'Companion basil & marigolds');
      const bl = leafMat(K, 0x4f9a3e);
      [[0, 0.25], [0, -0.25]].forEach(([x, z], k) => {
        const g = K.group(basil, [x, 0, z]);
        K.cyl(g, [0.004, 0.005, 0.22, 6], M.stem, [0, 0.11, 0]);
        for (let n = 0; n < 4; n++) [0, 180].forEach((a) => leaf(K, g, [0, 0.06 + n * 0.045, 0], a + n * 90, 25, 0.06 - n * 0.008, 0.032 - n * 0.004, bl));
      });
      [[0.75, 0.3], [-0.75, -0.3]].forEach(([x, z]) => {
        const g = K.group(basil, [x, 0, z]);
        K.sph(g, 0.07, leafMat(K, 0x3f7a30), [0, 0.05, 0], [1, 0.6, 1]);
        K.rep(5, (i) => K.sph(g, 0.022, K.std(0xf0a020, { roughness: 0.8 }), [Math.cos(i * 1.26) * 0.04, 0.09, Math.sin(i * 1.26) * 0.04], [1, 0.6, 1]));
      });
    }
  );

  /* ---------- shared raised bed (4×8 ft cedar) ---------- */
  function raisedBed(K, name, label, H, soilTop, soilColor, openFront) {
    const g = K.part(name, [0, 0, 0], null, label);
    const cedar = K.pbr('wood_planks', [0.4, 1.2], { color: 0xd8a27a }, 'wood');
    const rows = Math.round(H / 0.14);
    for (let r = 0; r < rows; r++) {
      const y = 0.07 + r * 0.14;
      K.box(g, [2.48, 0.135, 0.038], cedar, [0, y, -0.629], null, 0.004);
      if (!openFront) K.box(g, [2.48, 0.135, 0.038], cedar, [0, y, 0.629], null, 0.004);
      [-1, 1].forEach((s) => K.box(g, [0.038, 0.135, 1.22], cedar, [s * 1.221, y, 0], null, 0.004));
    }
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => K.box(g, [0.09, H, 0.09], cedar, [sx * 1.15, H / 2, sz * 0.56], null, 0.004));
    K.box(g, [2.4, soilTop, openFront ? 1.24 : 1.2], soilMat(K, soilColor), [0, soilTop / 2, openFront ? 0.01 : 0], null, 0.004);
    return g;
  }
  function specks(K, p, n, y, mat, size, w, d) {
    for (let i = 0; i < n; i++) K.cyl(p, [size, size, size * 0.6, 6], mat, [Math.sin(i * 12.99) * w, y, Math.cos(i * 7.77 + i * i * 0.01) * d]);
  }
  // loose-leaf lettuce rosette
  function lettuce(K, p, pos, s, mat) {
    const g = K.group(p, pos);
    for (let k = 0; k < 7; k++) leaf(K, g, [0, 0.005, 0], k * 51, 35 + (k % 3) * 15, 0.08 * s, 0.045 * s, mat, true);
    return g;
  }

  /* =====================================================================
     3 · Soil test & amend
     ===================================================================== */
  const SOIL_AO = ['aoSensor', 'aoBin'];
  TB.model(
    'growSoil',
    GARDEN({ cam: [2.3, 1.7, 2.6], at: [0, 0.25, 0.1],
      hidden: ['probe', 'holes', 'bucket', 'bag', 'report', 'lime', 'limeSpread', 'compost', 'fert', 'fertSpread', 'worked', 'plants'].concat(SOIL_AO) }),
    (K) => {
      raisedBed(K, 'bedFrame', 'Existing 4×8 bed (tired, compacted soil)', 0.42, 0.27, 0x8d7357);
      const T = 0.27;
      const probe = K.part('probe', [-0.6, T, 0.2], null, 'Stainless soil probe, 6–8″ cores');
      K.cyl(probe, [0.011, 0.011, 0.55, 16], 'steel', [0, 0.17, 0]);
      K.cyl(probe, [0.013, 0.013, 0.3, 16], K.std(0xc8342a, { roughness: 0.5 }), [0, 0.45, 0], [0, 0, 90]);
      K.box(probe, [0.008, 0.12, 0.004], K.std(0x1b1b1b), [0.011, -0.04, 0], null, 0);
      const holes = K.part('holes', [0, T + 0.001, 0], null, '10–15 sample spots in a zig-zag');
      const zz = [[-1.0, -0.35], [-0.8, 0.3], [-0.55, -0.2], [-0.35, 0.35], [-0.1, -0.35], [0.1, 0.25], [0.35, -0.3], [0.55, 0.32], [0.75, -0.25], [0.95, 0.3], [1.05, -0.4], [-1.05, 0.1]];
      zz.forEach(([x, z]) => K.cyl(holes, [0.012, 0.012, 0.003, 12], K.std(0x2a1d14, { roughness: 1 }), [x, 0, z]));
      const bucket = K.part('bucket', [1.65, 0, 0.75], null, 'Clean plastic bucket: mix cores, dry 1–2 cups');
      K.lathe(bucket, [[0, 0.004], [0.13, 0.004], [0.15, 0.35], [0.155, 0.36], [0.16, 0.36], [0.15, 0.0], [0, 0]], K.std(0xf2f2ee, { roughness: 0.45 }));
      K.cyl(bucket, [0.14, 0.135, 0.01, 32], soilMat(K, 0x8d7357), [0, 0.1, 0]);
      K.rep(8, (i) => K.cyl(bucket, [0.01, 0.01, 0.06, 10], soilMat(K, 0x7a6248), [Math.cos(i) * 0.07, 0.115, Math.sin(i) * 0.07], [80, i * 40, 0]));
      K.tor(bucket, [0.15, 0.003, 180], 'steel', [0, 0.36, 0], [0, 0, 0]);
      const bag = K.part('bag', [1.6, 0, 0.25], null, 'Labeled sample bag + lab form');
      K.box(bag, [0.12, 0.17, 0.05], K.std(0xd6c49a, { roughness: 0.9 }), [0, 0.085, 0], [0, -20, 0], 0.01);
      K.box(bag, [0.08, 0.05, 0.002], K.std(0xffffff, { roughness: 0.8 }), [0.008, 0.11, 0.024], [0, -20, 0], 0);
      K.box(bag, [0.22, 0.003, 0.28], K.std(0xf7f7f2, { roughness: 0.8 }), [0.05, 0.002, 0.25], [0, 15, 0], 0);
      // lab report on a clipboard leaning on the bed
      const rep = K.part('report', [-0.7, 0, 0.7], null, 'Lab report: pH 5.6, low P, medium K, 3% OM');
      const rg = K.group(rep, [0, 0.21, 0.04], [-20, 0, 0]);
      K.box(rg, [0.24, 0.33, 0.006], K.std(0x8a6038, { roughness: 0.6 }), [0, 0, 0], null, 0.003);
      K.box(rg, [0.21, 0.28, 0.002], K.std(0xfbfbf7, { roughness: 0.9 }), [0, -0.01, 0.004], null, 0);
      [[0.45, 0xd8452f], [0.25, 0xe8a032], [0.6, 0x5ca04a], [0.7, 0x3d82c4], [0.35, 0x8e6ac4]].forEach(([w, c], i) => K.box(rg, [0.17 * w, 0.02, 0.002], K.std(c, { roughness: 0.7 }), [-0.085 + 0.085 * w, 0.08 - i * 0.04, 0.006], null, 0));
      K.box(rg, [0.08, 0.025, 0.012], 'steel', [0, 0.155, 0.006], null, 0.003);
      // lime
      const lime = K.part('lime', [-1.65, 0, 0.5], null, 'Pelletized dolomitic lime (per test)');
      K.box(lime, [0.4, 0.12, 0.6], K.std(0xf0f0ea, { roughness: 0.8 }), [0, 0.06, 0], [0, 20, 0], 0.04);
      K.box(lime, [0.3, 0.003, 0.25], K.std(0x2f7f3a, { roughness: 0.7 }), [0, 0.122, 0], [0, 20, 0], 0);
      const limeSp = K.part('limeSpread', [0, T + 0.002, 0], null, 'Lime spread evenly');
      specks(K, limeSp, 140, 0, K.std(0xf4f2ea, { roughness: 1 }), 0.006, 1.15, 0.56);
      const comp = K.part('compost', [0, T + 0.025, 0], null, '2″ finished compost (≈0.2 yd³ for 4×8)');
      K.box(comp, [2.4, 0.05, 1.2], K.pbr('forrest_ground_01', [2, 1], { color: 0x6a5240 }, soilMat(K, 0x2e2018)), [0, 0, 0], null, 0.01);
      const fert = K.part('fert', [-1.6, 0, -0.2], null, 'Balanced fertilizer + measuring scoop');
      K.box(fert, [0.25, 0.32, 0.1], K.std(0x2b6db3, { roughness: 0.6 }), [0, 0.16, 0], [0, 30, -8], 0.03);
      K.box(fert, [0.18, 0.1, 0.002], K.std(0xf4f4ef, { roughness: 0.8 }), [0.02, 0.2, 0.04], [0, 30, -8], 0);
      K.lathe(fert, [[0, 0], [0.04, 0], [0.045, 0.06], [0.04, 0.06], [0.036, 0.004], [0, 0.004]], K.std(0xf2c230, { roughness: 0.4 }), [0.25, 0, 0.15]);
      const fertSp = K.part('fertSpread', [0, T + 0.052, 0], null, 'Fertilizer scattered at the label rate');
      specks(K, fertSp, 120, 0, K.std(0x7fa6c8, { roughness: 0.6 }), 0.004, 1.15, 0.56);
      const worked = K.part('worked', [0, T + 0.032, 0], null, 'Everything worked into the top 6–8″, raked level');
      K.box(worked, [2.4, 0.064, 1.2], soilMat(K, 0x4a3426), [0, 0, 0], null, 0.01);
      const plants = K.part('plants', [0, T + 0.064, 0], null, 'Ready to plant (lettuce at 8–10″)');
      const lm = leafMat(K, 0x7cbc4a);
      for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) lettuce(K, plants, [-1.0 + i * 0.25, 0, -0.42 + j * 0.28], 0.9 + ((i + j) % 3) * 0.1, lm);
      AO.sensor(K, 'aoSensor', [0.5, T + 0.12, 0.3], 'Wi-Fi soil sensor (moisture, temp, EC)');
      const bin = K.part('aoBin', [-2.1, 0, -1.0], null, 'Two-bay slatted compost bin');
      const ced = K.pbr('wood_planks', [0.3, 0.6], { color: 0xd8a27a }, 'wood');
      [[-0.9, 0], [0, 0], [0.9, 0]].forEach(([x]) => [-0.4, 0.4].forEach((z) => K.box(bin, [0.07, 0.9, 0.07], ced, [x * 0.5, 0.45, z], null, 0.004)));
      for (let r = 0; r < 6; r++) {
        K.box(bin, [0.95, 0.09, 0.02], ced, [0, 0.1 + r * 0.14, -0.41], null, 0.003);
        [-0.45, 0, 0.45].forEach((x) => K.box(bin, [0.02, 0.09, 0.8], ced, [x, 0.1 + r * 0.14, 0], null, 0.003));
      }
      K.box(bin, [0.42, 0.55, 0.75], soilMat(K, 0x3a2a1c), [-0.23, 0.28, 0], null, 0.06);
      K.box(bin, [0.42, 0.35, 0.75], soilMat(K, 0x6a5a30), [0.23, 0.18, 0], null, 0.06);
    }
  );

  /* =====================================================================
     4 · Plant a tree (lawn cut-block so the hole has real depth)
     ===================================================================== */
  const TREE_AO = ['aoBag', 'aoGuard', 'aoUplight'];
  const G0 = 0.5; // lawn grade height of the block
  TB.model(
    'growTree',
    GARDEN({ cam: [3.2, 2.6, 3.6], at: [0, 1.0, 0], assets: [],
      hidden: ['sod', 'paint', 'spoil', 'pot', 'ball', 'circling', 'rootsCut', 'bnbBall', 'burlapTop', 'burlapLow', 'basketTop', 'basketLow', 'twine', 'backfillHalf', 'backfill', 'berm', 'water', 'mulch', 'stakes'].concat(TREE_AO) }),
    (K) => {
      const RH = 0.72; // hole radius at grade (≈3× root ball)
      const D = 0.34; // hole depth = root-ball height
      const sq = [[-2.2, -2.2], [2.2, -2.2], [2.2, 2.2], [-2.2, 2.2]];
      const hole = K.circle(0, 0, RH, 40).reverse();
      const lawn = K.part('lawn', [0, 0, 0], null, 'Lawn (cut-away block)');
      K.ext(lawn, sq, 0.04, K.pbr('aerial_grass_rock', [3, 3], {}, 'grass'), [0, G0, 0], [90, 0, 0], 0, [hole]);
      K.ext(lawn, sq, G0 - 0.04, K.pbr('forrest_ground_01', [3, 1], { color: 0x8a6a50 }, 'dirt'), [0, G0 - 0.04, 0], [90, 0, 0], 0, [hole]);
      const holeG = K.part('hole', [0, 0, 0], null, 'Saucer hole: 2–3× ball width, no deeper than the ball');
      K.lathe(holeG, [[0, G0 - D], [0.42, G0 - D], [0.6, G0 - 0.12], [RH, G0 - 0.005], [RH + 0.005, G0]], soilMat(K, 0x4f3a2a));
      const sod = K.part('sod', [0, G0 - 0.035, 0], null, 'Sod (strip it first)');
      K.cyl(sod, [RH, RH, 0.07, 40], K.pbr('aerial_grass_rock', [1, 1], {}, 'grass'), [0, 0, 0]);
      const paint = K.part('paint', [0, G0 + 0.004, 0], null, 'Marking-paint circle, 4–5 ft across');
      K.tor(paint, [RH, 0.012], K.std(0xff6a1a, { roughness: 0.6 }), [0, 0, 0], [90, 0, 0]);
      const spoil = K.part('spoil', [1.4, G0, -1.2], null, 'Soil on a tarp (it all goes back in)');
      K.box(spoil, [1.2, 0.006, 0.9], K.std(0x2f5f8f, { roughness: 0.7 }), [0, 0.003, 0], [0, 15, 0], 0);
      K.lathe(spoil, [[0, 0.3], [0.2, 0.26], [0.42, 0.1], [0.5, 0.0], [0, 0]], soilMat(K, 0x5a4232), [0, 0.005, 0]);

      // the tree (local y=0 = bottom of root ball)
      const tree = K.part('tree', [0, G0 - D, 0], null, '1½″ caliper shade tree');
      const barkM = K.bumpy(0x6f5a48, TB.tex.speckle(), 0.02, { roughness: 0.95 });
      const flare = K.part('flare', [0, D, 0], tree, 'Root flare (sits at or 1–2″ above grade)');
      K.lathe(flare, [[0.0, 0], [0.085, 0], [0.06, 0.03], [0.045, 0.08], [0.04, 0.12], [0.0, 0.12]], barkM);
      K.lathe(tree, [[0, D + 0.1], [0.04, D + 0.1], [0.033, D + 1.2], [0.025, D + 1.9], [0.012, D + 2.8], [0, D + 2.85]], barkM);
      const leafA = K.bumpy(0x4f8a3a, TB.tex.speckle(), 0.04, { roughness: 0.95 });
      const leafB = K.bumpy(0x3f7a30, TB.tex.speckle(), 0.04, { roughness: 0.95 });
      const twig = K.std(0x5f4a3a, { roughness: 0.9 });
      for (let i = 0; i < 7; i++) {
        const a = i * 2.4;
        const y0 = D + 1.45 + i * 0.17;
        const len = 0.75 - i * 0.07;
        const end = [Math.cos(a) * len, y0 + 0.45, Math.sin(a) * len];
        K.tube(tree, [[0, y0, 0], [Math.cos(a) * len * 0.45, y0 + 0.25, Math.sin(a) * len * 0.45], end], 0.014 - i * 0.0012, twig);
        K.sph(tree, 0.32 - i * 0.02, i % 2 ? leafA : leafB, end, [1.15, 0.8, 1.15]);
        K.sph(tree, 0.24, i % 2 ? leafB : leafA, [end[0] * 0.6, end[1] - 0.12, end[2] * 0.6], [1.1, 0.8, 1.1]);
      }
      K.sph(tree, 0.36, leafA, [0, D + 2.75, 0], [1, 0.85, 1]);
      // container root ball + pot
      const ball = K.part('ball', [0, 0, 0], tree, 'Root ball (15-gal)');
      K.cyl(ball, [0.235, 0.215, D, 32], soilMat(K, 0x3e2c20), [0, D / 2, 0]);
      const circ = K.part('circling', [0, 0, 0], tree, 'Circling roots (cut or shave them)');
      const rootM = K.std(0xc9b089, { roughness: 0.8 });
      for (let k = 0; k < 6; k++) K.tor(circ, [0.228 - k * 0.003, 0.006], rootM, [0, 0.04 + k * 0.055, 0], [90, 0, k * 30]);
      const cut = K.part('rootsCut', [0, 0, 0], tree, 'Roots teased out and cut to point outward');
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        const y = 0.05 + (k % 5) * 0.06;
        K.bar(cut, [Math.cos(a) * 0.22, y, Math.sin(a) * 0.22], [Math.cos(a) * 0.3, y - 0.02, Math.sin(a) * 0.3], 0.004, rootM);
      }
      const pot = K.part('pot', [0, 0, 0], tree, 'Black nursery pot');
      K.lathe(pot, [[0, 0.0], [0.22, 0], [0.25, D + 0.02], [0.265, D + 0.04], [0.255, D + 0.04], [0.24, D + 0.02], [0.215, 0.01], [0, 0.01]], K.std(0x1d1e20, { roughness: 0.55 }));
      // balled & burlapped root ball
      const bnb = K.part('bnbBall', [0, 0, 0], tree, 'Balled-and-burlapped root ball (24″)');
      const ballPts = [[0, 0], [0.2, 0], [0.29, 0.1], [0.3, 0.2], [0.27, 0.3], [0.12, D], [0, D]];
      K.lathe(bnb, ballPts, soilMat(K, 0x5a4030));
      const burl = K.bumpy(0xb8986a, TB.tex.weave(), 0.006, { roughness: 1, side: DS });
      const bTop = K.part('burlapTop', [0, 0, 0], tree, 'Burlap over the top & sides (cut away)');
      K.lathe(bTop, [[0.303, 0.17], [0.302, 0.2], [0.275, 0.3], [0.13, D + 0.005], [0.05, D + 0.01]], burl);
      const bLow = K.part('burlapLow', [0, 0, 0], tree, 'Burlap under the ball (leave it, it rots)');
      K.lathe(bLow, [[0, -0.004], [0.2, -0.004], [0.294, 0.1], [0.303, 0.17]], burl);
      const wireM = K.std(0x8a8f94, { metalness: 0.8, roughness: 0.45 });
      const bkTop = K.part('basketTop', [0, 0, 0], tree, 'Wire basket — cut off at least the top ⅔');
      const bkLow = K.part('basketLow', [0, 0, 0], tree, 'Bottom of the basket (OK to leave)');
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        const P = (r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
        K.tube(bkTop, [P(0.31, 0.12), P(0.31, 0.2), P(0.285, 0.3), P(0.14, D + 0.01)], 0.003, wireM);
        K.tube(bkLow, [P(0.21, 0.0), P(0.3, 0.1), P(0.31, 0.12)], 0.003, wireM);
      }
      K.tor(bkTop, [0.31, 0.003], wireM, [0, 0.2, 0], [90, 0, 0]);
      K.tor(bkTop, [0.2, 0.003], wireM, [0, 0.31, 0], [90, 0, 0]);
      K.tor(bkLow, [0.3, 0.003], wireM, [0, 0.08, 0], [90, 0, 0]);
      const twine = K.part('twine', [0, D + 0.02, 0], tree, 'Twine around the trunk (remove all of it)');
      K.tor(twine, [0.07, 0.004], K.std(0xd9c79a, { roughness: 1 }), [0, 0, 0], [90, 0, 0]);
      K.tor(twine, [0.11, 0.004], K.std(0xd9c79a, { roughness: 1 }), [0, -0.02, 0], [90, 0, 0]);

      // backfill, berm, water, mulch, stakes
      const fillM = soilMat(K, 0x6a5040);
      const bfH = K.part('backfillHalf', [0, G0 - D / 2, 0], null, 'Native soil, halfway; water to settle');
      K.ext(bfH, K.circle(0, 0, 0.53, 36), 0.02, fillM, [0, 0, 0], [90, 0, 0], 0, [K.circle(0, 0, 0.3, 36).reverse()]);
      const bf = K.part('backfill', [0, G0 + 0.004, 0], null, 'Backfilled to grade, firmed by hand (not stomped)');
      K.ext(bf, K.circle(0, 0, RH + 0.01, 40), 0.03, fillM, [0, 0, 0], [90, 0, 0], 0, [K.circle(0, 0, 0.09, 24).reverse()]);
      const berm = K.part('berm', [0, G0, 0], null, '3–4″ water ring at the ball edge');
      K.tor(berm, [0.55, 0.06], fillM, [0, 0, 0], [90, 0, 0]).scale.set(1, 1, 0.7);
      const water = K.part('water', [0, G0 + 0.03, 0], null, '10–15 gal soaks in slowly');
      K.cyl(water, [0.5, 0.5, 0.006, 40], 'water', [0, 0, 0]);
      const mulch = K.part('mulch', [0, G0 + 0.07, 0], null, 'Mulch donut: 3″ deep, 6 ft wide, 3″ off the trunk');
      K.ext(mulch, K.circle(0, 0, 0.95, 48), 0.07, K.pbr('pine_bark', [2, 2], {}, 'bark'), [0, 0, 0], [90, 0, 0], 0.01, [K.circle(0, 0, 0.11, 24).reverse()]);
      const stakes = K.part('stakes', [0, G0, 0], null, 'Two stakes outside the hole, loose wide straps (1 year max)');
      const ced = K.pbr('wood_planks', [0.2, 1], { color: 0xc89a6a }, 'woodLight');
      const strapM = K.std(0x2e6b3a, { roughness: 0.8 });
      [-1, 1].forEach((s) => {
        K.box(stakes, [0.05, 1.5, 0.05], ced, [s * 0.95, 0.65, 0], null, 0.004);
        K.bar(stakes, [s * 0.94, 1.0, 0], [s * 0.05, 0.95, 0], 0.01, strapM);
      });
      K.tor(stakes, [0.045, 0.01], strapM, [0, 0.95, 0], [90, 0, 0]);

      /* add-ons */
      const bagP = K.part('aoBag', [0, G0 + 0.07, 0], null, 'Slow-release watering bag (15–20 gal)');
      K.lathe(bagP, [[0.05, 0], [0.24, 0], [0.26, 0.15], [0.2, 0.5], [0.06, 0.62], [0.045, 0.62]], K.std(0x3d6b2a, { roughness: 0.7 }));
      const guard = K.part('aoGuard', [0, G0, 0], null, 'Spiral trunk guard (mowers & rabbits)');
      const hp = [];
      for (let k = 0; k <= 60; k++) hp.push([Math.cos(k * 0.6) * 0.05, 0.12 + k * 0.009, Math.sin(k * 0.6) * 0.05]);
      K.tube(guard, hp, 0.006, K.std(0xf2f2ee, { roughness: 0.5 }));
      AO.uplights(K, 'aoUplight', [[0.75, 0.75, 225]], 'Low-voltage uplight');
      K.parts.aoUplight.position.y = G0 + 0.07;
    }
  );

  /* =====================================================================
     5 · Pruning: multi-stem deciduous shrub and a hybrid-tea rose
     ===================================================================== */
  function pruners(K, name, pos, rot, label) {
    const g = K.part(name, pos, null, label || 'Bypass pruners (up to ¾″)');
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
    const g = K.part(name, pos, null, 'Bypass loppers (½–1½″ stems)');
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
  // An arching cane from base, outward at azimuth az; returns points along it.
  function canePts(base, az, lean, H, arch) {
    const c = Math.cos(az * Math.PI / 180), s = Math.sin(az * Math.PI / 180);
    const out = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const rr = Math.sin(lean * Math.PI / 180) * H * t + arch * t * t * H;
      const y = H * (t - arch * 0.35 * t * t * t);
      out.push([base[0] + c * rr, base[1] + y, base[2] + s * rr]);
    }
    return out;
  }
  function twigs(K, p, pts, n, r, mat, from) {
    for (let i = 0; i < n; i++) {
      const k = Math.min(pts.length - 2, (from || 2) + (i % (pts.length - (from || 2) - 1)));
      const a = pts[k];
      const L = 0.12 + (i % 3) * 0.05;
      const ang = i * 2.3;
      K.bar(p, a, [a[0] + Math.cos(ang) * L, a[1] + L * 0.7, a[2] + Math.sin(ang) * L], r, mat);
    }
  }
  TB.model(
    'growShrub',
    GARDEN({ cam: [2.2, 1.35, 2.4], at: [0, 0.75, 0], hidden: ['stubs', 'buds', 'foliage', 'newShoots', 'pruners', 'loppers'] }),
    (K) => {
      const bed = K.part('bed', [0, 0, 0], null, 'Mulched shrub bed');
      K.ext(bed, K.circle(0, 0, 1.1, 40), 0.03, K.pbr('pine_bark', [2, 2], {}, 'bark'), [0, 0.03, 0], [90, 0, 0], 0.008);
      const young = K.std(0x6e5440, { roughness: 0.85 });
      const oldM = K.bumpy(0x7d7468, TB.tex.speckle(), 0.02, { roughness: 1 });
      const deadM = K.std(0x4a3a30, { roughness: 1 });
      const greenM = K.std(0x7a8a3e, { roughness: 0.8 });
      const canes = K.part('canes', [0, 0, 0], null, 'Healthy young canes (keep)');
      const tips = K.part('tips', [0, 0, 0], null, 'Leggy tips — head back to an outward bud');
      const buds = K.part('buds', [0, 0, 0], null, 'Cuts ¼″ above outward-facing buds');
      const budM = K.std(0xb04a3a, { roughness: 0.6 });
      for (let i = 0; i < 10; i++) {
        const az = i * 36 + 10;
        const b = [Math.cos(az * K.DEG) * 0.06, 0.03, Math.sin(az * K.DEG) * 0.06];
        const pts = canePts(b, az, 14 + (i % 3) * 6, 1.25 + (i % 4) * 0.12, 0.18);
        const leggy = i % 3 === 0;
        K.tube(canes, leggy ? pts.slice(0, 6) : pts, 0.009, young);
        if (leggy) {
          K.tube(tips, pts.slice(4), 0.007, young);
          K.sph(buds, 0.008, budM, pts[5], [1, 1.3, 1]);
        }
        twigs(K, canes, pts, 3, 0.004, young, 3);
      }
      const oldC = K.part('oldCanes', [0, 0, 0], null, 'Oldest ⅓ of canes (cut to 2–3″ above ground)');
      [50, 170, 290].forEach((az, i) => {
        const b = [Math.cos(az * K.DEG) * 0.05, 0.03, Math.sin(az * K.DEG) * 0.05];
        const pts = canePts(b, az, 22, 1.45, 0.3);
        K.tube(oldC, pts, 0.017, oldM);
        twigs(K, oldC, pts, 7, 0.006, oldM, 2);
      });
      const dead = K.part('dead', [0, 0, 0], null, 'Dead & broken canes (no buds, brittle)');
      [110, 240].forEach((az, i) => {
        const b = [Math.cos(az * K.DEG) * 0.05, 0.03, Math.sin(az * K.DEG) * 0.05];
        const pts = canePts(b, az, 30, 0.9, 0.5);
        K.tube(dead, pts.slice(0, 5), 0.011, deadM);
        twigs(K, dead, pts, 3, 0.004, deadM, 2);
      });
      const cross = K.part('crossing', [0, 0, 0], null, 'Crossing cane rubbing its neighbor');
      K.tube(cross, [[0.12, 0.03, 0.04], [0.05, 0.4, 0.02], [-0.15, 0.75, -0.02], [-0.42, 1.05, -0.06]], 0.01, young);
      const suck = K.part('suckers', [0, 0, 0], null, 'Suckers & water sprouts');
      [[0.3, 0.2], [-0.28, 0.25], [0.15, -0.32]].forEach(([x, z]) => K.cyl(suck, [0.004, 0.006, 0.55, 8], greenM, [x, 0.3, z], [x * 15, 0, -x * 10]));
      const stubs = K.part('stubs', [0, 0, 0], null, 'Clean cuts at the base');
      [50, 170, 290, 110, 240].forEach((az, i) => K.cyl(stubs, [i < 3 ? 0.017 : 0.011, i < 3 ? 0.017 : 0.011, 0.06, 12], i < 3 ? oldM : deadM, [Math.cos(az * K.DEG) * 0.05, 0.06, Math.sin(az * K.DEG) * 0.05]));
      K.rep(5, (i) => K.cyl(stubs, [0.012, 0.012, 0.002, 12], K.std(0xe6d3a8, { roughness: 0.8 }), [Math.cos([50, 170, 290, 110, 240][i] * K.DEG) * 0.05, 0.091, Math.sin([50, 170, 290, 110, 240][i] * K.DEG) * 0.05]));
      const newS = K.part('newShoots', [0, 0, 0], null, 'Vigorous new canes from the base');
      [80, 200, 320].forEach((az) => K.tube(newS, canePts([Math.cos(az * K.DEG) * 0.05, 0.03, Math.sin(az * K.DEG) * 0.05], az, 8, 0.9, 0.05), 0.007, greenM));
      const fol = K.part('foliage', [0, 0, 0], null, 'Summer: open, airy, natural shape');
      const fA = K.bumpy(0x4a8a36, TB.tex.speckle(), 0.012, { roughness: 0.9 });
      const fB = K.bumpy(0x3a7a2c, TB.tex.speckle(), 0.012, { roughness: 0.9 });
      const fC = K.bumpy(0x5c9a40, TB.tex.speckle(), 0.012, { roughness: 0.9 });
      for (let i = 0; i < 13; i++) {
        const az = i * 36 + 10 + (i > 9 ? 17 : 0);
        const pts = canePts([Math.cos(az * K.DEG) * 0.06, 0.03, Math.sin(az * K.DEG) * 0.06], az, 14 + (i % 3) * 6, (i > 9 ? 0.95 : 1.25) + (i % 4) * 0.12, 0.18);
        for (let k = 2; k <= 6; k++) {
          const q = pts[k];
          for (let j = 0; j < 3; j++) {
            const o = [Math.sin(i * 3 + k * 5 + j * 7) * 0.07, Math.cos(i * 2 + k * 3 + j) * 0.05, Math.cos(i * 5 + k * 2 + j * 3) * 0.07];
            K.sph(fol, 0.055 + ((i + k + j) % 3) * 0.012, [fA, fB, fC][(i + k + j) % 3], [q[0] + o[0], q[1] + o[1], q[2] + o[2]], [1.25, 0.8, 1.25]);
          }
        }
      }
      pruners(K, 'pruners', [0.8, 0.95, 0.7], [0, 45, -30]);
      loppers(K, 'loppers', [1.0, 0.8, 0.5], [0, 30, -25]);
    }
  );

  TB.model(
    'growRose',
    GARDEN({ cam: [1.35, 0.9, 1.5], at: [0, 0.4, 0], hidden: ['roseBuds', 'roseMulch', 'roseLeaves', 'pruners'] }),
    (K) => {
      const bed = K.part('bed', [0, 0, 0], null, 'Rose bed');
      K.ext(bed, K.circle(0, 0, 0.75, 40), 0.02, soilMat(K, 0x4a3828), [0, 0.02, 0], [90, 0, 0], 0.005);
      const caneM = K.std(0x5f7a3a, { roughness: 0.6 });
      const thornM = K.std(0x9a4a3a, { roughness: 0.6 });
      const graft = K.part('graft', [0, 0.06, 0], null, 'Bud union (graft), 1–2″ below soil in cold zones');
      K.sph(graft, 0.05, K.bumpy(0x6f5a3e, TB.tex.speckle(), 0.02, { roughness: 1 }), [0, 0, 0], [1.2, 0.7, 1.2]);
      const keep = K.part('roseCanes', [0, 0, 0], null, '3–5 healthy canes, pencil-thick or more');
      const tops = K.part('roseTops', [0, 0, 0], null, 'Top growth to remove (cut to 12–24″)');
      const buds = K.part('roseBuds', [0, 0, 0], null, '45° cuts ¼″ above outward buds');
      const thorns = (p, pts) => pts.forEach((q, i) => i && i % 1 === 0 && K.cone(p, [0.004, 0.012, 6], thornM, [q[0] + 0.006, q[1], q[2]], [0, 0, -70]));
      [20, 95, 165, 235, 310].forEach((az, i) => {
        const pts = canePts([Math.cos(az * K.DEG) * 0.03, 0.07, Math.sin(az * K.DEG) * 0.03], az, 16, 0.95, 0.1);
        K.tube(keep, pts.slice(0, 4), 0.009, caneM);
        thorns(keep, pts.slice(0, 4));
        K.tube(tops, pts.slice(3), 0.007, caneM);
        thorns(tops, pts.slice(4));
        K.sph(tops, 0.02, K.std(0x8a5a3a, { roughness: 0.9 }), pts[6]);
        twigs(K, tops, pts, 2, 0.003, caneM, 4);
        K.cyl(buds, [0.0105, 0.0105, 0.003, 12], K.std(0xf0ecd8, { roughness: 0.8 }), [pts[3][0], pts[3][1] + 0.003, pts[3][2]], [0, 0, 20]);
        K.sph(buds, 0.006, K.std(0xc0302a, { roughness: 0.6 }), [pts[3][0] + Math.cos(az * K.DEG) * 0.012, pts[3][1] - 0.012, pts[3][2] + Math.sin(az * K.DEG) * 0.012]);
      });
      const dead = K.part('roseDead', [0, 0, 0], null, 'Dead / winter-killed canes (black or brown)');
      [60, 200].forEach((az) => K.tube(dead, canePts([Math.cos(az * K.DEG) * 0.03, 0.07, Math.sin(az * K.DEG) * 0.03], az, 25, 0.75, 0.15), 0.008, K.std(0x2e2522, { roughness: 1 })));
      const weak = K.part('roseWeak', [0, 0, 0], null, 'Twiggy canes thinner than a pencil');
      [130, 270, 340].forEach((az) => K.tube(weak, canePts([Math.cos(az * K.DEG) * 0.04, 0.07, Math.sin(az * K.DEG) * 0.04], az, 35, 0.5, 0.4), 0.0035, caneM));
      const cross = K.part('roseCross', [0, 0, 0], null, 'Cane growing into the center');
      K.tube(cross, [[0.05, 0.07, 0.03], [0.02, 0.35, 0.01], [-0.12, 0.6, -0.04], [-0.2, 0.75, -0.05]], 0.007, caneM);
      const old = K.part('roseOld', [0, 0, 0], null, 'Oldest grey, woody cane (saw off at the union)');
      const oldPts = canePts([0.02, 0.07, -0.03], 280, 12, 0.9, 0.12);
      K.tube(old, oldPts, 0.014, K.bumpy(0x7d7468, TB.tex.speckle(), 0.02, { roughness: 1 }));
      twigs(K, old, oldPts, 4, 0.004, K.std(0x6d665a, { roughness: 1 }), 3);
      const mulch = K.part('roseMulch', [0, 0.045, 0], null, '2–3″ fresh mulch, old leaves removed');
      K.ext(mulch, K.circle(0, 0, 0.7, 40), 0.03, K.pbr('pine_bark', [1, 1], {}, 'bark'), [0, 0, 0], [90, 0, 0], 0.006, [K.circle(0, 0, 0.08, 20).reverse()]);
      const lv = K.part('roseLeaves', [0, 0, 0], null, '6–8 weeks later: new canes and blooms');
      const lm = leafMat(K, 0x2f6a2a, 0.4);
      const petal = K.std(0xc8243a, { roughness: 0.5, side: DS });
      [20, 95, 165, 235, 310].forEach((az, i) => {
        const pts = canePts([Math.cos(az * K.DEG) * 0.03, 0.07, Math.sin(az * K.DEG) * 0.03], az, 16, 0.95, 0.1);
        const s = pts[3];
        const top = [s[0] + Math.cos(az * K.DEG) * 0.08, s[1] + 0.32, s[2] + Math.sin(az * K.DEG) * 0.08];
        K.tube(lv, [s, [s[0] + Math.cos(az * K.DEG) * 0.04, s[1] + 0.15, s[2] + Math.sin(az * K.DEG) * 0.04], top], 0.006, caneM);
        for (let k = 0; k < 4; k++) leaf(K, lv, [s[0] + Math.cos(az * K.DEG) * 0.02 * k, s[1] + 0.06 + k * 0.06, s[2] + Math.sin(az * K.DEG) * 0.02 * k], az + k * 100, 20, 0.07, 0.035, lm, true);
        K.lathe(lv, [[0, 0], [0.03, 0.01], [0.045, 0.04], [0.035, 0.05], [0.02, 0.035], [0.0, 0.03]], petal, top);
        K.sph(lv, 0.022, petal, [top[0], top[1] + 0.035, top[2]], [1, 0.8, 1]);
      });
      pruners(K, 'pruners', [0.12, 0.42, 0.18], [0, 30, -35]);
    }
  );

  /* =====================================================================
     6 · Container herb garden
     ===================================================================== */
  const potLathe = (R, H) => {
    const rb = R * 0.74;
    return [[0, 0.012], [rb - 0.012, 0.012], [R - 0.012, H - 0.03], [R - 0.012, H], [R + 0.014, H], [R + 0.014, H - 0.04], [R, H - 0.04], [rb, 0], [0, 0]];
  };
  function herbBasil(K, p, s, M, tipsPart) {
    [[0, 0], [0.04, 0.03], [-0.035, 0.02]].forEach(([x, z], k) => {
      const g = K.group(p, [x * s, 0, z * s], [0, k * 40, 0]);
      const h = (0.24 - k * 0.03) * s;
      K.cyl(g, [0.003, 0.004, h, 6], M.stem, [0, h / 2, 0]);
      for (let n = 0; n < 4; n++) [0, 180].forEach((a) => leaf(K, g, [0, 0.04 * s + n * 0.05 * s, 0], a + n * 90, 18, (0.075 - n * 0.008) * s, (0.042 - n * 0.004) * s, M.basil));
      if (tipsPart) {
        const tg = K.group(tipsPart, [x * s, 0, z * s], [0, k * 40, 0]);
        K.cyl(tg, [0.0025, 0.003, 0.06 * s, 6], M.stem, [0, h + 0.03 * s, 0]);
        [0, 180].forEach((a) => leaf(K, tg, [0, h + 0.02 * s, 0], a, 40, 0.04 * s, 0.022 * s, M.basil));
        K.cyl(tg, [0.006, 0.008, 0.05 * s, 8], K.std(0xe8e4f2, { roughness: 0.8 }), [0, h + 0.075 * s, 0]);
      }
    });
  }
  function herbRosemary(K, p, s, M) {
    for (let i = 0; i < 9; i++) {
      const a = i * 40 * K.DEG;
      const r = 0.03 + (i % 3) * 0.02;
      const h = (0.26 + (i % 4) * 0.04) * s;
      const b = [Math.cos(a) * r * s, 0, Math.sin(a) * r * s];
      const t = [b[0] * 1.8, h, b[2] * 1.8];
      K.bar(p, b, t, 0.003 * s, M.wood);
      K.bar(p, [b[0] + (t[0] - b[0]) * 0.3, h * 0.3, b[2] + (t[2] - b[2]) * 0.3], t, 0.012 * s, M.needle);
    }
  }
  function herbMound(K, p, s, mat, n, r, h) {
    for (let i = 0; i < n; i++) {
      const a = i * 2.4;
      const rr = (i / n) * r;
      K.sph(p, (0.035 + (i % 3) * 0.01) * s, mat, [Math.cos(a) * rr * s, h * s * (1 - (i / n) * 0.5), Math.sin(a) * rr * s], [1.2, 0.7, 1.2]);
    }
  }
  function herbParsley(K, p, s, M) {
    for (let i = 0; i < 9; i++) {
      const az = i * 40;
      const g = orient(K, p, [0, 0, 0], az, 62 - (i % 3) * 8);
      K.bar(g, [0, 0, 0], [0, 0.16 * s, 0], 0.0018 * s, M.stem);
      [-35, 0, 35].forEach((z) => K.ext(K.group(g, [0, 0.16 * s, 0], [0, 0, z]), leafPts(0.045 * s, 0.022 * s, 8, true), 0.001, M.parsley, [0, 0, 0], null, 0));
    }
  }
  function herbMint(K, p, s, M) {
    for (let i = 0; i < 7; i++) {
      const az = i * 51;
      const b = [Math.cos(az * K.DEG) * 0.04 * s, 0, Math.sin(az * K.DEG) * 0.04 * s];
      const h = (0.16 + (i % 3) * 0.04) * s;
      const t = [b[0] * 2.2, h, b[2] * 2.2];
      K.bar(p, b, t, 0.0025 * s, M.stem);
      for (let n = 1; n <= 3; n++) {
        const q = [b[0] + (t[0] - b[0]) * n / 3, h * n / 3, b[2] + (t[2] - b[2]) * n / 3];
        [0, 180].forEach((a) => leaf(K, p, q, az + a + n * 90, 15, 0.04 * s, 0.022 * s, M.mint, true));
      }
    }
  }
  function herbChives(K, p, s, M, flowers) {
    for (let i = 0; i < 26; i++) {
      const a = i * 2.4;
      const r = (i / 26) * 0.04 * s;
      const h = (0.2 + (i % 5) * 0.02) * s;
      K.bar(p, [Math.cos(a) * r, 0, Math.sin(a) * r], [Math.cos(a) * r * 2.4, h, Math.sin(a) * r * 2.4], 0.0022 * s, M.chive);
    }
    if (flowers) [0, 2, 4].forEach((k) => K.sph(p, 0.016 * s, M.chiveFl, [Math.cos(k) * 0.05 * s, 0.25 * s, Math.sin(k) * 0.05 * s]));
  }
  const HERB_AO = ['aoSelf', 'aoSensor', 'aoDrip'];
  TB.model(
    'growHerbs',
    GARDEN({ cam: [1.25, 0.95, 1.35], at: [0, 0.2, 0.05], ground: { tex: 'interlocking_concrete_pavers', repeat: 6, radius: 6 },
      hidden: ['pots', 'saucers', 'screens', 'bags', 'mix', 'starts', 'medHerbs', 'basil', 'basilTips', 'parsley', 'mint', 'chives', 'water'].concat(HERB_AO) }),
    (K) => {
      const M = {
        stem: K.std(0x6f9a3e, { roughness: 0.75 }), wood: K.std(0x6a5a40, { roughness: 0.9 }),
        basil: leafMat(K, 0x4f9a3e, 0.35), needle: K.bumpy(0x50705a, TB.tex.speckle(), 0.03, { roughness: 1 }),
        thyme: K.bumpy(0x6a8a62, TB.tex.speckle(), 0.04, { roughness: 1 }), oregano: K.bumpy(0x5a8a40, TB.tex.speckle(), 0.04, { roughness: 1 }),
        parsley: leafMat(K, 0x2f7a2a), mint: leafMat(K, 0x4a9a50), chive: K.std(0x3f8a3a, { roughness: 0.6 }), chiveFl: K.bumpy(0xb88ad0, TB.tex.speckle(), 0.03, { roughness: 1 }),
      };
      const terra = K.bumpy(0xc0663e, TB.tex.speckle(), 0.005, { roughness: 0.85 });
      const P = [
        { R: 0.178, H: 0.3, x: -0.3, z: -0.15 },
        { R: 0.15, H: 0.26, x: 0.22, z: -0.22 },
        { R: 0.125, H: 0.22, x: 0.33, z: 0.25 },
        { R: 0.1, H: 0.17, x: -0.2, z: 0.3 },
      ];
      const pots = K.part('pots', [0, 0.016, 0], null, 'Terra-cotta pots with drainage holes (8–14″)');
      const saucers = K.part('saucers', [0, 0, 0], null, 'Saucers on pot feet');
      const screens = K.part('screens', [0, 0.016, 0], null, 'Mesh over each hole (no gravel layer)');
      const mix = K.part('mix', [0, 0.016, 0], null, 'Potting mix (+ ⅓ perlite for rosemary & thyme)');
      const mixM = soilMat(K, 0x3a2a1e);
      const perl = K.std(0xf4f2ea, { roughness: 1 });
      P.forEach((q, i) => {
        K.lathe(pots, potLathe(q.R, q.H), terra, [q.x, 0, q.z]);
        K.cyl(saucers, [q.R * 0.95, q.R * 0.85, 0.016, 32], terra, [q.x, 0.008, q.z]);
        K.cyl(screens, [0.025, 0.025, 0.002, 16], K.std(0x7a8086, { metalness: 0.6, roughness: 0.5, wireframe: true }), [q.x, 0.014, q.z]);
        K.cyl(screens, [0.012, 0.012, 0.001, 16], 'black', [q.x, 0.0125, q.z]);
        const top = q.H - 0.03;
        const r = q.R * 0.74 + (q.R - q.R * 0.74) * ((top - 0.012) / (q.H - 0.042)) - 0.012;
        K.cyl(mix, [r, r, 0.006, 32], mixM, [q.x, top, q.z]);
        if (i === 0) specks(K, K.group(mix, [q.x, top + 0.004, q.z]), 40, 0, perl, 0.004, r * 0.8, r * 0.8);
      });
      const bags = K.part('bags', [0.75, 0, -0.25], null, 'Bagged potting mix + perlite (never garden soil)');
      K.box(bags, [0.34, 0.5, 0.12], K.std(0x3d6b2a, { roughness: 0.6 }), [0, 0.25, 0], [-10, -25, 0], 0.03);
      K.box(bags, [0.26, 0.2, 0.002], K.std(0xf1ead6, { roughness: 0.8 }), [0.026, 0.3, 0.055], [-10, -25, 0], 0);
      K.box(bags, [0.22, 0.3, 0.09], K.std(0xf4f4f0, { roughness: 0.7 }), [0.05, 0.15, 0.3], [0, -40, 0], 0.03);
      // nursery starts lined up in front
      const starts = K.part('starts', [0, 0, 0.62], null, 'Healthy nursery starts, grouped by thirst');
      const blackPot = K.std(0x232426, { roughness: 0.6 });
      const sx = [-0.42, -0.28, -0.14, 0, 0.14, 0.28, 0.42];
      sx.forEach((x, i) => {
        const g = K.group(starts, [x, 0, 0]);
        K.lathe(g, [[0, 0], [0.04, 0], [0.05, 0.09], [0.046, 0.09], [0.036, 0.004], [0, 0.004]], blackPot, [0, 0, 0], [0, 45, 0], 4);
        K.cyl(g, [0.046, 0.04, 0.004, 4], mixM, [0, 0.085, 0], [0, 45, 0]);
        const h = K.group(g, [0, 0.087, 0]);
        [() => herbRosemary(K, h, 0.45, M), () => herbMound(K, h, 0.5, M.thyme, 8, 0.05, 0.03), () => herbMound(K, h, 0.5, M.oregano, 8, 0.05, 0.035), () => herbBasil(K, h, 0.5, M), () => herbParsley(K, h, 0.5, M), () => herbMint(K, h, 0.5, M), () => herbChives(K, h, 0.5, M)][i]();
      });
      // planted herbs
      const med = K.part('medHerbs', [P[0].x, 0.016 + P[0].H - 0.026, P[0].z], null, 'Rosemary, thyme & oregano (lean, dry, full sun)');
      herbRosemary(K, K.group(med, [-0.06, 0, -0.05]), 1.1, M);
      herbMound(K, K.group(med, [0.08, 0, 0.06]), 1, M.thyme, 14, 0.07, 0.045);
      herbMound(K, K.group(med, [-0.07, 0, 0.08]), 1, M.oregano, 12, 0.07, 0.06);
      const basil = K.part('basil', [P[1].x - 0.05, 0.016 + P[1].H - 0.026, P[1].z], null, 'Basil (rich, evenly moist)');
      const tips = K.part('basilTips', [0, 0, 0], basil, 'Growing tips & flower buds (pinch above a leaf pair)');
      herbBasil(K, basil, 1.1, M, tips);
      const pars = K.part('parsley', [P[1].x + 0.07, 0.016 + P[1].H - 0.026, P[1].z + 0.04], null, 'Flat-leaf parsley');
      herbParsley(K, pars, 1, M);
      const mint = K.part('mint', [P[2].x, 0.016 + P[2].H - 0.026, P[2].z], null, 'Mint — always in its own pot');
      herbMint(K, mint, 1.2, M);
      const chv = K.part('chives', [P[3].x, 0.016 + P[3].H - 0.026, P[3].z], null, 'Chives');
      herbChives(K, chv, 1, M, true);
      const water = K.part('water', [0, 0, 0], null, 'Water until it runs from the hole');
      P.forEach((q) => K.cyl(water, [q.R * 0.9, q.R * 0.8, 0.004, 32], 'water', [q.x, 0.02, q.z]));
      const drops = rain(K, water, [P[1].x, 0.55, P[1].z], 10, 0.05, 0.3);

      /* add-ons */
      const self = K.part('aoSelf', [-0.75, 0, 0.35], null, 'Self-watering planter (reservoir + wick)');
      K.box(self, [0.5, 0.22, 0.22], K.std(0x3a3d40, { roughness: 0.5 }), [0, 0.11, 0], null, 0.02);
      K.box(self, [0.03, 0.06, 0.03], K.std(0xe0e4e8, { roughness: 0.4 }), [0.22, 0.25, 0.08], null, 0.005);
      K.box(self, [0.46, 0.01, 0.18], mixM, [0, 0.215, 0], null, 0);
      herbBasil(K, K.group(self, [-0.12, 0.22, 0]), 0.8, M);
      herbParsley(K, K.group(self, [0.12, 0.22, 0]), 0.8, M);
      AO.sensor(K, 'aoSensor', [P[1].x + 0.08, 0.016 + P[1].H - 0.09, P[1].z - 0.08], 'Bluetooth moisture & light sensor');
      const drip = K.part('aoDrip', [0, 0, 0], null, 'Micro-drip: ¼″ lines + stakes to each pot');
      K.tube(drip, [[0.9, 0.01, 0.0], [0.6, 0.01, 0.0], [0.0, 0.01, 0.05], [-0.6, 0.01, 0.05]], 0.007, 'black');
      P.forEach((q) => {
        K.tube(drip, [[q.x, 0.012, 0.03], [q.x + 0.06, 0.1, (q.z + 0.03) / 2], [q.x + 0.04, q.H + 0.04, q.z + q.R * 0.5], [q.x + 0.02, q.H - 0.01, q.z + q.R * 0.45]], 0.003, 'black');
        K.cyl(drip, [0.004, 0.002, 0.06, 6], K.std(0x2a2b2d), [q.x + 0.02, q.H - 0.03, q.z + q.R * 0.45]);
      });
      return { tick(t, fx) { drops(t, fx === 'water'); } };
    }
  );

  /* =====================================================================
     7 · Pollinator / perennial bed
     ===================================================================== */
  const BED = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    BED.push([1.75 * Math.cos(a), 0.88 * Math.sin(a) + 0.12 * Math.cos(2 * a) - 0.05]);
  }
  const DRIFTS = {
    aster: [[-1.3, -0.25], [-0.95, -0.5], [-0.9, -0.08]],
    beeBalm: [[-0.4, -0.58], [0.02, -0.66], [-0.18, -0.22]],
    coneflower: [[0.4, -0.55], [0.82, -0.5], [0.62, -0.12], [1.12, -0.18], [0.22, -0.18]],
    rudbeckia: [[-1.32, 0.2], [-0.98, 0.36], [-0.62, 0.14], [-0.58, 0.52], [-0.26, 0.3]],
    salvia: [[0.18, 0.4], [0.5, 0.3], [0.82, 0.46], [1.15, 0.24], [0.5, 0.66]],
    grass: [[1.48, 0.02], [-1.55, -0.02], [-0.05, 0.68]],
  };
  function clump(K, p, n, L, mat) {
    for (let k = 0; k < n; k++) leaf(K, p, [0, 0.01, 0], k * (360 / n) + 13, 35 + (k % 3) * 12, L, L * 0.22, mat);
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
  const POL_AO = ['aoBeeHouse', 'aoBath', 'aoLights', 'aoSign'];
  TB.model(
    'growPollinator',
    GARDEN({ cam: [2.9, 2.0, 3.3], at: [0, 0.25, 0], assets: ['grass_medium_01'],
      hidden: ['outline', 'bare', 'compost', 'edge', 'flags', 'pots', 'plants', 'mulch', 'water', 'markers'].concat(POL_AO) }),
    (K) => {
      const M = {
        stem: K.std(0x5f8a3a, { roughness: 0.8 }), leaf: leafMat(K, 0x3f7a30), leaf2: leafMat(K, 0x4f8a3a),
        cone: K.std(0xb0457a, { roughness: 0.6, side: DS }), coneC: K.bumpy(0xb8622a, TB.tex.speckle(), 0.03, { roughness: 1 }),
        rud: K.std(0xf2b81f, { roughness: 0.6, side: DS }), rudC: K.bumpy(0x2a1a12, TB.tex.speckle(), 0.03, { roughness: 1 }),
        balm: K.std(0xd04a6a, { roughness: 0.7 }), salvia: K.bumpy(0x5a4ab8, TB.tex.speckle(), 0.03, { roughness: 1 }),
        aster: K.std(0x9a82d8, { roughness: 0.8 }), mound: K.bumpy(0x4a7a3a, TB.tex.speckle(), 0.03, { roughness: 1 }),
      };
      const outline = K.part('outline', [0, 0.02, 0], null, 'Garden-hose outline (≈ 3½×1¾ m kidney)');
      K.tube(outline, BED.map(([x, z]) => [x, 0, z]), 0.016, 'green', true);
      const bare = K.part('bare', [0, 0.014, 0], null, 'Turf removed (or smothered under cardboard)');
      K.ext(bare, BED, 0.014, soilMat(K, 0x6a5040), [0, 0, 0], [90, 0, 0], 0);
      const comp = K.part('compost', [0, 0.024, 0], null, '1–2″ compost, lightly forked in');
      K.ext(comp, BED.map(([x, z]) => [x * 0.99, z * 0.99]), 0.01, soilMat(K, 0x3a2a1e), [0, 0, 0], [90, 0, 0], 0);
      const edge = K.part('edge', [0, 0.03, 0], null, 'Steel edging (or a 4″ spade-cut V edge)');
      K.tube(edge, BED.map(([x, z]) => [x * 1.01, 0, z * 1.01]), 0.006, K.std(0x5a3a2a, { metalness: 0.6, roughness: 0.6 }), true);
      const flags = K.part('flags', [0, 0, 0], null, 'Layout flags: tall at back, 18–24″ apart, groups of 3–5');
      const pots = K.part('pots', [0, 0, 0], null, 'Quart & gallon pots set out on their flags');
      const plants = K.part('plants', [0, 0.03, 0], null, 'Planted in drifts: spring-to-fall bloom');
      const markers = K.part('markers', [0, 0, 0], null, 'Plant labels');
      const flagC = { aster: 0x9a82d8, beeBalm: 0xd04a6a, coneflower: 0xb0457a, rudbeckia: 0xf2b81f, salvia: 0x5a4ab8, grass: 0xd8c27e };
      const blackPot = K.std(0x232426, { roughness: 0.6 });
      Object.entries(DRIFTS).forEach(([sp, list]) => {
        list.forEach(([x, z], i) => {
          K.bar(flags, [x, 0, z], [x, 0.3, z], 0.002, 'steel');
          K.box(flags, [0.07, 0.05, 0.002], K.std(flagC[sp], { roughness: 0.7, side: DS }), [x + 0.035, 0.27, z], null, 0);
          const pg = K.group(pots, [x + 0.05, 0.03, z + 0.03]);
          K.lathe(pg, [[0, 0], [0.055, 0], [0.07, 0.15], [0.064, 0.15], [0.05, 0.004], [0, 0.004]], blackPot);
          K.sph(pg, 0.08, M.mound, [0, 0.19, 0], [1, 0.7, 1]);
          const g = K.group(plants, [x, 0, z], [0, i * 67, 0]);
          if (sp === 'coneflower') { clump(K, g, 7, 0.16, M.leaf); daisy(K, g, 0.72, 4, M.cone, M.coneC, 0.025, M); }
          if (sp === 'rudbeckia') { clump(K, g, 7, 0.13, M.leaf2); daisy(K, g, 0.55, 5, M.rud, M.rudC, 0.006, M); }
          if (sp === 'beeBalm') {
            clump(K, g, 6, 0.12, M.leaf);
            for (let s = 0; s < 5; s++) {
              const top = [Math.cos(s * 2.4) * 0.08, 0.7 + (s % 2) * 0.08, Math.sin(s * 2.4) * 0.08];
              K.bar(g, [0, 0, 0], top, 0.004, M.stem);
              [0.3, 0.6].forEach((f) => [0, 180].forEach((a) => leaf(K, g, [top[0] * f, top[1] * f, top[2] * f], a + s * 40 + f * 200, 20, 0.07, 0.03, M.leaf2, true)));
              K.sph(g, 0.025, M.balm, top, [1, 0.7, 1]);
              K.rep(8, (k) => K.bar(g, top, [top[0] + Math.cos(k * 0.8) * 0.035, top[1] + 0.02, top[2] + Math.sin(k * 0.8) * 0.035], 0.003, M.balm));
            }
          }
          if (sp === 'salvia') {
            K.sph(g, 0.13, M.mound, [0, 0.1, 0], [1, 0.7, 1]);
            for (let s = 0; s < 9; s++) {
              const b = [Math.cos(s * 2.4) * 0.09, 0.15, Math.sin(s * 2.4) * 0.09];
              K.bar(g, b, [b[0] * 1.3, 0.33, b[2] * 1.3], 0.006, M.salvia);
            }
          }
          if (sp === 'aster') {
            K.sph(g, 0.24, M.mound, [0, 0.4, 0], [1, 1.4, 1]);
            for (let s = 0; s < 26; s++) {
              const th = s * 2.4;
              const ph = 0.2 + (s % 7) * 0.18;
              K.sph(g, 0.018, M.aster, [Math.cos(th) * Math.sin(ph) * 0.245, 0.4 + Math.cos(ph) * 0.33, Math.sin(th) * Math.sin(ph) * 0.245], [1, 0.5, 1]);
            }
          }
          if (sp === 'grass') {
            const gl = K.glb(g, 'grass_medium_01', { node: 'grass_medium_01_mid_a_LOD0', height: 0.55 }, [0, 0, 0]);
            if (!gl) for (let k = 0; k < 16; k++) strap(K, g, [0, 0, 0], k * 23, 62 + (k % 3) * 8, 0.5, 0.008, K.std(0x8aa060, { roughness: 0.9, side: DS }), 30);
          }
          if (i === 0) {
            K.bar(markers, [x + 0.12, 0, z + 0.12], [x + 0.12, 0.14, z + 0.12], 0.003, 'pvc');
            K.box(markers, [0.05, 0.03, 0.003], 'pvc', [x + 0.12, 0.15, z + 0.12], [-30, 0, 0], 0);
          }
        });
      });
      const mulch = K.part('mulch', [0, 0.04, 0], null, '2″ shredded leaves or hardwood, off the crowns');
      K.ext(mulch, BED.map(([x, z]) => [x * 0.98, z * 0.98]), 0.016, K.pbr('pine_bark', [3, 2], { color: 0x9a7a60 }, 'bark'), [0, 0, 0], [90, 0, 0], 0);
      const water = K.part('water', [0, 0, 0], null, 'Deep soak: 1″ per week the first season');
      const drops = rain(K, water, [0.4, 0.95, 0.3], 14, 0.25, 0.85);

      /* add-ons */
      const bh = K.part('aoBeeHouse', [-2.15, 0, -0.55], null, 'Native bee nest block on a post (facing SE)');
      K.box(bh, [0.07, 1.2, 0.07], K.pbr('wood_planks', [0.2, 1], { color: 0xc89a6a }, 'wood'), [0, 0.6, 0], null, 0.004);
      K.box(bh, [0.24, 0.22, 0.16], K.pbr('wood_planks', [0.3, 0.3], { color: 0xd8a27a }, 'wood'), [0, 1.3, 0.04], null, 0.01);
      K.box(bh, [0.3, 0.025, 0.22], K.std(0x3a3d40, { roughness: 0.6 }), [0, 1.43, 0.05], [8, 0, 0], 0.004);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) K.cyl(bh, [0.008, 0.008, 0.004, 10], 'black', [-0.08 + c * 0.04, 1.23 + r * 0.045, 0.121], [90, 0, 0]);
      const bath = K.part('aoBath', [1.95, 0, 0.75], null, 'Shallow water dish with landing stones');
      K.lathe(bath, [[0, 0], [0.2, 0], [0.26, 0.05], [0.28, 0.06], [0.24, 0.06], [0.0, 0.03]], K.std(0x9aa0a6, { roughness: 0.8 }));
      K.cyl(bath, [0.24, 0.24, 0.004, 32], 'water', [0, 0.05, 0]);
      [[0.08, 0.02], [-0.06, -0.08], [-0.05, 0.1]].forEach(([x, z]) => K.sph(bath, 0.035, 'stone', [x, 0.05, z], [1.2, 0.6, 1]));
      AO.stakeLights(K, 'aoLights', [[-1.2, 0.95], [0, 1.05], [1.2, 0.85]], 'Solar path lights along the edge');
      const sign = K.part('aoSign', [1.7, 0, -0.75], null, 'Pollinator habitat sign');
      K.bar(sign, [0, 0, 0], [0, 0.55, 0], 0.012, 'black');
      K.box(sign, [0.3, 0.22, 0.01], K.std(0x2f6a3a, { roughness: 0.5 }), [0, 0.6, 0.012], [-15, -30, 0], 0.01);
      K.box(sign, [0.22, 0.04, 0.002], K.std(0xf2c230, { roughness: 0.5 }), [0.004, 0.64, 0.02], [-15, -30, 0], 0);
      return { tick(t, fx) { drops(t, fx === 'water'); } };
    }
  );

  /* =====================================================================
     8 · Water deeply: bed cut-away showing moisture depth and roots
     ===================================================================== */
  function leafyPlant(K, p, pos, h, mat, stem, n) {
    const g = K.group(p, pos);
    K.cyl(g, [0.006, 0.009, h, 8], stem, [0, h / 2, 0]);
    for (let k = 0; k < (n || 9); k++) leaf(K, g, [0, 0.04 + (k / (n || 9)) * (h - 0.04), 0], k * 137, 25 + (k % 3) * 12, 0.13 - k * 0.006, 0.06 - k * 0.003, mat);
    return g;
  }
  function rootFan(K, p, x, top, depth, spread, n, mat, z) {
    for (let k = 0; k < n; k++) {
      const a = -1 + (2 * k) / (n - 1);
      const d = depth * (0.55 + 0.45 * Math.cos(a * 1.2));
      K.tube(p, [[x, top, z], [x + a * spread * 0.3, top - d * 0.35, z], [x + a * spread * 0.7, top - d * 0.75, z], [x + a * spread, top - d, z]], 0.0028, mat);
    }
  }
  const WAT_AO = ['aoSensor', 'aoBarrel', 'aoOlla'];
  TB.model(
    'growWater',
    GARDEN({ cam: [1.6, 1.0, 2.6], at: [0, 0.3, 0.2],
      hidden: ['gauge', 'sprinkler', 'can', 'canWater', 'wetShallow', 'rootsShallow', 'wetDeep', 'rootsDeep', 'drip', 'timer', 'mulch'].concat(WAT_AO) }),
    (K) => {
      const T = 0.24;
      raisedBed(K, 'bed', '4×8 bed, front cut away to show the root zone', 0.28, T, 0x6a5040, true);
      const wall = K.part('wall', [0, 0, -1.4], null, 'House wall with hose spigot');
      K.box(wall, [4.4, 1.3, 0.1], K.std(0xd9d4c8, { roughness: 0.85 }), [0, 0.65, 0], null, 0.01);
      for (let r = 0; r < 7; r++) K.box(wall, [4.4, 0.012, 0.012], K.std(0xc4bfb2, { roughness: 0.85 }), [0, 0.42 + r * 0.13, 0.055], null, 0);
      K.box(wall, [4.4, 0.32, 0.12], 'concrete', [0, 0.16, 0], null, 0.01);
      const sp = K.group(wall, [1.5, 0.5, 0.06]);
      K.cyl(sp, [0.016, 0.016, 0.08, 16], 'brass', [0, 0, 0.04], [90, 0, 0]);
      K.cyl(sp, [0.013, 0.013, 0.05, 16], 'brass', [0, -0.03, 0.08]);
      K.cyl(sp, [0.03, 0.03, 0.01, 6], K.std(0xc23a2a, { roughness: 0.4 }), [0, 0.03, 0.06]);
      const plantsP = K.part('plants', [0, T, 0], null, 'Peppers & kale');
      const lm = leafMat(K, 0x3f7a34);
      const stem = K.std(0x5f8a3a, { roughness: 0.8 });
      const PX = [-0.85, -0.3, 0.3, 0.85];
      PX.forEach((x, i) => leafyPlant(K, plantsP, [x, 0, 0.32], 0.4 + (i % 2) * 0.08, lm, stem));
      // moisture fronts on the cut face
      const FZ = 0.632;
      const wetM = K.std(0x2e1f15, { roughness: 1 });
      const ws = K.part('wetShallow', [0, 0, 0], null, 'Daily sprinkle: only the top 1–2″ gets wet');
      K.box(ws, [2.4, 0.04, 0.004], wetM, [0, T - 0.02, FZ], null, 0);
      const wd = K.part('wetDeep', [0, 0, 0], null, 'Deep soak: wet 6–12″ down');
      K.box(wd, [2.4, 0.2, 0.004], wetM, [0, T - 0.1, FZ], null, 0);
      const rootM = K.std(0xe8dcc0, { roughness: 0.8 });
      const rs = K.part('rootsShallow', [0, 0, 0], null, 'Shallow roots: wilt on hot days');
      const rd = K.part('rootsDeep', [0, 0, 0], null, 'Deep roots: drought-tough');
      PX.forEach((x) => {
        rootFan(K, rs, x, T, 0.04, 0.2, 7, rootM, FZ + 0.004);
        rootFan(K, rd, x, T, 0.21, 0.2, 7, rootM, FZ + 0.004);
      });
      const gauge = K.part('gauge', [1.5, 0, -0.5], null, 'Rain gauge — log every rain');
      K.box(gauge, [0.04, 0.85, 0.04], K.pbr('wood_planks', [0.2, 1], { color: 0xc89a6a }, 'wood'), [0, 0.42, 0], null, 0.004);
      K.cyl(gauge, [0.025, 0.02, 0.25, 16], K.std(0xe4f1f7, { transparent: true, opacity: 0.4, roughness: 0.05 }), [0, 0.85, 0.045]);
      K.cyl(gauge, [0.019, 0.017, 0.05, 16], 'water', [0, 0.75, 0.045]);
      const spr = K.part('sprinkler', [-1.75, 0, 0.4], null, 'Sprinkler being measured');
      const sg = K.glb(spr, 'garden_sprinkler_01', { height: 0.12 }, [0, 0, 0]);
      if (!sg) { K.cyl(spr, [0.08, 0.1, 0.03, 20], 'green', [0, 0.015, 0]); K.cyl(spr, [0.01, 0.01, 0.1, 8], 'brass', [0, 0.08, 0]); }
      K.tube(spr, [[0.05, 0.01, 0], [0.6, 0.01, -0.6], [2.4, 0.01, -1.2], [3.25, 0.01, -1.31], [3.25, 0.45, -1.32]], 0.009, 'green');
      const spray = [];
      for (let k = 0; k < 18; k++) {
        const d = K.sph(spr, 0.008, 'water', [0, 0.12, 0], [1, 1, 1]);
        d.userData.noPick = true;
        spray.push(d);
      }
      const can = K.part('can', [-0.2, T, -0.25], null, 'Tuna can: time how long to fill 1″');
      K.lathe(can, [[0, 0], [0.042, 0], [0.043, 0.035], [0.041, 0.035], [0.04, 0.003], [0, 0.003]], 'steel');
      const cw = K.part('canWater', [-0.2, T, -0.25], null, '1″ of water');
      K.cyl(cw, [0.04, 0.04, 0.025, 24], 'water', [0, 0.0155, 0]);
      const drip = K.part('drip', [0, 0, 0], null, 'Drip line, 12″ emitters (0.5 gph), 3 rows');
      const ml = [[1.5, 0.5, -1.25], [1.5, 0.3, -1.2], [1.35, 0.05, -1.1], [1.25, 0.05, -0.7], [1.2, T + 0.01, -0.62], [1.1, T + 0.01, -0.45]];
      K.tube(drip, ml, 0.008, 'black');
      K.bar(drip, [1.1, T + 0.01, -0.45], [1.1, T + 0.01, 0.45], 0.007, 'black');
      [-0.4, 0, 0.4].forEach((z) => {
        K.cyl(drip, [0.007, 0.007, 2.2, 10], 'black', [0, T + 0.008, z], [0, 0, 90]);
        for (let i = 0; i < 8; i++) K.cyl(drip, [0.009, 0.009, 0.016, 10], K.std(0x6a2a2a, { roughness: 0.5 }), [-1.05 + i * 0.3, T + 0.008, z], [0, 0, 90]);
      });
      const timer = K.part('timer', [1.5, 0.39, -1.28], null, 'Timer → backflow → filter → 25 psi regulator');
      K.box(timer, [0.1, 0.14, 0.08], K.std(0x2f6fde, { roughness: 0.4 }), [0, 0, 0], null, 0.015);
      K.box(timer, [0.06, 0.04, 0.003], 'screen', [0, 0.02, 0.041], null, 0);
      K.cyl(timer, [0.022, 0.022, 0.07, 16], K.std(0xe4f1f7, { transparent: true, opacity: 0.6, roughness: 0.1 }), [0, -0.11, 0.0]);
      K.cyl(timer, [0.018, 0.018, 0.05, 16], K.std(0x3a3d40, { roughness: 0.5 }), [0, -0.17, 0]);
      const mulch = K.part('mulch', [0, T + 0.025, 0.0], null, '2–3″ straw or shredded leaves over the drip');
      K.box(mulch, [2.4, 0.05, 1.22], K.bumpy(0xd9c27e, TB.tex.speckle(), 0.03, { roughness: 1 }), [0, 0, 0.01], null, 0.01);
      K.rep(80, (i) => K.box(mulch, [0.09, 0.004, 0.004], K.std(0xe6d08e, { roughness: 1 }), [Math.sin(i * 12.7) * 1.15, 0.026, Math.cos(i * 7.3) * 0.58], [0, (i * 53) % 180, 0], 0));

      /* add-ons */
      AO.sensor(K, 'aoSensor', [0.55, T + 0.1, 0.0], 'Smart soil-moisture sensor (skips watering when wet)');
      const barrel = K.part('aoBarrel', [-1.4, 0, -1.05], null, 'Rain barrel under the downspout');
      K.cyl(barrel, [0.28, 0.28, 0.12, 6], 'concrete', [0, 0.06, 0]);
      K.lathe(barrel, [[0, 0.12], [0.27, 0.12], [0.3, 0.5], [0.27, 1.0], [0, 1.0]], K.std(0x3d4a3a, { roughness: 0.55 }), [0, 0, 0]);
      K.cyl(barrel, [0.03, 0.03, 0.8, 12], K.std(0xece8df, { roughness: 0.5 }), [0, 1.4, -0.25]);
      K.tube(barrel, [[0, 1.0, -0.25], [0, 0.98, -0.1], [0, 1.0, 0]], 0.03, K.std(0xece8df, { roughness: 0.5 }));
      K.cyl(barrel, [0.012, 0.012, 0.06, 8], 'brass', [0, 0.22, 0.3], [90, 0, 0]);
      const olla = K.part('aoOlla', [0.0, T, 0.53], null, 'Buried clay olla (seeps water to roots)');
      K.cyl(olla, [0.045, 0.05, 0.03, 20], K.std(0xc0663e, { roughness: 0.85 }), [0, 0.015, 0]);
      K.cyl(olla, [0.055, 0.055, 0.012, 20], K.std(0xb0582e, { roughness: 0.85 }), [0, 0.035, 0]);
      K.lathe(olla, [[0, -0.2], [0.09, -0.17], [0.11, -0.1], [0.07, -0.02], [0.045, 0], [0.04, 0]], K.std(0xc0663e, { roughness: 0.85 }), [0, 0, 0]);
      return {
        tick(t, fx) {
          spray.forEach((d, k) => {
            d.visible = fx === 'spray';
            if (!d.visible) return;
            const ph = (t * 0.8 + k / spray.length) % 1;
            const az = (k * 0.9 + t * 0.3) % 1.4 - 0.2;
            const dist = ph * 1.6;
            d.position.set(Math.cos(az) * dist, 0.12 + ph * 1.1 - ph * ph * 1.15, -Math.sin(az) * dist * 0.4);
          });
        },
      };
    }
  );

  /* =====================================================================
     9 · Garlic (fall) and potatoes (spring) in a 4×8 bed
     ===================================================================== */
  const GAR_X = [];
  for (let i = 0; i < 12; i++) GAR_X.push(-1.0 + i * 0.182);
  const GAR_Z = [-0.45, -0.15, 0.15, 0.45];
  const POT_X = [];
  for (let i = 0; i < 8; i++) POT_X.push(-0.98 + i * 0.28);
  const POT_Z = [-0.3, 0.3];
  function clove(K, p, pos, s, mat, papery) {
    K.lathe(p, [[0, 0], [0.012 * s, 0.002], [0.016 * s, 0.012 * s], [0.012 * s, 0.026 * s], [0.004 * s, 0.036 * s], [0, 0.04 * s]], papery ? mat : mat, pos);
  }
  function bulb(K, p, pos, s, mat) {
    const g = K.group(p, pos);
    K.lathe(g, [[0, 0], [0.02 * s, 0.003], [0.032 * s, 0.015 * s], [0.03 * s, 0.03 * s], [0.016 * s, 0.045 * s], [0.006 * s, 0.055 * s], [0, 0.056 * s]], mat);
    for (let k = 0; k < 8; k++) K.bar(g, [0, 0.002, 0], [Math.cos(k) * 0.025 * s, -0.02 * s, Math.sin(k) * 0.025 * s], 0.0012, K.std(0xd8ccb0, { roughness: 1 }));
    return g;
  }
  function potato(K, p, pos, s, mat, rot) {
    return K.sph(p, 0.03 * s, mat, pos, [1.3, 0.85, 1]).rotation.set(0, rot || 0, 0);
  }
  function potatoPlant(K, p, pos, h, M, flowers) {
    const g = K.group(p, pos);
    for (let s = 0; s < 4; s++) {
      const az = s * 90 + 20;
      const top = [Math.cos(az * K.DEG) * h * 0.25, h, Math.sin(az * K.DEG) * h * 0.25];
      K.bar(g, [0, 0, 0], top, 0.006, M.stem);
      for (let k = 1; k <= 3; k++) compound(K, g, [top[0] * k / 3, top[1] * k / 3, top[2] * k / 3], az + k * 120, 25, 0.12 + h * 0.15, M.leaf, M.stem);
      if (flowers) K.rep(3, (f) => K.sph(g, 0.012, M.flower, [top[0] + Math.cos(f * 2) * 0.03, top[1] + 0.03, top[2] + Math.sin(f * 2) * 0.03], [1, 0.5, 1]));
    }
    return g;
  }
  const GAR_AO = ['aoHoops', 'aoDrip'];
  TB.model(
    'growGarlic',
    GARDEN({ cam: [2.3, 1.7, 2.6], at: [0, 0.35, 0],
      hidden: ['compostG', 'seedTray', 'furrows', 'cloves', 'straw', 'shoots', 'mature', 'scapes', 'bulbsUG', 'curing',
        'seedPot', 'trench', 'pieces', 'potYoung', 'hill1', 'potBig', 'hill2', 'tubers', 'dug'].concat(GAR_AO) }),
    (K) => {
      const T = 0.28;
      raisedBed(K, 'bedG', '4×8 raised bed, full sun, well drained', 0.42, T, 0x5a4030);
      const comp = K.part('compostG', [0, T + 0.01, 0], null, '2″ compost + 2–3 lb 10-10-10 per 100 sq ft');
      K.box(comp, [2.4, 0.02, 1.2], soilMat(K, 0x3a2a1e), [0, 0, 0], null, 0.005);
      const S = T + 0.02; // working soil surface
      const skin = K.std(0xf1e6d2, { roughness: 0.8 });
      const skinP = K.std(0xe8d6c8, { roughness: 0.8 });
      // seed garlic tray
      const tray = K.part('seedTray', [1.65, 0, 0.75], null, 'Seed garlic: biggest cloves, pointy end up');
      K.box(tray, [0.5, 0.06, 0.35], K.pbr('wood_planks', [0.4, 0.3], { color: 0xc89a6a }, 'woodLight'), [0, 0.03, 0], null, 0.006);
      [[-0.15, -0.08], [0.0, -0.09], [0.15, -0.07]].forEach(([x, z]) => bulb(K, tray, [x, 0.06, z], 1.4, skinP));
      for (let k = 0; k < 12; k++) clove(K, tray, [-0.2 + (k % 6) * 0.08, 0.06, 0.04 + Math.floor(k / 6) * 0.07], 1.1, skin);
      const furrows = K.part('furrows', [0, S + 0.001, 0], null, '4 rows, 12″ apart; cloves every 6–7″');
      GAR_Z.forEach((z) => K.box(furrows, [2.3, 0.004, 0.03], K.std(0x2a1c12, { roughness: 1 }), [0, 0, z], null, 0));
      const cloves = K.part('cloves', [0, 0, 0], null, 'Cloves 2″ deep, flat base down');
      GAR_X.forEach((x) => GAR_Z.forEach((z) => clove(K, cloves, [x, S - 0.05 - 0.04, z], 1, skin)));
      const straw = K.part('straw', [0, S + 0.05, 0], null, '4–6″ straw after the ground starts to freeze');
      K.box(straw, [2.4, 0.1, 1.2], K.bumpy(0xd9c27e, TB.tex.speckle(), 0.03, { roughness: 1 }), [0, 0, 0], null, 0.03);
      K.rep(120, (i) => K.box(straw, [0.1, 0.004, 0.004], K.std(0xe6d08e, { roughness: 1 }), [Math.sin(i * 12.7) * 1.15, 0.051, Math.cos(i * 7.3) * 0.56], [0, (i * 53) % 180, 0], 0));
      const gl = leafMat(K, 0x5f9a4a);
      const gl2 = leafMat(K, 0x4f8a50);
      const shoots = K.part('shoots', [0, 0, 0], null, 'Spring shoots — side-dress nitrogen at 4–6″');
      const mature = K.part('mature', [0, 0, 0], null, 'June: 5–6 green leaves left = harvest time');
      const scapes = K.part('scapes', [0, 0, 0], null, 'Scapes (snap off when they curl)');
      const bulbsUG = K.part('bulbsUG', [0, 0, 0], null, 'Bulbs sized up underground');
      const scapeM = K.std(0x7aaa5a, { roughness: 0.6 });
      GAR_X.forEach((x, i) => GAR_Z.forEach((z, j) => {
        const yaw = (i * 61 + j * 37) % 360;
        [0, 120, 240].forEach((a) => strap(K, shoots, [x, S + 0.06, z], yaw + a, 72, 0.17, 0.012, gl));
        K.cyl(mature, [0.006, 0.008, 0.25, 8], gl2, [x, S + 0.125, z]);
        [0, 72, 144, 216, 288].forEach((a, k) => strap(K, mature, [x, S + 0.08 + k * 0.035, z], yaw + a, 60, 0.4 - k * 0.03, 0.016, k < 2 ? K.std(0xb8a46a, { roughness: 0.9, side: DS }) : gl, -35));
        const sp = [[x, S + 0.25, z]];
        for (let k = 0; k <= 10; k++) sp.push([x + Math.cos(k * 0.6 + yaw) * 0.04, S + 0.32 + k * 0.012 + Math.sin(k * 0.6) * 0.02, z + Math.sin(k * 0.6 + yaw) * 0.04]);
        K.tube(scapes, sp, 0.0035, scapeM);
        K.cone(scapes, [0.006, 0.04, 8], scapeM, sp[sp.length - 1], [0, 0, 60]);
        bulb(K, bulbsUG, [x, S - 0.1, z], 1.3, skinP);
      }));
      // curing on a screen
      const curing = K.part('curing', [0, 0, 1.25], null, 'Curing 2–4 weeks: shade, airflow, 70–80°F');
      const scr = K.std(0x6a6e72, { metalness: 0.5, roughness: 0.6, wireframe: true });
      [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]].forEach(([x, z]) => K.box(curing, [0.04, 0.5, 0.04], 'woodLight', [x, 0.25, z * 0.7], null, 0.004));
      K.box(curing, [1.2, 0.01, 0.5], scr, [0, 0.5, 0], null, 0);
      K.box(curing, [1.24, 0.03, 0.54], K.pbr('wood_planks', [0.6, 0.2], { color: 0xc89a6a }, 'woodLight'), [0, 0.49, 0], null, 0.004);
      for (let k = 0; k < 8; k++) {
        const z = -0.2 + k * 0.055;
        bulb(K, curing, [-0.4, 0.52, z], 1.3, skinP).rotation.z = Math.PI / 2;
        K.bar(curing, [-0.36, 0.53, z], [0.45, 0.53, z + 0.01], 0.006, K.std(0xb8a46a, { roughness: 0.9 }));
      }
      // potatoes
      const potSkin = K.bumpy(0xc9a26a, TB.tex.speckle(), 0.01, { roughness: 0.8 });
      const potCut = K.std(0xf0e2b0, { roughness: 0.7 });
      const seedPot = K.part('seedPot', [1.65, 0, 0.75], null, 'Seed potatoes cut to 1½–2 oz, 2+ eyes, cured 2–3 days');
      K.box(seedPot, [0.5, 0.06, 0.35], K.pbr('wood_planks', [0.4, 0.3], { color: 0xc89a6a }, 'woodLight'), [0, 0.03, 0], null, 0.006);
      for (let k = 0; k < 10; k++) {
        const pos = [-0.18 + (k % 5) * 0.09, 0.075, -0.08 + Math.floor(k / 5) * 0.14];
        K.sph(seedPot, 0.035, potSkin, pos, [1.2, 0.55, 0.9]);
        K.cyl(seedPot, [0.034, 0.034, 0.002, 20], potCut, [pos[0], 0.065, pos[2]]).scale.set(1.2, 1, 0.9);
      }
      const trench = K.part('trench', [0, S, 0], null, 'Trenches 6″ deep, soil piled alongside');
      POT_Z.forEach((z) => {
        K.box(trench, [2.3, 0.004, 0.16], K.std(0x2a1c12, { roughness: 1 }), [0, 0.002, z], null, 0);
        [-1, 1].forEach((s) => K.cyl(trench, [0.06, 0.06, 2.3, 12], soilMat(K, 0x5a4232), [0, 0, z + s * 0.14], [0, 0, 90]).scale.set(1, 1, 0.6));
      });
      const pieces = K.part('pieces', [0, 0, 0], null, 'Cut side down, 12″ apart, 3–4″ of soil over');
      POT_X.forEach((x) => POT_Z.forEach((z) => K.sph(pieces, 0.035, potSkin, [x, S - 0.13, z], [1.2, 0.55, 0.9])));
      const pm = { stem: K.std(0x5f8a3a, { roughness: 0.8 }), leaf: leafMat(K, 0x3f7a34), flower: K.std(0xf4f0f4, { roughness: 0.7 }) };
      const potYoung = K.part('potYoung', [0, 0, 0], null, 'Sprouts at 6–8″: time for the first hilling');
      const potBig = K.part('potBig', [0, 0, 0], null, 'Flowering = tubers forming: keep soil evenly moist');
      const hill1 = K.part('hill1', [0, S, 0], null, 'First hill: 3–4″ of soil up the stems');
      const hill2 = K.part('hill2', [0, S, 0], null, 'Second hill 2–3 weeks later (8–12″ ridge)');
      const tubers = K.part('tubers', [0, 0, 0], null, 'New tubers set between seed piece and surface');
      POT_X.forEach((x, i) => POT_Z.forEach((z, j) => {
        potatoPlant(K, potYoung, [x, S, z], 0.17, pm, false);
        potatoPlant(K, potBig, [x, S + 0.1, z], 0.42, pm, true);
        for (let k = 0; k < 5; k++) potato(K, tubers, [x + Math.cos(k * 1.3 + i) * 0.08, S - 0.06 + (k % 3) * 0.03, z + Math.sin(k * 1.3 + j) * 0.07], 1 + (k % 2) * 0.4, potSkin, k);
      }));
      POT_Z.forEach((z) => {
        K.cyl(hill1, [0.14, 0.14, 2.3, 16], soilMat(K, 0x4a3426), [0, 0, z], [0, 0, 90]).scale.set(1, 1, 0.42);
        K.cyl(hill2, [0.2, 0.2, 2.3, 16], soilMat(K, 0x4a3426), [0, 0, z], [0, 0, 90]).scale.set(1, 1, 0.6);
      });
      const dug = K.part('dug', [0, S, 0.0], null, 'Dug 2 weeks after vines die; cure 1–2 weeks, store at 40°F');
      for (let k = 0; k < 26; k++) potato(K, dug, [-0.9 + (k % 13) * 0.15, 0.025, (k < 13 ? -0.3 : 0.3) + Math.sin(k) * 0.05], 1.2 + (k % 3) * 0.3, potSkin, k);
      const basket = K.group(dug, [1.6, -S, 0.85]);
      K.lathe(basket, [[0, 0], [0.18, 0], [0.24, 0.22], [0.235, 0.22], [0.17, 0.006], [0, 0.006]], K.std(0x9a6a3a, { roughness: 0.9 }));
      for (let k = 0; k < 10; k++) potato(K, basket, [Math.cos(k * 2.4) * 0.1 * (k % 3) * 0.6, 0.18 + (k % 3) * 0.02, Math.sin(k * 2.4) * 0.1 * (k % 3) * 0.6], 1.3, potSkin, k);

      /* add-ons */
      const hoops = K.part('aoHoops', [0, S, 0], null, 'Low tunnel: wire hoops + frost cloth');
      for (let k = 0; k < 5; k++) K.tor(hoops, [0.58, 0.004, 180], 'steel', [-1.1 + k * 0.55, 0, 0], [0, 90, 0]);
      K.cyl(hoops, [0.6, 0.6, 2.36, 32, true], K.std(0xf4f4f0, { transparent: true, opacity: 0.45, side: DS, roughness: 1 }), [0, 0, 0], [0, 0, 90]);
      const drip = K.part('aoDrip', [0, S + 0.01, 0], null, 'Drip lines under the mulch');
      [-0.3, 0, 0.3].forEach((z) => K.cyl(drip, [0.007, 0.007, 2.3, 10], 'black', [0, 0, z], [0, 0, 90]));
      K.tube(drip, [[1.15, 0, 0.3], [1.3, -0.05, 0.4], [1.4, -S, 0.6], [1.7, -S, 0.4]], 0.007, 'black');
    }
  );

  /* =====================================================================
     Guides
     ===================================================================== */
  const SEED_CAM = { cam: [0.35, 1.12, 0.8], at: [-0.25, 0.8, 0] };
  const seedStart = {
    id: 'start-seeds',
    title: 'Start seeds indoors under grow lights',
    model: 'growSeeds',
    level: 1,
    time: '6–8 weeks (20 min a day)',
    cost: '$60–200',
    summary: 'Sow in a sterile mix on a heat mat, then grow under LED lights kept 2–4″ above the leaves for 14–16 hours a day. Pot up at the first true leaves and harden off for 7–10 days before transplanting.',
    intro: { show: ['light', 'mat', 'tray', 'cells', 'mix', 'seedlings', 'fan', 'pots'], preview: true, spin: true, fx: 'grow' },
    safety: [
      'Plug lights and the heat mat into a GFCI outlet or a power strip off the floor, away from where you water.',
      'Never run a heat mat dry under a pot of dry mix for days or cover it with towels; use a thermostat if your mat has none.',
      'Seed packets treated with fungicide (often dyed pink or blue) should be handled with gloves and kept from kids and pets.',
    ],
    causes: [
      ['Count back from your last frost', 'Tomatoes and peppers: 6–8 weeks before last frost. Broccoli, cabbage: 5–7 weeks. Squash and cucumbers: only 3–4 weeks.'],
      ['Light is the whole game', 'A sunny window gives maybe a tenth of what seedlings need in March. A 4 ft LED shop light hung 2–4″ above the leaves gives stocky plants.'],
      ['Warm to sprout, cool to grow', 'Most warm-season seeds germinate fastest at 75–85°F soil. After they sprout, 65–75°F air keeps them compact.'],
    ],
    tools: ['Wire shelf + 4 ft LED shop light (4000–6500 K)', 'Outlet timer', 'Seedling heat mat (thermostat ideal)', '1020 tray, 72-cell insert, humidity dome', 'Seed-starting mix (peat or coir + perlite)', 'Seeds + plant labels', 'Small fan', '4″ pots + potting mix', 'Half-strength liquid fertilizer'],
    steps: [
      { t: 'Set up light, shelf and mat', d: 'Hang a 4 ft LED shop light on chains over a wire shelf, put the heat mat under where the tray will sit, and plug the light into a timer set for 16 hours on, 8 off.', why: 'Chains let you keep the light 2–4″ above the leaves as seedlings grow. Distance matters more than wattage; light intensity falls off fast.', tip: 'Cool-white 5000–6500 K LEDs work as well as pricey grow lights for seedlings.', v: { cam: [1.1, 1.3, 1.4], at: [0, 0.95, 0], hi: ['light', 'mat'], show: ['light', 'mat'], mv: { light: [0, 0.22, 0] }, fx: 'grow' } },
      { t: 'Pre-moisten the mix', d: 'Stir warm water into the seed-starting mix until it feels like a wrung-out sponge: a squeezed handful drips a drop or two and then crumbles.', why: 'Dry peat sheds water. Watering after sowing washes tiny seeds around and leaves dry pockets.', v: { cam: [0.9, 1.15, 0.8], at: [0.3, 0.82, 0], hi: ['premix'], show: ['premix'], fx: 'grow', tool: { id: 'trowel', at: [0.32, 0.88, 0.02], rot: [0, 0, 30] } } },
      { t: 'Fill and firm the cells', d: 'Overfill the 72-cell insert in its tray, scrape level, and tap the tray down once to settle. Don’t pack it hard.', why: 'Settled cells don’t sink after watering, and a loose mix keeps air around the roots.', v: { cam: SEED_CAM.cam, at: SEED_CAM.at, hi: ['cells', 'mix'], show: ['tray', 'cells', 'mix'], hide: ['premix'], fx: 'grow' } },
      { t: 'Sow 2 seeds per cell', d: 'Press seeds in 2–3 times as deep as they are wide: about ¼″ for tomatoes and peppers, barely covered for lettuce. Label every row with crop and date.', why: 'Planting too deep is the most common reason seeds never show up. Two seeds per cell covers the ones that don’t germinate.', tip: 'Lettuce, snapdragons and petunias need light to sprout. Press them onto the surface and don’t cover them.', v: { cam: [0.0, 1.0, 0.35], at: [-0.27, 0.81, 0], hi: ['seeds'], show: ['seeds'], fx: 'grow' } },
      { t: 'Dome on, heat mat on', d: 'Mist the surface, set the clear dome on, and run the mat so the mix sits at 75–80°F. Keep the lights off or raised until sprouts appear.', why: 'Warm, humid mix can cut tomato germination from 14 days to 5. Peppers are slower and love 80–85°F.', v: { cam: SEED_CAM.cam, at: SEED_CAM.at, hi: ['dome', 'mat'], show: ['dome'], fx: 'heat' } },
      { t: 'Sprouts up: dome off, lights down', d: 'As soon as about half the cells show green, remove the dome, turn off or unplug the heat mat, and lower the light to 2–3″ above the sprouts.', why: 'Seedlings stretch toward weak light within a day or two. Once leggy, they stay weak. Removing the dome also prevents damping-off fungus.', v: { cam: SEED_CAM.cam, at: SEED_CAM.at, hi: ['sprouts', 'light'], show: ['sprouts', 'doubles'], hide: ['dome', 'seeds'], mv: { light: [0, -0.2, 0] }, fx: 'grow' } },
      { t: 'Water from below and add a breeze', d: 'Pour ½″ of water into the tray and let the cells drink for 20–30 minutes, then dump the rest. Run a small fan on low 2–4 hours a day.', why: 'Bottom watering keeps the surface dry, which is where damping-off starts. Gentle wind makes stems thicker, like hardening a muscle.', v: { cam: [0.9, 1.15, 1.2], at: [0, 0.85, 0], hi: ['tray', 'fan'], show: ['fan'], fx: 'grow', tool: { id: 'wateringCan', at: [0.08, 0.84, 0.18], rot: [0, -90, 20], scale: 0.8 } } },
      { t: 'Thin and start feeding', d: 'When the first true leaves open, snip the weaker seedling in each cell at soil level with scissors. Feed with a quarter- to half-strength liquid fertilizer once a week.', why: 'Pulling the extra rips the keeper’s roots. Seed-starting mix has almost no nutrients, so seedlings yellow without feeding once true leaves appear.', v: { cam: SEED_CAM.cam, at: SEED_CAM.at, hi: ['seedlings'], show: ['seedlings'], hide: ['sprouts', 'doubles'], mv: { light: [0, -0.15, 0] }, fx: 'grow' } },
      { t: 'Pot up to 4″ pots', d: 'At 3–4 weeks, or when roots fill the cell, move each seedling into a 4″ pot of potting mix. Bury tomatoes up to their first leaves.', why: 'Root-bound seedlings stall and harden. Tomatoes grow new roots all along a buried stem, so they come out sturdier.', v: { cam: [0.8, 1.15, 0.85], at: [0.3, 0.85, 0], hi: ['pots'], show: ['pots'], mv: { light: [0, 0, 0] }, fx: 'grow' } },
      { t: 'Harden off for 7–10 days', d: 'Start with 1–2 hours outdoors in shade, out of the wind. Add an hour or two each day and slowly move into sun. Bring them in if nights drop below 50°F.', why: 'Indoor leaves have never felt UV or wind. Moving them straight into sun scorches them white within a few hours.', tip: 'After a week they should stay out overnight before planting. Transplant on a cloudy day or in the evening.', v: { cam: [0.9, 0.9, 1.9], at: [0.05, 0.35, 0.6], hi: ['harden', 'pots'], show: ['harden'], mv: { pots: [-0.2, -0.458, 0.75] }, fx: 'grow' } },
    ],
    learn: {
      how: 'A seed carries just enough stored food to push up a root and its first seed leaves (cotyledons). From then on it lives on light. Seedlings under weak light make long, thin stems as they reach for more, and that stretch can’t be undone. A heat mat speeds germination because seed enzymes work faster in warm soil. Once the seedling is up, cooler air and strong, close light make it short and thick with dark green leaves. Hardening off thickens the leaf cuticle and builds UV-protective pigments before the plant faces full sun.',
      specs: [['Germination soil temp', '75–85°F (tomato, pepper); 65–75°F (lettuce, brassicas)'], ['Days to sprout', 'Tomato 5–10, pepper 7–14, lettuce 2–7, onion 7–10'], ['Light height', '2–4″ (LED/fluorescent) above leaves'], ['Light hours', '14–16 on, 8–10 off'], ['Growing air temp', '65–75°F day, ~60°F night'], ['Sowing depth', '2–3× seed width'], ['Feed', '¼–½ strength, weekly after true leaves'], ['Hardening off', '7–10 days']],
      terms: [['Cotyledon', 'The first “seed leaves,” usually smooth and oval; they don’t look like the plant’s real leaves.'], ['True leaves', 'The second set of leaves, shaped like the adult plant’s.'], ['Damping-off', 'A fungal rot that collapses seedlings at the soil line, encouraged by soggy, still, cool conditions.'], ['Leggy', 'Tall, pale, weak stems from too little light.'], ['Potting up', 'Moving a seedling into a bigger pot before its roots circle.']],
      mistakes: ['Starting too early. 12-week-old tomatoes in 4″ pots stall and bloom early.', 'Light a foot or more above the plants.', 'Leaving the dome on after sprouting (damping-off).', 'Watering from the top every day and keeping the mix soggy.', 'Skipping hardening off.'],
      tips: ['Reuse cell packs after washing them in a 1:10 bleach solution.', 'Brush your hand across the tops of seedlings 10 times a day if you don’t have a fan.', 'Keep a notebook: sow date, sprout date and variety. Next year’s timing will be perfect.'],
    },
    pro: 'You’re growing hundreds of transplants (look at a hobby greenhouse or a local grower), or seedlings keep collapsing even with good airflow and clean trays (have a sample checked by your county extension office).',
    addons: [
      { id: 'timer', part: 'aoTimer', name: 'Smart plug timer', cat: 'Tech', blurb: 'Runs the lights on a 16/8 schedule and tracks power use.', cost: [12, 30], how: 'Plug the power strip for the lights into the smart plug and set a schedule, for example 6 am to 10 pm. Pick one rated for at least 15 A.', needs: ['Smart plug', 'Power strip'], shop: 'Smart plug with schedule' },
      { id: 'thermo', part: 'aoThermo', name: 'Heat-mat thermostat', cat: 'Tech', blurb: 'Holds the mix at exactly 78°F, not whatever the mat feels like.', cost: [25, 45], how: 'Plug the mat into the controller, push the probe 1″ into a center cell, and set 75–80°F for germination.', needs: ['Seedling heat mat thermostat'], shop: 'Seedling heat mat thermostat controller' },
      { id: 'refl', part: 'aoRefl', name: 'Reflective panels', cat: 'Garden', blurb: 'Bounces stray light back onto the edge plants.', cost: [15, 40], how: 'Clip Mylar or white foam board around the back and sides of the shelf. Leave the front open for air.', needs: ['Reflective Mylar film', 'Binder clips'], shop: 'Reflective mylar film roll' },
      { id: 'hygro', part: 'aoHygro', name: 'Thermometer-hygrometer', cat: 'Tech', blurb: 'Know your air temp and humidity at a glance.', cost: [10, 25], how: 'Set it at seedling height. Aim for 65–75°F and 50–70% RH; open the vents or run the fan if it stays above 80% RH.', needs: ['Digital thermometer-hygrometer'], shop: 'Digital thermometer hygrometer' },
    ],
  };

  const TC = { cam: [1.3, 0.9, 1.5], at: [0, 0.3, 0] };
  const tomatoes = {
    id: 'grow-tomatoes',
    title: 'Plant, stake and prune tomatoes',
    model: 'growTomato',
    level: 2,
    time: '1 hr to plant, then 10 min a week',
    cost: '$30–90',
    summary: 'Plant hardened-off transplants deep into warm, compost-rich soil, 24–36″ apart, with the stake or cage in first. Tie or cage as they grow, pinch suckers on indeterminates, water deeply and evenly, and pick at first blush.',
    intro: { show: ['stakes', 'mature', 'ties1', 'ties2', 'mulch'], preview: true, spin: true },
    safety: ['Tomato leaves and stems are mildly toxic to pets; keep cats and dogs from chewing them.', 'Wear gloves when handling treated seed or synthetic fertilizer, and wash hands after.', 'Drive stakes with a mallet, not a hammer on your thumb: hold the stake with a tool or have a helper steady it from the side.'],
    causes: [
      ['Determinate or indeterminate?', 'Determinates (Celebrity, Roma, Rutgers) grow 3–4 ft, set fruit over 3–4 weeks and need only a cage. Indeterminates (Brandywine, Sungold, Early Girl) vine to 6–10 ft until frost and need tall stakes or heavy cages.'],
      ['Wait for warm soil', 'Plant when soil at 4″ is 60°F+ and nights stay above 50°F, usually 1–2 weeks after the last frost. Cold soil stalls them for weeks.'],
      ['Sun and spacing', 'At least 8 hours of direct sun. Space staked plants 24″ apart, caged 30–36″, sprawling 36–48″, rows 4 ft apart.'],
    ],
    tools: ['Hardened-off transplants', 'Compost (2″ over the bed)', 'Balanced fertilizer (e.g. 5-5-5 organic)', '8 ft 2×2 stakes or heavy cages', 'Mallet', 'Soft plant ties', 'Trowel', 'Soil thermometer', 'Straw mulch', 'Clean pruners'],
    steps: [
      { t: 'Check soil temperature and prep', d: 'Push a soil thermometer 4″ deep in the morning; plant once it reads 60°F or more. Spread 2″ of compost and 2–3 lb of balanced organic fertilizer (or about 1 lb of 10-10-10) per 100 sq ft and fork it in.', why: 'Tomato roots barely grow below 55°F. Compost feeds steadily and holds water, which helps prevent blossom-end rot later.', v: { cam: [1.3, 0.8, 1.4], at: [0.4, 0.05, 0.1], hi: ['thermo', 'bed'], show: ['thermo'] } },
      { t: 'Drive the stakes first', d: 'Pound an 8 ft stake 12–18″ deep, 3–4″ from where each plant will go. Space plants 24″ apart for staked, 28–36″ for caged.', why: 'Driving a stake after planting spears the root ball. With the stake in first, roots grow around it.', v: { cam: [1.6, 1.4, 1.8], at: [0, 0.8, 0], hi: ['stakes'], show: ['stakes'], hide: ['thermo'], tool: { id: 'sledge', at: [0.36, 1.92, -0.1], rot: [0, 0, 0], anim: 'tap' } } },
      { t: 'Strip the lower leaves', d: 'Pinch off all leaves on the bottom half to two-thirds of each 10–12″ transplant, leaving the top 3–4 leaves.', why: 'Those leaves would be buried and rot. The bare stem will turn into root.', v: { cam: [0.7, 0.45, 1.05], at: [0, 0.18, 0.42], hi: ['lowerSet'], show: ['potted'] } },
      { t: 'Dig deep holes', d: 'Dig a hole deep enough to bury the stem up to the remaining leaves, about 8″. On a lanky plant, dig a shallow trench and lay the stem sideways, bending the top up gently.', why: 'Tomatoes sprout roots all along a buried stem (adventitious roots). A deep-planted tomato has twice the roots and handles drought far better.', v: { cam: TC.cam, at: TC.at, hi: ['holes'], show: ['holes'], hide: ['lowerSet'], tool: { id: 'trowel', at: [-0.3, 0.05, 0.1], rot: [20, 0, -20], anim: 'push' } } },
      { t: 'Plant and water in', d: 'Set each plant so only the top 4–6″ show, firm the soil, and soak each one with a gallon of water, plus half-strength fish emulsion or a starter fertilizer if you like.', why: 'Water settles soil around the roots and removes air pockets. A starter solution high in phosphorus helps new roots.', v: { cam: TC.cam, at: TC.at, hi: ['transplant'], show: ['transplant'], hide: ['holes', 'potted'], tool: { id: 'wateringCan', at: [0.5, 0.35, 0.1], rot: [0, 180, 25] } } },
      { t: 'Mulch once the soil is warm', d: 'In 2–3 weeks, when the soil is warm, spread 2–3″ of straw or shredded leaves over the bed, keeping it 2″ off the stems.', why: 'Mulch evens out soil moisture and keeps soil (and the early blight spores in it) from splashing onto the leaves.', v: { cam: TC.cam, at: TC.at, hi: ['mulch'], show: ['mulch'] } },
      { t: 'Tie to the stake as it grows', d: 'Every 8–12″ of growth, loop a soft tie in a figure-8: once around the stake, cross over, and once loosely around the stem, below a leaf.', why: 'The figure-8 keeps the stem from rubbing the stake and leaves room for it to thicken. Tight ties strangle the stem.', v: { cam: [1.5, 1.0, 1.6], at: [0, 0.45, 0], hi: ['ties1'], show: ['young', 'suckers', 'lowLeaves', 'ties1'], hide: ['transplant'] } },
      { t: 'Pinch out the suckers', d: 'Once a week, snap off the shoots that grow in the crotch between a leaf and the main stem while they’re 2–4″ long. Keep one leader (or two: the main stem plus the sucker just below the first flower cluster).', why: 'Every sucker becomes another full stem. Removing them focuses energy on fewer, bigger fruit, keeps the plant on its stake and lets air through to dry the leaves.', tip: 'Pinch with your fingers in the morning when stems are crisp. Big suckers need clean pruners, not a ragged tear.', v: { cam: [0.95, 0.75, 0.9], at: [0.36, 0.45, 0], hi: ['suckers'] } },
      { t: 'Clear the bottom 12″', d: 'Remove leaves that touch the soil or sit within 12″ of it, and any yellowing leaf with dark target spots.', why: 'Early blight and septoria live in the soil and start on the lowest leaves. A clean gap stops splash-borne spores.', v: { cam: [1.1, 0.5, 1.2], at: [0, 0.2, 0], hi: ['lowLeaves'], hide: ['suckers'] } },
      { t: 'Water deeply, feed at fruit set', d: 'Give 1–1.5″ of water a week in one or two deep soakings at the base, never the leaves. Side-dress with 1 tbsp of 10-10-10 per plant (or compost) when the first fruits are golf-ball size, then every 3–4 weeks.', why: 'Swings from dry to soaked cause blossom-end rot and split fruit. Too much nitrogen early gives huge leafy plants with few tomatoes.', v: { cam: [2.1, 1.5, 2.2], at: [0, 0.8, 0], hi: ['mature', 'ties2'], show: ['mature', 'ties2'], hide: ['young', 'lowLeaves'] } },
      { t: 'Top and harvest', d: 'A month before your first frost, pinch off the stem tips so the plant ripens what’s already set. Pick when fruit shows the first blush of color and finish ripening on the counter, stem up, out of the fridge.', why: 'Tomatoes picked at breaker stage taste the same as vine-ripened and avoid cracking, birds and squirrels.', v: { cam: [1.3, 1.25, 1.2], at: [0, 1.0, 0], hi: ['mature'] } },
    ],
    learn: {
      how: 'Tomatoes are warm-season vines. Indeterminate types grow from the tip forever, with a flower cluster every three leaves and a sucker at every leaf, so they need a structure and pruning to stay manageable. Determinate types end each stem in a flower cluster, stop at 3–4 ft, and ripen most of their crop at once. Fruit quality depends on steady water (calcium moves with water, and a shortage causes blossom-end rot), moderate nitrogen, and sun on the leaves rather than on the fruit.',
      specs: [['Soil temp to plant', '≥ 60°F at 4″'], ['Night temp', '> 50°F; fruit set drops above 75°F nights / 90°F days'], ['Spacing', '24″ staked, 30–36″ caged, rows 4 ft'], ['Soil pH', '6.2–6.8'], ['Water', '1–1.5″ per week, at the base'], ['Stake', '8 ft, 12–18″ deep (indeterminate); 4–5 ft (determinate)'], ['Side-dress', 'At first fruit, then every 3–4 weeks']],
      terms: [['Sucker', 'A side shoot growing from the leaf axil.'], ['Leader', 'A main stem you train upward.'], ['Truss', 'A flower or fruit cluster.'], ['Blossom-end rot', 'A dark sunken spot on the bottom of fruit from calcium shortage, almost always caused by uneven watering.'], ['Breaker stage', 'The first blush of color; the fruit has sealed off from the vine.']],
      mistakes: ['Planting into cold soil in early spring.', 'Pruning determinate tomatoes above the first flower cluster (you remove the crop).', 'Overhead watering in the evening.', 'Heavy nitrogen feeding (lots of leaves, few fruit).', 'Tying with wire or string that cuts into the stem.'],
      tips: ['Rotate tomatoes (and peppers, potatoes, eggplant) to a new bed for 3 years to break disease cycles.', 'Choose disease-resistant varieties (look for V, F, N, T codes) if you’ve had wilts before.', 'A 5 ft cage of 6″ concrete-reinforcing mesh outlasts any store-bought cone cage.'],
    },
    pro: 'Leaves wilt and yellow in a V-shape or whole plants collapse despite water (likely a wilt disease). Send a sample to your extension plant clinic before replanting in that soil.',
    variants: [
      { id: 'indeterminate', name: 'Indeterminate (staked)', blurb: 'Vining types that grow until frost: tall stake, weekly sucker pinching.' },
      {
        id: 'determinate',
        name: 'Determinate (caged)',
        blurb: 'Bush types like Roma and Celebrity: a cage and almost no pruning.',
        time: '45 min to plant, little upkeep',
        intro: { show: ['cages', 'bush', 'mulch'], preview: true, spin: true },
        summary: 'Determinate tomatoes grow into a 3–4 ft bush and ripen most of their fruit over 3–4 weeks. Set the cage at planting, prune only below the first flower cluster, and water evenly.',
        steps: [
          { t: 'Check soil temperature and prep', d: 'Plant once the soil 4″ down reads 60°F. Fork in 2″ of compost and 2–3 lb of balanced organic fertilizer per 100 sq ft.', why: 'Warm, rich soil gets determinates off to a fast start; they have a short window to build the plant before they set fruit.', v: { cam: [1.3, 0.8, 1.4], at: [0.4, 0.05, 0.1], hi: ['thermo', 'bed'], show: ['thermo'] } },
          { t: 'Dig deep holes 30–36″ apart', d: 'Strip the lower leaves and dig holes deep enough to bury two-thirds of the stem.', why: 'A deep-planted tomato roots along the buried stem and handles dry spells better.', v: { cam: TC.cam, at: TC.at, hi: ['holes'], show: ['holes'], hide: ['thermo'], tool: { id: 'trowel', at: [-0.3, 0.05, 0.1], rot: [20, 0, -20], anim: 'push' } } },
          { t: 'Plant and water in', d: 'Set the plants deep, firm the soil, and give each a gallon of water.', why: 'Soaking settles soil around the roots.', v: { cam: TC.cam, at: TC.at, hi: ['transplant'], show: ['transplant'], hide: ['holes'], tool: { id: 'wateringCan', at: [0.5, 0.35, 0.1], rot: [0, 180, 25] } } },
          { t: 'Set the cages now', d: 'Center a sturdy cage (18–24″ wide, 4–5 ft tall) over each plant and push the legs in 6–8″, or anchor it to a short stake.', why: 'A cage put on later breaks branches. A loaded determinate is heavy and top-heavy cages blow over without an anchor.', v: { cam: [1.6, 1.2, 1.8], at: [0, 0.6, 0], hi: ['cages'], show: ['cages'] } },
          { t: 'Mulch when the soil warms', d: 'Spread 2–3″ of straw after 2–3 weeks.', why: 'Mulch keeps moisture even and blocks soil splash.', v: { cam: TC.cam, at: TC.at, hi: ['mulch'], show: ['mulch'] } },
          { t: 'Prune only below the first flowers', d: 'Remove suckers and leaves below the first flower cluster only. Leave everything above it.', why: 'Determinates set fruit at the end of each stem. Removing upper suckers removes fruit, with no gain in size.', v: { cam: [1.4, 0.9, 1.6], at: [0, 0.3, 0], hi: ['bushYoung'], show: ['bushYoung'], hide: ['transplant'] } },
          { t: 'Water and feed evenly', d: 'Give 1–1.5″ a week at the base. Side-dress once when fruit is golf-ball size.', why: 'The whole crop sizes up at once, so steady water matters even more than on indeterminates.', v: { cam: [1.6, 1.2, 1.8], at: [0, 0.5, 0], hi: ['bush'], show: ['bush'], hide: ['bushYoung'] } },
          { t: 'Harvest the flush', d: 'Pick at first blush over 3–4 weeks. For sauce, pick the whole crop when most fruit is ripe and process it in a batch.', why: 'Determinates are bred for a concentrated harvest, ideal for canning.', v: { cam: [1.2, 0.9, 1.3], at: [0, 0.5, 0], hi: ['bush'] } },
        ],
      },
    ],
    addons: [
      { id: 'drip', part: 'aoDrip', name: 'Drip line + timer', cat: 'Garden', blurb: 'Even, at-the-root watering that prevents blossom-end rot.', cost: [35, 90], how: 'Run ½″ drip tubing with 12″ emitters down the row under the mulch. Connect through a timer, backflow preventer, filter and 25 psi regulator. Run about 45–60 min twice a week, adjusting for rain.', needs: ['Drip line with emitters', 'Hose timer', 'Pressure regulator + filter'], shop: 'Drip irrigation kit vegetable garden' },
      { id: 'sensor', part: 'aoSensor', name: 'Soil moisture sensor', cat: 'Tech', blurb: 'Tells your phone when the root zone is drying out.', cost: [25, 60], how: 'Push the probe 4–6″ deep between plants. Water when it reads around 30% volumetric moisture in loam.', needs: ['Wi-Fi soil moisture sensor'], shop: 'Wifi soil moisture sensor' },
      { id: 'basil', part: 'aoBasil', name: 'Companion basil & marigolds', cat: 'Garden', blurb: 'Fills the gaps, draws pollinators and makes the caprese.', cost: [10, 25], how: 'Plant basil 12″ from the tomatoes and French marigolds at the bed corners.', needs: ['Basil starts', 'Marigold starts'], shop: 'Basil plant starts' },
    ],
  };

  const SC = { cam: [2.2, 1.6, 2.4], at: [0, 0.25, 0.1] };
  const soil = {
    id: 'soil-test',
    title: 'Test and amend garden soil',
    model: 'growSoil',
    level: 1,
    time: '1 hr + 1–3 weeks for results',
    cost: '$15–80',
    summary: 'Take 10–15 cores from the root zone, mix them, and send a cup to your state’s extension soil lab. Then add exactly what the report says: lime or sulfur for pH, compost for organic matter, and fertilizer at the rate for your crop.',
    intro: { show: ['worked', 'plants'], preview: true, spin: true },
    safety: ['Wear gloves and a dust mask when spreading lime, sulfur or granular fertilizer, and spread on a calm day.', 'Store fertilizer and sulfur sealed, dry and away from kids and pets. Some organic fertilizers (bone, blood, fish meal) attract dogs.', 'Don’t add lime and ammonium fertilizer on the same day; they react and lose nitrogen as ammonia.'],
    causes: [
      ['Why test, not guess', 'Most garden problems blamed on “bad soil” are pH or too much phosphorus. Many old gardens already have 3–10× the phosphorus they need, and more harms waterways.'],
      ['When to sample', 'Fall is ideal: labs are quiet and lime has all winter to work. Early spring works too. Skip soil that’s wet, frozen or just fertilized.'],
      ['Home kit or lab?', 'Cheap color kits are rough for pH and poor for nutrients. A state extension lab costs $15–30 and gives exact lime and fertilizer rates.'],
    ],
    tools: ['Stainless soil probe or trowel', 'Clean plastic bucket', 'Sample bag + lab form', 'Lime or elemental sulfur (per report)', 'Compost (≈0.2 yd³ per 4×8 bed for 2″)', 'Fertilizer + kitchen scale or scoop', 'Garden fork & rake', 'Gloves & dust mask'],
    steps: [
      { t: 'Take 10–15 cores', d: 'Walk a zig-zag over the bed and take a core at each spot, from the surface down 6–8″ for vegetables (2–3″ for lawn). Scrape mulch and debris off first.', why: 'Soil varies a lot over a few feet. Many small cores averaged together give a result that represents the whole bed.', tip: 'Use stainless steel or plastic tools. Galvanized, brass or bronze tools add zinc and copper to the sample.', v: { cam: SC.cam, at: SC.at, hi: ['probe', 'holes'], show: ['probe', 'holes'] } },
      { t: 'Mix in a clean bucket', d: 'Crumble all the cores together in a clean plastic bucket, pick out roots and stones, and spread the soil on newspaper to air-dry. Don’t oven-dry it.', why: 'A well-mixed sample is a true average. Heating soil changes the nutrient readings.', v: { cam: [2.4, 1.0, 2.0], at: [1.4, 0.2, 0.6], hi: ['bucket'], show: ['bucket'] } },
      { t: 'Bag, label and send', d: 'Fill the lab’s bag with 1–2 cups, label it (“veg bed 1”), and fill in the form with the crop you’re growing. Ask for organic matter too.', why: 'The lab tailors its lime and fertilizer recommendations to the crop you list. Vegetables, lawns and blueberries all get different answers.', v: { cam: [2.4, 1.0, 1.6], at: [1.5, 0.1, 0.4], hi: ['bag'], show: ['bag'], hide: ['probe'] } },
      { t: 'Read the report', d: 'Look at pH first (most vegetables want 6.0–7.0), then phosphorus (P) and potassium (K) levels, organic matter (aim for 3–5%), and the lab’s pounds-per-100-sq-ft recommendations.', why: 'pH controls whether the nutrients already in the soil are available. At pH 5.5, phosphorus and calcium lock up, and aluminum and manganese can reach toxic levels.', v: { cam: [-0.3, 0.8, 1.6], at: [-0.7, 0.25, 0.7], hi: ['report'], show: ['report'], hide: ['bucket', 'bag', 'holes'] } },
      { t: 'Correct the pH', d: 'Below 6.0: spread garden lime at the lab’s rate. Raising pH one unit takes roughly 3 lb per 100 sq ft in sandy soil, 5–7 lb in loam and 7–8 lb in clay. Above 7.5: use elemental sulfur, about 1–2 lb per 100 sq ft per unit.', why: 'Lime and sulfur work slowly through soil chemistry and bacteria. Too much is hard to undo, so stick to the tested rate and never more than 5 lb of sulfur per 100 sq ft at once.', tip: 'Dolomitic lime also adds magnesium. Use it if your report shows low Mg.', v: { cam: SC.cam, at: SC.at, hi: ['lime', 'limeSpread'], show: ['lime', 'limeSpread'] } },
      { t: 'Add 1–3″ of compost', d: 'Spread 2″ of finished compost over the bed. That’s about 0.6 yd³ per 100 sq ft, or about 5 cubic feet for a 4×8 bed.', why: 'Organic matter feeds soil life, holds water in sand, and opens up clay. It’s the one amendment almost every garden benefits from.', v: { cam: SC.cam, at: SC.at, hi: ['compost'], show: ['compost'], tool: { id: 'shovel', at: [0.9, 0.33, 0.3], rot: [20, 40, -25], anim: 'push' } } },
      { t: 'Fertilize at the report rate', d: 'Use the lab’s numbers. A typical vegetable bed needs about 0.1–0.2 lb of nitrogen per 100 sq ft: 1–2 lb of 10-10-10, or 2–4 lb of a 5-5-5 organic blend. Weigh it.', why: 'If phosphorus is already high, choose a fertilizer with a low middle number (like 21-0-0 or 10-0-10). Extra P runs off into streams and lakes and causes algae blooms.', tip: 'Math: lb of product = lb of N needed ÷ (first number ÷ 100). For 0.15 lb N with 10-10-10: 0.15 ÷ 0.10 = 1.5 lb.', v: { cam: SC.cam, at: SC.at, hi: ['fert', 'fertSpread'], show: ['fert', 'fertSpread'] } },
      { t: 'Work it into the top 6–8″', d: 'Turn everything in with a garden fork to 6–8″ deep, then rake level. Don’t till wet soil; it should crumble, not smear.', why: 'Lime and phosphorus barely move in soil, so they only help where roots can reach them. Working wet clay destroys its structure for a season.', v: { cam: SC.cam, at: SC.at, hi: ['worked'], show: ['worked'], hide: ['limeSpread', 'compost', 'fertSpread', 'lime', 'fert', 'report'], tool: { id: 'shovel', at: [-0.3, 0.33, 0.1], rot: [10, 30, -20], anim: 'push' } } },
      { t: 'Water, plant, retest in 3 years', d: 'Water well and plant. Lime takes 3–6 months to fully react, so retest pH in a year if it was very low, then every 3–5 years.', why: 'Retesting tells you if your changes worked and keeps you from piling on amendments you don’t need.', v: { cam: SC.cam, at: SC.at, hi: ['plants'], show: ['plants'], tool: { id: 'wateringCan', at: [0.6, 0.6, 0.4], rot: [0, 180, 25] } } },
    ],
    learn: {
      how: 'Soil pH is a measure of acidity, and it decides which nutrients plants can take up. Most vegetables do best at 6.0–7.0, where nitrogen, phosphorus, potassium and micronutrients are all available. Lime (calcium carbonate) neutralizes acidity; elemental sulfur is turned into sulfuric acid by soil bacteria to lower pH. Organic matter is the soil’s sponge and pantry: each 1% of organic matter holds roughly 20,000 gallons of water per acre and releases nutrients slowly as it breaks down. Fertilizer numbers (N-P-K) are percentages by weight, so a 50 lb bag of 10-10-10 has 5 lb each of nitrogen, phosphate and potash.',
      specs: [['Target pH (most vegetables)', '6.0–7.0'], ['Blueberries, azaleas', '4.5–5.5'], ['Sample depth', '6–8″ veg/flowers, 2–3″ lawn'], ['Cores per sample', '10–15'], ['Organic matter goal', '3–5%'], ['Lime to raise 1 pH unit', '≈3 (sand) to 8 (clay) lb/100 sq ft'], ['Sulfur to lower 1 unit', '≈1–2 lb/100 sq ft'], ['Vegetable N rate', '0.1–0.2 lb N/100 sq ft']],
      terms: [['N-P-K', 'Nitrogen, phosphate (P₂O₅) and potash (K₂O) percentages on a fertilizer label.'], ['Buffer pH', 'A lab test of how strongly a soil resists pH change; it sets the lime rate.'], ['CEC', 'Cation exchange capacity: how many nutrients the soil can hold. Clay and organic matter raise it.'], ['Side-dress', 'Fertilizer scattered beside growing plants mid-season.']],
      mistakes: ['Adding lime “because gardens need it” without a test.', 'Applying sulfur and lime in the same season.', 'Piling on phosphorus-rich fertilizers or manure year after year.', 'Using wood ash heavily; it raises pH like lime.', 'Sampling right after fertilizing.'],
      tips: ['Keep your reports in a folder and compare them over the years.', 'Send separate samples for vegetable beds, lawn and ornamental beds.', 'If compost comes from manure, it’s often high in P and salts; leaf compost is gentler.'],
    },
    pro: 'Your report shows high lead (common near old painted houses and roads; grow in raised beds with clean soil), high salts, or you suspect contamination from a previous use of the site.',
    addons: [
      { id: 'sensor', part: 'aoSensor', name: 'Smart soil sensor', cat: 'Tech', blurb: 'Logs moisture, temperature and salinity (EC) all season.', cost: [30, 80], how: 'Push it into the root zone 4–6″ deep, away from drip emitters, and pair it with the app.', needs: ['Wi-Fi soil moisture sensor'], shop: 'Smart soil moisture temperature EC sensor' },
      { id: 'bin', part: 'aoBin', name: 'Two-bay compost bin', cat: 'Garden', blurb: 'Make your own compost from leaves and kitchen scraps.', cost: [60, 250], how: 'Build or buy a two-bay slatted bin about 3×3×3 ft per bay. Fill one bay while the other finishes. Mix roughly 3 parts browns (leaves) to 1 part greens (scraps, clippings) and keep it as damp as a wrung-out sponge.', needs: ['Cedar boards or a bin kit', 'Compost thermometer'], shop: 'Wooden compost bin' },
    ],
  };

  const TRC = { cam: [1.9, 1.6, 2.1], at: [0, 0.45, 0] };
  const ASIDE = { tree: [1.3, 0.34, 0.6] };
  const treeSteps = (bnb) => [
    { t: 'Call 811 and pick the spot', d: 'Call 811 a few days ahead. Choose a spot that fits the tree’s mature size: at least 15–20 ft from the house for a shade tree and clear of overhead lines. Paint a circle 3 times as wide as the root ball.', why: 'Most tree problems start with the wrong place. A wide circle reminds you to dig a broad, shallow hole.', v: { cam: [2.6, 2.2, 2.9], at: [0, 0.5, 0], hi: ['paint'], show: ['sod', 'paint'], tool: { id: 'tape', at: [0.72, 0.52, 0.1], rot: [0, 90, 0], scale: 1.4 } } },
    { t: 'Find the root flare first', d: bnb ? 'Untie the twine at the trunk and fold back the burlap at the top. Scrape soil off the top of the ball until you find where the trunk widens into roots. Measure from the flare to the bottom of the ball.' : 'Scrape soil off the top of the pot until you find where the trunk widens into its first main roots. Nursery trees are often buried 2–4″ too deep in their pots. Measure from the flare to the bottom of the root ball.', why: 'This measurement, not the pot height, is how deep you dig. A buried flare stays wet, rots the bark and grows girdling roots that strangle the tree years later.', v: { cam: [2.2, 1.1, 1.7], at: [1.3, 0.75, 0.6], hi: ['flare'], show: bnb ? ['bnbBall', 'burlapTop', 'burlapLow', 'basketTop', 'basketLow', 'twine'] : ['ball', 'circling', 'pot'], mv: ASIDE, tool: { id: 'tape', at: [1.55, 0.5, 0.6], rot: [0, 0, 0], scale: 1.4 } } },
    { t: 'Dig a wide, shallow saucer', d: 'Strip the sod and dig 2–3 times as wide as the root ball, but only as deep as the flare-to-bottom measurement. Slope the sides like a bowl and leave the bottom undisturbed.', why: 'New roots spread sideways in the top 12″ of soil, so width matters. Loose soil under the ball settles and sinks the tree too deep.', v: { cam: TRC.cam, at: TRC.at, hi: ['hole'], show: ['spoil'], hide: ['sod', 'paint'], tool: { id: 'shovel', at: [0.5, 0.3, 0.2], rot: [15, 30, -20], anim: 'push' } } },
  ].concat(bnb ? [
    { t: 'Set the ball, then cut the wire basket', d: 'Lower the tree by the ball, never by the trunk, onto the firm bottom. With bolt cutters, cut away at least the top two-thirds of the wire basket (all of it if you can reach).', why: 'Wire doesn’t rust away fast in most soils. Roots grow through it and get girdled as they thicken.', v: { cam: [1.3, 1.1, 1.5], at: [0, 0.4, 0], hi: ['basketTop'], mv: { tree: [0, 0, 0] }, tool: { id: 'boltCutters', at: [0.3, 0.42, 0.1], rot: [0, 0, 60] } } },
    { t: 'Remove twine and burlap', d: 'Cut all twine around the trunk and remove the burlap from the top and sides. Synthetic (shiny, plastic-like) burlap must come off completely.', why: 'Twine left on the trunk girdles it within a few years. Burlap above ground wicks moisture out of the ball like a candle wick.', v: { cam: [1.3, 1.1, 1.5], at: [0, 0.4, 0], hi: ['burlapTop', 'twine'], hide: ['basketTop'], tool: { id: 'utilityKnife', at: [0.25, 0.48, 0.1], rot: [0, 0, 70] } } },
    { t: 'Check the height', d: 'Lay a shovel handle across the hole. The root flare should sit at grade or 1–2″ above it. Rock the ball and lift to adjust; don’t pull on the trunk.', why: 'Trees settle a little. Slightly high is fine; even 2″ too low can kill a tree slowly.', v: { cam: [1.6, 0.9, 1.4], at: [0, 0.5, 0], hi: ['flare'], hide: ['burlapTop', 'twine'], tool: { id: 'level', at: [-0.7, 0.52, 0.12], rot: [0, 0, 0], scale: 2.2 } } },
  ] : [
    { t: 'Slide it out and fix circling roots', d: 'Lay the pot on its side and slide the tree out. Tease apart roots that circle the outside. If they’re thick and matted, shave off the outer 1″ of the ball with a pruning saw or make 4 vertical cuts 1″ deep.', why: 'Roots keep circling after planting, then thicken into girdling roots that choke the trunk. Cutting them makes new roots grow outward.', v: { cam: [2.2, 1.1, 1.7], at: [1.3, 0.75, 0.6], hi: ['circling'], hide: ['pot'], tool: { id: 'handsaw', at: [1.52, 0.75, 0.62], rot: [0, 0, 90], anim: 'slide' } } },
    { t: 'Set it and check the height', d: 'Lift the tree by the root ball onto the firm bottom. Lay a shovel handle across the hole: the flare should sit at grade or 1–2″ above.', why: 'Planting slightly high allows for settling. A low tree stays soggy at the trunk and is the No. 1 planting mistake.', v: { cam: [1.6, 0.9, 1.4], at: [0, 0.5, 0], hi: ['flare', 'rootsCut'], show: ['rootsCut'], hide: ['circling'], mv: { tree: [0, 0, 0] }, tool: { id: 'level', at: [-0.7, 0.52, 0.12], rot: [0, 0, 0], scale: 2.2 } } },
  ]).concat([
    { t: 'Backfill with the native soil', d: 'Turn the tree so its best side faces your view, then backfill halfway with the soil you dug out. Break up clods, water to settle it, and finish filling. Firm by hand; don’t stomp.', why: 'Rich amended backfill makes roots stay in the hole like a pot. Water removes air pockets without compacting the soil.', tip: 'Don’t add fertilizer at planting. The tree needs roots first, and fertilizer salts can burn them.', v: { cam: TRC.cam, at: TRC.at, hi: ['backfillHalf', 'backfill'], show: ['backfillHalf', 'backfill'], hide: ['spoil'], tool: { id: 'shovel', at: [0.6, 0.55, 0.3], rot: [20, 40, -25], anim: 'push' } } },
    { t: 'Build a ring and soak it', d: 'Rake a 3–4″ berm of soil in a ring at the edge of the root ball and fill it with water 2–3 times, 10–15 gallons in all.', why: 'The ring holds water over the root ball, which dries out much faster than the surrounding soil for the first year.', v: { cam: TRC.cam, at: TRC.at, hi: ['berm', 'water'], show: ['berm', 'water'], tool: { id: 'wateringCan', at: [0.45, 0.85, 0.3], rot: [0, 200, 25] } } },
    { t: 'Mulch a wide donut', d: 'Spread 2–4″ of wood-chip or shredded-bark mulch in a 6 ft circle, pulled 3″ back from the trunk. Never pile it against the bark.', why: 'Mulch holds moisture, keeps mowers and string trimmers off the trunk, and stops grass competing with new roots. A mulch “volcano” rots bark and invites rodents.', v: { cam: TRC.cam, at: TRC.at, hi: ['mulch'], show: ['mulch'], hide: ['water'] } },
    { t: 'Stake only if it won’t stand', d: 'Most trees don’t need staking. In windy spots or with top-heavy trees, drive two stakes outside the root ball and use wide, flexible straps low on the trunk, loose enough to let it sway 1–2″.', why: 'A trunk that flexes in the wind grows thicker and stronger. Tight, long-term staking makes weak trunks and can girdle the bark.', tip: 'Remove stakes after one growing season.', v: { cam: [2.6, 1.8, 3.0], at: [0, 1.2, 0], hi: ['stakes'], show: ['stakes'] } },
    { t: 'Water through the first 2 years', d: 'Water at the root ball every 2–3 days for the first 2 weeks, then weekly through the first year: about 1.5 gallons per inch of trunk diameter each time, more in heat. Check the ball with your finger first.', why: 'A new tree has lost most of its roots. Until they grow out (about a year per inch of trunk caliper), it depends on you for water.', v: { cam: [3.0, 2.4, 3.4], at: [0, 1.1, 0], hi: ['tree', 'mulch'] } },
  ]);
  const tree = {
    id: 'plant-tree',
    title: 'Plant a tree the right way',
    model: 'growTree',
    level: 2,
    time: '1–2 hrs',
    cost: '$60–400 (tree + mulch)',
    summary: 'Dig a hole 2–3 times wider than the root ball but no deeper than the root flare, fix circling roots, backfill with native soil, water deeply and mulch a wide donut that stays off the trunk.',
    intro: { show: ['ball', 'rootsCut', 'backfillHalf', 'backfill', 'mulch'], preview: true, spin: true },
    safety: ['Call 811 at least 3 business days before digging. Utility lines are often only 12–24″ deep.', 'A 15-gal tree weighs 100–150 lb and a 24″ B&B ball 300–400 lb. Use a hand truck or two people, and lift with your legs.', 'Keep shade trees at least 20 ft from overhead power lines; let the utility prune near lines.'],
    causes: [
      ['When to plant', 'Early fall is best (roots grow until soil hits about 40°F); early spring is second best. Summer planting needs heavy watering.'],
      ['Right tree, right place', 'Check mature height and width, sun needs, hardiness zone and soil drainage. Plant big trees 15–20 ft from foundations.'],
      ['Test drainage', 'Fill the hole with water. If it hasn’t drained in 12–24 hours, plant 2–3″ high or pick a wet-tolerant species.'],
    ],
    tools: ['Round-point shovel', 'Tape measure', 'Marking paint', 'Tarp', 'Pruning saw or knife', 'Garden hose or 5-gal buckets', 'Wood-chip mulch (3–4 bags or ⅓ yd)', 'Stakes + wide straps (only if needed)', 'Gloves'],
    steps: treeSteps(false),
    learn: {
      how: 'Over 90% of a tree’s absorbing roots grow in the top 12″ of soil, spreading 2–3 times wider than the canopy. That’s why the planting hole should be wide and shallow. The root flare is where trunk tissue changes to root tissue; trunk bark can’t stay wet without rotting, so the flare must sit at the surface. A newly planted tree has lost 70–95% of its roots in the nursery, so water and patience matter more than fertilizer for the first two years.',
      specs: [['Hole width', '2–3× root ball'], ['Hole depth', 'Flare at or 1–2″ above grade'], ['Mulch', '2–4″ deep, 3″ off the trunk, 3–6 ft circle'], ['First watering', '10–15 gal'], ['Ongoing water', '≈1.5 gal per inch of caliper per watering'], ['Stake time', '1 growing season, max'], ['Establishment', '≈1 year per inch of trunk caliper']],
      terms: [['Root flare', 'The widening at the base of the trunk where roots begin.'], ['Caliper', 'Trunk diameter measured 6″ above the ground.'], ['B&B', 'Balled-and-burlapped: field-dug tree with its root ball wrapped in burlap and a wire basket.'], ['Girdling root', 'A root that wraps around the trunk and chokes it as both grow.'], ['Mulch volcano', 'Mulch piled up against the trunk; a common, harmful habit.']],
      mistakes: ['Digging a deep, narrow hole and filling the bottom with loose soil.', 'Burying the flare.', 'Amending the backfill heavily or adding fertilizer at planting.', 'Leaving twine, wire or nursery tags on the trunk.', 'Staking tightly and forgetting to remove it.'],
      tips: ['Prune only broken or dead branches at planting; the tree needs every leaf to grow roots.', 'Write the planting date and species on a plant tag kept in a drawer, not on the tree.', 'Keep a 3 ft mulch ring for life; grass competes hard for water.'],
    },
    pro: 'The tree is over 3″ caliper or the ball weighs more than you can move safely, the site is near utilities or a foundation, or you’re planting on a steep slope.',
    variants: [
      { id: 'container', name: 'Container-grown', blurb: 'Tree grown in a nursery pot: check for buried flare and circling roots.' },
      {
        id: 'bnb',
        name: 'Balled & burlapped',
        blurb: 'Field-dug tree in burlap and a wire basket: heavy, and the wrap has to come off.',
        cost: '$100–500 (tree + mulch)',
        intro: { show: ['bnbBall', 'burlapLow', 'basketLow', 'backfillHalf', 'backfill', 'mulch'], preview: true, spin: true },
        summary: 'Set the ball on firm soil with the flare at grade, then cut away the top two-thirds of the wire basket and all the twine and top burlap before backfilling with native soil, watering and mulching.',
        tools: ['Round-point shovel', 'Tape measure', 'Marking paint', 'Tarp', 'Bolt cutters', 'Utility knife', 'Hand truck or helper', 'Garden hose', 'Wood-chip mulch', 'Stakes + wide straps (only if needed)', 'Gloves'],
        steps: treeSteps(true),
      },
    ],
    addons: [
      { id: 'bag', part: 'aoBag', name: 'Slow-release watering bag', cat: 'Garden', blurb: 'Empties 15–20 gal over 6–8 hours, right where the roots are.', cost: [15, 35], how: 'Zip it around the trunk on top of the mulch, fill it once or twice a week in the first summer, and remove it in winter.', needs: ['Tree watering bag'], shop: 'Tree watering bag' },
      { id: 'guard', part: 'aoGuard', name: 'Spiral trunk guard', cat: 'Safety', blurb: 'Stops rabbits, voles and string trimmers from chewing young bark.', cost: [5, 15], how: 'Wrap it from the ground up to 18–24″ in fall and take it off in spring so bark doesn’t stay damp.', needs: ['Spiral tree guard'], shop: 'Spiral tree trunk guard' },
      { id: 'uplight', part: 'aoUplight', name: 'Low-voltage uplight', cat: 'Lighting', blurb: 'Lights the canopy from below at night.', cost: [40, 150], how: 'Stake a 3–7 W LED spot 2–3 ft from the trunk, aimed up through the branches, and run cable to a 12 V transformer. Keep it outside the root ball.', needs: ['LED landscape spotlight', '12 V transformer', '12/2 landscape cable'], shop: 'Low voltage LED landscape spotlight' },
    ],
  };

  const PC = { cam: [1.9, 1.25, 2.1], at: [0, 0.7, 0] };
  const prune = {
    id: 'prune-shrubs',
    title: 'Prune shrubs and roses',
    model: 'growShrub',
    level: 2,
    time: '30–60 min per shrub',
    cost: '$0–60',
    summary: 'Take out the 3 Ds first (dead, damaged, diseased), then crossing canes and suckers. Renew an overgrown shrub by cutting a third of the oldest canes to the ground each year, and use heading cuts just above outward-facing buds.',
    intro: { show: ['stubs', 'buds', 'foliage', 'newShoots'], hide: ['dead', 'crossing', 'suckers', 'oldCanes', 'tips'], preview: true, spin: true },
    safety: ['Wear gloves and eye protection; springy canes whip back at face height.', 'Keep loppers and saws pointed away from your other hand and legs.', 'Wipe blades with 70% rubbing alcohol between plants when cutting out disease, so you don’t spread it.', 'Look for wasp nests in dense shrubs before reaching in.'],
    causes: [
      ['Know when it blooms', 'Spring bloomers (forsythia, lilac, azalea, weigela) set buds the summer before; prune right after flowering. Summer bloomers (spirea, panicle hydrangea, butterfly bush, roses) flower on new wood; prune in late winter.'],
      ['Thinning vs heading', 'A thinning cut removes a whole stem back to the ground or a larger branch and opens the shrub. A heading cut shortens a stem to a bud and makes it bushier at the cut.'],
      ['Don’t shear flowering shrubs', 'Shearing into balls removes flower buds and makes a dense outer shell with a dead, leafless center.'],
    ],
    tools: ['Bypass hand pruners (to ¾″)', 'Bypass loppers (½–1½″)', 'Folding pruning saw (over 1½″)', 'Gloves & safety glasses', '70% rubbing alcohol + rag', 'Tarp for clippings'],
    steps: [
      { t: 'Sharpen and clean your tools', d: 'Use bypass pruners up to ¾″, loppers up to 1½″ and a pruning saw for anything thicker. Sharpen the blades and wipe them with alcohol.', why: 'Sharp bypass blades make clean cuts that seal quickly. Anvil pruners and dull blades crush stems, which invites rot.', v: { cam: [2.2, 1.3, 2.0], at: [0.7, 0.65, 0.5], hi: ['pruners', 'loppers'], show: ['pruners', 'loppers', 'dead', 'crossing', 'suckers', 'oldCanes', 'tips'] } },
      { t: 'Remove the dead and broken (the 3 Ds)', d: 'Cut dead, damaged and diseased canes back to healthy wood or to the ground. Dead wood is brittle, has no buds, and is brown, not green, under a fingernail scratch.', why: 'Dead wood is an entry point for decay and does nothing for the plant. These cuts never count toward your one-third limit.', v: { cam: PC.cam, at: PC.at, hi: ['dead'], hide: ['loppers'], tool: { id: 'handsaw', at: [-0.08, 0.1, 0.06], rot: [0, 30, 80], anim: 'slide' } } },
      { t: 'Take out crossing canes', d: 'Where two canes rub, remove the weaker or worse-placed one, usually the one growing into the center.', why: 'Rubbing wears through bark and opens wounds. Clearing the center lets light and air in, which cuts down on leaf disease.', v: { cam: PC.cam, at: PC.at, hi: ['crossing'], hide: ['dead'], mv: { pruners: [-0.8, -0.5, -0.65] } } },
      { t: 'Remove suckers and water sprouts', d: 'Cut straight, whippy shoots coming from the roots outside the clump or shooting straight up from old branches, flush with where they start.', why: 'They steal energy, crowd the shrub and rarely flower well. On grafted shrubs, root suckers are a different plant entirely.', v: { cam: [1.5, 0.8, 1.6], at: [0, 0.3, 0], hi: ['suckers'], hide: ['crossing'], mv: { pruners: [-0.55, -0.5, -0.45] } } },
      { t: 'Renew: cut ⅓ of the oldest canes', d: 'Find the thickest, greyest, least-flowering canes and cut about a third of them to 2–3″ above the ground. Repeat next year and the year after.', why: 'Most multi-stem shrubs bloom best on young wood. Removing the oldest third each year renews the whole shrub in three years without ever leaving it bare.', tip: 'Never remove more than a third of a shrub’s live wood in one year.', v: { cam: PC.cam, at: [0, 0.5, 0], hi: ['oldCanes'], hide: ['suckers'], tool: { id: 'handsaw', at: [0.0, 0.1, 0.12], rot: [0, 0, 80], anim: 'slide' } } },
      { t: 'Head back leggy tips', d: 'Shorten a few too-long canes with heading cuts ¼″ above a bud that faces outward, sloping 45° away from the bud.', why: 'The top bud becomes the new leader. An outward bud sends growth out, not into the crowded middle. Too close kills the bud; too far leaves a stub that dies back.', v: { cam: [1.5, 1.35, 1.5], at: [0.3, 1.1, 0.2], hi: ['tips'], hide: ['oldCanes'], show: ['stubs'], mv: { pruners: [-0.25, 0.25, -0.15] } } },
      { t: 'Step back and check the shape', d: 'Walk around the shrub. It should look open and natural, a little shorter, with no stubs. Clean up all clippings, especially diseased ones.', why: 'Seeing the whole plant keeps you from over-pruning one side. Diseased clippings left on the ground reinfect the shrub.', v: { cam: PC.cam, at: PC.at, hi: ['canes', 'buds'], show: ['buds'], hide: ['tips', 'pruners'] } },
      { t: 'Mulch, water, and watch it regrow', d: 'Top up 2–3″ of mulch and water if the spring is dry. Skip fertilizer unless a soil test says otherwise, and never feed after midsummer.', why: 'Pruning wakes up buds; good moisture fuels the new canes. Late feeding pushes soft growth that freezes in winter.', v: { cam: PC.cam, at: PC.at, hi: ['newShoots', 'foliage'], show: ['newShoots', 'foliage'] } },
    ],
    learn: {
      how: 'A shrub’s tip buds make a hormone (auxin) that suppresses the buds below. A heading cut removes the tip, so several lower buds break and the stem branches. A thinning cut removes a whole stem without stimulating much regrowth, so it opens the plant while keeping its natural shape. Multi-stem shrubs renew themselves by sending new canes from the base; removing the oldest canes speeds that up. Cuts close best when made just outside the branch collar, the slightly swollen ring where a branch joins a larger one.',
      specs: [['Max live wood removed', '⅓ per year'], ['Heading cut', '¼″ above an outward bud, 45° slope'], ['Renewal cuts', '2–3″ above ground'], ['Spring bloomers', 'Prune within 3–4 weeks after flowering'], ['Summer bloomers & roses', 'Late winter, before buds break'], ['Pruners / loppers / saw', '≤ ¾″ / ½–1½″ / > 1½″']],
      terms: [['3 Ds', 'Dead, damaged, diseased: always remove first.'], ['Thinning cut', 'Removes a stem at its origin.'], ['Heading cut', 'Shortens a stem to a bud or side branch.'], ['Renewal pruning', 'Removing the oldest third of canes each year.'], ['Water sprout', 'A fast vertical shoot from older wood.'], ['Branch collar', 'The swollen ring at a branch base; cut just outside it.']],
      mistakes: ['Shearing flowering shrubs into balls.', 'Pruning lilacs or forsythia in fall or winter (no flowers next spring).', 'Leaving long stubs.', 'Cutting flush into the parent stem through the branch collar.', 'Taking more than a third in one year.'],
      tips: ['Paint or wound dressing isn’t needed; clean cuts seal themselves.', 'For a badly overgrown lilac or forsythia, renew over 3 years instead of cutting it all down.', 'Prune in dry weather so cuts heal before rain splashes spores.'],
    },
    pro: 'The shrub has grown into a small tree with trunks over 3″ or is near power lines, or you need a large hedge reshaped.',
    variants: [
      { id: 'shrubs', name: 'Flowering shrubs', blurb: 'Forsythia, lilac, spirea, weigela and other multi-stem shrubs.' },
      {
        id: 'roses',
        name: 'Hybrid tea & shrub roses',
        blurb: 'Late-winter rose pruning down to 3–5 strong canes.',
        model: 'growRose',
        time: '20–30 min per rose',
        intro: { show: ['roseBuds', 'roseMulch', 'roseLeaves'], hide: ['roseTops', 'roseDead', 'roseWeak', 'roseCross', 'roseOld'], preview: true, spin: true },
        summary: 'Prune roses in late winter as the buds swell (when forsythia blooms). Remove dead, weak and crossing canes, keep 3–5 strong ones, and cut them to 12–24″ just above outward-facing buds.',
        tools: ['Bypass pruners', 'Loppers', 'Pruning saw', 'Gauntlet rose gloves', 'Rubbing alcohol', 'Mulch'],
        safety: ['Wear gauntlet-style rose gloves and long sleeves; rose thorns can carry fungal infections.', 'Wear eye protection when reaching into the bush.', 'Disinfect blades between bushes if you see black spot or cankers.'],
        steps: [
          { t: 'Wait for the right moment', d: 'Prune when buds begin to swell and turn red, usually when forsythia blooms. Gear up with gauntlet gloves and sharp bypass pruners.', why: 'Pruning too early invites freeze damage to the new cuts; too late wastes the plant’s early growth.', v: { cam: [1.1, 0.8, 1.2], at: [0, 0.45, 0], hi: ['pruners'], show: ['pruners', 'roseTops', 'roseDead', 'roseWeak', 'roseCross', 'roseOld'], tool: { id: 'gloves', at: [0.5, 0.05, 0.35], rot: [0, 30, 0] } } },
          { t: 'Remove dead canes', d: 'Cut black or shriveled canes back to the bud union. On partly dead canes, cut 1″ below the damage, into wood with white or green pith.', why: 'Brown pith means the cane is dead or dying back. Healthy white pith tells you you’ve reached live wood.', v: { cam: [1.1, 0.8, 1.2], at: [0, 0.4, 0], hi: ['roseDead'], mv: { pruners: [-0.05, -0.32, -0.1] } } },
          { t: 'Remove weak and crossing canes', d: 'Take out canes thinner than a pencil and any cane growing into the center or rubbing another.', why: 'Thin canes rarely bloom well. An open, vase-shaped center dries quickly after rain, which is your best defense against black spot.', v: { cam: [1.1, 0.8, 1.2], at: [0, 0.4, 0], hi: ['roseWeak', 'roseCross'], hide: ['roseDead'] } },
          { t: 'Saw out the oldest cane', d: 'If a cane is grey, gnarled and barky, saw it off flush at the bud union.', why: 'Old canes produce fewer, smaller flowers. Removing one each year makes the plant push vigorous new canes from the base.', v: { cam: [1.0, 0.6, 1.1], at: [0, 0.2, 0], hi: ['roseOld'], hide: ['roseWeak', 'roseCross'], tool: { id: 'handsaw', at: [0.02, 0.1, -0.04], rot: [0, 0, 80], anim: 'slide' } } },
          { t: 'Cut keepers to 12–24″', d: 'Shorten the 3–5 remaining canes to 12–24″ (hybrid teas) or by one-third (shrub roses). Cut ¼″ above an outward-facing bud, sloping 45° away from it.', why: 'The bud below the cut becomes the new shoot. Facing outward keeps the center open. The slope sheds water off the bud.', v: { cam: [1.1, 0.9, 1.2], at: [0, 0.5, 0], hi: ['roseTops'], hide: ['roseOld'], mv: { pruners: [0, 0, 0] } } },
          { t: 'Check the cuts', d: 'Every cut should show white pith and sit just above a bud. Seal large cuts with white wood glue only if cane borers are a problem in your area.', why: 'Clean cuts above buds don’t die back. Borers tunnel into open pith, and a dab of glue stops them.', v: { cam: [0.8, 0.7, 0.9], at: [0, 0.4, 0], hi: ['roseBuds'], show: ['roseBuds'], hide: ['roseTops', 'pruners'] } },
          { t: 'Clean up and mulch', d: 'Rake up every old leaf and clipping, then spread 2–3″ of fresh mulch. Feed with a rose fertilizer once new shoots are a few inches long.', why: 'Black spot overwinters on fallen leaves. Fresh mulch blocks spores from splashing back onto new growth.', v: { cam: [1.1, 0.8, 1.2], at: [0, 0.3, 0], hi: ['roseMulch'], show: ['roseMulch'] } },
          { t: 'Enjoy the flush', d: 'New canes grow from the buds you chose, and the first blooms open 6–8 weeks later. Deadhead to an outward 5-leaflet leaf to keep them coming.', why: 'Cutting spent blooms back to a full 5-leaflet leaf gives a strong bud that flowers again in about 6 weeks.', v: { cam: [1.2, 0.9, 1.3], at: [0, 0.5, 0], hi: ['roseLeaves'], show: ['roseLeaves'] } },
        ],
      },
    ],
  };

  const HC = { cam: [1.0, 0.95, 1.1], at: [0, 0.2, 0] };
  const herbs = {
    id: 'herb-containers',
    title: 'Grow an herb garden in containers',
    model: 'growHerbs',
    level: 1,
    time: '1 hr',
    cost: '$60–150',
    summary: 'Use pots at least 8–12″ wide with drainage holes, fill them with potting mix (gritty for Mediterranean herbs, richer for basil and parsley), group herbs by water needs, and give mint its own pot. Water when the top inch is dry and harvest often.',
    intro: { show: ['pots', 'saucers', 'mix', 'medHerbs', 'basil', 'parsley', 'mint', 'chives'], preview: true, spin: true },
    safety: ['Wear a dust mask when mixing dry perlite or peat; the dust irritates lungs.', 'A 14″ pot of wet soil weighs 40–60 lb; set big pots in place before filling them, or use a caddy.', 'Some herbs (pennyroyal, comfrey, rue) are toxic to pets or people; check before planting near curious animals.'],
    causes: [
      ['Sun', 'Most culinary herbs need 6–8 hours of direct sun. Mint, parsley, chives and cilantro tolerate 4–5.'],
      ['Group by thirst', 'Rosemary, thyme, oregano and sage like it lean and dry. Basil, parsley, chives and mint like rich, evenly moist soil.'],
      ['Pot size and material', 'Bigger pots dry out slower. Terra-cotta breathes (good for Mediterranean herbs, but dries fast); glazed or plastic pots hold water longer.'],
    ],
    tools: ['Pots with drainage holes (8–14″) + saucers', 'Mesh or coffee filter for holes', 'Quality potting mix', 'Perlite (for rosemary, thyme, oregano)', 'Herb starts', 'Trowel', 'Watering can', 'Slow-release or liquid fertilizer', 'Scissors'],
    steps: [
      { t: 'Choose pots and the sunniest spot', d: 'Put pots where they get 6–8 hours of sun. Use 12–14″ pots for rosemary and mixed plantings, 10–12″ for basil or mint, 6–8″ for chives. Every pot needs a drainage hole.', why: 'Herbs grown in shade get leggy and lose the oils that give them flavor. Pots without holes drown roots in a week of rain.', v: { cam: HC.cam, at: HC.at, hi: ['pots', 'saucers'], show: ['pots', 'saucers'] } },
      { t: 'Cover the holes, skip the gravel', d: 'Lay a square of mesh or a coffee filter over each hole. Don’t add a layer of gravel or shards.', why: 'Gravel doesn’t improve drainage. It raises the soggy zone higher in the pot (a “perched water table”), right where roots grow.', v: { cam: [0.4, 1.05, 0.5], at: [-0.1, 0.1, 0.0], hi: ['screens'], show: ['screens'] } },
      { t: 'Mix the right soil', d: 'Fill with a quality potting mix, never garden soil. For rosemary, thyme and oregano, blend in one-third perlite. Leave 1″ below the rim.', why: 'Garden soil packs into a brick in a pot. Mediterranean herbs rot in wet mix, while basil wants it rich and moist.', v: { cam: HC.cam, at: HC.at, hi: ['mix', 'bags'], show: ['mix', 'bags'], tool: { id: 'trowel', at: [-0.3, 0.32, -0.12], rot: [30, 0, -30] } } },
      { t: 'Group herbs by water needs', d: 'Plan pots so dry-lovers share one pot (rosemary, thyme, oregano) and moisture-lovers share another (basil, parsley).', why: 'One watering routine per pot means nobody is drowned or parched.', v: { cam: [0.8, 0.7, 1.4], at: [0, 0.15, 0.5], hi: ['starts'], show: ['starts'], hide: ['bags'] } },
      { t: 'Plant at the same depth', d: 'Water the starts first. Tip each one out, loosen circling roots, and plant at the depth it was growing, 4–6″ apart. Firm the mix gently.', why: 'Burying herb crowns invites rot. Loosened roots grow out into the new mix instead of circling.', v: { cam: HC.cam, at: HC.at, hi: ['medHerbs', 'basil', 'parsley', 'chives'], show: ['medHerbs', 'basil', 'basilTips', 'parsley', 'chives'], hide: ['starts'], tool: { id: 'trowel', at: [0.3, 0.3, -0.25], rot: [30, 0, -30], anim: 'push' } } },
      { t: 'Give mint its own pot', d: 'Plant mint (and lemon balm or oregano if you like) alone in its own container. Don’t sink the pot into a garden bed.', why: 'Mint spreads by runners that take over any pot it shares, and escapes from buried pots over the rim.', v: { cam: [0.9, 0.75, 1.0], at: [0.3, 0.2, 0.2], hi: ['mint'], show: ['mint'] } },
      { t: 'Water until it drains, then wait', d: 'Water slowly until it runs from the hole. After that, water when the top 1″ is dry to your finger: daily in hot summer for small pots, every few days for rosemary.', why: 'Deep, complete watering wets the whole root ball. Little sips leave the bottom dry and build up salts.', v: { cam: HC.cam, at: HC.at, hi: ['water'], show: ['water'], fx: 'water', tool: { id: 'wateringCan', at: [0.35, 0.5, -0.1], rot: [0, 160, 25] } } },
      { t: 'Feed lightly', d: 'Mix in a slow-release fertilizer at planting, or use half-strength liquid fertilizer every 2–4 weeks for basil and parsley. Skip it for rosemary and thyme.', why: 'Pots leach nutrients with every watering, but too much nitrogen makes big, bland leaves with less aroma.', v: { cam: [0.8, 0.8, 0.8], at: [0.2, 0.3, -0.2], hi: ['basil', 'parsley'], hide: ['water'] } },
      { t: 'Harvest by pinching', d: 'Once basil is 6–8″ tall, pinch the top just above a pair of leaves, and pinch off flower buds. Cut no more than a third of any herb at once.', why: 'Each pinch makes two new branches, so the plant gets bushier. Flowering makes basil bitter and stop growing.', tip: 'Harvest in the morning after dew dries, when oils are strongest.', v: { cam: [0.65, 0.65, 0.5], at: [0.17, 0.4, -0.22], hi: ['basil'], hide: ['basilTips'] } },
    ],
    learn: {
      how: 'Container herbs live in a small, fast-draining world. Potting mix is mostly peat or coir with perlite and bark for air spaces; it holds water like a sponge but still drains. Mediterranean herbs evolved on rocky, lean hillsides, so they need sharp drainage and little feeding, while leafy annual herbs like basil grow fast and want steady water and nutrients. Frequent harvest keeps them in leafy growth instead of flowering.',
      specs: [['Sun', '6–8 hr (most herbs)'], ['Pot size', '8″ minimum; 12–14″ for mixed pots'], ['Mediterranean mix', '⅔ potting mix + ⅓ perlite'], ['Water', 'When top 1″ is dry, until it drains'], ['Feed', '½ strength every 2–4 weeks (leafy herbs)'], ['Harvest', '≤ ⅓ of the plant at a time'], ['Basil', 'Outside only above 50°F nights']],
      terms: [['Perched water table', 'A saturated layer that stays at the bottom of a pot; gravel layers raise it.'], ['Pinching', 'Removing a stem tip to make the plant branch.'], ['Bolting', 'Sudden flowering in heat; leaves turn bitter.'], ['Woody herb', 'A perennial with a woody base, like rosemary, thyme and sage.']],
      mistakes: ['Using garden soil in pots.', 'Planting rosemary and basil in the same pot.', 'Letting basil flower.', 'Pots without drainage holes or sitting in full saucers.', 'Putting basil out before nights stay above 50°F.'],
      tips: ['Raise pots on pot feet so holes drain freely.', 'Move rosemary and bay into a cool, bright window for winter in zones below 7.', 'Snip chives to 2″ and they regrow within weeks.'],
    },
    pro: 'Not usually needed. A local nursery can help pick varieties for your climate, and your extension office can identify pests.',
    addons: [
      { id: 'self', part: 'aoSelf', name: 'Self-watering planter', cat: 'Garden', blurb: 'A reservoir under the soil wicks water up for days.', cost: [30, 90], how: 'Fill the reservoir through the tube, and fill the pot with potting mix (not garden soil) so the wick works. Best for basil and parsley, not rosemary.', needs: ['Self-watering planter', 'Potting mix'], shop: 'Self watering planter box' },
      { id: 'sensor', part: 'aoSensor', name: 'Moisture & light sensor', cat: 'Tech', blurb: 'Alerts your phone when a pot is dry or too shady.', cost: [20, 50], how: 'Push the probe 2–3″ into the basil pot and pair it by Bluetooth or Wi-Fi.', needs: ['Plant moisture light sensor'], shop: 'Bluetooth plant sensor moisture light' },
      { id: 'drip', part: 'aoDrip', name: 'Micro-drip for pots', cat: 'Garden', blurb: 'One timer waters every pot while you travel.', cost: [35, 80], how: 'Run ½″ tubing along the pots, punch in ¼″ lines to a stake in each pot, and put a battery timer at the spigot. Start with 5 min daily in summer and adjust.', needs: ['Container drip kit', 'Hose timer'], shop: 'Container drip irrigation kit' },
    ],
  };

  const POC = { cam: [2.9, 2.0, 3.3], at: [0, 0.25, 0] };
  const pollinator = {
    id: 'pollinator-bed',
    title: 'Plant a pollinator perennial bed',
    model: 'growPollinator',
    level: 2,
    time: '1–2 days',
    cost: '$150–500',
    summary: 'Clear turf from a sunny spot, add a little compost, and plant native perennials in drifts of 3–7, tall at the back and short in front, spaced 18–24″ apart so something blooms from spring to frost. Mulch lightly, water 1″ a week the first year, and leave stems up in winter.',
    intro: { show: ['bare', 'compost', 'edge', 'plants', 'mulch'], preview: true, spin: true },
    safety: ['Call 811 before digging out a new bed.', 'Wear gloves; some plants (milkweed sap, euphorbia) irritate skin.', 'Skip insecticides, including systemic ones in some nursery plants. Ask for neonicotinoid-free plants.'],
    causes: [
      ['Sun and size', 'At least 6 hours of sun. Start with 50–100 sq ft; a bed you can keep weeded beats a big one that gets away from you.'],
      ['Bloom from spring to fall', 'Pick at least 3 species blooming in each season: e.g. golden alexanders and columbine (spring), bee balm, coneflower and black-eyed Susan (summer), asters and goldenrod (fall).'],
      ['Go native', 'Native perennials support many more native bees and butterfly caterpillars than exotic ones. Your extension office or native plant society has regional lists.'],
    ],
    tools: ['Garden hose or rope (layout)', 'Flat spade or sod cutter (or cardboard to smother)', 'Garden fork', 'Compost (1–2″)', 'Steel edging (optional)', 'Plant flags', 'Perennials in quart/gallon pots', 'Trowel', 'Shredded leaf or hardwood mulch', 'Soaker hose or sprinkler'],
    steps: [
      { t: 'Lay out the shape', d: 'Lay a garden hose in smooth curves in a spot with 6+ hours of sun, and view it from the house. Keep it 4–6 ft deep so you can reach in from the edge or a stepping stone.', why: 'Simple, broad curves are easy to mow around and look intentional. Testing the outline from inside the house shows you how it’ll look most of the time.', v: { cam: POC.cam, at: POC.at, hi: ['outline'], show: ['outline'] } },
      { t: 'Remove or smother the turf', d: 'Slice off the sod 1–2″ deep with a flat spade or rented sod cutter. Or, in fall, cover the area with overlapping cardboard and 4–6″ of leaves or mulch for 8+ weeks.', why: 'Turf grass comes right back through a new bed. Smothering takes longer but keeps the topsoil and adds organic matter.', v: { cam: POC.cam, at: POC.at, hi: ['bare'], show: ['bare'], tool: { id: 'shovel', at: [1.0, 0.03, 0.4], rot: [15, 40, -20], anim: 'push' } } },
      { t: 'Loosen and add a little compost', d: 'Fork the soil 6–8″ deep and mix in 1–2″ of compost. That’s all: most native perennials don’t want rich soil.', why: 'Loose soil lets new roots spread fast. Too much fertility makes natives floppy and short-lived.', v: { cam: POC.cam, at: POC.at, hi: ['compost'], show: ['compost'], hide: ['outline'], tool: { id: 'shovel', at: [-0.6, 0.03, 0.1], rot: [10, 20, -15], anim: 'push' } } },
      { t: 'Cut a clean edge', d: 'Cut a 4″ deep V-shaped trench along the edge with a spade, or install steel edging with the top ½″ above the soil.', why: 'An edge stops lawn grass from creeping in, and a crisp line makes a natural-looking bed read as cared-for.', v: { cam: [2.4, 1.2, 2.6], at: [0.8, 0.05, 0.6], hi: ['edge'], show: ['edge'] } },
      { t: 'Flag the layout in drifts', d: 'Mark spots with colored flags: tall plants at the back, medium in the middle, short at the front. Group 3–7 of each kind, spacing them at their mature width, usually 18–24″.', why: 'Pollinators find big patches of one flower more easily, and drifts look better than a polka dot of singles. Correct spacing fills the bed in 2–3 years without crowding.', v: { cam: POC.cam, at: POC.at, hi: ['flags'], show: ['flags'] } },
      { t: 'Set out the pots', d: 'Put each pot on its flag and walk around before you dig. Adjust while it’s easy.', why: 'Moving a pot is free; moving a planted perennial sets it back.', v: { cam: POC.cam, at: POC.at, hi: ['pots'], show: ['pots'] } },
      { t: 'Plant at crown level', d: 'Dig each hole twice as wide as the pot and just as deep. Tease apart circling roots, set the crown level with the soil, backfill and firm. Water each plant right away.', why: 'Crowns buried too deep rot; too high, they dry out. Wide holes give roots loose soil to spread into.', v: { cam: POC.cam, at: POC.at, hi: ['plants'], show: ['plants', 'markers'], hide: ['pots', 'flags'], tool: { id: 'trowel', at: [0.6, 0.06, 0.6], rot: [25, 0, -25], anim: 'push' } } },
      { t: 'Mulch lightly', d: 'Spread 2″ of shredded leaves or hardwood mulch, pulled 2″ back from the crowns. Leave a few small sunny patches of bare soil.', why: 'Mulch holds moisture and smothers weed seeds while plants fill in. About 70% of native bees nest in the ground and need some bare soil.', v: { cam: POC.cam, at: POC.at, hi: ['mulch'], show: ['mulch'] } },
      { t: 'Water the first season', d: 'Soak the bed right after planting, then give 1″ of water a week (rain plus irrigation) through the first summer. After that, most natives need water only in long droughts.', why: 'New perennials have small root balls until they establish. Deep weekly water builds the deep roots that make natives drought-tough later.', v: { cam: POC.cam, at: POC.at, hi: ['plants'], show: ['water'], fx: 'water', tool: { id: 'wateringCan', at: [0.4, 0.75, 0.3], rot: [0, 200, 25] } } },
      { t: 'Leave stems up for winter', d: 'Don’t cut back in fall. In spring, once daytime temps hit the 50s°F, cut stems to 12–15″ and leave them; bees nest in the hollow stubs. Divide crowded clumps every 3–4 years.', why: 'Seed heads feed birds, and many beneficial insects overwinter in stems and leaf litter.', v: { cam: POC.cam, at: POC.at, hi: ['plants'], hide: ['water'] } },
    ],
    learn: {
      how: 'Bees and butterflies forage efficiently: they visit big patches of the same flower and need nectar and pollen from early spring to late fall. Native perennials co-evolved with local insects, and many caterpillars can only eat specific native plants. Perennials spend their first year growing roots, the second year growing up, and fill in by the third (“sleep, creep, leap”). Light mulch, no pesticides, and standing winter stems complete the habitat.',
      specs: [['Sun', '6+ hr'], ['Plant spacing', '18–24″ (mature width)'], ['Drift size', '3–7 of a kind'], ['Bloom', '3+ species per season'], ['Mulch', '2″, off crowns, some bare soil'], ['First-year water', '1″ per week'], ['Spring cut-back', 'To 12–15″, after temps reach the 50s°F']],
      terms: [['Native plant', 'A species that grew in your region before European settlement.'], ['Drift', 'A loose group of one plant repeated.'], ['Crown', 'Where stems meet roots, at the soil line.'], ['Host plant', 'A plant caterpillars eat (milkweed for monarchs).'], ['Cultivar', 'A selected variety; some “nativars” have changed flowers bees use less.']],
      mistakes: ['Planting one of each of 30 species.', 'Heavy fertilizing.', 'Deep mulch piled on crowns and covering every inch of soil.', 'Cutting everything to the ground in fall.', 'Spraying insecticide for aphids or beetles.'],
      tips: ['Include host plants like milkweed (monarchs), golden alexanders (swallowtails) and asters (many moths).', 'Plugs (small 2″ starts) are cheap for big beds and establish fast.', 'Add a shallow water dish with stones for bees to land on.'],
    },
    pro: 'The bed is large (over 500 sq ft) or on a slope that will erode, or you want a certified habitat or rain garden designed.',
    addons: [
      { id: 'beehouse', part: 'aoBeeHouse', name: 'Native bee nest block', cat: 'Garden', blurb: 'Drilled nesting holes for mason and leafcutter bees.', cost: [20, 60], how: 'Mount it 3–5 ft up on a post facing southeast, under a small roof. Replace the tubes or block every 2 years to prevent disease.', needs: ['Bee nesting block with removable tubes', '4×4 post'], shop: 'Mason bee house removable tubes' },
      { id: 'bath', part: 'aoBath', name: 'Bee water dish', cat: 'Garden', blurb: 'A shallow drink with landing stones.', cost: [15, 50], how: 'Set a shallow saucer at ground level with pebbles poking above the water. Refill every 2–3 days so mosquitoes can’t breed.', needs: ['Shallow dish', 'Pebbles'], shop: 'Shallow bird bath ground' },
      { id: 'lights', part: 'aoLights', name: 'Solar path lights', cat: 'Lighting', blurb: 'Soft, warm light along the bed edge.', cost: [30, 90], how: 'Push stakes in along the edge, 3–4 ft apart. Choose warm (2700 K) light; bright white light draws night insects off course.', needs: ['Warm-white solar path lights'], shop: 'Warm white solar path lights' },
      { id: 'sign', part: 'aoSign', name: 'Pollinator habitat sign', cat: 'Finish', blurb: 'Tells neighbors the standing stems are on purpose.', cost: [20, 45], how: 'Mount it on a short post near the sidewalk. Several programs certify gardens with food, water and shelter.', needs: ['Pollinator habitat sign'], shop: 'Pollinator habitat garden sign' },
    ],
  };

  const WC = { cam: [1.4, 0.75, 2.3], at: [0, 0.2, 0.4] };
  const water = {
    id: 'deep-watering',
    title: 'Water deeply and set up a watering schedule',
    model: 'growWater',
    level: 1,
    time: '1–2 hrs to set up',
    cost: '$0–120',
    summary: 'Gardens need about 1″ of water a week. Measure what your sprinkler or drip actually puts out, water deeply once or twice a week to wet the soil 6–12″ down, check with a probe, and put drip on a morning timer under 2–3″ of mulch.',
    intro: { show: ['wetDeep', 'rootsDeep', 'drip', 'timer', 'mulch', 'gauge'], preview: true, spin: true },
    safety: ['Use a backflow preventer (vacuum breaker) on any hose timer or drip system so garden water can’t siphon back into your drinking water.', 'Don’t drink from garden hoses; many contain lead or plasticizers unless labeled drinking-water safe.', 'Check local watering restrictions and allowed days.'],
    causes: [
      ['How much', 'About 1″ per week from rain plus irrigation; up to 2″ in hot, windy weather or sandy soil. 1″ over 100 sq ft is about 62 gallons.'],
      ['How deep', 'Most vegetable roots are in the top 12″. Wet the soil 6–12″ down each time, then let the top 1–2″ dry before the next watering.'],
      ['When', 'Early morning (4–9 am). Leaves dry quickly, and less water is lost to evaporation and wind.'],
    ],
    tools: ['Rain gauge', 'Tuna or cat-food cans (straight-sided)', 'Long screwdriver or soil probe', 'Trowel', 'Drip tubing with 12″ emitters (or soaker hose)', 'Hose timer', 'Backflow preventer, filter, 25 psi pressure regulator', 'Hose-to-drip adapter, end caps, stakes', 'Straw or shredded-leaf mulch'],
    steps: [
      { t: 'Put up a rain gauge', d: 'Set a rain gauge in the open near the garden and note every rainfall. Subtract it from the 1″ weekly target.', why: 'You can’t tell 0.1″ from 1″ of rain by looking. Many gardens are overwatered the week after a storm and parched after a “rainy” drizzle.', v: { cam: [2.2, 1.2, 1.6], at: [1.4, 0.6, -0.4], hi: ['gauge'], show: ['gauge'] } },
      { t: 'Measure your sprinkler with a can', d: 'Set a few straight-sided cans in the spray and time how long it takes to collect 1″. Many sprinklers need 1–2 hours.', why: 'Sprinklers vary hugely. Timing the cans turns “I watered for 20 minutes” into an actual amount.', v: { cam: [0.2, 1.4, 2.4], at: [-0.6, 0.2, 0], hi: ['sprinkler', 'can'], show: ['sprinkler', 'can'], fx: 'spray' } },
      { t: 'See what shallow watering does', d: 'Daily light sprinkling wets only the top 1–2″, and roots stay there. On the first hot day, those plants wilt.', why: 'Roots grow where the water is. Shallow roots also leave plants open to heat stress, tip-burn and blossom-end rot.', v: { cam: WC.cam, at: WC.at, hi: ['wetShallow', 'rootsShallow'], show: ['canWater', 'wetShallow', 'rootsShallow'] } },
      { t: 'Soak deep, less often', d: 'Water long enough to wet 6–12″ deep, once or twice a week, then let the top inch or two dry out.', why: 'Water that soaks deep pulls roots down after it, where the soil stays cool and moist between waterings.', v: { cam: WC.cam, at: WC.at, hi: ['wetDeep', 'rootsDeep'], show: ['wetDeep', 'rootsDeep'], hide: ['wetShallow', 'rootsShallow', 'sprinkler', 'can', 'canWater'] } },
      { t: 'Check with a probe', d: 'An hour after watering, push a long screwdriver into the soil. It slides in easily through moist soil and stops at dry. Or dig a small hole with a trowel and look.', why: 'This 10-second test shows how deep your water actually went, and tells you when to water again.', v: { cam: [1.0, 0.7, 1.6], at: [-0.3, 0.25, 0.3], hi: ['wetDeep'], tool: { id: 'screwdriver', at: [-0.15, 0.2, 0.35], rot: [0, 0, 0], anim: 'push', scale: 1.4 } } },
      { t: 'Switch to drip', d: 'Run lines of ½″ drip tubing with emitters every 12″ (0.5–1 gph) 12–18″ apart down the bed. Connect at the spigot through a backflow preventer, filter and 25 psi pressure regulator.', why: 'Drip puts water only at the roots, uses 30–50% less water than sprinklers, and keeps leaves dry, which reduces disease.', v: { cam: [1.9, 1.5, 1.4], at: [0.4, 0.2, -0.3], hi: ['drip'], show: ['drip'] } },
      { t: 'Set the timer', d: 'Program it for early morning. Example: 24 emitters × 0.5 gph = 12 gal per hour; a 4×8 bed needs about 20 gal a week, so run it 50 minutes, twice a week.', why: 'Doing the math once gives you a starting point. Adjust after checking soil depth with your probe.', tip: 'Formula: minutes per week = (bed sq ft × 0.62 gal) ÷ (gph of all emitters) × 60.', v: { cam: [2.0, 0.8, -0.3], at: [1.5, 0.35, -1.25], hi: ['timer'], show: ['timer'] } },
      { t: 'Mulch over the drip', d: 'Spread 2–3″ of straw or shredded leaves over the soil and drip lines once the soil warms in late spring.', why: 'Mulch cuts evaporation dramatically, keeps soil up to 10°F cooler in summer and stops crusting, so water soaks in instead of running off.', v: { cam: WC.cam, at: WC.at, hi: ['mulch'], show: ['mulch'] } },
      { t: 'Adjust with the weather', d: 'Skip watering after 1″ of rain, add a run in heat waves, and check soil with your finger 2″ down before watering. Pots and new transplants need water more often.', why: 'Plants need far more water in July than in May. A fixed timer that never changes over- or under-waters most of the season.', v: { cam: [2.4, 1.3, 2.4], at: [0.3, 0.4, -0.2], hi: ['gauge', 'timer'] } },
    ],
    learn: {
      how: 'Water moves down through soil as a wetting front: soil fills to capacity layer by layer before water moves deeper. A light sprinkle stops near the surface and evaporates within a day. Clay soil soaks slowly but holds 2″ of water per foot of depth; sand soaks quickly but holds only about ¾″, so it needs smaller, more frequent watering. Mulch shields the surface from sun and wind, the two forces that pull water out of the top few inches.',
      specs: [['Weekly target', '1″ (≈0.62 gal/sq ft)'], ['Wetting depth', '6–12″'], ['Best time', '4–9 am'], ['Drip emitters', '0.5–1 gph, 12″ apart'], ['Drip pressure', '20–30 psi (use regulator)'], ['Mulch', '2–3″'], ['Water held per ft', 'Sand ≈0.75″, loam ≈1.5″, clay ≈2″']],
      terms: [['gph', 'Gallons per hour per emitter.'], ['Backflow preventer', 'A valve that stops water flowing back into household plumbing.'], ['Wetting front', 'The boundary between wet and dry soil as water soaks down.'], ['Field capacity', 'How much water a soil holds after it drains.']],
      mistakes: ['Watering a little every day.', 'Watering in the evening on leaves (disease).', 'Never checking how deep the water went.', 'Running drip without a filter or regulator (clogs and blowouts).', 'Leaving the timer on the same schedule all season.'],
      tips: ['Drain and store the timer before the first freeze.', 'Flush drip lines each spring by opening the end caps for a minute.', 'Group plants with similar water needs on the same line.'],
    },
    pro: 'You want an automatic in-ground irrigation system with multiple zones and a backflow device that needs to be inspected or permitted in your area.',
    addons: [
      { id: 'sensor', part: 'aoSensor', name: 'Smart moisture sensor', cat: 'Tech', blurb: 'Skips a scheduled run when the soil is still wet.', cost: [30, 80], how: 'Bury the probe at root depth (4–6″) mid-bed, away from an emitter, and link it to a compatible Wi-Fi hose timer.', needs: ['Soil moisture sensor', 'Wi-Fi hose timer'], shop: 'Wifi hose timer soil moisture sensor' },
      { id: 'barrel', part: 'aoBarrel', name: 'Rain barrel', cat: 'Garden', blurb: 'Saves roof water for dry spells: 1″ of rain on 1,000 sq ft of roof is 600 gal.', cost: [80, 200], how: 'Set it on a level block base under a downspout, add a diverter, screen the inlet against mosquitoes, and point the overflow away from the foundation.', needs: ['Rain barrel', 'Downspout diverter', 'Concrete blocks'], shop: 'Rain barrel with diverter' },
      { id: 'olla', part: 'aoOlla', name: 'Clay olla', cat: 'Garden', blurb: 'Unglazed pot buried to its neck that seeps water to roots.', cost: [25, 50], how: 'Bury it to the neck between plants and fill it every few days. Roots grow toward it.', needs: ['Unglazed clay olla'], shop: 'Clay olla irrigation pot' },
    ],
  };

  const GC = { cam: [2.2, 1.6, 2.5], at: [0, 0.3, 0] };
  const garlic = {
    id: 'garlic-potatoes',
    title: 'Grow garlic or potatoes',
    model: 'growGarlic',
    level: 1,
    time: '1–2 hrs to plant',
    cost: '$25–80',
    summary: 'Plant garlic cloves 2″ deep and 6″ apart in fall, mulch with straw, snap scapes in June and harvest when 5–6 green leaves remain. Potatoes go in 6″ trenches in spring and get hilled twice as they grow.',
    intro: { show: ['compostG', 'mature', 'straw', 'curing'], preview: true, spin: true },
    safety: ['Use certified seed garlic or seed potatoes, not grocery produce; store-bought can carry disease and may be treated to stop sprouting.', 'Wear gloves when cutting seed potatoes if you have sensitive skin.', 'Green potato skin contains solanine, which is toxic; keep tubers covered with soil and store in the dark.'],
    causes: [
      ['When', 'Garlic: mid-October to early November in most of the US, 4–6 weeks before the ground freezes. Potatoes: 2–3 weeks before the last spring frost, once soil reaches 45°F.'],
      ['Soil', 'Loose, well-drained soil with pH 6.0–7.0 and 2″ of compost. Both rot in soggy ground; raised beds are ideal.'],
      ['Rotation', 'Don’t plant garlic where onions grew, or potatoes where tomatoes, peppers or potatoes grew, in the last 3 years.'],
    ],
    tools: ['Seed garlic (1 lb ≈ 40–50 cloves)', 'Compost', 'Balanced fertilizer', 'Trowel or dibber', 'Tape measure', 'Straw (1 bale per ~100 sq ft)', 'Nitrogen fertilizer (blood meal or 21-0-0) for spring', 'Digging fork', 'Curing rack or airy shelf'],
    steps: [
      { t: 'Prep the bed', d: 'Spread 2″ of compost and 2–3 lb of 10-10-10 (or an organic equivalent) per 100 sq ft, and fork it in 6–8″ deep.', why: 'Garlic sits in the ground 8–9 months. Loose, fertile soil lets bulbs swell evenly.', v: { cam: GC.cam, at: GC.at, hi: ['compostG'], show: ['compostG'], tool: { id: 'shovel', at: [0.6, 0.32, 0.3], rot: [15, 40, -20], anim: 'push' } } },
      { t: 'Break bulbs into cloves', d: 'A day or two before planting, split bulbs into cloves, keeping the papery skins on. Plant the biggest cloves; eat the small inner ones.', why: 'Big cloves grow big bulbs. Splitting early dries the base plate and invites rot.', tip: 'Hardneck types (Music, Chesnok Red) suit cold winters and give scapes. Softneck (Inchelium Red) stores longer and suits mild winters.', v: { cam: [2.2, 0.9, 1.6], at: [1.65, 0.1, 0.75], hi: ['seedTray'], show: ['seedTray'] } },
      { t: 'Mark the rows', d: 'Mark rows 12″ apart (or a 6–7″ grid in a raised bed).', why: 'Even spacing gives each bulb the same room and makes weeding easy.', v: { cam: GC.cam, at: GC.at, hi: ['furrows'], show: ['furrows'], tool: { id: 'tape', at: [-1.1, 0.31, -0.45], rot: [0, 0, 0], scale: 1.4 } } },
      { t: 'Plant 2″ deep, pointy end up', d: 'Push each clove in, flat base down and tip up, so the tip is 2″ below the surface (3–4″ in very cold areas), 6″ apart. Cover and firm.', why: 'Upside-down cloves waste energy turning around and make twisted bulbs. 2″ of soil protects them from heaving in freeze-thaw cycles.', v: { cam: [1.4, 0.9, 1.6], at: [0, 0.25, 0], hi: ['cloves'], show: ['cloves'], hide: ['seedTray'], xray: true, tool: { id: 'trowel', at: [0.45, 0.31, 0.15], rot: [20, 0, -20], anim: 'push' } } },
      { t: 'Water, then mulch with straw', d: 'Water well. When the ground starts to freeze, cover with 4–6″ of straw.', why: 'Cloves root in fall before going dormant. Straw prevents frost heaving, smothers weeds and keeps moisture even in spring.', v: { cam: GC.cam, at: GC.at, hi: ['straw'], show: ['straw'], hide: ['furrows'] } },
      { t: 'Feed the spring shoots', d: 'When shoots are 4–6″ tall in spring, side-dress with nitrogen (about ½ lb of blood meal or ¼ lb of 21-0-0 per 100 sq ft) and again 3 weeks later. Water 1″ a week until early June.', why: 'Each leaf becomes a wrapper on the bulb, so leaf growth in spring decides bulb size. Stop feeding by late May; late nitrogen delays bulbing.', v: { cam: GC.cam, at: GC.at, hi: ['shoots'], show: ['shoots'] } },
      { t: 'Snap off the scapes', d: 'On hardneck garlic, snap off the curly flower stalks when they make one loop. Cook them like green beans.', why: 'Removing scapes sends energy into the bulb, often making bulbs 20–30% larger.', v: { cam: [1.3, 0.9, 1.4], at: [0.2, 0.55, 0.1], hi: ['scapes'], show: ['mature', 'scapes'], hide: ['shoots'] } },
      { t: 'Harvest at 5–6 green leaves', d: 'Stop watering 2 weeks before harvest. When the lower third to half of the leaves are brown but 5–6 are still green, loosen the soil with a fork and lift the bulbs. Don’t pull by the stem.', why: 'Each green leaf is a protective wrapper. Harvest too late and the bulb splits open and won’t store.', v: { cam: [1.4, 0.9, 1.6], at: [0, 0.25, 0], hi: ['bulbsUG'], show: ['bulbsUG'], hide: ['scapes'], xray: true, tool: { id: 'shovel', at: [0.6, 0.38, 0.3], rot: [10, 40, -15], anim: 'push' } } },
      { t: 'Cure 2–4 weeks', d: 'Brush off soil (don’t wash) and hang or lay the plants with leaves on in shade with good airflow, around 70–80°F. Then trim roots and stems and store cool and dry.', why: 'Curing dries the neck and outer wrappers so bulbs keep 6–10 months.', v: { cam: [1.8, 1.2, 2.8], at: [0, 0.5, 1.2], hi: ['curing'], show: ['curing'], hide: ['mature', 'bulbsUG'] } },
    ],
    learn: {
      how: 'Garlic needs 6–8 weeks of cold (below 40°F) to divide into cloves, which is why it’s planted in fall. It grows leaves in spring, then begins forming its bulb as days lengthen past about 13 hours in June. Potatoes are swollen underground stems (tubers) that form at the ends of stolons growing from the buried stem, above the seed piece. Hilling soil up the stem gives more room for tubers and keeps light off them.',
      specs: [['Garlic depth', '2″ to clove tip (3–4″ in zone 3–4)'], ['Garlic spacing', '6″ in rows 12″ apart'], ['Garlic mulch', '4–6″ straw'], ['Potato soil temp', '≥ 45°F'], ['Seed piece', '1½–2 oz, 2+ eyes, cured 2–3 days'], ['Potato depth/spacing', '6″ trench, 12″ apart, rows 30–36″'], ['Soil pH', 'Garlic 6.0–7.0; potatoes 5.2–6.5 (lower deters scab)']],
      terms: [['Scape', 'The flower stalk of hardneck garlic.'], ['Hardneck / softneck', 'Two garlic groups: hardnecks have a stiff center stalk and fewer, bigger cloves; softnecks braid and store longer.'], ['Hilling', 'Mounding soil up a potato stem.'], ['Curing', 'Drying or healing the skin so a crop stores well.'], ['Seed potato', 'A tuber grown to be planted, certified disease-free.']],
      mistakes: ['Planting grocery-store garlic or potatoes.', 'Planting garlic too early so it sprouts tall before winter.', 'Leaving garlic in too long (bulbs split).', 'Letting potatoes see light (green, bitter tubers).', 'Watering heavily after potato vines die (rot).'],
      tips: ['Save your biggest garlic bulbs to plant next fall; it adapts to your garden over a few years.', 'Store potatoes at 38–40°F, dark and humid, away from apples and onions.', 'Dig a few “new” potatoes 2–3 weeks after flowering without pulling the whole plant.'],
    },
    pro: 'Not needed. If bulbs or tubers show rot or scab year after year, send a sample to your extension plant clinic.',
    variants: [
      { id: 'garlic', name: 'Garlic (plant in fall)', blurb: 'Cloves in October, scapes in June, cured bulbs in July.' },
      {
        id: 'potatoes',
        name: 'Potatoes (plant in spring)',
        blurb: 'Seed pieces in trenches, hilled twice, dug after the vines die.',
        time: '1–2 hrs to plant, 30 min per hilling',
        intro: { show: ['compostG', 'potBig', 'hill2', 'dug'], preview: true, spin: true },
        summary: 'Plant cut, cured seed potatoes cut side down in 6″ trenches, 12″ apart, cover with 3–4″ of soil, and hill soil up the stems twice as they grow. Keep water even through flowering and dig 2 weeks after the vines die.',
        tools: ['Certified seed potatoes (5 lb ≈ 30–40 pieces)', 'Clean knife', 'Compost', 'Balanced fertilizer', 'Shovel or hoe', 'Straw mulch', 'Digging fork', 'Bushel basket'],
        steps: [
          { t: 'Cut and cure seed potatoes', d: 'Two to three days before planting, cut seed potatoes into 1½–2 oz pieces (about the size of an egg) with at least 2 eyes each. Let them cure at room temperature until the cut sides callus.', why: 'Each eye becomes a stem. A callused cut resists rot in cool spring soil.', v: { cam: [2.2, 0.9, 1.6], at: [1.65, 0.1, 0.75], hi: ['seedPot'], show: ['seedPot'] } },
          { t: 'Prep and dig trenches', d: 'When the soil reaches 45°F, fork in 2″ of compost and balanced fertilizer, then dig trenches 6″ deep, piling soil alongside.', why: 'Potatoes form above the seed piece, so starting deep leaves room for hilling.', v: { cam: GC.cam, at: GC.at, hi: ['trench'], show: ['compostG', 'trench'], tool: { id: 'shovel', at: [0.6, 0.32, 0.45], rot: [15, 40, -20], anim: 'push' } } },
          { t: 'Plant 12″ apart, cut side down', d: 'Set the pieces in the trench bottom, eyes up and 12″ apart, and cover with 3–4″ of soil.', why: 'Shallow cover warms quickly so sprouts emerge fast. The rest of the trench gets filled as they grow.', v: { cam: [1.4, 0.9, 1.6], at: [0, 0.2, 0], hi: ['pieces'], show: ['pieces'], hide: ['seedPot'], xray: true } },
          { t: 'First hilling at 6–8″', d: 'When shoots are 6–8″ tall, pull soil up around the stems, leaving the top 3–4″ of leaves showing.', why: 'Hilling gives stolons more stem to grow from and keeps forming tubers buried and out of the light.', v: { cam: GC.cam, at: GC.at, hi: ['potYoung', 'hill1'], show: ['potYoung', 'hill1'], hide: ['trench', 'pieces'], tool: { id: 'shovel', at: [0.3, 0.33, 0.55], rot: [20, 0, -30], anim: 'push' } } },
          { t: 'Hill again, then mulch', d: 'Hill again 2–3 weeks later, building a ridge 8–12″ high, and finish with 3–4″ of straw.', why: 'A tall ridge doubles the zone where tubers form. Straw keeps the soil cool and moist, which tubers like (60–70°F).', v: { cam: GC.cam, at: GC.at, hi: ['potBig', 'hill2'], show: ['potBig', 'hill2'], hide: ['potYoung', 'hill1'] } },
          { t: 'Keep water even at flowering', d: 'Give 1–2″ of water a week, especially from flowering on when tubers set and swell. Watch for Colorado potato beetles and hand-pick them.', why: 'Uneven water causes hollow heart, knobby and cracked tubers.', v: { cam: [1.5, 1.0, 1.7], at: [0, 0.45, 0], hi: ['potBig'] } },
          { t: 'Dig after the vines die', d: 'Two weeks after the tops yellow and die, dig from the outside of the ridge with a fork, working inward to avoid spearing tubers.', why: 'The wait lets skins thicken (“set”) so they store. New potatoes can be dug 2–3 weeks after flowering.', v: { cam: [1.4, 0.9, 1.6], at: [0, 0.25, 0], hi: ['tubers'], show: ['tubers'], xray: true, tool: { id: 'shovel', at: [0.6, 0.38, 0.5], rot: [10, 40, -15], anim: 'push' } } },
          { t: 'Cure and store', d: 'Let them dry on the soil for a few hours, then cure 1–2 weeks at 50–60°F in the dark. Store at 38–40°F, dark and humid. Don’t wash until you cook them.', why: 'Curing heals scrapes. Light turns skins green and toxic; warm storage makes them sprout.', v: { cam: [2.3, 1.4, 2.6], at: [0.4, 0.3, 0.3], hi: ['dug'], show: ['dug'], hide: ['potBig', 'hill2', 'tubers'] } },
        ],
      },
    ],
    addons: [
      { id: 'hoops', part: 'aoHoops', name: 'Low tunnel + row cover', cat: 'Garden', blurb: 'Protects early potato sprouts from frost and keeps pests off.', cost: [30, 70], how: 'Push 9-gauge wire hoops into the bed every 3–4 ft and drape frost cloth over them, weighing the edges with sandbags. Remove when temperatures stay above 50°F.', needs: ['Garden hoops', 'Frost cloth (row cover)', 'Sandbags or clips'], shop: 'Garden hoops row cover kit' },
      { id: 'drip', part: 'aoDrip', name: 'Drip lines under the mulch', cat: 'Garden', blurb: 'Steady water that keeps tubers and bulbs smooth.', cost: [30, 80], how: 'Lay 2–3 drip lines down the bed before mulching and run them on a timer about 1″ a week, stopping 2 weeks before garlic harvest.', needs: ['Drip line', 'Hose timer', 'Pressure regulator + filter'], shop: 'Drip irrigation kit raised bed' },
    ],
  };

  TB.category({
    id: 'grow',
    icon: 'garden',
    code: 'GRW',
    name: 'Grow',
    domain: 'garden',
    kind: 'project',
    blurb: 'Seeds, soil, vegetables, herbs, trees, roses and pollinator beds',
    repairs: [seedStart, soil, tomatoes, herbs, water, pollinator, tree, prune, garlic],
  });
})();
