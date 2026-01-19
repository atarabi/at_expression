const { CharClass, TextStyle } = footage("@text.lib.jsx").sourceData.load();
TextStyle()
    .byCharClass()
    .rule(CharClass.Kanji, { fontSize: 100 })
    .byLine()
    .rule(0, { applyFill: true, applyStroke: false, fillColor: [0.2, 0.3, 0.4], fontSize: 30 })
    .bySurrounding("「", "」")
    .rule(1, { applyFill: false, applyStroke: true, strokeColor: [0.5, 0.8, 0.9], strokeWidth: 10, fontSize: 50 })
    .apply();
