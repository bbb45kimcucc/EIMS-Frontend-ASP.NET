import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Upload, Button, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function ProductModal({
  visible,
  onCancel,
  onSave,
  form,
  editingId,
  imageUrl,
  setImageUrl,
  handleUploadImage,
  categories,
  brands,
  units
}) {
  return (
    <Modal
      title={editingId ? "Cập Nhật Linh Kiện" : "Thêm Linh Kiện Mới"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu lại" 
      cancelText="Hủy"
      width={750}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item label="Ảnh minh họa">
          <Upload
            listType="picture-card"
            showUploadList={false}
            customRequest={handleUploadImage}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Linh kiện" style={{ width: '100%', borderRadius: '8px' }} />
            ) : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
              </div>
            )}
          </Upload>
          {imageUrl && <Button type="link" onClick={() => setImageUrl("")} danger>Xóa ảnh</Button>}
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="sku" label="Mã SKU" rules={[{ required: true, message: 'Không được bỏ trống!' }]}>
              <Input placeholder="VD: MCU-001" />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="name" label="Tên linh kiện" rules={[{ required: true, message: 'Không được bỏ trống!' }]}>
              <Input placeholder="VD: Arduino Uno R3" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="categoryId" label="Danh mục">
              <Select placeholder="Chọn danh mục">
                {categories.map(c => <Option key={c.id || c.Id} value={c.id || c.Id}>{c.name || c.Name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="brandId" label="Thương hiệu">
              <Select placeholder="Chọn hãng">
                {brands.map(b => <Option key={b.id || b.Id} value={b.id || b.Id}>{b.name || b.Name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="unitId" label="Đơn vị tính">
              <Select placeholder="Chọn ĐVT">
                {units.map(u => <Option key={u.id || u.Id} value={u.id || u.Id}>{u.name || u.Name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="averagePrice" label="Giá bán ước tính (VNĐ)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tồn kho hiện tại" tooltip="Số lượng này sẽ tự động thay đổi khi bạn nhập/xuất kho">
              <InputNumber value={form.getFieldValue('quantity')} disabled style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}