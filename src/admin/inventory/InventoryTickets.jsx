import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Input, Space, Tag, message, Modal, Form, Select, InputNumber, Popconfirm, Divider,Upload } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

export default function InventoryTickets() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // STATE CHO TÍNH NĂNG XÓA
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  const [searchText, setSearchText] = useState('');

  // STATE CHO TÍNH NĂNG IN HÓA ĐƠN
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState(null);

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.Role === "Admin" || currentUser?.role === "Admin";

  axios.defaults.withCredentials = true;

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { withCredentials: true };
      const [resTickets, resProds, resSupps, resCusts, resUsers, resWarehouses] = await Promise.all([
        axios.get('https://localhost:7033/api/InventoryTickets', config),
        axios.get('https://localhost:7033/api/Products', config),
        axios.get('https://localhost:7033/api/Suppliers', config),
        axios.get('https://localhost:7033/api/Customers', config).catch(() => ({ data: [] })),
        axios.get('https://localhost:7033/api/Users', config).catch(() => ({ data: [] })),
        axios.get('https://localhost:7033/api/Warehouses', config).catch(() => ({ data: [] }))
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
        warehouse: item.Warehouse || item.warehouse // Lấy thông tin kho cho hóa đơn
      }));

      setData(formattedTickets);
      setProducts(resProds.data);
      setSuppliers(resSupps.data);
      setCustomers(resCusts.data);
      setUsers(resUsers.data);
      setWarehouses(resWarehouses.data);
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải dữ liệu! Kiểm tra Backend hoặc Login lại nha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = data.filter((item) => {
    const lowerCaseSearch = searchText.toLowerCase();
    return (
      (item.ticketCode && item.ticketCode.toLowerCase().includes(lowerCaseSearch)) ||
      (item.creatorName && item.creatorName.toLowerCase().includes(lowerCaseSearch)) ||
      (item.type && item.type.toLowerCase().includes(lowerCaseSearch))
    );
  });

  const exportExcel = async () => {
    try {
      message.loading({ content: 'Đang trích xuất dữ liệu...', key: 'exportTicket' });

      const response = await axios.get('https://localhost:7033/api/InventoryTickets/export-excel', {
        responseType: 'blob',
        withCredentials: true
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LichSuNhapXuat_${moment().format('DDMMYYYY')}.xlsx`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success({ content: 'Xuất file thành công!', key: 'exportTicket', duration: 2 });
    } catch (error) {
      message.error({ content: 'Lỗi xuất Excel! Có thể chưa chạy backend C#', key: 'exportTicket', duration: 3 });
    }
  };

  const showModal = () => {
    form.resetFields();
    form.setFieldsValue({
      type: 'Nhập',
      userId: currentUser?.Id || currentUser?.id
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      let totalQty = 0;
      let totalAmt = 0;

      if (values.ticketDetails && values.ticketDetails.length > 0) {
        values.ticketDetails.forEach(item => {
          totalQty += (item.quantity || 0);
          totalAmt += (item.quantity || 0) * (item.unitPrice || 0);
        });
      } else {
        return message.warning("Phải chọn ít nhất 1 linh kiện!");
      }

      const payload = {
        ...values,
        totalQuantity: totalQty,
        totalAmount: totalAmt,
      };

      await axios.post('https://localhost:7033/api/InventoryTickets', payload);
      message.success("Lập phiếu thành công! Kho đã được cập nhật.");
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi lưu phiếu!");
    }
  };

  const handleImportExcel = async (info) => {
    const { file } = info;

    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append('file', file);

    try {
      message.loading({ content: 'Đang nhập dữ liệu...', key: 'importing' });

      await axios.post('https://localhost:7033/api/InventoryTickets/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      message.success({ content: 'Nhập dữ liệu thành công!', key: 'importing' });
      fetchData(); // Tải lại bảng để thấy dữ liệu mới
    } catch (error) {
      message.error({ content: 'Lỗi khi nhập file Excel!', key: 'importing' });
    }
  };
  const confirmDelete = async () => {
    if (!deleteReason || !deleteReason.trim()) {
      return message.warning("Cúc ơi, bắt buộc phải nhập lý do hủy phiếu nha!");
    }

    try {
      if (isAdmin) {
        // ADMIN XÓA TRỰC TIẾP
        await axios.delete(`https://localhost:7033/api/InventoryTickets/${ticketToDelete.id || ticketToDelete.Id}?reason=${encodeURIComponent(deleteReason)}`, {
          withCredentials: true
        });
        message.success("Đã hủy phiếu và hoàn lại tồn kho thành công!");
      } else {
        await axios.post('https://localhost:7033/api/ActionRequests/request-delete', {
          actionType: 'Delete_InventoryTicket',
          targetId: ticketToDelete?.id || ticketToDelete?.Id || 0,
          reason: deleteReason || "Không có lý do",
          content: `Yêu cầu hủy phiếu ${ticketToDelete?.ticketCode || ''}. Lý do: ${deleteReason}`, // 👈 TRÙM CUỐI LÀ ĐÂY!!!
          status: 'Pending',
          createdBy: currentUser?.FullName || currentUser?.Username || 'Staff',
          createdAt: new Date().toISOString()
        }, {
          withCredentials: true
        });
        message.success("Đã gửi yêu cầu hủy phiếu cho Admin. Vui lòng chờ duyệt!");
      }

      setIsDeleteModalVisible(false);
      setTicketToDelete(null);
      setDeleteReason('');
      fetchData();
    } catch (error) {
      console.log("Chi tiết lỗi 400 từ Backend:", error.response?.data);
      message.error("Có lỗi xảy ra khi xử lý yêu cầu xóa!");
    }
  };

  const columns = [
    { title: 'Mã Phiếu', dataIndex: 'ticketCode', render: text => <strong>{text}</strong> },
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (text) => {
        const typeStr = text ? String(text) : 'Nhập';
        const isNhap = typeStr.toLowerCase() === 'nhập';
        return <Tag color={isNhap ? 'green' : 'volcano'}>{typeStr.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Ngày Lập',
      dataIndex: 'createdAt',
      render: date => moment(date).format('DD/MM/YYYY HH:mm')
    },
    { title: 'Người lập', dataIndex: 'creatorName' },
    { title: 'Tổng SL', dataIndex: 'totalQuantity', render: qty => <strong>{qty}</strong> },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      render: amt => <Text type="success">{(amt || 0).toLocaleString()} đ</Text>
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            style={{ color: '#fa8c16' }}
            icon={<PrinterOutlined />}
            onClick={() => { setTicketToPrint(record); setIsPrintModalVisible(true); }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setTicketToDelete(record);
              setDeleteReason('');
              setIsDeleteModalVisible(true);
            }}
          />
        </Space>
      ),
    }
  ];

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Text type="secondary">Dashboard / Inventory Tickets</Text>
      </div>

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title level={4} style={{ margin: 0 }}>Quản Lý Phiếu Nhập / Xuất</Title>

          <Space>
            <Input.Search
              placeholder="Tìm mã phiếu, tên người lập..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Upload
              beforeUpload={() => false} 
              onChange={handleImportExcel}
              showUploadList={false}
              accept=".xlsx, .xls"
            >
              <Button icon={<PlusOutlined />} style={{ borderColor: '#1890ff', color: '#1890ff' }}>
                Nhập Excel
              </Button>
            </Upload>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={exportExcel}
              style={{ borderColor: '#237804', color: '#237804' }}
            >
              Xuất Excel
            </Button>

            {isAdmin && (
              <Button type="primary" icon={<PlusOutlined />} style={{ background: '#5570F1' }} onClick={showModal}>
                Tạo Phiếu Mới
              </Button>
            )}
          </Space>
        </div>

        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 8 }} loading={loading} />
      </Card>

      {/* 1. MODAL LẬP PHIẾU */}
      <Modal
        title="Lập Phiếu Nhập / Xuất Kho"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu Phiếu" cancelText="Hủy"
        width={950}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Space size="large" style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="ticketCode" label="Mã Phiếu" rules={[{ required: true }]} style={{ width: '150px' }}>
              <Input placeholder="VD: PN-001" />
            </Form.Item>

            <Form.Item name="type" label="Loại Phiếu" style={{ width: '130px' }}>
              <Select>
                <Option value="Nhập">Phiếu Nhập</Option>
                <Option value="Xuất">Phiếu Xuất</Option>
              </Select>
            </Form.Item>

            <Form.Item name="warehouseId" label="Chọn Kho" rules={[{ required: true, message: 'Nhớ chọn kho!' }]} style={{ flex: 1 }}>
              <Select placeholder="Chọn kho để nhập/xuất">
                {warehouses.map(w => (
                  <Option key={w.Id || w.id} value={w.Id || w.id}>
                    {w.Name || w.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="userId" label="Nhân viên lập" rules={[{ required: true }]} style={{ width: '200px' }}>
              <Select placeholder="Chọn nhân viên" disabled>
                {users.map(u => (
                  <Option key={u.Id || u.id} value={u.Id || u.id}>
                    {u.FullName || u.fullName || u.Username || u.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Space size="large" style={{ display: 'flex', width: '100%' }}>
            <Form.Item name="supplierId" label="Nhà cung cấp (Nếu Nhập)" style={{ flex: 1 }}>
              <Select placeholder="Chọn NCC" allowClear>
                {suppliers.map(s => (
                  <Option key={s.Id || s.id} value={s.Id || s.id}>{s.Name || s.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="customerId" label="Khách hàng (Nếu Xuất)" style={{ flex: 1 }}>
              <Select placeholder="Chọn Khách" allowClear>
                {customers.map(c => (
                  <Option key={c.Id || c.id} value={c.Id || c.id}>{c.Name || c.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Divider titlePlacement="left">Chi Tiết Sản Phẩm</Divider>

          <Form.List name="ticketDetails">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name, 'productId']} rules={[{ required: true, message: 'Chọn linh kiện' }]} style={{ width: '350px' }}>
                      <Select placeholder="Chọn linh kiện" showSearch optionFilterProp="children">
                        {products.map(p => (
                          <Option key={p.Id || p.id} value={p.Id || p.id}>
                            {p.SKU || p.sku} - {p.Name || p.name} (Tồn: {p.CurrentStock || p.currentStock || p.Quantity || p.quantity || 0})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: 'Nhập SL' }]}>
                      <InputNumber placeholder="SL" min={1} style={{ width: '80px' }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'unitPrice']} rules={[{ required: true, message: 'Nhập giá' }]}>
                      <InputNumber
                        placeholder="Đơn giá"
                        min={0}
                        style={{ width: '150px' }}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm linh kiện vào phiếu
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* 2. MODAL NHẬP LÝ DO XÓA (THÊM VÀO ĐÂY NÈ MÁ) */}
      <Modal
        title={isAdmin ? "Xác nhận Hủy Phiếu (Quyền Admin)" : "Gửi yêu cầu Hủy Phiếu (Quyền Nhân viên)"}
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={confirmDelete}
        okText={isAdmin ? "Xóa Ngay Lập Tức" : "Gửi Yêu Cầu Cho Admin"}
        okButtonProps={{ danger: isAdmin, type: "primary" }}
      >
        <p>Bạn đang thao tác với phiếu: <strong>{ticketToDelete?.ticketCode || ticketToDelete?.TicketCode}</strong></p>

        <p style={{ color: isAdmin ? '#fa8c16' : '#1677ff', fontStyle: 'italic' }}>
          {isAdmin
            ? "⚠️ Lưu ý: Vì bạn là Admin, hành động này sẽ xóa phiếu và hoàn lại số lượng vào kho ngay lập tức!"
            : "ℹ️ Lưu ý: Nhân viên không thể tự xóa. Lý do của bạn sẽ được gửi cho Admin để chờ phê duyệt."}
        </p>

        <Form layout="vertical">
          <Form.Item label="Lý do hủy phiếu (Bắt buộc nhập):" required>
            <Input.TextArea
              rows={3}
              placeholder="VD: Nhập sai số lượng, Khách đổi ý trả hàng, Ghi nhầm giá..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 3. MODAL IN HÓA ĐƠN */}
      <Modal
        title="In Hóa Đơn"
        open={isPrintModalVisible}
        onCancel={() => setIsPrintModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPrintModalVisible(false)}>Đóng</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            In / Xuất PDF
          </Button>
        ]}
        width={750}
      >
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              #printable-invoice, #printable-invoice * { visibility: visible; }
              #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
              .ant-modal-footer, .ant-modal-close, .ant-modal-header { display: none !important; }
            }
          `}
        </style>

        {ticketToPrint && (
          <div id="printable-invoice" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#000' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
              <h1 style={{ margin: 0, fontSize: '24px' }}>CÔNG TY LINH KIỆN ĐIỆN TỬ WMS</h1>
              <p style={{ margin: '5px 0' }}>Địa chỉ: 123 Đường Điện Tử, Q.1, TP. HCM | SĐT: 0123.456.789</p>
              <h2 style={{ margin: '15px 0 5px 0' }}>
                HÓA ĐƠN {ticketToPrint.type?.toLowerCase() === 'nhập' ? 'NHẬP KHO' : 'XUẤT KHO'}
              </h2>
              <p style={{ margin: 0 }}>Mã phiếu: <strong>{ticketToPrint.ticketCode}</strong></p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '5px 0' }}>
                  <strong>Đối tác:</strong> {ticketToPrint.type?.toLowerCase() === 'nhập'
                    ? (ticketToPrint.supplier?.name || ticketToPrint.Supplier?.Name || '---')
                    : (ticketToPrint.customer?.name || ticketToPrint.Customer?.Name || '---')}
                </p>
                <p style={{ margin: '5px 0' }}><strong>Người lập phiếu:</strong> {ticketToPrint.creatorName}</p>
                <p style={{ margin: '5px 0' }}><strong>Kho thực hiện:</strong> {ticketToPrint.warehouse?.name || ticketToPrint.Warehouse?.Name || '---'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '5px 0' }}><strong>Ngày lập:</strong> {moment(ticketToPrint.createdAt).format('DD/MM/YYYY')}</p>
                <p style={{ margin: '5px 0' }}><strong>Giờ:</strong> {moment(ticketToPrint.createdAt).format('HH:mm')}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>STT</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Tên Linh Kiện</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Số Lượng</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Đơn Giá</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {(ticketToPrint.ticketDetails || []).map((detail, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>
                      {detail.Product?.Name || detail.product?.name || `Sản phẩm #${detail.productId || detail.ProductId}`}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{detail.quantity || detail.Quantity}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(detail.unitPrice || detail.UnitPrice || 0).toLocaleString()} đ</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                      {((detail.quantity || detail.Quantity || 0) * (detail.unitPrice || detail.UnitPrice || 0)).toLocaleString()} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '16px' }}>
              <p style={{ margin: '5px 0' }}><strong>Tổng số lượng:</strong> {ticketToPrint.totalQuantity}</p>
              <p style={{ margin: '5px 0', fontSize: '18px' }}>
                <strong>Tổng cộng thanh toán: <span style={{ color: 'red' }}>{(ticketToPrint.totalAmount || 0).toLocaleString()} VNĐ</span></strong>
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px', paddingBottom: '30px' }}>
              <div style={{ textAlign: 'center' }}>
                <strong>Người lập phiếu</strong>
                <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '5px' }}>(Ký, họ tên)</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <strong>Người nhận/giao hàng</strong>
                <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '5px' }}>(Ký, họ tên)</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}