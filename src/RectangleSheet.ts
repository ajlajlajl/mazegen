import {Cell, CellStates, Point} from "./Cell.js"
import {categorize} from "./Graph.js"
import {CheckCellCB, SheetBase} from "./SheetBase.js"

export class RectangleSheet extends SheetBase {
    w: number
    h: number

    constructor(w: number, h: number, isBlocked?: CheckCellCB) {
        super(isBlocked);
        this.w = w
        this.h = h
        this.resetCells()
    }

    index2Point(index: number): Point {
        return {x: index % this.w, y: Math.floor(index / this.w)}
    }

    point2Index(point: Point): number {
        return point.x + point.y * this.w
    }

    getPointRanges(): { [id: string]: { from: number, to: number } } {
        return {x: {from: 0, to: this.w}, y: {from: 0, to: this.h}}
    }

    isValidDirValue(dir: number): boolean {
        return this.getAllWalls().includes(dir)
    }

    getAllWalls(): number[] {
        return [-1, 1, -2, 2] //1 for horizontal, 2 for vertical
    }

    isValidPoint(p: Point): boolean {
        return p.x >= 0 && p.y >= 0 && p.x < this.w && p.y < this.h
    }

    isValidCellPoint(p: Point): boolean {
        return this.isValidPoint(p) && (this.isBlockedCB === undefined || !this.isBlockedCB(p))
    }

    resetCells() {
        this.cells = (new Array(this.w * this.h)).fill(1).map((v, i) => {
            let c = new Cell(this, this.index2Point(i))
            if (this.isBlockedCB !== undefined && this.isBlockedCB(c.point))
                c.state = CellStates.blocked
            return c
        })
        return this
    }

    isCorridor(cell: Cell): boolean {
        if (cell.links.length == 2) {
            let walls = cell.listWalls()
            return ((walls.includes(1) && walls.includes(-1)) || (walls.includes(2) && walls.includes(-2)))
        } else
            return false
    }

    getMovementFromDirection(direction: number): Point {
        if (!this.isValidDirValue(direction))
            throw 'Invalid direction value'
        return {
            x: Math.abs(direction) == 1 ? Math.sign(direction) : 0,
            y: Math.abs(direction) == 2 ? Math.sign(direction) : 0,
        }
    }

    movePoint(p: Point, direction: number): Point {
        if (!this.isValidDirValue(direction))
            throw 'Invalid direction value'
        let mvp = this.getMovementFromDirection(direction)
        return {x: p.x + mvp.x, y: p.y + mvp.y}
    }

    validate(): boolean {
        let notFin: boolean = !this.isAllCellsState(CellStates.fin)
        let allWall: boolean = this.cells.some(c => c.hasAllWalls())
        let notInterconnected: boolean = categorize(this) !== 1
        return notFin || allWall || notInterconnected
    }

    getCellDirection(pRef: Point, pn: Point): number {
        let distance = Math.abs(pRef.x - pn.x) + Math.abs(pRef.y - pn.y)
        if (distance != 1)
            throw 'invalid neighbors'
        return (pn.x - pRef.x) + (pn.y - pRef.y) * 2
    }

    getDirectionFromNeighborPerspective(pRef: Point, direction: number): number {
        if (!this.isValidDirValue(direction))
            throw 'Invalid direction value'
        return -1 * direction
    }
}