import { execSync } from "node:child_process";
import fs from "node:fs";
import { expect, test } from "vitest";

test("build produces executable dist/tr-coder.cjs", () => {
	execSync("npm run build", { stdio: "inherit" });
	expect(fs.existsSync("dist/tr-coder.cjs")).toBe(true);
	const output = execSync("node dist/tr-coder.cjs --version").toString().trim();
	expect(output).toBe("1.0.0");
});
