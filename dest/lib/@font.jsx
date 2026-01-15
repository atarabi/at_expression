({
    load(force = false) {
        const LIB = $.__Atarabi = $.__Atarabi || {};
        if (!force && LIB.Font) {
            return LIB.Font;
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
        function bakeFavorites() {
            throw JSON.stringify({
                namespace: "@expression",
                scope: "@font",
                action: "bakeFavorites",
                payload: getCallerPosition(),
            });
        }
        function bakeAll() {
            throw JSON.stringify({
                namespace: "@expression",
                scope: "@font",
                action: "bakeAll",
                payload: getCallerPosition(),
            });
        }
        const lib = {
            bakeFavorites,
            bakeAll,
        };
        LIB.Font = lib;
        return lib;
    },
})
