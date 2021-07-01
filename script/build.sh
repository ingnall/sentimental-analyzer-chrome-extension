#!/bin/bash

build() {
    echo 'building react'

    rm -rf SentimentalAnalyzer/*

    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=false

    react-scripts build

    mkdir -p SentimentalAnalyzer
    cp -r build/* SentimentalAnalyzer

    mv SentimentalAnalyzer/index.html SentimentalAnalyzer/popup.html
}

build