FROM node

WORKDIR /opt/sca/imagex-ui

# Install app dependencies
COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]