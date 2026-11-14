# KAJOK — all-in-one image: builds the React client and serves it together with the API.
FROM node:22-alpine AS build
WORKDIR /app
# Install dependencies for both packages
COPY package.json package-lock.json* ./
COPY server/package.json server/package-lock.json* server/
COPY client/package.json client/package-lock.json* client/
RUN npm --prefix server ci || npm --prefix server install
RUN npm --prefix client ci || npm --prefix client install
# Copy source and build the client
COPY . .
RUN npm --prefix client run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
COPY --from=build /app /app
EXPOSE 8080
# Serves both the built storefront (client/dist) and the /api endpoints
CMD ["npm", "--prefix", "server", "run", "start"]
