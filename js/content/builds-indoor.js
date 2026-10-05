/* INB · Indoor builds: floating shelves, board-and-batten accent wall, TV mount with hidden cables.
   Real meters (unit: 1). Each build has add-ons. */
(function () {
  const ROOM = (o) => Object.assign({ env: 'studio', unit: 1, tex: ['plank_flooring', 'oak_wood_planks'], ground: { tex: 'plank_flooring', repeat: 5, radius: 5 } }, o);
  const paintMat = (K, c) => K.std(c || 0xeeebe5, { roughness: 0.92 });
  const glow = (K, c, i) => K.std(c || 0xfff1cc, { emissive: c || 0xffc870, emissiveIntensity: i == null ? 1 : i });
  const oak = (K) => K.pbr('oak_wood_planks', [0.5, 0.3], { color: 0xe2c8a4 }, 'woodLight');
  const STUDS = [-1.22, -0.81, -0.41, 0, 0.41, 0.81, 1.22];
  // Back wall (face at z = 0) with studs behind it and a baseboard.
  function wall(K, w, opts) {
    opts = opts || {};
    const g = K.part('wall', [0, 0, 0], null, 'Wall');
    K.box(g, [w, 2.44, 0.0127], paintMat(K), [0, 1.22, -0.0064], null, 0);
    const studs = K.part('studs', [0, 0, 0], null, 'Studs (16″ on center)');
    STUDS.filter((x) => Math.abs(x) < w / 2).forEach((x) => K.box(studs, [0.038, 2.44, 0.089], 'woodLight', [x, 1.22, -0.0127 - 0.0445], null, 0.002));
    if (!opts.noBase) {
      const b = K.part(opts.baseName || 'baseboard', [0, 0, 0], null, 'Baseboard');
      K.box(b, [w, 0.09, 0.012], paintMat(K, 0xf7f6f2), [0, 0.045, 0.006], null, 0.003);
    }
    return g;
  }
  const finder = (K) => {
    const f = K.part('finder', [0.41, 1.3, 0.03], null, 'Stud finder');
    K.box(f, [0.07, 0.14, 0.03], K.std(0xffcc33, { roughness: 0.5 }), [0, 0, 0], null, 0.012);
    K.box(f, [0.04, 0.02, 0.004], 'screen', [0, 0.03, 0.016], null, 0);
    K.sph(f, 0.005, 'ledG', [0, 0.055, 0.016]);
    return f;
  };

  /* ===================== 8 · Floating shelves ===================== */
  const FS_AO = ['aoLED', 'aoSpeaker', 'aoPlants', 'aoSconce', 'aoFrames'];
  const SY = [1.15, 1.5, 1.85];
  TB.model(
    'floatingShelves',
    ROOM({ cam: [1.2, 1.5, 2.4], at: [0, 1.45, 0], assets: ['potted_plant_01', 'potted_plant_02'], hidden: ['finder', 'marks', 'brackets', 'shelf1', 'shelf2', 'shelf3', 'decor'].concat(FS_AO) }),
    (K) => {
      wall(K, 3.2);
      finder(K);
      const marks = K.part('marks', [0, 0, 0.001], null, 'Stud marks + level lines');
      SY.forEach((y) => {
        K.box(marks, [0.92, 0.012, 0.001], K.std(0x4aa3ff, { roughness: 0.8 }), [0, y, 0], null, 0);
        [-0.41, 0, 0.41].forEach((x) => K.box(marks, [0.004, 0.06, 0.001], 'dark', [x, y + 0.04, 0], null, 0));
      });
      const br = K.part('brackets', [0, 0, 0], null, 'Hidden steel brackets, lagged into studs');
      SY.forEach((y) => {
        K.box(br, [0.86, 0.04, 0.006], 'steel', [0, y, 0.003], null, 0.002);
        [-0.41, 0, 0.41].forEach((x) => K.screw(br, 0.006, 0.08, 'steel', [x, y, 0.008], [90, 0, 0], 'hex'));
        [-0.32, 0, 0.32].forEach((x) => K.cyl(br, [0.006, 0.006, 0.2, 10], 'steel', [x + 0.08, y, 0.1], [90, 0, 0]));
      });
      const shelfMat = oak(K);
      SY.forEach((y, i) => {
        const s = K.part('shelf' + (i + 1), [0, y, 0.125], null, ['Bottom shelf', 'Middle shelf', 'Top shelf'][i] + ' (36″ × 10″)');
        K.box(s, [0.91, 0.05, 0.25], shelfMat, [0, 0, 0], null, 0.004);
      });
      const decor = K.part('decor', [0, 0, 0], null, 'Styled: books, ceramics, a plant');
      const bookCols = [0x2f4f6f, 0xc96b3b, 0xe8dcc6, 0x3d6b4f, 0x9a3b3b, 0xd8b25a];
      K.rep(6, (i) => K.box(decor, [0.035, 0.2 + (i % 3) * 0.02, 0.16], K.std(bookCols[i], { roughness: 0.8 }), [-0.36 + i * 0.037, SY[0] + 0.125 + (i % 3) * 0.01, 0.12], null, 0.003));
      K.rep(4, (i) => K.box(decor, [0.2, 0.03, 0.15], K.std(bookCols[(i + 2) % 6], { roughness: 0.8 }), [0.25, SY[1] + 0.04 + i * 0.03, 0.12], null, 0.003));
      K.lathe(decor, [[0, 0], [0.05, 0], [0.06, 0.05], [0.04, 0.14], [0.025, 0.16], [0, 0.16]], K.std(0xe9e4da, { roughness: 0.4 }), [-0.2, SY[1] + 0.025, 0.12]);
      K.lathe(decor, [[0, 0], [0.07, 0], [0.075, 0.08], [0, 0.08]], K.std(0x2f3b45, { roughness: 0.4 }), [0.28, SY[2] + 0.025, 0.12]);
      K.glb(decor, 'potted_plant_02', { height: 0.3 }, [-0.25, SY[2] + 0.025, 0.12]) || K.sph(decor, 0.1, 'green', [-0.25, SY[2] + 0.12, 0.12]);
      const led = K.part('aoLED', [0, 0, 0], null, 'Under-shelf LED strips');
      SY.forEach((y) => {
        K.box(led, [0.85, 0.004, 0.012], glow(K, 0xfff1d6, 1.6), [0, y - 0.027, 0.2], null, 0);
        K.box(led, [0.85, 0.3, 0.002], K.std(0xfff1cc, { transparent: true, opacity: 0.1, emissive: 0xffe2a8, emissiveIntensity: 0.5, depthWrite: false }), [0, y - 0.17, 0.003], null, 0);
      });
      const spk = K.part('aoSpeaker', [0.0, SY[0] + 0.025, 0.12], null, 'Smart speaker');
      K.cyl(spk, [0.05, 0.05, 0.16, 32], K.std(0x4a4f55, { roughness: 1 }), [0, 0.08, 0]);
      K.cyl(spk, [0.05, 0.05, 0.004, 32], K.std(0x2a2d31, { roughness: 0.3 }), [0, 0.162, 0]);
      K.tor(spk, [0.035, 0.003, 360], glow(K, 0x5fb4ff, 1.2), [0, 0.165, 0], [90, 0, 0]);
      const plants = K.part('aoPlants', [0, 0, 0], null, 'Trailing pothos');
      [[0.3, SY[2]], [-0.3, SY[0]]].forEach(([x, y]) => {
        K.glb(plants, 'potted_plant_01', { height: 0.22 }, [x, y + 0.025, 0.12]) || K.sph(plants, 0.08, 'green', [x, y + 0.1, 0.12]);
        const pts = [];
        for (let t = 0; t <= 8; t++) pts.push([x + Math.sin(t) * 0.04, y + 0.02 - t * 0.06, 0.24 + Math.cos(t * 0.7) * 0.02]);
        K.tube(plants, pts, 0.004, K.std(0x3f7a3a, { roughness: 0.9 }));
        pts.forEach((p, i) => i && K.sph(plants, 0.025, K.std(0x4f9a44, { roughness: 0.8 }), p, [1.2, 0.4, 1]));
      });
      const sc = K.part('aoSconce', [0, 0, 0], null, 'Plug-in wall sconces');
      [-0.75, 0.75].forEach((x) => {
        K.cyl(sc, [0.05, 0.05, 0.015, 24], 'brass', [x, 1.62, 0.008], [90, 0, 0]);
        K.tube(sc, [[x, 1.62, 0.01], [x, 1.66, 0.12], [x, 1.62, 0.18]], 0.006, 'brass');
        K.lathe(sc, [[0.02, 0], [0.06, -0.06], [0.07, -0.1]], K.std(0xf4efe3, { roughness: 0.6, emissive: 0xffe1a8, emissiveIntensity: 0.7 }), [x, 1.62, 0.18]);
        K.tube(sc, [[x, 1.61, 0.01], [x + 0.02, 1.0, 0.012], [x + 0.03, 0.3, 0.012]], 0.003, 'dark');
      });
      const fr = K.part('aoFrames', [0, 0, 0], null, 'Leaning art prints');
      [[0.22, SY[0], 0.2, 0.26, 0x2f4f6f], [-0.05, SY[2], 0.24, 0.3, 0xc96b3b]].forEach(([x, y, w, h, c]) => {
        const g = K.group(fr, [x, y + 0.025, 0.05], [-8, 0, 0]);
        K.box(g, [w, h, 0.015], K.std(0x1d1f22, { roughness: 0.5 }), [0, h / 2, 0], null, 0.002);
        K.box(g, [w - 0.04, h - 0.04, 0.002], K.std(c, { roughness: 0.9 }), [0, h / 2, 0.008], null, 0);
      });
    }
  );

  /* ===================== 9 · Board-and-batten accent wall ===================== */
  const BB_AO = ['aoSconce', 'aoLedge', 'aoHooks', 'aoBench'];
  const BX = [-1.6, -1.07, -0.53, 0, 0.53, 1.07, 1.6];
  TB.model(
    'accentWall',
    ROOM({ cam: [1.6, 1.4, 3.6], at: [0, 1.2, 0], assets: ['painted_wooden_bench'], hidden: ['patch', 'marks', 'baseRail', 'topRail', 'battens', 'caulk', 'paint'].concat(BB_AO) }),
    (K) => {
      wall(K, 3.6, { baseName: 'oldBase' });
      K.box(null, [0.02, 2.44, 2.5], paintMat(K), [-1.81, 1.22, 1.25], null, 0);
      K.box(null, [3.62, 0.02, 2.5], paintMat(K, 0xfafaf8), [0, 2.45, 1.25], null, 0);
      const patch = K.part('patch', [0, 0, 0.0005], null, 'Patched holes, sanded smooth');
      [[-1.2, 1.5], [0.4, 1.7], [0.9, 0.9]].forEach(([x, y]) => K.cyl(patch, [0.02, 0.02, 0.001, 16], K.std(0xffffff, { roughness: 1 }), [x, y, 0], [90, 0, 0]));
      const marks = K.part('marks', [0, 0, 0.001], null, 'Plumb lines at each batten');
      BX.forEach((x) => K.box(marks, [0.003, 2.3, 0.001], 'dark', [x, 1.2, 0], null, 0));
      const trim = paintMat(K, 0xf7f6f2);
      const base = K.part('baseRail', [0, 0, 0.0095], null, '1×6 base rail');
      K.box(base, [3.6, 0.14, 0.019], trim, [0, 0.07, 0], null, 0.003);
      const top = K.part('topRail', [0, 0, 0.0095], null, '1×4 top rail');
      K.box(top, [3.6, 0.089, 0.019], trim, [0, 2.44 - 0.045, 0], null, 0.003);
      const bat = K.part('battens', [0, 0, 0.0095], null, '1×3 battens, 21″ o.c.');
      BX.forEach((x) => K.box(bat, [0.064, 2.44 - 0.14 - 0.089, 0.019], trim, [x, 0.14 + (2.44 - 0.14 - 0.089) / 2, 0], null, 0.002));
      const ck = K.part('caulk', [0, 0, 0.0195], null, 'Caulked seams + filled nail holes');
      BX.forEach((x) => [-1, 1].forEach((s) => K.box(ck, [0.003, 2.2, 0.002], K.std(0xffffff, { roughness: 0.6 }), [x + s * 0.032, 1.25, 0], null, 0)));
      const navy = K.std(0x22344d, { roughness: 0.7 });
      const paint = K.part('paint', [0, 0, 0], null, 'Painted one color (satin)');
      K.box(paint, [3.6, 2.44, 0.001], navy, [0, 1.22, 0.0007], null, 0);
      K.box(paint, [3.604, 0.144, 0.021], navy, [0, 0.07, 0.0095], null, 0.003);
      K.box(paint, [3.604, 0.093, 0.021], navy, [0, 2.44 - 0.045, 0.0095], null, 0.003);
      BX.forEach((x) => K.box(paint, [0.068, 2.44 - 0.14 - 0.089, 0.021], navy, [x, 0.14 + (2.44 - 0.14 - 0.089) / 2, 0.0095], null, 0.002));
      const sc = K.part('aoSconce', [0, 0, 0.02], null, 'Brass wall sconces');
      [-0.8, 0.8].forEach((x) => {
        K.cyl(sc, [0.045, 0.045, 0.012, 24], 'brass', [x, 1.75, 0.006], [90, 0, 0]);
        K.tube(sc, [[x, 1.75, 0.01], [x, 1.8, 0.1]], 0.007, 'brass');
        K.lathe(sc, [[0.03, 0.0], [0.07, 0.06], [0.075, 0.13]], K.std(0xf4efe3, { roughness: 0.6, emissive: 0xffe1a8, emissiveIntensity: 0.8 }), [x, 1.8, 0.1]);
      });
      const ledge = K.part('aoLedge', [0, 1.4, 0.03], null, 'Picture ledge + frames');
      K.box(ledge, [2.4, 0.025, 0.09], trim, [0, 0, 0.03], null, 0.003);
      K.box(ledge, [2.4, 0.04, 0.012], trim, [0, 0.02, 0.07], null, 0.003);
      [[-0.8, 0.4, 0.5, 0xe5782a], [-0.2, 0.3, 0.38, 0xe8dcc6], [0.45, 0.5, 0.36, 0x2f6fde], [0.95, 0.28, 0.3, 0xffcc33]].forEach(([x, w, h, c]) => {
        const g = K.group(ledge, [x, 0.012, 0.03], [-6, 0, 0]);
        K.box(g, [w, h, 0.02], K.std(0x1d1f22, { roughness: 0.5 }), [0, h / 2, 0], null, 0.002);
        K.box(g, [w - 0.06, h - 0.06, 0.002], K.std(c, { roughness: 0.9 }), [0, h / 2, 0.011], null, 0);
      });
      const hooks = K.part('aoHooks', [0, 1.65, 0.03], null, 'Hook rail');
      K.box(hooks, [1.2, 0.09, 0.019], trim, [0, 0, 0], null, 0.003);
      K.rep(5, (i) => K.tube(hooks, [[-0.48 + i * 0.24, 0.01, 0.01], [-0.48 + i * 0.24, -0.02, 0.06], [-0.48 + i * 0.24, 0.02, 0.08]], 0.006, 'blackOxide'));
      const bench = K.part('aoBench', [0, 0, 0.35], null, 'Entry bench');
      K.glb(bench, 'painted_wooden_bench', { height: 0.85 }, [0, 0, 0], [0, 0, 0]) || K.box(bench, [1.2, 0.45, 0.4], 'wood', [0, 0.22, 0]);
    }
  );

  /* ===================== 10 · TV mount with hidden cables ===================== */
  const TV_AO = ['aoSoundbar', 'aoBias', 'aoShelf', 'aoStream'];
  TB.model(
    'tvMount',
    ROOM({ cam: [0.9, 1.2, 2.8], at: [0, 0.95, 0], hidden: ['finder', 'marks', 'plate', 'holes', 'kit', 'arms', 'tv', 'cords'].concat(TV_AO) }),
    (K) => {
      wall(K, 3.6);
      finder(K);
      const outlet = K.part('outlet', [0.55, 0.3, 0.003], null, 'Existing outlet');
      K.box(outlet, [0.07, 0.115, 0.006], K.std(0xf7f6f2, { roughness: 0.4 }), [0, 0, 0], null, 0.002);
      const con = K.part('console', [0, 0, 0.25], null, 'Media console');
      const wood = K.pbr('oak_wood_planks', [1, 0.4], { color: 0xb88a5c }, 'wood');
      K.box(con, [1.8, 0.5, 0.42], wood, [0, 0.3, 0], null, 0.01);
      [-0.8, 0.8].forEach((x) => K.box(con, [0.04, 0.06, 0.38], 'dark', [x, 0.03, 0], null, 0.004));
      [-0.45, 0.45].forEach((x) => K.box(con, [0.86, 0.44, 0.005], K.pbr('oak_wood_planks', [0.5, 0.3], { color: 0x9c6f45 }, 'wood'), [x, 0.3, 0.212], null, 0.002));
      const marks = K.part('marks', [0, 0, 0.001], null, 'Center height 42″ + stud marks');
      K.box(marks, [0.3, 0.003, 0.001], 'red', [0, 1.07, 0], null, 0);
      K.box(marks, [0.003, 0.3, 0.001], 'red', [0, 1.07, 0], null, 0);
      [-0.41, 0, 0.41].forEach((x) => K.box(marks, [0.004, 0.08, 0.001], 'dark', [x, 1.25, 0], null, 0));
      const plate = K.part('plate', [0, 1.1, 0.01], null, 'Wall plate, lagged into two studs');
      K.box(plate, [0.62, 0.36, 0.012], K.std(0x1f2124, { metalness: 0.6, roughness: 0.45 }), [0, 0, 0], null, 0.004);
      [[-0.21, 0.12], [-0.21, -0.12], [0.21, 0.12], [0.21, -0.12]].forEach(([x, y]) => K.screw(plate, 0.008, 0.08, 'steel', [x, y, 0.008], [90, 0, 0], 'hex'));
      const holes = K.part('holes', [0.2, 0, 0.001], null, 'Cutouts for the in-wall kit');
      K.box(holes, [0.075, 0.12, 0.002], 'black', [0, 0.8, 0], null, 0);
      K.box(holes, [0.075, 0.12, 0.002], 'black', [0, 0.38, 0], null, 0);
      const kit = K.part('kit', [0.2, 0, 0.004], null, 'In-wall power + cable kit');
      [0.8, 0.38].forEach((y) => {
        K.box(kit, [0.09, 0.15, 0.008], K.std(0xf7f6f2, { roughness: 0.4 }), [0, y, 0], null, 0.003);
        K.box(kit, [0.05, 0.03, 0.004], 'dark', [0, y + 0.03, 0.005], null, 0.001);
        K.box(kit, [0.03, 0.03, 0.006], K.std(0xe9e6df), [0, y - 0.035, 0.005], null, 0.002);
      });
      K.tube(kit, [[0, 0.78, -0.03], [0.01, 0.6, -0.05], [0, 0.4, -0.03]], 0.008, K.std(0xf4f4f4, { roughness: 0.8 }));
      K.tube(kit, [[0, 0.36, 0.01], [0.15, 0.32, 0.03], [0.35, 0.3, 0.01]], 0.004, 'dark');
      const tvMat = K.std(0x0b0d10, { roughness: 0.15, metalness: 0.2, emissive: 0x1f63c9, emissiveIntensity: 0 });
      const arms = K.part('arms', [0, 1.07, 0.06], null, 'Mounting arms on the TV back');
      [-0.21, 0.21].forEach((x) => K.box(arms, [0.04, 0.5, 0.012], K.std(0x1f2124, { metalness: 0.6, roughness: 0.45 }), [x, 0, 0], null, 0.003));
      const tv = K.part('tv', [0, 1.07, 0.075], null, '65″ TV');
      K.box(tv, [1.45, 0.83, 0.025], K.std(0x15171a, { roughness: 0.4 }), [0, 0, 0], null, 0.006);
      K.box(tv, [1.43, 0.81, 0.002], tvMat, [0, 0, 0.0135], null, 0);
      const cords = K.part('cords', [0, 0, 0], null, 'Power + HDMI into the upper plate');
      K.tube(cords, [[0.1, 1.0, 0.05], [0.15, 0.9, 0.03], [0.2, 0.83, 0.01]], 0.004, 'dark');
      K.tube(cords, [[0.05, 1.0, 0.05], [0.12, 0.88, 0.035], [0.19, 0.82, 0.012]], 0.003, 'dark');
      const sb = K.part('aoSoundbar', [0, 0.6, 0.06], null, 'Soundbar');
      K.box(sb, [1.1, 0.07, 0.1], K.std(0x1d1f22, { roughness: 0.7 }), [0, 0, 0], null, 0.03);
      K.box(sb, [0.04, 0.12, 0.04], K.std(0x1f2124, { metalness: 0.6 }), [-0.4, 0.06, -0.04], null, 0.004);
      K.box(sb, [0.04, 0.12, 0.04], K.std(0x1f2124, { metalness: 0.6 }), [0.4, 0.06, -0.04], null, 0.004);
      const bias = K.part('aoBias', [0, 1.07, 0.02], null, 'Bias lighting');
      K.box(bias, [1.6, 1.0, 0.002], K.std(0xaecbff, { transparent: true, opacity: 0.35, emissive: 0x7fb0ff, emissiveIntensity: 0.9, depthWrite: false }), [0, 0, 0], null, 0);
      const sh = K.part('aoShelf', [0, 0.72, 0.13], null, 'Floating glass shelf');
      K.box(sh, [0.6, 0.012, 0.26], K.std(0xdfeef5, { transparent: true, opacity: 0.4, roughness: 0.05 }), [0, 0, 0], null, 0.002);
      K.box(sh, [0.62, 0.05, 0.02], K.std(0x1f2124, { metalness: 0.6 }), [0, 0, -0.12], null, 0.003);
      const st = K.part('aoStream', [0, 0, 0], null, 'Streaming box + universal remote');
      K.box(st, [0.1, 0.03, 0.1], K.std(0x15171a, { roughness: 0.3 }), [0.1, 0.742, 0.13], null, 0.01);
      K.box(st, [0.04, 0.012, 0.16], K.std(0x2a2d31, { roughness: 0.4 }), [0.5, 0.556, 0.3], [0, 20, 0], 0.005);
      return { tick: (t, fx) => (tvMat.emissiveIntensity = fx === 'on' ? 0.55 : 0) };
    }
  );

  /* ===================== Guides ===================== */
  TB.category({
    id: 'indoor-builds',
    icon: 'furniture',
    code: 'INB',
    name: 'Indoor Builds',
    domain: 'interior',
    kind: 'project',
    blurb: 'Shelves, accent walls and media walls',
    repairs: [
      {
        id: 'floating-shelves',
        title: 'Hang floating shelves',
        model: 'floatingShelves',
        level: 2,
        time: '2–3 hrs',
        cost: '$90–250',
        summary: 'Three solid-oak shelves on hidden steel brackets lagged into studs. No visible hardware, and each shelf holds 50+ lb when it’s anchored right.',
        intro: { show: ['brackets', 'shelf1', 'shelf2', 'shelf3', 'decor'], preview: true },
        safety: ['Check for wires and pipes before drilling: avoid the area straight above and below outlets and switches.', 'Wear eye protection when drilling overhead.'],
        causes: [['Pick spacing', '12–15″ between shelves fits books and decor.'], ['Find studs', 'Hidden brackets need at least two studs.'], ['Choose wood', 'Solid hardwood or a hollow-core shelf made for the bracket.']],
        tools: ['Stud finder', '4 ft level', 'Drill/driver + ⅜″ socket', 'Hidden shelf brackets (36″) with lag screws', 'Solid shelves pre-drilled for the rods', 'Painter’s tape + pencil', 'Tape measure'],
        steps: [
          { t: 'Find and mark studs', d: 'Run the stud finder along the wall and mark each stud edge. Confirm with a small finish nail where the bracket will cover it.', why: 'Drywall anchors can’t hold the leverage of a deep shelf. Studs can.', v: { cam: [0.9, 1.4, 1.3], at: [0.2, 1.3, 0], hi: ['finder'], show: ['finder'] } },
          { t: 'Mark level lines', d: 'Snap level lines at each shelf height with painter’s tape.', why: 'Tape gives a visible line you can peel off without marking the paint.', v: { cam: [1.0, 1.5, 2.0], at: [0, 1.5, 0], hi: ['marks'], show: ['marks'], hide: ['finder'], tool: { id: 'level', at: [0, 1.16, 0.03], rot: [0, 0, 0], scale: 1.3 } } },
          { t: 'Lag the brackets', d: 'Hold each bracket to its line, drill pilot holes into the studs and drive the lag screws. Check level before the final turn.', why: 'Lag screws into studs carry the shelf’s cantilever load; small errors in level are obvious once the shelf is on.', v: { cam: [0.8, 1.4, 1.4], at: [0, 1.5, 0], hi: ['brackets'], show: ['brackets'], tool: { id: 'drill', at: [0.41, 1.5, 0.02], rot: [90, 0, 0], anim: 'spin', scale: 1.2 } } },
          { t: 'Slide on the shelves', d: 'Slide each shelf over its rods until it’s tight to the wall.', why: 'If it binds, the rod holes aren’t parallel. Enlarge them slightly rather than forcing.', v: { cam: [1.2, 1.5, 2.2], at: [0, 1.5, 0.1], hi: ['shelf1', 'shelf2', 'shelf3'], show: ['shelf1', 'shelf2', 'shelf3'], hide: ['marks'] } },
          { t: 'Lock them in', d: 'Drive a small screw up through the bottom of each shelf into a rod or the bracket.', why: 'Stops the shelf from sliding off when you pull a book.', v: { cam: [0.6, 0.9, 1.0], at: [0, 1.15, 0.15], hi: ['shelf1'], tool: { id: 'screwdriver', at: [0.32, 1.12, 0.15], rot: [180, 0, 0], anim: 'turn' } } },
          { t: 'Style', d: 'Group items in odd numbers, mix heights, and leave some empty space.', why: 'Visual weight should balance across all three shelves.', v: { cam: [1.2, 1.5, 2.4], at: [0, 1.45, 0], hi: ['decor'], show: ['decor'] } },
        ],
        learn: {
          how: 'A floating shelf is a cantilever: all the load hangs off the wall, so the top screws are pulled outward and the bottom of the bracket presses in. That’s why studs and long lag screws matter. Deeper shelves multiply the leverage.',
          specs: [['Shelf depth', '8–10″'], ['Spacing', '12–15″ apart'], ['Lag screws', '5/16 × 3″, into studs'], ['Typical capacity', '50–75 lb per shelf in studs']],
          terms: [['Cantilever', 'Load supported at one end only.'], ['Lag screw', 'Heavy hex-head wood screw.'], ['Stud', 'Vertical wood framing behind drywall, 16″ apart.']],
          mistakes: ['Using drywall anchors.', 'Skipping pilot holes (split studs).', 'Not checking for wires.'],
          tips: ['Install the bracket ⅛″ high on the rod side if the shelf will carry heavy books; it settles level.'],
        },
        pro: 'The wall is plaster, brick or tile, or you need shelves longer than the studs allow.',
        addons: [
          { id: 'led', part: 'aoLED', name: 'Under-shelf LEDs', cat: 'Lighting', blurb: 'Warm strips that wash the wall below each shelf.', cost: [40, 120], how: 'Rout a shallow groove under each shelf for an aluminum LED channel before installing, and run the wire up behind the shelf to a plug-in driver.', needs: ['LED strip + aluminum channel', 'Plug-in driver with dimmer'], shop: 'Under cabinet LED strip kit' },
          { id: 'speaker', part: 'aoSpeaker', name: 'Smart speaker', cat: 'Tech', blurb: 'Music and voice control on the bottom shelf.', cost: [50, 200], how: 'Put it on the lowest shelf near an outlet and route the cord behind the shelf.', needs: ['Smart speaker'], shop: 'Smart speaker' },
          { id: 'plants', part: 'aoPlants', name: 'Trailing plants', cat: 'Garden', blurb: 'Pothos spilling over the edges.', cost: [20, 60], how: 'Pothos and philodendron tolerate low light. Use pots with a saucer to protect the wood.', needs: ['2 trailing plants + pots'], shop: 'Pothos plant' },
          { id: 'sconce', part: 'aoSconce', name: 'Plug-in sconces', cat: 'Lighting', blurb: 'Brass sconces on each side, no electrician needed.', cost: [80, 250], how: 'Mount at about 60–66″ and run the cord down to the outlet in a paintable cord cover.', needs: ['2 plug-in sconces', 'Cord covers'], shop: 'Plug in wall sconce' },
          { id: 'frames', part: 'aoFrames', name: 'Leaning prints', cat: 'Finish', blurb: 'Framed art layered on the shelves.', cost: [30, 120], how: 'Lean the largest piece at the back and layer smaller objects in front.', needs: ['Frames + prints'], shop: 'Picture frames' },
        ],
      },
      {
        id: 'accent-wall',
        title: 'Build a board-and-batten accent wall',
        model: 'accentWall',
        level: 2,
        time: '1–2 days',
        cost: '$150–400',
        summary: 'Vertical battens over a flat wall, finished with a base and top rail and painted one bold color. It adds depth and character for the price of a few boards and a gallon of paint.',
        intro: { show: ['baseRail', 'topRail', 'battens', 'caulk', 'paint'], preview: true },
        safety: ['Wear eye protection with a nail gun or saw.', 'If the house is pre-1978, test paint for lead before sanding.'],
        causes: [['Pick spacing', '16–24″ between battens; odd numbers of panels look balanced.'], ['Choose material', 'Primed MDF is smooth and cheap; poplar for high-traffic areas.'], ['Pick the wall', 'A wall without many doors, windows or outlets is easiest.']],
        tools: ['1×6, 1×4 and 1×3 primed MDF or poplar', 'Brad nailer + 2″ nails (or hammer)', 'Construction adhesive', 'Miter saw', 'Level & laser or chalk line', 'Caulk + wood filler', 'Paint (satin or semi-gloss) + roller'],
        steps: [
          { t: 'Pull the baseboard and prep', d: 'Score the caulk and pry off the baseboard. Patch holes and sand.', why: 'The new base rail replaces it so the whole wall reads as one piece.', v: { cam: [1.4, 1.2, 3.2], at: [0, 1.2, 0], hi: ['oldBase', 'patch'], show: ['patch'], mv: { oldBase: [0.4, 0, 0.6] }, tool: { id: 'flatBar', at: [-0.6, 0.08, 0.04], rot: [0, 0, 60] } } },
          { t: 'Lay out the battens', d: 'Measure the wall, divide into equal bays, and draw plumb lines at each batten center.', why: 'Equal bays make the pattern look intentional. Adjust spacing so you don’t end with a sliver.', v: { cam: [1.4, 1.3, 3.2], at: [0, 1.2, 0], hi: ['marks'], show: ['marks'], hide: ['oldBase'], tool: { id: 'level', at: [0.53, 1.3, 0.03], rot: [0, 0, 90], scale: 1.3 } } },
          { t: 'Install the rails', d: 'Nail the 1×6 base rail along the floor and the 1×4 top rail at the ceiling, both level.', why: 'Rails frame the battens and hide uneven floor and ceiling lines.', v: { cam: [1.4, 1.2, 3.2], at: [0, 1.2, 0], hi: ['baseRail', 'topRail'], show: ['baseRail', 'topRail'], tool: { id: 'hammer', at: [0.6, 0.12, 0.08], rot: [0, -40, 0], anim: 'tap', scale: 1.2 } } },
          { t: 'Install the battens', d: 'Cut each batten to fit between the rails, add a bead of adhesive, align to the line and nail into studs or at angles.', why: 'Measuring each one individually handles walls that aren’t perfectly square.', v: { cam: [1.2, 1.3, 2.8], at: [0, 1.2, 0], hi: ['battens'], show: ['battens'], hide: ['marks'], tool: { id: 'hammer', at: [0.0, 1.0, 0.08], rot: [0, -40, 0], anim: 'tap', scale: 1.2 } } },
          { t: 'Fill and caulk', d: 'Fill nail holes, sand smooth, then caulk every seam where wood meets wall.', why: 'Caulk lines are what make it look built-in instead of stuck-on.', v: { cam: [0.6, 1.3, 1.2], at: [0.0, 1.2, 0], hi: ['caulk'], show: ['caulk'], tool: { id: 'caulkGun', at: [0.04, 1.35, 0.05], rot: [0, 0, 0] } } },
          { t: 'Paint everything one color', d: 'Cut in the edges with a brush, then roll the flat areas. Two coats of satin or semi-gloss.', why: 'One color over wall and trim is what gives the modern, monolithic look.', v: { cam: [1.6, 1.4, 3.6], at: [0, 1.2, 0], hi: ['paint'], show: ['paint'], tool: { id: 'roller', at: [-0.8, 1.2, 0.08], rot: [0, 0, 0], scale: 1.2 } } },
        ],
        learn: {
          how: 'Board and batten creates shadow lines. The thin battens stand out from the wall so light catches their edges, adding depth even when everything is one color. The rails tie the battens together so it reads as architecture, not decoration.',
          specs: [['Batten width', '2½″ (1×3)'], ['Batten spacing', '16–24″'], ['Paint sheen', 'Satin or semi-gloss'], ['Nails', '2″ brads, angled']],
          terms: [['Batten', 'Narrow vertical strip.'], ['Rail', 'Horizontal board at top or bottom.'], ['Cut in', 'Brushing the edges before rolling.']],
          mistakes: ['Uneven spacing.', 'Skipping caulk.', 'Flat paint (shows scuffs).'],
          tips: ['Use a scrap block cut to your spacing as a gauge instead of measuring every gap.'],
        },
        pro: 'You’re working around a fireplace surround or need outlets moved.',
        addons: [
          { id: 'sconce', part: 'aoSconce', name: 'Wall sconces', cat: 'Lighting', blurb: 'Two brass sconces framing the wall.', cost: [120, 400], how: 'Hardwired sconces need boxes cut in before the battens go up; plug-in sconces mount anytime.', needs: ['2 sconces', 'Old-work boxes (hardwired)'], shop: 'Brass wall sconce' },
          { id: 'ledge', part: 'aoLedge', name: 'Picture ledge', cat: 'Finish', blurb: 'A shelf to lean art and swap it anytime.', cost: [40, 150], how: 'Build a 1×4 ledge with a 1×2 lip and screw it through the battens into studs.', needs: ['1×4 + 1×2 trim', 'Frames'], shop: 'Picture ledge shelf' },
          { id: 'hooks', part: 'aoHooks', name: 'Hook rail', cat: 'Comfort', blurb: 'Coat and bag hooks for an entryway.', cost: [30, 80], how: 'Screw a 1×4 rail across three battens at 60–66″ and add hooks every 8–10″.', needs: ['1×4 rail', 'Black hooks'], shop: 'Black wall hooks' },
          { id: 'bench', part: 'aoBench', name: 'Entry bench', cat: 'Comfort', blurb: 'A spot to sit and take off shoes.', cost: [150, 450], how: 'Center it on the wall, under the hooks.', needs: ['Bench'], shop: 'Entryway bench' },
        ],
      },
      {
        id: 'tv-mount',
        title: 'Mount a TV with hidden cables',
        model: 'tvMount',
        level: 2,
        time: '2–3 hrs',
        cost: '$80–250',
        summary: 'Mount a TV on studs at eye level and hide every cable inside the wall with a code-approved in-wall power kit. No cords dangling below the screen.',
        intro: { show: ['plate', 'kit', 'arms', 'tv', 'cords'], preview: true, fx: 'on' },
        safety: ['Never run a regular power cord or extension cord inside a wall. Use a listed in-wall power kit.', 'Check for fire blocking, wires and pipes before cutting. Use a drywall saw gently.', 'TVs are fragile and heavy; lift with a helper.'],
        causes: [['Pick the height', 'Screen center about 42″ off the floor for a seated viewer.'], ['Pick the mount', 'Fixed (lowest), tilting (above eye level) or full-motion (corners).'], ['Check VESA', 'Match the mount to the TV’s VESA hole pattern and weight.']],
        tools: ['TV mount (VESA match)', 'In-wall power + cable kit', 'Stud finder', 'Level', 'Drill + bits + socket', 'Drywall saw', 'Fish tape (optional)', 'Helper'],
        steps: [
          { t: 'Pick height and find studs', d: 'Mark the screen center height, then find and mark the studs.', why: 'Mounts must hit at least two studs. That decides how far left or right the TV can sit.', v: { cam: [0.8, 1.2, 1.8], at: [0, 1.1, 0], hi: ['finder', 'marks'], show: ['finder', 'marks'] } },
          { t: 'Mount the wall plate', d: 'Level the plate on the marks, drill pilot holes into the studs and drive the lag bolts.', why: 'The lags carry the whole TV. Pilot holes keep the studs from splitting.', v: { cam: [0.9, 1.2, 1.8], at: [0, 1.1, 0], hi: ['plate'], show: ['plate'], hide: ['finder'], tool: { id: 'drill', at: [0.21, 1.22, 0.03], rot: [90, 0, 0], anim: 'spin', scale: 1.2 } } },
          { t: 'Cut the kit openings', d: 'Trace the kit’s templates behind the TV and just above the console, between studs. Cut with a drywall saw.', why: 'The upper box hides behind the screen and the lower one sits behind the console.', v: { cam: [0.9, 0.8, 1.6], at: [0.2, 0.6, 0], hi: ['holes'], show: ['holes'], hide: ['marks'], tool: { id: 'utilityKnife', at: [0.24, 0.8, 0.02], rot: [0, 0, 0] } } },
          { t: 'Install the in-wall kit', d: 'Fish the kit’s power cable and your HDMI between the openings, snap in both boxes and plug the lower inlet into the outlet.', why: 'The kit uses in-wall-rated cable and a recessed inlet, which is the code-legal way to get power behind a TV.', v: { cam: [0.9, 0.8, 1.6], at: [0.2, 0.6, 0], hi: ['kit'], show: ['kit'], hide: ['holes'], xray: true } },
          { t: 'Attach the arms to the TV', d: 'Lay the TV face-down on a blanket and bolt the arms to its VESA holes with the right-length bolts.', why: 'Bolts too long can damage the TV’s internals; too short and they strip.', v: { cam: [0.9, 1.2, 1.6], at: [0, 1.07, 0.06], hi: ['arms'], show: ['arms'], tool: { id: 'screwdriver', at: [0.21, 1.2, 0.08], rot: [90, 0, 0], anim: 'turn' } } },
          { t: 'Hang and lock', d: 'With a helper, lift the TV onto the plate, connect power and HDMI to the upper box, and engage the safety locks.', why: 'The locks keep the TV from being bumped off the plate.', v: { cam: [0.9, 1.2, 2.6], at: [0, 1.0, 0], hi: ['tv', 'cords'], show: ['tv', 'cords'] } },
          { t: 'Power on', d: 'Turn it on, check it’s level and test every input.', why: 'Most mounts allow a few degrees of post-install leveling.', v: { cam: [0.9, 1.2, 2.8], at: [0, 0.95, 0], hi: ['tv'], fx: 'on' } },
        ],
        learn: {
          how: 'A wall mount turns your TV’s weight into a pull-out force at the top lag bolts. That’s why it must go into studs and why bigger, heavier TVs need longer arms on more studs. In-wall power kits exist because electrical code doesn’t allow appliance cords inside walls; the kit uses in-wall-rated wire with a recessed outlet behind the TV.',
          specs: [['Screen center', '≈ 42″ off the floor (seated)'], ['Viewing distance', '≈ 1–1.5× diagonal for 4K'], ['Lag bolts', '5/16″ into two studs'], ['VESA', '400×400 typical for 65″']],
          terms: [['VESA', 'Standard pattern of mounting holes on the TV back.'], ['In-wall power kit', 'Listed inlet/outlet pair connected by in-wall rated cable.'], ['Fire blocking', 'Horizontal wood between studs, sometimes in the cable path.']],
          mistakes: ['Mounting too high (neck strain).', 'Hollow-wall anchors.', 'Running a power cord inside the wall.'],
          tips: ['Run an extra HDMI and a pull string while the wall is open for future upgrades.'],
        },
        pro: 'The wall is brick, metal studs or plaster, you hit fire blocking, or you want a new outlet behind the TV.',
        addons: [
          { id: 'soundbar', part: 'aoSoundbar', name: 'Soundbar', cat: 'Tech', blurb: 'Mounted right under the screen.', cost: [150, 900], how: 'Use the soundbar bracket that attaches to the TV mount arms, and run its HDMI eARC cable through the in-wall kit.', needs: ['Soundbar', 'TV-mount soundbar bracket', 'HDMI (eARC)'], shop: 'Soundbar' },
          { id: 'bias', part: 'aoBias', name: 'Bias lighting', cat: 'Lighting', blurb: 'LED glow behind the screen; easier on the eyes at night.', cost: [20, 80], how: 'Stick a USB LED strip around the back edge of the TV and power it from the TV’s USB port so it switches with the TV.', needs: ['USB LED bias light strip'], shop: 'TV bias lighting' },
          { id: 'shelf', part: 'aoShelf', name: 'Floating glass shelf', cat: 'Finish', blurb: 'Holds a streaming box or camera below the screen.', cost: [30, 90], how: 'Screw its bracket into a stud or use the kit opening area; feed the device cable through the lower box.', needs: ['Floating media shelf'], shop: 'Floating glass media shelf' },
          { id: 'stream', part: 'aoStream', name: 'Streaming box + remote', cat: 'Tech', blurb: 'One remote for everything.', cost: [50, 200], how: 'Enable HDMI-CEC on the TV so one remote controls power and volume for everything.', needs: ['Streaming device', 'Universal remote (optional)'], shop: 'Streaming media player' },
        ],
      },
    ],
  });
})();
