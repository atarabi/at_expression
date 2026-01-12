interface Global extends Atarabi.Color.FootageProvider { }

interface Layer extends Atarabi.Color.FootageProvider { }

declare namespace Atarabi {

    namespace Expression {

        interface Cache {
            Color: Atarabi.Color.Lib;
        }

    }

    namespace Color {

        interface FootageProvider {
            footage(name: "@color.jsx"): Footage<{
                load(force?: boolean): Lib;
            }>;
        }

        interface Lib {
            keyframeProgress: typeof keyframeProgress;
            RGB: RGBConstructor;
            YCbCr: YCbCrConstructor; // BT.709
            HSL: HSLConstructor;
            HSB: HSBConstructor;
            Oklab: OklabConstructor;
            Oklch: OklchConstructor;
        }

        function keyframeProgress(time?: number): { prevValue: _ColorA; nextValue: _ColorA; t: number; };

        type DEFAULT_GAMMA = 2.4;

        type Color = number[];

        type HueInterpolationMethod = 'shorter' | 'longer' | 'increasing' | 'decreasing';

        interface ColorBase<Ch extends string> {
            clone(): this;
            op(fn: (v: number, index: number) => number): this;
            opAt(index: number | Ch, fn: (v: number) => number): this;
            add(value: number): this;
            addAt(index: number | Ch, value: number): this;
            sub(value: number): this;
            subAt(index: number | Ch, value: number): this;
            mul(value: number): this;
            mulAt(index: number | Ch, value: number): this;
            div(value: number): this;
            divAt(index: number | Ch, value: number): this;
            lerp(c: this, t: number): this;
            lerpAt(index: number, value: number, t: number): this;
            toRGB(): RGB;
            get(): Color;
        }

        interface ColorBaseConstructor<COLOR> {
            new(color?: Color): COLOR;
            fromRGB(rgb: RGB): COLOR;
        }

        interface HueColorBase<Ch extends string> extends ColorBase<Ch> {
            readonly hueIndex: number;
            lerp(c: this, t: number, method?: HueInterpolationMethod): this;
            lerpAtHue(value: number, t: number, method?: HueInterpolationMethod): this;
        }

        type RGBCh = 'r' | 'g' | 'b';

        interface RGB extends ColorBase<RGBCh> {
            gamma(gamma?: number): RGB;
            linearize(gamma?: number): RGB;
            clamp(): RGB;
            value(): number[];
        }

        interface RGBConstructor extends ColorBaseConstructor<RGB> {
            isRGB(c: any): c is RGB;
        }

        type YCbCrCh = 'y' | 'cb' | 'cr';

        interface YCbCr extends ColorBase<YCbCrCh> {
        }

        interface YCbCrConstructor extends ColorBaseConstructor<YCbCr> {
            isYCbCr(c: any): c is YCbCr;
        }

        type HSLCh = 'h' | 's' | 'l';

        interface HSL extends HueColorBase<HSLCh> {
        }

        interface HSLConstructor extends ColorBaseConstructor<HSL> {
            isHSL(c: any): c is HSL;
        }

        type HSBCh = 'h' | 's' | 'b';

        interface HSB extends HueColorBase<HSBCh> {
        }

        interface HSBConstructor extends ColorBaseConstructor<HSB> {
            isHSB(c: any): c is HSB;
        }

        type OklabCh = 'l' | 'a' | 'b';

        interface Oklab extends ColorBase<OklabCh> {
            toOklch(): Oklch;
            toRGB(gamma?: number): RGB;
        }

        interface OklabConstructor extends ColorBaseConstructor<Oklab> {
            isOklab(c: any): c is Oklab;
            fromRGB(rgb: RGB, gamma?: number): Oklab;
        }

        type OklchCh = 'l' | 'c' | 'h';

        interface Oklch extends HueColorBase<OklchCh> {
            toOklab(): Oklab;
            toRGB(gamma?: number): RGB;
        }

        interface OklchConstructor extends ColorBaseConstructor<Oklch> {
            isOklch(c: any): c is Oklch;
            fromOklab(lab: Oklab): Oklch;
            fromRGB(rgb: RGB, gamma?: number): Oklch;
        }

    }

}
