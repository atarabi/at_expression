({
    load(force: boolean = false): Atarabi.Pseudo.Lib {

        const LIB = $.__Atarabi = $.__Atarabi || {} as _HelperObject["__Atarabi"];
        if (!force && LIB.Pseudo) {
            return LIB.Pseudo;
        }

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

        type Integer = Atarabi.Pseudo.Integer;

        class Builder {
            protected parameters: Atarabi.Pseudo.Parameter[] = [];
            protected idCache: Record<number, boolean> = {};
            constructor(protected name: string, protected matchName: string = `Pseudo/${Base62.encode(Date.now())}/${name}`) {
            }
            private validateId(id?: number) {
                if (typeof id === 'number') {
                    if (!(Number.isInteger(id) && id > 0)) {
                        throw new Error(`id must be positive integer: ${id}`);
                    }
                    if (this.idCache[id]) {
                        throw new Error(`id already used: ${id}`);
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
            color(name: string, value: Atarabi.Pseudo.Color, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): this {
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
            create(): Atarabi.Pseudo.PseudoEffect {
                let effect: Effect = null;
                try {
                    effect = thisLayer.effect(this.name);
                } catch {
                    throw JSON.stringify({
                        namespace: "@expression",
                        scope: "@pseudo",
                        action: "create",
                        payload: this.config(),
                    } satisfies Atarabi.Pseudo.CreateAction);
                }
                return createPseudoEffect(effect) as any;
            }
            private config(): Atarabi.Pseudo.Config {
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
                    const groupEnd = { type: 'groupEnd', id: issueId() } satisfies Atarabi.Pseudo.GroupEndParameter;
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

        const lib = (name: string, matchName?: string) => new Builder(name, matchName);

        LIB.Pseudo = lib as any;

        return LIB.Pseudo;
    },
})