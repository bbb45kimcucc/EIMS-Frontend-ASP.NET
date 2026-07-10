import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, DatePicker, Tag, Space, Button, message, Popconfirm, Alert } from 'antd';
import { DollarOutlined, PrinterOutlined, CalculatorOutlined, CheckCircleOutlined, SecurityScanOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import axios from 'axios';

const { Title, Text } = Typography;

export default function PayrollTable() {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  // ĐỒNG BỘ USER: Lấy quyền và ID từ localStorage
  const storedUser = localStorage.getItem('user');
  const currentUser = (storedUser && storedUser !== "undefined" && storedUser !== "null") ? JSON.parse(storedUser) : {};

  // Kiểm tra quyền Sếp một cách cẩn thận nhất
  const isAdmin = currentUser.Role === 'Admin' || currentUser.role === 'Admin' || currentUser.Role === 'ADMIN';

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'User-Role': currentUser.Role || currentUser.role || 'Staff',
      'User-Id': currentUser.Id || currentUser.id || ''
    }
  };

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const month = selectedMonth.month() + 1;
      const year = selectedMonth.year();
      const response = await axios.get(`/api/Payrolls?month=${month}&year=${year}`, axiosConfig);

      let finalData = response.data;

      // Khóa an toàn 2 lớp ở React
      if (!isAdmin) {
        const myUserId = currentUser.Id || currentUser.id;
        finalData = finalData.filter(item => item.userId === myUserId);
      }

      setPayrollData(finalData);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Lỗi mất kết nối với Backend!";
      message.error(`Lỗi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth]);

  const handleCalculatePayroll = async () => {
    try {
      setLoading(true);
      const month = selectedMonth.month() + 1;
      const year = selectedMonth.year();
      await axios.post(`/api/Payrolls/calculate?month=${month}&year=${year}`, {}, axiosConfig);
      message.success(`Đã tính lương thành công cho tháng ${month}/${year}!`);
      fetchPayrolls();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Lỗi mất kết nối với Backend!";
      message.error(`Lỗi Tính Lương: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySalary = async (id) => {
    try {
      // 1. Gọi API chốt lương
      const response = await axios.put(`/api/Payrolls/${id}/pay`, {}, axiosConfig);

      // 2. HIỆN THÔNG BÁO THÀNH CÔNG (lấy từ message của backend)
      message.success(response.data.message);

      // 3. Tải lại bảng để trạng thái chuyển thành "Đã Thanh Toán"
      fetchPayrolls();
    } catch (error) {
      // 4. HIỆN THÔNG BÁO LỖI (nếu có lỗi từ backend hoặc không gửi được mail)
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || "Lỗi khi thanh toán!";
      message.error(errorMsg);
    }
  };
  const handleExportExcel = () => {
    // 1. Chuẩn bị dữ liệu để xuất (Lọc các cột cần thiết)
    const exportData = payrollData.map(item => ({
      "Nhân Viên": item.user?.fullName || "Chưa rõ",
      "Lương Cứng (đ)": item.baseSalary,
      "Ngày nghỉ không lương": item.unpaidLeaveDays,
      "Tiền bị trừ (đ)": item.totalDeductions,
      "Lương thực nhận (VNĐ)": item.netSalary,
      "Trạng thái": item.status === 'Paid' ? 'Đã Thanh Toán' : 'Bản Nháp'
    }));

    // 2. Tạo Workbook và Worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BangLuong");

    // 3. Tải file về
    XLSX.writeFile(workbook, `BangLuong_Thang${selectedMonth.month() + 1}_${selectedMonth.year()}.xlsx`);
    message.success("Đã xuất file Excel thành công!");
  };

  const columns = [
    {
      title: 'Nhân Viên',
      dataIndex: 'user',
      render: (user) => <Text strong>{user?.fullName || user?.FullName || 'Chưa rõ'}</Text>
    },
    {
      title: 'Lương Cứng',
      dataIndex: 'baseSalary',
      align: 'right',
      render: val => <Text>{val?.toLocaleString('vi-VN')} đ</Text>
    },
    {
      title: 'Nghỉ Không Lương',
      dataIndex: 'unpaidLeaveDays',
      align: 'center',
      render: val => <Tag color={val > 0 ? "error" : "success"}>{val} ngày</Tag>
    },
    {
      title: 'Tiền Bị Trừ',
      dataIndex: 'totalDeductions',
      align: 'right',
      render: val => <Text type="danger">-{val?.toLocaleString('vi-VN')} đ</Text>
    },
    {
      title: 'Lương Thực Nhận',
      dataIndex: 'netSalary',
      align: 'right',
      render: val => (
        <Text type="success" strong style={{ fontSize: '16px' }}>
          {val?.toLocaleString('vi-VN')} VNĐ
        </Text>
      )
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      align: 'center',
      render: (status) => (
        <Tag color={status === 'Paid' ? 'green' : 'gold'} className="font-bold">
          {status === 'Paid' ? 'Đã Thanh Toán' : 'Bản Nháp'}
        </Tag>
      )
    },
    {
      title: 'Hành Động',
      align: 'center',
      render: (_, record) => {
        // Nút chốt lương chỉ Sếp mới được thấy
        if (!isAdmin) {
          return <Text type="secondary" italic>Chỉ xem</Text>;
        }

        return record.status === 'Draft' || record.status === 'Nháp' ? (
          <Popconfirm title="Xác nhận đã chuyển khoản cho nhân viên này?" onConfirm={() => handlePaySalary(record.id || record.Id)} okText="Có" cancelText="Hủy">
            <Button size="small" type="primary" icon={<CheckCircleOutlined />}>Chốt Lương</Button>
          </Popconfirm>
        ) : (
          <Text type="secondary" italic>Hoàn tất</Text>
        );
      }
    }
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      {/* 🌟 BANNER HIỂN THỊ QUYỀN LỰC */}
      {isAdmin ? (
        <Alert
          message="Chế độ Quản trị (Admin)"
          description="Bạn đang có quyền Tính lương, Chốt lương và Xem dữ liệu của toàn bộ nhân viên trong công ty."
          type="info"
          showIcon
          icon={<SecurityScanOutlined />}
          style={{ marginBottom: 16, borderLeft: '6px solid #1677ff' }}
        />
      ) : (
        <Alert
          message="Chế độ Nhân viên (Staff)"
          description="Bạn đang xem dữ liệu bảo mật. Bạn chỉ có thể xem Bảng lương cá nhân của chính mình."
          type="warning"
          showIcon
          icon={<UserOutlined />}
          style={{ marginBottom: 16, borderLeft: '6px solid #faad14' }}
        />
      )}

      <Card style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Space>
            <DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <Title level={4} style={{ margin: 0 }}>Bảng Tính Lương ERP</Title>
          </Space>
          <Space>
            <DatePicker picker="month" value={selectedMonth} onChange={setSelectedMonth} format="MM/YYYY" allowClear={false} />

            {/* Nút Tính lương bị giấu đi nếu là Staff */}
            {isAdmin && (
              <Button type="primary" icon={<CalculatorOutlined />} onClick={handleCalculatePayroll} style={{ background: '#5570F1' }}>
                Tính Lương Tự Động
              </Button>
            )}

            <Button
              icon={<PrinterOutlined />}
              onClick={handleExportExcel} // Gọi hàm xuất tại đây
              style={{ borderColor: '#52c41a', color: '#52c41a' }}
            >
              Xuất File
            </Button>          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={payrollData}
          rowKey={(record) => record.id || record.Id}
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
}