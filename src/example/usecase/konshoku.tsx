export { };

const Effect = footage("@effect.jsx").sourceData.load();
const Font = footage("@font.jsx").sourceData.load();
const { CharClass, TextStyle } = footage("@text.jsx").sourceData.load();

const fonts = Font.bakeFavorites();

const pseudo = Effect.Pseudo("Konshoku")
    // global
    .groupStart("Global")
    .floatSlider("Font Size", 100, 0, 2000, 0, 500)
    .groupEnd()
    // Hiragana
    .groupStart("Hiragana")
    .popup("Hiragana Font", 1, fonts)
    .percent("Hiragana Font Size", 100, 0, 1000, 0, 200)
    .color("Hiragana Color", { red: 255, green: 255, blue: 255})
    .groupEnd()
    // Katakana
    .groupStart("Katakana")
    .popup("Katakana Font", 1, fonts)
    .percent("Katakana Font Size", 100, 0, 1000, 0, 200)
    .color("Katakana Color", { red: 255, green: 255, blue: 255 })
    .groupEnd()

    // Kanji
    .groupStart("Kanji")
    .popup("Kanji Font", 1, fonts)
    .percent("Kanji Font Size", 100, 0, 1000, 0, 200)
    .color("Kanji Color", { red: 255, green: 255, blue: 255 })
    .groupEnd()
    .create();

TextStyle({
    fontSize: pseudo("Font Size").value,
    applyFill: true,
    applyStroke: false,
})
    .byCharClass({ mode: "exclusive" })
    .rule(CharClass.Hiragana, {
        font: fonts[pseudo("Hiragana Font").value - 1],
        fontSize: pseudo("Font Size").value * pseudo("Hiragana Font Size").value / 100,
        fillColor: pseudo("Hiragana Color").value.slice(0, 3) as [number, number, number],
    })
    .rule([CharClass.Katakana, CharClass.Yakumono], {
        font: fonts[pseudo("Katakana Font").value - 1],
        fontSize: pseudo("Font Size").value * pseudo("Katakana Font Size").value / 100,
        fillColor: pseudo("Katakana Color").value.slice(0, 3) as [number, number, number],
    })
    .rule(CharClass.Kanji, {
        font: fonts[pseudo("Kanji Font").value - 1],
        fontSize: pseudo("Font Size").value * pseudo("Kanji Font Size").value / 100,
        fillColor: pseudo("Kanji Color").value.slice(0, 3) as [number, number, number],
    })
    .apply();