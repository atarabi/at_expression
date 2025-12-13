({
    load() {
        const LIB = $.__lib = $.__lib || {};
        if (LIB.math) {
            return LIB.math;
        }
        class Vector {
            v;
            constructor(v) {
                this.v = v;
            }
            get x() { return this.v[0]; }
            get y() { return this.v[1]; }
            clone() {
                return new Vector([this.x, this.y]);
            }
            add(v) {
                if (typeof v === 'number') {
                    return new Vector([this.x + v, this.y + v]);
                }
                else {
                    return new Vector([this.x + v.x, this.y + v.y]);
                }
            }
            sub(v) {
                if (typeof v === 'number') {
                    return new Vector([this.x - v, this.y - v]);
                }
                else {
                    return new Vector([this.x - v.x, this.y - v.y]);
                }
            }
            mul(v) {
                if (typeof v === 'number') {
                    return new Vector([this.x * v, this.y * v]);
                }
                else {
                    return new Vector([this.x * v.x, this.y * v.y]);
                }
            }
            div(v) {
                if (typeof v === 'number') {
                    return new Vector([this.x / v, this.y / v]);
                }
                else {
                    return new Vector([this.x / v.x, this.y / v.y]);
                }
            }
            dot(v) {
                return this.x * v.x + this.y * v.y;
            }
            len() {
                return Math.hypot(this.x, this.y);
            }
            norm() {
                const L = this.len();
                return L === 0 ? new Vector([0, 0]) : new Vector([this.x / L, this.y / L]);
            }
            apply(m) {
                const x = this.x;
                const y = this.y;
                const X = x * m.m00 + y * m.m01 + m.m02;
                const Y = x * m.m10 + y * m.m11 + m.m12;
                const W = x * m.m20 + y * m.m21 + m.m22;
                if (W !== 0) {
                    return new Vector([X / W, Y / W]);
                }
                else {
                    return new Vector([X, Y]); // or throw
                }
            }
            toString() {
                return `(${this.x}, ${this.y})`;
            }
            get() {
                return this.v;
            }
            static zero() {
                return new Vector([0, 0]);
            }
            static isVector(v) {
                return v instanceof Vector;
            }
        }
        class Matrix {
            m;
            constructor(m = [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1,
            ]) {
                this.m = m;
            }
            get m00() { return this.m[0]; }
            get m01() { return this.m[1]; }
            get m02() { return this.m[2]; }
            get m10() { return this.m[3]; }
            get m11() { return this.m[4]; }
            get m12() { return this.m[5]; }
            get m20() { return this.m[6]; }
            get m21() { return this.m[7]; }
            get m22() { return this.m[8]; }
            clone() {
                return new Matrix([...this.m]);
            }
            mul(m) {
                const a = this.m;
                const c = m.m;
                const r = new Array(9);
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        r[row * 3 + col] =
                            a[row * 3 + 0] * c[0 * 3 + col] +
                                a[row * 3 + 1] * c[1 * 3 + col] +
                                a[row * 3 + 2] * c[2 * 3 + col];
                    }
                }
                return new Matrix(r);
            }
            applyTo(v) {
                return v.apply(this);
            }
            inverse() {
                const [a, b, c, d, e, f, g, h, i] = this.m;
                const A = e * i - f * h;
                const B = -(d * i - f * g);
                const C = d * h - e * g;
                const D = -(b * i - c * h);
                const E = a * i - c * g;
                const F = -(a * h - b * g);
                const G = b * f - c * e;
                const H = -(a * f - c * d);
                const I = a * e - b * d;
                const det = a * A + b * B + c * C;
                if (det === 0)
                    return Matrix.identity();
                const invDet = 1 / det;
                return new Matrix([
                    A * invDet, D * invDet, G * invDet,
                    B * invDet, E * invDet, H * invDet,
                    C * invDet, F * invDet, I * invDet
                ]);
            }
            // ignore skew
            decompose() {
                const m = this.m;
                const t = new Vector([m[2], m[5]]);
                const sx = Math.hypot(m[0], m[3]);
                const sy = Math.hypot(m[1], m[4]);
                let r = 0;
                if (sx !== 0) {
                    r = Math.atan2(m[3] / sx, m[0] / sx);
                }
                return {
                    translate: t,
                    rotate: r,
                    scale: new Vector([sx, sy])
                };
            }
            toString() {
                const m = this.m;
                return (`[ ${m[0]}, ${m[1]}, ${m[2]} ]\n` +
                    `[ ${m[3]}, ${m[4]}, ${m[5]} ]\n` +
                    `[ ${m[6]}, ${m[7]}, ${m[8]} ]`);
            }
            static zero() {
                return new Matrix([
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0,
                ]);
            }
            static identity() {
                return new Matrix();
            }
            static translate(tx, ty) {
                return new Matrix([
                    1, 0, tx,
                    0, 1, ty,
                    0, 0, 1
                ]);
            }
            static scale(sx, sy = sx) {
                return new Matrix([
                    sx, 0, 0,
                    0, sy, 0,
                    0, 0, 1
                ]);
            }
            static rotate(rad) {
                const c = Math.cos(rad), s = Math.sin(rad);
                return new Matrix([
                    c, -s, 0,
                    s, c, 0,
                    0, 0, 1
                ]);
            }
            static skew(ax, ay) {
                return new Matrix([
                    1, Math.tan(ax), 0,
                    Math.tan(ay), 1, 0,
                    0, 0, 1
                ]);
            }
            static fromTransform(pos, anchor, scale, rotation) {
                return Matrix
                    .translate(pos.x, pos.y)
                    .mul(Matrix.rotate(rotation))
                    .mul(Matrix.scale(scale.x, scale.y))
                    .mul(Matrix.translate(-anchor.x, -anchor.y));
            }
            static fromLayerTransform(layer) {
                return this.fromTransform(new Vector(layer.position.value), new Vector(layer.anchorPoint.value), new Vector(layer.scale.value).div(100), thisLayer.degreesToRadians(layer.rotation.value));
            }
            static isMatrix(m) {
                return m instanceof Matrix;
            }
        }
        const lib = {
            Vector,
            Matrix,
        };
        LIB.math = lib;
        return lib;
    }
})
