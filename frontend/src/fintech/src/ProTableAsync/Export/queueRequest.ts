/**
 * 分页列表下载所有数据
 * @API
 *   url: 接口地址
 *   params: 接口参数
 *   maxPageSize: 每页最大请求数
 *   callback(props): 每次请求结束后的回调函数，如果返回 stop，则终止后续请求
 *     finally: 整体是否结束
 *     response: 本次请求返回的数据
 *     responseList: 已经完成请求的队列数据
 * @逻辑
 *   1、先用 pageSize=1 来探测一共有多少条数据
 *   2、如果总数小于 maxPageSize，则请求一次即可获取全部数据
 *   3、如果总数大于 maxPageSize，则依次进行分页数据获取，知道全部请求完成
 * */
import request from '../../fetch/request';

const queueRequest = async ({
  url = '', // 接口地址
  params = {}, // 参数
  maxPageSize = 1000,
  // queueParam = [], // 队列参数
  callback = () => {},
}: any) => {
  try {
    const params2 = {
      ...params,
      pageSize: 1,
      currPageNo: 1,
    };

    // 数据探测，主要探测有多少条数据
    const probeRes = await request(url, {
      method: 'GET',
      params: params2,
    });

    // 如果数据小于 maxPageSize，则可以直接获取
    if (probeRes.total <= maxPageSize) {
      const res = await request(url, {
        method: 'GET',
        params: {
          ...params2,
          pageSize: maxPageSize,
        },
      });

      return await callback({
        finally: true,
        response: res,
        responseList: [res],
        total: probeRes.total,
      });
    }

    if (
      probeRes.total >= 10000 &&
      !confirm(
        `需要下载的数据有 ${probeRes.total} 条，可能造成页面长时间卡顿，是否继续？`,
      )
    ) {
      return;
    }

    // 数据量大于 maxPageSize 时
    const totalPage = Math.ceil(probeRes.total / maxPageSize);
    const queue = Array.from({ length: totalPage }, (_, index) => index + 1);
    let responseList: any[] = [];

    for (const currPageNo of queue) {
      const res = await request(url, {
        method: 'GET',
        params: {
          ...params,
          pageSize: maxPageSize,
          currPageNo,
        },
      });

      responseList = [...responseList, res];

      const result = await callback({
        finally: responseList.length >= queue.length,
        response: res,
        responseList,
        total: probeRes.total,
      });

      // 如果 callback 返回的是 stop 字符，则中断后续请求
      if (result === 'stop') {
        break;
      }
    }
  } catch (e) {
    throw Error(e);
  }
};

export default queueRequest;
