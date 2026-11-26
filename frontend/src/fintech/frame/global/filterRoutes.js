import command2param from './command2param';
import platformStorage from './platformStorage';

const filterRoutes = {
  /**
   * 递归遍历路由数据，对路由数据进行过滤
   * @params
   *   routers：路由数据
   *   platformKey：平台标识
   * */
  loopRoutes(routers = [], platformKey = '') {
    const list = [];
    routers.forEach((item) => {
      if (!item.platform || item.platform.includes(platformKey)) {
        // 构建时菜单数据的子项字段为 routes，渲染时为 children
        const childField = item.children ? 'children' : 'routes';
        const childRoutes = this.loopRoutes(item[childField], platformKey);

        list.push({
          ...item,
          [childField]: childRoutes.length > 0 ? childRoutes : undefined,
        });
      }
    });
    return list;
  },
  /**
   * 构建时通过命令行获取平台信息，并对菜单数据进行过滤
   * 1、在构建时如果命令行中存在 plf=xxx 的指定平台，则会对原始菜单进行数据过滤，去除其他平台的菜单内容
   * 2、在构建时如果命令中没有 plf 参数，则会输出全部菜单数据，并由前端自己控制
   * 3、match = false 时，打包全量代码
   * */
  runtimeBuild(routers, match = true) {
    const { platformKey } = command2param(process.argv);

    if (platformKey && match) {
      return this.loopRoutes(routers, platformKey);
    }

    return routers;
  },
  /**
   * 菜单数据过滤，通过 platformStorage 数据获取平台标识，对菜单数据进行过滤
   * */
  menuDataRender({ menuData = [], access = [] }) {
    const config = platformStorage.get();
    // 过滤后得到当前平台的菜单数据
    const routes = this.loopRoutes(menuData, config.key);
    const newList = [];

    // 对当前菜单数据进行遍历
    routes.forEach((item) => {
      /**
       * 权限码格式有以下两种：
       * access: system（该菜单对所有平台都进行权限验证）
       * access: system/gt|tj（该菜单只对 gt、tf 进行权限验证，其他平台不验证）
       * */
      if (item.access) {
        const [currentAccess, currentPlatform] = item.access.split('/');

        // 如果权限码中存在平台信息
        if (currentPlatform) {
          // 如果当前平台不包含在 access 中，且权限码校验不通过，则不显示该菜单
          if (
            currentPlatform.includes(config.key) &&
            access.includes(currentAccess) === false
          ) {
            return;
          }
        } else if (currentAccess && access.includes(currentAccess) === false) {
          // 如果该菜单有权限码设置，且权限校验不通过，则不显示该菜单
          return;
        }
      }

      /**
       * app 菜单校验
       * */
      if (config.app?.key && item.app && !item.app.includes(config.app?.key)) {
        return;
      }

      /**
       * 判断当前 item 是否有 children
       * 1、如果没有，则直接返回 item
       * 2、如果有，则看子菜单过滤后是否还有，如果还有，则渲染该节点
       * */
      if (item.children?.length > 0) {
        // 获取子菜单内容
        const childrenList = this.menuDataRender({
          menuData: item.children || [],
          access,
        });

        if (childrenList.length > 0) {
          newList.push({
            ...item,
            children: childrenList.length > 0 ? childrenList : undefined,
          });
        }
      } else {
        newList.push(item);
      }
    });

    // 是否展示页面搜索功能
    if (config.routesSearch) {
      window.routes = newList;
    }

    return newList;
  },
};

export default filterRoutes;
