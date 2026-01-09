const { TextStyle } = footage("@text.jsx").sourceData.load();
TextStyle().forEachLine((line, index, total) => {
    if (index % 2 === 0) {
        return { applyFill: true, applyStroke: false, fillColor: [0.8, 0.4, 0.2] };
    }
    else {
        return { applyFill: false, applyStroke: true, strokeColor: [0.2, 0.7, 0.4], strokeWidth: 5 };
    }
}).apply();
