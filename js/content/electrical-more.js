/* ELC · Electrical: variants (3-way, dimmer, GFCI) and new guides (smoke/CO alarms, light fixture, ceiling fan).
   Scenes here are built in real meters (unit: 1) so scanned tools sit at true size. */
(function () {
  const ROOM = { env: 'studio', unit: 1, tex: ['white_plaster_02', 'plank_flooring'], ground: { tex: 'plank_flooring', repeat: 4, radius: 4 } };
  const room = (o) => Object.assign({}, ROOM, o);
  const W = 0.0016; // insulated 14 AWG conductor radius
  const CU = 0.0009; // bare copper

  // Plaster wall (face at z = 0) with a single-gang opening centred at (0, y). Adds stud, blue box, cable.
  function gangWall(K, y, cables) {
    const plaster = K.std(0xeeebe5, { roughness: 0.92 });
    const wall = K.part('wall', [0, 0, 0], null, 'Wall');
    const ow = 0.054, oh = 0.08, t = 0.0127;
    K.box(wall, [1.8, y - oh / 2, t], plaster, [0, (y - oh / 2) / 2, -t / 2], null, 0);
    K.box(wall, [1.8, 2.44 - y - oh / 2, t], plaster, [0, y + oh / 2 + (2.44 - y - oh / 2) / 2, -t / 2], null, 0);
    K.box(wall, [0.9 - ow / 2, oh, t], plaster, [-(ow / 2 + (0.9 - ow / 2) / 2), y, -t / 2], null, 0);
    K.box(wall, [0.9 - ow / 2, oh, t], plaster, [ow / 2 + (0.9 - ow / 2) / 2, y, -t / 2], null, 0);
    K.box(wall, [1.8, 0.09, 0.012], 'offwhite', [0, 0.045, 0.006], null, 0.003); // baseboard
    K.box(wall, [0.038, 2.44, 0.089], 'woodLight', [-0.05, 1.22, -t - 0.0445], null, 0.002);
    const box = K.part('box', [0, y, 0], null, 'Electrical box');
    const blue = K.std(0x2f6fde, { roughness: 0.55 });
    const d = 0.072;
    K.box(box, [0.052, 0.078, 0.003], blue, [0, 0, -d], null, 0.001);
    K.box(box, [0.003, 0.078, d], blue, [-0.0255, 0, -d / 2], null, 0.001);
    K.box(box, [0.003, 0.078, d], blue, [0.0255, 0, -d / 2], null, 0.001);
    K.box(box, [0.052, 0.003, d], blue, [0, 0.0385, -d / 2], null, 0.001);
    K.box(box, [0.052, 0.003, d], blue, [0, -0.0385, -d / 2], null, 0.001);
    K.box(box, [0.012, 0.006, 0.008], blue, [-0.0315, 0.04, -0.004], null, 0.001); // nail ear
    (cables || ['top']).forEach((side) => {
      const s = side === 'top' ? 1 : -1;
      K.tube(null, [[0.004 * s, y + s * 0.45, -0.05], [0.004 * s, y + s * 0.12, -0.052], [0.004 * s, y + s * 0.04, -0.048]], 0.0045, K.std(0xf3efe2, { roughness: 0.8 }));
    });
    return box;
  }

  // Device strap (yoke) with mounting screws, centred at the parent's origin.
  function yoke(K, p) {
    const zinc = K.std(0xc3c7cb, { metalness: 0.85, roughness: 0.38 });
    K.box(p, [0.044, 0.104, 0.0012], zinc, [0, 0, 0.001], null, 0);
    [0.0465, -0.0465].forEach((yy) => K.screw(p, 0.0035, 0.02, zinc, [0, yy, 0.0025], [90, 0, 0]));
  }
  // Terminal screw on the side of a device. side: 1 = right, -1 = left.
  function terminal(K, p, name, label, side, y, mat) {
    const g = K.part(name, [side * 0.0175, y, -0.012], p, label);
    K.screw(g, 0.0042, 0.006, mat, [0, 0, 0], [0, 0, side > 0 ? -90 : 90]);
    return g;
  }
  // Insulated conductor from the cable entry at the back of the box to a terminal.
  const lead = (K, p, to, mat, from) => K.tube(p, [from || [0.002, 0.034, -0.05], [to[0] * 0.6, (to[1] + 0.034) / 2, -0.045], [to[0] * 1.15, to[1], -0.02], [to[0], to[1], -0.012]], W, mat);
  const ground = (K, p, from) => K.tube(p, [from || [0, 0.034, -0.05], [0.012, 0.0, -0.045], [0.016, -0.045, -0.02], [0.012, -0.048, 0.0015]], CU, 'copper');
  const plateOf = (K, y, w, label) => {
    const plate = K.part('plate', [0, y, 0.0035], null, label || 'Cover plate');
    K.box(plate, [w || 0.07, 0.114, 0.006], 'offwhite', [0, 0, 0], null, 0.0025);
    return plate;
  };

  /* ---- 3-way switch ---- */
  TB.model('switch3way', room({ cam: [0.22, 1.3, 0.34], at: [0, 1.22, 0], hidden: ['labels'] }), (K) => {
    const Y = 1.22;
    gangWall(K, Y);
    const plate = plateOf(K, Y, 0.07, 'Switch plate');
    K.box(plate, [0.012, 0.026, 0.004], 'dark', [0, 0, 0.002], null, 0);
    const dev = K.part('device', [0, Y, 0], null, '3-way switch');
    yoke(K, dev);
    K.box(dev, [0.034, 0.072, 0.03], 'offwhite', [0, 0, -0.016], null, 0.003);
    K.box(dev, [0.026, 0.062, 0.006], 'offwhite', [0, 0, 0.003], null, 0.002);
    const tog = K.part('toggle', [0, 0, 0.006], dev, 'Toggle (no ON/OFF marks)');
    K.box(tog, [0.009, 0.022, 0.009], 'offwhite', [0, 0.006, 0.004], [-18, 0, 0], 0.003);
    terminal(K, dev, 'common', 'COMMON terminal (dark screw)', -1, -0.018, 'blackOxide');
    terminal(K, dev, 'travA', 'Traveler terminal (brass)', 1, 0.018, 'brass');
    terminal(K, dev, 'travB', 'Traveler terminal (brass)', 1, -0.018, 'brass');
    const gs = K.part('groundScrew', [0.012, -0.048, 0.003], dev, 'Green ground screw');
    K.screw(gs, 0.0035, 0.004, K.std(0x2f8a3e, { metalness: 0.6, roughness: 0.4 }), [0, 0, 0], [90, 0, 0]);
    const wires = K.part('wires', [0, 0, 0], dev, 'Common + two travelers');
    lead(K, wires, [-0.0175, -0.018], 'black', [-0.002, 0.034, -0.05]);
    lead(K, wires, [0.0175, 0.018], 'red');
    lead(K, wires, [0.0175, -0.018], 'black', [0.004, 0.034, -0.05]);
    ground(K, wires);
    const labels = K.part('labels', [0, 0, 0], dev, 'Tape flag on the common wire');
    K.box(labels, [0.012, 0.008, 0.001], 'blue', [-0.022, -0.006, -0.03], [0, 90, 0], 0);
    K.tube(null, [[-0.012, Y + 0.03, -0.06], [-0.016, Y + 0.0, -0.06], [-0.012, Y - 0.02, -0.06]], W, 'white');
    K.cone(null, [0.006, 0.016, 12], 'yellow', [-0.012, Y - 0.028, -0.06], [180, 0, 0]);
  });

  /* ---- Dimmer (rocker with slide) ---- */
  TB.model('dimmerSwitch', room({ cam: [0.22, 1.3, 0.34], at: [0, 1.22, 0], hidden: ['newDimmer', 'nuts', 'leads'] }), (K) => {
    const Y = 1.22;
    gangWall(K, Y);
    const plate = plateOf(K, Y, 0.07, 'Old switch plate');
    K.box(plate, [0.012, 0.026, 0.004], 'dark', [0, 0, 0.002], null, 0);
    const old = K.part('device', [0, Y, 0], null, 'Old toggle switch');
    yoke(K, old);
    K.box(old, [0.034, 0.072, 0.03], 'offwhite', [0, 0, -0.016], null, 0.003);
    K.box(old, [0.026, 0.062, 0.006], 'offwhite', [0, 0, 0.003], null, 0.002);
    K.box(old, [0.009, 0.022, 0.009], 'offwhite', [0, 0.006, 0.01], [-18, 0, 0], 0.003);
    const ow = K.part('wires', [0, 0, 0], old, 'Line & load wires');
    lead(K, ow, [0.0175, 0.018], 'black');
    lead(K, ow, [0.0175, -0.018], 'black', [0.004, 0.034, -0.05]);
    ground(K, ow);
    terminal(K, old, 'screwA', 'Brass terminal', 1, 0.018, 'brass');
    terminal(K, old, 'screwB', 'Brass terminal', 1, -0.018, 'brass');
    // new dimmer with pigtail leads
    const nd = K.part('newDimmer', [0, Y, 0], null, 'LED-rated dimmer');
    yoke(K, nd);
    K.box(nd, [0.042, 0.068, 0.038], K.std(0xf7f5f0, { roughness: 0.4 }), [0, 0, -0.02], null, 0.003);
    K.rep(5, (i) => K.box(nd, [0.044, 0.002, 0.03], 'steel', [0, -0.03 + i * 0.015, -0.02], null, 0)); // heat-sink fins
    const rocker = K.part('rocker', [0, 0.005, 0.006], nd, 'Rocker (on/off)');
    K.box(rocker, [0.03, 0.058, 0.006], 'white', [0, 0, 0], [3, 0, 0], 0.003);
    const slide = K.part('slide', [0.019, -0.01, 0.006], nd, 'Brightness slide');
    K.box(slide, [0.004, 0.012, 0.005], 'lightgrey', [0, 0, 0], null, 0.0015);
    const leads = K.part('leads', [0, 0, 0], nd, 'Dimmer leads');
    K.tube(leads, [[0.008, 0.02, -0.038], [0.012, 0.02, -0.055], [0.006, 0.025, -0.065]], W * 1.1, 'black');
    K.tube(leads, [[0.008, -0.02, -0.038], [0.012, -0.02, -0.055], [0.006, -0.01, -0.065]], W * 1.1, 'black');
    K.tube(leads, [[-0.01, -0.02, -0.038], [-0.014, -0.025, -0.055], [-0.008, -0.03, -0.065]], W * 1.1, 'green');
    K.tube(leads, [[-0.01, 0.02, -0.038], [-0.012, 0.03, -0.055]], W * 1.1, 'red');
    K.cone(leads, [0.004, 0.01, 10], 'orange', [-0.012, 0.036, -0.055], [0, 0, 0]);
    const nuts = K.part('nuts', [0, 0, 0], nd, 'Wire nuts');
    [[0.006, 0.03, -0.068], [0.006, -0.005, -0.068], [-0.008, -0.035, -0.068]].forEach((p, i) =>
      K.cone(nuts, [0.0065, 0.016, 12], i === 2 ? 'green' : 'yellow', p, [-90, 0, 0])
    );
  });

  /* ---- GFCI receptacle ---- */
  TB.model('gfciOutlet', room({ cam: [0.24, 1.12, 0.36], at: [0, 1.05, 0], hidden: ['loadTape', 'gfci'] }), (K) => {
    const Y = 1.05;
    gangWall(K, Y, ['top', 'bottom']);
    // counter backsplash below for a kitchen read
    K.box(null, [1.8, 0.04, 0.64], K.pbr('granite_tile', [1, 0.4], { roughness: 0.4 }, 'offwhite'), [0, 0.9, 0.31], null, 0.006);
    const plate = plateOf(K, Y, 0.07, 'Cover plate');
    const old = K.part('device', [0, Y, 0], null, 'Old receptacle');
    yoke(K, old);
    K.box(old, [0.034, 0.08, 0.026], 'offwhite', [0, 0, -0.012], null, 0.003);
    [0.019, -0.019].forEach((yy) => {
      K.box(old, [0.03, 0.03, 0.008], 'offwhite', [0, yy, 0.004], null, 0.004);
      K.box(old, [0.002, 0.007, 0.002], 'black', [-0.0063, yy + 0.003, 0.0085], null, 0);
      K.box(old, [0.002, 0.009, 0.002], 'black', [0.0063, yy + 0.003, 0.0085], null, 0);
    });
    const ow = K.part('wires', [0, 0, 0], old, 'Two cables: one feeds power in, one goes on');
    lead(K, ow, [0.0175, 0.018], 'black');
    lead(K, ow, [-0.0175, 0.018], 'white', [-0.002, 0.034, -0.05]);
    lead(K, ow, [0.0175, -0.018], 'black', [0.004, -0.034, -0.05]);
    lead(K, ow, [-0.0175, -0.018], 'white', [-0.004, -0.034, -0.05]);
    ground(K, ow);
    // GFCI
    const g = K.part('gfci', [0, Y, 0], null, 'GFCI receptacle');
    yoke(K, g);
    K.box(g, [0.04, 0.084, 0.034], 'white', [0, 0, -0.016], null, 0.003);
    K.box(g, [0.033, 0.067, 0.008], K.std(0xfbfaf6, { roughness: 0.35 }), [0, 0, 0.004], null, 0.003);
    [0.022, -0.022].forEach((yy) => {
      K.box(g, [0.002, 0.007, 0.002], 'black', [-0.0063, yy, 0.0085], null, 0);
      K.box(g, [0.002, 0.009, 0.002], 'black', [0.0063, yy, 0.0085], null, 0);
      K.cyl(g, [0.0022, 0.0022, 0.002, 12], 'black', [0, yy - 0.007, 0.0085], [90, 0, 0]);
    });
    const test = K.part('test', [0, 0.005, 0.009], g, 'TEST button');
    K.box(test, [0.014, 0.006, 0.003], 'black', [0, 0, 0], null, 0.001);
    const reset = K.part('reset', [0, -0.004, 0.009], g, 'RESET button');
    K.box(reset, [0.014, 0.006, 0.003], 'red', [0, 0, 0], null, 0.001);
    const led = K.sph(g, 0.0012, 'ledG', [0.012, 0, 0.0085]);
    const line = K.part('lineTerms', [0, 0, 0], g, 'LINE terminals (power in)');
    terminal(K, line, 'lineHot', 'LINE brass (hot in)', 1, -0.02, 'brass');
    terminal(K, line, 'lineNeutral', 'LINE silver (neutral in)', -1, -0.02, 'chrome');
    const load = K.part('loadTerms', [0, 0, 0], g, 'LOAD terminals (to downstream outlets)');
    terminal(K, load, 'loadHot', 'LOAD brass', 1, 0.02, 'brass');
    terminal(K, load, 'loadNeutral', 'LOAD silver', -1, 0.02, 'chrome');
    const tape = K.part('loadTape', [0, 0.02, -0.012], g, 'Yellow tape over LOAD (leave on if unused)');
    K.box(tape, [0.044, 0.012, 0.016], 'yellow', [0, 0, 0], null, 0.001);
    const gw = K.part('gWires', [0, 0, 0], g, 'Line wires (from the panel)');
    lead(K, gw, [0.02, -0.02], 'black', [0.004, -0.034, -0.05]);
    lead(K, gw, [-0.02, -0.02], 'white', [-0.004, -0.034, -0.05]);
    ground(K, gw, [0, -0.034, -0.05]);
    return {
      tick(t, fx) {
        led.material.emissiveIntensity = fx === 'power' ? 1.2 : fx === 'trip' ? 0.05 : 0.05;
        K.parts.test.position.z = fx === 'trip' ? 0.0075 : 0.009;
      },
    };
  });

  /* ---- Ceiling helper: plaster ceiling at 2.44 m with a round hole, joists above ---- */
  function ceiling(K, hole, opts) {
    opts = opts || {};
    const plaster = K.std(0xf2f0eb, { roughness: 0.95, emissive: 0x4a4844 });
    const c = K.part('ceiling', [0, 0, 0], null, 'Ceiling');
    const sq = [[-1.6, -1.6], [1.6, -1.6], [1.6, 1.6], [-1.6, 1.6]];
    K.ext(c, sq, 0.0127, plaster, [0, 2.4527, 0], [90, 0, 0], 0, hole ? [K.circle(0, 0, hole, 32).reverse()] : []);
    K.box(c, [3.2, 2.44, 0.02], plaster, [0, 1.22, -1.6], null, 0);
    K.box(c, [0.038, 0.235, 3.2], 'woodLight', [-0.2, 2.453 + 0.1175, 0], null, 0.002);
    K.box(c, [0.038, 0.235, 3.2], 'woodLight', [0.206, 2.453 + 0.1175, 0], null, 0.002);
    return c;
  }
  function roundBox(K, label) {
    const b = K.part('box', [0, 2.44, 0], null, label || 'Ceiling box');
    K.cyl(b, [0.051, 0.051, 0.054, 32, true], 'steel', [0, 0.027, 0]);
    K.cyl(b, [0.051, 0.051, 0.002, 32], 'steel', [0, 0.054, 0]);
    [-0.044, 0.044].forEach((x) => K.box(b, [0.012, 0.002, 0.01], 'steel', [x, 0.004, 0], null, 0));
    K.tube(null, [[0.3, 2.53, 0.02], [0.08, 2.52, 0.02], [0.02, 2.5, 0.01]], 0.0045, K.std(0xf3efe2, { roughness: 0.8 }));
    return b;
  }
  // House wires hanging out of a ceiling box.
  function houseWires(K, name, len) {
    const w = K.part(name || 'houseWires', [0, 2.44, 0], null, 'House wires: black (hot), white (neutral), bare (ground)');
    const L = len || 0.14;
    K.tube(w, [[0.01, 0.04, 0], [0.018, 0, 0.006], [0.02, -L, 0.012]], W, 'black');
    K.tube(w, [[-0.01, 0.04, 0], [-0.018, 0, 0.006], [-0.02, -L, 0.012]], W, 'white');
    K.tube(w, [[0, 0.04, 0.004], [0.004, 0, 0.012], [0.006, -L + 0.02, 0.02]], CU, 'copper');
    return w;
  }
  const strap = (K, name, label) => {
    const s = K.part(name, [0, 2.437, 0], null, label);
    K.box(s, [0.11, 0.003, 0.018], 'steel', [0, 0, 0], null, 0);
    [-0.044, 0.044].forEach((x) => K.screw(s, 0.004, 0.012, 'steel', [x, -0.004, 0], [180, 0, 0]));
    K.screw(s, 0.0035, 0.004, K.std(0x2f8a3e, { metalness: 0.6, roughness: 0.4 }), [0.022, -0.002, 0], [180, 0, 0]);
    [-0.03, 0.03].forEach((x) => K.cyl(s, [0.003, 0.003, 0.05, 10], 'brass', [x, -0.027, 0]));
    return s;
  };
  const bulb = (K, p, pos) =>
    K.glb(p, 'lightbulb_led', { height: 0.11, rots: [['x', 180]], anchor: [0.5, 1, 0.5] }, pos) ||
    (K.cyl(p, [0.013, 0.013, 0.025, 16], 'chrome', [pos[0], pos[1] - 0.012, pos[2]]), K.sph(p, 0.03, 'white', [pos[0], pos[1] - 0.06, pos[2]]));

  /* ---- Flush-mount light fixture swap ---- */
  TB.model(
    'lightFixture',
    room({ cam: [0.55, 1.75, 0.75], at: [0, 2.3, 0], assets: ['lightbulb_led'], hidden: ['newStrap', 'newLeads', 'nuts', 'newCanopy', 'newBulbs', 'newShade'] }),
    (K) => {
      ceiling(K, 0.052);
      roundBox(K);
      houseWires(K, 'houseWires', 0.1);
      strap(K, 'oldStrap', 'Old mounting strap');
      const oc = K.part('oldCanopy', [0, 2.435, 0], null, 'Old fixture base');
      K.lathe(oc, [[0, 0], [0.15, 0], [0.16, -0.012], [0.12, -0.04], [0.0, -0.042]], K.std(0xb08d4a, { metalness: 0.9, roughness: 0.35 }));
      K.tube(oc, [[0.02, -0.04, 0], [0.03, -0.02, 0.01], [0.02, 0.02, 0.012]], W, 'black');
      K.tube(oc, [[-0.02, -0.04, 0], [-0.03, -0.02, 0.01], [-0.02, 0.02, 0.012]], W, 'white');
      [[-0.045, 0], [0.045, 0]].forEach(([x, z]) => K.cyl(oc, [0.022, 0.022, 0.035, 16], 'black', [x, -0.06, z]));
      const og = K.part('oldGlobe', [0, 2.36, 0], null, 'Glass globe');
      K.lathe(og, [[0, -0.08], [0.06, -0.075], [0.11, -0.05], [0.14, 0], [0.142, 0.04], [0.135, 0.045]], K.std(0xf2ede0, { transparent: true, opacity: 0.85, roughness: 0.2 }));
      K.sph(og, 0.012, K.std(0xb08d4a, { metalness: 0.9, roughness: 0.35 }), [0, -0.085, 0]);
      // new fixture
      strap(K, 'newStrap', 'New mounting strap (with green ground screw)');
      const nl = K.part('newLeads', [0, 2.38, 0], null, 'Fixture leads');
      K.tube(nl, [[0.03, -0.01, 0], [0.025, 0.03, 0.01], [0.02, 0.05, 0.012]], W, 'black');
      K.tube(nl, [[-0.03, -0.01, 0], [-0.025, 0.03, 0.01], [-0.02, 0.05, 0.012]], W, 'white');
      K.tube(nl, [[0.0, -0.01, 0.01], [0.01, 0.04, 0.02], [0.022, 0.058, 0.0]], CU, 'green');
      const nuts = K.part('nuts', [0, 2.44, 0], null, 'Wire nuts (hot, neutral)');
      K.cone(nuts, [0.007, 0.018, 12], 'orange', [0.02, -0.085, 0.012], [180, 0, 0]);
      K.cone(nuts, [0.007, 0.018, 12], 'orange', [-0.02, -0.085, 0.012], [180, 0, 0]);
      const nc = K.part('newCanopy', [0, 2.437, 0], null, 'New fixture pan');
      K.lathe(nc, [[0, 0], [0.17, 0], [0.175, -0.01], [0.16, -0.02], [0.0, -0.022]], K.std(0x2a2d31, { metalness: 0.6, roughness: 0.45 }));
      const nb = K.part('newBulbs', [0, 2.41, 0], null, 'LED bulbs (2700 K)');
      [-0.05, 0.05].forEach((x) => {
        K.cyl(nb, [0.02, 0.02, 0.03, 16], 'white', [x, 0, 0]);
        bulb(K, nb, [x, -0.012, 0]);
      });
      const shadeMat = K.std(0xfaf6ec, { transparent: true, opacity: 0.92, roughness: 0.6, emissive: 0xffe6b0, emissiveIntensity: 0 });
      const ns = K.part('newShade', [0, 2.415, 0], null, 'Drum shade');
      K.cyl(ns, [0.19, 0.19, 0.11, 48, true], shadeMat, [0, -0.04, 0]);
      K.cyl(ns, [0.19, 0.19, 0.004, 48], shadeMat, [0, -0.096, 0]);
      K.tor(ns, [0.19, 0.003], K.std(0x2a2d31, { metalness: 0.6 }), [0, -0.097, 0], [90, 0, 0]);
      return { tick: (t, fx) => (shadeMat.emissiveIntensity = fx === 'lit' ? 0.9 : 0) };
    }
  );

  /* ---- Ceiling fan on a fan-rated brace box ---- */
  TB.model(
    'ceilingFan',
    room({ cam: [1.4, 1.5, 1.7], at: [0, 2.2, 0], hidden: ['brace', 'bracket', 'fanMotor', 'fanWires', 'nuts', 'canopy', 'blades', 'lightKit'] }),
    (K) => {
      ceiling(K, 0.052);
      const oldFx = K.part('oldLight', [0, 2.44, 0], null, 'Old light fixture');
      K.lathe(oldFx, [[0, 0], [0.15, 0], [0.155, -0.01], [0.12, -0.11], [0, -0.13]], K.std(0xf2ede0, { transparent: true, opacity: 0.88, roughness: 0.2 }));
      const ob = K.part('oldBox', [0, 2.44, 0], null, 'Light-only box (not fan rated)');
      K.cyl(ob, [0.051, 0.051, 0.035, 32, true], K.std(0x2f6fde, { roughness: 0.55 }), [0, 0.018, 0]);
      houseWires(K, 'houseWires', 0.12);
      const brace = K.part('brace', [0, 2.44, 0], null, 'Fan-rated brace + box');
      K.cyl(brace, [0.012, 0.012, 0.37, 16], 'steel', [0, 0.075, 0], [0, 0, 90]);
      [-0.185, 0.185].forEach((x) => K.box(brace, [0.006, 0.05, 0.05], 'steel', [x * 0.98, 0.075, 0], null, 0.002));
      K.cyl(brace, [0.051, 0.051, 0.04, 32, true], 'steel', [0, 0.02, 0]);
      K.box(brace, [0.03, 0.035, 0.02], 'steel', [0, 0.05, 0], null, 0.002);
      const bracket = K.part('bracket', [0, 2.435, 0], null, 'Hanger bracket');
      K.box(bracket, [0.13, 0.004, 0.03], 'steel', [0, 0, 0], null, 0);
      K.ext(bracket, [[-0.04, 0], [0.04, 0], [0.03, -0.04], [-0.03, -0.04]], 0.004, 'steel', [0, 0, -0.016], null, 0);
      K.ext(bracket, [[-0.04, 0], [0.04, 0], [0.03, -0.04], [-0.03, -0.04]], 0.004, 'steel', [0, 0, 0.012], null, 0);
      const finish = K.std(0x3b2f26, { metalness: 0.7, roughness: 0.4 });
      const motor = K.part('fanMotor', [0, 2.395, 0], null, 'Motor on its downrod');
      K.sph(motor, 0.028, finish, [0, 0, 0]);
      K.cyl(motor, [0.012, 0.012, 0.15, 16], finish, [0, -0.08, 0]);
      K.lathe(motor, [[0, 0.03], [0.04, 0.03], [0.08, 0.0], [0.11, -0.035], [0.115, -0.06], [0.1, -0.09], [0.0, -0.095]], finish, [0, -0.17, 0]);
      K.tor(motor, [0.112, 0.004], K.std(0xc7a46a, { metalness: 0.9, roughness: 0.3 }), [0, -0.22, 0], [90, 0, 0]);
      const fw = K.part('fanWires', [0, 2.44, 0], null, 'Fan leads: black (fan), blue (light), white, green');
      K.tube(fw, [[0, -0.04, 0], [0.025, -0.06, 0.01], [0.03, -0.1, 0.02]], W, 'black');
      K.tube(fw, [[0, -0.04, 0], [0.02, -0.07, -0.01], [0.034, -0.11, -0.01]], W, 'blue');
      K.tube(fw, [[0, -0.04, 0], [-0.025, -0.06, 0.01], [-0.03, -0.1, 0.02]], W, 'white');
      K.tube(fw, [[0, -0.04, 0], [-0.01, -0.07, -0.02], [-0.006, -0.1, -0.02]], CU, 'green');
      const nuts = K.part('nuts', [0, 2.44, 0], null, 'Wire nuts');
      K.cone(nuts, [0.008, 0.02, 12], 'red', [0.028, -0.115, 0.016], [180, 0, 0]);
      K.cone(nuts, [0.007, 0.018, 12], 'yellow', [-0.026, -0.115, 0.016], [180, 0, 0]);
      K.cone(nuts, [0.007, 0.018, 12], 'green', [-0.004, -0.115, -0.02], [180, 0, 0]);
      const canopy = K.part('canopy', [0, 2.437, 0], null, 'Canopy');
      K.lathe(canopy, [[0.015, -0.075], [0.04, -0.07], [0.07, -0.04], [0.08, -0.01], [0.082, 0]], finish);
      const blades = K.part('blades', [0, 2.2, 0], null, 'Blades (52″)');
      const spin = K.group(blades, [0, 0, 0]);
      const bladeMat = K.pbr('oak_wood_planks', [0.3, 1], { roughness: 0.55 }, 'woodDark');
      K.rep(5, (i) => {
        const g = K.group(spin, [0, 0, 0], [0, i * 72, 0]);
        K.ext(g, [[0.09, -0.012], [0.16, -0.02], [0.16, 0.02], [0.09, 0.012]], 0.006, finish, [0, -0.003, 0], [90, 0, 0], 0.001);
        const b = K.group(g, [0.4, 0, 0], [13, 0, 0]);
        K.ext(b, [[-0.26, -0.055], [0.22, -0.065], [0.255, -0.04], [0.26, 0.04], [0.22, 0.065], [-0.26, 0.055]], 0.007, bladeMat, [0, 0.0035, 0], [90, 0, 0], 0.0015);
        K.screw(g, 0.004, 0.012, finish, [0.13, 0.008, 0.008], [0, 0, 0]);
      });
      const lk = K.part('lightKit', [0, 2.13, 0], null, 'Light kit');
      const glow = K.std(0xf6f0e2, { transparent: true, opacity: 0.9, roughness: 0.3, emissive: 0xffe2a8, emissiveIntensity: 0 });
      K.cyl(lk, [0.05, 0.05, 0.03, 32], finish, [0, 0, 0]);
      K.lathe(lk, [[0.0, -0.1], [0.05, -0.095], [0.09, -0.06], [0.1, -0.02], [0.09, -0.012]], glow);
      return {
        tick(t, fx) {
          spin.rotation.y = fx === 'spin' || fx === 'spinLit' ? -t * 7 : 0;
          if (fx === 'wobble') spin.rotation.z = Math.sin(t * 7) * 0.02;
          else spin.rotation.z = 0;
          glow.emissiveIntensity = fx === 'spinLit' ? 0.9 : 0;
        },
      };
    }
  );

  /* ---- Smoke / CO alarm (battery or hardwired) ---- */
  function alarmScene(K, wired) {
    ceiling(K, wired ? 0.052 : 0);
    if (wired) {
      roundBox(K, 'Ceiling box');
      const hz = K.part('harness', [0, 2.405, 0], null, 'Wiring harness (plug-in connector)');
      K.box(hz, [0.03, 0.012, 0.02], 'offwhite', [0, 0, 0], null, 0.002);
      K.tube(hz, [[-0.008, 0.006, 0], [-0.01, 0.025, 0.004], [-0.014, 0.05, 0.006]], W, 'black');
      K.tube(hz, [[0, 0.006, 0], [0, 0.028, 0.006], [0, 0.05, 0.008]], W, 'white');
      K.tube(hz, [[0.008, 0.006, 0], [0.012, 0.025, 0.004], [0.016, 0.05, 0.004]], W, 'red');
    }
    const plate = K.part('plate', [0, 2.438, 0], null, 'Mounting plate');
    K.ext(plate, K.circle(0, 0, 0.065, 40), 0.004, 'offwhite', [0, 0.002, 0], [90, 0, 0], 0.001, [K.circle(0, 0, 0.03, 24).reverse()]);
    [-0.045, 0.045].forEach((x) => K.screw(plate, 0.0035, 0.025, 'steel', [x, -0.003, 0], [180, 0, 0]));
    const alarm = K.part('alarm', [0, 2.432, 0], null, 'Old alarm');
    const shell = K.std(0xf1ede4, { roughness: 0.55 });
    K.lathe(alarm, [[0, -0.048], [0.04, -0.047], [0.062, -0.038], [0.07, -0.02], [0.07, 0], [0, 0]], shell);
    K.rep(16, (i) => {
      const a = (i / 16) * Math.PI * 2;
      K.box(alarm, [0.012, 0.012, 0.004], 'dark', [Math.cos(a) * 0.066, -0.016, Math.sin(a) * 0.066], [0, -a / K.DEG, 0], 0.001);
    });
    const tb = K.part('testBtn', [0, -0.049, 0], alarm, 'TEST button');
    K.cyl(tb, [0.016, 0.016, 0.004, 24], 'offwhite');
    const led = K.sph(alarm, 0.002, 'ledR', [0.03, -0.044, 0.01]);
    const date = K.part('dateLabel', [0, -0.001, 0], alarm, '“Replace by” date label');
    K.box(date, [0.06, 0.001, 0.035], K.std(0xffffff, { roughness: 0.8 }), [0, 0.0006, 0], null, 0);
    K.box(date, [0.04, 0.0012, 0.004], 'dark', [0, 0.0008, -0.008], null, 0);
    K.box(date, [0.03, 0.0012, 0.004], 'red', [0, 0.0008, 0.006], null, 0);
    const door = K.part('batteryDoor', [0.03, -0.03, 0.035], alarm, 'Battery compartment');
    K.box(door, [0.04, 0.02, 0.012], 'lightgrey', [0, 0, 0], null, 0.002);
    const batt = K.part('battery', [0.03, -0.03, 0.035], alarm, wired ? 'Backup battery (9 V)' : 'Battery (9 V)');
    K.box(batt, [0.026, 0.0175, 0.012], K.std(0x1f2a36, { roughness: 0.5 }), [0, 0, 0], null, 0.002);
    K.cyl(batt, [0.0035, 0.0035, 0.004, 6], 'steel', [0.016, 0.004, 0], [0, 0, 90]);
    K.cyl(batt, [0.0035, 0.0035, 0.004, 12], 'steel', [0.016, -0.004, 0], [0, 0, 90]);
    // new alarm with sealed 10-year battery
    const na = K.part('newAlarm', [0, 2.432, 0], null, wired ? 'New hardwired smoke/CO alarm' : 'New 10-year sealed smoke/CO alarm');
    K.lathe(na, [[0, -0.05], [0.045, -0.049], [0.064, -0.04], [0.072, -0.02], [0.072, 0], [0, 0]], K.std(0xfafaf7, { roughness: 0.45 }));
    K.cyl(na, [0.022, 0.022, 0.004, 24], 'lightgrey', [0, -0.051, 0]);
    const nled = K.sph(na, 0.002, 'ledG', [0.032, -0.046, 0.01]);
    K.box(na, [0.03, 0.0015, 0.006], 'dark', [0, -0.05, 0.03], null, 0);
    const tab = K.part('pullTab', [0.07, -0.02, 0], na, 'Battery activation tab');
    K.box(tab, [0.03, 0.001, 0.012], 'yellow', [0.012, 0, 0], null, 0);
    return {
      tick(t, fx) {
        led.material.emissiveIntensity = fx === 'test' ? (Math.sin(t * 10) > 0 ? 1.2 : 0.05) : 0.05 + (Math.sin(t * 0.8) > 0.97 ? 1 : 0);
        nled.material.emissiveIntensity = fx === 'live' ? 0.9 : 0.05;
      },
    };
  }
  const ALARM = (wired) => room({ cam: [0.3, 2.05, 0.45], at: [0, 2.4, 0], hidden: ['newAlarm', 'pullTab'] });
  TB.model('smokeBattery', ALARM(false), (K) => alarmScene(K, false));
  TB.model('smokeWired', ALARM(true), (K) => alarmScene(K, true));


  /* ================= Variants on existing electrical guides ================= */
  const ELC = (id) => TB.repair('electrical', id);
  const SAFE = 'Turn off the breaker (the switch in your electrical panel), then prove the wires are dead with a voltage tester you have just checked on a working outlet. Test, then re-check the tester on the working outlet again (pros call this live-dead-live).';
  const NCV = 'A non-contact tester (the pen that beeps near live wires) can miss a live wire if its battery is weak or the cable is damp. With wires bare, confirm with a two-lead tester or multimeter touching the metal.';

  const sw = ELC('replace-switch');
  sw.variants = [
    { id: 'single', name: 'Single-pole', blurb: 'One switch controls the light. ON/OFF printed on the toggle, two brass screws plus a green ground.' },
    {
      id: 'threeway',
      name: '3-way',
      blurb: 'Two switches control one light (stairs, hallways). No ON/OFF marks; one dark screw.',
      model: 'switch3way',
      level: 2,
      time: '30–45 min',
      summary: 'A 3-way switch has three wire screws: one dark COMMON screw and two brass TRAVELER screws. Tag the wire on the common before you unhook anything and the rest is easy.',
      intro: { hi: ['common', 'travA', 'travB'] },
      safety: [SAFE, NCV, 'A 3-way box often holds wires from more than one circuit, and the second 3-way switch elsewhere may still be live. Test every wire in this box, including capped bundles, before touching anything.'],
      causes: [['Worn contacts', 'Crackling, or the light works from one switch but not the other.'], ['Loose traveler', 'The light only works in some combinations of the two switches.'], ['Wrong replacement', 'A single-pole switch (with ON/OFF printed on it) won’t work here; you need a switch labeled 3-way.']],
      tools: ['Non-contact voltage tester', 'Two-lead voltage tester or multimeter', '#2 Phillips and ¼″ flat screwdrivers', 'New 3-way switch (same amp rating, usually 15 A)', 'Needle-nose pliers', 'Wire stripper', 'Colored tape and marker'],
      steps: [
        { t: 'Shut off and prove the power is dead', d: 'Turn the light on, then switch breakers off until it goes out. Check your non-contact tester on a working outlet, then hold it to the switch and every wire you can see once the plate is off. Finish by checking the tester on the working outlet again.', why: 'A 3-way switch box can carry power from more than one place. The live-dead-live check proves the silence is real, not a dead battery.', tip: 'Flip both 3-way switches through every position while testing. With power on, one of the travelers is only live in certain positions, so a single test can mislead you.', ok: 'The tester beeps on the working outlet, stays silent everywhere in this box in every switch position, and beeps again on the outlet.', v: { cam: [0.22, 1.3, 0.34], at: [0, 1.22, 0], hi: ['plate'], tool: { id: 'voltTester', at: [0.025, 1.24, 0.01], rot: [70, 0, 0] } } },
        { t: 'Remove the plate and pull the switch', d: 'Unscrew the two plate screws, then the two long strap screws at the top and bottom. Pull the switch straight out about 3″ by its metal strap. Retest every wire with the tester, including any white bundles capped in the back.', why: 'Holding the strap, not the toggle, keeps the wires from pulling off their screws before you’ve marked them.', tip: 'Score painted-on plate edges with a utility knife first. Don’t let the switch dangle by one wire; rest it on your fingers while you work.', ok: 'The switch is out on its wires, nothing has come loose, and every wire tests dead.', v: { cam: [0.24, 1.3, 0.3], at: [0, 1.22, 0.04], hi: ['device'], mv: { plate: [0.15, -0.05, 0.12], device: [0, 0, 0.08] }, tool: { id: 'screwdriver', at: [0, 1.267, 0.09], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Find and tag the COMMON wire', d: 'Find the screw that’s a different color from the others: dark bronze or black, sometimes labeled COM. Wrap a flag of colored tape around the wire on that screw. Take a photo of the whole switch from both sides.', why: 'The common is the wire that either brings power in or sends it on to the light. It’s the only wire that must land on one specific screw.', tip: 'The common screw is not always in the same spot on the new switch as on the old one. Follow the tape flag and the screw color, never the screw’s position.', ok: 'One wire wears a tape flag and that wire runs to the dark screw in your photo.', v: { cam: [-0.14, 1.24, 0.24], at: [-0.01, 1.2, 0.07], hi: ['common', 'labels'], show: ['labels'] } },
        { t: 'Move the two travelers', d: 'Unhook the two traveler wires (often red and black, sometimes a re-taped white) from the brass screws. Hook each one clockwise around a brass screw on the new switch, either one on either brass screw, and tighten firmly.', why: 'Travelers only carry power between the two switches. The switch picks one or the other, so their order doesn’t matter.', tip: 'Check each copper end: if it’s nicked or blackened, snip and strip fresh ¾″ before hooking. If the old switch used push-in holes, release them with a small screwdriver in the slot or snip them off.', ok: 'Both travelers sit on brass screws, wrapped clockwise, and neither moves when you tug it.', v: { cam: [0.16, 1.26, 0.2], at: [0.015, 1.22, 0.07], hi: ['travA', 'travB'], xray: true } },
        { t: 'Connect the common and the ground', d: 'Hook the tape-flagged wire clockwise around the dark COMMON screw on the new switch and tighten. Connect the bare copper ground to the green screw.', why: 'If the common and a traveler are swapped, the light works only in some switch positions or not at all.', tip: 'Leave the tape flag on the wire. The next person to work on this switch will thank you.', ok: 'The flagged wire is on the dark screw, the ground is on green, and all screws are snug.', v: { cam: [-0.12, 1.2, 0.2], at: [0, 1.2, 0.07], hi: ['common', 'groundScrew'], xray: true } },
        { t: 'Mount and test all four combinations', d: 'Fold the wires in, screw the switch to the box and attach the plate. Restore power. Try all four combinations: both down, both up, and each one up with the other down. Every flip of either switch should change the light.', why: 'Testing every combination proves the common is right. One bad combination points straight to a swapped wire.', tip: 'If some combinations fail, kill power, verify dead, and swap the common wire with one traveler on this switch. If that doesn’t fix it, the other 3-way switch may be the worn one.', ok: 'The light changes state every time you flip either switch, in all four combinations.', v: { cam: [0.22, 1.3, 0.34], at: [0, 1.22, 0], hi: ['toggle'], mv: { device: [0, 0, 0], plate: [0, 0, 0] } } },
      ],
      tricks: [
        ['Tag before you touch', 'Flag the common with tape before a single screw is loosened. That one habit prevents nearly every 3-way mix-up.'],
        ['Which switch is bad?', 'If the light works from one switch but not the other, the switch that “does nothing” is usually the worn one. Replace that one first.'],
        ['Buy the matching style', '3-way switches come in toggle and rocker styles. Match the other switch in the pair so they look the same.'],
        ['Smart 3-way kits', 'Smart 3-ways usually replace one switch with a main unit and the other with a companion, and often need a neutral. Read the wiring diagram before you buy.'],
        ['Lost track of the common?', 'With the switch out and wires capped and apart, a pro can find the common by measuring. If you didn’t flag it and you’re stuck, cap the wires and call an electrician rather than guessing with power on.'],
      ],
      learn: {
        how: 'Two 3-way switches are linked by a pair of traveler wires. Each switch connects its common terminal to one traveler or the other. When both switches pick the same traveler, the path is complete and the light is on. Flip either one and the path breaks. That’s why there’s no fixed ON or OFF position.',
        specs: [['Typical cable between switches', '14/3 or 12/3 with ground (black, red, white + bare)'], ['Terminals', '1 common (dark), 2 travelers (brass), 1 ground (green)'], ['Strip for screw hook', 'about ¾″'], ['Typical rating', '15 A, 120 V']],
        terms: [['Common (COM)', 'Dark screw; power in on one switch, out to the light on the other.'], ['Travelers', 'Two wires that run between the 3-way switches.'], ['4-way switch', 'Goes between two 3-ways to add a third control location. Has four screws.']],
        mistakes: ['Buying a single-pole switch.', 'Unhooking wires before flagging the common.', 'Matching screw positions instead of screw colors.', 'Assuming white is always neutral. In 3-way runs a white wire is often re-marked as a traveler.'],
        tips: ['If the light only works in some combinations, swap the common with one traveler on one switch.'],
      },
      refs: [
        ['How to replace a three-way switch (This Old House)', 'https://www.thisoldhouse.com/electrical/how-to-replace-a-three-way-switch'],
        ['NEC requirements for switches (EC&M)', 'https://ecmweb.com/national-electrical-code/code-basics/article/21265031/nec-requirements-for-switches'],
      ],
      pro: 'Call a pro if four or more switches control one light, wires are re-taped in confusing colors, you can’t find a common, or the switches are fed from different circuits.',
    },
    {
      id: 'dimmer',
      name: 'Add a dimmer',
      blurb: 'Swap a toggle for an LED-rated dimmer with wire leads.',
      model: 'dimmerSwitch',
      level: 2,
      time: '30–45 min',
      cost: '$20–60',
      summary: 'Most dimmers have short wire leads instead of screws, joined to the house wires with wire connectors. Pick a dimmer rated for LED bulbs (look for “C·L” or “LED+”) and dimmable bulbs, or you’ll get flicker and buzz.',
      intro: { hi: ['device'] },
      safety: [SAFE, NCV, 'Dimmers are bulky and warm. If the box is crowded, the dimmer may not fit safely; don’t force it.', 'Never use a light dimmer to control a ceiling fan motor or an outlet. Use a fan speed control instead.'],
      causes: [['Flicker with LEDs', 'Old dimmers were made for incandescent bulbs and can’t handle LED electronics well.'], ['Want mood lighting', 'Dimming saves energy and makes bulbs last longer.']],
      tools: ['Non-contact voltage tester', 'Two-lead voltage tester or multimeter', 'Screwdrivers', 'LED-rated (C·L or LED+) dimmer', 'Wire stripper', 'Wire connectors (wire nuts usually included)', 'Dimmable LED bulbs', 'Small flat screwdriver for the trim dial'],
      steps: [
        { t: 'Check the bulbs and the dimmer rating', d: 'Read each bulb: it must say “dimmable.” Add up the watts of all the bulbs on that switch (the actual LED watts, like 9 W, not the “60 W equivalent”). Choose a dimmer whose LED rating is higher than that total, with room to spare.', why: 'LED dimmers list two ratings, like 150 W LED / 600 W incandescent. Use the LED number. Overloading a dimmer makes it hot and shortens its life.', tip: 'Ganged with other switches in one box? Breaking off the dimmer’s side fins lowers its rating; check the derating chart in the instructions. Buying bulbs the dimmer maker lists as compatible avoids most flicker.', ok: 'Every bulb says dimmable and your total LED watts is below the dimmer’s LED rating.', v: { cam: [0.22, 1.3, 0.34], at: [0, 1.22, 0], hi: ['device'] } },
        { t: 'Shut off and prove the power is dead', d: 'Turn the light on, then switch breakers off until it goes out. Check your non-contact tester on a working outlet, test at the switch, and re-check the tester on the outlet afterward.', why: 'Switch boxes often share a circuit with outlets elsewhere, or hold a second circuit. The live-dead-live check proves your tester is working.', tip: 'Tape the breaker handle off and leave a note on the panel so no one turns it back on while you work.', ok: 'The tester beeps on the working outlet, stays silent at the switch, and beeps again on the outlet.', v: { cam: [0.22, 1.3, 0.34], at: [0, 1.22, 0], hi: ['plate'], tool: { id: 'voltTester', at: [0.025, 1.24, 0.01], rot: [70, 0, 0] } } },
        { t: 'Remove the old switch', d: 'Take off the plate, remove the two strap screws, and pull the switch straight out about 3″. Retest every wire. Unhook the two wires and the ground from the old switch.', why: 'Testing the bare wires catches a second live circuit in the box.', tip: 'Straighten the hooked wire ends with pliers. If they’re nicked or blackened, snip them and strip a fresh length to match the connector package (usually ½″).', ok: 'The old switch is out and you have two straight, clean insulated wires plus a bare ground.', v: { cam: [0.24, 1.3, 0.3], at: [0, 1.22, 0.04], hi: ['device'], mv: { plate: [0.15, -0.05, 0.12], device: [0.2, -0.05, 0.15] } } },
        { t: 'Join the leads', d: 'Hold one house wire and one dimmer lead side by side with their insulation ends even. Push a wire nut on and twist clockwise until the wires twist together and it feels tight, about 5–7 turns. Do the same for the other pair, then green lead to bare copper. On a single-pole job, cap any extra lead (often red or marked “3-way”) alone.', why: 'On a single-pole dimmer the two hot leads are interchangeable. The extra lead is only used when the dimmer replaces a 3-way switch.', tip: 'Dimmer leads are thin stranded wire. Let the stranded lead stick out about ⅛″ past the solid house wire so the nut grabs both. Lever connectors (like Wago 221, strip 11 mm or 7/16″) are easier for beginners.', ok: 'No bare copper shows below any wire nut and each lead stays put when tugged.', v: { cam: [0.18, 1.24, 0.24], at: [0.0, 1.21, 0.04], hi: ['leads', 'nuts'], show: ['newDimmer', 'leads', 'nuts'], hide: ['device', 'plate'], mv: { newDimmer: [0, 0, 0.09] } } },
        { t: 'Tug test and fold in', d: 'Tug each wire firmly at every connector one more time. Fold the connected wires into the back of the box, push the dimmer in straight, and screw it to the box until the strap sits flat.', why: 'A wire that slips out of a connector is the most common cause of a dead or arcing dimmer.', tip: 'If the dimmer won’t go in flat, rearrange the bundles to the sides of the box instead of pushing harder. A forced dimmer can crack or push a connector loose.', ok: 'All connectors held, the dimmer sits flat against the wall, and no wire is pinched.', v: { cam: [0.22, 1.28, 0.3], at: [0, 1.22, 0.02], hi: ['newDimmer'], mv: { newDimmer: [0, 0, 0] } } },
        { t: 'Power on and set the low end', d: 'Attach the plate and restore the breaker. Slide the dimmer to its lowest setting. If bulbs flicker, pulse or go out at the bottom, find the small trim dial (often behind the plate) and turn it slowly until the lowest setting is steady.', why: 'Every LED bulb dims differently. The trim dial (low-end adjustment) matches the dimmer to your bulbs.', tip: 'If the bulbs hum, try a dimmer’s reverse-phase or LED mode switch if it has one, or switch to bulbs on the dimmer maker’s compatibility list.', ok: 'The lights dim smoothly from full bright to low with no flicker or buzz at any setting.', v: { cam: [0.2, 1.28, 0.3], at: [0, 1.22, 0], hi: ['slide', 'rocker'] } },
      ],
      tricks: [
        ['Check the compatibility list', 'Dimmer makers publish lists of LED bulbs tested with each model. Choosing from it is the single best way to avoid flicker.'],
        ['Don’t mix bulb brands', 'Different LED bulbs on one dimmer dim at different rates and can flicker. Use the same bulb in every socket.'],
        ['Smart dimmers need a neutral', 'Most smart dimmers require the white neutral bundle in the box. Look before you buy.'],
        ['Warm is normal, hot is not', 'A dimmer feels warm under load. If it’s too hot to keep your hand on, it’s overloaded: remove bulbs or get a higher-rated dimmer.'],
        ['Dim-to-warm bulbs', 'Bulbs labeled “dim-to-warm” turn amber as they dim, like old incandescents. Great for dining rooms.'],
      ],
      refs: [
        ['Diva C·L dimmer installation instructions (Lutron)', 'https://assets.lutron.com/a/documents/0302209.pdf'],
        ['Wire-Nut connector instructions, strip lengths (Ideal Industries)', 'https://assets.testequity.com/te1/Documents/pdf/Ideal/Ideal_30-072_Instructions_0924.pdf'],
        ['221 Lever-Nuts handling instructions (Wago)', 'https://www.wago.com/us/221-handling-instructions'],
      ],
      learn: {
        how: 'A modern dimmer rapidly chops the AC waveform, turning power off for part of each half-cycle, 120 times a second. Less on-time means less power to the bulb. LED bulbs have their own electronics that must interpret that chopped waveform, which is why mismatched dimmers flicker or buzz.',
        specs: [['Typical LED rating', '150–250 W LED (about 600 W incandescent)'], ['Derating when ganged', 'Lower rating if side fins are snapped off (see chart)'], ['Strip length for wire nuts', 'per package, usually ⅜–½″'], ['Strip length for Wago 221', '11 mm (7/16″)']],
        terms: [['C·L / LED+', 'Rated for dimmable LED and CFL bulbs as well as incandescent.'], ['Trim (low-end adjust)', 'Sets the dimmest level so LEDs don’t flicker or shut off.'], ['Forward vs reverse phase', 'Two ways of chopping the waveform; some LEDs prefer reverse phase (ELV).'], ['Wire nut', 'A twist-on cone with a spring inside that clamps wires together.']],
        mistakes: ['Using non-dimmable bulbs.', 'Dimming a ceiling fan motor with a light dimmer.', 'Overstuffing a shallow box.', 'Adding up “equivalent” watts instead of real LED watts.'],
        tips: ['Smart dimmers usually need the neutral (white) bundle in the box. Look before you buy.'],
      },
    },
  ];

  const out = ELC('replace-outlet');
  out.variants = [
    { id: 'standard', name: 'Standard outlet', blurb: 'Regular duplex receptacle in a living space.' },
    {
      id: 'gfci',
      name: 'GFCI outlet',
      blurb: 'Kitchens, baths, garages, basements, outdoors, laundry. Has TEST/RESET buttons.',
      model: 'gfciOutlet',
      level: 2,
      time: '45–60 min',
      cost: '$15–30',
      summary: 'A GFCI protects you from shock, and it can also protect every outlet wired after it. The key is putting the incoming power on the LINE terminals.',
      intro: { hi: ['device'] },
      safety: [SAFE, NCV, 'GFCIs are deep. A shallow or crowded box may not fit one.', 'Finding the LINE pair means briefly restoring power with every wire end capped and the cables pulled apart. Never touch bare ends while power is on; use the tester probes only.'],
      causes: [['Code upgrade', 'GFCI protection is required in kitchens, bathrooms, garages, basements, crawl spaces, laundry areas, outdoors and within 6′ of sinks, tubs and showers.'], ['Old GFCI won’t reset or won’t trip', 'They wear out; replace any GFCI that fails its monthly test.'], ['No ground wire', 'A GFCI is a code-approved way to replace a two-prong outlet with no ground.']],
      tools: ['Non-contact voltage tester', 'Two-lead voltage tester or multimeter', 'Screwdrivers', 'Wire stripper', 'GFCI receptacle (15 A or 20 A, TR, WR outdoors)', 'Wire nuts', 'Colored tape and marker', '“GFCI Protected” and “No Equipment Ground” stickers (included)'],
      steps: [
        { t: 'Shut off, prove dead, and pull the old outlet', d: 'Switch off the breaker. Check your non-contact tester on a working outlet, test this outlet’s slots, and re-check the tester. Remove the plate and mounting screws and pull the outlet out about 3″. Test every wire again.', why: 'Two cables in the box means power comes in on one and continues to more outlets. You need to know which is which.', tip: 'Count the cables now. One cable means LINE only and no decision to make. Two cables means you need the next step.', ok: 'The outlet is out, every wire tests dead, and you know whether there are one or two cables.', v: { cam: [0.24, 1.12, 0.3], at: [0, 1.05, 0.04], hi: ['device', 'wires'], mv: { plate: [0.16, -0.05, 0.12], device: [0, 0, 0.08] }, tool: { id: 'voltTester', at: [0.04, 1.07, 0.09], rot: [70, 0, 0] } } },
        { t: 'Find the LINE pair', d: 'Disconnect the wires. Twist a wire nut onto each bare end, and pull the two cables apart so no end touches another. Stand back, turn the breaker on, and use a two-lead tester between each black and the bare ground. The cable reading 120 V is LINE. Turn the breaker off, verify dead, and tape-mark that pair “LINE.”', why: 'If incoming power lands on the LOAD screws, the GFCI may refuse to reset, or worse, power the face without protecting anything downstream.', tip: 'Only touch the tester probes, never the wire. Slip the probe tip just into the wire nut’s opening to reach the copper. If neither cable reads live, recheck the breaker before going further.', ok: 'Exactly one cable read about 120 V, it’s now tape-marked LINE, and the breaker is off again with the wires proven dead.', v: { cam: [0.24, 1.12, 0.3], at: [0, 1.05, 0.04], hi: ['wires'], xray: true, tool: { id: 'voltTester', at: [0.02, 1.03, 0.1], rot: [60, 0, 0] } } },
        { t: 'Connect LINE', d: 'Find the word LINE on the back of the GFCI. Black LINE wire to the brass (hot) LINE screw, white to the silver LINE screw, bare copper to green. Most GFCIs use back-wire clamps: strip ⅝″, push the straight wire into the hole and tighten the screw to 14–18 in-lb (snug, then a firm extra quarter turn).', why: 'LINE terminals feed the GFCI’s sensing circuit. They’re labeled on the back and usually sit at the bottom.', tip: 'Don’t peel off the yellow tape over the LOAD screws yet. It’s there to stop exactly the mix-up you’re avoiding.', ok: 'The marked LINE wires are clamped under the LINE screws and don’t move when tugged.', v: { cam: [0.2, 1.06, 0.24], at: [0, 1.03, 0.06], hi: ['lineTerms', 'gWires'], show: ['gfci'], hide: ['device', 'plate'], mv: { gfci: [0, 0, 0.08] }, xray: true } },
        { t: 'Connect LOAD, or pigtail to LINE', d: 'To protect downstream outlets too, peel off the yellow tape and connect the other cable to LOAD: black to brass, white to silver. To protect only this outlet, leave the tape on and join the second cable to the LINE wires with short 6″ pigtails and wire nuts.', why: 'LOAD protection is convenient, but one trip kills every outlet after it, and they all need a “GFCI Protected” sticker.', tip: 'A refrigerator or freezer on the load side can go off unnoticed after a trip. Put those on a pigtailed, separate path when you can, and check the GFCI after storms.', ok: 'The second cable is either on LOAD under the screws, or pigtailed to LINE with the yellow tape still on.', v: { cam: [0.2, 1.1, 0.24], at: [0, 1.07, 0.06], hi: ['loadTerms', 'loadTape'], show: ['loadTape'], mv: { gfci: [0, 0, 0.08] } } },
        { t: 'Mount and power on', d: 'Fold the wires in gently, push the GFCI in straight and tighten the mounting screws until it sits flat. Attach the plate and restore the breaker. Press RESET firmly; the indicator light should turn green or go out, depending on the model.', why: 'Modern GFCIs won’t reset if LINE and LOAD are reversed. It’s a built-in check on your wiring.', tip: 'If RESET won’t latch, kill power, verify dead, and swap the two cables between LINE and LOAD. If it still won’t reset, the GFCI may need power for a few seconds before it will latch.', ok: 'RESET clicks in and stays, and a lamp plugged into the GFCI lights.', v: { cam: [0.24, 1.12, 0.36], at: [0, 1.05, 0], hi: ['gfci'], mv: { gfci: [0, 0, 0] }, show: ['plate'], fx: 'power' } },
        { t: 'Test it and label', d: 'Press TEST: you’ll hear a click and the lamp goes out. Press RESET to bring it back. If you used LOAD, plug a lamp into each downstream outlet and confirm it goes out on TEST. Stick “GFCI Protected” labels on the downstream outlets.', why: 'A GFCI that won’t trip protects no one. The labels tell the next person where to look when an outlet goes dead.', tip: 'Ungrounded box? Also stick “No Equipment Ground” on this and each protected outlet; a plug-in tester will show “open ground,” which is expected, but its GFCI button won’t work, so use the TEST button instead.', ok: 'TEST clicks and kills power here and downstream; RESET restores it.', v: { cam: [0.14, 1.08, 0.2], at: [0, 1.05, 0], hi: ['test', 'reset'], fx: 'trip' } },
      ],
      tricks: [
        ['One GFCI can cover the run', 'Put the GFCI at the first outlet on the circuit and wire the rest to LOAD. One device protects them all, and only one outlet needs the bulky GFCI.'],
        ['Use a GFCI breaker for crowded boxes', 'If the box is too small, an electrician can install a GFCI breaker in the panel to protect the whole circuit instead.'],
        ['Self-test models', 'GFCIs made since 2015 self-test and blink or lock out at end of life. Still press TEST monthly.'],
        ['Find the first outlet', 'With power off, the outlet with only one cable is the end of a run. The one closest to the panel is usually the start; ask an electrician if unsure.'],
        ['Outdoors means WR and in-use covers', 'Outside, use a weather-resistant (WR) GFCI and a “bubble” in-use cover that stays closed with a plug in.'],
      ],
      learn: {
        how: 'A GFCI continuously compares the current going out on the hot wire with what comes back on the neutral. Any difference means current is leaking, perhaps through a person, so it trips in as little as about 1/40 second. LOAD terminals pass that protection to every outlet wired after it.',
        specs: [['Trip threshold', '4–6 mA (Class A)'], ['Trip time', 'about 25 ms at higher leakage'], ['Back-wire strip length', '⅝″ (Leviton)'], ['Terminal torque', '14–18 in-lb (Leviton)'], ['Test', 'Monthly']],
        terms: [['LINE', 'Incoming power from the panel.'], ['LOAD', 'Outgoing protected power to more outlets.'], ['WR / TR', 'Weather-resistant / tamper-resistant.'], ['No Equipment Ground', 'Label required when a GFCI replaces an outlet on a circuit with no ground wire.']],
        mistakes: ['Reversing LINE and LOAD.', 'Removing the LOAD tape when nothing is connected there.', 'Putting a sump pump or freezer on a GFCI without a way to notice a trip (add a water alarm or check it often; code now requires GFCI in basements and kitchens).'],
        tips: ['A GFCI is an approved fix for a two-prong outlet without a ground. Label it “No equipment ground.”'],
      },
      refs: [
        ['Wiring a GFCI or AFCI receptacle (Fine Homebuilding)', 'https://www.finehomebuilding.com/project-guides/wiring/wiring-a-gfci-or-afci-receptacle'],
        ['GFCI install and test instructions (Leviton, via InspectAPedia)', 'https://www.inspectapedia.com/electric/GFCI-Install-Test-Instructions-Leviton.pdf'],
        ['NEC 210.8 GFCI protection, 2023 (Mike Holt)', 'https://www.mikeholt.com/files/PDF/23UNEC1_210.8.pdf'],
      ],
      pro: 'Call a pro if there are more than two cables in the box, the box is too shallow, the GFCI won’t reset after correct wiring, or neither cable reads live.',
    },
  ];

  /* ================= New electrical guides ================= */
  const smokeSteps = (wired) => [
    { t: 'Press TEST on the old alarm', d: 'Set a step ladder fully open with its spreaders locked. Climb no higher than the second step from the top. Press and hold the TEST button for 5 seconds until it sounds.', why: 'A test tells you whether it’s a battery problem or a dead alarm. A weak beep, or none, means a battery or sensor problem.', tip: 'Cover your nearest ear with your free hand; alarms are 85 dB at 10′. Warn the family first, especially if alarms are interconnected and will all sound.', ok: 'You heard a loud, steady pattern of beeps, or confirmed it’s silent or weak and needs replacing.', v: { cam: [0.3, 2.05, 0.45], at: [0, 2.4, 0], hi: ['testBtn'], fx: 'test', tool: { id: 'stepLadder', at: [0.5, 0, 0.5], rot: [0, -30, 0], scale: 1 } } },
    { t: wired ? 'Shut off power, then twist it off' : 'Twist it off and read the date', d: (wired ? 'Turn off the breaker labeled smoke alarms (often the bedroom or hall lights circuit). The green power light should go out. ' : '') + 'Twist the alarm counterclockwise about ⅛ turn and lower it' + (wired ? ', then squeeze the harness latch and unplug it.' : '.') + ' Read the manufacture date on the back.', why: 'Smoke sensors slowly lose sensitivity. Replace any smoke alarm 10 years after its manufacture date, even if it still beeps.', tip: (wired ? 'The backup battery keeps the old alarm beeping even with the breaker off. Pull the battery once it’s down. ' : '') + 'If it won’t turn, look for a small locking tab or pin on the side and press it with a screwdriver.', ok: 'The alarm is in your hand and you know its date.', v: { cam: [0.28, 2.2, 0.4], at: [0, 2.3, 0], hi: ['dateLabel'], rt: { alarm: [180, 30, 0] }, mv: { alarm: [0, -0.18, 0.08] } } },
    { t: wired ? 'Swap the wiring harness' : 'Remove the old plate', d: wired ? 'Test the harness wires with a non-contact tester checked on a working outlet. Unscrew the old plate. Undo the wire nuts and connect the new harness: black to black (hot), white to white (neutral), red, orange or yellow interconnect to the house red. Cap any unused red lead alone.' : 'Unscrew the old mounting plate from the ceiling with a Phillips screwdriver. Keep the screws if the new alarm doesn’t include any.', why: wired ? 'Harness plugs are brand-specific. Use the harness that comes with the new alarm unless its maker sells a plug-in adapter for your old one.' : 'Mounting plates are brand-specific. The new alarm comes with its own.', tip: wired ? 'Interconnected alarms should all be the same brand, or listed as compatible, so they talk to each other. Twist each wire nut clockwise until tight and tug each wire.' : 'If the screws spin in the drywall, use the plastic anchors that come with the new alarm.', ok: wired ? 'Black, white and red pairs are each under a tight wire nut and nothing pulls loose when tugged.' : 'The ceiling is clear and you have screws or anchors ready.', v: { cam: [0.3, 2.1, 0.45], at: [0, 2.4, 0], hi: ['plate'], hide: ['alarm'], mv: { plate: [0, -0.15, 0.1] }, tool: { id: 'screwdriver', at: [0.045, 2.432, 0], rot: [180, 0, 0], anim: 'turn' } } },
    { t: 'Mount the new plate', d: 'Screw the new plate to the ' + (wired ? 'electrical box' : 'ceiling') + ' with its arrow or alignment mark lined up the way the instructions show. On a ceiling, keep the alarm at least 4″ from walls; on a wall, its top must be 4–12″ below the ceiling.', why: 'Smoke rises and spreads across the ceiling first. The dead-air corner where wall meets ceiling stays clear of smoke for too long.', tip: 'Keep alarms at least 10′ from the stove and 3′ from bathroom doors and heating or cooling vents to cut nuisance alarms. Near a kitchen, choose a photoelectric alarm.', ok: 'The plate is tight, level and in a spot at least 4″ from any wall.', v: { cam: [0.3, 2.1, 0.45], at: [0, 2.42, 0], hi: ['plate'], mv: { plate: [0, 0, 0] } } },
    { t: 'Activate and attach', d: (wired ? 'Tuck the wires into the box and plug the harness into the new alarm until the latch clicks. ' : '') + 'Pull the battery activation tab (or insert the batteries). Line up the alarm’s marks with the plate and twist it clockwise about ⅛ turn until it locks.', why: 'Sealed 10-year batteries ship with a tab that keeps them off until installed.', tip: 'Write the install date in pen on the alarm. Most won’t lock onto the plate until the battery is in or the tab is pulled; if it won’t seat, check that first.', ok: 'You heard or felt the alarm click into place and it doesn’t turn when you try to twist it gently.', v: { cam: [0.3, 2.15, 0.45], at: [0, 2.4, 0], hi: ['newAlarm', 'pullTab'], show: ['newAlarm', 'pullTab'], mv: { pullTab: [0.06, -0.03, 0] } } },
    { t: 'Test it, then test the rest', d: (wired ? 'Turn the breaker back on; the green power light should glow. ' : '') + 'Press and hold TEST for 5 seconds. ' + (wired ? 'Every interconnected alarm in the house should sound together.' : 'Then test every other alarm in the home.') + ' Note today’s date on your calendar for a monthly test.', why: 'Interconnected alarms wake everyone, wherever the fire starts. Monthly testing catches failures before you need the alarm.', tip: 'If it chirps right after install, press and hold TEST to clear the memory, or check the battery tab is fully out. A chirp that won’t stop on a sealed unit means end of life.', ok: (wired ? 'The green light is on and ' : '') + 'the alarm sounds loudly on TEST' + (wired ? ', with every other alarm joining in.' : '.'), v: { cam: [0.3, 2.05, 0.45], at: [0, 2.4, 0], hi: ['newAlarm'], hide: ['pullTab'], fx: 'live' } },
  ];
  const smokeLearn = {
    how: 'Photoelectric alarms shine an LED across a dark chamber; smoke particles scatter light onto a sensor. They’re best at slow, smoldering fires. Ionization alarms use a tiny radioactive source to make the air conduct a small current; smoke disrupts it. They react faster to flaming fires. CO alarms use an electrochemical cell that produces current in proportion to carbon monoxide.',
    specs: [['Replace smoke alarms', '10 years from the manufacture date'], ['Replace CO alarms', '7–10 years (check the label)'], ['Placement', 'Every bedroom, outside each sleeping area, every level including the basement'], ['Ceiling mount', '≥ 4″ from walls'], ['Wall mount', 'Top 4–12″ below the ceiling'], ['From cooking appliances', '≥ 10′'], ['From bath doors and HVAC vents', '≥ 3′'], ['Test', 'Monthly']],
    terms: [['Photoelectric', 'Light-scatter sensor; fewer cooking false alarms.'], ['Ionization', 'Fast on flaming fires; more nuisance alarms near kitchens.'], ['Interconnect', 'Red wire (or wireless link) that makes all alarms sound together.'], ['End-of-life chirp', 'A periodic chirp that doesn’t stop after a battery change: replace the unit.'], ['Harness', 'The plug-in wire connector that joins a hardwired alarm to house wiring.']],
    mistakes: ['Pulling the battery to stop nuisance alarms.', 'Mounting in the dead-air corner where wall meets ceiling.', 'Painting over an alarm.', 'Mixing brands on an interconnected system.'],
    tips: ['Install a combination smoke/CO alarm near bedrooms if you have gas appliances, a fireplace, or an attached garage.', 'Vacuum the vents yearly with a brush attachment.'],
  };
  TB.more('electrical', [
    {
      id: 'smoke-alarm',
      title: 'Replace a smoke or CO alarm',
      model: 'smokeBattery',
      level: 1,
      time: '15–30 min',
      cost: '$20–60',
      summary: 'Chirping, a failed test, or a date older than 10 years means it’s time for a new alarm. Battery units take minutes; hardwired units plug into a wiring harness on house power.',
      intro: { hi: ['alarm'] },
      safety: ['Use a step ladder with spreaders locked, not a chair, and keep your hips between the rails.', 'Only remove an alarm when you’re replacing it the same day.', 'If a CO alarm is sounding, don’t troubleshoot: get everyone outside to fresh air and call 911 or the fire department.'],
      causes: [['Chirps every minute', 'Low battery, or the end-of-life warning on sealed units.'], ['Over 10 years old', 'Sensors lose sensitivity with age.'], ['Nuisance alarms', 'Wrong type near a kitchen or bathroom, or dust and bugs inside.']],
      tools: ['Step ladder', 'Phillips screwdriver', 'New alarm (photoelectric or combination smoke/CO, UL-listed)', 'Pencil or marker', 'Drywall anchors (usually included)'],
      variants: [
        { id: 'battery', name: 'Battery alarm', blurb: '9 V, AA, or sealed 10-year battery. No wires.' },
        {
          id: 'wired',
          name: 'Hardwired (120 V)',
          blurb: 'Wired to house power with a battery backup and a plug-in harness.',
          model: 'smokeWired',
          time: '20–40 min',
          safety: ['Turn off the alarm circuit breaker before unplugging or swapping a harness, and test the wires with a tester you’ve checked on a working outlet.', 'Use a step ladder with spreaders locked, not a chair.', 'Interconnected alarms should all be the same brand (or listed compatible).'],
          tools: ['Step ladder', 'Non-contact voltage tester', 'Screwdriver', 'New hardwired alarm (same brand if possible)', 'Wire nuts'],
          steps: smokeSteps(true),
        },
      ],
      steps: smokeSteps(false),
      tricks: [
        ['Same-brand swaps are quickest', 'Buying the same brand as your other hardwired alarms often means the new one plugs into the existing harness with an adapter, and interconnect works.'],
        ['Stop the 3 a.m. chirp', 'Low batteries chirp most when the house cools at night. Replace batteries on a set date, such as a clock change, before they start.'],
        ['Upgrade to 10-year sealed', 'Sealed-battery alarms never need a battery change and can’t be “borrowed” from. They’re worth the small extra cost.'],
        ['Shower steam false alarms?', 'Move the alarm at least 3′ from the bathroom door, or use a photoelectric model.'],
        ['Clean with canned air', 'Blow out the vents with short bursts of canned air twice a year. Dust inside causes false alarms.'],
        ['Need more alarms?', 'Wireless interconnected alarms link without new wiring, so you can add one to each bedroom easily.'],
      ],
      refs: [
        ['Smoke alarm placement guidance and NFPA 72 summary (City of Albany, CA)', 'https://albanyca.gov/files/assets/city/v/1/community-development/building/documents/sd-co-handout-2019.pdf'],
        ['Firex interconnect compatibility (Kidde)', 'https://kidde.com/support/smoke-alarms/firex-interconnectivity'],
        ['Smoke alarm wiring adapter compatibility guide (First Alert)', 'https://www.firstalertstore.com/store/product-support/smoke-alarm-wiring-adapter-compatibility-guide.htm'],
        ['Are CO alarms in a home a good idea? (NC State Extension)', 'https://healthyhomes.ces.ncsu.edu/carbon-monoxide/are-co-alarms-in-a-home-a-good-idea'],
      ],
      learn: smokeLearn,
      pro: 'Call a pro if hardwired alarms keep chirping after replacement, the interconnect doesn’t work, there are no wires where an alarm is needed, or the alarm circuit breaker keeps tripping.',
    },
    {
      id: 'light-fixture',
      title: 'Replace a ceiling light fixture',
      model: 'lightFixture',
      level: 2,
      time: '45–90 min',
      cost: '$30–200',
      summary: 'Swapping a dated ceiling light is three connections: black to black, white to white, ground to green. The real work is doing it safely on a ladder with the power proven off.',
      intro: { hi: ['oldCanopy', 'oldGlobe'] },
      safety: [SAFE, NCV, 'Turn the wall switch off too, but never trust it alone; some boxes stay live with the switch off.', 'Ceiling boxes are made to hold up to 50 lb (23 kg). Heavier fixtures need a box marked for that weight or separate support.', 'Use a step ladder, not a chair, and have a helper hold heavy fixtures.'],
      causes: [['Update the look', 'The most common reason.'], ['Flickering or dead fixture', 'Worn socket or loose connection.'], ['Brittle wires', 'Old fixtures with high-watt bulbs bake their wiring. Wires older than about 1985 may be rated only 60 °C.']],
      tools: ['Non-contact voltage tester', 'Two-lead voltage tester or multimeter', 'Step ladder', 'Screwdrivers', 'Wire stripper', 'Wire nuts or lever connectors', 'New fixture (with its mounting strap)', 'Helper to hold the fixture'],
      steps: [
        { t: 'Shut off the power', d: 'Turn the light on, then switch breakers off until it goes out. Flip the wall switch off too. Let bulbs cool for 5 minutes, then unscrew them.', why: 'Two shutoffs mean a mislabeled breaker can’t surprise you. Turning the light on first shows you found the right breaker.', tip: 'Tape the breaker handle off and leave a note on the panel so no one turns it back on while you work on the ladder.', ok: 'The light went out when you flipped the breaker and stays off with the wall switch flipped on.', v: { cam: [0.55, 1.75, 0.75], at: [0, 2.3, 0], hi: ['oldGlobe'], tool: { id: 'stepLadder', at: [0.5, 0, 0.45], rot: [0, -40, 0], scale: 1 } } },
        { t: 'Remove the globe', d: 'Support the glass with one palm and unscrew the decorative knob (finial) or the side thumbscrews with the other. Lower the glass and hand it down.', why: 'Glass is the easiest part to drop. Set it on a towel.', tip: 'Glass shades often trap dead bugs. Wash them before reusing or donating.', ok: 'The glass is safely on a towel on the floor.', v: { cam: [0.5, 1.8, 0.7], at: [0, 2.3, 0], hi: ['oldGlobe'], mv: { oldGlobe: [0.5, -0.9, 0.3] } } },
        { t: 'Drop the base', d: 'Remove the screws or cap nuts holding the base (canopy) and lower it slowly. Let it hang on a wire hanger, not on its wires.', why: 'Wire connections can’t carry the fixture’s weight. Hanging it keeps them intact while you test.', tip: 'Bend a wire coat hanger into an S-hook and hook it through the box’s strap. It’s a free third hand.', ok: 'The base hangs on the hook and you can see the box and the wire connections.', v: { cam: [0.45, 2.0, 0.6], at: [0, 2.35, 0], hi: ['oldCanopy'], mv: { oldCanopy: [0, -0.12, 0] }, tool: { id: 'screwdriver', at: [0.03, 2.38, 0.02], rot: [180, 0, 0], anim: 'turn' } } },
        { t: 'Prove the wires are dead', d: 'Check your tester on a working outlet. Hold it against every wire and wire nut in the box: it must stay silent. Re-check the tester on the outlet. With the nuts off, confirm 0 V with a two-lead tester black-to-white and black-to-ground.', why: 'Some ceiling boxes carry power through to other lights; test everything in the box.', tip: 'If the tester beeps on the white wire, stop: power may be coming through another circuit. Leave the breaker off and call a pro.', ok: 'Every wire reads dead and the tester still works on the live outlet.', v: { cam: [0.4, 2.1, 0.55], at: [0, 2.35, 0], hi: ['houseWires'], mv: { oldCanopy: [0, -0.12, 0] }, tool: { id: 'voltTester', at: [0.03, 2.33, 0.03], rot: [180, 0, 0] } } },
        { t: 'Disconnect and remove the old strap', d: 'Unscrew the wire nuts counterclockwise and separate the wires. Unscrew the ground. Remove the old fixture and the old strap.', why: 'The new fixture’s strap matches its own screw spacing.', tip: 'Bend each house wire gently. If insulation cracks or flakes, the wires are heat-damaged; snip the end and see if fresh insulation is sound. If not, stop and call a pro.', ok: 'The box is empty except for the house wires, with clean, flexible insulation.', v: { cam: [0.4, 2.1, 0.55], at: [0, 2.38, 0], hi: ['houseWires', 'box'], hide: ['oldCanopy', 'oldStrap'] } },
        { t: 'Install the new strap', d: 'Screw the new strap (crossbar) to the box ears with the supplied #8-32 screws. Make sure its green ground screw is there.', why: 'The strap carries the fixture and gives the ground wire a home.', tip: 'If the box screw holes are stripped, use a slightly longer #8-32 screw or re-tap the hole. Don’t substitute wood screws.', ok: 'The strap is tight and level, with the green screw facing down.', v: { cam: [0.35, 2.15, 0.5], at: [0, 2.42, 0], hi: ['newStrap'], show: ['newStrap'], tool: { id: 'screwdriver', at: [0.044, 2.43, 0], rot: [180, 0, 0], anim: 'turn' } } },
        { t: 'Make the connections', d: 'Ground first: house bare copper and fixture green both under the green screw. Then white to white and black to black: hold each pair with insulation even and twist a wire nut clockwise until tight. Tug each wire.', why: 'Ground first means if anything goes wrong later, fault current has a safe path from the start.', tip: 'Fixture leads are stranded. Let the stranded wire extend about ⅛″ past the solid house wire so the nut grips both. Lever connectors are a great beginner option.', ok: 'All three connections hold firm and no copper shows below any wire nut.', v: { cam: [0.35, 2.15, 0.5], at: [0, 2.38, 0], hi: ['newLeads', 'nuts'], show: ['newLeads', 'nuts'] } },
        { t: 'Mount the fixture', d: 'Fold the wires up into the box, ground first, then lift the base over the threaded posts and secure it with the cap nuts or screws.', why: 'Pinched wires between the base and ceiling can cut insulation and short out.', tip: 'If the base won’t sit flat, the wires are bunched in the way. Push them deeper into the box toward the sides.', ok: 'The base sits flat against the ceiling with no wire showing.', v: { cam: [0.45, 1.95, 0.65], at: [0, 2.4, 0], hi: ['newCanopy'], show: ['newCanopy'], hide: ['newLeads', 'nuts'] } },
        { t: 'Bulbs, shade, power', d: 'Read the max-watt label inside the socket and install bulbs at or below it (LED is easiest). Attach the shade. Peel the breaker tape off, turn the breaker on, and flip the wall switch a few times.', why: 'The max-watt label protects the socket wiring from heat.', tip: 'LED bulbs at 9–12 W give 60–100 W worth of light with far less heat, which protects old ceiling wiring.', ok: 'The light turns on and off with the switch and the shade sits straight.', v: { cam: [0.55, 1.75, 0.75], at: [0, 2.32, 0], hi: ['newShade'], show: ['newBulbs', 'newShade'], fx: 'lit' } },
      ],
      tricks: [
        ['Pre-assemble on the floor', 'Assemble arms, shades and the chain on a table first, so the ladder work is only wiring and mounting.'],
        ['Hang it on a hook', 'An S-hook made from a coat hanger holds the fixture while you wire it, so you’re not juggling it.'],
        ['Check for 90 °C wire', 'Many new fixtures say “use supply wires rated 90 °C.” Old 60 °C wires in a ceiling box may need a pro.'],
        ['Use LEDs', 'LED bulbs run much cooler and protect the box wiring.'],
        ['Fixture won’t sit flat?', 'Add a ceiling medallion or a larger canopy to cover old paint lines or an uneven ceiling.'],
      ],
      refs: [
        ['Code Q&A: boxes at ceiling outlets (EC&M)', 'https://www.ecmweb.com/qa/code-qa-boxes-ceiling-suspended-fan-outlets'],
        ['Min. 90 °C supply conductors discussion (Mike Holt forums)', 'https://forums.mikeholt.com/threads/min-90c-supply-conductors.141372/post-2211965'],
        ['Wire-Nut connector instructions, strip lengths (Ideal Industries)', 'https://assets.testequity.com/te1/Documents/pdf/Ideal/Ideal_30-072_Instructions_0924.pdf'],
        ['Should we use non-contact voltage testers? (Electrical Contractor Magazine)', 'https://www.ecmag.com/magazine/articles/article-detail/should-we-use-noncontact-voltage-testers-the-benefits-and-drawbacks-of-these-handy-tools'],
      ],
      learn: {
        how: 'The ceiling box is fed by a cable from the switch or another fixture. The switch interrupts the black (hot) wire, so the fixture gets power only when it’s on. The white neutral completes the circuit back to the panel, and the bare ground gives fault current a safe path to trip the breaker.',
        specs: [['Max weight on a standard ceiling box', '50 lb (23 kg)'], ['Strip for wire nuts', 'per package, usually ⅜–½″'], ['Strap screws', '#8-32'], ['Warm white', '2700–3000 K'], ['Supply wire rating many fixtures need', '90 °C']],
        terms: [['Crossbar / strap', 'Metal bar that holds the fixture to the box.'], ['Canopy / pan', 'The part that covers the box.'], ['Wire nut', 'Twist-on connector that joins wires.']],
        mistakes: ['Trusting the wall switch alone.', 'Letting the fixture hang by its wires.', 'Skipping the ground because “it worked before.”', 'Using bulbs larger than the fixture’s rating.'],
        tips: ['A wire coat hanger hooked into the box makes a free third hand.', 'Fixtures over 50 lb need a box marked for that weight.'],
      },
      pro: 'Call a pro if wires crumble when bent, there’s no box (just a hole), there are several cables in the box you can’t identify, or the fixture weighs more than 50 lb.',
    },
    {
      id: 'ceiling-fan',
      title: 'Install a ceiling fan',
      model: 'ceilingFan',
      level: 3,
      time: '2–3 hrs',
      cost: '$100–400',
      summary: 'Most of the job is making sure the box can hold a spinning 15–50 lb fan. With a fan-rated box and brace in place, it’s assembly and three or four wire connections.',
      intro: { hi: ['oldLight', 'oldBox'] },
      safety: [SAFE, NCV, 'A light-only box can work loose under a fan’s constant vibration. Use a box marked “Acceptable for fan support” (rated up to 70 lb).', 'Blades must be at least 7′ (2.1 m) above the floor; 8–9′ is ideal.', 'Keep blade tips at least 18″ from walls (some makers ask 30″); check your manual.'],
      causes: [['Comfort', 'A fan lets you set the thermostat about 4 °F higher in summer.'], ['Replacing a wobbly fan', 'Often a non-rated box, loose blade screws, or unbalanced blades.']],
      tools: ['Non-contact voltage tester', 'Two-lead voltage tester or multimeter', 'Step ladder', 'Screwdrivers', 'Wire stripper', 'Fan-rated brace and box', 'Wire nuts', 'Balancing kit (included)', 'Helper'],
      steps: [
        { t: 'Shut off power and remove the old light', d: 'Switch off the breaker and the wall switch. Check your tester on a working outlet, test every wire in the ceiling box, and re-check the tester. Then remove the old fixture.', why: 'The same live-dead-live check as any fixture swap keeps you safe on a ladder.', tip: 'Hang the old fixture from an S-hook made of coat-hanger wire while you disconnect it, so it doesn’t pull on the wires.', ok: 'Every wire tests dead and the old fixture is on the floor.', v: { cam: [1.0, 1.6, 1.3], at: [0, 2.3, 0], hi: ['oldLight'], mv: { oldLight: [0.6, -1.2, 0.4] }, tool: { id: 'voltTester', at: [0.03, 2.32, 0.03], rot: [180, 0, 0] } } },
        { t: 'Check the box', d: 'Look inside the box for the words “Acceptable for fan support” and a weight rating. A plain light box, a shallow pancake box without that marking, or a plastic box must be replaced.', why: 'A fan wobbles constantly. Boxes made only for lights loosen and can fall.', tip: 'Push up on the box with firm hand pressure. If it shifts at all, it isn’t solid enough for a fan even if it’s marked.', ok: 'You found the fan-rating mark and the box doesn’t move when pushed, or you know you need a new brace.', v: { cam: [0.4, 2.1, 0.55], at: [0, 2.44, 0], hi: ['oldBox'], hide: ['oldLight'] } },
        { t: 'Install a fan brace', d: 'Remove the old box. Slide the expanding brace bar through the hole and rest its feet on the top of the drywall. Spin the bar until its teeth bite into the joists on both sides. Hang the new fan box from it with the U-bolt and nuts.', why: 'The brace spreads the fan’s weight and vibration onto two joists.', tip: 'Wrap tape around the bar’s end so it doesn’t mark the drywall as it spins. Turn until it’s snug, then another quarter turn.', ok: 'The brace is tight between both joists and the box doesn’t move when you pull down hard.', v: { cam: [0.5, 2.0, 0.7], at: [0, 2.48, 0], hi: ['brace'], show: ['brace'], hide: ['oldBox'], xray: true } },
        { t: 'Attach the bracket', d: 'Feed the house wires through the center of the fan’s hanger bracket. Screw the bracket to the box with the machine screws and lock washers from the fan box or brace kit, rounded side of the bracket down. Tighten with a hand screwdriver until snug and the lock washers flatten.', why: 'The bracket carries the whole spinning fan. Fan-box screws and lock washers are made for that load and resist vibrating loose.', tip: 'Tighten each screw a little at a time, alternating sides, so the bracket sits flat. If a screw won’t bite, the box threads are stripped: use the longer screws from the brace kit, never a wood screw.', ok: 'The bracket is tight to the box and doesn’t wobble.', v: { cam: [0.4, 2.1, 0.55], at: [0, 2.42, 0], hi: ['bracket'], show: ['bracket'], tool: { id: 'screwdriver', at: [0.05, 2.43, 0], rot: [180, 0, 0], anim: 'turn' } } },
        { t: 'Hang the motor', d: 'On the floor, feed the fan’s wires up through the downrod. Slide the canopy and ball onto the rod, push the downrod pin through the motor collar, snap the cotter clip through the pin, and tighten the set screws hard. Lift the motor with a helper, seat the ball in the bracket and rotate it until the slot drops over the tab with a clunk.', why: 'The bracket holds the fan while you wire it, so your hands are free.', tip: 'Tighten the downrod set screws fully; a loose set screw is a top cause of wobble.', ok: 'The fan hangs from the bracket and doesn’t turn when you nudge it.', v: { cam: [0.9, 1.9, 1.1], at: [0, 2.3, 0], hi: ['fanMotor'], show: ['fanMotor'] } },
        { t: 'Wire it', d: 'Ground first: the fan’s green lead, the bracket’s green lead and the house bare copper together under a wire nut or the green screw. Then white to white. Then the fan’s black (motor) and blue (light) together to the house black, or blue to a red wire if the box has a second switched hot. Twist each nut clockwise until tight and tug every wire.', why: 'With one switch, fan and light share power and you pick them with the pull chains or remote. A red wire from a two-switch box lets each have its own switch.', tip: 'If there’s a remote receiver, wire it in between the house wires and the fan per its diagram, then tuck it into the bracket.', ok: 'Each connection holds firm and no copper shows below any nut.', v: { cam: [0.4, 2.1, 0.55], at: [0, 2.36, 0], hi: ['fanWires', 'nuts'], show: ['fanWires', 'nuts'] } },
        { t: 'Canopy up', d: 'Fold the connected wires up into the box, greens and whites to one side and blacks to the other. Slide the canopy up over the bracket and line up its screw holes or keyhole slots, then tighten the screws until it sits snug to the ceiling.', why: 'If there’s a remote receiver, it goes in the bracket before the canopy.', tip: 'Make sure no wire is pinched between the canopy and bracket before tightening.', ok: 'The canopy sits flat and centered against the ceiling.', v: { cam: [0.6, 2.0, 0.8], at: [0, 2.38, 0], hi: ['canopy'], show: ['canopy'], hide: ['fanWires', 'nuts'] } },
        { t: 'Attach the blades', d: 'Fasten each blade to its blade iron (the metal arm) with the screws and rubber washers supplied. Then attach each iron to the underside of the motor. Start every screw by hand, then tighten them all firmly with a screwdriver, not a drill.', why: 'One loose blade screw is the most common cause of wobble.', tip: 'Start all the screws by hand before tightening any, so the holes line up.', ok: 'Every blade sits at the same height and no screw is loose.', v: { cam: [1.3, 1.6, 1.6], at: [0, 2.2, 0], hi: ['blades'], show: ['blades'] } },
        { t: 'Light kit and test', d: 'Connect the light kit’s plug to the plug hanging from the motor until it clicks, screw the kit on, then add bulbs and the glass. Restore the breaker, turn on the wall switch, and run the fan on low, medium and high for a minute each.', why: 'Running on high shakes out anything loose before you walk away, and checking every speed confirms the capacitor and wiring are right.', tip: 'Nothing happens? Make sure the wall switch is on, pull each chain once (the fan may be set to off), and check that the remote and receiver dip switches or pairing match. A humming fan that won’t spin usually has a blade touching something.', ok: 'The fan runs at every speed and the light turns on.', v: { cam: [1.4, 1.5, 1.7], at: [0, 2.2, 0], hi: ['lightKit'], show: ['lightKit'], fx: 'spinLit' } },
        { t: 'Balance and set direction', d: 'Some wobble shows only on high. First tighten every blade screw again. If it still wobbles, clip the balancing clip to the middle of one blade at a time and run the fan; the blade where wobble drops most gets the stick-on weight. Then set direction with the switch on the motor: counterclockwise (looking up) for summer.', why: 'Counterclockwise pushes air down for a cooling breeze. Clockwise on low in winter pulls air up and mixes warm air from the ceiling.', tip: 'Measure each blade tip’s height from the ceiling first; a bent blade iron causes wobble that weights can’t fix.', ok: 'The fan runs smoothly on high with no visible wobble.', v: { cam: [1.2, 1.7, 1.5], at: [0, 2.2, 0], hi: ['blades'], fx: 'spin' } },
      ],
      tricks: [
        ['Pick the right size', 'Rooms up to 144 sq ft take a 42–48″ fan; 144–225 sq ft take 50–54″; bigger rooms take 56″ or more, or two fans.'],
        ['Hugger for low ceilings', 'With ceilings under 8′, use a hugger (flush) fan so blades stay at least 7′ above the floor. Ceilings over 9′ need a longer downrod.'],
        ['Check the box before you shop', 'Pop the old light down and look for the fan-support marking first. If you need a brace, buy it with the fan so the job happens in one trip.'],
        ['Remote saves rewiring', 'One switch but you want separate fan and light control? A remote receiver in the canopy does it without new wires.'],
        ['Never use a light dimmer', 'A light dimmer makes a fan motor hum and overheat. Use a fan speed control rated for the fan’s amps.'],
        ['Wobble that won’t quit', 'Check that the downrod ball is fully seated, the set screws are tight, and every blade tip is the same height from the ceiling (measure with a tape). Swap blades between irons if one is warped.'],
      ],
      refs: [
        ['Code Q&A: boxes at ceiling-suspended fan outlets (EC&M)', 'https://www.ecmweb.com/qa/code-qa-boxes-ceiling-suspended-fan-outlets'],
        ['Room measurements (Hunter Fan support)', 'https://support.hunterfan.com/hc/en-us/articles/115001396534'],
        ['Ceiling fan direction for summer and winter (Hunter Fan)', 'https://hunterfan.com/blogs/hunter-blog/ceiling-fan-direction-for-summer-and-winter'],
        ['Westinghouse ceiling fan installation manual (Lowe’s)', 'https://pdf.lowes.com/productdocuments/f40fd28e-b07a-49e7-943b-eae73ce54daf/85424762.pdf'],
      ],
      learn: {
        how: 'A ceiling fan doesn’t cool air. It moves it, so sweat evaporates faster and you feel 4–8 °F cooler. Blade pitch (the tilt) sets how much air each turn moves; the motor’s capacitor sets the speeds. Because it spins, any imbalance turns into a wobble that loosens screws and boxes over time, which is why fan-rated boxes exist.',
        specs: [['Min blade height', '7′ (2.1 m); 8–9′ ideal'], ['Clearance to walls', '≥ 18″ (Hunter: 30″)'], ['Room up to 144 sq ft', '42–48″ fan'], ['Room 144–225 sq ft', '50–54″ fan'], ['Fan-rated box max', '70 lb; over 35 lb must be marked'], ['Blade pitch', '12–15°']],
        terms: [['Downrod', 'Pipe that sets the fan’s drop from the ceiling.'], ['Hugger / flush mount', 'Fan without a downrod, for low ceilings.'], ['Blade iron', 'Metal arm that attaches a blade to the motor.'], ['Fan-rated box', 'Box listed to support a fan (up to 70 lb).']],
        mistakes: ['Reusing a light-only box.', 'Controlling a fan with a regular dimmer.', 'Skipping the lock washers.', 'Leaving downrod set screws loose.'],
        tips: ['Measure ceiling height minus fan height before buying; a 9″ fan on an 8′ ceiling leaves 7′3″.'],
      },
      pro: 'Call a pro if there’s no box, the ceiling is plaster over joists you can’t find, the fan weighs over 70 lb, or you want separate switches added for fan and light.',
    },
  ]);
})();
