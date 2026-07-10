import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Form } from 'antd';
import axios from 'axios';

// Import các component con
import CategoryHeader from './CategoryHeader';
import CategoryTable from './CategoryTable';
import CategoryModal from './CategoryModal';

const { Text } = Typography;

export default function Categories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(''); // State lưu từ khóa tìm kiếm
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // 1. LẤY DỮ LIỆU
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/Categories');
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

  // 2. LOGIC TÌM KIẾM
  const filteredData = data.filter((item) => {
    const lowerCaseSearch = searchText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(lowerCaseSearch)) ||
      (item.description && item.description.toLowerCase().includes(lowerCaseSearch))
    );
  });

  // 3. MỞ MODAL THÊM HOẶC SỬA
  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 4. XỬ LÝ LƯU (POST HOẶC PUT)
  const handleSave = async (values) => {
    try {
      if (editingId) {
        await axios.put(`/api/Categories/${editingId}`, { id: editingId, ...values });
        message.success("Cập nhật danh mục thành công!");
      } else {
        await axios.post('/api/Categories', values);
        message.success("Thêm mới danh mục thành công!");
      }
      setIsModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu!");
    }
  };

  // 5. XỬ LÝ XÓA (DELETE)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/Categories/${id}`);
      message.success("Đã xóa danh mục!");
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi không thể xóa!";
      message.error(errorMsg);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Categories</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <CategoryHeader 
          onSearch={setSearchText} 
          onAdd={() => showModal()} 
        />
        
        <CategoryTable 
          dataSource={filteredData} // Truyền dữ liệu đã lọc qua bảng
          loading={loading} 
          onEdit={showModal} 
          onDelete={handleDelete} 
        />
      </Card>

      <CategoryModal 
        visible={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        form={form}
        editingId={editingId}
      />
    </>
  );
}