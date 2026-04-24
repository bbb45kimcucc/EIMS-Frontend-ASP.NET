import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Form, Select, InputNumber, Space, Divider, message, Modal, Row, Col, Input } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, DeleteOutlined, PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

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
        axios.get('https://localhost:7033/api/Products'),
        axios.get('https://localhost:7033/api/Customers').catch(() => ({ data: [] }))
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
  }, []);

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
        note: values.note, // Gửi thêm Ghi chú (nếu Backend có lưu)
        ticketDetails: values.ticketDetails
      };

      await axios.post('https://localhost:7033/api/InventoryTickets', payload);
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
        note: values.note, // Đẩy ghi chú ra Hóa đơn
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

      <Card 
        title={<><ShoppingCartOutlined style={{ marginRight: 10, color: '#5570F1' }} /> Lập Đơn Bán Hàng</>}
        style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveOrder}>
          
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="customerId" label="Chọn Khách Hàng" rules={[{ required: true, message: 'Vui lòng chọn khách mua!' }]}>
                <Select placeholder="-- Tìm khách hàng --" showSearch optionFilterProp="children" allowClear>
                  {customers.map(c => (
                    <Option key={c.Id || c.id} value={c.Id || c.id}>{c.Name || c.name} - {c.Phone || c.phone}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="paymentMethod" label="Phương thức thanh toán" rules={[{ required: true }]} initialValue="Tiền mặt">
                <Select>
                  <Option value="Tiền mặt">💵 Tiền mặt</Option>
                  <Option value="Chuyển khoản (ACB)">🏦 Chuyển khoản (ACB)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="note" label="Ghi chú đơn hàng (Không bắt buộc)">
                <Input placeholder="Ví dụ: Giao hỏa tốc, khách VIP..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />
          <Title level={5}>Chi Tiết Giỏ Hàng</Title>

          <Form.List name="ticketDetails">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8, background: '#fafafa', padding: '10px', borderRadius: '8px' }} align="baseline">
                    
                    <Form.Item 
                      {...restField} 
                      name={[name, 'productId']} 
                      label={key === 0 ? "Tên Sản Phẩm" : ""} 
                      rules={[{ required: true, message: 'Chọn hàng' }]} 
                      style={{ width: '350px' }}
                    >
                      <Select 
                        placeholder="Gõ để tìm sản phẩm..." 
                        showSearch 
                        optionFilterProp="children"
                        onChange={(val) => {
                          // MAGIC Ở ĐÂY: Tự động lấy Đơn giá & gán SL = 1 khi chọn sản phẩm
                          const prod = products.find(p => (p.Id || p.id) === val);
                          const price = prod?.AveragePrice || prod?.averagePrice || prod?.Price || prod?.price || 0;
                          
                          const currentDetails = form.getFieldValue('ticketDetails');
                          currentDetails[name] = {
                            ...currentDetails[name],
                            unitPrice: price,
                            quantity: 1
                          };
                          form.setFieldsValue({ ticketDetails: currentDetails });
                        }}
                      >
                        {products.map(p => {
                          // Sửa lại cho đúng biến Quantity của Cúc
                          const currentStock = p.Quantity || p.quantity || 0;
                          return (
                            <Option key={p.Id || p.id} value={p.Id || p.id} disabled={currentStock <= 0}>
                              {p.SKU || p.sku} - {p.Name || p.name} | Kho còn: <strong style={{ color: currentStock > 0 ? 'green' : 'red' }}>{currentStock}</strong>
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>

                    <Form.Item {...restField} name={[name, 'quantity']} label={key === 0 ? "SL" : ""} rules={[{ required: true, message: 'Nhập SL' }]}>
                      <InputNumber placeholder="SL" min={1} style={{ width: '80px' }} />
                    </Form.Item>

                    <Form.Item {...restField} name={[name, 'unitPrice']} label={key === 0 ? "Đơn Giá Bán (VNĐ)" : ""} rules={[{ required: true, message: 'Nhập giá' }]}>
                      <InputNumber 
                        placeholder="Đơn giá" min={0} style={{ width: '130px' }} 
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                      />
                    </Form.Item>

                    {/* MAGIC TÍNH THÀNH TIỀN TRỰC TIẾP */}
                    <Form.Item label={key === 0 ? "Thành Tiền (VNĐ)" : ""} shouldUpdate>
                      {() => {
                        const qty = form.getFieldValue(['ticketDetails', name, 'quantity']) || 0;
                        const price = form.getFieldValue(['ticketDetails', name, 'unitPrice']) || 0;
                        return (
                          <InputNumber 
                            value={qty * price} 
                            disabled 
                            style={{ width: '150px', fontWeight: 'bold', color: 'red' }} 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                          />
                        );
                      }}
                    </Form.Item>

                    <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} style={{ marginTop: key === 0 ? '30px' : '0' }} />
                  </Space>
                ))}
                
                <Form.Item style={{ marginTop: '20px' }}>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ borderColor: '#5570F1', color: '#5570F1' }}>
                    Thêm một món khác vào đơn hàng
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />
          
          <div style={{ textAlign: 'right' }}>
            <Button size="large" type="primary" htmlType="submit" loading={loading} icon={<CheckCircleOutlined />} style={{ background: '#52c41a', padding: '0 40px' }}>
              XÁC NHẬN BÁN & XUẤT HÓA ĐƠN
            </Button>
          </div>
        </Form>
      </Card>

      {/* ================= MODAL HIỂN THỊ HÓA ĐƠN AUTO-POPUP ================= */}
      <Modal
        title="Xuất Hóa Đơn Thành Công"
        open={isInvoiceVisible}
        onCancel={() => setIsInvoiceVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsInvoiceVisible(false)}>Đóng (Tiếp tục bán)</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            In Hóa Đơn Đưa Khách
          </Button>
        ]}
        width={750}
        maskClosable={false}
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

        {invoiceData && (
          <div id="printable-invoice" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#000' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: '15px', marginBottom: '20px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', textTransform: 'uppercase' }}>CÔNG TY TNHH LINH KIỆN ĐIỆN TỬ WMS</h1>
              <p style={{ margin: '5px 0', fontSize: '13px' }}>Địa chỉ: Làng Đại Học, Tp. Thủ Đức, TP. HCM | Hotline: 1900.8888</p>
              <h2 style={{ margin: '20px 0 5px 0' }}>HÓA ĐƠN BÁN HÀNG</h2>
              <p style={{ margin: 0 }}>Mã đơn: <strong>{invoiceData.ticketCode}</strong></p>
            </div>

            <Row style={{ marginBottom: '20px', fontSize: '14px' }}>
              <Col span={12}>
                <p style={{ margin: '5px 0' }}><strong>Khách hàng:</strong> {invoiceData.customerName}</p>
                <p style={{ margin: '5px 0' }}><strong>Thanh toán:</strong> {invoiceData.paymentMethod}</p>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <p style={{ margin: '5px 0' }}><strong>Ngày bán:</strong> {invoiceData.createdAt}</p>
                <p style={{ margin: '5px 0' }}><strong>Người Lập Phiếu:</strong> {invoiceData.creatorName}</p>
              </Col>
            </Row>

            {/* HIỂN THỊ GHI CHÚ NẾU CÓ */}
            {invoiceData.note && (
              <div style={{ marginBottom: '15px', fontSize: '14px', fontStyle: 'italic' }}>
                <strong>Ghi chú:</strong> {invoiceData.note}
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>STT</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Tên Sản Phẩm</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>SL</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Đơn Giá</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((detail, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{detail.productName}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{detail.quantity}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(detail.unitPrice || 0).toLocaleString()} đ</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                      {((detail.quantity || 0) * (detail.unitPrice || 0)).toLocaleString()} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '15px' }}>
              <p style={{ margin: '5px 0' }}>Tổng số lượng: {invoiceData.totalQuantity}</p>
              <h3 style={{ margin: '10px 0', fontSize: '20px' }}>
                TỔNG THANH TOÁN: <span style={{ color: 'red' }}>{(invoiceData.totalAmount || 0).toLocaleString()} VNĐ</span>
              </h3>
            </div>
            
            <Row style={{ marginTop: '50px', textAlign: 'center', fontSize: '14px' }}>
              <Col span={12}>
                <strong>Khách Hàng</strong>
                <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '5px' }}>(Ký, ghi rõ họ tên)</p>
              </Col>
              <Col span={12}>
                <strong>Người Bán Hàng</strong>
                <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '5px' }}>(Ký, ghi rõ họ tên)</p>
              </Col>
            </Row>

            <div style={{ textAlign: 'center', marginTop: '60px', fontStyle: 'italic', fontSize: '12px', color: '#666' }}>
              Cảm ơn quý khách đã mua sắm tại WMS. Hẹn gặp lại!
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}