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
        summary: 'Long dry times almost always mean airflow is blocked by a lint-packed vent. It wastes energy, and about 2,900 home dryer fires a year are reported in the US, with failure to clean the leading cause.',
        intro: { hi: ['lintClog', 'duct'], xray: true },
        safety: ['Unplug the dryer. Gas dryers: also close the gas valve and be careful not to kink or strain the gas line.', 'Clogged dryer vents are a leading cause of home fires. Don’t put this off.', 'Wear a dust mask; old lint is very dusty.', 'Never leave a dryer running when nobody is home or while you sleep if it’s drying slowly.'],
        causes: [['Lint-clogged vent', 'Lint gets past the screen and builds up in the duct.'], ['Crushed foil duct', 'Pushing the dryer back flattens flexible duct.'], ['Blocked outdoor hood', 'Lint, a bird nest or a stuck flap.'], ['Dirty lint screen', 'Dryer sheets leave an invisible film that blocks air.']],
        tools: ['Dryer vent brush kit with screw-together rods', 'Drill (low speed)', 'Screwdriver or nut driver', 'Vacuum', 'Semi-rigid aluminum duct, 4″ (if replacing)', 'Two 4″ clamps', 'Foil tape (not cloth duct tape)', 'Trash bags', 'Dust mask'],
        steps: [
          { t: 'Wash the lint screen', d: 'Pull the lint screen straight up out of its slot and peel off the lint. Then scrub both sides with warm water, a drop of dish soap and a soft brush, rinse, and let it dry. Run water onto it: it should pass straight through, not bead up.', why: 'Dryer-sheet and softener residue forms a nearly invisible film that blocks airflow even when the screen looks clean.', tip: 'If water pools on the screen like a tray, the film is still there; scrub again. Never run the dryer without the screen in place, even for a minute.', ok: 'Water poured on the screen flows right through the mesh.', v: { cam: [1.2, 2.2, 1.6], at: [0, 1.1, 0.2], hi: ['lint'], mv: { lint: [0, 0.45, 0] } } },
          { t: 'Pull the dryer out and unplug', d: 'Slide the dryer straight forward about 2′, lifting the front slightly so it doesn’t scrape the floor. Unplug it from the wall. On a gas dryer, also turn the gas valve handle so it crosses the pipe.', why: 'Moving it slowly and straight avoids yanking off the duct or straining the gas line.', tip: 'Lay a piece of cardboard under the front feet first and the dryer will glide out without marking the floor.', ok: 'The plug is out of the wall and you can reach the duct behind the dryer.', v: { cam: [2.4, 1.8, 1.2], at: [0, 0.6, -0.6], hi: ['body'] } },
          { t: 'Disconnect the duct', d: 'Loosen the clamp holding the short duct to the dryer’s exhaust outlet with a screwdriver or nut driver, then the clamp at the wall pipe. Wiggle the duct off both ends.', why: 'Most clogging happens in this short bendy piece, called the transition duct, and at the dryer outlet.', tip: 'Hold a trash bag under each end as it comes off; lint will fall out. Reach into the dryer’s outlet and pull out any lint you can feel.', ok: 'The transition duct is off and both openings are visible.', v: { cam: [2.2, 1.6, 0.4], at: [0.3, 0.6, -0.9], hi: ['clamps', 'duct'], mv: { duct: [0.9, 0, 0.6], lintClog: [0.9, 0, 0.6] } } },
          { t: 'Brush out the wall vent', d: 'Screw the vent brush rods together and feed the brush into the wall pipe. Spin it with a drill set on low speed, clockwise only, while pushing slowly in and pulling back out. Vacuum lint as it comes out. Repeat until the brush comes out clean.', why: 'Clockwise rotation keeps the threaded rods from unscrewing and leaving a brush stuck in the wall.', tip: 'Have a helper outside watch the vent hood: when lint puffs out of it, you’ve reached the end. If the brush jams, stop the drill and pull back gently while turning by hand clockwise.', ok: 'The brush comes out clean and you can feel air move through the pipe when you blow into it.', v: { cam: [1.8, 1.6, 0.6], at: [0.6, 0.9, -1.0], hi: ['brush', 'wallVent'], show: ['brush'] } },
          { t: 'Clear the outdoor hood', d: 'Go outside to the vent hood (the cap on the wall). Pull out lint, nests or debris from the opening and flap. Push the flap open and let go: it should swing freely and close by itself.', why: 'A stuck-shut flap or a clogged screen blocks the whole run even when the duct is clean.', tip: 'If the hood has a mesh screen over it, remove it; screens catch lint and are not allowed on dryer vents. A hood that sticks can be swapped for a new one for about $15–25.', ok: 'The flap swings open easily and closes by itself, and the opening is clear.', v: { cam: [1.6, 1.8, -2.6], at: [0.6, 0.9, -1.3], hi: ['wallVent'], hide: ['brush'] } },
          { t: 'Reconnect with metal duct', d: 'Replace any plastic or crushed foil duct with semi-rigid aluminum duct, as short and straight as possible. Slip each end over its outlet, tighten the clamps, and seal joints with foil tape (not cloth duct tape). Never use screws, which snag lint. Push the dryer back without crushing the duct.', why: 'Smooth metal walls let lint pass; ribbed plastic or foil traps it and can feed a fire.', tip: 'After you plug it back in, run the dryer on air-only and step outside: you should feel strong airflow at the hood. A periscope-style flat duct helps when the dryer must sit close to the wall.', ok: 'Strong, warm airflow comes out of the outdoor hood and the duct behind the dryer has no kinks.', v: { cam: [2.6, 2.0, 1.8], at: [0.3, 0.6, -0.8], hi: ['duct', 'clamps'], mv: { duct: [0, 0, 0] }, hide: ['lintClog'] } },
        ],
        tricks: [
          ['Test airflow first', 'Run the dryer on air-only and feel the outdoor hood. Weak airflow means a clog or kink. It takes 30 seconds and tells you where to start.'],
          ['Dryer sheets leave film', 'Dryer sheets coat the lint screen. Wash the screen every month or two, or switch to wool dryer balls.'],
          ['Short and straight wins', 'Every 90° bend costs as much airflow as 5′ of straight pipe. Moving the dryer a few inches to remove a bend can speed drying noticeably.'],
          ['Choose the right duct', 'Use rigid or semi-rigid metal duct. Avoid white vinyl and thin foil accordion duct; they crush and trap lint.'],
          ['Watch the clock', 'If a normal load takes much longer than usual, clean the vent before anything else. Long run times are the first warning sign.'],
          ['Brush clockwise only', 'The brush rods screw together clockwise. Spinning counterclockwise unscrews them and leaves the brush stuck inside the wall.'],
          ['Gas dryers need care', 'Keep the gas line from kinking when you move the dryer. If you smell gas, stop, leave and call the gas company.'],
        ],
        refs: [
          ['Clothes dryer fires in residential buildings, USFA report summary (Fire Engineering)', 'https://www.fireengineering.com/fire-prevention-protection/usfa-releases-new-report-on-clothes-dryer-fires/'],
          ['Overheated clothes dryers can cause fires, publication 5022 (CPSC)', 'https://www.cpsc.gov/s3fs-public/5022.pdf'],
          ['Clothes dryer fire safety fact sheet (NFPA)', 'https://www.energy.gov/sites/default/files/2016/06/f32/NFPA_DryerFactSheet.pdf'],
          ['Dryer vents, IRC Section M1502 (Building Center)', 'https://www.building-center.org/dryer-vents/'],
          ['Dryer vent safety (InterNACHI)', 'https://www.nachi.org/dryer-vent-safety.htm'],
          ['Dryer venting requirements and vent length chart (Whirlpool)', 'https://content.abt.com/documents/52751/WGT3300XWH_venting.pdf'],
        ],
        learn: {
          how: 'A dryer heats air, tumbles it through wet clothes, and pushes the moist air outside. Drying speed depends on airflow. Every bit of restriction slows the moisture removal, raises internal temperature, and leaves lint sitting near a heat source. A thermal fuse or cutoff opens if things get dangerously hot.',
          specs: [['Max duct length (IRC M1502)', '35′, minus 5′ per 90° bend and 2½′ per 45° (or the maker’s longer chart)'], ['Transition duct', '8′ max, not hidden in walls'], ['Duct diameter', '4″ smooth metal'], ['Screws into duct', 'none protruding more than ⅛″'], ['Max back pressure (Whirlpool)', '0.6″ water column'], ['Normal dry cycle', 'about 35–50 min']],
          terms: [['Transition duct', 'Short duct between dryer and wall.'], ['Thermal fuse', 'One-time safety fuse. A blown fuse means no heat, often due to a clog.'], ['Hood', 'Exterior vent cap with a flap.']],
          mistakes: ['Using vinyl or foil accordion duct.', 'Screwing duct joints together.', 'Pushing the dryer back so hard the duct crushes.'],
          tips: ['Run the dryer and feel the outdoor hood. Strong, warm airflow means the run is clear.', 'Clean the full vent run every year.'],
        },
        pro: 'The vent runs over 25 feet, goes through the roof, or you can’t reach the end; the dryer has no heat at all (often a blown thermal fuse from overheating); or you smell gas.',
      },
      {
        id: 'fridge-warm',
        title: 'Fridge not cold enough',
        model: 'fridge',
        level: 1,
        time: '30 min',
        cost: '$0–15',
        summary: 'Dirty condenser coils, a leaky door seal or a bumped dial make a fridge run constantly and still run warm. Check, clean and adjust before calling for service. Food is safe at 40 °F or below.',
        intro: { hi: ['coils', 'gasket'], xray: true, fx: 'run' },
        safety: ['Unplug the fridge before cleaning coils.', 'Don’t bend the coils or poke at the fan blades.', 'If the fridge has been above 40 °F for more than 2 hours, throw out perishable food like meat, milk and leftovers.'],
        causes: [['Dusty condenser coils', 'Heat can’t escape, so cooling drops.'], ['Leaky door gasket', 'Warm air sneaks in all day.'], ['Overpacked vents', 'Food blocking the air vent between freezer and fridge.'], ['Control set wrong', 'Bumped dial.']],
        tools: ['Long refrigerator coil brush', 'Vacuum with crevice tool', 'Flashlight', 'Dollar bill (gasket test)', 'Appliance thermometer', 'Glass of water', 'Towel'],
        steps: [
          { t: 'Check the setting', d: 'Find the temperature control inside the fridge (a dial or a screen) and set the fridge to 37 °F and the freezer to 0 °F. On a dial numbered 1–9, start in the middle. Put an appliance thermometer in a glass of water on the middle shelf and read it after 5–8 hours.', why: 'A glass of water shows the real food temperature, not the quick swings of air when the door opens.', tip: 'Dials are often bumped while loading groceries. If yours is numbered, higher usually means colder, but check the label inside the door.', ok: 'The thermometer in the water reads 34–40 °F, ideally about 37 °F.', v: { cam: [1.2, 2.4, 1.6], at: [0, 1.8, 0.1], hi: ['dial'] } },
          { t: 'Do the dollar-bill test', d: 'Close the door on a dollar bill so it’s half in, half out. Pull it out slowly. Repeat every few inches around all four sides of the door.', why: 'A good seal grips the bill. A leaky gasket lets in humid air, which warms the fridge and builds frost.', tip: 'Where it slides out loose, wipe the gasket with warm soapy water first; sticky food can hold it off the frame. Still loose? A hair dryer on low can soften a kinked gasket so it reshapes.', ok: 'You feel steady drag on the bill all the way around the door.', v: { cam: [2.0, 1.8, 1.8], at: [0, 1.3, 0.2], hi: ['gasket'], rt: { door: [0, -50, 0] } } },
          { t: 'Unplug and remove the kick grille', d: 'Unplug the fridge (or switch off its breaker). Kneel and pull the grille along the bottom front straight off; most just clip on.', why: 'Behind the grille are the condenser coils, where the fridge releases its heat. Some fridges have coils on the back instead.', tip: 'If the grille won’t pull off, look for one or two screws along its bottom edge. Coils on the back? Pull the fridge out carefully and clean them there instead.', ok: 'The grille is off and you can see the coils or a dark space with dust in it.', v: { cam: [1.0, 0.6, 1.6], at: [0, 0.1, 0.1], hi: ['kick'], rt: { door: [0, 0, 0] }, mv: { kick: [0, 0, 0.5] } } },
          { t: 'Brush and vacuum the coils', d: 'Slide a long, thin coil brush gently in between the coils and work dust loose, then vacuum it out with a crevice tool. Clean around the fan, but don’t poke its blades.', why: 'A dust mat insulates the coils so they can’t shed heat, and the compressor runs nonstop.', tip: 'Lay a towel in front first. A trick: blow the dust forward with a hair dryer on cool from one side while the vacuum hose catches it.', ok: 'The coils look metal-colored and the brush comes out with little dust.', v: { cam: [1.2, 0.8, 1.6], at: [0, 0.1, 0], hi: ['coils', 'brush', 'dust'], show: ['brush'], xray: true } },
          { t: 'Refit, plug in and wait', d: 'Snap the grille back on and plug the fridge in. Keep a little space around the air vents inside; don’t pack food against them. Wait 24 hours, then check the thermometer again.', why: 'The fridge needs most of a day to fully recover its temperature. Readings sooner are misleading.', tip: 'If after 24 hours it’s still above 40 °F, put your hand near the freezer vent: no air moving means a fan problem, and frost on the freezer back wall means a defrost problem. Both need service.', ok: 'The thermometer reads 37 °F ± 3 °F after a day.', v: { cam: [2.8, 2.2, 3.4], at: [0, 1.0, 0], hi: ['fan'], mv: { kick: [0, 0, 0] }, hide: ['brush', 'dust'], fx: 'run', xray: true } },
        ],
        tricks: [
          ['Use water, not air', 'A thermometer in a glass of water shows the true food temperature. An air reading jumps every time the door opens.'],
          ['Clean coils on a schedule', 'Clean the coils every 6–12 months, or every 3 months with shedding pets.'],
          ['Don’t block the vents', 'Cold air enters the fridge from the freezer through vents near the top. Keep a few inches clear around them.'],
          ['Let it breathe', 'Leave about 1″ behind and a little space above the fridge so its heat can escape.'],
          ['A full fridge holds cold', 'A reasonably full fridge holds temperature better than an empty one, as long as air can still move.'],
          ['Listen for clues', 'A fridge that runs all the time and still runs warm has a heat or airflow problem. A silent warm fridge needs service.'],
        ],
        refs: [
          ['Appliance thermometers: fridge 40 °F or below, freezer 0 °F (USDA FSIS)', 'https://www.fsis.usda.gov/es/node/3573'],
          ['Why use a thermometer? (NC State Extension)', 'https://robeson.ces.ncsu.edu/news/why-use-a-thermometer'],
          ['How to clean refrigerator coils (Michigan State University)', 'https://mistt.msu.edu/how-to-clean-refrigerator-coils'],
          ['How to clean refrigerator condenser coils and how often (SlashGear)', 'https://www.slashgear.com/2214405/how-to-clean-refrigerator-condenser-coils/'],
        ],
        learn: {
          how: 'A fridge is a heat pump. Refrigerant absorbs heat from inside the cabinet at the evaporator, then the compressor pumps it to the condenser coils where a fan blows it away into the room. If the coils are dusty, heat stays trapped, so the compressor runs longer and the inside warms up.',
          specs: [['Fridge setpoint', '37 °F (3 °C); 40 °F max (USDA)'], ['Freezer setpoint', '0 °F (−18 °C)'], ['Thermometer read time', '5–8 hours in water'], ['Recovery after cleaning', '24 hours'], ['Coil cleaning', 'every 6–12 months, 3 with pets'], ['Wall clearance', '≈ 1″ behind']],
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
        summary: 'Most dishwashers made in the last 15 years have a filter you clean by hand. A clogged one causes gritty dishes, bad smells and standing water. It twists out in seconds.',
        intro: { hi: ['filter'], xray: true },
        safety: ['Turn the dishwasher off and let it cool if it just ran. Watch for broken glass in the filter area.', 'Never run the dishwasher with the filter removed.'],
        causes: [['Clogged filter', 'Food and grease build up in the cylinder and mesh.'], ['Blocked spray arm holes', 'Seeds or grit plug the nozzles.'], ['Clogged drain hose or disposal', 'If water stays after cleaning the filter.']],
        tools: ['Soft brush or old toothbrush', 'Dish soap', 'Towel', 'Toothpick', 'Flashlight'],
        steps: [
          { t: 'Open the door', d: 'Make sure the dishwasher has finished and isn’t running. Open the door all the way down.', why: 'You need full access to the floor of the tub, where the filter sits.', tip: 'Lay a towel on the open door; a little dirty water will drip from the filter.', ok: 'The door lies fully open and the tub is quiet.', v: { cam: [2.2, 1.8, 2.6], at: [0, 0.4, 0.2], hi: ['door'], rt: { door: [90, 0, 0] } } },
          { t: 'Pull out the lower rack', d: 'Roll the bottom rack out and lift it free, or roll it out all the way.', why: 'The filter sits under the lower spray arm in the center or a back corner of the tub floor, so the rack has to be out of the way.', tip: 'Unload first; a full rack is heavy and dishes rattle loose when you lift it.', ok: 'The tub floor and the round filter in it are fully visible.', v: { cam: [2.0, 1.8, 2.4], at: [0, 0.4, 0.4], hi: ['rack'], mv: { rack: [0, 0.1, 1.5] } } },
          { t: 'Twist out the filter', d: 'Grip the round filter cylinder and turn it a quarter-turn counterclockwise, then lift it straight up. Then lift out the flat mesh screen under it.', why: 'The cylinder catches big bits; the fine mesh catches small particles.', tip: 'If it won’t turn, look for arrows on the top that show the unlock direction. Pull out anything big you see in the hole too: glass, seeds, labels.', ok: 'You have both parts in hand and the opening below is clear.', v: { cam: [1.0, 1.4, 1.4], at: [0.2, 0.2, 0.1], hi: ['filter', 'gunk'], rt: { filter: [0, -90, 0] }, mv: { filter: [0, 0.5, 0.4] } } },
          { t: 'Wash both parts', d: 'Rinse both parts under warm running water. Scrub with dish soap and a soft brush or old toothbrush, inside and out, until the mesh looks clear.', why: 'Grease glues food to the mesh. Soap breaks the grease; a wire brush or scouring pad tears the mesh.', tip: 'Hold the mesh up to a light: if you see a cloudy film, soak it in hot soapy water for 10 minutes and brush again.', ok: 'Light shines evenly through the mesh with no grease film.', v: { cam: [1.0, 1.4, 1.4], at: [0.2, 0.5, 0.4], hi: ['filter', 'mesh'], hide: ['gunk'] } },
          { t: 'Clear the spray arm', d: 'Spin the lower spray arm by hand; it should turn freely. Look at its holes and poke out any blocked ones with a toothpick. If it lifts off, rinse it under the tap and shake it out.', why: 'Blocked holes mean dirty dishes in one area of the rack.', tip: 'Don’t use metal tools in the holes; they scratch and widen them. Shake the arm: a rattle means a seed is trapped inside. Rinse until it falls out.', ok: 'The arm spins freely and water runs out of every hole when you rinse it.', v: { cam: [1.6, 1.6, 1.6], at: [0, 0.2, -0.1], hi: ['sprayArm'], fx: 'spin' } },
          { t: 'Lock the filter back in', d: 'Lay the mesh back in place, set the cylinder into its opening and turn it clockwise until it locks with a click or the arrows line up. Slide the rack back in.', why: 'An unlocked filter lets debris reach the pump, where it can jam or damage it.', tip: 'Run the kitchen hot tap until it’s hot before starting the next cycle so the dishwasher fills with hot water.', ok: 'The filter doesn’t lift when you tug it, and the next load comes out clean.', v: { cam: [2.4, 1.8, 2.8], at: [0, 0.5, 0], hi: ['filter'], mv: { filter: [0, 0, 0], rack: [0, 0, 0] }, rt: { filter: [0, 0, 0], door: [0, 0, 0] } } },
        ],
        tricks: [
          ['Scrape, don’t rinse', 'Scrape food into the trash but skip pre-rinsing. Detergent enzymes work best with some food to act on, and the filter catches the rest.'],
          ['Clean it monthly', 'Mark the first of the month on your calendar. A filter that’s cleaned often takes two minutes; one left for a year takes twenty.'],
          ['Hot water first', 'Run the kitchen tap until it’s hot before starting a cycle. The first fill then starts at about 120 °F instead of cold.'],
          ['Check the drain hose loop', 'If water still stands after the filter is clean, check that the drain hose under the sink loops up high and isn’t kinked.'],
          ['Run the disposal first', 'If the dishwasher drains into a garbage disposal, run the disposal before starting. A full disposal blocks the dishwasher drain.'],
          ['Hard water film', 'A white film on dishes and the filter is minerals, not food. A rinse aid and a monthly cleaning cycle with a dishwasher cleaner help.'],
        ],
        refs: [
          ['How to clean the dishwasher filters (Whirlpool)', 'https://producthelp.whirlpool.com/Dishwashers/Product_Info/Dishwasher_Cleaning_and_Care/How_to_Clean_the_Dishwasher_Filters'],
          ['How to clean a dishwasher filter (Bosch)', 'https://www.bosch-home.com/us/experience-bosch/tips-and-tricks/all-articles/how-to-clean-dishwasher-filter'],
          ['Dishwashers key product criteria, 3.2 gal per cycle (ENERGY STAR)', 'https://www.energystar.gov/products/dishwashers/key_product_criteria'],
        ],
        learn: {
          how: 'A dishwasher reuses a small amount of water many times. A pump pushes water up through the spray arms, it falls back down through the filter, and gets pumped again. Because the same water circulates, the filter is what keeps food from getting sprayed back onto clean dishes.',
          specs: [['Water per cycle', 'about 3–4 gal; ENERGY STAR max 3.2'], ['Filter cleaning', 'monthly, or when dishes feel gritty'], ['Filter removal', '¼ turn counterclockwise (Whirlpool)'], ['Ideal water temp', '120 °F at the tap']],
          terms: [['Manual filter', 'User-cleaned filter, standard on quieter modern dishwashers.'], ['Air gap', 'Countertop fitting that prevents dirty water backflow.'], ['High loop', 'Drain hose looped up under the counter for the same reason.']],
          mistakes: ['Pre-rinsing everything (enzymes in detergent need food to work on) but then never cleaning the filter.', 'Using a wire brush or scouring pad on the mesh.', 'Not locking the filter back in.'],
          tips: ['Run the kitchen tap hot before starting so the first fill isn’t cold.'],
        },
        pro: 'Water still won’t drain with a clean filter, the pump hums but nothing moves, or there’s a leak under the door.',
      },
    ],
  });
})();
