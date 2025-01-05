import React from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
const App = ({onClk}) => (
  <>
    <FloatButton
      icon={<SettingOutlined />}
      type="default"
      style={{
        insetInlineStart: 36,
      }}
      onClick={onClk}
    />
  </>
);
export default App;