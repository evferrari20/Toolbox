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
        summary: 'Rapid clicking, a slow “rur… rur…” crank, or a dark dash usually means a flat 12-volt battery. Connect jumper cables in a set order (red to dead, red to good, black to good, black to bare metal), let the helper car charge it for a few minutes, and you’re usually driving again in about 15 minutes.',
        intro: { hi: ['deadCar', 'goodCar'] },
        safety: ['Batteries give off hydrogen gas, which a spark can ignite. The very last black clamp goes on bare metal on the dead car’s engine, a foot or more from the battery, so the small spark it makes happens away from that gas.', 'Never jump a battery that is cracked, bulging, leaking, or frozen (puffed-out sides or ice in the cells). It can burst. Call for a tow or a new battery instead.', 'Wear safety glasses. Once any clamp is connected, never let a red and a black clamp touch each other, and never let a loose clamp touch the car body.', 'Keep hair, sleeves, hands and the cables away from the fan and belts. Electric radiator fans can start by themselves even with the engine off.', 'Read the jump-starting page in the owner’s manual first. Many cars (trunk or under-seat batteries, hybrids, some European models) have a special + jump post and ground point under the hood that you must use instead.'],
        causes: [['Lights or a door left on', 'A dome light or headlights drain a healthy battery overnight. A jump plus a long drive or a charger usually fixes it.'], ['Old battery', 'Most last 3–5 years, less in hot climates. The date sticker on top tells you its age.'], ['Cold weather', 'Cold slows the battery’s chemistry so it delivers less power, right when thick oil makes the engine harder to turn.'], ['Lots of short trips', 'Starting uses a big gulp of charge. Ten-minute drives never give the alternator time to put it back.'], ['Loose or corroded terminals', 'White or green crust on the posts blocks current. The battery can be fine but the car still clicks.'], ['Charging fault', 'If it dies again within a day or two, the alternator (the engine-driven generator) may not be recharging it.']],
        tools: ['Jumper cables, 4–6 gauge (lower number = thicker wire), 12–20 ft long', 'A helper car with a 12-volt battery, or a charged lithium jump pack', 'Safety glasses and gloves', 'Wire brush or rag for crusty battery posts', 'Owner’s manual (jump-starting page)'],
        steps: [
          { t: 'Park nose to nose, both off', d: 'Pull the helper car close enough for the cables to reach both batteries, but don’t let the cars touch. Turn both cars off, take the keys out, set both parking brakes, and put them in Park. Switch off the dead car’s headlights, radio and fan. Open both hoods and find each battery’s + and − posts.', why: 'Cars touching can create an accidental path for current. Switching off accessories sends every bit of current to the starter and protects electronics from a voltage spike when cables come off.', tip: 'Can’t tell the posts apart? Positive is stamped +, usually has a red cap or red cable, and is often a bit fatter. If a post is crusted white or green, scrub a spot shiny with a wire brush so the clamp can bite metal.', ok: 'Both engines are off, both parking brakes are on, and you can point to the + post on each battery.', v: { cam: [0.6, 3.4, 5.0], at: [0, 0.7, 0], hi: ['deadCar', 'goodCar'] } },
          { t: 'Red to the dead battery’s +', d: 'Look the dead battery over first. If it’s cracked, bulging or leaking, stop. Otherwise clamp one red clamp onto its positive (+) post. Wiggle the clamp so its teeth bite into the metal post itself, not the plastic cover or a nut. Keep the other three clamps apart and away from metal.', why: 'You connect the dead car first, while nothing in the cables is live yet, so a slip here can’t make a spark.', tip: 'If the battery is buried or in the trunk, look in the under-hood fuse box for a red-capped post marked + (a remote jump post). It’s wired straight to the battery and is the spot the maker wants you to use.', ok: 'The red clamp grips the + post and doesn’t twist or slide when you tug it gently.', v: { cam: [-0.6, 2.0, 1.6], at: [-1.3, 1.0, 0.4], hi: ['redDead'], show: ['redDead'] } },
          { t: 'Red to the helper battery’s +', d: 'Carry the other red clamp to the helper car and clamp it onto that battery’s positive (+) post, biting bare metal. From now on the cables are live, so hold the two black clamps apart with their jaws facing away from each other and away from any metal.', why: 'Now the two positive posts are joined. The rest of the job is about keeping black clamps away from red ones and from bare metal until the planned final connection.', tip: 'Hold both black clamps in one hand by their rubber handles, jaws pointed in opposite directions. That one habit makes an accidental spark almost impossible.', ok: 'Red is on + at both cars, and both black clamps are in your hand touching nothing.', v: { cam: [0.6, 2.0, 1.6], at: [1.3, 1.0, 0.4], hi: ['redGood'], show: ['redGood'] } },
          { t: 'Black to the helper battery’s −', d: 'Clamp one black clamp onto the helper battery’s negative (−) post. Push it on in one firm motion and wiggle it to bite. The last black clamp stays free in your hand.', why: 'This connects the helper’s negative side. All that’s left to finish the circuit is a ground on the dead car.', tip: 'Snap clamps on decisively. A clamp that touches, lifts and touches again makes little sparks and pits the post.', ok: 'Black is firmly on the helper’s − post and the last black clamp is still loose and touching nothing.', v: { cam: [0.6, 2.0, 1.6], at: [1.3, 1.0, 0.3], hi: ['blackGood'], show: ['blackGood'] } },
          { t: 'Last black clamp to bare metal', d: 'Clamp the last black clamp onto solid, unpainted metal on the dead car’s engine, a foot or more from the battery: a bare bolt head, a metal bracket, or an engine lifting hook. Keep it clear of belts, the fan and fuel lines. A small spark as it bites is normal.', why: 'This final connection completes the circuit and can spark. The engine is wired to the battery’s − post by a thick ground strap, so grounding there works just as well and keeps the spark away from battery gas.', tip: 'Nothing happens later when you crank? Painted, plastic or greasy spots don’t conduct. Move the clamp to a shiny bolt head or the ground stud shown in the manual and wiggle it until it bites.', ok: 'The clamp is on clean bare metal well away from the battery, and every cable hangs clear of the fan and belts.', v: { cam: [-0.8, 2.0, 1.2], at: [-1.6, 0.95, -0.1], hi: ['blackGround', 'groundPoint'], show: ['blackGround'] } },
          { t: 'Charge, start, then unhook in reverse', d: 'Start the helper and let it idle 3–5 minutes. Then try the dead car, cranking no more than 10 seconds; if it fails, wait 2 minutes and try again. Once it runs, remove clamps in reverse: black from the engine, black from the helper, red from the helper, red from the jumped car. Drive it 30+ minutes or put it on a charger.', why: 'How it works: the cables put the two batteries side by side (in parallel), so together they can supply the 100–300+ amps a starter gulps. Resting between tries keeps the starter motor from overheating.', tip: 'Only rapid clicking? Wiggle each clamp hard, then let the helper run 5 more minutes with a light foot on the gas (about 2,000 rpm). If the engine spins fast but won’t fire, the battery isn’t the problem anymore.', ok: 'The jumped car keeps idling on its own with the cables off, and the battery warning light on the dash is out.', v: { cam: [0.6, 3.4, 5.0], at: [0, 0.7, 0], hi: ['redDead', 'redGood', 'blackGood', 'blackGround'] } },
        ],
        tricks: [['Get a free battery test', 'After any jump, stop at an auto parts store. Most load-test the battery and check the alternator free in the parking lot. A battery that needed one jump often fails again within weeks.'], ['Buy cables that actually work', 'Choose 4-gauge or heavier, 16–20 ft long, with all-copper wire and stiff clamps with deep teeth. Thin 8–10 gauge cables just get warm and can’t pass enough current on a cold morning.'], ['Uncoil before you clamp', 'Lay the cables out fully on the ground between the cars first. Untangling a coil with one end connected is how a live clamp ends up dragging across metal.'], ['Click or no click tells you a lot', 'Rapid clicking with dim lights means a weak battery. Bright lights with one loud click and no crank points to a bad connection or starter, and a jump may not help.'], ['Charge it properly afterward', 'An alternator tops up a battery; it’s slow at refilling a dead one. An overnight session on a smart charger brings it back fully and helps it last longer.'], ['Keep a jump pack instead', 'A charged lithium jump pack ($60–150) starts most cars with no second car and no traffic dance. Recharge it every 3 months.'], ['If the helper car is a hybrid or EV', 'Many makers say not to use a hybrid or electric car as the helper for a regular car. Check the helper’s manual before you hook up.']],
        refs: [['Official Car Talk Jump-Start Instructions (Car Talk)', 'https://www.cartalk.com/sites/default/files/features/jumpstart/images/jumpstart2012.pdf'], ['How to Use Jumper Cables to Start a Car (AAA Club Alliance)', 'https://cluballiance.aaa.com/the-extra-mile/advice/car/how-to-use-jumper-cables'], ['How to Jump-Start a Car With a Dead Battery (Consumer Reports)', 'https://www.consumerreports.org/cars/car-batteries/jump-start-car-with-dead-battery-a1028630350/'], ['How Do I Use Jumper Cables to Jumpstart My Car Battery? (OPTIMA Batteries)', 'https://www.optimabatteries.com/experience/blog/how-do-i-use-jumper-cables-to-jumpstart-my-car-battery'], ['12.4 Is the Magic Number for Batteries (OPTIMA Batteries)', 'https://www.optimabatteries.com/experience/blog/12.4-is-the-magic-number-for-batteries'], ['How to Jump Start a Car (Edmunds)', 'https://www.edmunds.com/how-to/jump-start.html']],
        learn: {
          how: 'A car battery stores energy chemically in lead plates soaked in sulfuric acid: six cells of about 2.1 volts make 12.6 volts. Starting takes a huge burst of current, 100–300 amps or more for a few seconds. Jumper cables connect the healthy battery side by side with the weak one (positive to positive, negative to ground), so together they can supply that burst. Once the engine runs, the alternator, a generator driven by a belt, recharges the battery as you drive.',
          specs: [['Fully charged (engine off, rested)', '12.6 V or higher'], ['Recharge it now', 'below 12.4 V'], ['About half charged', '≈ 12.2 V'], ['Engine running (charging)', '13.7–14.7 V'], ['Jumper cables', '4–6 gauge, 12–20 ft'], ['Helper run time before cranking', '3–5 min'], ['Crank limit', '10 s, then 2 min rest'], ['Afterward', '30+ min of driving, or a charger overnight']],
          terms: [['Terminal / post', 'The metal stubs on top of the battery the cables clamp to.'], ['Ground', 'Bare metal on the car body or engine that’s wired back to the battery’s − post.'], ['Alternator', 'Belt-driven generator that recharges the battery while the engine runs.'], ['Parallel', 'Positives joined and negatives joined, so the voltage stays at 12 V and the current adds up.'], ['CCA', 'Cold Cranking Amps: how much current a battery can deliver at 0 °F. Higher is stronger.']],
          mistakes: ['Putting the last black clamp on the dead battery’s − post, right where the gas collects.', 'Letting the clamps touch each other once any end is connected.', 'Cranking for 30 seconds straight and cooking the starter.', 'Jumping a frozen or swollen battery.', 'Assuming a 10-minute drive recharged a fully dead battery.'],
          tips: ['Note the battery’s date sticker; past 4–5 years, plan on a replacement.', 'Most auto parts stores test batteries and charging systems for free.', 'A cheap plug-in voltmeter or a $15 multimeter tells you the battery’s charge in seconds.'],
        },
        pro: 'Call roadside help or a shop if the car still won’t start after two or three good tries, the battery is swollen, cracked or leaking, you smell rotten eggs (an overcharging battery), or it goes dead again within a few days (likely the battery or charging system).',
      },
      {
        id: 'flat-tire',
        title: 'Change a flat tire',
        model: 'wheel',
        level: 2,
        time: '30 min',
        cost: '$0',
        summary: 'Get somewhere safe, loosen the lug nuts while the tire is still on the ground, lift the car at the factory jack point, swap on the spare, and tighten the nuts in a star pattern. Then get the nuts torqued and the flat repaired soon.',
        intro: { hi: ['wheel', 'jackPoint'] },
        safety: ['Get fully off the road onto flat, firm pavement, away from traffic. Driving slowly a short way on the flat may ruin the tire, but that’s far cheaper than working inches from traffic. Hazard lights on.', 'Never put any part of your body under a car held up only by a jack. The jack in your trunk is for lifting, not for holding the car while you’re under it.', 'Get everyone out of the car and well away from traffic while it’s jacked up.', 'A compact “donut” spare is usually limited to 50 mph and short distances; read the label on its sidewall and get the real tire fixed soon.', 'On a narrow highway shoulder, soft dirt, or a slope, call roadside assistance instead.'],
        causes: [['Puncture', 'A nail or screw in the tread. A small one in the tread area can usually be repaired.'], ['Pothole or curb hit', 'Can cut or bulge the sidewall or bend the rim. Sidewall damage means a new tire.'], ['Valve stem leak', 'Old rubber valve stems crack with age; cheap to replace when the tire is off.'], ['Running low on air', 'An underinflated tire flexes, overheats and can fail. Check pressure monthly.'], ['Bead leak', 'Corrosion on an alloy rim lets air seep out where the tire meets the wheel.']],
        tools: ['Spare tire (compact spares usually need 60 psi)', 'Jack and jack handle (under the trunk floor or a side panel)', 'Lug wrench (common sizes 17, 19 or 21 mm)', 'Wheel-lock key, if your car has one locking lug nut', 'Wheel wedge or a brick', 'Gloves, flashlight, reflective triangle', 'Tire pressure gauge', 'Owner’s manual (jack points and lug torque)'],
        steps: [
          { t: 'Make it safe and wedge a wheel', d: 'Stop on flat, hard ground well away from traffic. Hazards on, shift to Park (first gear or reverse for a stick shift), parking brake on, engine off. Get everyone out. Push a wheel wedge or brick tight against the tire diagonally opposite the flat. Then pull out the spare, jack and lug wrench.', why: 'When one corner lifts, the wheel diagonally across is the one most free to roll. The parking brake usually holds only the rear wheels.', tip: 'The spare and jack usually hide under the trunk floor panel, held by a big plastic wing nut you twist counterclockwise. If you carry a reflective triangle, set it about 100 ft behind the car.', ok: 'The car doesn’t budge when you push on it, the hazards are blinking, and the spare, jack and wrench are laid out beside the flat.', v: { cam: [0.4, 1.2, 3.4], at: [-0.6, 0.4, 0.8], hi: ['wedge'], fx: 'hazard' } },
          { t: 'Loosen the lug nuts a half turn', d: 'Pry off any hubcap with the flat end of the wrench. Seat the wrench fully on a nut and turn it counterclockwise (lefty-loosey) about half a turn, just until it breaks free. Do every nut, but don’t take them off yet. If one won’t move, set the wrench level and push down on it with your foot.', why: 'With the tire on the ground, its grip keeps the wheel from spinning while you push. Lug nuts are tightened to roughly 80–100 ft-lb, more than arms alone easily give.', tip: 'Stand on the wrench and gently shift your weight instead of jumping, which can slip it off and round the nut. A locking nut (one with a odd pattern) needs the key, usually in the glove box or with the jack.', ok: 'Every nut has turned about half a turn and feels loose, but the wheel is still firmly on.', v: { cam: [1.6, 0.8, 2.2], at: [0.9, 0.3, 0.8], hi: ['lugs', 'wrench'], show: ['wrench'] } },
          { t: 'Jack at the jack point', d: 'Find the jack point nearest the flat. On most cars it’s a reinforced metal seam (the pinch weld) under the door edge, marked by two notches or an arrow, about 6–10″ from the wheel opening. Set the jack on hard ground beneath it, fit the jack’s slot onto the seam, and crank clockwise until the flat is about 2″ off the ground.', why: 'Jack points are reinforced to carry the car’s weight. Anywhere else can dent the floor, crush a part, or let the jack slip out.', tip: 'Raise it until the jack just touches, then check it’s straight up and down before lifting more. On soft ground or hot asphalt, set the jack on a flat board. You need extra height because the full spare is taller than the flat.', ok: 'The jack stands vertical, the seam sits in the jack’s slot, and the flat spins freely about 2″ off the ground.', v: { cam: [1.6, 0.6, 2.4], at: [0.5, 0.35, 0.8], hi: ['jack', 'jackPoint'], mv: { car: [0, 0.14, 0], jackPoint: [0, 0.14, 0], jackTop: [0, 0.14, 0] }, hide: ['wrench'] } },
          { t: 'Remove the nuts and the wheel', d: 'Spin the nuts off by hand and drop them into the upturned hubcap or a pocket. Grab the tire at 3 and 9 o’clock and pull it straight toward you; it weighs about 35–50 lb, so keep your back straight. Lay the flat on the ground under the side of the car, next to the jack.', why: 'If the jack ever slips, the car lands on the tire instead of the ground, or you.', tip: 'Wheel rusted to the hub? Put two nuts back on loosely (a few turns), lower the car, and roll it a foot forward and back; the jolt usually breaks it free. Never kick or hammer the tire while the car sits on the jack.', ok: 'The threaded studs on the hub are bare, all the nuts are in one place, and the flat lies under the car’s side.', v: { cam: [2.2, 1.0, 3.0], at: [0.9, 0.45, 1.2], hi: ['wheel'], mv: { wheel: [0, 0, 1.0] } } },
          { t: 'Mount the spare and hand-thread the nuts', d: 'Wipe rust and grit off the hub’s flat face. Line a hole in the spare up with the top stud, lift it on, and push it flat against the hub, valve stem facing you. Thread every nut on by hand with its cone-shaped (tapered) end toward the wheel, spinning each until it stops. Snug them lightly with the wrench.', why: 'The taper on each nut centers the wheel on the studs. Starting by hand prevents cross-threading, where a crooked nut wrecks the stud’s threads.', tip: 'Rest the spare on your foot and lever it up onto the studs instead of dead-lifting it. If a nut won’t spin on by hand, back it off and restart it straight; never force it with the wrench.', ok: 'The spare sits flat against the hub with no gap anywhere, and every nut was spun on by hand.', v: { cam: [2.0, 1.0, 2.6], at: [0.9, 0.45, 0.9], hi: ['spare'], show: ['spare'], hide: ['wheel'], mv: { spare: [0, -0.0, -0.78] } } },
          { t: 'Lower, tighten in a star, check pressure', d: 'Lower the jack until the tire carries the car, then remove it. Tighten the nuts firmly in a star pattern (one, skip one, the next) in two passes. Check the spare with a gauge: compact spares usually need 60 psi. Have the nuts torqued to your manual’s spec (often 76–100 ft-lb) soon, and recheck after 50 miles.', why: 'Tightening in a star pulls the wheel evenly against the hub. Going around in a circle can cock it to one side, which loosens nuts and warps brake rotors. Torquing on the ground keeps the wheel from turning.', tip: 'No torque wrench yet? Pull firmly at the end of the handle without jumping on it, then let any tire shop torque them (usually free). Stow the flat and tools so they can’t fly around in a hard stop.', ok: 'No nut turns when you pull hard on the wrench, and the gauge reads the pressure printed on the spare.', v: { cam: [1.8, 0.8, 2.4], at: [0.9, 0.3, 0.8], hi: ['spare'], mv: { car: [0, 0, 0], jackPoint: [0, 0, 0], jackTop: [0, 0, 0] } } },
        ],
        tricks: [['Check the spare before you need it', 'Twice a year, check the spare’s pressure and find the jack, wrench and wheel-lock key. A flat spare is the most common roadside surprise.'], ['Buy a cross wrench', 'A four-way cross lug wrench (about $15) lets you push with both hands and fits the common nut sizes. It’s far easier than the short bar in most kits.'], ['Repair or replace?', 'A tread puncture up to ¼″ can usually be fixed properly with a patch-plug from the inside. Sidewall cuts, bulges, or holes near the tire’s shoulder mean a new tire.'], ['Practice once in the driveway', 'Doing it once on a sunny afternoon, with no traffic, turns a scary roadside job into a 20-minute routine and shows you whether your wrench and jack actually work.'], ['Keep a jack board and gloves', 'A 12″ scrap of 2×8 in the trunk gives the jack a firm base on dirt or soft asphalt. Gloves and a headlamp make night changes far easier.'], ['No spare in your car?', 'Many newer cars carry a sealant-and-compressor kit instead. It works for small tread punctures; follow the label, drive a few miles to spread the sealant, and tell the tire shop it’s inside.'], ['Warning light after the swap', 'Many spares have no pressure sensor, so the tire-pressure light may stay on or flash until your repaired tire goes back on. That’s normal.']],
        refs: [['What Is the Proper Method to Torque Wheel Lug Nuts or Bolts? (Tire Rack)', 'https://www.tirerack.com/upgrade-garage/what-is-the-proper-method-to-torque-wheel-lug-nuts-or-bolts'], ['Wheel Torque Specs (Discount Tire)', 'https://www.discounttire.com/learn/wheel-torque'], ['What Are Lug Nuts and How Do They Work? (Les Schwab)', 'https://www.lesschwab.com/article/wheels/lug-nuts-torque.html'], ['How to Change a Tire (BFGoodrich)', 'https://www.bfgoodrichtires.com/auto/learn/maintenance/how-to-change-a-tire'], ['How to Change a Flat Tyre (Bridgestone)', 'https://bridgestone-mea.com/en/discover/how-to-change-a-flat-tyre']],
        learn: {
          how: 'The wheel is clamped to the hub by lug nuts. The clamping force, not the studs bending, carries the load. Each nut has a cone-shaped seat that centers the wheel as it tightens, which is why even torque in a star pattern matters, and why the nuts get rechecked after 50–100 miles as everything settles. Some cars (many VW, Audi and BMW) use lug bolts that thread into the hub instead of nuts on studs; the steps are the same.',
          specs: [['Lug torque (most cars)', '76–100 ft-lb (check the manual)'], ['Re-check torque', 'after 50–100 mi'], ['Compact spare pressure', '60 psi (check its sidewall)'], ['Compact spare limit', '50 mph, short distances'], ['Lift height', '≈ 2″ of clearance'], ['Loosen before lifting', '½ turn per nut']],
          terms: [['Lug nut', 'Nut that clamps the wheel to the hub.'], ['Stud', 'Threaded bolt sticking out of the hub that the nut screws onto.'], ['Pinch weld', 'Reinforced metal seam under the door that’s the usual jack point.'], ['Donut', 'Compact temporary spare, smaller and lighter than a real tire.'], ['TPMS', 'Tire Pressure Monitoring System: the dash light that warns of low pressure.'], ['Star pattern', 'Tightening every other nut in turn so the wheel pulls on evenly.']],
          mistakes: ['Jacking the car up before loosening the nuts (the wheel just spins).', 'Fully tightening while the car is still in the air.', 'Putting nuts on backward with the taper facing out.', 'Never checking the spare’s pressure.', 'Driving for days or at highway speed on a donut.'],
          tips: ['Check the spare twice a year.', 'Have the flat repaired from the inside, not just plugged from outside.', 'Ask the shop to torque with a torque wrench, not just an impact gun.'],
        },
        pro: 'Call roadside assistance if you’re on a highway shoulder with traffic close by, the ground is soft or sloped, a nut is seized or the lock key is missing, the spare is flat too, or the wheel is badly bent.',
      },
      {
        id: 'check-oil',
        title: 'Check & top up fluids',
        model: 'engine',
        level: 1,
        time: '10 min',
        cost: '$0–30',
        summary: 'Once a month, and before any road trip, check the engine oil, coolant and washer fluid. It takes about five minutes, needs no tools, and catches small leaks before they turn into a ruined engine.',
        intro: { hi: ['dipstick', 'coolant', 'washer'] },
        safety: ['Never open the radiator or coolant reservoir cap on a warm engine. The coolant is under pressure and can be well over 220 °F; it can erupt and scald.', 'Engine off and keys out. The electric radiator fan can switch on by itself even with the engine off.', 'Exhaust parts stay hot for a long time after a drive. Keep your arms off them.', 'Coolant tastes sweet and is poisonous to kids and pets. Wipe up spills and keep jugs capped.'],
        causes: [['Normal oil use', 'Many engines burn a little oil between changes, up to about a quart every 1,000–2,000 miles on some.'], ['Leak', 'Fresh spots under the car: brown or black is oil, green, orange or pink and sweet-smelling is coolant.'], ['Overdue oil change', 'Dark, gritty oil that smears like paint.'], ['Coolant loss', 'A slowly dropping reservoir means a leak or, if there’s no visible drip, a possible internal problem.']],
        tools: ['Paper towels or a lint-free rag', 'Funnel', 'The correct oil (grade printed on the oil cap or in the manual, e.g. 0W-20)', 'The correct premixed coolant (type in the manual)', 'Washer fluid (winter-rated in cold climates)', 'Flashlight'],
        steps: [
          { t: 'Pull, wipe and re-dip the dipstick', d: 'Park on level ground with the engine off at least 5 minutes (or check first thing in the morning). Open the hood and find the dipstick: a loop handle, usually yellow or orange, often with an oil-can symbol. Pull it all the way out, wipe it clean, push it fully back in until the handle seats, then pull it out again.', why: 'The first pull is smeared with oil splashed up the tube. Waiting lets the oil drain down into the pan, the reservoir under the engine, for a true reading.', tip: 'No dipstick at all? Many newer cars show oil level in a dash menu instead; the manual tells you where. Hold a paper towel under the tip as you pull it so drips don’t land on the engine.', ok: 'You’re holding the dipstick from the second pull, with a fresh, unsmeared oil line on it.', v: { cam: [1.0, 2.0, 1.4], at: [0.25, 1.1, 0.27], hi: ['dipstick'], mv: { dipstick: [0, 0.65, 0.1] } } },
          { t: 'Read the oil level and color', d: 'Hold the stick level and look at both sides. The top of the wet film should sit between the two marks (dots, holes, MIN/MAX, or a crosshatched zone). If the sides differ, trust the lower one. Dab a drop on a white paper towel: amber to brown is fine, black and gritty means a change is due.', why: 'From the low mark to the full mark is usually about 1 quart, so the reading tells you roughly how much to add.', tip: 'Fresh oil is nearly clear and hard to see. Tilt the stick in good light and look for where the metal stops shining wet. Milky, coffee-with-cream oil or a gasoline smell needs a mechanic.', ok: 'You can say whether the oil line is near full, halfway, or at or below the low mark.', v: { cam: [0.9, 1.6, 1.3], at: [0.25, 1.0, 0.37], hi: ['marks'] } },
          { t: 'Add oil if it’s low', d: 'If it’s at or near the low mark, unscrew the oil filler cap on top of the engine (oil-can symbol). Through a funnel, pour in half a quart of the grade on the cap or in the manual. Wait 2 minutes, recheck the dipstick, and repeat until it’s near the full mark, never above. Screw the cap back on tight.', why: 'Too much oil gets whipped into foam by the spinning crankshaft, and foam doesn’t protect metal parts. Overfilling can also push oil past seals.', tip: 'Set the cap somewhere you can’t miss it, like on the windshield wiper, so you don’t close the hood without it. Overfilled by a lot? Don’t drive far; have a shop drain the extra.', ok: 'The oil line sits just below the full mark and the filler cap won’t turn any further.', v: { cam: [1.0, 2.2, 1.4], at: [-0.2, 1.1, 0.0], hi: ['oilCap', 'funnel', 'oilBottle'], show: ['funnel', 'oilBottle'], mv: { dipstick: [0, 0, 0], oilCap: [0.3, 0.3, 0] } } },
          { t: 'Check coolant with the engine cold', d: 'With the engine cold, ideally parked a few hours, find the see-through coolant reservoir near the radiator. Read the liquid against the COLD or MIN/MAX lines molded on its side. If it’s below MIN, open the reservoir cap (not the radiator cap) and add the exact premixed coolant type the manual names up to the COLD/MAX line.', why: 'Coolant, antifreeze mixed with water, carries heat from the engine to the radiator. It expands as it heats up, so you read and fill it cold.', tip: 'Shine a flashlight behind a grimy tank to see the level. Needing more than a little every month means a leak; look for colored, sweet-smelling drips under the front of the car.', ok: 'Coolant sits between the cold MIN and MAX lines and the cap is screwed back on tight.', v: { cam: [1.4, 1.8, 1.0], at: [0.6, 0.65, -0.25], hi: ['coolant'], hide: ['funnel', 'oilBottle'], mv: { oilCap: [0, 0, 0] } } },
          { t: 'Top up washer fluid', d: 'Find the washer tank cap, the one with a windshield-and-spray symbol (often blue). Flip it open and fill with windshield washer fluid until it shows at the neck. In freezing weather use fluid rated to −20 °F or colder. Close the cap and pull the washer lever to test.', why: 'Plain water freezes and can crack the tank and pump, and it doesn’t cut road grime or bug splatter.', tip: 'Double-check the symbol before you pour; washer fluid in the coolant tank, or the other way round, is a costly mix-up. A clogged sprayer nozzle can often be cleared with a pin.', ok: 'Fluid shows at the neck and both sprayers hit the windshield when you pull the lever.', v: { cam: [-0.2, 1.8, 1.6], at: [-0.6, 0.65, 0.5], hi: ['washer'] } },
        ],
        tricks: [['Read the cap', 'Most oil filler caps have the oil grade (like 0W-20) printed right on top. Snap a photo of it so you buy the right bottle at the store.'], ['Make it a fuel-stop habit', 'Check the oil every other fill-up, when the engine has been off a few minutes and the car is on a flat gas-station pad.'], ['Leave a cardboard test overnight', 'Not sure about a leak? Slide a sheet of cardboard under the engine overnight. The color and spot location tell a mechanic a lot.'], ['Never mix coolant types', 'Coolant comes in different chemistries (often orange, pink, blue or green). Mixing them can turn to sludge. When in doubt, add only the type in the manual.'], ['If the oil light comes on', 'A red oil-can light while driving means low oil pressure. Pull over and shut the engine off right away; driving even a few minutes can destroy the engine.'], ['Keep a quart in the trunk', 'A sealed quart of your engine’s oil, a funnel and paper towels in a bag cover you on a long trip.']],
        refs: [['How to Check Engine Oil the Right Way (Consumer Reports)', 'https://www.consumerreports.org/cars/car-repair-maintenance/how-to-check-car-engine-oil-a7618306432/'], ['Should Oil Levels Be Checked When the Engine Is Hot or Cold? (Mobil)', 'https://www.mobil.com/en/lubricants/for-personal-vehicles/auto-care/all-about-oil/ask-our-auto-experts/should-oil-levels-be-checked-when-the-engine-is-hot-or-cold'], ['Oil Check, owner’s manual (Honda)', 'https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3V02424IOM/enu/details/131237047-13475.html'], ['How Often Should You Check Your Motor Oil? (Castrol)', 'https://www.castrol.com/en_us/united-states/home/learn/car-maintenance/how-often-should-you-check-your-motor-oil.html'], ['Check and Fill Fluids (O’Reilly Auto Parts)', 'https://www.oreillyauto.com/how-to-hub/check-and-fill-fluids']],
        learn: {
          how: 'Oil keeps metal parts from touching: they ride on a thin film of it. Over time oil breaks down and fills with soot and tiny metal bits, so it protects less, which is why it gets changed. Coolant circulates through the engine and radiator to hold the engine near 195–220 °F; it’s pressurized so it won’t boil. Running low on either one is among the fastest ways to ruin an engine, and both drop slowly enough that a monthly look catches it.',
          specs: [['Oil, low mark → full mark', '≈ 1 qt'], ['Wait after shutting off', '5–10 min (Honda says 3)'], ['Check fluids', 'monthly and before trips'], ['Add oil', '½ qt at a time'], ['Coolant', 'premixed 50/50, the type in the manual'], ['Normal engine temperature', '195–220 °F'], ['Winter washer fluid', 'rated to −20 °F or colder']],
          terms: [['Dipstick', 'Metal rod that dips into the oil pan to show the level.'], ['Viscosity (e.g. 5W-30)', 'Oil thickness: the first number is cold flow (lower flows better cold), the second is thickness when hot.'], ['Coolant / antifreeze', 'Glycol-based fluid mixed with water that resists freezing and boiling.'], ['Reservoir', 'See-through overflow tank that shows the coolant level.'], ['Oil pan', 'The metal tray under the engine that holds the oil.']],
          mistakes: ['Opening the radiator cap on a hot engine.', 'Reading the dipstick on a slope or right after shutting the engine off.', 'Overfilling the oil.', 'Mixing coolant types.', 'Topping up washer fluid with plain water in winter.'],
          tips: ['Write the date and mileage on a strip of tape in the glove box each time you add oil; it tells a mechanic how fast it’s using it.', 'Use the oil-life monitor or manual for change intervals rather than an old 3,000-mile rule.'],
        },
        pro: 'See a mechanic if the oil looks milky (possible head gasket problem), the coolant keeps dropping, the temperature gauge climbs toward hot, or the red oil-pressure light comes on while driving (pull over and shut it off).',
      },
      {
        id: 'wipers',
        title: 'Replace wiper blades',
        model: 'wiper',
        level: 1,
        time: '10 min',
        cost: '$15–40',
        summary: 'Streaking, chattering, or skipping wipers have worn or hardened rubber. Most blades unclip from the arm’s hook in under a minute, no tools needed, once you know where the release tab is.',
        intro: { hi: ['blade'] },
        safety: ['A bare wiper arm is spring-loaded and can snap back hard enough to crack the windshield. Lay a towel on the glass and keep a hand on the arm.', 'Car off and wipers parked before you lift the arms, so they can’t start moving.'],
        causes: [['Hardened rubber', 'Sun, heat and ozone age the rubber in 6–12 months, so it skips and chatters.'], ['Torn or nicked edge', 'Ice, scraping frost with the wipers, or grit on the glass cuts the edge and leaves streaks.'], ['Dirty glass or blade', 'Road film and wax make even new blades smear.'], ['Bent or weak arm', 'The blade can’t press evenly, leaving unwiped bands.']],
        tools: ['New blades in the correct lengths (driver and passenger usually differ; check the store’s fit guide)', 'A thick towel', 'Glass cleaner and paper towels', 'Rubbing alcohol (optional)'],
        steps: [
          { t: 'Get the right sizes and pad the glass', d: 'Look up both blade lengths for your car in the store’s fit guide or the manual (for example 26″ driver and 16″ passenger); don’t assume both match. Then fold a thick towel and lay it on the windshield right where the arm would land if it slipped.', why: 'The spring that holds the blade to the glass will slam a bare metal arm down hard enough to crack the windshield.', tip: 'If the wipers park hidden under the back edge of the hood, check the manual for a “service position”: on many cars you switch the car off and push the wiper stalk within a few seconds to raise the arms partway.', ok: 'You have the right two lengths in hand and a folded towel lies on the glass under the arm.', v: { cam: [1.2, 1.8, 1.8], at: [0.2, 1.0, 0.0], hi: ['towel'], show: ['towel'] } },
          { t: 'Lift the arm until it stays up', d: 'Grab the arm itself, not the blade, and pull it up and away from the glass until it clicks and holds by itself, usually standing almost straight out. Do one side at a time.', why: 'Most arms have a detent, a built-in stop that holds them up so both your hands are free.', tip: 'Look at where the blade meets the arm. Most arms end in a J-hook, a metal strip curled like the letter J. Pin, side-post and push-button arms use different adapters, shown on the new blade’s package.', ok: 'The arm stands up away from the glass on its own when you let go.', v: { cam: [1.4, 1.8, 2.0], at: [0.2, 1.2, 0.2], hi: ['arm'], rt: { arm: [45, 0, 0] } } },
          { t: 'Release the old blade', d: 'Find the small plastic tab or button where the blade meets the hook. Press it, swing the blade so it sits at a right angle to the arm, then slide the blade down toward the arm’s base so it drops out of the J-hook. Keep one hand on the arm the whole time.', why: 'The blade’s adapter locks inside the hook’s curl. Pressing the tab unlocks it, and sliding down frees it from the curl.', tip: 'Snap a phone photo of how the old adapter sits before you remove it. A stuck tab can be pressed with a small flat screwdriver.', ok: 'The old blade is off, the bare hook is empty, and you still have a hand on the arm.', v: { cam: [1.2, 1.8, 1.6], at: [0.15, 1.3, 0.3], hi: ['tab', 'bladeOld'], mv: { bladeOld: [0.4, -0.2, 0.4] } } },
          { t: 'Click on the new blade', d: 'Check the new blade has the adapter for your arm type (most come set up for J-hooks). Slip the hook through the opening in the blade, then pull the blade up into the hook’s curl until it clicks. Tug it hard both ways.', why: 'A half-seated blade can fly off at highway speed, and the bare arm will then scratch the glass.', tip: 'If the blade flops loosely or won’t click, the adapter is upside down; the hook must curl over it, not under. Peel off any plastic protector strip on the rubber edge.', ok: 'You hear a click and the blade doesn’t slide or wobble when you tug it.', v: { cam: [1.2, 1.8, 1.6], at: [0.15, 1.3, 0.3], hi: ['newBlade'], show: ['newBlade'], hide: ['bladeOld'], mv: { newBlade: [-0.6, 0, -0.1] } } },
          { t: 'Lower the arm and test', d: 'Holding the arm, lower it gently onto the glass, then remove the towel. Repeat on the other side (and the rear wiper if you have one). Spray washer fluid and run the wipers for a few sweeps on low.', why: 'Wet testing shows streaks or chatter right away, while you still have the receipt.', tip: 'Clean the windshield first with glass cleaner; grit cuts a new edge within days. If a new blade still streaks, wipe its rubber edge with rubbing alcohol on a paper towel.', ok: 'The blades sweep the glass clean and quiet, with no streaks, skips or chattering.', v: { cam: [1.4, 2.2, 2.4], at: [0, 1.0, 0], hi: ['newBlade'], rt: { arm: [0, 0, 0] }, hide: ['towel'] } },
        ],
        tricks: [['Replace before the rainy season', 'Swap blades every 6–12 months, ideally in fall before rain and snow, rather than waiting for a storm to discover they’re shot.'], ['Clean blades monthly', 'Wipe the rubber edge with a damp paper towel or alcohol pad until no black comes off. It removes grit and restores a clean wipe.'], ['Don’t use wipers as ice scrapers', 'Scrape frost and free frozen blades before switching the wipers on. Ice tears the edge and can burn out the wiper motor.'], ['Beam blades for snow country', 'One-piece frameless (beam) blades don’t pack with ice like older metal-frame blades and press more evenly on curved glass.'], ['Bought the wrong size?', 'An inch or so shorter usually works; longer can hit the windshield frame or the other blade. Keep the receipt and the old blades until the new ones are tested.'], ['Lift the wipers before a storm', 'If ice or heavy snow is coming, park with the wipers raised so they don’t freeze to the glass.']],
        refs: [['How to Remove and Install J-Hook Wiper Blades (AutoZone)', 'https://www.autozone.com/diy/videos/how-to-remove-install-j-hook-wiper-blades-autozone-how-to-videos-177859530'], ['Fusion Wiper Blade Instructions (Rain-X)', 'https://www.rainx.com/instructions/fusion-blades/'], ['Check and Fill Fluids (O’Reilly Auto Parts)', 'https://www.oreillyauto.com/how-to-hub/check-and-fill-fluids']],
        learn: {
          how: 'A wiper blade is a soft rubber squeegee held against the curved glass by a spring in the arm. The thin rubber edge flips over each time the blade changes direction, so it wipes on both strokes. Once the rubber hardens or nicks, it can’t flip cleanly, so it skips, chatters, or leaves bands of water behind.',
          specs: [['Replace every', '6–12 months'], ['Common lengths', '14–28″'], ['Arm types', 'J-hook (most), pin, side-post, push-button']],
          terms: [['J-hook', 'The most common arm end, a metal strip curled like a J.'], ['Beam blade', 'One-piece frameless blade with a built-in curved spring.'], ['Adapter', 'Plastic piece on the blade that locks into the arm.'], ['Squeegee edge', 'The thin rubber lip that touches the glass.']],
          mistakes: ['Letting the bare arm snap onto the glass.', 'Buying one size for both sides.', 'Leaving the protective strip on the new rubber.', 'Running wipers on a dry or icy windshield.'],
          tips: ['Wipe the rubber with an alcohol pad monthly.', 'Keep the old blades until you’ve tested the new ones in the rain.'],
        },
        pro: 'See a shop if the wipers don’t move at all, move slowly, stop in the wrong place, or only one side moves; that’s the motor, the linkage, or a fuse, not the blades.',
      },
    ],
  });
})();
