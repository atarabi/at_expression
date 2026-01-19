export { };

const { TextStyle } = footage("@text.lib.jsx").sourceData.load();

TextStyle()
    .transform(text => text.toUpperCase())
    .apply();
