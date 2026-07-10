import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

const { Title, Text } = Typography;

export default function Login() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

const onFinish = async (values) => {
    setLoading(true);
    try {
        const res = await axios.post('/api/Users/login', values);

        const userData = res.data.data;
        console.log(userData);

        const roleName = (userData.role === "Admin")
            ? "Quản trị viên"
            : userData.role === "Sales"
            ? "Nhân viên bán hàng"
            : userData.role === "Warehouse"
            ? "Nhân viên kho"
            : userData.role === "HR"
            ? "Nhân viên nhân sự"
            : "Nhân viên";

        message.success(
            `Chào mừng ${roleName} ${userData.fullName} quay trở lại!`
        );

        // Lưu thông tin đăng nhập
        localStorage.setItem("user", JSON.stringify(userData));

        // Lưu riêng Role
        localStorage.setItem("role", userData.role);

        // Lưu Id
        localStorage.setItem("userId", userData.id);

        navigate("/");

    } catch (error) {
        message.error(
            error.response?.data?.message || "Đăng nhập thất bại!"
        );
    } finally {
        setLoading(false);
    }
};

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
            <Card style={{ width: 400, borderRadius: '15px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <Title level={2} style={{ color: '#5570F1', margin: 0 }}>Metrix</Title>
                    <Text type="secondary">Hệ thống quản lý kho điện tử</Text>
                </div>

                <Form name="login" onFinish={onFinish} layout="vertical">
                    <Form.Item name="email" rules={[{ required: true, message: 'Nhập email nha Cúc!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: 'Chưa nhập mật khẩu kìa!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ background: '#5570F1', height: '45px', borderRadius: '8px' }}>
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}