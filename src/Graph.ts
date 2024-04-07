import {SheetBase} from "./SheetBase.js"
import {CellStates, Cell, Point} from "./Cell.js"

export function categorize(sheet: SheetBase): number {
    sheet.setAllCellData('ctg', 0)
    let ctg = 0
    let uncCell
    while ((uncCell = sheet.cells.find(c => c.state !== CellStates.blocked && c.data.ctg === 0)) !== undefined) {
        ctg++
        let Q: Cell[] = [uncCell]
        while (Q.length > 0) {
            let c = Q.pop() as Cell
            c.data.ctg = ctg
            c.listLinks().forEach(d => {
                let n = c.getNeighbor(d)
                if (n.data.ctg == 0) {
                    Q.push(n)
                }
            })
        }
    }
    return ctg
}

export function calcDistance(start: Cell, straightWeight: number, cornerWeight: number) {
    let sheet = start.sheet
    sheet.setAllCellData('dist', -1)
    start.data.dist = 0
    let Q: { cell: Cell, movingDir: number }[] = [{cell: start, movingDir: NaN}]
    while (Q.length > 0) {
        let n = Q.pop() as { cell: Cell, movingDir: number }
        n.cell.listLinks().forEach(d => {
            let ch = n.cell.getNeighbor(d)
            if (ch.data.dist === -1) {
                ch.data.dist = n.cell.data.dist + (d === n.movingDir ? straightWeight : cornerWeight)
                Q.push({cell: ch, movingDir: d})
            }
        })
    }
}