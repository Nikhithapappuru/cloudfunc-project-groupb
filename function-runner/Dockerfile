# Base Node.js image
FROM node:18

# Working directory inside container
WORKDIR /app

# Copy dependency file
COPY package.json .

# Install dependencies
RUN npm install

# Copy application code
COPY index.js .

# Expose fixed port
EXPOSE 5050

# Start function runner
CMD ["npm", "start"]
