/* Asset loading: photo-scanned CC0 models, PBR textures and HDRI lighting from Poly Haven
   (assets/credits.json lists every asset and author). Everything is cached, and loaded
   only when a repair that needs it opens. If an asset fails to load, the procedural
   fallback is used, so the walkthrough still works. */
(function () {
  const TB = window.TB;
  const BASE = (window.TB_ASSET_BASE || 'assets/').replace(/\/?$/, '/');
  const cache = { glb: {}, tex: {}, hdr: {} };
  const pending = {};
  TB.assetCache = cache;

  const HDRI = { studio: 'studio_small_09', garden: 'suburban_garden', garage: 'skylit_garage' };
  TB.HDRI = HDRI;

  function once(key, fn) {
    if (!pending[key]) pending[key] = fn().catch((e) => {
      console.warn('asset failed', key, e && e.message);
      return null;
    });
    return pending[key];
  }

  TB.loadGLB = function (id) {
    if (!THREE.GLTFLoader) return Promise.resolve(null);
    return once('glb:' + id, () =>
      new Promise((res, rej) => {
        new THREE.GLTFLoader().load(BASE + 'models/' + id + '.glb', (g) => {
          g.scene.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          cache.glb[id] = g.scene;
          res(g.scene);
        }, undefined, rej);
      })
    );
  };

  // PBR set: <name>_diff, _nor, _arm (ambient occlusion / roughness / metalness packed)
  TB.loadTexSet = function (name) {
    return once('tex:' + name, () => {
      const L = new THREE.TextureLoader();
      const get = (suffix, color) =>
        new Promise((res) =>
          L.load(BASE + 'tex/' + name + '_' + suffix + '.webp', (t) => {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.anisotropy = 8;
            if (color) t.encoding = THREE.sRGBEncoding;
            res(t);
          }, undefined, () => res(null))
        );
      return Promise.all([get('diff', true), get('nor'), get('arm')]).then(([map, normalMap, arm]) => {
        if (!map) throw new Error('missing ' + name);
        cache.tex[name] = { map, normalMap, arm };
        return cache.tex[name];
      });
    });
  };

  // HDRI environment, prefiltered per renderer.
  TB.loadHDR = function (key) {
    const id = HDRI[key] || key;
    if (!THREE.RGBELoader) return Promise.resolve(null);
    return once('hdr:' + id, () =>
      new Promise((res, rej) => {
        new THREE.RGBELoader().load(BASE + 'hdri/' + id + '_1k.hdr', (t) => {
          t.mapping = THREE.EquirectangularReflectionMapping;
          cache.hdr[id] = t;
          res(t);
        }, undefined, rej);
      })
    );
  };

  /* Collect everything a repair needs: model assets, textures, tools used in steps. */
  TB.needsFor = function (modelName, steps, intro) {
    const def = TB.MODELS[modelName] || {};
    const v = def.view || {};
    const glb = new Set(v.assets || []);
    const tex = new Set(v.tex || []);
    const addTool = (spec) => {
      const t = TB.TOOLS[spec.id];
      if (t && t.glb) glb.add(t.glb);
    };
    [intro || {}].concat((steps || []).map((s) => s.v || {})).forEach((p) => {
      const tl = p.tool ? (Array.isArray(p.tool) ? p.tool : [p.tool]) : [];
      tl.forEach(addTool);
    });
    if (v.ground && v.ground.tex) tex.add(v.ground.tex);
    return { glb: [...glb], tex: [...tex], env: v.env || 'studio' };
  };

  TB.preload = function (need) {
    return Promise.all(
      need.glb.map(TB.loadGLB).concat(need.tex.map(TB.loadTexSet)).concat([TB.loadHDR(need.env)])
    );
  };

  /* Material from a scanned texture set. repeat = [u, v] tiling. Falls back to color. */
  TB.pbr = function (name, repeat, opts, fallback) {
    const set = cache.tex[name];
    const o = Object.assign({ color: 0xffffff, roughness: 1, metalness: 0 }, opts || {});
    if (!set) return new THREE.MeshStandardMaterial(Object.assign({}, o, { color: fallback != null ? fallback : 0x9a9a9a }));
    const rep = (t) => {
      if (!t) return null;
      const c = t.clone();
      c.needsUpdate = true;
      c.repeat.set(repeat ? repeat[0] : 1, repeat ? repeat[1] : 1);
      return c;
    };
    const m = new THREE.MeshStandardMaterial(o);
    m.map = rep(set.map);
    m.normalMap = rep(set.normalMap);
    if (set.arm) {
      m.roughnessMap = rep(set.arm);
      if (o.metalness > 0) m.metalnessMap = m.roughnessMap;
    }
    m.normalScale = new THREE.Vector2(1, 1);
    return m;
  };

  /* Clone a cached GLB, oriented and scaled.
     opts: rot [deg], size (largest dimension) | height | width | scale,
           anchor [0..1 x,y,z] point of the bounding box placed at the origin (default bottom-center). */
  TB.placeGLB = function (id, opts) {
    const src = cache.glb[id];
    if (!src) return null;
    opts = opts || {};
    let inner;
    if (opts.node) {
      // Pick named nodes out of a multi-object scan (e.g. one shrub from a set).
      inner = new THREE.Group();
      [].concat(opts.node).forEach((n) => {
        const o = src.getObjectByName(n);
        if (o) inner.add(o.clone(true));
      });
    } else inner = src.clone(true);
    inner.traverse((o) => {
      if (o.isMesh) o.material = o.material.clone();
    });
    const rotG = new THREE.Group();
    rotG.add(inner);
    // rots: ordered list of [axis, degrees] applied one after another (world axes).
    if (opts.rots) {
      const ax = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
      opts.rots.forEach(([a, d]) => rotG.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(ax[a], (d * Math.PI) / 180)));
    } else {
      const r = opts.rot || [0, 0, 0];
      rotG.rotation.set((r[0] * Math.PI) / 180, (r[1] * Math.PI) / 180, (r[2] * Math.PI) / 180);
    }
    const wrap = new THREE.Group();
    wrap.add(rotG);
    wrap.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(rotG);
    const size = box.getSize(new THREE.Vector3());
    let s = opts.scale || 1;
    if (opts.size) s = opts.size / Math.max(size.x, size.y, size.z);
    else if (opts.height) s = opts.height / size.y;
    else if (opts.width) s = opts.width / size.x;
    else if (opts.length) s = opts.length / size.z;
    rotG.scale.setScalar(s);
    wrap.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(rotG);
    const a = opts.anchor || [0.5, 0, 0.5];
    const p = new THREE.Vector3(
      box.min.x + (box.max.x - box.min.x) * a[0],
      box.min.y + (box.max.y - box.min.y) * a[1],
      box.min.z + (box.max.z - box.min.z) * a[2]
    );
    rotG.position.sub(p);
    return wrap;
  };
})();
