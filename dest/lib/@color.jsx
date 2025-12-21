({
    load(force = false) {
        const LIB = $.__lib = $.__lib || {};
        if (!force && LIB.color) {
            return LIB.color;
        }
        function calculateCompletion(c, c1, c2) {
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
        function keyframeProgress(time = thisLayer.time, property = thisProperty) {
            const currentV = property.valueAtTime(time);
            if (property.numKeys <= 1) {
                return {
                    prevValue: currentV,
                    nextValue: currentV,
                    t: 0,
                };
            }
            const N = property.numKeys;
            const k = property.nearestKey(time);
            const v = property.valueAtTime(k.time);
            if (k.time <= time) {
                if (k.index >= N) {
                    return {
                        prevValue: v,
                        nextValue: v,
                        t: 0,
                    };
                }
                const nextK = property.key(k.index + 1);
                const nextV = property.valueAtTime(nextK.time);
                return {
                    prevValue: v,
                    nextValue: nextV,
                    t: calculateCompletion(currentV, v, nextV),
                };
            }
            else {
                if (k.index <= 1) {
                    return {
                        prevValue: v,
                        nextValue: v,
                        t: 0,
                    };
                }
                const prevK = property.key(k.index - 1);
                const prevV = property.valueAtTime(prevK.time);
                return {
                    prevValue: prevV,
                    nextValue: v,
                    t: calculateCompletion(currentV, prevV, v),
                };
            }
        }
        class ColorBase {
            clone() {
                return this.create([...this.v]);
            }
            op(fn) {
                return this.create(this.v.map(fn));
            }
            opAt(index, fn) {
                const v = [...this.v];
                index = typeof index === 'number' ? index : this.chToIndex(index);
                v[index] = fn(v[index]);
                return this.create(v);
            }
            add(value) {
                return this.op((v, i) => i === 3 ? v : v + value);
            }
            addAt(index, value) {
                return this.opAt(index, v => v + value);
            }
            sub(value) {
                return this.op((v, i) => i === 3 ? v : v - value);
            }
            subAt(index, value) {
                return this.opAt(index, v => v - value);
            }
            mul(value) {
                return this.op((v, i) => i === 3 ? v : v * value);
            }
            mulAt(index, value) {
                return this.opAt(index, v => v * value);
            }
            div(value) {
                return this.op((v, i) => i === 3 ? v : v / value);
            }
            divAt(index, value) {
                return this.opAt(index, v => v / value);
            }
            opAtAll(fn) {
                return this.create(this.v.map(fn));
            }
            lerp(c, t) {
                const a = this.v;
                const b = c.v;
                const out = a.map((v, i) => v + (b[i] - v) * t);
                return this.create(out);
            }
            lerpAt(index, value, t) {
                return this.opAt(index, v => v + (value - v) * t);
            }
            get() {
                return this.v;
            }
        }
        function mod(n, m) {
            return ((n % m) + m) % m;
        }
        function mod1(n) {
            return mod(n, 1);
        }
        function lerpHue(h1, h2, t, method = 'shorter') {
            let delta = mod1(h2 - h1);
            switch (method) {
                case 'shorter':
                    if (delta > 0.5)
                        delta -= 1;
                    break;
                case 'longer':
                    if (delta < 0.5)
                        delta -= 1;
                    break;
                case 'increasing':
                    if (delta < 0)
                        delta += 1;
                    break;
                case 'decreasing':
                    if (delta > 0)
                        delta -= 1;
                    break;
            }
            const h = h1 + delta * t;
            return mod1(h);
        }
        class HueColorBase extends ColorBase {
            lerp(c, t, method = 'shorter') {
                const a = this.v;
                const b = c.v;
                const out = a.map((v, i) => i === this.hueIndex ? lerpHue(v, b[i], t, method) : v + (b[i] - v) * t);
                return this.create(out);
            }
            lerpAtHue(value, t, method = 'shorter') {
                return this.opAt(this.hueIndex, v => lerpHue(v, value, t, method));
            }
        }
        function fitArrayLength(src, len, fill = 1) {
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
        class RGB extends ColorBase {
            v;
            constructor(v = [1, 1, 1, 1]) {
                super();
                this.v = v;
            }
            create(v) {
                return new RGB(v);
            }
            chToIndex(ch) {
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
            gamma(gamma = DEFAULT_GAMMA) {
                const inv = 1 / gamma;
                return this.op((v, i) => i === 3 ? v : Math.pow(v, inv));
            }
            linearize(gamma = DEFAULT_GAMMA) {
                return this.op((v, i) => i === 3 ? v : Math.pow(v, gamma));
            }
            clamp() {
                return this.op(v => Math.min(1, Math.max(0, v)));
            }
            toRGB() {
                return this.clone();
            }
            value() {
                const v = thisProperty.value;
                if (Array.isArray(v)) {
                    return fitArrayLength(this.v, v.length);
                }
                else {
                    return [...this.v];
                }
            }
            static fromRGB(rgb) {
                return rgb.clone();
            }
            static isRGB(c) {
                return c instanceof RGB;
            }
        }
        function rgbToYCbCr(rgb) {
            const [r, g, b] = rgb;
            const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const cb = (b - y) / 1.8556 + 0.5;
            const cr = (r - y) / 1.5748 + 0.5;
            return rgb.length === 4 ? [y, cb, cr, rgb[3]] : [y, cb, cr];
        }
        function yCbCrToRgb(ycc) {
            const [y, cbN, crN] = ycc;
            const cb = cbN - 0.5;
            const cr = crN - 0.5;
            const r = y + 1.5748 * cr;
            const b = y + 1.8556 * cb;
            const g = (y - 0.2126 * r - 0.0722 * b) / 0.7152;
            return ycc.length === 4 ? [r, g, b, ycc[3]] : [r, g, b];
        }
        class YCbCr extends ColorBase {
            v;
            constructor(v = [1, 1, 1, 1]) {
                super();
                this.v = v;
            }
            create(v) {
                return new YCbCr(v);
            }
            chToIndex(ch) {
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
            toRGB() {
                return new RGB(yCbCrToRgb(this.v));
            }
            static fromRGB(rgb) {
                return new YCbCr(rgbToYCbCr(rgb.get()));
            }
            static isYCbCr(c) {
                return c instanceof YCbCr;
            }
        }
        function rgbToHsl(rgb) {
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
        function hue2rgb(p, q, t) {
            t = mod1(t);
            if (t < 1 / 6)
                return p + (q - p) * (t / (1 / 6));
            if (t < 0.5)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * ((2 / 3 - t) / (1 / 6));
            return p;
        }
        function hslToRgb(hsl) {
            const [h, s, l] = hsl;
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            }
            else {
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
        class HSL extends HueColorBase {
            v;
            get hueIndex() {
                return 0;
            }
            constructor(v = [1, 1, 1, 1]) {
                super();
                this.v = v;
            }
            create(v) {
                return new HSL(v);
            }
            chToIndex(ch) {
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
            toRGB() {
                return new RGB(hslToRgb(this.v));
            }
            static fromRGB(rgb) {
                return new HSL(rgbToHsl(rgb.get()));
            }
            static isHSL(c) {
                return c instanceof HSL;
            }
        }
        function rgbToHsb(rgb) {
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
                    case r:
                        h = ((g - b) / d) % 6;
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    default:
                        h = (r - g) / d + 4;
                        break; // b
                }
                h /= 6;
                h = mod1(h);
            }
            return rgb.length === 4 ? [h, s, v, rgb[3]] : [h, s, v];
        }
        function hsbToRgb(hsb) {
            const [h, s, v] = hsb;
            let r, g, b;
            if (s === 0) {
                r = g = b = v; // achromatic
            }
            else {
                const i = Math.floor(h * 6);
                const f = h * 6 - i;
                const p = v * (1 - s);
                const q = v * (1 - s * f);
                const t = v * (1 - s * (1 - f));
                switch (i % 6) {
                    case 0:
                        r = v;
                        g = t;
                        b = p;
                        break;
                    case 1:
                        r = q;
                        g = v;
                        b = p;
                        break;
                    case 2:
                        r = p;
                        g = v;
                        b = t;
                        break;
                    case 3:
                        r = p;
                        g = q;
                        b = v;
                        break;
                    case 4:
                        r = t;
                        g = p;
                        b = v;
                        break;
                    case 5:
                        r = v;
                        g = p;
                        b = q;
                        break;
                }
            }
            return hsb.length === 4 ? [r, g, b, hsb[3]] : [r, g, b];
        }
        class HSB extends HueColorBase {
            v;
            get hueIndex() {
                return 0;
            }
            constructor(v = [1, 1, 1, 1]) {
                super();
                this.v = v;
            }
            create(v) {
                return new HSB(v);
            }
            chToIndex(ch) {
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
            toRGB() {
                return new RGB(hsbToRgb(this.v));
            }
            static fromRGB(rgb) {
                return new HSB(rgbToHsb(rgb.get()));
            }
            static isHSB(c) {
                return c instanceof HSB;
            }
        }
        function rgbToOklab(rgb) {
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
        function oklabToRgb(lab) {
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
        class Oklab extends ColorBase {
            v;
            constructor(v = [1, 1, 1, 1]) {
                super();
                this.v = v;
            }
            create(v) {
                return new Oklab(v);
            }
            chToIndex(ch) {
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
            toOklch() {
                return new Oklch(oklabToOklch(this.v));
            }
            toRGB(gamma = thisLayer.thisProject.linearBlending ? 1 : DEFAULT_GAMMA) {
                return new RGB(oklabToRgb(this.v)).gamma(gamma);
            }
            static fromRGB(rgb, gamma = thisLayer.thisProject.linearBlending ? 1 : DEFAULT_GAMMA) {
                return new Oklab(rgbToOklab(rgb.linearize(gamma).get()));
            }
            static isOklab(c) {
                return c instanceof Oklab;
            }
        }
        function oklabToOklch(lab) {
            const [l, a, b] = lab;
            const c = Math.hypot(a, b);
            let h = 0;
            if (c !== 0) {
                h = Math.atan2(b, a) / (2 * Math.PI);
                h = mod1(h);
            }
            return lab.length === 4 ? [l, c, h, lab[3]] : [l, c, h];
        }
        function oklchToOklab(lch) {
            const [l, c, h] = lch;
            const angle = h * 2 * Math.PI;
            const a = c * Math.cos(angle);
            const b = c * Math.sin(angle);
            return lch.length === 4 ? [l, a, b, lch[3]] : [l, a, b];
        }
        class Oklch extends HueColorBase {
            v;
            get hueIndex() {
                return 2;
            }
            constructor(v = [1, 1, 1, 1]) {
                super();
                this.v = v;
            }
            create(v) {
                return new Oklch(v);
            }
            chToIndex(ch) {
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
            toOklab() {
                return new Oklab(oklchToOklab(this.v));
            }
            toRGB(gamma = thisLayer.thisProject.linearBlending ? 1 : DEFAULT_GAMMA) {
                return this.toOklab().toRGB(gamma);
            }
            static fromOklab(lab) {
                return new Oklch(oklabToOklch(lab.get()));
            }
            static fromRGB(rgb, gamma = thisLayer.thisProject.linearBlending ? 1 : DEFAULT_GAMMA) {
                return Oklab.fromRGB(rgb, gamma).toOklch();
            }
            static isOklch(c) {
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
        };
        LIB.color = lib;
        return lib;
    },
})
