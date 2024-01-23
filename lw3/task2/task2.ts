import {Command} from "commander";
import {NKAToDKA} from "./determinator";

const program = new Command()
program
	.version('1.0.0')
	.description('automation determinator')
	.action((str, options) => {
		try {
			if (options.args.length !== 2) {
				throw new Error('usage: bin/labs-runner lab3-task2 [input csv filename] [output csv filename]')
			}
			NKAToDKA(options.args[0], options.args[1])
		} catch (e) {
			const err = e as Error
			console.log(err)
		}
	})
	.parse(process.argv)