import React, { useState } from "react";
import PropTypes from "prop-types";

const BlogForm = ({ handleNewBlog }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    handleNewBlog({ title, author, url });
    setTitle("");
    setAuthor("");
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="blog-form">
        <br />
        <h3>Create a new blog:</h3>

        <label htmlFor="title">Title:</label>
        <input
        data-testid='title'
          type="text"
          value={title}
          name="Title"
          id="title"
          onChange={(event) => setTitle(event.target.value)}
        />

        <label htmlFor="author">Author:</label>
        <input
        data-testid='author'
          type="text"
          value={author}
          name="Author"
          id="author"
          onChange={(event) => setAuthor(event.target.value)}
        />
<br></br>
        <label htmlFor="url">Url:</label>
        <input
        data-testid='url'
          type="text"
          value={url}
          name="Url"
          id="url"
          onChange={(event) => setUrl(event.target.value)}
        />
        <button type="submit">Create</button>
      </div>
    </form>
  );
};

BlogForm.propTypes = {
  handleNewBlog: PropTypes.func.isRequired,
};

export default BlogForm;
