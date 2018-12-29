FROM node

WORKDIR /usr/src/ggrep
COPY packages/cli/ ./
RUN npm install-test
RUN npm install -g
RUN git clone https://github.com/vuejs/vue /usr/src/vue
ENTRYPOINT "/bin/bash"
