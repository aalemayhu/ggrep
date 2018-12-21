const path = require("path");
const fs = require("fs");
const os = require("os");
class GGCache {

	constructor() {
		const user = os.userInfo().username;
		this.cacheDirectory = path.join("/tmp/", `ggrep-cache-for-${user}`);
		this.defaultConfigFile = path.join(this.cacheDirectory, "config.json");
		this.DefaultConfig = { term: undefined, repository: undefined };
		this.entriesFile = path.join(this.cacheDirectory, "entries.txt");
		this.entry_writer = this.new_writer();
		this.setup();
	}

	new_writer() {
		return fs.createWriteStream(this.entriesFile, { flags: "a"});
	}

	setup() {
		if (fs.existsSync(this.cacheDirectory) === false) {
			fs.mkdirSync(this.cacheDirectory);
		}  
	
		if (fs.existsSync(this.defaultConfigFile)) {
			try {
				const data = fs.readFileSync(this.defaultConfigFile, "utf-8");
				this.load(JSON.parse(data));
			} catch (err) {
				console.log("Error in Cache:", err);
			}    
		}  
	}

	load(config) {
		this.DefaultConfig = config;
	}

	save(term, repo) {
		this.DefaultConfig.repository = repo;
		this.DefaultConfig.term = term;
		fs.writeFileSync(this.defaultConfigFile, JSON.stringify(this.DefaultConfig, null, 2));
	}

	write_entry(file, line) {
		// For now just use vim style
		this.entry_writer.write(`${file}:+${line}\n`);
	}

	reset() {
		this.entry_writer.close();
		fs.unlinkSync(this.entriesFile);
		this.entry_writer = this.new_writer();
	}

	entry_at(index) {
		// TODO: what todo if cache is corrupt?
		const buffer = fs.readFileSync(this.entriesFile);
		const contents = buffer.toString().split("\n");
		return contents[index].split(":+");
	}
}

module.exports = {
	GGCache,
};