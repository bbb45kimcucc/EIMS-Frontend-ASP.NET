import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Input, Space, message } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

// Import 2 file con mình vừa tạo
import UserTable from './UserTable';
import UserModal from './UserModal';

const { Title, Text } = Typography;

export default function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null); // Dữ liệu cũ truyền vào form

  const storedUser = localStorage.getItem('user');
  const currentUser = (storedUser && storedUser !== "undefined" && storedUser !== "null")
    ? JSON.parse(storedUser)
    : {};

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'User-Role': currentUser.Role || currentUser.role || ''
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/Users', axiosConfig);

      const realData = response.data.map(item => ({
        ...item,
        key: item.Id || item.id,
        id: item.Id || item.id,
        username: item.Username || item.username,
        fullName: item.FullName || item.fullName,
        email: item.Email || item.email,
        role: item.Role || item.role,
        phone: item.Phone || item.phone,
        department:
          item.Department || item.department,
        isActive:
          item.IsActive ?? item.isActive
      }));
      setData(realData);
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Lỗi 401: Bạn không đủ quyền hạn!");
      } else {
        message.error("Không thể tải dữ liệu nhân viên");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Mở modal (Xử lý cho cả chức năng Thêm mới và Sửa)
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      setEditingData(record);
    } else {
      setEditingId(null);
      setEditingData(null);
    }
    setIsModalVisible(true);
  };

  // Hành động Lưu từ Modal gửi lên
  const handleSave = async (values, currentEditingId) => {
    try {
      if (currentEditingId) {
        await axios.put(`/api/Users/${currentEditingId}`,
          { id: currentEditingId, ...values },
          axiosConfig
        );
        message.success("Cập nhật thành công!");
      } else {
        await axios.post('/api/Users', values, axiosConfig);
        message.success("Tạo tài khoản thành công!");
      }
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi lưu nhân viên!";
      message.error(errorMsg);
    }
  };

  // Hành động Xóa từ Bảng gửi lên
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/Users/${id}`, axiosConfig);
      message.success("Đã xóa nhân viên thành công!");
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi không thể xóa!");
    }
  };

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

        {/* Nạp Bảng hiển thị */}
        <UserTable
          data={data}
          loading={loading}
          onEdit={showModal}
          onDelete={handleDelete}
        />
      </Card>

      {/* Nạp Khung nhập liệu */}
      <UserModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        editingId={editingId}
        initialData={editingData}
        onSave={handleSave}
        dataList={data}
      />
    </>
  );
}