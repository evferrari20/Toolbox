/* P9 · Pool & Hot Tub + Seasonal. Two new categories. All scenes in meters (unit: 1). */
(function () {
  const AO = TB.AO;
  const glow = (K, c, i) => K.std(c, { emissive: c, emissiveIntensity: i == null ? 1 : i });
  const plastic = (K, c, o) => K.std(c, Object.assign({ roughness: 0.45 }, o || {}));
  const blackMetal = (K) => K.std(0x1d1f22, { metalness: 0.6, roughness: 0.45 });
  // Straight pipe runs with fittings at the corners (axis-aligned PVC look).
  const run = (K, g, pts, r, mat) => {
    for (let i = 0; i < pts.length - 1; i++) K.bar(g, pts[i], pts[i + 1], r, mat || 'pvc');
    for (let i = 1; i < pts.length - 1; i++) K.sph(g, r * 1.3, mat || 'pvc', pts[i]);
  };
  // Pleated filter cartridge, axis vertical, centered at pos.
  const pleated = (K, parent, r, h, pos, cap) => {
    const c = K.group(parent, pos);
    const media = K.std(0xf1ede2, { roughness: 0.95 });
    K.cyl(c, [r * 0.86, r * 0.86, h * 0.97, 36], media, [0, 0, 0]);
    const n = Math.round(r * 420);
    K.rep(n, (i) => {
      const a = (i / n) * Math.PI * 2;
      K.box(c, [r * 0.2, h * 0.96, 0.004], media, [Math.cos(a) * r * 0.9, 0, Math.sin(a) * r * 0.9], [0, (-a * 180) / Math.PI, 0], 0);
    });
    const capM = plastic(K, cap || 0x2b6fb3);
    [-1, 1].forEach((s) => K.cyl(c, [r * 1.03, r * 1.03, 0.02, 40], capM, [0, (s * h) / 2, 0]));
    K.cyl(c, [r * 0.38, r * 0.38, 0.022, 24], 'dark', [0, h / 2 + 0.002, 0]);
    return c;
  };
  // Jug with handle (chemicals, flush cleaner, etc).
  const jug = (K, g, pos, body, cap, h) => {
    h = h || 0.28;
    const j = K.group(g, pos);
    K.box(j, [0.15, h, 0.1], plastic(K, body, { roughness: 0.6 }), [0, h / 2, 0], null, 0.02);
    K.cyl(j, [0.022, 0.022, 0.035, 16], plastic(K, cap), [0.035, h + 0.015, 0]);
    K.tor(j, [0.04, 0.012, 180], plastic(K, body, { roughness: 0.6 }), [-0.03, h - 0.02, 0], [0, 0, 0]);
    K.box(j, [0.1, h * 0.4, 0.002], K.std(0xffffff, { roughness: 0.8 }), [0, h * 0.45, 0.051], null, 0);
    return j;
  };

  /* =========================================================================
     POOL SCENE — 12×24 ft in-ground pool (3.6 × 7.2 m), 3.3–6.2 ft deep.
     Deck at y=0; shallow end +z, deep end −z.
     ========================================================================= */
  const PX = 1.8;
  const PZ = 3.6;
  TB.model(
    'poolScene',
    {
      unit: 1,
      env: 'garden',
      floor: false,
      cam: [5.2, 4.2, 7.4],
      at: [0, -0.4, 0.6],
      tex: ['aerial_grass_rock', 'interlocking_concrete_pavers', 'granite_tile'],
      assets: ['shrub_01', 'potted_plant_01'],
      hidden: ['vacHead', 'vacPole', 'vacHose', 'vacPlate', 'brush', 'leafNet', 'sample', 'cover', 'plugs', 'gizzmo', 'blower', 'winterKit', 'debris', 'startKit'],
    },
    (K) => {
      const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
      // Ground & deck with the pool cut out
      K.ext(null, K.circle(0, 0, 16, 64), 0.05, K.pbr('aerial_grass_rock', [14, 14], {}, 'grass'), [0, 0, 0], [90, 0, 0], 0, [rect(-3.2, 3.2, -5.4, 5.4).reverse()]);
      const deck = K.part('deck', [0, 0, 0], null, 'Paver deck');
      K.ext(deck, rect(-3.2, 3.2, -5.4, 5.4), 0.08, K.pbr('interlocking_concrete_pavers', [4, 7], {}, 'concrete'), [0, 0.0, 0], [90, 0, 0], 0, [rect(-2.12, 2.12, -3.92, 3.92).reverse()]);
      const coping = K.part('coping', [0, 0, 0], null, 'Bullnose coping');
      K.ext(coping, rect(-2.12, 2.12, -3.92, 3.92), 0.06, K.std(0xd9d1c3, { roughness: 0.9 }), [0, 0.03, 0], [90, 0, 0], 0.01, [rect(-PX + 0.04, PX - 0.04, -PZ + 0.04, PZ - 0.04).reverse()]);
      // Shell: walls, floor, waterline tile
      const shell = K.part('shell', [0, 0, 0], null, 'Plaster pool shell');
      const plaster = K.std(0xdcf0f6, { roughness: 0.85 });
      [-1, 1].forEach((s) => K.box(shell, [0.12, 2.0, 2 * PZ + 0.24], plaster, [s * (PX + 0.06), -1.0, 0], null, 0));
      [-1, 1].forEach((s) => K.box(shell, [2 * PX, 2.0, 0.12], plaster, [0, -1.0, s * (PZ + 0.06)], null, 0));
      K.box(shell, [2 * PX, 0.1, 2.6], plaster, [0, -1.05, 2.3], null, 0);
      K.box(shell, [2 * PX, 0.1, Math.hypot(2, 0.9)], plaster, [0, -1.5, 0], [-24.2, 0, 0], 0);
      K.box(shell, [2 * PX, 0.1, 2.6], plaster, [0, -1.95, -2.3], null, 0);
      const tile = K.std(0x1f5f8b, { roughness: 0.3 });
      [-1, 1].forEach((s) => K.box(shell, [0.01, 0.15, 2 * PZ], tile, [s * (PX - 0.004), -0.1, 0], null, 0));
      [-1, 1].forEach((s) => K.box(shell, [2 * PX, 0.15, 0.01], tile, [0, -0.1, s * (PZ - 0.004)], null, 0));
      // Depth markers on the coping
      [[-1.95, 3.4], [-1.95, -3.4]].forEach(([x, z]) => K.box(shell, [0.12, 0.003, 0.2], 'navy', [x, 0.091, z], null, 0));
      // Entry steps (shallow end)
      const steps = K.part('steps', [0, 0, 0], null, 'Entry steps');
      [[0.3, -0.25], [0.6, -0.5], [0.9, -0.75]].forEach(([d, y]) => {
        K.box(steps, [1.6, 0.25, d], plaster, [-1.0, y - 0.125, PZ - d / 2], null, 0.01);
        K.box(steps, [1.6, 0.02, 0.04], tile, [-1.0, y - 0.01, PZ - d + 0.02], null, 0);
      });
      // Ladder (deep end)
      const lad = K.part('ladder', [PX - 0.05, 0, -2.6], null, 'Stainless ladder');
      [-0.25, 0.25].forEach((z) => K.tube(lad, [[0.55, 0.09, z], [0.4, 0.75, z], [0.1, 0.8, z], [-0.05, 0.4, z], [-0.08, -0.2, z], [-0.08, -1.2, z]], 0.02, 'chrome'));
      K.rep(3, (i) => K.box(lad, [0.08, 0.025, 0.5], K.std(0xe8e8e3, { roughness: 0.5 }), [-0.12, -0.3 - i * 0.28, 0], null, 0.005));
      // Main drain (anti-entrapment covers)
      const md = K.part('mainDrain', [0, -1.895, -2.6], null, 'Main drains (dual, anti-entrapment)');
      [-0.5, 0.5].forEach((x) => {
        K.cyl(md, [0.12, 0.13, 0.02, 32], K.std(0x9fb4bf, { roughness: 0.6 }), [x, 0, 0]);
        K.rep(5, (k) => K.box(md, [0.2, 0.005, 0.012], 'dark', [x, 0.011, -0.06 + k * 0.03], null, 0));
      });
      // Skimmer (side wall, x = −PX) and deck lid
      const sk = K.part('skimmer', [-PX, 0, -1.4], null, 'Skimmer (throat, weir, basket)');
      K.box(sk, [0.02, 0.16, 0.3], 'dark', [0.006, -0.16, 0], null, 0);
      K.box(sk, [0.015, 0.13, 0.27], K.std(0xf4f4f0, { roughness: 0.5 }), [0.012, -0.2, 0], [0, 0, -18], 0);
      K.cyl(sk, [0.15, 0.15, 0.02, 32], K.std(0xf0eee6, { roughness: 0.6 }), [-0.5, 0.09, 0]);
      K.cyl(sk, [0.11, 0.11, 0.022, 32], K.std(0xe4e1d8, { roughness: 0.6 }), [-0.5, 0.092, 0]);
      const basket = K.part('skimBasket', [-PX - 0.5, -0.2, -1.4], null, 'Skimmer basket');
      K.cyl(basket, [0.1, 0.085, 0.15, 24, true], K.std(0xf4f4f0, { roughness: 0.6, side: THREE.DoubleSide }), [0, 0, 0]);
      K.tor(basket, [0.1, 0.008], 'offwhite', [0, 0.075, 0], [90, 0, 0]);
      // Returns
      const ret = K.part('returns', [PX, -0.45, 0], null, 'Return jets (eyeball fittings)');
      [2.0, -0.8].forEach((z) => {
        K.cyl(ret, [0.05, 0.05, 0.02, 24], 'offwhite', [-0.01, 0, z], [0, 0, 90]);
        K.sph(ret, 0.028, 'offwhite', [-0.02, 0, z]);
        K.cyl(ret, [0.012, 0.012, 0.02, 12], 'dark', [-0.045, 0, z], [0, 0, 90]);
      });
      // Light niche
      const lt = K.part('poolLight', [0, -0.75, -PZ], null, 'Pool light');
      K.cyl(lt, [0.15, 0.15, 0.03, 32], 'chrome', [0, 0, 0.01], [90, 0, 0]);
      K.cyl(lt, [0.12, 0.12, 0.031, 32], K.std(0xe9f6ff, { emissive: 0xbfe6ff, emissiveIntensity: 0.4 }), [0, 0, 0.012], [90, 0, 0]);
      // Water
      const water = K.part('water', [0, 0, 0], null, 'Pool water (~13,000 gal)');
      const surf = K.phys(0x4cb6d6, { transparent: true, opacity: 0.42, roughness: 0.04, clearcoat: 1, depthWrite: false });
      const vol = K.std(0x2a9ac0, { transparent: true, opacity: 0.16, depthWrite: false, roughness: 0.1 });
      K.box(water, [2 * PX - 0.01, 0.006, 2 * PZ - 0.01], surf, [0, -0.13, 0], null, 0);
      K.box(water, [2 * PX - 0.02, 0.86, 2 * PZ - 0.02], vol, [0, -0.57, 0], null, 0);
      K.box(water, [2 * PX - 0.02, 0.9, 3.6], vol, [0, -1.45, -1.8], null, 0);
      // Test kit on the deck
      const kit = K.part('testKit', [2.55, 0.08, 4.2], null, 'Drop-test kit (FAS-DPD)');
      K.box(kit, [0.32, 0.07, 0.22], plastic(K, 0xf2f2ee), [0, 0.035, 0], null, 0.01);
      K.box(kit, [0.32, 0.22, 0.012], plastic(K, 0xf2f2ee), [0, 0.18, -0.11], [-8, 0, 0], 0.004);
      const caps = [0xd23b2e, 0x2f6fd0, 0xf2c230, 0x3a9a5a, 0x7a4fb0, 0x222222];
      caps.forEach((c, i) => {
        K.cyl(kit, [0.012, 0.012, 0.07, 12], plastic(K, 0xffffff), [-0.12 + i * 0.045, 0.1, 0.03]);
        K.cone(kit, [0.012, 0.025, 12], plastic(K, c), [-0.12 + i * 0.045, 0.147, 0.03]);
      });
      K.box(kit, [0.08, 0.1, 0.04], K.std(0xeaf6ff, { transparent: true, opacity: 0.6, roughness: 0.05 }), [0.1, 0.12, -0.05], null, 0.006);
      const sample = K.part('sample', [2.3, 0.08, 4.35], null, 'Sample vial (pink = chlorine present)');
      K.cyl(sample, [0.016, 0.016, 0.1, 16], K.std(0xe9f3f7, { transparent: true, opacity: 0.45, roughness: 0.05 }), [0, 0.05, 0]);
      K.cyl(sample, [0.014, 0.014, 0.06, 16], K.std(0xf06bb0, { transparent: true, opacity: 0.85 }), [0, 0.035, 0]);
      // Chemicals
      const chl = K.part('chlorine', [2.75, 0.08, 3.2], null, 'Liquid chlorine (10–12.5%)');
      jug(K, chl, [0, 0, 0], 0xf6f6f2, 0xf2c230, 0.3);
      jug(K, chl, [0.18, 0, 0.02], 0xf6f6f2, 0xf2c230, 0.3);
      const acid = K.part('acid', [2.75, 0.08, 2.6], null, 'Muriatic acid (lowers pH & TA)');
      jug(K, acid, [0, 0, 0], 0xf6f6f2, 0xc0392b, 0.3);
      K.box(acid, [0.1, 0.04, 0.002], 'red', [0, 0.2, 0.052], null, 0);
      const soda = K.part('bakingSoda', [2.65, 0.08, 1.9], null, 'Baking soda (raises TA)');
      K.box(soda, [0.3, 0.12, 0.22], K.std(0xf0c84a, { roughness: 0.9 }), [0, 0.06, 0], [0, 10, 0], 0.03);
      const cya = K.part('stabilizer', [2.6, 0.08, 1.3], null, 'Stabilizer (CYA)');
      K.cyl(cya, [0.11, 0.11, 0.24, 24], plastic(K, 0x2c6fb0), [0, 0.12, 0]);
      K.cyl(cya, [0.115, 0.115, 0.03, 24], plastic(K, 0xf2f2ee), [0, 0.255, 0]);
      const cal = K.part('calcium', [2.6, 0.08, 0.6], null, 'Calcium chloride (raises CH)');
      K.cyl(cal, [0.14, 0.12, 0.3, 24], plastic(K, 0xf2f2ee), [0, 0.15, 0]);
      K.cyl(cal, [0.145, 0.145, 0.03, 24], plastic(K, 0x2b9a6a), [0, 0.31, 0]);
      const bucket = K.part('bucket', [2.25, 0.08, 2.3], null, '5-gal bucket of pool water (pre-dissolve)');
      K.cyl(bucket, [0.15, 0.13, 0.36, 28, true], K.std(0xf0f0ea, { roughness: 0.5, side: THREE.DoubleSide }), [0, 0.18, 0]);
      K.cyl(bucket, [0.135, 0.135, 0.005, 28], 'water', [0, 0.25, 0]);
      K.tor(bucket, [0.15, 0.006, 180], 'grey', [0, 0.36, 0], [0, 0, 0]);
      // Cleaning gear
      const vh = K.part('vacHead', [0.3, -1.88, -1.9], null, 'Weighted vacuum head');
      K.box(vh, [0.42, 0.06, 0.14], K.std(0x2a6db0, { roughness: 0.5 }), [0, 0.04, 0], null, 0.02);
      K.rep(4, (i) => K.cyl(vh, [0.025, 0.025, 0.02, 16], 'dark', [-0.17 + (i % 2) * 0.34, 0.025, i < 2 ? -0.07 : 0.07], [90, 0, 0]));
      K.box(vh, [0.4, 0.02, 0.12], 'black', [0, 0.005, 0], null, 0.004);
      K.cyl(vh, [0.025, 0.025, 0.1, 16], K.std(0x2a6db0), [0, 0.1, 0.0], [30, 0, 0]);
      const vp = K.part('vacPole', [0, 0, 0], null, 'Telescopic pole (8–16 ft)');
      K.bar(vp, [0.3, -1.78, -1.9], [1.2, 1.2, 1.6], 0.016, K.std(0xc6ccd2, { metalness: 0.8, roughness: 0.35 }));
      K.bar(vp, [1.08, 0.75, 1.07], [1.2, 1.2, 1.6], 0.019, K.std(0x2a6db0, { roughness: 0.5 }));
      const hose = K.part('vacHose', [0, 0, 0], null, 'Vacuum hose (filled with water)');
      K.tube(hose, [[0.3, -1.76, -1.85], [0.1, -1.4, -1.6], [-0.6, -0.9, -1.4], [-1.4, -0.4, -1.4], [-PX + 0.05, -0.2, -1.4]], 0.02, K.std(0xeaeae4, { roughness: 0.6 }));
      K.rep(30, (i) => {
        const t = i / 30;
        const p = [0.3 + (-PX + 0.05 - 0.3) * t, -1.76 + 1.56 * t, -1.85 + 0.45 * t];
        K.tor(hose, [0.021, 0.003], 'grey', p, [90, 0, 0]);
      });
      const plate = K.part('vacPlate', [-PX - 0.5, 0.09, -1.4], null, 'Skim-vac plate over the basket');
      K.cyl(plate, [0.13, 0.13, 0.012, 32], plastic(K, 0xf4f4f0), [0, -0.06, 0]);
      K.cyl(plate, [0.022, 0.022, 0.05, 16], plastic(K, 0xf4f4f0), [0, -0.04, 0]);
      const br = K.part('brush', [0, 0, 0], null, '18″ wall brush on pole');
      K.bar(br, [-1.6, -0.9, 0.6], [-0.6, 1.2, 2.6], 0.016, K.std(0xc6ccd2, { metalness: 0.8, roughness: 0.35 }));
      const bh = K.group(br, [-1.66, -0.98, 0.5], [0, 0, 65]);
      K.box(bh, [0.46, 0.04, 0.06], plastic(K, 0x2a6db0), [0, 0, 0], [0, 90, 0], 0.01);
      K.box(bh, [0.44, 0.05, 0.05], K.std(0x333333, { roughness: 1 }), [-0.04, 0, 0], [0, 90, 0], 0.004);
      const net = K.part('leafNet', [0, 0, 0], null, 'Leaf rake (deep bag net)');
      K.bar(net, [0.6, -0.12, 1.2], [2.4, 1.5, 3.8], 0.016, K.std(0xc6ccd2, { metalness: 0.8, roughness: 0.35 }));
      K.tor(net, [0.2, 0.012, 360], plastic(K, 0x2a6db0), [0.45, -0.12, 1.0], [90, 0, 0]);
      K.sph(net, 0.19, K.std(0x3b3b3b, { wireframe: true }), [0.45, -0.2, 1.0], [1, 0.6, 1]);
      const deb = K.part('debris', [0, 0, 0], null, 'Leaves & debris');
      K.rep(26, (i) => {
        const x = Math.sin(i * 12.9) * 1.5;
        const z = Math.cos(i * 7.3) * 3.2;
        const y = i % 2 ? -0.125 : z < -1 ? -1.89 : z > 1 ? -0.99 : -1.4 + z * 0.4;
        K.box(deb, [0.06, 0.004, 0.035], K.std(i % 3 ? 0x6b4a22 : 0x8a6a2a, { roughness: 1 }), [x, y, z], [0, i * 41, 0], 0);
      });
      // Winterizing
      const cover = K.part('cover', [0, 0, 0], null, 'Mesh safety cover on anchors');
      const meshMat = K.std(0x1f4a35, { roughness: 1, transparent: true, opacity: 0.94, side: THREE.DoubleSide });
      K.box(cover, [4.5, 0.006, 8.3], meshMat, [0, 0.07, 0], null, 0);
      K.rep(9, (i) => K.box(cover, [4.5, 0.008, 0.05], K.std(0x16362a, { roughness: 1 }), [0, 0.075, -3.8 + i * 0.95], null, 0));
      K.rep(9, (i) => [-1, 1].forEach((s) => K.cyl(cover, [0.015, 0.015, 0.02, 10], 'chrome', [s * 2.3, 0.085, -3.8 + i * 0.95])));
      const plugs = K.part('plugs', [PX, -0.45, 0], null, 'Expansion plugs in the returns');
      [2.0, -0.8].forEach((z) => {
        K.cyl(plugs, [0.03, 0.03, 0.04, 20], 'rubber', [-0.02, 0, z], [0, 0, 90]);
        K.cyl(plugs, [0.012, 0.012, 0.03, 10], 'brass', [-0.055, 0, z], [0, 0, 90]);
      });
      const giz = K.part('gizzmo', [-PX - 0.5, -0.02, -1.4], null, 'Gizzmo (skimmer ice compensator)');
      K.cyl(giz, [0.035, 0.035, 0.3, 20], plastic(K, 0x1d6fd0), [0, -0.1, 0]);
      K.cyl(giz, [0.045, 0.045, 0.03, 20], plastic(K, 0x1d6fd0), [0, 0.06, 0]);
      const blower = K.part('blower', [-2.75, 0.08, -2.1], null, 'Shop-vac / cyclone blower');
      K.cyl(blower, [0.2, 0.18, 0.45, 28], plastic(K, 0xd03a2e), [0, 0.225, 0]);
      K.cyl(blower, [0.13, 0.15, 0.14, 28], 'dark', [0, 0.52, 0]);
      K.tube(blower, [[0.08, 0.5, 0.05], [0.2, 0.3, 0.3], [0.4, 0.1, 0.6], [0.45, 0.09, 0.7]], 0.025, 'dark');
      const wk = K.part('winterKit', [2.4, 0.08, -0.6], null, 'Closing kit: shock, algaecide, enzyme');
      jug(K, wk, [0, 0, 0], 0x2a6db0, 0xffffff, 0.24);
      jug(K, wk, [0.2, 0, 0], 0x3a9a5a, 0xffffff, 0.24);
      K.box(wk, [0.12, 0.22, 0.08], K.std(0xf2f2ee, { roughness: 0.9 }), [0.4, 0.11, 0], null, 0.01);
      const sk2 = K.part('startKit', [2.45, 0.08, -1.5], null, 'Opening: reinstalled fittings & ladder rail kit');
      K.box(sk2, [0.4, 0.2, 0.3], K.std(0xb48a5a, { roughness: 0.95 }), [0, 0.1, 0], null, 0.01);
      K.rep(3, (i) => K.cyl(sk2, [0.028, 0.028, 0.02, 20], 'offwhite', [-0.1 + i * 0.1, 0.21, 0]));
      // Garden context
      [[-3.8, -4.2], [3.8, -4.6], [-3.9, 4.8]].forEach(([x, z]) => K.glb(null, 'shrub_01', { height: 1.1 }, [x, 0, z]) || K.sph(null, 0.5, 'green', [x, 0.45, z], [1, 0.8, 1]));
      [[-2.7, 4.6], [2.8, -4.8]].forEach(([x, z]) => K.glb(null, 'potted_plant_01', { height: 0.8 }, [x, 0.08, z]) || null);
      [-1, 1].forEach((s) => {
        const ch = K.group(null, [s * 2.65, 0.08, s > 0 ? -3.3 : 2.6], [0, s > 0 ? 0 : 180, 0]);
        K.box(ch, [0.6, 0.06, 1.8], K.std(0xf2f2ee, { roughness: 0.6 }), [0, 0.32, 0], null, 0.02);
        K.box(ch, [0.6, 0.06, 0.6], K.std(0xf2f2ee, { roughness: 0.6 }), [0, 0.5, -0.95], [-50, 0, 0], 0.02);
        [[0.26, 0.8], [-0.26, 0.8], [0.26, -0.8], [-0.26, -0.8]].forEach(([x, z]) => K.cyl(ch, [0.015, 0.015, 0.3, 8], 'steel', [x, 0.15, z]));
      });
      const surfMesh = water.children[0];
      const vhBase = vh.position.clone();
      return {
        tick(t, fx) {
          surfMesh.position.y = -0.13 + Math.sin(t * 1.6) * 0.004;
          if (fx === 'vac') vh.position.x = vhBase.x + Math.sin(t * 0.9) * 0.6;
          else vh.position.x = vhBase.x;
          sample.children[1].material.color.setHex(fx === 'fas' ? 0xf3f3f3 : 0xf06bb0);
        },
      };
    }
  );

  /* =========================================================================
     EQUIPMENT PAD — pump, filter (sand / cartridge / DE), heater, valves.
     ========================================================================= */
  const padModel = (name, type) =>
    TB.model(
      name,
      {
        unit: 1,
        env: 'garden',
        cam: [2.2, 1.7, 3.0],
        at: [-0.1, 0.55, 0],
        ground: { tex: 'aerial_grass_rock', repeat: 8, radius: 8 },
        tex: ['aerial_grass_rock', 'wood_planks', 'brushed_concrete'],
        hidden: ['hoseFill', 'lube', 'newOring'].concat(type === 'sand' ? ['wasteHose'] : type === 'cart' ? ['nozzle', 'soak'] : ['wasteHose', 'nozzle', 'deBag']),
      },
      (K) => {
        const pvc = K.std(0xf2f2ec, { roughness: 0.35 });
        // Pad & fence
        K.box(null, [3.0, 0.1, 1.5], K.pbr('brushed_concrete', [2, 1], {}, 'concrete'), [0, 0.05, 0], null, 0.01);
        const fence = K.group(null, [0, 0, -0.95]);
        const cedar = K.pbr('wood_planks', [0.3, 1], { color: 0xc89466 }, 'wood');
        K.rep(24, (i) => K.box(fence, [0.135, 1.6, 0.02], cedar, [-1.7 + i * 0.148, 0.8, 0], null, 0.003));
        [0.3, 1.3].forEach((y) => K.box(fence, [3.6, 0.09, 0.04], cedar, [0, y, -0.03], null, 0.004));
        // ---- Pump ----
        const pg = K.group(null, [-0.85, 0.1, 0]);
        const body = K.part('pumpBody', [0, 0, 0], pg, 'Pump: strainer pot + volute');
        const pumpM = K.std(0x2b2e33, { roughness: 0.5 });
        K.box(body, [0.62, 0.05, 0.26], pumpM, [0.02, 0.025, 0], null, 0.01);
        K.cyl(body, [0.11, 0.1, 0.22, 32], pumpM, [-0.22, 0.17, 0]);
        K.cyl(body, [0.05, 0.05, 0.12, 20], pumpM, [-0.32, 0.16, 0], [0, 0, 90]);
        K.cyl(body, [0.13, 0.13, 0.09, 32], pumpM, [0, 0.2, 0], [0, 0, 90]);
        K.cyl(body, [0.045, 0.045, 0.16, 20], pumpM, [0, 0.34, 0]);
        K.tor(body, [0.12, 0.012, 360], pumpM, [-0.22, 0.28, 0], [90, 0, 0]);
        const motor = K.part('motor', [0, 0, 0], pg, 'Motor (variable-speed)');
        const motorM = K.std(0x30343a, { roughness: 0.45, metalness: 0.3 });
        K.cyl(motor, [0.12, 0.12, 0.3, 32], motorM, [0.21, 0.2, 0], [0, 0, 90]);
        K.rep(8, (i) => K.tor(motor, [0.122, 0.006], motorM, [0.08 + i * 0.035, 0.2, 0], [0, 90, 0]));
        K.cyl(motor, [0.11, 0.09, 0.05, 32], motorM, [0.385, 0.2, 0], [0, 0, 90]);
        K.box(motor, [0.18, 0.06, 0.14], K.std(0x1b1d20), [0.21, 0.35, 0], null, 0.01);
        K.box(motor, [0.08, 0.004, 0.05], 'screen', [0.21, 0.381, 0], null, 0);
        K.sph(motor, 0.006, 'ledG', [0.27, 0.383, 0.02]);
        const lid = K.part('pumpLid', [-0.22, 0.29, 0], pg, 'Clear pump lid + lock ring');
        K.cyl(lid, [0.115, 0.115, 0.035, 32], K.std(0xd9ecf5, { transparent: true, opacity: 0.4, roughness: 0.05 }), [0, 0.02, 0]);
        K.tor(lid, [0.118, 0.014, 360], pumpM, [0, 0.03, 0], [90, 0, 0]);
        [-1, 1].forEach((s) => K.box(lid, [0.06, 0.03, 0.03], pumpM, [s * 0.13, 0.03, 0], null, 0.006));
        const oring = K.part('lidOring', [-0.22, 0.292, 0], pg, 'Lid O-ring');
        K.tor(oring, [0.104, 0.005, 360], K.std(0x15171a, { roughness: 0.85 }), [0, 0, 0], [90, 0, 0]);
        const newO = K.part('newOring', [0.05, 0.003, 0.5], null, 'New O-ring + silicone lube');
        K.tor(newO, [0.104, 0.005, 360], K.std(0x15171a, { roughness: 0.85 }), [0, 0.1, 0], [90, 0, 0]);
        const basket = K.part('basket', [-0.22, 0.17, 0], pg, 'Strainer basket');
        K.cyl(basket, [0.088, 0.08, 0.17, 24, true], K.std(0xdfe6e8, { transparent: true, opacity: 0.85, side: THREE.DoubleSide, roughness: 0.5 }), [0, 0, 0]);
        K.tor(basket, [0.09, 0.008], 'offwhite', [0, 0.085, 0], [90, 0, 0]);
        K.rep(6, (i) => K.box(basket, [0.025, 0.004, 0.02], K.std(0x6b4a22, { roughness: 1 }), [Math.sin(i) * 0.04, -0.06 + i * 0.004, Math.cos(i * 2) * 0.04], [0, i * 30, 0], 0));
        const dp = K.part('drainPlugs', [0, 0, 0], pg, 'Drain plugs');
        K.cyl(dp, [0.016, 0.016, 0.03, 6], 'black', [-0.22, 0.09, 0.105], [90, 0, 0]);
        K.cyl(dp, [0.016, 0.016, 0.03, 6], 'black', [0, 0.09, 0.07], [90, 0, 0]);
        // Suction side: skimmer & main-drain lines → 3-way valve → union → pump
        const suc = K.part('suction', [0, 0, 0], null, 'Suction pipes (2″ PVC)');
        const PY = 0.26;
        run(K, suc, [[-1.65, 0, 0.0], [-1.65, PY, 0.0], [-1.49, PY, 0.0]], 0.03, pvc);
        run(K, suc, [[-1.42, 0, 0.42], [-1.42, PY, 0.42], [-1.42, PY, 0.07]], 0.03, pvc);
        run(K, suc, [[-1.35, PY, 0], [-1.17, PY, 0]], 0.03, pvc);
        K.box(suc, [0.03, 0.02, 0.01], 'black', [-1.65, 0.12, 0.031], null, 0);
        const valve = K.part('suctionValve', [-1.42, PY, 0], null, '3-way diverter valve (skimmer / main drain)');
        K.cyl(valve, [0.075, 0.075, 0.12, 32], pvc, [0, 0, 0]);
        K.cyl(valve, [0.08, 0.08, 0.03, 32], pvc, [0, 0.07, 0]);
        const vh = K.part('valveHandle', [-1.42, PY + 0.09, 0], null, 'Valve handle');
        K.box(vh, [0.22, 0.03, 0.04], K.std(0x2b2e33), [0.0, 0.015, 0], null, 0.008);
        K.box(vh, [0.04, 0.01, 0.02], 'red', [0.1, 0.031, 0], null, 0.002);
        const un = K.part('union', [-1.12, PY, 0], null, 'Union at the pump inlet');
        K.cyl(un, [0.048, 0.048, 0.06, 6], pvc, [0, 0, 0], [0, 0, 90]);
        K.cyl(un, [0.042, 0.042, 0.04, 24], pvc, [0.05, 0, 0], [0, 0, 90]);
        // ---- Filter ----
        const FX = 0.2;
        const filt = K.part('filter', [FX, 0.1, 0], null, type === 'sand' ? 'Sand filter tank (24″)' : type === 'cart' ? 'Cartridge filter tank' : 'DE filter tank');
        const tankM = K.std(type === 'sand' ? 0xcfc6b1 : 0x2d3036, { roughness: 0.5 });
        let topY;
        if (type === 'sand') {
          K.lathe(filt, [[0, 0], [0.24, 0], [0.29, 0.06], [0.31, 0.16], [0.31, 0.62], [0.28, 0.74], [0.2, 0.82], [0.12, 0.85], [0, 0.85]], tankM);
          K.cyl(filt, [0.3, 0.32, 0.08, 32], K.std(0x2b2e33), [0, 0.04, 0]);
          K.cyl(filt, [0.02, 0.02, 0.04, 6], 'black', [0, 0.06, 0.31], [90, 0, 0]);
          topY = 0.95;
          const mp = K.part('multiport', [FX, 0.1 + 0.9, 0], null, 'Multiport valve (6 positions)');
          K.cyl(mp, [0.13, 0.12, 0.12, 32], K.std(0x2b2e33), [0, 0, 0]);
          K.cyl(mp, [0.14, 0.14, 0.012, 32], K.std(0xe9e6dd), [0, 0.06, 0]);
          ['FILTER', 'BACKWASH', 'RINSE', 'WASTE', 'RECIRC', 'CLOSED'].forEach((_, i) => K.box(mp, [0.04, 0.003, 0.01], i === 0 ? 'green' : i === 1 ? 'red' : 'dark', [Math.cos(i * 1.047) * 0.115, 0.067, Math.sin(i * 1.047) * 0.115], [0, -i * 60, 0], 0));
          [[-1, 0], [1, 0]].forEach(([s]) => K.cyl(mp, [0.04, 0.04, 0.08, 20], K.std(0x2b2e33), [s * 0.15, -0.02, 0], [0, 0, 90]));
          K.cyl(mp, [0.04, 0.04, 0.09, 20], K.std(0x2b2e33), [0, -0.02, 0.16], [90, 0, 0]);
          const hd = K.part('mpHandle', [FX, 0.1 + 0.97, 0], null, 'Multiport handle (press down, turn)');
          K.cyl(hd, [0.03, 0.03, 0.06, 20], K.std(0x2b2e33), [0, 0.02, 0]);
          K.box(hd, [0.3, 0.035, 0.05], K.std(0x2b2e33), [0.06, 0.06, 0], null, 0.012);
          K.box(hd, [0.03, 0.01, 0.02], 'yellow', [-0.06, 0.08, 0], null, 0.002);
          const sg = K.part('sightGlass', [FX, 0.98, 0.25], null, 'Sight glass on the waste port');
          K.cyl(sg, [0.035, 0.035, 0.08, 20], K.std(0xdbeef7, { transparent: true, opacity: 0.45, roughness: 0.05 }), [0, 0, 0], [90, 0, 0]);
          const sand = K.part('sand', [FX, 0.1, 0], null, '#20 silica sand (~150 lb)');
          K.cyl(sand, [0.29, 0.29, 0.5, 32], K.std(0xd8c69a, { roughness: 1 }), [0, 0.33, 0]);
          K.cyl(sand, [0.025, 0.025, 0.72, 16], pvc, [0, 0.44, 0]);
          K.rep(8, (i) => K.bar(sand, [0, 0.12, 0], [Math.cos(i * 0.785) * 0.25, 0.1, Math.sin(i * 0.785) * 0.25], 0.012, 'grey'));
          const wh = K.part('wasteHose', [0, 0, 0], null, 'Backwash hose to a legal drain spot');
          K.tube(wh, [[FX, 0.98, 0.29], [FX, 0.85, 0.5], [FX + 0.1, 0.12, 0.8], [FX + 0.3, 0.02, 1.4], [FX + 0.6, 0.02, 2.4]], 0.035, K.std(0x2f6fd0, { roughness: 0.6 }));
          // Pump discharge to multiport, multiport return down to heater
          run(K, suc, [[-0.85, 0.5, 0], [-0.85, 0.98, 0], [FX - 0.19, 0.98, 0]], 0.03, pvc);
          run(K, suc, [[FX + 0.19, 0.98, 0], [0.62, 0.98, 0], [0.62, 0.36, 0], [0.72, 0.36, 0]], 0.03, pvc);
        } else {
          K.lathe(filt, [[0, 0], [0.2, 0], [0.27, 0.05], [0.28, 0.12], [0.28, 0.78], [0, 0.78]], tankM);
          K.cyl(filt, [0.28, 0.3, 0.06, 32], K.std(0x1b1d20), [0, 0.03, 0]);
          K.cyl(filt, [0.02, 0.02, 0.04, 6], 'black', [0, 0.06, 0.29], [90, 0, 0]);
          topY = 1.06;
          const cl = K.part('clampBand', [FX, 0.1 + 0.79, 0], null, 'Clamp band + knob');
          K.tor(cl, [0.29, 0.018, 360], K.std(0x9aa0a6, { metalness: 0.8, roughness: 0.35 }), [0, 0, 0], [90, 0, 0]);
          K.cyl(cl, [0.025, 0.025, 0.08, 16], K.std(0x1b1d20), [0.0, 0, 0.32], [90, 0, 0]);
          K.cyl(cl, [0.04, 0.04, 0.03, 6], K.std(0x1b1d20), [0, 0, 0.37], [90, 0, 0]);
          const fl = K.part('filterLid', [FX, 0.1 + 0.79, 0], null, 'Filter lid (dome)');
          K.lathe(fl, [[0, 0.24], [0.1, 0.23], [0.2, 0.18], [0.27, 0.1], [0.285, 0.0], [0, 0]], tankM);
          const ar = K.part('airRelief', [FX, 0.1 + 0.79 + 0.24, 0], null, 'Air-relief valve');
          K.cyl(ar, [0.03, 0.03, 0.04, 16], 'black', [0, 0.02, 0]);
          K.box(ar, [0.07, 0.015, 0.02], 'red', [0, 0.045, 0], null, 0.004);
          // ports at the bottom: inlet (−x), outlet (+x)
          run(K, suc, [[-0.85, 0.5, 0], [-0.85, 0.62, 0], [-0.35, 0.62, 0], [-0.35, 0.3, 0], [FX - 0.28, 0.3, 0]], 0.03, pvc);
          run(K, suc, [[FX + 0.28, 0.3, 0], [0.62, 0.3, 0], [0.62, 0.36, 0], [0.72, 0.36, 0]], 0.03, pvc);
          if (type === 'cart') {
            const c = K.part('cartridge', [FX, 0.1 + 0.45, 0], null, 'Pleated cartridge');
            pleated(K, c, 0.2, 0.66, [0, 0, 0], 0x2b6fb3);
            const nz = K.part('nozzle', [0, 0, 0], null, 'Hose + cartridge-cleaning nozzle');
            K.tube(nz, [[1.6, 0.02, 1.6], [1.2, 0.02, 1.0], [0.9, 0.3, 0.7], [0.75, 0.75, 0.62]], 0.012, 'green');
            K.cyl(nz, [0.02, 0.018, 0.16, 16], plastic(K, 0x2a6db0), [0.73, 0.82, 0.6], [0, 0, 20]);
            const sk = K.part('soak', [-0.2, 0.0, 0.95], null, 'Cleaner soak (overnight)');
            K.cyl(sk, [0.25, 0.22, 0.75, 32, true], K.std(0x2f6fd0, { roughness: 0.5, side: THREE.DoubleSide }), [0, 0.375, 0]);
            K.cyl(sk, [0.235, 0.235, 0.005, 32], K.std(0x9fc4a8, { transparent: true, opacity: 0.8 }), [0, 0.65, 0]);
          } else {
            const gr = K.part('grids', [FX, 0.1 + 0.45, 0], null, 'DE grids (8 fabric fins on a manifold)');
            const fab = K.std(0xf4f4ef, { roughness: 0.95 });
            K.rep(8, (i) => {
              const a = i * 45;
              const w = K.group(gr, [0, 0, 0], [0, a, 0]);
              K.ext(w, [[0.03, -0.31], [0.2, -0.31], [0.24, -0.25], [0.24, 0.25], [0.2, 0.31], [0.03, 0.31]], 0.03, fab, [0, 0, -0.015], null, 0.006);
            });
            K.cyl(gr, [0.25, 0.25, 0.04, 32], K.std(0x5b6168), [0, 0.34, 0]);
            K.cyl(gr, [0.03, 0.03, 0.7, 16], 'grey', [0, 0, 0]);
            const pp = K.part('pushPull', [0.62, 0.36, 0.0], null, 'Push-pull backwash valve');
            K.cyl(pp, [0.05, 0.05, 0.28, 20], K.std(0x2b2e33), [0, 0.14, 0]);
            const pph = K.part('ppHandle', [0.62, 0.36 + 0.3, 0], null, 'Push-pull handle');
            K.cyl(pph, [0.01, 0.01, 0.12, 10], 'chrome', [0, 0.04, 0]);
            K.box(pph, [0.12, 0.02, 0.03], 'black', [0, 0.1, 0], null, 0.006);
            const wh = K.part('wasteHose', [0, 0, 0], null, 'Backwash hose');
            K.tube(wh, [[0.62, 0.36, 0.05], [0.66, 0.2, 0.4], [0.72, 0.02, 0.9], [0.9, 0.02, 1.8], [1.2, 0.02, 2.4]], 0.035, K.std(0x2f6fd0, { roughness: 0.6 }));
            const de = K.part('deBag', [-0.3, 0.1, 0.55], null, 'DE powder + 1-lb coffee-can scoop');
            K.box(de, [0.32, 0.4, 0.14], K.std(0xece6d5, { roughness: 1 }), [0, 0.2, 0], [0, 15, 0], 0.03);
            K.cyl(de, [0.06, 0.06, 0.12, 20], 'steel', [0.28, 0.06, 0.05]);
            const nz = K.part('nozzle', [0, 0, 0], null, 'Hose to rinse the grids');
            K.tube(nz, [[1.6, 0.02, 1.6], [1.2, 0.02, 1.0], [0.9, 0.3, 0.7], [0.75, 0.75, 0.62]], 0.012, 'green');
            K.cyl(nz, [0.02, 0.018, 0.16, 16], plastic(K, 0x2a6db0), [0.73, 0.82, 0.6], [0, 0, 20]);
          }
        }
        // Pressure gauge (sand: on the multiport)
        const gauge = K.part('gauge', type === 'sand' ? [FX + 0.06, 1.08, 0.1] : [FX + 0.1, 1.1, 0.08], null, 'Pressure gauge (psi)');
        K.cyl(gauge, [0.035, 0.035, 0.02, 24], 'chrome', [0, 0.03, 0], [70, 0, 0]);
        K.cyl(gauge, [0.03, 0.03, 0.022, 24], K.std(0xffffff, { roughness: 0.4 }), [0, 0.03, 0.002], [70, 0, 0]);
        const needle = K.box(gauge, [0.002, 0.024, 0.002], 'red', [0, 0.03, 0.015], [70, 0, 0], 0);
        K.cyl(gauge, [0.008, 0.008, 0.04, 8], 'brass', [0, 0.0, 0]);
        // Discharge from pump volute into the system
        // Heater
        const heater = K.part('heater', [1.05, 0.1, 0], null, 'Gas heater (400k BTU)');
        K.box(heater, [0.62, 0.8, 0.62], K.std(0x5d6268, { roughness: 0.45, metalness: 0.3 }), [0, 0.4, 0], null, 0.02);
        K.box(heater, [0.5, 0.04, 0.5], 'dark', [0, 0.82, 0], null, 0.01);
        K.rep(10, (i) => K.box(heater, [0.5, 0.008, 0.01], 'black', [0, 0.45 + i * 0.03, 0.315], null, 0));
        K.box(heater, [0.1, 0.06, 0.006], 'screen', [0.18, 0.7, 0.312], null, 0);
        const ret = K.part('returnLine', [0, 0, 0], null, 'Return line back to the pool');
        run(K, ret, [[1.36, 0.36, 0], [1.5, 0.36, 0], [1.5, 0, 0]], 0.03, pvc);
        K.tube(ret, [[1.36, 0.5, -0.25], [1.5, 0.5, -0.4], [1.6, 0.0, -0.5]], 0.01, K.std(0xc9a227, { metalness: 0.6, roughness: 0.4 }));
        // Automation / timer on a post
        const tm = K.part('timer', [-1.25, 0.95, -0.85], null, 'Timer / automation panel');
        K.box(tm, [0.32, 0.4, 0.12], K.std(0xb9bdc1, { roughness: 0.5 }), [0, 0, 0], null, 0.01);
        K.box(tm, [0.12, 0.05, 0.004], 'screen', [0, 0.08, 0.062], null, 0);
        K.tube(tm, [[0.08, -0.2, 0.0], [0.15, -0.6, 0.2], [0.35, -0.75, 0.6], [0.5, -0.65, 0.85]], 0.012, 'dark');
        // Garden hose (to fill the pump pot)
        const hf = K.part('hoseFill', [0, 0, 0], null, 'Garden hose (fill the pot)');
        K.tube(hf, [[-2.0, 0.02, 1.6], [-1.4, 0.02, 1.1], [-1.15, 0.45, 0.4], [-1.07, 0.6, 0.05], [-1.07, 0.46, 0.0]], 0.012, 'green');
        const lube = K.part('lube', [-0.45, 0.1, 0.45], null, 'Silicone O-ring lube');
        K.cyl(lube, [0.025, 0.025, 0.12, 16], plastic(K, 0xf2f2ee), [0, 0.06, 0], [0, 0, 90]);
        K.cone(lube, [0.01, 0.04, 12], plastic(K, 0x2b6fb3), [0.08, 0.06, 0], [0, 0, -90]);
        const flow = [];
        K.rep(6, (i) => {
          const b = K.sph(null, 0.01, K.std(0xffffff, { transparent: true, opacity: 0.8 }), [-0.22 - 0.85, 0.35, 0]);
          b.userData.noPick = true;
          b.visible = false;
          flow.push(b);
        });
        return {
          tick(t, fx) {
            const psi = fx === 'dirty' ? 0.9 : fx === 'clean' ? -0.2 : 0.2;
            needle.rotation.set(70 * K.DEG, 0, -psi + Math.sin(t * 3) * 0.02);
            flow.forEach((b, i) => {
              b.visible = fx === 'air';
              const k = (t * 0.6 + i / 6) % 1;
              b.position.set(-1.07 + Math.sin(i * 2) * 0.04, 0.22 + k * 0.17, Math.cos(i * 3) * 0.04);
            });
          },
        };
      }
    );
  padModel('poolPadSand', 'sand');
  padModel('poolPadCart', 'cart');
  padModel('poolPadDE', 'de');

  /* =========================================================================
     HOT TUB — 7×7 ft acrylic spa (2.13 m), 36″ tall, ~400 gal.
     ========================================================================= */
  TB.model(
    'hotTub',
    {
      unit: 1,
      env: 'garden',
      cam: [3.4, 2.6, 3.6],
      at: [0, 0.55, 0],
      ground: { tex: 'wood_floor_deck', repeat: 6, radius: 8 },
      tex: ['wood_floor_deck', 'wood_planks'],
      hidden: ['subPump', 'flushBottle', 'fillHose', 'soakBucket', 'chems', 'newFilter', 'bubbles'],
    },
    (K) => {
      const S = 1.065;
      const H = 0.92;
      const acryl = K.phys(0xe8eef2, { roughness: 0.15, clearcoat: 1 });
      const cab = K.pbr('wood_planks', [0.6, 1], { color: 0x6b5240 }, 'woodDark');
      const shell = K.part('shell', [0, 0, 0], null, 'Acrylic shell + cabinet');
      [-1, 1].forEach((s) => {
        K.box(shell, [2 * S, H - 0.06, 0.04], cab, [0, (H - 0.06) / 2, s * (S - 0.02)], null, 0.006);
        K.box(shell, [0.04, H - 0.06, 2 * S], cab, [s * (S - 0.02), (H - 0.06) / 2, 0], null, 0.006);
      });
      K.rep(14, (i) => K.box(shell, [0.006, H - 0.12, 0.004], K.std(0x4a3a2c), [-S + 0.15 * i + 0.1, H / 2, S + 0.001], null, 0));
      K.box(shell, [2 * S, 0.06, 2 * S], K.std(0x2a2b2d), [0, 0.03, 0], null, 0.01);
      const sq = (r) => {
        const pts = [];
        const c = 0.25;
        [[r - c, r - c, 0], [-r + c, r - c, 90], [-r + c, -r + c, 180], [r - c, -r + c, 270]].forEach(([x, y, a0]) => {
          for (let k = 0; k <= 6; k++) {
            const a = ((a0 + (k * 90) / 6) * Math.PI) / 180;
            pts.push([x + Math.cos(a) * c, y + Math.sin(a) * c]);
          }
        });
        return pts;
      };
      K.ext(shell, sq(S + 0.01), 0.05, acryl, [0, H + 0.03, 0], [90, 0, 0], 0.01, [sq(0.88).reverse()]);
      // Interior: walls, seats, footwell
      [-1, 1].forEach((s) => {
        K.box(shell, [1.76, 0.82, 0.02], acryl, [0, 0.47, s * 0.87], null, 0);
        K.box(shell, [0.02, 0.82, 1.76], acryl, [s * 0.87, 0.47, 0], null, 0);
      });
      K.box(shell, [1.74, 0.02, 1.74], acryl, [0, 0.08, 0], null, 0);
      const seatM = K.phys(0xdfe6ea, { roughness: 0.2, clearcoat: 1 });
      [[0, -0.66, 1.7, 0.4], [0, 0.66, 1.7, 0.4]].forEach(([x, z, w, d]) => K.box(shell, [w, 0.42, d], seatM, [x, 0.29, z], null, 0.05));
      [-0.66, 0.66].forEach((x) => K.box(shell, [0.4, 0.42, 0.92], seatM, [x, 0.29, 0], null, 0.05));
      // Jets
      const jets = K.part('jets', [0, 0, 0], null, 'Jets (32)');
      const jetAt = (p, rot) => {
        const j = K.group(jets, p, rot);
        K.cyl(j, [0.03, 0.03, 0.012, 24], 'chrome', [0, 0, 0], [90, 0, 0]);
        K.cyl(j, [0.014, 0.014, 0.014, 16], 'dark', [0, 0, 0.002], [90, 0, 0]);
      };
      [-0.5, -0.2, 0.2, 0.5].forEach((x) => [0.62, 0.78].forEach((y) => { jetAt([x, y, -0.855], [0, 0, 0]); jetAt([x, y, 0.855], [0, 180, 0]); }));
      [-0.25, 0.25].forEach((z) => [0.62, 0.78].forEach((y) => { jetAt([0.855, y, z], [0, -90, 0]); jetAt([-0.855, y, z], [0, 90, 0]); }));
      // Filter compartment (front-left corner) — skimmer weir + cartridge
      const fw = K.part('filterWell', [-0.62, 0, 0.86], null, 'Filter compartment + skimmer weir');
      K.box(fw, [0.26, 0.12, 0.01], 'dark', [0, 0.82, -0.004], null, 0);
      K.box(fw, [0.24, 0.09, 0.008], acryl, [0, 0.8, -0.01], [-15, 0, 0], 0);
      K.cyl(fw, [0.13, 0.13, 0.02, 32], K.std(0x3b3f45, { roughness: 0.5 }), [0, H + 0.065, 0.12]);
      const filt = K.part('filter', [-0.62, 0.84, 0.98], null, 'Spa filter cartridge (50 sq ft)');
      pleated(K, filt, 0.085, 0.24, [0, -0.12, 0], 0x2f3338);
      const nf = K.part('newFilter', [1.5, 0.0, 1.35], null, 'Spare cartridge (rotate filters)');
      pleated(K, nf, 0.085, 0.24, [0, 0.12, 0], 0x2f3338);
      // Topside control
      const panel = K.part('panel', [0.55, H + 0.065, 0.97], null, 'Topside control panel');
      K.box(panel, [0.24, 0.03, 0.1], K.std(0x2a2b2d), [0, 0, 0], null, 0.01);
      K.box(panel, [0.08, 0.004, 0.04], 'screen', [0, 0.016, 0], null, 0);
      [-0.08, 0.08].forEach((x) => K.cyl(panel, [0.012, 0.012, 0.006, 16], 'grey', [x, 0.017, 0]));
      // Water
      const water = K.part('water', [0, 0, 0], null, 'Spa water (≈400 gal)');
      K.box(water, [1.72, 0.004, 1.72], K.phys(0x5ec3df, { transparent: true, opacity: 0.45, roughness: 0.03, clearcoat: 1, depthWrite: false }), [0, 0.8, 0], null, 0);
      K.box(water, [1.72, 0.7, 1.72], K.std(0x3aa8c8, { transparent: true, opacity: 0.16, depthWrite: false }), [0, 0.45, 0], null, 0);
      const bubbles = K.part('bubbles', [0, 0, 0], null, 'Jets running');
      const bub = [];
      K.rep(24, (i) => {
        const b = K.sph(bubbles, 0.015, K.std(0xffffff, { transparent: true, opacity: 0.7 }), [0, 0, 0]);
        b.userData.noPick = true;
        bub.push(b);
      });
      // Cover
      const cover = K.part('cover', [0, H + 0.08, 0], null, 'Insulated cover (fold-over)');
      const vinyl = K.std(0x5a4a3c, { roughness: 0.75 });
      [-1, 1].forEach((s) => K.box(cover, [2 * S + 0.04, 0.1, S + 0.01], vinyl, [0, 0.03, s * (S / 2 + 0.005)], [s * 1.5, 0, 0], 0.04));
      K.box(cover, [2 * S + 0.04, 0.02, 0.02], K.std(0x3a2f26), [0, 0.07, 0], null, 0);
      [-0.6, 0.6].forEach((x) => K.box(cover, [0.2, 0.02, 0.05], 'black', [x, 0.03, S + 0.04], null, 0.006));
      // Drain spigot & hose
      const drain = K.part('drain', [0.6, 0.12, S + 0.01], null, 'Drain spigot (behind front panel)');
      K.cyl(drain, [0.02, 0.02, 0.08, 16], 'grey', [0, 0, 0.04], [90, 0, 0]);
      K.cyl(drain, [0.026, 0.026, 0.02, 16], 'black', [0, 0, 0.085], [90, 0, 0]);
      const hose = K.part('hose', [0, 0, 0], null, 'Garden hose to a drain or lawn');
      K.tube(hose, [[0.6, 0.12, S + 0.1], [0.7, 0.03, S + 0.4], [1.2, 0.02, S + 0.9], [2.2, 0.02, S + 1.4], [3.0, 0.02, S + 1.2]], 0.014, 'green');
      const sp = K.part('subPump', [0, 0.09, 0], null, 'Submersible utility pump');
      K.cyl(sp, [0.08, 0.09, 0.2, 24], K.std(0x2a6db0, { roughness: 0.5 }), [0, 0.1, 0]);
      K.tube(sp, [[0, 0.2, 0], [0.1, 0.6, -0.3], [0.2, 1.05, -0.95], [0.5, 1.0, -1.3], [1.2, 0.05, -1.6]], 0.016, 'black');
      const fb = K.part('flushBottle', [-0.3, H + 0.06, -0.97], null, 'Line-flush cleaner');
      jug(K, fb, [0, 0, 0], 0xf2f2ee, 0xd03a2e, 0.22);
      const fh = K.part('fillHose', [0, 0, 0], null, 'Fill hose in the filter well (with pre-filter)');
      K.tube(fh, [[-3.0, 0.02, 2.4], [-1.8, 0.02, 1.9], [-0.9, 0.5, 1.4], [-0.66, 1.05, 1.05], [-0.62, 0.95, 0.98]], 0.014, 'green');
      K.cyl(fh, [0.04, 0.04, 0.12, 20], plastic(K, 0xf2f2ee), [-1.35, 0.02, 1.68], [0, 0, 90]);
      const sb = K.part('soakBucket', [1.35, 0, 0.0], null, 'Filter soak bucket (cleaner solution)');
      K.cyl(sb, [0.15, 0.13, 0.36, 28, true], K.std(0xf0f0ea, { roughness: 0.5, side: THREE.DoubleSide }), [0, 0.18, 0]);
      K.cyl(sb, [0.14, 0.14, 0.005, 28], K.std(0x9fc4a8, { transparent: true, opacity: 0.85 }), [0, 0.3, 0]);
      const ch = K.part('chems', [0.2, H + 0.06, -0.97], null, 'Start-up chemicals + test strips');
      jug(K, ch, [0, 0, 0], 0xf2f2ee, 0x2a6db0, 0.18);
      K.cyl(ch, [0.04, 0.04, 0.12, 20], plastic(K, 0x2a6db0), [0.18, 0.06, 0]);
      // GFCI spa disconnect on a post
      const gf = K.part('gfci', [1.75, 0, -0.8], null, 'GFCI spa disconnect (50 A)');
      K.box(gf, [0.09, 1.3, 0.09], K.pbr('wood_planks', [0.2, 1], { color: 0xc89466 }, 'wood'), [0, 0.65, 0], null, 0.005);
      K.box(gf, [0.2, 0.3, 0.1], K.std(0x9aa0a6, { roughness: 0.4 }), [0, 1.1, 0.09], null, 0.01);
      K.box(gf, [0.06, 0.04, 0.01], 'black', [0, 1.12, 0.145], null, 0.004);
      K.box(gf, [0.012, 0.012, 0.004], 'red', [0.05, 1.18, 0.145], null, 0);
      K.tube(gf, [[0, 0.95, 0.1], [0, 0.4, 0.12], [-0.2, 0.05, 0.3], [-0.6, 0.05, 0.7]], 0.012, 'grey');
      // Steps
      const st = K.group(null, [0, 0, S + 0.35]);
      K.box(st, [0.9, 0.2, 0.32], cab, [0, 0.1, 0.15], null, 0.01);
      K.box(st, [0.9, 0.4, 0.3], cab, [0, 0.2, -0.15], null, 0.01);
      return {
        tick(t, fx) {
          bub.forEach((b, i) => {
            const k = (t * 0.8 + i / 24) % 1;
            const side = i % 4;
            const u = ((i * 0.37) % 1) * 1.4 - 0.7;
            const p = [[u, -0.78 + k * 0.3], [u, 0.78 - k * 0.3], [0.78 - k * 0.3, u], [-0.78 + k * 0.3, u]][side];
            b.position.set(p[0], 0.6 + k * 0.2, p[1]);
          });
        },
      };
    }
  );
