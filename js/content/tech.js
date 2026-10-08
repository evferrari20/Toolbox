/* TEC · Computers & network */
(function () {
  /* ---- Model: desktop PC tower with removable side panel ---- */
  TB.model('pc', { cam: [2.2, 1.6, 2.4], at: [0, 0.6, 0], hidden: ['air'] }, (K) => {
    K.box(null, [3, 0.04, 2], 'woodLight', [0, -0.02, 0]);
    const cs = K.part('case', [0, 0, 0], null, 'Case');
    K.box(cs, [0.04, 1.1, 1.1], 'dark', [-0.3, 0.55, 0]);
    K.box(cs, [0.64, 0.04, 1.1], 'dark', [0, 1.1, 0]);
    K.box(cs, [0.64, 0.04, 1.1], 'dark', [0, 0.02, 0]);
    K.box(cs, [0.64, 1.1, 0.04], 'dark', [0, 0.55, -0.55]);
    K.box(cs, [0.64, 1.1, 0.04], 'black', [0, 0.55, 0.55]);
    const pbtn = K.part('powerBtn', [0.15, 1.0, 0.58], null, 'Power button');
    K.cyl(pbtn, [0.03, 0.03, 0.02], 'ledB', [0, 0, 0], [90, 0, 0]);
    const side = K.part('sidePanel', [0.31, 0.55, 0], null, 'Side panel');
    K.box(side, [0.02, 1.1, 1.1], K.std(0x5a6672, { transparent: true, opacity: 0.85 }));
    const mb = K.part('motherboard', [-0.27, 0.6, 0.02], null, 'Motherboard');
    K.box(mb, [0.02, 0.8, 0.8], 'green');
    const cpu = K.part('cooler', [-0.15, 0.78, 0.05], null, 'CPU cooler');
    K.box(cpu, [0.22, 0.2, 0.2], 'steel');
    K.rep(8, (i) => K.box(cpu, [0.22, 0.2, 0.004], 'chrome', [0, 0, -0.09 + i * 0.026]));
    const cfan = K.part('cpuFan', [-0.15, 0.78, 0.16], null, 'CPU fan');
    K.box(cfan, [0.2, 0.2, 0.03], 'black');
    const cfb = K.group(cfan, [0, 0, 0.02]);
    K.rep(5, (i) => K.box(cfb, [0.025, 0.08, 0.005], 'grey', [Math.cos(i * 1.256) * 0.045, Math.sin(i * 1.256) * 0.045, 0], [0, 0, i * 72 + 20]));
    const ram = K.part('ram', [-0.22, 0.78, -0.18], null, 'RAM sticks');
    K.box(ram, [0.08, 0.32, 0.02], 'navy', [0, 0, 0]);
    K.box(ram, [0.08, 0.32, 0.02], 'navy', [0, 0, -0.05]);
    const latch = K.part('ramLatch', [-0.22, 0.95, -0.2], null, 'RAM latches');
    K.box(latch, [0.04, 0.03, 0.08], 'offwhite');
    const gpu = K.part('gpu', [-0.12, 0.42, 0.05], null, 'Graphics card');
    K.box(gpu, [0.3, 0.1, 0.7], 'black');
    K.cyl(gpu, [0.08, 0.08, 0.012, 20], 'grey', [0, -0.055, -0.15]);
    K.cyl(gpu, [0.08, 0.08, 0.012, 20], 'grey', [0, -0.055, 0.17]);
    const psu = K.part('psu', [0, 0.14, -0.3], null, 'Power supply');
    K.box(psu, [0.5, 0.2, 0.4], 'grey');
    const psw = K.part('psuSwitch', [0, 0.14, -0.58], null, 'PSU rocker switch');
    K.box(psw, [0.06, 0.04, 0.02], 'black');
    const cord = K.part('cord', [0, 0, 0], null, 'Power cord');
    K.tube(cord, [[0.12, 0.14, -0.58], [0.15, 0.1, -0.8], [0.6, 0.02, -0.9], [1.0, 0.02, -0.6]], 0.015, 'black');
    const fan = K.part('caseFan', [0, 0.85, -0.52], null, 'Rear case fan');
    K.box(fan, [0.22, 0.22, 0.03], 'black');
    const dust = K.part('dust', [0, 0, 0], null, 'Dust buildup');
    const dm = K.std(0x9b9389, { transparent: true, opacity: 0.75, roughness: 1 });
    K.box(dust, [0.24, 0.01, 0.22], dm, [-0.15, 0.89, 0.05]);
    K.box(dust, [0.2, 0.2, 0.01], dm, [-0.15, 0.78, 0.18]);
    K.box(dust, [0.3, 0.01, 0.6], dm, [-0.12, 0.475, 0.05]);
    K.box(dust, [0.62, 0.01, 1.0], dm, [0, 0.045, 0]);
    const air = K.part('air', [0.6, 0.9, 0.6], null, 'Compressed air');
    K.cyl(air, [0.05, 0.05, 0.25], 'sky', [0, 0, 0], [0, 0, 30]);
    K.cyl(air, [0.006, 0.006, 0.2], 'red', [-0.15, -0.12, -0.1], [40, 0, 50]);
    return {
      tick(t, fx) {
        if (fx === 'run') {
          cfb.rotation.z = t * 20;
        }
      },
    };
  });

  /* ---- Model: modem + router on a shelf ---- */
  TB.model('router', { cam: [1.6, 1.4, 2.0], at: [0, 0.4, 0] }, (K) => {
    K.box(null, [2.4, 0.06, 1.0], 'woodLight', [0, 0.0, 0]);
    K.box(null, [2.4, 1.6, 0.06], 'drywall', [0, 0.8, -0.55]);
    const modem = K.part('modem', [-0.55, 0.33, -0.1], null, 'Modem (from your ISP)');
    K.box(modem, [0.12, 0.6, 0.45], 'white');
    const mleds = [0, 1, 2, 3].map((i) => K.sph(modem, 0.012, 'ledG', [0.065, 0.2 - i * 0.07, 0.15]));
    const coax = K.part('coax', [0, 0, 0], null, 'Coax / fiber line in');
    K.tube(coax, [[-0.55, 0.15, -0.33], [-0.55, 0.1, -0.5], [-0.8, 0.05, -0.52]], 0.015, 'black');
    const router = K.part('router', [0.35, 0.08, 0], null, 'Wi-Fi router');
    K.box(router, [0.7, 0.1, 0.45], 'black');
    K.rep(3, (i) => K.box(router, [0.025, 0.4, 0.025], 'black', [-0.25 + i * 0.25, 0.24, -0.2], [0, 0, (i - 1) * 15]));
    const rleds = [0, 1, 2, 3].map((i) => K.sph(router, 0.012, 'ledB', [-0.2 + i * 0.1, 0.03, 0.23]));
    const eth = K.part('ethernet', [0, 0, 0], null, 'Ethernet cable');
    K.tube(eth, [[-0.48, 0.15, -0.25], [-0.2, 0.06, -0.3], [0.2, 0.06, -0.24]], 0.012, 'blue');
    const plugs = K.part('plugs', [0, 0, 0], null, 'Power adapters');
    K.box(plugs, [0.12, 0.08, 0.1], 'black', [-0.9, 0.08, 0.2]);
    K.box(plugs, [0.12, 0.08, 0.1], 'black', [-0.75, 0.08, 0.2]);
    K.tube(plugs, [[-0.9, 0.08, 0.2], [-0.7, 0.04, 0.1], [-0.55, 0.06, -0.25]], 0.008, 'black');
    K.tube(plugs, [[-0.75, 0.08, 0.2], [0.0, 0.04, 0.15], [0.3, 0.06, -0.2]], 0.008, 'black');
    const waves = K.part('signal', [0.35, 0.5, 0], null, 'Wi-Fi signal');
    const rings = [0, 1, 2].map((i) => K.tor(waves, [0.25 + i * 0.22, 0.008], K.std(0x7fb8e8, { transparent: true, opacity: 0.6, emissive: 0x3a8ad8, emissiveIntensity: 0.4 }), [0, 0, 0], [90, 0, 0]));
    return {
      tick(t, fx) {
        const off = fx === 'off';
        const boot = fx === 'boot';
        mleds.forEach((l, i) => (l.material.emissiveIntensity = off ? 0 : boot ? (Math.sin(t * 6 + i) > 0 ? 1 : 0.1) : 1));
        rleds.forEach((l, i) => (l.material.emissiveIntensity = off || (boot && t % 4 < 2) ? 0 : 1));
        rings.forEach((r, i) => {
          r.visible = !off && !boot;
          const s = 1 + ((t * 0.6 + i / 3) % 1) * 0.5;
          r.scale.set(s, s, s);
        });
      },
    };
  });

  TB.category({
    id: 'tech',
    code: 'TEC',
    name: 'Computers & Network',
    domain: 'tech',
    blurb: 'PCs that won’t boot, overheating and slow Wi-Fi',
    repairs: [
      {
        id: 'pc-no-power',
        title: 'Desktop PC won’t turn on',
        model: 'pc',
        level: 2,
        time: '20–40 min',
        cost: '$0',
        summary: 'Start outside the case with the outlet, cord and the power supply switch. Then open it up and reseat the RAM and power cables, which fix most PCs that do nothing, or that spin their fans but show no picture.',
        intro: { hi: ['powerBtn', 'psuSwitch'] },
        safety: ['Unplug the power cord before opening the case, then hold the power button for 10–15 seconds to drain stored charge.', 'Touch bare, unpainted metal on the case before handling parts to discharge static, and work on a hard floor, not carpet.', 'Never open the power supply (the metal box with the cord plugged into it). Its capacitors hold a dangerous charge even when unplugged.', 'Smell burning or see smoke? Unplug it and stop.'],
        causes: [['Power supply switch off or cord loose', 'Easy to bump when moving the PC.'], ['Bad outlet or power strip', 'A tripped power strip or dead outlet looks exactly like a dead PC.'], ['RAM unseated', 'Fans spin but no picture, often with beeps or a lit DRAM light on the board.'], ['CPU power cable loose', 'The 8-pin cable near the processor is easy to knock loose.'], ['Failed power supply', 'Nothing at all, not even a fan twitch, on a known-good outlet.']],
        tools: ['Phillips #2 screwdriver', 'Flashlight', 'A lamp or phone charger to test the outlet', 'Anti-static wrist strap (optional)', 'Your motherboard manual (or its PDF on your phone)'],
        steps: [
          { t: 'Check the outlet and cord', d: 'Plug a lamp into the same outlet to prove it has power. If you use a power strip, check its switch and reset button. Push the power cord firmly into the back of the PC and into the wall.', why: 'Tripped power strips and half-pulled cords cause a surprising share of “dead” PCs.', tip: 'Plug the PC straight into a wall outlet for this test. Cheap surge strips fail quietly, and their lights can stay on even when an outlet is dead.', ok: 'The lamp lights in that outlet, and the cord won’t push in any further at either end.', v: { cam: [1.4, 0.8, -1.6], at: [0.3, 0.1, -0.7], hi: ['cord'] } },
          { t: 'Check the power supply switch', d: 'Find the small rocker switch on the back, right next to the power cord. Set it to I (on). O means off.', why: 'This is the power supply’s main switch. If it’s off, the front power button does nothing.', tip: 'Many power supplies have a tiny green LED or a fan twitch when switched on. If yours has a 115/230 V selector switch, it must read 115 in the US.', ok: 'The switch is pressed in on the I side, and the cord is seated beside it.', v: { cam: [0.8, 0.6, -1.4], at: [0, 0.14, -0.58], hi: ['psuSwitch'] } },
          { t: 'Unplug and open the case', d: 'Switch the supply to O, unplug the cord, then hold the power button for 15 seconds. Remove the two screws (or thumbscrews) at the back of the left side panel and slide or swing the panel off.', why: 'Holding the button drains leftover charge from the power supply and board so nothing is live while you work.', tip: 'Lay the PC on its right side on a table so the motherboard faces up; parts are easier to see and push in. Put screws in a cup.', ok: 'The panel is off, and you can see the fans, the memory sticks and the cables.', v: { cam: [2.2, 1.4, 1.6], at: [0.2, 0.6, 0], hi: ['sidePanel'], mv: { sidePanel: [0.7, 0, 0.3] } } },
          { t: 'Reseat the RAM', d: 'Touch bare case metal first. Press the latch at the end of each memory stick (RAM) open, pull the stick straight up, then push it back in firmly with both thumbs until the latches snap shut on their own.', why: 'Heat cycles slowly work RAM loose. A no-picture start with spinning fans is often just this.', tip: 'The notch in the gold edge only lines up one way; if it won’t go, turn the stick around. Still no picture after? Try one stick alone in the slot your manual calls first (often A2).', ok: 'You hear a firm click at each end, and the stick sits level with its neighbors with no gold showing.', v: { cam: [1.2, 1.2, 0.6], at: [-0.2, 0.8, -0.2], hi: ['ram', 'ramLatch'], mv: { ram: [0.3, 0.15, 0] } } },
          { t: 'Check power connectors', d: 'Press the wide 24-pin plug on the board’s right edge until its clip clicks. Check the 8-pin CPU plug at the top-left corner near the processor. Make sure the tiny front-panel power-switch wires are on the pins the manual shows.', why: 'Without the 8-pin CPU cable, the board gets power but won’t start the processor. Without the front-panel wires, the power button isn’t connected at all.', tip: 'Look for small lights labeled CPU, DRAM, VGA, BOOT near the 24-pin plug. Whichever stays lit when you power on points to the part with the problem.', ok: 'Every plug is pushed fully home with its clip latched, and none pulls out with a gentle tug.', v: { cam: [1.4, 1.2, 1.0], at: [-0.2, 0.6, 0], hi: ['motherboard', 'psu'], mv: { ram: [0, 0, 0] }, xray: true } },
          { t: 'Close up and test', d: 'Refit the panel, plug in, switch the supply to I, and press the power button. Connect only the monitor, keyboard and mouse for this test. Plug the monitor into the graphics card if you have one.', why: 'Testing with only the essentials rules out a bad USB device or drive holding up startup.', tip: 'Still nothing? Clear the BIOS settings: unplug, pop out the coin battery on the board for 60 seconds, put it back and retry.', ok: 'Fans spin, lights come on and the screen shows a logo or BIOS screen within about 30 seconds.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.6, 0], hi: ['powerBtn'], mv: { sidePanel: [0, 0, 0] }, fx: 'run' } },
        ],
        learn: {
          how: 'The power supply converts wall AC into the low DC voltages parts need (12 V, 5 V, 3.3 V). It keeps a small standby supply on all the time. Pressing the power button just signals the motherboard, which tells the power supply to turn fully on. Then the processor runs a power-on self-test (POST), checking memory and graphics before handing off to Windows or macOS.',
          specs: [['Main voltages', '12 V · 5 V · 3.3 V'], ['24-pin ATX', 'motherboard power'], ['8-pin EPS (4+4)', 'CPU power'], ['Drain charge', 'hold power button 10–15 s'], ['Clear BIOS', 'coin battery out 60 s'], ['Static that damages chips', '< 100 V (you can’t feel it)']],
          terms: [['PSU', 'Power Supply Unit: the box that turns wall power into computer power.'], ['POST', 'Power-On Self-Test run at startup.'], ['DIMM', 'A RAM stick.'], ['Beep code', 'Pattern of beeps that names the failed part.'], ['CMOS / BIOS', 'The board’s settings memory and startup software, kept alive by a coin battery.'], ['Debug LEDs', 'Small lights on the board that show which startup stage failed.']],
          mistakes: ['Working on carpet in socks.', 'Forcing RAM in the wrong way (it’s keyed with a notch).', 'Opening the power supply.', 'Plugging the monitor into the motherboard when a graphics card is installed.'],
          tips: ['Look up your motherboard’s beep codes or debug LEDs. They often name the exact failed part.', 'Take a phone photo before unplugging anything inside the case.'],
        },
        pro: 'You smell burning, see bulging or leaking capacitors (little cans on the board), the PC is under warranty (opening may void it), or a different known-good power supply doesn’t fix it.',
        tricks: [
          ['Photo before you touch', 'Snap a picture of the inside before you unplug anything. It’s your map for putting cables back.'],
          ['One stick, one slot', 'If reseating doesn’t help, boot with a single RAM stick in the manual’s first slot, then try each stick. A bad stick shows itself fast.'],
          ['Read the debug lights', 'Most modern boards have CPU, DRAM, VGA and BOOT lights near the 24-pin plug. The one that stays lit names the problem.'],
          ['Buy a $15 PSU tester', 'A plug-in power supply tester shows each voltage in seconds and is safer than the old paperclip trick.'],
          ['Test the front button', 'Test the power button itself by touching the two PWR_SW pins on the board with a screwdriver tip for a second. If the PC starts, the case button or its wire is the problem.'],
          ['Clear the BIOS', 'After a failed update or overclock, clearing CMOS (jumper or coin battery out for 60 seconds) brings many “dead” boards back.'],
        ],
        refs: [
          ['PC won’t turn on? What you need to try (Corsair)', 'https://www.corsair.com/us/en/explorer/diy-builder/blogs/pc-wont-turn-on-what-you-need-to-try/'],
          ['Desktop PC repair guides (iFixit)', 'https://www.ifixit.com/Device/PC_Desktop'],
          ['Information about temperature for Intel processors (Intel Support)', 'https://www.intel.com/content/www/us/en/support/articles/000005597/processors.html'],
        ],
      },
      {
        id: 'pc-overheat',
        title: 'Computer is loud or overheating',
        model: 'pc',
        level: 1,
        time: '20–30 min',
        cost: '$5–10',
        summary: 'Dust clogs heatsinks, fans and filters, so fans spin harder and the processor slows itself down to stay safe. A careful blow-out every 6–12 months fixes most of it, and before-and-after temperatures prove it worked.',
        intro: { hi: ['dust'], xray: true, fx: 'run' },
        safety: ['Shut down and unplug before cleaning.', 'Hold fans still while blowing air. Spinning them too fast can damage bearings and push current back into the board.', 'Keep a can of compressed air upright and use short bursts; tipped or held down, it sprays freezing liquid.', 'Do this outside or near an open window, and wear a dust mask; the cloud is real.'],
        causes: [['Dust in heatsinks', 'Felt-like layer that insulates and blocks airflow.'], ['Clogged intake filters', 'Front and bottom filters fill up first.'], ['Dried thermal paste', 'On PCs over about 5 years old.'], ['Poor placement', 'Case pushed against a wall, in a closed cabinet or on carpet.']],
        tools: ['Compressed air or an electric duster', 'Phillips #2 screwdriver', 'Soft paintbrush', 'Zip tie or pencil (to hold fans still)', 'Free temperature app (HWMonitor, Core Temp or HWiNFO)', 'Dust mask'],
        steps: [
          { t: 'Check temperatures', d: 'Install a free monitoring app (HWMonitor or Core Temp). Write down the CPU temperature at idle, then after 10 minutes of a game or heavy task.', why: 'A before-and-after reading shows whether cleaning worked, and tells you if you even had a problem.', tip: 'Processors run hotter than people expect: 80–90 °C in a game is normal for many chips. Worry when it sits at the limit (about 95–100 °C) and the PC slows down.', ok: 'You have two numbers written down: idle and load, in °C.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.6, 0], hi: ['cooler'], xray: true, fx: 'run' } },
          { t: 'Shut down, unplug, open', d: 'Shut down, flip the power supply switch to O, unplug, and carry the PC outside or to a window. Touch bare metal, then remove the side panel.', why: 'Unplugging removes power and keeps the fans from starting; outside keeps the dust out of your room.', tip: 'Carry a tower by its frame, not the side panel or front cover, which can pop off in your hands.', ok: 'The side panel is off and the PC is unplugged in a spot where dust can blow away.', v: { cam: [2.2, 1.4, 1.6], at: [0.2, 0.6, 0], hi: ['sidePanel'], mv: { sidePanel: [0.7, 0, 0.3] } } },
          { t: 'Hold the fans and blow', d: 'Hold each fan still with a finger or a pencil through the blades. Hold the can upright 3–4″ away and blow short bursts through the heatsink fins, aiming the dust toward the rear exhaust.', why: 'Short bursts keep the can from spraying freezing liquid, and holding the fan stops it from over-spinning.', tip: 'Dust felted into a solid mat? Loosen it with a soft paintbrush first, then blow. Air alone just packs it tighter.', ok: 'Shining a flashlight through the fins, you see light through them, not a gray blanket.', v: { cam: [1.2, 1.3, 1.2], at: [-0.15, 0.78, 0.1], hi: ['cooler', 'cpuFan', 'air'], show: ['air'] } },
          { t: 'Clean graphics card, case fans and filters', d: 'Repeat on the graphics card fans and the front, top and rear case fans. Pull out the dust filters (they snap or slide out) and rinse or brush them; let them dry completely.', why: 'Every fan in the airflow path matters; one clogged intake starves the whole case.', tip: 'Wet filters must be bone dry before going back in. Lay them in the sun for an hour or pat them with a towel.', ok: 'Fan blades look clean, and you can see clearly through the filter mesh.', v: { cam: [1.2, 0.9, 1.2], at: [-0.1, 0.45, 0], hi: ['gpu', 'caseFan'], hide: ['dust'] } },
          { t: 'Close and recheck temps', d: 'Refit the filters and panel, plug in, and run the same test for the same 10 minutes. Compare with your first numbers.', why: 'A dusty machine typically drops 5–15 °C and the fans get noticeably quieter.', tip: 'Little or no change? The thermal paste (the gray grease between chip and cooler) may be dried out, or the cooler isn’t pressing down evenly.', ok: 'The new load temperature is lower than before, and the fans sound calmer.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.6, 0], hi: ['cooler'], hide: ['air'], mv: { sidePanel: [0, 0, 0] }, fx: 'run', xray: true } },
        ],
        learn: {
          how: 'Processors turn electricity into heat. The cooler pulls that heat into metal fins, and fans push air through the fins to carry it away. A layer of dust insulates the fins and blocks airflow, so the chip runs hotter. At its limit (about 95–100 °C on most chips), it slows itself down to protect itself, called thermal throttling, and your computer feels sluggish.',
          specs: [['Idle CPU', '30–50 °C'], ['Gaming load', '60–90 °C'], ['Throttle limit', '≈ 95–100 °C (Intel up to 100+, many Ryzen 95)'], ['Expected drop after cleaning', '5–15 °C'], ['Clean every', '6–12 months']],
          terms: [['Heatsink', 'Finned metal block that sheds heat.'], ['Thermal paste', 'Gray compound filling the tiny gaps between chip and cooler.'], ['Throttling', 'Automatic slowdown to limit heat.'], ['Intake / exhaust', 'Fans that pull air in versus push it out.']],
          mistakes: ['Using a household vacuum inside the case (static).', 'Letting fans spin freely under air.', 'Tipping the can upside down.', 'Putting wet filters back in.'],
          tips: ['Positive pressure (a bit more intake than exhaust fan) keeps dust from sneaking in through gaps.', 'Raise a floor PC a few inches off carpet so it doesn’t breathe fibers.'],
        },
        pro: 'Temperatures stay high after cleaning (dried thermal paste, or a failing pump on a liquid cooler), or a fan grinds or rattles.',
        tricks: [
          ['Electric duster pays for itself', 'A rechargeable electric duster costs about four cans of air and never runs out or frosts up.'],
          ['Brush, then blow', 'Loosen matted dust with a soft paintbrush first. Air alone often presses felt deeper into the fins.'],
          ['Get it off the floor', 'A PC on carpet inhales fibers. Even a small stand or a board under it cuts the dust in half.'],
          ['Check the fan curve', 'In the BIOS fan settings, a “standard” or “silent” curve keeps fans quieter at idle once things are clean.'],
          ['Repaste old machines', 'On PCs over 5 years old, a pea-sized dot of fresh thermal paste after cleaning off the old with isopropyl alcohol can drop temperatures another 5–10 °C.'],
          ['Watch for clock drops', 'If the app shows clock speed falling while temperature sits at the limit, that’s throttling, and cooling is your bottleneck.'],
        ],
        refs: [
          ['Information about temperature for Intel processors (Intel Support)', 'https://www.intel.com/content/www/us/en/support/articles/000005597/processors.html'],
          ['Desktop PC repair guides (iFixit)', 'https://www.ifixit.com/Device/PC_Desktop'],
          ['PC won’t turn on? What you need to try (Corsair)', 'https://www.corsair.com/us/en/explorer/diy-builder/blogs/pc-wont-turn-on-what-you-need-to-try/'],
        ],
      },
      {
        id: 'wifi-slow',
        title: 'Wi-Fi is slow or keeps dropping',
        model: 'router',
        level: 1,
        time: '15–20 min',
        cost: '$0',
        summary: 'Restart in the right order (modem first, then router), then fix placement. Most home Wi-Fi problems are a router that needs a fresh start or one hidden in a corner, cabinet or behind the TV.',
        intro: { hi: ['modem', 'router', 'signal'] },
        safety: ['Don’t press the tiny recessed reset button unless you mean to erase all settings. Your network name and password will be wiped.', 'Keep the router and modem in open air; they run warm and need ventilation.'],
        causes: [['Router needs a restart', 'Memory leaks and stuck connections build up over weeks.'], ['Bad placement', 'Behind a TV, in a cabinet, on the floor, or at one end of the house.'], ['Interference', 'Microwaves, baby monitors, and neighbors’ networks on the same channel.'], ['Internet outage', 'The modem’s lights show the problem is with your provider.'], ['Old equipment', 'Routers more than about 5 years old can’t keep up with today’s devices.']],
        tools: ['A phone with a speed-test app', 'Router admin login (printed on its sticker)', 'Ethernet cable (to test speed wired)'],
        steps: [
          { t: 'Read the modem lights', d: 'Look at the modem (the box the provider’s cable or fiber plugs into). A solid online or internet light means the line is up; blinking or red means the problem is upstream.', why: 'If the modem has no signal, no router fix will help; call your provider. Their outage map on your phone’s data may show it too.', tip: 'Some boxes are modem and router in one (a gateway). Then there’s only one box to read and restart.', ok: 'You know whether the online light is solid, blinking or red.', v: { cam: [0.4, 0.8, 1.0], at: [-0.5, 0.35, 0.1], hi: ['modem'] } },
          { t: 'Unplug both', d: 'Unplug the power cords from the modem and the router (not the coax or Ethernet cables). Wait a full 60 seconds.', why: 'A cold restart clears memory and makes the modem renegotiate a fresh connection with your provider.', tip: 'Some modems have a backup battery and stay on when unplugged. Pop the battery door and pull the battery too.', ok: 'Every light on both boxes is dark.', v: { cam: [1.0, 1.0, 1.4], at: [-0.6, 0.1, 0.1], hi: ['plugs'], fx: 'off' } },
          { t: 'Modem first, wait', d: 'Plug in the modem only. Wait until its online light is solid, usually 2–5 minutes.', why: 'The router needs a live modem to get an internet address. Starting it too early leaves it with no internet.', tip: 'Lights cycling for more than 10 minutes? The modem can’t reach the provider; call them with the light colors in front of you.', ok: 'The online or internet light is solid and stays solid.', v: { cam: [0.4, 0.8, 1.0], at: [-0.5, 0.35, 0.1], hi: ['modem'], fx: 'boot' } },
          { t: 'Then the router', d: 'Plug in the router and wait 2–3 minutes for its Wi-Fi or internet light to go solid.', why: 'It now gets a fresh address and settings from the modem.', tip: 'If devices still won’t connect, forget the network on the phone and rejoin with the password from the sticker.', ok: 'Your phone shows full Wi-Fi bars near the router and a web page loads.', v: { cam: [1.2, 0.8, 1.2], at: [0.35, 0.1, 0], hi: ['router'], fx: 'boot' } },
          { t: 'Improve placement', d: 'Move the router up high (a shelf at chest height or higher), near the middle of the home, out of cabinets and away from the TV, mirrors, fish tanks and the microwave. Point antennas in mixed directions: one straight up, one sideways.', why: 'Wi-Fi radiates out and slightly down like a donut; metal, water and mirrors absorb or reflect it.', tip: 'Can’t move the cable outlet? A longer Ethernet cable from the modem lets the router sit somewhere better.', ok: 'The router is out in the open, above furniture, with no metal or glass right next to it.', v: { cam: [1.6, 1.6, 2.4], at: [0.3, 0.5, 0], hi: ['signal', 'router'] } },
          { t: 'Test speed', d: 'Run a speed test next to the router, then in the problem room, and compare with your plan. For a true baseline, test once with a laptop plugged into the router with a cable.', why: 'Fast near the router but slow far away means a coverage problem (a mesh system helps). Slow even wired means the internet line or plan.', tip: 'In the router app, split or name the 5 GHz network separately and put close-by devices on it; it’s much faster than 2.4 GHz.', ok: 'You have a speed number near the router and in the problem room, and you can see which one is the weak spot.', v: { cam: [1.6, 1.4, 2.0], at: [0, 0.4, 0], hi: ['signal'] } },
        ],
        learn: {
          how: 'The modem translates your provider’s signal (cable, fiber or DSL) into internet data. The router shares that connection with your devices over radio waves on 2.4 GHz, 5 GHz and, on newer gear, 6 GHz. 2.4 GHz reaches farther but is slower and crowded; 5 and 6 GHz are faster but weaker through walls. Signal drops fast with distance and every wall in the way.',
          specs: [['2.4 GHz', 'longer range, slower; use channels 1, 6 or 11'], ['5 GHz', 'faster, shorter range'], ['Unplug for', '60 s'], ['Modem boot', '2–5 min'], ['Router placement', 'central, high, in the open']],
          terms: [['Modem', 'Connects your home to the provider.'], ['Router', 'Creates your local network and Wi-Fi.'], ['Gateway', 'A modem and router in one box.'], ['Mesh', 'Several units that blanket a home with one network.'], ['SSID', 'Your network’s name.'], ['Ethernet', 'A wired network cable.']],
          mistakes: ['Hiding the router in a cabinet.', 'Pressing reset instead of restarting.', 'Restarting the router before the modem is online.', 'Blaming Wi-Fi when the wired speed is slow too.'],
          tips: ['Plug gaming PCs and TVs in with Ethernet; it frees up Wi-Fi for phones.', 'Update the router firmware in its app or admin page; updates fix drops and security holes.'],
        },
        pro: 'The modem shows no signal (call your provider), or speeds are far below your plan even with a laptop plugged directly into the modem with a cable.',
        tricks: [
          ['Test wired first', 'A laptop on a cable at the router tells you instantly whether the problem is Wi-Fi or the internet line.'],
          ['Use the app’s restart', 'Most router apps can reboot on a schedule (say, 4 a.m. weekly), which heads off slowdowns before you notice.'],
          ['Pick a quiet channel', 'On 2.4 GHz use only channels 1, 6 or 11. A free Wi-Fi analyzer app shows which one your neighbors aren’t using.'],
          ['Up high beats more power', 'Moving the router from the floor to the top of a bookcase often adds more range than buying a stronger router.'],
          ['Retire old gear', 'A router over about 5 years old, or older than Wi-Fi 5, is often the bottleneck. A modern Wi-Fi 6 router or mesh kit is a big jump.'],
          ['Write it down', 'Photograph the router sticker (network name, password, admin login) so a reset is never a disaster.'],
        ],
        refs: [
          ['Fix Wi-Fi connection issues in Windows (Microsoft Support)', 'https://support.microsoft.com/en-us/windows/fix-wi-fi-connection-issues-in-windows-9424a1f7-6a3b-65a6-4d78-7f07eee84d2c'],
          ['Recommended settings for Wi-Fi routers and access points (Apple Support)', 'https://support.apple.com/en-us/102766'],
          ['Broadband speed guide (FCC)', 'https://www.fcc.gov/consumers/guides/broadband-speed-guide'],
          ['Where to place your Wifi devices (Google Nest Help)', 'https://support.google.com/googlehome/answer/7183150'],
        ],
      },
    ],
  });
})();
