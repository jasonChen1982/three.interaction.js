import '../patch/EventDispatcher';
import '../patch/Object3D';

import { EventDispatcher, Raycaster } from 'three';
import InteractionData from './InteractionData';
import InteractionEvent from './InteractionEvent';
import InteractionTrackingData from './InteractionTrackingData';

const MOUSE_POINTER_ID = 'MOUSE';

// helpers for hitTest() - only used inside hitTest()
const hitTestEvent = {
  target: null,
  data: {
    global: null,
  },
};

/**
 * The interaction manager deals with mouse, touch and pointer events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * reference to [pixi.js](http://www.pixijs.com/) impl
 *
 * @private
 * @class
 * @extends EventDispatcher
 */
class InteractionManager extends EventDispatcher {
  /**
   * @param {WebGLRenderer} renderer - A reference to the current renderer
   * @param {Scene} scene - A reference to the current scene
   * @param {Camera} camera - A reference to the current camera
   * @param {Object} [options] - The options for the manager.
   * @param {Boolean} [options.autoPreventDefault=false] - Should the manager automatically prevent default browser actions.
   * @param {Boolean} [options.autoAttach=true] - Should the manager automatically attach target element.
   * @param {Number} [options.interactionFrequency=10] - Frequency increases the interaction events will be checked.
   */
  constructor(renderer, scene, camera, options) {
    super();

    options = options || {};

    this.objects = null;

    /**
     * The renderer this interaction manager works for.
     *
     * @member {WebGLRenderer}
     */
    this.renderer = renderer;

    /**
     * The renderer this interaction manager works for.
     *
     * @member {Scene}
     */
    this.scene = scene;

    /**
     * The renderer this interaction manager works for.
     *
     * @member {Camera}
     */
    this.camera = camera;

    /**
     * Should default browser actions automatically be prevented.
     * Does not apply to pointer events for backwards compatibility
     * preventDefault on pointer events stops mouse events from firing
     * Thus, for every pointer event, there will always be either a mouse of touch event alongside it.
     *
     * @member {boolean}
     * @default false
     */
    this.autoPreventDefault = options.autoPreventDefault || false;

    /**
     * Frequency in milliseconds that the mousemove, moveover & mouseout interaction events will be checked.
     *
     * @member {number}
     * @default 10
     */
    this.interactionFrequency = options.interactionFrequency || 10;

    /**
     * The mouse data
     *
     * @member {InteractionData}
     */
    this.mouse = new InteractionData();
    this.mouse.identifier = MOUSE_POINTER_ID;

    // setting the mouse to start off far off screen will mean that mouse over does
    //  not get called before we even move the mouse.
    this.mouse.global.set(-999999);

    /**
     * Actively tracked InteractionData
     *
     * @private
     * @member {Object.<number,InteractionData>}
     */
    this.activeInteractionData = {};
    this.activeInteractionData[MOUSE_POINTER_ID] = this.mouse;

    /**
     * Pool of unused InteractionData
     *
     * @private
     * @member {InteractionData[]}
     */
    this.interactionDataPool = [];

    /**
     * An event data object to handle all the event tracking/dispatching
     *
     * @member {object}
     */
    this.eventData = new InteractionEvent();

    /**
     * The DOM element to bind to.
     *
     * @private
     * @member {HTMLElement}
     */
    this.interactionDOMElement = null;

    /**
     * This property determines if mousemove and touchmove events are fired only when the cursor
     * is over the object.
     * Setting to true will make things work more in line with how the DOM verison works.
     * Setting to false can make things easier for things like dragging
     * It is currently set to false as this is how three.js used to work.
     *
     * @member {boolean}
     * @default true
     */
    this.moveWhenInside = true;

    /**
     * Have events been attached to the dom element?
     *
     * @private
     * @member {boolean}
     */
    this.eventsAdded = false;

    /**
     * Is the mouse hovering over the renderer?
     *
     * @private
     * @member {boolean}
     */
    this.mouseOverRenderer = false;

    /**
     * Does the device support touch events
     * https://www.w3.org/TR/touch-events/
     *
     * @readonly
     * @member {boolean}
     */
    this.supportsTouchEvents = 'ontouchstart' in window;

    /**
     * Does the device support pointer events
     * https://www.w3.org/Submission/pointer-events/
     *
     * @readonly
     * @member {boolean}
     */
    this.supportsPointerEvents = !!window.PointerEvent;

    // this will make it so that you don't have to call bind all the time

    /**
     * @private
     * @member {Function}
     */
    this.onClick = this.onClick.bind(this);
    this.processClick = this.processClick.bind(this);

    /**
     * @private
     * @member {Function}
     */
    this.onPointerUp = this.onPointerUp.bind(this);
    this.processPointerUp = this.processPointerUp.bind(this);

    /**
     * @private
     * @member {Function}
     */
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.processPointerCancel = this.processPointerCancel.bind(this);

    /**
     * @private
     * @member {Function}
     */
    this.onPointerDown = this.onPointerDown.bind(this);
    this.processPointerDown = this.processPointerDown.bind(this);

    /**
     * @private
     * @member {Function}
     */
    this.onPointerMove = this.onPointerMove.bind(this);
    this.processPointerMove = this.processPointerMove.bind(this);

    /**
     * @private
     * @member {Function}
     */
    this.onPointerOut = this.onPointerOut.bind(this);
    this.processPointerOverOut = this.processPointerOverOut.bind(this);

    /**
     * @private
     * @member {Function}
     */
    this.onPointerOver = this.onPointerOver.bind(this);

    /**
     * Dictionary of how different cursor modes are handled. Strings are handled as CSS cursor
     * values, objects are handled as dictionaries of CSS values for interactionDOMElement,
     * and functions are called instead of changing the CSS.
     * Default CSS cursor values are provided for 'default' and 'pointer' modes.
     * @member {Object.<string, (string|Function|Object.<string, string>)>}
     */
    this.cursorStyles = {
      default: 'inherit',
      pointer: 'pointer',
    };

    /**
     * The mode of the cursor that is being used.
     * The value of this is a key from the cursorStyles dictionary.
     *
     * @member {string}
     */
    this.currentCursorMode = null;

    /**
     * Internal cached let.
     *
     * @private
     * @member {string}
     */
    this.cursor = null;

    /**
     * ray caster, for survey intersects from 3d-scene
     *
     * @private
     * @member {Raycaster}
     */
    this.raycaster = new Raycaster();

    /**
     * snippet time
     *
     * @private
     * @member {Number}
     */
    this._deltaTime = 0;

    this.setTargetElement(this.renderer.domElement);

    /**
     * Fired when a pointer device button (usually a mouse left-button) is pressed on the display
     * object.
     *
     * @event InteractionManager#mousedown
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
     * on the display object.
     *
     * @event InteractionManager#rightdown
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button (usually a mouse left-button) is released over the display
     * object.
     *
     * @event InteractionManager#mouseup
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is released
     * over the display object.
     *
     * @event InteractionManager#rightup
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
     * the display object.
     *
     * @event InteractionManager#click
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
     * and released on the display object.
     *
     * @event InteractionManager#rightclick
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button (usually a mouse left-button) is released outside the
     * display object that initially registered a
     * [mousedown]{@link InteractionManager#event:mousedown}.
     *
     * @event InteractionManager#mouseupoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is released
     * outside the display object that initially registered a
     * [rightdown]{@link InteractionManager#event:rightdown}.
     *
     * @event InteractionManager#rightupoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device (usually a mouse) is moved while over the display object
     *
     * @event InteractionManager#mousemove
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device (usually a mouse) is moved onto the display object
     *
     * @event InteractionManager#mouseover
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device (usually a mouse) is moved off the display object
     *
     * @event InteractionManager#mouseout
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is pressed on the display object.
     *
     * @event InteractionManager#pointerdown
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is released over the display object.
     *
     * @event InteractionManager#pointerup
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when the operating system cancels a pointer event
     *
     * @event InteractionManager#pointercancel
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is pressed and released on the display object.
     *
     * @event InteractionManager#pointertap
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is released outside the display object that initially
     * registered a [pointerdown]{@link InteractionManager#event:pointerdown}.
     *
     * @event InteractionManager#pointerupoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device is moved while over the display object
     *
     * @event InteractionManager#pointermove
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device is moved onto the display object
     *
     * @event InteractionManager#pointerover
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device is moved off the display object
     *
     * @event InteractionManager#pointerout
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is placed on the display object.
     *
     * @event InteractionManager#touchstart
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is removed from the display object.
     *
     * @event InteractionManager#touchend
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when the operating system cancels a touch
     *
     * @event InteractionManager#touchcancel
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is placed and removed from the display object.
     *
     * @event InteractionManager#tap
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is removed outside of the display object that initially
     * registered a [touchstart]{@link InteractionManager#event:touchstart}.
     *
     * @event InteractionManager#touchendoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is moved along the display object.
     *
     * @event InteractionManager#touchmove
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button (usually a mouse left-button) is pressed on the display.
     * object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#mousedown
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
     * on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#rightdown
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button (usually a mouse left-button) is released over the display
     * object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#mouseup
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is released
     * over the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#rightup
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
     * the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#click
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
     * and released on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#rightclick
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button (usually a mouse left-button) is released outside the
     * display object that initially registered a
     * [mousedown]{@link Object3D#event:mousedown}.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#mouseupoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is released
     * outside the display object that initially registered a
     * [rightdown]{@link Object3D#event:rightdown}.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#rightupoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device (usually a mouse) is moved while over the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#mousemove
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device (usually a mouse) is moved onto the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#mouseover
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device (usually a mouse) is moved off the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#mouseout
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is pressed on the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#pointerdown
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is released over the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#pointerup
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when the operating system cancels a pointer event.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#pointercancel
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is pressed and released on the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#pointertap
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is released outside the display object that initially
     * registered a [pointerdown]{@link Object3D#event:pointerdown}.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#pointerupoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device is moved while over the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#pointermove
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device is moved onto the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#pointerover
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device is moved off the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#pointerout
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is placed on the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#touchstart
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is removed from the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#touchend
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when the operating system cancels a touch.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#touchcancel
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is placed and removed from the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#tap
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is removed outside of the display object that initially
     * registered a [touchstart]{@link Object3D#event:touchstart}.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#touchendoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is moved along the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * @event Object3D#touchmove
     * @param {InteractionEvent} event - Interaction event
     */
  }

