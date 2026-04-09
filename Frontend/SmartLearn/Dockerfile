FROM node:20-slim

WORKDIR /app/SmartLearn

# Copy package files first to leverage Docker cache
COPY package*.json ./
# If using bun (detected in your screenshot), you can use: RUN npm install -g bun && bun install
RUN npm install

COPY . .

# Vite needs to be accessible outside the container
EXPOSE 5173

# We use --host 0.0.0.0 so the container maps correctly to your laptop
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]