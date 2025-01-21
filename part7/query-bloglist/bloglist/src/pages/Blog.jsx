import React from "react";
import { useNavigate } from "react-router-dom";
import blogService from "../services/blogs";
import { useCommentBlogMutation } from "../client";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

const Blog = ({ blog, likeBlog, deleteBlog }) => {
  const navigate = useNavigate();
  const commentBlogMutation = useCommentBlogMutation();

  const handleLike = async () => {
    const updatedBlog = { ...blog, likes: blog.likes + 1 };

    await likeBlog(updatedBlog);
  };

  const owner = () => {
    const loggedUserJSON = JSON.parse(
      window.localStorage.getItem("loggedBloglistappUser")
    );
    return loggedUserJSON.username === blog.user?.username;
  };

  const handleDelete = async () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      await deleteBlog(blog.id);
      navigate("/");
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    await commentBlogMutation.mutateAsync({
      id: blog.id,
      comment: event.target.comment.value,
    });
    event.target.comment.value = "";
  };

  if (!blog) return null;

  return (
    <>
      <Typography variant="h4">{blog.title}</Typography>
      <Typography variant="body1">
        {blog.url}
        <br />
        likes {blog.likes}{" "}
        <Button variant="contained" type="button" onClick={handleLike}>
          like
        </Button>
        <br />
        added by {blog.author}
        <br />
        {owner() && (
          <Button
            variant="contained"
            color="error"
            type="button"
            onClick={handleDelete}
          >
            remove
          </Button>
        )}
      </Typography>
      <div>
        <Typography variant="h5">comments</Typography>
        <Box
          component="form"
          sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
          onSubmit={handleComment}
        >
          <div>
            <TextField label="comment" type="text" name="comment" />
          </div>
          <Button variant="contained" type="submit">
            add comment
          </Button>
        </Box>
        <List component={Paper}>
          {blog.comments.map((comment, $index) => (
            <ListItem key={$index}>
              <ListItemText primary={comment} />
            </ListItem>
          ))}
        </List>
      </div>
    </>
  );
};

export default Blog;
