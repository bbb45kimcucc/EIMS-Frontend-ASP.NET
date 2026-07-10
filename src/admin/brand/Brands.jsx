import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Form } from 'antd';
import axios from 'axios';

// Import các component con
import BrandHeader from './BrandHeader';
import BrandTable from './BrandTable';
import BrandModal from './BrandModal';

const { Text } = Typography;

export default function Brands() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(''); // State lưu từ khóa tìm kiếm
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [form] = Form.useForm();

  const API_URL = '/api/Brands';

  // 1. LẤY DỮ LIỆU THƯƠNG HIỆU
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
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

  // 2. LOGIC TÌM KIẾM
  const filteredData = data.filter((item) => {
    const lowerCaseSearch = searchText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(lowerCaseSearch)) ||
      (item.description && item.description.toLowerCase().includes(lowerCaseSearch))
    );
  });

  // 3. MỞ MODAL
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
        await axios.put(`${API_URL}/${editingId}`, { id: editingId, ...values });
        message.success("Cập nhật thương hiệu thành công!");
      } else {
        await axios.post(API_URL, values);
        message.success("Thêm thương hiệu thành công!");
      }
      setIsModalVisible(false);
      fetchBrands(); 
    } catch (error) {
      message.error("Lỗi khi lưu dữ liệu!");
    }
  };

  // 5. XỬ LÝ XÓA
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Brands</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <BrandHeader 
          onSearch={setSearchText} 
          onAdd={() => showModal()} 
        />
        
        <BrandTable 
          dataSource={filteredData} // Truyền dữ liệu đã lọc qua bảng
          loading={loading} 
          onEdit={showModal} 
          onDelete={handleDelete} 
        />
      </Card>

      <BrandModal 
        visible={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        form={form}
        editingId={editingId}
      />
    </div>
  );
}