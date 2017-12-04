a full-interaction manager, help `three.js` easy to binding interaction event

```javascript
import { Scene, PerspectiveCamera, WebGLRenderer, Mesh } from 'three';
import { InteractionManager } from 'three.interaction';

const renderer = new WebGLRenderer();
const scene = new Scene();
const camera = new PerspectiveCamera();

// new a manager
const interactionManager = new InteractionManager(renderer, scene, camera);

const cube = new Mesh();
cube.on('click', function(ev) {});
cube.on('touchstart', function(ev) {});
cube.on('touchstart', function(ev) {});
cube.on('touchend', function(ev) {});
cube.on('mousedown', function(ev) {});

scene.add(cube);

```
