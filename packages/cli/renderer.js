const colors = require("./colors");

var format_header = function() {
	const index = colors.IndexColor.underline("Index");
	const file = colors.FileColor.underline("File");
	const line = colors.LineColor.underline("Line");
	const content = colors.ContentColor.underline("Content");
	return `${index}\t${file}\t\t${line}\t\t${content}`;
};

var format_entry = function(index, term, data) {
	const eIndex = index % 2 ? colors.SecondaryIndexColor(index) : colors.IndexColor(index);
	const eterm = data.text.replace(new RegExp(term, 'g'), colors.HighlightColor(term));
	const file = colors.FileColor(data.file);
	const line = colors.LineColor(data.line);
	return `${eIndex}\t${file}\t\t${line}\t\t${eterm}`;
};

var format_error = function(msg) {
	const prefix = colors.HighlightColor("Error");
	return `${prefix}: ${msg}`;
};

module.exports = {
	format_header,
	format_entry,
	format_error
};