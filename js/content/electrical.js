/* ELC · Electrical */
(function () {
  // Wall section with an open electrical box; returns nothing, adds parts.
  function wallAndBox(K, opts) {
    const wall = K.part('wall', [0, 0, 0], null, 'Wall');
    // drywall with a cutout around the box
    K.box(wall, [2.6, 0.9, 0.06], 'drywall', [0, 0.45, 0]);
    K.box(wall, [2.6, 0.9, 0.06], 'drywall', [0, 2.05, 0]);
    K.box(wall, [1.06, 0.7, 0.06], 'drywall', [-0.77, 1.25, 0]);
    K.box(wall, [1.06, 0.7, 0.06], 'drywall', [0.77, 1.25, 0]);
    K.box(wall, [0.12, 2.5, 0.5], 'woodLight', [-0.55, 1.25, -0.3]);
    const box = K.part('box', [0, 1.25, -0.25], null, 'Electrical box');
    K.box(box, [0.5, 0.68, 0.03], 'blue', [0, 0, -0.24]);
    K.box(box, [0.03, 0.68, 0.5], 'blue', [-0.24, 0, 0]);
    K.box(box, [0.03, 0.68, 0.5], 'blue', [0.24, 0, 0]);
    K.box(box, [0.5, 0.03, 0.5], 'blue', [0, 0.33, 0]);
    K.box(box, [0.5, 0.03, 0.5], 'blue', [0, -0.33, 0]);
    // cable entering box
    K.tube(null, [[0, 2.4, -0.4], [0, 1.9, -0.45], [0.05, 1.62, -0.42]], 0.05, 'offwhite');
    const tester = K.part('tester', [0.65, 1.45, 0.4], null, 'Voltage tester');
    K.cyl(tester, [0.05, 0.06, 0.45], 'yellow', [0, 0, 0], [0, 0, -50]);
    K.cyl(tester, [0.02, 0.05, 0.12], 'black', [-0.21, -0.18, 0], [0, 0, -50]);
    const lamp = K.sph(tester, 0.03, 'ledR', [0.15, 0.13, 0.03]);
    return { lamp };
  }

  /* ---- Model: receptacle in a wall box ---- */
  TB.model('outlet', { cam: [1.5, 1.7, 2.2], at: [0, 1.25, 0], hidden: ['tester'] }, (K) => {
    const { lamp } = wallAndBox(K);
    const plate = K.part('plate', [0, 1.25, 0.06], null, 'Cover plate');
    K.box(plate, [0.6, 0.95, 0.03], 'offwhite');
    K.cyl(plate, [0.02, 0.02, 0.02], 'offwhite', [0, 0, 0.02], [90, 0, 0]);

    function device(name, label) {
      const d = K.part(name, [0, 1.25, 0.0], null, label);
      K.box(d, [0.13, 0.95, 0.02], 'steel', [0, 0, 0.02]);
      K.box(d, [0.36, 0.72, 0.22], 'offwhite', [0, 0, -0.1]);
      [0.17, -0.17].forEach((y) => {
        K.box(d, [0.32, 0.26, 0.04], 'offwhite', [0, y, 0.035]);
        K.box(d, [0.025, 0.08, 0.01], 'black', [-0.05, y + 0.03, 0.056]);
        K.box(d, [0.025, 0.1, 0.01], 'black', [0.05, y + 0.03, 0.056]);
        K.cyl(d, [0.025, 0.025, 0.01, 16, false], 'black', [0, y - 0.07, 0.056], [90, 0, 0]);
      });
      // terminals: brass = hot (right), silver = neutral (left), green = ground
      [0.15, -0.15].forEach((y) => {
        K.cyl(d, [0.035, 0.035, 0.03], 'brass', [0.2, y, -0.08], [0, 0, 90]);
        K.cyl(d, [0.035, 0.035, 0.03], 'chrome', [-0.2, y, -0.08], [0, 0, 90]);
      });
      K.cyl(d, [0.03, 0.03, 0.03], 'green', [0.08, -0.38, 0.02], [90, 0, 0]);
      return d;
    }
    const dev = device('device', 'Receptacle');
    const wires = K.part('wires', [0, 0, 0], dev, 'Hot, neutral & ground wires');
    K.tube(wires, [[0.05, 0.3, -0.42], [0.18, 0.2, -0.3], [0.22, 0.15, -0.12], [0.2, 0.15, -0.08]], 0.018, 'black');
    K.tube(wires, [[0.0, 0.3, -0.42], [-0.18, 0.2, -0.3], [-0.22, 0.15, -0.12], [-0.2, 0.15, -0.08]], 0.018, 'white');
    K.tube(wires, [[0.02, 0.3, -0.42], [0.1, -0.1, -0.35], [0.12, -0.38, -0.1], [0.08, -0.38, 0.01]], 0.012, 'copper');
    const hot = K.part('hotScrew', [0.2, 0.15, -0.08], dev, 'Brass screw = hot (black)');
    K.sph(hot, 0.045, 'brass');
    const neu = K.part('neutralScrew', [-0.2, 0.15, -0.08], dev, 'Silver screw = neutral (white)');
    K.sph(neu, 0.045, 'chrome');
    const gnd = K.part('groundScrew', [0.08, -0.38, 0.02], dev, 'Green screw = ground');
    K.sph(gnd, 0.04, 'green');

    return {
      tick(t, fx) {
        lamp.material.emissiveIntensity = fx === 'live' ? 0.6 + 0.6 * Math.sin(t * 12) : 0.05;
      },
    };
  });

  /* ---- Model: single-pole switch in a wall box ---- */
  TB.model('switch', { cam: [1.5, 1.7, 2.2], at: [0, 1.25, 0], hidden: ['tester'] }, (K) => {
    const { lamp } = wallAndBox(K);
    const plate = K.part('plate', [0, 1.25, 0.06], null, 'Switch plate');
    K.box(plate, [0.42, 0.72, 0.03], 'offwhite');
    const d = K.part('device', [0, 1.25, 0], null, 'Switch');
    K.box(d, [0.13, 0.95, 0.02], 'steel', [0, 0, 0.02]);
    K.box(d, [0.3, 0.55, 0.24], 'offwhite', [0, 0, -0.1]);
    const tog = K.part('toggle', [0, 0, 0.04], d, 'Toggle');
    K.box(tog, [0.09, 0.2, 0.06], 'offwhite', [0, 0.06, 0.03], [-20, 0, 0]);
    [0.12, -0.12].forEach((y, i) => {
      const s = K.part(i ? 'screwB' : 'screwA', [0.17, y, -0.08], d, i ? 'Brass terminal (load)' : 'Brass terminal (line)');
      K.sph(s, 0.045, 'brass');
    });
    const g = K.part('groundScrew', [0.08, -0.38, 0.02], d, 'Green ground screw');
    K.sph(g, 0.04, 'green');
    const w = K.part('wires', [0, 0, 0], d, 'Switch wires');
    K.tube(w, [[0.05, 0.3, -0.42], [0.18, 0.2, -0.3], [0.2, 0.12, -0.1], [0.17, 0.12, -0.08]], 0.018, 'black');
    K.tube(w, [[0.0, 0.3, -0.42], [0.2, -0.0, -0.3], [0.2, -0.12, -0.1], [0.17, -0.12, -0.08]], 0.018, 'black');
    K.tube(w, [[0.02, 0.3, -0.42], [0.1, -0.1, -0.35], [0.12, -0.38, -0.1], [0.08, -0.38, 0.01]], 0.012, 'copper');
    // capped neutral bundle in back of box
    K.tube(null, [[-0.05, 1.55, -0.42], [-0.15, 1.35, -0.4], [-0.15, 1.2, -0.38]], 0.018, 'white');
    K.cone(null, [0.045, 0.1], 'yellow', [-0.15, 1.15, -0.38], [180, 0, 0]);
    return {
      tick(t, fx) {
        lamp.material.emissiveIntensity = fx === 'live' ? 0.6 + 0.6 * Math.sin(t * 12) : 0.05;
      },
    };
  });

  /* ---- Model: breaker panel + GFCI circuit ---- */
  TB.model('circuit', { cam: [0.4, 1.6, 3.6], at: [0.1, 1.3, 0], hidden: ['plugTester'] }, (K) => {
    K.box(null, [3.6, 2.6, 0.06], 'drywall', [0.3, 1.3, -0.05]);
    const panel = K.part('panel', [-0.8, 1.35, 0.06], null, 'Breaker panel');
    K.box(panel, [0.8, 1.4, 0.16], 'lightgrey', [0, 0, -0.04]);
    K.box(panel, [0.62, 1.18, 0.02], 'steel', [0, 0, 0.05]);
    const main = K.part('main', [0, 0.45, 0.08], panel, 'Main breaker');
    K.box(main, [0.3, 0.16, 0.06], 'black');
    K.box(main, [0.24, 0.05, 0.05], 'dark', [0, 0, 0.05]);
    for (let r = 0; r < 7; r++)
      for (const side of [-1, 1]) {
        const isTrip = r === 3 && side === 1;
        const name = isTrip ? 'tripped' : null;
        const g = K.part(name, [side * 0.13, 0.25 - r * 0.12, 0.08], panel, isTrip ? 'Tripped breaker' : null);
        K.box(g, [0.22, 0.1, 0.05], 'black');
        const h = K.part(isTrip ? 'tripHandle' : null, [side * -0.04, 0, 0.04], g, isTrip ? 'Breaker handle' : null);
        K.box(h, [0.07, 0.05, 0.04], isTrip ? 'red' : 'dark');
        K.box(g, [0.07, 0.07, 0.002], 'offwhite', [side * 0.06, 0, 0.026]);
      }
    const door = K.part('door', [-0.4, 0, 0.1], panel, 'Panel door');
    K.box(door, [0.8, 1.4, 0.02], 'lightgrey', [0.4, 0, 0]);
    K.box(door, [0.04, 0.14, 0.04], 'dark', [0.72, 0, 0.02]);

    // GFCI outlet
    const gf = K.part('gfci', [0.6, 1.0, 0.0], null, 'GFCI outlet');
    K.box(gf, [0.42, 0.7, 0.03], 'offwhite', [0, 0, 0]);
    K.box(gf, [0.3, 0.56, 0.04], 'white', [0, 0, 0.03]);
    [0.17, -0.17].forEach((y) => {
      K.box(gf, [0.022, 0.07, 0.01], 'black', [-0.045, y, 0.055]);
      K.box(gf, [0.022, 0.09, 0.01], 'black', [0.045, y, 0.055]);
    });
    const test = K.part('test', [0, 0.04, 0.06], gf, 'TEST button');
    K.box(test, [0.11, 0.05, 0.03], 'black');
    const reset = K.part('reset', [0, -0.04, 0.06], gf, 'RESET button');
    K.box(reset, [0.11, 0.05, 0.03], 'red');
    const led = K.sph(gf, 0.012, 'ledG', [0.1, 0, 0.06]);
    // downstream outlet
    const o2 = K.part('outlet2', [1.4, 1.0, 0.0], null, 'Protected outlet (downstream)');
    K.box(o2, [0.42, 0.7, 0.03], 'offwhite');
    [0.15, -0.15].forEach((y) => {
      K.box(o2, [0.022, 0.07, 0.01], 'black', [-0.045, y, 0.03]);
      K.box(o2, [0.022, 0.09, 0.01], 'black', [0.045, y, 0.03]);
    });
    K.tube(null, [[0.6, 0.6, -0.04], [1.0, 0.5, -0.04], [1.4, 0.6, -0.04]], 0.015, 'grey');
    const pt = K.part('plugTester', [1.4, 1.15, 0.12], null, 'Plug-in outlet tester');
    K.box(pt, [0.22, 0.14, 0.18], 'yellow');
    const leds = [K.sph(pt, 0.02, 'ledG', [-0.05, 0.075, 0.03]), K.sph(pt, 0.02, 'ledR', [0, 0.075, 0.03]), K.sph(pt, 0.02, 'ledG', [0.05, 0.075, 0.03])];
    return {
      tick(t, fx) {
        const on = fx === 'power';
        led.material.emissiveIntensity = on ? 1 : 0.05;
        leds.forEach((l, i) => (l.material.emissiveIntensity = on && i !== 1 ? 1 : 0.05));
      },
    };
  });

  const ELEC_SAFETY = 'Turn off the breaker, then confirm the circuit is dead with a non-contact voltage tester on every wire before touching anything.';

  TB.category({
    id: 'electrical',
    code: 'ELC',
    name: 'Electrical',
    domain: 'systems',
    blurb: 'Dead outlets, worn receptacles and switches',
    repairs: [
      {
        id: 'dead-outlet',
        title: 'Outlet stopped working',
        model: 'circuit',
        level: 1,
        time: '10–20 min',
        cost: '$0–15',
        summary: 'Before replacing anything, check for a tripped GFCI upstream and a tripped breaker in the panel. One of them is the cause most of the time.',
        intro: { hi: ['gfci', 'tripped'] },
        safety: ['Stand on a dry floor and use one hand on the panel when you can.', 'If a breaker trips again right after you reset it, stop. There is a fault on that circuit.', 'Never remove the panel’s inner cover (dead front). Live bus bars are behind it.'],
        causes: [
          ['Tripped GFCI upstream', 'One GFCI can protect several outlets downstream, even in another room. Bathrooms, kitchens, garages and outdoors are the usual spots.'],
          ['Tripped breaker', 'An overload or short flipped it to the middle "tripped" position.'],
          ['Loose wire on a back-stab terminal', 'Common in older outlets where wires were pushed into holes instead of screwed.'],
          ['Worn-out receptacle', 'Contacts lose their grip and stop making connection.'],
        ],
        tools: ['Plug-in outlet tester ($10)', 'Flashlight', 'Lamp or phone charger to test with'],
        steps: [
          { t: 'Unplug everything on the dead outlet', d: 'Unplug whatever was on it when it died, especially heaters, hair dryers or space heaters.', why: 'If the load caused the trip, resetting with it plugged in will just trip again.', v: { cam: [1.4, 1.2, 1.8], at: [1.2, 1.0, 0], hi: ['outlet2'] } },
          { t: 'Find and press the GFCI reset', d: 'Look for a GFCI (TEST/RESET buttons) in the same room, bathroom, kitchen, garage or outside. Press RESET firmly until it clicks.', why: 'A GFCI cuts power when it detects as little as 5 milliamps leaking to ground, and it also kills every outlet wired after it.', v: { cam: [0.9, 1.15, 1.2], at: [0.6, 1.0, 0], hi: ['reset', 'test'], mv: { reset: [0, 0, -0.015] } } },
          { t: 'Open the panel door', d: 'If the GFCI didn’t help, open the breaker panel and scan for a handle sitting in the middle or pointing opposite the rest.', why: 'A tripped breaker doesn’t always flip fully off. It stops in a middle position that’s easy to miss.', v: { cam: [-0.1, 1.6, 2.6], at: [-0.8, 1.35, 0.2], hi: ['door'], rt: { door: [0, -110, 0] } } },
          { t: 'Reset the tripped breaker', d: 'Push the handle firmly to OFF first, then back to ON.', why: 'A breaker’s trip mechanism has to be re-latched. Going straight to ON from the middle does nothing.', v: { cam: [-0.6, 1.35, 1.3], at: [-0.75, 1.0, 0], hi: ['tripped'], mv: { tripHandle: [-0.03, 0, 0] } } },
          { t: 'Test the outlet', d: 'Plug in the outlet tester. Two yellow or green lights mean correct wiring. Any other pattern needs attention.', why: 'A tester also catches reversed hot/neutral or a missing ground, which a lamp won’t show.', v: { cam: [1.6, 1.3, 1.4], at: [1.4, 1.05, 0], hi: ['plugTester'], show: ['plugTester'], fx: 'power' } },
        ],
        learn: {
          how: 'Every circuit starts at a breaker in the panel. The breaker trips on too much current (overload) or a short. A GFCI is a second guard: it compares the current going out on the hot wire with the current coming back on the neutral. If they differ by a few milliamps, some current is going somewhere it shouldn’t (maybe through a person), so it cuts power in about 1/40th of a second.',
          specs: [['GFCI trip threshold', '4–6 mA'], ['GFCI trip time', '< 25 ms'], ['Typical outlet circuit', '15 A or 20 A'], ['US outlet voltage', '120 V']],
          terms: [['GFCI', 'Ground-Fault Circuit Interrupter. Protects people from shock.'], ['AFCI', 'Arc-Fault Circuit Interrupter. Protects against arcing fires in walls.'], ['Downstream / load side', 'Outlets wired after a GFCI that it also protects.'], ['Dead front', 'The inner panel cover. Leave it to electricians.']],
          mistakes: ['Holding a breaker on while it’s trying to trip.', 'Missing a GFCI in a different room (garage, bathroom) that feeds this outlet.', 'Replacing an outlet before checking the panel.'],
          tips: ['Press TEST on every GFCI monthly. If RESET won’t latch, the GFCI is at end of life.', 'Label your breakers with tape once you find which one is which.'],
        },
        pro: 'A breaker trips again immediately, you smell burning or see scorch marks, the outlet is warm, or more than one circuit is dead.',
      },
      {
        id: 'replace-outlet',
        title: 'Replace a worn outlet',
        model: 'outlet',
        level: 2,
        time: '30–45 min',
        cost: '$3–25',
        summary: 'Plugs that fall out or an outlet with cracks or scorching means the receptacle is worn. Swapping one is a straightforward, careful job.',
        intro: { hi: ['device'] },
        safety: [ELEC_SAFETY, 'Match the amp rating: 15 A outlets on 15 A circuits, 20 A outlets (T-shaped slot) where the breaker is 20 A.', 'Aluminum wiring (dull silver, 1960s–70s) needs special devices. Stop and call a pro.'],
        causes: [['Worn contacts', 'Springs inside lose tension after years of plugs.'], ['Cracked face', 'Unsafe; exposes live parts.'], ['Loose back-stab wire', 'Causes intermittent power and heat.']],
        tools: ['Non-contact voltage tester', 'Flat & Phillips screwdrivers', 'Wire stripper', 'Needle-nose pliers', 'New receptacle (15 A or 20 A, tamper-resistant)', 'Phone for a wiring photo'],
        steps: [
          { t: 'Kill power and verify', d: 'Switch off the breaker. Hold the tester near both slots. It should stay silent. Test it on a known live outlet to confirm the tester works.', why: 'A tester that fails silently reads "dead" on a live wire. The live-dead-live check proves it works.', v: { cam: [1.2, 1.5, 1.6], at: [0.2, 1.3, 0], hi: ['tester'], show: ['tester'], fx: 'live' } },
          { t: 'Remove the cover plate', d: 'Unscrew the center screw and lift the plate off.', why: 'Keep the screw in the plate so it doesn’t get lost.', v: { cam: [1.2, 1.5, 1.8], at: [0, 1.25, 0.2], hi: ['plate'], mv: { plate: [0, 0, 0.8] }, hide: ['tester'] } },
          { t: 'Pull the receptacle out', d: 'Remove the two mounting screws and pull the outlet straight out by its metal strap. Test the wires again.', why: 'Some boxes have two circuits. Testing the bare wires catches a second hot feed.', v: { cam: [1.6, 1.7, 1.6], at: [0, 1.25, 0.3], hi: ['device'], mv: { device: [0, 0, 0.55], plate: [0.9, -0.3, 0.8] } } },
          { t: 'Photo, then disconnect', d: 'Take a photo of which wire goes where. Loosen the screws and unhook the wires.', why: 'Black goes to brass (hot), white to silver (neutral), bare/green to the green screw (ground). The photo protects you if the box has extra wires.', v: { cam: [1.0, 1.6, 1.5], at: [0, 1.3, 0.3], hi: ['hotScrew', 'neutralScrew', 'groundScrew'] } },
          { t: 'Connect the new outlet', d: 'Bend a clockwise hook on each wire end and wrap it around the matching screw. Tighten firmly. Ground first, then neutral, then hot.', why: 'A clockwise hook gets pulled tighter as the screw turns. A counterclockwise hook pushes itself out.', tip: 'Skip the push-in back holes. Screw terminals or back-wire clamps hold far better.', v: { cam: [1.1, 1.6, 1.5], at: [0, 1.3, 0.3], hi: ['wires'], xray: true } },
          { t: 'Fold in and mount', d: 'Fold the wires back into the box accordion-style, push the outlet in, and tighten the mounting screws.', why: 'Folding keeps wires from pressing on terminal screws, which can loosen them over time.', v: { cam: [1.5, 1.6, 2.0], at: [0, 1.25, 0], hi: ['device'], mv: { device: [0, 0, 0] } } },
          { t: 'Plate on, power on, test', d: 'Install the cover plate, turn the breaker back on, and check with a plug-in tester.', why: 'The plug-in tester confirms polarity and ground, which a lamp can’t.', v: { cam: [1.5, 1.7, 2.2], at: [0, 1.25, 0], hi: ['plate'], mv: { plate: [0, 0, 0] } } },
        ],
        learn: {
          how: 'An outlet is a junction between your house wiring and a plug. The narrow slot is hot (brass side), the wide slot is neutral (silver side), and the round hole is ground. Inside, spring contacts grip the plug blades. Loose contacts create resistance, and resistance makes heat. That’s why a worn outlet is a fire concern and not just an annoyance.',
          specs: [['15 A circuit wire', '14 AWG'], ['20 A circuit wire', '12 AWG'], ['Strip length', '≈ ¾″ for hooks'], ['Terminal torque', '12–14 in-lb']],
          terms: [['Receptacle', 'The electrician’s word for an outlet.'], ['Back-stab', 'Push-in wire holes on the back. Quick but less reliable.'], ['Tamper-resistant (TR)', 'Shutters block objects pushed into one slot. Required in new work.'], ['Pigtail', 'Short wire that joins several wires to one terminal.']],
          mistakes: ['Trusting the breaker label without testing.', 'Swapping hot and neutral (black on silver).', 'Leaving copper exposed past the screw head.'],
          tips: ['If the box has two cables, the outlet may feed others downstream. Keep the same wire pairs together.'],
        },
        pro: 'You find aluminum wire, scorched or brittle insulation, no ground and you want a 3-prong outlet, or more wires than you can identify.',
      },
      {
        id: 'replace-switch',
        title: 'Replace a light switch',
        model: 'switch',
        level: 2,
        time: '20–30 min',
        cost: '$3–20',
        summary: 'A switch that crackles, feels mushy, or works only sometimes is worn. A single-pole switch has just two hot wires and a ground.',
        intro: { hi: ['device'] },
        safety: [ELEC_SAFETY, 'If there are three or more insulated wires on the switch (not counting ground), it is a 3-way switch. Label them before removing anything.'],
        causes: [['Worn contacts', 'Arcing inside wears the contacts down.'], ['Loose wire', 'Causes flicker and buzzing.'], ['Dimmer overload', 'Too many bulbs or the wrong bulb type for the dimmer.']],
        tools: ['Non-contact voltage tester', 'Screwdrivers', 'New single-pole switch', 'Needle-nose pliers', 'Masking tape for labels'],
        steps: [
          { t: 'Kill power and verify', d: 'Breaker off, then test near the switch with the voltage tester.', why: 'Light switches often share circuits with outlets in other rooms.', v: { cam: [1.2, 1.5, 1.6], at: [0.2, 1.3, 0], hi: ['tester'], show: ['tester'], fx: 'live' } },
          { t: 'Remove plate and switch', d: 'Unscrew the plate, then the two mounting screws, and pull the switch out.', why: 'Hold it by the strap, not the toggle.', v: { cam: [1.5, 1.7, 1.6], at: [0, 1.25, 0.3], hi: ['device', 'plate'], mv: { plate: [0.9, -0.3, 0.8], device: [0, 0, 0.55] }, hide: ['tester'] } },
          { t: 'Identify the terminals', d: 'A single-pole switch has two brass screws and a green ground. The two black wires can go on either brass screw.', why: 'The switch just breaks the hot path to the light. Polarity doesn’t matter on a single-pole.', v: { cam: [1.0, 1.5, 1.4], at: [0.1, 1.25, 0.4], hi: ['screwA', 'screwB', 'groundScrew'] } },
          { t: 'Move wires to the new switch', d: 'One wire at a time: unhook from the old switch, hook clockwise on the new one, tighten.', why: 'One-at-a-time means you never have to guess.', v: { cam: [1.0, 1.5, 1.4], at: [0.1, 1.25, 0.4], hi: ['wires'], xray: true } },
          { t: 'Mount with OFF at the bottom', d: 'Fold wires in and mount so the toggle reads OFF when down. Attach the plate.', why: 'Most switches are printed with ON/OFF. Mounting upside-down just looks wrong to everyone.', v: { cam: [1.5, 1.7, 2.2], at: [0, 1.25, 0], hi: ['toggle'], mv: { device: [0, 0, 0], plate: [0, 0, 0] } } },
        ],
        learn: {
          how: 'A switch is a gap in the hot wire. Flip it on and a metal contact bridges the gap so current flows to the light. The neutral wires usually bypass the switch entirely and are capped together in the back of the box. A 3-way switch has a third "common" terminal so two switches can control one light.',
          specs: [['Standard switch rating', '15 A, 120 V'], ['Mounting screw size', '#6-32']],
          terms: [['Single-pole', 'One switch controls a light.'], ['3-way', 'Two switches control one light. Has a darker "common" screw.'], ['Line / load', 'Line brings power in; load carries it to the fixture.']],
          mistakes: ['Putting a non-LED-rated dimmer on LED bulbs (causes flicker and buzz).', 'Disconnecting all wires at once on a 3-way.'],
          tips: ['Smart switches usually need a neutral wire. Check for a white bundle in the box before buying one.'],
        },
        pro: 'There is no ground, the box is metal with cloth-insulated wire, or you are converting to a smart switch and there is no neutral.',
      },
    ],
  });
})();
