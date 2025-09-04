// UserManagement.js

import React, {useState, useEffect} from "react";
import {Spinner, CSVUploader, Card} from "./SharedComponents"; // Import shared components

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CSVUploader
          title="Upload New Users via CSV"
          endpoint="/upload-users"
          templateName="users_template.csv"
          onUploadComplete={fetchUsers}
        />
      </Card>

      <Card title={`All Users (${users.length})`}>
        {isLoading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg
              className="w-16 h-16 mx-auto text-slate-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Upload a CSV file to add users</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user, index) => (
                  <tr
                    key={user.username}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {user.username}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserManagement;
