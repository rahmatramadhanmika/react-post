// Login.jsx
import React from 'react';
import { Form, Input, Button, message, Card, Typography, Divider } from 'antd'; // Added Divider
import { Link, useNavigate } from 'react-router-dom'; // Corrected import syntax
import { GoogleOutlined } from '@ant-design/icons'; // Import Google icon

const { Text } = Typography;

// Login component now accepts onLoginSuccess prop
const Login = ({ onLoginSuccess }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        message.success(data.message || 'Login successful!');
        form.resetFields();
        onLoginSuccess(data.user);
        navigate('/posts');
      } else {
        message.error(data.message || 'Login failed: Invalid credentials.');
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error('An error occurred during login.');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect the user to your backend's Google OAuth initiation endpoint
    window.location.href = 'http://localhost:3000/auth/login/google';
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-64px)]">
      <Card title="User Login" className="w-full max-w-md shadow-lg rounded-lg">
        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your Email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Log in
            </Button>
          </Form.Item>
        </Form>

        <Divider>OR</Divider> {/* Add a divider for better UI */}

        <Button
          type="default"
          className="w-full flex items-center justify-center"
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
        >
          Login with Google
        </Button>

        <div className="mt-4 text-center">
          <Text type="secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:text-blue-700 font-semibold">
              Sign up now!
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
