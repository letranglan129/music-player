FROM node:16-alpine 

# Create app directory
WORKDIR /app

COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm ci

COPY . /app

EXPOSE 8004

CMD [ "npm", "run", "start" ]