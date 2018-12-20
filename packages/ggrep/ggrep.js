#!/usr/bin/env node

const program = require('commander');
var gitGrep = require("../git-grep/");

program.command('local')
    .option('-d, --directory <directory>', 'Use local git repository')
    .option('-k, --keyword <keyword>', 'Keyword to look for')
    .action((cmd) => {
        const directory = cmd["directory"];
        const keyword = cmd["keyword"];

        // TODO: check it exists.
        // TODO: check is valid git repo

        gitGrep(directory, {
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