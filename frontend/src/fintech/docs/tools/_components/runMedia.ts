const run = async ({ filename = 'video' }) => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const mime = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
      ? 'video/webm; codecs=vp9'
      : 'video/webm';
    const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });

    // 录制数据
    const chunks: any = [];
    mediaRecorder.addEventListener('dataavailable', function (e) {
      chunks.push(e.data);
    });

    //停止
    mediaRecorder.addEventListener('stop', function () {
      let blob = new Blob(chunks, { type: chunks[0].type });
      let url = URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.webm`;
      a.click();
      a.remove();
    });
    //手动启动
    mediaRecorder.start();
  } catch (e) {
    console.error(e);
  }
};

export default run;
