// Depends on @math
interface _FootageProvider {
    footage(name: "@IK.lib.jsx"): Footage<{
        load(force?: boolean): Atarabi.IK.Lib;
    }>;
}

declare namespace Atarabi {

    namespace Expression {

        interface Cache {
            IK: Atarabi.IK.Lib;
        }

    }

    namespace IK {

        interface Lib {
            TwoBoneIK: TwoBoneIKConstructor;
            FABRIK2D: FABRIK2DConstructor;
        }

        type Vec2 = Math.Vec2;

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
