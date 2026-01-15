({
    load(force = false) {
        const LIB = $.__Atarabi = $.__Atarabi || {};
        if (!force && LIB.Effect) {
            return LIB.Effect;
        }
        const MSG = {
            TYPE_MISMATCH: (key, expected, actual) => `Expected "${key}" to be ${expected}, but got: "${actual}"`,
        };
        const EXPECTED = {
            BOOLEAN: "a boolean (true/false)",
            NUMBER: "a number",
            COLOR: "a color array [number, number, number, number]",
            TWO_D: "a 2d array [number, number]",
            THREE_D: "a 3d array [number, number, number]",
            STRING: "a string",
        };
        // effect
        function create(settings) {
            let effect = null;
            try {
                effect = thisLayer.effect(settings.name);
            }
            catch (e) {
                if (settings == null) {
                    throw new Error(MSG.TYPE_MISMATCH("settings", "{matchName: string; name: string;}", settings));
                }
                if (typeof settings.name !== "string") {
                    throw new Error(MSG.TYPE_MISMATCH("name", EXPECTED.STRING, settings.name));
                }
                if (typeof settings.matchName !== "string") {
                    throw new Error(MSG.TYPE_MISMATCH("matchName", EXPECTED.STRING, settings.matchName));
                }
                throw JSON.stringify({
                    namespace: "@expression",
                    scope: "@effect",
                    action: "createEffect",
                    payload: settings,
                });
            }
            return effect;
        }
        // expression control
        function ExpressionControl(settings) {
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
            throw new Error(`Invalid type: ${settings.type}`);
        }
        function hasOwn(obj, key) {
            return Object.prototype.hasOwnProperty.call(obj, key);
        }
        function checkName(settings) {
            if (typeof settings.name !== "string")
                throw new Error(MSG.TYPE_MISMATCH("name", EXPECTED.STRING, settings.name));
        }
        function checkExpression(settings) {
            if (hasOwn(settings, "expression") && typeof settings.expression !== "string")
                throw new Error(MSG.TYPE_MISMATCH("expression", EXPECTED.STRING, settings.expression));
        }
        function getExpressionControl(settings) {
            let effect = null;
            try {
                effect = thisLayer.effect(settings.name);
            }
            catch (e) {
                throw JSON.stringify({
                    namespace: "@expression",
                    scope: "@effect",
                    action: "createExpressionControl",
                    payload: settings,
                });
            }
            return effect;
        }
        function ThreeDPoint(settings) {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                const v = settings.value;
                if (!(Array.isArray(v) && v.length === 3 && typeof v[0] === "number" && typeof v[1] === "number" && typeof v[2] === "number")) {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.THREE_D, settings.value));
                }
            }
            return getExpressionControl({ type: "3D Point", ...settings })(1);
        }
        function Angle(settings) {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                if (typeof settings.value !== "number") {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.NUMBER, settings.value));
                }
            }
            return getExpressionControl({ type: "Angle", ...settings })(1);
        }
        function Checkbox(settings) {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                if (!(typeof settings.value === "number" || typeof settings.value === "boolean")) {
                    throw new Error(MSG.TYPE_MISMATCH("value", 'a boolean (true/false) or number (0/1)', settings.value));
                }
            }
            return getExpressionControl({ type: "Checkbox", ...settings })(1);
        }
        function Color(settings) {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                const v = settings.value;
                if (!(Array.isArray(v) && v.length === 4 && typeof v[0] === "number" && typeof v[1] === "number" && typeof v[2] === "number" && typeof v[3] === "number")) {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.COLOR, settings.value));
                }
            }
            return getExpressionControl({ type: "Color", ...settings })(1);
        }
        function DropdownMenu(settings) {
            checkName(settings);
            checkExpression(settings);
            if (!(Array.isArray(settings.items) && settings.items.every(item => typeof item === 'string'))) {
                throw new Error(MSG.TYPE_MISMATCH("items", `a string array string[]`, settings.items));
            }
            if (hasOwn(settings, "value")) {
                if (typeof settings.value !== "number") {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.NUMBER, settings.value));
                }
            }
            return getExpressionControl({ type: "Dropdown Menu", ...settings })(1);
        }
        function Layer(settings) {
            checkName(settings);
            return null;
        }
        function Point(settings) {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                const v = settings.value;
                if (!(Array.isArray(v) && v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number")) {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.THREE_D, settings.value));
                }
            }
            return getExpressionControl({ type: "Point", ...settings })(1);
        }
        function Slider(settings) {
            checkName(settings);
            checkExpression(settings);
            if (hasOwn(settings, "value")) {
                if (typeof settings.value !== "number") {
                    throw new Error(MSG.TYPE_MISMATCH("value", EXPECTED.NUMBER, settings.value));
                }
            }
            return getExpressionControl({ type: "Slider", ...settings })(1);
        }
        // pseudo
        class Base62 {
            static CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            static LEN = Base62.CHARS.length;
            static encode(n) {
                if (n === 0)
                    return Base62.CHARS[0];
                let result = '';
                while (n > 0) {
                    const remainder = n % Base62.LEN;
                    result = Base62.CHARS[remainder] + result;
                    n = Math.floor(n / Base62.LEN);
                }
                return result;
            }
            static decode(s) {
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
        class PseudoBuilder {
            name;
            matchName;
            parameters = [];
            idCache = {};
            constructor(name, matchName = `Pseudo/${Base62.encode(Date.now())}/${name}`) {
                this.name = name;
                this.matchName = matchName;
            }
            validateId(id) {
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
            layer(name, dephault, options) {
                options = { uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'layer', name, dephault, uiFlags: options.uiFlags, flags: options.flags, id: options.id });
                return this;
            }
            slider(name, value, validMin, validMax, sliderMin, sliderMax, options) {
                options = { uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'slider', name, value, validMin, validMax, sliderMin, sliderMax, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            fixedSlider(name, value, validMin, validMax, sliderMin, sliderMax, options) {
                options = { precision: 2, displayFlags: 0 /* PF.ValueDisplayFlags.None */, uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'fixedSlider', name, value, validMin, validMax, sliderMin, sliderMax, precision: options.precision, displayFlags: options.displayFlags, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            angle(name, value, options) {
                options = { uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'angle', name, value, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            checkbox(name, value, options) {
                options = { text: '', uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'checkbox', name, value, text: options.text, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            color(name, value, options) {
                options = { uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'color', name, value, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            point(name, xValue, yValue, options) {
                options = { uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'point', name, xValue, yValue, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            popup(name, value, items, options) {
                options = { uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'popup', name, value, items, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            floatSlider(name, value, validMin, validMax, sliderMin, sliderMax, options) {
                options = { precision: 2, displayFlags: 0 /* PF.ValueDisplayFlags.None */, uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'floatSlider', name, value, validMin, validMax, sliderMin, sliderMax, precision: options.precision, displayFlags: options.displayFlags, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            percent(name, value, validMin, validMax, sliderMin, sliderMax, options) {
                options = { precision: 2, uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'floatSlider', name, value, validMin, validMax, sliderMin, sliderMax, precision: options.precision, displayFlags: 1 /* PF.ValueDisplayFlags.Percent */, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            pixel(name, value, validMin, validMax, sliderMin, sliderMax, options) {
                options = { precision: 2, uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'floatSlider', name, value, validMin, validMax, sliderMin, sliderMax, precision: options.precision, displayFlags: 2 /* PF.ValueDisplayFlags.Pixel */, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            path(name, dephault, options) {
                options = { uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'path', name, dephault, uiFlags: options.uiFlags, flags: options.flags, id: options.id });
                return this;
            }
            groupStart(name, options) {
                options = { uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'groupStart', name, uiFlags: options.uiFlags, flags: options.flags, id: options.id });
                return this;
            }
            groupEnd(options) {
                options = { id: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'groupEnd', id: options.id });
                return this;
            }
            button(name, buttonName, options) {
                options = { uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'button', name, buttonName, uiFlags: options.uiFlags, flags: options.flags, id: options.id });
                return this;
            }
            point3D(name, xValue, yValue, zValue, options) {
                options = { uiFlags: 0 /* PF.ParamUIFlags.None */, flags: 0 /* PF.ParamFlags.None */, id: undefined, expression: undefined, ...options };
                this.validateId(options.id);
                this.parameters.push({ type: 'point3D', name, xValue, yValue, zValue, uiFlags: options.uiFlags, flags: options.flags, id: options.id, expression: options.expression });
                return this;
            }
            create() {
                let effect = null;
                try {
                    effect = thisLayer.effect(this.name);
                }
                catch {
                    throw JSON.stringify({
                        namespace: "@expression",
                        scope: "@effect",
                        action: "createPseudo",
                        payload: this.config(),
                    });
                }
                return createPseudoEffect(effect);
            }
            config() {
                this.finalize();
                return { name: this.name, matchName: this.matchName, parameters: this.parameters };
            }
            finalize() {
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
                    }
                    else if (parameter.type === 'groupEnd') {
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
                    const groupEnd = { type: 'groupEnd', id: issueId() };
                    this.parameters.push(groupEnd);
                }
            }
        }
        function createPseudoEffect(effect) {
            const fn = (name) => {
                return effect(name);
            };
            fn.param = (name) => {
                return effect(name);
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
            Pseudo: (name, matchName) => new PseudoBuilder(name, matchName),
        };
        LIB.Effect = lib;
        return lib;
    },
})
