import * as fs from "fs"

const LINE_BREAK = /\r?\n/

function readLines(filename: string): Array<string> {
	const content = fs.readFileSync(filename, 'utf8')
	return  content.split(LINE_BREAK)
}

export {
	readLines
}