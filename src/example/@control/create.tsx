export { };

const Control = footage("@control.jsx").sourceData.load();
const slider = Control.Slider({ name: "Scale", value: 200 });
slider.value;