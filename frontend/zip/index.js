const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const packageJson = require('../package.json');

// 读取 config 中的标识
const buildTime = new Date().toISOString().slice(0, 10).replaceAll('-', '');
let filename = `${packageJson.name}_${packageJson.version}_${buildTime}.zip`;

// 平台标识
let platformKey;
// 获取命令行参数
const command = process.argv;

// 循环命令行参数
command.forEach((i) => {
  // 判断当前命令行中是否有平台可执行的参数，用例：plf=tj
  if (i.includes('plf')) {
    platformKey = i.split('=')[1];
  }
});

// 清理其他平台的静态资源
if (platformKey) {
  const platformsDir = path.join(__dirname, '..', 'dist', 'platforms');
  if (fs.existsSync(platformsDir)) {
    // 读取 platforms 目录下的所有平台
    const platformDirs = fs.readdirSync(platformsDir);
    // 删除非当前平台的目录
    platformDirs.forEach((dir) => {
      if (dir !== platformKey) {
        const dirPath = path.join(platformsDir, dir);
        if (fs.lstatSync(dirPath).isDirectory()) {
          console.log(`删除非当前平台的静态资源：${dir}`);
          // 递归删除目录
          function deleteDir(dirPath) {
            const files = fs.readdirSync(dirPath);
            files.forEach((file) => {
              const filePath = path.join(dirPath, file);
              if (fs.lstatSync(filePath).isDirectory()) {
                deleteDir(filePath);
              } else {
                fs.unlinkSync(filePath);
              }
            });
            fs.rmdirSync(dirPath);
          }
          deleteDir(dirPath);
        }
      }
    });
  }
}

// 重新赋值文件名
filename = platformKey ? filename.replace('_', `_${platformKey}_`) : filename;

const output = fs.createWriteStream(
  path.join(__dirname, '..', 'zip', filename)
);
const archive = archiver('zip');

// 将输出流管道到 archiver
archive.pipe(output);

// 添加 dist 文件夹到压缩文件
archive.directory('dist', false);

// 完成压缩
archive.finalize();
