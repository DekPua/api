# Use the official Node.js image as the base image
FROM node:21-alpine

# Set the working directory inside the container
WORKDIR /express

# Copy your application files into the container
COPY . .

# Install dependencies
RUN npm install

# Define the command to run your bot
CMD ["node", "index.js"]
