import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Household } from '@/api/entities';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  AreaChart,
  Settings,
  CircleHelp,
  Users,
  Loader2,
  ChevronLeft,
  Menu,
  Apple,
  Info,
  Wallet,
  ShoppingBasket,
  BookUser,
  Sparkles,
  ShieldCheck,
  House
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FeatureProvider, useUserFeatures, FeatureGuard } from "@/components/shared/FeatureGuard";
import FeedbackButton from "@/components/shared/FeedbackButton";
import LandingPage from "@/pages/LandingPage";

const Sidebar = ({ isCollapsed, navItems, location, toggleSidebar }) => {
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-10 flex-col border-r bg-background transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-4">
        <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 font-semibold overflow-hidden">
          <Apple className="h-6 w-6" />
          {!isCollapsed && <span className="text-lg font-bold">GroceryTrack</span>}
        </Link>
        {!isCollapsed && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden lg:flex">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
      <nav className="flex-1 space-y-2 px-4">
        <TooltipProvider>
          {navItems.map((item) => (
            <FeatureGuard key={item.href} featureName={item.featureName} hide>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      location.pathname === item.href && "bg-muted text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && item.label}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            </FeatureGuard>
          ))}
        </TooltipProvider>
      </nav>
      <div className="mt-auto p-4">
        <FeedbackButton isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

const Header = ({ toggleSidebar }) => (
  <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
    <div className="w-full flex-1">
      {/* Optional: Add search bar or other header content here */}
    </div>
    {/* Optional: Add user menu here */}
  </header>
);

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const navItems = [
    { href: createPageUrl("Dashboard"), icon: LayoutDashboard, label: "Dashboard" },
    { href: createPageUrl("ScanReceipt"), icon: Receipt, label: "Scan Receipt", featureName: "receiptScanning" },
    { href: createPageUrl("Receipts"), icon: Wallet, label: "Receipts" },
    { href: createPageUrl("ShoppingList"), icon: ShoppingBasket, label: "Shopping List", featureName: "shoppingLists" },
    { href: createPageUrl("Budget"), icon: PiggyBank, label: "Budgets", featureName: "budgeting" },
    { href: createPageUrl("Analytics"), icon: AreaChart, label: "Analytics", featureName: "analytics" },
    { href: createPageUrl("Nutrition"), icon: Sparkles, label: "Nutrition", featureName: "nutritionTracking" },
    { href: createPageUrl("Household"), icon: House, label: "Household" },
    { href: createPageUrl("Settings"), icon: Settings, label: "Settings" },
    { href: createPageUrl("Guide"), icon: CircleHelp, label: "Features Guide" },
    { href: createPageUrl("Privacy"), icon: ShieldCheck, label: "Privacy" },
  ];

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[auto_1fr]">
      <Sidebar isCollapsed={isCollapsed} navItems={navItems} location={location} toggleSidebar={toggleSidebar} />
      <div className={cn("flex flex-col transition-all duration-300 ease-in-out", isCollapsed ? "lg:ml-16" : "lg:ml-64")}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 bg-muted/40 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default function Layout({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthAndHousehold = async () => {
            try {
                let currentUser = await User.me();
                
                // If user is logged in but has no household, create one automatically.
                if (currentUser && !currentUser.household_id) {
                    console.log("User detected without a household. Creating one now...");
                    
                    // 1. Create a new household for this user
                    const newHousehold = await Household.create({
                        name: `${currentUser.full_name}'s Household`,
                        admin_id: currentUser.id
                    });

                    // 2. Update the user's record with the new household ID
                    await User.updateMyUserData({ household_id: newHousehold.id });
                    
                    // 3. Re-fetch user data to ensure all components get the updated info
                    currentUser = await User.me();
                    console.log("Household created and user updated successfully.");
                }

                setUser(currentUser);
            } catch (error) {
                // User is not logged in or session expired
                console.log("User not authenticated, showing landing page.");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuthAndHousehold();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Show landing page for unauthenticated users
    if (!user) {
        return <LandingPage />;
    }

    // Show main app for authenticated users
    return (
        <FeatureProvider>
            <MainLayout>{children}</MainLayout>
        </FeatureProvider>
    );
}