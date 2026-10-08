/* DEK · Deck & patio */
(function () {
  /* ---- Model: deck corner with framing, boards and railing ---- */
  TB.model('deck', { cam: [3.4, 2.6, 3.6], at: [0, 0.8, 0], hidden: ['newBoard', 'bolts', 'sprayer', 'stain', 'washer'] }, (K) => {
    K.box(null, [5, 0.04, 5], 'grass', [0, -0.02, 0]);
    const posts = K.part('posts', [0, 0, 0], null, 'Support posts');
    [[-1.3, -1.0], [1.3, -1.0], [-1.3, 1.1], [1.3, 1.1]].forEach(([x, z]) => {
      K.box(posts, [0.14, 0.62, 0.14], 'woodDark', [x, 0.31, z]);
      K.cyl(posts, [0.14, 0.14, 0.06], 'concrete', [x, 0.03, z]);
    });
    const beams = K.part('beams', [0, 0, 0], null, 'Beams');
    K.box(beams, [2.9, 0.18, 0.1], 'woodDark', [0, 0.52, -1.0]);
    K.box(beams, [2.9, 0.18, 0.1], 'woodDark', [0, 0.52, 1.1]);
    const joists = K.part('joists', [0, 0, 0], null, 'Joists (16″ apart)');
    K.rep(7, (i) => K.box(joists, [0.05, 0.18, 2.5], 'wood', [-1.35 + i * 0.45, 0.7, 0.05]));
    const boards = K.part('boards', [0, 0, 0], null, 'Deck boards');
    for (let i = 0; i < 18; i++) {
      const z = -1.12 + i * 0.138;
      if (i === 9) continue;
      K.box(boards, [3.0, 0.035, 0.125], i % 3 ? 'wood' : K.std(0xa77649), [0, 0.81, z]);
    }
    const rot = K.part('rotBoard', [0, 0.81, -1.12 + 9 * 0.138], null, 'Rotted board');
    K.box(rot, [3.0, 0.035, 0.125], K.std(0x6e5a44, { roughness: 1 }));
    K.rep(5, (i) => K.sph(rot, 0.05, K.std(0x3e3a30), [-1.1 + i * 0.5, 0.012, 0], [1.6, 0.3, 0.8]));
    const pop = K.part('popped', [0, 0.84, 0], null, 'Popped nails');
    [[-0.45, -0.7], [0.45, 0.4], [0.9, -0.15]].forEach(([x, z]) => K.cyl(pop, [0.015, 0.015, 0.05], 'chrome', [x, 0, z]));
    const nb = K.part('newBoard', [0, 0.81, -1.12 + 9 * 0.138], null, 'New board');
    K.box(nb, [3.0, 0.035, 0.125], 'woodLight');
    // railing along front edge
    const rail = K.part('railing', [0, 0, 0], null, 'Railing');
    K.box(rail, [3.0, 0.06, 0.1], 'wood', [0, 1.75, 1.18]);
    K.box(rail, [3.0, 0.06, 0.06], 'wood', [0, 0.95, 1.18]);
    K.rep(20, (i) => K.box(rail, [0.04, 0.8, 0.04], 'wood', [-1.4 + i * 0.147, 1.35, 1.18]));
    const rp = K.part('railPost', [1.42, 0.5, 1.22], null, 'Wobbly rail post');
    K.box(rp, [0.1, 1.35, 0.1], 'woodDark', [0, 0.65, 0]);
    K.box(rail, [0.1, 1.35, 0.1], 'woodDark', [-1.42, 1.15, 1.22]);
    const bolts = K.part('bolts', [1.42, 0.62, 1.32], null, '½″ carriage bolts');
    K.cyl(bolts, [0.02, 0.02, 0.35], 'steel', [0, 0.06, -0.12], [90, 0, 0]);
    K.cyl(bolts, [0.02, 0.02, 0.35], 'steel', [0, -0.06, -0.12], [90, 0, 0]);
    K.cyl(bolts, [0.035, 0.035, 0.015], 'steel', [0, 0.06, 0.06], [90, 0, 0]);
    K.cyl(bolts, [0.035, 0.035, 0.015], 'steel', [0, -0.06, 0.06], [90, 0, 0]);
    const stain = K.part('stain', [0, 0.83, 0], null, 'Fresh stain / sealer');
    K.box(stain, [3.0, 0.004, 2.5], K.std(0x8a5530, { transparent: true, opacity: 0.55, roughness: 0.4 }));
    const sp = K.part('sprayer', [0.8, 1.2, 0.2], null, 'Pump sprayer');
    K.cyl(sp, [0.12, 0.12, 0.4], 'yellow', [0.3, -0.15, 0.3]);
    K.tube(sp, [[0.3, 0.05, 0.3], [0.1, 0.1, 0.1], [-0.2, -0.2, 0]], 0.012, 'black');
    K.cyl(sp, [0.015, 0.015, 0.4], 'grey', [-0.35, -0.25, 0], [0, 0, 60]);
    const ws = K.part('washer', [-0.8, 1.1, -0.3], null, 'Deck cleaner & brush');
    K.box(ws, [0.25, 0.05, 0.1], 'blue');
    K.cyl(ws, [0.015, 0.015, 1.0], 'woodLight', [0.2, 0.3, 0], [0, 0, -60]);
    return {
      tick(t, fx) {
        if (fx === 'spray') K.parts.sprayer.position.x = 0.8 * Math.sin(t * 1.2);
        if (fx === 'scrub') K.parts.washer.position.x = -0.8 + 0.5 * Math.sin(t * 3);
        if (fx === 'wobble') K.parts.railPost.rotation.x = 0.06 * Math.sin(t * 6);
        else if (K.parts.railPost.rotation.x && fx !== 'wobble') K.parts.railPost.rotation.x = 0;
      },
    };
  });

  TB.category({
    id: 'deck',
    code: 'DEK',
    name: 'Deck & Patio',
    domain: 'exterior',
    blurb: 'Rotted boards, wobbly rails and sealing',
    repairs: [
      {
        id: 'deck-board',
        title: 'Replace a rotted deck board',
        model: 'deck',
        level: 2,
        time: '1–2 hrs',
        cost: '$20–60',
        summary: 'Soft, cracked or spongy deck boards are a trip hazard and a sign water is sitting where it shouldn’t. You check the framing underneath, pull the old board, and screw down a new one with the right gap so it drains and dries.',
        intro: { hi: ['rotBoard', 'popped'] },
        safety: [
          'Probe the joists (the 2× boards the decking sits on) before anything else. If a screwdriver sinks in more than ¼″, or a joist, beam or the ledger (the board bolted to the house) is soft, stop and call a pro.',
          'Wear safety glasses when prying and cutting. Old nails snap and fly, and treated sawdust shouldn’t go in your eyes or lungs, so add a dust mask when you cut.',
          'Set a circular saw’s blade depth to the board thickness only, so you can’t cut into the joist below.',
        ],
        causes: [
          ['Water trapped on the board', 'Leaves, planters and rugs hold water against the wood for days.'],
          ['Unsealed cut ends', 'The cut end of a board drinks water like a bundle of straws. Untreated cores rot first.'],
          ['Popped nails', 'Nails work loose as the wood swells and shrinks, and rain runs down the holes.'],
          ['Tight gaps', 'Boards butted together hold debris and never dry out underneath.'],
        ],
        tools: ['Awl or flat screwdriver (probe)', 'Cat’s paw and flat pry bar', 'Drill/driver with the right screw bit', 'Circular saw or jigsaw + speed square', 'Matching board (pressure-treated, cedar or composite)', '2½″ coated or stainless deck screws (or the composite maker’s screws)', 'End-cut wood preservative (copper naphthenate) + brush', 'Butyl joist tape', '16d nail or ⅛″ spacer', 'Safety glasses, gloves, dust mask'],
        steps: [
          {
            t: 'Test the framing',
            d: 'Look through the gaps with a flashlight at the joists, the 2× boards under the decking. Press an awl or flat screwdriver into the top and sides of each joist the bad board crosses. Sound wood dents a little and pushes back; rotten wood lets the tip sink in more than ¼″ and feels spongy or stringy.',
            why: 'A new board screwed to a rotten joist won’t hold. Rot is a fungus that only grows when wood stays above about 20% moisture, so where the board rotted, the joist top may have too.',
            tip: 'Tap each joist with the butt of a screwdriver. Solid wood gives a sharp knock; rot sounds dull and hollow. If one joist top is soft but the rest of it is solid, a pro can sister (bolt) a new joist alongside instead of tearing the deck apart.',
            ok: 'The tip dents every joist less than ¼″ and each joist sounds a crisp knock when tapped.',
            v: { cam: [1.6, 0.6, 1.8], at: [0, 0.6, 0.1], hi: ['joists'], xray: true },
          },
          {
            t: 'Pull the fasteners',
            d: 'For screws, fit the matching bit (look at the head: Phillips, square or star), set the drill to its low-speed gear and press hard so the bit doesn’t slip. For nails, tap a cat’s paw (a small pry bar with a pointed claw) under the head and lever it out over a scrap block so you don’t dent the next board.',
            why: 'Every fastener has to come out, or the board will split and tear its neighbors when you lift it.',
            tip: 'If a screw head strips and the bit just spins, tap a screw-extractor bit in and back it out in reverse. If a nail head snaps off, leave the stub and set the new screw ½″ to one side.',
            ok: 'You can count an empty hole at every joist and the board shifts slightly when you push one end.',
            v: { cam: [1.6, 2.0, 1.8], at: [0, 0.82, 0.1], hi: ['rotBoard', 'popped'] },
          },
          {
            t: 'Lift out the board',
            d: 'Slip a flat bar under one end and lift gently, moving down the board one joist at a time. If an end is trapped under a railing post or the house trim, cut the board in a gap between joists with a jigsaw and lift the pieces out. Then sweep the joist tops clean and let them dry.',
            why: 'Lifting a little at a time keeps the bar from crushing the edges of the boards on either side.',
            tip: 'With the board out, you have the only clear view of the joist tops you’ll get for years. Brush preservative into any checks (cracks) and pull any old nails sticking up.',
            ok: 'The old board is out, the opening has clean square edges, and you can see the bare top of every joist it covered.',
            v: { cam: [2.2, 2.2, 2.4], at: [0, 0.9, 0.1], hi: ['rotBoard'], mv: { rotBoard: [0, 0.6, 1.8] }, rt: { rotBoard: [0, 20, 0] } },
          },
          {
            t: 'Cut and seal the new board',
            d: 'Measure the opening and cut the new board with a circular saw guided along a speed square. Each end must land on the middle of a joist with at least ¾″ of support. If it doesn’t, screw a 2×4 cleat to the side of the joist to carry it. Brush end-cut preservative on every cut end of treated wood and let it soak in.',
            why: 'Treatment chemicals only reach part way into a board. Cutting exposes the untreated core, and treated-wood makers require a coat of preservative on every cut.',
            tip: 'Take a scrap of the old board to the store. New treated wood is wetter and slightly wider; it will shrink about ⅛″ as it dries and fade to match in a season. For composite, match the brand and color line exactly.',
            ok: 'The board drops into the opening, both ends sit centered on solid wood, and the cut ends look dark and wet with preservative.',
            v: { cam: [2.2, 2.2, 2.4], at: [0, 1.0, 0.1], hi: ['newBoard'], show: ['newBoard'], hide: ['rotBoard'], mv: { newBoard: [0, 0.5, 0] } },
          },
          {
            t: 'Space and screw it down',
            d: 'Press a strip of joist tape on each joist top. Set the board with a 16d nail as a spacer for an ⅛″ gap (wet treated wood can go tighter; composite uses the maker’s gap, often 3⁄16″). Drill pilot holes within 2″ of the ends, then drive two screws per joist about ¾″ from each edge, just flush.',
            why: 'The gap lets rain drain and air dry the boards. Screws grip far better than nails and won’t pop up as the wood moves.',
            tip: 'If the board is bowed, screw one end, then lever the middle into line with a chisel driven into the joist beside it while you screw. Stop driving the moment the head is flush; a sunk head cups water.',
            ok: 'The gap looks even along the whole length, every screw head sits flush, and the board feels solid when you step on it.',
            v: { cam: [1.4, 2.0, 1.6], at: [0, 0.82, 0.1], hi: ['newBoard'], mv: { newBoard: [0, 0, 0] }, hide: ['popped'] },
          },
        ],
        tricks: [
          ['Flip, don’t buy', 'If a board is only weathered or cupped on top and solid underneath, flip it over and reuse it. The bottom face is often like new.'],
          ['Clear the gaps first', 'Run a putty knife or a gap tool down every gap before and after. Packed debris holds water and rots the board edges and joist tops.'],
          ['Match the screws to the wood', 'Treated wood needs hot-dipped galvanized, coated deck screws or stainless. Cedar and redwood need stainless, or black streaks appear. Plain interior screws rust out in a year.'],
          ['Pre-drill near the ends', 'Any screw within 2″ of a board end splits it. A quick pilot hole with a ⅛″ bit fixes that.'],
          ['Buy a spare board', 'Buy one more board than you need. A split or a wrong cut won’t send you back to the store.'],
          ['Tape every joist you can reach', 'Butyl joist tape seals around each screw and keeps water off the joist top, which is where rot usually starts.'],
        ],
        refs: [
          ['Replacing deck boards (Family Handyman)', 'https://www.familyhandyman.com/project/replacing-deck-boards/'],
          ['How to remove and replace old deck boards (Decks Direct)', 'https://www.decksdirect.com/knowledge-builders/how-to-remove-and-replace-old-deck-boards'],
          ['How to replace deck boards (Decks.com)', 'https://decks.com/how-to/articles/how-to-replace-deck-boards'],
          ['DCA 6 Prescriptive Residential Wood Deck Construction Guide (American Wood Council)', 'https://shop.awc.org/?p=407'],
          ['Trex deck board spacing (Advantage Lumber)', 'https://blog.advantagelumber.com/2023/11/22/trex-deck-board-spacing/'],
        ],
        learn: {
          how: 'A deck is a stack of layers: concrete footings, posts, beams, joists, and the walking surface on top. The boards get the worst of it, with rain from above and trapped moisture from below. Rot is a fungus that only grows when wood stays wetter than about 20% moisture, so gaps, sealed cut ends and good airflow under the deck keep boards below that line and stop rot before it starts.',
          specs: [['Board gap (dry wood)', '≈ ⅛″ (16d nail)'], ['Board gap (composite)', 'per maker, often 3⁄16″ side to side'], ['Fasteners', '2 per joist, ≈ ¾″ from edges'], ['Joist spacing', '16″ on center (12″ for diagonal or some composites)'], ['Board-end support', '≥ ¾″ on a joist or cleat'], ['Probe test fail', 'tip sinks > ¼″'], ['Rot risk', 'wood moisture > 20%']],
          terms: [['Joist', 'The 2× boards on edge that hold up the deck boards.'], ['Pressure-treated (PT)', 'Lumber forced full of preservative under pressure to resist rot and insects.'], ['On center (o.c.)', 'Measured from the middle of one joist to the middle of the next.'], ['Cleat', 'A short block screwed to a joist’s side to support a board end.'], ['Joist tape', 'Sticky butyl strip that seals the top of a joist.'], ['Ledger', 'The board bolted to the house that the deck hangs from. Inspect it closely.']],
          mistakes: ['Using interior or plain steel screws, which corrode in treated lumber.', 'Butting boards with no gap.', 'Leaving a board end hanging past its support.', 'Skipping preservative on cut ends.', 'Ignoring a soft joist.'],
          tips: ['Run butyl joist tape along the tops of the joists before laying new boards.', 'Keep planters on feet so the board under them can dry.'],
        },
        pro: 'The ledger board, joists, beams or posts are soft or cracked, the deck sways or bounces when you walk on it, or the ledger isn’t bolted to the house.',
      },
      {
        id: 'deck-rail',
        title: 'Wobbly deck railing post',
        model: 'deck',
        level: 2,
        time: '1–3 hrs',
        cost: '$15–60',
        summary: 'A rail post that moves is a fall risk. Two ½″ through-bolts into the rim joist, plus a metal tension tie back to a joist, turn a nailed or screwed post into one that meets today’s code.',
        intro: { hi: ['railPost'], fx: 'wobble' },
        safety: [
          'Keep everyone off and away from the railing until it’s fixed. Tape it off if kids are around.',
          'The code load for a guard is 200 lb pushed outward at the top in any direction. Nails and lag screws alone rarely pass.',
          'Look at the post base and the rim joist (the outer board the post bolts to) for rot first. Bolting into rotten wood does nothing.',
          'Wear safety glasses when drilling; long auger bits grab and can twist the drill.',
        ],
        causes: [
          ['Nailed or lag-screwed post', 'Nails and lag screws loosen as the wood shrinks and swells each season.'],
          ['Rot at the base or rim', 'Water collects in the bolt holes and at the end grain of the post.'],
          ['Notched post', 'Posts cut to half their thickness to fit the rim are weak right where the leverage is greatest.'],
          ['No tie to a joist', 'A post bolted only to the rim pries the rim board outward, away from the joists.'],
        ],
        tools: ['Drill with a ½″ auger or ship bit (at least 8″ long)', 'Two ½″ hot-dipped galvanized carriage or hex bolts (long enough to pass through post and rim plus 1″), washers and nuts', 'Deck tension tie (e.g. Simpson DTT2Z) with its screws', '2× blocking if needed', 'Socket wrench', 'Bar clamp', '2 ft level', 'Exterior sealant'],
        steps: [
          {
            t: 'Plumb and clamp the post',
            d: 'Push the post upright and hold a level on two neighboring faces. When the bubble is centered on both, clamp the post tight to the rim joist with a bar clamp. Pull out any loose nails or lag screws that are holding it crooked.',
            why: 'Bolting freezes the post at whatever angle it’s at, so get it straight first. Plumb means perfectly vertical.',
            tip: 'If the post won’t stand plumb because old holes are wallowed out, fill them with a glued-in hardwood dowel, let it dry, and drill fresh holes beside them.',
            ok: 'The level’s bubble sits between the lines on two side-by-side faces, and the post can’t rock in the clamp.',
            v: { cam: [2.6, 1.4, 2.6], at: [1.42, 0.9, 1.2], hi: ['railPost'] },
          },
          {
            t: 'Drill through post and rim',
            d: 'Mark two holes on the post, spaced as far apart vertically as the rim allows, each about 2″ from the rim’s top and bottom edges. Drill straight through post and rim with a ½″ bit, holding the drill level. Ease off the trigger as the bit breaks through so it doesn’t splinter the back.',
            why: 'Two bolts far apart resist the post turning like a lever. One bolt lets it pivot.',
            tip: 'Have a helper watch the drill from the side to keep it square. If the bit wanders, drill from both sides to meet in the middle.',
            ok: 'A bolt slides through each hole with light taps and comes out square on the inside of the rim.',
            v: { cam: [2.6, 1.0, 2.4], at: [1.42, 0.65, 1.2], hi: ['bolts', 'railPost'], show: ['bolts'], xray: true },
          },
          {
            t: 'Install the bolts',
            d: 'Squirt a little exterior sealant in each hole. Tap the carriage bolts in from the outside until the square neck seats, then add a washer and nut inside. Tighten with a socket until the washer just starts to press into the wood, then stop.',
            why: 'The carriage bolt’s square neck grips the wood so the bolt doesn’t spin while you turn the nut. The washer spreads the clamping force so the nut doesn’t sink in.',
            tip: 'If the bolt spins as you tighten, hold the head with locking pliers, or tap it in deeper. Recheck the nuts after a dry month, since the wood shrinks.',
            ok: 'The washers are snug against the wood, the bolt heads sit flush outside, and the post no longer moves at the base.',
            v: { cam: [2.2, 0.8, 0.6], at: [1.42, 0.62, 1.1], hi: ['bolts'] },
          },
          {
            t: 'Tie the post back to a joist',
            d: 'Screw a tension tie (a heavy steel bracket such as a DTT2Z) to the joist beside or behind the post with its supplied screws. Run the lower bolt through it and tighten. If no joist is within reach, add 2× blocking between joists first and fasten the tie to that.',
            why: 'Without the tie, the post just pries the rim board off the joist ends. The tie carries the load back into the deck’s framing, the way the American Wood Council deck guide shows it.',
            tip: 'Buy the tie before drilling so the lower bolt hole lines up with it. A 6″ or longer bolt may be needed to reach through post, rim and bracket.',
            ok: 'The bracket sits flat against the joist with every screw driven fully, and the bolt nut is tight against the bracket.',
            v: { cam: [2.2, 0.8, 0.6], at: [1.42, 0.62, 1.1], hi: ['bolts'] },
          },
          {
            t: 'Push test',
            d: 'Stand on the deck and push hard outward at the top rail beside the post, then pull back. Lean your body weight into it.',
            why: 'Guards are designed for someone falling into them, not just leaning. A solid post should feel like part of the deck.',
            tip: 'If the post still flexes but the base is tight, the post itself may be cracked or too thin (a 4×4 is the minimum). A notched post usually needs replacing, not more bolts.',
            ok: 'The top of the post moves less than about ¼″ and you feel no click or shift at the base.',
            v: { cam: [3.4, 2.6, 3.6], at: [0.6, 1.2, 1.0], hi: ['railPost', 'railing'] },
          },
        ],
        tricks: [
          ['Fix one, check them all', 'Grab and shake every post on the deck. If one was loose, others were built the same way.'],
          ['Galvanized means hot-dipped', 'Use hot-dipped galvanized or stainless bolts. Thin zinc-plated hardware rusts fast in treated wood.'],
          ['Block it if in doubt', 'Blocking between two joists right behind the post costs one 2× and makes the whole corner stiffer.'],
          ['Seal the holes', 'A dab of sealant in each hole and under each washer keeps water out of the bolt holes, where rot starts.'],
          ['Use a long bit, not an extension', 'A single long auger bit drills straighter than a short bit on an extension.'],
          ['Snug, not crushed', 'Tighten nuts until washers just bite. Cranking until the washer sinks crushes the wood fibers and loosens later.'],
        ],
        refs: [
          ['Code-compliant guardrail posts (Journal of Light Construction)', 'https://www.jlconline.com/how-to/exteriors/code-compliant-guardrail-posts_o/'],
          ['DCA 6 Prescriptive Residential Wood Deck Construction Guide (American Wood Council)', 'https://shop.awc.org/?p=407'],
          ['DTT2Z deck tension tie (Simpson Strong-Tie, via Hancock Lumber)', 'https://shop.hancocklumber.com/product/simpson-dtt2z-deck-tension-tie'],
          ['Tips for fixing a wobbly deck railing (Fortress Building Products)', 'https://fortressbp.com/blog/162/tips-for-fixing-a-wobbly-deck-railing-diy-railing-fixes'],
          ['How to fix a loose deck railing post (Fix Up First)', 'https://fixupfirst.com/blog/how-to-fix-a-loose-deck-railing-post/'],
        ],
        learn: {
          how: 'A rail post works as a lever. A 200 lb push at the top of a 36″ post puts a much bigger prying force on the bolts at the bottom. Nails pull straight out under that leverage. Through-bolts clamp the post to the rim, and a tension tie anchored to a joist stops the rim from peeling away, so the whole deck frame resists the push.',
          specs: [['Guard height (homes)', '36″ min where the deck is over 30″ above grade'], ['Design load', '200 lb at the top, any direction'], ['Baluster gap', 'a 4″ ball must not pass'], ['Bolts', 'two ½″ through-bolts, hot-dipped galvanized'], ['Post size', '4×4 min, not notched']],
          terms: [['Rim joist', 'The outer framing board the posts attach to.'], ['Carriage bolt', 'Round-head bolt with a square neck that bites into wood.'], ['Tension tie (hold-down)', 'Steel bracket that ties the post bolt back to a joist.'], ['Blocking', 'Short 2× pieces fitted between joists to stiffen them.'], ['Plumb', 'Perfectly vertical.']],
          mistakes: ['Using lag screws alone.', 'Putting both bolts close together.', 'Bolting into a rotten rim.', 'Leaving holes unsealed.'],
          tips: ['Add blocking between joists behind the post for an even stiffer post.', 'Re-tighten nuts after the first dry season.'],
        },
        pro: 'The rim joist or post is rotten, posts are notched more than half their thickness, or the whole railing system is loose.',
      },
      {
        id: 'deck-seal',
        title: 'Clean & seal a deck',
        model: 'deck',
        level: 1,
        time: 'A weekend',
        cost: '$80–200',
        summary: 'Gray, splintering wood needs cleaning and a penetrating stain or sealer every 2–3 years. If water soaks in instead of beading, it’s time. The secret is in the prep: clean, dry wood soaks up finish, dirty or damp wood peels.',
        intro: { hi: ['boards'] },
        safety: [
          'Wear gloves and eye protection with deck cleaners and brighteners; they sting skin and eyes.',
          'Oil-soaked rags can heat up and catch fire on their own. Lay them flat outdoors to dry, or seal them in a metal can filled with water.',
          'Wet plants and grass next to the deck before and after cleaning, and cover anything delicate.',
          'A pressure washer can cut wood and skin. Keep it at low pressure and never point it at anyone.',
        ],
        causes: [
          ['UV graying', 'Sunlight breaks down lignin, the glue that holds wood fibers together, leaving loose gray fibers.'],
          ['Mildew', 'Black spots in shady, damp corners.'],
          ['Worn finish', 'Water soaks in rather than beading.'],
        ],
        tools: ['Oxygen-bleach deck cleaner (sodium percarbonate)', 'Wood brightener (oxalic acid), optional', 'Stiff synthetic deck brush on a pole', 'Garden hose; pressure washer only on low', 'Pump sprayer, stain pad or roller, and a 4″ brush', 'Penetrating semi-transparent deck stain or sealer', 'Painter’s tape and plastic sheeting', 'Moisture meter (optional, about $25)'],
        steps: [
          {
            t: 'Do the water test',
            d: 'Sprinkle a cup of water on boards in sun and in shade. If it beads up and sits there, the old finish still works; wait a season. If it darkens the wood and soaks in within about 10 minutes, the deck needs sealing.',
            why: 'Sealer only works if it can soak in. Putting it over a finish that still repels water just leaves a sticky film.',
            tip: 'Test new pressure-treated decks the same way. Most need weeks to months of drying before they’ll take stain, and the water test tells you when.',
            ok: 'Water darkens the wood and disappears into it within 10 minutes.',
            v: { cam: [2.4, 2.4, 2.6], at: [0, 0.8, 0], hi: ['boards'] },
          },
          {
            t: 'Clean the boards',
            d: 'Sweep, wet the deck and plants, then apply oxygen-bleach cleaner with a pump sprayer. Let it sit 10–15 minutes without drying out, scrub along the grain with a stiff brush, and rinse well. A pressure washer is optional: 500–1,200 psi, a 25–40° tip, 12″ from the wood, moving with the grain.',
            why: 'Stain can’t soak through dirt, mildew and loose gray fibers. It sticks to them, then peels off with them.',
            tip: 'If the wood still looks blotchy or dark after cleaning, spray on a wood brightener and rinse. It neutralizes the cleaner and pulls the wood back to a fresh tan color. Fuzzy raised fibers mean the pressure was too high; sand them lightly once dry.',
            ok: 'Rinse water runs clear, the wood looks evenly light tan, and no black mildew spots remain.',
            v: { cam: [2.4, 2.4, 2.6], at: [-0.4, 0.8, -0.2], hi: ['washer'], show: ['washer'], fx: 'scrub' },
          },
          {
            t: 'Let it dry',
            d: 'Wait at least 48 hours of dry weather. Then check: the boards should look evenly pale, with no dark damp patches in shady spots. A moisture meter should read under about 15%.',
            why: 'Wet wood is already full of water, so the sealer has nowhere to go. It sits on top and flakes.',
            tip: 'Check the forecast before you start cleaning: you need two dry days to dry and one more to stain.',
            ok: 'The boards feel dry and warm to your palm, and a sprinkle of water soaks in right away.',
            v: { cam: [3.4, 2.6, 3.6], at: [0, 0.8, 0], hi: ['boards'], hide: ['washer'] },
          },
          {
            t: 'Apply the sealer',
            d: 'Stir the stain (don’t shake it). Tape off the house siding. Do the railings first, then the floor two or three boards at a time, the full length of each board. Spray or roll on a thin coat and brush it in right away. Work at 50–90 °F, in shade or early morning, with no rain for 24–48 hours.',
            why: 'Finishing whole boards end to end without stopping prevents lap marks where wet stain meets dry stain.',
            tip: 'If a spot soaks in right away and looks dry, the wood is thirsty; give it a second thin coat while the first is still wet if the label allows wet-on-wet. Never let a coat dry and then add a heavy one on top.',
            ok: 'Each board has an even color end to end with no shiny puddles or dry streaks.',
            v: { cam: [2.6, 2.4, 2.8], at: [0, 0.85, 0], hi: ['sprayer', 'stain'], show: ['sprayer', 'stain'], fx: 'spray' },
          },
          {
            t: 'Wipe off the excess',
            d: 'After 20–30 minutes, look across the deck toward the light. Brush out or wipe any glossy puddles with a rag. Keep feet off for 24 hours and furniture off for 48.',
            why: 'Penetrating finishes are meant to soak in. Anything left on the surface stays tacky, collects dirt and peels.',
            tip: 'Lay used rags flat on the driveway to dry, or drop them in a metal can of water with a lid. A crumpled oily rag can heat itself to a fire.',
            ok: 'Looking across the boards toward the light, the surface has a soft, even sheen and no wet-looking shiny spots.',
            v: { cam: [3.4, 2.6, 3.6], at: [0, 0.8, 0], hi: ['stain'], hide: ['sprayer'] },
          },
        ],
        tricks: [
          ['Test the color first', 'Stain a scrap or a hidden board and let it dry. Color on the can is never what you get on your gray wood.'],
          ['Rails first, floor last', 'Drips from the rails land on boards you haven’t stained yet, and you stain your way off the deck toward the stairs.'],
          ['Use a stain pad on a pole', 'A pad on a pole puts on a thinner, more even coat than a roller and saves your back.'],
          ['Morning shade wins', 'Stain that dries too fast in direct sun leaves lap marks. Follow the shade around the deck.'],
          ['Semi-transparent beats solid on floors', 'Solid stain is a paint-like film that peels on walking surfaces. Penetrating semi-transparent wears away gently and recoats easily.'],
          ['Two thin beats one thick', 'A thick coat never fully soaks in. If you want more color, do two light coats.'],
        ],
        refs: [
          ['Cleaning wood decks (Journal of Light Construction)', 'https://www.jlconline.com/deck-builder/cleaning-wood-decks_o/'],
          ['Oxygen bleach deck cleaning (Ask the Builder)', 'https://www.askthebuilder.com/oxygen-bleach-deck-cleaning/'],
          ['Cleaning wood decks (Treated Wood / Southern Pine)', 'https://www.treatedwood.com/woodchat/part-5-cleaning-wood-decks'],
          ['Power washing a deck (Family Handyman)', 'https://www.familyhandyman.com/decks/deck-rescue-renew-your-deck'],
          ['How to stain pressure-treated wood (Bob Vila)', 'https://bobvila.com/articles/staining-pressure-treated-wood'],
        ],
        learn: {
          how: 'Wood swells when it gets wet and shrinks as it dries. Every cycle stresses the surface fibers until they crack and splinter. A penetrating stain slows how fast water moves in and out, and the pigment in it blocks UV light, which is what breaks down the wood’s surface and turns it gray. Clear sealers have little pigment, so they protect for a shorter time.',
          specs: [['Reseal interval', '2–3 years (floors wear first)'], ['Pressure washer', '500–1,200 psi, 25–40° tip, 12″ away'], ['Dry time before sealing', '≥ 48 hr'], ['Wood moisture', '< 15% (meter)'], ['Application temperature', '50–90 °F'], ['Rain-free after', '24–48 hr']],
          terms: [['Semi-transparent stain', 'Shows wood grain but blocks more UV than clear.'], ['Brightener', 'Mild acid rinse that restores wood color after cleaning.'], ['Back-brushing', 'Brushing right after spraying to work finish in.'], ['Wet edge', 'Keeping the edge you’re working toward wet so laps blend.']],
          mistakes: ['Pressure washing on high, which gouges and raises fuzz.', 'Applying film-forming paint-like finishes to walking surfaces; they peel.', 'Sealing in direct midday sun.', 'Staining wood that’s still damp.'],
          tips: ['Do railings first so drips fall onto unfinished boards.', 'Keep the same product brand year to year; switching between oil and water-based may require stripping.'],
        },
        pro: 'The deck has peeling solid stain or paint that needs stripping, or it’s large and multi-level.',
      },
    ],
  });
})();
