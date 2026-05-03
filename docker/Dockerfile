# vim:set ft=docker/dockerfile:1.8

FROM debian:trixie

LABEL org.opencontainers.image.source="https://github.com/tokenring-ai/monorepo"

COPY dist /dist
COPY docker/install.sh /install.sh
ARG TARGETARCH
RUN cp "/dist/tr-writer-linux-${TARGETARCH}" /dist/tr-writer \
  && /install.sh \
  && rm -f /dist/tr-writer-linux-*

EXPOSE 80

WORKDIR /dist
CMD ["/dist/tr-writer"]
