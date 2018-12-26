const child_process = require("child_process");

var spawn_editor = function(editor, file, line) {
  child_process.spawn(editor, [file, `+:${line}`], {
    stdio: "inherit"
  });
};

module.exports = {
  spawn_editor
};
