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
        console.log('repository=%s', repository);
        const keyword = cmd["keyword"];

        gitGrep(repository, {
            rev: "HEAD",
            term: keyword
        }).on("data", function(data) {
            // console.log("Index\tFile\t\tLine\t\tContent")
            // console.log(data.length);
            // data.forEach(entry => {
            //     console.log(entry)
            // });
            console.log(data);
        }).on("error", function(err) {
            throw err;
        }).on("end", function() {
            console.log("\n±±±±±±±±±±±±±±±±±±");
        });

    })

program.command('remote <repo>')
    .option('-r, --remote', 'Use remote git repository')
    .action(function(remote, cmd) {
        console.log('Remote=%s', remote);
        // TODO: Make sure valid protocol can be inferred.
    })

program.parse(process.argv);