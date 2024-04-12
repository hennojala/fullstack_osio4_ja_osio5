import { useState, useEffect, useRef } from "react";
import BlogForm from "./components/BlogForm";
import Blog from "./components/Blog";
import LoginForm from "./components/LoginForm";
import Togglable from "./components/Togglable";
import Notification from "./components/Notification";
import blogService from "./services/blogs";
import "./style.css";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [errormessage, setErrorMessage] = useState(null);
  const [confirmmessage, setConfirmMessage] = useState(null);
  const blogFormRef = useRef();

  useEffect(() => {
    blogService.getAll().then((blogs) => {
      const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes);
      setBlogs(sortedBlogs);
    });
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogappUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const handleLogin = (user) => {
    setUser(user);
    window.localStorage.setItem("loggedBlogappUser", JSON.stringify(user));
    blogService.setToken(user.token);
    setConfirmMessage(`Welcome ${user.name}!`);
    setTimeout(() => {
      setConfirmMessage(null);
    }, 5000);
  };

  const handleNewBlog = async (newBlog) => {
    newBlog.userId = user.user.id;
    newBlog.name = user.name;
    try {
      const createdBlog = await blogService.create(newBlog);

      blogFormRef.current.toggleVisibility();
      setBlogs([...blogs, createdBlog]);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setConfirmMessage(
        `a new blog: ${newBlog.title} by: ${newBlog.author} added succesfully.`
      );

      setTimeout(() => {
        setConfirmMessage(null);
      }, 5000);
    } catch (exception) {
      console.log(exception);
      setErrorMessage(`Something went wrong during the new blog adding.`);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const handleUpdateBlog = async (updateBlog) => {
    try {
      const updatedBlog = await blogService.update(updateBlog.id, updateBlog);
      updatedBlog.user = updateBlog.user;
      const updatedBlogs = blogs.map((blog) => {
        if (blog.id === updatedBlog.id) {
          return updatedBlog;
        }
        return blog;
      });

      const sortedBlogs = updatedBlogs.sort((a, b) => b.likes - a.likes);
      setBlogs(sortedBlogs);

      setConfirmMessage(
        `a blog updated succesfully: ${updateBlog.title} by: ${updateBlog.author}`
      );
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setTimeout(() => {
        setConfirmMessage(null);
      }, 5000);
    } catch (exception) {
      console.log(exception);
      setErrorMessage(`Something went wrong during the blog updating.`);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const handleRemoveBlog = async (removeBlog) => {
    try {
      await blogService.remove(removeBlog.id);

      const updatedBlogs = blogs.filter((blog) => blog.id !== removeBlog.id);
      setBlogs(updatedBlogs);

      const sortedBlogs = updatedBlogs.sort((a, b) => b.likes - a.likes);

      setBlogs(sortedBlogs);

      setConfirmMessage(
        `a blog deleted succesfully: ${removeBlog.title} by: ${removeBlog.author}.`
      );
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        setConfirmMessage(null);
      }, 5000);
    } catch (exception) {
      console.log(exception);
      setErrorMessage(`Something went wrong during the blog deletion.`);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const logOut = () => {
    setUser(null);
    window.localStorage.clear();
    window.localStorage.removeItem("loggedBlogappUser");
    window.location.reload();
  };

  return (
    <div>
      <Notification
        errormessage={errormessage}
        confirmmessage={confirmmessage}
        message={errormessage || confirmmessage}
      />
      {!user ? (
        <LoginForm
          handleLogin={handleLogin}
          errormessage={errormessage}
          setErrorMessage={setErrorMessage}
        />
      ) : (
        <div>
          <h2>Blogs</h2>
          <p>
            {user.name} logged in
            <button type="submit" onClick={logOut}>
              logout
            </button>
          </p>

          <Togglable buttonLabel="New blog" ref={blogFormRef}>
            <BlogForm handleNewBlog={handleNewBlog} />
          </Togglable>
          <br></br>

          <h3>Blogs: </h3>
          {blogs.map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              handleUpdateBlog={handleUpdateBlog}
              handleRemoveBlog={handleRemoveBlog}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default App;
