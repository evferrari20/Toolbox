/* CMP · Campfire & camping */
(function () {
  /* ---- Model: fire ring with tinder, kindling and logs ---- */
  TB.model('campfire', { cam: [2.2, 1.8, 2.6], at: [0, 0.2, 0], hidden: ['tinder', 'kindling', 'logs', 'flames', 'embers', 'steam', 'shovel', 'water'] }, (K) => {
    K.box(null, [6, 0.04, 6], K.std(0x9a8a6c, { roughness: 1 }), [0, -0.02, 0]);
    const clear = K.part('clearing', [0, 0.002, 0], null, '10 ft cleared zone');
    K.cyl(clear, [1.6, 1.6, 0.004, 48], K.std(0xb6a17e, { roughness: 1 }));
    const ring = K.part('ring', [0, 0, 0], null, 'Fire ring');
    K.rep(14, (i) => {
      const a = (i / 14) * Math.PI * 2;
      K.sph(ring, 0.14, 'stone', [Math.cos(a) * 0.62, 0.08, Math.sin(a) * 0.62], [1.2, 0.8, 1]);
    });
    const ash = K.part('ash', [0, 0.01, 0], null, 'Ash bed');
    K.cyl(ash, [0.5, 0.52, 0.02], K.std(0x8b8580, { roughness: 1 }));
    const tinder = K.part('tinder', [0, 0.06, 0], null, 'Tinder bundle');
    K.sph(tinder, 0.09, K.std(0xd8c48c, { roughness: 1 }), [0, 0, 0], [1, 0.6, 1]);
    const kind = K.part('kindling', [0, 0, 0], null, 'Kindling teepee');
    K.rep(8, (i) => {
      const a = (i / 8) * Math.PI * 2;
      K.bar(kind, [Math.cos(a) * 0.22, 0.02, Math.sin(a) * 0.22], [Math.cos(a) * 0.02, 0.38, Math.sin(a) * 0.02], 0.012, 'woodLight');
    });
    const logs = K.part('logs', [0, 0, 0], null, 'Fuel logs (log cabin)');
    [0, 1, 2].forEach((lvl) => {
      const y = 0.06 + lvl * 0.09;
      const s = 0.3 - lvl * 0.04;
      if (lvl % 2 === 0) {
        K.cyl(logs, [0.045, 0.045, 0.7], 'bark', [0, y, s], [0, 0, 90]);
        K.cyl(logs, [0.045, 0.045, 0.7], 'bark', [0, y, -s], [0, 0, 90]);
      } else {
        K.cyl(logs, [0.045, 0.045, 0.7], 'bark', [s, y, 0], [90, 0, 0]);
        K.cyl(logs, [0.045, 0.045, 0.7], 'bark', [-s, y, 0], [90, 0, 0]);
      }
    });
    const fl = K.part('flames', [0, 0.05, 0], null, 'Flames');
    const cones = [];
    [[0, 0, 0, 0.16, 0.6, 'fire'], [0.08, 0, 0.05, 0.1, 0.4, 'flame'], [-0.07, 0, -0.04, 0.1, 0.45, 'flame'], [0.03, 0, -0.08, 0.08, 0.35, 'fire']].forEach(([x, y, z, r, h, m]) => {
      const c = K.cone(fl, [r, h, 12], m, [x, y + h / 2, z]);
      c.userData.h = h;
      cones.push(c);
    });
    const emb = K.part('embers', [0, 0.03, 0], null, 'Glowing embers');
    K.rep(10, (i) => K.sph(emb, 0.05, i % 2 ? 'ember' : 'char', [Math.cos(i) * 0.25 * ((i % 3) / 3 + 0.4), 0, Math.sin(i) * 0.25 * ((i % 3) / 3 + 0.4)], [1.3, 0.5, 1]));
    const steam = K.part('steam', [0, 0.3, 0], null, 'Steam');
    K.rep(5, (i) => K.sph(steam, 0.12, K.std(0xffffff, { transparent: true, opacity: 0.35 }), [Math.sin(i * 2) * 0.15, i * 0.12, Math.cos(i * 2) * 0.15]));
    const bucket = K.part('bucket', [0.95, 0, 0.6], null, 'Water bucket');
    K.lathe(bucket, [[0, 0], [0.16, 0], [0.19, 0.3], [0.2, 0.3]], 'grey');
    const water = K.part('water', [0, 0.6, 0], bucket, 'Pouring water');
    K.cyl(water, [0.04, 0.08, 0.5], 'water', [-0.3, -0.1, -0.2], [0, 0, 40]);
    const shovel = K.part('shovel', [0.4, 0.3, -0.3], null, 'Shovel');
    K.box(shovel, [0.18, 0.02, 0.24], 'steel', [0, -0.2, 0], [20, 0, 0]);
    K.cyl(shovel, [0.015, 0.015, 0.9], 'woodLight', [0, 0.25, -0.12], [-15, 0, 0]);
    return {
      tick(t, fx) {
        const s = fx === 'small' ? 0.45 : 1;
        cones.forEach((c, i) => {
          const f = s * (0.85 + 0.2 * Math.sin(t * (8 + i * 1.7) + i));
          c.scale.set(s, f, s);
          c.position.y = (c.userData.h * f) / 2;
        });
        if (fx === 'stir') K.parts.shovel.position.x = 0.15 * Math.sin(t * 3);
        if (fx === 'steam') K.parts.steam.position.y = 0.3 + ((t * 0.4) % 0.4);
      },
    };
  });

  /* ---- Model: dome tent ---- */
  TB.model('tent', { cam: [3.0, 2.0, 3.2], at: [0, 0.5, 0], hidden: ['body', 'poles', 'stakes', 'fly', 'guys'] }, (K) => {
    K.box(null, [6, 0.04, 6], 'grass', [0, -0.02, 0]);
    const fp = K.part('footprint', [0, 0.005, 0], null, 'Footprint (ground sheet)');
    K.box(fp, [1.9, 0.01, 1.9], 'navy');
    const body = K.part('body', [0, 0, 0], null, 'Tent body');
    const dome = K.lathe(body, [[0, 0.95], [0.4, 0.88], [0.7, 0.6], [0.88, 0.25], [0.92, 0.02]], K.std(0xe9dfb8, { roughness: 0.9 }));
    dome.scale.set(1, 1, 1);
    K.box(body, [1.85, 0.02, 1.85], 'grey', [0, 0.02, 0]);
    K.box(body, [0.6, 0.6, 0.02], K.std(0xb8ac84), [0, 0.35, 0.84]);
    const poles = K.part('poles', [0, 0, 0], null, 'Crossing poles');
    K.tor(poles, [0.95, 0.015, 180], 'grey', [0, 0, 0], [0, 45, 0]);
    K.tor(poles, [0.95, 0.015, 180], 'grey', [0, 0, 0], [0, -45, 0]);
    const stakes = K.part('stakes', [0, 0, 0], null, 'Stakes at 45°');
    [[0.67, 0.67], [-0.67, 0.67], [0.67, -0.67], [-0.67, -0.67]].forEach(([x, z]) => K.bar(stakes, [x * 1.05, 0, z * 1.05], [x * 1.18, 0.18, z * 1.18], 0.01, 'steel'));
    const fly = K.part('fly', [0, 0, 0], null, 'Rainfly');
    const f = K.lathe(fly, [[0, 1.05], [0.45, 0.98], [0.82, 0.62], [1.05, 0.15], [1.1, 0.1]], K.std(0x6f9fc4, { roughness: 0.7 }));
    f.scale.set(1, 1, 1.05);
    const guys = K.part('guys', [0, 0, 0], null, 'Guylines');
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([x, z]) => K.bar(guys, [x * 0.95, 0.55, z * 0.95], [x * 1.8, 0.02, z * 1.8], 0.005, 'yellow'));
    const rock = K.part('hazard', [0.5, 0.03, -0.3], null, 'Rock & stick (clear these)');
    K.sph(rock, 0.06, 'stone', [0, 0, 0], [1.3, 0.6, 1]);
    K.bar(rock, [-0.4, 0.01, 0.4], [-0.1, 0.01, 0.6], 0.012, 'bark');
    return {};
  });

  TB.category({
    id: 'camping',
    code: 'CMP',
    name: 'Campfire & Camping',
    domain: 'recreation',
    blurb: 'Build a fire, put it out safely, pitch a tent',
    repairs: [
      {
        id: 'build-fire',
        kind: 'build',
        title: 'Build a campfire',
        model: 'campfire',
        level: 1,
        time: '20 min',
        cost: '$0',
        summary: 'A good fire starts small and climbs: a fist of fluffy tinder, a cone of pencil-thin kindling, then wrist-thick fuel, with air reaching every layer. Gather all three piles and stage water before you strike a match.',
        intro: { hi: ['ring'] },
        safety: ['Check fire restrictions before you light. Look at the sign at the campground entrance or call the ranger station; bans change daily in dry, windy weather.', 'Use an existing fire ring. Clear a 10′-wide circle of dry needles and leaves, keep the fire 15′ from tents, shrubs and trees, and never under low branches.', 'Never use gasoline, lighter fluid or stove fuel to start or revive a fire. Fumes flash back at you.', 'Never leave a fire unattended, even for a minute, and keep kids and pets 3′ (one big step) back from the ring.'],
        causes: [['Fire won’t catch', 'Tinder too small or damp, or kindling too thick. Fire climbs one size at a time.'], ['Smothered fire', 'Wood packed too tight, so no air gets in.'], ['Lots of smoke', 'Damp, green (freshly cut) or rotten wood. Dry wood snaps with a crack.'], ['Burns out fast', 'Not enough kindling. Gather three times what you think you need.']],
        tools: ['Tinder, two fistfuls (dry grass, birch bark, dead pine needles, or cotton balls smeared with petroleum jelly)', 'Kindling, an armload (dead sticks pencil-lead to thumb thick)', 'Fuel wood, wrist thick and no bigger (bought locally or dead-and-down where allowed)', 'Lighter or strike-anywhere matches', 'Bucket of water (2–5 gal) and a shovel'],
        steps: [
          { t: 'Check the rules and prep the spot', d: 'Confirm there’s no burn ban (check the sign at the entrance or ask the ranger). Use the existing fire ring. Scrape a 10′-wide circle around it down to bare dirt, and make sure it’s 15′ from tents and bushes with nothing hanging overhead.', why: 'Sparks float. Dry needles next to the ring are how campfires become wildfires.', tip: 'Look straight up before you light. A low branch 8′ above the ring will catch from the heat rising off even a small fire.', ok: 'You see bare dirt all the way around the ring and open sky above it.', v: { cam: [3.0, 3.0, 3.4], at: [0, 0, 0], hi: ['clearing', 'ring'] } },
          { t: 'Stage water and a shovel', d: 'Fill a bucket with water (a 5-gal bucket is ideal) and set it next to the ring with a shovel before you light anything. Also gather all your wood now, in three piles: tinder, kindling and fuel.', why: 'If a spark lands in the grass you have seconds, not minutes. And a fire you have to leave to find more sticks dies, or worse, sits unwatched.', tip: 'No bucket? Fill every water bottle and a cooking pot. If you have to step away for wood, the fire isn’t ready to be lit yet.', ok: 'You can touch the full bucket and the shovel from where you’ll kneel, and all three wood piles are within arm’s reach.', v: { cam: [2.2, 1.6, 2.6], at: [0.6, 0.2, 0.3], hi: ['bucket'] } },
          { t: 'Make a tinder nest', d: 'Place a loose, fist-to-softball-sized bundle of tinder in the center of the ring. Fluff it up so you can see light through it.', why: 'Tinder catches straight from a match. Air pockets between the fibers are what let the flame spread instead of fizzling.', tip: 'Petroleum-jelly cotton balls burn for about 2 minutes each; tuck one in the middle of a natural tinder nest for a sure light on damp days.', ok: 'The nest is airy and springs back when you press it lightly, and it crackles (not bends) when you squeeze a strand.', v: { cam: [1.2, 1.0, 1.4], at: [0, 0.05, 0], hi: ['tinder'], show: ['tinder'] } },
          { t: 'Lean kindling in a teepee', d: 'Lean pencil-thin kindling around the tinder in a cone, tips touching above the nest. Leave a hand-wide gap on the upwind side (the side the breeze comes from) so you can reach the tinder.', why: 'Flames rise. A cone puts the next fuel right where the heat goes, and the gap lets you light it and lets air in.', tip: 'Use only sticks that snap with a sharp crack. If a stick bends instead, it’s green or damp and will smoke; toss it on the fuel pile for later.', ok: 'The cone stands on its own, you can see the tinder through the gaps, and the opening faces the breeze.', v: { cam: [1.3, 1.0, 1.5], at: [0, 0.15, 0], hi: ['kindling'], show: ['kindling'] } },
          { t: 'Build a log cabin around it', d: 'Stack 2–3 layers of thumb- to wrist-thick sticks in a square around the teepee, like a tiny log cabin, with finger-wide gaps between pieces. Keep it no taller than your knee.', why: 'The cabin walls catch as the teepee collapses into them, and the open sides keep air moving through the whole fire.', tip: 'Split wood lights faster than round branches because its dry inside is exposed. Put the split side facing in toward the teepee.', ok: 'You can still see the kindling through the cabin gaps, and nothing wobbles when you nudge a corner.', v: { cam: [1.6, 1.2, 1.8], at: [0, 0.15, 0], hi: ['logs'], show: ['logs'] } },
          { t: 'Light from the upwind side', d: 'Kneel with the breeze at your back, strike the match and cup it in your hand for a second. Hold it under the bottom of the tinder through the gap. If it struggles, blow a long, gentle breath at the base.', why: 'Flame climbs up and wind pushes it forward, so lighting low on the upwind side sends the flame straight into the kindling.', tip: 'If the tinder flares and dies, don’t pile on more sticks. Add a fresh pinch of tinder in the same spot and light again; it usually means the tinder was too small.', ok: 'Within about a minute you hear a steady crackle and see flames licking up into the kindling, not just the tinder.', v: { cam: [1.8, 1.2, 2.0], at: [0, 0.2, 0], hi: ['tinder', 'flames'], show: ['flames'], fx: 'small' } },
          { t: 'Feed it gradually and keep it small', d: 'Once the kindling burns strongly, add one or two fuel pieces at a time, laid across the flames with gaps between them. Keep the fire about knee-high and never leave it alone.', why: 'Big wood dumped on a young fire soaks up heat faster than the fire makes it and smothers it. A small fire also throws fewer sparks.', tip: 'If it starts to smoke and die, open it up: lift a log with a stick to let air under it, or add a handful of kindling. Starting to put it out takes 20 minutes, so stop feeding it well before bed.', ok: 'Flames are steady and mostly clear yellow-orange, smoke is light, and the fire stays inside the ring.', v: { cam: [2.2, 1.8, 2.6], at: [0, 0.2, 0], hi: ['flames', 'logs'], fx: 'fire' } },
        ],
        learn: {
          how: 'Fire needs three things, the fire triangle: heat, fuel and oxygen. Wood doesn’t burn directly. Heat breaks it down into gases (pyrolysis), and those gases are what burn as flame. Thin pieces heat up fast, so you build from tinder to kindling to fuel, each layer bringing the next up to temperature, with gaps for air. Remove any side of the triangle and the fire dies, which is also how you put one out.',
          specs: [['Cleared circle', '10′ wide, down to dirt'], ['Distance to tents, shrubs, trees', '≥ 15′'], ['Tinder bundle', 'fist to softball size'], ['Kindling', 'pencil lead → thumb'], ['Fuel', 'no bigger than your wrist (Leave No Trace)'], ['Fire size', 'about knee-high'], ['Wood ignites', '≈ 570 °F (300 °C)'], ['Water on hand', '2–5 gal plus a shovel']],
          terms: [['Fire triangle', 'Heat, fuel, oxygen. Remove one and the fire dies.'], ['Tinder', 'Fine dry material that catches from a match.'], ['Kindling', 'Small sticks that carry the flame from tinder to fuel.'], ['Pyrolysis', 'Heat breaking wood into burnable gases.'], ['Upwind', 'The side the breeze is coming from.'], ['Punk wood', 'Soft, rotten wood; smokes and burns poorly.'], ['Dead and down', 'Wood already fallen on the ground; never cut live trees.']],
          mistakes: ['Starting with big logs.', 'Packing wood too tight.', 'Lighting before the water and all the wood are staged.', 'Bringing firewood from home. It spreads tree-killing insects; buy it where you burn it.', 'Building a new fire ring when one already exists.'],
          tips: ['Split wood lights better than round logs because the dry inner wood is exposed.', 'Collect three times more kindling than you think you need.', 'Keep tinder in a zip bag in your pocket; body heat keeps it dry.'],
        },
        pro: 'A fire ban is posted, the wind is strong, or the fire escapes the ring. Call 911 right away and give your campsite number; don’t try to fight a spreading wildfire.',
        tricks: [
          ['Buy firewood where you burn it', 'Firewood carries tree-killing insects like the emerald ash borer. Buy it at the campground or within about 10 miles, and it’s usually drier too.'],
          ['Fatwood and feather sticks', 'In wet weather, shave a dry stick into curls left attached at the bottom (a feather stick), or bring a few sticks of resin-rich fatwood. Both light even when the outside world is soaked.'],
          ['Split for the dry heart', 'Wet outside doesn’t mean wet inside. Split a damp log with a hatchet and use the pale inner wood for kindling.'],
          ['Use a ferro rod as backup', 'Matches get wet and lighters fail in the cold. A ferrocerium rod throws 5,000 °F sparks in the rain; scrape it toward the tinder with the back of a knife.'],
          ['Read the smoke', 'White, puffy smoke means damp wood or not enough air. Gray-blue thin smoke means a clean, hot fire. Open gaps or add kindling when it turns white.'],
          ['Stop feeding an hour early', 'Let the fire burn down to ash for the last hour. Ash is far quicker to drown cold than half-burned logs.'],
        ],
        refs: [
          ['How to build your campfire (Smokey Bear, USDA Forest Service)', 'https://smokeybear.com/en/prevention-how-tos/campfire-safety/how-to-build-your-campfire'],
          ['Principle 5: Minimize campfire impacts (Leave No Trace Center)', 'https://lnt.org/why/7-principles/minimize-campfire-impacts/'],
          ['Campfire safety tips (Recreation.gov)', 'https://www.recreation.gov/articles/location-spotlight/campfire-safety-tips/807'],
          ['Campfire safety (USDA Forest Service)', 'https://www.fs.usda.gov/visit/know-before-you-go/campfire-safety'],
          ['Don’t Move Firewood (The Nature Conservancy)', 'https://www.dontmovefirewood.org/'],
        ],
      },
      {
        id: 'extinguish-fire',
        title: 'Put out a campfire',
        model: 'campfire',
        level: 1,
        time: '15–20 min',
        cost: '$0',
        summary: 'Drown, stir, and feel. Repeat until every ember is cold to the touch. Covering a fire with dirt can hide live coals that reignite hours or even days later.',
        intro: { hi: ['flames', 'embers'], show: ['embers', 'flames', 'logs'], fx: 'fire' },
        safety: ['Start 20 minutes before you leave or go to sleep, and never leave until it’s cold out.', 'Pour slowly and stand upwind. Dumping a whole bucket at once throws hot ash and scalding steam.', 'Wear closed shoes. Embers under ash look gray but can still burn through a sandal.', 'If anything outside the ring is smoking, call 911 with your campsite number.'],
        causes: [['Buried coals', 'Dirt or sand insulates embers, which can stay hot for days and reignite when wind uncovers them.'], ['Large logs', 'Burn on the inside long after the outside looks out.'], ['Roots and duff', 'In forest soil, fire can creep underground along dry roots and pop up outside the ring.']],
        tools: ['Buckets of water (2–3, about 5 gal each)', 'Shovel or a sturdy stick', 'Your hand (back of the hand to test for heat)', 'Headlamp (to spot glowing embers after dark)'],
        steps: [
          { t: 'Let it burn down', d: 'Stop adding wood 20–60 minutes before you leave and let it burn down to ash if you can. Spread any big logs apart with the shovel so they cool faster.', why: 'Ash and small coals are far easier to drown completely than whole logs that hold heat in their core.', tip: 'Short on time? Pull large logs out of the fire with the shovel and drown them separately on the ground inside the ring.', ok: 'Only a low bed of glowing coals and ash is left, with no tall flames.', v: { cam: [2.2, 1.6, 2.6], at: [0, 0.2, 0], hi: ['flames'], fx: 'small', hide: ['logs'] } },
          { t: 'Drown it', d: 'Stand upwind and pour water slowly over all the embers, not just the red ones, sweeping the stream back and forth. Keep pouring until the hissing stops.', why: 'Hissing is water flashing to steam because the coals are still hot. Turning water to steam pulls heat out fast; that’s how water puts out fire.', tip: 'Pour from low down with your hand cupped over the bucket lip, or use a cup, to sprinkle rather than splash. It soaks in better and kicks up less ash.', ok: 'You hear no more hissing and see no more steam rising.', v: { cam: [2.0, 1.4, 2.4], at: [0.3, 0.3, 0.2], hi: ['water', 'bucket'], show: ['water', 'steam'], hide: ['flames'], mv: { bucket: [-0.5, 0.25, -0.35] }, rt: { bucket: [0, 0, 60] }, fx: 'steam' } },
          { t: 'Stir the ashes', d: 'Stir the wet ash and embers with the shovel, turning them over to the bottom of the pit. Scrape the burnt ends of sticks and logs so no glowing bits cling to them.', why: 'Stirring breaks the ash crust and exposes dry, hot pockets underneath that the water never reached.', tip: 'Scrape the shovel along the inside of the ring’s rocks and under the edges. Embers love to hide in those gaps.', ok: 'The mix looks like wet, gray mud all the way down, with no dry gray patches.', v: { cam: [1.6, 1.2, 1.8], at: [0, 0.1, 0], hi: ['shovel', 'embers'], show: ['shovel'], hide: ['water'], fx: 'stir' } },
          { t: 'Drown it again', d: 'Pour more water and stir again. Keep going, water then stir, until nothing steams and nothing hisses.', why: 'One pass almost never gets everything; hidden coals re-heat the wet layer above them.', tip: 'After dark, switch off your headlamp and look closely. Any orange glow in the ash means another round.', ok: 'Fresh water pooling on top stays cool and still, with no bubbling or steam.', v: { cam: [2.0, 1.4, 2.4], at: [0.3, 0.3, 0.2], hi: ['water'], show: ['water'], fx: 'steam' } },
          { t: 'Feel for heat', d: 'Hold the back of your hand an inch above the ashes, then carefully touch them, the rocks of the ring and the burnt wood. If anything feels warm, repeat drown and stir.', why: 'If it’s too hot to touch, it’s too hot to leave. The back of your hand is more sensitive to heat and safer if it is still hot.', tip: 'No water? Mix dirt or sand into the embers and stir hard, then feel. Never just bury the fire; buried coals stay hot for days.', ok: 'Everything in and around the ring feels cool to the touch, like the ground beside it.', v: { cam: [1.2, 1.0, 1.4], at: [0, 0.05, 0], hi: ['ash'], hide: ['water', 'steam', 'embers', 'shovel'], mv: { bucket: [0, 0, 0] }, rt: { bucket: [0, 0, 0] } } },
        ],
        learn: {
          how: 'Water puts fire out mostly by cooling: turning water into steam soaks up a lot of heat. Embers can stay hot enough to reignite under a crust of ash for a day or more, insulated like coals in a slow cooker. Stirring breaks that crust so water can reach every coal, and the touch test is the only way to know the heat is truly gone.',
          specs: [['Water needed', '2–3 buckets (about 10–15 gal) for a typical fire'], ['Start putting it out', '≥ 20 min before leaving'], ['Hidden embers can last', '24+ hr (days under dirt)'], ['Done when', 'cold to the touch']],
          terms: [['Cold out', 'Fully extinguished and cool to the touch.'], ['Drown, stir, feel', 'The Forest Service method: water, mix, test by hand.'], ['Holdover fire', 'Smoldering fire that flares up later.'], ['Duff', 'The spongy layer of rotting needles and leaves that can smolder underground.']],
          mistakes: ['Burying the fire with dirt.', 'Only pouring on the glowing spots.', 'Leaving when it “looks out”.', 'Dumping a full bucket at once and blasting hot ash out of the ring.'],
          tips: ['No water? Mix dirt or sand with the embers and stir, never just bury, and only as a last resort.', 'Fill the bucket again before you leave so the next camper has it.'],
        },
        pro: 'Flames escape the ring, or ground outside it is smoking. Move away from it and call 911 with your campsite number or GPS location.',
        tricks: [
          ['Let fire do half the work', 'Plan the last hour so the fire burns down to ash. A bed of ash takes one bucket; a pile of logs can take four.'],
          ['Sprinkle, don’t dump', 'Pour through your fingers or with a cup. A gentle shower soaks in, while a dumped bucket runs off the top and throws hot ash.'],
          ['Use the dark to your advantage', 'After dusk, turn off every light and look. Live embers glow orange even under a thin film of ash.'],
          ['Roll the big logs', 'Turn each log with the shovel and wet all sides, including the bottom, which is usually the hottest.'],
          ['The touch test is the rule', 'Rangers use the same standard: if you can’t hold your hand on it, you can’t walk away from it.'],
          ['Out of water?', 'Use dishwater, the cooler meltwater or a stream with a pot. Dirt is only for mixing and stirring, never for burying.'],
        ],
        refs: [
          ['How to put out your campfire (Smokey Bear, USDA Forest Service)', 'https://smokeybear.com/en/prevention-how-tos/campfire-safety/how-to-put-out-your-campfire'],
          ['Campfire safety (USDA Forest Service)', 'https://www.fs.usda.gov/visit/know-before-you-go/campfire-safety'],
          ['Principle 5: Minimize campfire impacts (Leave No Trace Center)', 'https://lnt.org/why/7-principles/minimize-campfire-impacts/'],
          ['Campfire safety tips (Recreation.gov)', 'https://www.recreation.gov/articles/location-spotlight/campfire-safety-tips/807'],
        ],
      },
      {
        id: 'pitch-tent',
        kind: 'build',
        title: 'Pitch a dome tent',
        model: 'tent',
        level: 1,
        time: '15–20 min',
        cost: '$0',
        summary: 'Pick a flat, slightly raised spot, lay the footprint, cross the poles, stake the corners, then add the fly and guylines. A tight fly that doesn’t touch the inner tent is what keeps you dry.',
        intro: { hi: ['footprint'] },
        safety: ['Look up: never pitch under dead branches or leaning dead trees (“widowmakers”).', 'Don’t camp in dry washes, gullies or low spots; they flood in rain. Camp at least 200′ (about 70 big steps) from lakes and streams.', 'Never cook or run a fuel heater inside a tent or vestibule. Carbon monoxide is invisible and deadly.', 'Keep the tent at least 15′ upwind of the campfire.'],
        causes: [['Wet inside', 'Fly touching the tent body, footprint sticking out past the tent, or vents closed (condensation).'], ['Sagging walls', 'Stakes pulled out or guylines loose.'], ['Tent blew over', 'Not staked before the fly went on, or guylines not used in wind.']],
        tools: ['Tent body, poles and rainfly', 'Footprint or ground sheet (no bigger than the tent floor)', 'Stakes, plus 2–4 spares', 'Rock or small mallet', 'Guylines (usually attached to the fly)'],
        steps: [
          { t: 'Pick and clear the site', d: 'Choose flat, slightly raised ground on a durable surface (an established tent pad, dirt or gravel), 200′ from water. Look up for dead limbs, then clear away rocks, pinecones and sticks.', why: 'One small rock under your back is a long night, and high ground drains rain away instead of pooling it under you.', tip: 'Lie down on the spot before you pitch. You’ll feel a slope or root instantly; put your head on the uphill end.', ok: 'The ground feels smooth when you lie on it, and water would run away from the spot, not toward it.', v: { cam: [2.0, 2.4, 2.4], at: [0, 0, 0], hi: ['hazard'] } },
          { t: 'Lay the footprint', d: 'Spread the footprint where the tent will go, matching its corners to the tent’s corners. Fold or tuck any edge that would stick out past the tent floor.', why: 'A footprint that sticks out catches rain and funnels it right under you.', tip: 'If you’re using a plain tarp, fold it so it’s an inch or two smaller than the floor all around, with the folds tucked underneath.', ok: 'Standing over it, you can’t see any footprint edge beyond where the tent walls will be.', v: { cam: [2.4, 2.6, 2.8], at: [0, 0, 0], hi: ['footprint'], hide: ['hazard'] } },
          { t: 'Spread the body, insert poles', d: 'Lay the tent body on top with the door facing away from the wind. Snap each shock-corded pole together, then cross them in an X and set each pole tip in its corner grommet (metal ring) or pin.', why: 'Door downwind keeps rain from blowing in when you open it. Fully seated pole joints carry the load without splitting.', tip: 'Push pole sections together, don’t let them snap shut on their own; the impact cracks pole ends. If a pole won’t reach its grommet, check that every joint is fully closed.', ok: 'Each pole joint is fully seated with no gap, and the body rises into a dome when the last tip goes in.', v: { cam: [3.0, 2.0, 3.2], at: [0, 0.4, 0], hi: ['poles', 'body'], show: ['body', 'poles'] } },
          { t: 'Clip and stake', d: 'Clip the body to the poles. Stake each corner, pulling the floor snug: drive stakes straight down or tilted with the top leaning away from the tent, hook facing out, until about 1″ shows.', why: 'A stake tilted toward the tent pulls out under load; tilted away, the pull drives it deeper into the ground.', tip: 'Stake two opposite corners first, then the other two, so the floor ends square. Hit rock? Move the stake a few inches or tie the loop around a big rock instead.', ok: 'The floor is flat and wrinkle-free, and a tug on a corner loop doesn’t move the stake.', v: { cam: [2.2, 1.0, 2.4], at: [0.6, 0.1, 0.6], hi: ['stakes'], show: ['stakes'] } },
          { t: 'Add the rainfly and guylines', d: 'Drape the fly over with its door over the tent door. Buckle or hook the corners, tighten the straps, then stake each guyline out in line with its seam and tension it. Open the fly vents.', why: 'A taut fly keeps an air gap from the inner wall so rain and condensation can’t soak through, and guylines keep wind from flattening the poles.', tip: 'Use a taut-line hitch or the plastic slider so you can re-tighten at night; nylon flies stretch when wet and cold, so tighten again before bed.', ok: 'The fly is drum-tight with no wrinkles, and you can slide a hand between fly and tent all the way around.', v: { cam: [3.0, 2.0, 3.2], at: [0, 0.5, 0], hi: ['fly', 'guys'], show: ['fly', 'guys'] } },
        ],
        learn: {
          how: 'A dome tent is a tension structure. The bent poles push outward, the fabric pulls inward, and stakes pin the shape down. The inner tent breathes so moisture from your breath can pass through it; the rainfly is waterproof. The air gap between them carries moisture out the vents and stops rain from wicking through.',
          specs: [['Distance from water', '≥ 200′ (Leave No Trace)'], ['Distance from fire', '≥ 15′ (upwind)'], ['Stake angle', 'straight down to 45°, top leaning away'], ['Stake left showing', '≈ 1″'], ['Fly-to-body gap', 'a hand’s width (2″+)']],
          terms: [['Footprint', 'Ground sheet that protects the floor.'], ['Rainfly', 'Waterproof outer layer.'], ['Vestibule', 'Covered space between the door and the fly.'], ['Guyline', 'Cord that tensions the fly against wind.'], ['Grommet', 'Metal ring at a tent corner that holds the pole tip.'], ['Widowmaker', 'Dead branch or tree that can fall on camp.']],
          mistakes: ['Pitching in a hollow that collects rain.', 'Fly slack and touching the tent.', 'Stakes tilted toward the tent.', 'Closing every vent on a cold night (more condensation, not less).'],
          tips: ['Practice pitching once in your yard before the trip.', 'Shake out and dry the tent fully at home before storing it; packed wet, it mildews in days.'],
        },
        pro: 'Lightning or high wind is forecast. Skip the tent and get to a hard-roofed building or a car.',
        tricks: [
          ['Practice at home', 'Pitch it once in the yard or living room. You’ll find missing stakes and learn which pole goes where in daylight, not in the dark and rain.'],
          ['Stuff, don’t fold', 'Stuff the tent into its sack instead of folding on the same creases; fabric and coatings crack along repeated folds.'],
          ['Rock for a mallet, sock for stakes', 'A fist-size flat rock drives stakes fine. A loop of cord through the stake head lets you yank stubborn stakes out without bending them.'],
          ['Fly first in the rain', 'Many tents can pitch fly-first with the footprint. Get the fly up, then clip the inner tent underneath so it stays dry.'],
          ['Sand and snow anchors', 'In sand or snow, bury a stuff sack filled with sand or a stick sideways (a deadman anchor) and tie the guyline to it.'],
          ['Keep condensation down', 'Open both vents, pitch with the door to the breeze in warm weather, and don’t bring wet gear inside.'],
        ],
        refs: [
          ['How to set up a tent (REI Expert Advice)', 'https://www.rei.com/learn/expert-advice/tent-setup.html'],
          ['Principle 2: Travel and camp on durable surfaces (Leave No Trace Center)', 'https://lnt.org/why/7-principles/travel-camp-on-durable-surfaces/'],
          ['Lightning safety outdoors (National Weather Service)', 'https://www.weather.gov/safety/lightning-outdoors'],
          ['Carbon monoxide poisoning prevention (CDC)', 'https://www.cdc.gov/carbon-monoxide/prevention/index.html'],
        ],
      },
    ],
  });
})();
