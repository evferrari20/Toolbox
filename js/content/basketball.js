/* BBL · Basketball court & hoop */
(function () {
  /* ---- Model: in-ground hoop on a concrete court ---- */
  TB.model('hoop', { cam: [3.6, 2.6, 4.2], at: [0, 1.8, 0.4], hidden: ['newNet', 'ladder', 'filler'] }, (K) => {
    const court = K.part('court', [0, 0, 0], null, 'Court slab');
    K.box(court, [5, 0.1, 5], K.std(0x7f9db3, { roughness: 0.95 }), [0, -0.05, 1.5]);
    K.box(court, [1.6, 0.012, 0.04], 'white', [0, 0.006, 2.2]);
    K.box(court, [0.04, 0.012, 1.6], 'white', [-0.8, 0.006, 1.4]);
    K.box(court, [0.04, 0.012, 1.6], 'white', [0.8, 0.006, 1.4]);
    const crack = K.part('crack', [0, 0.008, 2.8], null, 'Surface crack');
    K.box(crack, [1.6, 0.006, 0.025], 'black', [0.2, 0, 0], [0, 12, 0]);
    const filler = K.part('filler', [0, 0.012, 2.8], null, 'Crack filler');
    K.box(filler, [1.62, 0.006, 0.045], K.std(0x8ea6b8), [0.2, 0, 0], [0, 12, 0]);
    const pole = K.part('pole', [0, 0, -0.6], null, 'Pole (in-ground)');
    K.box(pole, [0.12, 2.7, 0.12], 'dark', [0, 1.35, 0]);
    K.cyl(pole, [0.28, 0.28, 0.08], 'concrete', [0, 0.0, 0]);
    // height-adjust arm with crank
    const arm = K.part('arm', [0, 2.6, -0.6], null, 'Height adjust arm');
    K.box(arm, [0.08, 0.08, 0.6], 'dark', [0, 0, 0.3]);
    K.box(arm, [0.08, 0.08, 0.6], 'dark', [0, -0.35, 0.3]);
    const crank = K.part('crank', [0.1, 1.5, -0.6], null, 'Height crank');
    K.box(crank, [0.06, 0.2, 0.1], 'black');
    K.box(crank, [0.04, 0.04, 0.25], 'steel', [0.05, -0.1, 0.12]);
    const bb = K.part('board', [0, 2.75, 0.0], null, 'Backboard');
    K.box(bb, [1.8, 1.05, 0.04], K.std(0xe6f0f7, { transparent: true, opacity: 0.55, roughness: 0.1 }));
    K.box(bb, [1.84, 0.04, 0.05], 'dark', [0, 0.53, 0]);
    K.box(bb, [1.84, 0.04, 0.05], 'dark', [0, -0.53, 0]);
    K.box(bb, [0.6, 0.03, 0.045], 'white', [0, 0.05, 0.01]);
    K.box(bb, [0.03, 0.45, 0.045], 'white', [-0.29, -0.17, 0.01]);
    K.box(bb, [0.03, 0.45, 0.045], 'white', [0.29, -0.17, 0.01]);
    const rim = K.part('rim', [0, 2.3, 0.3], null, 'Rim');
    K.tor(rim, [0.23, 0.012], 'orange', [0, 0, 0], [90, 0, 0]);
    K.box(rim, [0.2, 0.12, 0.08], 'orange', [0, -0.03, -0.24]);
    const bolts = K.part('rimBolts', [0, 2.27, 0.04], null, 'Rim mounting bolts');
    K.rep(4, (i) => K.cyl(bolts, [0.015, 0.015, 0.05, 6], 'chrome', [i < 2 ? -0.06 : 0.06, i % 2 ? 0.04 : -0.04, 0], [90, 0, 0]));
    const hooks = K.part('netHooks', [0, 2.29, 0.3], null, 'Net hooks (12)');
    K.rep(12, (i) => {
      const a = (i / 12) * Math.PI * 2;
      K.box(hooks, [0.012, 0.03, 0.012], 'orange', [Math.cos(a) * 0.23, -0.02, Math.sin(a) * 0.23]);
    });
    const netMat = K.std(0xf2f2f2, { wireframe: true, roughness: 1 });
    const net = K.part('net', [0, 2.07, 0.3], null, 'Old net (torn)');
    K.cyl(net, [0.22, 0.15, 0.42, 12, true], netMat);
    const tear = K.part('tear', [0.18, 0.05, 0.05], net, 'Torn loops');
    K.box(tear, [0.06, 0.1, 0.02], 'red');
    const nn = K.part('newNet', [0, 2.07, 0.3], null, 'New all-weather net');
    K.cyl(nn, [0.23, 0.15, 0.44, 12, true], K.std(0xf5f5f5, { wireframe: true }));
    const lad = K.part('ladder', [0.6, 0, 0.7], null, 'Step ladder');
    K.bar(lad, [-0.2, 0, 0.3], [-0.2, 1.8, 0], 0.025, 'yellow');
    K.bar(lad, [0.2, 0, 0.3], [0.2, 1.8, 0], 0.025, 'yellow');
    K.bar(lad, [-0.2, 0, -0.3], [-0.2, 1.8, 0], 0.025, 'yellow');
    K.bar(lad, [0.2, 0, -0.3], [0.2, 1.8, 0], 0.025, 'yellow');
    K.rep(5, (i) => K.box(lad, [0.4, 0.03, 0.08], 'steel', [0, 0.3 + i * 0.3, 0.25 - i * 0.04]));
    const ball = K.part('ball', [-1.0, 0.12, 1.4], null, 'Ball');
    K.sph(ball, 0.12, 'orange');
    return {
      tick(t, fx) {
        if (fx === 'bounce') K.parts.ball.position.y = 0.12 + Math.abs(Math.sin(t * 3)) * 0.6;
      },
    };
  });

  TB.category({
    id: 'basketball',
    code: 'BBL',
    name: 'Basketball Court',
    domain: 'recreation',
    blurb: 'Nets, rims, hoop height and court cracks',
    repairs: [
      {
        id: 'hoop-net',
        title: 'Replace a basketball net',
        model: 'hoop',
        level: 1,
        time: '20 min',
        cost: '$8–20',
        summary: 'A torn or rotted net hooks onto 12 loops under the rim. Off with the old, then loop the new one on, working around the rim.',
        intro: { hi: ['net', 'tear'] },
        safety: ['Use a stepladder on flat ground, or lower an adjustable hoop to its lowest setting first. Never stand on a chair or the ball return.', 'Watch your fingers on sharp edges of the net hooks.'],
        causes: [['UV rot', 'Nylon breaks down in sun.'], ['Weather', 'Freeze-thaw and wet weather.'], ['Hard play', 'Dunks and hanging.']],
        tools: ['Stepladder', 'Replacement net (12-loop, all-weather nylon)', 'Scissors', 'Flat screwdriver (to open closed hooks)'],
        steps: [
          { t: 'Lower the hoop or set the ladder', d: 'Crank an adjustable hoop down to its lowest setting, or set the ladder on level ground.', why: 'Working at chest height is safer and faster than reaching overhead.', v: { cam: [2.6, 1.8, 2.8], at: [0.3, 1.4, 0], hi: ['crank', 'ladder'], show: ['ladder'] } },
          { t: 'Cut off the old net', d: 'Cut each old loop and pull the scraps off the hooks.', why: 'Old nylon is brittle and rotted; cutting is faster than untangling.', v: { cam: [1.2, 2.4, 1.6], at: [0, 2.15, 0.3], hi: ['net', 'netHooks'], mv: { net: [0.6, -1.0, 0.6] } } },
          { t: 'Hook the first loop', d: 'Push the top loop of the new net through the first hook from the inside out, and loop it back over the hook.', why: 'Looping it back over locks the net so it can’t slip off during play.', v: { cam: [0.9, 2.5, 1.3], at: [0, 2.25, 0.3], hi: ['netHooks', 'newNet'], show: ['newNet'], hide: ['net'] } },
          { t: 'Work around the rim', d: 'Attach each loop in order, around the rim, making sure no loop is skipped or twisted.', why: 'A skipped loop makes the net hang crooked and wear unevenly.', v: { cam: [1.4, 2.0, 1.8], at: [0, 2.1, 0.3], hi: ['newNet'] } },
          { t: 'Raise and shoot', d: 'Return the hoop to 10 feet and take some shots.', why: 'Shooting a few times settles the loops evenly on the hooks.', v: { cam: [3.6, 2.6, 4.2], at: [0, 1.8, 0.4], hi: ['newNet', 'ball'], hide: ['ladder'], fx: 'bounce' } },
        ],
        learn: {
          how: 'The net slows the ball as it passes through so players can see a made shot. It hangs from 12 hooks spaced evenly under the rim, and the hook shape keeps loops from sliding off.',
          specs: [['Regulation rim height', '10 ft'], ['Rim diameter', '18″'], ['Net loops', '12'], ['Net length', '15–18″']],
          terms: [['Net hooks', 'Loops welded under the rim.'], ['Breakaway rim', 'Spring-loaded rim that flexes on dunks.']],
          mistakes: ['Standing on unstable objects.', 'Skipping a loop.'],
          tips: ['All-weather nylon or poly nets last years longer outdoors than cotton.'],
        },
        pro: 'The rim hooks are broken off or the rim is bent.',
      },
      {
        id: 'hoop-rim',
        title: 'Loose rim or wobbly hoop',
        model: 'hoop',
        level: 2,
        time: '30–45 min',
        cost: '$0–25',
        summary: 'A rattling rim or a backboard that shakes after every shot needs its bolts tightened and the height mechanism checked.',
        intro: { hi: ['rimBolts', 'arm'] },
        safety: ['Lower the hoop to its lowest setting before working on it.', 'Never hang on a rim that’s loose.', 'Keep hands clear of the height mechanism’s pinch points.'],
        causes: [['Vibration loosens nuts', 'Every shot shakes the hardware.'], ['Worn height mechanism', 'Pivot bolts wear and rattle.'], ['Loose pole base', 'In-ground anchor bolts or a cracked footing.']],
        tools: ['Socket set & wrenches (often 9/16″ and ¾″)', 'Stepladder', 'Thread locker (blue)', 'Silicone spray (pivots)'],
        steps: [
          { t: 'Lower the hoop', d: 'Use the crank to lower it to the lowest position.', why: 'Lower is safer and puts the mechanism within reach.', v: { cam: [1.6, 1.8, 1.4], at: [0.1, 1.5, -0.6], hi: ['crank'], mv: { board: [0, -0.4, 0], rim: [0, -0.4, 0], rimBolts: [0, -0.4, 0], netHooks: [0, -0.4, 0], net: [0, -0.4, 0], arm: [0, -0.3, 0] } } },
          { t: 'Tighten the rim bolts', d: 'From behind the backboard, tighten the rim mounting nuts evenly. Add blue thread locker if they keep working loose.', why: 'Even tightening keeps the rim level and seated flat against the board.', v: { cam: [0.9, 2.2, -0.9], at: [0, 1.9, 0.0], hi: ['rimBolts', 'rim'], show: ['ladder'] } },
          { t: 'Check the arm pivots', d: 'Tighten the pivot bolts on the height-adjust arms and spray the pivots lightly.', why: 'Worn, dry pivots let the whole backboard rattle and drift.', v: { cam: [1.6, 2.6, 0.8], at: [0, 2.2, -0.3], hi: ['arm'] } },
          { t: 'Check the base', d: 'Look for loose anchor nuts or cracks at the base of the pole.', why: 'A loose base is a safety issue; the whole system could tip.', v: { cam: [1.4, 0.8, 1.2], at: [0, 0.2, -0.6], hi: ['pole'] } },
          { t: 'Raise and test', d: 'Raise to 10 ft and shoot. The rim should feel solid, with only breakaway spring flex.', why: 'Test with real shots; a hand shake doesn’t load it the same way.', v: { cam: [3.6, 2.6, 4.2], at: [0, 1.8, 0.4], hi: ['rim'], mv: { board: [0, 0, 0], rim: [0, 0, 0], rimBolts: [0, 0, 0], netHooks: [0, 0, 0], net: [0, 0, 0], arm: [0, 0, 0] }, hide: ['ladder'], fx: 'bounce' } },
        ],
        learn: {
          how: 'An adjustable hoop hangs the backboard on two parallel arms (a parallelogram linkage) so it stays vertical as it moves up and down. Every shot sends a jolt through the rim bolts and the pivots; over time that vibration backs nuts off.',
          specs: [['Regulation height', '10 ft'], ['Youth heights', '7.5–9 ft']],
          terms: [['Parallelogram arm', 'Linkage keeping the board vertical at any height.'], ['Breakaway rim', 'Spring-loaded rim that flexes on dunks.'], ['Anchor kit', 'J-bolts cast in concrete under in-ground hoops.']],
          mistakes: ['Adjusting height while someone hangs on it.', 'Over-tightening and cracking a polycarbonate board.'],
          tips: ['Check the hardware every spring.'],
        },
        pro: 'The pole leans, the concrete base is cracked, or the backboard glass is cracked.',
      },
      {
        id: 'court-crack',
        title: 'Crack in the court surface',
        model: 'hoop',
        level: 1,
        time: '1–2 hrs',
        cost: '$20–40',
        summary: 'Cracks in a concrete court catch shoes and let water in. Clean and fill them with flexible crack filler, then texture or paint to match.',
        intro: { hi: ['crack'], cam: [1.4, 1.4, 4.4], at: [0.2, 0, 2.8] },
        safety: ['Keep play off the area until fully cured (often 24–72 hrs).'],
        causes: [['Freeze–thaw', 'Water in cracks expands when frozen.'], ['Settlement', 'Soil movement under the slab.'], ['Shrinkage', 'Natural cracking between control joints.']],
        tools: ['Wire brush', 'Leaf blower or shop vac', 'Flexible acrylic or polyurethane crack filler', 'Putty knife or squeegee', 'Court paint (optional)'],
        steps: [
          { t: 'Clean the crack', d: 'Wire-brush, pull weeds, and blow out dust.', why: 'Filler needs clean, dry edges to bond.', v: { cam: [1.4, 1.4, 4.2], at: [0.2, 0, 2.8], hi: ['crack'] } },
          { t: 'Fill the crack', d: 'Squeeze filler into the crack and level it with a putty knife or squeegee.', why: 'A flush fill avoids a ridge that catches shoes or bounces the ball unevenly.', v: { cam: [1.2, 1.2, 3.8], at: [0.2, 0, 2.8], hi: ['filler'], show: ['filler'] } },
          { t: 'Cure and recoat', d: 'Let it cure, then paint lines or court coating over it if desired.', why: 'A coating evens out the look and adds grip.', v: { cam: [3.6, 2.6, 4.2], at: [0, 1.0, 1.4], hi: ['court'], fx: 'bounce' } },
        ],
        learn: {
          how: 'Courts are large slabs that expand in heat and shrink in cold. Cracks relieve that stress. A flexible filler moves with the slab instead of popping out like rigid patch would.',
          specs: [['Cure time', '24–72 hr'], ['Fill', 'flush with surface']],
          terms: [['Acrylic court coating', 'Textured paint used on sport courts.'], ['Control joint', 'Planned crack line.']],
          mistakes: ['Using rigid mortar in moving cracks.', 'Overfilling into a ridge.'],
          tips: ['Fill cracks in spring once nights stay above freezing.'],
        },
        pro: 'Cracks are wider than ½″, the slab is heaving, or you want a full court resurfacing.',
      },
    ],
  });
})();
