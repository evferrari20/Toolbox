/* Toolbox 3D engine.
   Models are built from primitives in code (see js/content/*.js) and expose named parts.
   A walkthrough step is a "pose": camera position, highlighted parts, and part offsets.
   Offsets accumulate from step to step, so a part removed in step 2 stays removed until
   a later step puts it back. */
(function () {
  const TB = (window.TB = window.TB || {});
  TB.MODELS = TB.MODELS || {};
  const DEG = Math.PI / 180;
  const HILITE = 0xf2c84b;

  TB.model = function (name, view, build) {
    TB.MODELS[name] = { view, build };
  };

  /* ---------- Kit: helpers handed to every model builder ---------- */
  function makeKit() {
    const root = new THREE.Group();
    const parts = {};
    const names = {};
    const std = (color, o) =>
      new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0.08 }, o || {}));
    const m = {
      steel: std(0xa9b2ba, { metalness: 0.45, roughness: 0.35 }),
      chrome: std(0xdfe4e8, { metalness: 0.55, roughness: 0.18 }),
      brass: std(0xcfa856, { metalness: 0.45, roughness: 0.35 }),
      copper: std(0xc77a48, { metalness: 0.45, roughness: 0.4 }),
      dark: std(0x3a4047, { roughness: 0.55 }),
      black: std(0x24272b, { roughness: 0.6 }),
      rubber: std(0x1f2124, { roughness: 0.95 }),
      white: std(0xf4f4f0, { roughness: 0.3 }),
      offwhite: std(0xe9e5dc, { roughness: 0.7 }),
      grey: std(0x8d969e, { roughness: 0.6 }),
      lightgrey: std(0xc9ced3, { roughness: 0.6 }),
      wood: std(0xb98552, { roughness: 0.85 }),
      woodDark: std(0x7d5634, { roughness: 0.85 }),
      woodLight: std(0xdcbc8c, { roughness: 0.85 }),
      bark: std(0x5a4130, { roughness: 1 }),
      char: std(0x2b2422, { roughness: 1 }),
      concrete: std(0x9f9e97, { roughness: 0.95 }),
      asphalt: std(0x4a4c4f, { roughness: 0.95 }),
      grass: std(0x79a356, { roughness: 1 }),
      dirt: std(0x8a6a48, { roughness: 1 }),
      stone: std(0x8f8b85, { roughness: 0.95 }),
      drywall: std(0xdcd8d0, { roughness: 0.95 }),
      pvc: std(0xeceee8, { roughness: 0.45 }),
      red: std(0xc9473b),
      orange: std(0xe0803a),
      yellow: std(0xe9c341),
      green: std(0x4f9a5e),
      blue: std(0x3f7fbf),
      sky: std(0x9cc9ea),
      navy: std(0x2f4a6b),
      water: std(0x6fb3ea, { transparent: true, opacity: 0.6, roughness: 0.1 }),
      glass: std(0xcfe6f3, { transparent: true, opacity: 0.35, roughness: 0.05 }),
      fire: std(0xff8a1f, { emissive: 0xff6a00, emissiveIntensity: 1.2, transparent: true, opacity: 0.9 }),
      flame: std(0xffd25a, { emissive: 0xffb000, emissiveIntensity: 1.4, transparent: true, opacity: 0.85 }),
      ember: std(0xff4a1a, { emissive: 0xff3300, emissiveIntensity: 1 }),
      ledG: std(0x4bd16a, { emissive: 0x2fcf55, emissiveIntensity: 1 }),
      ledR: std(0xff5a4a, { emissive: 0xff2a1a, emissiveIntensity: 1 }),
      ledB: std(0x5ab0ff, { emissive: 0x2a8cff, emissiveIntensity: 1 }),
      screen: std(0x1d2a38, { emissive: 0x284b6e, emissiveIntensity: 0.5, roughness: 0.2 }),
    };
    const P = (p) => (typeof p === 'string' ? parts[p] : p || root);
    const place = (mesh, parent, pos, rot) => {
      if (pos) mesh.position.set(pos[0], pos[1], pos[2]);
      if (rot) mesh.rotation.set(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG);
      P(parent).add(mesh);
      return mesh;
    };
    const mk = (geo, mat) => new THREE.Mesh(geo, typeof mat === 'string' ? m[mat] : mat);
    const K = {
      THREE,
      root,
      parts,
      names,
      m,
      std,
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
      box(parent, s, mat, pos, rot) {
        return place(mk(new THREE.BoxGeometry(s[0], s[1], s[2]), mat), parent, pos, rot);
      },
      cyl(parent, s, mat, pos, rot) {
        // s = [radiusTop, radiusBottom, height, segments?, openEnded?]
        return place(mk(new THREE.CylinderGeometry(s[0], s[1], s[2], s[3] || 28, 1, !!s[4]), mat), parent, pos, rot);
      },
      sph(parent, r, mat, pos, scale) {
        const me = place(mk(new THREE.SphereGeometry(r, 24, 16), mat), parent, pos);
        if (scale) me.scale.set(scale[0], scale[1], scale[2]);
        return me;
      },
      tor(parent, s, mat, pos, rot) {
        // s = [radius, tube, arc(deg)?]
        return place(mk(new THREE.TorusGeometry(s[0], s[1], 12, 40, (s[2] || 360) * DEG), mat), parent, pos, rot);
      },
      cone(parent, s, mat, pos, rot) {
        return place(mk(new THREE.ConeGeometry(s[0], s[1], s[2] || 24), mat), parent, pos, rot);
      },
      lathe(parent, pts, mat, pos, rot) {
        const v = pts.map((p) => new THREE.Vector2(p[0], p[1]));
        const me = mk(new THREE.LatheGeometry(v, 36), mat);
        me.material = me.material.clone();
        me.material.side = THREE.DoubleSide;
        return place(me, parent, pos, rot);
      },
      tube(parent, pts, r, mat, closed) {
        const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])), !!closed);
        return place(mk(new THREE.TubeGeometry(curve, Math.max(24, pts.length * 12), r, 10, !!closed), mat), parent);
      },
      // Straight round bar between two points.
      bar(parent, a, b, r, mat) {
        const va = new THREE.Vector3(a[0], a[1], a[2]);
        const vb = new THREE.Vector3(b[0], b[1], b[2]);
        const len = va.distanceTo(vb);
        const me = mk(new THREE.CylinderGeometry(r, r, len, 14), mat);
        me.position.copy(va).add(vb).multiplyScalar(0.5);
        me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
        P(parent).add(me);
        return me;
      },
      // Flat shape from 2D points, extruded along z by depth.
      ext(parent, pts, depth, mat, pos, rot) {
        const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
        const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
        return place(mk(geo, mat), parent, pos, rot);
      },
      // Repeated helper: n items from fn(i)
      rep(n, fn) {
        for (let i = 0; i < n; i++) fn(i);
      },
      // Simple falling-drop effect bound to a mesh; call drip.tick(t) from model tick.
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
      const canvasWrap = document.createElement('div');
      canvasWrap.className = 'v-canvas';
      host.appendChild(canvasWrap);
      this.labelLayer = document.createElement('div');
      this.labelLayer.className = 'v-labels';
      host.appendChild(this.labelLayer);
      try {
        if (!window.THREE) throw new Error('three missing');
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch (e) {
        this.failed = true;
        canvasWrap.innerHTML =
          '<div class="v-fallback">The 3D view could not start on this device. All the steps below still work.</div>';
        return;
      }
      const r = this.renderer;
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.outputEncoding = THREE.sRGBEncoding;
      r.setClearColor(0x000000, 0);
      canvasWrap.appendChild(r.domElement);

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);
      this.camera.position.set(5, 4, 6);
      const hemi = new THREE.HemisphereLight(0xffffff, 0x7d8a98, 0.6);
      const key = new THREE.DirectionalLight(0xfff6e4, 0.8);
      key.position.set(5, 9, 6);
      const fill = new THREE.DirectionalLight(0xdcecff, 0.35);
      fill.position.set(-6, 4, -3);
      const rim = new THREE.DirectionalLight(0xffffff, 0.25);
      rim.position.set(0, 3, -8);
      this.scene.add(hemi, key, fill, rim);

      // Workbench mat: soft disc with a cutting-mat grid
      const mat = new THREE.Mesh(
        new THREE.CircleGeometry(7, 64),
        new THREE.MeshStandardMaterial({ color: 0xd5dde4, roughness: 1 })
      );
      mat.rotation.x = -Math.PI / 2;
      mat.position.y = -0.002;
      mat.userData.noPick = true;
      const grid = new THREE.GridHelper(14, 28, 0xb9c6d1, 0xd0d8df);
      grid.material.transparent = true;
      grid.material.opacity = 0.7;
      this.floor = new THREE.Group();
      this.floor.add(mat, grid);
      this.scene.add(this.floor);

      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, r.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.09;
        this.controls.minDistance = 0.6;
        this.controls.maxDistance = 30;
        this.controls.addEventListener('start', () => {
          this.camTween = null;
          this.userMoved = true;
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
      // Base transforms and per-mesh part chains
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
      K.root.traverse((o) => {
        if (!o.isMesh) return;
        o.material = o.material.clone();
        const chain = [];
        let p = o;
        while (p && p !== K.root) {
          if (p.userData.part) chain.push(p.userData.part);
          p = p.parent;
        }
        o.userData.chain = chain;
        o.userData.baseOpacity = o.material.transparent ? o.material.opacity : 1;
        o.userData.baseTransparent = o.material.transparent;
        o.userData.baseEmissive = o.material.emissive ? o.material.emissive.clone() : null;
        o.userData.baseEI = o.material.emissiveIntensity || 0;
        this.meshes.push(o);
      });
      this.hi = new Set();
      this.picked = null;
      this.fx = null;
      this.setCam(this.view.cam || [5, 4, 6], this.view.at || [0, 1, 0], false);
      this.kick();
      return true;
    }

    unload() {
      if (!this.K) return;
      this.scene.remove(this.K.root);
      this.K.root.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          o.material.dispose();
        }
      });
      this.K = null;
      this.labelLayer.innerHTML = '';
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
        dur: 1100,
        from,
        fromT,
        to: new THREE.Vector3(pos[0], pos[1], pos[2]),
        toT: new THREE.Vector3(at[0], at[1], at[2]),
      };
    }

    /* pose: {cam, at, hi, fx, xray}; state: cumulative {mv, rt, hide} */
    go(pose, state, animate) {
      if (this.failed || !this.K) return;
      pose = pose || {};
      state = state || { mv: {}, rt: {}, hide: [] };
      animate = animate !== false && !reduceMotion();
      const hide = new Set(state.hide || []);
      this.partTween = { t0: performance.now(), dur: animate ? 950 : 0, items: [] };
      for (const n of Object.keys(this.cur)) {
        const c = this.cur[n];
        const to = {
          off: state.mv[n] || [0, 0, 0],
          rot: state.rt[n] || [0, 0, 0],
          vis: hide.has(n) ? 0 : 1,
        };
        this.partTween.items.push({ n, from: { off: c.off.slice(), rot: c.rot.slice(), vis: c.vis }, to });
      }
      this.hi = new Set(pose.hi || []);
      this.picked = null;
      this.fx = pose.fx || null;
      this.poseXray = !!pose.xray;
      this.userMoved = false;
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

    pick(e) {
      if (!this.K) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      const v = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      this.raycaster.setFromCamera(v, this.camera);
      const hits = this.raycaster.intersectObjects(this.meshes.filter((m) => m.visible), false);
      for (const h of hits) {
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

      const xr = this.xray || this.poseXray;
      const pulse = 0.2 + 0.12 * Math.sin(t * 4);
      const anyHi = this.hi.size > 0;
      for (const me of this.meshes) {
        const ch = me.userData.chain;
        const isHi = ch.some((n) => this.hi.has(n) || n === this.picked);
        let op = me.userData.baseOpacity * this.effOpacity(me);
        if (xr && anyHi && !isHi) op *= 0.22;
        const mat = me.material;
        const wantT = me.userData.baseTransparent || op < 0.999;
        if (mat.transparent !== wantT) {
          mat.transparent = wantT;
          mat.needsUpdate = true;
        }
        mat.opacity = op;
        mat.depthWrite = op > 0.5;
        if (mat.emissive) {
          if (isHi) {
            mat.emissive.setHex(HILITE);
            mat.emissiveIntensity = Math.max(me.userData.baseEI, pulse);
          } else {
            mat.emissive.copy(me.userData.baseEmissive);
            mat.emissiveIntensity = me.userData.baseEI;
          }
        }
      }
      this.renderer.render(this.scene, this.camera);
      this.drawLabels();
    }

    drawLabels() {
      const L = this.labelLayer;
      const want = [];
      if (this.labelsOn) for (const n of this.hi) want.push(n);
      if (this.picked && !want.includes(this.picked)) want.push(this.picked);
      const key = want.join('|');
      if (L.dataset.key !== key) {
        L.innerHTML = want.map((n) => `<span class="v-label" data-n="${n}">${this.labelFor(n)}</span>`).join('');
        L.dataset.key = key;
      }
      const w = this.host.clientWidth;
      const h = this.host.clientHeight;
      const box = new THREE.Box3();
      const v = new THREE.Vector3();
      const placed = [];
      for (const el of L.children) {
        const o = this.K.parts[el.dataset.n];
        if (!o || !o.visible) {
          el.style.opacity = 0;
          continue;
        }
        box.setFromObject(o);
        if (box.isEmpty()) continue;
        box.getCenter(v);
        v.y = lerp(v.y, box.max.y, 0.6);
        v.project(this.camera);
        if (v.z > 1) {
          el.style.opacity = 0;
          continue;
        }
        let x = (v.x * 0.5 + 0.5) * w;
        let y = (-v.y * 0.5 + 0.5) * h;
        // nudge apart overlapping labels
        for (const p of placed) if (Math.abs(p[0] - x) < 90 && Math.abs(p[1] - y) < 26) y = p[1] - 28;
        placed.push([x, y]);
        x = Math.max(8, Math.min(w - 8, x));
        y = Math.max(30, Math.min(h - 4, y));
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
    const start = ((def && def.view && def.view.hidden) || [])
      .filter((n) => !(intro.show || []).includes(n))
      .concat(intro.hide || []);
    const out = [{ mv: {}, rt: {}, hide: start.slice() }];
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
