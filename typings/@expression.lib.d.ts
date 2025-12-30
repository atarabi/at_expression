interface Global {
    footage(name: "@math.jsx"): Footage<{
        load(force?: boolean): Atarabi.math.Lib;
    }>;
    footage(name: "@color.jsx"): Footage<{
        load(force?: boolean): Atarabi.color.Lib;
    }>;
    footage(name: "@text.jsx"): Footage<{
        load(force?: boolean): Atarabi.text.Lib;
    }>;
    footage(name: "@IK.jsx"): Footage<{
        load(force?: boolean): Atarabi.IK.Lib;
    }>;
    footage(name: "@test.jsx"): Footage<{
        load(): Atarabi.test.Lib;
    }>;
}

interface Layer {
    footage(name: "@math.jsx"): Footage<{
        load(force?: boolean): Atarabi.math.Lib;
    }>;
    footage(name: "@color.jsx"): Footage<{
        load(force?: boolean): Atarabi.color.Lib;
    }>;
    footage(name: "@text.jsx"): Footage<{
        load(force?: boolean): Atarabi.text.Lib;
    }>;
    footage(name: "@IK.jsx"): Footage<{
        load(force?: boolean): Atarabi.IK.Lib;
    }>;
    footage(name: "@test.jsx"): Footage<{
        load(): Atarabi.test.Lib;
    }>;
}

declare namespace Atarabi {

    namespace math {

        interface Lib {
            Vec2: Vec2Constructor;
            Vec3: Vec3Constructor;
            Mat3: Mat3Constructor;
            Mat4: Mat4Constructor;
            Quaternion: QuaternionConstructor;
        }

        interface Vec2 {
            get x(): number;
            get y(): number;
            clone(): Vec2;
            add(v: number | Vec2): Vec2;
            sub(v: number | Vec2): Vec2;
            mul(v: number | Vec2): Vec2;
            div(v: number | Vec2): Vec2;
            rotate(angle: number): Vec2;
            map(fn: (v: number, index?: number) => number): Vec2;
            dot(v: Vec2): number;
            cross(v: Vec2): number;
            len(): number;
            norm(): Vec2;
            apply(m: Mat3): Vec2;
            get(): number[];
        }

        interface Vec2Constructor {
            new(v: number[]): Vec2;
            zero(): Vec2;
            isVec2(v: any): v is Vec2;
        }

        interface Vec3 {
            get x(): number;
            get y(): number;
            get z(): number;
            clone(): Vec3;
            add(v: number | Vec3): Vec3;
            sub(v: number | Vec3): Vec3;
            mul(v: number | Vec3): Vec3;
            div(v: number | Vec3): Vec3;
            map(fn: (v: number, index?: number) => number): Vec3;
            dot(v: Vec3): number;
            cross(v: Vec3): Vec3;
            len(): number;
            norm(): Vec3;
            apply(m: Mat4): Vec3;
            get(): number[];
        }

        interface Vec3Constructor {
            new(v: number[]): Vec3;
            zero(): Vec3;
            isVec3(v: any): v is Vec3;
        }

        // 3x3 matrix stored in row-major order:
        interface Mat3 {
            get m00(): number;
            get m01(): number;
            get m02(): number;
            get m10(): number;
            get m11(): number;
            get m12(): number;
            get m20(): number;
            get m21(): number;
            get m22(): number;
            clone(): Mat3;
            mul(m: Mat3): Mat3;
            applyTo(v: Vec2): Vec2;
            inverse(): Mat3;
            decompose(): {
                translate: Vec2;
                rotate: number;
                scale: Vec2;
            };
        }

        interface Mat3Constructor {
            new(m: number[]): Mat3;
            zero(): Mat3;
            identity(): Mat3;
            translate(tx: number, ty: number): Mat3;
            scale(sx: number, sy: number): Mat3;
            rotate(rad: number): Mat3;
            skew(ax: number, ay: number): Mat3;
            fromTransform(pos: Vec2, anchor: Vec2, scale: Vec2, rotation: number): Mat3;
            fromLayerTransform(layer: Layer): Mat3;
            isMat3(m: any): m is Mat3;
        }

        // 4x4 matrix stored in row-major order:
        interface Mat4 {
            get m00(): number;
            get m01(): number;
            get m02(): number;
            get m03(): number;
            get m10(): number;
            get m11(): number;
            get m12(): number;
            get m13(): number;
            get m20(): number;
            get m21(): number;
            get m22(): number;
            get m23(): number;
            get m30(): number;
            get m31(): number;
            get m32(): number;
            get m33(): number;
            clone(): Mat4;
            mul(m: Mat4): Mat4;
            applyTo(v: Vec3): Vec3;
            inverse(): Mat4;
            inverseAffine(): Mat4; // rotation + scale + translate
            inverseRigid(): Mat4; // rotation + translate
            decompose(): {
                translate: Vec3;
                rotate: Vec3; // radians (XYZ order)
                scale: Vec3;
            };
        }

