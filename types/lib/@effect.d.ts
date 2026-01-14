// Depends on @script(https://github.com/atarabi/at_script) and @expression(Startup)
interface _FootageProvider {
    footage(name: "@effect.jsx"): Footage<{
        load(force?: boolean): Atarabi.Effect.Lib;
    }>;
}

declare namespace Atarabi {

    namespace Expression {

        interface Cache {
            Effect: Atarabi.Effect.Lib;
        }

    }

    namespace Effect {

        interface Lib {
            create(settings: EffectSettings): Effect;
            // expression control
            ExpressionControl(settings: ExpressionControlSettings): Property;
            ThreeDPoint(settings: Omit<ThreeDPointSettings, "type">): Property;
            Angle(settings: Omit<AngleSettings, "type">): Property;
            Checkbox(settings: Omit<CheckboxSettings, "type">): Property;
            Color(settings: Omit<ColorSettings, "type">): Property;
            DropdownMenu(settings: Omit<DropdownMenuSettings, "type">): Property;
            Layer(settings: Omit<LayerSettings, "type">): Property;
            Point(settings: Omit<PointSettings, "type">): Property;
            Slider(settings: Omit<SliderSettings, "type">): Property;
            // pseudo
            Pseudo(name: string, matchName?: string): Pseudo.Builder;
        }

        interface CreateEffectAction extends Expression.Action {
            scope: "@effect";
            action: "createEffect";
            payload: EffectSettings;
        }

        interface CreateExpressionControlAction extends Expression.Action {
            scope: "@effect";
            action: "createExpressionControl";
            payload: ExpressionControlSettings;
        }

        interface CreatePseudoAction extends Expression.Action {
            scope: "@effect";
            action: "createPseudo";
            payload: Pseudo.Config;
        }

        // effect
        interface EffectSettings {
            matchName: string;
            name: string;
            parameters?: {
                [matchName: string]: {
                    value?: any;
                    expression?: string;
                },
            };
        }

        // expression control
        type ExpressionControlSettings =
            | ThreeDPointSettings
            | AngleSettings
            | CheckboxSettings
            | ColorSettings
            | DropdownMenuSettings
            | LayerSettings
            | PointSettings
            | SliderSettings
            ;

        type ThreeDPointSettings = {
            type: "3D Point";
            name: string;
            value?: [x: number, y: number, z: number]; // percent
            expression?: string;
        };

        type AngleSettings = {
            type: "Angle";
            name: string;
            value?: number;
            expression?: string;
        };

        type CheckboxSettings = {
            type: "Checkbox";
            name: string;
            value?: boolean | number;
            expression?: string;
        };

        type ColorSettings = {
            type: "Color";
            name: string;
            value?: [red: number, green: number, blue: number, alpha: number];
            expression?: string;
        };

        type DropdownMenuSettings = {
            type: "Dropdown Menu";
            name: string;
            items: string[];
            value?: number;
            expression?: string;
        };

        type LayerSettings = {
            type: "Layer";
            name: string;
        };

        type PointSettings = {
            type: "Point";
            name: string;
            value?: [x: number, y: number]; // percent
            expression?: string;
        };

        type SliderSettings = {
            type: "Slider";
            name: string;
            value?: number;
            expression?: string;
        };

        // pseudo
        namespace Pseudo {

            interface Builder<Ps = {}, I extends any[] = [any]> {
                /**
                 * Add parameters
                 */
                layer<K extends string>(name: K, dephault: PF.LayerDefault, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Layer | null; } & { [K in I['length']]: Layer | null }, [...I, any]>;

                // use FloatSlider instead
                slider<K extends string>(name: K, value: Integer, validMin: Integer, validMax: Integer, sliderMin: Integer, sliderMax: Integer, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<number>; } & { [K in I['length']]: Property<number> }, [...I, any]>;

