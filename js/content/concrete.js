/* CON · Driveway & concrete */
(function () {
  /* ---- Model: concrete slab with crack and control joint ---- */
  TB.model('slab', { cam: [2.2, 2.2, 2.6], at: [0, 0, 0], hidden: ['backer', 'filler', 'gun'] }, (K) => {
    K.box(null, [4, 0.04, 3], 'grass', [0, -0.12, 0]);
    const s = K.part('slab', [0, 0, 0], null, 'Concrete slab');
    K.box(s, [1.7, 0.16, 2.4], 'concrete', [-0.9, -0.06, 0]);
    K.box(s, [1.7, 0.16, 2.4], 'concrete', [0.9, -0.06, 0]);
    const joint = K.part('joint', [0, 0.0, 0], null, 'Control joint');
    K.box(joint, [0.06, 0.03, 2.4], 'dark', [0, 0.005, 0]);
    // jagged crack across the left slab, drawn as segments
    const crack = K.part('crack', [0, 0.021, 0], null, 'Crack');
    const pts = [[-1.7, 0.4], [-1.4, 0.25], [-1.15, 0.38], [-0.9, 0.15], [-0.6, 0.22], [-0.3, 0.05], [-0.06, 0.1]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i];
      const [x2, z2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, z2 - z1);
      K.box(crack, [len, 0.006, 0.025], 'black', [(x1 + x2) / 2, 0, (z1 + z2) / 2], [0, (-Math.atan2(z2 - z1, x2 - x1) * 180) / Math.PI, 0]);
    }
    const weeds = K.part('weeds', [-1.15, 0.03, 0.38], null, 'Weeds & debris');
    K.rep(4, (i) => K.cone(weeds, [0.02, 0.12], 'grass', [i * 0.05 - 0.07, 0.05, 0], [0, 0, i * 12 - 18]));
    const backer = K.part('backer', [0, 0.012, 0], null, 'Foam backer rod');
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i];
      const [x2, z2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, z2 - z1);
      K.box(backer, [len, 0.008, 0.03], 'sky', [(x1 + x2) / 2, 0, (z1 + z2) / 2], [0, (-Math.atan2(z2 - z1, x2 - x1) * 180) / Math.PI, 0]);
    }
    const filler = K.part('filler', [0, 0.025, 0], null, 'Self-leveling crack sealant');
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i];
      const [x2, z2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, z2 - z1);
      K.box(filler, [len + 0.02, 0.008, 0.04], K.std(0x9e9d97), [(x1 + x2) / 2, 0, (z1 + z2) / 2], [0, (-Math.atan2(z2 - z1, x2 - x1) * 180) / Math.PI, 0]);
    }
    const gun = K.part('gun', [-0.9, 0.3, 0.15], null, 'Caulk gun');
    K.cyl(gun, [0.06, 0.06, 0.5], 'offwhite', [0, 0, 0], [0, 0, 60]);
    K.cone(gun, [0.025, 0.15], 'offwhite', [-0.28, -0.16, 0], [0, 0, 60]);
    const brush = K.part('brush', [-1.0, 0.1, 0.7], null, 'Wire brush');
    K.box(brush, [0.25, 0.04, 0.08], 'woodLight');
    K.box(brush, [0.22, 0.04, 0.06], 'steel', [0, -0.04, 0]);
    return {
      tick(t, fx) {
        if (fx === 'gun') K.parts.gun.position.x = -0.9 + 0.7 * Math.sin(t * 1.2);
      },
    };
  });

  /* ---- Model: asphalt driveway ---- */
  TB.model('asphalt', { cam: [2.8, 2.6, 3.2], at: [0, 0, 0], hidden: ['sealcoat', 'squeegee'] }, (K) => {
    K.box(null, [5, 0.04, 4], 'grass', [0, -0.06, 0]);
    const a = K.part('drive', [0, 0, 0], null, 'Asphalt driveway');
    K.box(a, [2.6, 0.08, 3.6], K.std(0x6d6e6c, { roughness: 1 }), [0, -0.0, 0]);
    const cracks = K.part('cracks', [0, 0.042, 0], null, 'Hairline cracks');
    K.box(cracks, [0.9, 0.004, 0.015], 'black', [-0.3, 0, -0.6], [0, 20, 0]);
    K.box(cracks, [0.6, 0.004, 0.015], 'black', [0.4, 0, 0.5], [0, -35, 0]);
    const oil = K.part('oil', [0.5, 0.042, -0.3], null, 'Oil stain');
    K.cyl(oil, [0.25, 0.25, 0.004], K.std(0x2b2b2b));
    const sc = K.part('sealcoat', [0, 0.045, 0], null, 'Fresh sealcoat');
    K.box(sc, [2.6, 0.006, 3.6], K.std(0x232426, { roughness: 0.7 }));
    const sq = K.part('squeegee', [0, 0.25, 0.8], null, 'Squeegee / brush');
    K.box(sq, [0.6, 0.08, 0.06], 'black');
    K.cyl(sq, [0.02, 0.02, 1.4], 'woodLight', [0, 0.5, 0.4], [-50, 0, 0]);
    return {
      tick(t, fx) {
        if (fx === 'squeegee') K.parts.squeegee.position.x = 0.8 * Math.sin(t * 1.4);
      },
    };
  });

  TB.category({
    id: 'concrete',
    code: 'CON',
    name: 'Driveway & Concrete',
    domain: 'exterior',
    blurb: 'Cracks and sealcoating',
    repairs: [
      {
        id: 'concrete-crack',
        title: 'Crack in a concrete slab',
        model: 'slab',
        level: 1,
        time: '1–2 hrs',
        cost: '$15–35',
        summary: 'Cracks under ½″ wide in driveways, walks and patios can be sealed with flexible crack filler. That keeps water and ice from widening them.',
        intro: { hi: ['crack'] },
        safety: ['Wear eye protection when wire-brushing.', 'Wide cracks with one side higher than the other are a structural issue, not a sealing job.'],
        causes: [['Shrinkage', 'Concrete shrinks as it cures; joints are meant to control where it cracks.'], ['Freeze–thaw', 'Water in cracks expands about 9% when it freezes.'], ['Tree roots or settling', 'Causes uneven slabs.']],
        tools: ['Wire brush & screwdriver', 'Shop vac or leaf blower', 'Foam backer rod (cracks over ¼″ deep)', 'Polyurethane or self-leveling concrete crack sealant', 'Caulk gun', 'Putty knife'],
        steps: [
          { t: 'Clean out the crack', d: 'Pull weeds, scrape loose bits with a screwdriver, and wire-brush the edges.', why: 'Sealant bonds to sound concrete, not to dirt or crumbly edges.', v: { cam: [0.8, 1.2, 1.4], at: [-1.0, 0, 0.3], hi: ['weeds', 'brush'] } },
          { t: 'Blow it dry', d: 'Vacuum or blow out dust. Let it dry fully.', why: 'Moisture and dust are the top two reasons crack filler fails.', v: { cam: [1.6, 1.6, 2.0], at: [-0.8, 0, 0.2], hi: ['crack'], hide: ['weeds'] } },
          { t: 'Insert backer rod', d: 'Push foam backer rod into deep cracks so the sealant depth is about ¼″.', why: 'Flexible sealant works best as a thin band bonded on two sides. Too deep and it tears as the slab moves.', v: { cam: [1.0, 1.2, 1.4], at: [-0.8, 0, 0.2], hi: ['backer'], show: ['backer'], xray: true } },
          { t: 'Fill the crack', d: 'Run a steady bead of sealant along the crack, slightly overfilling.', why: 'Overfilling a little allows for the slight sag as it cures.', v: { cam: [1.2, 1.4, 1.6], at: [-0.8, 0, 0.2], hi: ['filler', 'gun'], show: ['filler', 'gun'], fx: 'gun' } },
          { t: 'Tool and cure', d: 'Smooth with a putty knife if needed. Keep traffic off for 24 hours, cars for 3 days.', why: 'Most sealants skin quickly but need days to reach full strength.', v: { cam: [2.2, 2.2, 2.6], at: [-0.4, 0, 0], hi: ['filler'], hide: ['gun', 'brush'] } },
        ],
        learn: {
          how: 'Concrete is strong in compression but weak in tension, so it cracks as it shrinks and as the ground moves. Control joints are grooves cut on purpose so cracks happen there neatly. Random cracks between joints let water in. When that water freezes, it expands and pries the crack wider every winter.',
          specs: [['Water expansion on freezing', '≈ 9%'], ['Sealant depth', '¼–½″'], ['Fixable by sealing', '< ½″ wide, level'], ['Joint spacing (4″ slab)', '8–12 ft']],
          terms: [['Control joint', 'Planned groove that guides cracking.'], ['Backer rod', 'Foam cord that sets sealant depth.'], ['Spalling', 'Surface flaking from freeze-thaw or salt.']],
          mistakes: ['Using rigid patch mix in a moving crack.', 'Sealing a wet crack.', 'Filling control joints with mortar.'],
          tips: ['Use sand-textured sealant on walkways so it blends in better.'],
        },
        pro: 'Cracks are wider than ½″, one side is higher (a trip hazard), or the slab is sinking or rocking.',
      },
      {
        id: 'sealcoat',
        title: 'Sealcoat an asphalt driveway',
        model: 'asphalt',
        level: 1,
        time: 'Half a day + 48 hr cure',
        cost: '$60–150',
        summary: 'Faded gray asphalt is drying out. Cleaning, filling cracks and a coat of sealer every 2–3 years protects it from water and UV.',
        intro: { hi: ['cracks', 'oil'] },
        safety: ['Sealers are messy and stain permanently. Wear old clothes and tape off edges.', 'Keep kids and pets off until cured.'],
        causes: [['UV oxidation', 'Sun dries the binder, turning asphalt gray and brittle.'], ['Oil and gas leaks', 'Petroleum dissolves asphalt binder.'], ['Water infiltration', 'Leads to cracks and potholes.']],
        tools: ['Driveway sealer (water-based)', 'Squeegee/brush combo', 'Asphalt crack filler', 'Degreaser & stiff brush', 'Leaf blower or broom', 'Edging tape'],
        steps: [
          { t: 'Clean and degrease', d: 'Sweep or blow off the surface. Scrub oil stains with degreaser and rinse.', why: 'Sealer won’t stick over oil. It will peel off in a matching patch.', v: { cam: [1.4, 1.6, 1.6], at: [0.5, 0, -0.3], hi: ['oil'] } },
          { t: 'Fill cracks first', d: 'Fill cracks with asphalt crack filler and let it cure per the label.', why: 'Sealer is a thin skin. It won’t bridge cracks wider than a hairline.', v: { cam: [1.6, 1.8, 2.0], at: [0, 0, 0], hi: ['cracks'], hide: ['oil'] } },
          { t: 'Pour and spread', d: 'Pour a ribbon of sealer across the drive and pull it into a thin, even coat with the squeegee.', why: 'Two thin coats outlast one thick coat, which stays soft and tracks.', v: { cam: [2.4, 2.4, 2.8], at: [0, 0, 0.4], hi: ['squeegee', 'sealcoat'], show: ['squeegee', 'sealcoat'], fx: 'squeegee' } },
          { t: 'Let it cure', d: 'Barricade the driveway. Allow 24 hours for foot traffic and 48 hours for cars.', why: 'Turning tires on soft sealer scuffs it off.', v: { cam: [2.8, 2.6, 3.2], at: [0, 0, 0], hi: ['sealcoat'], hide: ['squeegee'] } },
        ],
        learn: {
          how: 'Asphalt pavement is stone held together by a sticky petroleum binder. Sun and air oxidize the binder until it shrinks and cracks. Sealcoat is a thin layer of new binder and fillers that shields the surface from UV, water and spilled oil.',
          specs: [['Interval', '2–3 years'], ['Temperature', '50 °F+ and rising'], ['No rain', '24 hr'], ['New asphalt', 'wait 6–12 months']],
          terms: [['Binder', 'The asphalt cement that glues stones together.'], ['Oxidation', 'Sun-driven drying and graying.'], ['Alligator cracking', 'Interconnected cracks that mean the base has failed.']],
          mistakes: ['Sealing too often, which builds up a layer that flakes.', 'Sealing in the evening before dew.'],
          tips: ['Start at the top of the drive and work toward the street so you don’t box yourself in.'],
        },
        pro: 'You see alligator cracking, potholes, or sinking areas. Those need base repair or resurfacing.',
      },
    ],
  });
})();
