# 1. Use a lightweight Node.js version (Alpine Linux) to save space
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first. 
# This leverages Docker's cache: if dependencies don't change, this step is skipped.
COPY package*.json ./

# 4. Install ONLY production dependencies (skips devDependencies like nodemon)
RUN npm ci --only=production

# 5. Copy the rest of your application code
COPY . .

# 6. Expose the port your server runs on (matches process.env.PORT || 5000)
EXPOSE 5000

# 7. Define the command to start your app
CMD ["npm", "start"]