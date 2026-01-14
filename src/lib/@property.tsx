({
    load(force: boolean = false): Atarabi.Property.Lib {

        const LIB = $.__Atarabi = $.__Atarabi || {} as _HelperObject["__Atarabi"];
        if (!force && LIB.Property) {
            return LIB.Property;
        }

        const LINE_OFFST = 3;

        function getRootPosition(): [number, number] {
            const s = new Error().stack;
            const i = s.lastIndexOf("\n");
            const line = i >= 0 ? s.slice(i + 1) : s;
            const m = line.match(/:(\d+):(\d+)\)?$/);
            return [+m[1] - (LINE_OFFST + 1), +m[2] - 1];
        }

        function getPropertyIndices(property: Property): number[] {
            const indices: number[] = [];
            let parent: Property | Group | Layer = property;
            while (true) {
                if (parent instanceof Layer) {
                    indices.push(parent.index);
                    break;
                } else {
                    indices.push(parent.propertyIndex);
                }
                parent = parent.propertyGroup(1);
            }
            return indices.reverse();
        }

        function bakeValue(property: Property, time: number, preExpression: boolean): number | number[] | string {
            throw JSON.stringify({
                namespace: "@expression",
                scope: "@property",
                action: "bakeValue",
                payload: {
                    position: getRootPosition(),
                    indices: getPropertyIndices(property),
                    time,
                    preExpression,
                },
            } satisfies Atarabi.Property.BakeValueAction);
        }

        const lib = {
            bakeValue,
        } satisfies Atarabi.Property.Lib;

        LIB.Property = lib;

        return lib;

    },
})