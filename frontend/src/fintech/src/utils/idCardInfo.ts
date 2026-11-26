function idCardInfo(idCard = '') {
  const gender = `${parseInt(idCard[16], 10) % 2}`;
  const birth = `${idCard.substr(6, 4)}/${idCard.substr(10, 2)}/${idCard.substr(
    12,
    2,
  )}`;

  return {
    gender,
    birth,
    age: (() => {
      const nowDate = new Date();
      const birthDate = new Date(birth); // 获取时间格式
      let age = nowDate.getFullYear() - birthDate.getFullYear();

      if (
        nowDate.getMonth() < birthDate.getMonth() ||
        (nowDate.getMonth() === birthDate.getMonth() &&
          nowDate.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age;
    })(),
  };
}

export default idCardInfo;
