FROM node:latest
MAINTAINER Ivan Shastin ivan.shastin@gmail.com
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/expressapp && cp -a /tmp/node_modules /opt/expressapp
WORKDIR /opt/expressapp
COPY . /opt/expressapp
EXPOSE 3000
CMD ["npm", "start"]