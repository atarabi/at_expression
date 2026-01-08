interface Global {
    footage(name: "@test.jsx"): Footage<{
        load(): Atarabi.test.Lib;
    }>;
}

interface Layer {
    footage(name: "@test.jsx"): Footage<{
        load(): Atarabi.test.Lib;
    }>;
}

declare namespace Atarabi {

    namespace test {

        interface Lib {
            Assert: Assert;
            Test: Test;
        }

        type NumericTree = number | NumericTree[];

        interface Assert {
            equal(a: any, b: any, msg?: string): void;
            deepEqual(a: any, b: any, msg?: string): void;
            near(a: NumericTree, b: NumericTree, eps?: number, msg?: string): void;
            throws(fn: () => void, msg?: string): void;
        }

        interface Test {
            describe(name: string, fn: () => void): void;
            test(name: string, fn: () => void): void;
            run(): string;
        }

    }

}
