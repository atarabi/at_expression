export { };

const { Vec2, Vec3, Mat3, Mat4, Quaternion } = footage("@math.jsx").sourceData.load(true);
const { Assert, Test } = footage("@test.jsx").sourceData.load();

Test.describe("Vec2", () => {

    Test.test("construction", () => {
        const v = new Vec2([1, 2]);
        Assert.deepEqual(v.get(), [1, 2]);
    });

    Test.test("zero", () => {
        const z = Vec2.zero();
        Assert.deepEqual(z.get(), [0, 0]);
    });

    Test.test("isVec2", () => {
        const v = new Vec2([1, 2]);
        Assert.equal(Vec2.isVec2(v), true);
        Assert.equal(Vec2.isVec2({ x: 1, y: 2 }), false);
        Assert.equal(Vec2.isVec2([1, 2]), false);
        Assert.equal(Vec2.isVec2(null), false);
    });

    Test.describe("immutability", () => {
        Test.test("operations do not mutate original", () => {
            const v = new Vec2([1, 2]);
            v.add(1);
            v.sub(1);
            v.mul(2);
            v.div(2);
            v.norm();
            Assert.deepEqual(v.get(), [1, 2]);
        });
    });

    Test.describe("clone", () => {
        Test.test("clone creates independent instance", () => {
            const v = new Vec2([1, 2]);
            const c = v.clone();
            Assert.deepEqual(c.get(), [1, 2]);
            Assert.throws(() => Assert.equal(v, c));
        });
    });

    Test.describe("arithmetic with scalar", () => {
        const v = new Vec2([1, 2]);

        Test.test("add", () => {
            Assert.deepEqual(v.add(1).get(), [2, 3]);
        });

        Test.test("sub", () => {
            Assert.deepEqual(v.sub(1).get(), [0, 1]);
        });

        Test.test("mul", () => {
            Assert.deepEqual(v.mul(2).get(), [2, 4]);
        });

        Test.test("div", () => {
            Assert.deepEqual(v.div(2).get(), [0.5, 1]);
        });
    });

    Test.describe("arithmetic with Vec2", () => {
        const a = new Vec2([1, 2]);
        const b = new Vec2([3, 4]);

        Test.test("add", () => {
            Assert.deepEqual(a.add(b).get(), [4, 6]);
        });

        Test.test("sub", () => {
            Assert.deepEqual(a.sub(b).get(), [-2, -2]);
        });

        Test.test("mul", () => {
            Assert.deepEqual(a.mul(b).get(), [3, 8]);
        });

        Test.test("div", () => {
            Assert.deepEqual(a.div(b).get(), [1 / 3, 0.5]);
        });
    });

    Test.describe("rotate", () => {
        Test.test("rotate 90degree", () => {
            const v = new Vec2([1, 0]);
            Assert.near(v.rotate(Math.PI / 2).get(), [0, 1]);
        });
    });

    Test.describe("map", () => {
        Test.test("map applies function per component", () => {
            const v = new Vec2([1, 2]);
            const r = v.map((x, i) => x + i);
            Assert.deepEqual(r.get(), [1, 3]);
        });
    });

    Test.describe("dot", () => {
        Test.test("dot product", () => {
            const a = new Vec2([1, 2]);
            const b = new Vec2([3, 4]);
            Assert.equal(a.dot(b), 11);
        });
    });

    Test.describe("cross", () => {
        Test.test("cross product", () => {
            const a = new Vec2([1, 2]);
            const b = new Vec2([3, 4]);
            Assert.equal(a.cross(b), -2);
        });
    });

    Test.describe("length", () => {
        Test.test("len", () => {
            const v = new Vec2([3, 4]);
            Assert.equal(v.len(), 5);
        });
    });

    Test.describe("normalize", () => {
        Test.test("norm produces unit vector", () => {
            const v = new Vec2([3, 4]);
            const n = v.norm();
            Assert.near(n.len(), 1);
        });

        Test.test("direction preserved", () => {
            const v = new Vec2([3, 4]);
            const n = v.norm();
            Assert.near(n.x / n.y, 3 / 4);
        });
    });

    Test.describe("apply(Mat3)", () => {
        Test.test("identity matrix", () => {
            const v = new Vec2([1, 2]);
            const I = Mat3.identity();
            Assert.deepEqual(v.apply(I).get(), [1, 2]);
        });

        Test.test("translation", () => {
            const v = new Vec2([1, 2]);
            const m = Mat3.translate(3, 4);
            Assert.deepEqual(v.apply(m).get(), [4, 6]);
        });
    });

});


