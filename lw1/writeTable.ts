import * as fs from "fs";

const LINE_BREAK = `\n`

function writeLines(filename: string, lines: Array<string>): void {
	fs.writeFile(filename, lines.join(LINE_BREAK), () => {})
}

export {
	writeLines
}