import './Raf';
import { EventDispatcher } from 'three';

/**
 * @extends EventDispatcher
 */
class Ticker extends EventDispatcher {
  /**
   *
   */
  constructor() {
    super();
    this.timer = null;
    this.started = false;

    /**
     * pre-time cache
     *
     * @member {Number}
     * @private
     */
    this.pt = 0;

    /**
     * how long the time through, at this tick
     *
     * @member {Number}
     * @private
     */
    this.snippet = 0;

    this.start();
  }

  /**
   * start tick loop
   */
  start() {
    if (this.started) return;
    const loop = () => {
      this.timeline();
      this.emit('tick', { snippet: this.snippet });
      this.timer = RAF(loop);
    };
    loop();
  }

  /**
   * stop tick loop
   */
  stop() {
    CAF(this.timer);
    this.started = false;
  }

  /**
   * get timeline snippet
   *
   * @private
   */
  timeline() {
    this.snippet = Date.now() - this.pt;
    if (this.pt === 0 || this.snippet > 200) {
      this.pt = Date.now();
      this.snippet = Date.now() - this.pt;
    }

    this.pt += this.snippet;
  }
}

export default Ticker;
