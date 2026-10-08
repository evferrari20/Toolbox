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
          ['Fluidmaster 400A fill valve instructions (Fluidmaster)', 'https://hdsupplysolutions.com/wcsstore/ExtendedSitesCatalogAssetStore/product/fm/additional/Fl/Fluidmaster_575250_Instructions_400A Instructions_Original.pdf'],
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
      summary: 'Kitchen clogs are grease and food. Check the disposal first, plunge with the other side plugged, then open the trap if needed.',
      intro: { hi: ['standingWater', 'disposal'], xray: false },
      safety: ['Unplug or switch off the disposal before reaching anywhere near it. Never put your hand in the grinding chamber.', 'Don’t plunge after using chemical drain cleaner; it can splash onto skin and eyes.'],
      causes: [['Jammed or clogged disposal', 'Fibrous food (peels, celery) or grease.'], ['Grease in the trap', 'Fat cools and solidifies in the pipe.'], ['Clog in the wall pipe', 'Beyond the trap; needs a snake.']],
      tools: ['¼″ hex key (disposal wrench)', 'Cup plunger', 'Bucket & towels', 'Tongue-and-groove pliers', 'Drain snake', 'Flashlight'],
      steps: [
        { t: 'Power off and free the disposal', d: 'Switch off the disposal. Insert the ¼″ hex key into the socket on the bottom and work it back and forth until it turns freely.', why: 'This turns the grinding plate by hand and breaks a jam without reaching inside.', v: { cam: [1.6, 0.6, 1.4], at: [0.42, 0.85, 0], hi: ['disposal', 'hexSocket'], tool: { id: 'hexKey', at: [0.42, 0.83, 0], rot: [180, 0, 0], anim: 'turn', scale: 1.4 } } },
        { t: 'Press the reset button', d: 'Push the red reset button on the bottom of the disposal, restore power, and run cold water with the disposal on.', why: 'A jam trips the motor’s thermal overload; reset re-arms it.', v: { cam: [1.6, 0.8, 1.2], at: [0.5, 0.92, 0.05], hi: ['reset'] } },
        { t: 'Plunge with the other side plugged', d: 'Plug the other basin with its strainer, add 2–3″ of water, seal a cup plunger over the drain and pump sharply.', why: 'With two basins connected, plunging one just blows air out the other unless it’s plugged.', v: { cam: [1.4, 2.4, 1.6], at: [0.2, 1.4, 0], hi: ['cupPlunger', 'stopperR'], show: ['cupPlunger'], fx: 'plunge' } },
        { t: 'Open the trap', d: 'Set a bucket under the trap, loosen the slip nuts, and clean out grease and food.', why: 'The bend at the bottom collects heavy debris and cold grease.', v: { cam: [1.6, 0.9, 1.6], at: [-0.3, 0.62, 0.05], hi: ['trap', 'slipNuts'], show: ['bucket'], hide: ['cupPlunger'], tool: { id: 'pliers', at: [-0.3, 0.68, 0.06], rot: [0, 0, -90], anim: 'squeeze' } } },
        { t: 'Snake the wall pipe', d: 'If the trap was clear, feed a snake into the trap arm toward the wall and crank through the clog.', why: 'Kitchen lines often clog in the horizontal run inside the wall where grease cools.', v: { cam: [1.6, 1.0, 1.6], at: [-0.15, 0.74, -0.3], hi: ['snake'], show: ['snake'] } },
        { t: 'Reassemble and flush hot', d: 'Reconnect the trap hand-tight, then run hot water for 2 minutes and check for drips.', why: 'Hot water carries loosened grease out of the line.', v: { cam: [2.4, 1.8, 2.6], at: [0, 0.9, 0], hi: ['trap'], hide: ['snake', 'bucket', 'standingWater'] } },
      ],
      learn: {
        how: 'Both basins of a double sink feed one trap. A garbage disposal grinds food into small particles that ride the water flow to the trap and the house drain. Grease is the real enemy: liquid when hot, it cools and coats the pipe walls, and food particles stick to it until the pipe closes up.',
        specs: [['Kitchen drain size', '1½″'], ['Disposal hex', '¼″'], ['Flush time', '15–30 s cold water after grinding']],
        terms: [['Continuous waste', 'Pipe connecting both basins to one trap.'], ['Thermal overload', 'Switch that cuts motor power when it overheats.'], ['Air gap / high loop', 'Prevents dishwasher backflow.']],
        mistakes: ['Pouring grease down the drain.', 'Putting your hand in the disposal.', 'Plunging without plugging the other basin.'],
        tips: ['Run cold, not hot, water while grinding so grease stays solid and gets chopped and carried away.'],
      },
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
      summary: 'A shower head that drips at the arm, sprays sideways, or trickles is either clogged with scale or needs fresh thread-seal tape. Both fix in minutes.',
      intro: { hi: ['head', 'scale'], fx: 'spray' },
      safety: ['Protect the tub or shower floor with a towel; dropped tools crack acrylic.', 'Hold the shower arm steady while turning the head so you don’t twist the pipe inside the wall.'],
      causes: [['Mineral scale', 'Clogs the nozzles and causes weak, uneven spray.'], ['Old thread tape', 'Leaks at the connection to the arm.'], ['Worn washer in the head', 'Leaks at the swivel.']],
      tools: ['Adjustable wrench or tongue-and-groove pliers', 'Rag or tape (protect the finish)', 'Thread-seal (PTFE) tape', 'White vinegar & a zip-top bag', 'Old toothbrush'],
      steps: [
        { t: 'Unscrew the head', d: 'Wrap the nut with a rag and turn it counterclockwise while holding the arm steady.', why: 'The rag protects the chrome; holding the arm prevents twisting the fitting behind the wall.', v: { cam: [0.9, 2.3, 0.9], at: [0, 2.17, -0.53], hi: ['head'], tool: { id: 'adjWrench', at: [0.06, 2.19, -0.53], anim: 'turn', scale: 1.3 } } },
        { t: 'Descale it', d: 'Soak the head in vinegar for 1–2 hours (or overnight), then scrub the nozzles with a toothbrush.', why: 'Vinegar dissolves calcium deposits without harming chrome or plastic.', v: { cam: [0.9, 2.2, 0.9], at: [0.5, 1.9, -0.3], hi: ['head', 'scale'], mv: { head: [0.5, -0.25, 0.25] } } },
        { t: 'Clean and re-tape the threads', d: 'Wipe the arm threads clean, then wrap 3–4 turns of PTFE tape clockwise as you face the threads.', why: 'Clockwise wrapping tightens as the head screws on; counterclockwise unravels.', v: { cam: [0.7, 2.4, 0.8], at: [0, 2.22, -0.53], hi: ['threads', 'tape'], show: ['tape'] } },
        { t: 'Reinstall hand-tight + ¼ turn', d: 'Screw the head on by hand, then snug it a quarter turn with the wrench.', why: 'Tape seals the threads; overtightening cracks plastic heads.', v: { cam: [0.9, 2.3, 0.9], at: [0, 2.17, -0.53], hi: ['head'], mv: { head: [0, 0, 0] }, tool: { id: 'adjWrench', at: [0.06, 2.19, -0.53], anim: 'turn', scale: 1.3 } } },
        { t: 'Test the spray', d: 'Run the shower and check the connection for drips.', why: 'A drip at the nut means one more small snug.', v: { cam: [1.6, 2.2, 1.8], at: [0, 1.7, -0.5], hi: ['head'], fx: 'spray' } },
      ],
      learn: {
        how: 'A shower head screws onto a ½″ threaded arm. The threads don’t seal on their own; PTFE tape fills the gaps. Inside the head, small nozzles shape the spray, and hard water leaves calcium in them over time, which narrows each jet.',
        specs: [['Arm thread', '½″ NPT'], ['Max flow (US)', '2.5 gpm (many states 1.8–2.0)'], ['Tape wraps', '3–4']],
        terms: [['PTFE tape', 'Thread-seal tape (Teflon).'], ['Flow restrictor', 'Insert that limits gallons per minute.']],
        mistakes: ['Wrapping tape counterclockwise.', 'Removing the flow restrictor (may violate local codes).'],
        tips: ['Can’t remove it? Tie a bag of vinegar around the head with a rubber band overnight.'],
      },
      pro: 'Water leaks inside the wall, the arm is loose or cracked, or the valve drips when off (needs a cartridge).',
    },
    {
      id: 'tub-drain',
      title: 'Slow bathtub drain',
      model: 'tubDrain',
      level: 1,
      time: '20–40 min',
      cost: '$0–15',
      summary: 'Tub drains clog with hair just below the stopper. Pull the stopper, fish out the hair with a barbed strip, and flush.',
      intro: { hi: ['hair', 'water'] },
      safety: ['Skip chemical drain cleaners if you plan to work on the drain; they splash.', 'Wear gloves.'],
      causes: [['Hair caught below the stopper', 'Nearly always the cause.'], ['Soap scum buildup', 'Narrows the pipe over time.'], ['Clog in the trap below the tub', 'Needs a snake through the overflow.']],
      tools: ['Flat screwdriver or pliers (stopper removal)', 'Barbed drain-cleaning strip', 'Rubber gloves', 'Old towel'],
      steps: [
        { t: 'Remove the stopper', d: 'Most toe-touch stoppers unscrew counterclockwise. Lift-and-turn types have a small set screw on the knob.', why: 'Hair wraps the stopper’s post and the crossbars just below it.', v: { cam: [0.6, 0.8, 0.8], at: [-0.95, 0.1, 0], hi: ['stopper'], mv: { stopper: [0.25, 0.2, 0.2] }, tool: { id: 'screwdriver', at: [-0.95, 0.12, 0], anim: 'turn' } } },
        { t: 'Fish out the hair', d: 'Push the barbed strip into the drain, twist, and pull straight out. Repeat until it comes out clean.', why: 'The backward-facing barbs hook hair as you pull.', v: { cam: [0.6, 0.8, 0.8], at: [-0.95, 0.15, 0], hi: ['zip', 'hair'], show: ['zip'], mv: { hair: [0, 0.3, 0.05] } } },
        { t: 'Flush and reinstall', d: 'Run hot water for a minute, then reinstall the stopper.', why: 'Hot water carries away loosened soap scum.', v: { cam: [1.4, 1.6, 1.8], at: [0, 0.3, 0], hi: ['stopper'], hide: ['zip', 'hair', 'water'], mv: { stopper: [0, 0, 0] } } },
      ],
      learn: {
        how: 'A tub drains through a short pipe under the drain to a trap below the floor. The overflow plate connects to the same pipe. Hair caught on the stopper’s post builds into a mat that soap scum glues together.',
        specs: [['Tub drain size', '1½″'], ['Clean every', '2–3 months']],
        terms: [['Toe-touch stopper', 'Push-to-open, push-to-close stopper.'], ['Overflow', 'Opening near the top that prevents overfilling.']],
        mistakes: ['Pouring drain cleaner on a full clog (it sits there).'],
        tips: ['A $5 hair catcher prevents most tub clogs entirely.'],
      },
      pro: 'Water backs up in the tub when you flush the toilet; the main line is clogged.',
    },
    {
      id: 'toilet-wax',
      title: 'Toilet rocks or leaks at the base',
      model: 'toiletSeal',
      level: 3,
      time: '1–2 hrs',
      cost: '$10–25',
      summary: 'Water around the base or a toilet that rocks means the wax ring has failed. Pull the toilet, scrape the old wax, set a new ring, and bolt it down evenly.',
      intro: { hi: ['oldWax', 'flange'], hide: ['toilet', 'nuts'] },
      safety: ['A toilet weighs 60–120 lb. Lift with your legs or get help.', 'Stuff a rag in the drain while the toilet is off so sewer gas doesn’t escape and nothing falls in.', 'Wear gloves; the old wax and drain are unsanitary.'],
      causes: [['Failed wax ring', 'The seal between toilet and drain flattened or broke.'], ['Loose closet bolts', 'Let the toilet rock and break the seal.'], ['Broken flange', 'Needs a repair ring or plumber.']],
      tools: ['New wax ring (or foam/wax-free ring)', 'New closet bolts', 'Adjustable wrench', 'Putty knife', 'Sponge & bucket', 'Rag', 'Shims (if the floor is uneven)'],
      steps: [
        { t: 'Shut off and drain', d: 'Close the shutoff, flush and hold the handle, then sponge the bowl and tank dry. Disconnect the supply line.', why: 'Every cup of water left in it spills when you lift.', v: { cam: [2.2, 1.8, 2.4], at: [0, 0.6, 0], hi: ['toilet'], show: ['toilet', 'nuts'] } },
        { t: 'Remove the nuts and lift', d: 'Pop the bolt caps, unscrew the nuts, rock the toilet gently to break the seal, and lift it straight up onto cardboard.', why: 'Lifting straight up keeps the horn from scraping the flange.', v: { cam: [2.2, 1.8, 2.4], at: [0, 0.5, 0], hi: ['nuts', 'toilet'], mv: { toilet: [0.9, 0.3, 0.6], nuts: [0, 0.15, 0] }, tool: { id: 'adjWrench', at: [0.18, 0.08, 0.02], anim: 'turn', scale: 1.2 } } },
        { t: 'Scrape the old wax', d: 'Stuff a rag in the drain, then scrape all the wax off the flange and the toilet’s outlet horn.', why: 'Old wax leaves gaps the new ring can’t seal.', v: { cam: [1.0, 1.2, 1.2], at: [0, 0.03, 0], hi: ['oldWax', 'flange'], show: ['rag'], hide: ['nuts'], tool: { id: 'puttyKnife', at: [0.15, 0.05, 0.1], rot: [70, 0, 0], anim: 'slide', scale: 0.6 } } },
        { t: 'Set new bolts and wax', d: 'Slide new bolts into the flange slots. Remove the rag, then press the new wax ring onto the flange (or the toilet horn).', why: 'New bolts won’t be corroded or bent. Remove the rag last.', v: { cam: [1.0, 1.2, 1.2], at: [0, 0.05, 0], hi: ['newWax', 'bolts'], show: ['newWax'], hide: ['oldWax', 'rag'] } },
        { t: 'Lower and bolt down evenly', d: 'Lower the toilet straight onto the bolts, press down firmly with your weight, and tighten the nuts alternately until snug. Shim if it rocks.', why: 'Alternating keeps pressure even. Overtightening cracks porcelain.', v: { cam: [2.2, 1.8, 2.4], at: [0, 0.5, 0], hi: ['toilet', 'nuts'], mv: { toilet: [0, 0, 0], nuts: [0, 0, 0] }, show: ['nuts'], tool: { id: 'adjWrench', at: [-0.18, 0.08, 0.02], anim: 'turn', scale: 1.2 } } },
        { t: 'Reconnect and test', d: 'Reconnect the supply, open the shutoff, flush several times, and check the base.', why: 'Run a few flushes to load the seal before caulking around the front and sides (leave the back open to reveal future leaks).', v: { cam: [2.2, 1.8, 2.4], at: [0, 0.6, 0], hi: ['toilet'] } },
      ],
      learn: {
        how: 'A toilet bolts to a closet flange set into the floor over the drain pipe. A ring of soft wax between the toilet’s outlet horn and the flange forms a watertight, gas-tight seal. Wax doesn’t spring back: once the toilet rocks, the gap stays and leaks.',
        specs: [['Rough-in', '12″ typical (10″, 14″ exist)'], ['Bolt torque', 'snug, not cranked'], ['Toilet weight', '60–120 lb']],
        terms: [['Closet flange', 'Ring fitting that anchors the toilet over the drain.'], ['Horn', 'Outlet on the bottom of the toilet.'], ['Rough-in', 'Distance from wall to drain center.']],
        mistakes: ['Re-using an old wax ring.', 'Rocking the toilet after setting it.', 'Caulking all the way around.'],
        tips: ['Use a ring with a plastic horn if the flange sits below the finished floor.'],
      },
      pro: 'The flange is cracked or below floor level, the subfloor around it is soft, or the drain pipe is damaged.',
    },
    {
      id: 'frozen-pipe',
      title: 'Thaw a frozen pipe',
      model: 'frozenPipe',
      level: 2,
      time: '30–60 min',
      cost: '$0–20',
      summary: 'No water from one faucet on a freezing day usually means a frozen pipe in an outside wall, garage or crawlspace. Thaw it gently before it splits.',
      intro: { hi: ['ice', 'pipe'] },
      safety: ['Never use an open flame, propane torch or charcoal heater. They start fires and can make a pipe burst.', 'Know where your main shutoff is before you start in case the pipe is already split.', 'Keep space heaters away from anything flammable and never leave them unattended.'],
      causes: [['Pipe in an unheated space', 'Crawlspaces, garages, exterior walls and attics.'], ['Cold air leaks', 'Gaps near sill plates and vents blow cold onto pipes.'], ['Cabinet doors closed on an exterior wall', 'Blocks the house heat.']],
      tools: ['Hair dryer or heat gun on low', 'Towels', 'Flashlight', 'Foam pipe insulation', 'Space heater (for enclosed spaces)'],
      steps: [
        { t: 'Find the main shutoff', d: 'Locate the main shutoff so you can close it fast if the pipe has cracked.', why: 'Frozen pipes often split while frozen and only leak when they thaw.', v: { cam: [-0.6, 1.4, 1.2], at: [-1.2, 1.2, -0.4], hi: ['main', 'wheel'] } },
        { t: 'Open the faucet', d: 'Open the faucet the pipe feeds, both hot and cold.', why: 'Flowing water helps melt the ice and relieves pressure as it thaws.', v: { cam: [1.9, 1.2, 1.0], at: [1.3, 1.1, -0.4], hi: ['faucet'], show: ['drip'] } },
        { t: 'Warm from the faucet end', d: 'Work the hair dryer along the pipe starting near the faucet and moving toward the frozen section.', why: 'Starting near the faucet gives melting water a way out, so steam pressure can’t build behind the ice.', v: { cam: [1.2, 1.0, 1.0], at: [0.3, 1.1, -0.35], hi: ['heat', 'ice'], show: ['heat'] } },
        { t: 'Check for leaks as it flows', d: 'When full flow returns, shut the faucet and inspect the pipe for drips or bulges.', why: 'A split usually shows as a seam or bulge on the pipe.', v: { cam: [1.8, 1.0, 1.8], at: [0, 1.2, -0.4], hi: ['pipe'], hide: ['ice', 'heat', 'drip'] } },
        { t: 'Insulate it', d: 'Slip foam insulation over the exposed pipe and seal nearby drafts.', why: 'Insulation slows heat loss so the pipe rides out the next cold snap.', v: { cam: [1.8, 1.0, 1.8], at: [0, 1.2, -0.4], hi: ['sleeve'], show: ['sleeve'] } },
      ],
      learn: {
        how: 'Water expands about 9% when it freezes. Ice itself rarely splits a pipe at the frozen spot; the trapped water between the ice and a closed faucet gets squeezed until the pipe bursts. That’s why opening the faucet first matters.',
        specs: [['Freeze risk', 'below 20 °F outside'], ['Water expansion', '≈ 9%'], ['Trickle to prevent', 'pencil-lead thin']],
        terms: [['Main shutoff', 'Valve that stops water to the whole house.'], ['Heat tape', 'Electric cable that warms pipes; use UL-listed only.']],
        mistakes: ['Using a torch.', 'Thawing from the middle of the frozen section.', 'Leaving space heaters unattended.'],
        tips: ['On very cold nights, open cabinet doors on exterior walls and let a faucet trickle.'],
      },
      pro: 'You can’t reach the frozen section, the pipe is already split, or pipes freeze repeatedly (needs rerouting or insulation).',
    },
  ]);

})();
