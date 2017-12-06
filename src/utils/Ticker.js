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
     * 前一帧的时间标记
     *
     * @member {Number}
     * @private
     */
    this.pt = 0;

    /**
     * 本次渲染经历的时间片段长度
     *
     * @member {Number}
     * @private
     */
    this.snippet = 0;

    this.start();
  }

  /**
   * start
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
   * stop
   */
  stop() {
    CAF(this.timer);
    this.started = false;
  }

  /**
   * 时间轴部件
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
