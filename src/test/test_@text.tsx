export { };

const { CharClass, __internal: { annotateByCharClass: splitByCharClass } } = footage("@text.jsx").sourceData.load(true);
const { Assert, Test } = footage("@test.jsx").sourceData.load();

Test.describe("splitByCharClass", () => {

    Test.test("basic split with CharClass", () => {
        const text = "こんにちはHello123😊!!!";
        const splits = splitByCharClass(text, [
            CharClass.Hiragana,
            CharClass.Latin,
            CharClass.Number,
            CharClass.Emoji,
        ]);

        Assert.deepEqual(splits, [
            { from: 0, to: 5, index: 0 },   // こんにちは
            { from: 5, to: 10, index: 1 },  // Hello
            { from: 10, to: 13, index: 2 }, // 123
            { from: 13, to: 15, index: 3 }, // 😊
            { from: 15, to: 18, index: -1 } // !!!
        ]);
    });

    Test.test("nested CharMatcher array", () => {
        const text = "abcあいう123";
        const splits = splitByCharClass(text, [
            [CharClass.Latin, CharClass.Hiragana],
            CharClass.Number
        ]);

        Assert.deepEqual(splits, [
            { from: 0, to: 6, index: 0 }, // abcあいう
            { from: 6, to: 9, index: 1 }  // 123
        ]);
    });

    Test.test("custom RegExp matcher", () => {
        const text = "aa11!!";
        const splits = splitByCharClass(text, [
            /a+/,
            /1+/,
            /!+/
        ]);

        Assert.deepEqual(splits, [
            { from: 0, to: 2, index: 0 }, // aa
            { from: 2, to: 4, index: 1 }, // 11
            { from: 4, to: 6, index: 2 }  // !!
        ]);
    });

    Test.test("unmatched characters are grouped", () => {
        const text = "abc@@@xyz";
        const splits = splitByCharClass(text, [
            CharClass.Latin
        ]);

        Assert.deepEqual(splits, [
            { from: 0, to: 3, index: 0 },  // abc
            { from: 3, to: 6, index: -1 }, // @@@
            { from: 6, to: 9, index: 0 }   // xyz
        ]);
    });

});

Test.run();