const child_process = require("child_process");
const gitGrep = require("@scanf/git-grep");
const renderer = require("./renderer");
const ui = require("cliui")();
const path = require("path");

var __git_grep = function(term, repo, cb) {
  var entries = [];

  gitGrep(repo, { rev: "HEAD", term: term })
    .on("data", data => entries.push(data))
    .on("error", err => cb([]))
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

  if (
    opts.cache.DefaultConfig.term !== opts.term ||
    opts.cache.DefaultConfig.repository !== repo
  ) {
    opts.cache.reset();
    opts.cache.save(opts.term, repo);
  }

  __git_grep(opts.term, repo, entries => {
    var content_column = [];
    var index_column = [];
    var file_column = [];

    if (entries.length > 0) {
      var headers = renderer.format_header();

      index_column = headers[0] + "\n";
      file_column = headers[1] + "\n";
      content_column = headers[2] + "\n";

      var index = 0;
      entries.forEach(data => {
        var entry = renderer.format_entry(index, opts.term, data);
        index_column += entry[0] + "\n";
        file_column += entry[1] + "\n";
        content_column += entry[2] + "\n";
        opts.cache.write_entry(path.resolve(data.file), data.line);
        index += 1;
      });
      ui.span(index_column, file_column, content_column);
      console.log(ui.toString());
    }
  });
};

module.exports = {
  start,
  find_repository_path
};
