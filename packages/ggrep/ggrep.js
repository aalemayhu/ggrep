#!/usr/bin/env node

const gitGrep = require("../git-grep/");
const program = require('commander');
const path = require('path');

var repository_path = function(directory) {
        // TODO: check it exists.
        // TODO: check is valid git repo
    if (!directory.endsWith(".git")) {
        return path.join(directory, ".git")
    }
    return directory;
}

program.command('local')
    .option('-d, --directory <directory>', 'Use local git repository')
    .option('-k, --keyword <keyword>', 'Keyword to look for')
    .action((cmd) => {
        var repository = repository_path(cmd["directory"]);
        const keyword = cmd["keyword"];
        var first = true;
        var index = 0;

        gitGrep(repository, {
            rev: "HEAD",
            term: keyword
        }).on("data", function(data) {
            if (first) {
                console.log("Index\tFile\t\tLine\t\tContent")
                first = false;
            }
            console.log('%s\t%s\t\t%d\t\t%s', index++, data.file, data.line, data.text);
        }).on("error", function(err) {
            throw err;
        }).on("end", function() {
            // The end.
        });

    })

program.command('remote <repo>')
    .option('-r, --remote', 'Use remote git repository')
    .action(function(remote, cmd) {
        console.log('Remote=%s', remote);
        // TODO: Make sure valid protocol can be inferred.
    })

program.parse(process.argv);