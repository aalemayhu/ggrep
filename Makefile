CLI_DIR ?= $(shell pwd)/packages/cli/

smoke_test:
	node packages/cli/ggrep.js test

lint:
	npm run lint

install-cli:
	cd ${CLI_DIR} && \
	  npm install -g
