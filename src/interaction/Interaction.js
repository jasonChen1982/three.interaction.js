import Ticker from '../utils/Ticker';
import InteractionManager from './InteractionManager';

/**
 * The interaction manager deals with mouse, touch and pointer events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * reference to [pixi.js](http://www.pixijs.com/) impl
 *
 * @example
 * import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
 * import { Interaction } from 'three.interaction';
 * const renderer = new WebGLRenderer({ canvas: canvasElement });
 * const scene = new Scene();
 * const camera = new PerspectiveCamera(60, width / height, 0.1, 100);
 *
 * const interaction = new Interaction(renderer, scene, camera);
 * // then you can bind every interaction event with any mesh which you had `add` into `scene` before
 * const cube = new Mesh(
 *   new BoxGeometry(1, 1, 1),
 *   new MeshBasicMaterial({ color: 0xffffff }),
 * );
 * scene.add(cube);
 * cube.on('touchstart', ev => {
 *   console.log(ev);
 * });
 *
 * cube.on('mousedown', ev => {
 *   console.log(ev);
 * });
 *
 * cube.on('pointerdown', ev => {
 *   console.log(ev);
 * });
 * // and so on ...
 *
 * // you can also listen on parent-node or any display-tree node,
 * // source event will bubble up along with display-tree.
 * // you can stop the bubble-up by invoke ev.stopPropagation function.
 * scene.on('touchstart', ev => {
 *   console.log(ev);
 * })
 *
 * @class
 * @extends InteractionManager
 */
class Interaction extends InteractionManager {
  /**
   * @param {WebGLRenderer} renderer - A reference to the current renderer
   * @param {Scene} scene - A reference to the current scene
   * @param {Camera} camera - A reference to the current camera
   * @param {Object} [options] - The options for the manager.
   * @param {Boolean} [options.autoPreventDefault=false] - Should the manager automatically prevent default browser actions.
   * @param {Boolean} [options.autoAttach=false] - Should the manager automatically attach target element.
   * @param {Number} [options.interactionFrequency=10] - Frequency increases the interaction events will be checked.
   */
  constructor(renderer, scene, camera, options) {
    options = Object.assign({ autoAttach: false }, options);
    super(renderer, scene, camera, options);

    /**
     * a ticker
     *
     * @private
     * @member {Ticker}
     */
    this.ticker = new Ticker();

    /**
     * update for some over event
     *
     * @private
     */
    this.update = this.update.bind(this);

    this.on('addevents', () => {
      this.ticker.on('tick', this.update);
    });

    this.on('removeevents', () => {
      this.ticker.off('tick', this.update);
    });

    this.setTargetElement(this.renderer.domElement);
  }
}

export default Interaction;
