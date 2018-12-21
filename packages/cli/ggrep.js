#!/usr/bin/env node

const gitGrep = require("../git-grep/");
const renderer = require("./renderer");
const program = require("commander");
const path = require("path");
const fs = require("fs");

// TODO: move this cache stuff into a seperate js file
const CacheDirectory = path.join("/tmp/", "ggrep-cache");
const CachedConfigFile = path.join(CacheDirectory, "config.json");
var CachedConfig = { term: undefined, repository: undefined };
// Setup the configuration
{
	if (fs.existsSync(CacheDirectory) === false) {
		fs.mkdirSync(CacheDirectory);
	}  

	if (fs.existsSync(CachedConfigFile)) {
		try {
			const data = fs.readFileSync(CachedConfigFile, "utf-8");
			const tmp = JSON.parse(data);
			CachedConfig = tmp;
		} catch (err) {
			console.log("Error in Cache:", err);
		}    
	}  
}

// TODO: support ignoring case
// TODO: regex support

var repository_path = function(directory) {
	// TODO: check it exists.
	// TODO: check is valid git repo
	if (!directory.endsWith(".git")) {
		return path.join(directory, ".git");
	}
	return directory;
};

var search = function(repository, term) {
	const repo = path.resolve(repository_path(repository));
	var first = true;
	var index = 0;
	// TODO: pagination...
	// TODO: fix column alignment
	gitGrep(repo, { rev: "HEAD", term: term }).on("data", function(data) {
		if (first) {
			console.log(renderer.format_header());
			first = false;
		}
		// TODO: should we highlight all occurences of the keyword?
		console.log(renderer.format_entry(index, term, data));
		index += 1;
	}).on("error", function(err) {
		// TODO: handle no matches found
		throw err;
	}).on("end", function() {
		if (CachedConfig.term != term) {
			CachedConfig.repository = repo;
			CachedConfig.term = term;
			fs.writeFileSync(CachedConfigFile, JSON.stringify(CachedConfig, null, 2));
		}
	});
};

program.command("local")
	.option("-d, --directory <directory>", "Use local git repository")
	.option("-k, --term <term>", "term to look for")
	.action((cmd) => {
		search(cmd["directory"], cmd["term"]);
	});

program.command("remote <repo>")
	.option("-r, --remote", "Use remote git repository")
	.action(function(remote, cmd) {
		console.log("Remote=%s", remote);
		// TODO: Make sure valid protocol can be inferred.
		console.log("To be implemented: %s %s", remote, cmd);
	});

// Default behviour should be to search in the current directory
program.command("*").action((term) => {
	search(".", term);
});

program.parse(process.argv);

// User passed no arguments try using the cache
if (program.args.length === 0) {
	if (CachedConfig.term && CachedConfig.repository) {
		// TODO: destroy cache if repository changed...
		search(CachedConfig.repository, CachedConfig.term);
	} else {
		console.log("Found no cache, please specify a term.");
	}
}
