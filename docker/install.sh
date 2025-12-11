#!/bin/sh

set -e

chmod 755 /dist/tr-writer

rm -rf /var/cache/apt
rm -rf /var/lib/apt/lists/*