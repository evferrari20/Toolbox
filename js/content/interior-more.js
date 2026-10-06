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
      summary: 'Crisp lines and an even finish come from prep and order: patch, tape, cut in the edges with a brush, then roll each wall wet-edge to wet-edge. Two coats, always.',
      intro: { show: ['coat2'], preview: true, hi: ['coat2'] },
      safety: ['Ventilate: open windows and run a fan pointing out. Use low-VOC paint in bedrooms.', 'Use a step ladder rated for your weight, not a chair. Never stand on the top step.', 'Turn off the breaker before working around outlets with the cover removed.', 'Homes built before 1978 may have lead paint. Test before sanding old trim and never dry-scrape it.'],
      causes: [['How much paint', 'One gallon covers about 350–400 sq ft per coat. A 12×12 ft room with 8 ft ceilings is about 2 gallons for two coats.'], ['Pick the sheen', 'Matte or eggshell for living rooms and bedrooms, satin for halls and kids’ rooms, semi-gloss for trim and baths.'], ['Primer or not', 'Spot-prime patches. Prime the whole wall only for big color changes, glossy old paint or new drywall.'], ['Order of work', 'Ceiling first, then walls, then trim last.']],
      tools: ['2½″ angled sash brush', '9″ roller frame + ⅜″ nap covers', 'Roller tray + liners', 'Extension pole', 'Painter’s tape', 'Drop cloths', 'Spackle + putty knife', 'Sanding sponge', 'Step ladder', 'Screwdriver'],
      steps: [
        { t: 'Clear, cover and remove plates', d: 'Move furniture to the middle and cover it. Lay canvas drop cloths along the walls. Unscrew outlet and switch plates and bag the screws.', why: 'Canvas soaks up drips instead of letting you track them like plastic does. Painting around plates always shows.', v: { cam: [1.4, 1.3, 3.6], at: [-0.6, 0.5, 0.4], hi: ['dropCloth', 'plate'], show: ['dropCloth'], mv: { plate: [0, 0, 0.08] }, tool: { id: 'screwdriver', at: [-0.8, 0.32, 0.088], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Patch, sand and spot-prime', d: 'Fill nail holes and dings with spackle, let it dry, sand it flush and dab primer on each patch. Wipe the walls with a damp sponge.', why: 'Bare spackle soaks up paint and shows as dull spots (flashing). Dust and grease keep paint from bonding.', v: { cam: [0.4, 1.5, 2.0], at: [-0.6, 1.45, 0], hi: ['patches'], show: ['patches'], mv: { plate: [0.35, -0.31, 0.5] }, rt: { plate: [-90, 0, 0] }, tool: { id: 'puttyKnife', at: [-0.4, 1.7, 0.003], rot: [60, 0, 0] } } },
        { t: 'Tape the trim', d: 'Run painter’s tape along the top of the baseboard and the outer edge of the window casing. Press the edge down with a putty knife.', why: 'A sealed tape edge is what stops paint from bleeding under. Pros often skip tape, but it saves beginners hours of touch-up.', v: { cam: [1.0, 0.6, 1.6], at: [0.2, 0.3, 0], hi: ['tape'], show: ['tape'], tool: { id: 'puttyKnife', at: [-0.2, 0.094, 0.018], rot: [60, 0, 0] } } },
        { t: 'Cut in the edges', d: 'Pour a little paint into a pail. Load a third of the bristles, then paint a 2–3″ band along the ceiling, corners, trim and outlets. Cut in one wall at a time.', why: 'The roller can’t reach into corners. Cutting in one wall at a time means the band is still wet when you roll, so it blends with no lap marks (“picture framing”).', v: { cam: [0.6, 1.9, 1.9], at: [-0.8, 2.1, 0], hi: ['cutIn', 'brush'], show: ['cutIn', 'brush', 'pail'], fx: 'cut', tool: { id: 'stepLadder', at: [-0.9, 0, 0.55], rot: [0, 0, 0] } } },
        { t: 'Roll the first coat', d: 'Load the roller evenly on the tray ramp. Roll a 3×3 ft “W”, then fill it in without lifting, and finish each section with light top-to-bottom strokes. Always roll back into wet paint.', why: 'The W spreads the paint evenly, and keeping a wet edge stops the stripes that appear where dry and wet paint overlap.', v: { cam: [0.9, 1.4, 2.6], at: [-0.6, 1.2, 0.2], hi: ['coat1'], show: ['coat1', 'tray'], hide: ['brush'], tool: { id: 'roller', at: [-0.7, 1.2, 0.004], rot: [90, 0, 0], anim: 'slide', scale: 1 } } },
        { t: 'Second coat', d: 'Let the first coat dry (check the can, usually 2–4 hours). Cut in again, then roll the second coat the same way.', why: 'One coat almost never gives full, even color, and the second coat evens out the sheen and covers thin spots.', v: { cam: [1.1, 1.5, 2.8], at: [-0.2, 1.3, 0.2], hi: ['coat2'], show: ['coat2'], hide: ['coat1'], tool: { id: 'roller', at: [0.0, 1.5, 0.004], rot: [90, 0, 0], anim: 'slide', scale: 1 } } },
        { t: 'Pull the tape and clean up', d: 'Pull the tape at a 45° angle while the last coat is still slightly soft. Put the plates back once the walls are dry to the touch.', why: 'Tape pulled after the paint fully cures can peel paint with it. Score the edge with a utility knife if it has already hardened.', v: { cam: [2.3, 1.6, 5.0], at: [-0.3, 1.2, 0.3], hi: ['coat2', 'plate'], hide: ['tape', 'dropCloth', 'tray', 'pail'], mv: { plate: [0, 0, 0] }, rt: { plate: [0, 0, 0] } } },
      ],
      learn: {
        how: 'Paint is pigment (color), binder (the acrylic that forms the film) and a carrier (water) that evaporates. As the water leaves, the binder particles fuse into a film. If you roll over paint that has started to set, you tear that film and leave a lap mark. That is why pros work in a fixed order and keep a wet edge.',
        specs: [['Coverage', '350–400 sq ft per gallon per coat'], ['Roller nap', '⅜″ smooth walls; ½″ light texture'], ['Recoat time', '2–4 hr (latex)'], ['Cut-in band', '2–3″'], ['Full cure', '2–4 weeks; wash gently until then']],
        terms: [['Cutting in', 'Brushing paint along edges where the roller can’t reach.'], ['Wet edge', 'Keeping the edge of painted area wet so new paint blends in.'], ['Flashing', 'Patches that look duller or shinier than the rest.'], ['Box the paint', 'Mix all gallons together so the color is identical.']],
        mistakes: ['Pressing hard on a dry roller to stretch the paint.', 'Cutting in the whole room first, then rolling hours later.', 'Painting in direct sun or below 50 °F.', 'Skipping the second coat.'],
        tips: ['Wrap brushes and rollers in plastic between coats instead of washing them.', 'Use a bright work light raking across the wall to spot thin areas.', 'Mix all your gallons in a 5-gallon bucket so the color is identical.'],
      },
      pro: 'The walls are plaster with lots of cracks, there’s peeling paint or lead paint, or you need ceilings over 10 ft.',
    },
    {
      id: 'hang-heavy',
      title: 'Hang a heavy mirror or shelf',
      model: 'heavyMirror',
      level: 2,
      time: '45–90 min',
      cost: '$15–40',
      summary: 'Anything over about 20 lb needs a real anchor. A French cleat screwed into studs holds hundreds of pounds and makes the mirror easy to level. On hollow wall, use snap toggles.',
      intro: { hi: ['wall'] },
      safety: ['Check for wires and pipes before drilling. Avoid the area straight above and below outlets and switches.', 'Large mirrors are awkward and sharp if broken. Work with a helper and wear gloves.', 'Don’t trust the hanging wire or plastic anchors that came with the mirror.'],
      causes: [['Weigh it first', 'Stand on a bathroom scale holding it, then subtract your weight. Choose hardware rated for at least twice that.'], ['Under 20 lb', 'Picture hooks or a single anchor are fine.'], ['20–100 lb', 'French cleat into studs, or snap toggles in hollow drywall.'], ['Over 100 lb', 'Cleat into at least two studs, or call a pro.']],
      tools: ['Stud finder', '4 ft level', 'Tape measure + pencil', 'Drill/driver + bits', 'French cleat (aluminum or ¾″ plywood)', '#10 × 3″ screws', 'Snap toggles (for hollow wall)', 'Helper'],
      variants: [
        { id: 'cleat', name: 'Cleat into studs', blurb: 'Strongest and easiest to level. Best when studs land within the cleat’s length.' },
        {
          id: 'toggle',
          name: 'Snap toggles (no studs)',
          blurb: 'For hollow drywall where studs aren’t where you need them. Each ¼″ snap toggle is rated about 200+ lb in ½″ drywall.',
          time: '45–75 min',
          tools: ['Stud finder', '4 ft level', 'Tape measure + pencil', 'Drill + ½″ bit', 'French cleat', 'Snap toggles, ¼-20 (2–4)', 'Screwdriver', 'Helper'],
          steps: [
            { t: 'Check for studs and plan', d: 'Scan the wall. If studs aren’t where the mirror needs to go, plan two snap toggles about 16″ apart along the cleat.', why: 'Toggles spread the load over the back of the drywall. Two or more share the weight.', v: { cam: [1.1, 1.65, 1.8], at: [-0.2, 1.7, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true } },
            { t: 'Mark a level line', d: 'Hold the cleat where it goes, level it and mark its top edge and the two toggle centers.', why: 'Measure from the mirror cleat to the mirror’s top so you know exactly where the line goes.', v: { cam: [1.0, 1.75, 1.6], at: [0, 1.82, 0], hi: ['marks'], show: ['marks'], hide: ['finder'], tool: { id: 'level', at: [0, 1.851, 0.02], rot: [0, 0, 0], scale: 1.4 } } },
            { t: 'Drill the holes', d: 'Drill a ½″ hole at each mark, straight in.', why: 'The folded metal channel has to pass through, so the hole size is set by the toggle package.', v: { cam: [0.7, 1.75, 1.0], at: [0.2, 1.8, 0], hi: ['marks'], tool: { id: 'drill', at: [0.2, 1.805, 0.0], rot: [90, 0, 0], anim: 'spin' } } },
            { t: 'Set the toggles', d: 'Slide the channel through the hole, pull it tight against the back of the drywall, slide the cap flush and snap off the plastic straps.', why: 'Once the cap is seated the channel can’t fall into the wall, so you can attach the cleat later.', v: { cam: [0.7, 1.75, 1.0], at: [0.2, 1.8, 0], hi: ['toggles'], show: ['toggles'], xray: true } },
            { t: 'Bolt the wall cleat', d: 'Drill the cleat to match, hold it on the line and drive the ¼-20 bolts into the toggles until snug.', why: 'Snug is enough. Overtightening crushes the drywall and weakens the hold.', v: { cam: [1.0, 1.7, 1.5], at: [0, 1.8, 0], hi: ['wallCleat', 'toggles'], show: ['wallCleat'], hide: ['marks'], tool: { id: 'screwdriver', at: [0.2, 1.805, 0.026], rot: [90, 0, 0], anim: 'turn' } } },
            { t: 'Hang the mirror', d: 'With a helper, lift the mirror above the cleat, set its cleat down and let it slide into the groove. Add a spacer at the bottom so it hangs flat.', why: 'The 45° bevels pull the mirror toward the wall as it settles.', v: { cam: [1.8, 1.6, 3.4], at: [0, 1.45, 0], hi: ['mirror'], show: ['mirror', 'bumpers'] } },
          ],
        },
      ],
      steps: [
        { t: 'Find the studs', d: 'Slide a stud finder across the area and mark both edges of each stud. Confirm with a small nail where the trim or mirror will cover it.', why: 'Studs are usually 16″ apart. A cleat that hits two or three studs can hold far more than any anchor.', v: { cam: [1.1, 1.65, 1.8], at: [-0.2, 1.7, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true } },
        { t: 'Mark the level line', d: 'Measure from the top of the mirror down to the top of its cleat. Mark the wall cleat line that distance below where you want the mirror’s top, and level it.', why: 'Center height for mirrors and art is usually 57–60″. The cleat itself sets level, so you only level once.', v: { cam: [1.0, 1.75, 1.6], at: [0, 1.82, 0], hi: ['marks'], show: ['marks'], hide: ['finder'], tool: { id: 'level', at: [0, 1.851, 0.02], rot: [0, 0, 0], scale: 1.4 } } },
        { t: 'Attach the mirror cleat', d: 'Lay the mirror face-down on a blanket. Screw the cleat to the frame with the bevel pointing down and toward the frame, using screws that don’t go through the front.', why: 'The bevel orientation is what lets the two halves lock together.', v: { cam: [1.6, 1.5, 3.4], at: [0, 1.45, 0.6], hi: ['mirror'], show: ['mirror'], mv: { mirror: [0, 0.05, 0.6] }, rt: { mirror: [0, 180, 0] }, tool: { id: 'drill', at: [0.3, 1.94, 0.62], rot: [-90, 0, 0], anim: 'spin' } } },
        { t: 'Screw the wall cleat to the studs', d: 'Hold the wall cleat on the line, bevel up and toward the wall. Drive a #10 × 3″ screw into every stud it crosses.', why: 'Each screw needs at least 1½″ in solid wood. The screws carry the load in shear, which is their strongest direction.', v: { cam: [0.9, 1.95, 1.3], at: [0, 1.8, 0], hi: ['wallCleat', 'studScrews'], show: ['wallCleat', 'studScrews'], hide: ['marks'], mv: { mirror: [1.6, 0.05, 0.6] }, tool: { id: 'drill', at: [S, 1.805, 0.024], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Lift and drop it on', d: 'With a helper, lift the mirror slightly above the wall cleat, press it to the wall and lower it until the cleats lock.', why: 'Gravity pulls the beveled cleats together and toward the wall. Nothing to line up but the edges.', v: { cam: [1.8, 1.6, 3.4], at: [0, 1.45, 0], hi: ['mirror', 'wallCleat'], mv: { mirror: [0, 0.06, 0] }, rt: { mirror: [0, 0, 0] } } },
        { t: 'Level and add the spacer', d: 'Check level on top of the frame. Add a strip the same thickness as the cleat at the bottom so the mirror hangs flat.', why: 'Without the spacer, the bottom tips in toward the wall and the mirror looks tilted.', v: { cam: [1.8, 1.6, 3.4], at: [0, 1.45, 0], hi: ['mirror', 'bumpers'], show: ['bumpers'], mv: { mirror: [0, 0, 0] }, tool: { id: 'level', at: [0, 1.984, 0.04], rot: [0, 0, 0], scale: 1.4 } } },
      ],
      learn: {
        how: 'A French cleat is two strips with matching 45° bevels. The wall half points up and toward the wall; the mirror half hangs on it pointing down. Weight forces the bevels together, which pulls the mirror tight to the wall and spreads the load along the whole cleat into every stud it crosses.',
        specs: [['Stud spacing', '16″ on center (sometimes 24″)'], ['Screw embedment', '≥ 1½″ into the stud'], ['Mirror center height', '57–60″ from the floor'], ['Snap toggle hole', '½″ for ¼-20 toggles'], ['Safety factor', 'Rate hardware for 2× the weight']],
        terms: [['French cleat', 'Pair of beveled strips that interlock.'], ['Snap toggle', 'Metal channel that flips behind drywall and grips its back face.'], ['Shear load', 'Weight pulling down along the wall, not out from it.']],
        mistakes: ['Relying on plastic expansion anchors for heavy items.', 'Hanging by the wire on two hooks that can slip.', 'Overtightening toggles so the drywall crushes.'],
        tips: ['Aluminum cleats (Z-clips) work well for mirrors with thin frames.', 'Hang shelves the same way: a cleat on the back of a shelf hides all the hardware.'],
      },
      pro: 'The mirror is over 100 lb, the wall is plaster or tile, or the mirror has no frame (frameless glass needs J-channel and clips).',
    },
    {
      id: 'big-drywall-patch',
      title: 'Patch a large hole in drywall',
      model: 'bigPatch',
      level: 2,
      time: '2–3 hrs over 2 days',
      cost: '$20–40',
      summary: 'Holes from 4″ up to about a foot are too big for a mesh patch. Cut the damage back to a clean square, put backer strips behind it, screw in a new piece of drywall and tape it like a seam.',
      intro: { hi: ['damage'] },
      safety: ['Look inside the hole with a flashlight before cutting. Avoid wires, pipes and ducts.', 'Wear a dust mask when sanding.', 'Turn off the circuit if there’s an outlet or cable near the hole.'],
      causes: [['Doorknob or furniture impact', 'Add a door stop afterward.'], ['Removed fixture or box', 'Old outlet or vent openings.'], ['Plumbing access', 'Holes cut to reach pipes.']],
      tools: ['Drywall scrap (same thickness, usually ½″)', 'Drywall saw', 'Utility knife', '1×3 furring strips', '1¼″ drywall screws', 'Drill/driver', 'Mesh tape', 'Setting + lightweight compound', '6″ and 10″ knives', 'Sanding sponge', 'Primer + paint'],
      variants: [
        { id: 'backer', name: 'New piece on backers', blurb: 'Strongest fix for 6″ to about 16″ holes.' },
        {
          id: 'california',
          name: 'California patch',
          blurb: 'No screws or strips: a drywall plug with paper flaps that glue in with compound. Best for 4–8″ holes.',
          time: '1½–2 hrs over 2 days',
          cost: '$10–25',
          tools: ['Drywall scrap', 'Utility knife', 'Drywall saw', 'Square or straightedge', 'Joint compound', '6″ and 10″ knives', 'Sanding sponge', 'Primer + paint'],
          steps: [
            { t: 'Square up the hole', d: 'Draw a square around the damage and cut it out with a drywall saw.', why: 'Straight edges are easy to match with a plug.', v: { cam: [0.65, 1.2, 1.25], at: [0.2, 1.0, 0], hi: ['outline', 'damage'], show: ['outline'], tool: { id: 'utilityKnife', at: [0.3, 1.04, 0.002], rot: [70, 0, 0] } } },
            { t: 'Cut out the damage', d: 'Saw along the lines and pull out the damaged piece.', why: 'You need clean, firm edges all the way around.', v: { cam: [0.6, 1.15, 0.9], at: [0.2, 1.0, 0], hi: ['studs', 'wall'], hide: ['damage', 'outline'] } },
            { t: 'Make the plug', d: 'Cut a scrap 2″ bigger than the hole on every side. On the back, score 2″ in from each edge, snap the gypsum and peel it away, leaving the face paper.', why: 'The paper flaps act like built-in tape, so you don’t need backer strips or screws.', v: { cam: [0.9, 1.2, 1.3], at: [0.45, 1.05, 0.2], hi: ['calPatch'], show: ['calPatch'], mv: { calPatch: [0.35, 0.05, 0.25] }, rt: { calPatch: [0, 160, 0] }, tool: { id: 'utilityKnife', at: [0.63, 1.1, 0.24], rot: [0, 0, 30] } } },
            { t: 'Butter and set it', d: 'Spread compound around the hole, press the plug in and smooth the paper flaps flat with a 6″ knife, squeezing out the extra.', why: 'A thin bed of compound under the paper glues it down, just like taping a seam.', v: { cam: [0.65, 1.2, 1.25], at: [0.2, 1.0, 0], hi: ['calPatch'], mv: { calPatch: [0, 0, 0] }, rt: { calPatch: [0, 0, 0] }, tool: { id: 'puttyKnife', at: [0.2, 1.1, 0.004], rot: [60, 0, 0] } } },
            { t: 'Feather two coats', d: 'Once dry, skim a wider coat with a 10″ knife, let it dry, and repeat, feathering 2–3″ past the paper.', why: 'Wide, thin coats hide the slight bump of the paper.', v: { cam: [0.7, 1.2, 1.4], at: [0.2, 1.0, 0], hi: ['mud1', 'mud2'], show: ['mud1', 'mud2'], tool: { id: 'puttyKnife', at: [0.3, 1.15, 0.006], rot: [60, 0, 0] } } },
            { t: 'Sand, prime and paint', d: 'Sand smooth, prime the patch and paint the wall.', why: 'Primer stops the compound from showing through as a dull spot.', v: { cam: [1.2, 1.4, 2.2], at: [0.2, 1.1, 0], hi: ['paint'], show: ['paint'], tool: { id: 'roller', at: [0.45, 1.1, 0.006], rot: [90, 0, 0], anim: 'slide' } } },
          ],
        },
      ],
      steps: [
        { t: 'Mark a square around the damage', d: 'Draw a square or rectangle just outside the damage. Keep it between studs if you can.', why: 'Straight sides are easy to measure and match. Ragged edges are hard to tape.', v: { cam: [0.65, 1.2, 1.25], at: [0.2, 1.0, 0], hi: ['outline', 'damage'], show: ['outline'], tool: { id: 'tape', at: [0.1, 0.9, 0.006], rot: [0, 0, -90] } } },
        { t: 'Cut it out', d: 'Score the lines with a utility knife, then cut through with a drywall saw, keeping the blade shallow.', why: 'A shallow cut won’t hit wires or pipes, and the knife score keeps the face paper from tearing.', v: { cam: [0.6, 1.15, 0.9], at: [0.2, 1.0, 0], hi: ['studs', 'wall'], hide: ['damage', 'outline'], tool: { id: 'utilityKnife', at: [0.3, 1.0, 0.002], rot: [70, 0, 0] } } },
        { t: 'Screw in backer strips', d: 'Slip 1×3 strips inside the hole along two edges, half behind the drywall. Hold them tight and drive 1¼″ screws through the wall into them.', why: 'The strips give the new piece something solid to screw into where there’s no stud.', v: { cam: [0.6, 1.2, 0.9], at: [0.2, 1.0, 0], hi: ['backers', 'backerScrews'], show: ['backers', 'backerScrews'], tool: { id: 'drill', at: [0.085, 1.13, 0.003], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Screw in the new piece', d: 'Cut drywall to fit with ⅛″ gap. Screw it to the strips, sinking the heads just below the paper without tearing it.', why: 'A dimpled screw head fills with compound and disappears. A torn face weakens the hold.', v: { cam: [0.6, 1.2, 0.9], at: [0.2, 1.0, 0], hi: ['newPiece', 'pieceScrews'], show: ['newPiece', 'pieceScrews'], tool: { id: 'drill', at: [0.285, 1.06, 0.003], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Tape the seams', d: 'Spread a thin coat of setting compound over the seams, bed mesh tape in it and smooth it flat.', why: 'Tape bridges the joints so they don’t crack. Setting compound is harder and shrinks less than premixed for the first coat.', v: { cam: [0.65, 1.2, 1.1], at: [0.2, 1.0, 0], hi: ['meshTape', 'mud1'], show: ['meshTape', 'mud1'], tool: { id: 'puttyKnife', at: [0.2, 1.1, 0.004], rot: [60, 0, 0] } } },
        { t: 'Feather the finish coats', d: 'Apply two more thin coats with a 10″ knife, each wider than the last, letting each dry.', why: 'A patch feathered 12–16″ wide is invisible even in raking light.', v: { cam: [0.7, 1.2, 1.4], at: [0.2, 1.0, 0], hi: ['mud2'], show: ['mud2'], tool: { id: 'puttyKnife', at: [0.36, 1.15, 0.006], rot: [60, 0, 0] } } },
        { t: 'Sand, prime and paint', d: 'Sand lightly, prime the patch and paint the whole wall corner to corner.', why: 'Touching up just the patch almost always shows, because fresh paint has a slightly different sheen.', v: { cam: [1.2, 1.4, 2.2], at: [0.2, 1.1, 0], hi: ['paint'], show: ['paint'], tool: { id: 'roller', at: [0.45, 1.1, 0.006], rot: [90, 0, 0], anim: 'slide' } } },
      ],
      learn: {
        how: 'Drywall is only strong when it’s fastened at its edges. A hole bigger than a few inches has no support in the middle, so the fix is to rebuild that support: backer strips or a stud behind, a new piece screwed on, and tape over the seams so the joint moves as one sheet.',
        specs: [['Wall thickness', '½″ (⅝″ in garages and some ceilings)'], ['Gap around new piece', '⅛″'], ['Screw', '1¼″ coarse-thread drywall'], ['Patch width when done', '12–16″ feathered']],
        terms: [['Backer / furring strip', 'Wood strip behind the hole that the new piece screws into.'], ['Setting compound', 'Powder you mix with water; hardens chemically in 20–90 min.'], ['Feathering', 'Tapering each coat thinner at the edges.']],
        mistakes: ['Skipping tape on the seams, so they crack.', 'Driving screws so deep they tear the paper.', 'One thick coat of compound.'],
        tips: ['Use 20-minute setting compound for the first coat to finish in one day.', 'Cut the new piece first, then trace it on the wall, for a perfect fit.'],
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
    { t: 'Check backset and bore', d: 'Open the door and measure from the edge to the center of the big hole: 2⅜″ or 2¾″. Most new locksets adjust to both. Note the door thickness.', why: 'The backset decides whether the new latch fits without drilling. Most interior doors are 1⅜″ thick.', v: Object.assign({ hi: ['oldLatch', 'door'], tool: { id: 'tape', at: [0.0, KH - 0.035, T / 2 + 0.001], rot: [0, 0, 90] } }, EDGE) },
    { t: 'Remove the inside screws', d: 'On the room side, back out the two through-bolts on the rose. On hidden-screw knobs, press the detent with a pin and pull the knob off first.', why: 'The through-bolts are what clamp the two halves together through the door.', v: Object.assign({ hi: ['screws', 'oldIn'], tool: { id: 'screwdriver', at: [-BS + 0.022, KH, T / 2 + 0.013], rot: [90, 0, 0], anim: 'turn' } }, EDGE) },
    { t: 'Pull the halves apart', d: 'Pull the inside half straight off, then the outside half with its spindle.', why: 'Pull straight so the spindle doesn’t bind in the latch.', v: { cam: [0.55, 1.15, 0.45], at: [-0.06, KH, 0], hi: ['oldIn', 'oldOut'], hide: ['screws'], mv: { oldIn: [0, 0, 0.16], oldOut: [0, 0, -0.16] } } },
    { t: 'Remove the old latch', d: 'Unscrew the two faceplate screws on the door edge and slide the latch out.', why: 'Replace the latch and strike with the new set so all the parts match.', v: Object.assign({ hi: ['oldLatch'], hide: ['oldIn', 'oldOut'], mv: { oldLatch: [0.1, 0, 0] }, tool: { id: 'screwdriver', at: [0.004, KH + 0.021, 0], rot: [0, 0, -90], anim: 'turn' } }, EDGE) },
    { t: 'Install the new latch', d: 'Set the latch to your backset, slide it in with the slanted side facing the way the door closes, and screw the faceplate flush.', why: 'A backward latch hits the strike instead of sliding past it, so the door won’t close.', v: Object.assign({ hi: ['newLatch'], show: ['newLatch'], hide: ['oldLatch'], tool: { id: 'screwdriver', at: [0.004, KH - 0.021, 0], rot: [0, 0, -90], anim: 'turn' } }, EDGE) },
    { t: lever ? 'Fit the outside lever' : 'Fit the outside knob', d: 'From the outside, push the spindle and the two screw posts through the latch' + (lever ? '. Make sure the lever points toward the hinges, and flip its handing if it doesn’t.' : '.'), why: lever ? 'Levers are handed. Most flip by pressing a release and rotating the lever 180°.' : 'The spindle has to engage the latch’s cam, or turning the knob won’t pull the latch.', v: Object.assign({ hi: ['newOut'], show: ['newOut'] }, OUT) },
    { t: lever ? 'Fit the inside lever and screw it up' : 'Fit the inside knob and screw it up', d: 'Slide the inside half on, line up the screw holes and drive the through-bolts until snug. Tighten them alternately.', why: 'Overtightening squeezes the mechanism and makes it stiff. Snug and even is right.', v: Object.assign({ hi: ['newIn', 'newScrews'], show: ['newIn', 'newScrews'], tool: { id: 'screwdriver', at: [-BS + 0.022, KH, T / 2 + 0.013], rot: [90, 0, 0], anim: 'turn' } }, EDGE) },
    { t: 'Swap the strike and test', d: 'Replace the strike plate on the jamb with the new one. Close the door: it should latch with a light push and not rattle.', why: 'If it doesn’t latch, the strike hole is off. File the opening or move the strike rather than forcing the door.', v: Object.assign({ hi: ['newStrike'], show: ['newStrike'], tool: { id: 'screwdriver', at: [-W, KH + 0.022, -W + 0.004], rot: [90, 0, 0], anim: 'turn' } }, JAMB) },
  ];

  TB.more('doors', [
    {
      id: 'replace-lockset',
      title: 'Replace a doorknob or lockset',
      model: 'lockset',
      level: 1,
      time: '20–40 min',
      cost: '$15–60',
      summary: 'A new knob or lever goes into the same holes as the old one: two screws, a latch and a strike. Smart locks replace the deadbolt the same way.',
      intro: { hi: ['oldIn', 'oldOut', 'oldLatch'] },
      safety: ['Prop the door open with a wedge so it can’t swing shut on you.', 'On exterior doors, keep a key or a second exit handy until the new lock works.'],
      causes: [['Worn latch', 'Door won’t stay shut or the knob is sloppy.'], ['Stuck or broken lock', 'Privacy button won’t release.'], ['Upgrade', 'Levers are easier for kids, elders and full hands.']],
      tools: ['Phillips screwdriver', 'Tape measure', 'New lockset (passage, privacy or keyed)', 'Pin or paper clip (hidden-screw knobs)'],
      variants: [
        { id: 'knob', name: 'Knob', blurb: 'Round knob passage or privacy set.' },
        {
          id: 'lever',
          name: 'Lever',
          blurb: 'Same holes, but levers are handed: they must point toward the hinges.',
          model: 'locksetLever',
          intro: { hi: ['oldIn', 'oldOut', 'oldLatch'] },
          steps: lockSteps(true),
        },
        {
          id: 'smart',
          name: 'Smart deadbolt',
          blurb: 'Swap an existing deadbolt for a keypad/app lock. Uses the same 2⅛″ hole.',
          model: 'smartLock',
          level: 2,
          time: '30–60 min',
          cost: '$120–300',
          summary: 'A smart deadbolt replaces your old deadbolt in the same holes. The keypad goes outside, the motor unit with batteries inside, and a flat tailpiece connects them through the bolt.',
          intro: { hi: ['oldBolt', 'oldTurn', 'oldOutside'] },
          safety: ['Make sure the deadbolt slides fully into the strike by hand before you mount the motor; a binding bolt drains batteries and jams.', 'Keep the physical key somewhere outside the house.'],
          tools: ['Phillips screwdriver', 'Tape measure', 'Smart deadbolt kit', '4 × AA batteries', 'Phone with the lock’s app'],
          steps: [
            { t: 'Check the door', d: 'Confirm the deadbolt hole is 2⅛″, the backset is 2⅜″ or 2¾″ and the door is 1⅜–2″ thick. Test that the bolt throws smoothly.', why: 'Smart locks need a bolt that moves freely; a motor can’t push past a sticky strike.', v: { cam: [0.42, 1.25, 0.5], at: [-0.06, DY, 0], hi: ['oldBolt', 'oldTurn'] } },
            { t: 'Remove the thumb turn', d: 'Remove the two screws on the inside and pull off the thumb turn.', why: 'These screws are also what hold the outside cylinder on.', v: { cam: [0.42, 1.25, 0.5], at: [-0.06, DY, 0], hi: ['oldTurn'], mv: { oldTurn: [0, 0, 0.15] }, tool: { id: 'screwdriver', at: [-BS, DY + 0.022, T / 2 + 0.013], rot: [90, 0, 0], anim: 'turn' } } },
            { t: 'Pull the cylinder and bolt', d: 'Pull the outside cylinder off, then unscrew the bolt’s faceplate and slide it out.', why: 'Use the new bolt that comes with the lock; it’s matched to its tailpiece.', v: { cam: [0.5, 1.25, 0.4], at: [-0.06, DY, 0], hi: ['oldOutside', 'oldBolt'], hide: ['oldTurn'], mv: { oldOutside: [0, 0, -0.15], oldBolt: [0.1, 0, 0] }, tool: { id: 'screwdriver', at: [0.004, DY + 0.025, 0], rot: [0, 0, -90], anim: 'turn' } } },
            { t: 'Install the new bolt', d: 'Set the bolt to your backset and slide it in with the side marked UP facing up. Screw the faceplate on.', why: 'Upside down, the tailpiece won’t turn the bolt the right way.', v: { cam: [0.42, 1.25, 0.5], at: [-0.06, DY, 0], hi: ['newBolt'], show: ['newBolt'], hide: ['oldOutside', 'oldBolt'], tool: { id: 'screwdriver', at: [0.004, DY - 0.025, 0], rot: [0, 0, -90], anim: 'turn' } } },
            { t: 'Mount the keypad outside', d: 'Feed the cable under the bolt and pass the flat tailpiece through the bolt’s cross slot, held horizontal or vertical as the manual shows.', why: 'The tailpiece is what turns the bolt; the cable carries power and signals to the inside unit.', v: { cam: [0.4, 1.25, -0.55], at: [-0.06, DY, 0], hi: ['keypad'], show: ['keypad'] } },
            { t: 'Screw on the mounting plate', d: 'From inside, route the cable through the plate and drive the long screws into the keypad until snug.', why: 'The plate clamps the keypad tight to the door so it can’t be pried off.', v: { cam: [0.42, 1.25, 0.5], at: [-0.06, DY, 0], hi: ['mountPlate'], show: ['mountPlate'], tool: { id: 'screwdriver', at: [-BS, DY + 0.022, T / 2 + 0.005], rot: [90, 0, 0], anim: 'turn' } } },
            { t: 'Attach the inside unit and batteries', d: 'Plug in the cable, slide the unit over the tailpiece and secure it. Insert the batteries.', why: 'Tuck the cable so it isn’t pinched; a cut cable is the most common install failure.', v: { cam: [0.42, 1.3, 0.55], at: [-0.06, DY + 0.02, 0], hi: ['insideUnit', 'batteries'], show: ['insideUnit', 'batteries'] } },
            { t: 'Calibrate and test', d: 'Follow the app to set the door handing and calibrate. Lock and unlock several times with the door closed.', why: 'Calibration teaches the motor where locked and unlocked are. Test closed, because that’s when the strike can bind.', v: { cam: [0.42, 1.25, 0.5], at: [-0.04, DY, 0], hi: ['newBolt', 'insideUnit'], fx: 'throw' } },
          ],
          learn: {
            how: 'A deadbolt is a solid bolt moved by a cam. In a smart lock, a small motor in the inside unit turns the same cam through a flat tailpiece, and a keypad or phone tells the motor when. The bolt still needs a clean, aligned strike, so mechanical fit matters as much as the electronics.',
            specs: [['Face bore', '2⅛″'], ['Edge bore', '1″'], ['Backset', '2⅜″ or 2¾″'], ['Door thickness', '1⅜–2″ (check the kit)'], ['Battery life', '6–12 months typical']],
            terms: [['Tailpiece / torque blade', 'Flat bar that links the outside cylinder to the bolt.'], ['Handing', 'Which side the hinges are on; tells the motor which way is locked.'], ['Thumb turn', 'The inside knob of a deadbolt.']],
            mistakes: ['Installing the bolt upside down.', 'Pinching the cable under the mounting plate.', 'Skipping calibration.'],
            tips: ['Replace the strike with a reinforced one with 3″ screws while you’re there.', 'Set up auto-lock only after a week of reliable operation.'],
          },
        },
      ],
      steps: lockSteps(false),
      learn: {
        how: 'Turning a knob rotates a spindle that pulls a spring-loaded latch back into the door. The latch’s slanted side lets it slide past the strike as the door closes, then snap into the strike hole. Two through-bolts clamp the inside and outside halves together through the door.',
        specs: [['Face bore', '2⅛″'], ['Edge bore', '1″'], ['Backset', '2⅜″ (most homes) or 2¾″'], ['Interior door', '1⅜″ thick'], ['Knob height', '36″ to center']],
        terms: [['Backset', 'Distance from the door edge to the center of the face hole.'], ['Passage set', 'No lock; for halls and closets.'], ['Privacy set', 'Push-button lock; for baths and bedrooms.'], ['Strike', 'Plate on the jamb the latch catches in.']],
        mistakes: ['Latch installed backwards.', 'Overtightened through-bolts (stiff knob).', 'Buying the wrong backset without checking.'],
        tips: ['Buy all your interior knobs in one finish and brand so keys and parts match.', 'If the latch won’t engage, darken the latch with a marker and close the door to see where it hits the strike.'],
      },
      pro: 'The door is damaged around the hole, the latch hole needs re-boring, or it’s a mortise lock in an older door.',
    },
    {
      id: 'install-deadbolt',
      title: 'Install a deadbolt',
      model: 'deadboltInstall',
      level: 3,
      time: '1½–2 hrs',
      cost: '$30–90 + boring kit',
      summary: 'A deadbolt on a door that never had one needs two holes and two shallow recesses: a 2⅛″ face bore, a 1″ edge bore, and mortises for the faceplate and strike. A $15 boring jig makes it foolproof.',
      intro: { hi: ['door', 'knob'] },
      safety: ['Wear safety glasses when boring and chiseling.', 'Clamp a scrap block where the hole saw exits, or bore halfway from each side, to avoid tearing the veneer.', 'Check that the door isn’t glass or has hidden metal framing where you’ll bore.'],
      causes: [['Security', 'A spring latch can be slipped with a card. A deadbolt can’t.'], ['Insurance', 'Some insurers require deadbolts on exterior doors.'], ['Spacing', 'Center 5½″ above the knob is standard.']],
      tools: ['Deadbolt (Grade 1 or 2)', 'Door boring kit (2⅛″ + 1″ hole saws)', 'Drill', '¾″ and 1″ wood chisels', 'Hammer', 'Awl', 'Tape measure + square', '3″ screws for the strike'],
      steps: [
        { t: 'Tape on the template', d: 'Fold the paper template over the door edge 5½″ above the knob center, matching your backset. Mark the face and edge centers with an awl.', why: 'Marking both centers from one template keeps the two holes lined up.', v: { cam: [0.42, 1.2, 0.55], at: [-0.06, 1.0, 0], hi: ['template'], show: ['template'] } },
        { t: 'Bore the 2⅛″ face hole', d: 'Drill with the hole saw dead level until the pilot bit pokes through, then finish from the other side.', why: 'Boring from both sides prevents splintering the outside face.', v: { cam: [0.5, 1.25, 0.6], at: [-0.06, DY, 0], hi: ['faceBore'], show: ['faceBore'], hide: ['template'], tool: { id: 'drill', at: [-BS, DY, 0.0225], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Bore the 1″ edge hole', d: 'Drill straight into the edge, centered on the door thickness, until you break into the face hole.', why: 'A crooked edge bore makes the bolt bind against the tailpiece.', v: { cam: [0.5, 1.15, 0.35], at: [0, DY, 0], hi: ['edgeBore'], show: ['edgeBore'], tool: { id: 'drill', at: [0.0, DY, 0], rot: [0, 0, -90], anim: 'spin' } } },
        { t: 'Mortise the faceplate', d: 'Hold the bolt in the hole, trace its faceplate, score the outline with a chisel and pare out ⅛″ so it sits flush.', why: 'A proud faceplate rubs the jamb and keeps the door from closing.', v: { cam: [0.4, 1.12, 0.3], at: [0, DY, 0], hi: ['mortise', 'chisel'], show: ['mortise', 'chisel'], hide: ['edgeBore'], tool: { id: 'hammer', at: [0.2, DY + 0.033, 0], rot: [0, 0, 90], anim: 'tap', scale: 0.9 } } },
        { t: 'Install the bolt', d: 'Slide the bolt in with UP on top and screw the faceplate down.', why: 'Upside down, the cylinder’s tailpiece won’t work the bolt.', v: { cam: [0.45, 1.15, 0.4], at: [0, DY, 0], hi: ['bolt'], show: ['bolt'], hide: ['mortise', 'chisel'], tool: { id: 'screwdriver', at: [0.004, DY + 0.025, 0], rot: [0, 0, -90], anim: 'turn' } } },
        { t: 'Mount cylinder and thumb turn', d: 'Pass the keyed cylinder’s tailpiece through the bolt from outside, fit the thumb turn inside and drive the screws.', why: 'The keyed side must be outside; the screws clamp both halves through the door.', v: { cam: [0.5, 1.2, 0.55], at: [-0.06, DY, 0], hi: ['cylinder', 'thumbturn'], show: ['cylinder', 'thumbturn'], tool: { id: 'screwdriver', at: [-BS, DY + 0.024, 0.0445 / 2 + 0.02], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Mark the jamb', d: 'Rub lipstick or a marker on the bolt end, close the door and turn the bolt so it marks the jamb. Bore a 1″ hole 1″ deep there and trace the strike.', why: 'Marking from the bolt itself guarantees the strike lines up.', v: { cam: [-0.55, 1.2, -0.45], at: [-0.914, DY, -0.914], hi: ['strikeMarks'], show: ['strikeMarks'] } },
        { t: 'Set the strike with 3″ screws', d: 'Mortise the strike flush, add the strike box, and drive 3″ screws through the jamb into the framing.', why: 'Short strike screws in a thin jamb are the weak point that kicks in. Long screws anchor the bolt to the house frame.', v: { cam: [-0.55, 1.2, -0.45], at: [-0.914, DY, -0.914], hi: ['strikeBox'], show: ['strikeBox'], hide: ['strikeMarks'], tool: { id: 'drill', at: [-0.914, DY + 0.022, -0.91], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Test', d: 'Close the door and throw the bolt with the key and the turn. It should slide fully in without pushing or lifting the door.', why: 'A bolt that doesn’t fully extend isn’t locked; it’s just in the way.', v: { cam: [0.6, 1.3, 0.8], at: [-0.1, 1.0, 0], hi: ['bolt', 'thumbturn'] } },
      ],
      learn: {
        how: 'A spring latch holds a door closed; a deadbolt locks it. The bolt is solid, can’t be pushed back from its end, and throws about 1″ into the frame. Its real strength depends on the strike: three-inch screws tie it to the wall framing instead of a ¾″ jamb.',
        specs: [['Face bore', '2⅛″'], ['Edge bore', '1″'], ['Backset', '2⅜″ or 2¾″'], ['Center above knob', '5½″'], ['Bolt throw', '1″ minimum'], ['Strike screws', '3″']],
        terms: [['Deadbolt', 'Lock bolt with no spring; moved only by key or turn.'], ['Mortise', 'A shallow recess cut so hardware sits flush.'], ['ANSI grade', 'Grade 1 is strongest, Grade 3 lightest duty.'], ['Strike box', 'Metal cup behind the strike that protects the hole.']],
        mistakes: ['Boring all the way through from one side and blowing out the face.', 'Edge hole off-center.', 'Leaving the short strike screws in.'],
        tips: ['A door boring jig clamps on and guides both hole saws square.', 'Keyed-alike sets let one key open the knob and the deadbolt.'],
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
      summary: 'A pre-hung door comes already hinged in its frame. The job is setting that frame plumb, level and square in the rough opening with shims, so the door swings and latches perfectly.',
      intro: { show: ['unit', 'slab', 'casing', 'knob'], preview: true, hi: ['slab'] },
      safety: ['Doors are heavy and awkward. Get a helper to lift and hold the unit.', 'Wear safety glasses when cutting shims and nailing trim.', 'Remove the shipping clips and nails before swinging the door.'],
      causes: [['Measure the opening', 'Rough opening ≈ door width + 2″ and door height + 2½″ (a 30″ door needs about 32″ × 82½″).'], ['Pick the swing', 'Stand where the door opens toward you: hinges on the left is a left-hand door.'], ['Jamb width', 'Match the wall thickness: 4–9⁄16″ for 2×4 walls with ½″ drywall.']],
      tools: ['Pre-hung door unit', '4 ft and 6 ft levels', 'Tapered wood shims', 'Drill/driver', '3″ trim-head screws', 'Finish nailer or hammer + nails', 'Utility knife', 'Casing', 'Helper'],
      variants: [
        { id: 'interior', name: 'Interior door', blurb: 'Hollow or solid-core door in a 2×4 wall.' },
        {
          id: 'exterior',
          name: 'Exterior door',
          blurb: 'Adds a flashed sill pan, sealant, a threshold and foam for an airtight, watertight fit.',
          model: 'prehungExt',
          level: 4,
          time: '1 day',
          cost: '$500–2,000',
          intro: { show: ['unit', 'slab', 'sill', 'weather', 'casing', 'knob', 'pan'], preview: true, hi: ['slab'] },
          safety: ['Plan to finish in one day so the house isn’t left open.', 'Exterior doors weigh 80–150 lb. Use two people.', 'Check whether a permit is needed in your area.'],
          tools: ['Pre-hung exterior unit', 'Flashing tape + J-roller', 'Sill pan (or tape-formed pan)', 'Exterior sealant', 'Levels (4 ft + 6 ft)', 'Shims', '3″ screws', 'Low-expansion window & door foam', 'Finish nails', 'Helper'],
          steps: [
            { t: 'Check the opening', d: 'Check the rough sill for level and the jack studs for plumb. Plane or shim the sill flat; it must not slope toward the house.', why: 'The sill carries the threshold. If it isn’t flat and level the door seal leaks.', v: { cam: [1.2, 1.2, 2.6], at: [0, 0.6, 0], hi: ['framing'], tool: { id: 'level', at: [0, 0.0, 0.05], rot: [0, 0, 0], scale: 1.6 } } },
            { t: 'Install the sill pan', d: 'Line the sill with flashing tape or a rigid pan, turned up 6″ at the sides and over the face of the sheathing.', why: 'Any water that gets past the threshold drains back out instead of into the subfloor.', v: { cam: [1.0, 0.9, 1.6], at: [0, 0.1, 0], hi: ['pan'], show: ['pan'] } },
            { t: 'Lay sealant beads', d: 'Run three continuous beads of sealant across the pan near the outside edge, and up the sides an inch or two.', why: 'Leave the back (inside) edge open so the pan can still drain out.', v: { cam: [0.9, 0.8, 1.4], at: [0, 0.05, 0.05], hi: ['sealant'], show: ['sealant'], tool: { id: 'caulkGun', at: [0.1, 0.012, 0.04], rot: [0, 0, 50] } } },
            { t: 'Set the unit', d: 'Tip the door in from outside, bottom first, pressing the sill into the sealant. Center it and tack the hinge side top.', why: 'Remove the shipping clips but leave the door closed until the hinge side is set.', v: { cam: [1.2, 1.35, 3.0], at: [0, 1.05, 0], hi: ['unit', 'slab'], show: ['unit', 'slab', 'sill', 'weather'] } },
            { t: 'Shim and screw the hinge side', d: 'Shim behind each hinge until the jamb is plumb both ways, then replace one hinge screw at each with a 3″ screw into the framing.', why: 'Long hinge screws keep a heavy door from sagging and pulling the latch out of line.', v: { cam: [0.6, 1.3, 1.8], at: [-0.45, 1.0, 0], hi: ['hingeShims'], show: ['hingeShims'], rt: { slab: [0, 75, 0] }, tool: { id: 'level', at: [-0.46, 0.4, 0.06], rot: [0, 0, 90], scale: 1.6 } } },
            { t: 'Shim the latch side', d: 'Shim at the latch and near the top and bottom until the gap around the door is even, about ⅛″. Check that the weatherstrip touches the door all around.', why: 'An even reveal means the door seals evenly; you can see light where it doesn’t.', v: { cam: [-0.4, 1.3, 1.8], at: [0.45, 1.0, 0], hi: ['latchShims', 'weather'], show: ['latchShims', 'screws'] } },
            { t: 'Foam the gap', d: 'Fill the gap between jamb and framing with low-expansion door foam. Never use regular foam.', why: 'Foam air-seals and insulates. High-expansion foam can bow the jamb so the door binds.', v: { cam: [1.0, 1.3, 2.0], at: [0.3, 1.0, 0], hi: ['foam'], show: ['foam'] } },
            { t: 'Brick mold and seal', d: 'Nail the brick mold, then caulk where it meets the siding. Flash the head with tape before installing siding trim.', why: 'The head is where water runs down the wall; flashing sends it out over the trim.', v: { cam: [1.2, 1.35, 3.0], at: [0, 1.05, 0], hi: ['casing'], show: ['casing'], rt: { slab: [0, 0, 0] }, tool: { id: 'hammer', at: [0.48, 1.4, 0.13], rot: [0, -60, 0], anim: 'tap' } } },
            { t: 'Hardware and threshold', d: 'Install the lockset and deadbolt, then adjust the threshold height until the sweep just touches.', why: 'Too low leaks air; too high drags. A dollar bill should pull out with slight resistance.', v: { cam: [1.2, 1.35, 3.0], at: [0, 1.05, 0], hi: ['knob', 'sill'], show: ['knob'] } },
          ],
          learn: {
            how: 'An exterior door has to block water, air and intruders. The sill pan catches any water that gets past the threshold and sends it outside; sealant and foam stop air; and long screws into the framing let the deadbolt and hinges resist a kick. All of that only works if the frame is set plumb and square, so the weatherstrip touches evenly all around.',
            specs: [['Rough opening', 'Unit size + ½″ in width and height'], ['Pan upturn', '6″ at the sides'], ['Reveal', '⅛″ even'], ['Hinge screws', 'One 3″ screw per hinge'], ['Foam', 'Low-expansion (window & door)']],
            terms: [['Sill pan', 'Waterproof tray under the threshold.'], ['Brick mold', 'Thick exterior casing around the door.'], ['WRB', 'Weather-resistive barrier, i.e. housewrap.'], ['Reveal', 'The gap between the door and its frame.']],
            mistakes: ['Skipping the pan.', 'Sealing the inside edge of the pan so it can’t drain.', 'Using high-expansion foam.'],
            tips: ['Dry-fit the unit before laying sealant.', 'Pre-paint or seal the bottom edge of a wood door before installing.'],
          },
        },
      ],
      steps: [
        { t: 'Check the rough opening', d: 'Measure the width at top, middle and bottom and check both jack studs for plumb.', why: 'You need ½–¾″ of shim space overall. If a stud is badly out of plumb, shim more on that side.', v: { cam: [1.1, 1.35, 2.9], at: [0, 1.05, 0], hi: ['framing'], tool: { id: 'level', at: [-0.4, 0.7, 0.05], rot: [0, 0, 90], scale: 1.6 } } },
        { t: 'Check the floor', d: 'Lay a level across the opening. If one side is low, note how much to trim from the jamb on the high side so the head ends up level.', why: 'A level head jamb is the key to an even gap at the top of the door.', v: { cam: [1.0, 0.8, 2.2], at: [0, 0.1, 0], hi: ['framing'], tool: { id: 'level', at: [0, 0.0, 0.05], rot: [0, 0, 0], scale: 1.6 } } },
        { t: 'Set the unit in the opening', d: 'Remove the packaging but leave the shipping clips. Tip the unit in, center it and keep the jamb flush with the drywall on both sides.', why: 'Flush jambs let the casing sit flat on both sides of the wall.', v: { cam: [1.1, 1.35, 2.9], at: [0, 1.05, 0], hi: ['unit', 'slab'], show: ['unit', 'slab'] } },
        { t: 'Plumb the hinge side', d: 'Shim behind each hinge in pairs (thin ends opposite) until the hinge jamb is plumb in both directions. Nail through the jamb at each shim.', why: 'Everything else is set from the hinge side. Paired shims stay flat instead of twisting the jamb.', v: { cam: [0.5, 1.3, 1.7], at: [-0.38, 1.0, 0], hi: ['hingeShims'], show: ['hingeShims'], rt: { slab: [0, -75, 0] }, tool: { id: 'level', at: [-0.383, 0.4, 0.0], rot: [0, 0, 90], scale: 1.6 } } },
        { t: 'Shim the latch side for an even gap', d: 'Close the door and shim the latch jamb at the top, latch and bottom until the gap along the door is an even ⅛″.', why: 'Set the latch side to the door, not the level; an even gap is what makes it close smoothly.', v: { cam: [-0.4, 1.3, 1.7], at: [0.38, 1.0, 0], hi: ['latchShims'], show: ['latchShims'], rt: { slab: [0, 0, 0] } } },
        { t: 'Drive the long screws', d: 'Replace one hinge screw at each hinge with a 3″ screw into the jack stud, and add a screw through the shims on the latch side behind the stop.', why: 'Long hinge screws carry the door’s weight into the framing so it can’t sag over time.', v: { cam: [0.4, 1.2, 1.4], at: [-0.38, 1.0, 0], hi: ['screws'], show: ['screws'], rt: { slab: [0, -75, 0] }, tool: { id: 'drill', at: [-0.383, 0.98, 0.029], rot: [0, 0, -90], anim: 'spin' } } },
        { t: 'Trim shims and install casing', d: 'Score the shims and snap them flush. Nail the casing ⅛–3⁄16″ back from the jamb edge on both sides.', why: 'The small setback (the reveal) hides any unevenness in the jamb edge.', v: { cam: [1.1, 1.35, 2.9], at: [0, 1.05, 0], hi: ['casing'], show: ['casing'], rt: { slab: [0, 0, 0] }, tool: { id: 'hammer', at: [0.44, 1.5, 0.08], rot: [0, -60, 0], anim: 'tap' } } },
        { t: 'Install the knob', d: 'Install the latch and knob, and adjust the strike so the door closes with a light push.', why: 'The pre-bored unit already lines up the latch with the strike when the frame is square.', v: { cam: [0.9, 1.25, 1.8], at: [0.2, 1.0, 0], hi: ['knob'], show: ['knob'] } },
      ],
      learn: {
        how: 'A pre-hung door is a door already hung on hinges in its frame (the jamb), with the hinge gaps and latch prep done at the factory. Your job is to recreate those factory conditions in the wall: plumb hinge jamb, level head and an even ⅛″ gap. Shims fill the space between the jamb and the rough framing so the jamb can be adjusted without bending.',
        specs: [['Rough opening', 'Door + 2″ wide, + 2½″ tall'], ['Gap (reveal)', '⅛″ sides and top'], ['Floor gap', '½–¾″ (more over carpet)'], ['Interior jamb', '4–9⁄16″'], ['Casing setback', '⅛–3⁄16″']],
        terms: [['Jamb', 'The frame the door hangs in.'], ['Jack stud', 'Short stud that holds up the header.'], ['Shim', 'Tapered wood wedge; used in pairs to make flat packing.'], ['Handing', 'Which side the hinges are on.']],
        mistakes: ['Shimming the latch side first.', 'Over-shimming so the jamb bows.', 'Leaving the shipping clips in and swinging the door.'],
        tips: ['A 6 ft level on the hinge jamb is easier than a 4 ft.', 'Check that the door doesn’t swing open or closed on its own; it means the hinge side isn’t plumb.'],
      },
      pro: 'The opening needs reframing, it’s a bearing wall, or you want a door where there wasn’t one.',
    },
  ]);
})();
