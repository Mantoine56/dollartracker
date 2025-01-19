function polyfillObjectProperty(object, name, getValue) {
  if (object[name] === undefined) {
    Object.defineProperty(object, name, {
      configurable: true,
      enumerable: true,
      get: getValue,
    });
  }
}

function polyfillGlobal(name, getValue) {
  polyfillObjectProperty(global, name, getValue);
}

module.exports = {
  polyfillObjectProperty,
  polyfillGlobal,
};
