FROM node:latest

COPY . /www/Como norm
WORKDIR /www/

RUN npm install

CMD ["npm","run", "start"]