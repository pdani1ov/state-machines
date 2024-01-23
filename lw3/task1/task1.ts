import {Command} from "commander";
import {convert} from "./converter";

const program = new Command();

program
	.version('1.0.0')
	.description('grammar converter')
	.action((str, options) => {
		try {
			if (options.args.length != 3) {
				throw new Error('usage: bin/labs-runner lab3-task1 [left|right] [input csv filename] [output csv filename]')
			}
			convert(options.args[0], options.args[1], options.args[2])
		} catch (e) {
			console.log(e as Error)
		}
	})
	.parse(process.argv)