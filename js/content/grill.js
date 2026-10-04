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
        summary: 'Low, yellow or no flame usually means the regulator’s safety device has tripped. A proper reset sequence fixes it. Then check the igniter.',
        intro: { hi: ['regulator', 'igniter'] },
        safety: ['Smell gas? Turn the tank valve off, open the lid and step away. Don’t light anything.', 'Always open the lid before lighting. Gas pooled under a closed lid can flash.', 'Leak-test connections with soapy water, never a flame.'],
        causes: [['Tripped regulator', 'Opening the tank valve too fast or with burners on activates the excess-flow safety, restricting gas.'], ['Empty tank', 'Weigh it or pour warm water down the side and feel for the cold line.'], ['Dead igniter battery or dirty electrode', 'Clicks but no spark.'], ['Spider webs in burner tubes', 'Yellow, lazy or uneven flames.']],
        tools: ['Fresh AA/AAA battery (for igniter)', 'Long lighter or match holder', 'Soapy water & brush', 'Venturi brush / pipe cleaner'],
        steps: [
          { t: 'Open the lid', d: 'Open the lid and leave it open for every step that follows.', why: 'Lets any unburned gas clear before lighting.', v: { cam: [2.4, 2.4, 2.4], at: [0, 1.1, 0], hi: ['lid'], rt: { lid: [-95, 0, 0] } } },
          { t: 'Reset the regulator', d: 'Turn all knobs OFF and the tank valve OFF. Disconnect the regulator from the tank, wait 1 minute, reconnect hand-tight.', why: 'This resets the excess-flow device that cuts flow when it senses a sudden rush of gas.', v: { cam: [0.6, 1.6, 1.6], at: [-0.2, 0.9, 0], hi: ['regulator', 'valve', 'knobs'], mv: { regulator: [0.15, 0.1, 0.15] } } },
          { t: 'Open the tank slowly', d: 'Reconnect and open the tank valve slowly, a quarter turn, wait, then fully open.', why: 'A slow opening keeps the safety from tripping again.', v: { cam: [0.4, 1.6, 1.4], at: [-0.25, 0.92, 0], hi: ['valve'], mv: { regulator: [0, 0, 0] }, rt: { valve: [0, 360, 0] } } },
          { t: 'Leak test', d: 'Brush soapy water on the connection. Growing bubbles mean a leak. Tighten and retest.', why: 'Propane is heavier than air and collects low. Bubbles find leaks safely.', v: { cam: [0.5, 1.2, 1.2], at: [-0.12, 0.92, 0.1], hi: ['soap', 'regulator'], show: ['soap'] } },
          { t: 'Light one burner', d: 'Turn one knob to HIGH and press the igniter. If it only clicks, change the igniter battery or light with a long lighter through the side hole.', why: 'Lighting a single burner first confirms gas flow before you open more.', v: { cam: [1.2, 1.4, 1.8], at: [0.2, 0.9, 0.3], hi: ['igniter', 'knobs'], hide: ['soap'] } },
          { t: 'Check the flame', d: 'Flames should be blue with yellow tips. Lazy yellow flames mean blocked burner tubes; clean them with a venturi brush.', why: 'Spiders love the burner air intake. Webs block air, causing yellow, sooty flames.', v: { cam: [1.6, 2.0, 1.6], at: [0, 1.05, 0], hi: ['flames', 'burners'], show: ['flames'], hide: ['grates', 'grime'] } },
        ],
        learn: {
          how: 'Propane is stored as a liquid under pressure in the tank. The regulator drops that pressure to a steady low level. The burner tubes mix the gas with air through openings near the valve (the venturi), and the mixture burns at the burner ports. A built-in excess-flow device restricts flow if it senses a sudden surge, which looks like a broken grill but is just a safety reset.',
          specs: [['Full 20 lb tank weight', '≈ 37 lb'], ['Empty tank weight', '≈ 17 lb (TW on collar)'], ['Good flame', 'blue, ½–1″'], ['Preheat', '10–15 min']],
          terms: [['Regulator', 'Reduces tank pressure to burner pressure.'], ['OPD', 'Overfill Protection Device (triangle valve handle).'], ['Venturi', 'Air intake tube on each burner.'], ['Excess-flow device', 'Safety that limits flow when gas rushes.']],
          mistakes: ['Opening the tank with burners already on.', 'Lighting with the lid closed.', 'Checking for leaks with a flame.'],
          tips: ['Keep a spare tank, and weigh tanks with a luggage scale.'],
        },
        pro: 'You smell gas after tightening, the regulator hose is cracked, or the tank valve leaks. Replace parts; don’t repair them.',
      },
      {
        id: 'grill-clean',
        title: 'Clean grill grates & burners',
        model: 'grill',
        level: 1,
        time: '30–45 min',
        cost: '$0–20',
        summary: 'Burn off, scrape, and wash. Clean grates stop sticking and flare-ups, and clear burner ports make even heat.',
        intro: { hi: ['grime', 'grates'] },
        safety: ['Use a wire brush with care. Loose bristles can end up in food. Check grates afterward, or use a bristle-free scraper.', 'Let the grill cool before handling burners.'],
        causes: [['Grease buildup', 'Leads to flare-ups and smoke.'], ['Rust on grates', 'From moisture and salt.']],
        tools: ['Grill scraper (bristle-free) or brush', 'Dish soap & bucket', 'Bristle brush for burner ports', 'Paper clip or toothpick', 'Cooking oil & paper towel'],
        steps: [
          { t: 'Burn it off', d: 'Run the grill on high with the lid closed for 15 minutes.', why: 'Heat carbonizes grease so it flakes off easily.', v: { cam: [2.6, 2.0, 2.8], at: [0, 1.0, 0], hi: ['lid'], show: ['flames'] } },
          { t: 'Scrape the grates', d: 'Turn off the gas, open the lid, and scrape while still warm.', why: 'Warm residue is brittle; cold residue is gummy.', v: { cam: [1.4, 2.2, 1.6], at: [0, 1.12, 0], hi: ['brush', 'grates'], show: ['brush'], hide: ['flames'], rt: { lid: [-95, 0, 0] }, fx: 'scrub' } },
          { t: 'Wash the grates', d: 'Once cool, lift the grates out and scrub with hot soapy water. Dry fully.', why: 'Soap cuts the grease film that scraping leaves behind.', v: { cam: [1.6, 2.4, 1.8], at: [0, 1.4, 0.4], hi: ['grates'], mv: { grates: [0, 0.4, 0.5], grime: [0, 0.4, 0.5] }, hide: ['brush'] } },
          { t: 'Clear the burner ports', d: 'Brush the burner tubes lengthwise and poke clogged ports with a paper clip.', why: 'Clogged ports leave cold spots and uneven flames.', v: { cam: [1.4, 1.8, 1.4], at: [0, 1.02, 0], hi: ['burners'], hide: ['grime'] } },
          { t: 'Reinstall and oil', d: 'Put the grates back and wipe them with a thin coat of oil.', why: 'Oil seasons cast iron and keeps food from sticking.', v: { cam: [2.6, 2.0, 2.8], at: [0, 1.0, 0], hi: ['grates'], mv: { grates: [0, 0, 0] }, rt: { lid: [0, 0, 0] } } },
        ],
        learn: {
          how: 'Grease that drips onto hot parts vaporizes and can ignite, causing flare-ups. Over time it bakes into carbon on the grates. Burner ports are tiny holes; when they clog, gas flows unevenly and you get hot and cold zones.',
          specs: [['Burn-off', '15 min on high'], ['Deep clean', '2× per season']],
          terms: [['Flare-up', 'Sudden flame from burning grease.'], ['Flavorizer bars / heat tents', 'Metal shields over burners that vaporize drippings.']],
          mistakes: ['Cleaning grates cold.', 'Leaving loose wire bristles behind.'],
          tips: ['Half an onion on a fork works as a natural grate scrubber on a hot grill.'],
        },
        pro: 'Burners are rusted through or the firebox has holes.',
      },
    ],
  });
})();
