import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const EXTENSIONS = [".ts", ".tsx", ".mjs", ".js"];

/**
 * Node's built-in type stripping does not do extensionless resolution, but the
 * app source uses bundler-style imports (`./journey`). This resolve hook lets
 * `node --test` import the real modules instead of test-only copies of them.
 */
export async function resolve(specifier, context, nextResolve) {
  // The app imports `data/restaurants.json` with bundler semantics; Node needs
  // an explicit import attribute, so supply it rather than mirroring the data.
  if (specifier.endsWith(".json")) {
    const resolved = await nextResolve(specifier, context);
    return { ...resolved, importAttributes: { type: "json" } };
  }

  const relative = specifier.startsWith("./") || specifier.startsWith("../");
  if (relative && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    const base = new URL(specifier, context.parentURL);
    for (const extension of EXTENSIONS) {
      const candidate = new URL(`${base.href}${extension}`);
      if (existsSync(fileURLToPath(candidate))) {
        return nextResolve(candidate.href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
