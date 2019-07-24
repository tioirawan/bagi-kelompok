#!/bin/bash

rm -rf dist/
mkdir -p dist/style dist/script
echo "dist folder reset"

cp favicon.ico dist/

node_modules/.bin/html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype index.html -o dist/index.html

node_modules/.bin/postcss style/*.css --use autoprefixer -d csstemp

node_modules/.bin/uglifycss csstemp/style.css > dist/style/style.css
node_modules/.bin/uglifycss csstemp/loading.css > dist/style/loading.css
node_modules/.bin/uglifycss csstemp/checkbox.css > dist/style/checkbox.css
node_modules/.bin/uglifycss csstemp/snackbar.css > dist/style/snackbar.css

rm -rf csstemp

cp script/murid.json dist/script/murid.json

echo "done..."
