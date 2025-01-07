import axios from "axios";
const baseUrl = "/api/blogs";

let token = null;

const setToken = (newToken) => (token = `Bearer ${newToken}`);

const getAllBlogs = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const getBlog = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`);
  return response.data;
};

const createBlog = async (newObject) => {
  const response = await axios.post(baseUrl, newObject, {
    headers: { Authorization: token },
  });
  return response.data;
};

const updateBlog = async (id, newObject) => {
  const response = await axios.put(`${baseUrl}/${id}`, newObject, {
    headers: { Authorization: token },
  });
  return response.data;
};

const deleteBlog = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`, {
    headers: { Authorization: token },
  });
  return response.data;
};

export default {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  setToken,
};
