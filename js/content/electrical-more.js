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
  const SAFE = 'Turn off the breaker, then confirm the circuit is dead with a non-contact voltage tester on every wire before touching anything.';

  const sw = ELC('replace-switch');
  sw.variants = [
    { id: 'single', name: 'Single-pole', blurb: 'One switch controls the light. ON/OFF printed on the toggle, two brass screws.' },
    {
      id: 'threeway',
      name: '3-way',
      blurb: 'Two switches control one light (stairs, hallways). No ON/OFF marks; one dark screw.',
      model: 'switch3way',
      level: 2,
      time: '30–45 min',
      summary: 'A 3-way switch has three terminals: one dark COMMON screw and two brass TRAVELERS. Get the common wire right and the rest is easy.',
      intro: { hi: ['common', 'travA', 'travB'] },
      safety: [SAFE, 'Both 3-way switches may be fed from different circuits in older homes. Test every wire in the box, not just the ones on the switch.'],
      causes: [['Worn contacts', 'Crackling, or the light works from one switch but not the other.'], ['Loose traveler', 'Light only works in some switch combinations.'], ['Wrong replacement', 'A single-pole switch won’t work here.']],
      tools: ['Non-contact voltage tester', 'Screwdrivers', 'New 3-way switch (same amp rating)', 'Needle-nose pliers', 'Colored tape'],
      steps: [
        { t: 'Kill power and verify', d: 'Turn off the breaker and test every wire in the box with a non-contact tester.', why: 'There may be more than one circuit in the box.', v: { cam: [0.22, 1.3, 0.34], at: [0, 1.22, 0], hi: ['plate'], tool: { id: 'voltTester', at: [0.025, 1.24, 0.01], rot: [70, 0, 0] } } },
        { t: 'Remove plate and pull the switch', d: 'Unscrew the plate and the two strap screws, then pull the switch straight out by the strap.', why: 'Hold the strap, not the toggle, so the wires don’t pull off their screws.', v: { cam: [0.24, 1.3, 0.3], at: [0, 1.22, 0.04], hi: ['device'], mv: { plate: [0.15, -0.05, 0.12], device: [0, 0, 0.08] }, tool: { id: 'screwdriver', at: [0, 1.267, 0.09], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Find and mark the COMMON', d: 'Find the dark (black-oxide) screw, often labeled COM. Wrap colored tape on the wire attached to it.', why: 'The common is the wire that either brings power in or sends it to the light. It’s the only one that must go to a specific screw.', v: { cam: [-0.14, 1.24, 0.24], at: [-0.01, 1.2, 0.07], hi: ['common', 'labels'], show: ['labels'] } },
        { t: 'Move the travelers', d: 'Move the two traveler wires (often red and black) to the two brass screws on the new switch. Either one can go on either brass screw.', why: 'Travelers just carry power between the two switches. The switch picks one or the other, so their order doesn’t matter.', v: { cam: [0.16, 1.26, 0.2], at: [0.015, 1.22, 0.07], hi: ['travA', 'travB'], xray: true } },
        { t: 'Connect the common and ground', d: 'Hook the tape-marked wire clockwise around the dark COMMON screw. Connect bare copper to the green screw.', why: 'If common and traveler get swapped, the light will only work in some switch positions.', v: { cam: [-0.12, 1.2, 0.2], at: [0, 1.2, 0.07], hi: ['common', 'groundScrew'], xray: true } },
        { t: 'Mount and test both switches', d: 'Fold the wires in, mount the switch and plate, restore power. Try all four combinations of the two switches.', why: 'Every combination should toggle the light. If one doesn’t, the common is on the wrong screw.', v: { cam: [0.22, 1.3, 0.34], at: [0, 1.22, 0], hi: ['toggle'], mv: { device: [0, 0, 0], plate: [0, 0, 0] } } },
      ],
      learn: {
        how: 'Two 3-way switches are connected by a pair of traveler wires. Each switch connects its common terminal to one traveler or the other. When both switches pick the same traveler, the circuit is complete and the light is on. Flip either one and the path breaks. That’s why there’s no ON or OFF position.',
        specs: [['Typical cable between switches', '14/3 or 12/3 (black, red, white + ground)'], ['Terminals', '1 common, 2 travelers, 1 ground']],
        terms: [['Common (COM)', 'Dark screw; line in on one switch, load out on the other.'], ['Travelers', 'Two wires running between the 3-way switches.'], ['4-way switch', 'Goes between two 3-ways to add a third control location.']],
        mistakes: ['Buying a single-pole switch.', 'Disconnecting all wires before marking the common.', 'Assuming white is always neutral. In 3-way runs a white wire is often re-marked as a traveler.'],
        tips: ['If the light only works in some combinations, swap the common with one traveler on one switch.'],
      },
      pro: 'There are four or more switches controlling one light, wires are re-taped in confusing colors, or you can’t find a common.',
    },
    {
      id: 'dimmer',
      name: 'Add a dimmer',
      blurb: 'Swap a toggle for an LED-rated dimmer with wire leads.',
      model: 'dimmerSwitch',
      level: 2,
      time: '30–45 min',
      cost: '$20–60',
      summary: 'Most dimmers have wire leads instead of screws, joined to house wires with wire nuts. Pick a dimmer rated for LED bulbs or you’ll get flicker and buzz.',
      intro: { hi: ['device'] },
      safety: [SAFE, 'Dimmers get warm. Check the box size; dimmers are bulky and the box must not be overstuffed.'],
      causes: [['Flicker with LEDs', 'Old dimmers expect incandescent loads.'], ['Want mood lighting', 'Dimmers also extend bulb life.']],
      tools: ['Non-contact voltage tester', 'Screwdrivers', 'LED-rated (C·L) dimmer', 'Wire stripper', 'Wire nuts (usually included)', 'Dimmable LED bulbs'],
      steps: [
        { t: 'Check bulbs and rating', d: 'Confirm the bulbs say “dimmable” and add up their watts. Choose a dimmer whose LED rating is higher.', why: 'LED dimmers list two ratings, like 150 W LED / 600 W incandescent. Use the LED number.', v: { cam: [0.22, 1.3, 0.34], at: [0, 1.22, 0], hi: ['device'] } },
        { t: 'Kill power and verify', d: 'Breaker off. Test with a non-contact tester.', why: 'Switch boxes often share circuits with outlets elsewhere.', v: { cam: [0.22, 1.3, 0.34], at: [0, 1.22, 0], hi: ['plate'], tool: { id: 'voltTester', at: [0.025, 1.24, 0.01], rot: [70, 0, 0] } } },
        { t: 'Remove the old switch', d: 'Take off the plate, unscrew the strap, pull the switch out and disconnect both wires and the ground.', why: 'Straighten the hooked wire ends with pliers; trim and re-strip ½″ if they’re nicked.', v: { cam: [0.24, 1.3, 0.3], at: [0, 1.22, 0.04], hi: ['device'], mv: { plate: [0.15, -0.05, 0.12], device: [0.2, -0.05, 0.15] } } },
        { t: 'Join the leads', d: 'Twist each black dimmer lead with one house wire under a wire nut, clockwise until the insulation twists. Green lead to bare copper. Cap the red lead if it’s a single-pole install.', why: 'On a single-pole dimmer, the two black leads are interchangeable. The red is only for 3-way use.', v: { cam: [0.18, 1.24, 0.24], at: [0.0, 1.21, 0.04], hi: ['leads', 'nuts'], show: ['newDimmer', 'leads', 'nuts'], hide: ['device', 'plate'], mv: { newDimmer: [0, 0, 0.09] } } },
        { t: 'Tug test and fold in', d: 'Tug each wire under the nuts. Fold everything back behind the dimmer and screw it to the box.', why: 'A wire that slips out of a nut is the most common cause of a dead or arcing dimmer.', v: { cam: [0.22, 1.28, 0.3], at: [0, 1.22, 0.02], hi: ['newDimmer'], mv: { newDimmer: [0, 0, 0] } } },
        { t: 'Power on and set the low end', d: 'Restore power. If bulbs flicker at the bottom of the slide, use the trim dial (behind the plate) to raise the minimum.', why: 'Every LED bulb dims differently; trim matches the dimmer to your bulbs.', v: { cam: [0.2, 1.28, 0.3], at: [0, 1.22, 0], hi: ['slide', 'rocker'] } },
      ],
      learn: {
        how: 'A modern dimmer rapidly chops the AC waveform, turning power off for part of each half-cycle (120 times a second). Less on-time means less power to the bulb. LED bulbs have their own electronics that must interpret that chopped waveform, which is why mismatched dimmers flicker or buzz.',
        specs: [['Typical LED rating', '150–250 W LED'], ['Derating when ganged', 'Lose 10–20% capacity if fins are snapped off'], ['Strip length', '½″ for wire nuts']],
        terms: [['C·L / LED-rated', 'Works with both CFL/LED and incandescent.'], ['Trim (low-end adjust)', 'Sets the dimmest level.'], ['Forward vs reverse phase', 'Two ways of chopping the waveform; some LEDs prefer reverse (ELV).']],
        mistakes: ['Using non-dimmable bulbs.', 'Dimming a ceiling fan motor with a light dimmer.', 'Overstuffing a shallow box.'],
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
      blurb: 'Kitchens, baths, garages, outdoors, laundry. Has TEST/RESET buttons.',
      model: 'gfciOutlet',
      level: 2,
      time: '45–60 min',
      cost: '$15–30',
      summary: 'A GFCI protects you from shock, and it can also protect every outlet after it. The key is putting the incoming power on the LINE terminals.',
      intro: { hi: ['device'] },
      safety: [SAFE, 'GFCIs are deep. A shallow or crowded box may not fit one.', 'Identifying the LINE pair means briefly restoring power with wire ends capped and separated. Never touch bare ends while power is on.'],
      causes: [['Code upgrade', 'GFCI protection is required in kitchens, baths, garages, laundry and outdoors.'], ['Old GFCI won’t reset', 'They wear out; most last 10–15 years.']],
      tools: ['Non-contact voltage tester', 'Screwdrivers', 'Wire stripper', 'GFCI receptacle (15 A or 20 A, TR, WR outdoors)', 'Wire nuts', 'Colored tape', '“GFCI Protected” stickers'],
      steps: [
        { t: 'Kill power and pull the old outlet', d: 'Breaker off, test, remove the plate and pull the outlet out.', why: 'Two cables in the box means power comes in on one and continues on to more outlets.', v: { cam: [0.24, 1.12, 0.3], at: [0, 1.05, 0.04], hi: ['device', 'wires'], mv: { plate: [0.16, -0.05, 0.12], device: [0, 0, 0.08] }, tool: { id: 'voltTester', at: [0.04, 1.07, 0.09], rot: [70, 0, 0] } } },
        { t: 'Find the LINE pair', d: 'Disconnect all wires. Cap each bare end and separate the two cables. Restore power briefly and use the tester to see which black wire is live. Kill power again and tape-mark that pair LINE.', why: 'If incoming power lands on LOAD, the GFCI may still give power but it won’t protect anything.', v: { cam: [0.24, 1.12, 0.3], at: [0, 1.05, 0.04], hi: ['wires'], xray: true, tool: { id: 'voltTester', at: [0.02, 1.03, 0.1], rot: [60, 0, 0] } } },
        { t: 'Connect LINE', d: 'Black LINE wire to the brass LINE screw, white to silver LINE, bare copper to green. Many GFCIs use back-wire clamps: insert straight and tighten.', why: 'LINE terminals are labeled on the back and are usually the bottom pair.', v: { cam: [0.2, 1.06, 0.24], at: [0, 1.03, 0.06], hi: ['lineTerms', 'gWires'], show: ['gfci'], hide: ['device', 'plate'], mv: { gfci: [0, 0, 0.08] }, xray: true } },
        { t: 'Connect LOAD (optional)', d: 'To protect downstream outlets, peel off the yellow tape and connect the other pair to LOAD. To protect only this outlet, leave the tape on and join the downstream pair to the LINE wires with pigtails.', why: 'LOAD protection is convenient, but one trip will kill every outlet after it.', v: { cam: [0.2, 1.1, 0.24], at: [0, 1.07, 0.06], hi: ['loadTerms', 'loadTape'], show: ['loadTape'], mv: { gfci: [0, 0, 0.08] } } },
        { t: 'Mount and power on', d: 'Fold wires in, mount the GFCI, attach the plate and restore power. The light shows green when it’s ready.', why: 'Many GFCIs won’t reset at all if line and load are reversed. That’s a built-in check.', v: { cam: [0.24, 1.12, 0.36], at: [0, 1.05, 0], hi: ['gfci'], mv: { gfci: [0, 0, 0] }, show: ['plate'], fx: 'power' } },
        { t: 'Test it', d: 'Press TEST: it should click and kill power. Press RESET to restore. Put “GFCI Protected” stickers on downstream outlets.', why: 'Test monthly. A GFCI that won’t trip is not protecting anyone.', v: { cam: [0.14, 1.08, 0.2], at: [0, 1.05, 0], hi: ['test', 'reset'], fx: 'trip' } },
      ],
      learn: {
        how: 'A GFCI continuously compares the current going out on the hot wire with what comes back on the neutral. Any difference means current is leaking, perhaps through a person, so it trips in about 1/40 second. LOAD terminals pass that protection to every outlet wired after it.',
        specs: [['Trip threshold', '4–6 mA'], ['Trip time', '< 25 ms'], ['Life', '10–15 years'], ['Test', 'Monthly']],
        terms: [['LINE', 'Incoming power from the panel.'], ['LOAD', 'Outgoing protected power to more outlets.'], ['WR / TR', 'Weather-resistant / tamper-resistant.']],
        mistakes: ['Reversing LINE and LOAD.', 'Removing the LOAD tape when nothing is connected there.', 'Installing a GFCI on a refrigerator or sump-pump circuit where nuisance trips could cause damage unnoticed.'],
        tips: ['A GFCI is an approved fix for a two-prong outlet without a ground. Label it “No equipment ground.”'],
      },
      pro: 'There are more than two cables in the box, the box is too shallow, or the GFCI won’t reset after correct wiring.',
    },
  ];

  /* ================= New electrical guides ================= */
  const smokeSteps = (wired) => [
    { t: 'Press TEST', d: 'From a sturdy step ladder, press and hold the TEST button until it sounds.', why: 'Test monthly. A weak beep or none at all means a battery or sensor problem.', v: { cam: [0.3, 2.05, 0.45], at: [0, 2.4, 0], hi: ['testBtn'], fx: 'test', tool: { id: 'stepLadder', at: [0.5, 0, 0.5], rot: [0, -30, 0], scale: 1 } } },
    { t: 'Twist it off and read the date', d: 'Twist the alarm counterclockwise off its plate' + (wired ? ' and unplug the harness by squeezing its latch.' : '.') + ' Check the date label on the back.', why: 'Smoke sensors degrade. Replace any alarm 10 years from its manufacture date, even if it still beeps.', v: { cam: [0.28, 2.2, 0.4], at: [0, 2.3, 0], hi: ['dateLabel'], rt: { alarm: [180, 30, 0] }, mv: { alarm: [0, -0.18, 0.08] } } },
    { t: 'Remove the old plate', d: 'Unscrew the old mounting plate.' + (wired ? ' Leave the harness wires connected in the box only if the new alarm uses the same brand’s connector; otherwise kill the breaker and swap the harness.' : ''), why: 'Plates are brand-specific. The new alarm comes with its own.', v: { cam: [0.3, 2.1, 0.45], at: [0, 2.4, 0], hi: ['plate'], hide: ['alarm'], mv: { plate: [0, -0.15, 0.1] }, tool: { id: 'screwdriver', at: [0.045, 2.432, 0], rot: [180, 0, 0], anim: 'turn' } } },
    { t: 'Mount the new plate', d: 'Screw the new plate to the ceiling (or box) with the arrow pointing the same way as the alarm’s alignment mark.', why: 'Ceilings are best: smoke rises. Keep it 4″ (10 cm) from walls and away from vents and bathroom doors.', v: { cam: [0.3, 2.1, 0.45], at: [0, 2.42, 0], hi: ['plate'], mv: { plate: [0, 0, 0] } } },
    { t: 'Activate and attach', d: (wired ? 'Plug the harness into the new alarm. ' : '') + 'Pull the battery activation tab, line up the marks and twist the alarm clockwise until it locks.', why: 'Sealed 10-year batteries ship with a tab that keeps them off until installed.', v: { cam: [0.3, 2.15, 0.45], at: [0, 2.4, 0], hi: ['newAlarm', 'pullTab'], show: ['newAlarm', 'pullTab'], mv: { pullTab: [0.06, -0.03, 0] } } },
    { t: 'Test, and test the rest', d: 'Press TEST. ' + (wired ? 'Every interconnected alarm in the house should sound together.' : 'Then test every other alarm in the home.') + ' Write today’s date inside the battery door or on the base.', why: 'Interconnected alarms wake everyone, wherever the fire starts.', v: { cam: [0.3, 2.05, 0.45], at: [0, 2.4, 0], hi: ['newAlarm'], hide: ['pullTab'], fx: 'live' } },
  ];
  const smokeLearn = {
    how: 'Photoelectric alarms shine an LED across a dark chamber; smoke particles scatter light onto a sensor. They’re best at slow, smoldering fires. Ionization alarms use a tiny radioactive source to ionize air; smoke disrupts the current. They react faster to flaming fires. CO alarms use an electrochemical cell that produces current in proportion to carbon monoxide.',
    specs: [['Replace smoke alarms', 'Every 10 years'], ['Replace CO alarms', 'Every 7–10 years (check label)'], ['Placement', 'Every bedroom, outside sleeping areas, every level'], ['Distance from wall', '≥ 4″ (10 cm)'], ['Test', 'Monthly']],
    terms: [['Photoelectric', 'Light-scatter sensor; fewer cooking false alarms.'], ['Ionization', 'Fast on flaming fires; more nuisance alarms near kitchens.'], ['Interconnect', 'Red wire (or wireless) that makes all alarms sound together.'], ['End-of-life chirp', 'A periodic chirp that doesn’t stop after a battery change: replace the unit.']],
    mistakes: ['Pulling the battery to stop nuisance alarms.', 'Mounting in the dead-air corner where wall meets ceiling.', 'Painting over an alarm.'],
    tips: ['Install a combination smoke/CO alarm near bedrooms if you have gas appliances or an attached garage.', 'Vacuum the vents yearly with a brush attachment.'],
  };
  TB.more('electrical', [
    {
      id: 'smoke-alarm',
      title: 'Replace a smoke or CO alarm',
      model: 'smokeBattery',
      level: 1,
      time: '15–30 min',
      cost: '$20–60',
      summary: 'Chirping, a failed test, or a date older than 10 years means it’s time for a new alarm. Battery units take minutes; hardwired units plug into a harness.',
      intro: { hi: ['alarm'] },
      safety: ['Use a step ladder, not a chair.', 'Only remove an alarm when you’re replacing it the same day.'],
      causes: [['Chirps every minute', 'Low battery, or end-of-life warning on sealed units.'], ['Over 10 years old', 'Sensors lose sensitivity.'], ['Nuisance alarms', 'Wrong type near a kitchen, or dust inside.']],
      tools: ['Step ladder', 'Phillips screwdriver', 'New alarm (photoelectric or combination smoke/CO)', 'Pencil'],
      variants: [
        { id: 'battery', name: 'Battery alarm', blurb: '9 V, AA, or sealed 10-year battery. No wires.' },
        {
          id: 'wired',
          name: 'Hardwired (120 V)',
          blurb: 'Wired to house power with a battery backup and a plug-in harness.',
          model: 'smokeWired',
          time: '20–40 min',
          safety: ['Turn off the alarm circuit breaker before swapping a harness.', 'Use a step ladder, not a chair.', 'Interconnected alarms should all be the same brand (or listed compatible).'],
          tools: ['Step ladder', 'Non-contact voltage tester', 'Screwdriver', 'New hardwired alarm (same brand if possible)', 'Wire nuts'],
          steps: smokeSteps(true),
        },
      ],
      steps: smokeSteps(false),
      learn: smokeLearn,
      pro: 'Hardwired alarms keep chirping after replacement, the interconnect doesn’t work, or you need alarms added where there’s no wiring.',
    },
    {
      id: 'light-fixture',
      title: 'Replace a ceiling light fixture',
      model: 'lightFixture',
      level: 2,
      time: '45–90 min',
      cost: '$30–200',
      summary: 'Swapping a dated ceiling light is three wires: black to black, white to white, ground to green. The work is in doing it safely on a ladder.',
      intro: { hi: ['oldCanopy', 'oldGlobe'] },
      safety: [SAFE, 'Turn the wall switch off too; a mis-labeled breaker can still feed the light.', 'Fixtures over 50 lb (23 kg) need independent support, not just the box.'],
      causes: [['Update the look', 'The most common reason.'], ['Flickering or dead fixture', 'Worn socket, brittle wiring from heat.'], ['Brittle wires', 'Old fixtures with high-watt bulbs bake their wiring.']],
      tools: ['Non-contact voltage tester', 'Step ladder', 'Screwdrivers', 'Wire stripper', 'Wire nuts', 'New fixture (with its strap)', 'Helper to hold the fixture'],
      steps: [
        { t: 'Kill power at the breaker', d: 'Switch the light off and turn off the breaker. Remove bulbs once they’re cool.', why: 'Two shutoffs mean a mislabeled breaker can’t surprise you.', v: { cam: [0.55, 1.75, 0.75], at: [0, 2.3, 0], hi: ['oldGlobe'], tool: { id: 'stepLadder', at: [0.5, 0, 0.45], rot: [0, -40, 0], scale: 1 } } },
        { t: 'Remove the globe', d: 'Unscrew the finial at the bottom and lower the glass.', why: 'Glass is the easiest part to drop. Set it on a towel.', v: { cam: [0.5, 1.8, 0.7], at: [0, 2.3, 0], hi: ['oldGlobe'], mv: { oldGlobe: [0.5, -0.9, 0.3] } } },
        { t: 'Drop the base', d: 'Remove the screws or cap nuts holding the base and lower it, letting it hang on its wires.', why: 'Have a helper hold it or hook it on a wire coat hanger so the wires don’t carry its weight.', v: { cam: [0.45, 2.0, 0.6], at: [0, 2.35, 0], hi: ['oldCanopy'], mv: { oldCanopy: [0, -0.12, 0] }, tool: { id: 'screwdriver', at: [0.03, 2.38, 0.02], rot: [180, 0, 0], anim: 'turn' } } },
        { t: 'Test the bare wires', d: 'Hold the tester to the black wire and the wire nuts. It must stay silent.', why: 'Some ceiling boxes carry power through to other lights; test everything in the box.', v: { cam: [0.4, 2.1, 0.55], at: [0, 2.35, 0], hi: ['houseWires'], mv: { oldCanopy: [0, -0.12, 0] }, tool: { id: 'voltTester', at: [0.03, 2.33, 0.03], rot: [180, 0, 0] } } },
        { t: 'Disconnect and remove the old strap', d: 'Unscrew the wire nuts, separate the wires and take the old fixture and strap down.', why: 'The new fixture’s strap matches its own screw spacing.', v: { cam: [0.4, 2.1, 0.55], at: [0, 2.38, 0], hi: ['houseWires', 'box'], hide: ['oldCanopy', 'oldStrap'] } },
        { t: 'Install the new strap', d: 'Screw the new crossbar to the box ears. Make sure its green screw is there for the ground.', why: 'The strap carries the fixture and gives the ground wire a home.', v: { cam: [0.35, 2.15, 0.5], at: [0, 2.42, 0], hi: ['newStrap'], show: ['newStrap'], tool: { id: 'screwdriver', at: [0.044, 2.43, 0], rot: [180, 0, 0], anim: 'turn' } } },
        { t: 'Make the connections', d: 'Ground first: house bare copper and fixture green both under the green screw. Then white to white and black to black with wire nuts, twisted clockwise. Tug each one.', why: 'Ground first means if anything is wrong later, a fault has a safe path from the start.', v: { cam: [0.35, 2.15, 0.5], at: [0, 2.38, 0], hi: ['newLeads', 'nuts'], show: ['newLeads', 'nuts'] } },
        { t: 'Mount the fixture', d: 'Fold the wires into the box, lift the pan over the threaded posts and secure it.', why: 'Don’t pinch wires between the pan and the ceiling.', v: { cam: [0.45, 1.95, 0.65], at: [0, 2.4, 0], hi: ['newCanopy'], show: ['newCanopy'], hide: ['newLeads', 'nuts'] } },
        { t: 'Bulbs, shade, power', d: 'Install bulbs no larger than the fixture’s rating, attach the shade, restore power and switch on.', why: 'The max-watt label protects the socket wiring from heat.', v: { cam: [0.55, 1.75, 0.75], at: [0, 2.32, 0], hi: ['newShade'], show: ['newBulbs', 'newShade'], fx: 'lit' } },
      ],
      learn: {
        how: 'The ceiling box is fed by a cable from the switch or another fixture. The switch interrupts the black (hot) wire, so the fixture gets power only when it’s on. The white neutral completes the circuit back to the panel, and the bare ground gives fault current a safe path to trip the breaker.',
        specs: [['Max weight on a standard box', '50 lb (23 kg)'], ['Strip for wire nuts', '½″ (13 mm)'], ['Strap screws', '#8-32'], ['Warm white', '2700–3000 K']],
        terms: [['Crossbar / strap', 'Metal bar that holds the fixture to the box.'], ['Canopy / pan', 'The part that covers the box.'], ['Wire nut', 'Twist-on connector that joins wires.']],
        mistakes: ['Trusting the wall switch alone.', 'Letting the fixture hang by its wires.', 'Skipping the ground because “it worked before.”'],
        tips: ['A wire coat hanger hooked into the box makes a free third hand.', 'Fixtures over 50 lb need a box marked for that weight.'],
      },
      pro: 'Wires crumble when bent, there’s no box (just a hole), or there are several cables in the box you can’t identify.',
    },
    {
      id: 'ceiling-fan',
      title: 'Install a ceiling fan',
      model: 'ceilingFan',
      level: 3,
      time: '2–3 hrs',
      cost: '$100–400',
      summary: 'Most of the job is making sure the box can hold a spinning, 15–50 lb fan. With a fan-rated brace in place, it’s assembly and three or four wire connections.',
      intro: { hi: ['oldLight', 'oldBox'] },
      safety: [SAFE, 'A light-only box can work loose under a fan’s vibration. Use a box marked “Acceptable for fan support.”', 'Blades must be at least 7 ft (2.1 m) above the floor.'],
      causes: [['Comfort', 'A fan lets you set the thermostat about 4 °F higher in summer.'], ['Replacing a wobbly fan', 'Often a non-rated box or unbalanced blades.']],
      tools: ['Non-contact voltage tester', 'Step ladder', 'Screwdrivers', 'Wire stripper', 'Fan-rated brace box', 'Wire nuts', 'Balancing kit (included)', 'Helper'],
      steps: [
        { t: 'Kill power and remove the old light', d: 'Breaker off, test, then remove the old fixture.', why: 'Same steps as any fixture swap.', v: { cam: [1.0, 1.6, 1.3], at: [0, 2.3, 0], hi: ['oldLight'], mv: { oldLight: [0.6, -1.2, 0.4] }, tool: { id: 'voltTester', at: [0.03, 2.32, 0.03], rot: [180, 0, 0] } } },
        { t: 'Check the box', d: 'Look inside for “Acceptable for fan support” and the weight rating. Plastic or light-only boxes must come out.', why: 'A fan wobbles constantly. Boxes made for lights aren’t built for that.', v: { cam: [0.4, 2.1, 0.55], at: [0, 2.44, 0], hi: ['oldBox'], hide: ['oldLight'] } },
        { t: 'Install a fan brace', d: 'Remove the old box. Slide the expanding brace through the hole, rest it on the ceiling and spin the bar until its teeth bite into the joists. Hang the new box from it.', why: 'The brace spreads the fan’s weight and vibration onto two joists.', v: { cam: [0.5, 2.0, 0.7], at: [0, 2.48, 0], hi: ['brace'], show: ['brace'], hide: ['oldBox'], xray: true } },
        { t: 'Attach the bracket', d: 'Screw the fan’s hanger bracket to the box with the supplied machine screws and lock washers.', why: 'Use the fan’s screws, not the old fixture’s. They’re rated for the load.', v: { cam: [0.4, 2.1, 0.55], at: [0, 2.42, 0], hi: ['bracket'], show: ['bracket'], tool: { id: 'screwdriver', at: [0.05, 2.43, 0], rot: [180, 0, 0], anim: 'turn' } } },
        { t: 'Hang the motor', d: 'Thread the wires through the downrod, pin the downrod to the motor, and seat the ball in the bracket. Turn it until the ball’s slot locks on the tab.', why: 'The bracket holds the fan while you wire it, so your hands are free.', v: { cam: [0.9, 1.9, 1.1], at: [0, 2.3, 0], hi: ['fanMotor'], show: ['fanMotor'] } },
        { t: 'Wire it', d: 'Green fan lead and house ground to the bracket’s green screw. White to white. Black (fan) and blue (light) together to the house black, or to separate switch wires if you have two.', why: 'With one switch, both fan and light are powered together and you control them with the pull chains or remote.', v: { cam: [0.4, 2.1, 0.55], at: [0, 2.36, 0], hi: ['fanWires', 'nuts'], show: ['fanWires', 'nuts'] } },
        { t: 'Canopy up', d: 'Fold the wires into the box and screw the canopy over the bracket.', why: 'If there’s a remote receiver, it goes in the bracket before the canopy.', v: { cam: [0.6, 2.0, 0.8], at: [0, 2.38, 0], hi: ['canopy'], show: ['canopy'], hide: ['fanWires', 'nuts'] } },
        { t: 'Attach the blades', d: 'Screw each blade to its iron, then each iron to the motor. Tighten all screws evenly.', why: 'One loose blade screw is the most common cause of wobble.', v: { cam: [1.3, 1.6, 1.6], at: [0, 2.2, 0], hi: ['blades'], show: ['blades'] } },
        { t: 'Light kit and test', d: 'Plug in the light kit, add bulbs and the glass, restore power and run each speed.', why: 'Run it on high for a minute; anything loose will show.', v: { cam: [1.4, 1.5, 1.7], at: [0, 2.2, 0], hi: ['lightKit'], show: ['lightKit'], fx: 'spinLit' } },
        { t: 'Balance and set direction', d: 'If it wobbles, clip the balancing weight to one blade at a time to find the worst, then stick the weight where wobble is least. Set counterclockwise (looking up) for summer.', why: 'Counterclockwise pushes air down for a cooling breeze. Clockwise on low in winter pulls air up and mixes warm air from the ceiling.', v: { cam: [1.2, 1.7, 1.5], at: [0, 2.2, 0], hi: ['blades'], fx: 'spin' } },
      ],
      learn: {
        how: 'A ceiling fan doesn’t cool air. It moves it, so sweat evaporates faster and you feel 4–8 °F cooler. Blade pitch (the tilt) sets how much air each turn moves; the motor’s capacitor sets the speeds. Because it spins, any imbalance turns into a wobble that loosens screws and boxes over time, which is why fan-rated boxes exist.',
        specs: [['Min blade height', '7 ft (2.1 m); 8–9 ft ideal'], ['Clearance to walls', '≥ 18″ (46 cm)'], ['Room up to 144 sq ft', '42–48″ fan'], ['Room 144–225 sq ft', '50–54″ fan'], ['Blade pitch', '12–15°']],
        terms: [['Downrod', 'Pipe that sets the fan’s drop from the ceiling.'], ['Hugger / flush mount', 'Fan without a downrod, for low ceilings.'], ['Blade iron', 'Metal arm that attaches a blade to the motor.'], ['Fan-rated box', 'Box listed to support a fan (usually up to 35–70 lb).']],
        mistakes: ['Reusing a light-only box.', 'Controlling a fan with a regular dimmer.', 'Skipping the lock washers.'],
        tips: ['Measure ceiling height minus fan height before buying; a 9″ fan on an 8 ft ceiling leaves 7′3″.'],
      },
      pro: 'There’s no box, the ceiling is plaster over joists you can’t find, or you want separate switches added for fan and light.',
    },
  ]);
})();
