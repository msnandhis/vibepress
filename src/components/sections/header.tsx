"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

import {
  Menu,
  Moon,
  Sun,
  Monitor,
  Search,
  ArrowRight,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-provider";

const navItems = [
  {
    title: "Home",
    href: "/",
    hasDropdown: true,
    dropdownItems: [
      { title: "Home Carousel", href: "#"},
      { title: "Home Main Right", href: "#"},
      { title: "Header Overlay", href: "#"},
      { title: "Slider + Classic grid", href: "#"},
      { title: "Home Classic List", href: "#"},
      { title: "Home Classic grid", href: "#"},
    ],
  },
  {
    title: "Features",
    href: "#",
    hasDropdown: true,
    dropdownItems: [
      { title: "Article Layouts", href: "#"},
      { title: "Article Sidebar", href: "#"},
      { title: "Post Format", href: "#"},
      { title: "pages", href: "#"},
      { title: "Archive Layouts", href: "#"},
      { title: "Autoload Next Post", href: "#"},
    ],
  },
  {
    title: "Business",
    href: "#",
    hasDropdown: true,
    dropdownItems: [
        { title: "What My Mother Taught Me About Black Conservatives", href: "#"},
        { title: "Splurge or Save Last Minute Pampering Gift Ideas", href: "#"},
        { title: "Brain study identifies a cost of caregiving", href: "#"},
        { title: "Five Quotes For Some Extra Monday Motivation", href: "#"},
    ],
  },
  { title: "Active", href: "#" },
  { title: "Social", href: "#" },
];

const Header = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { data: session, isPending } = useSession();
    const { mode, setMode } = useTheme();
    const router = useRouter();

    const handleSignOut = async () => {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error);
      } else {
        localStorage.removeItem("bearer_token");
        router.refresh(); // or router.push("/")
      }
    };

    const VibepressLogo = () => (
        <Link
            href="/"
            className="flex items-center"
            onClick={() => isMobileMenuOpen && setMobileMenuOpen(false)}>
            <Image
                src="/vibepress-logo.svg"
                alt="VIBEPRESS Logo"
                width={140}
                height={42}
                priority
            />
        </Link>
    );

    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-border bg-background"
        >
            <div className="container flex h-20 max-w-7xl items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-6">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6 text-foreground" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                            <SheetHeader className="mb-8">
                                <VibepressLogo />
                            </SheetHeader>
                            <nav className="flex flex-col gap-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => setMobileMenuOpen(false)}>
                                        {item.title}
                                    </Link>
                                ))}
                                <div className="mt-6 border-t pt-6">
                                  <Button className="w-full">
                                    Buy Now
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    
                    <div className="hidden md:flex items-center gap-10">
                        <VibepressLogo />
                        <NavigationMenu>
                            <NavigationMenuList>
                                {navItems.map((item) => (
                                    <NavigationMenuItem key={item.title}>
                                        {item.hasDropdown && item.dropdownItems ? (
                                            <>
                                                <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-foreground hover:text-primary focus:text-primary">
                                                    {item.title}
                                                </NavigationMenuTrigger>
                                                <NavigationMenuContent>
                                                    <ul className="grid w-[200px] gap-1 p-3 md:w-[250px]">
                                                        {item.dropdownItems.map((component) => (
                                                            <ListItem
                                                                key={component.title}
                                                                title={component.title}
                                                                href={component.href}
                                                            />
                                                        ))}
                                                    </ul>
                                                </NavigationMenuContent>
                                            </>
                                        ) : (
                                            <Link href={item.href} passHref>
                                                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-sm font-medium text-foreground hover:text-primary focus:text-primary")}>
                                                    {item.title}
                                                </NavigationMenuLink>
                                            </Link>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                {mode === "light" && <Sun className="h-5 w-5 text-foreground" />}
                                {mode === "dark" && <Moon className="h-5 w-5 text-foreground" />}
                                {mode === "system" && <Monitor className="h-5 w-5 text-foreground" />}
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setMode("light")}>
                                <Sun className="mr-2 h-4 w-4" />
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMode("dark")}>
                                <Moon className="mr-2 h-4 w-4" />
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMode("system")}>
                                <Monitor className="mr-2 h-4 w-4" />
                                System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon">
                        <Search className="h-5 w-5 text-foreground" />
                        <span className="sr-only">Search</span>
                    </Button>
                    {isPending ? (
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    ) : session?.user ? (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm hidden md:inline">{session.user.name}</span>
                        <Button variant="ghost" size="sm" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Link href="/sign-in">
                          <Button variant="outline" size="sm">Sign In</Button>
                        </Link>
                        <Link href="/sign-up">
                          <Button size="sm">Sign Up</Button>
                        </Link>
                      </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Header;