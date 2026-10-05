/* SAF · Home Safety: emergency shutoffs, fire extinguisher, grab bars, water-heater strapping,
   furniture/TV anti-tip, stair handrail, top-of-stairs baby gate. Real meters (unit: 1). */
(function () {
  const ROOM = (o) => Object.assign({ env: 'studio', unit: 1, tex: ['plank_flooring'], ground: { tex: 'plank_flooring', repeat: 4, radius: 4 } }, o);
  const IN = 0.0254;
  const paint = (K, c) => K.std(c || 0xeeebe5, { roughness: 0.92 });
  const galv = (K) => K.std(0xc5cacd, { metalness: 0.75, roughness: 0.42 });
  const tapeBlue = (K) => K.std(0x4aa3ff, { roughness: 0.85 });

  // Straight pipe run through a list of points, with a fitting at every bend.
  function pipe(K, parent, pts, r, mat) {
    for (let i = 0; i < pts.length - 1; i++) K.bar(parent, pts[i], pts[i + 1], r, mat);
    for (let i = 1; i < pts.length - 1; i++) K.sph(parent, r * 1.3, mat, pts[i]);
  }
  // Open band around a cylinder (labels, straps). Angle t measured from +z toward +x.
  function band(K, parent, r, h, t0, tl, mat, pos, rot) {
    const geo = new K.THREE.CylinderGeometry(r, r, h, 48, 1, true, t0, tl);
    const src = typeof mat === 'string' ? K.m[mat] : mat;
    const me = new K.THREE.Mesh(geo, src.clone());
    me.material.side = K.THREE.DoubleSide;
    K.group(parent, pos, rot).add(me);
    return me;
  }
  // Hand-held stud finder; rotY turns it to face a wall along x.
  function finder(K, pos, rotY) {
    const f = K.part('finder', pos, null, 'Stud finder');
    f.rotation.y = (rotY || 0) * K.DEG;
    K.box(f, [0.07, 0.15, 0.032], K.std(0xffcc33, { roughness: 0.5 }), [0, 0, 0], null, 0.012);
    K.box(f, [0.045, 0.025, 0.004], 'screen', [0, 0.03, 0.017], null, 0);
    K.box(f, [0.05, 0.03, 0.006], 'gripBlack', [0, -0.045, 0.016], null, 0.004);
    K.sph(f, 0.005, 'ledG', [0, 0.062, 0.016]);
    return f;
  }
  // Paper safety tag on a string.
  function tag(K, p, pos, col, rotY, label) {
    const g = K.group(p, pos, [0, rotY || 0, 0]);
    K.box(g, [0.065, 0.09, 0.003], K.std(col, { roughness: 0.6 }), [0, -0.075, 0], null, 0);
    K.box(g, [0.05, 0.012, 0.0036], 'dark', [0, -0.05, 0], null, 0);
    K.box(g, [0.04, 0.006, 0.0036], 'dark', [0, -0.075, 0], null, 0);
    K.box(g, [0.034, 0.006, 0.0036], 'dark', [0, -0.09, 0], null, 0);
    K.cyl(g, [0.0015, 0.0015, 0.03, 6], 'offwhite', [0, -0.015, 0]);
    return g;
  }

  /* ===================== 1 · Emergency shutoffs (whole-house cutaway) ===================== */
  TB.model(
    'shutoffHouse',
    {
      env: 'garden',
      unit: 1,
      cam: [6.5, 7, 9],
      at: [0.4, 0.5, 0.3],
      tex: ['aerial_grass_rock', 'plank_flooring', 'concrete_floor_01'],
      ground: { tex: 'aerial_grass_rock', repeat: 8, radius: 10 },
      assets: ['shrub_01', 'shrub_02'],
      hidden: ['tags', 'map', 'gasWrench', 'curbKey'],
    },
    (K) => {
      const siding = K.std(0xd8d0c0, { roughness: 0.85 });
      const inner = paint(K);
      const house = K.part('house', [0, 0, 0], null, 'Your house');
      // floors: living area (wood) and utility/garage (concrete)
      K.box(house, [3.6, 0.04, 4.2], K.pbr('plank_flooring', [3, 3], {}, 'wood'), [-1.2, 0.02, 0], null, 0);
      K.box(house, [2.4, 0.04, 4.2], K.pbr('concrete_floor_01', [2, 3], {}, 'concrete'), [1.8, 0.02, 0], null, 0);
      K.box(house, [6.3, 0.06, 4.5], 'concrete', [0, 0.0, 0], null, 0);
      // back + left walls full height, right + front cut low to see inside
      K.box(house, [6.3, 2.6, 0.14], siding, [0, 1.3, -2.18], null, 0.01);
      K.box(house, [6.0, 2.6, 0.012], inner, [0, 1.3, -2.104], null, 0);
      K.box(house, [0.14, 2.6, 4.5], siding, [-3.08, 1.3, 0], null, 0.01);
      K.box(house, [0.012, 2.6, 4.2], inner, [-3.004, 1.3, 0], null, 0);
      K.box(house, [0.14, 1.1, 4.5], siding, [3.08, 0.55, 0], null, 0.01);
      K.box(house, [0.03, 0.03, 4.5], 'offwhite', [3.08, 1.11, 0], null, 0.005);
      K.box(house, [2.5, 1.1, 0.14], siding, [-1.85, 0.55, 2.18], null, 0.01);
      K.box(house, [2.9, 1.1, 0.14], siding, [1.6, 0.55, 2.18], null, 0.01);
      K.box(house, [6.3, 0.03, 0.03], 'offwhite', [0, 1.11, 2.18], null, 0.005);
      K.box(house, [0.03, 2.6, 0.14], 'offwhite', [3.0, 1.3, -2.18], null, 0);
      // partition stub between living and utility
      K.box(house, [0.1, 1.1, 1.6], inner, [0.6, 0.55, -1.3], null, 0.005);
      // walkway + sidewalk out front
      K.box(house, [0.9, 0.05, 1.6], 'concrete', [-0.2, 0.025, 3.05], null, 0.005);
      K.box(house, [8, 0.06, 1.2], 'concrete', [0, 0.03, 4.6], null, 0.005);
      K.box(house, [8, 0.04, 2.0], 'asphalt', [0, 0.02, 6.2], null, 0);
      K.glb(house, 'shrub_01', { height: 0.9 }, [-2.4, 0, 2.8]) || K.sph(house, 0.45, 'grass', [-2.4, 0.35, 2.8]);
      K.glb(house, 'shrub_02', { height: 0.8 }, [2.4, 0, 2.9]) || K.sph(house, 0.4, 'grass', [2.4, 0.3, 2.9]);

      // kitchen sink cabinet (fixture shutoffs)
      const sink = K.part('sink', [-2.0, 0, -1.8], null, 'Kitchen sink');
      K.box(sink, [0.9, 0.84, 0.58], K.std(0xf4f1ea, { roughness: 0.55 }), [0, 0.46, 0], null, 0.01);
      K.box(sink, [0.94, 0.04, 0.64], K.pbr('granite_tile', [1, 0.5], { roughness: 0.4 }, 'stone'), [0, 0.9, 0.02], null, 0.006);
      K.box(sink, [0.6, 0.03, 0.4], 'chrome', [0, 0.915, 0.02], null, 0.01);
      K.tube(sink, [[0, 0.92, -0.22], [0, 1.15, -0.22], [0, 1.2, -0.15], [0, 1.12, -0.05]], 0.012, 'chrome');
      K.box(sink, [0.88, 0.03, 0.05], K.std(0xf4f1ea, { roughness: 0.55 }), [0, 0.06, 0.28], null, 0.004);
      const doorL = K.part('sinkDoorL', [-0.445, 0.47, 0.292], sink, 'Cabinet door');
      K.box(doorL, [0.44, 0.7, 0.02], K.std(0xf7f4ee, { roughness: 0.5 }), [0.22, 0, 0], null, 0.006);
      K.box(doorL, [0.012, 0.1, 0.02], 'steel', [0.4, 0.2, 0.018], null, 0.004);
      const doorR = K.part('sinkDoorR', [0.445, 0.47, 0.292], sink, 'Cabinet door');
      K.box(doorR, [0.44, 0.7, 0.02], K.std(0xf7f4ee, { roughness: 0.5 }), [-0.22, 0, 0], null, 0.006);
      K.box(doorR, [0.012, 0.1, 0.02], 'steel', [-0.4, 0.2, 0.018], null, 0.004);
      const stops = K.part('sinkStops', [0, 0.3, -0.22], sink, 'Fixture shutoffs (hot + cold stops)');
      [-0.1, 0.1].forEach((x) => {
        K.cyl(stops, [0.008, 0.008, 0.08, 12], 'copper', [x, -0.04, 0.0]);
        K.box(stops, [0.03, 0.03, 0.03], 'chrome', [x, 0.0, 0.01], null, 0.006);
        K.box(stops, [0.025, 0.012, 0.018], 'chrome', [x, 0.0, 0.04], null, 0.004);
        K.cyl(stops, [0.016, 0.016, 0.012, 16], 'chrome', [x, 0.0, 0.055], [90, 0, 0]);
        K.tube(stops, [[x, 0.015, 0.01], [x, 0.25, 0.0], [x * 0.5, 0.55, -0.02]], 0.005, 'steel');
      });

      // main water: through the slab, shutoff valve, meter, on to the heater
      const WX = 1.0;
      const WZ = -1.98;
      pipe(K, null, [[WX, -0.2, WZ], [WX, 1.5, WZ], [1.75, 1.5, WZ], [1.75, 1.5, -1.75], [1.75, 1.6, -1.75]], 0.011, 'copper');
      const wm = K.part('waterMain', [WX, 0.45, WZ], null, 'Main water shutoff (ball valve)');
      K.ccyl(wm, [0.024, 0.07, 24], 'brass');
      K.nut(wm, 0.042, 0.016, 'brass', [0, 0.038, 0]);
      K.nut(wm, 0.042, 0.016, 'brass', [0, -0.038, 0]);
      K.cyl(wm, [0.007, 0.007, 0.022, 12], 'brass', [0, 0, 0.03], [90, 0, 0]);
      const lever = K.part('waterLever', [0, 0, 0.043], wm, 'Lever handle (in line with pipe = open)');
      K.box(lever, [0.02, 0.12, 0.007], 'red', [0, 0.05, 0], null, 0.003);
      K.nut(lever, 0.016, 0.008, 'steel', [0, 0, 0.004], [90, 0, 0]);
      const meter = K.part('waterMeter', [WX, 0.78, WZ], null, 'Water meter');
      K.ccyl(meter, [0.06, 0.14, 24], K.std(0xa0743e, { metalness: 0.6, roughness: 0.45 }));
      K.cyl(meter, [0.045, 0.045, 0.03, 24], 'black', [0, 0, 0.06], [90, 0, 0]);
      K.cyl(meter, [0.04, 0.04, 0.004, 24], K.std(0xf5f2e8, { roughness: 0.4 }), [0, 0, 0.077], [90, 0, 0]);
      K.box(meter, [0.004, 0.03, 0.002], 'red', [0, 0.01, 0.08], null, 0);
      K.box(meter, [0.09, 0.02, 0.06], 'blue', [0, 0.06, 0.035], null, 0.004);
      // gas water heater with its own gas valve
      const wh = K.part('waterHeater', [1.75, 0, -1.75], null, 'Water heater');
      K.lathe(wh, [[0, 0.02], [0.25, 0.02], [0.25, 1.45], [0.22, 1.5], [0, 1.52]], K.std(0xe9e6df, { roughness: 0.45, metalness: 0.1 }));
      K.cyl(wh, [0.07, 0.07, 1.05, 24], 'steel', [0, 2.05, 0]);
      K.cyl(wh, [0.12, 0.08, 0.1, 24], 'steel', [0, 1.58, 0]);
      K.box(wh, [0.1, 0.09, 0.06], 'dark', [0, 0.32, 0.26], null, 0.006);
      K.cyl(wh, [0.018, 0.018, 0.02, 16], 'red', [0, 0.34, 0.295], [90, 0, 0]);
      K.box(wh, [0.16, 0.2, 0.005], K.std(0xf4e9b8, { roughness: 0.8 }), [-0.12, 0.8, 0.22], [0, -30, 0], 0);
      // gas service: meter outside on the right wall, line into the house to the heater
      pipe(K, null, [[2.95, 0.5, -0.65], [2.25, 0.5, -0.65], [2.25, 0.5, -1.45], [1.95, 0.5, -1.45], [1.95, 0.32, -1.45], [1.8, 0.32, -1.48]], 0.0105, 'black');
      const whg = K.part('whGas', [1.95, 0.42, -1.45], null, 'Appliance gas valve (yellow handle)');
      K.ccyl(whg, [0.018, 0.05, 16], 'brass');
      const wl = K.group(whg, [0, 0, 0.022]);
      K.box(wl, [0.075, 0.016, 0.008], 'yellow', [0.03, 0, 0], null, 0.003);
      // electrical panel on the back wall
      const PX = 2.45;
      const PY = 1.5;
      const PZ = -2.098;
      const panel = K.part('panel', [PX, PY, PZ], null, 'Electrical panel');
      K.box(panel, [0.38, 0.78, 0.1], K.std(0x9aa1a6, { metalness: 0.4, roughness: 0.5 }), [0, 0, 0.05], null, 0.006);
      K.box(panel, [0.34, 0.72, 0.006], K.std(0xb7bdc1, { metalness: 0.3, roughness: 0.5 }), [0, 0, 0.1], null, 0.002);
      K.cyl(panel, [0.02, 0.02, 0.9, 16], 'grey', [0.0, 0.84, 0.05]);
      K.rep(9, (i) => {
        [-0.055, 0.055].forEach((x) => {
          K.box(panel, [0.09, 0.034, 0.03], 'black', [x, 0.12 - i * 0.042, 0.11], null, 0.004);
          K.box(panel, [0.012, 0.018, 0.02], 'dark', [x + (x > 0 ? -0.02 : 0.02), 0.12 - i * 0.042, 0.13], null, 0.003);
        });
      });
      const main = K.part('mainBreaker', [0, 0.25, 0.11], panel, 'MAIN breaker (shuts off the whole house)');
      K.box(main, [0.16, 0.09, 0.035], 'black', [0, 0, 0], null, 0.006);
      K.box(main, [0.11, 0.03, 0.035], 'dark', [0, 0, 0.03], null, 0.006);
      K.box(main, [0.05, 0.012, 0.002], 'red', [0, -0.034, 0.018], null, 0);
      const door = K.part('panelDoor', [-0.19, 0, 0.12], panel, 'Panel door');
      K.box(door, [0.38, 0.76, 0.012], K.std(0x9aa1a6, { metalness: 0.4, roughness: 0.5 }), [0.19, 0, 0.0], null, 0.003);
      K.box(door, [0.012, 0.06, 0.02], 'dark', [0.35, 0, 0.012], null, 0.003);
      const map = K.part('map', [0.19, 0.0, -0.008], door, 'Shutoff map + panel directory');
      K.box(map, [0.24, 0.32, 0.002], K.std(0xffffff, { roughness: 0.9 }), [0, 0, 0], null, 0);
      [[-0.06, 0.08, 0x2f7fd0], [0.05, 0.02, 0xf2c230], [-0.03, -0.06, 0xd0433a]].forEach(([x, y, c]) => K.box(map, [0.04, 0.04, 0.003], K.std(c), [x, y, -0.001], null, 0));
      K.box(map, [0.2, 0.004, 0.003], 'dark', [0, 0.13, -0.001], null, 0);
      K.box(map, [0.18, 0.12, 0.003], K.std(0x9aa1a6, { roughness: 0.9 }), [0, -0.0, -0.0005], null, 0);
      // outside: gas meter, riser and street-side shutoff
      const GX = 3.27;
      const GZ = -0.92;
      pipe(K, null, [[GX, -0.2, GZ], [GX, 0.52, GZ]], 0.016, K.std(0xf2c230, { roughness: 0.6 }));
      const gv = K.part('gasValve', [GX, 0.26, GZ], null, 'Gas meter shutoff (street-side valve)');
      K.ccyl(gv, [0.026, 0.08, 20], 'forged');
      K.box(gv, [0.03, 0.05, 0.03], 'forged', [0, 0, 0.022], null, 0.006);
      const tang = K.part('gasTang', [0, 0, 0.045], gv, 'Valve tang (in line with pipe = ON)');
      K.box(tang, [0.016, 0.05, 0.01], 'forged', [0, 0, 0], null, 0.002);
      K.cyl(tang, [0.004, 0.004, 0.012, 10], 'black', [0, 0.016, 0], [90, 0, 0]);
      const gm = K.part('gasMeter', [3.3, 0.78, -0.78], null, 'Gas meter');
      K.box(gm, [0.2, 0.36, 0.32], K.std(0xb7bcc0, { metalness: 0.5, roughness: 0.45 }), [0, 0, 0], null, 0.03);
      K.box(gm, [0.01, 0.12, 0.2], 'glass', [0.103, 0.06, 0], null, 0.004);
      K.rep(4, (i) => K.cyl(gm, [0.016, 0.016, 0.006, 16], K.std(0xf5f2e8), [0.102, 0.06, -0.06 + i * 0.04], [0, 0, 90]));
      K.box(gm, [0.06, 0.06, 0.08], 'grey', [0, -0.21, -0.12], null, 0.01);
      K.box(gm, [0.06, 0.06, 0.08], 'grey', [0, -0.21, 0.12], null, 0.01);
      K.lathe(gm, [[0, 0], [0.07, 0], [0.075, 0.02], [0.05, 0.07], [0, 0.08]], 'grey', [0, -0.29, -0.14], [0, 0, 0]);
      pipe(K, null, [[GX, 0.52, GZ], [GX, 0.52, -0.9], [3.3, 0.55, -0.9]], 0.016, 'grey');
      pipe(K, null, [[3.3, 0.55, -0.66], [3.3, 0.5, -0.66], [3.15, 0.5, -0.66]], 0.014, 'grey');
      const gw = K.part('gasWrench', [GX + 0.0, 0.26, GZ + 0.05], null, '12″ wrench kept at the meter');
      K.box(gw, [0.028, 0.03, 0.012], 'forged', [0, 0, 0.006], null, 0.003);
      K.box(gw, [0.03, 0.3, 0.01], 'forged', [0.0, 0.0, 0.006], [0, 0, -90], 0.003);
      K.box(gw, [0.032, 0.11, 0.014], 'gripRed', [0.24, 0, 0.006], [0, 0, -90], 0.006);
      K.box(gw, [0.06, 0.004, 0.03], 'steel', [0.0, 0.06, -0.04], null, 0);
      // curb box (street-side water valve)
      const curb = K.part('curbBox', [1.4, 0, 3.5], null, 'Curb box (city-side water valve)');
      K.cyl(curb, [0.085, 0.09, 0.03, 32], 'dark', [0, 0.0, 0]);
      K.cyl(curb, [0.06, 0.06, 0.004, 24], 'black', [0, 0.016, 0]);
      const lid = K.part('curbLid', [0, 0.022, 0], curb, 'Cast-iron lid (“WATER”)');
      K.cyl(lid, [0.075, 0.075, 0.012, 32], 'forged', [0, 0, 0]);
      K.rep(5, (i) => K.box(lid, [0.1, 0.002, 0.006], 'dark', [0, 0.007, -0.03 + i * 0.015], null, 0));
      const key = K.part('curbKey', [1.4, 0.0, 3.5], null, 'Curb key (meter key)');
      K.cyl(key, [0.008, 0.008, 1.1, 12], 'forged', [0, 0.45, 0]);
      K.cyl(key, [0.009, 0.009, 0.45, 12], 'forged', [0, 1.0, 0], [0, 0, 90]);
      K.box(key, [0.03, 0.04, 0.012], 'forged', [0, -0.1, 0], null, 0.004);
      // tags + flag
      const tags = K.part('tags', [0, 0, 0], null, 'Bright tags on every shutoff');
      tag(K, tags, [WX + 0.04, 0.42, WZ + 0.035], 0xf2c230);
      tag(K, tags, [GX + 0.0, 0.23, GZ + 0.035], 0xd0433a);
      tag(K, tags, [PX + 0.26, PY + 0.2, PZ + 0.004], 0xf2c230);
      tag(K, tags, [1.98, 0.4, -1.42], 0xd0433a);
      tag(K, tags, [-2.0, 0.85, -1.5], 0x4f9a5e);
      const flag = K.group(tags, [1.55, 0, 3.5]);
      K.cyl(flag, [0.003, 0.003, 0.4, 6], 'steel', [0, 0.2, 0]);
      K.box(flag, [0.08, 0.06, 0.002], 'blue', [0.04, 0.37, 0], null, 0);
      return {
        tick(t, fx) {
          K.parts.mainBreaker.position.y = 0.25 + (fx === 'off' ? -0.01 : 0);
        },
      };
    }
  );

  /* ===================== 2 · Grab bars at a tub ===================== */
  const GB_Y = 0.86; // 34″ to the bar's top centerline zone
  const GB_STUDS = [-0.74, -0.406, 0, 0.406, 0.74];
  TB.model(
    'grabBarTub',
    ROOM({
      cam: [1.7, 1.45, 2.3],
      at: [0, 0.95, 0.25],
      tex: ['plank_flooring', 'floor_tiles_06'],
      hidden: ['finder', 'marks', 'holes', 'bar', 'screws', 'covers', 'bar2', 'marks2'],
    }),
    (K) => {
      const tile = K.phys(0xf4f3ef, { roughness: 0.25, clearcoat: 0.4 });
      const grout = K.std(0xcfcac0, { roughness: 0.9 });
      const T = 0.108;
      const wall = K.part('wall', [0, 0, 0], null, 'Tiled tub wall');
      K.box(wall, [1.52, 1.64, 0.01], tile, [0, 1.21, -0.005], null, 0);
      for (let k = 1; k < 15; k++) K.box(wall, [1.52, 0.003, 0.002], grout, [0, 0.39 + k * T, 0.0005], null, 0);
      for (let k = 1; k < 14; k++) K.box(wall, [0.003, 1.64, 0.002], grout, [-0.76 + k * T, 1.21, 0.0005], null, 0);
      K.box(wall, [1.52, 0.41, 0.0127], paint(K), [0, 2.235, -0.006], null, 0);
      K.box(wall, [1.2, 2.44, 0.0127], paint(K), [1.36, 1.22, -0.006], null, 0);
      K.box(wall, [1.2, 0.09, 0.012], 'offwhite', [1.36, 0.045, 0.006], null, 0.003);
      K.box(wall, [1.52, 2.05, 0.0127], K.std(0x9a9a94, { roughness: 1 }), [0, 1.02, -0.0164], null, 0);
      // end (control) wall at x = -0.76, tiled, facing +x
      const ew = K.part('endWall', [0, 0, 0], null, 'Control-end wall');
      K.box(ew, [0.01, 1.64, 0.9], tile, [-0.765, 1.21, 0.45], null, 0);
      for (let k = 1; k < 15; k++) K.box(ew, [0.002, 0.003, 0.9], grout, [-0.7595, 0.39 + k * T, 0.45], null, 0);
      for (let k = 1; k < 9; k++) K.box(ew, [0.002, 1.64, 0.003], grout, [-0.7595, 1.21, k * T], null, 0);
      K.box(ew, [0.0127, 0.41, 0.9], paint(K), [-0.766, 2.235, 0.45], null, 0);
      K.box(ew, [0.0127, 0.39, 0.9], paint(K), [-0.766, 0.195, 0.45], null, 0);
      // faucet trim, spout and shower head on the control wall
      K.cyl(ew, [0.08, 0.08, 0.008, 32], 'chrome', [-0.756, 0.85, 0.38], [0, 0, 90]);
      K.box(ew, [0.03, 0.02, 0.1], 'chrome', [-0.74, 0.85, 0.38], null, 0.008);
      K.tube(ew, [[-0.76, 0.55, 0.38], [-0.68, 0.55, 0.38], [-0.62, 0.52, 0.38]], 0.014, 'chrome');
      K.tube(ew, [[-0.76, 1.95, 0.38], [-0.6, 1.93, 0.38], [-0.56, 1.88, 0.38]], 0.01, 'chrome');
      K.cyl(ew, [0.05, 0.03, 0.04, 24], 'chrome', [-0.55, 1.85, 0.38], [0, 0, 30]);
      K.cyl(null, [0.012, 0.012, 1.52, 16], 'chrome', [0, 1.95, 0.74], [0, 0, 90]);
      // framing behind the tile
      const studs = K.part('studs', [0, 0, 0], null, 'Studs (16″ on center)');
      GB_STUDS.forEach((x) => K.box(studs, [0.038, 2.44, 0.089], 'woodLight', [x, 1.22, -0.0675], null, 0.002));
      [0.21, 0.62].forEach((z) => K.box(studs, [0.089, 2.44, 0.038], 'woodLight', [-0.837, 1.22, z], null, 0.002));
      const block = K.part('blocking', [0, 0, 0], null, 'Blocking (2×8 between studs)');
      for (let i = 0; i < GB_STUDS.length - 1; i++) {
        const a = GB_STUDS[i] + 0.019;
        const b = GB_STUDS[i + 1] - 0.019;
        K.box(block, [b - a, 0.184, 0.038], 'wood', [(a + b) / 2, GB_Y, -0.042], null, 0.002);
      }
      K.box(block, [0.038, 0.6, 0.38], 'wood', [-0.81, 1.18, 0.415], null, 0.002);
      // tub
      const tub = K.part('tub', [0, 0, 0], null, 'Bathtub');
      const tw = K.phys(0xfbfbf8, { roughness: 0.15, clearcoat: 0.6 });
      K.ext(tub, [[-0.76, 0], [0.76, 0], [0.76, 0.76], [-0.76, 0.76]], 0.04, tw, [0, 0.39, 0], [90, 0, 0], 0.006, [[[-0.68, 0.07], [-0.68, 0.69], [0.68, 0.69], [0.68, 0.07]]]);
      K.box(tub, [1.52, 0.36, 0.06], tw, [0, 0.18, 0.73], null, 0.02);
      K.box(tub, [1.36, 0.03, 0.62], tw, [0, 0.06, 0.38], null, 0.01);
      K.box(tub, [1.36, 0.3, 0.02], tw, [0, 0.21, 0.08], null, 0.006);
      K.box(tub, [1.36, 0.3, 0.02], tw, [0, 0.21, 0.68], null, 0.006);
      K.box(tub, [0.02, 0.3, 0.62], tw, [-0.67, 0.21, 0.38], null, 0.006);
      K.box(tub, [0.02, 0.3, 0.62], tw, [0.67, 0.21, 0.38], null, 0.006);
      K.cyl(tub, [0.035, 0.035, 0.006, 24], 'chrome', [-0.58, 0.078, 0.38]);
      // bath floor tile + toilet beside the tub
      K.box(null, [2.8, 0.01, 1.6], K.pbr('floor_tiles_06', [3, 2], {}, 'offwhite'), [0.6, 0.005, 1.55], null, 0);
      const wc = K.group(null, [1.25, 0, 0.3]);
      K.box(wc, [0.5, 0.36, 0.18], tw, [0, 0.6, -0.17], null, 0.03);
      K.lathe(wc, [[0, 0], [0.12, 0], [0.13, 0.25], [0.18, 0.38], [0, 0.4]], tw, [0, 0, 0.12], null);
      K.box(wc, [0.38, 0.03, 0.46], tw, [0, 0.41, 0.12], null, 0.015);
      // layout + drilling + bars
      finder(K, [0.0, GB_Y + 0.12, 0.018]);
      const marks = K.part('marks', [0, 0, 0.0012], null, 'Stud marks + level line');
      [-0.406, 0.406].forEach((x) => {
        K.box(marks, [0.024, 0.2, 0.0008], tapeBlue(K), [x, GB_Y, 0], null, 0);
        K.box(marks, [0.003, 0.05, 0.001], 'dark', [x, GB_Y, 0.0006], null, 0);
      });
      K.box(marks, [0.9, 0.002, 0.001], 'dark', [0, GB_Y, 0.0006], null, 0);
      const SCR = [90, 210, 330].map((a) => [Math.cos(a * K.DEG) * 0.024, Math.sin(a * K.DEG) * 0.024]);
      const holes = K.part('holes', [0, 0, 0.0005], null, 'Holes drilled through the tile');
      [-0.406, 0.406].forEach((x) => SCR.forEach(([dx, dy]) => K.cyl(holes, [0.0035, 0.0035, 0.002, 12], 'black', [x + dx, GB_Y + dy, 0], [90, 0, 0])));
      const bar = K.part('bar', [0, GB_Y, 0], null, 'Grab bar (32″, 1¼″ dia, 1½″ off the wall)');
      [-0.406, 0.406].forEach((x) => K.cyl(bar, [0.038, 0.038, 0.006, 32], 'steel', [x, 0, 0.003], [90, 0, 0]));
      K.tube(bar, [[-0.406, 0, 0.006], [-0.406, 0, 0.03], [-0.385, 0, 0.054], [0, 0, 0.054], [0.385, 0, 0.054], [0.406, 0, 0.03], [0.406, 0, 0.006]], 0.016, 'steel');
      const screws = K.part('screws', [0, GB_Y, 0], null, '#12 × 2½″ stainless screws (3 per flange)');
      [-0.406, 0.406].forEach((x) => SCR.forEach(([dx, dy]) => K.screw(screws, 0.0055, 0.064, 'steel', [x + dx, dy, 0.008], [90, 0, 0])));
      const covers = K.part('covers', [0, GB_Y, 0], null, 'Snap-on flange covers');
      [-0.406, 0.406].forEach((x) => K.lathe(covers, [[0.016, 0.018], [0.03, 0.012], [0.039, 0.004], [0.04, 0], [0.016, 0]], 'steel', [x, 0, 0.006], [90, 0, 0]));
      const m2 = K.part('marks2', [-0.759, 0, 0.62], null, 'Vertical-bar marks');
      K.box(m2, [0.001, 0.55, 0.024], tapeBlue(K), [0, 1.18, 0], null, 0);
      const bar2 = K.part('bar2', [-0.76, 0, 0.62], null, 'Vertical entry bar (18″)');
      [0.95, 1.41].forEach((y) => {
        K.cyl(bar2, [0.038, 0.038, 0.006, 32], 'steel', [0.003, y, 0], [0, 0, -90]);
        K.lathe(bar2, [[0.016, 0.018], [0.03, 0.012], [0.039, 0.004], [0.04, 0], [0.016, 0]], 'steel', [0.006, y, 0], [0, 0, -90]);
      });
      K.tube(bar2, [[0.006, 0.95, 0], [0.03, 0.95, 0], [0.054, 0.975, 0], [0.054, 1.18, 0], [0.054, 1.385, 0], [0.03, 1.41, 0], [0.006, 1.41, 0]], 0.016, 'steel');
      return {
        tick(t, fx) {
          const k = fx === 'pull' ? Math.max(0, Math.sin(t * 5)) * 0.002 : 0;
          K.parts.bar.position.z = k;
        },
      };
    }
  );

  /* ===================== 3 · Fire extinguisher in a kitchen ===================== */
  const EX = [0.41, 0.75, 0.085]; // extinguisher base (bottom center) when hung
  TB.model(
    'extinguisherKitchen',
    ROOM({ cam: [1.6, 1.5, 2.6], at: [-0.2, 1.0, 0], tex: ['plank_flooring', 'granite_tile'], hidden: ['bracket', 'finder', 'marks', 'hoseAim'] }),
    (K) => {
      const wall = K.part('wall', [0, 0, 0], null, 'Kitchen wall');
      const pm = paint(K, 0xeae4d8);
      K.box(wall, [3.0, 2.44, 0.0127], pm, [-0.5, 1.22, -0.0064], null, 0);
      K.box(wall, [0.81, 0.41, 0.0127], pm, [1.405, 2.235, -0.0064], null, 0);
      K.box(wall, [0.5, 2.44, 0.0127], pm, [2.06, 1.22, -0.0064], null, 0);
      K.box(wall, [3.0, 0.09, 0.012], 'offwhite', [-0.5, 0.045, 0.006], null, 0.003);
      // doorway (the exit) with casing
      const door = K.part('doorway', [1.405, 0, 0], null, 'Exit doorway');
      K.box(door, [0.07, 2.07, 0.018], 'offwhite', [-0.44, 1.035, 0.009], null, 0.003);
      K.box(door, [0.07, 2.07, 0.018], 'offwhite', [0.44, 1.035, 0.009], null, 0.003);
      K.box(door, [0.95, 0.07, 0.018], 'offwhite', [0, 2.07, 0.009], null, 0.003);
      K.box(door, [0.81, 2.03, 0.14], K.std(0x6d6a63, { roughness: 1 }), [0, 1.015, -0.09], null, 0);
      const studs = K.part('studs', [0, 0, 0], null, 'Studs (16″ on center)');
      [-1.62, -1.22, -0.81, -0.41, 0, 0.41, 0.96].forEach((x) => K.box(studs, [0.038, 2.44, 0.089], 'woodLight', [x, 1.22, -0.057], null, 0.002));
      // cabinets + counter + range
      const cab = K.std(0x3f5a6e, { roughness: 0.55 });
      const top = K.pbr('granite_tile', [1, 0.5], { roughness: 0.35 }, 'stone');
      const kit = K.part('kitchen', [0, 0, 0], null, 'Cabinets and counter');
      [[-2.0, -1.28], [-0.52, 0.1]].forEach(([a, b]) => {
        const w = b - a;
        const cx = (a + b) / 2;
        K.box(kit, [w, 0.86, 0.6], cab, [cx, 0.47, 0.3], null, 0.008);
        K.box(kit, [w + 0.02, 0.04, 0.64], top, [cx, 0.92, 0.32], null, 0.006);
        K.box(kit, [w, 0.08, 0.55], 'dark', [cx, 0.04, 0.27], null, 0);
        K.box(kit, [w, 0.7, 0.33], cab, [cx, 1.77, 0.165], null, 0.008);
        K.rep(Math.round(w / 0.3), (i) => K.box(kit, [0.012, 0.1, 0.02], 'steel', [a + 0.15 + i * 0.3, 0.75, 0.61], null, 0.004));
      });
      const rng = K.part('range', [-0.9, 0, 0.32], null, 'Range');
      K.box(rng, [0.76, 0.9, 0.64], 'steel', [0, 0.45, 0], null, 0.01);
      K.box(rng, [0.76, 0.02, 0.64], 'black', [0, 0.91, 0], null, 0.004);
      K.box(rng, [0.62, 0.32, 0.01], 'glass', [0, 0.45, 0.322], null, 0.004);
      K.box(rng, [0.6, 0.02, 0.03], 'steel', [0, 0.68, 0.34], null, 0.006);
      [[-0.18, -0.15], [0.18, -0.15], [-0.18, 0.15], [0.18, 0.15]].forEach(([x, z]) => {
        K.tor(rng, [0.08, 0.006], 'black', [x, 0.93, z], [90, 0, 0]);
        K.cyl(rng, [0.03, 0.03, 0.02, 16], 'dark', [x, 0.925, z]);
      });
      K.rep(4, (i) => K.cyl(rng, [0.018, 0.018, 0.02, 16], 'black', [-0.27 + i * 0.18, 0.82, 0.33], [90, 0, 0]));
      K.box(rng, [0.76, 0.14, 0.05], 'steel', [0, 0.98, -0.3], null, 0.006);
      K.box(null, [0.76, 0.2, 0.48], 'steel', [-0.9, 1.6, 0.24], null, 0.01);
      const pan = K.part('pan', [-1.08, 0.94, 0.17], null, 'Pan on the stove');
      K.lathe(pan, [[0, 0], [0.1, 0], [0.115, 0.05], [0.112, 0.055], [0.098, 0.006], [0, 0.006]], 'dark');
      K.box(pan, [0.2, 0.012, 0.03], 'black', [0.2, 0.04, 0.0], [0, 0, 8], 0.006);
      const flames = [];
      K.rep(7, (i) => {
        const a = (i / 7) * Math.PI * 2;
        const f = K.cone(pan, [0.04, 0.22, 10], i % 2 ? 'flame' : 'fire', [Math.cos(a) * 0.05, 0.14, Math.sin(a) * 0.05]);
        f.userData.noPick = true;
        flames.push(f);
      });
      const core = K.cone(pan, [0.07, 0.3, 12], 'fire', [0, 0.18, 0]);
      core.userData.noPick = true;
      flames.push(core);
      // stud finder + marks
      finder(K, [0.41, 1.05, 0.018]);
      const marks = K.part('marks', [0.41, 0, 0.0008], null, 'Pencil marks on the stud');
      K.box(marks, [0.04, 0.003, 0.001], 'dark', [0, 1.02, 0], null, 0);
      K.box(marks, [0.04, 0.003, 0.001], 'dark', [0, 0.9, 0], null, 0);
      K.box(marks, [0.003, 0.16, 0.001], 'dark', [0, 0.96, 0], null, 0);
      // wall bracket
      const br = K.part('bracket', [EX[0], 0, 0], null, 'Wall bracket (screwed into a stud)');
      K.box(br, [0.045, 0.24, 0.003], 'red', [0, 0.97, 0.0015], null, 0);
      K.box(br, [0.06, 0.012, 0.035], 'red', [0, 1.13, 0.02], null, 0.003);
      [1.06, 0.88].forEach((y) => K.screw(br, 0.0045, 0.064, 'steel', [0, y, 0.004], [90, 0, 0]));
      band(K, br, 0.057, 0.025, -Math.PI * 0.62, Math.PI * 1.24, 'black', [0, 0.97, EX[2]]);
      K.box(br, [0.02, 0.03, 0.012], 'steel', [0, 0.97, EX[2] + 0.058], null, 0.003);
      // the extinguisher
      const ext = K.part('ext', EX, null, '5 lb ABC extinguisher');
      const red = K.paint(0xc8201c);
      K.lathe(ext, [[0, 0], [0.05, 0], [0.054, 0.012], [0.054, 0.31], [0.05, 0.35], [0.034, 0.375], [0.016, 0.385], [0, 0.385]], red);
      K.cyl(ext, [0.052, 0.052, 0.012, 32], 'black', [0, 0.006, 0]);
      const label = K.part('label', [0, 0, 0], ext, 'Rating label (A:B:C) + date');
      band(K, label, 0.0545, 0.17, -0.9, 1.8, K.std(0xf7f5ef, { roughness: 0.7 }), [0, 0.19, 0]);
      [[-0.022, 0x3d9a4a], [0, 0xd0433a], [0.022, 0x2f6fd0]].forEach(([x, c]) => K.box(label, [0.016, 0.016, 0.002], K.std(c), [x, 0.22, Math.sqrt(0.0555 * 0.0555 - x * x)], [0, Math.asin(x / 0.0555) / K.DEG, 0], 0));
      K.box(label, [0.06, 0.006, 0.002], 'dark', [0, 0.16, 0.0556], null, 0);
      K.box(label, [0.05, 0.006, 0.002], 'dark', [0, 0.145, 0.0556], null, 0);
      K.cyl(ext, [0.014, 0.014, 0.025, 16], 'brass', [0, 0.395, 0]);
      K.box(ext, [0.034, 0.045, 0.038], 'chrome', [0, 0.43, 0], null, 0.006);
      K.box(ext, [0.13, 0.008, 0.024], 'black', [0.06, 0.428, 0], null, 0.003);
      const lv = K.part('lever', [-0.01, 0.458, 0], ext, 'Squeeze lever');
      K.box(lv, [0.14, 0.008, 0.022], 'black', [0.065, 0, 0], [0, 0, 10], 0.003);
      const pin = K.part('pin', [0.03, 0.44, 0], ext, 'Pull pin');
      K.cyl(pin, [0.0018, 0.0018, 0.05, 8], 'chrome', [0, 0, 0], [90, 0, 0]);
      K.tor(pin, [0.012, 0.0018], 'chrome', [0, 0, 0.037], [0, 0, 0]);
      const seal = K.part('seal', [0, 0, 0], pin, 'Tamper seal');
      K.tor(seal, [0.007, 0.0014], 'yellow', [0.012, -0.008, 0.025], [0, 90, 0]);
      const gauge = K.part('gauge', [-0.006, 0.43, 0.02], ext, 'Pressure gauge');
      K.cyl(gauge, [0.013, 0.013, 0.008, 24], 'chrome', [0, 0, 0.004], [90, 0, 0]);
      K.cyl(gauge, [0.011, 0.011, 0.002, 24], K.std(0xffffff, { roughness: 0.5 }), [0, 0, 0.0085], [90, 0, 0]);
      K.tor(gauge, [0.008, 0.0016, 60], K.std(0x3fbf5a, { emissive: 0x1f8f3a, emissiveIntensity: 0.4 }), [0, 0, 0.0095], [0, 0, 60]);
      K.tor(gauge, [0.008, 0.0012, 50], 'red', [0, 0, 0.0095], [0, 0, 120]);
      K.tor(gauge, [0.008, 0.0012, 50], 'red', [0, 0, 0.0095], [0, 0, 10]);
      K.box(gauge, [0.0012, 0.008, 0.001], 'black', [0, 0.004, 0.0105], null, 0);
      const hose = K.part('hose', [0, 0, 0], ext, 'Hose + nozzle (clipped)');
      K.tube(hose, [[-0.016, 0.42, 0], [-0.045, 0.4, 0], [-0.064, 0.32, 0], [-0.064, 0.16, 0]], 0.006, 'black');
      K.cone(hose, [0.009, 0.035, 12], 'black', [-0.064, 0.14, 0], [180, 0, 0]);
      K.box(hose, [0.016, 0.012, 0.02], 'black', [-0.058, 0.24, 0], null, 0.003);
      const aim = K.part('hoseAim', [0, 0, 0], ext, 'Hose aimed at the base of the fire');
      K.tube(aim, [[-0.016, 0.42, 0], [-0.06, 0.4, 0.03], [-0.09, 0.36, 0.1], [-0.1, 0.33, 0.15]], 0.006, 'black');
      K.cone(aim, [0.009, 0.035, 12], 'black', [-0.102, 0.325, 0.17], [80, 0, 0]);
      const sweep = K.group(aim, [-0.102, 0.322, 0.19]);
      const sg = K.group(sweep, [0, 0, 0]);
      sg.quaternion.setFromUnitVectors(new K.THREE.Vector3(0, 1, 0), new K.THREE.Vector3(0.36, -0.12, 1.0).normalize());
      const spray = K.cone(sg, [0.22, 1.15, 24, true], K.std(0xf4f1e8, { transparent: true, opacity: 0.42, roughness: 1 }), [0, 0.575, 0], [180, 0, 0]);
      spray.userData.noPick = true;
      return {
        tick(t, fx) {
          const fire = fx === 'fire' || fx === 'aim';
          const sp = fx === 'spray';
          flames.forEach((f, i) => {
            f.visible = fire || sp;
            const s = (sp ? 0.35 : 1) * (0.8 + 0.25 * Math.sin(t * 9 + i * 1.7));
            f.scale.set(sp ? 0.6 : 1, s, sp ? 0.6 : 1);
          });
          spray.visible = sp;
          sweep.rotation.y = sp ? Math.sin(t * 3) * 0.22 : 0;
        },
      };
    }
  );

  /* ===================== 4 · Water heater earthquake straps ===================== */
  const WH = { cx: 0, cz: 0.3, r: 0.255, h: 1.52, top: 1.2, low: 0.49, ax: 0.406 };
  TB.model(
    'waterHeaterStrap',
    {
      env: 'garage',
      unit: 1,
      cam: [1.5, 1.4, 2.2],
      at: [0, 0.85, 0.2],
      tex: ['concrete_floor_01'],
      ground: { tex: 'concrete_floor_01', repeat: 4, radius: 4 },
      hidden: ['finder', 'marks', 'spacers', 'strapTop', 'strapLow', 'lagsTop', 'lagsLow'],
    },
    (K) => {
      const wall = K.part('wall', [0, 0, 0], null, 'Wall behind the heater');
      K.box(wall, [2.6, 2.44, 0.0127], paint(K, 0xe4e1da), [0, 1.22, -0.0064], null, 0);
      K.box(wall, [2.6, 0.09, 0.012], 'offwhite', [0, 0.045, 0.006], null, 0.003);
      const studs = K.part('studs', [0, 0, 0], null, 'Studs (16″ on center)');
      [-1.22, -0.813, -0.406, 0, 0.406, 0.813, 1.22].forEach((x) => K.box(studs, [0.038, 2.44, 0.089], 'woodLight', [x, 1.22, -0.057], null, 0.002));
      // tank
      const tank = K.part('tank', [WH.cx, 0, WH.cz], null, 'Gas water heater (50 gal)');
      const jacket = K.std(0xe9e6df, { roughness: 0.45, metalness: 0.1 });
      K.lathe(tank, [[0, 0.03], [WH.r, 0.03], [WH.r, WH.h - 0.05], [WH.r - 0.03, WH.h], [0, WH.h + 0.01]], jacket);
      K.cyl(tank, [WH.r + 0.003, WH.r + 0.003, 0.035, 48], 'grey', [0, 0.02, 0]);
      K.box(tank, [0.18, 0.24, 0.004], K.std(0xf4e9b8, { roughness: 0.8 }), [-0.14, 0.95, 0.205], [0, -35, 0], 0);
      K.box(tank, [0.12, 0.02, 0.004], 'red', [-0.14, 1.04, 0.207], [0, -35, 0], 0);
      // draft hood + vent
      K.cyl(tank, [0.11, 0.08, 0.1, 24], 'steel', [0, WH.h + 0.08, 0]);
      K.rep(3, (i) => K.box(tank, [0.03, 0.08, 0.004], 'steel', [Math.cos(i * 2.1) * 0.09, WH.h + 0.04, Math.sin(i * 2.1) * 0.09], [0, -i * 120, 0], 0));
      K.cyl(tank, [0.075, 0.075, 0.5, 24], 'steel', [0, WH.h + 0.38, 0]);
      K.tube(tank, [[0, WH.h + 0.6, 0], [0, WH.h + 0.72, -0.05], [0, WH.h + 0.76, -0.3]], 0.075, 'steel');
      // gas control + burner door
      const gc = K.part('gasControl', [0, 0.33, WH.r + 0.02], tank, 'Gas control valve');
      K.box(gc, [0.12, 0.1, 0.06], 'dark', [0, 0, 0], null, 0.008);
      K.cyl(gc, [0.024, 0.024, 0.02, 20], 'red', [0, 0.012, 0.035], [90, 0, 0]);
      K.cyl(gc, [0.015, 0.015, 0.016, 20], 'black', [0.04, -0.02, 0.035], [90, 0, 0]);
      K.box(tank, [0.16, 0.1, 0.006], 'dark', [0, 0.13, WH.r + 0.001], null, 0.004);
      // T&P relief + discharge
      K.cyl(tank, [0.018, 0.018, 0.06, 16], 'brass', [WH.r + 0.02, 1.32, 0], [0, 0, 90]);
      K.tube(tank, [[WH.r + 0.05, 1.32, 0], [WH.r + 0.08, 1.28, 0], [WH.r + 0.08, 0.12, 0]], 0.011, 'copper');
      // supply connectors on top (flexible)
      const flex = K.part('connectors', [0, 0, 0], tank, 'Flexible water connectors');
      [-0.12, 0.12].forEach((x) => {
        K.cyl(flex, [0.011, 0.011, 0.2, 12], K.std(0xb6bcc2, { metalness: 0.8, roughness: 0.3 }), [x, WH.h + 0.1, -0.05]);
        K.rep(10, (i) => K.tor(flex, [0.012, 0.0025], 'steel', [x, WH.h + 0.02 + i * 0.018, -0.05], [90, 0, 0]));
        K.cyl(flex, [0.011, 0.011, 0.6, 12], 'copper', [x, WH.h + 0.5, -0.05]);
      });
      K.cyl(flex, [0.022, 0.022, 0.04, 6], 'brass', [-0.12, WH.h + 0.24, -0.05]);
      // gas supply: black pipe from wall with a drip leg and yellow flex connector
      const gas = K.part('gasLine', [0, 0, 0], null, 'Gas line + flex connector');
      pipe(K, gas, [[0.42, 1.0, 0.05], [0.42, 0.06, 0.05]], 0.0105, 'black');
      pipe(K, gas, [[0.42, 0.33, 0.05], [0.42, 0.33, 0.2]], 0.0105, 'black');
      K.cyl(gas, [0.016, 0.016, 0.05, 6], 'black', [0.42, 0.06, 0.05]);
      const yv = K.group(gas, [0.42, 0.33, 0.2]);
      K.ccyl(yv, [0.017, 0.045, 16], 'brass', [0, 0, 0], [90, 0, 0]);
      K.box(yv, [0.016, 0.07, 0.008], 'yellow', [0, 0.03, 0.01], null, 0.003);
      K.tube(gas, [[0.42, 0.33, 0.24], [0.36, 0.3, 0.42], [0.2, 0.32, 0.6], [0.06, 0.33, 0.6]], 0.008, K.std(0xf2c230, { roughness: 0.4 }));
      // stud finder + marks
      finder(K, [WH.ax, 1.25, 0.018]);
      const marks = K.part('marks', [0, 0, 0.0008], null, 'Strap-height marks on the studs');
      [WH.top, WH.low].forEach((y) =>
        [-WH.ax, WH.ax].forEach((x) => {
          K.box(marks, [0.06, 0.003, 0.001], 'dark', [x, y, 0], null, 0);
          K.box(marks, [0.003, 0.06, 0.001], 'dark', [x, y, 0], null, 0);
        })
      );
      // spacer blocks behind the tank
      const sp = K.part('spacers', [0, 0, 0], null, '2×4 spacer blocks (fill the gap behind the tank)');
      [WH.top, WH.low].forEach((y) => {
        K.box(sp, [0.36, 0.089, 0.038], 'wood', [0, y, 0.019], null, 0.002);
        [-0.14, 0.14].forEach((x) => K.cyl(sp, [0.005, 0.005, 0.004, 10], 'steel', [x, y, 0.039], [90, 0, 0]));
      });
      // straps
      const g = galv(K);
      function strap(name, label, y) {
        const p = K.part(name, [0, 0, 0], null, label);
        const R = WH.r + 0.003;
        const tangent = (ax) => {
          const dx = ax - WH.cx;
          const dz = 0.004 - WH.cz;
          const d = Math.hypot(dx, dz);
          const base = Math.atan2(dz, dx);
          const al = Math.acos(R / d);
          const c = [base + al, base - al].map((a) => [a, WH.cx + R * Math.cos(a), WH.cz + R * Math.sin(a)]);
          return c[0][2] > c[1][2] ? c[0] : c[1];
        };
        const [tr, xr, zr] = tangent(WH.ax);
        const [tl0, xl, zl] = tangent(-WH.ax);
        const tl = tl0 < 0 ? tl0 + Math.PI * 2 : tl0;
        band(K, p, R, 0.032, Math.PI / 2 - tl, tl - tr, g, [WH.cx, y, WH.cz]);
        [[WH.ax, xr, zr], [-WH.ax, xl, zl]].forEach(([ax, x, z]) => {
          const dx = x - ax;
          const dz = z - 0.004;
          const L = Math.hypot(dx, dz);
          K.box(p, [L, 0.032, 0.0015], g, [(ax + x) / 2, y, (0.004 + z) / 2], [0, Math.atan2(-dz, dx) / K.DEG, 0], 0);
          K.box(p, [0.05, 0.032, 0.0015], g, [ax, y, 0.003], null, 0);
        });
        K.box(p, [0.04, 0.045, 0.02], g, [WH.cx, y, WH.cz + R + 0.01], null, 0.004);
        K.screw(p, 0.006, 0.05, 'steel', [WH.cx + 0.025, y, WH.cz + R + 0.01], [0, 0, 90], 'hex');
        const lags = K.part(name === 'strapTop' ? 'lagsTop' : 'lagsLow', [0, 0, 0], null, '¼″ × 3″ lag screws + washers into studs');
        [-WH.ax, WH.ax].forEach((x) => {
          K.cyl(lags, [0.012, 0.012, 0.002, 16], 'steel', [x, y, 0.005], [90, 0, 0]);
          K.screw(lags, 0.0064, 0.076, 'steel', [x, y, 0.006], [90, 0, 0], 'hex');
        });
      }
      strap('strapTop', 'Upper strap (upper ⅓ of the tank)', WH.top);
      strap('strapLow', 'Lower strap (lower ⅓, 4″+ above the controls)', WH.low);
    }
  );

  /* ===================== 5 · Anchor a dresser and TV against tip-over ===================== */
  const DR = { x: -0.6, z: 0.28, w: 0.9, h: 1.22, d: 0.46 };
  TB.model(
    'tipOverRoom',
    ROOM({ cam: [1.4, 1.5, 2.8], at: [0, 0.8, 0.2], hidden: ['finder', 'marks', 'furnBracket', 'wallBracket', 'strap', 'tvStraps'] }),
    (K) => {
      const wall = K.part('wall', [0, 0, 0], null, 'Bedroom wall');
      K.box(wall, [3.2, 2.44, 0.0127], paint(K, 0xdfe6e3), [0, 1.22, -0.0064], null, 0);
      K.box(wall, [3.2, 0.09, 0.012], 'offwhite', [0, 0.045, 0.006], null, 0.003);
      const studs = K.part('studs', [0, 0, 0], null, 'Studs (16″ on center)');
      [-1.22, -0.813, -0.406, 0, 0.406, 0.813, 1.22].forEach((x) => K.box(studs, [0.038, 2.44, 0.089], 'woodLight', [x, 1.22, -0.057], null, 0.002));
      // dresser
      const dr = K.part('dresser', [DR.x, 0, DR.z], null, 'Tall 5-drawer dresser');
      const wd = K.pbr('oak_wood_planks', [0.6, 0.6], { color: 0xd8b892 }, 'woodLight');
      K.box(dr, [DR.w, DR.h - 0.08, DR.d], wd, [0, 0.08 + (DR.h - 0.08) / 2, 0], null, 0.006);
      K.box(dr, [DR.w + 0.02, 0.025, DR.d + 0.02], wd, [0, DR.h + 0.012, 0.005], null, 0.005);
      [[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]].forEach(([x, z]) => K.box(dr, [0.05, 0.08, 0.05], 'woodDark', [x, 0.04, z], null, 0.006));
      const drawers = K.part('drawers', [0, 0, DR.d / 2], dr, 'Drawers');
      K.rep(5, (i) => {
        const y = 0.17 + i * 0.215;
        K.box(drawers, [DR.w - 0.04, 0.2, 0.02], K.pbr('oak_wood_planks', [0.4, 0.15], { color: 0xe2c6a0 }, 'woodLight'), [0, y, 0.01], null, 0.004);
        [-0.22, 0.22].forEach((x) => K.cyl(drawers, [0.012, 0.012, 0.025, 16], 'brass', [x, y, 0.03], [90, 0, 0]));
      });
      K.lathe(dr, [[0, 0], [0.07, 0], [0.08, 0.04], [0.05, 0.22], [0.02, 0.26], [0, 0.26]], K.std(0x5d7f8f, { roughness: 0.35 }), [0.25, DR.h + 0.025, 0.02]);
      K.lathe(dr, [[0.08, 0], [0.12, 0.16], [0.11, 0.17], [0.07, 0.01]], K.std(0xf3ead6, { roughness: 0.9 }), [0.25, DR.h + 0.28, 0.02]);
      // furniture bracket on the back of the top rail (child: moves with the dresser)
      const fb = K.part('furnBracket', [-DR.x - 0.406, DR.h - 0.04, -DR.d / 2 - 0.001], dr, 'Bracket on the top back rail');
      K.box(fb, [0.03, 0.05, 0.003], 'steel', [0, 0, 0], null, 0);
      K.box(fb, [0.03, 0.003, 0.03], 'steel', [0, 0.025, 0.015], null, 0);
      K.screw(fb, 0.004, 0.016, 'steel', [0, -0.008, -0.002], [-90, 0, 0]);
      // TV on console
      const con = K.part('console', [0.75, 0, 0.22], null, 'Low media console');
      K.box(con, [1.5, 0.48, 0.4], K.std(0x2e2f33, { roughness: 0.6 }), [0, 0.28, 0], null, 0.01);
      [-0.68, 0.68].forEach((x) => [-0.15, 0.15].forEach((z) => K.cyl(con, [0.015, 0.012, 0.04, 12], 'brass', [x, 0.02, z])));
      K.rep(3, (i) => K.box(con, [0.48, 0.42, 0.01], K.std(0x3a3c41, { roughness: 0.5 }), [-0.5 + i * 0.5, 0.28, 0.2], null, 0.004));
      const tv = K.part('tv', [0.75, 0.52, 0.2], null, '55″ TV on its feet');
      K.box(tv, [1.23, 0.71, 0.03], 'black', [0, 0.42, 0], null, 0.006);
      K.box(tv, [1.2, 0.68, 0.002], 'screen', [0, 0.42, 0.016], null, 0);
      K.box(tv, [0.5, 0.4, 0.05], 'black', [0, 0.4, -0.035], null, 0.01);
      [-0.5, 0.5].forEach((x) => {
        K.box(tv, [0.03, 0.06, 0.18], 'dark', [x, 0.03, 0], [10, 0, 0], 0.006);
        K.box(tv, [0.04, 0.01, 0.22], 'dark', [x, 0.005, 0], null, 0.003);
      });
      // stud finder + marks
      finder(K, [-0.406, 1.2, 0.018]);
      const marks = K.part('marks', [0, 0, 0.0008], null, 'Stud + height marks');
      [-0.406, 0.406, 0.813].forEach((x) => {
        K.box(marks, [0.024, 0.12, 0.0008], tapeBlue(K), [x, x < 0 ? 1.13 : 1.0, 0], null, 0);
        K.box(marks, [0.05, 0.003, 0.001], 'dark', [x, x < 0 ? 1.13 : 1.0, 0.0006], null, 0);
      });
      // wall bracket into the stud, 2″ below the furniture bracket
      const wb = K.part('wallBracket', [-0.406, DR.h - 0.09, 0.0], null, 'Wall bracket (2″ screw into the stud)');
      K.box(wb, [0.03, 0.05, 0.003], 'steel', [0, 0, 0.0015], null, 0);
      K.box(wb, [0.03, 0.003, 0.03], 'steel', [0, 0.025, 0.015], null, 0);
      K.screw(wb, 0.0045, 0.05, 'steel', [0, -0.008, 0.004], [90, 0, 0]);
      const strap = K.part('strap', [0, 0, 0], null, 'Tip-over strap (no slack)');
      const fbY = DR.h - 0.04 + 0.025;
      const fbZ = DR.z - DR.d / 2 + 0.014;
      K.tube(strap, [[-0.406, DR.h - 0.065, 0.028], [-0.406, (fbY + DR.h - 0.065) / 2 + 0.01, (fbZ + 0.028) / 2], [-0.406, fbY, fbZ]], 0.006, K.std(0xf4f4f0, { roughness: 0.8 }));
      K.box(strap, [0.03, 0.02, 0.01], 'black', [-0.406, (fbY + DR.h - 0.065) / 2 + 0.01, (fbZ + 0.028) / 2], null, 0.003);
      // TV straps: VESA holes to wall brackets in studs
      const ts = K.part('tvStraps', [0, 0, 0], null, 'TV anti-tip straps (VESA bolts to studs)');
      [[0.6, 0.406], [0.9, 0.813]].forEach(([x, sx]) => {
        const y = 0.52 + 0.55;
        K.cyl(ts, [0.008, 0.008, 0.012, 6], 'steel', [x, y, 0.16], [90, 0, 0]);
        K.box(ts, [0.03, 0.05, 0.003], 'steel', [sx, y, 0.0015], null, 0);
        K.screw(ts, 0.0045, 0.05, 'steel', [sx, y - 0.01, 0.004], [90, 0, 0]);
        K.tube(ts, [[sx, y, 0.006], [(sx + x) / 2, y + 0.01, 0.08], [x, y, 0.155]], 0.005, 'black');
      });
      return {
        tick(t, fx) {
          K.parts.dresser.rotation.x = fx === 'tug' ? Math.max(0, Math.sin(t * 4)) * 0.012 : K.parts.dresser.rotation.x * 0.9;
        },
      };
    }
  );

  /* ===================== 6 · Stair handrail to code ===================== */
  const ST = { rise: 0.19, run: 0.254, n: 12, nose: 0.025, w: 0.91, rail: 0.914, rr: 0.0222 };
  ST.k = ST.rise / ST.run;
  ST.xa = -ST.nose;
  ST.xb = (ST.n - 1) * ST.run - ST.nose;
  ST.zc = 0.038 + ST.rr;
  const nosY = (x) => ST.rise + (x - ST.xa) * ST.k;
  const railY = (x) => nosY(x) + ST.rail - ST.rr;
  const BRK = [0.2, 1.418, 2.636];
  TB.model(
    'handrailStair',
    ROOM({ cam: [3.8, 2.3, 3.6], at: [1.3, 1.3, 0.3], tex: ['plank_flooring', 'oak_wood_planks'], hidden: ['finder', 'layout', 'brackets', 'rail', 'returns'] }),
    (K) => {
      const H = ST.n * ST.rise;
      const oak = K.pbr('oak_wood_planks', [0.4, 1.2], { color: 0xd9b88e }, 'woodLight');
      const wall = K.part('wall', [0, 0, 0], null, 'Stairwell wall');
      K.box(wall, [4.4, 3.9, 0.0127], paint(K, 0xe9e4da), [1.5, 1.95, -0.0064], null, 0);
      K.box(wall, [0.9, 0.09, 0.012], 'offwhite', [-0.5, 0.045, 0.006], null, 0.003);
      const studs = K.part('studs', [0, 0, 0], null, 'Studs (16″ on center)');
      for (let x = -0.612; x < 3.7; x += 0.406) K.box(studs, [0.038, 3.9, 0.089], 'woodLight', [x, 1.95, -0.057], null, 0.002);
      const stairs = K.part('stairs', [0, 0, 0], null, 'Stairs (12 risers)');
      const riserM = K.std(0xf4f2ec, { roughness: 0.6 });
      for (let i = 1; i < ST.n; i++) {
        const y = i * ST.rise;
        K.box(stairs, [ST.run, y - 0.025, ST.w], riserM, [(i - 0.5) * ST.run, (y - 0.025) / 2, ST.w / 2], null, 0.002);
        K.box(stairs, [ST.run + ST.nose, 0.025, ST.w + 0.02], oak, [(i - 0.5) * ST.run - ST.nose / 2, y - 0.0125, ST.w / 2], null, 0.006);
      }
      // upper floor
      K.box(stairs, [1.0, H, 1.6], riserM, [(ST.n - 1) * ST.run + 0.5, H / 2, 0.8], null, 0.004);
      K.box(stairs, [1.0, 0.025, 1.6], oak, [(ST.n - 1) * ST.run + 0.5, H - 0.0125, 0.8], null, 0.004);
      // open-side skirt panel under the stair
      const tri = [[0, 0], [(ST.n - 1) * ST.run, 0], [(ST.n - 1) * ST.run, H - 0.03], [0, ST.rise - 0.03]];
      K.ext(stairs, tri, 0.02, riserM, [0, 0, ST.w], null, 0);
      // wall-side skirt board
      const sk = [[ST.xa - 0.2, 0.1], [ST.xb + 0.25, nosY(ST.xb) + 0.25 * ST.k + 0.1 - ST.rise + 0.14], [ST.xb + 0.25, nosY(ST.xb) + 0.25 * ST.k - ST.rise + 0.02], [ST.xa - 0.2, 0.0]];
      K.ext(stairs, sk, 0.016, 'offwhite', [0, 0, 0], null, 0.002);
      finder(K, [BRK[1], railY(BRK[1]) - 0.07, 0.018]);
      const lay = K.part('layout', [0, 0, 0.001], null, 'Line 36″ above the nosings + stud marks');
      K.bar(lay, [ST.xa, nosY(ST.xa) + ST.rail, 0], [ST.xb, nosY(ST.xb) + ST.rail, 0], 0.0015, 'blue');
      BRK.forEach((x) => K.box(lay, [0.004, 0.1, 0.001], 'dark', [x, railY(x) - 0.06, 0], null, 0));
      const br = K.part('brackets', [0, 0, 0], null, 'Handrail brackets on studs (≤ 48″ apart)');
      const bz = K.std(0x4b3a2c, { metalness: 0.7, roughness: 0.4 });
      const ang = Math.atan(ST.k) / K.DEG;
      BRK.forEach((x) => {
        const yc = railY(x);
        const py = yc - 0.075;
        K.cyl(br, [0.03, 0.03, 0.008, 24], bz, [x, py, 0.004], [90, 0, 0]);
        [0, 120, 240].forEach((a) => K.cyl(br, [0.004, 0.004, 0.003, 8], 'steel', [x + Math.cos((a + 90) * K.DEG) * 0.018, py + Math.sin((a + 90) * K.DEG) * 0.018, 0.0095], [90, 0, 0]));
        K.tube(br, [[x, py, 0.008], [x, py, ST.zc - 0.012], [x, py + 0.012, ST.zc], [x, yc - ST.rr - 0.006, ST.zc]], 0.0055, bz);
        K.box(br, [0.05, 0.005, 0.03], bz, [x, yc - ST.rr - 0.003, ST.zc], [0, 0, ang], 0);
      });
      const rail = K.part('rail', [0, 0, 0], null, 'Round handrail (1¾″)');
      K.bar(rail, [ST.xa, railY(ST.xa), ST.zc], [ST.xb, railY(ST.xb), ST.zc], ST.rr, oak, 24);
      const ret = K.part('returns', [0, 0, 0], null, 'Returns to the wall at both ends');
      const ya = railY(ST.xa);
      const yb = railY(ST.xb);
      K.tube(ret, [[ST.xa + 0.02, ya + 0.02 * ST.k, ST.zc], [ST.xa, ya, ST.zc], [ST.xa - 0.04, ya - 0.006, ST.zc - 0.01], [ST.xa - 0.06, ya - 0.008, 0.03], [ST.xa - 0.062, ya - 0.008, 0.002]], ST.rr, oak);
      K.tube(ret, [[ST.xb - 0.02, yb - 0.02 * ST.k, ST.zc], [ST.xb, yb, ST.zc], [ST.xb + 0.04, yb + 0.006, ST.zc - 0.01], [ST.xb + 0.06, yb + 0.008, 0.03], [ST.xb + 0.062, yb + 0.008, 0.002]], ST.rr, oak);
      return {
        tick(t, fx) {
          K.parts.rail.position.z = fx === 'pull' && K.parts.rail.visible ? Math.max(0, Math.sin(t * 5)) * 0.002 : K.parts.rail.position.z;
        },
      };
    }
  );

  /* ===================== 7 · Hardware-mounted gate at the top of the stairs ===================== */
  const BG = { H: 8 * 0.19, gz: -0.06, post: 0.98, ps: 0.09 };
  TB.model(
    'babyGateStairs',
    ROOM({ cam: [2.2, BG.H + 1.25, -1.9], at: [0.45, BG.H + 0.35, 0.1], tex: ['plank_flooring', 'oak_wood_planks'], hidden: ['finder', 'marks', 'postKit', 'wallHinges', 'gate', 'latch'] }),
    (K) => {
      const H = BG.H;
      const oak = K.pbr('oak_wood_planks', [0.4, 1], { color: 0xd9b88e }, 'woodLight');
      const white = K.std(0xf4f2ec, { roughness: 0.6 });
      // wall along the stair (plane x = 0, facing +x)
      const wall = K.part('wall', [0, 0, 0], null, 'Stairwell wall');
      K.box(wall, [0.0127, H + 2.44, 4.6], paint(K, 0xe6e1d6), [-0.0064, (H + 2.44) / 2, 0.3], null, 0);
      K.box(wall, [0.012, 0.09, 2.0], 'offwhite', [0.006, H + 0.045, -1.0], null, 0.003);
      const studs = K.part('studs', [0, 0, 0], null, 'Studs (16″ on center)');
      for (let z = BG.gz - 0.406 * 4; z < 2.6; z += 0.406) K.box(studs, [0.089, H + 2.44, 0.038], 'woodLight', [-0.057, (H + 2.44) / 2, z], null, 0.002);
      // landing (upper floor)
      const land = K.part('landing', [0, 0, 0], null, 'Upstairs landing');
      K.box(land, [2.4, H - 0.02, 2.0], white, [1.2, (H - 0.02) / 2, -1.0], null, 0.004);
      K.box(land, [2.4, 0.025, 2.0], oak, [1.2, H - 0.0125, -1.0], null, 0.004);
      // stairs descending toward +z
      const stairs = K.part('stairs', [0, 0, 0], null, 'Stairs down');
      for (let i = 1; i <= 7; i++) {
        const y = H - i * 0.19;
        K.box(stairs, [0.91, y - 0.025, 0.254], white, [0.455, (y - 0.025) / 2, (i - 0.5) * 0.254], null, 0.002);
        K.box(stairs, [0.93, 0.025, 0.279], oak, [0.465, y - 0.0125, (i - 0.5) * 0.254 - 0.0125], null, 0.006);
      }
      // banister: top newel, sloped rail, balusters, landing guard
      const nw = K.part('newel', [BG.post, 0, BG.gz], null, 'Newel post (top of stairs)');
      K.box(nw, [BG.ps, 1.05, BG.ps], white, [0, H + 0.525, 0], null, 0.006);
      K.box(nw, [BG.ps + 0.03, 0.04, BG.ps + 0.03], white, [0, H + 1.07, 0], null, 0.006);
      K.box(nw, [BG.ps + 0.02, 0.12, BG.ps + 0.02], white, [0, H + 0.06, 0], null, 0.006);
      const ban = K.part('banister', [0, 0, 0], null, 'Banister + guard');
      const slope = 0.19 / 0.254;
      const ry = (z) => H + 0.86 - z * slope;
      K.bar(ban, [BG.post, ry(0.0), 0.0], [BG.post, ry(1.9), 1.9], 0.03, oak, 16);
      for (let i = 0; i < 7; i++) {
        [0.06, 0.18].forEach((dz) => {
          const z = i * 0.254 + dz;
          const yb = H - (i + 1) * 0.19;
          K.cyl(ban, [0.016, 0.016, ry(z) - yb, 8], white, [BG.post, (ry(z) + yb) / 2, z]);
        });
      }
      K.box(ban, [1.3, 0.06, 0.07], oak, [BG.post + 0.7, H + 0.94, BG.gz], null, 0.01);
      for (let x = BG.post + 0.12; x < 2.35; x += 0.11) K.cyl(ban, [0.016, 0.016, 0.9, 8], white, [x, H + 0.46, BG.gz]);
      // stud finder + marks
      finder(K, [0.018, H + 0.4, BG.gz], 90);
      const marks = K.part('marks', [0.0008, 0, BG.gz], null, 'Hinge + latch height marks');
      [H + 0.12, H + 0.62].forEach((y) => {
        K.box(marks, [0.001, 0.003, 0.05], 'dark', [0, y, 0], null, 0);
        K.box(marks, [0.001, 0.05, 0.003], 'dark', [0, y, 0], null, 0);
        K.box(marks, [0.003, 0.003, 0.05], 'dark', [BG.post - BG.ps / 2 - 0.02, y, 0], null, 0);
      });
      // banister kit: mounting board strapped to the newel
      const pk = K.part('postKit', [BG.post - BG.ps / 2, 0, BG.gz], null, 'Banister kit (strapped to the newel, no holes)');
      K.box(pk, [0.02, 0.7, 0.075], white, [-0.01, H + 0.42, 0], null, 0.004);
      [H + 0.2, H + 0.65].forEach((y) => {
        K.box(pk, [BG.ps + 0.03, 0.025, 0.004], 'black', [BG.ps / 2 - 0.01, y, BG.ps / 2 + 0.002], null, 0);
        K.box(pk, [BG.ps + 0.03, 0.025, 0.004], 'black', [BG.ps / 2 - 0.01, y, -BG.ps / 2 - 0.002], null, 0);
        K.box(pk, [0.004, 0.025, BG.ps + 0.008], 'black', [BG.ps + 0.002, y, 0], null, 0);
        K.box(pk, [0.012, 0.035, 0.02], 'dark', [-0.022, y, 0.03], null, 0.003);
      });
      // wall hinges into the stud
      const wh = K.part('wallHinges', [0, 0, BG.gz], null, 'Hinge cups screwed into the stud');
      [H + 0.12, H + 0.62].forEach((y) => {
        K.box(wh, [0.012, 0.06, 0.04], white, [0.006, y, 0], null, 0.003);
        K.box(wh, [0.04, 0.03, 0.03], white, [0.025, y, 0], null, 0.006);
        [-0.02, 0.02].forEach((dy) => K.cyl(wh, [0.004, 0.004, 0.003, 8], 'steel', [0.013, y + dy, 0], [0, 0, 90]));
      });
      // gate door (pivot on the hinge line)
      const gate = K.part('gate', [0.045, H, BG.gz], null, 'Gate (swings toward the landing only)');
      const gw = BG.post - BG.ps / 2 - 0.045 - 0.03;
      const gm = K.std(0xf7f7f4, { roughness: 0.35, metalness: 0.2 });
      K.box(gate, [gw, 0.025, 0.025], gm, [gw / 2, 0.06, 0], null, 0.006);
      K.box(gate, [gw, 0.025, 0.025], gm, [gw / 2, 0.78, 0], null, 0.006);
      K.box(gate, [0.025, 0.75, 0.025], gm, [0.0125, 0.42, 0], null, 0.006);
      K.box(gate, [0.025, 0.75, 0.025], gm, [gw - 0.0125, 0.42, 0], null, 0.006);
      for (let x = 0.07; x < gw - 0.03; x += 0.06) K.cyl(gate, [0.006, 0.006, 0.7, 8], gm, [x, 0.42, 0]);
      [0.12, 0.62].forEach((y) => K.cyl(gate, [0.008, 0.008, 0.04, 10], 'steel', [0.0, y, 0]));
      K.box(gate, [0.03, 0.08, 0.04], 'lightgrey', [gw - 0.02, 0.74, 0], null, 0.006);
      // latch receiver on the kit
      const la = K.part('latch', [BG.post - BG.ps / 2 - 0.022, H, BG.gz], null, 'Latch + stair-side stop');
      K.box(la, [0.02, 0.1, 0.05], 'lightgrey', [-0.01, 0.74, 0], null, 0.006);
      K.box(la, [0.035, 0.03, 0.012], 'red', [-0.02, 0.74, 0.03], null, 0.003);
      K.box(la, [0.03, 0.06, 0.015], 'lightgrey', [-0.015, 0.12, 0.022], null, 0.004);
    }
  );

  /* ===================== Guides ===================== */
  TB.category({
    id: 'safety',
    icon: 'safety',
    code: 'SAF',
    name: 'Home Safety',
    domain: 'systems',
    blurb: 'Shutoffs, extinguishers, grab bars, straps and gates: the upgrades that prevent the worst days',
    repairs: [
      {
        id: 'emergency-shutoffs',
        title: 'Find and label your emergency shutoffs',
        model: 'shutoffHouse',
        level: 1,
        time: '45–90 min',
        cost: '$0–30',
        summary: 'When a pipe bursts or you smell gas, you have minutes. Find the main water valve, the gas meter valve and the main breaker now, test what’s safe to test, tag them, and make a map everyone in the house can follow.',
        intro: { hi: ['waterMain', 'gasValve', 'mainBreaker'] },
        safety: [
          'If you smell gas, leave first and call the gas utility or 911 from outside. Don’t flip switches, use phones inside or start a car in the garage.',
          'Never turn the gas meter valve off just to test it. Once it’s off, only the gas company should turn it back on and relight pilots.',
          'Don’t touch the electrical panel with wet hands or while standing in water. If there’s flooding near the panel, call the utility to cut power at the meter.',
        ],
        causes: [
          ['Burst or leaking pipe', 'Close the main water valve, then open a low faucet to drain pressure.'],
          ['Gas smell or hissing', 'Get out and call. Turn off at the meter only if it’s safe or you’re told to.'],
          ['Sparking, smoke from the panel, flooding', 'Main breaker off, if you can reach it safely and dry.'],
          ['Earthquake, wildfire evacuation', 'Follow your utility’s instructions; shutting gas off when it isn’t needed means days without heat.'],
        ],
        tools: ['Flashlight', '12″ adjustable wrench or 4-in-1 gas shutoff wrench', 'Curb key (for the city-side valve)', 'Waterproof tags + zip ties', 'Permanent marker', 'Phone camera'],
        steps: [
          {
            t: 'Walk the house with a plan',
            d: 'Take a flashlight and your phone. Walk the outside and inside with the goal of finding three things: where water enters, where gas enters, and the electrical panel.',
            why: 'In an emergency nobody has time to search. Knowing the three main shutoffs cold turns a disaster into a cleanup.',
            v: { cam: [6.5, 7, 9], at: [0.4, 0.5, 0.3], hi: ['house'] },
          },
          {
            t: 'Find the main water valve',
            d: 'Look where the water line comes through the floor or foundation, usually on the street side, in a basement, garage, utility closet or crawl space, often right before or after the meter.',
            why: 'This one valve stops every fixture in the house. It’s the first move for any burst pipe or failed water heater.',
            tip: 'Warm climates often put the main outside near the foundation or in a box by the curb.',
            v: { cam: [1.8, 1.25, -0.9], at: [1.0, 0.6, -2.0], hi: ['waterMain', 'waterMeter'] },
          },
          {
            t: 'Test it: close, check, reopen',
            d: 'A lever valve turns a quarter turn: in line with the pipe is open, across the pipe is closed. A round wheel turns clockwise to close. Close it, open a faucet to confirm the water stops, then reopen the main slowly.',
            why: 'Valves that never move seize up. Finding out today that it’s stuck is far better than finding out during a flood.',
            tip: 'If an old gate valve won’t budge or starts dripping at the stem, don’t force it. Have a plumber replace it with a full-port ball valve.',
            v: { cam: [1.5, 0.85, -1.4], at: [1.0, 0.5, -2.0], hi: ['waterLever'], rt: { waterLever: [0, 0, 90] } },
          },
          {
            t: 'Know the city-side valve',
            d: 'Find the round curb box lid in the yard or sidewalk marked WATER. Inside is the utility’s valve, turned with a long curb key. Reopen your house main, then note this one as a backup.',
            why: 'If the house main fails or the break is between the street and the house, this is the only way to stop the water.',
            tip: 'Some utilities only allow their own crews to operate the curb stop. Call them first if you can.',
            v: { cam: [2.6, 1.4, 5.6], at: [1.4, 0.1, 3.5], hi: ['curbBox', 'curbKey'], show: ['curbKey'], rt: { waterLever: [0, 0, 0] }, mv: { curbLid: [0.18, 0, 0.05] } },
          },
          {
            t: 'Find the gas meter valve',
            d: 'Outside at the gas meter, find the valve on the pipe coming up out of the ground before the meter. It has a flat tang with a hole. Tang in line with the pipe is ON; a quarter turn across the pipe is OFF.',
            why: 'This is the only valve that shuts gas to the whole house. Look, but don’t turn it.',
            v: { cam: [4.4, 0.95, 0.3], at: [3.25, 0.45, -0.85], hi: ['gasValve', 'gasTang'], mv: { curbLid: [0, 0, 0] }, hide: ['curbKey'] },
          },
          {
            t: 'Keep a wrench at the meter',
            d: 'Tie or hang a 12″ adjustable wrench or a gas shutoff wrench near the meter. To shut off, you’d fit it on the tang and turn a quarter turn so the tang is across the pipe.',
            why: 'The tang is too stiff to turn by hand. A wrench stored right there means anyone can do it after you’ve left the house.',
            tip: 'Once the gas is off, every pilot light goes out. The utility must check for leaks and turn it back on.',
            v: { cam: [4.2, 0.8, 0.1], at: [3.27, 0.3, -0.9], hi: ['gasWrench', 'gasTang'], show: ['gasWrench'] },
          },
          {
            t: 'Find the appliance gas valves',
            d: 'Every gas appliance has its own shutoff, usually a yellow-handled valve on the line beside it. Find the one for the water heater, furnace, range and dryer.',
            why: 'For a single appliance problem you can shut off just that one and keep the rest of the house running.',
            v: { cam: [2.8, 1.0, -0.4], at: [1.9, 0.45, -1.5], hi: ['whGas'], hide: ['gasWrench'] },
          },
          {
            t: 'Find the main breaker',
            d: 'Open the panel door. The main breaker is the large one at the top, labeled MAIN with its amp rating. Flipping it to OFF cuts every circuit in the house.',
            why: 'For smoke from an outlet, a flooded room or an electrical fire, this kills power everywhere in one move.',
            tip: 'To shut down gently, turn off the large appliance breakers first, then the main.',
            v: { cam: [2.5, 1.65, -0.95], at: [2.45, 1.55, -2.05], hi: ['mainBreaker'], rt: { panelDoor: [0, -110, 0] } },
          },
          {
            t: 'Find the fixture stops',
            d: 'Under sinks and behind toilets are small hot and cold stop valves. Turn each clockwise until snug and back open to make sure they work.',
            why: 'A leaking faucet or toilet only needs its own stop, not the whole house off.',
            v: { cam: [-1.4, 1.1, 0.2], at: [-2.0, 0.4, -1.8], hi: ['sinkStops'], rt: { sinkDoorL: [0, -100, 0], sinkDoorR: [0, 100, 0], panelDoor: [0, 0, 0] } },
          },
          {
            t: 'Tag them and make a map',
            d: 'Hang bright tags on each shutoff: WATER MAIN, GAS METER, MAIN BREAKER. Sketch a simple floor plan with all of them marked and tape it inside the panel door. Walk everyone in the house through it.',
            why: 'The person home during an emergency might be a sitter, a guest or a teenager. A map and tags let anyone act fast.',
            v: { cam: [6.5, 7, 9], at: [0.4, 0.5, 0.3], hi: ['tags', 'map'], show: ['tags', 'map'], rt: { sinkDoorL: [0, 0, 0], sinkDoorR: [0, 0, 0], panelDoor: [0, -110, 0] } },
          },
        ],
        learn: {
          how: 'Water, gas and power each enter the house at one point and branch out from there. A shutoff at the entry point stops everything downstream. Quarter-turn valves are open when the handle is in line with the pipe and closed when it’s across. Breakers trip themselves on a fault, but the main breaker is also a manual switch for the whole panel.',
          specs: [['Ball valve', '¼ turn, handle across the pipe = closed'], ['Gate valve (wheel)', 'Clockwise to close, several turns'], ['Gas meter valve', '¼ turn with a 12″ wrench'], ['Main breaker', '100–200 A typical, at the top of the panel']],
          terms: [['Curb stop', 'The utility’s valve between the street main and your house.'], ['Tang', 'The flat tab on a gas plug valve that shows its position.'], ['Fixture stop', 'Small valve that shuts water to one faucet or toilet.'], ['Main breaker', 'Breaker that disconnects every circuit in the panel.']],
          mistakes: ['Shutting the gas off to test it.', 'Forcing a seized water valve until it breaks.', 'Keeping the only knowledge of the shutoffs in one person’s head.'],
          tips: ['Exercise the water main and fixture stops once or twice a year.', 'Take a photo of each shutoff and store it in a shared note on everyone’s phone.', 'Keep a flashlight in the same spot as the panel map.'],
        },
        pro: 'A water main or gate valve is seized or leaks at the stem, you can’t find the main at all, or anything about the gas service looks damaged. Gas meter problems always go to the utility.',
      },
      {
        id: 'fire-extinguisher',
        title: 'Mount and check a fire extinguisher',
        model: 'extinguisherKitchen',
        level: 1,
        time: '20–30 min',
        cost: '$30–70',
        summary: 'A 5 lb ABC extinguisher on a bracket by the kitchen exit handles the small fires that start most house fires. Mount it where you can grab it on the way out, check the gauge monthly, and know PASS.',
        intro: { hi: ['ext'], show: ['bracket'], preview: true },
        safety: [
          'Only fight a fire that’s small, contained (a pan, a wastebasket) and not spreading, with a clear exit behind you. Otherwise get out and call 911.',
          'Never put water on a grease fire. Slide a lid over the pan and turn off the burner first if you can.',
          'Discharge creates a cloud of powder; open windows and ventilate after use.',
        ],
        causes: [
          ['Class A', 'Ordinary combustibles: paper, wood, cloth.'],
          ['Class B', 'Flammable liquids: grease, oil, gasoline.'],
          ['Class C', 'Energized electrical equipment.'],
          ['Class K', 'Commercial deep-fryer oils. Homes use ABC plus a pan lid.'],
        ],
        tools: ['5 lb ABC extinguisher (UL rated 2-A:10-B:C or higher) with wall bracket', 'Stud finder', 'Drill/driver + #2 bit', '2 × #10 2½″ wood screws', 'Pencil', 'Tape measure'],
        steps: [
          {
            t: 'Pick the right extinguisher',
            d: 'Buy a multipurpose ABC dry-chemical extinguisher, 5 lb or larger, rated at least 2-A:10-B:C, with a metal valve and a pressure gauge.',
            why: 'ABC covers wood and paper, grease and oil, and electrical fires. Smaller 1–2 lb units empty in about 8 seconds.',
            v: { cam: [0.9, 1.25, 1.1], at: [-0.1, 1.1, 0.35], hi: ['label', 'ext'], mv: { ext: [-0.51, 0.2, 0.265] }, hide: ['bracket'] },
          },
          {
            t: 'Choose the spot',
            d: 'Mount it near the kitchen exit, in plain sight, 30″ or more from the stove. You should be able to grab it while moving away from a fire, not reach across it.',
            why: 'If the stove is burning, an extinguisher next to it is unreachable. By the doorway, your escape route stays behind you.',
            v: { cam: [1.9, 1.4, 2.6], at: [0.2, 1.0, 0], hi: ['doorway', 'range'] },
          },
          {
            t: 'Find a stud and mark the height',
            d: 'Find a stud with the stud finder and mark it so the top of the extinguisher will hang no higher than 5 ft and the bottom at least 4″ off the floor. About 3½–4 ft to the handle is easy for most adults.',
            why: 'A loaded extinguisher weighs 9–10 lb. Screws into a stud won’t tear out when someone yanks it off the bracket.',
            v: { cam: [0.9, 1.15, 1.0], at: [0.41, 0.98, 0], hi: ['finder', 'marks'], show: ['finder', 'marks'] },
          },
          {
            t: 'Screw the bracket to the stud',
            d: 'Hold the bracket on the marks and drive two #10 × 2½″ screws through it into the stud.',
            why: 'Drywall anchors loosen as the bracket gets bumped. Two screws into wood keep it solid for years.',
            v: { cam: [0.9, 1.15, 1.0], at: [0.41, 0.98, 0], hi: ['bracket'], show: ['bracket'], hide: ['finder'], tool: { id: 'drill', at: [0.41, 1.064, 0.006], rot: [90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Hang it, label facing out',
            d: 'Seat the neck in the hook, close the strap around the body and turn it so the instructions and gauge face the room.',
            why: 'Under stress people read the label. The gauge facing out also makes the monthly check a two-second glance.',
            v: { cam: [1.0, 1.2, 1.3], at: [0.41, 0.98, 0.05], hi: ['ext', 'bracket'], hide: ['marks'], mv: { ext: [0, 0, 0] } },
          },
          {
            t: 'Monthly: check the gauge',
            d: 'The needle must be in the green. Left of green is undercharged, right is overcharged; either way replace or have it serviced.',
            why: 'Extinguishers slowly lose pressure. A low one may only puff a few seconds of powder.',
            v: { cam: [0.48, 1.19, 0.3], at: [0.405, 1.18, 0.1], hi: ['gauge'] },
          },
          {
            t: 'Monthly: pin, seal, hose, body',
            d: 'Pin in place with its tamper seal unbroken, hose not cracked, nozzle clear, no dents or rust. Check the date: replace disposable units at 10–12 years or after any use.',
            why: 'A broken seal means it may have been partly used. Corrosion or a cracked hose can fail when it’s squeezed.',
            tip: 'For dry chemical, turn it upside down and tap the bottom every few months so the powder doesn’t pack.',
            v: { cam: [0.65, 1.2, 0.45], at: [0.4, 1.05, 0.08], hi: ['pin', 'seal', 'hose'] },
          },
          {
            t: 'If a fire starts: Pull the pin',
            d: 'Call out and send someone to call 911. With your back to the exit, about 8 ft from the fire, twist and pull the pin, breaking the seal.',
            why: 'The pin keeps the lever from being squeezed by accident. Nothing comes out until it’s out.',
            v: { cam: [0.9, 1.6, 2.6], at: [-0.7, 1.0, 0.8], hi: ['pin', 'pan'], fx: 'fire', mv: { ext: [-1.16, 0.1, 1.415], pin: [0, 0, 0.08] }, rt: { ext: [0, 180, 0] } },
          },
          {
            t: 'Aim at the base',
            d: 'Pull the hose free and aim the nozzle low, at the base of the flames, not at the smoke or flame tips.',
            why: 'The powder works by smothering the fuel. Aimed at the flames it blows past without touching what’s burning.',
            v: { cam: [0.9, 1.6, 2.6], at: [-0.7, 1.0, 0.8], hi: ['hoseAim'], show: ['hoseAim'], hide: ['hose'], fx: 'aim' },
          },
          {
            t: 'Squeeze and sweep',
            d: 'Squeeze the lever and sweep side to side across the base until the fire is out. Back away, watch for flare-ups and repeat if needed.',
            why: 'Sweeping covers the whole fuel surface. A 5 lb unit gives you about 10–15 seconds of discharge.',
            v: { cam: [0.9, 1.6, 2.6], at: [-0.7, 1.0, 0.8], hi: ['lever', 'hoseAim'], fx: 'spray', rt: { lever: [0, 0, -10] } },
          },
          {
            t: 'After any use: replace or recharge',
            d: 'Even a short squeeze means it must be recharged by a service company or replaced. Let the fire department check the area if the fire got into anything.',
            why: 'Partly used extinguishers lose pressure quickly once the valve seal has been opened.',
            v: { cam: [1.2, 1.3, 2.2], at: [-0.5, 1.0, 0.8], hi: ['ext'], rt: { lever: [0, 0, 0] } },
          },
        ],
        learn: {
          how: 'A stored-pressure extinguisher is a steel cylinder filled with dry chemical powder (monoammonium phosphate) pressurized with nitrogen. Squeezing the lever opens a valve and the gas pushes powder out the hose. The powder coats burning material and interrupts the chemical reaction of the fire.',
          specs: [['Home rating', '2-A:10-B:C minimum (5 lb)'], ['Mounting height', 'Top ≤ 5 ft, bottom ≥ 4″ off the floor'], ['Discharge time (5 lb)', '≈ 10–15 s'], ['Range', '≈ 10–20 ft'], ['Life (disposable)', '10–12 years']],
          terms: [['PASS', 'Pull, Aim, Squeeze, Sweep.'], ['Tamper seal', 'Plastic tie on the pin that shows if it’s been pulled.'], ['Rating numbers', 'The A number = water-gallon equivalent; the B number = square feet of liquid fire.']],
          mistakes: ['Mounting it beside or above the stove.', 'Aiming at the flames instead of the base.', 'Putting a used extinguisher back on the bracket.'],
          tips: ['Put one on every level, plus the garage and near the bedrooms.', 'Smaller people can handle a 5 lb unit easily; 10 lb gives more time but is heavier.', 'Many fire departments run free hands-on training.'],
        },
        pro: 'A rechargeable (metal valve) unit needs recharging or a 6-year/12-year maintenance, or you want extinguishers for a workshop, boat or rental property with inspection tags.',
      },
      {
        id: 'grab-bars',
        kind: 'build',
        title: 'Install grab bars at the tub',
        model: 'grabBarTub',
        level: 2,
        time: '1–2 hrs',
        cost: '$40–120',
        summary: 'A horizontal bar on the back wall and a vertical bar at the entry, screwed through the tile into studs or blocking, make getting in and out of the tub safe. Done right, each bar holds 250 lb or more.',
        intro: { show: ['bar', 'screws', 'covers', 'bar2'], preview: true },
        safety: [
          'Never use suction-cup bars or towel bars as grab bars. They aren’t made to hold a falling person.',
          'Wear safety glasses when drilling tile; it chips and the bit can skate.',
          'Check for pipes before drilling the control wall: stay well away from the valve and the line straight up to the shower head.',
        ],
        causes: [
          ['Back wall', 'Horizontal bar 33–36″ above the floor, 24″ or longer.'],
          ['Entry/control end', '18–24″ vertical bar near the tub edge for stepping in and out.'],
          ['Find the backing', 'Studs are 16″ apart; a 32″ bar lands on two. Otherwise use blocking or a rated hollow-wall anchor.'],
          ['Bar spec', '1¼–1½″ diameter, textured or knurled grip, 1½″ off the wall.'],
        ],
        tools: ['Stainless grab bars (32″ + 18″) with screws', 'Stud finder', '4 ft level', 'Painter’s tape + pencil', 'Drill + diamond or carbide tile bit', '100% silicone sealant', 'Safety glasses'],
        steps: [
          {
            t: 'Plan the bar locations',
            d: 'Mark a horizontal bar on the back wall with its top 33–36″ above the bathroom floor, and a vertical bar on the control end near the front edge of the tub, its bottom about 9″ above the rim.',
            why: 'These heights match where a hand naturally goes when you sit, stand or step over the tub edge.',
            v: { cam: [1.7, 1.45, 2.3], at: [0, 0.95, 0.25], hi: ['wall', 'tub'] },
          },
          {
            t: 'Find the studs',
            d: 'Scan the wall with a stud finder and mark both edges of each stud with tape. Confirm by drilling a tiny test hole in a grout joint where a flange will cover it.',
            why: 'Each flange needs at least two of its three screws in solid wood to hold a fall.',
            v: { cam: [1.1, 1.2, 1.5], at: [0, 0.9, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true },
          },
          {
            t: 'Check for blocking',
            d: 'If the wall was open during a remodel, 2×8 blocking between studs gives you wood anywhere. If not, choose a bar length that lands on studs, or use anchors rated for grab bars.',
            why: 'Tile and cement board alone crumble under load. The screws must bite wood or a listed anchor behind the wall.',
            tip: 'Remodeling? Add blocking around the whole tub at 30–40″ now, even if you don’t need bars yet.',
            v: { cam: [1.2, 1.0, 1.3], at: [0, 0.86, 0], hi: ['blocking', 'studs'], xray: true },
          },
          {
            t: 'Mark the holes',
            d: 'Tape the area, hold the bar up and level it, then mark the three screw holes in each flange.',
            why: 'Tape stops the bit from skating on glazed tile and makes your marks easy to see.',
            v: { cam: [1.0, 1.1, 1.4], at: [0, 0.86, 0], hi: ['marks'], show: ['marks'], hide: ['finder'], tool: { id: 'level', at: [0, 0.88, 0.02], rot: [0, 0, 90], scale: 1 } },
          },
          {
            t: 'Drill through the tile',
            d: 'Drill each hole with a diamond or carbide tile bit at slow speed, without hammer mode, then switch to a wood bit for the pilot into the stud.',
            why: 'Hammer mode and high speed crack tile. A pilot hole keeps the screw from splitting the stud.',
            v: { cam: [0.8, 1.05, 0.9], at: [0.406, 0.86, 0], hi: ['holes'], show: ['holes'], tool: { id: 'drill', at: [0.406, 0.884, 0.004], rot: [90, 0, 0], anim: 'spin', bit: 'drill' } },
          },
          {
            t: 'Seal and screw on the bar',
            d: 'Squirt silicone into each hole, hold the bar in place and drive the stainless screws snug. Don’t overtighten against the tile.',
            why: 'Silicone keeps water out of the wall cavity. Stainless screws won’t rust and stain the tile.',
            v: { cam: [1.0, 1.1, 1.4], at: [0, 0.86, 0.03], hi: ['bar', 'screws'], show: ['bar', 'screws'], hide: ['marks', 'holes'], tool: { id: 'drill', at: [0.406, 0.884, 0.012], rot: [90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Snap on the covers',
            d: 'Slide the flange covers over the screws and snap or twist them on. Run a thin bead of silicone around the top of each flange.',
            why: 'Covers hide the screws; the top bead sheds water instead of letting it run behind the flange.',
            v: { cam: [0.9, 1.05, 1.0], at: [0, 0.86, 0.03], hi: ['covers'], show: ['covers'] },
          },
          {
            t: 'Add the vertical entry bar',
            d: 'Repeat on the control-end wall near the tub edge: find a stud, mark, drill through tile, seal and screw the 18″ bar on vertically.',
            why: 'A vertical bar is what you grab when you step over the tub wall, the riskiest moment in the bathroom.',
            v: { cam: [0.4, 1.4, 1.6], at: [-0.7, 1.18, 0.62], hi: ['bar2'], show: ['marks2', 'bar2'], tool: { id: 'drill', at: [-0.754, 1.43, 0.62], rot: [0, 0, -90], anim: 'spin' } },
          },
          {
            t: 'Pull test',
            d: 'Pull down and out on each bar with your full weight. There should be no movement, creak or tile cracking.',
            why: 'Better to find a loose screw now than when someone slips.',
            v: { cam: [1.7, 1.45, 2.3], at: [0, 0.95, 0.25], hi: ['bar', 'bar2'], hide: ['marks2'], fx: 'pull' },
          },
        ],
        learn: {
          how: 'A grab bar turns a fall into a pull on six screws. The load is mostly shear (down along the wall) plus pull-out at the top screws, so they need at least 1–1½″ of thread in solid wood. The 1½″ wall gap is set so a hand fits around the bar but an arm can’t slip through and get trapped.',
          specs: [['Height', '33–36″ to the top of the bar'], ['Diameter', '1¼–1½″'], ['Wall clearance', '1½″'], ['Load', '250 lb minimum'], ['Screws', '#12 × 2½″ stainless, 3 per flange']],
          terms: [['Blocking', 'Lumber between studs that gives screws something to bite.'], ['Flange', 'The round plate at each end that screws to the wall.'], ['Diamond bit', 'Bit coated with diamond grit that grinds through porcelain.']],
          mistakes: ['Plastic anchors in drywall or tile.', 'Hammer-drilling tile.', 'Mounting the bar where only one end hits a stud.'],
          tips: ['Angled bars on the back wall work well for people who pull up from sitting.', 'Pick a bar with a textured grip; polished chrome is slippery when wet.', 'A 32″ bar spans exactly two studs at 16″ on center.'],
        },
        pro: 'The wall is fiberglass, a one-piece tub surround or plaster over lath, there’s no stud where the bar must go, or you need ADA-compliant layouts for a rental.',
      },
      {
        id: 'water-heater-straps',
        title: 'Strap a water heater for earthquakes',
        model: 'waterHeaterStrap',
        level: 2,
        time: '1–2 hrs',
        cost: '$30–60',
        summary: 'Two steel straps, one in the upper third and one in the lower third, lagged into studs keep a 500 lb tank of hot water from tipping, tearing its gas line and starting a fire after a quake.',
        intro: { hi: ['tank'] },
        safety: [
          'Keep straps at least 4″ above the gas control and burner door so they don’t block access or trap heat.',
          'Smell gas at any point? Stop, leave and call the gas company.',
          'Never strap over the T&P relief valve or its discharge pipe.',
        ],
        causes: [
          ['Required in quake zones', 'California and many western codes require two straps on every water heater.'],
          ['Tank tips', 'A full 50-gal tank weighs about 500 lb and walks or falls in shaking.'],
          ['Rigid connections snap', 'Copper and gas pipe break when the tank moves; flexible connectors bend.'],
        ],
        tools: ['Double-strap earthquake kit (22-ga, 1¼″ steel)', '4 × ¼″ × 3″ lag screws + washers', 'Stud finder', 'Drill + ⅛″ bit + ⅜″ socket', 'Tape measure + pencil', '2×4 blocking (if the gap is over 1″)', 'Adjustable wrench'],
        steps: [
          {
            t: 'Check the setup',
            d: 'Note the tank height and how far it sits from the wall. Look for flexible water and gas connectors on top and at the gas control.',
            why: 'Straps hold the tank; flexible connectors let what little movement remains happen without breaking a line.',
            v: { cam: [1.5, 1.4, 2.2], at: [0, 0.85, 0.2], hi: ['tank', 'connectors', 'gasLine'] },
          },
          {
            t: 'Find the studs',
            d: 'Find the studs on each side of the tank, typically 16″ on center, and mark their centers.',
            why: 'Lag screws into studs hold thousands of pounds. Drywall alone holds almost nothing.',
            v: { cam: [1.2, 1.4, 1.5], at: [0.2, 1.1, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true },
          },
          {
            t: 'Mark the strap heights',
            d: 'Mark one strap in the upper third of the tank and one in the lower third, keeping the lower strap at least 4″ above the gas control.',
            why: 'Two straps spread the load and stop the tank both tipping and twisting.',
            tip: 'On a 60″ tank: upper strap 40–60″ up, lower strap 4″ above the controls but under 20″.',
            v: { cam: [1.3, 0.95, 1.6], at: [0, 0.8, 0.1], hi: ['marks', 'gasControl'], show: ['marks'], hide: ['finder'], tool: { id: 'tape', at: [0.5, 0.0, 0.06], rot: [0, -90, 0] } },
          },
          {
            t: 'Fill the gap behind the tank',
            d: 'If the tank sits more than about 1″ from the wall, screw 2×4 blocks to the studs at each strap height so the tank rests against wood.',
            why: 'A gap lets the tank build up speed before the straps catch it, which can tear the lags out.',
            v: { cam: [0.9, 1.6, 1.2], at: [0, 0.9, 0.05], hi: ['spacers'], show: ['spacers'], xray: true },
          },
          {
            t: 'Wrap the upper strap',
            d: 'Wrap the upper strap around the front of the tank and bring both ends back to the studs.',
            why: 'Wrapping the front pulls the tank back against the wall instead of just holding one side.',
            v: { cam: [1.3, 1.6, 1.8], at: [0, 1.2, 0.2], hi: ['strapTop'], show: ['strapTop'] },
          },
          {
            t: 'Lag the ends into studs',
            d: 'Drill ⅛″ pilot holes and drive ¼″ × 3″ lag screws with washers through each strap end into the stud.',
            why: 'Three inches of lag gives over 1½″ of thread in the stud after drywall, which is what the strap kits are tested with.',
            v: { cam: [1.0, 1.4, 1.1], at: [0.406, 1.2, 0], hi: ['lagsTop'], show: ['lagsTop'], tool: { id: 'drill', at: [0.406, 1.2, 0.01], rot: [90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Add the lower strap',
            d: 'Repeat for the lower strap, at least 4″ above the gas control. Lag both ends into the studs.',
            why: 'The lower strap stops the base from kicking out when the top is held.',
            v: { cam: [1.3, 0.8, 1.7], at: [0, 0.45, 0.2], hi: ['strapLow', 'lagsLow', 'gasControl'], show: ['strapLow', 'lagsLow'] },
          },
          {
            t: 'Tighten the straps',
            d: 'Snug each strap with its tensioning bolt until it’s tight against the tank, with no slack, but without denting the jacket.',
            why: 'Slack lets the tank rock and shock-load the lags. Too tight can crush the insulation.',
            v: { cam: [0.8, 1.3, 1.6], at: [0, 1.0, 0.55], hi: ['strapTop', 'strapLow'], tool: { id: 'ratchet', at: [0.03, 1.2, 0.57], rot: [0, 0, 90] } },
          },
          {
            t: 'Check the connectors',
            d: 'Make sure the water lines are flexible connectors and the gas line uses a listed flexible connector. Replace rigid hookups.',
            why: 'Even a strapped tank moves an inch or so. Rigid pipe can crack, and a cracked gas line is the real fire risk after a quake.',
            v: { cam: [1.3, 1.9, 1.4], at: [0.1, 1.2, 0.2], hi: ['connectors', 'gasLine'] },
          },
        ],
        learn: {
          how: 'In shaking, a tall tank acts like an inverted pendulum. Its weight wants to rock it over its base. Two straps tied to the building frame make the tank move with the wall instead of against it, and the lower strap stops the base from sliding out.',
          specs: [['Strap material', '22-ga steel, ≥ ¾″ wide'], ['Upper strap', 'Upper ⅓ of the tank'], ['Lower strap', 'Lower ⅓, ≥ 4″ above controls'], ['Lags', '¼″ × 3″ into studs'], ['Straps by size', '≤ 52 gal: 2 · 75 gal: 3 · 100 gal: 4']],
          terms: [['Lag screw', 'Heavy hex-head wood screw driven with a socket.'], ['Flexible connector', 'Corrugated stainless supply line that bends without cracking.'], ['Seismic strap', 'Steel band rated for earthquake restraint.']],
          mistakes: ['Plumber’s tape alone around half the tank.', 'Lagging into drywall or between studs.', 'A lower strap over the gas control.'],
          tips: ['If the tank stands on a platform, anchor the platform too.', 'Some kits come with metal conduit sleeves that add stiffness to the strap runs. Use them if included.'],
        },
        pro: 'The heater is in a corner with no studs in reach, sits on an unanchored platform, or has rigid gas or water lines that need replacing.',
      },
      {
        id: 'anchor-furniture',
        title: 'Anchor furniture and TVs against tip-over',
        model: 'tipOverRoom',
        level: 1,
        time: '30–60 min',
        cost: '$10–30',
        summary: 'Dressers, bookcases and TVs tip onto children when drawers are climbed or pulled. A $10 strap kit into a stud stops it. Do every tall piece in the house.',
        intro: { hi: ['dresser', 'tv'] },
        safety: ['Empty the top drawers before moving a dresser.', 'Screws go into studs, not drywall anchors.', 'Never put a TV on a dresser or bookcase that isn’t designed for it.'],
        causes: [['Climbing', 'Open drawers turn a dresser into a ladder that tips forward.'], ['Heavy top, light base', 'TVs and full top drawers raise the center of gravity.'], ['Uneven floor or carpet', 'A forward lean makes tipping much easier.']],
        tools: ['Anti-tip strap kit (one per piece)', 'Stud finder', 'Drill/driver + bits', 'Phillips screwdriver', 'Pencil + tape measure', 'TV anti-tip strap kit'],
        steps: [
          {
            t: 'Spot the risks',
            d: 'Anything over about 30″ tall, plus every TV not on a wall mount: dressers, bookcases, wardrobes and media stands.',
            why: 'Most tip-over injuries involve children under 6 and furniture or TVs that weren’t anchored.',
            v: { cam: [1.4, 1.5, 2.8], at: [0, 0.8, 0.2], hi: ['dresser', 'tv'] },
          },
          {
            t: 'Pull it out and find a stud',
            d: 'Slide the dresser away from the wall. Find a stud behind where its top will sit and mark the center.',
            why: 'The strap needs to land in wood. Furniture rarely lines up with studs, so find one first and place the bracket to match.',
            v: { cam: [0.4, 1.6, 2.1], at: [-0.5, 1.1, 0.2], hi: ['finder', 'studs'], show: ['finder'], mv: { dresser: [0, 0, 0.5] }, xray: true },
          },
          {
            t: 'Mark the bracket height',
            d: 'Mark the stud about 2″ below where the top back rail of the dresser will be.',
            why: 'Mounting slightly lower means the strap pulls back and down, the strongest direction.',
            v: { cam: [0.3, 1.5, 1.8], at: [-0.4, 1.1, 0], hi: ['marks'], show: ['marks'], hide: ['finder'] },
          },
          {
            t: 'Bracket on the furniture',
            d: 'Screw one bracket into the solid top rail on the back of the dresser with the short screw, not into the thin back panel.',
            why: 'Back panels are often ⅛″ hardboard that tears out. The top rail is solid wood.',
            v: { cam: [0.3, 1.6, -0.35], at: [-0.4, 1.15, 0.5], hi: ['furnBracket'], show: ['furnBracket'], tool: { id: 'screwdriver', at: [-0.406, 1.172, 0.548], rot: [-90, 0, 0], anim: 'turn' } },
          },
          {
            t: 'Bracket on the wall',
            d: 'Drive the long screw through the wall bracket into the stud at your mark.',
            why: 'At least 1½″ of thread in the stud holds far more than a child can pull.',
            v: { cam: [0.3, 1.5, 1.6], at: [-0.4, 1.13, 0], hi: ['wallBracket'], show: ['wallBracket'], tool: { id: 'drill', at: [-0.406, 1.122, 0.006], rot: [90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Connect and take up slack',
            d: 'Push the dresser back, thread the strap through both brackets and pull it tight until there’s no slack.',
            why: 'Slack lets the dresser start tipping and gain speed before the strap catches it.',
            v: { cam: [0.0, 1.7, 0.7], at: [-0.406, 1.17, 0.03], hi: ['strap'], show: ['strap'], hide: ['marks'], mv: { dresser: [0, 0, 0] }, xray: true },
          },
          {
            t: 'Strap the TV',
            d: 'Bolt the TV strap brackets into the TV’s VESA holes and the other ends into studs (or the back of a heavy console), then pull the straps snug.',
            why: 'A flat-screen on its narrow feet tips with a small tug on the edge.',
            v: { cam: [1.6, 1.5, 1.5], at: [0.7, 1.05, 0.1], hi: ['tvStraps'], show: ['tvStraps'], xray: true },
          },
          {
            t: 'Test and load smart',
            d: 'Pull the top edge of each piece toward you. Keep heavy things in the bottom drawers and use drawer stops if kids can reach.',
            why: 'Testing proves the screws are in wood; low weight keeps the center of gravity down.',
            v: { cam: [1.4, 1.5, 2.8], at: [0, 0.8, 0.2], hi: ['dresser', 'tv'], fx: 'tug' },
          },
        ],
        learn: {
          how: 'A dresser tips when the weight in front of its front feet is greater than the weight behind them. An open drawer with a child on it moves a lot of weight forward. A strap anchored to the wall makes the top of the piece part of the house, so it can’t rotate forward.',
          specs: [['Wall screw', '2″+ into a stud'], ['Furniture screw', '⅝″ into the top rail'], ['Bracket offset', '≈ 2″ below the furniture bracket'], ['Furniture to anchor', 'Over 27–30″ tall, and all TVs']],
          terms: [['Anti-tip kit', 'Two brackets and a strap or cable that tie furniture to the wall.'], ['VESA holes', 'Threaded holes on the back of a TV used by mounts and straps.'], ['Interlock', 'Dresser feature that lets only one drawer open at a time.']],
          mistakes: ['Screwing into the thin back panel.', 'Using drywall anchors.', 'Leaving slack in the strap.'],
          tips: ['Use a strap kit on every tall piece, even if you don’t have kids. Earthquakes and pets tip things too.', 'Felt pads under the front feet on carpet keep a dresser from leaning forward.'],
        },
        pro: 'The wall is brick, concrete or plaster with no wood behind it, or you need large built-ins secured.',
      },
      {
        id: 'stair-handrail',
        kind: 'build',
        title: 'Install a stair handrail to code',
        model: 'handrailStair',
        level: 2,
        time: '2–4 hrs',
        cost: '$80–200',
        summary: 'A continuous round rail 34–38″ above the stair nosings, on brackets screwed into studs no more than 4 ft apart, with returns into the wall at both ends. It’s what keeps a missed step from becoming a fall.',
        intro: { show: ['brackets', 'rail', 'returns'], preview: true, spin: false },
        safety: ['Work from the stairs facing the wall; don’t lean out over an open side.', 'Use studs or solid blocking only, never drywall anchors.', 'Keep the stairs clear of tools and cords while you work.'],
        causes: [
          ['When it’s required', 'Code calls for a handrail on any stair with four or more risers.'],
          ['Height', '34–38″ measured straight up from the nosing line.'],
          ['Grip', 'Round rail 1¼–2″ diameter, or a profiled rail with the right finger recess.'],
          ['Clearance', 'At least 1½″ between the rail and the wall.'],
        ],
        tools: ['Handrail (length of run + 1 ft)', '3–4 handrail brackets + 2½″ screws', 'Return fittings or blocks', 'Stud finder', '4 ft level + chalk line', 'Miter saw or handsaw', 'Drill/driver', 'Tape measure + pencil', 'Wood glue'],
        steps: [
          {
            t: 'Measure the run',
            d: 'Measure from the top riser nosing to the bottom riser nosing along the slope. The rail must run that full length without breaks.',
            why: 'People reach for the rail on the first and last step. Gaps there are where falls happen.',
            v: { cam: [3.8, 2.3, 3.6], at: [1.3, 1.3, 0.3], hi: ['stairs'], tool: { id: 'tape', at: [0.735, 0.95, 0.4], rot: [0, 0, 0] } },
          },
          {
            t: 'Find the studs',
            d: 'Scan along the wall above the stairs and mark every stud center you could use.',
            why: 'Brackets must land on studs (or blocking). Studs decide where brackets can go.',
            v: { cam: [2.6, 2.2, 2.4], at: [1.4, 1.6, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true },
          },
          {
            t: 'Snap the rail line',
            d: 'At the top and bottom nosings, measure 36″ straight up and mark. Snap a chalk line between the marks; the top of the rail will follow it.',
            why: 'Measuring from the nosings keeps the rail at the same height on every step, within the 34–38″ the code allows.',
            v: { cam: [3.2, 2.2, 2.8], at: [1.3, 1.6, 0], hi: ['layout'], show: ['layout'], hide: ['finder'], tool: { id: 'tape', at: [1.245, 1.33, 0.04], rot: [0, 0, 0] } },
          },
          {
            t: 'Mount the brackets',
            d: 'Place a bracket within 12″ of each end and the rest no more than 48″ apart, all on studs. Set each so the rail top meets the line, then drive the screws.',
            why: 'Close spacing stops the rail flexing; end brackets keep the ends from bouncing.',
            v: { cam: [2.4, 2.0, 1.4], at: [1.418, 1.9, 0], hi: ['brackets'], show: ['brackets'], tool: { id: 'drill', at: [1.418, railY(1.418) - 0.057, 0.01], rot: [90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Cut and dry-fit the rail',
            d: 'Cut the rail to length with the end angles matching the stair slope. Hold it on the brackets to check fit.',
            why: 'Check before fastening; recutting a mounted rail is awkward.',
            v: { cam: [3.8, 2.4, 3.4], at: [1.3, 1.5, 0.3], hi: ['rail'], show: ['rail'], mv: { rail: [0, 0, 0.35] } },
          },
          {
            t: 'Screw the rail to the brackets',
            d: 'Set the rail in the saddles and drive the short screws up through each saddle into the rail.',
            why: 'Screwing from underneath keeps the top of the rail smooth for your hand.',
            v: { cam: [2.2, 1.4, 1.6], at: [1.418, 1.9, 0.05], hi: ['rail', 'brackets'], mv: { rail: [0, 0, 0] }, tool: { id: 'screwdriver', at: [1.418, railY(1.418) - 0.03, ST.zc], rot: [180, 0, 0], anim: 'turn' } },
          },
          {
            t: 'Add returns at both ends',
            d: 'Glue and screw a return fitting at each end so the rail curves back into the wall.',
            why: 'Returns keep sleeves, bag straps and dog leashes from catching on an open rail end.',
            v: { cam: [0.9, 1.6, 1.4], at: [0, 1.15, 0.05], hi: ['returns'], show: ['returns'] },
          },
          {
            t: 'Test it',
            d: 'Lean your weight out and down on the rail along its length. It shouldn’t creak, flex or move.',
            why: 'A handrail has to hold a 200 lb load from any direction.',
            v: { cam: [3.8, 2.3, 3.6], at: [1.3, 1.3, 0.3], hi: ['rail'], hide: ['layout'], fx: 'pull' },
          },
        ],
        learn: {
          how: 'A handrail is something to grab, not just a guard. Code limits its shape so a hand can wrap around it and get a power grip during a fall, and sets the height so it stays at the same place relative to your feet on every step. Brackets carry the load to the studs. Returns prevent snagging.',
          specs: [['Height', '34–38″ above the nosings'], ['Round diameter', '1¼–2″'], ['Wall clearance', '≥ 1½″'], ['Bracket spacing', '≤ 48″; within 12″ of ends'], ['Load', '200 lb from any direction']],
          terms: [['Nosing', 'The front edge of each tread.'], ['Return', 'Rail end that turns back into the wall.'], ['Saddle', 'The curved top of a bracket the rail sits in.']],
          mistakes: ['Measuring height from the floor at the bottom only.', 'Brackets screwed into drywall.', 'Stopping the rail a step short.'],
          tips: ['A laser level along the nosings makes the layout quick.', 'Stain or finish the rail before mounting.'],
        },
        pro: 'The stair needs a guard on an open side, the wall is plaster or masonry, or the stairs themselves are out of code.',
      },
      {
        id: 'baby-gate',
        kind: 'build',
        title: 'Install a baby gate at the top of the stairs',
        model: 'babyGateStairs',
        level: 2,
        time: '1–2 hrs',
        cost: '$60–150',
        summary: 'At the top of stairs only a hardware-mounted gate is safe. Screw the hinges into a stud, strap a banister kit to the newel post so you don’t drill it, and set the gate to swing toward the landing only.',
        intro: { show: ['postKit', 'wallHinges', 'gate', 'latch'], preview: true },
        safety: ['Never use a pressure-mounted gate at the top of stairs. A child pushing on it can pop it out and fall with it.', 'The gate must not swing out over the stairs.', 'Avoid accordion gates with V-shaped openings that can trap a head.'],
        causes: [['Top of stairs', 'Hardware-mounted gate, screwed in, opening onto the landing.'], ['Bottom of stairs', 'A pressure gate is acceptable there.'], ['Newel or banister on one side', 'Use a banister kit so you don’t drill the post.'], ['Gate standard', 'Look for JPMA certification to ASTM F1004.']],
        tools: ['Hardware-mounted stair gate', 'Banister mounting kit (if one side is a post)', 'Stud finder', 'Level', 'Drill/driver + bits', 'Phillips screwdriver', 'Tape measure + pencil'],
        steps: [
          {
            t: 'Measure and choose the gate',
            d: 'Measure the opening at the top of the stairs and buy a hardware-mounted gate rated for top-of-stairs use that fits that width.',
            why: 'Only a screwed-in gate resists a toddler pushing, pulling and climbing.',
            v: { cam: [2.2, BG.H + 1.25, -1.9], at: [0.45, BG.H + 0.35, 0.1], hi: ['newel', 'wall'] },
          },
          {
            t: 'Find a stud on the wall side',
            d: 'Scan the wall at the top step and mark the stud center. If none lines up, screw a 1×4 board across two studs and mount to that.',
            why: 'Hinge screws in drywall pull out under a determined child.',
            v: { cam: [1.6, BG.H + 0.9, -1.2], at: [0, BG.H + 0.4, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true },
          },
          {
            t: 'Strap on the banister kit',
            d: 'Wrap the kit’s straps around the newel post and tighten them so the mounting board sits plumb and doesn’t slide.',
            why: 'The kit gives the latch a solid place to screw into without damaging the post.',
            v: { cam: [1.6, BG.H + 0.9, -1.1], at: [0.92, BG.H + 0.45, BG.gz], hi: ['postKit', 'newel'], show: ['postKit'], hide: ['finder'], tool: { id: 'screwdriver', at: [0.913, BG.H + 0.65, BG.gz + 0.03], rot: [0, 0, 90], anim: 'turn' } },
          },
          {
            t: 'Mark matching heights',
            d: 'Mark the hinge heights on the stud and level across to mark the latch heights on the kit. The bottom bar should end up under 3″ off the floor.',
            why: 'Level hinges and latch let the gate swing freely and lock reliably.',
            v: { cam: [1.6, BG.H + 0.8, -1.3], at: [0.45, BG.H + 0.4, BG.gz], hi: ['marks'], show: ['marks'], tool: { id: 'level', at: [0.45, BG.H + 0.63, BG.gz], rot: [0, 0, 90], scale: 0.75 } },
          },
          {
            t: 'Screw the hinges to the stud',
            d: 'Drill pilot holes and drive the hinge screws into the stud.',
            why: 'Pilot holes keep the screws straight and the stud from splitting near its edge.',
            v: { cam: [1.0, BG.H + 0.7, -0.8], at: [0, BG.H + 0.4, BG.gz], hi: ['wallHinges'], show: ['wallHinges'], tool: { id: 'drill', at: [0.008, BG.H + 0.64, BG.gz], rot: [0, 0, -90], anim: 'spin' } },
          },
          {
            t: 'Hang the gate',
            d: 'Drop the gate onto its hinges and adjust the width so it reaches the latch side with an even small gap.',
            why: 'Gaps over the gate’s spec let the latch slip; too tight and it binds.',
            v: { cam: [2.0, BG.H + 1.0, -1.6], at: [0.45, BG.H + 0.4, BG.gz], hi: ['gate'], show: ['gate'], hide: ['marks'] },
          },
          {
            t: 'Mount the latch',
            d: 'Screw the latch receiver to the banister kit at the marks, with its stop on the stair side.',
            why: 'The stop is what keeps the gate from ever swinging out over the steps.',
            v: { cam: [1.5, BG.H + 1.0, -1.0], at: [0.9, BG.H + 0.7, BG.gz], hi: ['latch'], show: ['latch'], tool: { id: 'screwdriver', at: [0.905, BG.H + 0.74, BG.gz + 0.012], rot: [0, 0, 90], anim: 'turn' } },
          },
          {
            t: 'Set the one-way swing',
            d: 'Set the gate’s swing control so it opens only toward the landing, then open it fully to check.',
            why: 'Opening toward the landing means you never step backward onto the stairs while holding the gate or a child.',
            v: { cam: [2.0, BG.H + 1.2, -1.8], at: [0.4, BG.H + 0.4, -0.3], hi: ['gate'], rt: { gate: [0, 75, 0] } },
          },
          {
            t: 'Close and test',
            d: 'Close it and confirm it latches by itself, then push and pull hard on the top bar. Check the screws monthly.',
            why: 'A gate that doesn’t latch every time gets left open, and an open gate protects nothing.',
            v: { cam: [2.2, BG.H + 1.25, -1.9], at: [0.45, BG.H + 0.35, 0.1], hi: ['latch', 'gate'], rt: { gate: [0, 0, 0] } },
          },
        ],
        learn: {
          how: 'A pressure gate relies on friction against the walls, which works fine at floor level but can let go when a child leans on it. A hardware-mounted gate is bolted to the framing, so it holds against far more force. Swinging only toward the landing keeps the gate itself from becoming a trip hazard over the stairs.',
          specs: [['Gate height', '≥ 22″ (most are 29–32″)'], ['Bar spacing', '< 3″'], ['Bottom gap', '< 3″'], ['Standard', 'ASTM F1004 / JPMA certified']],
          terms: [['Hardware-mounted', 'Screwed into the wall or post.'], ['Pressure-mounted', 'Held by tension against the walls; bottom of stairs only.'], ['Banister kit', 'Strap-on adapter that gives a gate something to screw into on a round or square post.']],
          mistakes: ['A pressure gate at the top of stairs.', 'Gate swinging over the stairs.', 'Hinges screwed into drywall only.'],
          tips: ['Take the gate down once the child can climb it or turns 2, whichever comes first.', 'Use the same gate model at the bottom and top so the latch works the same way.'],
        },
        pro: 'The opening is wider than any gate kit, the wall is plaster or stone, or you want a custom gate built to match the stair.',
      },
    ],
  });
})();
