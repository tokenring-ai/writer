import path from "path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import pluginJson from "@rollup/plugin-json";
import esmShim from "@rollup/plugin-esm-shim";

export default {
	input: "./src/tr-coder.js",

	output: {
		file: path.resolve(import.meta.dirname, "dist/tr-coder.js"),
		format: "es", // ES module output
		sourcemap: process.env.NODE_ENV === "development",
		inlineDynamicImports: true,
	},

	/*
 external: (id) => {
  // Always externalize Node.js built-ins
  if (id.startsWith('node:') || isNodeBuiltin(id)) {
   return true;
  }

  // Include @token-ring packages in the bundle (return false to bundle them)
  if (id.startsWith('@token-ring')) {
   return false;
  }

  // Externalize all other node_modules packages
  return /^[@a-z][\w-]*([/][\w-]+)*$/.test(id);
 },*/

	plugins: [
		esmShim(),
		pluginJson(),
		nodeResolve() /*{
   // Resolve modules from node_modules
   preferBuiltins: true,

   // Include @token-ring packages in bundling
   resolveOnly: [/^@token-ring/]
  }),*/,

		// Convert CommonJS modules to ES6
		commonjs(),
	],
};

// Helper function to detect Node.js built-in modules
function isNodeBuiltin(id) {
	const builtins = [
		"assert",
		"buffer",
		"child_process",
		"cluster",
		"console",
		"constants",
		"crypto",
		"dgram",
		"dns",
		"domain",
		"events",
		"fs",
		"http",
		"https",
		"module",
		"net",
		"os",
		"path",
		"punycode",
		"querystring",
		"readline",
		"repl",
		"stream",
		"string_decoder",
		"sys",
		"timers",
		"tls",
		"tty",
		"url",
		"util",
		"vm",
		"zlib",
		"async_hooks",
		"perf_hooks",
		"worker_threads",
	];
	return builtins.includes(id);
}
