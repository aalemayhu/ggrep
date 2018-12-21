#!/usr/bin/env node

const { GGCache } = new require("./cache");
const gitGrep = require("../git-grep/");
const renderer = require("./renderer");
const program = require("commander");
const path = require("path");
const fs = require("fs");

const cache = new GGCache();

var repository_path = function(directory) {
	if (!directory.endsWith(".git")) {
		return path.join(directory, ".git");
	}
	return directory;
};

var search = function(repository, term) {
    const repo = path.resolve(repository_path(repository));
    if (fs.existsSync(repo) === false) {
        console.log(renderer.format_error(`${repo} is not a valid directory path`))
        process.exit(1);
    }
	// TODO: check is valid git repo

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
		if (cache.DefaultConfig.term != term) {
            cache.save(term, repo);
		}
	});
};


// TODO: support ignoring case
// TODO: regex support


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
	if (cache.DefaultConfig.term && cache.DefaultConfig.repository) {
		// TODO: destroy cache if repository changed...
		search(cache.DefaultConfig.repository, cache.DefaultConfig.term);
	} else {
		console.log("Found no cache, please specify a term.");
	}
}
