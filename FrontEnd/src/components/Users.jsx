import React from "react";
import { useSelector } from "react-redux";
import Header from "../layout/Header";
const Users = () => {
  const { users } = useSelector((state) => state.user);

  const formatDate = (timeStamp) => {
    const date = new Date(timeStamp);
    const formattedDate = `${String(date.getDate()).padStart(
      2,
      "0"
    )} - ${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )} - ${date.getFullYear()}`;

    const formattedTime = `${String(date.getHours()).padStart(
      2,
      "0"
    )} : ${String(date.getMinutes()).padStart(2, "0")} : ${String(
      date.getSeconds()
    ).padStart(2, "0")}`;

    return `${formattedDate} ${formattedTime}`;
  };

  const result = formatDate("2025-03-19T04:46:12.556+00:00");
  console.log(result);

  return (
    <>
      <main className="relative flex-1 p-6 pt-28">
        <Header></Header>
        <header className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
            Registered Users
          </h2>
        </header>

        {/* Table */}
        {
          users && users.filter( u => u.role === "User").length > 0 ? (
            <div className="mt-6 overflow-auto bg-white rounded-md shadow-lg">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-2 text-left text-gray-500 uppercase font-semibold">ID</th>
                    <th className="px-6 py-2 text-left text-gray-500 uppercase font-semibold">Name</th>
                    <th className="px-6 py-2 text-left text-gray-500 uppercase font-semibold">Email</th>
                    <th className="px-6 py-2 text-left text-gray-500 uppercase font-semibold">Role</th>
                    <th className="px-6 py-2 text-center text-gray-500 uppercase font-semibold">No. of Boks Borrowed</th>
                    <th className="px-6 py-2 text-center text-gray-500 uppercase font-semibold">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    users.filter( u => u.role === "User").map((user, index) => {
                      return (
                        <tr key={index} className={(index+1)%2===0 ? "bg-gray-50":""} >
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">{user.name}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">{user.role}</td>
                          <td className="px-4 py-2">{user?.borrowedBooks.length}</td>
                          <td className="px-4 py-2">{formatDate(user.createdAt)}</td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>
          ) : (
            <h3 className="text-3xl font-medium mt-5">No registered users found in library</h3>
          )
        }
      </main>
    </>
  );
};

export default Users;
