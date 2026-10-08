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
      cam: [6.4, 5.4, 9.2],
      at: [0, -0.5, 0.4],
      tex: ['aerial_grass_rock', 'interlocking_concrete_pavers', 'granite_tile'],
      assets: ['shrub_01', 'potted_plant_01'],
      hidden: ['vacHead', 'vacPole', 'vacHose', 'vacPlate', 'brush', 'leafNet', 'sample', 'cover', 'plugs', 'gizzmo', 'blower', 'winterKit', 'debris', 'startKit'],
    },
    (K) => {
      const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
      // Ground & deck with the pool cut out
      K.ext(null, K.circle(0, 0, 16, 64), 0.05, K.pbr('aerial_grass_rock', [14, 14], {}, 'grass'), [0, 0, 0], [90, 0, 0], 0, [rect(-3.2, 3.2, -5.4, 5.4).reverse()]);
      const deck = K.part('deck', [0, 0, 0], null, 'Paver deck');
      K.ext(deck, rect(-3.2, 3.2, -5.4, 5.4), 0.08, K.pbr('interlocking_concrete_pavers', [4, 7], {}, 'concrete'), [0, 0.08, 0], [90, 0, 0], 0, [rect(-2.12, 2.12, -3.92, 3.92).reverse()]);
      const coping = K.part('coping', [0, 0, 0], null, 'Bullnose coping');
      K.ext(coping, rect(-2.12, 2.12, -3.92, 3.92), 0.06, K.std(0xd9d1c3, { roughness: 0.9 }), [0, 0.12, 0], [90, 0, 0], 0.01, [rect(-PX + 0.04, PX - 0.04, -PZ + 0.04, PZ - 0.04).reverse()]);
      // Shell: walls, floor, waterline tile
      const shell = K.part('shell', [0, 0, 0], null, 'Plaster pool shell');
      const plaster = K.std(0xb9e2f0, { roughness: 0.85 });
      [-1, 1].forEach((s) => K.box(shell, [0.12, 2.0, 2 * PZ + 0.24], plaster, [s * (PX + 0.06), -1.0, 0], null, 0));
      [-1, 1].forEach((s) => K.box(shell, [2 * PX, 2.0, 0.12], plaster, [0, -1.0, s * (PZ + 0.06)], null, 0));
      K.box(shell, [2 * PX, 0.1, 2.6], plaster, [0, -1.05, 2.3], null, 0);
      K.box(shell, [2 * PX, 0.1, Math.hypot(2, 0.9)], plaster, [0, -1.5, 0], [-24.2, 0, 0], 0);
      K.box(shell, [2 * PX, 0.1, 2.6], plaster, [0, -1.95, -2.3], null, 0);
      const tile = K.std(0x1f5f8b, { roughness: 0.3 });
      [-1, 1].forEach((s) => K.box(shell, [0.01, 0.15, 2 * PZ], tile, [s * (PX - 0.004), -0.1, 0], null, 0));
      [-1, 1].forEach((s) => K.box(shell, [2 * PX, 0.15, 0.01], tile, [0, -0.1, s * (PZ - 0.004)], null, 0));
      // Depth markers on the coping
      [[-1.95, 3.4], [-1.95, -3.4]].forEach(([x, z]) => K.box(shell, [0.12, 0.003, 0.2], 'navy', [x, 0.121, z], null, 0));
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
      const surf = K.phys(0x1f8fc4, { transparent: true, opacity: 0.34, roughness: 0.04, clearcoat: 1, depthWrite: false });
      const vol = K.std(0x1a88b8, { transparent: true, opacity: 0.18, depthWrite: false, roughness: 0.1 });
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
      K.box(vh, [0.46, 0.07, 0.16], K.std(0xffb020, { roughness: 0.45 }), [0, 0.045, 0], null, 0.02);
      K.rep(4, (i) => K.cyl(vh, [0.025, 0.025, 0.02, 16], 'dark', [-0.17 + (i % 2) * 0.34, 0.025, i < 2 ? -0.07 : 0.07], [90, 0, 0]));
      K.box(vh, [0.4, 0.02, 0.12], 'black', [0, 0.005, 0], null, 0.004);
      K.cyl(vh, [0.03, 0.03, 0.12, 16], K.std(0xffb020), [0, 0.11, 0.0], [30, 0, 0]);
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
      K.box(cover, [4.5, 0.006, 8.3], meshMat, [0, 0.13, 0], null, 0);
      K.rep(9, (i) => K.box(cover, [4.5, 0.008, 0.05], K.std(0x16362a, { roughness: 1 }), [0, 0.135, -3.8 + i * 0.95], null, 0));
      K.rep(9, (i) => [-1, 1].forEach((s) => K.cyl(cover, [0.015, 0.015, 0.02, 10], 'chrome', [s * 2.3, 0.145, -3.8 + i * 0.95])));
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
        cam: [2.6, 2.0, 3.6],
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
            K.tube(nz, [[1.6, 0.02, 1.6], [1.2, 0.02, 1.3], [0.85, 0.4, 1.0], [0.62, 0.8, 0.85]], 0.012, 'green');
            K.cyl(nz, [0.02, 0.018, 0.16, 16], plastic(K, 0x2a6db0), [0.56, 0.84, 0.84], [0, 0, 50]);
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

  /* =========================================================================
     SEASONAL — shared single-story house front (7 m wide, 2.7 m walls, 6/12 roof).
     Front face at z = 0, house spans x −4…3, z −6…0.
     ========================================================================= */
  const HX0 = -4;
  const HX1 = 3;
  const HW = 2.7;
  const house = (K, o) => {
    o = o || {};
    const sidingC = o.siding || 0xc9d3d8;
    const siding = K.std(sidingC, { roughness: 0.8 });
    const trim = K.std(0xf4f3ee, { roughness: 0.5 });
    const h = K.part('house', [0, 0, 0], null, 'House walls (lap siding)');
    K.box(h, [HX1 - HX0, HW, 6], siding, [(HX0 + HX1) / 2, HW / 2, -3], null, 0);
    K.rep(13, (i) => K.box(h, [HX1 - HX0 + 0.01, 0.012, 6.01], K.std(sidingC - 0x101010, { roughness: 0.85 }), [(HX0 + HX1) / 2, 0.4 + i * 0.18, -3], null, 0));
    K.box(h, [HX1 - HX0 + 0.04, 0.3, 6.04], 'concrete', [(HX0 + HX1) / 2, 0.15, -3], null, 0);
    [HX0, HX1].forEach((x) => K.box(h, [0.1, HW - 0.3, 0.1], trim, [x, HW / 2 + 0.15, 0.02], null, 0.004));
    // Gable ends
    [HX0 - 0.001, HX1 - 0.049].forEach((x) => K.ext(K.group(h, [x, 0, 0], [0, 90, 0]), [[-0.0, HW], [6.0, HW], [3.0, HW + 1.5]], 0.05, siding, [0, 0, 0], null, 0));
    // Roof
    const roof = K.part('roof', [0, 0, 0], null, 'Roof (asphalt shingles)');
    const shingle = K.std(0x4b4d52, { roughness: 0.95 });
    const L = Math.hypot(3.4, 1.7);
    K.box(roof, [HX1 - HX0 + 0.8, 0.08, L], shingle, [(HX0 + HX1) / 2, HW + 0.65 + 0.04, -1.3], [26.57, 0, 0], 0);
    K.box(roof, [HX1 - HX0 + 0.8, 0.08, L], shingle, [(HX0 + HX1) / 2, HW + 0.65 + 0.04, -4.7], [-26.57, 0, 0], 0);
    K.box(roof, [HX1 - HX0 + 0.8, 0.06, 0.25], K.std(0x3c3e42, { roughness: 0.95 }), [(HX0 + HX1) / 2, HW + 1.55, -3], null, 0);
    K.rep(12, (i) => K.box(roof, [HX1 - HX0 + 0.8, 0.006, 0.01], K.std(0x3a3c40), [(HX0 + HX1) / 2, HW - 0.15 + i * 0.14 + 0.08, 0.38 - i * 0.28], null, 0));
    // Rake trim on gables
    [HX0 - 0.4, HX1 + 0.4].forEach((x) => {
      K.bar(roof, [x, HW - 0.2, 0.4], [x, HW + 1.5, -3], 0.03, trim);
      K.bar(roof, [x, HW - 0.2, -6.4], [x, HW + 1.5, -3], 0.03, trim);
    });
    // Fascia + gutter
    K.box(roof, [HX1 - HX0 + 0.8, 0.16, 0.025], trim, [(HX0 + HX1) / 2, HW - 0.24, 0.42], null, 0);
    const gut = K.part('gutter', [0, 0, 0], null, 'Gutter (5″ K-style)');
    const al = K.std(0xf2f2ee, { roughness: 0.4 });
    const gx = (HX0 + HX1) / 2;
    const GW = HX1 - HX0 + 0.8;
    K.box(gut, [GW, 0.012, 0.13], al, [gx, HW - 0.33, 0.5], null, 0);
    K.box(gut, [GW, 0.13, 0.012], al, [gx, HW - 0.27, 0.565], null, 0);
    K.box(gut, [GW, 0.02, 0.02], al, [gx, HW - 0.205, 0.565], null, 0);
    K.box(gut, [GW, 0.13, 0.008], al, [gx, HW - 0.27, 0.438], null, 0);
    [HX0 - 0.4, HX1 + 0.4].forEach((x) => K.box(gut, [0.01, 0.13, 0.13], al, [x, HW - 0.27, 0.5], null, 0));
    const ds = K.part('downspout', [0, 0, 0], null, 'Downspout (2×3″)');
    const dx = HX0 - 0.15;
    K.box(ds, [0.075, 0.06, 0.32], al, [dx, HW - 0.42, 0.28], [30, 0, 0], 0.004);
    K.box(ds, [0.075, HW - 0.7, 0.05], al, [dx, (HW - 0.4) / 2 + 0.15, 0.08], null, 0.004);
    K.box(ds, [0.075, 0.05, 0.25], al, [dx, 0.17, 0.2], [-30, 0, 0], 0.004);
    // Windows
    const win = K.part('windows', [0, 0, 0], null, 'Windows');
    const glass = K.phys(0x9db6c4, { roughness: 0.05, metalness: 0.2, clearcoat: 1 });
    (o.windows || [-2.6, 1.7]).forEach((x) => {
      K.box(win, [1.2, 1.25, 0.04], trim, [x, 1.55, 0.02], null, 0.004);
      K.box(win, [1.06, 1.1, 0.03], glass, [x, 1.55, 0.04], null, 0);
      K.box(win, [0.03, 1.1, 0.035], trim, [x, 1.55, 0.05], null, 0);
      K.box(win, [1.06, 0.03, 0.035], trim, [x, 1.55, 0.05], null, 0);
      K.box(win, [1.34, 0.05, 0.1], trim, [x, 0.9, 0.05], null, 0.006);
      [-1, 1].forEach((s) => K.box(win, [0.38, 1.25, 0.03], K.std(o.shutter || 0x2f4a6b, { roughness: 0.6 }), [x + s * 0.8, 1.55, 0.03], null, 0.004));
    });
    // Door + stoop + porch light
    const door = K.part('door', [-0.3, 0, 0], null, 'Front door');
    K.box(door, [1.1, 2.18, 0.05], trim, [0, 1.09 + 0.3, 0.02], null, 0.004);
    K.box(door, [0.92, 2.03, 0.05], K.std(o.door || 0x7a2e2e, { roughness: 0.4 }), [0, 1.02 + 0.3, 0.035], null, 0.006);
    [[0.6, -0.2], [0.6, 0.2], [1.5, -0.2], [1.5, 0.2]].forEach(([y, x]) => K.box(door, [0.3, 0.55, 0.01], K.std((o.door || 0x7a2e2e) - 0x101010), [x, y + 0.3, 0.065], null, 0.004));
    K.sph(door, 0.03, 'brass', [0.36, 1.3, 0.08]);
    K.box(null, [1.6, 0.3, 1.0], 'concrete', [-0.3, 0.15, 0.5], null, 0.01);
    K.box(door, [0.12, 0.25, 0.1], blackMetal(K), [0.75, 2.0, 0.06], null, 0.01);
    K.box(door, [0.08, 0.14, 0.06], glow(K, 0xfff1cc, 0.6), [0.75, 1.98, 0.1], null, 0.004);
    // Exterior GFCI outlet with in-use cover
    const out = K.part('outlet', [1.0, 0.5, 0.0], null, 'Exterior GFCI outlet (in-use cover)');
    K.box(out, [0.1, 0.16, 0.03], K.std(0xf4f3ee, { roughness: 0.4 }), [0, 0, 0.015], null, 0.004);
    K.box(out, [0.1, 0.16, 0.07], K.std(0xdfe0dc, { transparent: true, opacity: 0.55, roughness: 0.2 }), [0, 0, 0.06], null, 0.008);
    K.box(out, [0.04, 0.012, 0.004], 'red', [0, 0.02, 0.032], null, 0);
    // Shrubs
    if (o.shrubs !== false) {
      const sh = K.part('shrubs', [0, 0, 0], null, 'Foundation shrubs');
      [-3.4, -1.7, 1.0, 2.4].forEach((x, i) => K.glb(sh, i % 2 ? 'shrub_02' : 'shrub_01', { height: 0.9, node: i % 2 ? 'shrub_02_a' : undefined }, [x, 0, 0.55]) || K.sph(sh, 0.45, K.std(0x3f6b2a, { roughness: 1 }), [x, 0.4, 0.55], [1.2, 0.9, 1]));
    }
    // Front walk
    K.box(null, [1.2, 0.03, 4], K.pbr('interlocking_concrete_pavers', [1, 3], {}, 'concrete'), [-0.3, 0.015, 3.0], null, 0.004);
    return { gutter: gut, roof };
  };

  /* ---------------- Hose bib (standard / frost-free) ---------------- */
  // Wall at z = 0 (exterior +z). Foundation to y 0.5, rim joist 0.5–0.74, siding above.
  const bibModel = (name, ff) =>
    TB.model(
      name,
      {
        unit: 1,
        env: 'garden',
        cam: [0.8, 0.95, 1.25],
        at: [0, 0.5, 0.05],
        ground: { tex: 'forrest_ground_01', repeat: 6, radius: 6 },
        tex: ['forrest_ground_01', 'wood_planks', 'brushed_concrete'],
        hidden: ['cover', 'insulation', 'bucket', 'newBib'],
      },
      (K) => {
        const siding = K.std(0xc9d3d8, { roughness: 0.8 });
        const wall = K.part('wall', [0, 0, 0], null, 'Exterior wall (siding over sheathing)');
        K.box(wall, [2.4, 1.35, 0.03], siding, [0, 1.175, 0.015], null, 0);
        K.rep(7, (i) => K.box(wall, [2.4, 0.02, 0.012], K.std(0xb6c0c5), [0, 0.68 + i * 0.18, 0.034], null, 0));
        K.box(wall, [2.4, 0.04, 0.05], K.std(0xf4f3ee), [0, 0.52, 0.025], null, 0.004);
        const fnd = K.part('foundation', [0, 0, 0], null, 'Foundation wall');
        K.box(fnd, [2.4, 0.5, 0.25], K.pbr('brushed_concrete', [1.5, 0.5], {}, 'concrete'), [0, 0.25, -0.1], null, 0.004);
        // Basement / interior side (z < 0)
        const fr = K.part('framing', [0, 0, 0], null, 'Sill, rim joist & floor joists (inside)');
        const lum = K.pbr('wood_planks', [0.3, 1], { color: 0xd9b98a }, 'woodLight');
        K.box(fr, [2.4, 0.04, 0.14], lum, [0, 0.52, -0.07], null, 0.003);
        K.box(fr, [2.4, 0.235, 0.038], lum, [0, 0.66, -0.02], null, 0.003);
        [-0.81, -0.4, 0.4, 0.81].forEach((x) => K.box(fr, [0.038, 0.235, 1.2], lum, [x, 0.66, -0.64], null, 0.003));
        K.box(fr, [2.4, 0.02, 1.25], K.pbr('wood_planks', [1, 1], { color: 0xc9b089 }, 'wood'), [0, 0.79, -0.62], null, 0);
        K.box(null, [2.4, 0.01, 1.3], K.std(0x9b9a94, { roughness: 1 }), [0, 0.005, -0.88], null, 0);
        const by = 0.62;
        const brassM = K.std(0xc9a640, { metalness: 0.9, roughness: 0.3 });
        const copper = 'copper';
        // Supply pipe inside: comes along the wall low, rises to the valve, then through the rim
        const pipe = K.part('pipe', [0, 0, 0], null, '½″ copper supply (inside)');
        const inner = ff ? -0.33 : -0.06;
        run(K, pipe, [[-1.2, 0.3, -0.25], [0, 0.3, -0.25], [0, 0.42, -0.25]], 0.009, copper);
        run(K, pipe, [[0, 0.52, -0.25], [0, by, -0.25], [0, by, inner]], 0.009, copper);
        // Interior shutoff with bleed cap
        const sv = K.part('shutoff', [0, 0.47, -0.25], null, 'Interior shutoff (stop & waste)');
        K.box(sv, [0.05, 0.1, 0.045], brassM, [0, 0, 0], null, 0.01);
        K.cyl(sv, [0.012, 0.012, 0.05, 12], brassM, [0, 0, -0.04], [90, 0, 0]);
        const sh = K.part('shutoffHandle', [0, 0.47, -0.31], null, 'Shutoff handle');
        K.box(sh, [0.11, 0.02, 0.012], 'red', [0.03, 0, 0.0], null, 0.004);
        const bc = K.part('bleedCap', [0.034, 0.5, -0.25], null, 'Bleed cap (drain port)');
        K.cyl(bc, [0.008, 0.008, 0.022, 10], brassM, [0.008, 0, 0], [0, 0, 90]);
        const bk = K.part('bucket', [0.15, 0.01, -0.35], null, 'Bucket under the bleed cap');
        K.cyl(bk, [0.13, 0.11, 0.3, 24, true], K.std(0xe8833a, { roughness: 0.5, side: THREE.DoubleSide }), [0, 0.15, 0]);
        const ins = K.part('insulation', [0, 0, 0], null, 'Foam pipe insulation');
        K.bar(ins, [-1.1, 0.3, -0.25], [-0.03, 0.3, -0.25], 0.02, K.std(0x2a2b2d, { roughness: 1 }));
        K.bar(ins, [0, by, -0.2], [0, by, inner - 0.01], 0.02, K.std(0x2a2b2d, { roughness: 1 }));
        // Bib (exterior)
        const bib = K.part('bib', [0, by, 0.0], null, ff ? 'Frost-free sillcock (12″)' : 'Standard hose bib');
        if (ff) {
          K.cyl(bib, [0.014, 0.014, 0.32, 16], brassM, [0, -0.005, -0.16], [92, 0, 0]);
          K.cyl(bib, [0.02, 0.02, 0.04, 16], brassM, [0, -0.012, -0.33], [92, 0, 0]);
          K.box(bib, [0.09, 0.09, 0.01], brassM, [0, 0, 0.04], null, 0.006);
          K.cyl(bib, [0.015, 0.015, 0.025, 16], 'chrome', [0, 0.04, 0.08]);
          K.box(bib, [0.03, 0.006, 0.02], 'dark', [0, 0.054, 0.08], null, 0);
        } else {
          K.box(bib, [0.07, 0.07, 0.01], brassM, [0, 0, 0.04], null, 0.006);
        }
        K.cyl(bib, [0.018, 0.018, 0.06, 16], brassM, [0, 0, 0.07], [90, 0, 0]);
        K.sph(bib, 0.025, brassM, [0, 0, 0.1]);
        K.cyl(bib, [0.014, 0.016, 0.06, 16], brassM, [0, -0.04, 0.115]);
        K.rep(5, (i) => K.tor(bib, [0.016, 0.002], brassM, [0, -0.05 - i * 0.008, 0.115], [90, 0, 0]));
        const hd = K.part('handle', [0, by, 0.145], null, 'Handle');
        K.cyl(hd, [0.008, 0.008, 0.03, 10], brassM, [0, 0, -0.01], [90, 0, 0]);
        K.tor(hd, [0.035, 0.007, 360], K.std(0x2f6fd0, { roughness: 0.5 }), [0, 0, 0.005], [0, 0, 0]);
        K.rep(4, (i) => K.box(hd, [0.07, 0.008, 0.006], K.std(0x2f6fd0), [0, 0, 0.005], [0, 0, i * 45], 0));
        // Hose attached
        const hose = K.part('hose', [0, 0, 0], null, 'Garden hose (traps water if left on)');
        K.cyl(hose, [0.02, 0.02, 0.03, 16], brassM, [0, by - 0.085, 0.115]);
        K.tube(hose, [[0, by - 0.1, 0.115], [0, 0.35, 0.16], [0.1, 0.06, 0.3], [0.4, 0.03, 0.5], [0.7, 0.03, 0.4], [0.6, 0.03, 0.15]], 0.014, 'green');
        K.rep(3, (i) => K.tor(hose, [0.25 + i * 0.03, 0.014], 'green', [0.85, 0.02 + i * 0.028, 0.45], [90, 0, 0]));
        // Foam cover
        const cv = K.part('cover', [0, by, 0.0], null, 'Insulated faucet cover');
        K.box(cv, [0.17, 0.2, 0.15], K.std(0xf2f2ee, { roughness: 0.95 }), [0, -0.02, 0.08], null, 0.03);
        K.box(cv, [0.18, 0.004, 0.01], 'black', [0, 0.04, 0.155], null, 0);
        // For the upgrade step: new frost-free bib in the box
        const nb = K.part('newBib', [0.6, 0.01, 0.6], null, 'New frost-free sillcock (to upgrade)');
        K.box(nb, [0.45, 0.08, 0.12], K.std(0xb48a5a, { roughness: 0.95 }), [0, 0.04, 0], null, 0.004);
        K.cyl(nb, [0.012, 0.012, 0.35, 12], brassM, [0, 0.1, 0], [0, 0, 90]);
        const drip1 = K.drip(null, [0, by - 0.085, 0.115], by - 0.1);
        const drip2 = K.drip(null, [0.05, 0.495, -0.25], 0.18);
        return {
          tick(t, fx) {
            drip1.tick(t, fx === 'drain', 0.9);
            drip2.tick(t + 0.3, fx === 'bleed', 1.2);
          },
        };
      }
    );
  bibModel('hoseBibStd', false);
  bibModel('hoseBibFF', true);

  /* ---------------- Winter-ready house walkthrough ---------------- */
  const HG = { unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 12, radius: 14 }, tex: ['aerial_grass_rock', 'interlocking_concrete_pavers', 'brushed_concrete', 'wood_planks'], assets: ['shrub_01', 'shrub_02'] };
  const leaves = (K, g, x0, x1, y, z, n) =>
    K.rep(n, (i) => K.box(g, [0.07, 0.02, 0.05], K.std(i % 3 ? 0x6b4a22 : 0x8a6a2a, { roughness: 1 }), [x0 + ((x1 - x0) * (i + Math.sin(i * 7) * 0.4)) / n, y + (i % 3) * 0.012, z + Math.sin(i * 3.1) * 0.03], [i * 13, i * 41, 0], 0));
  const condenser = (K, g, p, s) => {
    const u = K.group(g, p);
    s = s || 0.76;
    const h = s * 0.95;
    const cab = K.std(0xbfc3bd, { roughness: 0.5, metalness: 0.2 });
    K.box(u, [s + 0.15, 0.08, s + 0.15], 'concrete', [0, 0.04, 0], null, 0.01);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => K.box(u, [0.06, h, 0.06], cab, [(a * s) / 2, 0.08 + h / 2, (b * s) / 2], null, 0.006));
    const fin = K.std(0x50565c, { roughness: 0.6, metalness: 0.4 });
    const fins = K.group(u, [0, 0, 0]);
    [0, 90, 180, 270].forEach((ry) => {
      const f = K.group(fins, [0, 0.08 + h / 2, 0], [0, ry, 0]);
      K.box(f, [s - 0.06, h - 0.12, 0.02], fin, [0, 0, s / 2 - 0.03], null, 0);
      K.rep(28, (i) => K.box(f, [0.004, h - 0.12, 0.012], 'grey', [-(s - 0.08) / 2 + (i * (s - 0.08)) / 27, 0, s / 2 - 0.012], null, 0));
      K.rep(6, (i) => K.box(f, [s - 0.06, 0.004, 0.004], 'black', [0, -h / 2 + 0.1 + i * 0.12, s / 2 - 0.002], null, 0));
    });
    K.box(u, [s + 0.02, 0.05, s + 0.02], cab, [0, 0.08 + h, 0], null, 0.01);
    K.cyl(u, [s * 0.4, s * 0.4, 0.012, 40], 'dark', [0, 0.11 + h, 0]);
    K.rep(5, (i) => K.tor(u, [0.06 + i * 0.06, 0.004, 360], 'black', [0, 0.125 + h, 0], [90, 0, 0]));
    K.rep(4, (i) => K.box(u, [s * 0.82, 0.006, 0.006], 'black', [0, 0.125 + h, 0], [0, i * 45, 0], 0));
    const fan = K.group(u, [0, 0.07 + h, 0]);
    K.rep(3, (i) => K.box(K.group(fan, [0, 0, 0], [0, i * 120, 0]), [0.24, 0.006, 0.1], 'black', [0.14, 0, 0], [18, 0, 0], 0.004));
    K.cyl(fan, [0.05, 0.05, 0.05, 20], 'black', [0, 0, 0]);
    return { u, fins, fan, h };
  };

  TB.model(
    'winterHome',
    Object.assign({}, HG, { cam: [7.0, 4.2, 9.5], at: [0.6, 1.4, 0], hidden: ['extension', 'bibCover', 'acCover', 'caulk', 'sweep', 'snowKit', 'newFilter'] }),
    (K) => {
      const H = house(K, {});
      // Garage (open door) on the right
      const gar = K.part('garage', [0, 0, 0], null, 'Attached garage (door open)');
      const siding = K.std(0xc9d3d8, { roughness: 0.8 });
      K.box(gar, [0.12, 2.6, 6], siding, [6.0, 1.3, -3], null, 0);
      K.box(gar, [3.0, 2.6, 0.12], K.std(0xe7e3da, { roughness: 0.9 }), [4.5, 1.3, -5.94], null, 0);
      K.box(gar, [3.1, 0.4, 0.12], siding, [4.5, 2.4, -0.06], null, 0);
      K.box(gar, [3.3, 0.1, 6.5], K.std(0x4b4d52, { roughness: 0.95 }), [4.5, 2.65, -2.9], null, 0);
      K.box(gar, [3.0, 0.02, 6], K.pbr('brushed_concrete', [2, 4], {}, 'concrete'), [4.5, 0.01, -3], null, 0);
      K.box(gar, [2.6, 0.04, 2.3], K.std(0xf2f2ee, { roughness: 0.5 }), [4.5, 2.35, -1.4], null, 0.004);
      K.box(gar, [3.0, 0.03, 4.0], K.pbr('brushed_concrete', [2, 3], {}, 'concrete'), [4.5, 0.015, 2.0], null, 0);
      // Furnace + filter rack
      const fur = K.part('furnace', [5.25, 0, -5.4], null, 'Gas furnace');
      K.box(fur, [0.56, 0.28, 0.7], K.std(0x9aa0a6, { roughness: 0.5 }), [0, 0.14, 0], null, 0.004);
      K.box(fur, [0.56, 1.2, 0.7], K.std(0xd7d4cc, { roughness: 0.45 }), [0, 0.88, 0], null, 0.01);
      K.box(fur, [0.5, 0.5, 0.01], K.std(0xc9c6be), [0, 1.15, 0.355], null, 0.004);
      K.box(fur, [0.5, 0.55, 0.6], K.std(0x9aa0a6, { roughness: 0.5, metalness: 0.4 }), [0, 1.75, -0.02], null, 0.004);
      K.cyl(fur, [0.05, 0.05, 1.5, 16], K.std(0x9aa0a6, { metalness: 0.6 }), [-0.15, 1.95, -0.2]);
      const filt = K.part('filter', [5.25, 0.15, -5.4], null, 'Furnace filter (16×25×1)');
      K.box(filt, [0.5, 0.025, 0.64], K.std(0xf2f2ee, { roughness: 1 }), [0, 0, 0.0], null, 0);
      K.box(filt, [0.5, 0.027, 0.04], K.std(0x7a6a55), [0, 0, 0.31], null, 0);
      K.rep(10, (i) => K.box(filt, [0.46, 0.028, 0.006], K.std(0xbcb3a3), [0, 0, -0.27 + i * 0.06], null, 0));
      const nf = K.part('newFilter', [4.4, 0.0, -4.4], null, 'New MERV 8–11 filter');
      K.box(nf, [0.5, 0.64, 0.025], K.std(0xf7f7f2, { roughness: 1 }), [0, 0.32, 0], [-6, 0, 0], 0);
      const wh = K.group(null, [3.6, 0, -5.4]);
      K.cyl(wh, [0.28, 0.28, 1.45, 32], K.std(0xeaeae4, { roughness: 0.5 }), [0, 0.73, 0]);
      K.cyl(wh, [0.05, 0.05, 1.2, 16], K.std(0x9aa0a6, { metalness: 0.6 }), [0, 2.0, 0]);
      const al = K.part('alarm', [4.4, 2.2, -5.87], null, 'Smoke / CO alarm');
      K.cyl(al, [0.07, 0.07, 0.035, 24], K.std(0xf7f7f2), [0, 0, 0], [90, 0, 0]);
      K.sph(al, 0.006, 'ledG', [0.03, -0.02, 0.02]);
      // Gutter debris + downspout extension
      const lv = K.part('leaves', [0, 0, 0], null, 'Leaves packed in the gutter');
      leaves(K, lv, HX0 - 0.3, HX1 + 0.3, HW - 0.31, 0.5, 70);
      const ext = K.part('extension', [HX0 - 0.15, 0, 0], null, 'Downspout extension (4–6 ft out)');
      K.box(ext, [0.08, 0.05, 1.6], K.std(0xf2f2ee, { roughness: 0.4 }), [0, 0.04, 1.1], [-2, 0, 0], 0.004);
      // Hose bib + cover + hose
      const bib = K.part('bib', [-3.6, 0.45, 0], null, 'Outdoor faucet');
      K.cyl(bib, [0.018, 0.018, 0.08, 16], 'brass', [0, 0, 0.04], [90, 0, 0]);
      K.cyl(bib, [0.014, 0.014, 0.05, 16], 'brass', [0, -0.03, 0.08]);
      K.tor(bib, [0.03, 0.006], K.std(0x2f6fd0), [0, 0.0, 0.1], [0, 0, 0]);
      const bc = K.part('bibCover', [-3.6, 0.45, 0], null, 'Foam faucet cover');
      K.box(bc, [0.17, 0.2, 0.15], K.std(0xf2f2ee, { roughness: 0.95 }), [0, -0.02, 0.08], null, 0.03);
      const hs = K.part('hose', [-3.0, 0, 0.9], null, 'Garden hose (drain + store)');
      K.rep(4, (i) => K.tor(hs, [0.28 + (i % 2) * 0.02, 0.014], 'green', [0, 0.02 + i * 0.026, 0], [90, 0, 0]));
      K.tube(hs, [[-0.25, 0.1, 0], [-0.4, 0.3, -0.5], [-0.6, 0.38, -0.8]], 0.014, 'green');
      // AC condenser on the left side + top cover
      const ac = K.part('ac', [HX0 - 0.7, 0, -1.8], null, 'AC condenser');
      condenser(K, ac, [0, 0, 0]);
      const acc = K.part('acCover', [HX0 - 0.7, 0.87, -1.8], null, 'Top-only cover (breathable)');
      K.box(acc, [0.86, 0.04, 0.86], K.std(0x2a2b2d, { roughness: 0.9 }), [0, 0.02, 0], null, 0.01);
      K.box(acc, [0.88, 0.2, 0.88], K.std(0x2a2b2d, { roughness: 0.9, transparent: true, opacity: 0.0 }), [0, -0.08, 0], null, 0);
      // Window caulk + door sweep
      const ck = K.part('caulk', [-2.6, 1.55, 0.045], null, 'Fresh exterior caulk at the trim');
      const cm = K.std(0xffffff, { roughness: 0.3 });
      [-1, 1].forEach((s) => {
        K.bar(ck, [s * 0.6, -0.63, 0], [s * 0.6, 0.63, 0], 0.008, cm);
        K.bar(ck, [-0.6, s * 0.63, 0], [0.6, s * 0.63, 0], 0.008, cm);
      });
      const sw = K.part('sweep', [-0.3, 0.31, 0.07], null, 'New door sweep + weatherstrip');
      K.box(sw, [0.9, 0.04, 0.02], K.std(0x9aa0a6, { metalness: 0.7, roughness: 0.4 }), [0, 0.0, 0], null, 0.003);
      K.box(sw, [0.9, 0.02, 0.012], 'rubber', [0, -0.025, 0], null, 0);
      // Patio furniture (store in the garage)
      const fu = K.part('furniture', [1.9, 0, 3.4], null, 'Patio furniture & cushions');
      K.cyl(fu, [0.45, 0.45, 0.03, 32], K.std(0x2a2b2d, { metalness: 0.4 }), [0, 0.72, 0]);
      K.cyl(fu, [0.03, 0.03, 0.72, 10], K.std(0x2a2b2d), [0, 0.36, 0]);
      [0, 120, 240].forEach((a) => {
        const c = K.group(fu, [Math.cos((a * Math.PI) / 180) * 0.75, 0, Math.sin((a * Math.PI) / 180) * 0.75], [0, -a + 90, 0]);
        K.box(c, [0.5, 0.06, 0.5], K.std(0x2f6fd0, { roughness: 1 }), [0, 0.45, 0], null, 0.02);
        K.box(c, [0.5, 0.5, 0.05], K.std(0x2a2b2d), [0, 0.7, 0.25], null, 0.01);
        [[0.22, 0.22], [-0.22, 0.22], [0.22, -0.22], [-0.22, -0.22]].forEach(([x, z]) => K.cyl(c, [0.012, 0.012, 0.42, 8], K.std(0x2a2b2d), [x, 0.21, z]));
      });
      const sk = K.part('snowKit', [0.8, 0, 0.9], null, 'Snow shovel + ice melt (pet-safe)');
      K.box(sk, [0.45, 0.03, 0.35], K.std(0x1f1f1f), [0, 0.05, 0], [-20, 0, 0], 0.006);
      K.bar(sk, [0, 0.08, -0.15], [0, 1.2, -0.45], 0.016, 'woodLight');
      K.box(sk, [0.3, 0.42, 0.14], K.std(0x2f6fd0, { roughness: 0.9 }), [0.4, 0.21, 0.1], null, 0.03);
      return {};
    }
  );

  /* ---------------- Holiday lights (build) ---------------- */
  const HL_AO = ['aoSmart', 'aoProjector', 'aoPath', 'aoShrub', 'aoWreath'];
  TB.model(
    'holidayLights',
    Object.assign({}, HG, { cam: [6.0, 1.6, 11.0], at: [-0.5, 1.5, 0], hidden: ['testStrand', 'clips', 'lightsEave', 'lightsRake', 'cord', 'timer'].concat(HL_AO) }),
    (K) => {
      house(K, { siding: 0xe6e1d6, shutter: 0x2c4a3a, door: 0x6e1f22 });
      const cols = [0xff3b30, 0x2ecc71, 0x3b82f6, 0xffb020, 0xfff4dc];
      const bulbs = cols.map((c) => K.std(c, { emissive: c, emissiveIntensity: 2.2, roughness: 0.3 }));
      const c9 = (g, p, i, up) => {
        const b = K.group(g, p);
        K.cyl(b, [0.012, 0.012, 0.025, 10], K.std(0x1d4d2a), [0, 0.012, 0]);
        K.cone(b, [0.034, 0.09, 14], bulbs[i % 5], [0, 0.075, 0]);
        K.sph(b, 0.034, bulbs[i % 5], [0, 0.035, 0]);
        return b;
      };
      const wire = K.std(0x1d4d2a, { roughness: 0.6 });
      // Gutter clips + eave strand
      const clips = K.part('clips', [0, 0, 0], null, 'All-in-one gutter/shingle clips (every 12″)');
      const eave = K.part('lightsEave', [0, 0, 0], null, 'C9 LED strand along the gutter');
      const n = 26;
      const x0 = HX0 - 0.35;
      const x1 = HX1 + 0.35;
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n;
        K.box(clips, [0.03, 0.04, 0.03], K.std(0xf4f4f0, { roughness: 0.5 }), [x, HW - 0.19, 0.575], null, 0.004);
        c9(eave, [x, HW - 0.17, 0.585], i, true);
      }
      K.bar(eave, [x0, HW - 0.175, 0.585], [x1, HW - 0.175, 0.585], 0.004, wire);
      // Rake strands (both gable ends, front half)
      const rake = K.part('lightsRake', [0, 0, 0], null, 'Strands up the gable rakes');
      [HX0 - 0.42, HX1 + 0.42].forEach((x, s) => {
        const a = [x, HW - 0.15, 0.42];
        const b = [x, HW + 1.56, -3];
        K.bar(rake, a, b, 0.004, wire);
        for (let i = 0; i <= 12; i++) {
          const t = i / 12;
          c9(rake, [a[0], a[1] + (b[1] - a[1]) * t + 0.02, a[2] + (b[2] - a[2]) * t], i + s);
        }
      });
      // Test strand on the lawn
      const ts = K.part('testStrand', [1.8, 0.02, 2.6], null, 'Strands laid out and tested before going up');
      for (let i = 0; i < 16; i++) {
        const a = i * 0.45;
        c9(ts, [Math.cos(a) * (0.3 + i * 0.025), 0, Math.sin(a) * (0.3 + i * 0.025)], i);
      }
      // Cord from the GFCI outlet up the corner
      const cord = K.part('cord', [0, 0, 0], null, 'Outdoor-rated extension cord (14 AWG)');
      K.tube(cord, [[1.0, 0.42, 0.08], [1.05, 0.05, 0.22], [2.0, 0.02, 0.3], [2.95, 0.03, 0.22], [3.08, 0.6, 0.12], [3.08, 2.2, 0.12], [3.25, HW - 0.2, 0.5], [3.35, HW - 0.17, 0.58]], 0.008, K.std(0x1d4d2a));
      const tm = K.part('timer', [1.0, 0.34, 0.1], null, 'Photocell outdoor timer');
      K.box(tm, [0.08, 0.12, 0.05], K.std(0x2a2b2d), [0, 0, 0], null, 0.01);
      K.sph(tm, 0.012, K.std(0x6aa0d0, { roughness: 0.1 }), [0, 0.03, 0.026]);
      // Add-ons
      AO.smartPlug(K, 'aoSmart', [1.35, 0, 0.45], 'Smart light controller (app + schedules)');
      const pj = K.part('aoProjector', [-1.6, 0, 3.6], null, 'Outdoor laser / LED projector');
      K.cyl(pj, [0.01, 0.01, 0.3, 8], blackMetal(K), [0, 0.15, 0]);
      const pjh = K.group(pj, [0, 0.33, 0], [-14, 0, 0]);
      K.cyl(pjh, [0.06, 0.06, 0.14, 20], blackMetal(K), [0, 0, 0], [90, 0, 0]);
      K.cyl(pjh, [0.04, 0.04, 0.005, 20], glow(K, 0x7fdcff, 1.4), [0, 0, -0.072], [90, 0, 0]);
      K.rep(40, (i) => K.sph(pj, 0.022, bulbs[i % 3], [Math.sin(i * 2.3) * 1.6 - 0.6, 1.0 + ((i * 0.37) % 1) * 1.5 - 2.0 * 0 + 0.0 - 0, -3.55 + 0.0], null));
      pj.children.slice(-40).forEach((m) => (m.position.z = -3.57));
      const path = K.part('aoPath', [0, 0, 0], null, 'Candy-cane path markers');
      [1.4, 2.4, 3.4, 4.4].forEach((z) =>
        [-0.95, 0.35].forEach((x) => {
          K.cyl(path, [0.015, 0.015, 0.45, 10], K.std(0xf7f7f2), [x, 0.225, z]);
          K.tor(path, [0.06, 0.015, 180], K.std(0xd0433a), [x - 0.06, 0.45, z], [0, 0, 0]);
          K.sph(path, 0.02, glow(K, 0xfff1cc, 1.2), [x, 0.45, z]);
        })
      );
      const net = K.part('aoShrub', [0, 0, 0], null, 'Net lights over the shrubs');
      [-3.4, -1.7, 1.0, 2.4].forEach((x) => K.rep(40, (i) => {
        const a = i * 2.39996;
        const r = Math.sqrt((i + 0.5) / 40);
        K.sph(net, 0.014, glow(K, 0xfff1cc, 1.6), [x + Math.cos(a) * r * 0.5, 0.35 + Math.sqrt(Math.max(0, 1 - r * r)) * 0.45, 0.55 + Math.sin(a) * r * 0.45 + 0.1]);
      }));
      const wr = K.part('aoWreath', [-0.3, 1.75, 0.09], null, 'Pre-lit wreath');
      K.tor(wr, [0.22, 0.07, 360], K.std(0x24502e, { roughness: 1 }), [0, 0, 0.03], [0, 0, 0]);
      K.rep(18, (i) => K.sph(wr, 0.012, glow(K, 0xfff1cc, 1.6), [Math.cos(i * 0.349) * 0.22, Math.sin(i * 0.349) * 0.22, 0.1]));
      K.box(wr, [0.12, 0.08, 0.03], K.std(0xb3202a), [0, -0.22, 0.1], null, 0.01);
      return {
        tick(t, fx) {
          bulbs.forEach((m, i) => (m.emissiveIntensity = fx === 'off' ? 0.05 : 2.0 + 0.5 * Math.sin(t * 2 + i)));
        },
      };
    }
  );

  /* ---------------- Spring AC startup ---------------- */
  TB.model(
    'acStartup',
    { unit: 1, env: 'garden', cam: [2.2, 1.6, 2.8], at: [0.2, 0.55, 0.6], ground: { tex: 'forrest_ground_01', repeat: 6, radius: 7 }, tex: ['forrest_ground_01', 'wood_planks', 'plank_flooring'], assets: ['shrub_01'], hidden: ['shrubTrim', 'hose', 'thermo', 'newFilter'] },
    (K) => {
      const wall = K.part('wall', [0, 0, 0], null, 'House wall');
      K.box(wall, [4, 2.4, 0.15], K.std(0xc9d3d8, { roughness: 0.8 }), [0, 1.2, -0.075], null, 0);
      K.rep(12, (i) => K.box(wall, [4.0, 0.012, 0.01], K.std(0xb6c0c5), [0, 0.35 + i * 0.18, 0.003], null, 0));
      K.box(wall, [4, 0.3, 0.17], 'concrete', [0, 0.15, -0.075], null, 0);
      // Interior side
      K.box(null, [4, 0.02, 2.2], K.pbr('plank_flooring', [2, 1.2], {}, 'wood'), [0, 0.01, -1.26], null, 0);
      K.box(null, [4, 2.4, 0.005], K.std(0xeeebe5, { roughness: 0.92 }), [0, 1.2, -0.153], null, 0);
      const ts = K.part('thermostat', [0.9, 1.5, -0.16], null, 'Thermostat');
      K.box(ts, [0.12, 0.12, 0.025], K.std(0xf7f7f2, { roughness: 0.4 }), [0, 0, -0.012], null, 0.012);
      K.box(ts, [0.07, 0.05, 0.003], K.phys(0x16212c, { emissive: 0x3a8fd0, emissiveIntensity: 0.7 }), [0, 0.01, -0.026], null, 0);
      const gr = K.part('grille', [-0.8, 0.55, -0.16], null, 'Return-air grille');
      K.box(gr, [0.66, 0.42, 0.02], K.std(0xf4f3ee), [0, 0, -0.01], null, 0.004);
      K.rep(10, (i) => K.box(gr, [0.6, 0.012, 0.012], K.std(0xdcdad3), [0, -0.18 + i * 0.04, -0.024], [30, 0, 0], 0));
      const fl = K.part('filter', [-0.8, 0.55, -0.13], null, 'Return filter (20×16×1, dirty)');
      K.box(fl, [0.6, 0.38, 0.025], K.std(0x9c9384, { roughness: 1 }), [0, 0, 0], null, 0);
      const nf = K.part('newFilter', [-0.2, 0.0, -0.7], null, 'New filter');
      K.box(nf, [0.6, 0.38, 0.025], K.std(0xf7f7f2, { roughness: 1 }), [0, 0.19, 0], [0, 0, 0], 0);
      const reg = K.part('register', [0.0, 2.2, -0.16], null, 'Supply register');
      K.box(reg, [0.3, 0.14, 0.02], K.std(0xf4f3ee), [0, 0, -0.01], null, 0.004);
      const th = K.part('thermo', [0.0, 2.1, -0.24], null, 'Probe thermometer at the supply');
      K.cyl(th, [0.003, 0.003, 0.12, 8], 'steel', [0, 0.06, 0.05], [60, 0, 0]);
      K.cyl(th, [0.025, 0.025, 0.012, 20], K.std(0xf7f7f2), [0, -0.0, 0], [90, 0, 0]);
      // Condenser
      const unit = K.part('unit', [0.2, 0, 0.75], null, 'Condenser (3-ton)');
      const C = condenser(K, unit, [0, 0, 0]);
      const fins = K.part('fins', [0.2, 0, 0.75], null, 'Coil fins (all four sides)');
      K.box(fins, [0.78, 0.6, 0.78], K.std(0x50565c, { transparent: true, opacity: 0.0 }), [0, 0.42, 0], null, 0);
      const cv = K.part('acCover', [0.2, 0, 0.75], null, 'Winter cover');
      K.box(cv, [0.86, 0.82, 0.86], K.std(0x2a2b2d, { roughness: 0.9 }), [0, 0.5, 0], null, 0.03);
      K.box(cv, [0.88, 0.04, 0.88], K.std(0x1d1e20, { roughness: 0.9 }), [0, 0.15, 0], null, 0.01);
      const deb = K.part('debris', [0.2, 0, 0.75], null, 'Leaves & debris');
      leaves(K, deb, -0.55, 0.55, 0.09, 0.45, 18);
      leaves(K, deb, -0.55, 0.55, 0.09, -0.45, 14);
      leaves(K, deb, -0.25, 0.25, 0.89, 0.0, 10);
      const ls = K.part('lineset', [0, 0, 0], null, 'Line set (insulated suction + liquid line)');
      K.box(ls, [0.08, 0.12, 0.08], K.std(0xbfc3bd), [0.62, 0.3, 0.38], null, 0.006);
      run(K, ls, [[0.62, 0.3, 0.34], [0.62, 0.3, 0.16], [0.62, 0.65, 0.16], [0.62, 0.65, -0.05]], 0.024, K.std(0x1d1e20, { roughness: 1 }));
      run(K, ls, [[0.7, 0.26, 0.34], [0.7, 0.26, 0.16], [0.7, 0.65, 0.16], [0.7, 0.65, -0.05]], 0.006, 'copper');
      K.box(ls, [0.04, 0.03, 0.03], 'brass', [0.62, 0.27, 0.43], null, 0.004);
      K.box(ls, [0.03, 0.025, 0.025], 'brass', [0.7, 0.23, 0.43], null, 0.004);
      const dc = K.part('disconnect', [1.15, 1.2, 0.05], null, 'Outdoor disconnect');
      K.box(dc, [0.22, 0.3, 0.1], K.std(0x9aa0a6, { roughness: 0.4 }), [0, 0, 0], null, 0.01);
      K.tube(dc, [[0, -0.15, 0.0], [0, -0.5, 0.05], [-0.1, -0.75, 0.25], [-0.4, -0.75, 0.42]], 0.014, K.std(0x6b7178));
      const po = K.part('pullout', [1.15, 1.2, 0.11], null, 'Pull-out fuse block');
      K.box(po, [0.14, 0.12, 0.03], 'black', [0, 0, 0], null, 0.006);
      K.box(po, [0.06, 0.02, 0.02], 'grey', [0, 0.03, 0.02], null, 0.004);
      const cd = K.part('condensate', [0, 0, 0], null, 'Condensate drain outlet');
      run(K, cd, [[-1.4, 0.4, -0.05], [-1.4, 0.4, 0.12], [-1.4, 0.08, 0.12]], 0.012, 'pvc');
      const sh = K.part('shrub', [-0.7, 0, 1.0], null, 'Overgrown shrub (needs 2 ft clearance)');
      K.glb(sh, 'shrub_01', { height: 1.3 }, [0, 0, 0]) || K.sph(sh, 0.6, K.std(0x3f6b2a, { roughness: 1 }), [0, 0.55, 0], [1, 0.9, 1]);
      const st = K.part('shrubTrim', [-1.25, 0, 1.2], null, 'Trimmed back');
      K.glb(st, 'shrub_01', { height: 0.7 }, [0, 0, 0]) || K.sph(st, 0.35, K.std(0x3f6b2a, { roughness: 1 }), [0, 0.3, 0]);
      const hs = K.part('hose', [0, 0, 0], null, 'Garden hose on gentle spray');
      K.tube(hs, [[-1.8, 0.02, 2.4], [-0.6, 0.02, 2.0], [0.0, 0.3, 1.6], [0.15, 0.62, 1.35]], 0.014, 'green');
      K.cyl(hs, [0.02, 0.016, 0.16, 16], K.std(0x2f6fd0), [0.17, 0.7, 1.3], [-40, 0, 0]);
      const fan = C.fan;
      return {
        tick(t, fx) {
          if (fx === 'run') fan.rotation.y = t * 14;
        },
      };
    }
  );

  /* ---------------- Sump pump + battery backup ---------------- */
  TB.model(
    'sumpPump',
    { unit: 1, env: 'garage', floor: false, cam: [1.3, 1.6, 1.7], at: [-0.5, 0.1, -0.4], tex: ['brushed_concrete', 'wood_planks'], hidden: ['bucketPit', 'brick', 'backup', 'dischargeBackup', 'checkBackup', 'floatBackup', 'battery', 'charger'] },
    (K) => {
      const conc = K.pbr('brushed_concrete', [3, 3], {}, 'concrete');
      const cx = -0.7;
      const cz = -0.45;
      const slab = K.part('slab', [0, 0, 0], null, 'Basement slab');
      K.ext(slab, [[-1.6, -1.0], [2.4, -1.0], [2.4, 2.4], [-1.6, 2.4]], 0.1, conc, [0, 0, 0], [90, 0, 0], 0, [K.circle(cx, cz, 0.25, 40).reverse()]);
      K.ext(null, K.circle(0.4, 0.7, 7, 48), 0.02, K.std(0x8c8a84, { roughness: 1 }), [0, -0.1, 0], [90, 0, 0], 0, [[[-1.6, -1.0], [2.4, -1.0], [2.4, 2.4], [-1.6, 2.4]].reverse()]);
      const wc = K.std(0xa9a79f, { roughness: 1 });
      K.box(null, [4.2, 2.4, 0.2], wc, [0.4, 1.1, -1.1], null, 0);
      K.box(null, [0.2, 2.4, 3.6], wc, [-1.7, 1.1, 0.6], null, 0);
      K.box(null, [4.2, 0.24, 0.05], K.pbr('wood_planks', [2, 0.3], { color: 0xd9b98a }, 'woodLight'), [0.4, 2.42, -0.98], null, 0.004);
      // Pit
      const pit = K.part('pit', [cx, 0, cz], null, 'Sump basin (18″ × 24″)');
      K.cyl(pit, [0.24, 0.22, 0.62, 40, true], K.std(0x1d1e20, { roughness: 0.6, side: THREE.DoubleSide }), [0, -0.31, 0]);
      K.cyl(pit, [0.22, 0.22, 0.01, 40], K.std(0x1d1e20), [0, -0.615, 0]);
      K.tor(pit, [0.25, 0.012, 360], K.std(0x1d1e20), [0, 0.0, 0], [90, 0, 0]);
      const water = K.part('pitWater', [cx, -0.6, cz], null, 'Groundwater in the pit');
      const wm = K.cyl(water, [0.225, 0.225, 1, 40], K.std(0x5a7f8a, { transparent: true, opacity: 0.55, roughness: 0.1 }), [0, 0.5, 0]);
      water.scale.y = 0.18;
      // Primary pump
      const pm = K.part('primary', [cx - 0.08, -0.6, cz - 0.05], null, 'Primary pump (⅓ HP, cast iron)');
      const iron = K.std(0x3b4046, { roughness: 0.6, metalness: 0.4 });
      K.cyl(pm, [0.085, 0.095, 0.08, 28], iron, [0, 0.05, 0]);
      K.cyl(pm, [0.08, 0.08, 0.16, 28], iron, [0, 0.17, 0]);
      K.sph(pm, 0.08, iron, [0, 0.25, 0], [1, 0.4, 1]);
      K.cyl(pm, [0.03, 0.03, 0.06, 16], iron, [0, 0.29, 0]);
      K.tube(pm, [[0.06, 0.25, 0.04], [0.15, 0.4, 0.1], [0.3, 0.62, 0.22], [0.65, 0.8, 0.2], [0.65, 1.55, -0.45]], 0.006, 'black');
      const fm = K.part('floatMain', [cx + 0.05, -0.6, cz - 0.12], null, 'Primary float switch');
      K.cyl(fm, [0.006, 0.006, 0.42, 8], 'grey', [0, 0.3, 0]);
      const fmb = K.cyl(fm, [0.032, 0.032, 0.07, 20], K.std(0x2f6fd0), [0, 0.2, 0]);
      const pvc = K.std(0xf2f2ec, { roughness: 0.35 });
      const dm = K.part('discharge', [0, 0, 0], null, '1½″ PVC discharge (to outside)');
      run(K, dm, [[cx - 0.08, -0.28, cz - 0.05], [cx - 0.08, 0.25, cz - 0.05]], 0.024, pvc);
      run(K, dm, [[cx - 0.08, 0.42, cz - 0.05], [cx - 0.08, 2.15, cz - 0.05], [cx - 0.08, 2.15, -1.2]], 0.024, pvc);
      const ckm = K.part('checkMain', [cx - 0.08, 0.335, cz - 0.05], null, 'Primary check valve');
      K.cyl(ckm, [0.034, 0.034, 0.17, 24], K.std(0xd9ecf5, { transparent: true, opacity: 0.6, roughness: 0.05 }), [0, 0, 0]);
      [-0.07, 0.07].forEach((y) => K.tor(ckm, [0.036, 0.005], 'steel', [0, y, 0], [90, 0, 0]));
      K.box(ckm, [0.006, 0.05, 0.004], 'red', [0, 0, 0.035], null, 0);
      // Backup
      const brk = K.part('brick', [cx + 0.12, -0.6, cz + 0.11], null, 'Brick (lifts backup above primary)');
      K.box(brk, [0.18, 0.08, 0.09], K.std(0x9b4a33, { roughness: 1 }), [0, 0.04, 0], null, 0.004);
      const bp = K.part('backup', [cx + 0.12, -0.52, cz + 0.11], null, 'Backup pump (12 V DC)');
      K.cyl(bp, [0.06, 0.065, 0.16, 24], K.std(0x2a2b2d, { roughness: 0.5 }), [0, 0.08, 0]);
      K.cyl(bp, [0.02, 0.02, 0.05, 12], K.std(0x2a2b2d), [0, 0.18, 0]);
      const db = K.part('dischargeBackup', [0, 0, 0], null, 'Backup discharge + tee');
      run(K, db, [[cx + 0.12, -0.32, cz + 0.11], [cx + 0.12, 0.38, cz + 0.11]], 0.019, pvc);
      run(K, db, [[cx + 0.12, 0.55, cz + 0.11], [cx + 0.12, 0.75, cz + 0.11], [cx + 0.12, 0.75, cz - 0.05], [cx - 0.08, 0.75, cz - 0.05]], 0.019, pvc);
      K.sph(db, 0.036, pvc, [cx - 0.08, 0.75, cz - 0.05]);
      const ckb = K.part('checkBackup', [cx + 0.12, 0.465, cz + 0.11], null, 'Backup check valve');
      K.cyl(ckb, [0.03, 0.03, 0.15, 24], K.std(0xd9ecf5, { transparent: true, opacity: 0.6, roughness: 0.05 }), [0, 0, 0]);
      [-0.06, 0.06].forEach((y) => K.tor(ckb, [0.032, 0.005], 'steel', [0, y, 0], [90, 0, 0]));
      const fb = K.part('floatBackup', [cx + 0.12, -0.1, cz + 0.17], null, 'Backup float switch (set higher)');
      K.box(fb, [0.02, 0.06, 0.02], 'dark', [0, 0, -0.03], null, 0.004);
      const fbb = K.cyl(fb, [0.028, 0.028, 0.06, 20], K.std(0xe8833a), [0, -0.06, 0]);
      // Battery + charger
      const bat = K.part('battery', [0.45, 0, -0.65], null, 'Deep-cycle battery in vented box');
      K.box(bat, [0.42, 0.3, 0.26], K.std(0x1d1e20, { roughness: 0.6 }), [0, 0.15, 0], null, 0.015);
      K.box(bat, [0.42, 0.03, 0.26], K.std(0x2a2b2d), [0, 0.315, 0], null, 0.01);
      K.rep(4, (i) => K.box(bat, [0.04, 0.012, 0.004], 'grey', [-0.12 + i * 0.08, 0.2, 0.131], null, 0));
      const ch = K.part('charger', [0.45, 1.05, -0.98], null, 'Controller / charger + alarm');
      K.box(ch, [0.26, 0.2, 0.08], K.std(0xeaeae4, { roughness: 0.4 }), [0, 0, 0.04], null, 0.01);
      K.box(ch, [0.1, 0.04, 0.004], 'screen', [0, 0.04, 0.082], null, 0);
      ['ledG', 'ledG', 'ledR'].forEach((m, i) => K.sph(ch, 0.007, m, [-0.06 + i * 0.06, -0.04, 0.082]));
      K.tube(ch, [[-0.05, -0.1, 0.05], [-0.05, -0.6, 0.15], [-0.1, -0.7, 0.3]], 0.006, 'red');
      K.tube(ch, [[0.05, -0.1, 0.05], [0.05, -0.6, 0.15], [0.1, -0.7, 0.3]], 0.006, 'black');
      K.tube(ch, [[-0.12, -0.05, 0.04], [-0.5, -0.4, 0.2], [-0.9, -0.9, 0.5], [-1.03, -1.1, 0.64], [-1.03, -1.3, 0.64]], 0.006, 'black');
      const out = K.part('outlet', [-0.05, 1.05, -0.995], null, 'GFCI outlet (dedicated circuit)');
      K.box(out, [0.08, 0.13, 0.02], K.std(0xf7f7f2), [0, 0, 0.01], null, 0.004);
      K.box(out, [0.045, 0.03, 0.006], K.std(0xf0f0ea), [0, 0.03, 0.022], null, 0);
      K.box(out, [0.045, 0.03, 0.006], K.std(0xf0f0ea), [0, -0.03, 0.022], null, 0);
      const lid = K.part('lid', [cx, 0.005, cz], null, 'Sealed basin lid');
      K.cyl(lid, [0.27, 0.27, 0.012, 40], K.std(0x2a2b2d, { transparent: true, opacity: 0.92 }), [0, 0, 0]);
      const bk = K.part('bucketPit', [cx + 0.38, 0, cz + 0.42], null, '5-gal bucket of water');
      K.cyl(bk, [0.15, 0.13, 0.36, 28, true], K.std(0xe8833a, { roughness: 0.5, side: THREE.DoubleSide }), [0, 0.18, 0]);
      K.cyl(bk, [0.135, 0.135, 0.005, 28], 'water', [0, 0.28, 0]);
      return {
        tick(t, fx) {
          const lvl = fx === 'fill' ? 0.18 + ((t * 0.08) % 0.27) : fx === 'pump' ? 0.45 - ((t * 0.12) % 0.27) : fx === 'backup' ? 0.48 - ((t * 0.08) % 0.2) : 0.18;
          water.scale.y = lvl;
          fmb.position.y = Math.min(0.42, Math.max(0.2, lvl + 0.02));
          fbb.position.y = Math.min(0.0, Math.max(-0.06, lvl - 0.58));
        },
      };
    }
  );

  /* ---------------- Storm prep ---------------- */
  TB.model(
    'stormPrep',
    Object.assign({}, HG, { cam: [14.0, 6.0, 12.0], at: [4.5, 1.0, -0.8], hidden: ['boards', 'sandbags', 'straps', 'kit', 'cord', 'clearance', 'fuel'], assets: ['shrub_01', 'shrub_02', 'dead_tree_trunk'] }),
    (K) => {
      house(K, {});
      // Service equipment on the right side wall (x = 3)
      const mt = K.part('meter', [HX1 + 0.02, 1.5, -1.0], null, 'Electric meter');
      K.box(mt, [0.1, 0.35, 0.25], K.std(0x9aa0a6, { roughness: 0.4 }), [0.05, 0, 0], null, 0.01);
      K.cyl(mt, [0.08, 0.08, 0.08, 24], K.std(0xdcecf5, { transparent: true, opacity: 0.6 }), [0.13, 0.03, 0], [0, 0, 90]);
      const pn = K.part('panel', [HX1 + 0.02, 1.35, -2.0], null, 'Main panel (cover open)');
      K.box(pn, [0.1, 0.7, 0.4], K.std(0x9aa0a6, { roughness: 0.4 }), [0.05, 0, 0], null, 0.01);
      K.box(pn, [0.004, 0.62, 0.34], K.std(0x5d6268), [0.102, 0, 0], null, 0);
      K.rep(8, (i) => [-1, 1].forEach((s) => K.box(pn, [0.02, 0.045, 0.1], 'black', [0.11, 0.18 - i * 0.055, s * 0.07], null, 0.003)));
      K.box(pn, [0.03, 0.08, 0.24], 'black', [0.115, 0.26, 0], null, 0.004);
      K.box(pn, [0.008, 0.4, 0.4], K.std(0x9aa0a6, { roughness: 0.4 }), [0.1, 0.0, -0.4], [0, -70, 0], 0.004);
      const il = K.part('interlock', [HX1 + 0.13, 1.61, -2.0], null, 'Interlock kit (main OR generator, never both)');
      K.box(il, [0.006, 0.12, 0.3], K.std(0xd9a62e, { metalness: 0.6, roughness: 0.35 }), [0, 0, 0], null, 0);
      K.box(il, [0.02, 0.03, 0.03], 'red', [0.01, -0.02, 0.1], null, 0.004);
      const inl = K.part('inlet', [HX1 + 0.02, 0.6, -1.6], null, 'Power inlet box (L14-30)');
      K.box(inl, [0.08, 0.2, 0.15], K.std(0x5d6268, { roughness: 0.4 }), [0.04, 0, 0], null, 0.01);
      K.cyl(inl, [0.035, 0.035, 0.02, 24], 'black', [0.085, 0, 0], [0, 0, 90]);
      K.box(K.part('conduit', [0, 0, 0], null, 'Conduit'), [0.03, 0.6, 0.03], 'grey', [HX1 + 0.03, 1.0, -1.8], null, 0.004);
      // Generator ~ 20 ft (6.1 m) from the wall, exhaust pointing away
      const gx = HX1 + 6.4;
      const gen = K.part('generator', [gx, 0, -1.6], null, 'Portable generator (7,500 W)');
      const fr = K.std(0x1d1e20, { metalness: 0.5, roughness: 0.4 });
      [[-0.35, -0.27], [0.35, -0.27], [0.35, 0.27], [-0.35, 0.27]].forEach(([x, z]) => K.bar(gen, [x, 0.12, z], [x, 0.7, z], 0.016, fr));
      [-0.27, 0.27].forEach((z) => K.bar(gen, [-0.35, 0.7, z], [0.35, 0.7, z], 0.016, fr));
      K.box(gen, [0.55, 0.18, 0.42], K.std(0xd0433a, { roughness: 0.4 }), [0.0, 0.62, 0], null, 0.04);
      K.box(gen, [0.4, 0.36, 0.36], K.std(0x2b2e33, { roughness: 0.5 }), [0.08, 0.32, 0], null, 0.02);
      K.cyl(gen, [0.15, 0.15, 0.2, 28], K.std(0x5d6268, { metalness: 0.4 }), [-0.24, 0.32, 0], [0, 0, 90]);
      K.box(gen, [0.02, 0.24, 0.32], K.std(0x2a2b2d), [-0.36, 0.4, 0], null, 0.004);
      K.cyl(gen, [0.035, 0.035, 0.02, 20], 'black', [-0.375, 0.42, 0.08], [0, 0, 90]);
      K.cyl(gen, [0.07, 0.07, 0.3, 20], K.std(0x8a8f95, { metalness: 0.7 }), [0.3, 0.42, -0.1], [90, 0, 0]);
      [-0.27, 0.27].forEach((z) => K.cyl(gen, [0.12, 0.12, 0.06, 24], 'rubber', [0.3, 0.12, z * 1.15], [90, 0, 0]));
      const exh = K.part('exhaust', [gx + 0.42, 0.42, -1.6], null, 'Exhaust (pointing away from the house)');
      K.cyl(exh, [0.04, 0.04, 0.12, 16], K.std(0x8a8f95, { metalness: 0.7 }), [0, 0, 0], [0, 0, 90]);
      const cord = K.part('cord', [0, 0, 0], null, '10/4 generator cord (L14-30)');
      K.tube(cord, [[gx - 0.4, 0.42, -1.52], [gx - 0.8, 0.03, -1.3], [gx - 3.0, 0.03, -1.1], [HX1 + 0.6, 0.03, -1.5], [HX1 + 0.2, 0.4, -1.6], [HX1 + 0.12, 0.6, -1.6]], 0.016, K.std(0xe8b020, { roughness: 0.6 }));
      const cl = K.part('clearance', [0, 0, 0], null, '20 ft clearance from doors, windows & vents');
      K.bar(cl, [HX1 + 0.05, 0.02, -2.3], [gx - 0.4, 0.02, -2.3], 0.015, 'yellow');
      K.rep(7, (i) => K.box(cl, [0.02, 0.1, 0.1], 'yellow', [HX1 + 0.05 + (i * (gx - 0.45 - HX1)) / 6, 0.05, -2.3], null, 0));
      const fuel = K.part('fuel', [gx + 1.2, 0, 0.3], null, 'Gas cans (stored, cooled)');
      [0, 0.32].forEach((x) => {
        K.box(fuel, [0.28, 0.3, 0.18], K.std(0xc0392b, { roughness: 0.5 }), [x, 0.15, 0], null, 0.03);
        K.cyl(fuel, [0.02, 0.02, 0.12, 12], 'black', [x + 0.1, 0.33, 0], [0, 0, -40]);
      });
      // Windows boarded, sandbags
      const bd = K.part('boards', [0, 0, 0], null, '⅝″ plywood window covers');
      [-2.6, 1.7].forEach((x) => {
        K.box(bd, [1.4, 1.38, 0.016], K.pbr('wood_planks', [1, 1], { color: 0xd9b98a }, 'woodLight'), [x, 1.55, 0.1], null, 0);
        [[-0.6, 0.6], [0.6, 0.6], [-0.6, -0.6], [0.6, -0.6]].forEach(([dx, dy]) => K.cyl(bd, [0.012, 0.012, 0.01, 8], 'steel', [x + dx, 1.55 + dy, 0.11], [90, 0, 0]));
      });
      const sb = K.part('sandbags', [-0.3, 0.3, 0.9], null, 'Sandbags at the door threshold');
      K.rep(6, (i) => K.sph(sb, 0.16, K.std(0xbfae86, { roughness: 1 }), [-0.5 + (i % 3) * 0.5 + (i > 2 ? 0.25 : 0), 0.06 + (i > 2 ? 0.1 : 0), (i > 2 ? 0 : 0.05)], [1.2, 0.4, 0.7]));
      // Yard items
      const fu = K.part('furniture', [-2.6, 0, 3.2], null, 'Patio table & chairs');
      K.cyl(fu, [0.45, 0.45, 0.03, 32], K.std(0x2a2b2d, { metalness: 0.4 }), [0, 0.72, 0]);
      K.cyl(fu, [0.03, 0.03, 0.72, 10], K.std(0x2a2b2d), [0, 0.36, 0]);
      [0, 120, 240].forEach((a) => {
        const c = K.group(fu, [Math.cos((a * Math.PI) / 180) * 0.75, 0, Math.sin((a * Math.PI) / 180) * 0.75], [0, -a + 90, 0]);
        K.box(c, [0.5, 0.06, 0.5], K.std(0x3f7a5a, { roughness: 1 }), [0, 0.45, 0], null, 0.02);
        K.box(c, [0.5, 0.5, 0.05], K.std(0x2a2b2d), [0, 0.7, 0.25], null, 0.01);
      });
      AO.umbrella(K, 'umbrella', [-1.5, 0, 3.2], 'Patio umbrella (close & store)');
      const gr = K.part('grill', [-3.6, 0, 2.4], null, 'Grill + propane tank');
      K.box(gr, [0.9, 0.5, 0.5], K.std(0x2a2b2d, { metalness: 0.5 }), [0, 0.7, 0], null, 0.03);
      K.box(gr, [0.86, 0.04, 0.5], K.std(0x5d6268, { metalness: 0.6 }), [0, 0.45, 0], null, 0);
      [[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]].forEach(([x, z]) => K.cyl(gr, [0.015, 0.015, 0.45, 8], 'dark', [x, 0.22, z]));
      K.cyl(gr, [0.15, 0.15, 0.4, 24], K.std(0xf2f2ee), [0, 0.22, 0]);
      const tc = K.part('trashCans', [2.4, 0, 1.4], null, 'Trash & recycling bins');
      [0, 0.75].forEach((x, i) => {
        K.box(tc, [0.6, 1.0, 0.7], K.std(i ? 0x2f6fd0 : 0x2a4a2e, { roughness: 0.6 }), [x, 0.5, 0], null, 0.03);
        K.box(tc, [0.64, 0.05, 0.75], K.std(i ? 0x2f6fd0 : 0x2a4a2e, { roughness: 0.6 }), [x, 1.02, 0], null, 0.02);
      });
      const st = K.part('straps', [2.4, 0, 1.4], null, 'Ratchet strap to a ground anchor');
      K.box(st, [1.5, 0.04, 0.73], K.std(0xe8b020, { roughness: 0.8, transparent: true, opacity: 1 }), [0.37, 0.7, 0], null, 0);
      K.cyl(st, [0.03, 0.03, 0.06, 12], 'steel', [-0.45, 0.03, 0.45]);
      // Tree with a dead limb over the roof
      const tr = K.part('tree', [-6.0, 0, 1.6], null, 'Tree');
      K.cyl(tr, [0.16, 0.22, 4.2, 16], 'bark', [0, 2.1, 0]);
      [[0.4, 4.4, 0.2, 1.4], [-0.6, 4.1, -0.4, 1.2], [0.1, 5.0, -0.2, 1.1]].forEach(([x, y, z, r]) => K.sph(tr, r, K.std(0x3f6b2a, { roughness: 1 }), [x, y, z], [1, 0.8, 1]));
      const dl = K.part('deadLimb', [0, 0, 0], null, 'Dead limb over the roof');
      K.bar(dl, [-5.9, 3.2, 1.6], [-3.4, 3.6, 0.2], 0.07, 'bark');
      K.bar(dl, [-4.3, 3.45, 0.7], [-3.8, 3.9, 0.9], 0.035, 'bark');
      const kit = K.part('kit', [0.4, 0.3, 0.6], null, 'Kit: water, flashlights, radio, CO alarm');
      K.rep(3, (i) => K.box(kit, [0.18, 0.3, 0.12], K.std(0xdfeaf2, { transparent: true, opacity: 0.8 }), [i * 0.2, 0.15, 0], null, 0.02));
      K.box(kit, [0.2, 0.12, 0.08], K.std(0xd0433a), [0.65, 0.06, 0], null, 0.01);
      K.cyl(kit, [0.03, 0.03, 0.18, 16], 'black', [0.9, 0.03, 0], [0, 0, 90]);
      K.cyl(kit, [0.06, 0.06, 0.03, 20], K.std(0xf7f7f2), [-0.25, 0.03, 0]);
      return {};
    }
  );

  /* =========================================================================
     GUIDES · Pool & Hot Tub
     ========================================================================= */
  const OV = { cam: [6.4, 5.4, 9.2], at: [0, -0.5, 0.4] };
  const KIT = { cam: [3.25, 0.85, 5.25], at: [2.45, 0.12, 4.2] };
  const CHEM = { cam: [4.8, 1.7, 3.9], at: [2.6, 0.2, 2.0] };
  const PAD = { cam: [2.6, 2.0, 3.6], at: [-0.1, 0.55, 0] };
  const GAUGE = { cam: [1.05, 1.55, 1.4], at: [0.2, 0.95, 0.05] };
  const PUMP = { cam: [-0.35, 0.95, 1.0], at: [-1.0, 0.33, 0] };

  const sandSteps = [
    {
      t: 'Read the pressure gauge',
      d: 'With the pump running, read the round gauge on top of the filter in psi (pounds per square inch). Compare it with your clean starting pressure, often 10–20 psi. Clean when it reads 8–10 psi above that number.',
      why: 'Dirt trapped in the sand makes the pump push harder, so the pressure climbs. Cleaning on a pressure rise, not a calendar, wastes less water and filters better.',
      tip: 'Don’t know your clean pressure? Backwash today and the reading right afterward becomes your baseline. Write it on the tank with a marker.',
      ok: 'The gauge reads 8–10 psi above your written clean number.',
      v: Object.assign({ hi: ['gauge'], fx: 'dirty' }, GAUGE),
    },
    {
      t: 'Shut the pump off',
      d: 'Turn the pump off at the timer, switch or automation panel and wait for the gauge to drop to zero. Never move the multiport handle (the big valve on top) while the pump is running.',
      why: 'Turning the valve under pressure tears the rubber gasket inside it (the spider gasket), which causes leaks and lets sand blow back into the pool.',
      tip: 'Make it a habit: hand on the pump switch first, hand on the valve second. Every time.',
      ok: 'The pump is silent and the gauge needle rests at 0.',
      v: { cam: [-0.4, 1.4, 1.2], at: [-1.1, 0.8, -0.6], hi: ['timer'] },
    },
    {
      t: 'Roll out the backwash hose',
      d: 'Clamp the flat backwash hose onto the waste port (the outlet on the side of the valve) and roll it out to where local rules allow pool water: usually your own lawn, a sewer cleanout, or wherever your town says.',
      why: 'Backwash water is chlorinated and dirty. Many towns ban it from storm drains because it flows straight to creeks.',
      tip: 'Unroll the hose fully and straighten any kinks before starting; a kinked hose can pop off the port and spray you.',
      ok: 'The hose is clamped tight and lies flat all the way to an approved spot.',
      v: { cam: [1.5, 1.2, 2.6], at: [0.4, 0.4, 1.0], hi: ['wasteHose'], show: ['wasteHose'] },
    },
    {
      t: 'Set the valve to BACKWASH',
      d: 'Press the handle down and rotate it to BACKWASH until it drops into place. Then turn the pump back on.',
      why: 'Backwash reverses the flow so water lifts the sand bed and carries the trapped dirt out the waste port.',
      tip: 'If the handle won’t press down, the pump is still on or there’s pressure left. Turn it off and wait.',
      ok: 'The handle seated in BACKWASH and water flows out the far end of the hose.',
      v: { cam: [0.75, 1.5, 0.8], at: [0.2, 1.05, 0], hi: ['mpHandle', 'multiport'], rt: { mpHandle: [0, 60, 0] }, fx: 'dirty' },
    },
    {
      t: 'Run until the sight glass clears',
      d: 'Watch the sight glass (the clear window on the valve or waste line). It starts cloudy and turns clear, usually in 2–3 minutes. Turn the pump off as soon as it runs clear.',
      why: 'Longer backwashing just dumps water. Over-cleaning sand also makes it filter worse until a little dirt builds back up.',
      tip: 'No sight glass? Watch the water coming out of the hose in a white bucket; stop when it looks like pool water.',
      ok: 'The water in the sight glass is clear, and you shut the pump off.',
      v: { cam: [1.3, 1.5, 1.7], at: [0.2, 0.65, 0.1], hi: ['sightGlass', 'sand'], xray: true, fx: 'dirty' },
    },
    {
      t: 'Rinse for 30–60 seconds',
      d: 'With the pump off, turn the handle to RINSE, run the pump 30–60 seconds, then turn it off again.',
      why: 'Rinse runs water the normal direction but out the waste port, settling the sand bed and flushing loose dirt so it doesn’t puff back into the pool.',
      tip: 'Skipping rinse is why you see a little cloud of dirt at the returns after backwashing.',
      ok: 'The sight glass runs clear during the rinse.',
      v: { cam: [0.75, 1.5, 0.8], at: [0.2, 1.05, 0], hi: ['mpHandle'], rt: { mpHandle: [0, 120, 0] } },
    },
    {
      t: 'Back to FILTER and restart',
      d: 'Turn the handle to FILTER, roll up the hose, restart the pump and write down the new clean pressure.',
      why: 'That number is your baseline. The next cleaning is due when the gauge reads 8–10 psi above it.',
      tip: 'If the clean pressure keeps creeping higher season after season, the sand is clumped or worn; it’s due for replacement (about every 5–7 years).',
      ok: 'Water flows strongly from the returns and the gauge sits near your clean baseline.',
      v: Object.assign({ hi: ['gauge', 'mpHandle'], rt: { mpHandle: [0, 0, 0] }, hide: ['wasteHose'], fx: 'clean' }, GAUGE),
    },
    {
      t: 'Top up the pool',
      d: 'Each backwash removes roughly 150–300 gallons. Refill with a garden hose to the middle of the skimmer opening, and retest the chemistry if you added a lot of fresh water.',
      why: 'A low water level lets the skimmer suck air, and the pump can lose its prime (its full load of water).',
      tip: 'Set a phone timer when the hose goes in; forgotten hoses overfill pools and run up water bills.',
      ok: 'The waterline is halfway up the skimmer opening.',
      v: Object.assign({ hi: ['filter', 'returnLine'] }, PAD),
    },
  ];

  TB.category({
    id: 'pool',
    icon: 'pool',
    code: 'POL',
    name: 'Pool & Hot Tub',
    domain: 'recreation',
    blurb: 'Water chemistry, filters, pumps and the seasonal routines that keep pools and spas clear',
    repairs: [
      {
        id: 'pool-water-balance',
        title: 'Test and balance pool water',
        model: 'poolScene',
        level: 1,
        time: '20–40 min',
        cost: '$10–60',
        summary: 'Test free chlorine, pH, alkalinity, calcium hardness and stabilizer with a drop test kit, then adjust them in the right order. Balanced water stays clear, feels good and doesn’t damage the plaster or equipment.',
        intro: { hi: ['water', 'testKit'] },
        safety: [
          'Wear chemical-resistant gloves and safety glasses when handling chlorine and acid.',
          'Never mix pool chemicals together or pour them into the same bucket. Chlorine plus acid makes toxic chlorine gas.',
          'Always add chemical to water, never water to chemical; pour slowly and low to avoid splashes.',
          'Keep swimmers out until chlorine is back near your target and pH is 7.2–7.8.',
          'Store chlorine and acid apart in a cool, shaded, ventilated spot, out of children’s reach.',
        ],
        causes: [
          ['Cloudy or green water', 'Free chlorine fell too low for the stabilizer level, so algae got started.'],
          ['Scale or rough plaster', 'pH and calcium too high: the water is depositing minerals.'],
          ['Etched plaster, corroded heater or ladder', 'pH or alkalinity too low: the water is aggressive and dissolves surfaces.'],
          ['Chlorine “disappears” in sun', 'Too little stabilizer (CYA); sunlight burns off unprotected chlorine in a few hours.'],
        ],
        tools: ['Drop test kit with FAS-DPD chlorine test (e.g. Taylor K-2006)', 'Liquid chlorine 10–12.5%', 'Muriatic acid 31.45% (or dry acid)', 'Baking soda (sodium bicarbonate)', 'Stabilizer (cyanuric acid, CYA)', 'Calcium chloride', 'Clean bucket for dissolving', 'Chemical gloves + safety glasses', 'Notebook or pool app'],
        steps: [
          {
            t: 'Run the pump and skim',
            d: 'Skim out leaves and run the pump at least an hour so the water is well mixed before you test.',
            why: 'Still water near a corner or return doesn’t match the rest of the pool, so the test would mislead you.',
            tip: 'Know your pool’s volume first (length × width × average depth in feet × 7.5 = gallons). Every dose depends on it.',
            ok: 'The pump has run an hour and the surface is clear of floating debris.',
            v: Object.assign({ hi: ['water', 'returns', 'skimmer'] }, OV),
          },
          {
            t: 'Take a deep sample',
            d: 'Rinse the sample tube with pool water. Then turn it upside down, push it elbow-deep, away from the returns and skimmer, and flip it upright to fill.',
            why: 'Surface water has lost chlorine to the sun and doesn’t match the rest of the pool.',
            tip: 'Test in shade and on a white background (a paper plate works) so you can see color changes clearly.',
            ok: 'The tube is filled exactly to the line you need (10 mL or 25 mL for chlorine).',
            v: Object.assign({ hi: ['sample'], show: ['sample'] }, KIT),
          },
          {
            t: 'Test free chlorine (FAS-DPD)',
            d: 'Fill to 10 mL, add one scoop of the powder and swirl: pink means chlorine. Add the titrant (the drip reagent) one drop at a time, swirling and counting, until the pink turns clear. Drops × 0.5 = free chlorine in ppm.',
            why: 'Counting drops reads chlorine to 0.5 ppm even at shock levels. Color-match strips and OTO kits can’t read high levels accurately.',
            tip: 'Hold the bottle straight up, not tilted, so every drop is the same size. Use a 25 mL sample (0.2 ppm per drop) when you need more precision.',
            ok: 'The sample turned from pink to completely clear and stayed clear; you have a number.',
            v: Object.assign({ hi: ['sample', 'testKit'], fx: 'fas' }, KIT),
          },
          {
            t: 'Test pH, TA, CH and CYA',
            d: 'Run the pH color test, then the alkalinity (TA), calcium hardness (CH) and stabilizer (CYA) tests as the kit’s booklet shows. Write every number down.',
            why: 'Each chemical affects the others, so decide what to add only after you see the whole picture.',
            tip: 'If chlorine is over 10 ppm, the pH test can read falsely purple-high; wait for chlorine to drop or use the kit’s chlorine neutralizer drop first.',
            ok: 'You have five numbers written down: FC, pH, TA, CH and CYA.',
            v: Object.assign({ hi: ['testKit'] }, KIT),
          },
          {
            t: 'Fix alkalinity first',
            d: 'Target total alkalinity (TA) of 60–80 ppm for plaster pools using liquid chlorine, or 80–120 for vinyl or tablet users. To raise it, dissolve baking soda in a bucket of pool water and pour it in front of a return: 1.5 lb per 10,000 gal raises TA about 10 ppm.',
            why: 'Alkalinity is the water’s buffer: it resists pH changes. Get it in range first or pH keeps drifting.',
            tip: 'Add no more than about half your calculated amount, run the pump for a few hours, retest, then add the rest. Overshooting is harder to undo.',
            ok: 'A retest after circulating shows TA inside your target range.',
            v: Object.assign({ hi: ['bakingSoda', 'bucket'] }, CHEM),
          },
          {
            t: 'Adjust pH to 7.4–7.6',
            d: 'To lower pH, pour muriatic acid slowly and low into the water in front of a return with the pump running. As a guide, about 12 oz per 10,000 gal lowers pH about 0.2 when TA is near 80. Wait 30 minutes and retest.',
            why: 'Chlorine works best near 7.4–7.6. High pH causes scale and weak chlorine; low pH etches plaster and corrodes metal.',
            tip: 'Use a pool calculator app with your gallons and TA; acid needed changes a lot with alkalinity. To raise pH, aerate (point returns up) or add a little borax or soda ash.',
            ok: 'The pH color matches 7.4–7.6 on the comparator.',
            v: { cam: [4.6, 1.6, 4.0], at: [2.2, -0.1, 2.3], hi: ['acid', 'returns'] },
          },
          {
            t: 'Set stabilizer and calcium',
            d: 'Bring CYA to 30–50 ppm (70–80 for saltwater pools): put granular stabilizer in an old sock in the skimmer basket; it can take a week to dissolve and read fully. Plaster pools: raise calcium hardness to 250–450 ppm with calcium chloride, pre-dissolved in a bucket.',
            why: 'CYA shields chlorine from sunlight. Calcium keeps the water from pulling calcium out of the plaster.',
            tip: 'Calcium chloride gets hot when it dissolves; add it to a bucket of water slowly, never the other way around. CYA only goes down by draining, so add it in small steps.',
            ok: 'After a week, CYA tests 30–50; plaster pools show CH 250–450.',
            v: { cam: [4.6, 1.5, 2.2], at: [2.3, 0.0, 0.6], hi: ['stabilizer', 'calcium', 'skimmer'] },
          },
          {
            t: 'Dose chlorine to target',
            d: 'Keep free chlorine at least 7.5% of CYA and aim a little above (CYA 40 → FC about 4–6 ppm). One gallon of 12.5% liquid chlorine adds about 12.5 ppm to 10,000 gal (about 9.6 ppm to 13,000). Pour it in front of a return.',
            why: 'Stabilizer holds most of the chlorine in reserve, so the chlorine you need depends on your CYA, not a fixed “1–3 ppm”.',
            tip: 'Chlorine loses strength in storage. If doses don’t raise FC as much as expected, your jug is old; buy fresh and store it out of the sun.',
            ok: 'A retest 30 minutes later shows FC in your target range.',
            v: Object.assign({ hi: ['chlorine', 'water'] }, CHEM),
          },
          {
            t: 'Retest after a full turnover',
            d: 'Run the pump 6–8 hours, then retest FC and pH. From now on, test FC and pH 2–3 times a week, and TA, CH and CYA monthly.',
            why: 'Small, frequent corrections are cheaper and safer than big swings.',
            tip: 'If FC drops more than about 1 ppm overnight with no sun, something is eating chlorine (often early algae). Test again and consider a SLAM (shocking until clear).',
            ok: 'Your numbers hold steady between tests and the water is clear enough to see the main drain.',
            v: Object.assign({ hi: ['testKit', 'water'] }, OV),
          },
        ],
        tricks: [
          ['Drops beat strips', 'Use a drop kit for anything you dose by. Strips are fine as a quick daily glance, not for decisions.'],
          ['Liquid chlorine over tablets', 'Stabilized tablets (trichlor) add CYA every time you use them; after a summer, CYA can be so high you must drain. Liquid chlorine adds none.'],
          ['Measure gallons once', 'Calculate your volume once and keep it in your pool app; every dose depends on it.'],
          ['Overnight chlorine test', 'Test FC at dusk and again at dawn. A loss under 1 ppm means the water is clean; more means something is growing.'],
          ['Pour acid low', 'Pour acid slowly with the jug close to the water in front of a running return, so it mixes before reaching the plaster.'],
          ['Cloudy after shocking', 'That’s usually dead algae; keep chlorine up and run and clean the filter more often. It clears in a few days.'],
          ['Wrong chemical added', 'If you added too much acid or baking soda, don’t add the opposite chemical blindly; retest and correct slowly toward the target.'],
        ],
        refs: [
          ['ABCs of pool water chemistry (Trouble Free Pool)', 'https://www.troublefreepool.com/blog/2018/12/12/abcs-of-pool-water-chemistry/'],
          ['Pool chemistry ideal ranges (Pool Math)', 'https://cleanpoolmath.com/pool-chemistry-ideal-ranges/'],
          ['Healthy swimming (CDC)', 'https://www.cdc.gov/healthy-swimming/about/index.html'],
        ],
        learn: {
          how: 'Chlorine kills algae and germs. Stabilizer (cyanuric acid) protects it from sunlight but also slows it down, so the chlorine you need rises with your CYA. pH sets how strong chlorine is and whether water etches or scales surfaces. Alkalinity buffers pH, and calcium hardness keeps water from dissolving plaster. Balance them in order: TA, pH, CYA and CH, then chlorine.',
          specs: [['Free chlorine', '≥ 7.5% of CYA (≈ 4–6 ppm at CYA 40)'], ['Shock (SLAM)', '40% of CYA (16 ppm at CYA 40)'], ['pH', '7.4–7.6 (7.2–7.8 OK)'], ['Total alkalinity', '60–80 plaster/liquid chlorine; 80–120 vinyl or tablets'], ['Calcium hardness', '250–450 plaster; 50–250 vinyl'], ['CYA', '30–50 ppm (70–80 saltwater)'], ['Combined chlorine', '≤ 0.5 ppm'], ['Baking soda', '1.5 lb / 10,000 gal = +10 ppm TA'], ['12.5% chlorine', '1 gal / 10,000 gal = +12.5 ppm']],
          terms: [['FC', 'Free chlorine: the active, germ-killing chlorine.'], ['CC', 'Combined chlorine: used-up chlorine (chloramines) that causes “pool smell”.'], ['CYA', 'Cyanuric acid, the stabilizer that shields chlorine from sunlight.'], ['SLAM', 'Shock Level And Maintain: holding FC at about 40% of CYA until algae is gone.'], ['FAS-DPD', 'Drop test that reads chlorine accurately at any level.'], ['ppm', 'Parts per million; the same as milligrams per liter.']],
          mistakes: ['Using test strips for decisions.', 'Adding chlorine and acid at the same time or place.', 'Using only stabilized tablets, which keep raising CYA.', 'Chasing pH before fixing alkalinity.'],
          tips: ['Use a pool calculator app with your exact gallons.', 'Pour acid slowly near a return so it mixes before hitting the floor.', 'Store chlorine and acid apart in a cool, shaded spot.'],
        },
        pro: 'Water stays cloudy after a week at shock level, calcium or CYA is so high you need a partial drain, or the plaster shows staining you can’t identify.',
      },
      {
        id: 'pool-filter-clean',
        title: 'Clean the pool filter',
        model: 'poolPadSand',
        level: 1,
        time: '20–40 min',
        cost: '$0–40',
        summary: 'A dirty filter shows up as higher pressure and weaker flow at the returns. Sand and DE filters are backwashed (run in reverse); cartridge filters are opened and hosed off. Pick your filter type.',
        intro: { hi: ['filter', 'gauge'] },
        safety: [
          'Turn the pump off before turning any valve or opening the filter. Filters run at 10–30 psi.',
          'Open the air-relief valve and let the gauge read zero before loosening a clamp band. A tank under pressure can blow its lid off with enough force to injure.',
          'DE powder is a fine dust that irritates lungs. Wear a dust mask when handling it.',
          'Pump off at the breaker when your hands are inside the equipment.',
        ],
        causes: [
          ['Pressure 8–10 psi over clean', 'Time to clean.'],
          ['Weak return flow', 'Clogged filter, or a full pump or skimmer basket.'],
          ['Short time between cleanings', 'Clumped sand, torn DE grids, a worn cartridge, or algae in the water.'],
          ['Sand or DE back in the pool', 'Broken internal parts (laterals or grids); needs repair.'],
        ],
        tools: ['Backwash hose + hose clamp', 'Garden hose with spray nozzle', 'Marker or pen to log pressure', 'Screwdriver for the hose clamp'],
        steps: sandSteps,
        tricks: [
          ['Write it on the tank', 'Write the clean pressure on the tank with a paint marker so anyone can tell when it’s time.'],
          ['Empty baskets first', 'A full pump or skimmer basket also changes pressure; empty them before deciding the filter is dirty.'],
          ['Don’t over-clean', 'A slightly dirty filter traps finer particles than a freshly cleaned one, so clean on pressure, not on a schedule.'],
          ['Gauge stuck?', 'If the gauge never moves or reads oddly, replace it; a $15 gauge is how you know when to clean.'],
          ['Enzyme helps', 'A weekly enzyme dose breaks down sunscreen and body oils that clog every filter type.'],
          ['Sand alternatives', 'When re-sanding, glass media or zeolite can filter finer and backwash with less water.'],
        ],
        refs: [
          ['How to backwash a pool filter (River Pools)', 'https://www.riverpoolsandspas.com/blog/how-to-backwash-a-pool-filter'],
          ['Hayward S200 sand filter owner’s manual (Hayward)', 'https://www.thepoolfactory.com/media/wysiwyg/pdfs/hayward_s200_filter.pdf'],
          ['How to clean your pool filter (Latham Pool)', 'https://www.lathampool.com/resources/pool-maintenance-hub/how-to-clean-your-pool-filter/'],
          ['Backwashing best practices (In The Swim)', 'https://www.intheswim.com/blog/backwashing-best-practices.html'],
        ],
        learn: {
          how: 'The pump pushes water through the filter media: a bed of sand, a pleated cartridge, or fabric grids coated with DE powder. Trapped dirt slowly blocks flow, so pressure rises. Backwashing reverses the flow to flush the dirt out; cartridges must be removed and rinsed.',
          specs: [['Clean when', '8–10 psi above clean pressure'], ['Backwash time', '2–3 min until clear'], ['Rinse', '30–60 s'], ['Sand', '#20 silica, 0.45–0.55 mm; replace every 5–7 years'], ['Water per backwash', '150–300 gal'], ['Filters to', 'Sand 20–40 µm; cartridge 10–20 µm; DE 3–5 µm']],
          terms: [['Multiport', 'Six-position valve on top of sand and some DE filters.'], ['Sight glass', 'Clear window on the waste port to see the backwash water.'], ['Channeling', 'Water tunneling through packed sand instead of filtering.'], ['psi', 'Pounds per square inch, the pressure reading.']],
          mistakes: ['Turning the multiport with the pump on.', 'Backwashing on a schedule instead of on pressure.', 'Backwashing for 10+ minutes.', 'Skipping the rinse step.'],
          tips: ['Write the clean pressure on the tank with a marker.', 'Empty the pump basket first; a full basket also changes pressure.'],
        },
        pro: 'Sand comes back into the pool, the tank or multiport leaks, or the pressure stays high after cleaning.',
        variants: [
          { id: 'sand', name: 'Sand filter', blurb: 'Big round tank with a 6-position multiport valve on top. Backwash only.' },
          {
            id: 'cartridge',
            name: 'Cartridge filter',
            blurb: 'Tall tank with a clamp band and no backwash valve. Rinse the cartridge by hand.',
            model: 'poolPadCart',
            time: '45–60 min (+ overnight soak)',
            cost: '$0–40 (new cartridge $80–250)',
            summary: 'Cartridge filters can’t be backwashed. Open the tank, lift out the pleated cartridge and rinse it pleat by pleat. Soak it in cleaner once or twice a season.',
            intro: { hi: ['filter', 'cartridge'], xray: true },
            tools: ['Garden hose + cartridge-cleaning nozzle', 'Cartridge cleaner (degreaser)', 'Large tub or 32-gal trash can for soaking', 'Silicone O-ring lube', 'Marker to log pressure'],
            steps: [
              {
                t: 'Note pressure, pump off',
                d: 'Write down the gauge reading, then turn the pump off at the timer and at its breaker.',
                why: 'You’ll compare the after-cleaning pressure with the old clean number to see if the cartridge is wearing out.',
                tip: 'Flip the breaker too: automation or a timer can restart the pump while the lid is off, spraying water everywhere.',
                ok: 'The pump is off at the breaker and you’ve written down the pressure.',
                v: Object.assign({ hi: ['gauge', 'timer'], fx: 'dirty' }, GAUGE),
              },
              {
                t: 'Relieve pressure and drain',
                d: 'Turn the air-relief valve on the lid counterclockwise until it hisses, wait for the gauge to read zero, then remove the drain plug at the bottom of the tank.',
                why: 'Never loosen the clamp band on a pressurized tank. The lid can come off with great force.',
                tip: 'Close the valves between the pool and the filter first (if you have them) so the pool doesn’t drain back through the tank.',
                ok: 'The gauge reads 0 and water is draining from the bottom plug.',
                v: { cam: [0.9, 1.4, 1.0], at: [0.2, 0.9, 0], hi: ['airRelief', 'filter'] },
              },
              {
                t: 'Remove the clamp band and lid',
                d: 'Loosen the clamp-band knob or nut, lift off the band, then lift the lid straight up.',
                why: 'Lifting straight keeps the large tank O-ring (the rubber seal) seated so it doesn’t roll and tear.',
                tip: 'A stuck lid usually just has a suction seal; rock it gently or tap around the edge with your palm. Never pry with a screwdriver, which nicks the sealing surface.',
                ok: 'The lid is off and the big O-ring is still in its groove, undamaged.',
                v: { cam: [1.6, 2.1, 2.0], at: [0.2, 1.0, 0], hi: ['clampBand', 'filterLid'], mv: { filterLid: [0, 0.6, 0], airRelief: [0, 0.6, 0], clampBand: [0, 0.6, 0] } },
              },
              {
                t: 'Lift out the cartridge',
                d: 'Pull the cartridge straight out and stand it upright on the pad. Look inside the tank and scoop out any leaves or debris on the bottom.',
                why: 'Debris left in the tank gets pulled right back into the clean cartridge.',
                tip: 'A wet cartridge can weigh 15–25 lb; bend your knees and lift with both hands.',
                ok: 'The cartridge is out and the tank bottom is clean.',
                v: { cam: [1.2, 1.4, 1.9], at: [0.2, 0.6, 0.4], hi: ['cartridge'], mv: { cartridge: [0, -0.1, 0.62] } },
              },
              {
                t: 'Hose between every pleat',
                d: 'Spray at a 45° angle from top to bottom between each pleat, working around the cartridge until the water runs clear. Don’t use a pressure washer.',
                why: 'A pressure washer frays the fabric and opens holes that let dirt pass straight through.',
                tip: 'Spread the pleats with your fingers as you go; dirt hides deep in the folds. A wand-style cartridge cleaner speeds this up a lot.',
                ok: 'Water running off the cartridge is clear and you can see the white fabric deep in the pleats.',
                v: { cam: [1.3, 1.2, 1.8], at: [0.25, 0.5, 0.55], hi: ['cartridge', 'nozzle'], show: ['nozzle'] },
              },
              {
                t: 'Soak in cleaner if greasy',
                d: 'Once or twice a season, soak the cartridge overnight in cartridge cleaner (a degreaser) mixed per the label, then rinse. Only after degreasing, use an acid soak if it has hard scale.',
                why: 'Sunscreen and body oils seal the fabric’s pores. Acid on an oily cartridge locks the oil in.',
                tip: 'Hosing beads up and runs off instead of soaking in? That’s oil: it’s time for the degreaser soak.',
                ok: 'After rinsing, water soaks into the fabric instead of beading up.',
                v: { cam: [0.8, 1.6, 2.2], at: [-0.1, 0.4, 0.8], hi: ['soak', 'cartridge'], show: ['soak'], hide: ['nozzle'], mv: { cartridge: [-0.4, -0.08, 0.95] } },
              },
              {
                t: 'Lube the O-ring and reassemble',
                d: 'Wipe the tank O-ring and its groove clean, coat the O-ring with a thin film of silicone lube, and put back the cartridge, lid and clamp band. Reinstall the drain plug.',
                why: 'A dry or dirty O-ring is the main cause of tank leaks.',
                tip: 'Use silicone lube only; petroleum jelly swells rubber. If the O-ring is flattened, cracked or stretched, replace it; it’s cheap.',
                ok: 'The clamp band is evenly tight all the way around and the drain plug is in.',
                v: { cam: [1.6, 2.0, 2.0], at: [0.2, 0.9, 0], hi: ['clampBand', 'filterLid'], show: ['lube'], hide: ['soak'], mv: { cartridge: [0, 0, 0], filterLid: [0, 0, 0], airRelief: [0, 0, 0], clampBand: [0, 0, 0] } },
              },
              {
                t: 'Purge air and restart',
                d: 'Open the air-relief valve, reopen any valves you closed, and start the pump. When a steady stream of water (not air) spits out of the relief valve, close it. Write down the new pressure.',
                why: 'Trapped air in the tank reduces the filtering area and can make the pump lose prime.',
                tip: 'If the clean pressure is 5+ psi higher than when the cartridge was new, it’s worn out: replace it.',
                ok: 'No leaks at the band or drain, strong flow at the returns, and a new clean number logged.',
                v: Object.assign({ hi: ['airRelief', 'gauge'], hide: ['lube'], fx: 'clean' }, GAUGE),
              },
            ],
            tricks: [
              ['Swap two cartridges', 'Keep a spare cartridge and rotate them so one can dry fully; dry dirt brushes off easily.'],
              ['Mark the install date', 'Write the date on the cartridge end cap so you know when it’s 1–3 years old.'],
              ['Pool reopening rush', 'Order replacement cartridges before spring; they sell out at opening time.'],
              ['Leak at the band', 'Usually a dirty, dry or twisted O-ring; reseat and lube it before buying parts.'],
            ],
            learn: {
              how: 'A cartridge filter pushes water through a large pleated polyester element. It filters finer than sand (10–20 microns) and uses no backwash water, but the cartridge must be cleaned by hand. If clean pressure stays 5+ psi above its new reading, the cartridge is worn out.',
              specs: [['Clean when', '8–10 psi above clean'], ['Deep-clean', '1–2× per season'], ['Cartridge life', '1–3 years'], ['Filtration', '10–20 microns']],
              terms: [['Clamp band', 'Ring that locks the lid to the tank.'], ['Air-relief valve', 'Small valve on top that bleeds air and pressure from the tank.'], ['Pleats', 'The folds of fabric that give a cartridge its large surface.']],
              mistakes: ['Pressure washing the cartridge.', 'Acid soaking before degreasing.', 'Opening the clamp with pressure on the tank.'],
              tips: ['Keep a second cartridge and swap them so one can dry fully.', 'Dry cartridges brush clean easier than wet ones.'],
            },
          },
          {
            id: 'de',
            name: 'DE filter',
            blurb: 'Tank with a clamp band plus a push-pull or multiport valve. Backwash, then recharge with DE powder.',
            model: 'poolPadDE',
            level: 2,
            time: '30 min (1.5 hrs to tear down)',
            cost: '$15–40 (DE powder)',
            summary: 'DE filters are backwashed like sand, then recharged with fresh diatomaceous-earth powder poured into the skimmer. Once or twice a year, open the tank and hose off the grids.',
            intro: { hi: ['filter', 'grids'], xray: true },
            tools: ['Backwash hose', 'Garden hose + nozzle', 'DE powder + a 1-lb scoop or coffee can', 'Bucket', 'Dust mask (N95)', 'Silicone lube'],
            steps: [
              {
                t: 'Read the gauge',
                d: 'With the pump running, read the pressure. Clean when it’s 8–10 psi above your clean reading.',
                why: 'DE traps dirt down to 3–5 microns, so it clogs faster than sand. Watch the gauge.',
                tip: 'Pressure climbing in only a day or two after cleaning usually means algae in the water; fix the chemistry first.',
                ok: 'The gauge reads 8–10 psi above your clean number.',
                v: Object.assign({ hi: ['gauge'], fx: 'dirty' }, GAUGE),
              },
              {
                t: 'Backwash with the push-pull valve',
                d: 'Pump off. Roll out the hose on the waste port and pull the valve handle up. Run the pump 2–3 minutes until the water runs clear, then pump off and push the handle down. Run 30 seconds on filter, then repeat the backwash once more.',
                why: 'Two short bumps knock old DE and dirt off the grids better than one long backwash.',
                tip: 'Always turn the pump off before moving the handle, just like a multiport, or you’ll damage the valve seals.',
                ok: 'The second backwash runs clear quickly and the handle is back down.',
                v: { cam: [1.6, 1.3, 1.8], at: [0.6, 0.5, 0.3], hi: ['ppHandle', 'pushPull', 'wasteHose'], show: ['wasteHose'], mv: { ppHandle: [0, 0.12, 0] } },
              },
              {
                t: 'Open the tank (yearly)',
                d: 'Once or twice a year: pump off at the breaker, open the air relief until the gauge reads zero, pull the drain plug, remove the clamp band and lift the lid straight up.',
                why: 'Backwashing never removes all the oils and old DE. A teardown every 6–12 months restores full flow.',
                tip: 'Take a phone photo of how the grids sit in the tank before lifting; it makes putting them back much easier.',
                ok: 'The lid is off, the O-ring is intact, and the grid assembly is visible.',
                v: { cam: [1.6, 2.1, 2.0], at: [0.2, 1.0, 0], hi: ['filterLid', 'clampBand'], hide: ['wasteHose'], mv: { ppHandle: [0, 0, 0], filterLid: [0, 0.6, 0], airRelief: [0, 0.6, 0], clampBand: [0, 0.6, 0] } },
              },
              {
                t: 'Lift and hose the grids',
                d: 'Lift the grid assembly out by its manifold (the top piece holding the grids) and hose every grid from top to bottom until no DE remains.',
                why: 'Packed DE and oil block the fabric. Clean grids are what the fresh DE coats.',
                tip: 'Rinse onto a lawn or a tarp, not into a storm drain; many towns regulate DE disposal.',
                ok: 'The grids look clean fabric-colored, not chalky white or gray.',
                v: { cam: [1.4, 1.6, 1.8], at: [0.2, 0.9, 0.3], hi: ['grids', 'nozzle'], show: ['nozzle'], mv: { grids: [0, 0.35, 0.0] } },
              },
              {
                t: 'Inspect for tears',
                d: 'Look over every grid for holes, worn spots or loose seams, and check the manifold for cracks. Replace damaged pieces.',
                why: 'A torn grid sends DE straight into the pool as a fine white cloud on the floor.',
                tip: 'Hold each grid up to the sun: pinholes show as bright dots.',
                ok: 'Every grid is intact and the manifold has no cracks.',
                v: { cam: [0.9, 1.3, 1.1], at: [0.2, 0.9, 0], hi: ['grids'], hide: ['nozzle'] },
              },
              {
                t: 'Reassemble and restart',
                d: 'Set the grids back, lube the tank O-ring, fit the lid and clamp, and reinstall the drain plug. Open the air relief, start the pump, and close the relief when water spits out steadily.',
                why: 'Purging air keeps the top of the grids underwater so they get coated evenly.',
                tip: 'Tighten the clamp band evenly and tap around it with a rubber mallet while snugging so it seats all the way around.',
                ok: 'No leaks and a steady stream of water came out before you closed the relief valve.',
                v: { cam: [1.6, 2.0, 2.0], at: [0.2, 0.9, 0], hi: ['filterLid', 'airRelief'], mv: { grids: [0, 0, 0], filterLid: [0, 0, 0], airRelief: [0, 0, 0], clampBand: [0, 0, 0] } },
              },
              {
                t: 'Recharge with fresh DE',
                d: 'With the pump running, mix the DE with water in a bucket into a thin slurry and pour it slowly into the skimmer nearest the pump. Use the amount on the filter’s label (Hayward: about 1 lb per 8 sq ft, so 6 lb for a 48 sq ft filter). After a plain backwash, many techs use about 80% of that.',
                why: 'The DE layer is what actually filters. Without it, dirt clogs the fabric directly and pressure jumps.',
                tip: 'Wear a dust mask while scooping and keep the bag low to the bucket. If you see DE blowing into the pool, a grid is torn.',
                ok: 'The pressure rises a few psi as the DE coats the grids, then levels off.',
                v: { cam: [0.6, 1.0, 1.6], at: [-0.3, 0.3, 0.55], hi: ['deBag'], show: ['deBag'] },
              },
              {
                t: 'Log the new pressure',
                d: 'Wait a few minutes after adding DE, then write down the clean pressure as your new baseline.',
                why: 'A clean reading that keeps creeping up between teardowns means it’s time to open the tank again.',
                tip: 'Write the date and pressure on a strip of tape on the tank so the whole household can see the history.',
                ok: 'You have a new clean number and it’s within a couple psi of last time.',
                v: Object.assign({ hi: ['gauge'], fx: 'clean' }, GAUGE),
              },
            ],
            tricks: [
              ['Perlite alternative', 'Many DE filters accept perlite, which is less dusty; check your filter’s manual for the amount.'],
              ['Bump, don’t backwash', 'Some DE filters have a bump handle that shakes old DE off the grids without wasting water.'],
              ['Check local rules', 'Some areas ban DE in sewers or storm drains; use a separation tank or bag it for the trash.'],
            ],
            learn: {
              how: 'Diatomaceous earth is the fossilized shells of tiny algae. Pumped onto fabric grids, it forms a porous cake that traps particles down to 3–5 microns, the finest of any pool filter. Backwashing sheds the dirty cake; you add fresh DE to rebuild it.',
              specs: [['Filtration', '3–5 microns'], ['DE dose', 'Per label; Hayward ≈ 1 lb / 8 sq ft'], ['Teardown', '1–2× per year'], ['Grids', 'Usually 7–8 in a typical 36–60 sq ft filter']],
              terms: [['DE', 'Diatomaceous earth, the filter powder.'], ['Manifold', 'Top piece that holds all the grids.'], ['Push-pull valve', 'Simple backwash valve: up = backwash, down = filter.']],
              mistakes: ['Forgetting to recharge DE after backwashing.', 'Adding DE so fast it clumps in the skimmer.', 'Breathing DE dust.'],
              tips: ['Check local rules: some areas ban DE in the sewer; use a separation tank.', 'Perlite is a less dusty alternative many DE filters accept.'],
            },
          },
        ],
      },
      {
        id: 'pool-pump-prime',
        title: 'Fix a pump that loses prime',
        model: 'poolPadSand',
        level: 2,
        time: '30–60 min',
        cost: '$5–40',
        summary: 'Air in the pump’s clear lid, a gurgling sound or no flow means air is getting in on the suction side (the pipes feeding the pump). Most of the time it’s the lid O-ring, a full basket or a low water level.',
        intro: { hi: ['pumpLid', 'basket'], fx: 'air' },
        safety: [
          'Turn the pump off at the breaker, not just the timer, before opening it; automation can restart it.',
          'Never run the pump dry for more than a few minutes. The shaft seal can overheat and melt in moments, and the pump will leak.',
          'Open the filter’s air-relief valve to release pressure before opening the pump lid.',
          'Don’t over-tighten a plastic lid or fittings with tools; they crack.',
        ],
        causes: [
          ['Low water level', 'The skimmer gulps air when the water is below the middle of its opening.'],
          ['Dirty or dry lid O-ring', 'The number-one cause of air leaks.'],
          ['Clogged basket or impeller', 'Starves the pump so it runs rough and noisy.'],
          ['Loose union or cracked fitting', 'Leaks on the suction side pull air in instead of dripping water out.'],
          ['Worn shaft seal', 'Leaks water under the motor when running; also lets air in.'],
        ],
        tools: ['Silicone O-ring lube (not petroleum)', 'Replacement lid O-ring (match the pump model)', 'Garden hose', 'Channel-lock pliers', 'Thread-seal (Teflon) tape', 'Flashlight', 'Can of shaving cream'],
        steps: [
          {
            t: 'Watch for air',
            d: 'With the pump running, look through the clear lid on the front of the pump (the strainer pot). A steady stream of bubbles or a pot that’s only half full of water means air is getting in before the pump.',
            why: 'Leaks on the suction side suck air in instead of dripping, so bubbles in the pot point to everything upstream of the pump.',
            tip: 'A few tiny bubbles right after startup are normal; a constant stream or a visible air pocket at the top of the pot is not.',
            ok: 'You’ve seen whether the pot is full of water or showing a steady stream of air.',
            v: Object.assign({ hi: ['pumpLid', 'basket'], fx: 'air' }, PUMP),
          },
          {
            t: 'Check water level and baskets',
            d: 'Make sure the pool water is halfway up the skimmer opening. Empty the skimmer basket and check that the skimmer’s swinging flap (the weir door) moves freely and isn’t stuck up.',
            why: 'A low level or a blocked skimmer is the cheapest fix and the most common cause.',
            tip: 'Watch the skimmer while the pump runs: if you see a little whirlpool sucking air down, the water is too low.',
            ok: 'Water is mid-skimmer, the basket is empty and the weir door swings freely.',
            v: Object.assign({ hi: ['suction', 'suctionValve'] }, PAD),
          },
          {
            t: 'Pump off, close the valves',
            d: 'Turn off the pump’s breaker. Open the filter’s air-relief valve, then turn the suction valve in front of the pump to closed.',
            why: 'Closing the suction valve stops pool water from flowing back out the pot when the lid comes off.',
            tip: 'Take a quick photo of all the valve handles before you move them so you can put them back exactly.',
            ok: 'Pump off at the breaker, gauge at zero, suction valve closed.',
            v: { cam: [-0.7, 1.1, 1.2], at: [-1.4, 0.35, 0], hi: ['valveHandle', 'timer'], rt: { valveHandle: [0, 90, 0] } },
          },
          {
            t: 'Remove the lid and empty the basket',
            d: 'Turn the lid or its locking ring counterclockwise, lift the lid off, then pull out the strainer basket, empty it and rinse it. Check it for cracks.',
            why: 'A cracked basket lets debris reach the impeller (the spinning part that moves water) and jam it.',
            tip: 'Lid stuck? Push down firmly while turning, or tap the handles gently with your palm. Don’t use a wrench on a clear plastic lid.',
            ok: 'The basket is clean and has no cracks or holes.',
            v: Object.assign({ hi: ['basket', 'pumpLid'], mv: { pumpLid: [0, 0.18, 0.32], basket: [0, 0.32, 0] } }, PUMP),
          },
          {
            t: 'Clean or replace the lid O-ring',
            d: 'Pull the rubber O-ring out of the lid, wipe the groove and lid edge clean, and look for flat spots, cracks or stretching. Replace it if in doubt, then coat it with a thin film of silicone lube.',
            why: 'One grain of sand or a flattened ring lets air in. Petroleum grease swells rubber, so use silicone only.',
            tip: 'Run the O-ring between two fingers: you can feel nicks and flat spots you can’t see. Bring the old one to the store to match it.',
            ok: 'A smooth, round, lightly shiny O-ring sits evenly in a clean groove.',
            v: Object.assign({ hi: ['lidOring', 'newOring', 'lube'], show: ['lube', 'newOring'], mv: { lidOring: [0, 0.12, 0] } }, PUMP),
          },
          {
            t: 'Check plugs and unions',
            d: 'Check the drain plugs on the pump: remove, wrap the threads with 2–3 turns of Teflon tape, and hand-tighten. Hand-tighten the union nuts (the big threaded rings joining pipe to pump) and look for cracks in the fittings near the pump inlet.',
            why: 'These are the other common suction-side air leaks.',
            tip: 'Wrap Teflon tape clockwise as you look at the plug’s end so screwing it in doesn’t unravel the tape.',
            ok: 'Plugs and unions are snug by hand, with no visible cracks.',
            v: { cam: [-0.6, 0.6, 0.9], at: [-1.0, 0.2, 0], hi: ['drainPlugs', 'union'], tool: { id: 'pliers', at: [-1.12, 0.26, 0.06], rot: [0, 0, 90], anim: 'turn' } },
          },
          {
            t: 'Reassemble and fill the pot',
            d: 'Put the basket back. Fill the pot to the brim with a garden hose, then set the lid with its O-ring and turn it hand-tight.',
            why: 'A pump can’t pull water through an empty pot; filling it gives the impeller water to grab right away.',
            tip: 'Hand-tight means firm, not forced; a lid you can’t open by hand next time was over-tightened.',
            ok: 'The pot is full of water and the lid is seated evenly all the way around.',
            v: Object.assign({ hi: ['hoseFill', 'pumpLid'], show: ['hoseFill'], hide: ['newOring', 'lube'], mv: { pumpLid: [0, 0, 0], basket: [0, 0, 0], lidOring: [0, 0, 0] } }, PUMP),
          },
          {
            t: 'Open valves, restart, purge',
            d: 'Open the suction valve, turn the breaker and pump on, and leave the filter air relief open until water spits out, then close it. It should prime (fill with water and run quietly) within a few minutes.',
            why: 'Letting trapped air out of the filter lets water fill the system quickly.',
            tip: 'If it hasn’t primed in about 5 minutes, turn it off, refill the pot and try again rather than letting it run dry.',
            ok: 'The pot is full of water with no air pocket, and the returns push strong flow.',
            v: Object.assign({ hi: ['pumpLid', 'valveHandle'], hide: ['hoseFill'], rt: { valveHandle: [0, 0, 0] } }, PAD),
          },
          {
            t: 'Still pulling air? Find it',
            d: 'With the pump running, smear shaving cream on suspect joints and valve stems on the suction side. If the foam gets sucked in, you’ve found the leak. If you have a 3-way valve, run the skimmer line and the main drain line one at a time.',
            why: 'Isolating each suction line tells you whether the problem is at the pad or in a buried pipe.',
            tip: 'If the air only shows up on one buried line, the leak is underground or at that skimmer; that’s a job for a leak-detection pro.',
            ok: 'You’ve either found the joint pulling air in or narrowed it to one line.',
            v: { cam: [-0.9, 0.9, 1.3], at: [-1.4, 0.25, 0.1], hi: ['suction', 'union', 'suctionValve'], fx: 'air' },
          },
        ],
        tricks: [
          ['Spare O-ring', 'Keep a spare lid O-ring and a tube of silicone lube in the equipment shed; it fixes most prime problems in minutes.'],
          ['Water in a jug', 'Keep a few gallons of pool water in a bucket by the pad for quick refills if the hose is far away.'],
          ['Valve stem leaks', 'Air leaks often come from old valve stems; lubing the O-rings inside the valve with silicone usually cures it.'],
          ['Self-priming isn’t magic', '“Self-priming” pumps still need a full pot and an airtight suction side to pull water up.'],
          ['Variable-speed pumps', 'Prime at high speed for a few minutes, then drop to a low speed; too low and it may never prime.'],
          ['Wrong O-ring bought', 'If a new O-ring sits loose or bulges out, it’s the wrong size; match the part number in the manual.'],
        ],
        refs: [
          ['Pool pump won’t prime (Swim University)', 'https://www.swimuniversity.com/pool-pump-wont-prime/'],
          ['Pool pump losing prime: why and how to fix (Larry’s Pool)', 'https://larryspool.com/pool-pump-losing-prime-why-it-happens-and-how-to-fix-it/'],
          ['Air bubbles and suction leak checks (Pooltivity)', 'https://pooltivity.com/pool-pump-air-bubbles-or-losing-prime-suction-leak-checks/'],
          ['Pentair WhisperFlo troubleshooting (PoolDial)', 'https://pooldial.com/resources/articles/pentair/whisperflo/pentair-whisperflo-troubleshooting-guide'],
        ],
        learn: {
          how: 'A pool pump is a centrifugal pump: the spinning impeller throws water outward, creating suction at the inlet. It can’t pump air. Any leak upstream of the impeller (lid, plugs, unions, valve stems, buried pipe) lets air in under suction, so bubbles appear in the pot and flow drops.',
          specs: [['Water level', 'Mid-skimmer'], ['Prime time', 'Usually under 5 min'], ['Lid O-ring', 'Replace every 1–2 years'], ['Lube', 'Silicone or Teflon only'], ['Never run dry', 'More than a few minutes']],
          terms: [['Prime', 'Pump full of water and moving it.'], ['Suction side', 'Everything between the pool and the pump impeller.'], ['Cavitation', 'Bubbles forming in a starved pump; sounds like gravel.'], ['Union', 'Threaded coupling that lets the pump be removed without cutting pipe.']],
          mistakes: ['Over-tightening the lid (cracks it).', 'Petroleum grease on O-rings.', 'Letting the pump run dry for long.'],
          tips: ['Keep a spare lid O-ring in the shed.', 'A clear lid makes air leaks easy to spot.'],
        },
        pro: 'You suspect a cracked underground pipe, the shaft seal leaks under the motor, or the motor hums but doesn’t spin.',
      },
      {
        id: 'pool-vacuum',
        title: 'Vacuum the pool manually',
        model: 'poolScene',
        level: 1,
        time: '30–60 min',
        cost: '$0 (kit $40–90)',
        summary: 'Hook a vacuum head and hose to the skimmer, fill the hose with water, and sweep slow overlapping passes from shallow to deep. Vacuum to waste when there’s a lot of fine dirt or dead algae.',
        intro: { hi: ['water', 'debris'], show: ['debris'] },
        safety: [
          'Keep everyone out of the pool while the hose is connected.',
          'Don’t block the skimmer or main drain with your body or hands; suction can be strong.',
          'Keep extension cords and electrical gear away from the pool edge.',
        ],
        causes: [
          ['Settled leaves and dirt', 'Normal: vacuum weekly.'],
          ['After an algae bloom', 'Dead algae settles as fine gray or green dust; vacuum to waste.'],
          ['Robot can’t reach', 'Steps, corners and around the main drain.'],
        ],
        tools: ['Weighted vacuum head (brush type for vinyl)', 'Telescopic pole', 'Vacuum hose (pool length + 5 ft)', 'Skim-vac plate (or use the skimmer suction port)', 'Wall brush', 'Leaf rake'],
        steps: [
          {
            t: 'Skim and brush',
            d: 'Skim floating leaves with the leaf rake, then brush the walls and steps, pushing dirt toward the deep end.',
            why: 'Brushing moves dirt to where you’ll vacuum and stops algae from getting a foothold.',
            tip: 'Let the pool sit with the pump off for an hour after brushing if the dirt is fine; it settles to the floor and vacuums up more easily.',
            ok: 'The surface is clear and the walls look clean.',
            v: { cam: [-3.4, 2.4, 3.6], at: [-1.0, -0.8, 0.2], hi: ['brush'], show: ['debris', 'brush'] },
          },
          {
            t: 'Attach head and pole',
            d: 'Clip the vacuum head onto the pole and lower it onto the floor at the shallow end.',
            why: 'Starting shallow means dirt you stir up drifts toward the deep end, where you finish.',
            tip: 'Make sure the clip pins snap into the pole holes; a head that pops off has to be fished out.',
            ok: 'The head rests flat on the floor and the pole is locked.',
            v: { cam: [3.4, 1.8, 2.0], at: [0.2, -1.2, -1.2], hi: ['vacHead', 'vacPole'], hide: ['brush'], show: ['vacHead', 'vacPole'] },
          },
          {
            t: 'Fill the hose with water',
            d: 'Attach one end of the hose to the vacuum head. Feed the hose down into the pool, or hold the free end over a return jet, until no more bubbles come out of the head.',
            why: 'An air-filled hose makes the pump lose prime the moment you connect it.',
            tip: 'Hold the free end against a return jet: in about 20–30 seconds the bubbles stop and the hose sinks. That’s your sign it’s full.',
            ok: 'No bubbles come from the head and the hose lies limp underwater.',
            v: { cam: [1.8, 2.2, 3.0], at: [-0.6, -0.8, -1.4], hi: ['vacHose'], show: ['vacHose'] },
          },
          {
            t: 'Connect at the skimmer',
            d: 'Keeping the free end underwater, set the skim-vac plate on the skimmer basket and press the hose cuff into it, or push the hose into the suction hole at the bottom of the skimmer.',
            why: 'The plate keeps the basket in place to catch leaves so they don’t clog the pump.',
            tip: 'If the pump starts to gurgle when you connect, air got in; pull the hose and refill it.',
            ok: 'You feel the head grip the floor as suction takes hold, and the pump sounds steady.',
            v: { cam: [-0.4, 1.2, -0.2], at: [-2.2, 0.0, -1.4], hi: ['vacPlate', 'skimmer'], show: ['vacPlate'] },
          },
          {
            t: 'Vacuum slowly, overlapping',
            d: 'Push the head in long, slow, overlapping strokes, about a foot per second, like mowing a lawn. If you see a dust cloud, slow down.',
            why: 'Fast strokes stir fine dirt back into the water, where it settles again later.',
            tip: 'If suction weakens, the skimmer basket is full: lift the plate, empty it quickly and reconnect.',
            ok: 'Clean stripes appear behind the head with no dirt clouds.',
            v: { cam: [0.9, 0.9, 0.2], at: [0.3, -1.75, -1.9], hi: ['vacHead'], hide: ['debris'], fx: 'vac' },
          },
          {
            t: 'Vacuum to waste for heavy dirt',
            d: 'For algae or a lot of fine silt, turn the pump off, set a multiport to WASTE, then restart. The water goes out the waste line instead of through the filter. Keep a garden hose running to top up the level.',
            why: 'Fine dust passes through sand filters and comes back into the pool; waste sends it out.',
            tip: 'Watch the water level: waste mode drops it fast. Stop before it falls below the skimmer opening.',
            ok: 'Dirty water flows out the waste hose and the floor comes clean.',
            v: { cam: [0.9, 0.9, 0.2], at: [0.3, -1.75, -1.9], hi: ['vacHead', 'water'], fx: 'vac' },
          },
          {
            t: 'Clean up',
            d: 'Turn the multiport back to FILTER if you changed it. Lift out the head, pull the hose, empty the skimmer and pump baskets, and check the filter pressure.',
            why: 'Vacuuming loads the filter quickly; you may need to backwash or rinse the cartridge.',
            tip: 'Rinse the hose and hang it in loose loops in the shade; sun and tight coils crack hoses.',
            ok: 'Baskets empty, valve on FILTER, and the pressure is within a few psi of normal.',
            v: { cam: [-0.4, 1.2, 0.4], at: [-2.2, 0.0, -1.4], hi: ['skimBasket'], hide: ['vacHead', 'vacPole', 'vacHose', 'vacPlate'], mv: { skimBasket: [0, 0.4, 0] } },
          },
        ],
        tricks: [
          ['Leaf bagger first', 'For lots of leaves, use a leaf bagger (water-powered) or rake first; leaves clog the hose and skimmer.'],
          ['One suction line', 'Close the main drain valve while vacuuming so all the suction goes to the skimmer and hose.'],
          ['Brush head on vinyl', 'Use a brush-type head on vinyl liners so wheels and grit don’t scratch.'],
          ['Morning after storms', 'Vacuum early after a storm before leaves leave tannin stains on plaster.'],
          ['Lost suction mid-job', 'Usually a full basket or air in the hose; empty, refill the hose and reconnect.'],
          ['Pool too cloudy to see', 'Use a weighted head and do a grid pattern from memory, or add a clarifier and vacuum the next day.'],
        ],
        refs: [
          ['How to vacuum a pool (Swim University)', 'https://www.swimuniversity.com/how-to-vacuum-a-pool/'],
          ['How to vacuum a pool (Leslie’s)', 'https://www.lesliespool.com/blog/how-to-vacuum-a-pool.html'],
          ['Hayward S200 sand filter manual: waste setting (Hayward)', 'https://www.thepoolfactory.com/media/wysiwyg/pdfs/hayward_s200_filter.pdf'],
        ],
        learn: {
          how: 'A manual vacuum uses the pump’s suction through the skimmer line. The weighted head rolls on the floor and the hose carries debris to the skimmer basket, the pump basket, and then the filter (or out the waste port).',
          specs: [['Stroke speed', '≈ 1 ft per second'], ['Hose length', 'Pool length + 5 ft'], ['Pump speed', 'Medium on variable-speed; very high can collapse the hose']],
          terms: [['Vacuum to waste', 'Multiport setting that dumps water instead of filtering it.'], ['Skim-vac', 'Plate that connects the hose over the skimmer basket.'], ['Weir door', 'Floating flap in the skimmer mouth.']],
          mistakes: ['Connecting a hose full of air.', 'Rushing the strokes.', 'Forgetting to empty the baskets afterward.', 'Leaving the valve on WASTE.'],
          tips: ['Use a brush head on vinyl so wheels don’t scratch.', 'Vacuum the morning after a storm before debris stains plaster.'],
        },
        pro: 'There’s heavy black algae, staining that won’t brush off, or you want an automatic cleaner plumbed in.',
      },
      {
        id: 'pool-open-close',
        title: 'Close a pool for the season',
        model: 'poolScene',
        level: 2,
        time: '3–5 hrs',
        cost: '$60–200 (chemicals, plugs)',
        summary: 'Before freezing weather, balance and shock the water, lower the level, blow out and plug the lines, drain the equipment, and put on a safety cover. Opening in spring reverses it.',
        intro: { hi: ['water', 'cover'], show: ['cover'] },
        safety: [
          'A blower forces air at high volume; plugs can pop out. Keep your face away from fittings.',
          'Pumps, filters and heaters must be fully drained or they crack when the water inside freezes.',
          'Use a safety cover meeting ASTM F1346 if children or pets are nearby; a solid tarp-style cover with water on it is a drowning risk.',
          'Cover anchors left sticking up are trip hazards; screw them down flush when the cover is off.',
        ],
        causes: [
          ['When to close', 'When the water stays under about 65 °F; algae grows slowly below that.'],
          ['Mesh vs solid cover', 'Mesh lets rain drain through; solid keeps water cleaner but needs a cover pump.'],
          ['Freeze damage', 'Water left in pipes, pumps and heaters expands about 9% as it freezes and cracks them.'],
        ],
        tools: ['Shop-vac (blow mode) or cyclone blower', 'Rubber expansion plugs sized to the returns and skimmer lines', 'Gizzmo for each skimmer', 'Winterizing chemicals (algaecide, enzyme)', 'Safety cover + anchor tool', 'Submersible pump (to lower water)', 'Test kit'],
        steps: [
          {
            t: 'Balance and shock',
            d: 'A few days before closing, bring pH to 7.4–7.6 and alkalinity into range, then shock to SLAM level (about 40% of CYA) and hold it until the water is clear. Let chlorine fall back below about 5 ppm before adding algaecide.',
            why: 'Clean, balanced water won’t stain or grow algae under the cover, and strong chlorine destroys algaecide.',
            tip: 'Do an overnight chlorine test before closing: losing under 1 ppm overnight means the water is truly clean.',
            ok: 'Water is crystal clear, pH 7.4–7.6, and FC has dropped below 5 ppm.',
            v: Object.assign({ hi: ['winterKit', 'testKit'], show: ['winterKit'], hide: ['cover'] }, CHEM),
          },
          {
            t: 'Clean the pool',
            d: 'Skim, brush and vacuum thoroughly. Run the filter and clean it afterward.',
            why: 'Debris left over winter decays, feeds algae and stains plaster.',
            tip: 'Do this last thing before closing; every leaf that lands after you vacuum sits there until spring.',
            ok: 'You can see the floor clearly with no leaves or dirt.',
            v: { cam: [-3.4, 2.4, 3.6], at: [-1.0, -0.8, 0.2], hi: ['brush', 'water'], show: ['brush'] },
          },
          {
            t: 'Lower the water',
            d: 'Pump water out to the level your cover maker specifies. As a guide: mesh covers often 12–18″ below the coping (the pool edge); solid covers just below the skimmer and returns.',
            why: 'The skimmer and returns must be above the water so their lines can be blown dry.',
            tip: 'Use a submersible pump with its hose aimed downhill, away from the house and septic field. Don’t drain a vinyl pool lower than the liner maker allows.',
            ok: 'The waterline sits at your cover’s target, below the skimmer mouth.',
            v: Object.assign({ hi: ['water'], hide: ['brush'], mv: { water: [0, -0.3, 0] } }, OV),
          },
          {
            t: 'Blow out the lines',
            d: 'At the equipment, blow air into each line in turn until bubbles come out of the skimmer, returns and main drain. Plug each pool-side opening while air is still bubbling out of it.',
            why: 'Lines with no water in them can’t freeze and crack. Closing the main drain while it still bubbles traps an air pocket that keeps water out.',
            tip: 'You’ll hear the blower note change and see a steady boil of bubbles at the fitting: that’s the moment to plug it.',
            ok: 'Every line bubbled steadily before you plugged it, and no water returns when the blower stops.',
            v: { cam: [0.2, 1.5, 0.4], at: [-2.1, 0.0, -1.6], hi: ['blower', 'skimmer'], show: ['blower'] },
          },
          {
            t: 'Plug returns, add the Gizzmo',
            d: 'Push rubber expansion plugs into each return and turn their wing nuts until snug. Screw a Gizzmo (a hollow plastic plug) into the hole in the bottom of each skimmer.',
            why: 'The Gizzmo crushes instead of the skimmer if water freezes in it.',
            tip: 'Tie a short string from each plug to its fitting or note them on a photo, so you find them all in spring.',
            ok: 'Every plug is snug and the Gizzmo is threaded in hand-tight.',
            v: { cam: [-1.0, 0.8, 0.9], at: [1.7, -0.45, 0.5], hi: ['plugs', 'returns'], show: ['plugs', 'gizzmo'] },
          },
          {
            t: 'Winterize the equipment',
            d: 'Remove every drain plug from the pump, filter and heater and store them in the pump basket. Set the multiport to WINTER or CLOSED (handle between positions). Pull a cartridge or DE grids, clean them and store indoors.',
            why: 'Any water left in a pump or heater body freezes and splits it.',
            tip: 'Turn the pump breaker off and tape over it with a note, so nobody runs a dry pump on a warm winter day.',
            ok: 'All drain plugs are out and in the basket, and the pump breaker is off.',
            v: { cam: [-0.4, 1.2, 0.2], at: [-2.4, 0.2, -1.6], hi: ['gizzmo', 'blower'] },
          },
          {
            t: 'Remove ladder and accessories',
            d: 'Loosen the anchor bolts, lift out ladders and rails, clean them and store them dry. Cap the anchor sockets.',
            why: 'The cover must lie flat, and ice can bend ladders left in the water.',
            tip: 'A wedge bolt that won’t release often loosens with a tap on top after backing it off a few turns.',
            ok: 'No ladders or rails stand in the way of the cover.',
            v: { cam: [4.0, 1.8, -0.8], at: [1.8, 0.2, -2.6], hi: ['ladder'], mv: { ladder: [0.6, 0.8, 0] }, hide: ['blower'] },
          },
          {
            t: 'Add winter chemicals, install the cover',
            d: 'Pour algaecide and enzyme around the pool per the label. Lay the safety cover over the pool and hook each strap to its anchor, tightening them evenly with the anchor tool.',
            why: 'Even tension spreads the weight of snow and water across all the anchors.',
            tip: 'Tighten straps opposite each other in pairs, like the lug nuts on a car wheel, so the cover stays centered.',
            ok: 'The cover is centered, taut, and every strap is attached with similar tension.',
            v: Object.assign({ hi: ['cover'], show: ['cover'], hide: ['ladder'] }, OV),
          },
        ],
        tricks: [
          ['Photograph the pad', 'Photograph all valve positions before closing so opening day is easy.'],
          ['Plugs in the basket', 'Put every drain plug in the pump basket; that’s the first place you’ll look in spring.'],
          ['Antifreeze as backup', 'In very cold areas, pour pool antifreeze (propylene glycol, never car antifreeze) into blown lines as insurance.'],
          ['Close later, not earlier', 'Closing while the water is still warm invites algae; wait until it stays under about 65 °F.'],
          ['Check the cover in winter', 'Pump water off a solid cover after rain or snowmelt so it doesn’t sag or tear.'],
          ['Plug won’t seal', 'Expansion plugs come in sizes (#8, #9 and so on); bring one to the store to match if water seeps past.'],
        ],
        refs: [
          ['How to winterize a pool (This Old House)', 'https://www.thisoldhouse.com/pools/21335521/how-to-winterize-a-pool'],
          ['Close your pool for winter (Lowe’s)', 'https://www.lowes.com/n/how-to/close-your-pool-for-winter'],
          ['SLAM: Shock Level And Maintain (Trouble Free Pool)', 'https://www.troublefreepool.com/blog/2019/01/28/slam-shock-level-and-maintain/'],
          ['Steps for closing and winterizing a pool (Arm & Hammer)', 'https://www.armandhammer.com/en/articles/steps-for-closing-and-winterizing-a-pool'],
        ],
        learn: {
          how: 'Closing protects the plumbing from freezing and keeps the water clean enough that opening is easy. The big risks are water trapped in pipes and equipment, and algae growing in warm spells. Low water, blown lines and plugs handle the first; balanced, shocked water and algaecide handle the second.',
          specs: [['Close when', 'Water < about 65 °F'], ['Water level (mesh)', 'Per cover maker; often 12–18″ below coping'], ['Water level (solid)', 'Just below skimmer and returns'], ['Shock level', 'About 40% of CYA'], ['Opening chlorine', 'SLAM to clear, then FC ≥ 7.5% of CYA']],
          terms: [['Gizzmo', 'Hollow skimmer plug that crushes to absorb ice expansion.'], ['Expansion plug', 'Rubber plug with a wing nut that seals a pipe.'], ['Safety cover', 'Anchored cover rated to hold a person (ASTM F1346).'], ['Coping', 'The cap stone or edge around the pool.']],
          mistakes: ['Closing too early in warm weather.', 'Forgetting the heater drain plugs.', 'Relying on antifreeze instead of blowing the lines dry.'],
          tips: ['Put all the drain plugs in the pump basket so you find them in spring.', 'Photograph the pad before closing to remember valve positions.'],
        },
        pro: 'You don’t have a strong blower, the pool has in-floor cleaning heads, or the heater and automation need professional winterizing.',
        variants: [
          { id: 'close', name: 'Closing (fall)', blurb: 'Winterize before freezing weather.' },
          {
            id: 'open',
            name: 'Opening (spring)',
            blurb: 'Remove the cover, refill, restart the equipment and clear the water.',
            time: '3–4 hrs (+ a few days of shock)',
            cost: '$80–250',
            summary: 'Clear the cover, take out the winter plugs, refill to mid-skimmer, restart the equipment and shock until the water is clear.',
            intro: { hi: ['cover'], show: ['cover', 'plugs', 'gizzmo'], mv: { water: [0, -0.3, 0], ladder: [0, 2.5, 0] } },
            tools: ['Cover pump or push broom', 'Cover cleaner', 'Anchor tool / Allen key', 'Drain plugs + silicone O-ring lube', 'FAS-DPD test kit', 'Liquid chlorine', 'Pool brush'],
            steps: [
              {
                t: 'Clear and remove the cover',
                d: 'Pump or sweep off standing water and leaves first. Release the straps from the anchors, fold the cover from one end toward the other, then hose it, let it dry and store it.',
                why: 'Dragging a wet, dirty cover off dumps all its debris into the pool.',
                tip: 'Get a helper: two people folding accordion-style from one end keeps the debris on top of the cover and out of the water.',
                ok: 'The cover is off with little debris in the water, and it’s drying for storage.',
                v: Object.assign({ hi: ['cover', 'coping'], hide: ['cover'] }, OV),
              },
              {
                t: 'Pull the plugs and Gizzmo',
                d: 'Unscrew the Gizzmo from each skimmer and loosen and remove the expansion plugs. Reinstall the return eyeballs (the aimable nozzles).',
                why: 'The return eyeballs aim water around the pool so chlorine mixes evenly.',
                tip: 'Aim the eyeballs down and in the same direction around the pool so the water swirls like a slow whirlpool.',
                ok: 'All winter plugs are out and every return has its eyeball.',
                v: { cam: [-1.0, 0.8, 0.9], at: [1.7, -0.45, 0.5], hi: ['returns', 'startKit'], hide: ['plugs', 'gizzmo'], show: ['startKit'] },
              },
              {
                t: 'Raise the water to mid-skimmer',
                d: 'Fill with a garden hose until the water is halfway up the skimmer opening.',
                why: 'Too low and the pump sucks air; too high and the skimmer can’t skim the surface.',
                tip: 'Use a hose pre-filter if your water has iron or copper; metals stain plaster green or brown when chlorine is added.',
                ok: 'The waterline is centered in the skimmer opening.',
                v: Object.assign({ hi: ['water', 'skimmer'], mv: { water: [0, 0, 0] } }, OV),
              },
              {
                t: 'Reinstall the ladder',
                d: 'Set the ladder and rails into their anchors and tighten the wedge bolts until they don’t move.',
                why: 'Loose rails rattle and can pull out under someone’s weight.',
                tip: 'Grab each rail and shake it hard; if it moves, tighten again.',
                ok: 'Ladder and rails don’t wiggle when shaken.',
                v: { cam: [4.0, 1.8, -0.8], at: [1.8, 0.0, -2.6], hi: ['ladder'], mv: { ladder: [0, 0, 0] } },
              },
              {
                t: 'Restart the equipment',
                d: 'Lube the O-rings on the drain plugs with silicone and reinstall them. Reinstall the cartridge or grids, fill the pump pot, set the multiport to FILTER and start up. Check every fitting for leaks.',
                why: 'Plugs and O-rings dry out over winter; lube helps them seal.',
                tip: 'Open the filter air relief at startup and close it when water spits out; it helps the pump prime.',
                ok: 'The pump primes, the returns flow strongly and nothing drips.',
                v: Object.assign({ hi: ['skimmer', 'returns'] }, OV),
              },
              {
                t: 'Test and shock',
                d: 'Test all levels and balance alkalinity and pH. Then hold chlorine at shock level (about 40% of CYA) until the water is clear, overnight chlorine loss is under 1 ppm, and combined chlorine is 0.5 or less.',
                why: 'Those three signs together mean all the algae is dead. Stopping early lets it come right back.',
                tip: 'Test and re-dose chlorine 2–3 times a day while shocking; it drops fast while killing algae.',
                ok: 'All three SLAM criteria pass on the same day.',
                v: Object.assign({ hi: ['testKit', 'chlorine'], show: ['sample'] }, KIT),
              },
              {
                t: 'Brush, vacuum, run 24/7',
                d: 'Brush the walls and floor daily and run the filter around the clock until the water is clear. Clean the filter whenever pressure rises 8–10 psi.',
                why: 'Brushing exposes algae to chlorine; the filter removes the dead algae.',
                tip: 'Expect to clean the filter several times in the first week; that’s normal and means it’s working.',
                ok: 'You can see the main drain clearly from the deep end.',
                v: { cam: [-3.4, 2.4, 3.6], at: [-1.0, -0.8, 0.2], hi: ['brush', 'water'], show: ['brush'] },
              },
            ],
          },
        ],
      },
      {
        id: 'hot-tub-refresh',
        title: 'Drain, clean and refill a hot tub',
        model: 'hotTub',
        level: 1,
        time: '3–4 hrs (+ heating)',
        cost: '$30–120',
        summary: 'Every 3–4 months, flush the plumbing, drain the spa, clean the shell and filter, then refill through the filter well and rebalance. Replace the filter cartridge every 1–2 years.',
        intro: { hi: ['water', 'filter'] },
        safety: [
          'Turn the power off at the spa’s GFCI disconnect (the outdoor breaker box) before draining. Pumps and heaters burn out if they run dry.',
          'Don’t leave an empty acrylic shell in hot direct sun for hours; it can blister.',
          'Wear gloves and eye protection when handling cleaners and acid.',
          'Keep the water at 104 °F or below; hotter water can cause overheating and fainting.',
        ],
        causes: [
          ['Foamy, cloudy or smelly water', 'Dissolved solids from soaps, lotions and chemicals have built up; time to drain.'],
          ['Weak jets', 'Clogged filter, or an air lock after refilling.'],
          ['Rule of thumb', 'Days between drains = spa gallons ÷ 3 ÷ average daily users.'],
        ],
        tools: ['Line-flush (plumbing purge) cleaner', 'Garden hose + hose pre-filter', 'Submersible pump (optional)', 'Filter cleaner + bucket', 'Non-abrasive spa cleaner + soft sponge', 'Shop-vac', 'Test strips or drop kit + start-up chemicals'],
        steps: [
          {
            t: 'Flush the lines',
            d: 'With the old water still in, add line-flush cleaner per the label and run all the jets on high for 20–30 minutes.',
            why: 'Biofilm (a slimy layer of bacteria) grows inside the pipes where you can’t scrub. Flushing before draining lets it go out with the old water.',
            tip: 'Leave the cover open while flushing; the foam that rises is the gunk coming out. Skim it off.',
            ok: 'The foam and gunk have mostly stopped coming out of the jets.',
            v: { cam: [2.8, 2.4, 2.8], at: [0, 0.6, 0], hi: ['jets', 'flushBottle'], show: ['flushBottle', 'bubbles'], hide: ['cover'] },
          },
          {
            t: 'Power off at the disconnect',
            d: 'Open the outdoor disconnect box near the spa and switch its breaker OFF. Confirm the topside control panel goes dark.',
            why: 'If the pump or heater turns on with no water, it can burn out in minutes.',
            tip: 'Hang a note on the box (“Spa draining, don’t turn on”) so nobody flips it back on.',
            ok: 'The spa’s control panel is dark and the jets won’t start.',
            v: { cam: [3.0, 1.5, 0.6], at: [1.75, 1.0, -0.7], hi: ['gfci'], hide: ['bubbles', 'flushBottle'] },
          },
          {
            t: 'Drain the spa',
            d: 'Screw a garden hose onto the drain spigot at the base, run it somewhere the water can soak in, and open the drain. A submersible pump drains the last foot much faster.',
            why: 'A 400-gal spa takes 1–2 hours by gravity, or about 20 minutes with a pump.',
            tip: 'Let the chlorine drop below about 1 ppm (wait a day with the cover off) before draining onto lawn or plants.',
            ok: 'The tub is empty except for a little water in the footwell.',
            v: { cam: [2.6, 1.6, 3.2], at: [0.4, 0.3, 0.8], hi: ['drain', 'hose', 'subPump'], show: ['subPump'], mv: { water: [0, -0.32, 0] } },
          },
          {
            t: 'Pull and soak the filter',
            d: 'Lift the cartridge out of the filter well, hose it between the pleats, then soak it in filter cleaner per the label (often overnight).',
            why: 'Oils and lotions glue dirt into the pleats; hosing alone won’t remove them.',
            tip: 'If you have a spare cartridge, put it in after refilling and let this one soak and dry fully for next time.',
            ok: 'The rinsed cartridge looks white between the pleats and is soaking.',
            v: { cam: [2.6, 1.6, 2.0], at: [0.6, 0.6, 0.4], hi: ['filter', 'soakBucket'], show: ['soakBucket'], mv: { filter: [1.97, -0.62, -0.98] } },
          },
          {
            t: 'Clean the empty shell',
            d: 'Wipe the shell, seats and jets with a non-abrasive spa cleaner and a soft sponge, rinse, then vacuum out the rinse water with a shop-vac.',
            why: 'Household cleaners foam in the new water and some damage acrylic.',
            tip: 'A soft toothbrush cleans around jet faces and the waterline ring; never use scouring pads on acrylic.',
            ok: 'The shell feels smooth, not slimy or gritty, and the footwell is dry.',
            v: { cam: [2.0, 2.4, 2.0], at: [0, 0.3, 0], hi: ['shell', 'jets'], hide: ['water', 'subPump'] },
          },
          {
            t: 'Refill through the filter well',
            d: 'Close the drain. Put the hose (with a pre-filter) into the empty filter well and fill until the water is at the fill line, usually about 2″ above the highest jet.',
            why: 'Filling through the filter well pushes air out of the pump and heater and prevents an air lock (a trapped bubble that stops flow).',
            tip: 'If the jets don’t run after startup, you have an air lock: loosen the union nut on the pump a quarter turn until water drips, then retighten.',
            ok: 'The water is at the fill line, above every jet and the skimmer.',
            v: { cam: [-1.8, 2.0, 2.8], at: [-0.6, 0.7, 0.8], hi: ['fillHose', 'water'], show: ['fillHose', 'water'], mv: { water: [0, 0, 0] } },
          },
          {
            t: 'Install the clean filter',
            d: 'Rinse the soaked cartridge well (cleaner residue causes foam), or use your dry spare, and seat it in the filter well.',
            why: 'Rotating two filters lets one dry completely, which cleans better and lasts longer.',
            tip: 'Rinse until no suds appear when you squeeze the pleats; leftover cleaner will foam in the fresh water.',
            ok: 'The cartridge sits fully seated and doesn’t wobble.',
            v: { cam: [-1.0, 1.8, 2.2], at: [-0.6, 0.8, 0.9], hi: ['filter'], hide: ['fillHose', 'soakBucket'], mv: { filter: [0, 0, 0] } },
          },
          {
            t: 'Power on and balance',
            d: 'Turn the power on and run the jets to push out air. Then set alkalinity to 80–120 ppm, pH to 7.4–7.6, calcium to 150–250, and sanitizer to 3–5 ppm chlorine or 4–6 ppm bromine.',
            why: 'Fresh fill water is rarely balanced. Getting it right now protects the heater and shell and keeps the water safe in hot temperatures where germs grow fast.',
            tip: 'Add chemicals one at a time with the jets running and wait 15–20 minutes between them.',
            ok: 'Jets run strong, and a test shows all numbers in range.',
            v: { cam: [2.4, 2.0, 2.6], at: [0.4, 0.9, 0.4], hi: ['panel', 'chems'], show: ['chems', 'bubbles'] },
          },
          {
            t: 'Cover and heat',
            d: 'Close the cover and lock its straps, then let it heat. Expect about 3–6 °F per hour, so plan on most of a day to reach 100–104 °F.',
            why: 'The cover holds the heat in; most heat is lost from the open water surface.',
            tip: 'Set the thermostat to your target and leave it; cranking it to the max doesn’t heat faster.',
            ok: 'The cover is latched and the display shows the temperature rising.',
            v: { cam: [3.4, 2.6, 3.6], at: [0, 0.55, 0], hi: ['cover'], show: ['cover'], hide: ['chems', 'bubbles'] },
          },
        ],
        tricks: [
          ['Drain day math', 'Divide spa gallons by 3, then by the average number of daily users: 400 ÷ 3 ÷ 2 ≈ 67 days between drains.'],
          ['Two filters', 'Buy a second cartridge and alternate weekly; a fully dried filter cleans better and lasts longer.'],
          ['Pre-filter the fill', 'A hose-end pre-filter removes metals and sediment that stain and cloud new water.'],
          ['Shower first', 'Asking everyone to rinse off before getting in cuts foam, chemical use and drain frequency.'],
          ['Air lock fix', 'If the jets won’t run after refilling, loosen the pump union until water spurts, then snug it.'],
          ['Cover care', 'Wipe and condition the vinyl cover top each drain; a waterlogged cover loses heat and gets heavy.'],
        ],
        refs: [
          ['How to drain a hot tub (Swim University)', 'https://www.swimuniversity.com/drain-hot-tub/'],
          ['How to drain, clean and refill your hot tub (Great Bay Spas)', 'https://www.greatbayspas.com/blog/how-to-drain-clean-and-refill-your-hot-tub/'],
          ['Controlling Legionella in hot tubs (CDC)', 'https://www.cdc.gov/control-legionella/php/toolkit/hot-tub-module.html'],
          ['How to clean a hot tub (Home Depot)', 'https://www.homedepot.com/c/ah/how-to-clean-a-hot-tub/9ba683603be9fa5395fab901914b341f'],
        ],
        learn: {
          how: 'A hot tub is a small, hot body of water with a heavy bather load, so dissolved solids build up fast and the sanitizer can’t keep up. Draining resets the water. The filter cartridge catches oils and dirt and needs a chemical clean, not just a rinse.',
          specs: [['Drain interval', 'Every 3–4 months'], ['Filter rinse', 'Every 1–2 weeks'], ['Filter soak', 'Monthly'], ['Filter replace', '12–24 months'], ['Free chlorine', '3–5 ppm (CDC public spas 3–10)'], ['Bromine', '4–6 ppm'], ['pH', '7.4–7.6 (7.2–7.8 OK)'], ['Max temperature', '104 °F']],
          terms: [['Air lock', 'Air trapped in the pump; it hums but won’t move water.'], ['TDS', 'Total dissolved solids: everything dissolved in the water.'], ['Line flush', 'Cleaner that strips biofilm from plumbing.'], ['GFCI disconnect', 'Outdoor breaker box with a shock-protection breaker for the spa.']],
          mistakes: ['Filling through the footwell (causes air locks).', 'Running the heater with low water.', 'Using dish soap or household cleaners on the shell.'],
          tips: ['Use a hose pre-filter if your water is high in metals.', 'Note the drain date on your phone calendar.'],
        },
        pro: 'The tub air-locks repeatedly, shows a heater or flow error that won’t clear, or the GFCI trips when heating.',
      },
    ],
  });

  /* =========================================================================
     GUIDES · Seasonal
     ========================================================================= */
  const BIB_OUT = { cam: [0.55, 0.85, 0.85], at: [0, 0.55, 0.1] };
  const BIB_IN = { cam: [0.32, 0.5, -0.95], at: [0, 0.5, -0.22] };
  const HOUSE = { cam: [7.0, 4.2, 9.5], at: [0.6, 1.4, 0] };

  TB.category({
    id: 'seasonal',
    icon: 'seasonal',
    code: 'SEA',
    name: 'Seasonal',
    domain: 'exterior',
    blurb: 'Get the house ready for freezes, storms, summer heat and the holidays',
    repairs: [
      {
        id: 'winterize-faucet',
        title: 'Winterize outdoor faucets',
        model: 'hoseBibStd',
        level: 1,
        time: '15–30 min',
        cost: '$0–15',
        summary: 'Disconnect hoses, shut the inside valve, drain the pipe through the faucet and the bleed cap, and cover the faucet. A frozen hose bib can split and flood a basement when it thaws.',
        intro: { hi: ['bib', 'shutoff'] },
        safety: ['Have a bucket and towel ready before you open the bleed cap.', 'Do this before the first night below 28 °F.'],
        causes: [['Standard hose bib', 'The valve seat is outside in the cold, so the pipe must be shut off and drained from inside.'], ['Frost-free sillcock', 'The seat is 6–18″ inside the warm wall; it drains itself as long as no hose is attached.'], ['Burst signs', 'Water inside the wall the first time you use it in spring.']],
        tools: ['Bucket', 'Towel', 'Insulated faucet cover', 'Foam pipe insulation (optional)', 'Flashlight'],
        steps: [
          { t: 'Disconnect the hose', d: 'Unscrew the hose, drain it and store it out of the sun.', why: 'A connected hose holds water in the faucet, which freezes and splits it, even on frost-free models.', v: Object.assign({ hi: ['hose'] }, BIB_OUT) },
          { t: 'Find the inside shutoff', d: 'Inside, follow the pipe from the faucet back to its shutoff valve, usually within a few feet of the wall.', why: 'Each standard hose bib should have its own stop-and-waste valve so you can drain just that line.', v: Object.assign({ hi: ['shutoff', 'pipe'], hide: ['hose'] }, BIB_IN) },
          { t: 'Close the shutoff', d: 'Turn the handle a quarter turn (ball valve) or clockwise until it stops (gate or stop valve).', why: 'Water now stops at a valve inside the heated basement.', v: Object.assign({ hi: ['shutoffHandle'], rt: { shutoffHandle: [0, 0, 90] } }, BIB_IN) },
          { t: 'Open the outside faucet', d: 'Open the faucet fully and leave it open. Water in the pipe drains out.', why: 'The open faucet lets air in so the pipe can drain, and gives freezing water room to expand.', v: Object.assign({ hi: ['bib', 'handle'], rt: { handle: [0, 0, -180] }, fx: 'drain' }, BIB_OUT) },
          { t: 'Open the bleed cap', d: 'Hold a bucket under the small cap on the side of the shutoff and unscrew it. Let it drain, then screw it back on.', why: 'The bleed port drains the short section between the valve and the wall that the faucet can’t.', v: Object.assign({ hi: ['bleedCap', 'bucket'], show: ['bucket'], mv: { bleedCap: [0.02, 0, 0] }, fx: 'bleed' }, BIB_IN) },
          { t: 'Insulate exposed pipe', d: 'Slip foam insulation over the supply pipe in cold areas like crawlspaces and rim joists.', why: 'Pipes near the rim joist are the coldest in the house.', v: Object.assign({ hi: ['insulation'], show: ['insulation'], hide: ['bucket'], mv: { bleedCap: [0, 0, 0] } }, BIB_IN) },
          { t: 'Cover the faucet', d: 'Fit an insulated cover over the faucet and tighten its loop. Leave the faucet open under it.', why: 'The cover slows heat loss through the faucet body and wall penetration.', v: Object.assign({ hi: ['cover'], show: ['cover'] }, BIB_OUT) },
        ],
        learn: {
          how: 'Water expands about 9% when it freezes. In a closed pipe that pressure splits copper and brass. Shutting off the supply indoors and draining the outside section leaves nothing to freeze. A frost-free sillcock moves the shutoff into the heated wall, so the outside part drains itself.',
          specs: [['Do it before', 'First night < 28 °F'], ['Frost-free lengths', '6, 8, 10, 12, 14, 18″'], ['Slope (frost-free)', 'Down toward the outside']],
          terms: [['Hose bib / sillcock', 'Outdoor faucet.'], ['Stop and waste valve', 'Shutoff with a drain (bleed) port.'], ['Vacuum breaker', 'Anti-siphon cap on top of modern sillcocks.']],
          mistakes: ['Leaving the hose connected.', 'Closing the inside valve but leaving the outside faucet closed.', 'Forgetting a second faucet on another wall.'],
          tips: ['Tag the indoor valves so anyone in the house can find them.', 'Turn on in spring only after nights stay above freezing.'],
        },
        pro: 'You find water or stains inside the wall in spring, there’s no indoor shutoff, or you want to upgrade to frost-free faucets in a finished wall.',
        variants: [
          { id: 'standard', name: 'Standard hose bib', blurb: 'Short body, valve seat right at the outside wall. Needs an inside shutoff.' },
          {
            id: 'frost-free',
            name: 'Frost-free sillcock',
            blurb: 'Long body that reaches inside the wall; often has a vacuum-breaker cap on top.',
            model: 'hoseBibFF',
            time: '5–10 min',
            summary: 'A frost-free sillcock shuts off 6–18″ inside the wall and drains itself. The job is mostly making sure it can drain: hose off, slope right, and a quick check inside.',
            intro: { hi: ['bib', 'pipe'], xray: true },
            steps: [
              { t: 'Disconnect the hose', d: 'Remove the hose and any splitter or timer.', why: 'A hose holds water in the barrel, which freezes and splits it inside the wall where you can’t see the leak.', v: Object.assign({ hi: ['hose'] }, BIB_OUT) },
              { t: 'Check the slope', d: 'The faucet should tilt slightly down to the outside. Look at the flange: it should sit flat with the spout below the body.', why: 'If it slopes inward, water stays in the long barrel and freezes.', v: { cam: [0.9, 0.75, -0.2], at: [0, 0.6, -0.1], hi: ['bib'], xray: true, hide: ['hose'] } },
              { t: 'Open it to drain, then close it', d: 'Open the faucet for a few seconds and close it. A short dribble after closing is normal.', why: 'That dribble is the barrel emptying, which means the self-drain works.', v: Object.assign({ hi: ['bib', 'handle'], rt: { handle: [0, 0, -180] }, fx: 'drain' }, BIB_OUT) },
              { t: 'Check the inside end', d: 'Inside, look at the connection behind the wall for drips and insulate the supply pipe.', why: 'A cracked barrel leaks into the wall only when the faucet is on; checking now catches last winter’s damage.', v: Object.assign({ hi: ['pipe', 'insulation'], show: ['insulation'], rt: { handle: [0, 0, 0] } }, BIB_IN) },
              { t: 'Close the inside shutoff if you have one', d: 'In very cold climates or for a vacation home, close the inside shutoff too and drain it at the bleed cap.', why: 'It’s a second line of defense if the faucet is ever left with a hose on.', v: Object.assign({ hi: ['shutoffHandle', 'bleedCap'], rt: { shutoffHandle: [0, 0, 90] } }, BIB_IN) },
              { t: 'Cover the faucet', d: 'Add an insulated cover for extra protection in windy spots.', why: 'Wind across the flange pulls heat out of the barrel.', v: Object.assign({ hi: ['cover'], show: ['cover'] }, BIB_OUT) },
            ],
          },
        ],
      },
      {
        id: 'winter-prep',
        title: 'Get the house ready for winter',
        model: 'winterHome',
        level: 1,
        time: '1 day',
        cost: '$40–200',
        summary: 'A one-day walk around the house before the first freeze: gutters, downspouts, outdoor water, the AC, drafts, the furnace filter, alarms and snow gear.',
        intro: { hi: ['house', 'gutter', 'garage'] },
        safety: ['Use a ladder stabilizer and keep three points of contact on the ladder.', 'Don’t clean gutters near power lines.', 'Test CO alarms; furnaces and water heaters run more in winter.'],
        causes: [['Ice dams & leaks', 'Clogged gutters overflow and freeze at the eaves.'], ['Wet basement', 'Downspouts dumping next to the foundation.'], ['High heating bills', 'Gaps at windows and doors, a dirty filter.'], ['Burst pipes', 'Outdoor faucets left on.']],
        tools: ['Extension ladder + stabilizer', 'Gutter scoop + bucket', 'Downspout extensions', 'Exterior caulk + caulk gun', 'Door sweep / weatherstrip', 'Furnace filter', 'Faucet covers', 'Snow shovel + ice melt'],
        steps: [
          { t: 'Clean the gutters', d: 'Scoop out leaves after most trees have dropped them, then flush with a hose to check flow.', why: 'Packed gutters overflow, soak the fascia and feed ice dams.', v: { cam: [-1.6, 3.8, 3.4], at: [-2.0, 2.4, 0.4], hi: ['leaves', 'gutter'], tool: { id: 'extLadder', at: [-2.0, 0, 1.3], rot: [-14, 0, 0], scale: 1 } } },
          { t: 'Extend the downspouts', d: 'Add extensions so water lands 4–6 ft from the foundation on ground sloping away.', why: 'A downspout dumping at the wall is a top cause of wet basements and frost-heaved steps.', v: { cam: [-1.8, 1.6, 4.0], at: [-4.0, 0.6, 0.8], hi: ['extension', 'downspout'], hide: ['leaves'], show: ['extension'] } },
          { t: 'Shut down outdoor water', d: 'Disconnect and drain hoses, shut off and drain the outdoor faucets from inside, and add covers.', why: 'Water left in an outdoor faucet freezes and splits it.', v: { cam: [-2.4, 1.2, 2.6], at: [-3.4, 0.5, 0.4], hi: ['bib', 'bibCover', 'hose'], show: ['bibCover'] } },
          { t: 'Protect the AC', d: 'Turn off the AC disconnect and, if you like, cover only the top with a breathable cover or plywood.', why: 'A full wrap traps moisture and invites rodents. A top cover just keeps ice and leaves out of the fan.', v: { cam: [-6.8, 2.2, 0.8], at: [-4.7, 0.5, -1.8], hi: ['ac', 'acCover'], show: ['acCover'] } },
          { t: 'Seal window and trim gaps', d: 'Cut out cracked caulk and run a new bead of exterior caulk where trim meets siding.', why: 'Air leaks around windows waste heat and let water behind the siding.', v: { cam: [-1.6, 1.6, 2.4], at: [-2.6, 1.55, 0], hi: ['caulk', 'windows'], show: ['caulk'], tool: { id: 'caulkGun', at: [-2.0, 1.0, 0.08], rot: [0, 0, 30] } } },
          { t: 'Fix door drafts', d: 'Close the door on a dollar bill: if it slides out easily, replace the weatherstrip and the sweep.', why: 'A ⅛″ gap under a door leaks as much air as a 6-sq-inch hole.', v: { cam: [0.6, 0.9, 2.0], at: [-0.3, 0.6, 0], hi: ['sweep', 'door'], show: ['sweep'], tool: { id: 'screwdriver', at: [0.05, 0.33, 0.1], rot: [0, 0, 90], anim: 'turn' } } },
          { t: 'Replace the furnace filter', d: 'Slide out the old filter, note the size and airflow arrow, and slide in a new one with the arrow toward the furnace.', why: 'A clogged filter makes the blower work harder and can overheat the heat exchanger.', v: { cam: [4.4, 1.4, -3.2], at: [5.2, 0.5, -5.2], hi: ['filter', 'furnace', 'newFilter'], show: ['newFilter'], mv: { filter: [0, 0, 0.6] } } },
          { t: 'Test smoke and CO alarms', d: 'Press the test button on each alarm and replace batteries. Replace alarms older than 10 years (7 for some CO alarms).', why: 'Heating season is when CO risk is highest.', v: { cam: [4.0, 1.9, -3.6], at: [4.4, 2.0, -5.8], hi: ['alarm'], mv: { filter: [0, 0, 0] }, hide: ['newFilter'], tool: { id: 'stepLadder', at: [4.4, 0, -5.3], rot: [0, 0, 0] } } },
          { t: 'Store furniture, stage snow gear', d: 'Clean and store cushions and furniture. Put a shovel and pet-safe ice melt by the door.', why: 'Furniture left out cracks and rusts; gear by the door gets used before ice builds up.', v: { cam: [5.6, 3.2, 6.4], at: [2.6, 0.6, 0.6], hi: ['furniture', 'snowKit'], show: ['snowKit'], mv: { furniture: [2.6, 0, -4.6] } } },
        ],
        learn: {
          how: 'Winter damage is mostly water: water that overflows gutters, freezes in pipes, or pools at the foundation, plus warm air leaking out through gaps. This checklist closes each of those paths, and makes sure the heating system and alarms are ready for the season they work hardest.',
          specs: [['Downspout discharge', '4–6 ft from foundation'], ['Furnace filter', 'MERV 8–11, every 1–3 months'], ['Alarm life', 'Smoke 10 yr; CO 7–10 yr'], ['Grade', '6″ fall in the first 10 ft']],
          terms: [['Ice dam', 'Ridge of ice at the eave that backs water under shingles.'], ['Door sweep', 'Strip on the door bottom that seals to the threshold.'], ['Disconnect', 'Outdoor switch that cuts power to the AC.']],
          mistakes: ['Wrapping the whole AC condenser in plastic.', 'Caulking the bottom edge of siding or window weep holes.', 'Installing the furnace filter backward.'],
          tips: ['Do the gutters twice in heavily wooded yards.', 'Have the furnace serviced in early fall before the rush.'],
        },
        pro: 'The furnace hasn’t been serviced in 2+ years, you see roof or attic moisture, or gutters are on a second story.',
      },
      {
        id: 'holiday-lights',
        title: 'Hang holiday lights on the roofline',
        model: 'holidayLights',
        kind: 'build',
        level: 2,
        time: '3–5 hrs',
        cost: '$120–400',
        summary: 'Outline the eaves and gable rakes with C9 LED strands on all-in-one clips, powered from a GFCI outlet through a photocell timer. Tested on the ground first, hung from a properly set ladder.',
        intro: { show: ['clips', 'lightsEave', 'lightsRake', 'cord', 'timer'], preview: true, spin: true, hi: ['lightsEave'] },
        safety: ['Use only lights and cords marked for outdoor use (UL/ETL), plugged into a GFCI outlet.', 'Set the ladder at a 4:1 angle, extend it 3 ft above the gutter, and use a stabilizer. Never stand on the top rungs.', 'Keep ladders 10 ft from power lines.', 'Never nail or staple through light wires.', 'Don’t work on the roof when it’s wet, icy or windy.'],
        causes: [['Measure', 'Measure each eave and rake; buy strands about 10% longer.'], ['Pick LED', 'LEDs draw ~1/10 the power, so you can connect far more strands on one circuit.'], ['Plan the power', 'Start each run at the end nearest the outlet; keep each circuit under 80% of its rating.']],
        tools: ['C9 or C7 LED strands', 'All-in-one gutter/shingle clips', 'Outdoor extension cord (14 or 12 AWG)', 'Photocell or smart timer', 'Extension ladder + stabilizer', 'Tape measure', 'Spare bulbs + fuses'],
        steps: [
          { t: 'Measure and plan', d: 'Measure each run (this eave is 26 ft; each rake 13 ft) and mark where the power comes from.', why: 'Strands are sold in fixed lengths and must start at a plug end. Planning avoids cords snaking across the roof.', v: { cam: [5.0, 1.5, 6.5], at: [0.8, 1.4, 0.5], hi: ['gutter', 'roof'], tool: { id: 'tape', at: [2.4, 0.03, 0.9], rot: [0, 0, 0], scale: 1.4 } } },
          { t: 'Test every strand on the ground', d: 'Plug each strand in on the lawn and replace any dead bulbs or fuses now.', why: 'Fixing a strand on the ground takes a minute; fixing it on a ladder takes much longer and is riskier.', v: { cam: [3.2, 1.6, 4.2], at: [1.8, 0.1, 2.6], hi: ['testStrand'], show: ['testStrand'], fx: 'on' } },
          { t: 'Check the outlet and add a timer', d: 'Plug into a GFCI outlet with an in-use cover. Test the GFCI, then add a photocell timer.', why: 'GFCI cuts power if water causes a fault. A timer turns lights off overnight so they last longer.', v: { cam: [1.9, 0.8, 1.4], at: [1.0, 0.45, 0.05], hi: ['outlet', 'timer'], show: ['timer'] } },
          { t: 'Set up the ladder', d: 'Put the feet 1 ft out for every 4 ft of height, on firm level ground, extending 3 ft above the gutter, with a stabilizer bearing on the roof.', why: 'A stabilizer keeps the ladder off the gutter and widens its stance, the leading safety fix for roofline work.', v: { cam: [5.0, 2.4, 4.0], at: [2.4, 1.6, 0.4], hi: ['gutter'], hide: ['testStrand'], tool: { id: 'extLadder', at: [2.4, 0, 1.15], rot: [-14, 0, 0], scale: 1 } } },
          { t: 'Install the clips', d: 'Snap all-in-one clips onto the gutter lip every 12″ (one per bulb) along the eave, and onto the shingle edges along the rakes.', why: 'Clips hold the bulbs upright and evenly spaced without nails that damage gutters and wires.', v: { cam: [2.6, 2.3, 3.4], at: [1.4, 2.4, 0.5], hi: ['clips'], show: ['clips'] } },
          { t: 'Hang the eave strand', d: 'Start at the power end, push each bulb socket into a clip, and keep the wire behind the gutter lip.', why: 'Starting at the plug end means the female end lands where the next strand connects.', v: { cam: [-1.0, 2.2, 5.6], at: [-0.4, 2.3, 0.5], hi: ['lightsEave'], show: ['lightsEave'], fx: 'on' } },
          { t: 'Run the rakes', d: 'Clip strands up each gable rake to the peak. Use short jumper cords where runs don’t meet.', why: 'Outlining the gables gives the house its shape at night.', v: { cam: [-6.8, 3.6, 5.6], at: [-4.2, 3.0, -1.4], hi: ['lightsRake'], show: ['lightsRake'], fx: 'on' } },
          { t: 'Route and secure the cord', d: 'Run the extension cord along the corner trim with plastic clips, keeping connections off the ground and away from downspouts.', why: 'Connections sitting in puddles trip the GFCI and corrode.', v: { cam: [5.0, 1.8, 3.0], at: [2.6, 1.2, 0.2], hi: ['cord', 'outlet'], show: ['cord'] } },
          { t: 'Light it up', d: 'Set the timer (dusk to 11 pm is typical) and step back to check spacing. Take everything down within a few weeks of the season.', why: 'UV and weather degrade cords and clips; shorter exposure means more seasons from each strand.', v: { cam: [6.0, 1.6, 11.0], at: [-0.5, 1.5, 0], hi: ['lightsEave', 'lightsRake'], fx: 'on' } },
        ],
        learn: {
          how: 'Roofline lights are strands of sockets wired in parallel, with a plug on one end and a receptacle on the other so strands can connect end to end. LEDs draw so little current that the outlet and cord rarely limit you; the manufacturer’s max-connected-strands rating does. A GFCI outlet protects against shock from wet connections.',
          specs: [['C9 bulb spacing', '12″'], ['LED C9 draw', '~0.5–1 W per bulb'], ['Circuit load', '≤ 80% (1,440 W on 15 A)'], ['Ladder angle', '4:1 (75°)'], ['Ladder above eave', '3 ft']],
          terms: [['C9 / C7', 'Bulb sizes: C9 is larger (1¼″ dia).'], ['All-in-one clip', 'Clip that fits gutters and shingles.'], ['Photocell timer', 'Turns lights on at dusk and off after a set time.'], ['GFCI', 'Ground-fault circuit interrupter.']],
          mistakes: ['Stapling or nailing wires.', 'Using indoor cords outside.', 'Leaning the ladder on the gutter without a stabilizer.', 'Daisy-chaining more strands than the label allows.'],
          tips: ['Wind strands on a cardboard reel when you take them down.', 'Label each strand with where it goes.', 'Leave clips on the gutter all year if they’re UV-rated and discreet.'],
        },
        pro: 'The roof is two stories or steep (over 6/12), there’s no outdoor outlet, or you want permanent track lighting installed.',
        addons: [
          { id: 'smart', part: 'aoSmart', name: 'Smart controller', cat: 'Tech', blurb: 'Schedule, dim and group lights from your phone.', cost: [25, 60], how: 'Plug a weather-rated smart plug into the GFCI outlet (under the in-use cover) and plug the timer side of the lights into it. Set sunset-based schedules in the app.', needs: ['Outdoor smart plug', 'Wi-Fi within range'], shop: 'Outdoor smart plug weatherproof' },
          { id: 'projector', part: 'aoProjector', name: 'Light projector', cat: 'Lighting', blurb: 'Sweeping snowflakes or stars across the front wall.', cost: [40, 150], how: 'Stake it 10–20 ft from the wall, aim, and plug into the same timer. Keep the lens away from drivers’ sight lines and aircraft rules for lasers.', needs: ['Outdoor-rated projector', 'Outdoor extension cord'], shop: 'Outdoor christmas light projector' },
          { id: 'path', part: 'aoPath', name: 'Candy-cane path markers', cat: 'Lighting', blurb: 'Lit stakes along the front walk.', cost: [30, 80], how: 'Push stakes 6″ in from the walk edge every 3 ft, and run the connecting cord behind them.', needs: ['Pathway marker set', 'Landscape staples'], shop: 'Candy cane pathway lights' },
          { id: 'shrub', part: 'aoShrub', name: 'Net lights on shrubs', cat: 'Lighting', blurb: 'Even light over foundation shrubs in minutes.', cost: [40, 120], how: 'Drape a 4×6 ft net over each shrub, start from the plug end, and tuck the edges under.', needs: ['LED net lights (4×6 ft)', 'Outdoor cord'], shop: 'LED net lights outdoor' },
          { id: 'wreath', part: 'aoWreath', name: 'Pre-lit wreath', cat: 'Finish', blurb: 'Battery-powered wreath with a timer on the front door.', cost: [40, 120], how: 'Hang on an over-the-door hook; battery wreaths with a 6-hour timer avoid running cords to the door.', needs: ['Pre-lit wreath (battery, timer)', 'Over-door hanger'], shop: 'Pre lit outdoor wreath battery timer' },
        ],
      },
      {
        id: 'ac-spring-startup',
        title: 'Start up the AC in spring',
        model: 'acStartup',
        level: 1,
        time: '1–1.5 hrs',
        cost: '$10–40',
        summary: 'Before the first hot day: power down, uncover and clean the condenser, clear around it, check the line set and drain, change the filter, restore power a day early, then run it and check the cooling.',
        intro: { hi: ['unit', 'acCover'] },
        safety: ['Turn power off at the thermostat AND pull the disconnect before touching the condenser.', 'Coil fins are sharp; wear gloves.', 'Never use a pressure washer on the coil; it flattens the fins.'],
        causes: [['Weak cooling', 'Dirty coil or filter.'], ['Short cycling or tripping', 'Blocked airflow around the unit.'], ['Compressor damage', 'Starting it cold right after the power has been off all winter.']],
        tools: ['Garden hose + spray nozzle', 'Coil cleaner (no-rinse, outdoor)', 'Fin comb', 'Soft brush', 'Pruners', 'New air filter', 'Probe thermometer', 'Gloves'],
        steps: [
          { t: 'Cut the power', d: 'Set the thermostat to OFF, then pull the disconnect block (or switch it off) at the outdoor box.', why: 'The fan and compressor can start at any moment while you have your hands in the unit.', v: { cam: [2.0, 1.4, 1.4], at: [1.15, 1.15, 0.1], hi: ['disconnect', 'pullout'], mv: { pullout: [0, 0, 0.25] } } },
          { t: 'Remove the cover and debris', d: 'Take off the winter cover and clear leaves from the top grille and around the base.', why: 'Leaves block airflow and hold moisture against the cabinet.', v: { cam: [1.6, 1.6, 2.0], at: [0.2, 0.5, 0.75], hi: ['unit', 'debris', 'acCover'], hide: ['acCover'] } },
          { t: 'Clear 2 ft around it', d: 'Trim shrubs back to at least 2 ft on all sides and 5 ft above.', why: 'The condenser needs a big volume of air to reject heat. Shrubs force it to recirculate hot air.', v: { cam: [1.2, 1.6, 2.8], at: [-0.4, 0.6, 0.9], hi: ['shrubTrim'], hide: ['debris', 'shrub'], show: ['shrubTrim'] } },
          { t: 'Clean the coil', d: 'Spray coil cleaner on the fins, wait as directed, then rinse gently with a hose from top to bottom. Straighten bent fins with a fin comb.', why: 'A thin layer of dirt on the coil can cut efficiency by 5–15%.', v: { cam: [1.2, 1.3, 2.4], at: [0.2, 0.45, 0.9], hi: ['fins', 'hose'], show: ['hose'] } },
          { t: 'Check the line set', d: 'Make sure the fat suction line’s foam insulation is intact all the way to the wall. Replace cracked or missing pieces.', why: 'Bare suction line picks up heat and sweats, which robs capacity and drips water at the wall.', v: { cam: [1.3, 0.9, 1.1], at: [0.65, 0.45, 0.2], hi: ['lineset'], hide: ['hose'] } },
          { t: 'Change the indoor filter', d: 'Inside, open the return grille, note the size and arrow, and slide in a new filter with the arrow toward the unit.', why: 'A clogged filter can freeze the indoor coil in cooling mode.', v: { cam: [-0.2, 1.1, -1.8], at: [-0.7, 0.55, -0.2], hi: ['filter', 'grille', 'newFilter'], show: ['newFilter'], mv: { grille: [0, 0, -0.3], filter: [0, 0, -0.2] } } },
          { t: 'Check the condensate drain', d: 'Find where the drain line exits and make sure it isn’t blocked. Pour a cup of water into the indoor drain pan access to see it flow.', why: 'A blocked drain overflows the pan or trips the float switch and shuts the AC off.', v: { cam: [-0.6, 0.8, 1.2], at: [-1.4, 0.3, 0.1], hi: ['condensate'], hide: ['newFilter'], mv: { grille: [0, 0, 0], filter: [0, 0, 0] } } },
          { t: 'Restore power 24 hours early', d: 'Put the disconnect back in (thermostat still off) and wait 12–24 hours before calling for cooling.', why: 'The crankcase heater warms the compressor oil and drives out refrigerant that migrated into it, preventing damage on the first start.', v: { cam: [2.0, 1.4, 1.4], at: [1.15, 1.15, 0.1], hi: ['disconnect', 'pullout'], mv: { pullout: [0, 0, 0] } } },
          { t: 'Run it and check the split', d: 'Set cooling 5 °F below room temperature. After 15 minutes, compare air at a return and a supply: a 15–20 °F drop is normal.', why: 'A small split means low refrigerant or airflow problems; call a tech before the hot weather.', v: { cam: [0.55, 1.6, -1.0], at: [0.75, 1.65, -0.16], hi: ['thermostat', 'thermo', 'register'], show: ['thermo'], fx: 'run' } },
        ],
        learn: {
          how: 'An AC moves heat from inside to outside. The indoor coil absorbs heat as refrigerant evaporates; the outdoor condenser fans air across its coil to dump that heat. Anything that blocks air at either coil, such as a dirty filter, dirty fins or crowding shrubs, raises pressures and cuts efficiency.',
          specs: [['Clearance', '2 ft sides, 5 ft above'], ['Temperature split', '15–20 °F'], ['Power on before start', '12–24 hrs'], ['Filter', 'MERV 8–11']],
          terms: [['Condenser', 'Outdoor unit with the compressor and coil.'], ['Crankcase heater', 'Heater that keeps compressor oil warm.'], ['Line set', 'Copper pipes between indoor and outdoor units.'], ['Delta T', 'Temperature drop across the indoor coil.']],
          mistakes: ['Pressure washing the coil.', 'Starting cooling the moment the power is restored.', 'Wrapping the condenser in plastic.'],
          tips: ['Take a photo of the model tag for future part orders.', 'Book a tech tune-up every year or two for refrigerant and electrical checks.'],
        },
        pro: 'The split is under 14 °F, the unit hums but the fan won’t spin, ice forms on the lines, or the breaker trips.',
      },
      {
        id: 'sump-battery-backup',
        title: 'Test a sump pump and add a battery backup',
        model: 'sumpPump',
        level: 2,
        time: '2–3 hrs',
        cost: '$250–600',
        summary: 'Test the primary pump with a bucket of water, check its check valve, then add a 12 V battery backup pump with its own float and check valve so the basement stays dry during power outages.',
        intro: { hi: ['pit', 'primary'] },
        safety: ['Unplug pumps before reaching into the pit.', 'Plug sump pumps into a GFCI outlet; don’t use extension cords.', 'Batteries can vent hydrogen; keep them in a vented box away from sparks.', 'Wear gloves; pit water is dirty.'],
        causes: [['Pump runs but doesn’t lower the water', 'Failed check valve or clogged intake.'], ['Pump never turns on', 'Stuck float, tripped GFCI or burnt motor.'], ['Flooding in storms', 'Storms cause power outages exactly when the pump is needed.']],
        tools: ['5-gal bucket', 'Backup pump kit (pump, float, controller)', 'Group-27 deep-cycle or AGM battery + vented box', '1½″ PVC, tee, check valve', 'PVC primer + cement', 'Hacksaw or PVC cutter', 'Adjustable wrench', 'Brick or paver'],
        steps: [
          { t: 'Check power to the pump', d: 'Make sure the pump is plugged into a working GFCI outlet and the GFCI isn’t tripped.', why: 'A tripped GFCI is a common, silent reason pumps don’t run.', v: { cam: [0.4, 1.3, 0.4], at: [-0.1, 0.9, -0.95], hi: ['outlet'], tool: { id: 'voltTester', at: [-0.05, 1.08, -0.94], rot: [90, 0, 0] } } },
          { t: 'Open the pit', d: 'Lift the lid and clear any debris around the pump intake and float.', why: 'Gravel and debris jam floats and clog the intake screen.', v: { cam: [0.0, 1.4, 0.5], at: [-0.7, -0.2, -0.45], hi: ['pit', 'primary', 'floatMain'], hide: ['lid'] } },
          { t: 'Test with a bucket', d: 'Slowly pour 5 gallons into the pit. The float should rise, the pump should start and empty the pit, then shut off.', why: 'This proves the float, switch, motor and discharge all work, without waiting for rain.', v: { cam: [0.0, 1.4, 0.5], at: [-0.7, -0.3, -0.45], hi: ['floatMain', 'pitWater'], show: ['bucketPit'], fx: 'fill' } },
          { t: 'Check the check valve', d: 'When the pump shuts off, listen for a thump and watch the water: it shouldn’t flow back into the pit.', why: 'A stuck-open check valve makes the pump re-pump the same water and short cycle until it fails.', v: { cam: [0.0, 0.9, 0.5], at: [-0.78, 0.3, -0.5], hi: ['checkMain', 'discharge'], hide: ['bucketPit'], fx: 'pump' } },
          { t: 'Set the backup pump', d: 'Unplug the primary. Set the backup on a brick beside it so its intake sits above the primary’s.', why: 'Raised, the backup only runs when the primary can’t keep up or has failed.', v: { cam: [0.0, 1.0, 0.4], at: [-0.6, -0.4, -0.35], hi: ['backup', 'brick'], show: ['backup', 'brick'] } },
          { t: 'Plumb its discharge', d: 'Run 1½″ PVC up from the backup with its own check valve, and tee into the main line above the primary’s check valve. Prime and glue each joint.', why: 'Each pump needs its own check valve or water pumped by one flows back down the other.', v: { cam: [0.4, 1.1, 0.6], at: [-0.65, 0.5, -0.4], hi: ['dischargeBackup', 'checkBackup'], show: ['dischargeBackup', 'checkBackup'] } },
          { t: 'Mount the backup float', d: 'Clamp the backup float to its pipe so it switches on 2–3″ above the primary’s on-level.', why: 'If the floats overlap, the backup runs every cycle and drains the battery.', v: { cam: [0.0, 0.9, 0.5], at: [-0.6, -0.2, -0.3], hi: ['floatBackup'], show: ['floatBackup'] } },
          { t: 'Connect battery and controller', d: 'Mount the controller on the wall, set the battery in its vented box, connect red to + and black to –, and plug the charger into the outlet.', why: 'The controller charges the battery, runs the pump on 12 V when power fails, and sounds an alarm.', v: { cam: [1.0, 1.2, 0.6], at: [0.45, 0.6, -0.8], hi: ['battery', 'charger'], show: ['battery', 'charger'], tool: { id: 'adjWrench', at: [0.35, 0.34, -0.6], rot: [0, 0, 90], anim: 'turn' } } },
          { t: 'Test the backup', d: 'Leave the primary unplugged and fill the pit. The backup should start, pump out and sound its alarm. Plug the primary back in.', why: 'Testing proves the float height, battery and check valves work together.', v: { cam: [0.0, 1.4, 0.5], at: [-0.7, -0.3, -0.45], hi: ['backup', 'floatBackup', 'pitWater'], fx: 'backup' } },
          { t: 'Close up, test quarterly', d: 'Replace the lid and test both pumps every 3 months and before storm season. Replace the battery every 3–5 years.', why: 'A sealed lid keeps out debris and radon; regular tests catch a weak battery before a storm does.', v: { cam: [1.3, 1.6, 1.7], at: [-0.5, 0.1, -0.4], hi: ['lid', 'charger'], show: ['lid'] } },
        ],
        learn: {
          how: 'Groundwater collects in the pit through drain tile around the foundation. When the float rises, the pump turns on and pushes water up and out through the discharge, and the check valve keeps it from falling back. A backup pump on a battery covers the two common failures: a dead primary and a power outage.',
          specs: [['Primary', '⅓–½ HP'], ['Discharge', '1½″ PVC'], ['Backup on-level', '2–3″ above primary'], ['Battery', 'Group 27 deep-cycle or AGM'], ['Test', 'Every 3 months']],
          terms: [['Check valve', 'One-way valve in the discharge.'], ['Float switch', 'Turns the pump on and off with water level.'], ['Drain tile', 'Perforated pipe around the footing that feeds the pit.']],
          mistakes: ['Teeing the backup in below the primary’s check valve.', 'Using a car starting battery.', 'Plugging the pump into an extension cord.'],
          tips: ['Drill a ⅛″ weep hole in the discharge pipe between the pump and check valve to prevent air lock.', 'A Wi-Fi water alarm on the floor gives early warning.'],
        },
        pro: 'There’s no pit, the discharge needs to go through the foundation, or you want a water-powered backup (needs city water pressure and a backflow preventer).',
      },
      {
        id: 'storm-prep',
        title: 'Prep the house for a storm',
        model: 'stormPrep',
        level: 2,
        time: '3–6 hrs',
        cost: '$50–500 (generator hookup extra)',
        summary: 'Before high winds or a hurricane: remove hazards over the roof, secure loose items, cover windows, block water at doors and set up a portable generator safely, 20 ft from the house with an interlock or transfer switch.',
        intro: { hi: ['house', 'generator'] },
        safety: ['Never run a generator in a garage, porch or near open windows, even with doors open. CO kills in minutes.', 'Never backfeed a dryer outlet with a “suicide cord.” It can electrocute utility workers and you.', 'Use an interlock or transfer switch installed by a licensed electrician.', 'Turn off the generator and let it cool before refueling.'],
        causes: [['Wind damage', 'Loose furniture and dead limbs become projectiles.'], ['Water entry', 'Clogged gutters and low thresholds.'], ['Outage injuries', 'CO poisoning and backfeeding are the top generator dangers.']],
        tools: ['Pruning saw / pole saw', 'Ratchet straps + ground anchors', '⅝″ plywood + window anchors', 'Sandbags', 'Portable generator', 'Generator cord (L14-30, 10 AWG)', 'Battery CO alarm', 'Emergency kit'],
        steps: [
          { t: 'Deal with dead limbs', d: 'Cut small dead branches over the roof with a pole saw from the ground. Call an arborist for anything large.', why: 'Dead wood breaks first in wind and falls on roofs, cars and power lines.', v: { cam: [-1.8, 3.6, 6.0], at: [-4.4, 3.2, 0.8], hi: ['deadLimb', 'tree'] } },
          { t: 'Clear gutters and drains', d: 'Clear gutters, downspouts and any yard drains.', why: 'Storm rain overwhelms a partly blocked gutter, spilling water at the foundation.', v: { cam: [-1.6, 3.8, 3.4], at: [-2.0, 2.4, 0.4], hi: ['gutter', 'downspout'], hide: ['deadLimb'] } },
          { t: 'Secure loose items', d: 'Close and store the umbrella, move furniture against the house or inside, and strap trash cans to an anchor.', why: 'Anything that can be lifted by wind becomes a missile at 60+ mph.', v: { cam: [3.0, 3.0, 7.6], at: [-0.4, 0.6, 2.0], hi: ['furniture', 'trashCans', 'straps', 'grill'], hide: ['umbrella'], show: ['straps'], mv: { furniture: [0, 0, -1.6] } } },
          { t: 'Cover the windows', d: 'Screw pre-cut ⅝″ plywood over windows using permanent anchors set in the framing, 12″ apart.', why: 'A broken window lets wind pressurize the house and can blow the roof off from the inside.', v: { cam: [0.8, 2.0, 5.2], at: [-0.5, 1.5, 0], hi: ['boards'], show: ['boards'], tool: { id: 'drill', at: [1.1, 2.15, 0.12], rot: [90, 0, 0], anim: 'spin', scale: 1.2 } } },
          { t: 'Block water at the door', d: 'Lay sandbags in a staggered row across low doorways, folded ends tucked under.', why: 'Overlapped bags form a seal that diverts sheet flow from the threshold.', v: { cam: [1.0, 1.4, 3.0], at: [-0.3, 0.3, 0.9], hi: ['sandbags'], show: ['sandbags'] } },
          { t: 'Stage the emergency kit', d: 'Set out water (1 gal per person per day for 3+ days), flashlights, a radio, batteries and a battery CO alarm.', why: 'Having it ready means you’re not hunting for flashlights in the dark.', v: { cam: [1.6, 1.4, 2.6], at: [0.6, 0.4, 0.6], hi: ['kit'], show: ['kit'] } },
          { t: 'Place the generator 20 ft away', d: 'Set the generator on level ground at least 20 ft from any door, window or vent, with the exhaust pointing away.', why: 'CO from a generator can enter the house from surprisingly far away, especially downwind.', v: { cam: [8.4, 3.2, 5.4], at: [8.0, 0.3, -1.6], hi: ['generator', 'clearance', 'exhaust'], show: ['clearance'] } },
          { t: 'Connect through the inlet', d: 'Plug the L14-30 cord into the generator and the power inlet box. Never run cords through a window or door.', why: 'The inlet and interlock (or transfer switch) are the only safe way to power house circuits.', v: { cam: [5.6, 1.6, 0.6], at: [3.6, 0.5, -1.4], hi: ['cord', 'inlet'], show: ['cord'] } },
          { t: 'Switch over with the interlock', d: 'Turn the main breaker OFF, slide the interlock, turn the generator breaker ON, start the generator, then turn on a few key circuits one at a time.', why: 'The interlock physically prevents the main and generator breakers from being on together, so power can’t backfeed to the street.', v: { cam: [4.6, 1.6, -1.0], at: [3.1, 1.4, -2.0], hi: ['interlock', 'panel'] } },
          { t: 'Refuel safely', d: 'Shut the generator down and let it cool 15 minutes before refueling. Store gas cans away from the generator and the house.', why: 'Gas spilled on a hot muffler ignites.', v: { cam: [8.0, 1.6, 2.6], at: [9.6, 0.4, -0.4], hi: ['fuel', 'generator'], show: ['fuel'] } },
        ],
        learn: {
          how: 'Storm damage comes from wind (debris and broken windows), water (overflowing gutters, flooding) and the outage afterward. A portable generator is safe only when it’s far from the house and connected through an interlock or transfer switch, which disconnects the house from the utility before it accepts generator power.',
          specs: [['Generator distance', '≥ 20 ft from openings'], ['Cord', '10/4 L14-30 for 30 A'], ['Plywood', '⅝″ minimum'], ['Water', '1 gal/person/day × 3+ days'], ['Refuel', 'After 15 min cool-down']],
          terms: [['Interlock kit', 'Plate that blocks the main and generator breakers from both being on.'], ['Transfer switch', 'Separate switch panel for selected circuits.'], ['Backfeeding', 'Sending power back out to utility lines.']],
          mistakes: ['Running a generator in the garage “with the door open.”', 'Using a double-male cord.', 'Taping windows (it doesn’t prevent breakage).'],
          tips: ['Run the generator monthly with fuel stabilizer.', 'Pre-cut and label plywood for each window.', 'Fill bathtubs for flushing water if a long outage is expected.'],
        },
        pro: 'Installing the inlet box and interlock or transfer switch, removing large limbs, or wind-rated window protection.',
      },
    ],
  });
})();
