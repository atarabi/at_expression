({
    load(force = false) {
        const LIB = $.__Atarabi = $.__Atarabi || {};
        if (!force && LIB.Property) {
            return LIB.Property;
        }
        const LINE_OFFST = 3;
        function getCallerPosition() {
            const s = new Error().stack;
            const lines = s.split(/\r?\n/);
            let index = lines.findIndex(line => line.includes("getCallerPosition"));
            if (index === -1) {
                index = lines[0].startsWith("Error") ? 1 : 0;
            }
            const line = lines[index + 2];
            const m = line.match(/:(\d+):(\d+)\)?$/);
            return [+m[1] - (LINE_OFFST + 1), +m[2] - 1];
        }
        function getPropertyIndices(property) {
            const indices = [];
            let parent = property;
            while (true) {
                if (parent instanceof Layer) {
                    indices.push(parent.index);
                    break;
                }
                else {
                    indices.push(parent.propertyIndex);
                }
                parent = parent.propertyGroup(1);
            }
            return indices.reverse();
        }
        function bakeValue(property, time, preExpression) {
            throw JSON.stringify({
                namespace: "@expression",
                scope: "@property",
                action: "bakeValue",
                payload: {
                    position: getCallerPosition(),
                    indices: getPropertyIndices(property),
                    time,
                    preExpression,
                },
            });
        }
        const lib = {
            bakeValue,
        };
        LIB.Property = lib;
        return lib;
    },
})
