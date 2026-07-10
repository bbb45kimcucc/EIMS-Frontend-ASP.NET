import React from 'react';
import { Table, Space, Button, Tag, Typography } from 'antd';
import { PrinterOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;

export default function TicketTable({ dataSource, loading, onPrint, onDelete }) {
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
    // Chú ý: Đảm bảo API của bạn trả về dataIndex đúng tên như dưới đây
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
          <Button type="text" style={{ color: '#fa8c16' }} icon={<PrinterOutlined />} onClick={() => onPrint(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(record)} />
        </Space>
      ),
    }
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={dataSource} 
      pagination={{ pageSize: 8 }} 
      loading={loading}
      // Khai báo khóa chính cho từng dòng để chống văng lỗi vàng trong Console
      rowKey={(record) => record.Id || record.id || record.ticketCode} 
    />
  );
}