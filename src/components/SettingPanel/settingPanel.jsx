import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Button, Space, message } from 'antd';
import FloatBtn from "../../components/FloatBtn/floatBtn";

export default ({settingOpen, setSettingOpen}) => {
  return (
    <Space>
      <ModalForm
        title="新建表单"
        open={settingOpen}
        submitter={{
          searchConfig: {
            submitText: '确认',
            resetText: '取消',
          },
        }}
        onFinish={async (values) => {
          console.log(values);
          message.success('设置成功');
          return true;
        }}
        onOpenChange={setSettingOpen}
      >
        <ProFormText
          width="md"
          name="name"
          label="尚未开发1"
          tooltip="最长为 24 位"
          placeholder="请输入名称"
        />

        <ProFormText
          width="md"
          name="name2"
          label="尚未开发2"
          placeholder="请输入名称"
        />
      </ModalForm>
    </Space>
  );
};