// Header.jsx
import React, {useContext, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {AuthContext} from "../../App";
import UserProfileModal from "../UserProfileModal/UserProfileModal";
import userpng from "../../assets/userPS.png";

const Header = () => {
  const {user, logout} = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* ADDED: fixed, top-0, left-0, w-full, z-50 */}
      <header className="fixed top-0 left-0 w-full z-1 bg-white h-[70px] items-center ">
        <div className="ml-24 flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-2xl font-bold text-gray-900">CodePlatform</div>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-6">
            {/* Profile Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:w-[250px] mt-1 w-[50px] sm:w-20 mr-4 h-[55px]  rounded-md flex items-center gap-3 bg-gray-100 hover:bg-gray-200 transition"
            >
              {/* Avatar */}
              <div className="flex justify-center items-center w-full lg:w-[50px] h-full">
                <img
                  src={userpng}
                  alt="user"
                  className="w-10 h-10 rounded-full object-cover items-center"
                />
              </div>

              {/* ID + Name (hidden on small screens) */}
              <div className="hidden lg:flex py-4 flex-col text-left">
                <span className="text-[13px] mb-0.5 font-medium text-gray-800">
                  {user?.rollno ? user.rollno : "-----------"}
                </span>
                <span className="text-[16px] font-semibold text-gray-900">
                  {user?.username?.toUpperCase()}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
      />
    </>
  );
};

export default Header;
