FROM node

WORKDIR /usr/src/ggrep
COPY packages/cli/ ./
ENTRYPOINT "/bin/sh"
