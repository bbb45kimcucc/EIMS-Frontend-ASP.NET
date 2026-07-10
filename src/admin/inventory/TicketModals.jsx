import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

export default function TicketModals({

  // Props Lập Phiếu
  isFormVisible, onFormCancel, onFormSubmit, form,
  warehouses = [], users = [], suppliers = [], customers = [], products = [],

  // Props Xóa
  isDeleteVisible, onDeleteCancel, onDeleteSubmit, ticketToDelete, deleteReason, setDeleteReason, isAdmin,

  // Props In/Xem chi tiết
  isPrintVisible, onPrintCancel, ticketToPrint
}) {
  const ticketType = Form.useWatch("type", form);
  
  // Hàm tính tổng tiền cho hóa đơn
  const calculateTotal = (details) => {
    if (!details || details.length === 0) return 0;
    return details.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || item.price || 0)), 0);
  };

  return (
    <>
      {/* 1. MODAL LẬP PHIẾU */}
      <Modal
        title="Lập Phiếu Nhập / Xuất Kho" open={isFormVisible} onCancel={onFormCancel}
        onOk={() => form.submit()} okText="Lưu Phiếu" cancelText="Hủy" width={950} destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
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
                {warehouses?.map(w => <Option key={w.Id || w.id} value={w.Id || w.id}>{w.Name || w.name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="userId" label="Nhân viên lập" rules={[{ required: true }]} style={{ width: '200px' }}>
              <Select placeholder="Chọn nhân viên" disabled>
                {users?.map(u => <Option key={u.Id || u.id} value={u.Id || u.id}>{u.FullName || u.fullName || u.Username || u.username}</Option>)}
              </Select>
            </Form.Item>
          </Space>

          <Space size="large" style={{ display: "flex", width: "100%" }}>

            {ticketType === "Nhập" && (
              <Form.Item
                name="supplierId"
                label="Nhà cung cấp"
                style={{ flex: 1 }}
              >
                <Select placeholder="Chọn nhà cung cấp">
                  {suppliers?.map(s => (
                    <Option
                      key={s.Id || s.id}
                      value={s.Id || s.id}
                    >
                      {s.Name || s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {ticketType === "Xuất" && (
              <Form.Item
                name="customerId"
                label="Khách hàng"
                style={{ flex: 1 }}
              >
                <Select placeholder="Chọn khách hàng">
                  {customers?.map(c => (
                    <Option
                      key={c.Id || c.id}
                      value={c.Id || c.id}
                    >
                      {c.Name || c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

          </Space>

          <Divider orientation="left">Chi Tiết Sản Phẩm</Divider>
          <Form.List name="ticketDetails">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name, 'productId']} rules={[{ required: true, message: 'Chọn linh kiện' }]} style={{ width: '350px' }}>
                      <Select
                        placeholder="Chọn linh kiện"
                        showSearch
                        optionFilterProp="label"
                        options={
                          products
                            ?.filter(p => {
                              const stock = p.CurrentStock ?? p.currentStock ?? p.Quantity ?? p.quantity ?? 0;
                              return ticketType === "Nhập" ? true : stock > 0;
                            })
                            .map(p => {
                              const stock = p.CurrentStock ?? p.currentStock ?? p.Quantity ?? p.quantity ?? 0;
                              const price = Number(p.Price ?? p.price ?? p.UnitPrice ?? p.unitPrice ?? p.SalePrice ?? 0);
                              return {
                                value: p.Id || p.id,
                                label: `${p.SKU || p.sku} - ${p.Name || p.name} | Tồn: ${stock} | ${price.toLocaleString()}đ`
                              };
                            })
                        }
                      />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: 'Nhập SL' }]}>
                      <InputNumber placeholder="SL" min={1} style={{ width: '80px' }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'unitPrice']} rules={[{ required: true, message: 'Nhập giá' }]}>
                      <InputNumber placeholder="Đơn giá" min={0} style={{ width: '150px' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm linh kiện vào phiếu</Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* 2. MODAL NHẬP LÝ DO XÓA */}
      <Modal
        title={isAdmin ? "Xác nhận Hủy Phiếu (Quyền Admin)" : "Gửi yêu cầu Hủy Phiếu (Quyền Nhân viên)"}
        open={isDeleteVisible} onCancel={onDeleteCancel} onOk={onDeleteSubmit}
        okText={isAdmin ? "Xóa Ngay Lập Tức" : "Gửi Yêu Cầu Cho Admin"}
        okButtonProps={{ danger: isAdmin, type: "primary" }}
      >
        <p>Bạn đang thao tác với phiếu: <strong>{ticketToDelete?.ticketCode || ticketToDelete?.TicketCode}</strong></p>
        <p style={{ color: isAdmin ? '#fa8c16' : '#1677ff', fontStyle: 'italic' }}>
          {isAdmin ? "⚠️ Lưu ý: Vì bạn là Admin, hành động này sẽ xóa phiếu và hoàn lại số lượng vào kho ngay lập tức!" : "ℹ️ Lưu ý: Nhân viên không thể tự xóa. Lý do của bạn sẽ được gửi cho Admin để chờ phê duyệt."}
        </p>
        <Form layout="vertical">
          <Form.Item label="Lý do hủy phiếu (Bắt buộc nhập):" required>
            <Input.TextArea rows={3} placeholder="VD: Nhập sai số lượng..." value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 3. MODAL IN / XEM CHI TIẾT HÓA ĐƠN */}
      <Modal
        title="Chi tiết Hóa Đơn" open={isPrintVisible} onCancel={onPrintCancel}
        footer={[
          <Button key="close" onClick={onPrintCancel}>Đóng</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>In / Xuất PDF</Button>
        ]} width={800}
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
              <h2 style={{ margin: '15px 0 5px 0' }}>HÓA ĐƠN {ticketToPrint.type?.toLowerCase() === 'nhập' ? 'NHẬP KHO' : 'XUẤT KHO'}</h2>
              <p style={{ margin: 0 }}>Mã phiếu: <strong>{ticketToPrint.ticketCode || ticketToPrint.TicketCode}</strong></p>
            </div>
            
            <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <p style={{ margin: '5px 0' }}><strong>Ngày lập:</strong> {moment(ticketToPrint.createdAt || ticketToPrint.CreatedAt).format("DD/MM/YYYY HH:mm")}</p>
                
                {/* TỰ ĐỘNG DÒ TÊN KHO */}
                <p style={{ margin: '5px 0' }}>
                  <strong>Kho: </strong> 
                  {(() => {
                    const wh = warehouses?.find(w => (w.Id || w.id) === (ticketToPrint.warehouseId || ticketToPrint.WarehouseId));
                    return (wh?.Name || wh?.name) || ticketToPrint.warehouseName || ticketToPrint.WarehouseName || "Không xác định";
                  })()}
                </p>
              </div>
              
              <div>
                {/* TỰ ĐỘNG DÒ TÊN NGƯỜI LẬP */}
                <p style={{ margin: '5px 0' }}>
                  <strong>Người lập: </strong> 
                  {(() => {
                    const creator = users?.find(u => (u.Id || u.id) === (ticketToPrint.userId || ticketToPrint.UserId));
                    return (creator?.FullName || creator?.fullName || creator?.Username || creator?.username) 
                        || ticketToPrint.userName || ticketToPrint.UserName || "Không xác định";
                  })()}
                </p>

                {/* TỰ ĐỘNG DÒ TÊN NHÀ CUNG CẤP NẾU LÀ PHIẾU NHẬP */}
                {ticketToPrint.type === "Nhập" && (
                  <p style={{ margin: '5px 0' }}>
                    <strong>Nhà cung cấp: </strong>
                    {(() => {
                      const sup = suppliers?.find(s => (s.Id || s.id) === (ticketToPrint.supplierId || ticketToPrint.SupplierId));
                      return (sup?.Name || sup?.name) || ticketToPrint.supplierName || ticketToPrint.SupplierName || "Không xác định";
                    })()}
                  </p>
                )}

                {/* TỰ ĐỘNG DÒ TÊN KHÁCH HÀNG NẾU LÀ PHIẾU XUẤT */}
                {ticketToPrint.type === "Xuất" && (
                  <p style={{ margin: '5px 0' }}>
                    <strong>Khách hàng: </strong>
                    {(() => {
                      const cus = customers?.find(c => (c.Id || c.id) === (ticketToPrint.customerId || ticketToPrint.CustomerId));
                      return (cus?.Name || cus?.name) || ticketToPrint.customerName || ticketToPrint.CustomerName || "Không xác định";
                    })()}
                  </p>
                )}
              </div>
            </div>

            {/* BẢNG CHI TIẾT SẢN PHẨM */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>STT</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Tên linh kiện</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>SL</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Đơn giá</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {(ticketToPrint.ticketDetails || ticketToPrint.details || []).map((item, index) => {
                  const price = item.unitPrice || item.price || item.UnitPrice || 0;
                  const qty = item.quantity || item.Quantity || 0;
                  const total = price * qty;
                  
                  return (
                    <tr key={index}>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {item.productName || item.ProductName || item.product?.name || `Linh kiện ID: ${item.productId}`}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{qty}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{Number(price).toLocaleString()}đ</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{Number(total).toLocaleString()}đ</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* TỔNG TIỀN */}
            <div style={{ textAlign: 'right', fontSize: '18px', marginTop: '20px' }}>
              <strong>Tổng tiền thanh toán: </strong>
              <span style={{ color: 'red', fontWeight: 'bold' }}>
                {calculateTotal(ticketToPrint.ticketDetails || ticketToPrint.details).toLocaleString()}đ
              </span>
            </div>          
          </div>
        )}
      </Modal>
    </>
  );
}