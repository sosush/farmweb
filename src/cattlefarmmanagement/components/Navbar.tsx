import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Assuming App Router context is available
import {
  LayoutDashboard,
  PenTool,
  FileText,
  LineChart,
  Sun,
  Moon,
  Menu,
  X,
  // Removed specific icons if not used by Lucide, ensuring only imported ones are present
} from 'lucide-react';
import { GiCow } from 'react-icons/gi'; // Ensure react-icons/gi is installed
import { useState, useEffect } from 'react';

// NavLink component for consistent styling of navigation items
const NavLink = ({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === to;

  return (
    <Link
      href={to}
      // Enhanced styling for active state and hover
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300 shadow-sm' // Brighter green for active, subtle shadow
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' // Improved hover for inactive
        }`}
    >
      <Icon className={`h-5 w-5 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} /> {/* Icon size and color adjustment */}
      <span>{children}</span>
    </Link>
  );
};

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check localStorage and media query for initial theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added lg:px-8 for larger screens */}
        <div className="flex items-center justify-between h-16"> {/* Slightly increased height */}
          {/* Logo */}
          <Link href="/cattlefarmmanagement" className="flex items-center space-x-2">
            <GiCow className="h-7 w-7 text-green-600 dark:text-green-500" /> {/* Larger icon */}
            <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-900 dark:from-green-400 dark:to-green-200 bg-clip-text text-transparent">
              FarmManager Pro {/* More professional name */}
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2"> {/* Increased space-x */}
            <NavLink to="/cattlefarmmanagement" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/cattlefarmmanagement/cows" icon={GiCow}>Animals</NavLink> {/* Renamed 'Cows' to 'Animals' */}
            <NavLink to="/cattlefarmmanagement/data-entry" icon={PenTool}>Milk Entry</NavLink> {/* Renamed 'Milk Data' to 'Milk Entry' */}
            <NavLink to="/cattlefarmmanagement/reports" icon={FileText}>Reports</NavLink>
            <NavLink to="/cattlefarmmanagement/analytics" icon={LineChart}>Analytics</NavLink>

            <div className="border-l border-gray-300 dark:border-gray-700 h-6 mx-3" /> {/* Thicker, taller divider */}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-blue-500" />} {/* Colored icons */}
            </button>
          </div>

          {/* Mobile menu button & Theme toggle (for mobile) */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-blue-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-3"> {/* Increased padding */}
            <div className="flex flex-col space-y-1 px-2 pb-2"> {/* Increased padding */}
              <NavLink to="/cattlefarmmanagement" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/cattlefarmmanagement/cows" icon={GiCow}>Animals</NavLink>
              <NavLink to="/cattlefarmmanagement/data-entry" icon={PenTool}>Milk Entry</NavLink>
              <NavLink to="/cattlefarmmanagement/reports" icon={FileText}>Reports</NavLink>
              <NavLink to="/cattlefarmmanagement/analytics" icon={LineChart}>Analytics</NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;