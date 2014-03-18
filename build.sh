#!/bin/bash

echo "Set up $GH_REPO [via travis] for $GIT_NAME <${GIT_EMAIL}>"
export SITE_REPO_URL="https://$GH_TOKEN@github.com/$GH_REPO.git"
git config --global user.email "$GIT_EMAIL"
git config --global user.name "$GIT_NAME"

cd ~/

echo "Clone site into ~/site"
git clone --depth=50 --branch=master $SITE_REPO_URL ./site

cd ./site

echo "Setting up site, installing docpad an all the deps."
npm install
npm install -g grunt-cli

echo "Getting the content."
grunt

echo "pushing to gh-pages of the site repo"
docpad deploy-ghpages --env static
