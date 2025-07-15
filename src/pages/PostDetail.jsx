import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, List, Button, Spin, Form, Input, message, Popconfirm, Modal } from 'antd';


const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsPageSize, setCommentsPageSize] = useState(5);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [postForm] = Form.useForm();

  const [commentCreateForm] = Form.useForm();
  const [isEditingCommentId, setIsEditingCommentId] = useState(null);
  const [editCommentModalVisible, setEditCommentModalVisible] = useState(false);
  const [currentEditingCommentContent, setCurrentEditingCommentContent] = useState('');
  const [commentEditForm] = Form.useForm();


  const fetchPost = async () => {
    try {
      const res = await fetch(`https://api.sonervous.site/posts/${postId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 404) {
          message.error('Post not found.');
          navigate('/posts');
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setPost(data);
      postForm.setFieldsValue({ title: data.title, content: data.content });
    } catch (error) {
      console.error("Error fetching post:", error);
      message.error("Failed to fetch post details.");
    }
  };

  const fetchComments = async () => {
    if (!postId) return;

    setLoadingComments(true);
    try {
      const res = await fetch(`https://api.sonervous.site/posts/${postId}/comments?page=${commentsPage}&pageSize=${commentsPageSize}`, {
        credentials: 'include',
      });
      const data = await res.json();

      let commentsArray = [];
      let currentTotal = 0;

      if (Array.isArray(data)) {
        commentsArray = data;
        currentTotal = comments.length + data.length;
        console.warn("Backend for comments returned a direct array. Ensure your backend returns an object with a 'data' property and 'total' count for proper infinite scroll functionality (routers/comment.js).", data);
        setHasMoreComments(commentsArray.length === commentsPageSize);
      } else if (data && Array.isArray(data.data)) {
        commentsArray = data.data;
        currentTotal = data.total;
        setHasMoreComments((commentsPage * commentsPageSize) < data.total);
      } else {
        console.error("Unexpected data format for comments:", data);
        setHasMoreComments(false);
        setLoadingComments(false);
        return;
      }

      setComments(prevComments => {
        if (commentsPage === 1) {
            return commentsArray;
        }
        const newUniqueComments = commentsArray.filter(
            newComment => !prevComments.some(existingComment => existingComment._id === newComment._id)
        );
        return [...prevComments, ...newUniqueComments];
      });
      setTotalComments(currentTotal);

    } catch (error) {
      console.error("Error fetching comments:", error);
      message.error("Failed to fetch comments.");
    } finally {
      setLoadingComments(false);
    }
  };


  useEffect(() => {
    fetchPost();
    setComments([]);
    setCommentsPage(1);
    setHasMoreComments(true);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [postId, commentsPage, commentsPageSize]);


  const loadMoreComments = () => {
    if (!loadingComments && hasMoreComments) {
      setCommentsPage(prevPage => prevPage + 1);
    }
  };

  const handleUpdatePost = async (values) => {
    try {
      const res = await fetch(`https://api.sonervous.site/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
        setIsEditingPost(false);
        message.success('Post updated successfully!');
      } else {
        const errorData = await res.json();
        message.error(`Failed to update post: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      message.error("Failed to update post.");
    }
  };

  const handleDeletePost = async () => {
    try {
      const res = await fetch(`https://api.sonervous.site/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 204) {
        message.success('Post deleted successfully!');
        navigate('/posts');
      } else if (res.status === 404) {
          message.error('Post not found.');
      }
      else {
        const errorData = await res.json();
        message.error(`Failed to delete post: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      message.error("Failed to delete post.");
    }
  };


  const handleCreateComment = async (values) => {
    try {
      const res = await fetch(`https://api.sonervous.site/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      if (res.ok) {
        const newComment = await res.json();
        message.success('Comment added successfully!');
        commentCreateForm.resetFields();

        // Add new comment to the beginning of the list, ensuring it's populated
        setComments(prevComments => [newComment, ...prevComments]);
        setTotalComments(prevTotal => prevTotal + 1);

      } else {
        const errorData = await res.json();
        message.error(`Failed to add comment: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      message.error("Failed to add comment.");
    }
  };

  const handleUpdateComment = async (values) => {
    try {
      const res = await fetch(`https://api.sonervous.site/posts/${postId}/comments/${isEditingCommentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      if (res.ok) {
        const updatedComment = await res.json();
        setComments(comments.map(comment =>
          comment._id === updatedComment._id ? updatedComment : comment
        ));
        setEditCommentModalVisible(false);
        setIsEditingCommentId(null);
        message.success('Comment updated successfully!');
      } else {
        const errorData = await res.json();
        message.error(`Failed to update comment: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      message.error("Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`https://api.sonervous.site/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 204) {
        message.success('Comment deleted successfully!');
        setComments(comments.filter(comment => comment._id !== commentId));
        setTotalComments(prevTotal => prevTotal - 1);
      } else if (res.status === 404) {
          message.error('Comment not found.');
      } else {
        const errorData = await res.json();
        message.error(`Failed to delete comment: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error("Failed to delete comment.");
    }
  };


  const loadMoreButton = hasMoreComments ? (
    <div className="text-center mt-3 h-8 leading-8">
      {loadingComments ? <Spin /> : <Button onClick={loadMoreComments} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Load More</Button>}
    </div>
  ) : (
    <div className="text-center mt-3 h-8 leading-8 text-gray-500">
      No more comments
    </div>
  );

  if (!post) return <p className="text-center text-xl mt-10">Loading post...</p>;

  return (
    <div className="container mx-auto p-6">
      {!isEditingPost ? (
        <Card
          title={post.title}
          className="mb-8 shadow-lg rounded-lg"
          extra={
            <div className="flex gap-2">
              <Button type="primary" onClick={() => setIsEditingPost(true)}>Edit Post</Button>
              <Popconfirm
                  title="Are you sure to delete this post?"
                  onConfirm={handleDeletePost}
                  okText="Yes"
                  cancelText="No"
              >
                  <Button danger>Delete Post</Button>
              </Popconfirm>
            </div>
          }
        >
          {/* Display Post Author */}
          <p className="text-gray-600 text-sm mb-2">
            <b>Author:</b> {post.author ? post.author.username : 'Anonymous'}
          </p>
          <p className="text-gray-800 text-lg leading-relaxed">{post.content}</p>
        </Card>
      ) : (
        <Card title="Edit Post" className="mb-8 shadow-lg rounded-lg">
          <Form
            form={postForm}
            layout="vertical"
            onFinish={handleUpdatePost}
            initialValues={{ title: post.title, content: post.content }}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please input the title!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="content"
              label="Content"
              rules={[{ required: true, message: 'Please input the content!' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="mr-2">
                Save Changes
              </Button>
              <Button onClick={() => setIsEditingPost(false)}>Cancel</Button>
            </Form.Item>
          </Form>
        </Card>
      )}


      <Typography.Title level={4} className="mb-6 text-gray-800">Comments</Typography.Title>

      <Card title="Add a Comment" className="mb-6 shadow-md">
        <Form
          form={commentCreateForm}
          layout="vertical"
          onFinish={handleCreateComment}
        >
          <Form.Item
            name="content"
            label="Your Comment"
            rules={[{ required: true, message: 'Please input your comment!' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Comment
            </Button>
          </Form.Item>
        </Form>
      </Card>


      <List
        bordered
        dataSource={comments}
        renderItem={item => (
          <List.Item
            key={item._id}
            className="bg-gray-50 p-4 mb-2 rounded-md shadow-sm"
            actions={[
              <Button type="link" onClick={() => {
                setIsEditingCommentId(item._id);
                setCurrentEditingCommentContent(item.content);
                setEditCommentModalVisible(true);
                commentEditForm.setFieldsValue({ content: item.content });
              }}>
                Edit
              </Button>,
              <Popconfirm
                title="Are you sure to delete this comment?"
                onConfirm={() => handleDeleteComment(item._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="link" danger>Delete</Button>
              </Popconfirm>,
            ]}
          >
            <div>
              {/* Display Comment Author */}
              <Typography.Text strong className="text-gray-700">
                {item.author ? item.author.username : 'Anonymous'}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: '0.8em', marginLeft: '8px' }}>
                {new Date(item.createdAt).toLocaleString()}
              </Typography.Text>
              <br />
              <Typography.Text className="text-gray-800 text-base">{item.content}</Typography.Text>
            </div>
          </List.Item>
        )}
        loadMore={loadMoreButton}
        className="bg-white rounded-lg shadow-md"
      />

      <Modal
        title="Edit Comment"
        visible={editCommentModalVisible}
        onCancel={() => setEditCommentModalVisible(false)}
        footer={null}
      >
        <Form
          form={commentEditForm}
          onFinish={handleUpdateComment}
        >
          <Form.Item
            name="content"
            rules={[{ required: true, message: 'Please input comment content!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="mr-2">
              Save Changes
            </Button>
            <Button onClick={() => setEditCommentModalVisible(false)}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostDetail;
