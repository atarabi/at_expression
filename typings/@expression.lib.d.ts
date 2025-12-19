interface Global {
    footage(name: "@math.jsx"): Footage<{
        load(force?: boolean): Atarabi.math.Lib;
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

    namespace IK {

        type Vec2 = math.Vec2;

        interface Lib {
            TwoBoneIK: TwoBoneIKConstructor;
            FABRIK2D: FABRIK2DConstructor;
        }

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

}
