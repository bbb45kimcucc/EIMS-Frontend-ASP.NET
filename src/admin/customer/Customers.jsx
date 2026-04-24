import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Input, Space, Tag, message, Modal, Form, Select, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, UserOutlined, WalletOutlined, ClockCircleOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Customers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

  // State Modal Thêm/Sửa
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // State Yêu cầu xóa
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // ==========================================
  // STATE MỚI: LỊCH SỬ MUA HÀNG & IN HÓA ĐƠN
  // ==========================================
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [customerTickets, setCustomerTickets] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState(null);
  // ==========================================

  axios.defaults.withCredentials = true;

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const url = searchQuery 
        ? `https://localhost:7033/api/Customers/search?query=${searchQuery}`
        : 'https://localhost:7033/api/Customers';
      const response = await axios.get(url, { withCredentials: true });
      
      const realData = response.data.map(item => ({ 
        ...item, 
        key: item.Id || item.id,
        id: item.Id || item.id,
        name: item.Name || item.name,
        phone: item.Phone || item.phone,
        paymentMethod: item.PaymentMethod || item.paymentMethod || 'Tiền mặt'
      }));
      setData(realData);

      try {
        const reqResponse = await axios.get('https://localhost:7033/api/ActionRequests', { withCredentials: true });
        const pendingIds = reqResponse.data
          .filter(req => (req.Status === 'Pending' || req.status === 'Pending') 
                      && (req.ActionType === 'Delete_Customer' || req.actionType === 'Delete_Customer'))
          .map(req => req.TargetId || req.targetId);
        setPendingDeleteIds(pendingIds);
      } catch (err) {}

    } catch (error) {
      message.error("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  // HÀM MỚI: MỞ LỊCH SỬ MUA HÀNG CỦA KHÁCH
  const showHistory = async (record) => {
    setCurrentCustomer(record);
    try {
      // Tải toàn bộ phiếu (Backend Cúc đã viết Include chi tiết rồi)
      const res = await axios.get('https://localhost:7033/api/InventoryTickets', { withCredentials: true });
      
      // Lọc ra: Chỉ lấy Phiếu Xuất (Bán hàng) VÀ của đúng ông Khách hàng này
      const history = res.data.filter(t => 
        (t.CustomerId === record.id || t.customerId === record.id) && 
        (t.Type?.toLowerCase() === 'xuất' || t.type?.toLowerCase() === 'xuất')
      );
      
      setCustomerTickets(history);
      setIsHistoryModalVisible(true);
    } catch (error) {
      message.error("Lỗi tải lịch sử mua hàng!");
    }
  };

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ paymentMethod: 'Tiền mặt' });
    }
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingId) {
        await axios.put(`https://localhost:7033/api/Customers/${editingId}`, { id: editingId, ...values });
        message.success("Cập nhật thành công!");
      } else {
        await axios.post('https://localhost:7033/api/Customers', values);
        message.success("Thêm khách hàng thành công!");
      }
      setIsModalVisible(false);
      fetchCustomers(); 
    } catch (error) {
      message.error("Lỗi lưu dữ liệu!");
    }
  };

  const showDeleteModal = (record) => {
    setItemToDelete(record);
    setDeleteReason(''); 
    setIsDeleteModalVisible(true);
  };

  const submitDeleteRequest = async () => {
    if (!deleteReason.trim()) return message.warning("Phải nhập lý do!");
    try {
      const payload = {
        actionType: 'Delete_Customer',
        targetId: itemToDelete.id, 
        content: itemToDelete.name, 
        reason: deleteReason 
      };
      await axios.post('https://localhost:7033/api/ActionRequests/request-delete', payload, { withCredentials: true });
      message.success("Đã gửi đơn xin xóa cho Admin phê duyệt!");
      setIsDeleteModalVisible(false);
      fetchCustomers(); 
    } catch (error) {
      message.error("Lỗi khi gửi yêu cầu!");
    }
  };

  const columns = [
    { 
      title: 'Tên Khách Hàng', 
      dataIndex: 'name', 
      render: (text, record) => {
        const isPending = pendingDeleteIds.includes(record.id);
        return (
          <Space>
            <UserOutlined style={{ color: isPending ? '#d9d9d9' : '#8c8c8c' }}/>
            <strong style={{ color: isPending ? '#d9d9d9' : 'inherit', textDecoration: isPending ? 'line-through' : 'none' }}>
              {text}
            </strong>
            {isPending && <Tag color="warning" icon={<ClockCircleOutlined />}>Đang chờ duyệt xóa</Tag>}
          </Space>
        )
      }
    },
    { 
      title: 'Số điện thoại', 
      dataIndex: 'phone', 
      render: (text, record) => {
        const isPending = pendingDeleteIds.includes(record.id);
        return text ? <Text disabled={isPending}><PhoneOutlined style={{ color: isPending ? '#d9d9d9' : '#5570F1', marginRight: 5}} />{text}</Text> : '-';
      }
    },
    { 
      title: 'Thanh toán', 
      dataIndex: 'paymentMethod',
      render: (method, record) => {
        const isPending = pendingDeleteIds.includes(record.id);
        if(isPending) return <Tag color="default" disabled>VÔ HIỆU HÓA</Tag>;
        return <Tag color={method === 'ACB' ? 'blue' : 'green'} icon={<WalletOutlined />}>{method?.toUpperCase()}</Tag>
      }
    },
    {
      title: 'Hành động',
      align: 'right',
      render: (_, record) => {
        const isPending = pendingDeleteIds.includes(record.id);
        if (isPending) {
          return (
            <Tooltip title="Mục này đang bị khóa chờ Admin xử lý">
              <Space>
                <Button type="text" disabled icon={<EyeOutlined />} />
                <Button type="text" disabled icon={<EditOutlined />} />
                <Button type="text" disabled icon={<DeleteOutlined />} />
              </Space>
            </Tooltip>
          );
        }

        return (
          <Space>
            {/* THÊM NÚT XEM LỊCH SỬ MUA HÀNG */}
            <Tooltip title="Xem lịch sử mua hàng">
              <Button type="text" icon={<EyeOutlined />} style={{ color: '#52c41a' }} onClick={() => showHistory(record)} />
            </Tooltip>
            <Button type="text" icon={<EditOutlined />} style={{ color: '#5570F1' }} onClick={() => showModal(record)} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)} />
          </Space>
        )
      },
    },
  ];

  // Bảng hiển thị trong Modal Lịch sử
  const historyColumns = [
    { title: 'Mã Phiếu', dataIndex: 'ticketCode', render: text => <strong>{text}</strong> },
    { title: 'Ngày Mua', dataIndex: 'createdAt', render: date => moment(date).format('DD/MM/YYYY HH:mm') },
    { title: 'Tổng Tiền', dataIndex: 'totalAmount', render: amt => <Text type="success">{(amt || 0).toLocaleString()} đ</Text> },
    {
      title: 'In Hóa Đơn',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="primary" 
          ghost 
          icon={<PrinterOutlined />} 
          size="small"
          onClick={() => {
            // Khi bấm in, truyền dữ liệu phiếu này sang Modal In
            setTicketToPrint(record);
            setIsPrintModalVisible(true);
          }}
        >
          In Lại
        </Button>
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Customers</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={4} style={{ margin: 0 }}>Quản Lý Khách Hàng</Title>
          <Space>
            <Input.Search placeholder="Tên hoặc SĐT..." onSearch={(val) => fetchCustomers(val)} style={{ width: 220 }} />
            <Button type="primary" icon={<PlusOutlined />} style={{ background: '#5570F1' }} onClick={() => showModal()}>
              Thêm Khách
            </Button>
          </Space>
        </div>
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={{ pageSize: 8 }} 
          loading={loading} 
          rowClassName={(record) => pendingDeleteIds.includes(record.id) ? 'pending-delete-row' : ''}
        />
      </Card>

      {/* Modal Thêm/Sửa */}
      <Modal title={editingId ? "Sửa Khách Hàng" : "Thêm Khách Hàng"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên Khách Hàng" rules={[{ required: true, message: 'Phải nhập tên!' }]}>
            <Input placeholder="Tên khách hàng..." />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Phải nhập SĐT!' }]}>
            <Input placeholder="090..." />
          </Form.Item>
          <Form.Item name="paymentMethod" label="Phương thức thanh toán">
            <Select>
              <Option value="Tiền mặt">Tiền mặt</Option>
              <Option value="ACB">Chuyển khoản ACB</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Xin Xóa */}
      <Modal title="Yêu cầu xóa dữ liệu" open={isDeleteModalVisible} onOk={submitDeleteRequest} onCancel={() => setIsDeleteModalVisible(false)} okText="Gửi yêu cầu" cancelText="Hủy" okButtonProps={{ danger: true }}>
        <Text>Bạn đang yêu cầu xóa Khách hàng: <strong>{itemToDelete?.name}</strong></Text>
        <br /><br />
        <Form layout="vertical">
          <Form.Item label="Lý do xóa (Bắt buộc)" required>
            <Input.TextArea rows={3} placeholder="Ví dụ: Khách yêu cầu..." value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ================= MODAL LỊCH SỬ MUA HÀNG ================= */}
      <Modal
        title={`Lịch Sử Mua Hàng - ${currentCustomer?.name}`}
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={[<Button key="close" onClick={() => setIsHistoryModalVisible(false)}>Đóng</Button>]}
        width={700}
      >
        <Table 
          columns={historyColumns} 
          dataSource={customerTickets} 
          pagination={{ pageSize: 5 }} 
          locale={{ emptyText: 'Khách hàng này chưa mua món nào.' }}
        />
      </Modal>

      {/* ================= MODAL IN HÓA ĐƠN ================= */}
      <Modal
        title="In Hóa Đơn Khách Hàng"
        open={isPrintModalVisible}
        onCancel={() => setIsPrintModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPrintModalVisible(false)}>Đóng</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            In / Xuất PDF
          </Button>
        ]}
        width={750}
      >
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              #printable-invoice, #printable-invoice * { visibility: visible; }
              #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
              .ant-modal-footer, .ant-modal-close, .ant-modal-header { display: none !important; }
            }
          `}
        </style>

        {ticketToPrint && (
          <div id="printable-invoice" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#000' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
              <h1 style={{ margin: 0, fontSize: '24px' }}>CÔNG TY LINH KIỆN ĐIỆN TỬ WMS</h1>
              <p style={{ margin: '5px 0' }}>Địa chỉ: 123 Đường Điện Tử, Q.1, TP. HCM | SĐT: 0123.456.789</p>
              <h2 style={{ margin: '15px 0 5px 0' }}>HÓA ĐƠN BÁN HÀNG</h2>
              <p style={{ margin: 0 }}>Mã phiếu: <strong>{ticketToPrint.ticketCode || ticketToPrint.TicketCode}</strong></p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '5px 0' }}><strong>Khách hàng:</strong> {currentCustomer?.name}</p>
                <p style={{ margin: '5px 0' }}><strong>Số điện thoại:</strong> {currentCustomer?.phone || '---'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '5px 0' }}><strong>Ngày lập:</strong> {moment(ticketToPrint.createdAt || ticketToPrint.CreatedAt).format('DD/MM/YYYY')}</p>
                <p style={{ margin: '5px 0' }}><strong>Người bán:</strong> {ticketToPrint.User?.FullName || ticketToPrint.user?.fullName || 'Nhân viên WMS'}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>STT</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Tên Linh Kiện</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>SL</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Đơn Giá</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {(ticketToPrint.TicketDetails || ticketToPrint.ticketDetails || []).map((detail, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>
                      {detail.Product?.Name || detail.product?.name || `Sản phẩm #${detail.ProductId || detail.productId}`}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{detail.Quantity || detail.quantity}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(detail.UnitPrice || detail.unitPrice || 0).toLocaleString()} đ</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                      {((detail.Quantity || detail.quantity || 0) * (detail.UnitPrice || detail.unitPrice || 0)).toLocaleString()} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '16px' }}>
              <p style={{ margin: '5px 0' }}><strong>Tổng số lượng:</strong> {ticketToPrint.TotalQuantity || ticketToPrint.totalQuantity}</p>
              <p style={{ margin: '5px 0', fontSize: '18px' }}>
                <strong>Tổng thanh toán: <span style={{ color: 'red' }}>{(ticketToPrint.TotalAmount || ticketToPrint.totalAmount || 0).toLocaleString()} VNĐ</span></strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px', paddingBottom: '30px' }}>
              <div style={{ textAlign: 'center' }}>
                <strong>Khách hàng</strong>
                <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '5px' }}>(Ký, họ tên)</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <strong>Người bán hàng</strong>
                <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '5px' }}>(Ký, họ tên)</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}