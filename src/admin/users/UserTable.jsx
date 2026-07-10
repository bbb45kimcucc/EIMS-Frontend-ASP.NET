import React from 'react';
import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined
} from '@ant-design/icons';

export default function UserTable({
  data,
  loading,
  onEdit,
  onDelete
}) {
  const columns = [
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      width: '15%',
      render: (text) => (
        <strong>
          <UserOutlined
            style={{
              marginRight: 5,
              color: '#8c8c8c'
            }}
          />
          {text}
        </strong>
      )
    },

    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      width: '20%'
    },

    {
      title: 'Email',
      dataIndex: 'email',
      width: '20%',
      render: (text) => (
        <>
          <MailOutlined
            style={{
              marginRight: 5,
              color: '#8c8c8c'
            }}
          />
          {text}
        </>
      )
    },

    {
      title: 'SĐT',
      dataIndex: 'phone',
      width: '12%'
    },

    {
      title: 'Phòng ban',
      dataIndex: 'department',
      width: '12%'
    },

    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: '12%',
      render: (value) => (
        <Tag color={value ? 'green' : 'red'}>
          {value ? 'Hoạt động' : 'Tạm khóa'}
        </Tag>
      )
    },

    {
      title: 'Chức vụ',
      dataIndex: 'role',
      width: '15%',
      render: (role) => {
        const colors = {
          Admin: 'volcano',
          Sales: 'green',
          Warehouse: 'blue',
          HR: 'purple'
        };

        const names = {
          Admin: 'Quản trị viên',
          Sales: 'Nhân viên bán hàng',
          Warehouse: 'Nhân viên kho',
          HR: 'Nhân viên nhân sự'
        };

        return (
          <Tag
            color={colors[role] || 'default'}
            style={{
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            {names[role] || role}
          </Tag>
        );
      }
    },

    {
      title: 'Hành động',
      width: '14%',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#5570F1' }}
            onClick={() => onEdit(record)}
          />

          {record.role !== 'Admin' && (
            <Popconfirm
              title="Xóa nhân viên này?"
              onConfirm={() => onDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 8
      }}
    />
  );
}