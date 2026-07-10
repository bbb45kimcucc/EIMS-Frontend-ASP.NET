import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Form } from 'antd';
import axios from 'axios';

// Import components
import CustomerHeader from './CustomerHeader';
import CustomerTable from './CustomerTable';
import CustomerModals from './CustomerModals';
import CustomerHistory from './CustomerHistory';

const { Text } = Typography;

export default function Customers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

  // State Form
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // State Xóa
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // State Lịch sử & In
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [customerTickets, setCustomerTickets] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState(null);

  axios.defaults.withCredentials = true;

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const url = searchQuery 
        ? `/api/Customers/search?query=${searchQuery}`
        : '/api/Customers';
      const response = await axios.get(url);
      
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
        const reqResponse = await axios.get('/api/ActionRequests');
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

  const showHistory = async (record) => {
    setCurrentCustomer(record);
    try {
      const res = await axios.get('/api/InventoryTickets');
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
        await axios.put(`/api/Customers/${editingId}`, { id: editingId, ...values });
        message.success("Cập nhật thành công!");
      } else {
        await axios.post('/api/Customers', values);
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
      await axios.post('/api/ActionRequests/request-delete', payload);
      message.success("Đã gửi đơn xin xóa cho Admin phê duyệt!");
      setIsDeleteModalVisible(false);
      fetchCustomers(); 
    } catch (error) {
      message.error("Lỗi khi gửi yêu cầu!");
    }
  };

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Customers</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <CustomerHeader onSearch={(val) => fetchCustomers(val)} onAdd={() => showModal()} />
        <CustomerTable 
          dataSource={data} 
          loading={loading} 
          pendingDeleteIds={pendingDeleteIds}
          onShowHistory={showHistory}
          onEdit={showModal}
          onDelete={showDeleteModal}
        />
      </Card>

      <CustomerModals 
        isFormVisible={isModalVisible}
        onFormCancel={() => setIsModalVisible(false)}
        onFormSubmit={handleSave}
        form={form}
        editingId={editingId}
        isDeleteVisible={isDeleteModalVisible}
        onDeleteCancel={() => setIsDeleteModalVisible(false)}
        onDeleteSubmit={submitDeleteRequest}
        itemToDelete={itemToDelete}
        deleteReason={deleteReason}
        setDeleteReason={setDeleteReason}
      />

      <CustomerHistory 
        isHistoryVisible={isHistoryModalVisible}
        onHistoryCancel={() => setIsHistoryModalVisible(false)}
        customerTickets={customerTickets}
        currentCustomer={currentCustomer}
        isPrintVisible={isPrintModalVisible}
        onPrintCancel={() => setIsPrintModalVisible(false)}
        ticketToPrint={ticketToPrint}
        setTicketToPrint={setTicketToPrint}
        setIsPrintVisible={setIsPrintModalVisible}
      />
    </>
  );
}