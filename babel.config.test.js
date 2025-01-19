module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'automatic' }],
      'babel-preset-expo',
    ],
    plugins: [
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-flow-strip-types',
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-transform-runtime',
    ],
  };
};
