/* HVC · Heating, cooling & hot water */
(function () {
  /* ---- Model: upflow furnace with filter rack ---- */
  TB.model('furnace', { cam: [3.2, 2.4, 3.2], at: [0, 1.1, 0], hidden: ['newFilter'] }, (K) => {
    const cab = K.part('cabinet', [0, 0, 0], null, 'Furnace cabinet');
    K.box(cab, [1.0, 1.5, 1.0], 'lightgrey', [0, 0.95, -0.02]);
    K.box(cab, [1.02, 0.03, 1.02], 'grey', [0, 0.2, 0]);
    K.box(null, [1.3, 0.2, 1.3], 'concrete', [0, 0.1, 0]);
    const door = K.part('door', [0, 0.95, 0.49], null, 'Front access panel');
    K.box(door, [0.96, 1.4, 0.03], 'offwhite');
    K.box(door, [0.3, 0.04, 0.02], 'grey', [0, 0.5, 0.02]);
    K.rep(5, (i) => K.box(door, [0.5, 0.02, 0.01], 'grey', [0, -0.45 + i * 0.05, 0.02]));
    const blower = K.part('blower', [0, 0.6, 0], null, 'Blower fan');
    K.cyl(blower, [0.3, 0.3, 0.5, 20], 'dark', [0, 0, 0], [0, 0, 90]);
    K.cyl(blower, [0.12, 0.12, 0.52], 'steel', [0, 0, 0], [0, 0, 90]);
    const burners = K.part('burners', [0, 1.3, 0], null, 'Burners & heat exchanger');
    K.rep(4, (i) => K.cyl(burners, [0.04, 0.04, 0.7], 'steel', [-0.3 + i * 0.2, 0, 0.05], [90, 0, 0]));
    K.box(burners, [0.8, 0.3, 0.6], 'grey', [0, 0.25, -0.1]);
    // supply plenum and return duct
    K.box(null, [1.0, 0.6, 1.0], 'steel', [0, 2.0, 0]);
    K.box(null, [0.6, 0.4, 1.8], 'steel', [0, 2.1, -1.2]);
    const ret = K.part('return', [-0.85, 0.65, 0], null, 'Return air duct');
    K.box(ret, [0.6, 0.9, 0.9], 'steel');
    // filter rack between return and cabinet
    K.box(null, [0.12, 0.98, 1.04], 'grey', [-0.54, 0.65, 0]);
    const filt = K.part('filter', [-0.54, 0.65, 0], null, 'Air filter');
    K.box(filt, [0.06, 0.88, 0.96], 'offwhite');
    K.rep(14, (i) => K.box(filt, [0.07, 0.86, 0.012], 'lightgrey', [0, 0, -0.44 + i * 0.068]));
    const arrow = K.part('arrow', [0.0, 0.0, 0.0], filt, 'Airflow arrow → furnace');
    K.box(arrow, [0.072, 0.05, 0.4], 'dark', [0, 0.36, 0]);
    K.cone(arrow, [0.06, 0.12, 3], 'dark', [0, 0.36, 0.24], [90, 0, 0]);
    // dirty overlay
    const dirt = K.part('dust', [0, 0, 0], filt, 'Trapped dust');
    K.box(dirt, [0.075, 0.86, 0.94], K.std(0x7d7262, { transparent: true, opacity: 0.55 }));
    const nf = K.part('newFilter', [-0.54, 0.65, 1.4], null, 'New filter');
    K.box(nf, [0.06, 0.88, 0.96], 'white');
    K.box(nf, [0.072, 0.05, 0.4], 'blue', [0, 0.36, 0]);
    K.cone(nf, [0.06, 0.12, 3], 'blue', [0, 0.36, 0.24], [90, 0, 0]);
    const sw = K.part('switch', [0.8, 1.4, 0.3], null, 'Furnace power switch');
    K.box(sw, [0.04, 0.3, 0.2], 'red');
    K.box(sw, [0.02, 0.08, 0.04], 'offwhite', [0.03, 0.04, 0]);
    const tstat = K.part('thermostat', [1.1, 1.5, -0.74], null, 'Thermostat');
    K.box(tstat, [0.3, 0.4, 0.03], 'offwhite', [0, 0, 0]);
    K.box(tstat, [0.2, 0.12, 0.01], 'screen', [0, 0.05, 0.02]);
    K.box(null, [3.6, 2.6, 0.06], 'drywall', [0.2, 1.3, -0.8]);
    return {
      tick(t, fx) {
        if (fx === 'run') K.parts.blower.rotation.x = t * 12;
      },
    };
  });

  /* ---- Model: outdoor AC condenser ---- */
  TB.model('condenser', { cam: [3.0, 2.5, 3.2], at: [0, 0.7, 0], hidden: ['hose'] }, (K) => {
    K.box(null, [1.8, 0.1, 1.8], 'concrete', [0, 0.05, 0]);
    K.box(null, [4, 3, 0.1], K.std(0xc6b9a4, { roughness: 1 }), [0, 1.5, -1.5]);
    const coil = K.part('coil', [0, 0, 0], null, 'Condenser coil (fins)');
    for (const [x, z, ry] of [[0, 0.62, 0], [0, -0.62, 0], [0.62, 0, 90], [-0.62, 0, 90]]) {
      const g = K.group(coil, [x, 0.7, z], [0, ry, 0]);
      K.box(g, [1.2, 1.1, 0.04], K.std(0x8f9aa3, { metalness: 0.3 }));
      K.rep(22, (i) => K.box(g, [0.012, 1.08, 0.06], 'steel', [-0.56 + i * 0.053, 0, 0.02]));
    }
    K.rep(4, (i) => K.box(null, [0.06, 1.2, 0.06], 'dark', [i < 2 ? -0.62 : 0.62, 0.7, i % 2 ? -0.62 : 0.62]));
    const top = K.part('top', [0, 1.3, 0], null, 'Top grille');
    K.box(top, [1.3, 0.06, 1.3], 'dark');
    K.cyl(top, [0.5, 0.5, 0.07, 32, true], 'black', [0, 0.02, 0]);
    K.rep(8, (i) => K.box(top, [1.0, 0.02, 0.02], 'black', [0, 0.06, -0.42 + i * 0.12]));
    const fan = K.part('fan', [0, 1.22, 0], null, 'Fan');
    K.cyl(fan, [0.08, 0.08, 0.1], 'black');
    K.rep(3, (i) => K.box(fan, [0.42, 0.02, 0.16], 'grey', [Math.cos(i * 2.094) * 0.24, 0, Math.sin(i * 2.094) * 0.24], [12, -i * 120, 0]));
    const deb = K.part('debris', [0, 0, 0], null, 'Leaves & debris');
    [[0.7, 0.15, 0.5], [-0.66, 0.15, 0.3], [0.3, 0.15, 0.7], [-0.4, 0.2, -0.68], [0.68, 0.2, -0.2]].forEach((p, i) =>
      K.sph(deb, 0.1, i % 2 ? 'orange' : 'dirt', p, [1.4, 0.3, 1])
    );
    const disc = K.part('disconnect', [1.2, 1.3, -1.42], null, 'Electrical disconnect');
    K.box(disc, [0.35, 0.45, 0.14], 'grey');
    const po = K.part('pullout', [0, 0, 0.1], disc, 'Pull-out block');
    K.box(po, [0.22, 0.25, 0.08], 'black');
    K.tube(null, [[1.2, 1.05, -1.4], [1.0, 0.5, -1.0], [0.62, 0.4, -0.5]], 0.03, 'grey');
    K.tube(null, [[-0.3, 0.35, -0.62], [-0.3, 0.35, -1.0], [-0.3, 1.0, -1.42]], 0.035, 'copper');
    K.tube(null, [[-0.45, 0.35, -0.62], [-0.45, 0.35, -1.0], [-0.45, 1.0, -1.42]], 0.05, 'black');
    const hose = K.part('hose', [1.6, 0.9, 1.2], null, 'Garden hose');
    K.tube(hose, [[0.6, -0.85, 0.8], [0.3, -0.6, 0.4], [0, 0, 0], [-0.2, 0.1, -0.2]], 0.035, 'green');
    K.cyl(hose, [0.05, 0.04, 0.2], 'yellow', [-0.25, 0.12, -0.25], [0, 45, 70]);
    const spray = K.cone(hose, [0.12, 0.6, 16], 'water', [-0.55, 0.15, -0.55], [0, 45, 90]);
    spray.userData.noPick = true;
    return {
      tick(t, fx) {
        if (fx === 'run') K.parts.fan.rotation.y = t * 14;
        spray.visible = fx === 'spray';
      },
    };
  });

  /* ---- Model: tank water heater (gas) ---- */
  TB.model('waterheater', { cam: [2.6, 2.0, 3.0], at: [0, 1.0, 0], hidden: ['hose'] }, (K) => {
    const tank = K.part('tank', [0, 0, 0], null, 'Tank');
    K.cyl(tank, [0.48, 0.48, 1.7, 40], 'offwhite', [0, 1.0, 0]);
    K.cyl(tank, [0.49, 0.49, 0.06, 40], 'grey', [0, 1.88, 0]);
    K.cyl(tank, [0.49, 0.49, 0.15, 40], 'grey', [0, 0.1, 0]);
    K.box(tank, [0.2, 0.3, 0.01], 'yellow', [-0.2, 1.3, 0.48]);
    const sed = K.part('sediment', [0, 0.25, 0], null, 'Sediment layer');
    K.cyl(sed, [0.44, 0.44, 0.1, 30], 'dirt');
    K.cyl(null, [0.08, 0.1, 0.5], 'steel', [0, 2.15, 0]);
    K.tube(null, [[0, 2.4, 0], [0, 2.6, 0], [0, 2.7, -0.6]], 0.1, 'steel');
    const cold = K.part('coldValve', [-0.22, 2.1, 0], null, 'Cold water shutoff');
    K.cyl(cold, [0.04, 0.04, 0.4], 'copper', [0, 0.05, 0]);
    K.box(cold, [0.2, 0.04, 0.05], 'blue', [0, 0.15, 0.05]);
    K.cyl(null, [0.04, 0.04, 0.6], 'copper', [0.22, 2.2, 0]);
    K.cyl(null, [0.04, 0.04, 0.6], 'copper', [-0.22, 2.4, 0]);
    const tp = K.part('tpValve', [0.48, 1.65, 0], null, 'T&P relief valve');
    K.cyl(tp, [0.05, 0.05, 0.14], 'brass', [0.05, 0, 0], [0, 0, 90]);
    K.box(tp, [0.06, 0.02, 0.12], 'brass', [0.1, 0.06, 0]);
    K.tube(tp, [[0.14, 0, 0], [0.2, -0.1, 0], [0.2, -1.4, 0]], 0.03, 'copper');
    const drain = K.part('drain', [0, 0.32, 0.5], null, 'Drain valve');
    K.cyl(drain, [0.035, 0.035, 0.12], 'brass', [0, 0, 0.04], [90, 0, 0]);
    K.cyl(drain, [0.05, 0.05, 0.04], 'brass', [0, 0, 0.12], [90, 0, 0]);
    const gas = K.part('gasControl', [0.18, 0.55, 0.5], null, 'Gas control valve');
    K.box(gas, [0.3, 0.22, 0.1], 'dark');
    const knob = K.part('knob', [0, 0.02, 0.07], gas, 'Temperature / pilot knob');
    K.cyl(knob, [0.06, 0.06, 0.04], 'red', [0, 0, 0], [90, 0, 0]);
    K.tube(null, [[0.33, 0.55, 0.5], [0.7, 0.55, 0.4], [0.9, 0.6, 0]], 0.02, 'brass');
    const access = K.part('access', [-0.15, 0.25, 0.47], null, 'Burner access cover');
    K.box(access, [0.25, 0.15, 0.02], 'grey');
    const hose = K.part('hose', [0, 0.32, 0.62], null, 'Drain hose');
    K.tube(hose, [[0, 0, 0], [0.2, -0.2, 0.3], [0.8, -0.28, 0.5], [1.4, -0.28, 0.4]], 0.04, 'green');
    const bucket = K.part('bucketWater', [1.5, 0.0, 0.4], hose, 'Floor drain');
    K.cyl(bucket, [0.15, 0.15, 0.01], 'dark', [0, -0.31, 0]);
    const flow = K.cyl(hose, [0.025, 0.04, 0.2], K.std(0x9d8a6a, { transparent: true, opacity: 0.8 }), [1.4, -0.28, 0.4]);
    flow.userData.noPick = true;
    return {
      tick(t, fx) {
        flow.visible = fx === 'drain';
        if (flow.visible) flow.scale.y = 0.6 + 0.4 * Math.sin(t * 20);
      },
    };
  });

  TB.category({
    id: 'hvac',
    code: 'HVC',
    name: 'Heating, Cooling & Hot Water',
    domain: 'systems',
    blurb: 'Filters, AC condensers and water heaters',
    repairs: [
      {
        id: 'furnace-filter',
        title: 'Change the furnace / AC filter',
        model: 'furnace',
        level: 1,
        time: '10 min',
        cost: '$8–40',
        summary: 'A clogged filter is the number-one cause of weak airflow, frozen AC coils and short-cycling furnaces. Check it monthly and replace it every 1–3 months.',
        intro: { hi: ['filter'], fx: 'run' },
        safety: ['Turn the system off at the thermostat before pulling the filter so the blower doesn’t pull dust into the equipment.'],
        causes: [['Overdue filter', 'Dust load chokes airflow.'], ['Wrong size', 'Air sneaks around the edges, carrying dust into the coil.'], ['Backwards filter', 'Lower efficiency and the media can collapse.']],
        tools: ['Replacement filter (exact size printed on the old frame)', 'Marker', 'Flashlight', 'Vacuum (optional)'],
        steps: [
          { t: 'Turn the system off', d: 'Set the thermostat to OFF.', why: 'With the blower off, the dust you knock loose stays out of the blower and coil.', v: { cam: [1.6, 1.7, 0.9], at: [1.1, 1.5, -0.74], hi: ['thermostat'] } },
          { t: 'Find the filter slot', d: 'Look between the return duct and the furnace, or behind a return grille in a wall or ceiling.', why: 'The filter always sits on the return (intake) side, before the blower.', v: { cam: [-1.2, 1.6, 2.6], at: [-0.55, 0.7, 0], hi: ['filter'] } },
          { t: 'Slide out the old filter', d: 'Pull it straight out. Read the size off the frame, like 16×25×1.', why: 'Nominal sizes are rounded. Buy the exact printed size, including thickness.', v: { cam: [-1.0, 1.6, 3.0], at: [-0.55, 0.7, 0.8], hi: ['filter', 'dust'], mv: { filter: [0, 0, 1.3] } } },
          { t: 'Check the airflow arrow', d: 'The arrow on the new filter must point toward the furnace, in the direction air travels.', why: 'The filter is built to be stiffer on the downstream side. Backwards, it can bow and let dust through.', v: { cam: [-0.4, 1.5, 2.6], at: [-0.54, 0.8, 1.2], hi: ['newFilter'], show: ['newFilter'], hide: ['filter'] } },
          { t: 'Slide in the new filter', d: 'Push it fully in and close any slot cover. Write today’s date on the frame.', why: 'The date shows at a glance when it’s due next time.', v: { cam: [-1.4, 1.6, 2.6], at: [-0.55, 0.7, 0], hi: ['newFilter'], mv: { newFilter: [0, 0, -1.4] } } },
          { t: 'Turn the system back on', d: 'Return the thermostat to heat or cool and listen for the blower.', why: 'Airflow at the vents should feel noticeably stronger with a fresh filter.', v: { cam: [3.2, 2.4, 3.2], at: [0, 1.1, 0], hi: ['blower'], xray: true, fx: 'run' } },
        ],
        learn: {
          how: 'A forced-air system pulls room air back through return ducts, through the filter, then through the blower. From there air goes across the heat exchanger (heat) or the evaporator coil (AC) and out the supply vents. The filter protects the blower and coil from dust. When it’s clogged, the blower starves for air: heat builds up in a furnace until a safety switch shuts it off, and in summer the AC coil can freeze.',
          specs: [['1″ filter swap', 'every 1–3 months'], ['4–5″ media filter', 'every 6–12 months'], ['Good home rating', 'MERV 8–11'], ['Allergy rating', 'MERV 13']],
          terms: [['MERV', 'Minimum Efficiency Reporting Value. Higher catches finer particles but restricts more air.'], ['Return', 'Ducts that bring room air back to the furnace.'], ['Short cycling', 'Turning on and off too often. A sign of overheating.']],
          mistakes: ['Installing the filter backwards.', 'Using MERV 13+ on a system that wasn’t designed for it.', 'Forgetting a second filter at a wall return grille.'],
          tips: ['Buy a year’s worth at once and set a calendar reminder.', 'With pets, check monthly.'],
        },
        pro: 'The furnace still shuts off after a few minutes with a clean filter, you smell gas, or ice keeps forming on AC lines.',
      },
      {
        id: 'ac-condenser',
        title: 'AC runs but doesn’t cool well',
        model: 'condenser',
        level: 1,
        time: '45 min',
        cost: '$0–20',
        summary: 'The outdoor unit has to dump heat. Dirty fins, leaves and crowded plants trap heat and send efficiency and comfort down.',
        intro: { hi: ['coil', 'debris'], fx: 'run' },
        safety: ['Turn the AC off at the thermostat, then pull the disconnect block outside. The fan can start without warning.', 'Never use a pressure washer. It flattens the fins.', 'Don’t touch the copper lines; one runs hot.'],
        causes: [['Dirty condenser coil', 'Grass clippings, cottonwood fluff and dirt block air through the fins.'], ['Clogged indoor filter', 'Check that first; it’s the cheap fix.'], ['Low refrigerant / failed part', 'Needs a licensed technician.']],
        tools: ['Garden hose with spray nozzle', 'Soft brush', 'Fin comb ($10, optional)', 'Coil cleaner (non-acid, optional)', 'Gloves'],
        steps: [
          { t: 'Shut off power', d: 'Thermostat to OFF, then pull the disconnect block from the box near the unit (or switch off its breaker).', why: 'The thermostat only sends a low-voltage signal. The disconnect cuts the actual 240 V supply.', v: { cam: [2.2, 1.7, 1.0], at: [1.2, 1.2, -1.4], hi: ['disconnect', 'pullout'], mv: { pullout: [0, 0, 0.35] } } },
          { t: 'Clear the area', d: 'Pick up leaves and trim plants back so there’s at least 2 feet of clear space around the unit.', why: 'The unit pulls air in through its sides and blows it up. Plants nearby make it re-breathe its own hot exhaust.', v: { cam: [2.4, 2.2, 2.4], at: [0, 0.3, 0], hi: ['debris'] } },
          { t: 'Brush the fins', d: 'Gently brush loose fluff off the fins, top to bottom.', why: 'Dry debris comes off easier before it gets wet and mats into the fins.', v: { cam: [1.6, 1.2, 2.2], at: [0, 0.7, 0.6], hi: ['coil'], hide: ['debris'] } },
          { t: 'Rinse from the inside out', d: 'Spray gently through the fins. Where you can reach through the top, spray outward so dirt goes back the way it came in.', why: 'Spraying inward just packs dirt deeper into the coil.', v: { cam: [2.6, 2.0, 2.4], at: [0.4, 0.8, 0.4], hi: ['coil', 'hose'], show: ['hose'], fx: 'spray' } },
          { t: 'Straighten bent fins', d: 'Run a fin comb gently along flattened sections.', why: 'Each flattened patch is a dead spot where no air flows.', v: { cam: [1.3, 1.0, 1.8], at: [0, 0.7, 0.6], hi: ['coil'], hide: ['hose'] } },
          { t: 'Restore power and test', d: 'Reinsert the disconnect, wait 5 minutes, then turn the AC on. Air from the top should feel warm.', why: 'The wait lets internal pressures equalize so the compressor isn’t restarted under load.', v: { cam: [3.0, 2.5, 3.2], at: [0, 0.8, 0], hi: ['fan'], mv: { pullout: [0, 0, 0] }, fx: 'run' } },
        ],
        learn: {
          how: 'Your AC moves heat; it doesn’t make cold. Refrigerant picks up heat inside at the evaporator coil, the compressor squeezes it into a hot gas, and the outdoor coil releases that heat to the outside air with help from the fan. If the outdoor coil can’t shed heat, pressures rise, the system works harder, and cooling drops.',
          specs: [['Supply vs return air', '15–20 °F cooler'], ['Clearance around unit', '≥ 2 ft'], ['Clearance above', '≥ 5 ft'], ['Typical voltage', '240 V']],
          terms: [['Condenser', 'Outdoor coil and fan that release heat.'], ['Evaporator', 'Indoor coil that absorbs heat.'], ['Disconnect', 'Outdoor switch box that cuts power to the unit.'], ['Delta-T', 'Temperature difference between return and supply air.']],
          mistakes: ['Pressure-washing the fins.', 'Running the unit right after restoring power.', 'Hiding the unit behind tight shrubs or a fence.'],
          tips: ['Measure delta-T with a cheap thermometer at a return grille and a nearby supply vent. Under 14 °F suggests a pro visit.'],
        },
        pro: 'The fan or compressor won’t start, you hear buzzing with no fan, ice forms on the copper lines, or cooling is still weak after cleaning.',
      },
      {
        id: 'water-heater-flush',
        title: 'Flush a water heater',
        model: 'waterheater',
        level: 2,
        time: '1–1.5 hrs',
        cost: '$0–15',
        summary: 'Sediment settles at the bottom of the tank, causing rumbling, slow heating and early failure. A yearly flush clears it.',
        intro: { hi: ['sediment'], xray: true },
        safety: ['Water at the drain can be 120–140 °F. Let it cool or use care and gloves.', 'Gas units: set the control to PILOT or VACATION. Electric units: turn off the breaker before draining. Elements burn out in seconds if powered while dry.', 'If the drain valve is plastic and old, it can snap. Have a cap ready.'],
        causes: [['Hard water minerals', 'Calcium settles as the water heats.'], ['Never flushed', 'Most tanks never are. Rumbling or popping is the clue.']],
        tools: ['Garden hose', 'Flat screwdriver (for some drain valves)', 'Work gloves', 'Bucket', 'Hose thread cap (spare)'],
        steps: [
          { t: 'Turn the heat off', d: 'Gas: turn the control knob to PILOT. Electric: switch off the breaker.', why: 'Stops the burner or elements from firing while the tank empties.', v: { cam: [1.2, 1.0, 1.6], at: [0.18, 0.55, 0.5], hi: ['knob', 'gasControl'], rt: { knob: [0, 0, 90] } } },
          { t: 'Close the cold supply', d: 'Turn the cold shutoff on top of the tank to closed.', why: 'Stops fresh water from refilling the tank as you drain it.', v: { cam: [1.0, 2.6, 1.4], at: [-0.2, 2.2, 0], hi: ['coldValve'], rt: { coldValve: [0, 90, 0] } } },
          { t: 'Attach the hose to the drain', d: 'Screw a garden hose to the drain valve and run it to a floor drain or outdoors, lower than the valve.', why: 'Gravity does the draining, so the hose end must be lower than the tank bottom.', v: { cam: [1.8, 1.0, 2.2], at: [0.6, 0.2, 0.6], hi: ['drain', 'hose'], show: ['hose'] } },
          { t: 'Open a hot tap and the drain', d: 'Open a hot faucet upstairs to let air in, then open the drain valve.', why: 'Without an air inlet the tank vacuum-locks and barely drains.', v: { cam: [1.8, 1.0, 2.2], at: [0.6, 0.2, 0.6], hi: ['drain'], fx: 'drain', xray: true } },
          { t: 'Stir up the sediment', d: 'When almost empty, open the cold valve for a few seconds at a time to churn the bottom. Repeat until the water runs clear.', why: 'Short bursts of fresh water stir the settled sediment so it washes out the drain.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.4, 0], hi: ['sediment', 'coldValve'], xray: true, fx: 'drain', rt: { coldValve: [0, 0, 0] } } },
          { t: 'Close, refill, relight', d: 'Close the drain, remove the hose, open the cold valve and let the tank fill until the hot tap runs without sputtering. Then restore gas or power.', why: 'Powering an electric heater before the tank is full burns out the elements in seconds.', v: { cam: [2.6, 2.0, 3.0], at: [0, 1.0, 0], hi: ['knob', 'tank'], hide: ['hose', 'sediment'], rt: { knob: [0, 0, 0] } } },
        ],
        learn: {
          how: 'Cold water enters through a dip tube that delivers it to the bottom of the tank. A gas burner below the tank (or electric elements inside it) heats the water, and hot water rises and leaves from the top. Minerals fall out of solution as water heats and collect on the bottom. That layer insulates the water from the burner, wastes energy, and makes popping sounds as steam bubbles burst through it.',
          specs: [['Recommended setpoint', '120 °F'], ['T&P valve opens at', '150 psi / 210 °F'], ['Typical tank life', '8–12 years'], ['Flush interval', 'yearly']],
          terms: [['T&P valve', 'Temperature & Pressure relief valve. A safety valve that must never be capped.'], ['Anode rod', 'Sacrificial metal rod that corrodes instead of the tank.'], ['Dip tube', 'Pipe that delivers cold water to the tank bottom.']],
          mistakes: ['Turning power on with an empty electric tank.', 'Forgetting to open a hot faucet for air.', 'Forcing a stuck plastic drain valve.'],
          tips: ['Check the anode rod every 3 years. Replacing a $30 rod can add years to the tank.'],
        },
        pro: 'You smell gas, the T&P valve drips continuously, water pools under the tank, or the pilot won’t stay lit.',
      },
    ],
  });
})();
