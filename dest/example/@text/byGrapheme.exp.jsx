const { CharClass, createMatcher, TextStyle } = footage("@text.lib.jsx").sourceData.load();
const matcher = createMatcher([CharClass.InlineWhitespace, CharClass.Punctuation]);
TextStyle().byGrapheme()
    .rule((g, ctx) => {
    return (ctx.isFirst() || matcher(ctx.prev()) && !matcher(g));
}, { applyFill: false, applyStroke: true, strokeColor: [0.2, 0.8, 0.7], strokeWidth: 3 })
    .apply();
