/* Build add-ons: optional extras for each build, shown on the finished model when picked.
   Shared add-on geometry lives here (TB.AO); builds call it from their own models or via TB.extendModel.
   Every add-on is { id, part, name, cat, blurb, cost: [lo, hi], how, needs?, shop? }.
   Categories: Lighting, Tech, Comfort, Finish, Safety, Garden. Scenes are in meters. */
(function () {
  const glowMat = (K, c, i) => K.std(c || 0xfff1cc, { emissive: c || 0xffc870, emissiveIntensity: i == null ? 0.9 : i });
  const blackMetal = (K) => K.std(0x1d1f22, { metalness: 0.6, roughness: 0.45 });
  const cedar = (K) => K.pbr('wood_planks', [0.4, 1], { color: 0xd8a27a }, 'wood');

  const AO = (TB.AO = {
    // Posts at pts [[x,z]...] with café lights strung post to post (closed loop if `loop`).
    stringLights(K, name, pts, h, loop, label) {
      const g = K.part(name, [0, 0, 0], null, label || 'Café string lights on posts');
      const wood = cedar(K);
      pts.forEach(([x, z]) => {
        K.box(g, [0.09, h, 0.09], wood, [x, h / 2, z], null, 0.006);
        K.cyl(g, [0.008, 0.008, 0.05, 8], 'steel', [x, h + 0.02, z]);
      });
      const segs = loop ? pts.length : pts.length - 1;
      const bulb = glowMat(K);
      for (let s = 0; s < segs; s++) {
        const A = pts[s];
        const B = pts[(s + 1) % pts.length];
        const n = Math.max(4, Math.round(Math.hypot(B[0] - A[0], B[1] - A[1]) / 0.4));
        let prev = null;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const p = [A[0] + (B[0] - A[0]) * t, h - 0.03 - Math.sin(Math.PI * t) * 0.32, A[1] + (B[1] - A[1]) * t];
          if (prev) K.bar(g, prev, p, 0.004, 'black');
          if (i > 0 && i < n) K.sph(g, 0.03, bulb, [p[0], p[1] - 0.05, p[2]]);
          prev = p;
        }
      }
      return g;
    },
    // Solar or low-voltage stake lights at positions [[x,z]...].
    stakeLights(K, name, pos, label) {
      const g = K.part(name, [0, 0, 0], null, label || 'Solar path lights');
      const m = blackMetal(K);
      const glow = glowMat(K, 0xfff2d6, 1.1);
      pos.forEach(([x, z]) => {
        K.cyl(g, [0.012, 0.012, 0.36, 10], m, [x, 0.18, z]);
        K.cyl(g, [0.045, 0.04, 0.07, 16], glow, [x, 0.39, z]);
        K.cyl(g, [0.07, 0.07, 0.015, 16], m, [x, 0.435, z]);
        K.box(g, [0.06, 0.004, 0.06], K.std(0x1b2a4a, { metalness: 0.3, roughness: 0.2 }), [x, 0.445, z], null, 0);
      });
      return g;
    },
    // Weatherproof Bluetooth speaker (rock style).
    speaker(K, name, p, label) {
      const g = K.part(name, p, null, label || 'Weatherproof speaker');
      K.sph(g, 0.16, K.std(0x7d776c, { roughness: 0.95 }), [0, 0.1, 0], [1.2, 0.8, 1]);
      K.cyl(g, [0.07, 0.07, 0.01, 24], 'dark', [0.12, 0.12, 0.08], [70, 30, 0]);
      return g;
    },
    // Outdoor smart plug / timer on a stake.
    smartPlug(K, name, p, label) {
      const g = K.part(name, p, null, label || 'Outdoor smart plug (Wi-Fi timer)');
      K.box(g, [0.05, 0.55, 0.05], cedar(K), [0, 0.27, 0], null, 0.004);
      K.box(g, [0.09, 0.12, 0.05], K.std(0x2b2e31, { roughness: 0.5 }), [0, 0.5, 0.05], null, 0.01);
      K.sph(g, 0.006, 'ledB', [0.025, 0.54, 0.077]);
      K.tube(g, [[0, 0.44, 0.06], [0.02, 0.1, 0.08], [0.15, 0.01, 0.2]], 0.006, 'black');
      return g;
    },
    // Hinged mesh spark screen dome over a round pit.
    sparkScreen(K, name, r, y, label) {
      const g = K.part(name, [0, y, 0], null, label || 'Spark screen');
      const mesh = K.std(0x2a2a2a, { metalness: 0.7, roughness: 0.5, wireframe: true });
      K.sph(g, r, mesh, [0, 0, 0], [1, 0.55, 1]);
      K.tor(g, [r, 0.01, 360], blackMetal(K), [0, 0.0, 0], [90, 0, 0]);
      K.tor(g, [0.06, 0.008, 360], blackMetal(K), [0, r * 0.55 + 0.04, 0], [0, 0, 0]);
      return g;
    },
    // Arched steel log rack with a stack of logs.
    logRack(K, name, p, ry, label) {
      const g = K.part(name, p, null, label || 'Log rack');
      const rot = K.group(g, [0, 0, 0], [0, ry || 0, 0]);
      const m = blackMetal(K);
      [-0.35, 0.35].forEach((z) => K.tor(rot, [0.45, 0.015, 180], m, [0, 0.0, z], [0, 0, 0]));
      [-0.45, 0.45].forEach((x) => K.bar(rot, [x, 0.01, -0.35], [x, 0.01, 0.35], 0.015, m));
      const bark = K.pbr('pine_bark', [1, 2], {}, 'bark');
      for (let r = 0; r < 4; r++)
        for (let i = 0; i < 6 - r; i++) {
          const x = (i - (5 - r) / 2) * 0.13;
          if (Math.hypot(x, 0.07 + r * 0.12) < 0.42) K.cyl(rot, [0.055, 0.055, 0.7, 10], bark, [x, 0.07 + r * 0.11, 0], [90, 0, 0]);
        }
      return g;
    },
    // Built-in storage bench (scanned bench, with fallback).
    bench(K, name, p, ry, label) {
      const g = K.part(name, p, null, label || 'Bench');
      K.glb(g, 'painted_wooden_bench', { height: 0.85 }, [0, 0, 0], [0, ry || 0, 0]) || K.box(g, [1.4, 0.45, 0.45], 'wood', [0, 0.22, 0]);
      return g;
    },
    // Offset (cantilever) umbrella, arm reaching toward -x from its base.
    umbrella(K, name, p, label, color) {
      const g = K.part(name, p, null, label || 'Offset umbrella');
      const m = blackMetal(K);
      K.box(g, [0.7, 0.08, 0.7], 'dark', [0, 0.04, 0], null, 0.01);
      K.cyl(g, [0.03, 0.03, 2.5, 12], m, [0, 1.25, 0]);
      K.tube(g, [[0, 2.45, 0], [-0.4, 2.62, 0], [-1.0, 2.55, 0], [-1.1, 2.45, 0]], 0.025, m);
      K.cyl(g, [0.008, 0.008, 0.25, 8], m, [-1.1, 2.35, 0]);
      K.cone(g, [1.45, 0.42, 8], K.std(color || 0xe7dcc8, { roughness: 0.95, side: THREE.DoubleSide }), [-1.1, 2.48, 0]);
      return g;
    },
    // Pyramid glass-tube patio heater.
    heater(K, name, p, label) {
      const g = K.part(name, p, null, label || 'Patio heater');
      const m = blackMetal(K);
      K.ext(g, [[-0.25, -0.25], [0.25, -0.25], [0.25, 0.25], [-0.25, 0.25]], 0.06, m, [0, 0.06, 0], [90, 0, 0], 0.01);
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([x, z]) => K.bar(g, [x * 0.22, 0.06, z * 0.22], [x * 0.12, 2.05, z * 0.12], 0.012, m));
      K.cyl(g, [0.06, 0.06, 1.6, 20, true], K.std(0xffd6a0, { transparent: true, opacity: 0.5, roughness: 0.1 }), [0, 1.1, 0]);
      K.cyl(g, [0.02, 0.03, 1.5, 12], K.std(0xff6a1a, { emissive: 0xff5a10, emissiveIntensity: 1.5 }), [0, 1.1, 0]);
      K.cone(g, [0.24, 0.2, 4], m, [0, 2.15, 0], [0, 45, 0]);
      return g;
    },
    // Flat rug or mat.
    rug(K, name, size, p, color, label) {
      const g = K.part(name, p, null, label || 'Outdoor rug');
      K.box(g, [size[0], 0.006, size[1]], K.std(color || 0x3f6f9a, { roughness: 1 }), [0, 0.003, 0], null, 0);
      K.box(g, [size[0] - 0.2, 0.0065, size[1] - 0.2], K.std(0xe9e0cf, { roughness: 1 }), [0, 0.004, 0], null, 0);
      K.box(g, [size[0] - 0.36, 0.007, size[1] - 0.36], K.std(color || 0x3f6f9a, { roughness: 1 }), [0, 0.005, 0], null, 0);
      return g;
    },
    // Spotlight aimed at target.
    uplights(K, name, list, label) {
      const g = K.part(name, [0, 0, 0], null, label || 'Uplights');
      const m = blackMetal(K);
      list.forEach(([x, z, ry]) => {
        const s = K.group(g, [x, 0, z], [0, ry || 0, 0]);
        K.cyl(s, [0.01, 0.01, 0.15, 8], m, [0, 0.07, 0]);
        const head = K.group(s, [0, 0.16, 0], [-35, 0, 0]);
        K.cyl(head, [0.035, 0.03, 0.11, 16], m, [0, 0, 0], [90, 0, 0]);
        K.cyl(head, [0.03, 0.03, 0.005, 16], glowMat(K, 0xfff4dc, 1.4), [0, 0, 0.056], [90, 0, 0]);
        K.cone(s, [0.25, 1.2, 20, true], K.std(0xfff1c8, { transparent: true, opacity: 0.08, emissive: 0xffe2a0, emissiveIntensity: 0.4, depthWrite: false }), [0, 0.65, 0.35], [-35, 0, 0]);
      });
      return g;
    },
    // Wall-mounted LED flood with motion sensor.
    flood(K, name, p, ry, label) {
      const g = K.part(name, p, null, label || 'Motion-sensor floodlight');
      const r = K.group(g, [0, 0, 0], [0, ry || 0, 0]);
      const m = blackMetal(K);
      K.box(r, [0.12, 0.12, 0.03], m, [0, 0, 0], null, 0.01);
      [-0.08, 0.08].forEach((x) => {
        const h = K.group(r, [x, -0.03, 0.08], [-30, 0, 0]);
        K.box(h, [0.13, 0.1, 0.04], m, [0, 0, 0], null, 0.01);
        K.box(h, [0.11, 0.08, 0.004], glowMat(K, 0xffffff, 1.2), [0, 0, 0.021], null, 0);
      });
      K.sph(r, 0.03, K.std(0xf4f4f4, { roughness: 0.3 }), [0, -0.1, 0.06]);
      return g;
    },
    // Soil-moisture sensor stake with hub.
    sensor(K, name, p, label) {
      const g = K.part(name, p, null, label || 'Soil moisture sensor');
      K.cyl(g, [0.006, 0.006, 0.18, 8], 'steel', [0, 0, 0]);
      K.box(g, [0.06, 0.08, 0.025], K.std(0xf4f4f1, { roughness: 0.4 }), [0, 0.12, 0], null, 0.01);
      K.box(g, [0.04, 0.02, 0.003], 'screen', [0, 0.13, 0.013], null, 0);
      K.box(g, [0.05, 0.002, 0.02], K.std(0x1b2a4a, { metalness: 0.3, roughness: 0.2 }), [0, 0.161, 0], null, 0);
      return g;
    },
  });

  /* ================= Fire pit (all four designs) ================= */
  const FP = { firepit: { pit: 0.66, top: 0.6, R: 2.0 }, firepitStarter: { pit: 0.5, top: 0.4, R: 2.0 }, firepitShowpiece: { pit: 0.66, top: 0.6, R: 3.4 }, firepitGas: { pit: 0, top: 0.6, R: 2.2 } };
  const FP_PARTS = ['aoString', 'aoPath', 'aoSpeaker', 'aoPlug', 'aoScreen', 'aoRack', 'aoBench', 'aoWind', 'aoCover'];
  Object.entries(FP).forEach(([model, d]) => {
    TB.extendModel(
      model,
      (K) => {
        const c = d.R + 0.6;
        AO.stringLights(K, 'aoString', [[-c, -c], [c, -c], [c, c], [-c, c]], 2.7, true);
        const pl = [];
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + 0.2;
          pl.push([Math.cos(a) * (d.R + 0.35), Math.sin(a) * (d.R + 0.35)]);
        }
        AO.stakeLights(K, 'aoPath', pl);
        AO.speaker(K, 'aoSpeaker', [d.R * 0.55, 0, d.R * 0.75]);
        AO.smartPlug(K, 'aoPlug', [c + 0.25, 0, -c + 0.3]);
        if (d.pit) AO.sparkScreen(K, 'aoScreen', d.pit, d.top, 'Spark screen');
        else K.part('aoScreen', [0, 0, 0], null, 'Spark screen');
        AO.logRack(K, 'aoRack', [-(d.R + 0.9), 0, 0.4], 90, 'Log rack with cover');
        AO.bench(K, 'aoBench', [0, 0, d.R + 1.0], 180, 'Storage bench (cushions & blankets)');
        const wind = K.part('aoWind', [0, d.top + 0.02, 0], null, 'Glass wind guard');
        if (!d.pit) K.box(wind, [1.42, 0.2, 0.5], K.std(0xdfeef5, { transparent: true, opacity: 0.25, roughness: 0.02 }), [0, 0.1, 0], null, 0.004);
        const cover = K.part('aoCover', [0, d.top, 0], null, 'Fitted cover');
        if (!d.pit) K.box(cover, [2.1, 0.06, 1.2], K.std(0x3a3f45, { roughness: 0.95 }), [0, 0.03, 0.0], null, 0.02);
      },
      { hidden: FP_PARTS, assets: ['painted_wooden_bench'], tex: ['wood_planks', 'pine_bark'] }
    );
  });
  const fpAddons = {
    string: { id: 'string', part: 'aoString', name: 'Café string lights', cat: 'Lighting', blurb: 'Four cedar posts and warm LED bulbs around the space.', cost: [150, 350], how: 'Set 4×4 posts 2 ft deep in concrete (or in weighted planters) at the corners, run a guide wire, then clip the lights to it with a gentle sag.', needs: ['4×4 cedar posts', 'Commercial-grade LED string lights', 'Guide wire + turnbuckles', 'Concrete mix'], shop: 'Outdoor LED string lights' },
    path: { id: 'path', part: 'aoPath', name: 'Solar path lights', cat: 'Lighting', blurb: 'A ring of stake lights so the edge is visible at night.', cost: [40, 140], how: 'Push the stakes in about a foot outside the patio edge, 6–8 ft apart. Put them where they get direct afternoon sun.', needs: ['8 solar stake lights'], shop: 'Solar path lights' },
    speaker: { id: 'speaker', part: 'aoSpeaker', name: 'Rock speaker', cat: 'Tech', blurb: 'Weatherproof Bluetooth speaker that looks like a stone.', cost: [80, 250], how: 'Keep it at least 6 ft from the fire. Pair it with your phone, or choose a Wi-Fi model to group with indoor speakers.', needs: ['Outdoor speaker (IPX5 or better)'], shop: 'Outdoor rock speaker' },
    plug: { id: 'plug', part: 'aoPlug', name: 'Smart plug + timer', cat: 'Tech', blurb: 'Turns the string lights on at sunset from your phone.', cost: [20, 45], how: 'Plug into a GFCI-protected outdoor outlet with an in-use (bubble) cover, then set a sunset schedule in its app.', needs: ['Outdoor-rated smart plug', 'In-use outlet cover'], shop: 'Outdoor smart plug' },
    screen: { id: 'screen', part: 'aoScreen', name: 'Spark screen', cat: 'Safety', blurb: 'Mesh dome that keeps embers in on breezy nights.', cost: [40, 100], how: 'Measure the inside diameter of the ring and buy a screen 1–2″ smaller so it sits inside the lip.', needs: ['Round spark screen', 'Poker / lift tool'], shop: 'Round fire pit spark screen' },
    rack: { id: 'rack', part: 'aoRack', name: 'Log rack', cat: 'Finish', blurb: 'Keeps firewood off the ground and dry.', cost: [60, 160], how: 'Place it upwind and at least 10 ft from the fire. Stack bark-side up and add a top cover.', needs: ['Steel log rack', 'Rack cover'], shop: 'Firewood log rack' },
    bench: { id: 'bench', part: 'aoBench', name: 'Storage bench', cat: 'Comfort', blurb: 'Seats two and hides cushions and blankets.', cost: [180, 450], how: 'Set it on pavers or level ground just outside the seating ring, opening away from the fire.', needs: ['Outdoor storage bench'], shop: 'Outdoor storage bench' },
    wind: { id: 'wind', part: 'aoWind', name: 'Glass wind guard', cat: 'Safety', blurb: 'Tempered glass fence that steadies the flame.', cost: [90, 220], how: 'Choose a guard sized to the burner pan, not the table, so the flame has 2–3″ of clearance all around.', needs: ['Tempered glass wind guard'], shop: 'Fire table wind guard' },
    cover: { id: 'cover', part: 'aoCover', name: 'Fitted cover', cat: 'Finish', blurb: 'Keeps rain and leaves out of the burner.', cost: [40, 120], how: 'Cover only once the table is completely cool. Shut the key valve first.', needs: ['Fitted weatherproof cover'], shop: 'Fire table cover' },
  };
  const fpList = (ids) => ids.map((k) => fpAddons[k]);
  const fp = TB.repair('backyard', 'fire-pit');
  fp.addons = fpList(['string', 'path', 'speaker', 'plug', 'screen', 'rack', 'bench']);
  (fp.variants || []).forEach((v) => {
    if (v.id === 'showpiece') v.addons = fpList(['path', 'speaker', 'plug', 'screen', 'rack']);
    if (v.id === 'luxury') v.addons = fpList(['string', 'path', 'speaker', 'plug', 'wind', 'cover', 'bench']);
  });

  /* ================= Paver patio ================= */
  TB.extendModel(
    'patio',
    (K) => {
      const y = 0.215;
      AO.stringLights(K, 'aoString', [[-1.7, -1.4], [1.7, -1.4], [1.7, 1.4], [-1.7, 1.4]], 2.6, true);
      AO.umbrella(K, 'aoUmbrella', [1.25, y, -0.95], 'Offset umbrella');
      AO.heater(K, 'aoHeater', [-1.2, y, -0.9]);
      AO.rug(K, 'aoRug', [2.0, 1.5], [0, y, 0.05]);
      AO.speaker(K, 'aoSpeaker', [-1.15, y, 0.9]);
      const edge = K.part('aoEdge', [0, 0, 0], null, 'Low-voltage paver edge lights');
      const glow = K.std(0xfff1cc, { emissive: 0xffd27a, emissiveIntensity: 1.2 });
      for (let i = 0; i < 6; i++) K.box(edge, [0.1, 0.012, 0.03], glow, [-1.25 + i * 0.5, y + 0.006, 1.17], null, 0.003);
    },
    { hidden: ['aoString', 'aoUmbrella', 'aoHeater', 'aoRug', 'aoSpeaker', 'aoEdge'], tex: ['wood_planks'] }
  );
  TB.repair('backyard', 'paver-patio').addons = [
    fpAddons.string,
    { id: 'edge', part: 'aoEdge', name: 'Paver edge lights', cat: 'Lighting', blurb: 'Slim LED bricks set flush in the paver border.', cost: [120, 300], how: 'Swap edge pavers for LED paver lights while laying the border, and run the cable in the bedding sand before compacting.', needs: ['Low-voltage paver lights', 'Low-voltage transformer', '12/2 landscape cable'], shop: 'LED paver lights' },
    { id: 'umbrella', part: 'aoUmbrella', name: 'Offset umbrella', cat: 'Comfort', blurb: 'Cantilever shade that keeps the table clear.', cost: [180, 600], how: 'Use the base weight the maker specifies (often 150+ lb) and close it in wind over 15 mph.', needs: ['Cantilever umbrella', 'Weighted base plates'], shop: 'Cantilever patio umbrella' },
    { id: 'heater', part: 'aoHeater', name: 'Patio heater', cat: 'Comfort', blurb: 'Pyramid propane heater for cool nights.', cost: [200, 450], how: 'Keep 3 ft clear on all sides and never under a roof or umbrella. Use the tip-over switch.', needs: ['Pyramid patio heater', '20 lb propane tank'], shop: 'Pyramid patio heater' },
    { id: 'rug', part: 'aoRug', name: 'Outdoor rug', cat: 'Finish', blurb: 'Polypropylene rug that defines the dining zone.', cost: [60, 200], how: 'Size it so chairs stay on the rug when pulled out: about 2 ft beyond the table on every side.', needs: ['Outdoor polypropylene rug'], shop: 'Outdoor rug 6x9' },
    { ...fpAddons.speaker, blurb: 'Weatherproof Bluetooth speaker for the patio.' },
  ];

  /* ================= Raised garden bed ================= */
  TB.extendModel(
    'gardenbed',
    (K) => {
      const L = 2.4, W = 1.2, top = 0.42;
      const drip = K.part('aoDrip', [0, 0, 0], null, 'Drip line + faucet timer');
      [-0.3, 0.3].forEach((z) => K.cyl(drip, [0.008, 0.008, L - 0.15, 8], 'black', [0, top - 0.035, z], [0, 0, 90]));
      K.tube(drip, [[L / 2 - 0.05, top - 0.035, 0.3], [L / 2 + 0.05, top - 0.03, 0], [L / 2 - 0.05, top - 0.035, -0.3]], 0.008, 'black');
      K.tube(drip, [[L / 2 + 0.05, top - 0.03, 0], [L / 2 + 0.3, 0.2, 0.2], [L / 2 + 0.6, 0.02, 0.5]], 0.009, 'black');
      K.box(drip, [0.1, 0.14, 0.06], K.std(0x2f6fde, { roughness: 0.4 }), [L / 2 + 0.65, 0.07, 0.5], null, 0.012);
      K.box(drip, [0.05, 0.03, 0.004], 'screen', [L / 2 + 0.65, 0.1, 0.532], null, 0);
      AO.sensor(K, 'aoSensor', [0.4, top - 0.05, 0.05]);
      const tr = K.part('aoTrellis', [0, top, -W / 2 + 0.06], null, 'Cattle-panel trellis');
      [-1, 1].forEach((s) => K.box(tr, [0.05, 1.6, 0.05], cedar(K), [s * (L / 2 - 0.1), 0.8, 0], null, 0.004));
      for (let i = 0; i <= 12; i++) K.cyl(tr, [0.003, 0.003, 1.5, 6], 'steel', [-L / 2 + 0.1 + (i * (L - 0.2)) / 12, 0.8, 0]);
      for (let j = 0; j <= 8; j++) K.cyl(tr, [0.003, 0.003, L - 0.2, 6], 'steel', [0, 0.1 + j * 0.18, 0], [0, 0, 90]);
      const hoops = K.part('aoHoops', [0, top, 0], null, 'Hoops + row cover');
      for (let i = 0; i < 4; i++) K.tor(hoops, [W / 2 - 0.08, 0.008, 180], K.std(0xf4f4f4, { roughness: 0.5 }), [-L / 2 + 0.3 + i * 0.6, 0, 0.0], [0, 90, 0]);
      const rr = W / 2 - 0.06;
      const band = K.circle(0, 0, rr, 24, 0, Math.PI).concat(K.circle(0, 0, rr - 0.004, 24, 0, Math.PI).reverse());
      K.ext(hoops, band, L - 0.3, K.std(0xf8f8f4, { transparent: true, opacity: 0.35, roughness: 0.9, side: THREE.DoubleSide }), [-(L - 0.3) / 2, 0, 0], [0, 90, 0]);
      const capr = K.part('aoCap', [0, top + 0.012, 0], null, 'Cap rail (sit-on ledge)');
      const c = cedar(K);
      K.box(capr, [L + 0.1, 0.025, 0.14], c, [0, 0, W / 2 - 0.02], null, 0.004);
      K.box(capr, [L + 0.1, 0.025, 0.14], c, [0, 0, -W / 2 + 0.02], null, 0.004);
      K.box(capr, [0.14, 0.025, W - 0.2], c, [L / 2 - 0.02, 0, 0], null, 0.004);
      K.box(capr, [0.14, 0.025, W - 0.2], c, [-L / 2 + 0.02, 0, 0], null, 0.004);
      const sol = K.part('aoSolar', [0, top + 0.02, 0], null, 'Solar post-cap lights');
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
        K.box(sol, [0.1, 0.05, 0.1], K.std(0x1d1f22, { metalness: 0.5, roughness: 0.4 }), [sx * (L / 2 - 0.05), 0.04, sz * (W / 2 - 0.05)], null, 0.006);
        K.box(sol, [0.08, 0.02, 0.08], K.std(0xfff1cc, { emissive: 0xffd27a, emissiveIntensity: 1.1 }), [sx * (L / 2 - 0.05), 0.01, sz * (W / 2 - 0.05)], null, 0.004);
      });
    },
    { hidden: ['aoDrip', 'aoSensor', 'aoTrellis', 'aoHoops', 'aoCap', 'aoSolar'], tex: ['wood_planks'] }
  );
  TB.repair('backyard', 'garden-bed').addons = [
    { id: 'drip', part: 'aoDrip', name: 'Drip irrigation + timer', cat: 'Tech', blurb: 'Two drip lines on a battery or Wi-Fi faucet timer.', cost: [40, 120], how: 'Before planting, run ½″ supply tubing from the hose bib and lay ¼″ emitter line down each row. Set the timer for early morning.', needs: ['Faucet timer (Wi-Fi optional)', 'Backflow preventer', 'Pressure regulator + filter', '½″ tubing', '¼″ emitter line'], shop: 'Raised bed drip irrigation kit' },
    { id: 'sensor', part: 'aoSensor', name: 'Soil moisture sensor', cat: 'Tech', blurb: 'Tells the timer to skip watering when soil is wet.', cost: [25, 60], how: 'Push it in at root depth (4–6″) halfway between plants and pair it with the timer’s app.', needs: ['Wireless soil moisture sensor'], shop: 'Wireless soil moisture sensor' },
    { id: 'trellis', part: 'aoTrellis', name: 'Cattle-panel trellis', cat: 'Garden', blurb: 'Vertical support for tomatoes, cucumbers and beans.', cost: [40, 90], how: 'Install on the north side so it doesn’t shade the bed. Screw two posts inside the frame and zip-tie the panel to them.', needs: ['Cattle panel (cut to fit)', '2 cedar 2×2 posts', 'Zip ties'], shop: 'Cattle panel trellis' },
    { id: 'hoops', part: 'aoHoops', name: 'Hoops + row cover', cat: 'Garden', blurb: 'Adds 4–6 weeks to the season and keeps pests off.', cost: [30, 70], how: 'Screw pipe clamps to the inside of the long sides every 2 ft and slide in bent PVC or steel hoops. Clip frost cloth over them.', needs: ['½″ PVC or steel hoops', 'Pipe straps', 'Frost cloth', 'Spring clips'], shop: 'Garden hoops row cover kit' },
    { id: 'cap', part: 'aoCap', name: 'Cap rail ledge', cat: 'Comfort', blurb: 'Flat 2×6 top you can sit on while weeding.', cost: [40, 80], how: 'Miter the corners and screw down into the posts and top boards, overhanging the outside by 1″ so rain drips clear.', needs: ['2×6 cedar boards', '2½″ exterior screws'], shop: 'Cedar 2x6' },
    { id: 'solar', part: 'aoSolar', name: 'Solar post caps', cat: 'Lighting', blurb: 'Soft glow on each corner post at night.', cost: [30, 70], how: 'Cut the corner posts flush with the top boards and screw the caps on. They charge best facing south.', needs: ['4 solar post caps (4×4)'], shop: 'Solar post cap lights 4x4' },
  ];

  /* ================= Path lights ================= */
  TB.extendModel(
    'pathlights',
    (K) => {
      AO.uplights(K, 'aoUplight', [[-0.85, -1.0, 120], [-0.9, 0.75, 70]], 'Shrub uplights');
      const hub = K.part('aoSmart', [1.86, 0.62, -2.47], null, 'Wi-Fi smart module + photocell');
      K.box(hub, [0.1, 0.12, 0.05], K.std(0xf4f4f1, { roughness: 0.4 }), [0, 0, 0], null, 0.01);
      K.sph(hub, 0.006, 'ledB', [0.03, 0.04, 0.026]);
      K.cyl(hub, [0.015, 0.015, 0.02, 16], K.std(0x1b1b1b, { roughness: 0.2 }), [-0.02, 0.03, 0.03], [90, 0, 0]);
      AO.flood(K, 'aoFlood', [1.0, 2.1, -2.48], 0);
      const num = K.part('aoNumber', [0.1, 1.55, -2.49], null, 'Lit house numbers');
      K.box(num, [0.5, 0.18, 0.03], blackMetal(K), [0, 0, 0], null, 0.01);
      K.box(num, [0.46, 0.14, 0.004], K.std(0xfff1cc, { emissive: 0xffd27a, emissiveIntensity: 0.8 }), [0, 0, 0.017], null, 0);
      [-0.12, 0, 0.12].forEach((x) => K.box(num, [0.06, 0.1, 0.006], 'black', [x, 0, 0.02], null, 0.002));
    },
    { hidden: ['aoUplight', 'aoSmart', 'aoFlood', 'aoNumber'] }
  );
  TB.repair('backyard', 'path-lights').addons = [
    { id: 'uplight', part: 'aoUplight', name: 'Shrub & tree uplights', cat: 'Lighting', blurb: 'Two spotlights that wash plants from below.', cost: [60, 180], how: 'Tap them off the same cable with pinch connectors. Aim from the front, 1–2 ft back from the plant, and keep the total watts under 80% of the transformer.', needs: ['2 low-voltage spotlights (3–5 W LED)', 'Extra 12/2 cable'], shop: 'Low voltage LED spotlight' },
    { id: 'smart', part: 'aoSmart', name: 'Smart module', cat: 'Tech', blurb: 'App control, sunset timing and voice assistants.', cost: [40, 90], how: 'Plug the module into the transformer’s accessory port or between it and the outlet, then pair it with the app.', needs: ['Transformer smart module or Wi-Fi outlet'], shop: 'Landscape lighting smart module' },
    { id: 'flood', part: 'aoFlood', name: 'Motion floodlight', cat: 'Safety', blurb: 'Bright LED light that comes on when someone approaches.', cost: [40, 120], how: 'Mount on a weatherproof box 8–10 ft up. It needs 120 V wiring, so use an existing exterior light box or call an electrician.', needs: ['LED motion floodlight', 'Weatherproof box & cover'], shop: 'LED motion sensor flood light' },
    { id: 'number', part: 'aoNumber', name: 'Lit house numbers', cat: 'Finish', blurb: 'Backlit address plaque so guests and responders find you.', cost: [60, 200], how: 'Choose 4″+ numbers in high contrast. Solar models mount anywhere; hardwired ones go on a box.', needs: ['Lighted address plaque'], shop: 'Lighted house number plaque' },
  ];

  /* ================= Basketball court ================= */
  TB.extendModel(
    'courtbuild',
    (K) => {
      const lp = K.part('aoLight', [3.4, 0, -3.4], null, 'LED court light pole');
      K.cyl(lp, [0.06, 0.08, 5.5, 16], 'dark', [0, 2.75, 0]);
      const head = K.group(lp, [-0.25, 5.4, 0.25], [0, 45, 0]);
      K.box(head, [0.6, 0.1, 0.35], 'dark', [0, 0, 0], [20, 0, 0], 0.02);
      K.box(head, [0.55, 0.01, 0.3], K.std(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.3 }), [0, -0.05, 0.02], [20, 0, 0], 0);
      const net = K.part('aoRebound', [0, 0.2, -1.1], null, 'Ball-return net');
      K.bar(net, [-0.5, 2.9, -0.3], [0.5, 2.9, -0.3], 0.015, 'dark');
      K.bar(net, [-0.5, 2.9, -0.3], [-0.3, 0.1, 0.9], 0.015, 'dark');
      K.bar(net, [0.5, 2.9, -0.3], [0.3, 0.1, 0.9], 0.015, 'dark');
      K.ext(net, [[-0.5, 2.9], [0.5, 2.9], [0.3, 0.1], [-0.3, 0.1]], 0.01, K.std(0x1c1c1c, { wireframe: true }), [0, 0, 0.2], [-23, 0, 0]);
      const cam = K.part('aoTracker', [0, 4.05, -2.4], null, 'Smart shot-tracking camera');
      K.box(cam, [0.14, 0.09, 0.08], K.std(0x15171a, { roughness: 0.3 }), [0, 0, 0.1], [-15, 0, 0], 0.01);
      K.cyl(cam, [0.025, 0.025, 0.02, 16], K.std(0x0d1a2a, { roughness: 0.05, emissive: 0x3a7bff, emissiveIntensity: 0.4 }), [0, -0.01, 0.145], [75, 0, 0]);
      AO.bench(K, 'aoBench', [-3.7, 0, 1.2], 90, 'Courtside bench');
      const paint = K.part('aoPaint', [0, 0.2025, 0.5], null, 'Painted key & lines');
      K.box(paint, [3.6, 0.001, 5.8], K.std(0x2f6fde, { roughness: 0.6 }), [0, 0, 0], null, 0);
      const fence = K.part('aoFence', [0, 0, -3.4], null, 'Ball-stop netting');
      [-3, -1, 1, 3].forEach((x) => K.cyl(fence, [0.03, 0.03, 3.6, 10], 'dark', [x, 1.8, 0]));
      K.box(fence, [6, 3.4, 0.01], K.std(0x1c1c1c, { wireframe: true }), [0, 1.85, 0], null, 0);
    },
    { hidden: ['aoLight', 'aoRebound', 'aoTracker', 'aoBench', 'aoPaint', 'aoFence'], assets: ['painted_wooden_bench'] }
  );
  TB.repair('backyard', 'court-build').addons = [
    { id: 'light', part: 'aoLight', name: 'LED court light', cat: 'Lighting', blurb: '18 ft pole with a 150–300 W LED flood for night games.', cost: [500, 1500], how: 'Pour its footing at the same time as the hoop anchor and run conduit under the slab before the pour. A licensed electrician makes the final connection.', needs: ['Light pole + anchor bolts', '150–300 W LED flood', 'Schedule 40 conduit', 'GFCI-protected circuit'], shop: 'LED sports court light' },
    { id: 'rebound', part: 'aoRebound', name: 'Ball-return net', cat: 'Comfort', blurb: 'Sends makes and misses back out to you.', cost: [80, 250], how: 'Clamp it to the pole under the backboard. Check the pole size (4″, 5″ or 6″) before buying.', needs: ['Ball-return net'], shop: 'Basketball return net' },
    { id: 'tracker', part: 'aoTracker', name: 'Shot-tracking camera', cat: 'Tech', blurb: 'Logs makes, misses and shot charts to your phone.', cost: [150, 400], how: 'Mount it on the pole above the backboard aiming at the court. It needs Wi-Fi coverage outside, so check signal at the hoop first.', needs: ['Smart shot tracker', 'Outdoor Wi-Fi extender (if needed)'], shop: 'Basketball shot tracker' },
    { id: 'bench', part: 'aoBench', name: 'Courtside bench', cat: 'Comfort', blurb: 'Seat and ball storage off the playing area.', cost: [150, 400], how: 'Keep it at least 3 ft off the court edge.', needs: ['Outdoor bench'], shop: 'Outdoor bench' },
    { id: 'paint', part: 'aoPaint', name: 'Painted key', cat: 'Finish', blurb: 'Colored key with acrylic sport-court paint.', cost: [150, 400], how: 'Wait 28 days for the concrete to cure, etch and rinse it, then roll two coats of acrylic court paint and tape crisp lines.', needs: ['Acrylic sport-court paint', 'Concrete etch', 'Painter’s tape', 'Roller'], shop: 'Sport court paint' },
    { id: 'fence', part: 'aoFence', name: 'Ball-stop netting', cat: 'Safety', blurb: 'Keeps balls out of gardens, streets and the neighbor’s yard.', cost: [300, 900], how: 'Set posts in 2 ft concrete footings 6–8 ft apart behind the hoop and hang netting with a top cable.', needs: ['Steel posts', 'Ball-stop netting', 'Top tension cable', 'Concrete'], shop: 'Ball stop netting' },
  ];
})();
