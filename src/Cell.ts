import {SheetBase} from "./sheet.js"

export interface Point {
    x: number
    y: number

    [id: string]: number
}

export enum CellStates {
    init,
    blocked,
    fin,
    processing,
    step1,
    step2,
    step3,
}

export class Cell {
    links: number[]
    point: Point
    state: CellStates
    sheet: SheetBase
    data: { [id: string]: any }

    constructor(sheet: SheetBase, point: Point) {
        this.point = point
        this.state = CellStates.init
        this.sheet = sheet
        this.links = []
        this.data = {}
    }

    hasAllWalls(): boolean {
        return this.links.length === 0
    }

    isCorridor(): boolean {
        return this.sheet.isCorridor(this)
    }

    isValidNeighbor(dir: number): boolean {
        let np = this.sheet.movePoint(this.point, dir)
        return this.sheet.isValidCellPoint(np)
    }

    getNeighbor(dir: number): Cell {
        let np = this.sheet.movePoint(this.point, dir)
        if (!this.sheet.isValidPoint(np))
            throw 'invalid point in that dir'
        return this.sheet.getCell(np)
    }

    listWalls(): number[] {
        return this.sheet.getAllWalls().filter(w => !this.links.includes(w))
    }

    listLinks(): number[] {
        return this.links
    }

    listValidDirs() {
        return this.sheet.getAllWalls().filter(w => this.isValidNeighbor(w))
    }

    listValidNeighbors(): Cell[] {
        return this.listValidDirs().map(d => this.getNeighbor(d))
    }

    _addLink(dir: number) {
        if (!this.links.includes(dir)) {
            this.links.push(dir)
        }
    }

    _removeLink(dir: number) {
        let i = this.links.indexOf(dir)
        if (i !== -1)
            this.links.splice(i, 1)
    }

    linkTo(dir: number) {
        this.sheet.linkCellsCD(this, dir)
    }
}