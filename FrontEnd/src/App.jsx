import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OTP from "./pages/OTP";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./store/slices/authSlice";
import { fetchAllUsers } from "./store/slices/userSlice";
import { fetchAllBooks } from "./store/slices/bookSlice";
import { fetchAllBorrowedBooks, fetchUserBorrowedBooks } from "./store/slices/borrowSlice";

const App = () => {
  const {user, isAuthenticated}  = useSelector(state => state.auth);
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(getUser());
    dispatch(fetchAllBooks());

    if(isAuthenticated && user?.role == "Admin"){
      console.log("The logged in user is an Admin.");
      dispatch(fetchAllUsers());
      dispatch(fetchAllBorrowedBooks());
    }
    if(isAuthenticated && user?.role == "User"){
      console.log("The logged in user is an User.");
      dispatch(fetchUserBorrowedBooks());
    }
    
  },[isAuthenticated])
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/otp-verification/:email" element={<OTP />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
        </Routes>
        <ToastContainer theme="dark" />
      </Router>
    </>
  );
};

export default App;
