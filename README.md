# Toolbox

Step-by-step repair guides for the home, yard, vehicles and recreation. Every repair has an interactive 3D walkthrough and an optional **Learn mode** with the deeper explanations.

**54 repairs · 19 categories · 39 3D models**

| Area | Categories |
| --- | --- |
| Home systems | Plumbing, Electrical, Heating/Cooling & Hot Water, Appliances |
| Inside the house | Walls/Paint/Caulk, Doors & Windows, Floors & Tile, Home & Furniture |
| Outside & yard | Roof & Gutters, Deck & Patio, Fence & Gate, Driveway & Concrete, Lawn & Garden |
| Vehicles | Auto, Bike |
| Recreation | Campfire & Camping, Basketball Court, Grill & Outdoor Cooking |
| Tech | Computers & Network |

## What each repair has

- Safety box, likely causes, a tools checklist you can tap off, numbered steps you can tap off (progress is saved in the browser), and a "Call a pro if" note.
- **3D walkthrough**: Start / Next / Play steps the camera through the repair. Parts come apart, the part you work on glows yellow and gets a label. Drag to rotate, scroll or pinch to zoom, tap any part to name it. **X-ray** sees through housings.
- **Learn mode** (switch in the top bar): How it works, key numbers, a *Why* under every step, terms, common mistakes and pro tips.

## Run it

No build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Three.js r128 loads from a CDN.

## Adding content

Each category is one file in `js/content/`. It does two things:

1. `TB.model(name, view, build)` builds a 3D model from primitives with the kit helpers (`K.box`, `K.cyl`, `K.tube`, `K.bar`, `K.lathe`…). Named parts come from `K.part('name', pos, parent, 'Label')`.
2. `TB.category({...})` lists the repairs. Each step has a 3D pose `v`:

```js
v: {
  cam: [x, y, z], at: [x, y, z], // camera position and target
  hi: ['cartridge'],              // parts to highlight and label
  mv: { handle: [0, 0.8, 0] },    // offset a part (carries forward to later steps)
  rt: { knob: [0, 0, 90] },       // rotate a part in degrees (carries forward)
  hide: ['lid'], show: ['newPart'],
  xray: true, fx: 'drip'          // see-through mode, model-specific animation
}
```

Then add the file's `<script>` tag to `index.html`.
