# Stage 1: Prepare the application
FROM node:20.13.0 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Used if needed to build the application
# RUN npm run build

# Stage 2: Serve the application
FROM node:20.13.0

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./

# Using bundle.js directly
COPY ./dist/bundle.js ./dist/

# Copy the point.png file to the same directory as bundle.js
COPY ./dist/point.png ./dist/

# Install only production dependencies
RUN npm install --only=production

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application (from package.json)
CMD ["node", "server.js"]