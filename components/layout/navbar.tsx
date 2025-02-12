import Link from "next/link";
import {usePathname} from "next/navigation";
import {Sun, Moon, Menu, X} from "lucide-react";
import {useState} from "react";

interface NavbarProps {
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

export function Navbar({theme, onThemeToggle}: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Mutual Funds",
      href: "/",
    },
    {
      label: "CAGR Calculator",
      href: "/cagr-calculator",
    },
  ];

  return (
    <nav className='sticky top-0 z-50 w-full border-b border-slate-200 bg-white/75 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/75'>
      <div className='mx-[6%] flex h-16  items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-8'>
          <Link
            href='/'
            className='text-xl font-bold text-slate-900 dark:text-slate-50'>
            Finance Tracker
          </Link>
          <div className='hidden md:flex md:items-center md:gap-6'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-slate-900 dark:hover:text-slate-200 ${
                  pathname === item.href
                    ? "text-slate-900 dark:text-slate-200"
                    : "text-slate-600 dark:text-slate-400"
                }`}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <button
            onClick={onThemeToggle}
            className='rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'>
            {theme === "dark" ? (
              <Sun className='h-5 w-5' />
            ) : (
              <Moon className='h-5 w-5' />
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:hidden'>
            {isMobileMenuOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden'>
          <div className='space-y-1 px-4 py-3'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-200 ${
                  pathname === item.href
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200"
                    : "text-slate-600 dark:text-slate-400"
                }`}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
