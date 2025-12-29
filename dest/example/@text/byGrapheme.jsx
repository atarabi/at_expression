const { TextStyle } = footage("@text.jsx").sourceData.load();
TextStyle.byGrapheme()
    .rule((g, ctx) => (ctx.index + ctx.line) % 2 === 0, { applyFill: false, applyStroke: true, strokeColor: [0.2, 0.8, 0.7], strokeWidth: 3 })
    .rule((g, ctx) => (ctx.index + ctx.line) % 2 === 1, { applyFill: true, applyStroke: false, fillColor: [0.8, 0.5, 0.3] })
    .apply();
