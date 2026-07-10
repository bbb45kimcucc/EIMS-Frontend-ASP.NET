import React from 'react';
import { Modal, Form, Input } from 'antd';

export default function BrandModal({ visible, onCancel, onSave, form, editingId }) {
  return (
    <Modal 
      title={editingId ? "Edit Brand" : "Add New Brand"} 
      open={visible} 
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Save" 
      cancelText="Cancel"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item 
          name="name" 
          label="Tên thương hiệu" 
          rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu!' }]}
        >
          <Input placeholder="VD: Samsung, Apple, LG..." />
        </Form.Item>
        
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={4} placeholder="Nhập mô tả ngắn về thương hiệu..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}