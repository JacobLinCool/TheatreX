import util from "node:util";
import debug from "debug";
import fs from "./fs";

if (!debug.enabled("theatrex:core")) {
	// @ts-expect-error
	debug.useColors = () => false;
}

const file = fs.logs.client[new Date().toISOString()];
file.$data = "";
const stream = file.$fs.createWriteStream();

const log = debug("theatrex:core");
debug.enable("theatrex:*");
log.log = (...args: any[]) => {
	const out = util.format(...args) + "\n";
	process.stderr.write(out);
	stream.write(out);
};

log("---------- log started ----------");

export default log;
