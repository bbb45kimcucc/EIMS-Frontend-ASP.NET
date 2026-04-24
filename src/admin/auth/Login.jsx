import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function Login() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

 const onFinish = async (values) => {
    setLoading(true);
    try {
        const res = await axios.post('https://localhost:7033/api/Users/login', values);
        
        // 1. Lấy cục dữ liệu user từ Backend trả về
        const userData = res.data.data; 

        // 2. Xác định danh xưng dựa trên Role (Admin hoặc Staff)
        const roleName = (userData.Role === "Admin") ? "Admin" : "Nhân viên";
        const fullName = userData.FullName || "bạn";

        // 3. Hiển thị lời chào cá nhân hóa
        message.success(`Chào mừng ${roleName} ${fullName} quay trở lại!`);

        // 4. Lưu vào localStorage và chuyển trang
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/'); 
        
    } catch (error) {
        // Nếu sai mật khẩu hoặc tài khoản, Backend sẽ trả về câu "Sai tài khoản hoặc mật khẩu rồi Cúc ơi!"
        message.error(error.response?.data?.message || "Đăng nhập thất bại!");
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