import {describe, expect, test} from '@jest/globals'

import {RectangleSheet} from "../src/sheet"
import {CellStates, Point} from "../src/Cell"

function isBlocked(p: Point) {
    return p.x == 2 && p.y == 1
}

describe('Sheet', () => {
    test('Cell init', () => {
        let sh = new RectangleSheet(3, 3, isBlocked).resetCells()

        let c21b = sh.getCell({x: 2, y: 1})
        let c11 = sh.getCell({x: 1, y: 1})

        expect(c21b.state).toBe(CellStates.blocked)
        expect(c11.state).toBe(CellStates.init)
        expect(c21b.links.length).toBe(0)
        expect(c21b.sheet).toBe(sh)
        expect(c21b.point).toStrictEqual({x: 2, y: 1})
        expect(sh.isAllCellsState(CellStates.init)).toBe(true)
    })
    test('Pointing', () => {
        let sh = new RectangleSheet(3, 3, isBlocked).resetCells()

        expect(sh.isValidPoint({x: 0, y: 2})).toBe(true)
        expect(sh.isValidPoint({x: 2, y: 0})).toBe(true)
        expect(sh.isValidPoint({x: 11, y: 1})).toBe(false)
        expect(sh.isValidPoint({x: 3, y: 1})).toBe(false)
        expect(sh.isValidPoint({x: 1, y: -1})).toBe(false)
        expect(sh.isValidPoint({x: 3, y: 1})).toBe(false)

        expect(sh.movePoint({x: 1, y: 1}, 1)).toStrictEqual({x: 2, y: 1})
        expect(sh.movePoint({x: 1, y: 1}, -1)).toStrictEqual({x: 0, y: 1})
        expect(sh.movePoint({x: 1, y: 1}, 2)).toStrictEqual({x: 1, y: 2})
        expect(sh.movePoint({x: 1, y: 1}, -2)).toStrictEqual({x: 1, y: 0})
        expect(() => sh.movePoint({x: 1, y: 1}, -7)).toThrowError()
    })
    test('Sheet', () => {
        let sh = new RectangleSheet(3, 3, isBlocked).resetCells()

        expect(() => sh.getCell({x: 10, y: 1})).toThrowError()

        let c11 = sh.getCell({x: 1, y: 1})
        expect(sh.getCell({x: 1, y: 1})).toBe(c11)

        sh.setAllCellState(CellStates.processing)
        expect(sh.isAllCellsState(CellStates.processing)).toBe(true)

        let c21b = sh.getCell({x: 2, y: 1})
        expect(c21b.state).toBe(CellStates.blocked)

        sh.setAllCellData('abc', 12)
        expect(sh.isAllCellsData('abc', 12)).toBe(true)
    })
    test('RectSheet', () => {
        let sh = new RectangleSheet(3, 3, isBlocked).resetCells()

        expect(sh.index2Point(1)).toStrictEqual({x: 1, y: 0})
        expect(sh.index2Point(2)).toStrictEqual({x: 2, y: 0})
        expect(sh.index2Point(5)).toStrictEqual({x: 2, y: 1})
        expect(sh.index2Point(7)).toStrictEqual({x: 1, y: 2})

        expect(sh.point2Index({x: 1, y: 1})).toBe(4)
        expect(sh.point2Index({x: 2, y: 0})).toBe(2)
        expect(sh.point2Index({x: 0, y: 2})).toBe(6)

        expect(() => sh.getCellDirection({x: 1, y: 1}, {x: 1, y: 1})).toThrowError()
        expect(() => sh.getCellDirection({x: 0, y: 1}, {x: 2, y: 1})).toThrowError()
        expect(sh.getCellDirection({x: 1, y: 1}, {x: 2, y: 1})).toBe(1)
        expect(sh.getCellDirection({x: 1, y: 1}, {x: 0, y: 1})).toBe(-1)
        expect(sh.getCellDirection({x: 1, y: 1}, {x: 1, y: 2})).toBe(2)
        expect(sh.getCellDirection({x: 1, y: 1}, {x: 1, y: 0})).toBe(-2)

        expect(sh.getDirectionFromNeighborPerspective({x: 1, y: 1}, 1)).toBe(-1)
        expect(sh.getDirectionFromNeighborPerspective({x: 1, y: 1}, -1)).toBe(1)
        expect(sh.getDirectionFromNeighborPerspective({x: 1, y: 1}, 2)).toBe(-2)
        expect(sh.getDirectionFromNeighborPerspective({x: 1, y: 1}, -2)).toBe(2)
    })
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

        expect(sh.cells[0].links.length == 1 && sh.cells[0].links.includes(1))
            .toBe(true)
        expect(sh.cells[1].links.length == 3 && sh.cells[1].links.includes(1) && sh.cells[1].links.includes(-1) && sh.cells[1].links.includes(2))
            .toBe(true)
        expect(sh.cells[2].links.length == 1 && sh.cells[2].links.includes(-1))
            .toBe(true)
        expect(sh.cells[3].links.length == 1 && sh.cells[3].links.includes(2))
            .toBe(true)
        expect(sh.cells[4].links.length == 1 && sh.cells[4].links.includes(-2))
            .toBe(true)
        expect(sh.cells[5].links.length == 0)
            .toBe(true)
        expect(sh.cells[6].links.length == 2 && sh.cells[6].links.includes(-2) && sh.cells[6].links.includes(1))
            .toBe(true)
        expect(sh.cells[7].links.length == 2 && sh.cells[7].links.includes(-1) && sh.cells[7].links.includes(1))
            .toBe(true)
        expect(sh.cells[8].links.length == 1 && sh.cells[8].links.includes(-1))
            .toBe(true)
    })
})
