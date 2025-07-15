import {useEffect, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { Pagination, Button, Form, Input, message, Popconfirm, Card, Modal } from 'antd';


const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [total, setTotal] = useState(0);
    const [form] = Form.useForm();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const navigate = useNavigate();

    const fetchPosts = async () => {
        try {
            let url = `http://localhost:3000/posts?page=${page}&pageSize=${pageSize}`;
            if (searchKeyword) {
                url += `&keyword=${encodeURIComponent(searchKeyword)}`;
            }
            const res = await fetch(url, {
                credentials: 'include',
            });
            const data = await res.json();
            if (res.ok) {
                setPosts(data.data);
                setTotal(data.total);
            } else {
                message.error(`Failed to fetch posts: ${data.message || res.statusText}`);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            message.error("Failed to fetch posts.");
        }
    };

    useEffect(()=> {
        fetchPosts();
    },[page, pageSize, searchKeyword]);

    const handleCreatePost = async (values) => {
        try {
            const res = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
                credentials: 'include',
            });
            if (res.ok) {
                // const newPost = await res.json(); // No longer need newPost object if not redirecting
                message.success('Post created successfully!'); // Changed message
                form.resetFields();
                setIsModalVisible(false);
                setSearchKeyword(''); // Clear search keyword
                setPage(1); // Reset to page 1 to ensure new post is visible

                // Re-fetch posts to show the new post on page 1
                fetchPosts();
            } else {
                const errorData = await res.json();
                message.error(`Failed to create post: ${errorData.message || res.statusText}`);
            }
        } catch (error) {
            console.error("Error creating post:", error);
            message.error("Failed to create post.");
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const res = await fetch(`http://localhost:3000/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.status === 204) {
                message.success('Post deleted successfully!');
                setPage(1);
                fetchPosts();
            } else if (res.status === 404) {
                message.error('Post not found.');
            } else {
                const errorData = await res.json();
                message.error(`Failed to delete post: ${errorData.message || res.statusText}`);
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            message.error("Failed to delete post.");
        }
    };

    const handleSearchChange = (e) => {
        setSearchKeyword(e.target.value);
    };

    const onSearchSubmit = (value) => {
        setSearchKeyword(value);
        setPage(1); // Crucial: Reset to page 1 when a new search is performed
    };

    return(
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">All Posts</h1>

            <div className="mb-6 flex flex-col items-center">
                <Button type="primary" size="large" onClick={() => setIsModalVisible(true)} className="mb-4 w-full md:w-1/3">
                    Add New Post
                </Button>
                <div className="w-full md:w-2/3">
                    <Input.Search
                        placeholder="Search posts by title or content"
                        allowClear
                        enterButton="Search"
                        size="large"
                        value={searchKeyword}
                        onChange={handleSearchChange}
                        onSearch={onSearchSubmit}
                    />
                </div>
            </div>

            <Modal
                title="Create New Post"
                visible={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreatePost}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please input the title!' }]}
                    >
                        <Input placeholder="Post Title" />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="Content"
                        rules={[{ required: true, message: 'Please input the content!' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Post Content" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="mr-2">
                            Create Post
                        </Button>
                        <Button onClick={() => {
                            setIsModalVisible(false);
                            form.resetFields();
                        }}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                {posts.map((item)=>(
                    <div key={item._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
                        <div>
                            <Link to={`/posts/${item._id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                                {`${item.title}`}
                            </Link>
                            <p className="text-gray-700 text-sm mt-2">{item.content ? item.content.substring(0, 100) + '...' : ''}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Link to={`/posts/${item._id}`} className="text-blue-500 hover:text-blue-700 font-semibold">
                                View Details
                            </Link>
                            <Popconfirm
                                title="Are you sure to delete this post?"
                                onConfirm={() => handleDeletePost(item._id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button type="link" danger className="p-0 h-auto text-red-500 hover:text-red-700 font-semibold">
                                    Delete
                                </Button>
                            </Popconfirm>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-6">
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={(newPage, newPageSize) => {
                        setPage(newPage);
                        setPageSize(newPageSize);
                    }}
                />
            </div>
        </div>
    )
}

export default PostList
