/* PLB · Plumbing */
(function () {
  /* ---- Model: single-handle cartridge faucet on a vanity ---- */
  TB.model('faucet', { cam: [2.6, 2.7, 2.6], at: [0, 1.75, -0.3] }, (K) => {
    const wall = K.part('wall', [0, 0, 0], null, 'Wall');
    K.box(wall, [3.2, 3, 0.08], 'drywall', [0, 1.5, -0.9]);
    const counter = K.part('counter', [0, 0, 0], null, 'Countertop');
    K.box(counter, [3, 0.1, 1.5], 'offwhite', [-0, 1.45, -0.1]);
    K.lathe(counter, [[0.0, -0.36], [0.45, -0.34], [0.6, -0.12], [0.64, 0]], 'white', [0, 1.5, 0.22]);
    const stop = K.part('stopper', [0, 1.15, 0.22], null, 'Drain stopper');
    K.cyl(stop, [0.09, 0.09, 0.03], 'chrome');

    const body = K.part('body', [0, 1.5, -0.45], null, 'Faucet body');
    K.cyl(body, [0.16, 0.2, 0.72], 'chrome', [0, 0.36, 0]);
    K.cyl(body, [0.28, 0.3, 0.03], 'chrome', [0, 0.015, 0]);
    K.tube(body, [[0, 0.5, 0.08], [0, 0.72, 0.28], [0, 0.72, 0.52], [0, 0.6, 0.64]], 0.055, 'chrome');
    const aer = K.part('aerator', [0, 0.57, 0.65], body, 'Aerator');
    K.cyl(aer, [0.066, 0.066, 0.08], 'chrome');
    K.cyl(aer, [0.055, 0.055, 0.02], 'dark', [0, -0.045, 0]);

    const cart = K.part('cartridge', [0, 0.46, 0], body, 'Cartridge');
    K.cyl(cart, [0.1, 0.1, 0.42], 'pvc');
    K.cyl(cart, [0.035, 0.035, 0.2], 'brass', [0, 0.3, 0]);
    K.box(cart, [0.05, 0.03, 0.03], 'red', [0.09, 0.15, 0]);
    const rings = K.part('orings', [0, 0, 0], cart, 'O-rings');
    K.tor(rings, [0.102, 0.016], 'rubber', [0, -0.08, 0], [90, 0, 0]);
    K.tor(rings, [0.102, 0.016], 'rubber', [0, -0.16, 0], [90, 0, 0]);

    const nut = K.part('nut', [0, 0.72, 0], body, 'Retaining nut');
    K.cyl(nut, [0.14, 0.14, 0.07, 6], 'brass');
    const cap = K.part('cap', [0, 0.79, 0], body, 'Dome cap');
    K.cyl(cap, [0.14, 0.17, 0.08], 'chrome');
    const handle = K.part('handle', [0, 0.86, 0], body, 'Handle');
    K.cyl(handle, [0.12, 0.15, 0.13], 'chrome', [0, 0.04, 0]);
    K.box(handle, [0.07, 0.05, 0.48], 'chrome', [0, 0.09, 0.26], [-8, 0, 0]);
    const screw = K.part('screw', [0, 0.04, -0.14], handle, 'Set screw');
    K.cyl(screw, [0.025, 0.025, 0.04, 6], 'dark', [0, 0, 0], [90, 0, 0]);

    // supply side under the counter
    const valves = K.part('valves', [0, 0, 0], null, 'Shutoff valves');
    [['H', -0.32, 'red'], ['C', 0.32, 'blue']].forEach(([s, x, col]) => {
      K.cyl(valves, [0.05, 0.05, 0.22], 'chrome', [x, 0.6, -0.76], [90, 0, 0]);
      K.cyl(valves, [0.045, 0.045, 0.2], 'chrome', [x, 0.72, -0.68]);
      const knob = K.part('knob' + s, [x, 0.6, -0.62], null, s === 'H' ? 'Hot shutoff' : 'Cold shutoff');
      K.box(knob, [0.16, 0.06, 0.04], col);
      K.tube(null, [[x, 0.82, -0.68], [x, 1.05, -0.62], [x * 0.3, 1.32, -0.5], [x * 0.2, 1.52, -0.45]], 0.022, 'steel');
    });
    // drain tailpiece
    K.cyl(null, [0.07, 0.07, 0.4], 'chrome', [0, 0.95, 0.22]);

    const flow = K.cyl(body, [0.035, 0.05, 0.92], 'water', [0, 0.06, 0.65]);
    flow.userData.noPick = true;
    const drip = K.drip(body, [0, 0.5, 0.65], 0.85);
    return {
      tick(t, fx) {
        drip.tick(t, fx === 'drip');
        flow.visible = fx === 'flow';
        if (flow.visible) flow.scale.x = flow.scale.z = 1 + 0.08 * Math.sin(t * 30);
      },
    };
  });

  /* ---- Model: toilet with see-through tank ---- */
  TB.model('toilet', { cam: [2.6, 2.4, 3.0], at: [0, 1.15, -0.1], hidden: ['plunger', 'auger'] }, (K) => {
    const bowl = K.part('bowl', [0, 0, 0.3], null, 'Bowl');
    const b = K.lathe(bowl, [[0, 0], [0.26, 0], [0.3, 0.32], [0.48, 0.72], [0.56, 0.92], [0.55, 0.98]], 'white');
    b.scale.z = 1.3;
    const bw = K.cyl(bowl, [0.36, 0.2, 0.05], 'water', [0, 0.68, 0.02]);
    bw.scale.z = 1.25;
    const seat = K.part('seat', [0, 1.0, 0.3], null, 'Seat');
    const s = K.tor(seat, [0.48, 0.06], 'white', [0, 0, 0], [90, 0, 0]);
    s.scale.y = 1.28;

    // tank shell, built from panels so it can be seen into
    const tank = K.part('tank', [0, 0, 0], null, 'Tank');
    K.box(tank, [1.3, 0.05, 0.44], 'white', [0, 1.02, -0.4]);
    K.box(tank, [1.3, 0.9, 0.04], 'white', [0, 1.45, -0.6]);
    K.box(tank, [0.04, 0.9, 0.44], 'white', [-0.63, 1.45, -0.4]);
    K.box(tank, [0.04, 0.9, 0.44], 'white', [0.63, 1.45, -0.4]);
    K.box(null, [0.5, 0.32, 0.5], 'white', [0, 0.84, -0.3]);
    const front = K.part('tankFront', [0, 1.45, -0.18], null, 'Tank front');
    K.box(front, [1.3, 0.9, 0.04], 'white');
    const lid = K.part('lid', [0, 1.93, -0.4], null, 'Tank lid');
    K.box(lid, [1.38, 0.06, 0.5], 'white');

    const water = K.part('water', [0, 1.33, -0.4], null, 'Tank water');
    K.box(water, [1.2, 0.58, 0.36], 'water');

    // flush valve + overflow
    K.cyl(null, [0.15, 0.15, 0.05], 'pvc', [0.18, 1.07, -0.4]);
    const ov = K.part('overflow', [0.38, 1.4, -0.4], null, 'Overflow tube');
    K.cyl(ov, [0.045, 0.045, 0.7], 'pvc');
    const flap = K.part('flapper', [0.18, 1.11, -0.53], null, 'Flapper');
    K.cyl(flap, [0.14, 0.14, 0.04], 'red', [0, 0, 0.13]);
    K.box(flap, [0.04, 0.03, 0.08], 'red', [0, 0.01, 0.0]);

    const lever = K.part('lever', [-0.42, 1.78, -0.14], null, 'Flush handle & arm');
    K.box(lever, [0.18, 0.05, 0.05], 'chrome', [0, 0, 0.06]);
    K.box(lever, [0.68, 0.03, 0.03], 'chrome', [0.38, 0, -0.05]);
    const chain = K.part('chain', [0, 0, 0], null, 'Lift chain');
    K.tube(chain, [[0.2, 1.77, -0.2], [0.2, 1.45, -0.3], [0.19, 1.14, -0.4]], 0.008, 'steel');

    const fv = K.part('fillValve', [-0.42, 1.06, -0.4], null, 'Fill valve');
    K.cyl(fv, [0.05, 0.06, 0.72], 'grey', [0, 0.36, 0]);
    K.cyl(fv, [0.08, 0.08, 0.1], 'grey', [0, 0.74, 0]);
    K.tube(fv, [[0.05, 0.76, 0], [0.4, 0.82, 0], [0.8, 0.72, 0]], 0.012, 'black');
    const flt = K.part('float', [0, 0.45, 0], fv, 'Float cup');
    K.cyl(flt, [0.1, 0.1, 0.16], 'dark');
    const adj = K.part('adjust', [0.06, 0.76, 0], fv, 'Water level adjuster');
    K.cyl(adj, [0.02, 0.02, 0.3], 'brass', [0, -0.15, 0]);

    // supply
    const sh = K.part('shutoff', [-0.42, 0.32, -0.62], null, 'Toilet shutoff');
    K.cyl(sh, [0.05, 0.05, 0.16], 'chrome', [0, 0, 0], [90, 0, 0]);
    const knob = K.part('knob', [0, 0, 0.1], sh, 'Shutoff knob');
    K.box(knob, [0.16, 0.06, 0.04], 'blue');
    K.tube(null, [[-0.42, 0.38, -0.56], [-0.42, 0.7, -0.5], [-0.42, 1.0, -0.42]], 0.02, 'steel');
    K.box(null, [3, 2.4, 0.06], 'drywall', [0, 1.2, -0.68]);

    const plunger = K.part('plunger', [0, 0.9, 0.38], null, 'Flange plunger');
    K.lathe(plunger, [[0.0, 0.0], [0.2, 0.0], [0.22, 0.12], [0.1, 0.2], [0.03, 0.22]], 'rubber');
    K.cyl(plunger, [0.06, 0.06, 0.1], 'rubber', [0, -0.05, 0]);
    K.cyl(plunger, [0.025, 0.025, 1.1], 'woodLight', [0, 0.75, 0]);
    const auger = K.part('auger', [0.1, 0.95, 0.75], null, 'Closet auger');
    K.tube(auger, [[0, 1.0, 0.2], [0, 0.4, 0.05], [-0.05, 0.0, -0.25], [-0.05, -0.2, -0.45]], 0.03, 'grey');
    K.box(auger, [0.3, 0.04, 0.04], 'black', [0, 1.05, 0.2]);

    return {
      tick(t, fx) {
        if (fx === 'plunge') K.parts.plunger.position.y = 0.8 + 0.06 * Math.sin(t * 6);
        if (fx === 'fill') K.parts.water.scale.y = 0.6 + 0.4 * ((t * 0.25) % 1);
        else K.parts.water.scale.y = 1;
      },
    };
  });

  /* ---- Model: bathroom sink drain + P-trap ---- */
  TB.model('ptrap', { cam: [2.4, 1.7, 2.4], at: [0, 0.9, 0], hidden: ['bucket', 'snake'] }, (K) => {
    K.box(null, [3, 2.6, 0.06], 'drywall', [0, 1.3, -0.75]);
    const counter = K.part('counter', [0, 0, 0], null, 'Vanity top');
    K.box(counter, [2.2, 0.1, 1.3], 'offwhite', [0, 1.6, -0.1]);
    K.lathe(counter, [[0.0, -0.32], [0.4, -0.3], [0.55, -0.1], [0.58, 0]], 'white', [0, 1.65, 0]);
    const stop = K.part('stopper', [0, 1.36, 0], null, 'Pop-up stopper');
    K.cyl(stop, [0.08, 0.08, 0.03], 'chrome');
    K.cyl(stop, [0.015, 0.015, 0.3], 'chrome', [0, -0.15, 0]);
    K.sph(stop, 0.06, 'dark', [0.02, -0.18, 0.03], [1, 0.6, 1]);
    const tail = K.part('tailpiece', [0, 1.05, 0], null, 'Tailpiece');
    K.cyl(tail, [0.06, 0.06, 0.6], 'chrome');
    K.cyl(null, [0.012, 0.012, 0.5], 'chrome', [0, 1.15, 0.12], [90, 0, 0]);

    const trap = K.part('trap', [0, 0, 0], null, 'P-trap');
    K.cyl(trap, [0.065, 0.065, 0.2], 'pvc', [0, 0.65, 0]);
    K.tor(trap, [0.18, 0.065, 180], 'pvc', [0.18, 0.55, 0], [0, 0, 180]);
    K.cyl(trap, [0.065, 0.065, 0.22], 'pvc', [0.36, 0.65, 0]);
    const gunk = K.part('clog', [0.18, 0.4, 0], trap, 'Hair & soap clog');
    K.sph(gunk, 0.07, 'dirt', [0, 0, 0], [1.6, 0.8, 0.9]);
    const nA = K.part('nutA', [0, 0.76, 0], null, 'Slip nut (tailpiece)');
    K.cyl(nA, [0.085, 0.085, 0.07, 12], 'pvc');
    const nB = K.part('nutB', [0.36, 0.76, 0], null, 'Slip nut (trap arm)');
    K.cyl(nB, [0.085, 0.085, 0.07, 12], 'pvc');
    const arm = K.part('trapArm', [0, 0, 0], null, 'Trap arm');
    K.cyl(arm, [0.065, 0.065, 0.12], 'pvc', [0.36, 0.84, 0]);
    K.tube(arm, [[0.36, 0.9, 0], [0.38, 0.95, -0.1], [0.4, 0.97, -0.4], [0.4, 0.97, -0.72]], 0.065, 'pvc');
    K.cyl(null, [0.14, 0.14, 0.04], 'chrome', [0.4, 0.97, -0.71], [90, 0, 0]);

    const bucket = K.part('bucket', [0.15, 0, 0], null, 'Bucket');
    K.lathe(bucket, [[0, 0], [0.32, 0], [0.38, 0.42], [0.39, 0.42]], 'sky');
    const snake = K.part('snake', [0.4, 0.97, 0.4], null, 'Hand drain snake');
    K.cyl(snake, [0.12, 0.12, 0.12], 'yellow', [0, 0, 0.1], [90, 0, 0]);
    K.tube(snake, [[0, 0, 0], [0, 0, -0.5], [0, 0, -1.05]], 0.012, 'steel');
  });

  TB.category({
    id: 'plumbing',
    code: 'PLB',
    name: 'Plumbing',
    domain: 'systems',
    blurb: 'Faucets, toilets and drains',
    repairs: [
      {
        id: 'faucet-drip',
        title: 'Dripping faucet',
        model: 'faucet',
        level: 2,
        time: '45–60 min',
        cost: '$15–40',
        summary: 'A single-handle faucet that drips from the spout almost always needs a new cartridge. You replace it from the top in about eight steps.',
        intro: { hi: ['cartridge'], xray: true, fx: 'drip' },
        safety: [
          'Close both shutoff valves and open the faucet to drain pressure before taking anything apart.',
          'Plug the drain. The set screw and clips are small and love to fall in.',
        ],
        causes: [
          ['Worn cartridge', 'The plastic and rubber seals inside wear from thousands of on-off cycles. Most common cause.'],
          ['Hardened O-rings', 'Leaks show up around the base of the handle rather than the spout.'],
          ['Mineral buildup', 'Hard water scale keeps the seals from closing fully.'],
        ],
        tools: ['Hex (Allen) key set', 'Adjustable wrench', 'Flat screwdriver', 'Replacement cartridge (same brand & model)', 'Silicone plumber’s grease', 'Rag and a towel'],
        steps: [
          {
            t: 'Shut off the water',
            d: 'Turn both shutoff valves under the sink clockwise until they stop. Lift the faucet handle to let the remaining water out.',
            why: 'The supply lines hold 40–80 psi. Opening the faucet after closing the valves bleeds that pressure so nothing sprays when the cartridge comes out.',
            v: { cam: [1.7, 1.0, 1.4], at: [0, 0.65, -0.65], hi: ['knobH', 'knobC'], rt: { knobH: [0, 0, 90], knobC: [0, 0, 90] } },
          },
          {
            t: 'Plug the drain and pad the sink',
            d: 'Close the drain stopper and lay a towel in the basin.',
            why: 'Faucet parts are small. The towel also protects porcelain if you drop the wrench.',
            v: { cam: [0.9, 2.6, 1.6], at: [0, 1.2, 0.2], hi: ['stopper'] },
          },
          {
            t: 'Remove the handle',
            d: 'Find the set screw under the handle (or behind a decorative button). Loosen it with a hex key and lift the handle straight off.',
            why: 'The set screw clamps the handle to the cartridge stem. You only need to loosen it a few turns; it usually stays captive in the handle.',
            v: { cam: [1.6, 2.6, 0.6], at: [0, 2.3, -0.45], hi: ['screw', 'handle'], mv: { handle: [0, 0.8, 0] } },
          },
          {
            t: 'Unscrew the dome cap',
            d: 'Turn the decorative cap counterclockwise by hand. If it is tight, wrap it with a rag and use the wrench gently.',
            why: 'The rag keeps the wrench from scratching the chrome finish.',
            v: { cam: [1.6, 2.6, 0.6], at: [0, 2.3, -0.45], hi: ['cap'], mv: { cap: [0, 0.55, 0] } },
          },
          {
            t: 'Remove the retaining nut',
            d: 'Unscrew the brass nut that holds the cartridge down.',
            why: 'This nut presses the cartridge onto its seat. Some brands use a U-shaped clip instead; pull that out with pliers.',
            v: { cam: [1.6, 2.5, 0.8], at: [0, 2.2, -0.45], hi: ['nut'], mv: { nut: [0, 0.32, 0] } },
          },
          {
            t: 'Pull out the old cartridge',
            d: 'Note which way the cartridge faces (a tab or "H" mark), then pull it straight up with pliers on the stem.',
            why: 'The cartridge orientation sets which side is hot. Installing it rotated 180° swaps hot and cold.',
            tip: 'Stuck cartridge? A cartridge puller ($15) pulls it without cracking the faucet body.',
            v: { cam: [1.9, 2.4, 1.1], at: [0.3, 2.0, -0.45], hi: ['cartridge'], mv: { cartridge: [0.75, 0.3, 0] } },
          },
          {
            t: 'Grease and install the new cartridge',
            d: 'Coat the new O-rings with silicone grease. Push the cartridge in with the tab facing the same way as the old one.',
            why: 'Silicone grease lets the O-rings slide in without rolling or tearing, and keeps the seal supple for years. Petroleum grease swells rubber; never use it.',
            v: { cam: [1.4, 2.2, 1.2], at: [0, 1.95, -0.45], hi: ['cartridge', 'orings'], xray: true, mv: { cartridge: [0, 0, 0] } },
          },
          {
            t: 'Reassemble and test',
            d: 'Reinstall nut, cap and handle. Open the shutoffs slowly, run the faucet hot and cold, and check for drips.',
            why: 'Opening the valves slowly pushes trapped air out gently and avoids water hammer on the new seals.',
            v: { cam: [2.2, 2.4, 2.0], at: [0, 1.8, -0.2], hi: ['handle'], fx: 'flow', mv: { handle: [0, 0, 0], cap: [0, 0, 0], nut: [0, 0, 0] }, rt: { knobH: [0, 0, 0], knobC: [0, 0, 0] } },
          },
        ],
        learn: {
          how: 'A single-handle faucet mixes hot and cold inside one cartridge. Moving the lever slides or rotates ports inside it to line up with the hot and cold inlets. When the handle is off, rubber seals press against those ports. Once the seals wear, a thin stream gets past and drips out of the spout.',
          specs: [['Home water pressure', '40–80 psi'], ['Wasted by 1 drip/sec', '≈ 3,000 gal/yr'], ['Typical cartridge life', '10–15 years'], ['Set screw sizes', '3/32″ or 7/64″ hex']],
          terms: [['Cartridge', 'Self-contained valve that controls flow and mix.'], ['Shutoff (stop) valve', 'Small valve under the sink that isolates one fixture.'], ['O-ring', 'Rubber ring that seals the gap between two round parts.'], ['Aerator', 'Screen on the spout tip that mixes air into the stream.']],
          mistakes: ['Buying a "universal" cartridge without bringing the old one to the store.', 'Forgetting to note the cartridge orientation, so hot and cold end up reversed.', 'Cranking the shutoffs open all at once.'],
          tips: ['Take a phone photo at every disassembly step.', 'Lay parts on the towel in the order you removed them.'],
        },
        pro: 'Water leaks from the faucet body or under the counter, the shutoff valves will not close, or the faucet is a wall-mount or tub/shower valve behind tile.',
      },
      {
        id: 'faucet-pressure',
        title: 'Weak flow at one faucet',
        model: 'faucet',
        level: 1,
        time: '20 min',
        cost: '$0–10',
        summary: 'When one faucet trickles but others are fine, the aerator screen on the tip is clogged with scale or debris. Cleaning it takes minutes.',
        intro: { hi: ['aerator'], fx: 'flow' },
        safety: ['Close the drain stopper first. The aerator has tiny parts.'],
        causes: [
          ['Clogged aerator', 'Sand and limescale collect on the fine screen. Most common after water main work.'],
          ['Partly closed shutoff', 'Someone bumped the valve under the sink.'],
          ['Blocked cartridge inlet', 'Debris lodged past the aerator; needs the cartridge pulled.'],
        ],
        tools: ['Pliers', 'Masking tape or a rag', 'Old toothbrush', 'White vinegar', 'Small bowl'],
        steps: [
          { t: 'Close the drain', d: 'Close the stopper so the aerator parts can’t slip down the drain.', why: 'The flow restrictor disc is smaller than a dime.', v: { cam: [0.9, 2.6, 1.6], at: [0, 1.2, 0.2], hi: ['stopper'] } },
          { t: 'Unscrew the aerator', d: 'Turn the tip clockwise when looking down at it from above (counterclockwise from below). Wrap tape around the pliers jaws if it will not turn by hand.', why: 'Tape protects the chrome. Most aerators are only hand-tight, so try your fingers first.', v: { cam: [0.9, 1.6, 1.4], at: [0, 1.95, 0.2], hi: ['aerator'], mv: { aerator: [0, -0.35, 0] }, rt: { aerator: [0, 180, 0] } } },
          { t: 'Take it apart and rinse', d: 'Push out the screen, washer and flow restrictor. Keep them in order. Rinse and scrub with the toothbrush.', why: 'Each layer has a job: the screen catches grit, the restrictor limits flow to 1.5–2.2 gpm, and the washer seals.', v: { cam: [0.7, 1.4, 1.2], at: [0, 1.7, 0.2], hi: ['aerator'], mv: { aerator: [0, -0.4, 0.2] } } },
          { t: 'Soak in vinegar', d: 'If white scale remains, soak the parts in vinegar for 30 minutes, then rinse.', why: 'Limescale is calcium carbonate. The acetic acid in vinegar dissolves it without hurting brass or plastic.', v: { cam: [0.7, 1.4, 1.2], at: [0, 1.7, 0.2], hi: ['aerator'] } },
          { t: 'Flush the spout', d: 'With the aerator off, run the faucet on full for 15 seconds to clear loose debris.', why: 'Any grit still in the spout would clog the clean screen right away.', v: { cam: [1.8, 2.0, 1.8], at: [0, 1.6, 0.1], hi: ['body'], fx: 'flow' } },
          { t: 'Reinstall hand-tight', d: 'Reassemble in the same order and screw the aerator back on by hand, plus a quarter turn with taped pliers if it drips.', why: 'Over-tightening crushes the washer and makes the next cleaning harder.', v: { cam: [1.6, 2.2, 1.9], at: [0, 1.8, 0.1], hi: ['aerator'], fx: 'flow', mv: { aerator: [0, 0, 0] }, rt: { aerator: [0, 0, 0] } } },
        ],
        learn: {
          how: 'The aerator splits water into many small streams and mixes in air. That makes a soft, splash-free flow that feels stronger than it is. A built-in restrictor caps the flow rate to save water. Because the screen is the narrowest point in the line, it is where debris piles up first.',
          specs: [['Max kitchen flow (US)', '2.2 gpm'], ['Typical bath flow', '1.2–1.5 gpm'], ['Common thread sizes', '15/16″ male, 55/64″ female']],
          terms: [['Flow restrictor', 'Disc with small holes that limits gallons per minute.'], ['Limescale', 'Hard white mineral deposit from hard water.']],
          mistakes: ['Removing the restrictor permanently. It wastes water and can make the stream splash.', 'Gripping chrome with bare pliers.'],
          tips: ['If every faucet in the house is weak, the cause is upstream: the main valve, pressure regulator, or the city supply.'],
        },
        pro: 'Low pressure is house-wide or came on suddenly with no work being done. You may have a failed pressure regulator or a hidden leak.',
      },
      {
        id: 'toilet-running',
        title: 'Toilet keeps running',
        model: 'toilet',
        level: 1,
        time: '30 min',
        cost: '$5–25',
        summary: 'A toilet that refills on its own or hisses nonstop usually has a leaking flapper, a chain that is too tight, or a water level set too high.',
        intro: { hi: ['flapper', 'fillValve'], xray: true, fx: 'fill' },
        safety: ['Tank lids are heavy porcelain and crack easily. Set the lid on a folded towel on the floor.', 'Tank water is clean. Bowl water is not, so wear gloves for bowl work.'],
        causes: [
          ['Worn or warped flapper', 'Water seeps into the bowl and the fill valve keeps topping it up.'],
          ['Chain too tight or tangled', 'Holds the flapper slightly open.'],
          ['Water level too high', 'Water spills into the overflow tube continuously.'],
          ['Failing fill valve', 'Won’t shut off even when the float rises.'],
        ],
        tools: ['Replacement flapper (2″ or 3″, match your flush valve)', 'Food coloring', 'Rubber gloves', 'Towel', 'Sponge'],
        steps: [
          { t: 'Lift off the tank lid', d: 'Lift the lid straight up with both hands and set it on a towel.', why: 'Porcelain chips at the corners. Laying it flat on a towel prevents rocking.', v: { cam: [2.0, 3.0, 2.2], at: [0, 1.6, -0.4], hi: ['lid'], mv: { lid: [1.6, -1.9, 0.6] } } },
          { t: 'Find the leak with dye', d: 'Add a few drops of food coloring to the tank. Wait 15 minutes without flushing. Color in the bowl means the flapper leaks.', why: 'A silent leak can waste 200 gallons a day. The dye test confirms it before you buy parts.', v: { cam: [1.6, 2.6, 1.4], at: [0, 1.3, -0.4], hi: ['water', 'flapper'], xray: true } },
          { t: 'Check the water level', d: 'Water should sit about 1″ below the top of the overflow tube. If it is spilling in, turn the adjuster screw on the fill valve to lower the float.', why: 'Too high and water constantly drains down the overflow. Too low and flushes are weak.', v: { cam: [1.2, 2.2, 1.4], at: [0, 1.5, -0.4], hi: ['overflow', 'adjust', 'float'], hide: ['tankFront'], fx: 'fill' } },
          { t: 'Shut off and drain', d: 'Turn the shutoff behind the toilet clockwise, then flush and hold the handle down to empty the tank. Sponge out the rest.', why: 'You need a dry flush valve seat to fit the new flapper and inspect the rim.', v: { cam: [-1.5, 1.0, 0.9], at: [-0.42, 0.4, -0.6], hi: ['knob'], rt: { knob: [0, 0, 90] }, hide: ['water'] } },
          { t: 'Replace the flapper', d: 'Unhook the chain, slip the flapper ears off the overflow pegs, and fit the new one the same way.', why: 'Rubber flappers harden and warp from chlorine in city water, typically within 3–5 years.', v: { cam: [1.2, 2.2, 1.2], at: [0.2, 1.15, -0.45], hi: ['flapper', 'chain'], rt: { flapper: [-65, 0, 0] } } },
          { t: 'Set the chain slack', d: 'Clip the chain so it has about ½″ of slack with the flapper closed. Cut off extra links.', why: 'Too tight holds the flapper open. Too loose and the extra chain gets trapped under the flapper.', v: { cam: [1.0, 2.2, 1.2], at: [0.1, 1.45, -0.35], hi: ['chain', 'lever'], rt: { flapper: [0, 0, 0] } } },
          { t: 'Refill and test', d: 'Open the shutoff, let the tank fill, then flush two or three times. Watch that the flapper drops cleanly and the fill valve stops.', why: 'Several test flushes show whether the flapper is seating every time and not just once.', v: { cam: [2.4, 2.4, 2.6], at: [0, 1.3, -0.2], hi: ['fillValve', 'flapper'], show: ['water'], rt: { knob: [0, 0, 0] }, fx: 'fill' } },
        ],
        learn: {
          how: 'The tank works like a timed reservoir. Pressing the handle lifts the flapper, the tank dumps into the bowl, and the rush starts a siphon that clears it. As the tank empties, the float drops and opens the fill valve. Water refills the tank and a small refill tube tops up the bowl. When the float rises back up, it shuts the valve off. A leak anywhere on that loop makes the cycle repeat.',
          specs: [['Water level', '≈ 1″ below overflow top'], ['Chain slack', '≈ ½″'], ['Modern flush', '1.28–1.6 gal'], ['Silent leak waste', 'up to 200 gal/day']],
          terms: [['Flapper', 'Rubber seal over the flush valve opening.'], ['Fill valve (ballcock)', 'Valve that refills the tank and stops when full.'], ['Overflow tube', 'Safety drain that stops the tank from flooding.'], ['Flush valve', 'The opening at the tank bottom the flapper seals.']],
          mistakes: ['Buying a 2″ flapper for a 3″ flush valve. Measure the opening.', 'Leaving the chain too tight.', 'Using in-tank bleach tablets. They destroy flappers fast.'],
          tips: ['Bring the old flapper to the store.', 'If the new flapper still leaks, run a fingernail around the valve seat. A chipped or rough seat needs a seat repair kit.'],
        },
        pro: 'Water is leaking onto the floor from the tank bolts or base, the tank is cracked, or the shutoff valve will not turn or drips when moved.',
      },
      {
        id: 'toilet-clog',
        title: 'Clogged toilet',
        model: 'toilet',
        level: 1,
        time: '15–30 min',
        cost: '$0–35',
        summary: 'Most clogs clear with a flange plunger used correctly. A closet auger handles the stubborn ones without scratching the bowl.',
        intro: { hi: ['bowl'] },
        safety: ['Do not flush again if the bowl is already high. Stop the tank first.', 'Never mix chemical drain cleaners with plunging. Splashback can burn skin and eyes.', 'Wear gloves and eye protection.'],
        causes: [['Too much paper at once', 'The most common cause by far.'], ['Wipes or hygiene products', 'They don’t break down, even "flushable" ones.'], ['Small object', 'Toys or bottle caps need the auger.']],
        tools: ['Flange plunger (has a fold-out rubber sleeve)', 'Closet auger', 'Rubber gloves', 'Old towels', 'Bucket'],
        steps: [
          { t: 'Stop more water from coming in', d: 'If the bowl is rising, lift the tank lid and press the flapper closed, or turn off the shutoff.', why: 'Stops the overflow before it reaches the floor.', v: { cam: [1.4, 2.6, 1.6], at: [0, 1.2, -0.3], hi: ['flapper', 'knob'], xray: true } },
          { t: 'Seat the flange plunger', d: 'Fold out the flange and press it into the bowl outlet so the cup is fully under water. Push down gently first to push out air.', why: 'Water transmits force; air compresses and wastes it. A gentle first push also prevents a splash.', v: { cam: [1.6, 2.0, 2.0], at: [0, 0.7, 0.3], hi: ['plunger'], show: ['plunger'], mv: { plunger: [0, -0.1, 0] } } },
          { t: 'Plunge with sharp strokes', d: 'Pump up and down 15–20 times while keeping the seal, then pull off quickly. Repeat a few rounds.', why: 'The pull stroke matters as much as the push. Alternating pressure loosens the clog in both directions.', v: { cam: [1.6, 1.8, 2.0], at: [0, 0.7, 0.3], hi: ['plunger'], fx: 'plunge' } },
          { t: 'Use a closet auger if needed', d: 'Set the auger’s rubber-sleeved bend in the bowl outlet, crank the cable in while turning, then pull it back out.', why: 'The protective sleeve keeps the cable from scratching porcelain. The coiled tip snags objects a plunger can’t move.', v: { cam: [1.8, 2.4, 2.4], at: [0, 0.8, 0.4], hi: ['auger'], show: ['auger'], hide: ['plunger'] } },
          { t: 'Test with a bucket pour', d: 'Pour a bucket of water into the bowl. If it drains briskly, restore water and flush normally.', why: 'Testing with a bucket can’t overflow the way a full flush can.', v: { cam: [2.6, 2.4, 3.0], at: [0, 1.0, 0], hi: ['bowl'], hide: ['auger'] } },
        ],
        learn: {
          how: 'The bowl drains through a built-in S-shaped trapway in the porcelain. Flushing pushes in a burst of water that fills the trapway and starts a siphon, which pulls the bowl empty. A clog stops the siphon from forming, so water just rises.',
          specs: [['Trapway diameter', '≈ 2″'], ['Plunger strokes per round', '15–20']],
          terms: [['Flange plunger', 'Plunger with a sleeve that fits a toilet outlet. Flat cups are for sinks.'], ['Closet auger', 'Short crank snake with a bent, sleeved tube for toilets.'], ['Siphon', 'Flow that keeps going once a pipe fills, pulled by gravity on the far side.']],
          mistakes: ['Using a flat sink plunger on a toilet.', 'Flushing repeatedly to "push it through".', 'Pouring chemical cleaner into a full bowl.'],
          tips: ['A squirt of dish soap and a bucket of hot (not boiling) water can soften paper clogs in 15 minutes.'],
        },
        pro: 'Several drains back up at once, or water rises in the tub when you flush. That points to a main sewer line blockage.',
      },
      {
        id: 'sink-clog',
        title: 'Slow or clogged sink drain',
        model: 'ptrap',
        level: 1,
        time: '30–45 min',
        cost: '$0–20',
        summary: 'Bathroom sinks clog with hair and soap at the pop-up stopper or in the P-trap. Both come apart by hand.',
        intro: { hi: ['trap', 'clog'], xray: true },
        safety: ['Skip chemical drain cleaner if you plan to open the trap. It will be sitting in the pipe.', 'Wear gloves; the debris is unpleasant and can carry bacteria.'],
        causes: [['Hair on the stopper', 'Hair wraps the pop-up rod and catches soap.'], ['Clog in the P-trap', 'Gunk settles at the bottom of the U-bend.'], ['Clog past the trap', 'In the trap arm or wall pipe; needs a snake.']],
        tools: ['Bucket', 'Rubber gloves', 'Old toothbrush', 'Channel-lock pliers (only if nuts are stuck)', 'Hand drain snake', 'Rags'],
        steps: [
          { t: 'Pull and clean the stopper', d: 'Lift the pop-up stopper out. If it won’t lift, unscrew the pivot nut behind the tailpiece and slide the rod out first. Clean off the hair.', why: 'Most bathroom "clogs" are a hair mat on the stopper. Clearing it often fixes everything.', v: { cam: [1.2, 2.4, 1.4], at: [0, 1.5, 0], hi: ['stopper'], mv: { stopper: [0, 0.55, 0.2] } } },
          { t: 'Set a bucket under the trap', d: 'Place a bucket and rags under the P-trap.', why: 'The trap holds about a cup of standing water, plus whatever the clog is holding back.', v: { cam: [1.8, 1.0, 1.8], at: [0.15, 0.5, 0], hi: ['bucket'], show: ['bucket'] } },
          { t: 'Loosen the slip nuts', d: 'Turn both slip nuts counterclockwise by hand. Use pliers gently only if they’re stuck.', why: 'PVC nuts crack under pliers, so hand-tight is the rule going on and coming off.', v: { cam: [1.4, 1.0, 1.3], at: [0.18, 0.75, 0], hi: ['nutA', 'nutB'], rt: { nutA: [0, 180, 0], nutB: [0, 180, 0] }, mv: { nutA: [0, -0.08, 0], nutB: [0, -0.08, 0] } } },
          { t: 'Remove and clean the trap', d: 'Lower the U-bend, dump it into the bucket, and scrub it out.', why: 'The U-bend keeps sewer gas out with a water seal. It is also where heavy debris settles.', v: { cam: [1.6, 1.0, 1.6], at: [0.2, 0.45, 0], hi: ['trap', 'clog'], mv: { trap: [0, -0.18, 0.3], nutA: [0, -0.2, 0.3], nutB: [0, -0.2, 0.3] } } },
          { t: 'Snake the trap arm if needed', d: 'If the trap was clean, feed the snake into the trap arm toward the wall, crank, and pull out debris.', why: 'A clean trap means the blockage is further down the line toward the wall.', v: { cam: [1.8, 1.4, 1.4], at: [0.4, 0.95, -0.3], hi: ['snake', 'trapArm'], show: ['snake'] } },
          { t: 'Reassemble and test', d: 'Refit the trap with washers facing the right way, hand-tighten the nuts, run water for a minute and check for drips.', why: 'Run hot water for a minute; that’s enough volume to show a slow leak at a nut.', v: { cam: [2.2, 1.6, 2.2], at: [0.15, 0.8, 0], hi: ['nutA', 'nutB'], hide: ['snake'], mv: { trap: [0, 0, 0], nutA: [0, 0, 0], nutB: [0, 0, 0] }, rt: { nutA: [0, 0, 0], nutB: [0, 0, 0] }, show: ['stopper'] } },
        ],
        learn: {
          how: 'Every fixture drain has a trap, a U-shaped bend that always holds a little water. That water plug blocks sewer gas from coming up into the room. The trap arm then carries waste to the vent and drain stack in the wall. Clogs collect where the flow slows down: at the stopper and at the bottom of the U.',
          specs: [['Bath sink drain size', '1¼″'], ['Kitchen sink drain size', '1½″'], ['Trap seal depth', '2–4″ of water']],
          terms: [['P-trap', 'U-bend plus a horizontal arm, shaped like a P on its side.'], ['Slip nut', 'Hand-tight nut that squeezes a tapered washer for a seal.'], ['Tailpiece', 'Straight pipe from the sink drain down to the trap.']],
          mistakes: ['Installing the slip washer backwards (the taper must face the fitting).', 'Overtightening plastic nuts until they crack.'],
          tips: ['A $3 plastic barbed "zip-it" strip clears stopper hair without removing anything.'],
        },
        pro: 'The clog is past the wall, multiple fixtures are slow, or the trap is old metal that crumbles when you touch it.',
      },
    ],
  });
})();
