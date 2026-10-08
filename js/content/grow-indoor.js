/* IND · Grow: indoor plants & houseplants (repotting, cuttings, succulents, root rot, light, orchids,
   microgreens, Kratky lettuce, grow-light shelf). Real meters (unit: 1). Plants are built from extruded
   leaf outlines, lathes and tubes (helpers copied from grow.js so the section looks consistent); each
   walkthrough shows the plant's stages appearing in turn. */
(function () {
  const DS = THREE.DoubleSide;
  const ROOM = (o) => Object.assign({ unit: 1, env: 'studio', tex: ['plank_flooring', 'wood_planks', 'oak_wood_planks'], ground: { tex: 'plank_flooring', repeat: 5, radius: 6 } }, o);

  /* ---------- plant kit (copied from grow.js) ---------- */
  const leafMat = (K, c, r) => K.std(c || 0x4f8f3a, { roughness: r || 0.7, side: DS });
  const soilMat = (K, c) => K.bumpy(c || 0x5a4030, TB.tex.speckle(), 0.03, { roughness: 1 });
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
  // Heart-shaped leaf (pothos, philodendron): lobes at the base, pointed tip.
  function heartPts(L, W) {
    const out = [];
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const w = W * Math.sin(Math.PI * Math.pow(t, 0.75)) * (1 - 0.25 * t);
      out.push([w, t * L - (t < 0.25 ? (0.25 - t) * 0.35 * L : 0)]);
    }
    const back = out.slice(1, n).reverse().map(([x, y]) => [-x, y]);
    return [[0, 0.02 * L]].concat(out, back);
  }
  function strapPts(L, W) {
    return [[W / 2, 0], [W / 2, L * 0.75], [W * 0.15, L], [-W * 0.15, L], [-W / 2, L * 0.75], [-W / 2, 0]];
  }
  const orient = (K, p, pos, yaw, elev) => K.group(K.group(p, pos, [0, yaw, 0]), [0, 0, 0], [90 - elev, 0, 0]);
  function leaf(K, p, pos, yaw, elev, L, W, mat, serr) {
    const g = orient(K, p, pos, yaw, elev);
    K.ext(g, leafPts(L, W, 10, serr), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  function heart(K, p, pos, yaw, elev, L, W, mat) {
    const g = orient(K, p, pos, yaw, elev);
    K.ext(g, heartPts(L, W), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  function strap(K, p, pos, yaw, elev, L, W, mat, bend) {
    const g = orient(K, p, pos, yaw, elev);
    if (!bend) {
      K.ext(g, strapPts(L, W), 0.0012, mat, [0, 0, -0.0006], null, 0);
      return g;
    }
    K.ext(g, [[W / 2, 0], [W / 2, L * 0.55], [-W / 2, L * 0.55], [-W / 2, 0]], 0.0012, mat, [0, 0, -0.0006], null, 0);
    const g2 = K.group(g, [0, L * 0.55, 0], [bend, 0, 0]);
    K.ext(g2, strapPts(L * 0.45, W * 0.95), 0.0012, mat, [0, 0, -0.0006], null, 0);
    return g;
  }
  function seedling(K, p, pos, h, trueLeaves, mats, yaw) {
    const g = K.group(p, pos, [0, yaw || 0, 0]);
    K.cyl(g, [0.0012, 0.0016, h, 6], mats.stem, [0, h / 2, 0]);
    [0, 180].forEach((a) => leaf(K, g, [0, h, 0], a, 22, 0.011 + h * 0.08, 0.0045, mats.coty));
    if (trueLeaves) [90, 270].forEach((a) => leaf(K, g, [0, h * 0.98, 0], a, 48, trueLeaves, trueLeaves * 0.42, mats.leaf, true));
    return g;
  }
  function rain(K, p, from, n, spread, fall) {
    const drops = [];
    for (let i = 0; i < n; i++) {
      const d = K.sph(p, 0.005, 'water', [from[0] + Math.sin(i * 7.3) * spread, from[1], from[2] + Math.cos(i * 3.1) * spread], [0.8, 1.6, 0.8]);
      d.userData.noPick = true;
      drops.push({ d, y0: from[1], k: i / n });
    }
    return (t, on) => drops.forEach((o) => {
      o.d.visible = on;
      if (on) o.d.position.y = o.y0 - fall * ((t * 1.3 + o.k) % 1);
    });
  }
  function specks(K, p, n, y, mat, size, w, d) {
    for (let i = 0; i < n; i++) K.cyl(p, [size, size, size * 0.6, 6], mat, [Math.sin(i * 12.99) * w, y, Math.cos(i * 7.77 + i * i * 0.01) * d]);
  }
  // Specks scattered inside a circle (soil surface details).
  function discSpecks(K, p, n, r, y, mat, size) {
    for (let i = 0; i < n; i++) {
      const a = i * 2.39996;
      const rr = Math.sqrt((i + 0.5) / n) * r;
      K.sph(p, size * (0.7 + ((i * 7) % 5) * 0.12), mat, [Math.cos(a) * rr, y, Math.sin(a) * rr], [1, 0.7, 1]);
    }
  }
  // Pot outline with a rolled rim (terra-cotta / glazed). R = top radius, H = height.
  const potLathe = (R, H) => {
    const rb = R * 0.74;
    return [[0, 0.012], [rb - 0.012, 0.012], [R - 0.012, H - 0.03], [R - 0.012, H], [R + 0.014, H], [R + 0.014, H - 0.04], [R, H - 0.04], [rb, 0], [0, 0]];
  };
  // Thin-walled plastic nursery pot.
  const nurseryLathe = (R, H) => {
    const rb = R * 0.78;
    return [[0, 0.004], [rb - 0.003, 0.004], [R - 0.003, H - 0.006], [R + 0.004, H], [R + 0.006, H - 0.004], [R, H - 0.012], [rb, 0], [0, 0]];
  };
  // Radius of a lathe pot's inside wall at height y.
  const potR = (R, H, y, nursery) => {
    const rb = R * (nursery ? 0.78 : 0.74);
    return rb + (R - rb) * Math.min(1, Math.max(0, y / H)) - (nursery ? 0.004 : 0.013);
  };
  function scissors(K, name, pos, rot, label) {
    const g = K.part(name, pos, null, label || 'Sharp, clean scissors (wiped with rubbing alcohol)');
    const r = K.group(g, [0, 0, 0], rot || [0, 0, 0]);
    const blade = K.std(0xd0d5da, { metalness: 1, roughness: 0.22 });
    K.ext(r, [[0, 0], [0.006, 0.004], [0.003, 0.075], [0, 0.08], [-0.002, 0.01]], 0.0016, blade, [0, 0, 0.001], [0, 0, 6], 0);
    K.ext(r, [[0, 0], [0.002, 0.01], [0, 0.08], [-0.003, 0.075], [-0.006, 0.004]], 0.0016, blade, [0, 0, -0.0026], [0, 0, -6], 0);
    K.cyl(r, [0.003, 0.003, 0.008, 10], 'steel', [0, 0, 0], [90, 0, 0]);
    const h = K.std(0xe2862a, { roughness: 0.5 });
    K.tor(r, [0.016, 0.005], h, [0.014, -0.03, 0], [0, 0, 0]).scale.set(0.9, 1.3, 1);
    K.tor(r, [0.016, 0.005], h, [-0.014, -0.03, 0], [0, 0, 0]).scale.set(0.9, 1.3, 1);
    return g;
  }
  function phone(K, name, pos, rot, label, screenColor) {
    const g = K.part(name, pos, null, label);
    const r = K.group(g, [0, 0, 0], rot || [0, 0, 0]);
    K.box(r, [0.074, 0.155, 0.008], K.std(0x1d2024, { roughness: 0.35, metalness: 0.4 }), [0, 0, 0], null, 0.006);
    K.box(r, [0.068, 0.146, 0.001], K.std(0x0c1a26, { emissive: screenColor || 0x2c6aa0, emissiveIntensity: 0.9, roughness: 0.1 }), [0, 0, 0.0045], null, 0);
    K.box(r, [0.05, 0.022, 0.0008], K.std(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 }), [0, 0.02, 0.0052], null, 0);
    K.box(r, [0.03, 0.008, 0.0008], K.std(0x9ad86a, { emissive: 0x7ad04a, emissiveIntensity: 0.9 }), [0, -0.01, 0.0052], null, 0);
    K.cyl(r, [0.004, 0.004, 0.002, 12], 'black', [0.022, 0.065, 0.0055], [90, 0, 0]);
    return g;
  }
  // Work table against a painted wall. Table top at y = TOP.
  const TOP = 0.76;
  function workTable(K, label, w, d) {
    w = w || 1.3;
    d = d || 0.75;
    K.box(null, [4, 2.6, 0.06], K.std(0xeeebe5, { roughness: 0.92 }), [0, 1.3, -d / 2 - 0.08], null, 0);
    const t = K.part('table', [0, 0, 0], null, label || 'Work table');
    K.box(t, [w, 0.035, d], K.pbr('oak_wood_planks', [1, 0.6], { color: 0xd8b48a }, 'woodLight'), [0, TOP - 0.0175, 0], null, 0.006);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => K.box(t, [0.045, TOP - 0.035, 0.045], 'woodDark', [sx * (w / 2 - 0.05), (TOP - 0.035) / 2, sz * (d / 2 - 0.05)], null, 0.004));
    K.box(t, [w - 0.1, 0.08, 0.02], 'woodDark', [0, TOP - 0.075, -d / 2 + 0.05], null, 0.004);
    return t;
  }
  // A window set into a back wall: frame, glass, sill, bright sky behind. x/y = center, w×h.
  function windowWall(K, name, label, x, y, w, h, z, sill) {
    const g = K.part(name, [x, y, z], null, label);
    const frame = K.std(0xf5f4ef, { roughness: 0.5 });
    K.box(g, [w + 0.1, 0.06, 0.1], frame, [0, h / 2 + 0.03, 0], null, 0.006);
    K.box(g, [w + 0.1, 0.05, 0.1], frame, [0, -h / 2 - 0.025, 0], null, 0.006);
    [-1, 1].forEach((s) => K.box(g, [0.05, h, 0.1], frame, [s * (w / 2 + 0.025), 0, 0], null, 0.006));
    K.box(g, [0.03, h, 0.05], frame, [0, 0, 0], null, 0.004);
    K.box(g, [w, 0.03, 0.05], frame, [0, 0, 0], null, 0.004);
    K.box(g, [w, h, 0.004], K.std(0xd8ecf6, { transparent: true, opacity: 0.18, roughness: 0.03 }), [0, 0, 0], null, 0);
    K.box(g, [w + 0.4, h + 0.4, 0.01], K.std(0xbfe0f6, { emissive: 0xcfe8ff, emissiveIntensity: 0.85, roughness: 1 }), [0, 0, -0.12], null, 0);
    if (sill) K.box(g, [w + 0.26, 0.03, sill], K.std(0xf5f4ef, { roughness: 0.45 }), [0, -h / 2 - 0.065, sill / 2 - 0.03], null, 0.006);
    return g;
  }
  // Root lines on the surface of a cylindrical root ball (radius r, height h).
  function rootNet(K, p, r, h, n, mat, y0) {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + Math.sin(k) * 0.2;
      const pts = [];
      for (let j = 0; j <= 5; j++) {
        const y = (y0 || 0) + h * (1 - j / 5);
        const aa = a + j * 0.18;
        pts.push([Math.cos(aa) * (r + 0.001), y, Math.sin(aa) * (r + 0.001)]);
      }
      K.tube(p, pts, 0.0018, mat);
    }
  }

  /* =====================================================================
     1 · Repot a houseplant: root-bound rubber plant, 6″ nursery pot → 8″ pot
     ===================================================================== */
  // Rubber plant (Ficus elastica): upright woody stems, big glossy oval leaves, red sheath at the tip.
  function rubberPlant(K, p, s, M) {
    [[0, 0, 0.62, 0], [0.025, 0.01, 0.48, 8], [-0.02, -0.015, 0.4, -10]].forEach(([x, z, h, lean], k) => {
      const top = [x + Math.sin(lean * K.DEG) * h * s, h * s, z];
      K.tube(p, [[x, 0, z], [x + (top[0] - x) * 0.5, h * s * 0.5, z], top], 0.008 * s, M.trunk);
      const n = 7 - k * 2;
      for (let i = 0; i < n; i++) {
        const f = 0.25 + (i / n) * 0.72;
        const at = [x + (top[0] - x) * f, h * s * f, z];
        leaf(K, p, at, i * 137 + k * 60, 18 + (i / n) * 30, (0.2 - (i / n) * 0.06) * s, (0.085 - (i / n) * 0.02) * s, i % 2 ? M.leaf : M.leaf2);
      }
      K.cone(p, [0.006 * s, 0.05 * s, 8], M.sheath, [top[0], top[1] + 0.025 * s, top[2]]);
    });
  }
  const REPOT_AO = [];
  TB.model(
    'indRepot',
    ROOM({ cam: [0.75, 1.3, 1.05], at: [0, 0.95, 0],
      hidden: ['paper', 'newPot', 'screen', 'baseMix', 'bag', 'teased', 'cut', 'fill', 'water', 'saucer', 'meter', 'newGrowth'].concat(REPOT_AO) }),
    (K) => {
      workTable(K, 'Work table (cover it — repotting is messy)');
      const M = {
        trunk: K.std(0x6f7a4a, { roughness: 0.7 }),
        leaf: leafMat(K, 0x1f4a2a, 0.3), leaf2: leafMat(K, 0x2a5a32, 0.3),
        sheath: K.std(0xb0303a, { roughness: 0.45 }),
        root: K.std(0xe9dcc0, { roughness: 0.8 }), soil: soilMat(K, 0x3a2a1e), mix: soilMat(K, 0x4a3828),
      };
      const perl = K.std(0xf4f2ea, { roughness: 1 });
      const paper = K.part('paper', [0, TOP + 0.002, 0.02], null, 'Newspaper or a tarp to catch the mix');
      K.box(paper, [1.05, 0.002, 0.6], K.std(0xe8e4d8, { roughness: 0.95 }), [0, 0, 0], [0, 3, 0], 0);
      for (let i = 0; i < 9; i++) K.box(paper, [0.3, 0.0005, 0.006], K.std(0x8a8880, { roughness: 1 }), [-0.35 + (i % 3) * 0.35, 0.0013, -0.2 + Math.floor(i / 3) * 0.15], [0, 3, 0], 0);
      // old pot: 6″ black nursery pot with roots out the holes
      const OX = -0.25;
      const oldPot = K.part('oldPot', [OX, TOP, 0], null, 'Old 6″ nursery pot (roots poking out the bottom)');
      K.lathe(oldPot, nurseryLathe(0.076, 0.14), K.std(0x1e1f21, { roughness: 0.55 }));
      const holeRoots = K.part('holeRoots', [0, 0, 0], oldPot, 'Roots growing out of the drainage holes');
      for (let k = 0; k < 7; k++) {
        const a = k * 0.9;
        K.tube(holeRoots, [[Math.cos(a) * 0.04, 0.012, Math.sin(a) * 0.04], [Math.cos(a) * 0.065, 0.004, Math.sin(a) * 0.065], [Math.cos(a + 0.3) * 0.1, 0.002, Math.sin(a + 0.3) * 0.1]], 0.0022, M.root);
      }
      // the plant (y = 0 is the bottom of the root ball)
      const plant = K.part('plant', [OX, TOP + 0.006, 0], null, 'Rubber plant (Ficus elastica), 2 ft tall');
      const ball = K.part('ball', [0, 0, 0], plant, 'Root ball: more roots than soil');
      K.cyl(ball, [0.068, 0.056, 0.124, 32], M.soil, [0, 0.062, 0]);
      rootNet(K, ball, 0.062, 0.12, 18, M.root, 0.002);
      const circ = K.part('circling', [0, 0, 0], plant, 'Circling roots wound around the bottom');
      for (let k = 0; k < 4; k++) K.tor(circ, [0.055 - k * 0.002, 0.0035, 360], M.root, [0, 0.01 + k * 0.012, 0], [90, 0, k * 40]).scale.set(1, 1, 0.8);
      const fol = K.group(plant, [0, 0.122, 0]);
      K.cyl(fol, [0.062, 0.062, 0.004, 32], M.soil, [0, 0, 0]);
      rubberPlant(K, fol, 1, M);
      const teased = K.part('teased', [0, 0, 0], plant, 'Roots teased loose so they point outward');
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        const y = 0.008 + (k % 4) * 0.02;
        K.tube(teased, [[Math.cos(a) * 0.05, y, Math.sin(a) * 0.05], [Math.cos(a) * 0.075, y - 0.006, Math.sin(a) * 0.075], [Math.cos(a + 0.2) * 0.095, y - 0.012, Math.sin(a + 0.2) * 0.095]], 0.0016, M.root);
      }
      const cut = K.part('cut', [0, 0, 0], plant, '3–4 shallow vertical slits through a solid root mat');
      [0, 1.6, 3.2, 4.7].forEach((a) => K.box(cut, [0.0025, 0.1, 0.004], K.std(0xf6efe0, { roughness: 0.6 }), [Math.cos(a) * 0.064, 0.06, Math.sin(a) * 0.064], [0, -a / K.DEG, 0], 0));
      const newG = K.part('newGrowth', [0, 0, 0], plant, 'A month later: a new leaf unfurling');
      K.cone(newG, [0.008, 0.08, 10], M.sheath, [0.0, 0.122 + 0.67, 0]);
      leaf(K, newG, [0, 0.122 + 0.66, 0], 40, 60, 0.1, 0.04, leafMat(K, 0x4a7a3a, 0.3));
      // new pot: 8″ terra-cotta with hole, screen, base mix
      const NX = 0.25;
      const newPot = K.part('newPot', [NX, TOP, 0], null, 'New pot: 8″ (just 1–2″ wider), with a drainage hole');
      const terra = K.bumpy(0xc0663e, TB.tex.speckle(), 0.005, { roughness: 0.85 });
      K.lathe(newPot, potLathe(0.1, 0.18), terra);
      K.cyl(newPot, [0.008, 0.008, 0.003, 16], 'black', [0, 0.011, 0]);
      const screen = K.part('screen', [NX, TOP + 0.014, 0], null, 'Mesh square over the hole (no gravel layer)');
      K.box(screen, [0.05, 0.002, 0.05], K.std(0x7a8086, { metalness: 0.6, roughness: 0.5, wireframe: true }), [0, 0, 0], null, 0);
      const baseMix = K.part('baseMix', [NX, TOP + 0.012, 0], null, 'Fresh mix in the bottom so the plant sits at the right height');
      K.cyl(baseMix, [potR(0.1, 0.18, 0.04), potR(0.1, 0.18, 0.012), 0.028, 32], M.mix, [0, 0.014, 0]);
      const fill = K.part('fill', [NX, TOP, 0], null, 'Fresh mix filled in around the sides, ½–1″ below the rim');
      K.ext(fill, K.circle(0, 0, potR(0.1, 0.18, 0.16), 36), 0.12, M.mix, [0, 0.16, 0], [90, 0, 0], 0, [K.circle(0, 0, 0.066, 30).reverse()]);
      discSpecks(K, K.group(fill, [0, 0.161, 0]), 40, 0.085, 0, perl, 0.003);
      const saucer = K.part('saucer', [NX, TOP, 0], null, 'Saucer — empty it 15 minutes after watering');
      K.cyl(saucer, [0.095, 0.082, 0.018, 32], terra, [0, 0.009, 0]);
      newPot.position.y += 0.0; // pot sits in the saucer (saucer shown later)
      const water = K.part('water', [0, 0, 0], null, 'Water slowly until it runs out the bottom');
      K.cyl(water, [0.08, 0.08, 0.003, 32], 'water', [NX, TOP + 0.163, 0]);
      const drops = rain(K, water, [NX - 0.03, TOP + 0.42, 0.02], 10, 0.025, 0.24);
      // bag of potting mix + perlite tub
      const bag = K.part('bag', [0.5, TOP, -0.17], null, 'Bagged potting mix (+ perlite or orchid bark for aroids)');
      K.box(bag, [0.24, 0.32, 0.1], K.std(0x2f6a3a, { roughness: 0.6 }), [0, 0.16, 0], [-6, -20, 0], 0.025);
      K.box(bag, [0.18, 0.12, 0.002], K.std(0xf1ead6, { roughness: 0.8 }), [0.018, 0.2, 0.05], [-6, -20, 0], 0);
      const tub = K.group(bag, [-0.12, 0, 0.18]);
      K.lathe(tub, [[0, 0.003], [0.06, 0.003], [0.07, 0.08], [0.075, 0.085], [0.07, 0.085], [0.055, 0], [0, 0]], K.std(0xd8dde2, { roughness: 0.5 }));
      K.cyl(tub, [0.068, 0.068, 0.004, 24], perl, [0, 0.07, 0]);
      discSpecks(K, K.group(tub, [0, 0.073, 0]), 30, 0.06, 0, perl, 0.004);
      // moisture meter
      const meter = K.part('meter', [NX + 0.05, TOP + 0.16, 0.03], null, 'Moisture meter (or your finger, 1–2″ deep)');
      K.cyl(meter, [0.0018, 0.0018, 0.12, 8], 'steel', [0, 0.0, 0], [0, 0, 8]);
      K.box(meter, [0.05, 0.07, 0.022], K.std(0x2f7d3a, { roughness: 0.5 }), [-0.012, 0.09, 0], [0, 0, 8], 0.006);
      K.cyl(meter, [0.017, 0.017, 0.003, 24], K.std(0xf4f2ea, { roughness: 0.5 }), [-0.012, 0.095, 0.012], [90, 0, 8]);
      return { tick(t, fx) { drops(t, fx === 'water'); } };
    }
  );

  /* @@MODELS@@ */

  /* =====================================================================
     Guides
     ===================================================================== */
  const RP = { cam: [0.62, 1.12, 0.62], at: [0, 0.88, 0] };
  const repot = {
    id: 'repot-houseplant',
    title: 'Repot a root-bound houseplant',
    model: 'indRepot',
    level: 1,
    time: '30–45 min',
    cost: '$15–40',
    summary: 'Move a root-bound plant into a pot only 1–2″ wider, with a drainage hole and fresh potting mix, at the same depth it grew before. Loosen circling roots, water it in well, and give it a week out of direct sun to recover.',
    intro: { show: ['paper', 'oldPot', 'plant', 'newPot', 'bag'], hi: ['plant'], spin: true },
    card: [
      ['Best time', 'Spring to early summer, as new growth starts'],
      ['How often', 'Fast growers every 12–18 months; slow growers every 2–3 years'],
      ['New pot', '1–2″ wider than the old one (2–3″ for big, fast plants); drainage hole required'],
      ['Mix', 'Fresh bagged potting mix; aroids like ⅓ orchid bark or perlite added'],
      ['Depth', 'Same soil line as before; mix ½–1″ below the rim'],
      ['Water', 'Drench until it drains, then wait until the top 1–2″ is dry'],
      ['Feed', 'None for 4–6 weeks after repotting'],
      ['Watch for', 'A few days of droop (normal); mix that stays wet over a week (pot too big)'],
    ],
    safety: [
      'Wear gloves for Ficus (rubber plant, fiddle-leaf fig) and Euphorbia: their milky sap irritates skin and eyes.',
      'Many common houseplants (pothos, monstera, peace lily, dieffenbachia) are toxic to cats and dogs if chewed; sweep up leaves and keep scraps away from pets.',
      'Potting mix can carry Legionella bacteria: open bags away from your face, dampen dusty mix, and wash your hands afterward.',
      'Lift big pots with your legs, not your back; a 14″ pot of wet mix can weigh 30+ lb.',
    ],
    causes: [
      ['Is it really root-bound?', 'Look for roots out the drainage holes, water that runs straight through, mix that dries in 1–2 days, a plant that tips over, or roots lifting it in the pot. Slide it out: if you see more roots than soil, it is time.'],
      ['Pick the right pot size', 'Go up only 1–2″ in diameter for pots under 10″, 2–4″ for bigger ones. Each extra inch adds a lot of soil that stays wet, which is how oversized pots cause root rot.'],
      ['Pot material', 'Terra-cotta breathes and dries fast: great for succulents and people who overwater. Plastic and glazed ceramic hold moisture longer: good for ferns, calatheas and people who forget. A pretty pot with no hole can only be a cachepot (an outer cover) around a nursery pot.'],
      ['Choose the mix', 'Most foliage plants: plain bagged potting mix. Aroids (monstera, philodendron, pothos): 2 parts potting mix, 1 part orchid bark, 1 part perlite. Succulents and cacti: a gritty cactus mix. Never use garden soil or topsoil: it packs down and suffocates roots in a pot.'],
      ['Timing', 'Spring and early summer, when the plant is pushing new growth, it regrows roots fastest. Avoid repotting a plant that is in full bloom or in its winter rest unless the roots are rotting.'],
      ['Bigger pot or root prune?', 'If the plant is already as big as you want, slice ¼–⅓ off the outside of the root ball and put it back in the same pot with fresh mix. It refreshes the soil without making the plant larger.'],
    ],
    tools: ['New pot 1–2″ wider, with a drainage hole', 'Fresh potting mix (plus orchid bark or perlite for aroids)', 'Mesh square or coffee filter', 'Clean knife or old bread knife', 'Clean scissors or pruners', 'Newspaper or a tarp', 'Gloves', 'Watering can', 'Saucer'],
    steps: [
      { t: 'Confirm it needs a bigger pot', d: 'Check for roots poking out the drainage holes, water running straight through, or mix that dries out in a day or two. Tip the pot on its side and ease the plant out partway: if you see a solid web of roots with little soil, it is root-bound.', why: 'Roots that fill the pot leave almost no soil to hold water and food, so the plant wilts fast and stops growing. A plant that still has loose soil around its roots does not need a bigger pot yet.', tip: 'If the plant just looks sad but the roots are loose and white with plenty of soil, the problem is light or watering, not the pot. Repotting would only add stress.', ok: 'You can see roots out the bottom and, when you peek, the root ball holds its shape like a plug.', v: { cam: [0.1, 0.9, 0.55], at: [-0.25, 0.82, 0], hi: ['holeRoots', 'oldPot'] } },
      { t: 'Water a day ahead and set up', d: 'Water the plant thoroughly 1–2 days before. On repotting day, cover the table with newspaper, and set out the new pot, mix, a knife, scissors and gloves.', why: 'A moist (not soggy) root ball slides out in one piece and its roots bend instead of snapping. Dry roots tear, and wet mud falls apart.', tip: 'Pre-moisten the new mix too: stir in water until a squeezed handful holds together and drips just once. Bone-dry peat repels water for days.', ok: 'The old pot feels noticeably heavier than when dry, and the mix in the bag clumps when squeezed.', v: { cam: RP.cam, at: RP.at, hi: ['paper', 'newPot', 'bag'], show: ['paper', 'newPot', 'bag'] } },
      { t: 'Choose and prep the new pot', d: 'Use a pot only 1–2″ wider than the old one, with at least one drainage hole. Cover the hole with a square of mesh or a coffee filter. Do not add a layer of gravel or shards.', why: 'Water does not move from fine mix into coarse gravel until the mix above is saturated, so gravel actually raises the soggy zone closer to the roots. A modest pot dries out on time.', tip: 'Reusing an old pot? Scrub it with hot soapy water, soak 10 minutes in 1 part bleach to 9 parts water, and rinse. Soak a dry terra-cotta pot in water for an hour so it does not wick moisture from the new mix.', ok: 'The new pot is 1–2″ wider at the rim, light shows through its hole, and the mesh lies flat over it.', v: { cam: [0.55, 1.05, 0.4], at: [0.25, 0.82, 0], hi: ['newPot', 'screen'], show: ['screen'] } },
      { t: 'Add mix to the bottom', d: 'Put enough moist mix in the bottom so the top of the old root ball will sit ½–1″ below the new rim. Set the old pot inside the new one to check the height, and add or remove mix until it is right.', why: 'The plant must sit at the same depth it grew at. Buried stems rot; a ball that sits too high dries out, and a pot filled to the brim has no room to hold water.', tip: 'Test by setting the old pot in the new one: when its rim sits about ½″ below the new rim, the depth is right.', ok: 'With the old pot set inside, its rim sits ½–1″ below the new pot’s rim.', v: { cam: [0.55, 1.05, 0.4], at: [0.25, 0.82, 0], hi: ['baseMix'], show: ['baseMix'], tool: { id: 'trowel', at: [0.25, 0.9, 0.04], rot: [0, 0, 25] } } },
      { t: 'Slide the plant out', d: 'Hold the stems between your fingers with your palm across the soil, turn the pot upside down, and tap its rim on the table edge. Squeeze the sides of a plastic pot, or run a knife around the inside of a rigid one. Never yank it out by the stem.', why: 'Pulling on the stems tears the fine feeder roots or snaps the plant off at the base. Gravity and a few taps let the ball slide out in one piece.', tip: 'Stuck in a cheap plastic pot? Cut the pot away with scissors. Roots welded through the holes can be snipped flush; those few roots will regrow.', ok: 'The root ball comes free in one piece, with the soil shape of the pot.', v: { cam: [0.2, 1.05, 0.7], at: [-0.22, 0.9, 0], hi: ['ball', 'circling'], mv: { plant: [0, 0.16, 0.08] }, rt: { plant: [-15, 0, 0] } } },
      { t: 'Loosen the circling roots', d: 'Tease the bottom and sides of the root ball with your fingers so roots point outward. If it is a solid mat, make 3–4 shallow vertical cuts, ¼–½″ deep, down the sides with a clean knife, and pull apart the bottom inch.', why: 'Roots that have circled the old pot keep circling in the new one and can choke the plant. Loosened or cut roots branch and grow out into the fresh mix.', tip: 'Snip off any roots that are black, hollow or mushy back to firm, white tissue, and wipe the blades with rubbing alcohol between cuts. If you find lots of rot, switch to the root-rot rescue guide.', ok: 'Root ends hang loose around the bottom and sides instead of wrapping around.', v: { cam: [0.25, 1.0, 0.65], at: [-0.25, 0.9, 0.06], hi: ['teased', 'cut'], show: ['teased', 'cut'], hide: ['circling', 'oldPot'], tool: { id: 'utilityKnife', at: [-0.19, 0.95, 0.09], rot: [0, 0, 20] } } },
      { t: 'Set it in at the same depth', d: 'Center the root ball on the mix in the new pot, upright and with its best side facing you. The old soil surface should sit ½–1″ below the rim, no deeper than it grew before.', why: 'Burying the stem invites stem rot in most houseplants. The gap below the rim lets a full watering soak in instead of spilling over.', tip: 'Lay a pencil across the rim: the old soil line should sit about a fingertip below it.', ok: 'The plant stands straight on its own, centered, and the old soil line sits ½–1″ below the rim.', v: { cam: RP.cam, at: [0.2, 0.88, 0], hi: ['plant', 'newPot'], mv: { plant: [0.5, 0.034, 0] }, rt: { plant: [0, 0, 0] } } },
      { t: 'Fill around the sides and firm gently', d: 'Add moist mix around the root ball, poking it down the sides with your fingers or a chopstick to fill air pockets. Firm lightly; do not pack it. Leave ½–1″ of space below the rim and keep mix off the stems.', why: 'Big air pockets leave roots hanging in the air where they dry out. Packing crushes the pores that carry oxygen to roots, which matters as much as water.', tip: 'Tap the pot on the table two or three times: it settles the mix better than pressing, without compacting it.', ok: 'The mix is level with the top of the root ball, springy when you press, and ½–1″ below the rim.', v: { cam: RP.cam, at: [0.22, 0.88, 0], hi: ['fill'], show: ['fill'], hide: ['teased', 'cut', 'baseMix'], tool: { id: 'trowel', at: [0.33, 0.97, 0.03], rot: [0, 0, 30] } } },
      { t: 'Water thoroughly', d: 'Water slowly over the whole surface until water runs out the drainage hole. Wait a few minutes and do it again. Top up any spots that sank, then empty the saucer after 15 minutes.', why: 'The first soak settles mix around the roots and closes the last air gaps. A plant left standing in a full saucer pulls the water back up and stays soggy.', tip: 'If water races down the sides and out, the mix was too dry: set the pot in a bowl of water for 20–30 minutes until it is heavy, then drain.', ok: 'Water drips from the hole, the surface stays level, and the pot feels evenly heavy.', v: { cam: [0.5, 1.15, 0.6], at: [0.25, 0.9, 0], hi: ['water', 'saucer'], show: ['water', 'saucer'], fx: 'water', tool: { id: 'wateringCan', at: [0.2, 1.18, 0.02], rot: [0, -90, 20], scale: 0.8 } } },
      { t: 'Let it recover', d: 'Put it back in its usual spot but out of direct sun for about a week. Do not fertilize for 4–6 weeks. Water again only when the top 1–2″ of mix is dry.', why: 'Cut and disturbed roots can’t take up as much water for a while, so strong sun makes the plant wilt. Fresh mix usually carries a starter dose of fertilizer, and extra feed burns tender new roots.', tip: 'Some droop for 2–5 days is normal transplant shock. If it is still drooping after a week and the mix is wet, the pot is too big or the mix too dense: let it dry further before watering.', ok: 'Within 1–2 weeks the leaves are firm again; in a month a new leaf unfurls at the tip.', v: { cam: [0.6, 1.25, 0.75], at: [0.25, 1.0, 0], hi: ['meter', 'plant'], show: ['meter'], hide: ['water'], fx: '' } },
      { t: 'Clean up and plan the next one', d: 'Bag leftover mix tightly for next time, rinse the old pot, and note the date. Check the drainage holes in 12 months for fast growers, 2–3 years for slow ones.', why: 'Mix that sits open dries out and grows fungus gnats. A dated note tells you when the next repot is due, before roots start escaping again.', tip: 'Write the repot date on the plant label or on a piece of tape under the pot so it never gets lost.', ok: 'The workspace is clear and the next check date is written down.', v: { cam: [0.75, 1.3, 1.05], at: [0, 0.95, 0], hi: ['newGrowth', 'plant'], show: ['newGrowth'], hide: ['meter', 'paper', 'oldPot', 'holeRoots'] } },
    ],
    tricks: [
      ['Pot-in-pot sizing', 'Before buying, drop the old pot into the new one at the store: you want a finger’s width of space all around, not a fist.'],
      ['Chopstick, not thumbs', 'A wooden chopstick pushes mix into gaps down the sides without crushing roots or compacting the mix.'],
      ['Cachepot trick', 'Love a pot with no hole? Keep the plant in its plastic nursery pot and set that inside, lifted on a saucer or a few pebbles so it never sits in drained water.'],
      ['Fix a too-big pot', 'If you already over-potted and the mix stays wet for 10+ days, move it back down to a pot 1–2″ wider than the root ball rather than waiting for rot.'],
      ['Split instead of upsizing', 'Clumping plants (snake plant, peace lily, ZZ, spider plant) can be pulled or cut into 2–3 divisions, each with roots, and potted separately.'],
      ['Top-dress big plants', 'For a floor plant too heavy to repot, scrape off the top 1–2″ of mix each spring and replace it with fresh mix and a little compost.'],
    ],
    learn: {
      how: 'Roots need both water and air. In a pot, the mix drains from the top but stays wetter at the bottom (a perched water table). When roots fill the pot, the mix left holds too little water and food, so the plant dries out within a day and stalls. Moving it into a pot slightly larger gives roots fresh space without a huge mass of soil that stays wet. Loosening or cutting circling roots makes them branch and head outward into the new mix.',
      specs: [['Pot size step', '+1–2″ diameter (<10″ pots); +2–4″ (larger pots)'], ['Headspace', '½–1″ below rim'], ['Repot frequency', '12–18 months fast growers; 2–3 years slow'], ['Root scoring', '3–4 cuts, ¼–½″ deep'], ['Bleach dip for old pots', '1 part bleach : 9 parts water, 10 min'], ['No fertilizer after', '4–6 weeks'], ['Rewater when', 'Top 1–2″ dry']],
      terms: [['Root-bound (pot-bound)', 'Roots have filled the pot and started circling, leaving little soil.'], ['Drainage hole', 'The hole in the bottom of the pot that lets extra water escape; without it, roots drown.'], ['Cachepot', 'A decorative outer pot with no hole that hides a plain nursery pot.'], ['Perched water table', 'The soggy layer that always sits at the bottom of a pot after watering.'], ['Transplant shock', 'Temporary drooping or leaf drop while disturbed roots regrow.'], ['Aroid', 'The plant family of monstera, philodendron, pothos and peace lily; most like a chunky, airy mix.']],
      mistakes: ['Jumping to a pot much bigger than the root ball.', 'Using a pot with no drainage hole.', 'Adding a gravel layer “for drainage.”', 'Using garden soil.', 'Burying the stem deeper than it grew.', 'Packing the mix down hard.', 'Fertilizing right after repotting.'],
      tips: ['Repot newly bought plants only if they are root-bound; most are fine in their nursery pot for a few months.', 'Group plants that need repotting and do them all in one messy session.', 'Keep a bag of perlite and a bag of orchid bark on hand to tune any mix.'],
    },
    pro: 'Very large or heavy specimens (6 ft+ trees in 14″+ pots), valuable bonsai, or plants with extensive rot are worth taking to a good independent garden center, many of which repot for a small fee.',
    refs: [
      ['Houseplants: Repotting (Colorado State University Extension, PlantTalk)', 'https://planttalk.colostate.edu/topics/houseplants/1316-houseplants-repotting/'],
      ['Spring houseplant care (University of Minnesota Extension)', 'https://extension.umn.edu/houseplants/spring-houseplant-care'],
      ['Houseplants handbook (University of Arkansas Cooperative Extension)', 'https://www.uaex.uada.edu/yard-garden/master-gardeners/Houseplants.pdf'],
      ['Overwatered houseplants (Chicago Botanic Garden)', 'https://www.chicagobotanic.org/plant-information/overwatered-houseplants'],
      ['Care and selection of indoor plants (Mississippi State University Extension)', 'https://accessibility.extension.msstate.edu/publications/care-selection-indoor-plants'],
    ],
    variants: [
      { id: 'up', name: 'Pot up (bigger pot)', blurb: 'The usual job: move the plant into a pot 1–2″ wider.' },
      { id: 'same', name: 'Root-prune, same pot', blurb: 'Keep the plant the same size: shave ¼–⅓ off the outside of the root ball and return it to its cleaned pot with fresh mix.', summary: 'Slide the plant out, slice ¼–⅓ off the bottom and sides of the root ball with a clean bread knife, trim the top growth by about the same fraction, and repot in the same cleaned pot with fresh mix at the same depth.' },
    ],
  };

  /* @@GUIDES@@ */

  TB.category({
    id: 'grow-indoor',
    icon: 'houseplant',
    code: 'IND',
    name: 'Indoor & houseplants',
    domain: 'grow',
    kind: 'grow',
    blurb: 'Repot, propagate, rescue and light your houseplants, rebloom orchids, and grow greens indoors',
    repairs: [repot /* @@LIST@@ */],
  });
})();
