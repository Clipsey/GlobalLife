// Memoize and debounce pulled from WebGL Tutorial by Steven Hall
// adapted from memoize.js by @philogb and @addyosmani
export function memoize(fn) {
  return function () {
    let args = Array.prototype.slice.call(arguments);

    let key = "", len = args.length, cur = null;

    // Get all args one by one
    while (len--) {
      cur = args[len];

      //If current arg is a string, add it, otherwise stringify and add it
      key += (cur === Object(cur)) ? JSON.stringify(cur) : cur;

      // Initialize memoize object
      fn.memoize || (fn.memoize = {});
    }

    //Each key in memoize object
    return (key in fn.memoize) ? fn.memoize[key] :
      fn.memoize[key] = fn.apply(this, args);
  };
}

export function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

export const getTween = function (prop, to, time) {
  time = time || 500;
  let node = this;
  let curr = node[prop];
  console.log(curr);
  console.log(to);
  // return;
  let interpol = d3.interpolateObject(curr, to);
  return function (t) {
    node[prop].copy(interpol(t / time));
    if (t >= time) {
      return true;
    }
  };
};