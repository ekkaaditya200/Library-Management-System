import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { act } from "react";

const borrowSlice = createSlice({
    name:"borrow",
    initialState:{
        loading : false,
        error : null,
        userBorrowedBooks : [],
        allBorrowedBooks: [],
        message:null,
    },
    reducers:{
        fetchUserBorrowedBooksRequest(state){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        fetchUserBorrowedBooksSuccess(state, action){
            state.loading = false;
            state.userBorrowedBooks = action.payload;
        },
        fetchUserBorrowedBooksFailed(state, action){
            state.loading = false;
            state.error = action.payload;
        },
        recordBookRequest(state){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        recordBookSuccess(state,action){
            state.loading = false;
            state.message = action.payload;
        },
        recordBookFailed(state,action){
            state.loading = false;
            state.message = null;
            state.error = action.payload;
        },
        fetchAllBorrowedBooksRequest(state){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        fetchAllBorrowedBooksRequest(state, action){
            state.loading = false;
            state.allBorrowedBooks = action.payload;
        },
        fetchAllBorrowedBooksRequest(state, action){
            state.loading = false;
            state.error = action.payload;
        },
        returnBookRequest(state){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        returnBookSuccess(state,action){
            state.loading = false;
            state.message = action.payload;
        },
        returnBookFailed(state,action){
            state.loading = false;
            state.message = null;
            state.error = action.payload;
        },
        resetBookslice(state){
            state.loading = false;
            state.error = null;
            state.message = null;
        },
    }
});

export const fetchUserBorrowedBooks = () => async(dispatch) => {
    dispatch(borrowSlice.actions.fetchUserBorrowedBooksRequest());
    await axios
    .get("http://localhost:4000/api/v1/borrow/my-borrowed-books", {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      dispatch(bookSlice.actions.fetchUserBorrowedBooksSuccess(res.data.borrowedBooks));
    })
    .catch((error) => {
      dispatch(bookSlice.actions.fetchUserBorrowedBooksFailed(error.response.data.message));
    });
}

export const fetchAllBorrowedBooks = () => async(dispatch) => {
    dispatch(borrowSlice.actions.fetchAllBorrowedBooksRequest());
    await axios
    .get("http://localhost:4000/api/v1/borrow/borrowed-books-by-users", {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      dispatch(bookSlice.actions.fetchAllBorrowedBooksSuccess(res.data.borrowedBooks));
    })
    .catch((error) => {
      dispatch(bookSlice.actions.fetchAllBorrowedBooksFailed(error.response.data.message));
    });
}
export const recordBorrowBook = (email, id) => async(dispatch) => {
    dispatch(borrowSlice.actions.recordBookRequest());
    await axios
    .post(`http://localhost:4000/api/v1/borrow/record-borrow-book/${id}`, {email}, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      dispatch(borrowSlice.actions.recordBookSuccess(res.data.message));
    })
    .catch((error) => {
      dispatch(borrowSlice.actions.recordBookFailed(error.response.data.message));
    });
}
export const returnBook = (email, id) => async(dispatch) => {
    dispatch(borrowSlice.actions.returnBookRequest());
    await axios
    .put(`http://localhost:4000/api/v1/borrow/borrowed-books-by-users/${id}`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      dispatch(borrowSlice.actions.returnBookSuccess(res.data.message));
    })
    .catch((error) => {
      dispatch(borrowSlice.actions.returnBookFailed(error.response.data.message));
    });
};

export const resetBookSlice = () => (disptach) => {
    disptach(borrowSlice.actions.resetBookslice());
};

export default borrowSlice.reducer;