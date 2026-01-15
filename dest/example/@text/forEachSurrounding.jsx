const { TextStyle } = footage("@text.jsx").sourceData.load();
TextStyle().forEachSurrounding("(", ")", (text, ctx) => {
    return { from: 1, count: text.length - 2, style: { fillColor: [1, 0, 0] } };
}).apply();
