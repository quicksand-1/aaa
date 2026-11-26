// @ts-nocheck
import smCrypto from 'sm-crypto';
import localConfig from '../localConfig';

const useCrypto = (type = 'sm4') => {
  const key = localConfig.newInstance()[type];
  const sm = smCrypto[type];

  /**
   * 加密
   * @text：需要加密的文本
   * @key2：密钥
   * @compress：是否压缩，只对 sm2 生效
   * */
  const encode = (text = '', key2, compress) => {
    let publicKey = key2 || key; // 秘钥

    if (type === 'sm4') {
      return sm.encrypt(text, publicKey);
    }

    if (type === 'sm2') {
      if (compress) {
        publicKey = sm.compressPublicKeyHex(publicKey);
      }
      return sm.doEncrypt(text, publicKey);
    }
  };

  /**
   * 解密
   * @text：需要解密的文本
   * @key2：密钥
   * */
  const decode = (text = '', key2) => {
    let privateKey = key2 || key; // 秘钥

    if (type === 'sm4') {
      return sm.decrypt(text, privateKey);
    }

    if (type === 'sm2') {
      return sm.doDecrypt(text, privateKey);
    }
  };

  return [encode, decode, sm];
};

export default useCrypto;
