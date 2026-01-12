// Depends on @script(https://github.com/atarabi/at_script) and @expression(Startup)
interface Global {
    footage(name: "@control.jsx"): Footage<{
        load(force?: boolean): Atarabi.Control.Lib;
    }>;
}

interface Layer {
    footage(name: "@control.jsx"): Footage<{
        load(force?: boolean): Atarabi.Control.Lib;
    }>;
}

declare namespace Atarabi {

    namespace Expression {

        interface Cache {
            Control: Atarabi.Control.Lib;
        }

    }

    namespace Control {

        interface Lib {
            create(settings: SettingsWithType): Property;
            ThreeDPoint(settings: ThreeDPointSettings): Property;
            Angle(settings: AngleSettings): Property;
            Checkbox(settings: CheckboxSettings): Property;
            Color(settings: ColorSettings): Property;
            DropdownMenu(settings: DropdownMenuSettings): Property;
            Layer(settings: LayerSettings): Property;
            Point(settings: PointSettings): Property;
            Slider(settings: SliderSettings): Property;
        }

        interface CreateAction extends Expression.Action {
            scope: "@control";
            action: "create";
            payload: SettingsWithType;
        }

        type Type =
            | "3D Point"
            | "Angle"
            | "Checkbox"
            | "Color"
            | "Dropdown Menu"
            | "Layer"
            | "Point"
            | "Slider"
            ;

        type Settings =
            | ThreeDPointSettings
            | AngleSettings
            | CheckboxSettings
            | ColorSettings
            | DropdownMenuSettings
            | LayerSettings
            | PointSettings
            | SliderSettings
            ;

        type SettingsWithType =
            | ThreeDPointSettings & { type: "3D Point"; }
            | AngleSettings & { type: "Angle"; }
            | CheckboxSettings & { type: "Checkbox"; }
            | ColorSettings & { type: "Color"; }
            | DropdownMenuSettings & { type: "Dropdown Menu"; }
            | LayerSettings & { type: "Layer"; }
            | PointSettings & { type: "Point"; }
            | SliderSettings & { type: "Slider"; }
            ;

        type ThreeDPointSettings = {
            name: string;
            value?: [x: number, y: number, z: number]; // percent
            expression?: string;
        };

        type AngleSettings = {
            name: string;
            value?: number;
            expression?: string;
        };

        type CheckboxSettings = {
            name: string;
            value?: boolean | number;
            expression?: string;
        };

        type ColorSettings = {
            name: string;
            value?: [red: number, green: number, blue: number, alpha: number];
            expression?: string;
        };

        type DropdownMenuSettings = {
            name: string;
            items: string[];
            value?: number;
            expression?: string;
        };

        type LayerSettings = {
            name: string;
        };

        type PointSettings = {
            name: string;
            value?: [x: number, y: number]; // percent
            expression?: string;
        };

        type SliderSettings = {
            name: string;
            value?: number;
            expression?: string;
        };

    }

}
