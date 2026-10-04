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
        summary: 'Soft, cracked or spongy boards are a trip and fall hazard. Pull the board, check the joists under it, and screw down a new one.',
        intro: { hi: ['rotBoard', 'popped'] },
        safety: ['Probe the joists under the board with a screwdriver. If it sinks in more than ¼″, the framing needs a pro.', 'Wear safety glasses when prying; nails can snap and fly.'],
        causes: [['Water trapped on the board', 'Leaves and planters hold moisture.'], ['End-grain checks', 'Cut ends never sealed.'], ['Popped nails', 'Water runs into the nail holes.']],
        tools: ['Cat’s paw or flat pry bar', 'Hammer', 'Drill/driver', 'Circular saw', '2½″ coated deck screws', 'Matching board (pressure-treated or composite)', 'End-grain sealer', '16d nail (gap spacer)'],
        steps: [
          { t: 'Test the framing', d: 'Probe the joists under the bad board with a screwdriver.', why: 'A new board on a rotten joist won’t hold. This is the go/no-go check.', v: { cam: [1.6, 0.6, 1.8], at: [0, 0.6, 0.1], hi: ['joists'], xray: true } },
          { t: 'Pull the fasteners', d: 'Back out screws or pry up nails along the board.', why: 'Pull every fastener so the board lifts without splitting its neighbors.', v: { cam: [1.6, 2.0, 1.8], at: [0, 0.82, 0.1], hi: ['rotBoard', 'popped'] } },
          { t: 'Lift out the board', d: 'Pry the board up from one end and remove it.', why: 'Lift gently from one end so the neighboring boards aren’t damaged.', v: { cam: [2.2, 2.2, 2.4], at: [0, 0.9, 0.1], hi: ['rotBoard'], mv: { rotBoard: [0, 0.6, 1.8] }, rt: { rotBoard: [0, 20, 0] } } },
          { t: 'Cut and seal the new board', d: 'Cut the new board to length and brush end-grain sealer on the cut ends.', why: 'Cut ends soak up water like a straw. Sealing them is what makes the board last.', v: { cam: [2.2, 2.2, 2.4], at: [0, 1.0, 0.1], hi: ['newBoard'], show: ['newBoard'], hide: ['rotBoard'], mv: { newBoard: [0, 0.5, 0] } } },
          { t: 'Space and screw it down', d: 'Set the board bark side up with a 16d nail as a gap spacer. Drive two screws per joist, ¾″ from the edges.', why: 'The gap (≈⅛″) drains water and lets air dry the boards. Screws hold far better than nails.', v: { cam: [1.4, 2.0, 1.6], at: [0, 0.82, 0.1], hi: ['newBoard'], mv: { newBoard: [0, 0, 0] }, hide: ['popped'] } },
        ],
        learn: {
          how: 'A deck is a stack of layers: concrete footings, posts, beams, joists, and the walking surface. Boards are the most exposed layer, getting rain from above and trapped moisture from below. Rot is a fungus that needs wood moisture above roughly 20%. Gaps, sealed ends and good airflow keep boards below that.',
          specs: [['Board gap', '⅛–¼″'], ['Screws per joist', '2'], ['Joist spacing', '16″ on center'], ['Rot risk', 'wood moisture > 20%']],
          terms: [['Pressure-treated (PT)', 'Lumber infused with preservatives against rot and insects.'], ['Bark side up', 'The growth rings curve down, so boards shed water.'], ['Ledger', 'Board bolting the deck to the house; inspect it closely.']],
          mistakes: ['Using interior or uncoated screws, which corrode in treated lumber.', 'Butting boards with no gap.', 'Ignoring a soft joist.'],
          tips: ['Run a bead of butyl joist tape on top of joists before laying new boards.'],
        },
        pro: 'The ledger board, joists, beams or posts are soft or cracked, or the deck sways when walked on.',
      },
      {
        id: 'deck-rail',
        title: 'Wobbly deck railing post',
        model: 'deck',
        level: 2,
        time: '1–2 hrs',
        cost: '$15–40',
        summary: 'A rail post that moves is a fall risk. Through-bolts into the rim joist turn a nailed post into a solid one.',
        intro: { hi: ['railPost'], fx: 'wobble' },
        safety: ['Keep people off the railing until it’s fixed.', 'Code typically requires guard posts to resist a 200 lb outward push.'],
        causes: [['Nailed or lag-screwed post', 'Nails and lag screws loosen as the wood shrinks and swells.'], ['Rot at the base', 'Water collects at the bolt holes.']],
        tools: ['Drill with ½″ auger bit (long)', '½″ galvanized carriage bolts, washers, nuts', 'Socket wrench', 'Hammer', 'Clamp', 'Level'],
        steps: [
          { t: 'Plumb the post', d: 'Push the post upright and clamp it to the rim joist. Check it with a level.', why: 'Bolting locks in whatever angle the post is at, so get it plumb first.', v: { cam: [2.6, 1.4, 2.6], at: [1.42, 0.9, 1.2], hi: ['railPost'] } },
          { t: 'Drill through post and rim', d: 'Drill two ½″ holes through the post and rim joist, staggered vertically about 4″ apart.', why: 'Two bolts spread the load and resist rotation. One bolt lets the post pivot.', v: { cam: [2.6, 1.0, 2.4], at: [1.42, 0.65, 1.2], hi: ['bolts', 'railPost'], show: ['bolts'], xray: true } },
          { t: 'Install carriage bolts', d: 'Tap the bolts through from the outside, add washers and nuts inside, and tighten until the post is solid.', why: 'The carriage head’s square neck bites the wood so the bolt doesn’t spin as you tighten the nut.', v: { cam: [2.2, 0.8, 0.6], at: [1.42, 0.62, 1.1], hi: ['bolts'] } },
          { t: 'Push test', d: 'Push hard outward at the top rail. It should feel rigid.', why: 'Guards are designed for someone falling into them, not just leaning.', v: { cam: [3.4, 2.6, 3.6], at: [0.6, 1.2, 1.0], hi: ['railPost', 'railing'] } },
        ],
        learn: {
          how: 'A rail post works as a lever. A push at the top rail puts a huge prying force on the connection at the bottom. Nails pull out under that kind of leverage; through-bolts clamp the post to the rim joist so the force is resisted by the wood itself.',
          specs: [['Guard height (residential)', '36″ min'], ['Outward load', '200 lb at top'], ['Baluster gap', '< 4″']],
          terms: [['Rim joist', 'Outer framing board the posts attach to.'], ['Carriage bolt', 'Round-head bolt with a square neck.'], ['Plumb', 'Perfectly vertical.']],
          mistakes: ['Using lag screws alone.', 'Not sealing the drilled holes with caulk or bolt sleeves.'],
          tips: ['Add a blocking piece between joists behind the post for even stiffer support.'],
        },
        pro: 'The rim joist is rotten, or posts are notched more than half their thickness.',
      },
      {
        id: 'deck-seal',
        title: 'Clean & seal a deck',
        model: 'deck',
        level: 1,
        time: 'A weekend',
        cost: '$80–200',
        summary: 'Graying, splintering wood needs cleaning and a penetrating sealer every 2–3 years. If water no longer beads on the boards, it’s time.',
        intro: { hi: ['boards'] },
        safety: ['Wear gloves and eye protection with deck cleaners.', 'Oil-soaked rags can catch fire on their own. Lay them flat to dry or store them in water.'],
        causes: [['UV graying', 'Sunlight breaks down the wood’s surface lignin.'], ['Mildew', 'Dark spots in shaded areas.'], ['Worn finish', 'Water soaks in rather than beading.']],
        tools: ['Oxygen-bleach deck cleaner', 'Stiff deck brush on a pole', 'Garden hose (pressure washer only on low)', 'Pump sprayer or roller and brush', 'Penetrating oil-based or water-based semi-transparent stain', 'Painter’s tape'],
        steps: [
          { t: 'Do the water test', d: 'Sprinkle water on the boards. If it soaks in within 10 minutes, the wood needs sealing.', why: 'Beading means the existing finish still works; don’t seal over it.', v: { cam: [2.4, 2.4, 2.6], at: [0, 0.8, 0], hi: ['boards'] } },
          { t: 'Clean the boards', d: 'Apply cleaner, let it dwell 10–15 minutes, scrub with the grain, and rinse well.', why: 'Sealer can’t penetrate dirt, mildew and gray fibers. It will peel off them instead.', v: { cam: [2.4, 2.4, 2.6], at: [-0.4, 0.8, -0.2], hi: ['washer'], show: ['washer'], fx: 'scrub' } },
          { t: 'Let it dry', d: 'Wait 48 hours of dry weather.', why: 'Wet wood can’t absorb sealer. It sits on top and flakes.', v: { cam: [3.4, 2.6, 3.6], at: [0, 0.8, 0], hi: ['boards'], hide: ['washer'] } },
          { t: 'Apply the sealer', d: 'Work 2–3 boards at a time, full length, keeping a wet edge. Back-brush to push it in.', why: 'Finishing whole boards without stopping prevents lap marks where wet meets dry.', v: { cam: [2.6, 2.4, 2.8], at: [0, 0.85, 0], hi: ['sprayer', 'stain'], show: ['sprayer', 'stain'], fx: 'spray' } },
          { t: 'Wipe excess', d: 'After 20–30 minutes, wipe or back-brush any glossy puddles.', why: 'Penetrating finishes should soak in. Surface puddles stay tacky and attract dirt.', v: { cam: [3.4, 2.6, 3.6], at: [0, 0.8, 0], hi: ['stain'], hide: ['sprayer'] } },
        ],
        learn: {
          how: 'Wood absorbs and releases moisture constantly. Each cycle swells and shrinks the surface fibers, causing checks and splinters. A penetrating sealer slows how fast water moves in and out, and pigment in the stain blocks UV, which is what turns wood gray.',
          specs: [['Reseal interval', '2–3 years'], ['Dry time before sealing', '48 hr'], ['Ideal temperature', '50–90 °F'], ['Rain-free after', '24–48 hr']],
          terms: [['Semi-transparent stain', 'Shows grain but blocks more UV than clear.'], ['Back-brushing', 'Brushing right after spraying to work finish in.'], ['Wet edge', 'Keeping the leading edge wet so laps blend.']],
          mistakes: ['Pressure washing on high, which raises fuzz.', 'Applying film-forming paint-like finishes to walking surfaces; they peel.', 'Sealing in direct midday sun.'],
          tips: ['Do railings first so drips fall onto unfinished boards.'],
        },
        pro: 'The deck has peeling solid stain or paint that needs stripping, or it’s large and multi-level.',
      },
    ],
  });
})();
