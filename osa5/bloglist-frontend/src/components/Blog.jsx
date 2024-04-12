import { useState } from "react";

const Blog = ({ blog, handleUpdateBlog, handleRemoveBlog, user }) => {
  const [view, setView] = useState(false);
  const thisBlog = blog;
  const thisUser = user;

  const handleLikes = (event) => {
    event.preventDefault();
    thisBlog.likes += 1;
    handleUpdateBlog(thisBlog);
  };

  const handleRemove = (event) => {
    event.preventDefault();

    if (
      window.confirm(
        `Do you really want to remove blog: ${thisBlog.title} by: ${thisBlog.author}?`
      )
    ) {
      handleRemoveBlog(thisBlog);
    }
  };

  return (
    <div className="oneBlog">
      <h4 className="titleblog">Title: {blog.title}</h4>
      {view ? (
        <button className="Blogsbtn" onClick={() => setView(false)}>
          hide
        </button>
      ) : (
        <button
          className="Blogsbtn"
          onClick={() => setView(true)}
          data-testid="view-button"
        >
          view
        </button>
      )}
      {view && (
        <div className="moreBlog">
          <div>Author: {blog.author}</div>
          <div>Url: {blog.url}</div>
          <div className="like-count">
            Likes: {blog.likes} <button onClick={handleLikes}>Like</button>
          </div>
          <div>Creator: {blog.user.name}</div>
        </div>
      )}
      {view && blog.user.name === thisUser.name && (
        <div>
          <button className="removeBlogbtn" onClick={handleRemove}>
            remove
          </button>
        </div>
      )}
    </div>
  );
};
export default Blog;
