ARG EXPRESS_BASE_IMAGE=node:20.11.0-alpine

FROM $EXPRESS_BASE_IMAGE AS base

COPY . /serversrc
WORKDIR /serversrc

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run api:build

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS prod

COPY --from=build /serversrc/.local/express/dist/api.js /serversrc/.local/express/dist/api.js
COPY --from=prod-deps /serversrc/node_modules /serversrc/node_modules

CMD ["pnpm", "start"]

# CMD "node" "/serversrc/.local/express/dist/api.js"


# FROM base AS dev

# COPY . /serversrc

# COPY /docker/express/docker-dev-entrypoint.sh /docker-entrypoint.sh
# RUN dos2unix /docker-entrypoint.sh && \
#   chmod +x /docker-entrypoint.sh
  
# ENTRYPOINT [ "/docker-entrypoint.sh" ]

# CMD ["npm", "run", "start"]
