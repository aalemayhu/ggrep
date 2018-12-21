#!/usr/bin/env node

const gitGrep = require("../git-grep/");
const program = require('commander');
const colors = require("./colors");
const path = require('path');

// TODO: support ignoring case
// TODO: regex support

var repository_path = function(directory) {
        // TODO: check it exists.
        // TODO: check is valid git repo
    if (!directory.endsWith(".git")) {
        return path.join(directory, ".git")
    }
    return directory;
}

var search = function(repository, keyword) {
    const repo = repository_path(repository);
    // TODO: rename keyword to term
    var first = true;
    var index = 0;
    gitGrep(repo, {
        rev: "HEAD",
        term: keyword
    }).on("data", function(data) {
        if (first) {
            console.log
            ("%s\t%s\t\t%s\t\%s", 
            colors.IndexColor.underline("Index"),
            colors.FileColor.underline("File"),
            colors.LineColor.underline("Line"),
            colors.ContentColor.underline("Content"))
            first = false;
        }
        // TODO: should we highlight all occurences of the keyword?
        console.log(
            '%s\t%s\t\t%s\t\t%s',
            index % 2 ? colors.SecondaryIndexColor(index) : colors.IndexColor(index),
            colors.FileColor(data.file),
            colors.LineColor(data.line),
            data.text.replace(keyword, colors.HighlightColor(keyword)));
            index += 1;
    }).on("error", function(err) {
        throw err;
    }).on("end", function() {
        // The end.
    });
}

program.command('local')
    .option('-d, --directory <directory>', 'Use local git repository')
    .option('-k, --keyword <keyword>', 'Keyword to look for')
    .action((cmd) => {
        search(cmd["directory"], cmd["keyword"]);
    })

program.command('remote <repo>')
    .option('-r, --remote', 'Use remote git repository')
    .action(function(remote, cmd) {
        console.log('Remote=%s', remote);
        // TODO: Make sure valid protocol can be inferred.
    })

// Default behviour should be to search in the current directory
program.command('*').action((term) => {
    search('.', term)
});


program.parse(process.argv);