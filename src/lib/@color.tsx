({
    load(force: boolean = false): Atarabi.color.Lib {

        const LIB = $.__lib = $.__lib || {};
        if (!force && LIB.color) {
            return LIB.color;
        }

        function calculateCompletion(c: _ColorA, c1: _ColorA, c2: _ColorA): number {
            let bestIndex = -1;
            let maxDist = 0;
            for (let i = 0; i < 3; i++) {
                const d = Math.abs(c1[i] - c2[i]);
                if (d > maxDist) {
                    bestIndex = i;
                    maxDist = d;
                }
            }
            if (bestIndex < 0) {
                return 0;
            }
            return (c[bestIndex] - c1[bestIndex]) / (c2[bestIndex] - c1[bestIndex]);
        }

        function keyframeProgress(time = thisLayer.time, property = thisProperty): { prevValue: _ColorA; nextValue: _ColorA; t: number; } {
            const currentV = property.valueAtTime(time) as _ColorA;
            if (property.numKeys <= 1) {
                return {
                    prevValue: currentV,
                    nextValue: currentV,
                    t: 0,
                };
            }
            const N = property.numKeys;
            const k = property.nearestKey(time) as Key;
            const v = property.valueAtTime(k.time) as _ColorA
            if (k.time <= time) {
                if (k.index >= N) {
                    return {
                        prevValue: v,
                        nextValue: v,
                        t: 0,
                    };
                }
                const nextK = property.key(k.index + 1);
                const nextV = property.valueAtTime(nextK.time) as _ColorA;
                return {
                    prevValue: v,
                    nextValue: nextV,
                    t: calculateCompletion(currentV, v, nextV),
                };
            } else {
                if (k.index <= 1) {
                    return {
                        prevValue: v,
                        nextValue: v,
                        t: 0,
                    };
                }
                const prevK = property.key(k.index - 1);
                const prevV = property.valueAtTime(prevK.time) as _ColorA;
                return {
                    prevValue: prevV,
                    nextValue: v,
                    t: calculateCompletion(currentV, prevV, v),
                };
            }
        }

        type Color = Atarabi.color.Color;

        abstract class ColorBase<Ch extends string> implements Atarabi.color.ColorBase<Ch> {
            protected abstract v: Color;
            protected abstract create(v: Color): this;
            protected abstract chToIndex(ch: Ch): number;
            clone(): this {
                return this.create([...this.v]);
            }
            op(fn: (v: number, index: number) => number): this {
                return this.create(this.v.map(fn));
            }
            opAt(index: number | Ch, fn: (v: number) => number): this {
                const v = [...this.v];
                index = typeof index === 'number' ? index : this.chToIndex(index);
                v[index] = fn(v[index]);
                return this.create(v);
            }
            add(value: number): this {
                return this.op((v, i) => i === 3 ? v : v + value);
            }
            addAt(index: number | Ch, value: number): this {
                return this.opAt(index, v => v + value);
            }
            sub(value: number): this {
                return this.op((v, i) => i === 3 ? v : v - value);
            }
            subAt(index: number | Ch, value: number): this {
                return this.opAt(index, v => v - value);
            }
            mul(value: number): this {
                return this.op((v, i) => i === 3 ? v : v * value);
            }
            mulAt(index: number | Ch, value: number): this {
                return this.opAt(index, v => v * value);
            }
            div(value: number): this {
                return this.op((v, i) => i === 3 ? v : v / value);
            }
            divAt(index: number | Ch, value: number): this {
                return this.opAt(index, v => v / value);
            }
            protected opAtAll(fn: (v: number, i: number) => number): this {
                return this.create(this.v.map(fn));
            }
            lerp(c: this, t: number): this {
                const a = this.v;
                const b = c.v;
                const out = a.map((v, i) => v + (b[i] - v) * t);
                return this.create(out);
            }
            lerpAt(index: number, value: number, t: number): this {
                return this.opAt(index, v => v + (value - v) * t);
            }
            abstract toRGB(): RGB;
            get(): number[] {
                return this.v;
            }
        }

        type HueInterpolationMethod = Atarabi.color.HueInterpolationMethod;

        function mod(n: number, m: number): number {
            return ((n % m) + m) % m;
        }

        function mod1(n: number): number {
            return mod(n, 1);
        }

        function lerpHue(h1: number, h2: number, t: number, method: HueInterpolationMethod = 'shorter'): number {
            let delta = mod1(h2 - h1);

            switch (method) {
                case 'shorter':
                    if (delta > 0.5) delta -= 1;
                    break;
                case 'longer':
                    if (delta < 0.5) delta -= 1;
                    break;
                case 'increasing':
                    if (delta < 0) delta += 1;
                    break;
                case 'decreasing':
                    if (delta > 0) delta -= 1;
                    break;
            }

            const h = h1 + delta * t;
            return mod1(h);
        }

        abstract class HueColorBase<Ch extends string> extends ColorBase<Ch> implements Atarabi.color.HueColorBase<Ch> {
            abstract readonly hueIndex: number;
            lerp(c: this, t: number, method: HueInterpolationMethod = 'shorter'): this {
                const a = this.v;
                const b = c.v;
                const out = a.map((v, i) => i === this.hueIndex ? lerpHue(v, b[i], t, method) : v + (b[i] - v) * t);
                return this.create(out);
            }
            lerpAtHue(value: number, t: number, method: HueInterpolationMethod = 'shorter'): this {
                return this.opAt(this.hueIndex, v => lerpHue(v, value, t, method));
            }
        }

        function fitArrayLength(
            src: readonly number[],
            len: number,
            fill: number = 1,
        ): number[] {
            if (src.length === len) {
                return [...src];
            }
            if (src.length > len) {
                return src.slice(0, len);
            }
            const out = src.slice();
            while (out.length < len) {
                out.push(fill);
            }
            return out;
        }

        const DEFAULT_GAMMA = 2.4;

        type RGBCh = Atarabi.color.RGBCh;

        class RGB extends ColorBase<RGBCh> implements Atarabi.color.RGB {
            constructor(protected v: Color = [1, 1, 1, 1]) {
                super();
            }
            protected create(v: Color): this {
                return new RGB(v) as this;
            }
            protected chToIndex(ch: RGBCh): number {
                switch (ch) {
                    default:
                    case 'r':
                        return 0;
                    case 'g':
                        return 1;
                    case 'b':
                        return 2;
                }
            }
            gamma(gamma: number = DEFAULT_GAMMA): RGB {
                const inv = 1 / gamma;
                return this.op((v, i) => i === 3 ? v : Math.pow(v, inv));
            }
            linearize(gamma: number = DEFAULT_GAMMA): RGB {
                return this.op((v, i) => i === 3 ? v : Math.pow(v, gamma));
            }
            clamp(): RGB {
                return this.op(v => Math.min(1, Math.max(0, v)));
            }
            toRGB(): RGB {
                return this.clone();
            }
            value(): number[] {
                const v = thisProperty.value;
                if (Array.isArray(v)) {
                    return fitArrayLength(this.v, v.length);
                } else {
                    return [...this.v];
                }
            }
            static fromRGB(rgb: RGB): RGB {
                return rgb.clone();
            }
            static isRGB(c: any): c is RGB {
                return c instanceof RGB;
            }
        }

        function rgbToYCbCr(rgb: Color): Color {
            const [r, g, b] = rgb;
            const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const cb = (b - y) / 1.8556 + 0.5;
            const cr = (r - y) / 1.5748 + 0.5;

            return rgb.length === 4 ? [y, cb, cr, rgb[3]] : [y, cb, cr];
        }

        function yCbCrToRgb(ycc: Color): Color {
            const [y, cbN, crN] = ycc;
            const cb = cbN - 0.5;
            const cr = crN - 0.5;
            const r = y + 1.5748 * cr;
            const b = y + 1.8556 * cb;
            const g = (y - 0.2126 * r - 0.0722 * b) / 0.7152;
            return ycc.length === 4 ? [r, g, b, ycc[3]] : [r, g, b];
        }

        type YCbCrCh = Atarabi.color.YCbCrCh;

        class YCbCr extends ColorBase<YCbCrCh> implements Atarabi.color.YCbCr {
            constructor(protected v: Color = [1, 1, 1, 1]) {
                super();
            }
            protected create(v: Color): this {
                return new YCbCr(v) as this;
            }
            protected chToIndex(ch: YCbCrCh): number {
                switch (ch) {
                    default:
                    case 'y':
                        return 0;
                    case 'cb':
                        return 1;
                    case 'cr':
                        return 2;
                }
            }
            toRGB(): RGB {
                return new RGB(yCbCrToRgb(this.v));
            }
            static fromRGB(rgb: RGB): YCbCr {
                return new YCbCr(rgbToYCbCr(rgb.get()));
            }
            static isYCbCr(c: any): c is YCbCr {
                return c instanceof YCbCr;
            }
        }

        

        function rgbToHsl(rgb: Color): Color {
            const [r, g, b] = rgb;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const l = (max + min) / 2;
            const d = max - min;

            let h = 0;
            let s = 0;

            if (d !== 0) {
                s = d / (1 - Math.abs(2 * l - 1));

                switch (max) {
                    case r:
                        h = ((g - b) / d) % 6;
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    default: // b
                        h = (r - g) / d + 4;
                        break;
                }

                h /= 6;
                h = mod1(h);
            }

            return rgb.length === 4 ? [h, s, l, rgb[3]] : [h, s, l];
        }

        function hue2rgb(p: number, q: number, t: number): number {
            t = mod1(t);
            if (t < 1 / 6) return p + (q - p) * (t / (1 / 6));
            if (t < 0.5) return q;
            if (t < 2 / 3) return p + (q - p) * ((2 / 3 - t) / (1 / 6));
            return p;
        }

        function hslToRgb(hsl: Color): Color {
            const [h, s, l] = hsl;

            let r: number, g: number, b: number;
            if (s === 0) {
                r = g = b = l;
            } else {
                const q = l < 0.5
                    ? l * (1 + s)
                    : l + s - l * s;

                const p = 2 * l - q;

                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return hsl.length === 4 ? [r, g, b, hsl[3]] : [r, g, b];
        }

        type HSLCh = Atarabi.color.HSLCh;

        class HSL extends HueColorBase<HSLCh> implements Atarabi.color.HSL {
            get hueIndex() {
                return 0;
            }
            constructor(protected v: Color = [1, 1, 1, 1]) {
                super();
            }
            protected create(v: Color): this {
                return new HSL(v) as this;
            }
            protected chToIndex(ch: HSLCh): number {
                switch (ch) {
                    default:
                    case 'h':
                        return 0;
                    case 's':
                        return 1;
                    case 'l':
                        return 2;
                }
            }
            toRGB(): RGB {
                return new RGB(hslToRgb(this.v));
            }
            static fromRGB(rgb: RGB): HSL {
                return new HSL(rgbToHsl(rgb.get()));
            }
            static isHSL(c: any): c is HSL {
                return c instanceof HSL;
            }
        }

        function rgbToHsb(rgb: Color): Color {
            const [r, g, b] = rgb;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const d = max - min;

            let h = 0;
            let s = 0;
            const v = max;

            if (d !== 0) {
                s = d / max;
                switch (max) {
                    case r: h = ((g - b) / d) % 6; break;
                    case g: h = (b - r) / d + 2; break;
                    default: h = (r - g) / d + 4; break; // b
                }

                h /= 6;
                h = mod1(h);
            }

            return rgb.length === 4 ? [h, s, v, rgb[3]] : [h, s, v];
        }

        function hsbToRgb(hsb: Color): Color {
            const [h, s, v] = hsb;
            let r: number, g: number, b: number;

            if (s === 0) {
                r = g = b = v; // achromatic
            } else {
                const i = Math.floor(h * 6);
                const f = h * 6 - i;
                const p = v * (1 - s);
                const q = v * (1 - s * f);
                const t = v * (1 - s * (1 - f));

                switch (i % 6) {
                    case 0: r = v; g = t; b = p; break;
                    case 1: r = q; g = v; b = p; break;
                    case 2: r = p; g = v; b = t; break;
                    case 3: r = p; g = q; b = v; break;
                    case 4: r = t; g = p; b = v; break;
                    case 5: r = v; g = p; b = q; break;
                }
            }

            return hsb.length === 4 ? [r, g, b, hsb[3]] : [r, g, b];
        }

        type HSBCh = Atarabi.color.HSBCh;

        class HSB extends HueColorBase<HSBCh> implements Atarabi.color.HSB {
            get hueIndex() {
                return 0;
            }
            constructor(protected v: Color = [1, 1, 1, 1]) {
                super();
            }
            protected create(v: Color): this {
                return new HSB(v) as this;
            }
            protected chToIndex(ch: HSBCh): number {
                switch (ch) {
                    default:
                    case 'h':
                        return 0;
                    case 's':
                        return 1;
                    case 'b':
                        return 2;
                }
            }
            toRGB(): RGB {
                return new RGB(hsbToRgb(this.v));
            }
            static fromRGB(rgb: RGB): HSB {
                return new HSB(rgbToHsb(rgb.get()));
            }
            static isHSB(c: any): c is HSB {
                return c instanceof HSB;
            }
        }

        function rgbToOklab(rgb: Color): Color {
            const [r, g, b] = rgb;

            const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
            const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
            const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

            const l_ = Math.cbrt(l);
            const m_ = Math.cbrt(m);
            const s_ = Math.cbrt(s);

            const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
            const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
            const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

            return rgb.length === 4 ? [L, a, b_, rgb[3]] : [L, a, b_];
        }

        function oklabToRgb(lab: Color): Color {
            const [L, a, b] = lab;

            const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
            const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
            const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

            const l = l_ ** 3;
            const m = m_ ** 3;
            const s = s_ ** 3;

            let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
            let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
            let b_ = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

            return lab.length === 4 ? [r, g, b_, lab[3]] : [r, g, b_];
        }

        type OklabCh = Atarabi.color.OklabCh;

        class Oklab extends ColorBase<OklabCh> implements Atarabi.color.Oklab {
            constructor(protected v: Color = [1, 1, 1, 1]) {
                super();
            }
            protected create(v: Color): this {
                return new Oklab(v) as this;
            }
            protected chToIndex(ch: OklabCh): number {
                switch (ch) {
                    default:
                    case 'l':
                        return 0;
                    case 'a':
                        return 1;
                    case 'b':
                        return 2;
                }
            }
            toOklch(): Oklch {
                return new Oklch(oklabToOklch(this.v));
            }
            toRGB(gamma = thisLayer.thisProject.linearBlending ? 1 : DEFAULT_GAMMA): RGB {
                return new RGB(oklabToRgb(this.v)).gamma(gamma);
            }
            static fromRGB(rgb: RGB, gamma = thisLayer.thisProject.linearBlending ? 1 : DEFAULT_GAMMA): Oklab {
                return new Oklab(rgbToOklab(rgb.linearize(gamma).get()));
            }
            static isOklab(c: any): c is Oklab {
                return c instanceof Oklab;
            }
        }

        function oklabToOklch(lab: Color): Color {
            const [l, a, b] = lab;
            const c = Math.hypot(a, b);
            let h = 0;
            if (c !== 0) {
                h = Math.atan2(b, a) / (2 * Math.PI);
                h = mod1(h);
            }
            return lab.length === 4 ? [l, c, h, lab[3]] : [l, c, h];
        }

        function oklchToOklab(lch: Color): Color {
            const [l, c, h] = lch;
            const angle = h * 2 * Math.PI;
            const a = c * Math.cos(angle);
            const b = c * Math.sin(angle);
            return lch.length === 4 ? [l, a, b, lch[3]] : [l, a, b];
        }

        type OklchCh = Atarabi.color.OklchCh;

        class Oklch extends HueColorBase<OklchCh> implements Atarabi.color.Oklch {
            get hueIndex() {
                return 2;
            }
            constructor(protected v: Color = [1, 1, 1, 1]) {
                super();
            }
            protected create(v: Color): this {
                return new Oklch(v) as this;
            }
            protected chToIndex(ch: OklchCh): number {
                switch (ch) {
                    default:
                    case 'l':
                        return 0;
                    case 'c':
                        return 1;
                    case 'h':
                        return 2;
                }
            }
            toOklab(): Oklab {
                return new Oklab(oklchToOklab(this.v));
            }
            toRGB(gamma = thisLayer.thisProject.linearBlending ? 1 : DEFAULT_GAMMA): RGB {
                return this.toOklab().toRGB(gamma);
            }
            static fromOklab(lab: Oklab): Oklch {
                return new Oklch(oklabToOklch(lab.get()));
            }
            static fromRGB(rgb: RGB, gamma = thisLayer.thisProject.linearBlending ? 1 : DEFAULT_GAMMA): Oklch {
                return Oklab.fromRGB(rgb, gamma).toOklch();
            }
            static isOklch(c: any): c is Oklch {
                return c instanceof Oklch;
            }
        }

        const lib = {
            keyframeProgress,
            RGB,
            YCbCr,
            HSL,
            HSB,
            Oklab,
            Oklch,
        } satisfies Atarabi.color.Lib;

        LIB.color = lib;

        return lib;
    },
})