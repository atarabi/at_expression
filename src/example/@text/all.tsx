export { };

const { TextStyle } = footage("@text.jsx").sourceData.load();

TextStyle.all({
    tsume: 10,
    fontSize: 100,
    isFauxBold: true,
}).apply();