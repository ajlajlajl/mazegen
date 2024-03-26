import {Point, Cell, CellStates} from "./Cell.js"

type CheckCellCB = (point: Point) => boolean

export abstract class SheetBase {
    cells: Cell[]
    entry: Point[]
    exit: Point[]

    protected constructor() {
        this.cells = []
        this.entry = []
        this.exit = []
    }

    abstract index2Point(index: number): Point

    abstract point2Index(point: Point): number

    abstract getAllWalls(): number[]

    abstract resetCells(): void

    abstract isValidPoint(p: Point): boolean

    abstract movePoint(p: Point, direction: number): Point

    getCell(p: Point) {
        if (!this.isValidPoint(p))
            throw 'invalid pos'
        return this.cells[this.point2Index(p)]
    }

    setAllCellState(state: CellStates) {
        this.cells.forEach(c => c.state = state)
    }

    isAllCellsState(state: CellStates): boolean {
        return this.cells.some(c => c.state === state)
    }

    setAllCellData(field: string, value: any) {
        this.cells.forEach(c => c.data[field] = value)
    }

    isAllCellsData(field: string, value: any): boolean {
        return this.cells.some(c => c.data[field] === value)
    }

    abstract isCorridor(cell: Cell): boolean

    abstract validate(): boolean
}

export class RectangleSheet extends SheetBase {
    w: number
    h: number
    isBlockedCB?: CheckCellCB

    constructor(w: number, h: number, isBlocked?: CheckCellCB) {
        super();
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

    getAllWalls(): number[] {
        return [-1, 1, -2, 2] //1 for horizontal, 2 for vertical
    }

    isValidPoint(p: Point): boolean {
        return p.x >= 0 && p.y >= 0 && p.x < this.w && p.y < this.h && (this.isBlockedCB === undefined || !this.isBlockedCB(p))
    }

    resetCells() {
        this.cells = (new Array(this.w * this.h)).fill(1).map((v, i) => {
            return new Cell(this, this.index2Point(i))
        })
    }

    isCorridor(cell: Cell): boolean {
        if (cell.links.length == 2) {
            let walls = cell.listWalls()
            return ((walls.includes(1) && walls.includes(-1)) || (walls.includes(2) && walls.includes(-2)))
        } else
            return false
    }

    getMovementFromDirection(direction: number): Point {
        return {
            x: Math.abs(direction) == 1 ? Math.sign(direction) : 0,
            y: Math.abs(direction) == 2 ? Math.sign(direction) : 0,
        }
    }

    movePoint(p: Point, direction: number): Point {
        let mvp = this.getMovementFromDirection(direction)
        return {x: p.x + mvp.x, y: p.y + mvp.y}
    }

    validate() {
        let notFin = !this.isAllCellsState(CellStates.fin)
        let allWall = this.cells.some(c => c.hasAllWalls())

        /*this.setAllCellData('vldIC', 0)
        let cnnQ: Cell[] = [this.cells[0]]
        while (cnnQ.length > 0) {
            let c = cnnQ.pop() as Cell
            c.data.vldIC = 1
            c.listLinks().forEach(d => {
                let n = c.getNeighbor(d)
                if (n.data.vldIC != 1) {
                    cnnQ.push(n)
                }
            })
        }*/
        //let notInterconnected = !this.isAllCellsData('vldIC', 1)
        return notFin || allWall //|| notInterconnected todo:implement
    }
}