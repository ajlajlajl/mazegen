import {describe, expect, test} from '@jest/globals'

import {RectangleSheet} from "../src/sheet"
import {CellStates, Point} from "../src/Cell"
import {categorize} from "../src/Graph"

function isBlocked(p: Point) {
    return p.x == 2 && p.y == 1
}

describe('Sheet', () => {
    test('Links', () => {
        let sh = new RectangleSheet(3, 3, isBlocked).resetCells()

        let c = sh.getCell({x: 0, y: 0})
        c.linkTo(1)

        c = c.getNeighbor(1)
        c.linkTo(1)
        c.linkTo(2)

        c = sh.getCell({x: 2, y: 2})
        c.linkTo(-1)

        c = c.getNeighbor(-1)
        c.linkTo(-1)

        c = c.getNeighbor(-1)
        c.linkTo(-2)

        let catNo = categorize(sh)

        expect(catNo).toBe(2)

        expect(sh.cells[0].data.ctg).toBe(1)
        expect(sh.cells[1].data.ctg).toBe(1)
        expect(sh.cells[2].data.ctg).toBe(1)
        expect(sh.cells[4].data.ctg).toBe(1)

        expect(sh.cells[3].data.ctg).toBe(2)
        expect(sh.cells[6].data.ctg).toBe(2)
        expect(sh.cells[7].data.ctg).toBe(2)
        expect(sh.cells[8].data.ctg).toBe(2)
    })
})
