import React, { useState, useEffect } from 'react';
import { Typography, Form, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

// Import các component con
import SalesOrderForm from './SalesOrderForm';
import SalesInvoiceModal from './SalesInvoiceModal';

const { Text } = Typography;

export default function SalesOrder() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  axios.defaults.withCredentials = true;

  const fetchData = async () => {
    try {
      const [resProds, resCusts] = await Promise.all([
        axios.get('/api/Products'),
        axios.get('/api/Customers').catch(() => ({ data: [] }))
      ]);
      setProducts(resProds.data);
      setCustomers(resCusts.data);
    } catch (error) {
      message.error("Lỗi tải dữ liệu Sản phẩm / Khách hàng!");
    }
  };

  useEffect(() => { 
    fetchData(); 
    form.setFieldsValue({ ticketDetails: [{}] });
  }, [form]);

  const handleSaveOrder = async (values) => {
    setLoading(true);
    try {
      let totalQty = 0;
      let totalAmt = 0;

      if (values.ticketDetails && values.ticketDetails.length > 0) {
        values.ticketDetails.forEach(item => {
          totalQty += (item.quantity || 0);
          totalAmt += (item.quantity || 0) * (item.unitPrice || 0);
        });
      } else {
        setLoading(false);
        return message.warning("Giỏ hàng đang trống! Vui lòng chọn sản phẩm.");
      }

      const autoTicketCode = `BH-${moment().format('DDMMYYHHmm')}`;

      const payload = {
        ticketCode: autoTicketCode,
        type: 'Xuất', 
        userId: currentUser?.Id || currentUser?.id,
        customerId: values.customerId,
        totalQuantity: totalQty,
        totalAmount: totalAmt,
        note: values.note, 
        ticketDetails: values.ticketDetails
      };

      await axios.post('/api/InventoryTickets', payload);
      message.success("Bán hàng & Trừ kho thành công!");

      const selectedCustomer = customers.find(c => (c.Id || c.id) === values.customerId);
      
      const detailedItems = values.ticketDetails.map(item => {
        const prod = products.find(p => (p.Id || p.id) === item.productId);
        return { ...item, productName: prod?.Name || prod?.name || 'Sản phẩm không tên' };
      });

      setInvoiceData({
        ticketCode: autoTicketCode,
        customerName: selectedCustomer?.Name || selectedCustomer?.name || 'Khách vãng lai',
        paymentMethod: values.paymentMethod, 
        creatorName: currentUser?.FullName || currentUser?.FullName || currentUser?.Username || 'Nhân viên',
        createdAt: moment().format('DD/MM/YYYY HH:mm'),
        totalQuantity: totalQty,
        totalAmount: totalAmt,
        note: values.note,
        items: detailedItems
      });

      setIsInvoiceVisible(true);
      form.resetFields();
      form.setFieldsValue({ ticketDetails: [{}] });

    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi lưu đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Bán Hàng (Sales)</Text>
      </div>

      <SalesOrderForm 
        form={form}
        onFinish={handleSaveOrder}
        loading={loading}
        customers={customers}
        products={products}
      />

      <SalesInvoiceModal 
        visible={isInvoiceVisible}
        onCancel={() => setIsInvoiceVisible(false)}
        invoiceData={invoiceData}
      />
    </>
  );
}