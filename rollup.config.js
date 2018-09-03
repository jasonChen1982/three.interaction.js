
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  sourcemap: true,
  output: [
    {
      format: 'umd',
      name: 'THREE',
      file: 'build/three.interaction.js',
    },
    {
      format: 'es',
      file: 'build/three.interaction.module.js',
    },
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
  extend: true,
  external: [ 'three' ],
  globals: {
    three: 'THREE',
  },
  watch: {
    exclude: [ 'node_modules/**' ],
  },
};
