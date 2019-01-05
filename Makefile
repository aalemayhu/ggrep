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

build_image:
	docker build -t ggrep .

pristine_env: build_image
	docker run -i -t ggrep /bin/bash

publish: lint test
	npm publish --access=public
