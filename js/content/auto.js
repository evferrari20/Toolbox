/* AUT · Auto */
(function () {
  function carFront(K, name, x, dir, color, label) {
    const c = K.part(name, [x, 0, 0], null, label);
    K.box(c, [1.4, 0.55, 1.7], color, [-dir * 0.4, 0.55, 0]);
    K.box(c, [0.2, 0.25, 1.7], 'dark', [dir * 0.32, 0.4, 0]);
    [-0.6, 0.6].forEach((z) => {
      K.cyl(c, [0.3, 0.3, 0.22], 'rubber', [-dir * 0.1, 0.3, z * 1.25], [90, 0, 0]);
      K.cyl(c, [0.17, 0.17, 0.23], 'steel', [-dir * 0.1, 0.3, z * 1.25], [90, 0, 0]);
      K.sph(c, 0.08, 'offwhite', [dir * 0.38, 0.6, z], [0.4, 1, 1.2]);
    });
    K.box(c, [0.9, 0.2, 1.3], 'grey', [-dir * 0.45, 0.85, 0]);
    const hood = K.group(c, [-dir * 1.1, 0.84, 0], [0, 0, dir * 60]);
    K.box(hood, [1.2, 0.04, 1.6], color, [dir * 0.6, 0, 0]);
    const bat = K.group(c, [dir * 0.05, 0.95, 0.4]);
    K.box(bat, [0.3, 0.22, 0.24], 'black');
    K.cyl(bat, [0.03, 0.03, 0.06], 'red', [0, 0.13, 0.07]);
    K.cyl(bat, [0.03, 0.03, 0.06], 'dark', [0, 0.13, -0.07]);
    K.box(bat, [0.06, 0.005, 0.02], 'red', [0.08, 0.111, 0.07]);
    K.box(bat, [0.06, 0.005, 0.02], 'offwhite', [0.08, 0.111, -0.07]);
    return c;
  }
  function clamp(K, parent, pos, color) {
    const g = K.group(parent, pos);
    K.box(g, [0.05, 0.1, 0.12], color, [0, 0.02, 0]);
    K.box(g, [0.04, 0.04, 0.16], color, [0, 0.1, 0], [20, 0, 0]);
    return g;
  }

  /* ---- Model: two cars nose to nose for a jump start ---- */
  TB.model('jumpstart', { cam: [0.6, 3.4, 5.0], at: [0, 0.7, 0], hidden: ['redDead', 'redGood', 'blackGood', 'blackGround'] }, (K) => {
    K.box(null, [6, 0.02, 4], 'asphalt', [0, -0.01, 0]);
    carFront(K, 'deadCar', -1.4, 1, K.std(0x7fa7c9), 'Dead car');
    carFront(K, 'goodCar', 1.4, -1, K.std(0xc9c3b6), 'Helper car');
    const dPos = [-1.35, 1.1, 0.47];
    const gPos = [1.35, 1.1, 0.47];
    const gNeg = [1.35, 1.1, 0.33];
    const gnd = [-1.75, 0.98, -0.2];
    const groundBolt = K.part('groundPoint', gnd, null, 'Bare metal ground point');
    K.cyl(groundBolt, [0.04, 0.04, 0.04, 6], 'chrome', [0, -0.04, 0]);
    const parts = [
      ['redDead', dPos, 'red', [0, 0.45, 0.9], '1 · Red to dead +'],
      ['redGood', gPos, 'red', [0, 0.45, 0.9], '2 · Red to helper +'],
      ['blackGood', gNeg, 'black', [0, 0.4, 0.8], '3 · Black to helper −'],
      ['blackGround', gnd, 'black', [0, 0.4, 0.8], '4 · Black to bare metal'],
    ];
    for (const [n, p, col, mid, label] of parts) {
      const g = K.part(n, [0, 0, 0], null, label);
      clamp(K, g, p, col);
      K.tube(g, [[p[0], p[1] + 0.15, p[2]], [p[0] * 0.6, p[1] + 0.1, p[2] + 0.3], [mid[0] + p[0] * 0.2, mid[1], mid[2]]], 0.022, col);
    }
    return {};
  });

  /* ---- Model: car corner with flat tire, jack and spare ---- */
  TB.model('wheel', { cam: [3.0, 1.6, 4.2], at: [0.2, 0.6, 0.4], hidden: ['spare', 'wrench'] }, (K) => {
    K.box(null, [6, 0.02, 4], 'asphalt', [0, -0.01, 0]);
    const car = K.part('car', [0, 0, 0], null, 'Car');
    K.box(car, [2.8, 0.55, 1.6], K.std(0x8fb3cf), [0, 0.68, 0]);
    K.box(car, [1.6, 0.45, 1.5], K.std(0x8fb3cf), [-0.4, 1.15, 0]);
    K.box(car, [1.5, 0.35, 1.52], 'glass', [-0.4, 1.17, 0]);
    K.box(car, [2.8, 0.06, 1.62], 'dark', [0, 0.4, 0]);
    // rear wheel (not changing)
    K.cyl(car, [0.32, 0.32, 0.22], 'rubber', [-0.95, 0.33, 0.72], [90, 0, 0]);
    K.cyl(car, [0.18, 0.18, 0.23], 'steel', [-0.95, 0.33, 0.72], [90, 0, 0]);
    const wheel = K.part('wheel', [0.9, 0.31, 0.72], car, 'Flat tire');
    const tire = K.cyl(wheel, [0.32, 0.32, 0.22], 'rubber', [0, 0, 0], [90, 0, 0]);
    tire.scale.set(1, 1, 0.93);
    K.cyl(wheel, [0.2, 0.2, 0.23], 'steel', [0, 0, 0], [90, 0, 0]);
    const lugs = K.part('lugs', [0, 0, 0.12], wheel, 'Lug nuts');
    K.rep(5, (i) => K.cyl(lugs, [0.025, 0.025, 0.04, 6], 'chrome', [Math.cos(i * 1.2566) * 0.09, Math.sin(i * 1.2566) * 0.09, 0], [90, 0, 0]));
    const spare = K.part('spare', [0.9, 0.33, 1.5], car, 'Spare tire');
    K.cyl(spare, [0.3, 0.3, 0.18], 'rubber', [0, 0, 0], [90, 0, 0]);
    K.cyl(spare, [0.18, 0.18, 0.19], 'yellow', [0, 0, 0], [90, 0, 0]);
    const jp = K.part('jackPoint', [0.45, 0.38, 0.8], null, 'Jack point (pinch weld)');
    K.box(jp, [0.15, 0.02, 0.02], 'red');
    const jack = K.part('jack', [0.45, 0, 0.75], null, 'Scissor jack');
    K.box(jack, [0.4, 0.05, 0.12], 'dark', [0, 0.025, 0]);
    const jt = K.part('jackTop', [0, 0.32, 0], jack, 'Jack saddle');
    K.box(jt, [0.15, 0.04, 0.1], 'dark');
    K.bar(jack, [-0.18, 0.05, 0], [0, 0.18, 0], 0.015, 'grey');
    K.bar(jack, [0.18, 0.05, 0], [0, 0.18, 0], 0.015, 'grey');
    K.bar(jack, [0, 0.18, 0], [0, 0.31, 0], 0.012, 'grey');
    K.bar(jack, [-0.25, 0.18, 0], [0.2, 0.18, 0], 0.01, 'steel');
    const wedge = K.part('wedge', [-0.95, 0.06, 0.95], null, 'Wheel wedge');
    K.ext(wedge, [[-0.12, 0], [0.12, 0], [-0.12, 0.14]], 0.14, 'yellow', [0, -0.06, -0.07]);
    const wr = K.part('wrench', [0.9, 0.31, 1.0], null, 'Lug wrench');
    K.bar(wr, [0, 0, 0], [0.35, -0.15, 0], 0.015, 'steel');
    K.cyl(wr, [0.035, 0.035, 0.08, 6], 'steel', [0, 0, -0.03], [90, 0, 0]);
    const haz = [K.sph(car, 0.05, K.std(0xffb54a, { emissive: 0xff9a00, emissiveIntensity: 0.1 }), [1.38, 0.75, 0.6]), K.sph(car, 0.05, K.std(0xffb54a, { emissive: 0xff9a00, emissiveIntensity: 0.1 }), [-1.38, 0.75, 0.6])];
    return {
      tick(t, fx) {
        const on = fx === 'hazard' && Math.sin(t * 6) > 0;
        haz.forEach((h) => (h.material.emissiveIntensity = on ? 1.4 : 0.1));
      },
    };
  });

  /* ---- Model: engine bay ---- */
  TB.model('engine', { cam: [1.6, 2.6, 2.2], at: [0, 0.8, 0], hidden: ['funnel', 'oilBottle'] }, (K) => {
    const body = K.part('body', [0, 0, 0], null, 'Engine bay');
    K.box(body, [0.1, 0.6, 1.8], K.std(0x8fb3cf), [-0.9, 0.5, 0]);
    K.box(body, [0.1, 0.6, 1.8], K.std(0x8fb3cf), [0.9, 0.5, 0]);
    K.box(body, [1.9, 0.6, 0.1], 'dark', [0, 0.5, 0.9]);
    K.box(body, [1.9, 0.1, 1.8], 'black', [0, 0.2, 0]);
    const hood = K.group(body, [0, 0.82, -0.9], [-70, 0, 0]);
    K.box(hood, [1.9, 0.04, 1.8], K.std(0x8fb3cf), [0, 0, 0.9]);
    K.bar(body, [0.7, 0.8, 0.6], [0.7, 1.9, -0.6], 0.012, 'steel');
    const eng = K.part('engineBlock', [0, 0.55, -0.05], null, 'Engine');
    K.box(eng, [0.9, 0.5, 0.6], 'grey');
    K.box(eng, [0.85, 0.1, 0.5], 'dark', [0, 0.3, 0]);
    const cap = K.part('oilCap', [-0.2, 0.37, 0.05], eng, 'Oil filler cap');
    K.cyl(cap, [0.06, 0.06, 0.05], 'yellow');
    const dip = K.part('dipstick', [0.25, 0.3, 0.32], eng, 'Dipstick');
    K.tor(dip, [0.05, 0.012], 'yellow', [0, 0.12, 0]);
    K.cyl(dip, [0.008, 0.008, 0.7], 'steel', [0, -0.25, 0]);
    const mark = K.part('marks', [0, -0.55, 0], dip, 'MIN / MAX marks');
    K.box(mark, [0.03, 0.08, 0.012], 'red');
    const cool = K.part('coolant', [0.6, 0.62, -0.25], null, 'Coolant reservoir');
    K.box(cool, [0.2, 0.25, 0.25], K.std(0xe7e3da, { transparent: true, opacity: 0.6 }));
    K.box(cool, [0.18, 0.14, 0.23], K.std(0x6fd1a0, { transparent: true, opacity: 0.85 }), [0, -0.05, 0]);
    K.cyl(cool, [0.05, 0.05, 0.04], 'black', [0, 0.14, 0]);
    const wash = K.part('washer', [-0.6, 0.6, 0.5], null, 'Washer fluid');
    K.box(wash, [0.2, 0.22, 0.2], K.std(0xe7e3da, { transparent: true, opacity: 0.6 }));
    K.cyl(wash, [0.05, 0.05, 0.04], 'blue', [0, 0.13, 0]);
    const bat = K.part('battery', [-0.6, 0.55, -0.45], null, 'Battery');
    K.box(bat, [0.3, 0.22, 0.25], 'black');
    K.cyl(bat, [0.03, 0.03, 0.05], 'red', [0.08, 0.13, 0]);
    const fun = K.part('funnel', [-0.2, 1.15, 0.0], null, 'Funnel');
    K.cone(fun, [0.12, 0.2], 'offwhite', [0, 0, 0], [180, 0, 0]);
    const ob = K.part('oilBottle', [-0.2, 1.5, 0.05], null, 'Correct motor oil');
    K.box(ob, [0.18, 0.28, 0.08], 'yellow', [0, 0, 0], [0, 0, 120]);
    return {};
  });

  /* ---- Model: windshield & wiper ---- */
  TB.model('wiper', { cam: [1.4, 2.2, 2.4], at: [0, 1.0, 0], hidden: ['newBlade', 'towel'] }, (K) => {
    K.box(null, [2.6, 0.6, 1.4], K.std(0x8fb3cf), [0, 0.5, 0.7]);
    const glass = K.group(null, [0, 0.8, 0], [-55, 0, 0]);
    K.box(glass, [2.2, 1.2, 0.02], 'glass', [0, 0.6, 0]);
    K.box(null, [2.4, 0.08, 0.2], 'black', [0, 0.82, 0.05]);
    const towel = K.part('towel', [0.25, 0.4, 0.01], glass, 'Folded towel');
    K.box(towel, [0.4, 0.3, 0.03], 'sky');
    const arm = K.part('arm', [0.3, 0.86, 0.05], null, 'Wiper arm');
    const armG = K.group(arm, [0, 0, 0], [-55, 0, 0]);
    K.box(armG, [0.04, 0.85, 0.03], 'black', [-0.05, 0.42, 0.04], [0, 0, 8]);
    K.cyl(arm, [0.05, 0.05, 0.06], 'black', [0, 0, 0], [90, 0, 0]);
    const blade = K.part('blade', [-0.1, 0.45, 0.08], armG, 'Wiper blade');
    const old = K.part('bladeOld', [0, 0, 0], blade, 'Old blade');
    K.box(old, [0.05, 0.9, 0.04], 'dark', [0, 0, 0]);
    K.box(old, [0.02, 0.9, 0.02], K.std(0x6a6a6a), [0, 0, -0.03]);
    const tab = K.part('tab', [0, 0, 0.04], blade, 'Release tab');
    K.box(tab, [0.04, 0.06, 0.03], 'grey');
    const nb = K.part('newBlade', [0.6, 0, 0.1], blade, 'New blade (right length)');
    K.box(nb, [0.05, 0.9, 0.04], 'black');
    K.box(nb, [0.02, 0.9, 0.02], 'rubber', [0, 0, -0.03]);
    return {};
  });

  TB.category({
    id: 'auto',
    code: 'AUT',
    name: 'Auto',
    domain: 'vehicles',
    blurb: 'Jump starts, flat tires, fluids and wipers',
    repairs: [
      {
        id: 'jump-start',
        title: 'Jump-start a dead battery',
        model: 'jumpstart',
        level: 1,
        time: '15 min',
        cost: '$0',
        summary: 'Clicking or no crank with dim lights usually means a dead battery. Connect the cables in the right order and you’re running in minutes.',
        intro: { hi: ['deadCar', 'goodCar'] },
        safety: ['Batteries can vent explosive hydrogen gas. The last clamp goes on bare metal away from the dead battery so any spark happens away from it.', 'Never jump a cracked, leaking or frozen battery.', 'Keep cable clamps from touching each other once any end is connected.'],
        causes: [['Lights left on', 'Drained overnight.'], ['Old battery', 'Most last 3–5 years.'], ['Cold weather', 'Chemical reactions slow and the engine is harder to crank.'], ['Charging fault', 'If it dies again soon, the alternator may be failing.']],
        tools: ['Jumper cables (4–6 gauge, 12+ ft)', 'Helper car (or a jump pack)', 'Gloves & safety glasses'],
        steps: [
          { t: 'Park nose to nose, both off', d: 'Pull the helper car close without the cars touching. Turn both off, parking brakes on, and open the hoods.', why: 'Cars touching each other can create an unintended ground path.', v: { cam: [0.6, 3.4, 5.0], at: [0, 0.7, 0], hi: ['deadCar', 'goodCar'] } },
          { t: 'Red to dead +', d: 'Clamp one red end to the dead battery’s positive (+) terminal.', why: 'Connect the dead battery first, while nothing else is live yet.', v: { cam: [-0.6, 2.0, 1.6], at: [-1.3, 1.0, 0.4], hi: ['redDead'], show: ['redDead'] } },
          { t: 'Red to helper +', d: 'Clamp the other red end to the helper battery’s positive (+) terminal.', why: 'Now both positives are linked. The black clamps must not touch anything metal.', v: { cam: [0.6, 2.0, 1.6], at: [1.3, 1.0, 0.4], hi: ['redGood'], show: ['redGood'] } },
          { t: 'Black to helper −', d: 'Clamp one black end to the helper battery’s negative (−) terminal.', why: 'This completes the good side of the circuit.', v: { cam: [0.6, 2.0, 1.6], at: [1.3, 1.0, 0.3], hi: ['blackGood'], show: ['blackGood'] } },
          { t: 'Black to bare metal', d: 'Clamp the last black end to unpainted metal on the dead car’s engine, away from the battery.', why: 'The final connection can spark. Keeping it away from the battery keeps that spark away from any hydrogen gas.', v: { cam: [-0.8, 2.0, 1.2], at: [-1.6, 0.95, -0.1], hi: ['blackGround', 'groundPoint'], show: ['blackGround'] } },
          { t: 'Start and charge', d: 'Start the helper car and let it run 3–5 minutes. Then try the dead car. Once it runs, remove cables in reverse order.', why: 'The helper’s alternator puts some charge into the dead battery first, which makes starting easier.', v: { cam: [0.6, 3.4, 5.0], at: [0, 0.7, 0], hi: ['redDead', 'redGood', 'blackGood', 'blackGround'] } },
        ],
        learn: {
          how: 'A car battery stores energy chemically: lead plates in sulfuric acid. Starting takes a huge burst of current, 100–300 amps for a few seconds. The jumper cables put the healthy battery in parallel with the weak one, so together they can supply that burst. After it starts, the alternator recharges the battery as you drive.',
          specs: [['Healthy battery (rest)', '12.6 V'], ['Needs charge', '< 12.2 V'], ['Running voltage', '13.7–14.7 V'], ['Drive after jump', '≥ 30 min']],
          terms: [['CCA', 'Cold Cranking Amps: starting power at 0 °F.'], ['Alternator', 'Engine-driven generator that charges the battery.'], ['Parallel', 'Positives joined and negatives joined.']],
          mistakes: ['Connecting the last black clamp to the dead battery’s − post.', 'Letting clamps touch.', 'Revving the helper engine hard.'],
          tips: ['A $60–100 lithium jump pack means you don’t need a second car.', 'Most auto parts stores test batteries and alternators for free.'],
        },
        pro: 'The car doesn’t start after two tries, the battery is swollen or leaking, or it dies again within days (charging system).',
      },
      {
        id: 'flat-tire',
        title: 'Change a flat tire',
        model: 'wheel',
        level: 2,
        time: '30 min',
        cost: '$0',
        summary: 'Loosen the lug nuts while the tire is on the ground, jack at the factory jack point, swap on the spare, and tighten in a star pattern.',
        intro: { hi: ['wheel', 'jackPoint'] },
        safety: ['Get well off the road on flat, firm ground. Hazards on, parking brake set.', 'Never put any part of your body under a car held only by a jack.', 'Most spares are limited to 50 mph and about 50 miles.'],
        causes: [['Puncture', 'Nail or screw in the tread.'], ['Pothole impact', 'Sidewall bulge or bent rim.'], ['Valve stem leak', 'Old rubber stems crack.']],
        tools: ['Spare tire', 'Jack', 'Lug wrench', 'Wheel wedge (or a brick)', 'Flashlight & gloves', 'Owner’s manual (jack points)'],
        steps: [
          { t: 'Make it safe', d: 'Hazards on, parking brake on, car in Park. Wedge the wheel diagonally opposite the flat.', why: 'When one corner lifts, the opposite wheel is the one that could roll.', v: { cam: [0.4, 1.2, 3.4], at: [-0.6, 0.4, 0.8], hi: ['wedge'], fx: 'hazard' } },
          { t: 'Loosen the lug nuts', d: 'With the tire still on the ground, loosen each nut a half-turn counterclockwise.', why: 'On the ground, friction stops the wheel from spinning while you push on the wrench.', v: { cam: [1.6, 0.8, 2.2], at: [0.9, 0.3, 0.8], hi: ['lugs', 'wrench'], show: ['wrench'] } },
          { t: 'Jack at the jack point', d: 'Place the jack under the reinforced point near the flat (see the manual) and raise until the tire clears the ground by 2″.', why: 'Jack points are reinforced. Anywhere else can dent the floor or slip.', v: { cam: [1.6, 0.6, 2.4], at: [0.5, 0.35, 0.8], hi: ['jack', 'jackPoint'], mv: { car: [0, 0.14, 0], jackPoint: [0, 0.14, 0], jackTop: [0, 0.14, 0] }, hide: ['wrench'] } },
          { t: 'Remove nuts and wheel', d: 'Unscrew the nuts fully and put them in a cup or hubcap. Pull the wheel straight off.', why: 'Lay the flat under the car side as a backup in case the jack slips.', v: { cam: [2.2, 1.0, 3.0], at: [0.9, 0.45, 1.2], hi: ['wheel'], mv: { wheel: [0, 0, 1.0] } } },
          { t: 'Mount the spare', d: 'Lift the spare onto the studs and thread every nut on by hand.', why: 'Hand-threading first prevents cross-threading.', v: { cam: [2.0, 1.0, 2.6], at: [0.9, 0.45, 0.9], hi: ['spare'], show: ['spare'], hide: ['wheel'], mv: { spare: [0, -0.0, -0.78] } } },
          { t: 'Lower and torque in a star', d: 'Lower the car, then tighten the nuts in a star pattern, skipping one each time, in two passes.', why: 'A star pattern pulls the wheel evenly against the hub. Going around in a circle can seat it crooked.', v: { cam: [1.8, 0.8, 2.4], at: [0.9, 0.3, 0.8], hi: ['spare'], mv: { car: [0, 0, 0], jackPoint: [0, 0, 0], jackTop: [0, 0, 0] } } },
        ],
        learn: {
          how: 'The wheel is clamped to the hub by lug nuts. Their friction, not the studs themselves, carries the load. Tapered seats on the nuts center the wheel. That’s why even torque in a star pattern matters, and why you re-check the torque after the first 50 miles.',
          specs: [['Lug torque (cars)', '76–100 ft-lb'], ['Compact spare limit', '50 mph / 50 mi'], ['Spare pressure', '60 psi (check sidewall)'], ['Lift height', '≈ 2″ clearance']],
          terms: [['Lug nut', 'Nut that clamps the wheel to the hub.'], ['Jack point', 'Reinforced lift spot on the body.'], ['Donut', 'Compact temporary spare.'], ['TPMS', 'Tire Pressure Monitoring System warning light.']],
          mistakes: ['Jacking before loosening nuts.', 'Tightening nuts while the car is still in the air.', 'Forgetting to check spare pressure for years.'],
          tips: ['Check the spare’s pressure twice a year.', 'Have the flat repaired, not just plugged, at a tire shop.'],
        },
        pro: 'You’re on a highway shoulder with traffic close by, the nuts are locked or seized, or there’s no spare.',
      },
      {
        id: 'check-oil',
        title: 'Check & top up fluids',
        model: 'engine',
        level: 1,
        time: '10 min',
        cost: '$0–30',
        summary: 'A five-minute monthly check of oil, coolant and washer fluid catches leaks early and prevents expensive engine damage.',
        intro: { hi: ['dipstick', 'coolant', 'washer'] },
        safety: ['Never open a hot radiator or coolant cap. Pressurized coolant can scald.', 'Check oil on level ground with the engine off for at least 5 minutes.'],
        causes: [['Normal oil consumption', 'Engines burn a little oil between changes.'], ['Leak', 'Spots on the driveway.'], ['Overdue oil change', 'Dark, gritty oil.']],
        tools: ['Paper towel or rag', 'Funnel', 'Correct oil (see cap or manual, e.g. 0W-20)', 'Coolant (correct type)', 'Washer fluid'],
        steps: [
          { t: 'Pull the dipstick', d: 'Pull the yellow dipstick, wipe it clean, push it back fully, and pull it again.', why: 'The first pull smears oil from the tube. The second shows the true level.', v: { cam: [1.0, 2.0, 1.4], at: [0.25, 1.1, 0.27], hi: ['dipstick'], mv: { dipstick: [0, 0.65, 0.1] } } },
          { t: 'Read the level', d: 'Oil should sit between the MIN and MAX marks. Note the color: amber is fine, black and gritty means it’s due for a change.', why: 'The distance between the marks is usually about one quart.', v: { cam: [0.9, 1.6, 1.3], at: [0.25, 1.0, 0.37], hi: ['marks'] } },
          { t: 'Add oil if low', d: 'Open the oil cap, add half a quart through a funnel, wait a minute, recheck. Don’t overfill.', why: 'Too much oil gets whipped into foam by the crankshaft, and foam doesn’t lubricate.', v: { cam: [1.0, 2.2, 1.4], at: [-0.2, 1.1, 0.0], hi: ['oilCap', 'funnel', 'oilBottle'], show: ['funnel', 'oilBottle'], mv: { dipstick: [0, 0, 0], oilCap: [0.3, 0.3, 0] } } },
          { t: 'Check coolant (cold engine)', d: 'Look at the translucent reservoir. Level should be between the cold MIN and MAX lines.', why: 'Coolant carries heat from the engine to the radiator. Low coolant can overheat the engine.', v: { cam: [1.4, 1.8, 1.0], at: [0.6, 0.65, -0.25], hi: ['coolant'], hide: ['funnel', 'oilBottle'], mv: { oilCap: [0, 0, 0] } } },
          { t: 'Fill washer fluid', d: 'Pop the blue-capped reservoir and fill with washer fluid.', why: 'Plain water freezes in winter and doesn’t cut road grime.', v: { cam: [-0.2, 1.8, 1.6], at: [-0.6, 0.65, 0.5], hi: ['washer'] } },
        ],
        learn: {
          how: 'Oil keeps metal parts from touching; it rides on a thin film between them. As it ages, it breaks down and collects soot and metal particles, so it protects less. Coolant circulates through the engine and radiator to keep the engine near 195–220 °F. Running low on either is one of the fastest ways to ruin an engine.',
          specs: [['Oil MIN→MAX', '≈ 1 qt'], ['Oil change (synthetic)', '5,000–10,000 mi'], ['Engine temp', '195–220 °F'], ['Check fluids', 'monthly']],
          terms: [['Viscosity (e.g. 5W-30)', 'Oil thickness when cold (5W) and when hot (30).'], ['Coolant / antifreeze', 'Glycol mix that resists freezing and boiling.'], ['Dipstick', 'Gauge rod for the oil level.']],
          mistakes: ['Opening the radiator cap hot.', 'Mixing coolant types (can gel).', 'Reading the dipstick on a slope.'],
          tips: ['Look at the oil cap for the right viscosity; many have it printed on top.'],
        },
        pro: 'Oil looks milky (possible head gasket), coolant keeps dropping, or the oil warning light comes on while driving. Pull over and shut the engine off.',
      },
      {
        id: 'wipers',
        title: 'Replace wiper blades',
        model: 'wiper',
        level: 1,
        time: '10 min',
        cost: '$15–40',
        summary: 'Streaking, chattering or skipping wipers are worn. Most blades click off a J-hook arm in seconds.',
        intro: { hi: ['blade'] },
        safety: ['A bare wiper arm can snap back and crack the windshield. Lay a towel on the glass first.'],
        causes: [['Hardened rubber', 'Sun and ozone age it in 6–12 months.'], ['Torn edge', 'Ice and debris.'], ['Bent arm', 'Blade can’t press evenly.']],
        tools: ['Correct-length blades (driver and passenger often differ)', 'Towel'],
        steps: [
          { t: 'Pad the windshield', d: 'Lay a folded towel on the glass under the wiper arm.', why: 'The spring-loaded arm can slap down hard enough to crack glass.', v: { cam: [1.2, 1.8, 1.8], at: [0.2, 1.0, 0.0], hi: ['towel'], show: ['towel'] } },
          { t: 'Lift the arm', d: 'Pull the arm up until it locks away from the glass.', why: 'Most arms hold in the raised position on their own.', v: { cam: [1.4, 1.8, 2.0], at: [0.2, 1.2, 0.2], hi: ['arm'], rt: { arm: [45, 0, 0] } } },
          { t: 'Release the old blade', d: 'Press the release tab, then slide the blade down and off the J-hook.', why: 'The blade pivots, then slides down through the hook.', v: { cam: [1.2, 1.8, 1.6], at: [0.15, 1.3, 0.3], hi: ['tab', 'bladeOld'], mv: { bladeOld: [0.4, -0.2, 0.4] } } },
          { t: 'Click on the new blade', d: 'Slide the new blade’s adapter onto the hook until it clicks.', why: 'Tug the blade after it clicks. A half-seated blade will fly off at highway speed.', v: { cam: [1.2, 1.8, 1.6], at: [0.15, 1.3, 0.3], hi: ['newBlade'], show: ['newBlade'], hide: ['bladeOld'], mv: { newBlade: [-0.6, 0, -0.1] } } },
          { t: 'Lower the arm gently', d: 'Lower the arm onto the glass, remove the towel, and test with washer fluid.', why: 'The washer fluid test shows streaks right away.', v: { cam: [1.4, 2.2, 2.4], at: [0, 1.0, 0], hi: ['newBlade'], rt: { arm: [0, 0, 0] }, hide: ['towel'] } },
        ],
        learn: {
          how: 'A wiper blade is a soft rubber squeegee held against curved glass by a spring in the arm. The rubber edge flips as it changes direction, wiping on both strokes. Once the rubber hardens or nicks, it skips across the glass or leaves water behind.',
          specs: [['Replace every', '6–12 months'], ['Common sizes', '14–28″']],
          terms: [['J-hook', 'Most common arm end, shaped like a J.'], ['Beam blade', 'One-piece frameless blade.'], ['Squeegee edge', 'The thin rubber lip that contacts glass.']],
          mistakes: ['Letting the bare arm drop.', 'Buying one size for both sides.'],
          tips: ['Wipe the rubber with an alcohol pad every month to remove grime and extend life.'],
        },
        pro: 'The wipers don’t move at all or move slowly (motor or linkage).',
      },
    ],
  });
})();
