import React from 'react';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

const { Text } = Typography;

const Signup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => { // Made function async
    try {
      // Corrected: Change endpoint from /users/signup to /auth/signup
      const res = await fetch('https://api.sonervous.site/auth/signup', { // Backend signup endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values), // Send username, email, password
      });

      const data = await res.json();

      if (res.ok) {
        message.success(data.message || 'Registration successful! Redirecting to login...');
        form.resetFields();
        navigate('/login'); // Redirect to login page after successful registration
      } else {
        // Handle backend errors (e.g., email already registered, validation errors)
        message.error(data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error("Signup error:", error);
      message.error('An error occurred during registration.');
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-64px)]">
      <Card title="User Registration" className="w-full max-w-md shadow-lg rounded-lg">
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters long!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: 'email', message: 'The input is not valid E-mail!' },
              { required: true, message: 'Please input your E-mail!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters long!' },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Register
            </Button>
          </Form.Item>
        </Form>
        <div className="mt-4 text-center">
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-700 font-semibold">
              Log in!
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
