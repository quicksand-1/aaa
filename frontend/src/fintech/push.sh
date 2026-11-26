#!/bin/bash

commit_message=${1:-"update"}

npm run format

npm run docs:build

# 提交代码
git add .&&git commit -m "$commit_message"&&git push