        interface Mat4Constructor {
            new(m: number[]): Mat4;
            zero(): Mat4;
            identity(): Mat4;
            translate(tx: number, ty: number, tz: number): Mat4;
            scale(sx: number, sy: number, sz: number): Mat4;
            rotateX(rad: number): Mat4;
            rotateY(rad: number): Mat4;
            rotateZ(rad: number): Mat4;
            fromTransform(pos: Vec3, anchor: Vec3, scale: Vec3, orientation: Vec3, rotation: Vec3): Mat4;
            fromLayerTransform(layer: Layer): Mat4;
            isMat4(m: any): m is Mat4;
        }

        interface Quaternion {
            get x(): number;
            get y(): number;
            get z(): number;
            get w(): number;
            norm(): number;
            normalize(): Quaternion;
            conjugate(): Quaternion;
            multiply(q: Quaternion): Quaternion;
            rotateVector(v: Vec3): Vec3;
            slerp(q: Quaternion, t: number): Quaternion;
            toEuler(): Vec3;
        }

        interface QuaternionConstructor {
            new(x?: number, y?: number, z?: number, w?: number): Quaternion;
            fromEuler(rx: number, ry: number, rz: number): Quaternion;
            isQuaternion(q: any): q is Quaternion;
        }

    }

    namespace color {

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

    namespace text {

        interface Lib {
            CharClass: CharClassMap;
            TextStyle: TextStyleRules;
        }

        interface CharClassMap {
            // --- East Asia ---
            readonly Hiragana: "Hiragana";
            readonly Katakana: "Katakana";
            readonly Kanji: "Kanji"; // =Han
            readonly Japanese: "Japanese",
            readonly Han: "Han";
            readonly Hangul: "Hangul";

            // --- Latin / European ---
            readonly Latin: "Latin";
            readonly Greek: "Greek";
            readonly Cyrillic: "Cyrillic";

            // --- Middle East / Caucasus ---
            readonly Arabic: "Arabic";
            readonly Hebrew: "Hebrew";
            readonly Armenian: "Armenian";
            readonly Georgian: "Georgian";

            // --- South Asia ---
            readonly Devanagari: "Devanagari";
            readonly Bengali: "Bengali";
            readonly Gurmukhi: "Gurmukhi";
            readonly Gujarati: "Gujarati";
            readonly Oriya: "Oriya";
            readonly Tamil: "Tamil";
            readonly Telugu: "Telugu";
            readonly Kannada: "Kannada";
            readonly Malayalam: "Malayalam";
            readonly Sinhala: "Sinhala";

            // --- Southeast Asia ---
            readonly Thai: "Thai";
            readonly Lao: "Lao";
            readonly Khmer: "Khmer";
            readonly Myanmar: "Myanmar";

            // --- African ---
            readonly Ethiopic: "Ethiopic";

            // --- Other ---
            readonly Lowercase: "Lowercase";
            readonly Uppercase: "Uppercase";
            readonly Modifier: "Modifier",
            readonly Alphabetic: "Alphabetic";
            readonly Letter: "Letter";
            readonly Decimal: "Decimal";
            readonly Number: "Number";
            readonly Emoji: "Emoji";
            readonly Symbol: "Symbol";
            readonly Punctuation: "Punctuation";
            readonly Yakumono: "Yakumono";
            readonly Space: "Space";
            readonly Separator: "Separator";
        }

        type CharClass = CharClassMap[keyof CharClassMap];

        type CharMatcher = CharClass | RegExp;

        type TextLayoutKeys = "direction" | "firstLineIndent" | "isEveryLineComposer" | "isHangingRoman" | "justification" | "leadingType" | "leftMargin" | "rightMargin" | "spaceAfter" | "spaceBefore";

        type TextLayout = Pick<Fields<TextStyleProperty>, TextLayoutKeys>;

        type TextLayoutOptions = Partial<TextLayout>;

        type TextStyle = Omit<
            Fields<TextStyleProperty>,
            keyof Fields<Property> | TextLayoutKeys
        >;

        type TextStyleOptions = Partial<TextStyle>;

        interface TextStyleApplier {
            apply(property?: TextProperty, style?: TextStyleProperty): TextStyleProperty;
        }

        interface TextStyleBuilder<Rule> extends TextStyleApplier {
            rule(style: TextStyleOptions): this;
            rule(rule: Rule, style: TextStyleOptions): this;
            layout(layout?: TextLayoutOptions): this;
        }

        type CharClassRule = CharMatcher | CharMatcher[];

        interface CharClassTextStyleBuilder extends TextStyleBuilder<CharClassRule> {
            exclusive(): this;
            overlay(): this; // default
        }

        type Range = { from: number; count?: number };

        type RangeRule = Range | number | ((index: number) => boolean);

        type PositionRule = Range | number | ((index: number, line?: number) => boolean);

