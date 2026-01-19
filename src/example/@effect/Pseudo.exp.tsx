export { };

const Effect = footage("@effect.lib.jsx").sourceData.load();

const pseudo = Effect.Pseudo("Master")
    .layer("Layer", 0)
    .angle("Angle", 90)
    .path("Path")
    .create();

pseudo(2);
