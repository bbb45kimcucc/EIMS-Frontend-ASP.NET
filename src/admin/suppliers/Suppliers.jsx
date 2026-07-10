import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Form } from 'antd';
import axios from 'axios';

// Import components
import SupplierHeader from './SupplierHeader';
import SupplierTable from './SupplierTable';
import SupplierModals from './SupplierModals';

const { Text } = Typography;

export default function Suppliers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Thêm/Sửa
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // State Lịch sử Nhập hàng
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [supplierTickets, setSupplierTickets] = useState([]);
  const [currentSupplier, setCurrentSupplier] = useState(null);

  axios.defaults.withCredentials = true;

  // LẤY DỮ LIỆU & TÌM KIẾM
  const fetchSuppliers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const url = searchQuery ? `/api/Suppliers/search?query=${searchQuery}` : '/api/Suppliers';
      const response = await axios.get(url); 

      const realData = response.data.map(item => ({
        ...item,
        key: item.id || item.Id,
        id: item.id || item.Id,
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

  // MỞ MODAL THÊM / SỬA
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

  // LƯU (POST / PUT)
  const handleSave = async (values) => {
    try {
      if (editingId) {
        await axios.put(`/api/Suppliers/${editingId}`, { id: editingId, ...values });
        message.success("Cập nhật thông tin thành công!");
      } else {
        await axios.post('/api/Suppliers', values);
        message.success("Thêm mới thành công!");
      }
      setIsModalVisible(false);
      fetchSuppliers(); 
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu!");
    }
  };

  // XÓA
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/Suppliers/${id}`);
      message.success("Đã xóa Nhà cung cấp!");
      fetchSuppliers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi không thể xóa!";
      message.error(errorMsg);
    }
  };

  // XEM LỊCH SỬ GIAO DỊCH
  const handleShowHistory = async (record) => {
    setCurrentSupplier(record);
    try {
      // Gọi API lấy phiếu nhập xuất
      const res = await axios.get('/api/InventoryTickets');
      
      // Lọc ra Phiếu Nhập VÀ thuộc về Supplier này
      const history = res.data.filter(t => 
        (t.SupplierId === record.id || t.supplierId === record.id) && 
        (t.Type?.toLowerCase() === 'nhập' || t.type?.toLowerCase() === 'nhập')
      );
      
      // Map lại dữ liệu cho bảng
      const formattedHistory = history.map(item => ({
        key: item.Id || item.id,
        ticketCode: item.TicketCode || item.ticketCode,
        createdAt: item.CreatedAt || item.createdAt,
        totalQuantity: item.TotalQuantity || item.totalQuantity,
        totalAmount: item.TotalAmount || item.totalAmount,
      }));

      setSupplierTickets(formattedHistory);
      setIsHistoryVisible(true);
    } catch (error) {
      message.error("Lỗi tải lịch sử giao dịch!");
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Suppliers</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <SupplierHeader 
          onSearch={(value) => fetchSuppliers(value)} 
          onAdd={() => showModal()} 
        />
        
        <SupplierTable 
          dataSource={data} 
          loading={loading} 
          onEdit={showModal} 
          onDelete={handleDelete}
          onShowHistory={handleShowHistory}
        />
      </Card>

      <SupplierModals 
        isFormVisible={isModalVisible}
        onFormCancel={() => setIsModalVisible(false)}
        onFormSubmit={handleSave}
        form={form}
        editingId={editingId}
        
        isHistoryVisible={isHistoryVisible}
        onHistoryCancel={() => setIsHistoryVisible(false)}
        supplierTickets={supplierTickets}
        currentSupplier={currentSupplier}
      />
    </>
  );
}