        type CountWhenPreset = "all" | "nonWhitespace" | "nonLineBreak" | "nonWhitespaceOrLineBreak";

        type CountWhen = CountWhenPreset | CharClass | ((g: string) => boolean) | RegExp;

        interface PositionTextStyleBuilder extends TextStyleBuilder<PositionRule> {
            line(): this;
            global(): this; // default
            countWhen(when: CountWhen): this; // "all"
        }

        type LineRule = RangeRule;

        interface LineTextStyleBuilder extends TextStyleBuilder<LineRule> {
        }

        type SurroundingRule = RangeRule;

        type SurroundingTarget = "all" | "content" | "delimiter" | "open" | "close"; // default: "content"

        type SurroundingNesting = "none" | "balanced"; // default: "balanced"

        type SurroundingDepth = number | ((depth: number) => boolean);

        type SurroundingOptions = { target?: SurroundingTarget; nesting?: SurroundingNesting; depth?: SurroundingDepth; };

        interface SurroundingTextStyleBuilder extends TextStyleBuilder<SurroundingRule> {
        }

        interface GraphemeContext {
            readonly index: number;
            readonly line: number;
            readonly indexInLine: number;
            readonly lineLength: number;
            readonly includeLF: boolean;
            readonly totalLines: number;
            readonly iteration: number;
            state: Record<string, unknown>;
        }

        type GraphemeMatcher = (grapheme: string, ctx: GraphemeContext) => boolean | void;

        type GraphemeStateFn = () => Record<string, unknown>;

        type GraphemeRule = GraphemeMatcher | { match: GraphemeMatcher; initState: GraphemeStateFn; };

        interface GraphemeTextStyleBuilder extends TextStyleBuilder<GraphemeRule> {
            iterations(iter: number): this;
        }

        interface TextStyleComposer extends TextStyleApplier {
            add(builder: TextStyleApplier): this;
            layout(layout: TextLayoutOptions): this;
        }

        type ForEachLineFunc = (line: string, index: number, total: number) => TextStyleOptions | void;

        type ForEachGraphemeContext = GraphemeContext;

        type ForEachGraphemeFunc = (g: string, ctx: ForEachGraphemeContext) => TextStyleOptions | void;

        type ForEachGraphemeOptions = { iterations?: number; initState?: GraphemeStateFn; };

        interface TextStyleRules {
            all(style: TextLayoutOptions | TextStyleOptions): TextStyleApplier;
            // static
            byCharClass(): CharClassTextStyleBuilder;
            byPosition(): PositionTextStyleBuilder;
            byLine(): LineTextStyleBuilder;
            bySurrounding(open: string, close: string, options?: SurroundingOptions): SurroundingTextStyleBuilder;
            byGrapheme(): GraphemeTextStyleBuilder;
            // dynamic
            forEachLine(fn: ForEachLineFunc): TextStyleApplier;
            forEachGrapheme(fn: ForEachGraphemeFunc, options?: ForEachGraphemeOptions): TextStyleApplier;
            // compose
            compose(): TextStyleComposer;
        }

        /** @internal */
        interface Lib {
            __internal: {
                annotateByCharClass: typeof annotateByCharClass;
            };
        }

        function annotateByCharClass(text: string, charClasses: (CharMatcher | CharMatcher[])[]): { from: number; count?: number; index: number; }[];
    }

    namespace IK {

        interface Lib {
            TwoBoneIK: TwoBoneIKConstructor;
            FABRIK2D: FABRIK2DConstructor;
        }

        type Vec2 = math.Vec2;

        interface TwoBoneIK {
            solve(target: Vec2): { elbow: Vec2; hand: Vec2 };
        }

        interface TwoBoneIKConstructor {
            new(root: Vec2, mid: Vec2, tip: Vec2, pole?: Vec2): TwoBoneIK;
        }

        type AngleLimit = { min: number; max: number; };

        interface FABRIK2D {
            solve(target: Vec2, tolerance?: number, maxIterations?: number): Vec2[];
        }

        interface FABRIK2DConstructor {
            new(points: Vec2[], angleLimits?: (AngleLimit | null)[]): FABRIK2D;
        }

    }

    namespace test {

        interface Lib {
            Assert: Assert;
            Test: Test;
        }

        type NumericTree = number | NumericTree[];

        interface Assert {
            equal(a: any, b: any, msg?: string): void;
            deepEqual(a: any, b: any, msg?: string): void;
            near(a: NumericTree, b: NumericTree, eps?: number, msg?: string): void;
            throws(fn: () => void, msg?: string): void;
        }

        interface Test {
            describe(name: string, fn: () => void): void;
            test(name: string, fn: () => void): void;
            run(): string;
        }

    }

    /**
     * Utility
     */
    type NonFunctionKeys<T> = {
        [K in keyof T]: T[K] extends Function ? never : K
    }[keyof T];

    type Fields<T> = Pick<T, NonFunctionKeys<T>>;

}
