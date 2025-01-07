import React, { useState } from "react";

const Blog = ({ blog, likeBlog, deleteBlog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  const [show, setShow] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("view");

  const showWhenVisible = { display: show ? "" : "none" };

  const toggleShow = () => {
    setShow(!show);
    // Como los cambios al estado no se aplican hasta re-renderizar el componente debemos tener en cuenta que el valor de "show" es el anterior a ejecutar "setShow(!show)".
    setButtonLabel(show ? "view" : "hide");
  };

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
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`))
      await deleteBlog(blog.id);
  };

  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}{" "}
        <button type="button" onClick={toggleShow}>
          {buttonLabel}
        </button>
      </div>
      <div className="hidden" style={showWhenVisible}>
        {blog.url}
        <br />
        likes {blog.likes}{" "}
        <button type="button" onClick={handleLike}>
          like
        </button>
        <br />
        {blog.author}
        <br />
        {owner() && (
          <button type="button" onClick={handleDelete}>
            remove
          </button>
        )}
      </div>
    </div>
  );
};

export default Blog;
