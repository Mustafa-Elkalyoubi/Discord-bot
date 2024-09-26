ARG NGINX_BASE_IMAGE=nginx:1.23.0-alpine
ARG NODE_BASE_IMAGE=node:20.17.0-alpine

FROM $NODE_BASE_IMAGE AS builder

COPY . /clientsrc
WORKDIR /clientsrc

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM builder AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM builder AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run vite:build

### Use NGINX to serve the app
FROM $NGINX_BASE_IMAGE AS base
# Copy built files to nginx root
COPY --from=build /clientsrc/.local/vite/dist /usr/share/nginx/html
COPY --from=prod-deps /clientsrc/node_modules /usr/share/nginx/node_modules

# Copy Nginx config file
COPY /docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Add custom entrypoint
COPY /docker/nginx/docker-entrypoint.sh /
RUN dos2unix /docker-entrypoint.sh

# Remove unneeded entrypoint files.
RUN rm -rf /docker-entrypoint.d && \
    chmod +x /docker-entrypoint.sh

ENTRYPOINT [ "/docker-entrypoint.sh" ]

# This image is intended to be run with docker-compose. See docker-compose*.yml files for necessary
# environment variables
CMD ["nginx", "-g", "daemon off;"]
