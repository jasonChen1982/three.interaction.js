import { EventDispatcher, Object3D, Raycaster, Vector2 } from 'three';

/**
 * get variable type
 * @param {*} val a variable which you want to get the type
 * @return {String} variable-type
 */
function _rt(val) {
  return Object.prototype.toString.call(val);
}

/**
 * Utils tool box
 *
 * @namespace Utils
 */
var Utils = {
  /**
   * determine whether it is a `Function`
   *
   * @static
   * @method
   * @memberof Utils
   * @param {*} variable a variable which you want to determine
   * @return {Boolean} type result
   */
  isFunction: function () {
    var ks = _rt(function () {});
    return function (variable) {
      return _rt(variable) === ks;
    };
  }(),

  /**
   * determine whether it is a `undefined`
   *
   * @static
   * @method
   * @memberof Utils
   * @param {*} variable a variable which you want to determine
   * @return {Boolean} type result
   */
  isUndefined: function isUndefined(variable) {
    return typeof variable === 'undefined';
  }
};

/**
 * proxy `addEventListener` function
 *
 * @param {String} type event type, evnet name
 * @param {Function} fn callback
 * @return {this} this
 */
EventDispatcher.prototype.on = function (type, fn) {
  if (!Utils.isFunction(fn)) return;
  if (this instanceof Object3D) this.interactive = true;
  this.addEventListener(type, fn);
  return this;
};

/**
 * proxy `removeEventListener` function
 *
 * @param {String} type event type, evnet name
 * @param {Function} fn callback, which you had bind before
 * @return {this} this
 */
EventDispatcher.prototype.off = function (type, fn) {
  this.removeEventListener(type, fn);
  return this;
};

/**
 * binding a once event, just emit once time
 *
 * @param {String} type event type, evnet name
 * @param {Function} fn callback
 * @return {this} this
 */
EventDispatcher.prototype.once = function (type, fn) {
  var _this = this;

  if (!Utils.isFunction(fn)) return;
  var cb = function cb(ev) {
    fn(ev);
    _this.off(type, cb);
  };
  this.on(type, cb);
  return this;
};

/**
 * emit a event
 *
 * @param {String} type event type, evnet name
 * @return {this} this
 */
EventDispatcher.prototype.emit = function (type) {
  if (this._listeners === undefined || Utils.isUndefined(this._listeners[type])) return;
  var cbs = this._listeners[type] || [];
  var cache = cbs.slice(0);

  for (var _len = arguments.length, argument = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    argument[_key - 1] = arguments[_key];
  }

  for (var i = 0; i < cache.length; i++) {
    cache[i].apply(this, argument);
  }
  return this;
};

/**
 * whether displayObject is interactively
 */
Object3D.prototype.interactive = false;

/**
 * whether displayObject's children is interactively
 */
Object3D.prototype.interactiveChildren = true;

/**
 * whether displayObject had touchstart
 * @private
 */
Object3D.prototype.started = false;

/**
 * tracked event cache, like: touchend、mouseout、pointerout which decided by primary-event
 */
Object.defineProperty(Object3D.prototype, 'trackedPointers', {
  get: function get() {
    if (!this._trackedPointers) this._trackedPointers = {};
    return this._trackedPointers;
  }
});

/**
 * dispatch a raycast
 *
 * @param {Raycaster} raycaster Raycaster object, get from THREE.Raycaster
 * @return {Object|Boolean} had pass hit-test
 */
