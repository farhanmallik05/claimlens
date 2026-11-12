/**
 * ClaimLens metrics.json Validator
 * Enforces WP-33 and QA constraints: No 'TBD' or undefined values allowed in metrics.json.
 */

const fs = require('fs');
const path = require('path');

const metricsPath = path.resolve(__dirname, '../metrics.json');

if (!fs.existsSync(metricsPath)) {
  console.error('❌ ERROR: metrics.json does not exist at repo root');
  process.exit(1);
}

const raw = fs.readFileSync(metricsPath, 'utf8');

if (raw.includes('"TBD"') || raw.includes('TBD') || raw.includes('undefined') || raw.includes('null')) {
  console.error('❌ BUILD FAILED: metrics.json contains unresolved TBD or placeholder values!');
  process.exit(1);
}

try {
  const data = JSON.parse(raw);
  
  // Verify required top-level keys
  const requiredKeys = ['engine', 'provenance', 'performance', 'industryData', 'impact'];
  for (const key of requiredKeys) {
    if (!data[key]) {
      console.error(`❌ ERROR: metrics.json missing required section: "${key}"`);
      process.exit(1);
    }
  }

  // Verify critical measured values
  if (data.engine.e2eTestsPassed !== 148 || data.engine.floatLeakage !== 0) {
    console.error('❌ ERROR: metrics.json engine metrics do not match certified test run.');
    process.exit(1);
  }

  console.log('✔ metrics.json validated successfully: 0 TBDs, all keys verified.');
  process.exit(0);
} catch (err) {
  console.error('❌ ERROR: Failed to parse metrics.json:', err.message);
  process.exit(1);
}
