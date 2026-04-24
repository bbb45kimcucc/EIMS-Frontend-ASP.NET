import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Input, Space, message, Modal, Form, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

export default function Brands() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ĐIỀU KHIỂN MODAL THÊM/SỬA
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [form] = Form.useForm();

  const API_URL = 'https://localhost:7033/api/Brands';

  // 1. LẤY DỮ LIỆU THƯƠNG HIỆU
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      // Map data để xử lý đồng nhất key và trường dữ liệu
      const realData = response.data.map(item => ({ 
        ...item, 
        key: item.id || item.Id, 
        id: item.id || item.Id,
        name: item.name || item.Name,
        description: item.description || item.Description
      }));
      setData(realData);
    } catch (error) {
      message.error("Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  // 2. MỞ MODAL
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record); // Đổ dữ liệu vào form khi sửa
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 3. XỬ LÝ LƯU (POST HOẶC PUT)
  const handleSave = async (values) => {
    try {
      if (editingId) {
        // CẬP NHẬT (PUT)
        await axios.put(`${API_URL}/${editingId}`, { id: editingId, ...values });
        message.success("Cập nhật thương hiệu thành công!");
      } else {
        // THÊM MỚI (POST)
        await axios.post(API_URL, values);
        message.success("Thêm thương hiệu thành công!");
      }
      setIsModalVisible(false);
      fetchBrands(); 
    } catch (error) {
      message.error("Lỗi khi lưu dữ liệu!");
    }
  };

  // 4. XỬ LÝ XÓA
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success("Đã xóa thương hiệu!");
      fetchBrands();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể xóa thương hiệu này!";
      message.error(errorMsg);
    }
  };

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      width: '10%',
      sorter: (a, b) => a.id - b.id 
    },
    { 
      title: 'Brand Name', 
      dataIndex: 'name', 
      width: '30%', 
      render: text => <strong style={{ color: '#1890ff' }}>{text}</strong> 
    },
    { 
      title: 'Description', 
      dataIndex: 'description' 
    },
    {
      title: 'Action',
      width: '20%',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            style={{ color: '#5570F1' }} 
            onClick={() => showModal(record)} 
          />
          <Popconfirm 
            title="Xóa thương hiệu này?" 
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)} 
            okText="Xóa" 
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Brands</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Brands List</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            style={{ background: '#5570F1', borderRadius: '8px' }} 
            onClick={() => showModal()}
          >
            Add Brand
          </Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={{ pageSize: 7 }} 
          loading={loading} 
        />
      </Card>

      {/* MODAL THÊM / SỬA */}
      <Modal 
        title={editingId ? "Edit Brand" : "Add New Brand"} 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Save" 
        cancelText="Cancel"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
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
    </div>
  );
}