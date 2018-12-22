const gitGrep = require("../git-grep");

var search = function(term, repo, cb) {
	var entries = [];

	// TODO: check is valid git repo
	gitGrep(repo, { rev: "HEAD", term: term }).on("data", function(data) {
		entries.push(data);
	}).on("error", (err) => {
		cb([]);
	}).on("end", () => cb(entries));
};

module.exports = {
	search
};