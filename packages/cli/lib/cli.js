const version = require("../package.json").version;
const cli = require("cac")();

var parsed_cli = () => {
  cli.option(
    "--editor <type>",
    "Path to text editor (for now only vim supported)",
    {
      default: "/usr/bin/vim"
    }
  );

  cli.option("--git <git>", "Path to git installation", {
    default: "/usr/bin/git"
  });

  cli.command("--show [line]", "Open corresponding file and set cursor");
  cli.version(version);
  cli.help();

  return cli.parse();
};

module.exports = parsed_cli;
