export { };

const { TextStyle } = footage("@text.lib.jsx").sourceData.load();

TextStyle().byLine()
    .rule(0, { applyFill: true, fillColor: [1, 0, 0], fontSize: 50 })
    .rule({from:1 , count: 2}, { applyFill: false, applyStroke: true, strokeColor: [1, 1, 0], fontSize: 100 })
    .apply();