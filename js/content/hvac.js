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
        summary: 'A clogged filter is the most common cause of weak airflow, frozen AC coils and furnaces that shut off early. Check it monthly and change a 1″ filter at least every 3 months, sooner with pets or dust.',
        intro: { hi: ['filter'], fx: 'run' },
        safety: ['Turn the system off at the thermostat before pulling the filter so the blower doesn’t pull dust into the equipment.', 'Never run the system with no filter in place, even for a day. Dust coats the cooling coil and blower and is costly to clean.', 'Wear a dust mask if you have allergies; a full filter sheds fine dust when handled.'],
        causes: [['Overdue filter', 'Dust load chokes airflow, so rooms get less air and the equipment overheats or freezes.'], ['Wrong size', 'Air sneaks around the edges, carrying dust into the coil.'], ['Backwards filter', 'Lower efficiency, and the media can bow and collapse.'], ['Filter too restrictive', 'A high-MERV 1″ filter can starve some blowers. Whistling and weak airflow are the clues.']],
        tools: ['Replacement filter (exact size printed on the old frame, MERV 8–11 pleated)', 'Permanent marker', 'Flashlight', 'Trash bag', 'Vacuum (optional)', 'Dust mask (optional)'],
        steps: [
          { t: 'Turn the system off', d: 'Set the thermostat (the temperature control on the wall) to OFF and its fan setting to AUTO. Within a minute or two you should hear the furnace blower wind down and the air from the vents stop.', why: 'With the blower stopped, the dust you knock loose is not sucked straight into the fan and the cooling coil, and the filter is not pinned in its slot by suction.', tip: 'If air keeps blowing after you pick OFF, the fan is probably set to ON instead of AUTO. Many furnaces also run the blower 1–2 minutes after a cycle to cool down, so give it a moment before you decide something is wrong.', ok: 'The vents go quiet and you feel no air when you hold your hand over a supply vent.', v: { cam: [1.6, 1.7, 0.9], at: [1.1, 1.5, -0.74], hi: ['thermostat'] } },
          { t: 'Find the filter slot', d: 'Follow the big return duct (the duct that carries room air back to the furnace) to where it meets the cabinet. Look there for a narrow slot with a cover, often on the side or bottom. If there is none, look behind large grilles on walls or ceilings; some homes filter there instead, and some do both.', why: 'The filter always sits on the return side, before the blower, so the air is cleaned before it reaches the fan and coils.', tip: 'Still can’t find it? Pull off the lower furnace door: some models hold the filter right beside the blower. Once you find it, snap a photo so the next change takes two minutes.', ok: 'You can see the edge of a filter frame with size numbers printed on it.', v: { cam: [-1.2, 1.6, 2.6], at: [-0.55, 0.7, 0], hi: ['filter'] } },
          { t: 'Slide out the old filter', d: 'Pull it straight out slowly so the dust stays on it. Read the size printed on the frame, for example 16×25×1 (width × height × thickness in inches), and take a photo of it. Notice how gray the intake side is.', why: 'Printed sizes are rounded “nominal” sizes. Buying exactly that printed size, thickness included, gives a snug fit with no gaps for dust to sneak around.', tip: 'Slip a trash bag over the filter as it comes out so the dust doesn’t fall on the floor. If it’s stuck, it is usually bowed from suction: wiggle it side to side instead of yanking.', ok: 'You have all three size numbers written down or photographed, and the slot is empty.', v: { cam: [-1.0, 1.6, 3.0], at: [-0.55, 0.7, 0.8], hi: ['filter', 'dust'], mv: { filter: [0, 0, 1.3] } } },
          { t: 'Check the airflow arrow', d: 'Find the arrow printed on the edge of the new filter. Hold the filter up to the slot so the arrow points toward the furnace, the same way the air travels: away from the return duct, toward the blower.', why: 'Filters have a stiffer wire or mesh backing on the downstream side. Put in backwards, the media can bow, pull loose from the frame and let dust through.', tip: 'Draw a big arrow on the furnace cabinet beside the slot with a permanent marker, pointing toward the blower, plus the filter size. Next time there’s nothing to figure out.', ok: 'The arrow on the new filter points into the furnace, not back toward the return duct.', v: { cam: [-0.4, 1.5, 2.6], at: [-0.54, 0.8, 1.2], hi: ['newFilter'], show: ['newFilter'], hide: ['filter'] } },
          { t: 'Slide in the new filter', d: 'Push it in until it stops, arrow still pointing at the furnace, and close the slot cover. It should slide in with light hand pressure, not force. Write today’s date on the frame with a marker.', why: 'The cover stops unfiltered air from being sucked in around the filter. The date tells you at a glance how old it is.', tip: 'If it won’t fit, don’t bend or trim it. You likely bought the wrong thickness or the two big numbers are swapped. Return it for the exact printed size.', ok: 'The filter sits flat with no gaps along its edges, and the cover closes fully.', v: { cam: [-1.4, 1.6, 2.6], at: [-0.55, 0.7, 0], hi: ['newFilter'], mv: { newFilter: [0, 0, -1.4] } } },
          { t: 'Turn the system back on', d: 'Set the thermostat back to HEAT or COOL and adjust the temperature so it calls for it. Within a few minutes the blower should start. Hold your hand over a supply vent to feel the air.', why: 'A clean filter lets the blower move its full design airflow, so the furnace doesn’t overheat and the AC coil doesn’t freeze.', tip: 'Set a phone reminder for 30 days. Pull the filter and hold it up to a bright light: if you can barely see light through it, change it, even if the package says it lasts 3 months.', ok: 'You hear the blower running, feel steady air at the vents, and hear no whistling at the filter slot.', v: { cam: [3.2, 2.4, 3.2], at: [0, 1.1, 0], hi: ['blower'], xray: true, fx: 'run' } },
        ],
        tricks: [
          ['Buy a year at a time', 'Filters cost far less in 4- or 6-packs. Buy a year’s supply in the exact size so you’re never tempted to stretch an old one.'],
          ['Trust the light test', 'Each month, hold the filter up to a bright light. If light barely shows through, change it now, whatever the package says.'],
          ['MERV 8–11 suits most homes', 'MERV 8–11 pleated filters catch dust, pollen and pet hair without starving a typical blower. Go up to MERV 13 only if the furnace manual or a technician says it can handle it, and then change it more often.'],
          ['Skip the blue fiberglass', 'The cheap see-through fiberglass filters only stop big debris to protect the blower. A pleated filter costs a few dollars more and actually cleans the air.'],
          ['Consider a 4″ media cabinet', 'If you’re changing a 1″ filter every month, ask an HVAC tech about a 4–5″ media filter cabinet. It has far more surface, restricts air less and lasts 6–12 months.'],
          ['Whistling means trouble', 'A whistle at the filter slot means air is squeezing around a gap or the filter is too restrictive. Check that the cover is closed, then try one MERV step lower.'],
          ['Check every return', 'Homes with filter grilles in several rooms need every one changed. Missing one lets dirty air bypass the others.'],
        ],
        refs: [
          ['Heating & Cooling Maintenance Checklist (ENERGY STAR)', 'https://www.energystar.gov/saveathome/heating-cooling/maintenance-checklist'],
          ['ENERGY STAR Homeowner Manual (EPA)', 'https://www.energystar.gov/sites/default/files/tools/ES_Homeowner_Manual.pdf'],
          ['Air Cleaning Allies: HVAC filters and MERV 13 (EPA)', 'https://www.epa.gov/system/files/documents/2023-10/combined_air_cleaning_allies.pdf'],
        ],
        learn: {
          how: 'A forced-air system pulls room air back through return ducts, through the filter, then through the blower. From there air goes across the heat exchanger (heat) or the evaporator coil (AC) and out the supply vents. The filter protects the blower and coil from dust. When it’s clogged, the blower starves for air: heat builds up in a furnace until a safety switch shuts it off, and in summer the AC coil can freeze.',
          specs: [['Check filter', 'monthly (ENERGY STAR)'], ['1″ filter swap', 'every 1–3 months, at least every 3'], ['4–5″ media filter', 'every 6–12 months'], ['Good home rating', 'MERV 8–11'], ['Allergy / smoke rating', 'MERV 13 if the system can handle it (EPA)'], ['Filter size format', 'width × height × thickness, inches']],
          terms: [['MERV', 'Minimum Efficiency Reporting Value. Higher catches finer particles but restricts more air.'], ['Return', 'Ducts that bring room air back to the furnace.'], ['Short cycling', 'Turning on and off too often. A sign of overheating.']],
          mistakes: ['Installing the filter backwards.', 'Using MERV 13+ on a system that wasn’t designed for it, then not changing it more often.', 'Forgetting a second filter at a wall return grille.', 'Running the system with the filter slot cover off.'],
          tips: ['Buy a year’s worth at once and set a calendar reminder.', 'With pets, check monthly.'],
        },
        pro: 'The furnace still shuts off after a few minutes with a clean filter, airflow stays weak, you smell gas, or ice keeps forming on the AC lines or indoor coil.',
      },
      {
        id: 'ac-condenser',
        title: 'AC runs but doesn’t cool well',
        model: 'condenser',
        level: 1,
        time: '45 min',
        cost: '$0–20',
        summary: 'The outdoor unit’s job is to dump the heat pulled out of your house. Dirty fins, leaves and crowded plants trap that heat, so cooling drops and the bill climbs. A yearly gentle cleaning fixes most of it.',
        intro: { hi: ['coil', 'debris'], fx: 'run' },
        safety: ['Turn the AC off at the thermostat, then pull the disconnect block outside. The fan can start without warning.', 'Never open the electrical panel on the unit. Its capacitor can hold a dangerous charge even with power off.', 'Never use a pressure washer. It flattens the fins.', 'Don’t touch the copper lines while running; the small one gets hot.', 'Fins are sharp. Wear gloves.'],
        causes: [['Dirty condenser coil', 'Grass clippings, cottonwood fluff and dirt block air through the fins.'], ['Clogged indoor filter', 'Check that first; it’s the cheap fix.'], ['Crowded unit', 'Shrubs, fences or a deck too close recirculate hot air.'], ['Low refrigerant / failed part', 'A leak, weak capacitor or failing fan motor needs a licensed technician.']],
        tools: ['Garden hose with shower-setting nozzle', 'Soft brush or shop vac with brush tip', 'Fin comb ($10, optional)', 'Foaming non-acid coil cleaner (optional)', 'Work gloves', 'Pruning shears', 'Two thermometers or one probe thermometer'],
        steps: [
          { t: 'Shut off the power', d: 'Set the thermostat to OFF. At the gray box on the wall near the outdoor unit (the disconnect), lift the cover and pull the block straight out by its handle, or flip its lever to OFF. No disconnect? Switch off the AC’s double-width breaker in the main panel.', why: 'The thermostat only sends a weak 24-volt signal. The disconnect cuts the 240 volts that run the fan and compressor, so nothing can start while your hands are near it.', tip: 'Before pulling the block, notice which way it faces: many are marked ON on one side and OFF on the other, and putting it back the wrong way leaves the AC dead. Keep it in your pocket while you work.', ok: 'The fan blades sit still and the unit makes no hum or buzz.', v: { cam: [2.2, 1.7, 1.0], at: [1.2, 1.2, -1.4], hi: ['disconnect', 'pullout'], mv: { pullout: [0, 0, 0.35] } } },
          { t: 'Clear around the unit', d: 'Pick up leaves, sticks and grass clippings around the base and on top. Trim shrubs, weeds and vines back so there are at least 2′ of open space on every side and nothing within 5′ above the top.', why: 'The unit pulls air in through its side coils and blows hot air out the top. Plants or a fence too close make it breathe its own hot exhaust, and cooling drops.', tip: 'Lay a tarp on the ground before you trim so clippings don’t fall into the fins. Pull vines out gently by hand; yanking can drag the fins with them.', ok: 'You can walk all the way around the unit with 2′ of clear space, and nothing hangs over it.', v: { cam: [2.4, 2.2, 2.4], at: [0, 0.3, 0], hi: ['debris'] } },
          { t: 'Brush the fins', d: 'Look at the side coil: thousands of thin aluminum fins. Using a soft brush (a clean paintbrush or a coil brush), stroke gently up and down, the same direction the fins run, to lift off fluff, dust and grass. A shop vac with a brush tip also works.', why: 'Dry fluff peels off in sheets. Once it gets wet it mats into the fins and is much harder to remove.', tip: 'Never brush side to side across the fins; that folds them over like a comb dragged the wrong way. If a patch does get bent, the fin comb in a later step fixes it.', ok: 'The fins look shiny metal gray instead of fuzzy, brown or matted.', v: { cam: [1.6, 1.2, 2.2], at: [0, 0.7, 0.6], hi: ['coil'], hide: ['debris'] } },
          { t: 'Rinse from the inside out', d: 'Set a hose nozzle to a gentle shower, never a jet. Spray down through the top grille so the water passes out through the coil, then lightly rinse the outside, aiming straight in, not at an angle. Keep the spray away from the electrical box on the side.', why: 'Air and dirt enter from the outside. Spraying from inside pushes dirt back out the way it came; blasting from outside packs it deeper.', tip: 'For a greasy or dusty coil, spray a foaming non-acid coil cleaner on the outside, wait the time on the label (usually 5–10 minutes), then rinse. Never use a pressure washer; it flattens fins instantly.', ok: 'The water running off the base turns from brown to clear, and the coil looks evenly clean all around.', v: { cam: [2.6, 2.0, 2.4], at: [0.4, 0.8, 0.4], hi: ['coil', 'hose'], show: ['hose'], fx: 'spray' } },
          { t: 'Straighten bent fins', d: 'Find flattened patches. Pick the side of the fin comb whose teeth match your fins (count fins in one inch). Slide the teeth in just above the damage and draw the comb gently down along the fins, a little at a time.', why: 'Each flattened patch is a dead spot that air can’t pass through.', tip: 'Start in straight fins and work into the damage; jamming the comb straight into crushed fins tears them. For a tiny patch, a plastic putty knife or butter knife slid between fins works too.', ok: 'The repaired patch shows evenly spaced slots that match the fins around it.', v: { cam: [1.3, 1.0, 1.8], at: [0, 0.7, 0.6], hi: ['coil'], hide: ['hose'] } },
          { t: 'Restore power and test', d: 'Push the disconnect block back in the ON direction and close the cover. Wait 5 minutes, then set the thermostat to cool. The fan should spin within a minute and the air rising off the top should feel warm. After 15 minutes, compare air temperature at a return grille and a nearby supply vent.', why: 'The wait lets the compressor’s built-in delay reset and the internal pressures even out. The temperature difference (split) tells you whether it’s really cooling.', tip: 'A healthy split is about 16–22 °F. Under about 14 °F with a clean indoor filter, or ice on the big copper line, means it’s time for a licensed technician.', ok: 'The fan turns, warm air blows out the top, and supply air is 16–22 °F cooler than the return air.', v: { cam: [3.0, 2.5, 3.2], at: [0, 0.8, 0], hi: ['fan'], mv: { pullout: [0, 0, 0] }, fx: 'run' } },
        ],
        tricks: [
          ['Check the indoor filter first', 'A clogged furnace filter causes weak cooling and frozen coils more often than a dirty outdoor unit. It’s a 5-minute check.'],
          ['Clean once a year, in spring', 'Do this before the first hot week, and again after cottonwood or pollen season if trees shed fluff nearby.'],
          ['Mow with the chute aimed away', 'Point the mower’s discharge away from the unit so grass doesn’t blast into the fins.'],
          ['Top-only winter cover', 'In winter, a weighted piece of plywood on top keeps leaves and ice out. Full wraparound covers trap moisture and invite mice; never run the AC covered.'],
          ['Feel the big copper line', 'After 15 minutes of cooling, the larger insulated copper line should feel cold and sweaty. Ice on it, or a warm line, means call a technician.'],
          ['Buy a multi-size fin comb', 'A $10 plastic fin comb with several tooth spacings fits almost every home unit.'],
          ['Refrigerant is pro-only', 'Adding refrigerant legally requires EPA Section 608 certification. If a unit needs “topping off” every year, it has a leak that should be found and fixed.'],
        ],
        refs: [
          ['Clearance distances for outdoor HVAC units: Carrier and Trane manuals (InspectAPedia)', 'https://inspectapedia.com/aircond/HVAC_Clearance_Distances.php'],
          ['What should the air delta-T be? (HVAC School)', 'https://www.hvacrschool.com/what-should-the-air-delta-t-be-air-temperature-split'],
          ['Heating & Cooling Maintenance Checklist (ENERGY STAR)', 'https://www.energystar.gov/saveathome/heating-cooling/maintenance-checklist'],
          ['How to clean condenser coils (Simple Green)', 'https://simplegreen.com/nz/household/cleaning-tips/outdoors/hvac-condenser-coils'],
          ['Trane split-system outdoor unit installation literature (Trane Technologies)', 'https://elibrary.tranetechnologies.com/public/trane-history/Literature/Installation/2TTR2-IN-1B_03012003'],
        ],
        learn: {
          how: 'Your AC moves heat; it doesn’t make cold. Refrigerant picks up heat inside at the evaporator coil, the compressor squeezes it into a hot gas, and the outdoor coil releases that heat to the outside air with help from the fan. If the outdoor coil can’t shed heat, pressures rise, the system works harder, and cooling drops.',
          specs: [['Supply vs return air (split)', '16–22 °F cooler'], ['Side clearance', '12″ minimum per many manuals; 2′ recommended'], ['Clearance above', '≥ 4–5′ open (Carrier 48″, Trane 5′)'], ['Wait before restart', '5 min'], ['Typical voltage', '240 V']],
          terms: [['Condenser', 'Outdoor coil and fan that release heat.'], ['Evaporator', 'Indoor coil that absorbs heat.'], ['Disconnect', 'Outdoor switch box that cuts power to the unit.'], ['Delta-T', 'Temperature difference between return and supply air.']],
          mistakes: ['Pressure-washing the fins.', 'Running the unit right after restoring power.', 'Hiding the unit behind tight shrubs or a fence.'],
          tips: ['Measure delta-T with a cheap thermometer at a return grille and a nearby supply vent. Under about 14 °F suggests a pro visit.', 'Hose off the coil any time you see it fuzzy with fluff, not just once a year.'],
        },
        pro: 'The fan or compressor won’t start, you hear buzzing with no fan (often a failed capacitor), ice forms on the copper lines, the breaker trips, or cooling is still weak after cleaning. Refrigerant work requires an EPA 608-certified technician.',
      },
      {
        id: 'water-heater-flush',
        title: 'Flush a water heater',
        model: 'waterheater',
        level: 2,
        time: '1–1.5 hrs',
        cost: '$0–15',
        summary: 'Minerals in the water settle at the bottom of the tank, causing rumbling, slow heating and early failure. Draining a few gallons through the bottom valve once a year flushes them out.',
        intro: { hi: ['sediment'], xray: true },
        safety: ['Water at the drain can be 120–140 °F, hot enough to scald in seconds. Let it cool or wear gloves and keep the hose end secured.', 'Gas units: set the control to PILOT or VACATION. Electric units: turn off the breaker before draining. Elements burn out in seconds if powered while dry.', 'If the drain valve is plastic and old, it can snap. Have a hose cap ready and know where the house main shutoff is.', 'If you smell gas at any point, stop, leave the house and call the gas company from outside.'],
        causes: [['Hard water minerals', 'Calcium settles as the water heats.'], ['Never flushed', 'Most tanks never are. Rumbling or popping is the clue.'], ['Slow recovery', 'Sediment insulates the bottom from the burner, so the tank takes longer to reheat.']],
        tools: ['Garden hose (rubber, long enough to reach a drain)', 'Flat screwdriver (for some drain valves)', 'Work gloves', 'Bucket and a clear jar', 'Brass hose cap with washer (spare)', 'Flashlight'],
        steps: [
          { t: 'Turn the heat off', d: 'Find the gas control box near the bottom of the tank. Note or photograph the knob’s setting, then turn it to PILOT or VACATION so the main burner can’t fire. For a full shutdown, turn it to OFF instead.', why: 'Firing the burner while the tank empties wastes gas and can overheat the tank bottom. PILOT keeps the small pilot flame lit so you don’t have to relight it.', tip: 'Turn it down the night before so the water cools. Warm water drains just as well and is far kinder to hands, hoses and the floor drain than 120–140 °F water.', ok: 'The burner’s roar stops (if it was running) and the knob points at PILOT or VAC.', v: { cam: [1.2, 1.0, 1.6], at: [0.18, 0.55, 0.5], hi: ['knob', 'gasControl'], rt: { knob: [0, 0, 90] } } },
          { t: 'Close the cold supply', d: 'Find the shutoff on the cold pipe at the top of the tank, often marked blue. Turn a lever handle 90° so it crosses the pipe, or turn a round handle clockwise until it stops.', why: 'This stops fresh water from rushing in and refilling the tank while you drain it.', tip: 'Not sure which pipe is cold? The hot outlet pipe feels warm. If an old round handle won’t turn by hand, don’t force it with a wrench; old valves can break. Shut the house main valve instead.', ok: 'The lever sits crosswise to the pipe, or the round handle won’t turn any farther clockwise.', v: { cam: [1.0, 2.6, 1.4], at: [-0.2, 2.2, 0], hi: ['coldValve'], rt: { coldValve: [0, 90, 0] } } },
          { t: 'Attach the hose to the drain', d: 'Screw a garden hose onto the threaded drain valve near the bottom of the tank, hand-tight. Run the other end to a floor drain or outside, to a spot lower than the valve where hot water can’t hurt plants, pets or people.', why: 'The tank drains by gravity, so the hose has to run downhill the whole way.', tip: 'Use an old rubber hose; hot water softens cheap vinyl. Check that the hose end has a rubber washer, and weigh the outdoor end down with a brick so it can’t whip around.', ok: 'The hose runs downhill with no high loops, and the far end is secured over a drain or safe ground.', v: { cam: [1.8, 1.0, 2.2], at: [0.6, 0.2, 0.6], hi: ['drain', 'hose'], show: ['hose'] } },
          { t: 'Open a hot tap, then the drain', d: 'Open a hot faucet somewhere in the house all the way. Then open the drain valve by turning its handle counterclockwise, or by turning the slot with a flat screwdriver on a valve with no handle. Water should flow strongly out the hose.', why: 'The open faucet lets air into the tank to replace the water. Without it the tank forms a vacuum and drains at a trickle.', tip: 'If the flow is weak, sediment may be blocking the valve: open and close it a few times quickly to break the plug. If an old plastic valve feels like it will crack, stop and call a plumber.', ok: 'Steady water pours from the hose end, often cloudy or carrying white flakes at first.', v: { cam: [1.8, 1.0, 2.2], at: [0.6, 0.2, 0.6], hi: ['drain'], fx: 'drain', xray: true } },
          { t: 'Stir up the sediment', d: 'When the flow slows near empty, open the cold valve for 10–20 seconds, then close it. That rush churns the crust on the bottom so it washes out. Repeat until the water runs clear.', why: 'Sediment lies in a crusty layer that won’t drain on its own; the burst of cold water lifts it so the drain can carry it out.', tip: 'Catch a sample in a clear jar each round: when nothing settles to the bottom after a minute, you’re done. If flakes clog the drain, close it, take off the hose and crack the valve into a bucket to clear it.', ok: 'A jar of drain water looks clear and no sand or flakes settle at the bottom.', v: { cam: [2.2, 1.6, 2.4], at: [0, 0.4, 0], hi: ['sediment', 'coldValve'], xray: true, fx: 'drain', rt: { coldValve: [0, 0, 0] } } },
          { t: 'Close, refill and relight', d: 'Close the drain valve and remove the hose. Open the cold valve fully. Leave the hot faucet open until it runs a smooth stream with no spitting air, then close it. Turn the gas knob back to your old setting, about 120 °F.', why: 'A full tank protects the bottom from overheating, and purging the air stops sputtering taps. 120 °F is the setting the CPSC recommends to prevent scald burns.', tip: 'If the drain valve drips after closing, screw a brass hose cap with a rubber washer onto it. If the pilot went out, relight it exactly as the label on the tank describes.', ok: 'The hot tap runs smooth, the drain valve is dry, and you hear the burner light within a few minutes.', v: { cam: [2.6, 2.0, 3.0], at: [0, 1.0, 0], hi: ['knob', 'tank'], hide: ['hose', 'sediment'], rt: { knob: [0, 0, 0] } } },
        ],
        tricks: [
          ['Let it cool overnight', 'Turn the heat to PILOT or VACATION the night before and run hot water normally. By morning the tank is warm, not scalding.'],
          ['Start with a mini-flush', 'If you’re not sure the old drain valve will survive, just open it for 30 seconds into a bucket each month. It clears loose sediment with little risk.'],
          ['Old valve? Plan an upgrade', 'A cheap plastic drain valve can be swapped for a full-port brass ball-valve drain (about $15–25) the next time the tank is empty. It drains faster and passes sediment without clogging.'],
          ['Test the T&P valve too', 'While you’re there, lift the T&P relief valve lever for 3 seconds with a bucket under its pipe. Water should gush, then stop when released. A drip that won’t quit means replace the valve.'],
          ['Hard water means twice a year', 'If you see white crust on faucets and showerheads, flush every 6 months instead of yearly.'],
          ['10+ years, never flushed?', 'An old tank that has never been flushed can start leaking once its sediment plug is disturbed. Ask a plumber to look at it before you flush, and start budgeting for a replacement.'],
          ['Check the anode every 3 years', 'The anode rod corrodes so the tank doesn’t. When it’s down to bare wire, a $30–50 replacement adds years to the tank.'],
        ],
        refs: [
          ['How to drain a water heater (A.O. Smith)', 'https://www.hotwater.com/info-center/how-to-drain-a-water-heater.html'],
          ['Tap Water Scalds safety alert, set to 120 °F (CPSC)', 'https://www.cpsc.gov/s3fs-public/5098-Tap-Water-Scalds.pdf'],
          ['Sensei enhanced flush procedure TB-188 (Rinnai)', 'https://media.rinnai.us/salsify_asset/s-9d6a83e9-c52a-47d5-83f9-b3a459b7b79d/TB-188%20Sensei%20Enhanced%20Flush%20Procedure.pdf'],
          ['Vinegar flush procedure for continuous-flow heaters (Rinnai NZ)', 'https://rinnai.co.nz/media/kk4bq5dr/inf-vinegar-flush-procedure-01-15.pdf'],
          ['Rheem 4500 W 240 V screw-in element spec (SupplyHouse)', 'https://www.supplyhouse.com/Rheem-SP10552ML-4500W-Copper-Element-240V'],
        ],
        learn: {
          how: 'Cold water enters through a dip tube that delivers it to the bottom of the tank. A gas burner below the tank (or electric elements inside it) heats the water, and hot water rises and leaves from the top. Minerals fall out of solution as water heats and collect on the bottom. That layer insulates the water from the burner, wastes energy, and makes popping sounds as steam bubbles burst through it.',
          specs: [['Recommended setpoint', '120 °F (CPSC)'], ['T&P valve opens at', '150 psi / 210 °F'], ['Typical tank life', '8–12 years'], ['Flush interval', 'yearly; every 6 months with hard water'], ['Anode check', 'every 2–3 years'], ['Scald time at 140 °F', 'about 6 seconds (CPSC)']],
          terms: [['T&P valve', 'Temperature & Pressure relief valve. A safety valve that must never be capped.'], ['Anode rod', 'Sacrificial metal rod that corrodes instead of the tank.'], ['Dip tube', 'Pipe that delivers cold water to the tank bottom.']],
          mistakes: ['Turning power on with an empty electric tank.', 'Forgetting to open a hot faucet for air.', 'Forcing a stuck plastic drain valve.'],
          tips: ['Check the anode rod every 3 years. Replacing a $30 rod can add years to the tank.', 'Write the flush date on a piece of tape on the tank.'],
        },
        pro: 'You smell gas, the T&P valve drips continuously, water pools under the tank, or the pilot won’t stay lit.',
      },
    ],
  });
})();
