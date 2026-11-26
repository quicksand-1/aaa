#!/bin/bash

commit_message=${1:-"update"}

# 提交代码，框架在提交代码时必须携带前缀
# 前缀支持：['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'workflow', 'build', 'ci', 'chore', 'types', 'wip', 'release', 'dep', 'deps', 'example', 'examples', 'merge', 'revert']
git add .&&git commit -m "chore: $commit_message"&&git push