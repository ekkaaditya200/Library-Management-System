import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const bookSlice = createSlice({
  name: "book",
  initialState: {
    loading: false,
    error: null,
    message: null,
    books: [],
  },
  reducers: {
    fetchBooksRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchBooksSuccess(state, action) {
      state.loading = false;
      state.books = action.payload;
      state.message = null;
    },
    fetchBooksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    addBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    addBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    addBookFailed(state) {
      state.loading = false;
      state.error = action.payload;
    },
    resetBookSlice(state) {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
});
export const fetchAllBooks = () => async (dispatch) => {
  dispatch(bookSlice.actions.fetchBooksRequest());
  await axios
    .get("http://localhost:4000/api/v1/book/all", { withCredentials: true })
    .then((res) => {
      dispatch(bookSlice.actions.fetchBooksSuccess(res.data.books));
    })
    .catch((error) => {
      dispatch(bookSlice.actions.fetchBooksFailed(error.response.data.message));
    });
};

export const addBook = () => async (dispatch) => {
  dispatch(bookSlice.actions.addBookRequest());
  await axios
    .post("http://localhost:4000/api/v1/book/admin/add", {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      dispatch(bookSlice.actions.addBookSuccess(res.data.books));
    })
    .catch((error) => {
      dispatch(bookSlice.actions.addBookFailed(error.response.data.message));
    });
};


export default bookSlice.reducer;