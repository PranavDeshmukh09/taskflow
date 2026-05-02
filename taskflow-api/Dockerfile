# taskflow-api/Dockerfile - FIXED

FROM node:20-alpine

WORKDIR /app

# Copy everything (including node_modules if exists)
COPY . .

# If node_modules doesn't exist locally, install them
RUN if [ ! -d "node_modules" ]; then npm install --omit=dev; fi

EXPOSE 5000

CMD ["node", "src/server.js"]