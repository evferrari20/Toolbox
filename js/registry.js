/* Category registry. Each file in js/content/ calls TB.category({...}) once. */
(function () {
  const TB = (window.TB = window.TB || {});
  TB.categories = [];
  TB.category = function (c) {
    TB.categories.push(c);
  };
  const cat = (id) => TB.categories.find((c) => c.id === id);
  // Add more repairs to an existing category.
  TB.more = function (catId, repairs) {
    cat(catId).repairs.push(...repairs);
  };
  // Look up a repair to attach variants or tools to its steps.
  TB.repair = function (catId, repairId) {
    return cat(catId).repairs.find((r) => r.id === repairId);
  };
  // Put a tool on step n (1-based) of a repair.
  TB.useTool = function (r, n, tool) {
    r.steps[n - 1].v = Object.assign({}, r.steps[n - 1].v, { tool });
  };
  // Add parts (e.g. build add-ons) to a model registered elsewhere. New parts start hidden.
  TB.extendModel = function (name, extra, opts) {
    const d = TB.MODELS && TB.MODELS[name];
    if (!d) return;
    opts = opts || {};
    const old = d.build;
    d.build = (K) => {
      const api = old(K);
      const more = extra(K);
      if (!api) return more;
      if (more && more.tick) {
        const t0 = api.tick;
        api.tick = (t, fx) => (t0 && t0(t, fx), more.tick(t, fx));
      }
      return api;
    };
    d.view = Object.assign({}, d.view, {
      hidden: (d.view.hidden || []).concat(opts.hidden || []),
      assets: (d.view.assets || []).concat(opts.assets || []),
      tex: (d.view.tex || []).concat(opts.tex || []),
    });
  };
  TB.DOMAINS = [
    { id: 'systems', name: 'Home systems', blurb: 'Water, power, air and the machines that use them' },
    { id: 'interior', name: 'Inside the house', blurb: 'Walls, doors, floors and furniture' },
    { id: 'exterior', name: 'Outside & yard', blurb: 'Roof, deck, fence, concrete and lawn' },
    { id: 'projects', name: 'Backyard builds', blurb: 'Weekend projects that upgrade your outdoor space' },
    { id: 'garden', name: 'Garden', blurb: 'Build growing spaces, then grow food, flowers and trees' },
    { id: 'vehicles', name: 'Vehicles', blurb: 'Car and bike basics' },
    { id: 'recreation', name: 'Recreation', blurb: 'Campfires, courts and cookouts' },
    { id: 'tech', name: 'Tech', blurb: 'Computers and home network' },
  ];
})();
