import React from 'react';
import { Typography, Space, Input, DatePicker, Button } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function StockCardHeader({ defaultSku, onSearch, onDateChange, onReset }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
      <Title level={4} style={{ margin: 0 }}>Nhật Ký Biến Động Kho (Stock Cards)</Title>
      <Space wrap>
        <RangePicker 
          format="DD/MM/YYYY"
          onChange={onDateChange}
          placeholder={['Từ ngày', 'Đến ngày']}
        />
        <Input.Search 
          placeholder="Mã SKU sản phẩm..." 
          allowClear
          defaultValue={defaultSku} // Tự điền SKU từ URL vào đây
          onSearch={onSearch}
          style={{ width: 200 }} 
        />
        <Button type="primary" icon={<FilterOutlined />} style={{ background: '#5570F1' }}>
          Lọc
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onReset}>
          Làm mới
        </Button>
      </Space>
    </div>
  );
}