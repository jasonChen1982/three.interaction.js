# three.interaction

[![npm](https://img.shields.io/npm/v/three.interaction.svg?style=flat-square)](https://github.com/jasonChen1982/three.interaction.js)
[![javascript style guide](https://img.shields.io/badge/code_style-google-brightgreen.svg)](https://google.github.io/styleguide/jsguide.html)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)

a full-interaction event manager, help `three.js` binding interaction event more simple

# install

```sh
npm install -S three.interaction
```

# usage

```javascript
import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
import { Interaction } from 'three.interaction';

const renderer = new WebGLRenderer({ canvas: canvasElement });
const scene = new Scene();
const camera = new PerspectiveCamera(60, width / height, 0.1, 100);

// new a interaction, then you can add interaction-event with your free style
const interaction = new Interaction(renderer, scene, camera);

const cube = new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshBasicMaterial({ color: 0xffffff }),
);
scene.add(cube);
cube.cursor = 'pointer';
cube.on('click', function(ev) {});
cube.on('touchstart', function(ev) {});
cube.on('touchcancel', function(ev) {});
cube.on('touchmove', function(ev) {});
cube.on('touchend', function(ev) {});
cube.on('mousedown', function(ev) {});
cube.on('mouseout', function(ev) {});
cube.on('mouseover', function(ev) {});
cube.on('mousemove', function(ev) {});
cube.on('mouseup', function(ev) {});
// and so on ...

/**
 * you can also listen on parent-node or any display-tree node,
 * source event will bubble up along with display-tree.
 * you can stop the bubble-up by invoke ev.stopPropagation function.
 */
scene.on('touchstart', ev => {
  console.log(ev);
})
scene.on('touchmove', ev => {
  console.log(ev);
})

```

## Documentation
[documentation][documentation]

## Examples
[examples][examples]


[documentation]:https://jasonchen1982.github.io/three.interaction.js/docs/ "three.interaction documention page"
[examples]:https://jasonchen1982.github.io/three.interaction.js/examples/interaction/ "three.interaction examples page"
