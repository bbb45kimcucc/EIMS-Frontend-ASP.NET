import React from 'react';
import { Modal, Form, Input, Select, Typography } from 'antd';

const { Option } = Select;
const { Text } = Typography;

export default function CustomerModals({
  // Props cho Thêm/Sửa
  isFormVisible, onFormCancel, onFormSubmit, form, editingId,
  // Props cho Xóa
  isDeleteVisible, onDeleteCancel, onDeleteSubmit, itemToDelete, deleteReason, setDeleteReason
}) {
  return (
    <>
      {/* Modal Thêm/Sửa */}
      <Modal 
        title={editingId ? "Sửa Khách Hàng" : "Thêm Khách Hàng"} 
        open={isFormVisible} 
        onCancel={onFormCancel} 
        onOk={form.submit} 
        okText="Lưu" 
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
          <Form.Item name="name" label="Tên Khách Hàng" rules={[{ required: true, message: 'Phải nhập tên!' }]}>
            <Input placeholder="Tên khách hàng..." />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Phải nhập SĐT!' }]}>
            <Input placeholder="090..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Xin Xóa */}
      <Modal 
        title="Yêu cầu xóa dữ liệu" 
        open={isDeleteVisible} 
        onOk={onDeleteSubmit} 
        onCancel={onDeleteCancel} 
        okText="Gửi yêu cầu" 
        cancelText="Hủy" 
        okButtonProps={{ danger: true }}
      >
        <Text>Bạn đang yêu cầu xóa Khách hàng: <strong>{itemToDelete?.name}</strong></Text>
        <br /><br />
        <Form layout="vertical">
          <Form.Item label="Lý do xóa (Bắt buộc)" required>
            <Input.TextArea 
              rows={3} 
              placeholder="Ví dụ: Khách yêu cầu..." 
              value={deleteReason} 
              onChange={(e) => setDeleteReason(e.target.value)} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}