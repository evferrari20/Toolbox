/* Tool library. Every tool is modeled at real proportions with 1 unit = 30 cm,
   working point at the origin and working axis along +Y. Steps place them with
   {tool: {id, at, rot, scale, anim}}. */
(function () {
  const T = TB.tool;

  // Flat profile lying in the XZ plane, thickness along Y, centered on y = 0.
  function flat(K, parent, pts, thick, mat, pos, bevel, holes) {
    const g = K.group(parent, pos || [0, 0, 0]);
    K.ext(g, pts, thick, mat, [0, thick / 2, 0], [90, 0, 0], bevel == null ? Math.min(0.004, thick * 0.2) : bevel, holes);
    return g;
  }
  // Smooth outline through control points (Catmull-Rom), returned as a polyline.
  function smooth(pts, n) {
    const c = new THREE.SplineCurve(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    return c.getPoints(n || 64).map((p) => [p.x, p.y]);
  }
  // Ruler texture for tape blades.
  let rulerTex;
  function ruler() {
    if (rulerTex) return rulerTex;
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = '#f2c230';
    g.fillRect(0, 0, 1024, 64);
    g.fillStyle = '#1b1b1b';
    for (let i = 0; i <= 128; i++) {
      const x = i * 8;
      const h = i % 16 === 0 ? 30 : i % 8 === 0 ? 22 : i % 4 === 0 ? 16 : 9;
      g.fillRect(x, 0, 1.5, h);
      if (i % 16 === 0 && i) {
        g.font = 'bold 22px sans-serif';
        g.fillText(String(i / 16), x + 3, 56);
      }
    }
    rulerTex = new THREE.CanvasTexture(c);
    rulerTex.encoding = THREE.sRGBEncoding;
    return rulerTex;
  }

  /* 8″ adjustable wrench: forged head, sliding jaw, knurled worm, I-beam handle. */
  T('adjWrench', '8″ adjustable wrench', (K, o) => {
    const open = o.open || 0.055;
    const head = smooth(
      [
        [0.14, 0.032],
        [0.09, 0.05],
        [0.03, 0.075],
        [-0.04, 0.07],
        [-0.085, 0.05],
        [-0.095, open / 2 + 0.006],
      ],
      40
    ).concat([
      [-0.09, open / 2],
      [0.006, open / 2],
      [0.006, -open / 2 - 0.012],
      [0.02, -0.05],
    ]).concat(smooth([[0.04, -0.062], [0.1, -0.048], [0.14, -0.032]], 20));
    flat(K, null, head, 0.044, 'toolSteel');
    // handle with rounded end and hang hole
    const hEnd = 0.66;
    const handle = [[0.13, 0.032], [hEnd - 0.03, 0.026]]
      .concat(K.circle(hEnd - 0.03, 0, 0.026, 18, Math.PI / 2, -Math.PI / 2))
      .concat([[0.13, -0.032]]);
    flat(K, null, handle, 0.03, 'toolSteel', null, 0.006, [K.circle(hEnd - 0.032, 0, 0.011, 16).reverse()]);
    // raised I-beam rib
    flat(K, null, [[0.16, 0.012], [hEnd - 0.08, 0.009], [hEnd - 0.08, -0.009], [0.16, -0.012]], 0.036, 'toolSteel', null, 0.003);
    // sliding jaw
    const jaw = K.part('jaw', [0, 0, 0], null, 'Sliding jaw');
    flat(K, jaw, [[-0.09, -open / 2], [0.0, -open / 2], [0.0, -open / 2 - 0.03], [-0.03, -open / 2 - 0.042], [-0.075, -open / 2 - 0.028]], 0.04, 'toolSteel');
    // knurled worm gear
    const worm = K.part('worm', [0.025, 0, -open / 2 - 0.022], null, 'Worm screw');
    K.cyl(worm, [0.017, 0.017, 0.034, 32], 'knurled', [0, 0, 0], [0, 0, 90]);
    K.rep(7, (i) => K.tor(worm, [0.017, 0.003], 'toolSteel', [-0.014 + i * 0.0047, 0, 0], [0, 90, 0]));
    K.api = {
      tick(t) {
        worm.rotation.x = t * 2;
      },
    };
  });

  /* Screwdriver: fluted two-tone handle, chrome-vanadium shaft, Phillips or flat tip. */
  T('screwdriver', 'Screwdriver', (K, o) => {
    const shaftL = o.len || 0.33;
    const tipFlat = o.tip === 'flat';
    const g = K.group(null);
    if (tipFlat) {
      K.cyl(g, [0.011, 0.011, shaftL - 0.04, 24], 'toolSteel', [0, 0.04 + (shaftL - 0.04) / 2, 0]);
      const tip = K.cyl(g, [0.011, 0.004, 0.04, 4], 'blackOxide', [0, 0.02, 0], [0, 45, 0]);
      tip.scale.set(1.6, 1, 0.35);
    } else {
      K.cyl(g, [0.011, 0.011, shaftL - 0.03, 24], 'toolSteel', [0, 0.03 + (shaftL - 0.03) / 2, 0]);
      K.cone(g, [0.011, 0.03, 8], 'blackOxide', [0, 0.015, 0], [180, 22.5, 0]);
      K.rep(4, (i) => K.box(g, [0.022, 0.026, 0.003], 'black', [0, 0.014, 0], [0, i * 45, 0], 0));
    }
    const hy = shaftL;
    const prof = [[0, 0], [0.026, 0], [0.034, 0.03], [0.05, 0.09], [0.054, 0.19], [0.05, 0.28], [0.042, 0.31], [0, 0.315]];
    K.lathe(g, prof, o.color === 'yellow' ? 'gripYellow' : 'gripRed', [0, hy, 0], null, 40);
    K.rep(8, (i) => {
      const a = (i / 8) * Math.PI * 2;
      K.box(g, [0.012, 0.18, 0.012], 'gripBlack', [Math.cos(a) * 0.05, hy + 0.17, Math.sin(a) * 0.05], [0, -a / K.DEG, 0], 0.005);
    });
  });

  /* Hex (Allen) key: hexagonal bar with a 90° bend. Short arm goes into the screw. */
  T('hexKey', 'Hex key', (K, o) => {
    const r = o.r || 0.008;
    const shortL = 0.07;
    const longL = 0.26;
    K.cyl(null, [r, r, shortL, 6], 'blackOxide', [0, shortL / 2, 0]);
    K.tor(null, [r * 2, r, 90], 'blackOxide', [r * 2, shortL, 0], [0, 0, 90]);
    K.cyl(null, [r, r, longL, 6], 'blackOxide', [r * 2 + longL / 2, shortL + r * 2, 0], [0, 0, 90]);
  });

  /* Tongue-and-groove pliers with dipped grips; jawB pivots for the squeeze animation. */
  T('pliers', 'Tongue-and-groove pliers', (K) => {
    const a = K.part('jawA', [0, 0, 0], null, 'Fixed jaw');
    flat(K, a, smooth([[0, 0.02], [0.05, 0.03], [0.1, 0.02], [0.14, 0.012], [0.42, 0.03]], 30).concat([[0.42, 0.012], [0.14, -0.006], [0.06, 0.004], [0.0, 0.006]]), 0.022, 'toolSteel');
    K.box(a, [0.2, 0.026, 0.034], 'gripBlue', [0.33, 0, 0.02], [0, -4, 0], 0.012);
    const b = K.part('jawB', [0.12, 0.012, 0], null, 'Moving jaw');
    flat(K, b, smooth([[-0.12, -0.02], [-0.07, -0.03], [-0.02, -0.02], [0.02, -0.012], [0.3, -0.03]], 30).concat([[0.3, -0.012], [0.02, 0.006], [-0.06, -0.004], [-0.12, -0.006]]), 0.022, 'toolSteel');
    K.box(b, [0.2, 0.026, 0.034], 'gripBlue', [0.21, 0, -0.02], [0, 4, 0], 0.012);
    K.ccyl(null, [0.016, 0.05], 'chrome', [0.12, 0.006, 0]);
    K.rep(5, (i) => K.box(a, [0.004, 0.024, 0.01], 'blackOxide', [0.01 + i * 0.012, 0, 0.008], null, 0));
  });

  /* 16 oz claw hammer: forged head with curved claw, hickory handle. Origin = striking face. */
  T('hammer', '16 oz claw hammer', (K) => {
    const head = K.group(null, [0, 0, 0], [0, 0, 0]);
    K.ccyl(head, [0.042, 0.04, 40, 0.006], 'forged', [0, 0.02, 0]);
    K.cyl(head, [0.03, 0.042, 0.03, 40], 'forged', [0, 0.055, 0]);
    K.box(head, [0.06, 0.12, 0.055], 'forged', [0, 0.12, 0], null, 0.01);
    const claw = smooth([[-0.028, 0.16], [-0.02, 0.24], [0.0, 0.32], [0.03, 0.37]], 24).concat(smooth([[0.04, 0.36], [0.018, 0.3], [0.006, 0.23], [0.028, 0.16]], 24));
    K.ext(head, claw, 0.05, 'forged', [0, 0, -0.025], null, 0.004);
    K.box(head, [0.012, 0.2, 0.052], 'blackOxide', [0.0, 0.29, 0], [0, 0, -18], 0); // claw slot shadow
    const handle = smooth([[-0.035, 0.11], [-0.032, 0.3], [-0.03, 0.6], [-0.04, 0.95]], 30)
      .concat([[0.0, 0.98]])
      .concat(smooth([[0.04, 0.95], [0.03, 0.6], [0.032, 0.3], [0.035, 0.11]], 30));
    const hg = K.group(null, [0, 0.12, 0], [0, 0, 90]);
    K.ext(hg, handle.map(([x, y]) => [x, y - 0.11]), 0.032, 'hickory', [0, 0, -0.016], null, 0.008);
  });

  /* Cordless drill/driver: pistol body, keyless chuck, hex bit. Origin = bit tip, body up +Y. */
  T('drill', '18 V drill / driver', (K, o) => {
    const spin = K.part('spinner', [0, 0, 0], null, 'Chuck & bit');
    if (o.bit === 'drill') {
      K.cyl(spin, [0.009, 0.006, 0.16, 16], 'toolSteel', [0, 0.08, 0]);
      K.rep(10, (i) => K.tor(spin, [0.009, 0.0025], 'toolSteel', [0, 0.02 + i * 0.013, 0], [90, i * 30, 0]));
    } else {
      K.cone(spin, [0.007, 0.02, 4], 'toolSteel', [0, 0.01, 0], [180, 45, 0]);
      K.cyl(spin, [0.009, 0.009, 0.08, 6], 'toolSteel', [0, 0.06, 0]);
    }
    K.lathe(spin, [[0, 0], [0.025, 0], [0.04, 0.03], [0.045, 0.1], [0.04, 0.12], [0, 0.12]], 'gripBlack', [0, 0.1, 0]);
    K.cyl(spin, [0.046, 0.046, 0.04, 32], 'knurled', [0, 0.17, 0]);
    // body: drawn in XY (x forward/back, y up the axis) then stood so the bit points down
    const body = K.group(null, [0, 0.22, 0], [0, 0, 0]);
    const bodyOutline = smooth(
      [[-0.06, 0.0], [-0.07, 0.15], [-0.05, 0.3], [0.05, 0.33], [0.4, 0.3], [0.42, 0.22], [0.36, 0.18], [0.36, 0.1], [0.42, 0.0], [0.35, -0.1], [0.2, -0.06], [0.06, -0.06]],
      80
    );
    const bodyG = K.group(body, [0, 0, 0], [0, 0, 90]);
    K.ext(bodyG, bodyOutline.map(([x, y]) => [y - 0.1, -x]), 0.11, 'yellow', [0, 0, -0.055], null, 0.02);
    K.ext(bodyG, smooth([[0.05, 0.04], [0.1, 0.06], [0.28, 0.1], [0.32, 0.16], [0.1, 0.14], [0.03, 0.1]], 40).map(([x, y]) => [y - 0.1, -x]), 0.116, 'gripBlack', [0, 0, -0.058], null, 0.008);
    K.box(body, [0.14, 0.05, 0.16], 'black', [0.3, 0.45, 0], [0, 0, 0], 0.02);
    K.box(body, [0.04, 0.03, 0.03], 'red', [0.08, 0.17, 0], null, 0.008);
  });

  /* Non-contact voltage tester pen. Tip glows red when fx 'live'. */
  T('voltTester', 'Non-contact voltage tester', (K, o) => {
    K.lathe(null, [[0, 0], [0.012, 0.002], [0.018, 0.05], [0.02, 0.07], [0, 0.07]], K.std(0xf4f4f4, { transparent: true, opacity: 0.8, emissive: 0xff2a1a, emissiveIntensity: o.live ? 1.4 : 0 }));
    K.lathe(null, [[0, 0.07], [0.022, 0.07], [0.024, 0.3], [0.02, 0.48], [0, 0.49]], 'yellow');
    K.cyl(null, [0.0242, 0.0242, 0.12], 'black', [0, 0.36, 0]);
    K.box(null, [0.012, 0.2, 0.01], 'black', [0.026, 0.33, 0], null, 0.004);
    K.cyl(null, [0.008, 0.008, 0.01], 'ledR', [0, 0.2, 0.023], [90, 0, 0]);
  });

  /* 25 ft tape measure with printed blade. Origin = hook end. */
  T('tape', '25 ft tape measure', (K, o) => {
    const len = o.len || 0.8;
    const blade = K.box(null, [len, 0.003, 0.085], K.std(0xffffff, { map: ruler(), roughness: 0.4 }), [len / 2, 0, 0], null, 0);
    blade.material.map.repeat.set(len / 0.8, 1);
    K.box(null, [0.008, 0.03, 0.09], 'steel', [0.004, -0.012, 0], null, 0.002);
    const cs = K.group(null, [len + 0.13, 0.08, 0]);
    K.ccyl(cs, [0.15, 0.13, 40, 0.035], 'yellow', [0, 0, 0], [90, 0, 0]);
    K.ccyl(cs, [0.09, 0.135, 40, 0.01], 'gripBlack', [0, 0, 0], [90, 0, 0]);
    K.box(cs, [0.12, 0.05, 0.03], 'red', [0.02, 0.16, 0.0], null, 0.01);
  });

  /* Taping/putty knife: flexible steel blade, riveted handle. Origin = blade edge center. */
  T('puttyKnife', 'Taping knife', (K, o) => {
    const w = o.w || 0.5;
    flat(K, null, [[-w / 2, 0], [w / 2, 0], [0.06, 0.22], [-0.06, 0.22]], 0.004, 'toolSteel', null, 0.001);
    K.box(null, [0.13, 0.07, 0.03], 'steel', [0, 0.004, 0.24], null, 0.01);
    K.lathe(null, [[0, 0], [0.035, 0.0], [0.045, 0.12], [0.04, 0.3], [0, 0.31]], 'gripBlue', [0, 0, 0.26], [90, 0, 0]);
    K.rep(2, (i) => K.cyl(null, [0.008, 0.008, 0.035], 'chrome', [i ? 0.03 : -0.03, 0.004, 0.24]));
  });

  /* Caulk gun with tube. Origin = nozzle tip, gun extends +Y. */
  T('caulkGun', 'Caulk gun', (K) => {
    K.cone(null, [0.022, 0.18, 24], 'offwhite', [0, 0.09, 0], [180, 0, 0]);
    K.cyl(null, [0.06, 0.06, 0.62, 32], 'white', [0, 0.49, 0]);
    K.cyl(null, [0.061, 0.061, 0.2, 32], 'blue', [0, 0.5, 0]);
    K.box(null, [0.012, 0.66, 0.012], 'steel', [0.064, 0.5, 0], null, 0);
    K.box(null, [0.012, 0.66, 0.012], 'steel', [-0.064, 0.5, 0], null, 0);
    K.box(null, [0.16, 0.04, 0.05], 'steel', [0, 0.83, 0], null, 0.008);
    K.cyl(null, [0.008, 0.008, 0.4], 'chrome', [0, 1.0, 0]);
    K.box(null, [0.05, 0.03, 0.03], 'red', [0, 1.2, 0], null, 0.008);
    K.box(null, [0.06, 0.3, 0.05], 'red', [0, 0.92, -0.16], [-70, 0, 0], 0.02);
    K.box(null, [0.05, 0.24, 0.04], 'red', [0, 0.82, -0.12], [-60, 0, 0], 0.015);
  });

  /* 3/8″ drive ratchet with socket. Origin = socket mouth on the nut, axis +Y. */
  T('ratchet', '3/8″ ratchet & socket', (K, o) => {
    const s = o.socket || 0.055;
    K.ccyl(null, [s * 0.75, 0.12, 6, 0.004], 'chrome', [0, 0.06, 0], [0, 30, 0]);
    K.ccyl(null, [s * 0.8, 0.09, 32, 0.006], 'chrome', [0, 0.11, 0]);
    K.ccyl(null, [0.07, 0.05, 40, 0.012], 'chrome', [0, 0.18, 0]);
    K.cyl(null, [0.018, 0.018, 0.02], 'black', [0, 0.21, 0]);
    flat(K, null, [[0.03, 0.03], [0.6, 0.024]].concat(K.circle(0.6, 0, 0.024, 12, Math.PI / 2, -Math.PI / 2)).concat([[0.03, -0.03]]), 0.03, 'chrome', [0, 0.18, 0], 0.008);
    K.box(null, [0.28, 0.034, 0.05], 'gripBlack', [0.44, 0.18, 0], null, 0.015);
  });

  /* 4-way lug wrench. Origin = socket on lug nut, axis +Y. */
  T('lugWrench', '4-way lug wrench', (K) => {
    K.ccyl(null, [0.035, 0.08, 6, 0.004], 'blackOxide', [0, 0.04, 0]);
    const hub = 0.1;
    K.bar(null, [0, 0.08, 0], [0, hub, 0], 0.03, 'blackOxide');
    K.bar(null, [-0.6, hub, 0], [0.6, hub, 0], 0.025, 'blackOxide');
    K.bar(null, [0, hub, -0.6], [0, hub, 0.6], 0.025, 'blackOxide');
  });

  /* Flat pry bar. Origin = flat end. */
  T('flatBar', 'Flat pry bar', (K) => {
    flat(K, null, [[-0.05, 0], [0.05, 0], [0.04, 0.9], [-0.04, 0.9]], 0.012, 'blue', [0, 0, 0], 0.003, [K.circle(0, 0.8, 0.02, 12).reverse()]);
  });

  /* Plunger with flange. Origin = cup rim. */
  T('plunger', 'Flange plunger', (K) => {
    K.lathe(null, [[0.22, 0.0], [0.24, 0.02], [0.25, 0.12], [0.15, 0.22], [0.05, 0.26], [0, 0.27]], 'rubber');
    K.cyl(null, [0.07, 0.08, 0.12], 'rubber', [0, -0.05, 0]);
    K.cyl(null, [0.03, 0.03, 1.4], 'hickory', [0, 0.95, 0]);
  });

  /* Torpedo level. Origin = bottom center. */
  T('level', 'Level', (K, o) => {
    const len = o.len || 0.8;
    K.box(null, [len, 0.09, 0.05], K.std(0x2f7fd0, { metalness: 0.6, roughness: 0.35 }), [0, 0.045, 0], null, 0.008);
    K.box(null, [0.14, 0.05, 0.052], 'black', [0, 0.05, 0], null, 0.004);
    K.cyl(null, [0.012, 0.012, 0.1, 20], K.phys(0x9df27a, { transparent: true, opacity: 0.75, roughness: 0.05, clearcoat: 1 }), [0, 0.05, 0.02], [0, 0, 90]);
    K.sph(null, 0.006, 'white', [0, 0.06, 0.03]);
  });

  /* Utility knife. Origin = blade tip. */
  T('utilityKnife', 'Utility knife', (K) => {
    flat(K, null, [[0, 0], [0.07, 0.0], [0.08, 0.04], [0.02, 0.04]], 0.003, 'toolSteel', [0, 0, 0], 0.0005);
    flat(K, null, smooth([[0.06, -0.01], [0.2, -0.03], [0.42, -0.02], [0.45, 0.04], [0.4, 0.08], [0.08, 0.07]], 40), 0.05, 'yellow', [0.0, 0, 0], 0.012);
    flat(K, null, smooth([[0.18, -0.025], [0.38, -0.02], [0.4, 0.02], [0.2, 0.0]], 30), 0.054, 'gripBlack', [0, 0, 0], 0.006);
  });

  /* Shovel (round point). Origin = blade tip. */
  T('shovel', 'Round-point shovel', (K) => {
    const blade = smooth([[0, 0], [0.18, 0.12], [0.22, 0.4], [0.06, 0.44], [-0.06, 0.44], [-0.22, 0.4], [-0.18, 0.12]], 50);
    const g = K.group(null, [0, 0, 0], [0, 0, 0]);
    K.ext(g, blade, 0.01, 'blackOxide', [0, 0, 0], [0, 0, 0], 0.003);
    K.cyl(g, [0.04, 0.03, 0.14], 'blackOxide', [0, 0.5, 0.005]);
    K.cyl(g, [0.03, 0.03, 1.6], 'hickory', [0, 1.35, 0.005]);
    K.box(g, [0.18, 0.05, 0.05], 'gripBlack', [0, 2.15, 0.005], null, 0.02);
  });

  /* Wire brush. Origin = bristle face. */
  T('wireBrush', 'Wire brush', (K) => {
    K.box(null, [0.4, 0.06, 0.1], 'hickory', [0.1, 0.06, 0], null, 0.02);
    K.box(null, [0.28, 0.04, 0.08], K.bumpy(0xb8bec4, TB.tex.brushed(), 0.01, { metalness: 0.9, roughness: 0.5 }), [0.02, 0.02, 0], null, 0.004);
  });

  /* Paint roller. Origin = roller contact. */
  T('roller', '9″ paint roller', (K) => {
    K.cyl(null, [0.06, 0.06, 0.75, 32], K.bumpy(0xe9e3d6, TB.tex.weave(), 0.02, { roughness: 1 }), [0, 0.06, 0], [0, 0, 90]);
    K.tube(null, [[0.39, 0.06, 0], [0.42, 0.06, 0], [0.42, 0.25, 0], [0.0, 0.32, 0], [0.0, 0.5, 0]], 0.01, 'steel');
    K.lathe(null, [[0, 0], [0.03, 0], [0.035, 0.3], [0, 0.32]], 'gripYellow', [0, 0.5, 0]);
  });
})();

/* ---------- Photo-scanned tools (Poly Haven, CC0) ----------
   Each entry maps a scan onto the tool convention above. When the scan is loaded it
   replaces the procedural model; otherwise the procedural build is used.
   REAL = scale from meters to scene units (1 unit = 30 cm). */
(function () {
  const REAL = 1 / 0.3;
  const scan = (id, glb, fit, after) => {
    const t = TB.TOOLS[id];
    if (t) Object.assign(t, { glb, fit, after });
  };
  const add = (id, name, glb, fit, after) => TB.tool(id, name, null, { glb, fit, after });
  const flatWrench = { rots: [['x', -90], ['y', 90]], scale: REAL };

  scan('adjWrench', 'adjustable_wrench', Object.assign({ anchor: [0.08, 0.5, 0.5] }, flatWrench));
  add('pipeWrench', '14″ pipe wrench', 'pipe_wrench', Object.assign({ anchor: [0.08, 0.5, 0.5] }, flatWrench));
  add('comboWrench', 'Combination wrench', 'combination_wrench', { rots: [['y', 90]], scale: REAL, anchor: [0.06, 0.5, 0.5] });
  scan('ratchet', 'ratchet_wrench', Object.assign({ anchor: [0.07, 0.5, 0.5] }, flatWrench));
  scan('screwdriver', 'screwdriver', { rots: [['x', 180]], scale: REAL, anchor: [0.5, 0, 0.5] });
  add('flatScrewdriver', 'Flat screwdriver', 'flathead_screwdriver', { rots: [['x', 180]], scale: REAL, anchor: [0.5, 0, 0.5] });
  scan('pliers', 'tongue_groove_pliers', { rots: [['x', -90]], scale: REAL, anchor: [0.5, 0, 0.5] });
  add('linemans', 'Lineman’s pliers', 'pliers', { rots: [['z', 180]], scale: REAL, anchor: [0.5, 0, 0.5] });
  scan('hammer', 'wooden_hammer_01', { rots: [['z', 90]], scale: REAL, anchor: [0, 0, 0.5] });
  add('sledge', 'Sledgehammer', 'sledgehammer_01', { rots: [['z', 90]], scale: REAL, anchor: [0, 0, 0.5] });
  scan('drill', 'Drill_01', { rots: [['z', 90]], scale: REAL, anchor: [0.22, 0, 0.5] }, (K) => {
    const spin = K.part('spinner', [0, 0, 0], null, 'Bit');
    K.cone(spin, [0.009, 0.03, 4], 'toolSteel', [0, 0.015, 0], [180, 45, 0]);
  });
  scan('tape', 'measuring_tape_01', { scale: REAL, anchor: [0.5, 0, 0.5] });
  scan('plunger', 'plunger', { scale: REAL, anchor: [0.5, 0, 0.5] });
  scan('flatBar', 'crowbar_01', { rots: [['z', 180]], scale: REAL, anchor: [0.5, 0, 0.5] });
  scan('shovel', 'rusted_spade_01', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('handsaw', 'Hand saw', 'handsaw_wood', { rots: [['y', 90]], scale: REAL, anchor: [0.5, 0, 0.5] });
  add('hatchet', 'Hatchet', 'hatchet', { rots: [['z', 90]], scale: REAL, anchor: [0, 0, 0.5] });
  add('trowel', 'Hand trowel', 'trowel_01', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('tirePump', 'Floor pump', 'tire_pump', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('multimeter', 'Multimeter', 'retro_multimeter', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('oilCan', 'Oil can', 'small_oil_can_01', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('lubeSpray', 'Penetrating spray', 'lubricant_spray', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('gloves', 'Work gloves', 'garden_gloves_01', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('boltCutters', 'Bolt cutters', 'bolt_cutters_01', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('toolbox', 'Toolbox', 'metal_toolbox', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('extLadder', 'Extension ladder', 'ladder_sectioned_01', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('stepLadder', 'Step ladder', 'wooden_ladder', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('bucket', 'Bucket', 'wooden_bucket_01', { scale: REAL, anchor: [0.5, 0, 0.5] });
  add('wateringCan', 'Watering can', 'watering_can_metal_01', { scale: REAL, anchor: [0.5, 0, 0.5] });
})();
