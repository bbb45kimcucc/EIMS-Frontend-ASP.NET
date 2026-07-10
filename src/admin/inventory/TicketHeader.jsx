import React from 'react';
import { Typography, Space, Input, Button, Upload, Select, DatePicker } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Bọc try-catch để an toàn tuyệt đối
const storedUser = localStorage.getItem("user");
let userData = {};
try {
  userData = (storedUser && storedUser !== "undefined") ? JSON.parse(storedUser) : {};
} catch (error) {
  console.error("Lỗi đọc user:", error);
}

const userRole = userData.Role || userData.role || "";
const isAdmin = userRole === "Admin";
const isWarehouse = userRole === "Warehouse";

export default function TicketHeader({
  onSearch, onTypeChange, onDateChange, onImport, onExport, onAdd
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
      <Title level={4} style={{ margin: 0 }}>Quản Lý Phiếu Nhập / Xuất</Title>

      <Space wrap>
        <Select defaultValue="All" style={{ width: 120 }} onChange={onTypeChange}>
          <Option value="All">Tất cả phiếu</Option>
          <Option value="Nhập">Phiếu Nhập</Option>
          <Option value="Xuất">Phiếu Xuất</Option>
        </Select>

        <RangePicker format="DD/MM/YYYY" onChange={onDateChange} />
        <Input.Search placeholder="Mã phiếu, người lập..." allowClear onChange={(e) => onSearch(e.target.value)} style={{ width: 200 }} />

        <Upload beforeUpload={() => false} onChange={onImport} showUploadList={false} accept=".xlsx, .xls">
          <Button icon={<PlusOutlined />}>Nhập Excel</Button>
        </Upload>

        <Button icon={<DownloadOutlined />} onClick={onExport} style={{ borderColor: '#237804', color: '#237804' }}>Xuất Excel</Button>
        
        {(isAdmin || isWarehouse) && (
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#5570F1' }} onClick={onAdd}>
            Tạo Phiếu
          </Button>
        )}
      </Space>
    </div>
  );
}