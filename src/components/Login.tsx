import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../features/auth/authSlice';
import { RootState } from '../store/store';
import API_BASE_URL from '../config';
import { jwtDecode, JwtPayload } from "jwt-decode";



const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  // Access the authentication state from Redux
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const validateForm = () => {
    // Basic email and password validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    setError(''); // Clear any existing errors
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handle Login");

    if (!validateForm()) {
      return; // Stop the form submission if validation fails
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const token = data.token;

      // Decode the token to extract user details (you can use a library like jwt-decode)
      interface CustomJwtPayload extends JwtPayload {
        firstName?: string;
        lastName?: string;
    }

      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      const firstName = decodedToken.firstName;
      const lastName = decodedToken.lastName;

      // Store the token (e.g., in local storage or a cookie)
      localStorage.setItem('token', token);
      

      dispatch(loginSuccess({ user: email, token: token }));
    } catch (err) {
      setError('An error occurred. Please try again later.');
    }
  };


  const handleLogout = () => {
    // Dispatch the logout action to update the state
    dispatch(logout());
  };

  return (
    <div>
      <h2>Login</h2>
      {!isAuthenticated ? (
        <form onSubmit={handleLogin} noValidate>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      ) : (
        <div>
          <p>Welcome, {user}! You are logged in.</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Login;
