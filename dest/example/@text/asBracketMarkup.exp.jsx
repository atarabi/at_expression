const { TextStyle } = footage("@text.lib.jsx").sourceData.load();
TextStyle().asBracketMarkup([
    { open: "((", close: "))", style: { fillColor: [1, 0, 0] } },
    { open: "[[", close: "]]", style: { fillColor: [0, 1, 0] } },
    { open: "{{", close: "}}", style: { fillColor: [0, 0, 1] } },
])
    .apply();
