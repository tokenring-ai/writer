# vim:set ft=docker/dockerfile:1.8

FROM oven/bun:debian

RUN mkdir /repo
COPY . /repo/
RUN sh /repo/docker/install.sh

EXPOSE 80

WORKDIR /work
CMD ["bun","/repo/src/tr-writer.ts", "--source", "/work"]

