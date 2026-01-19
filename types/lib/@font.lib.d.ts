// Depends on @script(https://github.com/atarabi/at_script) and @expression(Startup)
interface _FootageProvider {
    footage(name: "@font.lib.jsx"): Footage<{
        load(force?: boolean): Atarabi.Font.Lib;
    }>;
}

declare namespace Atarabi {

    namespace Expression {

        interface Cache {
            Font: Atarabi.Font.Lib;
        }

    }

    namespace Font {

        interface Lib {
            bakeFavorites(): string[];
            bakeAll(): string[];
        }

        interface BakeFavoritesAction extends Expression.Action {
            scope: "@font";
            action: "bakeFavorites";
            payload: [line: number, column: number];
        }

        interface BakeAllAction extends Expression.Action {
            scope: "@font";
            action: "bakeAll";
            payload: [line: number, column: number];
        }

    }

}
