/* Affiliate links: framework only, off until configured.

   To turn on:
   1. Join each retailer's program (e.g. The Home Depot via Impact, Lowe's via its affiliate
      network, Amazon Associates) and paste your IDs below.
   2. Set enabled: true.
   The FTC requires a clear disclosure near affiliate links; the `disclosure` text is shown
   automatically whenever links are on. Links use rel="sponsored" as search engines ask.

   Each partner builds a product search URL from the tool name. `tag` is appended as
   `tagParam=tag` when set. Use `product` to map a specific tool name to an exact product URL. */
(function () {
  const A = (TB.AFFILIATE = {
    enabled: false,
    // Show plain (non-affiliate) shopping links even before any program is set up.
    showWithoutTags: false,
    disclosure: 'Some links are affiliate links. If you buy through them, Toolbox may earn a small commission at no extra cost to you.',
    partners: [
      { id: 'homedepot', name: 'The Home Depot', search: 'https://www.homedepot.com/s/{q}', tagParam: '', tag: '' },
      { id: 'lowes', name: 'Lowe’s', search: 'https://www.lowes.com/search?searchTerm={q}', tagParam: '', tag: '' },
      { id: 'amazon', name: 'Amazon', search: 'https://www.amazon.com/s?k={q}', tagParam: 'tag', tag: '' },
    ],
    // Exact product links by tool name, e.g. { 'Hex (Allen) key set': { amazon: 'https://…' } }
    product: {},
  });

  // Turn "Replacement cartridge (same brand & model)" into a clean search query.
  const query = (name) =>
    name
      .replace(/\(.*?\)/g, '')
      .replace(/[“”"]/g, '')
      .split(/[,;]| or | & | \+ /)[0]
      .trim();

  A.linkFor = function (partner, toolName) {
    const exact = A.product[toolName] && A.product[toolName][partner.id];
    let url = exact || partner.search.replace('{q}', encodeURIComponent(query(toolName)));
    if (partner.tag && partner.tagParam) url += (url.includes('?') ? '&' : '?') + partner.tagParam + '=' + encodeURIComponent(partner.tag);
    return url;
  };

  const active = () => A.partners.filter((p) => p.tag || A.showWithoutTags);

  // "Shop this list" block rendered under a guide's tools.
  TB.shopBlock = function (tools) {
    if (!A.enabled) return '';
    const parts = active();
    if (!parts.length) return '';
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    return `<details class="shop"><summary>Shop this list</summary><div class="shop-rows">${tools
      .map(
        (t) => `<div class="shop-row"><span>${esc(t)}</span><span class="shop-links">${parts
          .map((p) => `<a href="${esc(A.linkFor(p, t))}" target="_blank" rel="sponsored noopener">${esc(p.name)}</a>`)
          .join('')}</span></div>`
      )
      .join('')}</div><p class="shop-note">${esc(A.disclosure)}</p></details>`;
  };
})();
