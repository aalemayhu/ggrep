#!/usr/bin/env node

const sanity_checks = require("./lib/sanity_checks");
const { GGCache } = new require("./cache");
const renderer = require("./lib/renderer");
const editor = require("./lib/editor");
const search = require("./lib/search");
const cli = require("./lib/cli");
const fs = require("fs");

const cache = new GGCache();

const parsed = cli();
const line = parsed.options["show"];
const git_path = parsed.options["git"];
const vim_path = parsed.options["editor"];

sanity_checks.assert_git_at(git_path);

if (line) {
  /*
   * Perform editor check only before a request to show a line.
   * This way user can create the cache and then install editor later.
   * Performing the assertion earlier would force user to install before
   * they want to show a file.
   */
  sanity_checks.assert_editor_at(vim_path);
  const repository = search.find_repository_path(git_path, undefined);

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
  editor.spawn_editor(vim_path, file_name, file_line);
} else if (parsed.args.length === 1) {
  search.start({
    git_path: git_path,
    repository: ".",
    term: parsed.args[0],
    cache: cache
  });
}
