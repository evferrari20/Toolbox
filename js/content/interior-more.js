/* interior-more: new guides for Walls, Doors, Floors and Furniture.
   All scenes are built in real meters (unit: 1), so the 3D tools appear at true size.
   Convention: floor at y = 0; walls face +z (the camera side) unless noted. */
(function () {
  const VIEW = (o) => Object.assign({ env: 'studio', unit: 1, tex: ['plank_flooring'], ground: { tex: 'plank_flooring', repeat: 4, radius: 4 } }, o);
  const IN = 0.0254;
  TB.IM = { VIEW, IN };

  /* =====================================================================
     WALLS
     ===================================================================== */

  // Wall panels around an optional rectangular opening, as boxes in the plane z (thin layer).
  // r = [x0, x1, y0, y1] wall extent; hole = [x0, x1, y0, y1] or null. Returns the group.
  function panels(K, parent, r, hole, z, mat, t) {
    t = t || 0.002;
    const g = K.group(parent, [0, 0, 0]);
    const B = (x0, x1, y0, y1) => x1 - x0 > 0.001 && y1 - y0 > 0.001 && K.box(g, [x1 - x0, y1 - y0, t], mat, [(x0 + x1) / 2, (y0 + y1) / 2, z], null, 0);
    if (!hole) {
      B(r[0], r[1], r[2], r[3]);
      return g;
    }
    B(r[0], hole[0], r[2], r[3]);
    B(hole[1], r[1], r[2], r[3]);
    B(hole[0], hole[1], r[2], hole[2]);
    B(hole[0], hole[1], hole[3], r[3]);
    return g;
  }
  // Same thing on the side wall (plane x = const, facing +x); r = [z0, z1, y0, y1].
  function sidePanels(K, parent, r, x, mat, t) {
    t = t || 0.002;
    return K.box(parent, [t, r[3] - r[2], r[1] - r[0]], mat, [x, (r[2] + r[3]) / 2, (r[0] + r[1]) / 2], null, 0);
  }

  /* ---- Paint a room: corner of a room with a window, outlet, baseboard ---- */
  TB.model(
    'paintRoom',
    VIEW({ cam: [2.3, 1.6, 5.0], at: [-0.3, 1.2, 0.3], hidden: ['dropCloth', 'tape', 'patches', 'cutIn', 'coat1', 'coat2', 'tray', 'pail', 'brush'] }),
    (K) => {
      const X0 = -1.8, X1 = 1.5, H = 2.44, ZS = 2.6;
      const WIN = [0.25, 1.05, 0.95, 2.0]; // glass opening
      const CAS = 0.064; // casing width
      const WOUT = [WIN[0] - CAS, WIN[1] + CAS, WIN[2] - 0.11, WIN[3] + CAS]; // casing + apron footprint
      const oldC = K.std(0xd9cdb1, { roughness: 0.93 });
      const newC = K.std(0x5f86a6, { roughness: 0.9 });
      const coatC = K.std(0x6f93b0, { roughness: 0.95, transparent: true, opacity: 0.78 });
      const trimM = K.std(0xf7f5ef, { roughness: 0.45 });
      const walls = K.part('walls', [0, 0, 0], null, 'Walls (old color)');
      panels(K, walls, [X0, X1, 0, H], WIN, -0.05, oldC, 0.1);
      K.box(walls, [0.1, H, ZS], oldC, [X0 - 0.05, H / 2, ZS / 2], null, 0);
      const ceil = K.part('ceiling', [0, 0, 0], null, 'Ceiling (flat white)');
      K.box(ceil, [X1 - X0 + 0.1, 0.02, 1.4], K.std(0xf4f3ef, { roughness: 0.95, emissive: 0x3a3936 }), [(X0 + X1) / 2, H + 0.01, 0.7], null, 0);
      // window: sash, glass, muntins, casing, stool, apron
      const win = K.part('window', [0, 0, 0], null, 'Window');
      K.box(win, [WIN[1] - WIN[0], WIN[3] - WIN[2], 0.01], K.std(0xbfdcf0, { roughness: 0.08, metalness: 0.2, emissive: 0x6e93ad, emissiveIntensity: 0.5 }), [(WIN[0] + WIN[1]) / 2, (WIN[2] + WIN[3]) / 2, -0.09], null, 0);
      K.box(win, [WIN[1] - WIN[0], 0.04, 0.05], trimM, [(WIN[0] + WIN[1]) / 2, (WIN[2] + WIN[3]) / 2, -0.07], null, 0.004);
      K.box(win, [0.025, WIN[3] - WIN[2], 0.03], trimM, [(WIN[0] + WIN[1]) / 2, (WIN[2] + WIN[3]) / 2, -0.08], null, 0.004);
      const trim = K.part('trim', [0, 0, 0], null, 'Trim: baseboard & window casing');
      K.box(trim, [CAS, WIN[3] - WIN[2] + CAS, 0.018], trimM, [WIN[0] - CAS / 2, (WIN[2] + WIN[3] + CAS) / 2, 0.009], null, 0.003);
      K.box(trim, [CAS, WIN[3] - WIN[2] + CAS, 0.018], trimM, [WIN[1] + CAS / 2, (WIN[2] + WIN[3] + CAS) / 2, 0.009], null, 0.003);
      K.box(trim, [WIN[1] - WIN[0] + 2 * CAS, CAS, 0.018], trimM, [(WIN[0] + WIN[1]) / 2, WIN[3] + CAS / 2, 0.009], null, 0.003);
      K.box(trim, [WIN[1] - WIN[0] + 2 * CAS + 0.05, 0.022, 0.13], trimM, [(WIN[0] + WIN[1]) / 2, WIN[2] - 0.011, 0.02], null, 0.004); // stool
      K.box(trim, [WIN[1] - WIN[0] + 2 * CAS, 0.085, 0.016], trimM, [(WIN[0] + WIN[1]) / 2, WIN[2] - 0.022 - 0.0425, 0.008], null, 0.003); // apron
      K.box(trim, [X1 - X0, 0.09, 0.014], trimM, [(X0 + X1) / 2, 0.045, 0.007], null, 0.003);
      K.box(trim, [0.014, 0.09, ZS], trimM, [X0 + 0.007, 0.045, ZS / 2], null, 0.003);
      // outlet + cover plate
      K.box(null, [0.035, 0.07, 0.01], 'offwhite', [-0.8, 0.32, 0.0], null, 0.002);
      const plate = K.part('plate', [-0.8, 0.32, 0.004], null, 'Outlet cover plate');
      K.box(plate, [0.07, 0.115, 0.006], 'offwhite', [0, 0, 0], null, 0.0025);
      [0.019, -0.019].forEach((y) => K.box(plate, [0.034, 0.03, 0.004], 'offwhite', [0, y, 0.004], null, 0.003));
      K.screw(plate, 0.004, 0.02, 'offwhite', [0, 0, 0.004], [90, 0, 0]);
      // drop cloth along both walls
      const drop = K.part('dropCloth', [0, 0, 0], null, 'Canvas drop cloth');
      const canvas = K.bumpy(0xe7dcc2, K.tex.weave(), 0.003, { roughness: 1 });
      K.box(drop, [X1 - X0 - 0.1, 0.004, 0.9], canvas, [(X0 + X1) / 2 + 0.05, 0.002, 0.5], null, 0);
      K.box(drop, [0.9, 0.004, ZS - 0.95], canvas, [X0 + 0.5, 0.002, 0.95 + (ZS - 0.95) / 2], null, 0);
      K.tube(drop, [[X0 + 0.1, 0.004, 0.95], [X0 + 0.4, 0.03, 0.97], [X0 + 0.7, 0.004, 0.95]], 0.012, canvas);
      // painter's tape on trim edges
      const tape = K.part('tape', [0, 0, 0], null, 'Painter’s tape on the trim');
      const blue = K.std(0x3d8fd6, { roughness: 0.7 });
      K.box(tape, [X1 - X0, 0.024, 0.016], blue, [(X0 + X1) / 2, 0.082, 0.009], null, 0);
      K.box(tape, [0.016, 0.024, ZS], blue, [X0 + 0.009, 0.082, ZS / 2], null, 0);
      K.box(tape, [0.024, WIN[3] - WIN[2] + CAS, 0.02], blue, [WIN[0] - CAS + 0.01, (WIN[2] + WIN[3] + CAS) / 2, 0.01], null, 0);
      K.box(tape, [0.024, WIN[3] - WIN[2] + CAS, 0.02], blue, [WIN[1] + CAS - 0.01, (WIN[2] + WIN[3] + CAS) / 2, 0.01], null, 0);
      K.box(tape, [WIN[1] - WIN[0] + 2 * CAS, 0.024, 0.02], blue, [(WIN[0] + WIN[1]) / 2, WIN[3] + CAS - 0.01, 0.01], null, 0);
      // spackled nail holes
      const patches = K.part('patches', [0, 0, 0], null, 'Spackled holes (spot-primed)');
      [[-1.2, 1.55], [-0.4, 1.7], [-0.25, 1.62], [-1.0, 0.9], [1.25, 1.4]].forEach(([x, y], i) => K.cyl(patches, [0.018 + (i % 2) * 0.01, 0.018 + (i % 2) * 0.01, 0.002, 20], K.std(0xfbfaf6, { roughness: 1 }), [x, y, 0.001], [90, 0, 0]));
      K.cyl(patches, [0.03, 0.03, 0.002, 20], K.std(0xfbfaf6, { roughness: 1 }), [X0 + 0.001, 1.4, 1.2], [0, 0, 90]);
      // cut-in band (2½–3″ wide) at every edge
      const cut = K.part('cutIn', [0, 0, 0], null, 'Cut-in band (brushed edges)');
      const b = 0.07, z = 0.001;
      K.box(cut, [X1 - X0, b, 0.002], newC, [(X0 + X1) / 2, H - b / 2, z], null, 0);
      K.box(cut, [0.002, b, ZS], newC, [X0 + z, H - b / 2, ZS / 2], null, 0);
      K.box(cut, [X1 - X0, b, 0.002], newC, [(X0 + X1) / 2, 0.09 + b / 2, z], null, 0);
      K.box(cut, [0.002, b, ZS], newC, [X0 + z, 0.09 + b / 2, ZS / 2], null, 0);
      K.box(cut, [b, H, 0.002], newC, [X0 + b / 2, H / 2, z], null, 0);
      K.box(cut, [0.002, H, b], newC, [X0 + z, H / 2, b / 2], null, 0);
      panels(K, cut, [WOUT[0] - b, WOUT[1] + b, WOUT[2] - b, WOUT[3] + b], WOUT, z, newC);
      panels(K, cut, [-0.8 - 0.035 - b * 0.7, -0.8 + 0.035 + b * 0.7, 0.32 - 0.058 - b * 0.7, 0.32 + 0.058 + b * 0.7], [-0.835, -0.765, 0.262, 0.378], z, newC);
      // roller coats
      const c1 = K.part('coat1', [0, 0, 0], null, 'First coat (rolled)');
      panels(K, c1, [X0, X1, 0.09, H], WOUT, 0.0022, coatC);
      sidePanels(K, c1, [0, ZS, 0.09, H], X0 + 0.0022, coatC);
      const c2 = K.part('coat2', [0, 0, 0], null, 'Second coat: full, even color');
      panels(K, c2, [X0, X1, 0.09, H], WOUT, 0.0034, newC);
      sidePanels(K, c2, [0, ZS, 0.09, H], X0 + 0.0034, newC);
      // tray with paint, pail and angled brush
      const tray = K.part('tray', [0.0, 0, 0.75], null, 'Roller tray + liner');
      const trayM = K.std(0x30343a, { roughness: 0.5 });
      K.box(tray, [0.3, 0.012, 0.42], trayM, [0, 0.006, 0], null, 0.004);
      K.box(tray, [0.3, 0.07, 0.012], trayM, [0, 0.035, 0.205], null, 0.003);
      K.box(tray, [0.012, 0.07, 0.42], trayM, [0.145, 0.035, 0], null, 0.003);
      K.box(tray, [0.012, 0.07, 0.42], trayM, [-0.145, 0.035, 0], null, 0.003);
      K.box(tray, [0.276, 0.004, 0.17], newC, [0, 0.04, 0.115], null, 0);
      K.box(tray, [0.276, 0.006, 0.26], K.std(0x9aa3ab, { roughness: 0.6 }), [0, 0.04, -0.08], [-12, 0, 0], 0);
      const pail = K.part('pail', [-0.55, 0, 0.55], null, 'Paint pail (cut-in bucket)');
      K.cyl(pail, [0.085, 0.075, 0.15, 32, true], K.std(0xf1f1ee, { roughness: 0.5, side: 2 }), [0, 0.075, 0]);
      K.cyl(pail, [0.08, 0.08, 0.004, 32], newC, [0, 0.06, 0]);
      K.cyl(pail, [0.075, 0.075, 0.004, 32], K.std(0xf1f1ee), [0, 0.002, 0]);
      const brush = K.part('brush', [-0.6, H - 0.035, 0.012], null, '2½″ angled sash brush');
      const bg = K.group(brush, [0, 0, 0], [0, 0, -35]);
      K.box(bg, [0.062, 0.05, 0.014], K.std(0x6c5a45, { roughness: 0.9 }), [0, 0.025, 0.008], [0, 0, 0], 0.002);
      K.box(bg, [0.064, 0.03, 0.018], 'steel', [0, 0.065, 0.008], null, 0.003);
      K.cyl(bg, [0.011, 0.014, 0.17, 16], 'hickory', [0, 0.16, 0.008]);
      return {
        tick(t, fx) {
          brush.position.x = fx === 'cut' ? -0.9 + 0.5 * Math.sin(t * 1.6) : -0.6;
        },
      };
    }
  );

  /* ---- Heavy mirror on a French cleat (studs) or snap toggles (hollow wall) ---- */
  // Stud wall: drywall face at z = 0, studs 16″ o.c. behind, baseboard.
  function studWall(K, w, studs, opts) {
    opts = opts || {};
    const t = 0.0127;
    const wall = K.part('wall', [0, 0, 0], null, opts.label || 'Drywall (½″)');
    const paintM = K.std(opts.color || 0xe9e4d8, { roughness: 0.93 });
    if (opts.hole) {
      const h = opts.hole;
      K.ext(wall, [[-w / 2, 0], [w / 2, 0], [w / 2, 2.44], [-w / 2, 2.44]], t, paintM, [0, 0, -t], null, 0, [[[h[0], h[2]], [h[0], h[3]], [h[1], h[3]], [h[1], h[2]]]]);
    } else K.box(wall, [w, 2.44, t], paintM, [0, 1.22, -t / 2], null, 0);
    K.box(wall, [w, 0.09, 0.014], K.std(0xf7f5ef, { roughness: 0.45 }), [0, 0.045, 0.007], null, 0.003);
    const st = K.part('studs', [0, 0, 0], null, '2×4 studs, 16″ on center');
    studs.forEach((x) => K.box(st, [0.038, 2.44 - 0.076, 0.089], 'woodLight', [x, 1.22, -t - 0.0445], null, 0.002));
    K.box(st, [w, 0.038, 0.089], 'woodLight', [0, 0.019, -t - 0.0445], null, 0.002);
    K.box(st, [w, 0.038, 0.089], 'woodLight', [0, 2.44 - 0.019, -t - 0.0445], null, 0.002);
    return wall;
  }
  function studFinder(K, pos) {
    const f = K.part('finder', pos, null, 'Stud finder');
    K.box(f, [0.075, 0.16, 0.032], K.std(0xf2b81f, { roughness: 0.5 }), [0, 0, 0.016], null, 0.012);
    K.box(f, [0.05, 0.03, 0.004], 'screen', [0, 0.04, 0.033], null, 0.002);
    K.box(f, [0.02, 0.012, 0.004], 'black', [0, 0.0, 0.033], null, 0.002);
    K.box(f, [0.06, 0.006, 0.004], 'ledG', [0, 0.072, 0.033], null, 0);
    return f;
  }
  // French cleat profile, extruded along x (length L) and centred on x = 0. part = parent group.
  // up = true: wall cleat (bevel faces up toward the wall); false: mirror cleat (bevel faces down).
  function cleat(K, p, L, up, mat) {
    const g = K.group(p, [-L / 2, 0, 0], [0, 90, 0]); // local z → world +x, local x → world −z
    const T = 0.019, Hh = 0.09;
    const pts = up ? [[0, 0], [0, Hh - T], [-T, Hh], [-T, 0]] : [[0, Hh - T + 0.001], [0, Hh + 0.08], [-T, Hh + 0.08], [-T, Hh + 0.001]];
    K.ext(g, pts, L, mat, [0, 0, 0], null, 0.0008);
    return g;
  }
  TB.model(
    'heavyMirror',
    VIEW({ cam: [1.8, 1.6, 3.4], at: [0, 1.4, 0], hidden: ['finder', 'marks', 'wallCleat', 'studScrews', 'toggles', 'mirror', 'bumpers'] }),
    (K) => {
      const S = 0.406;
      studWall(K, 2.6, [-2 * S - 0.2, -S, 0, S, 2 * S]);
      studFinder(K, [-S, 1.78, 0]);
      const ply = K.std(0xd8bd8e, { roughness: 0.75 });
      // pencil marks: level line + stud ticks
      const marks = K.part('marks', [0, 0, 0.0006], null, 'Level line + stud marks');
      K.box(marks, [0.9, 0.0016, 0.001], 'dark', [0, 1.85, 0], null, 0);
      [-S, 0, S].forEach((x) => K.box(marks, [0.0016, 0.08, 0.001], 'dark', [x, 1.8, 0], null, 0));
      [-0.2, 0.2].forEach((x) => K.box(marks, [0.02, 0.0016, 0.001], 'red', [x, 1.805, 0], null, 0));
      // wall cleat (¾″ plywood, 45° bevel), y from 1.76 to 1.85
      const wc = K.part('wallCleat', [0, 1.76, 0], null, 'Wall cleat (bevel up, toward wall)');
      cleat(K, wc, 0.86, true, ply);
      const ss = K.part('studScrews', [0, 1.805, 0.019], null, '#10 × 3″ screws into studs');
      [-S, 0, S].forEach((x) => K.screw(ss, 0.0048, 0.076, 'steel', [x, 0, 0.0], [90, 0, 0], 'flat'));
      const tg = K.part('toggles', [0, 1.805, 0], null, 'Snap toggles (¼-20) behind the drywall');
      [-0.2, 0.2].forEach((x) => {
        K.box(tg, [0.06, 0.011, 0.008], 'steel', [x, 0, -0.0127 - 0.004], null, 0.001);
        K.cyl(tg, [0.0075, 0.0075, 0.003, 20], 'white', [x, 0, 0.0], [90, 0, 0]);
        K.screw(tg, 0.0064, 0.06, 'steel', [x, 0, 0.0195], [90, 0, 0], 'hex');
      });
      // mirror (36 × 42″) with its own cleat on the back; origin at its centre
      const MY = 1.45, MW = 0.914, MH = 1.067;
      const mirror = K.part('mirror', [0, MY, 0.04], null, 'Mirror (36 × 42″, ≈ 45 lb)');
      const frameM = K.std(0x2c2621, { roughness: 0.4, metalness: 0.2 });
      K.box(mirror, [MW, MH, 0.04], frameM, [0, 0, 0], null, 0.01);
      K.box(mirror, [MW - 0.1, MH - 0.1, 0.006], K.phys(0xdfe8ee, { metalness: 1, roughness: 0.04 }), [0, 0, 0.019], null, 0);
      K.box(mirror, [MW - 0.12, MH - 0.12, 0.004], K.std(0x6f6253, { roughness: 1 }), [0, 0, -0.019], null, 0); // dust backing
      const mc = K.group(mirror, [0, 1.76 - MY, -0.04], null);
      cleat(K, mc, 0.76, false, ply);
      [-0.3, 0, 0.3].forEach((x) => K.screw(mirror, 0.004, 0.03, 'steel', [x, 1.76 + 0.13 - MY, -0.0395], [-90, 0, 0], 'flat'));
      const bump = K.part('bumpers', [0, MY - MH / 2 + 0.06, 0.021], null, 'Bottom spacer + felt bumpers');
      K.box(bump, [0.6, 0.04, 0.019], ply, [0, 0, -0.0115], null, 0.002);
      [-0.25, 0.25].forEach((x) => K.cyl(bump, [0.009, 0.009, 0.002, 16], 'black', [x, 0, -0.0215], [90, 0, 0]));
    }
  );

  /* ---- Large drywall hole: new piece on backer strips, or a California patch ---- */
  TB.model(
    'bigPatch',
    VIEW({ cam: [0.65, 1.2, 1.25], at: [0.2, 1.0, 0], hidden: ['outline', 'backers', 'backerScrews', 'newPiece', 'pieceScrews', 'calPatch', 'meshTape', 'mud1', 'mud2', 'paint'] }),
    (K) => {
      const S = 0.406;
      const HOLE = [0.1, 0.3, 0.9, 1.1];
      studWall(K, 2.0, [-S, 0, S], { hole: HOLE, color: 0xe3ddcf });
      // the damage: ragged hole inside the 8″ square
      const dmg = K.part('damage', [0, 0, -0.0127], null, 'Damaged area (ragged hole)');
      const jag = [];
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const r = 0.055 + 0.022 * Math.sin(i * 2.7) + 0.012 * Math.cos(i * 5.1);
        jag.push([0.2 + Math.cos(a) * r, 1.0 + Math.sin(a) * r * 0.9]);
      }
      K.ext(dmg, [[HOLE[0], HOLE[2]], [HOLE[1], HOLE[2]], [HOLE[1], HOLE[3]], [HOLE[0], HOLE[3]]], 0.0127, K.std(0xe3ddcf, { roughness: 0.93 }), [0, 0, 0], null, 0, [jag.reverse()]);
      K.rep(5, (i) => K.box(dmg, [0.03, 0.012, 0.002], K.std(0xcfc6b0), [0.2 + Math.cos(i * 1.3) * 0.075, 1.0 + Math.sin(i * 1.3) * 0.07, 0.013], [0, 0, i * 40], 0));
      const line = K.part('outline', [0, 0, 0.0006], null, 'Square cut lines');
      [[0.2, HOLE[2]], [0.2, HOLE[3]]].forEach(([x, y]) => K.box(line, [0.2, 0.0015, 0.001], 'dark', [x, y, 0], null, 0));
      [[HOLE[0], 1.0], [HOLE[1], 1.0]].forEach(([x, y]) => K.box(line, [0.0015, 0.2, 0.001], 'dark', [x, y, 0], null, 0));
      // backer strips (1×3) screwed behind the edges
      const bk = K.part('backers', [0, 1.0, -0.0127 - 0.0095], null, '1×3 backer strips');
      [HOLE[0], HOLE[1]].forEach((x) => K.box(bk, [0.064, 0.32, 0.019], 'woodLight', [x, 0, 0], null, 0.002));
      const bs = K.part('backerScrews', [0, 0, 0.0005], null, '1¼″ drywall screws (wall to strips)');
      [[HOLE[0] - 0.015, 0.87], [HOLE[0] - 0.015, 1.13], [HOLE[1] + 0.015, 0.87], [HOLE[1] + 0.015, 1.13]].forEach(([x, y]) => K.screw(bs, 0.0035, 0.032, 'blackOxide', [x, y, 0], [90, 0, 0], 'flat'));
      const np = K.part('newPiece', [0.2, 1.0, -0.00635], null, 'New drywall piece (½″)');
      K.box(np, [0.197, 0.197, 0.0127], K.std(0xdcd8cf, { roughness: 0.95 }), [0, 0, 0], null, 0);
      K.box(np, [0.197, 0.197, 0.001], K.std(0xece8de, { roughness: 0.95 }), [0, 0, 0.0065], null, 0);
      const ps = K.part('pieceScrews', [0, 0, 0.0005], null, 'Screws into the strips');
      [[0.115, 0.94], [0.115, 1.06], [0.285, 0.94], [0.285, 1.06]].forEach(([x, y]) => K.screw(ps, 0.0035, 0.032, 'blackOxide', [x, y, 0], [90, 0, 0], 'flat'));
      // California patch: gypsum core with paper flaps
      const cp = K.part('calPatch', [0.2, 1.0, 0], null, 'California patch (paper flaps)');
      K.box(cp, [0.197, 0.197, 0.0127], K.std(0xdcd8cf, { roughness: 0.95 }), [0, 0, -0.00635], null, 0);
      K.box(cp, [0.3, 0.3, 0.0008], K.std(0xe9e3d3, { roughness: 1 }), [0, 0, 0.0005], null, 0);
      const mesh = K.part('meshTape', [0.2, 1.0, 0.0012], null, 'Mesh tape over the seams');
      const mt = K.std(0xe8e0b8, { roughness: 1, transparent: true, opacity: 0.85 });
      [-0.1, 0.1].forEach((d) => {
        K.box(mesh, [0.05, 0.25, 0.0008], mt, [d, 0, 0], null, 0);
        K.box(mesh, [0.25, 0.05, 0.0008], mt, [0, d, 0.0002], null, 0);
      });
      const m1 = K.part('mud1', [0.2, 1.0, 0.002], null, 'First coat of compound');
      K.box(m1, [0.34, 0.34, 0.0016], K.std(0xf2f0ea, { roughness: 1 }), [0, 0, 0], null, 0);
      const m2 = K.part('mud2', [0.2, 1.0, 0.0034], null, 'Feathered coats, 12–16″ wide');
      K.box(m2, [0.45, 0.45, 0.0012], K.std(0xf7f5ef, { roughness: 1 }), [0, 0, 0], null, 0);
      const paint = K.part('paint', [0, 1.25, 0.0046], null, 'Primer + paint');
      K.box(paint, [2.0, 2.3, 0.0008], K.std(0xe3ddcf, { roughness: 0.93 }), [0, 0, 0], null, 0);
    }
  );
})();

