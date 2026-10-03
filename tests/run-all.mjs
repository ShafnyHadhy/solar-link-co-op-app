// tests/run-all.mjs
// Master Test Runner for US-20 Evaluation & Regression

import { runAuthTests } from "./01-auth-and-roles.mjs";
import { runManagerTests } from "./02-manager-workflows.mjs";
import { runSolarOwnerTests } from "./03-solar-owner-workflows.mjs";
import { runHouseholdTests } from "./04-household-workflows.mjs";
import { runTechnicianTests } from "./05-technician-workflows.mjs";
import { runValidationTests } from "./06-validations-and-errors.mjs";
import { runDatabaseTests } from "./07-database-integrity.mjs";

async function main() {
    console.log("\n" + "#".repeat(80));
    console.log("   SOLAR LINK CO-OP: FULL SYSTEM EVALUATION & REGRESSION SUITE");
    console.log("   Date: " + new Date().toLocaleString());
    console.log("#".repeat(80));

    const suites = [
        { name: "1. Authentication & Role Authorization", fn: runAuthTests },
        { name: "2. Manager Operations & Console", fn: runManagerTests },
        { name: "3. Solar Owner Workflows", fn: runSolarOwnerTests },
        { name: "4. Household Workflows", fn: runHouseholdTests },
        { name: "5. Technician Workflows", fn: runTechnicianTests },
        { name: "6. Validations & Error Handling", fn: runValidationTests },
        { name: "7. Database Relational Integrity", fn: runDatabaseTests },
    ];

    const results = [];
    const overallStart = Date.now();

    for (const suite of suites) {
        try {
            const passed = await suite.fn();
            results.push({ name: suite.name, passed });
        } catch (err) {
            console.error(`Suite exception in ${suite.name}:`, err);
            results.push({ name: suite.name, passed: false, error: err.message });
        }
    }

    const overallDuration = ((Date.now() - overallStart) / 1000).toFixed(2);
    const allPassed = results.every(r => r.passed);

    console.log("\n" + "#".repeat(80));
    console.log("                  EVALUATION REGRESSION SCORECARD");
    console.log("#".repeat(80) + "\n");

    results.forEach(r => {
        const badge = r.passed
            ? "  \x1b[32m[PASSED]\x1b[0m"
            : "  \x1b[31m[FAILED]\x1b[0m";
        console.log(`${badge} ${r.name}`);
    });

    console.log("\n" + "-".repeat(80));
    console.log(`  Suites Evaluated : ${results.length}`);
    console.log(`  Suites Passed    : ${results.filter(r => r.passed).length}`);
    console.log(`  Suites Failed    : ${results.filter(r => !r.passed).length}`);
    console.log(`  Execution Time   : ${overallDuration}s`);
    console.log("-".repeat(80));

    if (allPassed) {
        console.log("\n  \x1b[32m✔ SUCCESS: 100% REGRESSION PASSED — READY FOR PRESENTATION & EVALUATION!\x1b[0m\n");
        process.exit(0);
    } else {
        console.log("\n  \x1b[31m✘ ATTENTION: One or more test suites failed.\x1b[0m\n");
        process.exit(1);
    }
}

main().catch(err => {
    console.error("Runner Fatal Error:", err);
    process.exit(1);
});
