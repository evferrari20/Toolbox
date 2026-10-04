/* BIK · Bike */
(function () {
  /* ---- Model: road/hybrid bike with rim brakes ---- */
  TB.model('bike', { cam: [0.4, 1.3, 3.0], at: [0, 0.65, 0], hidden: ['levers', 'tube', 'pump', 'lube'] }, (K) => {
    const R = 0.36;
    const rear = [-0.55, R, 0];
    const front = [0.55, R, 0];
    const bb = [-0.08, 0.3, 0];
    const seatTop = [-0.2, 0.92, 0];
    const headTop = [0.4, 0.9, 0];
    const headBot = [0.44, 0.74, 0];
    const frame = K.part('frame', [0, 0, 0], null, 'Frame');
    const fc = K.std(0x5f8fb8, { roughness: 0.4 });
    K.bar(frame, bb, seatTop, 0.025, fc);
    K.bar(frame, bb, headBot, 0.028, fc);
    K.bar(frame, seatTop, headTop, 0.022, fc);
    K.bar(frame, bb, [rear[0], rear[1], 0.05], 0.014, fc);
    K.bar(frame, bb, [rear[0], rear[1], -0.05], 0.014, fc);
    K.bar(frame, seatTop, [rear[0], rear[1], 0.05], 0.012, fc);
    K.bar(frame, seatTop, [rear[0], rear[1], -0.05], 0.012, fc);
    K.bar(frame, headBot, headTop, 0.03, fc);
    // fork
    const fork = K.part('fork', [0, 0, 0], null, 'Fork');
    K.bar(fork, headBot, [front[0], front[1], 0.05], 0.014, 'dark');
    K.bar(fork, headBot, [front[0], front[1], -0.05], 0.014, 'dark');
    K.bar(fork, headTop, [0.38, 1.02, 0], 0.016, 'dark');
    K.bar(fork, [0.38, 1.02, -0.22], [0.38, 1.02, 0.22], 0.014, 'dark');
    K.box(fork, [0.04, 0.03, 0.08], 'black', [0.4, 1.0, -0.22]);
    K.box(fork, [0.04, 0.03, 0.08], 'black', [0.4, 1.0, 0.22]);
    const lever = K.part('brakeLever', [0.43, 1.0, 0.2], null, 'Brake lever');
    K.box(lever, [0.1, 0.015, 0.02], 'grey', [0.03, -0.02, 0], [0, 0, -25]);
    const barrel = K.part('barrel', [0.38, 1.02, 0.16], null, 'Barrel adjuster');
    K.cyl(barrel, [0.012, 0.012, 0.03], 'chrome', [0, 0, 0], [90, 0, 0]);
    K.tube(null, [[0.38, 1.02, 0.15], [0.48, 1.05, 0.1], [0.62, 0.9, 0.02], [0.6, 0.76, 0]], 0.006, 'black');
    // seat + post
    K.bar(null, seatTop, [-0.24, 1.02, 0], 0.016, 'steel');
    K.box(null, [0.26, 0.05, 0.12], 'black', [-0.24, 1.05, 0]);

    function wheel(name, c, label) {
      const w = K.part(name, c, null, label);
      const tire = K.part(name + 'Tire', [0, 0, 0], w, label === 'Front wheel' ? 'Front tire' : 'Rear tire');
      K.tor(tire, [R - 0.03, 0.028], 'rubber');
      K.tor(w, [R - 0.065, 0.01], 'steel');
      K.rep(16, (i) => K.bar(w, [0, 0, 0], [Math.cos(i * 0.3927) * (R - 0.07), Math.sin(i * 0.3927) * (R - 0.07), 0], 0.003, 'chrome'));
      K.cyl(w, [0.025, 0.025, 0.1], 'grey', [0, 0, 0], [90, 0, 0]);
      const valve = K.part(name + 'Valve', [0, -(R - 0.07), 0], w, 'Valve stem');
      K.cyl(valve, [0.006, 0.006, 0.05], 'brass', [0, -0.02, 0]);
      return w;
    }
    wheel('frontWheel', front, 'Front wheel');
    wheel('rearWheel', rear, 'Rear wheel');
    const qr = K.part('qr', [front[0], front[1], 0.07], null, 'Quick-release lever');
    K.box(qr, [0.08, 0.012, 0.012], 'chrome', [0.03, 0.0, 0]);
    // rim brake caliper on front
    const cal = K.part('caliper', [front[0], front[1] + R - 0.02, 0], null, 'Brake caliper');
    K.box(cal, [0.04, 0.06, 0.12], 'grey', [0, 0.04, 0]);
    const pads = K.part('pads', [0, 0, 0], cal, 'Brake pads');
    K.box(pads, [0.05, 0.015, 0.012], 'black', [0, -0.03, 0.035]);
    K.box(pads, [0.05, 0.015, 0.012], 'black', [0, -0.03, -0.035]);
    // drivetrain
    const ring = K.part('chainring', bb, null, 'Chainring');
    K.cyl(ring, [0.11, 0.11, 0.01, 32], 'steel', [0, 0, 0.08], [90, 0, 0]);
    K.bar(ring, [0, 0, 0.1], [0.08, -0.15, 0.1], 0.012, 'steel');
    K.box(ring, [0.08, 0.02, 0.06], 'black', [0.08, -0.15, 0.14]);
    const cass = K.part('cassette', rear, null, 'Cassette (rear cogs)');
    K.rep(6, (i) => K.cyl(cass, [0.07 - i * 0.008, 0.07 - i * 0.008, 0.006, 24], 'steel', [0, 0, 0.06 + i * 0.008], [90, 0, 0]));
    const chain = K.part('chain', [0, 0, 0], null, 'Chain');
    K.tube(chain, [[bb[0], bb[1] + 0.11, 0.08], [rear[0], rear[1] + 0.07, 0.08]], 0.007, 'dark');
    K.tube(chain, [[bb[0], bb[1] - 0.11, 0.08], [-0.35, 0.18, 0.08], [rear[0] + 0.01, rear[1] - 0.17, 0.08]], 0.007, 'dark');
    const der = K.part('derailleur', [rear[0] + 0.01, rear[1] - 0.12, 0.1], null, 'Rear derailleur');
    K.box(der, [0.05, 0.12, 0.03], 'grey');
    K.cyl(der, [0.02, 0.02, 0.01], 'black', [0, -0.07, 0], [90, 0, 0]);
    // tools
    const lev = K.part('levers', [front[0] + 0.0, front[1] - R + 0.06, 0.05], null, 'Tire levers');
    K.box(lev, [0.02, 0.12, 0.01], 'yellow', [-0.03, -0.03, 0], [0, 0, 20]);
    K.box(lev, [0.02, 0.12, 0.01], 'yellow', [0.05, -0.03, 0], [0, 0, -20]);
    const tube = K.part('tube', [1.2, 0.4, 0.3], null, 'Inner tube');
    K.tor(tube, [0.3, 0.02], K.std(0x2a2c2f), [0, 0, 0], [80, 0, 0]);
    const hole = K.part('puncture', [0.3, 0, 0], tube, 'Puncture');
    K.sph(hole, 0.025, 'red');
    const pump = K.part('pump', [front[0] + 0.15, 0.2, 0.25], null, 'Floor pump');
    K.cyl(pump, [0.03, 0.03, 0.5], 'blue', [0, 0.25, 0]);
    K.box(pump, [0.25, 0.02, 0.1], 'dark', [0, 0.01, 0]);
    K.tube(pump, [[0, 0.1, 0], [-0.1, 0.05, -0.1], [-0.15, -0.0, -0.25]], 0.008, 'black');
    const lube = K.part('lube', [-0.3, 0.45, 0.25], null, 'Chain lube');
    K.cyl(lube, [0.03, 0.03, 0.12], 'green', [0, 0, 0], [0, 0, 60]);
    K.cone(lube, [0.012, 0.05], 'offwhite', [-0.08, -0.05, 0], [0, 0, 60]);
    return {
      tick(t, fx) {
        if (fx === 'spin') {
          K.parts.rearWheel.rotation.z = -t * 3;
          K.parts.chainring.rotation.z = -t * 1.5;
        }
        if (fx === 'spinFront') K.parts.frontWheel.rotation.z = -t * 3;
      },
    };
  });

  TB.category({
    id: 'bike',
    code: 'BIK',
    name: 'Bike',
    domain: 'vehicles',
    blurb: 'Flats, brakes and chains',
    repairs: [
      {
        id: 'bike-flat',
        title: 'Fix a flat bike tire',
        model: 'bike',
        level: 1,
        time: '20–30 min',
        cost: '$5–10',
        summary: 'Take the wheel off, lever off one side of the tire, find what caused the hole, and put in a new or patched tube.',
        intro: { hi: ['frontWheelTire'] },
        safety: ['Make sure the quick-release or axle nuts are fully tight before riding.', 'Find and remove the thorn or glass, or the new tube will go flat immediately.'],
        causes: [['Thorn, glass or wire', 'Usually still stuck in the tire.'], ['Pinch flat ("snakebite")', 'Two slits from hitting a curb with low pressure.'], ['Worn rim tape', 'Spoke holes cut the tube from inside.']],
        tools: ['Tire levers (2)', 'New tube (match size on tire sidewall) or patch kit', 'Pump with the right valve head (Presta or Schrader)', 'Rag'],
        steps: [
          { t: 'Open the brake and remove the wheel', d: 'Open the brake quick-release, flip the axle lever open, and drop the wheel out of the fork.', why: 'Rim brake pads grip closer than the inflated tire is wide. Opening them lets the wheel pass.', v: { cam: [1.2, 1.0, 1.6], at: [0.55, 0.5, 0], hi: ['qr', 'caliper'], mv: { frontWheel: [0.4, 0, 0.6] } } },
          { t: 'Lever off one side', d: 'Let out any remaining air. Hook a lever under the tire bead opposite the valve and clip it to a spoke. Slide the second lever around the rim.', why: 'Starting opposite the valve gives slack where the bead is easiest to lift.', v: { cam: [1.4, 0.7, 1.8], at: [0.95, 0.3, 0.6], hi: ['levers', 'frontWheelTire'], show: ['levers'], mv: { levers: [0.4, 0, 0.6] } } },
          { t: 'Pull the tube and find the cause', d: 'Pull out the tube. Pump it up to find the hole, then line it up with the tire to find where the culprit is. Run your fingers carefully inside the tire.', why: 'The hole in the tube points to the spot in the tire where the debris is stuck.', v: { cam: [1.8, 1.0, 1.8], at: [1.2, 0.4, 0.3], hi: ['tube', 'puncture'], show: ['tube'] } },
          { t: 'Install the new tube', d: 'Put a little air in the new tube so it holds shape. Valve through the rim hole first, then tuck the tube inside the tire all the way around.', why: 'A little air stops the tube twisting or getting caught under the bead.', v: { cam: [1.4, 0.8, 1.8], at: [0.95, 0.35, 0.6], hi: ['frontWheelValve'], hide: ['tube'] } },
          { t: 'Roll the bead back on', d: 'Starting at the valve, push the bead back over the rim with your thumbs, finishing opposite the valve.', why: 'Finishing opposite the valve makes the last tight section easiest. Avoid levers here; they pinch new tubes.', v: { cam: [1.4, 0.8, 1.8], at: [0.95, 0.35, 0.6], hi: ['frontWheelTire'], hide: ['levers'] } },
          { t: 'Inflate, check, reinstall', d: 'Inflate to the pressure on the sidewall, check the bead line is even all around, reinstall the wheel and close the brake.', why: 'An uneven bead line means the tire is not seated and can blow off the rim.', v: { cam: [0.4, 1.3, 3.0], at: [0.4, 0.6, 0], hi: ['pump', 'frontWheel'], show: ['pump'], mv: { frontWheel: [0, 0, 0] }, fx: 'spinFront' } },
        ],
        learn: {
          how: 'A clincher tire holds air with a separate inner tube. The tire’s stiff edges (beads) hook under the rim walls, and the air pressure locks them in place. The tire carries the load and resists punctures; the tube just holds the air.',
          specs: [['Road tire', '80–110 psi'], ['Hybrid tire', '50–70 psi'], ['Mountain tire', '25–35 psi'], ['Common size', '700×28c, 29×2.2″']],
          terms: [['Bead', 'Reinforced edge of the tire that hooks the rim.'], ['Presta', 'Thin valve with a locknut, common on road bikes.'], ['Schrader', 'Car-style valve.'], ['Rim tape', 'Strip that covers spoke holes inside the rim.']],
          mistakes: ['Not finding the thorn.', 'Pinching the new tube with a lever.', 'Riding with brakes left open.'],
          tips: ['Line the tire logo up with the valve. It makes finding the cause of the next flat much faster.'],
        },
        pro: 'The rim is dented, the tire sidewall is cut through, or flats keep recurring with no obvious cause.',
      },
      {
        id: 'bike-brakes',
        title: 'Brakes are weak or rub',
        model: 'bike',
        level: 1,
        time: '15–20 min',
        cost: '$0–20',
        summary: 'A lever that pulls to the bar or pads that squeal or rub need adjustment. The barrel adjuster fixes most of it in seconds.',
        intro: { hi: ['pads', 'brakeLever'] },
        safety: ['Test brakes at walking speed before riding.', 'Worn pads past the wear line must be replaced, not adjusted.'],
        causes: [['Cable stretch', 'New cables stretch in the first weeks.'], ['Worn pads', 'Grooves gone = replace.'], ['Off-center caliper', 'One pad rubs.'], ['Dirty rim', 'Oil or grime reduces grip.']],
        tools: ['4 & 5 mm hex keys', 'Rubbing alcohol & rag', 'Replacement pads (if worn)'],
        steps: [
          { t: 'Check pad wear', d: 'Look at the pads. If the grooves are nearly gone, replace them.', why: 'The grooves are the wear indicator and channel water off the rim.', v: { cam: [0.9, 1.0, 0.6], at: [0.55, 0.72, 0], hi: ['pads', 'caliper'] } },
          { t: 'Clean the rim', d: 'Wipe the rim braking surface with rubbing alcohol.', why: 'Chain oil or road film on the rim cuts braking power dramatically.', v: { cam: [1.4, 0.9, 1.4], at: [0.55, 0.4, 0], hi: ['frontWheel'] } },
          { t: 'Turn the barrel adjuster', d: 'Turn the barrel adjuster at the lever counterclockwise a few turns until the lever stops before reaching halfway to the bar.', why: 'Unscrewing the barrel lengthens the housing, which takes up cable slack and moves the pads closer.', v: { cam: [0.9, 1.3, 0.8], at: [0.4, 1.0, 0.16], hi: ['barrel', 'brakeLever'], rt: { barrel: [0, 0, 180] } } },
          { t: 'Center the caliper', d: 'If one pad rubs, loosen the caliper mounting bolt, squeeze the brake, and retighten while holding.', why: 'Squeezing pulls both pads onto the rim evenly, centering the caliper.', v: { cam: [0.9, 1.0, 0.6], at: [0.55, 0.72, 0], hi: ['caliper'], fx: 'spinFront' } },
          { t: 'Test', d: 'Spin the wheel: it should not rub. Squeeze hard: the wheel should lock with the lever well short of the bar.', why: 'If the lever can reach the bar, the brake can’t stop you in an emergency.', v: { cam: [0.4, 1.3, 3.0], at: [0.2, 0.65, 0], hi: ['brakeLever', 'pads'], rt: { barrel: [0, 0, 180] } } },
        ],
        learn: {
          how: 'A rim brake turns lever pull into pad pressure through a steel cable inside a housing. The housing pushes and the cable pulls, which closes the caliper arms. Any slack from cable stretch or pad wear is lever travel lost before the pads touch.',
          specs: [['Pad-to-rim gap', '1–2 mm'], ['Lever travel', 'stops ≥ 1″ from bar'], ['Caliper bolt torque', '6–8 N·m']],
          terms: [['Barrel adjuster', 'Threaded fitting that fine-tunes cable tension.'], ['Toe-in', 'Angling pads so the front touches first, which stops squeal.'], ['Housing', 'Outer sleeve the cable slides through.']],
          mistakes: ['Over-tightening the barrel so pads drag.', 'Using oil anywhere near the rim.'],
          tips: ['Squealing pads? Toe them in so the front edge touches about 1 mm before the back.'],
        },
        pro: 'Hydraulic disc brakes feel spongy (they need bleeding), or the cable is frayed.',
      },
      {
        id: 'bike-chain',
        title: 'Clean & lube the chain',
        model: 'bike',
        level: 1,
        time: '15 min',
        cost: '$10',
        summary: 'A dry, black or squeaky chain wears out gears fast and shifts poorly. Wipe, lube each link, then wipe again.',
        intro: { hi: ['chain', 'cassette', 'chainring'] },
        safety: ['Keep lube off the rims and brake pads.'],
        causes: [['Dirt and grime', 'Grit plus old oil acts like grinding paste.'], ['Washed off', 'Rain rides strip lube.'], ['Wear', 'An old chain stretches and skips.']],
        tools: ['Rag', 'Degreaser (optional)', 'Bike chain lube (wet or dry)', 'Chain checker tool (optional)'],
        steps: [
          { t: 'Wipe the chain', d: 'Hold a rag around the lower chain and backpedal 20 turns.', why: 'Removes the outer gunk so the new lube gets into the rollers instead of mixing with dirt.', v: { cam: [-0.3, 0.7, 1.4], at: [-0.3, 0.3, 0.08], hi: ['chain'], fx: 'spin' } },
          { t: 'Degrease if very dirty', d: 'For a black, crusty chain, scrub with degreaser and a brush, rinse, and dry fully.', why: 'Degreaser dissolves old oil; any water left inside the rollers causes rust.', v: { cam: [-0.6, 0.6, 1.2], at: [-0.55, 0.36, 0.08], hi: ['cassette', 'derailleur'] } },
          { t: 'One drop per roller', d: 'Backpedal slowly and put one drop of lube on each roller on the inside of the lower chain.', why: 'Lube does its job inside the rollers; the outside plates just collect dirt.', v: { cam: [-0.2, 0.6, 1.2], at: [-0.3, 0.25, 0.08], hi: ['lube', 'chain'], show: ['lube'], fx: 'spin' } },
          { t: 'Let it soak, then wipe', d: 'Spin the cranks for 30 seconds, wait a few minutes, then wipe the outside of the chain dry.', why: 'Extra lube on the outside attracts dirt.', v: { cam: [0.4, 1.3, 3.0], at: [-0.2, 0.4, 0], hi: ['chain'], hide: ['lube'], fx: 'spin' } },
        ],
        learn: {
          how: 'A chain is about 116 links, each with a roller turning on a pin. Every pedal stroke slides those parts against each other under load. Clean lube inside the rollers reduces that friction. Dirt turns into an abrasive paste that wears the chain and gears.',
          specs: [['Lube every', '≈ 100–200 mi or after rain'], ['Replace chain at', '0.5% stretch (11-speed)'], ['Typical links', '110–120']],
          terms: [['Wet lube', 'Thicker, for rain; attracts more dirt.'], ['Dry lube', 'Thin, for dry conditions.'], ['Chain stretch', 'Pin and roller wear that lengthens the chain.']],
          mistakes: ['Spraying WD-40 as lube.', 'Dumping lube on the outside.'],
          tips: ['Replacing a worn chain early saves the much pricier cassette and chainrings.'],
        },
        pro: 'Gears skip even after cleaning, or the chain skips under hard pedaling (worn cassette or bent hanger).',
      },
    ],
  });
})();
