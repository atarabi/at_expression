

//

export { };

const Effect = footage("@effect.jsx").sourceData.load();

const ramp = Effect.create({name: "Ramp", matchName: "ADBE Ramp", parameters: {
    "ADBE Ramp-0002": {
        value: [1, 0, 0, 1],
    },
    "ADBE Ramp-0004": {
        value: [1, 1, 0, 1],
    },
}});
