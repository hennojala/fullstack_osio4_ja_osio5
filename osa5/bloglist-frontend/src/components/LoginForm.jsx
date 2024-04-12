import React, { useState } from "react";
import loginService from "../services/login";
import PropTypes from 'prop-types'


const LoginForm = ({ handleLogin, errorMessage, setErrorMessage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleLoginFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({
        username,
        password,
      });

      handleLogin(user);
      setUsername("");
      setPassword("");
    } catch (exception) {
      setErrorMessage("Wrong username or password");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  return (
    <div>
      <h2>Log in to application</h2>
      <form onSubmit={handleLoginFormSubmit}>
        <div>
          Username:{" "}
          <input
          data-testid='username'
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          Password:{" "}
          <input
          data-testid='password'
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
};

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
}

export default LoginForm;
