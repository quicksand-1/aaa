/**
 * 可拖拽位移和缩放
 * @逻辑
 *   action：事件类型
 *     0=无、1=位移、2=缩放
 * */

class Resizable {
  constructor(props = {}) {
    this.action = 0; // 事件类型

    // 缩放相关属性
    this.width = props.width || 50;
    this.height = props.height || 50;
    this.minWidth = props.minWidth || 50;
    this.minHeight = props.minHeight || 50;

    // 拖拽相关属性
    this.moveX = 0;
    this.moveY = 0;
    this.nodeWidth = 0; // 元素宽度
    this.nodeHeight = 0; // 元素高度
    this.left = props.left || 0;
    this.top = props.top || 0;
    this.bodyWidth = 0; // 视口宽度
    this.bodyHeight = 0; // 视口高度
    this.adsorb = props.adsorb || 0; // 边界吸附值
    this.adsorbMax = props.adsorbMax || 0; // 边界吸附判断值

    // dom 操作相关
    this.node = props.node; // 主体元素
    this.dragNode = props.dragNode; // 拖拽位移元素
    this.resizeNode = props.resizeNode; // 拖拽缩放元素

    // 回调事件
    this.callback = props.callback; // 鼠标放开后的回调函数

    this.initStyle();
    this.onMouseDown();
  }

  // 初始化样式
  initStyle() {
    if (this.dragNode) {
      this.dragNode.style.cursor = 'move';
    }
    this.node.style.position = 'fixed';
    this.node.style.zIndex = 999;
    this.node.style.top = `${this.top}px`;
    this.node.style.left = `${this.left}px`;
    this.node.style.width = `${this.width}px`;
    this.node.style.height = `${this.height}px`;
  }

  onMouseDown() {
    const _this = this;

    // 拖拽事件
    if (_this.dragNode) {
      _this.dragNode.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        /**
         * getBoundingClientRect: 返回一个 DomRect 对象
         * 包含该元素的 top、right、bottom、left 值，对应的是到屏幕上方和左边的距离，单位 px
         * */
        _this.action = 1;
        _this.bodyWidth = window.innerWidth; // 获取视口宽度
        _this.bodyHeight = window.innerHeight; // 获取视口高度
        _this.nodeWidth = _this.node.offsetWidth;
        _this.nodeHeight = _this.node.offsetHeight;
        const dragDomRect = _this.node.getBoundingClientRect();
        _this.left = e.clientX - dragDomRect.left; // 鼠标按下时和选中元素的坐标偏移:x坐标
        _this.top = e.clientY - dragDomRect.top; // 鼠标按下时和选中元素的坐标偏移:y坐标

        _this.onMouseMove();
        _this.onMouseUp();
      };
    }

    // 缩放事件
    if (_this.resizeNode) {
      _this.resizeNode.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
      };

      _this.resizeNode.onmousedown = function (e) {
        e.preventDefault();
        e.stopPropagation();

        _this.action = 2;
        _this.onMouseMove();
        _this.onMouseUp();
      };
    }
  }
  onMouseMove() {
    const _this = this;
    if (!_this.action) return;

    document.onmousemove = (e) => {
      if (_this.action === 1) {
        let moveX = e.clientX - _this.left,
          moveY = e.clientY - _this.top;
        /**
         *  防止元素移动超出左边和上边
         * */
        moveX < 0 ? (moveX = 0) : null;
        moveY < 0 ? (moveY = 0) : null;

        /**
         * 防止元素移动超出右边和下边
         * */
        moveX + _this.nodeWidth > _this.bodyWidth
          ? (moveX = _this.bodyWidth - _this.nodeWidth)
          : null;
        moveY + _this.nodeHeight > _this.bodyHeight
          ? (moveY = _this.bodyHeight - _this.nodeHeight)
          : null;

        _this.moveX = moveX;
        _this.moveY = moveY;

        _this.node.style.left = `${moveX}px`;
        _this.node.style.top = `${moveY}px`;
      }

      if (_this.action === 2) {
        const { clientX, clientY } = e;
        const { offsetLeft, offsetTop } = _this.node;

        const width = Math.min(
          Math.max(clientX - offsetLeft, _this.minWidth),
          window.innerWidth,
        );
        const height = Math.min(
          Math.max(clientY - offsetTop, _this.minHeight),
          window.innerHeight,
        );

        _this.node.style.width = `${width - 2}px`;
        _this.node.style.height = `${height - 2}px`;
      }
    };
  }
  onMouseUp() {
    const _this = this;
    if (!_this.action) return;

    document.onmouseup = () => {
      if (_this.action === 1) {
        const {
          moveX,
          moveY,
          bodyWidth,
          bodyHeight,
          nodeWidth,
          nodeHeight,
          adsorb,
          adsorbMax,
        } = _this;
        /**
         * left
         *   1、当 moveX 小于等于边界吸附判断值时，值设置为 边界吸附值
         *   2、当 视口宽度 - 元素宽度 - 目标移动的X值 小于等于边界吸附判断值时，值设置为 视口宽度 - 元素宽度 - 边界吸附值
         *
         * top
         *   1、当 moveY 小于等于边界吸附判断值时，值设置为 边界吸附值
         *   2、当 视口高度 - 元素高度 - 目标移动的Y值 小于等于边界吸附判断值时，值设置为 视口高度 - 元素高度 - 边界吸附值
         * */
        const left =
          moveX <= adsorbMax
            ? adsorb
            : bodyWidth - nodeWidth - moveX <= adsorbMax
            ? bodyWidth - nodeWidth - adsorb
            : moveX;
        const top =
          moveY <= adsorbMax
            ? adsorb
            : bodyHeight - nodeHeight - moveY <= adsorbMax
            ? bodyHeight - nodeHeight - adsorb
            : moveY;
        _this.node.style.left = `${left}px`;
        _this.node.style.top = `${top}px`;
        // 执行回调函数
        _this.callback?.({ top, left });
      }

      if (_this.action === 2) {
        const { width, height } = _this.node.getBoundingClientRect();
        _this.callback?.({ width, height });
      }

      _this.action = 0; // 停止移动状态
      document.onmousemove = null; // 停止鼠标移动事件
    };
  }
}

export default Resizable;
