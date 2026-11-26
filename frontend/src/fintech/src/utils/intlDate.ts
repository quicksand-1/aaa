/**
 * hour12 是 Intl.DateTimeFormat 的一个选项，用于指定是否使用 24 小时制格式。具体含义如下：
 *   true（默认值）：表示使用 12 小时制，会显示 AM 或 PM。
 *   false：表示使用 24 小时制，不会显示 AM 或 PM。
 * */
const intlDate = {
  format: (
    date: Date | number,
    split: string = '-',
    layout = [1, 1, 1, 1, 1, 1],
  ) => {
    const formatConfig = [
      { year: 'numeric' },
      { month: '2-digit' },
      { day: '2-digit' },
      { hour: '2-digit', hour12: false },
      { minute: '2-digit' },
      { second: '2-digit' },
    ];
    // 使用 filter 筛选出需要的配置项
    const options = Object.assign(
      {},
      ...layout
        .map((enabled, index) => enabled && formatConfig[index])
        .filter(Boolean),
    );

    try {
      const d = new Intl.DateTimeFormat('zh-CN', options).format(
        new Date(date),
      );
      return d.replace(/\//g, split);
    } catch (e) {
      console.error('日期格式化出错:', e);
      return '';
    }
  },
  week: (abbreviation: string) => {
    const config = {
      Mon: '周一',
      Tue: '周二',
      Wed: '周三',
      Thu: '周四',
      Fri: '周五',
      Sat: '周六',
      Sun: '周日',
    };

    return config[abbreviation];
  },
};

export default intlDate;
