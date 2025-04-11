'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              {/* Replace with your logo when available */}
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">Packlite</span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/gear" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium">
                Gear
              </Link>
              <Link href="/trips" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium">
                Trips
              </Link>
              <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium">
                About
              </Link>
            </nav>
          </div>
          
          {/* Desktop authentication nav */}
          <div className="hidden md:flex items-center">
            {!isAuthenticated ? (
              <>
                <Link href="/signup" className="ml-8 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Link>
                <Link href="/login" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-blue-600 bg-transparent hover:bg-blue-50 dark:hover:bg-gray-800 border border-blue-600">
                  Log In
                </Link>
              </>
            ) : (
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 dark:bg-gray-800 dark:text-blue-400 flex items-center justify-center">
                      {session?.user?.image ? (
                        <Image 
                          src={session.user.image} 
                          alt={session.user.name || "User"} 
                          width={32} 
                          height={32} 
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium">{session?.user?.name?.charAt(0) || "U"}</span>
                      )}
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Signed in as</p>
                      <p className="text-sm font-medium truncate">{session?.user?.email}</p>
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/gear"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        >
                          My Gear
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/trips"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        >
                          My Trips
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleSignOut}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/gear" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Gear
            </Link>
            <Link href="/trips" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Trips
            </Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              About
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              {!isAuthenticated ? (
                <>
                  <Link href="/signup" className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Link>
                  <Link href="/login" className="block w-full text-center mt-2 px-4 py-2 rounded-md text-base font-medium text-blue-600 bg-transparent hover:bg-blue-50 dark:hover:bg-gray-800 border border-blue-600">
                    Log In
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 dark:bg-gray-800 dark:text-blue-400 flex items-center justify-center">
                        {session?.user?.image ? (
                          <Image 
                            src={session.user.image} 
                            alt={session.user.name || "User"} 
                            width={32} 
                            height={32} 
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium">{session?.user?.name?.charAt(0) || "U"}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium">{session?.user?.name}</div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}