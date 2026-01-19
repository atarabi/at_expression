const { TextStyle } = footage("@text.lib.jsx").sourceData.load();
TextStyle().bySearch({ caseSensitive: false })
    .rule("AE", { applyFill: false, applyStroke: true, strokeColor: [1, 1, 0], strokeWidth: 2 })
    .apply();
