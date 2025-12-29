const { CharClass, TextStyle } = footage("@text.jsx").sourceData.load();
TextStyle.compose()
    .add(TextStyle.byCharClass()
    .rule(CharClass.Kanji, { fontSize: 100 }))
    .add(TextStyle.byLine()
    .rule(0, { applyFill: true, applyStroke: false, fillColor: [0.2, 0.3, 0.4], fontSize: 30 }))
    .add(TextStyle.bySurrounding("「", "」")
    .rule({ applyFill: false, applyStroke: true, strokeColor: [0.5, 0.8, 0.9], strokeWidth: 10, fontSize: 50 }))
    .apply();
