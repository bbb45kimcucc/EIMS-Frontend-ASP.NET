import React from 'react';
import { Table, Space, Button, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, HomeOutlined, EyeOutlined } from '@ant-design/icons';

export default function SupplierTable({ dataSource, loading, onEdit, onDelete, onShowHistory }) {
  const columns = [
    { title: 'Tên Nhà Cung Cấp', dataIndex: 'name', width: '25%', render: text => <strong>{text}</strong> },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      width: '15%',
      render: text => text ? <><PhoneOutlined style={{ color: '#5570F1', marginRight: 5 }} />{text}</> : '-'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '20%',
      render: text => text ? <><MailOutlined style={{ color: '#5570F1', marginRight: 5 }} />{text}</> : '-'
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      width: '25%',
      render: text => text ? <><HomeOutlined style={{ color: '#8c8c8c', marginRight: 5 }} />{text}</> : '-'
    },
    {
      title: 'Hành động',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem lịch sử nhập hàng">
             <Button type="text" icon={<EyeOutlined />} style={{ color: '#52c41a' }} onClick={() => onShowHistory(record)} />
          </Tooltip>
          <Button type="text" icon={<EditOutlined />} style={{ color: '#5570F1' }} onClick={() => onEdit(record)} />
          <Popconfirm title="Xóa nhà cung cấp này?" onConfirm={() => onDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <style>{`
        .custom-hover-table .ant-table-tbody > tr.ant-table-row:hover > td,
        .custom-hover-table .ant-table-tbody > tr:hover > td {
          background-color: #f0f5ff !important; 
          transition: background-color 0.3s ease;
        }
        .custom-hover-table .ant-table-tbody > tr.ant-table-row {
          cursor: pointer; 
        }
      `}</style>
      <Table 
        className="custom-hover-table"
        columns={columns} 
        dataSource={dataSource} 
        pagination={{ pageSize: 6 }} 
        loading={loading} 
      />
    </>
  );
}