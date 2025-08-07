'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon } from "lucide-react";
import { useThemeHook } from "@/hooks/use-theme";

export default function Header() {
  const { user, logout } = useAuth();
  const { currentTheme, toggleTheme } = useThemeHook();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Control Yourself
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              {currentTheme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              <span>{currentTheme === 'dark' ? 'Light' : 'Dark'}</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.username || 'User'}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 