/* LWN · Lawn & garden */
(function () {
  /* ---- Model: walk-behind gas mower ---- */
  TB.model('mower', { cam: [2.4, 1.8, 2.6], at: [0, 0.4, 0], hidden: ['newPlug', 'gap', 'gasCan'] }, (K) => {
    K.box(null, [4, 0.04, 4], 'grass', [0, -0.02, 0]);
    const deck = K.part('deck', [0, 0, 0], null, 'Mower deck');
    K.cyl(deck, [0.55, 0.6, 0.22, 36], 'red', [0, 0.25, 0]);
    K.cyl(deck, [0.5, 0.5, 0.04, 36], 'red', [0, 0.37, 0]);
    [[-0.45, 0.45], [0.45, 0.45], [-0.45, -0.45], [0.45, -0.45]].forEach(([x, z]) => {
      K.cyl(deck, [0.11, 0.11, 0.07], 'rubber', [x * 1.15, 0.11, z], [0, 0, 90]);
      K.cyl(deck, [0.05, 0.05, 0.075], 'grey', [x * 1.15, 0.11, z], [0, 0, 90]);
    });
    const eng = K.part('engine', [0, 0.39, 0], null, 'Engine');
    K.cyl(eng, [0.28, 0.3, 0.32], 'dark', [0, 0.16, 0]);
    K.cyl(eng, [0.22, 0.22, 0.06], 'black', [0, 0.35, 0]);
    const tank = K.part('fuelCap', [0.12, 0.6, 0.18], null, 'Fuel cap');
    K.cyl(tank, [0.06, 0.06, 0.05], 'yellow');
    const air = K.part('airFilter', [-0.22, 0.5, 0.22], null, 'Air filter cover');
    K.box(air, [0.2, 0.16, 0.12], 'black');
    const afe = K.part('airElement', [-0.22, 0.5, 0.22], null, 'Foam / paper filter');
    K.box(afe, [0.16, 0.12, 0.08], K.std(0xd9b36a));
    const plug = K.part('plug', [0.3, 0.52, -0.05], null, 'Spark plug');
    K.cyl(plug, [0.03, 0.03, 0.1], 'white', [0.05, 0, 0], [0, 0, 90]);
    K.cyl(plug, [0.025, 0.025, 0.05, 6], 'steel', [-0.02, 0, 0], [0, 0, 90]);
    const boot = K.part('boot', [0.42, 0.52, -0.05], null, 'Plug wire boot');
    K.cyl(boot, [0.035, 0.03, 0.08], 'black', [0, 0, 0], [0, 0, 90]);
    K.tube(boot, [[0.04, 0, 0], [0.12, 0.08, 0.05], [0.1, 0.16, 0.2]], 0.012, 'black');
    const np = K.part('newPlug', [0.75, 0.75, -0.05], null, 'New plug (gapped)');
    K.cyl(np, [0.03, 0.03, 0.1], 'white', [0.05, 0, 0], [0, 0, 90]);
    K.cyl(np, [0.025, 0.025, 0.05, 6], 'chrome', [-0.02, 0, 0], [0, 0, 90]);
    const gap = K.part('gap', [0.65, 0.75, -0.05], null, 'Electrode gap 0.030″');
    K.box(gap, [0.02, 0.004, 0.02], 'yellow');
    const handle = K.part('handle', [0, 0, 0], null, 'Handle & bail');
    K.tube(handle, [[-0.3, 0.38, -0.45], [-0.3, 0.8, -0.85], [-0.3, 1.2, -1.15]], 0.02, 'dark');
    K.tube(handle, [[0.3, 0.38, -0.45], [0.3, 0.8, -0.85], [0.3, 1.2, -1.15]], 0.02, 'dark');
    K.cyl(handle, [0.02, 0.02, 0.6], 'dark', [0, 1.2, -1.15], [0, 0, 90]);
    const bail = K.part('bail', [0, 1.16, -1.1], null, 'Safety bail');
    K.cyl(bail, [0.015, 0.015, 0.56], 'chrome', [0, 0, 0], [0, 0, 90]);
    const pull = K.part('pullCord', [0.25, 0.75, -0.15], null, 'Pull cord');
    K.box(pull, [0.12, 0.04, 0.04], 'black');
    const blade = K.part('blade', [0, 0.17, 0], null, 'Blade');
    K.box(blade, [0.95, 0.012, 0.09], 'steel');
    K.cyl(blade, [0.04, 0.04, 0.03, 6], 'dark');
    const can = K.part('gasCan', [0.9, 0.2, 0.6], null, 'Fresh fuel + stabilizer');
    K.box(can, [0.3, 0.38, 0.2], 'red');
    K.cyl(can, [0.03, 0.03, 0.2], 'yellow', [0.1, 0.25, 0], [0, 0, -40]);
    return {
      tick(t, fx) {
        if (fx === 'spin') K.parts.blade.rotation.y = t * 25;
      },
    };
  });

  /* ---- Model: pop-up sprinkler head in lawn ---- */
  TB.model('sprinkler', { cam: [1.0, 0.8, 1.2], at: [0, -0.1, 0], hidden: ['newHead'] }, (K) => {
    const turf = K.part('turf', [0, 0, 0], null, 'Turf plug');
    K.box(turf, [2.4, 0.06, 2.4], 'grass', [0, 0.0, 0]);
    const soil = K.part('soil', [0, 0, 0], null, 'Soil');
    K.box(soil, [2.4, 0.5, 2.4], K.std(0x7a5b3a, { transparent: true, opacity: 0.35 }), [0, -0.28, 0]);
    const pipe = K.part('pipe', [0, -0.45, 0], null, 'Lateral line');
    K.cyl(pipe, [0.04, 0.04, 2.4], 'pvc', [0, 0, 0], [0, 0, 90]);
    const tee = K.part('riser', [0, -0.3, 0], null, 'Swing pipe / riser');
    K.cyl(tee, [0.03, 0.03, 0.25], 'black');
    const head = K.part('head', [0, -0.08, 0], null, 'Broken head');
    K.cyl(head, [0.07, 0.07, 0.32], 'black');
    K.cyl(head, [0.08, 0.08, 0.02], 'black', [0, 0.16, 0]);
    K.box(head, [0.05, 0.04, 0.03], 'red', [0.06, 0.1, 0], [0, 0, 30]);
    const nh = K.part('newHead', [0, -0.08, 0.6], null, 'New spray head');
    K.cyl(nh, [0.07, 0.07, 0.32], K.std(0x3a3f45));
    K.cyl(nh, [0.08, 0.08, 0.02], 'green', [0, 0.16, 0]);
    const stem = K.part('stem', [0, 0.15, 0], nh, 'Pop-up stem & nozzle');
    K.cyl(stem, [0.03, 0.03, 0.2], 'grey');
    const spray = K.part('spray', [0, 0.38, 0], nh, 'Spray pattern');
    K.cone(spray, [0.9, 0.3, 32], 'water', [0, 0, 0], [180, 0, 0]);
    spray.visible = false;
    const geyser = K.part('geyser', [0, 0.3, 0], null, 'Geyser from broken head');
    K.cyl(geyser, [0.04, 0.09, 0.6], 'water');
    return {
      tick(t, fx) {
        K.parts.geyser.visible = fx === 'geyser';
        if (fx === 'geyser') K.parts.geyser.scale.y = 0.9 + 0.1 * Math.sin(t * 20);
        K.parts.spray.visible = fx === 'spray';
        if (fx === 'spray') K.parts.spray.rotation.y = t * 2;
      },
    };
  });

  TB.category({
    id: 'lawn',
    code: 'LWN',
    name: 'Lawn & Garden',
    domain: 'exterior',
    blurb: 'Mowers and sprinklers',
    repairs: [
      {
        id: 'mower-start',
        title: 'Lawn mower won’t start',
        model: 'mower',
        level: 1,
        time: '30–45 min',
        cost: '$5–25',
        summary: 'A small engine needs fresh fuel, a spark and clean air. Old gas causes most no-starts. A new spark plug and a clean air filter fix most of the rest.',
        intro: { hi: ['fuelCap', 'plug', 'airFilter'] },
        safety: [
          'Pull the spark plug wire off before touching the blade or reaching under the deck. Turning the blade by hand turns the engine, and it can fire.',
          'Work outdoors with the engine cool, away from flames, pilot lights and sparks. Gas vapor is heavier than air and drifts.',
          'Siphon or drain old gas into an approved gas can and take it to a household hazardous waste drop-off. Never pour it on the ground.',
        ],
        causes: [
          ['Stale fuel', 'Gas starts breaking down in about 30 days and leaves gum that clogs the carburetor.'],
          ['Fouled spark plug', 'Carbon or oil on the tip keeps the spark from jumping.'],
          ['Clogged air filter', 'Too little air makes the fuel mix too rich, and the engine floods.'],
          ['Safety bail not held', 'Most mowers won’t start unless the bail (the bar on the handle) is held back.'],
          ['Low oil', 'Some engines have a low-oil switch that stops them starting.'],
        ],
        tools: ['Fresh gas (E10 or less) & fuel stabilizer', 'Spark plug socket (13⁄16″ or ⅝″) + ratchet', 'Replacement spark plug (match the number on the old one)', 'Feeler or wire gap gauge', 'Air filter (or dish soap & oil for a foam one)', 'Siphon pump & approved gas can', 'Inline spark tester (optional, about $10)', 'Rags'],
        steps: [
          {
            t: 'Check the obvious',
            d: 'Pull the dipstick and check the oil is between the marks. Make sure there’s gas in the tank and the fuel valve (if there is one) is open. For a cold engine, set the choke on, or press the primer bulb 3 times. Then hold the bail bar against the handle as you pull.',
            why: 'The safety bail is a dead-man switch: let go and it stops the engine. It’s the easiest thing to forget.',
            tip: 'If you smell strong gas and it still won’t fire, it’s probably flooded. Set the choke off, hold the bail, and pull 5–6 times to clear it, or wait 15 minutes.',
            ok: 'Oil reads between the marks, the tank has gas, and you feel the bail bar touching the handle as you pull.',
            v: { cam: [1.2, 1.8, -2.2], at: [0, 1.0, -1.0], hi: ['bail'] },
          },
          {
            t: 'Replace old gas',
            d: 'If the gas is more than a month old, or you don’t know how old, siphon it into an approved can. Refill with fresh regular gas (no more than 10% ethanol) with stabilizer added at the can.',
            why: 'Ethanol in gas absorbs water and separates, and old gas loses the light parts that ignite easily. Stale fuel is the top cause of no-starts.',
            tip: 'Pour a little of the old gas into a clear jar. If it looks dark, smells sour or has a water layer at the bottom, that was your problem.',
            ok: 'The fresh gas in the tank looks clear and pale, and smells sharp like a gas pump, not like varnish.',
            v: { cam: [1.6, 1.4, 1.8], at: [0.2, 0.6, 0.2], hi: ['fuelCap', 'gasCan'], show: ['gasCan'] },
          },
          {
            t: 'Pull and inspect the plug',
            d: 'Grip the rubber boot (not the wire) and twist it off. Blow dirt away from the plug, then unscrew it counterclockwise with the plug socket. A light tan tip is healthy. Black and sooty, wet with gas or oil, or crusty means replace it.',
            why: 'The spark has to jump a tiny gap. Carbon or oil on the tip lets the electricity leak away instead.',
            tip: 'Not sure if you’re getting spark? Clip an inline spark tester between the boot and the plug and pull the cord. A bright flash means the ignition is fine.',
            ok: 'The plug is out and you can name its condition: tan (fine), sooty, wet or oily.',
            v: { cam: [1.4, 1.0, 0.8], at: [0.4, 0.55, -0.05], hi: ['plug', 'boot'], mv: { boot: [0.25, 0.1, 0], plug: [0.3, 0.18, 0] }, hide: ['gasCan'] },
          },
          {
            t: 'Gap and install the new plug',
            d: 'Slide a gap gauge between the two electrodes. Most mower plugs want 0.028–0.030″ (check your manual); bend the side electrode gently to adjust. Thread the plug in by hand until it seats, then tighten with the socket: about ½ turn for a new plug, or to 15 ft-lb if you have a torque wrench.',
            why: 'Starting by hand prevents cross-threading the soft aluminum engine head, which is an expensive mistake.',
            tip: 'Slip a 6″ piece of rubber hose over the plug’s top and use it as a handle to start the threads. If it won’t spin in easily, back out and try again; never force it.',
            ok: 'The gauge slides through with a light drag, and the plug turned in smoothly by hand before you used the wrench.',
            v: { cam: [1.4, 1.0, 0.8], at: [0.55, 0.65, -0.05], hi: ['newPlug', 'gap'], show: ['newPlug', 'gap'], hide: ['plug'] },
          },
          {
            t: 'Clean or replace the air filter',
            d: 'Unclip or unscrew the filter cover. Paper filter: tap it on a hard surface; if light doesn’t shine through it, replace it. Foam filter: wash in warm soapy water, squeeze dry in a towel, then work in a teaspoon of engine oil and squeeze out the extra. Never oil a paper filter.',
            why: 'A choked filter starves the engine of air, so the fuel mix is too rich and the engine floods or smokes.',
            tip: 'Wipe out the filter housing with a rag before refitting, so the dirt that collected in it doesn’t go straight into the engine.',
            ok: 'Held up to the sun, a paper filter lets light through, or the foam is clean, evenly damp with oil and not dripping.',
            v: { cam: [-0.8, 1.2, 1.4], at: [-0.22, 0.5, 0.22], hi: ['airFilter', 'airElement'], mv: { airFilter: [0, 0.3, 0.2] } },
          },
          {
            t: 'Reconnect and start',
            d: 'Push the boot onto the plug until you feel it click. Close the filter cover, set the choke or prime, and hold the bail. Pull the cord slowly until you feel resistance, then pull fast and smooth. Once it runs, move the choke off.',
            why: 'If it starts and dies, or only runs on choke, the carburetor jets are gummed from old fuel and need cleaning.',
            tip: 'If it starts with a squirt of fuel in the plug hole but dies after a few seconds, fuel isn’t reaching the engine. Try draining the carburetor bowl (the small cup under the carb) by its drain screw or bolt; varnish there is common.',
            ok: 'The engine catches within a few pulls and settles into a steady hum once the choke is off.',
            v: { cam: [2.4, 1.8, 2.6], at: [0, 0.4, 0], hi: ['pullCord'], mv: { airFilter: [0, 0, 0], boot: [0, 0, 0], newPlug: [-0.45, -0.23, 0] }, hide: ['gap'], fx: 'spin' },
          },
        ],
        tricks: [
          ['Stabilize at the pump', 'Add stabilizer to the gas can the day you fill it, not later. Then all your gas stays fresh for months.'],
          ['Run it dry for winter', 'At season’s end, run the engine until it stops, or fill it with stabilized fuel. Empty carbs don’t gum up.'],
          ['Ethanol-free is best', 'If you can buy ethanol-free gas or canned small-engine fuel, the carburetor stays clean for years.'],
          ['Keep the old plug', 'Take the old plug to the store to match the number on it. Wrong plugs can be too long and hit the piston.'],
          ['Tip it the right way', 'When tipping a mower, keep the air filter and carburetor side up. Otherwise oil runs into the filter and it smokes or won’t start.'],
          ['Pull-cord stuck?', 'If the cord won’t pull at all, check for grass jammed around the blade with the plug wire off. A bent blade or crank needs a shop.'],
        ],
        refs: [
          ['5 mower troubleshooting tips (Briggs & Stratton)', 'https://briggsandstratton.com/na/en_us/support/maintenance-how-to/browse/5-mower-troubleshooting-tips.html'],
          ['Engine problem-solving tips (Briggs & Stratton)', 'https://www.briggsandstratton.com/en-gb/support/faqs/engine-problem-solving-tips'],
          ['Changing the spark plug on a Honda lawn mower (Jacks Small Engines)', 'https://www.jackssmallengines.com/diy/changing-the-spark-plug-on-a-honda-lawn-mower'],
          ['How to change a lawn mower spark plug (Ace Hardware)', 'https://www.acehardware.com/tips/maintenance-repair/outdoor-power-equipment/how-to-change-a-lawn-mower-spark-plug/'],
          ['How to set the spark plug gap on your lawn mower (Husqvarna)', 'https://www-static-nw.husqvarna.com/au/support/husqvarna-self-service/how-to-set-the-spark-plug-gap-on-your-lawn-mower-ka-70154/'],
        ],
        learn: {
          how: 'A 4-stroke mower engine repeats four steps: intake (pull in fuel and air), compression (squeeze it), power (the spark plug ignites it and pushes the piston down) and exhaust. The carburetor mixes gas into the incoming air at roughly 14.7 parts air to 1 part fuel by weight. Take away fuel, air or spark and it won’t run. Old fuel leaves varnish that blocks the carburetor’s tiny jets, which is why fresh gas fixes so many no-starts.',
          specs: [['Plug gap (typical)', '0.028–0.030″ (0.7–0.8 mm)'], ['Plug tightening', 'new: hand-tight + ½ turn, or ≈ 15 ft-lb'], ['Air:fuel ratio', '≈ 14.7 : 1'], ['Gas shelf life', '≈ 30 days untreated'], ['Ethanol', 'E10 max'], ['Air filter', 'clean every 25 hr, replace yearly']],
          terms: [['Carburetor', 'Meters fuel into the airflow.'], ['Choke', 'Restricts air for a rich cold start.'], ['Primer bulb', 'Rubber button that squirts fuel into the carb.'], ['Bail', 'Dead-man bar that stops the engine and blade when released.'], ['Gap', 'Distance between the plug’s two electrodes.']],
          mistakes: ['Leaving fuel in the mower over winter.', 'Tipping the mower carburetor-side down.', 'Over-tightening the plug.', 'Oiling a paper air filter.'],
          tips: ['Run the mower dry at the end of the season, or fill it with stabilized fuel.'],
        },
        pro: 'It still won’t start with fresh fuel, a new plug and a clean filter (likely the carburetor), it smokes blue-white, or the pull cord won’t pull (seized engine or bent crankshaft).',
      },
      {
        id: 'mower-blade',
        title: 'Sharpen a mower blade',
        model: 'mower',
        level: 2,
        time: '30–45 min',
        cost: '$0–25',
        summary: 'A dull blade tears grass, leaving brown, ragged tips that lose water and invite disease. Take the blade off, file the cutting edges back to their original angle, balance it, and bolt it back on the right way up.',
        intro: { hi: ['blade'], xray: true },
        safety: [
          'Pull the spark plug wire first, every time. Turning the blade turns the engine.',
          'Tip the mower with the air filter and carburetor side up (some Briggs & Stratton manuals say spark plug side up). Run the tank low first or put plastic wrap under the gas cap.',
          'Wear thick leather gloves and safety glasses. Blade edges cut, and filing throws metal slivers.',
        ],
        causes: [['Normal wear', 'About 20–25 hours of mowing.'], ['Hitting rocks, roots or sprinkler heads', 'Nicks, rolled edges and bends.'], ['Sandy soil', 'Grit wears blades and sails fast.']],
        tools: ['Socket or box wrench (often ⅝″ or 15/16″) + breaker bar', 'Wood block (2×4) to stop the blade turning', 'Bench vise', 'Mill bastard file (10″) or bench grinder', 'Cone blade balancer or a nail in the wall', 'Torque wrench', 'Spray paint or marker', 'Gloves & safety glasses'],
        steps: [
          {
            t: 'Disconnect the spark plug',
            d: 'Grip the rubber boot and twist it off the spark plug. Tuck it away from the plug, or tape it to the handle, so it can’t flop back on.',
            why: 'Turning the blade by hand spins the engine, and a connected plug could fire and start it.',
            tip: 'Make it a habit to put the boot where you can see it. Then you always know the engine is safe.',
            ok: 'The boot is off and tucked at least a few inches from the plug’s metal tip.',
            v: { cam: [1.4, 1.0, 0.8], at: [0.4, 0.55, -0.05], hi: ['boot'], mv: { boot: [0.25, 0.1, 0] } },
          },
          {
            t: 'Tip the mower',
            d: 'Tilt the mower onto its side with the air filter and carburetor facing up, or tip it back on its handle if your manual allows. Brace it so it can’t roll.',
            why: 'Tipped the wrong way, oil runs into the air filter and carburetor, and the engine smokes or won’t start.',
            tip: 'If you do tip it wrong and it smokes afterward, let it run a few minutes; replace the air filter if it’s soaked with oil.',
            ok: 'The air filter is on the high side, the mower is steady, and no gas or oil is dripping.',
            v: { cam: [2.0, 1.4, 2.2], at: [0, 0.4, 0], hi: ['deck'] },
          },
          {
            t: 'Remove the blade',
            d: 'Wedge a 2×4 between the blade and the deck so it can’t turn. Fit the socket on the bolt and turn counterclockwise; a breaker bar helps. Before you lift the blade off, spray-paint a dot on the side facing the ground.',
            why: 'Blades only cut one way up. The mark keeps you from putting it back upside-down, where it won’t cut or lift grass.',
            tip: 'Bolt seized? Spray penetrating oil, wait 10 minutes, and use a longer bar with steady pressure, not jerks. Take a photo of the washers and adapters as they come off.',
            ok: 'The blade is off, painted on its ground side, and you have every washer in a cup.',
            v: { cam: [1.4, 0.5, 1.4], at: [0, 0.17, 0], hi: ['blade'], mv: { blade: [0, -0.1, 0.9] }, xray: true },
          },
          {
            t: 'File the edges',
            d: 'Clamp the blade in a vise. File only the top, angled face of each cutting edge, pushing the file away from you along the original bevel (about 30–40°). Give each end the same number of strokes, and stop when the edge is as sharp as a butter knife, not a razor.',
            why: 'Matching the factory angle keeps the edge strong. A razor edge chips and dulls fast. Filing only the top keeps the cutting edge lowest, where it meets the grass.',
            tip: 'Files cut only on the push stroke; lift on the way back. If a grinder makes the steel turn blue, it got too hot and soft; slow down and dip it in water often.',
            ok: 'Both edges show bright, even metal along the whole cutting length, and nicks are gone or smaller than ⅛″.',
            v: { cam: [1.0, 0.8, 1.6], at: [0, 0.1, 0.9], hi: ['blade'] },
          },
          {
            t: 'Balance and reinstall',
            d: 'Hang the blade on a cone balancer or a nail through its center hole. If one end drops, file a little more off the back of that end. Reinstall it painted side down, toward the grass, with every washer in order. Torque the bolt to your manual’s spec, often 35–60 ft-lb.',
            why: 'An unbalanced blade spinning at about 3,000 rpm shakes the engine and wears out the crankshaft bearing.',
            tip: 'Replace the blade instead if it’s bent, cracked, or the curved back edge (the sail) is worn thin or has a slot. New blades are cheaper than a crankshaft.',
            ok: 'The blade hangs level on the balancer, the paint mark faces the ground, and the torque wrench clicks at the spec.',
            v: { cam: [2.4, 1.8, 2.6], at: [0, 0.4, 0], hi: ['blade'], mv: { blade: [0, 0, 0], boot: [0, 0, 0] }, xray: true, fx: 'spin' },
          },
        ],
        tricks: [
          ['Own two blades', 'Keep a sharp spare. Swap it on in five minutes and sharpen the dull one on a rainy day.'],
          ['Read the cut', 'Look at grass tips two days after mowing. White, shredded tips mean the blade is dull.'],
          ['Use a 6-point socket', 'A 6-point socket grips the bolt flats and won’t round them off the way a 12-point can.'],
          ['Don’t over-sharpen', 'Take off only enough metal to remove the dull edge. Every pass shortens the blade’s life.'],
          ['Mow dry grass', 'Wet grass and sandy soil dull blades fastest. Mow when the lawn is dry.'],
          ['Check the stamp', 'Most blades say "this side down" or "grass side" on them. Trust that over your memory.'],
        ],
        refs: [
          ['Sharpening rotary mower blades (Toro)', 'https://www.toro.com/en/customer-support/commercial-education/service-tips/sharpening-rotary-mower-blades'],
          ['Lawn mower blade sharpening (Family Handyman)', 'https://www.familyhandyman.com/project/lawn-mower-blade-sharpening/'],
          ['How to sharpen lawn mower blades (Lowe’s)', 'https://www.lowes.com/n/how-to/sharpen-lawn-mower-blades'],
          ['How to sharpen lawn mower blades (Home Depot)', 'https://homedepot.com/c/ah/how-to-sharpen-lawn-mower-blades/9ba683603be9fa5395fab904bc45dce'],
        ],
        learn: {
          how: 'A mower blade spins about 3,000 rpm and cuts by impact, like a scythe swung very fast. Safety standards cap tip speed at 19,000 feet per minute, about 215 mph. A sharp edge slices each grass blade cleanly; a dull one rips it, leaving frayed tips that turn brown and lose water. The upturned back edge (the sail) lifts grass for a clean cut and blows clippings out.',
          specs: [['Blade tip speed', '≤ 19,000 ft/min (≈ 215 mph)'], ['Bevel angle', '≈ 30–40° (match the original)'], ['Blade bolt torque', 'often 35–60 ft-lb (check manual)'], ['Sharpen every', '≈ 20–25 hr'], ['Nicks to remove', 'up to ≈ ⅛″; deeper means replace']],
          terms: [['Bevel', 'Angled cutting face.'], ['Sail / lift', 'Upturned trailing edge that lifts grass and blows clippings.'], ['Balance', 'Equal weight on both sides of center.'], ['Mill bastard file', 'Common single-cut metal file with medium teeth.']],
          mistakes: ['Installing the blade upside-down.', 'Grinding so hot the edge turns blue (softens the steel).', 'Filing the bottom face.', 'Skipping balance.'],
          tips: ['Keep a spare blade so you can swap one in and sharpen the other later.'],
        },
        pro: 'The blade is bent or cracked (replace it, never straighten), or the mower still vibrates with a new, balanced blade (bent crankshaft).',
      },
      {
        id: 'sprinkler-head',
        title: 'Broken sprinkler head',
        model: 'sprinkler',
        level: 1,
        time: '20–30 min',
        cost: '$5–15',
        summary: 'A geyser in the lawn or a dry spot usually means a broken pop-up spray head. It unscrews from its riser (the short pipe under it), and a new one swaps in within minutes.',
        intro: { hi: ['head', 'geyser'], fx: 'geyser' },
        safety: [
          'Turn the zone off at the controller before digging.',
          'Spray heads are usually only 6–12″ deep, but call 811 (the free call-before-you-dig line) if you need to dig deeper or wider; cable and gas lines can run shallow.',
        ],
        causes: [['Mower or car damage', 'The top or body gets crushed or snapped.'], ['Stuck pop-up', 'Grit jams the stem so it stays up or down.'], ['Cracked riser', 'Freeze damage or a direct hit breaks the pipe below the head.']],
        tools: ['Flat spade or trowel', 'Replacement head (same type, pop-up height and nozzle pattern)', 'PTFE (Teflon) tape', 'Spare ½″ riser or swing pipe', 'Bucket or rag to keep dirt out', 'Small flat screwdriver (nozzle adjusting)'],
        steps: [
          {
            t: 'Turn the zone off',
            d: 'At the controller, turn the dial to Off (or Rain mode). Run that zone briefly first if you need to see which head is broken, then shut it off.',
            why: 'Digging next to a pressurized head turns the hole into mud and can wash dirt into the pipe.',
            tip: 'Snap a phone photo of the old head’s spray pattern while it runs, and read the nozzle markings (like 15Q = 15 ft, quarter circle). That’s what you’ll match.',
            ok: 'The controller shows Off and no water comes from any head in that zone.',
            v: { cam: [1.6, 1.4, 1.8], at: [0, 0, 0], hi: ['head'] },
          },
          {
            t: 'Dig around the head',
            d: 'Cut a square of sod about 12″ across around the head with a flat spade and lift it out in one piece. Dig down beside the head, scooping dirt away, until you see where it screws onto the riser or fitting below.',
            why: 'Lifting the sod whole means it goes back in like a puzzle piece and the scar disappears in a week.',
            tip: 'Lay the sod and dirt on a tarp or bucket lid. Keeping the soil off the grass makes backfilling clean and fast.',
            ok: 'You can see the head body and the threaded joint underneath with an inch or two of space all around.',
            v: { cam: [1.2, 1.0, 1.4], at: [0, -0.2, 0], hi: ['turf'], mv: { turf: [1.8, 0.05, 0] }, xray: true },
          },
          {
            t: 'Unscrew the old head',
            d: 'Hold the riser or fitting still with one hand and turn the head counterclockwise with the other. If the riser is cracked, unscrew it from the pipe fitting below and replace it too. Cover the open pipe with your thumb or a rag right away.',
            why: 'A single grain of dirt in the line will block the tiny nozzle opening of the new head.',
            tip: 'If the riser snapped off inside the fitting, a riser extractor (a tapered tool) or a wood screw twisted in can back the broken piece out.',
            ok: 'The old head is out and the open riser threads are clean and uncracked.',
            v: { cam: [1.0, 0.8, 1.2], at: [0, -0.2, 0], hi: ['head', 'riser'], mv: { head: [0.5, 0.4, 0] }, rt: { head: [0, 0, -40] } },
          },
          {
            t: 'Flush the line',
            d: 'Turn the zone on for a few seconds with no head attached and let the water push out any dirt, then shut it off.',
            why: 'Flushing clears grit that fell in while the head was off, before it can clog the new nozzle.',
            tip: 'Stand back and point the hole away from you, or put a bucket over it. The first burst is muddy.',
            ok: 'The water coming out runs clear before you shut it off.',
            v: { cam: [1.6, 1.0, 1.6], at: [0, 0, 0], hi: ['riser'], hide: ['head'], fx: 'geyser' },
          },
          {
            t: 'Install and adjust',
            d: 'Wrap the riser’s threads 2–3 times clockwise with PTFE tape. Screw on the new head hand-tight with its top flush with the soil. Backfill and pack the soil, replace the sod, then run the zone and twist the nozzle to aim the spray. Turn the screw on top to trim the distance.',
            why: 'A head sitting above the soil gets hit by the mower again; one set too low gets blocked by grass.',
            tip: 'If it leaks at the threads, unscrew, add one more wrap of tape and retighten by hand; wrenches crack plastic. If it sprays weakly, the nozzle screen may be clogged: unscrew the nozzle and rinse the little filter.',
            ok: 'The head pops up straight, the spray reaches the next head over without hitting the house or sidewalk, and no water bubbles up around it.',
            v: { cam: [1.6, 1.4, 1.8], at: [0, 0, 0.3], hi: ['newHead'], show: ['newHead'], mv: { newHead: [0, 0, -0.6], turf: [0, 0, 0] }, fx: 'spray' },
          },
        ],
        tricks: [
          ['Take the old head shopping', 'Match brand, pop-up height (2″, 4″, 6″) and nozzle pattern exactly so it waters like its neighbors.'],
          ['Upgrade to a swing pipe', 'Replace a rigid riser with flexible swing pipe. When a car or mower hits the head, it bends instead of snapping.'],
          ['Pressure-regulated heads', 'Heads marked PRS or 30 hold a steady 30 psi, which stops misting and evens out the spray on high-pressure lines.'],
          ['Flag before you aerate', 'Mark heads with small flags before aerating or edging. Most broken heads are machine hits.'],
          ['Head-to-head is the rule', 'Each spray should reach the next head. If it doesn’t after the fix, change the nozzle, not the run time.'],
        ],
        refs: [
          ['How to replace a pop-up irrigation spray head (Sprinkler Warehouse)', 'https://school.sprinklerwarehouse.com/sprinkler_rotors/how-to-replace-a-pop-up-irrigation-spray-head/'],
          ['3 simple repairs and upgrades for your pop-up sprinklers (Rain Bird)', 'https://www.rainbird.com/homeowners/blog/3-Simple-Repairs-and-Upgrades-for-Your-Pop-Up-Sprinklers'],
          ['RD1800 spray head with 30 psi regulator (Rain Bird)', 'https://store.rainbird.com/rd06sp30f-6-in-rd1800-series-spray-head-with-sam-check-valve-30-psi-pressure-regulator-flow-shield.html'],
          ['How to replace a pop-up spray head (Irrigation Repair)', 'https://irrigationrepair.com/how_to_replace_pop_up_spray_head.html'],
          ['Irrigation troubleshooting guide (Rain Bird PDF)', 'https://www.rainbird.com/sites/default/files/media/documents/2018-05/IrrigationTroubleshootingGuide.pdf'],
        ],
        learn: {
          how: 'Each irrigation zone is one valve feeding a buried pipe called a lateral line. When the valve opens, water pressure pushes each head’s stem up out of the ground; a spring pulls it back down when the zone shuts off. If one head breaks, the water takes the easy way out through it, so the rest of the zone runs weak.',
          specs: [['Spray head pressure', '≈ 30 psi ideal'], ['Head spacing', 'head-to-head coverage'], ['Common riser thread', '½″'], ['Head top', 'flush with soil'], ['PTFE tape', '2–3 wraps, clockwise']],
          terms: [['Zone', 'Group of heads controlled by one valve.'], ['Pop-up spray', 'Fixed-pattern head with a stem that rises when watering.'], ['Rotor', 'Head with a rotating stream for larger areas.'], ['Swing pipe', 'Flexible riser that absorbs impacts.'], ['Riser', 'The short pipe the head screws onto.']],
          mistakes: ['Mixing rotors and sprays on one zone.', 'Letting dirt fall into the open riser.', 'Tightening plastic threads with a wrench.'],
          tips: ['Mark heads with small flags before aerating or edging.'],
        },
        pro: 'The main line or lateral pipe is broken, a valve won’t shut off, or the system needs winterizing with compressed air.',
      },
    ],
  });
})();
