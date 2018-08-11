import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"

export default {
  input: "app.js",
  output: {
    name: "TodoApp",
    file: "bundle.js",
    format: "iife"
  },
  plugins: [
    resolve(),
    commonjs()
  ]
}
