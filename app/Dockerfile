FROM node:19

# cache pkgs
WORKDIR /usr/src/cache

# Install app dependencies
COPY package*.json ./
RUN npm install

# change workdir
WORKDIR /usr/src/app
