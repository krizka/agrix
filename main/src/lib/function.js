/**
 * Created by kriz on 13/04/16.
 */

Function.prototype.curry = function (...curried) {
  if (curried.length < 1)
    return this;

  const method = this;
  return function () {
    const args = Array.prototype.slice.call(arguments);
    return method.apply(this, curried.concat(args));
  }
};
