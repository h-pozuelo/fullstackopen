import { createSlice, current } from "@reduxjs/toolkit";
import blogService from "../services/blogs";

// const blogReducer = (state = [], action) => {
//   switch (action.type) {
//     case "SET_BLOGS": {
//       const blogs = action.payload;
//       return blogs;
//     }
//     case "CREATE_BLOG": {
//       const newBlog = action.payload;
//       return state.concat(newBlog);
//     }
//     case "LIKE_BLOG": {
//       const id = action.payload;
//       const blogToLike = state.find((blog) => blog.id === id);
//       const likedBlog = { ...blogToLike, likes: blogToLike.likes + 1 };
//       return state.map((blog) => (blog.id !== id ? blog : likedBlog));
//     }
//     case "DELETE_BLOG": {
//       const id = action.payload;
//       return state.filter((blog) => blog.id !== id);
//     }
//     default:
//       return state;
//   }
// };

// export const setBlogs = (blogs) => ({ type: "SET_BLOGS", payload: blogs });

// export const createBlog = (newBlog) => ({
//   type: "CREATE_BLOG",
//   payload: newBlog,
// });

// export const likeBlog = (id) => ({ type: "LIKE_BLOG", payload: id });

// export const deleteBlog = (id) => ({ type: "DELETE_BLOG", payload: id });

const blogSlice = createSlice({
  name: "blogs",
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      const blogs = action.payload;
      return blogs;
    },
    createBlog(state, action) {
      console.log(action.payload);
      const newBlog = action.payload;
      return state.concat(newBlog); // "Redux-toolkit" contiene la librería "Immer" que nos permite mutar el estado de objetos no primitivos. Cuando realicemos un ".push()" se producirá un estado inmutable a partir del estado mutado (no hace falta retornarlo). (mutar no es lo mismo que re-definir variables)
    },
    likeBlog(state, action) {
      const id = action.payload;
      const blogToLike = state.find((blog) => blog.id === id);
      const likedBlog = { ...blogToLike, likes: blogToLike.likes + 1 };
      console.log(current(state)); // Con "current()" podemos imprimir el estado actual de un tipo no primitivo.
      return state.map((blog) => (blog.id !== id ? blog : likedBlog));
    },
    deleteBlog(state, action) {
      const id = action.payload;
      return state.filter((blog) => blog.id !== id);
    },
  },
});

// export const { setBlogs, createBlog, likeBlog, deleteBlog } = blogSlice.actions;

export const setBlogs = () => async (dispatch, getState) => {
  const blogs = await blogService.getAllBlogs();
  dispatch({ type: "blogs/setBlogs", payload: blogs });
};

export const createBlog = (newBlog) => async (dispatch, getState) => {
  const returnedBlog = await blogService.createBlog(newBlog);
  dispatch({ type: "blogs/createBlog", payload: returnedBlog });
};

export const likeBlog = (updatedBlog) => async (dispatch, getState) => {
  const returnedBlog = await blogService.updateBlog(
    updatedBlog.id,
    updatedBlog
  );
  dispatch({ type: "blogs/likeBlog", payload: returnedBlog.id });
};

export const deleteBlog = (id) => async (dispatch, getState) => {
  await blogService.deleteBlog(id);
  dispatch({ type: "blogs/deleteBlog", payload: id });
};

export default blogSlice.reducer;
