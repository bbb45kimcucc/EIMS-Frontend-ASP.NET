import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Input, Space, Tag, message, Modal, Form, Select, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Warehouses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Kiểm tra quyền Admin để hiện/ẩn nút
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.Role === "Admin" || currentUser?.role === "Admin";

  axios.defaults.withCredentials = true;

  // 1. LẤY DỮ LIỆU & CHUẨN HÓA
  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/Warehouses', { withCredentials: true });
      
      // Fix lỗi PascalCase từ C# trả về
      const realData = response.data.map(item => ({
        ...item,
        key: item.Id || item.id,
        id: item.Id || item.id,
        name: item.Name || item.name,
        location: item.Location || item.location,
        description: item.Description || item.description,
        status: item.Status || item.status || 'Active' // Mặc định Active nếu DB chưa có
      }));
      
      setData(realData);
    } catch (error) {
      message.error("Lỗi tải dữ liệu Kho hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ status: 'Active' });
    }
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingId) {
        await axios.put(`/api/Warehouses/${editingId}`, { id: editingId, ...values });
        message.success("Cập nhật kho thành công!");
      } else {
        await axios.post('/api/Warehouses', values);
        message.success("Thêm kho mới thành công!");
      }
      setIsModalVisible(false);
      fetchWarehouses();
    } catch (error) {
      message.error("Lỗi khi lưu dữ liệu kho!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/Warehouses/${id}`);
      message.success("Đã xóa kho!");
      fetchWarehouses();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể xóa kho đang chứa hàng!");
    }
  };

  const columns = [
    { 
      title: 'Tên Kho', 
      dataIndex: 'name', 
      key: 'name',
      render: text => <Text strong>{text}</Text> 
    },
    { 
      title: 'Vị trí', 
      dataIndex: 'location', 
      render: text => <><EnvironmentOutlined style={{ color: '#f5222d', marginRight: 5}} />{text || 'Chưa xác định'}</>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      render: status => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status === 'Active' ? 'ĐANG HOẠT ĐỘNG' : 'TẠM NGƯNG'}
        </Tag>
      )
    },
    { title: 'Mô tả', dataIndex: 'description', ellipsis: true },
    {
      title: 'Hành động',
      hidden: !isAdmin, // Ẩn cột hành động nếu không phải Admin
      render: (_, record) => isAdmin ? (
        <Space>
          <Button type="text" icon={<EditOutlined />} style={{ color: '#5570F1' }} onClick={() => showModal(record)} />
          <Popconfirm title="Xóa kho này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ) : <Tag icon={<InfoCircleOutlined />}>Chỉ xem</Tag>,
    },
  ];

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Warehouses</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={4} style={{ margin: 0 }}>Quản Lý Kho Hàng</Title>
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} style={{ background: '#5570F1' }} onClick={() => showModal()}>
              Thêm Kho Mới
            </Button>
          )}
        </div>
        
        <Table columns={columns.filter(col => !col.hidden)} dataSource={data} loading={loading} />
      </Card>

      <Modal 
        title={editingId ? "Cập Nhật Kho" : "Tạo Kho Mới"} 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên Kho" rules={[{ required: true, message: 'Nhập tên kho!' }]}>
            <Input placeholder="VD: Kho linh kiện A1" />
          </Form.Item>

          <Form.Item name="location" label="Địa chỉ/Vị trí">
            <Input placeholder="VD: Tầng 2, Dãy B" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="Active">Hoạt động</Option>
              <Option value="Inactive">Tạm ngưng</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Kho này dùng để làm gì..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}