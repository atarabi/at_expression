interface Global {
    footage(name: "@math.jsx"): Footage<{
        load(): Atarabi.math.Lib;
    }>;
}

declare namespace Atarabi {

    namespace math {

        interface Lib {
            Vector: VectorConstructor;
            Matrix: MatrixConstructor;
        }

        interface Vector {
            get x(): number;
            get y(): number;
            clone(): Vector;
            add(v: number | Vector): Vector;
            sub(v: number | Vector): Vector;
            mul(v: number | Vector): Vector;
            div(v: number | Vector): Vector;
            dot(v: Vector): number;
            len(): number;
            norm(): Vector;
            apply(m: Matrix): Vector;
            get(): number[];
        }

        interface VectorConstructor {
            new(v: number[]): Vector;
            zero(): Vector;
            isVector(v: any): v is Vector;
        }

        // 3x3 matrix stored in row-major order:
        // [ m00 m01 m02
        //   m10 m11 m12
        //   m20 m21 m22 ]
        interface Matrix {
            get m00(): number;
            get m01(): number;
            get m02(): number;
            get m10(): number;
            get m11(): number;
            get m12(): number;
            get m20(): number;
            get m21(): number;
            get m22(): number;
            clone(): Matrix;
            mul(m: Matrix): Matrix;
            applyTo(v: Vector): Vector;
            inverse(): Matrix;
            decompose(): { translate: Vector; rotate: number; scale: Vector; };
        }

        interface MatrixConstructor {
            new(m: number[]): Matrix;
            zero(): Matrix;
            identity(): Matrix;
            translate(tx: number, ty: number): Matrix;
            scale(sx: number, sy: number): Matrix;
            rotate(rad: number): Matrix;
            skew(ax: number, ay: number): Matrix;
            fromTransform(pos: Vector, anchor: Vector, scale: Vector, rotation: number): Matrix;
            fromLayerTransform(layer: Layer): Matrix;
            isMatrix(m: any): m is Matrix;
        }

    }

}
