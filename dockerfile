FROM node:latest

COPY . /www/
WORKDIR /www/

RUN node installdocker build -t kaiena .

CMD [ "npm", "run", "start" ]