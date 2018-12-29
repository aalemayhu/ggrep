#!/usr/bin/env node

const sanity_checks = require("./lib/sanity_checks");
const { GGCache } = new require("./cache");
const editor = require("./lib/editor");
const search = require("./lib/search");
const cli = require("./lib/cli");

const cache = new GGCache();

const parsed = cli();
const line = parsed.options["show"];
const git_path = parsed.options["git"];
const vim_path = parsed.options["editor"];

sanity_checks.assert_git_at(git_path);

if (line !== undefined) {
	/*
   * Perform editor check only before a request to show a line.
   * This way user can create the cache and then install editor later.
   * Performing the assertion earlier would force user to install before
   * they want to show a file.
   */
	sanity_checks.assert_editor_at(vim_path);
	const repository = search.find_repository_path(git_path, undefined);

	sanity_checks.handle_cache_mismatch(cache, repository);

	const match = cache.entry_at(line);

	sanity_checks.assert_cache_valid(line);

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
