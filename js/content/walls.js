/* WAL · Walls, paint & caulk */
(function () {
  /* ---- Model: drywall section with a hole, studs behind ---- */
  TB.model('drywall', { cam: [1.8, 1.7, 2.8], at: [0, 1.2, 0], hidden: ['patch', 'coat1', 'coat2', 'sanded', 'knife', 'paint'] }, (K) => {
    const studs = K.part('studs', [0, 0, 0], null, 'Studs (16″ apart)');
    [-0.8, 0.0, 0.8].forEach((x) => K.box(studs, [0.08, 2.4, 0.3], 'woodLight', [x, 1.2, -0.2]));
    K.box(studs, [2.0, 0.08, 0.3], 'woodLight', [0, 0.04, -0.2]);
    const wall = K.part('wall', [0, 0, 0], null, 'Drywall');
    // a sheet with a 0.3 × 0.3 hole centered at (0.4, 1.2)
    K.box(wall, [2.0, 1.05, 0.05], 'drywall', [0, 0.525, 0]);
    K.box(wall, [2.0, 1.05, 0.05], 'drywall', [0, 1.875, 0]);
    K.box(wall, [1.25, 0.3, 0.05], 'drywall', [-0.375, 1.2, 0]);
    K.box(wall, [0.45, 0.3, 0.05], 'drywall', [0.775, 1.2, 0]);
    const hole = K.part('hole', [0.4, 1.2, -0.03], null, 'Hole');
    K.box(hole, [0.3, 0.3, 0.005], 'dark');
    const pops = K.part('pops', [0, 0, 0.03], null, 'Nail pops');
    [[-0.8, 1.7], [-0.8, 0.6], [0, 1.65]].forEach(([x, y]) => K.cyl(pops, [0.03, 0.03, 0.015], 'chrome', [x, y, 0], [90, 0, 0]));
    const patch = K.part('patch', [0.4, 1.2, 0.03], null, 'Self-adhesive mesh patch');
    K.box(patch, [0.5, 0.5, 0.008], K.std(0xd9d2b8, { roughness: 1, transparent: true, opacity: 0.9 }));
    K.rep(9, (i) => K.box(patch, [0.5, 0.004, 0.01], 'grey', [0, -0.2 + i * 0.05, 0.004]));
    K.rep(9, (i) => K.box(patch, [0.004, 0.5, 0.01], 'grey', [-0.2 + i * 0.05, 0, 0.004]));
    const c1 = K.part('coat1', [0.4, 1.2, 0.04], null, 'First coat of compound');
    K.box(c1, [0.62, 0.62, 0.012], K.std(0xe9e6df, { roughness: 1 }));
    const c2 = K.part('coat2', [0.4, 1.2, 0.05], null, 'Feathered second coat');
    K.box(c2, [0.9, 0.9, 0.008], K.std(0xf2efe8, { roughness: 1 }));
    const sand = K.part('sanded', [0.4, 1.2, 0.056], null, 'Sanded & primed');
    K.box(sand, [0.95, 0.95, 0.004], K.std(0xf6f3ec, { roughness: 1 }));
    const paint = K.part('paint', [0, 1.2, 0.06], null, 'Finish paint');
    K.box(paint, [2.0, 2.4, 0.004], K.std(0xb9d4e6, { roughness: 0.9 }));
    const knife = K.part('knife', [0.85, 1.4, 0.25], null, '6″ taping knife');
    K.box(knife, [0.32, 0.2, 0.01], 'steel', [0, 0, 0], [0, 0, 10]);
    K.box(knife, [0.06, 0.28, 0.05], 'blue', [0.05, -0.22, 0.0], [0, 0, 10]);
    return {
      tick(t, fx) {
        if (fx === 'spread') K.parts.knife.position.x = 0.4 + 0.25 * Math.sin(t * 2.5);
        else K.parts.knife.position.x = 0.85;
      },
    };
  });

  /* ---- Model: tub & tile corner for caulking ---- */
  TB.model('tub', { cam: [1.6, 1.6, 2.4], at: [0, 0.6, -0.2], hidden: ['tape', 'newCaulk', 'gun'] }, (K) => {
    const tub = K.part('tub', [0, 0, 0], null, 'Tub');
    K.box(tub, [2.4, 0.55, 1.0], 'white', [0, 0.275, 0]);
    K.box(tub, [2.2, 0.04, 0.8], 'offwhite', [0, 0.53, 0.0]);
    const tile = K.part('tile', [0, 0, 0], null, 'Tile wall');
    K.box(tile, [2.6, 1.8, 0.04], 'offwhite', [0, 1.45, -0.52]);
    K.rep(14, (i) => K.box(tile, [2.6, 0.01, 0.042], 'lightgrey', [0, 0.6 + i * 0.13, -0.52]));
    K.rep(20, (i) => K.box(tile, [0.01, 1.8, 0.042], 'lightgrey', [-1.25 + i * 0.13, 1.45, -0.52]));
    const old = K.part('oldCaulk', [0, 0.57, -0.48], null, 'Old moldy caulk');
    K.box(old, [2.4, 0.04, 0.04], K.std(0x8a8f72, { roughness: 1 }));
    K.rep(10, (i) => K.sph(old, 0.015, 'black', [-1.1 + i * 0.24, 0.01, 0.02]));
    const tape = K.part('tape', [0, 0.57, -0.48], null, 'Painter’s tape guides');
    K.box(tape, [2.4, 0.025, 0.005], 'sky', [0, 0.045, -0.015]);
    K.box(tape, [2.4, 0.005, 0.03], 'sky', [0, -0.03, 0.04]);
    const nc = K.part('newCaulk', [0, 0.565, -0.485], null, 'New silicone bead');
    K.cyl(nc, [0.022, 0.022, 2.4], 'white', [0, 0, 0], [0, 0, 90]);
    const gun = K.part('gun', [0.4, 0.75, -0.25], null, 'Caulk gun');
    K.cyl(gun, [0.06, 0.06, 0.5], 'offwhite', [0, 0, 0], [0, 0, 70]);
    K.cone(gun, [0.025, 0.15], 'offwhite', [-0.29, -0.1, 0], [0, 0, 70]);
    K.box(gun, [0.05, 0.28, 0.04], 'red', [0.22, -0.17, 0], [0, 0, -10]);
    const razor = K.part('scraper', [-0.8, 0.75, -0.2], null, 'Razor scraper');
    K.box(razor, [0.1, 0.06, 0.01], 'steel');
    K.box(razor, [0.05, 0.2, 0.04], 'yellow', [0, -0.12, 0]);
    return {
      tick(t, fx) {
        if (fx === 'bead') {
          const k = (t * 0.25) % 1;
          K.parts.gun.position.x = 1.0 - 2.2 * k;
          K.parts.newCaulk.scale.x = Math.max(0.01, k);
          K.parts.newCaulk.position.x = 1.2 - 1.2 * k;
        } else {
          K.parts.newCaulk.scale.x = 1;
          K.parts.newCaulk.position.x = 0;
        }
      },
    };
  });

  TB.category({
    id: 'walls',
    code: 'WAL',
    name: 'Walls, Paint & Caulk',
    domain: 'interior',
    blurb: 'Drywall holes, nail pops and tub caulk',
    repairs: [
      {
        id: 'drywall-hole',
        title: 'Hole in drywall',
        model: 'drywall',
        level: 2,
        time: '2–3 hrs over 2 days',
        cost: '$15–30',
        summary: 'Doorknob-size holes (up to about 6″) fix cleanly with a self-adhesive mesh patch and two or three thin coats of joint compound.',
        intro: { hi: ['hole'] },
        safety: ['Check for wires and pipes before cutting or enlarging a hole. Look inside with a flashlight.', 'Wear a dust mask when sanding. Joint compound dust is very fine.'],
        causes: [['Doorknob impact', 'Add a door stop after the repair.'], ['Furniture or moving damage', 'Dresser corners and chair backs during moves.'], ['Removed anchors', 'Ragged holes from wall anchors.']],
        tools: ['Self-adhesive mesh patch kit', 'Lightweight joint compound', '6″ and 10″ taping knives', 'Utility knife', 'Sanding sponge (fine)', 'Primer and matching paint', 'Drop cloth'],
        steps: [
          { t: 'Trim the edges', d: 'Cut away torn paper and crumbly gypsum so the edges are firm and flush.', why: 'Loose paper bubbles up under compound. Firm edges give the patch a flat base.', v: { cam: [0.9, 1.4, 1.4], at: [0.4, 1.2, 0], hi: ['hole'] } },
          { t: 'Stick on the mesh patch', d: 'Center the patch over the hole and press it flat, overlapping solid wall by at least 1″ on all sides.', why: 'The metal or fiberglass mesh bridges the hole so the compound has something to hold onto.', v: { cam: [0.9, 1.4, 1.6], at: [0.4, 1.2, 0], hi: ['patch'], show: ['patch'] } },
          { t: 'Apply the first coat', d: 'Spread a thin coat over the patch with the 6″ knife, pressing it through the mesh. Let it dry fully.', why: 'Thin coats dry evenly and don’t crack. Thick coats shrink and sag.', v: { cam: [1.0, 1.4, 1.8], at: [0.4, 1.2, 0], hi: ['coat1', 'knife'], show: ['coat1', 'knife'], fx: 'spread' } },
          { t: 'Feather the second coat', d: 'With the 10″ knife, spread a wider, thinner coat. Press harder on the outer edge so it tapers to nothing.', why: 'Feathering spreads the slight bump over a wide area so your eye can’t catch it in raking light.', v: { cam: [1.0, 1.4, 1.8], at: [0.4, 1.2, 0], hi: ['coat2', 'knife'], show: ['coat2'], fx: 'spread' } },
          { t: 'Sand lightly', d: 'Once dry, sand with a fine sponge until smooth. Shine a flashlight across the wall to find ridges.', why: 'Light raking across the surface exaggerates any bump, the same way sunlight will.', v: { cam: [1.6, 1.25, 0.8], at: [0.4, 1.2, 0], hi: ['sanded'], show: ['sanded'], hide: ['knife'] } },
          { t: 'Prime and paint', d: 'Prime the patch, then paint the whole wall section corner-to-corner if you can.', why: 'Bare compound absorbs paint differently and shows up as a dull patch ("flashing") without primer.', v: { cam: [1.8, 1.7, 2.8], at: [0, 1.2, 0], hi: ['paint'], show: ['paint'] } },
        ],
        learn: {
          how: 'Drywall is a gypsum core sandwiched between paper faces. It is strong in the plane of the wall but crumbles where punched. A patch needs a bridge (mesh or a drywall plug) plus compound to rebuild the surface. Joint compound shrinks as it dries, so several thin layers beat one thick one.',
          specs: [['Standard wall thickness', '½″'], ['Stud spacing', '16″ on center'], ['Dry time per coat', '≈ 24 hr (or 20–90 min setting type)'], ['Sandpaper', '150–220 grit']],
          terms: [['Joint compound ("mud")', 'Paste used to smooth drywall seams and patches.'], ['Feathering', 'Tapering compound to a thin edge.'], ['Flashing', 'Patch shows through paint as a different sheen.'], ['California patch', 'Patch cut from drywall with paper flaps left on.']],
          mistakes: ['One thick coat of compound.', 'Skipping primer.', 'Sanding with coarse paper that scuffs the wall paper face.'],
          tips: ['Add a drop of dish soap to compound so it spreads smoother.', 'For holes over 6″, cut back to the studs and screw in a new piece.'],
        },
        pro: 'The hole is larger than about 8″, there’s water damage or mold, or the wall is plaster on lath.',
      },
      {
        id: 'nail-pops',
        title: 'Nail pops in walls',
        model: 'drywall',
        level: 1,
        time: '1 hr + dry time',
        cost: '$10',
        summary: 'Small round bumps over nail heads are common as framing dries and shifts. Lock the drywall with screws, then cover.',
        intro: { hi: ['pops'] },
        safety: ['Nail pops are often directly on a stud; stud finders help but don’t drill deeper than 1¼″ near outlets.'],
        causes: [['Lumber shrinkage', 'Studs dry and shrink, pushing nails out.'], ['Seasonal movement', 'Humidity swings.'], ['Missed stud', 'The nail never hit wood solidly.']],
        tools: ['Drill/driver', '1¼″ drywall screws', 'Nail set & hammer', 'Joint compound', '6″ knife', 'Sanding sponge', 'Primer & paint'],
        steps: [
          { t: 'Locate the stud', d: 'Find the stud behind the pop. It’s directly under the nail.', why: 'The new screw has to grab the stud to hold the board tight.', v: { cam: [1.2, 1.6, 2.0], at: [-0.4, 1.3, 0], hi: ['studs'], xray: true } },
          { t: 'Drive a screw beside the nail', d: 'Push the drywall firmly against the stud and drive a drywall screw 1½″ above or below the nail, just below the surface.', why: 'The screw clamps the board to the stud, so the nail can’t push it out again.', v: { cam: [0.8, 1.6, 1.4], at: [-0.6, 1.6, 0], hi: ['pops'] } },
          { t: 'Set the old nail', d: 'Tap the popped nail below the surface with a nail set.', why: 'Pulling the nail would tear a larger hole; setting it is cleaner.', v: { cam: [0.8, 1.6, 1.4], at: [-0.6, 1.6, 0], hi: ['pops'], mv: { pops: [0, 0, -0.02] } } },
          { t: 'Fill, sand, paint', d: 'Cover both heads with 2 thin coats of compound, sand, prime, and touch up.', why: 'Primer stops the spot from flashing through the paint.', v: { cam: [1.8, 1.7, 2.8], at: [0, 1.2, 0], hi: ['paint'], show: ['paint'] } },
        ],
        learn: {
          how: 'Nails hold by friction. When lumber dries and shrinks or the house flexes, the nail head can push out through the drywall face. Screws hold by thread, so they resist that movement much better. That’s why modern installs use screws.',
          specs: [['Screw length for ½″ drywall', '1¼″'], ['Screw depth', 'just below surface, paper not torn']],
          terms: [['Nail set', 'Punch for driving nail heads below a surface.'], ['Dimple', 'Shallow dent left by a screw head, filled with compound.']],
          mistakes: ['Driving the screw so deep it tears the paper (it loses holding power).', 'Fixing pops without screwing nearby.'],
          tips: ['Fix pops at the end of the heating season; most movement is done by then.'],
        },
        pro: 'Pops show up with cracks across ceilings, doors begin to stick, or there are large diagonal cracks at window corners (possible settling).',
      },
      {
        id: 'recaulk-tub',
        title: 'Recaulk a tub or shower',
        model: 'tub',
        level: 1,
        time: '1.5 hrs + 24 hr cure',
        cost: '$10–20',
        summary: 'Moldy, cracked caulk lets water behind the tile. Strip it completely and lay a clean silicone bead.',
        intro: { hi: ['oldCaulk'] },
        safety: ['Ventilate the room. Remover and silicone fumes are strong.', 'Use a plastic or razor scraper carefully to avoid scratching acrylic tubs.'],
        causes: [['Mold under caulk', 'Bleaching the surface won’t reach it. Replace it.'], ['Cracked or peeling bead', 'Movement or old acrylic caulk.'], ['Gaps at the corner', 'Water gets behind the tile.']],
        tools: ['Razor scraper / caulk removal tool', '100% silicone kitchen & bath caulk', 'Caulk gun', 'Painter’s tape', 'Rubbing alcohol & rags', 'Paper towels'],
        steps: [
          { t: 'Strip the old caulk', d: 'Slice along both edges of the bead and peel it out. Scrape off every bit of residue.', why: 'New silicone won’t bond to old silicone. Any leftover film means peeling within months.', v: { cam: [0.9, 1.0, 1.0], at: [-0.5, 0.6, -0.4], hi: ['oldCaulk', 'scraper'] } },
          { t: 'Clean and dry', d: 'Wipe with rubbing alcohol to remove soap film and mold. Let the joint dry overnight.', why: 'Silicone needs a clean, dry surface to bond. Moisture trapped underneath grows mold.', v: { cam: [1.0, 1.2, 1.4], at: [0, 0.6, -0.4], hi: ['tub'], hide: ['oldCaulk'] } },
          { t: 'Fill the tub with water', d: 'Fill the tub before caulking (for tubs, not showers).', why: 'The weight lowers the tub to its in-use position, so the caulk isn’t stretched later.', v: { cam: [1.6, 1.6, 2.4], at: [0, 0.6, -0.2], hi: ['tub'] } },
          { t: 'Tape both sides', d: 'Run painter’s tape ⅛″ from the joint on the tile and on the tub.', why: 'Tape gives two perfectly straight edges with no smearing.', v: { cam: [0.9, 1.0, 1.0], at: [0, 0.6, -0.4], hi: ['tape'], show: ['tape'] } },
          { t: 'Lay one continuous bead', d: 'Cut the nozzle small at 45°. Push the gun steadily along the joint in one pass.', why: 'Pushing forces silicone into the gap; pulling lays it on top.', v: { cam: [1.2, 1.1, 1.4], at: [0, 0.6, -0.4], hi: ['newCaulk', 'gun'], show: ['newCaulk', 'gun'], fx: 'bead' } },
          { t: 'Tool and pull the tape', d: 'Smooth with a wet finger in one stroke, then pull the tape at an angle immediately. Let it cure 24 hours.', why: 'Silicone skins in minutes. Pulling tape after the skin forms tears the edge.', v: { cam: [1.0, 1.0, 1.2], at: [0, 0.6, -0.4], hi: ['newCaulk'], hide: ['tape', 'gun'] } },
        ],
        learn: {
          how: 'The joint between tub and wall moves every time the tub fills and someone steps in. Tile grout is rigid and cracks there; caulk stays flexible. 100% silicone sticks to non-porous surfaces, stays elastic for years, and resists mold. It can’t be painted, and new silicone won’t stick to old.',
          specs: [['Silicone skin time', '10–20 min'], ['Full cure', '24 hr'], ['Bead width', '⅛–¼″']],
          terms: [['100% silicone', 'Best for wet, non-painted joints.'], ['Siliconized acrylic', 'Paintable but less durable in wet areas.'], ['Tooling', 'Smoothing the bead to press it into the joint.']],
          mistakes: ['Caulking over old caulk.', 'Using painter’s caulk in a shower.', 'Running water before full cure.'],
          tips: ['Keep a dab of dish soap on your fingertip when tooling. It stops silicone from sticking to your finger.'],
        },
        pro: 'Tiles are loose or the wall behind feels soft when pressed. Water has already damaged the backer board.',
      },
    ],
  });
})();
