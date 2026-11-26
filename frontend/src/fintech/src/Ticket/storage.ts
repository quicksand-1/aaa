import storageSQL from '../utils/storageSQL';

const where = 'key=TICKET';

export default {
  set(data = {}) {
    storageSQL('duplicate', {
      where,
      values: {
        key: 'TICKET',
        ...data,
      },
    });
  },
  get() {
    const data = storageSQL('find', { where });
    storageSQL('delete', { where });
    return data;
  },
  setOriginBizData(ticketKey, bizData) {
    storageSQL('duplicate', {
      where: `key=${ticketKey}`,
      values: {
        key: ticketKey,
        bizData,
      },
    });
  },
  getOriginBizData(ticketKey) {
    return storageSQL('find', { where: `key=${ticketKey}` });
  },
};
