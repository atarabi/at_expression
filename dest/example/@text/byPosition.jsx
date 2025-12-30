const { TextStyle } = footage("@text.jsx").sourceData.load();
TextStyle.byPosition()
    .line()
    .countWhen("nonWhitespace")
    .rule({ from: 0, count: 5 }, { fillColor: [1, 0, 0], fontSize: 50 })
    .rule({ from: 3, count: 6 }, { fillColor: [1, 1, 0], fontSize: 100 })
    .apply();
