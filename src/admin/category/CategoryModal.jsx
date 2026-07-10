import React from 'react';
import { Modal, Form, Input } from 'antd';

export default function CategoryModal({ visible, onCancel, onSave, form, editingId }) {
  return (
    <Modal 
      title={editingId ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"} 
      open={visible} 
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu" 
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
          <Input placeholder="VD: Vi mạch IC" />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} placeholder="Mô tả chi tiết..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}