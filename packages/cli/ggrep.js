#!/usr/bin/env node

const version = require("./package.json").version;
const child_process = require("child_process");
const { GGCache } = new require("./cache");
const renderer = require("./renderer");
const lib = require("./shared");
const cli = require("cac")();
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

var find_repository_path = function(path) {
  var dir = path;
  if (dir === undefined) {
    dir = process.cwd();
  }
  const stdout = child_process
    .execFileSync(GIT_PATH, ["-C", dir, "rev-parse", "--show-toplevel"])
    .toString();
  const absolute_path = stdout.replace("\n", "");

  if (!absolute_path.endsWith(".git")) {
    return `${absolute_path}/.git`;
  }

  return absolute_path;
};

var search = function(repository, term) {
  const repo = find_repository_path(repository);
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
};

var spawn_editor = function(file, line) {
  child_process.spawn(DEFAULT_EDITOR, [file, `+:${line}`], {
    stdio: "inherit"
  });
};

cli.command("--show [line]", "Open corresponding file and set cursor");

cli.version(version);
cli.help();

const parsed = cli.parse();

const line = parsed.options["show"];

if (line) {
  // Fail early if default editor is not present
  if (fs.existsSync() === DEFAULT_EDITOR) {
    err_bail(`missing editor at ${DEFAULT_EDITOR}`);
  }

  const repository = find_repository_path(undefined);
  // Handle cache mismatch
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
} else if (parsed.args.length === 1) {
  search(".", parsed.args[0]);
}
