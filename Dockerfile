FROM node

WORKDIR /usr/src/ggrep
COPY packages/cli/ ./
RUN npm install -g $(npm pack /usr/src/ggrep | tail -1)
RUN git clone https://github.com/vuejs/vue /usr/src/vue
ENTRYPOINT "/bin/bash"
