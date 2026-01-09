export { };

const { TextStyle } = footage("@text.jsx").sourceData.load();

TextStyle().forEachRegExp(/\p{Script=Han}+/gu, (m, ctx) => {
    if (m[0].length > 1) {
        return { from: 0, count: 1, style: { fillColor: [1, 0, 0] } };
    }
}).apply();
