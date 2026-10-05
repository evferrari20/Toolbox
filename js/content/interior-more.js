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
    VIEW({ cam: [1.5, 1.45, 3.6], at: [-0.35, 1.15, 0.3], hidden: ['dropCloth', 'tape', 'patches', 'cutIn', 'coat1', 'coat2', 'tray', 'pail', 'brush'] }),
    (K) => {
      const X0 = -1.8, X1 = 1.5, H = 2.44, ZS = 2.6;
      const WIN = [0.25, 1.05, 0.95, 2.0]; // glass opening
      const CAS = 0.064; // casing width
      const WOUT = [WIN[0] - CAS, WIN[1] + CAS, WIN[2] - 0.11, WIN[3] + CAS]; // casing + apron footprint
      const oldC = K.std(0xd9cdb1, { roughness: 0.93 });
      const newC = K.std(0x7f9aae, { roughness: 0.9 });
      const coatC = K.std(0x86a0b2, { roughness: 0.95, transparent: true, opacity: 0.78 });
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
    VIEW({ cam: [1.3, 1.55, 2.4], at: [0, 1.45, 0], hidden: ['finder', 'marks', 'wallCleat', 'studScrews', 'toggles', 'mirror', 'bumpers'] }),
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
        { t: 'Clear, cover and remove plates', d: 'Move furniture to the middle and cover it. Lay canvas drop cloths along the walls. Unscrew outlet and switch plates and bag the screws.', why: 'Canvas soaks up drips instead of letting you track them like plastic does. Painting around plates always shows.', v: { cam: [1.3, 1.2, 3.4], at: [-0.5, 0.6, 0.4], hi: ['dropCloth', 'plate'], show: ['dropCloth'], mv: { plate: [0, 0, 0.08] }, tool: { id: 'screwdriver', at: [-0.8, 0.32, 0.088], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Patch, sand and spot-prime', d: 'Fill nail holes and dings with spackle, let it dry, sand it flush and dab primer on each patch. Wipe the walls with a damp sponge.', why: 'Bare spackle soaks up paint and shows as dull spots (flashing). Dust and grease keep paint from bonding.', v: { cam: [0.4, 1.5, 2.0], at: [-0.6, 1.45, 0], hi: ['patches'], show: ['patches'], mv: { plate: [0.35, -0.31, 0.5] }, rt: { plate: [-90, 0, 0] }, tool: { id: 'puttyKnife', at: [-0.4, 1.7, 0.003], rot: [60, 0, 0] } } },
        { t: 'Tape the trim', d: 'Run painter’s tape along the top of the baseboard and the outer edge of the window casing. Press the edge down with a putty knife.', why: 'A sealed tape edge is what stops paint from bleeding under. Pros often skip tape, but it saves beginners hours of touch-up.', v: { cam: [1.0, 0.6, 1.6], at: [0.2, 0.3, 0], hi: ['tape'], show: ['tape'], tool: { id: 'puttyKnife', at: [-0.2, 0.094, 0.018], rot: [60, 0, 0] } } },
        { t: 'Cut in the edges', d: 'Pour a little paint into a pail. Load a third of the bristles, then paint a 2–3″ band along the ceiling, corners, trim and outlets. Cut in one wall at a time.', why: 'The roller can’t reach into corners. Cutting in one wall at a time means the band is still wet when you roll, so it blends with no lap marks (“picture framing”).', v: { cam: [0.6, 1.9, 1.9], at: [-0.8, 2.1, 0], hi: ['cutIn', 'brush'], show: ['cutIn', 'brush', 'pail'], fx: 'cut', tool: { id: 'stepLadder', at: [-0.9, 0, 0.55], rot: [0, 0, 0] } } },
        { t: 'Roll the first coat', d: 'Load the roller evenly on the tray ramp. Roll a 3×3 ft “W”, then fill it in without lifting, and finish each section with light top-to-bottom strokes. Always roll back into wet paint.', why: 'The W spreads the paint evenly, and keeping a wet edge stops the stripes that appear where dry and wet paint overlap.', v: { cam: [1.6, 1.4, 3.6], at: [-0.3, 1.2, 0.3], hi: ['coat1'], show: ['coat1', 'tray'], hide: ['brush'], tool: { id: 'roller', at: [-0.7, 1.2, 0.004], rot: [90, 0, 0], anim: 'slide', scale: 1 } } },
        { t: 'Second coat', d: 'Let the first coat dry (check the can, usually 2–4 hours). Cut in again, then roll the second coat the same way.', why: 'One coat almost never gives full, even color, and the second coat evens out the sheen and covers thin spots.', v: { cam: [1.6, 1.4, 3.6], at: [-0.3, 1.2, 0.3], hi: ['coat2'], show: ['coat2'], hide: ['coat1'], tool: { id: 'roller', at: [0.0, 1.5, 0.004], rot: [90, 0, 0], anim: 'slide', scale: 1 } } },
        { t: 'Pull the tape and clean up', d: 'Pull the tape at a 45° angle while the last coat is still slightly soft. Put the plates back once the walls are dry to the touch.', why: 'Tape pulled after the paint fully cures can peel paint with it. Score the edge with a utility knife if it has already hardened.', v: { cam: [1.5, 1.45, 3.6], at: [-0.35, 1.15, 0.3], hi: ['coat2', 'plate'], hide: ['tape', 'dropCloth', 'tray', 'pail'], mv: { plate: [0, 0, 0] }, rt: { plate: [0, 0, 0] } } },
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
            { t: 'Mark a level line', d: 'Hold the cleat where it goes, level it and mark its top edge and the two toggle centers.', why: 'Measure from the mirror cleat to the mirror’s top so you know exactly where the line goes.', v: { cam: [1.0, 1.75, 1.6], at: [0, 1.82, 0], hi: ['marks'], show: ['marks'], hide: ['finder'], tool: { id: 'level', at: [0, 1.851, 0.02], rot: [0, 0, 90], scale: 1.4 } } },
            { t: 'Drill the holes', d: 'Drill a ½″ hole at each mark, straight in.', why: 'The folded metal channel has to pass through, so the hole size is set by the toggle package.', v: { cam: [0.7, 1.75, 1.0], at: [0.2, 1.8, 0], hi: ['marks'], tool: { id: 'drill', at: [0.2, 1.805, 0.0], rot: [90, 0, 0], anim: 'spin' } } },
            { t: 'Set the toggles', d: 'Slide the channel through the hole, pull it tight against the back of the drywall, slide the cap flush and snap off the plastic straps.', why: 'Once the cap is seated the channel can’t fall into the wall, so you can attach the cleat later.', v: { cam: [0.7, 1.75, 1.0], at: [0.2, 1.8, 0], hi: ['toggles'], show: ['toggles'], xray: true } },
            { t: 'Bolt the wall cleat', d: 'Drill the cleat to match, hold it on the line and drive the ¼-20 bolts into the toggles until snug.', why: 'Snug is enough. Overtightening crushes the drywall and weakens the hold.', v: { cam: [1.0, 1.7, 1.5], at: [0, 1.8, 0], hi: ['wallCleat', 'toggles'], show: ['wallCleat'], hide: ['marks'], tool: { id: 'screwdriver', at: [0.2, 1.805, 0.026], rot: [90, 0, 0], anim: 'turn' } } },
            { t: 'Hang the mirror', d: 'With a helper, lift the mirror above the cleat, set its cleat down and let it slide into the groove. Add a spacer at the bottom so it hangs flat.', why: 'The 45° bevels pull the mirror toward the wall as it settles.', v: { cam: [1.3, 1.55, 2.4], at: [0, 1.45, 0], hi: ['mirror'], show: ['mirror', 'bumpers'] } },
          ],
        },
      ],
      steps: [
        { t: 'Find the studs', d: 'Slide a stud finder across the area and mark both edges of each stud. Confirm with a small nail where the trim or mirror will cover it.', why: 'Studs are usually 16″ apart. A cleat that hits two or three studs can hold far more than any anchor.', v: { cam: [1.1, 1.65, 1.8], at: [-0.2, 1.7, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true } },
        { t: 'Mark the level line', d: 'Measure from the top of the mirror down to the top of its cleat. Mark the wall cleat line that distance below where you want the mirror’s top, and level it.', why: 'Center height for mirrors and art is usually 57–60″. The cleat itself sets level, so you only level once.', v: { cam: [1.0, 1.75, 1.6], at: [0, 1.82, 0], hi: ['marks'], show: ['marks'], hide: ['finder'], tool: { id: 'level', at: [0, 1.851, 0.02], rot: [0, 0, 90], scale: 1.4 } } },
        { t: 'Attach the mirror cleat', d: 'Lay the mirror face-down on a blanket. Screw the cleat to the frame with the bevel pointing down and toward the frame, using screws that don’t go through the front.', why: 'The bevel orientation is what lets the two halves lock together.', v: { cam: [1.0, 1.3, 1.8], at: [0, 1.5, 0.5], hi: ['mirror'], show: ['mirror'], mv: { mirror: [0, 0.05, 0.6] }, rt: { mirror: [0, 180, 0] }, tool: { id: 'drill', at: [0.3, 1.94, 0.62], rot: [-90, 0, 0], anim: 'spin' } } },
        { t: 'Screw the wall cleat to the studs', d: 'Hold the wall cleat on the line, bevel up and toward the wall. Drive a #10 × 3″ screw into every stud it crosses.', why: 'Each screw needs at least 1½″ in solid wood. The screws carry the load in shear, which is their strongest direction.', v: { cam: [1.0, 1.7, 1.5], at: [0, 1.8, 0], hi: ['wallCleat', 'studScrews'], show: ['wallCleat', 'studScrews'], hide: ['marks'], mv: { mirror: [1.6, 0.05, 0.6] }, tool: { id: 'drill', at: [S, 1.805, 0.024], rot: [90, 0, 0], anim: 'spin' } } },
        { t: 'Lift and drop it on', d: 'With a helper, lift the mirror slightly above the wall cleat, press it to the wall and lower it until the cleats lock.', why: 'Gravity pulls the beveled cleats together and toward the wall. Nothing to line up but the edges.', v: { cam: [1.3, 1.55, 2.4], at: [0, 1.45, 0], hi: ['mirror', 'wallCleat'], mv: { mirror: [0, 0.06, 0] }, rt: { mirror: [0, 0, 0] } } },
        { t: 'Level and add the spacer', d: 'Check level on top of the frame. Add a strip the same thickness as the cleat at the bottom so the mirror hangs flat.', why: 'Without the spacer, the bottom tips in toward the wall and the mirror looks tilted.', v: { cam: [1.3, 1.55, 2.4], at: [0, 1.45, 0], hi: ['mirror', 'bumpers'], show: ['bumpers'], mv: { mirror: [0, 0, 0] }, tool: { id: 'level', at: [0, 1.984, 0.04], rot: [0, 0, 90], scale: 1.4 } } },
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
