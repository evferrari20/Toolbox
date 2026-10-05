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
  TB.DOMAINS = [
    { id: 'systems', name: 'Home systems', blurb: 'Water, power, air and the machines that use them' },
    { id: 'interior', name: 'Inside the house', blurb: 'Walls, doors, floors and furniture' },
    { id: 'exterior', name: 'Outside & yard', blurb: 'Roof, deck, fence, concrete and lawn' },
    { id: 'projects', name: 'Backyard builds', blurb: 'Weekend projects that upgrade your outdoor space' },
    { id: 'vehicles', name: 'Vehicles', blurb: 'Car and bike basics' },
    { id: 'recreation', name: 'Recreation', blurb: 'Campfires, courts and cookouts' },
    { id: 'tech', name: 'Tech', blurb: 'Computers and home network' },
  ];
})();
