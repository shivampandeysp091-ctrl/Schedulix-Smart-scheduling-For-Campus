// src/Layout.jsx - UPDATED for Profile Image
import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Search, Bell, Calendar, Users, Home, Sparkles, LogOut, User as UserIcon, Clock, MessageSquareText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import SchedulixLogo from './assets/logo.jpeg';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

// Define backend base URL for images
const BACKEND_BASE_URL = 'http://localhost:8080';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, notifications, unreadCount, markAsRead } = useAuth();

  const getInitials = (username) => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/auth'); // Redirect to login page
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading User Data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3DFFD] via-[#D8E5FF] to-[#EEF4FF]">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            {/* --- 1. LEFT SECTION: Logo and Title (FIXED ALIGNMENT) --- */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              {/* Wrapper div hata diya gaya hai. Styles seedhe img par hain. */}
              <img
                src={SchedulixLogo}
                alt="Schedulix Logo"
                className="h-10 w-10 object-contain rounded-full group-hover:scale-105 transition-transform" // h-10 text ke size se match karega
              />
              <span className="text-2xl font-bold font-poppins text-indigo-600 hidden sm:inline-block">
                Schedulix
              </span>
            </Link>
            {/* --- END NEW LOGO CODE --- */}

            {/* Center Navigation */}
            <div className="hidden md:flex flex-1 items-center justify-center gap-8">              {/* ... (all your Link buttons: Dashboard, Faculty List, etc.) ... */}
              <Link to="/">
                <Button variant="ghost" className={`rounded-full ${location.pathname === "/" ? 'bg-[#C8B6FF]/20 text-[#7C3AED]' : 'hover:bg-[#89BFFF]/10'}`}>
                  <Home className="w-4 h-4 mr-2" /> Dashboard
                </Button>
              </Link>
              <Link to="/availability">
                <Button variant="ghost" className={`rounded-full ${location.pathname === "/availability" ? 'bg-[#C8B6FF]/20 text-[#7C3AED]' : 'hover:bg-[#89BFFF]/10'}`}>
                  <Users className="w-4 h-4 mr-2" /> Faculty List
                </Button>
              </Link>

              {user.role === 'ROLE_STUDENT' && (
                <>
                  <Link to="/schedule">
                    <Button variant="ghost" className={`rounded-full ${location.pathname === "/schedule" ? 'bg-[#C8B6FF]/20 text-[#7C3AED]' : 'hover:bg-[#89BFFF]/10'}`}>
                      <Calendar className="w-4 h-4 mr-2" /> Schedule Meeting
                    </Button>
                  </Link>
                  <Link to="/student/meetings">
                    <Button variant="ghost" className={`rounded-full ${location.pathname === "/student/meetings" ? 'bg-[#C8B6FF]/20 text-[#7C3AED]' : 'hover:bg-[#89BFFF]/10'}`}>
                      <Clock className="w-4 h-4 mr-2" /> My Requests
                    </Button>
                  </Link>
                </>
              )}
              {user.role === 'ROLE_FACULTY' && (
                <>
                  <Link to="/faculty/meetings">
                    <Button variant="ghost" className={`rounded-full ${location.pathname === "/faculty/meetings" ? 'bg-[#C8B6FF]/20 text-[#7C3AED]' : 'hover:bg-[#89BFFF]/10'}`}>
                      <Users className="w-4 h-4 mr-2" /> Manage Requests
                    </Button>
                  </Link>
                  <Link to="/announcements/new">
                    <Button variant="ghost" className={`rounded-full ${location.pathname === "/announcements/new" ? 'bg-[#C8B6FF]/20 text-[#7C3AED]' : 'hover:bg-[#89BFFF]/10'}`}>
                      <MessageSquareText className="w-4 h-4 mr-2" /> Post Announcement
                    </Button>
                  </Link>
                  <Link to="/faculty/timetable/upload">
                    <Button variant="ghost" className={`rounded-full ${location.pathname === "/faculty/timetable/upload" ? 'bg-[#C8B6FF]/20 text-[#7C3AED]' : 'hover:bg-[#B8E1FF]/10'}`}>
                      <Upload className="w-4 h-4 mr-2" /> Upload Timetable
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-right gap-3 flex-shrink-0 ml-auto">


              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-blue-100">
                    <Bell className="w-5 h-5 text-blue-600" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-2xl">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <DropdownMenuItem
                        key={notif.id}
                        className="flex items-start gap-3 p-3 cursor-pointer"
                        // Click par 'read' mark karein
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div> {/* Unread dot */}
                        <div className="flex-grow">
                          <p className="text-sm text-gray-700 leading-snug">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(notif.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center p-4">No new notifications.</p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* --- END Notification Bell --- */}

              {/* --- UPDATED Profile/Dropdown --- */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-white font-semibold overflow-hidden">                    {/* Check for profileImageUrl, fallback to initials */}
                    {user.profileImageUrl ? (

                      <img
                        src={`${BACKEND_BASE_URL}${user.profileImageUrl}`}
                        alt={user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.outerHTML = `<span class="text-xl font-bold">${getInitials(user.username)}</span>`; }}
                      />
                    ) : (
                      getInitials(user.username)
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  {/* User Info (now shows fullName if available) */}
                  <DropdownMenuItem className="p-3 focus:bg-transparent cursor-default">
                    <div>
                      <p className="font-semibold">{user.fullName || user.username}</p>
                      <p className="text-xs text-gray-500">{user.role?.replace('ROLE_', '')}</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer focus:bg-gray-100 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    My Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>
    </div>
  );
}