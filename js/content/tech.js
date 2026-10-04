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
        summary: 'Start outside the case with power and cables, then reseat the RAM, which is the most common internal culprit for a PC that powers on but shows nothing.',
        intro: { hi: ['powerBtn', 'psuSwitch'] },
        safety: ['Unplug the power cord before opening the case, then hold the power button for 10 seconds to drain stored charge.', 'Touch bare metal on the case before handling parts to discharge static.', 'Never open the power supply itself. Capacitors inside hold a dangerous charge.'],
        causes: [['PSU switch off or cord loose', 'Easy to bump when moving the PC.'], ['Bad outlet or power strip', 'Check with a lamp.'], ['RAM unseated', 'Fans spin but no display, often with beeps.'], ['Failed power supply', 'Nothing at all, even with a good outlet.']],
        tools: ['Phillips screwdriver', 'Flashlight', 'Known-good outlet or lamp to test', 'Anti-static strap (optional)'],
        steps: [
          { t: 'Check the outlet and cord', d: 'Plug a lamp into the same outlet. Push the power cord firmly into the PC and the wall.', why: 'Power strips with tripped switches and loose cords cause a surprising share of “dead” PCs.', v: { cam: [1.4, 0.8, -1.6], at: [0.3, 0.1, -0.7], hi: ['cord'] } },
          { t: 'Check the PSU switch', d: 'Find the rocker switch on the back next to the cord. Set it to I (on).', why: 'This is the power supply’s main switch. If it’s off, the front button does nothing.', v: { cam: [0.8, 0.6, -1.4], at: [0, 0.14, -0.58], hi: ['psuSwitch'] } },
          { t: 'Unplug and open the case', d: 'Unplug, hold the power button 10 seconds, then remove the side panel screws and slide the panel off.', why: 'Holding the button drains leftover charge from the power supply and board.', v: { cam: [2.2, 1.4, 1.6], at: [0.2, 0.6, 0], hi: ['sidePanel'], mv: { sidePanel: [0.7, 0, 0.3] } } },
          { t: 'Reseat the RAM', d: 'Press the latches open, pull each stick straight out, and push it back in firmly until both latches click.', why: 'Heat cycles slowly work RAM loose. A no-display boot with spinning fans is often just this.', v: { cam: [1.2, 1.2, 0.6], at: [-0.2, 0.8, -0.2], hi: ['ram', 'ramLatch'], mv: { ram: [0.3, 0.15, 0] } } },
          { t: 'Check power connectors', d: 'Make sure the big 24-pin and the 8-pin CPU connectors are fully seated on the motherboard.', why: 'Without the 8-pin CPU cable, the board gets power but won’t start the processor.', v: { cam: [1.4, 1.2, 1.0], at: [-0.2, 0.6, 0], hi: ['motherboard', 'psu'], mv: { ram: [0, 0, 0] }, xray: true } },
          { t: 'Close up and test', d: 'Replace the panel, plug in, switch the PSU on, and press the power button.', why: 'Test with only the essentials connected: monitor, keyboard and mouse.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.6, 0], hi: ['powerBtn'], mv: { sidePanel: [0, 0, 0] }, fx: 'run' } },
        ],
        learn: {
          how: 'The power supply converts wall AC into the low DC voltages parts need (12 V, 5 V, 3.3 V). Pressing the power button just signals the motherboard, which tells the power supply to turn fully on. Then the processor runs a power-on self-test (POST), checking RAM and graphics before handing off to the operating system.',
          specs: [['Main rails', '12 V · 5 V · 3.3 V'], ['24-pin', 'motherboard power'], ['8-pin EPS', 'CPU power'], ['Static that damages chips', '< 100 V (you can’t feel it)']],
          terms: [['PSU', 'Power Supply Unit.'], ['POST', 'Power-On Self-Test run at startup.'], ['DIMM', 'A RAM stick.'], ['Beep code', 'Pattern of beeps that names the failed part.']],
          mistakes: ['Working on carpet in socks.', 'Forcing RAM in the wrong way (it’s keyed with a notch).', 'Opening the PSU.'],
          tips: ['Look up your motherboard’s beep codes or debug LEDs. They often name the exact failed part.'],
        },
        pro: 'You smell burning, see swollen capacitors, or the PC is under warranty (opening may void it).',
      },
      {
        id: 'pc-overheat',
        title: 'Computer is loud or overheating',
        model: 'pc',
        level: 1,
        time: '20–30 min',
        cost: '$5–10',
        summary: 'Dust clogs heatsinks and fans, so fans spin harder and the CPU slows itself down. A careful blow-out every 6–12 months fixes most of it.',
        intro: { hi: ['dust'], xray: true, fx: 'run' },
        safety: ['Shut down and unplug before cleaning.', 'Hold fans still while blowing air; spinning them too fast can generate voltage and damage bearings.', 'Do this outside or near an open window; the dust cloud is real.'],
        causes: [['Dust in heatsinks', 'Insulates and blocks airflow.'], ['Clogged intake filters', 'Front and bottom filters.'], ['Dried thermal paste', 'On PCs over 5 years old.']],
        tools: ['Compressed air or electric duster', 'Phillips screwdriver', 'Soft brush', 'Zip tie or pencil (to hold fans)', 'Temperature monitor app'],
        steps: [
          { t: 'Check temperatures', d: 'Use a monitoring app to note CPU temps at idle and under load.', why: 'A before/after reading shows whether cleaning worked.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.6, 0], hi: ['cooler'], xray: true, fx: 'run' } },
          { t: 'Shut down, unplug, open', d: 'Power off, unplug, and remove the side panel.', why: 'Static and moving fans are the hazards; unplugging removes both.', v: { cam: [2.2, 1.4, 1.6], at: [0.2, 0.6, 0], hi: ['sidePanel'], mv: { sidePanel: [0.7, 0, 0.3] } } },
          { t: 'Hold the fans and blow', d: 'Hold each fan still with a finger or pencil and blow short bursts through the heatsink fins.', why: 'Short bursts keep the can from spraying freezing liquid propellant.', v: { cam: [1.2, 1.3, 1.2], at: [-0.15, 0.78, 0.1], hi: ['cooler', 'cpuFan', 'air'], show: ['air'] } },
          { t: 'Clean GPU and case fans', d: 'Repeat for the graphics card fans and the rear and front case fans. Brush the dust filters.', why: 'Every fan in the airflow path matters; one clogged intake starves the rest.', v: { cam: [1.2, 0.9, 1.2], at: [-0.1, 0.45, 0], hi: ['gpu', 'caseFan'], hide: ['dust'] } },
          { t: 'Close and recheck temps', d: 'Reassemble, run the same load, and compare.', why: 'Expect a 5–15 °C drop on a dusty machine.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.6, 0], hi: ['cooler'], hide: ['air'], mv: { sidePanel: [0, 0, 0] }, fx: 'run', xray: true } },
        ],
        learn: {
          how: 'Processors turn electricity into heat. The cooler draws that heat into metal fins, and fans push air through the fins to carry it away. A layer of dust insulates the fins and blocks airflow, so the chip runs hotter. Past about 95 °C, it slows itself down to protect itself (thermal throttling), and your computer feels sluggish.',
          specs: [['Idle CPU', '30–50 °C'], ['Gaming load', '60–85 °C'], ['Throttling', '≈ 95–100 °C'], ['Clean every', '6–12 months']],
          terms: [['Heatsink', 'Finned metal block that sheds heat.'], ['Thermal paste', 'Compound filling gaps between chip and cooler.'], ['Throttling', 'Automatic slowdown to limit heat.']],
          mistakes: ['Using a vacuum inside the case (static).', 'Letting fans spin freely under air.', 'Tipping the can upside down.'],
          tips: ['Positive pressure (more intake than exhaust fans) keeps dust out of gaps.'],
        },
        pro: 'Temps stay high after cleaning (thermal paste or failing pump on liquid coolers), or a fan grinds.',
      },
      {
        id: 'wifi-slow',
        title: 'Wi-Fi is slow or keeps dropping',
        model: 'router',
        level: 1,
        time: '15–20 min',
        cost: '$0',
        summary: 'Restart in the right order, then fix placement. Most home Wi-Fi problems are a router that needs a fresh start or one hidden in a corner.',
        intro: { hi: ['modem', 'router', 'signal'] },
        safety: ['Don’t press the recessed reset button unless you mean to erase all settings. Your network name and password will be wiped.'],
        causes: [['Router needs a restart', 'Memory leaks and stuck connections build up over weeks.'], ['Bad placement', 'Behind a TV, in a cabinet, or at one end of the house.'], ['Interference', 'Microwaves, neighbors’ networks, cordless phones.'], ['ISP outage', 'Modem lights show it.']],
        tools: ['A phone with a speed test app', 'Router admin login (on its sticker)'],
        steps: [
          { t: 'Read the modem lights', d: 'Check the modem. Internet/online light solid means the line is up; blinking or red means the problem is upstream.', why: 'If the modem has no signal, no router fix will help. Call your provider.', v: { cam: [0.4, 0.8, 1.0], at: [-0.5, 0.35, 0.1], hi: ['modem'] } },
          { t: 'Unplug both', d: 'Unplug power from the modem and the router.', why: 'A cold restart clears memory and renegotiates the connection with your provider.', v: { cam: [1.0, 1.0, 1.4], at: [-0.6, 0.1, 0.1], hi: ['plugs'], fx: 'off' } },
          { t: 'Modem first, wait 2 minutes', d: 'Plug in the modem only. Wait until its online light is solid (1–3 min).', why: 'The router needs a live modem to get an address. Starting it too early leaves it without internet.', v: { cam: [0.4, 0.8, 1.0], at: [-0.5, 0.35, 0.1], hi: ['modem'], fx: 'boot' } },
          { t: 'Then the router', d: 'Plug in the router and wait for its Wi-Fi light.', why: 'It now gets fresh settings from the modem.', v: { cam: [1.2, 0.8, 1.2], at: [0.35, 0.1, 0], hi: ['router'], fx: 'boot' } },
          { t: 'Improve placement', d: 'Move the router up high, central, and out of cabinets. Point antennas in mixed directions (one vertical, one horizontal).', why: 'Wi-Fi radiates outward and downward; walls, metal, water and mirrors absorb it.', v: { cam: [1.6, 1.6, 2.4], at: [0.3, 0.5, 0], hi: ['signal', 'router'] } },
          { t: 'Test speed', d: 'Run a speed test next to the router, then in the problem room.', why: 'Fast next to the router but slow far away means a coverage problem; a mesh or extender helps.', v: { cam: [1.6, 1.4, 2.0], at: [0, 0.4, 0], hi: ['signal'] } },
        ],
        learn: {
          how: 'The modem translates your provider’s signal (cable, fiber or DSL) into internet data. The router shares that connection with your devices over radio waves on 2.4 GHz and 5 GHz. 2.4 GHz reaches farther but is slower and crowded; 5 GHz is faster but weaker through walls. Range drops fast with distance and obstacles.',
          specs: [['2.4 GHz', 'longer range, slower'], ['5 GHz', 'faster, shorter range'], ['Modem boot', '1–3 min'], ['Restart router', 'monthly']],
          terms: [['Modem', 'Connects your home to the provider.'], ['Router', 'Creates your local network and Wi-Fi.'], ['Mesh', 'Several units that blanket a home with one network.'], ['SSID', 'Your network’s name.']],
          mistakes: ['Hiding the router in a cabinet.', 'Pressing reset instead of restarting.', 'Restarting the router before the modem is online.'],
          tips: ['Plug gaming PCs and TVs in with Ethernet; it frees up Wi-Fi for phones.'],
        },
        pro: 'The modem shows no signal (call your provider), or speeds are far below your plan even with a cable plugged directly into the modem.',
      },
    ],
  });
})();
