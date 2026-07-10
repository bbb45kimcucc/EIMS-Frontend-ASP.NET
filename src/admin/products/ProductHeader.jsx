import React from 'react';
import { Typography, Space, Input, Button, Select } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

// Nhận thêm categories, brands và các hàm onFilter từ component cha
export default function ProductHeader({ 
  onSearch, onExport, onAdd, categories, brands, onFilterCategory, onFilterBrand 
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
      <Title level={4} style={{ margin: 0 }}>Kho Linh Kiện</Title>
      
      <Space wrap>
        {/* LỌC THEO DANH MỤC */}
        <Select 
          placeholder="Tất cả danh mục" 
          allowClear 
          style={{ width: 160 }}
          onChange={(value) => onFilterCategory(value)}
        >
          {categories.map(c => <Option key={c.id || c.Id} value={c.name || c.Name}>{c.name || c.Name}</Option>)}
        </Select>

        {/* LỌC THEO THƯƠNG HIỆU */}
        <Select 
          placeholder="Tất cả hãng" 
          allowClear 
          style={{ width: 150 }}
          onChange={(value) => onFilterBrand(value)}
        >
          {brands.map(b => <Option key={b.id || b.Id} value={b.name || b.Name}>{b.name || b.Name}</Option>)}
        </Select>

        <Input.Search
          placeholder="Tìm theo mã SKU, tên..."
          allowClear
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 200 }}
        />
        
        <Button icon={<DownloadOutlined />} onClick={onExport} style={{ borderColor: '#237804', color: '#237804' }}>
          Xuất Excel
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ background: '#5570F1' }}>
          Thêm Linh Kiện
        </Button>
      </Space>
    </div>
  );
}