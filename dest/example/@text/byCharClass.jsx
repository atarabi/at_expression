const { CharClass, TextStyle } = footage("@text.jsx").sourceData.load();
TextStyle().byCharClass()
    .rule(CharClass.Hiragana, { fillColor: [1, 0, 0], fontSize: 50 })
    .rule([CharClass.Katakana, CharClass.Yakumono], { fillColor: [0, 1, 0], fontSize: 40 })
    .rule(CharClass.Kanji, { fillColor: [0, 0, 1], fontSize: 70 })
    .rule(CharClass.Latin, { applyFill: false, applyStroke: true, strokeColor: [1, 1, 0] })
    .apply();
