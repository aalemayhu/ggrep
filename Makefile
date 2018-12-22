CLI_DIR ?= $(shell pwd)/packages/cli/
WEBSITE_DIR ?= $(shell pwd)/ggrep.xdp.no

smoke_test:
	node packages/cli/ggrep.js test

lint:
	npm run lint

install-cli:
	cd ${CLI_DIR} && \
	  npm install -g

website:
	cd ${WEBSITE_DIR} && \
	  hugo --gc --minify
