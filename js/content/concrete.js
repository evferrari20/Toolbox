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
        time: '1–2 hrs + cure',
        cost: '$15–35',
        summary: 'Cracks up to about ½″ wide in driveways, walks and patios can be sealed with a flexible polyurethane or polymer crack sealant. That keeps water out, so ice can’t pry the crack wider each winter.',
        intro: { hi: ['crack'] },
        safety: [
          'Wear safety glasses when wire-brushing or chiseling; chips fly.',
          'Wear nitrile gloves with polyurethane sealant. It sticks to skin and only comes off with mineral spirits before it cures.',
          'Wide cracks where one side sits higher than the other, or a slab that rocks or sinks, are structural problems, not a sealing job.',
        ],
        causes: [
          ['Shrinkage', 'Concrete shrinks as it cures. Control joints (the straight grooves) are meant to decide where it cracks.'],
          ['Freeze–thaw', 'Water in a crack expands about 9% when it freezes and pries the crack wider.'],
          ['Tree roots or settling', 'Soil moving under the slab makes it crack and tilt.'],
          ['Heavy loads', 'Trucks or dumpsters on a 4″ walk slab crack it.'],
        ],
        tools: ['Wire brush, flat screwdriver or cold chisel', 'Shop vac or leaf blower', 'Foam backer rod sized about ⅛″ wider than the crack (for cracks deeper than ½″)', 'Self-leveling polyurethane or polymer concrete crack sealant (non-sag type for slopes)', 'Caulk gun', 'Putty knife or plastic spoon', 'Nitrile gloves & safety glasses'],
        steps: [
          {
            t: 'Clean out the crack',
            d: 'Pull out weeds and roots. Scrape out dirt and any loose, crumbly edges with a screwdriver or cold chisel, then scrub both sides of the crack with a wire brush until you see clean, hard gray concrete.',
            why: 'Sealant bonds to sound concrete, not to dirt, moss or crumbly edges. If the edge breaks off, the seal goes with it.',
            tip: 'If weeds keep coming back, pour boiling water in the crack a day before. It kills roots without chemicals and dries fast.',
            ok: 'Both walls of the crack look clean and hard, and scratching them with the screwdriver doesn’t knock more bits loose.',
            v: { cam: [0.8, 1.2, 1.4], at: [-1.0, 0, 0.3], hi: ['weeds', 'brush'] },
          },
          {
            t: 'Blow it out and let it dry',
            d: 'Vacuum or blow out all the dust. If you hosed it or it rained, wait until the crack is fully dry, usually a sunny day. Check that the air is above about 40 °F (most labels).',
            why: 'Moisture and dust are the two most common reasons crack sealant peels out.',
            tip: 'Press a strip of masking tape into the crack and pull it off. If it comes up gray and dusty, blow it out again.',
            ok: 'The crack looks uniformly light gray (not darker, which means damp) and a fingertip comes out clean.',
            v: { cam: [1.6, 1.6, 2.0], at: [-0.8, 0, 0.2], hi: ['crack'], hide: ['weeds'] },
          },
          {
            t: 'Insert backer rod',
            d: 'If the crack is deeper than about ½″, push foam backer rod (a squishy foam cord) into it with a putty knife so the sealant will be about ¼–½″ deep, roughly half as deep as the crack is wide. Pick rod about ⅛″ wider than the crack so it stays put.',
            why: 'Flexible sealant works best as a thin band stuck to the two sides only. Stuck to the bottom too, or poured too deep, it can’t stretch and tears as the slab moves.',
            tip: 'Roll the putty knife along the rod instead of stabbing it; poking holes in the rod makes it release gas that bubbles up through the sealant.',
            ok: 'The rod sits evenly below the surface along the whole crack, with no gaps, at about the depth of a fingernail to a thumbnail.',
            v: { cam: [1.0, 1.2, 1.4], at: [-0.8, 0, 0.2], hi: ['backer'], show: ['backer'], xray: true },
          },
          {
            t: 'Fill the crack',
            d: 'Cut the nozzle at an angle to about the crack’s width. Squeeze the caulk gun trigger slowly and pull the gun toward you so the bead fills the crack from the bottom up, leaving it just level with or a hair above the surface.',
            why: 'Self-leveling sealant flows flat on its own and settles slightly as it cures, so a full bead ends up flush.',
            tip: 'On a slope, self-leveling sealant runs downhill; use a non-sag crack sealant there instead. If it drips, wipe it with a rag and mineral spirits right away.',
            ok: 'The sealant looks like a smooth, continuous ribbon that sits flush with the slab, with no bubbles or gaps.',
            v: { cam: [1.2, 1.4, 1.6], at: [-0.8, 0, 0.2], hi: ['filler', 'gun'], show: ['filler', 'gun'], fx: 'gun' },
          },
          {
            t: 'Tool and cure',
            d: 'Smooth any lumps with a putty knife or the back of a plastic spoon within the first few minutes. It’s usually tack-free in about an hour; keep foot traffic off for 24 hours and cars off for 3–7 days, as the label says.',
            why: 'The skin forms fast, but polyurethane cures from the outside in at about ⅛″ per day, so the inside stays soft for days.',
            tip: 'Sprinkle a little sand onto wet sealant on a walkway. It hides the shiny stripe and adds grip.',
            ok: 'A light touch after an hour leaves no fingerprint and nothing sticks to your glove.',
            v: { cam: [2.2, 2.2, 2.6], at: [-0.4, 0, 0], hi: ['filler'], hide: ['gun', 'brush'] },
          },
        ],
        tricks: [
          ['Pick the right sealant', 'Flexible polyurethane or polymer for moving cracks; never rigid patch mortar, which pops out the first winter.'],
          ['Leave control joints open-looking', 'Seal control joints with the same flexible sealant, not mortar. They need to move.'],
          ['Work in the shade', 'A hot slab skins the sealant before it levels out. Morning or a cloudy day works best.'],
          ['Hairline cracks get a sealer', 'Cracks too thin for a nozzle are best handled with a penetrating concrete sealer over the whole slab.'],
          ['Watch the width', 'Mark the crack ends with a pencil line and date. If it grows over a season, the slab is moving and needs a pro.'],
          ['Keep the gun from oozing', 'Release the pressure lever on the caulk gun the moment you stop, and set it down nozzle-up.'],
        ],
        refs: [
          ['Advanced Polymer Self-Leveling Sealant data sheet (Quikrete)', 'https://www.Quikrete.com/PDFs/DATA_SHEET-Advanced%20Polymer%20Self-Leveling%20Sealant%20866041.pdf'],
          ['Repairing and sealing cracks (Quikrete)', 'https://www.quikrete.com/athome/video-repairing-sealing-cracks.asp'],
          ['Sakrete self-leveling sealant data sheet (Sika)', 'https://can.sika.com/dam/dms/ca01/l/Sakrete%20Self%20Leveling%20Sealant_pds-en.pdf'],
          ['Sikaflex self-leveling sealant (Sika)', 'https://can.sika.com/en/do-it-yourself/sika-products/sealing-bonding/sealants/sikaflex-self-levelingsealant.html'],
          ['How to seal concrete (Bob Vila)', 'https://www.bobvila.com/articles/how-to-seal-concrete/'],
        ],
        learn: {
          how: 'Concrete is very strong when squeezed but weak when stretched, so it cracks as it shrinks and as the ground moves. Control joints are grooves cut on purpose so cracks happen there neatly. Random cracks between joints let water in. When that water freezes, it expands and pries the crack wider every winter. A flexible sealant stretches as the slab moves and keeps the water out.',
          specs: [['Water expansion on freezing', '≈ 9%'], ['Seal-able by DIY', '≤ ½″ wide, both sides level'], ['Sealant depth', '¼–½″'], ['Width-to-depth', '≈ 2 : 1 for wide joints'], ['Tack-free', '≈ 1 hr at 77 °F'], ['Full cure', '≈ ⅛″ depth per 24 hr'], ['Joint spacing (4″ slab)', '8–12 ft']],
          terms: [['Control joint', 'Planned groove that guides cracking.'], ['Backer rod', 'Foam cord that sets sealant depth and keeps it from sticking to the bottom.'], ['Self-leveling', 'Thin sealant that flows flat on its own; only for flat surfaces.'], ['Spalling', 'Surface flaking from freeze-thaw or deicing salt.']],
          mistakes: ['Using rigid patch mix in a moving crack.', 'Sealing a damp or dusty crack.', 'Filling control joints with mortar.', 'Pouring sealant too deep with no backer rod.'],
          tips: ['Use sand-textured sealant, or sand sprinkled on top, on walkways so it blends in.'],
        },
        pro: 'Cracks are wider than ½″, one side is higher (a trip hazard), the slab is sinking or rocking, or cracks keep growing.',
      },
      {
        id: 'sealcoat',
        title: 'Sealcoat an asphalt driveway',
        model: 'asphalt',
        level: 1,
        time: 'Half a day + 48 hr cure',
        cost: '$60–150',
        summary: 'Faded, gray asphalt is drying out. Clean it, fill the cracks, and spread two thin coats of driveway sealer every 2–3 years to shield it from sun, water and spilled oil.',
        intro: { hi: ['cracks', 'oil'] },
        safety: [
          'Sealer stains skin, shoes, concrete and siding permanently. Wear old clothes, gloves and boots, and tape off garage floors and walks.',
          'Keep kids, pets and cars off until cured; fresh sealer tracks everywhere.',
          'Choose an asphalt-emulsion or acrylic sealer, not coal-tar. Coal tar is high in PAHs (cancer-linked chemicals) and is banned in many places.',
        ],
        causes: [
          ['UV oxidation', 'Sun dries out the binder, the black glue in asphalt, turning it gray and brittle.'],
          ['Oil and gas leaks', 'Petroleum dissolves the asphalt binder and leaves soft spots.'],
          ['Water infiltration', 'Water in cracks freezes and washes out the base, leading to potholes.'],
        ],
        tools: ['Driveway sealer (asphalt emulsion or acrylic), about 1 pail per 250–400 sq ft per coat', 'Squeegee/brush combo on a pole', 'Asphalt crack filler (pourable or cartridge)', 'Degreaser, oil-spot primer & stiff brush', 'Leaf blower or broom', 'Garden hose', 'Old stir stick or drill paddle', 'Painter’s tape & cardboard'],
        steps: [
          {
            t: 'Clean and degrease',
            d: 'Pull weeds from the edges and cracks, then sweep or blow the whole drive. Scrub oil stains with degreaser and a stiff brush, rinse, and let dry. Brush a coat of oil-spot primer over any stain that still looks dark.',
            why: 'Sealer won’t stick over oil or dirt. It peels off in a patch that matches the stain.',
            tip: 'Edge along the lawn with a flat spade first; grass hanging over the edges leaves a ragged line and lifts the sealer later.',
            ok: 'The surface is free of loose grit when you rub a palm across it, and no oil stain looks wet or shiny.',
            v: { cam: [1.4, 1.6, 1.6], at: [0.5, 0, -0.3], hi: ['oil'] },
          },
          {
            t: 'Fill cracks first',
            d: 'Fill cracks between about ⅛″ and ½″ wide with asphalt crack filler, slightly overfilling, and smooth with the squeegee. Push backer rod into deeper cracks first. Let the filler cure as the label says, often overnight.',
            why: 'Sealer is a thin skin. It won’t bridge cracks wider than a hairline, and water would keep getting in underneath.',
            tip: 'If filler sinks into a crack as it cures, add a second pass the next day. Cracks wider than ½″ or with crumbling edges need a cold-patch product instead.',
            ok: 'Each crack is filled flush and the filler is firm when pressed with a fingernail.',
            v: { cam: [1.6, 1.8, 2.0], at: [0, 0, 0], hi: ['cracks'], hide: ['oil'] },
          },
          {
            t: 'Pour and spread',
            d: 'Stir the pail for 3–5 minutes until uniform. Cut in the edges with the brush side. Then pour a ribbon across the drive and pull it into a thin, even coat with the squeegee, working from the top of the drive toward the street. Apply at 50–55 °F and rising with no rain for 24 hours.',
            why: 'Two thin coats outlast one thick coat. A thick coat stays soft, tracks, and cracks as it dries.',
            tip: 'On a hot, sunny day, mist the asphalt with the hose first so it’s damp but not puddled. The sealer then spreads easier and doesn’t dry too fast. Wait until coat one is dry and no longer tacky before coat two.',
            ok: 'The surface looks evenly black with no gray showing through and no thick ridges or puddles.',
            v: { cam: [2.4, 2.4, 2.8], at: [0, 0, 0.4], hi: ['squeegee', 'sealcoat'], show: ['squeegee', 'sealcoat'], fx: 'squeegee' },
          },
          {
            t: 'Let it cure',
            d: 'Barricade the drive with cones or tape across the entrance. Allow 24 hours before walking on it and at least 48 hours before driving on it, longer in cool or humid weather.',
            why: 'Sealer cures as the water evaporates. Turning tires on soft sealer twist it right off.',
            tip: 'When you drive on it the first time, roll straight in and out; don’t turn the wheels while parked for the first week.',
            ok: 'The surface is evenly matte black and a fingernail pressed into it leaves no mark.',
            v: { cam: [2.8, 2.6, 3.2], at: [0, 0, 0], hi: ['sealcoat'], hide: ['squeegee'] },
          },
        ],
        tricks: [
          ['Watch the weather window', 'You need a dry day to prep, a warm dry day to seal, and two dry nights. Avoid evenings when dew will settle on wet sealer.'],
          ['Buy by the label coverage', 'Old, rough asphalt drinks sealer. Use the low end of the coverage range on the pail when you estimate.'],
          ['Work toward the exit', 'Start at the garage and finish at the street so you never box yourself in.'],
          ['Don’t over-seal', 'Every 2–3 years is plenty. Sealing every year builds a thick crust that cracks and flakes.'],
          ['Cardboard edges', 'Hold a piece of cardboard against garage floors and walks as you cut in. It’s faster than tape and gives a clean line.'],
          ['Wait on new asphalt', 'Fresh asphalt needs 6–12 months for its oils to cure before sealing; some makers say a full year.'],
        ],
        refs: [
          ['How to seal an asphalt driveway (Family Handyman)', 'https://www.familyhandyman.com/project/how-to-seal-an-asphalt-driveway/'],
          ['Seal a driveway, walkway or parking lot (Latex-ite)', 'https://latexite.com/seal-a-driveway-walkway-parking-lot/'],
          ['Latex-ite driveway sealer technical data sheet (Home Depot PDF)', 'https://images.homedepot-static.com/catalog/pdfImages/29/29366c21-7cfa-4c75-b14d-c1e61b0af058.pdf'],
          ['DIY: how to seal an asphalt driveway (Angi)', 'https://www.angi.com/articles/diy-how-seal-driveway-asphalt.htm'],
          ['Driveway sealants and coal tar (Village of Glenview)', 'https://www.glenview.il.us:443/Documents/Health%20Documents/Coal%20Tar%20Sealant%20FAQ.pdf'],
        ],
        learn: {
          how: 'Asphalt pavement is stone held together by a sticky petroleum binder. Sun and air oxidize the binder until it shrinks, grays and cracks. Sealcoat is a thin layer of fresh binder and fine fillers that shields the surface from UV, water and spilled fuel. It’s a skin, not structure: it can’t fix a failed base.',
          specs: [['Interval', '2–3 years'], ['Temperature', '50–55 °F+ and rising'], ['No rain', '24 hr (48 hr best)'], ['Coats', '2 thin'], ['Foot traffic', '24 hr'], ['Cars', '≥ 48 hr'], ['New asphalt', 'wait 6–12 months']],
          terms: [['Binder', 'The asphalt cement that glues stones together.'], ['Oxidation', 'Sun-driven drying and graying.'], ['Asphalt emulsion', 'Asphalt mixed into water; it cures as the water evaporates.'], ['Alligator cracking', 'Interconnected cracks like reptile skin that mean the base has failed.']],
          mistakes: ['Sealing too often, which builds up a layer that flakes.', 'Sealing in the evening before dew.', 'One heavy coat.', 'Skipping crack filling.'],
          tips: ['Start at the top of the drive and work toward the street so you don’t box yourself in.'],
        },
        pro: 'You see alligator cracking, potholes, or sinking areas. Those need base repair or resurfacing.',
      },
    ],
  });
})();
