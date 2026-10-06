/* VEH · Vehicles: vehicle-type variants (diesel truck, hybrid, jump pack, pickup spare, diesel fluids, disc brakes)
   and new auto + bike guides. Every scene here is built in real meters (unit: 1). */
(function () {
  const OUT = { env: 'garden', unit: 1, tex: ['asphalt_02'], ground: { tex: 'asphalt_02', repeat: 8, radius: 9 } };
  const GAR = { env: 'garage', unit: 1, tex: ['concrete_floor_01'], ground: { tex: 'concrete_floor_01', repeat: 6, radius: 7 } };
  const out = (o) => Object.assign({}, OUT, o);
  const gar = (o) => Object.assign({}, GAR, o);
  const PI = Math.PI;
  const D = PI / 180;

  // Wheel-arch points cut into a body side whose bottom edge sits at yb.
  function arch(K, cx, cy, r, yb, n) {
    const s = Math.asin(Math.max(-1, Math.min(1, (yb - cy) / r)));
    return K.circle(cx, cy, r, n || 16, PI - s, s);
  }

  /* ---------- Wheels (axis along local z, outer face toward +z) ---------- */
  function tireMesh(K, p, R, w, rr) {
    const g = K.group(p, [0, 0, 0], [90, 0, 0]);
    const pts = [[rr, -w * 0.4], [R - 0.04, -w / 2], [R - 0.01, -w / 2 + 0.012], [R, -w / 2 + 0.035], [R, w / 2 - 0.035], [R - 0.01, w / 2 - 0.012], [R - 0.04, w / 2], [rr, w * 0.4]];
    K.lathe(g, pts.map((q) => [q[0], -q[1]]), 'rubber', [0, 0, 0], [0, 0, 0], 48);
    return g;
  }
  function rimMesh(K, p, rr, w, o) {
    o = o || {};
    const al = o.steel ? K.std(0x2a2c30, { metalness: 0.5, roughness: 0.45 }) : K.std(0xc9cdd2, { metalness: 0.9, roughness: 0.28 });
    K.cyl(p, [rr, rr, w * 0.84, 40, true], al, [0, 0, 0], [90, 0, 0]);
    K.tor(p, [rr, 0.011], al, [0, 0, w * 0.42]);
    K.tor(p, [rr, 0.011], al, [0, 0, -w * 0.42]);
    K.cyl(p, [rr * 0.97, rr * 0.97, 0.01, 40], 'black', [0, 0, -w * 0.1], [90, 0, 0]);
    // brake rotor + caliper behind the spokes
    K.cyl(p, [rr * 0.82, rr * 0.82, 0.026, 40], 'forged', [0, 0, -w * 0.02], [90, 0, 0]);
    K.box(p, [0.11, 0.07, 0.07], 'red', [-rr * 0.6, rr * 0.45, 0.02], [0, 0, 40], 0.01);
    if (o.steel) {
      K.cyl(p, [rr * 0.96, rr * 0.96, 0.012, 40], al, [0, 0, w * 0.3], [90, 0, 0]);
      K.rep(8, (i) => K.cyl(p, [0.022, 0.022, 0.014, 16], 'black', [Math.cos(i * PI / 4) * rr * 0.62, Math.sin(i * PI / 4) * rr * 0.62, w * 0.305], [90, 0, 0]));
    } else {
      const n = o.spokes || 5;
      K.rep(n, (i) => {
        const a = (i * 360) / n + 90;
        K.box(p, [0.05, rr * 0.72, 0.025], al, [Math.cos(a * D) * rr * 0.6, Math.sin(a * D) * rr * 0.6, w * 0.3], [0, 0, a - 90], 0.008);
      });
    }
    K.cyl(p, [rr * 0.34, rr * 0.36, 0.04, 32], al, [0, 0, w * 0.3], [90, 0, 0]);
    K.cyl(p, [0.032, 0.032, 0.012, 24], o.steel ? 'chrome' : 'dark', [0, 0, w * 0.33 + 0.012], [90, 0, 0]);
  }
  function lugSet(K, p, n, lr, z, nut) {
    K.rep(n, (i) => {
      const a = (i * 2 * PI) / n + PI / 2;
      K.ccyl(p, [nut || 0.012, 0.024, 6, 0.002], 'chrome', [Math.cos(a) * lr, Math.sin(a) * lr, z], [90, 0, 0]);
    });
  }
  // A whole road wheel. side -1 turns the face toward -z. Returns { part, lugs }.
  function wheel(K, parent, name, label, pos, o) {
    o = o || {};
    const part = name ? K.part(name, pos, parent, label) : K.group(parent, pos);
    const inner = K.group(part, [0, 0, 0], [0, o.side === -1 ? 180 : 0, 0]);
    const t = tireMesh(K, inner, o.R, o.w, o.rr);
    if (!o.flat) [-0.32, -0.1, 0.1, 0.32].forEach((f) => K.tor(inner, [o.R - 0.001, 0.0045], 'black', [0, 0, f * o.w]));
    if (o.flat) {
      t.scale.set(1, 1, 0.92);
      t.position.y = -o.R * 0.08;
    }
    rimMesh(K, inner, o.rr, o.w, o);
    const lugs = o.lugName ? K.part(o.lugName, [0, 0, 0], inner, o.lugLabel || 'Lug nuts') : inner;
    lugSet(K, lugs, o.lugs || 5, o.lr || 0.056, o.w * 0.33 + 0.012);
    return { part, inner, lugs };
  }

  /* ---------- Sedan (front toward +x, driver side -z). Real size: 4.6 m long, 1.8 m wide. ---------- */
  const SED = { W: 1.8, R: 0.32, xf: 1.35, xr: -1.35 };
  function sedan(K, o) {
    const W = SED.W, R = SED.R;
    const g = K.group(null, o.pos || [0, 0, 0], [0, o.yaw || 0, 0]);
    const body = K.part(o.name, [0, 0, 0], g, o.label);
    const paint = K.paint(o.color || 0x7fa7c9);
    const glass = K.phys(0x1d2a33, { roughness: 0.05, metalness: 0.3, clearcoat: 1 });
    const lower = [[-2.28, 0.3], [-1.8, 0.26]].concat(arch(K, SED.xr, R, 0.38, 0.24), [[-0.95, 0.2], [0.78, 0.2], [0.78, 0.95], [-1.95, 0.95], [-2.24, 0.97], [-2.34, 0.82], [-2.33, 0.45]]);
    K.ext(body, lower, W, paint, [0, 0, -W / 2], null, 0.02);
    const front = [[0.78, 0.2], [0.95, 0.2]].concat(arch(K, SED.xf, R, 0.38, 0.22), [[1.78, 0.26], [2.24, 0.3], [2.34, 0.46], [2.33, 0.66], [2.22, 0.8], [1.6, 0.88], [0.78, 0.95]]);
    const hood = o.hood || 0;
    if (!hood) K.ext(body, front, W, paint, [0, 0, -W / 2], null, 0.02);
    else {
      [-1, 1].forEach((s) => K.ext(body, front, 0.1, paint, [0, 0, s > 0 ? W / 2 - 0.1 : -W / 2], null, 0.01));
      K.ext(body, [[2.02, 0.26], [2.24, 0.3], [2.34, 0.46], [2.33, 0.66], [2.22, 0.8], [2.02, 0.8]], W - 0.02, paint, [0, 0, -W / 2 + 0.01], null, 0.01);
      K.box(body, [1.3, 0.03, W - 0.2], 'black', [1.4, 0.36, 0], null, 0);
      [-1, 1].forEach((s) => K.box(body, [1.2, 0.42, 0.03], 'dark', [1.42, 0.6, s * (W / 2 - 0.12)], null, 0.004));
      K.box(body, [0.05, 0.5, W - 0.2], 'dark', [0.8, 0.66, 0], null, 0.004); // firewall
      K.box(body, [0.16, 0.04, W - 0.2], 'black', [0.86, 0.93, 0], null, 0.006); // cowl
      K.box(body, [0.06, 0.4, W - 0.24], 'black', [2.0, 0.6, 0], null, 0.004); // radiator support
      K.box(body, [0.03, 0.34, 1.2], K.std(0x3a3d40, { metalness: 0.5, roughness: 0.6 }), [1.95, 0.58, 0], null, 0); // radiator
      K.box(body, [0.08, 0.03, W - 0.26], 'black', [2.0, 0.81, 0], null, 0.004); // latch panel
      K.box(body, [0.04, 0.03, 0.08], 'steel', [2.03, 0.83, 0], null, 0.004); // latch
      const hg = K.group(body, [0.8, 0.95, 0], [0, 0, hood]);
      K.box(hg, [1.48, 0.022, W - 0.06], paint, [0.74, 0.012, 0], null, 0.008);
      K.box(hg, [1.3, 0.012, W - 0.3], 'black', [0.74, -0.008, 0], null, 0.004);
      const a = hood * D;
      K.bar(body, [2.0, 0.82, 0.72], [0.8 + 1.15 * Math.cos(a), 0.95 + 1.15 * Math.sin(a) - 0.01, 0.72], 0.005, 'steel');
    }
    const gh = [[0.78, 0.95], [0.02, 1.38], [-0.85, 1.43], [-1.45, 1.33], [-1.88, 1.0], [-1.95, 0.95]];
    K.ext(body, gh, W - 0.16, paint, [0, 0, -(W - 0.16) / 2], null, 0.02);
    const side = [[0.6, 0.99], [0.02, 1.335], [-0.85, 1.385], [-1.42, 1.295], [-1.76, 1.0]];
    [-1, 1].forEach((s) => {
      K.ext(body, side, 0.004, glass, [0, 0, s > 0 ? (W - 0.16) / 2 + 0.001 : -(W - 0.16) / 2 - 0.005]);
      K.box(body, [0.07, 0.36, 0.006], 'black', [-0.42, 1.18, s * ((W - 0.16) / 2 + 0.004)], [0, 0, 8], 0); // B pillar
      [0.72, -0.4, -1.32].forEach((x) => K.box(body, [0.004, 0.62, 0.004], 'black', [x, 0.62, s * (W / 2 + 0.001)], null, 0));
      [0.15, -0.95].forEach((x) => K.box(body, [0.12, 0.022, 0.02], 'chrome', [x, 0.86, s * (W / 2 + 0.006)], null, 0.006));
      K.box(body, [0.12, 0.1, 0.16], paint, [0.58, 1.02, s * (W / 2 + 0.06)], null, 0.02);
      K.box(body, [0.04, 0.09, 0.36], K.std(0xb01818, { roughness: 0.3 }), [-2.32, 0.86, s * 0.62], null, 0.01);
      K.box(body, [2.6, 0.07, 0.02], 'black', [0.0, 0.25, s * (W / 2 - 0.01)], null, 0);
    });
    K.box(body, [0.873, 0.006, W - 0.26], glass, [0.402, 1.168, 0], [0, 0, -29.5], 0);
    K.box(body, [0.54, 0.006, W - 0.3], glass, [-1.664, 1.168, 0], [0, 0, 37.5], 0);
    K.box(body, [0.03, 0.13, 0.75], 'black', [2.335, 0.56, 0], null, 0.01); // grille
    K.box(body, [0.05, 0.08, W - 0.1], 'black', [2.3, 0.34, 0], null, 0.01);
    K.box(body, [0.05, 0.1, W - 0.1], 'black', [-2.3, 0.4, 0], null, 0.01);
    if (!o.noLamps) [-1, 1].forEach((s) => {
      K.box(body, [0.16, 0.1, 0.4], 'chrome', [2.2, 0.72, s * 0.62], [0, 0, -12], 0.02);
      K.box(body, [0.17, 0.11, 0.41], K.phys(0xe8f0f6, { transparent: true, opacity: 0.45, roughness: 0.05, clearcoat: 1 }), [2.21, 0.72, s * 0.62], [0, 0, -12], 0.02);
    });
    const wo = { R, w: 0.205, rr: 0.205, lugs: 5, lr: 0.057 };
    [[SED.xf, 1], [SED.xr, 1], [SED.xf, -1], [SED.xr, -1]].forEach(([x, s]) => wheel(K, g, null, null, [x, R, s * 0.77], Object.assign({ side: s }, wo)));
    return { g, body, paint };
  }
  // Generic small engine + parts in an open sedan bay. opts: { battery:false, airbox:false, hybrid:true }
  function sedanBay(K, g, opts) {
    opts = opts || {};
    const eng = K.group(g, [1.35, 0, 0]);
    K.box(eng, [0.5, 0.36, 0.62], K.std(0x7c8187, { metalness: 0.6, roughness: 0.45 }), [0, 0.56, 0], null, 0.02);
    K.box(eng, [0.36, 0.08, 0.58], opts.hybrid ? K.std(0x9aa0a8, { metalness: 0.7, roughness: 0.4 }) : 'black', [0, 0.78, 0], null, 0.02);
    K.cyl(eng, [0.028, 0.028, 0.03, 24], 'yellow', [-0.05, 0.835, -0.15]);
    K.tor(eng, [0.018, 0.005], 'yellow', [0.18, 0.84, 0.2], [0, 90, 0]);
    K.cyl(eng, [0.14, 0.14, 0.05, 32], 'black', [0.27, 0.45, -0.25], [0, 0, 90]); // belt pulley
    K.box(eng, [0.08, 0.22, 0.16], 'grey', [0.25, 0.62, 0.15], null, 0.01); // alternator
    if (opts.hybrid) {
      const inv = K.group(g, [1.35, 0.86, 0.48]);
      K.box(inv, [0.36, 0.16, 0.3], K.std(0xb7bcc2, { metalness: 0.8, roughness: 0.35 }), [0, 0, 0], null, 0.015);
      K.box(inv, [0.2, 0.004, 0.14], 'yellow', [0.02, 0.082, 0], null, 0);
      [0.06, 0.1, 0.14].forEach((dz) => K.tube(g, [[1.2, 0.84, 0.4 + dz * 0.3], [1.1, 0.7, 0.3 + dz * 0.4], [1.2, 0.55, 0.15 + dz * 0.4]], 0.011, 'orange'));
    }
    if (opts.airbox !== false) {
      K.box(g, [0.3, 0.2, 0.3], 'black', [1.75, 0.72, 0.52], null, 0.02);
      K.tube(g, [[1.62, 0.8, 0.45], [1.5, 0.84, 0.3], [1.48, 0.8, 0.12]], 0.04, 'rubber');
    }
    // coolant + washer reservoirs
    K.box(g, [0.14, 0.14, 0.12], K.std(0xe7e3da, { transparent: true, opacity: 0.7 }), [1.85, 0.72, 0.22], null, 0.01);
    K.cyl(g, [0.03, 0.03, 0.025], 'black', [1.85, 0.8, 0.22]);
    K.cyl(g, [0.028, 0.028, 0.025], 'blue', [1.9, 0.78, 0.76]);
    if (opts.battery !== false) return battery(K, g, opts.batName || null, opts.batLabel || null, opts.batPos || [1.72, 0.62, -0.56]);
  }

  /* 12 V battery, group 35 (230 × 175 × 225 mm), long side along x, posts on the outboard (-z) edge.
     pos = bottom centre. Returns local post-top positions. */
  function battery(K, parent, name, label, pos, o) {
    o = o || {};
    const p = name ? K.part(name, pos, parent, label) : K.group(parent, pos);
    const H = 0.225;
    K.box(p, [0.23, H - 0.02, 0.175], o.caseMat || 'black', [0, (H - 0.02) / 2, 0], null, 0.006);
    K.box(p, [0.232, 0.025, 0.177], o.lidMat || K.std(0x2e3135, { roughness: 0.5 }), [0, H - 0.0125, 0], null, 0.005);
    K.box(p, [0.12, 0.002, 0.08], o.label || 'red', [0, H * 0.55, 0.0885], [90, 0, 0], 0);
    K.box(p, [0.15, 0.06, 0.004], 'offwhite', [0, H * 0.55, 0.0885], null, 0);
    K.box(p, [0.15, 0.06, 0.004], 'offwhite', [0, H * 0.55, -0.0885], null, 0);
    const lead = K.std(0x9ea3a8, { metalness: 0.7, roughness: 0.45 });
    const posP = [0.075, H + 0.012, -0.055];
    const negP = [-0.075, H + 0.012, -0.055];
    K.cyl(p, [0.0085, 0.0095, 0.022, 20], lead, [posP[0], H + 0.011, posP[2]]);
    K.cyl(p, [0.0075, 0.0085, 0.022, 20], lead, [negP[0], H + 0.011, negP[2]]);
    K.box(p, [0.012, 0.003, 0.012], 'red', [posP[0], H + 0.0015, -0.03], null, 0);
    K.box(p, [0.012, 0.003, 0.004], 'offwhite', [negP[0], H + 0.0015, -0.03], null, 0);
    const pp = [pos[0] + posP[0], pos[1] + H + 0.022, pos[2] + posP[2]];
    const np = [pos[0] + negP[0], pos[1] + H + 0.022, pos[2] + negP[2]];
    if (!o.noCables) {
      K.box(p, [0.035, 0.02, 0.03], lead, [posP[0], H + 0.012, posP[2]], null, 0.004);
      K.box(p, [0.035, 0.02, 0.03], lead, [negP[0], H + 0.012, negP[2]], null, 0.004);
      K.tube(p, [[posP[0] + 0.015, H + 0.015, posP[2]], [posP[0] + 0.07, H + 0.02, posP[2] - 0.04], [posP[0] + 0.1, H - 0.08, posP[2] - 0.07]], 0.008, 'red');
      K.tube(p, [[negP[0] - 0.015, H + 0.015, negP[2]], [negP[0] - 0.07, H + 0.02, negP[2] - 0.04], [negP[0] - 0.1, H - 0.1, negP[2] - 0.07]], 0.008, 'black');
    }
    return { p, pos: pp, neg: np };
  }

  /* Jumper-cable clamp, jaws biting at `at`. */
  function clamp(K, p, at, color, yaw) {
    const g = K.group(p, at, [0, yaw || 0, 0]);
    const t = K.group(g, [0, 0, 0], [0, 0, -20]);
    K.box(t, [0.014, 0.045, 0.026], 'copper', [0.011, 0.024, 0], null, 0.003);
    K.box(t, [0.014, 0.045, 0.026], 'copper', [-0.011, 0.024, 0], null, 0.003);
    K.box(t, [0.026, 0.11, 0.032], color, [0.018, 0.1, 0], [0, 0, -7], 0.008);
    K.box(t, [0.026, 0.11, 0.032], color, [-0.018, 0.1, 0], [0, 0, 7], 0.008);
    K.cyl(t, [0.007, 0.007, 0.046, 12], 'steel', [0, 0.055, 0], [90, 0, 0]);
    return g;
  }
  // A clamp part plus its half of the cable running to `mid`.
  function cableEnd(K, name, label, at, mid, color, yaw) {
    const g = K.part(name, [0, 0, 0], null, label);
    clamp(K, g, at, color, yaw);
    const top = [at[0] - 0.03, at[1] + 0.15, at[2]];
    K.tube(g, [top, [top[0], top[1] + 0.12, top[2]], [(top[0] * 2 + mid[0]) / 3, (top[1] + mid[1]) / 2 + 0.1, (top[2] * 2 + mid[2]) / 3], mid], 0.0065, color);
    return g;
  }
  // Local vehicle point -> world, for a vehicle at x offset with yaw 0 or 180.
  const wp = (x, yaw, p) => (yaw ? [x - p[0], p[1], -p[2]] : [x + p[0], p[1], p[2]]);

  /* ---------- Full-size pickup (crew cab, 5.9 m long, 2.02 m wide), front toward +x, driver side -z.
     Front axle at x 1.95, rear axle at x -1.75, LT275/70R18 tires (r 0.41). ---------- */
  const PU = { W: 2.02, R: 0.41, xf: 1.95, xr: -1.75, track: 0.87 };
  function pickup(K, o) {
    const W = PU.W, R = PU.R;
    // Origin of the body part sits at the front-axle ground point so the truck can tip up about it on a jack.
    const g = K.group(null, o.pos || [0, 0, 0], [0, o.yaw || 0, 0]);
    const body = K.part(o.name, [PU.xf, 0, 0], g, o.label);
    const b = K.group(body, [-PU.xf, 0, 0]);
    const paint = K.paint(o.color || 0x9a2a2a);
    const glass = K.phys(0x1d2a33, { roughness: 0.05, metalness: 0.3, clearcoat: 1 });
    const front = [[1.0, 0.56]].concat(arch(K, PU.xf, R, 0.52, 0.56), [[2.55, 0.6], [2.86, 0.62], [2.88, 1.28], [2.72, 1.33], [1.0, 1.38]]);
    const hood = o.hood || 0;
    if (!hood) K.ext(b, front, W, paint, [0, 0, -W / 2], null, 0.02);
    else {
      [-1, 1].forEach((s) => K.ext(b, front, 0.11, paint, [0, 0, s > 0 ? W / 2 - 0.11 : -W / 2], null, 0.01));
      K.box(b, [1.75, 0.03, W - 0.22], 'black', [1.85, 0.66, 0], null, 0);
      [-1, 1].forEach((s) => K.box(b, [1.6, 0.6, 0.03], 'dark', [1.85, 0.95, s * (W / 2 - 0.13)], null, 0.004));
      K.box(b, [0.05, 0.7, W - 0.22], 'dark', [1.03, 1.0, 0], null, 0.004);
      K.box(b, [0.18, 0.05, W - 0.22], 'black', [1.1, 1.36, 0], null, 0.008);
      K.box(b, [0.06, 0.55, W - 0.26], 'black', [2.72, 1.0, 0], null, 0.004);
      K.box(b, [0.035, 0.5, 1.4], K.std(0x3a3d40, { metalness: 0.5, roughness: 0.6 }), [2.66, 0.98, 0], null, 0);
      const hg = K.group(b, [1.02, 1.38, 0], [0, 0, hood]);
      K.box(hg, [1.88, 0.025, W - 0.06], paint, [0.94, 0.012, 0], null, 0.008);
      K.box(hg, [1.7, 0.012, W - 0.3], 'black', [0.94, -0.008, 0], null, 0.004);
      const a = hood * D;
      K.bar(b, [2.68, 1.28, 0.8], [1.02 + 1.5 * Math.cos(a), 1.38 + 1.5 * Math.sin(a) - 0.01, 0.8], 0.006, 'steel');
    }
    K.ext(b, [[-0.8, 0.56], [1.0, 0.56], [1.0, 1.38], [-0.8, 1.38]], W, paint, [0, 0, -W / 2], null, 0.02);
    K.ext(b, [[1.0, 1.38], [0.2, 1.96], [-0.72, 1.97], [-0.8, 1.38]], W - 0.12, paint, [0, 0, -(W - 0.12) / 2], null, 0.02);
    [-1, 1].forEach((s) => {
      K.ext(b, [[0.85, 1.42], [0.2, 1.9], [-0.68, 1.91], [-0.72, 1.42]], 0.004, glass, [0, 0, s > 0 ? (W - 0.12) / 2 + 0.001 : -(W - 0.12) / 2 - 0.005]);
      K.box(b, [0.07, 0.5, 0.006], paint, [0.08, 1.66, s * ((W - 0.12) / 2 + 0.004)], null, 0);
      [0.95, 0.12, -0.78].forEach((x) => K.box(b, [0.004, 0.8, 0.004], 'black', [x, 0.98, s * (W / 2 + 0.001)], null, 0));
      [0.3, -0.55].forEach((x) => K.box(b, [0.15, 0.03, 0.025], 'chrome', [x, 1.25, s * (W / 2 + 0.008)], null, 0.008));
      K.box(b, [0.14, 0.22, 0.24], 'black', [0.85, 1.5, s * (W / 2 + 0.12)], null, 0.02); // tow mirror
      K.box(b, [1.5, 0.04, 0.18], 'black', [0.1, 0.45, s * (W / 2 + 0.03)], null, 0.01); // running board
      // bed side
      K.ext(b, [[-2.9, 0.76]].concat(arch(K, PU.xr, R, 0.52, 0.76), [[-0.85, 0.76], [-0.85, 1.42], [-2.9, 1.42]]), 0.07, paint, [0, 0, s > 0 ? W / 2 - 0.07 : -W / 2], null, 0.01);
      K.box(b, [2.02, 0.05, 0.1], 'black', [-1.87, 1.44, s * (W / 2 - 0.05)], null, 0.01); // rail cap
      K.box(b, [0.05, 0.2, 0.25], K.std(0xb01818, { roughness: 0.3 }), [-2.9, 1.2, s * (W / 2 - 0.13)], null, 0.01);
      K.box(b, [0.06, 0.12, 0.36], K.phys(0xe8f0f6, { transparent: true, opacity: 0.5, roughness: 0.05 }), [2.86, 1.12, s * 0.72], null, 0.01);
      // frame rail
      K.box(b, [5.6, 0.2, 0.07], 'black', [-0.1, 0.62, s * 0.48], null, 0.01);
      K.box(b, [1.3, 0.05, 0.07], 'black', [PU.xr, R + 0.1, s * 0.48], [0, 0, 2], 0.01); // leaf spring
      K.bar(b, [PU.xr + 0.2, R, s * 0.6], [PU.xr + 0.35, 0.68, s * 0.42], 0.022, 'yellow'); // shock
    });
    K.box(b, [0.873 * 1.1, 0.006, W - 0.24], glass, [0.6, 1.67, 0], [0, 0, -36], 0);
    K.box(b, [0.08, 0.45, 1.4], 'chrome', [2.89, 1.0, 0], null, 0.02); // grille surround
    K.box(b, [0.04, 0.36, 1.28], 'black', [2.92, 1.0, 0], null, 0.01);
    K.box(b, [0.18, 0.24, W], 'chrome', [2.98, 0.6, 0], null, 0.03); // front bumper
    K.box(b, [2.0, 0.03, W - 0.14], 'black', [-1.87, 0.95, 0], null, 0); // bed floor (liner)
    K.box(b, [0.06, 0.48, W - 0.14], 'black', [-0.88, 1.18, 0], null, 0.01);
    const tg = K.part(o.name + 'Gate', [-2.92, 1.15, 0], b, 'Tailgate');
    K.box(tg, [0.06, 0.52, W - 0.08], paint, [0, 0, 0], null, 0.02);
    K.box(tg, [0.02, 0.05, 0.2], 'black', [-0.035, 0.18, 0], null, 0.01);
    // rear bumper with access hole for the spare winch
    K.box(b, [0.18, 0.24, W], 'chrome', [-3.0, 0.62, 0], null, 0.03);
    K.box(b, [0.19, 0.04, 0.5], 'black', [-3.0, 0.745, 0], null, 0.01); // step pad
    K.box(b, [0.01, 0.15, 0.32], 'offwhite', [-3.095, 0.6, 0], null, 0); // licence plate
    K.box(b, [0.15, 0.2, 1.1], 'black', [-2.8, 0.62, 0], null, 0.01); // rear crossmember
    // rear axle + diff
    K.bar(b, [PU.xr, R, -0.72], [PU.xr, R, 0.72], 0.048, 'black');
    K.sph(b, 0.15, K.std(0x2a2c30, { metalness: 0.4, roughness: 0.6 }), [PU.xr, R, 0.05], [1, 0.9, 0.9]);
    K.bar(b, [PU.xr, R, 0.05], [0.6, 0.45, 0.05], 0.035, 'dark'); // drive shaft
    K.bar(b, [PU.xf, R, -0.72], [PU.xf, R, 0.72], 0.05, 'black'); // front axle
    const wo = { R, w: 0.28, rr: 0.229, lugs: 6, lr: 0.0675 };
    const skip = o.skip || [];
    [['fl', PU.xf, -1], ['fr', PU.xf, 1], ['rl', PU.xr, -1], ['rr', PU.xr, 1]].forEach(([k, x, s]) => {
      if (!skip.includes(k)) wheel(K, b, null, null, [x, R, s * PU.track], Object.assign({ side: s }, wo));
    });
    return { g, body, b, paint, wo };
  }

  // Diesel V8 bay contents for an open pickup (b = pickup inner group). Batteries at both front corners.
  function dieselBay(K, b, o) {
    o = o || {};
    const alu = K.std(0x8a9096, { metalness: 0.75, roughness: 0.4 });
    const eng = K.group(b, [1.9, 0, 0]);
    K.box(eng, [0.95, 0.42, 0.62], K.std(0x3c4146, { metalness: 0.5, roughness: 0.55 }), [0, 0.92, 0], null, 0.02);
    [-1, 1].forEach((s) => {
      K.box(eng, [0.88, 0.1, 0.2], alu, [0, 1.17, s * 0.24], [s * 14, 0, 0], 0.02);
      K.rep(4, (i) => K.cyl(eng, [0.012, 0.012, 0.012, 12], 'chrome', [-0.33 + i * 0.22, 1.235, s * 0.25], [s * 14, 0, 0]));
    });
    K.box(eng, [0.7, 0.12, 0.22], 'black', [0, 1.2, 0], null, 0.02); // intake
    K.box(eng, [0.18, 0.07, 0.2], 'black', [0.02, 1.27, 0], null, 0.015);
    K.lathe(eng, [[0, -0.09], [0.11, -0.09], [0.13, -0.04], [0.13, 0.04], [0.11, 0.09], [0, 0.09]], K.std(0xb0b5ba, { metalness: 0.9, roughness: 0.3 }), [-0.6, 1.12, 0.0], [90, 0, 0]); // turbo
    K.tube(b, [[1.3, 1.14, 0.08], [1.45, 1.26, 0.35], [1.75, 1.26, 0.52], [1.92, 1.18, 0.5]], 0.055, 'black'); // intake tube
    K.box(b, [0.26, 0.26, 0.26], 'black', [2.0, 1.07, 0.5], null, 0.02); // air box
    K.cyl(eng, [0.17, 0.17, 0.05, 32], 'black', [0.5, 0.84, 0], [0, 0, 90]);
    K.cyl(eng, [0.08, 0.08, 0.06, 24], 'dark', [0.5, 1.0, -0.2], [0, 0, 90]);
    K.box(b, [0.08, 0.5, 1.1], 'black', [2.58, 1.0, 0], null, 0.01); // fan shroud
    const ground = K.part(o.groundName || 'groundPoint', [2.38, 1.13, -0.08], b, 'Unpainted engine lift bracket (ground)');
    K.box(ground, [0.012, 0.09, 0.06], 'steel', [0, 0.045, 0], null, 0.002);
    K.cyl(ground, [0.016, 0.016, 0.02, 12], 'steel', [0, 0.07, 0], [0, 0, 90]);
    return eng;
  }

  /* ================= Jump-start scenes ================= */
  // Helper car at x 2.6 facing -x. side = world z sign of its battery posts.
  function helperCar(K, side) {
    const s = sedan(K, { name: 'goodCar', label: 'Helper car (running)', color: 0xc9c3b6, pos: [2.6, 0, 0], yaw: 180, hood: 62 });
    const bat = sedanBay(K, s.g, { batName: 'goodBattery', batLabel: 'Helper battery', batPos: [1.72, 0.62, side > 0 ? -0.56 : 0.56] });
    return { pos: wp(2.6, 180, bat.pos), neg: wp(2.6, 180, bat.neg) };
  }
  function jumpCables(K, ends) {
    // ends: { redDead, redGood, blackGood, blackGround } world points
    const rm = [(ends.redDead[0] + ends.redGood[0]) / 2, 0.78, (ends.redDead[2] + ends.redGood[2]) / 2 + 0.08];
    const bm = [(ends.blackGood[0] + ends.blackGround[0]) / 2, 0.8, (ends.blackGood[2] + ends.blackGround[2]) / 2 - 0.05];
    cableEnd(K, 'redDead', '1 · Red to dead +', ends.redDead, rm, 'red');
    cableEnd(K, 'redGood', '2 · Red to helper +', ends.redGood, rm, 'red', 180);
    cableEnd(K, 'blackGood', '3 · Black to helper −', ends.blackGood, bm, 'black', 180);
    cableEnd(K, 'blackGround', '4 · Black to bare metal', ends.blackGround, bm, 'black');
  }
  const JUMPH = ['redDead', 'redGood', 'blackGood', 'blackGround'];

  /* ---- Diesel pickup with two batteries + helper car ---- */
  TB.model('jumpDiesel', out({ cam: [1.6, 3.4, 6.2], at: [-0.6, 1.0, 0], hidden: JUMPH }), (K) => {
    const T = pickup(K, { name: 'deadTruck', label: 'Diesel pickup (dead)', color: 0x2f4a6b, pos: [-3.1, 0, 0], hood: 64 });
    dieselBay(K, T.b);
    const bp = battery(K, T.b, 'batPass', 'Passenger-side battery (primary, thicker cables)', [2.4, 0.95, 0.66]);
    const bd = battery(K, T.b, 'batDriver', 'Driver-side battery', [2.4, 0.95, -0.62]);
    const link = K.part('batLink', [0, 0, 0], T.b, 'Cables tying the batteries in parallel');
    K.tube(link, [[bp.pos[0] + 0.01, bp.pos[1] - 0.005, bp.pos[2]], [2.6, 1.25, 0.4], [2.62, 1.25, -0.4], [bd.pos[0] + 0.01, bd.pos[1] - 0.005, bd.pos[2]]], 0.009, 'red');
    K.tube(link, [[bp.neg[0] - 0.01, bp.neg[1] - 0.005, bp.neg[2]], [2.62, 1.21, 0.3], [2.63, 1.21, -0.3], [bd.neg[0] - 0.01, bd.neg[1] - 0.005, bd.neg[2]]], 0.009, 'black');
    const h = helperCar(K, 1);
    const P = (p) => wp(-3.1, 0, p);
    jumpCables(K, { redDead: P(bp.pos), redGood: h.pos, blackGood: h.neg, blackGround: P([2.38, 1.22, -0.08]) });
    return {};
  });

  /* ---- Hybrid: 12 V battery in the trunk, jump post in the under-hood fuse box ---- */
  TB.model('jumpHybrid', out({ cam: [1.2, 3.2, 5.6], at: [-0.8, 0.8, 0], hidden: JUMPH }), (K) => {
    const s = sedan(K, { name: 'deadCar', label: 'Hybrid (12 V battery dead)', color: 0xdfe3e6, pos: [-2.6, 0, 0], hood: 62 });
    sedanBay(K, s.g, { battery: false, hybrid: true });
    // under-hood fuse box with the remote + jump terminal
    const fb = K.part('fuseBox', [1.62, 0.74, -0.6], s.g, 'Fuse box (jump terminal inside)');
    K.box(fb, [0.24, 0.1, 0.17], 'black', [0, 0.05, 0], null, 0.01);
    const cov = K.part('fuseCover', [0, 0.1, 0], fb, 'Fuse box cover');
    K.box(cov, [0.25, 0.03, 0.18], 'dark', [0, 0.015, 0], null, 0.008);
    K.box(cov, [0.04, 0.012, 0.03], 'black', [0.1, 0.03, 0], null, 0.003);
    const jp = K.part('jumpPost', [0.07, 0.1, -0.04], fb, 'Jump-start terminal (+)');
    K.cyl(jp, [0.01, 0.01, 0.03, 12], 'brass', [0, 0.015, 0]);
    K.nut(jp, 0.013, 0.008, 'steel', [0, 0.01, 0]);
    const cap = K.part('jumpCap', [-0.02, 0.0, 0], jp, 'Red + cap');
    K.box(cap, [0.04, 0.035, 0.035], 'red', [0.02, 0.035, 0], null, 0.006);
    const gp = K.part('groundPoint', [1.62, 0.66, -0.2], s.g, 'Unpainted ground bolt');
    K.box(gp, [0.012, 0.08, 0.07], 'steel', [0, 0.04, 0], null, 0.002);
    K.screw(gp, 0.01, 0.02, 'chrome', [0.012, 0.06, 0], [0, 0, -90], 'hex');
    // 12 V auxiliary battery in the trunk, right side
    battery(K, s.g, 'auxBattery', '12 V auxiliary battery (in the trunk)', [-1.95, 0.42, 0.52], { lidMat: 'grey' });
    const ready = K.part('readyLamp', [0.62, 0.98, -0.35], s.g, 'Dash: READY light');
    const rl = K.std(0x7dff8a, { emissive: 0x22ff55, emissiveIntensity: 0.05 });
    K.box(ready, [0.03, 0.012, 0.06], rl, [0, 0, 0], null, 0);
    const h = helperCar(K, -1);
    const P = (p) => wp(-2.6, 0, p);
    jumpCables(K, { redDead: P([1.69, 0.885, -0.64]), redGood: h.pos, blackGood: h.neg, blackGround: P([1.632, 0.74, -0.2]) });
    return { tick(t, fx) { rl.emissiveIntensity = fx === 'ready' ? 1.4 : 0.05; } };
  });

  /* ---- Portable lithium jump pack on one car ---- */
  TB.model('jumpPack', out({ cam: [3.4, 1.9, -2.2], at: [1.7, 0.8, -0.4], hidden: ['packRed', 'packBlack'] }), (K) => {
    const s = sedan(K, { name: 'deadCar', label: 'Car with dead battery', color: 0x7fa7c9, hood: 62 });
    const bat = sedanBay(K, s.g, { batName: 'battery', batLabel: 'Battery' });
    const gp = K.part('groundPoint', [1.61, 0.62, -0.14], null, 'Unpainted engine bracket (ground)');
    K.box(gp, [0.012, 0.09, 0.07], 'steel', [0, 0.045, 0], null, 0.002);
    K.screw(gp, 0.01, 0.02, 'chrome', [0.012, 0.07, 0], [0, 0, -90], 'hex');
    const pk = K.part('pack', [1.56, 0.82, -0.28], null, 'Lithium jump pack');
    K.box(pk, [0.21, 0.05, 0.1], 'orange', [0, 0.025, 0], null, 0.012);
    K.box(pk, [0.17, 0.004, 0.08], 'black', [0, 0.051, 0], null, 0);
    const leds = [];
    K.rep(4, (i) => leds.push(K.box(pk, [0.012, 0.004, 0.006], K.std(0x6dff7a, { emissive: 0x20ff40, emissiveIntensity: 0.05 }), [-0.05 + i * 0.018, 0.054, 0.02], null, 0)));
    const boost = K.box(pk, [0.012, 0.004, 0.012], K.std(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.05 }), [0.04, 0.054, -0.015], null, 0);
    const btn = K.part('packButton', [0.065, 0.054, 0.02], pk, 'Power / Boost button');
    K.cyl(btn, [0.009, 0.009, 0.005, 16], 'grey');
    // short leads from the pack end to the clamps
    const red = K.part('packRed', [0, 0, 0], null, 'Red clamp on battery +');
    clamp(K, red, bat.pos, 'red', 90);
    K.tube(red, [[1.665, 0.84, -0.3], [1.72, 0.9, -0.42], [bat.pos[0], bat.pos[1] + 0.2, bat.pos[2] + 0.01], [bat.pos[0] - 0.01, bat.pos[1] + 0.14, bat.pos[2]]], 0.006, 'red');
    const blk = K.part('packBlack', [0, 0, 0], null, 'Black clamp on ground');
    clamp(K, blk, [1.627, 0.7, -0.14], 'black', 90);
    K.tube(blk, [[1.665, 0.84, -0.26], [1.7, 0.92, -0.2], [1.63, 0.92, -0.15], [1.617, 0.85, -0.14]], 0.006, 'black');
    return {
      tick(t, fx) {
        const on = fx === 'packOn';
        leds.forEach((l) => (l.material.emissiveIntensity = fx === 'charge' || on ? 1.3 : 0.05));
        boost.material.emissiveIntensity = on ? 1.6 * (0.6 + 0.4 * Math.sin(t * 5)) : 0.05;
      },
    };
  });

  /* ================= Pickup flat tire: under-bed spare, winch, bottle jack ================= */
  TB.model('truckTire', out({ cam: [-5.6, 2.2, 4.2], at: [-1.9, 0.6, 0.4], hidden: ['rods', 'bottleJack'] }), (K) => {
    const T = pickup(K, { name: 'truck', label: 'Pickup truck', color: 0x9a2a2a, skip: ['rr'] });
    const wo = Object.assign({}, T.wo, { side: 1, flat: true, lugName: 'lugs', lugLabel: 'Lug nuts (6)' });
    wheel(K, T.b, 'wheel', 'Flat tire (rear right)', [PU.xr, PU.R, PU.track], wo);
    // spare winch on the crossmember, guide through the bumper
    const wn = K.part('winch', [-2.4, 0.64, 0], T.b, 'Spare tire winch');
    K.box(wn, [0.13, 0.09, 0.13], 'dark', [0, 0, 0], null, 0.01);
    K.cyl(wn, [0.02, 0.02, 0.06, 6], 'steel', [-0.08, -0.04, 0], [0, 0, 90]);
    K.box(wn, [0.5, 0.025, 0.06], 'black', [0, 0.06, 0], null, 0); // mounting strap to rails
    const ah = K.part('accessHole', [-3.0, 0.745, 0.12], T.b, 'Access hole in the bumper');
    K.cyl(ah, [0.018, 0.018, 0.006, 20], 'black', [0, 0.02, 0]);
    K.tor(ah, [0.018, 0.004], 'rubber', [0, 0.023, 0], [90, 0, 0]);
    // the spare, stored flat with the valve down, hanging on the cable
    const sp = K.part('spare', [-2.4, 0.33, 0], null, 'Full-size spare');
    const sg = K.group(sp, [0, 0, 0], [90, 0, 0]);
    wheel(K, sg, null, null, [0, 0, 0], { R: PU.R, w: 0.28, rr: 0.229, lugs: 0, steel: true });
    const sl = K.part('spareLugs', [0, 0, 0], sg, 'Lug nuts');
    lugSet(K, sl, 6, 0.0675, 0.28 * 0.33 + 0.012);
    const cb = K.part('cable', [0, 0, 0], sp, 'Winch cable and retainer');
    K.cyl(cb, [0.004, 0.004, 0.62, 8], 'steel', [0, 0.33, 0]);
    K.box(cb, [0.13, 0.012, 0.035], 'steel', [0, -0.145, 0], null, 0.003);
    // jack kit: rods through the bumper hole to the winch
    const rods = K.part('rods', [0, 0, 0], null, 'Jack handle + extension rods');
    const H = [-3.7, 1.0, 0.3], Wn = [-2.47, 0.6, -0.016];
    K.bar(rods, H, Wn, 0.0075, 'black');
    K.bar(rods, [-3.36, 0.888, 0.212], [-3.36, 0.9, 0.22], 0.012, 'steel');
    K.bar(rods, [H[0], H[1], H[2]], [H[0] - 0.02, H[1] + 0.25, H[2] + 0.02], 0.008, 'black');
    K.bar(rods, [H[0] - 0.02, H[1] + 0.25, H[2] + 0.02], [H[0] - 0.02, H[1] + 0.25, H[2] + 0.2], 0.011, 'gripBlack');
    const jk = K.part('bottleJack', [PU.xr, 0, 0.62], null, 'Bottle jack (under the axle)');
    K.box(jk, [0.14, 0.03, 0.12], 'red', [0, 0.015, 0], null, 0.006);
    K.cyl(jk, [0.042, 0.045, 0.2, 24], 'red', [0, 0.13, 0]);
    K.cyl(jk, [0.012, 0.012, 0.05, 12], 'steel', [0.06, 0.06, 0], [0, 0, 90]);
    const ram = K.part('jackRam', [0, 0.23, 0], jk, 'Jack ram & saddle');
    K.cyl(ram, [0.026, 0.026, 0.12, 20], 'chrome', [0, 0.04, 0]);
    K.cyl(ram, [0.036, 0.03, 0.02, 20], 'steel', [0, 0.11, 0]);
    const ch = K.part('chock', [PU.xf - 0.47, 0, -PU.track], null, 'Wheel chock');
    K.ext(ch, [[-0.09, 0], [0.11, 0], [-0.09, 0.15]], 0.16, 'yellow', [0, 0, -0.08], null, 0.008);
    const haz = [];
    [[2.86, 1.12, 0.72], [2.86, 1.12, -0.72], [-2.92, 1.2, 0.88], [-2.92, 1.2, -0.88]].forEach((p) =>
      haz.push(K.box(T.b, [0.03, 0.05, 0.08], K.std(0xffb54a, { emissive: 0xff9a00, emissiveIntensity: 0.1 }), p, null, 0.006))
    );
    return { tick(t, fx) { const on = fx === 'hazard' && Math.sin(t * 6) > 0; haz.forEach((h) => (h.material.emissiveIntensity = on ? 1.5 : 0.1)); } };
  });

  /* ================= Diesel truck fluids (oil, coolant, DEF, washer) ================= */
  TB.model('dieselEngine', gar({ cam: [3.9, 2.35, -1.9], at: [1.9, 1.15, 0], hidden: ['oilJug', 'defJug', 'rag'] }), (K) => {
    const T = pickup(K, { name: 'truck', label: 'Diesel pickup', color: 0xe9e6e0, hood: 64 });
    const b = T.b;
    dieselBay(K, b);
    battery(K, b, null, null, [2.4, 0.95, 0.66]);
    battery(K, b, null, null, [2.4, 0.95, -0.62]);
    const dip = K.part('dipstick', [1.62, 1.18, 0.36], b, 'Oil dipstick');
    K.tor(dip, [0.022, 0.006], 'yellow', [0, 0.05, 0], [0, 90, 0]);
    K.cyl(dip, [0.004, 0.004, 0.8, 8], 'steel', [0, -0.37, 0]);
    const mk = K.part('marks', [0, -0.72, 0], dip, 'ADD / FULL marks (crosshatch)');
    K.box(mk, [0.012, 0.06, 0.012], K.std(0x3a2a18, { roughness: 0.3 }), [0, 0, 0], null, 0);
    K.box(mk, [0.014, 0.003, 0.014], 'red', [0, 0.03, 0], null, 0);
    K.box(mk, [0.014, 0.003, 0.014], 'red', [0, -0.03, 0], null, 0);
    K.cyl(b, [0.012, 0.012, 0.3, 12], 'black', [1.62, 1.0, 0.36]); // dipstick tube
    const cap = K.part('oilCap', [2.2, 1.24, -0.27], b, 'Oil fill cap (15W-40)');
    K.ccyl(cap, [0.035, 0.03, 24], 'yellow', [0, 0.015, 0]);
    const dg = K.part('degas', [1.35, 1.06, -0.72], b, 'Coolant degas bottle');
    K.box(dg, [0.24, 0.18, 0.14], K.std(0xe7e3da, { transparent: true, opacity: 0.55 }), [0, 0, 0], null, 0.02);
    K.box(dg, [0.22, 0.1, 0.12], K.std(0xf08a3a, { transparent: true, opacity: 0.85 }), [0, -0.035, 0], null, 0.01);
    K.box(dg, [0.004, 0.004, 0.142], 'black', [0.0, 0.03, 0], null, 0);
    K.ccyl(dg, [0.035, 0.04, 24], 'black', [0.06, 0.11, 0]);
    const def = K.part('defTank', [1.32, 1.04, 0.72], b, 'DEF tank');
    K.box(def, [0.26, 0.16, 0.16], K.std(0xf2f2ee, { transparent: true, opacity: 0.8 }), [0, 0, 0], null, 0.02);
    K.cyl(def, [0.03, 0.03, 0.06, 20], K.std(0xf2f2ee), [0.06, 0.1, 0]);
    const dc = K.part('defCap', [0.06, 0.14, 0], def, 'Blue DEF cap');
    K.ccyl(dc, [0.036, 0.03, 24], 'blue', [0, 0, 0]);
    const ws = K.part('washer', [2.1, 1.12, -0.8], b, 'Washer fluid fill');
    K.cyl(ws, [0.025, 0.025, 0.1, 16], 'black', [0, 0, 0]);
    K.ccyl(ws, [0.03, 0.025, 20], 'blue', [0, 0.06, 0]);
    const oj = K.part('oilJug', [2.28, 1.48, -0.27], b, '15W-40 diesel oil (CK-4)');
    K.box(oj, [0.11, 0.24, 0.07], 'gripYellow', [0.06, 0.04, 0], [0, 0, 125], 0.015);
    K.cyl(oj, [0.016, 0.016, 0.05], 'black', [-0.05, -0.04, 0], [0, 0, 125]);
    const dj = K.part('defJug', [1.36, 1.42, 0.65], b, 'DEF jug with spout (2.5 gal)');
    K.box(dj, [0.26, 0.3, 0.16], K.std(0xf4f6f8), [0.14, 0.06, 0], [0, 0, 115], 0.02);
    K.box(dj, [0.1, 0.12, 0.162], 'blue', [0.14, 0.06, 0], [0, 0, 115], 0.002);
    K.bar(dj, [0.0, 0.0, 0.0], [-0.06, -0.1, 0.06], 0.01, 'offwhite');
    const rag = K.part('rag', [1.62, 1.6, 0.42], b, 'Lint-free rag');
    K.box(rag, [0.16, 0.012, 0.12], 'sky', [0, 0, 0], [0, 0, 20], 0.004);
    return {};
  });

  /* ================= Engine air filter ================= */
  function pleats(K, p, w, d, n, col, h) {
    K.box(p, [w + 0.012, 0.014, d + 0.012], K.std(0xd5743a, { roughness: 0.8 }), [0, 0, 0], null, 0.004);
    K.rep(n, (i) => K.box(p, [0.008, h || 0.04, d], K.std(col, { roughness: 0.95 }), [-w / 2 + (w * (i + 0.5)) / n, 0.008, 0], [0, 0, i % 2 ? 10 : -10], 0.002));
  }
  TB.model('airFilter', gar({ cam: [2.75, 1.45, 1.35], at: [1.72, 0.8, 0.5], hidden: ['newFilter'] }), (K) => {
    const s = sedan(K, { name: 'car', label: 'Car', color: 0x5c6f82, hood: 60 });
    sedanBay(K, s.g, { airbox: false });
    const base = K.part('airboxBase', [1.75, 0.7, 0.52], null, 'Air box (lower half)');
    K.box(base, [0.32, 0.16, 0.3], 'black', [0, 0, 0], null, 0.02);
    K.tube(base, [[0.16, -0.04, 0.06], [0.24, -0.06, 0.1], [0.3, -0.05, 0.12]], 0.04, 'black'); // snorkel
    const lid = K.part('airLid', [1.59, 0.78, 0.52], null, 'Air box lid');
    K.box(lid, [0.33, 0.055, 0.31], 'dark', [0.165, 0.03, 0], null, 0.02);
    K.rep(5, (i) => K.box(lid, [0.3, 0.012, 0.012], 'black', [0.165, 0.062, -0.12 + i * 0.06], null, 0.003));
    K.cyl(lid, [0.048, 0.048, 0.06, 24], 'dark', [0.06, 0.08, -0.06]);
    const duct = K.part('duct', [0, 0, 0], null, 'Intake duct to the throttle body');
    const dp = [[1.65, 0.88, 0.46], [1.6, 0.93, 0.38], [1.5, 0.92, 0.24], [1.43, 0.86, 0.13]];
    K.tube(duct, dp, 0.044, 'rubber');
    [0.3, 0.38, 0.46].forEach((z, i) => K.tor(duct, [0.047, 0.005], 'black', [1.6 - i * 0.03, 0.925, z - 0.05], [0, 60, 0]));
    const maf = K.part('maf', [1.63, 0.93, 0.4], duct, 'Airflow sensor (MAF) plug');
    K.box(maf, [0.05, 0.03, 0.04], 'black', [0, 0.04, 0], null, 0.005);
    K.box(maf, [0.025, 0.02, 0.025], 'grey', [0.03, 0.045, 0], null, 0.004);
    K.tube(maf, [[0.04, 0.05, 0], [0.1, 0.07, 0.05], [0.15, 0.05, 0.1]], 0.004, 'black');
    const cl = K.part('ductClamp', [1.44, 0.865, 0.14], null, 'Duct hose clamp');
    K.tor(cl, [0.047, 0.004], 'steel', [0, 0, 0], [0, 60, 0]);
    K.box(cl, [0.018, 0.02, 0.025], 'steel', [0.0, 0.05, 0], null, 0.003);
    const clips = K.part('clips', [1.91, 0.72, 0.52], null, 'Spring clips (3)');
    [-0.1, 0, 0.1].forEach((dz) => {
      K.box(clips, [0.006, 0.09, 0.022], 'steel', [0.004, 0.045, dz], null, 0.002);
      K.box(clips, [0.02, 0.006, 0.022], 'steel', [-0.005, 0.09, dz], null, 0.002);
    });
    const of = K.part('oldFilter', [1.75, 0.785, 0.52], null, 'Old filter (dirty)');
    pleats(K, of, 0.27, 0.25, 16, 0x6e6355);
    const nf = K.part('newFilter', [1.75, 0.785, 0.52], null, 'New filter');
    pleats(K, nf, 0.27, 0.25, 16, 0xf3efe2);
    return {};
  });

  /* ================= Cabin air filter behind the glove box ================= */
  TB.model('cabinFilter', gar({ cam: [0.42, 0.8, 0.78], at: [0, 0.55, -0.3], ground: null, tex: [], hidden: ['newFilter'] }), (K) => {
    const trim = K.std(0x2f3237, { roughness: 0.7 });
    const trim2 = K.std(0x45494f, { roughness: 0.65 });
    K.box(null, [2.2, 0.03, 2.0], K.std(0x2a2b2e, { roughness: 1 }), [0, -0.015, 0.2], null, 0); // carpet
    const dash = K.part('dash', [0, 0, 0], null, 'Dashboard');
    K.box(dash, [1.5, 0.28, 0.7], trim, [0, 0.82, -0.55], null, 0.04);
    K.box(dash, [1.5, 0.06, 0.4], trim2, [0, 0.98, -0.45], [-8, 0, 0], 0.03);
    K.box(dash, [0.53, 0.25, 0.25], trim, [-0.48, 0.565, -0.32], null, 0.02);
    K.box(dash, [0.53, 0.25, 0.25], trim, [0.48, 0.565, -0.32], null, 0.02);
    K.box(dash, [1.5, 0.16, 0.6], trim, [0, 0.26, -0.75], null, 0.02); // footwell front
    K.box(dash, [0.3, 0.6, 0.9], trim2, [-0.85, 0.3, -0.1], null, 0.04); // console
    K.box(dash, [0.05, 0.9, 1.4], trim2, [0.78, 0.5, -0.1], null, 0.02); // door
    K.box(dash, [1.5, 0.004, 0.5], K.phys(0x1d2a33, { transparent: true, opacity: 0.5, roughness: 0.05 }), [0, 1.2, -0.75], [-28, 0, 0], 0);
    // HVAC housing with filter door behind the glove box
    const hv = K.part('housing', [0, 0.55, -0.6], null, 'HVAC blower housing');
    K.box(hv, [0.42, 0.32, 0.3], K.std(0x6a6f75, { roughness: 0.6 }), [0, 0, 0], null, 0.01);
    const door = K.part('filterDoor', [0, 0.012, 0.155], hv, 'Filter access door');
    K.box(door, [0.27, 0.045, 0.012], K.std(0x55595f, { roughness: 0.6 }), [0, 0, 0], null, 0.004);
    [-1, 1].forEach((sd) => K.box(door, [0.02, 0.025, 0.012], 'black', [sd * 0.145, 0, 0.004], null, 0.003));
    const of = K.part('oldFilter', [0, 0.567, -0.58], null, 'Old cabin filter');
    pleats(K, of, 0.22, 0.2, 14, 0x7b6e5c, 0.022);
    K.box(of, [0.05, 0.004, 0.03], 'black', [0.05, 0.022, 0.05], null, 0); // leaf
    const nf = K.part('newFilter', [0, 0.567, -0.58], null, 'New filter (arrow down)');
    pleats(K, nf, 0.22, 0.2, 14, 0xf3efe2, 0.022);
    const ar = K.part('arrow', [0, 0.012, 0.107], nf, 'AIR FLOW arrow');
    K.box(ar, [0.006, 0.014, 0.002], 'blue', [0, 0.006, 0], null, 0);
    K.cone(ar, [0.007, 0.01, 3], 'blue', [0, -0.004, 0], [180, 0, 0]);
    // glove box, hinged at its bottom front edge
    const gb = K.part('glovebox', [0, 0.44, -0.2], null, 'Glove box');
    K.box(gb, [0.42, 0.25, 0.022], trim2, [0, 0.125, 0.011], null, 0.008);
    K.box(gb, [0.1, 0.025, 0.012], 'chrome', [0, 0.2, 0.028], null, 0.004);
    // wedge-shaped bin: shallow at the hinge, deep at the top, so it can drop without hitting the dash
    [-1, 1].forEach((sd) => K.ext(K.group(gb, [sd * 0.19 - 0.005, 0, 0], [0, 90, 0]), [[0, 0.01], [0.2, 0.22], [0, 0.22]], 0.01, trim));
    K.box(gb, [0.38, 0.29, 0.008], trim, [0, 0.115, -0.1], [-43.6, 0, 0], 0);
    const st = K.part('stops', [0, 0, 0], gb, 'Side stops');
    [-1, 1].forEach((sd) => K.box(st, [0.016, 0.02, 0.03], 'black', [sd * 0.198, 0.2, -0.17], null, 0.004));
    const dm = K.part('damper', [0.2, 0.17, -0.1], gb, 'Damper arm');
    K.cyl(dm, [0.008, 0.008, 0.14, 12], 'black', [0.01, 0.0, -0.06], [70, 0, 0]);
    K.cyl(dm, [0.01, 0.01, 0.012, 12], 'grey', [0.01, 0, 0], [0, 0, 90]);
    return {};
  });

  /* ================= Headlight bulb (H11 low beam), driver side ================= */
  TB.model('headlight', gar({ cam: [1.35, 1.25, -1.15], at: [1.95, 0.74, -0.58], hidden: ['newBulb'] }), (K) => {
    const s = sedan(K, { name: 'car', label: 'Car', color: 0x3e5a7a, hood: 62, noLamps: true });
    sedanBay(K, s.g);
    const hs = K.part('housing', [2.1, 0.72, -0.6], null, 'Headlight housing');
    K.box(hs, [0.24, 0.17, 0.42], 'black', [-0.04, 0, 0], [0, 0, -10], 0.03);
    K.cyl(hs, [0.045, 0.05, 0.05, 24], 'black', [-0.16, 0.02, 0.05], [0, 0, 90]); // low-beam socket boss
    K.cyl(hs, [0.035, 0.04, 0.04, 24], 'black', [-0.15, 0.02, -0.1], [0, 0, 90]); // high-beam boss
    const lensMat = K.phys(0xe8f0f6, { transparent: true, opacity: 0.45, roughness: 0.05, clearcoat: 1, emissive: 0xfff4d6, emissiveIntensity: 0 });
    const lens = K.part('lens', [2.21, 0.72, -0.6], null, 'Lens (front)');
    K.box(lens, [0.06, 0.12, 0.43], lensMat, [0, 0, 0], [0, 0, -14], 0.025);
    K.cyl(lens, [0.04, 0.04, 0.01, 24], 'chrome', [-0.02, 0.0, 0.05], [0, 0, 90]);
    const pass = K.group(null, [2.21, 0.72, 0.6]);
    K.box(pass, [0.2, 0.13, 0.42], K.phys(0xe8f0f6, { transparent: true, opacity: 0.45, roughness: 0.05 }), [-0.04, 0, 0], [0, 0, -12], 0.02);
    function bulb(name, label, glow) {
      const b = K.part(name, [1.92, 0.74, -0.55], null, label);
      K.cyl(b, [0.021, 0.021, 0.005, 24], 'black', [0.004, 0, 0], [0, 0, 90]);
      K.box(b, [0.008, 0.012, 0.05], 'black', [0.006, 0, 0], null, 0.002); // locking tabs
      K.box(b, [0.03, 0.03, 0.024], K.std(0x2b2d31, { roughness: 0.5 }), [-0.016, 0.0, 0], null, 0.004);
      K.box(b, [0.014, 0.02, 0.03], K.std(0x2b2d31, { roughness: 0.5 }), [-0.03, -0.022, 0], null, 0.003);
      K.cyl(b, [0.006, 0.0065, 0.03, 16], glow || K.phys(0xf6f8ff, { transparent: true, opacity: 0.7, roughness: 0.05 }), [0.024, 0, 0], [0, 0, 90]);
      return b;
    }
    const filament = K.std(0xfff2c0, { emissive: 0xffe2a0, emissiveIntensity: 0.05 });
    bulb('bulb', 'Old H11 bulb', filament);
    bulb('newBulb', 'New H11 bulb (hold the base)');
    const cn = K.part('connector', [1.89, 0.718, -0.55], null, 'Wiring connector');
    K.box(cn, [0.022, 0.016, 0.026], 'grey', [0, 0, 0], null, 0.003);
    K.box(cn, [0.008, 0.006, 0.01], 'black', [0.0, 0.01, 0], null, 0.001);
    K.tube(cn, [[-0.01, -0.006, 0.004], [-0.04, -0.04, 0.01], [-0.07, -0.08, 0.06]], 0.003, 'black');
    K.tube(cn, [[-0.01, -0.006, -0.004], [-0.042, -0.042, 0.0], [-0.075, -0.085, 0.05]], 0.003, 'black');
    return { tick(t, fx) { lensMat.emissiveIntensity = fx === 'lamp' ? 0.9 : 0; filament.emissiveIntensity = fx === 'lamp' ? 1.5 : 0.05; } };
  });

  /* ================= Replace a car battery ================= */
  TB.model('batteryBay', gar({ cam: [2.45, 1.4, -1.35], at: [1.72, 0.8, -0.56], hidden: ['newBattery', 'washers'] }), (K) => {
    const s = sedan(K, { name: 'car', label: 'Car', color: 0x8a8f96, hood: 62 });
    sedanBay(K, s.g, { battery: false });
    const tray = K.part('tray', [1.72, 0.6, -0.56], null, 'Battery tray');
    K.box(tray, [0.26, 0.02, 0.2], 'black', [0, 0, 0], null, 0.004);
    [-1, 1].forEach((sd) => K.box(tray, [0.26, 0.03, 0.008], 'black', [0, 0.02, sd * 0.1], null, 0.002));
    const ob = battery(K, null, 'oldBattery', 'Old battery', [1.72, 0.61, -0.56], { noCables: true });
    const corr = K.part('corrosion', [0, 0, 0], 'oldBattery', 'Corrosion');
    [[0.075, 0.228, -0.04], [0.085, 0.226, -0.065], [0.06, 0.226, -0.068]].forEach((p) => K.sph(corr, 0.009, K.std(0xd6e8e0, { roughness: 1 }), p, [1, 0.6, 1]));
    battery(K, null, 'newBattery', 'New battery (same group size)', [1.72, 0.61, -0.56], { noCables: true, lidMat: K.std(0x30343a), label: 'blue' });
    const lead = K.std(0x9ea3a8, { metalness: 0.7, roughness: 0.45 });
    function term(name, label, at, col, cableTo) {
      const t = K.part(name, at, null, label);
      K.cyl(t, [0.014, 0.014, 0.02, 20, true], lead, [0, -0.004, 0]);
      K.box(t, [0.03, 0.016, 0.02], lead, [0, -0.004, -0.022], null, 0.003);
      K.screw(t, 0.008, 0.035, 'steel', [0, -0.004, -0.04], [-90, 0, 0], 'hex');
      if (col === 'red') K.box(t, [0.045, 0.03, 0.05], 'red', [0, 0.012, -0.012], null, 0.008);
      K.tube(t, [[0, 0, -0.03], [0.01, 0.01, -0.07], cableTo.mid, cableTo.end], 0.008, col);
      return t;
    }
    term('posClamp', 'Positive (+) clamp', ob.pos, 'red', { mid: [0.08, 0.0, -0.12], end: [0.2, -0.15, -0.16] });
    term('negClamp', 'Negative (−) clamp', ob.neg, 'black', { mid: [-0.06, 0.01, -0.12], end: [-0.08, -0.1, -0.2] });
    const hd = K.part('holdDown', [1.72, 0.845, -0.56], null, 'Hold-down bracket');
    K.box(hd, [0.03, 0.012, 0.21], 'black', [0, 0.006, 0], null, 0.003);
    [-1, 1].forEach((sd) => {
      K.bar(hd, [0, 0.01, sd * 0.1], [0, -0.23, sd * 0.11], 0.004, 'steel');
      K.nut(hd, 0.013, 0.008, 'steel', [0, 0.016, sd * 0.1]);
    });
    const ws = K.part('washers', [0, 0, 0], null, 'Anti-corrosion felt washers');
    K.cyl(ws, [0.017, 0.017, 0.003, 20], 'red', [ob.pos[0], ob.pos[1] - 0.02, ob.pos[2]]);
    K.cyl(ws, [0.017, 0.017, 0.003, 20], 'green', [ob.neg[0], ob.neg[1] - 0.02, ob.neg[2]]);
    return {};
  });

  /* ================= Bike scenes (real size: 700c / 29″ wheels) ================= */
  const BIKE = { env: 'garage', unit: 1, tex: ['concrete_floor_01'], ground: { tex: 'concrete_floor_01', repeat: 5, radius: 4 } };
  const bk = (o) => Object.assign({}, BIKE, o);
  // Spoked wheel, axle at the parent's origin, drive side +z.
  function bikeWheel(K, p, o) {
    o = o || {};
    const rr = o.rim || 0.311;
    if (!o.noTire) {
      K.tor(p, [rr + 0.018, 0.018], 'rubber');
      K.tor(p, [rr + 0.012, 0.0155], K.std(0xb08a5a, { roughness: 0.8 }), [0, 0, 0]);
    }
    K.tor(p, [rr - 0.004, 0.0095], K.std(0x2a2c30, { metalness: 0.6, roughness: 0.4 }));
    K.cyl(p, [0.018, 0.018, 0.1, 20], 'grey', [0, 0, 0], [90, 0, 0]);
    [-1, 1].forEach((s) => K.cyl(p, [0.028, 0.028, 0.004, 24], 'grey', [0, 0, s * 0.032], [90, 0, 0]));
    K.rep(28, (i) => {
      const a = (i * 2 * PI) / 28;
      const s = i % 2 ? 1 : -1;
      K.bar(p, [Math.cos(a + s * 0.25) * 0.026, Math.sin(a + s * 0.25) * 0.026, s * 0.032], [Math.cos(a) * (rr - 0.012), Math.sin(a) * (rr - 0.012), 0], 0.0011, 'chrome', 6);
    });
  }
  function rotor(K, p, z) {
    K.ext(p, K.circle(0, 0, 0.08, 40), 0.0018, 'steel', [0, 0, z - 0.0009], null, 0, [K.circle(0, 0, 0.064, 40).reverse()]);
    K.rep(6, (i) => {
      const a = (i * PI) / 3;
      K.box(p, [0.008, 0.05, 0.0018], 'steel', [Math.cos(a) * 0.042, Math.sin(a) * 0.042, z], [0, 0, (a * 180) / PI - 90], 0);
      K.screw(p, 0.005, 0.004, 'dark', [Math.cos(a + 0.5) * 0.022, Math.sin(a + 0.5) * 0.022, z - 0.001], [-90, 0, 0], 'hex');
    });
    K.cyl(p, [0.026, 0.026, 0.004, 24], 'dark', [0, 0, z], [90, 0, 0]);
  }

  /* Front end with a disc brake. kind: 'mech' | 'hydro'. Caliper on the left (-z) fork leg. */
  function discScene(K, kind) {
    const fc = K.std(0x2f6f6a, { roughness: 0.35, metalness: 0.3 });
    const A = [0, 0.35, 0];
    const fw = K.part('frontWheel', A, null, 'Front wheel');
    bikeWheel(K, fw);
    const rt = K.part('rotor', [0, 0, 0], fw, '160 mm rotor');
    rotor(K, rt, -0.045);
    const qr = K.part('qr', [0, 0, -0.065], fw, 'Quick-release lever');
    K.cyl(qr, [0.012, 0.012, 0.012, 16], 'chrome', [0, 0, 0], [90, 0, 0]);
    K.box(qr, [0.075, 0.012, 0.008], 'chrome', [0.035, 0.0, -0.008], [0, 0, 8], 0.003);
    K.bar(fw, [0, 0, -0.07], [0, 0, 0.07], 0.0025, 'steel');
    // fork, head tube, bar
    const fork = K.part('fork', [0, 0, 0], null, 'Fork');
    [-1, 1].forEach((s) => {
      K.bar(fork, [0, 0.35, s * 0.058], [-0.1, 0.74, s * 0.058], 0.014, fc);
      K.box(fork, [0.03, 0.03, 0.006], fc, [0, 0.35, s * 0.058], null, 0.002); // dropout
    });
    K.box(fork, [0.07, 0.04, 0.15], fc, [-0.1, 0.75, 0], null, 0.012);
    K.bar(fork, [-0.1, 0.75, 0], [-0.15, 0.96, 0], 0.019, fc);
    K.bar(fork, [-0.14, 0.95, 0], [-0.07, 0.98, 0], 0.016, 'black'); // stem
    K.bar(fork, [-0.065, 0.985, -0.34], [-0.065, 0.985, 0.34], 0.011, 'black');
    [-1, 1].forEach((s) => K.bar(fork, [-0.065, 0.985, s * 0.24], [-0.065, 0.985, s * 0.34], 0.016, 'gripBlack'));
    K.bar(fork, [-0.14, 0.92, 0], [-0.75, 0.9, 0], 0.02, fc);
    K.bar(fork, [-0.12, 0.8, 0], [-0.62, 0.3, 0], 0.024, fc);
    // post mount tabs on the left leg
    K.box(fork, [0.05, 0.02, 0.012], fc, [-0.04, 0.43, -0.062], [0, 0, -30], 0.003);
    // caliper on the rotor, rotated so local +y points radially out at 150°
    const ang = 150 * D;
    const cpos = [A[0] + 0.07 * Math.cos(ang), A[1] + 0.07 * Math.sin(ang), -0.045];
    const cal = K.part('caliper', cpos, null, kind === 'mech' ? 'Mechanical caliper' : 'Hydraulic caliper');
    const cg = K.group(cal, [0, 0, 0], [0, 0, 60]);
    const body = kind === 'mech' ? K.std(0x9ea4aa, { metalness: 0.8, roughness: 0.35 }) : K.std(0x23262a, { metalness: 0.5, roughness: 0.4 });
    [-1, 1].forEach((s) => K.box(cg, [0.062, 0.036, 0.013], body, [0, -0.002, s * 0.0135], null, 0.005));
    [-1, 1].forEach((s) => K.box(cg, [0.012, 0.012, 0.04], body, [s * 0.025, 0.021, 0], null, 0.003));
    [-1, 1].forEach((s) => K.screw(cg, 0.006, 0.02, 'steel', [s * 0.02, 0.032, 0.013], [0, 0, 0], 'hex'));
    function padSet(name, label, worn) {
      const pd = K.part(name, [0, 0, 0], cg, label);
      [-1, 1].forEach((s) => {
        K.box(pd, [0.034, 0.026, 0.0018], 'steel', [0, 0, s * 0.0062], null, 0);
        K.box(pd, [0.008, 0.016, 0.0018], 'steel', [0, 0.02, s * 0.0062], null, 0);
        K.box(pd, [0.032, 0.022, worn ? 0.0012 : 0.0035], K.std(worn ? 0x5a4a3a : 0x6b5a48, { roughness: 1 }), [0, 0, s * (worn ? 0.0047 : 0.0035)], null, 0);
      });
      K.box(pd, [0.004, 0.02, 0.011], K.std(0xc9ced3, { metalness: 0.9, roughness: 0.3 }), [0.012, 0.012, 0], null, 0); // spring
      K.box(pd, [0.004, 0.02, 0.011], K.std(0xc9ced3, { metalness: 0.9, roughness: 0.3 }), [-0.012, 0.012, 0], null, 0);
      return pd;
    }
    padSet('pads', 'Worn pads + spring', true);
    padSet('newPads', 'New pads + spring', false);
    const pin = K.part('padPin', [0, 0.024, 0], cg, 'Pad retaining pin');
    K.cyl(pin, [0.0018, 0.0018, 0.05, 10], 'steel', [0, 0, 0], [90, 0, 0]);
    K.cyl(pin, [0.004, 0.004, 0.003, 12], 'steel', [0, 0, 0.026], [90, 0, 0]);
    K.box(pin, [0.002, 0.008, 0.002], 'steel', [0, 0, -0.025], null, 0);
    if (kind === 'hydro') {
      const ps = K.part('pistons', [0, 0, 0], cg, 'Pistons');
      [-1, 1].forEach((s) => K.cyl(ps, [0.011, 0.011, 0.006, 20], 'offwhite', [0, -0.004, s * 0.0105], [90, 0, 0]));
      const sp = K.part('spreader', [0, 0.04, 0], cg, 'Plastic pad spreader');
      K.box(sp, [0.025, 0.05, 0.003], 'yellow', [0, 0, 0], null, 0.001);
      const lv = K.part('lever', [-0.065, 0.985, -0.2], null, 'Hydraulic lever');
      K.cyl(lv, [0.017, 0.017, 0.035, 20], 'black', [0, 0, 0], [90, 0, 0]);
      K.box(lv, [0.05, 0.025, 0.03], 'black', [0.02, 0.025, 0], null, 0.006); // reservoir
      K.box(lv, [0.02, 0.012, 0.11], 'grey', [0.04, -0.005, -0.07], [0, -12, 0], 0.004);
      const hose = K.part('hose', [0, 0, 0], null, 'Brake hose');
      K.tube(hose, [[-0.045, 0.99, -0.19], [0.03, 0.9, -0.14], [-0.03, 0.75, -0.08], [-0.03, 0.55, -0.075], [-0.08, 0.43, -0.06], [cpos[0] - 0.012, cpos[1] + 0.03, -0.06]], 0.0025, 'black');
    } else {
      const arm = K.part('actArm', [0, 0, -0.024], cg, 'Actuation arm');
      K.cyl(arm, [0.012, 0.012, 0.006, 20], body, [0, -0.002, 0], [90, 0, 0]);
      K.box(arm, [0.045, 0.012, 0.006], body, [0.02, 0.012, 0], [0, 0, 20], 0.002);
      K.screw(arm, 0.005, 0.006, 'steel', [0.04, 0.02, -0.004], [-90, 0, 0], 'hex');
      const kn = K.part('padKnob', [0, -0.002, 0.024], cg, 'Inboard pad adjuster');
      K.ccyl(kn, [0.009, 0.006, 16], 'red', [0, 0, 0.003]).rotation.x = PI / 2;
      const cb = K.part('calBarrel', [-0.03, 0.028, -0.024], cg, 'Caliper barrel adjuster');
      K.cyl(cb, [0.004, 0.004, 0.018, 12], 'chrome', [0, 0, 0], [0, 0, 90]);
      const lv = K.part('lever', [-0.065, 0.985, -0.2], null, 'Brake lever');
      K.cyl(lv, [0.016, 0.016, 0.03, 20], 'grey', [0, 0, 0], [90, 0, 0]);
      K.box(lv, [0.02, 0.012, 0.11], 'grey', [0.04, -0.005, -0.07], [0, -12, 0], 0.004);
      const lb = K.part('leverBarrel', [0.0, 0.0, -0.015], lv, 'Lever barrel adjuster');
      K.cyl(lb, [0.005, 0.005, 0.016, 12], 'chrome', [0.012, 0.012, 0], [0, 0, -40]);
      const hose = K.part('hose', [0, 0, 0], null, 'Cable housing');
      K.tube(hose, [[-0.045, 0.995, -0.21], [0.03, 0.9, -0.15], [-0.03, 0.75, -0.085], [-0.03, 0.55, -0.08], [-0.1, 0.45, -0.075], [cpos[0] - 0.03, cpos[1] + 0.015, -0.07]], 0.0025, 'black');
    }
    return {
      tick(t, fx) {
        fw.rotation.z = fx === 'spin' ? -t * 3 : 0;
      },
    };
  }
  TB.model('bikeDiscMech', bk({ cam: [-0.22, 0.55, -0.42], at: [-0.06, 0.4, -0.045], hidden: ['newPads'] }), (K) => discScene(K, 'mech'));
  TB.model('bikeDiscHydro', bk({ cam: [-0.22, 0.55, -0.42], at: [-0.06, 0.4, -0.045], hidden: ['newPads', 'spreader'] }), (K) => discScene(K, 'hydro'));

  /* ================= Rear derailleur (11-speed, 11–32) ================= */
  TB.model('rearDerailleur', bk({ cam: [0.28, 0.48, 0.5], at: [-0.02, 0.3, 0.05], hidden: ['chainBig'] }), (K) => {
    const fc = K.std(0x2f6f6a, { roughness: 0.35, metalness: 0.3 });
    const A = [0, 0.35, 0];
    const rw = K.part('rearWheel', A, null, 'Rear wheel');
    bikeWheel(K, rw);
    const teeth = [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32];
    const cr = (i) => teeth[i] * 0.00202;
    const cz = (i) => 0.062 - i * 0.0039;
    const cass = K.part('cassette', [0, 0, 0], rw, 'Cassette (11 cogs)');
    teeth.forEach((t, i) => K.cyl(cass, [cr(i), cr(i), 0.0018, t], i % 2 ? 'steel' : K.std(0x9aa0a6, { metalness: 0.9, roughness: 0.35 }), [0, 0, cz(i)], [90, 0, 0]));
    K.cyl(cass, [0.016, 0.016, 0.045, 16], 'dark', [0, 0, 0.042], [90, 0, 0]);
    const frame = K.part('frame', [0, 0, 0], null, 'Frame');
    [-1, 1].forEach((s) => {
      K.bar(frame, [0, 0.35, s * 0.066], [0.42, 0.28, s * 0.04], 0.011, fc);
      K.bar(frame, [0, 0.35, s * 0.066], [0.26, 0.85, s * 0.02], 0.009, fc);
      K.box(frame, [0.035, 0.035, 0.006], fc, [0.0, 0.35, s * 0.066], null, 0.003);
    });
    K.bar(frame, [0.42, 0.28, 0], [0.26, 0.85, 0], 0.016, fc);
    const ring = K.part('chainring', [0.42, 0.28, 0], null, 'Chainring (50T)');
    K.cyl(ring, [0.101, 0.101, 0.003, 50], 'steel', [0, 0, 0.045], [90, 0, 0]);
    K.cyl(ring, [0.07, 0.07, 0.003, 34], 'grey', [0, 0, 0.038], [90, 0, 0]);
    K.bar(ring, [0, 0, 0.05], [0.04, -0.165, 0.06], 0.012, 'black');
    const rp = 0.0222;
    const pul = (i) => ({ xg: -0.018, yg: 0.322 - cr(i), xl: -0.038, yl: 0.252 - cr(i) });
    function chain(name, label, i) {
      const c = K.part(name, [0, 0, 0], null, label);
      const r = cr(i), z = cz(i), q = pul(i);
      const pts = [[0.42, 0.381, 0.045], [0.21, 0.35 + r + 0.015, (0.045 + z) / 2], [0, 0.35 + r, z], [-r * 0.71, 0.35 + r * 0.71, z], [-r, 0.35, z], [-r * 0.71, 0.35 - r * 0.71, z], [0, 0.35 - r, z],
        [q.xg + rp, q.yg, z], [q.xg + rp * 0.5, q.yg - rp * 0.87, z], [q.xl - rp, q.yl, z], [q.xl - rp * 0.5, q.yl - rp * 0.87, z], [q.xl + 0.01, q.yl - rp, z],
        [0.21, 0.2, (0.045 + z) / 2], [0.42, 0.179, 0.045], [0.521, 0.28, 0.045]];
      K.tube(c, pts, 0.0035, 'dark', true);
    }
    chain('chainSmall', 'Chain (smallest cog)', 0);
    chain('chainBig', 'Chain (largest cog)', 10);
    // static: hanger, B-knuckle, limit screws, pinch bolt, barrel
    const hg = K.part('hanger', [0, 0, 0], null, 'Derailleur hanger');
    K.box(hg, [0.022, 0.05, 0.006], 'black', [-0.006, 0.33, 0.072], [0, 0, 12], 0.003);
    K.cyl(hg, [0.013, 0.013, 0.022, 20], 'grey', [-0.012, 0.31, 0.085], [90, 0, 0]);
    const bs = K.part('bScrew', [-0.026, 0.316, 0.085], hg, 'B-tension screw');
    K.screw(bs, 0.004, 0.01, 'steel', [0, 0, 0], [0, 0, 90]);
    const lh = K.part('limitH', [-0.03, 0.296, 0.094], hg, 'H limit screw');
    K.screw(lh, 0.0035, 0.008, 'steel', [0, 0, 0], [0, 0, 90]);
    const ll = K.part('limitL', [-0.03, 0.286, 0.094], hg, 'L limit screw');
    K.screw(ll, 0.0035, 0.008, 'steel', [0, 0, 0], [0, 0, 90]);
    K.box(hg, [0.006, 0.006, 0.003], 'offwhite', [-0.022, 0.296, 0.1], null, 0);
    const pb = K.part('pinchBolt', [-0.005, 0.287, 0.098], hg, 'Cable pinch bolt');
    K.screw(pb, 0.005, 0.006, 'steel', [0, 0, 0], [90, 0, 0], 'hex');
    K.box(hg, [0.026, 0.03, 0.02], 'grey', [-0.018, 0.293, 0.088], [0, 0, 20], 0.004);
    const br = K.part('barrel', [0.012, 0.31, 0.097], hg, 'Barrel adjuster');
    K.cyl(br, [0.005, 0.005, 0.016, 14], 'chrome', [0, 0, 0], [0, 0, 70]);
    K.tube(hg, [[0.2, 0.33, 0.062], [0.09, 0.345, 0.09], [0.035, 0.33, 0.105], [0.018, 0.312, 0.098]], 0.0025, 'black');
    K.tube(hg, [[-0.002, 0.29, 0.1], [-0.01, 0.282, 0.101], [-0.02, 0.27, 0.1]], 0.0008, 'steel');
    // moving: body + cage + pulleys (positioned for the smallest cog)
    const q = pul(0), z0 = cz(0);
    const dr = K.part('derailleur', [0, 0, 0], null, 'Derailleur body & cage');
    K.bar(dr, [-0.016, 0.3, 0.085], [-0.045, q.yg + 0.022, z0 + 0.012], 0.008, 'grey');
    K.box(dr, [0.03, 0.03, 0.006], K.std(0x2b2d31), [-0.03, q.yg + 0.02, z0 + 0.016], [0, 0, 30], 0.004);
    const cage = K.part('cage', [0, 0, 0], dr, 'Cage & pulleys');
    [-1, 1].forEach((s) => K.ext(cage, [[q.xg - 0.012, q.yg + 0.022], [q.xg + 0.02, q.yg + 0.006], [q.xl + 0.02, q.yl - 0.012], [q.xl - 0.012, q.yl - 0.02]], 0.0015, s > 0 ? K.std(0x2b2d31) : 'grey', [0, 0, z0 + s * 0.006 - 0.00075], null, 0));
    const gp = K.part('guidePulley', [q.xg, q.yg, z0], cage, 'Guide (upper) pulley');
    K.cyl(gp, [rp, rp, 0.004, 11], 'black', [0, 0, 0], [90, 0, 0]);
    K.cyl(cage, [rp, rp, 0.004, 11], 'black', [q.xl, q.yl, z0], [90, 0, 0]);
    return { tick(t, fx) { if (fx === 'spin') { rw.rotation.z = -t * 2.5; ring.rotation.z = -t * 1.2; } else { rw.rotation.z = 0; ring.rotation.z = 0; } } };
  });

  /* ================= Tubeless setup, 29″ MTB wheel in a truing stand ================= */
  TB.model('tubelessWheel', bk({ cam: [0.55, 0.95, 1.25], at: [0, 0.6, 0], hidden: ['rimTape', 'valve', 'injector', 'tireGap'] }), (K) => {
    const C = [0, 0.62, 0];
    const st = K.part('stand', [0, 0, 0], null, 'Truing stand');
    K.box(st, [0.5, 0.03, 0.3], 'blue', [0, 0.015, 0], null, 0.01);
    [-1, 1].forEach((s) => K.bar(st, [0, 0.03, s * 0.09], [0, C[1], s * 0.06], 0.012, 'blue'));
    const spin = K.group(null, C);
    const rim = K.part('rim', [0, 0, 0], spin, 'Tubeless-ready rim');
    bikeWheel(K, rim, { noTire: true });
    K.tor(rim, [0.302, 0.004], 'dark');
    const os = K.part('oldStrip', [0, 0, 0], spin, 'Old plastic rim strip');
    K.tor(os, [0.3, 0.0062], 'red');
    const tp = K.part('rimTape', [0, 0, 0], spin, 'Tubeless rim tape');
    K.tor(tp, [0.3005, 0.0066], 'yellow');
    const va = K.part('valve', [0, 0.304, 0], spin, 'Tubeless valve');
    K.cone(va, [0.009, 0.008, 16], 'rubber', [0, -0.004, 0], [180, 0, 0]);
    K.cyl(va, [0.003, 0.003, 0.055, 12], 'black', [0, -0.03, 0]);
    const lr = K.part('lockring', [0, -0.018, 0], va, 'Lockring');
    K.nut(lr, 0.012, 0.004, K.std(0x2a2c30, { metalness: 0.7 }), [0, 0, 0]);
    const core = K.part('valveCore', [0, -0.058, 0], va, 'Valve core (removable)');
    K.cyl(core, [0.0018, 0.0018, 0.012, 8], 'brass', [0, 0, 0]);
    const tire = K.part('tire', [0, 0, 0], spin, '29 × 2.4″ tubeless tire');
    K.tor(tire, [0.34, 0.03, 320], 'rubber', [0, 0, 0], [0, 0, 80]);
    K.rep(80, (i) => {
      const a = (80 + i * 4) * D;
      K.box(tire, [0.012, 0.008, 0.03], 'rubber', [Math.cos(a) * 0.371, Math.sin(a) * 0.371, (i % 2 ? 1 : -1) * 0.012], [0, 0, (a * 180) / PI - 90], 0.002);
    });
    const gap = K.part('tireGap', [0, 0, 0], spin, 'Bead not yet seated');
    K.tor(gap, [0.34, 0.03, 40], 'rubber', [0, 0, 0], [0, 0, 40]);
    const inj = K.part('injector', [0, 0.24, 0], spin, 'Sealant injector on the valve');
    K.cyl(inj, [0.003, 0.003, 0.05, 8], 'offwhite', [0, -0.025, 0]);
    K.cyl(inj, [0.013, 0.013, 0.12, 20], K.std(0xf3f6f8, { transparent: true, opacity: 0.7 }), [0, -0.11, 0]);
    K.cyl(inj, [0.011, 0.011, 0.08, 20], K.std(0x7fd0ff, { transparent: true, opacity: 0.8 }), [0, -0.1, 0]);
    const sl = K.part('sealant', [0.32, 0, 0.18], null, 'Tire sealant (bottle)');
    K.cyl(sl, [0.04, 0.04, 0.2, 24], 'white', [0, 0.1, 0]);
    K.cyl(sl, [0.041, 0.041, 0.08, 24], 'blue', [0, 0.1, 0]);
    K.cone(sl, [0.015, 0.04, 16], 'offwhite', [0, 0.22, 0]);
    return { tick(t, fx) { spin.rotation.z = fx === 'spin' ? -t * 2 : 0; } };
  });

  /* ================= Variants on existing auto guides ================= */
  const AUT = (id) => TB.repair('auto', id);
  const JS = AUT('jump-start');
  const jumpLearn = (how, specs, extra) => Object.assign({ how, specs, terms: [['Parallel', 'Positives joined and negatives joined, so the voltage stays at 12 V and the current adds.'], ['CCA', 'Cold Cranking Amps: starting power at 0 °F.']], mistakes: [], tips: [] }, extra || {});
  JS.variants = [
    { id: 'car', name: 'Regular car', blurb: 'One 12 V battery under the hood. Helper car nose to nose.' },
    {
      id: 'diesel',
      name: 'Diesel pickup (2 batteries)',
      blurb: 'Two 12 V batteries in parallel, glow plugs and a big starter.',
      model: 'jumpDiesel',
      level: 2,
      time: '20–30 min',
      summary: 'Most diesel pickups carry two 12 V batteries wired in parallel. You jump just one of them, the one with the heavy starter cables, then give both time to soak up charge before cranking.',
      intro: { hi: ['deadTruck', 'goodCar'] },
      safety: ['Batteries vent hydrogen. The last clamp goes on bare engine metal, away from both batteries.', 'Never jump a cracked, bulging, leaking or frozen battery.', 'Keep hands, cables and clothing clear of the fan and belts once anything is running.', 'Use heavy cables (4 gauge or thicker). Thin cables get hot on a diesel starter.'],
      causes: [['Both batteries old', 'Paired batteries age together; one weak battery drags the other down.'], ['Cold soak', 'Diesels need far more cranking power in the cold, and glow plugs draw heavily too.'], ['Lights or accessories left on', 'Drains both batteries at once.'], ['Charging fault', 'If it dies again soon, have the alternator(s) tested.']],
      tools: ['Heavy jumper cables (2–4 gauge, 16–20 ft)', 'Helper vehicle', 'Gloves & safety glasses', 'Owner’s manual (which battery to use)'],
      steps: [
        { t: 'Park close, both off', d: 'Nose the helper car up to the truck without touching. Both engines off, parking brakes on, lights and blower off. Open both hoods.', why: 'Every accessory left on steals current the starter needs.', v: { cam: [1.6, 3.4, 6.2], at: [-0.6, 1.0, 0], hi: ['deadTruck', 'goodCar'] } },
        { t: 'Find the two batteries', d: 'Look in both front corners of the bay. The two batteries are cabled together. Pick the one with the thicker cables, usually the passenger side on Ford and GM trucks and the driver side on many Rams.', why: 'In parallel they act as one big battery, but the side wired straight to the starter gets the charge where it’s needed with the least resistance.', v: { cam: [0.9, 2.3, 1.6], at: [-0.75, 1.1, 0.1], hi: ['batPass', 'batDriver', 'batLink'] } },
        { t: 'Red to the truck’s +', d: 'Clamp one red end to the positive (+) post of that battery.', why: 'Connecting the dead side first means nothing is live while you work around the truck.', v: { cam: [0.3, 1.9, 1.5], at: [-0.65, 1.2, 0.6], hi: ['redDead', 'batPass'], show: ['redDead'] } },
        { t: 'Red to helper +', d: 'Clamp the other red end to the helper battery’s positive (+) post.', why: 'Now the positives are linked. Keep the loose black clamps apart and off metal.', v: { cam: [1.6, 1.8, 1.5], at: [0.8, 0.9, 0.6], hi: ['redGood', 'goodBattery'], show: ['redGood'] } },
        { t: 'Black to helper −', d: 'Clamp one black end to the helper battery’s negative (−) post.', why: 'This completes the helper side of the circuit.', v: { cam: [1.6, 1.8, 1.5], at: [0.9, 0.9, 0.6], hi: ['blackGood'], show: ['blackGood'] } },
        { t: 'Black to bare engine metal', d: 'Clamp the last black end to an unpainted bracket or lift hook on the truck’s engine, well away from both batteries.', why: 'The final connection sparks. On a diesel there are two batteries to keep that spark away from.', v: { cam: [0.2, 2.0, 0.9], at: [-0.72, 1.2, -0.08], hi: ['blackGround', 'groundPoint'], show: ['blackGround'] } },
        { t: 'Let them charge 5–10 minutes', d: 'Start the helper and hold it at a fast idle (about 1,500 rpm) for 5–10 minutes.', why: 'Two large batteries take a lot longer to bring up than one car battery. A short wait makes the first crank far more likely to work.', v: { cam: [1.6, 3.4, 6.2], at: [0, 1.0, 0], hi: ['goodCar', 'redDead', 'redGood'] } },
        { t: 'Wait for the glow plugs, then crank', d: 'Turn the truck’s key to ON and wait until the wait-to-start (coil) light goes out. Crank up to 15 seconds. If it doesn’t fire, rest 2 minutes and try again.', why: 'Glow plugs heat the cylinders so the fuel will ignite. Cranking before they finish wastes the battery on a cold engine.', v: { cam: [1.6, 3.4, 6.2], at: [-1.6, 1.2, 0], hi: ['deadTruck'] } },
        { t: 'Remove in reverse, then drive', d: 'Once it runs, remove black from the engine, black from the helper, red from the helper, red from the truck. Drive 30+ minutes or charge both batteries overnight.', why: 'The alternator alone takes a long time to refill two deeply drained batteries.', v: { cam: [0.9, 2.3, 1.6], at: [-0.3, 1.0, 0.2], hi: ['blackGround', 'blackGood', 'redGood', 'redDead'], hide: ['blackGround', 'blackGood', 'redGood', 'redDead'] } },
      ],
      learn: jumpLearn(
        'A diesel compresses air so hard it gets hot enough to ignite fuel, which takes a big, slow-turning starter that can draw 400–700 amps. Two 12 V batteries in parallel share that load. Because they’re joined positive to positive and negative to negative, a jump on either one charges both, but the side wired straight to the starter has the shortest, fattest path.',
        [['System voltage', '12 V (two batteries in parallel)'], ['Crank limit', '15 s on, 2 min rest'], ['Helper charge time', '5–10 min'], ['Cable size', '2–4 gauge']],
        { mistakes: ['Clamping one battery’s + and the other battery’s − as if they were in series.', 'Cranking before the wait-to-start light goes out.', 'Replacing only one of a pair of batteries.'], tips: ['When one battery fails, replace both with the same group size and date.', 'A 2,000 A or larger jump pack can start most diesels without a second vehicle.'] }
      ),
      pro: 'It won’t start after three tries, the batteries are swollen or leaking, or the truck keeps dying (test the batteries and alternator).',
    },
    {
      id: 'hybrid',
      name: 'Hybrid',
      blurb: '12 V battery in the trunk; jump through the post in the under-hood fuse box.',
      model: 'jumpHybrid',
      level: 2,
      time: '20 min',
      summary: 'A hybrid still has a small 12 V battery that wakes up its computers. It usually lives in the trunk or under a seat, so you jump it through a red-capped terminal in the under-hood fuse box.',
      intro: { hi: ['deadCar', 'goodCar'] },
      safety: ['Never touch, clamp to or cut the orange high-voltage cables or the hybrid battery.', 'Use only the 12 V jump terminal and a bare-metal ground the manual shows.', 'Many makers say not to use a hybrid as the helper car for a regular car. Check the manual.'],
      causes: [['Sat unused', 'The small 12 V battery runs down after a few weeks parked.'], ['Interior light or dash cam', 'Small drains add up on a small battery.'], ['Aging 12 V battery', 'Most last 3–6 years.']],
      tools: ['Jumper cables (6 gauge or heavier)', 'Helper vehicle or jump pack', 'Gloves & safety glasses', 'Owner’s manual'],
      steps: [
        { t: 'Both cars off', d: 'Park the helper nose to nose. Turn both off; the hybrid’s READY light must be out. Parking brakes on.', why: 'A dead 12 V battery means the hybrid’s computers can’t switch the high-voltage system on, so it seems completely dead.', v: { cam: [1.2, 3.2, 5.6], at: [-0.8, 0.8, 0], hi: ['deadCar', 'goodCar'] } },
        { t: 'Know where the 12 V battery is', d: 'On most hybrids the 12 V battery sits in the trunk or under the rear seat. You don’t need to reach it; the under-hood jump terminal is wired straight to it.', why: 'Trunk batteries are hard to reach and sealed AGM types vent inside the cabin, so makers give you a safer post up front.', v: { cam: [-6.4, 2.1, 2.6], at: [-4.5, 0.6, 0.4], hi: ['auxBattery'], xray: true } },
        { t: 'Open the fuse box and red cap', d: 'Unclip the under-hood fuse box cover and flip up the red cap marked +.', why: 'This terminal is a remote positive post for the 12 V system, not part of the high-voltage circuit.', v: { cam: [-0.3, 1.7, -1.4], at: [-0.95, 0.85, -0.6], hi: ['fuseBox', 'jumpPost'], mv: { fuseCover: [0, 0.15, -0.2] }, rt: { jumpCap: [0, 0, 70] } } },
        { t: 'Red to the jump post', d: 'Clamp one red end to the jump terminal.', why: 'Dead side first, before anything is live.', v: { cam: [-0.3, 1.7, -1.4], at: [-0.92, 0.88, -0.62], hi: ['redDead', 'jumpPost'], show: ['redDead'] } },
        { t: 'Red to helper +, black to helper −', d: 'Clamp the other red end to the helper battery’s +, then one black end to its −.', why: 'Keep the free black clamp away from all metal until the last step.', v: { cam: [1.5, 1.7, -1.5], at: [0.85, 0.9, -0.5], hi: ['redGood', 'blackGood', 'goodBattery'], show: ['redGood', 'blackGood'] } },
        { t: 'Black to the ground bolt', d: 'Clamp the last black end to the unpainted ground bolt or bracket shown in the manual, away from the fuse box.', why: 'The last connection sparks. Do it away from the battery circuit and the orange cables.', v: { cam: [-0.3, 1.6, -0.9], at: [-0.97, 0.75, -0.2], hi: ['blackGround', 'groundPoint'], show: ['blackGround'] } },
        { t: 'Run the helper, then press POWER', d: 'Start the helper and wait 3–5 minutes. In the hybrid, press the brake and push POWER until READY lights. It may not start the gas engine; that’s normal.', why: 'The 12 V only boots the computers. Once READY, the hybrid battery takes over and recharges the 12 V.', v: { cam: [-1.2, 1.9, -0.7], at: [-1.98, 0.98, -0.35], hi: ['readyLamp'], fx: 'ready' } },
        { t: 'Remove cables, stay in READY', d: 'Remove the cables in reverse order, close the red cap and fuse cover. Leave the car in READY or drive for at least 20–30 minutes.', why: 'The DC-DC converter recharges the 12 V battery only while the car is in READY.', v: { cam: [1.2, 3.2, 5.6], at: [-0.8, 0.8, 0], hi: ['jumpPost', 'fuseBox'], hide: ['redDead', 'redGood', 'blackGood', 'blackGround'], mv: { fuseCover: [0, 0, 0] }, rt: { jumpCap: [0, 0, 0] }, fx: 'ready' } },
      ],
      learn: jumpLearn(
        'A hybrid has two batteries. The big high-voltage pack drives the motor and starts the gas engine; the small 12 V battery runs the lights, locks and computers. If the 12 V is flat, the computers can’t close the relays that connect the big pack, so nothing happens. A jump only has to wake the electronics, which takes far less current than cranking an engine.',
        [['12 V battery type', 'Usually AGM, in trunk or under seat'], ['Wait after connecting', '3–5 min'], ['Stay in READY', '20–30 min']],
        { terms: [['Jump terminal', 'Remote + post under the hood wired to the 12 V battery.'], ['READY', 'Light that means the hybrid system is on.'], ['DC-DC converter', 'Charges the 12 V battery from the high-voltage pack.']], mistakes: ['Clamping to anything orange.', 'Holding POWER without the brake pressed.', 'Expecting the gas engine to crank.'], tips: ['A small lithium jump pack is plenty for a hybrid.', 'If it keeps going flat, have the 12 V battery tested; it’s a common replacement.'] }
      ),
      pro: 'READY won’t come on after a good jump, warning lights stay on, or you see damage near orange cables.',
    },
    {
      id: 'pack',
      name: 'Portable jump pack',
      blurb: 'No second car. A lithium pack clamps straight onto the battery.',
      model: 'jumpPack',
      time: '5–10 min',
      cost: '$0 (pack $60–150)',
      summary: 'A charged lithium jump pack starts most cars on its own. Clamp red to +, black to ground, switch on, and crank within a few seconds.',
      intro: { hi: ['pack', 'battery'] },
      safety: ['Keep the clamps apart once the pack is on.', 'Don’t use a pack on a frozen, cracked or leaking battery.', 'Match the pack to the engine: about 1,000 A for 4–6 cylinder gas engines, 2,000 A+ for big V8s and diesels.'],
      causes: [['Lights left on', 'Drained overnight.'], ['Old battery', 'Most last 3–5 years.'], ['Cold weather', 'Starting takes more current when cold.']],
      tools: ['Charged lithium jump pack', 'Gloves & safety glasses'],
      steps: [
        { t: 'Check the pack and shut everything off', d: 'Make sure the pack shows at least 3 of 4 charge lights. Car off, key out, headlights, blower and radio off.', why: 'A half-charged pack may only manage one or two weak cranks.', v: { cam: [2.6, 1.5, -1.2], at: [1.65, 0.85, -0.4], hi: ['pack'], fx: 'charge' } },
        { t: 'Red clamp to +', d: 'With the pack off, clamp the red clamp to the battery’s positive (+) post. Make sure it bites metal, not the plastic cover.', why: 'Packs stay off until clamped, but connecting red first is the same safe habit as with cables.', v: { cam: [2.4, 1.4, -1.1], at: [1.79, 0.9, -0.6], hi: ['packRed'], show: ['packRed'] } },
        { t: 'Black clamp to ground', d: 'Clamp black to an unpainted engine bracket or bolt. Many packs also allow the negative post; check the pack’s manual.', why: 'A solid ground keeps the circuit resistance low so more current reaches the starter.', v: { cam: [2.4, 1.4, -0.9], at: [1.62, 0.8, -0.2], hi: ['packBlack', 'groundPoint'], show: ['packBlack'] } },
        { t: 'Switch the pack on', d: 'Press the power button. A white or green light means it’s ready. A red error light means the clamps are reversed or not biting; fix that first.', why: 'The pack checks polarity before it connects its cells to your battery.', v: { cam: [2.2, 1.3, -0.8], at: [1.58, 0.85, -0.28], hi: ['packButton', 'pack'], fx: 'packOn' } },
        { t: 'Crank in short bursts', d: 'Crank for no more than 5 seconds. If it doesn’t start, wait a minute and try again.', why: 'Long cranks overheat the starter and drain the pack quickly.', v: { cam: [3.4, 1.9, -2.2], at: [1.2, 0.8, -0.3], hi: ['deadCar'], fx: 'packOn' } },
        { t: 'Remove and recharge', d: 'Within 30 seconds of starting, switch the pack off, remove black, then red. Recharge the pack the same day.', why: 'Lithium packs slowly lose charge in a hot or cold car; keep it topped up so it works next time.', v: { cam: [2.6, 1.5, -1.2], at: [1.65, 0.85, -0.4], hi: ['pack'], hide: ['packRed', 'packBlack'], fx: 'charge' } },
      ],
      learn: jumpLearn(
        'A lithium jump pack is a small, high-current battery with a smart switch. When the clamps are on the right posts, it connects its cells in parallel with your weak battery for the few seconds the starter needs. It doesn’t really recharge your battery; your alternator does that once the engine runs.',
        [['Pack size, 4–6 cyl gas', '≈ 1,000 A'], ['Pack size, V8 / diesel', '2,000–4,000 A'], ['Crank limit', '5 s, then 60 s rest'], ['Recharge pack', 'every 3–6 months']],
        { mistakes: ['Leaving the pack connected after the engine starts.', 'Storing it flat in the trunk for a year.'], tips: ['Most packs double as a USB power bank and flashlight.', 'If the pack won’t detect a nearly dead battery, some have a manual override; read the manual first.'] }
      ),
    },
  ];

  const FT = AUT('flat-tire');
  FT.variants = [
    { id: 'car', name: 'Car', blurb: 'Compact spare in the trunk, scissor jack at the pinch weld.' },
    {
      id: 'pickup',
      name: 'Pickup truck',
      blurb: 'Spare under the bed, lowered by a winch through the bumper; bottle jack.',
      model: 'truckTire',
      level: 2,
      time: '30–45 min',
      summary: 'Pickups hang a full-size spare under the bed. You lower it with the jack rods through a hole in the bumper, lift the axle with a bottle jack, and torque big lug nuts in a star pattern.',
      intro: { hi: ['wheel', 'spare'] },
      safety: ['Get well off the road on flat, firm ground. Hazards on, Park, parking brake on, 4WD off.', 'Never put any part of your body under a truck held only by a jack.', 'Truck wheels and tires weigh 60–90 lb. Roll them; don’t lift them with your back.'],
      causes: [['Puncture', 'Nail or screw in the tread.'], ['Sidewall damage', 'Curbs, rocks and potholes.'], ['Heavy load, low pressure', 'An underinflated tire overheats and fails.']],
      tools: ['Jack kit (bottle jack, handle, extension rods, lug wrench)', 'Wheel chock', 'Gloves & flashlight', 'Owner’s manual (jack points, torque)'],
      steps: [
        { t: 'Make it safe and chock', d: 'Hazards on, Park, parking brake on. Chock the front wheel diagonally opposite the flat.', why: 'When the rear corner lifts, the opposite front wheel is the one that can roll.', v: { cam: [3.4, 1.0, -2.6], at: [1.5, 0.3, -0.87], hi: ['chock'], fx: 'hazard' } },
        { t: 'Assemble the jack rods', d: 'Find the jack kit (often behind or under the rear seat). Snap the extension rods together and add the handle. Pop the plug out of the hole in the rear bumper.', why: 'The rods reach the spare winch, which sits under the bed above the spare.', v: { cam: [-4.6, 1.4, 1.6], at: [-3.0, 0.75, 0.1], hi: ['accessHole'], fx: 'hazard' } },
        { t: 'Lower the spare', d: 'Feed the rods through the hole until the end seats in the winch. Turn counterclockwise until the spare reaches the ground and the cable goes slack.', why: 'The winch is a cable spool. Turning backward pays out cable so the tire comes down slowly.', v: { cam: [-4.6, 1.2, 2.2], at: [-2.8, 0.45, 0.05], hi: ['rods', 'spare', 'winch'], show: ['rods'], mv: { spare: [0, -0.19, 0] } } },
        { t: 'Free the spare', d: 'Pull the spare out from under the bumper, tip the retainer plate up, and slide it through the wheel’s center hole.', why: 'The retainer is a bar that sits across the center hole; tilted, it slips out.', v: { cam: [-4.8, 1.4, 2.2], at: [-3.3, 0.3, 0.4], hi: ['spare', 'cable'], hide: ['rods', 'cable'], mv: { spare: [-1.2, -0.19, 0.6] } } },
        { t: 'Break the lug nuts loose', d: 'With the flat on the ground, loosen each lug nut about half a turn counterclockwise. Stand on the wrench if you need to.', why: 'Truck lugs are torqued to 140–165 ft-lb. The tire’s grip on the ground keeps the wheel from turning.', v: { cam: [-1.0, 0.9, 2.5], at: [-1.75, 0.42, 0.95], hi: ['lugs'], tool: { id: 'lugWrench', at: [-1.75, 0.45, 0.99], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Jack under the axle', d: 'Set the bottle jack on firm ground under the axle tube between the leaf spring and the wheel (see the manual’s diagram). Pump until the tire clears the ground by 1–2″.', why: 'The axle is solid steel and sits right above the wheel, so the lift is short and stable.', v: { cam: [-0.7, 0.6, 2.4], at: [-1.75, 0.35, 0.7], hi: ['bottleJack', 'jackRam'], show: ['bottleJack'], mv: { jackRam: [0, 0.08, 0] }, rt: { truck: [0, 0, -1.25] } } },
        { t: 'Pull the flat', d: 'Remove the nuts, keep them together, and roll the flat off the studs. Lay it flat, partly under the rocker panel.', why: 'If the jack ever slips, the tire under the frame keeps the truck from coming all the way down.', v: { cam: [-0.6, 1.2, 2.8], at: [-1.75, 0.35, 1.2], hi: ['wheel'], mv: { wheel: [0.4, -0.35, 0.35] }, rt: { wheel: [90, 0, 0] } } },
        { t: 'Mount the spare', d: 'Lift the spare onto the studs, valve stem out. Thread every nut on by hand, then snug them in a star pattern.', why: 'Hand-threading prevents cross-threading the big studs; snugging centers the wheel before it carries weight.', v: { cam: [-0.9, 0.9, 2.6], at: [-1.75, 0.48, 0.95], hi: ['spare', 'spareLugs'], mv: { spare: [0.65, 0.16, 0.87] }, rt: { spare: [-90, 0, 0] } } },
        { t: 'Lower and torque in a star', d: 'Lower the jack. Tighten the nuts in a star pattern in two passes to the torque in the manual (often 140–165 ft-lb on half-tons).', why: 'Torquing with the tire on the ground stops the wheel from turning. Two passes pull the wheel flat against the hub.', v: { cam: [-1.0, 0.9, 2.5], at: [-1.75, 0.42, 0.95], hi: ['spareLugs'], mv: { jackRam: [0, 0, 0], spare: [0.65, 0.08, 0.87] }, rt: { truck: [0, 0, 0] }, tool: { id: 'lugWrench', at: [-1.75, 0.478, 0.99], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Stow the flat and recheck', d: 'Slide the flat under the bed valve stem down, thread the retainer through it, and crank clockwise until the winch clicks or slips. Re-torque the lugs after 50 miles.', why: 'A loose spare can drop onto the highway. Lugs settle as the wheel seats in.', v: { cam: [-4.6, 1.2, 2.2], at: [-2.6, 0.45, 0.2], hi: ['wheel', 'winch'], show: ['rods', 'cable'], hide: ['bottleJack'], mv: { wheel: [-0.65, -0.08, -0.87] }, rt: { wheel: [90, 0, 0] } } },
      ],
      learn: {
        how: 'Hanging the spare under the bed saves cargo space. A small cable winch holds it up, driven by the same rods that work the jack. A bottle jack uses a hydraulic ram: each pump pushes oil under a piston, which can lift several tons in a small package. That’s why pickups use them instead of scissor jacks.',
        specs: [['Lug torque (½-ton)', '140–165 ft-lb'], ['Lug torque (¾–1-ton)', '165–200 ft-lb'], ['Spare type', 'full size, check its pressure'], ['Lift', 'tire 1–2″ off the ground']],
        terms: [['Bottle jack', 'Compact hydraulic jack with a vertical ram.'], ['Axle tube', 'The solid steel tube between the rear wheels.'], ['Spare winch', 'Cable hoist under the bed that holds the spare.'], ['Retainer', 'Bar on the cable end that sits through the spare’s center hole.']],
        mistakes: ['Jacking on the bed or bumper.', 'Forgetting the lock in the bumper hole (some trucks need the ignition key).', 'Leaving the spare’s pressure unchecked for years; under-bed spares get filthy and leak.'],
        tips: ['Lower the spare once a year, check its pressure, and spray the winch with lubricant so it works when you need it.', 'Keep a short board in the truck to set the jack on in soft ground.'],
      },
      pro: 'The winch is rusted solid, the lug nuts won’t break loose, or the truck is on a slope or soft shoulder.',
    },
  ];

  const CO = AUT('check-oil');
  CO.variants = [
    { id: 'gas', name: 'Gas car', blurb: 'Oil, coolant and washer fluid.' },
    {
      id: 'diesel',
      name: 'Diesel truck (+ DEF)',
      blurb: 'Big oil capacity, degas bottle, and the blue DEF tank.',
      model: 'dieselEngine',
      level: 1,
      time: '15 min',
      cost: '$0–60',
      summary: 'A diesel pickup holds 12–15 quarts of oil and needs Diesel Exhaust Fluid (DEF) for its emissions system. Check oil, coolant and DEF together so a low DEF tank never puts the truck in limp mode.',
      intro: { hi: ['dipstick', 'defTank', 'degas'] },
      safety: ['Never open the coolant cap on a hot engine.', 'DEF only goes in the blue-capped tank. A single cup in the diesel tank can ruin the fuel system.', 'Diesel oil is hot and the turbo stays hot long after shutdown; give it 10+ minutes.'],
      causes: [['Normal consumption', 'Diesels use some oil between changes.'], ['DEF use', 'Typically 2–3% of fuel used, more when towing.'], ['Coolant loss', 'Leaks or a failing EGR cooler.']],
      tools: ['Lint-free rag', 'Diesel oil (often 15W-40 or 10W-30, API CK-4)', 'DEF (ISO 22241 / API certified) with spout', 'Coolant (correct type)', 'Washer fluid'],
      steps: [
        { t: 'Park level, wait 10 minutes', d: 'Park on level ground, shut the engine off, and wait 10–15 minutes.', why: 'A diesel holds a lot of oil; it takes longer to drain back into the pan for a true reading.', v: { cam: [3.9, 2.35, -1.9], at: [1.9, 1.15, 0], hi: ['dipstick', 'oilCap'] } },
        { t: 'Pull, wipe and re-dip', d: 'Pull the dipstick, wipe it, push it all the way back in, and pull it again.', why: 'The first pull smears oil from the tube; the second shows the real level.', v: { cam: [2.6, 1.9, 1.3], at: [1.62, 1.45, 0.36], hi: ['dipstick', 'rag'], show: ['rag'], mv: { dipstick: [0, 0.7, 0] } } },
        { t: 'Read the crosshatch', d: 'The oil should be in the crosshatch between ADD and FULL. It will look black even right after a change; that’s soot, and it’s normal. Look instead for milky oil or a fuel smell.', why: 'On many diesels ADD to FULL is about 2 quarts. A level that rises between changes can mean fuel dilution.', v: { cam: [2.2, 1.45, 0.95], at: [1.62, 1.18, 0.36], hi: ['marks'], hide: ['rag'] } },
        { t: 'Top up oil if low', d: 'Remove the fill cap and add the oil the cap or manual calls for, 1 quart at a time, re-checking after each.', why: 'Overfilling lets the crankshaft whip the oil into foam.', v: { cam: [3.0, 1.9, -1.0], at: [2.2, 1.35, -0.27], hi: ['oilCap', 'oilJug'], show: ['oilJug'], mv: { dipstick: [0, 0, 0], oilCap: [0, 0.07, -0.06] } } },
        { t: 'Check coolant (cold)', d: 'Look at the degas bottle. With a cold engine, the level should be at the COLD FILL line.', why: 'The degas bottle is pressurized and pulls trapped air out of the system; low coolant there means a leak somewhere.', v: { cam: [2.4, 1.9, -1.6], at: [1.35, 1.1, -0.72], hi: ['degas'], hide: ['oilJug'], mv: { oilCap: [0, 0, 0] } } },
        { t: 'Top up DEF', d: 'Open the blue cap (here under the hood; on most newer trucks it’s next to the fuel filler). Pour DEF from a sealed jug with its spout until the gauge reads full. Don’t overfill.', why: 'When DEF runs out, the truck limits speed or won’t restart. DEF expands when it freezes, so leave the neck empty.', v: { cam: [2.4, 1.9, 1.6], at: [1.32, 1.15, 0.72], hi: ['defTank', 'defCap', 'defJug'], show: ['defJug'], mv: { defCap: [0, 0.06, 0.08] } } },
        { t: 'Wipe spills, fill washer', d: 'Wipe any DEF drips with water. Then fill the washer reservoir.', why: 'Dried DEF leaves white crystals that corrode paint and aluminum.', v: { cam: [3.0, 1.8, -1.6], at: [2.1, 1.15, -0.8], hi: ['washer'], hide: ['defJug'], mv: { defCap: [0, 0, 0] } } },
      ],
      learn: {
        how: 'Diesel oil carries away soot from combustion, so it darkens almost immediately and comes in CK-4 grades built to hold that soot in suspension. DEF is 32.5% urea in purified water. It’s sprayed into the exhaust ahead of a catalyst (SCR), where it turns harmful nitrogen oxides into nitrogen and water. The truck tracks the DEF level and will derate itself if the tank runs dry.',
        specs: [['Oil capacity', '12–15 qt typical'], ['ADD to FULL', '≈ 2 qt (check manual)'], ['DEF use', '2–3% of fuel'], ['DEF shelf life', '≈ 1–2 years, keep below 86 °F']],
        terms: [['DEF', 'Diesel Exhaust Fluid, a urea and water mix.'], ['SCR', 'Selective Catalytic Reduction, the catalyst that uses DEF.'], ['CK-4', 'Current API category for heavy-duty diesel oil.'], ['Degas bottle', 'Pressurized coolant reservoir that purges air.']],
        mistakes: ['Pouring DEF into the fuel tank.', 'Using an old open jug of DEF.', 'Judging diesel oil by its black color.'],
        tips: ['Buy DEF in sealed jugs or at the truck-stop pump; contamination clogs the injector.', 'Keep a 2.5-gallon jug in the truck on long towing trips.'],
      },
      pro: 'Oil is milky, the level keeps rising (fuel in oil), coolant keeps dropping, or a DEF warning stays on after filling.',
    },
  ];

  /* ================= New auto guides ================= */
  TB.more('auto', [
    {
      id: 'engine-air-filter',
      title: 'Replace the engine air filter',
      model: 'airFilter',
      level: 1,
      time: '10–15 min',
      cost: '$15–35',
      summary: 'The engine air filter sits in a black plastic box with a big duct to the engine. Pop the clips, lift the lid, and swap the filter. No tools on most cars.',
      intro: { hi: ['airLid', 'airboxBase'] },
      safety: ['Engine off and cool; the intake side is right next to hot parts.', 'Never run the engine with the lid off; debris can be sucked straight into the cylinders.'],
      causes: [['Mileage', 'Most makers say every 15,000–30,000 miles.'], ['Dusty roads', 'Gravel roads and construction zones clog it far faster.'], ['Debris', 'Leaves and mouse nests end up in the air box.']],
      tools: ['New engine air filter (match the part number)', 'Flat screwdriver or nut driver (some boxes)', 'Shop vac or rag'],
      steps: [
        { t: 'Find the air box', d: 'Open the hood. Follow the big rubber duct from the engine back to the black plastic box near the front.', why: 'The filter sits inside the box, between the outside-air snorkel and the duct to the engine.', v: { cam: [2.75, 1.45, 1.35], at: [1.72, 0.8, 0.5], hi: ['airLid', 'airboxBase', 'duct'] } },
        { t: 'Release the clips', d: 'Flip the spring clips off the lid edge. Some boxes use screws; loosen those instead.', why: 'Clips pull the lid down evenly onto the filter’s rubber rim to seal it.', v: { cam: [2.5, 1.1, 0.95], at: [1.9, 0.76, 0.52], hi: ['clips'], rt: { clips: [0, 0, -70] } } },
        { t: 'Lift the lid', d: 'Tilt the lid up from the clip side. If the duct is stiff, loosen its hose clamp so the lid can swing. Note how the old filter sits.', why: 'Most lids hinge on tabs at the back. Forcing them can crack the plastic or the airflow sensor.', v: { cam: [2.5, 1.35, 1.1], at: [1.75, 0.82, 0.52], hi: ['airLid', 'ductClamp'], rt: { airLid: [0, 0, 38] }, tool: { id: 'flatScrewdriver', at: [1.44, 0.915, 0.14], rot: [0, 0, 0], anim: 'turn' } } },
        { t: 'Lift out the old filter', d: 'Pull the filter straight up. Hold it up to a light: if you can barely see light through the pleats, it was due.', why: 'A clogged filter restricts airflow, which costs power and, on older cars, fuel.', v: { cam: [2.45, 1.4, 1.1], at: [1.8, 0.95, 0.55], hi: ['oldFilter'], mv: { oldFilter: [0.15, 0.32, 0.12] }, rt: { oldFilter: [0, 0, 30] } } },
        { t: 'Clean the box', d: 'Vacuum or wipe out leaves and grit from the lower box. Don’t let anything fall into the duct side.', why: 'Anything on the clean side goes straight into the engine.', v: { cam: [2.4, 1.3, 0.95], at: [1.75, 0.72, 0.52], hi: ['airboxBase'], hide: ['oldFilter'] } },
        { t: 'Drop in the new filter', d: 'Set the new filter in with the pleats and rubber rim facing the same way as the old one. Press the rim down all the way around.', why: 'Any gap at the rim lets dirty air bypass the filter.', v: { cam: [2.4, 1.3, 0.95], at: [1.75, 0.8, 0.52], hi: ['newFilter'], show: ['newFilter'] } },
        { t: 'Close and clip', d: 'Lower the lid, check the rim isn’t pinched, and snap all clips. Re-tighten the duct clamp and check the sensor plug is still connected.', why: 'A loose duct or unplugged airflow sensor triggers a check-engine light.', v: { cam: [2.75, 1.45, 1.35], at: [1.72, 0.8, 0.5], hi: ['clips', 'airLid', 'maf'], rt: { airLid: [0, 0, 0], clips: [0, 0, 0] } } },
      ],
      learn: {
        how: 'An engine burns about 10,000 gallons of air for every gallon of fuel. The pleated paper filter catches dust and sand so it can’t scratch the cylinders. As it fills up, airflow drops. Modern engines adjust fuel for it, so a dirty filter mostly costs power and throttle response.',
        specs: [['Replace every', '15,000–30,000 mi (sooner if dusty)'], ['Inspect', 'every oil change'], ['Typical cost', '$15–35']],
        terms: [['Air box', 'Plastic housing that holds the filter.'], ['MAF sensor', 'Measures the air flowing into the engine.'], ['Pleats', 'Folds that give the paper more surface area.']],
        mistakes: ['Tapping or blowing a paper filter clean (it opens holes).', 'Installing it upside down or with the rim not seated.', 'Leaving a rag in the box.'],
        tips: ['Take the old filter to the store to match the shape.', 'Washable cotton filters need special oil; too much oil can foul the airflow sensor.'],
      },
      pro: 'The air box is cracked, the duct is torn, or there’s oil in the air box (a crankcase ventilation problem).',
    },
    {
      id: 'cabin-air-filter',
      title: 'Replace the cabin air filter',
      model: 'cabinFilter',
      level: 1,
      time: '10–15 min',
      cost: '$15–30',
      summary: 'Weak AC airflow or a musty smell often means a clogged cabin filter. On most cars it slides out behind the glove box. No tools needed.',
      intro: { hi: ['glovebox'] },
      safety: ['Turn the car and the fan off first.', 'Old filters can be full of mold and leaves; wear a dust mask if you’re sensitive.'],
      causes: [['Mileage', 'Every 12,000–15,000 miles or once a year.'], ['Leaves and pollen', 'Clog it fast in spring and fall.'], ['Musty smell', 'Damp debris growing mold.']],
      tools: ['New cabin air filter (carbon type helps with odors)', 'Flashlight', 'Small vacuum (optional)'],
      steps: [
        { t: 'Empty the glove box', d: 'Take everything out and open the door.', why: 'The box drops down further than normal; anything inside will fall out.', v: { cam: [0.42, 0.8, 0.78], at: [0, 0.55, -0.3], hi: ['glovebox'], rt: { glovebox: [35, 0, 0] } } },
        { t: 'Unhook the damper', d: 'Find the thin arm on the right side of the box and slide its end off the pin.', why: 'The damper slows the door. It has to come off before the box can drop.', v: { cam: [0.5, 0.75, 0.4], at: [0.18, 0.55, -0.15], hi: ['damper'], rt: { glovebox: [35, 0, 0] }, mv: { damper: [0.02, 0, 0.04] } } },
        { t: 'Squeeze the sides and drop it', d: 'Press both sides of the box inward until the stops clear the dash, then let it swing all the way down.', why: 'The stops are bumps that limit how far the box opens; flexing the sides lets them pass.', v: { cam: [0.4, 0.9, 0.55], at: [0, 0.55, -0.25], hi: ['stops'], rt: { glovebox: [78, 0, 0] } } },
        { t: 'Open the filter door', d: 'Behind the box, squeeze the tabs on the narrow cover and pull it off.', why: 'The filter slides into the blower housing through this slot.', v: { cam: [0.25, 1.05, 0.5], at: [0, 0.56, -0.45], hi: ['filterDoor'], mv: { filterDoor: [0, 0, 0.12] } } },
        { t: 'Slide out the old filter', d: 'Pull the filter straight out, keeping it level so leaves don’t fall into the blower. Note the airflow arrow.', why: 'Debris dropped into the blower can rattle or block the fan.', v: { cam: [0.3, 1.05, 0.55], at: [0, 0.6, -0.3], hi: ['oldFilter'], hide: ['filterDoor'], mv: { oldFilter: [0, 0, 0.3] } } },
        { t: 'Insert the new filter, arrow down', d: 'Slide the new filter in with the AIR FLOW arrow pointing the same way as the old one (down on most cars).', why: 'Backward filters still fit but trap less and can whistle.', v: { cam: [0.25, 1.0, 0.45], at: [0, 0.57, -0.45], hi: ['newFilter', 'arrow'], hide: ['oldFilter'], show: ['newFilter'] } },
        { t: 'Reassemble', d: 'Snap the door back on, lift the box past its stops, rehook the damper, and close it. Run the fan on high to check airflow.', why: 'If the box hangs crooked, one stop or the damper isn’t engaged.', v: { cam: [0.42, 0.8, 0.78], at: [0, 0.55, -0.3], hi: ['glovebox', 'filterDoor'], show: ['filterDoor'], mv: { filterDoor: [0, 0, 0], damper: [0, 0, 0] }, rt: { glovebox: [0, 0, 0] } } },
      ],
      learn: {
        how: 'All the air your fan blows into the cabin passes through this filter first, whether it comes from outside or recirculates. The pleated media traps pollen, dust and leaves; carbon versions also absorb odors and exhaust fumes. A clogged one chokes airflow, so the AC feels weak and the windows defog slowly.',
        specs: [['Replace every', '12,000–15,000 mi or yearly'], ['Typical size', '≈ 9 × 8½ × 1″'], ['Cost', '$15–30']],
        terms: [['Cabin filter', 'Filters air entering the passenger compartment.'], ['Damper', 'Arm that slows the glove box door.'], ['Activated carbon', 'Charcoal layer that absorbs odors.']],
        mistakes: ['Installing it with the arrow backward.', 'Forcing the glove box past its stops before releasing the damper.', 'Spraying perfume into the vents instead of changing the filter.'],
        tips: ['Write the date on the filter edge so you know when it went in.', 'For a musty smell, also run the fan on high with AC off for a few minutes before parking to dry the evaporator.'],
      },
      pro: 'The filter is behind the dash or under the cowl and needs trim removal, or the smell persists after a new filter (evaporator cleaning).',
    },
    {
      id: 'headlight-bulb',
      title: 'Replace a headlight bulb',
      model: 'headlight',
      level: 1,
      time: '15–30 min',
      cost: '$15–40',
      summary: 'On many cars the low-beam bulb twists out of the back of the headlight from under the hood. Unplug, quarter-turn, swap, and test, without touching the glass.',
      intro: { hi: ['housing', 'bulb'] },
      safety: ['Lights off and let the bulb cool 10 minutes; halogen bulbs run hot enough to burn.', 'Never touch the glass of a new halogen bulb. Skin oil makes a hot spot that can crack it.'],
      causes: [['Burned out', 'Halogen low beams last roughly 500–1,000 hours.'], ['Dim with age', 'The filament thins and the glass darkens.'], ['Bad connection', 'Corroded or melted plug.']],
      tools: ['Correct bulb (e.g. H11, see manual)', 'Nitrile gloves', 'Flashlight', 'Flat screwdriver (for tight plug tabs)'],
      steps: [
        { t: 'Identify the bulb', d: 'With the lights off, check the manual or the old bulb for the size (H11, 9005, H7…). Open the hood.', why: 'Each bulb type has its own base. The wrong one won’t lock in or aim right.', v: { cam: [3.3, 0.95, -1.4], at: [2.2, 0.72, -0.6], hi: ['lens', 'housing'] } },
        { t: 'Reach behind the headlight', d: 'Find the round bulb base sticking out the back of the housing. Move any air duct or reservoir that’s in the way.', why: 'Some cars need the battery, air box or a fender liner moved to reach it.', v: { cam: [1.35, 1.25, -1.15], at: [1.95, 0.74, -0.58], hi: ['bulb', 'connector'] } },
        { t: 'Unplug the connector', d: 'Press the locking tab and pull the plug straight back. Wiggle gently; never yank the wires.', why: 'Old plugs get brittle from heat. A small flat screwdriver can press a stuck tab.', v: { cam: [1.6, 1.0, -0.85], at: [1.92, 0.74, -0.55], hi: ['connector'], mv: { connector: [-0.06, -0.04, 0] } } },
        { t: 'Quarter-turn and pull', d: 'Turn the bulb base counterclockwise about a quarter turn and pull it straight out.', why: 'Tabs on the base lock behind slots in the housing. Turning lines them up with the openings.', v: { cam: [1.55, 1.0, -0.8], at: [1.88, 0.75, -0.55], hi: ['bulb'], rt: { bulb: [90, 0, 0] }, mv: { bulb: [-0.12, 0.03, -0.04] } } },
        { t: 'Handle the new bulb by its base', d: 'Put on gloves. Hold the new bulb only by the plastic base. If you touch the glass, wipe it with rubbing alcohol.', why: 'Oil on the quartz glass heats unevenly and can crack or blacken the bulb.', v: { cam: [1.55, 1.0, -0.8], at: [1.8, 0.78, -0.6], hi: ['newBulb'], show: ['newBulb'], hide: ['bulb'], mv: { newBulb: [-0.15, 0.05, -0.06] }, rt: { newBulb: [90, 0, 0] } } },
        { t: 'Insert, lock and plug in', d: 'Line up the tabs, push the bulb in, and turn it clockwise until it stops. Push the plug on until it clicks.', why: 'A bulb that isn’t fully locked sits off the focal point and throws light in the wrong place.', v: { cam: [1.6, 1.0, -0.85], at: [1.92, 0.74, -0.55], hi: ['newBulb', 'connector'], mv: { newBulb: [0, 0, 0], connector: [0, 0, 0] }, rt: { newBulb: [0, 0, 0] } } },
        { t: 'Test both beams', d: 'Turn on the low beams, then the high beams. Check the beam pattern on a wall 25 ft away matches the other side.', why: 'A dim or misaimed light blinds other drivers or leaves you short on road light.', v: { cam: [3.3, 0.95, -1.4], at: [2.2, 0.72, -0.6], hi: ['lens'], fx: 'lamp' } },
      ],
      learn: {
        how: 'A halogen bulb is a tungsten filament in a small quartz capsule filled with halogen gas. The gas carries evaporated tungsten back onto the filament, so it lasts longer and runs hotter and brighter than a plain bulb. The reflector or projector is shaped around an exact filament position, which is why the bulb’s base locks it in one orientation.',
        specs: [['Halogen life', '500–1,000 h'], ['Common low beam', 'H11 / H7 / 9006'], ['Common high beam', '9005 / H9'], ['Aim check distance', '25 ft']],
        terms: [['Low / high beam', 'Separate bulbs on many cars; dual-filament (H4, 9007) on others.'], ['Bayonet base', 'Twist-lock tabs on the bulb base.'], ['HID / LED', 'Sealed units on many newer cars, not DIY bulbs.']],
        mistakes: ['Touching the glass.', 'Replacing only one side when both are the same age.', 'Fitting LED retrofit bulbs into halogen reflectors (glare, not street legal in many places).'],
        tips: ['Replace bulbs in pairs so both sides match in color and brightness.', 'Keep the old good bulb as a roadside spare.'],
      },
      pro: 'It’s an HID or LED headlight, the bumper must come off to reach the bulb, or the new bulb doesn’t light (fuse, relay or wiring).',
    },
    {
      id: 'car-battery',
      title: 'Replace a car battery',
      model: 'batteryBay',
      level: 2,
      time: '30–45 min',
      cost: '$120–250',
      summary: 'Negative off first, positive second, unbolt the hold-down and lift it out. Clean everything, set the new one in, and reconnect positive first.',
      intro: { hi: ['oldBattery'] },
      safety: ['Wear safety glasses and gloves; battery acid burns skin and eyes.', 'Take the negative cable off first and put it on last, so a wrench touching metal can’t short the positive post.', 'Batteries weigh 30–50 lb. Lift with your legs and keep it upright.'],
      causes: [['Age', 'Most last 3–5 years; heat shortens that.'], ['Slow cranking', 'Weak CCA, especially in cold weather.'], ['Failed load test', 'Parts stores test for free.']],
      tools: ['New battery (same group size, CCA ≥ original)', '10 mm wrench or ratchet', 'Battery terminal brush', 'Baking soda & water', 'Gloves & glasses', 'Anti-corrosion spray or felt washers'],
      steps: [
        { t: 'Prep and match the battery', d: 'Engine off, key out. Note any radio or navigation code. Check the new battery’s group size, terminal layout and CCA match the old one.', why: 'The wrong group size won’t fit the hold-down; reversed terminals won’t reach the cables.', v: { cam: [2.45, 1.4, -1.35], at: [1.72, 0.8, -0.56], hi: ['oldBattery'] } },
        { t: 'Negative cable off first', d: 'Loosen the nut on the black (−) clamp, twist the clamp off the post and tuck it aside.', why: 'With ground disconnected, touching the + post and the car body together can’t make a spark.', v: { cam: [2.15, 1.15, -1.05], at: [1.66, 0.86, -0.62], hi: ['negClamp'], mv: { negClamp: [-0.05, 0.06, -0.06] }, tool: { id: 'ratchet', at: [1.645, 0.863, -0.665], rot: [-90, 0, 0], anim: 'turn' } } },
        { t: 'Positive cable off', d: 'Flip up the red cover, loosen the + clamp and lift it off.', why: 'Keep the + clamp away from the − clamp and the battery post.', v: { cam: [2.2, 1.15, -1.05], at: [1.8, 0.86, -0.62], hi: ['posClamp'], mv: { posClamp: [0.06, 0.06, -0.06] }, tool: { id: 'ratchet', at: [1.795, 0.863, -0.665], rot: [-90, 0, 0], anim: 'turn' } } },
        { t: 'Remove the hold-down', d: 'Undo the nuts on the hold-down bracket and lift it off.', why: 'The bracket keeps the battery from sliding into other parts in a crash or on bumps.', v: { cam: [2.3, 1.3, -1.1], at: [1.72, 0.88, -0.56], hi: ['holdDown'], mv: { holdDown: [0, 0.22, 0.1] }, tool: { id: 'ratchet', at: [1.72, 0.866, -0.46], rot: [0, 0, 0], anim: 'turn' } } },
        { t: 'Lift out the old battery', d: 'Grip it low on both sides (or use the strap) and lift straight up. Keep it upright.', why: 'Tipping can spill acid out of the vents.', v: { cam: [2.6, 1.5, -1.4], at: [1.8, 1.0, -0.65], hi: ['oldBattery'], mv: { oldBattery: [0.12, 0.42, -0.25] } } },
        { t: 'Clean the tray and clamps', d: 'Brush the inside of both clamps until shiny. Neutralize any white crust on the tray with baking soda and water, then dry.', why: 'Corrosion is a poor conductor; a dirty clamp on a new battery still cranks weakly.', v: { cam: [2.15, 1.15, -1.0], at: [1.72, 0.72, -0.6], hi: ['tray', 'posClamp', 'negClamp'], hide: ['oldBattery'], tool: { id: 'wireBrush', at: [1.72, 0.625, -0.56], rot: [0, 0, 0], anim: 'slide' } } },
        { t: 'Set the new battery', d: 'Lower the new battery onto the tray with the + post on the same side as the red cable.', why: 'Backward means the cables won’t reach, and forcing them can short across.', v: { cam: [2.45, 1.4, -1.35], at: [1.72, 0.8, -0.56], hi: ['newBattery'], show: ['newBattery'] } },
        { t: 'Hold-down back on', d: 'Refit the bracket and tighten until the battery can’t shift. Don’t crush the case.', why: 'A loose battery vibrates, shortening its life and possibly shorting on the hood.', v: { cam: [2.3, 1.3, -1.1], at: [1.72, 0.88, -0.56], hi: ['holdDown'], mv: { holdDown: [0, 0, 0] }, tool: { id: 'ratchet', at: [1.72, 0.866, -0.46], rot: [0, 0, 0], anim: 'turn' } } },
        { t: 'Positive on, then negative', d: 'Fit the felt washers, then the + clamp and tighten. Then the − clamp. Each should not twist by hand. Spray with protector.', why: 'Positive first means the wrench can’t short to ground while you tighten it.', v: { cam: [2.15, 1.15, -1.05], at: [1.72, 0.86, -0.62], hi: ['posClamp', 'negClamp', 'washers'], show: ['washers'], mv: { posClamp: [0, 0, 0], negClamp: [0, 0, 0] }, tool: { id: 'ratchet', at: [1.645, 0.863, -0.665], rot: [-90, 0, 0], anim: 'turn' } } },
        { t: 'Start and check charging', d: 'Start the engine. A meter across the posts should read 13.7–14.7 V. Reset the clock and windows; return the old battery for the core refund.', why: 'That reading confirms the alternator is charging the new battery.', v: { cam: [2.45, 1.4, -1.35], at: [1.72, 0.8, -0.56], hi: ['newBattery'], tool: { id: 'multimeter', at: [1.95, 0.83, -0.3], rot: [0, -60, 0] } } },
      ],
      learn: {
        how: 'A starting battery has six cells of lead plates in acid, about 2.1 V each, for 12.6 V when full. It’s built to deliver a huge burst of current for a few seconds, then be recharged by the alternator. Over years the plates sulfate and shed material, so it holds less charge and its cranking amps drop until one cold morning it can’t start the car.',
        specs: [['Full charge (rest)', '12.6 V'], ['Charging (running)', '13.7–14.7 V'], ['Clamp nut', '10 mm, ≈ 4–6 ft-lb'], ['Typical life', '3–5 years']],
        terms: [['Group size', 'Standard case size and terminal layout (e.g. 35, 24F, H6).'], ['CCA', 'Cold Cranking Amps at 0 °F.'], ['AGM', 'Absorbed Glass Mat; needed in start-stop cars.'], ['Core charge', 'Deposit refunded when you return the old battery.']],
        mistakes: ['Removing the positive first with a wrench that touches the body.', 'Overtightening and cracking the post.', 'Putting a regular battery in a car that needs AGM.'],
        tips: ['Many stores will install it free in the parking lot.', 'Some cars need the new battery registered with a scan tool so the charging system adjusts.'],
      },
      pro: 'The battery is in the trunk, under a seat or in the wheel well; the car needs battery registration; or the cables are corroded through.',
    },
  ]);

  /* ================= Bike: disc brake variants ================= */
  const BB = TB.repair('bike', 'bike-brakes');
  const vClose = { cam: [-0.2, 0.52, -0.22], at: [-0.068, 0.4, -0.045] };
  const vSide = { cam: [-0.22, 0.55, -0.42], at: [-0.06, 0.4, -0.045] };
  const discLearn = (how, extra) => Object.assign({
    how,
    specs: [['Replace pads at', '< 0.5 mm friction (≈ 3 mm total with backing)'], ['Rotor minimum', '1.5 mm (check rotor stamp)'], ['Caliper bolts', '6–8 N·m'], ['Bed-in', '10–20 stops']],
    terms: [['Rotor', 'Steel disc bolted to the hub.'], ['Post mount', 'Caliper mounting style with two radial bolts.'], ['Bed-in', 'Laying a thin film of pad material onto the rotor.']],
    mistakes: ['Touching pads or rotor with oily fingers.', 'Skipping the bed-in.'],
    tips: ['Contaminated pads squeal and won’t grip; replace them, and clean the rotor with isopropyl alcohol.'],
  }, extra || {});
  BB.variants = [
    { id: 'rim', name: 'Rim brakes', blurb: 'Pads squeeze the wheel rim. Adjust with the barrel.' },
    {
      id: 'mechdisc',
      name: 'Mechanical disc',
      blurb: 'Cable-pulled disc caliper (BB7, Spyre style). Swap pads and set the gap.',
      model: 'bikeDiscMech',
      level: 2,
      time: '20–30 min',
      cost: '$15–30',
      summary: 'Cable disc brakes push one pad (or both) onto the rotor. When pads wear thin, swap them out the top of the caliper and set the pad gap with the adjuster knob.',
      intro: { hi: ['caliper', 'rotor'] },
      safety: ['Keep oil, lube and fingers off the pads and rotor.', 'Rotors are sharp and get hot; let them cool after a ride.', 'Test at walking speed before riding.'],
      causes: [['Worn pads', 'Lever travel grows and braking fades.'], ['Cable stretch', 'Lever comes closer to the bar.'], ['Inboard pad not adjusted', 'Rotor flexes and rubs.']],
      tools: ['Replacement pads (match the caliper model)', '2.5, 3 & 5 mm hex keys (or T25)', 'Needle-nose pliers', 'Isopropyl alcohol & clean rag'],
      steps: [
        { t: 'Check pad thickness', d: 'Look into the caliper slot from above. Replace pads when the friction material is under 0.5 mm.', why: 'Past that, the steel backing grinds the rotor and braking drops sharply.', v: Object.assign({ hi: ['pads', 'caliper'], xray: true }, vClose) },
        { t: 'Remove the wheel', d: 'Open the quick release and drop the wheel out of the fork.', why: 'Pads come out the top of the caliper once the rotor is out of the way.', v: { cam: [0.3, 0.6, -1.0], at: [0, 0.38, 0], hi: ['frontWheel', 'qr'], mv: { frontWheel: [0, -0.25, 0] } } },
        { t: 'Back the pads off', d: 'Turn the inboard red knob (and outboard adjuster if fitted) counterclockwise to retract both pads.', why: 'New pads are thicker; backing off makes room so the wheel goes back in.', v: Object.assign({ hi: ['padKnob'], tool: { id: 'hexKey', at: [-0.06, 0.384, -0.012], rot: [90, 0, 0], anim: 'turn' } }, vSide) },
        { t: 'Pull the pin and pads', d: 'Remove the retaining pin or clip. Pull the pads and spring out the top of the caliper with pliers.', why: 'The pin holds the pads in place; the spring pushes them apart.', v: Object.assign({ hi: ['padPin', 'pads'], mv: { padPin: [0, 0, -0.06], pads: [0, 0.07, 0] } }, vClose) },
        { t: 'Fit the new pads', d: 'Sandwich the spring between the new pads, friction sides out. Slide them in, then refit the pin and clip.', why: 'Pads in backward put steel on the rotor.', v: Object.assign({ hi: ['newPads', 'padPin'], show: ['newPads'], hide: ['pads'], mv: { padPin: [0, 0, 0] } }, vClose) },
        { t: 'Refit the wheel and set the gap', d: 'Install the wheel. Turn the inboard knob in until the pad touches the rotor, then back off 1–2 clicks. Set the outboard side with the barrel adjuster.', why: 'The inboard pad doesn’t move when you brake; it must sit just off the rotor so the outboard pad can push the rotor onto it.', v: Object.assign({ hi: ['padKnob', 'actArm', 'leverBarrel'], mv: { frontWheel: [0, 0, 0] }, tool: { id: 'hexKey', at: [-0.06, 0.384, -0.012], rot: [90, 0, 0], anim: 'turn' } }, vSide) },
        { t: 'Bed in the pads', d: 'Spin the wheel to check for rub. Then do 10–20 firm stops from jogging speed, without locking the wheel.', why: 'New pads need to lay a film of material on the rotor before they grip at full strength.', v: { cam: [0.4, 0.9, -1.2], at: [-0.05, 0.6, -0.1], hi: ['newPads', 'lever'], fx: 'spin' } },
      ],
      learn: discLearn('In a mechanical disc brake, the cable rotates a cam or ramp on the outboard side that pushes the outer pad into the rotor. Most designs keep the inboard pad fixed, so the rotor flexes slightly onto it. As pads wear, the gaps grow, which is why the inboard pad has its own adjuster.'),
      pro: 'The rotor is bent or worn under its minimum, the cable is frayed, or the caliper won’t center.',
    },
    {
      id: 'hydrodisc',
      name: 'Hydraulic disc',
      blurb: 'Oil-filled lines push pistons. Push pistons back, swap pads, pump the lever.',
      model: 'bikeDiscHydro',
      level: 2,
      time: '20–30 min',
      cost: '$15–40',
      summary: 'Hydraulic brakes self-adjust as pads wear, so new, thicker pads need the pistons pushed back first. Then swap pads, pump the lever, and bed them in.',
      intro: { hi: ['caliper', 'hose'] },
      safety: ['Never squeeze the lever with the wheel out; the pistons will pop out and close the gap.', 'Keep oil, lube and brake fluid off the pads and rotor.', 'If the lever feels spongy after the swap, the brake needs bleeding.'],
      causes: [['Worn pads', 'Squealing, grinding, or the lever pulling closer.'], ['Contaminated pads', 'Squeal and weak braking after oil contact.'], ['Pistons sticking', 'One pad drags.']],
      tools: ['Replacement pads (match the brake model)', '2.5 or 3 mm hex key', 'Needle-nose pliers', 'Plastic tire lever or piston press', 'Isopropyl alcohol & clean rag'],
      steps: [
        { t: 'Check pad thickness', d: 'Look into the caliper from above. Replace pads under 0.5 mm of friction material, or if they’ve been contaminated.', why: 'Hydraulics hide wear well until the backing plates hit the rotor.', v: Object.assign({ hi: ['pads', 'caliper'], xray: true }, vClose) },
        { t: 'Remove the wheel', d: 'Open the quick release (or pull the thru-axle) and drop the wheel out.', why: 'From here on, don’t touch the lever.', v: { cam: [0.3, 0.6, -1.0], at: [0, 0.38, 0], hi: ['frontWheel', 'qr'], mv: { frontWheel: [0, -0.25, 0] } } },
        { t: 'Pull the pin', d: 'Straighten and remove the clip, then unscrew or slide out the pad retaining pin.', why: 'The pin runs through the pad tabs and holds them in the caliper.', v: Object.assign({ hi: ['padPin'], mv: { padPin: [0, 0, -0.06] }, tool: { id: 'hexKey', at: [-0.081, 0.397, -0.075], rot: [-90, 0, 0], anim: 'turn' } }, vClose) },
        { t: 'Remove the pads', d: 'Grip the pad tabs with pliers and pull the pads and spring out the top.', why: 'Note the spring’s orientation; the new one goes in the same way.', v: Object.assign({ hi: ['pads'], mv: { pads: [0, 0.07, 0] } }, vClose) },
        { t: 'Push the pistons back', d: 'Gently press both pistons fully into the caliper with a plastic tire lever or piston press. Watch that the lever reservoir doesn’t overflow.', why: 'The pistons advanced as the old pads wore. New pads won’t fit until they’re reset.', v: Object.assign({ hi: ['pistons', 'spreader'], show: ['spreader'], hide: ['pads'], xray: true }, vClose) },
        { t: 'Fit new pads and pin', d: 'Assemble the new pads with the spring, slide them in, then refit the pin and clip.', why: 'A missing clip lets the pin back out on a ride.', v: Object.assign({ hi: ['newPads', 'padPin'], show: ['newPads'], hide: ['spreader'], mv: { padPin: [0, 0, 0] } }, vClose) },
        { t: 'Wheel in, pump the lever', d: 'Reinstall the wheel and pump the lever 10–20 times until it feels firm. Spin the wheel and check for rub.', why: 'Pumping pushes the pistons back out to the new pads. If it rubs, loosen the caliper bolts, squeeze the lever, and retighten.', v: { cam: [0.2, 1.15, -0.55], at: [-0.05, 0.9, -0.2], hi: ['lever', 'hose'], mv: { frontWheel: [0, 0, 0] } } },
        { t: 'Bed in', d: 'Do 10–20 firm stops from jogging speed to walking pace, without locking the wheel.', why: 'Bedding lays down pad material on the rotor for full, quiet braking.', v: { cam: [0.4, 0.9, -1.2], at: [-0.05, 0.6, -0.1], hi: ['newPads', 'lever'], fx: 'spin' } },
      ],
      learn: discLearn('Squeezing a hydraulic lever pushes a small master piston, which moves sealed fluid (mineral oil or DOT fluid, depending on the brand) down the hose to larger pistons in the caliper. The size difference multiplies your force. As pads wear, the pistons sit further out and extra fluid moves from the lever reservoir, so the brake adjusts itself.', { terms: [['Piston', 'Cup in the caliper pushed by fluid.'], ['Mineral oil / DOT', 'Two incompatible brake fluids; never mix.'], ['Bleed', 'Purging air from the system.']] }),
      pro: 'The lever is spongy or reaches the bar (needs a bleed), a piston sticks, or fluid is leaking.',
    },
  ];

  /* ================= New bike guides ================= */
  TB.more('bike', [
    {
      id: 'bike-derailleur',
      title: 'Adjust a rear derailleur',
      model: 'rearDerailleur',
      level: 2,
      time: '20–30 min',
      cost: '$0',
      summary: 'Skipping, noisy or slow shifts usually mean the cable tension is off. Set the limit screws, then index with the barrel adjuster in quarter turns.',
      intro: { hi: ['derailleur', 'cassette'] },
      safety: ['Set the L limit before riding; a derailleur that goes past the largest cog can drop into the spokes and wreck the wheel.', 'Keep fingers out of the chain and cogs while pedaling the bike in a stand.'],
      causes: [['Cable stretch', 'New cables stretch in the first month; shifting goes slow on the way up.'], ['Bent hanger', 'A knock on the right side makes shifting erratic.'], ['Dirty or kinked housing', 'Friction makes shifts sluggish.']],
      tools: ['Bike stand (or hang the bike)', 'Small Phillips screwdriver', '5 mm hex key', 'Cable cutter (if replacing cable)'],
      steps: [
        { t: 'Shift to the smallest cog', d: 'Put the bike in a stand. Pedal and shift to the big chainring and smallest rear cog.', why: 'In the smallest cog the cable is at its slackest, so you can set the H limit and tension from a known start.', v: { cam: [0.28, 0.48, 0.5], at: [-0.02, 0.3, 0.05], hi: ['chainSmall', 'cassette'], fx: 'spin' } },
        { t: 'Check the hanger', d: 'Look from behind. The two pulleys should line up straight under the cogs, not angled inward.', why: 'A bent hanger can’t be fixed by adjusting; a shop can straighten it with an alignment gauge.', v: { cam: [-0.55, 0.32, 0.07], at: [0, 0.3, 0.06], hi: ['hanger', 'cage'] } },
        { t: 'Set the H limit', d: 'Turn the H screw until the guide pulley sits directly under the smallest cog.', why: 'Too loose and the chain falls off into the frame; too tight and it won’t drop into the last gear.', v: { cam: [-0.15, 0.35, 0.25], at: [-0.03, 0.29, 0.094], hi: ['limitH', 'guidePulley'], tool: { id: 'screwdriver', at: [-0.034, 0.296, 0.094], rot: [0, 0, 90], scale: 0.5, anim: 'turn' } } },
        { t: 'Set cable tension', d: 'Turn the barrel adjuster all the way in, then out one turn. Loosen the pinch bolt, pull the cable snug, and tighten to about 5 N·m.', why: 'That leaves adjustment room both ways for fine-tuning later.', v: { cam: [0.12, 0.38, 0.28], at: [0, 0.3, 0.095], hi: ['pinchBolt', 'barrel'], tool: { id: 'hexKey', at: [-0.005, 0.287, 0.106], rot: [90, 0, 0], anim: 'turn' } } },
        { t: 'Set the L limit', d: 'Shift to the largest cog while pushing the derailleur inward by hand. Turn the L screw so the pulley stops right under the largest cog and can go no further.', why: 'This is the screw that keeps the chain and derailleur out of the spokes.', v: { cam: [-0.5, 0.3, 0.12], at: [0, 0.28, 0.03], hi: ['limitL', 'chainBig'], show: ['chainBig'], hide: ['chainSmall'], mv: { derailleur: [0, -0.043, -0.039] } } },
        { t: 'Index with the barrel', d: 'Back to the smallest cog. Click one shift. If the chain hesitates, turn the barrel out (counterclockwise) a quarter turn. If it jumps two cogs or rattles, turn it in. Repeat through every gear.', why: 'Each quarter turn moves the derailleur a fraction of a millimeter, just enough to line the pulley up with each cog.', v: { cam: [0.2, 0.42, 0.35], at: [0.0, 0.32, 0.08], hi: ['barrel'], show: ['chainSmall'], hide: ['chainBig'], mv: { derailleur: [0, 0, 0] }, rt: { barrel: [0, 0, 0] }, fx: 'spin' } },
        { t: 'Set the B-tension', d: 'In the largest cog, turn the B screw so the guide pulley sits about 5–6 mm below the cog teeth.', why: 'Too close and it chatters on the big cogs; too far and shifts get vague.', v: { cam: [0.2, 0.3, 0.32], at: [-0.02, 0.29, 0.07], hi: ['bScrew', 'guidePulley'], show: ['chainBig'], hide: ['chainSmall'], mv: { derailleur: [0, -0.043, -0.039] } } },
        { t: 'Test ride', d: 'Ride and shift through every gear under light load. Fine-tune with the barrel a quarter turn at a time.', why: 'Cables settle under real pedaling forces; a short ride shows what a stand can’t.', v: { cam: [0.28, 0.48, 0.5], at: [-0.02, 0.3, 0.05], hi: ['derailleur', 'cassette'], show: ['chainSmall'], hide: ['chainBig'], mv: { derailleur: [0, 0, 0] }, fx: 'spin' } },
      ],
      learn: {
        how: 'The rear derailleur is a spring-loaded parallelogram. Pulling cable moves it inward toward bigger cogs; releasing lets the spring pull it out. Each shifter click pulls a set length of cable, so the derailleur only lines up with each cog when the starting tension is right. Limit screws are hard stops at each end; the B screw sets how close the top pulley rides to the cogs.',
        specs: [['Pinch bolt', '5–7 N·m'], ['B-gap', '5–6 mm (check maker’s spec)'], ['Barrel steps', '¼ turn at a time'], ['Cable', '1.1–1.2 mm stainless']],
        terms: [['H / L screws', 'High (small cog) and Low (big cog) limits.'], ['Indexing', 'Matching cable tension to the shifter clicks.'], ['Hanger', 'Replaceable tab the derailleur bolts to.'], ['B-tension', 'Gap between guide pulley and cogs.']],
        mistakes: ['Using limit screws to fix indexing.', 'Big barrel turns instead of quarter turns.', 'Riding with the L limit untested.'],
        tips: ['Carry a spare hanger for your frame on long rides.', 'If tuning never holds, replace the cable and housing; that fixes most stubborn shifting.'],
      },
      pro: 'The hanger or derailleur is bent, the cable is frayed inside the shifter, or it’s an electronic (Di2, AXS) system.',
    },
    {
      id: 'bike-tubeless',
      title: 'Set up tubeless tires',
      model: 'tubelessWheel',
      level: 2,
      time: '45–60 min',
      cost: '$40–70',
      summary: 'Seal the rim with tubeless tape, fit a tubeless valve, seat the tire with a blast of air, and add sealant. Small punctures then seal themselves while you ride.',
      intro: { hi: ['tire', 'rim'] },
      safety: ['Never go over the max pressure printed on the tire or rim; hookless rims often cap at 72 psi or less.', 'Wear glasses when seating beads; sealant can spray.', 'Both rim and tire must be tubeless-ready.'],
      causes: [['Fewer flats', 'Sealant plugs thorns and small cuts.'], ['Lower pressure', 'More grip and comfort without pinch flats.'], ['Lighter', 'No tube to carry spinning around.']],
      tools: ['Tubeless rim tape (rim internal width + 2–5 mm)', 'Tubeless valves (2)', 'Sealant (≈ 90–120 ml per MTB tire)', 'Sealant injector or valve-core tool', 'Floor pump with booster tank or compressor', 'Isopropyl alcohol & rag'],
      steps: [
        { t: 'Strip the rim', d: 'Remove the tire, tube and old plastic rim strip.', why: 'Plastic strips don’t seal air; tubeless tape replaces them.', v: { cam: [0.55, 0.95, 1.25], at: [0, 0.6, 0], hi: ['oldStrip', 'rim'], hide: ['tire'] } },
        { t: 'Clean the rim bed', d: 'Wipe the rim bed with isopropyl alcohol and let it dry.', why: 'Tape won’t stick to dust or grease, and any lifted edge leaks.', v: { cam: [0.5, 1.0, 0.95], at: [0, 0.75, 0], hi: ['rim'], hide: ['oldStrip'] } },
        { t: 'Tape the rim', d: 'Start about 10 cm before the valve hole and wrap under tension, pressing it into the center channel. Go all the way round and overlap past the valve hole by 10–15 cm.', why: 'Tension stretches the tape flat across the spoke holes; the overlap keeps the seam away from the valve.', v: { cam: [0.4, 1.0, 0.8], at: [0, 0.82, 0], hi: ['rimTape'], show: ['rimTape'] } },
        { t: 'Fit the valve', d: 'Pierce the tape at the valve hole with an awl, push the valve through, and snug the lockring by hand.', why: 'The rubber base seals against the tape; overtightening with a tool can cut it.', v: { cam: [0.25, 1.05, 0.35], at: [0, 0.9, 0], hi: ['valve', 'lockring'], show: ['valve'] } },
        { t: 'Mount the tire', d: 'Fit both beads, finishing opposite the valve. Push the beads into the rim’s center channel for slack.', why: 'The center channel is deeper, so beads sitting there free up enough slack to roll the last part on by hand.', v: { cam: [0.55, 0.95, 1.25], at: [0, 0.6, 0], hi: ['tire', 'tireGap'], show: ['tire', 'tireGap'], mv: { tireGap: [0.012, 0.012, 0.03] } } },
        { t: 'Seat the beads', d: 'Remove the valve core. Inflate fast with a booster or compressor until both beads pop onto the rim shelves. Don’t exceed the tire’s max.', why: 'With the core out, air rushes in fast enough to push the beads outward before it leaks past them.', v: { cam: [0.7, 0.9, 1.2], at: [0.1, 0.6, 0], hi: ['tireGap', 'valveCore'], mv: { tireGap: [0, 0, 0], valveCore: [0, -0.03, 0.04] }, tool: { id: 'tirePump', at: [0.45, 0, 0.3], rot: [0, -40, 0] } } },
        { t: 'Add sealant', d: 'Let the air out, then inject the sealant through the valve with the core still out. Refit the core.', why: 'Injecting through the valve is clean and measures the dose exactly.', v: { cam: [0.3, 1.0, 0.4], at: [0, 0.82, 0], hi: ['injector', 'sealant'], show: ['injector'], mv: { valveCore: [0, -0.03, 0.04] } } },
        { t: 'Inflate and spread', d: 'Refit the core and inflate. Spin and shake the wheel, then lay it flat on each side for a few minutes.', why: 'Sealant needs to coat the whole inside and every bead edge to seal tiny gaps.', v: { cam: [0.55, 0.95, 1.25], at: [0, 0.6, 0], hi: ['tire'], hide: ['injector'], mv: { valveCore: [0, 0, 0] }, fx: 'spin' } },
        { t: 'Set pressure and recheck', d: 'Set your riding pressure. Check again the next day; top up sealant every 2–6 months.', why: 'Some air seeps out until the sealant finishes plugging the tape and bead. Sealant dries out over time.', v: { cam: [0.55, 0.95, 1.25], at: [0, 0.6, 0], hi: ['valve', 'tire'], tool: { id: 'tirePump', at: [0.45, 0, 0.3], rot: [0, -40, 0] } } },
      ],
      learn: {
        how: 'A tubeless tire seals directly to the rim: the beads lock onto shelves next to the rim hooks, and the tape seals the spoke holes. Liquid latex sealant sloshes inside. When something pokes a hole, escaping air carries sealant into it, where latex particles and fibers clump and plug the hole.',
        specs: [['Sealant, road', '30–40 ml'], ['Sealant, gravel', '60–90 ml'], ['Sealant, MTB', '90–120 ml'], ['Top up', 'every 2–6 months']],
        terms: [['Tubeless-ready', 'Rim and tire designed to seal without a tube.'], ['Bead shelf', 'Flat ledge the bead locks onto.'], ['Booster', 'Pump chamber that releases a blast of air.'], ['Burping', 'Air escaping as the bead briefly unseats.']],
        mistakes: ['Tape too narrow or not pressed flat.', 'Overtightening the valve lockring.', 'Using a non-tubeless tire.'],
        tips: ['A little soapy water on the beads helps stubborn tires seat.', 'Carry a tube and a plug kit; big cuts won’t seal.'],
      },
      pro: 'The rim isn’t tubeless-ready, beads won’t seat even with a compressor, or the tape keeps leaking at the spoke holes.',
    },
  ]);
})();
