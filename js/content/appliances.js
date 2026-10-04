/* APL · Appliances */
(function () {
  /* ---- Model: clothes dryer + vent run ---- */
  TB.model('dryer', { cam: [2.6, 2.0, 3.2], at: [0, 0.7, -0.4], hidden: ['brush'] }, (K) => {
    K.box(null, [3.4, 2.6, 0.08], 'drywall', [0, 1.3, -1.25]);
    const body = K.part('body', [0, 0, 0], null, 'Dryer cabinet');
    K.box(body, [1.0, 1.1, 0.9], 'white', [0, 0.6, 0]);
    K.box(body, [1.0, 0.2, 0.12], 'offwhite', [0, 1.2, -0.39]);
    K.box(body, [0.3, 0.08, 0.02], 'screen', [0.15, 1.22, -0.33]);
    K.cyl(body, [0.06, 0.06, 0.04], 'grey', [-0.25, 1.22, -0.32], [90, 0, 0]);
    const door = K.part('door', [-0.34, 0.6, 0.46], null, 'Door');
    K.cyl(door, [0.32, 0.32, 0.05, 40], 'lightgrey', [0.34, 0, 0], [90, 0, 0]);
    K.cyl(door, [0.24, 0.24, 0.06, 40], 'glass', [0.34, 0, 0.01], [90, 0, 0]);
    const drum = K.part('drum', [0, 0.6, 0], null, 'Drum');
    K.cyl(drum, [0.38, 0.38, 0.7, 30, true], 'steel', [0, 0, 0], [90, 0, 0]);
    const lint = K.part('lint', [0, 1.11, 0.25], null, 'Lint screen');
    K.box(lint, [0.5, 0.03, 0.18], 'grey');
    K.box(lint, [0.44, 0.032, 0.12], K.std(0xb7b0a5), [0, 0.003, 0]);
    // vent: transition duct from back to wall
    const duct = K.part('duct', [0, 0, 0], null, 'Transition duct');
    K.tube(duct, [[0, 0.35, -0.45], [0, 0.35, -0.7], [0.3, 0.6, -0.95], [0.6, 0.9, -1.15], [0.6, 0.9, -1.25]], 0.1, K.std(0xcfd4d8, { metalness: 0.4, roughness: 0.35 }));
    const clog = K.part('lintClog', [0.3, 0.6, -0.95], null, 'Lint buildup');
    K.sph(clog, 0.08, K.std(0xb9b1a6), [0, 0, 0], [1.3, 1, 1.3]);
    const wv = K.part('wallVent', [0.6, 0.9, -1.22], null, 'Wall vent connection');
    K.cyl(wv, [0.14, 0.14, 0.06], 'steel', [0, 0, 0], [90, 0, 0]);
    const clamp = K.part('clamps', [0, 0, 0], null, 'Duct clamps');
    K.tor(clamp, [0.105, 0.015], 'steel', [0, 0.35, -0.5]);
    K.tor(clamp, [0.105, 0.015], 'steel', [0.6, 0.9, -1.18]);
    const brush = K.part('brush', [0.6, 0.9, 0.0], null, 'Vent brush kit');
    K.cyl(brush, [0.012, 0.012, 1.4], 'grey', [0, 0, 0], [90, 0, 0]);
    K.cyl(brush, [0.09, 0.09, 0.2, 14], K.std(0x40474e, { roughness: 1 }), [0, 0, -0.75], [90, 0, 0]);
    K.box(brush, [0.15, 0.2, 0.2], 'yellow', [0, 0, 0.75]);
  });

  /* ---- Model: refrigerator with condenser coils ---- */
  TB.model('fridge', { cam: [2.8, 2.2, 3.4], at: [0, 1.0, 0], hidden: ['brush'] }, (K) => {
    K.box(null, [3.4, 2.8, 0.08], 'drywall', [0, 1.4, -0.75]);
    const body = K.part('body', [0, 0, 0], null, 'Fridge cabinet');
    K.box(body, [0.95, 1.85, 0.8], 'lightgrey', [0, 1.05, -0.2]);
    const door = K.part('door', [-0.47, 1.35, 0.22], null, 'Fridge door');
    K.box(door, [0.95, 1.2, 0.06], 'chrome', [0.475, 0, 0]);
    K.box(door, [0.04, 0.6, 0.06], 'steel', [0.85, 0, 0.06]);
    const gasket = K.part('gasket', [0, 1.35, 0.19], null, 'Door gasket');
    K.box(gasket, [0.9, 1.15, 0.02], K.std(0x2d3135, { transparent: true, opacity: 0.85 }));
    const fz = K.part('freezerDoor', [-0.47, 0.45, 0.22], null, 'Freezer drawer');
    K.box(fz, [0.95, 0.55, 0.06], 'chrome', [0.475, 0, 0]);
    K.box(fz, [0.5, 0.04, 0.06], 'steel', [0.475, 0.2, 0.06]);
    const kick = K.part('kick', [0, 0.08, 0.2], null, 'Toe-kick grille');
    K.box(kick, [0.9, 0.12, 0.03], 'black');
    const coils = K.part('coils', [0, 0.08, -0.15], null, 'Condenser coils');
    K.tube(coils, [[-0.38, 0, 0.25], [0.38, 0, 0.25], [0.38, 0, 0.12], [-0.38, 0, 0.12], [-0.38, 0, -0.02], [0.38, 0, -0.02], [0.38, 0, -0.16], [-0.38, 0, -0.16]], 0.018, 'black');
    const dust = K.part('dust', [0, 0.08, -0.0], null, 'Dust mat');
    K.box(dust, [0.8, 0.05, 0.45], K.std(0x8e8473, { transparent: true, opacity: 0.6, roughness: 1 }));
    const fan = K.part('fan', [0.25, 0.1, -0.45], null, 'Condenser fan');
    K.rep(4, (i) => K.box(fan, [0.02, 0.14, 0.04], 'dark', [0, 0, 0], [i * 45, 0, 0]));
    const th = K.part('dial', [0, 1.85, 0.12], null, 'Temperature control');
    K.box(th, [0.3, 0.08, 0.04], 'white');
    const brush = K.part('brush', [0.1, 0.12, 0.9], null, 'Coil brush');
    K.cyl(brush, [0.02, 0.02, 0.9], 'yellow', [0, 0, 0.3], [90, 0, 0]);
    K.cyl(brush, [0.06, 0.06, 0.5, 12], K.std(0x40474e, { roughness: 1 }), [0, 0, -0.35], [90, 0, 0]);
    return {
      tick(t, fx) {
        if (fx === 'run') K.parts.fan.rotation.z = t * 10;
      },
    };
  });

  /* ---- Model: dishwasher under a counter ---- */
  TB.model('dishwasher', { cam: [2.4, 1.8, 2.8], at: [0, 0.6, 0] }, (K) => {
    K.box(null, [2.6, 0.06, 1.0], 'stone', [0, 1.2, -0.1]);
    K.box(null, [0.7, 1.17, 1.0], 'woodLight', [-0.95, 0.585, -0.1]);
    K.box(null, [0.7, 1.17, 1.0], 'woodLight', [0.95, 0.585, -0.1]);
    const tub = K.part('tub', [0, 0, 0], null, 'Tub');
    K.box(tub, [1.2, 1.1, 0.04], 'steel', [0, 0.6, -0.58]);
    K.box(tub, [0.04, 1.1, 0.9], 'steel', [-0.58, 0.6, -0.15]);
    K.box(tub, [0.04, 1.1, 0.9], 'steel', [0.58, 0.6, -0.15]);
    K.box(tub, [1.2, 0.04, 0.9], 'steel', [0, 0.12, -0.15]);
    K.box(tub, [1.2, 0.04, 0.9], 'steel', [0, 1.13, -0.15]);
    const door = K.part('door', [0, 0.1, 0.32], null, 'Door');
    K.box(door, [1.18, 1.05, 0.06], 'chrome', [0, 0.53, 0]);
    K.box(door, [0.8, 0.04, 0.06], 'steel', [0, 0.95, 0.06]);
    const rack = K.part('rack', [0, 0.32, -0.15], null, 'Lower rack');
    K.rep(8, (i) => K.box(rack, [1.0, 0.02, 0.02], 'offwhite', [0, 0, -0.38 + i * 0.11]));
    K.rep(4, (i) => K.box(rack, [0.02, 0.2, 0.8], 'offwhite', [-0.48 + i * 0.32, 0.1, 0]));
    K.rep(4, (i) => K.cyl(rack, [0.04, 0.04, 0.03], 'black', [i < 2 ? -0.5 : 0.5, -0.02, i % 2 ? -0.35 : 0.35], [0, 0, 90]));
    const arm = K.part('sprayArm', [0, 0.2, -0.15], null, 'Spray arm');
    K.box(arm, [0.9, 0.03, 0.08], 'grey');
    K.cyl(arm, [0.06, 0.06, 0.06], 'grey');
    const filt = K.part('filter', [0.2, 0.16, 0.1], null, 'Filter cylinder');
    K.cyl(filt, [0.07, 0.07, 0.16], K.std(0xbfc6cc, { transparent: true, opacity: 0.85 }), [0, 0.08, 0]);
    K.cyl(filt, [0.08, 0.08, 0.03], 'grey', [0, 0.17, 0]);
    const gunk = K.part('gunk', [0, 0, 0], filt, 'Food debris');
    K.cyl(gunk, [0.06, 0.06, 0.06], 'dirt', [0, 0.03, 0]);
    const mesh = K.part('mesh', [0.2, 0.145, 0.1], null, 'Fine mesh screen');
    K.cyl(mesh, [0.2, 0.2, 0.01], K.std(0xaeb6bd, { metalness: 0.4 }));
    return {
      tick(t, fx) {
        if (fx === 'spin') K.parts.sprayArm.rotation.y = t * 3;
      },
    };
  });

  TB.category({
    id: 'appliances',
    code: 'APL',
    name: 'Appliances',
    domain: 'systems',
    blurb: 'Dryers, refrigerators and dishwashers',
    repairs: [
      {
        id: 'dryer-slow',
        title: 'Dryer takes forever to dry',
        model: 'dryer',
        level: 1,
        time: '45 min',
        cost: '$0–35',
        summary: 'Long dry times almost always mean restricted airflow from a lint-packed vent. It wastes energy, and lint fires start thousands of house fires a year.',
        intro: { hi: ['lintClog', 'duct'], xray: true },
        safety: ['Unplug the dryer. Gas dryers: also close the gas valve and be careful not to kink or strain the gas line.', 'Clogged dryer vents are a leading cause of home fires. Don’t put this off.'],
        causes: [['Lint-clogged vent', 'Lint gets past the screen and builds up in the duct.'], ['Crushed foil duct', 'Pushing the dryer back flattens flexible duct.'], ['Blocked outdoor hood', 'Lint, a bird nest or a stuck flap.'], ['Dirty lint screen', 'Dryer sheets leave an invisible film that blocks air.']],
        tools: ['Dryer vent brush kit', 'Screwdriver or nut driver', 'Vacuum', 'Semi-rigid aluminum duct (if replacing)', 'Foil tape (not cloth duct tape)'],
        steps: [
          { t: 'Clean the lint screen', d: 'Pull the screen and wash it with dish soap and a soft brush. Water should pass through it freely.', why: 'Dryer-sheet residue forms a nearly invisible film that blocks airflow even when the screen looks clean.', v: { cam: [1.2, 2.2, 1.6], at: [0, 1.1, 0.2], hi: ['lint'], mv: { lint: [0, 0.45, 0] } } },
          { t: 'Pull the dryer out and unplug', d: 'Slide the dryer forward far enough to reach behind. Unplug it.', why: 'Moving it gently avoids yanking the duct or gas line.', v: { cam: [2.4, 1.8, 1.2], at: [0, 0.6, -0.6], hi: ['body'] } },
          { t: 'Disconnect the duct', d: 'Loosen the clamps at the dryer and wall and remove the transition duct.', why: 'Most of the clogging happens in this short bendy piece.', v: { cam: [2.2, 1.6, 0.4], at: [0.3, 0.6, -0.9], hi: ['clamps', 'duct'], mv: { duct: [0.9, 0, 0.6], lintClog: [0.9, 0, 0.6] } } },
          { t: 'Brush out the wall vent', d: 'Feed the vent brush into the wall pipe, spinning it with a drill on low (clockwise only), and pull out lint. Vacuum as you go.', why: 'Clockwise rotation keeps the brush rods from unscrewing inside the wall.', v: { cam: [1.8, 1.6, 0.6], at: [0.6, 0.9, -1.0], hi: ['brush', 'wallVent'], show: ['brush'] } },
          { t: 'Clear the outdoor hood', d: 'Go outside and remove lint from the vent flap. Make sure the flap opens and closes freely.', why: 'A stuck-shut flap can block the whole run even when the duct is clean.', v: { cam: [1.6, 1.8, -2.6], at: [0.6, 0.9, -1.3], hi: ['wallVent'], hide: ['brush'] } },
          { t: 'Reconnect with semi-rigid duct', d: 'Replace crushed foil with semi-rigid aluminum duct. Clamp both ends and seal joints with foil tape. Never use screws, which catch lint.', why: 'Smooth walls shed lint; ribbed plastic or foil duct traps it and is a fire risk.', v: { cam: [2.6, 2.0, 1.8], at: [0.3, 0.6, -0.8], hi: ['duct', 'clamps'], mv: { duct: [0, 0, 0] }, hide: ['lintClog'] } },
        ],
        learn: {
          how: 'A dryer heats air, tumbles it through wet clothes, and pushes the moist air outside. Drying speed depends on airflow. Every bit of restriction slows the moisture removal, raises internal temperature, and leaves lint sitting near a heat source. A thermal fuse or cutoff opens if things get dangerously hot.',
          specs: [['Max duct length (rigid)', '≈ 35 ft minus 5 ft per 90° bend'], ['Duct diameter', '4″'], ['Normal dry cycle', '35–50 min']],
          terms: [['Transition duct', 'Short duct between dryer and wall.'], ['Thermal fuse', 'One-time safety fuse. A blown fuse means no heat, often due to a clog.'], ['Hood', 'Exterior vent cap with a flap.']],
          mistakes: ['Using vinyl or foil accordion duct.', 'Screwing duct joints together.', 'Pushing the dryer back so hard the duct crushes.'],
          tips: ['Run the dryer and feel the outdoor hood. Strong, warm airflow means the run is clear.', 'Clean the full vent run every year.'],
        },
        pro: 'The vent runs over 25 feet or through the roof, the dryer has no heat at all, or you smell gas.',
      },
      {
        id: 'fridge-warm',
        title: 'Fridge not cold enough',
        model: 'fridge',
        level: 1,
        time: '30 min',
        cost: '$0–15',
        summary: 'Dirty condenser coils and leaky door gaskets make a fridge run constantly and still run warm. Clean, check, and adjust before calling for service.',
        intro: { hi: ['coils', 'gasket'], xray: true, fx: 'run' },
        safety: ['Unplug the fridge before cleaning coils.', 'Don’t bend the coils or poke at the fan blades.'],
        causes: [['Dusty condenser coils', 'Heat can’t escape, so cooling drops.'], ['Leaky door gasket', 'Warm air sneaks in all day.'], ['Overpacked vents', 'Food blocking the air vent between freezer and fridge.'], ['Control set wrong', 'Bumped dial.']],
        tools: ['Refrigerator coil brush', 'Vacuum with crevice tool', 'Flashlight', 'Dollar bill (gasket test)', 'Appliance thermometer'],
        steps: [
          { t: 'Check the setting', d: 'Set the fridge to 37 °F and freezer to 0 °F. Put a thermometer in a glass of water on the middle shelf.', why: 'A glass of water reads the true food temperature, not the swings of the air.', v: { cam: [1.2, 2.4, 1.6], at: [0, 1.8, 0.1], hi: ['dial'] } },
          { t: 'Do the dollar-bill test', d: 'Close the door on a bill in several spots. If it slides out with no drag, the gasket isn’t sealing there.', why: 'A gasket leak lets in humid air, which also builds frost on the evaporator.', v: { cam: [2.0, 1.8, 1.8], at: [0, 1.3, 0.2], hi: ['gasket'], rt: { door: [0, -50, 0] } } },
          { t: 'Unplug and remove the kick grille', d: 'Unplug the fridge and pop the toe-kick grille off the bottom front.', why: 'The grille clips on and pulls straight off.', v: { cam: [1.0, 0.6, 1.6], at: [0, 0.1, 0.1], hi: ['kick'], rt: { door: [0, 0, 0] }, mv: { kick: [0, 0, 0.5] } } },
          { t: 'Brush and vacuum the coils', d: 'Slide the coil brush between the coils, working dust loose, then vacuum it out. Clean around the fan too.', why: 'A dust mat insulates the coils, so they can’t release heat and the compressor runs nonstop.', v: { cam: [1.2, 0.8, 1.6], at: [0, 0.1, 0], hi: ['coils', 'brush', 'dust'], show: ['brush'], xray: true } },
          { t: 'Refit, plug in, wait', d: 'Reattach the grille, plug in, and give it 24 hours. Don’t pack the vents with food.', why: 'A full temperature recovery takes most of a day. Checking sooner gives false readings.', v: { cam: [2.8, 2.2, 3.4], at: [0, 1.0, 0], hi: ['fan'], mv: { kick: [0, 0, 0] }, hide: ['brush', 'dust'], fx: 'run', xray: true } },
        ],
        learn: {
          how: 'A fridge is a heat pump. Refrigerant absorbs heat from inside the cabinet at the evaporator, then the compressor pumps it to the condenser coils where a fan blows it away into the room. If the coils are dusty, heat stays trapped, so the compressor runs longer and the inside warms up.',
          specs: [['Fridge setpoint', '37 °F (3 °C)'], ['Freezer setpoint', '0 °F (−18 °C)'], ['Coil cleaning', 'every 6–12 months'], ['Wall clearance', '≈ 1″ behind']],
          terms: [['Condenser coils', 'Where heat leaves the fridge.'], ['Evaporator', 'Cold coil inside the freezer.'], ['Defrost cycle', 'Timed heater that melts frost off the evaporator.']],
          mistakes: ['Checking temperature an hour after cleaning.', 'Blocking the fridge-to-freezer air vent with food.'],
          tips: ['With pets, clean coils every 3 months.', 'A gasket that won’t seal can sometimes be reshaped with a hair dryer on low.'],
        },
        pro: 'Frost builds on the back wall of the freezer, the compressor clicks on and off repeatedly, or the fridge is silent and warm.',
      },
      {
        id: 'dishwasher-filter',
        title: 'Dishwasher leaves food or won’t drain',
        model: 'dishwasher',
        level: 1,
        time: '20 min',
        cost: '$0',
        summary: 'Most dishwashers since 2010 have a manual filter that needs regular cleaning. A clogged one causes gritty dishes, odors and standing water.',
        intro: { hi: ['filter'], xray: true },
        safety: ['Turn the dishwasher off. Watch for broken glass in the filter area.'],
        causes: [['Clogged filter', 'Food and grease build up in the cylinder and mesh.'], ['Blocked spray arm holes', 'Seeds or grit plug the nozzles.'], ['Clogged drain hose or disposal', 'If water stays after cleaning the filter.']],
        tools: ['Soft brush', 'Dish soap', 'Towel', 'Toothpick'],
        steps: [
          { t: 'Open the door', d: 'Open the door fully.', why: 'You need full access to the floor of the tub.', v: { cam: [2.2, 1.8, 2.6], at: [0, 0.4, 0.2], hi: ['door'], rt: { door: [90, 0, 0] } } },
          { t: 'Pull out the lower rack', d: 'Roll the bottom rack out and lift it free.', why: 'The filter sits under the lower spray arm, so the rack has to come out.', v: { cam: [2.0, 1.8, 2.4], at: [0, 0.4, 0.4], hi: ['rack'], mv: { rack: [0, 0.1, 1.5] } } },
          { t: 'Twist out the filter', d: 'Turn the cylinder a quarter-turn counterclockwise and lift it out, then lift the flat mesh screen.', why: 'The cylinder catches large debris; the mesh catches fine particles.', v: { cam: [1.0, 1.4, 1.4], at: [0.2, 0.2, 0.1], hi: ['filter', 'gunk'], rt: { filter: [0, -90, 0] }, mv: { filter: [0, 0.5, 0.4] } } },
          { t: 'Wash both parts', d: 'Scrub them under warm running water with dish soap. Don’t use a wire brush.', why: 'Grease binds food to the mesh. Soap breaks the grease; a wire brush tears the mesh.', v: { cam: [1.0, 1.4, 1.4], at: [0.2, 0.5, 0.4], hi: ['filter', 'mesh'], hide: ['gunk'] } },
          { t: 'Clear the spray arm', d: 'Spin the arm by hand; it should turn freely. Poke out clogged holes with a toothpick.', why: 'Blocked nozzles mean dirty dishes in one area of the rack.', v: { cam: [1.6, 1.6, 1.6], at: [0, 0.2, -0.1], hi: ['sprayArm'], fx: 'spin' } },
          { t: 'Lock the filter back in', d: 'Seat the mesh, drop in the cylinder and twist clockwise until it locks. Replace the rack.', why: 'An unlocked filter lets debris reach the pump and can damage it.', v: { cam: [2.4, 1.8, 2.8], at: [0, 0.5, 0], hi: ['filter'], mv: { filter: [0, 0, 0], rack: [0, 0, 0] }, rt: { filter: [0, 0, 0], door: [0, 0, 0] } } },
        ],
        learn: {
          how: 'A dishwasher reuses a small amount of water many times. A pump pushes water up through the spray arms, it falls back down through the filter, and gets pumped again. Because the same water circulates, the filter is what keeps food from getting sprayed back onto clean dishes.',
          specs: [['Water per cycle', '3–5 gal'], ['Filter cleaning', 'monthly'], ['Ideal water temp', '120 °F at the tap']],
          terms: [['Manual filter', 'User-cleaned filter, standard on quieter modern dishwashers.'], ['Air gap', 'Countertop fitting that prevents dirty water backflow.'], ['High loop', 'Drain hose looped up under the counter for the same reason.']],
          mistakes: ['Pre-rinsing everything (enzymes in detergent need food to work on), but then skipping filter cleaning.', 'Using a wire brush on the mesh.'],
          tips: ['Run the kitchen tap hot before starting so the first fill isn’t cold.'],
        },
        pro: 'Water still won’t drain with a clean filter, the pump hums but nothing moves, or there’s a leak under the door.',
      },
    ],
  });
})();
