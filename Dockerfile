FROM node:20-slim

# Install system dependencies required by sharp
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy application source
COPY server.js ./
COPY src/ ./src/

# Hugging Face Spaces requires port 7860
ENV PORT=7860

EXPOSE 7860

# Run the app
CMD ["node", "server.js"]
