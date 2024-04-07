import {SheetBase} from "./SheetBase.js"
import {Rng} from "./Rng.js"

export enum GeneratorState {
    init, mapping, postMapping, fin
}

export abstract class GeneratorBase {
    sheet: SheetBase
    rng: Rng

    protected stepNo: number = 0
    protected state: GeneratorState = GeneratorState.init

    protected constructor(sheet: SheetBase, rng?: Rng) {
        this.sheet = sheet
        this.rng = rng ?? new Rng([Date.now(), Math.floor(Math.random() * 1e6), Math.floor(Math.random() * 1e6), Math.floor(Math.random() * 1e6)])
    }

    abstract init(): void
    abstract step(): boolean
}