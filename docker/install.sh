#!/bin/sh

set -e


apt update
apt install -y git

rm -rf /var/cache/apt
rm -rf /var/lib/apt/lists/*

cd /repo
rm -rf /repo/node_modules
bun install