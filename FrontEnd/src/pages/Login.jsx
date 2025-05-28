import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import logo from "../assets/black-logo.png";
import logo_with_title from "../assets/logo-with-title.png";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { resetAuthSlice, login } from "../store/slices/authSlice";
import { Navigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCredentials, setShowCredentials] = useState(true);

  const dispatch = useDispatch();
  const { loading, error, message, user, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const handleLogin = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("email", email);
    data.append("password", password);
    dispatch(login(data));
  };
  useEffect(() => {
    // if (message) {
    //   toast.success(message);
    //   dispatch(resetAuthSlice());
    // }
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
  }, [dispatch, isAuthenticated, error, loading]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
  }, [dispatch, isAuthenticated, error, loading]);

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }
  return (
    <div className="relative">
      {showCredentials && (
        <div className="z-10 right-1 top-1 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-800 absolute max-w-xs w-[45%] p-4 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">Test Credentials</p>
            <button
              onClick={() => setShowCredentials(false)}
              className="text-gray-600 hover:text-red-500 font-bold text-lg"
            >
              &times;
            </button>
          </div>

          <div className="mb-3">
            <p className="font-medium">User</p>
            <p className="ml-2 break-all">
              Email:{" "}
              <code className="bg-white px-1 rounded">
                test_user@gmail.com
              </code>
            </p>
            <p className="ml-2">
              Password: <code className="bg-white px-1 rounded">test_user</code>
            </p>
          </div>

          <div>
            <p className="font-medium">Admin</p>
            <p className="ml-2 break-all">
              Email:{" "}
              <code className="bg-white px-1 rounded">
                test_admin@gmail.com
              </code>
            </p>
            <p className="ml-2">
              Password:{" "}
              <code className="bg-white px-1 rounded">test_admin</code>
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col justify-center md:flex-row h-screen">
        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8 relative">
          <div className="max-w-sm w-full">
            <div className="flex justify-center mb-12">
              <div className="rounded-full flex items-center justify-center">
                <img src={logo} alt="logo" className="h-24 w-auto" />
              </div>
            </div>
            <h1 className="text-4xl font-medium text-center mb-12 overflow-hidden">
              Welcome Back !!
            </h1>
            <p className="text-gray-800 text-center mb-12">
              Please enter your credentials to login
            </p>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-black rounded-md focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-black rounded-md focus:outline-none"
                />
              </div>
              <Link
                to={"/password/forgot"}
                className="font-semibold text-black mb-12"
              >
                Forgot Password ?
              </Link>
              <div className="block md:hidden font-semibold mt-5">
                <p>
                  New to our platform ?{" "}
                  <Link
                    to={"/register"}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
              <button
                type="submit"
                className="border-2 mt-5 border-black w-full font-semibold bg-black text-white py-2 rounded-lg hover:bg-white hover:text-black transition cursor-pointer"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
        {/* RIGHT SIDE */}
        <div className="hidden w-full md:w-1/2 bg-black text-white md:flex flex-col items-center justify-center p-10 rounded-tl-[80px] rounded-bl-[80px]">
          <div className="text-center h-[400px]">
            <div className="flex justify-center mb-12">
              <img
                src={logo_with_title}
                alt="logo"
                className="mb-12 h-44 w-auto"
              ></img>
            </div>
            <p className="text-gray-300 mb-12">
              New to our platform? Sign Up Now.
            </p>
            <Link
              to={"/register"}
              className="border-2 mt-5 border-white w-full font-semibold bg-black text-white py-2 px-8 rounded-lg hover:bg-white hover:text-black transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
