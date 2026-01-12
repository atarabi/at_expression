export { };

const Pseudo = footage("@pseudo.jsx").sourceData.load();

const pseudo = Pseudo("Master")
    .layer("Layer", 0)
    .angle("Angle", 90)
    .path("Path")
    .create();

pseudo(2);
