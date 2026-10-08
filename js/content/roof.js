/* ROF · Roof & gutters */
(function () {
  /* ---- Model: asphalt-shingle roof section ---- */
  TB.model('roof', { cam: [2.2, 3.2, 3.2], at: [0, 1.6, 0], hidden: ['newShingle', 'flatbar'] }, (K) => {
    K.box(null, [3.0, 1.2, 2.2], K.std(0xd8cfc0), [0, 0.6, -0.2]);
    const deck = K.group(null, [0, 1.25, 0.9], [26, 0, 0]);
    const sheathing = K.part('sheathing', [0, 0, 0], deck, 'Roof deck (plywood)');
    K.box(sheathing, [3.2, 0.04, 2.6], K.std(0xc9a46e), [0, 0, -1.3]);
    const W = 0.36;
    for (let row = 0; row < 9; row++) {
      const z = -0.15 - row * 0.24;
      const off = row % 2 ? W / 2 : 0;
      for (let i = 0; i < 9; i++) {
        const x = -1.44 + i * W + off;
        if (x > 1.5) continue;
        const isDam = row === 3 && i === 4;
        const parent = isDam ? K.part('damaged', [x, 0.035 + row * 0.004, z], deck, 'Damaged shingle tab') : deck;
        const pos = isDam ? [0, 0, 0] : [x, 0.035 + row * 0.004, z];
        K.box(parent, [W - 0.01, 0.016, 0.34], isDam ? K.std(0x6b5f55) : row % 3 ? 'dark' : K.std(0x44494f), pos);
      }
    }
    const nails = K.part('nails', [0.0, 0.07, -0.95], deck, 'Nails under the tab above');
    [-0.24, -0.08, 0.08, 0.24].forEach((x) => K.cyl(nails, [0.015, 0.015, 0.012], 'chrome', [x + 0.0, 0, 0]));
    const ns = K.part('newShingle', [0.0, 0.5, -0.87], deck, 'New shingle');
    K.box(ns, [W * 3, 0.016, 0.34], K.std(0x3c4148));
    const bar = K.part('flatbar', [0.3, 0.25, -0.5], deck, 'Flat bar');
    K.box(bar, [0.06, 0.02, 0.6], 'steel', [0, 0, 0], [0, 25, 0]);
    const seal = K.part('sealant', [0, 0.06, -0.78], deck, 'Roofing cement dabs');
    [-0.3, -0.1, 0.1, 0.3].forEach((x) => K.sph(seal, 0.02, 'black', [x, 0, 0], [1.4, 0.5, 1]));
    return {};
  });

  /* ---- Model: gutter + downspout on an eave ---- */
  TB.model('gutter', { cam: [2.0, 3.0, 3.2], at: [0, 1.9, 0], hidden: ['hose'] }, (K) => {
    K.box(null, [3.4, 2.2, 0.1], K.std(0xd8cfc0), [0, 1.1, -0.3]);
    K.box(null, [3.6, 0.04, 1.0], 'dark', [0, 2.35, 0.0], [-20, 0, 0]);
    K.box(null, [3.4, 0.22, 0.04], 'offwhite', [0, 2.15, 0.18]);
    const g = K.part('gutter', [0, 2.06, 0.32], null, 'Gutter');
    K.box(g, [3.2, 0.02, 0.22], 'white', [0, -0.1, 0]);
    K.box(g, [3.2, 0.22, 0.02], 'white', [0, 0, 0.11]);
    K.box(g, [3.2, 0.22, 0.02], 'white', [0, 0, -0.11]);
    K.box(g, [0.02, 0.22, 0.22], 'white', [-1.6, 0, 0]);
    K.box(g, [0.02, 0.22, 0.22], 'white', [1.6, 0, 0]);
    const hang = K.part('hangers', [0, 0, 0], g, 'Hidden hangers');
    K.rep(4, (i) => K.box(hang, [0.03, 0.02, 0.24], 'steel', [-1.2 + i * 0.8, 0.1, 0]));
    const leaves = K.part('leaves', [0, -0.05, 0], g, 'Leaves & gunk');
    K.rep(12, (i) => K.sph(leaves, 0.07, i % 3 ? 'orange' : 'dirt', [-1.45 + i * 0.25, 0, (i % 2) * 0.04 - 0.02], [1.5, 0.5, 1]));
    const ds = K.part('downspout', [1.45, 0, 0.32], null, 'Downspout');
    K.box(ds, [0.1, 1.9, 0.08], 'white', [0, 1.0, 0.08]);
    K.box(ds, [0.1, 0.1, 0.35], 'white', [0, 0.08, 0.28]);
    const plug = K.part('plug', [1.45, 1.3, 0.4], null, 'Downspout clog');
    K.box(plug, [0.08, 0.15, 0.06], 'dirt');
    const splash = K.part('splash', [1.45, 0.02, 0.7], null, 'Splash block');
    K.box(splash, [0.3, 0.04, 0.5], 'concrete');
    const lad = K.part('ladder', [-0.6, 0, 0.9], null, 'Extension ladder');
    const L = K.group(lad, [0, 0, 0], [-15, 0, 0]);
    K.box(L, [0.04, 2.3, 0.04], 'orange', [-0.22, 1.15, 0]);
    K.box(L, [0.04, 2.3, 0.04], 'orange', [0.22, 1.15, 0]);
    K.rep(7, (i) => K.box(L, [0.44, 0.03, 0.03], 'steel', [0, 0.25 + i * 0.3, 0]));
    const sc = K.part('scoop', [-0.3, 2.2, 0.35], null, 'Gutter scoop');
    K.box(sc, [0.14, 0.03, 0.14], 'orange');
    K.box(sc, [0.04, 0.04, 0.2], 'orange', [0, 0.02, 0.15]);
    const hose = K.part('hose', [1.45, 2.1, 0.4], null, 'Hose');
    K.tube(hose, [[0, 0.05, 0], [0.2, 0.3, 0.3], [0.6, 0.0, 0.6], [1.0, -2.0, 0.8]], 0.03, 'green');
    const flow = K.cyl(hose, [0.03, 0.05, 1.8], 'water', [0, -0.95, 0.08]);
    flow.userData.noPick = true;
    return {
      tick(t, fx) {
        flow.visible = fx === 'flush';
      },
    };
  });

  TB.category({
    id: 'roof',
    code: 'ROF',
    name: 'Roof & Gutters',
    domain: 'exterior',
    blurb: 'Shingles and gutters',
    repairs: [
      {
        id: 'replace-shingle',
        title: 'Replace a damaged shingle',
        model: 'roof',
        level: 3,
        time: '1–2 hrs',
        cost: '$15–40',
        summary: 'A torn, cracked or missing shingle can be swapped in about an hour: unstick the row above, pull 8 nails, slide in a matching shingle, nail it in the right spot and glue the tabs back down.',
        intro: { hi: ['damaged'] },
        safety: ['Stay off a roof that is wet, frosty, windy, steeper than 6/12 (6″ of rise for every 12″ across) or more than one story up. Hire it out, or wear a harness clipped to a roof anchor screwed into a rafter.', 'Set the ladder 1 ft out from the wall for every 4 ft of height, and let it stick up at least 3 ft past the roof edge so you have something to hold as you step on and off.', 'Keep ladders at least 10 ft from overhead power lines; look up before you raise one.', 'Wear soft rubber-soled shoes and work on a mild day (about 50–80 °F): cold shingles crack and hot ones tear and scuff.'],
        causes: [['Wind lift', 'A tab whose glue strip let go flaps in the wind until it creases and tears off.'], ['Hail or branch impact', 'Dents, cracks and bald spots where the protective granules got knocked off.'], ['Age and sun', 'Old shingles dry out, curl at the corners and crack when bent.'], ['Nails in the wrong spot', 'Nails set too high miss the shingle below, so shingles slide or blow off.']],
        tools: ['Flat pry bar (wide and thin)', 'Hammer', 'Utility knife with hook blade', '1¼″ galvanized roofing nails (⅜″ head)', 'Matching replacement shingle(s)', 'Asphalt roofing cement or shingle tab adhesive + caulk gun', 'Putty knife', 'Extension ladder with standoff', 'Roof harness kit (for steep roofs)', 'Soft-soled shoes, gloves'],
        steps: [
          { t: 'Break the seal above', d: 'Slide the flat bar under the shingle directly above the damaged one and work it gently side to side to pop its glue strip loose. Do the same under the damaged shingle’s own tabs. Lift the tabs only 2–3″; bending them farther creases them.', why: 'Each row is glued to the one below by a factory tar strip that softens in the sun and sticks. Breaking it slowly gets you to the nails without tearing the good shingle above.', tip: 'Shingles bend best on a cool morning after a warm day. If the glue is gooey, lay a bag of ice on it for 5 minutes; if a tab starts to crackle, stop and let the sun warm it for an hour.', ok: 'You can lift the tab above about 2″ and see a row of nail heads underneath, with no cracks across the tab.', v: { cam: [1.2, 2.8, 2.0], at: [0, 1.7, 0], hi: ['flatbar'], show: ['flatbar'] } },
          { t: 'Pull the nails', d: 'Find 8 nails: 4 through the damaged shingle, just above its tab slots, and 4 from the row above that pass through its top edge. Tap the flat bar’s notch under each nail head with the hammer, then lever it up and out.', why: 'Shingles overlap so much that the row above is nailed right through the top of the one below. Miss one and the old shingle won’t budge.', tip: 'If a head is too buried to grab, tap the bar under the tab from the side so it pinches the nail shank instead. A nail that won’t come out can be cut flush with a hacksaw blade slid under the tab.', ok: 'The damaged shingle slides a little when you tug it, with nothing holding it.', v: { cam: [1.0, 2.6, 1.8], at: [0, 1.75, -0.1], hi: ['nails'] } },
          { t: 'Slide out the old shingle', d: 'Pull the damaged shingle down and out. Scrape off leftover tar lumps with the bar, and put a small dab of roofing cement in each old nail hole you can see in the shingles around the slot.', why: 'Old nail holes are pinholes in the roof. A dab of cement seals each one so water running under the tabs can’t drip into the wood deck.', tip: 'Take the old shingle to the store to match the color and type: flat 3-tab (with slots) or thicker architectural (layered, no slots). Check the garage or attic first; leftover bundles from the original job match best.', ok: 'The slot is clear, the felt or paper underneath isn’t torn, and every old nail hole has a dot of black cement.', v: { cam: [1.2, 2.6, 2.2], at: [0, 1.6, 0.3], hi: ['damaged'], mv: { damaged: [0, 0.3, 0.8] } } },
          { t: 'Slide in and nail the new one', d: 'Slide the new shingle up under the row above until its bottom edge lines up with its neighbors. Nail it ⅝″ above the tab slots (about 5⅝″ up from the bottom edge): 1″ in from each end and 1″ beside each slot, 4 nails. Then re-nail the row above ½″ beside its old holes.', why: 'Nails in this zone get covered by the next row and also catch the top of the shingle below, which is what holds a roof down in a storm.', tip: 'The row above blocks a full hammer swing. Set the flat bar on the nail head and hit the bar instead. Stop when the head sits flush; a nail punched into the shingle leaks and lets it pull through.', ok: 'Every nail head sits flat and snug, none are crooked or sunk, and all are hidden when the tab above lies down.', v: { cam: [1.0, 2.6, 1.8], at: [0, 1.7, 0], hi: ['newShingle'], show: ['newShingle'], hide: ['damaged', 'flatbar'] } },
          { t: 'Reseal the tabs', d: 'Put quarter-size dabs of roofing cement 1″ up from the bottom edge under every tab you lifted: 4 per 3-tab shingle (1″ and 13″ in from each end), or one every 12″ on other styles. Press each tab down firmly. Keep the cement thinner than ⅛″.', why: 'The factory glue you broke won’t restick until a hot sunny day, and a loose tab can flip up in the next gust.', tip: 'More is not better: thick cement makes the shingle blister and can drip in summer heat. If you squeeze out too much, scrape the extra off with a putty knife before pressing the tab down.', ok: 'Each tab stays put when you lift its corner gently, and from the ground the new shingle lines up with the rest of the row.', v: { cam: [1.0, 2.6, 1.8], at: [0, 1.7, 0], hi: ['sealant'] } },
        ],
        learn: {
          how: 'Shingles work like overlapping fish scales. Water runs down over the top, and each row covers the nails and joints of the row beneath. Every shingle is nailed twice over: by its own nails and by the nails of the row above, which pass through its top edge. A tar strip glues each row down so wind can’t get under it, and the colored granules on top shield the asphalt from the sun. A missing tab lets sun and wind-driven rain reach the layers below.',
          specs: [['Nails per shingle', '4 (6 in high-wind zones or on steep roofs)'], ['Nail', '1¼″ galvanized roofing nail, ⅜″ head'], ['Nail line, 3-tab', '≈ 5⅝″ up, ⅝″ above the slots, 1″ from the ends'], ['Exposure (visible part)', '5″ on 3-tab, 5⅝″ on most architectural'], ['Hand-seal dabs', 'Quarter-size, under ⅛″ thick'], ['Ladder', '4:1 angle, 3 ft above the eave'], ['Work temperature', '≈ 50–80 °F']],
          terms: [['Tab', 'The exposed flap of a 3-tab shingle, between the slots.'], ['Seal strip', 'Tar strip that glues each row to the one below once the sun warms it.'], ['Pitch', 'Roof steepness: inches of rise per 12″ across.'], ['Architectural shingle', 'Thicker, two-layer shingle with no slots; nailed in a marked strip called the nailing zone.'], ['Underlayment', 'Felt or synthetic sheet under the shingles, the roof’s backup layer.'], ['Exposure', 'How much of each row shows below the row above.']],
          mistakes: ['Working on wet, dewy or frosty shingles.', 'Nailing too high so the nails miss the shingle below; high nailing is a top cause of blow-offs.', 'Face-nailing exposed tabs or leaving any nail head uncovered.', 'Gobs of cement that make the shingle blister.'],
          tips: ['Look in the attic or garage for leftover shingles from the original job. They match exactly.', 'On architectural shingles, nail inside the painted or fabric nailing strip and lift the rows above more gently; the thick shingles don’t bend as far.'],
        },
        pro: 'The roof is steep, wet, or higher than one story, the deck feels soft or spongy underfoot, there are stains inside, or the shingles are so brittle they crack whenever you lift them.',
        tricks: [['Ice for gooey seals', 'On a hot day the glue strip acts like gum. A zip bag of ice laid on it for 5 minutes firms it up so the bar slices through cleanly.'], ['Borrow from the back', 'If the new shingle stands out, take a weathered one from a hidden spot (back slope, behind a chimney) for the front, and put the new one where nobody looks.'], ['Bar on the nail', 'When the row above blocks your swing, rest the flat bar’s end on the nail head and hit the bar to drive the nail home.'], ['Mark it from below', 'Before you climb, stick tape on the gutter right below the bad shingle. Roofs look completely different up close and it saves a search.'], ['Cheap peace of mind', 'A roof harness kit costs about the same as a roofer’s service call. Its anchor screws into a rafter through the shingles, and you seal the holes with cement afterward.'], ['Check the attic after rain', 'Shine a flashlight on the underside of the deck after the next storm. Dry wood means you’re done; a fresh dark stain means the leak is somewhere else.'], ['Loose shingles for cents', 'Roofing supply yards and roofers often sell a few loose shingles of common colors, so you don’t have to buy a whole bundle.']],
        refs: [['Hand Sealing Shingles, Technical Bulletin R-114 (GAF)', 'https://www.gaf.com/en-us/document-library/documents/technical-bulletins-&-notes/r-114-hand-sealing-shingles.pdf'], ['High Nailing Shingles, Technical Bulletin R-115 (GAF)', 'https://www.gaf.com/en-us/document-library/documents/technical-bulletins-&-notes/r-115-high-nailing-shingles.pdf'], ['Royal Sovereign 3-tab installation instructions (GAF)', 'https://irp.cdn-website.com/72df28d5/files/uploaded/gaf_royal_sovereign_installation_instructions.pdf'], ['Fixing damaged roof shingles (This Old House)', 'https://www.thisoldhouse.com/ideas/fixing-damaged-roof-shingles'], ['Portable ladder rules, 29 CFR 1926.1053 interpretation (OSHA)', 'https://www.osha.gov/laws-regs/standardinterpretations/2009-03-16-3'], ['How to repair an asphalt roof (Angi)', 'https://www.angi.com/articles/how-repair-asphalt-roof.htm']],
      },
      {
        id: 'clean-gutters',
        title: 'Clogged gutters & downspouts',
        model: 'gutter',
        level: 2,
        time: '1–3 hrs',
        cost: '$0–20',
        summary: 'Overflowing gutters dump water at your foundation and rot the trim. Scoop them out from a well-set ladder, flush them, clear the downspouts, and make sure the water lands at least 5 ft from the house.',
        intro: { hi: ['leaves', 'plug'] },
        safety: ['Set the ladder 1 ft out for every 4 ft of height on firm, level ground, with a standoff that keeps it off the gutter. Move it often instead of leaning sideways.', 'Keep three points of contact (two feet and a hand, or two hands and a foot) and don’t stand above the third rung from the top.', 'Look up first: keep ladders at least 10 ft from overhead power lines, including the wire that feeds the house.', 'Wear gloves and safety glasses: gutters hide sharp screw tips, metal edges and bird droppings.'],
        causes: [['Leaves, needles and seed pods', 'Spring seeds and fall leaves are the big loads.'], ['Roof granules', 'Sand-like grit from the shingles settles into heavy sludge over the years.'], ['Clogged downspout elbow', 'Debris jams at the bends, especially the top elbow under the outlet.'], ['Wrong slope', 'A sagging gutter holds water, which grows a mat of gunk that traps more.']],
        tools: ['Extension ladder with standoff', 'Plastic gutter scoop or small garden trowel', '5 gal bucket with an S-hook', 'Garden hose with pistol nozzle', 'Work gloves and safety glasses', 'Tarp for the ground', 'Plumbing snake (stubborn downspouts)', 'Screwdriver (downspout elbow screws)'],
        steps: [
          { t: 'Set the ladder safely', d: 'Spread a tarp below. Stand the ladder on firm, level ground with its feet 1 ft out for every 4 ft of height, and fit a standoff (a U-shaped bracket at the top) so it rests on the wall or roof, not the gutter. Climb facing the ladder.', why: 'Leaning on the gutter dents it and lets the ladder skid sideways. The 4:1 angle is the sweet spot between tipping back and kicking out at the bottom.', tip: 'Quick angle check: stand with your toes touching the ladder feet and hold your arms straight out. Your palms should just reach a rung. On soft soil, set the feet on a wide board.', ok: 'The ladder doesn’t rock or shift when you push on a rung, and the standoff touches the wall, not the gutter.', v: { cam: [2.4, 1.6, 3.2], at: [-0.6, 1.0, 0.6], hi: ['ladder'] } },
          { t: 'Scoop out debris', d: 'Start at the downspout end and scoop the gunk toward you into a bucket hung on the ladder, working away from the outlet. Pull wet mats out rather than pushing them along. Move the ladder every arm’s length instead of leaning out.', why: 'Starting at the outlet keeps you from shoving a plug of leaves into the downspout. Keeping your belt buckle between the ladder rails keeps your weight centered.', tip: 'Damp debris lifts out in clean clumps. Bone-dry leaves blow around and soupy muck splashes, so mist dry gutters with the hose first.', ok: 'You can see bare gutter bottom along the whole run and the outlet hole is open.', v: { cam: [0.8, 2.8, 1.8], at: [-0.3, 2.0, 0.3], hi: ['leaves', 'scoop'] } },
          { t: 'Flush the gutter', d: 'Run the hose into the far end and watch the water travel to the downspout. Turn it off and look again after a minute: puddles that stay put mark low spots.', why: 'A gutter should fall at least ¼″ every 10 ft toward the outlet. Standing water means a sag or a loose hanger, and it grows a new mat of muck fast.', tip: 'Stick a piece of tape on the gutter face at each puddle so you can raise the hangers there later (see the sagging gutter guide).', ok: 'Water runs steadily to the outlet and nothing deeper than a film is left a minute after the hose is off.', v: { cam: [1.4, 2.8, 2.4], at: [0.4, 2.0, 0.3], hi: ['gutter'], hide: ['leaves'] } },
          { t: 'Clear the downspout', d: 'Feed the hose into the top of the downspout at full pressure. If water backs up, take off the bottom elbow (usually 2–3 small screws) and push the hose or a plumbing snake up from below to break the clog at the bend.', why: 'Most clogs jam at an elbow, where debris has to turn a corner and packs tight.', tip: 'Tap along the downspout with a screwdriver handle: a clogged section sounds dull and solid, an open one sounds hollow. Never lean the ladder on a downspout.', ok: 'Water pours out the bottom as fast as it goes in, with no gurgling or overflow at the top.', v: { cam: [2.4, 1.8, 2.0], at: [1.45, 1.2, 0.4], hi: ['downspout', 'plug', 'hose'], show: ['hose'], xray: true, fx: 'flush' } },
          { t: 'Check hangers and splash block', d: 'Tighten any loose hangers you passed. Make sure each downspout ends on a splash block or extension that carries water at least 5 ft from the foundation, onto ground that slopes away from the house.', why: 'Roof water dumped next to the wall soaks the soil against the foundation, the most common cause of wet basements. The building code asks for 5 ft where soils swell.', tip: 'A hinged flip-up extension lifts out of the way for mowing. For a hidden fix, run 4″ solid pipe underground to a pop-up emitter in the lawn.', ok: 'During the hose test, water leaves the extension and runs away from the house instead of pooling by the wall.', v: { cam: [2.4, 1.4, 2.6], at: [1.0, 0.8, 0.5], hi: ['splash', 'hangers'], hide: ['plug', 'hose'] } },
        ],
        learn: {
          how: 'A roof sheds a lot of water: 1″ of rain on 1,000 ft² of roof is about 620 gallons. Gutters collect it, and their slight slope carries it to downspouts that send it away from the house. When they clog, water overflows right at the foundation, soaks the fascia boards behind the gutter, and in winter can freeze into ice dams.',
          specs: [['Gutter slope', '≥ ¼″ per 10 ft toward the outlet'], ['Discharge', '≥ 5 ft from the foundation; farther is better'], ['Cleaning', '2× a year, more under pines'], ['Ladder', '4:1 angle, 3 ft above the eave, 10 ft from power lines'], ['1″ of rain on 1,000 ft² roof', '≈ 620 gal']],
          terms: [['Fascia', 'The board along the roof edge that the gutter hangs from.'], ['Hanger', 'Bracket that holds the gutter to the fascia.'], ['Standoff', 'Bracket that holds the ladder top away from the gutter.'], ['Downspout elbow', 'The curved piece where a downspout bends.'], ['Ice dam', 'Ridge of ice at the eave that backs water up under the shingles.']],
          mistakes: ['Leaning the ladder on the gutter.', 'Pushing debris into the downspout.', 'Pressure-washing shingles from the gutter (it strips granules).', 'Ignoring a downspout that dumps beside the foundation.'],
          tips: ['Clean after the last leaves fall, not mid-autumn.', 'Gutter guards cut down on cleanings but don’t end them.'],
        },
        pro: 'The house is two stories or more, the gutters are pulling off or sagging badly, the fascia is soft and rotten, or you’re not comfortable on a ladder.',
        tricks: [['Hook the bucket', 'Hang the bucket on a rung with an S-hook so both hands stay free and you aren’t carrying loads down the ladder.'], ['Debris is compost', 'Leaf muck makes good garden mulch. Dump it in a bed unless it’s gritty with shingle granules.'], ['Wait for dry or wet, not in between', 'Dry leaves can be blown out with a leaf-blower gutter kit from the ground; wet muck scoops best by hand. Half-dry mats are the worst of both.'], ['Find the overflow cause', 'If one corner always overflows, a roof valley is dumping water there. A small splash guard on the gutter or a bigger 3×4″ downspout usually fixes it.'], ['Downspout clog from below', 'If the hose won’t clear it from the top, a plumbing snake from the bottom elbow up breaks clogs that pressure only packs tighter.'], ['Check during real rain', 'Watch the gutters once in a downpour with an umbrella. Overflow, drips at seams and splashing spouts show up in minutes.']],
        refs: [['How to clean gutters (This Old House)', 'https://www.thisoldhouse.com/gutters/how-to-clean-gutters'], ['Cleaning gutters with a ladder: tips (Little Giant Ladders)', 'https://www.littlegiantladders.com/blogs/blog/cleaning-gutters-with-ladder-tips'], ['How to clean your gutters (Roto-Rooter)', 'https://www.rotorooter.com/blog/outdoor-plumbing/how-to-clean-your-gutters/'], ['Portable ladder standard interpretation (OSHA)', 'https://www.osha.gov/laws-regs/standardinterpretations/2005-12-22'], ['R801.3 downspout discharge discussion (The Building Code Forum)', 'https://www.thebuildingcodeforum.com/forum/threads/r801-3-downspout-discharge-and-the-meaning-of-interpretation.30866/post-239221'], ['Foundation drains, gutters and downspouts (U.S. DOE Building America Solution Center)', 'https://bsesc.energy.gov/energy-basics/foundation-drain-gutters-downspouts']],
      },
    ],
  });
})();
