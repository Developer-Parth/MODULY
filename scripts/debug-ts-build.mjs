import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const endpoint = "http://127.0.0.1:7715/ingest/daa11eb7-cc03-4a10-8fbf-ea248b43b7a4";
const sessionId = "180cda";
const runId = `build-${Date.now()}`;

const sendLog = (hypothesisId, location, message, data = {}) => {
    // #region agent log
    fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": sessionId
        },
        body: JSON.stringify({
            sessionId,
            runId,
            hypothesisId,
            location,
            message,
            data,
            timestamp: Date.now()
        })
    }).catch(() => {});
    // #endregion
};

const configPaths = ["tsconfig.json", "tsconfig.node.json", "tsconfig.electron.json"];
const configData = Object.fromEntries(
    configPaths.map((file) => {
        if (!existsSync(file)) return [file, { exists: false, hasIgnoreDeprecations: false }];
        const raw = readFileSync(file, "utf8");
        return [
            file,
            {
                exists: true,
                hasIgnoreDeprecations: raw.includes("ignoreDeprecations"),
                length: raw.length
            }
        ];
    })
);

let tscVersion = "unknown";
try {
    tscVersion = execSync("npx tsc -v", { encoding: "utf8" }).trim();
} catch {
    tscVersion = "failed";
}

sendLog("H1", "scripts/debug-ts-build.mjs:45", "Build context and versions", {
    cwd: process.cwd(),
    argv: process.argv,
    npmLifecycleEvent: process.env.npm_lifecycle_event,
    npmConfigUserAgent: process.env.npm_config_user_agent,
    tscVersion
});

sendLog("H2", "scripts/debug-ts-build.mjs:53", "tsconfig files include scan", {
    configData
});

sendLog("H3", "scripts/debug-ts-build.mjs:57", "Potential TypeScript flags from environment", {
    npmConfigArgv: process.env.npm_config_argv ?? null,
    npmLifecycleScript: process.env.npm_lifecycle_script ?? null
});
