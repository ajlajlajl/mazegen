import {Cell, CellStates, Point} from "./Cell.js"

export type CheckCellCB = (point: Point) => boolean

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
