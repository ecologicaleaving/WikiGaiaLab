'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { HeaderProps } from '@/types/navigation';
import { mainNavigationItems, getNavigationItems } from '@/lib/navigation';
import { NavigationLink } from './NavigationLink';
import { MobileMenu } from './MobileMenu';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from '../auth/UserMenu';
import { GoogleLoginButton } from '../auth/GoogleLoginButton';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const Header: React.FC<HeaderProps> = ({ 
  variant, 
  showBreadcrumbs = false, 
  showSearch = false, 
  showNotifications = false 
}) => {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Get filtered navigation items based on user auth status
  const navigationItems = getNavigationItems(user, mainNavigationItems);

  // Mock notification count - replace with actual data
  useEffect(() => {
    if (user && showNotifications) {
      // Fetch notification count from API
      setNotificationCount(3);
    }
  }, [user, showNotifications]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Branding */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
                  <Image
                    src="/images/wikigaialab-logo.svg"
                    alt="WikiGaiaLab"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-xl font-bold text-primary-900 hidden sm:block">
                  WikiGaiaLab
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map(item => (
                <NavigationLink
                  key={item.id}
                  href={item.href}
                  icon={item.icon}
                  badge={item.badge}
                  active={pathname === item.href}
                >
                  {item.label}
                </NavigationLink>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              {showSearch && (
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Cerca"
                >
                  <Search size={20} />
                </button>
              )}

              {/* Notifications */}
              {showNotifications && user && (
                <button
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Notifiche"
                >
                  <Bell size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Menu / Auth Actions */}
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : user ? (
                <UserMenu />
              ) : (
                <GoogleLoginButton size="sm" />
              )}
              
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu mobile"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Breadcrumbs */}
          {showBreadcrumbs && (
            <div className="py-2 border-t border-gray-100">
              <Breadcrumbs />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        navigationItems={navigationItems}
        user={user}
      />
    </>
  );
};