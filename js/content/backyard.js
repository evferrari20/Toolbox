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
    'firepit',
    {
      cam: [3.2, 2.6, 3.9], at: [0, 0.3, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 9 },
      assets: SCAN, tex: TEX,
      hidden: ['patio', 'dig', 'base', 'course1', 'course2', 'course3', 'cap', 'ring', 'innerGravel', 'seating', 'deco', 'woodpile', 'paint', 'stake'],
    },
    (K) => firePitScene(K, false)
  );


  /* ================= Fire pit tiers: Starter · Classic (above) · Showpiece · Luxury gas ================= */
  const chairsAround = (K, parent, pts) =>
    pts.forEach(([x, z, ry]) => K.glb(parent, 'outdoor_table_chair_set_01', { node: 'outdoor_table_chair_set_01_chair_01', height: 0.86 }, [x, 0, z], [0, ry, 0]) || K.box(parent, [0.5, 0.45, 0.5], 'wood', [x, 0.22, z]));

  // Starter: steel ring on a pea-gravel circle with steel edging.
  TB.model(
    'firepitStarter',
    { cam: [3.4, 2.6, 3.8], at: [0, 0.2, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 9 }, assets: SCAN, tex: TEX,
      hidden: ['paint', 'stake', 'dig', 'fabric', 'edging', 'gravel', 'ringKit', 'seating', 'deco'] },
    (K) => {
      const R = 1.8;
      const paint = K.part('paint', [0, 0.02, 0], null, 'Marked 12 ft circle');
      K.tor(paint, [R, 0.015, 360], K.std(0xff7a1a, { emissive: 0xff5a00, emissiveIntensity: 0.3 }), [0, 0, 0], [90, 0, 0]);
      const stake = K.part('stake', [0, 0, 0], null, 'Center stake & string');
      K.box(stake, [0.03, 0.4, 0.03], 'woodLight', [0, 0.2, 0]);
      K.bar(stake, [0, 0.05, 0], [R, 0.03, 0], 0.003, 'yellow');
      const dig = K.part('dig', [0, 0.006, 0], null, 'Sod removed, 3″ deep');
      K.cyl(dig, [R, R, 0.012, 64], K.pbr('forrest_ground_01', [3, 3], {}, 'dirt'));
      const fab = K.part('fabric', [0, 0.014, 0], null, 'Landscape fabric (weed barrier)');
      K.cyl(fab, [R - 0.02, R - 0.02, 0.004, 64], K.bumpy(0x2b2b2b, TB.tex.weave(), 0.01, { roughness: 1 }));
      const edge = K.part('edging', [0, 0.04, 0], null, 'Steel landscape edging');
      K.cyl(edge, [R + 0.01, R + 0.01, 0.1, 96, true], K.std(0x3a3a3a, { metalness: 0.8, roughness: 0.5, side: THREE.DoubleSide }));
      const gravel = K.part('gravel', [0, 0.03, 0], null, 'Pea gravel, 2–3″ deep');
      K.cyl(gravel, [R, R, 0.04, 64], K.pbr('gravel_floor', [4, 4], { color: 0xd8cbb8 }, 'stone'));
      const ring = K.part('ringKit', [0, 0.05, 0], null, 'Steel fire ring (36″)');
      const steel = K.std(0x2b2b2b, { metalness: 0.85, roughness: 0.55, side: THREE.DoubleSide });
      K.cyl(ring, [0.46, 0.46, 0.3, 48, true], steel, [0, 0.15, 0]);
      K.tor(ring, [0.46, 0.015, 360], steel, [0, 0.3, 0], [90, 0, 0]);
      K.rep(8, (i) => K.box(ring, [0.06, 0.08, 0.005], 'black', [Math.cos((i * Math.PI) / 4) * 0.462, 0.07, Math.sin((i * Math.PI) / 4) * 0.462], [0, (-i * 45) + 90, 0], 0));
      const inner = K.part('innerGravel', [0, 0.02, 0], ring, 'Firewood');
      logs(K, inner);
      const fx = fire(K, inner, 1.25);
      const seats = K.part('seating', [0, 0, 0], null, 'Seating 7 ft from center');
      chairsAround(K, seats, [[1.6, 0.9, -120], [-1.6, 0.9, 120], [0, -1.8, 0]]);
      const deco = K.part('deco', [0, 0, 0], null, 'Planters');
      K.glb(deco, 'planter_box_01', { height: 0.42 }, [-2.5, 0, -1.4], [0, 35, 0]);
      K.glb(deco, 'potted_plant_02', { height: 0.7 }, [2.4, 0, -1.4]);
      return { tick: (t) => fx.tick(t) };
    }
  );

  // Showpiece: block pit, curved built-in seat wall with cap lights, flagstone patio, string lights.
  TB.model(
    'firepitShowpiece',
    { cam: [5.6, 4.2, 6.2], at: [0, 0.3, -0.4], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 14, radius: 12 }, assets: SCAN, tex: TEX.concat(['granite_tile']),
      hidden: ['layout', 'dig', 'base', 'wall1', 'wall2', 'wallCap', 'capLights', 'wire', 'course1', 'course2', 'course3', 'cap', 'ring', 'innerGravel', 'flagstone', 'posts', 'strings', 'seating', 'deco'] },
    (K) => {
      const stone = K.pbr('stacked_stone_wall', [0.6, 0.35], { roughness: 1 }, 'stone');
      const capMat = K.pbr('stacked_stone_wall', [0.6, 0.25], { roughness: 0.9, color: 0xd9d2c6 }, 'concrete');
      const RA = 3.1;
      // layout paint: pit circle + seat wall arc
      const lay = K.part('layout', [0, 0.02, 0], null, 'Layout: patio, pit and seat-wall arc');
      K.tor(lay, [RA, 0.015, 360], K.std(0xff7a1a, { emissive: 0xff5a00, emissiveIntensity: 0.3 }), [0, 0, 0], [90, 0, 0]);
      K.tor(lay, [0.65, 0.015, 360], K.std(0xff7a1a, { emissive: 0xff5a00, emissiveIntensity: 0.3 }), [0, 0, 0], [90, 0, 0]);
      K.tor(lay, [2.45, 0.015, 170], K.std(0x2f6fde, { emissive: 0x1f4fbe, emissiveIntensity: 0.3 }), [0, 0, 0], [-90, 0, 5]);
      const dig = K.part('dig', [0, 0.006, 0], null, 'Excavated 7″ (whole patio)');
      K.cyl(dig, [RA, RA, 0.012, 72], K.pbr('forrest_ground_01', [4, 4], {}, 'dirt'));
      const base = K.part('base', [0, 0.02, 0], null, '4″ compacted base + 1″ sand');
      K.cyl(base, [RA, RA, 0.03, 72], K.pbr('gravel_floor', [5, 5], {}, 'stone'));
      // seat wall: 170° arc on the far side, 2 courses + cap
      const RW0 = 2.3;
      const RW1 = 2.62;
      const arcN = 22;
      const span = (170 * Math.PI) / 180;
      const blk = span / arcN;
      for (let c = 0; c < 2; c++) {
        const w = K.part('wall' + (c + 1), [0, 0.035 + c * 0.2, 0], null, c ? 'Seat wall, second course' : 'Seat wall, first course (leveled)');
        for (let i = 0; i < arcN; i++) {
          const ang = Math.PI + (Math.PI - span) / 2 + (i + 0.5 + (c ? 0.5 : 0)) * blk;
          if (c && i === arcN - 1) continue;
          const g = K.group(w, [0, 0, 0], [0, (-ang * 180) / Math.PI, 0]);
          wedge(K, g, RW0, RW1, blk * 0.98, 0.194, stone);
        }
      }
      const wc = K.part('wallCap', [0, 0.435, 0], null, 'Seat-wall cap (bench top, 18″ high)');
      for (let i = 0; i < arcN; i++) {
        const ang = Math.PI + (Math.PI - span) / 2 + (i + 0.5) * blk;
        const g = K.group(wc, [0, 0, 0], [0, (-ang * 180) / Math.PI, 0]);
        wedge(K, g, RW0 - 0.04, RW1 + 0.06, blk * 0.985, 0.06, capMat);
      }
      const lights = K.part('capLights', [0, 0.425, 0], null, 'Under-cap LED lights');
      const glows = [];
      for (let i = 1; i < arcN; i += 3) {
        const ang = Math.PI + (Math.PI - span) / 2 + (i + 0.5) * blk;
        const x = Math.cos(ang) * (RW1 + 0.03);
        const z = Math.sin(ang) * (RW1 + 0.03);
        const m = K.box(lights, [0.12, 0.012, 0.02], K.std(0xfff2d0, { emissive: 0xffd28a, emissiveIntensity: 0.0 }), [x, 0, z], [0, (-ang * 180) / Math.PI + 90, 0], 0);
        const pl = new THREE.PointLight(0xffd59a, 0, 1.4, 2);
        pl.position.set(x * 1.02, -0.05, z * 1.02);
        lights.add(pl);
        glows.push([m, pl]);
      }
      const wire = K.part('wire', [0, 0, 0], null, 'Low-voltage wire run inside the wall');
      K.tube(wire, [[2.45, 0.2, 0.1], [2.4, 0.2, -0.8], [1.7, 0.2, -1.75], [0, 0.2, -2.45], [-1.7, 0.2, -1.75], [-2.45, 0.2, -0.1]], 0.012, 'black');
      // fire pit (same block build as Classic)
      const R0 = 0.42;
      const R1 = 0.62;
      const H = 0.15;
      const per = 12;
      const a = (Math.PI * 2) / per;
      for (let c = 0; c < 3; c++) {
        const course = K.part('course' + (c + 1), [0, 0.035 + c * H, 0], null, ['Pit: first course', 'Pit: second course', 'Pit: third course'][c]);
        for (let i = 0; i < per; i++) wedge(K, K.group(course, [0, 0, 0], [0, ((i + (c % 2) * 0.5) * 360) / per, 0]), R0, R1, a * 0.985, H - 0.006, stone);
      }
      const cap = K.part('cap', [0, 0.035 + 3 * H, 0], null, 'Pit cap stones');
      for (let i = 0; i < per; i++) wedge(K, K.group(cap, [0, 0, 0], [0, ((i + 0.5) * 360) / per, 0]), R0 - 0.02, R1 + 0.03, a * 0.985, 0.05, capMat);
      const ring = K.part('ring', [0, 0.04, 0], null, 'Steel fire ring insert');
      K.cyl(ring, [0.415, 0.415, 0.5, 48, true], K.std(0x2a2a2a, { metalness: 0.85, roughness: 0.55, side: THREE.DoubleSide }), [0, 0.25, 0]);
      const inner = K.part('innerGravel', [0, 0.06, 0], null, 'Lava rock');
      K.cyl(inner, [0.4, 0.4, 0.04, 40], K.pbr('gravel_floor', [0.8, 0.8], { color: 0x9a8f86 }, 'stone'));
      logs(K, inner);
      const fx = fire(K, inner, 1.35);
      // flagstone: irregular stones on a jittered polar grid
      const flag = K.part('flagstone', [0, 0.035, 0], null, 'Flagstone patio, polymeric-sand joints');
      const fm = K.pbr('granite_tile', [0.6, 0.6], { color: 0xd2bf9e, roughness: 0.85 }, 'stone');
      const rnd = (() => {
        let x = 11;
        return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646;
      })();
      for (let ring2 = 0; ring2 < 5; ring2++) {
        const r0 = 0.72 + ring2 * 0.48;
        const r1 = r0 + 0.46;
        const cnt = Math.round((2 * Math.PI * (r0 + 0.24)) / 0.62);
        for (let i = 0; i < cnt; i++) {
          const a0 = (i / cnt) * Math.PI * 2 + ring2 * 0.3;
          const a1 = ((i + 1) / cnt) * Math.PI * 2 + ring2 * 0.3;
          const midA = (a0 + a1) / 2;
          const midR = (r0 + r1) / 2;
          if (midR > 2.2 && midR < 2.75 && Math.sin(midA) < -0.04) continue; // under the seat wall
          if (midR > RA - 0.1) continue;
          const pts = [];
          const jit = () => (rnd() - 0.5) * 0.06;
          const gap = 0.012;
          [[r0 + gap, a0 + gap / r0], [r0 + gap, (a0 + a1) / 2], [r0 + gap, a1 - gap / r0], [r1 - gap, a1 - gap / r1], [r1 - gap, (a0 + a1) / 2], [r1 - gap, a0 + gap / r1]].forEach(([rr, aa]) => pts.push([Math.cos(aa) * (rr + jit()), Math.sin(aa) * (rr + jit())]));
          K.ext(flag, pts, 0.035, fm, [0, 0.035, 0], [90, 0, 0], 0.006);
        }
      }
      const posts = K.part('posts', [0, 0, 0], null, 'Cedar string-light posts in planters');
      const pp = [[2.9, 1.6], [-2.9, 1.6], [2.9, -2.4], [-2.9, -2.4]];
      pp.forEach(([x, z]) => {
        K.box(posts, [0.09, 2.6, 0.09], 'woodDark', [x, 1.3, z]);
        K.glb(posts, 'planter_box_02', { height: 0.45 }, [x, 0, z], [0, 0, 0]) || K.box(posts, [0.5, 0.4, 0.5], 'wood', [x, 0.2, z]);
      });
      const strings = K.part('strings', [0, 0, 0], null, 'Café string lights');
      const bulbs = [];
      const span2 = (A, B) => {
        const n = 10;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const x = A[0] + (B[0] - A[0]) * t;
          const z = A[1] + (B[1] - A[1]) * t;
          const y = 2.55 - Math.sin(Math.PI * t) * 0.35;
          if (i < n) {
            const t2 = (i + 1) / n;
            K.bar(strings, [x, y, z], [A[0] + (B[0] - A[0]) * t2, 2.55 - Math.sin(Math.PI * t2) * 0.35, A[1] + (B[1] - A[1]) * t2], 0.004, 'black');
          }
          if (i > 0 && i < n) bulbs.push(K.sph(strings, 0.035, K.std(0xfff1cc, { emissive: 0xffc870, emissiveIntensity: 0 }), [x, y - 0.06, z]));
        }
      };
      span2(pp[0], pp[3]);
      span2(pp[1], pp[2]);
      span2(pp[0], pp[2]);
      const seats = K.part('seating', [0, 0, 0], null, 'Cushions & chairs');
      [-1.0, -0.3, 0.4, 1.1].forEach((x) => {
        const z = -Math.sqrt(2.46 * 2.46 - x * x);
        K.box(seats, [0.55, 0.08, 0.45], K.bumpy(0x2f6fde, TB.tex.weave(), 0.01, { roughness: 1 }), [x, 0.53, z], [0, (Math.atan2(x, -z) * 180) / Math.PI, 0], 0.03);
      });
      chairsAround(K, seats, [[1.6, 1.4, -130], [-1.6, 1.4, 130]]);
      const deco = K.part('deco', [0, 0, 0], null, 'Planting & lanterns');
      K.glb(deco, 'shrub_02', { node: 'shrub_02_b', height: 1.4 }, [-1.2, 0, -3.6]);
      K.glb(deco, 'shrub_02', { node: 'shrub_02_c', height: 1.2 }, [1.4, 0, -3.5], [0, 40, 0]);
      K.glb(deco, 'potted_plant_01', { height: 1.1 }, [3.3, 0, 0.2]);
      K.glb(deco, 'wooden_lantern_01', { height: 0.4 }, [2.2, 0.495, -0.9], [0, 20, 0]);
      return {
        tick(t, fxName) {
          fx.tick(t);
          const on = fxName === 'night' || fxName == null;
          glows.forEach(([m, l]) => {
            m.material.emissiveIntensity = on ? 2 : 0;
            l.intensity = on ? 0.9 : 0;
          });
          bulbs.forEach((b) => (b.material.emissiveIntensity = on ? 2.2 : 0));
        },
      };
    }
  );

  // Luxury: linear gas fire table with fire glass, concrete surround, large-format pavers.
  TB.model(
    'firepitGas',
    { cam: [3.8, 2.6, 4.2], at: [0, 0.35, 0], unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 12, radius: 10 }, assets: SCAN, tex: ['brushed_concrete', 'concrete_floor_01', 'gravel_floor', 'forrest_ground_01'],
      hidden: ['permit', 'trench', 'gasLine', 'pad', 'frame', 'skin', 'pan', 'glass', 'keyValve', 'soap', 'gasFlame', 'pavers', 'seating', 'deco'] },
    (K) => {
      const conc = K.pbr('brushed_concrete', [1, 0.5], { color: 0xb9b6ae }, 'concrete');
      const permit = K.part('permit', [1.6, 0, 1.6], null, 'Permit & gas fitter (required)');
      K.box(permit, [0.04, 0.6, 0.04], 'woodLight', [0, 0.3, 0]);
      K.box(permit, [0.3, 0.22, 0.01], 'white', [0, 0.6, 0.03]);
      const trench = K.part('trench', [0, 0.008, 0], null, '18″-deep trench to the house');
      K.box(trench, [0.25, 0.01, 4.2], K.pbr('forrest_ground_01', [1, 6], {}, 'dirt'), [1.2, 0, -2.2]);
      const gl = K.part('gasLine', [0, 0, 0], null, 'Gas line (installed by a licensed fitter)');
      K.tube(gl, [[1.2, 0.02, -4.2], [1.2, 0.02, -0.6], [0.95, 0.15, -0.2]], 0.02, 'yellow');
      const pad = K.part('pad', [0, 0.04, 0], null, 'Concrete footing pad');
      K.box(pad, [2.0, 0.08, 1.1], K.pbr('concrete_floor_01', [1.5, 1], {}, 'concrete'));
      const frame = K.part('frame', [0, 0.08, 0], null, 'Block frame with vents');
      K.box(frame, [1.9, 0.42, 0.06], 'grey', [0, 0.21, 0.47]);
      K.box(frame, [1.9, 0.42, 0.06], 'grey', [0, 0.21, -0.47]);
      K.box(frame, [0.06, 0.42, 1.0], 'grey', [0.92, 0.21, 0]);
      K.box(frame, [0.06, 0.42, 1.0], 'grey', [-0.92, 0.21, 0]);
      const skin = K.part('skin', [0, 0.08, 0], null, 'Concrete surround & cap');
      K.box(skin, [2.02, 0.44, 1.12], conc, [0, 0.22, 0], null, 0.02);
      const vents = K.group(skin);
      [[-0.6, 0.57], [0.6, 0.57], [-0.6, -0.57], [0.6, -0.57]].forEach(([x, z]) => K.box(vents, [0.2, 0.06, 0.01], 'black', [x, 0.12, z], null, 0));
      const pan = K.part('pan', [0, 0.53, 0], null, 'Stainless burner pan + H-burner');
      K.box(pan, [1.3, 0.04, 0.4], K.std(0xc9ced3, { metalness: 0.9, roughness: 0.25 }));
      K.box(pan, [1.0, 0.02, 0.02], 'steel', [0, 0.03, 0.08]);
      K.box(pan, [1.0, 0.02, 0.02], 'steel', [0, 0.03, -0.08]);
      const glass = K.part('glass', [0, 0.55, 0], null, 'Reflective fire glass');
      const gm = K.phys(0x2f8fd0, { roughness: 0.05, metalness: 0.2, clearcoat: 1, transparent: true, opacity: 0.9 });
      const rr = (() => {
        let x = 5;
        return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646;
      })();
      for (let i = 0; i < 260; i++) K.sph(glass, 0.014 + rr() * 0.01, gm, [(rr() - 0.5) * 1.26, rr() * 0.02, (rr() - 0.5) * 0.36], [1, 0.7, 1]);
      const key = K.part('keyValve', [0.7, 0.28, 0.57], null, 'Gas key valve');
      K.cyl(key, [0.04, 0.04, 0.01, 20], 'chrome', [0, 0, 0], [90, 0, 0]);
      K.box(key, [0.02, 0.1, 0.02], 'chrome', [0, 0, 0.03], null, 0);
      const soap = K.part('soap', [0.95, 0.15, -0.25], null, 'Soapy-water leak test');
      K.rep(5, (i) => K.sph(soap, 0.02, K.std(0xffffff, { transparent: true, opacity: 0.5 }), [i * 0.03 - 0.06, 0.02, 0]));
      const gf = K.part('gasFlame', [0, 0.57, 0], null, 'Flames');
      const flames = [];
      for (let i = 0; i < 9; i++) {
        const x = -0.48 + i * 0.12;
        const c1 = K.cone(gf, [0.05, 0.12, 12], new THREE.MeshBasicMaterial({ color: 0x3a6dff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), [x, 0.05, 0]);
        const c2 = K.cone(gf, [0.06, 0.32, 12], 'fire', [x, 0.2, 0]);
        c2.userData.h = 0.32;
        flames.push(c2);
      }
      const fl = new THREE.PointLight(0xff9a3a, 1.4, 6, 2);
      fl.position.set(0, 0.5, 0);
      gf.add(fl);
      const pavers = K.part('pavers', [0, 0.005, 0], null, 'Large-format concrete pavers');
      for (let i = -3; i <= 3; i++)
        for (let j = -3; j <= 3; j++) {
          if (Math.abs(i * 0.62) < 1.1 && Math.abs(j * 0.62) < 0.7) continue;
          K.box(pavers, [0.6, 0.03, 0.6], K.pbr('concrete_floor_01', [0.4, 0.4], { color: 0xd9d6cf }, 'concrete'), [i * 0.62, 0.015, j * 0.62], null, 0.006);
        }
      const seats = K.part('seating', [0, 0, 0], null, 'Lounge seating');
      K.glb(seats, 'painted_wooden_bench', { height: 0.89 }, [0, 0, -1.7]);
      chairsAround(K, seats, [[1.9, 0.6, -110], [-1.9, 0.6, 110], [0.6, 1.8, 170]]);
      const deco = K.part('deco', [0, 0, 0], null, 'Planters');
      K.glb(deco, 'planter_box_02', { height: 0.45 }, [-2.3, 0, -1.8], [0, 20, 0]);
      K.glb(deco, 'potted_plant_01', { height: 1.1 }, [2.3, 0, -1.7]);
      return {
        tick(t) {
          flames.forEach((c, i) => {
            const k = 0.8 + 0.25 * Math.sin(t * (7 + i) + i * 1.7);
            c.scale.set(1, k, 1);
            c.position.y = 0.04 + (c.userData.h * k) / 2;
          });
          fl.intensity = gf.visible ? 1.2 + 0.3 * Math.sin(t * 11) : 0;
        },
      };
    }
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
        summary: 'A 44″ block fire pit on a compacted gravel base with a steel ring insert, a 12 ft paver pad, and seating about 7 ft out. Wedge-shaped retaining-wall blocks stack without mortar, so it’s a very doable weekend build.',
        intro: { show: ['patio', 'base', 'course1', 'course2', 'course3', 'cap', 'ring', 'innerGravel', 'seating', 'deco', 'woodpile'], spin: true, preview: true },
        safety: [
          'Check your city or county fire rules first. The model fire code says recreational fires stay 25 ft from structures and anything combustible; many towns allow 10–15 ft for a contained pit, some require a permit, and burn bans apply in dry weather.',
          'Call 811 (free) at least 2–3 business days before digging so buried lines are marked.',
          'Keep it clear of overhanging branches, fences, sheds and decks, and always use a steel ring insert. Plain concrete block heated directly can crack or burst.',
          'Lift blocks with your legs. Each one weighs 25–40 lb, caps can be heavier.',
          'Keep a hose, bucket of water or fire extinguisher within reach every time you light it.',
        ],
        causes: [
          ['Pick the spot', 'Flat, open ground 10–25 ft from the house, sheds, trees and fences (whatever your local code says). Check which way the wind usually blows so smoke drifts away from the house.'],
          ['Plan seating 7 ft from center', 'Close enough to feel the heat, far enough to be comfortable and out of the spark zone.'],
          ['Choose your materials', 'Wedge-shaped retaining-wall blocks make a round pit with no cutting. Buy a steel insert sized to the block kit.'],
          ['Count the blocks', 'A 44″ pit takes about 12 blocks per course. Buy one or two spares.'],
        ],
        tools: ['Round-point shovel & flat spade', 'Tape measure, spray paint, stake and string', 'Hand tamper (or rented plate compactor)', '4 ft level, torpedo level & rubber mallet', 'Caulk gun + concrete/landscape-block adhesive', 'Retaining-wall blocks (≈ 36 for 3 courses) + 12 caps', 'Steel fire ring insert (36–40″)', '¾″ crushed gravel with fines (paver base), about 0.5 yd³', 'Pavers, sand and edging for the seating pad', 'Work gloves & safety glasses'],
        steps: [
          {
            t: 'Mark the circle',
            d: 'Drive a stake at the center. Tie a string to it and mark it at the outer radius of your pit, about 22″ for a 44″ pit. Keep the string tight and walk around, spraying paint at the string’s end to draw the circle.',
            why: 'A string compass gives a perfect circle, which keeps every wedge block at the same angle.',
            tip: 'Dry-lay one ring of blocks on the grass first and adjust the circle to fit them. Kits vary, and the blocks decide the true size.',
            ok: 'The painted circle is round all the way around: measuring from the stake to the line reads the same at four points.',
            v: { cam: [1.6, 1.8, 1.8], at: [0, 0, 0], hi: ['paint', 'stake'], show: ['paint', 'stake'], tool: { id: 'tape', at: [0.75, 0, 0.1], rot: [0, 90, 0], scale: 1.6 } },
          },
          {
            t: 'Dig out 6″',
            d: 'Slice off the sod and dig out the soil inside the circle about 6″ deep, and 2–3″ wider than the blocks all around. Keep the bottom flat, and check it with a level on a straight 2×4.',
            why: 'The hole holds about 4″ of gravel plus a partly buried first course, which locks the ring in place and keeps frost from shifting it.',
            tip: 'Measure depth from a string pulled tight across the hole, not from the uneven grass. Dug too deep in a spot? Fill it with gravel, never loose soil.',
            ok: 'A tape held down from the string reads about 6″ everywhere, and the bottom feels firm underfoot.',
            v: { cam: [1.8, 1.6, 2.0], at: [0, 0, 0], hi: ['dig'], show: ['dig'], hide: ['paint'], tool: { id: 'shovel', at: [0.55, 0.02, 0.35], rot: [12, 30, -18], anim: 'push', scale: 1 } },
          },
          {
            t: 'Lay and compact the gravel base',
            d: 'Spread about 2″ of crushed gravel, mist it with the hose, and pound it with a hand tamper (a heavy flat plate on a pole) until it stops sinking. Repeat with a second 2″ layer. Check level across the circle in several directions.',
            why: 'Compacted crushed gravel drains water and won’t settle, so the blocks stay level for years.',
            tip: 'Use angular crushed stone with fines (sold as paver base), not round pea gravel. Round stones roll like ball bearings and never lock tight.',
            ok: 'The base is level in every direction and your heel leaves almost no dent when you stomp on it.',
            v: { cam: [1.8, 1.6, 2.0], at: [0, 0, 0], hi: ['base'], show: ['base'], hide: ['stake'], tool: { id: 'level', at: [-0.4, 0.06, 0], rot: [0, 0, 0], scale: 1.6 } },
          },
          {
            t: 'Set and level the first course',
            d: 'Set the first ring of blocks tight together. Level each block side to side and front to back, and level across the ring with the 4 ft level. Tap high blocks down with a rubber mallet; lift low ones and add a little gravel under them.',
            why: 'Every course above copies the first one. A ⅛″ error here becomes a visible wobble at the top.',
            tip: 'Dry-fit the whole ring before leveling and adjust the gaps so the last block drops in without cutting. Leaving two small gaps in this course, on opposite sides, feeds air to the fire.',
            ok: 'The level bubble is centered on every block and across the ring in at least three directions.',
            v: { cam: [1.6, 1.4, 1.6], at: [0, 0.1, 0], hi: ['course1'], show: ['course1'], tool: [{ id: 'level', at: [0.52, 0.19, -0.2], rot: [0, 72, 0], scale: 1.2 }, { id: 'hammer', at: [0.5, 0.26, 0.28], rot: [0, -60, 0], anim: 'tap', scale: 1.2 }] },
          },
          {
            t: 'Stagger the next courses',
            d: 'Brush off grit, run two beads of block adhesive on top of the first course, and set the second ring offset by half a block, so each joint sits over the middle of a block below. Repeat for the third course and check level as you go.',
            why: 'Staggered joints lock the wall together like brickwork. Joints stacked in a line form a weak seam that can split.',
            tip: 'Keep adhesive about 1″ back from the inside face so it can’t ooze into the firebox, and wipe any squeeze-out right away.',
            ok: 'No joint lines up with the one below it, and the top of the third course reads level all the way around.',
            v: { cam: [1.8, 1.5, 1.9], at: [0, 0.2, 0], hi: ['course2', 'course3'], show: ['course2', 'course3'], tool: { id: 'caulkGun', at: [0.45, 0.5, 0.25], rot: [0, 30, -70], scale: 1.1 } },
          },
          {
            t: 'Drop in the steel ring',
            d: 'Lower the steel fire ring inside the blocks so it sits flat on the base. Fill the bottom 3–4″ with gravel or lava rock.',
            why: 'The steel insert takes the direct heat. Concrete blocks heated directly can crack, and damp ones can spall, which means chips burst off as trapped water turns to steam.',
            tip: 'Avoid river rock or creek stones in the bottom. They can hold water inside and crack or pop when heated.',
            ok: 'The ring sits level, doesn’t rock when pushed, and has an even gap to the blocks all around.',
            v: { cam: [1.4, 1.8, 1.6], at: [0, 0.25, 0], hi: ['ring', 'innerGravel'], show: ['ring', 'innerGravel'], hide: ['fire', 'logs'] },
          },
          {
            t: 'Cap the top',
            d: 'Dry-fit the cap stones first, so they overhang the outside edge evenly by about 1″. Then glue each one down with two beads of adhesive and press it in place.',
            why: 'Caps tie the top course together and give a flat, comfortable ledge for feet and drinks.',
            tip: 'If the caps leave gaps on a curve, set the gaps on the outside and keep the inner edges tight; that’s the edge people see when sitting.',
            ok: 'Every cap sits flat without rocking and the overhang looks even all the way around.',
            v: { cam: [1.8, 1.6, 1.9], at: [0, 0.35, 0], hi: ['cap'], show: ['cap'], tool: { id: 'caulkGun', at: [-0.5, 0.55, 0.2], rot: [0, -30, 70], scale: 1.1 } },
          },
          {
            t: 'Build the seating pad',
            d: 'Lay a 12 ft paver circle around the pit: dig out 7″, compact 4″ of the same gravel base, screed 1″ of sand, lay pavers, edge them and sweep in joint sand. Set seating about 7 ft from the pit’s center.',
            why: 'A noncombustible pad catches sparks and keeps chairs level. Seven feet is close enough for warmth without scorching knees.',
            tip: 'On a budget, a pea-gravel pad with steel edging works too and costs a third as much.',
            ok: 'The pad is flat underfoot, slopes slightly away from the pit for drainage, and every chair sits level.',
            v: { cam: [3.6, 3.0, 4.2], at: [0, 0.2, 0], hi: ['patio', 'seating'], show: ['patio', 'seating', 'deco', 'woodpile'] },
          },
          {
            t: 'First fire',
            d: 'Wait 24–48 hours for the adhesive to cure. Light a small fire of dry, split firewood, keep a hose or extinguisher nearby, and never leave it unattended. Douse it fully with water when you’re done.',
            why: 'A small first fire drives moisture out of the blocks slowly. A big hot fire on damp blocks can crack them.',
            tip: 'Burn only seasoned firewood. Pallets and treated wood give off toxic fumes, and trash fires throw embers.',
            ok: 'The fire burns with little smoke, and after dousing, the ashes are cold to a hand held just above them.',
            v: { cam: [3.3, 2.4, 4.0], at: [0, 0.35, 0], hi: ['fire'], show: ['fire', 'logs'] },
          },
        ],
        tricks: [
          ['Buy a kit', 'Fire pit kits come with matched wedge blocks, caps and a ring that fit together. You skip all the guesswork.'],
          ['Ask about the code first', 'A two-minute call to your fire department saves tearing out a pit that’s too close to the fence.'],
          ['Fix a rocking block', 'If a block rocks, lift it and sweep a little gravel into the low side; don’t shim with wood or stones.'],
          ['Air holes for a better burn', 'Two small gaps in the bottom course let air in, so the fire burns hotter with less smoke.'],
          ['Cover it', 'A metal lid or spark screen keeps rain out of the firebox and stops leaves from collecting.'],
          ['Stack wood away', 'Keep the woodpile at least 10 ft from the pit and off the ground so bugs and sparks stay out of it.'],
        ],
        refs: [
          ['Fire pit installation, 6 steps (Western Interlock PDF)', 'https://westerninterlock.com/wp-content/uploads/2018/05/Fire-Pit-Installation-6-Step_WEB.pdf'],
          ['How to build a fire pit (Bob Vila)', 'https://www.bobvila.com/articles/build-a-fire-pit/'],
          ['IFC Section 307: open burning and recreational fires (Baltimore City Code)', 'https://codes.baltimorecity.gov/us/md/cities/baltimore/code/building-codes/VIII/307'],
          ['Recreational fire pits (Knox County)', 'https://www.KnoxCounty.org/codes/pdfs/construction_info/RECREATIONALFIREPITS.pdf'],
          ['DIY retaining wall block fire pit (Remodelaholic)', 'https://www.remodelaholic.com/diy-retaining-wall-block-fire-pit/'],
        ],
        learn: {
          how: 'A wood fire pit is a heat container on a drainage base. The steel ring takes the direct flame and spreads the heat, the block wall insulates and holds embers in, and the compacted gravel underneath drains water and resists frost. Air drawn in at the bottom feeds the fire from below, so it burns hotter and cleaner with less smoke.',
          specs: [['Inside diameter', '36–40″'], ['Wall height', '12–18″ (3 courses)'], ['Setback', '25 ft model code; often 10–15 ft locally'], ['Seating distance', '≈ 7 ft from center'], ['Gravel base', '4″ compacted'], ['Excavation', '≈ 6″'], ['Adhesive cure', '24–48 hr']],
          terms: [['Fire ring insert', 'Heavy steel liner that protects blocks from direct flame.'], ['Course', 'One horizontal row of blocks.'], ['Running bond', 'Joints staggered half a block from the row below.'], ['Spalling', 'Chips bursting off concrete as trapped moisture turns to steam.'], ['Fines', 'The stone dust in crushed gravel that helps it pack hard.']],
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
        summary: 'A paver patio lasts decades if the base is right. Dig out, compact crushed gravel in thin layers, screed a 1″ sand bed, lay the pavers in a pattern, lock the edges, and sweep in polymeric sand.',
        intro: { show: ['excavate', 'gravel', 'sand', 'pavers', 'edge', 'jsand', 'furniture'], spin: true, preview: true },
        safety: [
          'Call 811 (free) at least 2–3 business days before you dig.',
          'Wear hearing protection, eye protection and steel-toe or sturdy boots with a plate compactor or paver saw.',
          'Cut pavers with a wet saw or a block splitter. Dry-cutting concrete makes silica dust that damages lungs; if you must dry-cut, wear an N95 or better.',
          'Slope the patio away from your house so water never runs toward the foundation.',
        ],
        causes: [
          ['Plan size & slope', 'Slope ⅛–¼″ per foot away from the house (about 1–2%) so rain runs off.'],
          ['Choose a pattern', 'Herringbone locks best under load; running bond is easiest to lay.'],
          ['Estimate materials', 'Pavers: area × 1.1 for cuts and breakage. Base: area × depth ÷ 324 = cubic yards for a depth in inches.'],
          ['Check your soil', 'Clay or wet soil needs a deeper base (6″) than sandy, well-drained soil (4″).'],
        ],
        tools: ['Shovel, flat spade & wheelbarrow', 'Stakes, mason line & line level', 'Plate compactor (rental) + pad for pavers', 'Crushed gravel base (¾″ minus) and concrete sand', 'Two 1″ OD screed pipes and a straight 2×4 (screed board)', 'Pavers + 10% extra', 'Edge restraint + 10″ spikes', 'Rubber mallet', 'Polymeric sand, push broom & leaf blower', 'Wet paver saw or block splitter (rental)', 'Hearing/eye protection, gloves'],
        steps: [
          {
            t: 'Lay out and square',
            d: 'Set stakes a foot outside each corner and stretch mason line between them. Square each corner with the 3-4-5 method: mark 3 ft along one line and 4 ft along the other; the diagonal between the marks must be exactly 5 ft. Set the lines at finished height, dropping ⅛–¼″ per foot away from the house.',
            why: 'A 3-4-5 triangle always makes a 90° corner, and the strings are your reference for every depth after this.',
            tip: 'For bigger patios, use 6-8-10 or 9-12-15; the larger triangle is more accurate. A line level hung at the middle of the string shows level.',
            ok: 'Both diagonals of the rectangle measure the same and the strings drop evenly away from the house.',
            v: { cam: [3.4, 2.6, 3.6], at: [0, 0, 0], hi: ['strings'], show: ['strings'], tool: { id: 'tape', at: [1.5, 0.3, 1.25], rot: [0, 0, 0], scale: 1.6 } },
          },
          {
            t: 'Excavate 7″',
            d: 'Dig 7–9″ below the string height: 4–6″ of gravel base, 1″ of sand and about 2⅜″ of paver. Extend the dig 6–12″ past the patio edges so the base supports the edge restraint. Keep the slope, and tamp the soil bottom firm.',
            why: 'Base depth is what makes a patio last. Shallow bases settle into dips within a couple of years.',
            tip: 'Measure down from the strings every few feet with a tape. Hit soft, spongy or black organic soil? Dig it out and replace it with gravel.',
            ok: 'The tape reads the same depth below the strings everywhere, and the bottom is firm, not spongy.',
            v: { cam: [3.4, 2.6, 3.6], at: [0, 0, 0], hi: ['excavate'], show: ['excavate'], tool: { id: 'shovel', at: [1.2, 0.02, 0.8], rot: [10, 40, -15], anim: 'push' } },
          },
          {
            t: 'Compact the gravel base',
            d: 'Spread crushed gravel in layers about 2–3″ thick. Dampen each layer and run the plate compactor over it 2–3 times, overlapping passes, until it no longer sinks. Build up to 4″ (6″ on clay) and check against the strings.',
            why: 'Thin lifts compact all the way through. One thick layer stays loose underneath and settles later.',
            tip: 'Gravel should be damp like a wrung-out sponge. Too dry won’t pack; too wet turns to mush. Squeeze a handful: it should hold its shape.',
            ok: 'A boot heel leaves no mark and the compactor bounces rather than sinking.',
            v: { cam: [3.4, 2.6, 3.6], at: [0, 0, 0], hi: ['gravel'], show: ['gravel'], hide: ['excavate'] },
          },
          {
            t: 'Screed the sand',
            d: 'Lay two 1″ pipes on the gravel a few feet apart, parallel to the slope. Shovel concrete sand between them and drag a straight 2×4 across the pipes in a sawing motion to strike it off flat. Lift the pipes out and fill their grooves with a trowel.',
            why: 'Screeding gives an even 1″ bed. Too much sand shifts under pavers; never walk on screeded sand.',
            tip: 'Screed only the area you’ll pave in the next hour or two. Rain or footprints mean screeding again.',
            ok: 'The sand looks smooth and flat with no footprints, and a 2×4 laid on it touches everywhere.',
            v: { cam: [3.0, 2.0, 3.0], at: [0, 0.1, 0], hi: ['sand', 'rails'], show: ['sand', 'rails'] },
          },
          {
            t: 'Lay the pavers',
            d: 'Start at a straight edge or corner, ideally against the house, and set pavers straight down, snug against each other, in your pattern. Kneel on the laid pavers, not the sand. Every 4–5 rows, check your lines with a string so they stay straight.',
            why: 'Sliding pavers into place shoves sand into ridges. Setting them straight down keeps the bed flat.',
            tip: 'Pull pavers from several pallets as you go to mix color variations. Leave cuts for last and mark them in place with a pencil.',
            ok: 'Joint lines run straight along the string, and pavers sit evenly with no high corners.',
            v: { cam: [3.4, 2.6, 3.6], at: [0, 0.15, 0], hi: ['pavers'], show: ['pavers'], hide: ['rails'], tool: { id: 'hammer', at: [0.8, 0.22, 0.6], rot: [0, -40, 0], anim: 'tap', scale: 1.5 } },
          },
          {
            t: 'Install the edge restraint',
            d: 'Set plastic or aluminum edging tight against the outside pavers, sitting on the gravel base, not the sand. Drive a 10″ spike through it every 8–12″ with a hammer.',
            why: 'Without a locked edge, pavers creep outward under foot traffic and the joints open up.',
            tip: 'On curves, snip the back of plastic edging so it bends. Check every spike goes into compacted gravel; spikes in soft soil pull out.',
            ok: 'Pushing on an edge paver with your foot, it doesn’t move outward.',
            v: { cam: [2.6, 1.4, 2.6], at: [1.2, 0.15, 1.0], hi: ['edge'], show: ['edge'], tool: { id: 'hammer', at: [1.53, 0.25, 0.4], rot: [0, 0, 0], anim: 'tap', scale: 1.5 } },
          },
          {
            t: 'Compact and sweep in polymeric sand',
            d: 'On a dry day, run the compactor (with a pad) over the pavers. Sweep polymeric sand into the joints, compact again to settle it, and top up until joints are full to about ⅛″ below the paver top. Blow every grain off the surface, then mist with a shower nozzle as the bag says.',
            why: 'Polymeric sand has a binder that hardens when wet, locking the pavers together and resisting weeds and ants.',
            tip: 'Leftover dust on the surface hardens into a gray haze. Blow it off with a leaf blower held low and flat before watering.',
            ok: 'Joints are evenly full just below the paver tops, and the paver faces look clean with no sand film.',
            v: { cam: [3.4, 2.6, 3.6], at: [0, 0.15, 0], hi: ['jsand'], show: ['jsand'] },
          },
          {
            t: 'Let it cure and furnish',
            d: 'Keep foot traffic off for 24 hours and anything heavy off for 48, with no rain in that window. Then set up your furniture.',
            why: 'Polymeric sand needs a dry day to set fully. Rain too soon washes the binder out.',
            tip: 'Put felt or plastic glides under metal chair legs; they scratch paver faces.',
            ok: 'Pressing a joint with your thumb, it feels firm like hard-packed soil, not loose sand.',
            v: { cam: [3.4, 2.6, 3.6], at: [0, 0.3, 0], hi: ['furniture'], show: ['furniture'], hide: ['strings'] },
          },
        ],
        tricks: [
          ['Rent once, do both', 'Rent the plate compactor and wet saw for the same weekend. It’s the biggest quality upgrade per dollar.'],
          ['Order gravel by weight', 'Crushed gravel weighs about 1.4 tons per cubic yard. Have it dumped on a tarp near the patio.'],
          ['Use a screed board with a handle', 'Screw a short handle to the 2×4; you’ll pull straighter and save your back.'],
          ['Fix a low paver', 'Pry it out with two flat screwdrivers, add a little sand, re-tap it and check with a straightedge.'],
          ['Cut from the waste side', 'Mark cuts in place, then cut slightly outside the line. A paver can be trimmed again; it can’t be made bigger.'],
          ['Herringbone at 45°', 'Herringbone at 45° hides small layout errors and locks the best under load.'],
        ],
        refs: [
          ['ICP construction inspection checklist (Interlocking Concrete Pavement Institute)', 'https://icpi.org/s/ICP-Construction-Inspection-Checklist-June-24-2015-002.pdf'],
          ['Guide specification for interlocking concrete pavement (Uni-Group USA PDF)', 'https://www.uni-groupusa.org/PDF/Tech_Spec_9_Guide_Spec_for_ICP.pdf'],
          ['ICPI Tech Spec 2: construction of interlocking concrete pavements (ORCO PDF)', 'https://www.orco.com/wp-content/uploads/2022/08/ICPI-TechSpec2-ORCO.pdf'],
          ['Edge restraints tech spec (ICPI / Calstone)', 'https://www.icpi.org/s/Calstone-Tech-Spec-3-Edge-Restraints-Updated.pdf'],
          ['Installation guide (Belgard)', 'https://www.belgard.com/plan-design/installation-beyond/installation/'],
        ],
        learn: {
          how: 'A paver patio is a flexible pavement. The pavers aren’t glued; they lock together through friction in the sand-filled joints, held in by the edge restraint. Every footstep passes through the sand bed into the compacted gravel, which spreads the load wide over the soil. Drainage and compaction decide how long it lasts.',
          specs: [['Gravel base (patio)', '4″ (6″ on clay or in frost areas)'], ['Gravel base (driveway)', '8–12″'], ['Base past edges', '6–12″'], ['Sand bed', '1″ concrete sand'], ['Slope', '⅛–¼″ per ft (1–2%)'], ['Lift thickness', '2–3″ per compaction'], ['Extra pavers', '+10%']],
          terms: [['Screed', 'To strike a material flat along guide rails.'], ['Lift', 'One layer of base material compacted at a time.'], ['Edge restraint', 'Spiked border that keeps pavers from spreading.'], ['Polymeric sand', 'Joint sand with a binder that hardens when wet.'], ['3-4-5 method', 'Triangle trick for a perfect right angle.']],
          mistakes: ['Using too much sand as a leveling layer (it shifts).', 'Skipping compaction or compacting thick lifts.', 'Sweeping polymeric sand on a wet patio (stains the surface).', 'No slope.'],
          tips: ['Rent the plate compactor for the weekend; it’s the single biggest quality difference.'],
        },
        pro: 'The area drains toward the house, you need a retaining wall or steps, or it’s a driveway (heavier base and equipment).',
      },
      {
        id: 'garden-bed',
        title: 'Build a raised garden bed',
        model: 'gardenbed',
        level: 1,
        time: '3–4 hrs',
        cost: '$150–350',
        summary: 'A 4×8 ft cedar bed, three 2×6 boards (about 16½″) high. Screw the boards to 4×4 corner posts, line the bottom against burrowing pests and weeds, and fill it with a topsoil-and-compost mix.',
        intro: { show: ['boards1', 'boards2', 'boards3', 'posts', 'soil', 'plants'], spin: true, preview: true },
        safety: [
          'Use untreated cedar or redwood, or modern copper-treated lumber (labeled ACQ or MCA), which extension services consider fine for food gardens. Never use old railroad ties or decades-old treated wood.',
          'Wear gloves and eye protection when cutting hardware cloth; the cut ends are sharp wires.',
          'Wear a dust mask when cutting cedar; its dust irritates the nose and lungs.',
        ],
        causes: [
          ['Sun', '6–8 hours of direct sun for vegetables. Watch the spot for a day before you build.'],
          ['Size', '4 ft wide so you can reach the middle from either side without stepping in.'],
          ['Depth', '11–18″ for most vegetables; 3 boards give about 16″.'],
          ['Water access', 'Put it within reach of a hose; beds dry faster than the ground.'],
        ],
        tools: ['Drill/driver + ⅛″ pilot bit', '3″ exterior screws (coated or stainless)', 'Nine 8 ft cedar 2×6 boards (6 for the long sides, 3 cut into six 45″ ends)', 'One 8 ft 4×4 (cut into four 16½″ corner posts)', 'Circular saw or miter saw + speed square', 'Hardware cloth (½″ mesh, or ¼″ for voles) & staples', 'Cardboard or landscape fabric', 'Tape measure & 4 ft level', 'Soil: about 60% topsoil, 40% compost (≈ 1.3–1.5 yd³)'],
        steps: [
          {
            t: 'Pick and level the site',
            d: 'Choose a sunny, nearly level spot. Mark a 4×8 ft rectangle with stakes and string, then slice off the sod with a flat spade. Rake the soil and check it with a level on a straight board, digging down the high side rather than filling the low side.',
            why: 'A level base keeps water from running to one end, and removing sod stops grass from growing up through the soil.',
            tip: 'Turn the cut sod upside down in the bottom of the bed instead of hauling it off. It rots into good soil.',
            ok: 'A level laid on a board across the rectangle shows the bubble centered in both directions.',
            v: { cam: [2.6, 2.4, 2.8], at: [0, 0, 0], hi: ['site'], show: ['site'], tool: { id: 'tape', at: [1.35, 0, 0.75], rot: [0, 0, 0], scale: 1.4 } },
          },
          {
            t: 'Cut posts and boards',
            d: 'Cut the 4×4 into four 16½″ corner posts, the height of three stacked 2×6s. Leave the six long boards at 8 ft. Cut the three remaining boards in half to make six 45″ end pieces (4 ft minus the two long boards’ 1½″ thickness on each side).',
            why: 'Cutting the end boards to fit between the long boards makes a bed exactly 4×8 ft outside.',
            tip: 'Measure and cut one end piece, then use it as a pattern for the rest so all six match exactly.',
            ok: 'All six end pieces are the same length when stacked, and all four posts stand the same height.',
            v: { cam: [2.6, 2.0, 2.8], at: [0, 0.2, 0], hi: ['posts'], show: ['posts'], tool: { id: 'handsaw', at: [1.25, 0.5, 0], rot: [0, 90, 0], anim: 'slide', amt: 0.6, scale: 1.4 } },
          },
          {
            t: 'Screw the bottom row',
            d: 'On a flat surface, stand a post in each corner and attach the bottom boards. Drill ⅛″ pilot holes ¾″ from the board ends, then drive two 3″ screws per board end into the post. Measure both diagonals; nudge the frame until they match.',
            why: 'Equal diagonals mean square corners. A racked frame bows outward as the wet soil pushes on it.',
            tip: 'Set the drill clutch to about 10 so it slips when the screw is snug instead of sinking the head deep. If the cedar splits, move the screw ½″ and pre-drill.',
            ok: 'The two diagonals are within ¼″ of each other and each screw head sits flush.',
            v: { cam: [2.2, 1.4, 2.2], at: [1.15, 0.1, 0.6], hi: ['boards1'], show: ['boards1'], tool: { id: 'drill', at: [1.22, 0.08, 0.66], rot: [90, 0, 0], anim: 'spin', scale: 1.4 } },
          },
          {
            t: 'Add the upper rows',
            d: 'Stack the second and third rows on top, keeping the board edges tight and the ends flush, and screw each board end into the posts the same way. Set the frame on the site and check it’s level.',
            why: 'Screwing into the posts, not into the boards below, lets each board swell and shrink without splitting.',
            tip: 'On long 8 ft sides, add a 2×4 stake or a cross tie at the middle if your soil is heavy. It stops the sides bowing out over time.',
            ok: 'All three rows sit tight with no gaps you can see daylight through, and the top edge reads level.',
            v: { cam: [2.6, 2.0, 2.8], at: [0, 0.25, 0], hi: ['boards2', 'boards3'], show: ['boards2', 'boards3'], tool: { id: 'drill', at: [1.22, 0.36, 0.66], rot: [90, 0, 0], anim: 'spin', scale: 1.4 } },
          },
          {
            t: 'Line the bottom',
            d: 'If you have gophers, moles or voles, lay hardware cloth (welded wire mesh) across the whole bottom and staple it up the inside of the boards 2–3″. Then cover the bottom with plain cardboard (tape and labels removed) or landscape fabric.',
            why: 'Hardware cloth blocks burrowers from below. Cardboard smothers grass and weeds, then breaks down within a season so roots can go deep.',
            tip: 'Overlap cardboard pieces by 6″ and wet it down before adding soil so it lies flat and starts breaking down.',
            ok: 'No bare soil or grass shows through the bottom layer, and the mesh is stapled snug at the edges.',
            v: { cam: [1.8, 2.4, 1.6], at: [0, 0.05, 0], hi: ['cloth', 'fabric'], show: ['cloth', 'fabric'], xray: true },
          },
          {
            t: 'Fill with soil mix',
            d: 'Fill with about 60% screened topsoil and 40% compost, mixing as you go. Water each 4″ layer until damp. Stop 1–2″ below the top edge so water and mulch stay in.',
            why: 'Wetting as you fill settles the soil now, so it doesn’t sink 3″ after the first rain.',
            tip: 'Buying bulk? A 4×8 bed 15″ deep needs about 1.3–1.5 cubic yards, usually cheaper delivered than in bags. Bagged raised-bed mix is fine for one bed.',
            ok: 'A handful of soil squeezed in your fist holds together but crumbles when poked, and the surface sits 1–2″ below the top.',
            v: { cam: [2.6, 2.4, 2.8], at: [0, 0.3, 0], hi: ['soil'], show: ['soil'], tool: { id: 'shovel', at: [1.5, 0.05, 1.0], rot: [20, 40, -20], anim: 'push' } },
          },
          {
            t: 'Plant and water',
            d: 'Plant seedlings at the spacing on their tags, tallest crops on the north side so they don’t shade the rest. Water deeply until the soil is damp 6″ down, then add 1–2″ of mulch.',
            why: 'Deep, less frequent watering grows deeper roots than daily sprinkles.',
            tip: 'Push a finger into the soil every morning. If it’s dry 1–2″ down, water; if it’s damp, skip a day.',
            ok: 'Two hours after watering, soil dug 6″ down with a trowel feels moist.',
            v: { cam: [2.6, 2.0, 2.8], at: [0, 0.35, 0], hi: ['plants'], show: ['plants'] },
          },
        ],
        tricks: [
          ['Cedar lasts, pine doesn’t', 'Untreated pine rots in 2–3 years. Cedar lasts about 10, and the cost difference is small for one bed.'],
          ['Drip on a timer', 'A soaker hose or drip line on a cheap faucet timer is the single best way to keep a bed productive in summer.'],
          ['Top up yearly', 'Soil settles and compost breaks down. Add 1–2″ of compost each spring.'],
          ['Leave wide paths', 'Leave 2–3 ft between beds so a wheelbarrow and mower fit.'],
          ['Hoops for later', 'Screw short pipe sleeves inside the long sides now; you can slip in hoops for netting or frost cover later.'],
          ['Avoid all-bagged topsoil', 'Bagged topsoil alone packs down hard. The compost is what keeps it loose and alive.'],
        ],
        refs: [
          ['Raised bed gardens (University of Minnesota Extension)', 'https://extension.umn.edu/planting-and-growing-guides/raised-bed-gardens'],
          ['How to build raised garden beds (Family Handyman)', 'https://www.familyhandyman.com/project/how-to-build-raised-garden-beds/'],
          ['How to build a raised garden bed (Lowe’s)', 'https://www.lowes.com/n/how-to/how-to-build-a-raised-garden-bed'],
          ['Container vegetable gardening (University of Maryland Extension)', 'https://extension.umd.edu/resource/container-vegetable-gardening'],
          ['Raised garden bed plans (Bob Vila)', 'https://www.bobvila.com/articles/raised-garden-bed-plans/'],
        ],
        learn: {
          how: 'Raised beds warm earlier in spring, drain better than clay soil, and let you control the soil mix completely. The frame holds back a lot of weight: wet soil weighs about 100 lb per cubic foot, so a full 4×8 bed carries roughly two tons, and the corners and screws carry real load.',
          specs: [['Width', '≤ 4 ft'], ['Height (3 × 2×6)', '≈ 16½″'], ['Soil depth', '11–18″'], ['Soil for 4×8×15″', '≈ 1.3–1.5 yd³'], ['Mix', '≈ 60% topsoil / 40% compost'], ['Sun', '6–8 hr']],
          terms: [['Hardware cloth', 'Welded wire mesh with small openings.'], ['Compost', 'Decomposed organic matter that feeds soil life.'], ['Racking', 'A frame leaning out of square.']],
          mistakes: ['Making beds wider than you can reach.', 'Filling with bagged topsoil only (compacts).', 'Using old railroad ties or creosote-treated wood.', 'No access to water.'],
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
        summary: 'Low-voltage (12 V) landscape lighting is safe to install yourself. Mount a transformer near an outdoor GFCI outlet, run direct-burial cable in a shallow slit, clip on the lights, and check the voltage at the far end.',
        intro: { show: ['transformer', 'cable', 'lights', 'connectors'], fx: 'on', spin: true, preview: true },
        safety: [
          'Plug the transformer into a GFCI-protected outdoor outlet (the kind with Test and Reset buttons) that has an in-use cover, the bubble cover that stays closed with a plug in it.',
          'Call 811 before digging, even for shallow trenches.',
          'Keep the total fixture wattage under 80% of the transformer’s rating.',
          'Use only cable labeled for direct burial and outdoor-rated connectors.',
        ],
        causes: [
          ['Plan fixture spacing', '8–10 ft apart along paths, set 6–12″ back from the edge.'],
          ['Size the transformer', 'Add up the fixture watts, then pick a transformer at least 25% bigger.'],
          ['Pick cable gauge', '12-gauge (12/2) for runs up to about 100 ft; split longer yards into several runs.'],
        ],
        tools: ['Low-voltage transformer with timer/photocell', '12/2 direct-burial low-voltage cable', 'Path lights (LED)', 'Flat spade or half-moon edger', 'Wire stripper (for some connectors)', 'Multimeter (digital)', 'Drill + screws to mount the transformer'],
        steps: [
          {
            t: 'Mount the transformer',
            d: 'Screw the transformer to the wall or a post about 12″ above the ground, within reach of its cord to a GFCI outlet. Plug it in but leave its switch off. Set the timer or point the photocell (the light sensor) at open sky.',
            why: 'Off the ground keeps it out of puddles, snow and sprinkler spray.',
            tip: 'Press the outlet’s Test button: the transformer’s indicator (or a lamp plugged in) should go dead. Press Reset. That proves the GFCI works before you start.',
            ok: 'The transformer hangs level and solid, and its cord reaches the outlet with no extension cord.',
            v: { cam: [2.6, 1.6, 0.4], at: [1.6, 0.6, -2.4], hi: ['transformer'], show: ['transformer'], tool: { id: 'drill', at: [1.6, 0.85, -2.38], rot: [-90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Lay out the lights',
            d: 'Lay the cable on the ground along the path from the transformer. Set fixtures beside it, 8–10 ft apart and 6–12″ back from the path edge, alternating sides if the path is wide. Leave a loop of extra cable at each fixture.',
            why: 'Pools of light that just touch look natural. Lights too close together look like an airport runway.',
            tip: 'Do a test at dusk before you dig: connect the lights loosely, switch on, and move them until it looks right.',
            ok: 'Standing at the house, you see evenly spaced pools of light with no long dark gaps.',
            v: { cam: [3.6, 2.4, 3.4], at: [0.6, 0.2, 0], hi: ['lights'], show: ['lights'] },
          },
          {
            t: 'Cut a slit trench',
            d: 'Push a flat spade or edger straight down 6″ along the cable line and rock it side to side to open a narrow slit. Press the cable into the bottom of the slit with a stick or your fingers.',
            why: 'A slit closes back up and leaves almost no trace in the lawn, while 6″ keeps the cable below most aerating and edging.',
            tip: 'Water the lawn the day before. Moist soil opens easily; dry soil fights you and tears the sod.',
            ok: 'The cable sits at the bottom of the slit, about the depth of your spade blade, along its whole length.',
            v: { cam: [2.8, 1.8, 2.6], at: [0.65, 0, 0.5], hi: ['trench', 'cable'], show: ['trench', 'cable'], tool: { id: 'shovel', at: [0.7, 0.02, 1.0], rot: [5, 0, -8], anim: 'push' } },
          },
          {
            t: 'Connect each light',
            d: 'At each fixture, set the main cable into the fixture’s pinch connector and squeeze the two halves together until they snap. The pins pierce the cable’s insulation and touch the wires inside.',
            why: 'Pinch connectors make a tap without cutting the main run, and every light gets power in parallel.',
            tip: 'If a light stays dark, open its connector, slide it ½″ along the cable and squeeze again; the pins probably missed a wire.',
            ok: 'You hear and feel a firm click, and the connector won’t slide along the cable when tugged.',
            v: { cam: [1.4, 0.9, -0.6], at: [0.65, 0.05, -1.8], hi: ['connectors'], show: ['connectors'], tool: { id: 'linemans', at: [0.68, 0.06, -1.78], rot: [0, 0, 0], anim: 'squeeze' } },
          },
          {
            t: 'Test and bury',
            d: 'At dusk, switch the transformer on. Set the multimeter to AC volts and touch its probes to the farthest fixture’s connection. You want about 10.5–12 V (or within the LED’s listed range). Adjust each light’s aim, then press the slit closed with your foot.',
            why: 'Voltage drops along a long cable, so the last light can look dim. A higher output tap on the transformer brings it back up.',
            tip: 'If the far lights read low, move the cable to the transformer’s 13 V or 14 V tap, or feed the run from its middle (a T layout) instead of one end.',
            ok: 'The meter reads within range at the last light, and every light glows the same brightness.',
            v: { cam: [3.6, 2.4, 3.4], at: [0.6, 0.2, 0], hi: ['lights'], fx: 'on', hide: ['trench'], tool: { id: 'multimeter', at: [1.0, 0, 1.6], rot: [0, -30, 0], scale: 1 } },
          },
        ],
        tricks: [
          ['LEDs change the math', 'LED path lights use 2–5 W each, so a 150 W transformer can run 30 or more. Size it for future lights too.'],
          ['Leave service loops', 'A 12″ loop of cable at each fixture lets you move the light later without splicing.'],
          ['Hub, don’t daisy-chain', 'For long yards, run two or three shorter cables from the transformer instead of one long one. The far lights stay bright.'],
          ['Warm white looks best', 'Pick 2700–3000K fixtures. Cool white looks harsh at night.'],
          ['Sleeve under paths', 'To cross a walk, push a ½″ PVC pipe under it with a hose jet, then pull the cable through.'],
        ],
        refs: [
          ['Low-voltage landscape lighting voltage drop (Dauer Manufacturing)', 'https://dauermanufacturing.com/blog/low-voltage-landscape-lighting-voltage-drop'],
          ['Landscape lighting transformer sizing guide (Tru-Scapes)', 'https://tru-scapes.com/landscape-lighting-transformer-sizing-guide/'],
          ['How to install low-voltage landscape lighting (Big Frog Supply)', 'https://www.bigfrogsupply.com/blogs/big-frog-blog/how-to-install-low-voltage-landscape-lighting-12v-step-by-step-parts-list'],
          ['How to install landscape lighting (Volt Lighting)', 'https://www.voltlighting.com/learn/how-to-install-landscape-lighting'],
          ['Landscape lighting guide (Kichler)', 'https://www.kichler.com/tips-guides/landscape-lighting-guide/uplighting-for-landscape-lighting'],
        ],
        learn: {
          how: 'A transformer steps 120 V household power down to 12–15 V, low enough to be safe to touch. Each light taps into the cable in parallel. Voltage drops as current travels down a long, thin cable, so the farthest lights get a bit less; that’s why transformers have several output taps at 12, 13, 14 and 15 V.',
          specs: [['Output voltage', '12–15 V taps'], ['Fixture voltage', '≈ 10.5–12 V (LEDs often 9–15 V)'], ['Load', '≤ 80% of rating'], ['Spacing', '8–10 ft'], ['Cable depth', '≈ 6″'], ['Transformer height', '≈ 12″ above ground']],
          terms: [['Transformer', 'Steps line voltage down to low voltage.'], ['Voltage drop', 'Voltage lost along a long cable.'], ['Photocell', 'Sensor that turns lights on at dusk.'], ['GFCI', 'Outlet that cuts power in a split second if current leaks to ground.']],
          mistakes: ['Overloading the transformer.', 'Using indoor extension cords outdoors.', 'Burying the cable too shallow where you aerate.', 'Twisting wires with tape instead of rated connectors.'],
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
        summary: 'A 20×20 ft concrete half court with an in-ground hoop. Most people hire out the pour, but understanding each stage lets you prep the site, plan it right and check the crew’s work.',
        intro: { show: ['slab', 'joints', 'lines', 'pole', 'board'], spin: true, preview: true },
        safety: [
          'Call 811 before digging, especially for the 4 ft hoop footing.',
          'Wet concrete is caustic and burns skin. Wear waterproof gloves, long sleeves, rubber boots and eye protection, and rinse splashes right away.',
          'Check HOA rules, setbacks, drainage and permit requirements before ordering concrete.',
          'Raising a hoop pole and backboard takes at least two or three people; follow the maker’s lift steps.',
        ],
        causes: [
          ['Size', '20×20 ft fits the key and free-throw line; about 30×30 ft adds a short 3-point arc.'],
          ['Drainage', 'Slope 1% (⅛″ per ft) away from the house.'],
          ['Hoop', 'In-ground hoops need a deep anchor footing poured before the slab.'],
          ['Concrete spec', 'Order 4,000 psi mix, air-entrained in freezing climates.'],
        ],
        tools: ['Stakes, string, line level & tape', 'Skid steer or shovels (excavation)', 'Plate compactor', '2×4 forms & stakes', '#3 rebar on 18–24″ grid or wire mesh + plastic chairs', 'Hoop anchor kit (J-bolts and template)', 'Concrete (≈ 5 yd³ for 20×20×4″, order 10% extra)', 'Bull float, edger, groover, broom', 'Curing blankets or plastic', 'Court paint & stencil'],
        steps: [
          {
            t: 'Lay out the court',
            d: 'Drive stakes for a 20×20 ft square and string it. Measure both diagonals; move corners until they match (about 28′ 3⅜″ each). Set the strings at the finished slab height, dropping about 2½″ across the 20 ft for 1% slope away from the house.',
            why: 'Equal diagonals guarantee a square court, so the painted lines come out straight.',
            tip: 'Use batter boards (a 2×4 crosspiece on two stakes) a few feet outside each corner. You can pull the strings off to dig and put them back in the exact spot.',
            ok: 'Both diagonals read the same within ¼″ and a line level shows the strings falling the right way.',
            v: { cam: [6, 4.5, 7], at: [0, 0, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [3.1, 0.3, 3.1], rot: [0, 45, 0], scale: 1.2 } },
          },
          {
            t: 'Excavate and grade',
            d: 'Remove sod and soil about 8″ below the string (4″ gravel + 4″ slab), plus a foot past the edges for forms. Rake to the slope and compact the soil with a plate compactor.',
            why: 'Soft or organic soil under concrete settles and cracks the slab.',
            tip: 'Probe the bottom with a steel rod. If it sinks easily in spots, dig out the soft soil and replace it with compacted gravel.',
            ok: 'The bottom is firm everywhere and sits about 8″ below the strings across the whole area.',
            v: { cam: [6, 4.5, 7], at: [0, 0, 0], hi: ['dig'], show: ['dig'] },
          },
          {
            t: 'Pour the hoop anchor',
            d: 'Dig the anchor hole where the hoop maker says, often 48″ deep and about 24″ across, centered behind the baseline. Bolt the J-bolts to the template, hang it level at the slab’s finished height, and fill with concrete. Let it cure at least 72 hours before mounting the pole.',
            why: 'A 10 ft pole with a backboard is a big lever in the wind. The deep footing keeps it plumb.',
            tip: 'Check the template is level both ways and square to the court twice: once before the pour and once after the concrete is in. Threads covered in tape stay clean.',
            ok: 'The template reads level both ways, its face lines up with the baseline, and the bolt threads stick up the length the maker specifies.',
            v: { cam: [3, 2.2, 1.2], at: [0, -0.2, -2.4], hi: ['anchor'], show: ['anchor'], xray: true },
          },
          {
            t: 'Gravel, forms, rebar',
            d: 'Spread 4″ of crushed gravel and compact it in two layers. Stake 2×4 forms to the strings so their tops are the slab height. Lay #3 rebar in an 18–24″ grid, tied at crossings, on plastic chairs so it sits in the middle of the slab.',
            why: 'Steel only helps when it’s inside the concrete. Rebar lying on the gravel does nothing.',
            tip: 'Drive form stakes every 3–4 ft and screw through the form into them. Wet concrete pushes hard, and a bowed form leaves a wavy edge.',
            ok: 'The form tops follow the strings exactly, and the rebar sits about 2″ off the gravel everywhere.',
            v: { cam: [5, 3.5, 5.5], at: [0, 0.1, 0], hi: ['gravel', 'forms', 'rebar'], show: ['gravel', 'forms', 'rebar'], hide: ['dig'] },
          },
          {
            t: 'Pour and finish',
            d: 'Pour, then screed (strike off) the concrete with a straight board across the forms. Bull float to smooth it, run an edger along the forms, and cut control joints 1″ deep (a quarter of the slab thickness) to make 10×10 ft panels. Broom across the slab for grip.',
            why: 'Control joints give the slab a planned place to crack. A broom finish keeps shoes from slipping.',
            tip: 'Wait until the bleed water (the shiny water layer on top) has dried off before floating again or brooming. Finishing it while wet weakens the surface.',
            ok: 'The surface is flat, with clean rounded edges, straight joints, and even broom lines.',
            v: { cam: [6, 4.5, 7], at: [0, 0.1, 0], hi: ['slab', 'joints'], show: ['slab', 'joints'], hide: ['rebar', 'gravel'] },
          },
          {
            t: 'Cure, then install the hoop',
            d: 'Keep the slab damp for 7 days: mist it and cover it with plastic or curing blankets, or spray on a curing compound. Then bolt the pole to the anchor, plumb it with the leveling nuts, tighten them, and mount the backboard and rim at 10 ft.',
            why: 'Concrete gets strong by curing, a chemical reaction that needs water, not by drying out. Most of its strength comes in the first week.',
            tip: 'Plumb the pole with a level on two adjacent faces and adjust only the bottom leveling nuts; then snug the top nuts down evenly in a crisscross order.',
            ok: 'The pole reads plumb on two faces and the rim measures 10 ft from the slab to its top edge.',
            v: { cam: [3.5, 3.5, 4.5], at: [0, 2, -2], hi: ['pole', 'board'], show: ['pole', 'board'], tool: { id: 'level', at: [0.08, 1.3, -2.4], rot: [0, 0, 90], scale: 1.6 } },
          },
          {
            t: 'Paint the lines',
            d: 'After about 28 days, clean the slab, snap chalk lines or use a stencil, mask the edges with tape, and roll two coats of acrylic sport-court paint. The key is 12 ft wide (16 ft in the NBA) and the free-throw line is 15 ft from the backboard face.',
            why: 'Fresh concrete is too alkaline and damp for paint to bond well.',
            tip: 'Tape a sheet of plastic down overnight. If the concrete under it is dark and damp in the morning, wait longer before painting.',
            ok: 'The lines are crisp, the paint feels dry and slightly gritty, and the tape peels off clean.',
            v: { cam: [6, 5, 7], at: [0, 0.2, 0], hi: ['lines'], show: ['lines'], hide: ['forms', 'layout'] },
          },
        ],
        tricks: [
          ['Order the right truck', 'Ask for 4,000 psi, air-entrained (in freezing areas), with 10% extra. Running short mid-pour leaves a weak seam.'],
          ['Pour early on a cool day', 'Hot afternoon pours set too fast to finish well. Book the truck for the morning.'],
          ['Pump if access is tight', 'If the mixer truck can’t reach, hire a line pump. Wheelbarrowing 5 yards is brutal and slow.'],
          ['Anchor first, always', 'Pour the hoop anchor days before the slab, then form the slab around it.'],
          ['Sport tiles are an upgrade', 'Snap-together court tiles over the slab soften falls and add color, and they can go on later.'],
        ],
        refs: [
          ['Backyard basketball court (Family Handyman)', 'https://www.familyhandyman.com/article/backyard-basketball-court/'],
          ['DIY guide: building a concrete-based backyard basketball court (APC)', 'https://apc.us.com/insights/diy-guide-building-a-concrete-based-backyard-basketball-court/'],
          ['How to build a DIY basketball court (Engineer Fix)', 'https://engineerfix.com/how-to-build-a-diy-basketball-court/'],
          ['How to prepare concrete for sport surfacing (Local Tennis Court Resurfacing)', 'https://localtenniscourtresurfacing.com/how-to-properly-prepare-concrete-for-sport-surfacing-athletic-courts/'],
          ['DIY backyard basketball court (Champ Courts)', 'https://champcourts.com/blogs/news/diy-backyard-basketball-court'],
        ],
        learn: {
          how: 'A court slab is a thin concrete plate on a gravel base. Concrete is very strong when squeezed but weak when stretched, so it cracks as it shrinks and as soil moves. Rebar holds cracks tightly closed, and control joints make them happen in straight lines you can’t see. The hoop has its own deep footing because wind on a backboard creates large tipping forces.',
          specs: [['Slab thickness', '4″'], ['Gravel base', '4″'], ['Concrete', '4,000 psi, air-entrained in frost areas'], ['Slope', '1% (⅛″ per ft)'], ['Control joints', '1″ deep, ≤ 10 ft apart'], ['Rim height', '10 ft'], ['Concrete (20×20×4″)', '≈ 5 yd³ + 10%'], ['Moist cure', '7 days'], ['Paint after', '≈ 28 days']],
          terms: [['Bull float', 'Wide float that smooths and levels fresh concrete.'], ['Control joint', 'Groove that controls where cracks form.'], ['J-bolt', 'Hooked anchor bolt cast into the footing.'], ['Cure', 'Keeping concrete moist so it reaches full strength.'], ['Air-entrained', 'Concrete with tiny air bubbles that resists freeze damage.']],
          mistakes: ['Pouring the slab before the hoop anchor.', 'No slope (puddles).', 'Letting the slab dry out the first week.', 'Painting too soon.'],
          tips: ['Order 10% extra concrete; running short mid-pour leaves a weak cold joint.'],
        },
        pro: 'For the pour itself unless you’ve finished concrete before; 5 yards sets up fast and needs a crew of three or four.',
      },
    ],
  });

  /* ---------- Fire pit tiers ---------- */
  // Homepage hero shows the Showpiece tier, finished, at golden hour.
  TB.model(
    'hero',
    Object.assign({}, TB.MODELS.firepitShowpiece.view, { cam: [5.2, 3.0, 5.6], at: [0, 0.4, -0.5], hidden: ['layout', 'dig', 'wire'] }),
    TB.MODELS.firepitShowpiece.build
  );
  const fp = TB.repair('backyard', 'fire-pit');
  fp.title = 'Build a fire pit & seating area';
  fp.variants = [
    {
      id: 'starter',
      name: 'Starter: steel ring on gravel',
      blurb: 'A 36″ steel ring on a pea-gravel circle with steel edging. Done in an afternoon.',
      level: 1,
      time: '3–5 hrs',
      cost: '$150–350',
      model: 'firepitStarter',
      summary: 'The quickest good-looking fire pit: a 12 ft pea-gravel circle edged in steel, with a ready-made steel fire ring in the middle. No digging deeper than about 3″, and no blocks to level.',
      intro: { show: ['dig', 'fabric', 'edging', 'gravel', 'ringKit', 'seating', 'deco'], spin: true, preview: true },
      tools: ['Steel fire ring (36″)', 'Steel landscape edging (≈ 38 ft) + stakes', 'Landscape fabric + landscape staples', 'Pea gravel (≈ 1.5 yd³)', 'Flat spade, sod cutter or half-moon edger & rake', 'Tape measure, stake, string & spray paint', 'Rubber mallet', 'Hand tamper'],
      steps: [
        {
          t: 'Mark a 12 ft circle',
          d: 'Drive a stake at the center of your spot. Tie a string to it, measure out 6 ft and tie a can of spray paint there. Keep the string tight and walk around, spraying a line on the grass.',
          why: 'A 12 ft circle fits a 3 ft ring plus chairs at a comfortable 6–7 ft from the flames, all on noncombustible ground.',
          tip: 'Before painting, set two chairs out on the grass and sit for a minute. If the circle feels cramped, go to 14 ft.',
          ok: 'Measuring from the stake to the paint line reads 6 ft at any point you check.',
          v: { cam: [2.8, 2.8, 3.2], at: [0, 0, 0], hi: ['paint', 'stake'], show: ['paint', 'stake'], tool: { id: 'tape', at: [1.8, 0, 0.2], rot: [0, 90, 0], scale: 1.6 } },
        },
        {
          t: 'Strip the sod',
          d: 'Cut along the paint line with a flat spade or edger. Then slide the spade under the grass, about 2″ deep, to peel the sod off in strips. Dig out about 3″ of soil in total, rake it smooth and tamp it firm.',
          why: 'Removing the roots and sod stops grass from growing up through the gravel.',
          tip: 'Water the area the day before; damp sod peels off in clean strips. Use the sod to patch bare spots elsewhere in the yard.',
          ok: 'The circle is bare, flat soil about 3″ below the lawn, with a clean vertical edge all around.',
          v: { cam: [3.0, 2.6, 3.4], at: [0, 0, 0], hi: ['dig'], show: ['dig'], hide: ['paint'], tool: { id: 'shovel', at: [1.2, 0.02, 0.6], rot: [10, 40, -15], anim: 'push' } },
        },
        {
          t: 'Lay landscape fabric',
          d: 'Roll landscape fabric across the circle, overlapping each strip 6″. Pin it down with landscape staples every 2–3 ft and trim it to the circle’s edge.',
          why: 'Fabric keeps the gravel from sinking into the soil and blocks most weeds.',
          tip: 'Cut a 3 ft hole in the fabric where the ring will sit, so ashes and rain drain straight down instead of pooling on the fabric.',
          ok: 'No soil shows anywhere and the fabric lies flat without bubbles when you walk on it.',
          v: { cam: [3.0, 2.6, 3.4], at: [0, 0, 0], hi: ['fabric'], show: ['fabric'], hide: ['stake'] },
        },
        {
          t: 'Install steel edging',
          d: 'Bend the steel edging along the circle’s edge and lock the strips together at their joints. Drive the stakes through the edging slots with a rubber mallet every 3 ft, leaving the top about ½″ above the lawn.',
          why: 'Steel holds a clean curve and keeps the gravel out of the lawn and the grass out of the gravel.',
          tip: 'Set edging slightly below the grass blade height so the mower wheel rides on the edge. If a stake hits a rock, move it a few inches rather than forcing it.',
          ok: 'The edging forms a smooth circle with no kinks and stands about a finger’s width above the soil.',
          v: { cam: [2.4, 1.6, 2.6], at: [1.4, 0.05, 1.0], hi: ['edging'], show: ['edging'], tool: { id: 'hammer', at: [1.55, 0.12, 0.95], rot: [0, -40, 0], anim: 'tap', scale: 1.5 } },
        },
        {
          t: 'Spread pea gravel',
          d: 'Wheelbarrow in the pea gravel and spread it 2–3″ deep with a rake, keeping it just below the top of the edging.',
          why: 'Pea gravel is noncombustible, drains instantly and feels comfortable underfoot.',
          tip: 'Rinse the gravel with a hose after spreading to wash off the dust; it looks better and doesn’t stick to shoes.',
          ok: 'The gravel is level, about 2–3″ deep when you push a finger down, and sits just under the edging lip.',
          v: { cam: [3.0, 2.6, 3.4], at: [0, 0, 0], hi: ['gravel'], show: ['gravel'] },
        },
        {
          t: 'Set the ring and furnish',
          d: 'Center the steel ring, twist it down into the gravel until it sits level, and check with a level across the rim. Set chairs about 7 ft from the center, and keep a hose or bucket of water within reach.',
          why: 'A level ring burns evenly and won’t tip. Seven feet keeps chairs and knees out of the spark zone.',
          tip: 'Pull gravel away from inside the ring and line the bottom with sand. Embers sink into pea gravel and smolder there.',
          ok: 'The level bubble is centered across the ring and the ring doesn’t rock when pushed.',
          v: { cam: [3.4, 2.6, 3.8], at: [0, 0.2, 0], hi: ['ringKit', 'seating'], show: ['ringKit', 'seating', 'deco'] },
        },
      ],
      tricks: [
        ['Use a sod cutter for big circles', 'For anything over 12 ft, rent a manual kick sod cutter; it saves hours of spade work.'],
        ['Buy gravel in bulk', 'A yard and a half of bulk gravel costs about the same as 20 bags and saves a lot of lifting.'],
        ['Rake it monthly', 'Rake the gravel back toward the center now and then; chairs push it to the edges.'],
        ['Check burn rules', 'Even a portable ring counts as a recreational fire. Your fire department sets the distance from the house.'],
        ['Smother, then soak', 'Put out fires with water stirred into the ashes, not just poured on top.'],
      ],
    },
    { id: 'classic', name: 'Classic: block pit + paver pad', blurb: 'Stacked retaining-wall blocks with a steel insert and a 12 ft paver circle.', level: 2, time: '1–2 days', cost: '$350–900' },
    {
      id: 'showpiece',
      name: 'Showpiece: seat wall + flagstone + lights',
      blurb: 'A curved built-in stone seat wall with under-cap LEDs, flagstone patio and string lights.',
      level: 3,
      time: '5–8 days',
      cost: '$2,500–6,000',
      model: 'firepitShowpiece',
      summary: 'The backyard centerpiece: a 20 ft flagstone patio, a block fire pit, and a curved stone seat wall at bench height with LED lights tucked under the cap, framed by café string lights.',
      intro: { show: ['base', 'wall1', 'wall2', 'wallCap', 'capLights', 'course1', 'course2', 'course3', 'cap', 'ring', 'innerGravel', 'flagstone', 'posts', 'strings', 'seating', 'deco'], spin: true, preview: true, fx: 'night' },
      safety: [
        'Check setbacks, permits and fire rules first; a project this size may need a permit, and some towns treat seat walls as structures.',
        'Call 811 (free) at least 2–3 business days before digging.',
        'Low-voltage lighting only: plug the transformer into a GFCI outdoor outlet (the kind with Test and Reset buttons) with an in-use cover.',
        'Lift blocks with your legs; cap stones can weigh 50+ lb. Wet-cut stone to keep silica dust down.',
      ],
      tools: ['Excavation: shovels or a rented mini skid steer', 'Plate compactor', 'Crushed gravel base & concrete sand', 'Retaining-wall blocks + caps (pit & wall)', 'Steel fire ring insert', 'Concrete/landscape-block adhesive & caulk gun', '4 ft level, string line & rubber mallet', 'Flagstone (≈ 300 sq ft) & polymeric sand', 'Low-voltage transformer, 12/2 cable & cap lights', '4×4 cedar posts, planters & string lights', 'Wet saw or stone chisel & hammer'],
      steps: [
        {
          t: 'Lay out patio, pit and seat wall',
          d: 'Drive a center stake. With a string compass, paint a 20 ft patio circle (10 ft string), the pit circle at the center, and a seat-wall arc about 8 ft out (to the wall’s front face) covering about 170° on the side you want to face.',
          why: 'Seat-wall distance sets the comfort: about 7–8 ft from the fire’s center keeps knees warm, not hot.',
          tip: 'Lay a garden hose along the arc first and look at it from the house and from where you’ll sit. Adjust the hose, then paint over it.',
          ok: 'Measuring from the center stake gives 10 ft to the patio line and the same distance to the wall line all along the arc.',
          v: { cam: [5.6, 4.6, 6.2], at: [0, 0, -0.4], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [3.1, 0, 0.3], rot: [0, 90, 0], scale: 1.8 } },
        },
        {
          t: 'Excavate the whole area',
          d: 'Remove sod and soil about 7″ deep across the patio, plus a few more inches under the wall’s first course. Slope the bottom ⅛″ per foot away from the house, and compact the soil with the plate compactor.',
          why: 'Flagstone, pit and wall all need the same stable base, so you dig everything at once.',
          tip: 'Stretch strings across the dig at the finished height and measure down from them; it’s the only way to keep a 20 ft dig even.',
          ok: 'Measured from the strings, the depth is even across the area and the soil bottom feels firm underfoot.',
          v: { cam: [5.6, 4.6, 6.2], at: [0, 0, -0.4], hi: ['dig'], show: ['dig'], hide: ['layout'], tool: { id: 'shovel', at: [1.8, 0.02, 1.2], rot: [10, 40, -15], anim: 'push', scale: 1.2 } },
        },
        {
          t: 'Build the base',
          d: 'Spread crushed gravel in 2–3″ layers, dampen each and compact it with the plate compactor until 4″ thick. Screed 1″ of concrete sand only where the flagstone will go; the walls and pit sit right on the gravel.',
          why: 'A compacted base keeps a stone patio flat for decades and gives the walls a solid footing.',
          tip: 'Squeeze a handful of gravel: if it holds its shape like a snowball, it’s at the right moisture to compact.',
          ok: 'Your boot heel leaves no dent in the gravel and the compactor bounces rather than sinking.',
          v: { cam: [5.6, 4.6, 6.2], at: [0, 0, -0.4], hi: ['base'], show: ['base'], hide: ['dig'] },
        },
        {
          t: 'Set the seat wall’s first course',
          d: 'Lay the first course of wall blocks along the arc, partly buried in the base. Level each block side to side and front to back, then check level across neighboring blocks with a 4 ft level. Tap down with a rubber mallet.',
          why: 'Bench height depends on a dead-level first course. Any error here shows up doubled by the cap.',
          tip: 'Set the two end blocks first and run a string between them at the top height. Set every block in between to the string.',
          ok: 'The level reads centered on every block and across the run, and no block rocks when you stand on it.',
          v: { cam: [3.2, 2.0, 1.2], at: [0, 0.1, -2.4], hi: ['wall1'], show: ['wall1'], tool: [{ id: 'level', at: [0.2, 0.235, -2.46], rot: [0, 0, 0], scale: 2 }, { id: 'hammer', at: [-0.6, 0.27, -2.4], rot: [0, 20, 0], anim: 'tap', scale: 1.5 }] },
        },
        {
          t: 'Run the lighting wire',
          d: 'Lay 12/2 low-voltage cable along the back of the first course, from where the transformer will be. At each cap-light spot, leave a 12″ loop sticking up through the gap behind the next course.',
          why: 'Running the wire before the next course hides it completely inside the wall.',
          tip: 'Test the cable with one light before you build over it. A nick in the jacket is easy to fix now and impossible later.',
          ok: 'A loop of cable pokes up at every marked light spot and the far end reaches the transformer location.',
          v: { cam: [3.6, 2.4, 1.0], at: [0, 0.2, -2.0], hi: ['wire'], show: ['wire'], xray: true },
        },
        {
          t: 'Second course and cap',
          d: 'Glue the second course on, staggered half a block. Screw the cap lights to the underside of each cap at the wire loops, connect them, then glue the caps down with an even overhang of about 1″ in front.',
          why: 'At about 18″ tall with a 12–16″ deep cap, the wall becomes a comfortable bench.',
          tip: 'Switch the transformer on and check every light before the adhesive sets, while caps can still be lifted.',
          ok: 'Every light glows, the cap tops are level, and the seat measures about 17–19″ from the patio.',
          v: { cam: [3.2, 2.0, 1.2], at: [0, 0.35, -2.4], hi: ['wall2', 'wallCap', 'capLights'], show: ['wall2', 'wallCap', 'capLights'], fx: 'night', tool: { id: 'caulkGun', at: [0.8, 0.55, -2.3], rot: [0, 0, -70], scale: 1.4 } },
        },
        {
          t: 'Build the fire pit',
          d: 'Lay three staggered courses of fire pit block on the base, leveling the first course carefully. Glue the upper courses and caps, keeping adhesive away from the inside face, then drop in the steel ring and fill its bottom with 3–4″ of gravel.',
          why: 'Same method as the Classic tier; the steel insert protects the blocks from direct flame.',
          tip: 'Leave two small gaps in the bottom course on opposite sides. They feed air to the fire so it burns hotter and less smoky.',
          ok: 'The pit’s top reads level all the way around and the ring sits flat without rocking.',
          v: { cam: [2.2, 1.8, 2.4], at: [0, 0.25, 0], hi: ['course1', 'course2', 'course3', 'cap', 'ring'], show: ['course1', 'course2', 'course3', 'cap', 'ring', 'innerGravel'] },
        },
        {
          t: 'Lay the flagstone',
          d: 'Fit flagstones like a puzzle with ½–1″ joints, starting from the pit outward. Bed each in the sand, wiggle it down, and tap with a rubber mallet until it doesn’t rock and lines up with its neighbors. Sweep in polymeric sand, blow off the surface and mist.',
          why: 'Tight, even joints look intentional; polymeric sand locks the stones and keeps weeds out.',
          tip: 'If a stone rocks, lift it, scoop or add sand under the low corner, and set it again. Trim edges with a wet saw or score and snap with a chisel.',
          ok: 'You can walk across the whole patio without any stone rocking or catching a toe.',
          v: { cam: [5.6, 4.6, 6.2], at: [0, 0, -0.4], hi: ['flagstone'], show: ['flagstone'], hide: ['base'], tool: { id: 'hammer', at: [1.2, 0.1, 1.0], rot: [0, -30, 0], anim: 'tap', scale: 1.5 } },
        },
        {
          t: 'Posts and string lights',
          d: 'Set 4×4 cedar posts in large planters filled with concrete or gravel at the corners. Hang café lights between them on a steel guide wire, with a gentle sag of about 1 ft in the middle.',
          why: 'Planter-mounted posts need no footings, and a guide wire carries the weight so the light cord doesn’t stretch.',
          tip: 'Keep string lights at least 10 ft above and away from the fire pit so sparks and heat don’t reach them.',
          ok: 'The posts stand plumb, the lights hang in smooth even swags, and all bulbs light.',
          v: { cam: [6.4, 4.2, 7.0], at: [0, 1.2, -0.4], hi: ['posts', 'strings'], show: ['posts', 'strings'], fx: 'night' },
        },
        {
          t: 'Cushions, plants and first fire',
          d: 'Add outdoor cushions to the wall and plants around the edge. Wait 24–48 hours for the adhesive to cure, then light a small first fire with a hose or extinguisher nearby.',
          why: 'A small first fire drives moisture out of the blocks slowly so they don’t crack.',
          tip: 'Use cushions with solution-dyed fabric and quick-dry foam; they survive rain and won’t fade in a season.',
          ok: 'The fire draws well with little smoke and the cap lights glow evenly at dusk.',
          v: { cam: [5.2, 3.0, 5.6], at: [0, 0.4, -0.5], hi: ['seating', 'innerGravel'], show: ['seating', 'deco'], fx: 'night' },
        },
      ],
      tricks: [
        ['Order stone by the pallet', 'Flagstone is sold by the ton; one ton covers roughly 80–120 sq ft depending on thickness. Pick through the pallet for the flattest pieces.'],
        ['Seat height is everything', '17–19″ is chair height. Measure a dining chair before you buy blocks.'],
        ['Hide the transformer', 'Mount it behind the seat wall or a shrub on a post. You get power without the box in view.'],
        ['Save big stones for edges', 'Large flagstones stay put better along the outer edge where nothing holds them in.'],
        ['Build it in stages', 'Base and pit one weekend, wall the next, flagstone the third. Nothing is lost waiting between stages.'],
      ],
      learn: {
        how: 'A seat wall is a short wall built to bench height (17–19″) with a cap deep enough to sit on (12–16″). Built in an arc around a fire pit, it puts everyone the same distance from the flame. Because the walls and flagstone sit on one compacted base, the whole patio moves (very little) as one unit.',
        specs: [['Seat height', '17–19″'], ['Cap depth', '12–16″'], ['Wall distance', '7–8 ft from pit center'], ['Patio slope', '⅛″ per ft'], ['Flagstone joints', '½–1″'], ['Gravel base', '4″ compacted']],
        terms: [['Seat wall', 'A low freestanding wall at bench height.'], ['Cap', 'The finishing top layer.'], ['Polymeric sand', 'Joint sand with a binder that hardens.'], ['Flagstone', 'Flat natural stone split into slabs.']],
        mistakes: ['Making the seat wall too tall (it becomes a wall, not a bench).', 'Skipping the wire chase until after capping.', 'Packing flagstone joints with plain sand on a slope.'],
        tips: ['Use warm (2700K) LEDs under the cap; cool white looks clinical at night.'],
      },
    },
    {
      id: 'luxury',
      name: 'Luxury: gas fire table',
      blurb: 'Modern concrete fire table with fire glass, key valve and a buried gas line.',
      level: 3,
      time: '1–2 weeks (incl. permit & gas fitter)',
      cost: '$4,000–10,000',
      model: 'firepitGas',
      summary: 'A linear gas fire table with a concrete surround, sparkling fire glass and instant on/off. You can build the pad and surround; the gas line and connection must be done by a licensed gas fitter.',
      intro: { show: ['pad', 'skin', 'pan', 'glass', 'keyValve', 'gasFlame', 'pavers', 'seating', 'deco'], spin: true, preview: true },
      safety: [
        'Gas lines, connections and pressure tests must be done by a licensed gas fitter with a permit. Do not DIY the gas.',
        'The enclosure needs vents on two opposite sides near the bottom so leaked gas can escape. Never seal it.',
        'Leak-test every joint with soapy water before lighting, and never lean over the burner when lighting.',
        'Use only a burner kit certified for outdoor use (look for a CSA or similar listing) and match it to natural gas or propane.',
      ],
      causes: [['Natural gas or propane?', 'Natural gas needs a line from the house; propane hides a 20 lb tank inside a ventilated enclosure.'], ['Size the burner', '60,000–90,000 BTU suits a 4–6 ft table.'], ['Permits', 'Most cities require a gas permit and inspection.'], ['Wind', 'Plan a glass wind guard if your yard is breezy.']],
      tools: ['Certified burner kit: pan, H-burner, air mixer, key valve (match NG or LP)', 'Concrete blocks or steel frame', 'Cement board & concrete finish (or precast surround)', 'Fire glass (≈ 40–60 lb)', 'Spray bottle of soapy water', 'Licensed gas fitter + permit', 'Forms, gravel & concrete for the pad'],
      steps: [
        {
          t: 'Plan and pull permits',
          d: 'Decide natural gas or propane, then pick a burner kit sized to your table and certified for outdoor use. Call your building department about the gas permit, and book a licensed gas fitter to run and connect the line.',
          why: 'Gas work is code-controlled for good reason: leaks cause fires and explosions.',
          tip: 'Have the fitter check your gas meter and pipe size before you buy. A 90,000 BTU burner may need a bigger line than your house has to spare.',
          ok: 'You have a permit number, a fitter booked, and a burner kit whose label matches your fuel type.',
          v: { cam: [3.8, 2.6, 4.2], at: [0.6, 0.3, 0.6], hi: ['permit'], show: ['permit'] },
        },
        {
          t: 'Trench and run the gas line (fitter)',
          d: 'The fitter digs a trench from the house, at least 12″ deep and often 18″ by local rule, lays approved pipe (often yellow plastic gas pipe with a tracer wire), pressure-tests it, and caps it at the table location.',
          why: 'Burial depth and pipe type are set by code and the gas company so shovels and frost can’t reach the line.',
          tip: 'Lay warning tape a few inches above the pipe before backfilling, and photograph the trench with a tape measure in it for your records.',
          ok: 'The pressure test gauge holds steady for the test period and the inspector signs off before the trench is filled.',
          v: { cam: [4.6, 3.6, 2.0], at: [1.0, 0, -1.8], hi: ['trench', 'gasLine'], show: ['trench', 'gasLine'] },
        },
        {
          t: 'Pour the footing pad',
          d: 'Dig out 8″, compact 4″ of gravel, and form a 4″ concrete pad about 4″ larger than the table on every side, with the gas stub coming up inside the frame’s footprint. Keep it damp for a few days as it cures.',
          why: 'A solid pad keeps the heavy concrete surround from cracking or settling.',
          tip: 'Wrap the gas stub in a foam sleeve where it passes through the pad so the concrete can’t grip and stress the pipe.',
          ok: 'The pad is flat and level within ⅛″ across, and the stub sits where the burner will be.',
          v: { cam: [3.2, 2.2, 3.4], at: [0, 0.1, 0], hi: ['pad'], show: ['pad'], hide: ['trench'] },
        },
        {
          t: 'Build the frame with vents',
          d: 'Build the block or steel-stud frame to the burner maker’s dimensions. Leave vent openings on opposite sides near the bottom, sized as the burner manual says, and an access door for the valve.',
          why: 'Natural gas rises and propane sinks and pools; two-sided low vents let a cross-breeze clear both.',
          tip: 'Use steel studs, never wood, for the frame. Wood near a gas burner can char slowly over years.',
          ok: 'You can see daylight straight through the vent openings on opposite sides.',
          v: { cam: [3.0, 2.0, 3.2], at: [0, 0.3, 0], hi: ['frame'], show: ['frame'] },
        },
        {
          t: 'Finish the surround',
          d: 'Screw cement board to the frame, tape the seams with alkali-resistant mesh, and trowel on a concrete finish (or set a precast surround). Leave the burner opening exactly to the pan’s cut-out size.',
          why: 'Everything near the flame must be noncombustible.',
          tip: 'Trowel the finish in two thin coats; the first fills, the second smooths. Mist it so it cures instead of drying out and cracking.',
          ok: 'The surface feels hard and even, and the burner pan drops into the opening with its lip resting flat.',
          v: { cam: [3.4, 2.2, 3.6], at: [0, 0.3, 0], hi: ['skin'], show: ['skin'], hide: ['frame'] },
        },
        {
          t: 'Install burner and key valve',
          d: 'Set the burner pan in the opening. The fitter connects the flex line, air mixer and key valve, then brushes soapy water on every joint with the gas on.',
          why: 'Soapy water shows a leak as growing bubbles. Any bubble means stop and fix.',
          tip: 'Make sure the burner sits level; a tilted burner burns unevenly with tall flames at one end.',
          ok: 'No bubbles grow at any joint after a full minute of watching.',
          v: { cam: [2.2, 1.4, 2.2], at: [0.7, 0.3, 0.4], hi: ['pan', 'keyValve', 'soap'], show: ['pan', 'keyValve', 'soap'] },
        },
        {
          t: 'Add fire glass',
          d: 'Pour tempered fire glass over the burner in a loose layer about 1–2″ deep, just covering the burner holes. Don’t pack it down.',
          why: 'Too deep chokes the flame and makes soot; too shallow exposes the burner.',
          tip: 'Rinse the glass in a bucket first to remove dust that would otherwise smoke on the first burn.',
          ok: 'The burner ports are just hidden and the glass looks even, with no burner metal showing.',
          v: { cam: [1.8, 1.6, 1.8], at: [0, 0.55, 0], hi: ['glass'], show: ['glass'], hide: ['soap'] },
        },
        {
          t: 'Light, finish the patio',
          d: 'Stand back, open the key valve slowly and light as the burner instructions say, often with a long lighter held at the burner before the gas reaches it. Then lay the pavers around the table and set lounge seating.',
          why: 'Lighting with the flame ready means gas never builds up before it ignites.',
          tip: 'If the flame lifts or is very yellow and sooty, the air mixer needs adjusting; have the fitter tune it.',
          ok: 'Flames come up evenly along the burner within a second or two, mostly yellow-orange and steady.',
          v: { cam: [3.8, 2.6, 4.2], at: [0, 0.35, 0], hi: ['gasFlame', 'keyValve'], show: ['gasFlame', 'pavers', 'seating', 'deco'] },
        },
      ],
      tricks: [
        ['Get a match-lit kit or electronic ignition', 'Electronic ignition costs more but lets you light from a button without reaching over the burner.'],
        ['Add a wind guard', 'A tempered-glass wind guard keeps flames lit and even on breezy nights.'],
        ['Cover it', 'A fitted cover keeps rain and leaves out of the burner pan and spiders out of the air mixer.'],
        ['Budget for the fitter', 'The gas line often costs as much as the table. Get the quote first.'],
        ['Check BTU, not just size', 'A small burner in a big table looks weak; follow the maker’s BTU for the pan size.'],
      ],
      learn: {
        how: 'A gas fire table mixes fuel with air at the burner and burns it in a controlled ring under decorative media. A key valve meters the gas. No wood means no sparks or smoke, which is why gas tables are allowed in more places than wood fires, though they still need clearances and venting.',
        specs: [['Burner size', '60–90k BTU'], ['Fire glass depth', '≈ 1–2″'], ['Gas line burial', '≥ 12″ (often 18″; check code)'], ['Vents', '2, opposite sides, low'], ['Pad', '4″ concrete on 4″ gravel']],
        terms: [['Key valve', 'Gas valve opened with a removable key.'], ['Air mixer', 'Pre-mixes air with gas for a cleaner flame.'], ['Fire glass', 'Tempered glass media over the burner.'], ['Tracer wire', 'Wire buried with plastic gas pipe so it can be located later.']],
        mistakes: ['DIY gas connections.', 'Sealed enclosures with no vents.', 'Burying the burner too deep in glass.', 'Wood framing inside the table.'],
        tips: ['Add a wind guard; even a light breeze blows gas flames around.'],
      },
      pro: 'Always for the gas line and connection (licensed gas fitter). Also if your area requires an engineered or inspected installation.',
    },
  ];
  // Classic is the default base guide; keep it second in the list but selected first time.
  fp.defaultVariant = 'classic';

})();
