import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Blog from "./Blog";
import BlogForm from "./BlogForm";

//Test data: blog
const testBlog = {
  title: "testTitle",
  author: "testAuthor",
  url: "testUrl",
  likes: 10,
  user: {
    username: "testUserName",
    name: "testName",
    password: "testPassword",
  },
};

//Test data: user
const testUser = {
  username: "testUserName",
  name: "testName",
  password: "testPassword",
};

test("renders Title-content", () => {
  render(<Blog blog={testBlog} user={testUser} />);

  const element = screen.getByText("Title: testTitle");
  expect(element).toBeDefined();
});

test("Click View -renders more content", async () => {
  render(<Blog blog={testBlog} user={testUser} />);

  const titleElement = screen.getByText(`Title: ${testBlog.title}`);
  expect(titleElement).toBeInTheDocument();
  screen.debug();

  const user = userEvent.setup();
  const viewButton = screen.getByTestId("view-button");

  await user.click(viewButton);
  const authorElement = screen.getByText(`Author: ${testBlog.author}`);
  const urlElement = screen.getByText(`Url: ${testBlog.url}`);
  const likesElement = screen.getByText(`Likes: ${testBlog.likes}`);
  const creatorElement = screen.getByText(`Creator: ${testBlog.user.name}`);

  screen.debug();

  expect(authorElement).toBeDefined();
  expect(urlElement).toBeDefined();
  expect(likesElement).toBeDefined();
  expect(creatorElement).toBeDefined();
});

test("Click Like -button two times", async () => {
  const mockHandler = vi.fn();

  render(
    <Blog blog={testBlog} user={testUser} handleUpdateBlog={mockHandler} />
  );

  // first, click view -> show to more content, because we want see the like -button
  const user = userEvent.setup();
  const viewButton = screen.getByTestId("view-button");
  await user.click(viewButton);

  screen.debug();
  const user1 = userEvent.setup();

  const likeButton = screen.getByText("Like");
  expect(likeButton).toBeDefined();
  //click two times
  await user1.click(likeButton);
  await user1.click(likeButton);
  expect(mockHandler.mock.calls).toHaveLength(2);
});

test("calls handleNewBlog with correct data when creating a new blog", async () => {
  const mockHandleNewBlog = vi.fn();

  render(<BlogForm handleNewBlog={mockHandleNewBlog} />);

  // Fill in the form fields
  const titleInput = screen.getByLabelText("Title:");
  const authorInput = screen.getByLabelText("Author:");
  const urlInput = screen.getByLabelText("Url:");

  // use fireEvents
  fireEvent.change(titleInput, { target: { value: "Test Title" } });
  fireEvent.change(authorInput, { target: { value: "Test Author" } });
  fireEvent.change(urlInput, { target: { value: "http://testurl.com" } });
  screen.debug();

  // Submit the form
  const createButton = screen.getByText("Create");
  fireEvent.click(createButton);

  // Expect handleNewBlog to have been called with the correct data
  expect(mockHandleNewBlog).toHaveBeenCalledWith({
    title: "Test Title",
    author: "Test Author",
    url: "http://testurl.com",
  });
});
