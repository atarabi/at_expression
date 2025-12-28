({
    load(): Atarabi.test.Lib {

        type NumericTree = Atarabi.test.NumericTree;

        function assertNoCycle(
            value: any,
            seen: WeakSet<object>,
            path: string
        ): void {
            if (typeof value !== "object" || value === null) return;

            if (seen.has(value)) {
                throw new Error(`Circular reference detected at ${path}`);
            }

            seen.add(value);

            if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    assertNoCycle(value[i], seen, `${path}[${i}]`);
                }
            } else {
                for (const k in value) {
                    assertNoCycle(value[k], seen, `${path}.${k}`);
                }
            }
        }

        function deepEqualImpl(a: any, b: any, path: string): boolean {
            if (a === b) return true;

            if (typeof a !== typeof b) return false;
            if (typeof a !== "object" || a === null || b === null) {
                // NaN 対応
                return Number.isNaN(a) && Number.isNaN(b);
            }

            if (Array.isArray(a) !== Array.isArray(b)) return false;

            if (Array.isArray(a)) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (!deepEqualImpl(a[i], b[i], `${path}[${i}]`)) return false;
                }
                return true;
            }

            const ka = Object.keys(a);
            const kb = Object.keys(b);
            if (ka.length !== kb.length) return false;

            for (const k of ka) {
                if (!(k in b)) return false;
                if (!deepEqualImpl(a[k], b[k], `${path}.${k}`)) return false;
            }

            return true;
        }

        function nearImpl(
            a: NumericTree,
            b: NumericTree,
            eps: number,
            path: string
        ): boolean {
            if (typeof a === "number" && typeof b === "number") {
                return Math.abs(a - b) <= eps;
            }

            if (Array.isArray(a) && Array.isArray(b)) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (!nearImpl(a[i], b[i], eps, `${path}[${i}]`)) {
                        return false;
                    }
                }
                return true;
            }

            return false;
        }

        const Assert: Atarabi.test.Assert = {
            equal(a, b, msg) {
                if (a !== b) {
                    throw new Error(msg || `Expected ${a} === ${b}`);
                }
            },
            deepEqual(a, b, msg) {
                assertNoCycle(a, new WeakSet(), "a");
                assertNoCycle(b, new WeakSet(), "b");

                if (!deepEqualImpl(a, b, "")) {
                    throw new Error(msg || `deepEqual failed (left=${JSON.stringify(a)}, right=${JSON.stringify(b)})`);
                }
            },
            near(a, b, eps = 1e-6, msg) {
                assertNoCycle(a, new WeakSet(), "a");
                assertNoCycle(b, new WeakSet(), "b");

                if (!nearImpl(a, b, eps, "")) {
                    throw new Error(msg || `near failed (left=${a}, right=${b}, eps=${eps})`);
                }
            },
            throws(fn, msg) {
                let thrown = false;
                try {
                    fn();
                } catch {
                    thrown = true;
                }
                if (!thrown) {
                    throw new Error(msg || "Expected function to throw");
                }
            }
        };

        const Test: Atarabi.test.Test = (() => {

            type TestCase = {
                name: string;
                fn: () => void;
            };

            const tests: TestCase[] = [];
            const groupStack: string[] = [];

            function fullName(name: string): string {
                return groupStack.length
                    ? `${groupStack.join(" / ")} / ${name}`
                    : name;
            }

            return {
                describe(name, fn) {
                    groupStack.push(name);
                    try {
                        fn();
                    } finally {
                        groupStack.pop();
                    }
                },
                test(name, fn) {
                    tests.push({
                        name: fullName(name),
                        fn
                    });
                },
                run() {
                    let passed = 0;
                    let failed = 0;
                    const lines: string[] = [];

                    for (let i = 0; i < tests.length; i++) {
                        const t = tests[i];
                        try {
                            t.fn();
                            passed++;
                            lines.push(`✔ ${t.name}`);
                        } catch (e) {
                            failed++;
                            lines.push(`✘ ${t.name}`);
                            lines.push(formatError(e));
                        }
                    }

                    lines.push(``);
                    lines.push(`Result: ${passed} passed, ${failed} failed`);

                    return lines.join("\n");
                }
            };
        })();

        function formatError(e: unknown): string {
            if (typeof e === "string") {
                return `  ${e}`;
            }
            if (e instanceof Error) {
                return `  ${e.message}`;
            }
            return `  ${String(e)}`;
        }

        const lib = {
            Assert,
            Test,
        } satisfies Atarabi.test.Lib;

        return lib;

    },
})