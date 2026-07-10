import React, { useEffect } from 'react';
import { Modal, Form, Space, Input, Select } from 'antd';

const { Option } = Select;

export default function UserModal({
  isModalVisible,
  setIsModalVisible,
  editingId,
  initialData,
  onSave,
  dataList
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isModalVisible) {
      if (initialData) {
        form.setFieldsValue(initialData);
      } else {
        form.resetFields();
        form.setFieldsValue({
          role: 'Sales',
          department: 'Kinh doanh',
          isActive: true
        });
      }
    }
  }, [isModalVisible, initialData, form]);

  const handleOk = () => {
    form.submit();
  };

  const onFinish = (values) => {
    onSave(values, editingId);
  };

  return (
    <Modal
      title={editingId ? 'Cập Nhật Nhân Viên' : 'Tạo Tài Khoản Mới'}
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Space
          size="large"
          style={{ display: 'flex', width: '100%' }}
        >
          <Form.Item
            name="username"
            label="Tài khoản đăng nhập"
            rules={[
              {
                required: true,
                message: 'Nhập tài khoản!'
              }
            ]}
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="passwordHash"
            label="Mật khẩu"
            rules={[
              {
                required: !editingId,
                message: 'Nhập mật khẩu!'
              }
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu"
              autoComplete="new-password"
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[
            {
              required: true,
              message: 'Nhập họ tên!'
            }
          ]}
        >
          <Input />
        </Form.Item>

        <Space
          size="large"
          style={{ display: 'flex', width: '100%' }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: 'email',
                message: 'Email không hợp lệ!'
              }
            ]}
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
        </Space>

        <Space
          size="large"
          style={{ display: 'flex', width: '100%' }}
        >
          <Form.Item
            name="department"
            label="Phòng ban"
            style={{ flex: 1 }}
          >
            <Select>
              <Option value="Kinh doanh">
                Kinh doanh
              </Option>

              <Option value="Kho">
                Kho
              </Option>

              <Option value="Nhân sự">
                Nhân sự
              </Option>

              <Option value="Kế toán">
                Kế toán
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Chức vụ"
            style={{ flex: 1 }}
          >
            <Select
              disabled={
                editingId &&
                dataList.find(
                  u => u.id === editingId
                )?.role === 'Admin'
              }
            >
              <Option value="Admin">
                Quản trị viên
              </Option>

              <Option value="Sales">
                Nhân viên bán hàng
              </Option>

              <Option value="Warehouse">
                Nhân viên kho
              </Option>

              <Option value="HR">
                Nhân viên nhân sự
              </Option>
            </Select>
          </Form.Item>
        </Space>

        <Form.Item
          name="isActive"
          label="Trạng thái"
        >
          <Select>
            <Option value={true}>
              Hoạt động
            </Option>

            <Option value={false}>
              Tạm khóa
            </Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}