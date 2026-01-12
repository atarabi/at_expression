interface Global extends Atarabi.Test.FootageProvider { }

interface Layer extends Atarabi.Test.FootageProvider { }

declare namespace Atarabi {

    namespace Test {

        interface FootageProvider {
            footage(name: "@test.jsx"): Footage<{
                load(): Lib;
            }>;
        }

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
