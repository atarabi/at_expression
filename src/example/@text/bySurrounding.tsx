export { };

const { TextStyle } = footage("@text.jsx").sourceData.load();

TextStyle.bySurrounding("「", "」", { depth: 0 })
    .rule({ applyFill: false, applyStroke: true, strokeColor: [1, 0, 1], strokeWidth: 20 })
    .apply();