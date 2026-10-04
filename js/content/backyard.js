/* BYB · Backyard builds. Scenes are in meters (view.unit = 1). */
(function () {
  const SCAN = ['painted_wooden_bench', 'outdoor_table_chair_set_01', 'planter_box_01', 'potted_plant_01', 'potted_plant_02', 'shrub_02', 'wooden_lantern_01', 'dead_tree_trunk', 'bark_debris_01', 'grass_medium_01'];
  const TEX = ['stacked_stone_wall', 'gravel_floor', 'interlocking_concrete_pavers', 'forrest_ground_01', 'pine_bark'];

  /* Wedge block for a round wall: inner/outer radius, angular width (rad), height. */
  function wedge(K, parent, r0, r1, a, h, mat) {
    const pts = [];
    const n = 6;
    for (let i = 0; i <= n; i++) pts.push([Math.cos(-a / 2 + (a * i) / n) * r1, Math.sin(-a / 2 + (a * i) / n) * r1]);
    for (let i = n; i >= 0; i--) pts.push([Math.cos(-a / 2 + (a * i) / n) * r0, Math.sin(-a / 2 + (a * i) / n) * r0]);
    const g = K.group(parent);
    K.ext(g, pts, h, mat, [0, h, 0], [90, 0, 0], 0.012);
    return g;
  }

  // Flames + flickering fire light
  function fire(K, parent, scale) {
    const f = K.part('fire', [0, 0.1, 0], parent, 'Fire');
    const cones = [];
    [[0, 0, 0, 0.16, 0.55, 'fire'], [0.08, 0, 0.05, 0.1, 0.4, 'flame'], [-0.07, 0, -0.05, 0.1, 0.42, 'flame'], [0.04, 0, -0.09, 0.08, 0.32, 'fire'], [-0.06, 0, 0.07, 0.07, 0.3, 'fire']].forEach(([x, y, z, r, h, m]) => {
      const c = K.cone(f, [r * scale, h * scale, 14], m, [x * scale, (h * scale) / 2, z * scale]);
      c.userData.h = h * scale;
      c.castShadow = false;
      cones.push(c);
    });
    const light = new THREE.PointLight(0xff8a2a, 1.6, 6 * scale + 3, 2);
    light.position.set(0, 0.45 * scale, 0);
    f.add(light);
    return {
      tick(t) {
        cones.forEach((c, i) => {
          const k = 0.85 + 0.22 * Math.sin(t * (8 + i * 1.9) + i) + 0.08 * Math.sin(t * 23 + i);
          c.scale.set(1, k, 1);
          c.position.y = (c.userData.h * k) / 2;
        });
        light.intensity = f.visible ? 1.4 + 0.5 * Math.sin(t * 13) * Math.sin(t * 7.3) : 0;
      },
    };
  }

  function logs(K, parent) {
    const g = K.part('logs', [0, 0.06, 0], parent, 'Firewood');
    const bark = K.pbr('pine_bark', [1, 2], {}, 'bark');
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const lg = K.group(g, [Math.cos(a) * 0.12, 0.1, Math.sin(a) * 0.12], [0, (-a * 180) / Math.PI, 62]);
      K.cyl(lg, [0.045, 0.05, 0.5, 14], bark);
      K.cyl(lg, [0.043, 0.043, 0.002, 14], 'woodLight', [0, 0.251, 0]);
    }
    return g;
  }

  /* Fire pit + seating area. finished = true shows everything (used by the homepage hero). */
  function firePitScene(K, finished) {
    const stone = K.pbr('stacked_stone_wall', [0.6, 0.35], { roughness: 1 }, 'stone');
    const capMat = K.pbr('stacked_stone_wall', [0.6, 0.25], { roughness: 0.9, color: 0xd9d2c6 }, 'concrete');
    const patio = K.part('patio', [0, 0.004, 0], null, 'Paver patio (12 ft circle)');
    K.cyl(patio, [2.1, 2.1, 0.02, 64], K.pbr('interlocking_concrete_pavers', [5, 5], {}, 'concrete'));
    K.tor(patio, [2.1, 0.03, 360], 'concrete', [0, 0.008, 0], [90, 0, 0]);
    const dig = K.part('dig', [0, 0.006, 0], null, 'Excavated area (6″ deep)');
    K.cyl(dig, [0.72, 0.72, 0.012, 48], K.pbr('forrest_ground_01', [1.5, 1.5], {}, 'dirt'));
    const paint = K.part('paint', [0, 0.02, 0], null, 'Marked circle');
    K.tor(paint, [0.7, 0.012, 360], K.std(0xff7a1a, { emissive: 0xff5a00, emissiveIntensity: 0.3 }), [0, 0, 0], [90, 0, 0]);
    const stake = K.part('stake', [0, 0, 0], null, 'Center stake & string');
    K.box(stake, [0.03, 0.4, 0.03], 'woodLight', [0, 0.2, 0]);
    K.bar(stake, [0, 0.05, 0], [0.7, 0.03, 0], 0.003, 'yellow');
    const base = K.part('base', [0, 0.02, 0], null, 'Compacted gravel base');
    K.cyl(base, [0.7, 0.7, 0.03, 48], K.pbr('gravel_floor', [1.2, 1.2], {}, 'stone'));
    const R0 = 0.42;
    const R1 = 0.62;
    const H = 0.15;
    const per = 12;
    const a = (Math.PI * 2) / per;
    for (let c = 0; c < 3; c++) {
      const course = K.part('course' + (c + 1), [0, 0.035 + c * H, 0], null, ['First course (leveled)', 'Second course (staggered)', 'Third course'][c]);
      for (let i = 0; i < per; i++) {
        const g = K.group(course, [0, 0, 0], [0, ((i + (c % 2) * 0.5) * 360) / per, 0]);
        wedge(K, g, R0, R1, a * 0.985, H - 0.006, stone);
      }
    }
    const cap = K.part('cap', [0, 0.035 + 3 * H, 0], null, 'Cap stones');
    for (let i = 0; i < per; i++) {
      const g = K.group(cap, [0, 0, 0], [0, ((i + 0.5) * 360) / per, 0]);
      wedge(K, g, R0 - 0.02, R1 + 0.03, a * 0.985, 0.05, capMat);
    }
    const ring = K.part('ring', [0, 0.04, 0], null, 'Steel fire ring insert');
    K.cyl(ring, [0.415, 0.415, 0.5, 48, true], K.std(0x2a2a2a, { metalness: 0.85, roughness: 0.55, side: THREE.DoubleSide }), [0, 0.25, 0]);
    K.tor(ring, [0.42, 0.012, 360], K.std(0x2a2a2a, { metalness: 0.85, roughness: 0.5 }), [0, 0.5, 0], [90, 0, 0]);
    const inner = K.part('innerGravel', [0, 0.06, 0], null, 'Lava rock / gravel inside');
    K.cyl(inner, [0.4, 0.4, 0.04, 40], K.pbr('gravel_floor', [0.8, 0.8], { color: 0x9a8f86 }, 'stone'));
    const lg = logs(K, inner);
    const fx = fire(K, inner, 1.35);

    // seating and planting (photo-scanned)
    const seats = K.part('seating', [0, 0, 0], null, 'Seating (7 ft from the fire)');
    K.glb(seats, 'painted_wooden_bench', { height: 0.89 }, [0, 0, -2.0], [0, 0, 0]) || K.box(seats, [1.2, 0.45, 0.45], 'wood', [0, 0.22, -2]);
    const chair = (x, z, ry) => K.glb(seats, 'outdoor_table_chair_set_01', { node: 'outdoor_table_chair_set_01_chair_01', height: 0.86 }, [x, 0, z], [0, ry, 0]) || K.box(seats, [0.5, 0.45, 0.5], 'wood', [x, 0.22, z]);
    chair(2.0, 1.3, -125);
    chair(-2.0, 1.3, 125);
    const deco = K.part('deco', [0, 0, 0], null, 'Planters & lighting');
    K.glb(deco, 'planter_box_01', { height: 0.42 }, [-2.6, 0, -1.4], [0, 35, 0]);
    K.glb(deco, 'potted_plant_01', { height: 1.1 }, [2.6, 0, -1.5], [0, 0, 0]);
    K.glb(deco, 'potted_plant_02', { height: 0.75 }, [-2.4, 0, 1.6], [0, 0, 0]);
    K.glb(deco, 'shrub_02', { node: 'shrub_02_b', height: 1.3 }, [-1.2, 0, -3.1], [0, 0, 0]);
    K.glb(deco, 'shrub_02', { node: 'shrub_02_c', height: 1.1 }, [1.6, 0, -3.0], [0, 40, 0]);
    K.glb(deco, 'wooden_lantern_01', { height: 0.45 }, [0.85, 0, -2.05], [0, 20, 0]);
    K.glb(deco, 'grass_medium_01', { node: 'grass_medium_01_tall_b_LOD0', height: 0.45 }, [2.3, 0, 1.2]);
    K.glb(deco, 'grass_medium_01', { node: 'grass_medium_01_large_a_LOD0', height: 0.4 }, [-2.25, 0, -0.2]);
    K.glb(deco, 'grass_medium_01', { node: 'grass_medium_01_mid_b_LOD0', height: 0.35 }, [1.1, 0, 2.4]);
    const wood = K.part('woodpile', [2.35, 0, 0.1], null, 'Firewood stack');
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) {
      const g = K.group(wood, [0, 0.06 + r * 0.1, (i - (3 - r) / 2) * 0.11], [0, 0, 90]);
      K.cyl(g, [0.05, 0.05, 0.42, 12], K.pbr('pine_bark', [1, 2], {}, 'bark'));
    }
    return {
      tick(t, fxName) {
        fx.tick(t);
      },
      hideFire(on) {
        K.parts.fire.visible = !on;
      },
    };
  }

  TB.model(
    'hero',
    { cam: [3.3, 2.4, 4.0], at: [0, 0.35, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 9 }, assets: SCAN, tex: TEX, hidden: ['dig', 'paint', 'stake'] },
    (K) => firePitScene(K, true)
  );

  TB.model(
    'firepit',
    {
      cam: [3.2, 2.6, 3.9], at: [0, 0.3, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 9 },
      assets: SCAN, tex: TEX,
      hidden: ['patio', 'dig', 'base', 'course1', 'course2', 'course3', 'cap', 'ring', 'innerGravel', 'seating', 'deco', 'woodpile', 'paint', 'stake'],
    },
    (K) => firePitScene(K, false)
  );

  /* ---- Model: raised garden bed ---- */
  TB.model(
    'gardenbed',
    { cam: [2.6, 2.0, 2.8], at: [0, 0.25, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 8 }, assets: ['potted_plant_02', 'shrub_04', 'grass_medium_01', 'watering_can_metal_01'], tex: ['wood_planks', 'forrest_ground_01'],
      hidden: ['boards1', 'boards2', 'boards3', 'posts', 'cloth', 'fabric', 'soil', 'plants', 'site'] },
    (K) => {
      const L = 2.4;
      const W = 1.2;
      const bh = 0.14;
      const cedar = K.pbr('wood_planks', [2, 0.3], { color: 0xd8a27a }, 'wood');
      const site = K.part('site', [0, 0.004, 0], null, 'Level, sunny site (6–8 hr sun)');
      K.box(site, [L + 0.3, 0.008, W + 0.3], K.std(0x7fb04f, { transparent: true, opacity: 0.0 }));
      K.box(site, [L + 0.3, 0.004, 0.02], 'yellow', [0, 0.004, (W + 0.3) / 2]);
      K.box(site, [L + 0.3, 0.004, 0.02], 'yellow', [0, 0.004, -(W + 0.3) / 2]);
      K.box(site, [0.02, 0.004, W + 0.3], 'yellow', [(L + 0.3) / 2, 0.004, 0]);
      K.box(site, [0.02, 0.004, W + 0.3], 'yellow', [-(L + 0.3) / 2, 0.004, 0]);
      const cloth = K.part('cloth', [0, 0.01, 0], null, 'Hardware cloth (stops gophers)');
      K.box(cloth, [L - 0.04, 0.004, W - 0.04], K.std(0x9aa3ab, { metalness: 0.7, roughness: 0.4, wireframe: true }));
      const posts = K.part('posts', [0, 0, 0], null, '4×4 corner posts');
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => K.box(posts, [0.09, 3 * bh + 0.02, 0.09], cedar, [sx * (L / 2 - 0.05), (3 * bh) / 2, sz * (W / 2 - 0.05)]));
      for (let c = 0; c < 3; c++) {
        const b = K.part('boards' + (c + 1), [0, c * bh + bh / 2, 0], null, ['Bottom row of 2×6 boards', 'Second row', 'Top row'][c]);
        K.box(b, [L, bh - 0.004, 0.038], cedar, [0, 0, W / 2]);
        K.box(b, [L, bh - 0.004, 0.038], cedar, [0, 0, -W / 2]);
        K.box(b, [0.038, bh - 0.004, W - 0.076], cedar, [L / 2 - 0.019, 0, 0]);
        K.box(b, [0.038, bh - 0.004, W - 0.076], cedar, [-L / 2 + 0.019, 0, 0]);
      }
      const fab = K.part('fabric', [0, 0.02, 0], null, 'Cardboard / landscape fabric weed barrier');
      K.box(fab, [L - 0.08, 0.006, W - 0.08], K.std(0x8a7a63, { roughness: 1 }));
      const soil = K.part('soil', [0, 3 * bh - 0.06, 0], null, 'Soil mix (60% topsoil, 40% compost)');
      K.box(soil, [L - 0.08, 0.02, W - 0.08], K.pbr('forrest_ground_01', [3, 1.5], {}, 'dirt'));
      const plants = K.part('plants', [0, 3 * bh - 0.05, 0], null, 'Seedlings (spaced per seed packet)');
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 2; j++)
          K.glb(plants, i % 2 ? 'potted_plant_02' : 'grass_medium_01', i % 2 ? { height: 0.3 } : { node: 'grass_medium_01_mid_a_LOD0', height: 0.28 }, [-0.85 + i * 0.57, 0, -0.28 + j * 0.56]) || K.sph(plants, 0.1, 'green', [-0.85 + i * 0.57, 0.1, -0.28 + j * 0.56]);
      K.glb(null, 'watering_can_metal_01', { height: 0.2 / 0.3 * 0.3 }, [1.6, 0, 0.6], [0, -30, 0]);
    }
  );

  /* ---- Model: paver patio layers ---- */
  TB.model(
    'patio',
    { cam: [3.4, 2.6, 3.6], at: [0, 0, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10 }, tex: ['interlocking_concrete_pavers', 'gravel_floor', 'forrest_ground_01', 'brushed_concrete'], assets: ['outdoor_table_chair_set_01', 'potted_plant_01'],
      hidden: ['strings', 'excavate', 'gravel', 'sand', 'rails', 'pavers', 'edge', 'jsand', 'furniture'] },
    (K) => {
      const W = 3.0;
      const D = 2.4;
      const strings = K.part('strings', [0, 0, 0], null, 'Stakes & mason line (squared 3-4-5)');
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([x, z]) => K.box(strings, [0.03, 0.35, 0.03], 'woodLight', [x * (W / 2 + 0.2), 0.17, z * (D / 2 + 0.2)]));
      K.bar(strings, [-W / 2 - 0.2, 0.3, D / 2], [W / 2 + 0.2, 0.3, D / 2], 0.003, 'yellow');
      K.bar(strings, [-W / 2 - 0.2, 0.3, -D / 2], [W / 2 + 0.2, 0.3, -D / 2], 0.003, 'yellow');
      K.bar(strings, [W / 2, 0.3, -D / 2 - 0.2], [W / 2, 0.3, D / 2 + 0.2], 0.003, 'yellow');
      K.bar(strings, [-W / 2, 0.3, -D / 2 - 0.2], [-W / 2, 0.3, D / 2 + 0.2], 0.003, 'yellow');
      const ex = K.part('excavate', [0, 0.005, 0], null, 'Excavated 7″ deep, sloped 1/8″ per ft');
      K.box(ex, [W + 0.3, 0.01, D + 0.3], K.pbr('forrest_ground_01', [3, 3], {}, 'dirt'));
      const gv = K.part('gravel', [0, 0.06, 0], null, '4″ compacted gravel base');
      K.box(gv, [W + 0.2, 0.1, D + 0.2], K.pbr('gravel_floor', [3, 3], {}, 'stone'));
      const sd = K.part('sand', [0, 0.12, 0], null, '1″ screeded bedding sand');
      K.box(sd, [W + 0.1, 0.025, D + 0.1], K.std(0xcdb48a, { roughness: 1 }));
      const rails = K.part('rails', [0, 0.14, 0], null, '1″ screed pipes');
      K.cyl(rails, [0.013, 0.013, D, 12], 'steel', [-0.7, 0, 0], [90, 0, 0]);
      K.cyl(rails, [0.013, 0.013, D, 12], 'steel', [0.7, 0, 0], [90, 0, 0]);
      const pv = K.part('pavers', [0, 0.155, 0], null, 'Pavers (herringbone)');
      K.box(pv, [W, 0.06, D], K.pbr('interlocking_concrete_pavers', [3, 2.4], {}, 'concrete'), [0, 0.03, 0], null, 0.004);
      const edge = K.part('edge', [0, 0.17, 0], null, 'Edge restraint spiked every 12″');
      K.box(edge, [W + 0.04, 0.05, 0.03], 'black', [0, 0, D / 2 + 0.02]);
      K.box(edge, [W + 0.04, 0.05, 0.03], 'black', [0, 0, -D / 2 - 0.02]);
      K.box(edge, [0.03, 0.05, D], 'black', [W / 2 + 0.02, 0, 0]);
      K.box(edge, [0.03, 0.05, D], 'black', [-W / 2 - 0.02, 0, 0]);
      const js = K.part('jsand', [0, 0.216, 0], null, 'Polymeric joint sand');
      K.box(js, [W, 0.002, D], K.std(0xe2d6b8, { transparent: true, opacity: 0.35, roughness: 1 }));
      const fur = K.part('furniture', [0, 0.215, 0], null, 'Finished patio');
      K.glb(fur, 'outdoor_table_chair_set_01', { height: 0.86 }, [0, 0, 0]);
      K.glb(fur, 'potted_plant_01', { height: 1.0 }, [1.2, 0, -0.9]);
    }
  );

  /* ---- Model: low-voltage path lighting ---- */
  TB.model(
    'pathlights',
    { cam: [3.6, 2.4, 3.4], at: [0, 0.2, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10 }, tex: ['interlocking_concrete_pavers', 'brick_wall_001'], assets: ['shrub_02'], hidden: ['transformer', 'cable', 'lights', 'connectors', 'trench'] },
    (K) => {
      const path = K.part('path', [0, 0.01, 0], null, 'Walkway');
      K.box(path, [0.9, 0.02, 5], K.pbr('interlocking_concrete_pavers', [1, 5], {}, 'concrete'), [0, 0, 0]);
      K.box(null, [5, 2.4, 0.2], K.pbr('brick_wall_001', [3, 1.5], {}, 'stone'), [0.9, 1.2, -2.6]);
      const tr = K.part('transformer', [1.6, 0.6, -2.48], null, 'Low-voltage transformer (plugs into GFCI)');
      K.box(tr, [0.25, 0.32, 0.12], K.std(0x2b2e31, { metalness: 0.5, roughness: 0.4 }));
      K.box(tr, [0.12, 0.08, 0.02], 'screen', [0, 0.06, 0.07]);
      K.box(null, [0.12, 0.18, 0.05], 'offwhite', [1.95, 0.55, -2.48]);
      const trench = K.part('trench', [0, 0.012, 0], null, '3–6″ slit trench');
      K.box(trench, [0.05, 0.01, 4.4], 'dirt', [0.65, 0, 0]);
      const cable = K.part('cable', [0, 0, 0], null, '12/2 low-voltage cable');
      K.tube(cable, [[1.6, 0.45, -2.45], [1.4, 0.02, -2.3], [0.65, 0.02, -2.0], [0.65, 0.02, 2.3]], 0.012, 'black');
      const lights = K.part('lights', [0, 0, 0], null, 'Path lights (8–10 ft apart)');
      const glows = [];
      [-1.8, -0.2, 1.4].forEach((z) => {
        const g = K.group(lights, [0.65, 0, z]);
        K.cyl(g, [0.012, 0.012, 0.45, 10], 'blackOxide', [0, 0.22, 0]);
        K.cone(g, [0.13, 0.1, 24], K.std(0x1e1f21, { metalness: 0.7, roughness: 0.4 }), [0, 0.52, 0]);
        const bulb = K.cyl(g, [0.05, 0.06, 0.06, 16], K.std(0xfff1c8, { emissive: 0xffd27a, emissiveIntensity: 0 }), [0, 0.45, 0]);
        const pl = new THREE.PointLight(0xffd59a, 0, 2.2, 2);
        pl.position.set(0, 0.4, 0);
        g.add(pl);
        glows.push([bulb, pl]);
        K.cone(g, [0.02, 0.15, 8], 'black', [0, -0.05, 0], [180, 0, 0]);
      });
      const con = K.part('connectors', [0.65, 0.03, -1.8], null, 'Pinch-on connectors');
      K.box(con, [0.05, 0.03, 0.05], 'black');
      K.glb(null, 'shrub_02', { node: 'shrub_02_a', height: 0.8 }, [-1.1, 0, -1.2]);
      K.glb(null, 'shrub_02', { node: 'shrub_02_d', height: 0.9 }, [-1.2, 0, 1.0]);
      return {
        tick(t, fx) {
          const on = fx === 'on';
          glows.forEach(([b, l]) => {
            b.material.emissiveIntensity = on ? 2 : 0;
            l.intensity = on ? 1.2 : 0;
          });
        },
      };
    }
  );

  /* ---- Model: backyard half-court slab + in-ground hoop ---- */
  TB.model(
    'courtbuild',
    { cam: [6, 4.5, 7], at: [0, 0.5, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 14, radius: 12 }, tex: ['concrete_floor_01', 'gravel_floor', 'forrest_ground_01'], assets: ['cement_bag'],
      hidden: ['layout', 'dig', 'gravel', 'forms', 'rebar', 'anchor', 'pole', 'slab', 'joints', 'lines', 'board'] },
    (K) => {
      const W = 6;
      const D = 6;
      const lay = K.part('layout', [0, 0, 0], null, 'Layout: 20 × 20 ft');
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([x, z]) => K.box(lay, [0.04, 0.4, 0.04], 'woodLight', [x * (W / 2 + 0.2), 0.2, z * (D / 2 + 0.2)]));
      const dig = K.part('dig', [0, 0.005, 0], null, 'Excavated & graded');
      K.box(dig, [W + 0.3, 0.01, D + 0.3], K.pbr('forrest_ground_01', [5, 5], {}, 'dirt'));
      const gv = K.part('gravel', [0, 0.05, 0], null, '4″ compacted gravel');
      K.box(gv, [W, 0.08, D], K.pbr('gravel_floor', [5, 5], {}, 'stone'));
      const forms = K.part('forms', [0, 0.1, 0], null, '2×4 forms, staked');
      K.box(forms, [W + 0.1, 0.1, 0.05], 'wood', [0, 0, D / 2 + 0.03]);
      K.box(forms, [W + 0.1, 0.1, 0.05], 'wood', [0, 0, -D / 2 - 0.03]);
      K.box(forms, [0.05, 0.1, D], 'wood', [W / 2 + 0.03, 0, 0]);
      K.box(forms, [0.05, 0.1, D], 'wood', [-W / 2 - 0.03, 0, 0]);
      const rb = K.part('rebar', [0, 0.1, 0], null, '#3 rebar grid on chairs, 18″ o.c.');
      for (let i = -9; i <= 9; i += 1) {
        K.bar(rb, [i * 0.3, 0, -D / 2 + 0.1], [i * 0.3, 0, D / 2 - 0.1], 0.006, 'rusty' in K.m ? 'rusty' : 'forged');
        K.bar(rb, [-W / 2 + 0.1, 0.012, i * 0.3], [W / 2 - 0.1, 0.012, i * 0.3], 0.006, 'forged');
      }
      const an = K.part('anchor', [0, -0.3, -2.4], null, 'Hoop anchor: 4 J-bolts in a 4 ft deep footing');
      K.cyl(an, [0.3, 0.3, 1.2, 24], K.std(0x8f8d86, { transparent: true, opacity: 0.6 }), [0, -0.2, 0]);
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([x, z]) => K.cyl(an, [0.012, 0.012, 0.9, 8], 'steel', [x * 0.12, 0.05, z * 0.12]));
      const slab = K.part('slab', [0, 0.15, 0], null, '4″ concrete slab, broom finish');
      K.box(slab, [W, 0.1, D], K.pbr('concrete_floor_01', [4, 4], {}, 'concrete'), [0, 0, 0], null, 0.01);
      const jt = K.part('joints', [0, 0.201, 0], null, 'Control joints every 10 ft');
      K.box(jt, [0.015, 0.002, D], 'dark', [0, 0, 0]);
      K.box(jt, [W, 0.002, 0.015], 'dark', [0, 0, 0]);
      const ln = K.part('lines', [0, 0.203, 0], null, 'Court lines (key 12 ft wide)');
      K.box(ln, [3.66, 0.002, 0.05], 'white', [0, 0, 3.4]);
      K.box(ln, [0.05, 0.002, 5.8], 'white', [-1.83, 0, 0.5]);
      K.box(ln, [0.05, 0.002, 5.8], 'white', [1.83, 0, 0.5]);
      K.tor(ln, [1.8, 0.025, 180], 'white', [0, 0, 3.4], [-90, 0, 0]);
      const pole = K.part('pole', [0, 0.2, -2.4], null, 'Pole bolted to anchor, plumbed');
      K.box(pole, [0.15, 3.0, 0.15], 'dark', [0, 1.5, 0]);
      K.box(pole, [0.12, 0.12, 0.9], 'dark', [0, 2.9, 0.45]);
      const board = K.part('board', [0, 3.35, -1.5], null, 'Backboard & rim at 10 ft');
      K.box(board, [1.83, 1.07, 0.04], K.phys(0xe6f0f7, { transparent: true, opacity: 0.5, roughness: 0.05, clearcoat: 1 }));
      K.tor(board, [0.23, 0.01, 360], 'orange', [0, -0.3, 0.3], [90, 0, 0]);
      K.glb(null, 'cement_bag', { height: 0.18 }, [3.8, 0, 2.5], [0, 30, 0]);
      K.glb(null, 'cement_bag', { height: 0.18 }, [3.9, 0.18, 2.4], [0, 70, 0]);
    }
  );

  TB.category({
    id: 'backyard',
    code: 'BYB',
    kind: 'project',
    name: 'Backyard Builds',
    domain: 'projects',
    blurb: 'Fire pits, patios, garden beds, lighting and courts',
    repairs: [
      {
        id: 'fire-pit',
        title: 'Build a stone fire pit with seating',
        model: 'firepit',
        level: 2,
        time: '1–2 days',
        cost: '$350–900',
        summary: 'A 44″ block fire pit on a gravel base with a steel insert, a 12 ft paver pad, and seating 7 ft out. Retaining-wall blocks stack without mortar, so it’s a very doable weekend build.',
        intro: { show: ['patio', 'base', 'course1', 'course2', 'course3', 'cap', 'ring', 'innerGravel', 'seating', 'deco', 'woodpile'], spin: true, preview: true },
        safety: [
          'Check your city or county rules first. Many require 10–25 ft from structures and property lines, and some ban open fires or require a permit.',
          'Call 811 (free) at least 3 business days before digging so buried lines are marked.',
          'Keep it clear of overhanging branches, fences and decks, and always use a steel ring insert. Plain concrete block can crack or burst from heat.',
          'Lift blocks with your legs. Each one weighs 25–40 lb.',
        ],
        causes: [
          ['Pick a 10–25 ft setback', 'Away from the house, sheds, trees and fences. Downwind of where you sit most.'],
          ['Plan seating 7 ft from center', 'Close enough to feel the heat, far enough to be comfortable.'],
          ['Choose your materials', 'Wedge-shaped retaining-wall blocks make a round pit with no cutting.'],
        ],
        tools: ['Round-point shovel', 'Tape measure & spray paint', 'Stake and string', 'Hand tamper (or rent a plate compactor)', '4 ft level & rubber mallet', 'Caulk gun + masonry adhesive', 'Retaining-wall blocks (36 for 3 courses) + 12 caps', 'Steel fire ring insert (36–40″)', '¾″ gravel (~0.5 yd) and paver base', 'Pavers for the seating pad', 'Work gloves & safety glasses'],
        steps: [
          { t: 'Mark the circle', d: 'Drive a stake at the center, tie a string to the radius (about 22–24″ for a 44″ pit), and spray-paint the circle.', why: 'A string compass gives a perfect circle, which keeps every block at the same angle.', v: { cam: [1.6, 1.8, 1.8], at: [0, 0, 0], hi: ['paint', 'stake'], show: ['paint', 'stake'], tool: { id: 'tape', at: [0.75, 0, 0.1], rot: [0, 90, 0], scale: 1.6 } } },
          { t: 'Dig out 6″', d: 'Remove sod and soil inside the circle, 6″ deep and 2″ wider than the blocks. Keep the bottom flat.', why: 'The base needs room for 4″ of gravel plus a buried first course, which keeps frost from heaving the blocks.', v: { cam: [1.8, 1.6, 2.0], at: [0, 0, 0], hi: ['dig'], show: ['dig'], hide: ['paint'], tool: { id: 'shovel', at: [0.55, 0.02, 0.35], rot: [12, 30, -18], anim: 'push', scale: 1 } } },
          { t: 'Lay and compact the gravel base', d: 'Spread 4″ of gravel or paver base in two lifts, wetting and tamping each until firm and level.', why: 'Compacted gravel drains water and won’t settle, so the blocks stay level for years.', v: { cam: [1.8, 1.6, 2.0], at: [0, 0, 0], hi: ['base'], show: ['base'], hide: ['stake'], tool: { id: 'level', at: [-0.4, 0.06, 0], rot: [0, 0, 0], scale: 1.6 } } },
          { t: 'Set and level the first course', d: 'Place the first ring of blocks tight together. Level each block side to side and front to back, tapping with a rubber mallet.', why: 'Every course above copies the first one. A ⅛″ error here becomes a visible wobble at the top.', tip: 'Dry-fit the whole ring before leveling. Adjust gaps to land the last block without cutting.', v: { cam: [1.6, 1.4, 1.6], at: [0, 0.1, 0], hi: ['course1'], show: ['course1'], tool: [{ id: 'level', at: [0.52, 0.19, -0.2], rot: [0, 72, 0], scale: 1.2 }, { id: 'hammer', at: [0.5, 0.26, 0.28], rot: [0, -60, 0], anim: 'tap', scale: 1.2 }] } },
          { t: 'Stagger the next courses', d: 'Set the second and third rings offset by half a block, so each joint sits over the middle of a block below. Glue with masonry adhesive.', why: 'Staggered joints lock the wall together like brickwork. Stacked joints form a weak line that can split.', v: { cam: [1.8, 1.5, 1.9], at: [0, 0.2, 0], hi: ['course2', 'course3'], show: ['course2', 'course3'], tool: { id: 'caulkGun', at: [0.45, 0.5, 0.25], rot: [0, 30, -70], scale: 1.1 } } },
          { t: 'Drop in the steel ring', d: 'Lower the steel fire ring inside the blocks and fill the bottom with 3–4″ of gravel or lava rock.', why: 'The steel insert takes the direct heat. Concrete blocks heated directly can crack, and some can spall violently.', v: { cam: [1.4, 1.8, 1.6], at: [0, 0.25, 0], hi: ['ring', 'innerGravel'], show: ['ring', 'innerGravel'], hide: ['fire', 'logs'] } },
          { t: 'Cap the top', d: 'Glue the cap stones on with masonry adhesive, overhanging the outside edge slightly.', why: 'Caps tie the top course together and give a flat, comfortable ledge for feet and drinks.', v: { cam: [1.8, 1.6, 1.9], at: [0, 0.35, 0], hi: ['cap'], show: ['cap'], tool: { id: 'caulkGun', at: [-0.5, 0.55, 0.2], rot: [0, -30, 70], scale: 1.1 } } },
          { t: 'Build the seating pad', d: 'Lay a 12 ft paver circle around the pit using the same gravel-and-sand base, then set seating about 7 ft from the center.', why: 'A noncombustible pad catches sparks and keeps chairs level. Seven feet is close enough for warmth without scorching knees.', v: { cam: [3.6, 3.0, 4.2], at: [0, 0.2, 0], hi: ['patio', 'seating'], show: ['patio', 'seating', 'deco', 'woodpile'] } },
          { t: 'First fire', d: 'Wait 24 hours for the adhesive to cure. Start with a small fire, keep water or an extinguisher nearby, and never leave it unattended.', why: 'A small first fire drives out moisture slowly. A big hot fire on damp blocks can crack them.', v: { cam: [3.3, 2.4, 4.0], at: [0, 0.35, 0], hi: ['fire'], show: ['fire', 'logs'] } },
        ],
        learn: {
          how: 'A wood fire pit is a heat container sitting on a drainage base. The steel ring takes the direct flame and spreads heat out evenly, the block wall insulates and contains embers, and the compacted gravel underneath drains water and resists frost. Gaps at the bottom of a ring (or between blocks) feed air to the fire, so it burns hotter and less smoky.',
          specs: [['Typical inside diameter', '36–40″'], ['Wall height', '12–18″ (3 courses)'], ['Setback from structures', '10–25 ft (check code)'], ['Seating distance', '≈ 7 ft from center'], ['Gravel base', '4″ compacted'], ['Adhesive cure', '24 hr']],
          terms: [['Fire ring insert', 'Heavy steel liner that protects blocks from direct flame.'], ['Course', 'One horizontal row of blocks.'], ['Running bond', 'Joints staggered half a block from the row below.'], ['Spalling', 'Chips bursting off concrete as trapped moisture turns to steam.']],
          mistakes: ['Using regular concrete block or river rock without a steel liner.', 'Skipping the gravel base.', 'Building under trees or near a wooden fence.', 'Burning trash, pressure-treated wood or pallets (toxic fumes).'],
          tips: ['Put the pit downwind of your main seating so smoke drifts away from you.', 'Buy a few spare blocks; they help with layout and replace any chipped ones.'],
        },
        pro: 'Your area requires a permit or inspection, you want a gas-fueled fire pit (needs a licensed gas fitter), or the site slopes more than a few inches.',
      },
      {
        id: 'paver-patio',
        title: 'Lay a paver patio',
        model: 'patio',
        level: 3,
        time: '2–3 days',
        cost: '$8–15 per sq ft',
        summary: 'A paver patio lasts decades if the base is right. Excavate, compact gravel, screed sand flat, lay pavers in a pattern, lock the edges, and sweep in polymeric sand.',
        intro: { show: ['excavate', 'gravel', 'sand', 'pavers', 'edge', 'jsand', 'furniture'], spin: true, preview: true },
        safety: ['Call 811 before you dig.', 'Wear hearing and eye protection with a plate compactor or paver saw. Cut pavers wet to control silica dust.', 'Slope the patio away from your house.'],
        causes: [['Plan size & slope', 'Slope ⅛″ per foot away from the house so rain runs off.'], ['Choose a pattern', 'Herringbone is strongest; running bond is easiest.'], ['Estimate materials', 'Area × 1.1 for pavers (cuts and breakage).']],
        tools: ['Shovel & wheelbarrow', 'Stakes, mason line & line level', 'Plate compactor (rental)', '4″ gravel base + 1″ concrete sand', 'Two 1″ screed pipes and a straight 2×4', 'Pavers + 10% extra', 'Edge restraint + 10″ spikes', 'Rubber mallet', 'Polymeric sand & push broom', 'Paver saw or chisel (for cuts)'],
        steps: [
          { t: 'Lay out and square', d: 'Set stakes and mason line around the patio. Square the corners with the 3-4-5 method and set the lines to your finished height and slope.', why: 'A 3-4-5 triangle makes a perfect 90° corner, and the lines are your reference for every depth after this.', v: { cam: [3.4, 2.6, 3.6], at: [0, 0, 0], hi: ['strings'], show: ['strings'], tool: { id: 'tape', at: [1.5, 0.3, 1.25], rot: [0, 0, 0], scale: 1.6 } } },
          { t: 'Excavate 7″', d: 'Dig 7″ below finished height (4″ gravel + 1″ sand + 2⅜″ paver), extending 6″ past the edges. Keep the ⅛″/ft slope.', why: 'Base depth is what makes a patio last. Shallow bases settle into dips within a couple of years.', v: { cam: [3.4, 2.6, 3.6], at: [0, 0, 0], hi: ['excavate'], show: ['excavate'], tool: { id: 'shovel', at: [1.2, 0.02, 0.8], rot: [10, 40, -15], anim: 'push' } } },
          { t: 'Compact the gravel base', d: 'Add gravel in 2″ lifts, wetting and compacting each with the plate compactor until 4″ thick.', why: 'Thin lifts compact all the way through; a single thick layer stays loose underneath.', v: { cam: [3.4, 2.6, 3.6], at: [0, 0, 0], hi: ['gravel'], show: ['gravel'], hide: ['excavate'] } },
          { t: 'Screed the sand', d: 'Set two 1″ pipes on the gravel, spread sand, and drag a straight 2×4 across the pipes. Remove the pipes and fill the grooves.', why: 'Screeding gives a perfectly even 1″ bed. Never walk on screeded sand.', v: { cam: [3.0, 2.0, 3.0], at: [0, 0.1, 0], hi: ['sand', 'rails'], show: ['sand', 'rails'] } },
          { t: 'Lay the pavers', d: 'Start at a straight edge or corner and set pavers straight down, tight together, in your pattern. Work from the pavers, not the sand.', why: 'Sliding pavers into place shoves sand into ridges. Placing straight down keeps the bed flat.', v: { cam: [3.4, 2.6, 3.6], at: [0, 0.15, 0], hi: ['pavers'], show: ['pavers'], hide: ['rails'], tool: { id: 'hammer', at: [0.8, 0.22, 0.6], rot: [0, -40, 0], anim: 'tap', scale: 1.5 } } },
          { t: 'Install the edge restraint', d: 'Spike plastic or aluminum edging tight against the outside pavers every 12″.', why: 'Without edges, pavers creep outward under foot traffic and the joints open up.', v: { cam: [2.6, 1.4, 2.6], at: [1.2, 0.15, 1.0], hi: ['edge'], show: ['edge'], tool: { id: 'hammer', at: [1.53, 0.25, 0.4], rot: [0, 0, 0], anim: 'tap', scale: 1.5 } } },
          { t: 'Compact and sweep in polymeric sand', d: 'Run the compactor (with a pad) over the pavers, sweep polymeric sand into the joints, compact again, blow off the surface, and mist to activate.', why: 'Polymeric sand hardens and locks the pavers together, and resists weeds and ants.', v: { cam: [3.4, 2.6, 3.6], at: [0, 0.15, 0], hi: ['jsand'], show: ['jsand'] } },
          { t: 'Enjoy', d: 'Keep off for 24 hours while the joint sand cures, then set up your furniture.', why: 'Polymeric sand needs a dry day to set fully.', v: { cam: [3.4, 2.6, 3.6], at: [0, 0.3, 0], hi: ['furniture'], show: ['furniture'], hide: ['strings'] } },
        ],
        learn: {
          how: 'A paver patio is a flexible pavement. The pavers themselves aren’t glued; they interlock through friction in the joints, held in by the edge restraint. All the load passes through the sand bed into the compacted gravel, which spreads it out over the soil. Drainage and compaction decide how long it lasts.',
          specs: [['Gravel base (patio)', '4″'], ['Gravel base (driveway)', '8–12″'], ['Sand bed', '1″'], ['Slope', '⅛–¼″ per ft'], ['Extra pavers', '+10%']],
          terms: [['Screed', 'To strike a material flat along guide rails.'], ['Lift', 'One layer of base material compacted at a time.'], ['Edge restraint', 'Spiked border that keeps pavers from spreading.'], ['Polymeric sand', 'Joint sand with a binder that hardens when wet.']],
          mistakes: ['Using too much sand as a leveling layer (it shifts).', 'Skipping compaction.', 'Sweeping polymeric sand on a wet patio (stains the surface).'],
          tips: ['Rent the plate compactor for the weekend; it’s the single biggest quality difference.'],
        },
        pro: 'The area drains toward the house, you need a retaining wall, or it’s a driveway (heavier base and equipment).',
      },
      {
        id: 'garden-bed',
        title: 'Build a raised garden bed',
        model: 'gardenbed',
        level: 1,
        time: '3–4 hrs',
        cost: '$120–300',
        summary: 'A 4×8 ft cedar bed, 3 boards high. Screw boards to corner posts, line the bottom against gophers and weeds, and fill with a soil-and-compost mix.',
        intro: { show: ['boards1', 'boards2', 'boards3', 'posts', 'soil', 'plants'], spin: true, preview: true },
        safety: ['Use untreated cedar or redwood, or lumber rated safe for food gardens.', 'Wear gloves when handling hardware cloth; cut edges are sharp.'],
        causes: [['Sun', '6–8 hours for vegetables.'], ['Size', '4 ft wide so you reach the middle from either side.'], ['Depth', '11–18″ for most vegetables.']],
        tools: ['Drill/driver', '3″ exterior screws', 'Six 8 ft cedar 2×6 boards', 'One 4×4 post (cut into 4 corners)', 'Hardware cloth (½″) & staples', 'Cardboard or landscape fabric', 'Tape measure & level', 'Soil: 60% topsoil, 40% compost (≈ 1.2 yd³)'],
        steps: [
          { t: 'Pick and level the site', d: 'Choose a sunny, level spot. Mark a 4×8 rectangle and remove sod.', why: 'A level base keeps water from running to one end, and removing sod stops grass from growing up through the soil.', v: { cam: [2.6, 2.4, 2.8], at: [0, 0, 0], hi: ['site'], show: ['site'], tool: { id: 'tape', at: [1.35, 0, 0.75], rot: [0, 0, 0], scale: 1.4 } } },
          { t: 'Cut posts and boards', d: 'Cut the 4×4 into four 16″ corner posts. Leave the long sides at 8 ft and cut short sides to 45″ (4 ft minus two board thicknesses).', why: 'Cutting short sides to fit between the long boards makes a bed exactly 4×8 ft outside.', v: { cam: [2.6, 2.0, 2.8], at: [0, 0.2, 0], hi: ['posts'], show: ['posts'], tool: { id: 'handsaw', at: [1.25, 0.5, 0], rot: [0, 90, 0], anim: 'slide', amt: 0.6, scale: 1.4 } } },
          { t: 'Screw the bottom row', d: 'Screw the bottom boards to the posts with two 3″ screws per board end. Check the frame is square by measuring both diagonals.', why: 'Equal diagonals mean square corners. A racked frame bows as soil pushes outward.', v: { cam: [2.2, 1.4, 2.2], at: [1.15, 0.1, 0.6], hi: ['boards1'], show: ['boards1'], tool: { id: 'drill', at: [1.22, 0.08, 0.66], rot: [90, 0, 0], anim: 'spin', scale: 1.4 } } },
          { t: 'Add the upper rows', d: 'Stack the second and third rows, screwing each into the posts.', why: 'Screwing into posts (not into each other) lets boards expand without splitting.', v: { cam: [2.6, 2.0, 2.8], at: [0, 0.25, 0], hi: ['boards2', 'boards3'], show: ['boards2', 'boards3'], tool: { id: 'drill', at: [1.22, 0.36, 0.66], rot: [90, 0, 0], anim: 'spin', scale: 1.4 } } },
          { t: 'Line the bottom', d: 'Staple hardware cloth across the bottom if you have gophers or moles, then lay cardboard or landscape fabric over it.', why: 'Hardware cloth blocks burrowers; cardboard smothers grass and weeds and breaks down over a season.', v: { cam: [1.8, 2.4, 1.6], at: [0, 0.05, 0], hi: ['cloth', 'fabric'], show: ['cloth', 'fabric'], xray: true } },
          { t: 'Fill with soil mix', d: 'Fill with 60% topsoil and 40% compost, wetting every 4″ as you go. Leave 1–2″ below the top.', why: 'Wetting as you fill settles the soil now, so it doesn’t sink 3″ after the first rain.', v: { cam: [2.6, 2.4, 2.8], at: [0, 0.3, 0], hi: ['soil'], show: ['soil'], tool: { id: 'shovel', at: [1.5, 0.05, 1.0], rot: [20, 40, -20], anim: 'push' } } },
          { t: 'Plant and water', d: 'Plant seedlings at the spacing on their tags and water deeply.', why: 'Deep, infrequent watering grows deeper roots than daily sprinkles.', v: { cam: [2.6, 2.0, 2.8], at: [0, 0.35, 0], hi: ['plants'], show: ['plants'] } },
        ],
        learn: {
          how: 'Raised beds warm earlier in spring, drain better than clay soil, and let you control the soil mix completely. The frame holds back a lot of weight: wet soil weighs about 100 lb per cubic foot, so the corners and screws carry real load.',
          specs: [['Width', '≤ 4 ft'], ['Depth', '11–18″'], ['Soil for 4×8×11″', '≈ 1.1 yd³'], ['Sun', '6–8 hr']],
          terms: [['Hardware cloth', 'Welded wire mesh with small openings.'], ['Compost', 'Decomposed organic matter that feeds soil life.']],
          mistakes: ['Making beds wider than you can reach.', 'Filling with bagged garden soil only (compacts).', 'Using old railroad ties.'],
          tips: ['Leave 2–3 ft paths between beds for a wheelbarrow.'],
        },
        pro: 'You want a tall (24″+) or long bed that needs internal bracing, or a bed on a deck or roof.',
      },
      {
        id: 'path-lights',
        title: 'Install low-voltage path lights',
        model: 'pathlights',
        level: 1,
        time: '2–3 hrs',
        cost: '$150–500',
        summary: 'Low-voltage (12 V) lighting is safe to install yourself. Mount a transformer by an outdoor GFCI outlet, run cable in a shallow slit, and clip on lights.',
        intro: { show: ['transformer', 'cable', 'lights', 'connectors'], fx: 'on', spin: true, preview: true },
        safety: ['The transformer must plug into a GFCI-protected outdoor outlet with an in-use (bubble) cover.', 'Call 811 before digging, even for shallow trenches.', 'Keep total wattage under 80% of the transformer’s rating.'],
        causes: [['Plan fixture spacing', '8–10 ft apart along paths.'], ['Size the transformer', 'Add up fixture watts, then add 25%.'], ['Pick cable gauge', '12/2 for runs up to about 100 ft.']],
        tools: ['Low-voltage transformer with timer/photocell', '12/2 low-voltage cable', 'Path lights', 'Flat spade or edger', 'Wire stripper (for some connectors)', 'Multimeter'],
        steps: [
          { t: 'Mount the transformer', d: 'Mount it on the wall 12″ above ground near a GFCI outlet, and plug it in (leave it off).', why: 'Off the ground keeps it dry and away from sprinklers.', v: { cam: [2.6, 1.6, 0.4], at: [1.6, 0.6, -2.4], hi: ['transformer'], show: ['transformer'], tool: { id: 'drill', at: [1.6, 0.85, -2.38], rot: [-90, 0, 0], anim: 'spin' } } },
          { t: 'Lay out the lights', d: 'Set fixtures along the path, 8–10 ft apart, alternating sides if the path is wide.', why: 'Pools of light that just overlap look natural. Too close looks like a runway.', v: { cam: [3.6, 2.4, 3.4], at: [0.6, 0.2, 0], hi: ['lights'], show: ['lights'] } },
          { t: 'Cut a slit trench', d: 'Push a flat spade in 3–6″ deep and rock it to open a slit along the path. Tuck the cable in.', why: 'A slit closes back up and leaves almost no trace in the lawn.', v: { cam: [2.8, 1.8, 2.6], at: [0.65, 0, 0.5], hi: ['trench', 'cable'], show: ['trench', 'cable'], tool: { id: 'shovel', at: [0.7, 0.02, 1.0], rot: [5, 0, -8], anim: 'push' } } },
          { t: 'Connect each light', d: 'Squeeze the fixture’s pinch connector onto the main cable until the pins pierce it.', why: 'Pinch connectors make a sealed tap without cutting the main run.', v: { cam: [1.4, 0.9, -0.6], at: [0.65, 0.05, -1.8], hi: ['connectors'], show: ['connectors'], tool: { id: 'linemans', at: [0.68, 0.06, -1.78], rot: [0, 0, 0], anim: 'squeeze' } } },
          { t: 'Test and bury', d: 'Turn on the transformer at dusk, check voltage at the farthest light (≥ 10.5 V), adjust aim, then close the trench.', why: 'Long runs lose voltage, so the last light can look dim. A higher tap on the transformer fixes it.', v: { cam: [3.6, 2.4, 3.4], at: [0.6, 0.2, 0], hi: ['lights'], fx: 'on', hide: ['trench'], tool: { id: 'multimeter', at: [1.0, 0, 1.6], rot: [0, -30, 0], scale: 1 } } },
        ],
        learn: {
          how: 'A transformer steps 120 V household power down to 12–15 V, low enough to be safe to touch. Each light taps into the cable in parallel. Voltage drops as current travels down a long cable, so the farthest lights get a bit less; that’s why transformers have multiple output taps.',
          specs: [['Output voltage', '12–15 V'], ['Fixture voltage', '10.5–12 V'], ['Load', '≤ 80% of rating'], ['Spacing', '8–10 ft']],
          terms: [['Transformer', 'Steps line voltage down to low voltage.'], ['Voltage drop', 'Voltage lost along a long cable.'], ['Photocell', 'Sensor that turns lights on at dusk.']],
          mistakes: ['Overloading the transformer.', 'Using indoor extension cords outdoors.', 'Burying the cable too shallow where you aerate.'],
          tips: ['Use a hub layout (several shorter runs from the transformer) for long yards.'],
        },
        pro: 'You need a new outdoor outlet or a 120 V circuit, or want line-voltage lighting.',
      },
      {
        id: 'court-build',
        title: 'Build a backyard half court',
        model: 'courtbuild',
        level: 3,
        time: '1–2 weeks (incl. cure)',
        cost: '$4,000–9,000',
        summary: 'A 20×20 ft concrete half court with an in-ground hoop. Most people hire the pour, but understanding each stage lets you prep the site and plan it right.',
        intro: { show: ['slab', 'joints', 'lines', 'pole', 'board'], spin: true, preview: true },
        safety: ['Call 811 before digging, especially for the 4 ft hoop footing.', 'Wet concrete is caustic. Wear gloves, long sleeves and eye protection.', 'Check HOA rules, setbacks and drainage permits.'],
        causes: [['Size', '20×20 ft fits a key and free-throw line; 30×30 ft adds the 3-point arc.'], ['Drainage', 'Slope 1% away from the house.'], ['Hoop', 'In-ground hoops need a deep anchor poured before the slab.']],
        tools: ['Stakes, string & tape', 'Skid steer or shovels (excavation)', 'Plate compactor', '2×4 forms & stakes', '#3 rebar or wire mesh + chairs', 'Hoop anchor kit (J-bolts)', 'Concrete (≈ 5 yd³ for 20×20×4″)', 'Bull float, edger, groover, broom', 'Court paint & stencil'],
        steps: [
          { t: 'Lay out the court', d: 'Stake a 20×20 ft square, check both diagonals match, and set string at finished height with a 1% slope.', why: 'Equal diagonals guarantee a square court, so the painted lines come out straight.', v: { cam: [6, 4.5, 7], at: [0, 0, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [3.1, 0.3, 3.1], rot: [0, 45, 0], scale: 1.2 } } },
          { t: 'Excavate and grade', d: 'Remove sod and soil 8″ deep (4″ gravel + 4″ slab), and compact the subgrade.', why: 'Soft or organic soil under concrete settles and cracks the slab.', v: { cam: [6, 4.5, 7], at: [0, 0, 0], hi: ['dig'], show: ['dig'] } },
          { t: 'Pour the hoop anchor', d: 'Dig a 4 ft deep, 2 ft wide hole at the baseline, set the J-bolt template level, and fill with concrete. Cure 72 hours.', why: 'A 10 ft pole with a backboard is a big lever in wind. The deep footing keeps it plumb.', v: { cam: [3, 2.2, 1.2], at: [0, -0.2, -2.4], hi: ['anchor'], show: ['anchor'], xray: true } },
          { t: 'Gravel, forms, rebar', d: 'Compact 4″ of gravel, set 2×4 forms to string, and lay rebar on chairs so it sits mid-slab.', why: 'Steel only helps if it’s inside the concrete. Rebar lying on the gravel does nothing.', v: { cam: [5, 3.5, 5.5], at: [0, 0.1, 0], hi: ['gravel', 'forms', 'rebar'], show: ['gravel', 'forms', 'rebar'], hide: ['dig'] } },
          { t: 'Pour and finish', d: 'Pour, screed off the forms, bull float, edge, cut control joints, and broom-finish for grip.', why: 'Control joints give the slab a planned place to crack. A broom finish keeps shoes from slipping.', v: { cam: [6, 4.5, 7], at: [0, 0.1, 0], hi: ['slab', 'joints'], show: ['slab', 'joints'], hide: ['rebar', 'gravel'] } },
          { t: 'Cure, then install the hoop', d: 'Keep the slab damp for 7 days. Bolt the pole to the anchor, plumb it with the leveling nuts, and mount the backboard.', why: 'Concrete gains strength by curing, not drying. Most of its strength comes in the first week.', v: { cam: [3.5, 3.5, 4.5], at: [0, 2, -2], hi: ['pole', 'board'], show: ['pole', 'board'], tool: { id: 'level', at: [0.08, 1.3, -2.4], rot: [0, 0, 90], scale: 1.6 } } },
          { t: 'Paint the lines', d: 'After 28 days, paint the key and free-throw line with court paint.', why: 'Fresh concrete is too alkaline and damp for paint to bond well.', v: { cam: [6, 5, 7], at: [0, 0.2, 0], hi: ['lines'], show: ['lines'], hide: ['forms', 'layout'] } },
        ],
        learn: {
          how: 'A court slab is a thin concrete plate floating on a gravel base. Concrete is strong in compression but weak in tension, so it cracks as it shrinks and as soil moves. Rebar holds cracks tight, and control joints make them happen in straight lines. The hoop has its own deep footing because wind on a backboard creates large overturning forces.',
          specs: [['Slab thickness', '4″'], ['Gravel base', '4″'], ['Slope', '1%'], ['Rim height', '10 ft'], ['Concrete (20×20×4″)', '≈ 5 yd³'], ['Paint after', '28 days']],
          terms: [['Bull float', 'Wide float that smooths and levels fresh concrete.'], ['Control joint', 'Groove that controls where cracks form.'], ['J-bolt', 'Hooked anchor bolt cast into the footing.'], ['Cure', 'Keeping concrete moist so it reaches full strength.']],
          mistakes: ['Pouring the slab before the hoop anchor.', 'No slope (puddles).', 'Painting too soon.'],
          tips: ['Order 10% extra concrete; running short mid-pour leaves a weak cold joint.'],
        },
        pro: 'For the pour itself unless you’ve finished concrete before; 5 yards sets up fast and needs a crew.',
      },
    ],
  });
})();
