#!/bin/sh

set -e

apt update
apt install -y git libportaudio2

chmod 755 /dist/tr-writer

apt remove -y build-essential
apt autoremove -y

rm -rf /var/cache/apt
rm -rf /var/lib/apt/lists/*