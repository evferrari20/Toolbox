/* FNC · Fence & gate */
(function () {
  /* ---- Model: wood fence run with gate ---- */
  TB.model('fence', { cam: [3.6, 2.2, 4.0], at: [0.4, 0.9, 0], hidden: ['brace', 'concrete', 'kit'] }, (K) => {
    K.box(null, [6, 0.04, 3], 'grass', [0, -0.02, 0]);
    const run = K.part('fence', [0, 0, 0], null, 'Fence');
    [-2.4, -1.2].forEach((x) => K.box(run, [0.1, 1.8, 0.1], 'wood', [x, 0.9, 0]));
    K.box(run, [1.3, 0.06, 0.04], 'wood', [-1.8, 0.4, 0.07]);
    K.box(run, [1.3, 0.06, 0.04], 'wood', [-1.8, 1.4, 0.07]);
    K.rep(9, (i) => K.box(run, [0.12, 1.6, 0.02], 'woodLight', [-2.35 + i * 0.137, 0.85, 0.1]));
    // leaning post with its own panel
    const lean = K.part('leanPost', [0.0, 0, 0], null, 'Leaning post');
    K.box(lean, [0.1, 1.8, 0.1], 'wood', [0, 0.9, 0]);
    K.box(lean, [0.1, 0.5, 0.1], K.std(0x5d4a37), [0, 0.15, 0]);
    const panel = K.part('panel', [0, 0, 0], lean, 'Fence panel');
    K.box(panel, [1.2, 0.06, 0.04], 'wood', [-0.6, 0.4, 0.07]);
    K.box(panel, [1.2, 0.06, 0.04], 'wood', [-0.6, 1.4, 0.07]);
    K.rep(8, (i) => K.box(panel, [0.12, 1.6, 0.02], 'woodLight', [-1.12 + i * 0.137, 0.85, 0.1]));
    lean.rotation.z = -0.12;
    const hole = K.part('hole', [0, -0.2, 0], null, 'Dug-out hole');
    K.cyl(hole, [0.25, 0.25, 0.45], K.std(0x5c4630), [0, 0, 0]);
    const conc = K.part('concrete', [0, -0.05, 0], null, 'Fast-setting concrete');
    K.cyl(conc, [0.24, 0.24, 0.12], 'concrete');
    const brace = K.part('brace', [0.6, 0, 0], null, 'Temporary braces');
    K.box(brace, [0.05, 1.5, 0.05], 'woodLight', [-0.35, 0.65, 0], [0, 0, 32]);
    K.box(brace, [0.05, 1.5, 0.05], 'woodLight', [-0.6, 0.65, 0.4], [-32, 0, 0]);
    // gate
    K.box(run, [0.1, 1.8, 0.1], 'wood', [1.3, 0.9, 0]);
    const gate = K.part('gate', [0.08, 0, 0.0], null, 'Gate');
    const gg = K.group(gate, [0, 0, 0]);
    K.box(gg, [1.1, 0.07, 0.04], 'wood', [0.6, 0.35, 0.07]);
    K.box(gg, [1.1, 0.07, 0.04], 'wood', [0.6, 1.4, 0.07]);
    K.box(gg, [0.07, 1.4, 0.04], 'wood', [1.17, 0.88, 0.07]);
    K.box(gg, [0.07, 1.4, 0.04], 'wood', [0.04, 0.88, 0.07]);
    K.rep(8, (i) => K.box(gg, [0.12, 1.5, 0.02], 'woodLight', [0.08 + i * 0.14, 0.88, 0.1]));
    gate.rotation.z = -0.05;
    const hinges = K.part('hinges', [0.08, 0, 0.0], null, 'Gate hinges');
    K.box(hinges, [0.25, 0.05, 0.03], 'dark', [0.05, 0.35, 0.13]);
    K.box(hinges, [0.25, 0.05, 0.03], 'dark', [0.05, 1.4, 0.13]);
    const kit = K.part('kit', [0, 0, 0], gate, 'Anti-sag cable & turnbuckle');
    K.cyl(kit, [0.01, 0.01, 1.55], 'steel', [0.6, 0.88, 0.13], [0, 0, -46]);
    K.box(kit, [0.04, 0.16, 0.04], 'chrome', [0.6, 0.88, 0.14], [0, 0, -46]);
    const latch = K.part('latch', [1.25, 1.1, 0.12], null, 'Latch');
    K.box(latch, [0.15, 0.04, 0.03], 'dark');
    return {};
  });

  TB.category({
    id: 'fence',
    code: 'FNC',
    name: 'Fence & Gate',
    domain: 'exterior',
    blurb: 'Leaning posts and sagging gates',
    repairs: [
      {
        id: 'leaning-post',
        title: 'Leaning fence post',
        model: 'fence',
        level: 3,
        time: '3–4 hrs',
        cost: '$20–50',
        summary: 'A post rotted at ground level, or one set too shallow, lets the panel lean. Dig it out, plumb it, brace it, and set it in fast-setting concrete.',
        intro: { hi: ['leanPost'] },
        safety: ['Call 811 at least 3 days before digging to have buried utility lines marked. It’s free and required by law.', 'Lift with your legs. Wet soil and old concrete are heavy.'],
        causes: [['Rot at the soil line', 'Where air, water and soil meet, rot works fastest.'], ['Shallow footing', 'Less than ⅓ of the post buried.'], ['Frost heave', 'Freezing soil lifts posts unevenly.']],
        tools: ['Post-hole digger & shovel', 'Digging bar', 'Level (post level ideal)', '2×4 braces & screws', 'Fast-setting concrete (2–3 bags)', 'Gravel', 'Replacement 4×4 post if rotted'],
        steps: [
          { t: 'Brace the panels', d: 'Screw temporary 2×4 braces to the panel so it can’t fall while the post is loose.', why: 'Once the footing is out, the panel’s weight will try to pull the post over.', v: { cam: [2.2, 1.8, 3.0], at: [0.2, 0.9, 0], hi: ['brace'], show: ['brace'] } },
          { t: 'Dig around the post', d: 'Dig out the soil and old footing around the post down to its base.', why: 'You need room to plumb the post and pour a new collar of concrete.', v: { cam: [1.6, 1.0, 2.0], at: [0, 0, 0], hi: ['hole'], xray: true } },
          { t: 'Plumb the post', d: 'Push the post upright and check two adjacent faces with a level. Screw the braces to hold it.', why: 'A post can look straight from one side and still lean in the other direction. Check two faces.', v: { cam: [2.0, 1.6, 2.8], at: [0, 0.9, 0], hi: ['leanPost'], rt: { leanPost: [0, 0, 6.9] } } },
          { t: 'Add gravel and concrete', d: 'Put 3″ of gravel in the base, then pour dry fast-setting mix to 3″ below grade and add water per the bag.', why: 'Gravel drains water away from the post end so it doesn’t sit in a cup of water.', v: { cam: [1.6, 1.0, 2.0], at: [0, 0, 0], hi: ['concrete'], show: ['concrete'], xray: true } },
          { t: 'Crown the top and wait', d: 'After it sets, mound soil or concrete so water drains away from the post. Remove braces after 4 hours.', why: 'A sloped top sheds rain away from the wood.', v: { cam: [3.6, 2.2, 4.0], at: [0.4, 0.9, 0], hi: ['leanPost'], hide: ['brace', 'hole'] } },
        ],
        learn: {
          how: 'A post works as a buried lever. Wind on the panel pushes the top, and the buried part resists by pushing against soil. A post needs about one-third of its length underground, and the soil-line zone must stay dry or it rots.',
          specs: [['Burial depth', '⅓ of post length (≥ 2 ft)'], ['Below frost line', 'varies; check local code'], ['Hole diameter', '3× post width'], ['Fast-set concrete', 'sets in 20–40 min']],
          terms: [['Plumb', 'Truly vertical.'], ['Frost heave', 'Soil expansion as it freezes.'], ['811', 'U.S. call-before-you-dig number.']],
          mistakes: ['Skipping 811.', 'Pouring concrete level with the soil (collects water).', 'Setting only one face plumb.'],
          tips: ['Use ground-contact rated posts (UC4A) for anything buried.'],
        },
        pro: 'Several posts are leaning, there’s a slope or retaining wall, or the fence borders a neighbor and the property line is unclear.',
      },
      {
        id: 'gate-sag',
        title: 'Gate sags and drags',
        model: 'fence',
        level: 1,
        time: '30–45 min',
        cost: '$15–25',
        summary: 'A wooden gate sags at the latch corner as it racks out of square. An anti-sag cable and turnbuckle pulls it back up.',
        intro: { hi: ['gate', 'latch'] },
        safety: ['Prop the gate with a block while you work so it doesn’t swing.'],
        causes: [['Racking', 'Gravity pulls the latch corner down.'], ['Loose hinge screws', 'Common in soft or wet wood.'], ['Hinge post leaning', 'Fix the post first if so.']],
        tools: ['Anti-sag gate kit (cable, turnbuckle, brackets)', 'Drill/driver', 'Exterior screws', 'Level', 'Wood block'],
        steps: [
          { t: 'Tighten the hinges', d: 'Tighten every hinge screw. Swap stripped ones for longer exterior screws.', why: 'If the hinges are loose, the cable just pulls the gate off its hinges.', v: { cam: [1.4, 1.4, 1.8], at: [0.2, 0.9, 0.1], hi: ['hinges'] } },
          { t: 'Lift the gate square', d: 'Block up the latch corner until the gate is level along the top.', why: 'Square the gate first, then use the cable to hold it there.', v: { cam: [2.4, 1.6, 3.0], at: [0.7, 0.9, 0], hi: ['gate'], rt: { gate: [0, 0, 2.9] } } },
          { t: 'Install the cable diagonally', d: 'Mount one bracket at the top hinge corner and the other at the bottom latch corner. Connect cable and turnbuckle between them.', why: 'The cable runs from high on the hinge side to low on the latch side, so it holds the latch corner up.', v: { cam: [2.0, 1.4, 2.6], at: [0.7, 0.9, 0.1], hi: ['kit'], show: ['kit'] } },
          { t: 'Tension the turnbuckle', d: 'Remove the block and tighten the turnbuckle until the gate swings freely and the latch catches.', why: 'Small turns go a long way. Over-tightening bows the gate frame.', v: { cam: [3.6, 2.2, 4.0], at: [0.6, 0.9, 0], hi: ['latch', 'kit'] } },
        ],
        learn: {
          how: 'A gate is a rectangle that is only supported along one edge. Gravity pulls the free corner down and turns the rectangle into a parallelogram. A diagonal member stops this: a wood brace pushing up from the bottom hinge corner, or a cable pulling up from the top hinge corner.',
          specs: [['Gap under gate', '2″'], ['Turnbuckle', 'tighten ¼ turn at a time']],
          terms: [['Racking', 'Rectangle distorting into a parallelogram.'], ['Turnbuckle', 'Threaded tensioner that shortens a cable.'], ['Compression brace', 'Wood diagonal from bottom hinge to top latch.']],
          mistakes: ['Installing the cable in the wrong diagonal.', 'Fixing the gate while the hinge post leans.'],
          tips: ['Re-tension seasonally; wood moves.'],
        },
        pro: 'The hinge post is loose or rotted, or the gate is metal with broken welds.',
      },
    ],
  });
})();
