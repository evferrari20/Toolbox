/* Category registry. Each file in js/content/ calls TB.category({...}) once. */
(function () {
  const TB = (window.TB = window.TB || {});
  TB.categories = [];
  TB.category = function (c) {
    TB.categories.push(c);
  };
  TB.DOMAINS = [
    { id: 'systems', name: 'Home systems', blurb: 'Water, power, air and the machines that use them' },
    { id: 'interior', name: 'Inside the house', blurb: 'Walls, doors, floors and furniture' },
    { id: 'exterior', name: 'Outside & yard', blurb: 'Roof, deck, fence, concrete and lawn' },
    { id: 'vehicles', name: 'Vehicles', blurb: 'Car and bike basics' },
    { id: 'recreation', name: 'Recreation', blurb: 'Campfires, courts and cookouts' },
    { id: 'tech', name: 'Tech', blurb: 'Computers and home network' },
  ];
})();
