export { };

const { RGB, YCbCr, HSL, HSB, Oklab, Oklch } = footage("@color.jsx").sourceData.load(true);
const { Assert, Test } = footage("@test.jsx").sourceData.load();

Test.describe("RGB", () => {

    const rgb3: [number, number, number] = [0.1, 0.2, 0.3];
    const rgba4: [number, number, number, number] = [0.1, 0.2, 0.3, 0.4];

    Test.test("constructor", () => {
        const c3 = new RGB(rgb3);
        Assert.deepEqual(c3.get(), rgb3);

        const c4 = new RGB(rgba4);
        Assert.deepEqual(c4.get(), rgba4);
    });

    Test.test("clone", () => {
        const c3 = new RGB(rgb3);
        const clone3 = c3.clone();
        Assert.deepEqual(clone3.get(), c3.get());
        Assert.throws(() => { Assert.equal(clone3, c3) })

        const c4 = new RGB(rgba4);
        const clone4 = c4.clone();
        Assert.deepEqual(clone4.get(), c4.get());
        Assert.throws(() => { Assert.equal(clone4, c4) })
    });

    Test.test("op", () => {
        const c = new RGB(rgba4);

        const c1 = c.add(0.1);
        Assert.near(c1.get(), [0.2, 0.3, 0.4, 0.4]);

        const c2 = c1.addAt(1, 0.1);
        Assert.near(c2.get(), [0.2, 0.4, 0.4, 0.4]);

        const c3 = c2.sub(0.1);
        Assert.near(c3.get(), [0.1, 0.3, 0.3, 0.4]);

        const c4 = c3.subAt(2, 0.05);
        Assert.near(c4.get(), [0.1, 0.3, 0.25, 0.4]);

        const c5 = c4.mul(2);
        Assert.near(c5.get(), [0.2, 0.6, 0.5, 0.4]);

        const c6 = c5.mulAt(0, 0.5);
        Assert.near(c6.get(), [0.1, 0.6, 0.5, 0.4]);

        const c7 = c6.div(2);
        Assert.near(c7.get(), [0.05, 0.3, 0.25, 0.4]);

        const c8 = c7.divAt(1, 2);
        Assert.near(c8.get(), [0.05, 0.15, 0.25, 0.4]);
    });

    Test.test("gamma and linearize", () => {
        const c = new RGB([0.25, 0.5, 0.75, 1.0]);

        const gamma = c.gamma(2);
        Assert.near(gamma.get(), [
            Math.pow(0.25, 1 / 2),
            Math.pow(0.5, 1 / 2),
            Math.pow(0.75, 1 / 2),
            1.0
        ]);

        const linear = c.linearize(2);
        Assert.near(linear.get(), [
            Math.pow(0.25, 2),
            Math.pow(0.5, 2),
            Math.pow(0.75, 2),
            1.0
        ]);
    });

    Test.test("lerp and lerpAt", () => {
        const c1 = new RGB([0, 0, 0, 0]);
        const c2 = new RGB([1, 1, 1, 1]);

        const mid = c1.clone().lerp(c2, 0.5);
        Assert.near(mid.get(), [0.5, 0.5, 0.5, 0.5]);

        const partial = c1.clone().lerpAt(2, 0.5, 0.5);
        Assert.near(partial.get(), [0, 0, 0.25, 0]);
    });

    Test.test("toRGB", () => {
        const c = new RGB([0.1, 0.2, 0.3, 0.4]);
        const rgb = c.toRGB();
        Assert.equal(RGB.isRGB(rgb), true);
        Assert.near(rgb.get(), [0.1, 0.2, 0.3, 0.4]);
    });

});

Test.describe("YCbCr", () => {

    const ycbcr3: [number, number, number] = [0.3, 0.2, 0.8];

    Test.test("constructor", () => {
        const c = new YCbCr(ycbcr3);
        Assert.deepEqual(c.get(), ycbcr3);
    });

    Test.test("clone", () => {
        const c = new YCbCr(ycbcr3);
        const clone = c.clone();
        Assert.deepEqual(clone.get(), c.get());
        Assert.throws(() => { Assert.equal(clone, c) })
    });

    Test.test("toRGB", () => {
        const c = new YCbCr([0.9, 0.5, 0.25]);
        const rgb = c.toRGB();
        Assert.equal(RGB.isRGB(rgb), true);
    });

    Test.test("isYCbCr", () => {
        const c = new YCbCr([0, 0, 0]);
        Assert.equal(YCbCr.isYCbCr(c), true);
        Assert.equal(YCbCr.isYCbCr({}), false);
    });

    Test.test("RGB <-> YCbCr roundtrip", () => {
        const rgb = [0.2, 0.4, 0.6];
        const ycbcr = YCbCr.fromRGB(new RGB(rgb));
        const ycbcr2 = ycbcr.toRGB();
        Assert.near(ycbcr2.get(), rgb);
    });

});

