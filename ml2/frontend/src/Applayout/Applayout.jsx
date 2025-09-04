import React, {useContext} from "react";
import {Navigate, Route, Routes, useLocation} from "react-router-dom";

import Header from "../components/Header/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import ExamPage from "../pages/ExamPage/ExamPage";
import {AuthContext} from "../App";
import Navbar from "../components/navbar/navbar";

const Applayout = () => {
  const {user} = useContext(AuthContext);
  //  console.log(user.role);

  const location = useLocation();

  // Hide Navbar only on exam page
  const isExamPage = location.pathname.startsWith("/exam");
  // console.log(user.role);

  return (
    <main className="h-screen overflow-hidden">
      {!isExamPage && <Navbar />}
      <div
        className={`${
          !isExamPage ? "lg:pl-20" : ""
        } h-screen overflow-y-auto bg-[#EEF1F9]`}
      >
        {/* The Header is now fixed and will not affect this layout flow */}
        {!isExamPage && <Header />}
        {/* This main content area is pushed down to account for the header's height */}
        <main className={!isExamPage ? "pt-[70px] " : "pt-0"}>
          <Routes>
            {/* --- Protected Routes --- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:subject/:level"
              element={
                <ProtectedRoute>
                  <ExamPage />
                </ProtectedRoute>
              }
            />

            {/* --- Catch-all Route --- */}
            <Route path="*" element={<Navigate to={"/dashboard"} />} />
          </Routes>
        </main>

        {/* You could also add a Footer here if needed */}
      </div>
    </main>
  );
};

export default Applayout;
