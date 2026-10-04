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
        time: '30–60 min',
        cost: '$10–25',
        summary: 'Squeaks come from boards rubbing on nails or the subfloor lifting off a joist. Close the gap from below if you can, or screw down from above with a squeak kit.',
        intro: { hi: ['gap', 'squeak'], xray: true },
        safety: ['Check for pipes, ducts and wires under the squeak before drilling or driving screws.'],
        causes: [['Gap between subfloor and joist', 'Wood shrinks and the floor flexes over the gap.'], ['Loose nails', 'Nails slide in their holes and squeal.'], ['Boards rubbing each other', 'Seasonal movement.']],
        tools: ['Helper to walk on the floor', 'Wood shims & wood glue', '1⅝″ wood screws', 'Drill', 'Squeak-repair kit (for work from above)', 'Flashlight'],
        steps: [
          { t: 'Pinpoint the squeak', d: 'Have someone walk over the spot while you watch from the basement or listen closely.', why: 'The squeak is usually within a foot of a joist, where boards meet the framing.', v: { cam: [1.6, 1.8, 1.8], at: [0, 0.95, 0.3], hi: ['squeak'] } },
          { t: 'Look for the gap from below', d: 'From underneath, shine a light along the joist top to spot a gap between it and the subfloor.', why: 'Where the subfloor isn’t touching the joist, it flexes down and rubs on the nails.', v: { cam: [1.2, 0.3, 1.6], at: [0, 0.75, 0.3], hi: ['gap', 'joists'], xray: true } },
          { t: 'Glue in a shim', d: 'Coat a shim with glue and tap it gently into the gap. Don’t force it, which lifts the floor.', why: 'Gently filling the gap supports the floor without creating a hump above.', v: { cam: [1.2, 0.3, 1.6], at: [0, 0.75, 0.3], hi: ['shim'], show: ['shim'], hide: ['gap'], xray: true } },
          { t: 'Or screw from above', d: 'No basement access? Use a squeak kit: drive its scored screw through the floor into the joist, then snap the head off below the surface.', why: 'The scored screw breaks below the surface so you can fill the hole with wax crayon to match.', v: { cam: [1.4, 1.4, 1.4], at: [0, 0.85, 0.3], hi: ['screw'], show: ['screw'], xray: true } },
          { t: 'Add blocking for wide gaps', d: 'For long gaps, glue and screw a 2×4 cleat along the joist, pressed up tight against the subfloor.', why: 'A cleat supports the whole span; shims only support single points.', v: { cam: [1.4, 0.2, 1.4], at: [0.1, 0.65, 0.3], hi: ['cleat'], show: ['cleat'], xray: true } },
        ],
        learn: {
          how: 'A floor is layers: joists (the beams), a plywood or OSB subfloor nailed on top, then the finish flooring. Wood shrinks as it dries. When a gap opens between subfloor and joist, each step pushes the subfloor down onto the nails. The nails slide up and down in their holes, and that friction is the squeak.',
          specs: [['Joist spacing', '16″ on center'], ['Subfloor thickness', '¾″'], ['Screw for blocking', '1⅝″']],
          terms: [['Joist', 'Horizontal framing beam supporting the floor.'], ['Subfloor', 'Structural sheet layer on top of joists.'], ['Blocking / cleat', 'Short lumber fastened to a joist for support.']],
          mistakes: ['Hammering shims in hard so the floor humps up.', 'Driving screws without knowing what’s under the floor.'],
          tips: ['Talcum powder worked into the seams between hardwood boards quiets board-on-board squeaks.'],
        },
        pro: 'The floor feels bouncy or sags, there are cracks in tile above, or the joists look cracked or damp.',
      },
      {
        id: 'regrout',
        title: 'Crumbling tile grout',
        model: 'tile',
        level: 2,
        time: '3–4 hrs',
        cost: '$20–40',
        summary: 'Cracked or missing grout lets water under tile. Remove the damaged grout to about two-thirds depth and pack in fresh grout.',
        intro: { hi: ['oldGrout'] },
        safety: ['Wear eye protection and a dust mask. Grout dust contains silica.', 'Grout is caustic. Wear gloves.'],
        causes: [['Age and cleaning chemicals', 'Acids erode cement grout.'], ['Floor flex', 'Movement cracks rigid grout.'], ['Poorly mixed original', 'Too much water makes weak grout.']],
        tools: ['Grout saw or oscillating tool with grout blade', 'Sanded grout (joints ≥⅛″)', 'Rubber grout float', 'Buckets and large sponge', 'Shop vacuum', 'Grout sealer'],
        steps: [
          { t: 'Remove old grout', d: 'Saw out grout to at least ⅛″ deep (or ⅔ of the joint), keeping the blade centered in the joint.', why: 'New grout needs depth to lock in. A thin skim over old grout pops out.', v: { cam: [1.1, 1.0, 1.4], at: [0.5, 0, 0.4], hi: ['saw', 'oldGrout'], fx: 'saw' } },
          { t: 'Vacuum the joints', d: 'Vacuum all dust and wipe with a damp sponge.', why: 'Dust stops new grout from bonding to the tile edges.', v: { cam: [1.8, 2.0, 2.0], at: [0, 0, 0], hi: ['tiles'], hide: ['oldGrout', 'saw'] } },
          { t: 'Mix and pack grout', d: 'Mix to peanut-butter thickness. Hold the float at 45° and push grout diagonally across the joints.', why: 'Diagonal passes press grout in without the float edge dragging it back out.', v: { cam: [1.2, 1.4, 1.4], at: [0, 0, 0], hi: ['float', 'newGrout'], show: ['float', 'newGrout'], fx: 'float' } },
          { t: 'Sponge the haze', d: 'After 15–30 minutes, wipe diagonally with a barely damp sponge, rinsing often.', why: 'Too much water weakens grout and pulls it from the joints.', v: { cam: [1.2, 1.4, 1.4], at: [0, 0, 0], hi: ['sponge'], show: ['sponge'], hide: ['float'], fx: 'sponge' } },
          { t: 'Cure, then seal', d: 'Let it cure 48–72 hours, then apply a penetrating sealer to the grout lines.', why: 'Cement grout is porous. Sealer keeps stains and water out.', v: { cam: [1.8, 2.0, 2.0], at: [0, 0, 0], hi: ['newGrout'], hide: ['sponge'] } },
        ],
        learn: {
          how: 'Grout fills the joints between tiles. It locks them together, keeps debris out, and spreads small loads. Cement grout is porous and rigid, so floor movement and harsh cleaners slowly crack and erode it. Once it opens, water gets under the tile and loosens the thinset beneath.',
          specs: [['Sanded grout', 'joints ⅛″ and wider'], ['Unsanded grout', 'joints under ⅛″'], ['Cure before sealing', '48–72 hr']],
          terms: [['Thinset', 'Mortar that bonds tile to the floor.'], ['Haze', 'Thin grout film left on tile faces.'], ['Float', 'Rubber-faced trowel for grouting.']],
          mistakes: ['Grouting over old grout.', 'Soaking the sponge.', 'Grouting where floor meets tub or wall; that joint needs caulk.'],
          tips: ['Mix small batches; grout begins setting in about 30 minutes.'],
        },
        pro: 'Tiles sound hollow when tapped, are cracked, or move underfoot.',
      },
    ],
  });
})();
