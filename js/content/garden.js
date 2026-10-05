/* GDB · Garden Builds: compost bins, rain barrels, cold frame, drip irrigation, cattle-panel tunnel,
   potting bench and a deer/critter fence. Real-meter scenes (unit: 1), build-up walkthroughs with add-ons.
   (Growing how-tos live in grow.js; the raised bed and standing planter live in the backyard category.) */
(function () {
  const AO = TB.AO;
  const G = (o) =>
    Object.assign(
      { unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 10, radius: 10 }, tex: ['wood_planks', 'forrest_ground_01', 'gravel_floor', 'pine_bark'] },
      o
    );
  const cedarOf = (K, r) => K.pbr('wood_planks', r || [0.4, 1.2], { color: 0xd8a27a }, 'wood');
  const ptOf = (K) => K.pbr('wood_planks', [0.4, 1.2], { color: 0xb3a27a }, 'woodLight');
  const soilOf = (K, r) => K.pbr('forrest_ground_01', r || [1, 1], { color: 0x8a6a4a }, 'dirt');
  const glow = (K, c, i) => K.std(c || 0xfff1cc, { emissive: c || 0xffc870, emissiveIntensity: i == null ? 1 : i });
  const blackMetal = (K) => K.std(0x1d1f22, { metalness: 0.6, roughness: 0.45 });
  const galv = (K) => K.std(0xaeb5ba, { metalness: 0.85, roughness: 0.38 });
  const leafMat = (K, c) => K.std(c || 0x4f8a3a, { roughness: 0.9 });
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
  // Wire mesh / screen / netting as a textured plane (grid lines on a transparent background).
  const gridTex = (K, color, lineFrac) => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 64, 64);
    g.fillStyle = color;
    const L = Math.max(3, Math.round(64 * lineFrac));
    g.fillRect(0, 0, 64, L);
    g.fillRect(0, 0, L, 64);
    const t = new K.THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = K.THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  };
  const meshPanel = (K, parent, w, h, cellW, cellH, color, lineFrac, pos, rot, o) => {
    const tex = gridTex(K, color || '#b9c0c4', lineFrac || 0.12);
    tex.repeat.set(w / cellW, h / cellH);
    const mat = K.std(0xffffff, Object.assign({ map: tex, transparent: true, alphaTest: 0.03, side: K.THREE.DoubleSide, roughness: 0.5, metalness: 0.4 }, o || {}));
    const me = new K.THREE.Mesh(new K.THREE.PlaneGeometry(w, h), mat);
    K.group(parent, pos, rot).add(me);
    return me;
  };
  // Curved panel (part of a cylinder wall), axis along Y.
  const arcPanel = (K, parent, r, h, a0, a1, mat, pos, rot) => {
    const me = new K.THREE.Mesh(new K.THREE.CylinderGeometry(r, r, h, 24, 1, true, a0 * K.DEG, (a1 - a0) * K.DEG), typeof mat === 'string' ? K.m[mat] : mat);
    me.material = me.material.clone();
    me.material.side = K.THREE.DoubleSide;
    K.group(parent, pos, rot).add(me);
    return me;
  };
  const cmuBlock = (K, parent, pos, rotY, mat) => {
    // 8×8×16 hollow concrete block (two cores), long axis along local x.
    const g = K.group(parent, pos, [0, rotY || 0, 0]);
    const rect = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    K.ext(g, rect(-0.2, 0.2, -0.1, 0.1), 0.19, mat, [0, 0.19, 0], [90, 0, 0], 0.004, [rect(-0.17, -0.025, -0.07, 0.07).reverse(), rect(0.025, 0.17, -0.07, 0.07).reverse()]);
    return g;
  };
  const caddy = (K, name, pos, label) => {
    const g = K.part(name, pos, null, label || 'Kitchen scrap caddy');
    K.lathe(g, [[0, 0], [0.11, 0], [0.12, 0.2], [0.125, 0.22], [0, 0.22]], K.std(0x5c8a3a, { roughness: 0.5 }));
    K.cyl(g, [0.128, 0.128, 0.025, 28], K.std(0x4a7430, { roughness: 0.5 }), [0, 0.232, 0]);
    K.tor(g, [0.09, 0.006, 180], 'steel', [0, 0.25, 0], [0, 0, 0]);
    return g;
  };
  const thermometer = (K, name, pos, tilt, label) => {
    const g = K.part(name, pos, null, label || 'Long-stem compost thermometer');
    const t = K.group(g, [0, 0, 0], [tilt || 0, 0, 0]);
    K.cyl(t, [0.004, 0.004, 0.5, 8], 'steel', [0, -0.25, 0]);
    K.cyl(t, [0.04, 0.04, 0.025, 28], 'steel', [0, 0.01, 0], [90, 0, 0]);
    K.cyl(t, [0.034, 0.034, 0.003, 28], K.std(0xf4f1e8, { roughness: 0.4 }), [0, 0.01, 0.013], [90, 0, 0]);
    K.box(t, [0.003, 0.028, 0.002], 'red', [0.006, 0.016, 0.016], [0, 0, -30], 0);
    return g;
  };

  /* ===================== 1 · Three-bin cedar compost system ===================== */
  const CB_AO = ['aoLids', 'aoThermo', 'aoRack', 'aoSifter', 'aoCaddy'];
  TB.model(
    'compostBins',
    G({ cam: [2.7, 2.1, 3.5], at: [0, 0.45, 0], hidden: ['site', 'layout', 'floor', 'postsBack', 'back', 'postsFront', 'ends', 'dividers', 'guides', 'fronts', 'compost'].concat(CB_AO) }),
    (K) => {
      const X = [-1.41, -0.47, 0.47, 1.41];
      const H = 0.95;
      const ZB = -0.43, ZF = 0.43;
      const cedar = cedarOf(K);
      const site = K.part('site', [0, 0.008, 0], null, 'Level, well-drained spot, sod removed');
      K.box(site, [3.4, 0.016, 1.45], soilOf(K, [3, 1.3]), [0, 0, 0], null, 0.004);
      stakesAndLines(K, 'layout', 'Layout: 9½ × 3 ft, diagonals equal', [[-1.47, -0.49], [1.47, -0.49], [1.47, 0.49], [-1.47, 0.49]], 0.3);
      const floor = K.part('floor', [0, 0.02, 0], null, '½″ hardware-cloth floor (rodent barrier)');
      meshPanel(K, floor, 3.0, 1.0, 0.022, 0.022, '#a9b0b4', 0.14, [0, 0, 0], [-90, 0, 0]);
      const rows = [0, 1, 2, 3, 4, 5].map((i) => 0.09 + i * 0.155);
      const pb = K.part('postsBack', [0, 0, 0], null, '4×4 cedar posts (back)');
      X.forEach((x) => K.box(pb, [0.089, H, 0.089], cedar, [x, H / 2, ZB], null, 0.004));
      const back = K.part('back', [0, 0, 0], null, '1×6 back slats, 1″ air gaps');
      rows.forEach((y) => K.box(back, [2.93, 0.14, 0.019], cedar, [0, y, ZB - 0.054], null, 0.003));
      const pf = K.part('postsFront', [0, 0, 0], null, '4×4 cedar posts (front)');
      X.forEach((x) => K.box(pf, [0.089, H, 0.089], cedar, [x, H / 2, ZF], null, 0.004));
      const ends = K.part('ends', [0, 0, 0], null, 'End walls (1×6 slats)');
      [-1, 1].forEach((s) => rows.forEach((y) => K.box(ends, [0.019, 0.14, 0.98], cedar, [s * 1.4645, y, 0], null, 0.003)));
      const div = K.part('dividers', [0, 0, 0], null, 'Divider walls between bins');
      [X[1], X[2]].forEach((x) => rows.forEach((y) => K.box(div, [0.019, 0.14, 0.77], cedar, [x, y, 0], null, 0.003)));
      const gd = K.part('guides', [0, 0, 0], null, '2×2 slat guides (channel for front boards)');
      X.forEach((x, i) => {
        if (i > 0) K.box(gd, [0.038, H - 0.02, 0.038], cedar, [x - 0.045 - 0.019, (H - 0.02) / 2, ZF - 0.062], null, 0.003);
        if (i < 3) K.box(gd, [0.038, H - 0.02, 0.038], cedar, [x + 0.045 + 0.019, (H - 0.02) / 2, ZF - 0.062], null, 0.003);
      });
      const fr = K.part('fronts', [0, 0, 0], null, 'Removable 1×6 front boards');
      [0, 1, 2].forEach((b) => {
        const n = b === 2 ? 3 : 6;
        for (let i = 0; i < n; i++) K.box(fr, [0.93, 0.14, 0.019], cedar, [(X[b] + X[b + 1]) / 2, rows[i], ZF - 0.0905], null, 0.003);
      });
      const comp = K.part('compost', [0, 0, 0], null, 'Active, cooking and finished compost');
      const heap = (x, col, h) => K.sph(comp, 0.42, K.std(col, { roughness: 1 }), [x, 0.08, -0.02], [1.02, h, 0.95]);
      heap(-0.94, 0x5c4a30, 1.55);
      heap(0, 0x4a3826, 1.25);
      heap(0.94, 0x2f241a, 0.75);
      const straw = K.std(0xd6b866, { roughness: 1 });
      const greens = K.std(0x6f9a3a, { roughness: 0.9 });
      K.rep(26, (i) => {
        const a = i * 2.4;
        const r = 0.08 + (i % 7) * 0.035;
        const x = -0.94 + Math.cos(a) * r;
        const z = -0.02 + Math.sin(a) * r * 0.9;
        const y = 0.08 + 0.42 * 1.55 * Math.sqrt(Math.max(0, 1 - (r / 0.43) ** 2)) - 0.01;
        if (i % 2) K.box(comp, [0.12, 0.006, 0.01], straw, [x, y, z], [0, a * 40, 8], 0);
        else K.sph(comp, 0.022, i % 4 ? greens : K.std(0xc0682a, { roughness: 0.8 }), [x, y, z], [1.4, 0.5, 1]);
      });
      const steam = K.group(null, [0, 0, 0]);
      const puffs = [];
      K.rep(6, (i) => {
        const s = K.sph(steam, 0.08, K.std(0xffffff, { transparent: true, opacity: 0.25, depthWrite: false }), [(i % 3 - 1) * 0.12, 0.6, ((i * 7) % 3 - 1) * 0.1]);
        s.userData.noPick = true;
        puffs.push(s);
      });
      steam.visible = false;

      /* add-ons */
      const lids = K.part('aoLids', [0, 0, 0], null, 'Hinged lids (cedar frame + clear panel)');
      const pan = K.std(0xdfe8e4, { transparent: true, opacity: 0.55, roughness: 0.2 });
      [0, 1, 2].forEach((b) => {
        const g = K.group(lids, [(X[b] + X[b + 1]) / 2, H + 0.012, ZB - 0.05], [-4, 0, 0]);
        K.box(g, [0.92, 0.038, 0.038], cedar, [0, 0, 0.02], null, 0.003);
        K.box(g, [0.92, 0.038, 0.038], cedar, [0, 0, 0.98], null, 0.003);
        [-1, 1].forEach((s) => K.box(g, [0.038, 0.038, 0.96], cedar, [s * 0.44, 0, 0.5], null, 0.003));
        K.box(g, [0.9, 0.006, 0.98], pan, [0, 0.022, 0.5], null, 0);
        [-0.3, 0.3].forEach((x) => K.box(g, [0.06, 0.004, 0.08], blackMetal(K), [x, 0.0, -0.02], null, 0));
      });
      const th = thermometer(K, 'aoThermo', [0.05, 0.62, 0.1], 18);
      th.rotation.y = 0.4;
      const rack = K.part('aoRack', [1.49, 0, 0], null, 'Tool rack: fork + compost aerator');
      [0.45, 0.85].forEach((y) => K.box(rack, [0.05, 0.05, 0.5], cedar, [0.03, y, -0.05], null, 0.004));
      const fork = K.group(rack, [0.07, 0.15, -0.2]);
      K.cyl(fork, [0.016, 0.016, 1.15, 12], 'hickory', [0, 0.8, 0]);
      K.box(fork, [0.02, 0.05, 0.2], 'toolSteel', [0, 0.2, 0], null, 0.004);
      K.rep(4, (i) => K.cyl(fork, [0.005, 0.003, 0.28, 8], 'toolSteel', [0, 0.04, -0.075 + i * 0.05]));
      const aer = K.group(rack, [0.07, 0.1, 0.12]);
      K.cyl(aer, [0.012, 0.012, 0.95, 10], 'steel', [0, 0.5, 0]);
      K.cyl(aer, [0.012, 0.012, 0.3, 10], blackMetal(K), [0, 0.98, 0], [90, 0, 0]);
      [-1, 1].forEach((s) => K.box(aer, [0.006, 0.05, 0.06], 'steel', [0, 0.05, s * 0.03], [0, 0, 0], 0));
      const sift = K.part('aoSifter', [0.94, H + 0.03, 0.0], null, '½″ screen sifter over the finished bin');
      [-1, 1].forEach((s) => K.box(sift, [0.04, 0.06, 0.95], cedar, [s * 0.4, 0, 0], null, 0.003));
      [-1, 1].forEach((s) => K.box(sift, [0.84, 0.06, 0.04], cedar, [0, 0, s * 0.455], null, 0.003));
      meshPanel(K, sift, 0.8, 0.9, 0.022, 0.022, '#8f969a', 0.14, [0, -0.02, 0], [-90, 0, 0]);
      K.sph(sift, 0.16, K.std(0x2f241a, { roughness: 1 }), [0.05, -0.02, 0.05], [1.3, 0.35, 1.2]);
      caddy(K, 'aoCaddy', [-1.0, 0, 0.85]);
      return {
        tick(t, fx) {
          steam.visible = fx === 'hot';
          if (!steam.visible) return;
          puffs.forEach((p, i) => {
            const k = (t * 0.25 + i / 6) % 1;
            p.position.y = 0.55 + k * 0.6;
            p.scale.setScalar(0.6 + k * 1.2);
            p.material.opacity = 0.3 * (1 - k);
          });
        },
      };
    }
  );

  /* ===================== 1b · Barrel compost tumbler ===================== */
  TB.model(
    'compostTumbler',
    G({ cam: [1.8, 1.4, 2.2], at: [0, 0.6, 0], hidden: ['drum', 'holes', 'hatchCut', 'hatch', 'legs', 'rails', 'axle', 'contents', 'aoTray', 'aoHandles', 'aoCaddy', 'aoThermo'] }),
    (K) => {
      const R = 0.29, Ld = 0.86, Y = 0.82;
      const pt = ptOf(K);
      const rot = K.group(null, [0, Y, 0]);
      const blue = K.std(0x2d5a96, { roughness: 0.55 });
      const drum = K.part('drum', [0, 0, 0], rot, '55-gal food-grade drum (on its side)');
      K.cyl(drum, [R, R, Ld, 40], blue, [0, 0, 0], [0, 0, 90]);
      [-0.3, -0.1, 0.1, 0.3].forEach((x) => K.tor(drum, [R + 0.002, 0.012], blue, [x, 0, 0], [0, 90, 0]));
      [-1, 1].forEach((s) => K.cyl(drum, [R - 0.03, R - 0.03, 0.012, 40], K.std(0x284f86, { roughness: 0.55 }), [s * (Ld / 2 + 0.002), 0, 0], [0, 0, 90]));
      const holes = K.part('holes', [0, 0, 0], rot, '½″ aeration holes (rings every 6″)');
      [-0.36, -0.22, 0.0, 0.22, 0.36].forEach((x, j) =>
        K.rep(12, (i) => {
          const a = (i / 12) * Math.PI * 2 + j * 0.25;
          if (Math.abs(Math.sin(a) - 0.75) < 0.3 && Math.cos(a) > 0 && Math.abs(x) < 0.3) return;
          K.sph(holes, 0.008, 'black', [x, Math.sin(a) * (R + 0.001), Math.cos(a) * (R + 0.001)], [1, 1, 1]);
        })
      );
      const cut = K.part('hatchCut', [0, 0, 0], rot, 'Hatch outline (12×14″)');
      const hp = (x, a) => [x, Math.sin(a) * (R + 0.004), Math.cos(a) * (R + 0.004)];
      const A0 = 0.25, A1 = 1.25;
      const outline = [];
      for (let k = 0; k <= 8; k++) outline.push(hp(-0.18, A0 + ((A1 - A0) * k) / 8));
      for (let k = 0; k <= 8; k++) outline.push(hp(0.18, A1 - ((A1 - A0) * k) / 8));
      K.tube(cut, outline, 0.003, 'yellow', true);
      const hatch = K.part('hatch', [0, 0, 0], rot, 'Hatch door, hinges + latch');
      arcPanel(K, hatch, R + 0.006, 0.38, 90 - (A1 * 180) / Math.PI - 2, 90 - (A0 * 180) / Math.PI + 2, K.std(0x244a7d, { roughness: 0.55 }), [0, 0, 0], [0, 0, 90]);
      [-0.11, 0.11].forEach((x) => K.box(hatch, [0.05, 0.012, 0.035], galv(K), hp(x, A0 - 0.03), [-(A0 * 180) / Math.PI + 90 - 90, 0, 0], 0.002));
      const latch = K.group(hatch, hp(0, A1 + 0.04), [90 - (A1 * 180) / Math.PI - 90 + 90, 0, 0]);
      K.box(latch, [0.07, 0.012, 0.03], galv(K), [0, 0, 0], null, 0.002);
      K.tor(hatch, [0.015, 0.003], galv(K), hp(0, A1 + 0.1), [0, 90, 0]);
      const legs = K.part('legs', [0, 0, 0], null, '2×4 A-frame legs');
      [-1, 1].forEach((s) => [-1, 1].forEach((f) => K.bar(legs, [s * 0.5, Y + 0.08, 0], [s * 0.5, 0, f * 0.46], 0.035, pt)));
      [-1, 1].forEach((s) => K.box(legs, [0.09, 0.09, 0.2], pt, [s * 0.5, Y + 0.07, 0], null, 0.004));
      const rails = K.part('rails', [0, 0, 0], null, 'Cross rails + bottom spreaders');
      [-1, 1].forEach((f) => K.box(rails, [1.12, 0.089, 0.038], pt, [0, 0.28, f * 0.3], null, 0.003));
      [-1, 1].forEach((s) => K.box(rails, [0.038, 0.089, 0.82], pt, [s * 0.53, 0.28, 0], null, 0.003));
      const axle = K.part('axle', [0, 0, 0], rot, '1″ steel pipe axle + flanges');
      K.cyl(axle, [0.017, 0.017, 1.3, 16], galv(K), [0, 0, 0], [0, 0, 90]);
      [-1, 1].forEach((s) => K.cyl(axle, [0.05, 0.05, 0.012, 24], galv(K), [s * (Ld / 2 + 0.01), 0, 0], [0, 0, 90]));
      [-1, 1].forEach((s) => K.cyl(axle, [0.03, 0.03, 0.02, 16], 'black', [s * 0.62, 0, 0], [0, 0, 90]));
      const cont = K.part('contents', [0, 0, 0], rot, 'Greens + browns, half full');
      K.cyl(cont, [R - 0.03, R - 0.03, Ld - 0.04, 24], K.std(0x4a3826, { roughness: 1 }), [0, -0.1, 0], [0, 0, 90]).scale.set(1, 1, 0.55);
      const tray = K.part('aoTray', [0, 0.01, 0], null, 'Catch tray / tote under the drum');
      K.box(tray, [0.75, 0.15, 0.5], K.std(0x2b2d30, { roughness: 0.6 }), [0, 0.075, 0], null, 0.02);
      K.sph(tray, 0.2, K.std(0x2f241a, { roughness: 1 }), [0, 0.12, 0], [1.6, 0.3, 1]);
      const hd = K.part('aoHandles', [0, 0, 0], rot, 'Grab handles for turning');
      [0, 120, 240].forEach((a) => {
        const g = K.group(hd, [0.44, 0, 0], [a, 0, 0]);
        K.box(g, [0.03, 0.03, 0.22], K.std(0x1f2124, { roughness: 0.5 }), [0.015, R - 0.04, 0], null, 0.008);
      });
      caddy(K, 'aoCaddy', [0.75, 0, 0.45]);
      thermometer(K, 'aoThermo', [0.15, Y + R + 0.03, 0.05], 0, 'Compost thermometer through a vent hole');
      return {
        tick(t, fx) {
          rot.rotation.x = fx === 'spin' ? -t * 1.4 : 0;
        },
      };
    }
  );

  /* ===================== 2 · Linked rain barrels ===================== */
  const RB_AO = ['aoSoaker', 'aoPump', 'aoGauge', 'aoGuard', 'aoPlants'];
  TB.model(
    'rainBarrels',
    G({ cam: [2.4, 1.9, 3.4], at: [0.55, 0.9, 0], tex: ['wood_planks', 'gravel_floor', 'forrest_ground_01', 'pine_bark', 'brushed_concrete'], assets: ['shrub_01', 'potted_plant_01', 'grass_medium_01'], hidden: ['marks', 'pad', 'stand', 'stand2', 'barrel1', 'barrel2', 'spigot1', 'spigot2', 'screen', 'diverter', 'link', 'overflow', 'overflow1'].concat(RB_AO) }),
    (K) => {
      const B1 = 0.42, B2 = 1.12, R = 0.29, H = 0.88, S = 0.4;
      const DX = -0.12, DZ = -0.29;
      /* house wall */
      const siding = K.std(0xd9d4c7, { roughness: 0.8 });
      K.box(null, [4.2, 3.0, 0.16], siding, [0.5, 1.5, -0.44], null, 0.004);
      for (let i = 0; i < 16; i++) K.box(null, [4.2, 0.012, 0.012], K.std(0xc4bfb2, { roughness: 0.8 }), [0.5, 0.42 + i * 0.16, -0.355], null, 0);
      K.box(null, [4.2, 0.36, 0.2], K.pbr('brushed_concrete', [3, 0.3], {}, 'concrete'), [0.5, 0.18, -0.42], null, 0.004);
      const gut = K.std(0xf1efe9, { roughness: 0.5 });
      K.box(null, [4.2, 0.12, 0.13], gut, [0.5, 2.82, -0.29], null, 0.01);
      K.box(null, [4.2, 0.06, 0.12], K.std(0x2e2a26, { roughness: 1 }), [0.5, 2.86, -0.29], null, 0);
      const ds = (y0, y1) => K.box(null, [0.075, y1 - y0, 0.055], gut, [DX, (y0 + y1) / 2, DZ], null, 0.006);
      ds(1.58, 2.78);
      ds(0.3, 1.28);
      K.box(null, [0.075, 0.12, 0.3], gut, [DX, 0.26, DZ + 0.15], [20, 0, 0], 0.006);
      [0.6, 1.9, 2.5].forEach((y) => K.box(null, [0.1, 0.02, 0.02], gut, [DX, y, DZ - 0.04], null, 0));
      const dsCut = K.part('dsCut', [0, 0, 0], null, 'Downspout section to cut out');
      K.box(dsCut, [0.075, 0.3, 0.055], gut, [DX, 1.43, DZ], null, 0.006);
      const marks = K.part('marks', [0, 0, 0], null, 'Cut marks (diverter height)');
      [1.28, 1.58].forEach((y) => K.box(marks, [0.085, 0.008, 0.065], 'red', [DX, y, DZ], null, 0));
      /* pad + stands */
      const pad = K.part('pad', [0, 0.02, 0], null, 'Leveled pad: 3″ compacted gravel');
      K.box(pad, [1.75, 0.04, 0.85], K.pbr('gravel_floor', [2, 1], {}, 'stone'), [0.77, 0, 0.02], null, 0.004);
      const blockMat = K.std(0x9d9c97, { roughness: 1 });
      const stand = (name, x, label) => {
        const g = K.part(name, [0, 0.04, 0], null, label);
        [-0.2, 0, 0.2].forEach((dx) => cmuBlock(K, g, [x + dx, 0, 0.02], 90, blockMat));
        [-0.2, 0, 0.2].forEach((dx) => cmuBlock(K, g, [x + dx, 0.19, 0.02], 90, blockMat));
        K.box(g, [0.6, 0.03, 0.6], K.std(0x8f8d86, { roughness: 1 }), [x, 0.395, 0.02], null, 0.004);
        return g;
      };
      stand('stand', B1, 'Block stand, 16″ high (two courses + paver cap)');
      stand('stand2', B2, 'Second block stand');
      /* barrels */
      const prof = [[0, 0], [0.25, 0], [0.28, 0.02], [0.29, 0.05], [0.29, 0.27], [0.296, 0.29], [0.29, 0.31], [0.29, 0.57], [0.296, 0.59], [0.29, 0.61], [0.29, 0.84], [0.28, 0.87], [0.26, 0.88], [0, 0.88]];
      const drumMat = K.std(0x2f4a33, { roughness: 0.55 });
      const barrel = (name, x, label) => {
        const g = K.part(name, [x, S + 0.055, 0.02], null, label);
        K.lathe(g, prof, drumMat);
        K.cyl(g, [0.035, 0.035, 0.02, 16], K.std(0x263c2a, { roughness: 0.5 }), [0.16, H + 0.008, -0.08]);
        return g;
      };
      barrel('barrel1', B1, '55-gal barrel #1 (inlet)');
      barrel('barrel2', B2, '55-gal barrel #2 (linked)');
      const spig = (name, x, label) => {
        const g = K.part(name, [x, S + 0.055 + 0.1, 0.02 + R], null, label);
        K.nut(g, 0.05, 0.012, 'brass', [0, 0, 0.004], [90, 0, 0]);
        K.cyl(g, [0.012, 0.012, 0.07, 12], 'brass', [0, 0, 0.035], [90, 0, 0]);
        K.cyl(g, [0.016, 0.016, 0.03, 12], 'brass', [0, 0, 0.07], [0, 0, 0]);
        K.cyl(g, [0.011, 0.012, 0.05, 12], 'brass', [0, -0.035, 0.07]);
        K.cyl(g, [0.004, 0.004, 0.04, 8], 'brass', [0, 0.03, 0.07]);
        K.box(g, [0.05, 0.008, 0.012], 'red', [0, 0.05, 0.07], null, 0.002);
        return g;
      };
      spig('spigot1', B1, '¾″ brass spigot + bulkhead fitting');
      spig('spigot2', B2, 'Spigot on barrel #2');
      const scr = K.part('screen', [B1, S + 0.055 + H + 0.002, 0.02], null, 'Mosquito-screen inlet basket');
      K.cyl(scr, [0.12, 0.1, 0.06, 28, true], K.std(0x222428, { roughness: 0.6, side: K.THREE.DoubleSide }), [-0.06, -0.025, 0.04]);
      meshPanel(K, scr, 0.22, 0.22, 0.01, 0.01, '#202224', 0.25, [-0.06, 0.004, 0.04], [-90, 0, 0], { metalness: 0 });
      const div = K.part('diverter', [0, 0, 0], null, 'Downspout diverter + fill hose');
      K.box(div, [0.1, 0.34, 0.08], K.std(0x3b3f44, { roughness: 0.5 }), [DX, 1.43, DZ], null, 0.012);
      K.cyl(div, [0.025, 0.025, 0.06, 16], K.std(0x3b3f44, { roughness: 0.5 }), [DX + 0.075, 1.4, DZ], [0, 0, 90]);
      K.tube(div, [[DX + 0.1, 1.4, DZ], [0.08, 1.42, DZ + 0.02], [0.25, 1.4, 0.02], [B1 - 0.06, 1.34, 0.06], [B1 - 0.06, 1.3, 0.06]], 0.02, K.std(0x1e1f21, { roughness: 0.7 }));
      const link = K.part('link', [0, S + 0.055 + 0.16, 0.02], null, 'Linking hose (bottom ports, fill together)');
      K.cyl(link, [0.03, 0.03, 0.025, 16], 'black', [B1 + R + 0.005, 0, 0], [0, 0, 90]);
      K.cyl(link, [0.03, 0.03, 0.025, 16], 'black', [B2 - R - 0.005, 0, 0], [0, 0, 90]);
      K.tube(link, [[B1 + R + 0.01, 0, 0], [(B1 + B2) / 2, -0.05, 0.1], [B2 - R - 0.01, 0, 0]], 0.016, K.std(0x1e1f21, { roughness: 0.7 }));
      const ovf = (name, x, label) => {
        const g = K.part(name, [0, 0, 0], null, label);
        const y = S + 0.055 + H - 0.1;
        K.cyl(g, [0.035, 0.035, 0.03, 16], 'black', [x + R + 0.01, y, 0.02], [0, 0, 90]);
        const hose = K.std(0x1e1f21, { roughness: 0.8 });
        K.tube(g, [[x + R + 0.02, y, 0.02], [x + R + 0.12, y - 0.1, 0.05], [x + R + 0.16, 0.4, 0.15], [x + R + 0.22, 0.06, 0.35], [x + R + 0.5, 0.04, 0.7]], 0.026, hose);
        K.ext(K.group(g, [x + R + 0.62, 0.0, 0.82], [0, -40, 0]), [[-0.15, -0.3], [0.15, -0.3], [0.18, 0.3], [-0.18, 0.3]], 0.04, K.std(0x9b9a94, { roughness: 1 }), [0, 0, 0], [90, 0, 0], 0.004);
        return g;
      };
      ovf('overflow', B2, '1½″ overflow to a splash block');
      ovf('overflow1', B1, '1½″ overflow to a splash block');
      /* add-ons */
      const soak = K.part('aoSoaker', [0, 0, 0], null, 'Soaker hose to a nearby bed');
      const bedG = K.group(soak, [2.35, 0, 0.6]);
      [-1, 1].forEach((s) => K.box(bedG, [1.25, 0.18, 0.04], cedarOf(K), [0, 0.09, s * 0.32], null, 0.004));
      [-1, 1].forEach((s) => K.box(bedG, [0.04, 0.18, 0.64], cedarOf(K), [s * 0.625, 0.09, 0], null, 0.004));
      K.box(bedG, [1.21, 0.02, 0.6], soilOf(K), [0, 0.15, 0], null, 0);
      K.tube(soak, [[B2, S + 0.12, 0.42], [B2 + 0.05, 0.3, 0.5], [B2 + 0.25, 0.02, 0.62], [1.73, 0.18, 0.62], [1.85, 0.17, 0.75], [2.85, 0.17, 0.75], [2.85, 0.17, 0.6], [1.9, 0.17, 0.58], [1.9, 0.17, 0.45], [2.85, 0.17, 0.45]], 0.011, K.std(0x3a2c24, { roughness: 1 }));
      [-0.4, 0, 0.4].forEach((x) => K.glb(soak, 'grass_medium_01', { node: 'grass_medium_01_mid_a_LOD0', height: 0.2 }, [2.35 + x, 0.16, 0.6]) || K.sph(soak, 0.08, leafMat(K), [2.35 + x, 0.22, 0.6]));
      const pump = K.part('aoPump', [0, 0, 0], null, 'Solar barrel pump');
      K.box(pump, [0.3, 0.012, 0.2], K.std(0x1d2a44, { metalness: 0.3, roughness: 0.2 }), [B2 + 0.05, S + 0.055 + H + 0.12, -0.02], [-25, 0, 0], 0.003);
      K.cyl(pump, [0.008, 0.008, 0.12, 8], blackMetal(K), [B2 + 0.05, S + 0.055 + H + 0.05, -0.02]);
      K.tube(pump, [[B2 - 0.12, S + 0.055 + H, 0.05], [B2 - 0.18, S + H + 0.12, 0.12], [B2 - 0.3, S + H - 0.1, 0.33]], 0.008, K.std(0x2a6b3a, { roughness: 0.7 }));
      const gauge = K.part('aoGauge', [B1 + 0.12, S + 0.055 + H, -0.1], null, 'Water-level float gauge');
      K.cyl(gauge, [0.012, 0.012, 0.25, 12], K.std(0xeef3f5, { transparent: true, opacity: 0.6 }), [0, 0.12, 0]);
      K.cyl(gauge, [0.008, 0.008, 0.18, 8], 'red', [0, 0.1, 0]);
      K.cyl(gauge, [0.02, 0.02, 0.015, 12], 'white', [0, 0.25, 0]);
      const guard = K.part('aoGuard', [0, 0, 0], null, 'Gutter guard + leaf strainer');
      meshPanel(K, guard, 4.2, 0.13, 0.012, 0.012, '#3a3d40', 0.25, [0.5, 2.885, -0.29], [-90, 0, 0], { metalness: 0.2 });
      K.cyl(guard, [0.05, 0.04, 0.08, 16], K.std(0x3a3d40, { roughness: 0.6 }), [DX, 2.86, DZ], null);
      const pl = K.part('aoPlants', [0, 0, 0], null, 'Shrubs + pots to soften the stand');
      K.glb(pl, 'shrub_01', { height: 0.7 }, [-0.55, 0, 0.2]) || K.sph(pl, 0.35, leafMat(K), [-0.55, 0.3, 0.2]);
      K.glb(pl, 'potted_plant_01', { height: 0.45 }, [0.78, 0.04, 0.55]) || K.sph(pl, 0.15, leafMat(K), [0.78, 0.2, 0.55]);
      /* water */
      const d1 = K.drip(null, [B1, S + 0.1, 0.02 + R + 0.07], 0.25);
      const d2 = K.drip(null, [B2 + R + 0.5, 0.06, 0.7], 0.0);
      const rain = K.group(null, [0, 0, 0]);
      const drops = [];
      K.rep(10, (i) => {
        const d = K.box(rain, [0.004, 0.08, 0.004], K.std(0x9fd0ff, { transparent: true, opacity: 0.6 }), [-0.5 + i * 0.25, 3, -0.2 + (i % 3) * 0.2], null, 0);
        d.userData.noPick = true;
        drops.push(d);
      });
      return {
        tick(t, fx) {
          d1.tick(t, fx === 'water', 1.2);
          d2.tick(t, false);
          rain.visible = fx === 'rain';
          if (rain.visible) drops.forEach((d, i) => (d.position.y = 3.4 - ((t * 2.2 + i * 0.37) % 1) * 3.4));
        },
      };
    }
  );

  /* ===================== 3 · Cold frame ===================== */
  const CF_AO = ['aoMinMax', 'aoCable', 'aoShade', 'aoBales'];
  TB.model(
    'coldFrame',
    G({ cam: [2.0, 1.55, 2.5], at: [0, 0.3, 0], assets: ['grass_medium_01'], hidden: ['site', 'backWall', 'frontWall', 'sides', 'cleats', 'rafter', 'seal', 'lidL', 'lidR', 'hinges', 'opener', 'soil', 'plants'].concat(CF_AO) }),
    (K) => {
      const L = 1.83, D = 0.91, HB = 0.46, HF = 0.3, T = 0.038;
      const SL = Math.atan2(HB - HF, D) * (180 / Math.PI);
      const cedar = cedarOf(K, [0.6, 0.6]);
      const site = K.part('site', [0, 0.006, 0], null, 'Sunny, south-facing spot, loosened soil');
      K.box(site, [2.3, 0.012, 1.4], soilOf(K, [2, 1.2]), [0, 0, 0], null, 0.004);
      const bw = K.part('backWall', [0, 0, 0], null, 'Back wall: 2×10 + 2×8 cedar (18″)');
      K.box(bw, [L, 0.235, T], cedar, [0, 0.1175, -D / 2 + T / 2], null, 0.004);
      K.box(bw, [L, HB - 0.235, T], cedar, [0, 0.235 + (HB - 0.235) / 2, -D / 2 + T / 2], null, 0.004);
      const fw = K.part('frontWall', [0, 0, 0], null, 'Front wall: 2×12 cedar ripped to 12″');
      K.box(fw, [L, HF, T], cedar, [0, HF / 2, D / 2 - T / 2], null, 0.004);
      const sd = K.part('sides', [0, 0, 0], null, 'Tapered side walls (18″ → 12″)');
      const tz = [[D / 2, 0], [D / 2, HB], [-D / 2, HF], [-D / 2, 0]];
      K.ext(sd, tz, T, cedar, [-L / 2, 0, 0], [0, 90, 0], 0.003);
      K.ext(sd, tz, T, cedar, [L / 2 - T, 0, 0], [0, 90, 0], 0.003);
      const cl = K.part('cleats', [0, 0, 0], null, '2×2 corner cleats (screwed from inside)');
      [[-1, -1, HB], [1, -1, HB], [-1, 1, HF], [1, 1, HF]].forEach(([sx, sz, h]) => K.box(cl, [T, h - 0.02, T], cedar, [sx * (L / 2 - T * 1.5), (h - 0.02) / 2, sz * (D / 2 - T * 1.5)], null, 0.003));
      const raf = K.part('rafter', [0, 0, 0], null, 'Center rafter (lids meet here)');
      K.box(K.group(raf, [0, (HB + HF) / 2 - 0.02, 0], [SL, 0, 0]), [0.07, 0.038, D + 0.01], cedar, [0, 0, 0], null, 0.003);
      const seal = K.part('seal', [0, 0, 0], null, 'Foam weatherstrip on the top edges');
      const foam = K.std(0x2a2a2a, { roughness: 1 });
      K.box(seal, [L, 0.008, 0.02], foam, [0, HB + 0.004, -D / 2 + 0.02], null, 0);
      K.box(seal, [L, 0.008, 0.02], foam, [0, HF + 0.004, D / 2 - 0.02], null, 0);
      [-1, 1].forEach((s) => K.box(K.group(seal, [s * (L / 2 - 0.02), (HB + HF) / 2 + 0.004, 0], [SL, 0, 0]), [0.02, 0.008, D], foam, [0, 0, 0], null, 0));
      const poly = K.std(0xe9f2f4, { transparent: true, opacity: 0.42, roughness: 0.15, metalness: 0.1 });
      const flute = K.std(0xffffff, { transparent: true, opacity: 0.35, roughness: 0.3 });
      const lid = (name, x, label) => {
        const p = K.part(name, [x, HB + 0.008, -D / 2], null, label);
        const g = K.group(p, [0, 0, 0], [SL, 0, 0]);
        const Ll = D / Math.cos((SL * Math.PI) / 180) + 0.04;
        const W = L / 2 - 0.01;
        [-1, 1].forEach((s) => K.box(g, [0.045, 0.045, Ll], cedar, [s * (W / 2 - 0.0225), 0.0225, Ll / 2], null, 0.003));
        K.box(g, [W, 0.045, 0.045], cedar, [0, 0.0225, 0.0225], null, 0.003);
        K.box(g, [W, 0.045, 0.045], cedar, [0, 0.0225, Ll - 0.0225], null, 0.003);
        K.box(g, [W - 0.01, 0.008, Ll - 0.01], poly, [0, 0.05, Ll / 2], null, 0);
        for (let k = 1; k < 18; k++) K.box(g, [0.0015, 0.0085, Ll - 0.02], flute, [-W / 2 + (k * W) / 18, 0.05, Ll / 2], null, 0);
        K.box(g, [0.12, 0.025, 0.03], blackMetal(K), [0, 0.07, Ll - 0.03], null, 0.006);
        return g;
      };
      const gL = lid('lidL', -L / 4, 'Left lid: cedar frame + 8 mm twin-wall polycarbonate');
      lid('lidR', L / 4, 'Right lid (access lid)');
      const hg = K.part('hinges', [0, 0, 0], null, 'Galvanized strap hinges');
      [-0.75, -0.18, 0.18, 0.75].forEach((x) => {
        K.box(hg, [0.06, 0.1, 0.004], galv(K), [x, HB - 0.04, -D / 2 - 0.003], null, 0.001);
        K.cyl(hg, [0.007, 0.007, 0.06, 10], galv(K), [x, HB + 0.008, -D / 2 - 0.005], [0, 0, 90]);
        K.box(hg, [0.05, 0.004, 0.12], galv(K), [x, HB + 0.012, -D / 2 + 0.06], [SL, 0, 0], 0.001);
      });
      const op = K.part('opener', [0, 0, 0], gL, 'Wax-cylinder automatic vent opener');
      K.cyl(op, [0.016, 0.016, 0.22, 16], 'chrome', [0.15, -0.03, 0.2], [90, 0, 0]);
      K.cyl(op, [0.022, 0.022, 0.05, 16], 'steel', [0.15, -0.03, 0.07], [90, 0, 0]);
      K.box(op, [0.04, 0.04, 0.012], 'dark', [0.15, -0.01, 0.33], null, 0.003);
      K.bar(op, [0.15, -0.03, 0.06], [0.15, -0.12, 0.02], 0.006, 'steel');
      K.box(op, [0.06, 0.05, 0.006], 'steel', [0.15, -0.14, 0.022], null, 0.002);
      const soil = K.part('soil', [0, 0.05, 0], null, 'Compost-rich soil, 2″ below the front wall');
      K.box(soil, [L - 2 * T, 0.1, D - 2 * T], soilOf(K, [1.6, 0.8]), [0, 0, 0], null, 0.004);
      const pl = K.part('plants', [0, 0.1, 0], null, 'Lettuce, spinach and seedlings');
      const lettuce = (x, z, s, c) => {
        K.rep(6, (i) => K.sph(pl, 0.035 * s, leafMat(K, c), [x + Math.cos(i) * 0.03 * s, 0.025 * s, z + Math.sin(i) * 0.03 * s], [1.3, 0.7, 1.3]));
        K.sph(pl, 0.03 * s, leafMat(K, 0x86b84a), [x, 0.045 * s, z], [1, 0.9, 1]);
      };
      [-0.7, -0.45, -0.2, 0.05, 0.3, 0.55, 0.75].forEach((x, i) => [-0.25, 0.0, 0.25].forEach((z, j) => lettuce(x, z, i % 2 ? 1.2 : 0.9, (i + j) % 3 ? 0x5b9a3c : 0x7a3b4a)));
      /* add-ons */
      const mm = K.part('aoMinMax', [0.45, 0.32, -D / 2 + T + 0.008], null, 'Min/max thermometer');
      K.box(mm, [0.08, 0.2, 0.015], K.std(0xf2f0ea, { roughness: 0.5 }), [0, 0, 0], null, 0.004);
      [-0.018, 0.018].forEach((x) => K.cyl(mm, [0.004, 0.004, 0.15, 8], K.std(0xe33a2a), [x, 0, 0.01]));
      const cab = K.part('aoCable', [0, 0.101, 0], null, 'Soil-heating cable + thermostat');
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        const z = -0.33 + k * 0.11;
        pts.push([k % 2 ? 0.8 : -0.8, 0, z]);
        pts.push([k % 2 ? -0.8 : 0.8, 0, z]);
      }
      K.tube(cab, pts.slice(0, 12), 0.005, K.std(0x2a2c2f, { roughness: 0.6 }));
      K.box(cab, [0.1, 0.14, 0.05], K.std(0xf4f4f1, { roughness: 0.4 }), [L / 2 + 0.09, 0.0, -0.2], null, 0.01);
      K.box(cab, [0.04, 0.015, 0.006], 'ledG', [L / 2 + 0.09, 0.04, -0.17], null, 0);
      K.tube(cab, [[L / 2 + 0.09, -0.07, -0.2], [L / 2 + 0.2, -0.09, -0.4], [L / 2 + 0.5, -0.1, -0.8]], 0.004, 'black');
      const sh = K.part('aoShade', [0, 0, 0], null, '40% shade cloth for warm spells');
      const shadeMat = K.std(0x23282b, { transparent: true, opacity: 0.75, roughness: 1, side: K.THREE.DoubleSide });
      K.box(K.group(sh, [0, (HB + HF) / 2 + 0.085, 0], [SL, 0, 0]), [L + 0.08, 0.004, D + 0.12], shadeMat, [0, 0, 0], null, 0);
      [-1, 1].forEach((s) => K.box(sh, [L + 0.08, 0.2, 0.004], shadeMat, [0, (s < 0 ? HB : HF) - 0.02, s * (D / 2 + 0.065)], null, 0));
      const bales = K.part('aoBales', [0, 0, -D / 2 - 0.3], null, 'Straw bales banked on the north side');
      const straw = K.std(0xd8bf72, { roughness: 1 });
      [-0.48, 0.48].forEach((x) => {
        K.box(bales, [0.92, 0.36, 0.46], straw, [x, 0.18, 0], null, 0.03);
        [-0.15, 0.15].forEach((dz) => K.box(bales, [0.93, 0.01, 0.01], K.std(0xb08a3a), [x, 0.36, dz], null, 0));
      });
      return {};
    }
  );

  /* ===================== 4 · Drip irrigation for raised beds ===================== */
  const DR_AO = ['aoHub', 'aoRain', 'aoMoist', 'aoFert', 'aoPots'];
  TB.model(
    'dripSystem',
    G({ cam: [3.4, 2.6, 3.6], at: [-0.1, 0.2, -0.1], tex: ['wood_planks', 'forrest_ground_01', 'pine_bark'], assets: ['grass_medium_01', 'potted_plant_02', 'planter_box_01'], hidden: ['plan', 'timer', 'backflow', 'filter', 'regulator', 'adapter', 'mainline', 'valves', 'risers', 'headers', 'laterals', 'stakes', 'endcaps'].concat(DR_AO) }),
    (K) => {
      const BX = [-0.84, 0.98], BW = 1.22, Z0 = -1.0, Z1 = 1.44, BH = 0.28, ST = BH - 0.01;
      const BIB = [-1.6, 0.56, -1.56];
      const siding = K.std(0xdcd6c8, { roughness: 0.8 });
      K.box(null, [5.2, 2.4, 0.16], siding, [0.1, 1.2, -1.72], null, 0.004);
      for (let i = 0; i < 13; i++) K.box(null, [5.2, 0.012, 0.012], K.std(0xc6c0b2, { roughness: 0.8 }), [0.1, 0.38 + i * 0.16, -1.635], null, 0);
      K.box(null, [5.2, 0.32, 0.2], K.std(0xa8a49c, { roughness: 1 }), [0.1, 0.16, -1.7], null, 0.004);
      K.box(null, [5.2, 0.03, 0.6], K.pbr('pine_bark', [5, 0.6], {}, 'bark'), [0.1, 0.015, -1.32], null, 0);
      /* hose bib */
      K.box(null, [0.09, 0.09, 0.02], 'brass', [BIB[0], BIB[1] + 0.04, -1.635], null, 0.006);
      K.cyl(null, [0.015, 0.015, 0.08, 12], 'brass', [BIB[0], BIB[1] + 0.04, -1.6], [90, 0, 0]);
      K.cyl(null, [0.017, 0.015, 0.06, 12], 'brass', [BIB[0], BIB[1] + 0.01, -1.56]);
      K.cyl(null, [0.04, 0.04, 0.008, 6], 'red', [BIB[0], BIB[1] + 0.06, -1.56], [0, 0, 0]);
      K.cyl(null, [0.004, 0.004, 0.03, 8], 'brass', [BIB[0], BIB[1] + 0.05, -1.56]);
      /* beds (context) */
      const cedar = cedarOf(K);
      BX.forEach((x) => {
        [-1, 1].forEach((s) => K.box(null, [0.038, BH, Z1 - Z0], cedar, [x + s * (BW / 2 - 0.019), BH / 2, (Z0 + Z1) / 2], null, 0.004));
        [Z0, Z1].forEach((z, k) => K.box(null, [BW, BH, 0.038], cedar, [x, BH / 2, z + (k ? -0.019 : 0.019)], null, 0.004));
        K.box(null, [BW - 0.076, 0.02, Z1 - Z0 - 0.076], soilOf(K, [1, 2]), [x, ST - 0.01, (Z0 + Z1) / 2], null, 0);
        [-0.45, -0.15, 0.15, 0.45].forEach((dx, i) =>
          [-0.55, 0.0, 0.55, 1.1].forEach((z, j) => {
            if ((i + j) % 2) return;
            K.glb(null, 'grass_medium_01', { node: 'grass_medium_01_mid_a_LOD0', height: 0.16 }, [x + dx + 0.07, ST, z + 0.12]) || K.sph(null, 0.06, leafMat(K), [x + dx + 0.07, ST + 0.05, z + 0.12], [1, 0.7, 1]);
          })
        );
      });
      const plan = K.part('plan', [0, 0, 0], null, 'Zone plan: flags along the mainline route');
      [[-1.6, -1.2], [-0.84, -1.2], [0.98, -1.2], [-0.84, 1.44], [0.98, 1.44]].forEach(([x, z]) => {
        K.cyl(plan, [0.004, 0.004, 0.45, 6], 'steel', [x, 0.225, z]);
        K.box(plan, [0.08, 0.06, 0.002], 'blue', [x + 0.04, 0.42, z], null, 0);
      });
      /* head assembly, top to bottom */
      const X = BIB[0], Zh = BIB[2];
      const timer = K.part('timer', [X, 0, Zh], null, 'Battery hose-end timer');
      K.box(timer, [0.11, 0.14, 0.09], K.std(0x2d6fb0, { roughness: 0.5 }), [0, 0.44, 0.0], null, 0.02);
      K.box(timer, [0.07, 0.04, 0.004], 'screen', [0, 0.47, 0.046], null, 0);
      K.cyl(timer, [0.016, 0.016, 0.03, 14], 'grey', [0, 0.52, 0]);
      K.cyl(timer, [0.022, 0.022, 0.012, 16], 'white', [0.03, 0.42, 0.047], [90, 0, 0]);
      const bf = K.part('backflow', [X, 0, Zh], null, 'Hose-thread backflow preventer');
      K.cyl(bf, [0.017, 0.017, 0.05, 14], 'brass', [0, 0.345, 0]);
      K.nut(bf, 0.034, 0.012, 'brass', [0, 0.36, 0]);
      const fl = K.part('filter', [X, 0, Zh], null, '150-mesh Y-filter');
      K.cyl(fl, [0.018, 0.018, 0.07, 14], K.std(0x2a2c2f, { roughness: 0.5 }), [0, 0.285, 0]);
      K.cyl(fl, [0.02, 0.016, 0.08, 14], K.std(0x6aa6d8, { transparent: true, opacity: 0.75, roughness: 0.2 }), [0, 0.26, 0.04], [45, 0, 0]);
      const rg = K.part('regulator', [X, 0, Zh], null, '25 psi pressure regulator');
      K.cyl(rg, [0.021, 0.021, 0.055, 14], K.std(0x4a8fd0, { roughness: 0.5 }), [0, 0.215, 0]);
      K.cyl(rg, [0.016, 0.016, 0.01, 14], 'grey', [0, 0.18, 0]);
      const ad = K.part('adapter', [X, 0, Zh], null, 'Hose-to-½″-tubing adapter');
      K.cyl(ad, [0.015, 0.012, 0.035, 14], 'black', [0, 0.16, 0]);
      const tubeMat = K.std(0x18191b, { roughness: 0.65 });
      const ml = K.part('mainline', [0, 0, 0], null, '½″ poly mainline');
      K.tube(ml, [[X, 0.145, Zh], [X, 0.08, Zh + 0.02], [X, 0.035, Zh + 0.15], [X, 0.035, -1.25], [X + 0.1, 0.035, -1.2], [BX[1] + 0.05, 0.035, -1.2]], 0.009, tubeMat);
      K.cyl(ml, [0.011, 0.011, 0.03, 12], 'black', [BX[1] + 0.07, 0.035, -1.2], [0, 0, 90]);
      const va = K.part('valves', [0, 0, 0], null, 'Tees + ball valves (one zone per bed)');
      BX.forEach((x) => {
        K.box(va, [0.045, 0.03, 0.03], 'black', [x, 0.035, -1.2], null, 0.006);
        K.cyl(va, [0.012, 0.012, 0.06, 12], K.std(0x2a2c2f), [x, 0.035, -1.16], [90, 0, 0]);
        K.box(va, [0.05, 0.012, 0.02], 'blue', [x, 0.06, -1.15], [0, 30, 0], 0.003);
      });
      const ris = K.part('risers', [0, 0, 0], null, 'Risers up and over the bed wall');
      BX.forEach((x) => K.tube(ris, [[x, 0.035, -1.13], [x, 0.04, -1.08], [x, ST + 0.06, -1.05], [x, ST + 0.06, -0.97], [x, ST + 0.01, -0.92]], 0.009, tubeMat));
      const hd = K.part('headers', [0, 0, 0], null, '½″ header across the bed end');
      const LX = [-0.45, -0.15, 0.15, 0.45];
      BX.forEach((x) => {
        K.cyl(hd, [0.009, 0.009, BW - 0.3, 12], tubeMat, [x, ST + 0.01, -0.9], [0, 0, 90]);
        LX.forEach((dx) => K.box(hd, [0.03, 0.022, 0.03], 'black', [x + dx, ST + 0.01, -0.9], null, 0.005));
      });
      const lat = K.part('laterals', [0, 0, 0], null, '¼″/½″ inline emitter lines, 12″ apart');
      const emit = K.std(0x7a5a3a, { roughness: 0.6, emissive: 0x2a7fd8, emissiveIntensity: 0 });
      const emitters = [];
      BX.forEach((x) =>
        LX.forEach((dx) => {
          K.cyl(lat, [0.008, 0.008, Z1 - Z0 - 0.3, 10], K.std(0x3a2a20, { roughness: 0.7 }), [x + dx, ST + 0.008, (-0.9 + 1.3) / 2], [90, 0, 0]);
          for (let z = -0.75; z <= 1.25; z += 0.3) emitters.push(K.cyl(lat, [0.011, 0.011, 0.025, 10], emit, [x + dx, ST + 0.008, z], [90, 0, 0]));
        })
      );
      const stk = K.part('stakes', [0, 0, 0], null, 'U-stakes every 2–3 ft');
      BX.forEach((x) => LX.forEach((dx) => [-0.4, 0.4, 1.1].forEach((z) => K.tor(stk, [0.016, 0.0025, 180], 'steel', [x + dx, ST + 0.006, z], [0, 90, 0]))));
      const ec = K.part('endcaps', [0, 0, 0], null, 'Figure-8 end closures');
      BX.forEach((x) =>
        LX.forEach((dx) => {
          K.tor(ec, [0.012, 0.004], 'black', [x + dx, ST + 0.01, 1.32], [90, 0, 0]);
          K.tor(ec, [0.012, 0.004], 'black', [x + dx, ST + 0.01, 1.35], [90, 0, 0]);
        })
      );
      /* wet spots for the test step */
      const wet = K.group(null, [0, 0, 0]);
      const wetMat = K.std(0x2a1d14, { transparent: true, opacity: 0, roughness: 0.4, depthWrite: false });
      emitters.forEach((e) => {
        const p = e.position;
        const d = K.cyl(wet, [0.07, 0.07, 0.002, 18], wetMat, [p.x, ST + 0.002, p.z]);
        d.userData.noPick = true;
      });
      /* add-ons */
      const hub = K.part('aoHub', [-1.1, 1.05, -1.63], null, 'Wi-Fi hub (app control, weather skip)');
      K.box(hub, [0.1, 0.1, 0.035], K.std(0xf4f4f1, { roughness: 0.4 }), [0, 0, 0.02], null, 0.015);
      K.cyl(hub, [0.006, 0.006, 0.004, 12], 'ledG', [0, 0.02, 0.039], [90, 0, 0]);
      const rain = K.part('aoRain', [-2.0, 1.55, -1.63], null, 'Rain sensor on a bracket');
      K.box(rain, [0.02, 0.02, 0.18], galv(K), [0, 0, 0.09], null, 0.003);
      K.cyl(rain, [0.04, 0.04, 0.05, 18], K.std(0x2a2c2f, { roughness: 0.5 }), [0, 0.03, 0.18]);
      K.cyl(rain, [0.032, 0.032, 0.01, 18], K.std(0xc8a070, { roughness: 1 }), [0, 0.058, 0.18]);
      const ms = K.part('aoMoist', [BX[0] + 0.3, ST, 0.3], null, 'Soil-moisture sensor');
      K.box(ms, [0.04, 0.12, 0.012], K.std(0x2a2c2f, { roughness: 0.5 }), [0, 0.06, 0], null, 0.004);
      K.box(ms, [0.07, 0.006, 0.05], K.std(0x1d2a44, { metalness: 0.3, roughness: 0.2 }), [0, 0.125, 0], [-20, 0, 0], 0.002);
      const fe = K.part('aoFert', [X - 0.22, 0, -1.5], null, 'Fertilizer injector (after the backflow preventer)');
      K.cyl(fe, [0.05, 0.045, 0.2, 20], K.std(0xdfe8ea, { transparent: true, opacity: 0.7, roughness: 0.2 }), [0, 0.12, 0]);
      K.cyl(fe, [0.052, 0.052, 0.03, 20], 'black', [0, 0.235, 0]);
      K.tube(fe, [[0, 0.25, 0], [0.08, 0.3, -0.03], [0.21, 0.3, -0.06]], 0.005, 'black');
      const pots = K.part('aoPots', [0, 0, 0], null, 'Patio pots on ¼″ drippers');
      [[-2.3, -1.1], [-2.15, -0.55]].forEach(([x, z], i) => {
        K.glb(pots, i ? 'potted_plant_02' : 'planter_box_01', { height: i ? 0.5 : 0.45 }, [x, 0, z]) || K.cyl(pots, [0.2, 0.15, 0.35, 20], 'orange', [x, 0.175, z]);
        K.tube(pots, [[X, 0.035, -1.25], [-1.9, 0.02, -1.0 + i * 0.1], [x + 0.05, 0.02, z + 0.2], [x + 0.06, 0.45, z + 0.17], [x + 0.03, 0.42, z + 0.05]], 0.004, tubeMat);
      });
      return {
        tick(t, fx) {
          const on = fx === 'flow';
          const k = on ? 0.5 + 0.5 * Math.sin(t * 3) : 0;
          emitters.forEach((e) => (e.material.emissiveIntensity = on ? 0.6 + k : 0));
          wet.children.forEach((d) => (d.material.opacity = on ? 0.55 : 0));
          wet.visible = on;
        },
      };
    }
  );
