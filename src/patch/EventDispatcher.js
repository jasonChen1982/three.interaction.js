import { EventDispatcher } from 'three';
import { Utils } from '../utils/Utils.js';

/**
 * proxy `addEventListener` function
 *
 * @param {String} type event type, evnet name
 * @param {Function} fn callback
 * @return {this} this
 */
EventDispatcher.prototype.on = function(type, fn) {
  if (!Utils.isFunction(fn)) return;
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
EventDispatcher.prototype.off = function(type, fn) {
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
EventDispatcher.prototype.once = function(type, fn) {
  if (!Utils.isFunction(fn)) return;
  const cb = ev => {
    fn(ev);
    this.off(type, cb);
  };
  this.on(type, cb);
  return this;
};

/**
 * emit a event
 *
 * @param {String} type event type, evnet name
 * @param {Object} event event object, include more information
 * @return {this} this
 */
EventDispatcher.prototype.emit = function(type, event) {
  event.type = type;
  this.dispatchEvent(event);
  return this;
};

