export { };

const { Vec2 } = footage("@math.jsx").sourceData.load(true);
const { TwoBoneIK, FABRIK2D } = footage("@IK.jsx").sourceData.load(true);
const { Assert, Test } = footage("@test.jsx").sourceData.load();

    Test.describe("TwoBoneIK", () => {

        Test.test("hand reaches target (reachable)", () => {
            const root = new Vec2([0, 0]);
            const mid = new Vec2([50, 0]);
            const tip = new Vec2([100, 0]);
            const pole = new Vec2([50, -50]);

            const ik = new TwoBoneIK(root, mid, tip, pole);
            const target = new Vec2([80, 30]); // 到達可能範囲

            const result = ik.solve(target);

            Assert.near(result.hand.get(), target.get(), 1e-3);
        });

        Test.test("elbow respects pole vector direction", () => {
            const root = new Vec2([0, 0]);
            const mid = new Vec2([50, 0]);
            const tip = new Vec2([100, 0]);
            const pole = new Vec2([50, -50]);

            const ik = new TwoBoneIK(root, mid, tip, pole);
            const target = new Vec2([80,30]);

            const result = ik.solve(target);

            // 肘が Pole Vector の y が負側にあるか確認
            Assert.equal(result.elbow.y < root.y, true);
        });

        Test.test("bone lengths remain consistent", () => {
            const root = new Vec2([0, 0]);
            const mid = new Vec2([50, 0]);
            const tip = new Vec2([100, 0]);
            const pole = new Vec2([50, -50]);

            const ik = new TwoBoneIK(root, mid, tip, pole);
            const target = new Vec2([80,30]);

            const result = ik.solve(target);

            const L1 = root.sub(result.elbow).len();
            const L2 = result.elbow.sub(result.hand).len();

            Assert.near(L1, 50, 1e-6);
            Assert.near(L2, 50, 1e-6);
        });

        Test.test("target unreachable stretches arm fully (fixed-length)", () => {
            const root = new Vec2([0, 0]);
            const mid = new Vec2([50, 0]);
            const tip = new Vec2([100, 0]);
            const pole = new Vec2([50, -50]);

            const ik = new TwoBoneIK(root, mid, tip, pole);
            const unreachable = new Vec2([500,0]); // 総長 100 に対して届かない
            const result = ik.solve(unreachable);

            // ボーン長は固定のまま
            const L1 = root.sub(result.elbow).len();
            const L2 = result.elbow.sub(result.hand).len();
            Assert.near(L1, 50, 1e-6);
            Assert.near(L2, 50, 1e-6);

            // 手はターゲットに届かない
            Assert.near(result.hand.get(), [root.x + L1 + L2, 0], 1e-6);
        });
    });

Test.describe("FABRIK2D", () => {
    Test.test("solves simple 2D chain", () => {
        const points = [
            new Vec2([0, 0]),
            new Vec2([50, 0]),
            new Vec2([100, 0])
        ];
        const ik = new FABRIK2D(points);
        const target = new Vec2([75, 25]);
        const result = ik.solve(target);

        Assert.near(result[result.length - 1].get(), target.get(), 1e-3);
    });

    Test.describe("unreachable target", () => {
        Test.test("stretches fully towards unreachable target", () => {
            const points = [
                new Vec2([0, 0]),
                new Vec2([50, 0]),
                new Vec2([100, 0])
            ]
            const ik = new FABRIK2D(points);

            const unreachable = new Vec2([200, 200]);
            const result = ik.solve(unreachable);

            Assert.near(result[0].get(), [0, 0]);
            Assert.near(result[1].get(), [50 / Math.sqrt(2), 50 / Math.sqrt(2)]);
            Assert.near(result[2].get(), [100 / Math.sqrt(2), 100 / Math.sqrt(2)]);
        })
    });

    Test.test("angle limits are respected", () => {
        const points = [
            new Vec2([0, 0]),
            new Vec2([50, 0]),
            new Vec2([100, 0])
        ];
        const limits = [
            null,
            { min: -Math.PI / 4, max: Math.PI / 4 },
            { min: -Math.PI / 4, max: Math.PI / 4 }
        ];
        const ik = new FABRIK2D(points, limits);
        const target = new Vec2([50, 100]);
        const result = ik.solve(target);

        const dir0 = result[1].sub(result[0]).norm();
        const dir1 = result[2].sub(result[1]).norm();
        const angle = Math.atan2(dir0.cross(dir1), dir0.dot(dir1));
        Assert.equal(angle >= limits[1]!.min && angle <= limits[1]!.max, true);
        Assert.equal(angle >= limits[2]!.min && angle <= limits[2]!.max, true);
    });
});

Test.run();