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
      const heap = (x, col, h) => K.sph(comp, 0.4, K.pbr('forrest_ground_01', [1, 1], { color: col }, K.std(col, { roughness: 1 })), [x, 0.02, -0.05], [1.0, h, 0.86]);
      heap(-0.94, 0x6a5238, 1.7);
      heap(0, 0x4a3826, 1.4);
      heap(0.94, 0x2f241a, 0.9);
      const straw = K.std(0xd6b866, { roughness: 1 });
      const greens = K.std(0x6f9a3a, { roughness: 0.9 });
      K.rep(26, (i) => {
        const a = i * 2.4;
        const r = 0.08 + (i % 7) * 0.035;
        const x = -0.94 + Math.cos(a) * r;
        const z = -0.02 + Math.sin(a) * r * 0.9;
        const y = 0.02 + 0.4 * 1.7 * Math.sqrt(Math.max(0, 1 - (r / 0.41) ** 2)) - 0.01;
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
          K.cyl(holes, [0.0065, 0.0065, 0.003, 12], 'black', [x, Math.sin(a) * (R + 0.0005), Math.cos(a) * (R + 0.0005)], [90 - (a * 180) / Math.PI, 0, 0]);
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
      const nrm = (a) => [90 - (a * 180) / Math.PI, 0, 0];
      const door = K.std(0x23497c, { roughness: 0.5 });
      for (let k = 0; k < 10; k++) {
        const a = A0 + ((k + 0.5) * (A1 - A0)) / 10;
        const pp = [0, Math.sin(a) * (R + 0.007), Math.cos(a) * (R + 0.007)];
        K.box(hatch, [0.35, 0.006, (R * (A1 - A0)) / 10 + 0.003], door, pp, nrm(a), 0);
      }
      [-0.11, 0.11].forEach((x) => {
        const a = A0 - 0.02;
        K.box(hatch, [0.05, 0.006, 0.05], galv(K), [x, Math.sin(a) * (R + 0.012), Math.cos(a) * (R + 0.012)], nrm(a), 0.001);
        K.cyl(hatch, [0.005, 0.005, 0.05, 8], galv(K), [x, Math.sin(A0) * (R + 0.014), Math.cos(A0) * (R + 0.014)], [0, 0, 90]);
      });
      const aL = A1 + 0.02;
      K.box(hatch, [0.03, 0.008, 0.09], galv(K), [0, Math.sin(aL) * (R + 0.012), Math.cos(aL) * (R + 0.012)], nrm(aL), 0.002);
      K.tor(hatch, [0.012, 0.003], galv(K), [0, Math.sin(A1 + 0.12) * (R + 0.02), Math.cos(A1 + 0.12) * (R + 0.02)], nrm(A1 + 0.12));
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
        K.sph(pl, 0.03 * s, leafMat(K, 0x4f8a2c), [x, 0.045 * s, z], [1, 0.9, 1]);
      };
      [-0.7, -0.45, -0.2, 0.05, 0.3, 0.55, 0.75].forEach((x, i) => [-0.25, 0.0, 0.25].forEach((z, j) => lettuce(x, z, i % 2 ? 1.2 : 0.9, (i + j) % 3 ? 0x2f6a24 : 0x5a2433)));
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
      const wetMat = K.std(0x2a1d14, { transparent: true, opacity: 0.6, roughness: 0.35, depthWrite: false });
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
          wet.visible = on;
        },
      };
    }
  );

  /* ===================== 5 · Cattle-panel arch tunnel ===================== */
  const TN_AO = ['aoString', 'aoVines', 'aoCover', 'aoBench', 'aoPath'];
  const ARCH = (() => {
    const R = 1.05, LEG = 0.8, L = 2 * LEG + Math.PI * R;
    return {
      L,
      at(s) {
        if (s <= LEG) return [-R, s];
        if (s >= L - LEG) return [R, LEG - (s - (L - LEG))];
        const f = (s - LEG) / R;
        return [-R * Math.cos(f), LEG + R * Math.sin(f)];
      },
    };
  })();
  TB.model(
    'panelTunnel',
    G({ cam: [3.6, 2.4, 4.2], at: [0, 0.9, 0], tex: ['wood_planks', 'forrest_ground_01', 'pine_bark'], assets: ['grass_medium_01', 'painted_wooden_bench'], hidden: ['layout', 'tposts', 'tposts2', 'flat', 'panel1', 'panel2', 'ties', 'ties2', 'plants'].concat(TN_AO) }),
    (K) => {
      const cedar = cedarOf(K);
      /* two beds (context) */
      [-1, 1].forEach((s) => {
        const x = s * 1.4;
        [-1, 1].forEach((k) => K.box(null, [0.038, 0.25, 2.9], cedar, [x + k * 0.45, 0.125, 0], null, 0.004));
        [-1, 1].forEach((k) => K.box(null, [0.9, 0.25, 0.038], cedar, [x, 0.125, k * 1.45], null, 0.004));
        K.box(null, [0.86, 0.02, 2.86], soilOf(K, [1, 3]), [x, 0.23, 0], null, 0);
      });
      stakesAndLines(K, 'layout', 'Post marks: 7 ft apart across the path', [[-1.12, -1.22], [1.12, -1.22], [1.12, 1.22], [-1.12, 1.22]], 0.4);
      const green = K.std(0x2f6b3a, { metalness: 0.4, roughness: 0.5 });
      const tpost = (g, x, z) => {
        const p = K.group(g, [x, -0.05, z], [0, x > 0 ? 180 : 0, 0]);
        K.ext(p, [[-0.02, 0], [0.02, 0], [0.02, 0.006], [0.004, 0.006], [0.004, 0.035], [-0.004, 0.035], [-0.004, 0.006], [-0.02, 0.006]], 1.1, green, [0, 0, 0], [-90, 0, 0], 0);
        K.box(p, [0.008, 0.025, 0.012], 'white', [0, 1.08, -0.02], null, 0);
        K.rep(10, (i) => K.box(p, [0.008, 0.008, 0.006], green, [0, 0.12 + i * 0.1, -0.038], null, 0));
      };
      const tp = K.part('tposts', [0, 0, 0], null, '5 ft steel T-posts (outside the panel)');
      [-1.12, 1.12].forEach((x) => [-1.22, -0.03].forEach((z) => tpost(tp, x, z)));
      const tp2 = K.part('tposts2', [0, 0, 0], null, 'T-posts for the second panel');
      [-1.12, 1.12].forEach((x) => tpost(tp2, x, 1.22));
      const wire = galv(K);
      const WZ = [0, 0.15, 0.3, 0.46, 0.64, 0.84, 1.05, 1.27];
      const flat = K.part('flat', [2.6, 0.012, 0], null, '16 × 50″ cattle panel, laid out flat');
      WZ.forEach((w) => K.cyl(flat, [0.003, 0.003, ARCH.L, 8], wire, [w - 0.635, 0, 0], [90, 0, 0]));
      for (let s = 0; s <= ARCH.L + 0.01; s += 0.2) K.cyl(flat, [0.003, 0.003, 1.27, 8], wire, [0, 0, s - ARCH.L / 2], [0, 0, 90]);
      const panel = (name, z0, label) => {
        const g = K.part(name, [0, 0, 0], null, label);
        WZ.forEach((w) => {
          const pts = [];
          for (let s = 0; s <= ARCH.L + 0.001; s += 0.1) {
            const [x, y] = ARCH.at(Math.min(s, ARCH.L));
            pts.push([x, y, z0 + w]);
          }
          K.tube(g, pts, 0.003, wire);
        });
        for (let s = 0; s <= ARCH.L + 0.01; s += 0.2) {
          const [x, y] = ARCH.at(Math.min(s, ARCH.L));
          K.bar(g, [x, y, z0], [x, y, z0 + 1.27], 0.003, wire, 6);
        }
        return g;
      };
      panel('panel1', -1.3, 'Cattle panel #1, bent into an arch');
      panel('panel2', 0.03, 'Cattle panel #2');
      const tieMat = K.std(0x111214, { roughness: 0.6 });
      const ties = (name, zs, label) => {
        const g = K.part(name, [0, 0, 0], null, label);
        [-1, 1].forEach((s) => zs.forEach((z) => [0.15, 0.35, 0.55, 0.75, 0.95].forEach((y) => K.tor(g, [0.04, 0.004], tieMat, [s * 1.085, y, z], [90, 0, 0]))));
        return g;
      };
      ties('ties', [-1.22, -0.03], 'UV-rated zip ties / T-post clips');
      ties('ties2', [1.22], 'Ties on the last posts');
      const pl = K.part('plants', [0, 0.24, 0], null, 'Climbing beans, cucumbers, squash at the base');
      [-1, 1].forEach((s) =>
        [-1.1, -0.65, -0.2, 0.25, 0.7, 1.15].forEach((z, i) => {
          const x = s * 1.0;
          K.tube(pl, [[x + s * 0.05, 0, z], [x, 0.2, z + 0.03], [x - s * 0.02, 0.45 + (i % 2) * 0.1, z - 0.02]], 0.006, leafMat(K, 0x56803a));
          K.rep(6, (k) => K.sph(pl, 0.045, leafMat(K, k % 2 ? 0x2f5f22 : 0x3d6e2a), [x - s * 0.02 + Math.sin(k + i) * 0.05, 0.05 + k * 0.08, z + Math.cos(k * 2) * 0.06], [1.2, 0.7, 1.0]));
        })
      );
      /* add-ons */
      const sl = K.part('aoString', [0, 0, 0], null, 'Café lights along the arch');
      const bulb = glow(K);
      [-1.3, 1.3].forEach((z) => {
        let prev = null;
        for (let s = 0.9; s <= ARCH.L - 0.9 + 0.01; s += 0.22) {
          const [x, y] = ARCH.at(s);
          const p = [x * 0.98, y - 0.03, z];
          if (prev) K.bar(sl, prev, p, 0.004, 'black');
          K.sph(sl, 0.03, bulb, [p[0], p[1] - 0.05, z]);
          prev = p;
        }
      });
      K.tube(sl, [[0, 1.82, -1.3], [0, 1.72, -0.65], [0, 1.82, 0], [0, 1.72, 0.65], [0, 1.82, 1.3]], 0.004, 'black');
      [-0.65, 0.65].forEach((z) => K.sph(sl, 0.03, bulb, [0, 1.67, z]));
      const vines = K.part('aoVines', [0, 0, 0], null, 'Mature vines + hanging gourds');
      const lv = leafMat(K, 0x4a8434);
      for (let s = 0.2; s < ARCH.L - 0.1; s += 0.17)
        [-1.2, -0.85, -0.5, -0.15, 0.2, 0.55, 0.9, 1.2].forEach((z, j) => {
          if ((Math.floor(s * 10) + j) % 3 === 0) return;
          const [x, y] = ARCH.at(s);
          K.sph(vines, 0.08, lv, [x * 0.99, y, z + Math.sin(s * 7 + j) * 0.06], [1.3, 0.5, 1.2]);
        });
      [[0.45, -0.8], [-0.6, 0.3], [0.2, 0.9], [-0.25, -0.4]].forEach(([x, z], i) => {
        const top = Math.sqrt(1.05 * 1.05 - x * x) + 0.8;
        K.bar(vines, [x, top, z], [x, top - 0.25, z], 0.004, leafMat(K, 0x56803a));
        K.sph(vines, 0.07, K.std(i % 2 ? 0xd9a332 : 0x7aa04a, { roughness: 0.6 }), [x, top - 0.33, z], [0.9, 1.4, 0.9]);
      });
      const cov = K.part('aoCover', [0, 0, 0], null, '6-mil greenhouse film (spring/fall hoop house)');
      const film = K.std(0xf2f6f6, { transparent: true, opacity: 0.32, roughness: 0.15, side: K.THREE.DoubleSide });
      arcPanel(K, cov, 1.12, 2.7, -90, 90, film, [0, 0.8, 0], [90, 0, 90]);
      [-1, 1].forEach((s) => K.box(cov, [0.004, 0.8, 2.7], film, [s * 1.12, 0.4, 0], null, 0));
      [-1, 1].forEach((s) => K.cyl(cov, [0.012, 0.012, 2.7, 8], 'black', [s * 1.12, 0.05, 0], [90, 0, 0]));
      AO.bench(K, 'aoBench', [0, 0, 2.2], 180, 'Bench at the tunnel mouth');
      const path = K.part('aoPath', [0, 0.012, 0], null, 'Bark-mulch path on fabric');
      K.box(path, [1.85, 0.024, 3.1], K.pbr('pine_bark', [2, 3], {}, 'bark'), [0, 0, 0], null, 0.004);
      return {};
    }
  );

  /* ===================== 6 · Potting bench with tub sink ===================== */
  const PB_AO = ['aoFaucet', 'aoTools', 'aoLight', 'aoPots', 'aoAwning'];
  TB.model(
    'pottingBench',
    G({ cam: [1.9, 1.6, 2.4], at: [0, 0.8, 0], ground: { tex: 'gravel_floor', repeat: 6, radius: 6 }, tex: ['wood_planks', 'forrest_ground_01', 'gravel_floor'], assets: ['potted_plant_02', 'potted_plant_01'], hidden: ['lumber', 'legs', 'sideRails', 'longRails', 'shelf', 'top', 'tub', 'drain', 'back', 'upperShelf', 'bins'].concat(PB_AO) }),
    (K) => {
      const W = 1.52, D = 0.61, TH = 0.91, BH = 1.55;
      const cedar = cedarOf(K);
      const lx = W / 2 - 0.045, fz = D / 2 - 0.03, bz = -D / 2 + 0.03;
      const lum = K.part('lumber', [0, 0, 0.9], null, 'Cut list: cedar 2×4s, 1×6 and 1×4 boards');
      [-0.45, 0.45].forEach((x) => K.box(lum, [0.08, 0.6, 0.6], 'woodLight', [x, 0.3, 0], null, 0.01));
      K.rep(5, (i) => K.box(lum, [1.6, 0.089, 0.038], cedar, [0, 0.645 + (i % 2) * 0.09, -0.18 + i * 0.09], null, 0.003));
      K.rep(4, (i) => K.box(lum, [1.6, 0.019, 0.14], cedar, [0, 0.78 + i * 0.02, 0.05], null, 0.003));
      const legs = K.part('legs', [0, 0, 0], null, '2×4 legs (back legs run up to 61″)');
      [-1, 1].forEach((s) => {
        K.box(legs, [0.038, TH - 0.019, 0.089], cedar, [s * lx, (TH - 0.019) / 2, fz], null, 0.003);
        K.box(legs, [0.038, BH, 0.089], cedar, [s * lx, BH / 2, bz], null, 0.003);
      });
      const sr = K.part('sideRails', [0, 0, 0], null, 'Side rails (top + bottom), end frames');
      [-1, 1].forEach((s) => [TH - 0.019 - 0.045, 0.2].forEach((y) => K.box(sr, [0.038, 0.089, D - 0.04], cedar, [s * (lx - 0.038), y, 0], null, 0.003)));
      const lr = K.part('longRails', [0, 0, 0], null, 'Long rails + tub supports');
      [fz, bz].forEach((z) => [TH - 0.019 - 0.045, 0.2].forEach((y) => K.box(lr, [W - 0.05, 0.089, 0.038], cedar, [0, y, z + (z > 0 ? -0.06 : 0.06)], null, 0.003)));
      [0.16, 0.64].forEach((x) => K.box(lr, [0.038, 0.089, D - 0.16], cedar, [x, TH - 0.019 - 0.045, 0], null, 0.003));
      const sh = K.part('shelf', [0, 0.255, 0], null, 'Lower shelf: 1×4 slats, ¼″ gaps');
      K.rep(6, (i) => K.box(sh, [W - 0.12, 0.019, 0.083], cedar, [0, 0, -0.24 + i * 0.096], null, 0.002));
      const top = K.part('top', [0, TH - 0.0095, 0], null, '1×6 top slats around the tub opening');
      const TX0 = 0.18, TX1 = 0.62, TZ0 = -0.15, TZ1 = 0.13;
      K.rep(4, (i) => {
        const z = -0.225 + i * 0.146;
        const zs = [z - 0.07, z + 0.07];
        if (zs[1] > TZ0 && zs[0] < TZ1) {
          K.box(top, [TX0 + W / 2 + 0.02, 0.019, 0.14], cedar, [(-W / 2 - 0.02 + TX0) / 2, 0, z], null, 0.003);
          K.box(top, [W / 2 + 0.02 - TX1, 0.019, 0.14], cedar, [(TX1 + W / 2 + 0.02) / 2, 0, z], null, 0.003);
        } else K.box(top, [W + 0.04, 0.019, 0.14], cedar, [0, 0, z], null, 0.003);
      });
      const tub = K.part('tub', [(TX0 + TX1) / 2, TH, (TZ0 + TZ1) / 2], null, 'Stainless utility tub (drop-in)');
      const ss = K.std(0xc7cbcf, { metalness: 0.9, roughness: 0.3 });
      const rect = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      K.ext(tub, rect(-0.25, 0.25, -0.165, 0.165), 0.008, ss, [0, 0.008, 0], [90, 0, 0], 0.002, [rect(-0.212, 0.212, -0.132, 0.132).reverse()]);
      [-1, 1].forEach((s) => K.box(tub, [0.43, 0.2, 0.006], ss, [0, -0.1, s * 0.132], null, 0));
      [-1, 1].forEach((s) => K.box(tub, [0.006, 0.2, 0.27], ss, [s * 0.212, -0.1, 0], null, 0));
      K.box(tub, [0.43, 0.006, 0.27], K.std(0x9aa0a6, { metalness: 0.9, roughness: 0.35 }), [0, -0.2, 0], null, 0);
      K.cyl(tub, [0.025, 0.025, 0.004, 18], 'dark', [0.1, -0.196, 0]);
      const dr = K.part('drain', [0, 0, 0], null, 'Basket strainer + drain hose to a bucket');
      K.cyl(dr, [0.02, 0.02, 0.06, 14], 'chrome', [(TX0 + TX1) / 2 + 0.1, TH - 0.23, -0.01]);
      K.tube(dr, [[0.5, TH - 0.26, -0.01], [0.52, 0.6, 0.0], [0.56, 0.4, 0.05], [0.58, 0.42, 0.06]], 0.012, K.std(0xe8ece8, { transparent: true, opacity: 0.8 }));
      K.lathe(dr, [[0, 0], [0.13, 0], [0.15, 0.37], [0.155, 0.38], [0, 0.38]], K.std(0xe2742c, { roughness: 0.5 }), [0.58, 0.265, 0.06]);
      const back = K.part('back', [0, 0, 0], null, '1×4 backboard slats');
      K.rep(5, (i) => K.box(back, [W - 0.01, 0.089, 0.019], cedar, [0, TH + 0.08 + i * 0.12, bz - 0.054], null, 0.002));
      const us = K.part('upperShelf', [0, 1.36, bz + 0.05], null, 'Upper shelf on cleats');
      K.box(us, [W - 0.01, 0.019, 0.17], cedar, [0, 0, 0.03], null, 0.003);
      [-1, 1].forEach((s) => K.box(us, [0.019, 0.1, 0.13], cedar, [s * 0.5, -0.06, 0.03], null, 0.002));
      const bins = K.part('bins', [0, 0.265, 0], null, 'Lidded soil + perlite bins on the shelf');
      [[-0.48, 0x3a4652], [-0.05, 0x5a6b3a]].forEach(([x, c]) => {
        K.box(bins, [0.4, 0.3, 0.45], K.std(c, { roughness: 0.6 }), [x, 0.16, 0.0], null, 0.02);
        K.box(bins, [0.42, 0.03, 0.47], K.std(0x222428, { roughness: 0.6 }), [x, 0.32, 0.0], null, 0.01);
      });
      /* add-ons */
      const fa = K.part('aoFaucet', [(TX0 + TX1) / 2, TH, bz - 0.02], null, 'Hose-fed faucet with shutoff');
      K.box(fa, [0.08, 0.08, 0.02], 'chrome', [0, 0.16, 0], null, 0.01);
      K.tube(fa, [[0, 0.16, 0.0], [0, 0.32, 0.04], [0, 0.32, 0.16], [0, 0.24, 0.2]], 0.012, 'chrome');
      K.box(fa, [0.05, 0.015, 0.015], 'chrome', [0.04, 0.22, 0.02], null, 0.004);
      K.tube(fa, [[0, 0.16, -0.02], [0.08, 0.1, -0.06], [0.3, 0.0, -0.06], [0.75, -0.9, -0.08], [1.2, -0.9, -0.3]], 0.011, K.std(0x2a6b3a, { roughness: 0.7 }));
      const tl = K.part('aoTools', [0, 0, bz - 0.04], null, 'Tool rail: trowel, pruners, cultivator');
      K.cyl(tl, [0.008, 0.008, 0.7, 10], 'steel', [-0.35, 1.25, -0.0], [0, 0, 90]);
      [-0.62, -0.42, -0.22].forEach((x, i) => {
        K.box(tl, [0.03, 0.12, 0.025], ['gripRed', 'hickory', 'gripYellow'][i], [x, 1.17, 0.01], null, 0.008);
        K.box(tl, [i === 1 ? 0.012 : 0.05, 0.12, 0.004], 'toolSteel', [x, 1.05, 0.01], null, 0.002);
      });
      const li = K.part('aoLight', [0, 1.33, bz + 0.1], null, 'Battery LED bar under the shelf');
      K.box(li, [0.6, 0.02, 0.03], K.std(0xf4f4f1, { roughness: 0.4 }), [0, 0, 0], null, 0.004);
      K.box(li, [0.56, 0.004, 0.02], glow(K, 0xfff6e0, 1.6), [0, -0.012, 0], null, 0);
      const pots = K.part('aoPots', [0, 1.37, bz + 0.08], null, 'Pots + seedlings on the shelf');
      const terra = K.std(0xb8643a, { roughness: 0.9 });
      [-0.6, -0.48].forEach((x) => [0, 1, 2].forEach((k) => K.lathe(pots, [[0, 0], [0.045, 0], [0.06, 0.1], [0, 0.1]], terra, [x, k * 0.025, 0])));
      K.glb(pots, 'potted_plant_02', { height: 0.24 }, [0.0, 0, 0]) || K.sph(pots, 0.08, leafMat(K), [0, 0.1, 0]);
      K.glb(pots, 'potted_plant_01', { height: 0.3 }, [0.45, 0, 0]) || K.sph(pots, 0.1, leafMat(K), [0.45, 0.1, 0]);
      const aw = K.part('aoAwning', [0, BH, bz], null, 'Cedar shed-roof awning');
      [-1, 1].forEach((s) => K.box(aw, [0.038, 0.089, 0.6], cedar, [s * lx, 0.02, 0.25], [-12, 0, 0], 0.003));
      K.box(aw, [W + 0.1, 0.012, 0.66], K.std(0x55606a, { metalness: 0.6, roughness: 0.4 }), [0, 0.08, 0.26], [-12, 0, 0], 0.002);
      return {};
    }
  );

  /* ===================== 7 · Deer & critter fence with gate ===================== */
  const DF_AO = ['aoHotWire', 'aoArbor', 'aoCaps', 'aoCloser', 'aoFlags'];
  TB.model(
    'deerFence',
    G({ cam: [7.4, 5.2, 8.6], at: [0, 0.9, 0], tex: ['wood_planks', 'forrest_ground_01', 'pine_bark'], assets: ['grass_medium_01'], hidden: ['layout', 'holes', 'corners', 'gatePosts', 'posts', 'braces', 'topRail', 'trench', 'apron', 'lowerMesh', 'upperMesh', 'backfill', 'gate'].concat(DF_AO) }),
    (K) => {
      const XA = 3.0, ZA = 2.4, H = 2.44, GX = 0.6;
      const pt = ptOf(K);
      /* garden inside (context) */
      [[-1.4, -0.8], [1.4, -0.8], [-1.4, 1.0], [1.4, 1.0]].forEach(([x, z]) => {
        [-1, 1].forEach((k) => K.box(null, [1.8, 0.2, 0.038], cedarOf(K), [x, 0.1, z + k * 0.45], null, 0.004));
        [-1, 1].forEach((k) => K.box(null, [0.038, 0.2, 0.9], cedarOf(K), [x + k * 0.9, 0.1, z], null, 0.004));
        K.box(null, [1.76, 0.02, 0.86], soilOf(K, [2, 1]), [x, 0.18, z], null, 0);
        [-0.6, -0.2, 0.2, 0.6].forEach((dx) => K.glb(null, 'grass_medium_01', { node: 'grass_medium_01_mid_a_LOD0', height: 0.22 }, [x + dx, 0.19, z]) || K.sph(null, 0.08, leafMat(K), [x + dx, 0.25, z]));
      });
      const cornersXZ = [[-XA, -ZA], [XA, -ZA], [XA, ZA], [-XA, ZA]];
      const linesXZ = [[-1.5, -ZA], [0, -ZA], [1.5, -ZA], [-XA, -0.8], [-XA, 0.8], [XA, -0.8], [XA, 0.8], [-1.8, ZA], [1.8, ZA]];
      const gateXZ = [[-GX, ZA], [GX, ZA]];
      stakesAndLines(K, 'layout', 'Layout: 20 × 16 ft, diagonals equal', cornersXZ, 0.35);
      const holes = K.part('holes', [0, 0.004, 0], null, '10″ holes, 30–36″ deep');
      cornersXZ.concat(linesXZ, gateXZ).forEach(([x, z]) => K.cyl(holes, [0.13, 0.13, 0.006, 20], 'dark', [x, 0, z]));
      const post = (g, x, z, s) => {
        K.box(g, [s, H, s], pt, [x, H / 2, z], null, 0.006);
        K.cone(g, [0.14, 0.05, 20], K.std(0x9b9a94, { roughness: 1 }), [x, 0.02, z]);
      };
      const co = K.part('corners', [0, 0, 0], null, '6×6 corner posts, 10 ft (3 ft in concrete)');
      cornersXZ.forEach(([x, z]) => post(co, x, z, 0.14));
      const gp = K.part('gatePosts', [0, 0, 0], null, '6×6 gate posts + header');
      gateXZ.forEach(([x, z]) => post(gp, x, z, 0.14));
      K.box(gp, [2 * GX + 0.14, 0.14, 0.09], pt, [0, H - 0.07, ZA], null, 0.004);
      const po = K.part('posts', [0, 0, 0], null, '4×4 line posts, ≤ 8 ft apart');
      linesXZ.forEach(([x, z]) => post(po, x, z, 0.09));
      const br = K.part('braces', [0, 0, 0], null, 'H-braces at corners + gate (rail + diagonal wire)');
      const brace = (a, b) => {
        K.bar(br, [a[0], 1.3, a[1]], [b[0], 1.3, b[1]], 0.035, pt);
        K.bar(br, [a[0], 0.15, a[1]], [b[0], 1.25, b[1]], 0.004, galv(K));
        K.bar(br, [b[0], 0.15, b[1]], [a[0], 1.25, a[1]], 0.004, galv(K));
      };
      brace([-XA, -ZA], [-1.5, -ZA]);
      brace([XA, -ZA], [1.5, -ZA]);
      brace([-XA, -ZA], [-XA, -0.8]);
      brace([XA, -ZA], [XA, -0.8]);
      brace([-XA, ZA], [-XA, 0.8]);
      brace([XA, ZA], [XA, 0.8]);
      brace([-GX, ZA], [-1.8, ZA]);
      brace([GX, ZA], [1.8, ZA]);
      const tr = K.part('topRail', [0, H - 0.045, 0], null, '2×4 top rail (keeps posts aligned)');
      const runs = [[[-XA, -ZA], [XA, -ZA]], [[XA, -ZA], [XA, ZA]], [[-XA, ZA], [-XA, -ZA]], [[XA, ZA], [GX, ZA]], [[-GX, ZA], [-XA, ZA]]];
      runs.forEach(([a, b]) => K.bar(tr, [a[0], 0, a[1]], [b[0], 0, b[1]], 0.04, pt));
      const out = (a, b, d) => {
        // outward offset for a run
        const dx = b[0] - a[0], dz = b[1] - a[1];
        const L = Math.hypot(dx, dz);
        return [(dz / L) * d, (-dx / L) * d];
      };
      const tre = K.part('trench', [0, 0.003, 0], null, '6″ wide × 6″ deep trench outside the line');
      const ap = K.part('apron', [0, 0.008, 0], null, 'Buried L-apron: 12″ of mesh bent outward');
      const lm = K.part('lowerMesh', [0, 0, 0], null, '4 ft 1×2″ welded wire (critters)');
      const um = K.part('upperMesh', [0, 0, 0], null, 'Black poly deer mesh to 8 ft');
      const bf = K.part('backfill', [0, 0.01, 0], null, 'Backfilled, tamped trench');
      runs.forEach(([a, b]) => {
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const yaw = (Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI;
        const [ox, oz] = out(a, b, 1);
        const mid = (d, y) => [(a[0] + b[0]) / 2 + ox * d, y, (a[1] + b[1]) / 2 + oz * d];
        K.box(K.group(tre, mid(0.2, 0), [0, yaw, 0]), [L + 0.3, 0.006, 0.34], K.std(0x3e2e20, { roughness: 1 }), [0, 0, 0], null, 0);
        meshPanel(K, K.group(ap, mid(0.22, 0), [0, yaw, 0]), L, 0.3, 0.05, 0.025, '#9aa2a6', 0.12, [0, 0, 0], [-90, 0, 0]);
        meshPanel(K, K.group(lm, mid(0.06, 0.61), [0, yaw, 0]), L, 1.22, 0.05, 0.025, '#a9b1b5', 0.1, [0, 0, 0], [0, 0, 0]);
        meshPanel(K, K.group(um, mid(0.06, 1.22 + 0.61), [0, yaw, 0]), L, 1.22, 0.05, 0.05, '#141516', 0.07, [0, 0, 0], [0, 0, 0], { metalness: 0, roughness: 0.8 });
        K.box(K.group(bf, mid(0.22, 0), [0, yaw, 0]), [L + 0.3, 0.02, 0.36], soilOf(K, [L, 0.3]), [0, 0, 0], null, 0.004);
      });
      /* gate (hinged on the left gate post, swings inward) */
      const gate = K.part('gate', [-GX + 0.07, 0, ZA + 0.02], null, 'Full-height framed gate, hinges + latch');
      const gw = 2 * GX - 0.16, gh = H - 0.2;
      [0.02, gw - 0.02].forEach((x) => K.box(gate, [0.038, gh, 0.089], pt, [x + 0.01, 0.05 + gh / 2, 0], null, 0.003));
      [0.09, 0.05 + gh / 2, gh].forEach((y) => K.box(gate, [gw, 0.089, 0.038], pt, [gw / 2 + 0.01, y, 0], null, 0.003));
      K.bar(gate, [0.04, 0.12, 0], [gw - 0.02, 0.05 + gh / 2 - 0.05, 0], 0.025, pt);
      K.bar(gate, [0.04, 0.05 + gh / 2 + 0.05, 0], [gw - 0.02, gh - 0.05, 0], 0.025, pt);
      meshPanel(K, gate, gw, gh, 0.05, 0.025, '#a9b1b5', 0.1, [gw / 2 + 0.01, 0.05 + gh / 2, 0.05], [0, 0, 0]);
      [0.3, 1.2, 2.1].forEach((y) => K.box(gate, [0.2, 0.04, 0.006], blackMetal(K), [0.08, y, 0.048], null, 0.002));
      K.box(gate, [0.12, 0.03, 0.03], blackMetal(K), [gw - 0.03, 1.05, 0.06], null, 0.004);
      /* add-ons */
      const hw = K.part('aoHotWire', [0, 0, 0], null, 'Offset electric wire + solar charger');
      runs.forEach(([a, b]) => {
        const [ox, oz] = out(a, b, 0.6);
        K.bar(hw, [a[0] + ox, 0.75, a[1] + oz], [b[0] + ox, 0.75, b[1] + oz], 0.002, K.std(0xd9d9d9, { metalness: 0.8 }));
        const n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.6));
        for (let i = 0; i <= n; i++) {
          const x = a[0] + ((b[0] - a[0]) * i) / n + ox, z = a[1] + ((b[1] - a[1]) * i) / n + oz;
          K.cyl(hw, [0.006, 0.006, 0.85, 6], 'white', [x, 0.42, z]);
          K.box(hw, [0.025, 0.03, 0.02], 'yellow', [x, 0.75, z], null, 0.004);
        }
      });
      K.box(hw, [0.2, 0.24, 0.12], K.std(0x2a2c2f, { roughness: 0.5 }), [XA + 0.9, 0.7, ZA + 0.3], null, 0.01);
      K.box(hw, [0.26, 0.01, 0.2], K.std(0x1d2a44, { metalness: 0.3, roughness: 0.2 }), [XA + 0.9, 0.86, ZA + 0.3], [-30, 0, 0], 0.003);
      K.cyl(hw, [0.012, 0.012, 0.6, 8], galv(K), [XA + 0.9, 0.3, ZA + 0.3]);
      const arb = K.part('aoArbor', [0, H, ZA], null, 'Cedar arbor over the gate');
      const ced = cedarOf(K);
      [-1, 1].forEach((s) => K.box(arb, [0.038, 0.19, 1.2], ced, [s * (GX + 0.12), 0.1, 0], null, 0.003));
      K.rep(7, (i) => K.box(arb, [2 * GX + 0.6, 0.06, 0.038], ced, [0, 0.22, -0.45 + i * 0.15], null, 0.003));
      const caps = K.part('aoCaps', [0, H + 0.01, 0], null, 'Solar post-cap lights');
      cornersXZ.concat(gateXZ).forEach(([x, z]) => {
        K.box(caps, [0.17, 0.05, 0.17], blackMetal(K), [x, 0.025, z], null, 0.006);
        K.box(caps, [0.11, 0.07, 0.11], glow(K, 0xfff1cc, 1.3), [x, 0.085, z], null, 0.006);
        K.box(caps, [0.15, 0.015, 0.15], K.std(0x1d2a44, { metalness: 0.3, roughness: 0.2 }), [x, 0.128, z], null, 0.003);
      });
      const cl = K.part('aoCloser', [0, 0, 0], null, 'Gate spring closer + drop rod');
      K.bar(cl, [-GX + 0.08, 1.6, ZA - 0.06], [-GX + 0.5, 1.4, ZA - 0.03], 0.012, K.std(0x2a2c2f, { metalness: 0.6 }));
      K.cyl(cl, [0.008, 0.008, 0.5, 8], blackMetal(K), [GX - 0.25, 0.25, ZA + 0.08]);
      const fl = K.part('aoFlags', [0, 0, 0], null, 'White flagging tape (deer see the fence)');
      const flag = K.std(0xf8f8f4, { roughness: 0.8, side: K.THREE.DoubleSide });
      runs.forEach(([a, b]) => {
        const [ox, oz] = out(a, b, 0.08);
        const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.9);
        for (let i = 1; i < n; i++) {
          const x = a[0] + ((b[0] - a[0]) * i) / n + ox, z = a[1] + ((b[1] - a[1]) * i) / n + oz;
          K.box(fl, [0.03, 0.35, 0.003], flag, [x, 1.7 - (i % 2) * 0.5, z], [0, (Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI, 8], 0);
        }
      });
      return {};
    }
  );

  /* ===================== Guides ===================== */
  const compost = {
    id: 'compost-bins',
    title: 'Build a three-bin compost system',
    model: 'compostBins',
    level: 2,
    time: '1 weekend',
    cost: '$250–450',
    summary: 'A 9½ ft cedar three-bay composter: fill the left bin, turn it into the middle bin to cook, and sift finished compost from the right. Removable front boards make turning easy, and a hardware-cloth floor keeps rodents out.',
    intro: { show: ['floor', 'postsBack', 'back', 'postsFront', 'ends', 'dividers', 'guides', 'fronts', 'compost'], preview: true, spin: true },
    safety: ['Use untreated cedar or other rot-resistant wood. Pressure-treated wood is fine for posts set in the ground, but keep it out of contact with compost you’ll use on food crops if you want to avoid it entirely.', 'Wear gloves and safety glasses when cutting hardware cloth; the cut wire ends are sharp.', 'Check local rules: some towns require bins to be covered, rodent-proof and a set distance from property lines.'],
    causes: [['Pick the spot', 'Level, well-drained, part shade, and close enough to the kitchen and garden that you’ll actually use it. Leave 3 ft in front for a wheelbarrow.'], ['Size it', 'Each bay is about 3×3×3 ft (1 cubic yard). That’s the smallest pile that holds heat well.'], ['Plan the flow', 'Left bay: new material. Middle: turned and cooking. Right: finished, curing and ready to sift.']],
    tools: ['Tape measure, string line & stakes', 'Circular saw or miter saw', 'Drill/driver + 3″ exterior screws', '4 ft level & speed square', 'Tin snips + staple gun (hardware cloth)', '8 cedar 4×4s (36″), ~30 cedar 1×6s, 2×2 guide strips', '½″ hardware cloth (3×10 ft)', 'Gloves & safety glasses'],
    steps: [
      { t: 'Level the site and lay out', d: 'Strip the sod over a 10×3½ ft area, rake it level and stake out a 9½×3 ft rectangle. Check that both diagonals match.', why: 'A level, square base means the front boards slide freely and the bays stay the same size.', v: { cam: [2.6, 2.3, 3.2], at: [0, 0.1, 0], hi: ['site', 'layout'], show: ['site', 'layout'], tool: { id: 'tape', at: [1.45, 0.3, 0.5], rot: [0, 0, 0], scale: 1.4 } } },
      { t: 'Lay the hardware-cloth floor', d: 'Roll out ½″ hardware cloth over the whole footprint and pin it flat. Overlap seams 4″.', why: 'Rats and voles tunnel up into warm compost. Galvanized ½″ mesh stops them but lets worms and water through.', tip: 'Fold the edges up 2–3″ so they can be stapled to the bottom boards later.', v: { cam: [2.4, 2.2, 2.8], at: [0, 0, 0], hi: ['floor'], show: ['floor'], hide: ['layout'], tool: { id: 'gloves', at: [0.6, 0.05, 0.3], rot: [0, 0, 0] } } },
      { t: 'Build the back wall', d: 'Lay four 4×4 posts on the ground 3 ft on center and screw 1×6 slats across them with 1″ gaps, two 3″ screws per post. Stand it up at the back edge.', why: 'Building the wall flat on the ground is faster and keeps it square. The gaps let air into the pile.', v: { cam: [2.2, 1.8, 2.8], at: [0, 0.5, -0.4], hi: ['postsBack', 'back'], show: ['postsBack', 'back'], tool: { id: 'drill', at: [0.47, 0.55, -0.5], rot: [-90, 0, 0], anim: 'spin', scale: 1.2 } } },
      { t: 'Add the front posts, ends and dividers', d: 'Set the four front posts, then screw slats from back post to front post for the two end walls and the two dividers.', why: 'Dividers are what turn one big box into three working bays, and they brace the whole structure.', v: { cam: [2.9, 2.0, 2.6], at: [0, 0.5, 0], hi: ['postsFront', 'ends', 'dividers'], show: ['postsFront', 'ends', 'dividers'], tool: { id: 'drill', at: [1.475, 0.45, 0.2], rot: [0, 0, -90], anim: 'spin', scale: 1.2 } } },
      { t: 'Square and level it', d: 'Check the diagonals of each bay and plumb the front posts. Shim or dig under posts until the top is level end to end.', why: 'If the front posts lean even ½″, the removable boards will bind in their channels.', v: { cam: [2.6, 1.6, 2.6], at: [0.9, 0.5, 0.4], hi: ['postsFront'], tool: { id: 'level', at: [1.41, 0.6, 0.48], rot: [0, 0, 90], scale: 1.3 } } },
      { t: 'Screw on the slat guides', d: 'Fasten 2×2 strips to the inside faces of the front posts, leaving a ⅞″ slot between strip and post for the boards.', why: 'The channel holds the front boards in place but lets you lift them out one at a time.', tip: 'Use a spare 1×6 as a spacer while you screw the strips on, then add ⅛″ of play.', v: { cam: [1.6, 1.2, 1.9], at: [0.47, 0.5, 0.4], hi: ['guides'], show: ['guides'], tool: { id: 'drill', at: [0.53, 0.7, 0.32], rot: [0, 0, 90], anim: 'spin', scale: 1.1 } } },
      { t: 'Cut and fit the front boards', d: 'Cut 1×6 boards ½″ shorter than the post-to-post opening and drop them into the channels. Leave the right bay low for easy access.', why: 'Removable fronts let you fork compost from bin to bin at any height instead of lifting it over a wall.', v: { cam: [2.4, 1.6, 2.8], at: [0, 0.4, 0.4], hi: ['fronts'], show: ['fronts'], tool: { id: 'handsaw', at: [-0.94, 0.95, 0.45], rot: [0, 0, 0], anim: 'slide', scale: 1.1 } } },
      { t: 'Load and turn', d: 'Build the first pile in the left bay, about 3 parts browns to 1 part greens, damp as a wrung-out sponge. When it heats and drops, fork it into the middle bay.', why: 'Turning adds oxygen. A good pile reaches 130–160°F, which kills most weed seeds and pathogens.', v: { cam: [1.6, 2.7, 2.4], at: [0, 0.3, 0], hi: ['compost'], show: ['compost'], fx: 'hot', tool: { id: 'shovel', at: [-0.8, 0.62, 0.05], rot: [-25, 0, 20], anim: 'push' } } },
    ],
    learn: {
      how: 'Compost microbes need carbon (browns: leaves, straw, cardboard), nitrogen (greens: kitchen scraps, grass clippings), water and air. A cubic-yard pile is big enough to hold the heat they make. Three bays let you keep a new pile, an active pile and a finished pile going at once, so you always have compost ready while new material keeps coming.',
      specs: [['Bay size', '3×3×3 ft (≈ 1 cu yd)'], ['Brown : green', '≈ 3 : 1 by volume'], ['Moisture', 'Wrung-out sponge'], ['Hot pile temp', '130–160°F'], ['Turn', 'Every 1–2 weeks while hot'], ['Finished in', '2–4 months (hot) / 6–12 (cold)']],
      terms: [['Browns', 'Dry, carbon-rich material.'], ['Greens', 'Fresh, nitrogen-rich material.'], ['Curing', 'The last weeks when finished compost stabilizes.'], ['Hardware cloth', 'Welded galvanized wire mesh, here ½″ openings.']],
      mistakes: ['Bays too small to heat up.', 'Solid walls with no air gaps.', 'Adding meat, dairy or oils (draws pests).', 'Letting the pile dry out in summer.'],
      tips: ['Keep a pile of shredded leaves beside the bins to cover every load of scraps.', 'A long-stem thermometer tells you when to turn: when the temperature falls, it’s time.'],
    },
    pro: 'Rarely needed. Talk to your town or extension office if you’re composting near a well, a stream or a property line with setback rules.',
    addons: [
      { id: 'lids', part: 'aoLids', name: 'Hinged lids', cat: 'Garden', blurb: 'Clear-panel lids keep rain from leaching nutrients and hold heat in.', cost: [90, 200], how: 'Build 2×2 cedar frames the size of each bay, screw corrugated polycarbonate on top, and hinge them to the back wall.', needs: ['Cedar 2×2', 'Corrugated polycarbonate panel', 'Strap hinges'], shop: 'Corrugated polycarbonate panel' },
      { id: 'thermo', part: 'aoThermo', name: 'Compost thermometer', cat: 'Garden', blurb: '20″ stem dial shows when the pile is cooking and when to turn.', cost: [15, 35], how: 'Push it into the center of the middle pile and check it every few days.', needs: ['20″ compost thermometer'], shop: 'Compost thermometer 20 inch' },
      { id: 'rack', part: 'aoRack', name: 'Tool rack', cat: 'Finish', blurb: 'Pitchfork and compost aerator on the end wall.', cost: [40, 110], how: 'Screw two cedar cleats to the end wall and hang the tools between them so they’re always at hand.', needs: ['Cedar cleats', 'Garden fork', 'Compost aerator'], shop: 'Compost aerator tool' },
      { id: 'sifter', part: 'aoSifter', name: 'Compost sifter', cat: 'Garden', blurb: '½″ screen that rides on the walls of the finished bay.', cost: [25, 60], how: 'Staple hardware cloth to a 2×2 frame sized to rest on top of the bay walls. Shovel compost on and rub it through.', needs: ['Hardware cloth ½″', 'Cedar 2×2', 'Staples'], shop: 'Compost sifter screen' },
      { id: 'caddy', part: 'aoCaddy', name: 'Kitchen caddy', cat: 'Comfort', blurb: 'Lidded scrap pail with a charcoal filter.', cost: [20, 45], how: 'Keep it by the sink and empty it every few days, burying each load under browns.', needs: ['Countertop compost pail'], shop: 'Kitchen compost bin with lid' },
    ],
  };
  compost.variants = [
    { id: 'three-bin', name: 'Three-bin cedar system', blurb: 'Hot-compost a cubic yard at a time with removable front boards.' },
    {
      id: 'tumbler',
      name: 'Barrel tumbler',
      blurb: 'A 55-gal drum on a 2×4 A-frame. Small, tidy and turned with one hand.',
      level: 2,
      time: '4–6 hours',
      cost: '$60–150',
      model: 'compostTumbler',
      summary: 'A food-grade 55-gallon drum on a steel-pipe axle and a 2×4 A-frame. A few spins every couple of days mixes and aerates the batch, and the closed drum keeps pests out. Good for small yards and kitchen scraps.',
      intro: { show: ['drum', 'holes', 'hatch', 'legs', 'rails', 'axle'], preview: true, spin: true },
      causes: [['Get a food-grade drum', 'Blue HDPE drums that held food or syrup. Skip drums that held chemicals.'], ['Batch, don’t trickle', 'Fill it in one or two weeks, then let that batch finish while scraps go to a second drum or bin.'], ['Place it near the kitchen', 'On level ground, with room to swing the hatch open over a wheelbarrow.']],
      tools: ['55-gal food-grade drum', 'Drill + ½″ bit + 1¼″ spade bit/hole saw', 'Jigsaw', '1″ galvanized pipe (5 ft) + 2 floor flanges', 'Five 8 ft 2×4s + 3″ exterior screws', '2 hinges, hasp, ¼″ bolts', 'Tape, marker, speed square', 'Safety glasses'],
      steps: [
        { t: 'Clean the drum', d: 'Rinse out the food-grade drum and lay it on its side. Mark the centers of both ends.', why: 'The axle must pass through the exact center or the drum will lurch and wobble every time you spin it.', v: { cam: [1.6, 1.3, 2.0], at: [0, 0.8, 0], hi: ['drum'], show: ['drum'], tool: { id: 'tape', at: [0.44, 0.82, 0.0], rot: [0, 90, 0], scale: 1.2 } } },
        { t: 'Drill aeration holes', d: 'Drill ½″ holes in rings every 6″, about 4–6″ apart around the drum, plus a dozen in the low side for drainage.', why: 'Microbes need oxygen. Without holes a sealed drum goes anaerobic and smells.', v: { cam: [1.4, 1.2, 1.7], at: [0, 0.8, 0], hi: ['holes'], show: ['holes'], tool: { id: 'drill', at: [0.36, 0.82, 0.32], rot: [90, 0, 0], anim: 'spin', scale: 1.1 } } },
        { t: 'Mark and cut the hatch', d: 'Mark a 12×14″ door on the side. Drill a starter hole and cut three sides with a jigsaw, then the hinge side.', why: 'Cutting the hinge side last keeps the panel in place so your cut lines stay straight.', v: { cam: [1.2, 1.5, 1.5], at: [0, 1.0, 0.1], hi: ['hatchCut'], show: ['hatchCut'], tool: { id: 'handsaw', at: [0.18, 1.08, 0.12], rot: [0, 90, 0], anim: 'slide', scale: 0.9 } } },
        { t: 'Mount hinges and latch', d: 'Bolt two hinges and a hasp to the cut door with ¼″ bolts and fender washers on the inside.', why: 'Bolts with washers don’t pull through the plastic the way screws do once the drum is full and heavy.', v: { cam: [1.1, 1.5, 1.4], at: [0, 1.0, 0.1], hi: ['hatch'], show: ['hatch'], hide: ['hatchCut'], tool: { id: 'screwdriver', at: [0.11, 1.12, 0.12], rot: [-60, 0, 0], anim: 'turn' } } },
        { t: 'Build the A-frames', d: 'Cut four 2×4 legs at 42″ with angled ends and screw them in pairs to a top block so the axle notch sits about 32″ high.', why: 'The A shape spreads the load wide so a full drum (150+ lb) can’t tip the stand.', v: { cam: [1.8, 1.3, 2.2], at: [0, 0.5, 0], hi: ['legs'], show: ['legs'], tool: { id: 'drill', at: [0.5, 0.89, 0.12], rot: [90, 0, 0], anim: 'spin', scale: 1.1 } } },
        { t: 'Brace the frames', d: 'Join the two A-frames with long 2×4 rails front and back, plus spreaders at the bottom.', why: 'Cross rails stop the frames from racking when you spin the drum.', v: { cam: [1.8, 1.1, 2.0], at: [0, 0.3, 0], hi: ['rails'], show: ['rails'], tool: { id: 'drill', at: [0.2, 0.33, 0.33], rot: [90, 0, 0], anim: 'spin', scale: 1.1 } } },
        { t: 'Fit the axle', d: 'Bore 1¼″ holes in the drum ends, slide the 1″ pipe through, and bolt floor flanges to each end so the drum turns with the pipe. Drop it in the notches.', why: 'Flanges lock the pipe to the drum so the barrel rotates instead of sliding around the pipe.', v: { cam: [1.6, 1.2, 1.4], at: [0.35, 0.82, 0], hi: ['axle'], show: ['axle'], tool: { id: 'adjWrench', at: [0.46, 0.84, 0.05], rot: [0, 0, 90], anim: 'turn' } } },
        { t: 'Fill and spin', d: 'Fill half full with a mix of browns and greens, latch the door and spin 5–6 turns every two or three days.', why: 'A half-full drum tumbles the mix. A full one just slides around and stays compacted.', v: { cam: [1.8, 1.4, 2.2], at: [0, 0.7, 0], hi: ['contents', 'drum'], show: ['contents'], xray: true, fx: 'spin' } },
      ],
      learn: {
        how: 'A tumbler is a closed batch composter. Turning the drum mixes and aerates in seconds, and the dark drum warms in the sun. Batches finish in 4–8 weeks in summer if moisture and the brown-to-green mix are right. Because it’s closed, it keeps rodents and dogs out, which makes it a good fit for small yards.',
        specs: [['Drum', '55 gal food-grade HDPE'], ['Axle height', '≈ 32″'], ['Fill level', '½–⅔ full'], ['Turn', '5–6 spins every 2–3 days'], ['Batch time', '4–8 weeks (warm weather)']],
        terms: [['Batch composting', 'Fill once, then let it finish without adding more.'], ['Floor flange', 'Threaded plate that bolts the pipe to the drum end.']],
        mistakes: ['Overfilling, so it can’t tumble.', 'All greens (gets slimy and smells). Add shredded cardboard.', 'Too few holes.'],
        tips: ['Build two drums: one filling, one finishing.', 'Shred everything small; tumblers work fastest on small pieces.'],
      },
      addons: [
        { id: 'tray', part: 'aoTray', name: 'Catch tray', cat: 'Garden', blurb: 'A tote under the drum catches finished compost and drained liquid.', cost: [15, 40], how: 'Slide a low tote between the legs, open the hatch at the bottom and dump.', needs: ['Low storage tote'], shop: 'Under bed storage tote' },
        { id: 'handles', part: 'aoHandles', name: 'Grab handles', cat: 'Comfort', blurb: 'Three bolt-on handles make spinning easier.', cost: [12, 30], how: 'Bolt plastic gate pulls around one end with washers inside.', needs: ['3 gate pulls', '¼″ bolts + washers'], shop: 'Plastic gate pull handle' },
        { id: 'thermo', part: 'aoThermo', name: 'Compost thermometer', cat: 'Garden', blurb: 'Dial stem through a vent hole.', cost: [15, 35], how: 'Slide it in through a top hole and read it before you spin.', needs: ['Compost thermometer'], shop: 'Compost thermometer' },
        { id: 'caddy', part: 'aoCaddy', name: 'Kitchen caddy', cat: 'Comfort', blurb: 'Collect scraps between loads.', cost: [20, 45], how: 'Empty it into the drum every few days with a handful of browns.', needs: ['Countertop compost pail'], shop: 'Kitchen compost bin with lid' },
      ],
    },
  ];

  const rain = {
    id: 'rain-barrels',
    title: 'Install linked rain barrels',
    model: 'rainBarrels',
    level: 2,
    time: '3–5 hours',
    cost: '$180–400',
    summary: 'Two 55-gallon barrels on a block stand, fed by a downspout diverter, linked at the bottom so they fill together, with an overflow that sends extra water away from the foundation. Each 1″ of rain on 500 sq ft of roof is about 300 gallons.',
    intro: { show: ['pad', 'stand', 'stand2', 'barrel1', 'barrel2', 'spigot1', 'spigot2', 'screen', 'diverter', 'link', 'overflow'], hide: ['dsCut'], preview: true, spin: true },
    safety: ['Check local rules: most states allow rain barrels, but a few limit capacity or use.', 'Use only food-grade barrels and keep a tight lid or screen on every opening. Standing water breeds mosquitoes in days, and an open barrel is a drowning hazard for small children and pets.', 'A full 55-gal barrel weighs about 460 lb. Build the stand on firm, level ground.', 'Use the water for gardens and lawns, not for drinking.'],
    causes: [['Pick the downspout', 'One that drains a big roof area and is close to the garden.'], ['Size the system', 'Roof sq ft × rain (in) × 0.62 = gallons. Most roofs overfill one barrel in a single storm.'], ['Plan the overflow', 'It must discharge at least 6–10 ft from the foundation, on a splash block or into a bed.']],
    tools: ['Two 55-gal food-grade barrels', 'Downspout diverter kit', 'Spigot + bulkhead kits (2)', 'Linking kit or ¾″ hose + fittings', '1½″ overflow fitting + hose', '12 concrete blocks + 2 pavers', 'Gravel (3–4 bags) + hand tamper', 'Drill, hole saws (to 2″), hacksaw', '4 ft level, tape, marker', 'Teflon tape, silicone'],
    steps: [
      { t: 'Level a gravel pad', d: 'Dig out 4″ under the stand area, fill with gravel in two lifts and tamp until firm and level.', why: 'Barrels hold almost 500 lb each. Soft or sloped ground lets the stack settle and tip.', v: { cam: [2.2, 1.8, 2.8], at: [0.8, 0.2, 0], hi: ['pad'], show: ['pad', 'dsCut'], tool: { id: 'level', at: [0.77, 0.05, 0.02], rot: [0, 0, 0], scale: 1.4 } } },
      { t: 'Stack the block stands', d: 'Lay two courses of concrete blocks under each barrel, cores vertical, and cap each stack with a paver. Level both directions.', why: 'Raising the barrels 16″ fits a watering can under the spigot and adds gravity pressure for a hose.', v: { cam: [2.0, 1.4, 2.6], at: [0.8, 0.3, 0], hi: ['stand', 'stand2'], show: ['stand', 'stand2'], tool: { id: 'level', at: [0.42, 0.45, 0.02], rot: [0, 90, 0], scale: 1.2 } } },
      { t: 'Fit spigots and ports', d: 'Drill each barrel for a bulkhead spigot 3″ above the base, a linking port near the bottom on the side, and an overflow port 4″ below the top on barrel #2. Seal with the gaskets and Teflon tape.', why: 'Bulkhead fittings clamp both sides of the wall, so they don’t leak like a fitting screwed into plastic.', v: { cam: [1.9, 1.3, 2.2], at: [0.8, 0.7, 0.2], hi: ['barrel1', 'barrel2', 'spigot1', 'spigot2'], show: ['barrel1', 'barrel2', 'spigot1', 'spigot2'], tool: { id: 'drill', at: [0.42, 0.56, 0.38], rot: [90, 0, 0], anim: 'spin' } } },
      { t: 'Mark the downspout', d: 'Set barrel #1 in place and mark the downspout just above the barrel top. The diverter must sit higher than the inlet.', why: 'Water only flows downhill. If the diverter is lower than the inlet, the barrel never fills.', v: { cam: [1.1, 1.6, 1.6], at: [0, 1.35, -0.2], hi: ['marks'], show: ['marks'], tool: { id: 'tape', at: [-0.06, 1.3, -0.24], rot: [0, 0, 90], scale: 1.1 } } },
      { t: 'Cut in the diverter', d: 'Cut out the marked section with a hacksaw, insert the diverter, and run its fill hose to the inlet on barrel #1.', why: 'A diverter fills the barrel until it’s full, then sends water back down the downspout, so it can’t overflow at the house.', v: { cam: [1.2, 1.7, 1.8], at: [0.1, 1.35, -0.1], hi: ['diverter'], show: ['diverter'], hide: ['dsCut', 'marks'], tool: { id: 'handsaw', at: [-0.12, 1.3, -0.22], rot: [0, 90, 90], anim: 'slide', scale: 0.8 } } },
      { t: 'Screen the inlet', d: 'Fit the screened inlet basket on barrel #1 and seal every other opening with caps or fine mesh.', why: 'Mosquitoes can breed in any opening bigger than 1/16″. Screens also keep leaves out.', v: { cam: [1.0, 2.0, 1.2], at: [0.4, 1.3, 0], hi: ['screen'], show: ['screen'] } },
      { t: 'Link the barrels', d: 'Connect the bottom ports of the two barrels with the linking hose and hose clamps.', why: 'Linked low, the barrels share water and fill and drain at the same level, so both spigots work.', v: { cam: [1.3, 1.0, 1.9], at: [0.78, 0.6, 0], hi: ['link'], show: ['link'], tool: { id: 'flatScrewdriver', at: [0.74, 0.62, 0.05], rot: [0, 0, 90], anim: 'turn' } } },
      { t: 'Run the overflow', d: 'Attach a 1½″ hose to the overflow port on barrel #2 and run it to a splash block or a bed 6–10 ft from the house.', why: 'In a big storm the diverter may still pass water. The overflow keeps it away from your foundation.', v: { cam: [2.6, 1.6, 2.6], at: [1.3, 0.6, 0.3], hi: ['overflow'], show: ['overflow'] } },
      { t: 'Test in the rain', d: 'In the first storm, check every fitting for leaks and watch that the overflow runs freely. Fill a watering can from the spigot.', why: 'Small leaks are easy to fix with silicone while the barrels are empty. They’re hard to fix once they’re full.', v: { cam: [2.4, 1.9, 3.4], at: [0.55, 0.9, 0], hi: ['spigot1', 'barrel1'], fx: 'water', tool: { id: 'wateringCan', at: [0.42, 0.04, 0.42], rot: [0, -90, 0], scale: 1.0 } } },
    ],
    learn: {
      how: 'Gutters collect water from the whole roof and send it down a few downspouts. A diverter sits inside the downspout and peels off part of that flow through a hose into the barrel. When the barrel is full, water backs up in the hose and the diverter lets the rest go down the downspout. Linking at the bottom joins the barrels into one big tank, and the spigots use gravity pressure, about 0.43 psi per foot of water.',
      specs: [['Barrel', '50–55 gal, food-grade, opaque'], ['Stand height', '12–18″'], ['Overflow', '1½–2″, 4″ below the top'], ['Harvest', '≈ 0.62 gal per sq ft per inch of rain'], ['Discharge', '6–10 ft from the foundation']],
      terms: [['Diverter', 'Fitting in the downspout that sends water to the barrel until it’s full.'], ['Bulkhead fitting', 'Through-wall fitting clamped with a nut and gaskets.'], ['First flush', 'The dirty first water off a roof; some systems divert it away.']],
      mistakes: ['Diverter set lower than the barrel inlet.', 'Clear barrels (algae grows in light).', 'Unscreened openings (mosquitoes).', 'Overflow dumping against the foundation.'],
      tips: ['Drain the barrels and leave the spigots open before freezing weather, or bypass the diverter for winter.', 'Use a soaker hose; drip emitters often need more pressure than a barrel gives.'],
    },
    pro: 'You want a large cistern, a pump-pressurized system, or a connection to irrigation or indoor plumbing (needs a backflow device and often a permit).',
    addons: [
      { id: 'soaker', part: 'aoSoaker', name: 'Soaker hose to a bed', cat: 'Garden', blurb: 'Gravity-fed soaker hose waters a nearby bed slowly.', cost: [20, 50], how: 'Connect a short garden hose from the spigot to a soaker hose snaked through the bed. Open the spigot and let it seep.', needs: ['Soaker hose', 'Short garden hose'], shop: 'Soaker hose 25 ft' },
      { id: 'pump', part: 'aoPump', name: 'Solar barrel pump', cat: 'Tech', blurb: 'Boosts pressure for a hose or sprinkler.', cost: [60, 150], how: 'Drop the pump in barrel #2 and set the panel where it gets sun. Don’t let it run dry.', needs: ['Solar submersible pump kit'], shop: 'Solar rain barrel pump' },
      { id: 'gauge', part: 'aoGauge', name: 'Level gauge', cat: 'Tech', blurb: 'Float gauge shows how much water is left.', cost: [15, 35], how: 'Drill the lid for the gauge tube and seal around it.', needs: ['Rain barrel float gauge'], shop: 'Water tank float level gauge' },
      { id: 'guard', part: 'aoGuard', name: 'Gutter guard', cat: 'Finish', blurb: 'Keeps leaves out of the gutter and the barrels.', cost: [60, 200], how: 'Snap mesh guards into the gutter and drop a strainer into the downspout opening.', needs: ['Gutter guard mesh', 'Downspout strainer'], shop: 'Gutter guard mesh' },
      { id: 'plants', part: 'aoPlants', name: 'Shrubs and pots', cat: 'Garden', blurb: 'Softens the stand and uses the overflow.', cost: [40, 150], how: 'Plant moisture-loving shrubs where the overflow drains.', needs: ['Shrubs', 'Pots'], shop: 'Shrubs for wet areas' },
    ],
  };
  rain.variants = [
    { id: 'linked', name: 'Two linked barrels', blurb: 'About 110 gallons that fill and drain together.' },
    {
      id: 'single',
      name: 'Single barrel',
      blurb: 'One barrel, one stand, an overflow. A good first system.',
      level: 1,
      time: '2–3 hours',
      cost: '$90–200',
      summary: 'One 55-gallon barrel on a block stand with a downspout diverter, a brass spigot and a 1½″ overflow. You can add a second barrel later with a linking kit.',
      intro: { show: ['pad', 'stand', 'barrel1', 'spigot1', 'screen', 'diverter', 'overflow1'], hide: ['dsCut'], preview: true, spin: true },
      tools: ['55-gal food-grade barrel', 'Downspout diverter kit', 'Spigot + bulkhead kit', '1½″ overflow fitting + hose', '6 concrete blocks + paver', 'Gravel + hand tamper', 'Drill, hole saw, hacksaw', 'Level, tape, Teflon tape'],
      steps: [
        { t: 'Level a gravel pad', d: 'Dig out 4″, fill with gravel and tamp it firm and level.', why: 'A full barrel weighs about 460 lb. Soft ground lets it settle and tip.', v: { cam: [2.0, 1.6, 2.4], at: [0.5, 0.2, 0], hi: ['pad'], show: ['pad', 'dsCut'], tool: { id: 'level', at: [0.42, 0.05, 0.02], rot: [0, 0, 0], scale: 1.4 } } },
        { t: 'Stack the stand', d: 'Two courses of blocks, cores up, with a paver cap. Level both ways.', why: 'Height adds pressure and fits a watering can under the spigot.', v: { cam: [1.8, 1.3, 2.2], at: [0.42, 0.3, 0], hi: ['stand'], show: ['stand'], tool: { id: 'level', at: [0.42, 0.45, 0.02], rot: [0, 90, 0], scale: 1.2 } } },
        { t: 'Fit the spigot and overflow', d: 'Drill and install a bulkhead spigot 3″ above the base and an overflow port 4″ below the top.', why: 'Bulkhead fittings clamp both sides of the wall so they don’t leak.', v: { cam: [1.7, 1.3, 2.0], at: [0.42, 0.8, 0.2], hi: ['barrel1', 'spigot1'], show: ['barrel1', 'spigot1'], tool: { id: 'drill', at: [0.42, 0.56, 0.38], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Cut in the diverter', d: 'Mark the downspout just above the barrel top, cut out the section and fit the diverter. Run the fill hose to the screened inlet.', why: 'The diverter must sit above the inlet, and it sends water back down the downspout once the barrel is full.', v: { cam: [1.2, 1.7, 1.8], at: [0.1, 1.35, -0.1], hi: ['diverter', 'screen'], show: ['diverter', 'screen'], hide: ['dsCut'], tool: { id: 'handsaw', at: [-0.12, 1.3, -0.22], rot: [0, 90, 90], anim: 'slide', scale: 0.8 } } },
        { t: 'Run the overflow', d: 'Run a 1½″ hose from the overflow to a splash block 6 ft or more from the house.', why: 'Keeps storm water away from the foundation.', v: { cam: [2.2, 1.5, 2.4], at: [0.8, 0.5, 0.3], hi: ['overflow1'], show: ['overflow1'] } },
        { t: 'Test it', d: 'After the first rain, check for leaks and fill a watering can.', why: 'Fix leaks with silicone while the barrel is still empty.', v: { cam: [2.0, 1.6, 2.6], at: [0.42, 0.8, 0], hi: ['spigot1'], fx: 'water', tool: { id: 'wateringCan', at: [0.42, 0.04, 0.42], rot: [0, -90, 0], scale: 1.0 } } },
      ],
      addons: rain.addons.filter((a) => a.id !== 'soaker' && a.id !== 'pump'),
    },
  ];

  const coldFrame = {
    id: 'cold-frame',
    title: 'Build a cedar cold frame',
    model: 'coldFrame',
    level: 2,
    time: '1 day',
    cost: '$180–350',
    summary: 'A 3×6 ft cedar box, 18″ at the back and 12″ at the front, with two hinged twin-wall polycarbonate lids facing south. A wax-cylinder opener vents it on sunny days, so you can grow greens 6–8 weeks earlier in spring and later into fall.',
    intro: { show: ['backWall', 'frontWall', 'sides', 'cleats', 'rafter', 'seal', 'lidL', 'lidR', 'hinges', 'opener', 'soil', 'plants'], preview: true, spin: true },
    safety: ['Polycarbonate edges are sharp after cutting. Wear gloves and eye protection.', 'Prop or latch lids open in wind. A gust can slam a lid shut on hands.', 'On a sunny day a closed cold frame can top 100°F in an hour and cook seedlings. Always have a way to vent it.'],
    causes: [['Face it south', 'Slope toward the low winter sun. A wall or fence behind it blocks north wind.'], ['Size the lids', 'Each lid about 3×3 ft: light enough to lift, big enough to reach under.'], ['Pick the glazing', '8 mm twin-wall polycarbonate insulates better than glass and won’t shatter.']],
    tools: ['Cedar 2×10, 2×8, 2×12 (or 2×6s stacked)', 'Cedar 2×2 (cleats + lid frames)', '8 mm twin-wall polycarbonate (2 pieces)', 'Circular saw + straightedge', 'Drill/driver, 2½″ & 1¼″ exterior screws', 'Polycarbonate screws with washers + U-channel tape', '4 strap hinges, 2 handles', 'Automatic vent opener', 'Foam weatherstrip', 'Tape, speed square, level'],
    steps: [
      { t: 'Prepare the site', d: 'Pick a sunny, south-facing spot, loosen the soil and level a 3×6 ft area.', why: 'A level base lets the lids seal tight on all four sides, which keeps the heat in on cold nights.', v: { cam: [1.9, 1.6, 2.3], at: [0, 0.1, 0], hi: ['site'], show: ['site'], tool: { id: 'shovel', at: [0.7, 0.02, 0.4], rot: [10, 40, -15], anim: 'push' } } },
      { t: 'Cut the back and front walls', d: 'Cut the back wall from a 2×10 and a 2×8 stacked to 18″, and the front wall from a 2×12 ripped to 12″. Both 6 ft long.', why: 'The 6″ height difference gives the lids a slope of about 10°, so rain runs off and low sun hits the glazing more squarely.', v: { cam: [2.0, 1.4, 2.2], at: [0, 0.2, 0], hi: ['backWall', 'frontWall'], show: ['backWall', 'frontWall'], tool: { id: 'handsaw', at: [0.9, 0.3, 0.45], rot: [0, 0, 0], anim: 'slide' } } },
      { t: 'Cut the tapered sides', d: 'Snap a line from 18″ at the back to 12″ at the front on two 3 ft pieces and cut the tapers.', why: 'Matching tapers on both sides keep the lids flat. A twisted top leaves gaps that leak heat.', v: { cam: [2.4, 1.2, 1.4], at: [0.9, 0.2, 0], hi: ['sides'], show: ['sides'], tool: { id: 'tape', at: [0.92, 0.38, 0.0], rot: [90, 0, 0], scale: 1.2 } } },
      { t: 'Screw the box together', d: 'Set 2×2 cleats in each inside corner and screw the walls to them with 2½″ exterior screws. Check the diagonals.', why: 'Cleats give screws solid wood to bite into instead of end grain, so the corners stay tight for years.', v: { cam: [1.6, 1.6, 1.8], at: [0.7, 0.25, 0.3], hi: ['cleats'], show: ['cleats'], tool: { id: 'drill', at: [0.88, 0.2, 0.42], rot: [0, 0, -90], anim: 'spin' } } },
      { t: 'Add the center rafter and seal', d: 'Screw a 2×3 across the middle from back to front, then stick foam weatherstrip along all top edges.', why: 'The rafter supports the meeting edges of the two lids, and the foam closes the gaps where heat escapes.', v: { cam: [1.6, 1.8, 1.6], at: [0, 0.4, 0], hi: ['rafter', 'seal'], show: ['rafter', 'seal'] } },
      { t: 'Build and glaze the lids', d: 'Screw 2×2 frames to fit half the box each, then fasten the polycarbonate with washer-head screws, flutes running downhill. Tape the top edge and leave the bottom vented.', why: 'Flutes running downhill let condensation drain out instead of collecting and growing algae.', tip: 'Pre-drill oversized holes in the polycarbonate; it expands in the sun and cracks around tight screws.', v: { cam: [1.9, 1.9, 2.1], at: [0, 0.45, 0], hi: ['lidL', 'lidR'], show: ['lidL', 'lidR'], tool: { id: 'drill', at: [0.5, 0.48, 0.3], rot: [0, 0, 0], anim: 'spin' } } },
      { t: 'Hinge the lids', d: 'Fasten two strap hinges per lid to the back wall and add a handle at the front of each lid.', why: 'Hinging at the high side means the lid opens toward you and catches the wind less.', v: { cam: [-1.2, 1.4, -1.8], at: [0, 0.45, -0.45], hi: ['hinges'], show: ['hinges'], rt: { lidR: [-35, 0, 0] }, tool: { id: 'screwdriver', at: [-0.75, 0.43, -0.48], rot: [-90, 0, 0], anim: 'turn' } } },
      { t: 'Mount the auto opener', d: 'Mount the wax-cylinder opener inside the left lid and set it to start opening at about 65–70°F.', why: 'Wax in the cylinder expands as it warms and lifts the lid with no power. It vents the frame on sunny days even when you’re not home.', v: { cam: [-0.1, 1.2, 1.3], at: [-0.45, 0.35, -0.25], hi: ['opener'], show: ['opener'], rt: { lidR: [0, 0, 0], lidL: [-28, 0, 0] }, xray: true } },
      { t: 'Fill and plant', d: 'Add 4″ of compost to the soil, then sow or transplant cold-hardy greens. Close at night, vent on warm days.', why: 'Dark, moist soil soaks up heat in the day and gives it back at night.', v: { cam: [2.0, 1.55, 2.5], at: [0, 0.3, 0], hi: ['soil', 'plants'], show: ['soil', 'plants'], rt: { lidL: [-35, 0, 0], lidR: [-45, 0, 0] } } },
    ],
    learn: {
      how: 'A cold frame is a small, unheated greenhouse. Sunlight passes through the glazing and warms the soil, and the closed box traps that heat and blocks wind. It usually adds 5–10°F at night and much more in sun, which means it can overheat quickly. Venting is the most important part of running one. Twin-wall polycarbonate traps a layer of air, so it insulates almost twice as well as single glass.',
      specs: [['Size', '3×6 ft, two 3×3 lids'], ['Height', '18″ back, 12″ front'], ['Slope', '≈ 10° facing south'], ['Glazing', '6–8 mm twin-wall polycarbonate'], ['Vent at', '65–70°F'], ['Season extension', '≈ 6–8 weeks each end']],
      terms: [['Twin-wall polycarbonate', 'Two plastic sheets joined by ribs, with air channels between.'], ['Vent opener', 'Wax piston that pushes the lid open as it heats up.'], ['Hardening off', 'Slowly getting seedlings used to outdoor conditions.']],
      mistakes: ['Forgetting to vent on a sunny day.', 'Facing it east or west.', 'Screwing polycarbonate too tight.', 'Glass lids in a yard with kids or ball games.'],
      tips: ['A jug of water painted black inside stores heat for cold nights.', 'Add a rigid foam board against the back wall in deep winter.'],
    },
    pro: 'Rarely needed. Call a pro for a cold frame built against the house foundation or tied into heating.',
    addons: [
      { id: 'minmax', part: 'aoMinMax', name: 'Min/max thermometer', cat: 'Tech', blurb: 'Shows last night’s low and today’s high.', cost: [10, 30], how: 'Screw it to the inside of the back wall out of direct sun.', needs: ['Min/max thermometer'], shop: 'Min max thermometer garden' },
      { id: 'cable', part: 'aoCable', name: 'Soil-heating cable', cat: 'Tech', blurb: 'Turns it into a hotbed for early starts.', cost: [40, 110], how: 'Lay the cable in loops 3–4″ apart on 2″ of sand, cover with 4″ of soil, and plug the thermostat into a GFCI outlet.', needs: ['Soil heating cable with thermostat', 'GFCI outlet'], shop: 'Soil heating cable thermostat' },
      { id: 'shade', part: 'aoShade', name: 'Shade cloth', cat: 'Garden', blurb: '40% cloth for warm spells and summer greens.', cost: [15, 40], how: 'Drape it over the lids and clip it to the walls.', needs: ['40% shade cloth', 'Clips'], shop: '40 percent shade cloth' },
      { id: 'bales', part: 'aoBales', name: 'Straw-bale windbreak', cat: 'Garden', blurb: 'Bales on the north side cut wind and add insulation.', cost: [15, 40], how: 'Set bales tight against the back wall. Compost them in spring.', needs: ['Straw bales (2)'], shop: 'Straw bale' },
    ],
  };

  const drip = {
    id: 'drip-irrigation',
    title: 'Install drip irrigation for raised beds',
    model: 'dripSystem',
    level: 2,
    time: '3–5 hours',
    cost: '$80–250',
    summary: 'A timer-controlled drip system for two 4×8 beds: hose-bib head assembly (timer, backflow preventer, filter, 25 psi regulator), a ½″ mainline, one valve per bed, and emitter lines 12″ apart. It uses 30–50% less water than a sprinkler and keeps leaves dry.',
    intro: { show: ['timer', 'backflow', 'filter', 'regulator', 'adapter', 'mainline', 'valves', 'risers', 'headers', 'laterals', 'stakes', 'endcaps'], preview: true, spin: true },
    safety: ['Always install a backflow preventer at the faucet so garden water can’t be siphoned back into the drinking supply. Most plumbing codes require one.', 'Drain or remove the head assembly before freezing weather; a frozen filter or regulator will crack.', 'Call 811 before burying mainline deeper than a few inches.'],
    causes: [['Map the zones', 'Group plants with similar water needs. Each bed is its own zone here, with its own valve.'], ['Check the flow', 'Time how long a 5-gal bucket takes to fill at the faucet. Gallons per minute × 60 = gallons per hour. Keep total emitter flow under that.'], ['Pick the emitters', '0.5–1 gph inline emitters, 12″ apart, in rows 12″ apart cover a bed evenly.']],
    tools: ['Battery hose-end timer', 'Hose-thread backflow preventer', '150-mesh filter', '25 psi pressure regulator', 'Hose-to-½″ tubing adapter', '½″ poly tubing (50–100 ft)', '½″ tees, elbows, ball valves', '½″ inline-emitter tubing, 12″ spacing', 'Hole punch + goof plugs', 'U-stakes, figure-8 end closures', 'Pruning shears (tubing cutter)', 'Teflon tape'],
    steps: [
      { t: 'Plan the layout', d: 'Measure from the faucet to each bed and flag the mainline route, the valve locations and the end of each bed.', why: 'A measured plan gives you an exact parts list, and keeps the total emitter flow inside what your faucet can supply.', v: { cam: [3.2, 3.0, 3.2], at: [-0.2, 0.1, 0], hi: ['plan'], show: ['plan'], tool: { id: 'tape', at: [-1.6, 0.03, -1.0], rot: [0, 0, 0], scale: 1.3 } } },
      { t: 'Timer on the faucet', d: 'Wrap the faucet threads with Teflon tape and screw on the battery timer, hand-tight.', why: 'Putting the timer first means only the timer is ever under full house pressure; everything after it stays at drip pressure.', v: { cam: [-1.0, 0.85, -0.6], at: [-1.6, 0.4, -1.55], hi: ['timer'], show: ['timer'] } },
      { t: 'Backflow preventer', d: 'Thread the backflow preventer onto the timer outlet.', why: 'It stops dirty garden water (and any fertilizer) from being pulled back into the house supply if pressure drops.', v: { cam: [-1.0, 0.8, -0.65], at: [-1.6, 0.34, -1.55], hi: ['backflow'], show: ['backflow'] } },
      { t: 'Filter, regulator, adapter', d: 'Add the 150-mesh filter, then the 25 psi regulator, then the tubing adapter. Arrows on each part point away from the faucet.', why: 'The filter catches grit that clogs emitters. The regulator drops house pressure (40–80 psi) to the 25 psi the fittings are rated for.', v: { cam: [-1.0, 0.7, -0.7], at: [-1.6, 0.27, -1.55], hi: ['filter', 'regulator', 'adapter'], show: ['filter', 'regulator', 'adapter'] } },
      { t: 'Run the mainline', d: 'Push ½″ poly into the adapter, run it along the wall and across the front of the beds. Let it sit in the sun first so it uncoils.', why: 'Warm tubing lies flat and pushes onto fittings far more easily.', v: { cam: [1.6, 1.8, 0.4], at: [-0.3, 0.05, -1.2], hi: ['mainline'], show: ['mainline'], hide: ['plan'], tool: { id: 'utilityKnife', at: [0.98, 0.06, -1.15], rot: [0, 0, 90] } } },
      { t: 'Add zone valves', d: 'Cut in a tee in front of each bed and add a ½″ ball valve on the branch.', why: 'Valves let you balance or shut off each bed, for example when one is fallow or has thirstier crops.', v: { cam: [0.0, 1.0, -0.2], at: [-0.84, 0.05, -1.2], hi: ['valves'], show: ['valves'], tool: { id: 'pliers', at: [-0.84, 0.08, -1.12], rot: [0, 0, 0], anim: 'squeeze' } } },
      { t: 'Risers and headers', d: 'Run tubing up and over the bed wall and lay a ½″ header across the near end of each bed with tees every 12″.', why: 'Going over the wall avoids drilling the bed. The header feeds every row from one end, so the rows get even pressure.', v: { cam: [0.6, 1.4, 0.4], at: [-0.84, 0.25, -0.95], hi: ['risers', 'headers'], show: ['risers', 'headers'] } },
      { t: 'Lay the emitter lines', d: 'Run inline-emitter tubing from each header tee down the bed, 12″ apart, and stake it every 2–3 ft.', why: 'Rows 12″ apart with emitters every 12″ make overlapping wet zones, so the whole bed stays moist without dry stripes.', v: { cam: [2.6, 2.6, 2.4], at: [0, 0.25, 0.2], hi: ['laterals', 'stakes'], show: ['laterals', 'stakes'], tool: { id: 'hammer', at: [1.13, 0.3, 0.4], rot: [0, -40, 0], anim: 'tap', scale: 1.1 } } },
      { t: 'Flush and close the ends', d: 'Turn the water on for a minute to flush debris out the open ends, then fold each end into a figure-8 closure.', why: 'Plastic shavings from cutting end up in the first emitters and clog them if you don’t flush them out.', v: { cam: [1.2, 1.4, 2.6], at: [0, 0.25, 1.3], hi: ['endcaps'], show: ['endcaps'] } },
      { t: 'Test and program', d: 'Run each zone, check every emitter is wetting, then set the timer for early morning, usually 20–40 minutes every 2–3 days.', why: 'Morning watering loses the least to evaporation, and long, infrequent runs grow deeper roots than daily sprinkles.', v: { cam: [1.2, 1.6, 2.4], at: [-0.5, 0.2, 0.4], hi: ['laterals', 'timer'], fx: 'flow' } },
    ],
    learn: {
      how: 'Drip irrigation puts water at the soil surface in small, steady amounts, so almost none is lost to wind, runoff or evaporation. The head assembly makes household water safe for the system: the backflow preventer protects your drinking water, the filter protects the emitters, and the regulator lowers pressure so fittings don’t blow off. Pressure-compensating emitters give the same flow at the start and end of each row.',
      specs: [['Operating pressure', '25 psi (regulated)'], ['Filter', '150–200 mesh'], ['Emitter spacing', '12″ (6″ for sandy soil)'], ['Row spacing', '12″'], ['Max ½″ run', '≈ 200 ft per zone'], ['Typical run', '20–40 min every 2–3 days']],
      terms: [['GPH', 'Gallons per hour per emitter.'], ['Pressure-compensating', 'Emitter that keeps the same flow across a range of pressures.'], ['Figure-8', 'Fitting that folds the tubing end over to close it.'], ['Goof plug', 'Plug for a hole punched in the wrong place.']],
      mistakes: ['No regulator (fittings pop off).', 'Skipping the filter.', 'Too many emitters for the faucet’s flow.', 'Leaving it out to freeze.'],
      tips: ['Cover lines with mulch to protect them from sun and keep the soil cool.', 'Check emitters monthly; a clogged one often means a dying plant.'],
    },
    pro: 'You want it tied into an in-ground sprinkler system or a permanent valve manifold on the house supply. That usually needs a code-approved backflow device and sometimes a permit.',
    addons: [
      { id: 'hub', part: 'aoHub', name: 'Wi-Fi timer hub', cat: 'Tech', blurb: 'Control and schedule from your phone, with rain delays from the weather forecast.', cost: [60, 150], how: 'Pair the Bluetooth/Wi-Fi timer with the hub mounted inside Wi-Fi range.', needs: ['Smart hose timer with Wi-Fi hub'], shop: 'Wifi hose timer' },
      { id: 'rain', part: 'aoRain', name: 'Rain sensor', cat: 'Tech', blurb: 'Skips watering after rain.', cost: [25, 70], how: 'Mount it in open sky on the wall or fence and wire or pair it with the timer.', needs: ['Rain sensor compatible with timer'], shop: 'Rain sensor for hose timer' },
      { id: 'moist', part: 'aoMoist', name: 'Soil-moisture sensor', cat: 'Tech', blurb: 'Waters only when the soil is actually dry.', cost: [30, 90], how: 'Push the probe to root depth midway between emitters in the driest bed.', needs: ['Soil moisture sensor'], shop: 'Soil moisture sensor irrigation' },
      { id: 'fert', part: 'aoFert', name: 'Fertilizer injector', cat: 'Garden', blurb: 'Feeds with every watering (fertigation).', cost: [30, 80], how: 'Install it after the backflow preventer and before the filter. Use water-soluble fertilizer only.', needs: ['Venturi or canister fertilizer injector', 'Water-soluble fertilizer'], shop: 'Drip irrigation fertilizer injector' },
      { id: 'pots', part: 'aoPots', name: 'Patio pot drippers', cat: 'Garden', blurb: '¼″ lines and drippers to nearby containers.', cost: [15, 40], how: 'Punch the mainline, push in a barbed connector and run ¼″ tubing to a 1–2 gph dripper staked in each pot.', needs: ['¼″ micro tubing', 'Barbed connectors', '2 gph drippers + stakes'], shop: '1/4 inch drip tubing kit' },
    ],
  };

  const tunnel = {
    id: 'trellis-tunnel',
    title: 'Build a cattle-panel arch trellis tunnel',
    model: 'panelTunnel',
    level: 2,
    time: '2–3 hours',
    cost: '$120–220',
    summary: 'Two 16 ft cattle panels bent into a walk-through arch between two beds and tied to steel T-posts. It’s about 6 ft tall, holds heavy squash and gourds, and lets beans and cucumbers hang inside where they’re easy to pick.',
    intro: { show: ['tposts', 'tposts2', 'panel1', 'panel2', 'ties', 'ties2', 'plants'], preview: true, spin: true },
    safety: ['Cattle panels spring back hard when bent. Two people, gloves and safety glasses are a must.', 'Cut wire ends are sharp. File them or cover them with tubing.', 'Wear hearing protection when driving T-posts and keep your hands clear of the driver.'],
    causes: [['Set the span', 'Feet 6–7 ft apart give about 6 ft of headroom with a 16 ft panel. Wider spans make a lower arch.'], ['Choose panel length', 'Each panel is 50″ wide; two make an 8½ ft tunnel.'], ['Place posts outside', 'T-posts outside the panel leave the inside clean and let you add plastic later for a hoop house.']],
    tools: ['2 cattle panels, 16 ft × 50″ (4-gauge)', '6 steel T-posts, 5–6 ft', 'T-post driver', 'Heavy UV-rated zip ties or T-post clips', 'Bolt cutters', 'Tape measure, stakes, string', 'Level', 'Work gloves, safety glasses, hearing protection'],
    steps: [
      { t: 'Mark the post spots', d: 'Mark post positions 7 ft apart across the path, and 4 ft apart along each bed edge.', why: 'The span sets the arch height. Measuring both sides the same keeps the arch from leaning.', v: { cam: [3.4, 2.6, 3.8], at: [0, 0.3, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [1.12, 0.4, 0], rot: [0, 0, 90], scale: 1.4 } } },
      { t: 'Drive the T-posts', d: 'Drive each T-post 18–24″ deep with the anchor plate buried, studs facing out. Keep them plumb.', why: 'The bent panel pushes outward constantly. Deep, plumb posts resist that spring force.', v: { cam: [2.8, 1.8, 2.4], at: [1.12, 0.6, -0.6], hi: ['tposts', 'tposts2'], show: ['tposts', 'tposts2'], hide: ['layout'], tool: { id: 'sledge', at: [1.12, 1.1, -1.22], rot: [0, 0, 10], anim: 'tap' } } },
      { t: 'Lay out the first panel', d: 'Lay the first panel flat on the lawn with the wider-spaced wires up and trim any sharp spurs.', why: 'Getting the orientation right before bending means you won’t wrestle it around later.', v: { cam: [4.6, 2.6, 2.8], at: [2.4, 0, 0], hi: ['flat'], show: ['flat'], tool: { id: 'boltCutters', at: [2.6, 0.05, 2.45], rot: [0, 0, 80], anim: 'squeeze' } } },
      { t: 'Bend it into the arch', d: 'With a helper, walk the ends toward each other until it bows up, then set the ends inside the posts.', why: 'Bending from the ends gives a smooth, even curve. Kinks are permanent weak spots.', tip: 'Stand on one end while your helper lifts and walks the other end toward you.', v: { cam: [3.6, 2.4, 3.2], at: [0, 1.0, -0.6], hi: ['panel1'], show: ['panel1'], hide: ['flat'] } },
      { t: 'Tie it to the posts', d: 'Zip-tie or clip the panel to each post at 5–6 points from the ground up.', why: 'Ties at several heights stop the panel from springing out of shape or rattling in wind.', v: { cam: [2.4, 1.4, 0.4], at: [1.1, 0.5, -0.6], hi: ['ties'], show: ['ties'], tool: { id: 'pliers', at: [1.1, 0.55, -0.03], rot: [0, 90, 0], anim: 'squeeze' } } },
      { t: 'Add the second panel', d: 'Bend and set the second panel the same way, butting it to the first, and tie it to the last posts and to the first panel along the seam.', why: 'Joining the panels makes one stiff tunnel that resists wind better than two separate arches.', v: { cam: [3.6, 2.4, 4.2], at: [0, 0.9, 0.4], hi: ['panel2', 'ties2'], show: ['panel2', 'ties2'], tool: { id: 'pliers', at: [0, 1.8, 0.0], rot: [0, 0, 0], anim: 'squeeze' } } },
      { t: 'Plant the climbers', d: 'Plant pole beans, cucumbers, small squash or gourds at the base of each side and guide the first tendrils onto the panel.', why: 'Grown vertically, vines get more light and air, and the fruit hangs straight and clean.', v: { cam: [3.6, 2.0, 4.0], at: [0, 0.6, 0], hi: ['plants'], show: ['plants'] } },
    ],
    learn: {
      how: 'A cattle panel is a welded grid of 4-gauge galvanized wire. It’s stiff enough to stand as a 6 ft arch on its own but flexible enough to bend by hand. T-posts hold the feet so the arch can’t spread or collapse. Grown overhead, vines fill the tunnel with shade and hang their fruit inside where it’s easy to reach.',
      specs: [['Panel', '16 ft × 50″, 4-gauge'], ['Span', '6–7 ft between feet'], ['Height', '≈ 6 ft'], ['Posts', '6 T-posts for 2 panels'], ['Post depth', '18–24″']],
      terms: [['Cattle panel', 'Heavy welded-wire livestock panel.'], ['Hog panel', 'Similar, with tighter spacing at the bottom.'], ['T-post', 'Steel fence post with studs and an anchor plate.']],
      mistakes: ['Span too wide (arch too low to walk under).', 'Bending alone (panel whips back).', 'Only one tie per post.'],
      tips: ['Lay the panels with the tighter wire spacing at the bottom so small plants get a grip.', 'Hang heavy squash in old T-shirt slings.'],
    },
    pro: 'Not usually needed. For a long tunnel in a windy spot, a fence contractor can set posts in concrete.',
    addons: [
      { id: 'string', part: 'aoString', name: 'Café lights', cat: 'Lighting', blurb: 'Lights along the arch turn it into an evening walk-through.', cost: [40, 120], how: 'Zip-tie a strand along each end of the arch and one along the top, plugged into an outdoor GFCI outlet.', needs: ['Outdoor string lights', 'Zip ties'], shop: 'Outdoor LED string lights' },
      { id: 'vines', part: 'aoVines', name: 'Mature vines + gourds', cat: 'Garden', blurb: 'What it looks like by midsummer.', cost: [10, 40], how: 'Plant 3–4 climbers per side; tie the main vines loosely every 12″ until they grab on.', needs: ['Climbing plant seeds/starts', 'Soft plant ties'], shop: 'Pole bean seeds' },
      { id: 'cover', part: 'aoCover', name: 'Hoop-house cover', cat: 'Garden', blurb: '6-mil greenhouse film turns it into a spring/fall hoop house.', cost: [60, 160], how: 'Drape the film over the arch, weight the long edges with lumber or sandbags and clip it to the panels. Leave the ends open on warm days.', needs: ['6-mil greenhouse film', 'Snap clamps', 'Sandbags or lumber'], shop: 'Greenhouse plastic 6 mil' },
      { id: 'bench', part: 'aoBench', name: 'Garden bench', cat: 'Comfort', blurb: 'A seat at the tunnel mouth.', cost: [120, 350], how: 'Set it on pavers so the legs don’t sink.', needs: ['Garden bench', 'Pavers'], shop: 'Wooden garden bench' },
      { id: 'path', part: 'aoPath', name: 'Mulch path', cat: 'Finish', blurb: 'Bark mulch over fabric for a clean, weed-free walk.', cost: [40, 120], how: 'Lay landscape fabric down the path and cover with 3″ of bark mulch.', needs: ['Landscape fabric', 'Bark mulch (½ yd)'], shop: 'Bark mulch' },
    ],
  };
  tunnel.variants = [
    { id: 'tunnel', name: 'Two-panel tunnel', blurb: 'An 8½ ft walk-through tunnel.' },
    {
      id: 'arch',
      name: 'Single-panel arch',
      blurb: 'One panel and four posts: a garden arch over the path.',
      level: 1,
      time: '1–2 hours',
      cost: '$60–110',
      summary: 'One 16 ft cattle panel bent into a 50″-deep arch over the path, tied to four T-posts. The same strong trellis in a smaller footprint.',
      intro: { show: ['tposts', 'panel1', 'ties', 'plants'], preview: true, spin: true },
      tools: ['1 cattle panel, 16 ft × 50″', '4 T-posts, 5–6 ft', 'T-post driver', 'UV-rated zip ties or clips', 'Bolt cutters', 'Tape, gloves, safety glasses'],
      steps: [
        { t: 'Drive the T-posts', d: 'Drive four T-posts 18–24″ deep, 7 ft apart across the path and 4 ft apart along each side.', why: 'The bent panel pushes outward constantly; deep, plumb posts hold it.', v: { cam: [3.0, 2.0, 2.6], at: [0.6, 0.5, -0.6], hi: ['tposts'], show: ['tposts'], tool: { id: 'sledge', at: [1.12, 1.1, -1.22], rot: [0, 0, 10], anim: 'tap' } } },
        { t: 'Bend the panel', d: 'With a helper, walk the ends of the panel toward each other and set them inside the posts.', why: 'Bending from the ends gives a smooth curve with no kinks.', v: { cam: [3.4, 2.2, 2.4], at: [0, 1.0, -0.6], hi: ['panel1'], show: ['panel1'] } },
        { t: 'Tie it off', d: 'Tie the panel to each post at 5–6 heights.', why: 'Ties at several heights stop it from springing out of shape.', v: { cam: [2.4, 1.4, 0.4], at: [1.1, 0.5, -0.6], hi: ['ties'], show: ['ties'], tool: { id: 'pliers', at: [1.1, 0.55, -0.03], rot: [0, 90, 0], anim: 'squeeze' } } },
        { t: 'Plant the climbers', d: 'Plant climbers at the base of each side and guide the tendrils onto the panel.', why: 'Climbing plants get more light and air, and the fruit hangs clean.', v: { cam: [3.4, 2.0, 2.8], at: [0, 0.7, -0.6], hi: ['plants'], show: ['plants'] } },
      ],
      addons: tunnel.addons.filter((a) => a.id === 'bench' || a.id === 'path'),
    },
  ];

  const bench = {
    id: 'potting-bench',
    title: 'Build a potting bench with a tub sink',
    model: 'pottingBench',
    level: 2,
    time: '1 weekend',
    cost: '$220–450',
    summary: 'A 5 ft cedar potting bench at a comfortable 36″ work height, with a drop-in stainless tub that drains to a bucket, a slatted lower shelf for soil bins, and a backboard with an upper shelf for pots.',
    intro: { show: ['legs', 'sideRails', 'longRails', 'shelf', 'top', 'tub', 'drain', 'back', 'upperShelf', 'bins'], preview: true, spin: true },
    safety: ['Wear safety glasses and hearing protection when cutting, and a dust mask when sanding cedar.', 'Clamp boards before cutting; never hold a short piece by hand at the saw.', 'If you plumb in a hose-fed faucet, add a backflow preventer at the house faucet.'],
    causes: [['Set the work height', '36″ suits most people; go 2″ above your wrist height when standing.'], ['Pick the tub first', 'Size the opening from the tub’s rim and bowl dimensions.'], ['Place it', 'Level ground, near a hose and in partial shade.']],
    tools: ['Cedar 2×4s (8–10)', 'Cedar 1×6s (top) + 1×4s (shelf, back)', 'Drop-in utility tub + basket strainer', 'Drain hose + bucket', 'Circular or miter saw', 'Jigsaw', 'Drill/driver, 2½″ & 1¼″ exterior screws', 'Speed square, tape, level, clamps', 'Exterior oil or sealer'],
    steps: [
      { t: 'Cut the parts', d: 'Cut two 61″ back legs, two 34″ front legs, rails, top and shelf boards from the cut list.', why: 'Cutting everything first lets you check lengths match before anything is screwed together.', v: { cam: [1.8, 1.4, 2.6], at: [0, 0.6, 0.9], hi: ['lumber'], show: ['lumber'], tool: { id: 'handsaw', at: [0.8, 0.84, 0.95], rot: [0, 0, 0], anim: 'slide' } } },
      { t: 'Build the end frames', d: 'Screw a top and bottom side rail between each front and back leg, square to the legs.', why: 'Two identical end frames are the base of a square, wobble-free bench.', v: { cam: [2.0, 1.4, 1.6], at: [0.6, 0.6, 0], hi: ['legs', 'sideRails'], show: ['legs', 'sideRails'], hide: ['lumber'], tool: { id: 'drill', at: [0.73, 0.82, 0.18], rot: [0, 0, -90], anim: 'spin' } } },
      { t: 'Join them with long rails', d: 'Stand the frames up and connect them with long rails top and bottom, plus two tub supports.', why: 'The long rails tie the bench together; the supports carry the tub rim and a heavy wet load.', v: { cam: [1.8, 1.6, 2.0], at: [0, 0.6, 0], hi: ['longRails'], show: ['longRails'], tool: { id: 'level', at: [0, 0.89, 0.25], rot: [0, 0, 0], scale: 1.2 } } },
      { t: 'Add the lower shelf', d: 'Screw 1×4 slats across the lower rails with ¼″ gaps.', why: 'Gaps drain water and soil so the shelf doesn’t stay wet and rot.', v: { cam: [1.6, 1.0, 1.8], at: [0, 0.3, 0], hi: ['shelf'], show: ['shelf'], tool: { id: 'drill', at: [-0.3, 0.27, 0.2], rot: [0, 0, 0], anim: 'spin' } } },
      { t: 'Lay the top around the tub', d: 'Screw 1×6 top boards on, cutting the middle ones to frame an opening that fits the tub’s bowl but not its rim.', why: 'The rim needs to rest on wood all the way around or the tub tips when it’s full.', tip: 'Trace the tub upside down on the boards, then cut ½″ inside the line.', v: { cam: [1.4, 1.7, 1.4], at: [0.2, 0.9, 0], hi: ['top'], show: ['top'], tool: { id: 'drill', at: [-0.4, 0.93, 0.15], rot: [0, 0, 0], anim: 'spin' } } },
      { t: 'Drop in the tub and drain', d: 'Seal a basket strainer into the tub drain, set the tub in the opening and run a drain hose to a bucket.', why: 'Catching the water in a bucket lets you reuse it on plants instead of making a mud hole.', v: { cam: [1.3, 1.5, 1.6], at: [0.4, 0.75, 0], hi: ['tub', 'drain'], show: ['tub', 'drain'], tool: { id: 'adjWrench', at: [0.5, 0.67, -0.01], rot: [0, 0, 0], anim: 'turn' } } },
      { t: 'Backboard and upper shelf', d: 'Screw 1×4 slats across the back legs and mount the upper shelf on cleats at about 54″.', why: 'The backboard stops pots and soil from falling off the back and carries tools and shelves.', v: { cam: [1.6, 1.8, 1.8], at: [0, 1.2, -0.2], hi: ['back', 'upperShelf'], show: ['back', 'upperShelf'], tool: { id: 'drill', at: [0.4, 1.15, -0.27], rot: [-90, 0, 0], anim: 'spin' } } },
      { t: 'Storage and finish', d: 'Set lidded bins for potting mix and perlite on the lower shelf. Seal the wood with exterior oil.', why: 'Lidded bins keep mix dry and pest-free. Oil keeps cedar from cupping and greying.', v: { cam: [1.9, 1.6, 2.4], at: [0, 0.8, 0], hi: ['bins', 'top'], show: ['bins'], tool: { id: 'roller', at: [-0.4, 0.95, 0.1], rot: [0, 0, 0] } } },
    ],
    learn: {
      how: 'A potting bench is a sturdy outdoor workbench built to get wet. Slatted shelves drain, rot-resistant cedar handles moisture, and a tub gives you somewhere to soak pots, wash vegetables and mix soil without making a mess. The tall back legs carry a backboard and shelf, which also brace the bench against racking.',
      specs: [['Size', '60 × 24″'], ['Work height', '36″'], ['Back height', '61″'], ['Shelf gap', '¼″'], ['Upper shelf', '≈ 54″']],
      terms: [['Apron/rail', 'Horizontal frame members between legs.'], ['Basket strainer', 'Drain fitting with a removable strainer.'], ['Racking', 'A frame leaning out of square.']],
      mistakes: ['Top boards with no gaps (water pools).', 'Tub rim not supported all around.', 'Bench set on soft soil (sinks unevenly).'],
      tips: ['Set the legs on pavers to keep end grain out of wet soil.', 'A hose-fed faucet over the tub makes it a real outdoor sink.'],
    },
    pro: 'You want a real water supply and a drain tied into plumbing or a dry well.',
    addons: [
      { id: 'faucet', part: 'aoFaucet', name: 'Hose-fed faucet', cat: 'Finish', blurb: 'A real faucet over the tub, fed by a garden hose.', cost: [40, 120], how: 'Mount an outdoor faucet kit on the backboard and connect a hose with a shutoff.', needs: ['Hose-fed outdoor faucet kit', 'Garden hose'], shop: 'Garden hose sink faucet' },
      { id: 'tools', part: 'aoTools', name: 'Tool rail', cat: 'Finish', blurb: 'Hand tools hang right where you work.', cost: [20, 60], how: 'Screw a steel rail to the backboard and hang S-hooks.', needs: ['Steel rail + S-hooks', 'Trowel, pruners, cultivator'], shop: 'Garden tool rail' },
      { id: 'light', part: 'aoLight', name: 'LED bar light', cat: 'Lighting', blurb: 'Battery or solar light under the shelf.', cost: [20, 50], how: 'Stick or screw it under the upper shelf.', needs: ['Rechargeable LED bar light'], shop: 'Rechargeable LED under cabinet light' },
      { id: 'pots', part: 'aoPots', name: 'Pots + seedlings', cat: 'Garden', blurb: 'A stocked shelf.', cost: [20, 80], how: 'Keep empty pots stacked at one end and seedlings at the other.', needs: ['Terracotta pots', 'Seedlings'], shop: 'Terracotta pots' },
      { id: 'awning', part: 'aoAwning', name: 'Shed-roof awning', cat: 'Comfort', blurb: 'Metal roof keeps sun and rain off.', cost: [60, 150], how: 'Screw 2×4 rafters to the back legs and fasten metal roofing on top.', needs: ['2×4 cedar', 'Metal roofing panel', 'Roofing screws'], shop: 'Metal roofing panel' },
    ],
  };

  const fence = {
    id: 'deer-fence',
    title: 'Build a deer & critter-proof garden fence',
    model: 'deerFence',
    level: 3,
    time: '2–3 weekends',
    cost: '$900–2,200',
    summary: 'A 20×16 ft garden enclosure, 8 ft tall: wood posts set in concrete, 4 ft welded wire with a buried L-apron for rabbits and groundhogs, black poly deer mesh above, and a full-height framed gate.',
    intro: { show: ['corners', 'gatePosts', 'posts', 'braces', 'topRail', 'lowerMesh', 'upperMesh', 'apron', 'backfill', 'gate'], preview: true, spin: true },
    safety: ['Call 811 before digging, at least 3 business days ahead.', 'Check rules first: many towns and HOAs limit fence height to 6 ft without a permit.', 'Use a ladder with a helper to hang the top mesh and rail.', 'Wear gloves and eye protection when cutting wire.'],
    causes: [['Go 8 ft', 'Deer clear 7 ft from a standstill. 8 ft is the real minimum for a garden they can see into.'], ['Stop diggers', 'Rabbits and groundhogs go under. A 12″ outward apron stops them.'], ['Make the gate as tall', 'A 4 ft gate in an 8 ft fence is a 4 ft fence to a deer.']],
    tools: ['6×6 posts, 10 ft (corners + gate) & 4×4s (line)', 'Post-hole digger or auger + concrete', '2×4 rails + braces, galvanized screws/bolts', '4 ft 1×2″ welded wire (≈ 75 ft)', 'Black poly deer mesh 4 ft (or 7 ft)', 'Fence staples + hammer, zip ties', 'Gate hinges, latch, 2×4s', 'Shovel/trenching spade', 'String line, tape, post level', 'Ladder, gloves, glasses'],
    steps: [
      { t: 'Lay out and square', d: 'Stake the 20×16 ft corners and run string. Adjust until both diagonals match.', why: 'Square corners keep panels of mesh straight and the gate square.', v: { cam: [7.4, 5.6, 8.6], at: [0, 0, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [3.0, 0.35, 2.4], rot: [0, 45, 0], scale: 2 } } },
      { t: 'Dig the post holes', d: 'Dig 10″ holes, 30–36″ deep (or below your frost line), at the corners, the gate and every 6–8 ft.', why: 'An 8 ft fence catches a lot of wind. Deep holes keep posts from leaning.', v: { cam: [6.4, 4.6, 7.4], at: [0, 0, 0], hi: ['holes'], show: ['holes'], tool: { id: 'shovel', at: [3.2, 0.02, 2.2], rot: [10, 40, -15], anim: 'push', scale: 1.2 } } },
      { t: 'Set corner and gate posts', d: 'Set the 6×6 corner and gate posts in concrete, plumb on two faces, and brace until cured. Add the header over the gate.', why: 'Corners and gate posts take all the tension of the mesh. They need the most strength.', v: { cam: [6.8, 4.6, 7.8], at: [0, 1.2, 0], hi: ['corners', 'gatePosts'], show: ['corners', 'gatePosts'], hide: ['holes'], tool: { id: 'level', at: [3.0, 1.3, 2.48], rot: [0, 0, 90], scale: 1.6 } } },
      { t: 'Set the line posts', d: 'Run a string between corners at top and bottom and set the line posts to it.', why: 'Posts set to a string give a straight fence line that the mesh can lie flat against.', v: { cam: [6.8, 4.6, 7.8], at: [0, 1.2, 0], hi: ['posts'], show: ['posts'], hide: ['layout'], tool: { id: 'level', at: [1.5, 1.3, -2.35], rot: [0, 0, 90], scale: 1.6 } } },
      { t: 'Braces and top rail', d: 'Add H-braces at the corners and gate (horizontal rail plus a diagonal tension wire), then screw a 2×4 rail along the top.', why: 'Braces stop corner posts from being pulled inward when you stretch the mesh. The rail keeps the post tops in line.', v: { cam: [6.0, 4.4, 6.8], at: [1.5, 1.5, 0], hi: ['braces', 'topRail'], show: ['braces', 'topRail'], tool: { id: 'drill', at: [3.0, 2.4, 2.0], rot: [0, 0, 90], anim: 'spin', scale: 1.3 } } },
      { t: 'Dig the apron trench', d: 'Dig a trench 6″ deep and 12″ wide along the outside of the fence line.', why: 'The trench holds the buried apron, the part that actually stops animals from digging in.', v: { cam: [5.4, 3.6, 6.6], at: [1.5, 0, 1.6], hi: ['trench'], show: ['trench'], tool: { id: 'shovel', at: [2.0, 0.02, 2.65], rot: [10, 40, -15], anim: 'push', scale: 1.2 } } },
      { t: 'Hang the welded wire + apron', d: 'Staple 4 ft welded wire to the outside of the posts, letting the bottom 12″ bend outward into the trench.', why: 'An animal digging at the fence hits the apron and gives up. It doesn’t think to back up and dig further out.', v: { cam: [5.0, 2.4, 6.2], at: [1.5, 0.5, 2.0], hi: ['lowerMesh', 'apron'], show: ['lowerMesh', 'apron'], tool: { id: 'hammer', at: [1.8, 0.9, 2.52], rot: [0, 0, 0], anim: 'tap', scale: 1.3 } } },
      { t: 'Hang the deer mesh', d: 'Staple or zip-tie black poly deer mesh from the welded wire to the top rail, pulled snug.', why: 'Poly mesh is nearly invisible from a distance and much cheaper than 8 ft of welded wire.', v: { cam: [6.4, 4.4, 7.4], at: [0, 1.6, 0], hi: ['upperMesh'], show: ['upperMesh'], tool: { id: 'stepLadder', at: [2.3, 0, 3.1], rot: [0, 0, 0] } } },
      { t: 'Backfill the trench', d: 'Backfill over the apron and tamp it firm. Pin any loose edges with landscape staples.', why: 'Firm soil over the apron keeps it from shifting and hides it from view.', v: { cam: [5.4, 3.6, 6.6], at: [1.5, 0, 1.6], hi: ['backfill'], show: ['backfill'], tool: { id: 'shovel', at: [-2.0, 0.02, 2.75], rot: [10, -40, 15], anim: 'push', scale: 1.2 } } },
      { t: 'Hang the gate', d: 'Build a full-height 2×4 frame with a diagonal brace running up from the bottom hinge corner, cover it with welded wire, and hang it on three heavy hinges with a latch.', why: 'The brace from the lower hinge corner holds the latch side up so the gate doesn’t sag.', v: { cam: [3.0, 2.4, 5.2], at: [0, 1.2, 2.4], hi: ['gate'], show: ['gate'], rt: { gate: [0, 70, 0] }, tool: { id: 'drill', at: [-0.5, 1.2, 2.5], rot: [0, 0, 90], anim: 'spin' } } },
      { t: 'Close up and check', d: 'Close the gate and check for gaps over 2″ at the bottom, at the gate and at the corners. Walk the fence after the first few nights.', why: 'Deer and rabbits test fences. One gap at the gate is all it takes.', v: { cam: [7.4, 5.2, 8.6], at: [0, 0.9, 0], hi: ['gate', 'apron'], rt: { gate: [0, 0, 0] } } },
    ],
    learn: {
      how: 'Deer jump, rabbits and groundhogs dig, and voles squeeze. A layered fence covers all three. The lower 4 ft of strong welded wire with a buried apron stops diggers and climbers. The light poly mesh above stops jumpers. Deer don’t like jumping into a space they can’t see clearly, so a tall, solid-feeling fence around a small area works best.',
      specs: [['Height', '8 ft'], ['Post spacing', '6–8 ft'], ['Post depth', '30–36″ or below frost'], ['Lower mesh', '4 ft, 1×2″ welded wire'], ['Apron', '12″ outward, 6″ deep'], ['Gate', 'Full height, 3½–4 ft wide']],
      terms: [['H-brace', 'Horizontal rail plus a diagonal tension wire that stiffens a corner.'], ['Apron', 'Mesh bent outward along the ground.'], ['Deer mesh', 'Polypropylene netting for deer fences.']],
      mistakes: ['A short gate.', 'Mesh stapled on the inside of the posts (animals push it off).', 'No apron.', 'Gaps under the gate.'],
      tips: ['Tie white flagging tape on the mesh for the first few weeks so deer see it.', 'Leave a 2-ft mowed strip outside the fence to discourage burrows.'],
    },
    pro: 'Long runs, rocky or sloped ground, or a permanent fence near a property line. Fence contractors set posts with a skid-steer auger in a day.',
    addons: [
      { id: 'hotwire', part: 'aoHotWire', name: 'Offset electric wire', cat: 'Safety', blurb: 'A solar-powered wire 2 ft out teaches deer to stay back.', cost: [150, 350], how: 'Set fiberglass stakes 2 ft out, run polywire at 30″ and ground the solar charger with a 6 ft rod. Bait it with peanut-butter flags.', needs: ['Solar fence charger', 'Fiberglass posts + insulators', 'Polywire', 'Ground rod'], shop: 'Solar electric fence charger' },
      { id: 'arbor', part: 'aoArbor', name: 'Arbor over the gate', cat: 'Finish', blurb: 'Cedar rafters on the gate posts make an entrance.', cost: [80, 220], how: 'Bolt 2×8 beams to each side of the gate posts and screw cedar slats across.', needs: ['Cedar 2×8 + 2×2', 'Carriage bolts'], shop: 'Cedar garden arbor kit' },
      { id: 'caps', part: 'aoCaps', name: 'Solar post caps', cat: 'Lighting', blurb: 'Soft light on the corners and gate.', cost: [60, 160], how: 'Slide them onto the 6×6 posts.', needs: ['Solar post cap lights (6×6)'], shop: 'Solar post cap lights 6x6' },
      { id: 'closer', part: 'aoCloser', name: 'Gate closer + drop rod', cat: 'Safety', blurb: 'The gate always shuts, and a rod pins it in wind.', cost: [25, 60], how: 'Screw a spring closer between post and gate frame, and a cane bolt at the latch side.', needs: ['Gate spring closer', 'Cane bolt'], shop: 'Gate spring closer' },
      { id: 'flags', part: 'aoFlags', name: 'Flagging tape', cat: 'Safety', blurb: 'Makes new mesh visible so deer don’t run into it.', cost: [5, 15], how: 'Tie strips every 3 ft for the first month.', needs: ['White flagging tape'], shop: 'White flagging tape' },
    ],
  };

  TB.category({
    id: 'garden-build',
    icon: 'garden',
    code: 'GDB',
    name: 'Garden Builds',
    domain: 'garden',
    kind: 'project',
    blurb: 'Compost bins, rain barrels, cold frames, drip lines, trellises and fences',
    repairs: [compost, rain, coldFrame, drip, tunnel, bench, fence],
  });
})();
