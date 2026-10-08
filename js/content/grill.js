/* GRL · Grill & outdoor cooking */
(function () {
  /* ---- Model: two-burner gas grill with propane tank ---- */
  TB.model('grill', { cam: [2.6, 2.0, 2.8], at: [0, 0.9, 0], hidden: ['flames', 'brush', 'soap'] }, (K) => {
    K.box(null, [5, 0.04, 4], 'stone', [0, -0.02, 0]);
    const cart = K.part('cart', [0, 0, 0], null, 'Cart');
    K.box(cart, [1.2, 0.04, 0.6], 'dark', [0, 0.25, 0]);
    [[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]].forEach(([x, z]) => K.box(cart, [0.04, 0.85, 0.04], 'dark', [x, 0.43, z]));
    K.box(cart, [0.5, 0.03, 0.5], 'steel', [0.95, 0.85, 0]);
    const fb = K.part('firebox', [0, 0.95, 0], null, 'Firebox');
    K.box(fb, [1.2, 0.3, 0.6], 'black');
    const burners = K.part('burners', [0, 1.02, 0], null, 'Burner tubes');
    K.cyl(burners, [0.025, 0.025, 0.5], 'steel', [-0.25, 0, 0], [90, 0, 0]);
    K.cyl(burners, [0.025, 0.025, 0.5], 'steel', [0.25, 0, 0], [90, 0, 0]);
    const flames = K.part('flames', [0, 1.05, 0], null, 'Blue burner flames');
    const fls = [];
    [-0.25, 0.25].forEach((x) => K.rep(6, (i) => fls.push(K.cone(flames, [0.02, 0.06, 8], K.std(0x4f8dff, { emissive: 0x2a6aff, emissiveIntensity: 1.3, transparent: true, opacity: 0.85 }), [x, 0.03, -0.2 + i * 0.08]))));
    const grates = K.part('grates', [0, 1.12, 0], null, 'Cooking grates');
    K.rep(12, (i) => K.box(grates, [0.02, 0.02, 0.56], K.std(0x3a3532), [-0.55 + i * 0.1, 0, 0]));
    const grime = K.part('grime', [0, 1.135, 0], null, 'Baked-on grease');
    K.rep(6, (i) => K.box(grime, [0.12, 0.01, 0.08], K.std(0x2a1d14), [-0.45 + i * 0.18, 0, (i % 3) * 0.12 - 0.12]));
    const lid = K.part('lid', [0, 1.1, -0.3], null, 'Lid');
    const L = K.group(lid, [0, 0, 0]);
    K.box(L, [1.22, 0.1, 0.62], 'black', [0, 0.05, 0.3]);
    K.cyl(L, [0.31, 0.31, 1.22, 24], 'black', [0, 0.1, 0.3], [0, 0, 90]).scale.set(0.5, 1, 1);
    K.box(L, [0.8, 0.04, 0.04], 'chrome', [0, 0.18, 0.62]);
    const panel = K.part('panel', [0, 0.85, 0.32], null, 'Control panel');
    K.box(panel, [1.2, 0.16, 0.04], 'steel');
    const knobs = K.part('knobs', [0, 0.85, 0.36], null, 'Burner knobs');
    [-0.25, 0.25].forEach((x) => K.cyl(knobs, [0.05, 0.05, 0.05], 'black', [x, 0, 0], [90, 0, 0]));
    const ign = K.part('igniter', [0.45, 0.85, 0.35], null, 'Igniter button');
    K.cyl(ign, [0.03, 0.03, 0.04], 'red', [0, 0, 0], [90, 0, 0]);
    const tank = K.part('tank', [-0.25, 0.27, 0], null, 'Propane tank');
    K.cyl(tank, [0.17, 0.17, 0.45], 'white', [0, 0.25, 0]);
    K.sph(tank, 0.17, 'white', [0, 0.48, 0], [1, 0.4, 1]);
    K.tor(tank, [0.09, 0.015], 'white', [0, 0.62, 0], [90, 0, 0]);
    const valve = K.part('valve', [-0.25, 0.92, 0], null, 'Tank valve');
    K.cyl(valve, [0.04, 0.04, 0.05], 'brass');
    K.cyl(valve, [0.06, 0.06, 0.015], 'black', [0, 0.04, 0]);
    const reg = K.part('regulator', [0, 0, 0], null, 'Regulator & hose');
    K.cyl(reg, [0.05, 0.05, 0.05], 'chrome', [-0.15, 0.92, 0.0], [0, 0, 90]);
    K.tube(reg, [[-0.12, 0.92, 0], [0, 0.9, 0.05], [0.3, 0.8, 0.0], [0.3, 0.95, -0.1]], 0.012, 'black');
    const brush = K.part('brush', [0.1, 1.25, 0.1], null, 'Grill brush / scraper');
    K.box(brush, [0.2, 0.04, 0.08], 'steel');
    K.box(brush, [0.04, 0.03, 0.4], 'woodLight', [0, 0.02, 0.25], [15, 0, 0]);
    const soap = K.part('soap', [-0.1, 0.92, 0.25], null, 'Soapy water (leak test)');
    K.rep(5, (i) => K.sph(soap, 0.02 + (i % 2) * 0.01, K.std(0xffffff, { transparent: true, opacity: 0.5 }), [-0.05 + i * 0.03, 0.02, 0]));
    return {
      tick(t, fx) {
        fls.forEach((c, i) => c.scale.set(1, 0.8 + 0.3 * Math.sin(t * 15 + i), 1));
        if (fx === 'scrub') K.parts.brush.position.x = 0.4 * Math.sin(t * 4);
      },
    };
  });

  TB.category({
    id: 'grill',
    code: 'GRL',
    name: 'Grill & Outdoor Cooking',
    domain: 'recreation',
    blurb: 'Gas grill won’t light, low flame, dirty grates',
    repairs: [
      {
        id: 'grill-light',
        title: 'Gas grill won’t light or flame is low',
        model: 'grill',
        level: 1,
        time: '15–30 min',
        cost: '$0–40',
        summary: 'Low, yellow or no flame usually means the regulator’s safety device has tripped. A proper reset (everything off, disconnect, bleed, reconnect, open the tank slowly) fixes it. Then check the igniter and the burner tubes.',
        intro: { hi: ['regulator', 'igniter'] },
        safety: ['Smell gas? Close the tank valve, open the lid, step away and don’t light anything until the smell is gone. If it doesn’t go away, call the fire department from a distance.', 'Always open the lid before lighting. Gas pooled under a closed lid can explode into a fireball.', 'If a burner doesn’t light within 5 seconds, turn it off and wait 5 minutes for the gas to clear before trying again.', 'Leak-test connections with soapy water, never a flame. Keep the tank upright, outdoors, never in a garage or house.'],
        causes: [['Tripped regulator', 'Opening the tank valve fast, or with a burner already on, triggers the excess-flow safety, which lets only a trickle of gas through.'], ['Empty tank', 'Weigh it: a 20 lb tank is about 17 lb empty (the TW number on the collar) and about 37 lb full.'], ['Dead igniter battery or dirty electrode', 'Clicks but no spark, or spark at the wrong place.'], ['Spider webs in burner tubes', 'Yellow, lazy or uneven flames, sometimes flame at the knobs.'], ['Expired tank', 'Refill stations won’t fill a tank more than 12 years past its stamped date.']],
        tools: ['Fresh AA/AAA battery (for the igniter button)', 'Long lighter or match holder', 'Soapy water (1 part dish soap to 3 parts water) and a small brush', 'Venturi brush or long pipe cleaner', 'Bathroom or luggage scale (to weigh the tank)'],
        steps: [
          { t: 'Open the lid', d: 'Lift the lid all the way open and leave it open for every step that follows.', why: 'Any gas that leaked in drifts away instead of collecting under the lid where a spark can ignite it.', tip: 'Wait a full minute with the lid open if you smell any gas at all before you go further.', ok: 'The lid stays up on its own and you can see the grates and burners.', v: { cam: [2.4, 2.4, 2.4], at: [0, 1.1, 0], hi: ['lid'], rt: { lid: [-95, 0, 0] } } },
          { t: 'Reset the regulator', d: 'Turn every burner knob OFF and close the tank valve (turn it clockwise until it stops). Unscrew the regulator from the tank, turn the burner knobs to HIGH for 1 minute to bleed the line, then back OFF. Screw the regulator back on hand-tight.', why: 'This resets the excess-flow device, a safety valve in the regulator that chokes the flow when it senses a sudden rush of gas, as if a hose had broken.', tip: 'Turn the big plastic coupling nut clockwise to tighten, like a jar lid. If it won’t start, back it off, hold the regulator dead straight into the valve and try again; never force it or use pliers.', ok: 'The coupling nut is snug by hand, the regulator sits straight in the valve, and all knobs point to OFF.', v: { cam: [0.6, 1.6, 1.6], at: [-0.2, 0.9, 0], hi: ['regulator', 'valve', 'knobs'], mv: { regulator: [0.15, 0.1, 0.15] } } },
          { t: 'Open the tank slowly', d: 'Open the tank valve slowly, about one full turn over 5 seconds, then the rest of the way. Wait about a minute before lighting.', why: 'A slow opening lets pressure build gently so the safety doesn’t trip again. How it works: a sudden surge pushes the excess-flow valve shut; a slow fill doesn’t.', tip: 'If you hear a loud whoosh when opening, a burner knob was left on. Close the tank, set all knobs OFF and start the reset again.', ok: 'You hear at most a short soft hiss, and the valve turns smoothly until it stops.', v: { cam: [0.4, 1.6, 1.4], at: [-0.25, 0.92, 0], hi: ['valve'], mv: { regulator: [0, 0, 0] }, rt: { valve: [0, 360, 0] } } },
          { t: 'Leak test', d: 'Brush soapy water on the tank valve, the regulator connection and along the hose. Watch for 10 seconds. Growing bubbles mean a leak: close the tank, tighten, and retest.', why: 'Propane is heavier than air and collects low, out of sight. Bubbles find leaks safely; a flame finds them by catching fire.', tip: 'Bubbles at the valve stem itself or on the hose mean a bad part, not a loose fitting; close the tank and replace it rather than tightening harder.', ok: 'The soapy film stays flat and still, with no growing bubbles anywhere.', v: { cam: [0.5, 1.2, 1.2], at: [-0.12, 0.92, 0.1], hi: ['soap', 'regulator'], show: ['soap'] } },
          { t: 'Light one burner', d: 'Lid open, push and turn one knob (usually the one by the igniter) to HIGH and press the igniter. If it only clicks, change the igniter battery, or hold a lit long lighter in the match-light hole first, then turn the knob on.', why: 'Lighting one burner first proves gas is flowing before you open more.', tip: 'No flame in 5 seconds? Knob OFF, wait 5 minutes, then try again. Repeated clicking with gas flowing fills the box with fuel.', ok: 'You hear a soft whump and see flame along the full length of that burner within a few seconds.', v: { cam: [1.2, 1.4, 1.8], at: [0.2, 0.9, 0.3], hi: ['igniter', 'knobs'], hide: ['soap'] } },
          { t: 'Check the flame', d: 'Look through the grates: flames should be mostly blue, about ½–1″ tall, with only occasional yellow tips. Lazy yellow flames mean blocked burner tubes; shut down, let it cool and clean the tubes with a venturi brush.', why: 'Spiders love the burner air intakes. Webs block the air, so the gas burns yellow, sooty and cool.', tip: 'Remember the reset is only needed after a trip. Next time, open the tank first with all knobs off, and the problem won’t come back.', ok: 'All burners show a steady blue flame along their whole length, and the lid thermometer climbs past 500 °F in 10–15 minutes.', v: { cam: [1.6, 2.0, 1.6], at: [0, 1.05, 0], hi: ['flames', 'burners'], show: ['flames'], hide: ['grates', 'grime'] } },
        ],
        learn: {
          how: 'Propane is stored as a liquid under pressure in the tank. The regulator drops that pressure to a steady low level. Each burner tube mixes the gas with air drawn in through an opening near the valve (the venturi), and the mixture burns at the burner ports. A built-in excess-flow device restricts flow if it senses a sudden surge, which looks like a broken grill but is just a safety reset.',
          specs: [['Full 20 lb tank', '≈ 37 lb'], ['Empty 20 lb tank', '≈ 17 lb (TW stamped on collar)'], ['Tank requalification', '12 yr from stamped date'], ['Good flame', 'blue, ½–1″, few yellow tips'], ['Failed light', 'off, wait 5 min'], ['Preheat', '10–15 min on high'], ['Leak test mix', '1 part soap : 3 parts water']],
          terms: [['Regulator', 'The round device on the hose that reduces tank pressure to burner pressure.'], ['OPD', 'Overfill Protection Device; tanks with it have a triangle-shaped valve handle.'], ['Venturi', 'Air intake tube on each burner.'], ['Excess-flow device', 'Safety that limits flow when gas rushes.'], ['TW', 'Tare weight: the empty weight stamped on the tank collar.']],
          mistakes: ['Opening the tank with burners already on.', 'Lighting with the lid closed.', 'Checking for leaks with a flame.', 'Clicking the igniter over and over with gas flowing.'],
          tips: ['Keep a spare tank, and weigh tanks with a luggage scale.', 'Always open the tank first and the burner knobs second; it prevents nearly every trip of the safety valve.'],
        },
        pro: 'You still smell gas after tightening, the regulator hose is cracked or brittle, the tank valve leaks, or the tank is dented or rusty. Replace those parts or swap the tank; never repair them.',
        tricks: [
          ['Tank first, knobs second', 'Make it a habit: all knobs off, open the tank slowly, then turn on burners. The regulator safety almost never trips that way.'],
          ['Hot-water fuel gauge', 'No scale? Pour a cup of hot tap water down the side of the tank and run your hand down it. The metal feels cool at the liquid level.'],
          ['Check the date stamp', 'Before a refill, find the month-year stamp on the collar. Over 12 years old means requalify or swap it at an exchange cage.'],
          ['Spider screens', 'Most grills have fine mesh screens over the air intakes. Keep them on, and brush the burner tubes each spring when spiders move in.'],
          ['Test the igniter in the dark', 'Press the igniter at dusk with the gas off. A strong blue spark at the burner means the igniter is fine and the problem is gas.'],
          ['Never store the tank inside', 'Keep spare tanks outdoors, upright and in the shade, never in a garage, shed or basement.'],
        ],
        refs: [
          ['Weber grills troubleshooting: regulator problems and more (BBQ Host)', 'https://bbqhost.com/weber-grills-troubleshooting/'],
          ['Grilling safety tips (NFPA)', 'https://www.nfpa.org/education-and-research/home-fire-safety/grilling'],
          ['How to tell if you need to refill or replace your propane tank (Napoleon)', 'https://www.napoleon.com/en/at/barbecues/blog/how-tell-if-you-need-refill-or-replace-your-propane-tank'],
          ['Propane cylinder requalification explained (Paraco)', 'https://paracogas.com/blog/propane-cylinder-requalification-explained'],
        ],
      },
      {
        id: 'grill-clean',
        title: 'Clean grill grates & burners',
        model: 'grill',
        level: 1,
        time: '30–45 min',
        cost: '$0–20',
        summary: 'Burn off, scrape, wash, and empty the grease tray. Clean grates stop sticking and flare-ups, clear burner ports make even heat, and an empty grease tray is the best fire prevention a grill gets.',
        intro: { hi: ['grime', 'grates'] },
        safety: ['Wire-brush bristles can break off, stick to food and be swallowed. Use a bristle-free scraper, or wipe the grates with a damp paper towel and check them after brushing.', 'Let the grill cool before handling burners and heat tents, and close the tank valve before taking out burners.', 'Grease fires start in the cookbox and grease tray. Never use water on a grease fire; close the lid and burners and shut the tank.'],
        causes: [['Grease buildup', 'Leads to flare-ups, smoke and grease fires.'], ['Rust on grates', 'Moisture and salt on bare cast iron or worn plating.'], ['Clogged burner ports', 'Grease and rust close the tiny holes, giving cold spots.'], ['Full grease tray', 'Overflows and can catch fire under the grill.']],
        tools: ['Bristle-free grill scraper or brush', 'Dish soap and a bucket of hot water', 'Non-abrasive scrub pad', 'Stainless burner brush', 'Paper clip or drill bit (small, to clear ports)', 'Plastic scraper (for the cookbox)', 'Cooking oil and paper towels', 'Gloves'],
        steps: [
          { t: 'Burn it off', d: 'Close the lid and run all burners on high for 15 minutes.', why: 'Heat turns stuck-on grease and food into dry, brittle carbon that flakes off easily.', tip: 'Do this at the end of a cook instead of the start; the grill is already hot and the residue is fresh.', ok: 'The thermometer reads 500 °F or more and the smoke from the vents has thinned out.', v: { cam: [2.6, 2.0, 2.8], at: [0, 1.0, 0], hi: ['lid'], show: ['flames'] } },
          { t: 'Scrape the grates', d: 'Turn off the burners and the tank, open the lid, and scrape the grates while they’re still warm, pushing along the bars. Wear a grill glove.', why: 'Warm residue is brittle and pops off; cold residue is gummy and smears.', tip: 'Scraper missing the spaces between bars? Fold a ball of aluminum foil, grip it with long tongs, and scrub; it gets into every gap with no bristles.', ok: 'Running the scraper over each bar, it glides smoothly with no bumps or black crust.', v: { cam: [1.4, 2.2, 1.6], at: [0, 1.12, 0], hi: ['brush', 'grates'], show: ['brush'], hide: ['flames'], rt: { lid: [-95, 0, 0] }, fx: 'scrub' } },
          { t: 'Wash the grates', d: 'Once cool, lift the grates and heat tents (the metal tents over the burners) out and scrub them in hot soapy water. Rinse and dry fully.', why: 'Soap cuts the grease film that scraping leaves behind.', tip: 'For cast iron, skip long soaks and dry it right away in the warm grill. For porcelain-coated grates, use a nylon pad, not steel wool, so you don’t chip the coating.', ok: 'A clean paper towel wiped along a bar comes away only lightly gray.', v: { cam: [1.6, 2.4, 1.8], at: [0, 1.4, 0.4], hi: ['grates'], mv: { grates: [0, 0.4, 0.5], grime: [0, 0.4, 0.5] }, hide: ['brush'] } },
          { t: 'Clear the burner ports', d: 'Brush each burner tube lengthwise with a stainless brush (along the tube, never across the ports). Poke any clogged port with an unbent paper clip.', why: 'Clogged ports leave cold spots and uneven flames. Brushing across the ports pushes debris into them.', tip: 'Don’t make ports bigger: a drill bit or nail that’s too large changes the flame. Match the paper clip to the hole size.', ok: 'Shining a flashlight along each burner, every port is an open, clean hole.', v: { cam: [1.4, 1.8, 1.4], at: [0, 1.02, 0], hi: ['burners'], hide: ['grime'] } },
          { t: 'Empty the tray, reinstall and oil', d: 'Scrape the cookbox floor into the grease tray, then empty and wipe the tray and cup. Reinstall heat tents and grates, and wipe the grates with a thin coat of high-heat oil on a folded paper towel held with tongs.', why: 'An overflowing grease tray is the main cause of grill fires, and a thin oil film keeps food from sticking and stops rust.', tip: 'Line the grease cup with a foil liner or use disposable drip pans; next time you just swap it.', ok: 'Grates sit flat and level, have a light sheen, and the grease tray slides in fully until it stops.', v: { cam: [2.6, 2.0, 2.8], at: [0, 1.0, 0], hi: ['grates'], mv: { grates: [0, 0, 0] }, rt: { lid: [0, 0, 0] } } },
        ],
        learn: {
          how: 'Grease that drips onto hot parts vaporizes and can ignite, causing flare-ups. Over time it bakes into carbon on the grates and the inside of the lid. Burner ports are tiny holes; when they clog, gas flows unevenly and you get hot and cold zones. Everything that doesn’t burn off slides down to the grease tray.',
          specs: [['Burn-off', '15 min on high'], ['Deep clean', '2× per season'], ['Grease tray', 'check every 3–5 cooks'], ['Burner brush direction', 'lengthwise along the tube']],
          terms: [['Flare-up', 'Sudden flame from burning grease.'], ['Flavorizer bars / heat tents', 'Metal shields over burners that vaporize drippings into smoke.'], ['Burner ports', 'Small holes along the burner where the flame comes out.'], ['Seasoning', 'Thin baked-on oil layer that protects cast iron.']],
          mistakes: ['Cleaning grates cold.', 'Leaving loose wire bristles behind.', 'Brushing across the burner ports.', 'Forgetting the grease tray.'],
          tips: ['Half an onion on a fork works as a natural grate scrubber on a hot grill.', 'Flaking “paint” inside the lid is carbonized grease, not paint; scrape it off with a plastic scraper.'],
        },
        pro: 'Burners are rusted through, the cookbox has holes, or the grease keeps catching fire after cleaning.',
        tricks: [
          ['Foil-ball scrubber', 'Crumple foil into a fist-sized ball and scrub hot grates with tongs. No bristles to swallow, and it reaches between bars.'],
          ['Clean while hot, every cook', 'Ten seconds of scraping right after cooking saves a 30-minute deep clean later.'],
          ['Grease-cup liners', 'Foil liners for the grease cup make dumping it a 10-second job instead of a scrape.'],
          ['Check for bristles', 'If you do use a wire brush, wipe the grates with a damp wadded paper towel after. Loose bristles snag on it and show up.'],
          ['Vinegar-baking soda soak', 'For crusty stainless grates, soak overnight in a trash bag with 2 cups vinegar and 1 cup baking soda, then scrub.'],
          ['Cover after it cools', 'A breathable cover over a fully cooled grill keeps rain and spiders out. Covering a hot grill melts it; covering a wet one traps rust.'],
        ],
        refs: [
          ['Injuries from wire grill-cleaning brushes (CDC MMWR)', 'https://www.cdc.gov/mmwr/preview/mmwrhtml/mm6126a3.htm'],
          ['Grilling safety tips (NFPA)', 'https://www.nfpa.org/education-and-research/home-fire-safety/grilling'],
          ['Grill care and cleaning articles (Weber)', 'https://www.weber.com/US/en/blog/grill-and-accessory-care/'],
        ],
      },
    ],
  });
})();
