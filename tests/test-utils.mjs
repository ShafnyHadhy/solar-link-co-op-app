// tests/test-utils.mjs
// Shared test configuration, test users, and terminal assertion helper

export const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:8081";

export const TEST_USERS = {
    manager: "user_3HnMViHnOX0xdAbqgJvChF0B9gm",      // Mohamed Shafny (Manager)
    technician: "user_3IHfICokymVrhEPN8Duj05YgYYO",   // Azmil Ahamed (Technician)
    household: "user_3ILsaJEVzdPaoUSIghnlc0Lv1t9",    // Neth Sami (Household)
    solar_owner: "user_3IIi0KG9N6hVutyWCIjaK2dNYey",  // Agash Jeeva (Solar Owner)
    ghost: "user_ghost_99999999999999"                 // Nonexistent user
};

export class TestRunner {
    constructor(suiteName) {
        this.suiteName = suiteName;
        this.total = 0;
        this.passed = 0;
        this.failed = 0;
        this.failures = [];
        this.startTime = Date.now();
    }

    printHeader() {
        console.log("\n" + "=".repeat(75));
        console.log(`  SUITE: ${this.suiteName.toUpperCase()}`);
        console.log(`  Target: ${BASE_URL}`);
        console.log(`  Started: ${new Date().toLocaleTimeString()}`);
        console.log("=".repeat(75) + "\n");
    }

    async test(name, fn) {
        this.total++;
        const testStart = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - testStart;
            if (result === true || (result && result.passed !== false)) {
                this.passed++;
                console.log(`  \x1b[32m[PASS]\x1b[0m ${name} \x1b[90m(${duration}ms)\x1b[0m`);
                return true;
            } else {
                this.failed++;
                const msg = result?.message || "Assertion failed";
                console.error(`  \x1b[31m[FAIL]\x1b[0m ${name} -> ${msg}`);
                this.failures.push({ name, error: msg });
                return false;
            }
        } catch (err) {
            this.failed++;
            console.error(`  \x1b[31m[FAIL]\x1b[0m ${name} -> Error: ${err.message}`);
            this.failures.push({ name, error: err.message });
            return false;
        }
    }

    printSummary() {
        const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        console.log("\n" + "-".repeat(75));
        console.log(`  SUMMARY: ${this.suiteName}`);
        console.log(`  Total: ${this.total} | Passed: \x1b[32m${this.passed}\x1b[0m | Failed: ${this.failed > 0 ? `\x1b[31m${this.failed}\x1b[0m` : "0"} | Time: ${totalDuration}s`);
        console.log("-".repeat(75));

        if (this.failures.length > 0) {
            console.log("\n  \x1b[31mFailures:\x1b[0m");
            this.failures.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
            return false;
        }
        console.log(`  \x1b[32m✔ All tests in ${this.suiteName} passed successfully!\x1b[0m\n`);
        return true;
    }
}
