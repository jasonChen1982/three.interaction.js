# three.interaction

a full-interaction manager, help `three.js` easy to binding interaction event

```javascript
import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
import { InteractionManager } from 'three.interaction';

const renderer = new WebGLRenderer({ canvas: canvasElement });
const scene = new Scene();
const camera = new PerspectiveCamera(60, width / height, 0.1, 100);

// new a manager, then you can add interaction-event with your free style
const interactionManager = new InteractionManager(renderer, scene, camera);

const cube = new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshBasicMaterial({ color: 0xffffff }),
);
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
// ...

scene.add(cube);

```


## Documentation
[documentation][documentation]

## Examples
[examples][examples]


[documentation]:https://jasonchen1982.github.io/three.interaction.js/docs/ "three.interaction documention page"
[examples]:https://jasonchen1982.github.io/three.interaction.js/examples/ "three.interaction examples page"
