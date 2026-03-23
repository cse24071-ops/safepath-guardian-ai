import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Route, Shield, Navigation, Users, ChevronRight } from "lucide-react";
import SafeBot from "./SafeBot";

const navItems = [
  { path: "/", icon: Route, label: "Route Plan" },
  { path: "/safety", icon: Shield, label: "Safety" },
  { path: "/navigate", icon: Navigation, label: "Navigate" },
  { path: "/guardian", icon: Users, label: "Guardian" },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const currentIndex = navItems.findIndex((item) => item.path === location.pathname);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="relative z-30 glass-panel-sm rounded-none border-x-0 border-t-0 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">SafeRoute AI</h1>
            <p className="text-[10px] text-muted-foreground">Women Safety Navigation</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-1 text-xs">
          {navItems.map((item, i) => (
            <span key={item.path} className="flex items-center gap-1">
              <span className={`${i === currentIndex ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                {item.label}
              </span>
              {i < navItems.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          <span className="text-xs text-muted-foreground">System Active</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 relative overflow-hidden">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom nav */}
      <nav className="relative z-30 glass-panel-sm rounded-none border-x-0 border-b-0 px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200"
              >
                <div className={`p-2 rounded-xl transition-all duration-200 ${isActive ? "gradient-primary shadow-lg shadow-primary/30" : ""}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <SafeBot />
    </div>
  );
};

export default AppLayout;
