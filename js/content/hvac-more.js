/* HVC · Heating, cooling & hot water: water-heater variants (electric, tankless) and new guides
   (thermostat swap, flame sensor, AC condensate drain, electric element). Real meters (unit: 1). */
(function () {
  const UTIL = { env: 'garage', unit: 1, tex: ['concrete_floor_01', 'white_plaster_02'], ground: { tex: 'concrete_floor_01', repeat: 4, radius: 4 } };
  const util = (o) => Object.assign({}, UTIL, o);
  const ROOM = { env: 'studio', unit: 1, tex: ['white_plaster_02', 'plank_flooring'], ground: { tex: 'plank_flooring', repeat: 4, radius: 4 } };
  const PVC = 0.0135; // ¾″ PVC outside radius
  const backWall = (K, z) => K.box(null, [3.2, 2.44, 0.02], K.std(0xeeebe5, { roughness: 0.92 }), [0, 1.22, z], null, 0);

  /* ---- Electric tank water heater (50 gal) ---- */
  TB.model('waterheaterElec', util({ cam: [1.3, 1.25, 1.6], at: [0, 0.8, 0], hidden: ['hose', 'newElement'] }), (K) => {
    backWall(K, -0.45);
    const shell = K.std(0xe9e6df, { roughness: 0.45, metalness: 0.1 });
    const tank = K.part('tank', [0, 0, 0], null, 'Tank (50 gal)');
    K.cyl(tank, [0.28, 0.28, 1.42, 48], shell, [0, 0.74, 0]);
    K.cyl(tank, [0.282, 0.282, 0.03, 48], 'grey', [0, 1.46, 0]);
    K.cyl(tank, [0.285, 0.285, 0.04, 48], 'grey', [0, 0.02, 0]);
    K.box(tank, [0.16, 0.22, 0.004], K.std(0xf4e9b8, { roughness: 0.8 }), [-0.16, 0.7, 0.24], [0, -35, 0], 0);
    const sed = K.part('sediment', [0, 0.07, 0], null, 'Sediment layer');
    K.cyl(sed, [0.26, 0.26, 0.05, 32], 'dirt');
    // access covers, insulation, thermostats, elements
    function bay(tag, y, label) {
      const ins = K.part('insul' + tag, [0, y, 0.274], null, 'Insulation');
      K.box(ins, [0.12, 0.17, 0.012], K.std(0xe5c34a, { roughness: 1 }), [0, 0, 0], null, 0.003);
      const ts = K.part('tstat' + tag, [0, y + 0.035, 0.274], null, tag === 'Up' ? 'Upper thermostat + high-limit' : 'Lower thermostat');
      K.box(ts, [0.05, 0.08, 0.016], 'lightgrey', [0, 0, 0], null, 0.003);
      K.cyl(ts, [0.008, 0.008, 0.004, 16], 'offwhite', [0, -0.018, 0.009], [90, 0, 0]);
      if (tag === 'Up') {
        const rb = K.part('resetBtn', [0, 0.028, 0.009], ts, 'Red RESET (high-limit)');
        K.box(rb, [0.014, 0.01, 0.006], 'red', [0, 0, 0], null, 0.002);
      }
      const el = K.part('elem' + tag, [0, y - 0.045, 0.27], null, (tag === 'Up' ? 'Upper' : 'Lower') + ' heating element');
      K.nut(el, 0.038, 0.012, 'brass', [0, 0, 0.006], [90, 0, 0]);
      [-0.008, 0.008].forEach((x) => K.screw(el, 0.004, 0.006, 'steel', [x, 0, 0.016], [-90, 0, 0]));
      K.tube(el, [[-0.008, 0, 0], [-0.008, 0, -0.25], [0, 0, -0.3], [0.008, 0, -0.25], [0.008, 0, 0]], 0.004, 'copper');
      const cov = K.part('cover' + tag, [0, y, 0.283], null, 'Access cover');
      K.box(cov, [0.16, 0.2, 0.006], shell, [0, 0, 0], null, 0.003);
      K.screw(cov, 0.004, 0.006, 'steel', [0, 0.085, 0.004], [-90, 0, 0]);
      K.screw(cov, 0.004, 0.006, 'steel', [0, -0.085, 0.004], [-90, 0, 0]);
    }
    bay('Up', 1.05, 'Upper');
    bay('Low', 0.3, 'Lower');
    const jb = K.part('jbox', [0.12, 1.5, -0.12], null, 'Junction box (240 V)');
    K.box(jb, [0.1, 0.06, 0.1], 'grey', [0, 0, 0], null, 0.004);
    K.tube(null, [[0.12, 1.53, -0.12], [0.12, 1.75, -0.2], [0.12, 2.0, -0.42]], 0.012, 'steel');
    const cold = K.part('coldValve', [-0.12, 1.62, 0], null, 'Cold shutoff');
    K.cyl(null, [0.011, 0.011, 0.8], 'copper', [-0.12, 1.88, 0]);
    K.cyl(cold, [0.02, 0.02, 0.07, 16], 'brass', [0, 0, 0]);
    K.box(cold, [0.09, 0.012, 0.02], 'blue', [0.03, 0.03, 0], null, 0.004);
    K.cyl(null, [0.011, 0.011, 0.8], 'copper', [0.12, 1.88, 0.06]);
    const tp = K.part('tpValve', [0.28, 1.3, 0], null, 'T&P relief valve');
    K.cyl(tp, [0.018, 0.018, 0.06, 16], 'brass', [0.03, 0, 0], [0, 0, 90]);
    K.box(tp, [0.012, 0.03, 0.01], 'brass', [0.04, 0.03, 0], null, 0.002);
    K.tube(tp, [[0.06, 0, 0], [0.09, -0.04, 0], [0.09, -1.2, 0]], 0.011, 'copper');
    const drain = K.part('drain', [0, 0.12, 0.285], null, 'Drain valve');
    K.cyl(drain, [0.014, 0.014, 0.04, 16], 'brass', [0, 0, 0.02], [90, 0, 0]);
    K.cyl(drain, [0.02, 0.02, 0.02, 16], 'brass', [0, 0, 0.045], [90, 0, 0]);
    const hose = K.part('hose', [0, 0.12, 0.34], null, 'Drain hose to floor drain');
    K.tube(hose, [[0, 0, 0], [0.1, -0.08, 0.15], [0.5, -0.1, 0.4], [0.9, -0.1, 0.5]], 0.012, 'green');
    K.cyl(hose, [0.08, 0.08, 0.005, 24], 'dark', [0.95, -0.118, 0.5]);
    const flow = K.cyl(hose, [0.01, 0.018, 0.08, 12], K.std(0x9d8a6a, { transparent: true, opacity: 0.8 }), [0.92, -0.08, 0.5]);
    flow.userData.noPick = true;
    const ne = K.part('newElement', [0.6, 0.02, 0.5], null, 'New element + gasket');
    K.nut(ne, 0.038, 0.012, 'brass', [0, 0.02, 0], [0, 0, 90]);
    K.tube(ne, [[0.006, 0.02, -0.008], [0.3, 0.02, -0.008], [0.33, 0.02, 0], [0.3, 0.02, 0.008], [0.006, 0.02, 0.008]], 0.004, 'copper');
    K.tor(ne, [0.02, 0.003], 'rubber', [-0.008, 0.02, 0], [0, 90, 0]);
    return {
      tick(t, fx) {
        flow.visible = fx === 'drain';
        if (flow.visible) flow.scale.y = 0.6 + 0.4 * Math.sin(t * 20);
      },
    };
  });

  /* ---- Tankless (on-demand) water heater with isolation valves ---- */
  TB.model('tankless', util({ cam: [1.2, 1.5, 1.9], at: [0, 1.05, 0], assets: ['plastic_bottle_gallon'], hidden: ['pumpKit', 'hoses'] }), (K) => {
    backWall(K, -0.2);
    const unit = K.part('unit', [0, 1.45, -0.08], null, 'Tankless heater');
    K.box(unit, [0.36, 0.6, 0.22], K.std(0xf2f2ef, { roughness: 0.4 }), [0, 0, 0], null, 0.02);
    K.box(unit, [0.12, 0.05, 0.004], 'screen', [0, 0.12, 0.111], null, 0.003);
    K.box(unit, [0.2, 0.012, 0.004], 'dark', [0, -0.22, 0.111], null, 0);
    const hx = K.part('hx', [0, 0, 0], unit, 'Heat exchanger (scale builds here)');
    K.rep(8, (i) => K.tor(hx, [0.1, 0.008], 'copper', [0, -0.1 + i * 0.028, 0], [90, 0, 0]));
    K.cyl(null, [0.05, 0.05, 0.6, 24], 'steel', [0, 2.05, -0.08]);
    // supply lines down to isolation valves
    const iso = (name, x, color, label) => {
      const g = K.part(name, [x, 0.95, -0.02], null, label);
      K.cyl(null, [0.011, 0.011, 0.24], 'copper', [x, 1.07 + 0.0, -0.06]);
      K.cyl(g, [0.022, 0.022, 0.09, 16], 'brass', [0, 0, 0]);
      K.box(g, [0.09, 0.014, 0.02], color, [0.04, 0.02, 0.025], null, 0.004);
      K.cyl(null, [0.011, 0.011, 0.95], 'copper', [x, 0.45, -0.02]);
      const port = K.part(name + 'Port', [x + 0.035, -0.03, 0], g, 'Service port + drain cap');
      K.cyl(port, [0.012, 0.012, 0.04, 16], 'brass', [0.02, 0, 0], [0, 0, 90]);
      K.box(port, [0.008, 0.03, 0.012], color, [0.02, 0.02, 0], null, 0.002);
      K.cyl(port, [0.016, 0.016, 0.014, 16], 'brass', [0.044, 0, 0], [0, 0, 90]);
      return g;
    };
    iso('coldIso', -0.09, 'blue', 'Cold isolation valve');
    iso('hotIso', 0.09, 'red', 'Hot isolation valve');
    const filt = K.part('inletFilter', [-0.09, 1.14, 0.03], null, 'Cold inlet filter screen');
    K.cyl(filt, [0.014, 0.014, 0.03, 16], 'chrome', [0, 0, 0], [90, 0, 0]);
    const plug = K.part('power', [0.3, 1.05, -0.18], null, 'Power cord / plug');
    K.box(plug, [0.07, 0.11, 0.02], 'offwhite', [0, 0, 0], null, 0.004);
    K.tube(plug, [[0, 0, 0.02], [-0.06, 0.15, 0.06], [-0.12, 0.3, 0.06]], 0.004, 'dark');
    // descaling kit
    const kit = K.part('pumpKit', [0, 0, 0.35], null, 'Bucket, pump & vinegar');
    K.cyl(kit, [0.15, 0.13, 0.36, 32, true], K.std(0xe8edf2, { roughness: 0.5, side: THREE.DoubleSide }), [0, 0.18, 0]);
    K.cyl(kit, [0.13, 0.13, 0.005, 32], 'dark', [0, 0.002, 0]);
    const liquid = K.cyl(kit, [0.142, 0.142, 0.01, 32], K.std(0xd8c48a, { transparent: true, opacity: 0.75 }), [0, 0.22, 0]);
    liquid.userData.noPick = true;
    const pump = K.group(kit, [0, 0.05, 0]);
    K.cyl(pump, [0.05, 0.05, 0.1, 24], 'dark', [0, 0, 0]);
    K.box(pump, [0.06, 0.03, 0.06], 'dark', [0, -0.05, 0], null, 0.004);
    K.glb(kit, 'plastic_bottle_gallon', { height: 0.29 }, [0.28, 0, 0.05], [0, -20, 0]) || K.box(kit, [0.15, 0.29, 0.15], 'white', [0.28, 0.145, 0.05]);
    const hoses = K.part('hoses', [0, 0, 0], null, 'Pump & return hoses');
    K.tube(hoses, [[-0.0, 0.1, 0.35], [-0.05, 0.4, 0.3], [-0.08, 0.8, 0.12], [-0.03, 0.92, 0]], 0.009, K.std(0xf2f2f2, { transparent: true, opacity: 0.8, roughness: 0.2 }));
    K.tube(hoses, [[0.15, 0.92, 0], [0.18, 0.7, 0.15], [0.08, 0.38, 0.32], [0.05, 0.3, 0.35]], 0.009, K.std(0xf2f2f2, { transparent: true, opacity: 0.8, roughness: 0.2 }));
    const blob = K.sph(hoses, 0.012, K.std(0xd8c48a), [0, 0.5, 0.3]);
    blob.userData.noPick = true;
    return {
      tick(t, fx) {
        blob.visible = fx === 'circulate';
        if (blob.visible) {
          const u = (t * 0.35) % 1;
          blob.position.set(-0.05 * Math.sin(u * 3), 0.1 + u * 0.8, 0.35 - u * 0.35);
          pump.position.x = Math.sin(t * 60) * 0.001;
        }
      },
    };
  });

  /* ---- Thermostat on a wall ---- */
  TB.model('thermostat', Object.assign({}, ROOM, { cam: [0.25, 1.45, 0.42], at: [0, 1.4, 0], hidden: ['tags', 'newBase', 'newStat'] }), (K) => {
    backWall(K, -0.01);
    const plate = K.part('wallHole', [0, 1.4, 0], null, 'Wire hole');
    K.cyl(plate, [0.008, 0.008, 0.002, 16], 'black', [0, 0, 0.001], [90, 0, 0]);
    const wires = K.part('wires', [0, 1.4, 0], null, 'Thermostat wires');
    const cols = [['red', 'R · 24 V power'], ['white', 'W · heat'], ['yellow', 'Y · cooling'], ['green', 'G · fan'], ['blue', 'C · common']];
    cols.forEach(([c], i) => {
      const x = -0.02 + i * 0.01;
      K.tube(wires, [[0, 0, -0.01], [x * 0.5, 0.005, 0.006], [x, 0.012, 0.01], [x, 0.022, 0.011]], 0.0012, c);
      K.cyl(wires, [0.0007, 0.0007, 0.006, 8], 'copper', [x, 0.027, 0.011]);
    });
    K.cyl(wires, [0.0035, 0.0035, 0.012, 12], K.std(0xb7b2a8, { roughness: 0.8 }), [0, 0, 0.0], [90, 0, 0]);
    const tags = K.part('tags', [0, 1.4, 0], null, 'Letter labels on each wire');
    cols.forEach(([c], i) => K.box(tags, [0.006, 0.008, 0.001], 'offwhite', [-0.02 + i * 0.01, 0.015, 0.0125], null, 0));
    const ob = K.part('oldBase', [0, 1.4, 0.004], null, 'Old base (subbase)');
    K.box(ob, [0.13, 0.085, 0.008], 'offwhite', [0, 0, 0], null, 0.004);
    cols.forEach((_, i) => K.screw(ob, 0.003, 0.004, 'brass', [-0.03 + i * 0.015, 0.025, 0.006], [-90, 0, 0]));
    const old = K.part('oldStat', [0, 1.4, 0.02], null, 'Old thermostat');
    K.box(old, [0.135, 0.09, 0.03], K.std(0xe9e3d3, { roughness: 0.6 }), [0, 0, 0], null, 0.012);
    K.cyl(old, [0.03, 0.03, 0.01, 32], 'lightgrey', [0.025, 0, 0.016], [90, 0, 0]);
    K.box(old, [0.035, 0.018, 0.003], 'grey', [-0.035, 0.01, 0.016], null, 0.001);
    const nb = K.part('newBase', [0, 1.4, 0.004], null, 'New base with push terminals');
    K.cyl(nb, [0.042, 0.042, 0.008, 40], 'offwhite', [0, 0, 0], [90, 0, 0]);
    K.box(nb, [0.06, 0.012, 0.006], 'dark', [0, 0.022, 0.006], null, 0.002);
    K.box(nb, [0.02, 0.004, 0.003], 'dark', [0, -0.025, 0.006], null, 0.001);
    const ns = K.part('newStat', [0, 1.4, 0.02], null, 'Smart thermostat');
    const scr = K.std(0x0d1a2a, { roughness: 0.2, emissive: 0x5fb4ff, emissiveIntensity: 0 });
    K.cyl(ns, [0.042, 0.042, 0.026, 48], 'chrome', [0, 0, 0], [90, 0, 0]);
    K.cyl(ns, [0.037, 0.037, 0.002, 48], scr, [0, 0, 0.0135], [90, 0, 0]);
    const furnace = K.part('furnaceSwitch', [0.45, 1.2, -0.0], null, 'Furnace power switch (in the utility room)');
    K.box(furnace, [0.07, 0.115, 0.008], 'offwhite', [0, 0, 0], null, 0.003);
    K.box(furnace, [0.01, 0.024, 0.01], 'red', [0, 0.006, 0.006], [-18, 0, 0], 0.003);
    return { tick: (t, fx) => (scr.emissiveIntensity = fx === 'on' ? 0.7 : 0) };
  });

  /* ---- Gas furnace burner compartment (flame sensor) ---- */
  TB.model('burner', util({ cam: [0.15, 0.92, 0.85], at: [0, 0.77, -0.08], hidden: ['pad'] }), (K) => {
    backWall(K, -0.5);
    const cab = K.part('cabinet', [0, 0, 0], null, 'Furnace cabinet');
    const paint = K.std(0xd6d4cf, { roughness: 0.5, metalness: 0.2 });
    K.box(cab, [0.53, 1.2, 0.02], paint, [0, 0.6, -0.36], null, 0.004);
    K.box(cab, [0.02, 1.2, 0.72], paint, [-0.265, 0.6, 0], null, 0.004);
    K.box(cab, [0.02, 1.2, 0.72], paint, [0.265, 0.6, 0], null, 0.004);
    K.box(cab, [0.53, 0.02, 0.72], paint, [0, 0.62, 0], null, 0.004);
    K.box(cab, [0.53, 0.02, 0.72], 'dark', [0, 0.001, 0], null, 0.004);
    K.box(cab, [0.5, 0.36, 0.4], K.std(0x6d7076, { metalness: 0.5, roughness: 0.6 }), [0, 1.04, -0.2], null, 0.006);
    const door = K.part('door', [0, 0.62, 0.362], null, 'Front panel (has a safety switch)');
    K.box(door, [0.52, 1.2, 0.012], paint, [0, 0, 0], null, 0.004);
    K.rep(6, (i) => K.box(door, [0.3, 0.008, 0.004], 'grey', [0, 0.4 + i * 0.03, 0.007], null, 0));
    const valve = K.part('gasValve', [-0.13, 0.77, 0.15], null, 'Gas valve');
    K.box(valve, [0.09, 0.07, 0.07], 'dark', [0, 0, 0], null, 0.006);
    K.box(valve, [0.02, 0.01, 0.03], 'red', [0, 0.04, 0.02], null, 0.002);
    K.tube(null, [[-0.27, 0.77, 0.08], [-0.21, 0.77, 0.12], [-0.18, 0.77, 0.15]], 0.011, 'blackOxide');
    const man = K.part('manifold', [0, 0.77, 0.05], null, 'Gas manifold');
    K.cyl(man, [0.012, 0.012, 0.36, 16], 'steel', [0.0, 0, 0], [0, 0, 90]);
    K.tube(man, [[-0.13, 0, 0.065], [-0.13, 0, 0.0]], 0.011, 'steel');
    const burners = K.part('burners', [0, 0.77, 0], null, 'Burners');
    K.rep(4, (i) => {
      const x = -0.18 + i * 0.08;
      K.cyl(burners, [0.022, 0.022, 0.14, 20], 'steel', [x, 0, -0.06], [90, 0, 0]);
      K.cyl(burners, [0.026, 0.026, 0.02, 20, true], 'steel', [x, 0, -0.14], [90, 0, 0]);
    });
    const flames = K.part('flames', [0, 0.77, -0.17], null, 'Flame');
    const fl = [];
    K.rep(4, (i) => fl.push(K.cone(flames, [0.02, 0.09, 16], K.std(0x4c8dff, { transparent: true, opacity: 0.75, emissive: 0x2a6bff, emissiveIntensity: 1.5 }), [-0.18 + i * 0.08, 0, -0.04], [-90, 0, 0])));
    const ign = K.part('igniter', [-0.235, 0.81, -0.1], null, 'Hot-surface igniter (fragile, don’t touch)');
    K.box(ign, [0.02, 0.02, 0.03], 'offwhite', [0, 0, 0.04], null, 0.004);
    const igEl = K.box(ign, [0.012, 0.004, 0.05], K.std(0x6b6b66, { roughness: 0.9, emissive: 0xff7a1a, emissiveIntensity: 0 }), [0, 0, 0], null, 0);
    const sensor = K.part('sensor', [0.225, 0.8, -0.05], null, 'Flame sensor');
    K.box(sensor, [0.03, 0.03, 0.004], 'steel', [0, 0, 0.01], null, 0);
    K.screw(sensor, 0.006, 0.012, 'steel', [0, 0.012, 0.014], [-90, 0, 0], 'hex');
    K.cyl(sensor, [0.007, 0.007, 0.03, 16], 'offwhite', [0, 0, -0.008], [90, 0, 0]);
    const rod = K.part('sensorRod', [0, 0, -0.025], sensor, 'Sensor rod (sits in the flame)');
    K.tube(rod, [[0, 0, 0], [0, 0, -0.04], [-0.02, -0.01, -0.09], [-0.05, -0.012, -0.12]], 0.0022, 'toolSteel');
    const ox = K.part('oxide', [0, 0, -0.025], sensor, 'Oxide film (insulates the rod)');
    K.tube(ox, [[-0.02, -0.01, -0.09], [-0.05, -0.012, -0.12]], 0.0028, K.std(0xd9d2c3, { roughness: 1, transparent: true, opacity: 0.8 }));
    K.tube(sensor, [[0, 0, 0.012], [0.02, 0.05, 0.05], [0.0, 0.12, 0.1]], 0.0015, 'offwhite');
    const pad = K.part('pad', [0.35, 0.82, 0.25], null, 'Fine abrasive pad');
    K.box(pad, [0.07, 0.012, 0.045], K.std(0x7a8a4a, { roughness: 1 }), [0, 0, 0], null, 0.004);
    const led = K.part('led', [-0.15, 0.45, 0.2], null, 'Control board status light');
    K.box(led, [0.12, 0.08, 0.01], K.std(0x235c34, { roughness: 0.5 }), [0, 0, 0], null, 0.002);
    const lamp = K.sph(led, 0.004, 'ledR', [0.04, 0.02, 0.008]);
    return {
      tick(t, fx) {
        const burn = fx === 'fire' || fx === 'cycle' && t % 8 > 3;
        flames.visible = burn;
        if (burn) fl.forEach((f, i) => (f.scale.y = 0.9 + 0.15 * Math.sin(t * 13 + i)));
        igEl.material.emissiveIntensity = fx === 'cycle' && t % 8 > 1 && t % 8 < 4 ? 1.6 : 0;
        lamp.material.emissiveIntensity = fx === 'code' ? (Math.sin(t * 8) > 0 && t % 3 < 1.6 ? 1.2 : 0.05) : 0.05;
      },
    };
  });

  /* ---- AC condensate drain on a furnace + evaporator coil ---- */
  TB.model('condensate', util({ cam: [1.2, 1.3, 1.5], at: [0.15, 0.8, 0], hidden: ['vac', 'funnel'] }), (K) => {
    backWall(K, -0.5);
    const paint = K.std(0xd6d4cf, { roughness: 0.5, metalness: 0.2 });
    const furn = K.part('furnace', [0, 0, 0], null, 'Furnace');
    K.box(furn, [0.53, 1.0, 0.72], paint, [0, 0.5, -0.1], null, 0.006);
    K.rep(5, (i) => K.box(furn, [0.3, 0.008, 0.004], 'grey', [0, 0.75 + i * 0.03, 0.262], null, 0));
    const coil = K.part('coilBox', [0, 1.3, -0.1], null, 'Evaporator coil cabinet');
    K.box(coil, [0.55, 0.6, 0.72], K.std(0xb9bcc0, { metalness: 0.5, roughness: 0.45 }), [0, 0, 0], null, 0.006);
    const pan = K.part('drainPan', [0, 1.03, -0.1], null, 'Drain pan (inside)');
    K.box(pan, [0.5, 0.04, 0.66], 'dark', [0, 0, 0], null, 0.004);
    const water = K.part('panWater', [0, 1.045, -0.1], null, 'Backed-up water');
    K.box(water, [0.48, 0.02, 0.64], 'water', [0, 0, 0], null, 0);
    K.box(null, [0.56, 0.6, 0.6], 'steel', [0, 1.9, -0.1], null, 0.006);
    // PVC drain line: stub → tee with cleanout → trap → down to floor drain
    const line = K.part('line', [0, 0, 0], null, '¾″ PVC drain line');
    const pvc = K.std(0xf5f5f2, { roughness: 0.4 });
    K.cyl(line, [PVC, PVC, 0.12, 16], pvc, [0.335, 1.05, 0.15], [0, 0, 90]);
    const tee = K.part('cleanout', [0.41, 1.05, 0.15], null, 'Vent/cleanout tee');
    K.cyl(tee, [PVC * 1.25, PVC * 1.25, 0.06, 16], pvc, [0, 0, 0], [0, 0, 90]);
    K.cyl(tee, [PVC * 1.25, PVC * 1.25, 0.05, 16], pvc, [0, 0.03, 0]);
    const cap = K.part('cap', [0, 0.065, 0], tee, 'Cleanout cap');
    K.cyl(cap, [PVC * 1.35, PVC * 1.35, 0.02, 16], pvc, [0, 0, 0]);
    K.tube(line, [[0.44, 1.05, 0.15], [0.5, 1.05, 0.15], [0.52, 0.98, 0.15], [0.52, 0.9, 0.15]], PVC, pvc);
    K.tube(line, [[0.52, 0.9, 0.15], [0.52, 0.84, 0.15], [0.56, 0.8, 0.15], [0.6, 0.84, 0.15], [0.6, 0.9, 0.15]], PVC, pvc);
    K.tube(line, [[0.6, 0.9, 0.15], [0.62, 0.92, 0.15], [0.66, 0.9, 0.15], [0.68, 0.8, 0.15], [0.68, 0.1, 0.15], [0.7, 0.04, 0.25]], PVC, pvc);
    const trap = K.part('trap', [0.56, 0.82, 0.15], null, 'P-trap (algae collects here)');
    K.sph(trap, PVC * 1.4, K.std(0x5b6b3a, { roughness: 1, transparent: true, opacity: 0.7 }), [0, 0, 0]);
    const fsw = K.part('floatSwitch', [0.31, 1.06, 0.2], null, 'Float safety switch');
    K.box(fsw, [0.04, 0.05, 0.04], 'offwhite', [0, 0.02, 0], null, 0.004);
    K.tube(fsw, [[0, 0.045, 0], [0.0, 0.1, 0], [-0.08, 0.2, 0.0]], 0.002, 'dark');
    const fd = K.part('floorDrain', [0.72, 0.003, 0.32], null, 'Floor drain');
    K.cyl(fd, [0.08, 0.08, 0.006, 24], 'steel', [0, 0, 0]);
    K.rep(5, (i) => K.box(fd, [0.12, 0.007, 0.006], 'dark', [0, 0.001, -0.04 + i * 0.02], null, 0));
    const vac = K.part('vac', [1.05, 0, 0.45], null, 'Wet/dry vac');
    K.cyl(vac, [0.17, 0.15, 0.42, 32], K.std(0xd84a2a, { roughness: 0.5 }), [0, 0.25, 0]);
    K.cyl(vac, [0.17, 0.17, 0.1, 32], 'dark', [0, 0.5, 0]);
    K.tube(vac, [[-0.12, 0.42, 0], [-0.25, 0.3, -0.1], [-0.33, 0.1, -0.2], [-0.35, 0.06, -0.24]], 0.018, 'dark');
    const funnel = K.part('funnel', [0.41, 1.16, 0.15], null, 'Funnel + 1 cup white vinegar');
    K.lathe(funnel, [[0.006, 0], [0.008, 0.03], [0.04, 0.08]], 'yellow');
    return {
      tick(t, fx) {
        K.parts.panWater.visible = fx !== 'clear';
      },
    };
  });

  /* ================= Water heater variants ================= */
  const HVC = (id) => TB.repair('hvac', id);
  const flush = HVC('water-heater-flush');
  flush.variants = [
    { id: 'gas', name: 'Gas tank', blurb: 'Burner under the tank, flue pipe on top, gas control knob near the bottom.' },
    {
      id: 'electric',
      name: 'Electric tank',
      blurb: 'Two access covers on the side, a thick cable on top, no flue.',
      model: 'waterheaterElec',
      intro: { hi: ['sediment', 'elemLow'], xray: true },
      safety: ['Turn off the 240 V breaker before draining. A dry element burns out in seconds if it’s powered.', 'Water at the drain can be 120–140 °F.', 'Old plastic drain valves can snap. Have a hose cap ready.'],
      steps: [
        { t: 'Breaker off', d: 'Turn off the double-pole breaker for the water heater (usually 30 A).', why: 'Elements must never be powered without water around them.', v: { cam: [1.2, 1.8, 1.4], at: [0.12, 1.5, -0.12], hi: ['jbox'] } },
        { t: 'Close the cold supply', d: 'Turn the cold shutoff on top of the tank to closed.', why: 'Stops fresh water from refilling the tank as you drain it.', v: { cam: [0.6, 1.9, 0.8], at: [-0.12, 1.62, 0], hi: ['coldValve'], rt: { coldValve: [0, 90, 0] } } },
        { t: 'Hose to the drain', d: 'Connect a garden hose to the drain valve and run it to a floor drain or outside, lower than the valve.', why: 'Gravity does the draining.', v: { cam: [1.2, 0.6, 1.4], at: [0.4, 0.1, 0.4], hi: ['drain', 'hose'], show: ['hose'] } },
        { t: 'Open a hot tap, then the drain', d: 'Open a hot faucet in the house, then open the drain valve.', why: 'The open tap lets air in so the tank doesn’t vacuum-lock.', v: { cam: [1.2, 0.6, 1.4], at: [0.4, 0.1, 0.4], hi: ['drain'], fx: 'drain' } },
        { t: 'Stir and flush', d: 'When nearly empty, open the cold valve in short bursts until the water runs clear.', why: 'Electric tanks also collect scale on the lower element. Flushing protects it.', v: { cam: [1.3, 1.0, 1.6], at: [0, 0.3, 0], hi: ['sediment', 'elemLow'], xray: true, fx: 'drain', rt: { coldValve: [0, 0, 0] } } },
        { t: 'Refill completely, then power', d: 'Close the drain, open the cold valve, and wait until the hot tap runs a steady stream with no air. Only then turn the breaker back on.', why: 'Sputtering at the tap means air is still in the tank. The upper element could be dry.', v: { cam: [1.3, 1.25, 1.6], at: [0, 0.8, 0], hi: ['tank'], hide: ['hose', 'sediment'] } },
      ],
    },
    {
      id: 'tankless',
      name: 'Tankless',
      blurb: 'Wall-mounted box with isolation valves underneath. Descale instead of flush.',
      model: 'tankless',
      time: '1.5 hrs',
      cost: '$15–150',
      summary: 'Tankless heaters don’t collect sediment in a tank. Scale builds inside the heat exchanger instead. A yearly vinegar flush through the service ports clears it.',
      intro: { hi: ['hx', 'coldIso', 'hotIso'], xray: true },
      safety: ['Unplug the unit or turn off its breaker; for gas units also shut the gas valve.', 'Close both isolation valves before opening the service ports; they’re under house pressure.'],
      causes: [['Hard-water scale', 'Restricts flow and triggers overheating codes.'], ['Error code for scale', 'Many units show a code (like LC or 00) when it’s time.']],
      tools: ['Descaling kit: submersible pump + 2 hoses', '5-gal bucket', '2–4 gal white vinegar or descaler', 'Adjustable wrench', 'Towel'],
      steps: [
        { t: 'Power off', d: 'Unplug the unit (or switch off its breaker). On gas units, close the gas valve too.', why: 'The burner must not fire while the water path is open.', v: { cam: [0.9, 1.2, 1.2], at: [0.3, 1.05, -0.18], hi: ['power'] } },
        { t: 'Close both isolation valves', d: 'Turn the blue (cold) and red (hot) handles perpendicular to the pipes.', why: 'This cuts the heater off from the house so you can circulate vinegar through it alone.', v: { cam: [0.6, 1.1, 0.8], at: [0, 0.95, 0], hi: ['coldIso', 'hotIso'], rt: { coldIso: [0, 0, 0] } } },
        { t: 'Hook up the hoses', d: 'Remove the service port caps. Connect the pump hose to the cold port and a return hose to the hot port, both into the bucket of vinegar.', why: 'The pump pushes vinegar in the cold side, through the heat exchanger, and back out the hot side to the bucket.', v: { cam: [0.9, 1.0, 1.2], at: [0, 0.7, 0.15], hi: ['coldIsoPort', 'hotIsoPort', 'hoses'], show: ['pumpKit', 'hoses'] } },
        { t: 'Open the service ports and circulate', d: 'Open both service-port handles and run the pump for 45–60 minutes.', why: 'Acetic acid dissolves calcium carbonate. Circulating keeps fresh acid moving across the scale.', v: { cam: [1.2, 1.4, 1.8], at: [0, 1.0, 0.1], hi: ['hx', 'hoses'], xray: true, fx: 'circulate' } },
        { t: 'Rinse with fresh water', d: 'Stop the pump, empty the bucket, and open the cold isolation valve for 5 minutes with the hot hose into the bucket.', why: 'Leftover vinegar can taste and damage seals over time.', v: { cam: [0.9, 1.0, 1.2], at: [0, 0.7, 0.15], hi: ['coldIso'] } },
        { t: 'Clean the inlet filter', d: 'Close the cold valve, unscrew the inlet filter screen, rinse it and screw it back in.', why: 'This screen catches grit before it reaches the heat exchanger.', v: { cam: [0.5, 1.2, 0.6], at: [-0.09, 1.14, 0.03], hi: ['inletFilter'], mv: { inletFilter: [0, -0.05, 0.08] } } },
        { t: 'Close ports, open mains, power on', d: 'Remove hoses, close and cap the service ports, open both isolation valves, run a hot tap until it flows steadily, then plug the unit back in.', why: 'Purging air first prevents an ignition error.', v: { cam: [1.2, 1.5, 1.9], at: [0, 1.05, 0], hi: ['unit'], hide: ['pumpKit', 'hoses'], mv: { inletFilter: [0, 0, 0] } } },
      ],
      learn: {
        how: 'A tankless heater fires a burner (or high-power elements) only when it senses flow, heating water as it passes through a narrow heat exchanger. Those narrow passages are where minerals deposit. Even a thin scale layer insulates the metal, so the unit overheats and throws codes.',
        specs: [['Descale interval', 'Every 12 months (6 in hard water)'], ['Vinegar volume', '2–4 gal'], ['Circulation time', '45–60 min'], ['Minimum flow to fire', '≈ 0.4–0.5 gpm']],
        terms: [['Isolation valves', 'Valve kit with service ports for flushing.'], ['Heat exchanger', 'Coiled tubing where water picks up heat.'], ['Scale', 'Calcium and magnesium carbonate deposits.']],
        mistakes: ['Opening service ports with the main valves still open.', 'Forgetting to power off.', 'Skipping the inlet filter.'],
        tips: ['A whole-house softener or a scale-inhibitor cartridge stretches the interval.'],
      },
    },
  ];

  /* ================= New HVAC guides ================= */
  TB.more('hvac', [
    {
      id: 'thermostat',
      title: 'Replace a thermostat',
      model: 'thermostat',
      level: 2,
      time: '45–60 min',
      cost: '$30–250',
      summary: 'A thermostat is a low-voltage switch. Label every wire with its terminal letter, and the swap is mostly matching letters.',
      intro: { hi: ['oldStat'] },
      safety: ['Turn off the furnace power switch or breaker. It’s only 24 V, but shorting R to C can blow the control-board fuse.', 'If the old thermostat contains a glass mercury bulb, recycle it as hazardous waste.', 'If the old one is marked 120 V or 240 V (thick wires, baseboard heat), it’s a line-voltage model. Different job.'],
      causes: [['Upgrade to smart / programmable', 'Saves 8–10% on heating and cooling.'], ['Dead display or no response', 'Batteries first; then the thermostat.'], ['Short cycling', 'A failing or badly placed thermostat.']],
      tools: ['Screwdriver set', 'Phone for photos', 'Wire labels (included)', 'Drill + anchors', 'Level', 'Pencil'],
      steps: [
        { t: 'Kill power at the furnace', d: 'Flip the furnace’s service switch (looks like a light switch near the unit) or its breaker.', why: 'The thermostat’s power comes from a transformer in the furnace.', v: { cam: [0.6, 1.3, 0.5], at: [0.45, 1.2, 0], hi: ['furnaceSwitch'], rt: { furnaceSwitch: [0, 0, 0] } } },
        { t: 'Take the faceplate off', d: 'Pull or unscrew the thermostat body from its base.', why: 'Most pull straight off; older models have a screw at the bottom.', v: { cam: [0.3, 1.45, 0.45], at: [0, 1.4, 0], hi: ['oldStat'], mv: { oldStat: [0.12, -0.08, 0.18] } } },
        { t: 'Photo and label every wire', d: 'Take a clear photo of the terminals. Stick a label with the terminal letter on each wire: R, W, Y, G, C.', why: 'Wire colors aren’t a rule. The letter on the terminal is what matters.', v: { cam: [0.14, 1.43, 0.22], at: [0, 1.41, 0.01], hi: ['wires', 'tags'], show: ['tags'], hide: ['oldStat'] } },
        { t: 'Remove the old base', d: 'Disconnect the wires and unscrew the base. Wrap the bundle around a pencil so it can’t fall into the wall.', why: 'Fishing a dropped wire out of a wall cavity can take an hour.', v: { cam: [0.2, 1.45, 0.3], at: [0, 1.4, 0], hi: ['oldBase'], mv: { oldBase: [-0.15, -0.1, 0.15] } } },
        { t: 'Mount the new base', d: 'Feed wires through the new base, level it, mark and screw it to the wall (anchors if there’s no stud).', why: 'Most smart thermostats need to be level for the display and sensors to read right.', v: { cam: [0.2, 1.45, 0.3], at: [0, 1.4, 0], hi: ['newBase'], show: ['newBase'], hide: ['oldBase'] } },
        { t: 'Connect by letter', d: 'Insert each wire into its matching terminal. A C wire is needed for most smart models; if there isn’t one, use the adapter that comes with the thermostat.', why: 'R powers the thermostat, W calls heat, Y calls cooling, G runs the fan, and C completes the 24 V circuit so the thermostat can stay powered.', v: { cam: [0.14, 1.43, 0.2], at: [0, 1.41, 0.01], hi: ['wires', 'newBase'], xray: true } },
        { t: 'Attach the display and power on', d: 'Snap the thermostat onto the base, restore furnace power and run the setup. Test heat, cool and fan.', why: 'The setup asks which wires you connected. Answer by terminal letters.', v: { cam: [0.25, 1.45, 0.42], at: [0, 1.4, 0], hi: ['newStat'], show: ['newStat'], hide: ['tags'], fx: 'on' } },
      ],
      learn: {
        how: 'The furnace has a 24-volt transformer. The R wire carries that power to the thermostat. When the room needs heat, the thermostat connects R to W; for cooling, R to Y (and G for the fan). Those connections tell the furnace control board what to do. A smart thermostat needs continuous power for Wi-Fi, which is what the C (common) wire provides.',
        specs: [['Control voltage', '24 V AC'], ['Mounting height', '≈ 52–60″ (1.3–1.5 m)'], ['Typical savings', '8–10% with schedules']],
        terms: [['R / Rh / Rc', '24 V power (heat / cool transformers). A jumper joins them on single-transformer systems.'], ['C wire', 'Common; continuous power for smart thermostats.'], ['O/B', 'Reversing valve on heat pumps.'], ['W2 / Y2', 'Second stage heat / cool.']],
        mistakes: ['Wiring by color instead of letter.', 'Letting the wires fall into the wall.', 'Mounting on an exterior wall, near a vent or in sunlight.'],
        tips: ['Unused wires (often blue) tucked in the wall can serve as a C wire. Connect it at the furnace board’s C terminal too.'],
      },
      pro: 'You have a heat pump with auxiliary heat and aren’t sure of the wiring, there are more than 7 wires, or it’s a line-voltage thermostat.',
    },
    {
      id: 'flame-sensor',
      title: 'Furnace lights, then shuts off',
      model: 'burner',
      level: 2,
      time: '30 min',
      cost: '$0–5',
      summary: 'If the burners light for a few seconds and then go out, the flame sensor is usually coated and can’t prove the flame. Cleaning it takes a nut driver and a fine pad.',
      intro: { hi: ['sensor', 'oxide'], fx: 'cycle' },
      safety: ['Thermostat off, then the furnace power switch off. The control can try to ignite at any time.', 'Never touch the igniter. Skin oils crack it, and it can be extremely hot.', 'If you smell gas, leave the house and call the gas company from outside.'],
      causes: [['Dirty flame sensor', 'A thin oxide film blocks the tiny current that proves flame.'], ['Poor ground', 'The burner assembly needs a solid ground path.'], ['Clogged filter', 'Overheating trips the limit switch instead; check it too.']],
      tools: ['¼″ nut driver', 'Fine emery cloth, a fine abrasive pad, or a dollar bill', 'Flashlight', 'Phone (for the error code)'],
      steps: [
        { t: 'Watch the cycle and read the code', d: 'With the door on, start a heat call and watch through the sight glass: igniter glows, gas lights, then shuts off after 3–10 seconds. Count the blinking status light.', why: 'The blink code is the furnace telling you what failed. “Flame not sensed” points to the sensor.', v: { cam: [0.6, 0.6, 0.8], at: [-0.15, 0.45, 0.2], hi: ['led'], fx: 'code' } },
        { t: 'Power off and open the door', d: 'Thermostat off, furnace power switch off. Lift the front panel off.', why: 'The door presses a safety switch. With it removed, the furnace can’t run anyway.', v: { cam: [0.15, 0.92, 0.85], at: [0, 0.77, -0.08], hi: ['door'], mv: { door: [0.75, -0.2, 0.4] }, rt: { door: [0, -30, 0] } } },
        { t: 'Find the sensor', d: 'Look on the opposite end of the burners from the igniter: a thin bent rod with a white porcelain base and a single wire.', why: 'It sits right in the flame of the farthest burner, so it proves flame carried across all of them.', v: { cam: [0.06, 0.88, 0.5], at: [0.2, 0.79, -0.06], hi: ['sensor'], hide: ['door'] } },
        { t: 'Remove it', d: 'Remove its one hex screw and slide the sensor out. Leave the wire attached if it reaches.', why: 'Hold it by the porcelain, not the rod.', v: { cam: [0.05, 0.88, 0.55], at: [0.24, 0.8, 0.04], hi: ['sensor'], mv: { sensor: [0.06, 0.02, 0.18] }, tool: { id: 'screwdriver', at: [0.225, 0.812, 0.12], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Clean the rod gently', d: 'Rub the rod lightly with emery cloth or a fine pad until it’s bright. Wipe off the dust; don’t touch it with bare fingers.', why: 'The oxide is an insulator. Cleaning restores the path for the microamp signal.', v: { cam: [0.05, 0.88, 0.6], at: [0.26, 0.81, 0.12], hi: ['sensorRod', 'pad'], show: ['pad'], hide: ['oxide'], mv: { sensor: [0.06, 0.02, 0.18], pad: [-0.1, -0.02, -0.03] } } },
        { t: 'Reinstall and test', d: 'Slide the sensor back, tighten the screw, replace the door, power on and call for heat. The burners should stay lit.', why: 'If it still drops out, check the sensor’s wire and the burner ground, then call a pro.', v: { cam: [0.15, 0.92, 0.85], at: [0, 0.77, -0.08], hi: ['flames'], hide: ['pad'], mv: { sensor: [0, 0, 0] }, fx: 'fire' } },
      ],
      learn: {
        how: 'Gas furnaces prove there’s a flame before they keep the gas valve open. The control sends AC voltage to the sensor rod. Flame conducts a tiny current from the rod to the grounded burner, and because the burner’s area is much bigger, the current flows mostly one way (rectification). The board looks for that DC current, just a few microamps. Oxide on the rod drops it below the threshold, and the board shuts the gas off for safety.',
        specs: [['Normal flame signal', '2–6 µA DC'], ['Typical retries before lockout', '3'], ['Lockout reset', 'Power off 30 s or wait 1 hr']],
        terms: [['Flame rectification', 'How the board senses flame through the sensor rod.'], ['Hot-surface igniter (HSI)', 'Glowing ceramic element that lights the gas.'], ['Lockout', 'The board stops trying after repeated failures.']],
        mistakes: ['Using coarse sandpaper (scratches hold oxide faster).', 'Touching or bumping the igniter.', 'Bending the rod out of the flame.'],
        tips: ['Clean the sensor each fall when you change the filter.'],
      },
      pro: 'The furnace still locks out, the burner flames are yellow or lift off, you see soot, or you smell gas.',
    },
    {
      id: 'condensate-drain',
      title: 'Clear the AC condensate drain',
      model: 'condensate',
      level: 1,
      time: '30 min',
      cost: '$0–10',
      summary: 'Your AC pulls gallons of water out of the air each day. When algae plugs the drain line, the pan overflows or a float switch shuts the AC off.',
      intro: { hi: ['panWater', 'trap'], xray: true },
      safety: ['Turn the system off at the thermostat and the furnace switch.', 'Use vinegar, not bleach mixed with anything else.'],
      causes: [['Algae / slime in the trap', 'Warm, wet and dark: ideal for growth.'], ['Float switch tripped', 'The AC stops cooling but the fan may still run.'], ['Kinked or sagging line', 'Water pools in the low spot.']],
      tools: ['Wet/dry vac', 'Funnel', 'White vinegar (1 cup)', 'Duct tape or a rag', 'Towels', 'Flashlight'],
      steps: [
        { t: 'Power off', d: 'Thermostat to OFF and the furnace service switch off.', why: 'Stops more condensate while you work.', v: { cam: [1.2, 1.3, 1.5], at: [0.15, 0.8, 0], hi: ['furnace'] } },
        { t: 'Check the pan and float switch', d: 'Look for standing water in the pan or around the furnace base. Note whether the float switch is lifted.', why: 'A float switch cuts the AC when water rises. That’s why the AC may stop with no other symptoms.', v: { cam: [0.8, 1.3, 0.8], at: [0.3, 1.05, 0.15], hi: ['floatSwitch', 'drainPan'], xray: true } },
        { t: 'Vacuum from the outlet', d: 'At the end of the line (floor drain or outside), seal the vac hose over the pipe with tape or a rag and run it for 1–2 minutes.', why: 'Pulling the clog out the way water flows is easier than pushing it deeper.', v: { cam: [1.3, 0.6, 1.2], at: [0.75, 0.15, 0.3], hi: ['vac', 'floorDrain'], show: ['vac'] } },
        { t: 'Open the cleanout', d: 'Pull the cap off the vent tee near the coil cabinet.', why: 'This T is the access point for flushing and inspection.', v: { cam: [0.7, 1.3, 0.7], at: [0.41, 1.1, 0.15], hi: ['cap', 'cleanout'], mv: { cap: [0.06, 0.08, 0.04] } } },
        { t: 'Flush with vinegar', d: 'Pour a cup of white vinegar into the tee, wait 30 minutes, then pour in water and watch it run freely at the outlet.', why: 'Vinegar kills the biofilm without harming the PVC or the coil.', v: { cam: [0.7, 1.3, 0.7], at: [0.45, 1.0, 0.15], hi: ['funnel', 'trap', 'line'], show: ['funnel'], hide: ['vac'], xray: true, fx: 'clear' } },
        { t: 'Cap it and restore power', d: 'Replace the cap (don’t glue it), restore power and run the AC. Check the outlet drips within 15–30 minutes.', why: 'The cap keeps air from being pulled through the vent, which can stop drainage.', v: { cam: [1.2, 1.3, 1.5], at: [0.3, 0.8, 0.1], hi: ['line'], hide: ['funnel'], mv: { cap: [0, 0, 0] }, fx: 'clear' } },
      ],
      learn: {
        how: 'The indoor coil runs below the dew point, so moisture in the air condenses on it like water on a cold glass. That water drips into a pan and drains by gravity through a trapped line. The trap stops the blower from pulling air up the drain. The trap’s standing water is also where algae grows.',
        specs: [['Condensate per day', '5–20 gal in humid weather'], ['Line size', '¾″ PVC'], ['Slope', '≥ ⅛″ per foot'], ['Flush interval', 'Every 3–6 months in cooling season']],
        terms: [['Primary drain', 'The main line from the pan.'], ['Secondary / emergency pan', 'Backup pan under attic units.'], ['Float switch', 'Safety switch that shuts the AC off on high water.']],
        mistakes: ['Gluing the cleanout cap on.', 'Using a pressure washer or compressed air that can blow joints apart.', 'Ignoring water stains on a ceiling under an attic unit.'],
        tips: ['Drop a condensate pan tablet in the pan each spring to slow algae growth.'],
      },
      pro: 'Water keeps backing up after flushing, the coil is iced over, or the pan is rusted through.',
    },
    {
      id: 'wh-element',
      title: 'No hot water (electric heater)',
      model: 'waterheaterElec',
      level: 3,
      time: '1.5–2.5 hrs',
      cost: '$15–40',
      summary: 'When an electric water heater gives no hot water or runs out fast, a tripped high-limit or a burned-out element is the usual cause. A multimeter tells you which.',
      intro: { hi: ['elemUp', 'elemLow'], xray: true },
      safety: ['240 V can kill. Turn off the breaker and verify with a tester at the thermostat terminals before touching anything.', 'Never power the heater unless the tank is full.', 'Leave the plastic terminal guards in place when you reassemble.'],
      causes: [['Tripped high-limit (ECO)', 'No hot water at all; press the red reset.'], ['Burned-out upper element', 'No hot water at all.'], ['Burned-out lower element', 'Some hot water, runs out fast.'], ['Failed thermostat', 'Elements test good but don’t heat.']],
      tools: ['Non-contact voltage tester', 'Multimeter', 'Screwdriver', '1½″ element wrench or socket', 'Replacement element (same voltage & wattage)', 'Garden hose'],
      steps: [
        { t: 'Breaker off and verify', d: 'Turn off the double-pole breaker. Remove the upper access cover and test the thermostat terminals with a voltage tester.', why: 'Water heaters are often on mislabeled breakers. Verify, don’t trust.', v: { cam: [0.7, 1.15, 0.8], at: [0, 1.05, 0.28], hi: ['coverUp'], mv: { coverUp: [0.25, 0, 0.25] }, tool: { id: 'voltTester', at: [0.02, 1.08, 0.3], rot: [80, 0, 0] } } },
        { t: 'Press the reset', d: 'Fold back the insulation and press the red RESET button above the upper thermostat. If it clicks, it had tripped.', why: 'The high-limit cuts power if water gets too hot. One trip may be a fluke; repeated trips mean a failed thermostat or a shorted element.', v: { cam: [0.5, 1.15, 0.6], at: [0, 1.1, 0.28], hi: ['resetBtn'], mv: { coverUp: [0.25, 0, 0.25], insulUp: [0, -0.12, 0.08] } } },
        { t: 'Test each element', d: 'With power off, disconnect one wire from an element and set the meter to ohms. Measure across its two screws.', why: 'A 4500 W, 240 V element reads about 13 Ω. An open (OL) reading means it’s burned out.', v: { cam: [0.5, 1.0, 0.6], at: [0, 1.0, 0.28], hi: ['elemUp'], mv: { coverUp: [0.25, 0, 0.25], insulUp: [0, -0.12, 0.08] }, tool: { id: 'multimeter', at: [0.3, 0.86, 0.42], rot: [0, -40, 0] } } },
        { t: 'Drain the tank', d: 'Close the cold supply, open a hot tap, hook a hose to the drain and drain until water is below the element you’re replacing.', why: 'Elements thread through the tank wall. Pull one with water above it and you get a flood.', v: { cam: [1.3, 0.8, 1.6], at: [0.4, 0.3, 0.4], hi: ['drain', 'hose'], show: ['hose'], fx: 'drain' } },
        { t: 'Swap the element', d: 'Disconnect both wires, unscrew the element counterclockwise with the element wrench, and thread in the new one with its new gasket.', why: 'The gasket seals on the tank face; don’t reuse the old one.', v: { cam: [0.6, 0.45, 0.8], at: [0, 0.26, 0.28], hi: ['elemLow', 'newElement'], show: ['newElement'], mv: { coverLow: [0.25, 0, 0.25], insulLow: [0, -0.12, 0.08], elemLow: [0, 0, 0.25] }, xray: true, tool: { id: 'ratchet', at: [0, 0.255, 0.32], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Refill before power', d: 'Close the drain, open the cold valve, and run a hot tap until it flows without sputtering. Check for leaks at the element.', why: 'An element energized in air burns out in seconds.', v: { cam: [1.3, 1.25, 1.6], at: [0, 0.8, 0], hi: ['tank'], hide: ['hose', 'newElement'], mv: { elemLow: [0, 0, 0] } } },
        { t: 'Reassemble and power on', d: 'Reconnect wires, replace insulation, guards and covers, then turn the breaker on. Hot water in 30–60 minutes.', why: 'The covers keep insulation in place and live terminals covered.', v: { cam: [1.3, 1.25, 1.6], at: [0, 0.8, 0], hi: ['coverUp', 'coverLow'], mv: { coverUp: [0, 0, 0], coverLow: [0, 0, 0], insulUp: [0, 0, 0], insulLow: [0, 0, 0] } } },
      ],
      learn: {
        how: 'An electric tank has two elements, but only one heats at a time. The upper thermostat has priority: it heats the top of the tank first, then hands power to the lower thermostat. That’s why a dead upper element means no hot water at all, while a dead lower element means a small amount that runs out fast.',
        specs: [['Common element', '4500 W at 240 V'], ['Good element reading', '≈ 11–16 Ω'], ['Element thread', '1″ NPSM, 1½″ hex'], ['Recommended setting', '120 °F']],
        terms: [['ECO / high-limit', 'Emergency cutoff that trips around 170–180 °F.'], ['Dry fire', 'Powering an element without water. Instant failure.'], ['Screw-in element', 'Most common type; some older tanks use 4-bolt flanges.']],
        mistakes: ['Powering the heater before it’s full.', 'Buying a 120 V element for a 240 V heater.', 'Setting the two thermostats far apart.'],
        tips: ['If elements keep burning out, check the anode rod and water hardness. Scale buildup overheats them.'],
      },
      pro: 'Elements and thermostats test good but there’s still no heat, the wiring is scorched, or the tank is leaking.',
    },
  ]);
})();
