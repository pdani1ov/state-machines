import { createTable } from "./readTable"
import { writeLines } from "./writeTable"
import { generateView } from "./view/generateView"

const INPUT_FILE_NAME = 'input.txt'
const OUTPUT_FILE_NAME = 'output.txt'
const OUTPUT_VIEW_FILE_NAME = 'view/view.generated.js'

const [nodes, edges, outputLines] = createTable(INPUT_FILE_NAME)

writeLines(OUTPUT_FILE_NAME, outputLines)
writeLines(OUTPUT_VIEW_FILE_NAME, [generateView(nodes, edges)])