import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import Explore from './pages/Explore';
import Search from './pages/Search';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import MyPosts from './pages/MyPosts';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/post/create"
        element={
          <PrivateRoute>
            <CreatePost />
          </PrivateRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <PrivateRoute>
            <Explore />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <Layout>
              <Search />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-posts"
        element={
          <PrivateRoute>
            <MyPosts />
          </PrivateRoute>
        }
      />

      {/* <Route
        path="/"
        element={
          user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
      /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
