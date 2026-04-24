import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Input, Space, Tag, message, Modal, Form, Popconfirm, Select } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Lấy thông tin user từ LocalStorage
  const storedUser = localStorage.getItem('user');
  const currentUser = (storedUser && storedUser !== "undefined" && storedUser !== "null") 
    ? JSON.parse(storedUser) 
    : {};  

  // CẤU HÌNH QUAN TRỌNG: Gửi kèm Cookie/Session và Custom Header
  const axiosConfig = { 
    withCredentials: true, // Bắt buộc phải có dòng này để C# đọc được Session
    headers: { 
      'User-Role': currentUser.Role || currentUser.role || '' 
    } 
  };

  // 1. LẤY DỮ LIỆU TỪ C#
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://localhost:7033/api/Users', axiosConfig);
      
      // SỬA Ở ĐÂY: Bắt mạch chữ hoa chữ thường của C#
      const realData = response.data.map(item => ({ 
        ...item, 
        key: item.Id || item.id,
        id: item.Id || item.id,
        username: item.Username || item.username,
        fullName: item.FullName || item.fullName,
        email: item.Email || item.email,
        role: item.Role || item.role
      }));
      
      setData(realData);
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Lỗi 401: Bạn không đủ quyền hạn (Không phải Admin)!");
      } else {
        message.error("Không thể tải dữ liệu nhân viên");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. MỞ BẢNG THÊM / SỬA
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ role: 'Staff' });
    }
    setIsModalVisible(true);
  };

  // 3. LƯU (POST / PUT)
  const handleSave = async (values) => {
    try {
      if (editingId) {
        await axios.put(`https://localhost:7033/api/Users/${editingId}`, 
          { id: editingId, ...values }, 
          axiosConfig
        );
        message.success("Cập nhật thành công!");
      } else {
        await axios.post('https://localhost:7033/api/Users', values, axiosConfig);
        message.success("Tạo tài khoản thành công!");
      }
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi lưu nhân viên!";
      message.error(errorMsg);
    }
  };

  // 4. XÓA
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://localhost:7033/api/Users/${id}`, axiosConfig);
      message.success("Đã xóa nhân viên thành công!");
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi không thể xóa!");
    }
  };

  const columns = [
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      width: '15%',
      render: text => <strong><UserOutlined style={{ marginRight: 5, color: '#8c8c8c' }} />{text}</strong>
    },
    { title: 'Họ và Tên', dataIndex: 'fullName', width: '25%' },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '25%',
      render: text => <><MailOutlined style={{ marginRight: 5, color: '#8c8c8c' }} />{text}</>
    },
    {
      title: 'Phân quyền',
      dataIndex: 'role',
      width: '15%',
      render: (role) => (
        <Tag color={role === 'Admin' ? 'volcano' : 'blue'} style={{ borderRadius: '4px', fontWeight: 'bold' }}>
          {role?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      width: '20%',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} style={{ color: '#5570F1' }} onClick={() => showModal(record)} />
          {/* Không cho Admin tự xóa chính mình để bảo vệ hệ thống */}
          {record.role !== 'Admin' && (
            <Popconfirm title="Xóa nhân viên này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / User Management</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={4} style={{ margin: 0 }}>Quản Lý Nhân Sự</Title>
          <Space>
            <Input placeholder="Tìm kiếm tài khoản..." prefix={<SearchOutlined />} style={{ borderRadius: '8px' }} />
            <Button type="primary" icon={<PlusOutlined />} style={{ background: '#5570F1', borderRadius: '8px' }} onClick={() => showModal()}>
              Add User
            </Button>
          </Space>
        </div>

        <Table columns={columns} dataSource={data} pagination={{ pageSize: 8 }} loading={loading} />
      </Card>

      <Modal
        title={editingId ? "Cập Nhật Thông Tin" : "Tạo Tài Khoản Mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu" cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Space size="large" style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="username" label="Tài khoản đăng nhập" rules={[{ required: true, message: 'Nhập username!' }]} style={{ flex: 1 }}>
              <Input placeholder="VD: admin_cuc" />
            </Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: !editingId, message: 'Nhập mật khẩu!' }]} style={{ flex: 1 }}>
              <Input.Password autoComplete="new-password" placeholder="Nhập mật khẩu" />
            </Form.Item>
          </Space>

          <Form.Item name="fullName" label="Họ và Tên đầy đủ" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
            <Input placeholder="VD: Trương Thị Kim Cúc" />
          </Form.Item>

          <Space size="large" style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="email" label="Địa chỉ Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]} style={{ flex: 2 }}>
              <Input placeholder="VD: cuc@metrix.com" />
            </Form.Item>
            <Form.Item name="role" label="Phân quyền (Role)" style={{ flex: 1 }}>
              <Select disabled={editingId && data.find(u => u.id === editingId)?.role === 'Admin'}>
                <Option value="Admin">Admin</Option>
                <Option value="Staff">Staff</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
}