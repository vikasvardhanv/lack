import React, { ReactNode } from 'react';
import { Menu, X, MessageSquare, Database, Server, Search } from 'lucide-react';

type LayoutProps = {
  children: ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#4A154B] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8" />
              <h1 className="text-xl font-bold">SlackQA</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md md:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)}></div>
          <nav className="fixed top-0 right-0 bottom-0 flex flex-col w-64 max-w-sm py-4 px-3 bg-white border-l overflow-y-auto">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-gray-900">Navigation</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-500 rounded-md hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4 px-2 space-y-1">
              <SidebarLink icon={<MessageSquare className="h-5 w-5" />} href="#slack-interface">
                Slack Bot Interface
              </SidebarLink>
              <SidebarLink icon={<Server className="h-5 w-5" />} href="#backend-api">
                Backend API
              </SidebarLink>
              <SidebarLink icon={<Database className="h-5 w-5" />} href="#database-schema">
                Database Schema
              </SidebarLink>
              <SidebarLink icon={<Search className="h-5 w-5" />} href="#search-engine">
                Search Engine Flow
              </SidebarLink>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="flex-1 flex">
        <nav className="hidden md:block w-64 bg-white shadow-sm pt-8 px-4">
          <div className="space-y-4">
            <SidebarLink icon={<MessageSquare className="h-5 w-5" />} href="#slack-interface">
              Slack Bot Interface
            </SidebarLink>
            <SidebarLink icon={<Server className="h-5 w-5" />} href="#backend-api">
              Backend API
            </SidebarLink>
            <SidebarLink icon={<Database className="h-5 w-5" />} href="#database-schema">
              Database Schema
            </SidebarLink>
            <SidebarLink icon={<Search className="h-5 w-5" />} href="#search-engine">
              Search Engine Flow
            </SidebarLink>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

type SidebarLinkProps = {
  icon: React.ReactNode;
  href: string;
  children: React.ReactNode;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, href, children }) => {
  return (
    <a
      href={href}
      className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 group transition-colors duration-150"
    >
      <span className="mr-3 text-gray-500 group-hover:text-gray-600">{icon}</span>
      {children}
    </a>
  );
};