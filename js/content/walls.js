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
        summary: 'Doorknob-size holes up to about 6″ across fix cleanly with a self-adhesive mesh patch and three thin coats of joint compound, each one wider than the last. Most of the time is drying, not working.',
        intro: { hi: ['hole'] },
        safety: ['Before trimming or enlarging the hole, shine a flashlight inside and look for wires, pipes or ducts. Never cut blind more than about 1″ deep.', 'Wear a dust mask (N95) and safety glasses when sanding. Joint compound dust is very fine and gets everywhere.', 'In a home built before 1978, the paint on the wall may contain lead. Don’t dry-sand painted surfaces around the hole; use a damp sponge instead.'],
        causes: [['Doorknob impact', 'The classic. Add a door stop or a wall bumper after the repair, or it will happen again.'], ['Furniture or moving damage', 'Dresser corners and chair backs during moves.'], ['Removed anchors or hooks', 'Plastic anchors leave ragged, crumbly holes when pulled out.'], ['Too big for a patch?', 'Over about 6″, or if the edges are soft and crumbly, use the large-patch method (a new piece of drywall on backer strips).']],
        tools: ['Self-adhesive mesh patch, sized at least 2″ bigger than the hole', 'Lightweight premixed joint compound (or 20-minute setting compound for coat 1)', '6″ and 10″ taping knives', 'Utility knife with a fresh blade', 'Mud pan or a clean plastic tray', 'Fine sanding sponge (180–220 grit) or a damp drywall sponge', 'Flashlight', 'Drywall primer (PVA) and matching paint', 'Drop cloth and N95 dust mask'],
        steps: [
          { t: 'Trim the edges', d: 'Look inside with a flashlight first. Then, holding a utility knife like a pencil, slice off any torn paper flaps and press out crumbly gypsum (the chalky white core) until every edge is firm. Shave any bump around the hole flat with the wall, or the patch won’t lie flat.', why: 'Loose paper soaks up water from the compound and bubbles. Firm, flat edges give the patch a solid base to stick to.', tip: 'Fuzzy torn paper that won’t trim cleanly? Brush on a thin coat of primer or shellac and let it dry 30 minutes. It seals the paper so it can’t blister under the mud.', ok: 'Run your fingertips around the hole: no flaps, no crumbs, and nothing sticks up above the wall surface.', v: { cam: [0.9, 1.4, 1.4], at: [0.4, 1.2, 0], hi: ['hole'] } },
          { t: 'Stick on the mesh patch', d: 'Peel the backing and center the patch over the hole so it overlaps solid wall by at least 1″ on every side. Press it flat from the middle out with your palm, then run the flat of your knife over it to smooth any wrinkles.', why: 'The metal-backed or fiberglass mesh bridges the hole so the compound has something to grip. Without it, mud just falls into the wall.', tip: 'If the patch is bigger than the wall space you have, trim it with scissors before peeling it. Patches don’t like to be lifted and re-stuck.', ok: 'The patch lies dead flat with no lifted corners, and pressing the middle feels firm, not springy.', v: { cam: [0.9, 1.4, 1.6], at: [0.4, 1.2, 0], hi: ['patch'], show: ['patch'] } },
          { t: 'Apply the first coat', d: 'Scoop a little compound onto the 6″ knife. Hold it at about 30° to the wall and press firmly so the mud pushes through the mesh, then scrape back over it with the knife nearly flat. Cover the patch about 2″ past its edges. Let it dry fully: about 24 hours for premixed (it turns from grey-ish to bright white), or 20–90 minutes for setting compound.', why: 'A tight first coat fills the mesh without adding thickness. Thick coats shrink, crack and sag as they dry.', tip: 'Stir premixed compound in the tub first and add a splash of water if it’s stiff; it should be like thick yogurt. Lumpy mud leaves drag lines you’ll fight through every coat.', ok: 'You can still see the mesh pattern faintly through a thin, even layer, and there are no ridges taller than a credit card.', v: { cam: [1.0, 1.4, 1.8], at: [0.4, 1.2, 0], hi: ['coat1', 'knife'], show: ['coat1', 'knife'], fx: 'spread' } },
          { t: 'Feather the second and third coats', d: 'Scrape off any dried ridges with the knife. With the 10″ knife, spread a wider, thinner coat 3–4″ past the first, pressing harder on the outer edge so it tapers to nothing. Let it dry, then add a third, even wider skim coat if you can still see the patch edge.', why: 'Feathering spreads the slight bump of the patch over a wide area, so your eye can’t catch it even in low sunlight.', tip: 'Keep one corner of the knife pressed to the wall and let the other ride on the patch. That tilt naturally builds the taper. Ridge left behind? Don’t sand it wet; let it dry and knock it off with the knife edge.', ok: 'The finished patch is roughly 12″ across and a straightedge laid over it rocks only slightly in the middle.', v: { cam: [1.0, 1.4, 1.8], at: [0.4, 1.2, 0], hi: ['coat2', 'knife'], show: ['coat2'], fx: 'spread' } },
          { t: 'Sand lightly', d: 'When fully dry, sand with a fine sponge using light circular strokes, or wipe with a barely damp drywall sponge to avoid dust. Hold a flashlight flat against the wall so the beam skims across the patch; ridges and dips throw shadows. Stop as soon as the shadows are gone.', why: 'Light raking across the surface exaggerates every bump, the same way morning sun will after you paint.', tip: 'If you sand through to the mesh, don’t panic: wipe off the dust and skim one more thin coat over that spot.', ok: 'With the flashlight skimming the wall, you see no shadow lines, and the patch feels as smooth as the wall around it.', v: { cam: [1.6, 1.25, 0.8], at: [0.4, 1.2, 0], hi: ['sanded'], show: ['sanded'], hide: ['knife'] } },
          { t: 'Prime and paint', d: 'Wipe off the dust with a damp cloth. Brush or roll drywall primer over the patch and 2″ beyond, and let it dry (about 1 hour). Then paint the whole wall section from corner to corner, or at least an area well past the patch, with two coats.', why: 'Bare compound soaks up paint differently from painted wall, and shows as a dull blotch called flashing unless it’s sealed with primer first.', tip: 'Touch-up paint from the same can can still look off if it’s years old. Roll it with the same nap roller you used originally; brushing a patch on a rolled wall always shows.', ok: 'From across the room, with the lights on and the blinds open, you can’t find the patch.', v: { cam: [1.8, 1.7, 2.8], at: [0, 1.2, 0], hi: ['paint'], show: ['paint'] } },
        ],
        tricks: [
          ['Fast first coat', 'Use 20-minute setting compound (the powder you mix) for the first coat and lightweight premixed for the rest. You can do all three coats in one afternoon.'],
          ['Mix only a cupful', 'Setting compound hardens in the pan on schedule, whether you’re ready or not. Mix a small batch in a clean cup and toss what you don’t use within the time on the bag.'],
          ['Find hidden ridges', 'Turn off the room lights and hold a work light flat against the wall. It shows ridges your eyes miss in normal light.'],
          ['Texture match', 'Textured wall? Dab thinned compound on with a crumpled plastic bag or a sponge before priming, and test on cardboard first. Spray-can wall texture also works for orange-peel walls.'],
          ['Stop dust spreading', 'Tape a paper bag or a folded sheet of paper under the patch while sanding to catch dust before it hits the floor.'],
          ['Keep the mud clean', 'Never put dried scrapings back in the tub. One hard crumb drags a groove through every coat.'],
          ['Prevent the next one', 'Install a hinge-pin door stop or a stick-on wall bumper where the knob hits. It costs under $5.'],
        ],
        refs: [
          ['Gypsum Board Nail Pops and repair (Gypsum Association text, via InspectApedia)', 'https://inspectapedia.com/interiors/Gypsum_Board_Nail_Pops.pdf'],
          ['How to Repair Nail Pops in Drywall (Ask the Builder, Tim Carter)', 'https://www.askthebuilder.com/how-to-repair-nail-pops-in-drywall/'],
          ['How to Fix Nail Pops in Walls and Ceilings (Dummies, Home Improvement)', 'https://www.dummies.com/article/home-auto-hobbies/home-improvement-appliances/walls-painting/how-to-fix-nail-pops-in-walls-and-ceilings-205923'],
          ['The Gypsum Construction Handbook: repairing and finishing gypsum board (USG)', 'https://www.usg.com/'],
        ],
        learn: {
          how: 'Drywall is a sheet of gypsum (a soft chalky mineral) sandwiched between two paper faces. It is stiff across the wall but crumbles where something punches it. A patch needs a bridge (mesh or a drywall plug) plus joint compound to rebuild the surface. Premixed compound dries as its water evaporates and shrinks a little; setting compound hardens by a chemical reaction and barely shrinks. Either way, several thin coats beat one thick one.',
          specs: [['Standard wall thickness', '½″ (⅝″ in garages and some ceilings)'], ['Mesh patch overlap', '≥ 1″ onto solid wall'], ['Stud spacing', '16″ on center (sometimes 24″)'], ['Premixed dry time', '≈ 24 hr per coat (longer if humid)'], ['Setting compound', '5, 20, 45 or 90 min types'], ['Finished patch width', '≈ 10–14″ feathered'], ['Sanding grit', '180–220 (fine)']],
          terms: [['Joint compound (mud)', 'Paste used to smooth drywall seams and patches.'], ['Setting compound', 'Powder mixed with water that hardens chemically in a set time; harder and less shrinky than premixed.'], ['Feathering', 'Tapering compound to a paper-thin edge.'], ['Flashing', 'A patch that shows through paint as a dull or shiny spot.'], ['California patch', 'A drywall plug cut with paper flaps left on, which act as tape.']],
          mistakes: ['One thick coat of compound to finish faster; it cracks and sags.', 'Skipping primer, so the patch flashes through the paint.', 'Sanding with coarse paper that scuffs the paper face fuzzy.', 'Painting before the compound is fully dry, which causes bubbles and a soft spot.'],
          tips: ['For holes over 6″, cut back to a clean rectangle and screw in a new piece on backer strips.', 'Scrape between coats instead of sanding; it’s faster and dust-free.'],
        },
        pro: 'The hole is larger than about 8″ and there’s nothing to screw to, there are water stains or mold around it, or the wall is plaster on wood lath (hard, heavy and cracked in layers).',
      },
      {
        id: 'nail-pops',
        title: 'Nail pops in walls',
        model: 'drywall',
        level: 1,
        time: '1 hr + dry time',
        cost: '$10',
        summary: 'Small round bumps over nail heads are common as framing lumber dries and shifts. Press the drywall tight to the stud, lock it with a screw about 1½″ away, reset the nail, then fill, prime and paint.',
        intro: { hi: ['pops'] },
        safety: ['Pops sit on studs, and electrical cables are usually stapled on the side of a stud and at least 1¼″ back from the face. A 1¼″ drywall screw through ½″ drywall goes only ¾″ into the stud, so it stays out of that zone. Don’t use longer screws near outlets and switches.', 'Wear safety glasses when tapping the nail; old paint chips fly.'],
        causes: [['Lumber shrinkage', 'New studs dry out over the first year or two and shrink, leaving the nail head standing proud.'], ['Seasonal movement', 'Humidity swings make framing swell and shrink a little every year.'], ['Gap behind the board', 'The drywall was never pressed tight to the stud when it was nailed, so every bump pushes it back and forth.'], ['Missed stud', 'The nail grazed the edge of the stud and never held.']],
        tools: ['Drill/driver with a drywall dimpler bit (or a #2 Phillips bit)', '1¼″ coarse-thread drywall screws', 'Nail set (a small steel punch) and hammer', 'Stud finder (optional)', 'Lightweight joint compound or spackle', '6″ taping knife', 'Fine sanding sponge', 'Primer and matching paint'],
        steps: [
          { t: 'Locate the stud', d: 'The stud is right behind the popped nail. Mark it, then check up and down the same vertical line; pops usually come in a row 7–8″ apart on the same stud. A stud finder confirms the stud edges.', why: 'The new screw has to bite into that same stud to clamp the board tight.', tip: 'Several pops along a vertical line mean one stud has shrunk or twisted. Fix them all at once so you only prime and paint once.', ok: 'You have a pencil mark at each pop and a light vertical line showing the stud’s center.', v: { cam: [1.2, 1.6, 2.0], at: [-0.4, 1.3, 0], hi: ['studs'], xray: true } },
          { t: 'Drive a screw beside the nail', d: 'Press the drywall firmly against the stud with your free hand. Drive a 1¼″ drywall screw into the stud about 1½″ above or below the nail, slowly, until the head sits just below the surface in a shallow dimple without tearing the paper.', why: 'The screw clamps the board to the stud, so the shrinking wood can’t push it out again. Screws hold by their threads; nails only by friction.', tip: 'A dimpler bit (about $5) stops the screw at exactly the right depth every time. No dimpler? Set the drill clutch to a low number and creep up on it. If you tear the paper, add another screw 2″ away; a torn hole doesn’t hold.', ok: 'The screw head is just under the surface, the paper is unbroken around it, and pressing on the wall there feels solid with no movement.', v: { cam: [0.8, 1.6, 1.4], at: [-0.6, 1.6, 0], hi: ['pops'] } },
          { t: 'Set the old nail', d: 'Hold the nail set’s point on the nail head and tap it with a hammer until the head is about ⅛″ below the surface. If the nail is loose and wobbly, pull it out with pliers instead.', why: 'Leaving the nail proud means it shows through the patch. Pulling a well-stuck nail can tear a bigger hole, so setting it is usually cleaner.', tip: 'Tap, don’t whack. Two or three light blows are enough. A big swing crushes the gypsum and leaves a crater you have to fill anyway.', ok: 'Slide a putty knife across the spot: it glides over without catching on any metal.', v: { cam: [0.8, 1.6, 1.4], at: [-0.6, 1.6, 0], hi: ['pops'], mv: { pops: [0, 0, -0.02] } } },
          { t: 'Fill, sand, prime and paint', d: 'Scrape off any loose paint and crumbs. Fill both dimples with compound using the 6″ knife, let it dry, then add a second slightly wider coat. Sand lightly, spot-prime each patch and paint.', why: 'The first coat shrinks into the dimple as it dries; the second fills it flat. Primer stops the spots from flashing (showing as dull dots) through the paint.', tip: 'Do the second coat when the first has turned bright white all the way through. If you can still see a tiny dip, it needs one more skim.', ok: 'Looking along the wall with a flashlight held flat against it, you see no bumps or dimples, and the paint sheen matches.', v: { cam: [1.8, 1.7, 2.8], at: [0, 1.2, 0], hi: ['paint'], show: ['paint'] } },
        ],
        tricks: [
          ['Wait for winter’s end', 'Fix pops at the end of the heating season. By then most of the lumber movement for the year has happened, so they’re less likely to come back.'],
          ['Two screws for stubborn pops', 'For a pop that keeps coming back, drive one screw 1½″ above and one 1½″ below the nail.'],
          ['Pull or set?', 'If the nail spins or slides out with fingers, pull it. If it’s tight, set it. Either way, the screw does the holding now.'],
          ['Batch the paint', 'Circle every pop in a room with a pencil and fix them all before you open a can of paint.'],
          ['Ceiling pops', 'Ceilings pop more because the board hangs on the fasteners. Have a helper hold a padded board against the ceiling while you drive the screw.'],
          ['Spot-prime small', 'Use a small foam brush or a cotton swab to prime only the filled spot, then roll paint over a wider area so it blends.'],
        ],
        refs: [
          ['Gypsum Board Nail Pops (Gypsum Association repair method, via InspectApedia)', 'https://inspectapedia.com/interiors/Gypsum_Board_Nail_Pops.pdf'],
          ['How to Repair Nail Pops in Drywall (Ask the Builder)', 'https://www.askthebuilder.com/how-to-repair-nail-pops-in-drywall/'],
          ['How to Fix Nail Pops in Walls and Ceilings (Dummies)', 'https://www.dummies.com/article/home-auto-hobbies/home-improvement-appliances/walls-painting/how-to-fix-nail-pops-in-walls-and-ceilings-205923'],
          ['Nail and screw pops (Composite Paint)', 'https://compositepaint.com/fix/nail-pops/'],
        ],
        learn: {
          how: 'Nails hold by friction. When studs dry and shrink, or the house flexes, the wood pulls back from under the nail head, leaving a gap behind the board. Every bump then pushes the board in and out, and the nail head works through the paint. Screws hold by thread, so they resist that movement much better, which is why modern installs use screws.',
          specs: [['Screw for ½″ drywall', '1¼″ coarse-thread (Type W)'], ['New screw distance', '≈ 1½″ from the popped nail'], ['Screw depth', 'Just below the surface, paper not torn'], ['Screw penetration into wood', '≥ ⅝″'], ['Nail set depth', '≈ ⅛″ below the surface']],
          terms: [['Nail set', 'A small steel punch for driving nail heads below a surface.'], ['Dimple', 'Shallow dent left by a screw head, filled with compound.'], ['Dimpler bit', 'Screw bit with a collar that stops the screw at the right depth.'], ['Stud', 'A vertical framing board inside the wall.']],
          mistakes: ['Driving the screw so deep it tears the paper (it loses holding power).', 'Just hammering the nail back in without adding a screw; it pops again.', 'Filling with one thick blob of compound that shrinks into a crater.'],
          tips: ['A single pop now and then is normal. Dozens appearing at once, especially with cracks, is a sign of bigger movement.'],
        },
        pro: 'Pops show up with cracks across ceilings, doors begin to stick, or there are large diagonal cracks from the corners of windows and doors (possible settling or structural movement).',
      },
      {
        id: 'recaulk-tub',
        title: 'Recaulk a tub or shower',
        model: 'tub',
        level: 1,
        time: '1.5 hrs + overnight dry + cure',
        cost: '$10–20',
        summary: 'Moldy, cracked caulk lets water behind the tile. Strip it completely, clean and dry the joint, then lay one smooth bead of 100% silicone and let it cure before the first shower.',
        intro: { hi: ['oldCaulk'] },
        safety: ['Open a window and run the bath fan. Caulk removers and fresh silicone give off strong fumes (the vinegar smell is normal for many silicones).', 'Use a plastic scraper on acrylic or fiberglass tubs; a metal razor scratches them. Razors are fine on tile and glazed cast iron if held low and flat.', 'Never mix bleach with ammonia or acid cleaners when killing mold. Rinse well between products.'],
        causes: [['Mold under the caulk', 'Black spots that won’t scrub off are growing under or inside the bead. Bleach won’t reach them; the caulk has to come out.'], ['Cracked or peeling bead', 'The joint moves every time the tub fills; old acrylic caulk loses its stretch.'], ['Gaps at the corner', 'Water gets behind the tile and rots the wall.'], ['Wrong caulk', 'Painter’s caulk or plain acrylic in a shower breaks down within a year.']],
        tools: ['Plastic razor scraper or caulk removal tool', 'Utility knife', 'Silicone caulk remover (for old silicone)', '100% silicone kitchen and bath caulk (mold-resistant)', 'Caulk gun with a smooth (dripless) rod', 'Painter’s tape', 'Rubbing alcohol (isopropyl) and lint-free rags', 'Paper towels and a small trash bag', 'Spray bottle with water + a drop of dish soap'],
        steps: [
          { t: 'Strip the old caulk', d: 'Slice along both edges of the bead with a utility knife, blade almost flat to the surface, then grab the end and peel it out. Scrape off the leftovers with a plastic razor. For a thin silicone film that won’t budge, rub on silicone caulk remover, wait the time on the label, and scrape again.', why: 'New silicone won’t bond to old silicone or soap scum. Any leftover film means the new bead peels within months.', tip: 'Caulk breaking into tiny crumbs? Warm it with a hair dryer for a minute; it softens and pulls out in longer strips.', ok: 'Drag a fingernail along the joint: it feels like bare tile and tub with no rubbery spots, and water beads evenly instead of sheeting off a film.', v: { cam: [0.9, 1.0, 1.0], at: [-0.5, 0.6, -0.4], hi: ['oldCaulk', 'scraper'] } },
          { t: 'Clean, kill mold and dry', d: 'Scrub the joint with a bathroom cleaner and rinse. If black mold stains remain in the gap, spray a mix of 1 part bleach to 10 parts water, wait 10 minutes and rinse. Finish by wiping with rubbing alcohol, then leave the joint to dry overnight with the fan running.', why: 'Silicone needs a clean, dry, oil-free surface to grip. Moisture trapped underneath lets mold grow right back.', tip: 'Point a small fan or hair dryer (on low) into the gap if you’re in a hurry, but don’t skip overnight drying if the joint was soaked; water hides deep in the gap.', ok: 'The joint looks bright and clean, and a dry paper towel pressed into the gap comes out with no damp spot.', v: { cam: [1.0, 1.2, 1.4], at: [0, 0.6, -0.4], hi: ['tub'], hide: ['oldCaulk'] } },
          { t: 'Fill the tub with water', d: 'For a tub (not a shower pan), put in the plug and fill it with water before you caulk, and leave it full until the caulk has skinned over. If you can, step in to add your weight while you work.', why: 'A full tub sinks slightly to its in-use position. Caulking it there means the bead isn’t stretched and torn the first time someone takes a bath.', tip: 'Lay a towel over the water so you don’t drop the caulk or tools into it, and so drips don’t splash the joint.', ok: 'The water is within a few inches of the overflow and the joint you’re about to caulk is still dry.', v: { cam: [1.6, 1.6, 2.4], at: [0, 0.6, -0.2], hi: ['tub'] } },
          { t: 'Tape both sides', d: 'Run painter’s tape along the tile about ⅛″ above the joint and along the tub about ⅛″ below it, so a ¼″ strip is left open. Press the tape edges down hard with a fingernail.', why: 'Tape gives two perfectly straight edges and catches the smear, so the finished bead looks factory-made.', tip: 'Keep the gap the same width all the way. At inside corners, overlap the tape ends rather than trying to bend one piece around.', ok: 'Two straight, parallel tape lines run the full length, with an even strip of bare joint between them and no wrinkles.', v: { cam: [0.9, 1.0, 1.0], at: [0, 0.6, -0.4], hi: ['tape'], show: ['tape'] } },
          { t: 'Lay one continuous bead', d: 'Cut the nozzle at 45° with a small hole, about ⅛″. Puncture the inner seal with the gun’s poker. Hold the gun at 45° and squeeze gently while moving steadily along the joint, pushing the bead ahead of the tip, from one corner to the other without stopping.', why: 'Pushing forces silicone into the gap instead of just laying it on top. One continuous pass has no stop-start lumps.', tip: 'Start squeezing a second before you move and release the trigger lever (the thumb catch) at the end so it stops oozing. Practice a bead on a paper towel first to find your speed.', ok: 'An even, unbroken bead fills the strip between the tapes, with no gaps or air bubbles.', v: { cam: [1.2, 1.1, 1.4], at: [0, 0.6, -0.4], hi: ['newCaulk', 'gun'], show: ['newCaulk', 'gun'], fx: 'bead' } },
          { t: 'Tool and pull the tape', d: 'Mist the bead lightly with soapy water, then smooth it in one steady stroke with a fingertip (in a disposable glove) or a caulk tool. Wipe your finger on a paper towel often. Pull the tape right away, slowly, folding it back on itself and away from the bead. Let it cure as the label says before showers, usually 24 hours.', why: 'Tooling presses the silicone into the joint and gives it a smooth, concave shape that sheds water. Silicone skins over in minutes, so tape pulled later tears the edge.', tip: 'Messed up a section? Wipe it off right away with a dry paper towel, then mineral spirits, and re-run that part. Don’t try to fix silicone once it has skinned.', ok: 'A smooth, slightly hollow bead with crisp straight edges, and a light touch after a few hours shows it has skinned and isn’t tacky.', v: { cam: [1.0, 1.0, 1.2], at: [0, 0.6, -0.4], hi: ['newCaulk'], hide: ['tape', 'gun'] } },
        ],
        tricks: [
          ['Read the cure label', 'Some silicones are shower-ready in 30 minutes, others need 24 hours or more. Use the time on your tube, and longer if the room is cold or humid.'],
          ['Pick true silicone', 'Look for “100% silicone” and a mold-resistance claim. “Siliconized acrylic” is paintable but doesn’t last in wet joints.'],
          ['Wide gaps need backer rod', 'If the gap is wider than about ¼″, press in a foam backer rod first so the caulk stays a uniform depth and stretches properly.'],
          ['Clean finger trick', 'Wear thin nitrile gloves and keep a roll of paper towels next to you. Wipe after every stroke.'],
          ['Leftover caulk', 'Push a long screw or nail into the nozzle and wrap it in tape. It keeps the tube usable for touch-ups.'],
          ['Don’t caulk the overflow side last', 'Start at the corner furthest from you and finish closest to you, so you’re never reaching over wet caulk.'],
          ['Keep it dry longer', 'Run the bath fan for 20 minutes after every shower. Dry joints don’t grow mold, and the bead lasts years longer.'],
        ],
        refs: [
          ['GE Silicone kitchen and bath sealant product information (Supply House Times)', 'https://supplyht.com/articles/102130-ge-silicones-kitchen-and-bath-silicone'],
          ['GE Silicone 2+ Kitchen and Bath (product listing with cure data, Lowe’s)', 'https://lowes.com/pd/GE-Silicone-2-2-8-oz-Almond-Silicone-Caulk/3102451'],
          ['How to Caulk a Tub (This Old House)', 'https://www.thisoldhouse.com/walls/21017017/how-to-caulk-a-tub'],
          ['Bath and kitchen caulking guidance (DAP)', 'https://www.dap.com/'],
        ],
        learn: {
          how: 'The joint between tub and wall moves every time the tub fills and someone steps in. Grout is rigid and cracks there; caulk stays flexible. 100% silicone sticks well to non-porous surfaces like tile, glass and enamel, stretches for years, and resists mold. It cures by pulling moisture from the air, which is why it skins in minutes but needs hours to cure through. It can’t be painted, and new silicone won’t stick to old.',
          specs: [['Nozzle cut', '≈ ⅛″ hole at 45°'], ['Bead width', '⅛–¼″'], ['Silicone skin time', '≈ 10–30 min'], ['Water-ready time', '30 min–24 hr (check the tube)'], ['Bleach rinse for mold', '1 part bleach : 10 parts water'], ['Application temperature', 'Typically 40–100 °F']],
          terms: [['100% silicone', 'Best for wet, unpainted joints.'], ['Siliconized acrylic', 'Paintable, cleans up with water, less durable in wet areas.'], ['Tooling', 'Smoothing the bead to press it into the joint.'], ['Skin time', 'When the surface stops being sticky; you can’t smooth it after this.'], ['Backer rod', 'Foam cord pushed into wide gaps before caulking.']],
          mistakes: ['Caulking over old caulk.', 'Using painter’s caulk in a shower.', 'Caulking a damp joint, which traps mold.', 'Running water before the cure time on the tube.', 'Using a huge nozzle hole that makes a fat, messy bead.'],
          tips: ['Check the bead twice a year and spot-fix any small lift before water gets behind it.'],
        },
        pro: 'Tiles are loose or cracked, grout is missing in large areas, or the wall behind feels soft when pressed. Water has probably already damaged the backer board behind the tile.',
      },
    ],
  });
})();
