export { };

const { TextStyle } = footage("@text.jsx").sourceData.load();

TextStyle().forEachGrapheme((g, ctx) => {
    if ((ctx.indexInLine + ctx.line) % 2 === 0) {
        return { applyFill: true, applyStroke: false, fillColor: [ctx.indexInLine / Math.max(1, (ctx.itemsInLine - 1)), 0.4, 0.2] };
    } else {
        return { applyFill: false, applyStroke: true, strokeColor: [0.2, ctx.line / Math.max(1, (ctx.totalLines - 1)), 0.4], strokeWidth: 5 };
    }
}).apply();