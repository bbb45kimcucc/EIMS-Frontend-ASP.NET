import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Input, Space, message, Modal, Form, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

export default function Categories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // MẤY CÁI STATE NÀY ĐỂ ĐIỀU KHIỂN BẢNG THÊM/SỬA
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); // Lưu ID nếu đang sửa, null nếu là thêm mới
  const [form] = Form.useForm(); // Quản lý dữ liệu trong Form

  // 1. LẤY DỮ LIỆU
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://localhost:7033/api/Categories');
      // SỬA Ở ĐÂY: Thêm trò "bắt mạch" chữ hoa/thường để đảm bảo luôn có key
      const realData = response.data.map(item => ({ 
        ...item, 
        key: item.Id || item.id, 
        id: item.Id || item.id,
        name: item.Name || item.name,
        description: item.Description || item.description
      }));
      setData(realData);
    } catch (error) {
      message.error("Không thể tải dữ liệu danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // 2. MỞ MODAL THÊM HOẶC SỬA
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id); // Chế độ Sửa
      form.setFieldsValue(record); // Đổ dữ liệu cũ vô Form
    } else {
      setEditingId(null); // Chế độ Thêm mới
      form.resetFields(); // Làm trống Form
    }
    setIsModalVisible(true);
  };

  // 3. XỬ LÝ LƯU (POST HOẶC PUT)
  const handleSave = async (values) => {
    try {
      if (editingId) {
        // SỬA: Gọi PUT
        await axios.put(`https://localhost:7033/api/Categories/${editingId}`, { id: editingId, ...values });
        message.success("Cập nhật danh mục thành công!");
      } else {
        // THÊM: Gọi POST
        await axios.post('https://localhost:7033/api/Categories', values);
        message.success("Thêm mới danh mục thành công!");
      }
      setIsModalVisible(false);
      fetchCategories(); // Tải lại bảng
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu!");
    }
  };

  // 4. XỬ LÝ XÓA (DELETE)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://localhost:7033/api/Categories/${id}`);
      message.success("Đã xóa danh mục!");
      fetchCategories();
    } catch (error) {
      // Bắt lỗi 400 nếu C# báo danh mục đang có linh kiện (Logic đỉnh của Cúc á)
      const errorMsg = error.response?.data?.message || "Lỗi không thể xóa!";
      message.error(errorMsg);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: '10%' },
    { title: 'Category Name', dataIndex: 'name', width: '30%', render: text => <strong>{text}</strong> },
    { title: 'Description', dataIndex: 'description' },
    {
      title: 'Action',
      width: '20%',
      render: (_, record) => (
        <Space size="middle">
          {/* Nút Sửa */}
          <Button type="text" icon={<EditOutlined />} style={{ color: '#5570F1' }} onClick={() => showModal(record)} />
          {/* Nút Xóa có kèm hộp thoại xác nhận */}
          <Popconfirm title="Bạn có chắc muốn xóa danh mục này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Categories</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={4} style={{ margin: 0 }}>Categories List</Title>
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#5570F1' }} onClick={() => showModal()}>
            Add Category
          </Button>
        </div>
        
        <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} loading={loading} />
      </Card>

      {/* MODAL THÊM / SỬA */}
      <Modal 
        title={editingId ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"} 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()} // Bấm OK thì submit Form
        okText="Lưu" cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="VD: Vi mạch IC" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}