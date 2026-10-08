/* FLR · Floors & tile */
(function () {
  /* ---- Model: floor cut-away with joists, subfloor and hardwood ---- */
  TB.model('joists', { cam: [2.8, 1.2, 2.8], at: [0, 0.7, 0], hidden: ['shim', 'screw', 'cleat'] }, (K) => {
    const joists = K.part('joists', [0, 0, 0], null, 'Floor joists');
    [-0.8, 0, 0.8].forEach((x) => K.box(joists, [0.12, 0.6, 2.4], 'woodLight', [x, 0.5, 0]));
    const gap = K.part('gap', [0.0, 0.81, 0.3], null, 'Gap above joist');
    K.box(gap, [0.14, 0.02, 0.5], 'red');
    const sub = K.part('subfloor', [0, 0, 0], null, 'Subfloor (plywood)');
    K.box(sub, [2.2, 0.06, 2.4], K.std(0xc9a46e), [0, 0.86, 0]);
    const fin = K.part('finish', [0, 0, 0], null, 'Hardwood flooring');
    K.rep(11, (i) => K.box(fin, [2.2, 0.06, 0.2], i % 2 ? 'wood' : 'woodDark', [0, 0.925, -1.0 + i * 0.205]));
    const sq = K.part('squeak', [0, 0.96, 0.3], null, 'Squeak spot');
    K.cyl(sq, [0.12, 0.12, 0.005], K.std(0xf2c84b, { transparent: true, opacity: 0.6 }));
    const shim = K.part('shim', [-0.07, 0.81, 0.3], null, 'Glued shim');
    K.box(shim, [0.02, 0.02, 0.4], 'woodLight');
    const screw = K.part('screw', [0.0, 0.85, 0.3], null, 'Squeak-repair screw');
    K.cyl(screw, [0.01, 0.01, 0.4], 'steel');
    const cleat = K.part('cleat', [0.15, 0.6, 0.3], null, 'Blocking / cleat');
    K.box(cleat, [0.15, 0.3, 0.6], 'woodLight');
    return {};
  });

  /* ---- Model: tile floor with grout joints ---- */
  TB.model('tile', { cam: [1.8, 2.0, 2.0], at: [0, 0, 0], hidden: ['newGrout', 'float', 'sponge'] }, (K) => {
    K.box(null, [2.4, 0.04, 2.4], 'concrete', [0, -0.02, 0]);
    const tiles = K.part('tiles', [0, 0, 0], null, 'Tiles');
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) K.box(tiles, [0.42, 0.04, 0.42], i % 2 === j % 2 ? K.std(0xcbc3b5) : K.std(0xb9b1a3), [-0.9 + i * 0.45, 0.02, -0.9 + j * 0.45]);
    const grout = K.part('oldGrout', [0, 0, 0], null, 'Cracked grout');
    for (let i = 0; i < 4; i++) {
      K.box(grout, [0.03, 0.03, 2.2], K.std(0x6f675b), [-0.675 + i * 0.45, 0.015, 0]);
      K.box(grout, [2.2, 0.03, 0.03], K.std(0x6f675b), [0, 0.015, -0.675 + i * 0.45]);
    }
    const ng = K.part('newGrout', [0, 0, 0], null, 'Fresh grout');
    for (let i = 0; i < 4; i++) {
      K.box(ng, [0.03, 0.038, 2.2], 'lightgrey', [-0.675 + i * 0.45, 0.02, 0]);
      K.box(ng, [2.2, 0.038, 0.03], 'lightgrey', [0, 0.02, -0.675 + i * 0.45]);
    }
    const saw = K.part('saw', [0.6, 0.12, 0.5], null, 'Grout saw');
    K.box(saw, [0.05, 0.04, 0.2], 'steel', [0, -0.05, 0]);
    K.box(saw, [0.06, 0.08, 0.3], 'orange', [0, 0.02, 0.24]);
    const fl = K.part('float', [0.0, 0.1, 0.2], null, 'Rubber grout float');
    K.box(fl, [0.3, 0.04, 0.16], 'rubber', [0, 0, 0], [0, 0, 30]);
    K.box(fl, [0.18, 0.08, 0.04], 'yellow', [0.02, 0.06, 0], [0, 0, 30]);
    const sp = K.part('sponge', [0.3, 0.06, -0.3], null, 'Damp sponge');
    K.box(sp, [0.2, 0.08, 0.13], 'yellow');
    return {
      tick(t, fx) {
        if (fx === 'saw') K.parts.saw.position.z = 0.4 + 0.15 * Math.sin(t * 8);
        if (fx === 'float') K.parts.float.position.x = 0.3 * Math.sin(t * 2);
        if (fx === 'sponge') K.parts.sponge.position.x = 0.3 + 0.3 * Math.sin(t * 2);
      },
    };
  });

  TB.category({
    id: 'floors',
    code: 'FLR',
    name: 'Floors & Tile',
    domain: 'interior',
    blurb: 'Squeaks and crumbling grout',
    repairs: [
      {
        id: 'squeaky-floor',
        title: 'Squeaky floor',
        model: 'joists',
        level: 2,
        time: '30–90 min',
        cost: '$10–25',
        summary: 'Most squeaks come from the subfloor (the plywood layer under your flooring) lifting off a joist and rubbing on nails. From a basement, glue thin shims or a wood block into the gap. With no access below, screw down from above with a squeak-repair kit.',
        intro: { hi: ['gap', 'squeak'], xray: true },
        safety: ['Before drilling or screwing, look under the spot (or check plans) for pipes, ducts, gas lines and wires. Never screw up through the subfloor from below with screws long enough to poke through your finish floor.', 'Wear safety glasses when working overhead; dust and grit fall in your eyes.', 'Use a sturdy step ladder in the basement, not a bucket.'],
        causes: [['Gap between subfloor and joist', 'Lumber shrinks as it dries, and the floor flexes down over the gap with each step.'], ['Loose nails', 'Nails slide in their holes and squeal against the wood.'], ['Boards rubbing each other', 'Hardwood strips grind against their neighbors as seasons change.'], ['Unsupported subfloor seam', 'Two plywood edges between joists flex against each other.']],
        tools: ['Helper to walk on the floor', 'Bright flashlight', 'Tapered wood shims (cedar shingles work)', 'Construction adhesive (subfloor type) or wood glue', 'Caulk gun', 'Drill/driver', '2½–3″ construction screws (for wood blocks)', '2×4 or 2×6 scrap for blocking', 'Squeak-repair kit with breakaway screws (for work from above)', 'Hammer and tape measure'],
        steps: [
          { t: 'Pinpoint the squeak', d: 'Have a helper walk slowly back and forth over the noisy spot while you listen and watch from the basement, or kneel near the spot upstairs. Mark it with painter’s tape, then measure its distance from a wall you can find from below, like a heat duct or a pipe that comes through the floor.', why: 'The squeak is usually within a few inches of a joist (the big beams under the floor), where the subfloor meets the framing.', tip: 'From below, have your helper rock on one foot on the squeak. You can often see the subfloor bob down, or a nail tip move, right at the problem.', ok: 'You can see or hear exactly where the floor moves, and you’ve marked it both upstairs and in the basement.', v: { cam: [1.6, 1.8, 1.8], at: [0, 0.95, 0.3], hi: ['squeak'] } },
          { t: 'Look for the gap from below', d: 'From underneath, shine a light along the top of the joist under the squeak. Look for a dark line of daylight or shadow between the joist and the plywood above, or a gap you can slide a putty knife into. Check it while your helper steps on the spot.', why: 'Where the subfloor isn’t touching the joist, it flexes down with each step and rubs on the nails. Closing that gap stops the motion.', tip: 'Gap you can’t see? Lightly press a thin putty knife along the joist top. It slides in where there’s a gap and stops where the wood is tight.', ok: 'You can point to a gap (often 1⁄16–⅛″) along the joist top that opens and closes as your helper steps.', v: { cam: [1.2, 0.3, 1.6], at: [0, 0.75, 0.3], hi: ['gap', 'joists'], xray: true } },
          { t: 'Glue in a shim', d: 'Coat a thin wood shim with construction adhesive or wood glue and slide it into the gap by hand. Then tap it gently with a hammer until it’s just snug, about the same pressure as pushing a drawer shut. Use a few shims along the gap if it’s long. Let the glue cure overnight.', why: 'A snug shim supports the subfloor so it can’t drop and rub. Forcing it lifts the floor and creates a hump or a brand-new squeak.', tip: 'Have your helper stand on the spot while you tap. When the shim stops moving with light taps, it’s tight enough. If you go too far, pull it back with pliers and use a thinner one.', ok: 'The shim is snug, and when your helper steps on the spot, the floor feels solid and the squeak is gone.', v: { cam: [1.2, 0.3, 1.6], at: [0, 0.75, 0.3], hi: ['shim'], show: ['shim'], hide: ['gap'], xray: true } },
          { t: 'Or screw from above', d: 'No access below? Use a squeak-repair kit: find the joist with a stud finder, drive the kit’s scored screw through the carpet or floor into the joist using its depth jig, then snap the head off with the tool so it breaks below the surface. Fill the small hole in hardwood with matching wax filler.', why: 'The screw pulls the floor tight to the joist, and the scored shank breaks below the surface so nothing shows.', tip: 'Miss the joist? You’ll feel the screw drive too easily and not pull down. Try ¾″ to the side. Kits for carpet and for hardwood are different, so buy the right one.', ok: 'The screw pulls the floor down snugly, the head breaks off below the surface, and stepping on the spot is silent.', v: { cam: [1.4, 1.4, 1.4], at: [0, 0.85, 0.3], hi: ['screw'], show: ['screw'], xray: true } },
          { t: 'Add blocking for long gaps', d: 'For a gap longer than about a foot, or a sagging seam, cut a 2×4 or 2×6 block. Lay a thick bead of construction adhesive on its top edge, push it up tight against the subfloor alongside the joist, and screw it to the joist with 2½–3″ screws every 8–12″.', why: 'A glued block supports the whole length of the gap; shims only support single points. The adhesive bonds the subfloor to the block so it can’t move.', tip: 'Push up hard while you drive the first screw, or have a helper press the block up with a short board. Don’t screw up through the block into the subfloor; the screw can poke through your flooring.', ok: 'The block sits tight against the subfloor with adhesive squeezing out along its whole top edge, and the floor above feels stiff.', v: { cam: [1.4, 0.2, 1.4], at: [0.1, 0.65, 0.3], hi: ['cleat'], show: ['cleat'], xray: true } },
        ],
        tricks: [
          ['Board-on-board squeaks', 'Hardwood strips rubbing each other? Sprinkle talcum powder or powdered graphite on the seams and work it in with a soft brush.'],
          ['Wait for summer', 'Many squeaks are worst in dry winter. Fix them then, while they’re easy to find.'],
          ['Subfloor seams', 'If the squeak is between joists at a plywood seam, glue and screw a 2×6 block across the joint between the joists.'],
          ['Measure twice from below', 'Use a heat register, toilet drain or wall as a landmark to transfer the squeak location to the basement.'],
          ['Know your flooring', 'Never screw through tile from above. A squeak under tile is a structural issue; fix it from below or call a pro.'],
          ['Metal brackets', 'Squeak-stopping brackets screwed to the joist and subfloor from below are an easy option when you have lots of squeaks along one joist.'],
        ],
        refs: [
          ['Fix Squeaky Subfloor With Extra Blocking (Fine Homebuilding)', 'https://www.finehomebuilding.com/project-guides/framing/fix-squeaky-subfloor-with-extra-blocking'],
          ['Squeaky Subfloor Fix (Fine Homebuilding)', 'https://finehomebuilding.com/1987/11/01/squeaky-subfloor-fix'],
          ['Squeaky Floors: Give ’Em the Silent Treatment (HomeServe)', 'https://www.homeserve.com/en-us/blog/how-to/fix-squeaky-floors'],
        ],
        learn: {
          how: 'A floor is layers: joists (the beams), a plywood or OSB subfloor nailed on top, then the finish flooring. Wood shrinks as it dries. When a gap opens between subfloor and joist, each step pushes the subfloor down onto the nails. The nails slide up and down in their holes, and that friction is the squeak. Every fix closes the gap so nothing moves.',
          specs: [['Joist spacing', '16″ on center (sometimes 12″ or 24″)'], ['Subfloor thickness', '¾″ (⅝″ in older homes)'], ['Block screws', '2½–3″ into the joist, every 8–12″'], ['Shim pressure', 'Hand-snug plus light taps']],
          terms: [['Joist', 'Horizontal framing beam supporting the floor.'], ['Subfloor', 'Structural sheet layer on top of joists.'], ['Blocking / cleat', 'Short lumber fastened to a joist for support.'], ['OSB', 'Oriented strand board, a panel made of glued wood chips.']],
          mistakes: ['Hammering shims in hard so the floor humps up.', 'Driving screws without knowing what’s under the floor.', 'Screwing up from below with screws long enough to pierce the floor above.'],
          tips: ['Talcum powder worked into the seams between hardwood boards quiets board-on-board squeaks.'],
        },
        pro: 'The floor feels bouncy or sags, tile above is cracking, the joists look cracked, notched or damp, or the squeaks are everywhere.',
      },
      {
        id: 'regrout',
        title: 'Crumbling tile grout',
        model: 'tile',
        level: 2,
        time: '3–5 hrs + cure',
        cost: '$20–40',
        summary: 'Cracked or missing grout lets water under tile. Rake out the damaged grout to at least two-thirds of the joint depth, vacuum, pack in fresh grout, clean the haze and let it cure before sealing.',
        intro: { hi: ['oldGrout'] },
        safety: ['Wear safety glasses and an N95 dust mask. Grout dust contains crystalline silica, which harms lungs.', 'Fresh grout is caustic (it can burn skin). Wear rubber or nitrile gloves.', 'An oscillating tool can chip tile edges in a blink. Practice on a hidden joint first.'],
        causes: [['Age and harsh cleaners', 'Acid and bleach cleaners slowly erode cement grout.'], ['Floor flex', 'Movement cracks rigid grout, often in a line.'], ['Weak original mix', 'Too much water makes powdery grout.'], ['Change-of-plane joints', 'Grout where the floor meets a wall or tub cracks because the joint moves; it needs caulk instead.']],
        tools: ['Carbide grout saw or oscillating tool with a carbide grout blade', 'Shop vacuum with brush attachment', 'Sanded grout for joints ⅛″ and wider (unsanded below ⅛″)', 'Margin trowel and clean bucket', 'Rubber grout float', 'Two buckets and a large grout sponge', 'Microfiber cloth or cheesecloth', 'Penetrating grout sealer + small brush', 'Gloves, safety glasses, N95 mask', 'Matching color caulk for corners and edges'],
        steps: [
          { t: 'Remove old grout', d: 'Hold the grout saw like a pencil and stroke it back and forth along the center of each joint. Remove at least two-thirds of the joint depth (at least ⅛″) so you see clean tile edges. Work slowly at corners and near the tile faces.', why: 'New grout needs depth to lock in. A thin skim over old grout pops out within weeks.', tip: 'Using an oscillating tool? Brace your hand on the floor and let the blade do the work at low speed. If it skips toward a tile, stop and switch to the hand saw for that joint.', ok: 'Every joint is evenly deep, with clean, straight tile edges and no chipped corners.', v: { cam: [1.1, 1.0, 1.4], at: [0.5, 0, 0.4], hi: ['saw', 'oldGrout'], fx: 'saw' } },
          { t: 'Vacuum the joints', d: 'Vacuum all dust and loose bits from every joint with a brush attachment. Then wipe the tiles and joints with a damp (not wet) sponge.', why: 'Dust stops new grout from bonding to the tile edges, and dry tile pulls water out of fresh grout too fast.', tip: 'Run an old toothbrush through the joints before vacuuming to loosen stubborn crumbs.', ok: 'Joints look clean and slightly darker from the damp wipe, with no standing water or dust.', v: { cam: [1.8, 2.0, 2.0], at: [0, 0, 0], hi: ['tiles'], hide: ['oldGrout', 'saw'] } },
          { t: 'Mix and pack grout', d: 'Pour cool water into a bucket, then add grout powder and mix with a margin trowel to a smooth, peanut-butter thickness. Let it rest (slake) 5 minutes, then stir again. Scoop some onto the tile, hold the float at 45° and push the grout diagonally across the joints, pressing it in hard. Scrape off the excess with the float edge held nearly upright.', why: 'Diagonal passes press grout in without the float edge dragging it back out of the joints. The rest lets the chemicals fully wet before you use it.', tip: 'Mix only what you can use in about 30 minutes and never add more water once it starts stiffening; that makes weak, blotchy grout. Low spot? Press more in now, before cleanup.', ok: 'Joints are filled flush with the tile edges, with no pinholes or low spots when you look across the floor.', v: { cam: [1.2, 1.4, 1.4], at: [0, 0, 0], hi: ['float', 'newGrout'], show: ['float', 'newGrout'], fx: 'float' } },
          { t: 'Sponge the haze', d: 'Wait until the grout is firm when pressed lightly with a fingertip, usually 15–30 minutes. Wring the sponge out until it’s barely damp and wipe diagonally in light passes, rinsing often in a clean water bucket. After a few hours, buff the dry haze (cloudy film) off with a microfiber cloth.', why: 'Too much water weakens the surface and washes grout out of the joints. Diagonal strokes don’t dig into the joints.', tip: 'Use a two-bucket system: one to rinse, one clean for the final wipe. Use the sponge’s flat face and flip it after each stroke.', ok: 'Tile faces are clean with only a light haze, and the grout lines are smooth, even and slightly below the tile edges.', v: { cam: [1.2, 1.4, 1.4], at: [0, 0, 0], hi: ['sponge'], show: ['sponge'], hide: ['float'], fx: 'sponge' } },
          { t: 'Cure, then seal', d: 'Keep foot traffic off for at least 16–24 hours. After the grout cures (check the bag, typically 48–72 hours), brush a penetrating sealer onto the grout lines and wipe any off the tile after 5–10 minutes. Caulk corners and edges with color-matched caulk.', why: 'Cement grout is porous like a sponge. Sealer keeps stains and water out.', tip: 'Test the seal: drip water on a grout line. If it darkens within a minute, add a second coat. Some premixed or urethane grouts need no sealer; read the label.', ok: 'Water drops bead up on the grout instead of soaking in and darkening it.', v: { cam: [1.8, 2.0, 2.0], at: [0, 0, 0], hi: ['newGrout'], hide: ['sponge'] } },
        ],
        tricks: [
          ['Small batches', 'Mix grout in small batches; it begins to stiffen in about 30 minutes, and you can’t revive it with water.'],
          ['Work in sections', 'Grout and clean about a 3 × 3 ft area at a time, so nothing dries before you wipe it.'],
          ['Color match', 'Take a chunk of old grout to the store, and compare dry samples; wet grout looks much darker.'],
          ['Skip the sealer', 'Premixed urethane or single-component grouts cost more but never need sealing and resist stains.'],
          ['Corners get caulk', 'Where the floor meets a tub, wall or cabinet, use color-matched caulk instead of grout. That joint moves and grout will crack.'],
          ['Haze remover', 'Stubborn haze after a few days? Use a grout haze remover made for cement grout, following the label wait time.'],
          ['Protect the tub', 'Lay painter’s tape over tub edges and fixtures before you start, to prevent scratches from the saw and float.'],
        ],
        refs: [
          ['Polyblend Plus Sanded Grout technical data (Custom Building Products)', 'https://www.custombuildingproducts.com/wp-content/uploads/TDS-360-Polyblend-Plus-TDS-English.pdf'],
          ['Polyblend Grout Instructions (Hunker)', 'https://www.hunker.com/13401500/polyblend-grout-instructions/'],
          ['How to Mix Grout (Bob Vila)', 'https://www.bobvila.com/articles/how-to-mix-grout.md'],
          ['Polyblend HP Fine Aggregate Grout data (Custom Building Products)', 'https://www.custombuildingproducts.com/wp-content/uploads/Polyblend-HP-High-Performance-Fine-Aggregate-Grout-8-14-26.pdf'],
        ],
        learn: {
          how: 'Grout fills the joints between tiles. It locks them together, keeps debris out and spreads small loads. Cement grout is porous and rigid, so floor movement and harsh cleaners slowly crack and erode it. Once it opens, water gets under the tile and loosens the thinset (the mortar glue) beneath.',
          specs: [['Sanded grout', 'Joints ⅛–½″'], ['Unsanded grout', 'Joints under ⅛″'], ['Removal depth', '≥ ⅔ of joint depth'], ['Slake (rest) time', '≈ 5 min, then remix'], ['Initial cleanup', 'When firm, ≈ 15–30 min'], ['Light foot traffic', 'After ≈ 16–24 hr'], ['Seal after', '≈ 48–72 hr (check bag)']],
          terms: [['Thinset', 'Mortar that bonds tile to the floor.'], ['Haze', 'Thin grout film left on tile faces.'], ['Float', 'Rubber-faced trowel for grouting.'], ['Slake', 'Letting mixed grout rest so the chemicals fully absorb water.']],
          mistakes: ['Grouting over old grout.', 'Soaking the sponge, which washes out grout and leaves it weak.', 'Grouting where the floor meets a tub or wall; that joint needs caulk.', 'Sealing too soon, before the grout cures.'],
          tips: ['Mix small batches; grout begins setting in about 30 minutes.'],
        },
        pro: 'Tiles sound hollow when tapped, are cracked, move underfoot, or the grout keeps cracking in the same line (a sign the floor below is flexing).',
      },
    ],
  });
})();
