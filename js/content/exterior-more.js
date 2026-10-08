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
    const mats = [0x2c2f33, 0x34373b, 0x26292d, 0x3b3c3e].map((c) => K.bumpy(c, K.tex.speckle(), 0.006, { roughness: 0.95 }));
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
    vinyl ? K.std(0xd9cba6, { roughness: 0.45 }) : K.std(0x5e4a38, { metalness: 0.35, roughness: 0.4 });

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
  const GS_VIEW = { cam: [1.9, 3.5, 2.6], at: [-0.3, 2.55, 0.45], hidden: ['newHangers', 'sealant', 'prop'] };
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

  const g = (x, y, z) => XM.vb(x, y, z);
  TB.more('roof', [
    {
      id: 'vent-boot',
      title: 'Fix a leaking plumbing vent boot',
      model: 'xVentBoot',
      level: 3,
      time: '1–2 hrs',
      cost: '$15–40',
      summary: 'A ceiling stain under a vent pipe usually means the rubber collar on its roof boot (the flashing that seals around the pipe) has split. Replacing the boot means lifting two shingle rows, pulling the nails, sliding a new boot on and tucking it under the shingles.',
      intro: { hi: ['oldBoot', 'crack'], fx: 'leak' },
      safety: ['Work only on a dry, calm, mild day. On anything steeper than 6/12 (6″ of rise per 12″ across) or higher than one story, wear a roof harness clipped to an anchor screwed into a rafter, or hire it out.', 'Set the ladder 1 ft out for every 4 ft of height, extend it 3 ft above the eave, and keep it 10 ft from power lines.', 'Wear soft rubber-soled shoes; shingles are slippery when dusty, dewy or frosty.'],
      causes: [['Split rubber collar', 'Sun and heat dry it out in about 8–12 years. By far the most common cause.'], ['Exposed or popped nails', 'Nails through the open lower flange leak around their heads as they rust or back out.'], ['Flange laid over the shingles', 'If the top half isn’t tucked under the row above, water runs under its top edge.'], ['Animal damage', 'Squirrels chew rubber and soft lead collars.']],
      tools: ['Extension ladder + standoff', 'Flat pry bar', 'Hammer', 'Utility knife with hook blade', 'Putty knife + wire brush', 'New pipe boot sized to the pipe’s outside width', '1¼″ galvanized roofing nails', 'Caulk gun + roofing sealant', 'Tape measure, screwdriver', 'Tin snips'],
      variants: [
        { id: 'replace', name: 'Replace the whole boot', blurb: 'The lasting fix: new flange and collar, tucked under the shingles.' },
        {
          id: 'collar',
          name: 'Slip-on repair collar',
          blurb: 'Flange is sound and tucked in, only the rubber is split: a 30-minute fix with no shingle work.',
          level: 2,
          time: '20–40 min',
          cost: '$15–30',
          summary: 'If the boot’s flat base is still solid and tucked under the shingles, leave it and slide a repair collar over the pipe. The new collar covers the split rubber and grips the pipe.',
          tools: ['Extension ladder + standoff', 'Utility knife', 'Wire brush + rubbing alcohol', 'Slip-on repair collar (sized to the pipe’s outside width)', 'Caulk gun + roofing sealant', 'Hammer'],
          steps: [
            { t: 'Confirm the flange is sound', d: 'Check that the boot’s base lies flat, isn’t cracked or rusted through, and that its top edge disappears under the shingles above. Press on it: it shouldn’t flex or rock.', why: 'A repair collar only replaces the rubber. A cracked flange, or one sitting on top of the shingles, keeps leaking.', tip: 'Slide a putty knife under the shingle above the boot. If it bumps the flange edge 2″ or more up, the flange is tucked correctly.', ok: 'The flange is flat, solid and tucked under the row above, and the only damage is in the rubber.', v: { cam: [0.8, 3.75, 0.55], at: [0.15, 3.2, -0.36], hi: ['oldBoot', 'upperTabs'] } },
            { t: 'Trim the split rubber', d: 'Cut away loose, flapping pieces of the old collar with a utility knife so the new collar can slide down over the dome. Leave the dome itself in place.', why: 'Torn flaps can hold the new collar up off the dome and leave a gap.', tip: 'Cut away from yourself and angle the blade toward the pipe, not the flange; a slip into the flange makes a new hole.', ok: 'The old rubber is smooth and low, with no flaps standing up.', v: { cam: [0.45, 3.55, 0.25], at: [0.15, 3.3, -0.36], hi: ['crack'], tool: { id: 'utilityKnife', at: [VB_P[0] + 0.05, VB_P[1] + 0.13, VB_P[2] + 0.04], rot: [0, 0, -60] } } },
            { t: 'Clean the pipe', d: 'Scrub the pipe above the boot with a wire brush, then wipe it with rubbing alcohol on a rag.', why: 'The collar seals against the pipe wall. Dirt, chalky paint or old sealant keeps it from gripping.', tip: 'Peeling paint? Sand it off where the collar will sit. Collars seal on bare plastic, cast iron or tight paint, but not on flakes.', ok: 'A clean rag wiped on the pipe comes away without dust or chalk.', v: { cam: [0.45, 3.55, 0.25], at: [0.15, 3.4, -0.36], hi: ['pipe'], tool: { id: 'wireBrush', at: [VB_P[0] + 0.05, VB_P[1] + 0.25, VB_P[2] + 0.02], rot: [0, 0, 80], anim: 'slide' } } },
            { t: 'Slide on the repair collar', d: 'Push the collar down over the pipe until it seats snugly on the old dome, then tighten its stainless band clamp if it has one: snug, not crushing.', why: 'The new rubber now does the sealing, and the band keeps it from riding up as the pipe expands and contracts.', tip: 'Buy the collar for the pipe’s outside width. If it’s hard to push, a little soapy water helps; never grease, which stops it gripping.', ok: 'The collar sits down on the dome with no gap you could slip a fingernail into, and it won’t twist when you turn it.', v: { cam: [0.7, 3.65, 0.45], at: [0.15, 3.3, -0.36], hi: ['repairCollar'], show: ['repairCollar'] } },
            { t: 'Seal exposed nail heads', d: 'Cover every exposed nail head on the lower flange and nearby shingles with a dab of roofing sealant. Replace a loose or rusty nail with a new one beside it, then seal both.', why: 'Rusty or popped nails are the second most common boot leak.', tip: 'Tap a raised nail back down first; sealant over a nail that sticks up cracks open again.', ok: 'Every visible nail head is flush and covered by a smooth dab of sealant.', v: { cam: [0.8, 3.7, 0.6], at: [0.15, 3.2, -0.3], hi: ['nailSeal', 'oldNails'], show: ['nailSeal'], tool: { id: 'caulkGun', at: [VB_P[0] + 0.12, VB_P[1] + 0.03, VB_P[2] + 0.2], rot: [-60, 0, 0] } } },
            { t: 'Check from the attic after rain', d: 'After the next storm, shine a flashlight on the roof deck around the pipe from inside the attic.', why: 'Dry wood confirms the fix. Wet wood means water is getting in somewhere else, often under the flange.', tip: 'Circle the old stain with a marker before the storm. A stain that grows past your line means it’s still leaking; one inside the line is just old.', ok: 'The wood around the pipe is dry and the stain hasn’t grown past your marker line.', v: { cam: [1.25, 4.15, 1.25], at: [0.15, 3.25, -0.36], hi: ['repairCollar'] } },
          ],
        },
      ],
      steps: [
        { t: 'Confirm the source', d: 'In the attic, look for stains or dark wood on the underside of the roof near the pipe. On the roof, check the rubber collar where it grips the pipe: cracks, gaps, or a collar you can pull away from the pipe mean the boot is the leak.', why: 'Ceiling stains often show up a few feet from the real leak because water runs along the rafters first. Proving the source saves fixing the wrong thing.', tip: 'Not sure? Have a helper in the attic while you run a hose gently on the roof, starting below the pipe and moving up a few feet every 5 minutes. When drips appear, you’ve found it.', ok: 'You can point to a split, gap or loose collar on the boot, or you saw the drip start during a hose test.', v: { cam: [0.55, 3.6, 0.35], at: [0.15, 3.3, -0.36], hi: ['crack', 'oldBoot'], fx: 'leak' } },
        { t: 'Free the shingles above', d: 'Slide a flat bar under the shingles over the top half of the boot and gently break their tar seal strips. Usually you free the row that covers the boot and the row above it, lifting them just enough to reach the nails.', why: 'The top half of the flange (the boot’s flat base) is tucked under these shingles. Lift slowly so the tabs bend instead of crack.', tip: 'Work on a mild morning, about 50–80 °F. If tabs feel stiff and crackly, wait for the sun to warm them; if the glue is gooey, chill it with a bag of ice.', ok: 'You can see the top edge of the flange and its nail heads, and the lifted tabs have no fresh cracks.', v: { cam: [0.9, 3.8, 0.6], at: [0.15, 3.3, -0.45], hi: ['upperTabs'], mv: { upperTabs: [0, 0.03, 0] }, tool: { id: 'flatBar', at: g(0.3, 0.03, -1.47), rot: [70, 0, 0] } } },
        { t: 'Pull the old nails', d: 'Pry out every nail holding the flange, usually 4–8: in the top corners, along the sides under the shingles, and sometimes in the bottom corners. Also pull any nail from the shingle row above that pierces the flange.', why: 'One missed nail pins the old boot in place. Work the bar under the nail head, not the shingle, so you don’t tear the tab above.', tip: 'Slip the bar’s notch under a nail head and tap the bar with the hammer to start it. A nail that won’t come can be cut with a hacksaw blade slid under the flange.', ok: 'The old boot slides a little up and down the pipe when you push it.', v: { cam: [0.7, 3.7, 0.45], at: [0.15, 3.25, -0.4], hi: ['oldNails'], tool: { id: 'flatBar', at: g(0.27, 0.025, -1.17), rot: [60, 0, 0] } } },
        { t: 'Lift off the old boot', d: 'Slide the old boot up and off the pipe. If old sealant has glued the collar on, slit the rubber with a hook-blade knife.', why: 'With it gone you can see the hole in the roof deck and the pipe itself.', tip: 'Measure the pipe’s outside width now: about 1⅞″ is a 1½″ pipe, 2⅜″ is 2″, and 3½″ is 3″. Buy the boot for that size so the collar grips tight.', ok: 'The boot is off and you can see bare pipe, the hole and the wood deck around it.', v: { cam: [1.0, 3.9, 0.8], at: [0.15, 3.4, -0.36], hi: ['oldBoot'], mv: { oldBoot: [0, 0.5, 0] } } },
        { t: 'Clean and inspect', d: 'Scrape old sealant off the shingles and pipe with a putty knife, wire-brush the pipe, and press a screwdriver into the wood deck around the hole.', why: 'Soft, dark plywood means water has been getting in for a while. Fixing it now stops a soft spot that grows.', tip: 'If the screwdriver sinks in more than ¼″, the wood needs replacing back to the nearest rafters. That’s a good moment to call a roofer.', ok: 'The pipe is clean and dry, and the deck around the hole feels hard under the screwdriver.', v: { cam: [0.55, 3.6, 0.35], at: [0.15, 3.25, -0.36], hi: ['pipe', 'roof'], hide: ['oldBoot'], mv: { newBoot: [0, 0.4, 0] }, tool: { id: 'puttyKnife', at: g(0.0, 0.025, -1.2), rot: [60, 0, 0] } } },
        { t: 'Slide on the new boot', d: 'Push the new boot down over the pipe until the flange lies flat, with its dome pointing downhill. Slide the top half up under the lifted shingles; the bottom half sits on top of the row below.', why: 'This shingle-style overlap is the real waterproofing: water from above flows over the flange, never under it. The collar only handles water running down the pipe.', tip: 'Tight fit? Wipe the pipe with soapy water so the collar slides. If the shingles bulge over the flange, trim a little off the flange’s top corners with tin snips instead of forcing it.', ok: 'The flange lies flat without rocking, the collar hugs the pipe, and about half the flange is hidden under the shingles above.', v: { cam: [0.9, 3.8, 0.6], at: [0.15, 3.3, -0.36], hi: ['newBoot'], show: ['newBoot'], mv: { newBoot: [0, 0, 0] } } },
        { t: 'Nail the top corners', d: 'Drive a roofing nail through each top corner of the flange and along the upper sides every 4–6″, all where shingles will cover them. Leave the exposed bottom flange un-nailed if it lies flat.', why: 'Every nail in the open bottom flange is a hole facing running water. Covered nails stay dry.', tip: 'If the bottom flange curls up, use one nail per bottom corner and cover each head with sealant. Drive nails just flush; a dented flange makes a puddle.', ok: 'No nail heads show below the shingles except, at most, one sealed nail in each bottom corner.', v: { cam: [0.8, 3.8, 0.4], at: [0.15, 3.3, -0.5], hi: ['newNails'], show: ['newNails'], tool: { id: 'hammer', at: g(0.27, 0.06, -1.45), rot: [26.6, 0, 0], anim: 'tap' } } },
        { t: 'Seal and press the shingles down', d: 'Put a dab of roofing sealant on each covered nail head and a few quarter-size dabs under each lifted tab, then press the shingles flat. Don’t smear sealant around the collar.', why: 'The sealant replaces the tar strips you broke so wind can’t lift the tabs. Sealant at the collar just traps water and hides the next failure.', tip: 'Use roofing cement or a polymer roof sealant. Silicone doesn’t bond well to asphalt shingles and peels off.', ok: 'Every lifted tab stays down when you tug a corner, and a hose run on the roof leaves the attic dry.', v: { cam: [0.9, 3.8, 0.6], at: [0.15, 3.3, -0.4], hi: ['sealant', 'upperTabs'], show: ['sealant'], mv: { upperTabs: [0, 0, 0] }, tool: { id: 'caulkGun', at: g(-0.05, 0.03, -1.47), rot: [-40, 0, 0] } } },
      ],
      learn: {
        how: 'A pipe boot is a flat flange with a rubber collar that squeezes the vent pipe. Water running down the roof hits the boot, flows over the lower flange onto the shingles below, and the collar keeps it from following the pipe into the attic. The flange works only if its top half is tucked under the shingles above, just like a shingle. Sunlight bakes the rubber collar until it splits, usually long before the shingles wear out.',
        specs: [['Pipe sizes (outside width)', '1½″ ≈ 1⅞″, 2″ ≈ 2⅜″, 3″ ≈ 3½″'], ['Collar life', 'Rubber 8–12 years; silicone or lead 20+'], ['Nails', '1¼″ galvanized roofing nails, top corners and upper sides every 4–6″'], ['Overlap', 'Top flange under the shingles above; bottom flange on top of the row below'], ['Pipe height', '≥ 6″ above the roof on the uphill side']],
        terms: [['Pipe boot / pipe jack', 'Flashing that seals around a vent pipe.'], ['Flange', 'The flat base of the boot that lies on the roof.'], ['Collar', 'The rubber gasket that grips the pipe.'], ['Seal strip', 'Tar line that glues each shingle tab down.'], ['Exposed nail', 'A nail not covered by a shingle. Every one is a leak waiting to happen.']],
        mistakes: ['Caulking around a split collar instead of replacing it.', 'Nailing the bottom flange through the shingles below.', 'Setting the whole flange on top of the shingles so water runs under the top edge.', 'Buying the boot by the pipe’s name size instead of its outside width.'],
        tips: ['Do the job on a mild morning so tabs bend without cracking but before the sun softens the tar.', 'Look at every other pipe boot while you’re up there; they were installed the same year and age together.'],
      },
      pro: 'The roof is steep or two stories, the deck around the pipe is soft, or the leak continues after a new boot (flashing at a chimney, skylight or valley may be the real source).',
      tricks: [['Upgrade the boot', 'A silicone or lead boot costs a few dollars more and lasts 20+ years; plain rubber cracks in 8–12.'], ['Shade the collar', 'A UV-proof cap that slips over the collar (sold as a pipe boot cover) shields the rubber from sun and adds years.'], ['Lead boots fold in', 'A lead boot’s top is tapped down and folded inside the pipe with a hammer handle. If squirrels chew it, switch to a metal-capped boot.'], ['Hose test bottom up', 'Wet only the area below the pipe first, then move up in 5-minute steps. Water inside only once you reach the pipe proves the boot is the leak.'], ['Buy two sizes', 'If you’re unsure of the size, buy both and return the extra. A boot for a 3″ pipe on a 2″ pipe will never seal.'], ['Short pipe fix', 'If the pipe sticks up less than about 6″, have a plumber add a coupling and extension before the new boot goes on; a short pipe gets buried by snow.']],
      refs: [['How to flash a pipe on a steep-slope roof (GAF)', 'https://www.gaf.com/en-us/blog/residential-roofing/how-to-flash-a-pipe-on-a-steep-slope-roof-14bf4097-85c4-4c54-9a17-b3b35a89c429'], ['Roof flashings (Oatey)', 'https://www.oatey.com/products/flashings/roof-flashings'], ['Vent flashing done right (Fine Homebuilding)', 'https://www.finehomebuilding.com/project-guides/roofing/vent-flashing-done-right'], ['Replace plumbing vent flashing (Family Handyman)', 'https://www.familyhandyman.com/project/roof-flashing-replace-plumbing-vent-flashing/'], ['How to fix a roof leaking around a vent pipe (EngineerFix)', 'https://engineerfix.com/how-to-fix-a-roof-leaking-around-a-vent-pipe/'], ['Portable ladder rules interpretation (OSHA)', 'https://www.osha.gov/laws-regs/standardinterpretations/2009-03-16-3']],
    },
    {
      id: 'gutter-sag',
      title: 'Reattach a sagging gutter & seal a leaking seam',
      model: 'xGutterAlu',
      level: 2,
      time: '1–3 hrs',
      cost: '$20–60',
      summary: 'Gutters sag when old spikes work loose from the fascia; then water pools and pours through the nearest seam. Lift the run back to slope, screw in hidden hangers every 2 ft, and reseal the seam from inside.',
      intro: { hi: ['gutterL', 'seam'], fx: 'leak' },
      safety: ['Set the ladder on firm ground with a standoff so it rests on the wall, not the gutter. Set the ladder 1 ft out for every 4 ft of height, extend it 3 ft above the eave, and keep it 10 ft from power lines.', 'Keep your belt buckle between the ladder rails; move the ladder instead of reaching.', 'Wear gloves and safety glasses: gutter edges, rivets and screw tips are sharp.'],
      causes: [['Spikes pulled out', 'Spike-and-ferrule hangers loosen as the wood shrinks and swells each season.'], ['Overloaded with debris or ice', 'A gutter full of wet leaves or ice weighs hundreds of pounds.'], ['Rotted fascia', 'Screws and spikes won’t hold in soft wood.'], ['Old sealant', 'Seam sealant dries out and cracks as the metal expands and shrinks every day.']],
      tools: ['Extension ladder + standoff', 'Drill/driver with ¼″ hex bit', 'Hidden hangers with built-in screws (one per 2 ft)', 'Gutter sealant + caulk gun', 'Wire brush, putty knife, rubbing alcohol', '⅛″ aluminum pop rivets + rivet tool (loose seams)', 'Level, string line, chalk line', '2×4 prop', 'Flat pry bar, hacksaw'],
      variants: [
        { id: 'aluminum', name: 'Aluminum gutter', blurb: 'Seamless or sectional aluminum with spikes or hangers; seams sealed with gutter sealant.' },
        {
          id: 'vinyl',
          name: 'Vinyl gutter',
          blurb: 'Snap-together vinyl on fascia brackets; leaks are fixed at the gasketed connector.',
          model: 'xGutterVinyl',
          cost: '$15–50',
          summary: 'Vinyl gutters clip into brackets screwed to the fascia and join with rubber-gasketed connectors. A sag means a broken bracket; a leaky joint means a worn gasket or a connector that has pulled apart.',
          tools: ['Extension ladder + standoff', 'Drill/driver + ⅛″ bit', 'Vinyl fascia brackets + 1¼″ stainless screws (same brand)', 'Union connector or replacement gaskets (same brand)', 'Chalk line, level or string line', '2×4 prop', 'Dish soap + water'],
          steps: [
            { t: 'Find the sag and the leak', d: 'Run a hose in the gutter. Water pools where it sags and drips from the connector (the snap-on joint between sections) next to it.', why: 'You fix them together: the sag twists the joint and the pooled water overloads its rubber gasket.', tip: 'Look for a cracked bracket hook first; on vinyl that is almost always what caused the sag.', ok: 'You’ve marked the low spot and the leaking connector with tape.', v: { cam: [1.9, 3.5, 2.6], at: [-0.3, 2.55, 0.45], hi: ['gutterL', 'seam'], fx: 'leak' } },
            { t: 'Prop the run up', d: 'Wedge a 2×4 under the sagging section and lift it until it sits against the fascia at the right height.', why: 'The prop holds the weight while you work, so the gutter isn’t hanging from one bracket.', tip: 'Vinyl turns brittle below about 40 °F. Work on a mild day so the gutter flexes instead of cracking.', ok: 'The gutter sits in line with its neighbors and the prop stands on its own.', v: { cam: [2.2, 1.6, 2.8], at: [-0.6, 1.6, 0.5], hi: ['prop'], show: ['prop'], rt: { gutterL: [0, -1.4, -2.4] } } },
            { t: 'Remove the broken bracket', d: 'Unclip the gutter from the cracked bracket (press the front tab and roll the gutter out) and unscrew the bracket from the fascia.', why: 'Vinyl brackets get brittle with cold and sunlight and snap at the hook.', tip: 'Take the broken bracket to the store. Vinyl brands don’t interchange, and another system’s bracket won’t clip on.', ok: 'The old bracket is off and the gutter rests on the prop.', v: { cam: [0.6, 2.75, 1.0], at: [-0.9, 2.62, 0.45], hi: ['oldHangers'], tool: { id: 'drill', at: [-0.9, 2.7, 0.41], rot: [-90, 0, 0], anim: 'spin' } } },
            { t: 'Set new brackets to slope', d: 'Snap a chalk line on the fascia, starting about ½″ below the roof edge at the high end and falling ¼″ every 10 ft toward the downspout. Screw new brackets to the line every 24″ (18″ in snow country) with 1¼″ stainless screws.', why: 'Vinyl is weaker than aluminum when hot or loaded with snow, so it needs brackets closer together.', tip: 'Pre-drill with a ⅛″ bit in hard old fascia so the screws don’t snap, and stop when snug; overtightening cracks the bracket.', ok: 'Each bracket sits on the chalk line, tight to the fascia, and doesn’t wiggle.', v: { cam: [0.6, 2.75, 1.4], at: [-1.1, 2.62, 0.45], hi: ['newHangers'], show: ['newHangers'], hide: ['oldHangers'], tool: { id: 'drill', at: [-1.1, 2.7, 0.41], rot: [-90, 0, 0], anim: 'spin' } } },
            { t: 'Snap the gutter in', d: 'Hook the back of the gutter under the bracket tabs and rock the front lip down until it clicks into each bracket.', why: 'Leave section ends free to slide in the connectors: vinyl grows about ⅝″ in 10 ft on a hot day.', tip: 'Won’t click? Check that the gutter back isn’t catching on a screw head, then press with the heel of your hand.', ok: 'You hear a click at each bracket and the gutter sits tight along the chalk line.', v: { cam: [1.7, 2.1, 2.7], at: [-0.6, 2.6, 0.45], hi: ['gutterL'], hide: ['prop'] } },
            { t: 'Replace the connector', d: 'Unsnap the leaky connector, clean both gutter ends and snap on a new gasketed connector (or new gaskets) of the same brand. Line the gutter ends up with the connector’s temperature marks, which set the expansion gap.', why: 'Vinyl joints seal with rubber gaskets that let the gutter slide. Caulk doesn’t stick to vinyl for long and locks the joint so it cracks.', tip: 'Dip the gasket edges in soapy water so the connector slides on without rolling a gasket out of its groove.', ok: 'The connector snaps closed on both sides and each gutter end sits at the right temperature mark.', v: { cam: [0.45, 3.25, 1.0], at: [0, 2.64, 0.46], hi: ['sealant'], show: ['sealant'], hide: ['seam'] } },
            { t: 'Flush and check', d: 'Remove the prop. Run the hose at the far end and watch the water flow to the downspout without pooling.', why: 'Standing water means a bracket is still high or low.', tip: 'If water pools at one bracket, unscrew it and move it up or down ⅛″ on the chalk line rather than bending the gutter.', ok: 'Water runs to the downspout with no puddles and no drips at the connector.', v: { cam: [2.6, 1.8, 3.0], at: [0.4, 1.5, 0.45], hi: ['gutterL', 'downspout'], fx: 'flow' } },
          ],
        },
      ],
      steps: [
        { t: 'Find the sag and the leak', d: 'On a dry day, run a hose into the far end of the gutter and watch. Water pools where it sags and drips from the seam (the joint between two sections) next to it.', why: 'They’re usually one problem: a low spot holds water against the seam until the sealant gives up.', tip: 'Stretch a string tight along the gutter top from end to end. The gap between string and gutter shows exactly where and how far it sags.', ok: 'You’ve marked the low spot and the dripping seam with tape.', v: { cam: [1.9, 3.5, 2.6], at: [-0.3, 2.55, 0.45], hi: ['gutterL', 'seam'], fx: 'leak' } },
        { t: 'Prop the run up', d: 'Wedge a 2×4 under the sagging section, braced on the ground, and push it up until the back of the gutter sits tight against the fascia (the board it hangs on).', why: 'The prop carries the weight so you can pull old fasteners without the run dropping or kinking.', tip: 'Cut the 2×4 an inch long and walk its bottom in toward the wall; it lifts the gutter gradually without bending the lip.', ok: 'The gutter back is snug to the fascia and the prop stands firm when you let go.', v: { cam: [2.2, 1.6, 2.8], at: [-0.6, 1.6, 0.5], hi: ['prop', 'gutterL'], show: ['prop'], rt: { gutterL: [0, -1.4, -2.4] } } },
        { t: 'Check the slope', d: 'Set a level on the gutter or stretch a string line end to end. It should fall at least ¼″ for every 10 ft toward the downspout; ½″ per 10 ft drains even better.', why: 'Too flat and water sits; too steep looks crooked and can overshoot the outlet.', tip: 'On a long run, snap a chalk line on the fascia from the high end to the outlet and set every hanger to it.', ok: 'The string shows a steady fall to the outlet with no dip in the middle.', v: { cam: [0.8, 2.95, 1.3], at: [-0.6, 2.7, 0.46], hi: ['gutterL', 'gutterR'], tool: { id: 'level', at: [-0.6, 2.735, 0.47], rot: [0, 0, 0], scale: 2.5 } } },
        { t: 'Pull the loose spikes', d: 'Pry out the loose spikes and their ferrules (the tube sleeves that span the gutter) with a flat bar, or cut a stubborn spike with a hacksaw.', why: 'Spikes hold only by friction in the wood. Once they’ve backed out, re-driving them never lasts.', tip: 'Put a scrap of wood behind the bar on the gutter lip so you don’t crush the front edge while prying.', ok: 'The old spikes are out and you can see their holes in the fascia.', v: { cam: [0.5, 2.8, 1.2], at: [-1.1, 2.68, 0.48], hi: ['oldHangers'], tool: { id: 'flatBar', at: [-0.7, 2.72, 0.56], rot: [-80, 0, 0] } } },
        { t: 'Screw in hidden hangers', d: 'Hook each hidden hanger under the front lip, snap it over the back edge, and drive its built-in screw through the gutter back into solid fascia. Space them every 24″ (18″ in heavy snow), 4–6″ from old spike holes.', why: 'A screw grips far better than a spike, and the hanger braces the lip so the gutter can’t spread open.', tip: 'Set the drill clutch low and stop as soon as the gutter back pulls tight. If a screw just spins, you hit rot or an old hole: move over 2″.', ok: 'Each hanger clicks onto the lip, its screw stops snug, and the gutter doesn’t move when you press down on it.', v: { cam: [0.6, 2.95, 1.3], at: [-1.1, 2.68, 0.46], hi: ['newHangers'], show: ['newHangers'], hide: ['oldHangers'], tool: { id: 'drill', at: [-1.1, 2.728, 0.56], rot: [-90, 0, 0], anim: 'spin' } } },
        { t: 'Clean the seam', d: 'Let the gutter dry. Scrape the old sealant out of the seam, wire-brush it to bare metal, and wipe it with rubbing alcohol.', why: 'New sealant bonds to clean metal. Sealant over old crumbly sealant peels within weeks.', tip: 'If the overlap feels loose, drill ⅛″ holes and add 2–3 aluminum pop rivets first. No sealant can hold a joint that moves.', ok: 'The seam is bare, shiny metal with no old sealant or grit, and it’s dry to the touch.', v: { cam: [0.45, 3.25, 1.0], at: [0, 2.64, 0.46], hi: ['seam'], hide: ['oldSeal'], tool: { id: 'wireBrush', at: [0.02, 2.63, 0.46], rot: [0, 0, 70], anim: 'slide' } } },
        { t: 'Seal the seam', d: 'Run a ¼″ bead of gutter sealant inside the joint along the bottom and up both sides, then smooth it with a gloved finger so it covers the edge of the overlap.', why: 'Seal from inside so water pushes the sealant into the joint, not away from it.', tip: 'Cut the nozzle at 45° for a ¼″ bead and push the gun ahead of the bead so it’s forced into the crack. Dip your gloved finger in soapy water to smooth it.', ok: 'A smooth, unbroken band of sealant covers the overlap edge with no pinholes.', v: { cam: [0.45, 3.25, 1.0], at: [0, 2.64, 0.46], hi: ['sealant'], show: ['sealant'], tool: { id: 'caulkGun', at: [0.06, 2.63, 0.44], rot: [0, 0, -70] } } },
        { t: 'Cure, then flush', d: 'Remove the prop. Let the sealant cure as the tube says (often 24 hrs before running water), then flush the gutter with a hose and watch the seam and outlet.', why: 'Water should now run to the downspout without pooling or dripping.', tip: 'A seam that still weeps usually has one pinhole. Dry it and dab sealant on that spot rather than redoing the whole joint.', ok: 'Water runs to the downspout with no puddles, and the underside of the seam stays dry.', v: { cam: [2.6, 1.8, 3.0], at: [0.4, 1.5, 0.45], hi: ['gutterL', 'downspout'], hide: ['prop'], fx: 'flow' } },
      ],
      learn: {
        how: 'A gutter is a long beam that carries water, leaves and sometimes ice. Hangers pass that weight to the fascia. When one loosens, the gutter tips forward and down, water pools in the low spot, and the extra weight pulls the next hanger loose. Seams are the weak points in sectional gutters because sealant ages and the metal grows and shrinks every day.',
        specs: [['Slope', '≥ ¼″ per 10 ft toward the outlet'], ['Hanger spacing', '24″ (18″ in heavy snow)'], ['Hanger screw', 'Built-in, into solid fascia or a rafter end'], ['Seam bead', '≈ ¼″, inside the joint'], ['Sealant cure', 'Often 24 hrs before water; see the tube'], ['Vinyl movement', '≈ ⅝″ per 10 ft on a hot day']],
        terms: [['Fascia', 'Board along the roof edge that the gutter hangs from.'], ['Spike and ferrule', 'Old-style long nail through a tube sleeve across the gutter.'], ['Hidden hanger', 'Clip inside the gutter with a screw into the fascia.'], ['Lapped seam', 'Where two sections overlap and are riveted and sealed.'], ['Connector', 'On vinyl, the snap-on joint with rubber gaskets.']],
        mistakes: ['Re-driving old spikes into the same holes.', 'Caulking the outside of a seam.', 'Ignoring soft fascia; screws won’t hold in rot.', 'Caulking vinyl joints instead of replacing the gasket.'],
        tips: ['Clean the gutters first. Wet debris is often what pulled them loose.', 'If a screw spins without tightening, the fascia is rotten and needs replacing first.'],
      },
      pro: 'The fascia or rafter ends are rotten, the gutter is two stories up, or long runs need re-pitching end to end.',
      tricks: [['Hit the rafter ends', 'Hangers screwed where a rafter end sits behind the fascia hold best. Find them by the old nail lines or by tapping: solid sounds dull, hollow rings.'], ['Gutter screws for quick fixes', 'A 7″ gutter screw drops into an old spike’s ferrule and replaces a loose spike in seconds, as long as the wood behind is sound.'], ['Rivet before you seal', 'A seam that flexes cracks any sealant. Two or three ⅛″ aluminum pop rivets lock it first.'], ['Rotten fascia test', 'Push a screwdriver into the fascia behind the sag. If it sinks easily, replace that board before rehanging.'], ['Arrow to the outlet', 'Draw an arrow on the fascia pointing to the downspout before you start; on a long run it’s easy to set the slope backward.'], ['Clean first, weigh less', 'Scoop the gutter before rehanging; a load of wet leaves will pull new hangers loose too.']],
      refs: [['How to fix sagging gutters (This Old House)', 'https://www.thisoldhouse.com/gutters/how-to-fix-sagging-gutters'], ['How to repair sagging gutters (PJ Fitzpatrick)', 'https://www.pjfitz.com/diy/gutter-repair/how-to-repair-sagging-gutters/'], ['Geocel 2320 gutter sealant (Gutterall)', 'https://gutterall.com/products/geocel-2320-tripolymer-sealant-gutter-leak-repair'], ['Vinyl gutter installation guide (Amerimax, Home Depot)', 'https://images.thdstatic.com/catalog/pdfImages/29/298efeac-47c5-426a-bc28-6f7a9ecfe308.pdf'], ['Best gutter sealants, tested (Bob Vila)', 'https://www.bobvila.com/reviews/best-gutter-sealants/']],
    },
    {
      id: 'gutter-guards',
      title: 'Install gutter guards & a downspout extension',
      model: 'xGutterGuard',
      kind: 'build',
      level: 2,
      time: '2–4 hrs',
      cost: '$100–400',
      summary: 'Stainless micro-mesh guards keep leaves and roof grit out while letting rain through. They screw to the gutter lip and either tuck under the first shingle row or fasten to the fascia, and a downspout extension carries the water at least 5 ft from the foundation.',
      intro: { show: ['guard1', 'guard2', 'guard3', 'guardScrews', 'endCap', 'extension'], preview: true },
      safety: ['Set the ladder with a standoff and move it rather than overreaching. Set the ladder 1 ft out for every 4 ft of height, extend it 3 ft above the eave, and keep it 10 ft from power lines.', 'Don’t walk on the guards or lean the ladder on them.', 'Wear leather gloves and safety glasses: cut mesh edges are sharp.'],
      causes: [['Measure the runs', 'Total gutter length plus 10% for overlaps and cuts; guards come in 3–5 ft panels.'], ['Pick the style', 'Stainless micro-mesh stops pine needles and grit; perforated aluminum handles broad leaves; foam inserts clog and grow moss.'], ['Check the gutters first', 'Guards on a sagging or leaking gutter just hide the problem.'], ['Check the shingle warranty', 'Many roof makers prefer guards that don’t lift shingles; fascia or lip mounting avoids the question.']],
      tools: ['Extension ladder + standoff', 'Micro-mesh guard panels (+10%)', 'Tin snips', 'Drill/driver + ¼″ hex bit', 'Self-tapping screws from the kit (#8, ½–¾″)', 'Gutter scoop + bucket', 'Downspout extension + splash block', 'Garden hose', 'Leather gloves, safety glasses'],
      steps: [
        { t: 'Clean out the gutter', d: 'Scoop out leaves and grit, then flush the gutter and downspout with a hose until water runs clear.', why: 'Anything left under the guards stays there, rots and blocks the outlet.', tip: 'Spray the downspout from the top while someone watches the bottom. If it backs up, clear it now; it’s much harder with guards on.', ok: 'Bare gutter bottom from end to end and a strong stream out of the downspout.', v: { cam: [1.6, 3.2, 2.2], at: [0, 2.62, 0.45], hi: ['debris', 'gutter'], tool: { id: 'gloves', at: [0.6, 2.66, 0.46], rot: [0, 0, 0] } } },
        { t: 'Check slope and hangers', d: 'Make sure the gutter falls at least ¼″ per 10 ft to the outlet, every hanger is tight and every seam is sealed. Fix those first.', why: 'Guards add little weight but make the gutter harder to get into later.', tip: 'Puddles a minute after flushing show low spots; raise the hanger there before covering the gutter.', ok: 'No standing water after flushing and no hanger moves when you push down on the gutter.', v: { cam: [0.9, 3.0, 1.6], at: [-0.6, 2.7, 0.46], hi: ['hangers'], hide: ['debris'], tool: { id: 'level', at: [-0.4, 2.735, 0.47], rot: [0, 0, 0], scale: 2.5 } } },
        { t: 'Start at the downspout end', d: 'Set the first panel at the downspout end. Follow your guard’s instructions for the back edge: most micro-mesh either slides under the first shingle row on top of the drip edge, or screws to the fascia just above the gutter. Rest the front on the gutter lip.', why: 'Working away from the outlet keeps each overlap shedding toward the downspout.', tip: 'Fascia-mount or lip-mount guards don’t disturb the shingles, which roof makers prefer. If you tuck under, lift the shingles an inch or two only and reseal any glue strip you break.', ok: 'The panel sits flat, slopes slightly down toward the front, and its back edge is fully under the shingle or tight to the fascia.', v: { cam: [2.4, 3.2, 1.9], at: [1.4, 2.7, 0.45], hi: ['guard1'], show: ['guard1'] } },
        { t: 'Screw the front edge', d: 'Drive a self-tapping screw (one that drills its own hole) through the front of the panel into the gutter lip every 12–16″, or as the instructions say.', why: 'Screws keep wind and snow sliding off the roof from lifting the panels.', tip: 'Use low speed and stop when the head touches; the thin lip strips easily. If a screw spins, move it 1″ over.', ok: 'Each screw is snug and the panel doesn’t lift when you tug its front edge.', v: { cam: [2.2, 3.0, 1.7], at: [1.3, 2.72, 0.5], hi: ['guardScrews'], show: ['guardScrews'], tool: { id: 'drill', at: [1.1, 2.742, 0.53], rot: [10, 0, 0], anim: 'spin' } } },
        { t: 'Overlap the next panels', d: 'Lap each next panel about 1″ over the last (or as marked), then screw it. Cut the final panel to length with tin snips.', why: 'A tight overlap with no gap leaves nowhere for leaves to slip in.', tip: 'Wear leather gloves: cut stainless mesh is razor sharp. At an inside corner, miter two panels or buy the maker’s corner piece.', ok: 'No gaps along the run and every joint overlaps the same way, toward the downspout.', v: { cam: [1.9, 3.3, 2.4], at: [-0.4, 2.7, 0.45], hi: ['guard2', 'guard3'], show: ['guard2', 'guard3'] } },
        { t: 'Close the ends', d: 'Fit end plugs (or bend the mesh down) where the guards meet the gutter end caps.', why: 'Open ends are where birds, wasps and leaves get in.', tip: 'No end plugs in the kit? Fold a mesh scrap into an L and screw it to the end cap.', ok: 'Looking in from the end, you can’t see any opening into the gutter.', v: { cam: [-1.0, 3.0, 1.6], at: [-1.9, 2.72, 0.45], hi: ['endCap'], show: ['endCap'] } },
        { t: 'Add the downspout extension', d: 'Slip the extension over the bottom elbow and run it at least 5 ft from the foundation, ending on a splash block on ground that slopes away.', why: 'Clean gutters don’t help if the water still dumps against the basement wall.', tip: 'One short sheet-metal screw through the joint keeps the extension from getting knocked off by the mower.', ok: 'The extension is fastened and points water away from the house.', v: { cam: [3.0, 1.2, 2.8], at: [1.6, 0.2, 1.0], hi: ['extension'], show: ['extension'] } },
        { t: 'Hose test', d: 'Spray water gently on the roof above the guards (never up under the shingles) and watch it soak through the mesh and come out of the extension.', why: 'Overflow at a corner or valley means that panel needs a deflector or a tighter fit.', tip: 'Fast water from a valley can shoot over mesh. A small splash guard on the gutter lip at that spot stops it.', ok: 'Water disappears into the mesh within an inch or two of the edge and none spills over the front.', v: { cam: [3.0, 2.6, 3.4], at: [0.6, 1.4, 0.6], hi: ['guard1', 'extension'], fx: 'rinse' } },
      ],
      learn: {
        how: 'Rain sheets off the shingles, clings to the front of the guard, and drops through the mesh into the gutter. Leaves are too big to fit through, so they sit on top, dry out and blow off. Micro-mesh has openings fine enough to stop roof grit and pine needles, which slip through larger perforated guards.',
        specs: [['Guard pitch', 'Follow the instructions; usually a slight slope toward the front lip'], ['Screw spacing', '≈ 12–16″ along the front lip'], ['Panel overlap', '≈ 1″, toward the downspout'], ['Downspout discharge', '≥ 5 ft from the foundation']],
        terms: [['Micro-mesh', 'Stainless mesh with very fine openings on an aluminum frame.'], ['Drip edge', 'Metal strip at the roof edge that guides water into the gutter.'], ['Valley', 'Where two roof slopes meet; water arrives fast and can overshoot.'], ['Self-tapping screw', 'Screw with a drill tip that cuts its own hole in metal.']],
        mistakes: ['Lifting shingles so far that their glue strips crack.', 'Installing guards over a gutter full of debris.', 'Forgetting the downspout discharge.'],
        tips: ['Brush the mesh off once a year; pollen and seeds can glaze it.', 'Check your roof warranty; many shingle makers prefer guards that screw to the fascia instead of tucking under shingles.'],
      },
      pro: 'The house is two stories or more, the roof is steep, tile or metal, or the gutters need replacing anyway.',
      tricks: [['Pick the right mesh', 'Stainless micro-mesh stops pine needles and roof grit; cheap perforated aluminum stops broad leaves only.'], ['Warranty-friendly mounting', 'Guards that screw to the fascia or clip to the gutter lip leave the shingles alone.'], ['Brush, don’t blast', 'Clean the mesh with a soft brush on a pole once a year; a pressure washer can tear it.'], ['Buy 10% extra', 'Corners, end cuts and overlaps eat material, and a spare panel covers mistakes.'], ['Watch in winter', 'Ice can glaze the mesh so water runs over the front. In snow country, check a few panels after a freeze.'], ['Bigger outlet helps', 'With guards on, the outlet becomes the bottleneck. Swapping a 2×3″ downspout for 3×4″ handles heavy storms.']],
      refs: [['How to install gutter guards (CleanPro)', 'https://cleanproguttercleaning.com/guides/how-to-install-gutter-guards'], ['Do gutter guards void roof warranty? (CleanPro)', 'https://cleanproguttercleaning.com/guides/do-gutter-guards-void-roof-warranty'], ['Gutter guard install guide (Gutterglove)', 'https://www.gutterguard.com/wp-content/uploads/2022/02/Gutter-Guard-by-Gutterglove-Install-Guide.pdf'], ['Atlas gutter guard install guide (Atlas)', 'https://www.atlasgutterguard.com/wp-content/uploads/2022/02/Atlas-Gutter-Guard-Install-Guide.pdf'], ['MicroGuard installation instructions (Englert)', 'https://www.englertinc.com/sites/default/files/microguard-installation-instructions.pdf']],
    },
  ]);
})();

