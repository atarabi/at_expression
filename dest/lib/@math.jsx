({
    load(force = false) {
        const LIB = $.__Atarabi = $.__Atarabi || {};
        if (!force && LIB.Math) {
            return LIB.Math;
        }
        class Vec2 {
            v;
            constructor(v) {
                this.v = v;
            }
            get x() { return this.v[0]; }
            get y() { return this.v[1]; }
            clone() {
                return new Vec2([this.x, this.y]);
            }
            add(v) {
                if (typeof v === 'number') {
                    return new Vec2([this.x + v, this.y + v]);
                }
                else {
                    return new Vec2([this.x + v.x, this.y + v.y]);
                }
            }
            sub(v) {
                if (typeof v === 'number') {
                    return new Vec2([this.x - v, this.y - v]);
                }
                else {
                    return new Vec2([this.x - v.x, this.y - v.y]);
                }
            }
            mul(v) {
                if (typeof v === 'number') {
                    return new Vec2([this.x * v, this.y * v]);
                }
                else {
                    return new Vec2([this.x * v.x, this.y * v.y]);
                }
            }
            div(v) {
                if (typeof v === 'number') {
                    return new Vec2([this.x / v, this.y / v]);
                }
                else {
                    return new Vec2([this.x / v.x, this.y / v.y]);
                }
            }
            rotate(angle) {
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                return new Vec2([
                    this.x * cos - this.y * sin,
                    this.x * sin + this.y * cos
                ]);
            }
            map(fn) {
                if (fn.length <= 1) {
                    return new Vec2([
                        fn(this.x),
                        fn(this.y),
                    ]);
                }
                else {
                    return new Vec2([
                        fn(this.x, 0),
                        fn(this.y, 1),
                    ]);
                }
            }
            dot(v) {
                return this.x * v.x + this.y * v.y;
            }
            cross(v) {
                return this.x * v.y - this.y * v.x;
            }
            len() {
                return Math.hypot(this.x, this.y);
            }
            norm() {
                const L = this.len();
                return L === 0 ? new Vec2([0, 0]) : new Vec2([this.x / L, this.y / L]);
            }
            apply(m) {
                const x = this.x;
                const y = this.y;
                const X = x * m.m00 + y * m.m01 + m.m02;
                const Y = x * m.m10 + y * m.m11 + m.m12;
                const W = x * m.m20 + y * m.m21 + m.m22;
                if (W !== 0) {
                    return new Vec2([X / W, Y / W]);
                }
                else {
                    return new Vec2([X, Y]); // or throw
                }
            }
            toString() {
                return `(${this.x}, ${this.y})`;
            }
            get() {
                return this.v;
            }
            static zero() {
                return new Vec2([0, 0]);
            }
            static isVec2(v) {
                return v instanceof Vec2;
            }
        }
        class Vec3 {
            v;
            constructor(v) {
                this.v = v;
            }
            get x() { return this.v[0]; }
            get y() { return this.v[1]; }
            get z() { return this.v[2]; }
            clone() {
                return new Vec3([this.x, this.y, this.z]);
            }
            add(v) {
                if (typeof v === 'number') {
                    return new Vec3([this.x + v, this.y + v, this.z + v]);
                }
                else {
                    return new Vec3([this.x + v.x, this.y + v.y, this.z + v.z]);
                }
            }
            sub(v) {
                if (typeof v === 'number') {
                    return new Vec3([this.x - v, this.y - v, this.z - v]);
                }
                else {
                    return new Vec3([this.x - v.x, this.y - v.y, this.z - v.z]);
                }
            }
            mul(v) {
                if (typeof v === 'number') {
                    return new Vec3([this.x * v, this.y * v, this.z * v]);
                }
                else {
                    return new Vec3([this.x * v.x, this.y * v.y, this.z * v.z]);
                }
            }
            div(v) {
                if (typeof v === 'number') {
                    return new Vec3([this.x / v, this.y / v, this.z / v]);
                }
                else {
                    return new Vec3([this.x / v.x, this.y / v.y, this.z / v.z]);
                }
            }
            map(fn) {
                if (fn.length <= 1) {
                    return new Vec3([
                        fn(this.x),
                        fn(this.y),
                        fn(this.z),
                    ]);
                }
                else {
                    return new Vec3([
                        fn(this.x, 0),
                        fn(this.y, 1),
                        fn(this.z, 2),
                    ]);
                }
            }
            dot(v) {
                return this.x * v.x + this.y * v.y + this.z * v.z;
            }
            cross(v) {
                return new Vec3([
                    this.y * v.z - this.z * v.y,
                    this.z * v.x - this.x * v.z,
                    this.x * v.y - this.y * v.x,
                ]);
            }
            len() {
                return Math.hypot(this.x, this.y, this.z);
            }
            norm() {
                const L = this.len();
                return L === 0 ? new Vec3([0, 0, 0]) : this.div(L);
            }
            apply(m) {
                const x = this.x, y = this.y, z = this.z;
                const X = x * m.m00 + y * m.m01 + z * m.m02 + m.m03;
                const Y = x * m.m10 + y * m.m11 + z * m.m12 + m.m13;
                const Z = x * m.m20 + y * m.m21 + z * m.m22 + m.m23;
                const W = x * m.m30 + y * m.m31 + z * m.m32 + m.m33;
                if (W !== 0) {
                    return new Vec3([X / W, Y / W, Z / W]);
                }
                else {
                    return new Vec3([X, Y, Z]);
                }
            }
            toString() {
                return `(${this.x}, ${this.y}, ${this.z})`;
            }
            get() {
                return this.v;
            }
            static zero() {
                return new Vec3([0, 0, 0]);
            }
            static isVec3(v) {
                return v instanceof Vec3;
            }
        }
        class Mat3 {
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
                return new Mat3([...this.m]);
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
                return new Mat3(r);
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
                    return Mat3.identity();
                const invDet = 1 / det;
                return new Mat3([
                    A * invDet, D * invDet, G * invDet,
                    B * invDet, E * invDet, H * invDet,
                    C * invDet, F * invDet, I * invDet
                ]);
            }
            // ignore skew
            decompose() {
                const m = this.m;
                const t = new Vec2([m[2], m[5]]);
                const sx = Math.hypot(m[0], m[3]);
                const sy = Math.hypot(m[1], m[4]);
                let r = 0;
                if (sx !== 0) {
                    r = Math.atan2(m[3] / sx, m[0] / sx);
                }
                return {
                    translate: t,
                    rotate: r,
                    scale: new Vec2([sx, sy])
                };
            }
            toString() {
                const m = this.m;
                return (`[ ${m[0]}, ${m[1]}, ${m[2]} ]\n` +
                    `[ ${m[3]}, ${m[4]}, ${m[5]} ]\n` +
                    `[ ${m[6]}, ${m[7]}, ${m[8]} ]`);
            }
            static zero() {
                return new Mat3([
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0,
                ]);
            }
            static identity() {
                return new Mat3();
            }
            static translate(tx, ty) {
                return new Mat3([
                    1, 0, tx,
                    0, 1, ty,
                    0, 0, 1
                ]);
            }
            static scale(sx, sy = sx) {
                return new Mat3([
                    sx, 0, 0,
                    0, sy, 0,
                    0, 0, 1
                ]);
            }
            static rotate(rad) {
                const c = Math.cos(rad), s = Math.sin(rad);
                return new Mat3([
                    c, -s, 0,
                    s, c, 0,
                    0, 0, 1
                ]);
            }
            static skew(ax, ay) {
                return new Mat3([
                    1, Math.tan(ax), 0,
                    Math.tan(ay), 1, 0,
                    0, 0, 1
                ]);
            }
            static fromTransform(pos, anchor, scale, rotation) {
                return Mat3
                    .translate(pos.x, pos.y)
                    .mul(Mat3.rotate(rotation))
                    .mul(Mat3.scale(scale.x, scale.y))
                    .mul(Mat3.translate(-anchor.x, -anchor.y));
            }
            static fromLayerTransform(layer) {
                return this.fromTransform(new Vec2(layer.position.value), new Vec2(layer.anchorPoint.value), new Vec2(layer.scale.value).div(100), thisLayer.degreesToRadians(layer.rotation.value));
            }
            static isMat3(m) {
                return m instanceof Mat3;
            }
        }
        class Mat4 {
            m;
            constructor(m = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]) {
                this.m = m;
            }
            get m00() { return this.m[0]; }
            get m01() { return this.m[1]; }
            get m02() { return this.m[2]; }
            get m03() { return this.m[3]; }
            get m10() { return this.m[4]; }
            get m11() { return this.m[5]; }
            get m12() { return this.m[6]; }
            get m13() { return this.m[7]; }
            get m20() { return this.m[8]; }
            get m21() { return this.m[9]; }
            get m22() { return this.m[10]; }
            get m23() { return this.m[11]; }
            get m30() { return this.m[12]; }
            get m31() { return this.m[13]; }
            get m32() { return this.m[14]; }
            get m33() { return this.m[15]; }
            clone() {
                return new Mat4([...this.m]);
            }
            mul(m) {
                const a = this.m;
                const b = m.m;
                const r = new Array(16);
                for (let row = 0; row < 4; row++) {
                    for (let col = 0; col < 4; col++) {
                        r[row * 4 + col] =
                            a[row * 4 + 0] * b[0 * 4 + col] +
                                a[row * 4 + 1] * b[1 * 4 + col] +
                                a[row * 4 + 2] * b[2 * 4 + col] +
                                a[row * 4 + 3] * b[3 * 4 + col];
                    }
                }
                return new Mat4(r);
            }
            applyTo(v) {
                return v.apply(this);
            }
            inverse() {
                const m = this.m;
                const inv = new Array(16);
                inv[0] = m[5] * m[10] * m[15] -
                    m[5] * m[11] * m[14] -
                    m[9] * m[6] * m[15] +
                    m[9] * m[7] * m[14] +
                    m[13] * m[6] * m[11] -
                    m[13] * m[7] * m[10];
                inv[4] = -m[4] * m[10] * m[15] +
                    m[4] * m[11] * m[14] +
                    m[8] * m[6] * m[15] -
                    m[8] * m[7] * m[14] -
                    m[12] * m[6] * m[11] +
                    m[12] * m[7] * m[10];
                inv[8] = m[4] * m[9] * m[15] -
                    m[4] * m[11] * m[13] -
                    m[8] * m[5] * m[15] +
                    m[8] * m[7] * m[13] +
                    m[12] * m[5] * m[11] -
                    m[12] * m[7] * m[9];
                inv[12] = -m[4] * m[9] * m[14] +
                    m[4] * m[10] * m[13] +
                    m[8] * m[5] * m[14] -
                    m[8] * m[6] * m[13] -
                    m[12] * m[5] * m[10] +
                    m[12] * m[6] * m[9];
                inv[1] = -m[1] * m[10] * m[15] +
                    m[1] * m[11] * m[14] +
                    m[9] * m[2] * m[15] -
                    m[9] * m[3] * m[14] -
                    m[13] * m[2] * m[11] +
                    m[13] * m[3] * m[10];
                inv[5] = m[0] * m[10] * m[15] -
                    m[0] * m[11] * m[14] -
                    m[8] * m[2] * m[15] +
                    m[8] * m[3] * m[14] +
                    m[12] * m[2] * m[11] -
                    m[12] * m[3] * m[10];
                inv[9] = -m[0] * m[9] * m[15] +
                    m[0] * m[11] * m[13] +
                    m[8] * m[1] * m[15] -
                    m[8] * m[3] * m[13] -
                    m[12] * m[1] * m[11] +
                    m[12] * m[3] * m[9];
                inv[13] = m[0] * m[9] * m[14] -
                    m[0] * m[10] * m[13] -
                    m[8] * m[1] * m[14] +
                    m[8] * m[2] * m[13] +
                    m[12] * m[1] * m[10] -
                    m[12] * m[2] * m[9];
                inv[2] = m[1] * m[6] * m[15] -
                    m[1] * m[7] * m[14] -
                    m[5] * m[2] * m[15] +
                    m[5] * m[3] * m[14] +
                    m[13] * m[2] * m[7] -
                    m[13] * m[3] * m[6];
                inv[6] = -m[0] * m[6] * m[15] +
                    m[0] * m[7] * m[14] +
                    m[4] * m[2] * m[15] -
                    m[4] * m[3] * m[14] -
                    m[12] * m[2] * m[7] +
                    m[12] * m[3] * m[6];
                inv[10] = m[0] * m[5] * m[15] -
                    m[0] * m[7] * m[13] -
                    m[4] * m[1] * m[15] +
                    m[4] * m[3] * m[13] +
                    m[12] * m[1] * m[7] -
                    m[12] * m[3] * m[5];
                inv[14] = -m[0] * m[5] * m[14] +
                    m[0] * m[6] * m[13] +
                    m[4] * m[1] * m[14] -
                    m[4] * m[2] * m[13] -
                    m[12] * m[1] * m[6] +
                    m[12] * m[2] * m[5];
                inv[3] = -m[1] * m[6] * m[11] +
                    m[1] * m[7] * m[10] +
                    m[5] * m[2] * m[11] -
                    m[5] * m[3] * m[10] -
                    m[9] * m[2] * m[7] +
                    m[9] * m[3] * m[6];
                inv[7] = m[0] * m[6] * m[11] -
                    m[0] * m[7] * m[10] -
                    m[4] * m[2] * m[11] +
                    m[4] * m[3] * m[10] +
                    m[8] * m[2] * m[7] -
                    m[8] * m[3] * m[6];
                inv[11] = -m[0] * m[5] * m[11] +
                    m[0] * m[7] * m[9] +
                    m[4] * m[1] * m[11] -
                    m[4] * m[3] * m[9] -
                    m[8] * m[1] * m[7] +
                    m[8] * m[3] * m[5];
                inv[15] = m[0] * m[5] * m[10] -
                    m[0] * m[6] * m[9] -
                    m[4] * m[1] * m[10] +
                    m[4] * m[2] * m[9] +
                    m[8] * m[1] * m[6] -
                    m[8] * m[2] * m[5];
                let det = m[0] * inv[0] +
                    m[1] * inv[4] +
                    m[2] * inv[8] +
                    m[3] * inv[12];
                if (det === 0) {
                    return Mat4.identity();
                }
                det = 1 / det;
                for (let i = 0; i < 16; i++) {
                    inv[i] *= det;
                }
                return new Mat4(inv);
            }
            inverseAffine() {
                const m = this.m;
                const a00 = m[0], a01 = m[1], a02 = m[2];
                const a10 = m[4], a11 = m[5], a12 = m[6];
                const a20 = m[8], a21 = m[9], a22 = m[10];
                const det = a00 * (a11 * a22 - a12 * a21) -
                    a01 * (a10 * a22 - a12 * a20) +
                    a02 * (a10 * a21 - a11 * a20);
                if (Math.abs(det) < 1e-8) {
                    throw new Error("Singular affine matrix");
                }
                const invDet = 1 / det;
                // A^-1
                const b00 = (a11 * a22 - a12 * a21) * invDet;
                const b01 = (a02 * a21 - a01 * a22) * invDet;
                const b02 = (a01 * a12 - a02 * a11) * invDet;
                const b10 = (a12 * a20 - a10 * a22) * invDet;
                const b11 = (a00 * a22 - a02 * a20) * invDet;
                const b12 = (a02 * a10 - a00 * a12) * invDet;
                const b20 = (a10 * a21 - a11 * a20) * invDet;
                const b21 = (a01 * a20 - a00 * a21) * invDet;
                const b22 = (a00 * a11 - a01 * a10) * invDet;
                const tx = m[3];
                const ty = m[7];
                const tz = m[11];
                return new Mat4([
                    b00, b01, b02, -(b00 * tx + b01 * ty + b02 * tz),
                    b10, b11, b12, -(b10 * tx + b11 * ty + b12 * tz),
                    b20, b21, b22, -(b20 * tx + b21 * ty + b22 * tz),
                    0, 0, 0, 1
                ]);
            }
            inverseRigid() {
                const m = this.m;
                const r = new Array(16);
                // R^T
                r[0] = m[0];
                r[1] = m[4];
                r[2] = m[8];
                r[3] = 0;
                r[4] = m[1];
                r[5] = m[5];
                r[6] = m[9];
                r[7] = 0;
                r[8] = m[2];
                r[9] = m[6];
                r[10] = m[10];
                r[11] = 0;
                // -R^T t
                const tx = m[3];
                const ty = m[7];
                const tz = m[11];
                r[3] = -(r[0] * tx + r[1] * ty + r[2] * tz);
                r[7] = -(r[4] * tx + r[5] * ty + r[6] * tz);
                r[11] = -(r[8] * tx + r[9] * ty + r[10] * tz);
                r[12] = 0;
                r[13] = 0;
                r[14] = 0;
                r[15] = 1;
                return new Mat4(r);
            }
            decompose() {
                const m = this.m;
                const translate = new Vec3([m[3], m[7], m[11]]);
                const sx = Math.hypot(m[0], m[4], m[8]);
                const sy = Math.hypot(m[1], m[5], m[9]);
                const sz = Math.hypot(m[2], m[6], m[10]);
                const scale = new Vec3([sx, sy, sz]);
                if (sx === 0 || sy === 0 || sz === 0) {
                    return {
                        translate,
                        rotate: Vec3.zero(),
                        scale
                    };
                }
                const r00 = m[0] / sx, r01 = m[1] / sy, r02 = m[2] / sz;
                const r10 = m[4] / sx, r11 = m[5] / sy, r12 = m[6] / sz;
                const r20 = m[8] / sx, r21 = m[9] / sy, r22 = m[10] / sz;
                let rx, ry, rz;
                ry = Math.asin(r02);
                if (Math.abs(Math.cos(ry)) > 1e-6) {
                    rx = Math.atan2(-r12, r22);
                    rz = Math.atan2(-r01, r00);
                }
                else {
                    // gimbal lock
                    rx = Math.atan2(r21, r11);
                    rz = 0;
                }
                const rotate = new Vec3([rx, ry, rz]);
                return {
                    translate,
                    rotate,
                    scale
                };
            }
            toString() {
                const m = this.m;
                return (`[ ${m.slice(0, 4).join(', ')} ]\n` +
                    `[ ${m.slice(4, 8).join(', ')} ]\n` +
                    `[ ${m.slice(8, 12).join(', ')} ]\n` +
                    `[ ${m.slice(12, 16).join(', ')} ]`);
            }
            static zero() {
                return new Mat4(new Array(16).fill(0));
            }
            static identity() {
                return new Mat4();
            }
            static translate(tx, ty, tz) {
                return new Mat4([
                    1, 0, 0, tx,
                    0, 1, 0, ty,
                    0, 0, 1, tz,
                    0, 0, 0, 1
                ]);
            }
            static scale(sx, sy = sx, sz = sx) {
                return new Mat4([
                    sx, 0, 0, 0,
                    0, sy, 0, 0,
                    0, 0, sz, 0,
                    0, 0, 0, 1
                ]);
            }
            static rotateX(rad) {
                const c = Math.cos(rad), s = Math.sin(rad);
                return new Mat4([
                    1, 0, 0, 0,
                    0, c, -s, 0,
                    0, s, c, 0,
                    0, 0, 0, 1
                ]);
            }
            static rotateY(rad) {
                const c = Math.cos(rad), s = Math.sin(rad);
                return new Mat4([
                    c, 0, s, 0,
                    0, 1, 0, 0,
                    -s, 0, c, 0,
                    0, 0, 0, 1
                ]);
            }
            static rotateZ(rad) {
                const c = Math.cos(rad), s = Math.sin(rad);
                return new Mat4([
                    c, -s, 0, 0,
                    s, c, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                ]);
            }
            static fromTransform(pos, anchor, scale, orientation, rotation) {
                return Mat4
                    .translate(pos.x, pos.y, pos.z)
                    .mul(Mat4.rotateX(orientation.x))
                    .mul(Mat4.rotateY(orientation.y))
                    .mul(Mat4.rotateZ(orientation.z))
                    .mul(Mat4.rotateX(rotation.x))
                    .mul(Mat4.rotateY(rotation.y))
                    .mul(Mat4.rotateZ(rotation.z))
                    .mul(Mat4.scale(scale.x, scale.y, scale.z))
                    .mul(Mat4.translate(-anchor.x, -anchor.y, -anchor.z));
            }
            static fromLayerTransform(layer) {
                return this.fromTransform(new Vec3(layer.position.value), new Vec3(layer.anchorPoint.value), new Vec3(layer.scale.value).div(100), new Vec3(layer.orientation.value).map(thisLayer.degreesToRadians), new Vec3([layer.rotationX.value, layer.rotationY.value, layer.rotationZ.value]).map(thisLayer.degreesToRadians));
            }
            static isMat4(m) {
                return m instanceof Mat4;
            }
        }
        class Quaternion {
            x;
            y;
            z;
            w;
            constructor(x = 0, y = 0, z = 0, w = 1) {
                this.x = x;
                this.y = y;
                this.z = z;
                this.w = w;
            }
            norm() {
                return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
            }
            normalize() {
                const n = this.norm();
                if (n === 0)
                    return new Quaternion(0, 0, 0, 1);
                return new Quaternion(this.x / n, this.y / n, this.z / n, this.w / n);
            }
            conjugate() {
                return new Quaternion(-this.x, -this.y, -this.z, this.w);
            }
            multiply(q) {
                return new Quaternion(this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y, this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x, this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w, this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z);
            }
            rotateVector(v) {
                const qv = new Quaternion(v.x, v.y, v.z, 0);
                const qr = this.multiply(qv).multiply(this.conjugate());
                return new Vec3([qr.x, qr.y, qr.z]);
            }
            slerp(q2, t) {
                let dot = this.x * q2.x + this.y * q2.y + this.z * q2.z + this.w * q2.w;
                if (dot < 0) {
                    q2 = new Quaternion(-q2.x, -q2.y, -q2.z, -q2.w);
                    dot = -dot;
                }
                if (dot > 0.9995) {
                    const x = this.x + t * (q2.x - this.x);
                    const y = this.y + t * (q2.y - this.y);
                    const z = this.z + t * (q2.z - this.z);
                    const w = this.w + t * (q2.w - this.w);
                    return new Quaternion(x, y, z, w).normalize();
                }
                const theta0 = Math.acos(dot);
                const theta = theta0 * t;
                const sinTheta = Math.sin(theta);
                const sinTheta0 = Math.sin(theta0);
                const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
                const s1 = sinTheta / sinTheta0;
                return new Quaternion(s0 * this.x + s1 * q2.x, s0 * this.y + s1 * q2.y, s0 * this.z + s1 * q2.z, s0 * this.w + s1 * q2.w);
            }
            toEuler() {
                const q = this.normalize();
                const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
                const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
                const roll = Math.atan2(sinr_cosp, cosr_cosp);
                const sinp = 2 * (q.w * q.y - q.z * q.x);
                const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp);
                const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
                const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
                const yaw = Math.atan2(siny_cosp, cosy_cosp);
                return new Vec3([roll, -pitch, yaw]);
            }
            static fromEuler(rx, ry, rz) {
                const cx = Math.cos(rx / 2), sx = Math.sin(rx / 2);
                const cy = Math.cos(-ry / 2), sy = Math.sin(-ry / 2);
                const cz = Math.cos(rz / 2), sz = Math.sin(rz / 2);
                return new Quaternion(sx * cy * cz - cx * sy * sz, cx * sy * cz + sx * cy * sz, cx * cy * sz - sx * sy * cz, cx * cy * cz + sx * sy * sz);
            }
            static isQuaternion(q) {
                return q instanceof Quaternion;
            }
        }
        const lib = {
            Vec2,
            Vec3,
            Mat3,
            Mat4,
            Quaternion,
        };
        LIB.Math = lib;
        return lib;
    }
})
