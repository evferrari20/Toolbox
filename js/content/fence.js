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
        time: '3–4 hrs + 4 hr set',
        cost: '$20–60',
        summary: 'A post that rotted at ground level, or was set too shallow, lets the whole panel lean. Brace the fence, dig the post out, stand it up plumb on a gravel base, and lock it in with fast-setting concrete. If the post is rotted, swap in a new ground-contact post while the hole is open.',
        intro: { hi: ['leanPost'] },
        safety: [
          'Call 811 (the free national call-before-you-dig number) at least 2–3 business days before digging so buried gas, power and cable lines get marked. It’s required by law.',
          'Brace the panels before you dig. A loose post with a panel on it can fall on you.',
          'Wet soil and old concrete are heavy. Lift with your legs, and use a digging bar or jack instead of yanking with your back.',
          'Wear gloves and eye protection with concrete mix; it’s caustic to skin and eyes.',
        ],
        causes: [
          ['Rot at the soil line', 'Where air, water and soil meet, rot works fastest. Push a screwdriver into the post right at the ground.'],
          ['Shallow footing', 'Less than about one-third of the post’s above-ground height is buried.'],
          ['Frost heave', 'Freezing soil grips the post and lifts it unevenly, especially if the hole is wider at the top.'],
          ['Soggy hole', 'Concrete poured as a cup with no drainage holds water around the post.'],
        ],
        tools: ['Post-hole digger & round-point shovel', 'Digging bar (5–6 ft steel bar)', 'Post level (straps on two faces) or 2 ft level', 'Two 2×4 braces (6–8 ft) + stakes + 3″ screws', 'Fast-setting concrete, 50 lb bags (2–3 per post)', 'All-purpose gravel (about ½ bag per post)', 'Replacement post rated for ground contact if rotted', 'Bucket of water', 'Gloves & safety glasses'],
        steps: [
          {
            t: 'Brace the panels',
            d: 'Drive a stake 4–5 ft out from the fence on each side of the post. Screw a 2×4 from each stake up to the fence rail at an angle, one screw at the rail and one at the stake, so the panel can’t fall while the post is loose.',
            why: 'Once the footing is out, the panel’s weight will try to pull the post over, and it can rack (twist) the panels next to it.',
            tip: 'Use only one screw at each end of the brace for now. A single screw acts as a hinge, so you can still swing the post plumb later and then add a second screw to lock it.',
            ok: 'Pushing the panel by hand, you feel it held firm by the braces on both sides.',
            v: { cam: [2.2, 1.8, 3.0], at: [0.2, 0.9, 0], hi: ['brace'], show: ['brace'] },
          },
          {
            t: 'Dig around the post',
            d: 'Dig a hole about three times the post width (12″ for a 4×4) around the post, down below its bottom. If an old concrete plug is stuck on the post, break it apart with the digging bar or lever the post and plug out together. Dig 6″ deeper than the post will sit so there’s room for gravel.',
            why: 'You need room to stand the post upright and pour a fresh collar of concrete all the way around it.',
            tip: 'Old concrete plug won’t budge? Wrap a chain around the post, hook it to a farm jack or a 2×4 lever over a block, and lift. If the post is rotted off at the ground, it’s easier to dig a new hole right beside the old one.',
            ok: 'You can see the post’s bottom end, and the hole is about a foot wide and 6″ deeper than the post bottom.',
            v: { cam: [1.6, 1.0, 2.0], at: [0, 0, 0], hi: ['hole'], xray: true },
          },
          {
            t: 'Plumb the post',
            d: 'Pour 6″ of gravel in the hole and tamp it with the end of a 2×4. Stand the post on the gravel. Strap a post level to it (or hold a level on two neighboring faces) and push until both bubbles are centered. Add the second screw to each brace to lock it.',
            why: 'A post can look straight from one side and still lean in the other direction. Checking two faces catches both. Plumb means perfectly vertical.',
            tip: 'Stretch a string between the tops of the posts on either side. Line up the face of this post with the string so the fence line stays straight, not just plumb.',
            ok: 'Both bubbles sit centered between their lines and the post face lines up with its neighbors.',
            v: { cam: [2.0, 1.6, 2.8], at: [0, 0.9, 0], hi: ['leanPost'], rt: { leanPost: [0, 0, 6.9] } },
          },
          {
            t: 'Fill with fast-setting concrete',
            d: 'Pour dry fast-setting concrete mix around the post up to 3–4″ below ground. Slowly pour about 1 gallon of water per 50 lb bag over it and let it soak in; no stirring needed. Recheck plumb right away. It sets hard in about 20–40 minutes.',
            why: 'The gravel underneath lets water drain away from the post end, so the post isn’t sitting in a cup of water.',
            tip: 'If the water pools on top instead of soaking in, poke the mix a few times with a stick. If the post drifts, you have about 10 minutes to nudge it back before the concrete grabs.',
            ok: 'The mix is evenly dark and damp with no dry powder showing, and the level still reads plumb on both faces.',
            v: { cam: [1.6, 1.0, 2.0], at: [0, 0, 0], hi: ['concrete'], show: ['concrete'], xray: true },
          },
          {
            t: 'Crown the top and wait',
            d: 'After the concrete sets, fill the last 3–4″ with soil and mound it so water runs away from the post. Wait at least 4 hours before removing the braces or hanging weight on the post.',
            why: 'A sloped top sheds rain away from the wood at the soil line, where rot starts.',
            tip: 'Running a bead of exterior caulk where the post meets the concrete, if any concrete shows, stops water from sitting in the crack that opens as the wood shrinks.',
            ok: 'Rainwater (or a splash from the hose) runs away from the post, and with the braces off the post doesn’t move when you push the top.',
            v: { cam: [3.6, 2.2, 4.0], at: [0.4, 0.9, 0], hi: ['leanPost'], hide: ['brace', 'hole'] },
          },
        ],
        tricks: [
          ['Buy ground-contact posts', 'Any post going in the ground should be labeled for ground contact (UC4A or better). Above-ground lumber rots out in a few years.'],
          ['Bell the bottom, not the top', 'Make the hole slightly wider at the bottom than at the top. Frost can’t grab a bell shape and lift it.'],
          ['Sister a rotted stub', 'If the post is only rotted at the soil line, a steel post mender (a spike driven beside the post and bolted on) can save it without digging.'],
          ['Set the rail height last', 'Replacing a post? Set it a little tall, then cut the top to height after it’s set and the line is straight.'],
          ['One bag goes further than you think', 'A 12″ hole 30″ deep around a 4×4 takes about two 50 lb bags of fast-setting mix. Buy one extra.'],
          ['Don’t fight a whole line', 'If many posts lean the same way, the problem is wind or soil. Plan a new fence rather than fixing one post at a time.'],
        ],
        refs: [
          ['Setting posts in concrete (Quikrete)', 'https://www.quikrete.com/athome/settingposts.asp'],
          ['Setting posts project sheet (Quikrete PDF)', 'https://www.quikrete.com/pdfs/projects/settingposts.pdf'],
          ['Setting posts in concrete the easy way (Today’s Homeowner)', 'https://todayshomeowner.com/concrete/video/setting-posts-in-concrete-the-easy-way/'],
          ['Installing fence posts (Bob Vila)', 'https://www.bobvila.com/articles/installing-fence-posts/'],
          ['Call before you dig (811)', 'https://call811.com/'],
        ],
        learn: {
          how: 'A post works as a buried lever. Wind on the panel pushes the top, and the buried part pushes back against the soil. The deeper and wider the footing, the more soil it can push against, which is why posts need about one-third to one-half of their above-ground height underground. The soil-line zone also has to stay dry, or fungus eats the post right where the leverage is greatest.',
          specs: [['Burial depth', '⅓–½ of above-ground height (≥ 24″ for a 6 ft fence)'], ['Frost line', 'go below it where local code requires'], ['Hole diameter', '3× post width (12″ for a 4×4)'], ['Gravel base', '≈ 6″'], ['Water', '≈ 1 gal per 50 lb bag of fast-set'], ['Fast-set concrete', 'sets in 20–40 min, load after 4 hr']],
          terms: [['Plumb', 'Truly vertical.'], ['Frost heave', 'Soil swelling as it freezes, which lifts posts.'], ['811', 'U.S. free call-before-you-dig number.'], ['Ground contact (UC4A)', 'Treatment rating for wood that touches soil.']],
          mistakes: ['Skipping 811.', 'Pouring concrete level with or above a flat soil surface (holds water against the post).', 'Checking plumb on only one face.', 'Using above-ground rated lumber in the ground.'],
          tips: ['Use ground-contact rated posts (UC4A or better) for anything buried.', 'Strap a post level on so both hands are free.'],
        },
        pro: 'Several posts are leaning, there’s a slope or retaining wall, the fence holds back soil, or the fence borders a neighbor and the property line is unclear.',
      },
      {
        id: 'gate-sag',
        title: 'Gate sags and drags',
        model: 'fence',
        level: 1,
        time: '30–45 min',
        cost: '$15–25',
        summary: 'A wooden gate slowly sags at the latch corner as it racks out of square. Tighten the hinges, lift the gate square, and add an anti-sag cable with a turnbuckle to hold it there.',
        intro: { hi: ['gate', 'latch'] },
        safety: ['Prop the gate with a block or shims while you work so it can’t swing or drop on your foot.', 'Wear gloves; steel cable ends are sharp.'],
        causes: [
          ['Racking', 'Gravity pulls the free (latch) corner down until the rectangle becomes a slanted parallelogram.'],
          ['Loose hinge screws', 'Short screws strip out of soft or wet wood.'],
          ['Hinge post leaning', 'If the post the hinges are on leans, no cable will fix it. Fix the post first.'],
          ['Brace installed backward', 'A wood diagonal must run from the bottom hinge corner up to the top latch corner.'],
        ],
        tools: ['Anti-sag gate kit (cable, turnbuckle, 2 corner brackets, screws)', 'Drill/driver', '3″ exterior screws or through-bolts for hinges', '2 ft level', 'Wood block or shims', 'Screwdriver or rod to turn the turnbuckle'],
        steps: [
          {
            t: 'Check the post and tighten the hinges',
            d: 'Hold a level on the hinge post. If it leans, fix the post first. Then drive every hinge screw tight. Replace any that spin with 3″ exterior screws that reach deep into the post and gate frame, or swap in through-bolts.',
            why: 'If the hinges or post are loose, the cable just pulls the gate off its hinges instead of lifting the corner.',
            tip: 'Screw spins and won’t tighten? Pull it, push two glue-dipped wooden toothpicks or a golf tee into the hole, snap them off flush, and drive the screw back in.',
            ok: 'Every hinge screw stops turning and pulls tight, and lifting the latch end of the gate doesn’t make the hinges shift.',
            v: { cam: [1.4, 1.4, 1.8], at: [0.2, 0.9, 0.1], hi: ['hinges'] },
          },
          {
            t: 'Lift the gate square',
            d: 'Slide a block or stack of shims under the latch corner until the top rail reads level and the gap between gate and latch post is even top to bottom.',
            why: 'Square the gate first, then the cable only has to hold it there instead of lifting it.',
            tip: 'Lift it slightly past level, about ⅛″ high at the latch side. Wood and cable relax a little after you remove the block.',
            ok: 'The level’s bubble is centered on the top rail and the gap at the latch post looks the same width top and bottom.',
            v: { cam: [2.4, 1.6, 3.0], at: [0.7, 0.9, 0], hi: ['gate'], rt: { gate: [0, 0, 2.9] } },
          },
          {
            t: 'Install the cable diagonally',
            d: 'Screw one bracket to the gate frame at the top hinge corner and the other at the bottom latch corner, into the solid frame rails, not thin pickets. Hook the turnbuckle to one bracket, run the cable to the other, pull it hand-tight and clamp it.',
            why: 'A cable can only pull, so it must run from high on the hinge side down to low on the latch side. That way it holds the latch corner up.',
            tip: 'Open the turnbuckle almost all the way before you start, so you have the whole thread length left for tightening now and in future seasons.',
            ok: 'The cable runs in a straight diagonal from the top hinge corner to the bottom latch corner with no slack.',
            v: { cam: [2.0, 1.4, 2.6], at: [0.7, 0.9, 0.1], hi: ['kit'], show: ['kit'] },
          },
          {
            t: 'Tension the turnbuckle',
            d: 'Remove the block. Slide a screwdriver through the turnbuckle’s middle and turn it a half turn at a time until the latch corner rises back to level and the latch drops into its catch on its own.',
            why: 'Small turns go a long way. Over-tightening bows the gate frame into a banana shape.',
            tip: 'If the cable twists as you turn, hold it with pliers. If the gate still drags at full tension, the frame joints are loose; add a few screws at each corner joint.',
            ok: 'The gate swings without scraping and clicks shut on the latch without lifting.',
            v: { cam: [3.6, 2.2, 4.0], at: [0.6, 0.9, 0], hi: ['latch', 'kit'] },
          },
        ],
        tricks: [
          ['Remember push vs. pull', 'A wood brace pushes, so it runs from the bottom hinge corner up to the top latch corner. A cable pulls, so it runs the opposite way.'],
          ['Use a heavy hinge', 'Swap tiny strap hinges for heavy-duty T-hinges or strap hinges with at least three screws into the post. Gate hinges carry more load than you think.'],
          ['Add a wheel for wide gates', 'Gates over 4 ft wide can carry a spring-loaded gate wheel under the latch end to take the weight.'],
          ['Leave a ground gap', 'Keep about 2″ between the gate bottom and the ground, more if the ground rises in the swing path.'],
          ['Tune it seasonally', 'Wood swells in wet seasons and shrinks in dry ones. A half turn on the turnbuckle each spring keeps the latch lined up.'],
          ['Through-bolt the top hinge', 'The top hinge carries the pulling load. A carriage bolt through the post there outlasts any screw.'],
        ],
        refs: [
          ['Repairing a sagging fence gate with an anti-sag kit (Today’s Homeowner)', 'https://todayshomeowner.com/fence/video/repairing-a-sagging-fence-gate-with-an-anti-sag-gate-kit/'],
          ['How to install a cable & turnbuckle on a wooden gate (Hunker)', 'https://www.hunker.com/13424898/how-to-install-a-cable-turnbuckle-on-a-wooden-gate/'],
          ['How to fix a sagging gate (Angi)', 'https://www.angi.com/articles/how-to-fix-a-sagging-gate.htm'],
          ['How to fix a sagging gate (Dunn Lumber)', 'https://diy.dunnlumber.com/projects/how-to-fix-a-sagging-gate'],
          ['How to position a fence gate brace (Miter Angle)', 'https://miterangle.com/how-to-properly-position-a-fence-gate-brace/'],
        ],
        learn: {
          how: 'A gate is a rectangle held up along only one edge. Gravity pulls the free corner down and turns the rectangle into a parallelogram, which is called racking. A diagonal stops this by making triangles, which can’t change shape: a wood brace pushing up from the bottom hinge corner, or a cable pulling up from the top hinge corner.',
          specs: [['Gap under gate', '≈ 2″'], ['Turnbuckle', 'tighten ½ turn at a time'], ['Hinge screws', '3″ exterior or through-bolts'], ['Over-lift', '≈ ⅛″ at the latch corner']],
          terms: [['Racking', 'A rectangle leaning into a parallelogram.'], ['Turnbuckle', 'A threaded sleeve that shortens a cable as you turn it.'], ['Compression brace', 'Wood diagonal from bottom hinge corner to top latch corner.'], ['Stile and rail', 'The vertical and horizontal frame pieces of the gate.']],
          mistakes: ['Installing the cable in the wrong diagonal.', 'Fixing the gate while the hinge post leans.', 'Screwing brackets into thin pickets instead of the frame.'],
          tips: ['Re-tension seasonally; wood moves.'],
        },
        pro: 'The hinge post is loose or rotted, or the gate is metal with broken welds.',
      },
    ],
  });
})();
