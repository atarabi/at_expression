const { TextStyle } = footage("@text.jsx").sourceData.load();
TextStyle()
    .transform(text => text.toUpperCase())
    .apply();
