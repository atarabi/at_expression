const { Assert, Test } = footage("@test.jsx").sourceData.load();
Test.describe("Assert", () => {
    Test.describe("equal", () => {
        Test.test("primitive equality", () => {
            Assert.equal(5, 5);
            Assert.equal(-2.5, -2.5);
            Assert.equal("abc", "abc");
            Assert.equal(true, true);
            Assert.equal(null, null);
            Assert.equal(undefined, undefined);
            Assert.throws(() => Assert.equal(5, 6));
            Assert.throws(() => Assert.equal("a", "b"));
            Assert.throws(() => Assert.equal(true, false));
            Assert.throws(() => Assert.equal(null, undefined));
        });
        Test.test("reference types are not equal", () => {
            Assert.throws(() => Assert.equal({}, {}));
            Assert.throws(() => Assert.equal([], []));
        });
        Test.test("NaN handling", () => {
            Assert.throws(() => Assert.equal(NaN, NaN));
        });
    });
    Test.describe("deepEqual", () => {
        Test.test("flat objects", () => {
            Assert.deepEqual({ a: 1 }, { a: 1 });
            Assert.deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 });
            Assert.throws(() => Assert.deepEqual({ a: 1 }, { a: 2 }));
            Assert.throws(() => Assert.deepEqual({ a: 1 }, { a: 1, b: 2 }));
        });
        Test.test("nested objects", () => {
            Assert.deepEqual({ a: { b: { c: 3 } } }, { a: { b: { c: 3 } } });
            Assert.throws(() => Assert.deepEqual({ a: { b: { c: 3 } } }, { a: { b: { c: 4 } } }));
        });
        Test.test("arrays", () => {
            Assert.deepEqual([1, 2, 3], [1, 2, 3]);
            Assert.deepEqual([[1], [2, 3]], [[1], [2, 3]]);
            Assert.throws(() => Assert.deepEqual([1, 2], [1, 2, 3]));
        });
        Test.test("mixed structures", () => {
            Assert.deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] });
        });
        Test.test("circular reference throws", () => {
            const a = {};
            a.self = a;
            const b = {};
            b.self = b;
            Assert.throws(() => Assert.deepEqual(a, b));
        });
    });
    Test.describe("near", () => {
        Test.test("numbers", () => {
            Assert.near(1, 1.0000001, 1e-5);
            Assert.throws(() => Assert.near(1, 1.1, 1e-5));
        });
        Test.test("arrays", () => {
            Assert.near([1, 2], [1.000001, 2.000001], 1e-4);
            Assert.throws(() => Assert.near([1, 2], [1, 2, 3], 1e-4));
        });
        Test.test("nested arrays", () => {
            Assert.near([[1, 2], [3]], [[1.000001, 2.000001], [3.000001]], 1e-4);
        });
        Test.test("default eps", () => {
            Assert.near(1, 1 + 1e-7);
        });
    });
    Test.describe("throws", () => {
        Test.test("throws correctly", () => {
            Assert.throws(() => { throw new Error("x"); });
        });
        Test.test("fails if no throw", () => {
            Assert.throws(() => {
                Assert.throws(() => { });
            });
        });
    });
});
Test.run();
