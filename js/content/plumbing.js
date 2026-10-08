/* PLB · Plumbing */
(function () {
  /* ---- Model: single-handle cartridge faucet on a vanity ---- */
  const BATH = { env: 'studio', tex: ['white_plaster_02', 'granite_tile', 'floor_tiles_06', 'oak_wood_planks'], ground: { tex: 'floor_tiles_06', repeat: 5, radius: 6 } };
  // Wall, stone vanity top with undermount basin, and an open vanity cabinet.
  function vanity(K) {
    const wall = K.part('wall', [0, 0, 0], null, 'Wall');
    K.box(wall, [3.4, 3.2, 0.08], K.pbr('white_plaster_02', [2, 2], {}, 'drywall'), [0, 1.6, -0.9]);
    const counter = K.part('counter', [0, 0, 0], null, 'Vanity top');
    K.box(counter, [3, 0.1, 1.5], K.pbr('granite_tile', [1.5, 0.8], { roughness: 0.4 }, 'offwhite'), [0, 1.45, -0.1], null, 0.02);
    K.lathe(counter, [[0.0, -0.36], [0.45, -0.34], [0.6, -0.12], [0.64, 0]], 'white', [0, 1.5, 0.22]);
    const cab = K.part('cabinet', [0, 0, 0], null, 'Vanity cabinet');
    const wood = K.pbr('oak_wood_planks', [1, 1], { color: 0xf1ece4 }, 'offwhite');
    K.box(cab, [0.05, 1.4, 1.4], wood, [-1.45, 0.7, -0.15]);
    K.box(cab, [0.05, 1.4, 1.4], wood, [1.45, 0.7, -0.15]);
    K.box(cab, [2.9, 0.05, 1.4], wood, [0, 0.12, -0.15]);
    K.box(cab, [2.9, 0.1, 0.05], wood, [0, 0.05, 0.53]);
    const dl = K.group(cab, [-1.42, 0.75, 0.56], [0, -105, 0]);
    K.box(dl, [1.4, 1.2, 0.04], wood, [0.7, 0, 0]);
    K.box(dl, [0.03, 0.14, 0.03], 'chrome', [1.25, 0, 0.04]);
    const dr = K.group(cab, [1.42, 0.75, 0.56], [0, 105, 0]);
    K.box(dr, [1.4, 1.2, 0.04], wood, [-0.7, 0, 0]);
    K.box(dr, [0.03, 0.14, 0.03], 'chrome', [-1.25, 0, 0.04]);
  }

  TB.model('faucet', Object.assign({ cam: [2.6, 2.7, 2.6], at: [0, 1.75, -0.3] }, BATH), (K) => {
    vanity(K);
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
  // can = canister (tower) flush valve instead of a flapper
  function buildToilet(K, can) {
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
    if (!can) {
      const flap = K.part('flapper', [0.18, 1.11, -0.53], null, 'Flapper');
      K.cyl(flap, [0.14, 0.14, 0.04], 'red', [0, 0, 0.13]);
      K.box(flap, [0.04, 0.03, 0.08], 'red', [0, 0.01, 0.0]);
    } else {
      // Canister valve: a tower that lifts straight up; a wide seal on its base closes the outlet.
      const cn = K.part('canister', [0.18, 1.1, -0.4], null, 'Canister (tower) flush valve');
      K.cyl(cn, [0.11, 0.12, 0.42, 32], K.std(0x4a5560, { roughness: 0.4 }), [0, 0.24, 0]);
      K.cyl(cn, [0.07, 0.07, 0.12, 24], K.std(0x4a5560, { roughness: 0.4 }), [0, 0.5, 0]);
      K.tor(cn, [0.04, 0.008, 360], 'black', [0, 0.58, 0], [90, 0, 0]);
      const seal = K.part('canSeal', [0, 0.02, 0], cn, 'Canister seal (gasket)');
      K.tor(seal, [0.125, 0.018, 360], 'red', [0, 0, 0], [90, 0, 0]);
      K.box(cn, [0.03, 0.08, 0.03], 'grey', [0.1, 0.4, 0]);
    }

    const lever = K.part('lever', [-0.42, 1.78, -0.14], null, 'Flush handle & arm');
    K.box(lever, [0.18, 0.05, 0.05], 'chrome', [0, 0, 0.06]);
    K.box(lever, [0.68, 0.03, 0.03], 'chrome', [0.38, 0, -0.05]);
    const chain = K.part('chain', [0, 0, 0], null, 'Lift chain');
    if (can) K.tube(chain, [[0.2, 1.77, -0.2], [0.19, 1.74, -0.33], [0.18, 1.7, -0.4]], 0.008, 'steel');
    else K.tube(chain, [[0.2, 1.77, -0.2], [0.2, 1.45, -0.3], [0.19, 1.14, -0.4]], 0.008, 'steel');

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
    K.box(null, [3, 2.4, 0.06], K.pbr('white_plaster_02', [2, 1.5], {}, 'drywall'), [0, 1.2, -0.68]);

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
  }
  const TOILET_VIEW = Object.assign({ cam: [2.6, 2.4, 3.0], at: [0, 1.15, -0.1], hidden: ['plunger', 'auger'] }, BATH);
  TB.model('toilet', TOILET_VIEW, (K) => buildToilet(K, false));
  TB.model('toiletCanister', TOILET_VIEW, (K) => buildToilet(K, true));

  /* ---- Model: bathroom sink drain + P-trap ---- */
  TB.model('ptrap', Object.assign({ cam: [2.4, 1.7, 2.4], at: [0, 0.9, 0], hidden: ['bucket', 'snake'] }, BATH), (K) => {
    K.box(null, [3, 2.6, 0.06], K.pbr('white_plaster_02', [2, 2], {}, 'drywall'), [0, 1.3, -0.75]);
    const counter = K.part('counter', [0, 0, 0], null, 'Vanity top');
    K.box(counter, [2.2, 0.1, 1.3], K.pbr('granite_tile', [1.2, 0.7], { roughness: 0.4 }, 'offwhite'), [0, 1.6, -0.1], null, 0.02);
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
        renter: true,
        summary: 'A single-handle faucet that drips from the spout almost always has a worn cartridge, the plastic valve inside that mixes hot and cold. You swap it from the top in under an hour, and the part costs $15–40 (often free under the maker’s warranty).',
        intro: { hi: ['cartridge'], xray: true, fx: 'drip' },
        safety: [
          'Close both shutoff valves under the sink and open the faucet to drain the pressure before you take anything apart.',
          'Close the sink drain and lay a towel in the basin. The set screw and clip are tiny and love to fall in.',
          'If a shutoff valve won’t turn, or starts dripping at its stem when you turn it, stop and close the main water valve for the house instead.',
        ],
        causes: [
          ['Worn cartridge', 'The rubber seals inside wear from thousands of on-off cycles. A steady drip from the spout is the classic sign and by far the most common cause.'],
          ['Hardened O-rings', 'The rubber rings (O-rings) on the outside of the cartridge dry out. Water then seeps out around the base of the handle instead of the spout.'],
          ['Grit or mineral scale', 'Hard-water crust or sand from the pipes sits on the seals so they can’t close fully. Common right after city water work.'],
          ['Loose retaining nut or clip', 'Lets the cartridge lift slightly off its seat. Snugging it can stop a brand-new leak at the handle.'],
        ],
        tools: [
          'Hex (Allen) key set, inch and metric',
          'Small flat and Phillips screwdrivers',
          'Adjustable wrench or tongue-and-groove pliers',
          'Needle-nose pliers',
          'Replacement cartridge (same brand and model; take the old one to match)',
          'Cartridge puller for your brand if it’s stuck (Moen 104421 is about $15)',
          'Silicone faucet grease (not petroleum)',
          'Rag, two towels and painter’s tape',
          'Phone for photos',
        ],
        steps: [
          {
            t: 'Shut off the water',
            d: 'Under the sink, turn both small shutoff valves clockwise (to the right) until they stop. Some stop after a quarter turn, others after a few full turns. Then lift the faucet handle to full open and swing it hot and cold until the flow stops.',
            why: 'Your supply lines hold 40–80 psi (pounds per square inch) of pressure. Opening the faucet bleeds what’s trapped so nothing sprays when the cartridge comes out.',
            tip: 'Steady the valve body with one hand while you turn the knob so you don’t twist the pipe behind it. If a knob won’t budge or weeps at its stem, don’t force it; close the main house valve instead.',
            ok: 'With the handle wide open, the faucet gives no water at all on hot or cold.',
            v: { cam: [1.7, 1.0, 1.4], at: [0, 0.65, -0.65], hi: ['knobH', 'knobC'], rt: { knobH: [0, 0, 90], knobC: [0, 0, 90] } },
          },
          {
            t: 'Plug the drain and pad the sink',
            d: 'Close the drain stopper and lay a folded towel in the basin. Put a second towel on the counter to line up parts left to right in the order they come off.',
            why: 'Faucet parts are small and the drain sits right below them. The towel also protects the sink if a wrench slips.',
            tip: 'Take a phone photo before each part comes off. Those photos become your reassembly instructions, and they’re what the store clerk will want to see.',
            ok: 'The stopper is down and you can’t see the drain opening under the towel.',
            v: { cam: [0.9, 2.6, 1.6], at: [0, 1.2, 0.2], hi: ['stopper'] },
          },
          {
            t: 'Remove the handle',
            d: 'Find the set screw, a tiny screw under the lever or behind a small decorative button (pry the button off with a thin screwdriver). Turn it counterclockwise 2–3 turns with a hex key, then lift the handle straight up.',
            why: 'The set screw clamps the handle onto the cartridge stem. It usually stays captive in the handle, so you only need to loosen it.',
            tip: 'Most US faucets use a 3/32″ or 7/64″ hex key. Push the key all the way into the screw before turning so you don’t round it out. Handle stuck? Warm it with a hair dryer for a minute and wiggle it up.',
            ok: 'The handle is off and you can see the stem of the cartridge sticking up.',
            v: { cam: [1.6, 2.6, 0.6], at: [0, 2.3, -0.45], hi: ['screw', 'handle'], mv: { handle: [0, 0.8, 0] } },
          },
          {
            t: 'Unscrew the dome cap',
            d: 'Turn the decorative cap counterclockwise by hand. If it won’t move, wrap it in a rag or painter’s tape and turn it gently with the wrench.',
            why: 'The cap is mostly cosmetic and threads on lightly. The rag keeps the wrench from scratching the chrome.',
            tip: 'A rubber jar opener or a rubber glove gives a strong grip with no marks. Some faucets have no cap at all; if yours doesn’t, go straight to the nut or clip.',
            ok: 'The cap is off and you can see a brass nut or a U-shaped clip holding the cartridge down.',
            v: { cam: [1.6, 2.6, 0.6], at: [0, 2.3, -0.45], hi: ['cap'], mv: { cap: [0, 0.55, 0] } },
          },
          {
            t: 'Remove the retaining nut or clip',
            d: 'Turn the brass nut counterclockwise with the wrench and lift it off. If yours has a U-shaped clip instead (common on Moen), lift its tab with a small screwdriver and pull it straight out sideways with pliers.',
            why: 'The nut or clip is the only thing holding the cartridge down against water pressure.',
            tip: 'Set the clip on the towel right away and note which way its legs pointed. If the clip feels jammed, wiggle the cartridge stem a little to take the pressure off it.',
            ok: 'Nothing is left on top of the cartridge; it’s held in only by friction.',
            v: { cam: [1.6, 2.5, 0.8], at: [0, 2.2, -0.45], hi: ['nut'], mv: { nut: [0, 0.32, 0] } },
          },
          {
            t: 'Pull out the old cartridge',
            d: 'Photograph which way the cartridge faces (look for a tab, notch or H/C mark). Grip the stem with pliers and pull straight up while wiggling side to side.',
            why: 'Orientation decides which side is hot. Put the new one in rotated 180° and hot and cold swap.',
            tip: 'Stuck tight? Don’t pry against the faucet body. Use your brand’s cartridge puller: it threads onto the stem and jacks the cartridge out. Take the old cartridge to the store in a bag to match it exactly.',
            ok: 'The old cartridge is out and the hole in the faucet is clean, with no torn bits of O-ring left inside.',
            v: { cam: [1.9, 2.4, 1.1], at: [0.3, 2.0, -0.45], hi: ['cartridge'], mv: { cartridge: [0.75, 0.3, 0] } },
          },
          {
            t: 'Grease and install the new cartridge',
            d: 'Wipe out the inside of the faucet body with a rag. Coat the new O-rings with a thin film of silicone faucet grease. Line up the tab or mark the same way the old one faced and push the cartridge straight down until it seats.',
            why: 'Silicone grease lets the O-rings slide in without rolling or tearing and keeps them soft for years. Petroleum grease makes most faucet rubber swell and fail.',
            tip: 'If it stops short, don’t hammer it. Turn the stem slightly until the ears on the cartridge drop into their notches. On Moen-style faucets the clip only slides in once the cartridge is fully down and lined up.',
            ok: 'The cartridge sits level, and the nut threads on (or the clip slides in) without forcing.',
            v: { cam: [1.4, 2.2, 1.2], at: [0, 1.95, -0.45], hi: ['cartridge', 'orings'], xray: true, mv: { cartridge: [0, 0, 0] } },
          },
          {
            t: 'Reassemble and test',
            d: 'Reinstall the nut (snug, not cranked), the cap and the handle. Unscrew the aerator on the spout tip, open the shutoffs slowly, and run hot and cold for 30 seconds. Screw the aerator back on and watch for drips for 5 minutes.',
            why: 'Opening the valves slowly pushes trapped air out gently. Running without the aerator flushes out grit the repair knocked loose, so it doesn’t clog the screen.',
            tip: 'Hot and cold reversed? Pull the handle, take the cartridge out and turn its stem 180°. Still dripping? The cartridge may not be fully seated; push it down and refit the nut or clip.',
            ok: 'Left gives hot, right gives cold, and 5 minutes after shutting it off the spout is dry and the handle base shows no water.',
            v: { cam: [2.2, 2.4, 2.0], at: [0, 1.8, -0.2], hi: ['handle'], fx: 'flow', mv: { handle: [0, 0, 0], cap: [0, 0, 0], nut: [0, 0, 0] }, rt: { knobH: [0, 0, 0], knobC: [0, 0, 0] } },
          },
        ],
        learn: {
          how: 'A single-handle faucet mixes hot and cold inside one cartridge. Moving the lever slides or turns openings (ports) inside it so they line up with the hot and cold inlets by different amounts. With the handle off, rubber seals press against those ports. Once the seals wear, or a grain of grit sits on them, a thin stream slips past and drips from the spout.',
          specs: [
            ['Home water pressure', '40–80 psi (above 80 psi calls for a pressure-reducing valve)'],
            ['Water wasted at 1 drip per second', 'more than 3,000 gallons a year (EPA WaterSense)'],
            ['Typical cartridge life', '10+ years; less with hard water'],
            ['Common set screw sizes', '3/32″ or 7/64″ hex'],
            ['Moen 1225-style cartridge', 'held by a U-shaped clip; turn the stem 180° to swap hot and cold'],
          ],
          terms: [
            ['Cartridge', 'Self-contained valve that controls flow and the hot-cold mix.'],
            ['Shutoff (stop) valve', 'Small valve under the sink that turns off water to just this faucet.'],
            ['O-ring', 'Rubber ring that seals the gap between two round parts.'],
            ['Retaining clip or nut', 'Holds the cartridge down in the faucet body.'],
            ['Set screw', 'Tiny headless screw that locks the handle onto the stem.'],
            ['Aerator', 'Screen on the spout tip that mixes air into the stream.'],
          ],
          mistakes: [
            'Buying a “universal” cartridge without taking the old one to the store.',
            'Not noting which way the cartridge faced, so hot and cold end up reversed.',
            'Using petroleum plumber’s grease on the O-rings.',
            'Prying a stuck cartridge with a screwdriver and scoring or cracking the faucet body.',
            'Cranking the shutoffs open all at once.',
          ],
          tips: [
            'Look for the brand on the faucet base or the paperwork under the sink. Moen, Delta, Kohler and others replace cartridges free for life on many models.',
            'If the drip started right after city water work, the cartridge may just have grit in it. Pull it, rinse it, and reinstall before buying a new one.',
          ],
        },
        pro: 'Call a plumber if water leaks from the faucet body or under the counter, the shutoff valves won’t close or leak at the stem, the cartridge breaks off inside the faucet, or the faucet is a tub or shower valve behind tile.',
        tricks: [
          ['Check the warranty first', 'Many Moen, Delta, Kohler, Pfister and American Standard faucets carry lifetime warranties. Call or go online with the model and they often mail a free cartridge.'],
          ['Take the old part shopping', 'Cartridges that look alike differ by a few millimeters. Bag the old one and match it at the counter, side by side.'],
          ['Buy the puller with the part', 'Moen-style cartridges seize in hard water. A $15 brand puller saves an hour of wrestling and saves the faucet body.'],
          ['Belt and suspenders on the drain', 'Lay a rag over the closed stopper as well. A set screw down the drain is the most common reason this job stalls.'],
          ['Flush before the aerator goes back', 'Grit knocked loose during the repair heads straight for the aerator. Thirty seconds of flow with it off saves a second job.'],
          ['Hot and cold backward is a free fix', 'You don’t need a new part. Pull the handle and rotate the cartridge stem half a turn.'],
          ['Grease is cheap insurance', 'Even if the new cartridge comes pre-lubed, a thin film of silicone grease makes it slide in easily and come out easily next time.'],
        ],
        refs: [
          ['Tutorial: Installing the Moen 1200 or 1225 Cartridge (Moen)', 'https://www.moen.com/customer-support/installation-help/1200-1225-cartridge-replacement-tutorial'],
          ['1225 Cartridge: Single Handle Bathroom Faucets (Moen Solutions)', 'https://solutions.moen.com/Article_Library/1225_Cartridge:_Single_Handle_Bathroom_Faucets_(Prior_to_2009)'],
          ['Using a 104421 Cartridge Removal Tool (Moen Solutions)', 'https://solutions.moen.com/Article_Library/Using_a_104421_Cartridge_Removal_Tool'],
          ['Hercules Plumbers Silicone Grease (Oatey)', 'https://www.oatey.com/products/hercules-plumbers-silicone-grease-1156499120'],
          ['How to fix leaks (EPA WaterSense archive)', 'https://19january2017snapshot.epa.gov/www3/watersense/our_water/howto.html'],
        ],
      },
      {
        id: 'faucet-pressure',
        title: 'Weak flow at one faucet',
        model: 'faucet',
        level: 1,
        time: '20 min',
        cost: '$0–10',
        renter: true,
        summary: 'When one faucet trickles but the others are fine, the aerator, the little screen on the spout tip, is clogged with scale or grit. Cleaning it takes about 20 minutes and usually costs nothing.',
        intro: { hi: ['aerator'], fx: 'flow' },
        safety: [
          'Close the drain stopper first. The aerator has tiny parts that slip straight down an open drain.',
          'Turn the faucet fully off before unscrewing the aerator so you don’t get a face full of water.',
        ],
        causes: [
          ['Clogged aerator', 'Sand, pipe scale and limescale collect on the fine screen. Most common right after water main work or a water heater repair.'],
          ['Partly closed shutoff', 'Someone bumped a valve under the sink while storing things.'],
          ['Blocked cartridge inlet', 'Debris lodged past the aerator inside the faucet; the cartridge has to come out to clear it.'],
          ['Only the hot side is weak', 'If hot is weak everywhere, sediment from the water heater is the likely source, not the faucet.'],
        ],
        tools: [
          'Tongue-and-groove pliers or an adjustable wrench',
          'Painter’s tape or a rag',
          'Old toothbrush and a pin',
          'White vinegar',
          'Small bowl',
          'Aerator key (only for hidden “cache” aerators)',
          'Replacement aerator if worn ($3–10)',
        ],
        steps: [
          { t: 'Close the drain', d: 'Close the stopper and lay a small towel in the basin.', why: 'The flow restrictor disc inside the aerator is smaller than a dime and will vanish down an open drain.', tip: 'First check that both shutoff valves under the sink are fully open (turned counterclockwise until they stop). A bumped valve is a 10-second fix.', ok: 'The drain is closed and both shutoff handles are fully open.', v: { cam: [0.9, 2.6, 1.6], at: [0, 1.2, 0.2], hi: ['stopper'] } },
          { t: 'Unscrew the aerator', d: 'Grip the tip and turn it clockwise as you look down at it from above (counterclockwise from below). If it won’t turn by hand, wrap tape around the pliers jaws and turn gently.', why: 'Most aerators are only hand-tight. Tape protects the chrome from the pliers’ teeth.', tip: 'See no outside ridges, just a slotted ring tucked inside the spout? That’s a hidden (cache) aerator and needs a small plastic key that matches it, about $3.', ok: 'The aerator is in your hand and the end of the spout shows bare threads.', v: { cam: [0.9, 1.6, 1.4], at: [0, 1.95, 0.2], hi: ['aerator'], mv: { aerator: [0, -0.35, 0] }, rt: { aerator: [0, 180, 0] } } },
          { t: 'Take it apart and rinse', d: 'Push the parts out from the bottom and lay them on the towel in order: screen(s), flow restrictor and rubber washer. Rinse each one and scrub with the toothbrush.', why: 'Each layer has a job: screens catch grit, the restrictor limits flow to about 1.2–2.2 gpm (gallons per minute), and the washer seals.', tip: 'Snap a photo of the stack before you pull it apart. Use a pin to clear any blocked holes in the restrictor disc.', ok: 'Holding each screen up to a light, you can see through every hole.', v: { cam: [0.7, 1.4, 1.2], at: [0, 1.7, 0.2], hi: ['aerator'], mv: { aerator: [0, -0.4, 0.2] } } },
          { t: 'Soak in vinegar', d: 'If white crust remains, soak the parts in white vinegar for 30–60 minutes, then rinse and scrub again.', why: 'Limescale is calcium carbonate. The mild acid in vinegar dissolves it without hurting brass or plastic.', tip: 'If the screen is torn or still crusty after soaking, buy a new aerator. Take the old one along to match the thread size and the flow rate printed on its side.', ok: 'The parts look clean and feel smooth, with no white crust.', v: { cam: [0.7, 1.4, 1.2], at: [0, 1.7, 0.2], hi: ['aerator'] } },
          { t: 'Flush the spout', d: 'With the aerator off, run the faucet full on, hot and cold, for about 15 seconds each.', why: 'Any grit still inside the faucet would clog the clean screen again right away.', tip: 'Hold a cup under the spout to catch the grit so you can see what was clogging it. If flow is still weak with the aerator off, the cartridge or supply line is blocked.', ok: 'A strong, full stream comes out of the bare spout.', v: { cam: [1.8, 2.0, 1.8], at: [0, 1.6, 0.1], hi: ['body'], fx: 'flow' } },
          { t: 'Reinstall hand-tight', d: 'Stack the parts back in the same order with the washer on top and screw the aerator on by hand until snug. Add a quarter turn with taped pliers only if it drips at the threads.', why: 'Overtightening crushes the washer and makes the next cleaning harder.', tip: 'Leaking at the threads? The washer is missing or tilted; unscrew it and reseat the washer flat.', ok: 'You get an even, splash-free stream and no water seeps around the threads.', v: { cam: [1.6, 2.2, 1.9], at: [0, 1.8, 0.1], hi: ['aerator'], fx: 'flow', mv: { aerator: [0, 0, 0] }, rt: { aerator: [0, 0, 0] } } },
        ],
        learn: {
          how: 'The aerator splits water into many small streams and mixes in air, so the flow feels soft and full without splashing. A built-in restrictor caps the flow rate to save water. Because the screen is the narrowest point in the whole line, it’s where grit piles up first.',
          specs: [
            ['Max faucet flow (US federal)', '2.2 gpm at 60 psi'],
            ['WaterSense bathroom faucet', '1.5 gpm or less'],
            ['Common thread sizes', '15/16″-27 male or 55/64″-27 female'],
            ['Hidden (cache) aerators', 'usually metric, need a key'],
            ['Vinegar soak', '30–60 minutes'],
          ],
          terms: [
            ['Aerator', 'Screen assembly on the spout tip that shapes the stream.'],
            ['Flow restrictor', 'Disc with small holes that limits gallons per minute.'],
            ['Limescale', 'Hard white mineral crust left by hard water.'],
            ['Cache aerator', 'Aerator hidden inside the spout, removed with a special key.'],
          ],
          mistakes: [
            'Removing the restrictor for good. It wastes water and can make the stream splash.',
            'Gripping chrome with bare pliers.',
            'Losing the order of the parts and putting the washer on the wrong end.',
          ],
          tips: [
            'If every faucet in the house is weak, the cause is upstream: the main valve, a pressure regulator or the city supply.',
            'Clean aerators once or twice a year in hard-water areas.',
          ],
        },
        pro: 'Call a plumber if low pressure is house-wide, came on suddenly with no work being done, or comes with a hissing sound in the walls. You may have a failed pressure regulator or a hidden leak.',
        tricks: [
          ['Check the shutoffs before anything', 'A half-closed valve under the sink looks exactly like a clogged aerator. Open both fully first.'],
          ['After water main work, pull them all', 'When the city or a plumber shuts off your water, remove every aerator and flush each faucet for a minute before reinstalling.'],
          ['Kitchen pull-down sprayers', 'Pull-down heads hide a second screen where the hose connects. Unscrew the head and rinse that screen too.'],
          ['Hot only weak?', 'If only hot is weak at several faucets, flushing the water heater usually fixes it.'],
          ['Buy by flow rate', 'Aerators are stamped with gpm. Match the old number, or choose 1.5 gpm in a bathroom to save water without a weak feel.'],
          ['Keep the cache key', 'Tape the plastic aerator key inside the vanity door so next year’s cleaning takes two minutes.'],
        ],
        refs: [
          ['Everything you need to know about faucet aerator sizing (Rick’s Free Advice)', 'https://ricksfreeautorepairadvice.com/everything-you-need-to-know-about-faucet-aerator-sizing/'],
          ['Neoperl aerator 5505403, 15/16″ and 55/64″-27 threads (PartsSource)', 'https://www.partssource.com/parts/neoperl/5505403'],
          ['How to fix leaks and save water (EPA WaterSense archive)', 'https://19january2017snapshot.epa.gov/www3/watersense/our_water/howto.html'],
          ['Leaks in water-using fixtures (PNNL Building America Solution Center)', 'https://basc.pnnl.gov/resource-guides/leaks-water-using-fixtures'],
        ],
      },
      {
        id: 'toilet-running',
        title: 'Toilet keeps running',
        model: 'toilet',
        level: 1,
        time: '30 min',
        cost: '$5–25',
        renter: true,
        summary: 'A toilet that refills by itself or hisses nonstop usually has a leaking flapper, a chain that’s too tight, or a water level set too high. Each is a 5–30 minute fix with $5–25 in parts.',
        intro: { hi: ['flapper', 'fillValve'], xray: true, fx: 'fill' },
        safety: [
          'Tank lids are heavy porcelain and crack easily. Set the lid flat on a folded towel on the floor.',
          'Tank water is clean supply water. Bowl water is not, so wear gloves for any bowl work.',
          'Never use bleach or chlorine tablets in the tank; they eat flappers and seals.',
        ],
        causes: [
          ['Worn or warped flapper', 'Water seeps into the bowl, and the fill valve keeps topping up the tank. The most common cause.'],
          ['Chain too tight or tangled', 'Holds the flapper open a crack, or gets trapped under it.'],
          ['Water level too high', 'Water spills into the overflow tube nonstop.'],
          ['Refill tube pushed into the overflow', 'If the small tube reaches below the water line, it siphons the tank down and the valve keeps cycling.'],
          ['Failing fill valve', 'Won’t shut off even when the float rises; you hear a constant hiss.'],
        ],
        tools: [
          'Replacement flapper (2″ or 3″ to match your flush valve, or a universal adjustable one)',
          'Food coloring or dye tablets',
          'Rubber gloves',
          'Towel and sponge',
          'Bucket',
          'Flat screwdriver (for the fill valve adjuster)',
          'Non-scratch scrub pad (for the valve seat)',
          'Scissors or side cutters (to trim chain)',
        ],
        steps: [
          { t: 'Lift off the tank lid', d: 'Lift the lid straight up with both hands and set it flat on a folded towel on the floor, away from where you’ll kneel.', why: 'Porcelain chips at the corners, and lids break in half if they slide off a tub edge.', tip: 'Listen before you start: a steady hiss means water is flowing in too high; a refill every 10–30 minutes (a “ghost flush”) means water is leaking out to the bowl.', ok: 'You can see inside the tank: the fill valve tower on one side, the overflow tube and flapper in the middle.', v: { cam: [2.0, 3.0, 2.2], at: [0, 1.6, -0.4], hi: ['lid'], mv: { lid: [1.6, -1.9, 0.6] } } },
          { t: 'Find the leak with dye', d: 'Put 5–10 drops of food coloring in the tank water. Wait 15 minutes without flushing. Colored water in the bowl means the flapper leaks.', why: 'A silent leak can waste up to 200 gallons a day. The dye test proves where the water is going before you buy parts.', tip: 'Tape a “don’t flush” note on the handle while you wait. Dark blue or green shows best against white porcelain.', ok: 'The bowl water either stays clear (flapper is fine) or turns color (flapper leaks).', v: { cam: [1.6, 2.6, 1.4], at: [0, 1.3, -0.4], hi: ['water', 'flapper'], xray: true } },
          { t: 'Check the water level', d: 'Find the overflow tube, the open pipe in the middle. Water should stop about ½″–1″ below its top, or at the line marked inside the tank. If it spills in, turn the adjuster screw or slide the clip on the fill valve to lower the float, flush, and check again.', why: 'Too high and water trickles down the overflow forever. Too low and flushes get weak.', tip: 'On a float-cup valve, turn the screw counterclockwise a few turns to lower the level. Also make sure the thin refill tube is clipped above the water, not pushed down into the overflow, or it siphons the tank.', ok: 'After a refill the water stops below the top of the overflow tube and you hear nothing trickling.', v: { cam: [1.2, 2.2, 1.4], at: [0, 1.5, -0.4], hi: ['overflow', 'adjust', 'float'], hide: ['tankFront'], fx: 'fill' } },
          { t: 'Shut off and drain', d: 'Turn the shutoff valve behind the toilet clockwise until it stops. Flush and hold the handle down to empty the tank, then sponge out the rest into a bucket.', why: 'You need the flush valve seat (the ring the flapper sits on) nearly dry to fit the new flapper and inspect the seat.', tip: 'If the shutoff is stuck or drips at its stem, don’t force it; close the main house valve instead. A turkey baster clears the last inch fast.', ok: 'The tank is nearly empty and the water doesn’t rise after you wait a minute.', v: { cam: [-1.5, 1.0, 0.9], at: [-0.42, 0.4, -0.6], hi: ['knob'], rt: { knob: [0, 0, 90] }, hide: ['water'] } },
          { t: 'Replace the flapper', d: 'Unhook the chain from the handle arm. Slide the flapper’s ears off the two pegs on the overflow tube. Wipe the seat smooth with a scrub pad, then fit the new flapper the same way.', why: 'Rubber flappers harden and warp from chlorine in city water, often within 3–5 years.', tip: 'Take the old flapper to the store. The opening is either about 2″ across (baseball size) or 3″ (softball size). If the new one has an adjustment dial, set it to your toilet’s number from the package chart.', ok: 'The new flapper drops flat and centered over the opening when you let it go.', v: { cam: [1.2, 2.2, 1.2], at: [0.2, 1.15, -0.45], hi: ['flapper', 'chain'], rt: { flapper: [-65, 0, 0] } } },
          { t: 'Set the chain slack', d: 'Hook the chain to the handle arm so it has about ½″ of slack with the flapper closed, about one or two links of droop. Trim the extra chain or clip it back so the tail can’t dangle.', why: 'Too tight holds the flapper open a crack. Too loose and the chain gets trapped under it, or the flush cuts short.', tip: 'Push the handle slowly: the flapper should start lifting right as the handle moves. If flushes are weak or short, take up one link.', ok: 'With the handle at rest, the chain hangs in a slight curve and the flapper sits flat.', v: { cam: [1.0, 2.2, 1.2], at: [0.1, 1.45, -0.35], hi: ['chain', 'lever'], rt: { flapper: [0, 0, 0] } } },
          { t: 'Refill and test', d: 'Open the shutoff counterclockwise, let the tank fill, then flush 3 times. Watch the flapper drop cleanly and the fill valve shut off. Repeat the dye test to be sure.', why: 'Several flushes show whether the flapper seats every time, not just once.', tip: 'Dye test passes but it still hisses? The fill valve is the problem. Lift the float by hand: if water still flows, flush debris out of the valve cap or replace the valve ($10–20).', ok: 'The tank goes quiet within a minute of each flush and the bowl stays clear in a second dye test.', v: { cam: [2.4, 2.4, 2.6], at: [0, 1.3, -0.2], hi: ['fillValve', 'flapper'], show: ['water'], rt: { knob: [0, 0, 0] }, fx: 'fill' } },
        ],
        learn: {
          how: 'The tank is a timed reservoir. Pressing the handle lifts the flapper, the tank dumps into the bowl, and that rush starts a siphon that empties the bowl. As the tank drains, the float drops and opens the fill valve. Water refills the tank, a small refill tube tops up the bowl, and when the float rises back up it shuts the valve. A leak anywhere in that loop makes the cycle repeat.',
          specs: [
            ['Water level', '½″–1″ below the overflow top, or the tank’s line'],
            ['Fill valve critical level (CL) mark', 'at least 1″ above the overflow top (plumbing code)'],
            ['Chain slack', 'about ½″'],
            ['Modern flush volume', '1.28 gal (WaterSense) to 1.6 gal (federal max)'],
            ['Silent leak waste', 'up to 200 gal/day (EPA)'],
            ['Flapper sizes', '2″ or 3″ flush valve'],
          ],
          terms: [
            ['Flapper', 'Rubber seal over the opening at the bottom of the tank.'],
            ['Fill valve (ballcock)', 'Valve that refills the tank and shuts off when full.'],
            ['Overflow tube', 'Open pipe that drains extra water to the bowl so the tank can’t flood.'],
            ['Flush valve seat', 'The ring the flapper presses on.'],
            ['Refill tube', 'Thin tube that sends a little water to refill the bowl.'],
            ['Critical level (CL)', 'Mark on the fill valve that must sit above the overflow to stop backflow.'],
          ],
          mistakes: [
            'Buying a 2″ flapper for a 3″ flush valve. Measure the opening.',
            'Leaving the chain too tight.',
            'Pushing the refill tube down inside the overflow tube.',
            'Using in-tank bleach tablets. They destroy flappers fast.',
          ],
          tips: [
            'Bring the old flapper to the store.',
            'If a new flapper still leaks, run a fingertip around the seat. A chipped or rough seat needs a seat repair kit that glues a new ring over it.',
          ],
        },
        pro: 'Call a plumber if water leaks onto the floor from the tank bolts or base, the tank is cracked, or the shutoff valve won’t turn or drips when moved.',
        tricks: [
          ['Measure before you buy', 'A 2″ flapper on a 3″ valve never seals. Check the opening size, or buy a universal flapper made to fit both.'],
          ['Look for the model number', 'Kohler, American Standard and TOTO often need their own flappers. The model is stamped inside the tank behind the water line.'],
          ['Clean the seat', 'A new flapper on a crusty seat still leaks. Rub the seat smooth with a non-scratch pad before fitting it.'],
          ['Replace the fill valve while you’re there', 'If the fill valve is 10+ years old or noisy, swap it while the tank is empty. It’s about 20 minutes and $15.'],
          ['Skip the tank tablets', 'Bleach and chlorine tablets eat flappers and seals and can void warranties. Clean the bowl instead.'],
          ['Ghost flush means flapper', 'If the toilet refills for a few seconds on its own every so often, water is leaking out at the flapper, not in at the fill valve.'],
        ],
        refs: [
          ['Fluidmaster 400A fill valve instructions (Fluidmaster)', 'https://hdsupplysolutions.com/wcsstore/ExtendedSitesCatalogAssetStore/product/fm/additional/Fl/Fluidmaster_575250_Instructions_400A%20Instructions_Original.pdf'],
          ['Fluidmaster 400A fill valve (Chadwell Supply)', 'https://www.chadwellsupply.com/resources/articles/maintenance-library/plumbing/fluidmaster-400a-fill-valve/'],
          ['How to fix a loud or broken fill valve (Korky)', 'https://korky.com/toilet-repair-help/loud-or-broken-fill-valve'],
          ['How to troubleshoot a running toilet (This Old House)', 'https://www.thisoldhouse.com/bathrooms/how-to-troubleshoot-a-running-toilet'],
          ['Fix leaky toilets (Milwaukee Water Works)', 'https://www.milwaukee.gov/ImageLibrary/Groups/WaterWorks/files/FixLeakyToilets_2010.pdf'],
          ['How to fix leaks (EPA WaterSense archive)', 'https://19january2017snapshot.epa.gov/www3/watersense/our_water/howto.html'],
        ],
      },
      {
        id: 'toilet-clog',
        title: 'Clogged toilet',
        model: 'toilet',
        level: 1,
        time: '15–30 min',
        cost: '$0–35',
        renter: true,
        summary: 'Most toilet clogs clear with a flange plunger (the kind with a soft sleeve under the cup) used the right way. A closet auger, a short crank-turned snake, handles the stubborn ones without scratching the bowl.',
        intro: { hi: ['bowl'] },
        safety: [
          'Don’t flush again if the bowl is already high. Stop the tank refill first.',
          'Never mix chemical drain cleaners with plunging. Splashback can burn skin and eyes.',
          'Wear rubber gloves and eye protection, and never pour boiling water in; it can crack porcelain.',
        ],
        causes: [
          ['Too much paper at once', 'The most common cause by far, especially with low-flow toilets.'],
          ['Wipes or hygiene products', 'They don’t break down, even ones labeled “flushable.”'],
          ['Small object', 'Toys, bottle caps or a phone wedge in the trapway and need the auger, or pulling the toilet.'],
          ['Main line blockage', 'If tubs or other drains gurgle or back up when you flush, the problem is past the toilet.'],
        ],
        tools: [
          'Flange plunger (fold-out rubber sleeve)',
          'Closet auger, 3′ or 6′',
          'Rubber gloves and safety glasses',
          'Old towels',
          'Bucket',
          'Dish soap (optional)',
        ],
        steps: [
          { t: 'Stop more water from coming in', d: 'If the bowl is rising, lift the tank lid and press the flapper (the rubber flap at the bottom of the tank) down, or turn the shutoff valve behind the toilet clockwise.', why: 'Stopping the refill keeps the bowl from overflowing onto the floor.', tip: 'Lifting the float (the plastic cup or ball on the fill valve) stops the refill instantly while you reach for the shutoff. Lay towels around the base before you plunge.', ok: 'The water in the bowl stops rising.', v: { cam: [1.4, 2.6, 1.6], at: [0, 1.2, -0.3], hi: ['flapper', 'knob'], xray: true } },
          { t: 'Seat the flange plunger', d: 'Fold out the sleeve and fit it into the hole at the bottom of the bowl so the cup is covered with water. If the bowl is too full, bail some into a bucket. Push down slowly once to squeeze the air out.', why: 'Water passes your push straight to the clog; trapped air just squishes. A slow first push also keeps dirty water from splashing.', tip: 'Run the plunger cup under hot tap water for a minute so the rubber softens and seals better. If the bowl is nearly empty, add water until the cup is covered.', ok: 'The cup is underwater, centered on the outlet, and you feel firm resistance when you push.', v: { cam: [1.6, 2.0, 2.0], at: [0, 0.7, 0.3], hi: ['plunger'], show: ['plunger'], mv: { plunger: [0, -0.1, 0] } } },
          { t: 'Plunge with sharp strokes', d: 'Keeping the seal, pump firmly in and out 15–20 times, then pull up sharply to break the seal. Repeat 3–5 rounds.', why: 'The pull matters as much as the push. Alternating pressure rocks the clog loose in both directions.', tip: 'Keep the handle straight up and down; tilting it breaks the seal. If nothing changes after 5 rounds, switch to the auger rather than plunging harder.', ok: 'The water suddenly drops with a gurgling rush.', v: { cam: [1.6, 1.8, 2.0], at: [0, 0.7, 0.3], hi: ['plunger'], fx: 'plunge' } },
          { t: 'Use a closet auger if needed', d: 'Pull the cable back so only the coiled tip shows at the curved end. Set the rubber-sleeved bend in the bowl outlet, then turn the crank clockwise while pushing the handle down. When it stops, keep cranking and push gently, then pull it back while still cranking clockwise.', why: 'The rubber sleeve protects the porcelain. The coiled tip breaks up the clog or hooks the object so you can pull it out.', tip: 'Never yank the cable out without cranking; it kinks. If you hit a hard object that won’t hook, the toilet may need to come off the floor so it can be pushed out from below.', ok: 'The cable spins freely, and the water drains when you pull the auger back.', v: { cam: [1.8, 2.4, 2.4], at: [0, 0.8, 0.4], hi: ['auger'], show: ['auger'], hide: ['plunger'] } },
          { t: 'Test with a bucket pour', d: 'Pour about a gallon of water from a bucket into the bowl quickly. If it drains briskly, open the shutoff and flush normally.', why: 'A bucket can’t overflow the bowl the way a full flush can if the clog is still there.', tip: 'Drains slowly? The clog is only partly cleared; plunge another round. Clean the plunger and auger with hot soapy water and let them drip dry over the bowl.', ok: 'The test water swirls away in a few seconds and the next flush refills the bowl to its normal level.', v: { cam: [2.6, 2.4, 3.0], at: [0, 1.0, 0], hi: ['bowl'], hide: ['auger'] } },
        ],
        learn: {
          how: 'The bowl drains through a built-in curved channel in the porcelain, the trapway. Flushing pushes in a burst of water that fills the trapway and starts a siphon, which pulls the bowl empty. A clog stops the siphon from forming, so water just rises instead.',
          specs: [
            ['Trapway diameter', 'about 2″'],
            ['Plunger strokes per round', '15–20'],
            ['Closet auger reach', '3–6′'],
            ['Modern flush volume', '1.28–1.6 gal'],
          ],
          terms: [
            ['Flange plunger', 'Plunger with a soft sleeve that fits a toilet outlet. Flat cups are for sinks and tubs.'],
            ['Closet auger', 'Short crank snake with a bent, rubber-sleeved tube made for toilets.'],
            ['Trapway', 'The curved channel inside the toilet that holds water and leads to the drain.'],
            ['Siphon', 'Flow that keeps going once a pipe fills, pulled by gravity on the far side.'],
          ],
          mistakes: [
            'Using a flat sink plunger on a toilet.',
            'Flushing again and again to “push it through.”',
            'Pouring chemical cleaner into a full bowl.',
            'Yanking the auger cable out without cranking.',
          ],
          tips: [
            'A squirt of dish soap and a bucket of hot (not boiling) tap water can soften a paper clog in 15–20 minutes.',
            'Keep a flange plunger next to every toilet so nobody is tempted to flush twice.',
          ],
        },
        pro: 'Call a plumber or drain service if several drains back up at once, water rises in the tub when you flush, or the auger can’t get through. That points to a main sewer line blockage.',
        tricks: [
          ['Buy the right plunger', 'Flange (toilet) plungers seal the outlet; flat cup plungers are for sinks and tubs. A $10 flange plunger beats a $5 cup one every time.'],
          ['Soap and hot water first', 'For a paper clog, squirt in dish soap and add a bucket of hot tap water. Wait 15–20 minutes, then plunge.'],
          ['Know the shutoff before you need it', 'Find and test the valve behind each toilet now, so an overflow is a 2-second fix later.'],
          ['Skip the chemicals', 'Drain cleaners rarely work on toilet clogs and make plunging dangerous; a plumber may charge extra to deal with them.'],
          ['Wipes are the usual repeat offender', 'If clogs keep coming back, stop flushing wipes and paper towels, and consider a camera inspection of the line.'],
          ['Pull the toilet for solid objects', 'A toy or phone deep in the trapway often comes out from the bottom with the toilet off the floor (about an hour and a new wax ring).'],
        ],
        refs: [
          ['K-3 Toilet Auger (RIDGID)', 'https://www.ridgid.com/pr/en/toilet-augers'],
          ['Handy Augers operating instructions (General Pipe Cleaners / Drain Brain)', 'https://drainbrain.com/wp-content/uploads/2024/09/Handy-Augers-ENG-FR-SP-0513.pdf'],
          ['How to Unclog a Toilet with an Auger (iFixit)', 'https://de.ifixit.com/Anleitung/How+to+Unclog+a+Toilet+with+an+Auger/169904?lang=en'],
          ['An overview of plumbing trap requirements under the IPC (ICC Building Safety Journal)', 'https://www.iccsafe.org/building-safety-journal/bsj-technical/an-overview-of-plumbing-trap-requirements-under-the-international-plumbing-code/'],
        ],
      },
      {
        id: 'sink-clog',
        title: 'Slow or clogged sink drain',
        model: 'ptrap',
        level: 1,
        time: '30–45 min',
        cost: '$0–20',
        renter: true,
        summary: 'Bathroom sinks clog with hair and soap on the pop-up stopper or in the P-trap, the U-shaped pipe under the sink. Both come apart by hand in about 30 minutes.',
        intro: { hi: ['trap', 'clog'], xray: true },
        safety: [
          'Skip chemical drain cleaner if you plan to open the trap; it will be sitting in the pipe. If you already used some, wear goggles and gloves and flush with lots of water first.',
          'Wear gloves; the debris is unpleasant and can carry bacteria.',
        ],
        causes: [
          ['Hair on the stopper', 'Hair wraps the pop-up stopper and its rod and catches soap.'],
          ['Clog in the P-trap', 'Gunk settles at the bottom of the U-bend.'],
          ['Clog past the trap', 'In the trap arm or the pipe inside the wall; needs a snake.'],
          ['Clogged overflow or vent', 'If the sink gurgles and drains slowly after cleaning, a blocked vent may be the cause.'],
        ],
        tools: [
          'Bucket',
          'Rubber gloves and safety glasses',
          'Old toothbrush or bottle brush',
          'Tongue-and-groove pliers (only if nuts are stuck)',
          'Plastic barbed drain stick',
          'Hand drain snake, ¼″ cable',
          'Rags and paper towels',
          'Flashlight',
        ],
        steps: [
          { t: 'Pull and clean the stopper', d: 'Try lifting the pop-up stopper straight out. If it’s held, reach behind the tailpiece (the straight pipe under the drain), unscrew the pivot nut, slide the rod out, and lift the stopper. Pull off the hair and scrub it clean.', why: 'Most bathroom “clogs” are a hair mat on the stopper. Cleaning it often fixes everything.', tip: 'Hold a cup under the pivot nut; a little water drips out. Note which hole in the metal strap the rod was in so the stopper opens the same amount afterward.', ok: 'With the stopper out, water poured into the sink runs straight down without pooling.', v: { cam: [1.2, 2.4, 1.4], at: [0, 1.5, 0], hi: ['stopper'], mv: { stopper: [0, 0.55, 0.2] } } },
          { t: 'Set a bucket under the trap', d: 'Clear out the cabinet, lay rags on its floor, and place a bucket under the P-trap.', why: 'The trap holds about a cup of standing water, plus whatever the clog is holding back.', tip: 'If the basin is full of water, bail it out with a cup first so you aren’t opening a pipe full of dirty water.', ok: 'The bucket sits right under the U-bend and the cabinet floor is covered.', v: { cam: [1.8, 1.0, 1.8], at: [0.15, 0.5, 0], hi: ['bucket'], show: ['bucket'] } },
          { t: 'Loosen the slip nuts', d: 'Turn both slip nuts (the big ring nuts at each end of the U-bend) counterclockwise by hand. Use pliers gently only if they’re stuck.', why: 'Plastic nuts crack under pliers, so hand-tight is the rule both coming off and going on.', tip: 'A rubber glove adds a lot of grip. Old metal traps can be paper-thin; if the pipe flexes or flakes, plan to replace the trap with a $10–15 plastic one.', ok: 'Both nuts spin freely and slide along the pipe.', v: { cam: [1.4, 1.0, 1.3], at: [0.18, 0.75, 0], hi: ['nutA', 'nutB'], rt: { nutA: [0, 180, 0], nutB: [0, 180, 0] }, mv: { nutA: [0, -0.08, 0], nutB: [0, -0.08, 0] } } },
          { t: 'Remove and clean the trap', d: 'Lower the U-bend, pour it into the bucket, and scrub it out with a brush. Keep the tapered plastic washers.', why: 'The U-bend holds a water seal that blocks sewer gas, and heavy debris settles at its bottom.', tip: 'While everything is open, shine a flashlight into the tailpiece and the trap arm and pull out anything you can reach.', ok: 'You can see light straight through the clean trap.', v: { cam: [1.6, 1.0, 1.6], at: [0.2, 0.45, 0], hi: ['trap', 'clog'], mv: { trap: [0, -0.18, 0.3], nutA: [0, -0.2, 0.3], nutB: [0, -0.2, 0.3] } } },
          { t: 'Snake the trap arm if needed', d: 'If the trap was clean, feed the snake into the trap arm toward the wall. Crank clockwise as you push; when it stops, work it back and forth, then pull it out and wipe the cable.', why: 'A clean trap means the blockage is farther down the line inside the wall.', tip: 'Keep only 6–8″ of cable out of the drum while cranking so it doesn’t kink. If it won’t pass after 10 minutes, stop; the clog is deeper and may need a plumber.', ok: 'The cable pushes on freely and comes back with debris on its tip.', v: { cam: [1.8, 1.4, 1.4], at: [0.4, 0.95, -0.3], hi: ['snake', 'trapArm'], show: ['snake'] } },
          { t: 'Reassemble and test', d: 'Slide the nuts and washers back on with the tapered side of each washer pointing into the joint. Hand-tighten each nut, plus about a quarter turn. Fill the basin, pull the stopper, and wipe every joint with a dry paper towel.', why: 'A full basin releases far more water at once than the tap, so it shows a slow leak at a nut.', tip: 'Still drips? Loosen the nut, line the pipe up so it enters straight, and retighten. Replace a cracked or flattened washer ($2).', ok: 'A full basin drains in a few seconds and the paper towels stay dry.', v: { cam: [2.2, 1.6, 2.2], at: [0.15, 0.8, 0], hi: ['nutA', 'nutB'], hide: ['snake'], mv: { trap: [0, 0, 0], nutA: [0, 0, 0], nutB: [0, 0, 0] }, rt: { nutA: [0, 0, 0], nutB: [0, 0, 0] }, show: ['stopper'] } },
        ],
        learn: {
          how: 'Every fixture drain has a trap, a U-shaped bend that always holds a little water. That water plug blocks sewer gas from coming up into the room. The trap arm then carries waste to the vent and drain pipes in the wall. Clogs collect where the flow slows down: at the stopper and at the bottom of the U.',
          specs: [
            ['Bathroom sink drain size', '1¼″'],
            ['Kitchen sink drain size', '1½″'],
            ['Trap seal depth (code)', '2–4″ of water'],
            ['Slip nut tightening', 'hand-tight plus about ¼ turn'],
          ],
          terms: [
            ['P-trap', 'U-bend plus a horizontal arm, shaped like a P on its side.'],
            ['Slip nut', 'Hand-tight nut that squeezes a tapered washer to seal.'],
            ['Tailpiece', 'Straight pipe from the sink drain down to the trap.'],
            ['Pivot nut', 'Nut on the back of the tailpiece that holds the stopper rod.'],
            ['Trap arm', 'Pipe from the trap into the wall.'],
          ],
          mistakes: [
            'Installing a slip washer backwards. The tapered side must point into the joint, away from the nut.',
            'Overtightening plastic nuts until they crack.',
            'Pouring chemical cleaner and then opening the trap.',
          ],
          tips: [
            'A $3 plastic barbed drain stick clears stopper hair without removing anything.',
            'Once a month, fill the basin with hot water and pull the stopper to flush soap scum.',
          ],
        },
        pro: 'Call a plumber if the clog is past the wall, several fixtures are slow at once, or the trap is old metal that crumbles when you touch it.',
        tricks: [
          ['Try the barbed stick first', 'Push a $3 plastic barbed strip down past the stopper and pull. Half the time the whole clog comes out in one go.'],
          ['Full-basin flush test', 'Filling the sink and pulling the plug puts much more water through than running the tap. Use it to test both drain speed and leaks.'],
          ['Upgrade old metal traps', 'Chrome-plated metal traps rust thin from the inside. A plastic trap kit costs about $10 and won’t corrode.'],
          ['Take a photo before taking apart', 'A quick photo of the trap and stopper rod saves guessing which way the washers and strap went.'],
          ['Washer direction', 'If a joint keeps dripping, the washer is often backward. Taper toward the joint, flat side toward the nut.'],
          ['Hair catcher', 'Some pop-up stoppers can be swapped for a strainer-style stopper that catches hair on top where you can wipe it off.'],
        ],
        refs: [
          ['An overview of plumbing trap requirements under the IPC (ICC Building Safety Journal)', 'https://www.iccsafe.org/building-safety-journal/bsj-technical/an-overview-of-plumbing-trap-requirements-under-the-international-plumbing-code/'],
          ['How to install slip joint washers in plumbing (Hunker)', 'https://www.hunker.com/13417096/how-to-install-slip-joint-washers-in-plumbing'],
          ['Simple Plumbing Repairs in the Home, USDA Farmers’ Bulletin 1460 (Project Gutenberg)', 'https://gutenberg.org/cache/epub/62592/pg62592-images.html'],
          ['How to install a 2-inch slip joint washer (EngineerFix)', 'https://engineerfix.com/how-to-install-a-2-inch-slip-joint-washer/'],
        ],
      },
    ],
  });

  /* ================= More plumbing: faucet types, kitchen sink, shower, tub, toilet seal, frozen pipe ================= */
  function shutoffs(K, xs) {
    const valves = K.part('valves', [0, 0, 0], null, 'Shutoff valves');
    [['H', xs[0], 'red'], ['C', xs[1], 'blue']].forEach(([s, x, col]) => {
      K.cyl(valves, [0.05, 0.05, 0.22], 'chrome', [x, 0.6, -0.76], [90, 0, 0]);
      K.cyl(valves, [0.045, 0.045, 0.2], 'chrome', [x, 0.72, -0.68]);
      const knob = K.part('knob' + s, [x, 0.6, -0.62], null, s === 'H' ? 'Hot shutoff' : 'Cold shutoff');
      K.box(knob, [0.16, 0.06, 0.04], col);
      K.tube(null, [[x, 0.82, -0.68], [x, 1.05, -0.62], [x * 0.9, 1.32, -0.5], [x * 0.9, 1.5, -0.45]], 0.022, 'steel');
    });
  }

  /* ---- Model: two-handle compression faucet (washer & seat) ---- */
  TB.model('faucetComp', Object.assign({ cam: [2.4, 2.6, 2.6], at: [0, 1.75, -0.3] }, BATH), (K) => {
    vanity(K);
    shutoffs(K, [-0.42, 0.42]);
    const spout = K.part('spout', [0, 1.5, -0.45], null, 'Spout');
    K.cyl(spout, [0.1, 0.12, 0.12], 'chrome', [0, 0.06, 0]);
    K.tube(spout, [[0, 0.1, 0], [0, 0.32, 0.08], [0, 0.34, 0.3], [0, 0.24, 0.42]], 0.045, 'chrome');
    const drip = K.drip(spout, [0, 0.2, 0.42], 0.6);
    ['H', 'C'].forEach((s, i) => {
      const x = i ? 0.42 : -0.42;
      const esc = K.part('body' + s, [x, 1.5, -0.45], null, s === 'H' ? 'Hot valve body' : 'Cold valve body');
      K.cyl(esc, [0.12, 0.14, 0.06], 'chrome', [0, 0.03, 0]);
      K.cyl(esc, [0.07, 0.07, 0.3], 'brass', [0, -0.15, 0]);
      const seat = K.part('seat' + s, [0, -0.22, 0], esc, 'Valve seat');
      K.tor(seat, [0.035, 0.012, 360], 'brass', [0, 0, 0], [90, 0, 0]);
      const stem = K.part('stem' + s, [x, 1.58, -0.45], null, 'Stem');
      K.cyl(stem, [0.03, 0.03, 0.34], 'brass', [0, -0.08, 0]);
      K.rep(8, (k) => K.tor(stem, [0.031, 0.006], 'brass', [0, -0.05 - k * 0.02, 0], [90, 0, 0]));
      K.nut(stem, 0.13, 0.06, 'brass', [0, 0.02, 0]);
      const washer = K.part('washer' + s, [0, -0.26, 0], stem, 'Rubber washer + brass screw');
      K.cyl(washer, [0.036, 0.036, 0.025, 20], 'rubber');
      K.cyl(washer, [0.01, 0.01, 0.01, 12], 'brass', [0, -0.016, 0]);
      const oring = K.part('oring' + s, [0, -0.02, 0], stem, 'Stem O-ring');
      K.tor(oring, [0.032, 0.006], 'rubber', [0, 0, 0], [90, 0, 0]);
      const handle = K.part('handle' + s, [x, 1.7, -0.45], null, s === 'H' ? 'Hot handle' : 'Cold handle');
      K.cyl(handle, [0.05, 0.06, 0.1], 'chrome', [0, 0, 0]);
      K.rep(4, (k) => K.box(handle, [0.22, 0.035, 0.04], 'chrome', [Math.cos((k * Math.PI) / 2) * 0.09, 0.02, Math.sin((k * Math.PI) / 2) * 0.09], [0, (-k * 90), 0], 0.012));
      const cap = K.part('cap' + s, [0, 0.06, 0], handle, 'Index cap');
      K.cyl(cap, [0.045, 0.045, 0.02], s === 'H' ? 'red' : 'blue');
      const scr = K.part('screw' + s, [0, 0.045, 0], handle, 'Handle screw');
      K.cyl(scr, [0.015, 0.015, 0.01, 12], 'chrome');
    });
    return { tick: (t, fx) => drip.tick(t, fx === 'drip') };
  });

  /* ---- Model: single-handle ball faucet ---- */
  TB.model('faucetBall', Object.assign({ cam: [2.4, 2.6, 2.6], at: [0, 1.85, -0.35] }, BATH), (K) => {
    vanity(K);
    shutoffs(K, [-0.32, 0.32]);
    const body = K.part('body', [0, 1.5, -0.45], null, 'Faucet body');
    K.cyl(body, [0.14, 0.18, 0.4], 'chrome', [0, 0.2, 0]);
    K.cyl(body, [0.26, 0.28, 0.03], 'chrome', [0, 0.015, 0]);
    const spoutG = K.part('spoutSleeve', [0, 0.28, 0], body, 'Swivel spout');
    K.cyl(spoutG, [0.16, 0.16, 0.12], 'chrome');
    K.tube(spoutG, [[0, 0, 0.15], [0, 0.02, 0.4], [0, -0.06, 0.62]], 0.045, 'chrome');
    const orings = K.part('bodyOrings', [0, 0.18, 0], body, 'Body O-rings');
    K.tor(orings, [0.145, 0.012], 'rubber', [0, 0.06, 0], [90, 0, 0]);
    K.tor(orings, [0.145, 0.012], 'rubber', [0, -0.04, 0], [90, 0, 0]);
    const seats = K.part('seats', [0, 0.36, 0], body, 'Seats & springs (×2)');
    [-0.05, 0.05].forEach((x) => {
      K.cyl(seats, [0.018, 0.018, 0.015, 16], 'rubber', [x, 0.015, 0]);
      K.tor(seats, [0.01, 0.003, 360], 'steel', [x, 0.0, 0], [90, 0, 0]);
    });
    const ball = K.part('ball', [0, 0.47, 0], body, 'Rotating ball');
    K.sph(ball, 0.085, K.phys(0xd8dde2, { metalness: 1, roughness: 0.15 }));
    K.cyl(ball, [0.015, 0.015, 0.14, 12], 'chrome', [0, 0.1, 0]);
    K.cyl(ball, [0.015, 0.015, 0.002, 12], 'black', [0.07, 0.02, 0.04]);
    const cam = K.part('cam', [0, 0.55, 0], body, 'Cam & packing');
    K.cyl(cam, [0.09, 0.09, 0.04, 24], 'white');
    K.cyl(cam, [0.08, 0.08, 0.02, 24], 'rubber', [0, -0.03, 0]);
    const cap = K.part('cap', [0, 0.6, 0], body, 'Cap with adjusting ring');
    K.lathe(cap, [[0.15, 0], [0.15, 0.06], [0.12, 0.1], [0.05, 0.12], [0.05, 0.13]], 'chrome');
    const ring = K.part('ring', [0, 0.12, 0], cap, 'Adjusting ring');
    K.tor(ring, [0.05, 0.012], 'brass', [0, 0, 0], [90, 0, 0]);
    const handle = K.part('handle', [0, 0.76, 0], body, 'Lever handle');
    K.cyl(handle, [0.07, 0.08, 0.08], 'chrome');
    K.box(handle, [0.06, 0.04, 0.42], 'chrome', [0, 0.05, 0.22], [-10, 0, 0], 0.015);
    const ss = K.part('setScrew', [0, -0.01, 0.08], handle, 'Handle set screw');
    K.cyl(ss, [0.012, 0.012, 0.02, 6], 'dark', [0, 0, 0], [90, 0, 0]);
    const drip = K.drip(spoutG, [0, -0.1, 0.62], 0.75);
    return { tick: (t, fx) => drip.tick(t, fx === 'drip') };
  });

  /* ---- Model: double kitchen sink with garbage disposal ---- */
  TB.model('kitchenSink', { cam: [2.4, 1.8, 2.6], at: [0, 0.9, 0], env: 'studio', tex: ['white_plaster_02', 'granite_tile', 'plank_flooring', 'oak_wood_planks'], ground: { tex: 'plank_flooring', repeat: 5, radius: 6 }, hidden: ['bucket', 'cupPlunger', 'snake'] }, (K) => {
    K.box(null, [3.6, 2.6, 0.06], K.pbr('white_plaster_02', [2, 2], {}, 'drywall'), [0, 1.3, -0.8]);
    const top = K.part('counter', [0, 0, 0], null, 'Countertop');
    K.box(top, [3.2, 0.08, 1.4], K.pbr('granite_tile', [1.5, 0.8], { roughness: 0.35 }, 'offwhite'), [0, 1.62, -0.1], null, 0.02);
    const sinkMat = K.std(0xc9ced3, { metalness: 0.9, roughness: 0.3 });
    const basins = K.part('basins', [0, 0, 0], null, 'Double stainless sink');
    [-0.42, 0.42].forEach((x) => {
      K.box(basins, [0.76, 0.02, 0.6], sinkMat, [x, 1.3, 0], null, 0.005);
      K.box(basins, [0.76, 0.32, 0.02], sinkMat, [x, 1.46, 0.3]);
      K.box(basins, [0.76, 0.32, 0.02], sinkMat, [x, 1.46, -0.3]);
      K.box(basins, [0.02, 0.32, 0.6], sinkMat, [x - 0.38, 1.46, 0]);
      K.box(basins, [0.02, 0.32, 0.6], sinkMat, [x + 0.38, 1.46, 0]);
    });
    const water = K.part('standingWater', [0.42, 1.38, 0], null, 'Standing water');
    K.box(water, [0.72, 0.12, 0.56], 'water');
    const stopper = K.part('stopperR', [-0.42, 1.315, 0], null, 'Basket strainer (plugged)');
    K.cyl(stopper, [0.06, 0.06, 0.02, 24], 'chrome');
    const disp = K.part('disposal', [0.42, 1.05, 0], null, 'Garbage disposal');
    K.cyl(disp, [0.13, 0.12, 0.42, 32], K.std(0x2c3036, { roughness: 0.4 }), [0, 0, 0]);
    K.cyl(disp, [0.08, 0.08, 0.06, 24], 'chrome', [0, 0.24, 0]);
    const hex = K.part('hexSocket', [0, -0.215, 0], disp, 'Hex socket (bottom)');
    K.cyl(hex, [0.012, 0.012, 0.01, 6], 'black');
    const reset = K.part('reset', [0.12, -0.15, 0.04], disp, 'Red reset button');
    K.cyl(reset, [0.015, 0.015, 0.02, 12], 'red', [0, 0, 0], [0, 0, 90]);
    const dw = K.part('dwHose', [0, 0, 0], null, 'Dishwasher drain hose');
    K.tube(dw, [[0.55, 1.12, 0], [0.8, 1.3, -0.4], [1.2, 0.9, -0.5], [1.4, 0.3, -0.3]], 0.015, 'black');
    const trap = K.part('trap', [0, 0, 0], null, '1½″ P-trap');
    K.tube(trap, [[0.42, 0.84, 0.0], [0.42, 0.72, 0.06], [0.0, 0.66, 0.06], [-0.42, 0.66, 0.06], [-0.42, 0.66, 0.06]], 0.04, 'pvc');
    K.cyl(trap, [0.04, 0.04, 0.34], 'pvc', [-0.42, 1.12, 0]);
    K.tor(trap, [0.12, 0.045, 180], 'pvc', [-0.3, 0.6, 0.06], [0, 0, 180]);
    K.tube(trap, [[-0.18, 0.66, 0.06], [-0.18, 0.72, -0.2], [-0.15, 0.74, -0.78]], 0.045, 'pvc');
    const nuts = K.part('slipNuts', [0, 0, 0], null, 'Slip nuts');
    K.cyl(nuts, [0.06, 0.06, 0.05, 12], 'pvc', [-0.42, 0.68, 0.06]);
    K.cyl(nuts, [0.06, 0.06, 0.05, 12], 'pvc', [-0.18, 0.68, 0.06]);
    const cab = K.group(null);
    const wood = K.pbr('oak_wood_planks', [1, 1], { color: 0xe9e2d6 }, 'offwhite');
    K.box(cab, [0.05, 1.55, 1.3], wood, [-1.55, 0.78, -0.15]);
    K.box(cab, [0.05, 1.55, 1.3], wood, [1.55, 0.78, -0.15]);
    K.box(cab, [3.1, 0.05, 1.3], wood, [0, 0.12, -0.15]);
    const cup = K.part('cupPlunger', [0.42, 1.4, 0], null, 'Cup (sink) plunger');
    K.lathe(cup, [[0.0, 0.0], [0.13, 0.0], [0.12, 0.08], [0.04, 0.12], [0, 0.12]], 'red');
    K.cyl(cup, [0.02, 0.02, 0.7], 'hickory', [0, 0.45, 0]);
    const bucket = K.part('bucket', [-0.2, 0, 0.1], null, 'Bucket');
    K.lathe(bucket, [[0, 0], [0.3, 0], [0.34, 0.38], [0.35, 0.38]], 'sky');
    const snake = K.part('snake', [-0.15, 0.74, 0.3], null, 'Drain snake');
    K.cyl(snake, [0.11, 0.11, 0.11], 'yellow', [0, 0, 0.05], [90, 0, 0]);
    K.tube(snake, [[0, 0, 0], [0, 0.0, -0.5], [0, 0, -1.0]], 0.01, 'steel');
    return {
      tick(t, fx) {
        if (fx === 'plunge') K.parts.cupPlunger.position.y = 1.36 + 0.04 * Math.sin(t * 7);
      },
    };
  });

  /* ---- Model: shower head on an arm ---- */
  TB.model('shower', Object.assign({ cam: [1.6, 2.2, 1.8], at: [0, 2.0, -0.5] }, BATH, { hidden: ['newHead', 'tape'] }), (K) => {
    const tiles = K.pbr('floor_tiles_06', [2, 2], {}, 'offwhite');
    K.box(null, [2.4, 3, 0.06], tiles, [0, 1.5, -0.9]);
    K.box(null, [0.06, 3, 1.8], tiles, [-1.2, 1.5, 0]);
    const arm = K.part('arm', [0, 2.3, -0.87], null, 'Shower arm');
    K.cyl(arm, [0.12, 0.12, 0.02, 32], 'chrome', [0, 0, 0.01], [90, 0, 0]);
    K.tube(arm, [[0, 0, 0.02], [0, 0.02, 0.2], [0, -0.06, 0.32]], 0.025, 'chrome');
    const threads = K.part('threads', [0, -0.08, 0.34], arm, 'Arm threads');
    K.rep(5, (i) => K.tor(threads, [0.026, 0.004], 'brass', [0, -i * 0.008, 0], [90, 0, 0]));
    const tape = K.part('tape', [0, -0.08, 0.34], arm, 'Thread-seal tape (clockwise)');
    K.cyl(tape, [0.029, 0.029, 0.04, 16], K.std(0xffffff, { roughness: 0.9 }), [0, -0.015, 0]);
    const head = K.part('head', [0, 2.15, -0.53], null, 'Old shower head');
    K.nut(head, 0.08, 0.04, 'chrome', [0, 0.04, 0]);
    K.lathe(head, [[0.03, 0.03], [0.1, -0.02], [0.13, -0.08], [0.0, -0.09]], 'chrome');
    const scale = K.part('scale', [0, -0.088, 0], head, 'Clogged nozzles (mineral scale)');
    K.cyl(scale, [0.12, 0.12, 0.004, 24], K.std(0xe8e2cf, { roughness: 1 }));
    const nh = K.part('newHead', [0, 2.15, -0.53], null, 'New shower head');
    K.nut(nh, 0.08, 0.04, 'chrome', [0, 0.04, 0]);
    K.lathe(nh, [[0.03, 0.03], [0.11, -0.02], [0.14, -0.07], [0.0, -0.08]], 'black');
    const spray = K.part('spray', [0, 2.06, -0.53], null, 'Spray');
    K.cone(spray, [0.25, 0.9, 24, true], 'water', [0, -0.45, 0], [0, 0, 0]);
    return { tick: (t, fx) => (K.parts.spray.visible = fx === 'spray') };
  });

  /* ---- Model: bathtub drain ---- */
  TB.model('tubDrain', Object.assign({ cam: [1.4, 1.6, 1.8], at: [0, 0.35, 0] }, BATH, { hidden: ['zip'] }), (K) => {
    K.box(null, [2.6, 2.6, 0.06], K.pbr('floor_tiles_06', [2, 2], {}, 'offwhite'), [0, 1.3, -0.62]);
    const tub = K.part('tub', [0, 0, 0], null, 'Tub');
    K.box(tub, [2.4, 0.08, 1.1], 'white', [0, 0.04, 0]);
    K.box(tub, [2.4, 0.55, 0.08], 'white', [0, 0.3, 0.55]);
    K.box(tub, [2.4, 0.55, 0.08], 'white', [0, 0.3, -0.55]);
    K.box(tub, [0.08, 0.55, 1.1], 'white', [-1.2, 0.3, 0]);
    K.box(tub, [0.08, 0.55, 1.1], 'white', [1.2, 0.3, 0]);
    const stop = K.part('stopper', [-0.95, 0.09, 0], null, 'Drain stopper (toe-touch)');
    K.cyl(stop, [0.06, 0.06, 0.03, 24], 'chrome', [0, 0.015, 0]);
    K.cyl(stop, [0.012, 0.012, 0.06, 12], 'brass', [0, -0.02, 0]);
    const plate = K.part('overflow', [-1.15, 0.38, 0], null, 'Overflow plate');
    K.cyl(plate, [0.07, 0.07, 0.015, 24], 'chrome', [0, 0, 0], [0, 0, 90]);
    const hair = K.part('hair', [-0.95, 0.04, 0], null, 'Hair clog in the drain');
    K.sph(hair, 0.05, K.std(0x5a4a3a, { roughness: 1 }), [0, 0, 0], [1, 1.6, 1]);
    const water = K.part('water', [0, 0.14, 0], null, 'Slow-draining water');
    K.box(water, [2.2, 0.08, 0.98], 'water');
    const zip = K.part('zip', [-0.95, 0.25, 0.05], null, 'Barbed drain-cleaning strip');
    K.box(zip, [0.015, 0.45, 0.004], 'orange', [0, 0, 0], null, 0);
    K.rep(14, (i) => K.box(zip, [0.03, 0.006, 0.004], 'orange', [0.012, -0.2 + i * 0.03, 0], [0, 0, 30], 0));
  });

  /* ---- Model: toilet off its flange (wax ring) ---- */
  TB.model('toiletSeal', Object.assign({ cam: [2.2, 1.8, 2.4], at: [0, 0.4, 0] }, BATH, { hidden: ['newWax', 'rag'] }), (K) => {
    K.box(null, [3, 2.4, 0.06], K.pbr('white_plaster_02', [2, 1.5], {}, 'drywall'), [0, 1.2, -0.9]);
    const flange = K.part('flange', [0, 0.005, 0], null, 'Closet flange');
    K.cyl(flange, [0.2, 0.2, 0.012, 32], 'grey');
    K.cyl(flange, [0.12, 0.12, 0.02, 32, true], 'black', [0, -0.005, 0]);
    const bolts = K.part('bolts', [0, 0, 0], null, 'Closet bolts');
    [-0.16, 0.16].forEach((x) => K.cyl(bolts, [0.01, 0.01, 0.18, 8], 'brass', [x, 0.09, 0]));
    const oldWax = K.part('oldWax', [0, 0.03, 0], null, 'Old, squashed wax ring');
    K.tor(oldWax, [0.12, 0.035, 360], K.std(0xc9a46a, { roughness: 0.6 }), [0, 0, 0], [90, 0, 0]);
    const newWax = K.part('newWax', [0, 0.04, 0], null, 'New wax ring');
    K.tor(newWax, [0.12, 0.045, 360], K.std(0xe4c27d, { roughness: 0.5 }), [0, 0, 0], [90, 0, 0]);
    const rag = K.part('rag', [0, 0.02, 0], null, 'Rag stuffed in the drain');
    K.sph(rag, 0.09, 'sky', [0, 0, 0], [1, 0.4, 1]);
    const toilet = K.part('toilet', [0, 0, 0], null, 'Toilet');
    const b = K.lathe(toilet, [[0.14, 0], [0.26, 0], [0.3, 0.32], [0.48, 0.72], [0.56, 0.92], [0.55, 0.98]], 'white', [0, 0, 0.3]);
    b.scale.z = 1.3;
    K.box(toilet, [1.2, 0.8, 0.4], 'white', [0, 1.4, -0.45], null, 0.03);
    K.box(toilet, [0.45, 0.3, 0.45], 'white', [0, 0.82, -0.3]);
    const nuts = K.part('nuts', [0, 0, 0], null, 'Bolt caps & nuts');
    [-0.16, 0.16].forEach((x) => K.cyl(nuts, [0.025, 0.03, 0.05, 16], 'white', [x, 0.06, 0.02]));
    const shim = K.part('shims', [0, 0, 0], null, 'Plastic shims');
    K.box(shim, [0.08, 0.01, 0.04], 'black', [0.3, 0.005, 0.5], null, 0);
  });

  /* ---- Model: frozen copper pipe in a crawlspace ---- */
  TB.model('frozenPipe', { cam: [1.8, 1.0, 1.8], at: [0, 0.6, 0], env: 'garage', tex: ['concrete_floor_01', 'wood_planks'], ground: { tex: 'concrete_floor_01', repeat: 4, radius: 6 }, hidden: ['heat', 'sleeve', 'drip'] }, (K) => {
    K.box(null, [3, 1.6, 0.1], K.pbr('concrete_floor_01', [2, 1], {}, 'concrete'), [0, 0.8, -0.7]);
    const joists = K.part('joists', [0, 0, 0], null, 'Floor joists');
    K.rep(4, (i) => K.box(joists, [0.06, 0.24, 1.6], K.pbr('wood_planks', [0.3, 2], {}, 'wood'), [-1.2 + i * 0.8, 1.48, 0]));
    const pipe = K.part('pipe', [0, 0, 0], null, 'Copper supply pipe');
    K.cyl(pipe, [0.025, 0.025, 2.8, 16], 'copper', [0, 1.2, -0.4], [0, 0, 90]);
    const ice = K.part('ice', [0.3, 1.2, -0.4], null, 'Frozen section (frost on pipe)');
    K.cyl(ice, [0.032, 0.032, 0.4, 16], K.std(0xe8f4ff, { roughness: 0.6, transparent: true, opacity: 0.85 }), [0, 0, 0], [0, 0, 90]);
    const valve = K.part('main', [-1.2, 1.2, -0.4], null, 'Main shutoff');
    K.cyl(valve, [0.04, 0.04, 0.12], 'brass', [0, 0, 0], [0, 0, 90]);
    const wheel = K.part('wheel', [0, 0.09, 0], valve, 'Valve handle');
    K.tor(wheel, [0.05, 0.01], 'red', [0, 0, 0], [90, 0, 0]);
    const faucet = K.part('faucet', [1.3, 1.2, -0.4], null, 'Open faucet (lets water flow)');
    K.cyl(faucet, [0.03, 0.03, 0.15], 'chrome', [0, -0.07, 0]);
    const drip = K.part('drip', [1.3, 1.1, -0.4], null, 'Trickle');
    K.cyl(drip, [0.008, 0.008, 0.6, 8], 'water', [0, -0.3, 0]);
    const heat = K.part('heat', [0.3, 1.0, -0.15], null, 'Hair dryer (never an open flame)');
    K.box(heat, [0.08, 0.2, 0.06], 'black', [0, -0.12, 0], null, 0.02);
    K.cyl(heat, [0.05, 0.04, 0.18, 20], 'black', [0, 0.02, -0.06], [90, 0, 0]);
    const sleeve = K.part('sleeve', [0, 1.2, -0.4], null, 'Foam pipe insulation');
    K.cyl(sleeve, [0.05, 0.05, 2.6, 16, true], K.std(0x55606b, { roughness: 1, side: THREE.DoubleSide }), [0, 0, 0], [0, 0, 90]);
  });

  /* ---------- Variants for existing repairs ---------- */
  const PLB = (id) => TB.repair('plumbing', id);
  const drip = PLB('faucet-drip');
  drip.variants = [
    { id: 'cartridge', name: 'Single-handle cartridge', blurb: 'One lever, smooth on/off. Most common today (Moen, Pfister, American Standard).' },
    {
      id: 'compression',
      name: 'Two-handle compression',
      blurb: 'Separate hot and cold handles that tighten down to stop. Common in older homes.',
      model: 'faucetComp',
      summary: 'Two-handle compression faucets close by squeezing a rubber washer onto a brass ring called the seat. A drip means a worn washer or a roughed-up seat. Both parts cost a few dollars, and you only open the side that leaks.',
      intro: { hi: ['washerH', 'seatH'], xray: true, fx: 'drip' },
      causes: [
        ['Worn washer', 'The rubber hardens and cracks from being squeezed shut thousands of times. Cranking the handles closed wears it faster.'],
        ['Pitted valve seat', 'Water wears grooves into the brass seat. A rough seat chews up even a brand-new washer.'],
        ['Worn stem O-ring or packing', 'Water seeps out around the handle instead of the spout when the faucet is on.'],
        ['Wrong washer on the hot side', 'A cold-only washer swells in hot water and slows or stops the hot flow.'],
      ],
      tools: [
        'Phillips and flat screwdrivers',
        'Adjustable wrench (and a second one or pliers to hold the body)',
        'Seat wrench, or a seat dresser for seats that don’t unscrew',
        'Washer and O-ring assortment (take the old stem to match)',
        'Silicone faucet grease',
        'Penetrating oil',
        'Flashlight',
        'Rag, towel and painter’s tape',
      ],
      steps: [
        { t: 'Find which side drips', d: 'Close the cold shutoff under the sink and watch the spout for a minute. If the drip stops, it’s the cold side; if not, reopen cold and close hot. Leave the leaking side’s valve closed, open that faucet handle to drain it, and close the sink drain.', why: 'Each handle is its own separate valve, so you only rebuild the side that leaks.', tip: 'Feeling the drip for warmth is unreliable because drips cool fast; the shutoff test is certain. If a shutoff won’t close, use the main house valve.', ok: 'The drip stopped when you closed one valve, and that handle now gives no water.', v: { cam: [1.4, 1.0, 1.4], at: [-0.42, 0.65, -0.65], hi: ['knobH'], rt: { knobH: [0, 0, 90] } } },
        { t: 'Pop off the index cap', d: 'Slide a thin flat screwdriver into the small notch at the edge of the red or blue button on top of the handle and pry gently upward.', why: 'The cap hides the screw that holds the handle on.', tip: 'Wrap the screwdriver tip with one layer of tape so it can’t gouge the chrome. Some caps unscrew instead of popping, so try twisting first if prying doesn’t work.', ok: 'You can see a screw head in the center of the handle.', v: { cam: [0.6, 2.4, 0.8], at: [-0.42, 1.78, -0.45], hi: ['capH'], mv: { capH: [0.2, 0.15, 0.2] }, tool: { id: 'flatScrewdriver', at: [-0.38, 1.8, -0.42], rot: [0, 0, 25] } } },
        { t: 'Remove the handle', d: 'Back the handle screw out counterclockwise and lift the handle straight up. If it’s stuck, rock it gently or warm it with a hair dryer for a minute.', why: 'Handles slide onto a ridged (splined) stem tip, and mineral crust can glue them on. Prying against the sink can crack it.', tip: 'Truly stuck? A $10 handle puller presses on the stem and lifts the handle evenly. Drop the screw into a cup, not onto the counter.', ok: 'The handle is off and you see the brass stem with ridges on its tip and a large nut below it.', v: { cam: [0.7, 2.5, 1.0], at: [-0.42, 1.9, -0.45], hi: ['screwH', 'handleH'], mv: { handleH: [0, 0.55, 0] }, tool: { id: 'screwdriver', at: [-0.42, 2.3, -0.45], anim: 'turn' } } },
        { t: 'Unscrew the stem', d: 'Turn the stem a half turn toward open (use the handle loosely if you need grip) so the washer isn’t pressed on the seat. Fit the wrench on the large packing nut and turn counterclockwise until the whole stem unscrews and lifts out.', why: 'The stem, washer and O-ring come out as one piece. Opening it first keeps the washer from dragging on the seat.', tip: 'Hold the faucet body still with a second wrench or pliers so the whole faucet doesn’t twist under the counter. A drop of penetrating oil and 10 minutes helps a crusty nut.', ok: 'The stem is out in your hand with a rubber washer on its bottom tip.', v: { cam: [0.7, 2.2, 1.0], at: [-0.42, 1.75, -0.45], hi: ['stemH'], mv: { stemH: [0, 0.45, 0] }, tool: { id: 'adjWrench', at: [-0.36, 2.05, -0.45], anim: 'turn' } } },
        { t: 'Replace the washer', d: 'Remove the small brass screw on the bottom of the stem, pry off the old washer, and press on a new one of the same size and shape (flat or beveled). Reinstall the screw until snug.', why: 'The washer must match exactly. Too small leaks, too big won’t seat, and a cold-only washer on the hot side swells and slows the flow.', tip: 'Take the whole stem to the hardware store and match the washer, screw and O-ring there. If the brass screw is corroded or its slot is chewed up, replace it too.', ok: 'The new washer sits flat and centered in its cup and doesn’t spin when you press on it.', v: { cam: [0.5, 1.9, 0.9], at: [-0.42, 1.8, -0.45], hi: ['washerH'], tool: { id: 'screwdriver', at: [-0.42, 1.74, -0.45], rot: [180, 0, 0], anim: 'turn' } } },
        { t: 'Check the seat', d: 'Shine a flashlight into the valve body and run a fingertip or cotton swab around the brass seat at the bottom. If it feels nicked or rough, unscrew it with a seat wrench and replace it, or smooth it with a seat dresser.', why: 'A rough seat cuts a new washer in days, and you’d be back to a drip.', tip: 'Look into the seat’s hole: a square or hex opening means it unscrews with a seat wrench (counterclockwise, firmly). A plain round hole means it’s fixed in place and needs a seat dresser ground in by hand.', ok: 'The seat feels perfectly smooth all the way around, like the rim of a glass.', v: { cam: [0.8, 1.9, 1.0], at: [-0.42, 1.3, -0.45], hi: ['seatH'], xray: true, tool: { id: 'hexKey', at: [-0.42, 1.28, -0.45], scale: 2.5 } } },
        { t: 'Grease and reassemble', d: 'Fit a new O-ring on the stem and coat it and the stem threads lightly with silicone grease. Thread the stem in by hand while it’s still in the open position, snug the packing nut with the wrench, then refit the handle and cap.', why: 'Threading it in open keeps the new washer from being crushed. Snug is enough; overtightening shortens the washer’s life.', tip: 'If the handle now points a different way than its partner, pull it off and re-seat it on the splines where it looks right.', ok: 'The stem turns smoothly by hand and the handle sits straight.', v: { cam: [1.6, 2.2, 1.8], at: [0, 1.7, -0.4], hi: ['oringH', 'stemH'], mv: { stemH: [0, 0, 0], handleH: [0, 0, 0], capH: [0, 0, 0] } } },
        { t: 'Restore water and test', d: 'Open the shutoff slowly and run the faucet for 30 seconds. Then close the handle gently, just until the water stops, and watch the spout and the handle for 5 minutes.', why: 'A slow open lets air out without a bang. The gentle close is how you should use it from now on; compression washers last years longer that way.', tip: 'Water seeping around the handle while it runs? Tighten the packing nut ⅛ turn. Still dripping from the spout? The seat needs work or the washer is the wrong size.', ok: 'No drip at the spout and a dry stem after 5 minutes.', v: { cam: [2.4, 2.6, 2.6], at: [0, 1.75, -0.3], hi: ['spout'], rt: { knobH: [0, 0, 0] } } },
      ],
      learn: {
        how: 'A compression valve is the simplest faucet design. Turning the handle screws a stem down until a rubber washer presses against a brass seat and seals, like a thumb over a hose. Because it seals by squeezing, the washer wears a little every time it closes, and cranking it closed speeds that up.',
        specs: [
          ['Typical washer sizes', '00, 0, ¼″, ⅜″, flat or beveled'],
          ['Hot side washer', 'must be rated for hot water'],
          ['Stem travel', 'about 1–3 turns from closed to full open'],
          ['Seat wrench sizes', 'about ⅛″–⅜″ square or hex'],
        ],
        terms: [
          ['Compression valve', 'Shuts off by pressing a washer onto a seat.'],
          ['Seat', 'Brass ring at the bottom of the valve that the washer seals against.'],
          ['Packing nut', 'Large nut that holds the stem in and squeezes its seal.'],
          ['Seat dresser', 'Hand tool that grinds a fixed seat smooth.'],
          ['Index cap', 'Red or blue button on top of the handle.'],
        ],
        mistakes: [
          'Cranking the handles closed to stop a drip.',
          'Using a washer that’s close but not the same size.',
          'Putting a cold-only washer on the hot side.',
          'Letting the whole faucet twist while loosening the packing nut.',
        ],
        tips: [
          'Rebuild both sides while you’re in there; they wore at the same rate.',
          'If parts are hard to find, many compression faucets accept drop-in replacement stems sold by brand; match yours at a plumbing supply house.',
        ],
      },
      tricks: [
        ['Rebuild both sides at once', 'The other side wore just as long and is next. Washers cost pennies and the shutoffs are already in reach.'],
        ['Take the stem shopping', 'Old faucets use dozens of stem and washer sizes. A plumbing supply counter can match the whole stem in a minute.'],
        ['Close gently forever', 'Turn just until the water stops. Cranking it shut is what killed the last washer.'],
        ['Keep a seat dresser', 'For faucets with fixed seats, a $10 dresser turns a rough seat smooth in a few twists, so a new washer actually lasts.'],
        ['Hold back with a second wrench', 'Brace the faucet body while loosening the packing nut so you don’t loosen the faucet’s mounting or crack old supply lines.'],
      ],
    },
    {
      id: 'ball',
      name: 'Single-handle ball',
      blurb: 'Round domed cap under the lever (classic Delta). Lever moves in all directions.',
      model: 'faucetBall',
      summary: 'Ball faucets (the classic Delta with a domed cap) use a slotted ball pressed on by two spring-loaded rubber seats. A drip means the seats and springs are worn; a $10–25 kit fixes it in under an hour.',
      intro: { hi: ['seats', 'ball'], xray: true, fx: 'drip' },
      causes: [
        ['Worn seats and springs', 'The rubber seats harden and the springs weaken, so water sneaks past the ball to the spout.'],
        ['Loose adjusting ring', 'The ring in the cap lets the ball ride up, causing leaks around the handle.'],
        ['Worn body O-rings', 'Water seeps out under the swivel spout.'],
        ['Scratched or crusty ball', 'Scale on the ball keeps the seats from sealing even after new ones go in.'],
      ],
      tools: [
        'Ball faucet repair kit for your brand (seats, springs, O-rings, cam, spanner tool)',
        'Hex key (usually 3/32″ or 7/64″)',
        'Tongue-and-groove pliers and painter’s tape',
        'Needle-nose pliers or a pencil',
        'Silicone faucet grease',
        'Utility knife (for old O-rings)',
        'Rag and two towels',
      ],
      steps: [
        { t: 'Shut off and prep', d: 'Turn both shutoffs under the sink clockwise until they stop and lift the handle to drain the lines. Close the drain and lay a towel in the basin.', why: 'The seats and springs are pea-sized and drop straight into an open drain.', tip: 'Lay a rag over the closed stopper too, and photograph the faucet before you start. If a shutoff won’t close, use the main house valve.', ok: 'The handle is open and no water comes out.', v: { cam: [1.6, 1.0, 1.4], at: [0, 0.65, -0.65], hi: ['knobH', 'knobC'], rt: { knobH: [0, 0, 90], knobC: [0, 0, 90] } } },
        { t: 'Remove the handle', d: 'Find the small set screw on the underside of the lever. Loosen it 2–3 turns counterclockwise with a hex key and lift the handle off.', why: 'The set screw clamps the lever to the ball’s stem.', tip: 'If the handle won’t lift, the screw isn’t loose enough; it doesn’t need to come all the way out. Push the key fully in so you don’t round the screw.', ok: 'The handle is off and you see a domed cap with a ring on top.', v: { cam: [0.8, 2.3, 1.2], at: [0, 2.3, -0.4], hi: ['setScrew', 'handle'], mv: { handle: [0, 0.4, 0] }, tool: { id: 'hexKey', at: [0, 2.65, -0.32], rot: [90, 0, 0], anim: 'turn', scale: 0.8 } } },
        { t: 'Unscrew the cap', d: 'Loosen the adjusting ring on top of the cap one turn with the kit’s spanner tool. Then turn the cap counterclockwise; if it won’t go by hand, wrap it in tape and use tongue-and-groove pliers gently.', why: 'Loosening the ring first takes pressure off the ball so the cap turns easily. Tape keeps the pliers off the chrome.', tip: 'Most caps spin off by hand once the ring is loose. Squeeze the pliers lightly; the cap is thin and dents.', ok: 'The cap lifts off and the ball’s stem sticks up through a plastic cam.', v: { cam: [0.9, 2.3, 1.2], at: [0, 2.25, -0.45], hi: ['cap'], mv: { cap: [0, 0.35, 0] }, tool: { id: 'pliers', at: [0.16, 2.48, -0.45], rot: [0, 0, -90], anim: 'squeeze' } } },
        { t: 'Lift out the cam and ball', d: 'Pull the plastic cam and its rubber packing straight up, then lift the ball out by its stem. Note how the slot in the ball sits over a small pin in the faucet body.', why: 'The slot and pin limit how far the ball can turn, so it only goes back one way.', tip: 'Take a photo looking straight down before you lift it. If the ball is scratched or crusty, replace it too; kits with a new ball cost only a little more.', ok: 'You can see two small rubber seats in holes at the bottom of the cavity.', v: { cam: [1.0, 2.3, 1.3], at: [0, 2.1, -0.45], hi: ['cam', 'ball'], mv: { cam: [0.3, 0.3, 0], ball: [-0.3, 0.3, 0] } } },
        { t: 'Replace seats and springs', d: 'Pick out the old seats and springs with needle-nose pliers or a pencil tip. Drop each new spring into its hole, then set a new seat on top, cupped side down over the spring and flat face up toward the ball.', why: 'The springs press the seats against the ball. Weak springs and hard seats are why water was sneaking past.', tip: 'Push a seat onto a pencil or hex key, slip the spring into it, and lower the pair into the hole together. If one jumps into the sink, the rag over the drain just paid for itself.', ok: 'Both seats sit level and spring back up when you press them with a fingertip.', v: { cam: [0.7, 2.2, 0.9], at: [0, 1.88, -0.45], hi: ['seats'], xray: true, tool: { id: 'linemans', at: [0.05, 1.9, -0.45], anim: 'squeeze', scale: 0.8 } } },
        { t: 'Check the body O-rings', d: 'If water leaked from under the spout, twist and pull the spout up off the body. Cut off the old O-rings with a knife, grease the new ones, roll them into the grooves, and press the spout back down.', why: 'These rings seal the swivel spout to the body. Grease lets the spout slide on without cutting them.', tip: 'Cut the old rings carefully so you don’t scratch the brass groove. Roll new ones over the body; don’t drag them across sharp threads.', ok: 'The spout turns smoothly and sits all the way down.', v: { cam: [1.2, 2.0, 1.4], at: [0, 1.7, -0.45], hi: ['bodyOrings'], mv: { spoutSleeve: [0, 0.3, 0] }, xray: true } },
        { t: 'Reassemble and adjust', d: 'Set the ball back with its slot over the pin, then the cam with its tab in the notch. Screw the cap on by hand. Open the shutoffs, turn the faucet on, and tighten the adjusting ring with the spanner until water stops seeping around the stem.', why: 'The ring sets how hard the cam presses on the ball. Too loose leaks at the stem; too tight makes the lever stiff.', tip: 'Adjust in small steps of about ⅛ turn with the water running. If the lever feels gritty or stiff, back the ring off a little.', ok: 'No water seeps around the stem with the faucet on, and the stem still moves easily.', v: { cam: [1.6, 2.4, 1.8], at: [0, 2.0, -0.4], hi: ['ring', 'cap'], mv: { cam: [0, 0, 0], ball: [0, 0, 0], cap: [0, 0, 0], spoutSleeve: [0, 0, 0] } } },
        { t: 'Handle on and test', d: 'Reinstall the handle and snug its set screw. Run hot and cold for a minute through the full range, then shut it off and watch the spout and cap for 5 minutes.', why: 'Some leaks only show after the faucet has moved through its full range.', tip: 'Still dripping from the spout? A seat may be upside down or not fully in its hole. Hot and cold feel reversed? The ball went in rotated; recheck the slot and pin.', ok: 'No drip from the spout and no water under the spout or around the cap.', v: { cam: [2.4, 2.6, 2.6], at: [0, 1.85, -0.35], hi: ['handle'], mv: { handle: [0, 0, 0] }, rt: { knobH: [0, 0, 0], knobC: [0, 0, 0] } } },
      ],
      learn: {
        how: 'Inside a ball faucet is a hollow ball with three holes: two inlets and one outlet. Moving the lever rolls the ball so its holes line up with the hot and cold inlets by different amounts. Two rubber seats, pushed up by small springs, seal against the ball. When they harden or the springs weaken, water leaks past to the spout.',
        specs: [
          ['Repair kit cost', '$10–25'],
          ['Seats and springs', '2 of each'],
          ['Adjusting ring', 'tighten in ⅛-turn steps with water on'],
          ['Handle set screw', 'usually 3/32″ or 7/64″ hex'],
        ],
        terms: [
          ['Ball', 'Slotted metal or plastic ball that sets flow and mix.'],
          ['Cam', 'Plastic piece above the ball that guides its movement.'],
          ['Adjusting ring', 'Ring in the cap that sets pressure on the ball.'],
          ['Seat', 'Small rubber cup the spring pushes against the ball.'],
        ],
        mistakes: [
          'Losing the tiny springs down the drain.',
          'Forgetting to line up the ball slot with the pin.',
          'Installing a seat upside down.',
          'Overtightening the adjusting ring so the lever won’t move.',
        ],
        tips: [
          'Buy the kit for your brand; Delta and Peerless use different parts from other ball faucets.',
          'Kits come with a spanner tool; keep it under the sink for future adjustments.',
        ],
      },
      tricks: [
        ['Get the kit with a ball', 'If the old ball shows scratches or crust, new seats alone won’t stop the drip. The full kit is only a few dollars more.'],
        ['Pencil placement', 'Stack seat and spring on a pencil eraser to drop them into the holes without fumbling.'],
        ['Adjust with water on', 'You can only see a stem leak with the water running, so make the final ring adjustment then.'],
        ['Leak under the spout is a separate fix', 'That’s the body O-rings, not the seats. Do both while it’s apart.'],
        ['Keep the spanner', 'A loose ring is the most common follow-up leak. A ⅛ turn with the kit tool fixes it in seconds.'],
      ],
    },
  ];
  // Tools on the cartridge version
  TB.useTool(drip, 3, { id: 'hexKey', at: [0, 3.2, -0.6], rot: [-90, 0, 0], anim: 'turn' });
  TB.useTool(drip, 4, { id: 'adjWrench', at: [0.15, 2.84, -0.45], anim: 'turn' });
  TB.useTool(drip, 5, { id: 'adjWrench', at: [0.15, 2.54, -0.45], anim: 'turn' });
  TB.useTool(drip, 6, { id: 'linemans', at: [0.75, 2.62, -0.45] });
  TB.useTool(PLB('faucet-pressure'), 2, { id: 'pliers', at: [0.08, 1.72, 0.2], rot: [0, 0, -90], anim: 'squeeze' });

  const running = PLB('toilet-running');
  running.variants = [
    { id: 'flapper', name: 'Flapper valve', blurb: 'A rubber flap on a hinge at the bottom of the tank, lifted by a chain.' },
    {
      id: 'canister',
      name: 'Canister (tower) valve',
      blurb: 'A tall plastic tower in the middle of the tank that lifts straight up.',
      model: 'toiletCanister',
      summary: 'Canister (tower) flush valves seal with a wide rubber gasket on their base. When the toilet runs, that gasket is usually worn or gritty. It twists off in minutes without removing the tank.',
      intro: { hi: ['canister', 'canSeal'], xray: true, fx: 'fill' },
      causes: [
        ['Worn or dirty canister seal', 'The most common cause with this design. Water leaks all around the circle into the bowl.'],
        ['Chain caught or too tight', 'Holds the canister slightly up off its seat.'],
        ['Water level too high', 'Water spills into the overflow nonstop.'],
        ['Scale on the seat', 'Crust on the ring the seal presses against keeps even a new seal from closing.'],
      ],
      tools: [
        'Replacement canister seal for your brand (Kohler, American Standard, Glacier Bay and others differ)',
        'Food coloring or dye tablets',
        'Rubber gloves',
        'Sponge, bucket and towel',
        'Non-scratch scrub pad',
      ],
      steps: [
        { t: 'Lift off the tank lid', d: 'Lift the lid straight up with both hands and set it flat on a folded towel on the floor.', why: 'Porcelain lids crack if they slide or rock on a hard edge.', tip: 'Before you shut off the water, add a few drops of food coloring to the tank and wait 15 minutes without flushing. Color in the bowl confirms the seal leaks.', ok: 'The lid rests flat on the towel, out of the way of your feet.', v: { cam: [2.0, 3.0, 2.2], at: [0, 1.6, -0.4], hi: ['lid'], mv: { lid: [1.6, -1.9, 0.6] } } },
        { t: 'Shut off and flush', d: 'Turn the shutoff behind the toilet clockwise until it stops, flush and hold the handle to drain the tank, then sponge out the rest into a bucket.', why: 'You need the bottom of the tank nearly dry to see the seal and the seat it presses on.', tip: 'If the shutoff won’t close, close the main house valve. Wring the sponge into a bucket, not the bowl.', ok: 'Only a little water is left and you can see the base of the tower clearly.', v: { cam: [-1.5, 1.0, 0.9], at: [-0.42, 0.4, -0.6], hi: ['knob'], rt: { knob: [0, 0, 90] }, hide: ['water'] } },
        { t: 'Unhook the chain', d: 'Unclip the chain or lift arm from the top of the canister. Note which link it was hooked to.', why: 'The canister has to turn freely to come out.', tip: 'Clip a twist tie onto the link you used so you can rehook it at the same length.', ok: 'The canister moves freely when you nudge it.', v: { cam: [1.0, 2.4, 1.0], at: [0.18, 1.7, -0.35], hi: ['chain', 'canister'] } },
        { t: 'Twist out the canister', d: 'Turn the canister a quarter turn counterclockwise and lift it straight up. On Kohler canisters, lift the tower slightly and turn the center spindle from below, not from the top, so it doesn’t snap.', why: 'Most canisters lock in with a twist-lock (bayonet) mount, so no tools are needed.', tip: 'If it won’t turn, wiggle it gently while you twist; don’t pry with a screwdriver. Steady the overflow tube with your other hand.', ok: 'The canister is out in your hand and you can see its rubber seal on the bottom.', v: { cam: [1.2, 2.4, 1.3], at: [0.18, 1.6, -0.4], hi: ['canister'], rt: { canister: [0, -90, 0] }, mv: { canister: [0, 0.35, 0] }, xray: true } },
        { t: 'Replace the seal', d: 'Peel the old gasket off the bottom of the canister and stretch the new one fully into its groove. Wipe the seat in the tank clean with a non-scratch pad.', why: 'Grit on the seat or a flattened gasket lets water seep all around the circle into the bowl.', tip: 'Run a fingertip around the seat: any crust left will leak even with a new seal. Never use steel wool on plastic seats.', ok: 'The new seal sits flat and even all the way around, and the seat feels smooth.', v: { cam: [1.0, 2.0, 1.1], at: [0.18, 1.5, -0.4], hi: ['canSeal'], xray: true } },
        { t: 'Reinstall and refill', d: 'Drop the canister in, line up its tabs, and turn it a quarter turn clockwise to lock. Rehook the chain with about ½″ of slack, open the shutoff, and flush 3 times.', why: 'Too little chain slack holds the canister up; too much can tangle under it.', tip: 'If it still runs, check the water level: it should stop at the line on the tank or about ½″ below the top of the overflow tube.', ok: 'The tank fills, the fill valve shuts off quietly, and fresh dye in the tank stays out of the bowl.', v: { cam: [2.4, 2.4, 2.6], at: [0, 1.3, -0.2], hi: ['canister', 'chain'], mv: { canister: [0, 0, 0] }, rt: { canister: [0, 0, 0], knob: [0, 0, 0] }, show: ['water'], fx: 'fill' } },
      ],
      learn: {
        how: 'Instead of a hinged flapper, a canister valve is a hollow tower that the flush handle lifts straight up. Water rushes in all around its base, a full 360°, which gives a strong flush from a small tank. The seal at its base is a large flat gasket; when it hardens or collects grit, water leaks around the whole circle.',
        specs: [
          ['Seal replacement time', 'about 10 minutes'],
          ['Canister lift', '1–2″'],
          ['Lock', 'quarter turn'],
          ['Chain slack', 'about ½″'],
        ],
        terms: [
          ['Canister valve', 'Tower-style flush valve that lifts straight up.'],
          ['Bayonet mount', 'Twist-lock fitting that locks with a quarter turn.'],
          ['Seal (gasket)', 'Flat rubber ring under the canister.'],
        ],
        mistakes: [
          'Buying a flapper for a canister toilet.',
          'Twisting the Kohler spindle from the top and snapping it.',
          'Putting a new seal on a crusty seat.',
        ],
        tips: [
          'Clean the seat with a scrub pad if there’s scale; a new seal on a crusty seat still leaks.',
          'Buy the seal by toilet brand and model; canister seals aren’t universal.',
        ],
      },
    },
  ];
  TB.useTool(running, 5, { id: 'gloves', at: [1.0, 0, 0.8], rot: [0, 30, 0], scale: 1 });

  const sink = PLB('sink-clog');
  sink.variants = [
    { id: 'bath', name: 'Bathroom sink', blurb: 'Pop-up stopper, 1¼″ drain. Usually hair and soap.' },
    {
      id: 'kitchen',
      name: 'Kitchen sink + disposal',
      blurb: 'Double sink, garbage disposal, 1½″ drain. Usually grease and food.',
      model: 'kitchenSink',
      summary: 'Kitchen clogs are grease and food. Free the disposal first, plunge with the other basin plugged, then open the trap or snake the wall pipe if needed.',
      intro: { hi: ['standingWater', 'disposal'], xray: false },
      safety: [
        'Switch off the disposal and unplug it (or turn off its breaker) before reaching anywhere near it. Never put your hand in the grinding chamber; use tongs.',
        'Don’t plunge after using chemical drain cleaner; it can splash onto skin and eyes.',
      ],
      causes: [
        ['Jammed or clogged disposal', 'Fibrous food (peels, celery), bones, pits or grease.'],
        ['Grease in the trap', 'Fat poured down hot cools and hardens in the pipe.'],
        ['Clog in the wall pipe', 'Beyond the trap; needs a snake.'],
        ['Dishwasher drain backing up', 'The dishwasher drains through the disposal or sink tailpiece, so a sink clog shows up there too.'],
      ],
      tools: [
        '¼″ hex key (disposal wrench)',
        'Cup (flat) plunger',
        'Bucket and towels',
        'Tongue-and-groove pliers',
        'Hand drain snake, ¼″ cable',
        'Flashlight',
        'Kitchen tongs',
        'C-clamp or small spring clamp (for the dishwasher hose)',
      ],
      steps: [
        { t: 'Power off and free the disposal', d: 'Turn off the disposal switch and unplug it under the sink, or switch off its breaker. Push the ¼″ hex key into the socket in the center of the disposal’s bottom and work it back and forth until it turns full circles freely.', why: 'This turns the grinding plate by hand and breaks the jam without reaching inside.', tip: 'Shine a flashlight down the drain and pull out any bottle cap, bone or pit with tongs, never fingers. No disposal wrench? Any ¼″ Allen key works.', ok: 'The hex key spins full circles with little resistance.', v: { cam: [1.6, 0.6, 1.4], at: [0.42, 0.85, 0], hi: ['disposal', 'hexSocket'], tool: { id: 'hexKey', at: [0.42, 0.83, 0], rot: [180, 0, 0], anim: 'turn', scale: 1.4 } } },
        { t: 'Press the reset button', d: 'Wait 3–5 minutes for the motor to cool, then press the red reset button on the bottom until it clicks. Plug it back in, run cold water, and switch the disposal on.', why: 'A jam overheats the motor and trips its thermal overload, a safety switch that cuts the power. The reset re-arms it.', tip: 'If it only hums, switch it off right away and free it again with the hex key. Total silence? Check the breaker and press the reset button again.', ok: 'The disposal spins up with a steady whir and water drains through it.', v: { cam: [1.6, 0.8, 1.2], at: [0.5, 0.92, 0.05], hi: ['reset'] } },
        { t: 'Plunge with the other side plugged', d: 'Plug the other basin with its strainer and hold it down. Add 2–3″ of water, seal a cup plunger over the clogged drain, and pump sharply 15–20 times.', why: 'Both basins share one pipe, so plunging one just blows air out the other unless it’s sealed.', tip: 'Squeeze the dishwasher’s ribbed drain hose shut with a clamp so you don’t push dirty water into the dishwasher. Take the clamp off when you’re done.', ok: 'The water drops with a gurgle and drains steadily.', v: { cam: [1.4, 2.4, 1.6], at: [0.2, 1.4, 0], hi: ['cupPlunger', 'stopperR'], show: ['cupPlunger'], fx: 'plunge' } },
        { t: 'Open the trap', d: 'Bail the sink dry, set a bucket under the trap, loosen the slip nuts counterclockwise, lower the U-bend, and clean out the grease and food.', why: 'The bend at the bottom collects heavy debris and cold grease.', tip: 'Wipe grease out with paper towels and throw them away, not down another drain. If a nut is stuck, grip it with pliers gently; plastic cracks.', ok: 'You can see light through the trap and nothing is stuck at the bottom of the bend.', v: { cam: [1.6, 0.9, 1.6], at: [-0.3, 0.62, 0.05], hi: ['trap', 'slipNuts'], show: ['bucket'], hide: ['cupPlunger'], tool: { id: 'pliers', at: [-0.3, 0.68, 0.06], rot: [0, 0, -90], anim: 'squeeze' } } },
        { t: 'Snake the wall pipe', d: 'If the trap was clear, feed the snake into the trap arm toward the wall and crank clockwise through the clog. Work it back and forth, then pull it out while cranking.', why: 'Kitchen lines often clog in the run inside the wall, where grease cools and sticks.', tip: 'Pull the trap arm out of the wall fitting for a straighter shot. If the cable meets solid resistance after 10–15′, call a drain service.', ok: 'The cable runs on freely and water poured into the wall pipe drains away.', v: { cam: [1.6, 1.0, 1.6], at: [-0.15, 0.74, -0.3], hi: ['snake'], show: ['snake'] } },
        { t: 'Reassemble and flush hot', d: 'Reconnect the trap with the tapered washers pointing into the joints, hand-tight plus a quarter turn. Run hot water for 2 minutes and wipe every joint with a dry paper towel.', why: 'Hot water carries loosened grease out of the line, and the towel shows even a slow leak.', tip: 'Fill both basins and drain them together for a big test flow. If a joint drips, line up the pipe and retighten.', ok: 'Both basins drain quickly and the paper towels stay dry.', v: { cam: [2.4, 1.8, 2.6], at: [0, 0.9, 0], hi: ['trap'], hide: ['snake', 'bucket', 'standingWater'] } },
      ],
      learn: {
        how: 'Both basins of a double sink feed one trap. A garbage disposal grinds food into small bits that ride the water to the trap and the house drain. Grease is the real enemy: liquid when hot, it cools and coats the pipe walls, and food bits stick to it until the pipe closes up.',
        specs: [
          ['Kitchen drain size', '1½″'],
          ['Disposal wrench', '¼″ hex'],
          ['Cool-down before reset', '3–5 minutes'],
          ['Run water after grinding', '15–30 seconds of cold water'],
        ],
        terms: [
          ['Continuous waste', 'Pipe connecting both basins to one trap.'],
          ['Thermal overload', 'Safety switch that cuts motor power when it overheats.'],
          ['Air gap or high loop', 'Setup that keeps sink water from flowing back into the dishwasher.'],
        ],
        mistakes: [
          'Pouring grease down the drain.',
          'Putting your hand in the disposal.',
          'Plunging without plugging the other basin.',
          'Plunging without clamping the dishwasher hose.',
        ],
        tips: [
          'Run cold, not hot, water while grinding so grease stays solid and gets chopped and carried away.',
          'Keep the disposal wrench taped to the side of the disposal.',
        ],
      },
      tricks: [
        ['Grease goes in the trash', 'Pour cooled fat into a can or jar. A cup a week down the drain is how most kitchen lines close up.'],
        ['Cold water while grinding', 'Cold keeps grease solid so it gets chopped and flushed instead of coating the pipe.'],
        ['Tape the wrench on', 'Stick the ¼″ hex key to the disposal with tape so it’s there for the next jam.'],
        ['Feed it slowly', 'Run food in a little at a time with water running. Avoid peels, celery strings, eggshells, coffee grounds and pasta.'],
        ['Straight shot for the snake', 'Removing the trap arm and snaking straight into the wall pipe avoids the tight bends where cables kink.'],
      ],
    },
  ];
  TB.useTool(sink, 3, { id: 'pliers', at: [0.45, 0.68, 0], rot: [0, 0, -90], anim: 'squeeze' });

  /* ---------- New plumbing repairs ---------- */
  TB.more('plumbing', [
    {
      id: 'shower-head',
      title: 'Leaky or weak shower head',
      model: 'shower',
      level: 1,
      time: '20–30 min',
      cost: '$0–40',
      renter: true,
      summary: 'A shower head that drips at the arm, sprays sideways or trickles is clogged with mineral scale or needs a fresh washer and thread tape. Both fix in about 30 minutes.',
      intro: { hi: ['head', 'scale'], fx: 'spray' },
      safety: [
        'Lay a towel in the tub or shower floor; dropped tools crack acrylic and chip enamel.',
        'Hold the shower arm steady while turning the head so you don’t twist the fitting inside the wall.',
        'If the arm itself turns in the wall or the wall gets wet, stop: the fitting behind the tile may be damaged.',
      ],
      causes: [
        ['Mineral scale', 'Clogs the nozzles and causes weak, uneven or sideways spray.'],
        ['Old thread tape or flat washer', 'Water leaks at the connection to the arm.'],
        ['Clogged inlet screen', 'A small screen inside the head’s connection catches grit and starves the whole head.'],
        ['Worn swivel washer', 'Leaks at the ball joint when you aim the head.'],
      ],
      tools: [
        'Adjustable wrench or tongue-and-groove pliers',
        'Rag or painter’s tape (protects the finish)',
        'Thread-seal (PTFE) tape, ½″ wide',
        'White vinegar and a zip-top bag',
        'Rubber band',
        'Old toothbrush and a toothpick',
        'Replacement rubber washer (if worn)',
      ],
      steps: [
        { t: 'Unscrew the head', d: 'Hold the shower arm (the pipe coming out of the wall) firmly with one hand. Wrap the head’s nut with a rag and turn it counterclockwise with the wrench until you can spin it off by hand.', why: 'The rag protects the finish, and holding the arm keeps you from twisting the fitting inside the wall.', tip: 'Try by hand first; many heads are only hand-tight. For a stubborn one, grip the arm with a second wrench padded with a rag and turn the two in opposite directions.', ok: 'The head is off and you see bare threads on the end of the arm.', v: { cam: [0.9, 2.3, 0.9], at: [0, 2.17, -0.53], hi: ['head'], tool: { id: 'adjWrench', at: [0.06, 2.19, -0.53], anim: 'turn', scale: 1.3 } } },
        { t: 'Descale it', d: 'Soak the head in white vinegar for 1–2 hours (overnight for heavy scale). Scrub the face with a toothbrush and poke each nozzle with a toothpick. Pull out the small screen in the inlet and rinse it.', why: 'Vinegar is a mild acid that dissolves calcium deposits. The inlet screen catches grit that can starve the whole head.', tip: 'Soft rubber nozzles? Rub them with your thumb and the scale pops right out. For brushed gold, bronze or black finishes, check the maker’s care guide and keep the soak short.', ok: 'Every nozzle is open and water runs through all of them when you rinse the head under the tap.', v: { cam: [0.9, 2.2, 0.9], at: [0.5, 1.9, -0.3], hi: ['head', 'scale'], mv: { head: [0.5, -0.25, 0.25] } } },
        { t: 'Clean and re-tape the threads', d: 'Wipe old tape and scale off the arm threads. Wrap 3–4 turns of PTFE tape clockwise as you look at the end of the arm, pulling it snug, starting one thread back from the end. Check the rubber washer inside the head’s nut and replace it if flat or cracked.', why: 'Clockwise wrapping tightens as the head screws on; counterclockwise unravels. Starting back from the end keeps tape shreds out of the head.', tip: 'The washer does the real sealing; the tape stops seepage along the threads. If you can’t find the old washer, it’s often stuck inside the nut, so pick it out with a toothpick.', ok: 'The tape lies tight in the threads like a white coating, with no loose tail, and a flat washer sits in the nut.', v: { cam: [0.7, 2.4, 0.8], at: [0, 2.22, -0.53], hi: ['threads', 'tape'], show: ['tape'] } },
        { t: 'Reinstall hand-tight + ¼ turn', d: 'Screw the head on by hand until snug, then hold the arm and turn about ¼ turn more with the rag-padded wrench.', why: 'The washer and tape do the sealing. Overtightening cracks plastic nuts and twists the arm.', tip: 'Plastic nut? Hand-tight only. If it gets hard to turn right away, it’s cross-threaded; back it off and start again square to the arm.', ok: 'The head points where you want and doesn’t turn when you nudge it.', v: { cam: [0.9, 2.3, 0.9], at: [0, 2.17, -0.53], hi: ['head'], mv: { head: [0, 0, 0] }, tool: { id: 'adjWrench', at: [0.06, 2.19, -0.53], anim: 'turn', scale: 1.3 } } },
        { t: 'Test the spray', d: 'Turn the shower on full and watch the connection for 1–2 minutes. Check that every nozzle sprays evenly.', why: 'A drip at the nut shows up right away under full pressure.', tip: 'Drip at the nut? Tighten ⅛ turn more. Still dripping? Re-tape or replace the washer. Water from the head with the shower off means the shower valve cartridge needs work, not the head.', ok: 'An even spray from every nozzle and a dry connection after 2 minutes.', v: { cam: [1.6, 2.2, 1.8], at: [0, 1.7, -0.5], hi: ['head'], fx: 'spray' } },
      ],
      learn: {
        how: 'A shower head screws onto a ½″ threaded pipe, the arm. Tapered pipe threads don’t seal on their own; a rubber washer in the head’s nut and a wrap of PTFE tape on the threads do. Inside the head, small nozzles shape the spray, and hard water leaves calcium in them over time, narrowing each jet until the spray goes weak or sideways.',
        specs: [
          ['Arm thread', '½″ NPT (tapered pipe thread)'],
          ['Max flow (US federal)', '2.5 gpm at 80 psi'],
          ['WaterSense heads', '2.0 gpm or less (some states 1.8)'],
          ['Tape wraps', '3–4, clockwise'],
          ['Vinegar soak', '1–2 hours, overnight for heavy scale'],
        ],
        terms: [
          ['Shower arm', 'The bent pipe from the wall that the head screws onto.'],
          ['PTFE tape', 'Thread-seal tape, often called Teflon tape.'],
          ['Flow restrictor', 'Insert that limits gallons per minute.'],
          ['NPT', 'National Pipe Thread, the standard US tapered pipe thread.'],
        ],
        mistakes: [
          'Wrapping tape counterclockwise so it bunches up.',
          'Removing the flow restrictor (may violate local code and wastes hot water).',
          'Twisting the arm in the wall while loosening the head.',
          'Leaving out the rubber washer.',
        ],
        tips: [
          'Can’t get it off? Tie a bag of vinegar around the head with a rubber band and leave it overnight.',
          'Wipe soft rubber nozzles with your thumb weekly to keep scale from building.',
        ],
      },
      pro: 'Call a plumber if water leaks inside the wall, the arm is loose or cracked in its fitting, or the shower drips with the valve off (that needs a valve cartridge).',
      tricks: [
        ['Bag-and-band descale', 'Fill a zip-top bag with vinegar, pull it up over the head, and hold it with a rubber band overnight. No tools needed.'],
        ['Two-wrench rule', 'One wrench turns the head, one holds the arm. It protects the hidden fitting inside the wall.'],
        ['Keep the restrictor', 'A weak shower is almost always scale, not the restrictor. Removing it wastes water and may break code.'],
        ['Choose WaterSense', 'Heads labeled WaterSense use 2.0 gpm or less and are tested for a satisfying spray.'],
        ['Tape bunching means wrong direction', 'If tape rolls up as you screw on the head, peel it off and rewrap clockwise.'],
        ['Spare washer', 'Buy a $1 pack of shower washers; a flattened washer is the most common cause of a drip at the arm.'],
      ],
      refs: [
        ['Shower head installation guide 1666695-2 (Kohler)', 'https://techcomm.kohler.com/techcomm/pdf/1666695-2.pdf'],
        ['How to use thread seal tape to prevent leaks (The Shower Head Store)', 'https://help.theshowerheadstore.com/en-US/how-to-use-thread-seal-tape-to-prevent-leaks-at-your-connections-7392160'],
        ['How to install a shower head (FaucetFam)', 'https://faucetfam.com/how-to-install-shower-head/'],
        ['How to fix leaks (EPA WaterSense archive)', 'https://19january2017snapshot.epa.gov/www3/watersense/our_water/howto.html'],
      ],
    },
    {
      id: 'tub-drain',
      title: 'Slow bathtub drain',
      model: 'tubDrain',
      level: 1,
      time: '20–40 min',
      cost: '$0–15',
      renter: true,
      summary: 'Tub drains slow down when hair catches just below the stopper. Pull the stopper, fish out the hair with a barbed strip, and flush. Most take about 20 minutes.',
      intro: { hi: ['hair', 'water'] },
      safety: [
        'Skip chemical drain cleaners if you plan to work on the drain; they splash and burn.',
        'Wear gloves.',
        'If the whole drain fitting spins when you turn the stopper, stop forcing it; the seal under the tub can break.',
      ],
      causes: [
        ['Hair caught below the stopper', 'Nearly always the cause.'],
        ['Soap scum buildup', 'Glues hair together and narrows the pipe over time.'],
        ['Hair on a trip-lever linkage', 'Tubs with a lever on the overflow plate hide a plunger and linkage inside the overflow pipe that collects hair.'],
        ['Clog in the trap below the tub', 'Needs a snake through the overflow opening.'],
      ],
      tools: [
        'Flat and Phillips screwdrivers',
        'Needle-nose pliers',
        'Hex key set (lift-and-turn stoppers)',
        'Barbed drain-cleaning strip',
        'Rubber gloves',
        'Old towel',
        'Cup plunger and a wet rag (if still slow)',
        'Flashlight',
      ],
      steps: [
        { t: 'Remove the stopper', d: 'Toe-touch (push to close): hold the body and unscrew the cap, then unscrew the post counterclockwise. Lift-and-turn: loosen the small set screw on the knob or unscrew the knob. Trip-lever: remove the two screws on the overflow plate and pull the linkage up and out.', why: 'Hair wraps the stopper’s post and the crossbars just below it.', tip: 'Lay a towel in the tub to catch small parts. If the post just spins, grip it with pliers wrapped in tape while you turn.', ok: 'The stopper is out and you can see the crossbars inside the drain hole.', v: { cam: [0.6, 0.8, 0.8], at: [-0.95, 0.1, 0], hi: ['stopper'], mv: { stopper: [0.25, 0.2, 0.2] }, tool: { id: 'screwdriver', at: [-0.95, 0.12, 0], anim: 'turn' } } },
        { t: 'Fish out the hair', d: 'Push the barbed strip down the drain as far as it goes, twist it a few times, and pull it straight up slowly. Wipe it off and repeat until it comes up clean.', why: 'The backward-facing barbs hook the hair mat as you pull up.', tip: 'Keep a trash bag ready, not the toilet. If the strip snags hard, wiggle it free instead of yanking; a torn strip left in the drain is a new clog.', ok: 'The last two pulls come up with no hair on the barbs.', v: { cam: [0.6, 0.8, 0.8], at: [-0.95, 0.15, 0], hi: ['zip', 'hair'], show: ['zip'], mv: { hair: [0, 0.3, 0.05] } } },
        { t: 'Flush and reinstall', d: 'Run hot tap water full for a minute and watch it drain. Clean the stopper and reinstall it the way it came out.', why: 'Hot water carries loosened soap scum away, and the drain speed tells you if you’re done.', tip: 'Still slow? Stuff a wet rag tightly into the overflow opening and plunge the drain with a cup plunger. Sealing the overflow is what lets the plunger work.', ok: 'Water from the faucet on full drains without building up around the drain, and the stopper opens and closes properly.', v: { cam: [1.4, 1.6, 1.8], at: [0, 0.3, 0], hi: ['stopper'], hide: ['zip', 'hair', 'water'], mv: { stopper: [0, 0, 0] } } },
      ],
      learn: {
        how: 'A tub drains through a short pipe under the drain to a trap below the floor. The overflow opening near the top connects to the same pipe. Hair caught on the stopper’s post builds into a mat that soap scum glues together until water can barely get by.',
        specs: [
          ['Tub drain size', '1½″'],
          ['Trap seal depth', '2–4″ of water'],
          ['Clean every', '2–3 months in busy bathrooms'],
        ],
        terms: [
          ['Toe-touch stopper', 'Push-to-open, push-to-close stopper.'],
          ['Lift-and-turn stopper', 'Stopper you pull up and twist to lock open.'],
          ['Trip lever', 'Lever on the overflow plate that works a hidden plunger.'],
          ['Overflow', 'Opening near the top of the tub that keeps it from overfilling.'],
        ],
        mistakes: [
          'Pouring drain cleaner on a full clog; it just sits there.',
          'Plunging without sealing the overflow.',
          'Yanking a snagged barbed strip and tearing it.',
        ],
        tips: [
          'A $5 hair catcher prevents most tub clogs entirely.',
          'Put stopper screws in a cup, not on the tub edge.',
        ],
      },
      pro: 'Call a plumber if water backs up in the tub when you flush the toilet (the main line is clogged), or if the drain fitting is loose or leaking under the tub.',
      tricks: [
        ['Hair catcher', 'A $5 mesh or silicone catcher over the drain stops most clogs before they start.'],
        ['Monthly pull', 'Run the barbed strip down once a month before the drain gets slow; it takes 30 seconds.'],
        ['Hot tap water, not boiling', 'Hot tap water is plenty. Boiling water can soften plastic drain joints and won’t dissolve hair anyway.'],
        ['Enzyme cleaner for upkeep', 'Monthly enzyme drain treatments help keep soap scum down. They’re slow, so use them for prevention, not clogs.'],
        ['Main line check', 'If the tub gurgles or backs up when the toilet flushes, the clog is in the main line, not the tub.'],
      ],
      refs: [
        ['An overview of plumbing trap requirements under the IPC (ICC Building Safety Journal)', 'https://www.iccsafe.org/building-safety-journal/bsj-technical/an-overview-of-plumbing-trap-requirements-under-the-international-plumbing-code/'],
        ['Simple Plumbing Repairs in the Home, USDA Farmers’ Bulletin 1460 (Project Gutenberg)', 'https://gutenberg.org/cache/epub/62592/pg62592-images.html'],
        ['K-3 Toilet Auger and hand drain tools (RIDGID)', 'https://www.ridgid.com/pr/en/toilet-augers'],
      ],
    },
    {
      id: 'toilet-wax',
      title: 'Toilet rocks or leaks at the base',
      model: 'toiletSeal',
      level: 3,
      time: '1–2 hrs',
      cost: '$10–25',
      summary: 'Water around the base, or a toilet that rocks, means the wax ring seal has failed. Pull the toilet, scrape off the old wax, check the flange, set a new ring, and bolt it down evenly.',
      intro: { hi: ['oldWax', 'flange'], hide: ['toilet', 'nuts'] },
      safety: [
        'A toilet weighs 60–120 lb. Lift with your legs, or take the tank off first, or get help.',
        'Stuff a rag in the drain while the toilet is off so sewer gas doesn’t escape and nothing falls in.',
        'Wear gloves; the old wax and drain are unsanitary. Wash up before eating.',
      ],
      causes: [
        ['Failed wax ring', 'The seal between the toilet and the drain flattened, cracked or shifted.'],
        ['Loose closet bolts', 'Let the toilet rock, which breaks the wax seal; wax never springs back.'],
        ['Flange below the floor', 'A new floor raised the toilet, so the ring can’t reach the flange.'],
        ['Broken or rusted flange', 'The bolts can’t hold; needs a repair ring or a plumber.'],
      ],
      tools: [
        'New wax ring (standard, or extra-thick if the flange is below the floor) or a wax-free foam/rubber seal',
        'New brass closet bolts with washers and nuts',
        'Adjustable wrench or a small socket set',
        'Plastic putty knife',
        'Mini hacksaw (to trim bolts)',
        'Sponge, bucket and old towels',
        'Rag to plug the drain',
        'Plastic toilet shims',
        'Cardboard to set the toilet on',
        'Tub-and-tile caulk (if your code calls for it)',
        'Rubber gloves',
      ],
      steps: [
        { t: 'Shut off and drain', d: 'Turn the shutoff behind the toilet clockwise, flush and hold the handle, then sponge the tank and bowl as dry as you can. Unscrew the supply line from the bottom of the tank.', why: 'Every cup of water left inside spills when you tip the toilet.', tip: 'A wet/dry shop vacuum empties the bowl and trapway fastest. Keep a towel under the supply nut as you unscrew it.', ok: 'The tank and bowl are nearly empty and the supply line is off.', v: { cam: [2.2, 1.8, 2.4], at: [0, 0.6, 0], hi: ['toilet'], show: ['toilet', 'nuts'] } },
        { t: 'Remove the nuts and lift', d: 'Pop off the bolt caps and unscrew the nuts counterclockwise. Straddle the bowl, rock it gently side to side to break the seal, and lift it straight up onto cardboard.', why: 'Lifting straight keeps the outlet horn (the opening on the bottom) from scraping the flange.', tip: 'Nuts rusted and spinning? Cut the bolts with a mini hacksaw; you’re replacing them anyway. To lighten the lift, unbolt the tank first (2–3 bolts inside it).', ok: 'The toilet is off the floor and you can see the old wax ring on the flange.', v: { cam: [2.2, 1.8, 2.4], at: [0, 0.5, 0], hi: ['nuts', 'toilet'], mv: { toilet: [0.9, 0.3, 0.6], nuts: [0, 0.15, 0] }, tool: { id: 'adjWrench', at: [0.18, 0.08, 0.02], anim: 'turn', scale: 1.2 } } },
        { t: 'Scrape the old wax', d: 'Stuff a rag in the drain, then scrape all the wax off the flange and the toilet’s outlet horn. Check that the flange is solid, screwed down, and sits level with or up to ¼″ above the finished floor.', why: 'Old wax leaves gaps a new ring can’t seal, and a cracked or low flange will leak again no matter what ring you use.', tip: 'Scrape with a plastic knife and bag the wax; it ruins rags and drains. A cracked flange can often be saved with a $10–20 repair ring that screws on top.', ok: 'Both surfaces are clean, the flange doesn’t move when you push on it, and nothing is cracked.', v: { cam: [1.0, 1.2, 1.2], at: [0, 0.03, 0], hi: ['oldWax', 'flange'], show: ['rag'], hide: ['nuts'], tool: { id: 'puttyKnife', at: [0.15, 0.05, 0.1], rot: [70, 0, 0], anim: 'slide', scale: 0.6 } } },
        { t: 'Set new bolts and wax', d: 'Slide new closet bolts into the flange slots and hold them upright with their plastic washers. Press the new wax ring onto the toilet’s outlet horn, then pull the rag out of the drain.', why: 'New bolts won’t be corroded or bent. Pulling the rag last keeps sewer gas and dropped parts out.', tip: 'Leave the ring in a warm room for an hour so it’s soft. Use an extra-thick ring only if the flange is below the floor, and never stack two rings; they slip apart and leak.', ok: 'The bolts stand straight up and the ring is centered on the horn.', v: { cam: [1.0, 1.2, 1.2], at: [0, 0.05, 0], hi: ['newWax', 'bolts'], show: ['newWax'], hide: ['oldWax', 'rag'] } },
        { t: 'Lower and bolt down evenly', d: 'Lower the toilet straight down using the bolts as guides. Press down with your weight and a slight twist, then tighten the nuts a half turn at a time, side to side, until snug. Shim any gap so it doesn’t rock.', why: 'Alternating keeps the pressure even so the ring compresses flat. Overtightening cracks porcelain.', tip: 'Stop when the toilet no longer rocks and the nuts feel firm. Trim the bolt ends with a hacksaw so the caps fit, leaving about ¼″ above the nut.', ok: 'Sitting on it and leaning side to side, the toilet doesn’t move at all.', v: { cam: [2.2, 1.8, 2.4], at: [0, 0.5, 0], hi: ['toilet', 'nuts'], mv: { toilet: [0, 0, 0], nuts: [0, 0, 0] }, show: ['nuts'], tool: { id: 'adjWrench', at: [-0.18, 0.08, 0.02], anim: 'turn', scale: 1.2 } } },
        { t: 'Reconnect and test', d: 'Reconnect the supply line hand-tight plus a quarter turn, open the shutoff, flush 5 times, and wipe around the base and the connection with a dry paper towel. After a day of use, caulk the front and sides if your code calls for it, leaving the back open.', why: 'Several flushes load the new seal. An open gap at the back lets a future leak show instead of rotting the floor unseen.', tip: 'Water at the base? Don’t crank the nuts harder; pull the toilet and use a fresh ring. Leak at the supply nut? Tighten ⅛ turn.', ok: 'After 5 flushes, a paper towel run around the base comes away dry.', v: { cam: [2.2, 1.8, 2.4], at: [0, 0.6, 0], hi: ['toilet'] } },
      ],
      learn: {
        how: 'A toilet bolts to a closet flange, a ring fitting anchored to the floor over the drain pipe. A ring of soft wax between the toilet’s outlet horn and the flange forms a watertight, gas-tight seal. Wax doesn’t spring back: once the toilet rocks, the gap stays and leaks.',
        specs: [
          ['Rough-in (wall to drain center)', '12″ typical (10″ and 14″ exist)'],
          ['Flange height', 'flush with to ¼″ above the finished floor'],
          ['Bolt tightening', 'snug, alternating, until it stops rocking'],
          ['Toilet weight', '60–120 lb'],
          ['Bolt trim height', 'about ¼″ above the nut'],
        ],
        terms: [
          ['Closet flange', 'Ring fitting that anchors the toilet over the drain.'],
          ['Horn', 'Outlet opening on the bottom of the toilet.'],
          ['Closet bolts', 'The two bolts that hold the toilet to the flange.'],
          ['Rough-in', 'Distance from the wall to the drain center.'],
        ],
        mistakes: [
          'Re-using an old wax ring.',
          'Stacking two wax rings for a low flange.',
          'Rocking the toilet after it’s set.',
          'Cranking the nuts until the porcelain cracks.',
          'Caulking all the way around so leaks stay hidden.',
        ],
        tips: [
          'Use a flange spacer or an extra-thick ring if the flange sits below the finished floor.',
          'Push on the floor around the flange; if it’s spongy, the subfloor is rotting and needs repair before resetting.',
        ],
      },
      pro: 'Call a plumber if the flange is cracked or well below floor level, the subfloor around it is soft, or the drain pipe is damaged.',
      tricks: [
        ['Consider a wax-free seal', 'Foam or rubber seals can be repositioned if you miss the bolts, unlike wax, and handle uneven flange heights well.'],
        ['Dry-fit first', 'Set the toilet over the bolts without a ring to check for rocking and see where shims go.'],
        ['Fix a low flange the right way', 'Stack PVC flange spacers to bring a low flange up, instead of stacking wax rings.'],
        ['Lighten the load', 'Take the tank off a two-piece toilet before lifting; the bowl alone is much easier to set accurately.'],
        ['Check the floor while it’s open', 'A soft or dark-stained subfloor around the flange means a long-term leak. Fix it now, not after the new tile.'],
        ['Buy two rings', 'A spare $5 ring means a missed set doesn’t send you back to the store with the toilet in the hallway.'],
      ],
      refs: [
        ['Proper toilet flange height (H2ouse)', 'https://www.h2ouse.org/proper-toilet-flange-height'],
        ['How to fix a low toilet flange (This Old House)', 'https://www.thisoldhouse.com/bathrooms/how-to-fix-a-low-toilet-flange'],
        ['How to install a toilet (This Old House)', 'https://www.thisoldhouse.com/bathrooms/how-to-install-a-toilet'],
        ['How to repair a cast-iron toilet flange (This Old House)', 'https://www.thisoldhouse.com/how-to/how-to-repair-cast-iron-toilet-flange'],
        ['Wax rings and toilet flanges forum (Fine Homebuilding)', 'https://finehomebuilding.com/forum/wax-rings-and-toilet-flanges'],
      ],
    },
    {
      id: 'frozen-pipe',
      title: 'Thaw a frozen pipe',
      model: 'frozenPipe',
      level: 2,
      time: '30–60 min',
      cost: '$0–20',
      renter: true,
      summary: 'No water from one faucet on a freezing day usually means a frozen pipe in an outside wall, garage or crawlspace. Open the faucet, then thaw the pipe gently with safe heat, working from the faucet back toward the ice.',
      intro: { hi: ['ice', 'pipe'] },
      safety: [
        'Never use an open flame, propane torch, kerosene or charcoal heater. They start house fires and can make a pipe burst.',
        'Know where your main shutoff is before you start, in case the pipe has already split.',
        'Keep space heaters 3′ from anything that can burn and never leave them running unattended.',
        'Don’t use a hair dryer or other electric tool while standing in water.',
      ],
      causes: [
        ['Pipe in an unheated space', 'Crawlspaces, garages, exterior walls and attics.'],
        ['Cold air leaks', 'Gaps near sill plates, vents and pipe holes blow freezing air right onto pipes.'],
        ['Cabinet doors closed on an outside wall', 'Blocks the house heat from reaching the pipes.'],
        ['Thermostat set too low', 'Lowering heat when away, or at night in a deep freeze, lets inside walls get cold.'],
      ],
      tools: [
        'Hair dryer or electric heating pad',
        'Towels soaked in hot water',
        'Space heater with tip-over shutoff (for enclosed spaces)',
        'Flashlight',
        'Foam pipe insulation sized to the pipe',
        'Duct or insulation tape',
        'Bucket and towels',
      ],
      steps: [
        { t: 'Find the main shutoff', d: 'Find the main shutoff where the water line enters the house (basement, crawlspace, garage or utility closet) and clear a path to it.', why: 'Frozen pipes often split while frozen and only spray when the ice melts. You want to stop that flood in seconds.', tip: 'A round wheel handle closes clockwise in several turns; a lever handle closes with a quarter turn so it crosses the pipe. Hang a tag on it so anyone in the house can find it.', ok: 'You know exactly where the valve is and can reach its handle.', v: { cam: [-0.6, 1.4, 1.2], at: [-1.2, 1.2, -0.4], hi: ['main', 'wheel'] } },
        { t: 'Open the faucet', d: 'Open the faucet that the frozen pipe feeds, both hot and cold, and leave it open.', why: 'An open faucet gives melting water and pressure a way out, and moving water speeds the thaw.', tip: 'Check the other faucets too: if several are dry, the freeze may be near where the water line enters the house.', ok: 'The faucet handle is open; it may dribble or give nothing yet.', v: { cam: [1.9, 1.2, 1.0], at: [1.3, 1.1, -0.4], hi: ['faucet'], show: ['drip'] } },
        { t: 'Warm from the faucet end', d: 'Move a hair dryer, heating pad or hot wet towels along the pipe, starting near the open faucet and working back toward the frozen part. Keep the dryer moving, 4–6″ from the pipe.', why: 'Thawing near the faucet first gives water a way out, so pressure can’t build behind the ice.', tip: 'Frost on the pipe or a spot that feels ice-cold marks the frozen section. Pipe hidden in a wall? Open the cabinet doors, warm the room, and aim a space heater at the wall from 3′ away.', ok: 'Water trickles from the faucet, then speeds up to full flow.', v: { cam: [1.2, 1.0, 1.0], at: [0.3, 1.1, -0.35], hi: ['heat', 'ice'], show: ['heat'] } },
        { t: 'Check for leaks as it flows', d: 'Keep heating until full pressure returns. Then turn the faucet off and look and feel along the whole pipe for drips, bulges or a split seam.', why: 'A split usually shows as a bulge or crack right where the pipe was frozen.', tip: 'See spraying or dripping? Close the main shutoff at once, open a low faucet to drain the lines, and call a plumber. A push-fit repair coupling can be a temporary fix.', ok: 'Full flow at the faucet, and the pipe stays dry to the touch for 15 minutes.', v: { cam: [1.8, 1.0, 1.8], at: [0, 1.2, -0.4], hi: ['pipe'], hide: ['ice', 'heat', 'drip'] } },
        { t: 'Insulate it', d: 'Slip foam pipe insulation over the exposed pipe, slit side down, and tape the seams and joints. Seal nearby drafts with caulk or spray foam.', why: 'Insulation slows heat loss, and sealing drafts removes the cold wind that freezes pipes in the first place.', tip: 'Insulation slows freezing but doesn’t add heat. In very cold spots, add UL-listed heat cable and install it exactly per its instructions.', ok: 'No bare pipe shows, and you can’t feel cold air blowing near it.', v: { cam: [1.8, 1.0, 1.8], at: [0, 1.2, -0.4], hi: ['sleeve'], show: ['sleeve'] } },
      ],
      learn: {
        how: 'Water expands about 9% when it freezes. The ice itself rarely splits the pipe at the frozen spot; the water trapped between the ice and a closed faucet gets squeezed until the pipe bursts. That’s why opening the faucet first matters so much.',
        specs: [
          ['Freeze risk for unprotected pipes', 'when outdoor temps drop below about 20 °F'],
          ['Water expansion on freezing', 'about 9%'],
          ['Heat when away in winter', 'thermostat no lower than 55 °F'],
          ['Prevention drip', 'a thin, steady trickle'],
          ['Space heater clearance', '3′ from anything that can burn'],
        ],
        terms: [
          ['Main shutoff', 'Valve that stops water to the whole house.'],
          ['Heat cable (heat tape)', 'Electric cable that warms pipes; use UL-listed only and follow its instructions.'],
          ['Push-fit coupling', 'Fitting that slips onto cut pipe ends for a quick repair.'],
        ],
        mistakes: [
          'Using a torch or open flame.',
          'Thawing from the middle of the frozen section.',
          'Leaving space heaters unattended.',
          'Forgetting to check for a split once water flows.',
        ],
        tips: [
          'On very cold nights, open cabinet doors on outside walls and let a faucet trickle.',
          'Disconnect garden hoses in fall and drain outdoor faucets.',
        ],
      },
      pro: 'Call a plumber if you can’t reach the frozen section, the pipe has split, or pipes freeze repeatedly (they need rerouting, insulation or heat cable).',
      tricks: [
        ['Drip on the coldest nights', 'A thin trickle from a faucet on an outside wall keeps water moving and relieves pressure if ice forms.'],
        ['Open the cabinets', 'Opening sink cabinet doors on outside walls lets room heat reach the pipes.'],
        ['Keep the garage door closed', 'Many frozen pipes run through attached garages. Keep it shut in a cold snap.'],
        ['Away from home', 'Keep the heat at 55 °F or higher, and consider shutting off the main and draining the lines for long trips.'],
        ['Hoses off in fall', 'A hose left on an outdoor faucet traps water that freezes back into the wall.'],
        ['Hot towels work', 'No dryer? Wrap the pipe in towels soaked in hot water and replace them as they cool.'],
      ],
      refs: [
        ['Red Cross safety tips for frozen pipes (Auburn Reporter)', 'https://www.auburn-reporter.com/?p=6681'],
        ['What to do if your pipes freeze, according to plumbing experts (CBS News)', 'https://cbsnews.com/amp/news/what-to-do-if-pipes-freeze'],
        ['How to thaw your frozen pipes (WWL-TV)', 'https://wwltv.com/article/news/how-to-thaw-your-frozen-pipes/289-504172622'],
        ['Attempt to thaw frozen water pipes leads to house fire (KWCH)', 'https://www.kwch.com/content/news/attempt-to-thaw-frozen-water-pipes-leads-to-hutchinson-house-fire-467886993.html'],
        ['Preventing and thawing frozen pipes (HCAM)', 'https://www.hcam.tv/preventing-and-thawing-frozen-pipes/'],
      ],
    },
  ]);

})();
