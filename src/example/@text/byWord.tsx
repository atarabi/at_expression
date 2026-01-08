export { };

const { TextStyle } = footage("@text.jsx").sourceData.load();

const kanjiRe = /^\p{Script=Han}/u;

TextStyle.byWord()
    .rule((w, ctx) => {
        if (kanjiRe.test(w)) {
            return { from: 0, count: 1 };
        }
    }, { applyFill: false, applyStroke: true, strokeColor: [0.2, 0.8, 0.7], strokeWidth: 3 })
    .apply();