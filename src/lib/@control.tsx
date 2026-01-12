({
    load(force: boolean = false): Atarabi.Control.Lib {

        const LIB = $.__Atarabi = $.__Atarabi || {} as _HelperObject["__Atarabi"];
        if (!force && LIB.Control) {
            return LIB.Control;
        }

        function create(settings: Atarabi.Control.SettingsWithType): Property {
            switch (settings.type) {
                case "3D Point":
                    return ThreeDPoint(settings);
                case "Angle":
                    return Angle(settings);
                case "Checkbox":
                    return Checkbox(settings);
                case "Color":
                    return Color(settings);
                case "Dropdown Menu":
                    return DropdownMenu(settings);
                case "Layer":
                    return Layer(settings);
                case "Point":
                    return Point(settings);
                case "Slider":
                    return Slider(settings);
            }

            throw new Error(`Invalid type: ${(settings as any).type}`);
        }

        function hasOwn(obj: any, key: string) {
            return Object.prototype.hasOwnProperty.call(obj, key);
        }

        function checkName(settings: { name: string }) {
            if (typeof settings.name !== "string") throw new Error(`name must be string: ${settings.name}`);
        }

        function checkExpression(settings: { expression?: string }) {
            if (hasOwn(settings, "expression") && typeof settings.expression !== "string") throw new Error(`expression must be string: ${settings.expression}`);
        }

        function getEffect(settings: Atarabi.Control.SettingsWithType) {
            let effect: Effect = null;
            try {
                effect = thisLayer.effect(settings.name);
            } catch (e) {
                throw JSON.stringify( {
                    namespace: "@expression",
                    scope: "@control",
                    action: "create",
                    payload: settings,
                } satisfies Atarabi.Control.CreateAction );
            }
            return effect;
        }

        const THREED_POINT_CONTROL_MATCH_NAME = "ADBE Point3D Control";

        function ThreeDPoint(settings: Atarabi.Control.ThreeDPointSettings): Property {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                const v = settings.value;
                if (!(Array.isArray(v) && v.length === 3 && typeof v[0] === "number" && typeof v[1] === "number" && typeof v[2] === "number")) {
                    throw new Error(`value must be [number, number, number]: ${settings.value}`);
                }
            }
            return getEffect({ type: "3D Point", ...settings })(1);
        }

        function Angle(settings: Atarabi.Control.AngleSettings): Property {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                if (typeof settings.value !== "number") {
                    throw new Error(`value must be number: ${settings.value}`);
                }
            }
            return getEffect({ type: "Angle", ...settings })(1);
        }

        function Checkbox(settings: Atarabi.Control.CheckboxSettings): Property {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                if (!(typeof settings.value === "number" || typeof settings.value === "boolean")) {
                    throw new Error(`value must be boolean or number: ${settings.value}`);
                }
            }
            return getEffect({ type: "Checkbox", ...settings })(1);
        }

        function Color(settings: Atarabi.Control.ColorSettings): Property {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                const v = settings.value;
                if (!(Array.isArray(v) && v.length === 4 && typeof v[0] === "number" && typeof v[1] === "number" && typeof v[2] === "number" && typeof v[3] === "number")) {
                    throw new Error(`value must be [number, number, number]: ${settings.value}`);
                }
            }
            return getEffect({ type: "Color", ...settings })(1);
        }

        function DropdownMenu(settings: Atarabi.Control.DropdownMenuSettings): Property {
            checkName(settings);
            checkExpression(settings);
            if (!(Array.isArray(settings.items) && settings.items.every(item => typeof item === 'string'))) {
                    throw new Error(`items must be string[]: ${settings.value}`);
            }
            if (hasOwn(settings, "value")) {
                if (typeof settings.value !== "number") {
                    throw new Error(`value must be number: ${settings.value}`);
                }
            }
            return getEffect({ type: "Dropdown Menu", ...settings })(1);
        }

        function Layer(settings: Atarabi.Control.LayerSettings): Property {
            checkName(settings);
            return null;
        }

        function Point(settings: Atarabi.Control.PointSettings): Property {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                const v = settings.value;
                if (!(Array.isArray(v) && v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number")) {
                    throw new Error(`value must be [number, number, number]: ${settings.value}`);
                }
            }
            return getEffect({ type: "Point", ...settings })(1);
        }

        function Slider(settings: Atarabi.Control.SliderSettings): Property {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                if (typeof settings.value !== "number") {
                    throw new Error(`value must be number: ${settings.value}`);
                }
            }
            return getEffect({ type: "Slider", ...settings })(1);
        }

        const lib = {
            create,
            ThreeDPoint,
            Angle,
            Checkbox,
            Color,
            DropdownMenu,
            Layer,
            Point,
            Slider,
        } satisfies Atarabi.Control.Lib;

        LIB.Control = lib;

        return lib;

    },
})