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
      const spray = K.cone(sg, [0.3, 1.15, 24, true], K.std(0xffffff, { transparent: true, opacity: 0.7, roughness: 1, emissive: 0x888888, emissiveIntensity: 0.4 }), [0, 0.575, 0], [180, 0, 0]);
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
        K.box(stairs, [1.03, y - 0.025, 0.254], white, [0.515, (y - 0.025) / 2, (i - 0.5) * 0.254], null, 0.002);
        K.box(stairs, [1.05, 0.025, 0.279], oak, [0.525, y - 0.0125, (i - 0.5) * 0.254 - 0.0125], null, 0.006);
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
        summary: 'When a pipe bursts or you smell gas, you have minutes, not hours. Find the main water valve, the gas meter valve and the main breaker today, test the ones that are safe to test, tag them, and make a map anyone in the house can follow.',
        intro: { hi: ['waterMain', 'gasValve', 'mainBreaker'] },
        safety: [
          'If you smell gas (a rotten-egg smell) or hear hissing, leave first and call the gas utility or 911 from outside. Don’t flip light switches, use a phone inside or start a car in the garage; a tiny spark can ignite gas.',
          'Never turn the gas meter valve off just to practice. Once it’s off, only the gas company should turn it back on and relight the pilot lights.',
          'Don’t touch the electrical panel with wet hands or while standing in water. If water is near the panel, stay out and call the power utility to cut power at the meter.',
          'Only shut gas off at the meter if you smell gas, hear it escaping or see a broken line, and only if you can do it safely on your way out.',
        ],
        causes: [
          ['Burst or leaking pipe', 'Close the main water valve, then open the lowest faucet in the house to drain the pressure and slow the leak.'],
          ['Gas smell or hissing', 'Get everyone out and call from outside. Turn it off at the meter only if it’s safe or the utility tells you to.'],
          ['Sparking, smoke from the panel, flooding near outlets', 'Main breaker off, but only if you can reach it while standing somewhere dry.'],
          ['Earthquake, wildfire evacuation', 'Follow your utility’s instructions; shutting gas off when it isn’t needed can mean days waiting for a relight.'],
          ['Water heater or washer hose burst', 'Use the valve closest to the leak first (the appliance’s own valve), then the main if that doesn’t stop it.'],
        ],
        tools: ['Flashlight or headlamp', '12–15″ adjustable wrench or a 4-in-1 gas shutoff tool', 'Curb key (only if your utility lets homeowners use the curb valve)', 'Waterproof tags + zip ties', 'Permanent marker', 'Phone camera', 'Rag or towel'],
        steps: [
          {
            t: 'Walk the house with a plan',
            d: 'Grab a flashlight and your phone. Walk the outside of the house first, then the inside, looking for three things: where the water pipe comes in, where the gas pipe comes in (at the gas meter), and the electrical panel (the gray metal box of breakers).',
            why: 'Water, gas and power each enter the house at one spot and branch out from there, so one valve or switch at the entry stops everything after it.',
            tip: 'Start at the water meter or the street side of the house: the main water line almost always enters on the side facing the street.',
            ok: 'You can point to all three entry points and have a photo of each on your phone.',
            v: { cam: [6.5, 7, 9], at: [0.4, 0.5, 0.3], hi: ['house'] },
          },
          {
            t: 'Find the main water valve',
            d: 'Look where the water pipe comes up through the floor or wall: in a basement, garage, utility closet or crawl space, usually within a few feet of the water meter. In warm climates it may be outside by the foundation or in a box near the street. It’s the first valve on the pipe after it enters.',
            why: 'This one valve stops water to every faucet, toilet and appliance. It’s the first move for any burst pipe or leaking water heater.',
            tip: 'Can’t find it? Look at the water heater’s cold pipe and trace it backward to where it comes into the house; the main is on that line.',
            ok: 'You’ve found a valve on the incoming pipe before any branches split off to the rest of the house.',
            v: { cam: [1.8, 1.25, -0.9], at: [1.0, 0.6, -2.0], hi: ['waterMain', 'waterMeter'] },
          },
          {
            t: 'Test it: close, check, reopen',
            d: 'A lever handle (ball valve) turns a quarter turn: lever in line with the pipe is open, across the pipe is closed. A round wheel (gate valve) turns clockwise to close, several turns until it stops. Close it, open a faucet to confirm the water stops, then reopen the main slowly and close the faucet.',
            why: 'A valve that never moves can rust or scale in place. Finding out today that it’s stuck is far better than finding out during a flood.',
            tip: 'If an old wheel valve won’t turn with firm hand pressure, or it starts dripping at the stem, stop. Don’t use a pipe wrench on it; have a plumber swap it for a full-port ball valve.',
            ok: 'With the valve closed, the faucet sputters and stops within a minute; after reopening, it runs at full pressure again.',
            v: { cam: [1.5, 0.85, -1.4], at: [1.0, 0.5, -2.0], hi: ['waterLever'], rt: { waterLever: [0, 0, 90] } },
          },
          {
            t: 'Know the city-side valve',
            d: 'Look for a round or rectangular lid in the yard or sidewalk marked WATER, often near the property line. Under it is the utility’s curb valve, turned with a long T-handle curb key. Note where it is as a backup, but don’t operate it unless your utility allows it.',
            why: 'If the house valve fails, or the break is in the pipe between the street and the house, this is the only way to stop the water.',
            tip: 'Call your water utility’s non-emergency line and ask if homeowners may use the curb valve. Many only let their own crews touch it, and will come out quickly for a burst pipe.',
            ok: 'You know where the lid is and whose number to call to have it closed.',
            v: { cam: [2.6, 1.4, 5.6], at: [1.4, 0.1, 3.5], hi: ['curbBox', 'curbKey'], show: ['curbKey'], rt: { waterLever: [0, 0, 0] }, mv: { curbLid: [0.18, 0, 0.05] } },
          },
          {
            t: 'Find the gas meter valve',
            d: 'At the gas meter outside, find the valve on the pipe coming up out of the ground before the meter. It has a flat tab (the tang) with a hole in it. Tang in line with the pipe means ON; a quarter turn so it sits across the pipe means OFF. Look, but don’t turn it.',
            why: 'This is the one valve that shuts gas to the whole house. Turning it off also puts out every pilot light, which then needs a professional relight.',
            tip: 'Snap a photo of the tang in its normal ON position. In an emergency the photo reminds you which way is off: crosswise to the pipe.',
            ok: 'You can see the tang lined up with the pipe and know it needs a quarter turn to close.',
            v: { cam: [4.4, 0.95, 0.3], at: [3.25, 0.45, -0.85], hi: ['gasValve', 'gasTang'], mv: { curbLid: [0, 0, 0] }, hide: ['curbKey'] },
          },
          {
            t: 'Keep a wrench at the meter',
            d: 'Hang a 12–15″ adjustable wrench or a gas shutoff tool on a hook or wire near the meter. To shut off in an emergency, fit the jaws over the tang and turn it a quarter turn either way so it sits across the pipe.',
            why: 'The tang is too stiff to turn by hand. A wrench stored right there means anyone can do it on the way out of the house.',
            tip: 'Wire the wrench to the pipe with a zip tie or plastic-coated cable so it can’t walk away; a $10 tool from the hardware store is fine.',
            ok: 'The wrench hangs within arm’s reach of the meter and its jaws open wide enough to fit over the tang.',
            v: { cam: [4.2, 0.8, 0.1], at: [3.27, 0.3, -0.9], hi: ['gasWrench', 'gasTang'], show: ['gasWrench'] },
          },
          {
            t: 'Find the appliance gas valves',
            d: 'Every gas appliance has its own shutoff on the pipe beside it, usually with a yellow or red lever handle. Find the ones for the water heater, furnace, range and dryer. Handle in line with the pipe is on; across is off.',
            why: 'For a problem with one appliance you can shut off just that one and keep the heat and hot water running.',
            tip: 'The range valve is usually behind the stove, low on the wall; pull out the bottom drawer to see it without moving the stove.',
            ok: 'You’ve found a valve next to each gas appliance and can see which way its handle points.',
            v: { cam: [2.8, 1.0, -0.4], at: [1.9, 0.45, -1.5], hi: ['whGas'], hide: ['gasWrench'] },
          },
          {
            t: 'Find the main breaker',
            d: 'Open the panel door. The main breaker is usually the large double-wide switch at the top, marked MAIN with its amp rating (100, 150 or 200). Pushing it to OFF cuts every circuit in the house. Newer homes may have the main in a separate box outside next to the electric meter.',
            why: 'For smoke from an outlet, a flooded room or an electrical fire, this kills power everywhere in one move.',
            tip: 'No single big breaker? Some older panels have up to six main switches at the top; all of them together are the shutoff. Label them as a group.',
            ok: 'You’ve found the breaker labeled MAIN (or the outdoor disconnect) and know which way is off.',
            v: { cam: [2.5, 1.65, -0.95], at: [2.45, 1.55, -2.05], hi: ['mainBreaker'], rt: { panelDoor: [0, -110, 0] } },
          },
          {
            t: 'Find and exercise the fixture stops',
            d: 'Under each sink and behind each toilet are small valves called fixture stops. Turn each one clockwise until snug, check the faucet or toilet stops filling, then open it fully again.',
            why: 'A leaking faucet or running toilet only needs its own stop closed, not the whole house.',
            tip: 'If a stop drips at the stem after you turn it, snug the small nut right behind the handle about ⅛ turn with a wrench; that squeezes the seal (the packing) and usually stops the drip.',
            ok: 'Each stop turns by hand, shuts its fixture off, and is dry after you reopen it.',
            v: { cam: [-1.4, 1.1, 0.2], at: [-2.0, 0.4, -1.8], hi: ['sinkStops'], rt: { sinkDoorL: [0, -100, 0], sinkDoorR: [0, 100, 0], panelDoor: [0, 0, 0] } },
          },
          {
            t: 'Tag them and make a map',
            d: 'Zip-tie bright tags on each shutoff: WATER MAIN, GAS METER, MAIN BREAKER. Sketch a simple floor plan with all of them marked and tape it inside the panel door. Then walk everyone in the house through it once.',
            why: 'The person home during an emergency might be a sitter, a guest or a teenager. A map and tags let anyone act fast.',
            tip: 'Put the same photos and map in a shared phone note or family group chat, so the info is there even if you can’t get to the panel.',
            ok: 'Someone who wasn’t on the walk-through can find all three shutoffs using only the map.',
            v: { cam: [6.5, 7, 9], at: [0.4, 0.5, 0.3], hi: ['tags', 'map'], show: ['tags', 'map'], rt: { sinkDoorL: [0, 0, 0], sinkDoorR: [0, 0, 0], panelDoor: [0, -110, 0] } },
          },
        ],
        tricks: [
          ['Drain after you close', 'After shutting the main water, open the lowest faucet (basement sink or outdoor tap) and the highest one; the pipes empty and the leak slows to a trickle in a minute.'],
          ['Protect the water heater', 'If the water will be off for hours or the pipes drained, turn a gas water heater to VACATION or PILOT, or shut an electric one’s breaker, so it can’t heat an empty tank.'],
          ['Exercise twice a year', 'Turn the main and every fixture stop at daylight-saving time changes. Valves that move twice a year rarely seize.'],
          ['Upgrade the main', 'An old wheel-handle gate valve is the most likely to fail when you need it. A plumber can swap it for a quarter-turn ball valve for roughly $150–400.'],
          ['Add an automatic shutoff', 'A smart water valve with floor leak sensors closes the main by itself when it senses water, which protects the house while you’re away.'],
          ['Know the outdoor disconnect', 'Since the 2020 electrical code, many new homes have an emergency disconnect outside by the meter, so firefighters can kill power without going inside. If you have one, tag it too.'],
        ],
        refs: [
          ['How to locate your gas and water shutoff valves (Family Handyman)', 'https://www.familyhandyman.com/article/how-to-locate-your-gas-shutoff-valve-and-water-shutoff-valve/'],
          ['Utility control task list (Seattle Office of Emergency Management)', 'https://www.seattle.gov/documents/departments/emergency/preparedness/snap/gettingorganized/utilitycontroltasklist_update_02-01-2011.pdf'],
          ['Gas shut-off instructions (Alameda County Fire)', 'https://aspawebq.acgov.org/fire/documents/emergency/04-Gas-Shut-Off.pdf'],
          ['Locating main utility shutoffs (Boston Building Resources)', 'https://www.bostonbuildingresources.com/advice/locating-main-utility-shutoffs'],
        ],
        learn: {
          how: 'Water, gas and power each come into the house at one point and branch out from there. A shutoff at the entry point stops everything downstream. Quarter-turn valves are open when the handle points along the pipe and closed when it’s across it. Breakers switch themselves off when a circuit overloads, but the main breaker is also a manual switch that disconnects the whole panel from the power coming in.',
          specs: [['Ball valve (lever)', '¼ turn; handle across the pipe = closed'], ['Gate valve (wheel)', 'Clockwise to close, several turns'], ['Gas meter valve', '¼ turn with a 12–15″ wrench; tang across the pipe = off'], ['Main breaker', '100–200 A typical, top of the panel or outside by the meter'], ['Exercise valves', '1–2 times a year']],
          terms: [['Curb stop', 'The utility’s valve between the street main and your house, under a lid in the yard or sidewalk.'], ['Tang', 'The flat tab on a gas meter valve that shows whether it’s open or closed.'], ['Fixture stop', 'Small valve that shuts water to one faucet or toilet.'], ['Main breaker', 'The big breaker that disconnects every circuit in the panel at once.'], ['Packing nut', 'The nut behind a valve handle that squeezes a seal around the stem.']],
          mistakes: ['Shutting the gas off just to test it.', 'Forcing a seized water valve with a pipe wrench until it cracks.', 'Keeping the only knowledge of the shutoffs in one person’s head.', 'Closing the main but leaving a gas or electric water heater firing on a drained tank.'],
          tips: ['Exercise the water main and fixture stops once or twice a year.', 'Take a photo of each shutoff and store it in a shared note on everyone’s phone.', 'Keep a flashlight in the same spot as the panel map.'],
        },
        pro: 'A water main or gate valve is seized or leaks at the stem, you can’t find the main at all, or anything about the gas service looks damaged. Gas meter problems and relighting after a shutoff always go to the gas utility.',
      },
      {
        id: 'fire-extinguisher',
        title: 'Mount and check a fire extinguisher',
        model: 'extinguisherKitchen',
        level: 1,
        time: '20–30 min',
        cost: '$30–70',
        summary: 'A 5 lb ABC extinguisher on a bracket by the kitchen exit handles the small fires that start most house fires. Mount it where you grab it on the way out, glance at the gauge monthly, and know PASS: Pull, Aim, Squeeze, Sweep.',
        intro: { hi: ['ext'], show: ['bracket'], preview: true },
        safety: [
          'Only fight a fire that’s small (wastebasket or pan size), not spreading, and with a clear exit behind you. If the room is filling with smoke or you’re unsure, get out, close the door and call 911.',
          'Never put water on a grease fire. Slide a lid or baking sheet over the pan and turn off the burner; that’s often all it takes.',
          'Everyone leaves first and someone calls 911 before you start fighting the fire, even if you think you can put it out.',
          'The powder is an irritant. Ventilate after use and keep kids and pets away until it’s cleaned up.',
        ],
        causes: [
          ['Class A', 'Ordinary combustibles: paper, wood, cloth, plastic.'],
          ['Class B', 'Flammable liquids: grease, oil, gasoline, paint thinner.'],
          ['Class C', 'Energized electrical equipment: appliances, wiring, outlets.'],
          ['Class K', 'Large amounts of cooking oil in commercial deep fryers. At home, use a lid on a pan fire; an ABC unit is the backup.'],
        ],
        tools: ['5 lb ABC extinguisher rated 2-A:10-B:C or higher (3-A:40-B:C is common), with gauge and wall bracket', 'Stud finder', 'Drill/driver + #2 Phillips bit + ⅛″ drill bit', '2 × #10 × 2½″ wood screws (if the bracket screws are short)', 'Pencil', 'Tape measure', 'Level'],
        steps: [
          {
            t: 'Pick the right extinguisher',
            d: 'Buy a multipurpose ABC dry-chemical extinguisher, 5 lb or larger, with a UL rating of at least 2-A:10-B:C printed on the label. Look for a metal valve head, a pressure gauge, and a manufacture date stamped on the bottom or label.',
            why: 'ABC covers burning paper and wood, grease and oil, and electrical fires. Small 1–2 lb units empty in about 8–10 seconds, which is rarely enough.',
            tip: 'The numbers mean power: the A number is how big a wood fire it can handle, the B number is square feet of burning liquid. 3-A:40-B:C beats 1-A:10-B:C every time.',
            ok: 'The label shows “ABC”, a rating of 2-A:10-B:C or higher, and a gauge needle sitting in the green.',
            v: { cam: [0.9, 1.25, 1.1], at: [-0.1, 1.1, 0.35], hi: ['label', 'ext'], mv: { ext: [-0.51, 0.2, 0.265] }, hide: ['bracket'] },
          },
          {
            t: 'Choose the spot',
            d: 'Mount it near the kitchen exit, in plain sight and not blocked by anything, and well away from the stove. You should reach it while moving away from a fire, not reach across the flames.',
            why: 'If the stove is burning, an extinguisher next to it is unreachable. By the doorway, your escape route stays behind you while you use it.',
            tip: 'Stand at the stove and walk toward the door: the extinguisher belongs on that path, at the point where you’d naturally turn around.',
            ok: 'From the stove, you can see it, and grabbing it takes you toward the exit, not toward the fire.',
            v: { cam: [1.9, 1.4, 2.6], at: [0.2, 1.0, 0], hi: ['doorway', 'range'] },
          },
          {
            t: 'Find a stud and mark the height',
            d: 'Slide the stud finder slowly along the wall until it beeps and mark the stud. Mark the height so the top of the hung extinguisher sits no higher than 5 ft and its bottom at least 4″ off the floor. A handle at about 3½–4 ft is easy for most adults.',
            why: 'A full 5 lb extinguisher weighs about 9–10 lb. Screws into a wood stud won’t tear out when someone yanks it off in a panic.',
            tip: 'Confirm the stud by driving a thin finish nail where the bracket will cover the hole. Solid resistance means wood; if it pushes through easily, move over ¾″ and try again.',
            ok: 'A pencil cross marks the center of a stud at a height that keeps the top under 5 ft.',
            v: { cam: [0.9, 1.15, 1.0], at: [0.41, 0.98, 0], hi: ['finder', 'marks'], show: ['finder', 'marks'] },
          },
          {
            t: 'Screw the bracket to the stud',
            d: 'Hold the bracket on your marks and check it’s straight with a level. Drill ⅛″ pilot holes, then drive two #10 × 2½″ screws through the bracket into the stud with the drill on a low clutch setting.',
            why: 'Drywall anchors loosen as the bracket gets bumped. Two screws into wood keep it solid for years.',
            tip: 'Set the drill clutch to about 5 and stop when the screw head pulls flat to the bracket; you’ll feel the clutch click. If a screw spins without tightening, you missed the stud: move the bracket to it.',
            ok: 'The bracket doesn’t move at all when you pull down on it with your hand.',
            v: { cam: [0.9, 1.15, 1.0], at: [0.41, 0.98, 0], hi: ['bracket'], show: ['bracket'], hide: ['finder'], tool: { id: 'drill', at: [0.41, 1.064, 0.006], rot: [90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Hang it, label facing out',
            d: 'Seat the neck in the bracket hook, close the strap around the body until it clicks, and turn it so the instructions and the gauge face the room.',
            why: 'Under stress people read the label. The gauge facing out also makes the monthly check a two-second glance.',
            tip: 'Practice once: pop the strap and lift the extinguisher off the bracket. If it takes two hands or a fiddly release, adjust it now, not during a fire.',
            ok: 'You can read the label and gauge from across the kitchen, and it lifts off in one smooth move.',
            v: { cam: [1.0, 1.2, 1.3], at: [0.41, 0.98, 0.05], hi: ['ext', 'bracket'], hide: ['marks'], mv: { ext: [0, 0, 0] } },
          },
          {
            t: 'Monthly: check the gauge',
            d: 'Look at the small dial on the valve. The needle must sit in the green band. Left of green means it has lost pressure; right of green means it’s overcharged. Either way, replace it or have it serviced.',
            why: 'Extinguishers slowly leak their pressure. A low one may only puff for a second or two.',
            tip: 'Pair the check with something monthly, like paying a bill, and put a dated sticker on the cylinder each time so you know it’s been done.',
            ok: 'The needle points into the green zone.',
            v: { cam: [0.48, 1.19, 0.3], at: [0.405, 1.18, 0.1], hi: ['gauge'] },
          },
          {
            t: 'Monthly: pin, seal, hose, body',
            d: 'Check that the pin is in place with its plastic tamper seal unbroken, the hose isn’t cracked, the nozzle is clear, and the cylinder has no dents or rust. Read the date: retire a disposable (plastic-valve) unit 12 years after it was made, or sooner if the label says.',
            why: 'A broken seal means it may have been partly used. Corrosion or a cracked hose can fail when you squeeze it.',
            tip: 'Dry powder can pack down at the bottom. Every month or two, lift it off, turn it upside down and give the bottom a few firm taps with your palm so the powder stays loose.',
            ok: 'Pin in, seal intact, hose flexible with no cracks, and the date is less than 12 years old.',
            v: { cam: [0.65, 1.2, 0.45], at: [0.4, 1.05, 0.08], hi: ['pin', 'seal', 'hose'] },
          },
          {
            t: 'If a fire starts: Pull the pin',
            d: 'Shout “fire”, get everyone moving out and have someone call 911. Stand 6–8 ft from the fire with the exit at your back. Hold the extinguisher upright, twist the pin to break the seal and pull it out.',
            why: 'The pin locks the lever so it can’t be squeezed by accident. Nothing comes out until it’s removed.',
            tip: 'For a pan of burning oil, try the lid first: slide it on from the side and turn off the burner. Spraying a pan from too close can blast burning oil out of it.',
            ok: 'The pin is in your hand and the lever moves freely.',
            v: { cam: [0.9, 1.6, 2.6], at: [-0.7, 1.0, 0.8], hi: ['pin', 'pan'], fx: 'fire', mv: { ext: [-1.16, 0.1, 1.415], pin: [0, 0, 0.08] }, rt: { ext: [0, 180, 0] } },
          },
          {
            t: 'Aim at the base',
            d: 'Unclip the hose and point the nozzle low, at the base of the flames where the fuel is burning, not at the smoke or the flame tips.',
            why: 'The powder works by coating the fuel and breaking the chemical reaction of the fire. Aimed high, it blows past without touching what’s burning.',
            tip: 'Hold the hose near the nozzle with one hand and the valve with the other; the hose whips if you only hold the cylinder.',
            ok: 'The nozzle points at the bottom edge of the flames.',
            v: { cam: [0.9, 1.6, 2.6], at: [-0.7, 1.0, 0.8], hi: ['hoseAim'], show: ['hoseAim'], hide: ['hose'], fx: 'aim' },
          },
          {
            t: 'Squeeze and sweep',
            d: 'Squeeze the lever firmly and sweep the nozzle side to side across the base of the fire until it’s out. A 5 lb unit sprays for only about 13–15 seconds. Back away still facing it, watch for flare-ups and spray again if needed.',
            why: 'Sweeping covers the whole burning surface. A fire that’s out on one side can relight from the other.',
            tip: 'If the fire isn’t clearly shrinking within the first few seconds, stop, get out and close the door behind you. A closed door slows a fire dramatically.',
            ok: 'No flames, and nothing relights while you watch for a full minute from a safe distance.',
            v: { cam: [0.9, 1.6, 2.6], at: [-0.7, 1.0, 0.8], hi: ['lever', 'hoseAim'], fx: 'spray', rt: { lever: [0, 0, -10] } },
          },
          {
            t: 'After any use: replace or recharge',
            d: 'Even a short squeeze means it must be recharged by a fire-equipment service or replaced. Let the fire department check the area if the fire got into cabinets or walls. Vacuum up the powder, then wipe surfaces with a damp cloth.',
            why: 'Once the valve opens, powder grains keep it from resealing and the pressure leaks out within days.',
            tip: 'Clean the powder up the same day: it attracts moisture and can corrode metal and electronics if left sitting.',
            ok: 'A fresh, full extinguisher (gauge in the green) is back on the bracket.',
            v: { cam: [1.2, 1.3, 2.2], at: [-0.5, 1.0, 0.8], hi: ['ext'], rt: { lever: [0, 0, 0] } },
          },
        ],
        tricks: [
          ['One per level', 'Put an extinguisher on every floor, plus the garage and near the bedrooms, so one is never more than a few steps away.'],
          ['Buy rechargeable if you can', 'A metal-valve, rechargeable 5 lb unit costs a bit more but can be refilled after use and serviced for decades.'],
          ['Practice with a trainer', 'Many fire departments run free hands-on classes with real fires or laser trainers; one session makes PASS automatic.'],
          ['Lid within reach', 'Keep a lid or cookie sheet near the stove. For a pan fire it’s faster and cleaner than any extinguisher.'],
          ['Don’t test-fire it', 'A quick test squeeze empties it within days. Trust the gauge and the monthly check instead.'],
          ['Write the dates on it', 'Put a strip of tape on the cylinder with the purchase date and your monthly check initials.'],
          ['Car and workshop', 'A 2½ lb ABC unit fits a car trunk; a 10 lb unit is better for a garage workshop where fires get bigger faster.'],
        ],
        refs: [
          ['Fire extinguishers (NFPA)', 'https://www.nfpa.org/education-and-research/home-fire-safety/fire-extinguishers'],
          ['The PASS method for fire extinguishers (Boston University EHS)', 'https://www.bu.edu/ehs/ehs-topics/fire-safety/fire-extinguisher/the-pass-method-for-fire-extinguishers'],
          ['NFPA 10 monthly extinguisher check (Emory University)', 'https://campserv.emory.edu/_includes/documents/sections/resources/fire-extinguisher-nfpa-10-monthly-check.pdf'],
          ['Fire extinguisher mounting height (ANJ Fire)', 'https://anjfire.com/fire-extinguisher-mounting-height/'],
        ],
        learn: {
          how: 'A stored-pressure extinguisher is a steel cylinder filled with fine powder (monoammonium phosphate) and pressurized with nitrogen. Squeezing the lever opens a valve and the gas pushes powder out the hose. The powder coats the fuel and interrupts the chemical chain reaction that keeps a fire burning.',
          specs: [['Home rating', '2-A:10-B:C minimum (5 lb); 3-A:40-B:C common'], ['Mounting height', 'Top ≤ 5 ft, bottom ≥ 4″ off the floor'], ['Discharge time (5 lb)', '≈ 13–15 s'], ['Range', '≈ 10–18 ft'], ['Use distance', 'Start 6–8 ft from the fire'], ['Disposable unit life', 'Retire 12 years after manufacture'], ['Rechargeable service', 'Internal check every 6 years, pressure test every 12']],
          terms: [['PASS', 'Pull, Aim, Squeeze, Sweep.'], ['Tamper seal', 'Plastic tie on the pin that shows if it’s been pulled.'], ['Rating numbers', 'The A number compares to gallons of water on wood fires; the B number is square feet of burning liquid it can handle.'], ['Stored pressure', 'The cylinder is always under pressure, shown on the gauge.']],
          mistakes: ['Mounting it beside or above the stove.', 'Aiming at the flames instead of the base.', 'Putting a used extinguisher back on the bracket.', 'Fighting a fire before everyone is out and 911 is called.'],
          tips: ['Put one on every level, plus the garage and near the bedrooms.', 'Most adults handle a 5 lb unit easily; 10 lb gives more spray time but is heavier.', 'Many fire departments run free hands-on training.'],
        },
        pro: 'A rechargeable (metal valve) unit needs recharging or its 6-year and 12-year service, or you want extinguishers for a workshop, boat or rental property with inspection tags.',
      },
      {
        id: 'grab-bars',
        kind: 'build',
        title: 'Install grab bars at the tub',
        model: 'grabBarTub',
        level: 2,
        time: '1–2 hrs',
        cost: '$40–120',
        summary: 'A horizontal bar on the back wall and a vertical bar at the faucet end, screwed through the tile into studs or blocking, make getting in and out of the tub safe. Done right, each bar holds 250 lb or more.',
        intro: { show: ['bar', 'screws', 'covers', 'bar2'], preview: true },
        safety: [
          'Never use suction-cup bars or towel bars as grab bars. They aren’t built to hold a falling person and can let go without warning.',
          'Wear safety glasses when drilling tile; glaze chips fly and the bit can skate.',
          'Before drilling the faucet wall, picture the pipes: stay at least 6″ to the side of the valve and the line straight up to the shower head.',
          'Turn off the tub light’s circuit if you’ll drill near a switch or recessed light, and keep cords away from water in the tub.',
        ],
        causes: [
          ['Back wall', 'Horizontal bar with its top 33–36″ above the bathroom floor, 24″ or longer.'],
          ['Faucet (control) end', 'An 18″ or longer vertical bar near the outside edge of the tub, for stepping in and out.'],
          ['Find the backing', 'Studs are usually 16″ apart, so a 32″ bar lands on two. Otherwise use blocking or an anchor listed for grab bars.'],
          ['Bar spec', '1¼–2″ diameter (1¼–1½″ fits most hands), textured grip, 1½″ gap to the wall, rated 250 lb.'],
        ],
        tools: ['Stainless grab bars (32″ + 18″) rated 250 lb', '#10 or #12 × 2½″ stainless screws (3 per flange)', 'Stud finder', '2–4 ft level', 'Painter’s tape + pencil', 'Drill + ¼″ diamond tile bit + ⅛″ wood bit', 'Spray bottle of water', '100% silicone sealant', 'Safety glasses'],
        steps: [
          {
            t: 'Plan the bar locations',
            d: 'On the back wall, plan a horizontal bar with its top 33–36″ above the bathroom floor. At the faucet end, plan an 18″ vertical bar near the outer edge of the tub, its bottom end 3–6″ above the height of the back bar. Mark both lightly with tape.',
            why: 'These positions match where a hand naturally goes when you sit down, stand up or step over the tub wall. They come from the accessibility standards (ADA and ANSI A117.1).',
            tip: 'Have the person who’ll use the bars stand in the tub and reach. If they’re shorter or taller than average, shift within the range to fit them.',
            ok: 'Tape outlines show both bars, and the back bar’s top line measures 33–36″ from the floor.',
            v: { cam: [1.7, 1.45, 2.3], at: [0, 0.95, 0.25], hi: ['wall', 'tub'] },
          },
          {
            t: 'Find the studs',
            d: 'Slide the stud finder slowly across the tile at bar height and put a strip of tape at each edge of every stud it finds. Studs are usually 16″ apart, center to center.',
            why: 'Each flange (the round plate at the end of the bar) needs its screws biting solid wood to hold a fall.',
            tip: 'Tile can confuse stud finders. Double-check by tapping: a hollow sound is between studs, a duller, solid sound is over one. Or measure 16″ from a known stud by the tub edge.',
            ok: 'Tape marks sit about 16″ apart, and the two ends of your 32″ bar land on two of them.',
            v: { cam: [1.1, 1.2, 1.5], at: [0, 0.9, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true },
          },
          {
            t: 'Check for blocking',
            d: 'If the wall was opened in a remodel, there may be wood boards (blocking) between the studs, which gives you wood anywhere. If not, pick a bar length that lands on studs, or use anchors made and rated for grab bars.',
            why: 'Tile and cement board alone crumble under load. The screws must bite wood or a listed grab-bar anchor behind the wall.',
            tip: 'If a flange can’t reach a stud, use a grab-bar anchor such as a WingIts or Moen SecureMount, rated for 250 lb or more. Plastic drywall plugs are never okay here.',
            ok: 'You know exactly what each flange will screw into: stud, blocking, or a rated anchor.',
            v: { cam: [1.2, 1.0, 1.3], at: [0, 0.86, 0], hi: ['blocking', 'studs'], xray: true },
          },
          {
            t: 'Mark the holes',
            d: 'Put painter’s tape where each flange goes. Hold the bar up, set a level on top and center each flange on a stud, then mark all three screw holes in each flange with a pencil.',
            why: 'Tape stops the bit from skating on glazed tile and makes your marks easy to see.',
            tip: 'Turn the flanges so at least two of the three holes sit on the stud’s center line, not near its edges where the screw could miss.',
            ok: 'Six marks on tape, and the level’s bubble is centered when the bar is held on them.',
            v: { cam: [1.0, 1.1, 1.4], at: [0, 0.86, 0], hi: ['marks'], show: ['marks'], hide: ['finder'], tool: { id: 'level', at: [0, 0.88, 0.02], rot: [0, 0, 90], scale: 1 } },
          },
          {
            t: 'Drill through the tile',
            d: 'With a ¼″ diamond tile bit, hammer mode off and the drill on slow, start at a slight angle to cut a notch, then straighten up. Mist the hole with water to keep the bit cool. Once through the tile, switch to a ⅛″ wood bit and drill the pilot 2½″ into the stud.',
            why: 'Hammer mode and high speed crack tile. The bigger tile hole lets the screw pass without wedging the tile; the small pilot keeps the screw from splitting the stud.',
            tip: 'If the bit glows, squeals or stops cutting, it’s overheating: back off, spray more water and use lighter pressure. You’ll feel it drop through when it clears the tile.',
            ok: 'Clean round holes with no cracks spreading from them, and the wood bit comes out with light-colored wood shavings.',
            v: { cam: [0.8, 1.05, 0.9], at: [0.406, 0.86, 0], hi: ['holes'], show: ['holes'], tool: { id: 'drill', at: [0.406, 0.884, 0.004], rot: [90, 0, 0], anim: 'spin', bit: 'drill' } },
          },
          {
            t: 'Seal and screw on the bar',
            d: 'Squirt a dab of silicone into each hole. Hold the bar in place and drive the stainless screws until the flange is snug and flat to the tile. Stop there: don’t keep cranking against the tile.',
            why: 'Silicone keeps water out of the wall. Stainless screws won’t rust and leave stains running down the tile.',
            tip: 'Set the drill clutch low (around 5–8) and finish the last turn by hand. If a screw spins without tightening, it missed the wood: pull it and angle a new pilot toward the stud.',
            ok: 'All six screws are tight, the flanges sit flat, and nothing cracked.',
            v: { cam: [1.0, 1.1, 1.4], at: [0, 0.86, 0.03], hi: ['bar', 'screws'], show: ['bar', 'screws'], hide: ['marks', 'holes'], tool: { id: 'drill', at: [0.406, 0.884, 0.012], rot: [90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Snap on the covers',
            d: 'Slide each flange cover over the screws and snap or twist it on. Run a thin bead of silicone around the top half of each flange.',
            why: 'Covers hide the screws; the top bead sheds water so it can’t run behind the flange.',
            tip: 'Leave the bottom edge of the flange unsealed so any water that does get in can drain out instead of being trapped.',
            ok: 'Covers sit flush and a neat silicone bead runs along the top of each flange.',
            v: { cam: [0.9, 1.05, 1.0], at: [0, 0.86, 0.03], hi: ['covers'], show: ['covers'] },
          },
          {
            t: 'Add the vertical entry bar',
            d: 'Repeat on the faucet-end wall near the outer edge of the tub: find a stud, mark, drill through the tile, seal and screw the 18″ bar on vertically, both flanges into the same stud.',
            why: 'A vertical bar is what you grab while stepping over the tub wall, the riskiest moment in the bathroom.',
            tip: 'A vertical bar only needs one stud, since both ends land on it. Use the level on the side of the bar to get it plumb (straight up and down).',
            ok: 'The vertical bar is plumb and its bottom flange sits a few inches above the height of the back bar.',
            v: { cam: [0.4, 1.4, 1.6], at: [-0.7, 1.18, 0.62], hi: ['bar2'], show: ['marks2', 'bar2'], tool: { id: 'drill', at: [-0.754, 1.43, 0.62], rot: [0, 0, -90], anim: 'spin' } },
          },
          {
            t: 'Pull test',
            d: 'Wait for the silicone to set (check the tube, usually 30 minutes to touch). Then pull down and out on each bar with your full weight.',
            why: 'Better to find a loose screw now than when someone slips.',
            tip: 'If a bar creaks or shifts, take it down, find what each screw is biting, and fix it before anyone uses it. Don’t just add more silicone.',
            ok: 'No movement, no creak, no new cracks in the tile, even with your full weight on it.',
            v: { cam: [1.7, 1.45, 2.3], at: [0, 0.95, 0.25], hi: ['bar', 'bar2'], hide: ['marks2'], fx: 'pull' },
          },
        ],
        tricks: [
          ['Bar length follows the studs', 'Buy lengths that span studs: 16″, 32″ and 48″ bars land on studs 16″ apart, so you rarely need anchors.'],
          ['Angled bars help sitters', 'A bar angled up toward the faucet end helps someone pull up from sitting in the tub.'],
          ['Go textured', 'Choose a knurled or peened grip; polished chrome is slippery with soap.'],
          ['Hole in the wrong spot', 'If you drill a hole that misses, fill it with silicone and move the flange so its cover hides the miss.'],
          ['Remodeling? Block it now', 'With the wall open, add 2×8 blocking or ¾″ plywood around the tub from about 30–40″ high, so bars can go anywhere later.'],
          ['Fiberglass tub surrounds', 'One-piece surrounds flex and crack; use bars with anchors made for hollow fiberglass walls, or call a pro.'],
        ],
        refs: [
          ['ADA Standards: 609 Grab bars and 607 Bathtubs (U.S. Access Board)', 'https://www.access-board.gov/ada/#ada-609'],
          ['ADA bathtub grab bar placement guide (GrabBars.com)', 'https://www.grabbars.com/?p=1696'],
          ['How to install grab bars in a tile shower (Rubi)', 'https://www.rubi.com/us/blog/how-to-install-grab-bars-in-tile-shower/'],
          ['How to install shower grab bars (Angi)', 'https://www.angi.com/articles/how-to-install-shower-grab-bars.htm'],
        ],
        learn: {
          how: 'A grab bar turns a fall into a pull on six screws. The load is mostly downward along the wall plus some pull-out at the top screws, so the screws need at least 1–1½″ of thread in solid wood. The 1½″ gap to the wall is deliberate: a hand fits around the bar, but an arm can’t slip through and get trapped.',
          specs: [['Height', '33–36″ to the top of the back bar'], ['Vertical bar', '18″ min., bottom 3–6″ above the back bar'], ['Diameter', '1¼–2″ (1¼–1½″ most common)'], ['Wall clearance', '1½″'], ['Load', '250 lb minimum'], ['Screws', '#10–#12 × 2½″ stainless, 3 per flange'], ['Tile bit / pilot', '¼″ diamond / ⅛″ into the stud']],
          terms: [['Blocking', 'Lumber between studs that gives screws something solid to bite.'], ['Flange', 'The round plate at each end that screws to the wall.'], ['Diamond bit', 'Bit coated with diamond grit that grinds through porcelain and glass.'], ['Plumb', 'Exactly vertical.']],
          mistakes: ['Plastic anchors in drywall or tile.', 'Hammer-drilling tile.', 'Mounting a bar where only one end hits a stud.', 'Overtightening and cracking the tile.'],
          tips: ['Angled bars on the back wall work well for people who pull up from sitting.', 'Pick a bar with a textured grip; polished chrome is slippery when wet.', 'A 32″ bar spans exactly two studs at 16″ on center.'],
        },
        pro: 'The wall is fiberglass, a one-piece tub surround, or plaster over wood strips (lath), there’s no stud where the bar must go, or you need an ADA-compliant layout for a rental.',
      },
      {
        id: 'water-heater-straps',
        title: 'Strap a water heater for earthquakes',
        model: 'waterHeaterStrap',
        level: 2,
        time: '1–2 hrs',
        cost: '$30–60',
        summary: 'Two steel straps, one in the upper third of the tank and one in the lower third, bolted into wall studs keep a 400–500 lb tank of hot water from tipping, tearing its gas line and starting a fire after a quake.',
        intro: { hi: ['tank'] },
        safety: [
          'Keep the lower strap at least 4″ above the gas control and burner door so it doesn’t block them or trap heat.',
          'Smell gas at any point? Stop, leave and call the gas company from outside.',
          'Never strap over the T&P relief valve (the brass safety valve near the top) or its discharge pipe.',
          'Don’t lean on, bend or move the gas line or vent pipe while you work.',
        ],
        causes: [
          ['Required in quake zones', 'California and many western codes require two straps on every water heater (more on some larger tanks).'],
          ['Tank tips', 'A full 50-gal tank weighs about 500 lb and walks, slides or falls in strong shaking.'],
          ['Rigid connections snap', 'Copper and steel gas pipe break when the tank moves; flexible connectors bend.'],
        ],
        tools: ['Double-strap earthquake kit (22-gauge or heavier, ¾″+ wide steel)', '4 × ¼″ × 3″ lag screws + flat washers', 'Stud finder', 'Drill + 5/32″ or 3/16″ bit', '7/16″ socket + ratchet', 'Tape measure + pencil', '2×4 blocking + 3″ screws (if the gap is over 1″)', 'Adjustable wrench'],
        steps: [
          {
            t: 'Check the setup',
            d: 'Measure the tank height and how far it sits from the wall. Look at the pipes on top and the gas line at the bottom: are they flexible (corrugated, bendy) or rigid pipe? Read the label for the tank size in gallons.',
            why: 'Straps hold the tank; flexible connectors let the little movement that remains happen without breaking a line.',
            tip: 'Snap photos of the label and connections. If you need parts, the hardware store can match them from the photos.',
            ok: 'You know the tank’s gallons, its height, the gap to the wall, and whether the connectors are flexible.',
            v: { cam: [1.5, 1.4, 2.2], at: [0, 0.85, 0.2], hi: ['tank', 'connectors', 'gasLine'] },
          },
          {
            t: 'Find the studs',
            d: 'Slide the stud finder across the wall behind and beside the tank and mark the center of the studs on each side, usually 16″ apart.',
            why: 'Lag screws into studs hold thousands of pounds. Drywall alone holds almost nothing.',
            tip: 'Confirm each stud with a thin nail where the strap end will cover the hole: solid resistance means wood.',
            ok: 'You have a confirmed stud mark on each side of the tank.',
            v: { cam: [1.2, 1.4, 1.5], at: [0.2, 1.1, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true },
          },
          {
            t: 'Mark the strap heights',
            d: 'Divide the tank height into thirds. Mark one strap height in the upper third and one in the lower third, keeping the lower one at least 4″ above the gas control (the box with the knob near the bottom).',
            why: 'Two straps spread the load and stop the tank from both tipping over and twisting off the wall.',
            tip: 'On a 60″ tank: upper strap 40–55″ up, lower strap about 4″ above the controls but under 20″.',
            ok: 'Two level marks on each stud, one in each third, the lower one clear of the gas control.',
            v: { cam: [1.3, 0.95, 1.6], at: [0, 0.8, 0.1], hi: ['marks', 'gasControl'], show: ['marks'], hide: ['finder'], tool: { id: 'tape', at: [0.5, 0.0, 0.06], rot: [0, -90, 0] } },
          },
          {
            t: 'Fill the gap behind the tank',
            d: 'If the tank sits more than about 1″ from the wall, screw 2×4 blocks to the studs at each strap height with two 3″ screws per stud, so the tank rests against wood.',
            why: 'A gap lets the tank build up speed before the straps catch it, and that jolt can tear the lags out.',
            tip: 'Stack two 2×4s or add a 2×6 if the gap is bigger. The block should almost touch the tank.',
            ok: 'With the blocks on, there’s 1″ or less between the tank and the wood.',
            v: { cam: [0.9, 1.6, 1.2], at: [0, 0.9, 0.05], hi: ['spacers'], show: ['spacers'], xray: true },
          },
          {
            t: 'Wrap the upper strap',
            d: 'Wrap the upper strap fully around the front of the tank at your mark and bring both ends back to the studs.',
            why: 'Wrapping the front pulls the tank back toward the wall instead of only holding one side.',
            tip: 'Use painter’s tape to hold the strap at height while you work; it slips down otherwise.',
            ok: 'The strap circles the tank at the mark, flat against the jacket with no twists.',
            v: { cam: [1.3, 1.6, 1.8], at: [0, 1.2, 0.2], hi: ['strapTop'], show: ['strapTop'] },
          },
          {
            t: 'Lag the ends into studs',
            d: 'Drill a 5/32″–3/16″ pilot hole through each strap end into the stud center. Put a flat washer on a ¼″ × 3″ lag screw and drive it with a 7/16″ socket until the washer is snug against the strap.',
            why: 'Three inches of lag leaves at least 1½″ of thread in the stud after the drywall, the minimum the state bracing guidelines call for.',
            tip: 'Start the lag with the ratchet, not an impact driver: you’ll feel it get firm, then stop. If it spins freely, you missed the stud; move the strap end to wood.',
            ok: 'Both lags are tight, the washers press the strap flat, and the lag doesn’t turn when you lean on the ratchet.',
            v: { cam: [1.0, 1.4, 1.1], at: [0.406, 1.2, 0], hi: ['lagsTop'], show: ['lagsTop'], tool: { id: 'drill', at: [0.406, 1.2, 0.01], rot: [90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Add the lower strap',
            d: 'Repeat for the lower strap, at least 4″ above the gas control. Wrap it around the front and lag both ends into the studs with washers.',
            why: 'The lower strap stops the bottom of the tank from kicking out when the top is held.',
            tip: 'If the gas control sits too high for a lower strap under it, keep the strap above the control by 4″ or more; never cover the control or burner door.',
            ok: 'The lower strap is tight to the tank and you can still reach and turn the gas control knob.',
            v: { cam: [1.3, 0.8, 1.7], at: [0, 0.45, 0.2], hi: ['strapLow', 'lagsLow', 'gasControl'], show: ['strapLow', 'lagsLow'] },
          },
          {
            t: 'Tighten the straps',
            d: 'Snug each strap with its tensioning bolt until it’s tight against the tank with no slack, but stop before the metal jacket starts to dent.',
            why: 'Slack lets the tank rock and shock-load the lags. Too tight can crush the insulation under the jacket.',
            tip: 'Tighten in small turns, alternating between the two straps, and press on the jacket: when it stops moving under the strap, you’re done.',
            ok: 'You can’t slide a finger under the strap, and the jacket has no dents.',
            v: { cam: [0.8, 1.3, 1.6], at: [0, 1.0, 0.55], hi: ['strapTop', 'strapLow'], tool: { id: 'ratchet', at: [0.03, 1.2, 0.57], rot: [0, 0, 90] } },
          },
          {
            t: 'Check the connectors',
            d: 'Make sure both water lines on top are flexible connectors and the gas line ends in a listed flexible gas connector (usually yellow-coated). If any are rigid pipe, plan to have them replaced.',
            why: 'Even a strapped tank moves an inch or so. Rigid pipe can crack, and a broken gas line is the real fire danger after a quake.',
            tip: 'Changing gas fittings is a job for a licensed plumber in most places. Water connectors are an easy DIY swap with the water off.',
            ok: 'Every connection to the tank is a flexible connector, or you’ve booked a plumber for the rigid ones.',
            v: { cam: [1.3, 1.9, 1.4], at: [0.1, 1.2, 0.2], hi: ['connectors', 'gasLine'] },
          },
        ],
        tricks: [
          ['Pre-made kits save time', 'A boxed double-strap kit includes straps, tension bolts, conduit sleeves and lags sized for the job; plumber’s tape alone doesn’t meet most codes.'],
          ['Use the conduit sleeves', 'If your kit comes with metal tube sleeves for the strap ends, use them: they stiffen the strap so the tank can’t swing toward the wall.'],
          ['Corner installs', 'In a corner, lag one end to each wall’s studs so the straps pull the tank into the corner.'],
          ['Platform tanks', 'If the heater stands on a platform, anchor the platform to the floor and wall too, or the whole stack can walk.'],
          ['Seismic gas shutoff', 'An automatic seismic gas valve at the meter shuts gas off in a strong quake; a plumber can install one.'],
          ['Wrong lag size bought', 'If you only have short lags, don’t use them. Get 3″ lags so at least 1½″ of thread is in the stud.'],
        ],
        refs: [
          ['Guidelines for earthquake bracing of residential water heaters (EERI / California DSA)', 'https://mitigation.eeri.org/resource-library/homeowners/tutorials-homeowners/guidelines-for-earthquake-bracing-of-residential-water-heaters'],
          ['How to brace your water heater (LADBS bulletin)', 'https://dbs.lacity.gov/sites/default/files/efs/forms/pc17/how-to-brace-your-water-heater-ib-p-pc2011-003.pdf'],
          ['Water heater bracing handout (City of Berkeley)', 'https://berkeleyca.gov/sites/default/files/documents/144%20Water%20Heater%20Bracing.pdf'],
          ['Water heater strapping (Plumbing & Mechanical)', 'https://www.pmmag.com/articles/102057-water-heater-strapping'],
        ],
        learn: {
          how: 'In shaking, a tall tank acts like an upside-down pendulum: its weight wants to rock it over its base. Two straps tied to the house framing make the tank move with the wall instead of against it, and the lower strap stops the base from sliding out.',
          specs: [['Strap', '22-gauge or heavier steel, ≥ ¾″ wide'], ['Upper strap', 'Upper ⅓ of the tank'], ['Lower strap', 'Lower ⅓, ≥ 4″ above the controls'], ['Lags', '¼″ × 3″ with washers, ≥ 1½″ of thread in the stud'], ['Pilot hole', '5/32″–3/16″'], ['Gap to wall', '≤ 1″, else add blocking']],
          terms: [['Lag screw', 'Heavy hex-head wood screw driven with a socket.'], ['Flexible connector', 'Corrugated metal supply line that bends without cracking.'], ['Seismic strap', 'Steel band rated for earthquake restraint.'], ['T&P valve', 'Temperature-and-pressure relief valve that vents if the tank gets too hot or pressurized.']],
          mistakes: ['Plumber’s tape alone around half the tank.', 'Lagging into drywall or between studs.', 'A lower strap over the gas control.', 'Leaving a big gap behind the tank.'],
          tips: ['If the tank stands on a platform, anchor the platform too.', 'Some kits include metal conduit sleeves that stiffen the strap ends. Use them if included.', 'Tanks over about 52 gallons may need heavier straps or a third strap; follow the kit and your local code.'],
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
        summary: 'Dressers, bookcases and TVs tip onto children when drawers are climbed or pulled. A $10 strap kit screwed into a wall stud stops it. Do every tall piece in the house.',
        intro: { hi: ['dresser', 'tv'] },
        safety: [
          'Empty the top drawers before sliding a dresser away from the wall; it’s top-heavy and can tip on you.',
          'Wall screws go into studs, not plastic drywall anchors.',
          'Never set a TV on a dresser or bookcase that isn’t made to hold one.',
          'Check for wires and pipes: avoid drilling straight above or below outlets and switches.',
        ],
        causes: [
          ['Climbing', 'Open drawers turn a dresser into a ladder that tips forward under a child’s weight.'],
          ['Heavy top, light base', 'TVs and full top drawers raise the balance point.'],
          ['Uneven floor or thick carpet', 'A forward lean makes tipping much easier.'],
          ['Pulling on a TV', 'A flat-screen on narrow feet tips with a light tug on the edge.'],
        ],
        tools: ['Anti-tip strap kit (one per piece)', 'TV anti-tip strap kit (matches your TV’s screw size)', 'Stud finder', 'Drill/driver + ⅛″ bit', 'Phillips screwdriver', 'Pencil + tape measure'],
        steps: [
          {
            t: 'Spot the risks',
            d: 'Walk each room and list anything about 27″ tall or taller, plus every TV not on a wall mount: dressers, bookcases, wardrobes, media stands.',
            why: 'Most tip-over injuries involve children under 6 and furniture or TVs that weren’t anchored. Federal rules now require new dressers 27″ and up to resist tipping, but older pieces don’t.',
            tip: 'Give a gentle pull on the top edge of each piece. If it rocks forward at all, it goes on the list first.',
            ok: 'You have a list of every tall piece and TV, with a strap kit for each.',
            v: { cam: [1.4, 1.5, 2.8], at: [0, 0.8, 0.2], hi: ['dresser', 'tv'] },
          },
          {
            t: 'Pull it out and find a stud',
            d: 'Empty the top drawers and slide the dresser away from the wall. Slide the stud finder across the wall at about dresser height and mark the center of a stud that will sit behind the dresser’s top.',
            why: 'The strap needs to land in wood. Furniture rarely lines up with studs, so find one first and place the bracket to match.',
            tip: 'Confirm with a thin nail at your mark, low enough that the dresser hides the hole. Solid resistance means you hit wood.',
            ok: 'A pencil mark sits on a stud center behind where the dresser’s top will be.',
            v: { cam: [0.4, 1.6, 2.1], at: [-0.5, 1.1, 0.2], hi: ['finder', 'studs'], show: ['finder'], mv: { dresser: [0, 0, 0.5] }, xray: true },
          },
          {
            t: 'Mark the bracket height',
            d: 'Measure the height of the dresser’s top back rail (the solid board across the top of the back). Mark the stud about 2″ below that height.',
            why: 'Mounting the wall bracket slightly lower means the strap pulls back and down, the strongest direction.',
            tip: 'Measure the dresser’s height and subtract about 3″ so the bracket hides behind it once it’s pushed back.',
            ok: 'Your mark is on the stud, about 2″ lower than the furniture bracket will be.',
            v: { cam: [0.3, 1.5, 1.8], at: [-0.4, 1.1, 0], hi: ['marks'], show: ['marks'], hide: ['finder'] },
          },
          {
            t: 'Bracket on the furniture',
            d: 'Screw one bracket into the solid top back rail of the dresser with the short (about ⅝″) screw from the kit, lined up with the stud mark. Don’t screw into the thin back panel.',
            why: 'Back panels are often ⅛″ hardboard that tears right out. The top rail is solid wood.',
            tip: 'Make a starter hole with a ⅛″ bit or an awl so the screw goes in straight. If the screw might poke through the top, use a shorter one.',
            ok: 'The bracket doesn’t wiggle and the screw is in solid wood, not the thin back.',
            v: { cam: [0.3, 1.6, -0.35], at: [-0.4, 1.15, 0.5], hi: ['furnBracket'], show: ['furnBracket'], tool: { id: 'screwdriver', at: [-0.406, 1.172, 0.548], rot: [-90, 0, 0], anim: 'turn' } },
          },
          {
            t: 'Bracket on the wall',
            d: 'Drill a ⅛″ pilot hole at your mark, then drive the long (about 2″) screw through the wall bracket into the stud until it’s snug.',
            why: 'Over an inch of thread in the stud holds far more than a child can pull.',
            tip: 'If the screw spins without tightening, you’ve missed the stud. Move to the real stud, or use a toggle anchor rated for the weight, never a plastic plug.',
            ok: 'The wall bracket is tight and doesn’t move when you yank on it.',
            v: { cam: [0.3, 1.5, 1.6], at: [-0.4, 1.13, 0], hi: ['wallBracket'], show: ['wallBracket'], tool: { id: 'drill', at: [-0.406, 1.122, 0.006], rot: [90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Connect and take up slack',
            d: 'Push the dresser back so the two brackets line up vertically. Thread the strap through both brackets and pull it through its lock until all slack is gone.',
            why: 'Slack lets the dresser start tipping and pick up speed before the strap catches it.',
            tip: 'A cable-style kit with a turnbuckle (a twist adjuster) lets you take up the last bit of slack precisely.',
            ok: 'The strap is straight and taut, and the dresser can’t tilt forward more than a tiny bit.',
            v: { cam: [0.0, 1.7, 0.7], at: [-0.406, 1.17, 0.03], hi: ['strap'], show: ['strap'], hide: ['marks'], mv: { dresser: [0, 0, 0] }, xray: true },
          },
          {
            t: 'Strap the TV',
            d: 'Thread the TV strap bolts into the threaded holes on the back of the TV (the VESA holes, used for wall mounts). Screw the other brackets into a stud, or into the back of a heavy console, then tighten the straps.',
            why: 'A flat-screen on its narrow feet tips with a small tug on the edge.',
            tip: 'TV bolts are metric (usually M4, M6 or M8). If the kit bolt won’t thread easily, stop: wrong size. Check the TV manual; forcing it strips the hole.',
            ok: 'The TV can’t tip forward when you pull lightly on its top edge.',
            v: { cam: [1.6, 1.5, 1.5], at: [0.7, 1.05, 0.1], hi: ['tvStraps'], show: ['tvStraps'], xray: true },
          },
          {
            t: 'Test and load smart',
            d: 'Pull firmly on the top edge of each piece toward you. Put the heaviest things in the bottom drawers and keep toys and remotes off the top of furniture.',
            why: 'Testing proves the screws are in wood; heavy things low keep the balance point down.',
            tip: 'Never leave tempting things (toys, candy, remotes) on top of a dresser or TV stand; that’s what kids climb to reach.',
            ok: 'Each piece stays put when pulled, and the strap is tight.',
            v: { cam: [1.4, 1.5, 2.8], at: [0, 0.8, 0.2], hi: ['dresser', 'tv'], fx: 'tug' },
          },
        ],
        tricks: [
          ['Kit for every piece', 'Buy a multipack of strap kits so every tall piece gets done in one afternoon. Most are under $10 each.'],
          ['Felt under the front', 'On carpet, a thin shim or felt pad under the front feet tilts the piece slightly back toward the wall.'],
          ['Wall-mount the TV', 'A properly mounted TV on a wall mount screwed into studs can’t tip at all.'],
          ['Masonry walls', 'On brick or concrete, use masonry screws or sleeve anchors and a masonry bit instead of wood screws.'],
          ['Drawer stops', 'Some dressers have interlocks so only one drawer opens at a time; add them if yours doesn’t.'],
          ['Stripped screw hole', 'If a screw spins in the furniture rail, move the bracket over ½″ and use a new hole rather than a bigger screw.'],
          ['Renters', 'Small screw holes in studs are easy to fill with spackle when you move out, and most landlords allow tip-over anchors.'],
        ],
        refs: [
          ['How to install an anti-tip kit (CPSC Anchor It)', 'https://www.anchorit.gov/how-to-anchor/how-to-install-a-kit/'],
          ['What you’ll need to anchor furniture (CPSC Anchor It)', 'https://anchorit.gov/how-to-anchor/what-youll-need'],
          ['How to anchor furniture to prevent tip-overs (Consumer Reports)', 'https://www.consumerreports.org/home-garden/furniture/how-to-anchor-furniture-to-help-prevent-tip-overs-a4328328212/'],
          ['Secure your furniture (Natural Handyman)', 'https://www.naturalhandyman.com/iip/infsafety/infsecure_your_furniture.html'],
        ],
        learn: {
          how: 'A dresser tips when the weight in front of its front feet is more than the weight behind them. An open drawer with a child standing on it moves a lot of weight forward. A strap anchored to the wall makes the top of the piece part of the house, so it can’t rotate forward.',
          specs: [['Wall screw', '≈ 2″ into a stud'], ['Furniture screw', '≈ ⅝″ into the top rail'], ['Wall bracket', '≈ 2″ below the furniture bracket'], ['Furniture to anchor', '≈ 27″ and taller, and all TVs'], ['Pilot hole', '⅛″']],
          terms: [['Anti-tip kit', 'Two brackets and a strap or cable that tie furniture to the wall.'], ['VESA holes', 'Threaded holes on the back of a TV used by mounts and straps.'], ['Interlock', 'Dresser feature that lets only one drawer open at a time.'], ['Top rail', 'The solid board running across the top of a dresser’s back.']],
          mistakes: ['Screwing into the thin back panel.', 'Using plastic drywall anchors.', 'Leaving slack in the strap.', 'Putting a TV on top of a dresser.'],
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
        safety: [
          'Work from the stairs facing the wall; don’t lean out over an open side.',
          'Use studs or solid blocking only, never drywall anchors.',
          'Keep the stairs clear of tools, offcuts and cords while you work, and tell the household the stairs are a work zone.',
          'Wear safety glasses when cutting the rail on a miter saw and keep your hand at least 6″ from the blade.',
        ],
        causes: [
          ['When it’s required', 'The residential code calls for a handrail on any stair with four or more risers (the vertical boards between steps).'],
          ['Height', '34–38″ measured straight up from the nosing line (the line touching the front edge of every step).'],
          ['Grip', 'Round rail 1¼–2″ in diameter, or a shaped rail with a finger groove sized to code.'],
          ['Clearance', 'At least 1½″ between the rail and the wall.'],
          ['Length', 'Continuous from directly above the top riser to directly above the bottom riser, ends returned to the wall or a post.'],
        ],
        tools: ['Handrail (length of the run + 1 ft)', '3–4 handrail brackets with their screws (2½–3″ into the stud)', 'Return fittings or blocks + wood glue', 'Stud finder', '4 ft level + chalk line', 'Miter saw or fine-tooth handsaw + miter box', 'Drill/driver + ⅛″ bit', 'Tape measure + pencil', 'Painter’s tape'],
        steps: [
          {
            t: 'Measure the run',
            d: 'Measure along the slope from the front edge (nosing) of the top step down to the nosing of the bottom step. Add the extra length the return fittings need, per their package. The rail must run that whole length without breaks.',
            why: 'People reach for the rail on the first and last step. A rail that stops short leaves the most dangerous steps without support.',
            tip: 'Have a helper hold the tape at the top nosing while you read it at the bottom; a tape bridging the steps by itself sags and reads long.',
            ok: 'You have one number for the rail along the slope, plus the return allowance written down.',
            v: { cam: [3.8, 2.3, 3.6], at: [1.3, 1.3, 0.3], hi: ['stairs'], tool: { id: 'tape', at: [0.735, 0.95, 0.4], rot: [0, 0, 0] } },
          },
          {
            t: 'Find the studs',
            d: 'Slide the stud finder along the wall above the stairs at about rail height and mark every stud center with a pencil tick. Studs are usually 16″ apart.',
            why: 'Brackets must land on studs (or solid blocking), so the studs decide where brackets can go.',
            tip: 'Check each stud with a thin finish nail where a bracket will hide the hole. If it pushes in easily, you’re off the wood; try ¾″ to either side.',
            ok: 'You have confirmed stud marks along the whole length of the stair.',
            v: { cam: [2.6, 2.2, 2.4], at: [1.4, 1.6, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true },
          },
          {
            t: 'Snap the rail line',
            d: 'At the top and bottom nosings, measure 36″ straight up (use a level to keep the tape vertical) and mark. Snap a chalk line between the marks. The top of the rail will follow this line.',
            why: 'Measuring from the nosings keeps the rail at the same height above every step, inside the 34–38″ the code allows.',
            tip: 'Lay painter’s tape along the wall first and snap the line on the tape; it peels off clean with no chalk stain on the paint.',
            ok: 'A straight line runs parallel to the stair, 36″ above the nosings at both ends.',
            v: { cam: [3.2, 2.2, 2.8], at: [1.3, 1.6, 0], hi: ['layout'], show: ['layout'], hide: ['finder'], tool: { id: 'tape', at: [1.245, 1.33, 0.04], rot: [0, 0, 0] } },
          },
          {
            t: 'Mount the brackets',
            d: 'Plan a bracket within about 12″ of each end and the rest no more than 48″ apart, all on studs. Hold a bracket so the rail top would meet the line (a scrap of rail in the saddle helps), drill ⅛″ pilot holes and drive the screws.',
            why: 'Close spacing stops the rail from flexing; brackets near the ends keep them from bouncing.',
            tip: 'Make a story stick: a scrap of rail with the bracket screwed to it. Set it on the line for every bracket so each one lands at exactly the same drop.',
            ok: 'Each bracket is tight to the wall and a straightedge laid across the saddles touches all of them.',
            v: { cam: [2.4, 2.0, 1.4], at: [1.418, 1.9, 0], hi: ['brackets'], show: ['brackets'], tool: { id: 'drill', at: [1.418, railY(1.418) - 0.057, 0.01], rot: [90, 0, 0], anim: 'spin' } },
          },
          {
            t: 'Cut and dry-fit the rail',
            d: 'Cut the rail to length with a fine-tooth saw. Set it on the brackets to check the fit before fastening anything.',
            why: 'Recutting a mounted rail is awkward; checking first catches a short cut or a bracket out of line.',
            tip: 'Cut it ¼″ long first and trim to fit. If you cut too short, the return fittings can sometimes make up the gap; otherwise buy a new length.',
            ok: 'The rail sits in every saddle, ends where the returns will meet it, with no gaps.',
            v: { cam: [3.8, 2.4, 3.4], at: [1.3, 1.5, 0.3], hi: ['rail'], show: ['rail'], mv: { rail: [0, 0, 0.35] } },
          },
          {
            t: 'Screw the rail to the brackets',
            d: 'Set the rail in the saddles (the curved tops of the brackets) and drive the short screws up through each saddle into the bottom of the rail.',
            why: 'Screwing from underneath keeps the top of the rail smooth for your hand.',
            tip: 'Drill small pilot holes first so hardwood rails don’t split. Check the screw length so it can’t poke through the top.',
            ok: 'The rail won’t slide or lift off any bracket.',
            v: { cam: [2.2, 1.4, 1.6], at: [1.418, 1.9, 0.05], hi: ['rail', 'brackets'], mv: { rail: [0, 0, 0] }, tool: { id: 'screwdriver', at: [1.418, railY(1.418) - 0.03, ST.zc], rot: [180, 0, 0], anim: 'turn' } },
          },
          {
            t: 'Add returns at both ends',
            d: 'Glue and screw a return fitting (a curved end piece) at each end so the rail turns back into the wall.',
            why: 'Returns stop sleeves, bag straps and dog leashes from catching on an open rail end and yanking someone off balance.',
            tip: 'Wipe any glue that squeezes out with a damp rag right away; dried glue blocks stain and leaves a blotch.',
            ok: 'Both ends curve back and stop at or very near the wall, with no open end sticking out.',
            v: { cam: [0.9, 1.6, 1.4], at: [0, 1.15, 0.05], hi: ['returns'], show: ['returns'] },
          },
          {
            t: 'Test it',
            d: 'Lean your weight out and down on the rail at several points along its length.',
            why: 'The code requires a handrail to hold a 200 lb load from any direction.',
            tip: 'If one spot flexes, add a bracket there into a stud. If a bracket moves, its screws missed the wood: redrill into the stud.',
            ok: 'No creak, flex or movement anywhere, and your hand slides the full length without hitting a bracket or screw.',
            v: { cam: [3.8, 2.3, 3.6], at: [1.3, 1.3, 0.3], hi: ['rail'], hide: ['layout'], fx: 'pull' },
          },
        ],
        tricks: [
          ['Finish before mounting', 'Stain and seal the rail on sawhorses first; it’s much easier than finishing it on the wall.'],
          ['Laser line', 'A laser level set to the stair angle projects the rail line in seconds and keeps all brackets in line.'],
          ['No stud where you need one', 'Screw a painted 1×4 board across several studs, then mount the brackets to that board.'],
          ['Choose a graspable rail', 'A round rail 1½–1¾″ thick is easiest to grip; wide flat boards don’t meet the grip rule.'],
          ['Pre-made return kits', 'Most home stores sell matching return fittings for common rail shapes, which saves fiddly angled cuts.'],
          ['Plaster walls', 'Drill plaster with a masonry bit through the plaster only, then switch to a wood bit; it cracks less.'],
        ],
        refs: [
          ['IRC R311.7.8 Handrails (ICC)', 'https://codes.iccsafe.org/content/IRC2021P1/chapter-3-building-planning#IRC2021P1_Pt03_Ch03_SecR311.7.8'],
          ['Residential handrails and guards (Spokane County)', 'https://www.spokanecounty.gov/DocumentCenter/View/59210/BP-21-Residential-Handrails-and-Guards'],
          ['Rules for wall-mounted handrail returns (JLC)', 'https://www.jlconline.com/?p=106591'],
          ['Handrail bracket installation guide (BuyRailings)', 'https://www.buyrailings.com/blog/buy-railings-1/putting-up-a-handrail-the-complete-diy-bracket-installation-guide-130'],
        ],
        learn: {
          how: 'A handrail is something to grab, not just a barrier. The code limits its shape so a hand can wrap around it and hold tight during a slip, and sets the height so it stays in the same place relative to your feet on every step. Brackets carry the load to the studs. Returns prevent snagging.',
          specs: [['Height', '34–38″ above the nosing line'], ['Round diameter', '1¼–2″'], ['Wall clearance', '≥ 1½″'], ['Bracket spacing', '≤ 48″; within about 12″ of each end'], ['Required on', '4 or more risers'], ['Load', '200 lb from any direction']],
          terms: [['Nosing', 'The front edge of each step.'], ['Riser', 'The vertical board between two steps.'], ['Return', 'Rail end that turns back into the wall.'], ['Saddle', 'The curved top of a bracket the rail sits in.']],
          mistakes: ['Measuring height from the floor at the bottom only.', 'Brackets screwed into drywall.', 'Stopping the rail a step short.', 'Leaving the rail ends open.'],
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
        safety: [
          'Never use a pressure-mounted gate (one held in by squeezing against the walls) at the top of stairs. A child pushing on it can pop it out and fall with it.',
          'The gate must never swing out over the stairs.',
          'Avoid old accordion gates with diamond or V-shaped openings that can trap a head or neck.',
          'Remove the gate once your child can climb it or turns 2; gates are designed for ages 6–24 months.',
        ],
        causes: [
          ['Top of stairs', 'Hardware-mounted gate, screwed in, swinging onto the landing only.'],
          ['Bottom of stairs', 'A pressure gate is acceptable there, though hardware-mounted is still stronger.'],
          ['Newel or banister on one side', 'Use a banister kit so you don’t drill the post.'],
          ['Gate standard', 'Look for JPMA certification to ASTM F1004, the federal gate standard.'],
        ],
        tools: ['Hardware-mounted gate rated for the top of stairs', 'Banister mounting kit (if one side is a post)', 'Stud finder', 'Level', 'Drill/driver + ⅛″ bit', 'Phillips screwdriver', 'Tape measure + pencil'],
        steps: [
          {
            t: 'Measure and choose the gate',
            d: 'Measure the opening at the top of the stairs, wall to post, at the bottom and at about 30″ high. Buy a hardware-mounted gate labeled for top-of-stairs use whose width range includes that measurement.',
            why: 'Only a screwed-in gate resists a toddler pushing, pulling and climbing.',
            tip: 'Measure at both heights: baseboards and posts often make the opening narrower at the floor. Buy for the narrower one and check the extension kits the brand sells.',
            ok: 'Your measurement falls inside the width range printed on the gate box, and the box says top-of-stairs.',
            v: { cam: [2.2, BG.H + 1.25, -1.9], at: [0.45, BG.H + 0.35, 0.1], hi: ['newel', 'wall'] },
          },
          {
            t: 'Find a stud on the wall side',
            d: 'Slide the stud finder along the wall where the gate will hinge, right at the top step, and mark the stud center. If no stud lines up, screw a 1×4 board across two studs and mount the hinges to the board.',
            why: 'Hinge screws in drywall alone pull out under a determined child.',
            tip: 'Place the gate on the landing at the top step, not one step down, so it can’t swing out over the stairs.',
            ok: 'You have a confirmed stud (or board) right where the hinges will go.',
            v: { cam: [1.6, BG.H + 0.9, -1.2], at: [0, BG.H + 0.4, 0], hi: ['finder', 'studs'], show: ['finder'], xray: true },
          },
          {
            t: 'Strap on the banister kit',
            d: 'Wrap the kit’s straps around the newel post (the thick post at the top of the railing) and tighten them so the mounting board sits plumb (straight up and down) and doesn’t slide.',
            why: 'The kit gives the latch a solid place to screw into without drilling or damaging the post.',
            tip: 'Pull each strap tight in turns, top then bottom, and check with a level. If it slides down the post, add the rubber pads from the kit or a non-slip shelf liner behind it.',
            ok: 'The board is plumb and doesn’t twist or slip when you push it hard.',
            v: { cam: [1.6, BG.H + 0.9, -1.1], at: [0.92, BG.H + 0.45, BG.gz], hi: ['postKit', 'newel'], show: ['postKit'], hide: ['finder'], tool: { id: 'screwdriver', at: [0.913, BG.H + 0.65, BG.gz + 0.03], rot: [0, 0, 90], anim: 'turn' } },
          },
          {
            t: 'Mark matching heights',
            d: 'Hold the gate in place or use its template to mark the hinge heights on the stud. Use the level to carry the same heights across to the banister kit for the latch. Set it so the bottom bar ends up close to the floor, within the gap the instructions allow.',
            why: 'Level hinges and latch let the gate swing freely and lock every time. A big bottom gap lets a child squeeze under.',
            tip: 'Rest the gate on two paperback books while marking; it holds a consistent small gap under the bottom bar.',
            ok: 'Hinge and latch marks are level with each other and the bottom gap meets the manual’s limit.',
            v: { cam: [1.6, BG.H + 0.8, -1.3], at: [0.45, BG.H + 0.4, BG.gz], hi: ['marks'], show: ['marks'], tool: { id: 'level', at: [0.45, BG.H + 0.63, BG.gz], rot: [0, 0, 90], scale: 0.75 } },
          },
          {
            t: 'Screw the hinges to the stud',
            d: 'Drill ⅛″ pilot holes at the marks and drive the hinge screws into the stud until snug.',
            why: 'Pilot holes keep the screws straight and stop the stud from splitting near its edge.',
            tip: 'If a screw spins without tightening, it’s not in wood. Move the hinge onto the stud or the 1×4 board; don’t switch to a plastic anchor.',
            ok: 'The hinges don’t move at all when you pull on them.',
            v: { cam: [1.0, BG.H + 0.7, -0.8], at: [0, BG.H + 0.4, BG.gz], hi: ['wallHinges'], show: ['wallHinges'], tool: { id: 'drill', at: [0.008, BG.H + 0.64, BG.gz], rot: [0, 0, -90], anim: 'spin' } },
          },
          {
            t: 'Hang the gate',
            d: 'Drop the gate onto its hinges and adjust its width so it reaches the latch side with the small, even gap the manual specifies.',
            why: 'A gap wider than spec lets the latch slip; too tight and the gate binds and won’t close by itself.',
            tip: 'Adjust a little at a time and swing it each time: you want it to close without dragging.',
            ok: 'The gate swings freely and the gap at the latch side matches the manual.',
            v: { cam: [2.0, BG.H + 1.0, -1.6], at: [0.45, BG.H + 0.4, BG.gz], hi: ['gate'], show: ['gate'], hide: ['marks'] },
          },
          {
            t: 'Mount the latch',
            d: 'Screw the latch catch to the banister kit at your marks, with its stop on the stair side.',
            why: 'The stop is what keeps the gate from ever swinging out over the steps.',
            tip: 'Close the gate against the latch before driving the last screw; you’ll hear a clean click when it’s lined up right.',
            ok: 'The gate clicks shut into the latch and the stop sits on the stair side.',
            v: { cam: [1.5, BG.H + 1.0, -1.0], at: [0.9, BG.H + 0.7, BG.gz], hi: ['latch'], show: ['latch'], tool: { id: 'screwdriver', at: [0.905, BG.H + 0.74, BG.gz + 0.012], rot: [0, 0, 90], anim: 'turn' } },
          },
          {
            t: 'Set the one-way swing',
            d: 'Set the gate’s swing control (often a small tab or stopper) so it opens only toward the landing, then open it fully to check it never moves over the stairs.',
            why: 'Opening toward the landing means you never step backward onto the stairs while holding the gate or a child.',
            tip: 'Try pushing the closed gate toward the stairs as hard as you can. If it opens that way even a little, the stop is set wrong.',
            ok: 'The gate opens toward the landing only and won’t budge toward the stairs.',
            v: { cam: [2.0, BG.H + 1.2, -1.8], at: [0.4, BG.H + 0.4, -0.3], hi: ['gate'], rt: { gate: [0, 75, 0] } },
          },
          {
            t: 'Close and test',
            d: 'Close it and confirm it latches every time. Push and pull hard on the top bar, then try to lift it off its hinges. Check the screws and banister straps monthly.',
            why: 'A gate that doesn’t latch reliably gets left open, and an open gate protects nothing.',
            tip: 'If it bounces open, it’s usually out of plumb: re-level the banister kit and recheck the hinge heights.',
            ok: 'It clicks shut ten times out of ten and doesn’t move or lift off when you push, pull and lift.',
            v: { cam: [2.2, BG.H + 1.25, -1.9], at: [0.45, BG.H + 0.35, 0.1], hi: ['latch', 'gate'], rt: { gate: [0, 0, 0] } },
          },
        ],
        tricks: [
          ['Kit first, hinges second', 'Install the banister kit first; it decides where the gate and wall hinges must go.'],
          ['Same gate top and bottom', 'Using the same model at both ends means the latch works the same way every time.'],
          ['Auto-close is worth it', 'A gate that swings shut and latches by itself won’t get left open by a busy adult.'],
          ['Angled openings', 'For openings that aren’t straight across, buy a gate with swivel mounts or a hinged multi-panel gate.'],
          ['Renting', 'A banister kit on both sides (one on the post, one on a wall board) can avoid most drilling.'],
          ['Stripped screw in the stud', 'Move the hinge up or down ½″ and drill a fresh pilot rather than using a bigger screw.'],
        ],
        refs: [
          ['Baby safety gates (CPSC)', 'https://www.cpsc.gov/safety-education/safety-guides/kids-and-babies/baby-safety-gates'],
          ['Choosing safe baby products: gates (KidsHealth / Nemours)', 'https://kidshealth.org/en/parents/products-gates.html'],
          ['Top-of-stairs gate installation (Babyproof Me)', 'https://babyproofme.com/blogs/the-parenting-journal/top-of-stairs-baby-gate-installation-hardware-mount-best-practices'],
          ['How to install a baby gate wall to banister (The Stair Barrier)', 'https://thestairbarrier.com/blogs/the-stair-barrier-blog/how-to-install-baby-gate-wall-to-banister'],
        ],
        learn: {
          how: 'A pressure gate holds by friction against the walls, which works at floor level but can let go when a child leans on it. A hardware-mounted gate is screwed to the framing, so it holds against far more force. Swinging only toward the landing keeps the gate itself from becoming a fall hazard over the stairs.',
          specs: [['Gate height', '≥ 22″ (most are 29–32″)'], ['Slat spacing', '≤ about 2⅜″'], ['Bottom gap', 'Within the manual’s limit, usually 1–2″'], ['Ages', '6–24 months'], ['Standard', 'ASTM F1004 / JPMA certified']],
          terms: [['Hardware-mounted', 'Screwed into the wall or post.'], ['Pressure-mounted', 'Held by tension against the walls; bottom of stairs only.'], ['Banister kit', 'Strap-on adapter that gives a gate something to screw into on a round or square post.'], ['Newel post', 'The thick post at the end of a stair railing.']],
          mistakes: ['A pressure gate at the top of stairs.', 'Gate swinging over the stairs.', 'Hinges screwed into drywall only.', 'Leaving the gate up after the child can climb it.'],
          tips: ['Take the gate down once the child can climb it or turns 2, whichever comes first.', 'Use the same gate model at the bottom and top so the latch works the same way.'],
        },
        pro: 'The opening is wider than any gate kit, the wall is plaster or stone, or you want a custom gate built to match the stair.',
      },
    ],
  });
})();
