export { };

const { TextStyle } = footage("@text.lib.jsx").sourceData.load();

TextStyle().byRegExp()
    .rule(/(\p{Script=Han})\p{Script=Han}*/gu, { applyFill: false, applyStroke: true, strokeColor: [1, 1, 0], strokeWidth: 2 })
    .apply();
