export class Rng {
    seed = [0, 0, 0, 0]

    constructor(seed?: number[]) {
        if (seed != undefined) {
            this.setSeed(seed)
        } else {
            this.rSeed()
        }
    }

    next(): number {
        this.seed[0] |= 0;
        this.seed[1] |= 0;
        this.seed[2] |= 0;
        this.seed[3] |= 0;
        let t = (this.seed[0] + this.seed[1] | 0) + this.seed[3] | 0;
        this.seed[3] = this.seed[3] + 1 | 0;
        this.seed[0] = this.seed[1] ^ this.seed[1] >>> 9;
        this.seed[1] = this.seed[2] + (this.seed[2] << 3) | 0;
        this.seed[2] = (this.seed[2] << 21 | this.seed[2] >>> 11);
        this.seed[2] = this.seed[2] + t | 0;
        return (t >>> 0) / 4294967296;
    }

    rangeInt(a: number, b: number) {
        let n = this.next()
        return Math.floor(n * (b - a)) + a
    }

    getSeed(): number[] {
        return this.seed
    }

    rSeed() {
        this.seed = [0, 0, 0, 0].map(v => Math.floor(Math.random() * 1000000))
    }

    setSeed(seed: number[]) {
        for (let i = 0; i < 4; i++)
            this.seed[i] = seed[i] ?? Math.floor(Math.random() * 1000000)
    }
}