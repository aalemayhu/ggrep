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
	mkdir -pv content
	hugo --gc --minify

pristine_env:
	docker build -t ggrep .
	docker run -i -t ggrep /bin/sh
