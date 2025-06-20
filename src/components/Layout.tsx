
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, MapPin, Pill, Building2, TrendingUp, Database } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: Database },
    { path: '/drugs', label: 'Drugs', icon: Pill },
    { path: '/locations', label: 'Locations', icon: MapPin },
    { path: '/manufacturers', label: 'Manufacturers', icon: Building2 },
    { path: '/insights', label: 'Insights', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-md flex items-center justify-center group-hover:from-slate-700 group-hover:to-slate-800 transition-all">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-slate-900 leading-tight">
                    Drug Shortage Supply Monitor
                  </span>
                  <span className="text-xs text-slate-500 leading-tight">
                    Intelligence Platform
                  </span>
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search drugs, locations, NDCs..."
                  className="pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-slate-500 text-sm">
            <p className="font-medium">Drug Shortage Supply Monitor</p>
            <p className="mt-1">Intelligence sourced from FDA, GSA, BIS, and OFAC systems</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
