({
    load(force = false) {
        const LIB = $.__Atarabi = $.__Atarabi || {};
        if (!force && LIB.IK) {
            return LIB.IK;
        }
        const { Vec2 } = thisLayer.footage("@math.jsx").sourceData.load(force);
        class TwoBoneIK {
            root;
            mid;
            tip;
            L1;
            L2;
            pole;
            constructor(root, mid, tip, pole) {
                this.root = root.clone();
                this.mid = mid.clone();
                this.tip = tip.clone();
                this.L1 = root.sub(mid).len();
                this.L2 = mid.sub(tip).len();
                if (pole)
                    this.pole = pole.clone();
            }
            solve(target) {
                const totalLength = this.L1 + this.L2;
                const R = this.root.sub(target).len();
                // unreachable
                if (R >= totalLength) {
                    const dir = target.sub(this.root).norm();
                    const elbowPos = this.root.add(dir.mul(this.L1));
                    const handPos = elbowPos.add(dir.mul(this.L2));
                    this.mid = elbowPos.clone();
                    this.tip = handPos.clone();
                    return { elbow: elbowPos, hand: handPos };
                }
                // reachable
                const dir = target.sub(this.root).norm();
                const a = this.L1;
                const b = this.L2;
                const c = this.root.sub(target).len();
                const cosAngle = (a * a + c * c - b * b) / (2 * a * c);
                const angle = Math.acos(cosAngle);
                let perp = new Vec2([-dir.y, dir.x]);
                if (this.pole) {
                    const rootToPole = this.pole.sub(this.root);
                    const sign = perp.dot(rootToPole) < 0 ? -1 : 1;
                    perp = perp.mul(sign);
                }
                const elbowAlong = dir.mul(a * Math.cos(angle));
                const elbowOffset = perp.mul(a * Math.sin(angle));
                const elbowPos = this.root.add(elbowAlong).add(elbowOffset);
                const handPos = target.clone();
                this.mid = elbowPos.clone();
                this.tip = handPos.clone();
                return { elbow: elbowPos, hand: handPos };
            }
        }
        function clampAngle(baseDir, targetDir, minRad, maxRad) {
            const b = baseDir.norm();
            const t = targetDir.norm();
            const angle = Math.atan2(b.cross(t), b.dot(t));
            const clamped = Math.max(minRad, Math.min(maxRad, angle));
            return new Vec2([
                b.x * Math.cos(clamped) - b.y * Math.sin(clamped),
                b.x * Math.sin(clamped) + b.y * Math.cos(clamped)
            ]);
        }
        class FABRIK2D {
            points;
            lengths;
            totalLength;
            base;
            angleLimits;
            constructor(points, angleLimits) {
                this.points = points.map(p => p.clone());
                this.base = points[0].clone();
                this.angleLimits = angleLimits;
                this.lengths = [];
                this.totalLength = 0;
                for (let i = 0; i < points.length - 1; i++) {
                    const len = points[i].sub(points[i + 1]).len();
                    this.lengths.push(len);
                    this.totalLength += len;
                }
            }
            solve(target, tolerance = 0.001, maxIterations = 10) {
                if (this.base.sub(target).len() > this.totalLength) {
                    // unreachable
                    for (let i = 0; i < this.points.length - 1; i++) {
                        const dir = target.sub(this.points[i]).norm();
                        this.points[i + 1] = this.points[i].add(dir.mul(this.lengths[i]));
                    }
                    return this.points;
                }
                let iter = 0;
                while (this.points[this.points.length - 1].sub(target).len() > tolerance && iter < maxIterations) {
                    // forward
                    this.points[this.points.length - 1] = target.clone();
                    for (let i = this.points.length - 2; i >= 0; i--) {
                        let dir = this.points[i].sub(this.points[i + 1]).norm();
                        // angle limit
                        if (this.angleLimits && i > 0 && this.angleLimits[i]) {
                            const prevDir = this.points[i].sub(this.points[i - 1]);
                            dir = clampAngle(prevDir, dir, this.angleLimits[i].min, this.angleLimits[i].max);
                        }
                        this.points[i] = this.points[i + 1].add(dir.mul(this.lengths[i]));
                    }
                    // backward
                    this.points[0] = this.base.clone();
                    for (let i = 0; i < this.points.length - 1; i++) {
                        let dir = this.points[i + 1].sub(this.points[i]).norm();
                        // angle limit
                        if (this.angleLimits && i > 0 && this.angleLimits[i]) {
                            const prevDir = this.points[i].sub(this.points[i - 1]);
                            dir = clampAngle(prevDir, dir, this.angleLimits[i].min, this.angleLimits[i].max);
                        }
                        this.points[i + 1] = this.points[i].add(dir.mul(this.lengths[i]));
                    }
                    iter++;
                }
                return this.points;
            }
        }
        const lib = {
            TwoBoneIK,
            FABRIK2D,
        };
        LIB.IK = lib;
        return lib;
    },
})
