
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Pickaxe,
  ClipboardList,
  Wallet,
  LucideIcon,
  Shield,
  LogOut,
  Repeat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect, useState, ReactNode } from 'react';
import { Header } from './header';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Logo } from './icons';
import { doc } from 'firebase/firestore';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: '/home', label: 'Home', icon: LayoutGrid },
  { href: '/swap', label: 'Swap', icon: Repeat },
  { href: '/mining', label: 'Mining', icon: Pickaxe },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
];

const adminNavItem: NavItem = { href: '/admin', label: 'Admin', icon: Shield };

const pageTitles: { [key: string]: string } = {
  '/home': '', // Title for home is now empty
  '/swap': 'Swap Tokens',
  '/mining': 'Mining Session',
  '/tasks': 'Available Tasks',
  '/wallet': 'My Wallet',
  '/admin': 'Admin Dashboard',
};

const LoadingScreen = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div>
            <Logo className="h-16 w-16 mx-auto mb-4 animate-pulse" />
            <h1 className="text-2xl font-semibold text-gray-800">Welcome to Fair Chain</h1>
        </div>
    </div>
);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        setUser(firebaseUser);
      } else {
        setUser(null);
        if (pathname !== '/') {
            router.replace('/');
        }
      }
      setIsUserLoading(false);
    });
    return () => unsubscribe();
  }, [auth, router, pathname]);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);
  
  const isAdmin = userData?.role === 'admin';

  const handleLogout = () => {
    signOut(auth).then(() => {
        toast({ title: "Logged Out Successfully" });
        router.push('/');
    }).catch((error) => {
        toast({ variant: 'destructive', title: "Logout Failed", description: error.message });
    });
  };

  if (isUserLoading) {
    return <LoadingScreen />;
  }

  const allNavItems = isAdmin ? [...navItems, adminNavItem] : navItems;
  const currentPageTitle = pageTitles[pathname] ?? '';
  
  return (
    <div className="min-h-screen w-full flex flex-col">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-[220px] flex-col border-r bg-white sm:flex lg:w-[280px]">
        <div className="flex h-14 items-center border-b px-6">
          <Link
            href="/mining"
            className="flex items-center gap-2 font-semibold text-lg text-black"
          >
            <Logo className="h-7 w-7" />
            <span className="tracking-wide">Fair Chain</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col justify-between overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-blue-600',
                    isActive && 'bg-gray-100 text-blue-600 font-semibold',
                  )}
                >
                  <Icon className='h-4 w-4' />
                  <span>{label}</span>
                </Link>
              );
            })}
             {isAdmin && (
                  <Link
                    key={adminNavItem.href}
                    href={adminNavItem.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-blue-600',
                       pathname.startsWith(adminNavItem.href) && 'bg-gray-100 text-blue-600 font-semibold'
                    )}
                  >
                    <adminNavItem.icon className="h-4 w-4" />
                    <span className="truncate">{adminNavItem.label}</span>
                  </Link>
           )}
          </nav>
          
            <div className="mt-auto p-4">
                 <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                 </Button>
            </div>
        </div>
      </aside>

      <div className="flex flex-col sm:pl-[220px] lg:pl-[280px] flex-1">
        <Header title={currentPageTitle} />
        <main className="flex-1 bg-white">{children}</main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 grid h-16 grid-cols-5 border-t bg-white sm:hidden z-20">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive ? 'text-black font-semibold' : 'text-gray-500 hover:text-black'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </footer>
      <div className="pb-16 sm:pb-0"></div>
    </div>
  );
}
    
