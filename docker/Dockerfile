# vim:set ft=docker/dockerfile:1.8

FROM node:22

RUN mkdir /repo
COPY . /repo/
RUN sh /repo/docker/install.sh

EXPOSE 80

WORKDIR /repo
CMD ["node","/repo/src/tr-coder.js", "--source", "/repo"]

