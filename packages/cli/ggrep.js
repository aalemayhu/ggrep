#!/usr/bin/env node

const version = require("./package.json").version;
const child_process = require("child_process");
const { GGCache } = new require("./cache");
const renderer = require("./renderer");
const program = require("commander");
const lib = require("./shared");
const path = require("path");
const fs = require("fs");

const cache = new GGCache();

// Should the below be overridable via envvars?
const DEFAULT_EDITOR = "/usr/bin/vim";
const GIT_PATH = "/usr/bin/git";


var err_bail = function(msg) {
  console.log(renderer.format_error(msg));
  process.exit(1);
};

// Sanity check the environment
if (fs.existsSync(GIT_PATH) === false) {
  err_bail(`expected git binary at ${GIT_PATH}`);
}

var repository_path = function(directory) {
  if (!directory.endsWith(".git")) {
    return path.join(directory, ".git");
  }
  return directory;
};

var spawn_editor = function(file, line) {
  child_process.spawn(DEFAULT_EDITOR, [file, `+:${line}`], {
    stdio: "inherit"
  });
};

var search = function(repository, term) {
  child_process.execFile(GIT_PATH,
    ["-C", repository, "rev-parse", "--show-toplevel"],
    (err, stdout, stderr) => {
	  const repo = path.resolve(repository_path(stdout.replace('\n', '')));
      if (fs.existsSync(repo) === false) {
        err_bail(`${repo} is not a valid directory path`);
      }
      if (
        cache.DefaultConfig.term !== term ||
        cache.DefaultConfig.repository !== repo
      ) {
        cache.reset();
        cache.save(term, repo);
      }

      lib.search(term, repo, entries => {
        if (entries.length > 0) {
          console.log(renderer.format_header());

          var index = 0;
          entries.forEach(data => {
            console.log(renderer.format_entry(index, term, data));
            cache.write_entry(path.resolve(data.file), data.line);
            index += 1;
          });
        }
      });
    }
  );
};

program.version(version, "-v, --version");

program.command("show <line>").action(function(line) {
  // Fail early if default editor is not present
  if (fs.existsSync() === DEFAULT_EDITOR) {
    err_bail(`missing editor at ${DEFAULT_EDITOR}`);
  }

  const repository = repository_path(process.cwd());
  if (cache.DefaultConfig.repository !== repository) {
    if (cache.DefaultConfig.repository !== undefined)
      console.log(`Last cache is from ${cache.DefaultConfig.repository}`);
    err_bail(`No cache for ${repository}`);
  }

  const match = cache.entry_at(line);
  if (match === undefined) {
    err_bail("failed to open file, corrupt cache?");
  }
  const file_name = match[0];
  const file_line = match[1];
  spawn_editor(file_name, file_line);
});

// Default behaviour should be to search in the current directory
program.command("*", "no args means use cache, one arg means search").action(term => search(".", term));

program.parse(process.argv);

// User passed no arguments try using the cache
if (program.args.length === 0) {
  if (cache.DefaultConfig.term && cache.DefaultConfig.repository) {
    search(cache.DefaultConfig.repository, cache.DefaultConfig.term);
  } else {
    console.log("Found no cache, please specify a term.");
  }
}
