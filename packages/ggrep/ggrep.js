#!/usr/bin/env node

const gitGrep = require("../git-grep/");
const program = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs')

const CacheDirectory = path.join('/tmp/', 'ggrep-cache');
const CachedConfigFile = path.join(CacheDirectory, 'config.json');
var CachedConfig = { term: undefined, repository: undefined };
// Setup the configuration
{
    if (fs.existsSync(CacheDirectory) === false) {
        fs.mkdirSync(CacheDirectory);
    }  

    if (fs.existsSync(CachedConfigFile)) {
        try {
            const data = fs.readFileSync(CachedConfigFile, 'utf-8');
            const tmp = JSON.parse(data);
            CachedConfig = tmp;
        } catch (err) {
            console.log('Error in Cache:', err)
        }    
    }  
}

var repository_path = function(directory) {
        // TODO: check it exists.
        // TODO: check is valid git repo
    if (!directory.endsWith(".git")) {
        return path.join(directory, ".git")
    }
    return directory;
}

var search = function(repository, keyword) {
    const repo = path.resolve(repository_path(repository));
    // TODO: rename keyword to term
    var first = true;
    var index = 0;
    // TODO: pagination...
    // TODO: fix column alignment
    gitGrep(repo, { rev: "HEAD", term: keyword }).on("data", function(data) {
        if (first) {
            console.log("%s\t%s\t\t%s\t\%s", chalk.yellow.underline("Index"), chalk.blue.underline("File"), chalk.green.underline("Line"), chalk.underline("Content"))
            first = false;
        }
        // TODO: use zebra coloring on index
        // TODO: should we highlight all occurences of the keyword?
        console.log('%s\t%s\t\t%s\t\t%s', chalk.yellow(index++), chalk.blue(data.file), chalk.green(data.line), data.text.replace(keyword, chalk.bold.red(keyword)));
    }).on("error", function(err) {
        throw err;
    }).on("end", function() {
        if (CachedConfig.term != keyword) {
            CachedConfig.repository = repo;
            CachedConfig.term = keyword;
            fs.writeFileSync(CachedConfigFile, JSON.stringify(CachedConfig, null, 2))
        }
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

// User passed no arguments try using the cache
if (program.args.length === 0) {
    if (CachedConfig.term && CachedConfig.repository) {
        // TODO: destroy cache if repository changed...
        search(CachedConfig.repository, CachedConfig.term)
    } else {
        console.log('Found no cache, please specify a term.')
    }
}