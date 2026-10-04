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
        title: 'Build a campfire',
        model: 'campfire',
        level: 1,
        time: '20 min',
        cost: '$0',
        summary: 'A good fire starts small: tinder, then kindling, then fuel, with air able to reach every layer. The log-cabin-around-a-teepee method lights reliably.',
        intro: { hi: ['ring'] },
        safety: ['Check fire restrictions and burn bans before lighting. They change daily in dry seasons.', 'Use an existing fire ring when available, keep 10 feet clear of tents and brush, and never leave a fire unattended.', 'Never use gasoline or lighter fluid to start or revive a fire.'],
        causes: [['Fire won’t catch', 'Wood too big or too wet.'], ['Smothered fire', 'Packed too tight; no airflow.'], ['Too much smoke', 'Damp or green wood.']],
        tools: ['Tinder (dry grass, birch bark, cotton balls with petroleum jelly)', 'Kindling (pencil to thumb thick)', 'Fuel wood (wrist thick and up, dry, local)', 'Lighter or matches', 'Full water bucket & shovel'],
        steps: [
          { t: 'Pick and prep the spot', d: 'Use an existing fire ring. Clear 10 feet of needles, leaves and branches around it, and check nothing hangs overhead.', why: 'Sparks travel; dry litter next to the ring is how campfires turn into wildfires.', v: { cam: [3.0, 3.0, 3.4], at: [0, 0, 0], hi: ['clearing', 'ring'] } },
          { t: 'Stage water first', d: 'Fill a bucket with water and set it beside the ring with a shovel before you light anything.', why: 'If a spark jumps, you have seconds, not minutes, to stop it.', v: { cam: [2.2, 1.6, 2.6], at: [0.6, 0.2, 0.3], hi: ['bucket'] } },
          { t: 'Make a tinder nest', d: 'Place a loose fist-sized bundle of tinder in the center.', why: 'Tinder catches a match flame directly. Fluffy matters: fire needs air in between the fibers.', v: { cam: [1.2, 1.0, 1.4], at: [0, 0.05, 0], hi: ['tinder'], show: ['tinder'] } },
          { t: 'Lean kindling in a teepee', d: 'Lean thin kindling sticks around the tinder in a cone, leaving a gap on the upwind side.', why: 'Flames rise. A cone puts the next fuel right where the heat goes, and the gap lets you reach in and lets air flow.', v: { cam: [1.3, 1.0, 1.5], at: [0, 0.15, 0], hi: ['kindling'], show: ['kindling'] } },
          { t: 'Build a log cabin around it', d: 'Stack 2–3 layers of larger sticks in a square around the teepee.', why: 'The cabin walls catch as the teepee collapses, and the open sides keep air moving.', v: { cam: [1.6, 1.2, 1.8], at: [0, 0.15, 0], hi: ['logs'], show: ['logs'] } },
          { t: 'Light from upwind', d: 'Light the tinder through the gap on the upwind side. Blow gently at the base if it struggles.', why: 'Wind pushes the flame into the kindling instead of away from it.', v: { cam: [1.8, 1.2, 2.0], at: [0, 0.2, 0], hi: ['tinder', 'flames'], show: ['flames'], fx: 'small' } },
          { t: 'Feed it gradually', d: 'Add larger fuel one or two pieces at a time once the kindling is burning well.', why: 'Big wood dumped on a young fire absorbs heat faster than the fire makes it, and smothers it.', v: { cam: [2.2, 1.8, 2.6], at: [0, 0.2, 0], hi: ['flames', 'logs'], fx: 'fire' } },
        ],
        learn: {
          how: 'Fire needs three things, called the fire triangle: heat, fuel and oxygen. Wood doesn’t burn directly. Heat breaks it down into gases (pyrolysis) and those gases burn. Small pieces heat up fast, so you build from tinder to kindling to fuel, each layer bringing the next up to temperature, with gaps for air.',
          specs: [['Clearance', '10 ft'], ['Kindling size', 'pencil → thumb'], ['Fuel size', 'wrist → forearm'], ['Wood ignites', '≈ 570 °F']],
          terms: [['Fire triangle', 'Heat, fuel, oxygen. Remove one and the fire dies.'], ['Tinder', 'Fine dry material that catches a spark or flame.'], ['Pyrolysis', 'Heat breaking wood into burnable gases.'], ['Punk wood', 'Rotten wood; burns poorly.']],
          mistakes: ['Starting with big logs.', 'Packing wood too tight.', 'Hauling firewood from far away (spreads invasive insects). Buy local.'],
          tips: ['Split wood lights better than round logs. The dry inner wood is exposed.', 'Collect three times more kindling than you think you need.'],
        },
        pro: 'There’s a fire ban, high wind, or the fire escapes the ring. Call 911 right away; don’t try to fight a spreading wildfire.',
      },
      {
        id: 'extinguish-fire',
        title: 'Put out a campfire',
        model: 'campfire',
        level: 1,
        time: '15–20 min',
        cost: '$0',
        summary: 'Drown, stir, and feel. Repeat until every ember is cold to the touch. Covering a fire with dirt can hide live coals for hours.',
        intro: { hi: ['flames', 'embers'], show: ['embers', 'flames', 'logs'], fx: 'fire' },
        safety: ['Start 20 minutes before you leave or go to sleep.', 'Stand upwind of the steam and ash when you pour.'],
        causes: [['Buried coals', 'Dirt or sand insulates embers, which can reignite for hours.'], ['Large logs', 'Burn on the inside long after the outside looks out.']],
        tools: ['Buckets of water (2–3)', 'Shovel or stick', 'Bare hand (back of hand to test heat)'],
        steps: [
          { t: 'Let it burn down', d: 'Stop adding wood and let it burn down to ash if you can.', why: 'Ash is far easier to drown completely than whole logs.', v: { cam: [2.2, 1.6, 2.6], at: [0, 0.2, 0], hi: ['flames'], fx: 'small', hide: ['logs'] } },
          { t: 'Drown it', d: 'Pour water over all the embers, not just the red ones, until the hissing stops.', why: 'Hissing is water turning to steam because the coals are still hot.', v: { cam: [2.0, 1.4, 2.4], at: [0.3, 0.3, 0.2], hi: ['water', 'bucket'], show: ['water', 'steam'], hide: ['flames'], mv: { bucket: [-0.5, 0.25, -0.35] }, rt: { bucket: [0, 0, 60] }, fx: 'steam' } },
          { t: 'Stir the ashes', d: 'Stir the wet ash and embers with a shovel, scraping the sticks and any logs.', why: 'Stirring exposes dry, hot pockets underneath that the water didn’t reach.', v: { cam: [1.6, 1.2, 1.8], at: [0, 0.1, 0], hi: ['shovel', 'embers'], show: ['shovel'], hide: ['water'], fx: 'stir' } },
          { t: 'Drown it again', d: 'Pour more water and stir again.', why: 'One pass almost never gets everything.', v: { cam: [2.0, 1.4, 2.4], at: [0.3, 0.3, 0.2], hi: ['water'], show: ['water'], fx: 'steam' } },
          { t: 'Feel for heat', d: 'Hold the back of your hand close to the ashes. If you feel any warmth, repeat. It should be cold enough to touch.', why: 'If it’s too hot to touch, it’s too hot to leave.', v: { cam: [1.2, 1.0, 1.4], at: [0, 0.05, 0], hi: ['ash'], hide: ['water', 'steam', 'embers', 'shovel'], mv: { bucket: [0, 0, 0] }, rt: { bucket: [0, 0, 0] } } },
        ],
        learn: {
          how: 'Water puts fire out mainly by cooling: turning water into steam soaks up a lot of heat. Embers can stay hot enough to reignite under a crust of ash for a day or more. Stirring breaks that crust so water can reach every coal.',
          specs: [['Water needed', '2–3 gal for a small fire'], ['Start putting it out', '20 min before leaving'], ['Buried embers can last', '24+ hr']],
          terms: [['Cold out', 'Fully extinguished and cool to the touch.'], ['Holdover fire', 'Smoldering fire that reignites later.']],
          mistakes: ['Burying the fire with dirt.', 'Only pouring on the glowing spots.', 'Leaving when it “looks out”.'],
          tips: ['No water? Mix dirt or sand with the embers and stir, never just bury, and only as a last resort.'],
        },
        pro: 'Flames escape the ring or ground outside it is smoldering. Leave and call 911.',
      },
      {
        id: 'pitch-tent',
        title: 'Pitch a dome tent',
        model: 'tent',
        level: 1,
        time: '15–20 min',
        cost: '$0',
        summary: 'Pick a flat, high spot, lay the footprint, cross the poles, stake the corners, then fly and guylines. A tight fly is what keeps you dry.',
        intro: { hi: ['footprint'] },
        safety: ['Look up: avoid dead branches overhead ("widowmakers").', 'Don’t camp in dry washes or low spots that flood in rain.', 'Never cook or run a heater inside a tent (carbon monoxide).'],
        causes: [['Wet inside', 'Fly touching the tent body, or footprint sticking out past the tent.'], ['Sagging walls', 'Stakes pulled or guylines loose.']],
        tools: ['Tent, poles, fly', 'Footprint / ground sheet', 'Stakes (plus spares)', 'Rock or mallet'],
        steps: [
          { t: 'Pick and clear the site', d: 'Choose flat, slightly raised ground. Clear rocks, pinecones and sticks.', why: 'One small rock under your back is a long night. High ground drains rain away.', v: { cam: [2.0, 2.4, 2.4], at: [0, 0, 0], hi: ['hazard'] } },
          { t: 'Lay the footprint', d: 'Spread the footprint shiny/coated side up, tucked so no edge sticks out past the tent.', why: 'A footprint that sticks out catches rain and channels it underneath you.', v: { cam: [2.4, 2.6, 2.8], at: [0, 0, 0], hi: ['footprint'], hide: ['hazard'] } },
          { t: 'Spread the body, insert poles', d: 'Lay the tent body on top, door facing away from the wind. Assemble the poles and cross them in an X, ends in the corner grommets.', why: 'Door downwind keeps wind and rain from blowing in when you open it.', v: { cam: [3.0, 2.0, 3.2], at: [0, 0.4, 0], hi: ['poles', 'body'], show: ['body', 'poles'] } },
          { t: 'Clip and stake', d: 'Clip the body to the poles. Stake the corners with stakes angled 45° away from the tent.', why: 'Angled stakes resist the pull of the tent the way a tent peg is designed to.', v: { cam: [2.2, 1.0, 2.4], at: [0.6, 0.1, 0.6], hi: ['stakes'], show: ['stakes'] } },
          { t: 'Add the rainfly and guylines', d: 'Throw the fly over, match its door to the tent door, buckle the corners, and stake out the guylines taut.', why: 'A taut fly keeps a gap from the inner wall so condensation and rain don’t soak through.', v: { cam: [3.0, 2.0, 3.2], at: [0, 0.5, 0], hi: ['fly', 'guys'], show: ['fly', 'guys'] } },
        ],
        learn: {
          how: 'A dome tent is a tension structure. The bent poles push outward, the fabric pulls inward, and stakes pin the shape down. The inner tent breathes so your breath can pass through; the rainfly is waterproof. The air gap between them carries moisture away and stops rain from wicking through.',
          specs: [['Stake angle', '45° away'], ['Fly-to-body gap', '≥ 2″'], ['Distance from fire', '≥ 15 ft']],
          terms: [['Footprint', 'Ground sheet that protects the floor.'], ['Rainfly', 'Waterproof outer layer.'], ['Vestibule', 'Covered space between door and fly.'], ['Guyline', 'Cord that tensions the fly against wind.']],
          mistakes: ['Pitching in a hollow that collects rain.', 'Fly slack and touching the tent.', 'Leaving stakes vertical.'],
          tips: ['Practice pitching once in your yard before the trip.'],
        },
        pro: 'There’s lightning or high wind forecast. Find hard shelter.',
      },
    ],
  });
})();
