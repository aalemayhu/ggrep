const child_process = require("child_process");
const gitGrep = require("@scanf/git-grep");
const renderer = require("./renderer");
const ui = require("cliui")({ wrap: false });
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
  const pwd = process.cwd();

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
      index_column = headers.index + "\n";
      file_column = headers.location + "\n";
      content_column = headers.content + "\n";

      var dir = repo.replace(".git", "");
      for (const [index, data] of entries.entries()) {
        const absolute_path = path.resolve(path.join(dir, data.file));
        const dirname = path.dirname(absolute_path);
        if (pwd !== dirname && !dirname.includes(pwd)) {
          continue;
        }
        var entry = renderer.format_entry(index, opts.term, data);
        index_column += entry.index;
        file_column += entry.location;
        content_column += entry.content;

        if (index !== entries.length - 1) {
          index_column += "\n";
          file_column += "\n";
          content_column += "\n";
        }
        opts.cache.write_entry(absolute_path, data.line);
      }
      ui.span(index_column, file_column, content_column);
      process.stdout.write(ui.toString());
    }
  });
};

module.exports = {
  start,
  find_repository_path
};
