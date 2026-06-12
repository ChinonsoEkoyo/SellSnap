'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, Box, ClipboardList, LogOut, User } from 'lucide-react';

import { logoutUser } from '@/app/actions/auth';
import styles from './Sidebar.module.css';

function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type SidebarProps = {
  businessName: string | null | undefined;
  fullName: string | null | undefined;
};

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Box },
  { href: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
];

export function Sidebar({ businessName, fullName }: SidebarProps) {
  const pathname = usePathname();
  const displayName = businessName || fullName || 'User';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
        setMobileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Image
            src="/images/SellSnapLogo.png"
            alt="SellSnap"
            width={120}
            height={27}
            priority
          />
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon size={18} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className={styles.userSection}>
          <div
            className={styles.userInfo}
            onClick={() => setDropdownOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setDropdownOpen((prev) => !prev);
              }
            }}
          >
            <div className={styles.userBadge}>{getInitials(displayName)}</div>
            <div className={styles.userDetails}>
              <div className={styles.userBusinessName}>{displayName}</div>
              <div className={styles.userFullName}>{fullName}</div>
            </div>
          </div>
          {dropdownOpen && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <form action={logoutUser}>
                <button type="submit" className={styles.logoutButton}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      <div className={styles.mobileHeader}>
        <Image
          src="/images/SellSnapLogo.png"
          alt="SellSnap"
          width={100}
          height={23}
          priority
        />
      </div>

      <nav className={styles.mobileNav}>
          {navItems.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavItem} ${isActive ? styles.mobileActive : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </a>
          );
        })}
        <div className={styles.mobileUserWrapper}>
          <button
            className={`${styles.mobileNavItem} ${mobileDropdownOpen ? styles.mobileActive : ''}`}
            onClick={() => setMobileDropdownOpen((prev) => !prev)}
            type="button"
            aria-label="User menu"
          >
            <User size={20} />
            <span>Profile</span>
          </button>
          {mobileDropdownOpen && (
            <div className={styles.mobileDropdown} ref={mobileDropdownRef}>
              <div className={styles.mobileDropdownUserInfo}>
                <div className={styles.mobileDropdownAvatar}>
                  {getInitials(displayName)}
                </div>
                <div className={styles.mobileDropdownDetails}>
                  <div className={styles.mobileDropdownName}>{displayName}</div>
                  <div className={styles.mobileDropdownEmail}>{fullName}</div>
                </div>
              </div>
              <form action={logoutUser}>
                <button type="submit" className={styles.mobileLogoutButton}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
