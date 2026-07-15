import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Scan, Network, Database, BarChart3, Upload, Clock, Info, Zap, Menu, X, Cpu
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Analyzer', icon: Scan },
    { path: '/propagation', label: 'Propagation Explorer', icon: Network },
    { path: '/dataset', label: 'Dataset Explorer', icon: Database },
    { path: '/performance', label: 'Model Performance', icon: BarChart3 },
    { path: '/batch', label: 'Batch Analysis', icon: Upload },
    { path: '/history', label: 'Inference History', icon: Clock },
    { path: '/about', label: 'About & Method', icon: Info },
  ];

  const getPageTitle = () => {
    const active = navItems.find(item => item.path === location.pathname);
    return active ? active.label : 'RumorLens';
  };

  return (
    <div className="min-h-screen bg-background-base text-text-primary flex flex-col md:flex-row">
      
      {/* ─── Desktop Left Sidebar ───────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-background-surface border-r border-border-muted flex-shrink-0 h-screen sticky top-0">
        
        {/* Brand / Logo */}
        <div className="p-6 border-b border-border-muted flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-gold/10 border border-accent-gold/20">
            <Network className="h-5 w-5 text-accent-gold" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wider uppercase bg-gradient-to-r from-accent-gold via-[#F6D07A] to-accent-gold bg-clip-text text-transparent">
              RumorLens
            </h1>
            <span className="text-[10px] font-mono text-text-muted">BiLSTM + Graph Prop</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-accent-gold/10 text-accent-gold border-l-2 border-accent-gold font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-border-muted/30'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-105" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / System Status */}
        <div className="p-4 border-t border-border-muted bg-background-base/20">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-background-base border border-border-muted">
            <Cpu className="h-4 w-4 text-[#3DD68C] animate-pulse" />
            <div className="font-mono text-[10px]">
              <div className="text-text-primary font-bold">BiLSTM-Graph V1.0</div>
              <div className="text-text-muted">FastAPI Service Active</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Header ─────────────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-background-surface border-b border-border-muted w-full z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-accent-gold" />
          <span className="text-sm font-bold tracking-wider uppercase text-accent-gold">
            RumorLens
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md hover:bg-border-muted text-text-primary focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Sidebar Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-background-base/90 backdrop-blur-sm flex flex-col justify-start pt-20">
          <nav className="px-6 py-8 space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium ${
                      isActive
                        ? 'bg-accent-gold/10 text-accent-gold border-l-4 border-accent-gold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          
          <div className="mt-auto p-6 border-t border-border-muted">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background-surface border border-border-muted">
              <Cpu className="h-5 w-5 text-[#3DD68C] animate-pulse" />
              <div className="font-mono text-xs">
                <div className="text-text-primary font-bold">BiLSTM-Graph V1.0</div>
                <div className="text-text-muted">Local Simulation/Proxy Server</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Content Container ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-border-muted bg-background-surface/30 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">
              {getPageTitle()}
            </h2>
          </div>
          
          {/* Topbar Widgets */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 font-mono text-[11px] text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-signal-nonRumor animate-ping" />
              <span>Backend Connection: <strong className="text-text-primary">Proxy/Mock Mode</strong></span>
            </div>
            
            <Link
              to="/about"
              className="text-xs font-medium text-text-secondary hover:text-accent-gold border border-border-muted hover:border-accent-gold/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-accent-gold" />
              <span>How it Works</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
};
