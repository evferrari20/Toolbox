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
        summary: 'A door that rubs at the top corner or misses the strike usually sags on its top hinge. One long screw usually pulls it back into line.',
        intro: { hi: ['rub', 'hingeTop'] },
        safety: ['Don’t plane a door before trying the screw fix. Wood removed can’t be put back.'],
        causes: [['Loose top hinge screws', 'The door’s weight pulls the top hinge away from the jamb.'], ['House settling / humidity', 'Wood swells in summer.'], ['Strike plate misaligned', 'Latch hits above or below the hole.']],
        tools: ['Phillips screwdriver or drill', '3″ wood screws (matching head)', 'Lipstick or dry-erase marker', 'Small file'],
        steps: [
          { t: 'Find where it rubs', d: 'Close the door slowly and look for the tight gap or worn paint, usually at the top latch-side corner.', why: 'Gap pattern tells you which hinge is loose: tight at top latch side means the top hinge is sagging.', v: { cam: [1.2, 2.2, 1.6], at: [0.4, 1.9, 0], hi: ['rub'] } },
          { t: 'Tighten all hinge screws', d: 'Tighten every screw on all three hinges. If one just spins, it’s stripped.', why: 'Often a few loose screws are the whole problem.', v: { cam: [-0.6, 1.4, 1.6], at: [-0.45, 1.1, 0], hi: ['hingeTop', 'hingeMid', 'hingeBot'] } },
          { t: 'Drive a long screw in the top hinge', d: 'Replace one jamb-side screw of the top hinge (the one closest to the stop) with a 3″ screw. Drive it until the gap evens out.', why: 'Short screws only bite the thin jamb. A 3″ screw reaches the wall stud behind and pulls the whole frame toward it.', v: { cam: [-1.2, 2.0, 1.2], at: [-0.5, 1.85, 0], hi: ['longScrew', 'hingeTop'], show: ['longScrew'], xray: true } },
          { t: 'Check the latch', d: 'Rub lipstick on the latch bolt, close the door, and see where it marks the strike.', why: 'The mark shows exactly how far to move or file the strike opening.', v: { cam: [1.0, 1.2, 1.0], at: [0.44, 1.0, 0], hi: ['latch', 'strike'], hide: ['longScrew'] } },
          { t: 'Adjust the strike', d: 'If off by ⅛″ or less, file the strike opening. More than that, move the strike plate.', why: 'Filing is quick for small misses; bigger offsets need the plate relocated and the old holes filled.', v: { cam: [1.0, 1.2, 1.0], at: [0.44, 1.0, 0], hi: ['strike'] } },
        ],
        learn: {
          how: 'A door hangs from its hinges like a gate. All of its weight pulls on the top hinge and pushes on the bottom one. When the top hinge screws loosen, the latch side drops and the top corner swings into the frame. Pulling the top hinge back toward the stud lifts the latch corner.',
          specs: [['Even gap around door', '⅛″'], ['Long screw length', '2½–3″'], ['Interior door weight', '25–50 lb']],
          terms: [['Jamb', 'The frame sides the door hangs in.'], ['Strike plate', 'Metal plate with the hole the latch drops into.'], ['Stop', 'Strip of trim the door closes against.']],
          mistakes: ['Planing the door before fixing the hinge.', 'Overdriving the long screw so the jamb bows.'],
          tips: ['Stripped hole? Pack it with wooden toothpicks and glue, snap them off flush, and re-drive the screw.'],
        },
        pro: 'Doors all over the house start sticking with new wall cracks, or an exterior door won’t seal.',
      },
      {
        id: 'squeaky-hinge',
        title: 'Squeaky door hinge',
        model: 'door',
        level: 1,
        time: '10 min',
        cost: '$0–8',
        summary: 'Pull the hinge pin, clean and lubricate it, and drop it back in. One hinge at a time so the door stays hung.',
        intro: { hi: ['hingeTop', 'hingeMid', 'hingeBot'] },
        safety: ['Remove only one pin at a time. Pulling all three drops the door.'],
        causes: [['Dry pin', 'Lubricant wore off.'], ['Rust or grit', 'Common on exterior or bathroom doors.']],
        tools: ['Nail and hammer (or a pin punch)', 'White lithium grease or paste wax', 'Steel wool', 'Rag'],
        steps: [
          { t: 'Close the door', d: 'Close the door so its weight sits on the latch and other hinges.', why: 'A closed door can’t swing or sag while one pin is out.', v: { cam: [-0.8, 2.0, 1.4], at: [-0.45, 1.8, 0], hi: ['hingeTop'] } },
          { t: 'Tap the pin up', d: 'Set a nail under the pin head from below and tap upward until the pin lifts out.', why: 'Tapping from below pushes the pin out cleanly without bending the head.', v: { cam: [-0.8, 2.0, 1.4], at: [-0.45, 1.85, 0], hi: ['hingeTopPin'], mv: { hingeTopPin: [0, 0.22, 0] } } },
          { t: 'Clean and lube', d: 'Rub rust off with steel wool, wipe clean, and coat lightly with lithium grease.', why: 'Grease stays put. Spray oils like WD-40 attract dust and the squeak returns quickly.', v: { cam: [-0.7, 2.1, 1.0], at: [-0.45, 2.05, 0], hi: ['hingeTopPin'] } },
          { t: 'Reinstall and repeat', d: 'Tap the pin back in, open and close the door a few times, then do the other hinges.', why: 'Moving the door works the lubricant into the knuckles.', v: { cam: [-1.0, 1.6, 2.0], at: [-0.45, 1.1, 0], hi: ['hingeMid', 'hingeBot'], mv: { hingeTopPin: [0, 0, 0] } } },
        ],
        learn: {
          how: 'A hinge is two leaves with interlocking knuckles and a steel pin running through them. Metal rubbing on metal without a film of lubricant makes the squeak.',
          specs: [['Hinge size (interior)', '3½″'], ['Hinges per door', '3 (2 on light closets)']],
          terms: [['Knuckle', 'The rolled barrel parts of each hinge leaf.'], ['Hinge pin', 'Removable rod joining the leaves.']],
          mistakes: ['Removing all pins at once.', 'Over-oiling so it drips onto the floor.'],
          tips: ['Bar soap or a candle rubbed on the pin works in a pinch.'],
        },
        pro: 'The hinge leaf is cracked or the door is a heavy exterior or fire-rated door.',
      },
      {
        id: 'window-screen',
        title: 'Torn window screen',
        model: 'screen',
        level: 1,
        time: '45 min',
        cost: '$10–20',
        summary: 'Rescreening takes a roll of mesh, new spline and a $5 roller. Done on a table, it looks factory-new.',
        intro: { hi: ['oldMesh'] },
        safety: ['Utility knives slip toward you on screen work. Cut away from your body.'],
        causes: [['Pets and kids', 'Pushing on screens.'], ['Brittle old mesh', 'Sun-damaged fiberglass tears easily.']],
        tools: ['Fiberglass screen mesh (cut 2″ bigger all around)', 'Rubber spline (match diameter)', 'Spline roller', 'Utility knife', 'Small flat screwdriver', 'Spring clamps'],
        steps: [
          { t: 'Pull the old spline', d: 'Lift one end of the spline with a screwdriver and pull it out all the way around. Remove the torn mesh.', why: 'Measure the old spline’s diameter so the new one fits the channel snugly.', v: { cam: [0.6, 1.2, 1.6], at: [-0.5, 0.1, 0.3], hi: ['spline', 'oldMesh'] } },
          { t: 'Lay the new mesh', d: 'Lay mesh over the frame with 2″ extra all around. Clamp one side.', why: 'Extra mesh gives you something to hold while the roller pulls it taut.', v: { cam: [0.4, 1.6, 2.6], at: [0, 0.1, 0], hi: ['newMesh'], hide: ['oldMesh', 'spline'], show: ['newMesh'] } },
          { t: 'Roll in the spline', d: 'Start at a corner. Use the convex roller wheel to press the mesh into the channel, then the concave wheel to press the spline in on top. Work opposite sides.', why: 'Opposite sides first keeps the tension even, so the mesh doesn’t ripple.', v: { cam: [0.0, 1.0, 1.6], at: [-0.7, 0.1, 0.1], hi: ['roller', 'spline'], show: ['roller', 'spline'], fx: 'roll' } },
          { t: 'Trim the excess', d: 'Cut the extra mesh with a sharp blade angled against the outside of the spline.', why: 'Angling the blade against the frame keeps it from cutting into the stretched mesh.', v: { cam: [0.4, 1.6, 2.6], at: [0, 0.1, 0], hi: ['frame'], hide: ['roller'] } },
        ],
        learn: {
          how: 'The mesh is held by friction: a rubber cord (spline) squeezes it into a groove around the frame. Rolling the spline in pulls the mesh tight as it goes down.',
          specs: [['Common spline sizes', '0.125″–0.175″'], ['Standard mesh', '18×16 fiberglass']],
          terms: [['Spline', 'Rubber cord that locks mesh into the frame channel.'], ['Pet screen', 'Heavier vinyl-coated polyester mesh.']],
          mistakes: ['Pulling the mesh too tight, which bows the frame inward.', 'Using the wrong spline size.'],
          tips: ['Put a strip of wood in the middle of the frame while rolling to stop it bowing.'],
        },
        pro: 'The frame is bent or the corners are cracked. A new frame is often cheaper than repair.',
      },
    ],
  });
})();
