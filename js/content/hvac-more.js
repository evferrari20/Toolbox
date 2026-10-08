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
        { t: 'Turn the breaker off', d: 'In the main panel, find the double-width breaker labeled water heater (usually 30 A) and switch it OFF. Then hold a non-contact voltage tester (a pen-shaped tester that beeps near live wires) against the thick cable at the top of the tank.', why: 'Elements must never be powered without water around them; a dry element burns out in seconds. Breakers are often mislabeled, so the tester proves the power is really off.', tip: 'Test the tester first on a live outlet so you know it works. Then put a strip of tape and a note on the breaker (“Water heater draining, do not turn on”) so nobody flips it back.', ok: 'The tester beeps at a live outlet but stays silent at the water heater cable.', v: { cam: [1.2, 1.8, 1.4], at: [0.12, 1.5, -0.12], hi: ['jbox'] } },
        { t: 'Close the cold supply', d: 'Find the shutoff on the cold pipe at the top of the tank, often marked blue. Turn a lever 90° so it crosses the pipe, or turn a round handle clockwise until it stops.', why: 'This stops fresh water from refilling the tank as you drain it.', tip: 'The hot outlet pipe feels warm and the cold one doesn’t. If an old round handle won’t turn by hand, don’t force it; shut the house main valve instead.', ok: 'The lever sits crosswise to the pipe, or the handle won’t turn any farther.', v: { cam: [0.6, 1.9, 0.8], at: [-0.12, 1.62, 0], hi: ['coldValve'], rt: { coldValve: [0, 90, 0] } } },
        { t: 'Hook a hose to the drain', d: 'Screw a garden hose hand-tight onto the drain valve near the bottom of the tank. Run the other end to a floor drain or outdoors, lower than the valve the whole way.', why: 'The tank empties by gravity, so the hose must run downhill.', tip: 'Use a rubber hose with a good washer, since hot water softens cheap vinyl. Weigh the far end down with a brick so it can’t flip out of the drain.', ok: 'The hose runs downhill with no high loops and its end is secured.', v: { cam: [1.2, 0.6, 1.4], at: [0.4, 0.1, 0.4], hi: ['drain', 'hose'], show: ['hose'] } },
        { t: 'Open a hot tap, then the drain', d: 'Open a hot faucet in the house all the way. Then turn the drain valve counterclockwise (or turn its slot with a flat screwdriver) until water flows strongly out of the hose.', why: 'The open tap lets air in so the tank doesn’t form a vacuum and slow to a trickle.', tip: 'Weak flow usually means sediment in the valve. Open and close it quickly a few times to break the plug loose. If an old plastic valve feels like it will crack, stop and call a plumber.', ok: 'Water pours steadily from the hose, often cloudy at first.', v: { cam: [1.2, 0.6, 1.4], at: [0.4, 0.1, 0.4], hi: ['drain'], fx: 'drain' } },
        { t: 'Stir and flush', d: 'When the flow slows near empty, open the cold valve for 10–20 seconds, then close it. Repeat these bursts until water from the hose runs clear.', why: 'The bursts lift the crust off the tank bottom. Electric tanks also collect scale around the lower element, and flushing helps it last.', tip: 'Catch some water in a clear jar each round. When nothing settles after a minute, you’re done. Lots of white chips that look like eggshell are normal in hard-water areas.', ok: 'A jar of drain water is clear with no grit settling on the bottom.', v: { cam: [1.3, 1.0, 1.6], at: [0, 0.3, 0], hi: ['sediment', 'elemLow'], xray: true, fx: 'drain', rt: { coldValve: [0, 0, 0] } } },
        { t: 'Refill fully, then power on', d: 'Close the drain and remove the hose. Open the cold valve fully and leave the hot faucet open until it runs a smooth, steady stream with no spitting. Only then turn the breaker back on.', why: 'Spitting at the faucet means air is still trapped at the top of the tank, where the upper element sits. Powering it in air burns it out instantly.', tip: 'Wait a full extra minute of smooth flow before you touch the breaker; it costs nothing and saves a $30 element. Expect hot water again in 30–60 minutes.', ok: 'The faucet runs smooth with no air, the drain valve is dry, and the tank feels warm about an hour later.', v: { cam: [1.3, 1.25, 1.6], at: [0, 0.8, 0], hi: ['tank'], hide: ['hose', 'sediment'] } },
      ],
    },
    {
      id: 'tankless',
      name: 'Tankless',
      blurb: 'Wall-mounted box with isolation valves underneath. Descale instead of flush.',
      model: 'tankless',
      time: '1.5 hrs',
      cost: '$15–150',
      summary: 'Tankless heaters don’t collect sediment in a tank. Scale builds inside the narrow heat exchanger instead. Once a year, a small pump loops 4 gallons of white vinegar through the service ports for an hour to dissolve it.',
      intro: { hi: ['hx', 'coldIso', 'hotIso'], xray: true },
      safety: ['Unplug the unit or turn off its breaker; for gas units also shut the gas valve.', 'Close both isolation valves before opening the service ports; they’re under house pressure.', 'Wear safety glasses; vinegar sprays sting eyes if a hose pops off.', 'Never run a gas heater with the service ports open.'],
      causes: [['Hard-water scale', 'Restricts flow and triggers overheating codes.'], ['Scale reminder code', 'Some units show a code when it’s time; Rinnai shows LC (lime check).'], ['Clogged inlet filter', 'Low flow or temperature swings at the tap.']],
      tools: ['Descaling kit: submersible pump + 2 washing-machine hoses', '5-gal bucket', '4 gal undiluted white vinegar (or descaler)', 'Adjustable wrench or pliers', 'Old toothbrush', 'Towels', 'Safety glasses'],
      steps: [
        { t: 'Turn the power off', d: 'Unplug the heater’s cord from the wall, or switch off its breaker if it’s hard-wired. On a gas model, also turn the yellow-handled gas valve under it so the handle crosses the pipe.', why: 'The burner must not try to fire while the water path is open and full of vinegar.', tip: 'Press a hot-water button on the unit’s display or open a hot tap: if the screen stays dark, the power is really off.', ok: 'The unit’s display is blank and the gas valve handle sits crosswise to the pipe.', v: { cam: [0.9, 1.2, 1.2], at: [0.3, 1.05, -0.18], hi: ['power'] } },
        { t: 'Close both isolation valves', d: 'Under the heater are two main valves: blue handle on the cold pipe and red on the hot. Turn each handle so it sits crosswise to its pipe.', why: 'This cuts the heater off from the house plumbing so the vinegar loops through the heater only, not into your faucets.', tip: 'Each valve also has a small side port with a cap and its own little handle. Leave those closed for now; they are the service ports you will use next.', ok: 'Both main handles sit crosswise to their pipes, and a hot tap in the house gets no flow from the heater.', v: { cam: [0.6, 1.1, 0.8], at: [0, 0.95, 0], hi: ['coldIso', 'hotIso'], rt: { coldIso: [0, 0, 0] } } },
        { t: 'Hook up the hoses', d: 'Unscrew the caps from the two service ports. Screw one hose from the pump’s outlet onto the cold-side port, and a second hose onto the hot-side port. Set the pump and the end of the hot hose in a 5-gallon bucket holding 4 gallons of undiluted white vinegar.', why: 'The pump pushes vinegar in the cold side, through the heat exchanger, and back out the hot side into the bucket in a loop.', tip: 'Washing-machine hoses with rubber washers fit the ports and don’t leak. Keep a towel under the valves; a cup or so of water will dribble out when the ports open.', ok: 'Both hoses are snug on the ports and both hose ends and the pump sit inside the bucket.', v: { cam: [0.9, 1.0, 1.2], at: [0, 0.7, 0.15], hi: ['coldIsoPort', 'hotIsoPort', 'hoses'], show: ['pumpKit', 'hoses'] } },
        { t: 'Open the ports and circulate', d: 'Turn both service-port handles open (in line with the port). Plug in the pump and let the vinegar circulate for at least 1 hour.', why: 'Acetic acid in vinegar dissolves the calcium scale coating the heat exchanger. Keeping it moving keeps fresh acid against the scale.', tip: 'Watch the bucket for the first few minutes: you should see a steady return stream. If the vinegar foams or turns cloudy, that is scale dissolving. Very hard water? Do a second hour with fresh vinegar.', ok: 'Vinegar flows steadily back into the bucket from the hot hose for the full hour.', v: { cam: [1.2, 1.4, 1.8], at: [0, 1.0, 0.1], hi: ['hx', 'hoses'], xray: true, fx: 'circulate' } },
        { t: 'Rinse with fresh water', d: 'Unplug the pump. Lift the pump out of the bucket, empty the vinegar down a drain, and set the hot hose into the empty bucket or a drain. Remove the cold hose from the port and slowly open the main cold valve, letting fresh water run through the heater and out the hot hose for 5 minutes.', why: 'Leftover vinegar would taste sour at the tap and, over time, can wear seals.', tip: 'Smell the water coming out after 5 minutes: if you can still smell vinegar, run it a few more minutes.', ok: 'Water from the hot hose runs clear and smells like plain water.', v: { cam: [0.9, 1.0, 1.2], at: [0, 0.7, 0.15], hi: ['coldIso'] } },
        { t: 'Clean the inlet filter', d: 'Close the main cold valve again. Unscrew the small inlet filter where the cold water enters the heater, rinse the mesh screen under a tap with an old toothbrush, and screw it back in hand-tight.', why: 'This screen catches grit and scale flakes before they reach the heat exchanger, and a blocked one cuts flow.', tip: 'Have a towel ready; a little water comes out when it unscrews. If its O-ring looks flattened or cracked, replace it so the filter doesn’t drip.', ok: 'The mesh is clean with no grit, and the filter is snug with no drip.', v: { cam: [0.5, 1.2, 0.6], at: [-0.09, 1.14, 0.03], hi: ['inletFilter'], mv: { inletFilter: [0, -0.05, 0.08] } } },
        { t: 'Close up and power on', d: 'Remove the hoses, close both service-port handles and screw their caps back on. Open the hot and cold main valves. Run a hot faucet until it flows steadily with no spitting, then plug the unit back in or turn its breaker on, and open the gas valve.', why: 'Purging air from the heater first prevents an ignition error and sputtering taps.', tip: 'If the display shows an error after restarting, turn it off and on once. A scale-reminder code (Rinnai shows LC) may need a reset per the manual.', ok: 'Hot water reaches the faucet within a minute or so, and the valves and filter are dry.', v: { cam: [1.2, 1.5, 1.9], at: [0, 1.05, 0], hi: ['unit'], hide: ['pumpKit', 'hoses'], mv: { inletFilter: [0, 0, 0] } } },
      ],
      tricks: [
        ['Install valve kit first', 'If your heater has no service valves (blue and red handles with side ports), have a plumber add an isolation valve kit. It turns every future flush into a 10-minute setup.'],
        ['Buy a flush kit once', 'A small submersible pump with two hoses costs about $40–80. It pays for itself the first time compared with a service call.'],
        ['Food-grade vinegar is enough', 'Plain undiluted white vinegar is what Rinnai specifies. Commercial descalers work too; follow their label and rinse well.'],
        ['Mark the calendar', 'Flush every 12 months, or every 6 months with very hard water, even if no code appears. Scale builds silently.'],
        ['Clean the air filter too', 'Many gas tankless units also have an air intake screen. Wipe it while you’re there so the burner breathes freely.'],
      ],
      learn: {
        how: 'A tankless heater fires a burner (or high-power elements) only when it senses flow, heating water as it passes through a narrow heat exchanger. Those narrow passages are where minerals deposit. Even a thin scale layer insulates the metal, so the unit overheats and throws codes.',
        specs: [['Descale interval', 'Every 12 months (6 in hard water)'], ['Vinegar volume', '4 gal undiluted (Rinnai)'], ['Circulation time', 'at least 1 hr'], ['Pump rate', '≈ 3–4 gpm'], ['Fresh-water rinse', '5 min'], ['Minimum flow to fire', '≈ 0.4–0.5 gpm']],
        terms: [['Isolation valves', 'Valve kit with service ports for flushing.'], ['Heat exchanger', 'Coiled tubing where water picks up heat.'], ['Scale', 'Calcium and magnesium carbonate deposits.']],
        mistakes: ['Opening service ports with the main valves still open.', 'Forgetting to power off.', 'Skipping the inlet filter.', 'Skipping the fresh-water rinse.'],
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
      safety: ['Turn off the furnace power switch or breaker. It’s only 24 V, but shorting R to C can blow the control-board fuse.', 'Mercury thermostats must be recycled, never trashed. Don’t break the glass bulb.', 'If the old thermostat contains a glass mercury bulb, recycle it as hazardous waste.', 'If the old one is marked 120 V or 240 V (thick wires, baseboard heat), it’s a line-voltage model. Different job.'],
      causes: [['Upgrade to smart / programmable', 'Setting back 7–10 °F for 8 hours a day can save up to about 10% on heating and cooling.'], ['Dead display or no response', 'Batteries first; then the thermostat.'], ['Short cycling', 'A failing or badly placed thermostat.']],
      tools: ['Small screwdriver set', 'Phone for photos', 'Wire labels (included with thermostat)', 'Drill and drywall anchors', 'Small level', 'Pencil', 'Wire stripper', 'C-wire adapter if needed'],
      steps: [
        { t: 'Turn off power at the furnace', d: 'Turn off the furnace or air handler’s service switch (it looks like a light switch on or near the unit) or its breaker in the panel.', why: 'The thermostat’s 24-volt power comes from a small transformer inside the furnace. A loose wire touching another can blow the control board’s fuse.', tip: 'Set the old thermostat to HEAT and turn it up first. When you flip the switch and the furnace goes silent, you’ve proven the right switch is off.', ok: 'The furnace stays silent and the old thermostat’s screen goes blank (if it had one).', v: { cam: [0.6, 1.3, 0.5], at: [0.45, 1.2, 0], hi: ['furnaceSwitch'], rt: { furnaceSwitch: [0, 0, 0] } } },
        { t: 'Take the faceplate off', d: 'Gently pull the thermostat body straight off its wall plate, or loosen the small screw at the bottom first if it has one. Some older models swing up from a hinge.', why: 'Behind the body is the wall plate (base) where the wires attach.', tip: 'If it won’t pull off, look for a tab on the bottom edge to press, or a slot for a coin. Prying with a screwdriver can crack the case.', ok: 'You can see the wall plate with wires attached to lettered screws or clips.', v: { cam: [0.3, 1.45, 0.45], at: [0, 1.4, 0], hi: ['oldStat'], mv: { oldStat: [0.12, -0.08, 0.18] } } },
        { t: 'Photo and label every wire', d: 'Take a clear, close photo of the terminals. Wrap a label from the new thermostat’s kit around each wire with its terminal letter: R, W, Y, G, C, and others such as O/B or Rc. Note any short jumper wire between two terminals.', why: 'Wire colors are only habits, not rules. The letter of the terminal each wire was on is what tells the new thermostat its job.', tip: 'If a wire sits under a terminal labeled Rh and another under Rc, label them exactly that way. Also count wires that are pushed back in the wall unused; one may later become your C wire.', ok: 'Every connected wire has a letter label that matches your photo.', v: { cam: [0.14, 1.43, 0.22], at: [0, 1.41, 0.01], hi: ['wires', 'tags'], show: ['tags'], hide: ['oldStat'] } },
        { t: 'Remove the old base', d: 'Loosen each terminal screw and free the wires. Unscrew the base from the wall. Wrap the bundle of wires loosely around a pencil laid across the hole so it can’t slip back into the wall.', why: 'Fishing a dropped thermostat cable out of a wall cavity can take an hour or more.', tip: 'If the old thermostat has a glass bulb with silvery liquid inside, it contains mercury. Bag it and take it to a thermostat recycling drop-off; it must not go in the trash.', ok: 'The old base is off, and the wires stick out of the hole held by the pencil.', v: { cam: [0.2, 1.45, 0.3], at: [0, 1.4, 0], hi: ['oldBase'], mv: { oldBase: [-0.15, -0.1, 0.15] } } },
        { t: 'Mount the new base', d: 'Feed the wires through the new base. Hold it on the wall with a small level on top, mark the screw holes with a pencil, then drill and screw it on, using the plastic anchors from the box if there is no stud behind.', why: 'Many smart thermostats need to sit level so the display looks right and the sensors read correctly.', tip: 'Old paint shadows or holes showing? Many brands sell a trim plate for this. If a screw just spins, that hole needs an anchor: drill to the size printed on the anchor bag and tap it in flush.', ok: 'The base is level, tight against the wall and doesn’t wiggle when you push it.', v: { cam: [0.2, 1.45, 0.3], at: [0, 1.4, 0], hi: ['newBase'], show: ['newBase'], hide: ['oldBase'] } },
        { t: 'Connect the wires by letter', d: 'Push each wire into the terminal with its matching letter. Each wire needs about ¼″ of bare, straight copper. Give each a light tug to be sure it’s held. Most smart models need a C wire; if you don’t have one, install the adapter that came with the thermostat at the furnace.', why: 'R brings 24 V power. W calls for heat, Y for cooling, G for the fan. C completes the circuit so a Wi-Fi thermostat stays powered without draining batteries.', tip: 'If the copper end is bent or nicked, snip it off and strip a fresh ¼″. Push-in terminals usually have a tab you press to open them; the wire should click in and not pull out.', ok: 'Each wire sits in its labeled terminal and stays put when you tug it gently.', v: { cam: [0.14, 1.43, 0.2], at: [0, 1.41, 0.01], hi: ['wires', 'newBase'], xray: true } },
        { t: 'Attach, power on and test', d: 'Snap the thermostat body onto the base until it clicks. Turn the furnace switch back on and follow the setup screens, telling it which terminals you used. Test HEAT, then FAN, then COOL; the AC may wait up to 5 minutes before starting.', why: 'The setup asks which wires you connected. Answering by terminal letter lets it control each part of the system correctly.', tip: 'If the screen stays blank, check the furnace door is fully closed (it presses a safety switch) and the R and C wires are seated. If heat runs when you call for cool on a heat pump, switch the O/B setting in the menu.', ok: 'The furnace starts on a heat call, the fan runs alone on FAN, and cool air arrives on a cool call.', v: { cam: [0.25, 1.45, 0.42], at: [0, 1.4, 0], hi: ['newStat'], show: ['newStat'], hide: ['tags'], fx: 'on' } },
      ],
      tricks: [
        ['Check compatibility first', 'Before buying, photo your wires and use the maker’s online compatibility checker. It tells you if you need a C wire adapter or a different model.'],
        ['Find a hidden C wire', 'Look for an unused wire folded back in the wall and at the furnace board. Connecting it to C at both ends gives clean, reliable power.'],
        ['Label at the furnace too', 'Photograph the wiring at the furnace control board before you start. If anything goes wrong, you can see where every thermostat wire lands.'],
        ['Mount it in the right spot', 'About 5′ above the floor on an inside wall, away from supply vents, sunny windows, lamps and the kitchen. A bad spot makes even a perfect thermostat run wrong.'],
        ['Blown fuse recovery', 'If nothing powers up, check for a small 3–5 A fuse on the furnace board. A shorted R wire blows it; replace it with the same rating and recheck the wiring.'],
        ['Recycle mercury units', 'Old round or lever thermostats may hold a mercury bulb. Many hardware stores and HVAC suppliers take them for free recycling.'],
      ],
      refs: [
        ['Thermostat installation instructions, mounting location (Resideo/Honeywell Home)', 'https://customer.resideo.com/resources/Techlit/TechLitDocuments/33-00000s/33-00622EFS.pdf'],
        ['Power Extender Kit installation sheet (ecobee)', 'https://industrialstores.com/media/industrialstores/product/attachments/Ecobee-EB-PEK-01-Power-Extender-Kit-Installation-Sheet.pdf'],
        ['Mercury thermostat recycling (Maine DEP)', 'https://www.maine.gov/dep/mercury/hgthermo.html'],
        ['How to dispose of mercury-bulb thermostats (ACHR News)', 'https://www.achrnews.com/articles/88951-how-to-dispose-of-mercury-bulb-thermostats'],
      ],
      learn: {
        how: 'The furnace has a 24-volt transformer. The R wire carries that power to the thermostat. When the room needs heat, the thermostat connects R to W; for cooling, R to Y (and G for the fan). Those connections tell the furnace control board what to do. A smart thermostat needs continuous power for Wi-Fi, which is what the C (common) wire provides.',
        specs: [['Control voltage', '24 V AC'], ['Mounting height', 'about 5′ (1.5 m) on an inside wall (Resideo)'], ['Bare wire end', '≈ ¼″'], ['AC restart delay', 'up to 5 min'], ['Typical savings', 'up to about 10% with setbacks']],
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
      tools: ['¼″ nut driver', 'Fine steel wool, fine emery cloth or a fine abrasive pad', 'Clean paper towel', 'Flashlight', 'Phone (to film the blink code)'],
      steps: [
        { t: 'Watch the cycle and read the code', d: 'With the door on, turn the thermostat up for heat. Look through the small window in the door: the igniter glows orange, the burners light, then go out after 3–10 seconds. Count the blinks of the status light and look them up on the chart inside the door.', why: 'The blink code is the furnace telling you what failed. A “flame not sensed” or “flame lost” code points straight at the sensor.', tip: 'Film the status light with your phone so you can count blinks without guessing, and photo the code chart. Then turn the thermostat back down.', ok: 'You’ve seen the burners light then quit, and you have a blink code that matches the chart.', v: { cam: [0.6, 0.6, 0.8], at: [-0.15, 0.45, 0.2], hi: ['led'], fx: 'code' } },
        { t: 'Power off and open the door', d: 'Set the thermostat to OFF, then turn off the furnace’s service switch (it looks like a light switch on or near the furnace). Lift the front panel up and off.', why: 'The panel presses a safety switch, so the furnace can’t run with it off. With power off you won’t trigger the igniter.', tip: 'Turn the gas valve on the furnace to OFF too if you’ll be near the burners for long. Set the door aside where you won’t step on it.', ok: 'The furnace is silent and you can see the burners and igniter.', v: { cam: [0.15, 0.92, 0.85], at: [0, 0.77, -0.08], hi: ['door'], mv: { door: [0.75, -0.2, 0.4] }, rt: { door: [0, -30, 0] } } },
        { t: 'Find the flame sensor', d: 'Look at the burners: at one end is the igniter (a flat gray or white ceramic piece). At the other end, poking into the last burner’s flame, is the flame sensor: a thin bent metal rod with a white porcelain base and a single wire.', why: 'It sits in the flame of the farthest burner so it proves the flame carried across all of them.', tip: 'Don’t touch the igniter at all; skin oil and a light knock can crack it, and it costs $25–60 to replace. If you aren’t sure which part is which, follow the single wire back to the board.', ok: 'You can point to a thin rod with a porcelain base held by one screw.', v: { cam: [0.06, 0.88, 0.5], at: [0.2, 0.79, -0.06], hi: ['sensor'], hide: ['door'] } },
        { t: 'Remove the sensor', d: 'Remove its single screw with a ¼″ nut driver and slide the sensor straight out. Leave the wire attached if it reaches; if not, pull the push-on connector off by its metal end, not the wire.', why: 'Hold it by the porcelain base, never the rod, so you don’t bend it out of position or add skin oil.', tip: 'If the screw is stiff, use a nut driver rather than pliers so it doesn’t round off. Set the screw in a cup; they love to fall into the burner box.', ok: 'The sensor is in your hand with the rod straight and the porcelain uncracked.', v: { cam: [0.05, 0.88, 0.55], at: [0.24, 0.8, 0.04], hi: ['sensor'], mv: { sensor: [0.06, 0.02, 0.18] }, tool: { id: 'screwdriver', at: [0.225, 0.812, 0.12], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Clean the rod gently', d: 'Rub the metal rod lightly with fine steel wool, a fine abrasive pad or fine emery cloth until it looks bright. Wipe off the dust with a clean paper towel. Don’t touch the rod with bare fingers.', why: 'The dull film is an oxide that insulates the rod. Removing it restores the path for the few millionths of an amp the board looks for.', tip: 'Light pressure is enough: you’re polishing, not sanding. Avoid coarse sandpaper, whose scratches let oxide come back faster. If the porcelain is cracked, buy a new sensor ($10–25) instead.', ok: 'The rod is evenly bright metal with no dark film or white crust.', v: { cam: [0.05, 0.88, 0.6], at: [0.26, 0.81, 0.12], hi: ['sensorRod', 'pad'], show: ['pad'], hide: ['oxide'], mv: { sensor: [0.06, 0.02, 0.18], pad: [-0.1, -0.02, -0.03] } } },
        { t: 'Reinstall and test', d: 'Slide the sensor back in exactly where it was and tighten the screw snug. Reconnect the wire, turn the gas back on if you shut it, replace the door, switch on power and call for heat. The burners should stay lit.', why: 'If it still drops out, the problem may be the sensor’s wire, a poor burner ground, or the control board.', tip: 'Leave the thermostat calling for heat for a full cycle (10+ minutes). Some boards reset a lockout only after power has been off for 30 seconds, so cycle the switch if it won’t try at all.', ok: 'The burners light and stay lit with steady blue flames, and warm air reaches the vents.', v: { cam: [0.15, 0.92, 0.85], at: [0, 0.77, -0.08], hi: ['flames'], hide: ['pad'], mv: { sensor: [0, 0, 0] }, fx: 'fire' } },
      ],
      tricks: [
        ['Read the code before you touch anything', 'The blink-code chart on the door tells you whether it’s the flame sensor, a pressure switch or a limit switch. It saves you cleaning the wrong part.'],
        ['Clean it every fall', 'Add a 5-minute sensor cleaning to your fall filter change. A clean sensor rarely causes a midwinter no-heat call.'],
        ['Steel wool beats sandpaper', 'Fine steel wool or a fine abrasive pad polishes without deep scratches. Coarse sandpaper leaves grooves that hold oxide.'],
        ['Keep a spare sensor', 'A replacement sensor costs $10–25. If yours is cracked or keeps fouling quickly, swap it and keep the old one as a backup.'],
        ['Check the ground', 'If a clean sensor still drops out, look at the green ground wire and the burner’s mounting screws. Rust or a loose ground kills the flame signal.'],
        ['Watch the flame color', 'Healthy burner flames are steady and blue. Yellow, lazy or lifting flames mean a combustion problem for a technician, not a sensor issue.'],
      ],
      refs: [
        ['Furnace flame sensor: what it is and how to fix it (Carrier)', 'https://www.carrier.com/us/en/residential/hvac-resources/furnaces/furnace-flame-sensor/'],
        ['Gas furnace flame sensor troubleshooting and cleaning (PickHVAC)', 'https://www.pickhvac.com/gas-furnace-flame-sensor-troubleshooting-cleaning/'],
        ['How to find and clean a flame sensor in a Lennox furnace (Hunker)', 'https://www.hunker.com/13408939/how-to-find-clean-a-flame-sensor-in-a-lennox-furnace'],
      ],
      learn: {
        how: 'Gas furnaces prove there’s a flame before they keep the gas valve open. The control sends AC voltage to the sensor rod. Flame conducts a tiny current from the rod to the grounded burner, and because the burner’s area is much bigger, the current flows mostly one way (rectification). The board looks for that DC current, just a few microamps. Oxide on the rod drops it below the threshold, and the board shuts the gas off for safety.',
        specs: [['Normal flame signal', 'about 2–6 µA DC (Carrier often 4–6)'], ['Drop-out', 'below roughly 0.5–1 µA, varies by board'], ['Typical retries before lockout', '3–4'], ['Lockout reset', 'power off 30 s, or wait 1 hr for auto retry'], ['Sensor screw', '¼″ hex']],
        terms: [['Flame rectification', 'How the board senses flame through the sensor rod.'], ['Hot-surface igniter (HSI)', 'Glowing ceramic element that lights the gas.'], ['Lockout', 'The board stops trying after repeated failures.']],
        mistakes: ['Using coarse sandpaper (scratches hold oxide faster).', 'Touching or bumping the igniter.', 'Bending the rod out of the flame.', 'Reinstalling a sensor with cracked porcelain.'],
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
      safety: ['Turn the system off at the thermostat and the furnace switch.', 'Use plain vinegar. Never mix bleach with vinegar or other cleaners; the fumes are toxic.', 'Mop up water around the furnace before working; wet floors and electrical parts don’t mix.'],
      causes: [['Algae / slime in the trap', 'Warm, wet and dark: ideal for growth.'], ['Float switch tripped', 'The AC stops cooling but the fan may still run.'], ['Kinked or sagging line', 'Water pools in the low spot.']],
      tools: ['Wet/dry vac (filter removed)', 'Small funnel', 'White vinegar (1 cup)', 'Duct tape or a rag', 'Towels', 'Flashlight', 'Quart of warm water'],
      steps: [
        { t: 'Turn the system off', d: 'Set the thermostat to OFF, then turn off the furnace or air handler’s service switch (it looks like a light switch on or near the unit).', why: 'This stops the coil from making more water while you work and keeps the blower from pulling air through the open drain.', tip: 'If water is already on the floor, lay towels down now and move anything valuable away from the unit.', ok: 'The blower is silent and no air comes from the vents.', v: { cam: [1.2, 1.3, 1.5], at: [0.15, 0.8, 0], hi: ['furnace'] } },
        { t: 'Check the pan and float switch', d: 'With a flashlight, look for standing water in the drain pan under the indoor coil or around the furnace base. Find the float switch (a small plastic box on the pan or drain line with a wire) and see if its float is lifted.', why: 'A float switch cuts the AC when water rises too high, which is why the AC can stop with no other symptoms.', tip: 'Attic units have a second, larger pan under the whole unit. Water there means the main drain has failed: clear it and also check the ceiling below for stains.', ok: 'You know whether the pan holds water and whether the float switch has tripped.', v: { cam: [0.8, 1.3, 0.8], at: [0.3, 1.05, 0.15], hi: ['floatSwitch', 'drainPan'], xray: true } },
        { t: 'Vacuum the line from its end', d: 'Find where the drain line ends: at a floor drain, a condensate pump or outside near the condenser. Wrap a rag or tape around the wet/dry vac hose to seal it over the pipe end, and run the vac for 1–2 minutes.', why: 'Pulling the clog out the way water flows is easier than pushing it deeper.', tip: 'Take the vac’s paper filter out first so the slime doesn’t ruin it. If the line ends at a condensate pump, unplug the pump and clean its tank instead.', ok: 'You hear the vac gurgle and find slime and water in the vac canister.', v: { cam: [1.3, 0.6, 1.2], at: [0.75, 0.15, 0.3], hi: ['vac', 'floorDrain'], show: ['vac'] } },
        { t: 'Open the cleanout', d: 'Near the indoor unit, find the T-shaped fitting on the drain pipe with a loose cap or plug on top (the cleanout). Pull the cap off.', why: 'This T is the access point for flushing the line and checking that water flows.', tip: 'Shine a light in: standing water in the T means the line is still blocked below it. If there is no cap at all, pour in the next step through a small funnel at the pan’s drain opening.', ok: 'The cap is off and you can see down into the drain pipe.', v: { cam: [0.7, 1.3, 0.7], at: [0.41, 1.1, 0.15], hi: ['cap', 'cleanout'], mv: { cap: [0.06, 0.08, 0.04] } } },
        { t: 'Flush with vinegar', d: 'Pour 1 cup of white vinegar into the T through a funnel. Wait 30 minutes, then slowly pour in a quart or two of warm water and watch the end of the line.', why: 'Vinegar kills the slimy algae and bacteria without harming PVC pipe or the coil’s metal.', tip: 'If the water backs up in the T, vacuum the outlet again and repeat. Don’t mix vinegar with bleach or other cleaners; some combinations give off toxic gas.', ok: 'Water pours in freely and runs out at the far end of the line.', v: { cam: [0.7, 1.3, 0.7], at: [0.45, 1.0, 0.15], hi: ['funnel', 'trap', 'line'], show: ['funnel'], hide: ['vac'], xray: true, fx: 'clear' } },
        { t: 'Cap it and restore power', d: 'Put the cap back on the T, snug but not glued. Turn power back on and run the AC. Within 15–30 minutes of cooling, water should drip at the outlet.', why: 'The cap keeps the blower from sucking air in through the T, which can hold water in the pan.', tip: 'If the float switch tripped, it should reset by itself once the pan drains; some need a button pushed. Write the date on the pipe with a marker.', ok: 'Water drips steadily from the line’s outlet and the pan stays empty.', v: { cam: [1.2, 1.3, 1.5], at: [0.3, 0.8, 0.1], hi: ['line'], hide: ['funnel'], mv: { cap: [0, 0, 0] }, fx: 'clear' } },
      ],
      tricks: [
        ['Vinegar every season', 'Pour a cup of white vinegar into the cleanout at the start of cooling season and again mid-summer. Prevention is far easier than clearing a clog.'],
        ['Know where the line ends', 'Find and mark the drain outlet now. When the AC quits on a hot day, you’ll know where to put the vac.'],
        ['Pan tablets help', 'Condensate pan tablets slowly release an algae inhibitor. Drop one in the pan each spring if your line clogs often.'],
        ['Ceiling stain alarm', 'A brown ring on the ceiling under an attic unit means the overflow pan is catching water. Treat it as urgent before the drywall gives way.'],
        ['Wet switch alarm', 'A $20–30 water sensor alarm set in the pan or next to the furnace warns you before water reaches the floor.'],
        ['No compressed air', 'Blowing compressed air into the line can pop apart glued joints inside the furnace. Pull with a vac instead.'],
      ],
      refs: [
        ['How to clean an AC drain line (Carrier)', 'https://www.carrier.com/us/en/residential/hvac-resources/air-conditioners/how-to-clean-ac-drain-line.html'],
        ['Condensate handling and drainage defects (InspectAPedia)', 'https://inspectapedia.com/aircond/Condensate_Handling.php'],
        ['Condensate drain piping, trap sizing and auxiliary pans, IMC 307 (Open Exam Prep)', 'https://open-exam-prep.com/study-guides/tx-hvac-contractor/mechanical-codes-texas-local-standards/condensate-drain-piping-traps-auxiliary-pans'],
      ],
      learn: {
        how: 'The indoor coil runs below the dew point, so moisture in the air condenses on it like water on a cold glass. That water drips into a pan and drains by gravity through a trapped line. The trap stops the blower from pulling air up the drain. The trap’s standing water is also where algae grows.',
        specs: [['Condensate per day', '5–20 gal in humid weather'], ['Line size', '¾″ minimum (IMC)'], ['Slope', '≥ ⅛″ per foot (1%, IMC 307.2)'], ['Vinegar dose', '1 cup, wait 30 min'], ['Flush interval', 'Every 3–6 months in cooling season']],
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
      tools: ['Non-contact voltage tester', 'Multimeter', 'Screwdriver', '1½″ element wrench or deep socket', 'Replacement element with gasket (same voltage & wattage)', 'Garden hose', 'Rags and a bucket', 'Work gloves'],
      steps: [
        { t: 'Breaker off and verify', d: 'Turn off the double-width breaker for the water heater. Remove the upper access cover (two screws) and fold the insulation aside. Touch a non-contact voltage tester to the wires on the thermostat; then check with a multimeter set to AC volts across the two top screws.', why: 'Water heaters are often on mislabeled breakers, and 240 volts can kill. Proving it dead is the only safe start.', tip: 'Test the tester on a live outlet first. If it beeps at the heater, you have the wrong breaker: try others until it goes silent, then tape that breaker with a note.', ok: 'The meter reads 0 volts across the top terminals and the tester stays silent.', v: { cam: [0.7, 1.15, 0.8], at: [0, 1.05, 0.28], hi: ['coverUp'], mv: { coverUp: [0.25, 0, 0.25] }, tool: { id: 'voltTester', at: [0.02, 1.08, 0.3], rot: [80, 0, 0] } } },
        { t: 'Press the reset', d: 'Find the red RESET button above the upper thermostat, on the high-limit (ECO) switch. Press it firmly with a finger. A click means it had tripped.', why: 'The high-limit cuts all power if the water gets too hot (around 170–180 °F). One trip may be a fluke; repeat trips mean a stuck thermostat or a shorted element.', tip: 'If it clicked, you could reassemble and test first. If no hot water after an hour, or it trips again within days, keep going with the tests.', ok: 'You heard or felt a click, or confirmed the button was already set.', v: { cam: [0.5, 1.15, 0.6], at: [0, 1.1, 0.28], hi: ['resetBtn'], mv: { coverUp: [0.25, 0, 0.25], insulUp: [0, -0.12, 0.08] } } },
        { t: 'Test each element', d: 'With power still off, loosen one screw and pull one wire off an element. Set the multimeter to ohms (Ω). Touch one probe to each of the element’s two screws, then touch one probe to a screw and the other to the bare tank metal.', why: 'A 4500 W, 240 V element reads about 12–13 Ω across its screws; OL means it’s burned out. Any reading to the tank means it’s shorted. Both need replacing.', tip: 'Read the wattage stamped on the element before you buy. 3500 W reads about 16 Ω, 5500 W about 10 Ω. Photograph the wiring before you pull any wire.', ok: 'You have a reading for each element: about 10–16 Ω is good, OL or any continuity to the tank is bad.', v: { cam: [0.5, 1.0, 0.6], at: [0, 1.0, 0.28], hi: ['elemUp'], mv: { coverUp: [0.25, 0, 0.25], insulUp: [0, -0.12, 0.08] }, tool: { id: 'multimeter', at: [0.3, 0.86, 0.42], rot: [0, -40, 0] } } },
        { t: 'Drain the tank', d: 'Close the cold supply valve, open a hot faucet, hook a hose to the drain valve and run it downhill to a drain. Drain until the water is below the element you’re replacing; for the lower element, empty it fully.', why: 'Elements thread through the tank wall. Pulling one with water above it floods the floor.', tip: 'For the upper element, draining 3–4 gallons is enough. Before fully unscrewing, crack the element a quarter-turn over a rag: a dribble is fine, a steady stream means drain more.', ok: 'No water comes out when you crack the element a quarter-turn, or only a dribble.', v: { cam: [1.3, 0.8, 1.6], at: [0.4, 0.3, 0.4], hi: ['drain', 'hose'], show: ['hose'], fx: 'drain' } },
        { t: 'Swap the element', d: 'Disconnect both wires. Fit a 1½″ element wrench or deep socket over the hex and turn counterclockwise; it may take a sharp tap to break free. Clean the tank opening, put the new rubber gasket on the new element and thread it in clockwise until snug, then about a quarter-turn more.', why: 'The new gasket seals against the tank face; an old one is flattened and will leak.', tip: 'Stuck element? Use a breaker bar or a long handle on the wrench and pull steadily, not in jerks, which can twist the tank fitting. Wipe out old scale from the opening with a rag before threading in.', ok: 'The new element is threaded in straight and snug, and the gasket is evenly squeezed.', v: { cam: [0.6, 0.45, 0.8], at: [0, 0.26, 0.28], hi: ['elemLow', 'newElement'], show: ['newElement'], mv: { coverLow: [0.25, 0, 0.25], insulLow: [0, -0.12, 0.08], elemLow: [0, 0, 0.25] }, xray: true, tool: { id: 'ratchet', at: [0, 0.255, 0.32], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Refill before power', d: 'Close the drain valve and remove the hose. Open the cold supply fully, and leave the hot faucet open until it runs a smooth stream with no spitting air. Check the element for drips with a dry paper towel.', why: 'An element turned on in air burns out in seconds, and the upper one is the last to be covered.', tip: 'If the element drips, tighten it about an eighth of a turn more. Still dripping? Drain below it, reseat the gasket and try again.', ok: 'The faucet runs smooth with no air, and a dry towel stays dry under the element.', v: { cam: [1.3, 1.25, 1.6], at: [0, 0.8, 0], hi: ['tank'], hide: ['hose', 'newElement'], mv: { elemLow: [0, 0, 0] } } },
        { t: 'Reassemble and power on', d: 'Reconnect the wires exactly as in your photo, tighten the screws firmly, then put back the plastic terminal guards, insulation and covers. Turn the breaker on. Hot water should be back in 30–60 minutes.', why: 'The covers keep the insulation in place and the 240 V terminals out of reach.', tip: 'Loose wire screws cause burned terminals later. Snug each screw, then give each wire a tug. Set both thermostats to the same number, about 120 °F.', ok: 'The breaker stays on, the tank warms within an hour, and the faucet runs hot.', v: { cam: [1.3, 1.25, 1.6], at: [0, 0.8, 0], hi: ['coverUp', 'coverLow'], mv: { coverUp: [0, 0, 0], coverLow: [0, 0, 0], insulUp: [0, 0, 0], insulLow: [0, 0, 0] } } },
      ],
      tricks: [
        ['Upper vs lower clue', 'No hot water at all points to the upper element or the high-limit. A little hot water that runs out fast points to the lower element.'],
        ['Buy by the stamp', 'Match the voltage and wattage stamped on the old element and its style (screw-in, 1″ thread). A 120 V element in a 240 V heater fails at once.'],
        ['Replace both at once', 'If one element is burned out and the tank is 6+ years old, the other is likely close. Swapping both while it’s drained saves a second drain.'],
        ['Low-watt-density elements last', 'In hard water, “low watt density” or titanium-sheathed elements resist scale burnout longer than standard copper ones.'],
        ['Thermostats in pairs', 'If elements test good but don’t heat, test or replace the thermostats as a matched set.'],
        ['Use a socket, not pliers', 'A 1½″ element wrench or deep socket grips the hex without slipping. Pliers round it off and bend the element.'],
      ],
      refs: [
        ['Testing water heater elements (AppWork Maintenance Academy)', 'https://appworkco.com/maintenance-academy/video/testing-water-heater-elements/1197/'],
        ['Rheem 4500 W 240 V screw-in element spec (SupplyHouse)', 'https://www.supplyhouse.com/Rheem-SP10552ML-4500W-Copper-Element-240V'],
        ['240 V water heater element resistance discussion (Mike Holt Forum)', 'https://forums.mikeholt.com/threads/240v-water-heater-fed-120v.2537257/'],
        ['How to drain a water heater (A.O. Smith)', 'https://www.hotwater.com/info-center/how-to-drain-a-water-heater.html'],
        ['Tap Water Scalds safety alert (CPSC)', 'https://www.cpsc.gov/s3fs-public/5098-Tap-Water-Scalds.pdf'],
      ],
      learn: {
        how: 'An electric tank has two elements, but only one heats at a time. The upper thermostat has priority: it heats the top of the tank first, then hands power to the lower thermostat. That’s why a dead upper element means no hot water at all, while a dead lower element means a small amount that runs out fast.',
        specs: [['Common element', '4500 W at 240 V'], ['Good reading, 4500 W', '≈ 12.8 Ω (R = V² ÷ W)'], ['3500 W / 5500 W', '≈ 16 Ω / ≈ 10.5 Ω'], ['Element to tank', 'no continuity (OL)'], ['Element thread', '1″ NPSM, 1½″ hex'], ['Typical breaker', '30 A double-pole'], ['Recommended setting', '120 °F']],
        terms: [['ECO / high-limit', 'Emergency cutoff that trips around 170–180 °F.'], ['Dry fire', 'Powering an element without water. Instant failure.'], ['Screw-in element', 'Most common type; some older tanks use 4-bolt flanges.']],
        mistakes: ['Powering the heater before it’s full.', 'Buying a 120 V element for a 240 V heater.', 'Setting the two thermostats far apart.'],
        tips: ['If elements keep burning out, check the anode rod and water hardness. Scale buildup overheats them.'],
      },
      pro: 'Elements and thermostats test good but there’s still no heat, the wiring is scorched, or the tank is leaking.',
    },
  ]);
})();
