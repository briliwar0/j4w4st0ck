import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import AuthModal from "@/components/auth/AuthModal";

const Navbar = () => {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"login" | "register">("login");

  const handleOpenAuthModal = (view: "login" | "register") => {
    setModalView(view);
    setIsAuthModalOpen(true);
  };

  const navLinks = [
    { name: "Photos", href: "/browse?type=photo" },
    { name: "Videos", href: "/browse?type=video" },
    { name: "Vectors", href: "/browse?type=vector" },
    { name: "Illustrations", href: "/browse?type=illustration" },
    { name: "Music", href: "/browse?type=music" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Jawa</span>
              <span className="text-2xl font-bold text-secondary">Stock</span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-medium text-neutral-600 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  {user.role === "contributor" && (
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/upload")}
                      className="font-medium text-neutral-600 hover:text-primary"
                    >
                      Upload
                    </Button>
                  )}
                  {user.role === "admin" && (
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/admin")}
                      className="font-medium text-neutral-600 hover:text-primary"
                    >
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                    className="font-medium text-neutral-600 hover:text-primary"
                  >
                    <User className="w-5 h-5 mr-1" />
                    {user.username}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="font-medium text-neutral-600 hover:text-primary"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => handleOpenAuthModal("login")}
                  className="font-medium text-neutral-600 hover:text-primary"
                >
                  Login
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleOpenAuthModal("register")}
                >
                  Sign Up
                </Button>
              </div>
            )}

            <div className="hidden md:flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/checkout")}
                className="text-neutral-600 hover:text-primary relative"
              >
                <ShoppingCart />
                {cartItems.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                  >
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="md:hidden"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-primary">
                        Jawa
                      </span>
                      <span className="text-xl font-bold text-secondary">
                        Stock
                      </span>
                    </div>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="font-medium text-neutral-600 hover:text-primary py-2 transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 my-4 pt-4">
                      {user ? (
                        <>
                          {user.role === "contributor" && (
                            <Link
                              href="/upload"
                              className="font-medium text-neutral-600 hover:text-primary py-2 block"
                            >
                              Upload
                            </Link>
                          )}
                          {user.role === "admin" && (
                            <Link
                              href="/admin"
                              className="font-medium text-neutral-600 hover:text-primary py-2 block"
                            >
                              Admin
                            </Link>
                          )}
                          <Link
                            href="/dashboard"
                            className="font-medium text-neutral-600 hover:text-primary py-2 block"
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/checkout"
                            className="font-medium text-neutral-600 hover:text-primary py-2 block"
                          >
                            Cart ({cartItems.length})
                          </Link>
                          <Button
                            variant="ghost"
                            onClick={logout}
                            className="font-medium text-neutral-600 hover:text-primary px-0 py-2"
                          >
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              handleOpenAuthModal("login");
                            }}
                            className="font-medium text-neutral-600 hover:text-primary px-0 py-2"
                          >
                            Login
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              handleOpenAuthModal("register");
                            }}
                            className="font-medium text-neutral-600 hover:text-primary px-0 py-2"
                          >
                            Sign Up
                          </Button>
                          <Link
                            href="/checkout"
                            className="font-medium text-neutral-600 hover:text-primary py-2 block"
                          >
                            Cart ({cartItems.length})
                          </Link>
                        </>
                      )}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={modalView}
      />
    </header>
  );
};

export default Navbar;
