/* P3 · Outside & yard: more guides for roof, deck, fence, concrete and lawn.
   Every scene is built in real meters (unit: 1) so tools sit at true size. */
(function () {
  const XM = (TB.XM = {});
  const DEGR = Math.PI / 180;
  XM.view = (o) =>
    Object.assign({ unit: 1, env: 'garden', ground: { tex: 'aerial_grass_rock', repeat: 8, radius: 8 }, tex: ['aerial_grass_rock'] }, o);
  // World point on a sloped plane: origin O, pitch (deg) about X; local -z runs up-slope, local +y is the surface normal.
  XM.slope = (O, deg) => (x, y, z) => {
    const c = Math.cos(deg * DEGR);
    const s = Math.sin(deg * DEGR);
    return [O[0] + x, O[1] + y * c - z * s, O[2] + y * s + z * c].map((v) => +v.toFixed(3));
  };
  // Open polyline -> closed strip outline of thickness t (to the left of travel).
  XM.thin = (pts, t) => {
    const n = pts.length;
    const off = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const L = Math.hypot(dx, dy) || 1;
      off.push([pts[i][0] - (dy / L) * t, pts[i][1] + (dx / L) * t]);
    }
    return pts.concat(off.reverse());
  };
  // Extrude a profile given as [u = out from the wall (+z), v = up] along +x from x0 to x1.
  XM.runX = (K, parent, pts, x0, x1, mat, pos) => {
    const g = K.group(parent, pos || [0, 0, 0], [0, 90, 0]);
    return K.ext(g, pts.map(([u, v]) => [-u, v]), x1 - x0, mat, [0, 0, x0]);
  };
  // Box spanning two points (any direction), cross-section w × d.
  XM.span = (K, parent, a, b, w, d, mat, roll) => {
    const va = new THREE.Vector3(a[0], a[1], a[2]);
    const vb = new THREE.Vector3(b[0], b[1], b[2]);
    const me = K.box(parent, [w, va.distanceTo(vb), d], mat, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], null, Math.min(w, d) * 0.12);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    if (roll) me.rotateY(roll * DEGR);
    return me;
  };
  // Lap siding on a wall whose face is at z (boards overlap with a shadow line).
  XM.siding = (K, parent, x0, x1, y0, y1, z, color) => {
    const m = K.bumpy(color || 0xd9d4c7, K.tex.woodBump(), 0.003, { roughness: 0.85 });
    const ex = 0.115;
    for (let y = y0; y < y1 - 0.01; y += ex) {
      const h = Math.min(ex + 0.012, y1 - y);
      K.box(parent, [x1 - x0, h, 0.014], m, [(x0 + x1) / 2, y + h / 2, z + 0.008], [-5, 0, 0], 0.002);
    }
  };
  // 3-tab asphalt shingle courses on a roof-local group R (x across, -z up-slope, +y normal).
  XM.shingles = (K, R, o) => {
    const E = o.exp || 0.143;
    const W = 1 / 3;
    const mats = [0x4b4f55, 0x56595e, 0x40444a, 0x5d5f62].map((c) => K.bumpy(c, K.tex.speckle(), 0.006, { roughness: 0.95 }));
    for (let r = 0; r < o.rows; r++) {
      const off = (r % 2) * (W / 2);
      const zc = (o.z0 || 0) - r * E - (E + 0.012) / 2;
      for (let x = o.x0 - off; x < o.x1; x += W) {
        const a = Math.max(x, o.x0);
        const b = Math.min(x + W - 0.006, o.x1);
        if (b - a < 0.02) continue;
        const cx = (a + b) / 2;
        const par = (o.pick && o.pick(r, cx)) || R;
        const lift = (o.lift && o.lift(r, cx)) || 0;
        K.box(par, [b - a, 0.006, E + 0.012], mats[Math.abs(Math.round(x * 3) + r * 7) % 4], [cx, 0.003 + r * 0.0012 + lift, zc], null, 0.001);
      }
    }
  };
  // 5″ K-style gutter profile (u, v) as an open polyline, bottom-back corner at 0,0.
  XM.kProfile = [[0, 0.115], [0, 0], [0.09, 0], [0.098, 0.012], [0.1, 0.03], [0.112, 0.04], [0.115, 0.06], [0.12, 0.075], [0.122, 0.1], [0.127, 0.112], [0.127, 0.119], [0.117, 0.121]];
  XM.kFill = XM.kProfile.slice(0, -1).concat([[0.127, 0.115], [0, 0.115]]);

  /* Eave: lap-sided wall (face z = 0), soffit, 2×6 fascia (face z = 0.40), drip edge and shingle courses. */
  XM.eave = (K, o) => {
    o = o || {};
    const x0 = o.x0 || -2.2;
    const x1 = o.x1 || 2.2;
    const wall = K.part('wall', [0, 0, 0], null, 'House wall');
    XM.siding(K, wall, x0, x1, 0, 2.6, 0, o.siding || 0xd6d2c4);
    K.box(wall, [x1 - x0, 0.2, 0.03], K.std(0x9a958a, { roughness: 0.95 }), [(x0 + x1) / 2, 0.1, 0.02], null, 0.004); // foundation
    const trim = K.std(0xf4f2ec, { roughness: 0.5 });
    const fascia = K.part('fascia', [0, 0, 0], null, 'Fascia board');
    K.box(fascia, [x1 - x0, 0.016, 0.4], trim, [(x0 + x1) / 2, 2.598, 0.2], null, 0.002); // soffit
    K.box(fascia, [x1 - x0, 0.14, 0.03], trim, [(x0 + x1) / 2, 2.67, 0.385], null, 0.003);
    const O = [0, 2.755, 0.425];
    const R = K.group(null, O, [26.6, 0, 0]);
    const roof = K.part('roof', [0, 0, 0], R, 'Asphalt shingles');
    K.box(roof, [x1 - x0, 0.012, 1.4], K.std(0xb48a5a, { roughness: 0.9 }), [(x0 + x1) / 2, -0.006, -0.68], null, 0);
    XM.shingles(K, roof, { x0, x1, rows: o.rows || 9, pick: o.pick, lift: o.lift });
    K.box(fascia, [x1 - x0, 0.045, 0.004], trim, [(x0 + x1) / 2, 2.735, 0.418], null, 0); // drip edge face
    return { O, R, pt: XM.slope(O, 26.6) };
  };

  // K-style gutter run from x0 to x1 whose bottom-back corner sits at parent origin (+ pos).
  XM.gutterRun = (K, parent, x0, x1, mat, opts) => {
    opts = opts || {};
    XM.runX(K, parent, XM.thin(XM.kProfile, 0.0016), x0, x1, mat);
    if (opts.capL) XM.runX(K, parent, XM.kFill, x0 - 0.002, x0, mat);
    if (opts.capR) XM.runX(K, parent, XM.kFill, x1, x1 + 0.002, mat);
  };
  XM.gutterMats = (K, vinyl) =>
    vinyl ? K.std(0xf3f2ee, { roughness: 0.45 }) : K.std(0xf1efe8, { metalness: 0.25, roughness: 0.35 });

  // Rectangular 2×3″ downspout from the outlet at (x, z) down the wall, with an elbow and a kick-out.
  XM.downspout = (K, part, x, mat, o) => {
    o = o || {};
    const w = 0.075;
    const d = 0.05;
    K.cyl(part, [0.03, 0.03, 0.05, 20], mat, [x, 2.59, 0.46]);
    XM.span(K, part, [x, 2.6, 0.46], [x, 2.42, 0.46], w, d, mat);
    XM.span(K, part, [x, 2.44, 0.46], [x, 2.2, 0.05], w, d, mat);
    XM.span(K, part, [x, 2.22, 0.05], [x, 0.28, 0.05], w, d, mat);
    XM.span(K, part, [x, 0.3, 0.05], [x, 0.12, 0.26], w, d, mat);
    const strap = K.std(0xdedcd5, { metalness: 0.3, roughness: 0.4 });
    [1.9, 1.1].forEach((y) => K.box(part, [w + 0.02, 0.025, d + 0.012], strap, [x, y, 0.05], null, 0.003));
    if (o.splash !== false) K.box(part, [0.3, 0.035, 0.6], 'concrete', [x, 0.018, 0.48], null, 0.01);
  };

  /* =================== Roof: plumbing vent boot =================== */
  const VB_O = [0, 2.6, 0.8];
  const vb = XM.slope(VB_O, 26.6);
  const VB_P = vb(0.15, 0, -1.3); // where the vent pipe meets the roof
  XM.vb = vb;
  TB.model(
    'xVentBoot',
    XM.view({ cam: [1.25, 4.15, 1.25], at: [0.15, 3.25, -0.36], hidden: ['newBoot', 'newNails', 'sealant', 'repairCollar', 'nailSeal'] }),
    (K) => {
      const R = K.group(null, VB_O, [26.6, 0, 0]);
      const roof = K.part('roof', [0, 0, 0], R, 'Asphalt shingle roof');
      const upper = K.part('upperTabs', [0, 0, 0], R, 'Shingles over the boot’s top flange');
      K.box(roof, [3.0, 0.012, 2.5], K.std(0xb48a5a, { roughness: 0.9 }), [0, -0.006, -1.2], null, 0);
      const near = (x) => Math.abs(x - 0.15) < 0.33;
      XM.shingles(K, roof, {
        x0: -1.5,
        x1: 1.5,
        rows: 16,
        pick: (r, x) => (r >= 9 && r <= 10 && near(x) ? upper : null),
        lift: (r, x) => (r >= 9 && near(x) ? 0.004 : 0),
      });
      // eave, wall, gutter for context
      const trim = K.std(0xf4f2ec, { roughness: 0.5 });
      K.box(null, [3.0, 0.14, 0.03], trim, [0, 2.53, 0.8], null, 0.003);
      XM.runX(K, null, XM.thin(XM.kProfile, 0.0016), -1.5, 1.5, XM.gutterMats(K), [0, 2.47, 0.815]);
      K.box(null, [3.0, 0.016, 0.4], trim, [0, 2.46, 0.6], null, 0.002);
      XM.siding(K, null, -1.5, 1.5, 0, 2.46, 0.4, 0xc9c3b4);
      // vent pipe (3″ PVC), vertical in the world
      const pipe = K.part('pipe', [VB_P[0], VB_P[1], VB_P[2]], null, '3″ plumbing vent pipe');
      const pvc = K.std(0xe9e7e0, { roughness: 0.55 });
      K.cyl(pipe, [0.0445, 0.0445, 0.62, 32], pvc, [0, 0.04, 0]);
      K.cyl(pipe, [0.039, 0.039, 0.004, 32], 'black', [0, 0.352, 0]);
      K.tor(pipe, [0.0445, 0.002], K.std(0xb9b4a6), [0, 0.35, 0], [90, 0, 0]);
      // boot builder: galvanized flange (follows the roof) + dome + rubber collar (vertical)
      const boot = (name, label, rubber, metal) => {
        const b = K.part(name, [VB_P[0], VB_P[1], VB_P[2]], null, label);
        const fl = K.group(b, [0, 0, 0], [26.6, 0, 0]);
        const sq = [[-0.15, -0.2], [0.15, -0.2], [0.15, 0.17], [-0.15, 0.17]];
        K.ext(fl, sq, 0.0015, metal, [0, 0.0185, 0], [90, 0, 0], 0, [K.circle(0, 0, 0.1, 28).reverse()]);
        K.lathe(b, [[0.118, -0.06], [0.112, 0.0], [0.09, 0.05], [0.062, 0.078], [0.06, 0.082]], metal, [0, 0.0, 0]);
        K.lathe(b, [[0.064, 0.072], [0.064, 0.085], [0.052, 0.1], [0.049, 0.16], [0.0455, 0.165]], rubber, [0, 0, 0]);
        return b;
      };
      const ob = boot('oldBoot', 'Old boot (cracked rubber collar)', K.std(0x6b6a66, { roughness: 1 }), K.std(0x9ea2a4, { metalness: 0.5, roughness: 0.6 }));
      const crack = K.part('crack', [0, 0.12, 0], ob, 'Split, sun-rotted collar');
      K.rep(5, (i) => K.box(crack, [0.003, 0.03 + (i % 2) * 0.015, 0.004], 'black', [Math.cos(0.4 + i * 0.25) * 0.051, (i % 3) * 0.008, Math.sin(0.4 + i * 0.25) * 0.051], [0, -(0.4 + i * 0.25) / DEGR, 12 - i * 6], 0));
      K.box(crack, [0.04, 0.004, 0.006], K.std(0x2a2826), [0.01, -0.025, 0.05], [0, 0, 8], 0);
      const on = K.part('oldNails', [0, 0, 0], ob, 'Exposed nail heads');
      const flp = XM.slope([0, 0, 0], 26.6);
      [[-0.12, 0.13], [0.12, 0.13], [-0.12, -0.15], [0.12, -0.15]].forEach(([x, z]) => K.cyl(on, [0.0055, 0.0055, 0.003, 12], K.std(0x8a8072, { metalness: 0.6, roughness: 0.6 }), flp(x, 0.021, z), [26.6, 0, 0]));
      boot('newBoot', 'New boot (EPDM collar, galvanized base)', K.std(0x1f2124, { roughness: 0.8 }), K.std(0xcfd3d6, { metalness: 0.8, roughness: 0.35 }));
      const nn = K.part('newNails', [VB_P[0], VB_P[1], VB_P[2]], null, '1¼″ roofing nails (top corners, under shingles)');
      [[-0.12, -0.15], [0.12, -0.15]].forEach(([x, z]) => K.cyl(nn, [0.006, 0.006, 0.003, 12], 'steel', flp(x, 0.022, z), [26.6, 0, 0]));
      const seal = K.part('sealant', [VB_P[0], VB_P[1], VB_P[2]], null, 'Roofing sealant dabs');
      [[-0.12, -0.15], [0.12, -0.15], [-0.15, -0.05], [0.15, -0.05]].forEach(([x, z]) => K.sph(seal, 0.014, K.std(0x111214, { roughness: 0.3 }), flp(x, 0.024, z), [1.2, 0.35, 1.2]));
      const rc = K.part('repairCollar', [VB_P[0], VB_P[1], VB_P[2]], null, 'Slip-on repair collar');
      K.lathe(rc, [[0.075, 0.05], [0.074, 0.075], [0.058, 0.09], [0.0465, 0.1], [0.0465, 0.19], [0.05, 0.195]], K.std(0x2a2c2f, { roughness: 0.7 }));
      K.tor(rc, [0.052, 0.004], 'steel', [0, 0.175, 0], [90, 0, 0]);
      const ns = K.part('nailSeal', [VB_P[0], VB_P[1], VB_P[2]], null, 'Sealant over old nail heads');
      [[-0.12, 0.13], [0.12, 0.13]].forEach(([x, z]) => K.sph(ns, 0.016, K.std(0x111214, { roughness: 0.3 }), flp(x, 0.024, z), [1.2, 0.35, 1.2]));
      const drops = [0, 1, 2].map((i) => K.drip(null, [VB_P[0] + 0.03 - i * 0.02, VB_P[1] + 0.13, VB_P[2] + 0.06], 0.14));
      return {
        tick(t, fx) {
          drops.forEach((d, i) => d.tick(t + i * 0.33, fx === 'leak', 0.9));
        },
      };
    }
  );

  /* =================== Roof: sagging / leaking gutter (aluminum & vinyl) =================== */
  const gutterSag = (vinyl) => (K) => {
    XM.eave(K);
    const gm = XM.gutterMats(K, vinyl);
    // right run is fine; left run sags from the seam
    const gR = K.part('gutterR', [0, 2.615, 0.4], null, vinyl ? 'Vinyl gutter (level)' : 'Aluminum gutter (level)');
    XM.gutterRun(K, gR, 0.0, 1.9, gm, { capR: true });
    K.cyl(gR, [0.032, 0.032, 0.003, 20], 'dark', [1.5, 0.002, 0.06]);
    const gL = K.part('gutterL', [0, 2.615, 0.4], null, 'Sagging section');
    XM.gutterRun(K, gL, -1.9, 0.0, gm, { capL: true });
    gL.rotation.set(0, 1.4 * DEGR, 2.4 * DEGR);
    const fast = K.std(0xb9bec3, { metalness: 0.85, roughness: 0.35 });
    const oldH = K.part('oldHangers', [0, 0, 0], vinyl ? null : gL, vinyl ? 'Broken bracket' : 'Loose spikes & ferrules');
    if (!vinyl) {
      [-1.5, -0.7].forEach((x, i) => {
        K.cyl(oldH, [0.006, 0.006, 0.127, 12], fast, [x, 0.108, 0.064], [90, 0, 0]);
        K.cyl(oldH, [0.0035, 0.0035, 0.2, 8], fast, [x, 0.108, 0.06 + (i ? 0.03 : 0.05)], [90, 0, 0]);
        K.cyl(oldH, [0.009, 0.009, 0.004, 14], fast, [x, 0.108, 0.16 + (i ? 0.03 : 0.05)], [90, 0, 0]);
      });
      [0.6, 1.4].forEach((x) => {
        K.cyl(gR, [0.006, 0.006, 0.127, 12], fast, [x, 0.108, 0.064], [90, 0, 0]);
        K.cyl(gR, [0.009, 0.009, 0.004, 14], fast, [x, 0.108, 0.129], [90, 0, 0]);
      });
    } else {
      const g = K.group(oldH, [-0.9, 2.62, 0.402], [0, 0, 14]);
      K.box(g, [0.04, 0.12, 0.004], 'white', [0, 0.05, 0], null, 0);
      K.box(g, [0.04, 0.004, 0.07], 'white', [0, -0.008, 0.035], null, 0);
      K.box(oldH, [0.012, 0.012, 0.006], 'steel', [-0.9, 2.7, 0.404], null, 0);
    }
    const bracket = (p, x) => {
      if (vinyl) {
        K.box(p, [0.04, 0.12, 0.004], 'white', [x, 2.67, 0.402], null, 0);
        K.box(p, [0.04, 0.004, 0.135], 'white', [x, 2.611, 0.468], null, 0);
        K.box(p, [0.04, 0.035, 0.004], 'white', [x, 2.628, 0.535], null, 0);
        K.box(p, [0.04, 0.008, 0.012], 'white', [x, 2.646, 0.53], null, 0);
        K.screw(p, 0.0045, 0.035, 'steel', [x, 2.7, 0.405], [90, 0, 0]);
      } else {
        K.box(p, [0.025, 0.004, 0.128], fast, [x, 2.728, 0.464], null, 0);
        K.box(p, [0.025, 0.012, 0.004], fast, [x, 2.722, 0.527], null, 0);
        K.box(p, [0.025, 0.03, 0.004], fast, [x, 2.712, 0.403], null, 0);
        K.screw(p, 0.0055, 0.075, K.std(0x9aa0a6, { metalness: 0.8, roughness: 0.3 }), [x, 2.712, 0.418], [90, 0, 0]);
      }
    };
    const nh = K.part('newHangers', [0, 0, 0], null, vinyl ? 'New fascia brackets (every 24″)' : 'Hidden hangers + 7″ screws (every 24″)');
    [-1.7, -1.1, -0.5].forEach((x) => bracket(nh, x));
    if (vinyl) [0.3, 0.9, 1.5].forEach((x) => bracket(null, x));
    // seam / connector at x = 0
    const seam = K.part('seam', [0, 2.615, 0.4], null, vinyl ? 'Union connector (worn gasket)' : 'Lapped seam (failed sealant)');
    if (vinyl) {
      XM.runX(K, seam, XM.thin(XM.kProfile.map(([u, v]) => [u * 1.04 - 0.002, v * 1.03 - 0.003]), 0.002), -0.07, 0.07, K.std(0xe8e6df, { roughness: 0.5 }));
      K.box(seam, [0.004, 0.13, 0.004], K.std(0xcfcac0), [0, 0.06, -0.004], null, 0);
    } else {
      XM.runX(K, seam, XM.thin(XM.kProfile.map(([u, v]) => [u * 1.02 - 0.001, v * 1.02 - 0.001]), 0.0016), -0.06, 0.06, gm);
      [-0.03, 0.03].forEach((x) => [0.03, 0.08].forEach((v) => K.cyl(seam, [0.003, 0.003, 0.006, 8], fast, [x, v, -0.002], [90, 0, 0])));
      const old = K.part('oldSeal', [0, 0, 0], seam, 'Cracked old sealant');
      K.rep(4, (i) => K.box(old, [0.03, 0.003, 0.012], K.std(0x55524c, { roughness: 1 }), [-0.05 + i * 0.033, 0.003, 0.04 + (i % 2) * 0.012], [0, i * 20, 0], 0));
    }
    const seal = K.part('sealant', [0, 2.615, 0.4], null, vinyl ? 'New gasketed connector' : 'Fresh gutter sealant bead');
    if (vinyl) XM.runX(K, seal, XM.thin(XM.kProfile.map(([u, v]) => [u * 1.045 - 0.002, v * 1.035 - 0.003]), 0.0025), -0.072, 0.072, K.std(0xffffff, { roughness: 0.35 }));
    else {
      K.box(seal, [0.008, 0.006, 0.09], K.std(0x7b7f84, { roughness: 0.4 }), [0.06, 0.004, 0.045], null, 0.002);
      K.box(seal, [0.008, 0.09, 0.006], K.std(0x7b7f84, { roughness: 0.4 }), [0.06, 0.05, 0.004], null, 0.002);
      K.box(seal, [0.008, 0.006, 0.09], K.std(0x7b7f84, { roughness: 0.4 }), [-0.06, 0.004, 0.045], null, 0.002);
    }
    const ds = K.part('downspout', [0, 0, 0], null, 'Downspout');
    XM.downspout(K, ds, 1.5, gm);
    const prop = K.part('prop', [0, 0, 0], null, '2×4 prop holding the run up');
    XM.span(K, prop, [-0.95, 0.0, 0.85], [-0.95, 2.6, 0.47], 0.089, 0.038, 'woodLight');
    K.box(prop, [0.3, 0.038, 0.089], 'woodLight', [-0.95, 2.592, 0.47], null, 0.004);
    const drops = [0, 1].map((i) => K.drip(null, [0.01 * i, 2.605, 0.46 + i * 0.02], 2.5));
    const flow = K.cyl(null, [0.02, 0.03, 0.3, 12], 'water', [1.5, 0.12, 0.42], [70, 0, 0]);
    flow.userData.noPick = true;
    return {
      tick(t, fx) {
        drops.forEach((d, i) => d.tick(t + i * 0.5, fx === 'leak', 0.6));
        flow.visible = fx === 'flow';
        if (fx === 'flow') flow.scale.y = 0.8 + 0.2 * Math.sin(t * 9);
      },
    };
  };
  const GS_VIEW = { cam: [1.7, 2.1, 2.7], at: [-0.3, 2.55, 0.45], hidden: ['newHangers', 'sealant', 'prop'] };
  TB.model('xGutterAlu', XM.view(GS_VIEW), gutterSag(false));
  TB.model('xGutterVinyl', XM.view(GS_VIEW), gutterSag(true));

  /* =================== Roof: gutter guards + downspout extension (build) =================== */
  TB.model(
    'xGutterGuard',
    XM.view({ cam: [1.9, 3.3, 2.4], at: [0, 2.6, 0.4], tex: ['aerial_grass_rock'], hidden: ['guard1', 'guard2', 'guard3', 'guardScrews', 'extension', 'endCap'] }),
    (K) => {
      XM.eave(K);
      const gm = XM.gutterMats(K);
      const g = K.part('gutter', [0, 2.615, 0.4], null, 'Clean 5″ K-style gutter');
      XM.gutterRun(K, g, -2.0, 2.0, gm, { capL: true, capR: true });
      K.cyl(g, [0.032, 0.032, 0.003, 20], 'dark', [1.6, 0.002, 0.06]);
      const hang = K.part('hangers', [0, 0, 0], null, 'Hidden hangers');
      const fast = K.std(0xb9bec3, { metalness: 0.85, roughness: 0.35 });
      [-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].forEach((x) => {
        K.box(hang, [0.025, 0.004, 0.128], fast, [x, 2.728, 0.464], null, 0);
        K.box(hang, [0.025, 0.012, 0.004], fast, [x, 2.722, 0.527], null, 0);
      });
      const deb = K.part('debris', [0, 2.625, 0.46], null, 'Leaves & roof grit');
      const leafC = [0xb2662b, 0x8a5a2b, 0x6d4f2a, 0xc3892f];
      K.rep(40, (i) => K.sph(deb, 0.03, K.std(leafC[i % 4], { roughness: 1 }), [-1.9 + i * 0.095, 0.015 + (i % 3) * 0.008, ((i * 37) % 7) * 0.008 - 0.02], [1.6, 0.35, 1]));
      // micro-mesh guard panels: from under the first shingle course down to the front lip
      const P = XM.slope([0, 2.755, 0.425], 26.6);
      const back = P(0, 0.002, -0.11);
      const front = [0, 2.737, 0.528];
      const meshM = K.std(0x7d858c, { metalness: 0.75, roughness: 0.45, transparent: true, opacity: 0.88 });
      const frameM = K.std(0x2b2e32, { metalness: 0.5, roughness: 0.45 });
      const len = Math.hypot(front[1] - back[1], front[2] - back[2]);
      const ang = Math.atan2(back[1] - front[1], front[2] - back[2]) / DEGR;
      const panel = (name, x0, x1) => {
        const p = K.part(name, [0, 0, 0], null, 'Micro-mesh guard panel (4 ft)');
        const gg = K.group(p, [(x0 + x1) / 2, (back[1] + front[1]) / 2, (back[2] + front[2]) / 2], [ang, 0, 0]);
        K.box(gg, [x1 - x0, 0.004, len], meshM, [0, 0, 0], null, 0);
        for (let x = x0 + 0.03; x < x1; x += 0.05) K.box(gg, [0.003, 0.006, len], frameM, [x - (x0 + x1) / 2, 0.001, 0], null, 0);
        K.box(gg, [x1 - x0, 0.01, 0.016], frameM, [0, 0.003, len / 2 - 0.008], null, 0.002);
        K.box(gg, [x1 - x0, 0.008, 0.02], frameM, [0, 0.002, -len / 2 + 0.01], null, 0.002);
        K.box(gg, [0.012, 0.012, len], frameM, [-(x1 - x0) / 2 + 0.006, 0.004, 0], null, 0.002);
        return p;
      };
      panel('guard1', 0.79, 2.0);
      panel('guard2', -0.42, 0.79);
      panel('guard3', -2.0, -0.42);
      const sc = K.part('guardScrews', [0, 0, 0], null, 'Self-tapping screws into the front lip');
      for (let x = -1.9; x < 2.0; x += 0.4) K.cyl(sc, [0.005, 0.005, 0.006, 6], 'steel', [x, 2.739, 0.53], [80, 0, 0]);
      const ec = K.part('endCap', [0, 0, 0], null, 'End plugs');
      [-2.0, 2.0].forEach((x) => K.box(ec, [0.006, 0.05, 0.13], frameM, [x, 2.74, 0.465], null, 0.002));
      const ds = K.part('downspout', [0, 0, 0], null, 'Downspout');
      XM.downspout(K, ds, 1.6, gm, { splash: false });
      const ex = K.part('extension', [0, 0, 0], null, 'Hinged 4 ft downspout extension');
      const ext = (a, b) => XM.span(K, ex, a, b, 0.085, 0.06, K.std(0x9b9a92, { metalness: 0.2, roughness: 0.5 }));
      ext([1.6, 0.13, 0.25], [1.6, 0.05, 0.6]);
      ext([1.6, 0.05, 0.58], [1.6, 0.03, 1.6]);
      K.rep(9, (i) => K.box(ex, [0.09, 0.066, 0.008], K.std(0x86857e), [1.6, 0.04, 0.68 + i * 0.1], [-1, 0, 0], 0.002));
      K.box(ex, [0.32, 0.03, 0.5], 'concrete', [1.6, 0.015, 1.85], null, 0.01);
      const flow = K.part('water', [0, 0, 0], null, 'Rinse water');
      const wm = K.std(0x8cc6f0, { transparent: true, opacity: 0.5, roughness: 0.05 });
      K.box(flow, [3.8, 0.008, 0.18], wm, [0, 2.79, 0.46], [-20, 0, 0], 0);
      K.cyl(flow, [0.025, 0.035, 0.3, 12], wm, [1.6, 0.05, 1.75], [80, 0, 0]);
      return {
        tick(t, fx) {
          flow.visible = fx === 'rinse';
        },
      };
    }
  );

  /* ---------------- Roof guides ---------------- */
  const BOOT_SAFE = ['Work only on a dry, calm day. On anything steeper than 6/12 or above one story, use a roof harness anchored to a rafter or hire it out.', 'Set the ladder 1 ft out for every 4 ft of height and extend it 3 ft above the eave.', 'Soft-soled shoes; asphalt shingles are slippery when dusty or frosty.'];
  const bootLearn = {
    how: 'A pipe boot is a metal flange with a rubber collar that squeezes the vent pipe. Water running down the roof hits the boot, sheds over the lower flange onto the shingles below, and the collar keeps it from following the pipe into the attic. The flange works only if its top half is tucked under the shingles above, like a shingle itself. UV rays bake the rubber collar until it splits, usually long before the shingles wear out.',
    specs: [['Typical vent sizes', '1½″, 2″, 3″ (3″ PVC = 3½″ OD)'], ['Collar life', 'Rubber 8–12 years; silicone or lead 20+'], ['Nails', '1¼″ galvanized roofing nails, top corners only'], ['Overlap', 'Top flange under ≥ 1 course; bottom flange on top']],
    terms: [['Pipe boot / jack', 'Flashing that seals around a vent pipe.'], ['Collar', 'The rubber gasket that grips the pipe.'], ['Seal strip', 'Tar line that glues each shingle tab down.'], ['Exposed nail', 'A nail not covered by a shingle. Every one is a leak waiting to happen.']],
    mistakes: ['Caulking around a split collar instead of replacing it.', 'Nailing the bottom flange through the shingles below.', 'Setting the whole flange on top of the shingles so water runs under the top edge.'],
    tips: ['Buy a boot sized for the pipe’s outside diameter, not the nominal size.', 'Do the job on a warm morning so tabs bend without cracking, but before the sun softens the tar.'],
  };
  const roofTools = (...extra) => ['Extension ladder + standoff', 'Flat pry bar', 'Hammer'].concat(extra);

  const g = (x, y, z) => XM.vb(x, y, z);
  TB.more('roof', [
    {
      id: 'vent-boot',
      title: 'Fix a leaking plumbing vent boot',
      model: 'xVentBoot',
      level: 3,
      time: '1–2 hrs',
      cost: '$15–40',
      summary: 'A stain on the ceiling under a vent pipe usually means the rubber collar on the pipe boot has split. Swapping the boot means lifting two shingle courses, pulling four nails and sliding a new one on.',
      intro: { hi: ['oldBoot', 'crack'], fx: 'leak' },
      safety: BOOT_SAFE,
      causes: [['Split rubber collar', 'Sun and heat rot it in 8–12 years. By far the most common cause.'], ['Exposed or popped nails', 'Nails through the lower flange leak around their heads.'], ['Flange laid over the shingles', 'Water runs under its top edge.']],
      tools: roofTools('Utility knife with hook blade', 'Caulk gun + roofing sealant', 'New pipe boot sized to the pipe', '1¼″ roofing nails'),
      variants: [
        { id: 'replace', name: 'Replace the whole boot', blurb: 'The lasting fix: new flange and collar, tucked under the shingles.' },
        {
          id: 'collar',
          name: 'Slip-on repair collar',
          blurb: 'Flange is sound, only the rubber is split: a 20-minute fix with no shingle work.',
          level: 2,
          time: '20–40 min',
          cost: '$15–30',
          summary: 'If the metal flange is still flat and tucked under the shingles, you can leave it and slide a repair collar over the pipe. It covers the split rubber and clamps to the pipe.',
          tools: ['Extension ladder + standoff', 'Utility knife', 'Wire brush', 'Slip-on repair collar (sized to pipe)', 'Caulk gun + roofing sealant'],
          steps: [
            { t: 'Confirm the flange is sound', d: 'Check that the metal base lies flat, isn’t rusted through, and that its top edge disappears under the shingles above.', why: 'A repair collar only replaces the rubber. A bad flange or one sitting on top of the shingles still leaks.', v: { cam: [0.8, 3.75, 0.55], at: [0.15, 3.2, -0.36], hi: ['oldBoot', 'upperTabs'] } },
            { t: 'Trim the split rubber', d: 'Cut away loose, flapping pieces of the old collar with a utility knife so the new collar can slide down over it.', why: 'Torn flaps can hold the new collar up off the dome and leave a gap.', v: { cam: [0.45, 3.55, 0.25], at: [0.15, 3.3, -0.36], hi: ['crack'], tool: { id: 'utilityKnife', at: [VB_P[0] + 0.05, VB_P[1] + 0.13, VB_P[2] + 0.04], rot: [0, 0, -60] } } },
            { t: 'Clean the pipe', d: 'Scrub the pipe above the boot with a wire brush and wipe it dry.', why: 'The collar seals on the pipe wall. Dirt or chalky paint keeps it from gripping.', v: { cam: [0.45, 3.55, 0.25], at: [0.15, 3.4, -0.36], hi: ['pipe'], tool: { id: 'wireBrush', at: [VB_P[0] + 0.05, VB_P[1] + 0.25, VB_P[2] + 0.02], rot: [0, 0, 80], anim: 'slide' } } },
            { t: 'Slide on the repair collar', d: 'Push the collar down over the pipe until it seats on the old dome, then tighten its stainless band.', why: 'The new rubber now does the sealing, and the band keeps it from riding up as the pipe expands and contracts.', v: { cam: [0.7, 3.65, 0.45], at: [0.15, 3.3, -0.36], hi: ['repairCollar'], show: ['repairCollar'] } },
            { t: 'Seal exposed nail heads', d: 'Cover any exposed nail heads on the lower flange with a dab of roofing sealant.', why: 'Rusty exposed nails are the second most common boot leak.', v: { cam: [0.8, 3.7, 0.6], at: [0.15, 3.2, -0.3], hi: ['nailSeal', 'oldNails'], show: ['nailSeal'], tool: { id: 'caulkGun', at: [VB_P[0] + 0.12, VB_P[1] + 0.03, VB_P[2] + 0.2], rot: [-60, 0, 0] } } },
            { t: 'Check from the attic after rain', d: 'After the next storm, look at the roof deck around the pipe from inside the attic.', why: 'Dry wood confirms the fix. Wet wood means water is getting in somewhere else, often at the flange.', v: { cam: [1.25, 4.15, 1.25], at: [0.15, 3.25, -0.36], hi: ['repairCollar'] } },
          ],
        },
      ],
      steps: [
        { t: 'Confirm the source', d: 'Look at the collar where it grips the pipe. Cracks, gaps or a collar you can wiggle away from the pipe mean the boot is the leak.', why: 'Water stains often show up a few feet from the real leak because water runs along the roof deck first.', v: { cam: [0.55, 3.6, 0.35], at: [0.15, 3.3, -0.36], hi: ['crack', 'oldBoot'], fx: 'leak' } },
        { t: 'Free the shingles above', d: 'Slide a flat bar under the tabs over the top of the boot and gently break the tar seal strips. Lift the two courses enough to reach the nails.', why: 'The top half of the flange is under these shingles. Break the seal slowly so the tabs don’t crack.', v: { cam: [0.9, 3.8, 0.6], at: [0.15, 3.3, -0.45], hi: ['upperTabs'], mv: { upperTabs: [0, 0.03, 0] }, tool: { id: 'flatBar', at: g(0.3, 0.03, -1.47), rot: [70, 0, 0] } } },
        { t: 'Pull the old nails', d: 'Pry out the four nails holding the flange: two under the lifted shingles, two through the lower flange.', why: 'Work the bar under the nail head, not the shingle, so you don’t tear the tab above.', v: { cam: [0.7, 3.7, 0.45], at: [0.15, 3.25, -0.4], hi: ['oldNails'], tool: { id: 'flatBar', at: g(0.27, 0.025, -1.17), rot: [60, 0, 0] } } },
        { t: 'Lift off the old boot', d: 'Slide the old boot up and off the pipe. Cut through the collar if old sealant has glued it on.', why: 'Now you can see the roof deck and pipe around the hole.', v: { cam: [1.0, 3.9, 0.8], at: [0.15, 3.4, -0.36], hi: ['oldBoot'], mv: { oldBoot: [0, 0.5, 0] } } },
        { t: 'Clean and inspect', d: 'Scrape off old sealant, brush the pipe clean and probe the deck around the hole with a screwdriver.', why: 'Soft, dark plywood means water has been getting in for a while. Patch it before the new boot goes on.', v: { cam: [0.55, 3.6, 0.35], at: [0.15, 3.25, -0.36], hi: ['pipe', 'roof'], hide: ['oldBoot'], mv: { newBoot: [0, 0.4, 0] }, tool: { id: 'puttyKnife', at: g(0.0, 0.025, -1.2), rot: [60, 0, 0] } } },
        { t: 'Slide on the new boot', d: 'Push the new boot down over the pipe until the flange lies flat. Tuck the top half under the lifted shingles; the bottom half sits on top of the course below.', why: 'This shingle-style overlap is the real waterproofing. The collar only handles water running down the pipe.', v: { cam: [0.9, 3.8, 0.6], at: [0.15, 3.3, -0.36], hi: ['newBoot'], show: ['newBoot'], mv: { newBoot: [0, 0, 0] } } },
        { t: 'Nail the top corners', d: 'Drive one roofing nail through each top corner of the flange, where the shingles above will cover it. Leave the bottom flange un-nailed.', why: 'Nails in the bottom flange would be exposed to running water.', v: { cam: [0.8, 3.8, 0.4], at: [0.15, 3.3, -0.5], hi: ['newNails'], show: ['newNails'], tool: { id: 'hammer', at: g(0.27, 0.06, -1.45), rot: [26.6, 0, 0], anim: 'tap' } } },
        { t: 'Seal and press the shingles down', d: 'Put a dab of roofing sealant on each nail head and under each lifted tab, then press the shingles flat.', why: 'The sealant replaces the tar strips you broke, so wind can’t lift the tabs.', v: { cam: [0.9, 3.8, 0.6], at: [0.15, 3.3, -0.4], hi: ['sealant', 'upperTabs'], show: ['sealant'], mv: { upperTabs: [0, 0, 0] }, tool: { id: 'caulkGun', at: g(-0.05, 0.03, -1.47), rot: [-40, 0, 0] } } },
      ],
      learn: bootLearn,
      pro: 'The roof is steep or two stories, the deck around the pipe is soft, or the leak continues after a new boot (flashing at a chimney or valley may be the real source).',
    },
    {
      id: 'gutter-sag',
      title: 'Reattach a sagging gutter & seal a leaking seam',
      model: 'xGutterAlu',
      level: 2,
      time: '1–3 hrs',
      cost: '$20–60',
      summary: 'Gutters sag when old spikes work loose from the fascia, and then water pools and pours through the nearest seam. Lift the run back to slope, screw in hidden hangers every 2 ft, and reseal the seam.',
      intro: { hi: ['gutterL', 'seam'], fx: 'leak' },
      safety: ['Set the ladder on firm ground with a standoff so it bears on the wall, not the gutter.', 'Look up for power lines before raising a metal ladder.', 'Gloves: gutter edges and screw tips are sharp.'],
      causes: [['Spikes pulled out', 'Spike-and-ferrule hangers loosen as the wood shrinks and swells.'], ['Overloaded with debris or ice', 'Wet leaves and ice are heavy.'], ['Rotted fascia', 'Screws won’t hold in soft wood.']],
      tools: ['Extension ladder + standoff', 'Drill/driver with ¼″ hex bit', 'Hidden hangers with 7″ screws', 'Gutter sealant', 'Wire brush', 'Level or string line', '2×4 prop'],
      variants: [
        { id: 'aluminum', name: 'Aluminum gutter', blurb: 'Seamless or sectional aluminum with spikes or hangers; seams sealed with gutter sealant.' },
        {
          id: 'vinyl',
          name: 'Vinyl gutter',
          blurb: 'Snap-together vinyl on fascia brackets; leaks are fixed at the gasketed connector.',
          model: 'xGutterVinyl',
          cost: '$15–50',
          summary: 'Vinyl gutters hang in clip-on brackets screwed to the fascia and join with rubber-gasketed connectors. A sag means a broken bracket; a leaky joint means a worn connector gasket.',
          tools: ['Extension ladder + standoff', 'Drill/driver', 'Vinyl fascia brackets + 1¼″ stainless screws', 'Union connector or replacement gasket (same brand)', 'Level or string line', '2×4 prop'],
          steps: [
            { t: 'Find the sag and the leak', d: 'Run a hose in the gutter. Water pools where it sags and drips from the connector next to it.', why: 'You fix them together: the pooled water is what overloads the gasket.', v: { cam: [1.7, 2.1, 2.7], at: [-0.3, 2.55, 0.45], hi: ['gutterL', 'seam'], fx: 'leak' } },
            { t: 'Prop the run up', d: 'Wedge a 2×4 under the sagging section and lift it until it sits against the fascia at the right height.', why: 'A prop holds the weight while you work, so the gutter isn’t hanging from one bracket.', v: { cam: [2.2, 1.6, 2.8], at: [-0.6, 1.6, 0.5], hi: ['prop'], show: ['prop'], rt: { gutterL: [0, -1.4, -2.4] } } },
            { t: 'Remove the broken bracket', d: 'Unclip the gutter from the cracked bracket and unscrew it from the fascia.', why: 'Vinyl brackets get brittle in cold and sunlight and snap at the hook.', v: { cam: [0.6, 2.75, 1.0], at: [-0.9, 2.62, 0.45], hi: ['oldHangers'], tool: { id: 'drill', at: [-0.9, 2.7, 0.41], rot: [-90, 0, 0], anim: 'spin' } } },
            { t: 'Set new brackets to slope', d: 'Snap a chalk line on the fascia that falls ¼″ every 10 ft toward the downspout. Screw new brackets to the line every 24″ with stainless screws.', why: 'Vinyl needs closer bracket spacing than aluminum, especially in snow country.', v: { cam: [0.6, 2.75, 1.4], at: [-1.1, 2.62, 0.45], hi: ['newHangers'], show: ['newHangers'], hide: ['oldHangers'], tool: { id: 'drill', at: [-1.1, 2.7, 0.41], rot: [-90, 0, 0], anim: 'spin' } } },
            { t: 'Snap the gutter in', d: 'Hook the back of the gutter under the bracket tabs and rock the front lip down until it clicks into each bracket.', why: 'Leave the end of each section free to slide. Vinyl grows about ⅝″ in 10 ft on a hot day.', v: { cam: [1.7, 2.1, 2.7], at: [-0.6, 2.6, 0.45], hi: ['gutterL'], hide: ['prop'] } },
            { t: 'Replace the connector', d: 'Unsnap the leaky union connector, clean both gutter ends and snap on a new gasketed connector (or new gaskets) of the same brand.', why: 'Vinyl joints seal with rubber gaskets. Caulk doesn’t stick to vinyl for long.', v: { cam: [0.4, 2.8, 0.95], at: [0, 2.65, 0.45], hi: ['sealant'], show: ['sealant'], hide: ['seam'] } },
            { t: 'Flush and check', d: 'Run the hose at the far end and watch the water flow to the downspout without pooling.', why: 'Standing water means a bracket is still high or low.', v: { cam: [2.6, 1.8, 3.0], at: [0.4, 1.5, 0.45], hi: ['gutterL', 'downspout'], fx: 'flow' } },
          ],
        },
      ],
      steps: [
        { t: 'Find the sag and the leak', d: 'Run a hose in the gutter. Water collects where it sags and drips from the seam beside it.', why: 'They’re usually the same problem: a low spot holds water against the seam until the sealant gives up.', v: { cam: [1.7, 2.1, 2.7], at: [-0.3, 2.55, 0.45], hi: ['gutterL', 'seam'], fx: 'leak' } },
        { t: 'Prop the run up', d: 'Wedge a 2×4 under the sagging section and push it up until the back of the gutter sits tight to the fascia.', why: 'The prop holds the weight so you can pull old spikes without the run dropping.', v: { cam: [2.2, 1.6, 2.8], at: [-0.6, 1.6, 0.5], hi: ['prop', 'gutterL'], show: ['prop'], rt: { gutterL: [0, -1.4, -2.4] } } },
        { t: 'Check the slope', d: 'Set a level on top of the gutter or stretch a string line. It should fall ¼″ for every 10 ft toward the downspout.', why: 'Too flat and water sits; too steep looks crooked and can overshoot the outlet.', v: { cam: [0.8, 2.95, 1.3], at: [-0.6, 2.7, 0.46], hi: ['gutterL', 'gutterR'], tool: { id: 'level', at: [-0.6, 2.735, 0.47], rot: [0, 0, 0], scale: 2.5 } } },
        { t: 'Pull the loose spikes', d: 'Pry out the loose spikes and their ferrule sleeves.', why: 'Spikes rely on friction in the wood. Once they’ve backed out, re-nailing them never holds.', v: { cam: [0.5, 2.8, 1.2], at: [-1.1, 2.68, 0.48], hi: ['oldHangers'], tool: { id: 'flatBar', at: [-0.7, 2.72, 0.56], rot: [-80, 0, 0] } } },
        { t: 'Screw in hidden hangers', d: 'Hook a hidden hanger under the front lip, snap it over the back edge and drive its 7″ screw into the fascia. Space them every 24″ (18″ where snow loads are heavy).', why: 'A screw holds 3–4 times better than a spike, and the hanger braces the lip so it can’t spread.', v: { cam: [0.6, 2.95, 1.3], at: [-1.1, 2.68, 0.46], hi: ['newHangers'], show: ['newHangers'], hide: ['oldHangers'], tool: { id: 'drill', at: [-1.1, 2.728, 0.56], rot: [-90, 0, 0], anim: 'spin' } } },
        { t: 'Clean the seam', d: 'Let the gutter dry. Scrape and wire-brush the old sealant out of the joint, then wipe it with rubbing alcohol.', why: 'New sealant only bonds to clean, bare metal.', v: { cam: [0.35, 2.95, 0.95], at: [0, 2.64, 0.45], hi: ['seam'], hide: ['oldSeal'], tool: { id: 'wireBrush', at: [0.02, 2.63, 0.46], rot: [0, 0, 70], anim: 'slide' } } },
        { t: 'Seal the seam', d: 'Run a heavy bead of gutter sealant along the inside of the joint, bottom and sides, and smooth it with a gloved finger.', why: 'Seal from inside so the water pushes the sealant into the joint, not away from it.', v: { cam: [0.35, 2.95, 0.95], at: [0, 2.64, 0.45], hi: ['sealant'], show: ['sealant'], tool: { id: 'caulkGun', at: [0.06, 2.63, 0.44], rot: [0, 0, -70] } } },
        { t: 'Cure, then flush', d: 'Remove the prop. After the sealant cures (check the tube, often 24 hrs), flush the gutter with a hose and watch the seam and outlet.', why: 'Water should run to the downspout without pooling or dripping.', v: { cam: [2.6, 1.8, 3.0], at: [0.4, 1.5, 0.45], hi: ['gutterL', 'downspout'], hide: ['prop'], fx: 'flow' } },
      ],
      learn: {
        how: 'A gutter is a long beam that carries water, leaves and sometimes ice. Hangers transfer that weight to the fascia. When a hanger loosens, the gutter tips forward and down, water pools in the low spot, and the extra weight pulls the next hanger loose. Seams are the weak points in sectional gutters because sealant ages and the metal expands and contracts every day.',
        specs: [['Slope', '¼″ per 10 ft toward the outlet'], ['Hanger spacing', '24″ (18″ in heavy snow)'], ['Hanger screw', '7″ for 5″ gutters'], ['Sealant cure', '24 hrs typical before water']],
        terms: [['Fascia', 'Board along the roof edge that the gutter hangs from.'], ['Spike & ferrule', 'Old-style long nail through a sleeve across the gutter.'], ['Hidden hanger', 'Clip inside the gutter with a screw into the fascia.'], ['Lapped seam', 'Where two sections overlap and are riveted and sealed.']],
        mistakes: ['Re-driving old spikes into the same holes.', 'Caulking the outside of a seam.', 'Ignoring soft fascia; screws won’t hold in rot.'],
        tips: ['Clean the gutters first. The weight of wet debris is often what pulled them loose.', 'If a screw spins without tightening, the fascia is rotten and needs replacing first.'],
      },
      pro: 'The fascia or rafter tails are rotten, the gutter is two stories up, or long runs need re-pitching end to end.',
    },
    {
      id: 'gutter-guards',
      title: 'Install gutter guards & a downspout extension',
      model: 'xGutterGuard',
      kind: 'build',
      level: 2,
      time: '2–4 hrs',
      cost: '$100–400',
      summary: 'Stainless micro-mesh guards keep leaves and roof grit out while letting rain through. They slide under the first shingle course, screw to the gutter lip, and a 4 ft extension carries the water away from the foundation.',
      intro: { show: ['guard1', 'guard2', 'guard3', 'guardScrews', 'endCap', 'extension'], preview: true },
      safety: ['Set the ladder with a standoff and move it rather than overreaching.', 'Don’t walk on the guards or lean the ladder on them.', 'Wear gloves: mesh edges are sharp.'],
      causes: [['Measure the runs', 'Total gutter length; guards come in 3–5 ft panels.'], ['Pick the style', 'Micro-mesh (best for pine needles and grit), perforated aluminum, or foam inserts.'], ['Check the gutters first', 'Guards on a sagging or leaking gutter just hide the problem.']],
      tools: ['Extension ladder + standoff', 'Micro-mesh guard panels', 'Tin snips', 'Drill/driver + ¼″ hex bit', '#8 × ½″ self-tapping screws', 'Gutter scoop + bucket', 'Downspout extension', 'Garden hose'],
      steps: [
        { t: 'Clean out the gutter', d: 'Scoop out leaves and grit, then flush the gutter and downspout with a hose.', why: 'Anything left under the guards stays there and rots.', v: { cam: [1.6, 3.2, 2.2], at: [0, 2.62, 0.45], hi: ['debris', 'gutter'], tool: { id: 'gloves', at: [0.6, 2.66, 0.46], rot: [0, 0, 0] } } },
        { t: 'Check slope and hangers', d: 'Make sure the gutter falls ¼″ per 10 ft to the outlet and every hanger is tight.', why: 'Guards add little weight but make the gutter harder to fix later.', v: { cam: [0.9, 3.0, 1.6], at: [-0.6, 2.7, 0.46], hi: ['hangers'], hide: ['debris'], tool: { id: 'level', at: [-0.4, 2.735, 0.47], rot: [0, 0, 0], scale: 2.5 } } },
        { t: 'Start at the downspout end', d: 'Slide the first panel’s back edge under the first course of shingles (on top of the drip edge) and rest the front on the gutter lip.', why: 'Working away from the outlet keeps the overlaps shedding toward the downspout.', v: { cam: [2.4, 3.2, 1.9], at: [1.4, 2.7, 0.45], hi: ['guard1'], show: ['guard1'] } },
        { t: 'Screw the front edge', d: 'Drive a self-tapping screw through the front of the panel into the gutter lip about every 16″.', why: 'Screws keep wind and snow sliding off the roof from lifting the panels.', v: { cam: [2.2, 3.0, 1.7], at: [1.3, 2.72, 0.5], hi: ['guardScrews'], show: ['guardScrews'], tool: { id: 'drill', at: [1.1, 2.742, 0.53], rot: [10, 0, 0], anim: 'spin' } } },
        { t: 'Overlap the next panels', d: 'Lap each panel 1″ over the last, then screw it. Cut the final panel to length with tin snips.', why: 'An overlap with no gap means no spot for leaves to slip in.', v: { cam: [1.9, 3.3, 2.4], at: [-0.4, 2.7, 0.45], hi: ['guard2', 'guard3'], show: ['guard2', 'guard3'] } },
        { t: 'Close the ends', d: 'Fit end plugs (or bend the mesh down) where the guards meet the gutter end caps.', why: 'Open ends are where birds and leaves get in.', v: { cam: [-1.0, 3.0, 1.6], at: [-1.9, 2.72, 0.45], hi: ['endCap'], show: ['endCap'] } },
        { t: 'Add the downspout extension', d: 'Slip the extension over the bottom elbow and run it at least 4 ft from the foundation, ending on a splash block.', why: 'Clean gutters don’t help if the water still dumps against the basement wall.', v: { cam: [3.0, 1.2, 2.8], at: [1.6, 0.2, 1.0], hi: ['extension'], show: ['extension'] } },
        { t: 'Hose test', d: 'Spray water on the roof above the guards and watch it soak through the mesh and come out of the extension.', why: 'Overflow at a corner or valley means the panel there needs a deflector or tighter fit.', v: { cam: [3.0, 2.6, 3.4], at: [0.6, 1.4, 0.6], hi: ['guard1', 'extension'], fx: 'rinse' } },
      ],
      learn: {
        how: 'Rain sheets off the shingles and wraps around the front of the guard by surface tension, then drops through the mesh into the gutter. Debris is too big to fit through, so it sits on top and dries until the wind blows it off. Micro-mesh has openings small enough to stop roof grit and pine needles.',
        specs: [['Guard pitch', '5–25° (follow the roof, under the 1st course)'], ['Screw spacing', '≈ 16″ along the front lip'], ['Panel overlap', '≈ 1″'], ['Downspout discharge', '≥ 4 ft from the foundation']],
        terms: [['Micro-mesh', 'Stainless mesh with very fine openings on an aluminum frame.'], ['Drip edge', 'Metal strip at the roof edge that guides water into the gutter.'], ['Valley', 'Where two roof slopes meet; water arrives fast and can overshoot.']],
        mistakes: ['Lifting shingles so far that their seal strips break.', 'Installing guards over a gutter full of debris.', 'Forgetting the downspout discharge.'],
        tips: ['Brush or blow the mesh off once a year. Pollen and seeds can glaze it.', 'Some shingle makers prefer guards that screw to the fascia instead of tucking under shingles; check your roof warranty.'],
      },
      pro: 'The house is two stories or more, the roof is steep or tile/metal, or the gutters need replacing anyway.',
    },
  ]);
})();
