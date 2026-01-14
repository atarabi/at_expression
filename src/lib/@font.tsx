({
    load(force: boolean = false): Atarabi.Font.Lib {

        const LIB = $.__Atarabi = $.__Atarabi || {} as _HelperObject["__Atarabi"];
        if (!force && LIB.Font) {
            return LIB.Font;
        }

        const LINE_OFFST = 3;

        function getRootPosition(): [number, number] {
            const s = new Error().stack;
            const i = s.lastIndexOf("\n");
            const line = i >= 0 ? s.slice(i + 1) : s;
            const m = line.match(/:(\d+):(\d+)\)?$/);
            return [+m[1] - (LINE_OFFST + 1), +m[2] - 1];
        }

        function bakeFavorites(): string[] {
            throw JSON.stringify({
                namespace: "@expression",
                scope: "@font",
                action: "bakeFavorites",
                payload: getRootPosition(),
            } satisfies Atarabi.Font.BakeFavoritesAction);
        }

        function bakeAll(): string[] {
            throw JSON.stringify({
                namespace: "@expression",
                scope: "@font",
                action: "bakeAll",
                payload: getRootPosition(),
            } satisfies Atarabi.Font.BakeAllAction);
        }

        const lib = {
            bakeFavorites,
            bakeAll,
        } satisfies Atarabi.Font.Lib;

        LIB.Font = lib;

        return lib;

    },
})