  /**
   * Hit tests a point against the display tree, returning the first interactive object that is hit.
   *
   * @param {Point} globalPoint - A point to hit test with, in global space.
   * @param {Object3D} [root] - The root display object to start from. If omitted, defaults
   * to the last rendered root of the associated renderer.
   * @return {Object3D} The hit display object, if any.
   */
  hitTest(globalPoint, root) {
    // clear the target for our hit test
    hitTestEvent.target = null;
    // assign the global point
    hitTestEvent.data.global = globalPoint;
    // ensure safety of the root
    if (!root) {
      root = this.scene;
    }
    // run the hit test
    this.processInteractive(hitTestEvent, root, null, true);
    // return our found object - it'll be null if we didn't hit anything

    return hitTestEvent.target;
  }

  /**
   * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
   * other DOM elements on top of the renderers Canvas element. With this you'll be bale to deletegate
   * another DOM element to receive those events.
   *
   * @param {HTMLCanvasElement} element - the DOM element which will receive mouse and touch events.
   */
  setTargetElement(element) {
    this.removeEvents();

    this.interactionDOMElement = element;

    this.addEvents();
  }

  /**
   * Registers all the DOM events
   *
   * @private
   */
  addEvents() {
    if (!this.interactionDOMElement || this.eventsAdded) {
      return;
    }

    this.emit('addevents');

    this.interactionDOMElement.addEventListener('click', this.onClick, true);

    if (window.navigator.msPointerEnabled) {
      this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
      this.interactionDOMElement.style['-ms-touch-action'] = 'none';
    } else if (this.supportsPointerEvents) {
      this.interactionDOMElement.style['touch-action'] = 'none';
    }

    /**
     * These events are added first, so that if pointer events are normalised, they are fired
     * in the same order as non-normalised events. ie. pointer event 1st, mouse / touch 2nd
     */
    if (this.supportsPointerEvents) {
      window.document.addEventListener('pointermove', this.onPointerMove, true);
      this.interactionDOMElement.addEventListener('pointerdown', this.onPointerDown, true);
      // pointerout is fired in addition to pointerup (for touch events) and pointercancel
      // we already handle those, so for the purposes of what we do in onPointerOut, we only
      // care about the pointerleave event
      this.interactionDOMElement.addEventListener('pointerleave', this.onPointerOut, true);
      this.interactionDOMElement.addEventListener('pointerover', this.onPointerOver, true);
      window.addEventListener('pointercancel', this.onPointerCancel, true);
      window.addEventListener('pointerup', this.onPointerUp, true);
    } else {
      window.document.addEventListener('mousemove', this.onPointerMove, true);
      this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown, true);
      this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut, true);
      this.interactionDOMElement.addEventListener('mouseover', this.onPointerOver, true);
      window.addEventListener('mouseup', this.onPointerUp, true);
    }

    // always look directly for touch events so that we can provide original data
    // In a future version we should change this to being just a fallback and rely solely on
    // PointerEvents whenever available
    if (this.supportsTouchEvents) {
      this.interactionDOMElement.addEventListener('touchstart', this.onPointerDown, true);
      this.interactionDOMElement.addEventListener('touchcancel', this.onPointerCancel, true);
      this.interactionDOMElement.addEventListener('touchend', this.onPointerUp, true);
      this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove, true);
    }

    this.eventsAdded = true;
  }

  /**
   * Removes all the DOM events that were previously registered
   *
   * @private
   */
  removeEvents() {
    if (!this.interactionDOMElement) {
      return;
    }

    this.emit('removeevents');

    this.interactionDOMElement.removeEventListener('click', this.onClick, true);

    if (window.navigator.msPointerEnabled) {
      this.interactionDOMElement.style['-ms-content-zooming'] = '';
      this.interactionDOMElement.style['-ms-touch-action'] = '';
    } else if (this.supportsPointerEvents) {
      this.interactionDOMElement.style['touch-action'] = '';
    }

    if (this.supportsPointerEvents) {
      window.document.removeEventListener('pointermove', this.onPointerMove, true);
      this.interactionDOMElement.removeEventListener('pointerdown', this.onPointerDown, true);
      this.interactionDOMElement.removeEventListener('pointerleave', this.onPointerOut, true);
      this.interactionDOMElement.removeEventListener('pointerover', this.onPointerOver, true);
      window.removeEventListener('pointercancel', this.onPointerCancel, true);
      window.removeEventListener('pointerup', this.onPointerUp, true);
    } else {
      window.document.removeEventListener('mousemove', this.onPointerMove, true);
      this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown, true);
      this.interactionDOMElement.removeEventListener('mouseout', this.onPointerOut, true);
      this.interactionDOMElement.removeEventListener('mouseover', this.onPointerOver, true);
      window.removeEventListener('mouseup', this.onPointerUp, true);
    }

    if (this.supportsTouchEvents) {
      this.interactionDOMElement.removeEventListener('touchstart', this.onPointerDown, true);
      this.interactionDOMElement.removeEventListener('touchcancel', this.onPointerCancel, true);
      this.interactionDOMElement.removeEventListener('touchend', this.onPointerUp, true);
      this.interactionDOMElement.removeEventListener('touchmove', this.onPointerMove, true);
    }

    this.interactionDOMElement = null;

    this.eventsAdded = false;
  }

  /**
   * Updates the state of interactive objects.
   * Invoked by a throttled ticker.
   *
   * @param {number} deltaTime - time delta since last tick
   */
  update({ snippet }) {
    this._deltaTime += snippet;

    if (this._deltaTime < this.interactionFrequency) {
      return;
    }

    this._deltaTime = 0;

    if (!this.interactionDOMElement) {
      return;
    }

    // if the user move the mouse this check has already been done using the mouse move!
    if (this.didMove) {
      this.didMove = false;

      return;
    }

    this.cursor = null;

    // Resets the flag as set by a stopPropagation call. This flag is usually reset by a user interaction of any kind,
    // but there was a scenario of a display object moving under a static mouse cursor.
    // In this case, mouseover and mouseevents would not pass the flag test in triggerEvent function
    for (const k in this.activeInteractionData) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.activeInteractionData.hasOwnProperty(k)) {
        const interactionData = this.activeInteractionData[k];

        if (interactionData.originalEvent && interactionData.pointerType !== 'touch') {
          const interactionEvent = this.configureInteractionEventForDOMEvent(
            this.eventData,
            interactionData.originalEvent,
            interactionData
          );

          this.processInteractive(
            interactionEvent,
            this.scene,
            this.processPointerOverOut,
            true
          );
        }
      }
    }

    this.setCursorMode(this.cursor);

    // TODO
  }

  /**
   * Sets the current cursor mode, handling any callbacks or CSS style changes.
   *
   * @param {string} mode - cursor mode, a key from the cursorStyles dictionary
   */
  setCursorMode(mode) {
    mode = mode || 'default';
    // if the mode didn't actually change, bail early
    if (this.currentCursorMode === mode) {
      return;
    }
    this.currentCursorMode = mode;
    const style = this.cursorStyles[mode];

    // only do things if there is a cursor style for it
    if (style) {
      switch (typeof style) {
        case 'string':
          // string styles are handled as cursor CSS
          this.interactionDOMElement.style.cursor = style;
          break;
        case 'function':
          // functions are just called, and passed the cursor mode
          style(mode);
          break;
        case 'object':
          // if it is an object, assume that it is a dictionary of CSS styles,
          // apply it to the interactionDOMElement
          Object.assign(this.interactionDOMElement.style, style);
          break;
        default:
          break;
      }
    } else if (typeof mode === 'string' && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode)) {
      // if it mode is a string (not a Symbol) and cursorStyles doesn't have any entry
      // for the mode, then assume that the dev wants it to be CSS for the cursor.
      this.interactionDOMElement.style.cursor = mode;
    }
  }

  /**
   * Dispatches an event on the display object that was interacted with
   *
   * @param {Object3D} displayObject - the display object in question
   * @param {string} eventString - the name of the event (e.g, mousedown)
   * @param {object} eventData - the event data object
   * @private
   */
  triggerEvent(displayObject, eventString, eventData) {
    if (!eventData.stopped) {
      eventData.currentTarget = displayObject;
      eventData.type = eventString;

      displayObject.emit(eventString, eventData);

      if (displayObject[eventString]) {
        displayObject[eventString](eventData);
      }
    }
  }

  /**
   * This function is provides a neat way of crawling through the scene graph and running a
   * specified function on all interactive objects it finds. It will also take care of hit
   * testing the interactive objects and passes the hit across in the function.
   *
   * @private
   * @param {InteractionEvent} interactionEvent - event containing the point that
   *  is tested for collision
   * @param {Object3D} displayObject - the displayObject
   *  that will be hit test (recursively crawls its children)
   * @param {Function} [func] - the function that will be called on each interactive object. The
   *  interactionEvent, displayObject and hit will be passed to the function
   * @param {boolean} [hitTest] - this indicates if the objects inside should be hit test against the point
   * @param {boolean} [interactive] - Whether the displayObject is interactive
   * @return {boolean} returns true if the displayObject hit the point
   */
  processInteractive(interactionEvent, displayObject, func, hitTest, interactive) {
    if (!displayObject || !displayObject.visible) {
      return false;
    }

    // Took a little while to rework this function correctly! But now it is done and nice and optimised. ^_^
    //
    // This function will now loop through all objects and then only hit test the objects it HAS
    // to, not all of them. MUCH faster..
    // An object will be hit test if the following is true:
    //
    // 1: It is interactive.
    // 2: It belongs to a parent that is interactive AND one of the parents children have not already been hit.
    //
    // As another little optimisation once an interactive object has been hit we can carry on
    // through the scenegraph, but we know that there will be no more hits! So we can avoid extra hit tests
    // A final optimisation is that an object is not hit test directly if a child has already been hit.

    interactive = displayObject.interactive || interactive;

    let hit = false;
    let interactiveParent = interactive;

    if (displayObject.interactiveChildren && displayObject.children) {
      const children = displayObject.children;

      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];

        // time to get recursive.. if this function will return if something is hit..
        const childHit = this.processInteractive(interactionEvent, child, func, hitTest, interactiveParent);

        if (childHit) {
          // its a good idea to check if a child has lost its parent.
          // this means it has been removed whilst looping so its best
          if (!child.parent) {
            continue;
          }

          // we no longer need to hit test any more objects in this container as we we
          // now know the parent has been hit
          interactiveParent = false;

          // If the child is interactive , that means that the object hit was actually
          // interactive and not just the child of an interactive object.
          // This means we no longer need to hit test anything else. We still need to run
          // through all objects, but we don't need to perform any hit tests.

          if (childHit) {
            if (interactionEvent.target) {
              hitTest = false;
            }
            hit = true;
          }
        }
      }
    }

    // no point running this if the item is not interactive or does not have an interactive parent.
    if (interactive) {
      // if we are hit testing (as in we have no hit any objects yet)
      // We also don't need to worry about hit testing if once of the displayObjects children
      // has already been hit - but only if it was interactive, otherwise we need to keep
      // looking for an interactive child, just in case we hit one
      if (hitTest && !interactionEvent.target) {
        if (interactionEvent.intersects[0] && interactionEvent.intersects[0].object === displayObject) {
          hit = true;
        }
      }

      if (displayObject.interactive) {
        if (hit && !interactionEvent.target) {
          interactionEvent.data.target = interactionEvent.target = displayObject;
        }

        if (func) {
          func(interactionEvent, displayObject, !!hit);
        }
      }
    }

    return hit;
  }


  /**
   * Is called when the click is pressed down on the renderer element
   *
   * @private
   * @param {MouseEvent} originalEvent - The DOM event of a click being pressed down
   */
  onClick(originalEvent) {
    if (originalEvent.type !== 'click') return;

    const events = this.normalizeToPointerData(originalEvent);

    if (this.autoPreventDefault && events[0].isNormalized) {
      originalEvent.preventDefault();
    }

    const interactionData = this.getInteractionDataForPointerId(events[0]);

    const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, events[0], interactionData);

    interactionEvent.data.originalEvent = originalEvent;

    this.processInteractive(interactionEvent, this.scene, this.processClick, true);

    this.emit('click', interactionEvent);
  }

  /**
   * Processes the result of the click check and dispatches the event if need be
   *
   * @private
   * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
   * @param {Object3D} displayObject - The display object that was tested
   * @param {boolean} hit - the result of the hit test on the display object
   */
  processClick(interactionEvent, displayObject, hit) {
    if (hit) {
      this.triggerEvent(displayObject, 'click', interactionEvent);
    }
  }

  /**
   * Is called when the pointer button is pressed down on the renderer element
   *
   * @private
   * @param {PointerEvent} originalEvent - The DOM event of a pointer button being pressed down
   */
  onPointerDown(originalEvent) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') return;

    const events = this.normalizeToPointerData(originalEvent);

    /**
     * No need to prevent default on natural pointer events, as there are no side effects
     * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
     * so still need to be prevented.
     */

    // Guaranteed that there will be at least one event in events, and all events must have the same pointer type

    if (this.autoPreventDefault && events[0].isNormalized) {
      originalEvent.preventDefault();
    }

    const eventLen = events.length;

    for (let i = 0; i < eventLen; i++) {
      const event = events[i];

      const interactionData = this.getInteractionDataForPointerId(event);

      const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

      interactionEvent.data.originalEvent = originalEvent;

      this.processInteractive(interactionEvent, this.scene, this.processPointerDown, true);

      this.emit('pointerdown', interactionEvent);
      if (event.pointerType === 'touch') {
        this.emit('touchstart', interactionEvent);
      } else if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        const isRightButton = event.button === 2;

        this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
      }
    }
  }

  /**
   * Processes the result of the pointer down check and dispatches the event if need be
   *
   * @private
   * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
   * @param {Object3D} displayObject - The display object that was tested
   * @param {boolean} hit - the result of the hit test on the display object
   */
  processPointerDown(interactionEvent, displayObject, hit) {
    const data = interactionEvent.data;
    const id = interactionEvent.data.identifier;

    if (hit) {
      if (!displayObject.trackedPointers[id]) {
        displayObject.trackedPointers[id] = new InteractionTrackingData(id);
      }
      this.triggerEvent(displayObject, 'pointerdown', interactionEvent);

      if (data.pointerType === 'touch') {
        displayObject.started = true;
        this.triggerEvent(displayObject, 'touchstart', interactionEvent);
      } else if (data.pointerType === 'mouse' || data.pointerType === 'pen') {
        const isRightButton = data.button === 2;

        if (isRightButton) {
          displayObject.trackedPointers[id].rightDown = true;
        } else {
          displayObject.trackedPointers[id].leftDown = true;
        }

        this.triggerEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', interactionEvent);
      }
    }
  }

  /**
   * Is called when the pointer button is released on the renderer element
   *
   * @private
   * @param {PointerEvent} originalEvent - The DOM event of a pointer button being released
   * @param {boolean} cancelled - true if the pointer is cancelled
   * @param {Function} func - Function passed to {@link processInteractive}
   */
  onPointerComplete(originalEvent, cancelled, func) {
    const events = this.normalizeToPointerData(originalEvent);

    const eventLen = events.length;

    // if the event wasn't targeting our canvas, then consider it to be pointerupoutside
    // in all cases (unless it was a pointercancel)
    const eventAppend = originalEvent.target !== this.interactionDOMElement ? 'outside' : '';

    for (let i = 0; i < eventLen; i++) {
      const event = events[i];

      const interactionData = this.getInteractionDataForPointerId(event);

      const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

      interactionEvent.data.originalEvent = originalEvent;

      // perform hit testing for events targeting our canvas or cancel events
      this.processInteractive(interactionEvent, this.scene, func, cancelled || !eventAppend);

      this.emit(cancelled ? 'pointercancel' : `pointerup${eventAppend}`, interactionEvent);

      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        const isRightButton = event.button === 2;

        this.emit(isRightButton ? `rightup${eventAppend}` : `mouseup${eventAppend}`, interactionEvent);
      } else if (event.pointerType === 'touch') {
        this.emit(cancelled ? 'touchcancel' : `touchend${eventAppend}`, interactionEvent);
        this.releaseInteractionDataForPointerId(event.pointerId, interactionData);
      }
    }
  }

  /**
   * Is called when the pointer button is cancelled
   *
   * @private
   * @param {PointerEvent} event - The DOM event of a pointer button being released
   */
  onPointerCancel(event) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && event.pointerType === 'touch') return;

    this.onPointerComplete(event, true, this.processPointerCancel);
  }

  /**
   * Processes the result of the pointer cancel check and dispatches the event if need be
   *
   * @private
   * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
   * @param {Object3D} displayObject - The display object that was tested
   */
  processPointerCancel(interactionEvent, displayObject) {
    const data = interactionEvent.data;

    const id = interactionEvent.data.identifier;

    if (displayObject.trackedPointers[id] !== undefined) {
      delete displayObject.trackedPointers[id];
      this.triggerEvent(displayObject, 'pointercancel', interactionEvent);

      if (data.pointerType === 'touch') {
        this.triggerEvent(displayObject, 'touchcancel', interactionEvent);
      }
    }
  }

  /**
   * Is called when the pointer button is released on the renderer element
   *
   * @private
   * @param {PointerEvent} event - The DOM event of a pointer button being released
   */
  onPointerUp(event) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && event.pointerType === 'touch') return;

    this.onPointerComplete(event, false, this.processPointerUp);
  }

  /**
   * Processes the result of the pointer up check and dispatches the event if need be
   *
   * @private
   * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
   * @param {Object3D} displayObject - The display object that was tested
   * @param {boolean} hit - the result of the hit test on the display object
   */
  processPointerUp(interactionEvent, displayObject, hit) {
    const data = interactionEvent.data;

    const id = interactionEvent.data.identifier;

    const trackingData = displayObject.trackedPointers[id];

    const isTouch = data.pointerType === 'touch';

    const isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');

    // Mouse only
    if (isMouse) {
      const isRightButton = data.button === 2;

      const flags = InteractionTrackingData.FLAGS;

      const test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;

      const isDown = trackingData !== undefined && (trackingData.flags & test);

      if (hit) {
        this.triggerEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent);

        if (isDown) {
          this.triggerEvent(displayObject, isRightButton ? 'rightclick' : 'leftclick', interactionEvent);
        }
      } else if (isDown) {
        this.triggerEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent);
      }
      // update the down state of the tracking data
      if (trackingData) {
        if (isRightButton) {
          trackingData.rightDown = false;
        } else {
          trackingData.leftDown = false;
        }
      }
    }

    // Pointers and Touches, and Mouse
    if (isTouch && displayObject.started) {
      displayObject.started = false;
      this.triggerEvent(displayObject, 'touchend', interactionEvent);
    }
    if (hit) {
      this.triggerEvent(displayObject, 'pointerup', interactionEvent);

      if (trackingData) {
        this.triggerEvent(displayObject, 'pointertap', interactionEvent);
        if (isTouch) {
          this.triggerEvent(displayObject, 'tap', interactionEvent);
          // touches are no longer over (if they ever were) when we get the touchend
          // so we should ensure that we don't keep pretending that they are
          trackingData.over = false;
        }
      }
    } else if (trackingData) {
      this.triggerEvent(displayObject, 'pointerupoutside', interactionEvent);
      if (isTouch) this.triggerEvent(displayObject, 'touchendoutside', interactionEvent);
    }
    // Only remove the tracking data if there is no over/down state still associated with it
    if (trackingData && trackingData.none) {
      delete displayObject.trackedPointers[id];
    }
  }

  /**
   * Is called when the pointer moves across the renderer element
   *
   * @private
   * @param {PointerEvent} originalEvent - The DOM event of a pointer moving
   */
  onPointerMove(originalEvent) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') return;

    const events = this.normalizeToPointerData(originalEvent);

    if (events[0].pointerType === 'mouse') {
      this.didMove = true;

      this.cursor = null;
    }

    const eventLen = events.length;

    for (let i = 0; i < eventLen; i++) {
      const event = events[i];

      const interactionData = this.getInteractionDataForPointerId(event);

      const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

      interactionEvent.data.originalEvent = originalEvent;

      const interactive = event.pointerType === 'touch' ? this.moveWhenInside : true;

      this.processInteractive(
        interactionEvent,
        this.scene,
        this.processPointerMove,
        interactive
      );
      this.emit('pointermove', interactionEvent);
      if (event.pointerType === 'touch') this.emit('touchmove', interactionEvent);
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') this.emit('mousemove', interactionEvent);
    }

    if (events[0].pointerType === 'mouse') {
      this.setCursorMode(this.cursor);

      // TODO BUG for parents interactive object (border order issue)
    }
  }

  /**
   * Processes the result of the pointer move check and dispatches the event if need be
   *
   * @private
   * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
   * @param {Object3D} displayObject - The display object that was tested
   * @param {boolean} hit - the result of the hit test on the display object
   */
  processPointerMove(interactionEvent, displayObject, hit) {
    const data = interactionEvent.data;

    const isTouch = data.pointerType === 'touch';

    const isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');

    if (isMouse) {
      this.processPointerOverOut(interactionEvent, displayObject, hit);
    }

    if (isTouch && displayObject.started) this.triggerEvent(displayObject, 'touchmove', interactionEvent);
    if (!this.moveWhenInside || hit) {
      this.triggerEvent(displayObject, 'pointermove', interactionEvent);
      if (isMouse) this.triggerEvent(displayObject, 'mousemove', interactionEvent);
    }
  }

  /**
   * Is called when the pointer is moved out of the renderer element
   *
   * @private
   * @param {PointerEvent} originalEvent - The DOM event of a pointer being moved out
   */
  onPointerOut(originalEvent) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') return;

    const events = this.normalizeToPointerData(originalEvent);

    // Only mouse and pointer can call onPointerOut, so events will always be length 1
    const event = events[0];

    if (event.pointerType === 'mouse') {
      this.mouseOverRenderer = false;
      this.setCursorMode(null);
    }

    const interactionData = this.getInteractionDataForPointerId(event);

    const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

    interactionEvent.data.originalEvent = event;

    this.processInteractive(interactionEvent, this.scene, this.processPointerOverOut, false);

    this.emit('pointerout', interactionEvent);
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      this.emit('mouseout', interactionEvent);
    } else {
      // we can get touchleave events after touchend, so we want to make sure we don't
      // introduce memory leaks
      this.releaseInteractionDataForPointerId(interactionData.identifier);
    }
  }

  /**
   * Processes the result of the pointer over/out check and dispatches the event if need be
   *
   * @private
   * @param {InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
   * @param {Object3D} displayObject - The display object that was tested
   * @param {boolean} hit - the result of the hit test on the display object
   */
  processPointerOverOut(interactionEvent, displayObject, hit) {
    const data = interactionEvent.data;

    const id = interactionEvent.data.identifier;

    const isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');

    let trackingData = displayObject.trackedPointers[id];

    // if we just moused over the display object, then we need to track that state
    if (hit && !trackingData) {
      trackingData = displayObject.trackedPointers[id] = new InteractionTrackingData(id);
    }

    if (trackingData === undefined) return;

    if (hit && this.mouseOverRenderer) {
      if (!trackingData.over) {
        trackingData.over = true;
        this.triggerEvent(displayObject, 'pointerover', interactionEvent);
        if (isMouse) {
          this.triggerEvent(displayObject, 'mouseover', interactionEvent);
        }
      }

      // only change the cursor if it has not already been changed (by something deeper in the
      // display tree)
      if (isMouse && this.cursor === null) {
        this.cursor = displayObject.cursor;
      }
    } else if (trackingData.over) {
      trackingData.over = false;
      this.triggerEvent(displayObject, 'pointerout', this.eventData);
      if (isMouse) {
        this.triggerEvent(displayObject, 'mouseout', interactionEvent);
      }
      // if there is no mouse down information for the pointer, then it is safe to delete
      if (trackingData.none) {
        delete displayObject.trackedPointers[id];
      }
    }
  }

  /**
   * Is called when the pointer is moved into the renderer element
   *
   * @private
   * @param {PointerEvent} originalEvent - The DOM event of a pointer button being moved into the renderer view
   */
  onPointerOver(originalEvent) {
    const events = this.normalizeToPointerData(originalEvent);

    // Only mouse and pointer can call onPointerOver, so events will always be length 1
    const event = events[0];

    const interactionData = this.getInteractionDataForPointerId(event);

    const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

    interactionEvent.data.originalEvent = event;

    if (event.pointerType === 'mouse') {
      this.mouseOverRenderer = true;
    }

    this.emit('pointerover', interactionEvent);
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      this.emit('mouseover', interactionEvent);
    }
  }

  /**
   * Get InteractionData for a given pointerId. Store that data as well
   *
   * @private
   * @param {PointerEvent} event - Normalized pointer event, output from normalizeToPointerData
   * @return {InteractionData} - Interaction data for the given pointer identifier
   */
  getInteractionDataForPointerId(event) {
    const pointerId = event.pointerId;

    let interactionData;

    if (pointerId === MOUSE_POINTER_ID || event.pointerType === 'mouse') {
      interactionData = this.mouse;
    } else if (this.activeInteractionData[pointerId]) {
      interactionData = this.activeInteractionData[pointerId];
    } else {
      interactionData = this.interactionDataPool.pop() || new InteractionData();
      interactionData.identifier = pointerId;
      this.activeInteractionData[pointerId] = interactionData;
    }
    // copy properties from the event, so that we can make sure that touch/pointer specific
    // data is available
    interactionData._copyEvent(event);

    return interactionData;
  }

  /**
   * Return unused InteractionData to the pool, for a given pointerId
   *
   * @private
   * @param {number} pointerId - Identifier from a pointer event
   */
  releaseInteractionDataForPointerId(pointerId) {
    const interactionData = this.activeInteractionData[pointerId];

    if (interactionData) {
      delete this.activeInteractionData[pointerId];
      interactionData._reset();
      this.interactionDataPool.push(interactionData);
    }
  }

  /**
   * Maps x and y coords from a DOM object and maps them correctly to the three.js view. The
   * resulting value is stored in the point. This takes into account the fact that the DOM
   * element could be scaled and positioned anywhere on the screen.
   *
   * @param  {Vector2} point - the point that the result will be stored in
   * @param  {number} x - the x coord of the position to map
   * @param  {number} y - the y coord of the position to map
   */
  mapPositionToPoint(point, x, y) {
    let rect;

    // IE 11 fix
    if (!this.interactionDOMElement.parentElement) {
      rect = {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };
    } else {
      rect = this.interactionDOMElement.getBoundingClientRect();
    }

    point.x = ((x - rect.left) / rect.width) * 2 - 1;
    point.y = -((y - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Configure an InteractionEvent to wrap a DOM PointerEvent and InteractionData
   *
   * @private
   * @param {InteractionEvent} interactionEvent - The event to be configured
   * @param {PointerEvent} pointerEvent - The DOM event that will be paired with the InteractionEvent
   * @param {InteractionData} interactionData - The InteractionData that will be paired
   *        with the InteractionEvent
   * @return {InteractionEvent} the interaction event that was passed in
   */
  configureInteractionEventForDOMEvent(interactionEvent, pointerEvent, interactionData) {
    interactionEvent.data = interactionData;

    this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);

    this.raycaster.setFromCamera(interactionData.global, this.camera);

    // Not really sure why this is happening, but it's how a previous version handled things TODO: there should be remove
    if (pointerEvent.pointerType === 'touch') {
      pointerEvent.globalX = interactionData.global.x;
      pointerEvent.globalY = interactionData.global.y;
    }

    interactionData.originalEvent = pointerEvent;
    interactionEvent._reset();
    if (this.objectsToRaycast) {
      interactionEvent.intersects = this.raycaster.intersectObjects(this.objectsToRaycast, true);
    } else {
      interactionEvent.intersects = this.raycaster.intersectObjects(this.scene.children, true);
    }
    return interactionEvent;
  }

  /**
   * set objects to raycast
   *
   * @param {Object3D} objects
   * @memberof InteractionManager
   */
  setObjectsToRaycast(objects) {
    this.objectsToRaycast = objects;
  }

  /**
   * Ensures that the original event object contains all data that a regular pointer event would have
   *
   * @private
   * @param {TouchEvent|MouseEvent|PointerEvent} event - The original event data from a touch or mouse event
   * @return {PointerEvent[]} An array containing a single normalized pointer event, in the case of a pointer
   *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
   */
  normalizeToPointerData(event) {
    const normalizedEvents = [];

    if (this.supportsTouchEvents && event instanceof TouchEvent) {
      for (let i = 0, li = event.changedTouches.length; i < li; i++) {
        const touch = event.changedTouches[i];

        if (typeof touch.button === 'undefined') touch.button = event.touches.length ? 1 : 0;
        if (typeof touch.buttons === 'undefined') touch.buttons = event.touches.length ? 1 : 0;
        if (typeof touch.isPrimary === 'undefined') {
          touch.isPrimary = event.touches.length === 1 && event.type === 'touchstart';
        }
        if (typeof touch.width === 'undefined') touch.width = touch.radiusX || 1;
        if (typeof touch.height === 'undefined') touch.height = touch.radiusY || 1;
        if (typeof touch.tiltX === 'undefined') touch.tiltX = 0;
        if (typeof touch.tiltY === 'undefined') touch.tiltY = 0;
        if (typeof touch.pointerType === 'undefined') touch.pointerType = 'touch';
        if (typeof touch.pointerId === 'undefined') touch.pointerId = touch.identifier || 0;
        if (typeof touch.pressure === 'undefined') touch.pressure = touch.force || 0.5;
        touch.twist = 0;
        touch.tangentialPressure = 0;
        // TODO: Remove these, as layerX/Y is not a standard, is deprecated, has uneven
        // support, and the fill ins are not quite the same
        // offsetX/Y might be okay, but is not the same as clientX/Y when the canvas's top
        // left is not 0,0 on the page
        if (typeof touch.layerX === 'undefined') touch.layerX = touch.offsetX = touch.clientX;
        if (typeof touch.layerY === 'undefined') touch.layerY = touch.offsetY = touch.clientY;

        // mark the touch as normalized, just so that we know we did it
        touch.isNormalized = true;

        normalizedEvents.push(touch);
      }
    } else if (event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof window.PointerEvent))) {
      if (typeof event.isPrimary === 'undefined') event.isPrimary = true;
      if (typeof event.width === 'undefined') event.width = 1;
      if (typeof event.height === 'undefined') event.height = 1;
      if (typeof event.tiltX === 'undefined') event.tiltX = 0;
      if (typeof event.tiltY === 'undefined') event.tiltY = 0;
      if (typeof event.pointerType === 'undefined') event.pointerType = 'mouse';
      if (typeof event.pointerId === 'undefined') event.pointerId = MOUSE_POINTER_ID;
      if (typeof event.pressure === 'undefined') event.pressure = 0.5;
      event.twist = 0;
      event.tangentialPressure = 0;

      // mark the mouse event as normalized, just so that we know we did it
      event.isNormalized = true;

      normalizedEvents.push(event);
    } else {
      normalizedEvents.push(event);
    }

    return normalizedEvents;
  }

  /**
   * Destroys the interaction manager
   *
   */
  destroy() {
    this.removeEvents();

    this.removeAllListeners();

    this.renderer = null;

    this.mouse = null;

    this.eventData = null;

    this.interactionDOMElement = null;

    this.onPointerDown = null;
    this.processPointerDown = null;

    this.onPointerUp = null;
    this.processPointerUp = null;

    this.onPointerCancel = null;
    this.processPointerCancel = null;

    this.onPointerMove = null;
    this.processPointerMove = null;

    this.onPointerOut = null;
    this.processPointerOverOut = null;

    this.onPointerOver = null;

    this._tempPoint = null;
  }
}

export default InteractionManager;
