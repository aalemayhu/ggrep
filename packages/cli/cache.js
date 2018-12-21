const path = require("path");
const fs = require("fs");

class GGCache {
	constructor() {
	this.cacheDirectory = path.join("/tmp/", "ggrep-cache");
	this.defaultConfigFile = path.join(this.cacheDirectory, "config.json");
	this.DefaultConfig = { term: undefined, repository: undefined };
	}

	setup() {
		if (fs.existsSync(cacheDirectory) === false) {
			fs.mkdirSync(cacheDirectory);
		}  
	
		if (fs.existsSync(defaultConfigFile)) {
			try {
				const data = fs.readFileSync(defaultConfigFile, "utf-8");
				const tmp = JSON.parse(data);
				DefaultConfig = tmp;
			} catch (err) {
				console.log("Error in Cache:", err);
			}    
		}  
	}
	save(term, repo) {
		this.DefaultConfig.repository = repo;
		this.DefaultConfig.term = term;
		fs.writeFileSync(this.defaultConfigFile, JSON.stringify(this.DefaultConfig, null, 2));
	}
  }

module.exports = {
	GGCache,
}