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
export const Utils = {
  /**
   * determine whether it is a `Function`
   *
   * @static
   * @method
   * @memberof Utils
   * @param {*} variable a variable which you want to determine
   * @return {Boolean} type result
   */
  isFunction: (function() {
    const ks = _rt(function() {});
    return function(variable) {
      return _rt(variable) === ks;
    };
  })(),


  /**
   * determine whether it is a `undefined`
   *
   * @static
   * @method
   * @memberof Utils
   * @param {*} variable a variable which you want to determine
   * @return {Boolean} type result
   */
  isUndefined(variable) {
    return typeof variable === 'undefined';
  },
};
