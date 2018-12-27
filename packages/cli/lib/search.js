const child_process = require("child_process");
const gitGrep = require("@scanf/git-grep");
const renderer = require("./renderer");
const path = require("path");
const fs = require("fs");

var __git_grep = function(term, repo, cb) {
  var entries = [];

  // TODO: check is valid git repo
  gitGrep(repo, { rev: "HEAD", term: term })
    .on("data", function(data) {
      entries.push(data);
    })
    .on("error", err => {
      cb([]);
    })
    .on("end", () => cb(entries));
};

var find_repository_path = function(git_path, path) {
  var dir = path;
  if (dir === undefined) {
    dir = process.cwd();
  }
  const stdout = child_process
    .execFileSync(git_path, ["-C", dir, "rev-parse", "--show-toplevel"])
    .toString();
  const absolute_path = stdout.replace("\n", "");

  if (!absolute_path.endsWith(".git")) {
    return `${absolute_path}/.git`;
  }

  return absolute_path;
};

var start = function(opts) {
  const repo = find_repository_path(opts.git_path, opts.repository);
  if (fs.existsSync(repo) === false) {
    err_bail(`${repo} is not a valid directory path`);
  }

  if (
    opts.cache.DefaultConfig.term !== opts.term ||
    opts.cache.DefaultConfig.repository !== repo
  ) {
    opts.cache.reset();
    opts.cache.save(opts.term, repo);
  }

  __git_grep(opts.term, repo, entries => {
    if (entries.length > 0) {
      console.log(renderer.format_header());

      var index = 0;
      entries.forEach(data => {
        console.log(renderer.format_entry(index, opts.term, data));
        opts.cache.write_entry(path.resolve(data.file), data.line);
        index += 1;
      });
    }
  });
};

module.exports = {
  start,
  find_repository_path
};
