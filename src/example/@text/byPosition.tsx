export { };

const { CharClass, TextStyle } = footage("@text.jsx").sourceData.load();

TextStyle().byPosition({ mode: "line", skipWhen: CharClass.InlineWhitespace })
    .rule({from:0 , count: 5}, { fillColor: [1, 0, 0], fontSize: 50 })
    .rule({from:3 , count: 6}, { fillColor: [1, 1, 0], fontSize: 100 })
    .rule(index => index % 2 === 0, { fillColor: [1, 0, 0] })
    .rule(0, { fontSize: 300 })
    .apply();