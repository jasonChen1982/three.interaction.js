
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
      file: 'esm/three.interaction.js',
    },
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
  external: [ 'three' ],
  globals: {
    three: 'THREE',
  },
  watch: {
    exclude: [ 'node_modules/**' ],
  },
};
