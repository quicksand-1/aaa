---
group: 钩子
toc: content
title: useCrypto
order: 4
demo:
  cols: 2
---

## sm2 非对称加密演示

- 项目中公钥可配置到 localConfig 中
- [sm-crypto](https://www.npmjs.com/package/sm-crypto)
- [后端](https://github.com/antherd/sm-crypto)：不要使用 hutool 工具类，使用的算法不同

<code title="sm2 加密" src="./_components/useCrypto/demo1.jsx"></code>
<code title="sm2 解密" src="./_components/useCrypto/demo2.jsx"></code>

## sm4 对称加密演示

- 项目中秘钥可配置到 localConfig 中

<code title="sm4 加密" src="./_components/useCrypto/demo3.jsx"></code>
<code title="sm4 解密" src="./_components/useCrypto/demo4.jsx"></code>
