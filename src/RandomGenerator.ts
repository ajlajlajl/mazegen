import {GeneratorBase, GeneratorState} from "./GeneratorBase.js"
import {SheetBase} from "./SheetBase.js"
import {Rng} from "./Rng.js"
import {CellStates, Point} from "./Cell.js"

export class RandomGenerator extends GeneratorBase {
    road: Point[] = []

    constructor(sheet: SheetBase, rng?: Rng) {
        super(sheet, rng);
    }

    init(): void {
        this.sheet.setAllCellState(CellStates.processing)
        this.state = GeneratorState.init
    }

    step(): boolean {
        if (this.state === GeneratorState.init) {
            this.stepNo = 0
            let pt: any = {}
            let ranges = this.sheet.getPointRanges()
            for (let k in ranges) {
                pt[k] = this.rng.rangeInt(ranges[k].from, ranges[k].to)
            }
            this.road = [pt]
            let c = this.sheet.getCell(pt)
            c.state = CellStates.fin
            this.state = GeneratorState.mapping
            return true
        } else if (this.state === GeneratorState.mapping) {
            this.stepNo++

            return false
        } else if (this.state === GeneratorState.postMapping) {
            return false
        } else if (this.state === GeneratorState.fin) {
            return false
        } else {
            throw 'invalid state'
        }
    }
}