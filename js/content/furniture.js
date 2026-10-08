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
        summary: 'A wobble means a joint’s glue has failed. Screws, nails and glue squirted into the crack make it worse. Take the loose joint apart, scrape off the old glue, then reglue it and clamp it overnight.',
        intro: { hi: ['joint', 'looseLeg'] },
        safety: ['Don’t sit on the chair until the glue has cured fully, typically 24 hours.', 'Wear safety glasses when knocking joints apart; old dowels can snap and fly.', 'Old chairs may have been finished with lead paint. Scrape, don’t sand, and wipe dust with a damp rag.'],
        causes: [['Failed glue joint', 'Wood shrinks and swells with humidity until old glue lets go.'], ['Loose stretcher', 'The rungs between the legs work loose and the legs splay.'], ['Leaning back on two legs', 'Huge leverage on the rear leg joints.'], ['Uneven floor', 'Rule this out first on a known-flat surface.']],
        tools: ['Rubber or dead-blow mallet', 'Wood glue (PVA such as Titebond; liquid hide glue for antiques)', 'Strap (band) clamp or ratchet strap', 'Small chisel or card scraper', 'Masking tape and a marker (to label parts)', 'Damp rag', 'Scrap wood block (to protect the wood)', 'Thin wood shavings or veneer (if a joint is sloppy)'],
        steps: [
          { t: 'Find the loose joint', d: 'Set the chair on a flat floor and rock it to confirm the wobble isn’t the floor. Then flip it upside down on a towel and flex each leg and rung by hand. Watch for a joint that moves or a gap that opens and closes, and mark each loose one with tape.', why: 'Usually one or two joints are loose. Find all of them before gluing so you only clamp once.', tip: 'A thin line of dirt or a crack in the finish around a joint is a giveaway. Squeeze the joint while rocking; a loose one clicks.', ok: 'Every joint that moves has a tape label, and the solid joints don’t budge at all when you push on them.', v: { cam: [1.6, 1.4, 1.6], at: [0.38, 0.7, 0.36], hi: ['joint'] } },
          { t: 'Knock the joint apart', d: 'Hold a scrap block against the part and tap it with the mallet to work the loose joint apart, a little at a time. Label each piece with tape (for example “front left leg”) so you can put it back the same way. Don’t force joints that are still tight.', why: 'Glue bonds to bare wood, not to old glue. The joint has to come apart to be cleaned properly.', tip: 'Joint won’t come apart but still moves? Leave the tight joints alone and use a syringe to inject glue into the loose one, then clamp. It’s a second-best fix but beats breaking a good joint.', ok: 'The loose parts are out, labeled, and nothing has cracked or splintered.', v: { cam: [1.6, 1.0, 1.8], at: [0.38, 0.4, 0.36], hi: ['looseLeg'], mv: { looseLeg: [0.15, -0.35, 0.15] }, rt: { looseLeg: [10, 0, -10] } } },
          { t: 'Scrape off old glue', d: 'Scrape the tenon (the peg on the end of the part) and the inside of the socket down to clean bare wood with a chisel or scraper. Don’t sand the tenon thinner. Test-fit the parts dry.', why: 'New PVA (yellow wood glue) won’t stick to old cured glue, and removing wood makes the joint loose.', tip: 'Old hide glue softens with warm water or vinegar on a rag in a few minutes. If the dry fit is sloppy, glue a thin wood shaving to the tenon and let it dry before the final glue-up.', ok: 'Both parts show bare wood, and the dry fit slides together snugly with hand pressure.', v: { cam: [1.4, 0.9, 1.4], at: [0.45, 0.6, 0.45], hi: ['joint', 'looseLeg'] } },
          { t: 'Glue and reassemble', d: 'Brush a thin, even coat of glue on the tenon and inside the socket. Push the joint home and tap it fully seated with the mallet and scrap block. You have about 5 minutes before the glue starts to grab.', why: 'A thin coat on both parts beats a thick coat on one; excess just squeezes out and starves nothing.', tip: 'Do a full dry run of the clamp first so you’re not hunting for it with glue on your hands. Use a cotton swab to coat deep sockets.', ok: 'The joint is fully seated with no gap at the shoulder, and a small bead of glue squeezes out all around.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.6, 0], hi: ['looseLeg', 'joint'], mv: { looseLeg: [0, 0, 0] }, rt: { looseLeg: [0, 0, 0] } } },
          { t: 'Clamp overnight', d: 'Wrap a strap clamp around the legs at the height of the joint and tighten until the joints close, then stop. Check that the chair sits flat on the floor while clamped. Wipe squeeze-out with a damp rag and leave it for 24 hours.', why: 'Clamping holds the joint tight while the glue cures; without pressure the bond is weak.', tip: 'If one leg lifts off the floor while clamped, the chair is twisted. Loosen, push the high corner down and re-tighten. No strap clamp? A ratchet tie-down strap with padding works.', ok: 'The chair sits on all four legs, the joint lines are closed tight, and the clamp is snug but not crushing the wood.', v: { cam: [2.0, 1.0, 2.4], at: [0, 0.4, 0], hi: ['clamp'], show: ['clamp'] } },
        ],
        tricks: [
          ['Wrong glue rescue', 'If someone already squirted polyurethane or epoxy into the joint, you must scrape or pare it all off; it won’t release with water.'],
          ['Antiques use hide glue', 'Hide glue can be undone later with heat and water, so future repairs won’t damage the chair. Restorers prefer it.'],
          ['Felt glides', 'Add felt pads under the legs. Dragging chairs loosens joints faster than sitting on them.'],
          ['Leg length fix', 'If the chair still rocks after gluing, trim the long leg a little at a time with sandpaper on a flat board, not a saw.'],
          ['Swelling liquids don’t last', 'Products that swell wood fibers are a short-term fix only; regluing is the real repair.'],
          ['Do the set', 'If one chair in a set is loose, the others are close behind. Check them all while your clamps are out.'],
        ],
        refs: [
          ['Wood glue choices and clamp times (Titebond, Franklin International)', 'https://www.titebond.com/'],
          ['Woodworking and furniture repair techniques (Fine Woodworking)', 'https://www.finewoodworking.com/'],
          ['Furniture repair and refinishing (Wood Magazine)', 'https://www.woodmagazine.com/'],
        ],
        learn: {
          how: 'A chair is a set of joints, usually round tenons in drilled holes, held by glue. Every time you lean back, the joints flex. When one loosens, the load shifts to the others, so a single loose joint quickly loosens the rest.',
          specs: [['PVA open time', '≈ 5 min'], ['PVA clamp time', '30–60 min (overnight is better)'], ['Full cure', '24 hr'], ['Clamp pressure', 'Snug until joints close, not crushing']],
          terms: [['Tenon', 'The peg on the end of a part that fits into a hole (mortise or socket).'], ['Squeeze-out', 'Excess glue pushed out of the joint.'], ['Hide glue', 'Traditional reversible glue for antiques.'], ['Stretcher', 'The rung connecting two legs.']],
          mistakes: ['Driving screws or nails into the joint.', 'Gluing over old glue.', 'Using polyurethane glue that foams and fills gaps without strength.', 'Sitting on it before the glue cures.'],
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
        summary: 'Wooden drawers drag when the runners and drawer bottoms wear or swell. Clean, check for loose parts, and rub wax on the sliding surfaces.',
        intro: { hi: ['drawer', 'runners'] },
        safety: ['Dressers can tip over and crush a child. Empty the upper drawers before pulling them out, and anchor tall furniture to the wall with a tip-over kit.'],
        causes: [['Dry wood-on-wood', 'Friction rises as finish wears off.'], ['Swelling from humidity', 'Common in summer.'], ['Loose drawer joint', 'The box racks (twists) out of square.'], ['Worn or broken runner', 'A grooved or loose runner lets the drawer drop and drag.']],
        tools: ['Paraffin wax block or a plain white candle', 'Fine sandpaper (150–220 grit)', 'Wood glue and a small clamp (for loose joints)', 'Vacuum with crevice tool', 'Flashlight', 'Towel'],
        steps: [
          { t: 'Pull the drawer out', d: 'Empty the drawer, then pull it out all the way. Most wooden drawers lift out once they reach the stop; tilt the front up slightly if it catches. Set it upside down on a towel.', why: 'You need to see both the drawer bottom edges and the runners in the case.', tip: 'Drawer won’t come out? Look for a small wooden stop or a turn button on the back of the drawer or the runner, and rotate it.', ok: 'The drawer is out, empty, and resting on a towel with its bottom facing up.', v: { cam: [2.4, 1.8, 2.8], at: [0, 0.9, 0.4], hi: ['drawer'], mv: { drawer: [0, 0.2, 1.2] } } },
          { t: 'Find the wear', d: 'Shine a flashlight along the drawer’s bottom edges and side faces, and on the runners and guides inside the case. Look for shiny, dark or rubbed spots, raised splinters and any loose screws or nails.', why: 'Shiny spots show exactly where the wood binds, so you only work there.', tip: 'Rub chalk on the drawer sides and slide it in and out once. The chalk wipes off exactly where it rubs.', ok: 'You’ve found the rubbing spots, and you know whether anything is loose or broken.', v: { cam: [1.6, 0.6, 2.4], at: [0, 1.0, 1.2], hi: ['wear', 'runners'], rt: { drawer: [-20, 0, 0] } } },
          { t: 'Clean and smooth', d: 'Vacuum the case and wipe the runners. Lightly sand only the shiny rub spots and any rough splinters with 150–220 grit. If a drawer corner is loose, work glue into the joint, clamp it square and let it dry.', why: 'Dirt acts like sandpaper, and a racked drawer will always bind no matter how slick it is.', tip: 'Check a reglued drawer for square by measuring both diagonals; equal numbers mean it’s square. Push the long diagonal corner in until they match before the glue sets.', ok: 'The rub spots feel smooth, the case is clean, and the drawer box doesn’t twist when you push on opposite corners.', v: { cam: [1.4, 1.2, 1.6], at: [0, 0.75, 0], hi: ['runners'], rt: { drawer: [0, 0, 0] } } },
          { t: 'Wax the sliding surfaces', d: 'Rub paraffin wax firmly onto the runners, the drawer’s bottom edges and anywhere it rubbed, until you see a light, slick film. Don’t use oil or spray lubricants.', why: 'Wax fills the wood pores with a slick film that stays put. Oils soak in, swell the wood and collect dust.', tip: 'For a smoother film, warm the wax with a hair dryer as you rub it in, then buff with a rag.', ok: 'The rubbed surfaces look slightly glossy and feel slippery to your fingertip.', v: { cam: [1.6, 1.2, 1.8], at: [0.4, 0.6, 0.3], hi: ['wax', 'runners'] } },
          { t: 'Slide it back in', d: 'Reinstall the drawer and work it in and out 10 times. Load it with its usual contents and test again.', why: 'Working it spreads the wax evenly along the runners.', tip: 'Still tight in humid weather? Sand a little more off the tight spot only, then reseal it with a coat of wax. Avoid removing much; it will rattle in winter.', ok: 'The drawer glides in and out with one hand and closes fully without a thump or a stall.', v: { cam: [2.4, 1.6, 2.6], at: [0, 0.7, 0], hi: ['drawer'], mv: { drawer: [0, 0, 0] } } },
        ],
        tricks: [
          ['Seal the bare wood', 'Unfinished drawer parts swell most. A thin coat of shellac or wax on the inside faces reduces seasonal sticking.'],
          ['Nylon glide tape', 'Stick-on UHMW (super-slick plastic) tape on worn runners makes old drawers slide like new.'],
          ['Worn runner', 'If a runner is grooved deeply, glue a thin hardwood strip on top to rebuild it.'],
          ['Anchor it', 'While the drawers are out, install an anti-tip strap to a wall stud. It takes 10 minutes.'],
          ['Soap works', 'A dry bar of soap works if you have no wax, but wax lasts longer.'],
        ],
        refs: [
          ['Anchor It: furniture tip-over prevention (U.S. Consumer Product Safety Commission)', 'https://www.anchorit.gov/'],
          ['Furniture repair techniques (Fine Woodworking)', 'https://www.finewoodworking.com/'],
          ['Furniture repair and maintenance (Wood Magazine)', 'https://www.woodmagazine.com/'],
        ],
        learn: {
          how: 'Traditional drawers slide wood-on-wood along runners. Wood absorbs moisture and swells across the grain, so a drawer that slid fine in winter can bind in July. Wax reduces friction without soaking into the wood.',
          specs: [['Wood seasonal movement', 'Up to ¼″ across a wide board'], ['Sandpaper', '150–220 grit, rub spots only'], ['Square check', 'Diagonals equal within 1⁄16″']],
          terms: [['Runner', 'Rail the drawer rides on.'], ['Kicker', 'Rail above a drawer that stops it from tipping down.'], ['Racked', 'Pushed out of square.']],
          mistakes: ['Using WD-40 or cooking oil.', 'Sanding a swollen drawer a lot in humid season (it’ll rattle in winter).', 'Pulling heavy drawers out of an unanchored dresser.'],
          tips: ['A bar of soap works too, but wax lasts longer.'],
        },
        pro: 'The drawer has metal slides that are bent, or the case itself is broken or coming apart.',
      },
    ],
  });
})();
