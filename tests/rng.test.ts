import {describe, expect, test} from '@jest/globals'

import {RNG} from '../src/rng'

describe('RNG', () => {
    test('should have a normal distribution', () => {
        let rng = new RNG();

        let runs = 10000
        let counter = new Array(10).fill(0)
        for (let i = 0; i < runs; i++) {
            counter[Math.floor(rng.next() * 10)]++
        }
        let maxdiv = counter.map(v => Math.abs(v - 1000)).reduce((s, v) => v > s ? s : v, 0)

        expect(maxdiv).toBeLessThan(100)
    })
    test('in range', () => {
        let rng = new RNG();

        let runs = 10000
        for (let i = 0; i < runs; i++) {
            let v = rng.next()
            expect(v).toBeGreaterThanOrEqual(0)
            expect(v).toBeLessThan(1)
        }
        for (let i = 0; i < runs; i++) {
            let v = rng.rangeInt(1,5)
            expect(v).toBeGreaterThanOrEqual(1)
            expect(v).toBeLessThan(5)
        }
    })
})