/* ---- WALLS: guides ---- */
(function () {
  const S = 0.406;
  TB.more('walls', [
    {
      id: 'paint-room',
      title: 'Paint a room like a pro',
      kind: 'build',
      model: 'paintRoom',
      level: 2,
      time: '1–2 days',
      cost: '$120–300',
      summary: 'Crisp lines and an even finish come from prep and order: patch, tape, cut in the edges with a brush, then roll each wall keeping a wet edge. Two coats, always, with the drying time on the can between them.',
      intro: { show: ['coat2'], preview: true, hi: ['coat2'] },
      safety: ['Ventilate: open windows and run a box fan blowing out. Choose low-VOC (low-odor) paint for bedrooms and nurseries.', 'Use a step ladder rated for your weight, fully opened with the spreaders locked. Never stand on the top step or the paint shelf.', 'With switch and outlet covers off, the wires behind are close. Keep the brush clear of the openings, or switch off the breaker while you paint around them.', 'Homes built before 1978 may have lead paint. Test with an EPA-recognized kit before sanding or scraping old trim, and never dry-scrape or dry-sand it.'],
      causes: [['How much paint', 'One gallon covers about 350–400 sq ft per coat on smooth walls. Add up wall widths × height, subtract about 20 sq ft per door and 15 per window, double it for two coats and divide by 350. A 12 × 12 ft room with 8 ft ceilings needs about 2 gallons.'], ['Pick the sheen', 'Flat or matte hides bumps (ceilings, bedrooms). Eggshell for living rooms. Satin for halls, kitchens and kids’ rooms (more washable). Semi-gloss for trim and doors.'], ['Primer or not', 'Spot-prime patches. Prime the whole wall for new drywall, a big dark-to-light change, glossy old paint or stains.'], ['Order of work', 'Ceiling first, then walls, then trim and doors last.'], ['Weather', 'Most latex paint needs the room above 50 °F during painting and drying. Humid days double the drying time.']],
      tools: ['2½″ angled sash brush (nylon/polyester)', '9″ roller frame + ⅜″ nap covers (½″ for light texture)', 'Roller tray + liners (or a 5-gal bucket + grid)', 'Extension pole (4 ft)', 'Small paint pail for cutting in', 'Painter’s tape (1½″)', 'Canvas drop cloths', 'Spackle + 2″ putty knife', 'Fine sanding sponge', 'Primer for patches', 'Step ladder', 'Screwdriver and a zip bag for plate screws', 'Damp sponge and rags'],
      steps: [
        { t: 'Clear, cover and remove plates', d: 'Move furniture to the middle of the room and cover it with plastic. Lay canvas drop cloths along the walls, pushed tight to the baseboard. Unscrew outlet and switch cover plates, and put the plates and screws in a zip bag.', why: 'Canvas soaks up drips instead of letting you track them across the floor like plastic does. Painting around plates always shows.', tip: 'Put a strip of painter’s tape over each outlet and switch after removing the plate, so the brush can’t gum up the slots.', ok: 'There’s a clear 3 ft working path along every wall, the floor near the walls is covered, and no cover plates remain on the walls.', v: { cam: [1.4, 1.3, 3.6], at: [-0.6, 0.5, 0.4], hi: ['dropCloth', 'plate'], show: ['dropCloth'], mv: { plate: [0, 0, 0.08] }, tool: { id: 'screwdriver', at: [-0.8, 0.32, 0.088], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Patch, sand and spot-prime', d: 'Press spackle into nail holes and dings with a putty knife, scraping it flush. When dry (15 min to 2 hours, check the tub), sand it flat with a fine sponge and dab primer on each patch. Wipe the walls with a damp sponge to remove dust and kitchen grease.', why: 'Bare spackle soaks up paint and shows as dull spots, called flashing. Dust and grease keep paint from sticking.', tip: 'Shine a flashlight flat along each wall to find dents you can’t see in normal light. Patches that sink after drying need a second thin pass.', ok: 'Running your palm over the patches, they feel as smooth as the wall, and each one has a dot of primer.', v: { cam: [0.4, 1.5, 2.0], at: [-0.6, 1.45, 0], hi: ['patches'], show: ['patches'], mv: { plate: [0.35, -0.31, 0.5] }, rt: { plate: [-90, 0, 0] }, tool: { id: 'puttyKnife', at: [-0.4, 1.7, 0.003], rot: [60, 0, 0] } } },
        { t: 'Tape the trim', d: 'Run painter’s tape along the top edge of the baseboard and the outer edge of the window and door casing (trim). Lay it in arm-length pieces and press the wall-side edge down firmly with a putty knife or credit card.', why: 'A sealed tape edge is what stops paint from bleeding under. Pros often skip tape, but it saves beginners hours of touch-up.', tip: 'For an even crisper line, brush a thin coat of the trim color (or clear caulk) along the tape edge first. It seals any gaps, and anything that bleeds is the trim color anyway.', ok: 'The tape is straight, lies tight with no bubbles or wrinkles along the edge, and you can’t lift its edge with a fingernail.', v: { cam: [1.0, 0.6, 1.6], at: [0.2, 0.3, 0], hi: ['tape'], show: ['tape'], tool: { id: 'puttyKnife', at: [-0.2, 0.094, 0.018], rot: [60, 0, 0] } } },
        { t: 'Cut in the edges', d: 'Pour about 1″ of paint into a small pail. Dip the brush a third of the way, tap it on the side, then paint a 2–3″ band along the ceiling line, corners, trim and outlets. Hold the brush like a pencil and drag the long bristle tip along the edge in one steady stroke. Cut in one wall at a time.', why: 'The roller can’t reach into corners. Cutting in one wall at a time means the band is still wet when you roll, so it blends with no visible frame (called picture framing).', tip: 'Start the stroke about ½″ from the edge, then slowly ease the bristles into the corner as you pull. Got paint on the ceiling? Wipe it right away with a damp rag wrapped on a putty knife.', ok: 'A smooth, even band about 2–3″ wide runs along every edge of this wall, with a straight line at the ceiling and no drips.', v: { cam: [0.6, 1.9, 1.9], at: [-0.8, 2.1, 0], hi: ['cutIn', 'brush'], show: ['cutIn', 'brush', 'pail'], fx: 'cut', tool: { id: 'stepLadder', at: [-0.9, 0, 0.55], rot: [0, 0, 0] } } },
        { t: 'Roll the first coat', d: 'Dip the roller in the tray and roll it on the ramp until evenly loaded but not dripping. Start about a foot from a corner and roll a 3 × 3 ft “W”, fill it in without lifting, and finish with light top-to-bottom strokes. Move to the next section and roll back into the wet edge. Finish each wall before stopping.', why: 'The W spreads the paint evenly, and keeping a wet edge stops the stripes (lap marks) that appear where dry and wet paint overlap.', tip: 'Let the roller do the work; press so lightly that you hear a soft sticky sound, not a hiss. Reload before the roller sounds dry. Drips at the edges mean too much paint; roll more on the ramp.', ok: 'The wall has an even, uniform color with no thick ridges at the roller ends, and the edges blend into the cut-in band.', v: { cam: [0.9, 1.4, 2.6], at: [-0.6, 1.2, 0.2], hi: ['coat1'], show: ['coat1', 'tray'], hide: ['brush'], tool: { id: 'roller', at: [-0.7, 1.2, 0.004], rot: [90, 0, 0], anim: 'slide', scale: 1 } } },
        { t: 'Second coat', d: 'Let the first coat dry as long as the can says before recoating, usually 2–4 hours (longer if humid or cool). Cut in again, then roll the second coat the same way, wall by wall.', why: 'One coat almost never gives full, even color, and the second coat evens out the sheen and covers thin spots.', tip: 'Between coats, wrap the brush and roller tightly in a plastic bag. They’ll stay wet for hours, even overnight in the fridge.', ok: 'Looking along each wall with a work light, the color and sheen look uniform with no thin, see-through patches.', v: { cam: [1.1, 1.5, 2.8], at: [-0.2, 1.3, 0.2], hi: ['coat2'], show: ['coat2'], hide: ['coat1'], tool: { id: 'roller', at: [0.0, 1.5, 0.004], rot: [90, 0, 0], anim: 'slide', scale: 1 } } },
        { t: 'Pull the tape and clean up', d: 'Pull the tape slowly, folding it back on itself at a 45° angle, soon after the last coat while the paint is still slightly soft. Let the walls dry to the touch before screwing the plates back on. Wash latex tools in warm soapy water.', why: 'Tape pulled after the paint fully hardens can tear the paint film and lift it off the wall.', tip: 'If the paint has hardened, run a sharp utility knife along the tape edge first to cut the film, then pull. Small bleeds? Touch them up with a small artist’s brush.', ok: 'A clean, straight line remains at every edge, the plates are back on, and nothing feels tacky when you touch the wall lightly.', v: { cam: [2.3, 1.6, 5.0], at: [-0.3, 1.2, 0.3], hi: ['coat2', 'plate'], hide: ['tape', 'dropCloth', 'tray', 'pail'], mv: { plate: [0, 0, 0] }, rt: { plate: [0, 0, 0] } } },
      ],
      tricks: [
        ['Box your paint', 'Pour all your gallons into a 5-gallon bucket and stir. Every can is slightly different, and mixing them guarantees one even color.'],
        ['Bucket and grid', 'A 5-gallon bucket with a roller grid holds more paint and spills less than a tray, and you can carry it with one hand.'],
        ['Pre-wet the roller', 'Dampen a new roller cover with water, spin or blot it nearly dry, then load it. It soaks up paint faster and evenly.'],
        ['De-fuzz new covers', 'Wrap new roller covers in painter’s tape and peel it off to pull loose fibers before painting.'],
        ['Light from the side', 'Set a work light low and at an angle to the wall. Thin spots and holidays (missed areas) jump out.'],
        ['Dark colors', 'For deep colors, ask the store for a gray-tinted primer. It can save a third coat.'],
        ['Label the leftovers', 'Write the room and date on the lid, and keep a quart for touch-ups. Store it out of freezing temperatures.'],
      ],
      refs: [
        ['Lead: Renovation, Repair and Painting Program (U.S. EPA)', 'https://www.epa.gov/lead/renovation-repair-and-painting-program'],
        ['Interior paint application FAQs and product data (Sherwin-Williams)', 'https://www.sherwin-williams.com/'],
        ['Paint technical data sheets (Benjamin Moore)', 'https://www.benjaminmoore.com/'],
        ['Product application guidance (Sherwin-Williams pro FAQs)', 'https://www.sherwin-williams.com/home-builders/products/resources/faqs/exterior-product-application-faqs'],
      ],
      learn: {
        how: 'Paint is pigment (color), binder (the acrylic that forms the film) and a carrier (water) that evaporates. As the water leaves, the binder particles fuse into a film. If you roll over paint that has started to set, you tear that film and leave a lap mark. That is why pros work in a fixed order and keep a wet edge. The paint feels dry in an hour but takes weeks to fully harden.',
        specs: [['Coverage', '350–400 sq ft per gallon per coat'], ['Roller nap', '⅜″ smooth walls; ½″ light texture; ¾″ heavy texture'], ['Recoat time', '2–4 hr typical for latex (check the can)'], ['Minimum temperature', '≈ 50 °F (some paints 35 °F)'], ['Cut-in band', '2–3″'], ['Full cure', '2–4 weeks; wash gently until then']],
        terms: [['Cutting in', 'Brushing paint along edges where the roller can’t reach.'], ['Wet edge', 'Keeping the edge of the painted area wet so new paint blends in.'], ['Flashing', 'Patches that look duller or shinier than the rest.'], ['Box the paint', 'Mix all gallons together so the color is identical.'], ['Nap', 'The fiber length of a roller cover.']],
        mistakes: ['Pressing hard on a dry roller to stretch the paint.', 'Cutting in the whole room first, then rolling hours later.', 'Painting in direct sun or below 50 °F.', 'Skipping the second coat.', 'Leaving tape on for days.'],
        tips: ['Wrap brushes and rollers in plastic between coats instead of washing them.', 'Use a bright work light raking across the wall to spot thin areas.'],
      },
      pro: 'The walls are plaster with lots of cracks, there’s peeling or lead paint, or you need to paint stairwells or ceilings over 10 ft.',
    },
    {
      id: 'hang-heavy',
      title: 'Hang a heavy mirror or shelf',
      model: 'heavyMirror',
      level: 2,
      time: '45–90 min',
      cost: '$15–40',
      renter: true,
      summary: 'Anything over about 20 lb needs real support. A French cleat (two strips with matching 45° edges) screwed into studs holds hundreds of pounds and makes the mirror easy to level. On hollow drywall with no studs, use metal snap toggles.',
      intro: { hi: ['wall'] },
      safety: ['Before drilling, check for wires and pipes. Avoid the area straight above and below outlets and switches, where cables run vertically.', 'Large mirrors are heavy and dangerous if they slip. Work with a helper and wear gloves.', 'Don’t trust the hanging wire, sawtooth hangers or plastic anchors packed with the mirror for heavy loads.', 'Over a bed or a sofa, use the cleat into studs; a falling mirror there is a real injury risk.'],
      causes: [['Weigh it first', 'Stand on a bathroom scale holding it, then subtract your own weight.'], ['Under 20 lb', 'Picture hooks or a couple of good anchors are fine.'], ['20–100 lb', 'French cleat into studs, or snap toggles in hollow drywall.'], ['Over 100 lb', 'Cleat into at least two studs, or call a pro.'], ['Read anchor ratings right', 'Packages often show the “ultimate” (breaking) load. The safe working load is about a quarter of that. Make sure the total safe load is comfortably more than the weight.']],
      tools: ['Stud finder', '4 ft level', 'Tape measure + pencil', 'Drill/driver + bits', 'French cleat (aluminum Z-clip or ¾″ plywood ripped at 45°)', '#10 × 3″ wood screws', 'Snap toggles, ¼-20 (for hollow wall)', 'Painter’s tape', 'Helper'],
      variants: [
        { id: 'cleat', name: 'Cleat into studs', blurb: 'Strongest and easiest to level. Best when two or more studs land within the cleat’s length.' },
        {
          id: 'toggle',
          name: 'Snap toggles (no studs)',
          blurb: 'For hollow drywall where studs aren’t where you need them. A ¼-20 snap toggle has a safe working load of roughly 50–65 lb in ½″ drywall (about a quarter of its tested breaking load), so use enough of them.',
          time: '45–75 min',
          tools: ['Stud finder', '4 ft level', 'Tape measure + pencil', 'Drill + ½″ bit', 'French cleat', 'Snap toggles, ¼-20 (2–4)', 'Screwdriver', 'Painter’s tape', 'Helper'],
          steps: [
            { t: 'Check for studs and plan', d: 'Scan the wall with a stud finder. If studs aren’t where the mirror needs to go, plan enough snap toggles along the cleat: at least one per 50 lb of mirror, and no fewer than two, spaced 12–16″ apart.', why: 'Toggles spread the load over the back of the drywall, and more of them share the weight. Drywall itself is the weak link, not the toggle.', tip: 'If one end of the cleat lands on a stud, use a wood screw there and toggles elsewhere. Every stud you hit adds strength.', ok: 'You have marks for 2–4 toggle locations, none of them on a stud or directly above an outlet.', v: { cam: [1.1, 1.65, 1.8], at: [-0.2, 1.7, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true } },
            { t: 'Mark a level line', d: 'Measure from the mirror cleat to the top of the mirror. Mark that distance below where you want the top. Hold the wall cleat there with the level on it, mark its top edge, and mark the toggle centers along it.', why: 'The cleat sets the mirror level, so getting this line right is the whole job.', tip: 'Run a strip of painter’s tape along the line and mark on the tape. Your pencil marks stay off the paint and the tape is easy to see.', ok: 'The bubble sits centered on the level along your line, and each toggle mark sits on it.', v: { cam: [1.0, 1.75, 1.6], at: [0, 1.82, 0], hi: ['marks'], show: ['marks'], hide: ['finder'], tool: { id: 'level', at: [0, 1.851, 0.02], rot: [0, 0, 0], scale: 1.4 } } },
            { t: 'Drill the holes', d: 'Drill a ½″ hole straight into the wall at each mark, holding the drill level. Push gently and stop as soon as it breaks through; you’ll feel it suddenly go easy.', why: 'The folded metal channel has to pass through, so the hole size is set by the toggle package; ½″ for ¼-20 snap toggles.', tip: 'If you hit wood behind the drywall, you found a stud or blocking. Use a 3″ wood screw there instead of a toggle.', ok: 'Clean round holes go straight through, and the toggle channel slides in with light pressure.', v: { cam: [0.7, 1.75, 1.0], at: [0.2, 1.8, 0], hi: ['marks'], tool: { id: 'drill', at: [0.2, 1.805, 0.0], rot: [90, 0, 0], anim: 'spin' } } },
            { t: 'Set the toggles', d: 'Fold the metal channel in line with the straps and push it through the hole. Pull the straps toward you so the channel sits flat behind the drywall, slide the plastic cap down until it is flush with the wall, then bend the straps side to side to snap them off.', why: 'Once the cap is seated the channel can’t fall into the wall, so you can attach the cleat later without losing it.', tip: 'Keep tension on the straps while sliding the cap; if you let go, the channel can tilt. If one falls in the wall, just drill a new hole 1″ away.', ok: 'The cap sits flush with the wall and the threaded channel doesn’t move when you push on it.', v: { cam: [0.7, 1.75, 1.0], at: [0.2, 1.8, 0], hi: ['toggles'], show: ['toggles'], xray: true } },
            { t: 'Bolt the wall cleat', d: 'Drill holes in the cleat to match the toggles. Hold it on the line with its 45° edge on top, sloping down toward the wall. Thread the ¼-20 bolts through the cleat into the toggles and tighten with a screwdriver until snug.', why: 'Snug is enough. Overtightening crushes the drywall and weakens the hold.', tip: 'Start all the bolts a few turns before tightening any. That lets you nudge the cleat level before it locks down.', ok: 'The cleat is level, tight to the wall, and doesn’t shift when you pull down hard on it with both hands.', v: { cam: [1.0, 1.7, 1.5], at: [0, 1.8, 0], hi: ['wallCleat', 'toggles'], show: ['wallCleat'], hide: ['marks'], tool: { id: 'screwdriver', at: [0.2, 1.805, 0.026], rot: [90, 0, 0], anim: 'turn' } } },
            { t: 'Hang the mirror', d: 'With a helper, lift the mirror slightly above the wall cleat, press it to the wall and lower it so the mirror cleat drops into the groove. Add a spacer at the bottom of the frame so it hangs flat, and check level.', why: 'The 45° edges pull the mirror toward the wall as it settles, locking it in place.', tip: 'Spacer the same thickness as the cleat: a scrap of cleat stock or stacked felt bumpers. It keeps the mirror from tilting forward.', ok: 'The mirror hangs flat, the bubble is centered on its top edge, and it doesn’t lift off when pushed up gently.', v: { cam: [1.8, 1.6, 3.4], at: [0, 1.45, 0], hi: ['mirror'], show: ['mirror', 'bumpers'] } },
          ],
        },
      ],
      steps: [
        { t: 'Find the studs', d: 'Slide a stud finder across the area and mark both edges of each stud. Confirm with a small nail tapped through the drywall where the mirror will cover it; you’ll feel solid wood behind about ½″ in.', why: 'Studs are usually 16″ apart. A cleat that hits two or three studs can hold far more than any anchor.', tip: 'Studs are almost always 16″ from the next one. Find one confidently and measure to the others, then confirm each.', ok: 'You have the center of at least two studs marked within the cleat’s length, each confirmed by a nail test.', v: { cam: [1.1, 1.65, 1.8], at: [-0.2, 1.7, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true } },
        { t: 'Mark the level line', d: 'Measure from the top of the mirror down to the top of its cleat. Mark the wall cleat line that distance below where you want the mirror’s top. Draw it level using a 4 ft level.', why: 'Center height for mirrors and art is usually 57–60″ from the floor. The cleat itself sets level, so you only level once.', tip: 'Over furniture, plan the bottom of the mirror 6–10″ above the furniture top instead of using the 57–60″ rule.', ok: 'The level line is drawn, the bubble is centered along it, and your stud marks cross it.', v: { cam: [1.0, 1.75, 1.6], at: [0, 1.82, 0], hi: ['marks'], show: ['marks'], hide: ['finder'], tool: { id: 'level', at: [0, 1.851, 0.02], rot: [0, 0, 0], scale: 1.4 } } },
        { t: 'Attach the mirror cleat', d: 'Lay the mirror face-down on a blanket. Screw the cleat across the back of the frame, near the top, with its 45° edge at the bottom and sloping up toward the frame so it forms a hook. Use screws short enough not to reach the front.', why: 'This orientation is what lets the two halves hook together.', tip: 'Measure the frame depth and pick screws at least ¼″ shorter. Drill pilot holes so the frame doesn’t split.', ok: 'The cleat is straight across the frame, firm when you pull on it, and no screw tips show on the front.', v: { cam: [1.6, 1.5, 3.4], at: [0, 1.45, 0.6], hi: ['mirror'], show: ['mirror'], mv: { mirror: [0, 0.05, 0.6] }, rt: { mirror: [0, 180, 0] }, tool: { id: 'drill', at: [0.3, 1.94, 0.62], rot: [-90, 0, 0], anim: 'spin' } } },
        { t: 'Screw the wall cleat to the studs', d: 'Hold the wall cleat on the line with its 45° edge on top, sloping down toward the wall to form a pocket. Drive a #10 × 3″ screw into each stud it crosses, two per stud for heavy mirrors.', why: 'Each screw needs at least 1½″ in solid wood. The screws carry the load in shear (sideways), their strongest direction.', tip: 'Drive one screw, recheck level, then drive the rest. If a screw spins without biting, you missed the stud; move ½″ toward the stud center.', ok: 'The cleat is level and tight to the wall, and every screw pulled firmly into wood.', v: { cam: [0.9, 1.95, 1.3], at: [0, 1.8, 0], hi: ['wallCleat', 'studScrews'], show: ['wallCleat', 'studScrews'], hide: ['marks'], mv: { mirror: [1.6, 0.05, 0.6] }, tool: { id: 'drill', at: [S, 1.805, 0.024], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Lift and drop it on', d: 'With a helper, lift the mirror slightly above the wall cleat, press it against the wall and lower it slowly until the cleats lock together.', why: 'Gravity pulls the beveled cleats together and toward the wall. There’s nothing to line up but the edges.', tip: 'Let the mirror slide down the wall; don’t try to aim. You’ll feel a solid clunk when it seats.', ok: 'You feel and hear the cleats seat, and the mirror won’t lift off unless you push it up first.', v: { cam: [1.8, 1.6, 3.4], at: [0, 1.45, 0], hi: ['mirror', 'wallCleat'], mv: { mirror: [0, 0.06, 0] }, rt: { mirror: [0, 0, 0] } } },
        { t: 'Level and add the spacer', d: 'Check level on top of the frame and slide the mirror sideways a little to fine-tune. Stick a strip the same thickness as the cleat (or felt bumpers) to the bottom back of the frame so it hangs flat.', why: 'Without the spacer, the bottom tips in toward the wall and the mirror looks tilted.', tip: 'Stack felt furniture pads to match the cleat thickness; they also protect the paint.', ok: 'The bubble is centered on the frame top and the mirror is parallel to the wall from top to bottom.', v: { cam: [1.8, 1.6, 3.4], at: [0, 1.45, 0], hi: ['mirror', 'bumpers'], show: ['bumpers'], mv: { mirror: [0, 0, 0] }, tool: { id: 'level', at: [0, 1.984, 0.04], rot: [0, 0, 0], scale: 1.4 } } },
      ],
      tricks: [
        ['Rip your own cleat', 'Rip a strip of ¾″ plywood at 45° down its length on a table saw (or buy one at a hardware store). One strip makes both halves.'],
        ['Z-clips for thin frames', 'Aluminum Z-clip hangers work like a cleat but are only about ¼″ thick, great for thin frames and shelves.'],
        ['Hidden shelf cleat', 'Hang floating shelves the same way: a cleat on the back of a shelf hides all the hardware.'],
        ['Tape template', 'Trace the mirror on kraft paper, tape it to the wall and step back. Move it until it looks right before drilling.'],
        ['Hit a stud by surprise', 'If your toggle hole hits wood, use a 3″ wood screw there instead. Studs beat toggles every time.'],
        ['Plaster walls', 'Plaster is hard and cracks. Drill with a masonry bit in short bursts, and prefer studs over anchors.'],
      ],
      refs: [
        ['SnapToggle technical data (Toggler)', 'https://toggler.co.uk/wp-content/uploads/2021/09/Metric-Technical_SNAPTOGGLE.pdf'],
        ['Snap toggle anchors and load data (McMaster-Carr)', 'https://www.mcmaster.com/snap-toggles'],
        ['TOGGLER BB ¼-20 heavy-duty wall anchors specifications (Parts Express)', 'https://www.parts-express.com/TOGGLER-BB-1-4-20-Heavy-Duty-Wall-Anchors-w-Bolts-2-Pcs.-080-319'],
        ['Toggle bolts product data (Ace Hardware)', 'https://www.acehardware.com/departments/hardware/nuts-and-bolts/toggle-bolts/5065895'],
      ],
      learn: {
        how: 'A French cleat is two strips with matching 45° bevels. The wall half points up and slopes down toward the wall; the mirror half hangs on it pointing down. Weight forces the bevels together, which pulls the mirror tight to the wall and spreads the load along the whole cleat into every stud it crosses.',
        specs: [['Stud spacing', '16″ on center (sometimes 24″)'], ['Screw embedment', '≥ 1½″ into the stud'], ['Mirror center height', '57–60″ from the floor'], ['Snap toggle hole', '½″ for ¼-20 toggles'], ['¼-20 snap toggle, ½″ drywall', '≈ 265 lb tested pull-out; ≈ 65 lb safe working load'], ['Safe working load', '≈ ¼ of the package’s ultimate load']],
        terms: [['French cleat', 'Pair of beveled strips that interlock.'], ['Snap toggle', 'Metal channel that flips behind drywall and grips its back face.'], ['Shear load', 'Weight pulling down along the wall, not out from it.'], ['Ultimate load', 'The force at which a fastener failed in testing; never design to it.']],
        mistakes: ['Relying on plastic expansion anchors for heavy items.', 'Hanging by the wire on two hooks that can slip.', 'Overtightening toggles so the drywall crushes.', 'Using the package’s ultimate load as if it were safe.'],
        tips: ['Aluminum cleats (Z-clips) work well for mirrors with thin frames.'],
      },
      pro: 'The mirror is over 100 lb, the wall is plaster, tile or masonry, or the mirror has no frame (frameless glass needs J-channel and clips).',
    },
    {
      id: 'big-drywall-patch',
      title: 'Patch a large hole in drywall',
      model: 'bigPatch',
      level: 2,
      time: '2–3 hrs over 2 days',
      cost: '$20–40',
      summary: 'Holes from about 6″ up to a foot or more are too big for a mesh patch. Cut the damage back to a clean rectangle, add wood backer strips behind it, screw in a new piece of drywall and tape it like a seam.',
      intro: { hi: ['damage'] },
      safety: ['Look inside the hole with a flashlight before cutting. Avoid wires, pipes and ducts; cut only as deep as the drywall.', 'Turn off the circuit at the breaker if there’s an outlet, switch or cable near the hole, and confirm it’s dead with a tester.', 'Wear an N95 dust mask and glasses when sanding.'],
      causes: [['Doorknob or furniture impact', 'Add a door stop afterward.'], ['Removed fixture or box', 'Old outlet or vent openings.'], ['Plumbing access', 'Holes cut to reach pipes. Consider a screw-on access panel instead if you’ll need in again.']],
      tools: ['Drywall scrap (same thickness, usually ½″)', 'Jab (drywall) saw', 'Utility knife', 'Carpenter’s square or straightedge', '1×3 or 1×4 wood strips (backers)', '1¼″ coarse-thread drywall screws', 'Drill/driver', 'Self-adhesive fiberglass mesh tape', '20- or 45-minute setting compound + lightweight premixed', '6″ and 10″ taping knives + mud pan', 'Fine sanding sponge', 'Primer + paint'],
      variants: [
        { id: 'backer', name: 'New piece on backers', blurb: 'Strongest fix for holes from about 6″ to 16″.' },
        {
          id: 'california',
          name: 'California patch',
          blurb: 'No screws or strips: a drywall plug with paper flaps that glue in with compound. Best for 4–8″ holes.',
          time: '1½–2 hrs over 2 days',
          cost: '$10–25',
          tools: ['Drywall scrap', 'Utility knife', 'Jab saw', 'Square or straightedge', 'Joint compound', '6″ and 10″ knives', 'Fine sanding sponge', 'Primer + paint'],
          steps: [
            { t: 'Square up the hole', d: 'Look inside with a flashlight, then draw a neat square or rectangle just outside the damage with a square and pencil. Score along the lines with a utility knife.', why: 'Straight edges are easy to match with a plug. The knife score keeps the face paper from tearing when you saw.', tip: 'Cut the plug first (next steps), then trace its gypsum core on the wall. The hole will match the plug exactly.', ok: 'Clean scored lines form a square around all the damage, with solid wall outside them.', v: { cam: [0.65, 1.2, 1.25], at: [0.2, 1.0, 0], hi: ['outline', 'damage'], show: ['outline'], tool: { id: 'utilityKnife', at: [0.3, 1.04, 0.002], rot: [70, 0, 0] } } },
            { t: 'Cut out the damage', d: 'Push the jab saw tip through at a corner and saw along each line, keeping the blade shallow and square to the wall. Pull out the damaged piece.', why: 'You need clean, firm edges all the way around for the compound and paper to grip.', tip: 'Hold the saw at a low angle so the tip only goes about 1″ deep. That keeps it away from wires behind the wall.', ok: 'A neat square hole with firm edges and no hanging paper.', v: { cam: [0.6, 1.15, 0.9], at: [0.2, 1.0, 0], hi: ['studs', 'wall'], hide: ['damage', 'outline'] } },
            { t: 'Make the plug', d: 'Cut a drywall scrap 2″ bigger than the hole on every side. On the back, mark the hole size in the center. Score those lines, snap the gypsum and peel it away from the front paper, leaving 2″ paper flaps all around.', why: 'The paper flaps act like built-in tape, so you don’t need backer strips or screws.', tip: 'Bend the gypsum strip back and peel it slowly, like opening a bandage. If a flap tears, use the rest anyway; tape covers small gaps.', ok: 'The gypsum center fits in the hole snugly, and four intact paper flaps stick out about 2″ each.', v: { cam: [0.9, 1.2, 1.3], at: [0.45, 1.05, 0.2], hi: ['calPatch'], show: ['calPatch'], mv: { calPatch: [0.35, 0.05, 0.25] }, rt: { calPatch: [0, 160, 0] }, tool: { id: 'utilityKnife', at: [0.63, 1.1, 0.24], rot: [0, 0, 30] } } },
            { t: 'Butter and set it', d: 'Spread a thin layer of compound around the hole, about 2″ wide. Press the plug in, then smooth the paper flaps flat with a 6″ knife from the center out, squeezing the extra compound out from under them.', why: 'A thin bed of compound under the paper glues it down, just like taping a seam.', tip: 'Press until the flaps lie flat with no bubbles; a bubble left now becomes a blister later. If one appears after drying, slit it and fill.', ok: 'The flaps lie flat with no lumps or bubbles, and the plug face sits flush with the wall.', v: { cam: [0.65, 1.2, 1.25], at: [0.2, 1.0, 0], hi: ['calPatch'], mv: { calPatch: [0, 0, 0] }, rt: { calPatch: [0, 0, 0] }, tool: { id: 'puttyKnife', at: [0.2, 1.1, 0.004], rot: [60, 0, 0] } } },
            { t: 'Feather two coats', d: 'When dry, skim a wider coat with the 10″ knife, covering the flaps by 2–3″. Let it dry, then add a final thin coat a little wider still.', why: 'Wide, thin coats hide the slight bump of the paper flaps.', tip: 'Press harder on the outside edge of the knife so the coat tapers to nothing at the edges.', ok: 'A straightedge laid across the patch barely rocks, and the edges blend into the wall.', v: { cam: [0.7, 1.2, 1.4], at: [0.2, 1.0, 0], hi: ['mud1', 'mud2'], show: ['mud1', 'mud2'], tool: { id: 'puttyKnife', at: [0.3, 1.15, 0.006], rot: [60, 0, 0] } } },
            { t: 'Sand, prime and paint', d: 'Sand lightly with a fine sponge, checking with a flashlight held flat to the wall. Wipe off dust, prime the patch, then paint the wall.', why: 'Primer stops the compound from showing through as a dull spot.', tip: 'Sanded through to the paper? Don’t keep going. Prime it and skim one more thin coat.', ok: 'With the flashlight skimming across, no edges or ridges show, and after painting the patch disappears.', v: { cam: [1.2, 1.4, 2.2], at: [0.2, 1.1, 0], hi: ['paint'], show: ['paint'], tool: { id: 'roller', at: [0.45, 1.1, 0.006], rot: [90, 0, 0], anim: 'slide' } } },
          ],
        },
      ],
      steps: [
        { t: 'Mark a square around the damage', d: 'Shine a flashlight inside to check for wires and pipes. Draw a square or rectangle just outside the damage with a straightedge. If a stud is close, extend the rectangle to the middle of the stud.', why: 'Straight sides are easy to measure and match. Ragged edges are hard to tape.', tip: 'Cut your new piece first, hold it over the hole and trace around it. The hole then matches the piece perfectly.', ok: 'Neat straight lines frame the damage with firm, undamaged drywall outside them.', v: { cam: [0.65, 1.2, 1.25], at: [0.2, 1.0, 0], hi: ['outline', 'damage'], show: ['outline'], tool: { id: 'tape', at: [0.1, 0.9, 0.006], rot: [0, 0, -90] } } },
        { t: 'Cut it out', d: 'Score the lines with a utility knife, then cut through with a jab saw, holding it at a low angle so the tip stays shallow. Pull out the damaged piece.', why: 'A shallow cut won’t hit wires or pipes, and the knife score keeps the face paper from tearing.', tip: 'Start the saw by pushing the tip through at a corner. Short strokes are easier to control.', ok: 'A clean rectangular hole with straight, firm edges.', v: { cam: [0.6, 1.15, 0.9], at: [0.2, 1.0, 0], hi: ['studs', 'wall'], hide: ['damage', 'outline'], tool: { id: 'utilityKnife', at: [0.3, 1.0, 0.002], rot: [70, 0, 0] } } },
        { t: 'Screw in backer strips', d: 'Cut two 1×3 strips about 4″ longer than the hole. Slip each inside along an edge, half behind the drywall. Hold each tight to the back of the wall and drive 1¼″ drywall screws through the wall into it, about 1″ from the hole edge.', why: 'The strips give the new piece something solid to screw into where there’s no stud.', tip: 'Hold the strip with a screw driven partway into its middle as a handle, so it can’t fall into the wall.', ok: 'Both strips are tight to the back of the drywall and don’t move when you push on them.', v: { cam: [0.6, 1.2, 0.9], at: [0.2, 1.0, 0], hi: ['backers', 'backerScrews'], show: ['backers', 'backerScrews'], tool: { id: 'drill', at: [0.085, 1.13, 0.003], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Screw in the new piece', d: 'Cut drywall of the same thickness to fit with about ⅛″ gap all around. Screw it to the strips every 4–6″, sinking each screw head just below the surface without tearing the paper.', why: 'A dimpled screw head fills with compound and disappears. A torn face weakens the hold.', tip: 'A dimpler bit stops each screw at the right depth. Piece too tight? Shave the edge with a utility knife or rasp; don’t force it.', ok: 'The new piece sits flush with the wall, doesn’t flex when pressed, and no screw head sticks up.', v: { cam: [0.6, 1.2, 0.9], at: [0.2, 1.0, 0], hi: ['newPiece', 'pieceScrews'], show: ['newPiece', 'pieceScrews'], tool: { id: 'drill', at: [0.285, 1.06, 0.003], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Tape the seams', d: 'Stick mesh tape over all four seams. Mix setting compound and spread a coat over the tape, pressing it through the mesh, about 6″ wide. Also cover all screw heads. Let it harden.', why: 'Tape bridges the joints so they don’t crack. Setting compound is harder and shrinks less than premixed for the first coat over mesh tape.', tip: 'Mix only what you can use in the time on the bag (20 or 45 minutes). It hardens on schedule, even in the pan.', ok: 'The tape is fully covered, the seams are filled flush, and nothing is thicker than a thin coat.', v: { cam: [0.65, 1.2, 1.1], at: [0.2, 1.0, 0], hi: ['meshTape', 'mud1'], show: ['meshTape', 'mud1'], tool: { id: 'puttyKnife', at: [0.2, 1.1, 0.004], rot: [60, 0, 0] } } },
        { t: 'Feather the finish coats', d: 'Apply two more thin coats of lightweight compound with the 10″ knife, each 2–3″ wider than the last, letting each dry. Scrape off any ridges with the knife edge between coats.', why: 'A patch feathered 12–16″ wide is invisible even in raking light.', tip: 'Fan the coats out past the edges, not straight up the middle. The center should stay thin.', ok: 'The patch is about 12–16″ across, and a straightedge laid over it rocks only slightly in the middle.', v: { cam: [0.7, 1.2, 1.4], at: [0.2, 1.0, 0], hi: ['mud2'], show: ['mud2'], tool: { id: 'puttyKnife', at: [0.36, 1.15, 0.006], rot: [60, 0, 0] } } },
        { t: 'Sand, prime and paint', d: 'Sand lightly with a fine sponge, checking with a flashlight held flat. Wipe off dust, prime the patch, and paint the whole wall corner to corner.', why: 'Touching up just the patch almost always shows, because fresh paint has a slightly different sheen.', tip: 'If your wall has texture, match it before priming using spray texture or a damp sponge dabbed in thin compound.', ok: 'From across the room in daylight, you can’t find the patch.', v: { cam: [1.2, 1.4, 2.2], at: [0.2, 1.1, 0], hi: ['paint'], show: ['paint'], tool: { id: 'roller', at: [0.45, 1.1, 0.006], rot: [90, 0, 0], anim: 'slide' } } },
      ],
      tricks: [
        ['Cut the piece first', 'Cut the new drywall piece, hold it on the wall and trace it. Cutting the hole to match is easier than cutting a piece to match a hole.'],
        ['One-day patch', 'Use 20-minute setting compound for the first two coats, and you can sand and prime the same day.'],
        ['Screw handle trick', 'Drive a screw halfway into each backer strip as a handle so you can’t drop it inside the wall.'],
        ['Stud nearby', 'If a stud is within a few inches, extend the cut to its center line and screw the new piece directly to it.'],
        ['Access panel', 'Plumbing hole you may need again? Install a plastic access panel instead of patching it.'],
        ['Scrap drywall', 'Home centers sell 2 × 2 ft drywall panels, so you don’t need a whole sheet.'],
      ],
      refs: [
        ['Gypsum Board repair methods (Gypsum Association text, via InspectApedia)', 'https://inspectapedia.com/interiors/Gypsum_Board_Nail_Pops.pdf'],
        ['The Gypsum Construction Handbook (USG)', 'https://www.usg.com/'],
        ['Drywall repair guides (Ask the Builder)', 'https://www.askthebuilder.com/how-to-repair-nail-pops-in-drywall/'],
      ],
      learn: {
        how: 'Drywall is only strong when it’s fastened at its edges. A hole bigger than a few inches has no support in the middle, so the fix is to rebuild that support: backer strips or a stud behind, a new piece screwed on, and tape over the seams so the joint moves as one sheet.',
        specs: [['Wall thickness', '½″ (⅝″ in garages and some ceilings)'], ['Gap around new piece', '≈ ⅛″'], ['Screw', '1¼″ coarse-thread drywall, every 4–6″'], ['Patch width when done', '12–16″ feathered'], ['California patch flaps', '≈ 2″ paper on each side']],
        terms: [['Backer / furring strip', 'Wood strip behind the hole that the new piece screws into.'], ['Setting compound', 'Powder you mix with water; hardens chemically in 20–90 min.'], ['Feathering', 'Tapering each coat thinner at the edges.'], ['Jab saw', 'A short pointed hand saw for drywall.']],
        mistakes: ['Skipping tape on the seams, so they crack.', 'Driving screws so deep they tear the paper.', 'One thick coat of compound.', 'Using premixed compound over mesh tape for the first coat.'],
        tips: ['Use 20-minute setting compound for the first coat to finish in one day.'],
      },
      pro: 'The hole is in a ceiling, there’s water damage or mold, or the wall is plaster on lath.',
    },
  ]);
})();

/* =====================================================================
   DOORS: models
   ===================================================================== */
(function () {
  const { VIEW } = TB.IM;
  const KH = 0.914; // knob height (36″)
  const BS = 0.0603; // 2⅜″ backset

  /* Open door scene. The slab stands open 90°, in the plane z = 0, latch edge at x = 0
     facing +x; the wall (with the latch jamb + strike) runs along z behind it.
     o: { W, t, bores: [y...], slabMat, label } */
  function openDoor(K, o) {
    const W = o.W, t = o.t;
    const XW = -W + t / 2; // room-side face of the wall
    const D = 0.114 + (o.ext ? 0.05 : 0);
    const wallM = K.std(0xe9e4d8, { roughness: 0.93 });
    const trimM = K.std(0xf7f5ef, { roughness: 0.45 });
    // wall (runs along z) with the door opening z ∈ [-W, 0.006]
    const wall = K.part('wallZ', [0, 0, 0], null, 'Wall');
    K.box(wall, [D, 2.44, 1.2], wallM, [XW - D / 2, 1.22, 0.025 + 0.6], null, 0);
    K.box(wall, [D, 2.44, 1.0], wallM, [XW - D / 2, 1.22, -W - 0.019 - 0.5], null, 0);
    K.box(wall, [D, 0.38, W + 0.05], wallM, [XW - D / 2, 2.25, -W / 2], null, 0);
    // jambs, stops, casing
    const jamb = K.part('jamb', [0, 0, 0], null, 'Door jamb (latch side)');
    K.box(jamb, [D, 2.06, 0.019], trimM, [XW - D / 2, 1.03, -W - 0.0095], null, 0.002);
    K.box(jamb, [0.012, 2.04, 0.012], trimM, [XW - t - 0.006, 1.02, -W + 0.006], null, 0.002);
    K.box(wall, [D, 2.06, 0.019], trimM, [XW - D / 2, 1.03, 0.0155], null, 0.002);
    K.box(wall, [D, 0.019, W + 0.04], trimM, [XW - D / 2, 2.06, -W / 2], null, 0.002);
    K.box(wall, [0.016, 2.12, 0.064], trimM, [XW + 0.008, 1.06, 0.025 + 0.032], null, 0.003);
    K.box(wall, [0.016, 2.12, 0.064], trimM, [XW + 0.008, 1.06, -W - 0.019 - 0.032], null, 0.003);
    K.box(wall, [0.016, 0.064, W + 0.172], trimM, [XW + 0.008, 2.06 + 0.051, -W / 2], null, 0.003);
    K.box(wall, [0.012, 0.09, 1.2], trimM, [XW + 0.006, 0.045, 0.089 + 0.6], null, 0.003);
    // door slab with bores
    const door = K.part('door', [0, 0, 0], null, o.label || 'Door slab');
    const holes = (o.bores || []).map((y) => K.circle(-BS, y, 0.027, 32).reverse());
    K.ext(door, [[-W, 0.012], [0, 0.012], [0, 2.044], [-W, 2.044]], t, o.slabMat || trimM, [0, 0, -t / 2], null, 0.0015, holes);
    // edge bores (dark) where a latch or bolt will go
    (o.bores || []).forEach((y) => {
      K.cyl(door, [0.0127, 0.0127, 0.001, 24], 'black', [0.0004, y, 0], [0, 0, 90]);
      K.cyl(door, [0.0127, 0.0127, BS - 0.027, 24, true], K.std(0x6b5a45, { roughness: 1, side: 2 }), [-(BS - 0.027) / 2, y, 0], [0, 0, 90]);
      K.cyl(door, [0.027, 0.027, t - 0.002, 32, true], K.std(0x8a7558, { roughness: 1, side: 2 }), [-BS, y, 0], [90, 0, 0]);
    });
    // hinges on the hinge edge
    [0.18, 1.0, 1.85].forEach((y) => {
      K.box(door, [0.002, 0.089, 0.03], 'brass', [-W, y, t / 2 - 0.015], null, 0);
      K.cyl(door, [0.0065, 0.0065, 0.089, 16], 'brass', [-W - 0.002, y, t / 2 + 0.004]);
    });
    return { XW, D, W, t };
  }
  // Knob or lever on one side of the door (side +1 = room side +z, -1 = other side).
  function handle(K, p, y, t, side, style, finish) {
    const z = side * t / 2;
    const ax = side > 0 ? [90, 0, 0] : [-90, 0, 0];
    K.cyl(p, [0.031, 0.033, 0.008, 40], finish, [-BS, y, z + side * 0.004], [90, 0, 0]);
    K.cyl(p, [0.012, 0.014, 0.03, 24], finish, [-BS, y, z + side * 0.022], [90, 0, 0]);
    if (style === 'lever') {
      K.box(p, [0.115, 0.018, 0.016], finish, [-BS - 0.05, y, z + side * 0.045], null, 0.006);
      K.sph(p, 0.012, finish, [-BS, y, z + side * 0.045]);
    } else {
      K.lathe(p, [[0, 0], [0.013, 0], [0.015, 0.012], [0.026, 0.024], [0.0295, 0.04], [0.026, 0.054], [0.012, 0.06], [0, 0.061]], finish, [-BS, y, z + side * 0.034], ax);
    }
  }
  // Latch: faceplate on the edge + bolt + tube body into the bore.
  function latch(K, p, y, finish, dead) {
    K.box(p, [0.003, dead ? 0.0667 : 0.057, 0.025], finish, [0.0015, y, 0], null, 0);
    if (dead) K.box(p, [0.006, 0.022, 0.022], finish, [0.0045, y, 0], null, 0.001);
    else K.ext(K.group(p, [0.003, y, 0], [0, 0, 0]), [[0, -0.009], [0.011, -0.009], [0.004, 0.009], [0, 0.009]], 0.012, finish, [0, 0, -0.006], null, 0.001);
    K.cyl(p, [0.0115, 0.0115, BS + 0.01, 20], 'steel', [-(BS + 0.01) / 2, y, 0], [0, 0, 90]);
    [-1, 1].forEach((s) => K.screw(p, 0.0035, 0.025, finish, [0.003, y + s * (dead ? 0.025 : 0.021), 0], [0, 0, -90], 'flat'));
  }
  function strike(K, p, x, y, z, finish, box) {
    K.box(p, [0.03, 0.06, 0.002], finish, [x, y, z + 0.001], null, 0);
    K.box(p, [0.016, 0.024, 0.003], 'black', [x, y, z + 0.0015], null, 0);
    if (box) K.box(p, [0.018, 0.026, 0.02], 'steel', [x, y, z - 0.01], null, 0.002);
    [-1, 1].forEach((s) => K.screw(p, 0.0042, box ? 0.076 : 0.025, finish, [x, y + s * 0.022, z + 0.002], [90, 0, 0], 'flat'));
  }

  /* ---- Lockset swap (knob / lever) and smart deadbolt ---- */
  function locksetScene(K, mode) {
    const g = openDoor(K, { W: 0.813, t: 0.035, bores: mode === 'smart' ? [KH, KH + 0.14] : [KH], label: 'Door (1⅜″ interior)' });
    const old = K.std(0xc49a4c, { metalness: 0.9, roughness: 0.35 });
    const nickel = K.std(0xb9bcbc, { metalness: 0.95, roughness: 0.28 });
    const black = K.std(0x26272a, { metalness: 0.5, roughness: 0.4 });
    const sx = g.XW - g.t / 2;
    if (mode === 'smart') {
      const k = K.part('knob', [0, 0, 0], null, 'Existing knob');
      handle(K, k, KH, g.t, 1, 'knob', nickel);
      handle(K, k, KH, g.t, -1, 'knob', nickel);
      latch(K, k, KH, nickel);
      const DY = KH + 0.14;
      const ob = K.part('oldBolt', [0, 0, 0], null, 'Old deadbolt (bolt + faceplate)');
      latch(K, ob, DY, old, true);
      const oc = K.part('oldOutside', [0, 0, 0], null, 'Old keyed cylinder (outside)');
      K.cyl(oc, [0.033, 0.035, 0.012, 40], old, [-BS, DY, -g.t / 2 - 0.006], [90, 0, 0]);
      K.cyl(oc, [0.014, 0.014, 0.004, 24], K.std(0x8a6a30, { metalness: 0.9, roughness: 0.4 }), [-BS, DY, -g.t / 2 - 0.0135], [90, 0, 0]);
      const oi = K.part('oldTurn', [0, 0, 0], null, 'Old thumb turn (inside)');
      K.cyl(oi, [0.031, 0.033, 0.01, 40], old, [-BS, DY, g.t / 2 + 0.005], [90, 0, 0]);
      K.box(oi, [0.012, 0.042, 0.014], old, [-BS, DY, g.t / 2 + 0.016], null, 0.004);
      [-1, 1].forEach((s) => K.screw(oi, 0.004, 0.06, old, [-BS, DY + s * 0.022, g.t / 2 + 0.011], [90, 0, 0]));
      const nb = K.part('newBolt', [0, 0, 0], null, 'New deadbolt (bolt)');
      latch(K, nb, DY, black, true);
      const kp = K.part('keypad', [0, 0, 0], null, 'Keypad (outside) + tailpiece');
      K.box(kp, [0.066, 0.165, 0.026], black, [-BS, DY + 0.02, -g.t / 2 - 0.013], null, 0.012);
      K.rep(12, (i) => K.cyl(kp, [0.0055, 0.0055, 0.002, 16], K.std(0x9bb7d4, { emissive: 0x3d7fd0, emissiveIntensity: 0.5 }), [-BS - 0.016 + (i % 3) * 0.016, DY + 0.065 - Math.floor(i / 3) * 0.018, -g.t / 2 - 0.027], [90, 0, 0]));
      K.box(kp, [0.004, 0.012, 0.07], 'steel', [-BS, DY, -0.01], null, 0); // tailpiece / torque blade
      K.cyl(kp, [0.0035, 0.0035, 0.09, 8], 'black', [-BS + 0.015, DY - 0.02, 0], [90, 0, 0]); // cable
      const mp = K.part('mountPlate', [0, 0, 0], null, 'Mounting plate');
      K.box(mp, [0.06, 0.12, 0.003], 'steel', [-BS, DY + 0.01, g.t / 2 + 0.0015], null, 0);
      [-1, 1].forEach((s) => K.screw(mp, 0.0045, 0.06, 'steel', [-BS, DY + s * 0.022, g.t / 2 + 0.003], [90, 0, 0]));
      const iu = K.part('insideUnit', [0, 0, 0], null, 'Inside unit (motor + batteries)');
      K.box(iu, [0.074, 0.175, 0.05], black, [-BS, DY + 0.015, g.t / 2 + 0.028], null, 0.016);
      K.box(iu, [0.016, 0.05, 0.02], K.std(0x3a3c40, { metalness: 0.5 }), [-BS, DY, g.t / 2 + 0.06], null, 0.006);
      K.sph(iu, 0.0025, 'ledG', [-BS, DY + 0.085, g.t / 2 + 0.053]);
      const bat = K.part('batteries', [0, 0, 0], null, '4 × AA batteries');
      K.rep(4, (i) => K.cyl(bat, [0.007, 0.007, 0.05, 16], i % 2 ? 'dark' : K.std(0xc8a03c, { metalness: 0.6 }), [-BS - 0.024 + i * 0.016, DY + 0.06, g.t / 2 + 0.06]));
      const sk = K.part('strike', [0, 0, 0], null, 'Deadbolt strike');
      strike(K, sk, sx, DY, -g.W, black, true);
      return {
        tick(t, fx) {
          nb.position.x = fx === 'throw' ? 0.012 + 0.012 * Math.sin(t * 2) : 0;
        },
      };
    }
    const style = mode === 'lever' ? 'lever' : 'knob';
    const ok = K.part('oldIn', [0, 0, 0], null, 'Old knob (inside half)');
    handle(K, ok, KH, g.t, 1, 'knob', old);
    const sc = K.part('screws', [0, 0, 0], null, 'Through-bolt screws');
    [-1, 1].forEach((s) => K.screw(sc, 0.0042, 0.05, old, [-BS + s * 0.022, KH, g.t / 2 + 0.009], [90, 0, 0]));
    const oo = K.part('oldOut', [0, 0, 0], null, 'Old knob (outside half)');
    handle(K, oo, KH, g.t, -1, 'knob', old);
    const ol = K.part('oldLatch', [0, 0, 0], null, 'Old latch');
    latch(K, ol, KH, old);
    const nl = K.part('newLatch', [0, 0, 0], null, 'New latch (bevel toward the strike)');
    latch(K, nl, KH, nickel);
    const no = K.part('newOut', [0, 0, 0], null, style === 'lever' ? 'Outside lever + spindle' : 'Outside knob + spindle');
    handle(K, no, KH, g.t, -1, style, nickel);
    K.box(no, [0.008, 0.008, g.t + 0.01], 'steel', [-BS, KH, 0], null, 0);
    [-1, 1].forEach((s) => K.cyl(no, [0.004, 0.004, g.t, 12], 'steel', [-BS + s * 0.022, KH, 0], [90, 0, 0]));
    const ni = K.part('newIn', [0, 0, 0], null, style === 'lever' ? 'Inside lever' : 'Inside knob');
    handle(K, ni, KH, g.t, 1, style, nickel);
    const ns = K.part('newScrews', [0, 0, 0], null, 'New through-bolts');
    [-1, 1].forEach((s) => K.screw(ns, 0.0042, 0.05, nickel, [-BS + s * 0.022, KH, g.t / 2 + 0.009], [90, 0, 0]));
    const sk = K.part('strike', [0, 0, 0], null, 'Strike plate');
    strike(K, sk, sx, KH, -g.W, old);
    const nsk = K.part('newStrike', [0, 0, 0], null, 'New strike plate');
    strike(K, nsk, sx, KH, -g.W + 0.0005, nickel);
    return {};
  }
  const LOCK_VIEW = { cam: [0.42, 1.12, 0.5], at: [-0.06, KH, 0], assets: [] };
  TB.model('lockset', VIEW(Object.assign({ hidden: ['newLatch', 'newOut', 'newIn', 'newScrews', 'newStrike'] }, LOCK_VIEW)), (K) => locksetScene(K, 'knob'));
  TB.model('locksetLever', VIEW(Object.assign({ hidden: ['newLatch', 'newOut', 'newIn', 'newScrews', 'newStrike'] }, LOCK_VIEW)), (K) => locksetScene(K, 'lever'));
  TB.model('smartLock', VIEW({ cam: [0.42, 1.25, 0.5], at: [-0.06, KH + 0.14, 0], hidden: ['newBolt', 'keypad', 'mountPlate', 'insideUnit', 'batteries'] }), (K) => locksetScene(K, 'smart'));

  /* ---- Install a new deadbolt in an exterior door ---- */
  TB.model(
    'deadboltInstall',
    VIEW({ cam: [0.42, 1.2, 0.55], at: [-0.06, 1.0, 0], hidden: ['template', 'faceBore', 'edgeBore', 'mortise', 'chisel', 'bolt', 'cylinder', 'thumbturn', 'strikeMarks', 'strikeBox'] }),
    (K) => {
      const g = openDoor(K, { W: 0.914, t: 0.0445, bores: [KH], slabMat: K.std(0x2f4a6b, { roughness: 0.4 }), label: 'Exterior door (1¾″)' });
      const DY = KH + 0.14;
      const nickel = K.std(0x3a3b3e, { metalness: 0.7, roughness: 0.35 });
      const k = K.part('knob', [0, 0, 0], null, 'Existing knob (passage)');
      handle(K, k, KH, g.t, 1, 'knob', nickel);
      handle(K, k, KH, g.t, -1, 'knob', nickel);
      latch(K, k, KH, nickel);
      const tp = K.part('template', [0, 0, 0], null, 'Paper template (folded over the edge)');
      const paper = K.std(0xf7f4ea, { roughness: 1 });
      K.box(tp, [0.12, 0.1, 0.0008], paper, [-0.06, DY, g.t / 2 + 0.0006], null, 0);
      K.box(tp, [0.0008, 0.1, g.t], paper, [0.0006, DY, 0], null, 0);
      K.cyl(tp, [0.027, 0.027, 0.0004, 32], K.std(0x9a9a9a, { roughness: 1, transparent: true, opacity: 0.6 }), [-BS, DY, g.t / 2 + 0.0012], [90, 0, 0]);
      K.box(tp, [0.006, 0.0012, 0.0012], 'red', [-BS, DY, g.t / 2 + 0.0014], null, 0);
      K.box(tp, [0.0012, 0.006, 0.0012], 'red', [-BS, DY, g.t / 2 + 0.0014], null, 0);
      const fb = K.part('faceBore', [0, 0, 0], null, '2⅛″ face bore');
      K.cyl(fb, [0.027, 0.027, g.t + 0.0012, 32], K.std(0x16130f, { roughness: 1 }), [-BS, DY, 0], [90, 0, 0]);
      K.cyl(fb, [0.0285, 0.0285, g.t + 0.0006, 32], K.std(0xb08c62, { roughness: 1 }), [-BS, DY, 0], [90, 0, 0]);
      const eb = K.part('edgeBore', [0, 0, 0], null, '1″ edge bore');
      K.cyl(eb, [0.0127, 0.0127, 0.0016, 24], K.std(0x16130f, { roughness: 1 }), [0.0002, DY, 0], [0, 0, 90]);
      const mo = K.part('mortise', [0, 0, 0], null, 'Faceplate mortise (⅛″ deep)');
      K.box(mo, [0.0012, 0.0667, 0.025], K.std(0xc79e6a, { roughness: 1 }), [0.0004, DY, 0], null, 0);
      K.cyl(mo, [0.0127, 0.0127, 0.0016, 24], K.std(0x16130f, { roughness: 1 }), [0.0006, DY, 0], [0, 0, 90]);
      const ch = K.part('chisel', [0.03, DY + 0.033, 0], null, '¾″ wood chisel');
      K.box(ch, [0.06, 0.019, 0.004], 'toolSteel', [0.03, 0, 0], null, 0.001);
      K.cyl(ch, [0.012, 0.014, 0.11, 16], 'gripYellow', [0.115, 0, 0], [0, 0, 90]);
      const bolt = K.part('bolt', [0, 0, 0], null, 'Deadbolt latch (bolt)');
      latch(K, bolt, DY, nickel, true);
      const cyl = K.part('cylinder', [0, 0, 0], null, 'Keyed cylinder (outside) + tailpiece');
      K.cyl(cyl, [0.032, 0.035, 0.016, 40], nickel, [-BS, DY, -g.t / 2 - 0.008], [90, 0, 0]);
      K.cyl(cyl, [0.013, 0.013, 0.004, 24], K.std(0x9b9fa3, { metalness: 0.9, roughness: 0.3 }), [-BS, DY, -g.t / 2 - 0.017], [90, 0, 0]);
      K.box(cyl, [0.0016, 0.006, 0.002], 'black', [-BS, DY, -g.t / 2 - 0.019], null, 0);
      K.box(cyl, [0.003, 0.009, g.t + 0.01], 'steel', [-BS, DY, 0], null, 0);
      const tt = K.part('thumbturn', [0, 0, 0], null, 'Thumb turn (inside)');
      K.cyl(tt, [0.032, 0.035, 0.012, 40], nickel, [-BS, DY, g.t / 2 + 0.006], [90, 0, 0]);
      K.box(tt, [0.012, 0.045, 0.016], nickel, [-BS, DY, g.t / 2 + 0.019], null, 0.004);
      [-1, 1].forEach((s) => K.screw(tt, 0.0042, 0.07, nickel, [-BS, DY + s * 0.024, g.t / 2 + 0.013], [90, 0, 0]));
      const sx = g.XW - g.t / 2;
      const smk = K.part('strikeMarks', [0, 0, 0], null, 'Bolt mark + strike outline on the jamb');
      K.box(smk, [0.034, 0.068, 0.0008], K.std(0xc79e6a, { roughness: 1 }), [sx, DY, -g.W + 0.0005], null, 0);
      K.cyl(smk, [0.0127, 0.0127, 0.001, 24], K.std(0x16130f), [sx, DY, -g.W + 0.0008], [90, 0, 0]);
      const sb = K.part('strikeBox', [0, 0, 0], null, 'Reinforced strike + 3″ screws');
      strike(K, sb, sx, DY, -g.W + 0.0008, nickel, true);
      return {};
    }
  );

  /* ---- Pre-hung door in a rough opening (interior or exterior) ---- */
  function prehungScene(K, ext) {
    const W = ext ? 0.914 : 0.762; // 36″ exterior, 30″ interior slab
    const t = ext ? 0.0445 : 0.035;
    const JD = ext ? 0.17 : 0.116; // jamb depth
    const unitW = W + 2 * 0.019 + 0.006;
    const RO = unitW + 0.0127;
    const ROH = 2.096;
    const wallT = ext ? 0.14 : 0.089;
    const z0 = 0; // stud centre plane
    const zf = wallT / 2 + 0.0127; // finished face (+z)
    const lumber = 'woodLight';
    const wallM = K.std(ext ? 0xd9d5cc : 0xe9e4d8, { roughness: 0.93 });
    // framing
    const fr = K.part('framing', [0, 0, 0], null, 'Rough opening (king + jack studs, header)');
    [-1, 1].forEach((s) => {
      K.box(fr, [0.038, ROH, wallT], lumber, [s * (RO / 2 + 0.019), ROH / 2, z0], null, 0.002); // jack
      K.box(fr, [0.038, 2.44, wallT], lumber, [s * (RO / 2 + 0.057), 1.22, z0], null, 0.002); // king
      K.box(fr, [0.038, 2.44, wallT], lumber, [s * (RO / 2 + 0.057 + 0.406), 1.22, z0], null, 0.002);
    });
    K.box(fr, [RO + 0.076, 0.184, wallT], lumber, [0, ROH + 0.092, z0], null, 0.002); // header
    K.box(fr, [RO + 1.0, 0.038, wallT], lumber, [0, 2.44 - 0.019, z0], null, 0.002);
    [-1, 1].forEach((s) => K.box(fr, [0.4, 0.038, wallT], lumber, [s * (RO / 2 + 0.276), 0.019, z0], null, 0.002));
    // wall covering (+z face), leaving the framing visible around the opening
    const sk = K.part('wallFace', [0, 0, 0], null, ext ? 'Sheathing + housewrap' : 'Drywall');
    const face = ext ? K.std(0xe8ecef, { roughness: 0.8 }) : wallM;
    const x0 = RO / 2 + 0.076;
    [-1, 1].forEach((s) => K.box(sk, [0.9, 2.44, 0.0127], face, [s * (x0 + 0.45), 1.22, zf - 0.00635], null, 0));
    K.box(sk, [2 * x0, 2.44 - ROH - 0.184, 0.0127], face, [0, (ROH + 0.184 + 2.44) / 2, zf - 0.00635], null, 0);
    K.box(null, [2 * x0 + 1.8, 2.44, 0.0127], wallM, [0, 1.22, -zf + 0.00635], null, 0); // back face
    if (ext) {
      K.box(null, [2 * x0 + 1.8, 0.2, 0.3], 'concrete', [0, -0.1, zf + 0.12], null, 0.01); // stoop edge
    }
    // the unit: jambs, stops, slab (swings), hinges
    const trimM = K.std(0xf7f5ef, { roughness: 0.45 });
    const slabM = ext ? K.std(0x7a2e2a, { roughness: 0.38 }) : trimM;
    const unit = K.part('unit', [0, 0, 0], null, ext ? 'Pre-hung exterior unit' : 'Pre-hung door unit');
    const jz = zf - JD / 2 + (ext ? 0.0 : 0.001);
    const sillH = ext ? 0.035 : 0;
    const UH = 2.032 + 0.003 + 0.019 + (ext ? sillH : 0.013);
    [-1, 1].forEach((s) => K.box(unit, [0.019, UH, JD], trimM, [s * (unitW / 2 - 0.0095), UH / 2, jz], null, 0.002));
    K.box(unit, [unitW, 0.019, JD], trimM, [0, UH - 0.0095, jz], null, 0.002);
    const slabZ = zf - 0.004 - t / 2 - (ext ? 0.03 : 0);
    [-1, 1].forEach((s) => K.box(unit, [0.012, UH - 0.02 - sillH, 0.032], trimM, [s * (unitW / 2 - 0.025), (UH - 0.02 + sillH) / 2, slabZ - t / 2 - 0.016], null, 0.002));
    K.box(unit, [unitW - 0.05, 0.012, 0.032], trimM, [0, UH - 0.025, slabZ - t / 2 - 0.016], null, 0.002);
    if (ext) {
      const sill = K.part('sill', [0, 0, 0], null, 'Sill + adjustable threshold');
      K.box(sill, [unitW, sillH, JD + 0.04], K.std(0xb8b2a6, { metalness: 0.6, roughness: 0.4 }), [0, sillH / 2, jz + 0.02], null, 0.003);
      K.box(sill, [W, 0.012, 0.09], 'wood', [0, sillH + 0.006, slabZ - 0.01], null, 0.003);
      const ws = K.part('weather', [0, 0, 0], null, 'Weatherstrip + door sweep');
      [-1, 1].forEach((s) => K.box(ws, [0.006, UH - 0.03, 0.008], 'black', [s * (unitW / 2 - 0.022), UH / 2, slabZ - t / 2 - 0.002], null, 0));
      K.box(ws, [W - 0.01, 0.006, 0.008], 'black', [0, UH - 0.022, slabZ - t / 2 - 0.002], null, 0);
    }
    const hingeX = -unitW / 2 + 0.019 + 0.003;
    const slab = K.part('slab', [hingeX, 0, slabZ + t / 2], null, ext ? 'Door slab (steel/fiberglass)' : 'Door slab');
    K.box(slab, [W, 2.032, t], slabM, [W / 2, (ext ? sillH + 0.012 : 0.013) + 1.016, -t / 2], null, 0.003);
    const panelM = ext ? K.std(0x6e2824, { roughness: 0.4 }) : K.std(0xf1efe8, { roughness: 0.5 });
    [[0.5, 0.45], [1.45, 0.75]].forEach(([y, h]) => [0.25, 0.75].forEach((fx) => K.box(slab, [W * 0.36, h, 0.004], panelM, [W * fx, y + (h - 0.45) / 2, 0.001], null, 0.002)));
    [0.18, 1.0, 1.85].forEach((y) => {
      K.box(unit, [0.03, 0.089, 0.002], 'brass', [hingeX - 0.015, y, slabZ + t / 2 + 0.001], null, 0);
      K.cyl(unit, [0.0065, 0.0065, 0.089, 16], 'brass', [hingeX, y, slabZ + t / 2 + 0.006]);
    });
    // shims and fasteners
    const hs = K.part('hingeShims', [0, 0, 0], null, 'Shim pairs behind each hinge');
    const shimM = K.std(0xe2c99a, { roughness: 0.9 });
    [0.18, 1.0, 1.85].forEach((y) => K.box(hs, [0.006, 0.038, JD - 0.02], shimM, [-RO / 2 + 0.003, y, jz], null, 0));
    const ls = K.part('latchShims', [0, 0, 0], null, 'Shims at the latch and top/bottom');
    [0.3, 0.914, 1.85].forEach((y) => K.box(ls, [0.006, 0.038, JD - 0.02], shimM, [RO / 2 - 0.003, y, jz], null, 0));
    const scr = K.part('screws', [0, 0, 0], null, '3″ screws through the shims (and one per hinge)');
    [0.16, 0.98, 1.83].forEach((y) => K.screw(scr, 0.004, 0.076, 'steel', [hingeX - 0.003, y, slabZ + t / 2 + 0.012], [0, 0, 90], 'flat'));
    [0.3, 0.914, 1.85].forEach((y) => K.screw(scr, 0.004, 0.076, 'steel', [unitW / 2 - 0.019, y, slabZ - t / 2 - 0.04], [0, 0, -90], 'flat'));
    // casing
    const cs = K.part('casing', [0, 0, 0], null, ext ? 'Brick mold (exterior casing)' : 'Casing (2¼″)');
    const cw = ext ? 0.051 : 0.057, ct = ext ? 0.032 : 0.016;
    [-1, 1].forEach((s) => K.box(cs, [cw, UH + cw - 0.006, ct], trimM, [s * (unitW / 2 + cw / 2 - 0.006), (UH + cw) / 2 - 0.003, zf + ct / 2], null, 0.003));
    K.box(cs, [unitW + 2 * cw - 0.012, cw, ct], trimM, [0, UH + cw / 2 - 0.006, zf + ct / 2], null, 0.003);
    // hardware
    const hw = K.part('knob', [0, 0, 0], null, ext ? 'Lockset + deadbolt' : 'Knob');
    const fin = K.std(ext ? 0x2a2a2c : 0xb9bcbc, { metalness: 0.9, roughness: 0.3 });
    const kx = hingeX + W - 0.0603;
    [0.914].concat(ext ? [1.054] : []).forEach((y, i) => {
      K.cyl(hw, [0.031, 0.033, 0.008, 40], fin, [kx, y, slabZ + t / 2 + 0.004], [90, 0, 0]);
      if (i === 0) K.lathe(hw, [[0, 0], [0.013, 0], [0.015, 0.03], [0.028, 0.05], [0.029, 0.065], [0.012, 0.072], [0, 0.073]], fin, [kx, y, slabZ + t / 2 + 0.006], [90, 0, 0]);
      else K.box(hw, [0.012, 0.042, 0.014], fin, [kx, y, slabZ + t / 2 + 0.015], null, 0.004);
    });
    if (ext) {
      const pan = K.part('pan', [0, 0, 0], null, 'Sill pan (flashing tape, turned up 6″)');
      const tapeM = K.std(0x30343a, { roughness: 0.7 });
      K.box(pan, [RO, 0.002, wallT + 0.03], tapeM, [0, 0.001, z0 + 0.015], null, 0);
      [-1, 1].forEach((s) => K.box(pan, [0.002, 0.15, wallT + 0.03], tapeM, [s * (RO / 2 - 0.001), 0.075, z0 + 0.015], null, 0));
      K.box(pan, [RO + 0.3, 0.15, 0.002], tapeM, [0, 0.07, zf + 0.001], null, 0);
      const se = K.part('sealant', [0, 0, 0], null, 'Sealant beads (3 rows on the pan)');
      [-0.04, 0.0, 0.04].forEach((dz) => K.cyl(se, [0.004, 0.004, RO - 0.02, 12], K.std(0xece8df, { roughness: 0.4 }), [0, 0.006, zf - 0.06 + dz], [0, 0, 90]));
      const fm = K.part('foam', [0, 0, 0], null, 'Low-expansion foam in the gap');
      const foamM = K.bumpy(0xf0d36a, K.tex.speckle(), 0.002, { roughness: 1 });
      [-1, 1].forEach((s) => K.box(fm, [0.007, ROH - 0.1, 0.05], foamM, [s * (RO / 2 - 0.0035), ROH / 2, zf - 0.04], null, 0.003));
    }
    return {};
  }
  TB.model('prehungDoor', VIEW({ cam: [1.1, 1.35, 2.9], at: [0, 1.05, 0], hidden: ['unit', 'slab', 'hingeShims', 'latchShims', 'screws', 'casing', 'knob'] }), (K) => prehungScene(K, false));
  TB.model(
    'prehungExt',
    VIEW({ cam: [1.2, 1.35, 3.0], at: [0, 1.05, 0], tex: ['plank_flooring', 'brushed_concrete'], hidden: ['unit', 'slab', 'sill', 'weather', 'hingeShims', 'latchShims', 'screws', 'casing', 'knob', 'pan', 'sealant', 'foam'] }),
    (K) => prehungScene(K, true)
  );
})();

/* ---- DOORS: guides ---- */
(function () {
  const KH = 0.914, BS = 0.0603, DY = KH + 0.14;
  const T = 0.035, W = 0.813;
  const EDGE = { cam: [0.42, 1.12, 0.5], at: [-0.06, KH, 0] };
  const OUT = { cam: [0.4, 1.1, -0.55], at: [-0.06, KH, 0] };
  const JAMB = { cam: [-0.5, 1.05, -0.4], at: [-W, KH, -W] };
  const lockSteps = (lever) => [
    { t: 'Check backset and bore', d: 'Open the door and measure from the door edge to the center of the big round hole: that’s the backset, either 2⅜″ or 2¾″. Also measure the door thickness (most interior doors are 1⅜″, exterior 1¾″) and the big hole’s width (2⅛″ standard).', why: 'The backset decides whether the new latch fits without drilling. Most new locksets adjust to both sizes, but the box says which.', tip: 'Take a photo of the old latch and the strike on the frame before you go shopping. Matching the latch faceplate shape (rounded or square corners) saves chiseling.', ok: 'You’ve written down the backset, door thickness and hole size, and the new lockset’s box lists them as compatible.', v: Object.assign({ hi: ['oldLatch', 'door'], tool: { id: 'tape', at: [0.0, KH - 0.035, T / 2 + 0.001], rot: [0, 0, 90] } }, EDGE) },
    { t: 'Remove the inside screws', d: 'On the room side, back out the two screws on the rose (the round plate against the door) with a Phillips screwdriver, holding the outside knob so it doesn’t drop. No screws showing? Look for a tiny slot on the knob’s neck, press it in with a paper clip and pull the knob off, then pry off the rose to reveal the screws.', why: 'These through-bolts are what clamp the inside and outside halves together through the door.', tip: 'Screws won’t turn? Push the screwdriver in hard as you turn, so the tip can’t slip and strip the head. A drop of penetrating oil helps old, painted screws.', ok: 'Both screws are out and the inside knob wiggles freely.', v: Object.assign({ hi: ['screws', 'oldIn'], tool: { id: 'screwdriver', at: [-BS + 0.022, KH, T / 2 + 0.013], rot: [90, 0, 0], anim: 'turn' } }, EDGE) },
    { t: 'Pull the halves apart', d: 'Pull the inside half straight off. Then pull the outside half straight out, with its spindle (the square bar) and screw posts.', why: 'Pulling straight keeps the spindle from binding in the latch mechanism.', tip: 'Keep the old lock together in a bag until the new one works, in case you need a part or a reference.', ok: 'Both halves are off and you can see the latch through the empty hole.', v: { cam: [0.55, 1.15, 0.45], at: [-0.06, KH, 0], hi: ['oldIn', 'oldOut'], hide: ['screws'], mv: { oldIn: [0, 0, 0.16], oldOut: [0, 0, -0.16] } } },
    { t: 'Remove the old latch', d: 'Unscrew the two screws holding the latch faceplate on the door edge and slide the latch out. If it’s stuck, pry gently under the faceplate with a flat screwdriver.', why: 'Use the latch and strike that come with the new set so all the parts match and fit together.', tip: 'Paint sealing the faceplate in? Score around it with a utility knife first so you don’t peel paint off the door edge.', ok: 'The edge hole is empty and the faceplate recess is clean.', v: Object.assign({ hi: ['oldLatch'], hide: ['oldIn', 'oldOut'], mv: { oldLatch: [0.1, 0, 0] }, tool: { id: 'screwdriver', at: [0.004, KH + 0.021, 0], rot: [0, 0, -90], anim: 'turn' } }, EDGE) },
    { t: 'Install the new latch', d: 'Set the latch to your backset (most twist or slide to change). Slide it into the edge hole with the slanted side of the latch bolt facing the direction the door closes, toward the frame. Screw the faceplate flush with the edge.', why: 'A backward latch hits the strike instead of sliding past it, so the door won’t close.', tip: 'Quick check: close the door slowly; the slanted face should meet the frame first. Faceplate sitting proud? The recess is too shallow; deepen it a little with a chisel.', ok: 'The latch is flush with the door edge, the slanted side faces the frame, and pressing it in springs back smoothly.', v: Object.assign({ hi: ['newLatch'], show: ['newLatch'], hide: ['oldLatch'], tool: { id: 'screwdriver', at: [0.004, KH - 0.021, 0], rot: [0, 0, -90], anim: 'turn' } }, EDGE) },
    { t: lever ? 'Fit the outside lever' : 'Fit the outside knob', d: 'From the outside, push the spindle and the two screw posts through the holes in the latch' + (lever ? '. Check that the lever handle points toward the hinge side, and flip its direction if it doesn’t (most have a release you press to rotate it 180°).' : '. Keep the knob level so the posts slide straight through.'), why: lever ? 'Levers are handed. Pointing toward the hinges keeps clothing from snagging and matches how hands naturally push.' : 'The spindle has to engage the latch’s cam (the part it turns), or turning the knob won’t pull the latch.', tip: lever ? 'Read the handing note in the instructions before installing; changing it after is fiddly. Kwikset and Schlage levers often reverse with a small pin or tool.' : 'If the posts won’t go through, the latch is upside down or set to the wrong backset. Pull it and check.', ok: 'The outside half sits flat against the door and the posts stick through to the inside.', v: Object.assign({ hi: ['newOut'], show: ['newOut'] }, OUT) },
    { t: lever ? 'Fit the inside lever and screw it up' : 'Fit the inside knob and screw it up', d: 'Slide the inside half onto the spindle, line up the screw holes with the posts and start both screws by hand. Tighten them alternately, a turn at a time, until snug.', why: 'Overtightening squeezes the mechanism and makes the knob stiff and slow to return. Snug and even is right.', tip: 'If the knob feels stiff, back each screw off a quarter turn. If it’s wobbly, tighten a little more.', ok: 'Both halves sit flat and straight, and the knob or lever turns smoothly and springs back on its own.', v: Object.assign({ hi: ['newIn', 'newScrews'], show: ['newIn', 'newScrews'], tool: { id: 'screwdriver', at: [-BS + 0.022, KH, T / 2 + 0.013], rot: [90, 0, 0], anim: 'turn' } }, EDGE) },
    { t: 'Swap the strike and test', d: 'Unscrew the old strike plate from the frame and screw on the new one in the same holes. Close the door gently: it should latch with a light push and not rattle. Test the privacy button or lock from both sides if it has one.', why: 'If it doesn’t latch, the strike hole is off. File the opening or move the strike rather than slamming the door.', tip: 'Rub lipstick or marker on the latch, close the door, and see where it hits the strike. That mark tells you which way to file.', ok: 'The door clicks shut with a light push, stays closed when you pull without turning the knob, and opens smoothly from both sides.', v: Object.assign({ hi: ['newStrike'], show: ['newStrike'], tool: { id: 'screwdriver', at: [-W, KH + 0.022, -W + 0.004], rot: [90, 0, 0], anim: 'turn' } }, JAMB) },
  ];

  TB.more('doors', [
    {
      id: 'replace-lockset',
      title: 'Replace a doorknob or lockset',
      model: 'lockset',
      level: 1,
      time: '20–40 min',
      cost: '$15–60',
      summary: 'A new knob or lever goes into the same holes as the old one: two through-bolts, a latch and a strike plate. Measure the backset first and almost any brand fits. Smart locks replace the deadbolt the same way.',
      intro: { hi: ['oldIn', 'oldOut', 'oldLatch'] },
      safety: ['Prop the door open with a wedge so it can’t swing shut and lock you out (or in) mid-job.', 'On exterior doors, keep a key and a second way in handy until the new lock is tested.', 'Renting? Changing an entry lock usually needs the landlord’s OK and a key for them; interior knobs are often fine, but ask.'],
      causes: [['Worn latch', 'Door won’t stay shut, or the knob is sloppy and doesn’t spring back.'], ['Stuck or broken lock', 'Privacy button won’t release.'], ['Upgrade', 'Levers are easier for kids, older people and full hands.'], ['Pick the function', 'Passage (no lock) for halls and closets, privacy (push-button) for baths and bedrooms, keyed entry for exterior doors.']],
      tools: ['#2 Phillips screwdriver', 'Small flat screwdriver', 'Tape measure', 'New lockset (passage, privacy or keyed)', 'Paper clip or the tool in the box (hidden-screw knobs)', 'Utility knife (to score paint)', 'Small chisel and file (only if the strike needs adjusting)'],
      variants: [
        { id: 'knob', name: 'Knob', blurb: 'Round knob passage or privacy set.' },
        {
          id: 'lever',
          name: 'Lever',
          blurb: 'Same holes, but levers are handed: the handle should point toward the hinges. Most flip with a button or pin.',
          model: 'locksetLever',
          intro: { hi: ['oldIn', 'oldOut', 'oldLatch'] },
          steps: lockSteps(true),
        },
        {
          id: 'smart',
          name: 'Smart deadbolt',
          blurb: 'Swap an existing deadbolt for a keypad or app-controlled lock. Uses the same 2⅛″ hole.',
          model: 'smartLock',
          level: 2,
          time: '30–60 min',
          cost: '$120–300',
          summary: 'A smart deadbolt replaces your old deadbolt in the same holes. The keypad goes outside, the motor unit with batteries goes inside, and a flat tailpiece connects them through the bolt.',
          intro: { hi: ['oldBolt', 'oldTurn', 'oldOutside'] },
          safety: ['Before mounting the motor, make sure the bolt slides fully into the strike by hand with the door closed. A binding bolt drains batteries and jams.', 'Keep a physical key somewhere outside the house (with a neighbor or in a lockbox) in case batteries die.', 'Renting? Get the landlord’s OK and give them a code or key.'],
          tools: ['#2 Phillips screwdriver', 'Tape measure', 'Smart deadbolt kit', 'Fresh batteries (usually 4 × AA)', 'Phone with the lock’s app', 'Painter’s tape'],
          steps: [
            { t: 'Check the door', d: 'Confirm the deadbolt face hole is 2⅛″ across, the backset (edge to hole center) is 2⅜″ or 2¾″, and the door thickness is within the kit’s range (often 1⅜–2″). Throw the old bolt with the door closed; it should slide in and out with one finger.', why: 'Smart locks need a bolt that moves freely; the motor can’t push past a sticky strike.', tip: 'If the bolt drags, fix the strike now: file the opening or move the strike until the bolt throws freely. Most smart lock “failures” are really strike problems.', ok: 'Measurements match the box, and the old bolt throws fully into the frame without pushing or pulling the door.', v: { cam: [0.42, 1.25, 0.5], at: [-0.06, DY, 0], hi: ['oldBolt', 'oldTurn'] } },
            { t: 'Remove the thumb turn', d: 'On the inside, remove the two screws holding the thumb turn (the knob you twist), supporting the outside cylinder with your other hand. Pull the thumb turn off.', why: 'These same screws are what hold the outside keyed cylinder on.', tip: 'Tape the outside cylinder to the door with painter’s tape before removing screws so it can’t fall and scratch the door.', ok: 'The thumb turn is off and the outside cylinder is loose but held in place.', v: { cam: [0.42, 1.25, 0.5], at: [-0.06, DY, 0], hi: ['oldTurn'], mv: { oldTurn: [0, 0, 0.15] }, tool: { id: 'screwdriver', at: [-BS, DY + 0.022, T / 2 + 0.013], rot: [90, 0, 0], anim: 'turn' } } },
            { t: 'Pull the cylinder and bolt', d: 'Pull the outside cylinder straight off. Then unscrew the bolt’s faceplate on the door edge and slide the bolt out.', why: 'Use the new bolt that comes with the lock; it’s matched to its tailpiece and motor.', tip: 'Keep the old deadbolt and keys in a labeled bag. If the smart lock ever has to come off, you can reinstall it in five minutes.', ok: 'The door has two empty, clean holes: the big face hole and the edge hole.', v: { cam: [0.5, 1.25, 0.4], at: [-0.06, DY, 0], hi: ['oldOutside', 'oldBolt'], hide: ['oldTurn'], mv: { oldOutside: [0, 0, -0.15], oldBolt: [0.1, 0, 0] }, tool: { id: 'screwdriver', at: [0.004, DY + 0.025, 0], rot: [0, 0, -90], anim: 'turn' } } },
            { t: 'Install the new bolt', d: 'Set the bolt to your backset and slide it into the edge hole with the side marked UP (or TOP) facing up. Screw the faceplate flush.', why: 'Upside down, the tailpiece turns the bolt the wrong way or not at all.', tip: 'Many smart bolts need the bolt retracted (pulled in) during installation. Check the manual’s first page for which position to install it in.', ok: 'UP is on top, the faceplate is flush, and the bolt slides in and out freely with a screwdriver in its slot.', v: { cam: [0.42, 1.25, 0.5], at: [-0.06, DY, 0], hi: ['newBolt'], show: ['newBolt'], hide: ['oldOutside', 'oldBolt'], tool: { id: 'screwdriver', at: [0.004, DY - 0.025, 0], rot: [0, 0, -90], anim: 'turn' } } },
            { t: 'Mount the keypad outside', d: 'Feed the keypad’s flat cable under the bolt through the hole, then pass the flat tailpiece through the bolt’s cross slot. Hold the tailpiece in the position the manual shows (usually horizontal) and press the keypad flat against the door.', why: 'The tailpiece is what turns the bolt; the cable carries power and signals to the inside unit.', tip: 'Tape the keypad to the door while you work inside so you don’t need a helper.', ok: 'The keypad sits flat and straight on the door, and the cable and tailpiece come through to the inside.', v: { cam: [0.4, 1.25, -0.55], at: [-0.06, DY, 0], hi: ['keypad'], show: ['keypad'] } },
            { t: 'Screw on the mounting plate', d: 'From inside, route the cable through the mounting plate’s opening and drive the long screws into the keypad until snug. Check that the keypad is still straight outside.', why: 'The plate clamps the keypad tight to the door so it can’t be pried or twisted off.', tip: 'Snug, not cranked. Overtightening squeezes the tailpiece and makes the bolt bind.', ok: 'The plate is firm and level, the cable isn’t pinched, and turning the tailpiece by hand still throws the bolt smoothly.', v: { cam: [0.42, 1.25, 0.5], at: [-0.06, DY, 0], hi: ['mountPlate'], show: ['mountPlate'], tool: { id: 'screwdriver', at: [-BS, DY + 0.022, T / 2 + 0.005], rot: [90, 0, 0], anim: 'turn' } } },
            { t: 'Attach the inside unit and batteries', d: 'Plug the cable into the inside unit’s socket, tuck the extra cable into its channel, slide the unit over the tailpiece and screw it on. Insert fresh batteries, matching the + and − marks.', why: 'Tuck the cable carefully; a pinched or cut cable is the most common install failure.', tip: 'Lock beeps but won’t move? Check the tailpiece is inside the unit’s slot, not beside it, and that the batteries are all the same brand and fresh.', ok: 'The unit sits flat on the door, lights or beeps when batteries go in, and the thumb turn rotates.', v: { cam: [0.42, 1.3, 0.55], at: [-0.06, DY + 0.02, 0], hi: ['insideUnit', 'batteries'], show: ['insideUnit', 'batteries'] } },
            { t: 'Calibrate and test', d: 'Follow the app or manual to set the door handing (which side the hinges are on) and calibrate. Then lock and unlock 10 times with the door closed: by keypad, app, thumb turn and key.', why: 'Calibration teaches the motor where locked and unlocked are. Testing with the door closed matters, because that’s when the strike can bind.', tip: 'Wait a week of reliable use before turning on auto-lock, so you know the lock works every time.', ok: 'Every method locks and unlocks in one smooth motion, with no grinding and no error beeps.', v: { cam: [0.42, 1.25, 0.5], at: [-0.04, DY, 0], hi: ['newBolt', 'insideUnit'], fx: 'throw' } },
          ],
          tricks: [
            ['Strike first', 'A smooth, aligned strike is the secret to battery life. Fix any drag before blaming the lock.'],
            ['Codes for guests', 'Give each person their own code so you can delete one without changing the others.'],
            ['Battery habit', 'Change batteries when the app first warns. Many locks also have a 9-V or USB emergency contact outside.'],
            ['Reinforce the strike', 'Swap the strike screws for 3″ screws into the wall framing while the door is open.'],
            ['Keep the key', 'Every smart lock should still have a key backup. Don’t lose it.'],
          ],
          learn: {
            how: 'A deadbolt is a solid bolt moved by a cam. In a smart lock, a small motor in the inside unit turns the same cam through a flat tailpiece, and a keypad or phone tells the motor when. The bolt still needs a clean, aligned strike, so mechanical fit matters as much as the electronics.',
            specs: [['Face bore', '2⅛″'], ['Edge bore', '1″'], ['Backset', '2⅜″ or 2¾″'], ['Door thickness', '≈ 1⅜–2″ (check the kit)'], ['Battery life', '6–12 months typical']],
            terms: [['Tailpiece / torque blade', 'Flat bar that links the outside cylinder to the bolt.'], ['Handing', 'Which side the hinges are on; tells the motor which way is locked.'], ['Thumb turn', 'The inside knob of a deadbolt.']],
            mistakes: ['Installing the bolt upside down.', 'Pinching the cable under the mounting plate.', 'Skipping calibration.'],
            tips: ['Replace the strike with a reinforced one with 3″ screws while you’re there.'],
          },
        },
      ],
      steps: lockSteps(false),
      tricks: [
        ['Measure before you shop', 'Backset, door thickness and hole size decide what fits. Most new sets adjust to 2⅜″ and 2¾″, but check the box.'],
        ['Keyed alike', 'Buy exterior locks keyed alike (same key) or have them rekeyed at the store so one key works everything.'],
        ['Rekey instead', 'If the lock works fine and you just want new keys, a locksmith can rekey it, and some brands (like SmartKey) let you do it yourself.'],
        ['Stiff new knob', 'Back the through-bolts off a quarter turn. Overtightening is the usual cause.'],
        ['Hidden-screw knobs', 'The tiny slot on the knob neck is the release. Push it with a paper clip while pulling the knob.'],
        ['Match the finish', 'Use the same finish and brand throughout so hinges, knobs and strikes all match.'],
      ],
      refs: [
        ['Schlage Control Deadbolt installation instructions (Allegion)', 'https://allegion.ca/content/dam/allegion-us-2/web-files/schlage/installation-documents/Schlage_Control_Deadbolt_BE467_116225.pdf'],
        ['How to Install a Schlage Deadbolt Lock (EngineerFix)', 'https://engineerfix.com/how-to-install-a-schlage-deadbolt-lock/'],
        ['Modify a Schlage deadbolt backset (Direct Door Hardware)', 'https://www.directdoorhardware.com/modify-schlage-deadbolt.htm'],
        ['How to Easily Install a Deadbolt Lock (eHow)', 'https://www.ehow.com/how_12340302_easily-install-deadbolt-lock-onto-door.html'],
      ],
      learn: {
        how: 'Turning a knob rotates a spindle that pulls a spring-loaded latch back into the door. The latch’s slanted side lets it slide past the strike as the door closes, then snap into the strike hole. Two through-bolts clamp the inside and outside halves together through the door.',
        specs: [['Face bore', '2⅛″'], ['Edge bore', '1″'], ['Backset', '2⅜″ (most homes) or 2¾″'], ['Door thickness', '1⅜″ interior, 1¾″ exterior'], ['Knob height', '≈ 36″ to center (34–48″ range)']],
        terms: [['Backset', 'Distance from the door edge to the center of the face hole.'], ['Passage set', 'No lock; for halls and closets.'], ['Privacy set', 'Push-button lock; for baths and bedrooms.'], ['Strike', 'Plate on the jamb the latch catches in.'], ['Rose', 'The round plate behind the knob.']],
        mistakes: ['Latch installed backwards.', 'Overtightened through-bolts (stiff knob).', 'Buying the wrong backset without checking.'],
        tips: ['If the latch won’t engage, darken the latch with a marker and close the door to see where it hits the strike.'],
      },
      pro: 'The door is damaged around the hole, the latch hole needs re-boring, or it’s an old mortise lock (a big box lock set into the door edge).',
    },
    {
      id: 'install-deadbolt',
      title: 'Install a deadbolt',
      model: 'deadboltInstall',
      level: 3,
      time: '1½–2 hrs',
      cost: '$30–90 + boring kit',
      summary: 'A deadbolt on a door that never had one needs two holes and two shallow recesses: a 2⅛″ face bore, a 1″ edge bore, and mortises for the faceplate and strike. A $15–25 boring jig makes it nearly foolproof.',
      intro: { hi: ['door', 'knob'] },
      safety: ['Wear safety glasses when boring and chiseling.', 'Hole saws grab and twist the drill. Hold it with both hands, use the side handle if it has one, and run at moderate speed.', 'Bore halfway from each side so the saw doesn’t tear the door face when it exits.', 'Check that the door doesn’t have glass, steel reinforcement or wiring where you’ll bore. Get permission first if you rent.'],
      causes: [['Security', 'A spring latch can be slipped with a card. A deadbolt can’t.'], ['Insurance', 'Some insurers require deadbolts on exterior doors.'], ['Spacing', 'Center about 5½″ above the knob is standard; check the template.'], ['Pick a grade', 'ANSI/BHMA Grade 1 or 2 for entry doors.']],
      tools: ['Deadbolt (Grade 1 or 2)', 'Door boring kit (2⅛″ and 1″ hole saws with jig)', 'Drill/driver (corded or 18 V+)', '¾″ and 1″ wood chisels', 'Hammer', 'Awl or nail', 'Tape measure + combination square', 'Utility knife', '3″ screws for the strike', 'Lipstick or marker', 'Safety glasses'],
      steps: [
        { t: 'Tape on the template', d: 'Measure 5½″ up from the knob center on the door edge and draw a short line. Fold the paper template over the door edge on that line, choosing the 2⅜″ or 2¾″ backset to match the knob. Mark the face hole center and the edge hole center with an awl.', why: 'Marking both centers from one template keeps the two holes lined up so the bolt meets the cam inside.', tip: 'Use a square to carry the line around the edge to the outside face too. If you’re using a clamp-on jig, it sets both centers for you.', ok: 'You have a dimple in the door face at the backset and a dimple centered on the edge, both on the same height line.', v: { cam: [0.42, 1.2, 0.55], at: [-0.06, 1.0, 0], hi: ['template'], show: ['template'] } },
        { t: 'Bore the 2⅛″ face hole', d: 'Put the 2⅛″ hole saw’s pilot bit on the face mark. Hold the drill level and square to the door and bore until the pilot bit pokes out the other side. Stop, go to the other side, put the pilot in that hole and finish the cut.', why: 'Boring from both sides prevents splintering the outside face.', tip: 'Have a helper stand to the side and tell you if the drill tips up or down. Back out often to clear sawdust so the saw doesn’t overheat and smoke.', ok: 'A clean 2⅛″ hole goes straight through, with no torn veneer on either face.', v: { cam: [0.5, 1.25, 0.6], at: [-0.06, DY, 0], hi: ['faceBore'], show: ['faceBore'], hide: ['template'], tool: { id: 'drill', at: [-BS, DY, 0.0225], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Bore the 1″ edge hole', d: 'Put the 1″ bit on the edge mark, centered on the door thickness, and drill straight in, keeping the drill level and square to the edge, until you break into the face hole.', why: 'A crooked edge bore makes the bolt bind against the tailpiece.', tip: 'Draw a pencil line down the middle of the door edge, and sight along the drill from above to keep it parallel to the door faces.', ok: 'Looking through the face hole, the 1″ hole enters it in the center and the bolt slides in without forcing.', v: { cam: [0.5, 1.15, 0.35], at: [0, DY, 0], hi: ['edgeBore'], show: ['edgeBore'], tool: { id: 'drill', at: [0.0, DY, 0], rot: [0, 0, -90], anim: 'spin' } } },
        { t: 'Mortise the faceplate', d: 'Slide the bolt in and hold the faceplate square on the edge. Trace around it with a utility knife. Remove the bolt, tap a chisel straight down along the outline, then pare out wood with the bevel facing down until the plate sits flush, usually ⅛″ deep.', why: 'A proud faceplate rubs the jamb and keeps the door from closing.', tip: 'Take thin shavings; it’s easy to go too deep. Too deep? Glue a piece of cardboard behind the plate to bring it flush.', ok: 'The faceplate drops into the recess and sits level with the door edge.', v: { cam: [0.4, 1.12, 0.3], at: [0, DY, 0], hi: ['mortise', 'chisel'], show: ['mortise', 'chisel'], hide: ['edgeBore'], tool: { id: 'hammer', at: [0.2, DY + 0.033, 0], rot: [0, 0, 90], anim: 'tap', scale: 0.9 } } },
        { t: 'Install the bolt', d: 'Set the bolt to your backset, slide it in with UP (or TOP) on top, and screw the faceplate down.', why: 'Upside down, the cylinder’s tailpiece won’t operate the bolt.', tip: 'Drill ⅛″ pilot holes for the faceplate screws so they go in straight and don’t split the edge.', ok: 'The faceplate is flush and the bolt slides in and out freely with a screwdriver in its slot.', v: { cam: [0.45, 1.15, 0.4], at: [0, DY, 0], hi: ['bolt'], show: ['bolt'], hide: ['mortise', 'chisel'], tool: { id: 'screwdriver', at: [0.004, DY + 0.025, 0], rot: [0, 0, -90], anim: 'turn' } } },
        { t: 'Mount cylinder and thumb turn', d: 'From outside, slide the keyed cylinder’s tailpiece through the bolt’s slot, with the keyway pointing the way the instructions show. Fit the thumb turn on the inside over the tailpiece and drive the two long screws until snug.', why: 'The keyed side must be outside; the screws clamp both halves through the door.', tip: 'If the bolt won’t throw, the tailpiece is probably rotated wrong. Take the thumb turn off, rotate it a quarter turn and try again.', ok: 'The key and thumb turn both throw the bolt fully out and back with the door open.', v: { cam: [0.5, 1.2, 0.55], at: [-0.06, DY, 0], hi: ['cylinder', 'thumbturn'], show: ['cylinder', 'thumbturn'], tool: { id: 'screwdriver', at: [-BS, DY + 0.024, 0.0445 / 2 + 0.02], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Mark the jamb', d: 'Rub lipstick or a marker on the bolt end. Close the door and turn the bolt so it marks the jamb. Drill a 1″ hole about 1¼″ deep at the mark, then trace the strike centered on the hole.', why: 'Marking from the bolt itself guarantees the strike lines up. The hole must be deeper than the bolt’s 1″ throw.', tip: 'Wrap tape around the bit 1¼″ from the tip as a depth flag. Stop when the tape reaches the jamb.', ok: 'A clean 1″ hole sits exactly where the bolt mark was, with the strike outline traced around it.', v: { cam: [-0.55, 1.2, -0.45], at: [-0.914, DY, -0.914], hi: ['strikeMarks'], show: ['strikeMarks'] } },
        { t: 'Set the strike with 3″ screws', d: 'Chisel the strike outline flush, add the strike box (the metal cup) if included, and screw the strike on. Replace the short screws with 3″ screws driven through the jamb into the wall framing behind.', why: 'Short strike screws in a thin jamb are the weak point that a kick breaks. Long screws anchor the bolt to the house frame.', tip: 'Drive the long screws gently once they bite; overtightening pulls the jamb in and the bolt will drag.', ok: 'The strike is flush with the jamb and the 3″ screws pulled tight without bowing the jamb.', v: { cam: [-0.55, 1.2, -0.45], at: [-0.914, DY, -0.914], hi: ['strikeBox'], show: ['strikeBox'], hide: ['strikeMarks'], tool: { id: 'drill', at: [-0.914, DY + 0.022, -0.91], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Test', d: 'Close the door and throw the bolt with the key and the thumb turn, from both sides. It should slide fully in without you pushing or lifting the door.', why: 'A bolt that doesn’t fully extend isn’t locked; it’s just in the way.', tip: 'If it drags, mark the bolt again and file or deepen the strike where it rubs.', ok: 'The bolt throws fully with a light turn, and the door won’t open when you pull on it.', v: { cam: [0.6, 1.3, 0.8], at: [-0.1, 1.0, 0], hi: ['bolt', 'thumbturn'] } },
      ],
      tricks: [
        ['Boring jig', 'A clamp-on boring jig holds both hole saws square. It’s worth the price even for one door.'],
        ['Keyed alike', 'Buy the deadbolt and entry knob keyed alike so one key opens both.'],
        ['Clean exit', 'Bore until the pilot bit pokes out, then finish from the other side. No tear-out, guaranteed.'],
        ['Steel doors', 'Steel and fiberglass doors need sharp bimetal hole saws and slower speed. Check the door maker’s instructions first.'],
        ['Strike reinforcement', 'A reinforcement plate kit covering the jamb and strike makes a door far harder to kick in.'],
        ['Practice cut', 'Practice the mortise on a scrap 2×4 first if you’ve never used a chisel.'],
      ],
      refs: [
        ['Schlage Control Deadbolt installation instructions (Allegion)', 'https://allegion.ca/content/dam/allegion-us-2/web-files/schlage/installation-documents/Schlage_Control_Deadbolt_BE467_116225.pdf'],
        ['How to Install a Schlage Deadbolt Lock (EngineerFix)', 'https://engineerfix.com/how-to-install-a-schlage-deadbolt-lock/'],
        ['How to Easily Install a Deadbolt Lock onto a Door (eHow)', 'https://www.ehow.com/how_12340302_easily-install-deadbolt-lock-onto-door.html'],
        ['Modify a Schlage deadbolt (Direct Door Hardware)', 'https://www.directdoorhardware.com/modify-schlage-deadbolt.htm'],
      ],
      learn: {
        how: 'A spring latch holds a door closed; a deadbolt locks it. The bolt is solid, can’t be pushed back from its end, and throws about 1″ into the frame. Its real strength depends on the strike: 3″ screws tie it to the wall framing instead of a ¾″ jamb.',
        specs: [['Face bore', '2⅛″'], ['Edge bore', '1″'], ['Backset', '2⅜″ or 2¾″'], ['Center above knob', '≈ 5½″'], ['Bolt throw', '1″ minimum'], ['Jamb hole', '1″ wide, ≈ 1¼″ deep'], ['Strike screws', '3″ into framing']],
        terms: [['Deadbolt', 'Lock bolt with no spring; moved only by key or turn.'], ['Mortise', 'A shallow recess cut so hardware sits flush.'], ['ANSI grade', 'Grade 1 is strongest, Grade 3 lightest duty.'], ['Strike box', 'Metal cup behind the strike that protects the hole.']],
        mistakes: ['Boring all the way through from one side and blowing out the face.', 'Edge hole off-center.', 'Leaving the short strike screws in.'],
        tips: ['A door boring jig clamps on and guides both hole saws square.'],
      },
      pro: 'The door is metal or fiberglass with a thin skin, has glass within 40″ of the lock, or is a historic door.',
    },
    {
      id: 'prehung-door',
      title: 'Hang a pre-hung door',
      kind: 'build',
      model: 'prehungDoor',
      level: 3,
      time: '3–5 hrs',
      cost: '$150–450',
      summary: 'A pre-hung door comes already hinged in its frame. The job is setting that frame plumb, level and square in the rough opening with shims, so the door swings freely and latches with an even ⅛″ gap all around.',
      intro: { show: ['unit', 'slab', 'casing', 'knob'], preview: true, hi: ['slab'] },
      safety: ['Doors are heavy and awkward. Get a helper to lift and hold the unit.', 'Wear safety glasses when cutting shims and nailing trim.', 'Leave the shipping clips (or nails) that hold the door shut in place until the hinge side is fastened, then remove them all before swinging the door.'],
      causes: [['Measure the opening', 'Rough opening ≈ door width + 2″ and door height + 2½″ (a 30″ door needs about 32″ × 82½″).'], ['Pick the swing', 'Stand where the door opens toward you: hinges on the left is a left-hand door.'], ['Jamb width', 'Match the wall thickness: 4–9⁄16″ for 2×4 walls with ½″ drywall each side.'], ['Floor height', 'Plan the finished floor first so the door clears carpet or a rug.']],
      tools: ['Pre-hung door unit', '4 ft and 6 ft levels', 'Tapered wood shims (a bundle)', 'Drill/driver', '3″ screws (trim-head or matching hinge screws)', 'Finish nailer with 2½″ nails (or hammer + 8d finish nails)', 'Utility knife', 'Handsaw', 'Casing and 1¼″ brad nails', 'Tape measure', 'Helper'],
      variants: [
        { id: 'interior', name: 'Interior door', blurb: 'Hollow or solid-core door in a 2×4 wall.' },
        {
          id: 'exterior',
          name: 'Exterior door',
          blurb: 'Adds a sloped sill pan, sealant, a threshold and foam for an airtight, watertight fit.',
          model: 'prehungExt',
          level: 4,
          time: '1 day',
          cost: '$500–2,000',
          intro: { show: ['unit', 'slab', 'sill', 'weather', 'casing', 'knob', 'pan'], preview: true, hi: ['slab'] },
          safety: ['Plan to finish in one day so the house isn’t left open.', 'Exterior doors weigh 80–150 lb. Use two people.', 'Check whether a permit is needed in your area, and follow the door maker’s installation instructions; they control the warranty.'],
          tools: ['Pre-hung exterior unit', 'Sill pan (rigid, with a back dam) or flashing materials per the door maker', 'Flashing tape + J-roller', 'Sealant the door maker names (polyurethane or hybrid polymer)', 'Levels (4 ft + 6 ft)', 'Shims', '3″ screws', 'Low-expansion window and door foam', 'Finish nails', 'Helper'],
          steps: [
            { t: 'Check the opening', d: 'Check the rough sill (the subfloor across the bottom of the opening) for level and the side studs for plumb. Plane or shim the sill so it is flat and level, or slopes slightly to the outside; it must never slope toward the house.', why: 'The sill carries the threshold. If it isn’t flat and supported, the threshold flexes and the seal leaks.', tip: 'Lay the 6 ft level across the sill and slide a shim under the low end to read how far off it is. Fix the sill now; it’s impossible to fix later.', ok: 'The level reads level (or a hair toward outside) across the sill, and both side studs read plumb or within ⅛″.', v: { cam: [1.2, 1.2, 2.6], at: [0, 0.6, 0], hi: ['framing'], tool: { id: 'level', at: [0, 0.0, 0.05], rot: [0, 0, 0], scale: 1.6 } } },
            { t: 'Install the sill pan', d: 'Set a sill pan in the opening, or form one from flashing tape per the door maker. It should have a back dam (an upturned lip on the inside edge) and turn up at least 6″ at each side, and lap over the housewrap (the fabric weather barrier) at the front.', why: 'Water that gets past the threshold hits the back dam and drains back outside instead of rotting the subfloor.', tip: 'Press flashing tape on with a J-roller, not your hand. Firm pressure activates the adhesive; wrinkles become leaks.', ok: 'The pan covers the whole sill, turns up the sides and the back, and its front edge overlaps the outside wall.', v: { cam: [1.0, 0.9, 1.6], at: [0, 0.1, 0], hi: ['pan'], show: ['pan'] } },
            { t: 'Lay sealant beads', d: 'Run three large continuous beads of the door maker’s sealant across the full width of the pan, where the threshold will sit, and up the sides an inch or two. Add a bead along the back dam so the threshold beds into it for an air seal.', why: 'The sealant beds the threshold and stops air and water at the bottom. The pan’s front must stay open to the outside so any water inside can drain out.', tip: 'Use a whole tube if needed; skimpy beads leave gaps. Read your door’s instructions, because some makers specify a different pattern.', ok: 'Three unbroken beads cross the pan, plus one along the back dam, with no gaps at the corners.', v: { cam: [0.9, 0.8, 1.4], at: [0, 0.05, 0.05], hi: ['sealant'], show: ['sealant'], tool: { id: 'caulkGun', at: [0.1, 0.012, 0.04], rot: [0, 0, 50] } } },
            { t: 'Set the unit', d: 'With a helper, tip the door in from outside, bottom first, pressing the sill down into the sealant. Center it in the opening and tack the top of the hinge side with one nail through the brick mold (the outside trim).', why: 'Keep the shipping clips on and the door closed until the hinge side is set, so the frame stays square.', tip: 'Set the bottom first and then swing the top in. Don’t slide the sill across the sealant; it wipes the beads off.', ok: 'The sill sits fully down in the sealant, with an even gap at both sides of the frame.', v: { cam: [1.2, 1.35, 3.0], at: [0, 1.05, 0], hi: ['unit', 'slab'], show: ['unit', 'slab', 'sill', 'weather'] } },
            { t: 'Shim and screw the hinge side', d: 'Shim behind each hinge, in pairs with thin ends opposite, until the hinge jamb is plumb in both directions. Remove one screw from each hinge (the one closest to the stop) and drive a 3″ screw through the hinge into the stud.', why: 'Long hinge screws keep a heavy door from sagging and pulling the latch out of line.', tip: 'Check plumb with the 6 ft level on the face and the edge of the jamb. Snug the long screws gently; overdriving bows the jamb.', ok: 'The 6 ft level shows plumb both ways, and the door doesn’t swing open or closed by itself.', v: { cam: [0.6, 1.3, 1.8], at: [-0.45, 1.0, 0], hi: ['hingeShims'], show: ['hingeShims'], rt: { slab: [0, 75, 0] }, tool: { id: 'level', at: [-0.46, 0.4, 0.06], rot: [0, 0, 90], scale: 1.6 } } },
            { t: 'Shim the latch side', d: 'Remove the shipping clips. Shim behind the latch area and near the top and bottom until the gap between the door and the jamb is an even ⅛″. Check that the weatherstrip touches the door evenly all around when closed.', why: 'An even gap means the door seals evenly. You can see daylight wherever it doesn’t.', tip: 'Close the door at night with a light on outside and look for glowing gaps in the weatherstrip.', ok: 'The ⅛″ gap is even along the latch side and top, and a strip of paper drags evenly when shut in the door anywhere.', v: { cam: [-0.4, 1.3, 1.8], at: [0.45, 1.0, 0], hi: ['latchShims', 'weather'], show: ['latchShims', 'screws'] } },
            { t: 'Foam the gap', d: 'Fill the gap between the jamb and the framing with low-expansion window and door foam, a bead about half the gap depth. Do not use regular expanding foam.', why: 'Foam air-seals and insulates. High-expansion foam can bow the jamb so the door binds.', tip: 'Keep the door closed and latched while the foam cures (about an hour) so the jamb can’t bow. Trim the excess with a knife once hard.', ok: 'The gap is filled with cured foam, and the door still opens and latches with the same even gap.', v: { cam: [1.0, 1.3, 2.0], at: [0.3, 1.0, 0], hi: ['foam'], show: ['foam'] } },
            { t: 'Brick mold and seal', d: 'Nail the brick mold to the framing with galvanized finish nails. Caulk where it meets the siding, but leave the bottom of the side trim open at the sill. Flash over the head with tape lapped shingle-style before siding or head trim goes on.', why: 'The head is where water runs down the wall; flashing lapped from the bottom up sends it out over the trim.', tip: 'Shingle-style means each upper layer overlaps the one below it, like roof shingles, so water can never run behind a layer.', ok: 'The trim is tight to the wall, caulk lines are continuous, and the head flashing laps over the side flashing.', v: { cam: [1.2, 1.35, 3.0], at: [0, 1.05, 0], hi: ['casing'], show: ['casing'], rt: { slab: [0, 0, 0] }, tool: { id: 'hammer', at: [0.48, 1.4, 0.13], rot: [0, -60, 0], anim: 'tap' } } },
            { t: 'Hardware and threshold', d: 'Install the lockset and deadbolt, with 3″ screws in the strikes. Adjust the threshold height (turn the screws in the threshold) until the door sweep just touches it.', why: 'Too low leaks air and water; too high drags and wears the sweep.', tip: 'Close the door on a dollar bill at the threshold. It should pull out with slight resistance at every point.', ok: 'The door latches with a light push, the deadbolt throws freely, and the dollar bill test drags evenly.', v: { cam: [1.2, 1.35, 3.0], at: [0, 1.05, 0], hi: ['knob', 'sill'], show: ['knob'] } },
          ],
          tricks: [
            ['Dry-fit first', 'Set the unit in the opening without sealant to check fit and shim needs, then pull it and lay the sealant.'],
            ['Seal the bottom edge', 'Wood doors: seal or paint the bottom and top edges before hanging; bare end grain soaks up water.'],
            ['Sill pan with slope', 'A pre-made sloped pan beats tape alone because water actually runs out.'],
            ['Foam with the door shut', 'Always foam with the door latched so the frame can’t bow while foam expands.'],
            ['Long screws everywhere', 'Long screws in hinges and strikes make the whole unit kick-resistant.'],
          ],
          learn: {
            how: 'An exterior door has to block water, air and intruders. The sill pan catches any water that gets past the threshold and sends it outside; sealant and foam stop air; and long screws into the framing let the deadbolt and hinges resist a kick. All of that only works if the frame is set plumb and square, so the weatherstrip touches evenly all around.',
            specs: [['Rough opening', 'Frame size + ½″ in width and height'], ['Pan upturn', '≥ 6″ at the sides, plus a back dam'], ['Reveal', '⅛″ even'], ['Hinge screws', 'One 3″ screw per hinge'], ['Foam', 'Low-expansion (window and door)']],
            terms: [['Sill pan', 'Waterproof tray under the threshold.'], ['Back dam', 'Upturned inside edge of the pan that stops water flowing indoors.'], ['Brick mold', 'Thick exterior casing around the door.'], ['WRB', 'Weather-resistive barrier, such as housewrap.'], ['Reveal', 'The gap between the door and its frame.']],
            mistakes: ['Skipping the pan.', 'Sealing the front of the pan so water can’t drain out.', 'Using high-expansion foam.', 'Leaving the opening sloped toward the house.'],
            tips: ['Dry-fit the unit before laying sealant.'],
          },
        },
      ],
      steps: [
        { t: 'Check the rough opening', d: 'Measure the opening width at the top, middle and bottom, and the height on both sides. Hold a 6 ft level against each jack stud (the side studs) to check plumb.', why: 'You need about ½–¾″ of total shim space side to side. If a stud leans, plan more shims at that end.', tip: 'Also check that the wall is flat across the opening: hold a level across both studs. If one sticks out, the jamb won’t sit flush to both drywall faces.', ok: 'The opening is about 2″ wider and 2½″ taller than the door, and you know which way each stud leans.', v: { cam: [1.1, 1.35, 2.9], at: [0, 1.05, 0], hi: ['framing'], tool: { id: 'level', at: [-0.4, 0.7, 0.05], rot: [0, 0, 90], scale: 1.6 } } },
        { t: 'Check the floor', d: 'Lay a level across the opening at the floor. If one side is low, measure how much. Plan to trim that much off the bottom of the jamb leg on the high side, so the head (top) jamb ends up level.', why: 'A level head jamb is the key to an even gap at the top of the door.', tip: 'Measure from the floor to the head jamb on both sides of the door before cutting. Trim with a fine handsaw, a little at a time.', ok: 'You know the floor difference side to side, and you’ve marked any jamb trim needed.', v: { cam: [1.0, 0.8, 2.2], at: [0, 0.1, 0], hi: ['framing'], tool: { id: 'level', at: [0, 0.0, 0.05], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Set the unit in the opening', d: 'Remove the packaging but leave the shipping clips that hold the door shut. With a helper, tip the unit into the opening, center it, and keep the jamb edges flush with the drywall on both sides.', why: 'Flush jambs let the casing sit flat on both sides of the wall.', tip: 'Tack one nail through the hinge jamb near the top to hold it while you shim. Don’t drive it all the way in yet.', ok: 'The unit stands centered, with the jamb edges flush to both wall faces.', v: { cam: [1.1, 1.35, 2.9], at: [0, 1.05, 0], hi: ['unit', 'slab'], show: ['unit', 'slab'] } },
        { t: 'Plumb the hinge side', d: 'Slide pairs of shims (thin ends opposite) behind each hinge until the hinge jamb is plumb in both directions. Nail through the jamb into the stud at each shim with 2½″ finish nails.', why: 'Everything else is set from the hinge side. Paired shims stay flat instead of twisting the jamb.', tip: 'Keep the shims behind the hinge and close to the stop so the later 3″ screws pass through them. If the door swings by itself after this, the hinge side isn’t plumb.', ok: 'The 6 ft level shows the hinge jamb plumb face and edge, and the opened door stays wherever you leave it.', v: { cam: [0.5, 1.3, 1.7], at: [-0.38, 1.0, 0], hi: ['hingeShims'], show: ['hingeShims'], rt: { slab: [0, -75, 0] }, tool: { id: 'level', at: [-0.383, 0.4, 0.0], rot: [0, 0, 90], scale: 1.6 } } },
        { t: 'Shim the latch side for an even gap', d: 'Remove the shipping clips. Close the door and shim the latch jamb at the top, behind the strike and near the bottom until the gap between the door and the jamb is an even ⅛″, then nail at the shims.', why: 'Set the latch side to the door, not the level; an even gap is what makes it close smoothly.', tip: 'A nickel is about the right gap gauge. Slide it around the door; it should fit everywhere but not fall through loosely.', ok: 'The gap along the latch side and top is an even ⅛″, and the door closes without touching the jamb.', v: { cam: [-0.4, 1.3, 1.7], at: [0.38, 1.0, 0], hi: ['latchShims'], show: ['latchShims'], rt: { slab: [0, 0, 0] } } },
        { t: 'Drive the long screws', d: 'Replace one screw at each hinge (the one closest to the stop) with a 3″ screw into the jack stud. Add a screw or nail through the shims on the latch side, hidden behind the stop.', why: 'Long hinge screws carry the door’s weight into the framing so it can’t sag over time.', tip: 'Tighten the long screws just until snug, then check the gap again. Overtightening pulls the jamb toward the stud.', ok: 'Screws are snug, and the ⅛″ gap is unchanged after tightening.', v: { cam: [0.4, 1.2, 1.4], at: [-0.38, 1.0, 0], hi: ['screws'], show: ['screws'], rt: { slab: [0, -75, 0] }, tool: { id: 'drill', at: [-0.383, 0.98, 0.029], rot: [0, 0, -90], anim: 'spin' } } },
        { t: 'Trim shims and install casing', d: 'Score the shims with a utility knife where they stick out and snap them off flush. Mark a ⅛–3⁄16″ setback (the reveal) on the jamb edges and nail the casing to it on both sides of the wall.', why: 'The small setback hides any small unevenness in the jamb edge and looks deliberate.', tip: 'Set a combination square to 3⁄16″ and use it to mark the reveal at several points.', ok: 'The casing is tight at the mitered corners, with an even reveal all around.', v: { cam: [1.1, 1.35, 2.9], at: [0, 1.05, 0], hi: ['casing'], show: ['casing'], rt: { slab: [0, 0, 0] }, tool: { id: 'hammer', at: [0.44, 1.5, 0.08], rot: [0, -60, 0], anim: 'tap' } } },
        { t: 'Install the knob', d: 'Install the latch and knob, and adjust the strike so the door closes with a light push and doesn’t rattle.', why: 'The pre-bored unit already lines up the latch with the strike when the frame is square.', tip: 'If it doesn’t latch, rub lipstick on the latch, close the door and see where it marks the strike.', ok: 'The door swings freely, latches with a light push and stays put at any open position.', v: { cam: [0.9, 1.25, 1.8], at: [0.2, 1.0, 0], hi: ['knob'], show: ['knob'] } },
      ],
      tricks: [
        ['Shims in pairs', 'Opposing shims make a flat, adjustable packer. One shim alone twists the jamb.'],
        ['Nickel gap gauge', 'A nickel is close to the ⅛″ gap you want. Use it to check the reveal as you shim.'],
        ['Cut the jamb leg, not the head', 'Fix an out-of-level floor by trimming the jamb leg on the high side so the head is level.'],
        ['Swing test', 'If the door swings shut or open by itself, the hinge jamb isn’t plumb; adjust the shims behind the hinges.'],
        ['Pre-finish', 'Paint or stain the door before hanging; it’s faster and drips can’t ruin the floor.'],
        ['Casing first on one side', 'Install casing on one side before shimming to hold the unit flush; Gary Katz’s favorite shortcut.'],
      ],
      refs: [
        ['Installing Pre-Hung Interior Doors (Journal of Light Construction)', 'https://www.jlconline.com/how-to/interiors/hanging-pre-hung-interior-doors_o/'],
        ['On the Job: Installing Prehung Doors (Journal of Light Construction)', 'https://www.jlconline.com/how-to/interiors/on-the-job-installing-prehung-doors_o/'],
        ['Problem-Free Prefit Doors (Gary Katz, This is Carpentry)', 'https://www.thisiscarpentry.com/2013/08/09/problem-free-prefit-doors/'],
        ['3 Common Sill Pan Mistakes and How to Correct Them (JLC)', 'https://www.jlconline.com/how-to/exteriors/3-common-sill-pan-mistakes-and-how-to-correct-them'],
        ['How to Prep a Sill for a Door Installation (Builder)', 'https://builderonline.com/products/doors/how-to-prep-a-sill-for-a-door-installation'],
        ['Pre-hung door installation instructions (Builder’s Choice via Orepac)', 'https://www.orepac.com/media/1990/builders-choice-wood-pre-hung-unit-w_mpls-installation-instructions.pdf'],
      ],
      learn: {
        how: 'A pre-hung door is a door already hung on hinges in its frame (the jamb), with the hinge gaps and latch prep done at the factory. Your job is to recreate those factory conditions in the wall: plumb hinge jamb, level head and an even ⅛″ gap. Shims fill the space between the jamb and the rough framing so the jamb can be adjusted without bending.',
        specs: [['Rough opening', 'Door + 2″ wide, + 2½″ tall'], ['Gap (reveal)', '⅛″ sides and top'], ['Floor gap', '½–¾″ (more over carpet)'], ['Interior jamb', '4–9⁄16″'], ['Casing setback', '⅛–3⁄16″'], ['Nails', '2½″ finish nails at each shim']],
        terms: [['Jamb', 'The frame the door hangs in.'], ['Jack stud', 'Short stud that holds up the header.'], ['Shim', 'Tapered wood wedge; used in pairs to make flat packing.'], ['Handing', 'Which side the hinges are on.']],
        mistakes: ['Shimming the latch side first.', 'Over-shimming so the jamb bows.', 'Leaving the shipping clips in and swinging the door.'],
        tips: ['A 6 ft level on the hinge jamb is easier than a 4 ft.'],
      },
      pro: 'The opening needs reframing, it’s a bearing wall, or you want a door where there wasn’t one.',
    },
  ]);
})();

/* =====================================================================
   FLOORS: models
   ===================================================================== */
(function () {
  const { VIEW } = TB.IM;
  const FV = (o) => VIEW(Object.assign({ tex: ['brushed_concrete'], ground: { tex: 'brushed_concrete', repeat: 3, radius: 4 } }, o));
  const woodTone = (K, c) => K.bumpy(c, K.tex.woodBump(), 0.003, { roughness: 0.55 });

  /* ---- Floating plank floor with one damaged plank ---- */
  TB.model(
    'plankFloor',
    FV({ cam: [1.1, 1.3, 1.6], at: [0.0, 0, 0.05], hidden: ['holes', 'cutLines', 'saw', 'pieces', 'newPlank', 'tongue', 'glue', 'weights'] }),
    (K) => {
      const PW = 0.197, PL = 1.22, Y0 = 0.02, PT = 0.008;
      K.box(null, [2.6, 0.018, 2.2], K.std(0xc9a46e, { roughness: 0.9 }), [0, 0.009, 0], null, 0); // subfloor
      const ul = K.part('underlay', [0, 0, 0], null, 'Foam underlayment');
      K.box(ul, [2.4, 0.002, 2.0], K.std(0x8fb6c9, { roughness: 0.9 }), [0, 0.019, 0], null, 0);
      K.box(null, [2.6, 1.2, 0.1], K.std(0xe9e4d8, { roughness: 0.93 }), [0, 0.6, -1.06], null, 0);
      K.box(null, [2.6, 0.09, 0.014], K.std(0xf7f5ef, { roughness: 0.45 }), [0, 0.045 + Y0, -1.003], null, 0.003);
      const tones = [0xb48a5e, 0xa47b51, 0xc19a6d, 0x9c7550].map((c) => woodTone(K, c));
      const floor = K.part('floor', [0, 0, 0], null, 'Laminate planks (floating)');
      const offs = [0, 0.4, 0.8, 0.2, 1.0, 0.61, 0.3, 0.7, 0.1, 0.5];
      let n = 0;
      offs.forEach((o, j) => {
        const z = -0.9 + j * PW;
        for (let s = -1.2 - o; s < 1.2; s += PL) {
          const a = Math.max(s, -1.2), b = Math.min(s + PL, 1.2);
          if (b - a < 0.01) continue;
          if (j === 5 && Math.abs(s + 0.59) < 0.01) continue; // the damaged plank
          K.box(floor, [b - a - 0.002, PT, PW - 0.002], tones[n++ % 4], [(a + b) / 2, Y0 + PT / 2, z], null, 0.0015);
        }
      });
      const ZD = -0.9 + 5 * PW, XD = 0.02;
      const dmg = K.part('damaged', [XD, Y0 + PT / 2, ZD], null, 'Damaged plank (swollen, chipped)');
      K.box(dmg, [PL - 0.002, PT, PW - 0.002], tones[1], [0, 0, 0], null, 0.0015);
      K.box(dmg, [0.32, 0.002, 0.12], K.std(0x5a4330, { roughness: 1 }), [0.15, PT / 2 + 0.0005, 0.01], [0, 12, 0], 0);
      K.box(dmg, [0.08, 0.003, 0.03], K.std(0xe2d2b4, { roughness: 1 }), [-0.3, PT / 2 + 0.0003, -0.07], [0, -20, 0], 0);
      const holes = K.part('holes', [XD, Y0 + PT, ZD], null, '½″ relief holes');
      [[-0.58, -0.07], [-0.58, 0.07], [0.58, -0.07], [0.58, 0.07], [-0.2, -0.07], [0.2, -0.07], [-0.2, 0.07], [0.2, 0.07]].forEach(([x, z]) => K.cyl(holes, [0.0064, 0.0064, 0.002, 16], K.std(0x151210), [x, 0.0005, z]));
      const cl = K.part('cutLines', [XD, Y0 + PT + 0.0006, ZD], null, 'Cut lines');
      K.box(cl, [1.16, 0.001, 0.0018], 'dark', [0, 0, -0.07], null, 0);
      K.box(cl, [1.16, 0.001, 0.0018], 'dark', [0, 0, 0.07], null, 0);
      K.box(cl, [1.16, 0.001, 0.0018], 'dark', [0, 0, 0], null, 0);
      const saw = K.part('saw', [0.0, Y0 + PT, ZD + 0.05], null, 'Circular saw (blade set to plank depth)');
      K.box(saw, [0.28, 0.004, 0.16], 'steel', [0, 0.002, 0], null, 0);
      K.cyl(saw, [0.085, 0.085, 0.003, 40], 'toolSteel', [0, 0.03, -0.05], [90, 0, 0]);
      K.lathe(saw, [[0, 0], [0.09, 0], [0.095, 0.03], [0, 0.035]], K.std(0x2a6fc0, { roughness: 0.5 }), [0, 0.05, -0.04], [90, 0, 0]);
      K.cyl(saw, [0.045, 0.045, 0.11, 24], K.std(0x2a6fc0, { roughness: 0.5 }), [0, 0.08, 0.02], [90, 0, 0]);
      K.tube(saw, [[-0.08, 0.1, 0.03], [-0.02, 0.17, 0.03], [0.08, 0.15, 0.03]], 0.014, 'gripBlack');
      const pcs = K.part('pieces', [0.95, Y0, 0.6], null, 'Cut-out pieces');
      [[0, 0, 0, 10], [0.05, 0.008, 0.06, -15], [-0.06, 0, 0.12, 30]].forEach(([x, y, z, r]) => K.box(pcs, [0.4, PT, 0.06], tones[1], [x, y + PT / 2, z], [0, r, 0], 0.001));
      const np = K.part('newPlank', [XD, Y0 + PT / 2, ZD], null, 'Replacement plank');
      K.box(np, [PL - 0.004, PT, PW - 0.008], tones[2], [0, 0, 0], null, 0.0015);
      const tg = K.part('tongue', [XD, Y0 + PT / 2 - 0.0015, ZD - PW / 2], null, 'Tongue (cut off)');
      K.box(tg, [PL - 0.004, 0.004, 0.008], 'red', [0, 0, 0], null, 0);
      const glue = K.part('glue', [XD, Y0 + PT * 0.6, ZD], null, 'Glue bead in the grooves');
      const gm = K.std(0xf4eedc, { roughness: 0.4 });
      [-1, 1].forEach((s) => K.cyl(glue, [0.0025, 0.0025, PL - 0.02, 10], gm, [0, 0, s * (PW / 2 - 0.002)], [0, 0, 90]));
      [-1, 1].forEach((s) => K.cyl(glue, [0.0025, 0.0025, PW - 0.02, 10], gm, [s * (PL / 2 - 0.002), 0, 0], [90, 0, 0]));
      const wt = K.part('weights', [XD, Y0 + PT, ZD], null, 'Books as weights (overnight)');
      [[-0.35, 0xa33b2f], [0.0, 0x2f5f8a], [0.35, 0x3d6b45]].forEach(([x, c], i) => {
        K.box(wt, [0.24, 0.05, 0.17], K.std(c, { roughness: 0.7 }), [x, 0.025, 0], [0, i * 7, 0], 0.004);
        K.box(wt, [0.22, 0.04, 0.16], K.std(0xa88444 + i * 0x101010, { roughness: 0.7 }), [x, 0.07, 0], [0, -i * 9, 0], 0.004);
      });
      return {
        tick(t, fx) {
          saw.position.x = fx === 'saw' ? 0.35 * Math.sin(t * 1.2) : 0;
        },
      };
    }
  );

  /* ---- Room for a floating LVP floor ---- */
  TB.model(
    'lvpRoom',
    FV({ cam: [0.6, 2.7, 3.7], at: [0, 0.2, -0.2], hidden: ['underlay', 'spacers', 'row1', 'rows', 'lastRow', 'shoe', 'transition', 'undercut'] }),
    (K) => {
      const X0 = -1.5, X1 = 1.5, Z0 = -1.3, Z1 = 1.3, H = 2.44;
      const wallM = K.std(0xe9e4d8, { roughness: 0.93 });
      const trimM = K.std(0xf7f5ef, { roughness: 0.45 });
      const sub = K.part('subfloor', [0, 0, 0], null, 'Subfloor (flat within 3⁄16″ per 10 ft)');
      K.box(sub, [X1 - X0, 0.012, Z1 - Z0], K.std(0xc9a46e, { roughness: 0.9 }), [0, 0.006, 0], null, 0);
      // walls: back (with doorway), left, right
      const DX0 = 0.45, DX1 = 1.28, DH = 2.06;
      K.box(null, [DX0 - X0, H, 0.12], wallM, [(X0 + DX0) / 2, H / 2, Z0 - 0.06], null, 0);
      K.box(null, [X1 - DX1, H, 0.12], wallM, [(DX1 + X1) / 2, H / 2, Z0 - 0.06], null, 0);
      K.box(null, [DX1 - DX0, H - DH, 0.12], wallM, [(DX0 + DX1) / 2, (H + DH) / 2, Z0 - 0.06], null, 0);
      K.box(null, [0.12, H, Z1 - Z0], wallM, [X0 - 0.06, H / 2, 0], null, 0);
      K.box(null, [0.12, 0.9, Z1 - Z0], wallM, [X1 + 0.06, 0.45, 0], null, 0);
      K.box(null, [DX1 - DX0, 0.012, 0.6], woodTone(K, 0x9a7148), [(DX0 + DX1) / 2, 0.016, Z0 - 0.3], null, 0); // next room hardwood
      const cas = K.part('casing', [0, 0, 0], null, 'Door casing + jamb');
      [DX0 - 0.03, DX1 + 0.03].forEach((x) => K.box(cas, [0.064, DH + 0.06, 0.016], trimM, [x, (DH + 0.06) / 2, Z0 + 0.008], null, 0.003));
      K.box(cas, [DX1 - DX0 + 0.124, 0.064, 0.016], trimM, [(DX0 + DX1) / 2, DH + 0.03, Z0 + 0.008], null, 0.003);
      const uc = K.part('undercut', [0, 0, 0], null, 'Undercut: plank-height slot under the casing');
      [DX0 - 0.03, DX1 + 0.03].forEach((x) => K.box(uc, [0.068, 0.009, 0.02], 'red', [x, 0.0165, Z0 + 0.008], null, 0));
      const base = K.part('oldBase', [0, 0, 0], null, 'Baseboard');
      K.box(base, [DX0 - 0.065 - X0, 0.09, 0.014], trimM, [(X0 + DX0 - 0.065) / 2, 0.012 + 0.045, Z0 + 0.007], null, 0.003);
      K.box(base, [X1 - DX1 - 0.065, 0.09, 0.014], trimM, [(X1 + DX1 + 0.065) / 2, 0.012 + 0.045, Z0 + 0.007], null, 0.003);
      K.box(base, [0.014, 0.09, Z1 - Z0], trimM, [X0 + 0.007, 0.057, 0], null, 0.003);
      K.box(base, [0.014, 0.09, Z1 - Z0], trimM, [X1 - 0.007, 0.057, 0], null, 0.003);
      const ul = K.part('underlay', [0, 0, 0], null, 'Underlayment / vapor barrier');
      K.box(ul, [X1 - X0 - 0.02, 0.0015, Z1 - Z0 - 0.02], K.std(0x9ab9c8, { roughness: 0.85 }), [0, 0.0128, 0], null, 0);
      const sp = K.part('spacers', [0, 0, 0], null, '⁵⁄₁₆″ expansion spacers');
      for (let z = -1.0; z < 1.3; z += 0.45) K.box(sp, [0.008, 0.03, 0.04], 'red', [X0 + 0.004, 0.03, z], null, 0);
      for (let x = -1.2; x < 0.4; x += 0.45) K.box(sp, [0.04, 0.03, 0.008], 'red', [x, 0.03, Z0 + 0.004], null, 0);
      // planks run along z, 7″ × 48″, rows from the left wall
      const PW = 0.178, PL = 1.22, Y = 0.0136, PT = 0.0065, G = 0.008;
      const tones = [0xa08566, 0x947a5c, 0xae9474, 0x8c7458, 0xb59c7c].map((c) => woodTone(K, c));
      const row1 = K.part('row1', [0, 0, 0], null, 'First row (tongue toward the wall cut off)');
      const rows = K.part('rows', [0, 0, 0], null, 'Field: end joints staggered ≥ 6″');
      const last = K.part('lastRow', [0, 0, 0], null, 'Last row, ripped to width');
      const offs = [0, 0.41, 0.82, 0.2, 0.61, 1.02, 0.31, 0.72, 0.1, 0.51, 0.92, 0.25, 0.66, 1.07, 0.36, 0.77, 0.15];
      let n = 0;
      for (let i = 0; i < 17; i++) {
        const xa = X0 + G + i * PW;
        const xb = Math.min(xa + PW, X1 - G);
        const p = i === 0 ? row1 : i === 16 ? last : rows;
        for (let s = Z0 + G - offs[i]; s < Z1; s += PL) {
          const a = Math.max(s, Z0 + G), b = Math.min(s + PL, Z1);
          if (b - a < 0.02) continue;
          K.box(p, [xb - xa - 0.0015, PT, b - a - 0.0015], tones[n++ % 5], [(xa + xb) / 2, Y + PT / 2, (a + b) / 2], null, 0.0012);
        }
      }
      const shoe = K.part('shoe', [0, 0, 0], null, 'Baseboard back on + shoe molding');
      const q = (len, pos, rotY) => K.box(K.group(shoe, pos, [0, rotY, 0]), [len, 0.019, 0.019], trimM, [0, 0, 0], null, 0.006);
      q(DX0 - 0.065 - X0, [(X0 + DX0 - 0.065) / 2, Y + PT + 0.0095, Z0 + 0.024], 0);
      q(X1 - DX1 - 0.065, [(X1 + DX1 + 0.065) / 2, Y + PT + 0.0095, Z0 + 0.024], 0);
      q(Z1 - Z0, [X0 + 0.024, Y + PT + 0.0095, 0], 90);
      q(Z1 - Z0, [X1 - 0.024, Y + PT + 0.0095, 0], 90);
      const tr = K.part('transition', [(DX0 + DX1) / 2, Y + PT, Z0 - 0.02], null, 'T-molding transition at the doorway');
      K.box(tr, [DX1 - DX0 - 0.02, 0.008, 0.045], woodTone(K, 0x947a5c), [0, 0.003, 0], null, 0.003);
    }
  );

  /* ---- Staircase cutaway (5 steps), open on the +z side ---- */
  TB.model(
    'stairs',
    FV({ cam: [2.1, 1.4, 2.2], at: [0.6, 0.55, 0], hidden: ['screws', 'plugs', 'glueBead', 'wedges', 'blocks', 'blockScrews'] }),
    (K) => {
      const N = 5, R = 0.254, H = 0.19, TT = 0.025, RT = 0.019, WD = 0.91;
      const oak = woodTone(K, 0xb88a58);
      const paintM = K.std(0xf4f2ec, { roughness: 0.6 });
      K.box(null, [2.2, 2.6, 0.1], K.std(0xe9e4d8, { roughness: 0.93 }), [0.7, 1.3, -WD / 2 - 0.05], null, 0);
      const st = K.part('stringers', [0, 0, 0], null, 'Stringers (2×12)');
      const pts = [[RT, 0]];
      for (let i = 0; i < N; i++) {
        pts.push([i * R + RT, (i + 1) * H - TT]);
        pts.push([(i + 1) * R + RT, (i + 1) * H - TT]);
      }
      pts.push([N * R + RT, N * H - TT - 0.28]);
      pts.push([RT + 0.4, 0]);
      [-WD / 2 + 0.02, 0, WD / 2 - 0.058].forEach((z) => K.ext(st, pts, 0.038, 'woodLight', [0, 0, z], null, 0.001));
      const treads = K.part('treads', [0, 0, 0], null, 'Treads (1″ oak)');
      const risers = K.part('risers', [0, 0, 0], null, 'Risers (¾″)');
      for (let i = 0; i < N; i++) {
        if (i !== 2) K.box(treads, [R + RT + 0.025, TT, WD], oak, [i * R - 0.025 + (R + RT + 0.025) / 2, (i + 1) * H - TT / 2, 0], null, 0.004);
        K.box(risers, [RT, H - TT, WD], paintM, [i * R + RT / 2, i * H + (H - TT) / 2, 0], null, 0.002);
      }
      const t2 = K.part('squeakTread', [0, 0, 0], null, 'Squeaky tread');
      K.box(t2, [R + RT + 0.025, TT, WD], oak, [2 * R - 0.025 + (R + RT + 0.025) / 2, 3 * H - TT / 2, 0], null, 0.004);
      const sq = K.part('squeak', [2 * R + 0.06, 3 * H + 0.002, 0.1], null, 'Squeak (tread rubs riser below)');
      K.cyl(sq, [0.09, 0.09, 0.002, 32], K.std(0xf2c84b, { transparent: true, opacity: 0.55 }));
      const gap = K.part('gap', [2 * R + RT + 0.004, 3 * H - TT - 0.002, 0], null, 'Gap under the tread');
      K.box(gap, [0.008, 0.004, WD - 0.1], 'red', [0, 0, 0], null, 0);
      const sc = K.part('screws', [0, 3 * H, 0], null, 'Trim-head screws into riser + stringers');
      [[2 * R + 0.0095, -0.25], [2 * R + 0.0095, 0.25], [2 * R + 0.12, -WD / 2 + 0.039], [2 * R + 0.12, WD / 2 - 0.039]].forEach(([x, z]) => K.screw(sc, 0.0035, 0.064, 'blackOxide', [x, 0.0005, z], [0, 0, 8], 'flat'));
      const pl = K.part('plugs', [0, 3 * H + 0.0006, 0], null, 'Wood filler over the heads');
      [[2 * R + 0.0095, -0.25], [2 * R + 0.0095, 0.25], [2 * R + 0.12, -WD / 2 + 0.039], [2 * R + 0.12, WD / 2 - 0.039]].forEach(([x, z]) => K.cyl(pl, [0.0065, 0.0065, 0.0012, 16], K.std(0xa47a4c, { roughness: 0.7 }), [x, 0, z]));
      const gb = K.part('glueBead', [2 * R + RT + 0.002, 3 * H - TT - 0.004, 0], null, 'Construction adhesive in the joint');
      K.cyl(gb, [0.004, 0.004, WD - 0.12, 12], K.std(0xe9e1c8, { roughness: 0.5 }), [0, 0, 0], [90, 0, 0]);
      // from below: wedges at the stringer seats, glue blocks in the tread/riser corner
      const wd = K.part('wedges', [0, 0, 0], null, 'Glued shims at the stringers');
      [-WD / 2 + 0.065, 0.045].forEach((z) => K.ext(K.group(wd, [2 * R + RT + 0.02, 3 * H - TT, z], [0, 0, 0]), [[0, 0], [0.12, 0], [0, -0.008]], 0.03, K.std(0xe2c99a, { roughness: 0.9 }), [0, 0, 0], null, 0));
      const bl = K.part('blocks', [2 * R + RT, 3 * H - TT, 0], null, 'Glue blocks (riser-to-tread corner)');
      [-0.23, 0.215].forEach((z) => K.ext(bl, [[0, 0], [0.045, 0], [0, -0.045]], 0.16, 'woodLight', [0, 0, z - 0.08], null, 0.001));
      const bs = K.part('blockScrews', [2 * R + RT, 3 * H - TT, 0], null, '1¼″ screws through the blocks');
      [-0.23, 0.215].forEach((z) => {
        K.screw(bs, 0.0035, 0.032, 'steel', [0.03, -0.017, z], [0, 0, 135], 'flat');
        K.screw(bs, 0.0035, 0.032, 'steel', [0.012, -0.03, z + 0.04], [0, 0, 135], 'flat');
      });
    }
  );
})();

/* ---- FLOORS: guides ---- */
(function () {
  const XD = 0.02, ZD = 0.085, TOP = 0.028;
  const PL = { cam: [1.1, 1.3, 1.6], at: [0.0, 0, 0.05] };
  const plankSteps = (lvp) => [
    { t: 'Get a matching plank', d: 'Find a leftover plank from the install, or take one from a closet. Check the brand, color and locking profile.', why: 'Even the same product changes color between production runs. A plank from inside a closet will match the faded floor better than a new box.', v: Object.assign({ hi: ['damaged'] }, PL) },
    { t: 'Drill relief holes', d: 'Drill ½″ holes at the four corners, about ½″ in from the ends, plus a few along each long side. Set a depth stop so you only go through the plank.', why: 'The holes let the cuts stop cleanly at the corners without nicking the neighboring planks.', v: { cam: [0.9, 0.7, 0.9], at: [XD - 0.3, TOP, ZD], hi: ['holes'], show: ['holes'], tool: { id: 'drill', at: [XD - 0.58, TOP, ZD - 0.07], rot: [0, 0, 0], anim: 'spin' } } },
    lvp
      ? { t: 'Score and cut out the middle', d: 'Draw lines between the holes. Score them deeply with a utility knife (several passes), or cut with an oscillating tool set to the plank thickness.', why: 'Vinyl cuts with a knife. Cutting the middle out first lets the edges fall away from the locked joints.', v: { cam: [0.9, 0.7, 0.9], at: [XD, TOP, ZD], hi: ['cutLines'], show: ['cutLines'], tool: { id: 'utilityKnife', at: [XD + 0.1, TOP, ZD - 0.07], rot: [0, 0, 20] } } }
      : { t: 'Cut out the middle', d: 'Draw lines between the holes. Set a circular saw to the plank’s exact thickness and plunge-cut along the lines, stopping at the holes.', why: 'A shallow blade protects the underlayment and subfloor. Cutting the middle out relieves the locked edges.', v: { cam: [0.9, 0.8, 1.0], at: [XD, TOP, ZD], hi: ['cutLines', 'saw'], show: ['cutLines', 'saw'], fx: 'saw' } },
    { t: 'Lift out the pieces', d: 'Pull the center strip, then wiggle the edge strips toward the middle to free them from the neighbors’ tongues and grooves.', why: 'Pulling the edges inward, not up, keeps the neighbors’ locking edges intact.', v: { cam: [0.9, 0.9, 1.0], at: [XD, TOP, ZD], hi: ['underlay', 'pieces'], show: ['pieces'], hide: ['damaged', 'holes', 'cutLines', 'saw'] } },
    { t: 'Trim the new plank', d: 'Cut the tongue off the long side and one end of the new plank, and trim the bottom lip of the groove on the other end.', why: 'Without its tongue, the plank can drop straight down into place instead of needing to be angled and clicked.', v: { cam: [0.7, 0.6, 1.3], at: [XD, TOP, ZD + 0.5], hi: ['newPlank', 'tongue'], show: ['newPlank', 'tongue'], mv: { newPlank: [0, 0.009, 0.5], tongue: [0, 0.009, 0.5] }, tool: { id: 'utilityKnife', at: [XD + 0.3, TOP + 0.008, ZD - 0.0985 + 0.5], rot: [0, 0, 20] } } },
    lvp
      ? { t: 'Add adhesive', d: 'Run vinyl seam adhesive (or double-sided flooring tape on the underlayment) along the opening’s edges.', why: 'With its locking tongue gone, the plank needs adhesive to stay level with its neighbors.', v: { cam: [0.9, 0.8, 1.0], at: [XD, TOP, ZD], hi: ['glue'], show: ['glue'], hide: ['tongue', 'pieces'], tool: { id: 'caulkGun', at: [XD - 0.3, TOP + 0.002, ZD + 0.096], rot: [0, 0, 60] } } }
      : { t: 'Glue the edges', d: 'Run a thin bead of wood glue in the grooves of the surrounding planks and on the new plank’s edges.', why: 'Glue replaces the locking joint you just cut off. Keep it thin so it doesn’t squeeze up.', v: { cam: [0.9, 0.8, 1.0], at: [XD, TOP, ZD], hi: ['glue'], show: ['glue'], hide: ['tongue', 'pieces'], tool: { id: 'caulkGun', at: [XD - 0.3, TOP + 0.002, ZD + 0.096], rot: [0, 0, 60] } } },
    { t: 'Drop it in and weight it', d: 'Slide the groove side in first, lower the plank flat and wipe off squeeze-out. Stack books on it for 24 hours.', why: 'Weight holds the plank flush while the glue cures so it doesn’t rock or click when walked on.', v: { cam: [1.1, 1.1, 1.5], at: [XD, TOP, ZD], hi: ['newPlank', 'weights'], show: ['weights'], mv: { newPlank: [0, 0, 0] } } },
  ];
  const plankLearn = (lvp) => ({
    how: 'A floating floor isn’t fastened down. The planks lock to each other with tongue-and-groove edges, and the whole floor moves as one sheet. That makes it hard to remove a plank in the middle, so instead you cut it out, remove the replacement’s locking tongue so it can drop in from above, and glue it in place.',
    specs: [['Relief holes', '½″ dia'], ['Saw/knife depth', 'Plank thickness only (' + (lvp ? '4–8 mm' : '7–12 mm') + ')'], ['Cure under weight', '24 hr'], ['Expansion gap at walls', '¼–⅜″']],
    terms: [['Floating floor', 'Planks locked to each other, not fastened to the subfloor.'], ['Click-lock', 'Profile that locks when angled and dropped.'], ['Underlayment', 'Foam or cork pad under the planks.']],
    mistakes: ['Cutting into the underlayment or subfloor.', 'Prying up neighbors and breaking their locks.', 'Too much glue, which squeezes up and stains.'],
    tips: ['Near a wall, it can be faster to pull the baseboard and unclick planks back to the damaged one.', 'Keep 2–3 spare planks from every install for this exact job.'],
  });
  TB.more('floors', [
    {
      id: 'replace-plank',
      title: 'Replace a damaged floor plank',
      model: 'plankFloor',
      level: 2,
      time: '1–2 hrs + overnight',
      cost: '$10–40',
      summary: 'A chipped, swollen or stained plank in the middle of a floating floor can be cut out and replaced without pulling up the room.',
      intro: { hi: ['damaged'] },
      safety: ['Wear safety glasses and hearing protection when drilling and cutting.', 'Check for radiant heat tubes or wires under the floor before cutting.'],
      causes: [['Water damage', 'Laminate swells at the edges and won’t go back down.'], ['Dropped objects', 'Chips and dents.'], ['Furniture', 'Scratches and gouges.']],
      tools: ['Matching plank', 'Drill + ½″ bit with depth stop', 'Circular saw or oscillating tool', 'Utility knife', 'Chisel', 'Wood glue or vinyl adhesive', 'Tape measure + pencil', 'Weights'],
      variants: [
        { id: 'laminate', name: 'Laminate', blurb: 'Hard, wood-fiber core with a photo layer. Cut with a saw; glue in with wood glue.' },
        { id: 'lvp', name: 'Vinyl plank (LVP)', blurb: 'Flexible vinyl or rigid SPC core. Score with a knife; set with vinyl adhesive.', steps: plankSteps(true), learn: plankLearn(true), tools: ['Matching plank', 'Drill + ½″ bit with depth stop', 'Utility knife (extra blades) or oscillating tool', 'Vinyl seam adhesive or flooring tape', 'Straightedge', 'Tape measure + pencil', 'Weights'] },
      ],
      steps: plankSteps(false),
      learn: plankLearn(false),
      pro: 'Several planks are damaged by water from below (find the leak first), or the floor is glued down or nailed hardwood.',
    },
    {
      id: 'lvp-floor',
      title: 'Install a floating vinyl plank floor',
      kind: 'build',
      model: 'lvpRoom',
      level: 3,
      time: '1–2 days per room',
      cost: '$2–6 per sq ft',
      summary: 'Click-together vinyl planks float over a flat subfloor. Plan the layout, start straight, stagger the joints and leave a gap at every wall, and a 12×12 room goes down in a day.',
      intro: { show: ['underlay', 'row1', 'rows', 'lastRow', 'shoe', 'transition'], preview: true, hi: ['rows'] },
      safety: ['Wear knee pads; you’ll be kneeling all day.', 'Wear safety glasses when cutting. Use a knife and straightedge or a vinyl cutter; avoid breathing dust from power-sawing vinyl.', 'Old sheet vinyl or tile glue may contain asbestos. Don’t sand or scrape it; float over it or test first.'],
      causes: [['Measure and add 10%', 'Room square footage plus 10% for cuts and waste.'], ['Check flatness', 'Most makers require flat within 3⁄16″ over 10 ft.'], ['Plan the last row', 'Divide the room width by the plank width. If the last row would be under 2″, rip the first row too.'], ['Run planks lengthwise', 'Parallel to the longest wall or the main light source.']],
      tools: ['Vinyl planks + 10%', 'Underlayment (if not attached)', 'Utility knife + straightedge', 'Tapping block + pull bar', 'Rubber mallet', 'Spacers', 'Oscillating tool or jamb saw', 'Pry bar', 'Tape measure + square', 'Knee pads'],
      steps: [
        { t: 'Acclimate and check the subfloor', d: 'Leave the boxes in the room for 48 hours. Sweep, then check flatness with a long level; fill dips and grind or sand high spots.', why: 'Dips make the click joints flex and eventually break. Acclimating lets the planks reach room temperature.', v: { cam: [0.6, 1.5, 2.6], at: [0, 0, -0.2], hi: ['subfloor'], tool: { id: 'level', at: [-0.4, 0.012, 0.2], rot: [0, 0, 0], scale: 1.8 } } },
        { t: 'Pull the baseboard', d: 'Score the caulk line, then pry the baseboard off with a flat bar against a scrap block. Number the pieces.', why: 'The floor has to slide under the trim; reinstalled baseboard hides the expansion gap.', v: { cam: [0.2, 0.8, 0.6], at: [-0.8, 0.06, -1.25], hi: ['oldBase'], mv: { oldBase: [0, 0, 0.15] }, tool: { id: 'flatBar', at: [-0.8, 0.07, -1.279], rot: [0, 0, 0] } } },
        { t: 'Undercut the door casing', d: 'Lay a plank scrap on underlayment beside the casing and cut the casing off at its top with a jamb saw or oscillating tool.', why: 'Tucking the floor under the casing hides the cut, instead of trying to scribe around trim.', v: { cam: [1.3, 0.5, -0.5], at: [0.8, 0.03, -1.3], hi: ['undercut', 'casing'], show: ['undercut'], tool: { id: 'handsaw', at: [0.42, 0.018, -1.25], rot: [0, 0, 90], anim: 'slide', scale: 0.8 } } },
        { t: 'Roll out underlayment', d: 'If the planks don’t have pad attached, roll out the underlayment the long way, seams butted and taped. Use a vapor barrier over concrete.', why: 'Pad smooths small bumps and quiets footsteps. Overlapped seams make a ridge that shows through.', v: { cam: [0.6, 2.7, 3.7], at: [0, 0.2, -0.2], hi: ['underlay'], show: ['underlay'], hide: ['undercut'] } },
        { t: 'Lay the first row straight', d: 'Cut the tongue off the first row, set it against spacers on the starting wall and check it’s straight with a string line.', why: 'Every row locks to the one before. A crooked first row opens gaps across the whole room.', v: { cam: [-0.2, 1.4, 2.0], at: [-1.3, 0, 0], hi: ['row1', 'spacers'], show: ['row1', 'spacers'], tool: { id: 'tape', at: [-1.41, 0.02, 1.25], rot: [-90, 0, 0] } } },
        { t: 'Fill the field', d: 'Angle each long edge into the previous row and drop it; tap the end joints closed with a tapping block. Start each row with the cut-off from the last one, keeping end joints at least 6″ apart.', why: 'Staggered joints spread stress and look natural. Lined-up joints form weak seams and an obvious pattern.', v: { cam: [0.8, 2.2, 3.0], at: [0, 0, 0], hi: ['rows'], show: ['rows'], tool: { id: 'hammer', at: [0.3, 0.05, 0.6], rot: [0, 0, 90], anim: 'tap' } } },
        { t: 'Rip the last row', d: 'Measure the gap at several points, subtract the expansion gap, and score and snap the last planks to width. Lever them in with a pull bar.', why: 'Walls are rarely straight, so measure at both ends of every plank.', v: { cam: [2.2, 1.3, 1.6], at: [1.3, 0, 0], hi: ['lastRow'], show: ['lastRow'], tool: { id: 'utilityKnife', at: [1.42, 0.02, 0.9], rot: [0, 0, 20] } } },
        { t: 'Trim out', d: 'Pull the spacers, reinstall the baseboard and add shoe molding. Fit a transition at the doorway. Nail trim to the wall, never to the floor.', why: 'The floor must stay free to move. Nailing trim into it pins the floor and causes buckling.', v: { cam: [0.6, 2.7, 3.7], at: [0, 0.2, -0.2], hi: ['shoe', 'transition'], show: ['shoe', 'transition'], hide: ['spacers'], mv: { oldBase: [0, 0, 0] } } },
      ],
      learn: {
        how: 'Luxury vinyl plank is a layered product: a wear layer, a printed film and a vinyl or stone-plastic (SPC) core, with a click profile milled on the edges. The planks lock to each other but not to the subfloor, so the whole floor expands and contracts as one sheet. That’s why every edge needs a gap, hidden under trim.',
        specs: [['Expansion gap', '¼–⅜″ (check maker)'], ['End-joint stagger', '≥ 6″ (8″ better)'], ['Flatness', '3⁄16″ in 10 ft'], ['Acclimate', '48 hr'], ['Min. last-row width', '2″']],
        terms: [['Floating floor', 'Not glued or nailed down.'], ['SPC', 'Stone-plastic composite: a rigid, waterproof core.'], ['Undercut', 'Trimming door casing so flooring slides beneath.'], ['T-molding', 'Transition strip between two floors of similar height.']],
        mistakes: ['No expansion gap at walls or cabinets.', 'Lining up end joints (H-joints).', 'Installing over a wavy subfloor.', 'Pinning the floor with trim nails or kitchen islands.'],
        tips: ['Open several boxes and mix planks for natural color variation.', 'Lay the first few rows dry to check the look before committing.'],
      },
      pro: 'The subfloor is out of flat by more than ¼″, the floor is over a basement with moisture problems, or there are many rooms with transitions and stairs.',
    },
    {
      id: 'squeaky-stairs',
      title: 'Fix squeaky stairs',
      model: 'stairs',
      level: 2,
      time: '30–90 min',
      cost: '$10–30',
      summary: 'Stairs squeak when a tread rubs the riser or stringer under it. Pin the tread down with screws from above, or glue shims and blocks underneath if you can reach.',
      intro: { hi: ['squeakTread', 'squeak'] },
      safety: ['Keep the stairs blocked off while glue cures, and warn the family.', 'Check for wires or pipes under the stairs before drilling.'],
      causes: [['Gaps under the tread', 'Wood shrinks and the tread rocks on the riser or stringer.'], ['Loose nails', 'Nails work loose and slide in their holes.'], ['Failed glue blocks', 'Underneath, the blocks fall off over time.']],
      tools: ['Drill/driver + bits', 'Trim-head screws (2½″)', 'Construction adhesive', 'Wood shims', 'Glue blocks', 'Wood filler', 'Helper'],
      variants: [
        { id: 'above', name: 'From above', blurb: 'Finished stairs with no access underneath: screws through the tread.' },
        {
          id: 'below',
          name: 'From below',
          blurb: 'Open underside (basement or closet): glue shims and blocks; nothing shows on the stairs.',
          steps: [
            { t: 'Find the moving tread', d: 'Have a helper walk the stairs while you watch from below. Mark where the tread moves.', why: 'You need to know whether it moves at the riser or at a stringer.', v: { cam: [1.6, 0.35, 1.6], at: [0.6, 0.45, 0], hi: ['squeakTread', 'gap'], xray: true } },
            { t: 'Glue and tap in shims', d: 'Coat thin shims with glue and tap them into the gaps between the tread and the stringers until snug. Don’t lift the tread.', why: 'Shims fill the gap so the tread can’t drop and rub. Driving them too hard lifts the tread and makes a new squeak.', v: { cam: [1.2, 0.25, 1.2], at: [0.6, 0.5, 0], hi: ['wedges'], show: ['wedges'], xray: true, tool: { id: 'hammer', at: [0.66, 0.5, 0.045], rot: [0, 0, 90], anim: 'tap', scale: 0.8 } } },
            { t: 'Add glue blocks', d: 'Glue triangular blocks into the corner where the riser meets the tread above.', why: 'Blocks stiffen the joint along its length, so the riser can’t flex against the tread.', v: { cam: [1.2, 0.25, 1.2], at: [0.6, 0.5, 0], hi: ['blocks'], show: ['blocks'], xray: true } },
            { t: 'Screw the blocks', d: 'Drive a short screw through each block into the tread and one into the riser. Don’t go through the tread.', why: 'Screws clamp the blocks while the glue cures and hold if the glue ever fails.', v: { cam: [1.2, 0.25, 1.2], at: [0.6, 0.5, 0], hi: ['blockScrews'], show: ['blockScrews'], xray: true, tool: { id: 'drill', at: [0.555, 0.52, 0.215], rot: [180, 0, 0], anim: 'spin', scale: 0.9 } } },
            { t: 'Test after it cures', d: 'Let the glue cure overnight, then walk the stairs.', why: 'Most stairs have more than one squeak; fix them in one session.', v: { cam: [2.1, 1.4, 2.2], at: [0.6, 0.55, 0], hi: ['squeakTread'] } },
          ],
        },
      ],
      steps: [
        { t: 'Find the squeak', d: 'Step on each tread at the front, middle and back. Mark where the sound is.', why: 'A squeak at the front means the tread moves on the riser; at the ends it’s on a stringer.', v: { cam: [2.1, 1.4, 2.2], at: [0.6, 0.55, 0], hi: ['squeak', 'squeakTread'] } },
        { t: 'Locate the riser and stringers', d: 'The riser is right under the tread’s front edge, behind the nosing. Find stringers with a stud finder or by tapping.', why: 'Screws must hit solid wood; screwing into air only makes a new hole.', v: { cam: [1.3, 1.0, 1.2], at: [0.6, 0.55, 0], hi: ['risers', 'stringers'], xray: true } },
        { t: 'Inject adhesive', d: 'If you can see a gap at the back joint, squeeze construction adhesive into it.', why: 'Adhesive fills the gap so the tread can’t move.', v: { cam: [1.1, 0.9, 0.9], at: [0.75, 0.55, 0], hi: ['glueBead', 'gap'], show: ['glueBead'], xray: true } },
        { t: 'Drive trim-head screws', d: 'Drill angled pilot holes and drive 2½″ trim-head screws through the tread into the riser and stringers, two at the riser.', why: 'Pilot holes keep oak from splitting. Small trim heads leave tiny holes to fill.', v: { cam: [1.0, 1.1, 0.9], at: [0.55, 0.57, 0], hi: ['screws'], show: ['screws'], tool: { id: 'drill', at: [0.5175, 0.571, 0.25], rot: [0, 0, 8], anim: 'spin', scale: 0.9 } } },
        { t: 'Fill the holes', d: 'Fill the holes with matching wood filler or putty, then touch up the finish.', why: 'Filled holes are almost invisible on wood treads.', v: { cam: [1.0, 1.1, 0.9], at: [0.55, 0.57, 0], hi: ['plugs'], show: ['plugs'], tool: { id: 'puttyKnife', at: [0.5175, 0.572, -0.25], rot: [0, 0, 30] } } },
      ],
      learn: {
        how: 'A staircase is a set of treads and risers sitting on sloped boards called stringers. When wood dries and shrinks, small gaps open; as you step, the tread drops a hair and rubs the riser or slides on a nail. That rubbing is the squeak. Every fix closes the gap so the tread can’t move.',
        specs: [['Rise', '7–7¾″'], ['Run', '10–11″'], ['Tread thickness', '1″ (oak typical)'], ['Screw', '2½″ trim-head, pilot ⅛″']],
        terms: [['Tread', 'The part you step on.'], ['Riser', 'The vertical board between treads.'], ['Stringer', 'The sloped board that supports treads.'], ['Glue block', 'Small triangular block glued into a corner.']],
        mistakes: ['Screwing without a pilot hole and splitting the tread.', 'Driving shims so hard they lift the tread.', 'Missing the riser with the screws.'],
        tips: ['On carpeted stairs, use a squeak-repair kit with breakaway screws that go through the carpet.', 'A little talcum powder in the joint quiets a squeak temporarily.'],
      },
      pro: 'Treads are cracked, the stairs feel bouncy or the stringer is split.',
    },
  ]);
})();

/* =====================================================================
   FURNITURE: models
   ===================================================================== */
(function () {
  const { VIEW } = TB.IM;
  const woodTone = (K, c) => K.bumpy(c, K.tex.woodBump(), 0.004, { roughness: 0.5 });

  /* ---- Dining table, upside down on a blanket, leg held by corner bracket + hanger bolt ---- */
  TB.model(
    'tableLeg',
    VIEW({ cam: [1.7, 1.5, 1.7], at: [0, 0.3, 0], hidden: ['glue', 'newScrews'] }),
    (K) => {
      const wood = woodTone(K, 0x8a5a36);
      const bl = K.part('blanket', [0, 0, 0], null, 'Moving blanket');
      K.box(bl, [1.6, 0.006, 1.2], K.bumpy(0x3d5a80, K.tex.weave(), 0.004, { roughness: 1 }), [0, 0.003, 0], null, 0);
      const top = K.part('top', [0, 0, 0], null, 'Tabletop (upside down)');
      K.box(top, [1.2, 0.03, 0.8], wood, [0, 0.021, 0], null, 0.006);
      const ap = K.part('aprons', [0, 0, 0], null, 'Aprons');
      [-1, 1].forEach((s) => {
        K.box(ap, [1.08, 0.09, 0.022], wood, [0, 0.081, s * 0.329], null, 0.003);
        K.box(ap, [0.022, 0.09, 0.68], wood, [s * 0.529, 0.081, 0], null, 0.003);
      });
      const LX = 0.5075, LZ = 0.3075, LL = 0.72;
      const legs = K.part('legs', [0, 0, 0], null, 'Legs');
      const leg = (p, x, z) => {
        K.box(p, [0.065, LL, 0.065], wood, [x, 0.036 + LL / 2, z], null, 0.006);
        K.box(p, [0.04, 0.012, 0.04], 'black', [x, 0.036 + LL + 0.006, z], null, 0.004); // glide
      };
      [[-1, -1], [1, -1], [-1, 1]].forEach(([a, b]) => leg(legs, a * LX, b * LZ));
      const ll = K.part('looseLeg', [0, 0, 0], null, 'Loose leg');
      leg(ll, LX, LZ);
      const steel = K.std(0x9aa0a6, { metalness: 0.85, roughness: 0.4 });
      const corner = (p, sx, sz, name) => {
        const g = K.group(p, [sx * 0.443, 0.081, sz * 0.243], [0, sx * sz > 0 ? 45 : -45, 0]);
        K.box(g, [0.17, 0.05, 0.004], steel, [0, 0, 0], null, 0);
        [-1, 1].forEach((e) => K.box(g, [0.006, 0.05, 0.03], steel, [e * 0.085, 0, sx * sz > 0 ? 0.0 : 0], [0, e * 45, 0], 0));
        return g;
      };
      const others = K.group(null, [0, 0, 0]);
      [[-1, -1], [1, -1], [-1, 1]].forEach(([a, b]) => {
        const g = corner(others, a, b);
        const fl = a * b > 0 ? 1 : -1;
        K.cyl(g, [0.004, 0.004, 0.08, 12], 'steel', [0, 0, 0.02 * fl], [90, 0, 0]);
        K.nut(g, 0.013, 0.008, 'steel', [0, 0, -0.006 * fl], [90, 0, 0]);
      });
      // the loose corner (+x, +z): parts we work on
      const br = K.part('bracket', [0, 0, 0], null, 'Corner bracket (screws stripped)');
      const g = corner(br, 1, 1);
      [-1, 1].forEach((e) => K.screw(g, 0.004, 0.025, 'steel', [e * 0.07, 0.012, -0.004], [-90, 0, 0], 'flat'));
      const hb = K.part('hangerBolt', [0.443, 0.081, 0.243], null, 'Hanger bolt (wood thread in leg, machine thread out)');
      K.bar(hb, [-0.008, 0, -0.008], [0.045, 0, 0.045], 0.004, 'steel');
      const nut = K.part('nut', [0.443 - 0.006, 0.081, 0.243 - 0.006], null, 'Nut + washer');
      K.nut(K.group(nut, [0, 0, 0], [0, 45, 0]), 0.013, 0.008, 'steel', [0, 0, 0], [90, 0, 0]);
      K.cyl(K.group(nut, [0.004, 0, 0.004], [0, 45, 0]), [0.011, 0.011, 0.002, 20], 'steel', [0, 0, 0], [90, 0, 0]);
      const gl = K.part('glue', [LX - 0.0325, 0.081, LZ - 0.0325], null, 'Glue on the leg-to-apron faces');
      K.box(gl, [0.002, 0.08, 0.05], K.std(0xf4eedc, { roughness: 0.4 }), [0, 0, 0.03], null, 0);
      K.box(gl, [0.05, 0.08, 0.002], K.std(0xf4eedc, { roughness: 0.4 }), [0.03, 0, 0], null, 0);
      const ns = K.part('newScrews', [0, 0, 0], null, 'Longer screws in fresh holes');
      const g2 = corner(ns, 1, 1);
      g2.children.forEach((c) => (c.visible = false));
      [-1, 1].forEach((e) => K.screw(g2, 0.0045, 0.032, 'brass', [e * 0.07, -0.012, -0.004], [-90, 0, 0], 'flat'));
    }
  );

  /* ---- Kitchen base cabinet with a drawer on side-mount ball-bearing slides ---- */
  TB.model(
    'drawerSlide',
    VIEW({ cam: [1.2, 1.3, 1.5], at: [0, 0.65, 0.1], hidden: ['newSlides', 'newInner', 'balls'] }),
    (K) => {
      const ply = K.std(0xe8dcc4, { roughness: 0.7 });
      const doorM = K.std(0x4b6a7a, { roughness: 0.45 });
      const cab = K.part('cabinet', [0, 0, 0], null, 'Base cabinet');
      const W = 0.6, D = 0.56, Y0 = 0.1, Y1 = 0.86, ZF = 0.28;
      K.box(cab, [0.019, Y1 - Y0 + 0.1, D], ply, [-W / 2 + 0.0095, (Y1 + 0) / 2, 0], null, 0.002);
      K.box(cab, [0.019, Y1 - Y0 + 0.1, D], K.std(0xe8dcc4, { roughness: 0.7, transparent: true, opacity: 0.22 }), [W / 2 - 0.0095, Y1 / 2, 0], null, 0.002);
      K.box(cab, [W, 0.019, D], ply, [0, Y0 + 0.0095, 0], null, 0.002);
      K.box(cab, [W, Y1 - Y0, 0.006], ply, [0, (Y0 + Y1) / 2, -D / 2 + 0.003], null, 0);
      K.box(cab, [W - 0.04, 0.09, 0.019], 'black', [0, 0.045, ZF - 0.06], null, 0.002);
      K.box(cab, [W, 0.019, 0.08], ply, [0, 0.66, ZF - 0.04], null, 0.002); // rail under the drawer
      K.box(cab, [W - 0.006, 0.55, 0.019], doorM, [0, 0.1 + 0.28, ZF + 0.0095], null, 0.004);
      K.box(cab, [0.012, 0.12, 0.03], 'steel', [W / 2 - 0.06, 0.55, ZF + 0.03], null, 0.005);
      K.box(null, [W + 0.04, 0.03, D + 0.06], K.pbr('granite_tile', [1, 1], { roughness: 0.4 }, K.std(0xd8d4cc, { roughness: 0.3 })), [0, Y1 + 0.015, 0.02], null, 0.004);
      const steel = K.std(0xc3c7cb, { metalness: 0.85, roughness: 0.35 });
      const sy = 0.735, SL = 0.508;
      const member = (p, x, mat, bent) => {
        const g = K.group(p, [x, sy, ZF - 0.02 - SL / 2], bent ? [0, 0, bent] : null);
        K.box(g, [0.006, 0.035, SL], mat, [0, 0, 0], null, 0.001);
        K.box(g, [0.006, 0.004, SL], mat, [-Math.sign(x) * 0.003, 0.016, 0], null, 0);
        K.box(g, [0.006, 0.004, SL], mat, [-Math.sign(x) * 0.003, -0.016, 0], null, 0);
        [-0.2, 0.0, 0.2].forEach((z) => K.screw(g, 0.0035, 0.016, mat, [-Math.sign(x) * 0.004, 0, z], [0, 0, Math.sign(x) * 90], 'flat'));
        return g;
      };
      const xi = W / 2 - 0.019 - 0.003;
      const old = K.part('oldSlides', [0, 0, 0], null, 'Cabinet members (right one bent)');
      member(old, -xi, steel);
      member(old, xi, steel, 6);
      const nw = K.part('newSlides', [0, 0, 0], null, 'New full-extension slides (cabinet members)');
      member(nw, -xi, K.std(0xdfe3e6, { metalness: 0.9, roughness: 0.25 }));
      member(nw, xi, K.std(0xdfe3e6, { metalness: 0.9, roughness: 0.25 }));
      const balls = K.part('balls', [0, 0, 0], null, 'Spilled ball bearings + broken retainer');
      [[0.1, 0.02], [0.13, -0.05], [0.18, 0.06], [0.05, 0.1]].forEach(([x, z]) => K.sph(balls, 0.003, 'chrome', [x, Y0 + 0.022, z]));
      K.box(balls, [0.006, 0.01, 0.07], 'steel', [0.2, Y0 + 0.024, 0.0], [0, 30, 20], 0);
      // drawer with its inner members
      const dr = K.part('drawer', [0, 0, 0], null, 'Drawer');
      const bw = W - 2 * 0.019 - 0.0254;
      const bz = ZF - 0.02 - 0.25;
      K.box(dr, [bw, 0.012, 0.5], ply, [0, 0.69, bz], null, 0.001);
      [-1, 1].forEach((s) => K.box(dr, [0.015, 0.12, 0.5], 'woodLight', [s * (bw / 2 - 0.0075), 0.75, bz], null, 0.002));
      K.box(dr, [bw, 0.12, 0.015], 'woodLight', [0, 0.75, bz - 0.2425], null, 0.002);
      K.box(dr, [bw, 0.12, 0.015], 'woodLight', [0, 0.75, bz + 0.2425], null, 0.002);
      K.box(dr, [W - 0.006, 0.17, 0.019], doorM, [0, 0.765, ZF + 0.0095], null, 0.004);
      K.box(dr, [0.16, 0.012, 0.03], 'steel', [0, 0.78, ZF + 0.033], null, 0.005);
      const xo = bw / 2 + 0.003;
      const inner = (name, label, mat) => {
        const p = K.part(name, [0, 0, 0], dr, label);
        [-1, 1].forEach((s) => {
          K.box(p, [0.005, 0.025, 0.48], mat, [s * xo, sy, bz], null, 0.001);
          K.box(p, [0.006, 0.012, 0.03], 'black', [s * (xo + 0.002), sy, bz + 0.2], null, 0.002); // release lever
          [-0.18, 0.0, 0.18].forEach((z) => K.screw(p, 0.0035, 0.014, mat, [s * (xo + 0.002), sy, bz + z], [0, 0, -s * 90], 'flat'));
        });
        return p;
      };
      inner('oldInner', 'Drawer members (with release levers)', steel);
      inner('newInner', 'New drawer members', K.std(0xdfe3e6, { metalness: 0.9, roughness: 0.25 }));
    }
  );

  /* ---- Dining chair with a drop-in upholstered seat ---- */
  TB.model(
    'chairSeat',
    VIEW({ cam: [1.1, 1.0, 1.3], at: [0, 0.5, 0], hidden: ['foam', 'batting', 'fabric', 'staples', 'dustCover', 'stapleGun'] }),
    (K) => {
      const wood = woodTone(K, 0x5e3b22);
      const ch = K.part('chair', [0, 0, 0], null, 'Chair frame');
      const SH = 0.455;
      [[-1, 1], [1, 1]].forEach(([a, b]) => K.box(ch, [0.04, SH, 0.04], wood, [a * 0.2, SH / 2, b * 0.19], null, 0.004));
      [-1, 1].forEach((a) => {
        K.box(ch, [0.04, 0.95, 0.04], wood, [a * 0.2, 0.475, -0.19], [-4, 0, 0], 0.004);
        K.box(ch, [0.02, 0.02, 0.36], wood, [a * 0.2, 0.15, 0], null, 0.003); // side stretchers
      });
      K.box(ch, [0.4, 0.07, 0.02], wood, [0, SH - 0.035, 0.19], null, 0.003);
      K.box(ch, [0.4, 0.07, 0.02], wood, [0, SH - 0.035, -0.19], null, 0.003);
      [-1, 1].forEach((a) => K.box(ch, [0.02, 0.07, 0.36], wood, [a * 0.19, SH - 0.035, 0], null, 0.003));
      K.box(ch, [0.42, 0.08, 0.03], wood, [0, 0.9, -0.225], [-4, 0, 0], 0.008);
      [-0.08, 0.08].forEach((x) => K.box(ch, [0.04, 0.38, 0.018], wood, [x, 0.68, -0.21], [-4, 0, 0], 0.004));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => K.box(ch, [0.05, 0.04, 0.05], 'woodLight', [a * 0.155, SH - 0.05, b * 0.145], [0, 45, 0], 0.003)); // corner blocks
      const scr = K.part('seatScrews', [0, 0, 0], null, 'Screws up through the corner blocks');
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => K.screw(scr, 0.004, 0.04, 'steel', [a * 0.155, SH - 0.072, b * 0.145], [180, 0, 0], 'flat'));
      // seat
      const seat = K.part('seat', [0, SH, 0], null, 'Drop-in seat');
      const base = K.part('base', [0, 0.006, 0], seat, 'Plywood seat base');
      K.box(base, [0.4, 0.012, 0.38], K.std(0xd8bd8e, { roughness: 0.8 }), [0, 0, 0], null, 0.002);
      const of = K.part('oldFabric', [0, 0, 0], seat, 'Old stained fabric + flat foam');
      K.box(of, [0.41, 0.045, 0.39], K.bumpy(0xbfae8c, K.tex.weave(), 0.003, { roughness: 1 }), [0, 0.025, 0], null, 0.015);
      [[0.05, 0.03, 0.04], [-0.1, -0.06, 0.03]].forEach(([x, z, r]) => K.cyl(of, [r, r, 0.002, 20], K.std(0x7d6a4a, { roughness: 1 }), [x, 0.048, z]));
      const fo = K.part('foam', [0, 0.012, 0], seat, '2″ high-density foam');
      K.box(fo, [0.4, 0.05, 0.38], K.std(0xf2e2a2, { roughness: 1 }), [0, 0.025, 0], null, 0.012);
      const bt = K.part('batting', [0, 0.012, 0], seat, 'Dacron batting');
      K.box(bt, [0.412, 0.057, 0.392], K.std(0xfbfaf6, { roughness: 1, transparent: true, opacity: 0.85 }), [0, 0.027, 0], null, 0.02);
      const fb = K.part('fabric', [0, 0.012, 0], seat, 'New upholstery fabric');
      const pattern = K.bumpy(0x2f4a6b, K.tex.weave(), 0.004, { roughness: 0.95 });
      K.box(fb, [0.425, 0.064, 0.405], pattern, [0, 0.029, 0], null, 0.025);
      K.box(fb, [0.425, 0.012, 0.405], pattern, [0, -0.012, 0], null, 0.004);
      const stp = K.part('staples', [0, -0.0005, 0], seat, 'Staples every 1–1½″');
      for (let i = -5; i <= 5; i++) {
        [-1, 1].forEach((s) => {
          K.box(stp, [0.012, 0.0015, 0.002], 'steel', [i * 0.033, 0, s * 0.175], null, 0);
          if (Math.abs(i) <= 4) K.box(stp, [0.002, 0.0015, 0.012], 'steel', [s * 0.185, 0, i * 0.036], null, 0);
        });
      }
      const dc = K.part('dustCover', [0, -0.002, 0], seat, 'Black dust cover (cambric)');
      K.box(dc, [0.36, 0.001, 0.34], K.std(0x1d1e20, { roughness: 1 }), [0, 0, 0], null, 0);
      const sg = K.part('stapleGun', [0.24, SH + 0.38, 0.5], null, 'Staple gun');
      K.box(sg, [0.17, 0.045, 0.035], K.std(0xd0433a, { roughness: 0.5 }), [0, 0, 0], null, 0.008);
      K.box(sg, [0.15, 0.02, 0.025], 'steel', [0.0, 0.035, 0], [0, 0, -8], 0.006);
    }
  );
})();

/* ---- FURNITURE: guides ---- */
(function () {
  const NUT = [0.437, 0.081, 0.237];
  const CLOSE = { cam: [0.95, 0.55, 0.85], at: [0.45, 0.1, 0.25] };
  const SEAT_UP = { seat: [0, 0.35, 0.5] };
  TB.more('furniture', [
    {
      id: 'loose-table-leg',
      title: 'Fix a wobbly table leg',
      model: 'tableLeg',
      level: 1,
      time: '30–60 min + glue cure',
      cost: '$0–15',
      summary: 'Most dining tables hold each leg with a steel corner bracket, a hanger bolt and a nut. A wobble is usually a loose nut, a hanger bolt backing out of the leg, or stripped bracket screws.',
      intro: { hi: ['looseLeg', 'bracket'] },
      safety: ['Flip the table with a helper onto a blanket to protect the top and your back.', 'Remove any glass top or leaves first.'],
      causes: [['Loose nut', 'Seasonal wood movement and dragging the table loosen it over time.'], ['Hanger bolt spinning in the leg', 'Its wood threads have stripped the hole.'], ['Stripped bracket screws', 'The bracket can’t pull the leg tight.'], ['Uneven floor', 'Check on a flat floor before taking anything apart.']],
      tools: ['Socket or adjustable wrench', 'Two nuts (to lock the hanger bolt)', 'Screwdriver/drill', 'Wood glue', 'Slightly longer wood screws or toothpicks + glue', 'Moving blanket', 'Helper'],
      steps: [
        { t: 'Flip it onto a blanket', d: 'With a helper, turn the table upside down onto a blanket and rock each leg to find the loose one.', why: 'Upside down, you can see every bracket and nut, and the top is protected.', v: { cam: [1.7, 1.5, 1.7], at: [0, 0.3, 0], hi: ['looseLeg'] } },
        { t: 'Find what’s loose', d: 'Watch the corner while you rock the leg. Is the nut loose, does the hanger bolt turn in the leg, or does the bracket pull away from the aprons?', why: 'Each cause has a different fix. Tightening a nut on a spinning hanger bolt does nothing.', v: Object.assign({ hi: ['nut', 'hangerBolt', 'bracket'] }, CLOSE) },
        { t: 'Remove the nut and leg', d: 'Back off the nut and pull the leg away from the corner.', why: 'You need the leg out to fix the hanger bolt and add glue.', v: Object.assign({ hi: ['nut', 'looseLeg'], mv: { nut: [-0.03, 0, -0.03], looseLeg: [0.035, 0.02, 0.035] }, tool: { id: 'ratchet', at: NUT, rot: [0, -45, 90], anim: 'turn' } }, CLOSE) },
        { t: 'Reset the hanger bolt', d: 'Spin two nuts onto the bolt and tighten them against each other. Unscrew the bolt with the outer nut, add epoxy or glue-soaked toothpicks to the hole, and drive it back in with the inner nut.', why: 'Jammed nuts let a wrench turn a bolt that has no head. Fresh fibers in the hole give the wood threads new bite.', v: Object.assign({ hi: ['hangerBolt'], mv: { hangerBolt: [0.035, 0.02, 0.035] } }, CLOSE) },
        { t: 'Glue the faces and reseat the leg', d: 'Spread a thin coat of glue where the leg meets the aprons, set the leg back and thread the nut on.', why: 'Glue on these faces stops the tiny movement that loosens the nut in the first place.', v: Object.assign({ hi: ['glue', 'looseLeg'], show: ['glue'], mv: { looseLeg: [0, 0, 0], hangerBolt: [0, 0, 0], nut: [0, 0, 0] } }, CLOSE) },
        { t: 'Tighten the nut', d: 'Snug the nut with a wrench while pushing the leg tight into the corner, then give it another quarter turn.', why: 'Overtightening can bend the bracket or crack the leg corner.', v: Object.assign({ hi: ['nut', 'bracket'], tool: { id: 'ratchet', at: NUT, rot: [0, -45, 90], anim: 'turn' } }, CLOSE) },
        { t: 'Fix stripped bracket screws', d: 'If the bracket screws spin, fill the holes with glue-dipped toothpicks or use screws ¼″ longer, being careful not to go through the top.', why: 'The bracket screws are what pull the aprons tight to the leg.', v: Object.assign({ hi: ['newScrews', 'bracket'], show: ['newScrews'], tool: { id: 'screwdriver', at: [0.493, 0.069, 0.243], rot: [0, 45, 90], anim: 'turn' } }, CLOSE) },
        { t: 'Flip and test', d: 'Let the glue set, flip the table back and check it on a flat spot. Retighten all four legs once a year.', why: 'A yearly check catches loose nuts before they wallow out the hole.', v: { cam: [1.7, 1.5, 1.7], at: [0, 0.3, 0], hi: ['looseLeg', 'legs'] } },
      ],
      learn: {
        how: 'A hanger bolt has wood threads on one end (screwed into the leg) and machine threads on the other. It passes through a steel corner bracket that sits in slots in the two aprons. Tightening the nut pulls the leg into the corner, and the bracket spreads that force to both aprons, making a rigid frame.',
        specs: [['Hanger bolt', '5⁄16″ or ⅜″ typical'], ['Glue clamp time', '30–60 min; full cure 24 hr'], ['Bracket screws', '#8–#10, check length vs. apron']],
        terms: [['Apron', 'Board between the legs under the top.'], ['Hanger bolt', 'Headless bolt with wood and machine threads.'], ['Jam nuts', 'Two nuts tightened against each other to turn a bolt.']],
        mistakes: ['Adding shims under a leg instead of fixing the joint.', 'Screws long enough to come through the top.', 'Overtightening and cracking the leg.'],
        tips: ['Felt glides on all legs reduce the racking forces from dragging the table.'],
      },
      pro: 'The leg corner is cracked, the apron joint is mortise-and-tenon (antique), or the top is splitting.',
    },
    {
      id: 'drawer-slide',
      title: 'Replace a broken drawer slide',
      model: 'drawerSlide',
      level: 2,
      time: '30–60 min',
      cost: '$15–40',
      summary: 'A drawer that sags, grinds or drops off its track usually has a bent or broken ball-bearing slide. Replace the pair with the same type and length and it’ll glide like new.',
      intro: { hi: ['oldSlides', 'drawer'] },
      safety: ['Empty the drawer first; full drawers are heavy and can drop when released.', 'Watch your fingers in the slide mechanism.'],
      causes: [['Bent member', 'Someone stood or leaned on an open drawer.'], ['Lost ball bearings', 'The retainer cracked and balls fell out.'], ['Loose screws', 'Screws pulled out of particleboard.'], ['Overloaded', 'Standard slides are rated about 75–100 lb.']],
      tools: ['Replacement slides (same length and type)', 'Screwdriver/drill', 'Tape measure', 'Pencil', '#6 × ⅝″ screws', 'Torpedo level'],
      steps: [
        { t: 'Pull it out and look', d: 'Empty the drawer, pull it fully open and look at both slides for bends, missing balls or loose screws.', why: 'Loose screws are a 2-minute fix. Bent or broken slides need replacing, always as a pair.', v: { cam: [1.1, 1.2, 1.4], at: [0.1, 0.7, 0.2], hi: ['oldSlides', 'balls'], show: ['balls'], mv: { drawer: [0, 0, 0.3] } } },
        { t: 'Release and remove the drawer', d: 'Pull the drawer to its stop, then press the black release levers on both sides (one up, one down) and pull it free.', why: 'Full-extension slides lock at the end of travel; the levers unlock the drawer member from the cabinet member.', v: { cam: [1.3, 1.1, 1.8], at: [0, 0.5, 0.5], hi: ['drawer', 'oldInner'], mv: { drawer: [0, -0.67, 0.75] } } },
        { t: 'Unscrew the cabinet members', d: 'Remove the screws holding each slide to the cabinet side. Note which holes were used.', why: 'Reusing the same holes keeps the new slide at exactly the same height and depth.', v: { cam: [0.6, 0.95, 0.8], at: [0.25, 0.73, 0.1], hi: ['oldSlides'], hide: ['balls'], tool: { id: 'screwdriver', at: [0.272, 0.735, 0.206], rot: [0, 0, 90], anim: 'turn' } } },
        { t: 'Match the replacement', d: 'Measure the old slide’s closed length and check the gap: side-mount ball-bearing slides need ½″ on each side of the drawer box.', why: 'The same length and side clearance lets you drop the new slide into the existing holes.', v: { cam: [0.6, 0.95, 0.8], at: [0.25, 0.73, 0.1], hi: ['oldSlides', 'cabinet'], tool: { id: 'tape', at: [0.278, 0.76, 0.26], rot: [90, 0, 0] } } },
        { t: 'Install the cabinet members', d: 'Screw the new cabinet members in the same holes, set back the same distance from the front. Check that both are level and parallel.', why: 'If the two sides aren’t at the same height the drawer binds or won’t close all the way.', v: { cam: [0.6, 0.95, 0.8], at: [0.25, 0.73, 0.1], hi: ['newSlides'], show: ['newSlides'], hide: ['oldSlides'], tool: { id: 'screwdriver', at: [0.272, 0.735, 0.206], rot: [0, 0, 90], anim: 'turn' } } },
        { t: 'Swap the drawer members', d: 'Unscrew the old drawer members and screw on the new ones, flush with the drawer front’s back face.', why: 'The drawer and cabinet halves are matched; mixing old and new parts makes them grind.', v: { cam: [1.0, 0.6, 1.4], at: [0.15, 0.1, 0.75], hi: ['newInner'], show: ['newInner'], hide: ['oldInner'], tool: { id: 'screwdriver', at: [0.276, 0.065, 0.76], rot: [0, 0, -90], anim: 'turn' } } },
        { t: 'Slide it back in', d: 'Extend the cabinet members, line up the drawer members and push the drawer in until it clicks. Open and close it fully a few times.', why: 'The first full stroke seats the ball retainers. If it rubs, adjust using the slotted holes.', v: { cam: [1.2, 1.3, 1.5], at: [0, 0.65, 0.1], hi: ['drawer', 'newSlides'], mv: { drawer: [0, 0, 0] } } },
      ],
      learn: {
        how: 'A ball-bearing slide has two or three telescoping steel channels with a cage of ball bearings between them. One member screws to the cabinet, one to the drawer. Because the balls roll instead of sliding, the drawer moves smoothly even when loaded, but a bent channel or lost balls makes it grind and drop.',
        specs: [['Side clearance', '½″ per side'], ['Length', 'Match the drawer depth (12–28″ in 2″ steps)'], ['Load rating', '75–100 lb standard'], ['Screws', '#6 × ⅝″ pan head']],
        terms: [['Full extension', 'The drawer comes all the way out.'], ['Cabinet member', 'Half of the slide fixed to the cabinet.'], ['Drawer member', 'Half of the slide fixed to the drawer.'], ['Soft-close', 'Damper that slows the drawer at the end.']],
        mistakes: ['Replacing only one side.', 'Mixing slide brands.', 'Using screws so long they poke into the drawer.'],
        tips: ['Upgrade to soft-close slides of the same length; they usually fit the same holes.', 'Take the old slide to the store to match it.'],
      },
      pro: 'The cabinet side is crumbling particleboard, or it’s a specialty undermount or custom slide.',
    },
    {
      id: 'reupholster-seat',
      title: 'Reupholster a dining chair seat',
      kind: 'build',
      model: 'chairSeat',
      level: 2,
      time: '1–2 hrs per chair',
      cost: '$15–40 per chair',
      summary: 'Drop-in dining seats are the easiest upholstery job: four screws, new foam, batting and fabric stapled to a plywood base. One yard of fabric covers about two seats.',
      intro: { show: ['foam', 'batting', 'fabric', 'staples', 'dustCover'], preview: true, hi: ['fabric'] },
      safety: ['Wear safety glasses when pulling staples; they fly.', 'Keep fingers clear of the staple gun’s nose.'],
      causes: [['Pick the fabric', 'Upholstery-weight fabric rated 15,000+ double rubs. Add stain protection for dining chairs.'], ['How much', 'Seat size plus 4″ on every side; about ½ yard per seat.'], ['Foam', '2″ high-density foam is the dining-chair standard.']],
      tools: ['Screwdriver', 'Staple puller or flat screwdriver + pliers', 'Staple gun + ⅜″ staples', 'Upholstery fabric', '2″ high-density foam', 'Dacron batting', 'Spray adhesive', 'Electric or serrated knife', 'Scissors', 'Black dust cover'],
      steps: [
        { t: 'Unscrew the seat', d: 'Turn the chair over or reach underneath and remove the screws through the corner blocks. Push the seat up and out.', why: 'Drop-in seats are held by just these screws, usually four.', v: { cam: [0.75, 0.2, 0.75], at: [0, 0.4, 0], hi: ['seatScrews'], tool: { id: 'screwdriver', at: [0.155, 0.383, 0.145], rot: [180, 0, 0], anim: 'turn' } } },
        { t: 'Strip the old cover', d: 'Flip the seat and pull every staple, then remove the old fabric and foam. Keep the old fabric as a pattern.', why: 'Leftover staples snag new fabric and keep it from lying flat.', v: { cam: [0.9, 1.2, 1.2], at: [0, 0.8, 0.5], hi: ['oldFabric', 'base'], mv: SEAT_UP, rt: { seat: [180, 0, 0] }, tool: { id: 'flatScrewdriver', at: [0.1, 0.785, 0.675], rot: [0, 0, 60] } } },
        { t: 'Cut and glue the foam', d: 'Trace the base on the foam, cut it ¼″ oversize with an electric or serrated knife and spray-glue it to the base.', why: 'Slightly oversize foam rolls over the edge, giving a soft, rounded front.', v: { cam: [0.9, 1.2, 1.2], at: [0, 0.8, 0.5], hi: ['foam'], show: ['foam'], hide: ['oldFabric'], rt: { seat: [0, 0, 0] }, tool: { id: 'utilityKnife', at: [0.2, 0.84, 0.5], rot: [0, 0, 20] } } },
        { t: 'Wrap the batting', d: 'Lay batting over the foam, flip the seat onto it and staple it under the base, pulling lightly.', why: 'Batting smooths the foam edges and lets the fabric slide instead of grabbing.', v: { cam: [0.9, 1.2, 1.2], at: [0, 0.8, 0.5], hi: ['batting'], show: ['batting'] } },
        { t: 'Staple the fabric', d: 'Center the fabric face-down, set the seat on it and staple once in the middle of each side, pulling taut. Then work out toward the corners, alternating sides, a staple every 1–1½″.', why: 'Opposite sides, center out, keeps the pattern straight and the tension even.', v: { cam: [0.9, 1.25, 1.2], at: [0, 0.8, 0.5], hi: ['fabric', 'staples', 'stapleGun'], show: ['fabric', 'staples', 'stapleGun'], rt: { seat: [180, 0, 0] } } },
        { t: 'Fold the corners and cover', d: 'Pull each corner diagonally, staple it, then fold the sides in neat pleats and trim the excess. Staple the dust cover over the bottom.', why: 'Tidy corners make it look factory-made; the dust cover hides the staples and fabric edges.', v: { cam: [0.9, 1.25, 1.2], at: [0, 0.8, 0.5], hi: ['dustCover'], show: ['dustCover'], hide: ['stapleGun'] } },
        { t: 'Reinstall the seat', d: 'Drop the seat into the frame and drive the screws back in through the corner blocks. Don’t over-tighten.', why: 'Use the original screws; longer ones can poke through the new seat.', v: { cam: [1.1, 1.0, 1.3], at: [0, 0.5, 0], hi: ['fabric'], mv: { seat: [0, 0, 0] }, rt: { seat: [0, 0, 0] } } },
      ],
      learn: {
        how: 'A drop-in seat is a sandwich: a plywood base for structure, foam for cushion, batting to smooth the foam, and fabric stretched over everything and stapled underneath. Even tension, pulled from the center outward, is what gives a tight, wrinkle-free top.',
        specs: [['Foam', '2″ high-density (1.8 lb+)'], ['Batting', '½″ Dacron'], ['Fabric allowance', '4″ past the edge on all sides'], ['Staples', '⅜″, every 1–1½″'], ['Fabric durability', '15,000+ double rubs']],
        terms: [['Drop-in seat', 'A removable seat that sits inside the chair frame.'], ['Dust cover', 'Black fabric (cambric) under a seat.'], ['Double rubs', 'Abrasion test rating for fabric.']],
        mistakes: ['Stapling one whole side first.', 'Pattern not centered or crooked.', 'Too-thick foam so the seat won’t fit back in.'],
        tips: ['Line up the fabric pattern on all chairs before stapling.', 'A clear vinyl cover over fabric is a practical option with young kids.'],
      },
      pro: 'The seat has springs or webbing, or the chair is a valuable antique with tacked upholstery.',
    },
  ]);
})();
