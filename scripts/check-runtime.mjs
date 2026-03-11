const REQUIRED_NODE_PREFIX = "v20.11.";
const REQUIRED_NPM_PREFIX = "10.2.";

const nodeVersion = process.version;
const npmUserAgent = process.env.npm_config_user_agent ?? "";
const npmVersionMatch = npmUserAgent.match(/npm\/(\d+\.\d+\.\d+)/);
const npmVersion = npmVersionMatch?.[1] ?? "";

function fail(message) {
  console.error(`[check:runtime] ${message}`);
  process.exit(1);
}

if (!nodeVersion.startsWith(REQUIRED_NODE_PREFIX)) {
  fail(
    `Node.js ${REQUIRED_NODE_PREFIX}x required, current: ${nodeVersion}.`,
  );
}

if (!npmVersion.startsWith(REQUIRED_NPM_PREFIX)) {
  fail(`npm ${REQUIRED_NPM_PREFIX}x required, current: ${npmVersion || "unknown"}.`);
}

console.log(`[check:runtime] OK (node=${nodeVersion}, npm=${npmVersion})`);