/* ---------------- Deck: stairs, bouncy-deck fix, composite boards ---------------- */
(function () {
  const XM = TB.XM;
  const ptOf = (K) => K.pbr('wood_planks', [0.4, 1.2], { color: 0xb3a27a }, 'woodLight');
  const deckBoardMat = (K, c) => K.bumpy(c || 0xb08a5c, K.tex.woodBump(), 0.006, { roughness: 0.8 });

  /* ===== Deck stairs: 4 risers of 7⅛″ (180 mm), 10⅝″ (270 mm) runs, 3 cut 2×12 stringers ===== */
  const RISE = 0.18;
  const RUN = 0.27;
  const PAD = 0.04; // landing pad top
  const DTOP = PAD + 4 * RISE; // 0.76 deck top
  TB.model(
    'xDeckStairs',
    XM.view({
      cam: [2.6, 1.7, 2.9],
      at: [0, 0.45, 0.3],
      tex: ['aerial_grass_rock', 'wood_planks'],
      hidden: ['pad', 'layout', 'stringers', 'hangers', 'risers', 'treads', 'newTread', 'rotTread', 'rail'],
    }),
    (K) => {
      const pt = ptOf(K);
      const board = deckBoardMat(K);
      // existing deck: posts, rim, joists, decking, fascia
      const deck = K.part('deck', [0, 0, 0], null, 'Existing deck (top 30″ up)');
      [-1.5, 1.5].forEach((x) => K.box(deck, [0.089, DTOP - 0.25, 0.089], pt, [x, (DTOP - 0.25) / 2, -0.12], null, 0.004));
      K.box(deck, [3.1, 0.235, 0.038], pt, [0, DTOP - 0.025 - 0.1175, -0.019], null, 0.004);
      for (let x = -1.45; x <= 1.46; x += 0.406) K.box(deck, [0.038, 0.235, 1.9], pt, [x, DTOP - 0.025 - 0.1175, -1.0], null, 0.004);
      for (let z = -0.07; z > -2.0; z -= 0.146) K.box(deck, [3.15, 0.025, 0.14], board, [0, DTOP - 0.0125, z], null, 0.004);
      K.box(deck, [3.15, 0.2, 0.02], board, [0, DTOP - 0.125, 0.012], null, 0.003);
      // landing pad
      const pad = K.part('pad', [0, 0, 0], null, 'Concrete landing pad (4″ on gravel)');
      K.box(pad, [1.3, 0.1, 1.0], 'concrete', [0, PAD - 0.05, 0.27 * 3 + 0.4], null, 0.01);
      // layout: a 2×12 blank with pencil lines and stair gauges on a framing square
      const lay = K.part('layout', [0.9, 0.0, 1.9], null, '2×12 marked with a framing square');
      K.box(lay, [3.0 * 0.6, 0.038, 0.286], pt, [0, 0.019, 0], null, 0.004);
      const pencil = K.std(0x30353b, { roughness: 0.6 });
      for (let i = 0; i < 4; i++) {
        const x0 = -0.75 + i * RUN;
        K.box(lay, [RUN, 0.002, 0.003], pencil, [x0 + RUN / 2, 0.039, 0.1], null, 0);
        K.box(lay, [0.003, 0.002, RISE], pencil, [x0 + RUN, 0.039, 0.1 - RISE / 2 + 0.001], null, 0);
      }
      const sq = K.group(lay, [-0.3, 0.045, 0.02], [0, 0, 0]);
      const steelSq = K.std(0x9aa3ab, { metalness: 0.8, roughness: 0.35 });
      K.box(sq, [0.61, 0.003, 0.05], steelSq, [0.28, 0, 0.1], null, 0);
      K.box(sq, [0.04, 0.003, 0.4], steelSq, [-0.005, 0, -0.08], null, 0);
      [[RUN - 0.03, 0.1], [0.0, 0.1 - RISE]].forEach(([x, z]) => K.box(sq, [0.03, 0.02, 0.02], 'brass', [x, 0.008, z], null, 0.003));
      // stringers
      const prof = [[0, DTOP - 0.025 - RISE], [RUN, DTOP - 0.025 - RISE], [RUN, DTOP - 0.025 - 2 * RISE], [2 * RUN, DTOP - 0.025 - 2 * RISE], [2 * RUN, DTOP - 0.025 - 3 * RISE], [3 * RUN, DTOP - 0.025 - 3 * RISE], [3 * RUN, PAD], [3 * RUN - 0.28, PAD], [0, PAD + (3 * RUN - 0.28) * (RISE / RUN)]];
      const st = K.part('stringers', [0, 0, 0], null, 'Three cut 2×12 stringers (≤ 18″ apart)');
      [-0.45, 0, 0.45].forEach((x) => XM.runX(K, st, prof, x - 0.019, x + 0.019, pt));
      const hang = K.part('hangers', [0, 0, 0], null, 'Stair-stringer connectors + structural screws');
      const galv = K.std(0xb7bec4, { metalness: 0.85, roughness: 0.35 });
      [-0.45, 0, 0.45].forEach((x) => {
        K.box(hang, [0.002, 0.14, 0.09], galv, [x - 0.021, prof[0][1] - 0.09, 0.045], null, 0);
        K.box(hang, [0.002, 0.14, 0.09], galv, [x + 0.021, prof[0][1] - 0.09, 0.045], null, 0);
        K.box(hang, [0.046, 0.14, 0.002], galv, [x, prof[0][1] - 0.09, 0.001], null, 0);
        K.rep(3, (i) => K.cyl(hang, [0.006, 0.006, 0.004, 10], galv, [x + 0.023, prof[0][1] - 0.13 + i * 0.04, 0.05], [0, 0, 90]));
      });
      // risers: 1×8 boards; treads: two 5/4×6 boards with 1″ nosing
      const ris = K.part('risers', [0, 0, 0], null, 'Riser boards');
      for (let i = 1; i <= 4; i++) {
        const top = PAD + i * RISE - 0.025;
        K.box(ris, [1.0, RISE - 0.025, 0.019], board, [0, top - (RISE - 0.025) / 2, (4 - i) * RUN + 0.0095], null, 0.003);
      }
      const tr = K.part('treads', [0, 0, 0], null, 'Treads: two 5/4×6 boards each, 1″ nosing');
      const nt = K.part('newTread', [0, 0, 0], null, 'New tread boards');
      const rt = K.part('rotTread', [0, 0, 0], null, 'Rotted, cupped tread');
      const rotM = K.bumpy(0x6d5a45, K.tex.speckle(), 0.02, { roughness: 1 });
      for (let i = 1; i <= 3; i++) {
        const y = PAD + i * RISE - 0.0125;
        const z0 = (3 - i) * RUN;
        [0, 1].forEach((k) => {
          const zc = z0 + 0.075 + k * 0.146 - 0.005;
          if (i === 2) {
            K.box(nt, [1.04, 0.025, 0.14], deckBoardMat(K, 0xc7a473), [0, y, zc], null, 0.004);
            K.box(rt, [1.04, 0.025, 0.14], rotM, [0, y, zc], [k ? 2 : -2, 0, 0], 0.004);
          } else K.box(tr, [1.04, 0.025, 0.14], board, [0, y, zc], null, 0.004);
        });
      }
      K.rep(4, (i) => K.sph(rt, 0.035, K.std(0x3b3226, { roughness: 1 }), [-0.35 + i * 0.22, PAD + 2 * RISE - 0.002, RUN + 0.1], [1.8, 0.25, 1]));
      // handrail (4+ risers need one): posts at top and bottom with a graspable 2×2 rail
      const rail = K.part('rail', [0, 0, 0], null, 'Graspable handrail (34–38″ above nosings)');
      const rx = 0.52;
      K.box(rail, [0.089, 1.0, 0.089], pt, [rx + 0.05, DTOP + 0.05, 0.1], null, 0.004);
      K.box(rail, [0.089, 1.0, 0.089], pt, [rx + 0.05, PAD + RISE + 0.36, 3 * RUN - 0.05], null, 0.004);
      XM.span(K, rail, [rx + 0.05, DTOP + 0.48, 0.1], [rx + 0.05, PAD + RISE + 0.82, 3 * RUN - 0.05], 0.045, 0.045, K.std(0x9a7650, { roughness: 0.6 }));
      for (let z = 0.25; z < 3 * RUN - 0.1; z += 0.12) {
        const yb = DTOP - (z / RUN) * RISE + 0.1;
        XM.span(K, rail, [rx + 0.05, yb, z], [rx + 0.05, yb + 0.68, z], 0.038, 0.038, pt);
      }
    }
  );

  /* ===== Bouncy deck: underside framing with sisters and blocking ===== */
  TB.model(
    'xDeckFrame',
    XM.view({ cam: [3.4, 0.55, 2.6], at: [0, 0.75, -0.2], tex: ['aerial_grass_rock', 'wood_planks'], hidden: ['sisters', 'fasteners', 'blocking', 'clamps'] }),
    (K) => {
      const pt = ptOf(K);
      const old = K.bumpy(0x9a8462, K.tex.woodBump(), 0.008, { roughness: 0.9 });
      const H = 1.25; // deck top
      const JT = H - 0.025; // joist top
      const wall = K.part('house', [0, 0, 0], null, 'House wall');
      XM.siding(K, wall, -2.2, 2.2, 0, 2.6, -1.85, 0xcfc9ba);
      const ledger = K.part('ledger', [0, 0, 0], null, '2×8 ledger, bolted to the house');
      K.box(ledger, [3.2, 0.184, 0.038], old, [0, JT - 0.092, -1.82], null, 0.004);
      K.rep(6, (i) => K.cyl(ledger, [0.012, 0.012, 0.006, 12], 'steel', [-1.35 + i * 0.54, JT - 0.07 - (i % 2) * 0.05, -1.8], [90, 0, 0]));
      const beam = K.part('beam', [0, 0, 0], null, 'Doubled 2×10 beam');
      K.box(beam, [3.4, 0.235, 0.076], old, [0, JT - 0.184 - 0.1175, 1.3], null, 0.004);
      const posts = K.part('posts', [0, 0, 0], null, '6×6 posts on footings');
      [-1.4, 0, 1.4].forEach((x) => {
        K.box(posts, [0.14, JT - 0.184 - 0.235, 0.14], old, [x, (JT - 0.184 - 0.235) / 2, 1.3], null, 0.006);
        K.cyl(posts, [0.15, 0.15, 0.08, 24], 'concrete', [x, 0.02, 1.3]);
      });
      const bounce = K.group(null, [0, 0, 0]);
      const joists = K.part('joists', [0, 0, 0], bounce, '2×8 joists, 16″ o.c., 10 ft span');
      const xs = [];
      for (let x = -1.42; x <= 1.43; x += 0.406) xs.push(+x.toFixed(3));
      xs.forEach((x) => K.box(joists, [0.038, 0.184, 3.4], old, [x, JT - 0.092, -0.12], null, 0.004));
      const hang = K.std(0xa9afb4, { metalness: 0.8, roughness: 0.4 });
      xs.forEach((x) => K.box(joists, [0.06, 0.15, 0.04], hang, [x, JT - 0.1, -1.78], null, 0.003));
      const crack = K.part('crack', [xs[3], JT - 0.09, -0.2], bounce, 'Checked, twisted joist');
      K.box(crack, [0.042, 0.006, 0.9], K.std(0x2b2520), [0, 0.01, 0], [0, 0, 0], 0);
      K.box(crack, [0.042, 0.004, 0.4], K.std(0x2b2520), [0, -0.04, 0.3], [4, 0, 0], 0);
      const deck = K.part('decking', [0, 0, 0], bounce, 'Deck boards');
      const db = deckBoardMat(K, 0xa98758);
      for (let z = -1.75; z < 1.5; z += 0.146) K.box(deck, [3.2, 0.025, 0.14], db, [0, H - 0.0125, z], null, 0.004);
      // fixes
      const sis = K.part('sisters', [0, 0, 0], null, 'New 2×8 sisters, full length');
      const fresh = K.pbr('wood_planks', [0.3, 2], { color: 0xc9b483 }, 'woodLight');
      xs.forEach((x) => K.box(sis, [0.038, 0.184, 3.0], fresh, [x + 0.038, JT - 0.092, -0.3], null, 0.004));
      const fas = K.part('fasteners', [0, 0, 0], null, 'Structural screws, 16″ staggered');
      xs.forEach((x) => {
        for (let z = -1.6; z < 1.1; z += 0.4) K.cyl(fas, [0.007, 0.007, 0.004, 8], 'steel', [x + 0.059, JT - 0.05 - (Math.round(z * 10) % 2 ? 0.08 : 0), z], [0, 0, 90]);
      });
      const blk = K.part('blocking', [0, 0, 0], null, 'Solid 2×8 blocking at mid-span');
      for (let i = 0; i < xs.length - 1; i++) {
        const a = xs[i] + 0.057;
        const b = xs[i + 1] - 0.019;
        K.box(blk, [b - a, 0.184, 0.038], fresh, [(a + b) / 2, JT - 0.092, -0.25 + (i % 2) * 0.05], null, 0.004);
      }
      const cl = K.part('clamps', [0, 0, 0], null, 'Clamps pulling the sister tight');
      [-0.9, 0.3].forEach((z) => {
        K.box(cl, [0.15, 0.02, 0.03], K.std(0xd03b2f, { roughness: 0.5 }), [xs[3] + 0.02, JT - 0.2, z], null, 0.004);
        K.box(cl, [0.012, 0.22, 0.012], 'steel', [xs[3] - 0.05, JT - 0.09, z], null, 0);
        K.box(cl, [0.15, 0.02, 0.03], 'black', [xs[3] + 0.02, JT + 0.01 - 0.03, z], null, 0.004);
      });
      return {
        tick(t, fx) {
          bounce.position.y = fx === 'bounce' ? -Math.abs(Math.sin(t * 5)) * 0.018 : 0;
        },
      };
    }
  );

  /* ===== Hidden-fastener composite decking (and a face-screwed wood version) ===== */
  const boardsModel = (wood) => (K) => {
    const pt = ptOf(K);
    const B = (c) => (wood ? K.pbr('wood_planks', [0.3, 2], { color: c }, 'woodLight') : K.bumpy(c, K.tex.woodBump(), 0.004, { roughness: 0.55 }));
    const field = B(wood ? 0xc2a171 : 0x8c6e55);
    const border = B(wood ? 0xa98757 : 0x4f3c2f);
    const JT = 0.418;
    const TOP = JT + 0.025;
    const blocks = K.part('blocks', [0, 0, 0], null, 'Deck blocks + doubled 2×8 beams');
    [-0.6, 0.6].forEach((z) => {
      [-1.0, 0, 1.0].forEach((x) => K.box(blocks, [0.28, 0.2, 0.28], 'concrete', [x, -0.05, z], null, 0.02));
      K.box(blocks, [2.5, 0.184, 0.076], pt, [0, 0.05 + 0.092, z], null, 0.004);
    });
    const frame = K.part('joists', [0, 0, 0], null, '2×8 joists 16″ o.c. + rim joists');
    const xs = [];
    for (let i = 0; i <= 6; i++) xs.push(-1.2 + i * 0.4);
    xs.forEach((x) => K.box(frame, [0.038, 0.184, 1.8], pt, [x, JT - 0.092, 0], null, 0.004));
    [-0.919, 0.919].forEach((z) => K.box(frame, [2.44, 0.184, 0.038], pt, [0, JT - 0.092, z], null, 0.004));
    const tape = K.part('tape', [0, 0, 0], null, 'Butyl joist tape');
    xs.forEach((x) => K.box(tape, [0.05, 0.002, 1.8], 'black', [x, JT + 0.001, 0], null, 0));
    [-0.919, 0.919].forEach((z) => K.box(tape, [2.44, 0.002, 0.05], 'black', [0, JT + 0.001, z], null, 0));
    // picture-frame border
    const pf = K.part('frame', [0, 0, 0], null, 'Picture-frame border boards');
    K.box(pf, [2.52, 0.025, 0.14], border, [0, TOP - 0.0125, 0.89], null, 0.004);
    K.box(pf, [2.52, 0.025, 0.14], border, [0, TOP - 0.0125, -0.89], null, 0.004);
    K.box(pf, [0.14, 0.025, 1.64], border, [-1.19, TOP - 0.0125, 0], null, 0.004);
    K.box(pf, [0.14, 0.025, 1.64], border, [1.19, TOP - 0.0125, 0], null, 0.004);
    // field boards: 10 rows inside the frame (z from 0.81 down to -0.81)
    const W = 0.146;
    const P = 0.1536;
    const groove = K.std(0x1d1a17, { roughness: 0.8 });
    const row = (p, i) => {
      const z = 0.81 - P / 2 - i * P + 0.003;
      K.box(p, [2.22, 0.025, W], field, [0, TOP - 0.0125, z], null, 0.004);
      if (!wood) [-1, 1].forEach((s) => K.box(p, [2.22, 0.006, 0.004], groove, [0, TOP - 0.0125, z + s * (W / 2 - 0.0015)], null, 0));
      return z;
    };
    const first = K.part('firstBoard', [0, 0, 0], null, wood ? 'First board (straightest one)' : 'First board, groove into the starter clips');
    const zs = [row(first, 0)];
    const mid = K.part('boards', [0, 0, 0], null, wood ? 'Field boards, ⅛″ gaps' : 'Grooved composite boards');
    for (let i = 1; i < 9; i++) zs.push(row(mid, i));
    const last = K.part('lastBoard', [0, 0, 0], null, wood ? 'Last board, ripped to fit' : 'Last board, face-screwed + plugged');
    zs.push(row(last, 9));
    const fast = K.part('fasteners', [0, 0, 0], null, wood ? '2½″ coated deck screws, two per joist' : 'Hidden clips at every joist');
    const inner = xs.slice(1, -1);
    if (wood) {
      zs.forEach((z) => inner.forEach((x) => [-0.04, 0.04].forEach((dz) => K.cyl(fast, [0.0045, 0.0045, 0.002, 10], 'steel', [x, TOP + 0.0005, z + dz]))));
    } else {
      for (let i = 0; i < zs.length - 1; i++) {
        const zc = (zs[i] + zs[i + 1]) / 2;
        inner.forEach((x) => {
          K.box(fast, [0.03, 0.012, 0.008], 'black', [x, TOP - 0.012, zc], null, 0.001);
          K.cyl(fast, [0.004, 0.004, 0.003, 8], 'steel', [x, TOP + 0.0002, zc]);
        });
      }
    }
    const st = K.part('starter', [0, 0, 0], null, wood ? '⅛″ gap spacers' : 'Starter clips on the front edge');
    if (wood) [-0.6, 0, 0.6].forEach((x) => K.box(st, [0.03, 0.04, 0.003], 'orange', [x, TOP + 0.01, zs[0] - W / 2 - 0.002], null, 0));
    else inner.forEach((x) => K.box(st, [0.04, 0.012, 0.012], 'steel', [x, TOP - 0.012, 0.817], null, 0.001));
    if (!wood) [-0.8, 0, 0.8].forEach((x) => K.cyl(last, [0.005, 0.005, 0.002, 10], B(0x7a5f4a), [x, TOP + 0.0005, zs[9]]));
    const fas = K.part('fascia', [0, 0, 0], null, wood ? '1×8 fascia' : 'Composite fascia');
    [-0.94, 0.94].forEach((z) => K.box(fas, [2.56, 0.2, 0.014], border, [0, JT - 0.08, z + Math.sign(z) * 0.008], null, 0.003));
    [-1.24, 1.24].forEach((x) => K.box(fas, [0.014, 0.2, 1.9], border, [x + Math.sign(x) * 0.0, JT - 0.08, 0], null, 0.003));
  };
  const BV = { cam: [2.4, 1.7, 2.6], at: [0, 0.3, 0], tex: ['aerial_grass_rock', 'wood_planks'], hidden: ['tape', 'frame', 'firstBoard', 'boards', 'lastBoard', 'fasteners', 'starter', 'fascia'] };
  TB.model('xCompositeDeck', XM.view(BV), boardsModel(false));
  TB.model('xWoodDeckBoards', XM.view(BV), boardsModel(true));

  /* ---------------- Deck guides ---------------- */
  const S0 = [0, 0.45, 0.3];
  const stairsShow = ['pad', 'stringers', 'hangers', 'risers', 'treads', 'newTread', 'rail'];
  TB.more('deck', [
    {
      id: 'deck-stairs',
      title: 'Build deck stairs with cut stringers',
      model: 'xDeckStairs',
      kind: 'build',
      level: 3,
      time: '1–2 days',
      cost: '$250–600',
      summary: 'Four equal 7⅛″ steps down from a deck 28½″ above the landing, on three cut 2×12 stringers resting on a concrete pad. The work is in the math: every step within ⅜″ of the others.',
      intro: { show: stairsShow, preview: true, spin: true },
      safety: ['Wear eye and hearing protection when cutting; finish notch corners with a handsaw instead of over-cutting.', 'Stairs with four or more risers need a handrail; stairs and decks more than 30″ above the ground need guards on open sides.', 'Check local code and permits; deck stairs are a top inspection point.'],
      causes: [['Measure the total rise', 'From deck top to the finished landing, then divide into equal risers of 7¾″ or less.'], ['Set the width', '36″ minimum; three stringers no more than 18″ apart.'], ['Check the span', 'Cut stringers may span about 6 ft horizontally (7 ft for southern pine 2×12s) before they need a middle support.'], ['Plan the landing', 'A level concrete pad or compacted gravel base, not bare soil.']],
      tools: ['Framing square + stair gauges', 'Circular saw + handsaw', 'Drill/driver', 'Tape measure, 4 ft level', 'Pressure-treated 2×12s rated for ground contact', 'Stair-stringer connectors + their structural screws', '5/4×6 tread boards, 1×8 risers', '2½″ coated deck screws', 'Concrete mix, gravel, 2×4 forms', 'End-cut preservative', 'Eye and hearing protection'],
      steps: [
        { t: 'Measure the total rise', d: 'Measure from the deck surface straight down to where the top of the landing will be. Divide by 7¾ (the code maximum) and round up for the number of risers, then divide again: 28½″ ÷ 4 = 7⅛″ per step.', why: 'Every step must be within ⅜″ of the others. Your feet learn the first step’s height and trip on one that’s different.', tip: 'Ground is rarely level. Hold a long level or a straight 2×4 level out from the deck edge and measure down at the exact spot the stairs will land, not along the slope.', ok: 'You have one number for the total rise and a riser height between 7″ and 7¾″.', v: { cam: [1.8, 1.0, 1.9], at: [0, 0.4, 0.2], hi: ['deck'], tool: { id: 'tape', at: [0.0, 0.04, 0.05], rot: [0, 0, 0], scale: 1.4 } } },
        { t: 'Pour the landing pad', d: 'Dig out 8″, add 4″ of compacted gravel and pour a 4″ concrete pad as wide as the stairs plus 6″ each side, sloped ⅛″ per foot away from the stairs. Its top must sit at the height you measured to.', why: 'Stringers on soil rot and settle; a pad keeps the bottom step the right height for decades.', tip: 'Pour the pad before cutting stringers, then re-measure the rise to the finished pad. Guessing the pad height is how bottom steps end up tall.', ok: 'The pad is flat, sheds water away from the stairs, and the re-measured rise matches within ⅛″.', v: { cam: [2.2, 1.6, 2.6], at: [0, 0.1, 1.0], hi: ['pad'], show: ['pad'], tool: { id: 'level', at: [0, 0.045, 1.2], rot: [0, 0, 0], scale: 2.5 } } },
        { t: 'Lay out the first stringer', d: 'Clamp stair gauges (small stop clamps) to a framing square at 7⅛″ on the short arm and 10⅝″ on the long arm. Lay it on the 2×12, crown up, and trace each notch, sliding it along. Mark the top and bottom cuts, then shorten the bottom by one tread thickness.', why: 'Trimming one tread thickness off the bottom keeps the first step the same height as the rest once treads are on.', tip: 'Keep both gauges tight to the board edge every time. Being off 1/16″ per notch adds up to ¼″ by the bottom.', ok: 'Every traced notch has the same rise and run, and at least 5″ of solid wood remains under the deepest notch.', v: { cam: [1.4, 1.4, 2.6], at: [0.8, 0.0, 1.9], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [0.0, 0.04, 1.9], rot: [0, 0, 0] } } },
        { t: 'Cut and test-fit it', d: 'Cut the lines with a circular saw, stopping right at each inside corner, and finish each notch with a handsaw held upright. Hold the stringer against the rim and set a level on each tread seat.', why: 'Saw cuts past the corner weaken the stringer right where it’s thinnest.', tip: 'Set the saw blade just ¼″ deeper than the board so the round blade over-cuts as little as possible underneath. If seats aren’t level, adjust the top or bottom cut, not each notch.', ok: 'Each tread seat reads level and the bottom foot sits flat on the pad.', v: { cam: [2.4, 1.2, 1.6], at: [0, 0.4, 0.4], hi: ['stringers'], show: ['stringers'], hide: ['layout'], tool: { id: 'handsaw', at: [0.45, 0.6, 0.29], rot: [0, 0, 0] } } },
        { t: 'Copy and hang all three', d: 'Trace the first stringer onto two more boards and cut them. Hang all three from the rim joist with stair-stringer connectors and the screws they specify, no more than 18″ apart (12″ for most composite treads).', why: 'Toe-nailed stringers pull loose; metal connectors carry the load into the rim.', tip: 'Clamp the three together edge to edge and check they match before hanging. A 2×4 block screwed between them at the bottom keeps them parallel.', ok: 'A straight board laid across all three stringers touches every notch, and every connector hole has its screw.', v: { cam: [1.6, 1.3, 1.4], at: [0, 0.55, 0.1], hi: ['hangers'], show: ['hangers'], tool: { id: 'drill', at: [0.474, 0.5, 0.05], rot: [0, 0, 90], anim: 'spin' } } },
        { t: 'Fit the risers', d: 'Screw riser boards (1×8 ripped to the exact riser height) to the front face of each notch with two screws per stringer.', why: 'Closed risers stiffen the stringers and stop small feet from slipping through.', tip: 'Prefer open risers? On stairs more than 30″ high the gap must stop a 4″ ball from passing through.', ok: 'Each riser sits flush with the notch faces and tight under the tread above.', v: { cam: [2.0, 1.0, 2.4], at: [0, 0.4, 0.4], hi: ['risers'], show: ['risers'] } },
        { t: 'Install the treads', d: 'Screw two 5/4×6 boards to each step with two 2½″ coated deck screws per stringer, a ⅛″ gap between boards and a 1″ nosing (overhang) past the riser.', why: 'The nosing gives your foot more room; the gap lets water drain.', tip: 'Pre-drill within 2″ of board ends so they don’t split. Set the front board first on every step and pull a string along the fronts so the nosings line up.', ok: 'Each tread is flat, the nosings form a straight line, and nothing flexes when you stand on the front edge.', v: { cam: [1.8, 1.6, 2.2], at: [0, 0.45, 0.45], hi: ['treads', 'newTread'], show: ['treads', 'newTread'], tool: { id: 'drill', at: [0.45, 0.405, 0.35], rot: [0, 0, 0], anim: 'spin' } } },
        { t: 'Add the handrail', d: 'Bolt posts at the top and bottom with ½″ through-bolts and run a graspable rail (one your hand can wrap around, like 1¼–2″ round) 34–38″ above the tread nosings. Space any balusters so a 4″ ball can’t pass.', why: 'A handrail is required with four or more risers, and it’s the first thing an inspector checks.', tip: 'A flat 2×4 or 2×6 is not graspable. Mount a shaped rail on brackets, or buy a graspable rail profile, beside the guard cap.', ok: 'Your fingers wrap around the rail, it measures 34–38″ above every nosing, and it doesn’t move when you lean on it.', v: { cam: [2.6, 1.7, 2.9], at: S0, hi: ['rail'], show: ['rail'] } },
      ],
      variants: [
        { id: 'new', name: 'Build new stairs', blurb: 'Lay out, cut and hang new stringers.' },
        {
          id: 'tread',
          name: 'Replace a rotted tread',
          blurb: 'Swap one soft or cracked step without touching the stringers.',
          level: 1,
          time: '30–60 min',
          cost: '$15–40',
          summary: 'A spongy step is usually just the tread boards. Pull them, check the stringer under them for rot, and screw on new boards.',
          intro: { hi: ['rotTread'], show: ['pad', 'stringers', 'hangers', 'risers', 'treads', 'rotTread', 'rail'] },
          causes: [['Water sits on the tread', 'Flat-sawn boards cup and hold water.'], ['No gap between boards', 'Debris packs in and stays wet.'], ['End grain unsealed', 'Cut ends soak up water.']],
          tools: ['Drill/driver + matching screw bit', 'Flat pry bar', 'Circular saw', 'Tape measure', '5/4×6 deck boards', '2½″ coated deck screws', 'End-cut preservative + brush', 'Butyl joist tape', 'Screwdriver (to probe for rot)'],
          steps: [
            { t: 'Find the bad tread', d: 'Press on each step with your foot. Push a screwdriver into the soft one: if it sinks more than ¼″ or the wood feels stringy and punky, the board is rotten.', why: 'Rot often starts underneath, where the tread sits on the stringer and can’t dry.', tip: 'Shine a flashlight under the step too; dark, crumbly wood at the stringer means check that stringer carefully in step 3.', ok: 'You know exactly which boards are soft, and the others resist the screwdriver.', v: { cam: [1.6, 1.3, 1.9], at: [0, 0.4, 0.4], hi: ['rotTread'] } },
            { t: 'Remove the old boards', d: 'Back out the screws with the matching bit, pressing hard so it doesn’t slip, or pry the boards up from underneath with a flat bar.', why: 'Pry from below so you don’t gouge the riser or the next tread.', tip: 'Stripped screw head? Press a wide rubber band between bit and screw for grip. Still stuck: lift the board off over the screw, then twist the screw out with locking pliers.', ok: 'The tread is off and the tops of the stringers are exposed.', v: { cam: [1.6, 1.0, 1.8], at: [0, 0.4, 0.4], hi: ['rotTread'], mv: { rotTread: [0, 0.12, 0.25] }, tool: { id: 'flatBar', at: [0.3, 0.37, 0.5], rot: [-70, 0, 0] } } },
            { t: 'Check the stringer seats', d: 'Probe the top of each stringer notch. Brush end-cut preservative on sound wood; a seat soft more than ¼″ deep means that stringer needs replacing.', why: 'New treads on a rotten stringer just hide the problem.', tip: 'Stick a strip of butyl joist tape on each seat before the new treads go on; it keeps water out of the screw holes.', ok: 'Every seat is hard and dry, and coated with preservative or covered with tape.', v: { cam: [1.4, 1.2, 1.6], at: [0, 0.4, 0.35], hi: ['stringers'], hide: ['rotTread'] } },
            { t: 'Cut the new boards', d: 'Cut two boards to match the others (usually 1″ past the stringers each side) and brush preservative on the cut ends.', why: 'Matching lengths keep the stairs looking even, and sealed ends soak up less water.', tip: 'Look at the end grain: most lumber makers suggest putting the bark side up, so the growth rings curve like a frown.', ok: 'The new boards match the old length and the cut ends are coated.', v: { cam: [1.6, 1.3, 1.9], at: [0, 0.4, 0.4], hi: ['stringers'], tool: { id: 'tape', at: [-0.52, 0.38, 0.35], rot: [0, 0, 0] } } },
            { t: 'Screw them down', d: 'Set the front board with a 1″ nosing, then the back one with a ⅛″ gap, and drive two 2½″ coated deck screws into each stringer.', why: 'Two screws per stringer keep the board from cupping or twisting as it dries.', tip: 'Pre-drill within 2″ of the ends so they don’t split. A 16d nail between boards makes a handy ⅛″ spacer.', ok: 'The step feels solid with no flex or squeak, the gap is even, and screw heads sit just flush.', v: { cam: [1.6, 1.3, 1.9], at: [0, 0.4, 0.4], hi: ['newTread'], show: ['newTread'], tool: { id: 'drill', at: [0.45, 0.405, 0.35], rot: [0, 0, 0], anim: 'spin' } } },
          ],
        },
      ],
      learn: {
        how: 'A cut stringer is a sawtooth beam. Each notch is one rise and one run, and the wood left below the notches (the throat) carries the load, so it must stay at least 5″ deep. Stairs are judged by consistency: your brain measures the first two steps and expects the rest to match, which is why codes limit the difference between any two steps to ⅜″.',
        specs: [['Max riser', '7¾″'], ['Min tread depth', '10″'], ['Step-to-step variation', '≤ ⅜″'], ['Nosing', '¾–1¼″'], ['Min width', '36″'], ['Stringer spacing', '≤ 18″ o.c. (often 12″ for composite treads)'], ['Cut stringer span', '≈ 6 ft horizontal (7 ft SYP 2×12)'], ['Handrail height', '34–38″ above nosings'], ['Throat', '≥ 5″ of solid wood']],
        terms: [['Rise / run', 'Height and depth of one step.'], ['Stringer', 'The notched board that carries the treads.'], ['Throat', 'Solid wood left under the deepest notch.'], ['Nosing', 'Front edge of the tread that overhangs the riser.'], ['Stair gauges', 'Little clamps on a framing square that repeat the same notch.']],
        mistakes: ['Forgetting to drop the bottom of the stringer by one tread thickness.', 'Over-cutting the notch corners.', 'Setting stringers on dirt.', 'Using a flat 2×4 as the handrail.'],
        tips: ['Use the straightest 2×12 with the crown (hump) facing up.', 'Make all three stringers from the first one so they match exactly.'],
      },
      pro: 'The deck is more than about 5 ft high, the run needs a mid-landing or a turn, or your local code requires engineered stairs.',
      tricks: [['Rise plus run', 'Comfortable stairs have rise plus run of about 17–18″ (7⅛ + 10⅝ = 17¾″). Use it to choose the run once you know the rise.'], ['Story pole', 'Mark each riser height on a straight 2×4 held plumb against the deck. It shows instantly if the ground or pad throws off the bottom step.'], ['Test one, then copy', 'Test-fit the first stringer before cutting the rest. Fixing one board costs $30; fixing three costs a weekend.'], ['Seal every cut', 'Brush end-cut preservative on each saw cut in treated lumber; the treatment doesn’t always reach the center.'], ['Kicker at the bottom', 'A treated 2×4 screwed to the pad with concrete screws, fitted into notches at the stringer feet, stops the bottom from sliding.'], ['Mark the waste', 'Hatch the scrap triangles with your pencil before cutting so you never cut on the wrong side of a line.']],
      refs: [['Building and installing deck stairs (JLC Deck Builder)', 'https://www.jlconline.com/deck-builder/building-and-installing-deck-stairs_o'], ['Panel discussion: safe and durable deck stairs (JLC)', 'https://www.jlconline.com/how-to/exteriors/panel-discussion-safe-and-durable-deck-stairs_o/'], ['DCA 6 deck guide updates (American Wood Council)', 'https://awc.org/publications/dca6-prescriptive-residential-wood-deck-guide-updates-errata/'], ['2018 residential stair guide, IRC R311.7 (Town of Timnath)', 'https://timnath.org/wp-content/uploads/2022/03/2018-RESIDENTIAL-STAIR-GUIDE.pdf'], ['Laying out deck stair stringers (Fine Homebuilding)', 'https://www.finehomebuilding.com/project-guides/decks/laying-out-the-deck-stair-stringers'], ['Building safe and sturdy deck stairs (Simpson Strong-Tie)', 'https://seblog.strongtie.com/2025/07/decks-done-right-series-real-solutions-for-safer-stronger-decks-building-building-safe-and-sturdy-stairs-for-your-deck-2/']],
    },
    {
      id: 'bouncy-deck',
      title: 'Stiffen a bouncy deck',
      model: 'xDeckFrame',
      level: 3,
      time: '½–1 day',
      cost: '$150–500',
      summary: 'A deck that bounces underfoot usually has joists stretched near the limit of their span. Sister new joists alongside the old ones and add a row of solid blocking at mid-span.',
      intro: { hi: ['joists', 'decking'], fx: 'bounce' },
      safety: ['Wear eye protection and a dust mask working overhead under the deck.', 'If the ledger is pulling from the house or posts are rotted, stop: that’s a collapse risk, not a stiffness problem.', 'Support long boards on sawhorses while cutting, and keep fingers clear of clamps under load.'],
      causes: [['Joists over-spanned', 'Common on older decks: 2×8s at 16″ stretched past about 12 ft.'], ['No blocking', 'Joists twist and act alone instead of together.'], ['Joists weakened', 'Cracks, rot or notches near mid-span.'], ['Loose decking', 'Popped screws let boards move separately.']],
      tools: ['Impact driver or drill/driver', 'Circular saw', 'Tape measure, level, chalk', 'Bar clamps', 'Pressure-treated 2×8s (sisters + blocking)', 'Structural screws (e.g. 3½″) or ½″ through-bolts + washers', '3″ coated screws for blocking', 'Joist hangers (if needed)', 'Eye protection, dust mask'],
      steps: [
        { t: 'Find where it bounces', d: 'Walk the deck while someone watches from beside or below it. Note which joists (the boards under the decking) move most and where along their length.', why: 'Bounce is worst at mid-span, halfway between supports. That’s where the fixes go.', tip: 'Set a glass of water on the deck and walk past it; the ripples show bounce your eyes miss.', ok: 'You’ve marked the bounciest joists and spots with chalk.', v: { cam: [3.0, 2.2, 2.6], at: [0, 1.0, -0.2], hi: ['decking'], fx: 'bounce' } },
        { t: 'Inspect from below', d: 'Check joists for cracks, rot and loose hangers, then the ledger (the board fastened to the house) and the posts. Push a screwdriver into any suspect wood.', why: 'Sistering stiffens a floor; it won’t fix a failing ledger or post, which can collapse.', tip: 'The ledger should be held with ½″ bolts or structural screws, not just nails. Nails only? Stop and fix that first, or call a pro.', ok: 'Ledger, posts and hangers are solid, and you’ve listed any cracked or soft joists.', v: { cam: [2.6, 0.5, 1.4], at: [0, 1.05, -0.4], hi: ['joists', 'crack', 'ledger'] } },
        { t: 'Measure the span', d: 'Measure each joist from ledger to beam and compare it with a span table, such as the American Wood Council’s DCA 6, for its size, wood type and spacing.', why: 'Joists far past their allowed span need a deeper sister or a new mid-span beam, not just extra boards.', tip: 'The wood type and grade are stamped on the side of the joist. Snap a photo of the stamp before you look up the table.', ok: 'You know the span and how it compares with the table limit.', v: { cam: [2.6, 0.5, 1.4], at: [0, 1.05, -0.4], hi: ['joists', 'beam'], tool: { id: 'tape', at: [0.2, 1.03, -1.78], rot: [90, 0, 0], scale: 1.4 } } },
        { t: 'Fit the sisters', d: 'Cut new 2×8s to run as close to full length as possible. Set each crown up beside a weak joist, resting on the beam and the ledger end, and clamp them tight together.', why: 'A sister must bear at both ends, or nearly so, to share the load; a short piece just moves the weak spot.', tip: 'Sight down each board to find the crown (the hump) and mark it with an arrow. If an old hanger blocks the sister, cut it ¼″ short and give it its own joist hanger.', ok: 'The sisters press tight against the old joists along their whole length, with tops flush.', v: { cam: [2.6, 0.5, 1.4], at: [0, 1.05, -0.4], hi: ['sisters', 'clamps'], show: ['sisters', 'clamps'] } },
        { t: 'Fasten them', d: 'Drive structural screws (or ½″ through-bolts with washers) every 16″, staggered: one near the top edge, the next near the bottom.', why: 'Staggering spreads the fasteners so the old and new joists act as one thicker beam.', tip: 'Use an impact driver and the bit that comes with the screws; stop when the head is flush. If a screw hits a knot and stalls, back it out and move 2″.', ok: 'The old and new joists won’t slide past each other when you push them in opposite directions.', v: { cam: [1.6, 0.5, 0.8], at: [0, 1.1, -0.4], hi: ['fasteners'], show: ['fasteners'], hide: ['clamps'], tool: { id: 'drill', at: [0.483, 1.17, -0.4], rot: [0, 0, -90], anim: 'spin' } } },
        { t: 'Add mid-span blocking', d: 'Cut solid 2×8 blocks to fit snugly between joists and install a row across the middle, staggered so you can drive three 3″ screws through each joist into the block ends.', why: 'Blocking makes neighboring joists share the load and keeps them from rolling, which noticeably cuts bounce.', tip: 'Measure each bay separately; joists are rarely exactly the same distance apart. A block that needs a tap of the hammer to go in is a perfect fit.', ok: 'Each block fits snug, flush with the joist bottoms, with no gaps at its ends.', v: { cam: [2.6, 0.45, 1.0], at: [0, 1.05, -0.25], hi: ['blocking'], show: ['blocking'], tool: { id: 'hammer', at: [-0.2, 1.13, -0.2], rot: [0, 0, 0], anim: 'tap' } } },
        { t: 'Walk it again', d: 'Walk the deck. The boards should feel solid; re-drive any deck screws that have popped up.', why: 'If it still bounces, the next fix is a mid-span beam on new footings.', tip: 'Repeat the water-glass test. Smaller ripples than before mean the fix worked even if you can still feel a little give.', ok: 'The deck feels firm underfoot and the water in the glass barely moves.', v: { cam: [3.0, 2.2, 2.6], at: [0, 1.0, -0.2], hi: ['decking'] } },
      ],
      learn: {
        how: 'A joist is a beam. Its stiffness grows with the cube of its depth, which is why a 2×10 is about twice as stiff as a 2×8. Sistering doubles the width and nearly doubles the stiffness. Blocking doesn’t make one joist stiffer, but it makes the joist you step on share the load with its neighbors.',
        specs: [['2×8 southern pine at 16″', '≈ 13 ft max span (check DCA 6 or local table)'], ['Fastener spacing', '16″ staggered'], ['Blocking', 'Mid-span, or every 4–6 ft'], ['Deflection target', 'Span ÷ 360 (L/360)']],
        terms: [['Sister', 'A new joist fastened alongside an old one.'], ['Crown', 'The natural hump in a board; install it up.'], ['Blocking', 'Short joist pieces between joists.'], ['Span', 'Clear distance a joist covers between supports.'], ['Ledger', 'Board fastened to the house that carries one end of the joists.']],
        mistakes: ['Short sisters that don’t reach the supports.', 'Nails instead of structural screws or bolts.', 'Loose blocking that rattles instead of bracing.', 'Stiffening a deck whose ledger is failing.'],
        tips: ['Pre-drill bolt holes and use galvanized washers.', 'Seal the tops of new joists with joist tape while you’re there.'],
      },
      pro: 'The ledger is pulling away, posts are rotted or undersized, the deck is high off the ground, or joists are far over-span and need a new beam and footings.',
      tricks: [['Water-glass test', 'A glass of water on the deck shows bounce as ripples, so you can compare before and after.'], ['Crown arrows', 'Mark each new board’s crown with an arrow before it goes overhead; upside-down sisters fight the deck.'], ['Clamp before screwing', 'Pull sister and joist tight with bar clamps first. Screws alone leave a gap that weakens the pair.'], ['Rented post jack', 'A screw jack under a sagging joist lifts it level while you fasten the sister, so the pair locks in straight.'], ['Matched fasteners', 'Treated lumber eats plain steel. Use screws and bolts rated for treated wood (hot-dip galvanized or coated).'], ['Blocking calms the boards', 'Solid blocking also stops joists twisting as they dry, so decking screws pop up less often.']],
      refs: [['DCA 6 deck guide updates (American Wood Council)', 'https://awc.org/publications/dca6-prescriptive-residential-wood-deck-guide-updates-errata/'], ['6 ways to stiffen a bouncy floor (Fine Homebuilding)', 'https://www.finehomebuilding.com/project-guides/framing/6-ways-to-stiffen-a-bouncy-floor'], ['How to fix a wobbly deck (This Old House)', 'https://www.thisoldhouse.com/decking/21097105/how-to-fix-a-wobbly-deck'], ['Fix a bouncy deck (Extreme How-To)', 'https://extremehowto.com/fix-a-bouncy-deck/']],
    },
    {
      id: 'composite-deck',
      title: 'Install composite decking with hidden fasteners',
      model: 'xCompositeDeck',
      kind: 'build',
      level: 3,
      time: '1–2 days',
      cost: '$1,200–2,800',
      summary: 'Grooved composite boards on an 8×6 ft frame, held by clips in the board edges so no screws show. A darker picture-frame border hides all the cut ends.',
      intro: { show: ['tape', 'frame', 'firstBoard', 'boards', 'lastBoard', 'fasteners', 'starter', 'fascia'], preview: true, spin: true },
      safety: ['Wear eye protection and a dust mask when cutting composite.', 'Support long boards so they don’t snap or swing.', 'Follow the brand’s gapping chart; composite grows and shrinks with temperature.'],
      causes: [['Check joist spacing', '16″ o.c. for straight boards, 12″ for diagonal or most stair treads (check the brand).'], ['Pick a fastener system', 'Clips made for your board brand keep the warranty.'], ['Plan the layout', 'Order lengths that avoid butt joints, or plan joints over doubled joists.'], ['Check the frame', 'New boards on rotten or wavy joists won’t last or look right.']],
      tools: ['Miter saw or circular saw with fine-tooth blade', 'Drill/driver', 'Hidden clips + starter clips (brand-matched)', 'Grooved composite boards', 'Square-edge boards for the border', 'Butyl joist tape', 'Rubber mallet + scrap block', 'Color-matched screws + plugs', 'Chalk line, tape measure', 'Eye protection, dust mask'],
      variants: [
        { id: 'composite', name: 'Composite, hidden clips', blurb: 'Grooved boards, clips in the edges, no visible screws.' },
        {
          id: 'wood',
          name: 'Wood, face-screwed',
          blurb: 'Pressure-treated or cedar boards with two coated screws per joist.',
          model: 'xWoodDeckBoards',
          cost: '$500–1,200',
          summary: 'Wood decking goes down faster and cheaper: lay each board with a ⅛″ gap (or tight if soaking-wet treated) and drive two coated deck screws into every joist.',
          tools: ['Circular saw + speed square', 'Drill/driver', '2½″ coated deck screws (3″ for 2× boards)', '5/4×6 treated or cedar boards', 'Butyl joist tape', '⅛″ spacers', 'Chalk line, tape measure'],
          steps: [
            { t: 'Check the frame', d: 'Confirm joists are 16″ on center, level and in plane.', why: 'High or low joists show up as wavy boards.', tip: 'A straight 8 ft board laid across the joists shows high and low spots instantly.', ok: 'The straightedge touches every joist with no gap bigger than ⅛″.', v: { cam: [2.4, 1.7, 2.6], at: [0, 0.3, 0], hi: ['joists'], tool: { id: 'level', at: [0, 0.42, 0.4], rot: [0, 90, 0], scale: 2.5 } } },
            { t: 'Tape the joists', d: 'Roll butyl joist tape over every joist and rim top, pressing it down.', why: 'It sheds water away from screw holes and helps the framing last much longer.', tip: 'Cut the tape with a utility knife at each end and lap it over the rim so water can’t run under.', ok: 'Every joist top is covered with flat, bubble-free tape.', v: { cam: [2.0, 1.5, 2.0], at: [0, 0.4, 0], hi: ['tape'], show: ['tape'] } },
            { t: 'Lay the border', d: 'Screw the border boards around the perimeter with mitered corners, two screws per joist.', why: 'The border hides the field boards’ cut ends.', tip: 'Cut miters a hair long and shave to fit; a tight miter looks best after the wood shrinks.', ok: 'The corners close and the border runs straight.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.4, 0], hi: ['frame'], show: ['frame'] } },
            { t: 'Place the first board', d: 'Set the straightest board against the border and screw it: two 2½″ coated deck screws per joist, ¾″ from the edges.', why: 'Every other board follows the first.', tip: 'Pre-drill within 2″ of the ends so the board doesn’t split.', ok: 'The first board is straight, flat and fully screwed.', v: { cam: [1.8, 1.2, 1.9], at: [0, 0.44, 0.6], hi: ['firstBoard'], show: ['firstBoard'], tool: { id: 'drill', at: [-0.4, 0.444, 0.73], rot: [0, 0, 0], anim: 'spin' } } },
            { t: 'Gap and screw the field', d: 'Use ⅛″ spacers between boards (or butt soaking-wet treated boards tight) and drive two screws into every joist.', why: 'Dry boards need the gap to drain; wet treated boards will shrink apart on their own.', tip: 'Bowed board? Screw one end, lever the bow straight with a chisel or a board straightener, then screw as you go.', ok: 'Even gaps, screws just flush, and no board edges sticking up.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.44, 0], hi: ['boards', 'fasteners', 'starter'], show: ['boards', 'fasteners', 'starter'], tool: { id: 'drill', at: [0.4, 0.444, 0.2], rot: [0, 0, 0], anim: 'spin' } } },
            { t: 'Rip the last board', d: 'Rip the last board to width, screw it, and add the fascia.', why: 'A ripped board against the border looks intentional; a sliver doesn’t.', tip: 'If the last piece will be under 2″, rip a little off the last 3–4 boards instead.', ok: 'The last board is at least 2″ wide and flush with its neighbors.', v: { cam: [2.4, 1.7, 2.6], at: [0, 0.3, 0], hi: ['lastBoard', 'fascia'], show: ['lastBoard', 'fascia'], hide: ['starter'] } },
          ],
        },
      ],
      steps: [
        { t: 'Check the frame', d: 'Confirm joists are 16″ on center (12″ for diagonal boards), level and in plane. Lay a straight 8 ft board across them; plane down high spots and shim low ones.', why: 'Composite boards follow the frame exactly; they hide nothing.', tip: 'Stretch strings across the joist tops at both ends and the middle. Any joist that lifts a string or sits more than ⅛″ below it needs work.', ok: 'The straightedge touches every joist with no gap bigger than ⅛″.', v: { cam: [2.4, 1.7, 2.6], at: [0, 0.3, 0], hi: ['joists'], tool: { id: 'level', at: [0, 0.42, 0.4], rot: [0, 90, 0], scale: 2.5 } } },
        { t: 'Tape the joists', d: 'Roll butyl joist tape (a sticky waterproof strip) over every joist and rim top, pressing it down well. Use wider tape where board ends will meet.', why: 'Clip screws make hundreds of holes in the joist tops; the tape seals around each one.', tip: 'Apply it on dry wood above the tape’s minimum temperature and press with a small roller. Tape bridging a dip lets water in underneath.', ok: 'Tape covers every joist top, lies flat with no bubbles, and drapes a little over both sides.', v: { cam: [2.0, 1.5, 2.0], at: [0, 0.4, 0], hi: ['tape'], show: ['tape'], tool: { id: 'utilityKnife', at: [1.2, 0.43, 0.5], rot: [0, 0, 60] } } },
        { t: 'Lay the picture frame', d: 'Fasten square-edge border boards around the outside with color-matched screws, pre-drilled, mitering the corners and leaving the gaps the maker lists.', why: 'The border covers every field-board end and gives a finished look.', tip: 'Add a short 2× block beside the rim at every border joint and corner so each board end lands on solid wood.', ok: 'Miters close neatly and every screw sits flush.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.4, 0], hi: ['frame'], show: ['frame'], tool: { id: 'drill', at: [1.19, 0.444, 0.4], rot: [0, 0, 0], anim: 'spin' } } },
        { t: 'Starter clips and first board', d: 'Snap a chalk line, screw a starter clip to each joist along it, then slide the first grooved board into the clips.', why: 'Starter clips hold the hidden edge of the first board without face screws.', tip: 'If the first board is straight, every board after it will be. Push any bow out to the line before clipping.', ok: 'The first board is tight in every starter clip and dead straight along the chalk line.', v: { cam: [1.6, 1.0, 1.7], at: [0, 0.42, 0.75], hi: ['starter', 'firstBoard'], show: ['starter', 'firstBoard'], tool: { id: 'drill', at: [-0.4, 0.43, 0.817], rot: [0, 0, 0], anim: 'spin' } } },
        { t: 'Clip every joist', d: 'Push a hidden clip into the open groove at each joist and drive its screw until snug.', why: 'Built-in tabs on the clip set the 3/16″ side gap between boards automatically.', tip: 'Set the drill clutch low. An over-driven clip bends and pinches the board; an under-driven one rattles. If a screw strips, move the clip 1″ along.', ok: 'Every clip sits flat and tight, and you can’t lift the board edge.', v: { cam: [1.3, 0.9, 1.3], at: [0, 0.43, 0.55], hi: ['fasteners'], show: ['fasteners'], tool: { id: 'drill', at: [0.4, 0.443, 0.651], rot: [0, 0, 0], anim: 'spin' } } },
        { t: 'Set the next boards', d: 'Slide each board into the clips and tap it home with a rubber mallet and scrap block, then clip its far edge. Gap butt ends ⅛″ above 40 °F and 3/16″ below (check your brand’s chart).', why: 'Composite grows and shrinks along its length with temperature; the end gap lets it move without buckling.', tip: 'Put two joists or a block under every butt joint so each board end gets its own clip. Mix boards from several bundles for even color.', ok: 'Side gaps are even along the whole board and end gaps match the chart.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.44, 0], hi: ['boards'], show: ['boards'], tool: { id: 'hammer', at: [1.12, 0.47, 0.0], rot: [0, 0, 0], anim: 'tap' } } },
        { t: 'Last board', d: 'Rip the last board to fit against the border, pre-drill and face-screw it, and cap the screws with color-matched plugs.', why: 'The last board has no room for a clip, so face screws hide under plugs.', tip: 'Rip with a fine-tooth blade and turn the cut edge toward the border, where it won’t show.', ok: 'The last board sits flat with an even gap at the border and every plug is flush.', v: { cam: [1.6, 1.1, -1.6], at: [0, 0.44, -0.6], hi: ['lastBoard'], show: ['lastBoard'], tool: { id: 'drill', at: [0.8, 0.444, -0.735], rot: [0, 0, 0], anim: 'spin' } } },
        { t: 'Fascia', d: 'Screw composite fascia over the rim joists with its own pre-drilled screws, in two rows as the instructions space them, leaving a gap at miters and joints.', why: 'Fascia hides the treated framing and finishes the edge.', tip: 'Fascia moves with temperature just like the boards; leave the same end gaps at joints so the miters don’t open or buckle.', ok: 'Fascia runs straight and flat, and joints have even small gaps.', v: { cam: [2.4, 1.0, 2.6], at: [0, 0.3, 0], hi: ['fascia'], show: ['fascia'] } },
      ],
      learn: {
        how: 'Composite boards are wood fiber and plastic. They don’t rot or splinter, but they grow and shrink along their length more than wood, which is why end gaps depend on the day’s temperature. Hidden clips sit in a groove in each board edge, hold two boards at once and set the gap between them.',
        specs: [['Joist spacing', '16″ o.c. (12″ diagonal and stairs; check brand)'], ['Side gap', '≈ 3/16″ (set by the clip)'], ['End gap', '⅛″ above 40 °F, 3/16″ below'], ['Gap at a house wall or post', '¼″ above 40 °F, ½″ below'], ['Overhang past rim', 'Small; check the brand’s limit']],
        terms: [['Grooved board', 'Board with slots in its edges for clips.'], ['Picture frame', 'Border boards around the deck edge.'], ['Starter clip', 'Clip that holds the first board’s hidden edge.'], ['Joist tape', 'Butyl strip that waterproofs joist tops.']],
        mistakes: ['Mixing fastener brands and voiding the warranty.', 'Tight end joints that buckle in summer.', 'Cutting with a coarse framing blade (chipped edges).', 'Butt joints landing on a single joist.'],
        tips: ['Rack boards from several bundles to blend color.', 'Keep boards flat and shaded before installing.'],
      },
      pro: 'The frame needs new joists or footings, or the deck is attached high on the house.',
      tricks: [['Blend the color', 'Lay out boards from three or four bundles before fastening; color varies by batch.'], ['Fine blade, clean cuts', 'A 60–80 tooth blade cuts composite without chipping; cut with the top face up on a miter saw.'], ['Shade before install', 'Boards left in the sun grow; installing hot boards with cold-weather gaps makes buckles later.'], ['Clip spacer trick', 'A spare clip makes a perfect gauge to check the side gap down the length of a board.'], ['Plan butt joints', 'Stagger joints at least two joists apart and land each on a double joist or block.'], ['Hide the fasteners at stairs', 'Most brands want face screws on stair treads; buy plugs or color-matched screws for them.']],
      refs: [['Trex decking installation guide (Trex)', 'https://www.trex.com/content/dam/trex/literature/product-installation/2022-trex-decking-installation-guide.pdf'], ['Trex hidden fasteners instructions (Trex)', 'https://documents.trex.com/is/content/Trex/trex-hideaway-universal-fasteners-aluminum-framing-install-instructionspdf.pdf'], ['7 things to know before installing Trex decking (Advantage Lumber)', 'https://blog.advantagelumber.com/2026/04/23/7-things-to-know-before-installing-trex-decking/'], ['Hidden fasteners for grooved decking (FastenMaster)', 'https://www.fastenmaster.com/blog/the-best-hidden-fastener-for-grooved-decking-with-installation-video']],
    },
  ]);
})();

/* ---------------- Fence: pickets/boards, wood gate, panel swap ---------------- */
(function () {
  const XM = TB.XM;
  const aged = (K, c) => K.bumpy(c || 0x9c8a72, K.tex.woodBump(), 0.008, { roughness: 0.95 });
  const fresh = (K, c) => K.pbr('wood_planks', [0.25, 1], { color: c || 0xe0b88a }, 'woodLight');
  const pickTop = (w, h, privacy) =>
    privacy
      ? [[-w / 2, 0], [w / 2, 0], [w / 2, h - 0.03], [w / 2 - 0.03, h], [-w / 2 + 0.03, h], [-w / 2, h - 0.03]]
      : [[-w / 2, 0], [w / 2, 0], [w / 2, h - 0.05], [0, h], [-w / 2, h - 0.05]];
  // Two-bay fence: posts at x = -2.44, 0, 2.44; rails on the front of the posts; boards on the rails (face at z = 0.0825).
  const PF = (privacy) => ({
    H: privacy ? 1.83 : 1.07,
    W: privacy ? 0.14 : 0.089,
    gap: privacy ? 0.004 : 0.06,
    rails: privacy ? [0.25, 0.95, 1.6] : [0.22, 0.85],
    bk: 1, // broken board index in bay 2
  });
  const fenceRun = (privacy) => (K) => {
    const F = PF(privacy);
    const post = aged(K, 0x8c7a62);
    const posts = K.part('posts', [0, 0, 0], null, '4×4 posts, 8 ft apart');
    [-2.44, 0, 2.44].forEach((x) => {
      K.box(posts, [0.089, F.H + 0.1, 0.089], post, [x, (F.H + 0.1) / 2, 0], null, 0.004);
      K.cyl(posts, [0.14, 0.15, 0.04, 20], 'concrete', [x, 0.0, 0]);
    });
    const rails = K.part('rails', [0, 0, 0], null, '2×4 rails');
    F.rails.forEach((y) => K.box(rails, [4.97, 0.089, 0.038], aged(K, 0x8f7c63), [0, y, 0.0635], null, 0.004));
    const boards = K.part('boards', [0, 0, 0], null, privacy ? 'Dog-ear privacy boards' : 'Gothic-point pickets');
    const bm = aged(K);
    const pitch = F.W + F.gap;
    const xs = [];
    for (let x = -2.44 + pitch / 2; x < 2.44; x += pitch) xs.push(+x.toFixed(3));
    const bi = xs.findIndex((x) => x > 0.6) + F.bk;
    const bx = xs[bi];
    xs.forEach((x, i) => {
      if (i === bi) return;
      K.ext(boards, pickTop(F.W, F.H - 0.08, privacy), 0.016, bm, [x, 0.06, 0.0825], null, 0.002);
      F.rails.forEach((y) => [-1, 1].forEach((s) => K.cyl(boards, [0.003, 0.003, 0.002, 8], 'dark', [x + s * F.W * 0.25, y + 0.02 * s, 0.0995], [90, 0, 0])));
    });
    // broken board: split, bottom kicked out, top half hanging from one nail
    const br = K.part('broken', [bx, 0.06, 0.0825], null, privacy ? 'Cracked, rotted board' : 'Broken picket');
    const brM = aged(K, 0x7d6b55);
    const split = F.rails[1] - 0.06 + 0.05;
    K.ext(br, [[-F.W / 2, split], [F.W / 2, split - 0.04], ...pickTop(F.W, F.H - 0.08, privacy).slice(2)], 0.016, brM, [0, 0, 0], null, 0.002);
    const low = K.group(br, [0, split, 0], [-14, 0, 6]);
    K.ext(low, [[-F.W / 2, -split], [F.W / 2, -split], [F.W / 2, -0.04], [-F.W / 2, 0]], 0.016, brM, [0, 0, 0.0], null, 0.002);
    K.box(br, [0.004, 0.25, 0.017], 'black', [F.W * 0.1, split + 0.15, 0.008], [0, 0, 4], 0);
    const on = K.part('oldNails', [bx, 0, 0.0825], null, 'Old nails left in the rails');
    F.rails.forEach((y) => [-1, 1].forEach((s) => K.cyl(on, [0.0015, 0.0015, 0.03, 6], K.std(0x7a6a58, { metalness: 0.5 }), [s * F.W * 0.25, y + 0.02 * s, 0.012], [100, 0, 0])));
    const np = K.part('newPicket', [bx, 0.06, 0.0825], null, privacy ? 'New 1×6 board, cut to match' : 'New picket, cut to match');
    K.ext(np, pickTop(F.W, F.H - 0.08, privacy), 0.016, fresh(K), [0, 0, 0], null, 0.002);
    const nn = K.part('nails', [bx, 0, 0.0995], null, '2″ galvanized ring-shank nails or deck screws');
    F.rails.forEach((y) => [-1, 1].forEach((s) => K.cyl(nn, [0.0035, 0.0035, 0.002, 10], 'steel', [s * F.W * 0.25, y + 0.02 * s, 0.001], [90, 0, 0])));
    const sb = K.part('spacer', [bx + F.W / 2 + 0.03, 0.04, 0.12], null, 'Scrap block (sets the bottom gap)');
    K.box(sb, [0.04, 0.08, 0.06], fresh(K, 0xc79a66), [0, 0, 0], null, 0.004);
    K.box(null, [6, 0.02, 0.3], 'dirt', [0, -0.005, 0.15], null, 0);
  };
  TB.model('xPicketFence', XM.view({ cam: [1.5, 1.1, 2.1], at: [0.75, 0.55, 0], hidden: ['newPicket', 'nails', 'oldNails', 'spacer'] }), fenceRun(false));
  TB.model('xPrivacyFence', XM.view({ cam: [1.8, 1.6, 2.6], at: [0.75, 0.9, 0], hidden: ['newPicket', 'nails', 'oldNails', 'spacer'] }), fenceRun(true));
  const pkBx = (privacy) => {
    const F = PF(privacy);
    const pitch = F.W + F.gap;
    const xs = [];
    for (let x = -2.44 + pitch / 2; x < 2.44; x += pitch) xs.push(+x.toFixed(3));
    return { F, x: xs[xs.findIndex((x) => x > 0.6) + F.bk] };
  };
  const picketSteps = (privacy) => {
    const { F, x } = pkBx(privacy);
    const mid = F.H / 2;
    const cam = privacy ? [x + 0.9, 1.4, 1.9] : [x + 0.7, 0.95, 1.5];
    const close = privacy ? [x + 0.45, 1.1, 0.9] : [x + 0.4, 0.75, 0.75];
    return [
      { t: 'Check what’s broken', d: 'Look at the broken ' + (privacy ? 'board' : 'picket') + ' and its neighbors. Push on the rails (the horizontal 2×4s the boards hang on) and the posts to make sure they’re solid.', why: 'A new board on a rotten rail or wobbly post won’t last. Fix those first.', tip: 'Poke the rail with a screwdriver where the board is nailed. If it sinks in more than ¼″, screw a new 2×4 alongside the old rail before hanging the board.', ok: 'Rails and posts are firm, and only the board itself is damaged.', v: { cam, at: [x, mid, 0], hi: ['broken'] } },
      { t: 'Measure a good one', d: 'Measure the length, width and thickness of a neighbor, plus the gap under it and the gap beside it.', why: privacy ? 'Privacy boards are usually 1×6 dog-ears (clipped top corners), 6 ft long, butted tight.' : 'Pickets are usually 1×4 with a 2–2½″ gap; match yours exactly.', tip: 'Lumber names aren’t real sizes: a 1×4 is ¾×3½″ and a 1×6 is ¾×5½″. Buy by the name and check with your tape.', ok: 'You’ve written down length, width, thickness and both gaps.', v: { cam: close, at: [x + 0.2, mid, 0.08], hi: ['boards'], tool: { id: 'tape', at: [x + pkW(F), 0.06, 0.1], rot: [0, 0, 0] } } },
      { t: 'Pry off the broken one', d: 'Tap a flat bar behind the board next to each nail and lever it off the rail, working rail by rail.', why: 'Prying at the nails, not the middle, pulls them out instead of snapping the board.', tip: 'Slip a scrap block under the bar so it doesn’t dent the next board. In a tight privacy fence, knock the board off from the rail side with a hammer and block instead.', ok: 'The broken board is off and its neighbors aren’t dented or split.', v: { cam: close, at: [x, F.rails[0] + 0.1, 0.08], hi: ['broken'], mv: { broken: [0, 0, 0.18] }, tool: { id: 'flatBar', at: [x, F.rails[0] + 0.02, 0.09], rot: [-60, 0, 0] } } },
      { t: 'Clear the old nails', d: 'Pull the nails left in the rails, or cut them flush with a hacksaw blade.', why: 'New fasteners need a flat rail face and fresh wood to bite into.', tip: 'If a nail head snaps off, drive the stub flush with a nail set (a small punch), then place your new fasteners ½″ to the side.', ok: 'The rail face is flat, with no nail tips sticking out.', v: { cam: close, at: [x, F.rails[0] + 0.05, 0.08], hi: ['oldNails', 'rails'], hide: ['broken'], show: ['oldNails'], mv: { newPicket: [0.5, 0, 0.5] }, tool: { id: 'hammer', at: [x + 0.03, F.rails[0] + 0.02, 0.11], rot: [0, 0, 0] } } },
      { t: 'Cut the new one to match', d: 'Lay the old one (or a neighbor) on the new board as a pattern, trace it, and cut the new ' + (privacy ? 'board to length with matching dog-ear corners.' : 'picket to length, including the point.'), why: 'Matching the top line matters most; that’s what your eye follows down the fence.', tip: 'Clamp the pattern on top and cut along it. Brush sealer on the fresh cuts before installing; the bottom end grain is where rot starts.', ok: 'Laid on the old board, the new one matches its length and top shape.', v: { cam, at: [x, mid, 0.2], hi: ['newPicket'], hide: ['oldNails'], show: ['newPicket'] } },
      { t: 'Set it in place', d: 'Stand it on a scrap block so the bottom gap matches the others, and line the top up with its neighbors' + (privacy ? ', butting the edges tight.' : ', centered in the gap.'), why: 'A 2″ gap at the bottom keeps the end grain out of wet soil and grass.', tip: 'Clamp a straight board across the tops of the neighbors on both sides; set the new board to just touch it and the top line will be perfect.', ok: 'The top lines up with the neighbors and the bottom gap matches theirs.', v: { cam: close, at: [x, mid * 0.6, 0.08], hi: ['newPicket', 'spacer'], show: ['spacer'], mv: { newPicket: [0, 0, 0] }, tool: { id: 'level', at: [x, F.H - 0.1, 0.1], rot: [0, 0, 90], scale: 2 } } },
      { t: 'Fasten it', d: 'Drive two hot-dipped galvanized ring-shank nails (2–2½″) or coated deck screws into each rail, staggered and ¾″ from the edges.', why: 'Galvanized or coated fasteners won’t rust-streak; ring shanks don’t back out.', tip: 'Pre-drill near the board ends with a ⅛″ bit to stop splits. On cedar or redwood, stainless fasteners avoid black streaks.', ok: 'The board doesn’t move when you tug it, and heads sit flush without crushing the wood.', v: { cam: close, at: [x, F.rails[1], 0.08], hi: ['nails'], show: ['nails'], tool: { id: 'drill', at: [x + F.W * 0.25, F.rails[1] + 0.02, 0.1], rot: [90, 0, 0], anim: 'spin' } } },
      { t: 'Seal it to blend in', d: 'Remove the block. Brush stain or sealer on all faces, especially the end grain, once the wood is dry.', why: 'New wood is bright for a season; a matching stain or a gray weathering stain blends it in now.', tip: 'Test dryness by sprinkling water on the board: if it soaks in within a minute or so, it’s ready to stain. If it beads, wait a few weeks.', ok: 'All faces and both ends are coated, and the color is close to its neighbors.', v: { cam, at: [x, mid, 0], hi: ['newPicket'], hide: ['spacer'] } },
    ];
  };
  const pkW = (F) => F.W / 2 + 0.02;

  /* ===== Wood gate: single 4 ft or double 8 ft, Z-frame, hinges, latch ===== */
  const gateModel = (dbl) => (K) => {
    const post = aged(K, 0x8c7a62);
    const half = dbl ? 1.22 : 0.51; // half opening (clear), posts just outside
    const H = 1.83;
    const posts = K.part('posts', [0, 0, 0], null, dbl ? '6×6 gate posts, 8 ft opening' : '4×4 gate posts, 40″ opening');
    const pw = dbl ? 0.14 : 0.089;
    [-1, 1].forEach((s) => {
      K.box(posts, [pw, H + 0.12, pw], post, [s * (half + pw / 2), (H + 0.12) / 2, 0], null, 0.005);
      K.cyl(posts, [0.16, 0.17, 0.04, 20], 'concrete', [s * (half + pw / 2), 0, 0]);
    });
    // fence on either side
    const fence = K.part('fence', [0, 0, 0], null, 'Existing fence');
    const bm = aged(K);
    [-1, 1].forEach((s) => {
      const x0 = s * (half + pw);
      const x1 = s * (half + pw + 1.4);
      K.box(fence, [0.089, H + 0.1, 0.089], post, [x1, (H + 0.1) / 2, 0], null, 0.004);
      [0.25, 0.95, 1.6].forEach((y) => K.box(fence, [1.4, 0.089, 0.038], bm, [(x0 + x1) / 2, y, -0.0635], null, 0.004));
      for (let k = 0; k < 9; k++) K.ext(fence, pickTop(0.14, H - 0.08, true), 0.016, bm, [x0 + s * (0.07 + k * 0.144), 0.06, -0.0985], null, 0.002);
    });
    // leaves
    const parts = {};
    ['frame', 'brace', 'boards', 'hinges', 'latch', 'stop', 'shims'].forEach((n) => (parts[n] = K.part(n, [0, 0, 0], null, n)));
    K.names.frame = 'Gate frame: 2×4 rails + stiles (screwed + glued)';
    K.names.brace = 'Diagonal brace: low on the hinge side, high on the latch side';
    K.names.boards = '1×6 boards, matching the fence';
    K.names.hinges = 'Heavy T-hinges (3 per leaf)';
    K.names.latch = dbl ? 'Center latch' : 'Gravity latch';
    K.names.stop = 'Gate stop strip';
    K.names.shims = 'Shims set the ½″ hinge gap and 2″ ground gap';
    const fm = fresh(K, 0xcfa978);
    const leaves = dbl ? [[-half + 0.012, 1], [half - 0.012, -1]] : [[-half + 0.012, 1]];
    const lw = dbl ? half - 0.024 : 2 * half - 0.03;
    const gy = 0.05; // bottom gap
    const gh = H - 0.1;
    leaves.forEach(([hx, dir]) => {
      // dir = +1: leaf extends to +x from its hinge edge
      const cx = hx + (dir * lw) / 2;
      const z = -0.03;
      [gy + 0.12, gy + gh - 0.12].forEach((y) => K.box(parts.frame, [lw, 0.089, 0.038], fm, [cx, y, z], null, 0.004));
      [hx + dir * 0.0445, hx + dir * (lw - 0.0445)].forEach((x) => K.box(parts.frame, [0.089, gh - 0.24 - 0.089, 0.038], fm, [x, gy + gh / 2, z], null, 0.004));
      const a = [hx + dir * 0.09, gy + 0.17, z];
      const b = [hx + dir * (lw - 0.09), gy + gh - 0.17, z];
      XM.span(K, parts.brace, a, b, 0.089, 0.038, fm);
      const n = Math.round(lw / 0.144);
      const bw = lw / n - 0.003;
      for (let k = 0; k < n; k++) K.ext(parts.boards, pickTop(bw, gh, true), 0.016, fm, [hx + dir * (k + 0.5) * (lw / n), gy, z + 0.019], null, 0.002);
      const hm = K.std(0x1e2023, { metalness: 0.6, roughness: 0.5 });
      [gy + 0.12, gy + gh / 2, gy + gh - 0.12].forEach((y) => {
        K.box(parts.hinges, [0.3, 0.035, 0.004], hm, [hx + dir * 0.15, y, z + 0.037], null, 0);
        K.box(parts.hinges, [0.035, 0.12, 0.004], hm, [hx - dir * 0.03, y, z + 0.037], null, 0);
        K.cyl(parts.hinges, [0.008, 0.008, 0.12, 10], hm, [hx - dir * 0.006, y, z + 0.04]);
        K.rep(3, (i) => K.cyl(parts.hinges, [0.005, 0.005, 0.003, 8], 'steel', [hx + dir * (0.06 + i * 0.09), y, z + 0.04], [90, 0, 0]));
      });
      K.box(parts.shims, [0.06, gy, 0.08], fresh(K, 0xd8b98d), [hx + dir * lw * 0.4, gy / 2, z], null, 0.004);
      K.box(parts.shims, [0.012, 0.25, 0.06], fresh(K, 0xd8b98d), [hx - dir * 0.006, gy + gh * 0.55, z], null, 0.002);
    });
    const lm = K.std(0x1e2023, { metalness: 0.6, roughness: 0.5 });
    if (dbl) {
      K.box(parts.latch, [0.2, 0.025, 0.012], lm, [0.02, 1.1, 0.03], null, 0.003);
      K.box(parts.latch, [0.05, 0.06, 0.02], lm, [-0.08, 1.1, 0.03], null, 0.004);
      const dr = K.part('dropRod', [0, 0, 0], null, 'Drop rod (cane bolt) into a ground sleeve');
      K.cyl(dr, [0.008, 0.008, 0.5, 10], lm, [0.08, 0.27, 0.03]);
      K.box(dr, [0.03, 0.04, 0.02], lm, [0.08, 0.35, 0.025], null, 0.003);
      K.box(dr, [0.03, 0.04, 0.02], lm, [0.08, 0.15, 0.025], null, 0.003);
      K.cyl(dr, [0.02, 0.02, 0.02, 14], 'dark', [0.08, 0.0, 0.03]);
      K.box(parts.stop, [0.03, gh - 0.2, 0.02], fm, [0, gy + gh / 2, -0.06], null, 0.003);
    } else {
      const lx = half - 0.02;
      K.box(parts.latch, [0.16, 0.022, 0.01], lm, [lx - 0.06, 1.1, 0.025], [0, 0, -3], 0.003);
      K.box(parts.latch, [0.05, 0.08, 0.03], lm, [lx + 0.07, 1.1, 0.06], null, 0.005);
      K.box(parts.stop, [0.02, gh - 0.1, 0.038], fm, [half + 0.005, gy + gh / 2, -0.07], null, 0.003);
    }
    K.box(null, [7, 0.02, 1.2], 'dirt', [0, -0.008, 0], null, 0);
  };
  const GH = ['frame', 'brace', 'boards', 'hinges', 'latch', 'stop', 'shims'];
  TB.model('xGateSingle', XM.view({ cam: [2.2, 1.8, 3.8], at: [0, 0.9, 0], hidden: GH }), gateModel(false));
  TB.model('xGateDouble', XM.view({ cam: [1.8, 1.8, 4.0], at: [0, 0.9, 0], hidden: GH.concat(['dropRod']) }), gateModel(true));
  const gateSteps = (dbl) => {
    const h = dbl ? 1.22 : 0.51;
    const far = dbl ? [1.8, 1.8, 4.0] : [1.4, 1.6, 2.8];
    const s = [
      { t: 'Check the posts and opening', d: 'Make sure both posts are plumb (straight up and down) and solid. Measure the opening at the top, middle and bottom.', why: 'A gate can’t be better than its hinge post. Use the smallest measurement.', tip: 'Hold a 4 ft level on two side-by-side faces of the hinge post. If it leans or rocks, fix the post before building the gate.', ok: 'The bubble is centered on two adjacent faces of each post and you have your smallest opening measurement.', v: { cam: far, at: [0, 0.9, 0], hi: ['posts'], tool: { id: 'tape', at: [-h, 1.0, 0.06], rot: [0, 0, -90], scale: 1.4 } } },
      { t: 'Size the gate', d: 'Gate width = opening minus ½″ for the hinge side and ¼–½″ for the latch side' + (dbl ? ', split into two equal leaves with ½″ between them.' : '.') + ' Plan a 2″ gap at the ground.', why: 'Wood swells in wet weather; without gaps the gate binds.', tip: 'Check the hinge and latch instructions; some need a specific gap. Write the final width on the post in pencil so you don’t mix up numbers.', ok: 'You have one written finished width and height.', v: { cam: far, at: [0, 0.9, 0], hi: ['posts'], tool: { id: 'level', at: [dbl ? -1.29 : -0.555, 1.0, 0.06], rot: [0, 0, 90], scale: 2.5 } } },
      { t: 'Build the frame', d: 'Lay two 2×4 rails and two stiles (the vertical sides) on a flat surface. Glue and screw the corners with 2½″ exterior screws, then check square by measuring both diagonals.', why: 'Equal diagonals mean the frame is square, so the boards will be too.', tip: 'If the diagonals differ, push the longer corner in until they match before the glue sets. Pre-drill near the ends so the 2×4s don’t split.', ok: 'The two diagonal measurements match within ⅛″.', v: { cam: far, at: [0, 0.9, 0], hi: ['frame'], show: ['frame'], tool: { id: 'drill', at: [dbl ? -1.1 : -0.42, 0.2, 0.0], rot: [90, 0, 0], anim: 'spin' } } },
      { t: 'Fit the diagonal brace', d: 'Lay a 2×4 across the frame from the bottom corner on the hinge side to the top corner on the latch side, trace the inside corners onto it, cut on the lines and screw it in.', why: 'This brace is squeezed: the gate’s weight pushes down it into the bottom hinge. Running the other way, it does nothing.', tip: 'Tracing in place gives a tight fit with no angle math. Write HINGE on the hinge stile first so you can’t flip the brace.', ok: 'The brace runs from lower hinge corner to upper latch corner with no gaps at its ends.', v: { cam: far, at: [0, 0.9, 0], hi: ['brace'], show: ['brace'] } },
      { t: 'Attach the boards', d: 'Screw matching fence boards to the frame with two 1¼″ exterior screws per rail, flush at the edges, tops lined up.', why: 'Matching boards make the gate disappear into the fence line.', tip: 'Use a spacer to match the fence’s board gaps, and screw boards into the brace too for extra stiffness.', ok: 'Boards are flush with the frame edges and the tops form a straight line.', v: { cam: far, at: [0, 0.9, 0], hi: ['boards'], show: ['boards'], tool: { id: 'drill', at: [dbl ? -0.6 : 0, 1.62, 0.01], rot: [90, 0, 0], anim: 'spin' } } },
      { t: 'Mount the hinges', d: 'Screw three heavy T-hinges or strap hinges to the gate frame (top, middle, bottom) with the long leaves on the rails.', why: 'Hinge screws must hit the frame, not just the boards.', tip: 'Use the longest exterior screws that won’t poke through, or carriage bolts through the rail for a heavy gate.', ok: 'Each hinge leaf lies flat on a rail with every hole filled.', v: { cam: [dbl ? -0.8 : -0.1, 1.3, 1.4], at: [-h, 0.9, 0], hi: ['hinges'], show: ['hinges'] } },
      { t: 'Hang it on shims', d: 'Set the gate on 2″ blocks, shim the hinge gap, check it’s level, then screw the hinges to the post with long exterior screws.', why: 'Blocks and shims hold the exact gaps while you fasten, so the gate swings free.', tip: 'Drive one screw per hinge first and test the swing; then fill the rest. If it rubs, back out and adjust while it’s easy.', ok: 'The gate swings freely, the top is level, and the gaps are even top to bottom.', v: { cam: [dbl ? -0.8 : -0.1, 1.2, 1.6], at: [-h, 0.7, 0], hi: ['shims', 'hinges'], show: ['shims'], tool: { id: 'drill', at: [-h - 0.03, 0.17, 0.03], rot: [90, 0, 0], anim: 'spin' } } },
      { t: 'Add the latch and stop', d: 'Remove the shims. Mount the latch at a comfortable height and screw a stop strip to the ' + (dbl ? 'back of one leaf' : 'latch post') + ' so the gate can’t swing past closed.', why: 'The stop takes the slamming force off the hinges and latch.', tip: 'Set a gravity latch so the bar drops fully into the catch, then let the gate swing shut from halfway open to test it.', ok: 'The gate latches with a click every time and rests against the stop, not on the hinges.', v: { cam: dbl ? [0.6, 1.3, 1.4] : [0.9, 1.3, 1.3], at: [dbl ? 0 : h, 1.0, 0], hi: ['latch', 'stop'], show: ['latch', 'stop'], hide: ['shims'] } },
    ];
    if (dbl)
      s.push({ t: 'Install the drop rod', d: 'Mount a cane bolt (a sliding rod) on the inactive leaf and drill a hole, or set a short pipe sleeve, in the ground or concrete where the rod drops.', why: 'The inactive leaf needs its own anchor so the latch has something to close against.', tip: 'Hang and latch both leaves first, then drop the rod to mark the sleeve spot. Add a second sleeve to hold the leaf when open.', ok: 'The rod drops into the sleeve smoothly and the leaf can’t move when you push it.', v: { cam: [0.6, 0.7, 1.4], at: [0.08, 0.3, 0], hi: ['dropRod'], show: ['dropRod'] } });
    return s;
  };

  /* ===== Fence panel swap (prefab 6×8 panel in brackets), seen from the rail side ===== */
  TB.model(
    'xFencePanel',
    XM.view({ cam: [1.6, 1.6, -3.0], at: [0, 0.9, 0], hidden: ['newPanel', 'newBrackets', 'screws', 'blocks'] }),
    (K) => {
      const post = aged(K, 0x8c7a62);
      const posts = K.part('posts', [0, 0, 0], null, '4×4 posts (solid, set in concrete)');
      [-1.27, 1.27].forEach((x) => {
        K.box(posts, [0.089, 1.95, 0.089], post, [x, 0.975, 0], null, 0.004);
        K.cyl(posts, [0.14, 0.15, 0.04, 20], 'concrete', [x, 0, 0]);
      });
      const nb = K.part('neighbors', [0, 0, 0], null, 'Neighboring panels');
      const bm = aged(K);
      [-1, 1].forEach((s) => {
        [0.3, 1.5].forEach((y) => K.box(nb, [1.0, 0.089, 0.038], bm, [s * 1.82, y, -0.02], null, 0.004));
        for (let k = 0; k < 7; k++) K.ext(nb, pickTop(0.14, 1.75, true), 0.016, bm, [s * (1.34 + k * 0.142), 0.06, 0.0], null, 0.002);
      });
      const panel = (name, label, mat, broken) => {
        const p = K.part(name, [0, 0, 0], null, label);
        [0.3, 1.5].forEach((y, i) => {
          const g = K.group(p, [0, y, -0.02], broken && i === 0 ? [0, 0, -3] : null);
          K.box(g, [2.42, 0.089, 0.038], mat, [0, 0, 0], null, 0.004);
        });
        for (let k = 0; k < 17; k++) {
          const x = -1.21 + 0.071 + k * 0.142;
          const tilt = broken && (k === 6 || k === 7 || k === 8) ? [k === 7 ? 9 : 4, 0, k === 8 ? -3 : 2] : null;
          const g = K.group(p, [x, 0.06, 0.0], tilt);
          K.ext(g, broken && k === 7 ? [[-0.07, 0], [0.07, 0], [0.07, 0.9], [-0.02, 0.98], [-0.07, 0.86]] : pickTop(0.14, 1.75, true), 0.016, broken && k > 5 && k < 9 ? aged(K, 0x76654f) : mat, [0, 0, 0], null, 0.002);
        }
        return p;
      };
      panel('oldPanel', 'Storm-damaged panel', bm, true);
      panel('newPanel', 'New 6×8 ft panel', fresh(K, 0xd7b07f), false);
      const galv = K.std(0xb4bbc1, { metalness: 0.85, roughness: 0.4 });
      const rust = K.std(0x7b5236, { metalness: 0.4, roughness: 0.8 });
      const brk = (name, label, mat) => {
        const p = K.part(name, [0, 0, 0], null, label);
        [-1, 1].forEach((s) =>
          [0.3, 1.5].forEach((y) => {
            const x = s * 1.2;
            K.box(p, [0.002, 0.1, 0.05], mat, [x - s * 0.0, y, -0.02 - 0.021], null, 0);
            K.box(p, [0.002, 0.1, 0.05], mat, [x, y, -0.02 + 0.021], null, 0);
            K.box(p, [0.05, 0.1, 0.002], mat, [s * 1.22, y, -0.065], null, 0);
          })
        );
        return p;
      };
      brk('oldBrackets', 'Old rusted rail brackets', rust);
      brk('newBrackets', 'New galvanized U-brackets', galv);
      const sc = K.part('screws', [0, 0, 0], null, 'Exterior screws through the brackets');
      [-1, 1].forEach((s) => [0.3, 1.5].forEach((y) => [-0.025, 0.025].forEach((dy) => K.cyl(sc, [0.004, 0.004, 0.003, 8], 'steel', [s * 1.2, y + dy, -0.0425], [90, 0, 0]))));
      const bl = K.part('blocks', [0, 0, 0], null, 'Scrap blocks (2″ ground gap)');
      [-0.7, 0.7].forEach((x) => K.box(bl, [0.1, 0.06, 0.09], fresh(K, 0xc9a06c), [x, 0.03, -0.01], null, 0.004));
      K.box(null, [6, 0.02, 2], 'dirt', [0, -0.008, 0], null, 0);
    }
  );

  /* ---------------- Fence guides ---------------- */
  const pk = pkBx(false);
  TB.more('fence', [
    {
      id: 'fence-picket',
      title: 'Replace a broken picket or fence board',
      model: 'xPicketFence',
      level: 1,
      time: '20–45 min',
      cost: '$5–20',
      summary: 'A kicked-in picket or a rotted privacy board is a 30-minute fix: pry it off, cut a new one to match, and fasten it with galvanized nails or coated screws.',
      intro: { hi: ['broken'] },
      safety: ['Wear gloves and eye protection when prying; old nails snap and fly.', 'Check behind boards for wasp nests in summer.', 'Call 811 before digging if you end up resetting a post.'],
      causes: [['Impact', 'Mowers, balls, dogs and kids.'], ['Rot at the bottom', 'Board ends touching soil or mulch stay wet.'], ['Rusted nails', 'Plain steel nails rust away and the board drops.']],
      tools: ['Flat pry bar', 'Hammer or drill/driver', 'Tape measure', 'Handsaw or circular saw', 'Replacement picket or 1×6 board', '2–2½″ hot-dipped galvanized ring-shank nails or coated deck screws', 'Scrap block', 'Clamps', 'Stain or sealer + brush'],
      variants: [
        { id: 'picket', name: 'Picket fence', blurb: 'Spaced 1×4 pickets with pointed tops, about 3½ ft tall.' },
        { id: 'privacy', name: 'Privacy fence board', blurb: '6 ft dog-ear 1×6 boards butted edge to edge.', model: 'xPrivacyFence', steps: picketSteps(true) },
      ],
      steps: picketSteps(false),
      learn: {
        how: 'A wood fence is a frame of posts and rails with boards nailed to the face. Each board only hangs from the rails, so replacing one doesn’t disturb anything else. Fences rot from the ground up, which is why boards stop a couple of inches above the ground.',
        specs: [['Picket', '1×4 (¾×3½″), gap 2–2½″'], ['Privacy board', '1×6 dog-ear (¾×5½″), 6 ft'], ['Ground gap', '≈ 2″'], ['Fasteners', '2 per rail, hot-dipped galvanized, stainless or coated']],
        terms: [['Rail', 'Horizontal 2×4 the boards attach to.'], ['Dog-ear', 'Board with clipped top corners.'], ['Ring-shank nail', 'Nail with ridges that resist pulling out.'], ['Nail set', 'Small punch for driving a nail head below the surface.']],
        mistakes: ['Using bright steel nails (black streaks on cedar).', 'Letting the new board touch the soil.', 'Not matching the top line.'],
        tips: ['Buy one extra board and let it weather outside a few weeks before installing.', 'Cedar fences: use stainless or coated fasteners.'],
      },
      pro: 'Several bays are rotting, rails are broken, or the fence is on a disputed property line.',
      tricks: [['Straightedge for the top', 'Clamp a straight board across the neighbors’ tops; the new board touching it guarantees a straight line.'], ['Weather the new board', 'Leave the new board in the sun for a few weeks, or use a gray weathering stain, so it doesn’t glow.'], ['Shim rail with a scab', 'Cracked rail? Screw a treated 2×4 alongside it from post to post rather than replacing the whole rail.'], ['Pre-drill the ends', 'A ⅛″ pilot hole near the ends stops splits, especially in dry cedar.'], ['Keep mulch back', 'Rake mulch and soil 2″ away from the boards so they can dry out.'], ['Buy fasteners once', 'A small box of stainless or hot-dipped nails lasts years of fence repairs and never streaks.']],
      refs: [['How to replace fence panels or pickets (The Handyman’s Daughter)', 'https://www.thehandymansdaughter.com/how-to-replace-fence-panels-or-pickets/'], ['Wooden fence picket replacement (iFixit)', 'https://www.ifixit.com/Guide/Wooden+Fence+Picket+Replacement/141377'], ['Basic wood fence repair tips (Ergeon)', 'https://www.ergeon.com/blog/post/basic-wood-fence-repair-tips'], ['DIY wood fence repairs (76 Fence)', 'https://76fence.com/blog/diy-wood-fence-repairs']],
    },
    {
      id: 'build-gate',
      title: 'Build a wood fence gate',
      model: 'xGateSingle',
      kind: 'build',
      level: 2,
      time: '3–5 hrs',
      cost: '$80–250',
      summary: 'A Z-braced 2×4 frame skinned with fence boards, hung on heavy hinges with a gravity latch. Get the brace direction right and it won’t sag.',
      intro: { show: GH.filter((n) => n !== 'shims'), preview: true, spin: true },
      safety: ['Wear eye protection when cutting and driving screws.', 'Gates are heavy; get help hanging anything over 4 ft wide.', 'Call 811 before digging if you need to set new posts.'],
      causes: [['Check the posts', 'The hinge post must be plumb and solid, ideally set in concrete.'], ['Pick the width', 'Walk gates 36–48″; drive gates need a double gate.'], ['Choose hardware', 'Heavy T- or strap hinges, a gravity latch, and a drop rod for double gates.']],
      tools: ['Drill/driver', 'Circular saw + speed square', 'Tape measure, 4 ft level', 'Clamps', 'Pressure-treated 2×4s', 'Fence boards to match', '2½″ and 1¼″ exterior screws', 'Heavy T- or strap hinges (3) + gravity latch', 'Exterior wood glue', 'Shims + 2″ blocks'],
      variants: [
        { id: 'single', name: 'Single walk gate', blurb: 'One 3–4 ft leaf with a gravity latch.' },
        { id: 'double', name: 'Double drive gate', blurb: 'Two leaves across an 8 ft opening, center latch and drop rod.', model: 'xGateDouble', level: 3, time: '1 day', cost: '$200–500', intro: { show: GH.filter((n) => n !== 'shims').concat(['dropRod']), preview: true, spin: true }, steps: gateSteps(true) },
      ],
      steps: gateSteps(false),
      learn: {
        how: 'A rectangle of wood folds into a slanted parallelogram under its own weight. A diagonal brace stops that, but wood is far stronger when squeezed than when pulling on screws, so the brace must run from the bottom hinge corner up to the top latch corner. Then the latch side pushes down on the brace, which pushes into the bottom hinge.',
        specs: [['Hinge-side gap', '½″'], ['Latch-side gap', '¼–½″'], ['Ground gap', '≈ 2″'], ['Max single leaf', '≈ 4 ft; wider needs a double gate'], ['Hinges', '3 per leaf over 5 ft tall'], ['Square check', 'Diagonals within ⅛″']],
        terms: [['Z-brace', 'Two rails plus one diagonal.'], ['Stile', 'Vertical frame member.'], ['Gate stop', 'Strip the gate closes against.'], ['Cane bolt / drop rod', 'Rod that pins a gate leaf to the ground.'], ['Plumb', 'Exactly vertical.']],
        mistakes: ['Brace running the wrong way.', 'Hinge screws only into the boards.', 'No room for swelling.'],
        tips: ['Add an anti-sag cable kit opposite the brace if the gate is wide.', 'Hang the gate before staining so you can plane any tight spots.'],
      },
      pro: 'The posts need resetting or the opening is over 12 ft (consider a steel frame or a rolling gate).',
      tricks: [['Write HINGE on it', 'Label the hinge stile before building so the brace can’t end up backwards.'], ['Build on a flat floor', 'A garage floor or sheet of plywood keeps the frame from twisting while glue sets.'], ['Anti-sag kit', 'A cable and turnbuckle from the top hinge corner to the bottom latch corner pulls a sagging gate back up in minutes.'], ['Screw one, test, fill', 'Drive one screw per hinge, test the swing, then fill the rest so adjustments are easy.'], ['Spring closer for kids and pets', 'A gate spring or hydraulic closer makes the gate latch itself; pool codes require self-closing gates.'], ['Seal the bottom', 'Brush sealer on the bottom end grain of every board before hanging; it’s the first place a gate rots.']],
      refs: [['How to properly position a fence gate brace (MiterAngle)', 'https://miterangle.com/how-to-properly-position-a-fence-gate-brace/'], ['Build a wood gate (Mother Earth News)', 'https://www.motherearthnews.com/diy/build-a-wood-gate-zmaz93jjztak/'], ['Which way should the bracing go on a wooden gate (The Natural Workshop)', 'https://www.thenaturalworkshop.co.uk/post/which-way-should-the-bracing-go-on-a-wooden-gate']],
    },
    {
      id: 'fence-panel',
      title: 'Replace a fence panel',
      model: 'xFencePanel',
      level: 2,
      time: '1–2 hrs',
      cost: '$80–200',
      summary: 'A storm-broken prefab panel lifts out of its rail brackets between two good posts. Measure, hang new brackets level, slide in the new panel and screw it off.',
      intro: { hi: ['oldPanel'] },
      safety: ['Panels catch wind and are awkward; work with a helper on a calm day.', 'Wear gloves and eye protection; old brackets and screws are rusty and sharp.', 'Call 811 before digging if a post needs resetting.'],
      causes: [['Wind', 'A solid 6×8 panel catches a lot of wind.'], ['Rusted brackets', 'Plain-steel hardware rots in treated wood.'], ['Fallen limb', 'Usually breaks boards but leaves posts fine.']],
      tools: ['Drill/driver', 'Tape measure, level, string + line level', 'Reciprocating saw + metal blade (seized fasteners)', 'New 6×8 ft panel', 'Galvanized U-brackets (4–6)', '1¼–1½″ exterior screws rated for treated lumber', 'Scrap blocks', 'Helper'],
      steps: [
        { t: 'Check the posts', d: 'Push hard on both posts. They should be solid and plumb. Measure the gap between them at the top and the bottom.', why: 'If a post moves, reset it first; a new panel won’t fix a leaning post.', tip: 'Rock each post at the top. More than about ½″ of movement usually means rot at ground level.', ok: 'Both posts are firm and plumb, and you know the opening width at top and bottom.', v: { cam: [1.6, 1.6, -3.0], at: [0, 0.9, 0], hi: ['posts'], tool: { id: 'level', at: [1.226, 1.2, -0.04], rot: [0, 0, 90], scale: 2.5 } } },
        { t: 'Remove the old screws', d: 'With a helper holding the panel, back out the bracket screws. Cut seized fasteners with a reciprocating saw and a metal-cutting blade.', why: 'Supporting the panel keeps it from twisting and splitting the post as it comes free.', tip: 'Stripped, rusty screw heads? Slide the saw blade between rail end and post and cut straight through the screws.', ok: 'Nothing holds the panel to the brackets.', v: { cam: [-0.2, 1.4, -1.3], at: [-1.2, 1.0, 0], hi: ['oldBrackets'], tool: { id: 'drill', at: [-1.2, 1.5, -0.045], rot: [-90, 0, 0], anim: 'spin' } } },
        { t: 'Lift out the panel', d: 'Lift the panel up and out of the brackets with your helper, then unscrew the old brackets from the posts.', why: 'Old brackets are usually rusted; new galvanized ones are cheap.', tip: 'Lay the old panel flat on the ground; propped up, a gust turns it into a sail.', ok: 'The opening is clear and the post faces are bare.', v: { cam: [1.6, 1.6, -3.0], at: [0, 0.9, 0], hi: ['oldPanel'], mv: { oldPanel: [0.2, 0.3, -1.0] }, hide: ['oldBrackets'] } },
        { t: 'Mount new brackets', d: 'Screw U-brackets to both posts at the rail heights, checking with a string and line level that each pair is level across the opening and matches the neighbors.', why: 'If the brackets are level, the panel top lines up with its neighbors.', tip: 'Hold the new panel up to mark the rail heights on the posts instead of measuring; panels vary.', ok: 'Each bracket pair is level and at the same height as the neighbors’ rails.', v: { cam: [-0.2, 1.4, -1.3], at: [-1.2, 0.9, 0], hi: ['newBrackets'], hide: ['oldPanel'], show: ['newBrackets'], mv: { newPanel: [0, 0.3, -1.0] }, tool: { id: 'drill', at: [-1.245, 1.5, -0.02], rot: [0, 0, -90], anim: 'spin' } } },
        { t: 'Slide the new panel in', d: 'Set blocks on the ground for a 2″ gap, then lower the panel into the brackets so it rests on the blocks.', why: 'Blocks hold it at the right height while you fasten, and keep it off the soil.', tip: 'Too wide by a bit? Trim the rail ends, not the boards. Too narrow? Screw a treated filler strip to the post.', ok: 'The panel sits fully in all four brackets and its top lines up with the neighbors.', v: { cam: [1.6, 1.6, -3.0], at: [0, 0.9, 0], hi: ['newPanel', 'blocks'], show: ['newPanel', 'blocks'], mv: { newPanel: [0, 0, 0] } } },
        { t: 'Screw through the brackets', d: 'Drive two exterior screws rated for treated lumber through each bracket into the rail ends.', why: 'Galvanized brackets and coated screws won’t corrode in treated lumber.', tip: 'Pre-drill so the rail ends don’t split, and use screws short enough not to poke through the rail.', ok: 'The panel doesn’t shift when you push and pull on it.', v: { cam: [0.0, 1.3, -1.2], at: [1.2, 0.9, 0], hi: ['screws'], show: ['screws'], tool: { id: 'drill', at: [1.2, 0.3, -0.045], rot: [-90, 0, 0], anim: 'spin' } } },
        { t: 'Pull the blocks and finish', d: 'Remove the blocks. Stain or seal the new panel to match once it’s dry.', why: 'Sealing the end grain at the bottom matters most; that’s where rot starts.', tip: 'New treated wood is often too wet to stain. Sprinkle water on it: if it soaks in, it’s ready; if it beads, wait a few weeks.', ok: 'The blocks are gone and the bottom clears the ground by about 2″ all along.', v: { cam: [1.6, 1.6, 3.0], at: [0, 0.9, 0], hi: ['newPanel'], hide: ['blocks'] } },
      ],
      learn: {
        how: 'Prefab panels are a frame of two or three rails with boards attached, made to drop between posts set 8 ft on center. Brackets carry the rails and let the wood move with the seasons.',
        specs: [['Panel', '6×8 ft typical'], ['Post spacing', '8 ft on center'], ['Ground gap', '≈ 2″'], ['Brackets', 'One per rail end'], ['Fasteners', 'Rated for treated lumber (hot-dip galvanized, stainless or coated)']],
        terms: [['U-bracket', 'Galvanized channel that cradles a rail end.'], ['Line level', 'Tiny level that hangs on a string.'], ['Racking', 'Tilting a panel to follow a slope.']],
        mistakes: ['Trimming the panel too short.', 'Using plain steel screws that rust in treated wood.', 'Letting the bottom rest on soil.'],
        tips: ['On a slope, step the panels (level, stair-stepped) or rack them to follow the ground.', 'If the opening is slightly narrow, trim the rail ends, not the boards.'],
      },
      pro: 'A post is broken or rotted at the ground, or several panels in a row are damaged.',
      tricks: [['Mark from the panel', 'Hold the new panel in place to mark bracket heights; it beats measuring and adding errors.'], ['Buy the panel first', 'Panels differ by store and brand. Measure the new one before removing the old so you know what fits.'], ['Saw out stubborn screws', 'A reciprocating saw blade slipped between rail and post cuts rusty screws faster than fighting them.'], ['Filler strip', 'A narrow opening is easier to fix with a ripped treated strip on the post than by cutting the panel.'], ['Pick a calm morning', 'An 8 ft panel is a sail. Wind before noon is usually lighter.'], ['Seal the bottom edge', 'Brush sealer on the panel’s bottom end grain before it goes in.']],
      refs: [['How to install prefab fence panels (Home Depot Canada)', 'https://www.homedepot.ca/en/home/ideas-how-to/fencing/how-to-install-prefab-fence-panels.html'], ['Installing wood fence panels on existing posts (Hunker)', 'https://www.hunker.com/13424869/how-to-install-wood-fencing-panels-using-existing-wood-fence-posts/'], ['How to replace fence panels or pickets (The Handyman’s Daughter)', 'https://www.thehandymansdaughter.com/how-to-replace-fence-panels-or-pickets/']],
    },
  ]);
})();

/* ---------------- Concrete: step patch, small pad (build), clean & seal ---------------- */
(function () {
  const XM = TB.XM;
  const conc = (K, c, b) => K.bumpy(c || 0xa9a79f, K.tex.speckle(), b || 0.01, { roughness: 0.95 });

  /* ===== Concrete stoop: 2 steps + landing, chipped nosing on the upper step ===== */
  TB.model(
    'xConcreteSteps',
    XM.view({ cam: [1.3, 1.0, 2.6], at: [0.1, 0.35, 1.0], tex: ['aerial_grass_rock'], hidden: ['form', 'bonding', 'patch', 'cure'] }),
    (K) => {
      const c = conc(K);
      const wall = K.part('house', [0, 0, 0], null, 'House wall');
      XM.siding(K, wall, -1.6, 1.6, 0.6, 2.6, 0, 0xd2cab8);
      K.box(wall, [3.2, 0.6, 0.06], conc(K, 0x9a978e), [0, 0.3, 0.02], null, 0.004);
      K.box(wall, [0.95, 2.05, 0.05], K.std(0x3c4f63, { roughness: 0.5 }), [0, 0.54 + 1.025, 0.03], null, 0.01);
      K.box(wall, [1.05, 2.1, 0.04], K.std(0xf2f0ea, { roughness: 0.5 }), [0, 0.54 + 1.05, 0.015], null, 0.006);
      K.sph(wall, 0.025, 'brass', [0.36, 1.55, 0.07]);
      const steps = K.part('steps', [0, 0, 0], null, 'Concrete steps (7″ risers, 11″ treads)');
      const W = 1.3;
      K.box(steps, [W, 0.54, 0.9], c, [0, 0.27, 0.45], null, 0.012);
      // upper step (top 0.36) split around the chip at x -0.15..0.3, front 0.08 deep, 0.09 down
      const z0 = 0.9;
      const z1 = 1.18;
      K.box(steps, [W, 0.27, z1 - z0 - 0.08], c, [0, 0.135 + 0.0, z0 + (z1 - z0 - 0.08) / 2], null, 0.01);
      K.box(steps, [W, 0.36 - 0.27, z1 - z0 - 0.08], c, [0, 0.315, z0 + (z1 - z0 - 0.08) / 2], null, 0.01);
      K.box(steps, [W, 0.27, 0.08], c, [0, 0.135, z1 - 0.04], null, 0.01);
      K.box(steps, [0.5, 0.09, 0.08], c, [-0.4, 0.315, z1 - 0.04], null, 0.01);
      K.box(steps, [0.35, 0.09, 0.08], c, [0.475, 0.315, z1 - 0.04], null, 0.01);
      K.box(steps, [W, 0.18, 0.28], c, [0, 0.09, z1 + 0.14], null, 0.01);
      // railing
      const rail = K.part('railing', [0, 0, 0], null, 'Iron railing');
      const iron = K.std(0x1c1d1f, { metalness: 0.5, roughness: 0.5 });
      [[0.62, 0.36, 1.3], [0.62, 0.54, 0.1]].forEach(([x, y, z]) => K.cyl(rail, [0.014, 0.014, 0.9, 10], iron, [x, y + 0.45, z]));
      XM.span(K, rail, [0.62, 1.22, 1.3], [0.62, 1.4, 0.1], 0.03, 0.02, iron);
      for (let z = 0.25; z < 1.25; z += 0.11) K.cyl(rail, [0.007, 0.007, 0.7, 8], iron, [0.62, (z > 0.9 ? 0.36 : 0.54) + 0.35 + (1.3 - z) * 0.15 - 0.1, z]);
      // damage: rough spall faces + loose chunks
      const dmg = K.part('damage', [0.075, 0.315, z1 - 0.04], null, 'Spalled, broken nosing');
      const rough = conc(K, 0x8e8b83, 0.04);
      K.box(dmg, [0.45, 0.012, 0.08], rough, [0, -0.04, 0], [0, 0, 2], 0.004);
      K.box(dmg, [0.45, 0.09, 0.012], rough, [0, 0, -0.035], [4, 0, 0], 0.004);
      const loose = K.part('loose', [0.075, 0.28, z1 - 0.02], null, 'Loose, cracked concrete');
      [[-0.12, 0.0, 0], [0.05, 0.01, 0.01], [0.15, -0.005, -0.005]].forEach(([x, y, z], i) => K.box(loose, [0.07 + i * 0.01, 0.05, 0.05], rough, [x, y, z], [i * 20, i * 33, i * 11], 0.01));
      K.rep(8, (i) => K.sph(dmg, 0.012, rough, [-0.2 + i * 0.06, -0.035, 0.03 + (i % 3) * 0.01], [1.3, 0.6, 1]));
      // repair parts
      const form = K.part('form', [0, 0, 0], null, 'Oiled 1×8 form board, braced');
      K.box(form, [0.8, 0.184, 0.019], K.pbr('wood_planks', [0.3, 1], { color: 0xd8b98d }, 'woodLight'), [0.075, 0.27, z1 + 0.0095], null, 0.003);
      [-0.2, 0.35].forEach((x) => K.box(form, [0.19, 0.19, 0.09], K.std(0xa4442e, { roughness: 0.9 }), [x, 0.095 + 0.18, z1 + 0.064], null, 0.006));
      const bond = K.part('bonding', [0.075, 0.315, z1 - 0.04], null, 'Bonding agent (brushed on, tacky)');
      const milky = K.std(0xf1efe6, { transparent: true, opacity: 0.6, roughness: 0.25 });
      K.box(bond, [0.46, 0.004, 0.082], milky, [0, -0.033, 0], [0, 0, 2], 0);
      K.box(bond, [0.46, 0.092, 0.004], milky, [0, 0, -0.028], [4, 0, 0], 0);
      const patch = K.part('patch', [0.075, 0.315, z1 - 0.04], null, 'Patch: quick-setting cement + acrylic fortifier');
      K.box(patch, [0.45, 0.09, 0.08], conc(K, 0xb7b4ab, 0.006), [0, 0, 0], null, 0.012);
      const cure = K.part('cure', [0, 0, 0], null, 'Plastic sheet to cure slowly');
      K.box(cure, [1.4, 0.004, 0.62], K.std(0xe6eef2, { transparent: true, opacity: 0.45, roughness: 0.2 }), [0, 0.37, 1.18], null, 0);
      K.box(cure, [1.4, 0.2, 0.004], K.std(0xe6eef2, { transparent: true, opacity: 0.45, roughness: 0.2 }), [0, 0.27, 1.19], null, 0);
      K.box(null, [4, 0.02, 1.2], conc(K, 0xa29f97), [0, -0.005, 2.1], null, 0);
    }
  );

  /* ===== Small concrete pad (4×4 ft, 4″ thick on 4″ gravel), grade at y = 0.15 ===== */
  TB.model(
    'xConcretePad',
    XM.view({
      cam: [2.6, 2.0, 2.8],
      at: [0, 0.15, 0],
      tex: ['aerial_grass_rock', 'gravel_floor', 'wood_planks'],
      assets: ['exterior_aircon_unit'],
      hidden: ['layout', 'dig', 'gravel', 'forms', 'mesh', 'concrete', 'screed', 'finish', 'unit'],
    }),
    (K) => {
      const G = 0.15;
      const P = 0.61; // half pad
      const H = P + 0.1; // half hole
      // raised yard with a hole the size of the excavation
      const grass = K.bumpy(0x6f9e4c, K.tex.speckle(), 0.02, { roughness: 1 });
      const dirt = K.bumpy(0x6e5238, K.tex.speckle(), 0.03, { roughness: 1 });
      const yard = K.part('yard', [0, 0, 0], null, 'Yard');
      const slab = (x0, x1, z0, z1) => {
        K.box(yard, [x1 - x0, G - 0.02, z1 - z0], dirt, [(x0 + x1) / 2, (G - 0.02) / 2, (z0 + z1) / 2], null, 0);
        K.box(yard, [x1 - x0, 0.02, z1 - z0], grass, [(x0 + x1) / 2, G - 0.01, (z0 + z1) / 2], null, 0);
      };
      slab(-2.2, 2.2, -2.2, -H);
      slab(-2.2, 2.2, H, 2.2);
      slab(-2.2, -H, -H, H);
      slab(H, 2.2, -H, H);
      // the hole is visible only once dug; before that a sod cap covers it
      const sod = K.part('sod', [0, 0, 0], null, 'Sod (to be cut out)');
      K.box(sod, [2 * H, G - 0.02, 2 * H], dirt, [0, (G - 0.02) / 2, 0], null, 0);
      K.box(sod, [2 * H, 0.02, 2 * H], grass, [0, G - 0.01, 0], null, 0);
      const house = K.part('house', [0, 0, 0], null, 'House wall');
      XM.siding(K, house, -2.2, 2.2, G, 2.4, -1.4, 0xd5d0c2);
      K.box(house, [4.4, 0.3, 0.05], conc(K, 0x9a978e), [0, G + 0.05, -1.37], null, 0.004);
      K.tube(house, [[0.45, 0.9, -1.38], [0.45, 0.6, -1.3], [0.35, 0.45, -0.6], [0.3, 0.42, -0.25]], 0.012, K.std(0x1d1d1d, { roughness: 0.6 }));
      K.tube(house, [[0.5, 0.9, -1.38], [0.5, 0.55, -1.3], [0.42, 0.4, -0.6], [0.36, 0.38, -0.25]], 0.009, 'copper');
      // layout stakes & string
      const lay = K.part('layout', [0, 0, 0], null, 'Stakes & string, diagonals equal');
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => K.box(lay, [0.025, 0.4, 0.025], 'woodLight', [sx * (H + 0.15), G + 0.15, sz * (H + 0.15)], null, 0.003));
      [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]].forEach(([a, b, c2, d]) => K.bar(lay, [a * (H + 0.15), G + 0.25, b * P], [c2 * (H + 0.15), G + 0.25, d * P], 0.002, 'yellow'));
      [[-1, -1, 1, -1], [1, -1, 1, 1]].forEach(([a, b, c2, d]) => K.bar(lay, [b * P, G + 0.26, a * (H + 0.15)], [d * P, G + 0.26, c2 * (H + 0.15)], 0.002, 'yellow'));
      const dig = K.part('dig', [0, 0, 0], null, 'Excavation 6″ deep, 4″ wider than the pad');
      K.box(dig, [2 * H, 0.01, 2 * H], dirt, [0, 0.005, 0], null, 0);
      const gr = K.part('gravel', [0, 0, 0], null, '4″ compacted gravel base');
      K.box(gr, [2 * H, 0.1, 2 * H], K.pbr('gravel_floor', [1, 1], {}, 'stone'), [0, 0.05, 0], null, 0.004);
      const forms = K.part('forms', [0, 0, 0], null, '2×4 forms on stakes, top at finish height');
      const fw = K.pbr('wood_planks', [0.3, 1], { color: 0xc9b483 }, 'woodLight');
      [-1, 1].forEach((s) => {
        K.box(forms, [2 * P + 0.076, 0.089, 0.038], fw, [0, 0.1 + 0.1 - 0.0445, s * (P + 0.019)], null, 0.003);
        K.box(forms, [0.038, 0.089, 2 * P], fw, [s * (P + 0.019), 0.1 + 0.1 - 0.0445, 0], null, 0.003);
        [-0.4, 0.4].forEach((t) => {
          K.box(forms, [0.04, 0.3, 0.02], fw, [t, 0.1, s * (P + 0.05)], null, 0.003);
          K.box(forms, [0.02, 0.3, 0.04], fw, [s * (P + 0.05), 0.1, t], null, 0.003);
        });
      });
      const mesh = K.part('mesh', [0, 0, 0], null, '#3 rebar grid on chairs (mid-depth)');
      const rb = K.std(0x6b4a33, { metalness: 0.6, roughness: 0.7 });
      [-0.45, -0.15, 0.15, 0.45].forEach((t) => {
        K.cyl(mesh, [0.005, 0.005, 2 * P - 0.1, 8], rb, [t, 0.15, 0], [90, 0, 0]);
        K.cyl(mesh, [0.005, 0.005, 2 * P - 0.1, 8], rb, [0, 0.16, t], [0, 0, 90]);
      });
      [[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3]].forEach(([x, z]) => K.cone(mesh, [0.02, 0.05, 4], 'grey', [x, 0.12, z], [180, 0, 0]));
      const cc = K.part('concrete', [0, 0, 0], null, '4″ of 4000 psi concrete');
      const wet = K.bumpy(0x8f8d86, K.tex.speckle(), 0.006, { roughness: 0.5 });
      K.box(cc, [2 * P, 0.1, 2 * P], wet, [0, 0.15, 0], null, 0.012);
      const sc = K.part('screed', [0, 0, 0], null, 'Straight 2×4 screed board');
      K.box(sc, [0.038, 0.089, 1.6], fw, [0.2, 0.245, 0], null, 0.003);
      const fin = K.part('finish', [0, 0, 0], null, 'Edged, broom-finished surface');
      const groove = K.std(0x6f6d68, { roughness: 1 });
      K.box(fin, [2 * P, 0.001, 2 * P], conc(K, 0xb8b6ae, 0.004), [0, 0.2005, 0], null, 0);
      for (let x = -P + 0.03; x < P; x += 0.025) K.box(fin, [0.003, 0.0012, 2 * P - 0.06], groove, [x, 0.201, 0], null, 0);
      [-1, 1].forEach((s) => {
        K.box(fin, [2 * P - 0.04, 0.0015, 0.006], groove, [0, 0.2015, s * (P - 0.035)], null, 0);
        K.box(fin, [0.006, 0.0015, 2 * P - 0.04], groove, [s * (P - 0.035), 0.2015, 0], null, 0);
      });
      const unit = K.part('unit', [0, 0.2, 0], null, 'AC condenser on its new pad');
      K.glb(unit, 'exterior_aircon_unit', { height: 0.7 }, [0, 0, 0]) ||
        (K.box(unit, [0.8, 0.7, 0.32], K.std(0xe9e8e2, { roughness: 0.5 }), [0, 0.35, 0], null, 0.02), K.cyl(unit, [0.24, 0.24, 0.01, 32], 'dark', [0.12, 0.38, 0.165], [90, 0, 0]));
      return {
        tick(t, fx) {
          if (fx === 'screed') K.parts.screed.position.x = Math.sin(t * 1.6) * 0.45;
        },
      };
    }
  );

  /* ===== Driveway clean & seal ===== */
  TB.model(
    'xDrivewaySeal',
    XM.view({ cam: [3.4, 2.6, 5.2], at: [0, 0, 1.4], tex: ['aerial_grass_rock'], hidden: ['crackFill', 'degreaser', 'washer', 'tape', 'sprayer', 'coat1', 'coat2'] }),
    (K) => {
      const slabM = K.tiled(conc(K, 0x9f9c94, 0.008), 3, 3);
      const slab = K.part('slab', [0, 0, 0], null, 'Concrete driveway');
      K.box(slab, [3.2, 0.1, 5.4], slabM, [0, 0.0, 2.7], null, 0.01);
      const jt = K.part('joints', [0, 0, 0], null, 'Control joints & hairline crack');
      const dk = K.std(0x4a4844, { roughness: 1 });
      [1.8, 3.6].forEach((z) => K.box(jt, [3.2, 0.004, 0.008], dk, [0, 0.051, z], null, 0));
      K.box(jt, [0.006, 0.004, 5.4], dk, [0, 0.051, 2.7], null, 0);
      K.tube(jt, [[-1.2, 0.0505, 4.1], [-0.9, 0.0505, 4.4], [-0.75, 0.0505, 4.55], [-0.5, 0.0505, 4.95]], 0.003, dk);
      const st = K.part('stains', [0, 0, 0], null, 'Oil & tire stains');
      const oil = K.std(0x3a3632, { roughness: 0.4, transparent: true, opacity: 0.75 });
      [[0.6, 1.0, 0.25], [-0.5, 1.3, 0.18], [0.2, 2.2, 0.12]].forEach(([x, z, r]) => K.cyl(st, [r, r, 0.002, 24], oil, [x, 0.0505, z]));
      const grime = K.part('grime', [0, 0, 0], null, 'Grime & mildew');
      const gm = K.std(0x76746c, { roughness: 1, transparent: true, opacity: 0.55 });
      [[-0.9, 3.0, 0.9, 1.6], [0.9, 4.4, 1.2, 1.0], [-1.0, 0.6, 1.0, 0.8]].forEach(([x, z, w, d]) => K.box(grime, [w, 0.002, d], gm, [x, 0.0506, z], null, 0));
      const cf = K.part('crackFill', [0, 0, 0], null, 'Self-leveling crack sealant');
      K.tube(cf, [[-1.2, 0.052, 4.1], [-0.9, 0.052, 4.4], [-0.75, 0.052, 4.55], [-0.5, 0.052, 4.95]], 0.005, K.std(0x8e8b84, { roughness: 0.5 }));
      const dg = K.part('degreaser', [0, 0, 0], null, 'Degreaser, scrubbed in');
      [[0.6, 1.0, 0.27], [-0.5, 1.3, 0.2], [0.2, 2.2, 0.14]].forEach(([x, z, r]) => K.cyl(dg, [r, r, 0.006, 24], K.std(0xeef2c8, { roughness: 0.6, transparent: true, opacity: 0.8 }), [x, 0.053, z]));
      // garage + lawn edges
      const house = K.part('garage', [0, 0, 0], null, 'Garage');
      XM.siding(K, house, -2.4, 2.4, 0.05, 2.7, -0.1, 0xd8d2c3);
      K.box(house, [2.8, 2.15, 0.05], K.std(0xf3f1ec, { roughness: 0.45 }), [0, 0.05 + 1.075, -0.06], null, 0.01);
      K.rep(4, (i) => K.box(house, [2.8, 0.01, 0.06], K.std(0xd9d6cf), [0, 0.55 + i * 0.53, -0.05], null, 0));
      K.box(null, [1.2, 0.04, 5.4], 'grass', [-2.2, 0.0, 2.7], null, 0);
      K.box(null, [1.2, 0.04, 5.4], 'grass', [2.2, 0.0, 2.7], null, 0);
      // pressure washer with surface cleaner
      const pw = K.part('washer', [0, 0, 0], null, 'Pressure washer + surface cleaner');
      const yel = K.std(0xf0b320, { roughness: 0.45 });
      K.box(pw, [0.45, 0.4, 0.4], yel, [1.9, 0.25, 0.4], null, 0.04);
      [-1, 1].forEach((s) => K.cyl(pw, [0.11, 0.11, 0.05, 20], 'rubber', [1.9 + s * 0.24, 0.11, 0.25], [0, 0, 90]));
      const sc = K.part('cleaner', [0.3, 0.05, 1.6], pw, 'Surface cleaner (no stripes)');
      K.cyl(sc, [0.24, 0.26, 0.09, 32], 'black', [0, 0.05, 0]);
      K.cyl(sc, [0.015, 0.015, 1.0, 10], 'steel', [0, 0.55, 0.25], [-28, 0, 0]);
      K.box(sc, [0.35, 0.03, 0.03], 'black', [0, 1.0, 0.48], null, 0.008);
      K.tube(pw, [[1.9, 0.3, 0.4], [1.2, 0.03, 0.8], [0.5, 0.03, 1.3], [0.3, 0.1, 1.6]], 0.008, 'black');
      const tp = K.part('tape', [0, 0, 0], null, 'Painter’s tape + plastic on the door & siding');
      K.box(tp, [2.9, 0.4, 0.004], K.std(0xdde8ee, { transparent: true, opacity: 0.6 }), [0, 0.25, -0.03], null, 0);
      K.box(tp, [2.9, 0.03, 0.006], 'blue', [0, 0.45, -0.025], null, 0);
      const sp = K.part('sprayer', [-0.6, 0, 2.6], null, 'Pump sprayer (low pressure, fan tip)');
      K.cyl(sp, [0.09, 0.09, 0.42, 20], K.std(0xf6f6f2, { roughness: 0.4 }), [0, 0.26, 0]);
      K.cyl(sp, [0.012, 0.012, 0.25, 10], 'blue', [0, 0.6, 0]);
      K.tube(sp, [[0.05, 0.4, 0.05], [0.25, 0.5, 0.3], [0.45, 0.4, 0.5], [0.6, 0.2, 0.6]], 0.006, 'black');
      K.cyl(sp, [0.008, 0.008, 0.5, 8], 'grey', [0.6, 0.35, 0.65], [30, 0, 0]);
      const wetM = K.std(0x7d7a73, { transparent: true, opacity: 0.45, roughness: 0.15 });
      const c1 = K.part('coat1', [0, 0, 0], null, 'First saturating coat');
      K.box(c1, [3.18, 0.002, 2.6], wetM, [0, 0.0515, 1.3], null, 0);
      const c2 = K.part('coat2', [0, 0, 0], null, 'Sealer, both coats');
      K.box(c2, [3.18, 0.002, 2.8], wetM, [0, 0.0515, 4.0], null, 0);
      return {
        tick(t, fx) {
          const cl = K.parts.cleaner;
          if (fx === 'wash') {
            cl.position.x = 0.3 + Math.sin(t * 1.2) * 1.0;
          }
        },
      };
    }
  );

  /* ---------------- Concrete guides ---------------- */
  const PADSHOW = ['gravel', 'concrete', 'finish', 'unit'];
  TB.more('concrete', [
    {
      id: 'step-patch',
      title: 'Patch a chipped concrete step',
      model: 'xConcreteSteps',
      level: 2,
      time: '2–3 hrs + cure',
      cost: '$20–50',
      summary: 'A broken step nosing is a trip hazard that only gets worse with freeze-thaw. Chip out the loose concrete, set a form board, bond a stiff patch into the corner and let it cure slowly.',
      intro: { hi: ['damage', 'loose'] },
      safety: ['Wear safety glasses and gloves when chipping and mixing; wet cement is caustic and burns skin.', 'Wear a dust mask when mixing dry patch powder.', 'Block the steps or use another door while the patch cures.'],
      causes: [['Freeze-thaw', 'Water in the concrete freezes and pops the surface or corners.'], ['Deicing salt', 'Speeds up surface scaling.'], ['Impact', 'Hand trucks and dropped loads break the nosing.']],
      tools: ['Cold chisel + hammer', 'Wire brush + shop vacuum', '1×8 form board + bricks or stakes', 'Concrete bonding agent or acrylic fortifier', 'Quick-setting cement or concrete repair mortar', 'Margin trowel + edger', 'Spray bottle', 'Plastic sheet', 'Safety glasses, gloves, dust mask'],
      steps: [
        { t: 'Look at the damage', d: 'Tap around the break with a hammer. A dull, hollow sound means loose concrete that has to come out; a clear ring means it’s sound.', why: 'A patch is only as strong as what it bonds to.', tip: 'Drag a chain or the hammer head lightly across the step: the sound changes from ring to thud right at the edge of the loose area. Chalk around it.', ok: 'You’ve chalked an outline around everything that sounds hollow or crumbles.', v: { cam: [0.9, 0.75, 1.9], at: [0.075, 0.3, 1.1], hi: ['damage', 'loose'] } },
        { t: 'Chip out loose concrete', d: 'With safety glasses on, knock off every loose piece with a cold chisel and hammer, and angle the edges slightly inward (undercut) so the patch locks in. Make the hole at least ½″ deep everywhere.', why: 'Thin, feathered edges crumble; an undercut, square-shouldered hole holds the patch.', tip: 'Hold the chisel at about 45° and strike firmly. For a big broken corner, drive two concrete screws into the break with heads ½″ below the final surface as hidden anchors.', ok: 'Every edge is solid and square or undercut, and nothing moves when you pry at it.', v: { cam: [0.8, 0.7, 1.7], at: [0.075, 0.3, 1.12], hi: ['loose', 'damage'], mv: { loose: [0.35, -0.25, 0.4] }, tool: { id: 'hammer', at: [0.0, 0.34, 1.16], rot: [0, 0, 0], anim: 'tap' } } },
        { t: 'Clean it out', d: 'Wire-brush the break, then vacuum out all the dust and rinse with a hose.', why: 'Dust is a bond breaker: the patch sticks to the dust, not the step.', tip: 'A shop vacuum beats blowing, which just moves dust around and into your eyes.', ok: 'A finger wiped in the hole comes out clean.', v: { cam: [0.8, 0.7, 1.7], at: [0.075, 0.3, 1.12], hi: ['damage'], hide: ['loose'], tool: { id: 'wireBrush', at: [0.1, 0.32, 1.13], rot: [0, 0, 70], anim: 'slide' } } },
        { t: 'Set a form board', d: 'Oil a 1×8 and hold it against the riser with its top flush with the step surface, braced with bricks or stakes.', why: 'The form shapes a crisp, square nosing; the oil lets it release.', tip: 'Packing tape on the board face works as well as oil and leaves a smoother finish.', ok: 'The board is tight to the riser, flush with the step top, and doesn’t move when you push it.', v: { cam: [1.2, 0.9, 2.2], at: [0.075, 0.3, 1.15], hi: ['form'], show: ['form'], tool: { id: 'level', at: [0.075, 0.362, 1.05], rot: [0, 0, 0], scale: 2 } } },
        { t: 'Dampen and bond', d: 'Mist the break until it’s damp but has no puddles, then brush on bonding agent (or a creamy slurry of patch mix and acrylic fortifier) and patch while it’s still tacky.', why: 'Dry concrete sucks water from the patch and weakens it; the bonding coat glues old to new.', tip: 'If the bonding coat dries to a skin before you patch, it acts like a release coat. Brush on a fresh coat.', ok: 'The surface looks dark and damp, not shiny-wet, and the bonding coat feels tacky.', v: { cam: [0.8, 0.75, 1.75], at: [0.075, 0.3, 1.12], hi: ['bonding'], show: ['bonding'] } },
        { t: 'Pack in the patch', d: 'Mix the patch stiff, like peanut butter, with the water the bag lists. Press it in hard with a margin trowel, in layers no thicker than the bag allows, overfill slightly and strike it flush with the step and form.', why: 'Packing forces out air pockets that would hold water, freeze and crack.', tip: 'Quick-setting mixes harden in about 10–15 minutes, so mix small batches. If it stiffens in the bucket, toss it; adding water weakens it.', ok: 'The patch is dense, with no holes along the form, and sits flush with the step.', v: { cam: [0.9, 0.85, 1.85], at: [0.075, 0.33, 1.12], hi: ['patch'], show: ['patch'], tool: { id: 'trowel', at: [0.0, 0.365, 1.12], rot: [0, 0, 0] } } },
        { t: 'Shape and texture', d: 'When it firms up, pull the form, round the nosing with an edger, and lightly broom the top to match.', why: 'Matching the texture makes the patch disappear and keeps it slip-resistant.', tip: 'Press a fingertip on it: when it leaves only a light print and no water rises, it’s ready to edge and broom.', ok: 'The nosing has a crisp rounded edge and the texture matches the rest of the step.', v: { cam: [1.1, 0.8, 2.1], at: [0.075, 0.3, 1.12], hi: ['patch'], hide: ['form', 'bonding'] } },
        { t: 'Cure slowly', d: 'Cover with plastic and keep it damp for 3 days (or as the bag says); keep foot traffic off for 24 hours and keep deicing salt off the first winter.', why: 'Slow curing makes concrete stronger and stops shrinkage cracks.', tip: 'Mist the patch morning and evening under the plastic. In hot sun, lay a damp towel under the plastic.', ok: 'The patch stays dark and damp through the cure and rings solid when tapped a week later.', v: { cam: [1.3, 1.0, 2.6], at: [0.1, 0.35, 1.0], hi: ['cure'], show: ['cure'] } },
      ],
      learn: {
        how: 'New concrete doesn’t naturally stick to old concrete. The bond comes from a clean, rough, slightly damp surface, a bonding agent or polymer-fortified mix, and mechanical lock from undercut edges. Corners are the weakest spot on a step because water attacks them from two sides.',
        specs: [['Hole depth', '≥ ½″, edges undercut'], ['Thin patcher', 'Thin surface repairs only; see the bag for max depth'], ['Damp cure', '3 days (or per bag)'], ['Foot traffic', 'After 24 hrs'], ['Work temperature', 'Above 40 °F for 48 hrs']],
        terms: [['Spalling', 'Surface or corners flaking off.'], ['Nosing', 'Front edge of a step.'], ['Bonding agent', 'Liquid that helps new concrete grip old.'], ['Undercut', 'A dovetail-shaped edge that locks the patch in.']],
        mistakes: ['Patching over loose concrete.', 'Feathering the patch to nothing at the edges.', 'Letting the patch dry in the sun on day one.', 'Adding water to a mix that has started to stiffen.'],
        tips: ['Seal the whole step afterward to slow future spalling.', 'Use sand, not salt, on these steps the first winter.'],
      },
      pro: 'The step has settled or pulled away from the house, cracks run all the way through, or more than a third of it is spalling.',
      tricks: [['Listen for loose', 'A dragged chain or tapping hammer finds hollow concrete you can’t see.'], ['Hidden anchors', 'Concrete screws set into a big broken corner, heads below the surface, give the patch something to grab.'], ['Tape the form', 'Packing tape on the form board releases cleaner than oil.'], ['Small batches', 'Quick-set mixes harden fast; mix a coffee-can amount at a time.'], ['Match the color', 'Patches dry lighter than old concrete. Brushing the cured patch and nearby step with a penetrating sealer evens out the look.'], ['Damp towel cure', 'A wet towel under plastic keeps a small patch evenly moist for days.']],
      refs: [['Repairing concrete steps (Quikrete)', 'https://www.quikrete.com/athome/repairingsteps.asp'], ['Repairing concrete steps project sheet (Quikrete)', 'https://www.quikrete.com/athome/repairingconcretesteps.pdf'], ['How to repair concrete steps (Home Depot)', 'https://www.homedepot.com/c/ah/how-to-repair-concrete-steps/9ba683603be9fa5395fab907abbe00a']],
    },
    {
      id: 'concrete-pad',
      title: 'Pour a small concrete pad',
      model: 'xConcretePad',
      kind: 'build',
      level: 3,
      time: '1 day + cure',
      cost: '$120–300',
      summary: 'A 4×4 ft pad, 4″ thick on 4″ of compacted gravel, sized for an AC condenser, generator or trash cans. About ten 80 lb bags of mix, one set of 2×4 forms and an afternoon.',
      intro: { show: PADSHOW, preview: true, spin: true },
      safety: ['Call 811 a few days before digging; AC lines and cables often run near the house.', 'Wet concrete burns skin: wear gloves, long sleeves and eye protection, and rinse splashes right away.', 'Lift bags with your legs and get help; each 80 lb bag is heavy.'],
      causes: [['Size it', 'Pad 3″ bigger than the equipment on every side.'], ['Pick the spot', 'Level ground that slopes away from the house.'], ['Figure the concrete', '4×4 ft × 4″ ≈ 0.2 yd³ ≈ 10 bags of 80 lb mix.']],
      tools: ['Spade + flat shovel', 'Hand tamper', 'Tape measure, 4 ft level, string', '2×4 forms + stakes + 3″ screws', 'Crushed gravel (≈ 0.2 yd³)', '#3 rebar or wire mesh + chairs + tie wire', '80 lb bags of concrete mix (≈ 10)', 'Wheelbarrow + hoe', 'Screed board, magnesium float, edger, broom', 'Plastic sheet', 'Gloves, eye protection'],
      steps: [
        { t: 'Lay it out', d: 'Drive stakes and run string 4″ outside the pad size. Adjust until both diagonals measure the same.', why: 'Equal diagonals mean a square pad, so the forms and equipment line up.', tip: 'Use the 3-4-5 trick for a square corner: mark 3 ft on one string and 4 ft on the other; the distance between the marks should be exactly 5 ft.', ok: 'Both diagonals match within ⅛″.', v: { cam: [2.2, 1.8, 2.4], at: [0, 0.15, 0], hi: ['layout'], show: ['layout'], tool: { id: 'tape', at: [0.71, 0.4, 0.61], rot: [0, 0, 0], scale: 1.5 } } },
        { t: 'Dig it out', d: 'Cut the sod and dig 6″ deep with a flat bottom, 4″ wider than the pad on every side. The pad is 4″ of gravel plus 4″ of concrete, finishing about 2″ above the ground.', why: 'The gravel drains water away, and a pad that sits a little high sheds water instead of collecting it.', tip: 'Stop at firm, undisturbed soil. If you dig too deep, fill with extra gravel, never loose dirt.', ok: 'A level on a straight 2×4 shows a flat bottom, 6″ deep throughout.', v: { cam: [2.2, 1.8, 2.4], at: [0, 0.05, 0], hi: ['dig'], show: ['dig'], hide: ['sod'], tool: { id: 'shovel', at: [0.4, 0.01, 0.3], rot: [10, 40, -15], anim: 'push' } } },
        { t: 'Gravel and compact', d: 'Spread 4″ of crushed gravel (angular, not round pea gravel) in two 2″ layers and tamp each one hard and level.', why: 'Compacted gravel drains and gives the slab even support, so it won’t crack or tip.', tip: 'Dampen the gravel lightly before tamping; it packs tighter.', ok: 'Walking on it barely leaves a footprint, and it checks flat with the level.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.1, 0], hi: ['gravel'], show: ['gravel'], hide: ['layout'] } },
        { t: 'Build the forms', d: 'Screw 2×4s into a square on stakes driven outside them, tops at finished height, sloped ⅛″ per foot away from the house. Rake the gravel inside ½″ below the form bottoms so the slab is a full 4″ thick.', why: 'The form tops are your screed rails; whatever they say is what the slab will be.', tip: 'Cut stakes off below the form tops so the screed board slides over without catching. Oil the inside faces so they release.', ok: 'The level shows the planned slope and the forms don’t budge when you kick them.', v: { cam: [2.0, 1.5, 2.2], at: [0, 0.2, 0], hi: ['forms'], show: ['forms'], tool: { id: 'level', at: [0, 0.2, 0.63], rot: [0, 0, 0], scale: 3 } } },
        { t: 'Set the reinforcement', d: 'Lay #3 rebar (⅜″ thick) in a grid about 12″ apart, or wire mesh, on chairs (little plastic stands) so it sits in the middle of the slab and 2″ in from the forms.', why: 'Steel lying on the gravel does nothing; it has to be mid-depth to hold cracks tight.', tip: 'Tie crossing bars with wire twists so the grid doesn’t shift while you pour.', ok: 'The steel sits about 2″ above the gravel everywhere and stays put when you step near it.', v: { cam: [1.6, 1.4, 1.8], at: [0, 0.15, 0], hi: ['mesh'], show: ['mesh'] } },
        { t: 'Pour', d: 'Mix each 80 lb bag with about 3 quarts of water, to a thick oatmeal consistency, and fill the form a little proud, working it into the corners. Poke along the edges with a shovel to release air pockets.', why: 'Extra water makes it easier to pour and much weaker. Mix only what you need.', tip: 'Add the last of the water slowly. If a ridge cut with the hoe slumps flat, it’s too wet; add a scoop of dry mix.', ok: 'The concrete holds a ridge when you cut it with the hoe and fills every corner.', v: { cam: [2.0, 1.5, 2.2], at: [0, 0.2, 0], hi: ['concrete'], show: ['concrete'], tool: { id: 'shovel', at: [0.2, 0.2, 0.3], rot: [30, 40, -15] } } },
        { t: 'Screed it', d: 'Saw a straight 2×4 back and forth across the form tops, pulling off extra concrete and filling low spots.', why: 'Screeding sets the flat plane; everything after just finishes the surface.', tip: 'Keep a small roll of concrete in front of the board; it fills low spots as you pull.', ok: 'The surface is flush with the form tops with no low spots.', v: { cam: [2.0, 1.4, 2.2], at: [0, 0.2, 0], hi: ['screed'], show: ['screed'], fx: 'screed' } },
        { t: 'Float, edge, broom', d: 'Float the surface once the shiny bleed water is gone. Run an edger around the form, then drag a damp broom across for grip.', why: 'Rounded edges don’t chip; the broom finish gives traction when wet.', tip: 'Waiting is the trick: finishing too early makes the top dusty and flaky. When the shine is gone and a thumb leaves only a ¼″ dent, start.', ok: 'Rounded edges, even broom lines, and no water on the surface.', v: { cam: [1.6, 1.2, 1.8], at: [0, 0.2, 0], hi: ['finish'], show: ['finish'], hide: ['screed'], tool: { id: 'trowel', at: [-0.3, 0.205, 0.2], rot: [0, 0, 0] } } },
        { t: 'Cure, strip, set the unit', d: 'Keep it damp under plastic for 3–7 days. Strip the forms after 1–2 days and wait a week before setting heavy equipment on it.', why: 'Concrete reaches about 70% of its strength in a week and full strength at 28 days.', tip: 'Never let fresh concrete freeze in its first days; cover it with blankets if frost is coming. In heat, mist before covering.', ok: 'Edges are crisp after the forms come off, and there are no cracks.', v: { cam: [2.6, 2.0, 2.8], at: [0, 0.4, 0], hi: ['unit'], show: ['unit'], hide: ['forms', 'mesh'] } },
      ],
      learn: {
        how: 'Concrete hardens by a chemical reaction with water (hydration), not by drying, so keeping it damp makes it stronger. It’s very strong squeezed but weak pulled, so a slab needs a firm, even base under it and steel in the middle to keep cracks tight. A gravel base drains water so frost can’t heave it.',
        specs: [['Thickness', '4″ (6″ for vehicles)'], ['Gravel base', '4″ compacted'], ['Slope', '⅛–¼″ per ft away from the house'], ['80 lb bag', '≈ 0.6 ft³, ≈ 3 qt water'], ['Bags for 4×4×4″', '≈ 9, buy 10'], ['Strip forms', '1–2 days'], ['Full strength', '28 days']],
        terms: [['Screed', 'Straightedge that levels fresh concrete.'], ['Bleed water', 'Water that rises to the surface after pouring.'], ['Float', 'Flat tool that pushes stones down and smooths the top.'], ['Chair', 'Little stand that holds rebar at mid-depth.']],
        mistakes: ['Adding water to make it pour easier.', 'Finishing while bleed water is on the surface (it dusts).', 'Skipping the gravel base.', 'Forms that are only 3½″ deep for a 4″ slab.'],
        tips: ['For an AC unit a plastic pad is an option, but concrete won’t shift or blow away.', 'Pour on a mild, overcast day; hot sun and wind make finishing hard.'],
      },
      pro: 'The pad is bigger than about 10×10 ft (order ready-mix), it supports a structure, or it ties into a foundation.',
      tricks: [['3-4-5 square', 'A 3 ft, 4 ft, 5 ft triangle makes a perfect square corner without a big square.'], ['Rent a mixer', 'A small electric mixer turns ten bags from a back-breaking job into an easy hour.'], ['Wheelbarrow trick', 'Add water first, then the mix; it blends faster and you don’t get dry pockets at the bottom.'], ['Rinse tools as you go', 'Concrete on a trowel or wheelbarrow hardens within an hour; keep a bucket of water handy.'], ['Name the date', 'Write the date in a corner with a nail before it sets; it’s handy and fun later.'], ['Bag count rule', 'Square feet × thickness in feet ÷ 0.6 = 80 lb bags; add 10% for waste.']],
      refs: [['Concrete projects and costs (Today’s Homeowner)', 'https://todayshomeowner.com/concrete/projects-and-costs/'], ['Pouring a concrete slab shed base (One Project Closer)', 'https://www.oneprojectcloser.com/pouring-concrete-slab-shed-base/'], ['How to make AC slabs (Garden Guides)', 'https://gardenguides.com/how_8749976_make-ac-slabs.html'], ['Repairing concrete steps and mix basics (Quikrete)', 'https://www.quikrete.com/athome/repairingsteps.asp']],
    },
    {
      id: 'driveway-seal',
      title: 'Clean & seal a concrete driveway',
      model: 'xDrivewaySeal',
      level: 2,
      time: '1–2 days',
      cost: '$60–200',
      summary: 'A deep clean and a penetrating silane/siloxane sealer every few years keeps water, salt and oil out of concrete. Most of the work is the cleaning; the sealer goes on with a pump sprayer.',
      intro: { hi: ['stains', 'grime', 'joints'] },
      safety: ['Pressure washers cut skin: never point the wand at anyone, and wear closed shoes and eye protection.', 'Use a respirator rated for organic vapors with solvent sealers, and keep kids and pets off until it cures.', 'Sealer makes concrete slippery when wet if over-applied; don’t let it puddle.'],
      causes: [['Surface scaling', 'Salt and freeze-thaw break up unsealed concrete.'], ['Oil stains', 'Concrete is porous and soaks up drips.'], ['Mildew and grime', 'Shaded concrete stays damp.']],
      tools: ['Pressure washer (2,500–3,000 psi) + surface cleaner', 'Concrete degreaser + stiff brush', 'Crack sealant + caulk gun + backer rod', 'Penetrating silane/siloxane sealer', 'Pump sprayer with fan tip', 'Roller on a pole or push broom', 'Painter’s tape + plastic', 'Safety glasses, respirator (solvent sealers), gloves'],
      steps: [
        { t: 'Check age and weather', d: 'New concrete must cure 28 days first. Pick a dry stretch: within the label’s temperature range (often 40–50 °F and up) and no rain for 24 hours after sealing.', why: 'Sealer needs dry, open pores to soak into.', tip: 'Read the label before you buy; some sealers can’t go on above 90 °F or in direct midday sun.', ok: 'The slab is at least 28 days old, the forecast is dry for a day, and the temperature fits the label.', v: { cam: [3.4, 2.6, 5.2], at: [0, 0, 1.4], hi: ['slab'] } },
        { t: 'Seal the cracks', d: 'Clean out cracks wider than ⅛″ and fill them with self-leveling crack sealant. Leave control joints (the straight cut grooves) open, or use a flexible joint sealant.', why: 'Sealer won’t bridge cracks; water still gets in there.', tip: 'Push foam backer rod into cracks deeper than ½″ first so the sealant doesn’t sink. Let it cure as labeled and keep the pressure washer wand off it.', ok: 'Sealant fills each crack flush with the surface.', v: { cam: [0.4, 1.4, 6.0], at: [-0.8, 0, 4.5], hi: ['joints', 'crackFill'], show: ['crackFill'], tool: { id: 'caulkGun', at: [-0.9, 0.06, 4.4], rot: [-50, 0, 0] } } },
        { t: 'Degrease oil stains', d: 'Spread degreaser on oil spots, scrub with a stiff brush and let it work for the time on the label.', why: 'Sealer locks stains in. Treat them now.', tip: 'For old stains, mix degreaser with clay kitty litter into a paste, cover it overnight, then sweep it up. Don’t rinse degreaser into the storm drain.', ok: 'The stains are lighter and water no longer forms a dark ring on them.', v: { cam: [1.6, 1.6, 2.8], at: [0.2, 0, 1.4], hi: ['degreaser', 'stains'], show: ['degreaser'], tool: { id: 'wireBrush', at: [0.6, 0.06, 1.0], rot: [0, 0, 80], anim: 'slide' } } },
        { t: 'Pressure-wash', d: 'Wash the whole slab with a surface cleaner (a spinning-nozzle disc) in overlapping passes, then rinse the dirty water off the edges.', why: 'A surface cleaner gives an even clean with no wand stripes that show through the sealer.', tip: 'Move at a steady walking pace; stopping leaves a round mark. Start at the high end and work downhill.', ok: 'The slab is one even color with no stripes or swirl marks.', v: { cam: [2.8, 2.2, 4.2], at: [0.3, 0, 1.6], hi: ['washer', 'cleaner'], show: ['washer'], hide: ['stains', 'grime', 'degreaser'], fx: 'wash' } },
        { t: 'Let it dry', d: 'Wait at least 24 hours (48 in cool or humid weather). Tape a square of plastic down; no darkening under it after 2 hours means it’s dry enough.', why: 'Water in the pores blocks the sealer.', tip: 'Shaded spots and joints dry last; test them with the plastic too.', ok: 'No darkening or droplets under the plastic after 2 hours.', v: { cam: [3.4, 2.6, 5.2], at: [0, 0, 1.4], hi: ['slab'], hide: ['washer'] } },
        { t: 'Protect the edges', d: 'Mask the garage door bottom and siding with tape and plastic; cover plants beside the drive.', why: 'Overspray stains siding and paint, and solvent sealers can burn plants.', tip: 'Wet the plants down before covering them; water on the leaves helps shed any drift.', ok: 'Everything that isn’t concrete within 3 ft is covered.', v: { cam: [1.8, 1.4, 2.4], at: [0, 0.3, 0], hi: ['tape'], show: ['tape'] } },
        { t: 'Spray the first coat', d: 'Start at the garage and work toward the street, spraying a saturating coat with a low-pressure fan tip.', why: 'Working toward the exit means you never step on wet sealer.', tip: 'Hold the tip 12–18″ off the surface and overlap each pass by half. Set a cone where you stop for a refill.', ok: 'The slab looks evenly wet with no dry patches.', v: { cam: [2.6, 2.0, 3.6], at: [0, 0, 1.4], hi: ['coat1', 'sprayer'], show: ['coat1', 'sprayer'] } },
        { t: 'Spread out puddles', d: 'Roll or broom out any puddles before they dry. Within 5–10 minutes the surface should look evenly damp, not shiny.', why: 'Puddled sealer leaves a slick, white or blotchy film.', tip: 'Keep a dry roller on a pole ready; one pass soaks up a puddle and spreads it thin.', ok: 'No shiny or pooled spots remain after 10 minutes.', v: { cam: [2.0, 1.6, 3.0], at: [0, 0, 1.6], hi: ['coat1'], tool: { id: 'roller', at: [0.4, 0.06, 1.6], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Second coat and cure', d: 'If the label calls for two coats, apply the second wet-on-wet (while the first still looks damp) across the whole slab. Keep feet off 4–6 hours and cars off 24–48.', why: 'Penetrating sealers protect from within the pores, so a second pass fills what the first missed.', tip: 'The next day, sprinkle water on a few spots; if it soaks in somewhere, give that area another light coat.', ok: 'Water sprinkled on the cured slab beads up evenly everywhere.', v: { cam: [3.4, 2.6, 5.2], at: [0, 0, 2.2], hi: ['coat2'], show: ['coat2'], hide: ['tape', 'sprayer'] } },
      ],
      learn: {
        how: 'Concrete is full of tiny pores that wick in water, salt and oil. Silane and siloxane sealers soak into those pores and react to leave a water-repellent lining, so water beads up but the slab can still breathe. They barely change the look and don’t wear off with traffic like a film-forming acrylic sealer does.',
        specs: [['Wait after pour', '28 days'], ['Reseal', 'When water stops beading: often 3–10 yrs penetrating, 1–3 acrylic'], ['Coverage', '≈ 100–200 ft²/gal, see label'], ['Feet / cars back on', '4–6 hrs / 24–48 hrs'], ['Dry time before sealing', '24–48 hrs after washing']],
        terms: [['Penetrating sealer', 'Soaks in and repels water; no shiny film.'], ['Acrylic sealer', 'Forms a film; adds sheen, wears faster.'], ['Control joint', 'Cut groove where the slab is meant to crack.'], ['Efflorescence', 'White salt bloom from water moving through concrete.'], ['Surface cleaner', 'Pressure-washer attachment with a spinning bar under a round hood.']],
        mistakes: ['Sealing damp concrete.', 'Letting sealer puddle.', 'Wand-washing in stripes.', 'Washing degreaser into the storm drain.'],
        tips: ['Test water beading each spring; when water soaks in again, it’s time to reseal.', 'Use a degreaser that’s safe for lawns near the edges.'],
      },
      pro: 'The slab is heaving or sunken (mudjacking or replacement), or large areas are scaling.',
      tricks: [['Water-drop test', 'Sprinkle water on the slab: if it darkens the concrete quickly, it needs sealing; if it beads, it doesn’t.'], ['Poultice old oil', 'Degreaser mixed with kitty litter, covered overnight, pulls out old stains that scrubbing won’t.'], ['Rent the surface cleaner', 'A 15–20″ surface cleaner does a driveway in a third of the time and leaves no stripes.'], ['Work in shade', 'Sealer applied in hot sun flashes off before it soaks in; do it in the morning or evening.'], ['Exit plan', 'Start at the garage and finish at the street, and park the car on the street the night before.'], ['Buy enough', 'Measure the slab (length × width) and divide by the lower coverage number; running out mid-coat leaves a lap mark.']],
      refs: [['How to seal a concrete driveway (CretoSeal)', 'https://cretoseal.com/how-to-seal-a-concrete-driveway/'], ['IntraGuard water-based penetrating sealer (W. R. Meadows)', 'https://www.wrmeadows.com/intraguard-water-based-penetrating-sealing-compound/'], ['How to seal concrete (Minneapolis Concrete)', 'https://www.minneapolis-concrete.com/how-to-seal-concrete.html']],
    },
  ]);
})();

/* ---------------- Lawn: aerate & overseed, sprinkler valve, winterize ---------------- */
(function () {
  const XM = TB.XM;
  const grassM = (K, c) => K.bumpy(c || 0x6f9e4c, K.tex.speckle(), 0.03, { roughness: 1 });
  const soilM = (K, c) => K.bumpy(c || 0x6b4f36, K.tex.speckle(), 0.04, { roughness: 1 });
  // Raised turf block (grade at y = G) over [x0,x1]×[z0,z1], with an optional rectangular hole.
  const turf = (K, p, x0, x1, z0, z1, G, hole, gm) => {
    const g = gm || grassM(K);
    const s = soilM(K);
    const slab = (a, b, c, d) => {
      if (b - a < 0.001 || d - c < 0.001) return;
      K.box(p, [b - a, G - 0.025, d - c], s, [(a + b) / 2, (G - 0.025) / 2, (c + d) / 2], null, 0);
      K.box(p, [b - a, 0.025, d - c], g, [(a + b) / 2, G - 0.0125, (c + d) / 2], null, 0);
    };
    if (!hole) return slab(x0, x1, z0, z1);
    const [hx0, hx1, hz0, hz1] = hole;
    slab(x0, x1, z0, hz0);
    slab(x0, x1, hz1, z1);
    slab(x0, hx0, hz0, hz1);
    slab(hx1, x1, hz0, hz1);
  };
  // little grass tufts so the turf reads as grass up close
  const tufts = (K, p, x0, x1, z0, z1, y, n, color, h) => {
    const m = K.std(color || 0x5f9440, { roughness: 1 });
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < n; i++) K.cone(p, [0.012, h || 0.05, 4], m, [x0 + rnd() * (x1 - x0), y + (h || 0.05) / 2, z0 + rnd() * (z1 - z0)], [rnd() * 20 - 10, rnd() * 90, rnd() * 20 - 10]);
  };

  /* ===== Aerate & overseed: lawn block with a cut-away soil face ===== */
  TB.model(
    'xLawnAerate',
    XM.view({
      cam: [2.6, 1.5, 3.0],
      at: [0, 0.3, 0.4],
      assets: ['garden_sprinkler_01'],
      hidden: ['flags', 'aerator', 'holes', 'cores', 'spreader', 'seed', 'sprinkler', 'newGrass'],
    }),
    (K) => {
      const G = 0.3;
      const lawn = K.part('lawn', [0, 0, 0], null, 'Thin, compacted lawn');
      turf(K, lawn, -2, 2, -1.5, 1.5, G, null, grassM(K, 0x7e9a52));
      tufts(K, lawn, -1.9, 1.9, -1.4, 1.4, G, 260, 0x6a8f45, 0.045);
      // soil layers on the cut face (z = 1.5)
      const sec = K.part('soil', [0, 0, 0], null, 'Compacted soil (roots stay shallow)');
      K.box(sec, [4.0, 0.03, 0.004], K.std(0x5a4632, { roughness: 1 }), [0, G - 0.04, 1.502], null, 0);
      K.box(sec, [4.0, 0.08, 0.004], K.std(0x7b5c3e, { roughness: 1 }), [0, G - 0.1, 1.502], null, 0);
      K.box(sec, [4.0, 0.14, 0.004], K.std(0x8b6b4a, { roughness: 1 }), [0, G - 0.21, 1.502], null, 0);
      for (let x = -1.9; x < 1.9; x += 0.09) K.box(sec, [0.004, 0.035 + ((x * 31) % 3) * 0.008, 0.004], K.std(0xd8c7a0), [x, G - 0.06, 1.504], [0, 0, (x * 47) % 20], 0);
      const bare = K.part('bare', [0, 0, 0], null, 'Bare, thin patches');
      [[-0.8, 0.3, 0.35], [0.7, -0.4, 0.28], [0.2, 0.9, 0.22]].forEach(([x, z, r]) => K.cyl(bare, [r, r, 0.006, 24], soilM(K, 0x8a6a48), [x, G + 0.002, z]));
      const flags = K.part('flags', [0, 0, 0], null, 'Flags on sprinkler heads & shallow lines');
      [[-1.6, -1.1], [1.6, -1.1], [-1.6, 1.2], [1.6, 1.2], [0, 1.2]].forEach(([x, z]) => {
        K.cyl(flags, [0.002, 0.002, 0.45, 6], 'steel', [x, G + 0.22, z]);
        K.box(flags, [0.1, 0.07, 0.002], 'orange', [x + 0.05, G + 0.41, z], null, 0);
      });
      // holes + cores
      const holes = K.part('holes', [0, 0, 0], null, 'Core holes, 2–3″ deep, 2–3″ apart');
      const dark = K.std(0x2f2418, { roughness: 1 });
      const cores = K.part('cores', [0, 0, 0], null, 'Soil cores (leave them to break down)');
      const coreM = soilM(K, 0x7a5a3b);
      let k = 0;
      for (let x = -1.8; x < 1.8; x += 0.12)
        for (let z = -1.3; z < 1.4; z += 0.12) {
          k++;
          const jx = x + ((k * 13) % 5) * 0.008;
          const jz = z + ((k * 7) % 5) * 0.008;
          K.cyl(holes, [0.009, 0.009, 0.004, 8], dark, [jx, G + 0.001, jz]);
          if (k % 2) K.cyl(cores, [0.008, 0.008, 0.05, 6], coreM, [jx + 0.03, G + 0.008, jz + 0.02], [90, (k * 37) % 180, 0]);
        }
      for (let x = -1.8; x < 1.8; x += 0.12) K.cyl(holes, [0.009, 0.009, 0.07, 8], dark, [x + 0.02, G - 0.035, 1.498]);
      // core aerator (walk-behind)
      const aer = K.part('aerator', [-0.6, G, -0.3], null, 'Core aerator (rental)');
      const red = K.std(0xc9312a, { roughness: 0.45 });
      K.box(aer, [0.55, 0.28, 0.75], red, [0, 0.3, 0], null, 0.04);
      K.box(aer, [0.35, 0.22, 0.3], K.std(0x2a2c2f, { roughness: 0.5 }), [0, 0.55, 0.12], null, 0.03);
      const drum = K.part('tines', [0, 0.14, -0.15], aer, 'Hollow tines pull out plugs');
      K.cyl(drum, [0.11, 0.11, 0.5, 20], 'dark', [0, 0, 0], [0, 0, 90]);
      K.rep(6, (i) => K.rep(4, (j) => K.cyl(drum, [0.008, 0.006, 0.07, 8], 'steel', [-0.2 + j * 0.13, Math.cos(i) * 0.14, Math.sin(i) * 0.14], [i * 60 + 90, 0, 0])));
      [-1, 1].forEach((s) => K.cyl(aer, [0.1, 0.1, 0.05, 20], 'rubber', [s * 0.3, 0.1, 0.25], [0, 0, 90]));
      K.tube(aer, [[-0.22, 0.4, 0.35], [-0.22, 0.75, 0.75], [-0.22, 0.95, 0.95]], 0.014, 'steel');
      K.tube(aer, [[0.22, 0.4, 0.35], [0.22, 0.75, 0.75], [0.22, 0.95, 0.95]], 0.014, 'steel');
      K.cyl(aer, [0.016, 0.016, 0.48, 10], 'black', [0, 0.95, 0.95], [0, 0, 90]);
      // broadcast spreader
      const spr = K.part('spreader', [0.9, G, 0.5], null, 'Broadcast spreader');
      K.lathe(spr, [[0.04, 0.0], [0.2, 0.18], [0.22, 0.32], [0.0, 0.32]], K.std(0x2a6fb8, { roughness: 0.5 }), [0, 0.45, 0]);
      K.cyl(spr, [0.12, 0.12, 0.02, 20], 'black', [0, 0.38, 0]);
      [-1, 1].forEach((s) => K.cyl(spr, [0.13, 0.13, 0.05, 20], 'rubber', [s * 0.24, 0.13, 0], [0, 0, 90]));
      K.tube(spr, [[0, 0.5, -0.05], [0, 0.85, -0.45], [0, 0.95, -0.6]], 0.012, 'steel');
      K.cyl(spr, [0.012, 0.012, 0.4, 8], 'black', [0, 0.95, -0.6], [0, 0, 90]);
      const seed = K.part('seed', [0, 0, 0], null, 'Seed: 3–4 lb tall fescue per 1,000 ft²');
      const sm = K.std(0xd8c27a, { roughness: 0.8 });
      for (let i = 0; i < 260; i++) K.box(seed, [0.008, 0.003, 0.004], sm, [-1.9 + ((i * 53) % 380) / 100, G + 0.004, -1.4 + ((i * 29) % 280) / 100], [0, i * 37, 0], 0);
      const sp = K.part('sprinkler', [0.2, G, 0.1], null, 'Light, frequent watering');
      K.glb(sp, 'garden_sprinkler_01', { height: 0.12 }, [0, 0, 0]) || K.cyl(sp, [0.08, 0.1, 0.06, 16], 'yellow', [0, 0.03, 0]);
      const spray = K.group(sp, [0, 0.12, 0]);
      const wm = K.std(0x9fd0f5, { transparent: true, opacity: 0.35, roughness: 0.1 });
      K.rep(5, (i) => K.cone(spray, [0.08, 1.4, 8, true], wm, [Math.cos(i * 1.256) * 0.6, 0.35, Math.sin(i * 1.256) * 0.6], [Math.sin(i * 1.256) * 60, 0, -Math.cos(i * 1.256) * 60]));
      const ng = K.part('newGrass', [0, 0, 0], null, 'Thick new seedlings');
      tufts(K, ng, -1.9, 1.9, -1.4, 1.4, G, 420, 0x4f9a3a, 0.07);
      return {
        tick(t, fx) {
          if (fx === 'aerate') K.parts.aerator.position.x = -0.6 + Math.sin(t * 0.7) * 1.0;
          K.parts.tines.rotation.x = fx === 'aerate' ? -t * 3 : 0;
          if (fx === 'spread') K.parts.spreader.position.z = 0.5 + Math.sin(t * 0.8) * 0.7;
          spray.rotation.y = t * 0.8;
          spray.visible = fx === 'water';
        },
      };
    }
  );

  /* ===== In-ground sprinkler valve in a valve box ===== */
  TB.model(
    'xSprinklerValve',
    XM.view({ cam: [0.75, 1.0, 0.95], at: [0, 0.15, 0], hidden: ['newDiaphragm'] }),
    (K) => {
      const G = 0.32;
      const lawn = K.part('lawn', [0, 0, 0], null, 'Lawn');
      turf(K, lawn, -1.6, 1.6, -1.2, 1.2, G, [-0.22, 0.22, -0.16, 0.16]);
      tufts(K, lawn, -1.5, 1.5, -1.1, 1.1, G, 160);
      const green = K.std(0x2e5a35, { roughness: 0.7 });
      const box = K.part('box', [0, 0, 0], null, 'Valve box (12″ standard)');
      [-1, 1].forEach((s) => {
        K.box(box, [0.44, G, 0.012], green, [0, G / 2, s * 0.16], null, 0.003);
        K.box(box, [0.012, G, 0.32], green, [s * 0.22, G / 2, 0], null, 0.003);
      });
      K.box(box, [0.42, 0.04, 0.3], K.pbr('gravel_floor', [0.5, 0.5], {}, 'stone'), [0, 0.02, 0], null, 0.004);
      const lid = K.part('lid', [0, G + 0.006, 0], null, 'Lid (twist-lock bolt)');
      K.box(lid, [0.46, 0.012, 0.34], green, [0, 0, 0], null, 0.004);
      K.cyl(lid, [0.012, 0.012, 0.008, 6], 'steel', [0.15, 0.008, 0]);
      // pipe: 1″ PVC through the box, with an isolation ball valve upstream (left)
      const pipes = K.part('pipes', [0, 0, 0], null, '1″ PVC supply and zone line');
      const pvc = K.std(0xeceae3, { roughness: 0.45 });
      const Y = 0.1;
      K.cyl(pipes, [0.0167, 0.0167, 0.7, 20], pvc, [-0.42, Y, 0], [0, 0, 90]);
      K.cyl(pipes, [0.0167, 0.0167, 0.6, 20], pvc, [0.4, Y, 0], [0, 0, 90]);
      const iso = K.part('isoValve', [-0.17, Y, 0], null, 'Shutoff ball valve (or main shutoff)');
      K.cyl(iso, [0.026, 0.026, 0.07, 20], pvc, [0, 0, 0], [0, 0, 90]);
      K.sph(iso, 0.032, pvc, [0, 0, 0]);
      K.box(iso, [0.012, 0.05, 0.012], 'red', [0, 0.05, 0], null, 0.003);
      K.box(iso, [0.08, 0.01, 0.02], 'red', [0.03, 0.075, 0], null, 0.003);
      // valve body
      const valve = K.part('valve', [0.03, Y, 0], null, '1″ inline valve');
      const vb = K.std(0x232527, { roughness: 0.55 });
      K.box(valve, [0.15, 0.075, 0.09], vb, [0, 0.0, 0], null, 0.02);
      [-1, 1].forEach((s) => K.cyl(valve, [0.022, 0.022, 0.035, 20], vb, [s * 0.09, 0, 0], [0, 0, 90]));
      const bon = K.part('bonnet', [0.03, Y + 0.04, 0], null, 'Bonnet (top cover)');
      K.box(bon, [0.13, 0.03, 0.1], vb, [0, 0.0, 0], null, 0.015);
      K.cyl(bon, [0.012, 0.012, 0.06, 12], vb, [-0.03, 0.04, 0]);
      K.cyl(bon, [0.008, 0.008, 0.03, 12], 'grey', [-0.03, 0.08, 0]);
      K.box(bon, [0.035, 0.012, 0.02], 'grey', [-0.03, 0.1, 0], null, 0.004);
      const scr = K.part('screws', [0.03, Y + 0.058, 0], null, 'Six bonnet screws');
      [[-0.055, -0.04], [0, -0.042], [0.055, -0.04], [-0.055, 0.04], [0, 0.042], [0.055, 0.04]].forEach(([x, z]) => K.cyl(scr, [0.0055, 0.0055, 0.006, 10], 'steel', [x, 0, z]));
      const sol = K.part('solenoid', [0.07, Y + 0.075, 0], null, '24 V solenoid (¼ turn = manual on)');
      K.cyl(sol, [0.02, 0.02, 0.06, 20], 'black', [0, 0.03, 0]);
      K.cyl(sol, [0.012, 0.012, 0.012, 12], 'black', [0, 0.066, 0]);
      const wires = K.part('wires', [0, 0, 0], null, 'Zone wire + common, in grease caps');
      K.tube(wires, [[0.07, Y + 0.13, 0.008], [0.1, Y + 0.16, 0.05], [0.14, Y + 0.08, 0.1], [0.12, 0.05, 0.12]], 0.0025, 'black');
      K.tube(wires, [[0.07, Y + 0.13, -0.008], [0.11, Y + 0.17, 0.02], [0.16, Y + 0.08, 0.09], [0.15, 0.05, 0.12]], 0.0025, 'black');
      K.tube(wires, [[0.12, 0.05, 0.12], [0.0, 0.07, 0.13], [-0.2, 0.06, 0.13]], 0.003, 'red');
      K.tube(wires, [[0.15, 0.05, 0.12], [0.0, 0.05, 0.14], [-0.2, 0.05, 0.14]], 0.003, 'white');
      [[0.12, 0.05, 0.12], [0.15, 0.05, 0.12]].forEach((p) => K.cyl(wires, [0.012, 0.012, 0.035, 12], K.std(0x2c6fd1, { roughness: 0.5 }), p));
      const di = K.part('diaphragm', [0.03, Y + 0.025, 0], null, 'Old diaphragm + spring (grit under the seal)');
      K.cyl(di, [0.045, 0.045, 0.006, 28], K.std(0x2a2b2d, { roughness: 0.8 }), [0, 0, 0]);
      K.cyl(di, [0.02, 0.02, 0.012, 20], K.std(0x6b6c6e), [0, 0.008, 0]);
      K.rep(5, (i) => K.tor(di, [0.012, 0.0015], 'steel', [0, 0.02 + i * 0.006, 0], [90, 0, 0]));
      const deb = K.part('debris', [0.03, Y + 0.03, 0], null, 'Sand and grit');
      K.rep(7, (i) => K.sph(deb, 0.004, K.std(0x9b8461), [Math.cos(i) * 0.03, 0.002, Math.sin(i) * 0.03]));
      const nd = K.part('newDiaphragm', [0.03, Y + 0.025, 0], null, 'New diaphragm (same brand & model)');
      K.cyl(nd, [0.045, 0.045, 0.006, 28], K.std(0x15161a, { roughness: 0.6 }), [0, 0, 0]);
      K.cyl(nd, [0.02, 0.02, 0.012, 20], K.std(0x4f86d8), [0, 0.008, 0]);
      const head = K.part('head', [0.9, G, 0.3], null, 'Zone sprinkler head');
      K.cyl(head, [0.03, 0.03, 0.02, 16], 'black', [0, 0.005, 0]);
      const mist = K.std(0x9fd0f5, { transparent: true, opacity: 0.35, roughness: 0.1 });
      const jet = K.cone(head, [0.6, 0.35, 16, true], mist, [0, 0.2, 0], [180, 0, 0]);
      return {
        tick(t, fx) {
          jet.visible = fx === 'run' || fx === 'stuck';
          jet.scale.setScalar(0.9 + 0.1 * Math.sin(t * 8));
        },
      };
    }
  );

  /* ===== Blow out (winterize) a sprinkler system ===== */
  TB.model(
    'xSprinklerBlowout',
    XM.view({ cam: [2.4, 1.8, 3.4], at: [0, 0.5, 0.6], hidden: ['hose', 'compressor', 'insulate'] }),
    (K) => {
      const house = K.part('house', [0, 0, 0], null, 'House');
      XM.siding(K, house, -2.5, 2.5, 0.3, 2.6, -0.4, 0xcfc8b6);
      K.box(house, [5, 0.3, 0.05], K.bumpy(0x9a978e, K.tex.speckle(), 0.01), [0, 0.15, -0.38], null, 0.004);
      const lawn = K.part('lawn', [0, 0, 0], null, 'Lawn');
      K.box(lawn, [5, 0.04, 3.2], 'grass', [0, 0.0, 1.2], null, 0);
      tufts(K, lawn, -2.4, 2.4, -0.3, 2.7, 0.02, 200);
      const cu = 'copper';
      const pvb = K.part('pvb', [0.6, 0, -0.15], null, 'Pressure vacuum breaker (backflow)');
      K.cyl(pvb, [0.016, 0.016, 0.62, 16], cu, [-0.12, 0.31, 0]);
      K.cyl(pvb, [0.016, 0.016, 0.62, 16], cu, [0.12, 0.31, 0]);
      K.cyl(pvb, [0.016, 0.016, 0.1, 16], cu, [-0.12, 0.66, 0]);
      K.cyl(pvb, [0.016, 0.016, 0.1, 16], cu, [0.12, 0.66, 0]);
      const brass = 'brass';
      K.box(pvb, [0.2, 0.06, 0.06], brass, [0, 0.74, 0], null, 0.015);
      K.lathe(pvb, [[0.0, 0.0], [0.05, 0.0], [0.055, 0.03], [0.04, 0.09], [0.0, 0.1]], K.std(0x4e7d3c, { roughness: 0.5 }), [0, 0.77, 0]);
      [-0.05, 0.05].forEach((x) => K.cyl(pvb, [0.008, 0.008, 0.03, 10], brass, [x, 0.74, 0.04], [90, 0, 0]));
      const handles = K.part('pvbHandles', [0, 0, 0], null, 'Inlet & outlet ball valves');
      [-0.12, 0.12].forEach((x) => {
        K.sph(pvb, 0.03, brass, [0.6 + x - 0.6, 0.6, 0]);
        const h = K.group(handles, [0.6 + x, 0.6, -0.11]);
        K.box(h, [0.09, 0.012, 0.012], K.std(0x2a3d8f, { roughness: 0.5 }), [0.04, 0, 0.0], null, 0.003);
      });
      const main = K.part('mainValve', [-1.6, 0.9, -0.38], null, 'Irrigation shutoff (indoors or at the meter)');
      K.cyl(main, [0.016, 0.016, 0.4, 16], cu, [0, 0, 0.1], [90, 0, 0]);
      K.sph(main, 0.03, brass, [0, 0, 0.12]);
      K.box(main, [0.012, 0.012, 0.09], 'red', [0, 0.04, 0.12], null, 0.003);
      const port = K.part('blowPort', [0.95, 0.25, -0.15], null, 'Blowout port (hose-thread fitting)');
      K.cyl(port, [0.016, 0.016, 0.25, 16], cu, [-0.12, -0.12, 0], [0, 0, 90]);
      K.cyl(port, [0.016, 0.016, 0.2, 16], cu, [0, 0.0, 0]);
      K.cyl(port, [0.022, 0.022, 0.04, 12], brass, [0, 0.12, 0]);
      K.cyl(port, [0.024, 0.024, 0.02, 12], 'grey', [0, 0.15, 0]);
      const ctl = K.part('controller', [-0.6, 1.4, -0.38], null, 'Controller: run one zone at a time');
      K.box(ctl, [0.24, 0.3, 0.08], K.std(0xe8e7e2, { roughness: 0.5 }), [0, 0, 0.04], null, 0.02);
      K.box(ctl, [0.14, 0.07, 0.01], 'screen', [0, 0.05, 0.085], null, 0.003);
      K.cyl(ctl, [0.03, 0.03, 0.02, 20], 'grey', [0, -0.06, 0.085], [90, 0, 0]);
      const heads = K.part('heads', [0, 0, 0], null, 'Zone heads (farthest first)');
      const pts = [[-1.8, 2.0], [-0.4, 2.2], [1.0, 2.0], [2.0, 1.2]];
      pts.forEach(([x, z]) => {
        K.cyl(heads, [0.03, 0.03, 0.02, 16], 'black', [x, 0.03, z]);
        K.cyl(heads, [0.012, 0.012, 0.08, 10], 'dark', [x, 0.07, z]);
      });
      const mist = K.std(0xe9f4fb, { transparent: true, opacity: 0.35, roughness: 0.1 });
      const puffs = pts.map(([x, z]) => K.cone(null, [0.35, 0.5, 16, true], mist, [x, 0.36, z], [180, 0, 0]));
      const comp = K.part('compressor', [1.8, 0, 0.5], null, 'Tow-behind or large compressor (≥ 50 CFM ideal)');
      K.cyl(comp, [0.18, 0.18, 0.9, 24], K.std(0xd7342a, { roughness: 0.4 }), [0, 0.25, 0], [0, 0, 90]);
      K.box(comp, [0.4, 0.3, 0.3], K.std(0x2a2c2f, { roughness: 0.5 }), [0.0, 0.55, 0], null, 0.04);
      K.cyl(comp, [0.04, 0.04, 0.06, 16], 'chrome', [0.25, 0.55, 0.16], [90, 0, 0]);
      K.cyl(comp, [0.035, 0.035, 0.005, 20], 'white', [0.25, 0.55, 0.19], [90, 0, 0]);
      [-1, 1].forEach((s) => K.cyl(comp, [0.09, 0.09, 0.05, 20], 'rubber', [s * 0.35, 0.09, 0.2], [90, 0, 0]));
      const hose = K.part('hose', [0, 0, 0], null, 'Air hose with quick-connect');
      K.tube(hose, [[0.95, 0.42, -0.15], [1.05, 0.35, 0.1], [1.4, 0.05, 0.4], [1.6, 0.3, 0.55], [1.75, 0.55, 0.62]], 0.01, K.std(0x2a6fd1, { roughness: 0.5 }));
      const ins = K.part('insulate', [0.6, 0, -0.15], null, 'Insulated backflow cover');
      K.box(ins, [0.38, 0.95, 0.24], K.std(0x6f7d5e, { roughness: 0.95 }), [0, 0.48, 0], null, 0.04);
      return {
        tick(t, fx) {
          puffs.forEach((p, i) => {
            const on = fx === 'blow' ? i === 0 : fx === 'blowAll' ? i === Math.floor(t / 2) % 4 : false;
            p.visible = on;
            p.scale.setScalar(0.8 + 0.2 * Math.sin(t * 9 + i));
          });
        },
      };
    }
  );

  /* ---------------- Lawn guides ---------------- */
  TB.more('lawn', [
    {
      id: 'aerate-overseed',
      title: 'Aerate & overseed the lawn',
      model: 'xLawnAerate',
      level: 2,
      time: '½ day',
      cost: '$90–250',
      summary: 'Core aeration pulls plugs of soil to relieve compaction, and the holes make perfect seed beds. Do both on the same day in early fall for cool-season grass.',
      intro: { hi: ['lawn', 'bare', 'soil'] },
      safety: ['Flag sprinkler heads, valve boxes, and shallow cable or invisible-fence lines first; tines punch 3″ deep.', 'Aerators are heavy and jerk when tines bite: wear boots, keep both hands on, and get help loading it.', 'Call 811 if you’re unsure what’s buried.'],
      causes: [['Compacted soil', 'Foot traffic and clay squeeze out the air roots need.'], ['Thatch buildup', 'A spongy layer over ½″ blocks water.'], ['Thin turf', 'Old grass thins out; new seed fills it in.']],
      tools: ['Core aerator (rental)', 'Broadcast spreader', 'Grass seed matched to your lawn', 'Starter fertilizer', 'Marking flags', 'Leaf rake', 'Hose + sprinkler or timer', 'Screwdriver (soil moisture test)'],
      steps: [
        { t: 'Pick the time', d: 'For cool-season grass (fescue, bluegrass, ryegrass), aerate and seed from mid-August to early October; for warm-season grass (Bermuda, zoysia), late spring to early summer.', why: 'Warm soil and cool air give cool-season seedlings about two months to root before frost.', tip: 'Count back from your area’s usual first frost: you want at least 6–8 weeks of growing time after seeding.', ok: 'Your date falls in the window and the 10-day forecast has no heat wave.', v: { cam: [2.6, 1.5, 3.0], at: [0, 0.3, 0.4], hi: ['lawn', 'bare'] } },
        { t: 'Mow short and flag', d: 'Mow about 1″ lower than usual, bag the clippings, and flag every sprinkler head, valve box and shallow line.', why: 'Short grass lets seed reach the soil; flags save sprinkler heads from 3″ tines.', tip: 'Run each sprinkler zone for a minute and flag the heads as they pop up; it’s faster than hunting for them.', ok: 'The lawn is evenly short and every head and box has a flag.', v: { cam: [2.8, 1.8, 3.2], at: [0, 0.3, 0], hi: ['flags'], show: ['flags'] } },
        { t: 'Water a day ahead', d: 'Water about 1″ the day before (a tuna can on the lawn fills to the top at about 1″).', why: 'Tines pull clean, deep plugs from moist soil. In dry soil they just bounce.', tip: 'Push a screwdriver into the lawn: it should slide in 3″ easily. If not, water more; if mud squishes up, wait a day.', ok: 'The screwdriver slides 3″ into the soil without mud on it.', v: { cam: [2.6, 1.5, 3.0], at: [0, 0.3, 0.4], hi: ['soil'] } },
        { t: 'Aerate in two directions', d: 'Run the aerator over the whole lawn, then again at a right angle, especially on worn areas. Turn by lifting the tines or tipping the machine back, not by twisting it.', why: 'Two passes give about 20–40 holes per square foot, which is what makes a real difference.', tip: 'Aerators lurch when the tines bite. Hold the handle firmly, let it pull you, and raise the tines on hard surfaces and slopes.', ok: 'Plugs about 2–3″ long are scattered evenly, roughly a hand-width apart.', v: { cam: [3.0, 1.7, 3.0], at: [-0.4, 0.4, 0], hi: ['aerator', 'holes'], show: ['aerator', 'holes', 'cores'], fx: 'aerate' } },
        { t: 'Leave the cores', d: 'Leave the plugs on the lawn. They break down in a week or two and top-dress the seed.', why: 'Cores carry soil microbes that help break down thatch.', tip: 'Run the mower over dry cores a few days later to crumble them faster.', ok: 'Plugs lie across the lawn and the holes are open, not crushed.', v: { cam: [0.9, 0.85, 2.2], at: [0, 0.3, 1.2], hi: ['cores', 'holes'], hide: ['aerator'] } },
        { t: 'Spread the seed', d: 'Set the spreader to half rate and go over the lawn twice in crossing directions: about 3–4 lb tall fescue (or 1–2 lb bluegrass) per 1,000 ft². Double it on bare spots.', why: 'Two half-rate passes avoid stripes and misses.', tip: 'Fill the spreader on the driveway, not the lawn, so a spill doesn’t make a clump. Close the spreader when you stop or turn.', ok: 'Seeds are visible evenly in the holes and on the soil, about 15–20 per square inch on bare spots.', v: { cam: [2.6, 1.6, 3.0], at: [0.4, 0.4, 0.4], hi: ['spreader', 'seed'], show: ['spreader', 'seed'], fx: 'spread' } },
        { t: 'Fertilize and rake lightly', d: 'Apply starter fertilizer at the label rate, then drag a leaf rake upside down to work seed into the holes.', why: 'Seed must touch soil to sprout; starter fertilizer is higher in phosphorus for roots.', tip: 'Some states limit phosphorus fertilizer but allow it for new seedings; read the bag and local rules.', ok: 'Most seed is resting on soil or in holes, not sitting on grass blades.', v: { cam: [1.5, 1.0, 2.2], at: [0, 0.3, 0.6], hi: ['seed'], hide: ['spreader'] } },
        { t: 'Keep it moist', d: 'Water lightly once or twice a day so the top inch never dries, until the new grass is 2″ tall. Then water deeper, less often.', why: 'A sprouting seed that dries out once dies.', tip: 'Set a timer for short morning and early-afternoon runs. Puddles or runoff mean you’re watering too long; shorten each run.', ok: 'The soil surface looks dark and damp all day without puddles.', v: { cam: [2.6, 1.5, 3.0], at: [0, 0.4, 0.4], hi: ['sprinkler'], show: ['sprinkler'], fx: 'water' } },
        { t: 'First mow', d: 'Mow when the new grass reaches 3½–4″, with a sharp blade, taking off no more than a third.', why: 'A dull blade tears seedlings out by the roots.', tip: 'Mow when the grass is dry and skip sharp turns on the new patches.', ok: 'The cut tips look clean, not shredded, and no seedlings pulled up.', v: { cam: [2.6, 1.5, 3.0], at: [0, 0.3, 0.4], hi: ['newGrass'], show: ['newGrass'], hide: ['sprinkler', 'seed', 'cores', 'bare', 'flags', 'holes'] } },
      ],
      learn: {
        how: 'Roots need air as much as water. Compacted soil has its pore spaces crushed, so roots stay shallow and grass thins. Core aeration pulls out plugs, letting air, water and fertilizer reach the root zone, and gives seed a protected pocket of soil to sprout in.',
        specs: [['Hole depth', '2–3″'], ['Hole density', '20–40 per ft² (two passes)'], ['Tall fescue overseed', '3–4 lb / 1,000 ft²'], ['Kentucky bluegrass overseed', '1–2 lb / 1,000 ft²'], ['Germination', 'Rye 5–10 days, fescue 7–14, bluegrass 14–30'], ['First mow', 'At 3½–4″']],
        terms: [['Core aeration', 'Removing plugs of soil with hollow tines.'], ['Thatch', 'Layer of dead stems between grass and soil.'], ['Overseeding', 'Sowing seed into existing turf.'], ['Starter fertilizer', 'Feed made for new seedlings, higher in phosphorus.'], ['Pre-emergent', 'Weed killer that stops seeds from sprouting, including grass seed.']],
        mistakes: ['Spike aerators (they push soil tighter instead of removing it).', 'Pre-emergent weed killer within about 8 weeks (it stops grass seed too).', 'Letting the seed dry out.'],
        tips: ['Buy seed with a recent test date and less than 0.5% weed seed.', 'Rent the aerator with a neighbor and split the cost.'],
      },
      pro: 'The lawn is large, on a steep slope, or you want slit-seeding for a full renovation.',
      tricks: [['Tuna-can gauge', 'An empty tuna can is about 1″ deep; time how long your sprinkler takes to fill it.'], ['Split the rental', 'Aerators rent by the half day; book with a neighbor and do both lawns.'], ['Seed tag check', 'Read the tag: recent test date, high germination, under 0.5% weed seed, no “other crop” surprises.'], ['Flag by running zones', 'Turning on each sprinkler zone shows every head instantly for flagging.'], ['Leaf patrol', 'Rake or mulch-mow fallen leaves gently every few days; a leaf mat smothers seedlings.'], ['Hold the weed killer', 'Skip weed-and-feed and pre-emergents until the new grass has been mowed 3–4 times.']],
      refs: [['Lawn aeration and overseeding (University of Illinois Extension)', 'https://extension.illinois.edu/blogs/good-growing/2020-09-10-lawn-aeration-and-overseeding'], ['Seeding a fall lawn (K-State Research and Extension, Johnson County)', 'https://www.johnson.k-state.edu/programs/lawn-garden/agent-articles-fact-sheets-and-more/agent-articles/lawns/seeding-fall-lawn.html'], ['Aerating lawns (Iowa State University Extension)', 'https://yardandgarden.extension.iastate.edu/encyclopedia/aerating-lawns']],
    },
    {
      id: 'sprinkler-valve',
      title: 'Fix a sprinkler valve that won’t shut off',
      model: 'xSprinklerValve',
      level: 2,
      time: '30–60 min',
      cost: '$10–40',
      summary: 'A zone that keeps running (or never turns on) is almost always the valve: grit under the diaphragm or a failed solenoid. Both are replaceable in the valve box without cutting pipe.',
      intro: { hi: ['valve', 'solenoid'], fx: 'stuck' },
      safety: ['Shut off water to the system before opening the valve.', 'Controllers run 24 V AC, safe to touch, but unplug the controller before splicing wires.', 'Valve boxes can hide wasps, spiders and snakes; open the lid with a screwdriver, not your fingers.'],
      causes: [['Debris under the diaphragm', 'Grit holds the seal open: water trickles or runs constantly.'], ['Torn diaphragm', 'Water bypasses it and the valve won’t close.'], ['Bad solenoid or wire', 'Zone never turns on, or stays on electrically.']],
      tools: ['Screwdriver (bonnet screws)', 'Replacement diaphragm kit (same brand & model)', 'Replacement solenoid (if needed)', 'Multimeter', 'Waterproof grease-cap wire connectors', 'Rag and small brush'],
      steps: [
        { t: 'Narrow it down', d: 'Turn the controller off. If the zone keeps running, the problem is in the valve, not the controller or wiring.', why: 'With no signal, a healthy valve must close. One that stays open is mechanically stuck.', tip: 'If one low head trickles for a few minutes after a zone stops, that’s just pipe draining downhill, not a bad valve. A check-valve head fixes it.', ok: 'You know whether the zone stops with the controller off (electrical issue) or keeps running (valve issue).', v: { cam: [1.8, 1.4, 1.6], at: [0.4, 0.3, 0.1], hi: ['head', 'valve'], fx: 'stuck' } },
        { t: 'Shut off the water', d: 'Close the shutoff for the irrigation system (often in the basement or at the backflow device) or the isolation valve in the box.', why: 'The valve is under full line pressure; opening it live sprays grit everywhere.', tip: 'Run the zone from the controller for a moment after shutting off; if it sputters and stops, you closed the right valve.', ok: 'No water flows when you run the zone.', v: { cam: [0.6, 0.85, 0.8], at: [-0.1, 0.12, 0], hi: ['isoValve'], rt: { isoValve: [0, 90, 0] } } },
        { t: 'Open the box', d: 'Lift the lid with a screwdriver and scoop out dirt around the valve so nothing falls in when you open it.', why: 'Dirt falling into an open valve is how most of these problems start.', tip: 'Snap a photo of the valve and wire colors now; it’s your map for putting it back.', ok: 'The valve top and wires are clean and visible.', v: { cam: [0.75, 1.0, 0.95], at: [0, 0.15, 0], hi: ['lid', 'box'], mv: { lid: [0.55, 0.0, 0.3] }, hide: ['lid'] } },
        { t: 'Check the solenoid', d: 'Turn the solenoid (the black cylinder with two wires) ¼ turn counterclockwise and back. If the valve still leaks through, unscrew the solenoid and check its plunger and spring for grit.', why: 'A stuck plunger holds the valve open like a manual-on switch.', tip: 'Keep the tiny spring and plunger in your palm; they’re easy to drop into the gravel. Rinse them in clean water.', ok: 'The plunger slides freely in and out with its spring pushing it back.', v: { cam: [0.45, 0.6, 0.45], at: [0.07, 0.2, 0], hi: ['solenoid'], mv: { solenoid: [0, 0.08, 0] } } },
        { t: 'Remove the bonnet', d: 'Back out the bonnet screws and lift the bonnet (the valve’s top cover) straight up. Note how the spring and diaphragm sit.', why: 'Keep parts in order on a rag; the spring and diaphragm only go in one way.', tip: 'Some bonnets are a big threaded ring instead of screws; turn it counterclockwise by hand or with a strap wrench.', ok: 'The bonnet is off and you can see the rubber diaphragm and spring.', v: { cam: [0.45, 0.6, 0.45], at: [0.03, 0.15, 0], hi: ['bonnet', 'screws'], mv: { solenoid: [0, 0.25, 0], bonnet: [0, 0.18, 0], screws: [0, 0.2, 0] }, tool: { id: 'screwdriver', at: [0.085, 0.158, -0.04], rot: [0, 0, 0], anim: 'turn' } } },
        { t: 'Clean and inspect', d: 'Lift out the diaphragm and spring. Rinse grit out of the valve body and seat; check the diaphragm for tears, stiffness and a clear bleed hole.', why: 'Most valves only need cleaning. A torn or rock-hard diaphragm gets replaced.', tip: 'Clear the tiny bleed hole in the diaphragm with a thin wire; a speck there is a classic cause of a valve that won’t close.', ok: 'The seat is clean, the bleed hole is open, and you’ve decided whether to reuse or replace the diaphragm.', v: { cam: [0.4, 0.55, 0.4], at: [0.03, 0.13, 0], hi: ['diaphragm', 'debris'], mv: { diaphragm: [0, 0.1, 0] }, hide: ['debris'] } },
        { t: 'Fit the new diaphragm', d: 'Seat the new diaphragm (same brand and model) with its alignment tab in the same spot, then the spring, then the bonnet. Tighten the screws evenly in a cross pattern.', why: 'Uneven screws pinch the diaphragm edge and cause a slow leak.', tip: 'Snug each screw a little at a time, crossing from one to the opposite, then stop; overtightening cracks plastic bonnets.', ok: 'The bonnet sits flat all around with no gap.', v: { cam: [0.45, 0.6, 0.45], at: [0.03, 0.14, 0], hi: ['newDiaphragm', 'bonnet'], show: ['newDiaphragm'], hide: ['diaphragm'], mv: { bonnet: [0, 0, 0], screws: [0, 0, 0], solenoid: [0, 0, 0] }, tool: { id: 'screwdriver', at: [0.085, 0.158, 0.04], rot: [0, 0, 0], anim: 'turn' } } },
        { t: 'Test it', d: 'Open the water slowly. Run the zone from the controller, then turn it off; the heads should stop within a few seconds. Make sure wire splices are in waterproof grease-filled connectors.', why: 'If it still won’t close, check that the solenoid is screwed in fully and the bleed hole and seat are clear; a damaged seat means replacing the valve.', tip: 'Open the supply slowly over 10–20 seconds to avoid a pressure surge (water hammer).', ok: 'The zone starts on command and the heads stop within a few seconds of turning it off.', v: { cam: [1.8, 1.4, 1.6], at: [0.4, 0.3, 0.1], hi: ['head', 'wires'], show: ['lid'], mv: { lid: [0, 0, 0] }, rt: { isoValve: [0, 0, 0] }, fx: 'run' } },
      ],
      learn: {
        how: 'Sprinkler valves are pilot-operated. Water fills the chamber above the diaphragm through a tiny bleed hole, and because the top has more area, it holds the diaphragm shut. When the solenoid opens, that water vents downstream, pressure above drops, and line pressure lifts the diaphragm. A speck of grit in the bleed hole or on the seat throws the balance off.',
        specs: [['Solenoid', '24 V AC, ≈ 20–60 Ω'], ['Common wire', 'Usually white, shared by all valves'], ['Bonnet screws', '4–6, tighten in a cross pattern'], ['Shutoff after controller stops', 'Within a few seconds']],
        terms: [['Diaphragm', 'Rubber seal that opens and closes the valve.'], ['Bonnet', 'The valve’s top cover.'], ['Solenoid', 'Electromagnet that vents the pilot chamber.'], ['Flow control', 'Handle that limits how far the diaphragm opens.'], ['Low-head drainage', 'Water draining out of the lowest head after a zone stops.']],
        mistakes: ['Opening the valve without shutting off the water.', 'Buying the wrong brand of diaphragm.', 'Splicing wires with plain wire nuts underground.'],
        tips: ['A multimeter across the solenoid leads should read about 20–60 Ω; open or zero means it’s dead.', 'Photo the valve before you take it apart.'],
      },
      pro: 'The valve body is cracked, several zones misbehave at once, or you need to locate a cut wire underground.',
      tricks: [['Ohm test first', 'Set a multimeter to ohms and touch the solenoid wires: 20–60 Ω is healthy, no reading means a dead coil.'], ['Bring the old part', 'Take the old diaphragm or solenoid to the store; valve models look alike but parts don’t swap.'], ['Grease caps only', 'Use gel-filled waterproof connectors on every buried splice; plain wire nuts corrode in a season.'], ['Flush after repairs', 'Remove one head on the zone and run water briefly to blow out grit that would land right back in the valve.'], ['Manual-run check', 'Turning the solenoid ¼ turn counterclockwise runs the zone by hand, a quick way to tell a valve fault from a wiring fault.'], ['Low head, not leak', 'A head that dribbles for minutes after shutoff is draining pipe, not a bad valve.']],
      refs: [['Irrigation troubleshooting guide (Rain Bird)', 'https://www.rainbird.com/sites/default/files/media/documents/2018-05/IrrigationTroubleshootingGuide.pdf'], ['Fix sprinklers that won’t turn off (LawnsGuide)', 'https://lawnsguide.com/lawn-care/fix-sprinklers-wont-turn-off-stuck-solenoid'], ['How to repair a sprinkler (Home Depot)', 'https://www.homedepot.com/c/ah/how-to-repair-a-sprinkler/9ba683603be9fa5395fab901f541f93d']],
    },
    {
      id: 'winterize-sprinklers',
      title: 'Winterize (blow out) a sprinkler system',
      model: 'xSprinklerBlowout',
      level: 2,
      time: '1–2 hrs',
      cost: '$0–80 (compressor rental)',
      summary: 'Water left in buried pipes and the backflow preventer freezes and splits them. Shut off the water and push it out zone by zone with compressed air, using lots of air volume and low pressure.',
      intro: { hi: ['pvb', 'heads'] },
      safety: ['Wear safety glasses. Never stand over a sprinkler head or fitting while air is on.', 'Never exceed 50 psi on PVC or 30 psi on poly pipe; high pressure blows fittings apart.', 'Always have a zone open when the compressor is connected; blowing into closed valves overheats and damages them.'],
      causes: [['Freezing water expands ~9%', 'Enough to split pipe, heads and the backflow preventer.'], ['Low spots hold water', 'Draining alone often leaves water in dips.'], ['Exposed backflow', 'The above-ground brass freezes first.']],
      tools: ['Air compressor (ideally 50+ CFM; a 10–20 gal shop unit works for small systems in short bursts)', 'Air hose + quick-connect adapter for the blowout port', 'Safety glasses', 'Adjustable wrench', 'Flat screwdriver (test cocks)', 'Insulated backflow cover'],
      steps: [
        { t: 'Shut off the water', d: 'Close the irrigation shutoff (in the basement or at the meter) and turn the controller to off or rain mode. Open the drain cap on the indoor line if there is one.', why: 'Air can’t push water out against a live supply.', tip: 'Put a bucket under the drain cap before you open it, and leave it open over the winter.', ok: 'Running a zone produces only a short sputter, then nothing.', v: { cam: [-0.6, 1.3, 1.2], at: [-1.6, 0.9, -0.3], hi: ['mainValve'], rt: { mainValve: [0, 90, 0] } } },
        { t: 'Close the backflow valves', d: 'Turn both ball-valve handles on the backflow preventer (the brass assembly above ground) a quarter turn so they sit across the pipe.', why: 'This keeps compressed air out of the backflow device, which isn’t built for it.', tip: 'Handle across the pipe means closed; handle in line with the pipe means open.', ok: 'Both handles sit at right angles to the pipe.', v: { cam: [1.3, 1.0, 0.9], at: [0.6, 0.6, -0.15], hi: ['pvbHandles', 'pvb'], rt: { pvbHandles: [0, 90, 0] } } },
        { t: 'Connect the compressor', d: 'Thread the adapter onto the blowout port, connect the air hose, and set the compressor regulator to 50 psi (30 for flexible poly pipe).', why: 'You want air volume (CFM, cubic feet per minute), not pressure. The regulator protects pipes and fittings.', tip: 'Wrap the adapter threads with plumber’s tape; an air leak there wastes volume you need.', ok: 'The regulator gauge reads your target and the connection doesn’t hiss.', v: { cam: [2.4, 1.2, 1.8], at: [1.3, 0.4, 0.2], hi: ['compressor', 'hose', 'blowPort'], show: ['compressor', 'hose'] } },
        { t: 'Open the farthest zone', d: 'At the controller, manually start the zone farthest from the compressor. Never blow air with all zones closed.', why: 'Clearing far zones first pushes water out of the most pipe with the fewest passes.', tip: 'Start the zone before opening the air valve so the solenoid valve is already open when air arrives.', ok: 'The controller shows the zone running.', v: { cam: [0.2, 1.5, 0.8], at: [-0.6, 1.4, -0.35], hi: ['controller'] } },
        { t: 'Blow it until it mists', d: 'Slowly open the air valve. Water sprays, then sputters, then turns to a fine mist. Close the air and move on as soon as it mists, about 2 minutes.', why: 'Running heads dry with no water to cool their gears damages them. Short repeated cycles beat one long one.', tip: 'Stand back and to the side of the heads; they can launch grit. If a head never mists, check it for a clog.', ok: 'The heads on this zone spray only a fine mist.', v: { cam: [0.2, 1.6, 4.2], at: [-0.6, 0.3, 1.6], hi: ['heads'], fx: 'blow' } },
        { t: 'Work through every zone', d: 'Repeat for each zone, moving toward the compressor, then go around once more for a second short pass.', why: 'The second pass catches water that drained back into low spots.', tip: 'Let the compressor tank recover between zones; small compressors work if you run short bursts.', ok: 'Every zone produces only mist on the second pass.', v: { cam: [2.4, 1.8, 3.4], at: [0, 0.3, 1.4], hi: ['heads', 'controller'], fx: 'blowAll' } },
        { t: 'Disconnect and drain the backflow', d: 'Turn off the compressor and bleed the hose before disconnecting. Leave the backflow ball valves half-open (45°) and open the small test cocks a quarter turn.', why: 'Half-open ball valves let water drain from inside the ball that would otherwise freeze and crack it.', tip: 'Use a flat screwdriver on the test cocks; leave them open until spring.', ok: 'All handles sit at 45° and the test cocks are open.', v: { cam: [1.3, 1.0, 0.9], at: [0.6, 0.6, -0.15], hi: ['pvbHandles', 'pvb'], hide: ['hose', 'compressor'], rt: { pvbHandles: [0, 45, 0] } } },
        { t: 'Insulate the backflow', d: 'Slip an insulated cover over the backflow preventer and set the controller to off for the winter.', why: 'The exposed brass is the part most likely to freeze, even when drained.', tip: 'In spring, close the test cocks and ball valves first, then open the supply slowly to avoid water hammer.', ok: 'The backflow device is fully covered and the controller shows off.', v: { cam: [1.6, 1.2, 1.4], at: [0.6, 0.5, -0.15], hi: ['insulate'], show: ['insulate'] } },
      ],
      learn: {
        how: 'Water expands about 9% as it freezes, and pipes buried 6–12″ deep are well within frost range in cold climates. Compressed air drives water out through the open heads. Lots of air at low pressure pushes water out like a piston; high pressure with little volume just bubbles through and can blow apart glued fittings.',
        specs: [['Max pressure, rigid PVC', '50 psi'], ['Max pressure, flexible poly', '30 psi'], ['Air per cycle', '≈ 2 minutes, until mist'], ['Passes', '2 per zone'], ['Compressor', '≥ 50 CFM ideal; smaller units in short bursts']],
        terms: [['PVB', 'Pressure vacuum breaker, a common backflow preventer.'], ['Backflow preventer', 'Device that stops lawn water flowing back into drinking water.'], ['Blowout port', 'Fitting downstream of the backflow for connecting air.'], ['Test cocks', 'Small valves on the backflow for testing and draining.'], ['CFM', 'Cubic feet per minute, air volume.']],
        mistakes: ['Blowing air through the backflow preventer.', 'Running air with no zone open.', 'Standing over heads while blowing.', 'Leaving the compressor on one zone until the heads run dry and hot.'],
        tips: ['Blow out before the first hard freeze, not after.', 'In spring, open the supply slowly to avoid water hammer.'],
      },
      pro: 'You only have a small shop compressor and a large system, the backflow is inside a vault, or local code requires a certified tester for the backflow device.',
      tricks: [['Rent the right compressor', 'A towable 100+ CFM rental clears a big system in an hour; a small shop unit can take all afternoon.'], ['Label zones on the controller', 'Write which zone is farthest while you’re out there; next year goes twice as fast.'], ['Two short passes', 'Two 1–2 minute passes per zone beat one long one and keep heads cool.'], ['Leave the drain open', 'Leave the indoor drain cap open all winter so trapped water can escape.'], ['Spring start-up order', 'Close test cocks, close ball valves, open the supply slowly, then open the backflow valves one at a time.'], ['Check for leaks in spring', 'Run each zone and look for geysers or soggy spots; that’s where freeze damage shows up.']],
      refs: [['Blow out your sprinkler system (Rain Bird)', 'https://www.rainbird.com/homeowners/blog/blow-out-your-sprinkler-system'], ['How to blow out a sprinkler system (Coastal Mist Irrigation)', 'https://coastalmistirrigation.com/how-to-blow-out-sprinkler-system/'], ['How to winterize a sprinkler system (LawnLove)', 'https://lawnlove.com/blog/winterize-sprinkler-system/']],
    },
  ]);
})();
