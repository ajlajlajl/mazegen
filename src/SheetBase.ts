import {Cell, CellStates, Point} from "./Cell.js"
import {categorize} from "./Graph.js"

type CheckCellCB = (point: Point) => boolean

export abstract class SheetBase {
    cells: Cell[]
    entry: Point[]
    exit: Point[]
    protected isBlockedCB?: CheckCellCB

    protected constructor(isBlocked?: CheckCellCB) {
        this.cells = []
        this.entry = []
        this.exit = []
        this.isBlockedCB = isBlocked
    }

    abstract index2Point(index: number): Point

    abstract point2Index(point: Point): number

    abstract getAllWalls(): number[]

    abstract resetCells(): void

    abstract isValidPoint(p: Point): boolean

    abstract isValidCellPoint(p: Point): boolean

    abstract movePoint(p: Point, direction: number): Point

    getCell(p: Point) {
        if (!this.isValidPoint(p))
            throw 'invalid pos'
        return this.cells[this.point2Index(p)]
    }

    setAllCellState(state: CellStates) {
        this.cells.forEach(c => {
            if (c.state !== CellStates.blocked)
                c.state = state
        })
    }

    isAllCellsState(state: CellStates): boolean {
        return this.cells.some(c => c.state === CellStates.blocked || c.state === state)
    }

    setAllCellData(field: string, value: any) {
        this.cells.forEach(c => c.data[field] = value)
    }

    isAllCellsData(field: string, value: any): boolean {
        return this.cells.some(c => c.data[field] === value)
    }

    abstract isValidDirValue(dir: number): boolean

    abstract isCorridor(cell: Cell): boolean

    abstract validate(): boolean

    abstract getCellDirection(pRef: Point, pn: Point): number

    abstract getDirectionFromNeighborPerspective(pRef: Point, dir: number): number

    linkCellsPD(p: Point, direction: number) {
        if (!this.isValidDirValue(direction))
            throw 'Invalid direction value'
        let c = this.getCell(p)
        this.linkCellsCD(c, direction)
    }

    linkCellsPP(p1: Point, p2: Point) {
        let c1 = this.getCell(p1)
        let c2 = this.getCell(p2)
        this.linkCellsCC(c1, c2)
    }

    linkCellsCD(c: Cell, direction: number) {
        if (!this.isValidDirValue(direction))
            throw 'Invalid direction value'
        c._addLink(direction)
        let cn = c.getNeighbor(direction)
        let ndir = this.getDirectionFromNeighborPerspective(c.point, direction)
        cn._addLink(ndir)
    }

    linkCellsCC(c1: Cell, c2: Cell) {
        let dir = this.getCellDirection(c1.point, c2.point)
        c1._addLink(dir)
        let ndir = this.getDirectionFromNeighborPerspective(c1.point, dir)
        c2._addLink(ndir)
    }

    unlinkCellsPD(p: Point, direction: number) {
        if (!this.isValidDirValue(direction))
            throw 'Invalid direction value'
        let c = this.getCell(p)
        this.unlinkCellsCD(c, direction)
    }

    unlinkCellsPP(p1: Point, p2: Point) {
        let c1 = this.getCell(p1)
        let c2 = this.getCell(p2)
        this.unlinkCellsCC(c1, c2)
    }

    unlinkCellsCD(c: Cell, direction: number) {
        if (!this.isValidDirValue(direction))
            throw 'Invalid direction value'
        c._removeLink(direction)
        let cn = c.getNeighbor(direction)
        let ndir = this.getDirectionFromNeighborPerspective(c.point, direction)
        cn._removeLink(ndir)
    }

    unlinkCellsCC(c1: Cell, c2: Cell) {
        let dir = this.getCellDirection(c1.point, c2.point)
        c1._removeLink(dir)
        let ndir = this.getDirectionFromNeighborPerspective(c1.point, dir)
        c2._removeLink(ndir)
    }
}

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