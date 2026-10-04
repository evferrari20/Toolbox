/* Toolbox 3D engine.
   Models are built from primitives in code (see js/content/*.js) and expose named parts.
   A walkthrough step is a "pose": camera, highlighted parts, part offsets, and the tools
   in use. Offsets accumulate from step to step, so a part removed in step 2 stays removed
   until a later step puts it back.

   Realism comes from: physically based materials lit by a studio environment map,
   procedural surface textures (wood grain, brushed metal, knurling, concrete), rounded
   and beveled geometry, soft shadows, and filmic tone mapping. */
(function () {
  const TB = (window.TB = window.TB || {});
  TB.MODELS = TB.MODELS || {};
  TB.TOOLS = TB.TOOLS || {};
  const DEG = Math.PI / 180;
  const HILITE = 0xf5c518;

  TB.model = function (name, view, build) {
    TB.MODELS[name] = { view, build };
  };
  /* A tool is built with its working point at the origin and its working axis along +Y
     (screwdriver tip at origin, shaft up +Y; wrench jaw at origin, turning about Y). */
  TB.tool = function (id, name, build, scan) {
    TB.TOOLS[id] = Object.assign({ name, build }, scan || {});
  };

  /* ---------- Procedural textures (generated once, shared) ---------- */
  const TEX = {};
  function canvasTex(key, size, draw, opts) {
    if (TEX[key]) return TEX[key];
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    draw(g, size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    if (opts && opts.color) t.encoding = THREE.sRGBEncoding;
    TEX[key] = t;
    return t;
  }
  function rnd(seed) {
    let s = seed || 1;
    return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  }
  const tex = {
    // Wood: long grain lines with a few knots. Gray version doubles as bump.
    woodBump: () =>
      canvasTex('woodBump', 512, (g, n) => {
        const r = rnd(7);
        g.fillStyle = '#808080';
        g.fillRect(0, 0, n, n);
        for (let i = 0; i < 140; i++) {
          const y = r() * n;
          const amp = 2 + r() * 6;
          const v = 90 + r() * 90;
          g.strokeStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.4})`;
          g.lineWidth = 0.6 + r() * 2.2;
          g.beginPath();
          for (let x = 0; x <= n; x += 8) g.lineTo(x, y + Math.sin(x / (40 + r() * 30) + i) * amp);
          g.stroke();
        }
        for (let k = 0; k < 2; k++) {
          const cx = r() * n;
          const cy = r() * n;
          for (let j = 10; j > 0; j--) {
            g.strokeStyle = `rgba(60,60,60,${0.08 * j})`;
            g.beginPath();
            g.ellipse(cx, cy, j * 5, j * 2.2, 0, 0, Math.PI * 2);
            g.stroke();
          }
        }
      }),
    // Brushed metal: fine horizontal streaks.
    brushed: () =>
      canvasTex('brushed', 256, (g, n) => {
        const r = rnd(3);
        g.fillStyle = '#7a7a7a';
        g.fillRect(0, 0, n, n);
        for (let i = 0; i < 1400; i++) {
          const v = 100 + r() * 80;
          g.fillStyle = `rgba(${v},${v},${v},0.35)`;
          g.fillRect(r() * n, r() * n, 20 + r() * 80, 0.6);
        }
      }),
    // Diamond knurl for grips and adjuster wheels.
    knurl: () =>
      canvasTex('knurl', 128, (g, n) => {
        g.fillStyle = '#808080';
        g.fillRect(0, 0, n, n);
        g.strokeStyle = '#303030';
        g.lineWidth = 2;
        for (let i = -n; i < n * 2; i += 8) {
          g.beginPath();
          g.moveTo(i, 0);
          g.lineTo(i + n, n);
          g.stroke();
          g.beginPath();
          g.moveTo(i, n);
          g.lineTo(i + n, 0);
          g.stroke();
        }
      }),
    // Speckle for concrete, stone, asphalt, plastic texture.
    speckle: () =>
      canvasTex('speckle', 256, (g, n) => {
        const r = rnd(11);
        g.fillStyle = '#808080';
        g.fillRect(0, 0, n, n);
        for (let i = 0; i < 9000; i++) {
          const v = 60 + r() * 140;
          g.fillStyle = `rgba(${v},${v},${v},0.5)`;
          const s = r() * 2.2;
          g.fillRect(r() * n, r() * n, s, s);
        }
      }),
    // Ribbed rubber grip (screwdriver/pliers sleeves).
    ribs: () =>
      canvasTex('ribs', 64, (g, n) => {
        for (let y = 0; y < n; y++) {
          const v = 128 + 100 * Math.sin((y / n) * Math.PI * 8);
          g.fillStyle = `rgb(${v},${v},${v})`;
          g.fillRect(0, y, n, 1);
        }
      }),
    // Woven fabric for tents, towels.
    weave: () =>
      canvasTex('weave', 64, (g, n) => {
        g.fillStyle = '#808080';
        g.fillRect(0, 0, n, n);
        for (let i = 0; i < n; i += 4) {
          g.fillStyle = 'rgba(40,40,40,0.35)';
          g.fillRect(i, 0, 1, n);
          g.fillRect(0, i, n, 1);
        }
      }),
  };
  TB.tex = tex;

  function repeatOf(t, x, y) {
    const c = t.clone();
    c.needsUpdate = true;
    c.repeat.set(x, y);
    return c;
  }

  /* ---------- Kit: helpers handed to every model builder ---------- */
  function makeKit() {
    const root = new THREE.Group();
    const parts = {};
    const names = {};
    const std = (color, o) =>
      new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0 }, o || {}));
    const phys = (color, o) =>
      new THREE.MeshPhysicalMaterial(Object.assign({ color, roughness: 0.4, metalness: 0 }, o || {}));
    const bumpy = (color, t, scale, o) => std(color, Object.assign({ bumpMap: t, bumpScale: scale }, o || {}));
    const m = {
      steel: bumpy(0xb8bec4, tex.brushed(), 0.002, { metalness: 1, roughness: 0.38, roughnessMap: tex.brushed() }),
      chrome: phys(0xf2f4f6, { metalness: 1, roughness: 0.08, clearcoat: 0.6 }),
      brass: std(0xd8b25a, { metalness: 1, roughness: 0.3 }),
      copper: std(0xd4865a, { metalness: 1, roughness: 0.32 }),
      forged: bumpy(0x6c7378, tex.speckle(), 0.003, { metalness: 0.85, roughness: 0.45 }),
      dark: std(0x3a4047, { roughness: 0.5 }),
      black: std(0x1f2226, { roughness: 0.45 }),
      rubber: bumpy(0x1c1e21, tex.speckle(), 0.002, { roughness: 0.92 }),
      white: phys(0xf7f7f4, { roughness: 0.18, clearcoat: 0.5 }),
      offwhite: std(0xece8df, { roughness: 0.6 }),
      grey: std(0x8d969e, { roughness: 0.55 }),
      lightgrey: std(0xcfd4d9, { roughness: 0.55 }),
      wood: bumpy(0xb98552, tex.woodBump(), 0.01, { roughness: 0.75 }),
      woodDark: bumpy(0x7d5634, tex.woodBump(), 0.01, { roughness: 0.7 }),
      woodLight: bumpy(0xdcbc8c, tex.woodBump(), 0.01, { roughness: 0.8 }),
      bark: bumpy(0x5a4130, tex.speckle(), 0.03, { roughness: 1 }),
      char: std(0x2b2422, { roughness: 1 }),
      concrete: bumpy(0xa3a29b, tex.speckle(), 0.012, { roughness: 0.95 }),
      asphalt: bumpy(0x45474a, tex.speckle(), 0.02, { roughness: 0.95 }),
      grass: bumpy(0x6f9e4c, tex.speckle(), 0.02, { roughness: 1 }),
      dirt: bumpy(0x7d5f40, tex.speckle(), 0.03, { roughness: 1 }),
      stone: bumpy(0x8f8b85, tex.speckle(), 0.03, { roughness: 0.9 }),
      drywall: bumpy(0xe2ded6, tex.speckle(), 0.002, { roughness: 0.95 }),
      pvc: std(0xf0f1ec, { roughness: 0.35 }),
      red: std(0xd0433a, { roughness: 0.45 }),
      orange: std(0xe8833a, { roughness: 0.45 }),
      yellow: std(0xf2c230, { roughness: 0.42 }),
      green: std(0x4f9a5e, { roughness: 0.5 }),
      blue: std(0x2f7fd0, { roughness: 0.45 }),
      sky: std(0x9cc9ea, { roughness: 0.5 }),
      navy: std(0x2f4a6b, { roughness: 0.5 }),
      water: phys(0x7fbff0, { transparent: true, opacity: 0.55, roughness: 0.05, transmission: 0, clearcoat: 1 }),
      glass: phys(0xd8ecf6, { transparent: true, opacity: 0.28, roughness: 0.03, clearcoat: 1 }),
      // Flames: unlit, additive and outside tone mapping so they stay saturated orange.
      fire: new THREE.MeshBasicMaterial({ color: 0xff5a10, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      flame: new THREE.MeshBasicMaterial({ color: 0xffb030, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      ember: std(0xff4a1a, { emissive: 0xff3300, emissiveIntensity: 1.6 }),
      ledG: std(0x4bd16a, { emissive: 0x2fcf55, emissiveIntensity: 1.5 }),
      ledR: std(0xff5a4a, { emissive: 0xff2a1a, emissiveIntensity: 1.5 }),
      ledB: std(0x5ab0ff, { emissive: 0x2a8cff, emissiveIntensity: 1.5 }),
      screen: phys(0x16212c, { emissive: 0x284b6e, emissiveIntensity: 0.6, roughness: 0.1, clearcoat: 1 }),
      // Tool finishes
      toolSteel: bumpy(0xc9ced3, tex.brushed(), 0.0015, { metalness: 1, roughness: 0.28 }),
      blackOxide: std(0x2a2c2f, { metalness: 0.8, roughness: 0.42 }),
      gripRed: bumpy(0xc8352b, tex.ribs(), 0.004, { roughness: 0.55 }),
      gripYellow: bumpy(0xf2b81f, tex.ribs(), 0.004, { roughness: 0.5 }),
      gripBlue: bumpy(0x2a6fc0, tex.ribs(), 0.004, { roughness: 0.5 }),
      gripBlack: bumpy(0x232528, tex.ribs(), 0.004, { roughness: 0.75 }),
      knurled: bumpy(0xb8bec4, tex.knurl(), 0.004, { metalness: 1, roughness: 0.35 }),
      hickory: bumpy(0xd9b07a, tex.woodBump(), 0.006, { roughness: 0.5 }),
      fabric: bumpy(0x6f9fc4, tex.weave(), 0.004, { roughness: 0.9 }),
    };
    const P = (p) => (typeof p === 'string' ? parts[p] : p || root);
    const place = (mesh, parent, pos, rot) => {
      if (pos) mesh.position.set(pos[0], pos[1], pos[2]);
      if (rot) mesh.rotation.set(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG);
      P(parent).add(mesh);
      return mesh;
    };
    const mk = (geo, mat) => new THREE.Mesh(geo, typeof mat === 'string' ? m[mat] : mat);
    const v2 = (pts) => pts.map((p) => new THREE.Vector2(p[0], p[1]));
    const K = {
      THREE,
      root,
      parts,
      names,
      m,
      std,
      phys,
      bumpy,
      tex,
      DEG,
      part(name, pos, parent, label) {
        const g = new THREE.Group();
        place(g, parent, pos);
        if (name) {
          parts[name] = g;
          g.userData.part = name;
          if (label) names[name] = label;
        }
        return g;
      },
      group(parent, pos, rot) {
        return place(new THREE.Group(), parent, pos, rot);
      },
      // Boxes get softly rounded edges unless they are paper-thin.
      box(parent, s, mat, pos, rot, radius) {
        const mn = Math.min(s[0], s[1], s[2]);
        let geo;
        const r = radius != null ? radius : Math.min(mn * 0.18, 0.025);
        if (THREE.RoundedBoxGeometry && mn > 0.012 && r > 0.001) geo = new THREE.RoundedBoxGeometry(s[0], s[1], s[2], 2, r);
        else geo = new THREE.BoxGeometry(s[0], s[1], s[2]);
        return place(mk(geo, mat), parent, pos, rot);
      },
      cyl(parent, s, mat, pos, rot) {
        // s = [radiusTop, radiusBottom, height, segments?, openEnded?]
        return place(mk(new THREE.CylinderGeometry(s[0], s[1], s[2], s[3] || 32, 1, !!s[4]), mat), parent, pos, rot);
      },
      // Cylinder with chamfered ends (nuts, caps, knobs, posts).
      ccyl(parent, s, mat, pos, rot) {
        const r = s[0];
        const h = s[1];
        const seg = s[2] || 32;
        const ch = s[3] != null ? s[3] : Math.min(r, h) * 0.15;
        const pts = [[0, -h / 2], [r - ch, -h / 2], [r, -h / 2 + ch], [r, h / 2 - ch], [r - ch, h / 2], [0, h / 2]];
        return place(mk(new THREE.LatheGeometry(v2(pts), seg), mat), parent, pos, rot);
      },
      sph(parent, r, mat, pos, scale) {
        const me = place(mk(new THREE.SphereGeometry(r, 32, 20), mat), parent, pos);
        if (scale) me.scale.set(scale[0], scale[1], scale[2]);
        return me;
      },
      tor(parent, s, mat, pos, rot) {
        // s = [radius, tube, arc(deg)?]
        return place(mk(new THREE.TorusGeometry(s[0], s[1], 16, 64, (s[2] || 360) * DEG), mat), parent, pos, rot);
      },
      cone(parent, s, mat, pos, rot) {
        return place(mk(new THREE.ConeGeometry(s[0], s[1], s[2] || 32), mat), parent, pos, rot);
      },
      lathe(parent, pts, mat, pos, rot, seg) {
        const me = mk(new THREE.LatheGeometry(v2(pts), seg || 48), mat);
        me.material = me.material.clone();
        me.material.side = THREE.DoubleSide;
        return place(me, parent, pos, rot);
      },
      tube(parent, pts, r, mat, closed) {
        const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])), !!closed);
        return place(mk(new THREE.TubeGeometry(curve, Math.max(32, pts.length * 16), r, 12, !!closed), mat), parent);
      },
      bar(parent, a, b, r, mat, seg) {
        const va = new THREE.Vector3(a[0], a[1], a[2]);
        const vb = new THREE.Vector3(b[0], b[1], b[2]);
        const me = mk(new THREE.CylinderGeometry(r, r, va.distanceTo(vb), seg || 16), mat);
        me.position.copy(va).add(vb).multiplyScalar(0.5);
        me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
        P(parent).add(me);
        return me;
      },
      // 2D outline extruded along +z. bevel = edge rounding size (0 for sharp).
      ext(parent, pts, depth, mat, pos, rot, bevel, holes) {
        const sh = new THREE.Shape(v2(pts));
        (holes || []).forEach((h) => sh.holes.push(new THREE.Path(v2(h))));
        const b = bevel || 0;
        const geo = new THREE.ExtrudeGeometry(sh, {
          depth: Math.max(0.0001, depth - b * 2),
          bevelEnabled: b > 0,
          bevelThickness: b,
          bevelSize: b,
          bevelSegments: 3,
          curveSegments: 16,
        });
        geo.translate(0, 0, b);
        return place(mk(geo, mat), parent, pos, rot);
      },
      // Circle polyline helper for extrude outlines.
      circle(cx, cy, r, n, a0, a1) {
        const out = [];
        a0 = a0 || 0;
        a1 = a1 == null ? Math.PI * 2 : a1;
        n = n || 24;
        for (let i = 0; i <= n; i++) {
          const a = a0 + ((a1 - a0) * i) / n;
          out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
        return out;
      },
      // Hex nut with a hole, chamfered, axis along Y.
      nut(parent, af, h, mat, pos, rot) {
        const r = af / Math.sqrt(3);
        const pts = [];
        for (let i = 0; i < 6; i++) pts.push([Math.cos(i * 1.0472 + 0.5236) * r, Math.sin(i * 1.0472 + 0.5236) * r]);
        const g = K.group(parent, pos, rot);
        K.ext(g, pts, h, mat, [0, h / 2, 0], [90, 0, 0], Math.min(h, af) * 0.08, [K.circle(0, 0, af * 0.28, 16).reverse()]);
        return g;
      },
      // Screw/bolt: head + threaded shank, axis along -Y from the head.
      screw(parent, d, len, mat, pos, rot, head) {
        const g = K.group(parent, pos, rot);
        if (head === 'hex') K.nut(g, d * 1.6, d * 0.65, mat, [0, d * 0.32, 0]);
        else if (head === 'flat') K.cyl(g, [d * 1, d * 0.5, d * 0.5], mat, [0, -d * 0.25, 0]);
        else {
          K.lathe(g, [[0, d * 0.55], [d * 0.7, d * 0.5], [d * 0.95, d * 0.2], [d, 0], [0, 0]], mat);
          K.box(g, [d * 1.4, d * 0.18, d * 0.25], 'black', [0, d * 0.5, 0], null, 0);
        }
        K.cyl(g, [d * 0.5, d * 0.42, len], mat, [0, -len / 2, 0]);
        const turns = Math.min(40, Math.round(len / (d * 0.35)));
        for (let i = 1; i < turns; i++) K.tor(g, [d * 0.5, d * 0.06], mat, [0, -i * (len / turns), 0], [90, 0, 0]);
        return g;
      },
      rep(n, fn) {
        for (let i = 0; i < n; i++) fn(i);
      },
      // Texture repeat for a material so grain/speckle scales with large surfaces.
      tiled(mat, x, y) {
        const src = typeof mat === 'string' ? m[mat] : mat;
        const c = src.clone();
        ['map', 'bumpMap', 'roughnessMap'].forEach((k) => {
          if (c[k]) c[k] = repeatOf(c[k], x, y);
        });
        return c;
      },
      // Photo-scanned model from assets/models (see TB.placeGLB for opts). Returns null if not loaded.
      glb(parent, id, opts, pos, rot) {
        const w = TB.placeGLB && TB.placeGLB(id, opts);
        if (!w) return null;
        return place(w, parent, pos, rot);
      },
      // Scanned PBR material, or the fallback material when the texture set isn't available.
      pbr(name, repeat, opts, fallback) {
        if (TB.assetCache && TB.assetCache.tex[name]) return TB.pbr(name, repeat, opts);
        return typeof fallback === 'string' ? m[fallback] : fallback || m.grey;
      },
      paint(color, o) {
        return phys(color, Object.assign({ roughness: 0.35, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 }, o || {}));
      },
      drip(parent, from, fall, mat) {
        const d = K.sph(parent, 0.035, mat || 'water', from, [1, 1.4, 1]);
        d.userData.noPick = true;
        d.visible = false;
        return {
          mesh: d,
          tick(t, on, speed) {
            d.visible = !!on;
            if (!on) return;
            const k = (t * (speed || 0.7)) % 1;
            d.position.y = from[1] - fall * k * k;
            d.scale.setScalar(k < 0.15 ? k / 0.15 : 1);
          },
        };
      },
    };
    return K;
  }
  TB.makeKit = makeKit;

  /* Builds a tool group; returns {group, name}. */
  TB.buildTool = function (id, opts) {
    const def = TB.TOOLS[id];
    if (!def) return null;
    const K = makeKit();
    const scanned = def.glb && TB.placeGLB && TB.placeGLB(def.glb, def.fit);
    if (scanned) {
      K.root.add(scanned);
      if (def.after) def.after(K, scanned, opts || {});
    } else if (def.build) def.build(K, opts || {});
    K.root.userData.toolId = id;
    return { group: K.root, name: def.name, K };
  };

  /* Outline: back faces pushed out along normals, drawn in the highlight color. */
  function makeOutlineMat() {
    const mat = new THREE.MeshBasicMaterial({ color: HILITE, side: THREE.BackSide, transparent: true, opacity: 0.95 });
    mat.userData.thick = { value: 0.012 };
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.thick = mat.userData.thick;
      sh.vertexShader = 'uniform float thick;\n' + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * thick;');
    };
    return mat;
  }

  /* ---------- Viewer ---------- */
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  class Viewer {
    constructor(host, opts) {
      this.host = host;
      this.opts = opts || {};
      this.labelsOn = true;
      this.xray = false;
      this.hi = new Set();
      this.picked = null;
      this.fx = null;
      this.tools = [];
      const canvasWrap = document.createElement('div');
      canvasWrap.className = 'v-canvas';
      host.appendChild(canvasWrap);
      this.labelLayer = document.createElement('div');
      this.labelLayer.className = 'v-labels';
      host.appendChild(this.labelLayer);
      try {
        if (!window.THREE) throw new Error('three missing');
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch (e) {
        this.failed = true;
        canvasWrap.innerHTML = '<div class="v-fallback">The 3D view could not start on this device. All the steps below still work.</div>';
        return;
      }
      const r = this.renderer;
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.outputEncoding = THREE.sRGBEncoding;
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 0.72;
      r.shadowMap.enabled = true;
      r.shadowMap.type = THREE.PCFSoftShadowMap;
      r.setClearColor(0x000000, 0);
      canvasWrap.appendChild(r.domElement);

      this.scene = new THREE.Scene();
      this.pmrem = new THREE.PMREMGenerator(r);
      this.envs = {};
      if (THREE.RoomEnvironment) {
        this.envTex = this.pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
        this.scene.environment = this.envTex;
      }
      this.camera = new THREE.PerspectiveCamera(36, 1, 0.03, 200);
      this.camera.position.set(5, 4, 6);
      const hemi = new THREE.HemisphereLight(0xeaf4ff, 0x8a7f6c, this.envTex ? 0.12 : 0.8);
      this.key = new THREE.DirectionalLight(0xfff3df, this.envTex ? 1.15 : 1.0);
      this.key.castShadow = true;
      this.key.shadow.mapSize.set(2048, 2048);
      this.key.shadow.bias = -0.0004;
      this.key.shadow.normalBias = 0.02;
      const fill = new THREE.DirectionalLight(0xd6e8ff, 0.2);
      fill.position.set(-6, 4, -3);
      this.scene.add(hemi, this.key, this.key.target, fill);

      // Ground: soft studio disc that catches shadows, with a faint measuring grid
      const gm = new THREE.MeshStandardMaterial({ color: 0xc9d6e2, roughness: 1 });
      const disc = new THREE.Mesh(new THREE.CircleGeometry(9, 72), gm);
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = -0.003;
      disc.receiveShadow = true;
      disc.userData.noPick = true;
      const grid = new THREE.GridHelper(18, 36, 0xbfd0de, 0xd3dee8);
      grid.material.transparent = true;
      grid.material.opacity = 0.55;
      this.floor = new THREE.Group();
      this.floor.add(disc, grid);
      this.disc = disc;
      this.grid = grid;
      this.discMat = gm;
      this.scene.add(this.floor);

      this.outlineMat = makeOutlineMat();
      this.toolLayer = new THREE.Group();
      this.scene.add(this.toolLayer);

      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, r.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.minDistance = 0.2;
        this.controls.maxDistance = 30;
        this.controls.autoRotateSpeed = 0.7;
        this.controls.addEventListener('start', () => {
          this.camTween = null;
          this.userMoved = true;
          this.controls.autoRotate = false;
        });
      }

      this.raycaster = new THREE.Raycaster();
      let down = null;
      r.domElement.addEventListener('pointerdown', (e) => (down = [e.clientX, e.clientY]));
      r.domElement.addEventListener('pointerup', (e) => {
        if (!down) return;
        const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]);
        down = null;
        if (moved < 6) this.pick(e);
      });

      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(host);
      this.visible = true;
      this.io = new IntersectionObserver((en) => {
        this.visible = en[0].isIntersecting;
        if (this.visible) this.kick();
      });
      this.io.observe(host);
      this.clock = new THREE.Clock();
      this.loop = this.loop.bind(this);
      this.running = false;
      this.resize();
      this.kick();
    }

    kick() {
      if (!this.running && !this.failed) {
        this.running = true;
        requestAnimationFrame(this.loop);
      }
    }

    resize() {
      if (this.failed) return;
      const w = this.host.clientWidth || 300;
      const h = this.host.clientHeight || 200;
      this.renderer.setSize(w, h, false);
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }

    prepMeshes(root, list, isTool) {
      root.traverse((o) => {
        if (!o.isMesh || o.userData.isOutline) return;
        o.material = o.material.clone();
        const chain = [];
        let p = o;
        while (p && p !== root) {
          if (p.userData.part) chain.push(p.userData.part);
          p = p.parent;
        }
        o.userData.chain = chain;
        o.userData.isTool = !!isTool;
        o.userData.baseOpacity = o.material.transparent ? o.material.opacity : 1;
        o.userData.baseTransparent = o.material.transparent;
        o.userData.baseEmissive = o.material.emissive ? o.material.emissive.clone() : null;
        o.userData.baseEI = o.material.emissiveIntensity || 0;
        o.userData.baseLit = !!(o.material.emissive && o.material.emissive.getHex() !== 0);
        o.castShadow = !o.material.transparent;
        o.receiveShadow = true;
        list.push(o);
      });
    }

    // Real HDRI lighting when loaded; otherwise the generated studio room.
    setEnv(key) {
      const id = (TB.HDRI && TB.HDRI[key]) || key;
      const hdr = TB.assetCache && TB.assetCache.hdr[id];
      if (!hdr) {
        this.scene.environment = this.envTex || null;
        return;
      }
      if (!this.envs[id]) this.envs[id] = this.pmrem.fromEquirectangular(hdr).texture;
      this.scene.environment = this.envs[id];
    }

    // Scanned ground surface under outdoor scenes ({tex, repeat, radius}); studio disc otherwise.
    setGround(g) {
      if (this.groundMat) {
        this.groundMat.dispose();
        this.groundMat = null;
      }
      const set = g && TB.assetCache && TB.assetCache.tex[g.tex];
      if (set) {
        const rep = g.repeat || 6;
        this.groundMat = TB.pbr(g.tex, [rep, rep], { roughness: 1 });
        this.disc.material = this.groundMat;
        this.disc.scale.setScalar((g.radius || 9) / 9);
        this.grid.visible = false;
      } else {
        this.disc.material = this.discMat;
        this.disc.scale.setScalar(1);
        this.grid.visible = true;
      }
    }

    load(name) {
      if (this.failed) return false;
      this.unload();
      const def = TB.MODELS[name];
      if (!def) return false;
      const K = makeKit();
      const api = def.build(K) || {};
      this.K = K;
      this.api = api;
      this.view = def.view || {};
      this.scene.add(K.root);
      this.floor.visible = this.view.floor !== false;
      this.setEnv(this.view.env || 'studio');
      this.setGround(this.view.ground);
      this.base = {};
      this.cur = {};
      for (const [n, o] of Object.entries(K.parts)) {
        this.base[n] = { p: o.position.clone(), r: o.rotation.clone() };
        this.cur[n] = { off: [0, 0, 0], rot: [0, 0, 0], vis: 1 };
      }
      for (const n of this.view.hidden || []) {
        if (!this.cur[n]) continue;
        this.cur[n].vis = 0;
        K.parts[n].visible = false;
      }
      this.meshes = [];
      this.prepMeshes(K.root, this.meshes, false);
      this.fitShadow();
      this.hi = new Set();
      this.picked = null;
      this.fx = null;
      this.setCam(this.view.cam || [5, 4, 6], this.view.at || [0, 1, 0], false);
      this.kick();
      return true;
    }

    fitShadow() {
      const box = new THREE.Box3().setFromObject(this.K.root);
      const c = box.getCenter(new THREE.Vector3());
      const s = Math.max(1.5, box.getSize(new THREE.Vector3()).length());
      this.key.target.position.copy(c);
      this.key.position.set(c.x + s * 0.45, c.y + s * 1.1, c.z + s * 0.6);
      const sc = this.key.shadow.camera;
      sc.left = sc.bottom = -s * 0.7;
      sc.right = sc.top = s * 0.7;
      sc.near = 0.1;
      sc.far = s * 4;
      sc.updateProjectionMatrix();
      this.outlineMat.userData.thick.value = Math.max(0.004, Math.min(0.012, s * 0.0022));
    }

    unload() {
      this.clearTools();
      if (!this.K) return;
      this.scene.remove(this.K.root);
      this.K.root.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          if (!o.userData.isOutline) o.material.dispose();
        }
      });
      this.K = null;
      this.labelLayer.innerHTML = '';
    }

    clearTools() {
      for (const t of this.tools) {
        this.toolLayer.remove(t.group);
        t.group.traverse((o) => o.isMesh && (o.geometry.dispose(), o.material.dispose && !o.userData.isOutline && o.material.dispose()));
      }
      this.tools = [];
      this.toolMeshes = [];
    }

    /* Tool spec: {id, at:[x,y,z], rot:[deg x,y,z], anim:'turn'|'spin'|'tap'|'pump'|'slide'|'squeeze', amt, scale, opts} */
    setTools(specs) {
      this.clearTools();
      this.toolMeshes = [];
      for (const s of specs || []) {
        const t = TB.buildTool(s.id, s.opts);
        if (!t) continue;
        const holder = new THREE.Group();
        holder.position.set(...(s.at || [0, 0, 0]));
        const rr = s.rot || [0, 0, 0];
        holder.rotation.set(rr[0] * DEG, rr[1] * DEG, rr[2] * DEG);
        // Tools are modeled at real size for 1 unit = 30 cm; scenes declare their own unit (meters).
        holder.scale.setScalar((s.scale || 1) * (0.3 / ((this.view && this.view.unit) || 0.3)));
        holder.add(t.group);
        holder.userData.part = '__tool_' + s.id;
        this.toolLayer.add(holder);
        this.prepMeshes(holder, this.toolMeshes, true);
        this.tools.push({ group: holder, inner: t.group, spec: s, name: t.name, K: t.K, born: performance.now() });
      }
    }

    setCam(pos, at, animate) {
      if (!animate || reduceMotion()) {
        this.camera.position.set(pos[0], pos[1], pos[2]);
        if (this.controls) {
          this.controls.target.set(at[0], at[1], at[2]);
          this.controls.update();
        } else this.camera.lookAt(at[0], at[1], at[2]);
        this.camTween = null;
        return;
      }
      const from = this.camera.position.clone();
      const fromT = this.controls ? this.controls.target.clone() : new THREE.Vector3(...at);
      this.camTween = {
        t0: performance.now(),
        dur: 1150,
        from,
        fromT,
        to: new THREE.Vector3(pos[0], pos[1], pos[2]),
        toT: new THREE.Vector3(at[0], at[1], at[2]),
      };
    }

    /* pose: {cam, at, hi, fx, xray, tool}; state: cumulative {mv, rt, hide} */
    go(pose, state, animate) {
      if (this.failed || !this.K) return;
      pose = pose || {};
      state = state || { mv: {}, rt: {}, hide: [] };
      animate = animate !== false && !reduceMotion();
      const hide = new Set(state.hide || []);
      this.partTween = { t0: performance.now(), dur: animate ? 950 : 0, items: [] };
      for (const n of Object.keys(this.cur)) {
        const c = this.cur[n];
        const to = { off: state.mv[n] || [0, 0, 0], rot: state.rt[n] || [0, 0, 0], vis: hide.has(n) ? 0 : 1 };
        this.partTween.items.push({ n, from: { off: c.off.slice(), rot: c.rot.slice(), vis: c.vis }, to });
      }
      this.hi = new Set(pose.hi || []);
      this.picked = null;
      this.fx = pose.fx || null;
      this.poseXray = !!pose.xray;
      this.userMoved = false;
      const tl = pose.tool ? (Array.isArray(pose.tool) ? pose.tool : [pose.tool]) : [];
      this.setTools(tl);
      if (this.controls) this.controls.autoRotate = !!pose.spin;
      this.setCam(pose.cam || this.view.cam || [5, 4, 6], pose.at || this.view.at || [0, 1, 0], animate);
      if (!animate) this.applyParts(1);
      this.kick();
    }

    applyParts(k) {
      const tw = this.partTween;
      if (!tw) return;
      const e = ease(k);
      for (const it of tw.items) {
        const o = this.K.parts[it.n];
        const b = this.base[it.n];
        const c = this.cur[it.n];
        for (let i = 0; i < 3; i++) {
          c.off[i] = lerp(it.from.off[i], it.to.off[i], e);
          c.rot[i] = lerp(it.from.rot[i], it.to.rot[i], e);
        }
        c.vis = lerp(it.from.vis, it.to.vis, e);
        o.position.set(b.p.x + c.off[0], b.p.y + c.off[1], b.p.z + c.off[2]);
        o.rotation.set(b.r.x + c.rot[0] * DEG, b.r.y + c.rot[1] * DEG, b.r.z + c.rot[2] * DEG);
        o.visible = c.vis > 0.01;
      }
      if (k >= 1) this.partTween = null;
    }

    animTools(t, now) {
      for (const tool of this.tools) {
        const s = tool.spec;
        const g = tool.inner;
        const a = s.amt || 1;
        const age = Math.min(1, (now - tool.born) / 500);
        tool.group.userData.fade = age;
        g.position.set(0, 0, 0);
        g.rotation.set(0, 0, 0);
        const sp = s.speed || 1;
        switch (s.anim) {
          case 'turn': // ratcheting quarter turns about Y
            g.rotation.y = -Math.abs(Math.sin(t * 1.6 * sp)) * 0.7 * a;
            break;
          case 'spin':
            if (tool.K.parts.spinner) tool.K.parts.spinner.rotation.y = -t * 14 * sp;
            else g.rotation.y = -t * 4 * sp * a;
            break;
          case 'tap':
            g.position.y = Math.max(0, Math.sin(t * 7 * sp)) * 0.05 * a;
            break;
          case 'pump':
            g.position.y = (Math.sin(t * 3 * sp) * 0.5 + 0.5) * 0.25 * a;
            break;
          case 'slide':
            g.position.x = Math.sin(t * 2 * sp) * 0.2 * a;
            break;
          case 'push':
            g.position.y = -(Math.sin(t * 2 * sp) * 0.5 + 0.5) * 0.06 * a;
            break;
          case 'squeeze':
            if (tool.K.parts.jawB) tool.K.parts.jawB.rotation.z = (Math.sin(t * 3 * sp) * 0.5 + 0.5) * 0.18 * a;
            break;
          case 'swing':
            g.rotation.z = -Math.max(0, Math.sin(t * 4 * sp)) * 0.5 * a;
            break;
        }
        if (tool.K.api && tool.K.api.tick) tool.K.api.tick(t);
      }
    }

    pick(e) {
      if (!this.K) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      const v = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      this.raycaster.setFromCamera(v, this.camera);
      const pool = this.meshes.concat(this.toolMeshes || []).filter((m) => m.visible);
      const hits = this.raycaster.intersectObjects(pool, false);
      for (const h of hits) {
        if (h.object.userData.isTool) {
          let p = h.object;
          while (p && !(p.userData.part || '').startsWith('__tool_')) p = p.parent;
          const tool = this.tools.find((x) => x.group === p);
          if (tool && this.opts.onPick) this.opts.onPick(null, tool.name);
          return;
        }
        const ch = h.object.userData.chain;
        if (h.object.userData.noPick || !ch || !ch.length) continue;
        if (this.effOpacity(h.object) < 0.3) continue;
        this.picked = ch[0];
        if (this.opts.onPick) this.opts.onPick(ch[0], this.labelFor(ch[0]));
        this.kick();
        return;
      }
      this.picked = null;
    }

    labelFor(n) {
      return (this.K && this.K.names[n]) || n.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    }

    effOpacity(mesh) {
      let vis = 1;
      for (const n of mesh.userData.chain) vis *= this.cur[n] ? this.cur[n].vis : 1;
      return vis;
    }

    setOutline(me, on) {
      let ol = me.userData.outline;
      if (on && !ol) {
        ol = new THREE.Mesh(me.geometry, this.outlineMat);
        ol.userData.isOutline = true;
        ol.userData.noPick = true;
        ol.castShadow = false;
        ol.raycast = () => {};
        me.add(ol);
        me.userData.outline = ol;
      }
      if (ol) ol.visible = on;
    }

    loop() {
      if (!this.visible || document.hidden || !this.K) {
        this.running = false;
        return;
      }
      requestAnimationFrame(this.loop);
      const now = performance.now();
      const t = this.clock.getElapsedTime();
      if (this.partTween) this.applyParts(Math.min(1, (now - this.partTween.t0) / (this.partTween.dur || 1)));
      if (this.camTween) {
        const c = this.camTween;
        const k = ease(Math.min(1, (now - c.t0) / c.dur));
        this.camera.position.lerpVectors(c.from, c.to, k);
        if (this.controls) this.controls.target.lerpVectors(c.fromT, c.toT, k);
        if (k >= 1) this.camTween = null;
      }
      if (this.controls) this.controls.update();
      if (this.api.tick) this.api.tick(t, this.fx, this.K);
      this.animTools(t, now);

      const xr = this.xray || this.poseXray;
      const pulse = 0.1 + 0.07 * Math.sin(t * 4);
      this.outlineMat.opacity = 0.7 + 0.3 * Math.sin(t * 4);
      const anyHi = this.hi.size > 0;
      for (const me of this.meshes) {
        const ch = me.userData.chain;
        const isHi = ch.some((n) => this.hi.has(n) || n === this.picked);
        const eff = this.effOpacity(me);
        let op = me.userData.baseOpacity * eff;
        if (xr && anyHi && !isHi) op *= 0.18;
        const mat = me.material;
        const wantT = me.userData.baseTransparent || op < 0.999;
        if (mat.transparent !== wantT) {
          mat.transparent = wantT;
          mat.needsUpdate = true;
        }
        mat.opacity = op;
        mat.depthWrite = op > 0.5 && mat.blending !== THREE.AdditiveBlending;
        me.castShadow = op > 0.6 && !me.userData.baseTransparent;
        if (mat.emissive) {
          if (isHi) {
            mat.emissive.setHex(HILITE);
            // Only self-lit parts (flames, LEDs) keep their own glow; everything else gets a light tint.
            mat.emissiveIntensity = me.userData.baseLit ? Math.max(me.userData.baseEI, pulse) : pulse;
          } else {
            mat.emissive.copy(me.userData.baseEmissive);
            mat.emissiveIntensity = me.userData.baseEI;
          }
        }
        if (isHi || me.userData.outline) this.setOutline(me, isHi && eff > 0.5 && !me.userData.baseTransparent);
      }
      for (const me of this.toolMeshes || []) {
        let p = me;
        while (p && p.userData.fade == null) p = p.parent;
        const f = p ? p.userData.fade : 1;
        const want = f < 0.999 || me.userData.baseTransparent;
        if (me.material.transparent !== want) {
          me.material.transparent = want;
          me.material.needsUpdate = true;
        }
        me.material.opacity = me.userData.baseOpacity * f;
      }
      this.renderer.render(this.scene, this.camera);
      this.drawLabels();
    }

    drawLabels() {
      const L = this.labelLayer;
      const want = [];
      if (this.labelsOn) for (const n of this.hi) want.push(n);
      if (this.picked && !want.includes(this.picked)) want.push(this.picked);
      if (this.labelsOn) this.tools.forEach((t, i) => want.push('__tool' + i));
      const key = want.join('|');
      if (L.dataset.key !== key) {
        L.innerHTML = want
          .map((n) =>
            n.startsWith('__tool')
              ? `<span class="v-label tool" data-n="${n}">${this.tools[+n.slice(6)].name}</span>`
              : `<span class="v-label" data-n="${n}">${this.labelFor(n)}</span>`
          )
          .join('');
        L.dataset.key = key;
      }
      const w = this.host.clientWidth;
      const h = this.host.clientHeight;
      const box = new THREE.Box3();
      const v = new THREE.Vector3();
      const placed = [];
      for (const el of L.children) {
        const n = el.dataset.n;
        const o = n.startsWith('__tool') ? this.tools[+n.slice(6)].group : this.K.parts[n];
        if (!o || !o.visible) {
          el.style.opacity = 0;
          continue;
        }
        box.setFromObject(o);
        if (box.isEmpty()) continue;
        box.getCenter(v);
        v.y = lerp(v.y, box.max.y, n.startsWith('__tool') ? 0.9 : 0.6);
        v.project(this.camera);
        if (v.z > 1) {
          el.style.opacity = 0;
          continue;
        }
        let x = (v.x * 0.5 + 0.5) * w;
        let y = (-v.y * 0.5 + 0.5) * h;
        for (const p of placed) if (Math.abs(p[0] - x) < 110 && Math.abs(p[1] - y) < 28) y = p[1] - 30;
        placed.push([x, y]);
        x = Math.max(60, Math.min(w - 60, x));
        y = Math.max(34, Math.min(h - 4, y));
        el.style.opacity = 1;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
      }
    }

    destroy() {
      this.running = false;
      this.visible = false;
      if (this.failed) return;
      this.unload();
      this.ro.disconnect();
      this.io.disconnect();
      if (this.controls) this.controls.dispose();
      if (this.envTex) this.envTex.dispose();
      Object.values(this.envs).forEach((t) => t.dispose());
      this.pmrem.dispose();
      this.renderer.dispose();
      if (this.renderer.forceContextLoss) this.renderer.forceContextLoss();
    }

    setXray(on) {
      this.xray = on;
      this.kick();
    }
    setLabels(on) {
      this.labelsOn = on;
      this.kick();
    }
  }

  /* Build the cumulative part state for every step of a walkthrough.
     Index 0 is the overview (nothing moved). */
  TB.buildStates = function (steps, modelName, intro) {
    const def = TB.MODELS[modelName];
    intro = intro || {};
    // intro.show normally carries into the steps; with intro.preview it only applies to the overview
    // (projects show the finished build first, then start from bare ground).
    const hidden0 = (def && def.view && def.view.hidden) || [];
    const shown = intro.show || [];
    const start = (intro.preview ? hidden0 : hidden0.filter((n) => !shown.includes(n))).concat(intro.hide || []);
    const first = hidden0.filter((n) => !shown.includes(n)).concat(intro.hide || []);
    const out = [{ mv: {}, rt: {}, hide: first }];
    let mv = {};
    let rt = {};
    let hide = new Set(start);
    for (const s of steps) {
      const v = s.v || {};
      if (v.reset) {
        mv = {};
        rt = {};
        hide = new Set(start);
      }
      if (v.mv) mv = Object.assign({}, mv, v.mv);
      if (v.rt) rt = Object.assign({}, rt, v.rt);
      if (v.hide) v.hide.forEach((n) => hide.add(n));
      if (v.show) v.show.forEach((n) => hide.delete(n));
      out.push({ mv, rt, hide: [...hide] });
    }
    return out;
  };

  TB.Viewer = Viewer;
})();
