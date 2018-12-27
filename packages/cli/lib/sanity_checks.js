const fs = require("fs");
const renderer = require("./renderer");

var err_bail = function(msg) {
  console.log(renderer.format_error(msg));
  process.exit(1);
};

var assert_git_at = function(git_path) {
  // Sanity check the environment
  if (git_path === undefined || fs.existsSync(git_path) === false) {
    err_bail(`expected git binary at ${git_path}`);
  }
};

var assert_editor_at = function(editor_path) {
  if (editor_path === undefined || fs.existsSync() === editor_path) {
    err_bail(`missing editor at ${editor_path}`);
  }
};

var handle_cache_mismatch = function(cache, repository) {
  // Handle cache mismatch
  if (cache.DefaultConfig.repository !== repository) {
    if (cache.DefaultConfig.repository !== undefined)
      console.log(`Last cache is from ${cache.DefaultConfig.repository}`);
    err_bail(`No cache for ${repository}`);
  }
};

var assert_cache_valid = function(entry) {
  if (entry === undefined) {
    err_bail("failed to open file, corrupt cache?");
  }
};

module.exports = {
  assert_git_at,
  assert_editor_at,
  handle_cache_mismatch,
  assert_cache_valid
};
