/* DOR · Doors & windows */
(function () {
  /* ---- Model: interior door in its frame ---- */
  TB.model('door', { cam: [2.6, 1.6, 3.0], at: [0, 1.1, 0], hidden: ['longScrew'] }, (K) => {
    K.box(null, [3.4, 2.6, 0.12], 'drywall', [0, 1.3, -0.08]);
    const frame = K.part('frame', [0, 0, 0], null, 'Door frame (jamb)');
    K.box(frame, [0.06, 2.1, 0.16], 'offwhite', [-0.48, 1.05, 0]);
    K.box(frame, [0.06, 2.1, 0.16], 'offwhite', [0.48, 1.05, 0]);
    K.box(frame, [1.02, 0.06, 0.16], 'offwhite', [0, 2.13, 0]);
    const strike = K.part('strike', [0.448, 1.0, 0.0], null, 'Strike plate');
    K.box(strike, [0.006, 0.2, 0.06], 'brass');
    K.box(strike, [0.008, 0.06, 0.03], 'dark', [0.002, 0, 0]);
    // door slab hinged on the left edge
    const door = K.part('door', [-0.44, 0, 0.0], null, 'Door slab');
    K.box(door, [0.88, 2.06, 0.045], 'woodLight', [0.44, 1.05, 0]);
    K.rep(2, (i) => K.box(door, [0.6, 0.7, 0.01], 'wood', [0.44, 0.6 + i * 0.95, 0.026]));
    const knob = K.part('knob', [0.8, 1.0, 0.0], door, 'Knob & latch');
    K.sph(knob, 0.045, 'brass', [0, 0, 0.07]);
    K.sph(knob, 0.045, 'brass', [0, 0, -0.07]);
    const latch = K.part('latch', [0.08, 0, 0], knob, 'Latch bolt');
    K.box(latch, [0.04, 0.03, 0.02], 'brass');
    ['hingeTop', 'hingeMid', 'hingeBot'].forEach((n, i) => {
      const y = [1.85, 1.05, 0.25][i];
      const h = K.part(n, [-0.455, y, 0.0], null, ['Top hinge', 'Middle hinge', 'Bottom hinge'][i]);
      K.box(h, [0.02, 0.1, 0.07], 'brass');
      K.cyl(h, [0.012, 0.012, 0.1], 'brass', [0.012, 0, 0.035]);
      const pin = K.part(n + 'Pin', [0.012, 0, 0.035], h, 'Hinge pin');
      K.cyl(pin, [0.006, 0.006, 0.13], 'steel');
      K.sph(pin, 0.012, 'steel', [0, 0.065, 0]);
    });
    const ls = K.part('longScrew', [-0.53, 1.88, 0.0], null, '3″ screw into the stud');
    K.cyl(ls, [0.008, 0.008, 0.24], 'steel', [0, 0, 0], [0, 0, 90]);
    const rub = K.part('rub', [0.44, 2.0, 0.0], null, 'Rub point');
    K.box(rub, [0.12, 0.04, 0.05], 'red');
    return {};
  });

  /* ---- Model: window screen frame ---- */
  TB.model('screen', { cam: [0.4, 1.6, 2.6], at: [0, 0.6, 0], hidden: ['newMesh', 'roller'] }, (K) => {
    K.box(null, [2.4, 0.06, 1.6], 'woodLight', [0, 0.03, 0]);
    const fr = K.part('frame', [0, 0.08, 0], null, 'Screen frame');
    K.box(fr, [1.6, 0.04, 0.05], 'grey', [0, 0, -0.5]);
    K.box(fr, [1.6, 0.04, 0.05], 'grey', [0, 0, 0.5]);
    K.box(fr, [0.05, 0.04, 1.05], 'grey', [-0.78, 0, 0]);
    K.box(fr, [0.05, 0.04, 1.05], 'grey', [0.78, 0, 0]);
    const old = K.part('oldMesh', [0, 0.085, 0], null, 'Torn mesh');
    K.box(old, [1.5, 0.004, 0.95], K.std(0x3c4146, { transparent: true, opacity: 0.55 }));
    K.box(old, [0.3, 0.006, 0.12], 'woodLight', [0.25, 0.002, 0.1], [0, 30, 0]);
    const spline = K.part('spline', [0, 0.1, 0], null, 'Rubber spline');
    K.box(spline, [1.5, 0.01, 0.012], 'black', [0, 0, -0.46]);
    K.box(spline, [1.5, 0.01, 0.012], 'black', [0, 0, 0.46]);
    K.box(spline, [0.012, 0.01, 0.94], 'black', [-0.74, 0, 0]);
    K.box(spline, [0.012, 0.01, 0.94], 'black', [0.74, 0, 0]);
    const nm = K.part('newMesh', [0, 0.09, 0], null, 'New mesh');
    K.box(nm, [1.8, 0.004, 1.2], K.std(0x5a6168, { transparent: true, opacity: 0.45 }));
    const roller = K.part('roller', [-0.74, 0.16, 0.2], null, 'Spline roller');
    K.cyl(roller, [0.05, 0.05, 0.02], 'steel', [0, 0, 0], [0, 0, 90]);
    K.box(roller, [0.03, 0.03, 0.3], 'yellow', [0, 0.04, 0.18], [20, 0, 0]);
    return {
      tick(t, fx) {
        if (fx === 'roll') K.parts.roller.position.z = 0.4 * Math.sin(t * 1.5);
      },
    };
  });

  TB.category({
    id: 'doors',
    code: 'DOR',
    name: 'Doors & Windows',
    domain: 'interior',
    blurb: 'Sticking doors, squeaky hinges and torn screens',
    repairs: [
      {
        id: 'door-sticks',
        title: 'Door rubs or won’t latch',
        model: 'door',
        level: 1,
        time: '30 min',
        cost: '$2–10',
        renter: true,
        summary: 'A door that rubs at the top latch-side corner or misses the strike usually sags on its top hinge. Tightening the hinge screws and driving one 3″ screw into the wall framing behind the top hinge pulls it back into line in most cases.',
        intro: { hi: ['rub', 'hingeTop'] },
        safety: ['Don’t plane or sand the door until you’ve tried the screw fix. Wood removed can’t be put back, and the rub often disappears once the hinge is pulled tight.', 'If you take the door off its hinges, get a helper. A solid-core door can weigh 50–80 lb.'],
        causes: [['Loose top hinge screws', 'The door’s weight pulls the top hinge away from the jamb, so the latch corner drops.'], ['Humidity', 'Wood swells in humid summers. A door that only rubs in July may just need a small hinge adjustment, not planing.'], ['House settling', 'Framing shifts over the years and the opening goes slightly out of square.'], ['Strike plate misaligned', 'The latch hits above or below the hole in the strike, the metal plate on the frame.']],
        tools: ['#2 Phillips screwdriver or drill/driver', '3″ wood screws with heads matching the hinge (often #9 or #10, flat head)', 'Lipstick, chalk or dry-erase marker', 'Small half-round metal file', 'Wooden toothpicks or golf tees + wood glue (for stripped holes)', '⅛″ drill bit (pilot hole)'],
        steps: [
          { t: 'Find where it rubs', d: 'Close the door slowly and watch the gap all the way around (the space between the door and the frame). Look for where it narrows to nothing, shiny worn paint, or where it scrapes. Usually it’s the top corner on the latch side.', why: 'The gap pattern tells you which hinge is the problem: a tight top latch corner and a wide gap at the top hinge side means the top hinge is sagging.', tip: 'Slide a sheet of paper around the gap with the door closed. Where the paper pinches, it rubs. Mark those spots with painter’s tape.', ok: 'You can point to where the gap is tightest and where it’s widest, and you’ve marked both.', v: { cam: [1.2, 2.2, 1.6], at: [0.4, 1.9, 0], hi: ['rub'] } },
          { t: 'Tighten all hinge screws', d: 'Open the door and tighten every screw on all three hinges, both the door side and the frame (jamb) side. Turn by hand until snug; don’t crank so hard you strip them. If a screw just spins, its hole is stripped.', why: 'Often a few loose screws are the whole problem, especially on the top hinge, which carries most of the pull.', tip: 'Stripped hole? Remove the screw, dip 3–4 wooden toothpicks or a golf tee in wood glue, tap them into the hole, snap them off flush and re-drive the screw. It grips like new.', ok: 'Every screw stops turning with firm resistance, and none spins freely.', v: { cam: [-0.6, 1.4, 1.6], at: [-0.45, 1.1, 0], hi: ['hingeTop', 'hingeMid', 'hingeBot'] } },
          { t: 'Drive a long screw in the top hinge', d: 'On the top hinge, remove the jamb-side screw closest to the doorstop (the trim strip the door closes against). Drill a ⅛″ pilot hole straight in, then drive a 3″ screw through the hinge into the wall stud behind. Tighten in small turns, closing the door between turns, until the gap evens out.', why: 'The original short screws only bite the thin ¾″ jamb. A 3″ screw reaches the stud behind and pulls the whole top of the frame toward it, which lifts the latch corner.', tip: 'Go slowly: overdriving bows the jamb inward and creates a new rub. If the gap won’t close, do the same on the middle hinge. If the rub is at the bottom instead, the bottom hinge needs the long screw.', ok: 'Closing the door, the gap along the top and the latch side looks even, about the thickness of a nickel (⅛″), and the rub sound is gone.', v: { cam: [-1.2, 2.0, 1.2], at: [-0.5, 1.85, 0], hi: ['longScrew', 'hingeTop'], show: ['longScrew'], xray: true } },
          { t: 'Check the latch', d: 'Rub lipstick, chalk or dry-erase marker on the end of the latch bolt (the slanted metal tongue). Close the door gently and turn the knob back and forth a little. Open it and look where the mark landed on the strike plate.', why: 'The mark shows exactly how far and which way the latch misses the hole.', tip: 'If the door closes but rattles, the latch is catching too loosely. Gently bending the small tab inside the strike opening toward the stop with a flat screwdriver makes it snug.', ok: 'There’s a clear colored mark on the strike, and you can see whether it’s inside the opening, above it or below it.', v: { cam: [1.0, 1.2, 1.0], at: [0.44, 1.0, 0], hi: ['latch', 'strike'], hide: ['longScrew'] } },
          { t: 'Adjust the strike', d: 'If the mark is off by ⅛″ or less, file the strike opening wider on that side with a half-round file. If it’s off by more, unscrew the strike, chisel the recess longer, fill the old screw holes with glued toothpicks, and screw the strike in the new spot.', why: 'Filing is quick for small misses. Bigger offsets need the plate moved, or the screws will just slide back into the old holes.', tip: 'Leave the strike on the jamb while filing so it doesn’t bend, and stuff a rag in the hole to catch the metal filings.', ok: 'The door closes with a light push, you hear a crisp click, and the door doesn’t rattle when you push on it closed.', v: { cam: [1.0, 1.2, 1.0], at: [0.44, 1.0, 0], hi: ['strike'] } },
        ],
        tricks: [
          ['Gap tells all', 'Rub at the top latch corner means the top hinge is pulling out. Rub at the bottom hinge-side corner or a big gap at the top hinge means the same thing. Rub along the whole latch edge usually means humidity or paint buildup.'],
          ['Cardboard shim', 'If the door hits the latch-side jamb along its whole height, put a piece of thin cardboard behind the bottom hinge leaf. It tips the door back toward the hinge side.'],
          ['Paint buildup', 'Doors painted many times stick at the edges. Scrape and sand only the painted edge, then seal it with one thin coat; unsealed wood swells even more.'],
          ['Plane last, then seal', 'If you must plane, mark the rub with the door closed, plane only past the line, and seal the bare edge the same day.'],
          ['Hinge-bending tool', 'A $20 hinge-adjusting tool bends a hinge knuckle slightly to fine-tune the gap without removing anything.'],
          ['Match the screw head', 'Bring the old hinge screw to the store. A brass or black head that matches looks much better than a bright zinc screw.'],
        ],
        refs: [
          ['Q&A: Do Door Jambs Need Shims? (Journal of Light Construction)', 'https://www.jlconline.com/how-to/interiors/q-a-do-door-jambs-need-shims_o/'],
          ['Installing Pre-Hung Interior Doors (Journal of Light Construction)', 'https://www.jlconline.com/how-to/interiors/hanging-pre-hung-interior-doors_o/'],
          ['Problem-Free Prefit Doors (Gary Katz, This is Carpentry)', 'https://www.thisiscarpentry.com/2013/08/09/problem-free-prefit-doors/'],
          ['How to Install a Pre-Hung Interior Door (This Old House)', 'https://www.thisoldhouse.com/how-to/how-to-install-pre-hung-interior-door'],
        ],
        learn: {
          how: 'A door hangs from its hinges like a gate. Its weight tries to pull the top hinge out of the frame and pushes the bottom hinge in. When the top hinge screws loosen, the latch side drops and the top corner swings into the frame. Pulling the top hinge back toward the stud lifts the latch corner and evens out the gap.',
          specs: [['Even gap around door', '≈ ⅛″ (3⁄32–⅛″)'], ['Long screw length', '2½–3″ into the stud'], ['Pilot hole', '⅛″ for a #9–#10 screw'], ['Strike filing limit', '≈ ⅛″; more means move the strike'], ['Interior door weight', '25–50 lb hollow, 50–80 lb solid']],
          terms: [['Jamb', 'The frame sides and top the door hangs in.'], ['Strike plate', 'The metal plate with the hole the latch drops into.'], ['Stop', 'The strip of trim the door closes against.'], ['Reveal', 'The gap between the door and its jamb.'], ['Latch bolt', 'The slanted spring-loaded tongue that holds the door shut.']],
          mistakes: ['Planing the door before fixing the hinge.', 'Overdriving the long screw so the jamb bows.', 'Driving the long screw in the hole furthest from the stop, where it may miss the stud.'],
          tips: ['Stripped hole? Pack it with glued wooden toothpicks, snap them off flush, and re-drive the screw.'],
        },
        pro: 'Doors all over the house suddenly start sticking along with new wall cracks, or an exterior door won’t seal or lock.',
      },
      {
        id: 'squeaky-hinge',
        title: 'Squeaky door hinge',
        model: 'door',
        level: 1,
        time: '10–20 min',
        cost: '$0–8',
        renter: true,
        summary: 'Pull the hinge pin, clean off rust and grit, coat it with a thin film of grease, and tap it back in. Work one hinge at a time with the door closed so it stays hung.',
        intro: { hi: ['hingeTop', 'hingeMid', 'hingeBot'] },
        safety: ['Remove only one pin at a time, with the door closed. Pulling all the pins lets the door fall.', 'Wear safety glasses when tapping pins; a slipping nail can flick grit into your eyes.', 'Exterior security hinges often have pins that can’t be removed. Don’t force them; lubricate from the top instead.'],
        causes: [['Dry pin', 'The factory grease wore off.'], ['Rust or grit', 'Common on exterior and bathroom doors.'], ['Worn knuckles', 'Old hinges with sloppy, worn barrels squeak and let the door sag; replace them.']],
        tools: ['Hammer', '8d nail, small screwdriver or pin punch', 'White lithium grease (or paste wax / petroleum jelly)', 'Fine steel wool or a scrubbing pad', 'Rags or paper towels', 'Painter’s tape (to protect the floor)'],
        steps: [
          { t: 'Close the door', d: 'Find the squeaky hinge by swinging the door slowly and listening; often it’s the top one. Then close the door fully so the latch holds it, and put a rag on the floor under the hinge to catch drips.', why: 'A closed door is held by the latch and the other two hinges, so it can’t swing or sag while one pin is out.', tip: 'Put a thin wedge or a folded piece of cardboard under the door’s free corner for extra support while the pin is out.', ok: 'The door is latched and doesn’t move when you push on it lightly.', v: { cam: [-0.8, 2.0, 1.4], at: [-0.45, 1.8, 0], hi: ['hingeTop'] } },
          { t: 'Tap the pin up', d: 'Put the tip of a nail or screwdriver against the bottom of the pin, under the hinge, and tap upward with a hammer. Once the head lifts about ¼″, pull the pin out the rest of the way with your fingers or pliers.', why: 'Tapping from below pushes the pin out straight without bending its head or chipping the hinge finish.', tip: 'Pin stuck? Spray a little penetrating oil at the top and bottom of the barrel, wait 10 minutes, and try again. Never pry under the pin head; it chews up the paint.', ok: 'The pin slides out in your hand and the two hinge leaves stay lined up.', v: { cam: [-0.8, 2.0, 1.4], at: [-0.45, 1.85, 0], hi: ['hingeTopPin'], mv: { hingeTopPin: [0, 0.22, 0] } } },
          { t: 'Clean and lube', d: 'Scrub the pin with fine steel wool until it’s bright, then wipe it clean. Coat it with a thin film of white lithium grease. Wipe the inside of the hinge barrel with a rag on a nail.', why: 'Grease stays where you put it. Thin spray oils run off and attract dust, so the squeak comes back quickly.', tip: 'Thin is the key word. A thick blob just squeezes out and drips down the door. Wipe the pin, then add a coat you can barely see.', ok: 'The pin feels smooth and slippery, has no orange rust, and isn’t dripping.', v: { cam: [-0.7, 2.1, 1.0], at: [-0.45, 2.05, 0], hi: ['hingeTopPin'] } },
          { t: 'Reinstall and repeat', d: 'Push the pin back into the hinge and tap its head down until it sits fully seated. Swing the door open and closed 10 times, wipe any grease that oozes out, then do the other hinges the same way.', why: 'Moving the door works the grease into the knuckles (the rolled barrels the pin runs through).', tip: 'If the pin won’t line up, lift the door handle slightly to align the knuckles while you push it in.', ok: 'The door swings silently through its full range and the pin head sits flat on the top knuckle.', v: { cam: [-1.0, 1.6, 2.0], at: [-0.45, 1.1, 0], hi: ['hingeMid', 'hingeBot'], mv: { hingeTopPin: [0, 0, 0] } } },
        ],
        tricks: [
          ['No grease handy', 'Bar soap, a candle stub or petroleum jelly rubbed on the pin works in a pinch.'],
          ['Do all three', 'Even if only one hinge squeaks, do all of them. The others are usually a few months behind.'],
          ['Rusty pins', 'Badly pitted pins are cheap. Take one to the hardware store and buy a replacement of the same diameter and finish.'],
          ['Loose door too?', 'While the pin is out, check the hinge screws. Loose ones let the knuckles grind and squeak.'],
          ['Drip guard', 'Stick a strip of painter’s tape under the hinge on the door and frame while lubing. Peel it off with the mess.'],
        ],
        refs: [
          ['Installing Pre-Hung Interior Doors: hinges and hanging (Journal of Light Construction)', 'https://www.jlconline.com/how-to/interiors/hanging-pre-hung-interior-doors_o/'],
          ['Problem-Free Prefit Doors (Gary Katz, This is Carpentry)', 'https://www.thisiscarpentry.com/2013/08/09/problem-free-prefit-doors/'],
          ['How to Install a Pre-Hung Interior Door (This Old House)', 'https://www.thisoldhouse.com/how-to/how-to-install-pre-hung-interior-door'],
        ],
        learn: {
          how: 'A hinge is two leaves with interlocking knuckles and a steel pin running through them. The door’s weight presses the knuckles together, and metal sliding on metal without a film of lubricant chatters, which you hear as the squeak.',
          specs: [['Interior hinge size', '3½″ × 3½″'], ['Exterior hinge size', '4″ × 4″'], ['Hinges per door', '3 (2 on light closet doors)']],
          terms: [['Knuckle', 'The rolled barrel parts of each hinge leaf.'], ['Hinge pin', 'Removable rod joining the leaves.'], ['Non-removable pin', 'A security pin with a set screw, used on outswing exterior doors.']],
          mistakes: ['Removing all pins at once.', 'Over-oiling so it drips onto the floor and carpet.', 'Spraying WD-40 alone; it’s mostly a cleaner and evaporates.'],
          tips: ['Bar soap or a candle rubbed on the pin works in a pinch.'],
        },
        pro: 'The hinge leaf is cracked, the knuckles are worn oval, or it’s a heavy exterior or fire-rated door whose hinges need matching replacements.',
      },
      {
        id: 'window-screen',
        title: 'Torn window screen',
        model: 'screen',
        level: 1,
        time: '45 min',
        cost: '$10–20',
        renter: true,
        summary: 'Rescreening takes a roll of mesh, new spline (the rubber cord that holds the mesh) and a $5 spline roller. Done flat on a table, it looks factory-new.',
        intro: { hi: ['oldMesh'] },
        safety: ['Utility knives slip on screen work. Cut away from your body and keep your other hand behind the blade.', 'Old aluminum frames have sharp corners and burrs. Gloves help.'],
        causes: [['Pets and kids', 'Pushing on screens or clawing them.'], ['Brittle old mesh', 'Sun-damaged fiberglass tears easily.'], ['Popped spline', 'Old spline shrinks and hardens, so the mesh pulls loose at a corner.']],
        tools: ['Fiberglass screen mesh (cut 2″ bigger than the frame on all sides)', 'Rubber spline (match the old one’s diameter)', 'Spline roller (convex and concave wheels)', 'Utility knife with a fresh blade', 'Small flat screwdriver', 'Spring clamps or painter’s tape', 'Two scrap wood strips (to stop the frame bowing)'],
        steps: [
          { t: 'Pull the old spline', d: 'Lay the screen flat on a table. Find the spline’s end (usually in a corner), pry it up with a small screwdriver and pull it out all the way around. Lift out the torn mesh and brush any grit out of the channel (the groove around the frame).', why: 'You need the old spline to match its diameter. A spline too thin lets the mesh pop out; too thick and it won’t go in.', tip: 'Take a 2″ piece of the old spline to the store. If it’s hard and cracked, buy the next size up if new spline seems loose in the channel, or the next size down for thicker pet screen.', ok: 'The channel is empty and clean all the way around, and you have a sample of the old spline.', v: { cam: [0.6, 1.2, 1.6], at: [-0.5, 0.1, 0.3], hi: ['spline', 'oldMesh'] } },
          { t: 'Lay the new mesh', d: 'Unroll the mesh over the frame so it overlaps the channel by about 2″ on all sides. Square it up with the frame edges. Clamp or tape one long side to the table, and screw or clamp a wood strip along the frame’s inside edges if it’s a long, thin screen.', why: 'Extra mesh gives you something to hold while rolling, and the strips stop the frame from bowing inward as the mesh tightens.', tip: 'Cut a small square out of each corner of the mesh, just outside where the channels meet. It stops the corners bunching into lumps.', ok: 'The mesh lies flat, its weave runs parallel to the frame edges, and there’s about 2″ extra all around.', v: { cam: [0.4, 1.6, 2.6], at: [0, 0.1, 0], hi: ['newMesh'], hide: ['oldMesh', 'spline'], show: ['newMesh'] } },
          { t: 'Roll in the spline', d: 'Start at a corner. First run the convex (rounded) wheel along the channel to crease the mesh into it. Then lay the spline over the crease and press it in with the concave (grooved) wheel, using short firm strokes. Do one long side, then the opposite side, then the two ends. At each corner, push the spline down with a screwdriver.', why: 'Doing opposite sides in turn keeps the tension even, so the mesh tightens without ripples or diagonal waves.', tip: 'Pull the mesh gently away from the side you’re rolling, just enough to remove slack. Too much pull bows the frame. Wavy mesh? Pull that stretch of spline out and roll it again.', ok: 'The spline sits fully down in the channel all the way around, and the mesh is flat and taut like a drum, not bowed or rippled.', v: { cam: [0.0, 1.0, 1.6], at: [-0.7, 0.1, 0.1], hi: ['roller', 'spline'], show: ['roller', 'spline'], fx: 'roll' } },
          { t: 'Trim the excess', d: 'Cut the spline end flush where it meets the start. Trim the extra mesh with a sharp utility knife, blade resting on the outer lip of the channel and angled away from the screen, using light strokes.', why: 'Angling the blade against the frame keeps it from slicing the stretched mesh inside the spline.', tip: 'Snap off to a fresh blade section before trimming. A dull blade drags and pulls the mesh out of the spline.', ok: 'A clean edge with no loose strands outside the spline, and the screen fits back in the window without forcing.', v: { cam: [0.4, 1.6, 2.6], at: [0, 0.1, 0], hi: ['frame'], hide: ['roller'] } },
        ],
        tricks: [
          ['Bow-proof frames', 'Long thin frames bow in as the mesh tightens. Clamp a straight board along each long side before rolling.'],
          ['Pet-resistant mesh', 'For cats and dogs, buy pet screen (thicker vinyl-coated polyester). It needs a slightly thinner spline than standard mesh.'],
          ['Solar screen', 'Sun-control screen blocks heat and glare on west windows. It installs the same way.'],
          ['Tiny tear quick fix', 'For a hole under 1″, a stick-on fiberglass screen patch or a dab of clear nail polish stops it spreading until you rescreen.'],
          ['Do a batch', 'A 48″ × 25′ roll does several windows. Buying one big roll is far cheaper than single-screen kits.'],
        ],
        refs: [
          ['How to Rescreen Your Windows Like a Pro (Window Hardware Direct)', 'https://windowhardwaredirect.com/blogs/news/how-to-rescreen-your-windows-like-a-pro-in-simple-steps'],
          ['How to Rescreen a Window in 3 Quick and Easy Steps (Hometalk)', 'https://hometalk.com/diy/build/doors-windows/how-to-rescreen-a-window-44801317'],
          ['Screen spline sizes (Ace Hardware)', 'https://www.acehardware.com/departments/hardware/window-and-screen-hardware/screen-spline/51991'],
        ],
        learn: {
          how: 'The mesh is held by friction: a rubber cord (spline) squeezes it into a groove around the frame. Rolling the spline in pulls the mesh tight as it goes down, so the order you roll the sides decides how even the tension is.',
          specs: [['Common spline sizes', '0.125″, 0.140″, 0.160″ (larger exist)'], ['Standard mesh', '18 × 16 fiberglass'], ['Mesh overlap', '≈ 2″ past the channel all around'], ['Pet screen', 'Use one spline size smaller']],
          terms: [['Spline', 'Rubber cord that locks mesh into the frame channel.'], ['Channel', 'The groove around the frame that holds the spline.'], ['Convex wheel', 'The rounded roller wheel that creases mesh into the channel.'], ['Pet screen', 'Heavier vinyl-coated polyester mesh.']],
          mistakes: ['Pulling the mesh too tight, which bows the frame inward.', 'Using the wrong spline size.', 'Rolling one side fully, then the adjacent side, which pulls the mesh crooked.'],
          tips: ['Put a strip of wood in the middle of the frame while rolling to stop it bowing.'],
        },
        pro: 'The frame is bent or the corners are cracked. A new frame kit or custom screen is often cheaper than repair.',
      },
    ],
  });
})();