                // use FloatSlider instead
                fixedSlider<K extends string>(name: K, value: number, validMin: number, validMax: number, sliderMin: number, sliderMax: number, options?: { precision?: Integer; displayFlags?: PF.ValueDisplayFlags; uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<number>; } & { [K in I['length']]: Property<number> }, [...I, any]>;

                angle<K extends string>(name: K, value: number, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<number>; } & { [K in I['length']]: Property<number> }, [...I, any]>;

                checkbox<K extends string>(name: K, value: boolean, options?: { text?: string; uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<number>; } & { [K in I['length']]: Property<number> }, [...I, any]>;

                color<K extends string>(name: K, value: Color, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<[number, number, number, number]>; } & { [K in I['length']]: Property<[number, number, number, number]> }, [...I, any]>;

                point<K extends string>(name: K, xValue: number, yValue: number, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<[number, number]>; } & { [K in I['length']]: Property<[number, number]> }, [...I, any]>;

                popup<K extends string>(name: K, value: Integer, items: string[], options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<number>; } & { [K in I['length']]: Property<number> }, [...I, any]>;

                floatSlider<K extends string>(name: K, value: number, validMin: number, validMax: number, sliderMin: number, sliderMax: number, options?: { precision?: Integer; displayFlags?: PF.ValueDisplayFlags; uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<number>; } & { [K in I['length']]: Property<number> }, [...I, any]>;
                percent<K extends string>(name: K, value: number, validMin: number, validMax: number, sliderMin: number, sliderMax: number, options?: { precision?: Integer; uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<number>; } & { [K in I['length']]: Property<number> }, [...I, any]>;
                pixel<K extends string>(name: K, value: number, validMin: number, validMax: number, sliderMin: number, sliderMax: number, options?: { precision?: Integer; uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<number>; } & { [K in I['length']]: Property<number> }, [...I, any]>;

                path<K extends string>(name: K, dephault?: Integer, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Mask | null; } & { [K in I['length']]: Mask | null }, [...I, any]>;

                groupStart<K extends string>(name: K, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; }): K extends keyof Ps ? Builder<Ps, [...I, any]> : Builder<Ps & { [P in K]: never; } & { [K in I['length']]: never }, [...I, any]>

                groupEnd(options?: { id?: Integer; }): Builder<Ps, [...I, any]>;

                // useless
                button<K extends string>(name: K, buttonName: string, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: never; } & { [K in I['length']]: never }, [...I, any]>;

                point3D<K extends string>(name: K, xValue: number, yValue: number, zValue: number, options?: { uiFlags?: PF.ParamUIFlags; flags?: PF.ParamFlags; id?: Integer; expression?: string; }): K extends keyof Ps ? never : Builder<Ps & { [P in K]: Property<[number, number, number]>; } & { [K in I['length']]: Property<[number, number, number]> }, [...I, any]>;

                /*
                 * Output
                 */
                create(): PseudoEffect<Ps>;
            }

            interface PseudoEffect<Ps = {}> {
                <K extends keyof Ps>(key: K): Ps[K];
                param<K extends keyof Ps>(key: K): Ps[K];

                (key: string | number): any;
                param(key: string | number): any;
            }

            type Integer = number;

            interface Config {
                matchName: string;
                name: string;
                parameters: Parameter[];
            }

            type Parameter = LayerParameter | SliderParameter | FiexedSliderParameter | AngleParameter | CheckboxParameter | ColorParameter | PointParameter | PopupParameter | FloatSliderParameter | PathParameter | GroupStartParameter | GroupEndParameter | ButtonParameter | Point3DParameter;

            type LayerParameter = {
                type: 'layer';
                name: string;
                dephault: PF.LayerDefault;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                id: Integer; // must be positive and unique
            };

            type SliderParameter = {
                type: 'slider';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                value: Integer;
                validMin: Integer;
                validMax: Integer;
                sliderMin: Integer;
                sliderMax: Integer;
                id: Integer; // must be positive and unique
                expression?: string;
            };

            type FiexedSliderParameter = {
                type: 'fixedSlider';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                value: number;
                validMin: number;
                validMax: number;
                sliderMin: number;
                sliderMax: number;
                precision: Integer;
                displayFlags: PF.ValueDisplayFlags;
                id: Integer; // must be positive and unique
                expression?: string;
            };

            type AngleParameter = {
                type: 'angle';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                value: number;
                id: Integer; // must be positive and unique
                expression?: string;
            };

            type CheckboxParameter = {
                type: 'checkbox';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                value: boolean;
                text?: string;
                id: Integer; // must be positive and unique
                expression?: string;
            };

            type Color = { red: number; green: number; blue: number; }; // [0, 255]

            type ColorParameter = {
                type: 'color';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                value: Color;
                id: Integer; // must be positive and unique
                expression?: string;
            };

            type PointParameter = {
                type: 'point';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                xValue: number;
                yValue: number;
                id: Integer; // must be positive and unique
                expression?: string;
            };

            type PopupParameter = {
                type: 'popup';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                value: Integer; // 1-indexed
                items: string[];
                id: Integer; // must be positive and unique
                expression?: string;
            };

            type FloatSliderParameter = {
                type: 'floatSlider';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                value: number;
                validMin: number;
                validMax: number;
                sliderMin: number;
                sliderMax: number;
                precision: Integer;
                displayFlags: PF.ValueDisplayFlags;
                id: Integer; // must be positive and unique
                expression?: string;
            };

            type PathParameter = {
                type: 'path';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                dephault: Integer;
                id: Integer; // must be positive and unique
            };

            type GroupStartParameter = {
                type: 'groupStart';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                id: Integer; // must be positive and unique
            };

            type GroupEndParameter = {
                type: 'groupEnd';
                id: Integer; // must be positive and unique
            };

            type ButtonParameter = {
                type: 'button';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                buttonName: string;
                id: Integer; // must be positive and unique
            };

            type Point3DParameter = {
                type: 'point3D';
                name: string;
                uiFlags: PF.ParamUIFlags;
                flags: PF.ParamFlags;
                xValue: number;
                yValue: number;
                zValue: number;
                id: Integer; // must be positive and unique
                expression?: string;
            };

        }
    }

}
