import React, { useState, useEffect } from 'react';
import { Select, Input, Typography, Space, Tag } from 'antd';
import { SearchOutlined, AppstoreOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Text } = Typography;
const { Option, OptGroup } = Select;

export default function GlobalSearch() {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({ products: [], customers: [], tickets: [] });
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  // Lấy toàn bộ dữ liệu cơ bản khi component render lần đầu
  // Để tối ưu, bạn có thể chỉ fetch khi người dùng bắt đầu gõ (nhưng với đồ án thì fetch trước cho mượt)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [resProds, resCusts, resTickets] = await Promise.all([
          axios.get('/api/Products'),
          axios.get('/api/Customers').catch(() => ({ data: [] })),
          axios.get('/api/InventoryTickets').catch(() => ({ data: [] }))
        ]);

        setOptions({
          products: resProds.data || [],
          customers: resCusts.data || [],
          tickets: resTickets.data || []
        });
      } catch (error) {
        console.error("Lỗi tải dữ liệu Global Search:", error);
      }
    };
    fetchAllData();
  }, []);

  // Xử lý khi người dùng chọn một mục trong danh sách xổ xuống
  const handleSelect = (value, option) => {
    const { type, id, sku } = option;

    // Chuyển hướng tới trang tương ứng dựa vào loại dữ liệu được chọn
    if (type === 'product') {
      // Nhảy sang trang thẻ kho của sản phẩm đó luôn cho xịn
      navigate(`/stockcards?sku=${sku}`);
    } else if (type === 'customer') {
      navigate('/customers');
    } else if (type === 'ticket') {
      navigate('/tickets');
    }
  };

  return (
    <Select
      showSearch
      allowClear
      placeholder={
        <Space>
          <SearchOutlined style={{ color: '#bfbfbf' }} />
          <Text type="secondary">Tìm kiếm linh kiện, khách hàng, mã phiếu...</Text>
        </Space>
      }
      style={{ width: 400, borderRadius: '8px' }}
      loading={loading}
      onSelect={handleSelect}
      optionFilterProp="label" // Cho phép gõ chữ để lọc mượt mà
      filterOption={(input, option) => {
        // Hàm lọc: kiểm tra chữ người dùng gõ có nằm trong label không (không phân biệt hoa/thường)
        if (option.label) {
          return option.label.toLowerCase().includes(input.toLowerCase());
        }
        return false;
      }}
      size="large"
    >
      {/* NHÓM 1: SẢN PHẨM / LINH KIỆN */}
      <OptGroup label={<Space><AppstoreOutlined /> <strong style={{ color: '#5570F1' }}>Linh Kiện</strong></Space>}>
        {options.products.map(p => (
          <Option 
            key={`prod-${p.Id || p.id}`} 
            value={`prod-${p.Id || p.id}`} 
            label={`${p.SKU || p.sku} ${p.Name || p.name}`} // Gộp chuỗi để tìm kiếm dễ hơn
            type="product" 
            sku={p.SKU || p.sku} // Lưu thêm SKU để chuyển hướng
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>{p.Name || p.name}</Text>
              <Tag color="blue">{p.SKU || p.sku}</Tag>
            </div>
          </Option>
        ))}
      </OptGroup>

      {/* NHÓM 2: KHÁCH HÀNG */}
      <OptGroup label={<Space><UserOutlined /> <strong style={{ color: '#52c41a' }}>Khách Hàng</strong></Space>}>
        {options.customers.map(c => (
          <Option 
            key={`cust-${c.Id || c.id}`} 
            value={`cust-${c.Id || c.id}`} 
            label={`${c.Name || c.name} ${c.Phone || c.phone}`} 
            type="customer"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>{c.Name || c.name}</Text>
              <Text type="secondary">{c.Phone || c.phone}</Text>
            </div>
          </Option>
        ))}
      </OptGroup>

      {/* NHÓM 3: PHIẾU NHẬP XUẤT */}
      <OptGroup label={<Space><FileTextOutlined /> <strong style={{ color: '#fa8c16' }}>Phiếu Nhập/Xuất</strong></Space>}>
        {options.tickets.map(t => (
          <Option 
            key={`ticket-${t.Id || t.id}`} 
            value={`ticket-${t.Id || t.id}`} 
            label={t.TicketCode || t.ticketCode} 
            type="ticket"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>{t.TicketCode || t.ticketCode}</Text>
              <Tag color={t.Type?.toLowerCase() === 'nhập' || t.type?.toLowerCase() === 'nhập' ? 'green' : 'volcano'}>
                {t.Type || t.type}
              </Tag>
            </div>
          </Option>
        ))}
      </OptGroup>
    </Select>
  );
}