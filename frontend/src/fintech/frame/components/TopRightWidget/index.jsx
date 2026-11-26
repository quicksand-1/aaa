/**
 * 框架右上角的集成组件
 * */

import ActionsContainer from 'fintech/ActionsContainer';
import AppDropdown from './AppDropdown';
import Module from './Module';
import PlatformDropdown from './PlatformDropdown';
import RoutesSearch from './RoutesSearch';

export { Module };

export default (props) => {
  return (
    <ActionsContainer
      defaultActions={{
        platform: <PlatformDropdown />,
        app: <AppDropdown />,
        routesSearch: <RoutesSearch />,
      }}
      actions={['routesSearch', 'platform', 'app']}
      {...props}
    />
  );
};
