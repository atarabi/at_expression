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
        function create(name, matchName, parameters) {
            let effect = null;
            try {
                effect = thisLayer.effect(name);
            }
            catch (e) {
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
                });
            }
            return effect;
        }
        // expression control
        function ExpressionControl(settings) {
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
            throw new Error(`Invalid type: ${settings.type}`);
        }
        function checkName(name) {
            if (typeof name !== "string")
                throw new Error(MSG.TYPE_MISMATCH("name", EXPECTED.STRING, name));
        }
        function checkExpression(expression) {
            if (expression != null && typeof expression !== "string")
                throw new Error(MSG.TYPE_MISMATCH("expression", EXPECTED.STRING, expression));
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
        function ThreeDPoint(name, value, expression) {
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
        function Angle(name, value, expression) {
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
        function Checkbox(name, value, expression) {
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
        function Color(name, value, expression) {
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
        function DropdownMenu(name, items, value, expression) {
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
        function Layer(name) {
            checkName(name);
            return getExpressionControl({
                type: "Layer",
                name,
            })(1);
        }
        function Point(name, value, expression) {
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
        function Slider(name, value, expression) {
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