Test.describe("HSL", () => {

    const hsl3: [number, number, number] = [30 / 360, 0.5, 0.25];

    Test.test("constructor", () => {
        const c = new HSL(hsl3);
        Assert.deepEqual(c.get(), hsl3);
    });

    Test.test("clone", () => {
        const c = new HSL(hsl3);
        const clone = c.clone();
        Assert.deepEqual(clone.get(), c.get());
        Assert.throws(() => { Assert.equal(clone, c) })
    });

    Test.test("lerp and lerpAtHue", () => {
        const c1 = new HSL([0 / 360, 0.5, 0.5]);
        const c2 = new HSL([180 / 360, 1.0, 1.0]);

        const mid = c1.lerp(c2, 0.5);
        Assert.deepEqual(mid.get(), [0.25, 0.75, 0.75]); 

        const hueOnly = c1.lerpAtHue(180 / 360, 0.5, 'shorter');
        Assert.deepEqual(hueOnly.get(), [0.25, 0.5, 0.5]);
    });

    Test.test("toRGB", () => {
        const c = new HSL([30 / 360, 0.5, 0.25]);
        const rgb = c.toRGB();
        Assert.equal(RGB.isRGB(rgb), true);
    });

    Test.test("isHSL", () => {
        const c = new HSL([0, 0, 0]);
        Assert.equal(HSL.isHSL(c), true);
        Assert.equal(HSL.isHSL({}), false);
    });

    Test.test("RGB <-> HSL roundtrip", () => {
        const rgb = [0.2, 0.4, 0.6];
        const hsl = HSL.fromRGB(new RGB(rgb));
        const rgb2 = hsl.toRGB();
        Assert.near(rgb2.get(), rgb);
    });

});

Test.describe("HSB", () => {

    const hsb3: [number, number, number] = [0.1, 0.5, 0.25];

    Test.test("constructor", () => {
        const c = new HSB(hsb3);
        Assert.deepEqual(c.get(), hsb3);
    });

    Test.test("clone", () => {
        const c = new HSB(hsb3);
        const clone = c.clone();
        Assert.deepEqual(clone.get(), c.get());
        Assert.throws(() => { Assert.equal(clone, c) })
    });

    Test.test("lerp and lerpAtHue methods", () => {
        const c1 = new HSB([0, 0.5, 0.5]);
        const c2 = new HSB([0.5, 1.0, 1.0]);

        const mid = c1.lerp(c2, 0.5);
        Assert.near(mid.get(), [0.25, 0.75, 0.75]);

        const hueOnly = c1.lerpAtHue(0.5, 0.5, 'shorter');
        Assert.near(hueOnly.get(), [0.25, 0.5, 0.5]);
    });

    Test.test("toRGB", () => {
        const c = new HSB([0.1, 0.5, 0.25]);
        const rgb = c.toRGB();
        Assert.equal(RGB.isRGB(rgb), true);
    });

    Test.test("isHSB", () => {
        const c = new HSB([0, 0, 0]);
        Assert.equal(HSB.isHSB(c), true);
        Assert.equal(HSB.isHSB({}), false);
    });

    Test.test("RGB <-> HSB roundtrip", () => {
        const rgb = [0.2, 0.4, 0.6];
        const hsb = HSB.fromRGB(new RGB(rgb));
        const rgb2 = hsb.toRGB();
        Assert.near(rgb2.get(), rgb);
    });

});

Test.describe("Oklab", () => {

    Test.test("constructor", () => {
        const lab: [number, number, number] = [0.6, 0.1, -0.05];
        const c = new Oklab(lab);
        Assert.deepEqual(c.get(), lab);
    });

    Test.test("clone", () => {
        const c = new Oklab([0.4, 0.2, -0.2]);
        const clone = c.clone();
        Assert.deepEqual(clone.get(), c.get());
        Assert.throws(() => { Assert.equal(clone, c) })
    });

    Test.test("RGB <-> Oklab", () => {
        const rgb = new RGB([0.25, 0.5, 0.75]);
        const lab = Oklab.fromRGB(rgb, 1);
        const rgb2 = lab.toRGB(1);

        Assert.near(rgb2.get(), rgb.get(), 1e-6);
    });

    Test.test("RGB <-> Oklab roundtrip with gamma", () => {
        const rgb = new RGB([0.1, 0.4, 0.9]);
        const lab = Oklab.fromRGB(rgb, 2.2);
        const rgb2 = lab.toRGB(2.2);
        Assert.near(rgb2.get(), rgb.get(), 1e-4);
    });

    Test.test("isOklab", () => {
        const c = new Oklab([0, 0, 0]);

        Assert.equal(Oklab.isOklab(c), true);
        Assert.equal(Oklab.isOklab({}), false);
        Assert.equal(Oklab.isOklab(null), false);
    });

});

Test.describe("Oklch", () => {

    Test.test("constructor", () => {
        const lch: [number, number, number] = [0.6, 0.1, 0.2];
        const c = new Oklch(lch);
        Assert.deepEqual(c.get(), lch);
    });

    Test.test("clone", () => {
        const c = new Oklch([0.4, 0.2, 0.2]);
        const clone = c.clone();
        Assert.deepEqual(clone.get(), c.get());
        Assert.throws(() => { Assert.equal(clone, c) })
    });

    Test.test("RGB <-> Oklch", () => {
        const rgb = new RGB([0.25, 0.5, 0.75]);
        const lab = Oklch.fromRGB(rgb, 1);
        const rgb2 = lab.toRGB(1);

        Assert.near(rgb2.get(), rgb.get(), 1e-6);
    });

    Test.test("RGB <-> Oklch roundtrip with gamma", () => {
        const rgb = new RGB([0.1, 0.4, 0.9]);
        const lab = Oklch.fromRGB(rgb, 2.2);
        const rgb2 = lab.toRGB(2.2);
        Assert.near(rgb2.get(), rgb.get(), 1e-4);
    });

    Test.test("isOklch", () => {
        const c = new Oklch([0, 0, 0]);

        Assert.equal(Oklch.isOklch(c), true);
        Assert.equal(Oklch.isOklch({}), false);
        Assert.equal(Oklch.isOklch(null), false);
    });

});

Test.run();