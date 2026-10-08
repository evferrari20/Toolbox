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
        summary: 'A torn or sun-rotted net hangs from 12 hooks under the rim. Cut off the old one, then loop the new one onto every hook in order. With the hoop lowered it takes about 15 minutes.',
        intro: { hi: ['net', 'tear'] },
        safety: ['Lower an adjustable hoop to its lowest setting first. Otherwise use a stepladder on flat pavement and never stand on the top two steps, a chair or a car.', 'Never adjust the height while anyone is on the court or hanging on the rim.', 'Wear gloves: old hooks can have sharp, rusty edges.'],
        causes: [['UV rot', 'Sunlight breaks down nylon until it turns chalky and snaps.'], ['Weather', 'Wet-dry and freeze-thaw cycles weaken the cord.'], ['Hard play', 'Dunks and grabbing the net tear loops.'], ['Sharp hooks', 'Rough or bent hooks saw through loops; check them while the net is off.']],
        tools: ['Replacement net (12-loop, all-weather nylon or poly, 15–18″ long)', 'Scissors or snips', 'Flat screwdriver (opens pinched hooks)', 'Stepladder (6′–8′) if the hoop doesn’t lower', 'Work gloves'],
        steps: [
          { t: 'Lower the hoop or set the ladder', d: 'Turn the crank (or pull the lever) to bring the rim to its lowest setting, often 7½′. Fixed hoop? Open a 6′–8′ stepladder fully on flat pavement, both spreaders locked, facing the rim.', why: 'Working at chest height is safer and faster than reaching overhead with your arms up.', tip: 'Count crank turns as you lower it. Then you know exactly how many turns bring it back to 10′ later.', ok: 'The rim is at about shoulder height, or the ladder sits flat with all four feet touching and doesn’t rock when you push it.', v: { cam: [2.6, 1.8, 2.8], at: [0.3, 1.4, 0], hi: ['crank', 'ladder'], show: ['ladder'] } },
          { t: 'Cut off the old net', d: 'Snip each old loop right at the hook and pull the scraps off. Look at every hook as you go: it should be smooth and hooked, not bent flat or broken.', why: 'Sun-rotted nylon is brittle and tangled, so cutting is faster than untangling and won’t bend the hooks.', tip: 'Run a gloved finger over each hook. Sharp burrs chew through new nets; smooth them with a few strokes of a file.', ok: 'All 12 hooks are bare, and none are snapped off.', v: { cam: [1.2, 2.4, 1.6], at: [0, 2.15, 0.3], hi: ['net', 'netHooks'], mv: { net: [0.6, -1.0, 0.6] } } },
          { t: 'Hook the first loop', d: 'Take a top loop of the new net. Push it up through a hook from the inside of the rim, then pull it down over the hook’s tip so it sits in the hook’s curve.', why: 'Looping it back over the tip locks the net so it can’t pop off when the ball snaps through.', tip: 'If a hook is squeezed shut, pry it open a little with a flat screwdriver so the loop slides in without fraying.', ok: 'Tug the loop downward hard; it stays seated in the curve of the hook.', v: { cam: [0.9, 2.5, 1.3], at: [0, 2.25, 0.3], hi: ['netHooks', 'newNet'], show: ['newNet'], hide: ['net'] } },
          { t: 'Work around the rim', d: 'Attach the next loop to the next hook and keep going around in order until all 12 are on. Check that no loop is twisted or skipped.', why: 'A skipped loop makes the net hang crooked, and the ball catches on it.', tip: 'Before hooking, lay the net out and spot each top loop with your fingers so you don’t accidentally grab a lower diamond.', ok: 'Looking up from under the rim, the net hangs evenly, with the same number of diamonds showing on every side.', v: { cam: [1.4, 2.0, 1.8], at: [0, 2.1, 0.3], hi: ['newNet'] } },
          { t: 'Raise and shoot', d: 'Crank the hoop back to 10′ (check with a tape from the pavement to the top of the rim) and take a few shots.', why: 'Shooting settles the loops evenly on the hooks, and measuring confirms you’re back at regulation height.', tip: 'If one side of the net sits lower after a few shots, a loop is on a lower row; lower the hoop and move it.', ok: 'The tape reads 10′ to the top of the rim, and made shots swish through without the ball hanging.', v: { cam: [3.6, 2.6, 4.2], at: [0, 1.8, 0.4], hi: ['newNet', 'ball'], hide: ['ladder'], fx: 'bounce' } },
        ],
        learn: {
          how: 'The net slows the ball as it passes through so players can see a made shot. It hangs from 12 hooks spaced evenly under the rim. Each hook curls down at the tip, so a loop pulled over it can’t slide off under the snap of a made basket.',
          specs: [['Regulation rim height', '10′ to the top of the rim'], ['Rim inside diameter', '18″ (450–459 mm FIBA)'], ['Net loops', '12'], ['Net length', '15–18″ (400–450 mm FIBA)']],
          terms: [['Net hooks', 'Small curled loops welded under the rim.'], ['Breakaway rim', 'Spring-loaded rim that flexes on dunks.'], ['All-weather net', 'UV-stabilized nylon or polyester made for outdoor hoops.']],
          mistakes: ['Standing on unstable objects.', 'Skipping or twisting a loop.', 'Buying a cotton indoor net for an outdoor hoop.', 'Forcing loops through pinched hooks.'],
          tips: ['All-weather nylon or poly nets last years longer outdoors than cotton.', 'Buy two nets; the second costs little and you’ll want it next summer.'],
        },
        pro: 'Net hooks are broken off, the rim is bent, or the rim has no hooks at all (some need a rim swap or clip-on net).',
        tricks: [
          ['Count the crank', 'Count turns while lowering and return the same number. Mark the 10′ setting on the crank housing with paint pen.'],
          ['Pre-stretch the new net', 'Pull the new net hard in your hands for a minute before hanging it. It hangs straighter and stops creeping on the hooks.'],
          ['Heavy-duty is worth it', 'A thicker 150–180 g all-weather net costs a few dollars more and outlasts thin ones by seasons.'],
          ['Closed eyelets? Use a lark’s head', 'If your rim has closed loops instead of hooks, fold the net loop through the eyelet and pass the rest of the net through it, a lark’s head knot.'],
          ['File the burrs', 'A small file on rough hooks saves the new net. Most torn nets start at one sharp hook.'],
          ['Check the rim while you’re up there', 'Grab the rim and rock it. If it clunks, tighten the rim nuts now (see the loose-rim guide).'],
        ],
        refs: [
          ['Rule No. 1: Court dimensions and equipment (NBA Official Rules)', 'https://official.nba.com/rule-no-1-court-dimensions-equipment/'],
          ['Official Basketball Rules and Basketball Equipment (FIBA)', 'https://www.fiba.basketball/en/rules'],
          ['Ladder safety training and tips (American Ladder Institute)', 'https://www.americanladderinstitute.org/'],
        ],
      },
      {
        id: 'hoop-rim',
        title: 'Loose rim or wobbly hoop',
        model: 'hoop',
        level: 2,
        time: '30–45 min',
        cost: '$0–25',
        summary: 'A rattling rim or a backboard that shakes after every shot needs its rim nuts tightened, the height-adjust pivots snugged and lubed, and the pole base checked.',
        intro: { hi: ['rimBolts', 'arm'] },
        safety: ['Lower the hoop to its lowest setting before working on it.', 'Never hang on a rim that’s loose, and keep everyone off the court while you work.', 'Keep hands clear of the height arms’ pinch points; they close like scissors.', 'Snug bolts evenly; overtightening cracks acrylic and polycarbonate backboards.'],
        causes: [['Vibration loosens nuts', 'Every shot shakes the hardware a little.'], ['Worn height mechanism', 'Dry pivot bolts and bushings wear and rattle.'], ['Loose pole base', 'Anchor nuts backed off, or the concrete footing is cracked.'], ['Pole sections slipped', 'On multi-piece poles, the joints work loose.']],
        tools: ['Socket set, ratchet and wrenches (often 9/16″ and ¾″; anchor nuts can be 1⅛″)', 'Stepladder', 'Blue (removable) thread locker', 'Silicone spray (for pivots)', '4′ level', 'Work gloves'],
        steps: [
          { t: 'Lower the hoop', d: 'Turn the crank or pull the lever to bring the board to its lowest position, usually 7½′. Make sure nobody is under it.', why: 'Lower is safer and puts the rim bolts and the height mechanism within reach from a short ladder.', tip: 'If the crank feels gritty or jerky as it turns, note it: the lift screw needs grease and a check later.', ok: 'The board stops at the bottom stop, and the rim is at about shoulder height.', v: { cam: [1.6, 1.8, 1.4], at: [0.1, 1.5, -0.6], hi: ['crank'], mv: { board: [0, -0.4, 0], rim: [0, -0.4, 0], rimBolts: [0, -0.4, 0], netHooks: [0, -0.4, 0], net: [0, -0.4, 0], arm: [0, -0.3, 0] } } },
          { t: 'Tighten the rim bolts', d: 'From behind the backboard, tighten the rim nuts (usually four) a little at a time in a criss-cross pattern until the rim bracket sits flat and the lock washers are squashed flat, then a quarter turn more.', why: 'Even tightening keeps the rim level and seated flat without cracking a plastic or glass board.', tip: 'Nut keeps loosening? Take it off, add a drop of blue thread locker, and retighten. Spinning bolt? Hold the bolt head from the front with a second wrench.', ok: 'Grabbing the rim and shaking it, you feel no clunk at the bracket, only the springy breakaway flex if it has one.', v: { cam: [0.9, 2.2, -0.9], at: [0, 1.9, 0.0], hi: ['rimBolts', 'rim'], show: ['ladder'] } },
          { t: 'Check the arm pivots', d: 'Tighten each pivot bolt on the height-adjust arms until the arm has no side-to-side play but still swings freely. Mist each pivot lightly with silicone spray and cycle the height once.', why: 'Worn, dry pivots let the whole board rattle and drift; too tight and the crank binds.', tip: 'If tightening makes the arm stiff, back the nut off an eighth of a turn. Nyloc nuts (with a plastic ring) can be reused once or twice, then replace them.', ok: 'The board moves smoothly up and down, and pushing the arm sideways shows no wiggle at the pivots.', v: { cam: [1.6, 2.6, 0.8], at: [0, 2.2, -0.3], hi: ['arm'] } },
          { t: 'Check the base and pole', d: 'Look for loose anchor nuts, rust or cracks where the pole meets the ground. Snug the anchor nuts and hold a level on two sides of the pole to check it is plumb (straight up).', why: 'A loose base is the dangerous failure; the whole system could lean or tip.', tip: 'On a pole with leveling nuts under the base plate, plumb the pole with the lower nuts first, then tighten the top nuts.', ok: 'The level’s bubble is centered on two adjacent sides of the pole, and every anchor nut is tight.', v: { cam: [1.4, 0.8, 1.2], at: [0, 0.2, -0.6], hi: ['pole'] } },
          { t: 'Raise and test', d: 'Raise to 10′ (measure to the top of the rim) and shoot. The rim should feel solid, with only the breakaway spring flexing.', why: 'Real shots load the joints the way play does; a hand shake doesn’t.', tip: 'Have a friend shoot while you watch the bolts from the side. Any part that moves separately from the board still needs tightening.', ok: 'Made and missed shots make a clean thud, not a rattle, and the board settles in under a second.', v: { cam: [3.6, 2.6, 4.2], at: [0, 1.8, 0.4], hi: ['rim'], mv: { board: [0, 0, 0], rim: [0, 0, 0], rimBolts: [0, 0, 0], netHooks: [0, 0, 0], net: [0, 0, 0], arm: [0, 0, 0] }, hide: ['ladder'], fx: 'bounce' } },
        ],
        learn: {
          how: 'An adjustable hoop hangs the backboard on two parallel arms (a parallelogram linkage) so it stays vertical as it moves up and down. Every shot sends a jolt through the rim bolts and the pivots; over time that vibration backs nuts off. A breakaway rim has a spring that lets it tip down under a dunk and snap back, so a little flex is normal.',
          specs: [['Regulation height', '10′ to top of rim'], ['Youth heights', '7½–9′'], ['Rim nuts', 'flat lock washer + ¼ turn'], ['Check hardware', 'each spring and fall']],
          terms: [['Parallelogram arm', 'Linkage keeping the board vertical at any height.'], ['Breakaway rim', 'Spring-loaded rim that flexes on dunks.'], ['Anchor kit', 'J-bolts cast in concrete under in-ground hoops.'], ['Plumb', 'Perfectly vertical.'], ['Blue thread locker', 'Glue that stops nuts vibrating loose but still lets you remove them with hand tools.']],
          mistakes: ['Adjusting height while someone hangs on it.', 'Over-tightening and cracking a polycarbonate board.', 'Using red (permanent) thread locker.', 'Tightening the rim with the board at 10′ on a wobbly ladder.'],
          tips: ['Check the hardware every spring.', 'Paint a thin line across each nut and bolt with a paint pen; if the line breaks, that nut moved.'],
        },
        pro: 'The pole leans, the concrete base is cracked or heaving, the glass backboard is cracked, or the welds at the arms are split.',
        tricks: [
          ['Witness marks', 'After tightening, draw a paint-pen line across each nut and its bracket. A glance shows which nut has turned since.'],
          ['Blue, never red', 'Blue thread locker holds against vibration but comes off with a wrench. Red needs heat to remove.'],
          ['Two wrenches beat one', 'Most rim bolts spin when you turn the nut. Hold the head with a second wrench or a socket on an extension.'],
          ['Grease the lift screw', 'Crank-style hoops use a screw jack. A little lithium grease on the threads once a year makes cranking easy and quiet.'],
          ['Ladder at the board, not the rim', 'Set the ladder beside the pole and work from behind the board. Leaning out over the rim is how ladders tip.'],
          ['Rattle hunt', 'Have someone bounce shots off the board while you rest your hand on each part. The part that buzzes against your palm is the loose one.'],
        ],
        refs: [
          ['Basketball hoop installation (Goalrilla)', 'https://www.goalrilla.com/installation'],
          ['Rule No. 1: Court dimensions and equipment (NBA Official Rules)', 'https://official.nba.com/rule-no-1-court-dimensions-equipment/'],
          ['Ladder safety training and tips (American Ladder Institute)', 'https://www.americanladderinstitute.org/'],
        ],
      },
      {
        id: 'court-crack',
        title: 'Crack in the court surface',
        model: 'hoop',
        level: 1,
        time: '1–2 hrs',
        cost: '$20–40',
        summary: 'Cracks in a concrete court catch shoes and let water in to freeze and widen them. Clean them out, pack deep ones with foam backer rod, fill flush with a flexible crack filler, then coat or paint to match.',
        intro: { hi: ['crack'], cam: [1.4, 1.4, 4.4], at: [0.2, 0, 2.8] },
        safety: ['Keep play off the area until the filler is fully cured (often 24–72 hrs; follow the label).', 'Wear safety glasses while wire-brushing and blowing out cracks.', 'Work when it’s dry and between 50 °F and 90 °F, with no rain for 24 hrs.'],
        causes: [['Freeze–thaw', 'Water in cracks expands about 9% when it freezes and pries them wider.'], ['Settlement', 'Soil moving or washing out under the slab.'], ['Shrinkage', 'Concrete shrinks as it cures and cracks between control joints.'], ['Tree roots', 'Roots lift the slab and crack it from below.']],
        tools: ['Wire brush or crack-chaser wheel', 'Leaf blower or shop vac', 'Closed-cell foam backer rod (⅛″ wider than the crack)', 'Flexible court crack filler or self-leveling polyurethane sealant', 'Caulk gun', 'Putty knife or squeegee', 'Safety glasses', 'Court paint or acrylic court coating (optional)'],
        steps: [
          { t: 'Clean the crack', d: 'Wire-brush both edges, pull any weeds and roots, and blow or vacuum out all dust and grit. Let it dry completely if you hosed it.', why: 'Filler needs clean, dry, sound edges to stick to; dust acts like a layer of flour between them.', tip: 'Drag a screwdriver tip along the crack to break loose crumbly edges before you brush. A crack that seemed clean will dump a surprising amount of grit.', ok: 'You can wipe a finger along the crack edge and it comes away clean and dry.', v: { cam: [1.4, 1.4, 4.2], at: [0.2, 0, 2.8], hi: ['crack'] } },
          { t: 'Back and fill the crack', d: 'If the crack is deeper than ½″, press foam backer rod in with a putty knife so its top sits ¼–½″ below the surface. Run the filler in with a caulk gun, then level it flush with a putty knife or squeegee.', why: 'Backer rod saves filler and lets it stretch like a rubber band instead of tearing; a flush fill avoids a ridge that catches shoes.', tip: 'Self-leveling filler sinks as it soaks in. Fill slightly low, wait 20 minutes, then top it off flush rather than overfilling once.', ok: 'Sighting along the surface, the filled crack is level with the concrete, with no hump or dip.', v: { cam: [1.2, 1.2, 3.8], at: [0.2, 0, 2.8], hi: ['filler'], show: ['filler'] } },
          { t: 'Cure and recoat', d: 'Keep feet and balls off it until it’s cured (often 24–72 hrs; check the label). Then paint lines or roll court coating over it if you want it to blend in.', why: 'Walking on soft filler pulls it out of the crack; a coating evens out the look and adds grip.', tip: 'Toss a little clean sand on the wet filler for grip and texture that matches the surrounding concrete.', ok: 'Pressing a fingernail into the filler leaves no dent, and it doesn’t feel tacky.', v: { cam: [3.6, 2.6, 4.2], at: [0, 1.0, 1.4], hi: ['court'], fx: 'bounce' } },
        ],
        learn: {
          how: 'Courts are large slabs that expand in heat and shrink in cold, so cracks open and close with the seasons. A flexible filler stretches and squeezes with the slab instead of popping out like rigid mortar would. Backer rod keeps the filler thin and attached only to the two sides, which is what lets it stretch.',
          specs: [['Cure time', '24–72 hr (check label)'], ['Backer rod depth', 'top ¼–½″ below the surface'], ['Backer rod size', '⅛″ wider than the crack'], ['Apply at', '50–90 °F, dry'], ['Fill', 'flush with the surface']],
          terms: [['Acrylic court coating', 'Textured paint used on sport courts.'], ['Control joint', 'Planned groove where the slab is meant to crack.'], ['Backer rod', 'Squishy foam rope pushed into deep cracks to support filler.'], ['Self-leveling sealant', 'Runny filler that flows flat on its own.']],
          mistakes: ['Using rigid mortar in moving cracks.', 'Overfilling into a ridge.', 'Filling a wet or dusty crack.', 'Skipping backer rod and pouring tube after tube into a deep crack.'],
          tips: ['Fill cracks in spring once nights stay above freezing.', 'Cracks that keep reopening wider each year point to a drainage or soil problem; fix the water first.'],
        },
        pro: 'Cracks are wider than ½″, one side is higher than the other, the slab is heaving, or you want a full court resurfacing.',
        tricks: [
          ['Clean edges are everything', 'Most failed crack repairs peel because of dust. Blow it out twice: once after brushing, again right before filling.'],
          ['Backer rod saves money', 'A $5 roll of backer rod in a deep crack replaces three or four tubes of sealant and makes the repair more flexible.'],
          ['Fill low, then top off', 'Self-leveling products settle. Two shallow passes leave a flatter, longer-lasting surface than one heaping pass.'],
          ['Sand for texture', 'A pinch of clean sand broadcast on the wet filler blends the shine and gives sneakers grip.'],
          ['Watch the weather', 'Pick a dry stretch of at least 24 hours above 50 °F. Rain on fresh filler washes it out.'],
          ['Tape the edges for paint', 'Run painter’s tape along both sides before coating so the patch looks like a neat line, not a smear.'],
        ],
        refs: [
          ['CourtFlex crack sealant data (Sport Master / SportMaster)', 'https://www.sportmaster.net/courtflexcracksealant/'],
          ['Sealing and waterproofing cracks in concrete (QUIKRETE)', 'https://quikrete.com/athome/video-sealing-waterproofing-cracks-in-concrete.asp'],
          ['How to repair concrete cracks with caulk (Family Handyman)', 'https://www.familyhandyman.com/project/how-to-repair-concrete-cracks/'],
        ],
      },
    ],
  });
})();
