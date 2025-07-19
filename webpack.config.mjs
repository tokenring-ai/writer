import path from "path";

export default {
	entry: "./src/tr-coder.js",
	target: "node",
	mode: process.env.NODE_ENV ?? "development",
	output: {
		path: path.resolve(import.meta.dirname, "dist"),
		filename: "tr-coder.js",
	},
	experiments: {
		outputModule: true,
	},
	resolve: {
		extensions: [".js"],
	},
	externals: [
		// Function to determine which modules to externalize
		({ request }, callback) => {
			// Include @token-ring packages in the bundle
			if (request.startsWith("@token-ring")) {
				return callback();
			}
			// Externalize all other packages
			if (/^[@a-z][\w-]*([/][\w-]+)*$/.test(request)) {
				return callback(null, `module ${request}`);
			}
			callback();
		},
	],
};
