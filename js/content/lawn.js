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
        summary: 'Small engines need three things: fresh fuel, a spark, and air. Old gas causes most no-starts. A plug and air filter fix most of the rest.',
        intro: { hi: ['fuelCap', 'plug', 'airFilter'] },
        safety: ['Pull the spark plug wire off before touching the blade or underside. A turning blade can kick the engine over.', 'Work outdoors, with the engine cool, away from flames.'],
        causes: [['Stale fuel', 'Gas breaks down in 30 days and gums up the carburetor.'], ['Fouled spark plug', 'Carbon or oil on the tip.'], ['Clogged air filter', 'Engine floods with too rich a mix.'], ['Safety bail not held', 'Most mowers won’t crank unless the bail is pulled back.']],
        tools: ['Fresh gas & fuel stabilizer', 'Spark plug socket (13/16″ or ⅝″)', 'Replacement spark plug', 'Feeler / gap gauge', 'Air filter (or wash foam type)', 'Siphon pump'],
        steps: [
          { t: 'Check the obvious', d: 'Is the bail held to the handle? Is the fuel valve open and the choke set for a cold start?', why: 'The safety bail kills the engine when released. It’s easy to forget.', v: { cam: [1.2, 1.8, -2.2], at: [0, 1.0, -1.0], hi: ['bail'] } },
          { t: 'Replace old gas', d: 'If the fuel is over a month old, siphon it out and refill with fresh gas mixed with stabilizer.', why: 'Ethanol in gas absorbs water and separates. Old gas loses the light compounds that ignite easily.', v: { cam: [1.6, 1.4, 1.8], at: [0.2, 0.6, 0.2], hi: ['fuelCap', 'gasCan'], show: ['gasCan'] } },
          { t: 'Pull and inspect the plug', d: 'Pull the boot off and unscrew the plug. Black, wet or crusted tip? Replace it.', why: 'The plug’s spark has to jump a tiny gap. Carbon buildup lets it leak away instead.', v: { cam: [1.4, 1.0, 0.8], at: [0.4, 0.55, -0.05], hi: ['plug', 'boot'], mv: { boot: [0.25, 0.1, 0], plug: [0.3, 0.18, 0] }, hide: ['gasCan'] } },
          { t: 'Gap and install the new plug', d: 'Check the gap with a gauge (usually 0.030″). Thread it in by hand, then snug ¼ turn with the socket.', why: 'Starting by hand prevents cross-threading the aluminum head, an expensive mistake.', v: { cam: [1.4, 1.0, 0.8], at: [0.55, 0.65, -0.05], hi: ['newPlug', 'gap'], show: ['newPlug', 'gap'], hide: ['plug'] } },
          { t: 'Clean or replace the air filter', d: 'Open the filter cover. Replace a paper filter; wash a foam one in soapy water, dry it and add a few drops of oil.', why: 'A choked filter makes the fuel mix too rich, and the engine floods.', v: { cam: [-0.8, 1.2, 1.4], at: [-0.22, 0.5, 0.22], hi: ['airFilter', 'airElement'], mv: { airFilter: [0, 0.3, 0.2] } } },
          { t: 'Reconnect and start', d: 'Push the boot back on, close the filter, set choke, hold the bail and pull.', why: 'If it starts and then dies, the carburetor likely needs cleaning from old fuel.', v: { cam: [2.4, 1.8, 2.6], at: [0, 0.4, 0], hi: ['pullCord'], mv: { airFilter: [0, 0, 0], boot: [0, 0, 0], newPlug: [-0.45, -0.23, 0] }, hide: ['gap'], fx: 'spin' } },
        ],
        learn: {
          how: 'A 4-stroke engine runs on a cycle: intake (pull in fuel and air), compression (squeeze it), power (the spark ignites it), and exhaust. The carburetor mixes gas with air in about a 14:1 ratio. Remove any one of fuel, air or spark and it won’t run. Old fuel leaves varnish that blocks the carburetor’s tiny jets.',
          specs: [['Plug gap (typical)', '0.030″'], ['Air:fuel ratio', '≈ 14.7 : 1'], ['Gas shelf life', '≈ 30 days untreated'], ['Plug torque', 'hand-tight + ¼ turn']],
          terms: [['Carburetor', 'Meters fuel into the airflow.'], ['Choke', 'Restricts air for rich cold starts.'], ['Primer bulb', 'Squirts fuel into the carb.'], ['Bail', 'Dead-man lever that stops engine and blade.']],
          mistakes: ['Leaving fuel in the mower over winter.', 'Tipping the mower carb-side down (floods oil into the air filter).', 'Over-tightening the plug.'],
          tips: ['Run the mower dry at the end of the season, or fill it with stabilized fuel.'],
        },
        pro: 'It still won’t start with fresh fuel and a new plug (likely the carburetor), there’s oil smoke, or the pull cord won’t pull (seized engine or bent crankshaft).',
      },
      {
        id: 'mower-blade',
        title: 'Sharpen a mower blade',
        model: 'mower',
        level: 2,
        time: '30 min',
        cost: '$0–20',
        summary: 'A dull blade tears grass, leaving brown, ragged tips that invite disease. Sharpen it once or twice a season.',
        intro: { hi: ['blade'], xray: true },
        safety: ['Pull the spark plug wire first, every time.', 'Tip the mower with the air filter and carburetor side UP to keep oil and gas from leaking.', 'Wear thick gloves; the blade edges cut.'],
        causes: [['Normal wear', 'About 25 hours of mowing.'], ['Hitting rocks or roots', 'Nicks and bends.']],
        tools: ['Socket wrench', 'Wood block (to stop the blade turning)', 'Metal file or bench grinder', 'Blade balancer or a nail on the wall', 'Gloves & safety glasses'],
        steps: [
          { t: 'Disconnect the spark plug', d: 'Pull the boot off the spark plug and tuck it away.', why: 'Turning the blade by hand turns the engine, which could fire if the plug is connected.', v: { cam: [1.4, 1.0, 0.8], at: [0.4, 0.55, -0.05], hi: ['boot'], mv: { boot: [0.25, 0.1, 0] } } },
          { t: 'Tip the mower', d: 'Tilt it on its side with the air filter and carburetor facing up.', why: 'The other way, oil runs into the air filter and the engine smokes or won’t start.', v: { cam: [2.0, 1.4, 2.2], at: [0, 0.4, 0], hi: ['deck'] } },
          { t: 'Remove the blade', d: 'Wedge a wood block against the blade and loosen the bolt counterclockwise. Mark the bottom side with paint.', why: 'Blades only cut one way up. The mark keeps you from installing it upside-down.', v: { cam: [1.4, 0.5, 1.4], at: [0, 0.17, 0], hi: ['blade'], mv: { blade: [0, -0.1, 0.9] }, xray: true } },
          { t: 'File the edges', d: 'File along the original bevel angle (about 30°), the same number of strokes on each end.', why: 'Matching the angle keeps the edge strong. Equal strokes keep it balanced.', v: { cam: [1.0, 0.8, 1.6], at: [0, 0.1, 0.9], hi: ['blade'] } },
          { t: 'Balance and reinstall', d: 'Hang the blade on a nail through the center hole. If one side drops, file more off the heavy side. Reinstall, mark side down, and torque the bolt.', why: 'An unbalanced blade vibrates and wears out the engine crankshaft bearing.', v: { cam: [2.4, 1.8, 2.6], at: [0, 0.4, 0], hi: ['blade'], mv: { blade: [0, 0, 0], boot: [0, 0, 0] }, xray: true, fx: 'spin' } },
        ],
        learn: {
          how: 'A mower blade spins at about 3,000 rpm and cuts by impact. The tips move close to 200 mph. A sharp edge slices each blade of grass cleanly. A dull one rips it, leaving frayed tips that turn brown and lose more water.',
          specs: [['Blade tip speed', '≈ 190 mph'], ['Bevel angle', '≈ 30°'], ['Blade bolt torque', '35–50 ft-lb (check manual)'], ['Sharpen every', '≈ 25 hrs']],
          terms: [['Bevel', 'Angled cutting face.'], ['Sail / lift', 'Upturned trailing edge that lifts grass and blows clippings.'], ['Balance', 'Equal weight on both sides of center.']],
          mistakes: ['Installing the blade upside-down.', 'Grinding so hot the edge turns blue (softens the steel).', 'Skipping balance.'],
          tips: ['Keep a spare blade so you can swap one in and sharpen the other later.'],
        },
        pro: 'The blade is bent or cracked (replace, don’t straighten), or the mower vibrates even with a balanced blade.',
      },
      {
        id: 'sprinkler-head',
        title: 'Broken sprinkler head',
        model: 'sprinkler',
        level: 1,
        time: '20–30 min',
        cost: '$5–15',
        summary: 'A geyser in the lawn or a dry spot usually means a broken spray head. It unscrews from its riser and swaps in minutes.',
        intro: { hi: ['head', 'geyser'], fx: 'geyser' },
        safety: ['Turn the zone off at the controller before digging.', 'Call 811 before digging deeper than the head; utility lines can run shallow.'],
        causes: [['Mower or car damage', 'The top or body gets crushed.'], ['Stuck pop-up', 'Grit jams the stem.'], ['Cracked riser', 'Freeze damage or a direct hit.']],
        tools: ['Small shovel or trowel', 'Replacement head (same type & nozzle)', 'Teflon tape (for threaded risers)', 'Bucket of water (to keep the hole clean)'],
        steps: [
          { t: 'Turn the zone off', d: 'Shut off the zone at the controller.', why: 'Digging next to a pressurized head turns the hole into mud fast.', v: { cam: [1.6, 1.4, 1.8], at: [0, 0, 0], hi: ['head'] } },
          { t: 'Dig around the head', d: 'Cut a 6″ circle of sod and lift it out. Dig down beside the head to the fitting.', why: 'Lift the sod in one piece so it can go back in place.', v: { cam: [1.2, 1.0, 1.4], at: [0, -0.2, 0], hi: ['turf'], mv: { turf: [1.8, 0.05, 0] }, xray: true } },
          { t: 'Unscrew the old head', d: 'Hold the riser steady and unscrew the head counterclockwise. Keep dirt out of the open pipe.', why: 'A grain of dirt in the line will block the new nozzle right away.', v: { cam: [1.0, 0.8, 1.2], at: [0, -0.2, 0], hi: ['head', 'riser'], mv: { head: [0.5, 0.4, 0] }, rt: { head: [0, 0, -40] } } },
          { t: 'Flush the line', d: 'Briefly turn the zone on with no head to blow out debris.', why: 'Flushing clears any grit that fell in while the head was off.', v: { cam: [1.6, 1.0, 1.6], at: [0, 0, 0], hi: ['riser'], hide: ['head'], fx: 'geyser' } },
          { t: 'Install and adjust', d: 'Screw on the new head, set it level with the soil, backfill, replace sod, and run the zone to set the spray arc.', why: 'A head sitting proud of the soil gets hit by the mower again; too low and grass blocks the spray.', v: { cam: [1.6, 1.4, 1.8], at: [0, 0, 0.3], hi: ['newHead'], show: ['newHead'], mv: { newHead: [0, 0, -0.6], turf: [0, 0, 0] }, fx: 'spray' } },
        ],
        learn: {
          how: 'Each irrigation zone is one valve feeding a buried lateral line. Water pressure pushes each head’s stem up out of the ground; a spring pulls it back down when the zone shuts off. If one head breaks, water takes the easy path out of it, and the rest of the zone runs weak.',
          specs: [['Spray head pressure', '30 psi ideal'], ['Head spacing', 'head-to-head coverage'], ['Common riser thread', '½″ FPT']],
          terms: [['Zone', 'Group of heads controlled by one valve.'], ['Pop-up spray', 'Fixed-pattern head with a retracting stem.'], ['Rotor', 'Head with a rotating stream for larger areas.'], ['Swing pipe', 'Flexible riser that absorbs impacts.']],
          mistakes: ['Mixing rotors and sprays on one zone.', 'Letting dirt fall into the open riser.'],
          tips: ['Mark heads with small flags before aerating or edging.'],
        },
        pro: 'The main line is broken, a valve won’t shut off, or the system needs winterizing with compressed air.',
      },
    ],
  });
})();
