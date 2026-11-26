/**
 * 文件的读写和下载
 * */
import request from '../fetch/request';
import _deepGet from './_deepGet';

const fileController = {
  read(file: File, type = 'readAsText') {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = function (e) {
          const result = e.target?.result;
          resolve(result);
        };
        reader[type](file);
      } catch (e) {
        console.error('Error:', e);
      }
    });
  },
  write({ text = '', blobType = 'application/json', blob }: any) {
    // 创建 Blob 对象
    const createBlob = blob || new Blob([text], { type: blobType });
    return URL.createObjectURL(createBlob);
  },
  download({ url, filename }: any) {
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename; // 下载文件的名称
    // 将链接添加到文档中
    document.body.appendChild(downloadLink);
    // 模拟点击链接，触发下载
    downloadLink.click();
    // 移除链接
    document.body.removeChild(downloadLink);
  },
  /**
   * 导出 Excel 文件
   * 1、在 columns 中，title 的使用 column.excelTitle > column.title
   * todo: 可以使用 Web Worker 开启后台线程来处理这些任务，防止页面卡顿
   * */
  exportToExcel({ data = [], columns = [], filename, filetype = 'xlsx' }: any) {
    try {
      const workbook = XLSX.utils.book_new(); // 创建工作表
      const header: string[] = [];
      const worksheetData: Record<any, any>[] = [];

      data.forEach((d: any, index: number) => {
        const columnData = columns.reduce((p: object, col: any) => {
          const title = col.excelTitle || col.title;
          if (index === 0) {
            header.push(title);
          }

          let value: any = _deepGet(d, col.dataIndex);

          if (col.renderText) {
            value = col.renderText(_deepGet(d, col.dataIndex), d);
          }

          return {
            ...p,
            [title]: value,
          };
        }, {});
        worksheetData.push(columnData);
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header });
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); // 在工作表的 Sheet1 中插入数据和表头
      XLSX.writeFile(workbook, `${filename}.${filetype}`); // 下载
    } catch (e) {
      console.error(e);
    }
  },

  // 从远程获取文件流，并下载
  downloadBlob({ url = '', filename = '', callback, ...rest }: any) {
    let headersFileName = '';

    callback?.('start');
    request(url, {
      method: 'GET',
      responseType: 'blob',
      responseInterceptors: [
        // 从 headers 中获取文件名
        (response: any) => {
          const { headers } = response;
          headersFileName = decodeURIComponent(
            headers['content-disposition']?.split('fileName=').pop(),
          );
          return response;
        },
      ],
      ...rest,
    })
      .then(async (blob: Blob) => {
        try {
          const text = await blob.text();
          const json = JSON.parse(text);
          window.alert(json.errorMessage);
        } catch (e) {
          this.download({
            url: this.write({ blob }),
            filename: filename || headersFileName,
          });
        }
      })
      .finally(() => {
        callback?.('end');
      });
  },
  /**
   * 上传文件流
   * @params
   *   fileList: 文件列表
   *   name: 文件字段名
   *   url: 接口地址
   *   data: 其他参数
   * */
  upload(params: any = {}) {
    const {
      fileList = [],
      name = 'file',
      url = '',
      data = {},
      onSuccess = () => {},
      ...rest
    } = params;

    const formData = new FormData();
    fileList.forEach((file: any) => {
      /**
       * 版本兼容，有时候 File 在 fileList 中就能获取，有时候需要在 { originFileObj } 中获取
       * FAQ: https://ant-design.antgroup.com/components/upload-cn#onchange-%E4%B8%BA%E4%BB%80%E4%B9%88%E6%9C%89%E6%97%B6%E5%80%99%E8%BF%94%E5%9B%9E-file-%E6%9C%89%E6%97%B6%E5%80%99%E8%BF%94%E5%9B%9E--originfileobj-file-
       * */
      formData.append(name, file.originFileObj || file);
    });
    Object.keys(data).forEach((key) => {
      // 这里需要判断一下，避免上传空字符串
      if (data[key]) {
        // data[key] 是对象时，需要转换为字符串并设置 Content-Type 为 application/json
        if (typeof data[key] === 'object') {
          const blob = new Blob([JSON.stringify(data[key])], {
            type: 'application/json',
          });
          formData.append(key, blob);
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    request(url, {
      method: 'POST',
      ...rest,
      data: formData,
    }).then((res: any) => {
      onSuccess(res);
    });
  },
  /**
   * 通过图片文件，返回 imageData 数据
   * */
  imageData(file: File) {
    return new Promise((resolve) => {
      try {
        this.read(file, 'readAsDataURL').then((result) => {
          const img: any = new Image();
          img.src = result;

          img.onload = function () {
            const canvas = document.createElement('canvas');
            const context: any = canvas.getContext('2d');

            // 设置 Canvas 元素的大小与图片大小相同
            canvas.width = img.width;
            canvas.height = img.height;

            // 在 Canvas 上绘制图片
            context.drawImage(img, 0, 0);

            // 获取图像的 ImageData
            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );

            // 现在，imageData 包含了图像的像素数据
            resolve(imageData);
          };
        });
      } catch (e) {
        console.error('Error:', e);
      }
    });
  },
};

export default fileController;
