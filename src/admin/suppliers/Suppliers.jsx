import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Input, Space, message, Modal, Form, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

export default function Suppliers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // 1. LẤY DỮ LIỆU & TÌM KIẾM
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/Suppliers'); // Thay link API của bạn vào

      // Bắt mạch chữ hoa chữ thường ở đây nè:
      const realData = response.data.map(item => ({
        ...item,
        key: item.id || item.Id,
        name: item.name || item.Name,
        phone: item.phone || item.Phone,
        email: item.email || item.Email,
        address: item.address || item.Address
      }));

      setData(realData);
    } catch (error) {
      message.error("Lỗi tải dữ liệu");
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => { fetchSuppliers(); }, []);

  // 2. MỞ BẢNG THÊM / SỬA
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id || record.Id); // Lấy Id từ record cho đúng
      form.setFieldsValue(record); // Đổ dữ liệu cũ vô
    } else {
      setEditingId(null);
      form.resetFields(); // Làm trống Form
    }
    setIsModalVisible(true);
  };

  // 3. LƯU (POST / PUT)
  const handleSave = async (values) => {
    try {
      if (editingId) {
        await axios.put(`/api/Suppliers/${editingId}`, { id: editingId, ...values });
        message.success("Cập nhật thông tin Nhà cung cấp thành công!");
      } else {
        await axios.post('/api/Suppliers', values);
        message.success("Thêm Nhà cung cấp mới thành công!");
      }
      setIsModalVisible(false);
      fetchSuppliers(); // Load lại bảng
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu!");
    }
  };

  // 4. XÓA AN TOÀN
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/Suppliers/${id}`);
      message.success("Đã xóa Nhà cung cấp!");
      fetchSuppliers();
    } catch (error) {
      // Hứng cái lỗi "Cấm xóa vì đã từng nhập hàng" từ C# ném qua
      const errorMsg = error.response?.data?.message || "Lỗi không thể xóa!";
      message.error(errorMsg);
    }
  };

  const columns = [
    { title: 'Tên Nhà Cung Cấp', dataIndex: 'name', width: '25%', render: text => <strong>{text}</strong> },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      width: '15%',
      render: text => text ? <><PhoneOutlined style={{ color: '#5570F1', marginRight: 5 }} />{text}</> : '-'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '20%',
      render: text => text ? <><MailOutlined style={{ color: '#5570F1', marginRight: 5 }} />{text}</> : '-'
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      width: '25%',
      render: text => text ? <><HomeOutlined style={{ color: '#8c8c8c', marginRight: 5 }} />{text}</> : '-'
    },
    {
      title: 'Hành động',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} style={{ color: '#5570F1' }} onClick={() => showModal(record)} />
          {/* CẬP NHẬT Ở ĐÂY: Thêm record.Id || record.id */}
          <Popconfirm title="Xóa nhà cung cấp này?" onConfirm={() => handleDelete(record.Id || record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Suppliers</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={4} style={{ margin: 0 }}>Quản Lý Nhà Cung Cấp</Title>
          <Space>
            {/* Thanh tìm kiếm gọi thẳng hàm fetchSuppliers */}
            <Input.Search
              placeholder="Tìm tên, SĐT, Email..."
              allowClear
              onSearch={(value) => fetchSuppliers(value)}
              style={{ width: 250, borderRadius: '8px' }}
            />
            <Button type="primary" icon={<PlusOutlined />} style={{ background: '#5570F1', borderRadius: '8px' }} onClick={() => showModal()}>
              Add Supplier
            </Button>
          </Space>
        </div>

        <Table columns={columns} dataSource={data} pagination={{ pageSize: 6 }} loading={loading} />
      </Card>

      {/* FORM THÊM/SỬA NHÀ CUNG CẤP */}
      <Modal
        title={editingId ? "Sửa Thông Tin Đối Tác" : "Thêm Nhà Cung Cấp Mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu" cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
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
    </>
  );
}