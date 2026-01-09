export { };

const { TextStyle } = footage("@text.jsx").sourceData.load();

TextStyle({
    tsume: 10,
    fontSize: 100,
    isFauxBold: true,
}).apply();