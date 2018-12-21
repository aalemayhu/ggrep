const path = require("path");
const fs = require("fs");
const os = require('os');

class GGCache {
	constructor() {
	const user = os.userInfo().username;
	this.cacheDirectory = path.join("/tmp/", `ggrep-cache-for-${user}`);
	this.defaultConfigFile = path.join(this.cacheDirectory, "config.json");
	this.DefaultConfig = { term: undefined, repository: undefined };

	this.setup();
	}

	setup() {
		if (fs.existsSync(this.cacheDirectory) === false) {
			fs.mkdirSync(this.cacheDirectory);
		}  
	
		if (fs.existsSync(this.defaultConfigFile)) {
			try {
				const data = fs.readFileSync(this.defaultConfigFile, "utf-8");
				const tmp = JSON.parse(data);
				this.DefaultConfig = tmp;
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