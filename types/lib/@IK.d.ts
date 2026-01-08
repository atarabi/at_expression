// Depends on @math
interface Global {
    footage(name: "@IK.jsx"): Footage<{
        load(force?: boolean): Atarabi.IK.Lib;
    }>;
}

interface Layer {
    footage(name: "@IK.jsx"): Footage<{
        load(force?: boolean): Atarabi.IK.Lib;
    }>;
}

declare namespace Atarabi {

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

}