Test.describe("Vec3", () => {

    Test.test("construction", () => {
        const v = new Vec3([1, 2, 3]);
        Assert.deepEqual(v.get(), [1, 2, 3]);
    });

    Test.test("zero", () => {
        const z = Vec3.zero();
        Assert.deepEqual(z.get(), [0, 0, 0]);
    });

    Test.test("isVec3", () => {
        const v = new Vec3([1, 2, 3]);
        Assert.equal(Vec3.isVec3(v), true);
        Assert.equal(Vec3.isVec3({ x: 1, y: 2, z: 3 }), false);
        Assert.equal(Vec3.isVec3([1, 2, 3]), false);
        Assert.equal(Vec3.isVec3(null), false);
    });

    Test.describe("immutability", () => {
        Test.test("operations do not mutate original", () => {
            const v = new Vec3([1, 2, 3]);
            v.add(1);
            v.sub(1);
            v.mul(2);
            v.div(2);
            v.norm();
            Assert.deepEqual(v.get(), [1, 2, 3]);
        });
    });

    Test.describe("clone", () => {
        Test.test("clone creates independent instance", () => {
            const v = new Vec3([1, 2, 3]);
            const c = v.clone();
            Assert.deepEqual(c.get(), [1, 2, 3]);
            Assert.throws(() => Assert.equal(v, c));
        });
    });

    Test.describe("arithmetic with scalar", () => {
        const v = new Vec3([1, 2, 3]);

        Test.test("add", () => {
            Assert.deepEqual(v.add(1).get(), [2, 3, 4]);
        });

        Test.test("sub", () => {
            Assert.deepEqual(v.sub(1).get(), [0, 1, 2]);
        });

        Test.test("mul", () => {
            Assert.deepEqual(v.mul(2).get(), [2, 4, 6]);
        });

        Test.test("div", () => {
            Assert.deepEqual(v.div(2).get(), [0.5, 1, 1.5]);
        });
    });

    Test.describe("arithmetic with Vec3", () => {
        const a = new Vec3([1, 2, 3]);
        const b = new Vec3([4, 5, 6]);

        Test.test("add", () => {
            Assert.deepEqual(a.add(b).get(), [5, 7, 9]);
        });

        Test.test("sub", () => {
            Assert.deepEqual(a.sub(b).get(), [-3, -3, -3]);
        });

        Test.test("mul", () => {
            Assert.deepEqual(a.mul(b).get(), [4, 10, 18]);
        });

        Test.test("div", () => {
            Assert.deepEqual(a.div(b).get(), [1 / 4, 2 / 5, 3 / 6]);
        });
    });

    Test.describe("map", () => {
        Test.test("map applies function per component", () => {
            const v = new Vec3([1, 2, 3]);
            const r = v.map((x, i) => x + i);
            Assert.deepEqual(r.get(), [1, 3, 5]);
        });
    });

    Test.describe("dot", () => {
        Test.test("dot product", () => {
            const a = new Vec3([1, 2, 3]);
            const b = new Vec3([4, 5, 6]);
            Assert.equal(a.dot(b), 32);
        });
    });

    Test.describe("cross", () => {
        Test.test("right hand rule", () => {
            const x = new Vec3([1, 0, 0]);
            const y = new Vec3([0, 1, 0]);
            Assert.deepEqual(x.cross(y).get(), [0, 0, 1]);
        });

        Test.test("anti-commutativity", () => {
            const a = new Vec3([1, 2, 3]);
            const b = new Vec3([4, 5, 6]);
            const ab = a.cross(b).get();
            const ba = b.cross(a).mul(-1).get();
            Assert.deepEqual(ab, ba);
        });

        Test.test("parallel vectors yield zero", () => {
            const a = new Vec3([1, 2, 3]);
            const b = new Vec3([2, 4, 6]);
            Assert.deepEqual(a.cross(b).get(), [0, 0, 0]);
        });

        Test.test("orthogonality", () => {
            const a = new Vec3([1, 2, 3]);
            const b = new Vec3([4, 5, 6]);
            const c = a.cross(b);
            Assert.near(c.dot(a), 0);
            Assert.near(c.dot(b), 0);
        });
    });

    Test.describe("length", () => {
        Test.test("len", () => {
            const v = new Vec3([2, 3, 6]);
            Assert.near(v.len(), 7);
        });
    });

    Test.describe("normalize", () => {
        Test.test("norm produces unit vector", () => {
            const v = new Vec3([3, 4, 12]);
            const n = v.norm();
            Assert.near(n.len(), 1);
        });

        Test.test("direction preserved", () => {
            const v = new Vec3([3, 0, 0]);
            const n = v.norm();
            Assert.deepEqual(n.get(), [1, 0, 0]);
        });
    });

    Test.describe("apply(Mat4)", () => {
        Test.test("identity matrix", () => {
            const v = new Vec3([1, 2, 3]);
            const I = Mat4.identity();
            Assert.deepEqual(v.apply(I).get(), [1, 2, 3]);
        });

        Test.test("translation", () => {
            const v = new Vec3([1, 2, 3]);
            const m = Mat4.translate(4, 5, 6);
            Assert.deepEqual(v.apply(m).get(), [5, 7, 9]);
        });
    });

});

