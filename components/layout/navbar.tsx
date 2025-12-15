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
      label: "CAGR Calculator",
      href: "/",
    },
    {
      label: "Mutual Funds",
      href: "/mutual_fund",
    },
  ];

  return (
    <nav className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='mx-[6%] flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-8'>
          <Link
            href='/'
            className='font-display text-xl font-bold tracking-tight text-foreground'>
            Finance Tracker
          </Link>
          <div className='hidden md:flex md:items-center md:gap-6'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${
                    pathname === item.href
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}></span>
              </Link>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <button
            onClick={onThemeToggle}
            className='rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors'>
            {theme === "dark" ? (
              <Sun className='h-5 w-5' />
            ) : (
              <Moon className='h-5 w-5' />
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors md:hidden'>
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
        <div className='border-t border-border bg-background md:hidden'>
          <div className='space-y-1 px-4 py-3'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
