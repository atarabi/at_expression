({
    load(force: boolean = false): Atarabi.Effect.Lib {

        const LIB = $.__Atarabi = $.__Atarabi || {} as _HelperObject["__Atarabi"];
        if (!force && LIB.Effect) {
            return LIB.Effect;
        }

        const MSG = {
            TYPE_MISMATCH: (key: string, expected: string, actual: any) =>
                `Expected "${key}" to be ${expected}, but got: "${actual}"`,
        } as const;

        const EXPECTED = {
            BOOLEAN: "a boolean (true/false)",
            NUMBER: "a number",
            COLOR: "a color array [number, number, number, number]",
            TWO_D: "a 2d array [number, number]",
            THREE_D: "a 3d array [number, number, number]",
            STRING: "a string",
        } as const;

        // effect
        function create(name: string, matchName?: string, parameters?: { [name: string]: { value?: any; expression?: string; } }) {
            let effect: Effect = null;
            try {
                effect = thisLayer.effect(name);
            } catch (e) {
                if (typeof name !== "string") {
                    throw new Error(MSG.TYPE_MISMATCH("name", EXPECTED.STRING, name));
                }
                if (matchName != null && typeof matchName !== "string") {
                    throw new Error(MSG.TYPE_MISMATCH("matchName", EXPECTED.STRING, matchName));
                }

                throw JSON.stringify({
                    namespace: "@expression",
                    scope: "@effect",
                    action: "createEffect",
                    payload: {
                        name,
                        matchName: matchName ?? name,
                        ...(parameters != null && { parameters }),
                    },
                } satisfies Atarabi.Effect.CreateEffectAction);
            }
            return effect;
        }

        // expression control
        function ExpressionControl(settings: Atarabi.Effect.ExpressionControlSettings): Property {
            switch (settings.type) {
                case "3D Point":
                    return ThreeDPoint(settings.name, settings.value, settings.expression);
                case "Angle":
                    return Angle(settings.name, settings.value, settings.expression);
                case "Checkbox":
                    return Checkbox(settings.name, settings.value, settings.expression);
                case "Color":
                    return Color(settings.name, settings.value, settings.expression);
                case "Dropdown Menu":
                    return DropdownMenu(settings.name, settings.items, settings.value, settings.expression);
                case "Layer":
                    return Layer(settings.name);
                case "Point":
                    return Point(settings.name, settings.value, settings.expression);
                case "Slider":
                    return Slider(settings.name, settings.value, settings.expression);
            }

            throw new Error(`Invalid type: ${(settings as any).type}`);
        }

        function checkName(name: string) {
            if (typeof name !== "string") throw new Error(MSG.TYPE_MISMATCH("name", EXPECTED.STRING, name));
        }

        function checkExpression(expression?: string) {
            if (expression != null && typeof expression !== "string") throw new Error(MSG.TYPE_MISMATCH("expression", EXPECTED.STRING, expression));
        }

        function getExpressionControl(settings: Atarabi.Effect.ExpressionControlSettings) {
            let effect: Effect = null;
            try {
                effect = thisLayer.effect(settings.name);
            } catch (e) {
                throw JSON.stringify({
                    namespace: "@expression",
                    scope: "@effect",
                    action: "createExpressionControl",
                    payload: settings,
                } satisfies Atarabi.Effect.CreateExpressionControlAction);
            }
            return effect;
        }

        function ThreeDPoint(name: string, value?: [x: number, y: number, z: number], expression?: string): Property {
            checkName(name);
            checkExpression(expression);
            if (value != null) {
                if (!(Array.isArray(value) && value.length === 3 && typeof value[0] === "number" && typeof value[1] === "number" && typeof value[2] === "number")) {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.THREE_D, value));
                }
            }
            return getExpressionControl({
                type: "3D Point",
                name,
                ...(value != null && { value }),
                ...(expression != null && { expression }),
            })(1);
        }

        function Angle(name: string, value?: number, expression?: string): Property {
            checkName(name);
            checkExpression(expression);
            if (value != null) {
                if (typeof value !== "number") {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.NUMBER, value));
                }
            }
            return getExpressionControl({
                type: "Angle",
                name,
                ...(value != null && { value }),
                ...(expression != null && { expression }),
            })(1);
        }

        function Checkbox(name: string, value?: boolean | number, expression?: string): Property {
            checkName(name);
            checkExpression(expression);
            if (value != null) {
                if (!(typeof value === "number" || typeof value === "boolean")) {
                    throw new Error(MSG.TYPE_MISMATCH("value", 'a boolean (true/false) or number (0/1)', value));
                }
            }
            return getExpressionControl({
                type: "Checkbox",
                name,
                ...(value != null && { value }),
                ...(expression != null && { expression }),
            })(1);
        }

        function Color(name: string, value?: [red: number, green: number, blue: number, alpha: number], expression?: string): Property {
            checkName(name);
            checkExpression(expression);
            if (value != null) {
                if (!(Array.isArray(value) && value.length === 4 && typeof value[0] === "number" && typeof value[1] === "number" && typeof value[2] === "number" && typeof value[3] === "number")) {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.COLOR, value));
                }
            }
            return getExpressionControl({
                type: "Color",
                name,
                ...(value != null && { value }),
                ...(expression != null && { expression }),
            })(1);
        }

        function DropdownMenu(name: string, items: string[], value?: number, expression?: string): Property {
            checkName(name);
            checkExpression(expression);
            if (!(Array.isArray(items) && items.every(item => typeof item === 'string'))) {
                throw new Error(MSG.TYPE_MISMATCH("items", `a string array string[]`, items));
            }
            if (value != null) {
                if (typeof value !== "number") {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.NUMBER, value));
                }
            }
            return getExpressionControl({
                type: "Dropdown Menu",
                name,
                items,
                ...(value != null && { value }),
                ...(expression != null && { expression }),
            })(1);
        }

        function Layer(name: string): Property {
            checkName(name);
            return getExpressionControl({
                type: "Layer",
                name,
            })(1);
        }

        function Point(name: string, value?: [number, number], expression?: string): Property {
            checkName(name);
            checkExpression(expression);
            if (value != null) {
                if (!(Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number")) {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.TWO_D, value));
                }
            }
            return getExpressionControl({
                type: "Point",
                name,
                ...(value != null && { value }),
                ...(expression != null && { expression }),
            })(1);
        }

        function Slider(name: string, value?: number, expression?: string): Property {
            checkName(name);
            checkExpression(expression);
            if (value != null) {
                if (typeof value !== "number") {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.NUMBER, value));
                }
            }
            return getExpressionControl({
                type: "Slider",
                name,
                ...(value != null && { value }),
                ...(expression != null && { expression }),
            })(1);
        }

        // pseudo
        class Base62 {
            static CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            static LEN = Base62.CHARS.length;
            static encode(n: number): string {
                if (n === 0) return Base62.CHARS[0];
                let result = '';
                while (n > 0) {
                    const remainder = n % Base62.LEN;
                    result = Base62.CHARS[remainder] + result;
                    n = Math.floor(n / Base62.LEN);
                }
                return result;
            }
            static decode(s: string): number {
                let num = 0;
                for (let i = 0; i < s.length; i++) {
                    const value = Base62.CHARS.indexOf(s[i]);
                    if (value === -1) {
                        throw new Error(`Invalid character found: ${s[i]}`);
                    }
                    num = num * Base62.LEN + value;
                }
                return num;
            }
        }

        type Integer = Atarabi.Effect.Pseudo.Integer;

        class PseudoBuilder {
            protected parameters: Atarabi.Effect.Pseudo.Parameter[] = [];
            protected idCache: Record<number, boolean> = {};
            constructor(protected name: string, protected matchName: string = `Pseudo/${Base62.encode(Date.now())}/${name}`) {
            }
            private validateId(id?: number) {
                if (typeof id === 'number') {
                    if (!(Number.isInteger(id) && id > 0)) {
                        throw new Error(MSG.TYPE_MISMATCH("id", "a positive integer", id));
                    }
                    if (this.idCache[id]) {
                        throw new Error(`"id" already used: "${id}"`);
                    }
                    this.idCache[id] = true;
                }
            }
            layer(name: string, dephault: PF.LayerDefault, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; }): this {
                options = { uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'layer', name, dephault, uiFlags: options.uiFlags, flags: options.flags, id: options.id });
                return this;
            }
            slider(name: string, value: Integer, validMin: Integer, validMax: Integer, sliderMin: Integer, sliderMax: Integer, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'slider', name, value, validMin, validMax, sliderMin, sliderMax, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            fixedSlider(name: string, value: number, validMin: number, validMax: number, sliderMin: number, sliderMax: number, options?: { precision?: Integer; displayFlags?: PF.ValueDisplayFlags; uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { precision: 2, displayFlags: PF.ValueDisplayFlags.None, uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'fixedSlider', name, value, validMin, validMax, sliderMin, sliderMax, precision: options.precision, displayFlags: options.displayFlags, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            angle(name: string, value: number, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'angle', name, value, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            checkbox(name: string, value: boolean, options?: { text?: string; uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { text: '', uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'checkbox', name, value, text: options.text, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            color(name: string, value: Atarabi.Effect.Pseudo.Color, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'color', name, value, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            point(name: string, xValue: number, yValue: number, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'point', name, xValue, yValue, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            popup(name: string, value: Integer, items: string[], options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'popup', name, value, items, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            floatSlider(name: string, value: number, validMin: number, validMax: number, sliderMin: number, sliderMax: number, options?: { precision?: Integer; displayFlags?: PF.ValueDisplayFlags; uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { precision: 2, displayFlags: PF.ValueDisplayFlags.None, uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'floatSlider', name, value, validMin, validMax, sliderMin, sliderMax, precision: options.precision, displayFlags: options.displayFlags, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            percent(name: string, value: number, validMin: number, validMax: number, sliderMin: number, sliderMax: number, options?: { precision?: Integer; uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { precision: 2, uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'floatSlider', name, value, validMin, validMax, sliderMin, sliderMax, precision: options.precision, displayFlags: PF.ValueDisplayFlags.Percent, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            pixel(name: string, value: number, validMin: number, validMax: number, sliderMin: number, sliderMax: number, options?: { precision?: Integer; uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { precision: 2, uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'floatSlider', name, value, validMin, validMax, sliderMin, sliderMax, precision: options.precision, displayFlags: PF.ValueDisplayFlags.Pixel, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            path(name: string, dephault?: Integer, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; }): this {
                options = { uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'path', name, dephault, uiFlags: options.uiFlags, flags: options.flags, id: options.id });
                return this;
            }
            groupStart(name: string, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; }): this {
                options = { uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'groupStart', name, uiFlags: options.uiFlags, flags: options.flags, id: options.id });
                return this;
            }
            groupEnd(options?: { id?: Integer; }): this {
                options = { id: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'groupEnd', id: options.id });
                return this;
            }
            button(name: string, buttonName: string, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; }): this {
                options = { uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'button', name, buttonName, uiFlags: options.uiFlags, flags: options.flags, id: options.id });
                return this;
            }
            point3D(name: string, xValue: number, yValue: number, zValue: number, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
                options = { uiFlags: PF.ParamUIFlags.None, flags: PF.ParamFlags.None, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'point3D', name, xValue, yValue, zValue, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            create(): Atarabi.Effect.Pseudo.PseudoEffect {
                let effect: Effect = null;
                try {
                    effect = thisLayer.effect(this.name);
                } catch {
                    throw JSON.stringify({
                        namespace: "@expression",
                        scope: "@effect",
                        action: "createPseudo",
                        payload: this.config(),
                    } satisfies Atarabi.Effect.CreatePseudoAction);
                }
                return createPseudoEffect(effect) as any;
            }
            private config(): Atarabi.Effect.Pseudo.Config {
                this.finalize();
                return { name: this.name, matchName: this.matchName, parameters: this.parameters };
            }
            private finalize() {
                let id = 0;
                const issueId = () => {
                    id++;
                    while (true) {
                        if (!this.idCache[id]) {
                            this.idCache[id] = true;
                            return id;
                        }
                        id++;
                    }
                };
                let group = 0;
                for (const parameter of this.parameters) {
                    if (parameter.type === 'groupStart') {
                        group++;
                    } else if (parameter.type === 'groupEnd') {
                        group--;
                    }
                    if (typeof parameter.id !== 'number') {
                        parameter.id = issueId();
                    }
                }
                if (group < 0) {
                    throw new Error(`too much GroupEnds: ${-group}`);
                }
                for (let i = 0; i < group; i++) {
                    const groupEnd = { type: 'groupEnd', id: issueId() } satisfies Atarabi.Effect.Pseudo.GroupEndParameter;
                    this.parameters.push(groupEnd);
                }
            }
        }

        function createPseudoEffect(effect: Effect) {
            const fn = (name: string | number) => {
                return effect(name as any);
            };
            (fn as any).param = (name: string | number) => {
                return effect(name as any);
            };
            return fn;
        }

        const lib = {
            create,
            ExpressionControl,
            ThreeDPoint,
            Angle,
            Checkbox,
            Color,
            DropdownMenu,
            Layer,
            Point,
            Slider,
            Pseudo: (name: string, matchName?: string) => new PseudoBuilder(name, matchName) as any,
        } satisfies Atarabi.Effect.Lib;

        LIB.Effect = lib;

        return lib;

    },
})