import React from 'react';
import { Modal, Form, Input, Space, Table, Typography, Button } from 'antd';
import moment from 'moment';

const { Text } = Typography;

export default function SupplierModals({
  // Props cho Thêm/Sửa
  isFormVisible, onFormCancel, onFormSubmit, form, editingId,
  // Props cho Lịch sử
  isHistoryVisible, onHistoryCancel, supplierTickets, currentSupplier
}) {
  
  // Cột cho bảng Lịch sử Nhập hàng
  const historyColumns = [
    { title: 'Mã Phiếu', dataIndex: 'ticketCode', render: text => <strong>{text}</strong> },
    { title: 'Ngày Lập', dataIndex: 'createdAt', render: date => moment(date).format('DD/MM/YYYY HH:mm') },
    { title: 'Tổng SL', dataIndex: 'totalQuantity', align: 'center' },
    { title: 'Tổng Tiền', dataIndex: 'totalAmount', render: amt => <Text type="danger">{(amt || 0).toLocaleString()} đ</Text> }
  ];

  return (
    <>
      {/* FORM THÊM/SỬA NHÀ CUNG CẤP */}
      <Modal
        title={editingId ? "Sửa Thông Tin Đối Tác" : "Thêm Nhà Cung Cấp Mới"}
        open={isFormVisible}
        onCancel={onFormCancel}
        onOk={() => form.submit()}
        okText="Lưu" cancelText="Hủy"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
          <Form.Item name="name" label="Tên Nhà Cung Cấp / Công ty" rules={[{ required: true, message: 'Bắt buộc nhập tên!' }]}>
            <Input placeholder="VD: Công ty TNHH Điện tử ABC" />
          </Form.Item>

          <Space size="large" style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="phone" label="Số điện thoại" style={{ flex: 1 }}>
              <Input placeholder="VD: 0901234567" />
            </Form.Item>
            <Form.Item name="email" label="Email liên hệ" rules={[{ type: 'email', message: 'Email không đúng định dạng!' }]} style={{ flex: 1 }}>
              <Input placeholder="VD: contact@abc.com" />
            </Form.Item>
          </Space>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} placeholder="Số nhà, Đường, Quận, Thành phố..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL LỊCH SỬ GIAO DỊCH */}
      <Modal
        title={`Lịch Sử Nhập Hàng - ${currentSupplier?.name}`}
        open={isHistoryVisible}
        onCancel={onHistoryCancel}
        footer={[<Button key="close" onClick={onHistoryCancel}>Đóng</Button>]}
        width={700}
      >
        <Table 
          columns={historyColumns} 
          dataSource={supplierTickets} 
          pagination={{ pageSize: 5 }} 
          locale={{ emptyText: 'Chưa có dữ liệu nhập hàng từ nhà cung cấp này.' }}
        />
      </Modal>
    </>
  );
}