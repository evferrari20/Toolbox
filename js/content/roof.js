/* ROF · Roof & gutters */
(function () {
  /* ---- Model: asphalt-shingle roof section ---- */
  TB.model('roof', { cam: [2.2, 3.2, 3.2], at: [0, 1.6, 0], hidden: ['newShingle', 'flatbar'] }, (K) => {
    K.box(null, [3.0, 1.2, 2.2], K.std(0xd8cfc0), [0, 0.6, -0.2]);
    const deck = K.group(null, [0, 1.25, 0.9], [26, 0, 0]);
    const sheathing = K.part('sheathing', [0, 0, 0], deck, 'Roof deck (plywood)');
    K.box(sheathing, [3.2, 0.04, 2.6], K.std(0xc9a46e), [0, 0, -1.3]);
    const W = 0.36;
    for (let row = 0; row < 9; row++) {
      const z = -0.15 - row * 0.24;
      const off = row % 2 ? W / 2 : 0;
      for (let i = 0; i < 9; i++) {
        const x = -1.44 + i * W + off;
        if (x > 1.5) continue;
        const isDam = row === 3 && i === 4;
        const parent = isDam ? K.part('damaged', [x, 0.035 + row * 0.004, z], deck, 'Damaged shingle tab') : deck;
        const pos = isDam ? [0, 0, 0] : [x, 0.035 + row * 0.004, z];
        K.box(parent, [W - 0.01, 0.016, 0.34], isDam ? K.std(0x6b5f55) : row % 3 ? 'dark' : K.std(0x44494f), pos);
      }
    }
    const nails = K.part('nails', [0.0, 0.07, -0.95], deck, 'Nails under the tab above');
    [-0.24, -0.08, 0.08, 0.24].forEach((x) => K.cyl(nails, [0.015, 0.015, 0.012], 'chrome', [x + 0.0, 0, 0]));
    const ns = K.part('newShingle', [0.0, 0.5, -0.87], deck, 'New shingle');
    K.box(ns, [W * 3, 0.016, 0.34], K.std(0x3c4148));
    const bar = K.part('flatbar', [0.3, 0.25, -0.5], deck, 'Flat bar');
    K.box(bar, [0.06, 0.02, 0.6], 'steel', [0, 0, 0], [0, 25, 0]);
    const seal = K.part('sealant', [0, 0.06, -0.78], deck, 'Roofing cement dabs');
    [-0.3, -0.1, 0.1, 0.3].forEach((x) => K.sph(seal, 0.02, 'black', [x, 0, 0], [1.4, 0.5, 1]));
    return {};
  });

  /* ---- Model: gutter + downspout on an eave ---- */
  TB.model('gutter', { cam: [2.0, 3.0, 3.2], at: [0, 1.9, 0], hidden: ['hose'] }, (K) => {
    K.box(null, [3.4, 2.2, 0.1], K.std(0xd8cfc0), [0, 1.1, -0.3]);
    K.box(null, [3.6, 0.04, 1.0], 'dark', [0, 2.35, 0.0], [-20, 0, 0]);
    K.box(null, [3.4, 0.22, 0.04], 'offwhite', [0, 2.15, 0.18]);
    const g = K.part('gutter', [0, 2.06, 0.32], null, 'Gutter');
    K.box(g, [3.2, 0.02, 0.22], 'white', [0, -0.1, 0]);
    K.box(g, [3.2, 0.22, 0.02], 'white', [0, 0, 0.11]);
    K.box(g, [3.2, 0.22, 0.02], 'white', [0, 0, -0.11]);
    K.box(g, [0.02, 0.22, 0.22], 'white', [-1.6, 0, 0]);
    K.box(g, [0.02, 0.22, 0.22], 'white', [1.6, 0, 0]);
    const hang = K.part('hangers', [0, 0, 0], g, 'Hidden hangers');
    K.rep(4, (i) => K.box(hang, [0.03, 0.02, 0.24], 'steel', [-1.2 + i * 0.8, 0.1, 0]));
    const leaves = K.part('leaves', [0, -0.05, 0], g, 'Leaves & gunk');
    K.rep(12, (i) => K.sph(leaves, 0.07, i % 3 ? 'orange' : 'dirt', [-1.45 + i * 0.25, 0, (i % 2) * 0.04 - 0.02], [1.5, 0.5, 1]));
    const ds = K.part('downspout', [1.45, 0, 0.32], null, 'Downspout');
    K.box(ds, [0.1, 1.9, 0.08], 'white', [0, 1.0, 0.08]);
    K.box(ds, [0.1, 0.1, 0.35], 'white', [0, 0.08, 0.28]);
    const plug = K.part('plug', [1.45, 1.3, 0.4], null, 'Downspout clog');
    K.box(plug, [0.08, 0.15, 0.06], 'dirt');
    const splash = K.part('splash', [1.45, 0.02, 0.7], null, 'Splash block');
    K.box(splash, [0.3, 0.04, 0.5], 'concrete');
    const lad = K.part('ladder', [-0.6, 0, 0.9], null, 'Extension ladder');
    const L = K.group(lad, [0, 0, 0], [-15, 0, 0]);
    K.box(L, [0.04, 2.3, 0.04], 'orange', [-0.22, 1.15, 0]);
    K.box(L, [0.04, 2.3, 0.04], 'orange', [0.22, 1.15, 0]);
    K.rep(7, (i) => K.box(L, [0.44, 0.03, 0.03], 'steel', [0, 0.25 + i * 0.3, 0]));
    const sc = K.part('scoop', [-0.3, 2.2, 0.35], null, 'Gutter scoop');
    K.box(sc, [0.14, 0.03, 0.14], 'orange');
    K.box(sc, [0.04, 0.04, 0.2], 'orange', [0, 0.02, 0.15]);
    const hose = K.part('hose', [1.45, 2.1, 0.4], null, 'Hose');
    K.tube(hose, [[0, 0.05, 0], [0.2, 0.3, 0.3], [0.6, 0.0, 0.6], [1.0, -2.0, 0.8]], 0.03, 'green');
    const flow = K.cyl(hose, [0.03, 0.05, 1.8], 'water', [0, -0.95, 0.08]);
    flow.userData.noPick = true;
    return {
      tick(t, fx) {
        flow.visible = fx === 'flush';
      },
    };
  });

  TB.category({
    id: 'roof',
    code: 'ROF',
    name: 'Roof & Gutters',
    domain: 'exterior',
    blurb: 'Shingles and gutters',
    repairs: [
      {
        id: 'replace-shingle',
        title: 'Replace a damaged shingle',
        model: 'roof',
        level: 3,
        time: '1–2 hrs',
        cost: '$15–40',
        summary: 'A torn, cracked or missing 3-tab shingle can be swapped by releasing the seal on the row above, pulling 8 nails and sliding in a new one.',
        intro: { hi: ['damaged'] },
        safety: ['Work only on a dry, mild day on roofs you can walk comfortably (pitch 6/12 or less). Use a harness on anything steeper.', 'Set the ladder at a 4:1 angle and extend it 3 feet above the edge.', 'Asphalt shingles crack when cold; on hot days they tear. Work in the morning when it’s 50–80 °F.'],
        causes: [['Wind lift', 'Tabs whose seal strip failed fold back and crack.'], ['Hail or branch impact', 'Bruises and missing granules.'], ['Age', 'Curling and brittleness.']],
        tools: ['Flat pry bar', 'Hammer', 'Roofing nails (1¼″)', 'Matching replacement shingle', 'Roofing cement & caulk gun', 'Utility knife', 'Fall protection'],
        steps: [
          { t: 'Break the seal above', d: 'Slide the flat bar under the shingle row above the damaged one and gently break the adhesive seal.', why: 'Each row is glued down by a tar strip on the row below. Breaking it lets you reach the nails without tearing tabs.', v: { cam: [1.2, 2.8, 2.0], at: [0, 1.7, 0], hi: ['flatbar'], show: ['flatbar'] } },
          { t: 'Pull the nails', d: 'Lift the tab above and pry up the 4 nails through the damaged shingle, plus the 4 from the row above that pass through it.', why: 'Each shingle is held by its own nails and by the nails of the shingle above.', v: { cam: [1.0, 2.6, 1.8], at: [0, 1.75, -0.1], hi: ['nails'] } },
          { t: 'Slide out the old shingle', d: 'Pull the damaged shingle down and out.', why: 'Once all the nails are out it slides out easily.', v: { cam: [1.2, 2.6, 2.2], at: [0, 1.6, 0.3], hi: ['damaged'], mv: { damaged: [0, 0.3, 0.8] } } },
          { t: 'Slide in and nail the new one', d: 'Push the new shingle up into place, aligned with its neighbors. Nail just below the seal strip, 1″ in from each tab slot.', why: 'Nailing in the correct zone keeps nails covered by the next row and holds the shingle in high winds.', v: { cam: [1.0, 2.6, 1.8], at: [0, 1.7, 0], hi: ['newShingle'], show: ['newShingle'], hide: ['damaged', 'flatbar'] } },
          { t: 'Reseal the tabs', d: 'Put a dab of roofing cement under each lifted tab and press it down.', why: 'The factory seal you broke won’t reseal itself until a hot day, and wind can lift it in the meantime.', v: { cam: [1.0, 2.6, 1.8], at: [0, 1.7, 0], hi: ['sealant'] } },
        ],
        learn: {
          how: 'Shingles work like overlapping fish scales. Water runs down over the top, and each row covers the nails and joints of the row beneath. Granules on the surface shield the asphalt from UV. A missing tab exposes the layer below to sun and wind-driven rain.',
          specs: [['Nails per shingle', '4 (6 in high-wind areas)'], ['Exposure per row', '5″'], ['Ladder angle', '4:1 (75°)'], ['Ladder above edge', '3 ft']],
          terms: [['Tab', 'The exposed flap of a 3-tab shingle.'], ['Seal strip', 'Tar strip that glues each row to the one below.'], ['Pitch', 'Roof steepness, rise per 12″ of run.'], ['Underlayment', 'Felt or synthetic layer under the shingles.']],
          mistakes: ['Working on wet or frosty shingles.', 'Nailing too high so the nails miss the shingle below.', 'Face-nailing exposed tabs.'],
          tips: ['Check the attic or garage for leftover shingles from the original install. They’ll match exactly.'],
        },
        pro: 'The roof is steep, wet, or higher than one story, the sheathing feels soft, or there are signs of leaks inside.',
      },
      {
        id: 'clean-gutters',
        title: 'Clogged gutters & downspouts',
        model: 'gutter',
        level: 2,
        time: '1–3 hrs',
        cost: '$0–20',
        summary: 'Overflowing gutters dump water at your foundation. Scoop them out from a ladder, flush the downspouts, and check the slope.',
        intro: { hi: ['leaves', 'plug'] },
        safety: ['Keep three points of contact on the ladder. Move it rather than reaching sideways.', 'Look for power lines before raising a ladder.', 'Wear gloves; gutter debris hides sharp screws and metal edges.'],
        causes: [['Leaves and seed pods', 'Spring and fall.'], ['Roof granules', 'Sludge builds up over years.'], ['Clogged downspout elbow', 'The bend catches debris.']],
        tools: ['Extension ladder with standoff', 'Gutter scoop', 'Bucket with hook', 'Garden hose with nozzle', 'Work gloves', 'Plumbing snake (for stubborn downspouts)'],
        steps: [
          { t: 'Set the ladder safely', d: 'Set the ladder on firm, level ground with a standoff so it rests on the wall, not the gutter.', why: 'Leaning a ladder on a gutter dents it and can let the ladder slide sideways.', v: { cam: [2.4, 1.6, 3.2], at: [-0.6, 1.0, 0.6], hi: ['ladder'] } },
          { t: 'Scoop out debris', d: 'Start at the downspout end and scoop toward you into a bucket.', why: 'Starting at the downspout keeps you from pushing debris into the outlet.', v: { cam: [0.8, 2.8, 1.8], at: [-0.3, 2.0, 0.3], hi: ['leaves', 'scoop'] } },
          { t: 'Flush the gutter', d: 'Run a hose from the far end toward the downspout and watch the flow.', why: 'Standing puddles show low spots where the gutter needs re-pitching.', v: { cam: [1.4, 2.8, 2.4], at: [0.4, 2.0, 0.3], hi: ['gutter'], hide: ['leaves'] } },
          { t: 'Clear the downspout', d: 'Feed the hose down the downspout at full pressure. If it backs up, snake it from the bottom.', why: 'Most downspout clogs are at the elbow, where debris jams at the bend.', v: { cam: [2.4, 1.8, 2.0], at: [1.45, 1.2, 0.4], hi: ['downspout', 'plug', 'hose'], show: ['hose'], xray: true, fx: 'flush' } },
          { t: 'Check hangers and splash block', d: 'Tighten loose hangers. Make sure water discharges onto a splash block or extension at least 4 feet from the foundation.', why: 'Water dumped at the foundation is the most common cause of wet basements.', v: { cam: [2.4, 1.4, 2.6], at: [1.0, 0.8, 0.5], hi: ['splash', 'hangers'], hide: ['plug', 'hose'] } },
        ],
        learn: {
          how: 'A roof sheds a lot of water. One inch of rain on 1,000 sq ft of roof is about 600 gallons. Gutters collect it and sloped troughs carry it to downspouts that send it away from the house. When they clog, water overflows right at the foundation, soaks fascia boards, and in winter forms ice dams.',
          specs: [['Gutter slope', '¼″ per 10 ft'], ['Discharge distance', '≥ 4 ft from foundation'], ['Cleaning', '2× per year'], ['1″ rain, 1,000 ft² roof', '≈ 600 gal']],
          terms: [['Fascia', 'Board along the roof edge the gutter mounts to.'], ['Hanger', 'Bracket that holds the gutter to the fascia.'], ['Ice dam', 'Ice ridge at the eave that backs water under shingles.']],
          mistakes: ['Leaning the ladder on the gutter.', 'Pressure-washing shingles from the gutter.', 'Ignoring a downspout that dumps by the foundation.'],
          tips: ['Clean after the last leaves fall, not mid-autumn.', 'Gutter guards reduce cleanings but don’t eliminate them.'],
        },
        pro: 'The house is two-plus stories, the gutters are pulling off or sagging, or the fascia is rotten.',
      },
    ],
  });
})();