Test.describe("Mat3", () => {

    Test.test("construction", () => {
        const m = new Mat3([
            1, 2, 3,
            4, 5, 6,
            7, 8, 9
        ]);
        Assert.equal(m.m00, 1);
        Assert.equal(m.m11, 5);
        Assert.equal(m.m22, 9);
    });

    Test.test("zero", () => {
        const z = Mat3.zero();
        Assert.deepEqual([
            z.m00, z.m01, z.m02,
            z.m10, z.m11, z.m12,
            z.m20, z.m21, z.m22
        ], [
            0, 0, 0,
            0, 0, 0,
            0, 0, 0
        ]);
    });

    Test.test("identity", () => {
        const I = Mat3.identity();
        Assert.deepEqual([
            I.m00, I.m01, I.m02,
            I.m10, I.m11, I.m12,
            I.m20, I.m21, I.m22
        ], [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);
    });

    Test.test("isMat3", () => {
        const m = Mat3.identity();
        Assert.equal(Mat3.isMat3(m), true);
        Assert.equal(Mat3.isMat3({}), false);
        Assert.equal(Mat3.isMat3([1, 0, 0]), false);
        Assert.equal(Mat3.isMat3(null), false);
    });

    Test.describe("clone", () => {
        Test.test("clone creates independent instance", () => {
            const m = Mat3.identity();
            const c = m.clone();
            Assert.deepEqual([
                c.m00, c.m01, c.m02,
                c.m10, c.m11, c.m12,
                c.m20, c.m21, c.m22
            ], [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ]);
            Assert.throws(() => Assert.equal(m, c));
        });
    });

    Test.describe("mul", () => {
        Test.test("identity * matrix = matrix", () => {
            const I = Mat3.identity();
            const T = Mat3.translate(3, 4);
            const r = I.mul(T);
            Assert.deepEqual(
                [r.m02, r.m12],
                [3, 4]
            );
        });

        Test.test("matrix * identity = matrix", () => {
            const I = Mat3.identity();
            const S = Mat3.scale(2, 3);
            const r = S.mul(I);
            Assert.deepEqual(
                [r.m00, r.m11],
                [2, 3]
            );
        });

        Test.test("composition order", () => {
            const T = Mat3.translate(10, 0);
            const S = Mat3.scale(2, 2);
            const v = new Vec2([1, 1]);

            const a = T.mul(S).applyTo(v);
            const b = T.applyTo(S.applyTo(v));

            Assert.near(a.get(), b.get());
        });
    });

    Test.describe("applyTo(Vec2)", () => {
        Test.test("identity", () => {
            const v = new Vec2([1, 2]);
            const r = Mat3.identity().applyTo(v);
            Assert.deepEqual(r.get(), [1, 2]);
        });

        Test.test("translation", () => {
            const v = new Vec2([1, 2]);
            const r = Mat3.translate(3, 4).applyTo(v);
            Assert.deepEqual(r.get(), [4, 6]);
        });

        Test.test("scale", () => {
            const v = new Vec2([1, 2]);
            const r = Mat3.scale(2, 3).applyTo(v);
            Assert.deepEqual(r.get(), [2, 6]);
        });

        Test.test("rotation (90deg)", () => {
            const v = new Vec2([1, 0]);
            const r = Mat3.rotate(Math.PI / 2).applyTo(v);
            Assert.near(r.get(), [0, 1]);
        });

        Test.test("skew", () => {
            const v = new Vec2([1, 1]);
            const r = Mat3.skew(Math.atan(1), 0).applyTo(v);
            Assert.near(r.get()[0], 2);
        });
    });

    Test.describe("inverse", () => {
        Test.test("inverse(identity) = identity", () => {
            const I = Mat3.identity();
            const inv = I.inverse();
            Assert.near(
                [
                    inv.m00, inv.m01, inv.m02,
                    inv.m10, inv.m11, inv.m12,
                    inv.m20, inv.m21, inv.m22
                ],
                [
                    1, 0, 0,
                    0, 1, 0,
                    0, 0, 1
                ]
            );
        });

        Test.test("inverse * original = identity", () => {
            const m = Mat3
                .translate(3, 4)
                .mul(Mat3.rotate(0.3))
                .mul(Mat3.scale(2, 3));

            const I = m.mul(m.inverse());

            Assert.near(
                [
                    I.m00, I.m01, I.m02,
                    I.m10, I.m11, I.m12,
                    I.m20, I.m21, I.m22
                ],
                [
                    1, 0, 0,
                    0, 1, 0,
                    0, 0, 1
                ],
                1e-6
            );
        });
    });

    Test.describe("decompose", () => {
        Test.test("translate / rotate / scale", () => {
            const pos = new Vec2([10, 20]);
            const scale = new Vec2([2, 3]);
            const rot = 0.25;

            const m =
                Mat3.translate(pos.x, pos.y)
                    .mul(Mat3.rotate(rot))
                    .mul(Mat3.scale(scale.x, scale.y));

            const d = m.decompose();

            Assert.near(d.translate.get(), pos.get());
            Assert.near(d.scale.get(), scale.get());
            Assert.near(d.rotate, rot, 1e-6);
        });

        Test.test("recomposition", () => {
            const m =
                Mat3.translate(5, 6)
                    .mul(Mat3.rotate(0.5))
                    .mul(Mat3.scale(2, 2));

            const d = m.decompose();

            const r =
                Mat3.translate(d.translate.x, d.translate.y)
                    .mul(Mat3.rotate(d.rotate))
                    .mul(Mat3.scale(d.scale.x, d.scale.y));

            Assert.near(
                [
                    m.m00, m.m01, m.m02,
                    m.m10, m.m11, m.m12,
                    m.m20, m.m21, m.m22
                ],
                [
                    r.m00, r.m01, r.m02,
                    r.m10, r.m11, r.m12,
                    r.m20, r.m21, r.m22
                ],
                1e-6
            );
        });
    });

});

Test.describe("Mat4", () => {

    Test.test("construction", () => {
        const m = new Mat4([
            1, 2, 3, 4,
            5, 6, 7, 8,
            9, 10, 11, 12,
            13, 14, 15, 16
        ]);
        Assert.equal(m.m00, 1);
        Assert.equal(m.m11, 6);
        Assert.equal(m.m33, 16);
    });

    Test.test("zero / identity / isMat4", () => {
        const z = Mat4.zero();
        Assert.deepEqual([
            z.m00, z.m01, z.m02, z.m03,
            z.m10, z.m11, z.m12, z.m13,
            z.m20, z.m21, z.m22, z.m23,
            z.m30, z.m31, z.m32, z.m33
        ], new Array(16).fill(0));

        const I = Mat4.identity();
        Assert.deepEqual([
            I.m00, I.m01, I.m02, I.m03,
            I.m10, I.m11, I.m12, I.m13,
            I.m20, I.m21, I.m22, I.m23,
            I.m30, I.m31, I.m32, I.m33
        ], [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);

        Assert.equal(Mat4.isMat4(I), true);
        Assert.equal(Mat4.isMat4({}), false);
        Assert.equal(Mat4.isMat4(null), false);
    });

    Test.describe("clone", () => {
        Test.test("independent instance", () => {
            const I = Mat4.identity();
            const c = I.clone();
            Assert.deepEqual([
                c.m00, c.m01, c.m02, c.m03,
                c.m10, c.m11, c.m12, c.m13,
                c.m20, c.m21, c.m22, c.m23,
                c.m30, c.m31, c.m32, c.m33
            ], [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            Assert.throws(() => Assert.equal(I, c));
        });
    });

    Test.describe("applyTo(Vec3)", () => {
        Test.test("identity", () => {
            const v = new Vec3([1, 2, 3]);
            const r = Mat4.identity().applyTo(v);
            Assert.deepEqual(r.get(), [1, 2, 3]);
        });

        Test.test("translation", () => {
            const v = new Vec3([1, 2, 3]);
            const r = Mat4.translate(4, 5, 6).applyTo(v);
            Assert.deepEqual(r.get(), [5, 7, 9]);
        });

        Test.test("scale", () => {
            const v = new Vec3([1, 2, 3]);
            const r = Mat4.scale(2, 3, 4).applyTo(v);
            Assert.deepEqual(r.get(), [2, 6, 12]);
        });

        Test.test("rotateX/rotateY/rotateZ 90deg", () => {
            const v = new Vec3([1, 0, 0]);
            const rx = Mat4.rotateX(Math.PI / 2).applyTo(v);
            Assert.near(rx.get(), [1, 0, 0]); // X軸回転はX維持
            const ry = Mat4.rotateY(Math.PI / 2).applyTo(v);
            Assert.near(ry.get(), [0, 0, -1]); // 回転後のX軸ベクトル
            const rz = Mat4.rotateZ(Math.PI / 2).applyTo(v);
            Assert.near(rz.get(), [0, 1, 0]);
        });
    });

    Test.describe("mul", () => {
        Test.test("identity * matrix = matrix", () => {
            const I = Mat4.identity();
            const T = Mat4.translate(1, 2, 3);
            const r = I.mul(T);
            Assert.deepEqual(r.applyTo(new Vec3([0, 0, 0])).get(), [1, 2, 3]);
        });

        Test.test("composition order", () => {
            const T = Mat4.translate(1, 2, 3);
            const S = Mat4.scale(2, 2, 2);
            const v = new Vec3([1, 1, 1]);
            const a = T.mul(S).applyTo(v);
            const b = T.applyTo(S.applyTo(v));
            Assert.near(a.get(), b.get());
        });
    });

    Test.describe("inverse", () => {

        Test.test("inverse(identity) = identity", () => {
            const I = Mat4.identity();
            Assert.deepEqual(I.inverse().applyTo(new Vec3([1, 2, 3])).get(), [1, 2, 3]);
        });

        Test.test("inverse * original = identity", () => {
            const m = Mat4.translate(1, 2, 3)
                .mul(Mat4.rotateX(0.3))
                .mul(Mat4.scale(2, 3, 4));
            const I = m.mul(m.inverse());
            Assert.near(I.applyTo(new Vec3([1, 2, 3])).get(), [1, 2, 3]);
        });

    });

    Test.describe("inverseAffine / inverseRigid", () => {

        Test.test("original * inverseAffine = identity", () => {
            const m = Mat4.translate(1, 2, 3).mul(Mat4.scale(2, 2, 2));
            const I = m.inverseAffine().mul(m);

            Assert.near(
                [
                    I.m00, I.m01, I.m02, I.m03,
                    I.m10, I.m11, I.m12, I.m13,
                    I.m20, I.m21, I.m22, I.m23,
                    I.m30, I.m31, I.m32, I.m33
                ],
                [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                ],
                1e-6
            );
        });

        Test.test("original * inverseRigid = identity", () => {
            const m = Mat4.rotateX(0.3).mul(Mat4.translate(1, 2, 3));
            const I = m.inverseRigid().mul(m);

            Assert.near(
                [
                    I.m00, I.m01, I.m02, I.m03,
                    I.m10, I.m11, I.m12, I.m13,
                    I.m20, I.m21, I.m22, I.m23,
                    I.m30, I.m31, I.m32, I.m33
                ],
                [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                ],
                1e-6
            );
        });
    });

    Test.test("decompose / recomposition (no anchor, no orientation)", () => {
        const pos = new Vec3([1, 2, 3]);
        const scale = new Vec3([2, 3, 4]);
        const rotate = new Vec3([0.1, 0.2, 0.3]);

        const m = Mat4.fromTransform(
            pos,
            Vec3.zero(),      // anchor
            scale,
            Vec3.zero(),      // orientation
            rotate
        );

        const d = m.decompose();

        const r =
            Mat4.translate(d.translate.x, d.translate.y, d.translate.z)
                .mul(Mat4.rotateX(d.rotate.x))
                .mul(Mat4.rotateY(d.rotate.y))
                .mul(Mat4.rotateZ(d.rotate.z))
                .mul(Mat4.scale(d.scale.x, d.scale.y, d.scale.z));

        Assert.near(
            m.applyTo(new Vec3([1, 1, 1])).get(),
            r.applyTo(new Vec3([1, 1, 1])).get(),
            1e-6
        );
    });

});

Test.describe("Quaternion", () => {

    Test.test("constructor and getters", () => {
        const q = new Quaternion(1, 2, 3, 4);
        Assert.equal(q.x, 1);
        Assert.equal(q.y, 2);
        Assert.equal(q.z, 3);
        Assert.equal(q.w, 4);
    });

    Test.test("norm()", () => {
        const q = new Quaternion(1, 2, 2, 1);
        Assert.near(q.norm(), Math.sqrt(10), 1e-10);
    });

    Test.test("normalize()", () => {
        const q = new Quaternion(1, 2, 3, 4);
        const nq = q.normalize();
        const n = Math.sqrt(nq.x * nq.x + nq.y * nq.y + nq.z * nq.z + nq.w * nq.w);
        Assert.near(n, 1, 1e-10);
    });

    Test.test("conjugate()", () => {
        const q = new Quaternion(1, 2, 3, 4);
        const cq = q.conjugate();
        Assert.equal(cq.x, -1);
        Assert.equal(cq.y, -2);
        Assert.equal(cq.z, -3);
        Assert.equal(cq.w, 4);
    });

    Test.test("multiply()", () => {
        const q1 = new Quaternion(1, 0, 0, 0);
        const q2 = new Quaternion(0, 1, 0, 0);
        const r = q1.multiply(q2);
        Assert.deepEqual([r.x, r.y, r.z, r.w], [0, 0, 1, 0]);
    });

    Test.test("rotateVector()", () => {
        const q = Quaternion.fromEuler(0, Math.PI / 2, 0); // Y軸90度回転
        const v = new Vec3([1, 0, 0]);
        const rotated = q.rotateVector(v);
        Assert.near(rotated.x, 0, 1e-10);
        Assert.near(rotated.y, 0, 1e-10);
        Assert.near(rotated.z, 1, 1e-10);
    });

    Test.test("slerp()", () => {
        const q1 = Quaternion.fromEuler(0, 0, 0);
        const q2 = Quaternion.fromEuler(0, Math.PI, 0);
        const mid = q1.slerp(q2, 0.5);
        const euler = mid.toEuler();
        Assert.near(euler.y, Math.PI / 2, 1e-10);
    });

    Test.test("fromEuler() and toEuler()", () => {
        const angles = [Math.PI / 4, Math.PI / 3, Math.PI / 6] satisfies [number, number, number];
        const q = Quaternion.fromEuler(...angles);
        const euler = q.toEuler();
        Assert.near(euler.x, angles[0], 1e-10);
        Assert.near(euler.y, angles[1], 1e-10);
        Assert.near(euler.z, angles[2], 1e-10);
    });

    Test.test("isQuaternion()", () => {
        const q = new Quaternion();
        Assert.equal(Quaternion.isQuaternion(q), true);
        Assert.equal(Quaternion.isQuaternion({}), false);
    });

});

Test.run();