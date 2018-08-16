import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import typescript from "rollup-plugin-typescript2"

export default {
  input: "src/bootstrap.tsx",
  output: {
    name: "TodoApp",
    file: "build/bundle.js",
    format: "iife"
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
}