Object3D.prototype.raycastTest = function (raycaster) {
  var result = [];
  this.raycast(raycaster, result);

  if (result.length > 0) {
    return result[0];
  }

  return false;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/**
 * Holds all information related to an Interaction event
 *
 * @class
 */

var InteractionData = function () {
  /**
   * InteractionData constructor
   */
  function InteractionData() {
    classCallCheck(this, InteractionData);

    /**
     * This point stores the global coords of where the touch/mouse event happened
     *
     * @member {Vector2}
     */
    this.global = new Vector2();

    /**
     * The target DisplayObject that was interacted with
     *
     * @member {Object3D}
     */
    this.target = null;

    /**
     * When passed to an event handler, this will be the original DOM Event that was captured
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
     * @see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent
     * @member {MouseEvent|TouchEvent|PointerEvent}
     */
    this.originalEvent = null;

    /**
     * Unique identifier for this interaction
     *
     * @member {number}
     */
    this.identifier = null;

    /**
     * Indicates whether or not the pointer device that created the event is the primary pointer.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary
     * @type {Boolean}
     */
    this.isPrimary = false;

    /**
     * Indicates which button was pressed on the mouse or pointer device to trigger the event.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
     * @type {number}
     */
    this.button = 0;

    /**
     * Indicates which buttons are pressed on the mouse or pointer device when the event is triggered.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
     * @type {number}
     */
    this.buttons = 0;

    /**
     * The width of the pointer's contact along the x-axis, measured in CSS pixels.
     * radiusX of TouchEvents will be represented by this value.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width
     * @type {number}
     */
    this.width = 0;

    /**
     * The height of the pointer's contact along the y-axis, measured in CSS pixels.
     * radiusY of TouchEvents will be represented by this value.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height
     * @type {number}
     */
    this.height = 0;

    /**
     * The angle, in degrees, between the pointer device and the screen.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX
     * @type {number}
     */
    this.tiltX = 0;

    /**
     * The angle, in degrees, between the pointer device and the screen.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY
     * @type {number}
     */
    this.tiltY = 0;

    /**
     * The type of pointer that triggered the event.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType
     * @type {string}
     */
    this.pointerType = null;

    /**
     * Pressure applied by the pointing device during the event. A Touch's force property
     * will be represented by this value.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure
     * @type {number}
     */
    this.pressure = 0;

    /**
     * From TouchEvents (not PointerEvents triggered by touches), the rotationAngle of the Touch.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch/rotationAngle
     * @type {number}
     */
    this.rotationAngle = 0;

    /**
     * Twist of a stylus pointer.
     * @see https://w3c.github.io/pointerevents/#pointerevent-interface
     * @type {number}
     */
    this.twist = 0;

    /**
     * Barrel pressure on a stylus pointer.
     * @see https://w3c.github.io/pointerevents/#pointerevent-interface
     * @type {number}
     */
    this.tangentialPressure = 0;
  }

  /**
   * The unique identifier of the pointer. It will be the same as `identifier`.
   * @readonly
   * @member {number}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId
   */


  createClass(InteractionData, [{
    key: '_copyEvent',


    /**
     * Copies properties from normalized event data.
     *
     * @param {Touch|MouseEvent|PointerEvent} event The normalized event data
     * @private
     */
    value: function _copyEvent(event) {
      // isPrimary should only change on touchstart/pointerdown, so we don't want to overwrite
      // it with "false" on later events when our shim for it on touch events might not be
      // accurate
      if (event.isPrimary) {
        this.isPrimary = true;
      }
      this.button = event.button;
      this.buttons = event.buttons;
      this.width = event.width;
      this.height = event.height;
      this.tiltX = event.tiltX;
      this.tiltY = event.tiltY;
      this.pointerType = event.pointerType;
      this.pressure = event.pressure;
      this.rotationAngle = event.rotationAngle;
      this.twist = event.twist || 0;
      this.tangentialPressure = event.tangentialPressure || 0;
    }

    /**
     * Resets the data for pooling.
     *
     * @private
     */

  }, {
    key: '_reset',
    value: function _reset() {
      // isPrimary is the only property that we really need to reset - everything else is
      // guaranteed to be overwritten
      this.isPrimary = false;
    }
  }, {
    key: 'pointerId',
    get: function get$$1() {
      return this.identifier;
    }
  }]);
  return InteractionData;
}();

/**
 * Event class that mimics native DOM events.
 *
 * @class
 */
var InteractionEvent = function () {
  /**
   * InteractionEvent constructor
   */
  function InteractionEvent() {
    classCallCheck(this, InteractionEvent);

    /**
     * Whether this event will continue propagating in the tree
     *
     * @member {boolean}
     */
    this.stopped = false;

    /**
     * The object which caused this event to be dispatched.
     *
     * @member {Object3D}
     */
    this.target = null;

    /**
     * The object whose event listener’s callback is currently being invoked.
     *
     * @member {Object3D}
     */
    this.currentTarget = null;

    /**
     * Type of the event
     *
     * @member {string}
     */
    this.type = null;

    /**
     * InteractionData related to this event
     *
     * @member {InteractionData}
     */
    this.data = null;

    /**
     * ray caster detial from 3d-mesh
     *
     * @member {Intersects}
     */
    this.intersects = [];
  }

  /**
   * Prevents event from reaching any objects other than the current object.
   *
   */


  createClass(InteractionEvent, [{
    key: "stopPropagation",
    value: function stopPropagation() {
      this.stopped = true;
    }

    /**
     * Resets the event.
     *
     * @private
     */

  }, {
    key: "_reset",
    value: function _reset() {
      this.stopped = false;
      this.currentTarget = null;
      this.target = null;
      this.intersects = [];
    }
  }]);
  return InteractionEvent;
}();

/**
 * DisplayObjects with the `trackedPointers` property use this class to track interactions
 *
 * @class
 * @private
 */
var InteractionTrackingData = function () {
  /**
   * @param {number} pointerId - Unique pointer id of the event
   */
  function InteractionTrackingData(pointerId) {
    classCallCheck(this, InteractionTrackingData);

    this._pointerId = pointerId;
    this._flags = InteractionTrackingData.FLAGS.NONE;
  }

  /**
   *
   * @private
   * @param {number} flag - The interaction flag to set
   * @param {boolean} yn - Should the flag be set or unset
   */


  createClass(InteractionTrackingData, [{
    key: "_doSet",
    value: function _doSet(flag, yn) {
      if (yn) {
        this._flags = this._flags | flag;
      } else {
        this._flags = this._flags & ~flag;
      }
    }

    /**
     * Unique pointer id of the event
     *
     * @readonly
     * @member {number}
     */

  }, {
    key: "pointerId",
    get: function get$$1() {
      return this._pointerId;
    }

    /**
     * State of the tracking data, expressed as bit flags
     *
     * @member {number}
     */

  }, {
    key: "flags",
    get: function get$$1() {
      return this._flags;
    }

    /**
     * Set the flags for the tracking data
     *
     * @param {number} flags - Flags to set
     */
    ,
    set: function set$$1(flags) {
      this._flags = flags;
    }

    /**
     * Is the tracked event inactive (not over or down)?
     *
     * @member {number}
     */

  }, {
    key: "none",
    get: function get$$1() {
      return this._flags === this.constructor.FLAGS.NONE;
    }

    /**
     * Is the tracked event over the DisplayObject?
     *
     * @member {boolean}
     */

  }, {
    key: "over",
    get: function get$$1() {
      return (this._flags & this.constructor.FLAGS.OVER) !== 0;
    }

    /**
     * Set the over flag
     *
     * @param {boolean} yn - Is the event over?
     */
    ,
    set: function set$$1(yn) {
      this._doSet(this.constructor.FLAGS.OVER, yn);
    }

    /**
     * Did the right mouse button come down in the DisplayObject?
     *
     * @member {boolean}
     */

  }, {
    key: "rightDown",
    get: function get$$1() {
      return (this._flags & this.constructor.FLAGS.RIGHT_DOWN) !== 0;
    }

    /**
     * Set the right down flag
     *
     * @param {boolean} yn - Is the right mouse button down?
     */
    ,
    set: function set$$1(yn) {
      this._doSet(this.constructor.FLAGS.RIGHT_DOWN, yn);
    }

    /**
     * Did the left mouse button come down in the DisplayObject?
     *
     * @member {boolean}
     */

  }, {
    key: "leftDown",
    get: function get$$1() {
      return (this._flags & this.constructor.FLAGS.LEFT_DOWN) !== 0;
    }

    /**
     * Set the left down flag
     *
     * @param {boolean} yn - Is the left mouse button down?
     */
    ,
    set: function set$$1(yn) {
      this._doSet(this.constructor.FLAGS.LEFT_DOWN, yn);
    }
  }]);
  return InteractionTrackingData;
}();

InteractionTrackingData.FLAGS = Object.freeze({
  NONE: 0,
  OVER: 1 << 0,
  LEFT_DOWN: 1 << 1,
  RIGHT_DOWN: 1 << 2
});

var MOUSE_POINTER_ID = 'MOUSE';

// helpers for hitTest() - only used inside hitTest()
var hitTestEvent = {
  target: null,
  data: {
    global: null
  }
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

var InteractionManager = function (_EventDispatcher) {
  inherits(InteractionManager, _EventDispatcher);

  /**
   * @param {WebGLRenderer} renderer - A reference to the current renderer
   * @param {Scene} scene - A reference to the current scene
   * @param {Camera} camera - A reference to the current camera
   * @param {Object} [options] - The options for the manager.
   * @param {Boolean} [options.autoPreventDefault=false] - Should the manager automatically prevent default browser actions.
   * @param {Boolean} [options.autoAttach=true] - Should the manager automatically attach target element.
   * @param {Number} [options.interactionFrequency=10] - Frequency increases the interaction events will be checked.
   */
  function InteractionManager(renderer, scene, camera, options) {
    classCallCheck(this, InteractionManager);

    var _this = possibleConstructorReturn(this, (InteractionManager.__proto__ || Object.getPrototypeOf(InteractionManager)).call(this));

    options = options || {};

    /**
     * The renderer this interaction manager works for.
     *
     * @member {WebGLRenderer}
     */
    _this.renderer = renderer;

    /**
     * The renderer this interaction manager works for.
     *
     * @member {Scene}
     */
    _this.scene = scene;

    /**
     * The renderer this interaction manager works for.
     *
     * @member {Camera}
     */
    _this.camera = camera;

    /**
     * Should default browser actions automatically be prevented.
     * Does not apply to pointer events for backwards compatibility
     * preventDefault on pointer events stops mouse events from firing
     * Thus, for every pointer event, there will always be either a mouse of touch event alongside it.
     *
     * @member {boolean}
     * @default false
     */
    _this.autoPreventDefault = options.autoPreventDefault || false;

    /**
     * Frequency in milliseconds that the mousemove, moveover & mouseout interaction events will be checked.
     *
     * @member {number}
     * @default 10
     */
    _this.interactionFrequency = options.interactionFrequency || 10;

    /**
     * The mouse data
     *
     * @member {InteractionData}
     */
    _this.mouse = new InteractionData();
    _this.mouse.identifier = MOUSE_POINTER_ID;

    // setting the mouse to start off far off screen will mean that mouse over does
    //  not get called before we even move the mouse.
    _this.mouse.global.set(-999999);

    /**
     * Actively tracked InteractionData
     *
     * @private
     * @member {Object.<number,InteractionData>}
     */
    _this.activeInteractionData = {};
    _this.activeInteractionData[MOUSE_POINTER_ID] = _this.mouse;

    /**
     * Pool of unused InteractionData
     *
     * @private
     * @member {InteractionData[]}
     */
    _this.interactionDataPool = [];

    /**
     * An event data object to handle all the event tracking/dispatching
     *
     * @member {object}
     */
    _this.eventData = new InteractionEvent();

    /**
     * The DOM element to bind to.
     *
     * @private
     * @member {HTMLElement}
     */
    _this.interactionDOMElement = null;

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
    _this.moveWhenInside = true;

    /**
     * Have events been attached to the dom element?
     *
     * @private
     * @member {boolean}
     */
    _this.eventsAdded = false;

    /**
     * Is the mouse hovering over the renderer?
     *
     * @private
     * @member {boolean}
     */
    _this.mouseOverRenderer = false;

    /**
     * Does the device support touch events
     * https://www.w3.org/TR/touch-events/
     *
     * @readonly
     * @member {boolean}
     */
    _this.supportsTouchEvents = 'ontouchstart' in window;

    /**
     * Does the device support pointer events
     * https://www.w3.org/Submission/pointer-events/
     *
     * @readonly
     * @member {boolean}
     */
    _this.supportsPointerEvents = !!window.PointerEvent;

    // this will make it so that you don't have to call bind all the time

    /**
     * @private
     * @member {Function}
     */
    _this.onClick = _this.onClick.bind(_this);
    _this.processClick = _this.processClick.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerUp = _this.onPointerUp.bind(_this);
    _this.processPointerUp = _this.processPointerUp.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerCancel = _this.onPointerCancel.bind(_this);
    _this.processPointerCancel = _this.processPointerCancel.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerDown = _this.onPointerDown.bind(_this);
    _this.processPointerDown = _this.processPointerDown.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerMove = _this.onPointerMove.bind(_this);
    _this.processPointerMove = _this.processPointerMove.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerOut = _this.onPointerOut.bind(_this);
    _this.processPointerOverOut = _this.processPointerOverOut.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerOver = _this.onPointerOver.bind(_this);

    /**
     * Dictionary of how different cursor modes are handled. Strings are handled as CSS cursor
     * values, objects are handled as dictionaries of CSS values for interactionDOMElement,
     * and functions are called instead of changing the CSS.
     * Default CSS cursor values are provided for 'default' and 'pointer' modes.
     * @member {Object.<string, (string|Function|Object.<string, string>)>}
     */
    _this.cursorStyles = {
      default: 'inherit',
      pointer: 'pointer'
    };

    /**
     * The mode of the cursor that is being used.
     * The value of this is a key from the cursorStyles dictionary.
     *
     * @member {string}
     */
    _this.currentCursorMode = null;

    /**
     * Internal cached let.
     *
     * @private
     * @member {string}
     */
    _this.cursor = null;

    /**
     * ray caster, for survey intersects from 3d-scene
     *
     * @private
     * @member {Raycaster}
     */
    _this.raycaster = new Raycaster();

    /**
     * snippet time
     *
     * @private
     * @member {Number}
     */
    _this._deltaTime = 0;

    _this.setTargetElement(_this.renderer.domElement);

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
    return _this;
  }

  /**
   * Hit tests a point against the display tree, returning the first interactive object that is hit.
   *
   * @param {Point} globalPoint - A point to hit test with, in global space.
   * @param {Object3D} [root] - The root display object to start from. If omitted, defaults
   * to the last rendered root of the associated renderer.
   * @return {Object3D} The hit display object, if any.
   */


  createClass(InteractionManager, [{
    key: 'hitTest',
    value: function hitTest(globalPoint, root) {
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

  }, {
    key: 'setTargetElement',
    value: function setTargetElement(element) {
      this.removeEvents();

      this.interactionDOMElement = element;

      this.addEvents();
    }

    /**
     * Registers all the DOM events
     *
     * @private
     */

  }, {
    key: 'addEvents',
    value: function addEvents() {
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

  }, {
    key: 'removeEvents',
    value: function removeEvents() {
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

  }, {
    key: 'update',
    value: function update(_ref) {
      var snippet = _ref.snippet;

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
      for (var k in this.activeInteractionData) {
        // eslint-disable-next-line no-prototype-builtins
        if (this.activeInteractionData.hasOwnProperty(k)) {
          var interactionData = this.activeInteractionData[k];

          if (interactionData.originalEvent && interactionData.pointerType !== 'touch') {
            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, interactionData.originalEvent, interactionData);

            this.processInteractive(interactionEvent, this.scene, this.processPointerOverOut, true);
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

  }, {
    key: 'setCursorMode',
    value: function setCursorMode(mode) {
      mode = mode || 'default';
      // if the mode didn't actually change, bail early
      if (this.currentCursorMode === mode) {
        return;
      }
      this.currentCursorMode = mode;
      var style = this.cursorStyles[mode];

      // only do things if there is a cursor style for it
      if (style) {
        switch (typeof style === 'undefined' ? 'undefined' : _typeof(style)) {
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

  }, {
    key: 'triggerEvent',
    value: function triggerEvent(displayObject, eventString, eventData) {
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

  }, {
    key: 'processInteractive',
    value: function processInteractive(interactionEvent, displayObject, func, hitTest, interactive) {
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

      var hit = false;
      var interactiveParent = interactive;

      if (displayObject.interactiveChildren && displayObject.children) {
        var children = displayObject.children;

        for (var i = children.length - 1; i >= 0; i--) {
          var child = children[i];

          // time to get recursive.. if this function will return if something is hit..
          var childHit = this.processInteractive(interactionEvent, child, func, hitTest, interactiveParent);

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

  }, {
    key: 'onClick',
    value: function onClick(originalEvent) {
      if (originalEvent.type !== 'click') return;

      var events = this.normalizeToPointerData(originalEvent);

      if (this.autoPreventDefault && events[0].isNormalized) {
        originalEvent.preventDefault();
      }

      var interactionData = this.getInteractionDataForPointerId(events[0]);

      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, events[0], interactionData);

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

  }, {
    key: 'processClick',
    value: function processClick(interactionEvent, displayObject, hit) {
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

  }, {
    key: 'onPointerDown',
    value: function onPointerDown(originalEvent) {
      // if we support touch events, then only use those for touch events, not pointer events
      if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') return;

      var events = this.normalizeToPointerData(originalEvent);

      /**
       * No need to prevent default on natural pointer events, as there are no side effects
       * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
       * so still need to be prevented.
       */

      // Guaranteed that there will be at least one event in events, and all events must have the same pointer type

      if (this.autoPreventDefault && events[0].isNormalized) {
        originalEvent.preventDefault();
      }

      var eventLen = events.length;

      for (var i = 0; i < eventLen; i++) {
        var event = events[i];

        var interactionData = this.getInteractionDataForPointerId(event);

        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = originalEvent;

        this.processInteractive(interactionEvent, this.scene, this.processPointerDown, true);

        this.emit('pointerdown', interactionEvent);
        if (event.pointerType === 'touch') {
          this.emit('touchstart', interactionEvent);
        } else if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
          var isRightButton = event.button === 2;

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

  }, {
    key: 'processPointerDown',
    value: function processPointerDown(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;
      var id = interactionEvent.data.identifier;

      if (hit) {
        if (!displayObject.trackedPointers[id]) {
          displayObject.trackedPointers[id] = new InteractionTrackingData(id);
        }
        this.triggerEvent(displayObject, 'pointerdown', interactionEvent);

        if (data.pointerType === 'touch') {
          displayObject.started = true;
          this.triggerEvent(displayObject, 'touchstart', interactionEvent);
        } else if (data.pointerType === 'mouse' || data.pointerType === 'pen') {
          var isRightButton = data.button === 2;

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

  }, {
    key: 'onPointerComplete',
    value: function onPointerComplete(originalEvent, cancelled, func) {
      var events = this.normalizeToPointerData(originalEvent);

      var eventLen = events.length;

      // if the event wasn't targeting our canvas, then consider it to be pointerupoutside
      // in all cases (unless it was a pointercancel)
      var eventAppend = originalEvent.target !== this.interactionDOMElement ? 'outside' : '';

      for (var i = 0; i < eventLen; i++) {
        var event = events[i];

        var interactionData = this.getInteractionDataForPointerId(event);

        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = originalEvent;

        // perform hit testing for events targeting our canvas or cancel events
        this.processInteractive(interactionEvent, this.scene, func, cancelled || !eventAppend);

        this.emit(cancelled ? 'pointercancel' : 'pointerup' + eventAppend, interactionEvent);

        if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
          var isRightButton = event.button === 2;

          this.emit(isRightButton ? 'rightup' + eventAppend : 'mouseup' + eventAppend, interactionEvent);
        } else if (event.pointerType === 'touch') {
          this.emit(cancelled ? 'touchcancel' : 'touchend' + eventAppend, interactionEvent);
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

  }, {
    key: 'onPointerCancel',
    value: function onPointerCancel(event) {
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

  }, {
    key: 'processPointerCancel',
    value: function processPointerCancel(interactionEvent, displayObject) {
      var data = interactionEvent.data;

      var id = interactionEvent.data.identifier;

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

  }, {
    key: 'onPointerUp',
    value: function onPointerUp(event) {
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

  }, {
    key: 'processPointerUp',
    value: function processPointerUp(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;

      var id = interactionEvent.data.identifier;

      var trackingData = displayObject.trackedPointers[id];

      var isTouch = data.pointerType === 'touch';

      var isMouse = data.pointerType === 'mouse' || data.pointerType === 'pen';

      // Mouse only
      if (isMouse) {
        var isRightButton = data.button === 2;

        var flags = InteractionTrackingData.FLAGS;

        var test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;

        var isDown = trackingData !== undefined && trackingData.flags & test;

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

  }, {
    key: 'onPointerMove',
    value: function onPointerMove(originalEvent) {
      // if we support touch events, then only use those for touch events, not pointer events
      if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') return;

      var events = this.normalizeToPointerData(originalEvent);

      if (events[0].pointerType === 'mouse') {
        this.didMove = true;

        this.cursor = null;
      }

      var eventLen = events.length;

      for (var i = 0; i < eventLen; i++) {
        var event = events[i];

        var interactionData = this.getInteractionDataForPointerId(event);

        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = originalEvent;

        var interactive = event.pointerType === 'touch' ? this.moveWhenInside : true;

        this.processInteractive(interactionEvent, this.scene, this.processPointerMove, interactive);
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

  }, {
    key: 'processPointerMove',
    value: function processPointerMove(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;

      var isTouch = data.pointerType === 'touch';

      var isMouse = data.pointerType === 'mouse' || data.pointerType === 'pen';

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

  }, {
    key: 'onPointerOut',
    value: function onPointerOut(originalEvent) {
      // if we support touch events, then only use those for touch events, not pointer events
      if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') return;

      var events = this.normalizeToPointerData(originalEvent);

      // Only mouse and pointer can call onPointerOut, so events will always be length 1
      var event = events[0];

      if (event.pointerType === 'mouse') {
        this.mouseOverRenderer = false;
        this.setCursorMode(null);
      }

      var interactionData = this.getInteractionDataForPointerId(event);

      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

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

  }, {
    key: 'processPointerOverOut',
    value: function processPointerOverOut(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;

      var id = interactionEvent.data.identifier;

      var isMouse = data.pointerType === 'mouse' || data.pointerType === 'pen';

      var trackingData = displayObject.trackedPointers[id];

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

  }, {
    key: 'onPointerOver',
    value: function onPointerOver(originalEvent) {
      var events = this.normalizeToPointerData(originalEvent);

      // Only mouse and pointer can call onPointerOver, so events will always be length 1
      var event = events[0];

      var interactionData = this.getInteractionDataForPointerId(event);

      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

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

  }, {
    key: 'getInteractionDataForPointerId',
    value: function getInteractionDataForPointerId(event) {
      var pointerId = event.pointerId;

      var interactionData = void 0;

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

  }, {
    key: 'releaseInteractionDataForPointerId',
    value: function releaseInteractionDataForPointerId(pointerId) {
      var interactionData = this.activeInteractionData[pointerId];

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

  }, {
    key: 'mapPositionToPoint',
    value: function mapPositionToPoint(point, x, y) {
      var rect = void 0;

      // IE 11 fix
      if (!this.interactionDOMElement.parentElement) {
        rect = {
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          width: 0,
          height: 0
        };
      } else {
        rect = this.interactionDOMElement.getBoundingClientRect();
      }

      point.x = (x - rect.left) / rect.width * 2 - 1;
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

  }, {
    key: 'configureInteractionEventForDOMEvent',
    value: function configureInteractionEventForDOMEvent(interactionEvent, pointerEvent, interactionData) {
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
      interactionEvent.intersects = this.raycaster.intersectObjects(this.scene.children, true);

      return interactionEvent;
    }

    /**
     * Ensures that the original event object contains all data that a regular pointer event would have
     *
     * @private
     * @param {TouchEvent|MouseEvent|PointerEvent} event - The original event data from a touch or mouse event
     * @return {PointerEvent[]} An array containing a single normalized pointer event, in the case of a pointer
     *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
     */

  }, {
    key: 'normalizeToPointerData',
    value: function normalizeToPointerData(event) {
      var normalizedEvents = [];

      if (this.supportsTouchEvents && event instanceof TouchEvent) {
        for (var i = 0, li = event.changedTouches.length; i < li; i++) {
          var touch = event.changedTouches[i];

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

  }, {
    key: 'destroy',
    value: function destroy() {
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
  }]);
  return InteractionManager;
}(EventDispatcher);

var MOUSE_POINTER_ID$1 = 'MOUSE';

// helpers for hitTest() - only used inside hitTest()
var hitTestEvent$1 = {
  target: null,
  data: {
    global: null
  }
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

var InteractionLayer = function (_EventDispatcher) {
  inherits(InteractionLayer, _EventDispatcher);

  /**
   * @param {WebGLRenderer} renderer - A reference to the current renderer
   * @param {Object} [options] - The options for the manager.
   * @param {Boolean} [options.autoPreventDefault=false] - Should the manager automatically prevent default browser actions.
   * @param {Boolean} [options.autoAttach=true] - Should the manager automatically attach target element.
   * @param {Number} [options.interactionFrequency=10] - Frequency increases the interaction events will be checked.
   */
  function InteractionLayer(renderer, options) {
    classCallCheck(this, InteractionLayer);

    var _this = possibleConstructorReturn(this, (InteractionLayer.__proto__ || Object.getPrototypeOf(InteractionLayer)).call(this));

    options = options || {};

    /**
     * The renderer this interaction manager works for.
     *
     * @member {WebGLRenderer}
     */
    _this.renderer = renderer;

    /**
     * The renderer this interaction manager works for.
     *
     * @member {Layer}
     */
    _this.layer = null;

    /**
     * The renderer this interaction manager works for.
     *
     * @member {Scene}
     */
    // this.scene = scene;

    /**
     * The renderer this interaction manager works for.
     *
     * @member {Camera}
     */
    // this.camera = camera;

    /**
     * Should default browser actions automatically be prevented.
     * Does not apply to pointer events for backwards compatibility
     * preventDefault on pointer events stops mouse events from firing
     * Thus, for every pointer event, there will always be either a mouse of touch event alongside it.
     *
     * @member {boolean}
     * @default false
     */
    _this.autoPreventDefault = options.autoPreventDefault || false;

    /**
     * Frequency in milliseconds that the mousemove, moveover & mouseout interaction events will be checked.
     *
     * @member {number}
     * @default 10
     */
    _this.interactionFrequency = options.interactionFrequency || 10;

    /**
     * The mouse data
     *
     * @member {InteractionData}
     */
    _this.mouse = new InteractionData();
    _this.mouse.identifier = MOUSE_POINTER_ID$1;

    // setting the mouse to start off far off screen will mean that mouse over does
    //  not get called before we even move the mouse.
    _this.mouse.global.set(-999999);

    /**
     * Actively tracked InteractionData
     *
     * @private
     * @member {Object.<number,InteractionData>}
     */
    _this.activeInteractionData = {};
    _this.activeInteractionData[MOUSE_POINTER_ID$1] = _this.mouse;

    /**
     * Pool of unused InteractionData
     *
     * @private
     * @member {InteractionData[]}
     */
    _this.interactionDataPool = [];

    /**
     * An event data object to handle all the event tracking/dispatching
     *
     * @member {object}
     */
    _this.eventData = new InteractionEvent();

    /**
     * The DOM element to bind to.
     *
     * @private
     * @member {HTMLElement}
     */
    _this.interactionDOMElement = null;

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
    _this.moveWhenInside = true;

    /**
     * Have events been attached to the dom element?
     *
     * @private
     * @member {boolean}
     */
    _this.eventsAdded = false;

    /**
     * Is the mouse hovering over the renderer?
     *
     * @private
     * @member {boolean}
     */
    _this.mouseOverRenderer = false;

    /**
     * Does the device support touch events
     * https://www.w3.org/TR/touch-events/
     *
     * @readonly
     * @member {boolean}
     */
    _this.supportsTouchEvents = 'ontouchstart' in window;

    /**
     * Does the device support pointer events
     * https://www.w3.org/Submission/pointer-events/
     *
     * @readonly
     * @member {boolean}
     */
    _this.supportsPointerEvents = !!window.PointerEvent;

    // this will make it so that you don't have to call bind all the time

    /**
     * @private
     * @member {Function}
     */
    _this.onClick = _this.onClick.bind(_this);
    _this.processClick = _this.processClick.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerUp = _this.onPointerUp.bind(_this);
    _this.processPointerUp = _this.processPointerUp.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerCancel = _this.onPointerCancel.bind(_this);
    _this.processPointerCancel = _this.processPointerCancel.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerDown = _this.onPointerDown.bind(_this);
    _this.processPointerDown = _this.processPointerDown.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerMove = _this.onPointerMove.bind(_this);
    _this.processPointerMove = _this.processPointerMove.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerOut = _this.onPointerOut.bind(_this);
    _this.processPointerOverOut = _this.processPointerOverOut.bind(_this);

    /**
     * @private
     * @member {Function}
     */
    _this.onPointerOver = _this.onPointerOver.bind(_this);

    /**
     * Dictionary of how different cursor modes are handled. Strings are handled as CSS cursor
     * values, objects are handled as dictionaries of CSS values for interactionDOMElement,
     * and functions are called instead of changing the CSS.
     * Default CSS cursor values are provided for 'default' and 'pointer' modes.
     * @member {Object.<string, (string|Function|Object.<string, string>)>}
     */
    _this.cursorStyles = {
      default: 'inherit',
      pointer: 'pointer'
    };

    /**
     * The mode of the cursor that is being used.
     * The value of this is a key from the cursorStyles dictionary.
     *
     * @member {string}
     */
    _this.currentCursorMode = null;

    /**
     * Internal cached let.
     *
     * @private
     * @member {string}
     */
    _this.cursor = null;

    /**
     * ray caster, for survey intersects from 3d-scene
     *
     * @private
     * @member {Raycaster}
     */
    _this.raycaster = new Raycaster();

    /**
     * snippet time
     *
     * @private
     * @member {Number}
     */
    _this._deltaTime = 0;

    _this.setTargetElement(_this.renderer.domElement);

    /**
     * Fired when a pointer device button (usually a mouse left-button) is pressed on the display
     * object.
     *
     * @event InteractionLayer#mousedown
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
     * on the display object.
     *
     * @event InteractionLayer#rightdown
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button (usually a mouse left-button) is released over the display
     * object.
     *
     * @event InteractionLayer#mouseup
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is released
     * over the display object.
     *
     * @event InteractionLayer#rightup
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
     * the display object.
     *
     * @event InteractionLayer#click
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
     * and released on the display object.
     *
     * @event InteractionLayer#rightclick
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button (usually a mouse left-button) is released outside the
     * display object that initially registered a
     * [mousedown]{@link InteractionLayer#event:mousedown}.
     *
     * @event InteractionLayer#mouseupoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is released
     * outside the display object that initially registered a
     * [rightdown]{@link InteractionLayer#event:rightdown}.
     *
     * @event InteractionLayer#rightupoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device (usually a mouse) is moved while over the display object
     *
     * @event InteractionLayer#mousemove
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device (usually a mouse) is moved onto the display object
     *
     * @event InteractionLayer#mouseover
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device (usually a mouse) is moved off the display object
     *
     * @event InteractionLayer#mouseout
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is pressed on the display object.
     *
     * @event InteractionLayer#pointerdown
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is released over the display object.
     *
     * @event InteractionLayer#pointerup
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when the operating system cancels a pointer event
     *
     * @event InteractionLayer#pointercancel
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is pressed and released on the display object.
     *
     * @event InteractionLayer#pointertap
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device button is released outside the display object that initially
     * registered a [pointerdown]{@link InteractionLayer#event:pointerdown}.
     *
     * @event InteractionLayer#pointerupoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device is moved while over the display object
     *
     * @event InteractionLayer#pointermove
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device is moved onto the display object
     *
     * @event InteractionLayer#pointerover
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a pointer device is moved off the display object
     *
     * @event InteractionLayer#pointerout
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is placed on the display object.
     *
     * @event InteractionLayer#touchstart
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is removed from the display object.
     *
     * @event InteractionLayer#touchend
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when the operating system cancels a touch
     *
     * @event InteractionLayer#touchcancel
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is placed and removed from the display object.
     *
     * @event InteractionLayer#tap
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is removed outside of the display object that initially
     * registered a [touchstart]{@link InteractionLayer#event:touchstart}.
     *
     * @event InteractionLayer#touchendoutside
     * @param {InteractionEvent} event - Interaction event
     */

    /**
     * Fired when a touch point is moved along the display object.
     *
     * @event InteractionLayer#touchmove
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
    return _this;
  }

  /**
   * @return {boolean}
   */


  createClass(InteractionLayer, [{
    key: 'isAble',
    value: function isAble() {
      return this.layer && this.layer.interactive;
    }

    /**
     * set layer
     * @param {Layer} layer layer
     */

  }, {
    key: 'setLayer',
    value: function setLayer(layer) {
      this.layer = layer;
    }

    /**
     * Hit tests a point against the display tree, returning the first interactive object that is hit.
     *
     * @param {Point} globalPoint - A point to hit test with, in global space.
     * @param {Object3D} [root] - The root display object to start from. If omitted, defaults
     * to the last rendered root of the associated renderer.
     * @return {Object3D} The hit display object, if any.
     */

  }, {
    key: 'hitTest',
    value: function hitTest(globalPoint, root) {
      if (!this.isAble()) return null;
      // clear the target for our hit test
      hitTestEvent$1.target = null;
      // assign the global point
      hitTestEvent$1.data.global = globalPoint;
      // ensure safety of the root
      if (!root) {
        root = this.layer.scene;
      }
      // run the hit test
      this.processInteractive(hitTestEvent$1, root, null, true);
      // return our found object - it'll be null if we didn't hit anything

      return hitTestEvent$1.target;
    }

    /**
     * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
     * other DOM elements on top of the renderers Canvas element. With this you'll be bale to deletegate
     * another DOM element to receive those events.
     *
     * @param {HTMLCanvasElement} element - the DOM element which will receive mouse and touch events.
     */

  }, {
    key: 'setTargetElement',
    value: function setTargetElement(element) {
      this.removeEvents();

      this.interactionDOMElement = element;

      this.addEvents();
    }

    /**
     * Registers all the DOM events
     *
     * @private
     */

  }, {
    key: 'addEvents',
    value: function addEvents() {
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

  }, {
    key: 'removeEvents',
    value: function removeEvents() {
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

  }, {
    key: 'update',
    value: function update(_ref) {
      var snippet = _ref.snippet;

      if (!this.isAble()) return;
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
      for (var k in this.activeInteractionData) {
        // eslint-disable-next-line no-prototype-builtins
        if (this.activeInteractionData.hasOwnProperty(k)) {
          var interactionData = this.activeInteractionData[k];

          if (interactionData.originalEvent && interactionData.pointerType !== 'touch') {
            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, interactionData.originalEvent, interactionData);

            this.processInteractive(interactionEvent, this.layer.scene, this.processPointerOverOut, true);
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

  }, {
    key: 'setCursorMode',
    value: function setCursorMode(mode) {
      mode = mode || 'default';
      // if the mode didn't actually change, bail early
      if (this.currentCursorMode === mode) {
        return;
      }
      this.currentCursorMode = mode;
      var style = this.cursorStyles[mode];

      // only do things if there is a cursor style for it
      if (style) {
        switch (typeof style === 'undefined' ? 'undefined' : _typeof(style)) {
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

  }, {
    key: 'triggerEvent',
    value: function triggerEvent(displayObject, eventString, eventData) {
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

  }, {
    key: 'processInteractive',
    value: function processInteractive(interactionEvent, displayObject, func, hitTest, interactive) {
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

      var hit = false;
      var interactiveParent = interactive;

      if (displayObject.interactiveChildren && displayObject.children) {
        var children = displayObject.children;

        for (var i = children.length - 1; i >= 0; i--) {
          var child = children[i];

          // time to get recursive.. if this function will return if something is hit..
          var childHit = this.processInteractive(interactionEvent, child, func, hitTest, interactiveParent);

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

  }, {
    key: 'onClick',
    value: function onClick(originalEvent) {
      if (!this.isAble()) return;
      if (originalEvent.type !== 'click') return;

      var events = this.normalizeToPointerData(originalEvent);

      if (this.autoPreventDefault && events[0].isNormalized) {
        originalEvent.preventDefault();
      }

      var interactionData = this.getInteractionDataForPointerId(events[0]);

      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, events[0], interactionData);

      interactionEvent.data.originalEvent = originalEvent;

      this.processInteractive(interactionEvent, this.layer.scene, this.processClick, true);

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

  }, {
    key: 'processClick',
    value: function processClick(interactionEvent, displayObject, hit) {
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

  }, {
    key: 'onPointerDown',
    value: function onPointerDown(originalEvent) {
      if (!this.isAble()) return;
      // if we support touch events, then only use those for touch events, not pointer events
      if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') return;

      var events = this.normalizeToPointerData(originalEvent);

      /**
       * No need to prevent default on natural pointer events, as there are no side effects
       * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
       * so still need to be prevented.
       */

      // Guaranteed that there will be at least one event in events, and all events must have the same pointer type

      if (this.autoPreventDefault && events[0].isNormalized) {
        originalEvent.preventDefault();
      }

      var eventLen = events.length;

      for (var i = 0; i < eventLen; i++) {
        var event = events[i];

        var interactionData = this.getInteractionDataForPointerId(event);

        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = originalEvent;

        this.processInteractive(interactionEvent, this.layer.scene, this.processPointerDown, true);

        this.emit('pointerdown', interactionEvent);
        if (event.pointerType === 'touch') {
          this.emit('touchstart', interactionEvent);
        } else if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
          var isRightButton = event.button === 2;

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

  }, {
    key: 'processPointerDown',
    value: function processPointerDown(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;
      var id = interactionEvent.data.identifier;

      if (hit) {
        if (!displayObject.trackedPointers[id]) {
          displayObject.trackedPointers[id] = new InteractionTrackingData(id);
        }
        this.triggerEvent(displayObject, 'pointerdown', interactionEvent);

        if (data.pointerType === 'touch') {
          displayObject.started = true;
          this.triggerEvent(displayObject, 'touchstart', interactionEvent);
        } else if (data.pointerType === 'mouse' || data.pointerType === 'pen') {
          var isRightButton = data.button === 2;

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

  }, {
    key: 'onPointerComplete',
    value: function onPointerComplete(originalEvent, cancelled, func) {
      var events = this.normalizeToPointerData(originalEvent);

      var eventLen = events.length;

      // if the event wasn't targeting our canvas, then consider it to be pointerupoutside
      // in all cases (unless it was a pointercancel)
      var eventAppend = originalEvent.target !== this.interactionDOMElement ? 'outside' : '';

      for (var i = 0; i < eventLen; i++) {
        var event = events[i];

        var interactionData = this.getInteractionDataForPointerId(event);

        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = originalEvent;

        // perform hit testing for events targeting our canvas or cancel events
        this.processInteractive(interactionEvent, this.layer.scene, func, cancelled || !eventAppend);

        this.emit(cancelled ? 'pointercancel' : 'pointerup' + eventAppend, interactionEvent);

        if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
          var isRightButton = event.button === 2;

          this.emit(isRightButton ? 'rightup' + eventAppend : 'mouseup' + eventAppend, interactionEvent);
        } else if (event.pointerType === 'touch') {
          this.emit(cancelled ? 'touchcancel' : 'touchend' + eventAppend, interactionEvent);
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

  }, {
    key: 'onPointerCancel',
    value: function onPointerCancel(event) {
      if (!this.isAble()) return;
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

  }, {
    key: 'processPointerCancel',
    value: function processPointerCancel(interactionEvent, displayObject) {
      var data = interactionEvent.data;

      var id = interactionEvent.data.identifier;

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

  }, {
    key: 'onPointerUp',
    value: function onPointerUp(event) {
      if (!this.isAble()) return;
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

  }, {
    key: 'processPointerUp',
    value: function processPointerUp(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;

      var id = interactionEvent.data.identifier;

      var trackingData = displayObject.trackedPointers[id];

      var isTouch = data.pointerType === 'touch';

      var isMouse = data.pointerType === 'mouse' || data.pointerType === 'pen';

      // Mouse only
      if (isMouse) {
        var isRightButton = data.button === 2;

        var flags = InteractionTrackingData.FLAGS;

        var test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;

        var isDown = trackingData !== undefined && trackingData.flags & test;

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

  }, {
    key: 'onPointerMove',
    value: function onPointerMove(originalEvent) {
      if (!this.isAble()) return;
      // if we support touch events, then only use those for touch events, not pointer events
      if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') return;

      var events = this.normalizeToPointerData(originalEvent);

      if (events[0].pointerType === 'mouse') {
        this.didMove = true;

        this.cursor = null;
      }

      var eventLen = events.length;

      for (var i = 0; i < eventLen; i++) {
        var event = events[i];

        var interactionData = this.getInteractionDataForPointerId(event);

        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = originalEvent;

        var interactive = event.pointerType === 'touch' ? this.moveWhenInside : true;

        this.processInteractive(interactionEvent, this.layer.scene, this.processPointerMove, interactive);
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

  }, {
    key: 'processPointerMove',
    value: function processPointerMove(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;

      var isTouch = data.pointerType === 'touch';

      var isMouse = data.pointerType === 'mouse' || data.pointerType === 'pen';

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

  }, {
    key: 'onPointerOut',
    value: function onPointerOut(originalEvent) {
      if (!this.isAble()) return;
      // if we support touch events, then only use those for touch events, not pointer events
      if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') return;

      var events = this.normalizeToPointerData(originalEvent);

      // Only mouse and pointer can call onPointerOut, so events will always be length 1
      var event = events[0];

      if (event.pointerType === 'mouse') {
        this.mouseOverRenderer = false;
        this.setCursorMode(null);
      }

      var interactionData = this.getInteractionDataForPointerId(event);

      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

      interactionEvent.data.originalEvent = event;

      this.processInteractive(interactionEvent, this.layer.scene, this.processPointerOverOut, false);

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

  }, {
    key: 'processPointerOverOut',
    value: function processPointerOverOut(interactionEvent, displayObject, hit) {
      var data = interactionEvent.data;

      var id = interactionEvent.data.identifier;

      var isMouse = data.pointerType === 'mouse' || data.pointerType === 'pen';

      var trackingData = displayObject.trackedPointers[id];

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

  }, {
    key: 'onPointerOver',
    value: function onPointerOver(originalEvent) {
      if (!this.isAble()) return;
      var events = this.normalizeToPointerData(originalEvent);

      // Only mouse and pointer can call onPointerOver, so events will always be length 1
      var event = events[0];

      var interactionData = this.getInteractionDataForPointerId(event);

      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

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

  }, {
    key: 'getInteractionDataForPointerId',
    value: function getInteractionDataForPointerId(event) {
      var pointerId = event.pointerId;

      var interactionData = void 0;

      if (pointerId === MOUSE_POINTER_ID$1 || event.pointerType === 'mouse') {
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

  }, {
    key: 'releaseInteractionDataForPointerId',
    value: function releaseInteractionDataForPointerId(pointerId) {
      var interactionData = this.activeInteractionData[pointerId];

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

  }, {
    key: 'mapPositionToPoint',
    value: function mapPositionToPoint(point, x, y) {
      var rect = void 0;

      // IE 11 fix
      if (!this.interactionDOMElement.parentElement) {
        rect = {
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          width: 0,
          height: 0
        };
      } else {
        rect = this.interactionDOMElement.getBoundingClientRect();
      }

      point.x = (x - rect.left) / rect.width * 2 - 1;
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

  }, {
    key: 'configureInteractionEventForDOMEvent',
    value: function configureInteractionEventForDOMEvent(interactionEvent, pointerEvent, interactionData) {
      interactionEvent.data = interactionData;

      this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);

      if (this.layer && this.layer.interactive) this.raycaster.setFromCamera(interactionData.global, this.layer.camera);

      // Not really sure why this is happening, but it's how a previous version handled things TODO: there should be remove
      if (pointerEvent.pointerType === 'touch') {
        pointerEvent.globalX = interactionData.global.x;
        pointerEvent.globalY = interactionData.global.y;
      }

      interactionData.originalEvent = pointerEvent;
      interactionEvent._reset();
      interactionEvent.intersects = this.raycaster.intersectObjects(this.scene.children, true);

      return interactionEvent;
    }

    /**
     * Ensures that the original event object contains all data that a regular pointer event would have
     *
     * @private
     * @param {TouchEvent|MouseEvent|PointerEvent} event - The original event data from a touch or mouse event
     * @return {PointerEvent[]} An array containing a single normalized pointer event, in the case of a pointer
     *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
     */

  }, {
    key: 'normalizeToPointerData',
    value: function normalizeToPointerData(event) {
      var normalizedEvents = [];

      if (this.supportsTouchEvents && event instanceof TouchEvent) {
        for (var i = 0, li = event.changedTouches.length; i < li; i++) {
          var touch = event.changedTouches[i];

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
        if (typeof event.pointerId === 'undefined') event.pointerId = MOUSE_POINTER_ID$1;
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

  }, {
    key: 'destroy',
    value: function destroy() {
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
  }]);
  return InteractionLayer;
}(EventDispatcher);

(function () {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }

  window.RAF = window.requestAnimationFrame;
  window.CAF = window.cancelAnimationFrame;
})();

/**
 * @extends EventDispatcher
 */

var Ticker = function (_EventDispatcher) {
  inherits(Ticker, _EventDispatcher);

  /**
   *
   */
  function Ticker() {
    classCallCheck(this, Ticker);

    var _this = possibleConstructorReturn(this, (Ticker.__proto__ || Object.getPrototypeOf(Ticker)).call(this));

    _this.timer = null;
    _this.started = false;

    /**
     * pre-time cache
     *
     * @member {Number}
     * @private
     */
    _this.pt = 0;

    /**
     * how long the time through, at this tick
     *
     * @member {Number}
     * @private
     */
    _this.snippet = 0;

    _this.start();
    return _this;
  }

  /**
   * start tick loop
   */


  createClass(Ticker, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      if (this.started) return;
      var loop = function loop() {
        _this2.timeline();
        _this2.emit('tick', { snippet: _this2.snippet });
        _this2.timer = RAF(loop);
      };
      loop();
    }

    /**
     * stop tick loop
     */

  }, {
    key: 'stop',
    value: function stop() {
      CAF(this.timer);
      this.started = false;
    }

    /**
     * get timeline snippet
     *
     * @private
     */

  }, {
    key: 'timeline',
    value: function timeline() {
      this.snippet = Date.now() - this.pt;
      if (this.pt === 0 || this.snippet > 200) {
        this.pt = Date.now();
        this.snippet = Date.now() - this.pt;
      }

      this.pt += this.snippet;
    }
  }]);
  return Ticker;
}(EventDispatcher);

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

var Interaction = function (_InteractionManager) {
  inherits(Interaction, _InteractionManager);

  /**
   * @param {WebGLRenderer} renderer - A reference to the current renderer
   * @param {Scene} scene - A reference to the current scene
   * @param {Camera} camera - A reference to the current camera
   * @param {Object} [options] - The options for the manager.
   * @param {Boolean} [options.autoPreventDefault=false] - Should the manager automatically prevent default browser actions.
   * @param {Boolean} [options.autoAttach=false] - Should the manager automatically attach target element.
   * @param {Number} [options.interactionFrequency=10] - Frequency increases the interaction events will be checked.
   */
  function Interaction(renderer, scene, camera, options) {
    classCallCheck(this, Interaction);

    options = Object.assign({ autoAttach: false }, options);

    /**
     * a ticker
     *
     * @private
     * @member {Ticker}
     */
    var _this = possibleConstructorReturn(this, (Interaction.__proto__ || Object.getPrototypeOf(Interaction)).call(this, renderer, scene, camera, options));

    _this.ticker = new Ticker();

    /**
     * update for some over event
     *
     * @private
     */
    _this.update = _this.update.bind(_this);

    _this.on('addevents', function () {
      _this.ticker.on('tick', _this.update);
    });

    _this.on('removeevents', function () {
      _this.ticker.off('tick', _this.update);
    });

    _this.setTargetElement(_this.renderer.domElement);
    return _this;
  }

  return Interaction;
}(InteractionManager);

export { InteractionManager, InteractionLayer, Interaction };
//# sourceMappingURL=three.interaction.module.js.map
