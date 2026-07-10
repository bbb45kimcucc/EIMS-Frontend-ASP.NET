import React from 'react';
import { Card, Form, Row, Col, Select, Input, Divider, Typography, Space, InputNumber, Button } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

export default function SalesOrderForm({ form, onFinish, loading, customers, products }) {
  return (
    <Card 
      title={<><ShoppingCartOutlined style={{ marginRight: 10, color: '#5570F1' }} /> Lập Đơn Bán Hàng</>}
      style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        
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
  );
}