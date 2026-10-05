/* APL · Appliances: washer drain (front / top load), range hood filters, oven bake element. Real meters (unit: 1). */
(function () {
  const LAUNDRY = { env: 'studio', unit: 1, tex: ['white_plaster_02', 'floor_tiles_06'], ground: { tex: 'floor_tiles_06', repeat: 5, radius: 4 } };
  const KITCHEN = { env: 'studio', unit: 1, tex: ['white_plaster_02', 'plank_flooring', 'granite_tile', 'oak_wood_planks'], ground: { tex: 'plank_flooring', repeat: 4, radius: 4 } };
  const v = (base, o) => Object.assign({}, base, o);
  const wall = (K, z, w) => K.box(null, [w || 3.2, 2.44, 0.02], K.std(0xeeebe5, { roughness: 0.92 }), [0, 1.22, z], null, 0);
  const enamel = (K, c) => K.std(c || 0xf4f4f1, { roughness: 0.3, metalness: 0.05 });

  /* ---- Front-load washer ---- */
  TB.model('washerFront', v(LAUNDRY, { cam: [0.9, 0.7, 1.4], at: [0, 0.45, 0], hidden: ['pan', 'towels', 'debris'] }), (K) => {
    wall(K, -0.5);
    const body = K.part('body', [0, 0, 0], null, 'Front-load washer');
    const white = enamel(K);
    K.box(body, [0.686, 0.95, 0.78], white, [0, 0.49, -0.05], null, 0.02);
    K.box(body, [0.686, 0.12, 0.02], K.std(0xdfe3e7, { roughness: 0.3 }), [0, 0.9, 0.345], null, 0.005);
    K.cyl(body, [0.035, 0.035, 0.03, 32], 'chrome', [0.16, 0.9, 0.36], [90, 0, 0]);
    K.box(body, [0.18, 0.05, 0.004], 'screen', [-0.05, 0.9, 0.357], null, 0.003);
    K.box(body, [0.14, 0.06, 0.02], 'offwhite', [-0.24, 0.9, 0.35], null, 0.004);
    const door = K.part('door', [0, 0.52, 0.35], null, 'Door');
    K.tor(door, [0.2, 0.035], 'chrome', [0, 0, 0.02], [0, 0, 0]);
    K.cyl(door, [0.19, 0.19, 0.02, 48], K.std(0xaab8c4, { transparent: true, opacity: 0.45, roughness: 0.05 }), [0, 0, 0.01], [90, 0, 0]);
    const water = K.part('tubWater', [0, 0.4, 0.0], null, 'Water left in the drum');
    K.cyl(water, [0.24, 0.24, 0.5, 32], 'water', [0, 0, 0], [90, 0, 0]);
    const panel = K.part('panel', [-0.25, 0.08, 0.346], null, 'Access panel');
    K.box(panel, [0.16, 0.11, 0.008], white, [0, 0, 0], null, 0.003);
    const cap = K.part('filterCap', [-0.25, 0.08, 0.33], null, 'Drain pump filter');
    K.cyl(cap, [0.04, 0.04, 0.03, 32], 'lightgrey', [0, 0, 0], [90, 0, 0]);
    K.box(cap, [0.07, 0.014, 0.02], 'lightgrey', [0, 0, 0.018], null, 0.004);
    const basket = K.group(cap, [0, 0, -0.06]);
    K.cyl(basket, [0.032, 0.032, 0.09, 24, true], K.std(0xd0d4d8, { transparent: true, opacity: 0.8 }), [0, 0, 0], [90, 0, 0]);
    const deb = K.part('debris', [0, 0, -0.06], cap, 'Coins, hair, a sock…');
    K.cyl(deb, [0.012, 0.012, 0.002, 16], 'brass', [0.01, 0.0, 0.0], [90, 0, 0]);
    K.sph(deb, 0.022, K.std(0x5b6f95, { roughness: 1 }), [-0.01, -0.005, -0.02], [1, 0.6, 1.4]);
    const dh = K.part('drainHose', [-0.17, 0.06, 0.33], null, 'Emergency drain hose');
    K.tube(dh, [[0, 0, -0.03], [0, 0, 0.0], [0.0, -0.02, 0.03]], 0.007, 'black');
    K.cyl(dh, [0.009, 0.009, 0.015, 12], 'dark', [0, -0.03, 0.035], [0, 0, 0]);
    const pan = K.part('pan', [-0.2, 0, 0.5], null, 'Shallow pan');
    K.box(pan, [0.3, 0.004, 0.2], 'steel', [0, 0.002, 0], null, 0);
    [[0, 0.1], [0, -0.1]].forEach(([x, z]) => K.box(pan, [0.3, 0.04, 0.004], 'steel', [x, 0.02, z], null, 0));
    [[0.15, 0], [-0.15, 0]].forEach(([x]) => K.box(pan, [0.004, 0.04, 0.2], 'steel', [x, 0.02, 0], null, 0));
    const stream = K.cyl(pan, [0.004, 0.006, 0.05, 10], 'water', [0.03, 0.04, -0.12]);
    stream.userData.noPick = true;
    const towels = K.part('towels', [0, 0.01, 0.5], null, 'Towels');
    K.box(towels, [0.6, 0.02, 0.28], K.std(0x9ec5e8, { roughness: 1 }), [0.2, 0, 0.05], null, 0.008);
    const cord = K.part('plug', [0.3, 0.3, -0.48], null, 'Power cord');
    K.box(cord, [0.07, 0.11, 0.01], 'offwhite', [0, 0, 0], null, 0.003);
    K.tube(cord, [[0, 0, 0.01], [-0.05, -0.15, 0.03], [-0.15, -0.2, 0.05]], 0.004, 'dark');
    return {
      tick(t, fx) {
        stream.visible = fx === 'drain';
        if (stream.visible) stream.scale.y = 0.7 + 0.3 * Math.sin(t * 18);
      },
    };
  });

  /* ---- Top-load washer with standpipe ---- */
  TB.model('washerTop', v(LAUNDRY, { assets: ['wooden_bucket_01'], cam: [1.3, 1.4, 1.5], at: [0, 0.65, -0.2], hidden: ['bail'] }), (K) => {
    wall(K, -0.75);
    const white = enamel(K);
    const body = K.part('body', [0, 0, 0], null, 'Top-load washer');
    K.box(body, [0.69, 0.9, 0.68], white, [0, 0.45, 0], null, 0.02);
    K.box(body, [0.69, 0.16, 0.1], white, [0, 0.98, -0.3], null, 0.02);
    K.cyl(body, [0.035, 0.035, 0.03, 24], 'chrome', [0.2, 0.99, -0.24], [90, 0, 0]);
    K.box(body, [0.16, 0.05, 0.004], 'screen', [-0.05, 0.99, -0.248], null, 0.003);
    K.cyl(body, [0.27, 0.27, 0.02, 48], 'dark', [0, 0.905, 0.02]);
    const lid = K.part('lid', [0, 0.905, -0.25], null, 'Lid (open)');
    K.box(lid, [0.62, 0.02, 0.56], K.std(0xb7c6d2, { transparent: true, opacity: 0.6, roughness: 0.1 }), [0, 0, 0.28], null, 0.01);
    lid.rotation.x = -80 * K.DEG;
    const tub = K.part('tubWater', [0, 0.8, 0.02], null, 'Water left in the tub');
    K.cyl(tub, [0.25, 0.25, 0.04, 40], 'water', [0, 0, 0]);
    const ls = K.part('lidSwitch', [0.27, 0.915, -0.22], null, 'Lid switch / lock');
    K.box(ls, [0.04, 0.012, 0.03], 'dark', [0, 0, 0], null, 0.003);
    // drain hose over the back into a standpipe
    const hose = K.part('drainHose', [0, 0, 0], null, 'Drain hose');
    K.tube(hose, [[0.15, 0.2, -0.34], [0.2, 0.25, -0.45], [0.28, 0.45, -0.5], [0.3, 0.65, -0.56], [0.35, 0.95, -0.62], [0.38, 1.05, -0.66], [0.4, 0.98, -0.68]], 0.016, K.std(0x6d7279, { roughness: 0.7 }));
    const kink = K.part('kink', [0.28, 0.45, -0.5], null, 'Kink behind the washer');
    K.sph(kink, 0.024, 'red', [0, 0, 0], [1, 0.6, 1]);
    const box = K.part('standpipe', [0.4, 0.85, -0.73], null, 'Standpipe + outlet box');
    K.box(box, [0.2, 0.28, 0.06], 'offwhite', [0, 0, 0], null, 0.006);
    K.cyl(box, [0.026, 0.026, 0.3, 24, true], 'pvc', [0, 0.02, 0.02]);
    [-0.06, 0.06].forEach((x, i) => {
      K.cyl(box, [0.012, 0.012, 0.04, 12], 'brass', [x - 0.4 + 0.4, 0.1, 0.035], [90, 0, 0]);
      K.box(box, [0.03, 0.012, 0.012], i ? 'red' : 'blue', [x, 0.13, 0.05], null, 0.003);
    });
    const bail = K.part('bail', [0.5, 0, 0.5], null, 'Bucket + cup');
    K.glb(bail, 'wooden_bucket_01', { height: 0.3 }, [0, 0, 0]) || K.cyl(bail, [0.14, 0.12, 0.3, 24], 'grey', [0, 0.15, 0]);
    const pump = K.part('pump', [0.1, 0.12, 0.0], null, 'Drain pump (behind the front panel)');
    K.cyl(pump, [0.05, 0.05, 0.08, 20], 'dark', [0, 0, 0], [0, 0, 90]);
  });

  /* ---- Kitchen range with hood ---- */
  function range(K, opts) {
    const ss = K.std(0xc9ccd0, { metalness: 0.85, roughness: 0.32 });
    const black = K.std(0x15171a, { roughness: 0.15 });
    const r = K.part('range', [0, 0, 0], null, 'Electric range');
    if (opts && opts.openDoor) {
      // shell around an open oven cavity (x ±0.31, y 0.2–0.635, z −0.24…0.33)
      K.box(r, [0.76, 0.2, 0.66], ss, [0, 0.1, 0], null, 0.01);
      K.box(r, [0.76, 0.265, 0.66], ss, [0, 0.7675, 0], null, 0.01);
      [-1, 1].forEach((sx) => K.box(r, [0.07, 0.435, 0.66], ss, [sx * 0.345, 0.4175, 0], null, 0.004));
      K.box(r, [0.62, 0.435, 0.09], ss, [0, 0.4175, -0.285], null, 0.004);
    } else K.box(r, [0.76, 0.9, 0.66], ss, [0, 0.45, 0], null, 0.01);
    K.box(r, [0.76, 0.012, 0.66], black, [0, 0.906, 0], null, 0.004);
    [[-0.19, -0.14, 0.11], [0.19, -0.14, 0.09], [-0.19, 0.16, 0.08], [0.19, 0.16, 0.11]].forEach(([x, z, rr]) => K.tor(r, [rr, 0.004], K.std(0x3a2a22, { roughness: 0.4 }), [x, 0.913, z], [90, 0, 0]));
    K.box(r, [0.76, 0.13, 0.06], ss, [0, 0.97, -0.3], null, 0.01);
    K.rep(5, (i) => K.cyl(r, [0.02, 0.02, 0.02, 24], 'dark', [-0.3 + i * 0.15, 0.97, -0.265], [90, 0, 0]));
    if (!opts || !opts.openDoor) {
      K.box(r, [0.7, 0.5, 0.03], ss, [0, 0.5, 0.34], null, 0.01);
      K.box(r, [0.5, 0.25, 0.005], black, [0, 0.52, 0.357], null, 0.004);
      K.cyl(r, [0.012, 0.012, 0.6, 16], 'chrome', [0, 0.73, 0.39], [0, 0, 90]);
    }
    return r;
  }
  function counters(K) {
    const top = K.pbr('granite_tile', [1, 0.6], { roughness: 0.35 }, 'offwhite');
    const cab = K.pbr('oak_wood_planks', [0.6, 1], { color: 0xece7de }, 'offwhite');
    [-1, 1].forEach((s) => {
      K.box(null, [0.9, 0.87, 0.6], cab, [s * 0.84, 0.435, -0.02], null, 0.006);
      K.box(null, [0.92, 0.035, 0.64], top, [s * 0.84, 0.89, 0], null, 0.006);
      K.box(null, [0.9, 0.7, 0.33], cab, [s * 0.84, 1.95, -0.155], null, 0.006);
    });
    K.box(null, [2.6, 0.55, 0.01], K.pbr('floor_tiles_06', [3, 0.7], {}, 'offwhite'), [0, 1.18, -0.315], null, 0);
  }

  TB.model('rangeHood', v(KITCHEN, { cam: [0.9, 1.25, 1.3], at: [0, 1.5, 0], tex: KITCHEN.tex.concat(['floor_tiles_06']), hidden: ['soak'] }), (K) => {
    wall(K, -0.33);
    counters(K);
    range(K);
    const ss = K.std(0xc9ccd0, { metalness: 0.85, roughness: 0.32 });
    const hood = K.part('hood', [0, 1.62, -0.06], null, 'Range hood');
    K.ext(hood, [[-0.38, 0], [0.38, 0], [0.38, 0.06], [0.14, 0.24], [-0.14, 0.24], [-0.38, 0.06]], 0.5, ss, [0, 0, -0.25], null, 0.005);
    K.box(hood, [0.28, 0.6, 0.24], ss, [0, 0.54, -0.12], null, 0.004);
    K.box(hood, [0.12, 0.02, 0.006], 'dark', [0.2, 0.03, 0.252], null, 0.002);
    const lights = K.part('hoodLights', [0, 1.618, 0], null, 'Hood lights');
    [-0.28, 0.28].forEach((x) => K.cyl(lights, [0.025, 0.025, 0.004, 24], K.std(0xfff4d6, { emissive: 0xfff1c8, emissiveIntensity: 0.6 }), [x, 0, -0.06]));
    const filters = K.part('filters', [0, 1.615, -0.06], null, 'Grease filters');
    const fl = (x, name) => {
      const f = K.part(name, [x, 0, 0], filters, 'Mesh grease filter');
      K.box(f, [0.27, 0.006, 0.4], 'steel', [0, 0, 0], null, 0.002);
      K.rep(9, (i) => K.box(f, [0.25, 0.007, 0.006], K.std(0x9aa1a7, { metalness: 0.8, roughness: 0.5 }), [0, -0.001, -0.18 + i * 0.045], null, 0));
      const g = K.part(name + 'Grease', [0, -0.004, 0], f, 'Grease buildup');
      K.box(g, [0.25, 0.002, 0.38], K.std(0x8a6a2a, { transparent: true, opacity: 0.55, roughness: 0.3 }), [0, 0, 0], null, 0);
      const latch = K.part(name + 'Latch', [0, -0.006, 0.185], f, 'Release latch');
      K.box(latch, [0.06, 0.008, 0.018], 'dark', [0, 0, 0], null, 0.003);
      return f;
    };
    fl(-0.14, 'filterL');
    fl(0.14, 'filterR');
    const soak = K.part('soak', [0.84, 0.91, 0.05], null, 'Hot water + degreasing dish soap + baking soda');
    K.box(soak, [0.55, 0.14, 0.42], K.std(0xf0f2f4, { roughness: 0.3, transparent: true, opacity: 0.9 }), [0, 0.07, 0], null, 0.02);
    K.box(soak, [0.5, 0.01, 0.38], K.std(0xd8e9f0, { transparent: true, opacity: 0.7, roughness: 0.05 }), [0, 0.1, 0], null, 0);
  });

  /* ---- Oven cavity with a hidden-terminal bake element ---- */
  TB.model('ovenElement', v(KITCHEN, { cam: [0.6, 0.75, 1.0], at: [0, 0.3, 0], hidden: ['newElement'] }), (K) => {
    wall(K, -0.33);
    counters(K);
    range(K, { openDoor: true });
    const enamelBlue = K.std(0x2b3442, { roughness: 0.3, emissive: 0x10141c });
    const cav = K.part('cavity', [0, 0, 0], null, 'Oven cavity');
    K.box(cav, [0.62, 0.42, 0.01], enamelBlue, [0, 0.42, -0.24], null, 0);
    K.box(cav, [0.01, 0.42, 0.55], enamelBlue, [-0.31, 0.42, 0.03], null, 0);
    K.box(cav, [0.01, 0.42, 0.55], enamelBlue, [0.31, 0.42, 0.03], null, 0);
    K.box(cav, [0.62, 0.01, 0.55], enamelBlue, [0, 0.2, 0.03], null, 0);
    K.box(cav, [0.62, 0.01, 0.55], enamelBlue, [0, 0.635, 0.03], null, 0);
        const door = K.part('door', [0, 0.17, 0.34], null, 'Oven door (open)');
    const dg = K.group(door, [0, 0, 0], [-88, 0, 0]);
    K.box(dg, [0.7, 0.5, 0.05], K.std(0xc9ccd0, { metalness: 0.85, roughness: 0.32 }), [0, 0.25, 0.02], null, 0.01);
    K.box(dg, [0.5, 0.25, 0.005], K.std(0x15171a, { roughness: 0.15 }), [0, 0.27, -0.006], null, 0.004);
    const racks = K.part('racks', [0, 0.36, 0.03], null, 'Oven racks');
    [0, 0.12].forEach((yy) => {
      K.rep(10, (i) => K.cyl(racks, [0.003, 0.003, 0.5, 6], 'chrome', [-0.27 + i * 0.06, yy, 0], [90, 0, 0]));
      K.cyl(racks, [0.004, 0.004, 0.58, 6], 'chrome', [0, yy, 0.25], [0, 0, 90]);
      K.cyl(racks, [0.004, 0.004, 0.58, 6], 'chrome', [0, yy, -0.25], [0, 0, 90]);
    });
    const elem = K.part('element', [0, 0.225, 0], null, 'Bake element');
    const loop = [[-0.18, 0, -0.235], [-0.18, 0, 0.18], [-0.12, 0, 0.22], [0.12, 0, 0.22], [0.18, 0, 0.18], [0.18, 0, -0.06], [0.08, 0, -0.1], [0.04, 0, -0.235]];
    const elemMat = K.std(0x4a4d52, { metalness: 0.5, roughness: 0.6, emissive: 0xff3a10, emissiveIntensity: 0 });
    K.tube(elem, loop, 0.0045, elemMat);
    K.tube(elem, [[-0.18, 0, -0.235], [-0.18, 0, -0.2]], 0.0045, elemMat);
    const plate = K.part('elemPlate', [-0.07, 0.01, -0.235], elem, 'Mounting plate + 2 screws');
    K.box(plate, [0.17, 0.04, 0.004], 'steel', [0, 0, 0], null, 0);
    [-0.07, 0.07].forEach((x) => K.screw(plate, 0.004, 0.006, 'steel', [x, 0, 0.004], [-90, 0, 0]));
    const burn = K.part('burnSpot', [0.12, 0.004, 0.22], elem, 'Blistered, burned-through spot');
    K.sph(burn, 0.008, K.std(0xd8d0c0, { roughness: 1 }), [0, 0, 0], [1.3, 0.8, 1]);
    const terms = K.part('terminals', [-0.07, 0.235, -0.26], null, 'Terminals + wires behind the back wall');
    [-0.11, -0.04].forEach((dx) => {
      K.box(terms, [0.008, 0.012, 0.03], 'steel', [dx + 0.07 - 0.07, 0, 0], null, 0);
    });
    K.tube(terms, [[-0.11, 0, -0.015], [-0.12, 0.02, -0.06], [-0.1, 0.06, -0.09]], 0.003, K.std(0xf0e8d0, { roughness: 0.8 }));
    K.tube(terms, [[-0.04, 0, -0.015], [-0.04, 0.02, -0.06], [-0.03, 0.06, -0.09]], 0.003, 'red');
    const ne = K.part('newElement', [0, 0.225, 0.02], null, 'New bake element');
    K.tube(ne, loop, 0.0045, K.std(0x5a5e63, { metalness: 0.5, roughness: 0.5 }));
    return { tick: (t, fx) => (elemMat.emissiveIntensity = fx === 'glow' ? 0.9 + 0.1 * Math.sin(t * 3) : 0) };
  });

  /* ================= Guides ================= */
  const frontSteps = [
    { t: 'Unplug and prep', d: 'Unplug the washer. Lay towels down and set a shallow pan near the bottom-left corner.', why: 'A full drum can hold 2–5 gallons. The pan will need emptying several times.', v: { cam: [0.9, 0.7, 1.4], at: [0, 0.45, 0], hi: ['plug', 'tubWater'], show: ['towels', 'pan'], xray: true } },
    { t: 'Open the access panel', d: 'Press or pry the small door at the bottom front corner.', why: 'Some models hide the filter behind the whole kick plate. Check your manual.', v: { cam: [0.4, 0.3, 0.8], at: [-0.25, 0.1, 0.3], hi: ['panel'], mv: { panel: [0, -0.06, 0.12] }, rt: { panel: [-70, 0, 0] } } },
    { t: 'Drain through the small hose', d: 'Pull out the emergency drain hose, aim it into the pan, and remove its plug. Re-plug it each time the pan fills.', why: 'Unscrewing the big filter with water in the drum dumps it all on the floor at once.', v: { cam: [0.45, 0.25, 0.85], at: [-0.18, 0.05, 0.4], hi: ['drainHose'], fx: 'drain' } },
    { t: 'Unscrew the filter', d: 'Turn the filter cap counterclockwise slowly. Pull it straight out.', why: 'Expect some water even after draining. Keep a towel tight below it.', v: { cam: [0.4, 0.25, 0.8], at: [-0.25, 0.08, 0.36], hi: ['filterCap'], show: ['debris'], hide: ['tubWater'], mv: { filterCap: [0, 0, 0.15] }, rt: { filterCap: [0, 0, 60] } } },
    { t: 'Clean filter and pump', d: 'Pull out hair, lint, coins and socks. Rinse the filter. Shine a light into the opening and turn the pump impeller with a finger. It should move freely.', why: 'Most “won’t drain” calls are a sock or coins jamming the pump.', v: { cam: [0.35, 0.22, 0.7], at: [-0.25, 0.08, 0.42], hi: ['debris'], mv: { filterCap: [0.15, -0.05, 0.25] } } },
    { t: 'Reinstall and test', d: 'Thread the filter back in until hand tight, re-plug the drain hose, close the panel and run a drain/spin cycle. Check for drips.', why: 'Cross-threading the cap is the classic leak after this job. It should turn smoothly.', v: { cam: [0.9, 0.7, 1.4], at: [0, 0.45, 0], hi: ['filterCap', 'panel'], hide: ['debris', 'pan', 'towels'], mv: { filterCap: [0, 0, 0], panel: [0, 0, 0] }, rt: { filterCap: [0, 0, 0], panel: [0, 0, 0] } } },
  ];
  TB.more('appliances', [
    {
      id: 'washer-drain',
      title: 'Washer won’t drain',
      model: 'washerFront',
      level: 1,
      time: '30–60 min',
      cost: '$0',
      summary: 'A washer that stops with water inside usually has a clogged pump filter (front-loaders) or a kinked or plugged drain hose (top-loaders). Neither needs parts.',
      intro: { hi: ['tubWater'], xray: true },
      safety: ['Unplug the washer before working on it.', 'If it just ran a hot cycle, let the water cool.'],
      causes: [['Clogged pump filter', 'Front-loaders catch coins, hair and small socks here.'], ['Kinked drain hose', 'Usually after the washer was pushed back.'], ['Clogged standpipe', 'Lint builds up in the wall drain.'], ['Failed lid switch or pump', 'Machine hums or does nothing at drain time.']],
      tools: ['Towels', 'Shallow pan or baking dish', 'Flashlight', 'Flat screwdriver (for some panels)'],
      variants: [
        { id: 'front', name: 'Front-load', blurb: 'Door on the front. Has a pump filter at the bottom corner.' },
        {
          id: 'top',
          name: 'Top-load',
          blurb: 'Lid on top. Usually no user filter; check the hose and standpipe.',
          model: 'washerTop',
          intro: { hi: ['tubWater', 'drainHose'] },
          tools: ['Bucket + cup', 'Towels', 'Flashlight', 'Drain snake (small)', 'Pliers (hose clamp)'],
          steps: [
            { t: 'Unplug and bail', d: 'Unplug the washer and bail the water into a bucket.', why: 'Moving a washer full of water is heavy and spills.', v: { cam: [1.1, 1.6, 1.3], at: [0, 0.8, 0], hi: ['tubWater'], show: ['bail'] } },
            { t: 'Check the lid switch', d: 'Look at the switch or lock where the lid closes. Press it with a finger; you should feel a click.', why: 'Many top-loaders won’t drain or spin if they think the lid is open.', v: { cam: [0.6, 1.25, 0.5], at: [0.27, 0.92, -0.22], hi: ['lidSwitch'] } },
            { t: 'Pull it out and check the hose', d: 'Walk the washer forward and look at the drain hose behind it. Straighten any kink.', why: 'A kink is the single most common cause, often after laundry-room cleaning.', v: { cam: [1.2, 1.0, 0.4], at: [0.28, 0.5, -0.5], hi: ['kink', 'drainHose'], hide: ['tubWater'] } },
            { t: 'Clear the standpipe', d: 'Pull the hose out of the standpipe and run a small snake down the pipe. Pour a bucket of water in to confirm it drains.', why: 'Lint from years of loads collects in the pipe trap.', v: { cam: [0.9, 1.2, 0.2], at: [0.4, 0.9, -0.7], hi: ['standpipe'], mv: { drainHose: [0, 0.15, 0.1] } } },
            { t: 'Reconnect and test', d: 'Put the hose back about 6–8″ into the standpipe, push the washer back without kinking it, and run a drain/spin.', why: 'Too deep and the hose can siphon water out during filling.', v: { cam: [1.3, 1.4, 1.5], at: [0, 0.65, -0.2], hi: ['drainHose'], hide: ['kink', 'bail'], mv: { drainHose: [0, 0, 0] } } },
          ],
          pro: 'The washer hums at drain time with a clear hose and standpipe; the pump is likely failed or jammed.',
        },
      ],
      steps: frontSteps,
      learn: {
        how: 'At the end of each wash, a small electric pump pulls water from the bottom of the tub and pushes it up the drain hose into a standpipe. On front-loaders, a filter in front of the pump catches anything big enough to jam the impeller. Top-loaders usually let it all pass through, so clogs show up in the hose or standpipe instead.',
        specs: [['Standpipe height', '18–96″ above floor (check manual)'], ['Hose into standpipe', '6–8″'], ['Filter cleaning', 'Every 1–3 months (front-load)']],
        terms: [['Drain pump', 'Small motor-driven pump that empties the tub.'], ['Impeller', 'The spinning vanes inside the pump.'], ['Siphoning', 'Water draining out while filling, from a hose pushed too deep.']],
        mistakes: ['Opening the big filter first and flooding the floor.', 'Cross-threading the filter cap.', 'Sealing the hose airtight into the standpipe.'],
        tips: ['Use a mesh laundry bag for socks and small items.', 'Wipe the door gasket and run a cleaning cycle monthly to stop odors.'],
      },
      pro: 'The pump hums but won’t turn, there’s an error code that persists after cleaning, or the machine leaks from underneath.',
    },
    {
      id: 'hood-filter',
      title: 'Clean range hood filters',
      model: 'rangeHood',
      level: 1,
      time: '30 min',
      cost: '$0',
      summary: 'Greasy hood filters slow airflow and become a fire risk. They pop out in seconds and come clean with hot water, dish soap and baking soda.',
      intro: { hi: ['filters'] },
      safety: ['Hood and cooktop off and cool.', 'Charcoal (recirculating) filters can’t be washed. Replace them instead.'],
      causes: [['Weak suction', 'Clogged mesh.'], ['Grease dripping', 'Saturated filters.'], ['Smells linger', 'Charcoal filter is spent.']],
      tools: ['Sink or tub', 'Degreasing dish soap', '¼ cup baking soda', 'Soft brush', 'Towels'],
      steps: [
        { t: 'Turn it off and let it cool', d: 'Switch off the hood and burners.', why: 'Filters get hot, and grease softens and drips when warm.', v: { cam: [0.9, 1.25, 1.3], at: [0, 1.5, 0], hi: ['hood'] } },
        { t: 'Release the filters', d: 'Pull each latch toward you and tilt the filter down and out.', why: 'Support it with your other hand; grease makes them slippery.', v: { cam: [0.5, 1.05, 0.6], at: [0, 1.6, -0.06], hi: ['filterLLatch', 'filterRLatch'], mv: { filterL: [0, -0.06, 0.05] }, rt: { filterL: [-25, 0, 0] } } },
        { t: 'Soak', d: 'Fill a sink with the hottest tap water, add a squirt of degreasing dish soap and ¼ cup baking soda. Submerge the filters for 15 minutes.', why: 'Hot water softens grease; baking soda is a mild alkali that breaks it down without scratching.', v: { cam: [1.6, 1.3, 1.1], at: [0.84, 1.0, 0.05], hi: ['soak'], show: ['soak'], hide: ['filters'] } },
        { t: 'Scrub and rinse', d: 'Brush gently with the grain of the mesh, rinse with hot water and shake dry.', why: 'Hard scrubbing bends the mesh layers and makes them leak grease.', v: { cam: [1.6, 1.3, 1.1], at: [0.84, 1.0, 0.05], hi: ['soak'], hide: ['filterLGrease', 'filterRGrease'] } },
        { t: 'Wipe the hood and reinstall', d: 'Wipe the inside of the hood, then click the dry filters back in.', why: 'Grease on the hood body just re-coats clean filters.', v: { cam: [0.9, 1.25, 1.3], at: [0, 1.5, 0], hi: ['filters'], show: ['filters'], hide: ['soak'], mv: { filterL: [0, 0, 0] }, rt: { filterL: [0, 0, 0] } } },
      ],
      learn: {
        how: 'Ducted hoods pull steam and grease up through metal filters and blow it outside. The mesh traps grease droplets on its layers. Baffle filters force air to turn sharply so grease slings onto the metal. Recirculating hoods add a charcoal filter that absorbs odors and then blows the air back into the kitchen.',
        specs: [['Clean mesh / baffle filters', 'Monthly with regular cooking'], ['Replace charcoal filters', 'Every 3–6 months'], ['Typical hood airflow', '250–400 CFM residential']],
        terms: [['Mesh filter', 'Layers of aluminum mesh.'], ['Baffle filter', 'Stainless channels; restaurant style.'], ['CFM', 'Cubic feet per minute of airflow.']],
        mistakes: ['Washing charcoal filters.', 'Using oven cleaner on aluminum (it darkens and pits).', 'Running the hood without filters.'],
        tips: ['Stainless baffle filters are dishwasher-safe; aluminum mesh can discolor in some detergents.', 'Run the hood for 10 minutes after cooking to clear lingering moisture.'],
      },
      pro: 'The fan is noisy or won’t start, grease has built up inside the duct, or the hood isn’t vented outside where it should be.',
    },
    {
      id: 'oven-element',
      title: 'Oven won’t bake (electric)',
      model: 'ovenElement',
      level: 2,
      time: '30–45 min',
      cost: '$25–60',
      summary: 'If the broiler works but bake doesn’t heat, the bake element has probably burned through. Look for a blister or break. It’s held in by two screws.',
      intro: { hi: ['element', 'burnSpot'] },
      safety: ['Unplug the range or turn off its 240 V breaker. The terminals are live whenever it’s connected.', 'Let the oven cool fully.', 'Don’t let the wires slip back into the wall of the oven; tape them if needed.'],
      causes: [['Burned-out element', 'Visible blister or break; no glow.'], ['Loose terminal', 'Burned connector on one wire.'], ['Failed control or sensor', 'Element tests good but gets no power.']],
      tools: ['Nut driver or screwdriver (¼″ or Phillips)', 'Multimeter', 'Replacement element (match model number)', 'Needle-nose pliers', 'Masking tape', 'Phone for a photo'],
      steps: [
        { t: 'Power off and cool', d: 'Turn off the breaker or unplug the range. Open the door.', why: '240 V is at the terminals as soon as the range is connected, even with the oven off.', v: { cam: [0.6, 0.75, 1.0], at: [0, 0.3, 0], hi: ['element', 'burnSpot'] } },
        { t: 'Remove the racks', d: 'Slide both racks out.', why: 'You need room to reach the back wall.', v: { cam: [0.6, 0.75, 1.0], at: [0, 0.35, 0], hi: ['racks'], mv: { racks: [0.9, -0.36, 0.5] } } },
        { t: 'Unscrew the mounting plate', d: 'Remove the two screws holding the element’s plate to the back wall.', why: 'The terminals pass through the wall behind that plate.', v: { cam: [0.35, 0.45, 0.45], at: [-0.07, 0.23, -0.22], hi: ['elemPlate'], hide: ['racks'], tool: { id: 'screwdriver', at: [-0.14, 0.235, -0.18], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Pull it forward and test', d: 'Pull the element out 3–4″ to expose the terminals. Photo the wires, slide them off, and measure across the terminals with the meter set to ohms.', why: 'A good bake element reads about 20–35 Ω. Open (OL) confirms it’s burned out.', v: { cam: [0.35, 0.45, 0.55], at: [-0.07, 0.24, -0.15], hi: ['terminals', 'element'], mv: { element: [0, 0, 0.09], terminals: [0, 0, 0.09] }, tool: { id: 'multimeter', at: [0.15, 0.22, 0.05], rot: [0, -20, 0] } } },
        { t: 'Connect the new element', d: 'Push the wire connectors firmly onto the new element’s terminals, matching your photo. Feed the terminals through and screw the plate in.', why: 'A loose push-on connector arcs and burns. If a connector is scorched, replace it too.', v: { cam: [0.35, 0.45, 0.55], at: [-0.07, 0.24, -0.15], hi: ['newElement', 'terminals'], show: ['newElement'], hide: ['element'], mv: { terminals: [0, 0, 0] } } },
        { t: 'Power on and test', d: 'Racks back in, power on and set the oven to bake 350 °F. The element should glow red within a couple of minutes.', why: 'Some new elements smoke briefly the first time as the factory coating burns off.', v: { cam: [0.6, 0.75, 1.0], at: [0, 0.3, 0], hi: ['newElement'], fx: 'glow' } },
      ],
      learn: {
        how: 'A bake element is a nichrome resistance wire packed in magnesium oxide powder inside a metal sheath. Current through the wire makes heat. Over years, hot spots form, the sheath blisters, and the wire breaks. That’s an open circuit, and no heat. The oven’s control switches 240 V to the element and uses a temperature sensor to cycle it.',
        specs: [['Bake element', '2000–3400 W at 240 V'], ['Good resistance', '≈ 20–35 Ω'], ['Sensor (RTD) at room temp', '≈ 1080–1100 Ω']],
        terms: [['Bake element', 'Bottom heating element.'], ['Broil element', 'Top element.'], ['RTD sensor', 'Temperature probe on the back wall.'], ['Hidden bake', 'Element under the oven floor; repair needs the floor panel removed.']],
        mistakes: ['Letting the wires fall back through the wall.', 'Buying an element by look instead of part number.', 'Leaving the power on.'],
        tips: ['The model number plate is usually inside the drawer or on the door frame.'],
      },
      pro: 'The element tests good but doesn’t heat (control board or relay), there’s a gas oven, or the oven has a hidden bake element under a fixed floor.',
    },
  ]);
})();
