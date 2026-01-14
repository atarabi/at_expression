// Depends on @script(https://github.com/atarabi/at_script) and @expression(Startup)
interface _FootageProvider {
    footage(name: "@property.jsx"): Footage<{
        load(force?: boolean): Atarabi.Property.Lib;
    }>;
}

declare namespace Atarabi {

    namespace Expression {

        interface Cache {
            Property: Atarabi.Property.Lib;
        }

    }

    namespace Property {

        interface Lib {
            // property must be in thisComp
            bakeValue(property: Property, time: number, preExpression: boolean): number | number[] | string | { closed: boolean; vertices: [number, number][]; inTangents: [number, number][]; outTangents: [number, number][]; };
        }

        interface BakeValueAction extends Expression.Action {
            scope: "@property";
            action: "bakeValue";
            payload: {
                position: [line: number, column: number];
                indices: number[];
                time: number;
                preExpression: boolean;
            };
        }

    }

}
