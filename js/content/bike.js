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
        summary: 'Take the wheel off, lever one side of the tire off the rim, find what caused the hole, and fit a new or patched tube. With practice it takes about 15 minutes.',
        intro: { hi: ['frontWheelTire'] },
        safety: ['Before riding, make sure the quick-release lever or thru-axle is fully closed and tight, and the brake is closed again.', 'Find and remove the thorn, glass or wire, or the new tube will go flat right away.', 'Never inflate past the max pressure printed on the tire or rim.'],
        causes: [['Thorn, glass or wire', 'Usually still stuck in the tire.'], ['Pinch flat (“snakebite”)', 'Two small slits side by side from hitting a curb or pothole with low pressure.'], ['Worn or shifted rim tape', 'Spoke holes or sharp edges cut the tube from the inside.'], ['Worn tire', 'Thin tread or threads showing lets debris through easily.']],
        tools: ['Tire levers (2, plastic)', 'New tube (size on the tire sidewall, e.g. 700×28c) or a patch kit', 'Pump with the right head for your valve (Presta or Schrader)', 'Rag', 'Pressure gauge (many floor pumps have one)'],
        steps: [
          { t: 'Open the brake and remove the wheel', d: 'Open the rim brake’s quick release (a small lever on the brake or a button on the brake lever). Flip the wheel’s quick-release lever open, or unscrew the thru-axle, and drop the wheel out of the fork. For a rear wheel, shift to the smallest cog first and pull the derailleur back.', why: 'Rim brake pads sit closer together than the inflated tire is wide; opening them lets the wheel pass.', tip: 'Turn the bike upside down on its saddle and bars if you have no stand, or lean it against a wall drive side out.', ok: 'The wheel is out of the bike and the brake is open.', v: { cam: [1.2, 1.0, 1.6], at: [0.55, 0.5, 0], hi: ['qr', 'caliper'], mv: { frontWheel: [0.4, 0, 0.6] } } },
          { t: 'Lever off one side', d: 'Let all the air out (on Presta, unscrew the little tip nut and press it). Push the tire bead into the rim center all the way round. Hook a lever under the bead opposite the valve and clip it to a spoke. Insert a second lever a few inches away and slide it around the rim.', why: 'Pushing beads into the center gives slack; starting opposite the valve is where the bead lifts easiest.', tip: 'Tire too tight? Squeeze the tire all the way round into the rim center again; that slack makes levering much easier.', ok: 'One side of the tire is off the rim all the way round.', v: { cam: [1.4, 0.7, 1.8], at: [0.95, 0.3, 0.6], hi: ['levers', 'frontWheelTire'], show: ['levers'], mv: { levers: [0.4, 0, 0.6] } } },
          { t: 'Pull the tube and find the cause', d: 'Pull out the tube. Pump it up and listen or feel for the hole, then line the tube up with the tire to find the matching spot. Run your fingers carefully inside the tire and check the rim tape covers every spoke hole.', why: 'The hole in the tube points to the spot where the debris is.', tip: 'Run a cotton rag inside the tire instead of fingers; it snags on thorns and glass without cutting you.', ok: 'You found and removed the cause, or the rim tape and tire inside are clean.', v: { cam: [1.8, 1.0, 1.8], at: [1.2, 0.4, 0.3], hi: ['tube', 'puncture'], show: ['tube'] } },
          { t: 'Install the new tube', d: 'Put just enough air in the new tube to give it shape. Put the valve through the rim hole first, then tuck the tube inside the tire all the way round.', why: 'A little air stops the tube twisting or getting caught under the bead.', tip: 'Line up the tire logo with the valve; next flat, you can find the cause faster.', ok: 'The tube sits inside the tire evenly with the valve straight.', v: { cam: [1.4, 0.8, 1.8], at: [0.95, 0.35, 0.6], hi: ['frontWheelValve'], hide: ['tube'] } },
          { t: 'Roll the bead back on', d: 'Starting at the valve, push the bead back over the rim with your thumbs, working both directions and finishing opposite the valve.', why: 'Finishing opposite the valve makes the last tight section easiest. Avoid levers here; they pinch new tubes.', tip: 'For the last tight section, push already-mounted bead into the rim center to gain slack, then roll the last part with your palms.', ok: 'The bead is fully on and no tube peeks out between tire and rim.', v: { cam: [1.4, 0.8, 1.8], at: [0.95, 0.35, 0.6], hi: ['frontWheelTire'], hide: ['levers'] } },
          { t: 'Inflate, check, reinstall', d: 'Inflate to about 20 psi and check the molded line just above the rim is even all round on both sides. Then inflate to your pressure (within the sidewall range), reinstall the wheel, close the quick release or axle firmly, and close the brake.', why: 'An uneven bead line means the tire is not seated and can blow off the rim.', tip: 'Quick-release lever should leave an imprint in your palm when you close it.', ok: 'The tire holds pressure, spins straight, and the brake grabs when squeezed.', v: { cam: [0.4, 1.3, 3.0], at: [0.4, 0.6, 0], hi: ['pump', 'frontWheel'], show: ['pump'], mv: { frontWheel: [0, 0, 0] }, fx: 'spinFront' } },
        ],
        tricks: [['Carry a flat kit', 'A spare tube, two plastic levers, a mini pump or CO₂ inflator, and a patch kit fit in a small saddle bag. Check the tube size matches your tire.'], ['Patch at home', 'Swap in a fresh tube on the road and patch the old one at home, where it’s easy to do carefully. Rough the area with the sandpaper, let the glue go tacky, then press the patch hard.'], ['Check pressure weekly', 'Tubes slowly lose air through the rubber, especially thin road tubes. Low pressure is the main cause of pinch flats.'], ['Presta valve trick', 'After unscrewing the tiny tip nut, press it once to let a puff of air out. That unsticks the valve so the pump can push air in.'], ['Same flat again?', 'Holes on the inside of the tube (rim side) point to rim tape or a spoke end. Holes on the outside point to something still in the tire.']],
        refs: [['Tire and Tube Removal and Installation (Park Tool)', 'https://www.parktool.com/en-us/blog/repair-help/tire-and-tube-removal-and-installation'], ['How to Patch a Tire and Tube (Park Tool)', 'https://www.parktool.com/en-us/blog/repair-help/inner-tube-repair'], ['Tire, Wheel and Inner Tube Fit Standards (Park Tool)', 'https://parktool.com/blog/repair-help/tire-wheel-and-inner-tube-fit-standards']],
        learn: {
          how: 'A clincher tire holds air with a separate inner tube. The tire’s stiff edges (beads) hook under the rim walls, and air pressure locks them in place. The tire carries the load and resists punctures; the tube just holds the air.',
          specs: [['Road tire (25–32 mm)', '≈ 60–90 psi (see sidewall)'], ['Hybrid tire', '50–70 psi'], ['Mountain tire (tube)', '25–35 psi'], ['Seat-check pressure', '≈ 20 psi']],
          terms: [['Bead', 'Reinforced edge of the tire that hooks the rim.'], ['Presta', 'Thin valve with a locknut, common on road bikes.'], ['Schrader', 'Car-style valve.'], ['Rim tape', 'Strip that covers spoke holes inside the rim.']],
          mistakes: ['Not finding the thorn.', 'Pinching the new tube with a lever.', 'Riding with the brake left open.'],
          tips: ['Line the tire logo up with the valve.', 'Carry a spare tube.'],
        },
        pro: 'See a shop if the rim is dented, the tire sidewall is cut through, or flats keep recurring with no obvious cause.',
      },
      {
        id: 'bike-brakes',
        title: 'Brakes are weak or rub',
        model: 'bike',
        level: 1,
        time: '15–20 min',
        cost: '$0–20',
        summary: 'A lever that pulls close to the bar, or pads that squeal or rub, usually need adjustment. The barrel adjuster fixes most of it in seconds; worn pads need replacing.',
        intro: { hi: ['pads', 'brakeLever'] },
        safety: ['Test brakes at walking speed before riding.', 'Worn pads past the wear line must be replaced, not adjusted.', 'Keep oil and lube away from rims and pads.'],
        causes: [['Cable stretch', 'New cables stretch in the first weeks.'], ['Worn pads', 'Grooves gone means replace.'], ['Off-center caliper', 'One pad rubs.'], ['Dirty rim', 'Oil or grime reduces grip.']],
        tools: ['4 and 5 mm hex keys', 'Rubbing alcohol and rag', 'Replacement pads (if worn)', 'Small Phillips screwdriver or 2.5 mm hex key (centering screw)'],
        steps: [
          { t: 'Check pad wear', d: 'Look at each pad. If the grooves are nearly gone or you see metal, replace them.', why: 'The grooves are the wear indicator and channel water off the rim.', tip: 'Pick out embedded grit or aluminum flecks with a pick; they cause grinding.', ok: 'Each pad shows clear grooves.', v: { cam: [0.9, 1.0, 0.6], at: [0.55, 0.72, 0], hi: ['pads', 'caliper'] } },
          { t: 'Clean the rim', d: 'Wipe the rim braking surface with rubbing alcohol on a rag.', why: 'Oil or road film on the rim cuts braking power dramatically.', tip: 'Spin the wheel slowly and hold the rag against the rim.', ok: 'The rag comes away clean from the rim.', v: { cam: [1.4, 0.9, 1.4], at: [0.55, 0.4, 0], hi: ['frontWheel'] } },
          { t: 'Turn the barrel adjuster', d: 'Turn the barrel adjuster at the brake lever or caliper counterclockwise a turn at a time until the lever stops well before reaching the bar.', why: 'Unscrewing the barrel takes up cable slack, moving the pads closer to the rim.', tip: 'Run out of barrel threads? Screw it back in, loosen the cable anchor bolt, pull a little cable through, and retighten.', ok: 'The lever firms up about halfway to the bar.', v: { cam: [0.9, 1.3, 0.8], at: [0.4, 1.0, 0.16], hi: ['barrel', 'brakeLever'], rt: { barrel: [0, 0, 180] } } },
          { t: 'Center the caliper', d: 'If one pad rubs, turn the centering screw on a dual-pivot brake a quarter turn at a time (clockwise moves pads toward the screw side). On brakes without a screw, loosen the mounting bolt, squeeze the brake, and retighten.', why: 'Centering puts equal gaps on each side so the pads hit the rim together.', tip: 'Spin the wheel after each quarter turn to check for rub.', ok: 'Both pads sit 1–2 mm off the rim and the wheel spins without rubbing.', v: { cam: [0.9, 1.0, 0.6], at: [0.55, 0.72, 0], hi: ['caliper'], fx: 'spinFront' } },
          { t: 'Test', d: 'Spin the wheel: it should not rub. Squeeze hard: the wheel should lock with the lever well short of the bar.', why: 'If the lever can reach the bar, the brake can’t stop you in an emergency.', tip: 'Push the bike forward with the brake on; it should skid, not roll.', ok: 'No rub, strong bite, and at least a finger’s width between lever and bar.', v: { cam: [0.4, 1.3, 3.0], at: [0.2, 0.65, 0], hi: ['brakeLever', 'pads'], rt: { barrel: [0, 0, 180] } } },
        ],
        tricks: [['Toe-in stops squeal', 'Angle pads so the front edge touches about 1 mm before the back. A rubber band or a folded business card at the back of the pad while you tighten it sets the angle.'], ['Replace pads as a set', 'Change both pads on a brake at the same time so they wear and grip evenly; new pads usually just slide into the old holders or bolt on with a 4–5 mm hex key.'], ['Wet weather pads', 'Salmon-colored pad compounds grip noticeably better on wet aluminum rims than plain black ones, and they’re easy on the rim.'], ['Check the cable ends', 'Look where the cable exits the lever and the anchor bolt. Any broken strands mean replace the cable now; a frayed cable can snap mid-ride.'], ['Pads must hit only the rim', 'Pads touching the tire sidewall can cut it and cause a blowout. Loosen the pad bolt, squeeze the lever to hold the pad on the rim, and retighten (about 5–7 N·m).']],
        refs: [['Dual Pivot Brake Service (Park Tool)', 'https://www.parktool.com/en-us/blog/repair-help/dual-pivot-brake-service'], ['Linear Pull Brake Service (Park Tool)', 'https://www.parktool.com/en-us/blog/repair-help/linear-pull-brake-service'], ['Brake Pad Replacement: Rim Brakes (Park Tool)', 'https://www.parktool.com/en-int/blog/repair-help/brake-pad-replacement-rim-brakes']],
        learn: {
          how: 'A rim brake turns lever pull into pad pressure through a steel cable inside a housing. Any slack from cable stretch or pad wear is lever travel lost before the pads touch.',
          specs: [['Pad-to-rim gap', '1–2 mm'], ['Lever travel', 'stops ≥ 1″ from bar'], ['Caliper mount', '≈ 6–10 N·m (check brake spec)'], ['Toe-in', '≈ 1 mm at trailing edge']],
          terms: [['Barrel adjuster', 'Threaded fitting that fine-tunes cable tension.'], ['Toe-in', 'Angling pads so the front touches first.'], ['Housing', 'Outer sleeve the cable slides through.'], ['Centering screw', 'Small screw that shifts a dual-pivot caliper side to side.']],
          mistakes: ['Over-tightening the barrel so pads drag.', 'Using oil near the rim.'],
          tips: ['Toe pads in to stop squeal.'],
        },
        pro: 'See a shop if the cable is frayed, the caliper is damaged, or brakes still feel weak after adjustment.',
      },
      {
        id: 'bike-chain',
        title: 'Clean & lube the chain',
        model: 'bike',
        level: 1,
        time: '15 min',
        cost: '$10',
        summary: 'A dry, black or squeaky chain wears out gears fast and shifts poorly. Check wear, wipe, lube each roller, then wipe off the extra.',
        intro: { hi: ['chain', 'cassette', 'chainring'] },
        safety: ['Keep lube and degreaser off rims, pads and disc rotors.', 'Keep fingers away from where the chain meets the cogs while pedaling.'],
        causes: [['Dirt and grime', 'Grit plus old oil acts like grinding paste.'], ['Washed off', 'Rain rides strip lube.'], ['Wear', 'An old chain lengthens and skips.']],
        tools: ['Rag', 'Degreaser (optional)', 'Bike chain lube (wet or dry)', 'Chain checker (optional)'],
        steps: [
          { t: 'Wipe the chain', d: 'Hold a rag around the lower chain and backpedal 20 turns.', why: 'Removes the outer gunk so the new lube gets into the rollers.', tip: 'Check chain wear first with a chain checker; a worn chain should be replaced, not cleaned.', ok: 'The rag no longer picks up much black grime.', v: { cam: [-0.3, 0.7, 1.4], at: [-0.3, 0.3, 0.08], hi: ['chain'], fx: 'spin' } },
          { t: 'Degrease if very dirty', d: 'For a black, crusty chain, scrub with degreaser and a brush, rinse with water, and let dry fully.', why: 'Degreaser dissolves old oil; water left inside rollers causes rust.', tip: 'Cover brakes with a rag before degreasing.', ok: 'Chain sides look silver and dry.', v: { cam: [-0.6, 0.6, 1.2], at: [-0.55, 0.36, 0.08], hi: ['cassette', 'derailleur'] } },
          { t: 'One drop per roller', d: 'Backpedal slowly and put one drop of lube on each roller on the inside of the lower chain.', why: 'Lube works inside the rollers; the outside plates just collect dirt.', tip: 'Start at the quick-link so you know where you began.', ok: 'Every roller has one drop.', v: { cam: [-0.2, 0.6, 1.2], at: [-0.3, 0.25, 0.08], hi: ['lube', 'chain'], show: ['lube'], fx: 'spin' } },
          { t: 'Let it soak, then wipe', d: 'Spin the cranks 30 seconds, wait a few minutes, then wipe the outside of the chain dry.', why: 'Extra lube on the outside attracts dirt.', tip: 'Wipe again after a few minutes for a cleaner chain.', ok: 'Chain feels nearly dry on the outside and runs quietly.', v: { cam: [0.4, 1.3, 3.0], at: [-0.2, 0.4, 0], hi: ['chain'], hide: ['lube'], fx: 'spin' } },
        ],
        tricks: [['Replace on time', 'Replace the chain at 0.5% wear for 11–12 speed or 0.75% for 10 speed and fewer. A $25 chain swapped on time saves a $60–200 cassette and chainrings.'], ['Skip WD-40 as lube', 'Regular WD-40 is a solvent and water displacer; it strips lube and leaves the chain dry within a ride. Use real bike chain lube.'], ['Lube after rain', 'After a wet ride, wipe the chain dry and re-lube that day, or you’ll find orange rust by morning.'], ['Wet vs dry lube', 'Wet lube lasts through rain but collects grime; dry or wax lube stays cleaner in dusty conditions but needs reapplying more often.'], ['Use a quick-link', 'A quick-link (master link) lets you pull the chain off by hand for a deep clean in a jar of degreaser. Match the link to your chain’s speed count.']],
        refs: [['How to Clean and Lubricate a Chain (Park Tool)', 'https://www.parktool.com/en-us/blog/repair-help/chain-cleaning-with-a-park-tool-chain-scrubber'], ['When to Replace a Worn Chain (Park Tool)', 'https://www.parktool.com/en-us/blog/repair-help/when-to-replace-a-chain-on-a-bicycle'], ['CC-3.2 Chain Wear Indicator (Park Tool)', 'https://www.parktool.com/en-us/product/chain-wear-indicator-cc-3-2']],
        learn: {
          how: 'A chain has about 110–126 links, each with a roller turning on a pin. Clean lube inside the rollers reduces friction.',
          specs: [['Lube every', '≈ 100–200 mi or after rain'], ['Replace chain (11–12 sp)', '0.5% wear'], ['Replace chain (≤10 sp)', '0.75% wear'], ['Typical links', '110–126']],
          terms: [['Wet lube', 'Thicker, for rain.'], ['Dry lube', 'Thin, for dry conditions.'], ['Chain stretch', 'Pin and roller wear that lengthens the chain.']],
          mistakes: ['Spraying WD-40 as lube.', 'Dumping lube on the outside.'],
          tips: ['Replacing a worn chain early saves the cassette.'],
        },
        pro: 'See a shop if gears skip even after cleaning, or the chain skips under hard pedaling.',
      },
    ],
  });
})();
