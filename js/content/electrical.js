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

  const ELEC_SAFETY = 'Turn off the breaker (the switch in your electrical panel), then prove the wires are dead with a voltage tester you have just checked on a working outlet. Test, then re-check the tester on the working outlet again (pros call this live-dead-live).';
  const NCV_NOTE = 'A non-contact tester (the pen that beeps near live wires) can miss a live wire if its battery is weak, if you’re on a fiberglass ladder, or if the cable is damp. When the wires are bare, confirm with a two-lead tester or multimeter touching the metal.';

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
        summary: 'Before you replace anything, look for three things: a wall switch that controls the outlet, a tripped GFCI (an outlet with TEST and RESET buttons) somewhere upstream, and a tripped breaker in the panel. One of these is the cause most of the time, and none of them needs tools.',
        intro: { hi: ['gfci', 'tripped'] },
        safety: [
          'You don’t open anything in this guide. If the fix isn’t a switch, a reset button or a breaker, stop and use the replace-outlet guide or call an electrician.',
          'Stand on a dry floor, keep your other hand off the metal panel box, and push breaker handles with your fingertips, not your whole palm.',
          'If a breaker or GFCI trips again the moment you reset it, leave it off. Something on that circuit has a fault, and forcing it on can start a fire.',
          'Never remove the panel’s inner cover (the dead front, the metal sheet the breakers poke through). The main bus bars behind it stay live even with the main breaker off.',
          'A warm or buzzing outlet, a burning smell, or brown scorch marks around the slots means stop and call a pro.',
        ],
        causes: [
          ['Half-switched outlet', 'Many living rooms and bedrooms have an outlet where one or both halves are turned on by a wall switch. Flip every nearby switch before you assume it’s dead.'],
          ['Tripped GFCI upstream', 'One GFCI can protect several outlets wired after it, even in another room. Look in bathrooms, the kitchen, garage, basement, laundry and outside walls.'],
          ['Tripped breaker', 'An overload (too many watts on one circuit) or a short pushes the handle to a middle position. AFCI and GFCI breakers (ones with a TEST button) also trip on arcing or leaks to ground.'],
          ['Loose wire in the chain', 'Outlets are wired in a chain. A loose push-in (back-stab) connection in one outlet can kill every outlet after it, so the dead one may not be the bad one.'],
          ['Worn-out receptacle', 'The spring contacts inside lose their grip after years of use, so plugs fall out or flicker.'],
        ],
        tools: ['Plug-in outlet tester with 3 lights and a GFCI test button ($10–15)', 'Flashlight or headlamp', 'Small lamp or phone charger you know works', 'Pen and masking tape for breaker labels'],
        steps: [
          { t: 'Unplug the load and try the switches', d: 'Unplug everything from the dead outlet, especially heaters, hair dryers, vacuums or anything that was running when it died. Then flip every wall switch in the room and plug in a lamp you know works after each flip.', why: 'If a heavy load caused the trip, resetting with it still plugged in just trips it again. And a switched outlet looks dead whenever its switch is off.', tip: 'If only the top or bottom half works, that outlet is “half-hot” on purpose: a wall switch runs one half. Plug lamps into the switched half and you’re done.', ok: 'The lamp is unplugged from the dead outlet, every nearby switch has been tried, and the outlet still shows no power.', v: { cam: [1.4, 1.2, 1.8], at: [1.2, 1.0, 0], hi: ['outlet2'] } },
          { t: 'Find and reset the GFCI', d: 'Look for a GFCI (an outlet with TEST and RESET buttons) in nearby bathrooms, the kitchen, garage, basement, laundry and outside. Press RESET firmly with your thumb until you feel and hear a solid click. Check every one you find, even in another room.', why: 'A GFCI shuts off when about 5 milliamps (a tiny amount) leaks to ground, and it also cuts power to every outlet wired after it, which can be in another room.', tip: 'If RESET won’t stay in, the GFCI either has no power (check the breaker next) or still sees a fault. If it still won’t latch with power on and nothing plugged in, the GFCI is worn out and needs replacing.', ok: 'The RESET button stays pushed in, a green light (if it has one) is on, and the lamp lights in the dead outlet.', v: { cam: [0.9, 1.15, 1.2], at: [0.6, 1.0, 0], hi: ['reset', 'test'], mv: { reset: [0, 0, -0.015] } } },
          { t: 'Open the panel and find the tripped breaker', d: 'Open the breaker panel door (only the outer door). Shine a light down both rows. A tripped breaker sits in the middle, points the opposite way from its neighbors, or shows a red or orange flag in a small window.', why: 'A tripped breaker doesn’t snap all the way to OFF. It stops in a middle position that is easy to miss in a dim basement.', tip: 'Run a fingertip lightly across the handles: the tripped one feels softer and floppier than the rest. Also look for breakers with a TEST button; those are AFCI or GFCI breakers and may have tripped too.', ok: 'You’ve found one handle out of line with the rest, or confirmed every handle sits firmly at ON.', v: { cam: [-0.1, 1.6, 2.6], at: [-0.8, 1.35, 0.2], hi: ['door'], rt: { door: [0, -110, 0] } } },
          { t: 'Reset the breaker: OFF, then ON', d: 'Stand to the side of the panel, not in front of it. Push the tripped handle firmly all the way to OFF until it clicks, then all the way to ON. Do it once. If it snaps back off right away, leave it off.', why: 'A breaker’s trip latch has to be re-cocked by going fully to OFF first. Pushing from the middle straight to ON does nothing.', tip: 'If it trips the instant you turn it on with nothing plugged in, there’s a short in the wiring or an outlet. Label it “tripping, do not reset” with tape and call an electrician. Write which outlets came back on the panel label while you’re there.', ok: 'You felt a firm click at OFF and another at ON, and the handle now lines up with its neighbors and stays there.', v: { cam: [-0.6, 1.35, 1.3], at: [-0.75, 1.0, 0], hi: ['tripped'], mv: { tripHandle: [-0.03, 0, 0] } } },
          { t: 'Test the outlet with a plug-in tester', d: 'Plug the outlet tester into both halves of the outlet and compare its lights with the chart printed on it. Two lights on the correct side mean correct wiring. If it’s a GFCI-protected outlet, press the tester’s GFCI button: power should cut off, and RESET brings it back.', why: 'A lamp only tells you there is power. The tester also catches a missing ground or swapped hot and neutral wires, which are both shock hazards.', tip: 'If the outlet is still dead after a GFCI and breaker check, the problem is a loose wire inside a box. Check whether other outlets on the same wall also died: the bad connection is usually in the last working outlet before the dead ones.', ok: 'The tester shows the “correct” light pattern on both halves, and a lamp plugged in stays lit when you wiggle the plug gently.', v: { cam: [1.6, 1.3, 1.4], at: [1.4, 1.05, 0], hi: ['plugTester'], show: ['plugTester'], fx: 'power' } },
        ],
        tricks: [
          ['Map your panel once', 'With a helper and a phone call, flip each breaker off and note which lights and outlets die. Write it on the panel label in pencil. The next outage takes 30 seconds.'],
          ['Hunt the GFCI with a radio', 'Plug a loud radio into the dead outlet and turn it up. Walk the house pressing RESET on every GFCI; you’ll hear the moment the right one fixes it.'],
          ['Space heaters are the usual culprit', 'A 1,500 W heater draws 12.5 A, most of a 15 A circuit. Add a hair dryer or a vacuum and the breaker trips. Move the heater to its own circuit instead of resetting again and again.'],
          ['Read the tester honestly', 'A cheap 3-light tester can’t spot every wiring trick (like a “bootleg” ground jumped to neutral) and it can’t see a loose connection. If an outlet tests “correct” but still cuts out, the wire behind it is loose.'],
          ['Test GFCIs monthly', 'Press TEST, hear the click, confirm power is off, then press RESET. Newer GFCIs also self-test and flash red or refuse to reset when they fail.'],
          ['When a whole room dies', 'If several outlets and lights died together and no breaker looks tripped, switch the room’s likely breaker fully OFF and back ON anyway. Some breakers trip without moving far.'],
        ],
        refs: [
          ['Code Basics: NEC requirements for GFCIs and AFCIs (EC&M)', 'https://www.ecmweb.com/national-electrical-code/code-basics/article/21280067/nec-requirements-for-gfcis-and-afcis'],
          ['QO breaker tripped: how to reset (Schneider Electric / Square D FAQ)', 'https://www.se.com/us/en/faqs/FA298536'],
          ['NEC 210.8 GFCI protection, 2023 changes (Mike Holt)', 'https://www.mikeholt.com/files/PDF/23UNEC1_210.8.pdf'],
          ['NEC requirements for GFCI protection, Section 210.8 (IAEI Magazine)', 'https://iaeimagazine.org/electrical-fundamentals/nec-requirements-for-gfci-protection-section-210-8'],
        ],
        learn: {
          how: 'Every circuit starts at a breaker in the panel. The breaker is a heat- and magnet-operated switch: too much current for too long (an overload), or a sudden huge current (a short), trips it. A GFCI is a second guard for people. It measures the current going out on the hot wire and coming back on the neutral. If they differ by about 5 milliamps, some current is leaking somewhere it shouldn’t, maybe through a person, so it cuts power in a fraction of a second. An AFCI breaker listens for the crackling signature of an arcing loose wire and trips to prevent fires.',
          specs: [['GFCI trip threshold (people protection)', '4–6 mA (UL 943 Class A)'], ['GFCI trip time at higher leakage', 'about 1/40 s (25 ms)'], ['Typical outlet circuit', '15 A on 14 AWG wire, or 20 A on 12 AWG'], ['US outlet voltage', '120 V (114–126 V is normal)'], ['Max continuous load guideline', '80% of breaker: 12 A on 15 A, 16 A on 20 A'], ['GFCI required (2023 NEC, homes)', 'Bathrooms, kitchens, garages, outdoors, basements, crawl spaces, laundry, within 6′ of sinks, tubs and showers']],
          terms: [['GFCI', 'Ground-fault circuit interrupter: the outlet or breaker with TEST and RESET that protects people from shock.'], ['AFCI', 'Arc-fault circuit interrupter: a breaker (or outlet) that trips on sparking connections to prevent fires.'], ['Downstream / load side', 'Outlets wired after a GFCI. It protects them and turns them off when it trips.'], ['Overload', 'More current than the wire is rated for, for long enough to heat it.'], ['Short circuit', 'Hot touching neutral or ground directly: huge current, instant trip.'], ['Dead front', 'The inner panel cover. Only electricians remove it.']],
          mistakes: ['Holding a breaker handle ON while it’s trying to trip.', 'Missing a GFCI in another room (garage, bathroom, outdoors) that feeds this outlet.', 'Replacing a perfectly good outlet when the real fault is a loose wire in the one before it.', 'Resetting a breaker over and over instead of finding the overload.'],
          tips: ['Press TEST on every GFCI monthly. If RESET won’t latch with power on, replace that GFCI.', 'Label your breakers with tape as you discover which one is which.', 'Keep a flashlight near the panel so you aren’t searching in the dark.'],
        },
        pro: 'Call a licensed electrician if a breaker or GFCI trips again immediately, you smell burning or see scorch marks, an outlet or plate feels warm, several circuits are dead at once, lights dim or brighten oddly (a possible loose neutral), or the outlet is still dead after the switch, GFCI and breaker checks.',
      },
      {
        id: 'replace-outlet',
        title: 'Replace a worn outlet',
        model: 'outlet',
        level: 2,
        time: '30–45 min',
        cost: '$3–25',
        summary: 'Plugs that fall out, an outlet with cracks, or brown scorch marks mean the receptacle is worn. Swapping one is three wire connections done carefully, with the power proven off first.',
        intro: { hi: ['device'] },
        safety: [
          ELEC_SAFETY,
          NCV_NOTE,
          'Match the amp rating: a 15 A outlet on a 15 A breaker; a 20 A outlet (one slot shaped like a sideways T) is needed only where a single outlet is on a 20 A circuit, though 15 A duplex outlets are allowed on 20 A circuits.',
          'Aluminum wiring (dull silver wire, common in 1965–1973 homes) needs special connectors (AlumiConn or COPALUM). Do not hook it to an ordinary outlet. Stop and call a pro.',
          'Replacements must meet today’s rules: tamper-resistant (TR) in homes, GFCI where the location now requires it (kitchen, bath, garage, basement, outdoors, laundry, near sinks), and arc-fault protection in most living areas. Check with your local building department.',
        ],
        causes: [['Worn contacts', 'The springs inside lose tension after years of plugs, so plugs sag or fall out. Loose contacts heat up.'], ['Cracked or broken face', 'Exposes live metal. Replace it now.'], ['Loose push-in (back-stab) wire', 'Push-in holes grip only a sliver of wire. Over time they loosen, causing flicker, heat and dead outlets downstream.'], ['Scorch marks', 'A sign of overheating from a loose connection or a heavy load. Inspect the wires behind it before replacing.']],
        tools: ['Non-contact voltage tester', 'Two-lead voltage tester or multimeter', 'Plug-in outlet tester', '#2 Phillips and ¼″ flat screwdrivers (insulated ideal)', 'Wire stripper with gauge marks', 'Needle-nose pliers', 'New receptacle: tamper-resistant (TR), 15 A or 20 A to match, “weather-resistant” (WR) outdoors', 'Phone for a wiring photo', 'Masking tape and marker'],
        steps: [
          { t: 'Shut off and prove the power is dead', d: 'Plug a lamp into the outlet, then switch breakers off until it goes dark. Test your non-contact tester on a working outlet: it should beep. Now hold it at both slots of the dead outlet: silent. Then touch it to the working outlet again to prove it still works.', why: 'A tester with a dead battery reads “safe” on a live wire. Checking it on a known live outlet before and after the test (live-dead-live) proves the silence is real.', tip: 'Tape the breaker handle in the OFF position and stick a note on the panel door saying “Working on circuit, do not turn on.” It stops a helpful family member from restoring power on you.', ok: 'The tester beeps on the working outlet, stays silent at both slots of yours, and beeps again on the working outlet.', v: { cam: [1.2, 1.5, 1.6], at: [0.2, 1.3, 0], hi: ['tester'], show: ['tester'], fx: 'live' } },
          { t: 'Remove the cover plate', d: 'Unscrew the center screw counterclockwise with a flat screwdriver and lift the plate off. If paint has glued the plate to the wall, score around its edge with a utility knife first so you don’t peel paint.', why: 'The plate is the only thing between you and the terminals, so it comes off once power is proven off. Scoring stops paint from tearing off in sheets.', tip: 'Thread the screw back into the plate’s hole and set the plate aside face down so the screw can’t roll away.', ok: 'The plate is off, the wall paint around it is intact, and you can see the outlet’s metal strap and two mounting screws.', v: { cam: [1.2, 1.5, 1.8], at: [0, 1.25, 0.2], hi: ['plate'], mv: { plate: [0, 0, 0.8] }, hide: ['tester'] } },
          { t: 'Pull the outlet out and test every wire', d: 'Remove the two long screws at the top and bottom of the outlet and pull it straight out by its metal strap, about 3″. Hold the non-contact tester against each wire and the side screws, then touch a two-lead tester’s probes to each brass screw and its silver screw, and to the bare ground. Expect 0 V.', why: 'Some boxes have power coming from two different breakers. Testing the bare metal catches a second live feed the slot test missed.', tip: 'If the outlet won’t pull out, the wires are stiff, not stuck. Rock it gently by the strap; never yank on a wire. On a multimeter, a reading of a few volts that won’t settle is harmless “ghost” voltage; 120 V is live.', ok: 'Every wire and terminal reads 0 V (or a few ghost volts at most) and the non-contact tester stays silent everywhere in the box.', v: { cam: [1.6, 1.7, 1.6], at: [0, 1.25, 0.3], hi: ['device'], mv: { device: [0, 0, 0.55], plate: [0.9, -0.3, 0.8] } } },
          { t: 'Photograph, label, and disconnect', d: 'Take a clear photo of every wire. Black (hot) goes to the brass screws, white (neutral) to the silver screws, bare or green (ground) to the green screw. If there are two cables, wrap tape on one pair and mark it “A.” Loosen the screws and unhook the wires. For push-in wires, push a small flat screwdriver into the release slot, or cut the wire right at the outlet.', why: 'The photo and labels let you rebuild exactly what was there, especially when a second cable feeds outlets further down the line.', tip: 'Look at the bare copper ends. If they’re blackened, nicked or the insulation is brittle and cracks when bent, snip off ½″ and strip fresh copper. If the insulation crumbles further back, stop and call a pro.', ok: 'Your photo shows every wire and its screw, both cables are labeled, and each wire end is clean, shiny copper.', v: { cam: [1.0, 1.6, 1.5], at: [0, 1.3, 0.3], hi: ['hotScrew', 'neutralScrew', 'groundScrew'] } },
          { t: 'Connect the new outlet', d: 'Strip ¾″ of insulation and bend a hook with needle-nose pliers. Hook each wire clockwise ⅔–¾ of the way around its screw: ground to green, white to silver, black to brass. Tighten until snug, then a firm extra quarter turn (14–18 in-lb on most outlets). Or use the back-wire clamps: strip to the gauge on the back (usually ⅝″), insert straight, tighten.', why: 'A clockwise hook is pulled tighter as the screw turns; a counterclockwise one pushes itself out. Loose terminals heat up and are a leading cause of outlet fires.', tip: 'Skip the push-in back holes. Screw terminals or the screw-clamp back-wire holes grip far better. If a screw spins but won’t tighten, it’s stripped: use a different new outlet rather than forcing it.', ok: 'Each wire is under its own screw, insulation stops just short of the screw head, no bare copper sticks out past it, and a firm tug doesn’t move any wire.', v: { cam: [1.1, 1.6, 1.5], at: [0, 1.3, 0.3], hi: ['wires'], xray: true } },
          { t: 'Fold the wires in and mount', d: 'Fold the wires back into the box in a gentle S (accordion) shape, ground first, then push the outlet in straight. Tighten the two mounting screws until the strap sits flat against the box, with the round ground hole down (or up, if your local custom says so; just be consistent).', why: 'Neat folds keep wires from pushing against terminal screws and loosening them. A flat, tight strap keeps the outlet from wobbling every time you plug in.', tip: 'If the outlet sits too deep behind tile or paneling, slip plastic outlet spacers (a $3 strip of little washers) behind the strap ears so it sits flush with the wall.', ok: 'The outlet sits flush and level with the wall, doesn’t rock when you push on it, and no wire is pinched behind the strap.', v: { cam: [1.5, 1.6, 2.0], at: [0, 1.25, 0], hi: ['device'], mv: { device: [0, 0, 0] } } },
          { t: 'Plate on, power on, test', d: 'Screw on the cover plate until snug (don’t overtighten or it cracks). Turn the breaker back on. Plug the outlet tester into the top and bottom halves and read its lights against the chart.', why: 'The plug-in tester confirms the hot and neutral aren’t swapped and the ground is connected, which a lamp can’t tell you.', tip: 'If the tester shows “hot/neutral reversed,” turn the breaker off, verify dead, and swap the white and black wires on the outlet. If it shows “open ground,” the ground wire is loose or missing.', ok: 'Both halves show the “correct” pattern on the tester and a plug goes in with a firm, snug grip.', v: { cam: [1.5, 1.7, 2.2], at: [0, 1.25, 0], hi: ['plate'], mv: { plate: [0, 0, 0] } } },
        ],
        tricks: [
          ['Buy specification or “commercial” grade', 'A $3–5 better-grade outlet has heavier contacts and screw-clamp back-wiring. It holds plugs for decades and is easier to wire well.'],
          ['Pre-bend all the hooks first', 'Strip and hook all three wires before you bring the outlet near the box. Then wiring is just placing hooks and turning screws.'],
          ['Use the strip gauge', 'The back of every outlet has a molded strip gauge. Hold the wire against it and strip exactly that length so no bare copper shows.'],
          ['Two-prong outlet, no ground wire?', 'Don’t install a 3-prong outlet on an ungrounded box. Code allows a GFCI outlet instead, labeled “No equipment ground,” or a new two-prong outlet. Better still, have a ground run.'],
          ['Do the whole room at once', 'Once the breaker is off and you have the rhythm, swapping every outlet on that circuit takes about 10 minutes each and gives matching colors.'],
          ['Dead outlets downstream after the swap?', 'If outlets after this one stopped working, you probably left a wire from the second cable loose or put both pairs on one side. Check your photo and use both screws on each side.'],
          ['Use a screwdriver, not a drill', 'Drills strip outlet screws and crack the plastic. A hand screwdriver gives you feel for the snug point.'],
        ],
        refs: [
          ['Outlet installation with a master electrician, Heath Eastman (This Old House)', 'https://www.thisoldhouse.com/electrical/outlet-installation-with-a-master-electrician'],
          ['Leviton 5320 duplex receptacle spec, terminal torque 14–18 in-lb (Leviton)', 'https://leviton.com/products/5320-wcp'],
          ['Significant changes to the 2023 NEC by CMP-18: replacement receptacles 406.4(D) (IAEI Magazine)', 'https://iaeimagazine.org/standards/significant-changes-to-the-2023-nec-by-cmp-18/'],
          ['Q&A: Push-in connections on receptacles (Journal of Light Construction)', 'https://www.jlconline.com/how-to/electrical/q-a-push-in-connections-on-receptacles_o'],
          ['Repairing aluminum wiring, Publication 516 (US CPSC)', 'https://www.cpsc.gov/s3fs-public/516.pdf'],
          ['NEC requirements for receptacles (EC&M)', 'https://www.ecmweb.com/national-electrical-code/code-basics/article/21267043/nec-requirements-for-receptacles'],
        ],
        learn: {
          how: 'An outlet is a junction between your house wiring and a plug. The short slot is hot (brass screw side), the tall slot is neutral (silver side), and the round hole is ground (green screw). Inside, spring contacts grip the plug blades. When those contacts or a terminal screw get loose, resistance rises, and resistance turns current into heat. That’s why a worn outlet is a fire concern, not just an annoyance.',
          specs: [['15 A circuit wire', '14 AWG copper'], ['20 A circuit wire', '12 AWG copper'], ['Strip length, screw hook', 'about ¾″'], ['Strip length, back-wire clamp', 'use the device gauge (Leviton: ⅝″)'], ['Terminal torque', '14–18 in-lb typical (check the device sheet)'], ['Push-in (back-stab) holes', '15 A circuits and 14 AWG solid copper only'], ['Box fill', '2.0 cu in per 14 AWG wire, 2.25 per 12 AWG; the outlet counts as 2 wires']],
          terms: [['Receptacle', 'The electrician’s word for an outlet.'], ['Back-stab', 'Push-in wire holes on the back. Quick but the weakest connection.'], ['Back-wire clamp', 'Holes on the back with a screw-tightened clamp. As good as the side screws.'], ['Tamper-resistant (TR)', 'Shutters inside block a key or hairpin pushed into one slot. Required in homes.'], ['Pigtail', 'A short wire that joins several wires to one terminal with a wire connector.'], ['Strap (yoke)', 'The metal frame that screws the outlet to the box.']],
          mistakes: ['Trusting the breaker label without testing.', 'Putting black on a silver screw (reverses polarity, so lamp shells can be live).', 'Leaving bare copper exposed past the screw head.', 'Hooking wires counterclockwise.', 'Putting two wires under one screw (most screws take only one).'],
          tips: ['If the box has two cables, the outlet feeds others downstream. Keep each pair on its own set of screws, or pigtail them.', 'Use a GFCI outlet for kitchens, baths, garages, basements, laundry areas and outdoors.'],
        },
        pro: 'Call an electrician if you find aluminum wire, cloth or crumbling insulation, scorched wires, no ground and you want a 3-prong outlet, more wires than you can identify, or a box so full the outlet won’t fit.',
      },
      {
        id: 'replace-switch',
        title: 'Replace a light switch',
        model: 'switch',
        level: 2,
        time: '20–30 min',
        cost: '$3–20',
        summary: 'A switch that crackles, feels mushy, or works only sometimes is worn out. A standard single-pole switch has just two screws for wires plus a green ground screw, so it’s a calm 20-minute job once the power is proven off.',
        intro: { hi: ['device'] },
        safety: [
          ELEC_SAFETY,
          NCV_NOTE,
          'Switch boxes often hold wires from more than one circuit. Test every wire in the box, including the capped bundles in the back.',
          'If there are three insulated wires on the switch (not counting the bare ground), it’s a 3-way switch. Use the 3-way variant and label wires before removing anything.',
          'A white wire on a switch is being used as a hot wire. It should be marked with black tape; treat it as live.',
        ],
        causes: [['Worn contacts', 'Every flip makes a tiny spark that wears the contacts down. Crackling or a mushy toggle is the sign.'], ['Loose wire', 'A loose terminal causes flicker, buzzing and heat at the switch.'], ['Dimmer overload', 'Too many bulbs, or LED bulbs on an old dimmer that was made for incandescent bulbs.'], ['Push-in (back-stab) connection', 'Wires pushed into holes on the back loosen over time.']],
        tools: ['Non-contact voltage tester', 'Two-lead voltage tester or multimeter', '#2 Phillips and ¼″ flat screwdrivers', 'New single-pole switch, 15 A (or 20 A if the circuit is 20 A)', 'Needle-nose pliers', 'Wire stripper', 'Masking tape and marker', 'Black electrical tape'],
        steps: [
          { t: 'Shut off and prove the power is dead', d: 'Turn the light on, then switch breakers off until it goes out. Check your non-contact tester on a working outlet, then hold it at the switch plate and the screws once the plate is off. Re-check the tester on the working outlet afterward.', why: 'Switch boxes often share a circuit, or hold a second circuit, from another room. The live-dead-live check proves your tester didn’t just fail silently.', tip: 'A burned-out bulb tells you nothing, so if the light never lit, use the tester instead of the bulb to find the right breaker. Tape the breaker off and leave a note on the panel.', ok: 'The tester beeps on the working outlet, stays silent at every wire and screw in the switch box, then beeps again on the outlet.', v: { cam: [1.2, 1.5, 1.6], at: [0.2, 1.3, 0], hi: ['tester'], show: ['tester'], fx: 'live' } },
          { t: 'Remove the plate and pull the switch', d: 'Unscrew the two plate screws, then the two long mounting screws at the top and bottom of the switch. Pull the switch straight out about 3″ by its metal strap. Test every wire in the box again, including any capped bundles in the back.', why: 'Pulling by the strap protects the wire connections. Testing again catches a second live circuit sharing the box.', tip: 'Score painted-over plate edges with a utility knife first. If the box is crowded, gently tilt the switch sideways to give your fingers room rather than pulling hard.', ok: 'The switch hangs in front of the box on its wires and every wire tests dead.', v: { cam: [1.5, 1.7, 1.6], at: [0, 1.25, 0.3], hi: ['device', 'plate'], mv: { plate: [0.9, -0.3, 0.8], device: [0, 0, 0.55] }, hide: ['tester'] } },
          { t: 'Identify the terminals', d: 'A single-pole switch has two brass screws and a green ground screw. The two insulated wires (usually both black, or black and a taped white) go on the brass screws, either one on either screw. The bare copper goes to green. Snap a photo before you unhook anything.', why: 'The switch just opens and closes the hot wire on its way to the light, so the two brass screws are interchangeable.', tip: 'Count again: if you find a dark-colored third screw, it’s a 3-way switch and order matters. If a white wire is on the switch with no black tape, wrap a band of black tape on it now so the next person knows it’s hot.', ok: 'You’ve confirmed two brass screws plus green, and your photo shows which wire was where.', v: { cam: [1.0, 1.5, 1.4], at: [0.1, 1.25, 0.4], hi: ['screwA', 'screwB', 'groundScrew'] } },
          { t: 'Move wires to the new switch', d: 'Work one wire at a time: unhook it from the old switch, check the copper is clean (snip and re-strip ¾″ if nicked), hook it clockwise around the matching screw on the new switch and tighten firmly. Do the ground to the green screw too.', why: 'Moving one wire at a time means you never have to guess where anything goes.', tip: 'If the old wires were pushed into back holes, release them with a small flat screwdriver in the slot, or snip them off and strip fresh ends. Use the screws on the new switch, not the push-in holes.', ok: 'Each wire wraps ⅔ around its screw clockwise, the screw head clamps the copper flat, and a firm tug doesn’t move it.', v: { cam: [1.0, 1.5, 1.4], at: [0.1, 1.25, 0.4], hi: ['wires'], xray: true } },
          { t: 'Mount with ON up, then test', d: 'Fold the wires in, push the switch in so ON reads when the toggle is up, and tighten the mounting screws until the strap sits flat. Attach the plate. Restore the breaker and flip the switch several times.', why: 'Electrical code requires single-pole switches mounted vertically to be ON in the up position. It’s also what everyone expects in the dark.', tip: 'If the plate won’t sit flat, the switch is crooked: loosen the mounting screws, square it up using the slotted holes, and retighten. If the light doesn’t work, check that the bulb is good before you open the box again.', ok: 'The toggle reads ON when up, the light turns on and off crisply every time, and the plate sits flat without cracking.', v: { cam: [1.5, 1.7, 2.2], at: [0, 1.25, 0], hi: ['toggle'], mv: { device: [0, 0, 0], plate: [0, 0, 0] } } },
        ],
        tricks: [
          ['Look for a neutral before buying smart', 'Smart switches, timers and occupancy sensors usually need a neutral (a bundle of white wires capped in the back of the box). Check while the switch is out before you buy one.'],
          ['Buy the same type you have', 'Toggle or rocker (Decora), 15 A or 20 A, single-pole or 3-way. Take a photo of the old switch’s side markings to the store.'],
          ['Stripped mounting screw hole?', 'If the box’s screw hole won’t grab, use a slightly longer #6-32 screw, or for plastic boxes, a repair clip. Don’t use a wood screw.'],
          ['Mark the hot white wire', 'Older “switch loops” use a white wire as a hot. Wrap black tape around it at both ends so nobody mistakes it for a neutral later.'],
          ['Quiet, better switches', 'Commercial-grade switches cost $3–6 more and last far longer than 69-cent builder-grade ones. A worn switch that crackles is arcing inside.'],
          ['Use rocker-style plates for clean lines', 'If you swap toggles for rockers, you’ll need new “Decora” cover plates. Screwless plates snap on and hide the screws.'],
        ],
        refs: [
          ['NEC requirements for switches (EC&M)', 'https://ecmweb.com/national-electrical-code/code-basics/article/21265031/nec-requirements-for-switches'],
          ['The apprentice’s guide to Article 404 (EC&M)', 'https://www.ecmweb.com/national-electrical-code/article/55125351/the-apprentices-guide-to-article-404'],
          ['How to replace a three-way switch (This Old House)', 'https://www.thisoldhouse.com/electrical/how-to-replace-a-three-way-switch'],
          ['Should we use non-contact voltage testers? (Electrical Contractor Magazine)', 'https://www.ecmag.com/magazine/articles/article-detail/should-we-use-noncontact-voltage-testers-the-benefits-and-drawbacks-of-these-handy-tools'],
        ],
        learn: {
          how: 'A switch is a gap in the hot wire. Flip it on and a spring-loaded metal contact bridges the gap, so current flows to the light. The neutral wires usually bypass the switch entirely and are capped together in the back of the box. A 3-way switch has a third “common” terminal so two switches can control one light.',
          specs: [['Standard switch rating', '15 A, 120–277 V'], ['Wire', '14 AWG on 15 A circuits, 12 AWG on 20 A'], ['Mounting screws', '#6-32'], ['Strip length for screw hook', 'about ¾″ (use the gauge on the switch)'], ['Neutral at switch boxes', 'Required in most new work since the 2011 NEC (404.2(C))']],
          terms: [['Single-pole', 'One switch controls a light. Has ON/OFF printed on the toggle.'], ['3-way', 'Two switches control one light. Has a dark “common” screw and no ON/OFF marks.'], ['Line / load', 'Line brings power in from the panel; load carries it to the fixture.'], ['Switch loop', 'A two-wire cable from the light to the switch, where the white wire is used as a hot.']],
          mistakes: ['Putting an old incandescent-only dimmer on LED bulbs (causes flicker and buzz).', 'Disconnecting all wires at once on a 3-way.', 'Mounting upside down so OFF is up.', 'Forgetting to connect the ground to the new switch.'],
          tips: ['Smart switches usually need a neutral wire. Check for a white bundle in the box before buying one.', 'Hold the switch by its strap while wiring so you don’t bend the ears.'],
        },
        pro: 'Call a pro if there’s no ground and a metal box with cloth-insulated wire, aluminum wiring, four or more wires on the switch you can’t identify, or you want a smart switch and there’s no neutral in the box.',
      },
    ],
  });
})();
