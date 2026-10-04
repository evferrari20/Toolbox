/* FUR · Home & furniture */
(function () {
  /* ---- Model: wooden chair ---- */
  TB.model('chair', { cam: [2.2, 1.6, 2.4], at: [0, 0.6, 0], hidden: ['clamp'] }, (K) => {
    const seat = K.part('seat', [0, 0.9, 0], null, 'Seat');
    K.box(seat, [0.9, 0.06, 0.85], 'wood');
    const back = K.part('back', [0, 0.9, -0.4], null, 'Backrest');
    K.box(back, [0.06, 0.95, 0.06], 'woodDark', [-0.4, 0.47, 0]);
    K.box(back, [0.06, 0.95, 0.06], 'woodDark', [0.4, 0.47, 0]);
    K.box(back, [0.86, 0.12, 0.05], 'woodDark', [0, 0.9, 0]);
    K.rep(3, (i) => K.box(back, [0.04, 0.6, 0.04], 'woodDark', [-0.2 + i * 0.2, 0.5, 0]));
    const legs = K.part('legs', [0, 0, 0], null, 'Legs');
    [[-0.38, -0.36], [0.38, -0.36], [-0.38, 0.36]].forEach(([x, z]) => K.cyl(legs, [0.035, 0.03, 0.88], 'woodDark', [x, 0.44, z]));
    const loose = K.part('looseLeg', [0.38, 0.44, 0.36], null, 'Loose leg');
    K.cyl(loose, [0.035, 0.03, 0.88], 'woodDark');
    const joint = K.part('joint', [0.38, 0.86, 0.36], null, 'Loose joint (old glue)');
    K.cyl(joint, [0.05, 0.05, 0.06], K.std(0xd9b36a, { roughness: 0.5 }));
    const str = K.part('stretchers', [0, 0, 0], null, 'Stretchers (rungs)');
    K.cyl(str, [0.02, 0.02, 0.76], 'woodDark', [0, 0.3, 0.36], [0, 0, 90]);
    K.cyl(str, [0.02, 0.02, 0.76], 'woodDark', [0, 0.3, -0.36], [0, 0, 90]);
    K.cyl(str, [0.02, 0.02, 0.72], 'woodDark', [-0.38, 0.25, 0], [90, 0, 0]);
    K.cyl(str, [0.02, 0.02, 0.72], 'woodDark', [0.38, 0.25, 0], [90, 0, 0]);
    const clamp = K.part('clamp', [0, 0.3, 0.45], null, 'Strap clamp');
    K.box(clamp, [0.9, 0.04, 0.02], 'orange');
    K.box(clamp, [0.12, 0.08, 0.06], 'dark', [0, 0, 0.03]);
    return {};
  });

  /* ---- Model: dresser with a sticking drawer ---- */
  TB.model('dresser', { cam: [2.4, 1.6, 2.6], at: [0, 0.7, 0] }, (K) => {
    const cab = K.part('cabinet', [0, 0, 0], null, 'Dresser case');
    K.box(cab, [1.4, 0.04, 0.8], 'woodDark', [0, 1.3, 0]);
    K.box(cab, [0.04, 1.2, 0.8], 'woodDark', [-0.68, 0.7, 0]);
    K.box(cab, [0.04, 1.2, 0.8], 'woodDark', [0.68, 0.7, 0]);
    K.box(cab, [1.4, 1.2, 0.03], 'woodDark', [0, 0.7, -0.39]);
    K.box(cab, [1.4, 0.1, 0.8], 'woodDark', [0, 0.05, 0]);
    K.box(cab, [1.32, 0.02, 0.76], 'woodDark', [0, 0.72, 0]);
    const run = K.part('runners', [0, 0, 0], null, 'Wood runners');
    K.box(run, [0.06, 0.03, 0.76], 'woodLight', [-0.6, 0.745, 0]);
    K.box(run, [0.06, 0.03, 0.76], 'woodLight', [0.6, 0.745, 0]);
    const d = K.part('drawer', [0, 0.95, 0.0], null, 'Sticking drawer');
    K.box(d, [1.3, 0.36, 0.03], 'wood', [0, 0, 0.38]);
    K.box(d, [1.22, 0.3, 0.02], 'woodLight', [0, 0, -0.36]);
    K.box(d, [0.02, 0.3, 0.74], 'woodLight', [-0.6, 0, 0]);
    K.box(d, [0.02, 0.3, 0.74], 'woodLight', [0.6, 0, 0]);
    K.box(d, [1.22, 0.02, 0.74], 'woodLight', [0, -0.15, 0]);
    K.sph(d, 0.035, 'brass', [-0.3, 0, 0.41]);
    K.sph(d, 0.035, 'brass', [0.3, 0, 0.41]);
    const wear = K.part('wear', [0, -0.16, 0], d, 'Worn drawer bottom edges');
    K.box(wear, [0.04, 0.02, 0.74], 'red', [-0.6, 0, 0]);
    K.box(wear, [0.04, 0.02, 0.74], 'red', [0.6, 0, 0]);
    const d2 = K.part('drawer2', [0, 0.38, 0], null, 'Lower drawer');
    K.box(d2, [1.3, 0.5, 0.03], 'wood', [0, 0, 0.38]);
    K.sph(d2, 0.035, 'brass', [-0.3, 0, 0.41]);
    K.sph(d2, 0.035, 'brass', [0.3, 0, 0.41]);
    const wax = K.part('wax', [0.9, 0.3, 0.6], null, 'Paraffin wax');
    K.box(wax, [0.12, 0.08, 0.2], 'offwhite');
    return {};
  });

  TB.category({
    id: 'furniture',
    code: 'FUR',
    name: 'Home & Furniture',
    domain: 'interior',
    blurb: 'Wobbly chairs and sticking drawers',
    repairs: [
      {
        id: 'wobbly-chair',
        title: 'Wobbly wooden chair',
        model: 'chair',
        level: 2,
        time: '1 hr + overnight',
        cost: '$10–20',
        summary: 'A wobble means a joint’s glue has failed. Screws and nails make it worse. Take the joint apart, clean off the old glue and reglue it under clamp pressure.',
        intro: { hi: ['joint', 'looseLeg'] },
        safety: ['Don’t sit on the chair until the glue has cured fully, typically 24 hours.'],
        causes: [['Failed glue joint', 'Wood shrinks and swells with humidity until old glue lets go.'], ['Loose stretcher', 'Rungs work loose and the legs splay.'], ['Uneven floor', 'Rule this out first on a known-flat surface.']],
        tools: ['Rubber mallet', 'Wood glue (PVA, or hide glue for antiques)', 'Strap clamp', 'Chisel or scraper', 'Damp rag'],
        steps: [
          { t: 'Find the loose joint', d: 'Flip the chair over and flex each leg. Watch where a joint moves or a gap opens.', why: 'Usually one or two joints are loose. Find all of them before gluing so you only clamp once.', v: { cam: [1.6, 1.4, 1.6], at: [0.38, 0.7, 0.36], hi: ['joint'] } },
          { t: 'Knock the joint apart', d: 'Tap the loose part out with a rubber mallet. Don’t force tight joints.', why: 'Glue bonds to bare wood, not to old glue. The joint has to come apart to be cleaned.', v: { cam: [1.6, 1.0, 1.8], at: [0.38, 0.4, 0.36], hi: ['looseLeg'], mv: { looseLeg: [0.15, -0.35, 0.15] }, rt: { looseLeg: [10, 0, -10] } } },
          { t: 'Scrape off old glue', d: 'Scrape both the tenon (peg) and inside the socket down to clean wood.', why: 'New PVA glue won’t stick to old cured glue.', v: { cam: [1.4, 0.9, 1.4], at: [0.45, 0.6, 0.45], hi: ['joint', 'looseLeg'] } },
          { t: 'Glue and reassemble', d: 'Coat both surfaces thinly, push the joint home, and tap it seated.', why: 'A thin coat on both parts beats a thick coat on one; excess just squeezes out.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.6, 0], hi: ['looseLeg', 'joint'], mv: { looseLeg: [0, 0, 0] }, rt: { looseLeg: [0, 0, 0] } } },
          { t: 'Clamp overnight', d: 'Wrap a strap clamp around the legs and snug it. Wipe away squeeze-out with a damp rag. Leave it 24 hours.', why: 'Clamping holds the joint tight while the glue cures; without pressure the bond is weak.', v: { cam: [2.0, 1.0, 2.4], at: [0, 0.4, 0], hi: ['clamp'], show: ['clamp'] } },
        ],
        learn: {
          how: 'A chair is a set of joints, usually round tenons in drilled holes, held by glue. Every time you lean back, the joints flex. When one loosens, the load shifts to the others, so a single loose joint quickly loosens the rest.',
          specs: [['PVA clamp time', '30–60 min'], ['Full cure', '24 hr'], ['Clamp pressure', 'snug, not crushing']],
          terms: [['Tenon', 'The peg on the end of a part that fits into a hole (mortise).'], ['Squeeze-out', 'Excess glue pushed out of the joint.'], ['Hide glue', 'Traditional reversible glue for antiques.']],
          mistakes: ['Driving screws or nails into the joint.', 'Gluing over old glue.', 'Using polyurethane glue that foams and fills gaps without strength.'],
          tips: ['If a tenon is loose even when clean, wrap it in a thin wood shaving or glue-soaked cotton thread before reassembly.'],
        },
        pro: 'The chair is a valuable antique, or a leg or tenon is cracked through.',
      },
      {
        id: 'sticky-drawer',
        title: 'Drawer sticks or drags',
        model: 'dresser',
        level: 1,
        time: '20–40 min',
        cost: '$0–5',
        summary: 'Wooden drawers drag when the runners and drawer bottoms wear or swell. Clean, check for loose parts, and wax the sliding surfaces.',
        intro: { hi: ['drawer', 'runners'] },
        safety: ['Dressers can tip. Remove the heavy contents from upper drawers and anchor tall furniture to the wall.'],
        causes: [['Dry wood-on-wood', 'Friction rises as finish wears off.'], ['Swelling from humidity', 'Common in summer.'], ['Loose drawer joint', 'The box racks out of square.']],
        tools: ['Paraffin or candle wax', 'Fine sandpaper (150)', 'Wood glue (for loose joints)', 'Vacuum'],
        steps: [
          { t: 'Pull the drawer out', d: 'Pull the drawer all the way out and set it on a towel.', why: 'You need to see both the drawer bottom edges and the runners in the case.', v: { cam: [2.4, 1.8, 2.8], at: [0, 0.9, 0.4], hi: ['drawer'], mv: { drawer: [0, 0.2, 1.2] } } },
          { t: 'Find the wear', d: 'Look for shiny or dark rubbed areas on the drawer bottom edges and on the runners.', why: 'Shiny spots show exactly where the wood binds.', v: { cam: [1.6, 0.6, 2.4], at: [0, 1.0, 1.2], hi: ['wear', 'runners'], rt: { drawer: [-20, 0, 0] } } },
          { t: 'Clean and smooth', d: 'Vacuum the case, sand rough spots lightly, and reglue any loose drawer corners.', why: 'Dirt acts like sandpaper, and a racked drawer will always bind no matter how slick it is.', v: { cam: [1.4, 1.2, 1.6], at: [0, 0.75, 0], hi: ['runners'], rt: { drawer: [0, 0, 0] } } },
          { t: 'Wax the sliding surfaces', d: 'Rub paraffin wax onto the runners and the drawer’s bottom edges.', why: 'Wax fills the wood pores with a slick film. Oils and sprays soak in and attract dust.', v: { cam: [1.6, 1.2, 1.8], at: [0.4, 0.6, 0.3], hi: ['wax', 'runners'] } },
          { t: 'Slide it back in', d: 'Reinstall and work the drawer in and out a few times.', why: 'Working it spreads the wax evenly along the runners.', v: { cam: [2.4, 1.6, 2.6], at: [0, 0.7, 0], hi: ['drawer'], mv: { drawer: [0, 0, 0] } } },
        ],
        learn: {
          how: 'Traditional drawers slide wood-on-wood along runners. Wood absorbs moisture and swells across the grain, so a drawer that slid fine in winter can bind in July. Wax reduces friction without soaking into the wood.',
          specs: [['Wood seasonal movement', 'up to ¼″ across a wide board']],
          terms: [['Runner', 'Rail the drawer rides on.'], ['Kicker', 'Rail above a drawer that stops it from tipping down.'], ['Racked', 'Pushed out of square.']],
          mistakes: ['Using WD-40 or cooking oil.', 'Sanding a swollen drawer in humid season (it’ll rattle in winter).'],
          tips: ['A bar of soap works too, but wax lasts longer.'],
        },
        pro: 'The drawer has metal slides that are bent, or the case itself is broken.',
      },
    ],
  });
})();
