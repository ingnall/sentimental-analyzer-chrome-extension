#!/bin/bash

build() {
    echo 'building react'

    rm -rf /mnt/c/wamp64/www/sentimental-analyzer-chrome-extension/*

    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=false

    react-scripts build

    mkdir -p /mnt/c/wamp64/www/sentimental-analyzer-chrome-extension
    cp -r build/* /mnt/c/wamp64/www/sentimental-analyzer-chrome-extension

    mv /mnt/c/wamp64/www/sentimental-analyzer-chrome-extension/index.html /mnt/c/wamp64/www/sentimental-analyzer-chrome-extension/popup.html
}

build