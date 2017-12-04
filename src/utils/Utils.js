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
   * determine whether it is a `Array`
   *
   * @static
   * @method
   * @memberof Utils
   * @param {*} variable a variable which you want to determine
   * @return {Boolean} type result
   */
  isArray: (function() {
    const ks = _rt([]);
    return function(variable) {
      return _rt(variable) === ks;
    };
  })(),

  /**
   * determine whether it is a `Object`
   *
   * @static
   * @method
   * @memberof Utils
   * @param {*} variable a variable which you want to determine
   * @return {Boolean} type result
   */
  isObject: (function() {
    const ks = _rt({});
    return function(variable) {
      return _rt(variable) === ks;
    };
  })(),

  /**
   * determine whether it is a `String`
   *
   * @static
   * @method
   * @memberof Utils
   * @param {*} variable a variable which you want to determine
   * @return {Boolean} type result
   */
  isString: (function() {
    const ks = _rt('s');
    return function(variable) {
      return _rt(variable) === ks;
    };
  })(),

  /**
   * determine whether it is a `Number`
   *
   * @static
   * @method
   * @memberof Utils
   * @param {*} variable a variable which you want to determine
   * @return {Boolean} type result
   */
  isNumber: (function() {
    const ks = _rt(1);
    return function(variable) {
      return _rt(variable) === ks;
    };
  })(),

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

  /**
   * determine whether it is a `Boolean`
   *
   * @static
   * @method
   * @memberof Utils
   * @param {*} variable a variable which you want to determine
   * @return {Boolean} type result
   */
  isBoolean: (function() {
    const ks = _rt(true);
    return function(variable) {
      return _rt(variable) === ks;
    };
  })(),
};
