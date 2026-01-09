const { TextStyle } = footage("@text.jsx").sourceData.load();
TextStyle().bySurrounding("「", "」", { defaultTarget: "all" })
    .rule(1, { applyFill: false, applyStroke: true, strokeColor: [1, 0, 1], strokeWidth: 20 })
    .apply();
