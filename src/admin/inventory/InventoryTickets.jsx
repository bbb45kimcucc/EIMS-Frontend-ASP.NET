import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Form } from 'antd';
import axios from 'axios';
import moment from 'moment';

import TicketHeader from './TicketHeader';
import TicketTable from './TicketTable';
import TicketModals from './TicketModals';

const { Text } = Typography;

export default function InventoryTickets() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  const [searchText, setSearchText] = useState('');
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState(null);

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [dateRange, setDateRange] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.Role === "Admin" || currentUser?.role === "Admin";

  axios.defaults.withCredentials = true;

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { withCredentials: true };
      const [resTickets, resProds, resSupps, resCusts, resUsers, resWarehouses] = await Promise.all([
        axios.get('/api/InventoryTickets', config),
        axios.get('/api/Products', config),
        axios.get('/api/Suppliers', config),
        axios.get('/api/Customers', config).catch(() => ({ data: [] })),
        axios.get('/api/Users', config).catch(() => ({ data: [] })),
        axios.get('/api/Warehouses', config).catch(() => ({ data: [] }))
      ]);

      const formattedTickets = resTickets.data.map(item => ({
        ...item,
        key: item.Id || item.id,
        id: item.Id || item.id,
        ticketCode: item.TicketCode || item.ticketCode,
        type: item.Type || item.type || 'Nhập',
        createdAt: item.CreatedAt || item.createdAt,
        totalQuantity: item.TotalQuantity || item.totalQuantity,
        totalAmount: item.TotalAmount || item.totalAmount,
        creatorName: item.User?.FullName || item.user?.fullName || item.User?.Username || item.user?.username || '---',
        ticketDetails: item.TicketDetails || item.ticketDetails || [],
        customer: item.Customer || item.customer,
        supplier: item.Supplier || item.supplier,
        warehouse: item.Warehouse || item.warehouse
      }));

      setData(formattedTickets);
      setProducts(resProds.data);
      setSuppliers(resSupps.data);
      setCustomers(resCusts.data);
      setUsers(resUsers.data);
      setWarehouses(resWarehouses.data);
    } catch (error) {
      message.error("Lỗi tải dữ liệu! Kiểm tra Backend hoặc Login lại nha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = data.filter((item) => {
    // 1. Lọc theo chữ
    const lowerCaseSearch = searchText.toLowerCase();
    const matchSearch =
      (item.ticketCode && item.ticketCode.toLowerCase().includes(lowerCaseSearch)) ||
      (item.creatorName && item.creatorName.toLowerCase().includes(lowerCaseSearch));

    // 2. Lọc theo Loại
    const matchType = filterType === 'All' ? true : item.type.toLowerCase() === filterType.toLowerCase();

    // 3. Lọc theo Ngày
    let matchDate = true;
    if (dateRange && dateRange.length === 2) {
      const start = dateRange[0].startOf('day').valueOf();
      const end = dateRange[1].endOf('day').valueOf();
      const itemTime = new Date(item.createdAt).getTime();
      matchDate = itemTime >= start && itemTime <= end;
    }

    return matchSearch && matchType && matchDate;
  });

  const exportExcel = async () => { /* Logic exportExcel giữ nguyên */ };
  const handleImportExcel = async (info) => { /* Logic handleImportExcel giữ nguyên */ };

  const showModal = () => {
    form.resetFields();
    form.setFieldsValue({ type: 'Nhập', userId: currentUser?.Id || currentUser?.id });
    setIsModalVisible(true);
  };

  const handleSave = async (values) => { /* Logic handleSave giữ nguyên */ };
const confirmDelete = async () => {
    // 1. Kiểm tra xem nhân viên đã nhập lý do chưa
    if (!deleteReason || deleteReason.trim() === '') {
      message.warning("Vui lòng nhập lý do hủy phiếu!");
      return;
    }

    try {
      // 2. Chuẩn bị thẻ nhân viên (axiosConfig) để qua ải bảo vệ
      const config = { 
        withCredentials: true,
        headers: { 
          'User-Role': currentUser?.Role || currentUser?.role || '',
          'User-Id': currentUser?.Id || currentUser?.id || '' 
        } 
      };

      // 3. Gọi API gửi yêu cầu vào trung tâm phê duyệt
      await axios.post('/api/ActionRequests', {
        actionType: 'Delete_InventoryTicket',
        content: `Yêu cầu hủy phiếu ${ticketToDelete?.ticketCode || ticketToDelete?.TicketCode}`,
        reason: deleteReason,
        createdBy: currentUser?.Email || currentUser?.email || currentUser?.Username || 'Staff'
      }, config);

      // 4. Hiện thông báo thành công xanh lá và dọn dẹp Form
      message.success("Đã gửi yêu cầu hủy phiếu thành công! Vui lòng chờ Admin duyệt.");
      setIsDeleteModalVisible(false); // Đóng bảng
      setDeleteReason(''); // Xóa trắng chữ trong ô lý do
      setTicketToDelete(null); 

    } catch (error) {
      // 5. Nếu Backend chặn thì báo lỗi đỏ
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || "Lỗi khi gửi yêu cầu!";
      message.error(`Không thể gửi: ${errorMsg}`);
    }
  };
  return (
    <>
      <div style={{ marginBottom: '20px' }}><Text type="secondary">Dashboard / Inventory Tickets</Text></div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <TicketHeader
          onSearch={setSearchText}
          onTypeChange={setFilterType}
          onDateChange={setDateRange}
          onImport={handleImportExcel}
          onExport={exportExcel}
          onAdd={showModal}
          isAdmin={isAdmin}
        />
        <TicketTable
          dataSource={filteredData} loading={loading}
          onPrint={(record) => { setTicketToPrint(record); setIsPrintModalVisible(true); }}
          onDelete={(record) => { setTicketToDelete(record); setDeleteReason(''); setIsDeleteModalVisible(true); }}
        />
      </Card>

      <TicketModals
        isFormVisible={isModalVisible} onFormCancel={() => setIsModalVisible(false)} onFormSubmit={handleSave} form={form}
        warehouses={warehouses} users={users} suppliers={suppliers} customers={customers} products={products}

        isDeleteVisible={isDeleteModalVisible} onDeleteCancel={() => setIsDeleteModalVisible(false)} onDeleteSubmit={confirmDelete}
        ticketToDelete={ticketToDelete} deleteReason={deleteReason} setDeleteReason={setDeleteReason} isAdmin={isAdmin}

        isPrintVisible={isPrintModalVisible} onPrintCancel={() => setIsPrintModalVisible(false)} ticketToPrint={ticketToPrint}
      />
    </>
  );
}