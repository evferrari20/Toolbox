/* PRV · Private garden (hidden until unlocked on this device; see app.js). */
(function () {
  /* Serrated leaflet outline, length L, width W. */
  function leaflet(L, W, teeth) {
    const pts = [];
    const n = teeth * 2;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const w = Math.sin(Math.PI * t) * W * (1 - 0.35 * t);
      const tooth = i % 2 ? 1 : 0.82;
      pts.push([w * tooth, t * L]);
    }
    for (let i = n; i >= 0; i--) {
      const t = i / n;
      const w = Math.sin(Math.PI * t) * W * (1 - 0.35 * t);
      const tooth = i % 2 ? 1 : 0.82;
      pts.push([-w * tooth, t * L]);
    }
    return pts;
  }

  // Palmate fan leaf (5–7 leaflets) on a petiole.
  function fanLeaf(K, parent, size, mat) {
    const g = K.group(parent);
    K.bar(g, [0, 0, 0], [0, 0.02 * size, 0.22 * size], 0.006 * size, 'green');
    const tip = K.group(g, [0, 0.02 * size, 0.22 * size], [-70, 0, 0]);
    const spec = [[0, 1], [28, 0.85], [-28, 0.85], [56, 0.62], [-56, 0.62], [84, 0.38], [-84, 0.38]];
    spec.forEach(([a, k]) => {
      const lf = K.group(tip, [0, 0, 0], [0, 0, a]);
      K.ext(lf, leaflet(0.3 * size * k, 0.035 * size * k, 9), 0.002, mat, [0, 0, -0.001], null, 0);
    });
    return g;
  }

  /* ---- Model: grow tent with one cannabis plant ---- */
  TB.model(
    'growtent',
    { cam: [2.2, 1.8, 2.6], at: [0, 0.9, 0], unit: 1, env: 'studio', tex: ['plank_flooring', 'white_plaster_02'], ground: { tex: 'plank_flooring', repeat: 5, radius: 6 },
      hidden: ['seedling', 'veg', 'flower', 'jars', 'hang', 'loupe'] },
    (K) => {
      const leafMat = K.std(0x3f8f3a, { roughness: 0.6, side: THREE.DoubleSide });
      const leafDark = K.std(0x2f7230, { roughness: 0.6, side: THREE.DoubleSide });
      const budMat = K.bumpy(0x8fae5a, TB.tex.speckle(), 0.02, { roughness: 0.9 });
      const hairMat = K.std(0xd98a3a, { roughness: 0.9 });
      K.box(null, [3.4, 2.6, 0.06], K.pbr('white_plaster_02', [2, 2], {}, 'drywall'), [0, 1.3, -1.2]);
      // tent frame and reflective walls (front open)
      const tent = K.part('tent', [0, 0, 0], null, 'Grow tent (2×2 ft–4×4 ft)');
      const fab = K.std(0xd7dbe0, { metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide });
      K.box(tent, [1.2, 1.8, 0.01], fab, [0, 0.9, -0.6]);
      K.box(tent, [0.01, 1.8, 1.2], fab, [-0.6, 0.9, 0]);
      K.box(tent, [0.01, 1.8, 1.2], fab, [0.6, 0.9, 0]);
      K.box(tent, [1.2, 0.01, 1.2], fab, [0, 1.8, 0]);
      [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([x, z]) => K.cyl(tent, [0.012, 0.012, 1.8, 8], 'black', [x, 0.9, z]));
      const light = K.part('light', [0, 1.55, 0], null, 'Full-spectrum LED light');
      K.box(light, [0.8, 0.04, 0.6], K.std(0x2b2e31, { metalness: 0.6, roughness: 0.4 }));
      const panel = K.box(light, [0.76, 0.01, 0.56], K.std(0xffffff, { emissive: 0xfff2dc, emissiveIntensity: 1.2 }), [0, -0.025, 0]);
      const lamp = new THREE.SpotLight(0xfff4e0, 2.2, 3, Math.PI / 3, 0.6, 1.5);
      lamp.position.set(0, -0.05, 0);
      lamp.target.position.set(0, -1.5, 0);
      light.add(lamp, lamp.target);
      const fan = K.part('fan', [0.45, 1.3, -0.45], null, 'Clip fan + carbon filter exhaust');
      K.cyl(fan, [0.1, 0.1, 0.04, 24], 'black', [0, 0, 0], [70, 30, 0]);
      K.cyl(null, [0.1, 0.1, 0.35, 24], 'black', [-0.3, 1.65, -0.35], [0, 0, 90]);
      const pot = K.part('pot', [0, 0, 0], null, '5-gal fabric pot, quality soil');
      K.cyl(pot, [0.17, 0.15, 0.3, 32], K.bumpy(0x2a2b2c, TB.tex.weave(), 0.01, { roughness: 1 }), [0, 0.15, 0]);
      K.cyl(pot, [0.165, 0.165, 0.02, 32], 'dirt', [0, 0.29, 0]);
      const saucer = K.cyl(null, [0.2, 0.2, 0.02, 32], 'black', [0, 0.01, 0]);
      saucer.userData.noPick = true;

      const seedling = K.part('seedling', [0, 0.3, 0], null, 'Seedling (week 1–3)');
      K.bar(seedling, [0, 0, 0], [0, 0.08, 0], 0.004, 'green');
      [0, 120, 240].forEach((r) => fanLeaf(K, K.group(seedling, [0, 0.07, 0], [0, r, 0]), 0.25, leafMat));

      // vegetative plant: main stem, nodes with paired fan leaves
      function plant(name, label, h, flowering) {
        const p = K.part(name, [0, 0.3, 0], null, label);
        K.cyl(p, [0.01, 0.018, h, 10], K.std(0x6f8f3a, { roughness: 0.7 }), [0, h / 2, 0]);
        const nodes = 6;
        for (let i = 0; i < nodes; i++) {
          const y = 0.12 + (i / nodes) * (h - 0.15);
          const rot = i * 90;
          const sz = 1.0 - i * 0.08;
          [0, 180].forEach((o) => {
            const node = K.group(p, [0, y, 0], [0, rot + o, 0]);
            fanLeaf(K, node, sz, i % 2 ? leafMat : leafDark);
            // side branch
            if (i < nodes - 1) {
              const br = K.group(node, [0, 0, 0], [-35, 0, 0]);
              K.cyl(br, [0.005, 0.008, 0.28 * sz, 8], 'green', [0, 0.14 * sz, 0]);
              if (flowering) {
                const cola = K.group(br, [0, 0.28 * sz, 0], [35, 0, 0]);
                K.sph(cola, 0.035, budMat, [0, 0.03, 0], [1, 1.9, 1]);
                K.rep(6, (k) => K.bar(cola, [0, 0.03 + k * 0.012, 0], [Math.cos(k) * 0.035, 0.04 + k * 0.012, Math.sin(k) * 0.035], 0.0018, hairMat));
              }
            }
          });
        }
        if (flowering) {
          const top = K.group(p, [0, h, 0]);
          K.sph(top, 0.05, budMat, [0, 0.07, 0], [1, 2.4, 1]);
          K.rep(14, (k) => K.bar(top, [0, 0.04 + k * 0.01, 0], [Math.cos(k * 1.7) * 0.05, 0.05 + k * 0.01, Math.sin(k * 1.7) * 0.05], 0.002, hairMat));
        }
        return p;
      }
      plant('veg', 'Vegetative plant (18/6 light)', 0.75, false);
      plant('flower', 'Flowering plant (12/12 light)', 0.95, true);

      const loupe = K.part('loupe', [0.25, 1.1, 0.35], null, '60× jeweler’s loupe (check trichomes)');
      K.cyl(loupe, [0.03, 0.03, 0.03, 20], 'black', [0, 0, 0], [90, 0, 0]);
      K.cyl(loupe, [0.026, 0.026, 0.032, 20], 'glass', [0, 0, 0], [90, 0, 0]);
      const hang = K.part('hang', [0, 0, 0], null, 'Branches hanging to dry (60°F / 60% RH)');
      K.bar(hang, [-0.5, 1.4, 0.2], [0.5, 1.4, 0.2], 0.004, 'steel');
      [-0.35, -0.1, 0.15, 0.4].forEach((x) => {
        const b = K.group(hang, [x, 1.4, 0.2], [180, 0, 0]);
        K.cyl(b, [0.004, 0.006, 0.3, 6], 'green', [0, 0.15, 0]);
        K.sph(b, 0.04, budMat, [0, 0.22, 0], [1, 1.8, 1]);
      });
      const jars = K.part('jars', [0, 0, 0], null, 'Curing jars + 62% humidity packs');
      [-0.25, 0, 0.25].forEach((x) => {
        const j = K.group(jars, [x, 0, 0.75]);
        K.cyl(j, [0.07, 0.07, 0.2, 24], 'glass', [0, 0.1, 0]);
        K.cyl(j, [0.072, 0.072, 0.03, 24], 'steel', [0, 0.21, 0]);
        K.sph(j, 0.05, budMat, [0, 0.07, 0], [1.1, 1.2, 1.1]);
      });
      return {
        tick(t, fx) {
          const on = fx !== 'dark';
          panel.material.emissiveIntensity = on ? 1.2 : 0;
          lamp.intensity = on ? 2.2 : 0;
          K.parts.fan.rotation.z = t * 10;
        },
      };
    }
  );

  /* ---- Model: mushroom monotub workflow ---- */
  TB.model(
    'monotub',
    { cam: [1.9, 1.5, 2.1], at: [0, 0.35, 0], unit: 1, env: 'studio', tex: ['plank_flooring'], ground: { tex: 'plank_flooring', repeat: 5, radius: 6 },
      hidden: ['syringe', 'grain', 'colonized', 'tub', 'substrate', 'pins', 'fruits', 'dried', 'still'] },
    (K) => {
      const myc = K.bumpy(0xf3f1ea, TB.tex.weave(), 0.01, { roughness: 1 });
      const capMat = K.std(0xb07a42, { roughness: 0.7 });
      const stemMat = K.std(0xf0ece2, { roughness: 0.8 });
      K.box(null, [1.6, 0.04, 0.8], 'woodLight', [0, 0.6, -0.6]);
      // still air box on the bench
      const still = K.part('still', [0, 0.62, -0.6], null, 'Still-air box (clear tote with arm holes)');
      K.box(still, [0.7, 0.4, 0.45], K.phys(0xe8f4ff, { transparent: true, opacity: 0.25, roughness: 0.05 }), [0, 0.2, 0], null, 0.03);
      K.tor(still, [0.07, 0.01, 360], 'grey', [-0.16, 0.2, 0.226]);
      K.tor(still, [0.07, 0.01, 360], 'grey', [0.16, 0.2, 0.226]);
      const syr = K.part('syringe', [0.1, 0.72, -0.6], null, 'Spore syringe / liquid culture');
      K.cyl(syr, [0.012, 0.012, 0.16, 12], K.phys(0xf5f5f5, { transparent: true, opacity: 0.6 }), [0, 0, 0], [0, 0, 70]);
      K.cyl(syr, [0.002, 0.002, 0.05, 6], 'chrome', [-0.1, -0.035, 0], [0, 0, 70]);
      const grain = K.part('grain', [-0.3, 0.62, -0.6], null, 'Sterilized grain jars');
      [-0.1, 0.1].forEach((x) => {
        K.cyl(grain, [0.06, 0.06, 0.18, 24], 'glass', [x, 0.09, 0]);
        K.cyl(grain, [0.058, 0.058, 0.14, 24], K.bumpy(0xb88f52, TB.tex.speckle(), 0.02, { roughness: 1 }), [x, 0.075, 0]);
        K.cyl(grain, [0.062, 0.062, 0.02, 24], 'steel', [x, 0.19, 0]);
      });
      const col = K.part('colonized', [-0.3, 0.62, -0.6], null, 'Fully colonized grain (white, no green)');
      [-0.1, 0.1].forEach((x) => K.cyl(col, [0.059, 0.059, 0.141, 24], myc, [x, 0.075, 0]));
      // monotub on the floor
      const tub = K.part('tub', [0, 0, 0.25], null, 'Monotub (66 qt tote, filtered holes)');
      const tm = K.phys(0xeef6ff, { transparent: true, opacity: 0.32, roughness: 0.08, side: THREE.DoubleSide });
      K.box(tub, [0.8, 0.02, 0.5], tm, [0, 0.01, 0]);
      K.box(tub, [0.8, 0.38, 0.02], tm, [0, 0.19, 0.25]);
      K.box(tub, [0.8, 0.38, 0.02], tm, [0, 0.19, -0.25]);
      K.box(tub, [0.02, 0.38, 0.5], tm, [0.4, 0.19, 0]);
      K.box(tub, [0.02, 0.38, 0.5], tm, [-0.4, 0.19, 0]);
      const lid = K.part('lid', [0, 0.39, 0], tub, 'Lid');
      K.box(lid, [0.84, 0.03, 0.54], K.phys(0x8fb7e0, { transparent: true, opacity: 0.5 }));
      [[-0.25, 0.26], [0.25, 0.26], [-0.25, -0.26], [0.25, -0.26]].forEach(([x, z]) => K.cyl(tub, [0.025, 0.025, 0.005, 16], 'white', [x, 0.3, z], [90, 0, 0]));
      const sub = K.part('substrate', [0, 0.065, 0], tub, 'Bulk substrate (coir + vermiculite) mixed with spawn');
      K.box(sub, [0.76, 0.1, 0.46], K.bumpy(0x6b4b31, TB.tex.speckle(), 0.02, { roughness: 1 }));
      const subTop = K.part('subMyc', [0, 0.116, 0], tub, 'Colonized surface');
      K.box(subTop, [0.76, 0.006, 0.46], K.std(0xf1efe8, { transparent: true, opacity: 0.0, roughness: 1 }));
      const pins = K.part('pins', [0, 0.12, 0], tub, 'Pins (baby mushrooms)');
      const fruits = K.part('fruits', [0, 0.12, 0], tub, 'Mature fruits (harvest before the veil tears)');
      const r = (() => {
        let x = 7;
        return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646;
      })();
      for (let i = 0; i < 26; i++) {
        const x = (r() - 0.5) * 0.66;
        const z = (r() - 0.5) * 0.38;
        K.sph(pins, 0.01, capMat, [x, 0.012, z], [1, 1.4, 1]);
        if (i % 2 === 0) {
          const h = 0.08 + r() * 0.07;
          const m = K.group(fruits, [x, 0, z], [(r() - 0.5) * 18, 0, (r() - 0.5) * 18]);
          K.cyl(m, [0.008, 0.011, h, 10], stemMat, [0, h / 2, 0]);
          K.lathe(m, [[0, 0.03], [0.02, 0.028], [0.034, 0.012], [0.036, 0.0], [0.012, 0.004], [0, 0.004]], capMat, [0, h, 0], null, 24);
        }
      }
      const dried = K.part('dried', [0.75, 0, 0.35], null, 'Dried harvest in airtight jar + desiccant');
      K.cyl(dried, [0.07, 0.07, 0.2, 24], 'glass', [0, 0.1, 0]);
      K.cyl(dried, [0.072, 0.072, 0.03, 24], 'steel', [0, 0.21, 0]);
      K.rep(6, (i) => K.sph(dried, 0.022, capMat, [Math.cos(i) * 0.03, 0.04 + i * 0.015, Math.sin(i) * 0.03], [1.3, 0.6, 1]));
      return {
        colonize(on) {
          subTop.children[0].material.opacity = on ? 0.95 : 0;
        },
        tick(t, fx) {
          const m = subTop.children[0] && subTop.children[0].material;
          if (m) m.opacity = fx === 'myc' || fx === 'fruit' ? 0.95 : 0;
          if (m) m.transparent = true;
        },
      };
    }
  );

  TB.category({
    id: 'private',
    code: 'PRV',
    kind: 'project',
    hidden: true,
    name: 'Private Garden',
    domain: 'private',
    blurb: 'Personal home grows, for adults 21+ where it’s legal',
    repairs: [
      {
        id: 'grow-cannabis',
        title: 'Grow cannabis at home',
        model: 'growtent',
        level: 2,
        time: '3–5 months seed to jar',
        cost: '$250–700 to start',
        summary: 'A one-plant grow tent with an LED light, from seed to cured harvest. Photoperiod plants grow under 18 hours of light, then flower when you switch to 12. Autoflowers flower on their own.',
        intro: { show: ['flower'], hi: ['flower'], spin: true, preview: true },
        safety: [
          'Only where home cultivation is legal for adults 21+. Plant limits vary (for example, 6 per adult in some states, 6 per household in others). It remains illegal under federal law.',
          'Grow out of public view and secure it from children, pets and visitors, as most state laws require.',
          'Plug lights and fans into a grounded outlet, don’t daisy-chain power strips, and keep water away from electrical gear.',
          'Never drive or operate machinery impaired.',
        ],
        causes: [
          ['Check your local law', 'State plant limits, landlord or HOA rules, and whether the grow must be locked.'],
          ['Pick a genetic', 'Autoflowers are faster and more forgiving; photoperiod plants yield more and can be trained.'],
          ['Set up odor control', 'An inline fan with a carbon filter keeps the smell inside the tent.'],
        ],
        tools: ['Grow tent (2×2 to 3×3 ft)', 'Full-spectrum LED (100–200 W true draw)', 'Inline fan + carbon filter, clip fan', '5-gal fabric pot & quality potting soil', 'Timer', 'pH meter or drops', 'Thermo-hygrometer', 'Jeweler’s loupe (60×)', 'Pruning snips', 'Glass jars + 62% humidity packs'],
        steps: [
          { t: 'Set up the tent', d: 'Hang the LED, mount the carbon filter and exhaust fan up top, add a clip fan, and set the timer.', why: 'Fresh air and gentle wind prevent mold and strengthen stems. Exhausting from the top removes the hottest air.', v: { cam: [2.2, 1.8, 2.6], at: [0, 1.2, 0], hi: ['light', 'fan', 'tent'] } },
          { t: 'Germinate the seed', d: 'Place the seed in a damp paper towel in a warm, dark spot. When the taproot is ½″ long (1–3 days), plant it root-down ¼–½″ deep.', why: 'Moisture and warmth (around 75–80 °F) trigger germination. Planting too deep wastes the seedling’s energy reaching the surface.', v: { cam: [0.9, 0.8, 1.0], at: [0, 0.32, 0], hi: ['pot'], fx: 'dark' } },
          { t: 'Seedling stage', d: 'Run 18 hours on, 6 off with the light dimmed or raised. Keep humidity around 65–70% and water lightly in a small ring around the stem.', why: 'Seedlings have tiny roots. Overwatering is the most common way to kill them.', v: { cam: [1.0, 0.9, 1.2], at: [0, 0.4, 0], hi: ['seedling'], show: ['seedling'] } },
          { t: 'Vegetative growth', d: 'Keep 18/6 light for 3–8 weeks. Water when the top inch is dry, aim for soil-runoff pH 6.0–7.0, and train by bending or topping to keep the canopy flat.', why: 'Vegetative growth builds the structure that will carry flowers. A flat canopy puts every top an equal distance from the light.', v: { cam: [1.8, 1.4, 2.0], at: [0, 0.8, 0], hi: ['veg'], show: ['veg'], hide: ['seedling'] } },
          { t: 'Flip to flower', d: 'For photoperiod plants, switch the timer to 12 on / 12 off with total darkness at night. Drop humidity to 40–50%. Autoflowers start on their own.', why: 'Twelve hours of uninterrupted darkness signals autumn and triggers flowering. Light leaks can cause stress and seeds.', v: { cam: [1.8, 1.4, 2.0], at: [0, 0.9, 0], hi: ['flower', 'light'], show: ['flower'], hide: ['veg'] } },
          { t: 'Check trichomes to time harvest', d: 'After 8–10 weeks of flowering, look at the resin glands with a loupe. Harvest when most are cloudy with some amber.', why: 'Clear trichomes are immature; cloudy is peak; more amber gives a heavier, more sedating effect.', v: { cam: [0.9, 1.4, 1.0], at: [0.1, 1.1, 0.1], hi: ['loupe', 'flower'], show: ['loupe'] } },
          { t: 'Dry slowly', d: 'Cut branches and hang them in the dark at about 60 °F and 60% humidity for 7–14 days, until small stems snap instead of bend.', why: 'Slow drying preserves aroma and smoothness. Fast drying in warm air tastes harsh.', v: { cam: [1.8, 1.6, 2.0], at: [0, 1.2, 0.2], hi: ['hang'], show: ['hang'], hide: ['flower', 'loupe'], fx: 'dark' } },
          { t: 'Cure in jars', d: 'Trim, then fill jars ¾ full with a 58–62% humidity pack. Open daily for the first week to vent moisture, then weekly. Cure 2–4 weeks.', why: 'Curing lets chlorophyll break down and moisture even out, which improves flavor and prevents mold.', v: { cam: [1.2, 1.0, 1.8], at: [0, 0.2, 0.75], hi: ['jars'], show: ['jars'], hide: ['hang'] } },
        ],
        learn: {
          how: 'Cannabis is a short-day plant: it grows leaves and stems while nights are short and starts flowering when nights reach about 12 hours. Indoors you control that with a timer. The flowers (buds) on female plants make resin glands called trichomes, which hold the cannabinoids and terpenes. Light intensity, airflow, root health and humidity decide yield and quality.',
          specs: [['Veg light', '18 on / 6 off'], ['Flower light', '12 on / 12 off'], ['Soil pH', '6.0–7.0'], ['Hydro pH', '5.5–6.5'], ['Veg humidity', '50–70%'], ['Flower humidity', '40–50%'], ['Temperature', '70–80 °F lights on'], ['Dry', '60 °F / 60% RH, 7–14 days']],
          terms: [['Photoperiod', 'Strain that flowers when the light schedule changes.'], ['Autoflower', 'Strain that flowers by age, regardless of light.'], ['Topping', 'Cutting the main tip so the plant grows two tops.'], ['Trichomes', 'Resin glands that indicate ripeness.'], ['Burping', 'Opening curing jars to release moisture.']],
          mistakes: ['Overwatering seedlings.', 'Light leaks during the 12-hour dark period.', 'Harvesting too early.', 'Drying too fast in a warm room.', 'Jars packed too full (mold).'],
          tips: ['Weigh the pot when dry and when watered; lift it to know when it’s time to water.', 'Start with one or two plants. A small tent is easier to keep dialed in.'],
        },
        pro: 'You see powdery white mildew or gray bud rot (remove affected material and fix airflow), or your setup draws more power than one circuit can safely carry.',
      },
      {
        id: 'grow-mushrooms',
        title: 'Grow psilocybin mushrooms (monotub)',
        model: 'monotub',
        level: 3,
        time: '6–10 weeks',
        cost: '$80–200 to start',
        summary: 'The beginner-friendly monotub method: inoculate sterilized grain, let it colonize, mix it into a pasteurized coir substrate in a tub, then give it light, fresh air and humidity to fruit.',
        intro: { show: ['tub', 'substrate', 'fruits'], fx: 'fruit', spin: true, preview: true, hi: ['fruits'] },
        safety: [
          'Only where personal cultivation is legal for adults 21+ (for example, under Colorado’s natural medicine law). Psilocybin remains illegal federally and in most states, even where spores are sold.',
          'Never eat wild or unidentified mushrooms. Grow only from a known culture.',
          'Discard anything with green, blue-green, pink or black mold. Don’t open contaminated containers indoors.',
          'Psilocybin is a strong psychedelic. Avoid it with a personal or family history of psychosis or bipolar disorder, or on lithium; check medications with a doctor. Start low, use a calm setting with a sober trusted person, and never drive.',
          'Keep the harvest locked away from children and pets.',
        ],
        causes: [
          ['Sterile technique is everything', 'Most failures are contamination. Work in a still-air box, wipe with 70% isopropyl, and flame-sterilize needles.'],
          ['Buy pre-sterilized grain bags', 'Skip the pressure cooker for your first grow.'],
          ['Temperature matters', 'Colonize around 75–80 °F; fruit around 70–75 °F.'],
        ],
        tools: ['Spore syringe or liquid culture', 'Pre-sterilized grain bags or jars (rye or millet)', 'Still-air box (clear tote with arm holes)', '70% isopropyl alcohol & lighter', 'Coco coir + vermiculite (CVG) substrate', '66 qt clear tote with filter-taped holes', 'Spray bottle & thermometer/hygrometer', 'Nitrile gloves & mask', 'Food dehydrator', 'Airtight jars + silica desiccant'],
        steps: [
          { t: 'Prep a clean workspace', d: 'Clean the still-air box and your gloves with alcohol. Work slowly with no drafts.', why: 'Mold spores are everywhere. Still air lets them settle instead of landing in your grain.', v: { cam: [1.3, 1.3, 0.6], at: [0, 0.8, -0.6], hi: ['still'], show: ['still'] } },
          { t: 'Inoculate the grain', d: 'Flame the needle until red, let it cool, wipe the injection port, and inject 2–3 cc of culture per bag or jar.', why: 'Flaming kills contaminants on the needle. Too much liquid can make the grain soggy and invite bacteria.', v: { cam: [1.1, 1.2, 0.5], at: [-0.1, 0.75, -0.6], hi: ['syringe', 'grain'], show: ['syringe', 'grain'] } },
          { t: 'Colonize in the dark', d: 'Keep at 75–80 °F in the dark for 2–4 weeks. At about 30% colonized, gently break up and shake once to speed it up.', why: 'Mycelium grows outward from each inoculation point; shaking spreads it so it finishes evenly.', v: { cam: [1.1, 1.2, 0.5], at: [-0.3, 0.7, -0.6], hi: ['colonized'], show: ['colonized'], hide: ['syringe', 'still', 'grain'] } },
          { t: 'Prepare the bulk substrate', d: 'Pasteurize coir and vermiculite with boiling water (with a little gypsum), cover, and cool to room temperature. It should drip only a few drops when squeezed.', why: 'Pasteurizing kills competitors but leaves beneficial microbes. Field capacity moisture is wet but not soupy.', v: { cam: [1.6, 1.3, 1.8], at: [0, 0.15, 0.25], hi: ['tub'], show: ['tub'] } },
          { t: 'Spawn to bulk', d: 'Mix the colonized grain into the substrate about 1:2, level it 3–4″ deep, and add a thin layer of substrate on top. Close the lid with holes taped.', why: 'Grain gives the mycelium a head start; the bulk substrate gives it room and moisture to fruit.', v: { cam: [1.6, 1.3, 1.8], at: [0, 0.15, 0.25], hi: ['substrate'], show: ['substrate'], hide: ['colonized'] } },
          { t: 'Let the surface colonize', d: 'Keep the tub around 75 °F in low light for 7–14 days until the surface is white.', why: 'Introducing fruiting conditions too early leads to contamination and weak, side-pinning flushes.', v: { cam: [1.4, 1.2, 1.6], at: [0, 0.15, 0.25], hi: ['substrate'], fx: 'myc' } },
          { t: 'Start fruiting', d: 'Open the filter holes, give 12 hours of indirect light daily, keep humidity around 90%, fan the tub a few times a day, and mist the walls (not the surface) if it dries.', why: 'Fresh air (lower CO₂), light and humidity together are the signals that trigger pinning.', v: { cam: [1.2, 1.0, 1.4], at: [0, 0.15, 0.25], hi: ['pins'], show: ['pins'], fx: 'myc' } },
          { t: 'Harvest before the veil tears', d: 'In 7–14 days, twist and pull each mushroom at the base just as the thin veil under the cap starts to stretch or tear.', why: 'After the veil breaks the caps drop dark spores everywhere, and potency and texture decline.', v: { cam: [1.2, 1.0, 1.4], at: [0, 0.2, 0.25], hi: ['fruits'], show: ['fruits'], hide: ['pins'], fx: 'fruit' } },
          { t: 'Dry and store', d: 'Dry in a dehydrator at low heat (under 160 °F) until cracker-dry, then store in an airtight jar with desiccant, cool and dark. Rehydrate the tub for a second flush.', why: 'Mushrooms are 90% water. Fully dry mushrooms keep for many months; leathery ones mold.', v: { cam: [1.6, 1.0, 1.6], at: [0.6, 0.2, 0.35], hi: ['dried'], show: ['dried'] } },
        ],
        learn: {
          how: 'A mushroom is the fruit of a fungus. The main organism is mycelium, a web of white threads that digests grain and substrate. The monotub method grows mycelium first in a sterile, nutritious grain, then moves it into a bigger, less nutritious bulk substrate that molds can’t easily take over. When the mycelium runs out of room and senses fresh air, light and high humidity, it forms pins that grow into mushrooms.',
          specs: [['Colonization temp', '75–80 °F'], ['Fruiting temp', '70–75 °F'], ['Fruiting humidity', '≈ 90%'], ['Light', '12 hr indirect'], ['Spawn:substrate', '1:2'], ['Substrate depth', '3–4″'], ['Dry until', 'cracker-dry']],
          terms: [['Mycelium', 'The root-like body of the fungus.'], ['Spawn', 'Fully colonized grain used to inoculate bulk.'], ['CVG', 'Coir, vermiculite and gypsum substrate.'], ['Field capacity', 'Holds max water without pooling.'], ['Flush', 'One wave of mushrooms; tubs give 2–4.'], ['Veil', 'Membrane under the cap that tears as it matures.']],
          mistakes: ['Opening the tub to “check” during colonization.', 'Misting the surface directly (causes bacterial blotch).', 'Keeping a contaminated tub (spreads to the next grow).', 'Under-drying the harvest.'],
          tips: ['Start with one tub and pre-sterilized grain bags.', 'Label everything with dates. Colonization times are your best diagnostic.'],
        },
        pro: 'Not applicable for cultivation. For use, consider a licensed, supervised setting where one exists (such as a state-licensed healing center).',
      },
    ],
  });
})();
