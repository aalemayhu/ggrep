#!/usr/bin/env node

const version = require('./package.json').version;
const child_process = require("child_process");
const { GGCache } = new require("./cache");
const renderer = require("./renderer");
const program = require("commander");
const lib = require("../lib/shared");
const path = require("path");
const fs = require("fs");

const cache = new GGCache();

var repository_path = function(directory) {
	if (!directory.endsWith(".git")) {
		return path.join(directory, ".git");
	}
	return directory;
};

var err_bail = function(msg) {
	console.log(renderer.format_error(msg));
	process.exit(1);
};

var spawn_editor = function(file, line) {
	child_process.spawn("/usr/bin/vim", [file, `+:${line}`], {
		stdio: "inherit"
	});
};

var search = function(repository, term) {
	const repo = path.resolve(repository_path(repository));
	if (fs.existsSync(repo) === false) {
		err_bail(`${repo} is not a valid directory path`);
    }
    if (cache.DefaultConfig.term != term) {
        cache.reset();
        cache.save(term, repo);
    }
    lib.search(term, repo, (entries) => {
        console.log(renderer.format_header());
     
        var index = 0;
        entries.forEach(data => {
            console.log(renderer.format_entry(index, term, data));
            // TODO: should we highlight all occurences of the keyword?
            cache.write_entry(path.resolve(data.file), data.line);
            index += 1;
        });
    })
	// TODO: pagination...
	// TODO: fix column alignment
};


// TODO: support ignoring case
// TODO: regex support

program.version(version, '-v, --version')

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
    
program.command("show <line>")
	.action(function(line) {
		const match = cache.entry_at(line);
		if (match === undefined) {
			err_bail("failed to open file, corrupt cache?");
		}
		const file_name = match[0];
		const file_line = match[1];
		spawn_editor(file_name, file_line);
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
