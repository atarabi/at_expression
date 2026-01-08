export { };

const { TextStyle } = footage("@text.jsx").sourceData.load();

const kanjiRe = /^\p{Script=Han}/u;

TextStyle.forEachSentence((w, ctx) => {
    if (kanjiRe.test(w)) {
        return { from: 0, count: 1, style: { fillColor: [1, 0, 0] } };
    }
}).apply();