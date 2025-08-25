"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  House,
  Truck,
  UserPlus,
  UserRound,
  UsersRound,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Phone,
  Package,
  Grid3X3,
  ShoppingCart,
  ShoppingCartIcon,
  CreditCard,
  BarChart3,
  PackageSearch,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// Types
interface User {
  role: "MANAGER" | "DELIVERY_PERSON" | "ADMIN" | string;
}
interface SubmenuItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}
interface NavigationItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  hasSubmenu?: boolean;
  submenu?: SubmenuItem[];
}
interface AuthContextType {
  user: User | null;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>("/dashbord");
  const [isProductsOpen, setIsProductsOpen] = useState<boolean>(false);
  const [isDirectSaleOpen, setIsDirectSaleOpen] = useState<boolean>(false);
  const { user } = useAuth() as AuthContextType;

  const toggleSidebar = (): void => setIsOpen((prev) => !prev);
  const toggleProducts = (): void => setIsProductsOpen((prev) => !prev);
  const toggleDirectSale = (): void => setIsDirectSaleOpen((prev) => !prev);

  const navigationItems: NavigationItem[] = [
    {
      href: "/dashbord",
      icon: House,
      label: "Accueil",
    },
    {
      href: "/products",
      icon: PackageSearch,
      label: "Produits",
      hasSubmenu: true,
      submenu: [
        { href: "/products", icon: Package, label: "Liste des produits" },
        { href: "/pages/categories", icon: Grid3X3, label: "Catégories" },
        { href: "/order", icon: ShoppingCart, label: "Commandes" },
      ],
    },
    {
      href: "/directeSale",
      icon: ShoppingCartIcon,
      label: "Ventes directe",
      hasSubmenu: true,
      submenu: [
        {
          href: "/directeSale/sale",
          icon: BarChart3,
          label: "Dashboard Caissier(e)",
        },
        {
          href: "/directeSale/creditPayment",
          icon: CreditCard,
          label: "Gestion crédit",
        },
      ],
    },
    {
      href: "/deliveries",
      icon: Truck,
      label: "Livraisons",
    },
    {
      href: "/rapport",
      icon: FileText,
      label: "Rapports des livraisons",
    },
  ];

  const actorItems: NavigationItem[] = [
    { href: "/users", icon: UserRound, label: "Utilisateurs" },
    { href: "/fourniseurs", icon: UsersRound, label: "Fournisseurs" },
    { href: "/deliveryPerson", icon: UserPlus, label: "Livreurs" },
    { href: "/customer", icon: UserRound, label: "Clients" },
    { href: "/admin", icon: UserRound, label: "Administrateur" },
  ];

  const handleItemClick = (item: NavigationItem): void => {
    if (item.hasSubmenu) {
      if (item.href === "/products") {
        toggleProducts();
        setIsDirectSaleOpen(false);
      } else if (item.href === "/directeSale") {
        toggleDirectSale();
        setIsProductsOpen(false);
      }
    } else {
      setActiveItem(item.href);
      setIsProductsOpen(false);
      setIsDirectSaleOpen(false);

      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  const handleSubItemClick = (href: string): void => {
    setActiveItem(href);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.hasSubmenu && item.submenu) {
      return item.submenu.some((subItem) => activeItem === subItem.href);
    }
    return activeItem === item.href;
  };

  const isSubmenuOpen = (item: NavigationItem): boolean => {
    if (item.href === "/products") return isProductsOpen;
    if (item.href === "/directeSale") return isDirectSaleOpen;
    return false;
  };

  const shouldHighlightParent = (item: NavigationItem): boolean => {
    if (!item.hasSubmenu) return false;
    return (
      item.submenu?.some((subItem) => activeItem === subItem.href) || false
    );
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Bouton menu burger pour mobile - Amélioré */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="text-white bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 p-3.5 rounded-xl shadow-2xl hover:from-slate-700 hover:to-gray-800 transition-all duration-300 border border-slate-600/50 backdrop-blur-sm font-sans"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={22} className="text-orange-400" />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>

      {/* Sidebar - Design amélioré */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 
          shadow-2xl border-r border-slate-600/30 z-40 transform transition-all duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex md:flex-col
          backdrop-blur-sm
        `}
      >
        {/* Header avec logo - Design premium */}
        <div className="px-6 py-8 border-b border-slate-600/30 bg-gradient-to-r from-slate-800 via-slate-900 to-gray-900">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Image
                src="/logo.png"
                width={52}
                height={52}
                alt="Logo DrinkFlow - Système de gestion"
                className="rounded-xl border-2 border-orange-500 shadow-xl transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div className="font-sans">
              <h1 className="text-white text-2xl font-black leading-none tracking-tight">
                12
                <span className="text-transparent bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text font-serif font-bold">
                  Depôt
                </span>
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-1.5 tracking-wide">
                Système de gestion
              </p>
            </div>
          </div>
        </div>

        {/* Navigation principale - Style premium */}
        <nav className="flex-1 px-5 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <section className="mb-8">
            <h2 className="text-orange-400 font-bold text-xs uppercase tracking-wider mb-5 px-3 font-sans">
              Navigation Principale
            </h2>
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                const isSubmenuVisible = isSubmenuOpen(item);
                const shouldHighlight = shouldHighlightParent(item);

                return (
                  <li key={item.href}>
                    {/* Item principal - Style amélioré */}
                    {item.hasSubmenu ? (
                      <button
                        onClick={() => handleItemClick(item)}
                        className={`
                          group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 w-full text-left font-sans
                          ${
                            shouldHighlight
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl border border-orange-400/30"
                              : "text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent hover:border-slate-600/50"
                          }
                          hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                        `}
                      >
                        <Icon
                          size={22}
                          className={`${
                            shouldHighlight
                              ? "text-white drop-shadow-sm"
                              : "text-slate-400 group-hover:text-orange-400"
                          } transition-all duration-300`}
                        />
                        <span className="font-semibold flex-1 tracking-wide">
                          {item.label}
                        </span>
                        {isSubmenuVisible ? (
                          <ChevronDown
                            size={18}
                            className={`${
                              shouldHighlight
                                ? "text-white"
                                : "text-slate-400 group-hover:text-orange-400"
                            } transition-transform duration-300`}
                          />
                        ) : (
                          <ChevronRight
                            size={18}
                            className={`${
                              shouldHighlight
                                ? "text-white"
                                : "text-slate-400 group-hover:text-orange-400"
                            } transition-transform duration-300`}
                          />
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => handleSubItemClick(item.href)}
                        className={`
                          group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-sans
                          ${
                            isActive
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl border border-orange-400/30"
                              : "text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent hover:border-slate-600/50"
                          }
                          hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                        `}
                      >
                        <Icon
                          size={22}
                          className={`${
                            isActive
                              ? "text-white drop-shadow-sm"
                              : "text-slate-400 group-hover:text-orange-400"
                          } transition-all duration-300`}
                        />
                        <span className="font-semibold tracking-wide">
                          {item.label}
                        </span>
                        {isActive && (
                          <ChevronRight
                            size={18}
                            className="ml-auto text-white drop-shadow-sm"
                          />
                        )}
                      </Link>
                    )}

                    {/* Sous-menu - Style premium */}
                    {item.hasSubmenu && item.submenu && isSubmenuVisible && (
                      <ul className="ml-6 mt-3 space-y-2 border-l-2 border-orange-500/40 pl-5 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/60 via-orange-500/30 to-transparent"></div>
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeItem === subItem.href;

                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                onClick={() => handleSubItemClick(subItem.href)}
                                className={`
                                  group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 font-sans
                                  ${
                                    isSubActive
                                      ? "bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-500/50 shadow-lg"
                                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-600/30"
                                  }
                                  hover:scale-[1.02] active:scale-[0.98]
                                `}
                              >
                                <SubIcon
                                  size={18}
                                  className={`${
                                    isSubActive
                                      ? "text-orange-400 drop-shadow-sm"
                                      : "text-slate-500 group-hover:text-orange-400"
                                  } transition-all duration-300`}
                                />
                                <span className="font-medium text-sm tracking-wide">
                                  {subItem.label}
                                </span>
                                {isSubActive && (
                                  <div className="ml-auto w-2.5 h-2.5 bg-orange-400 rounded-full shadow-lg animate-pulse"></div>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Section Acteurs - Style amélioré */}
          {user?.role === "MANAGER" && (
            <section className="mb-8">
              <h2 className="text-orange-400 font-bold text-xs uppercase tracking-wider mb-5 px-3 font-sans">
                Gestion des Acteurs
              </h2>
              <ul className="space-y-2">
                {actorItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => handleSubItemClick(item.href)}
                        className={`
                          group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-sans
                          ${
                            isActive
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl border border-orange-400/30"
                              : "text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent hover:border-slate-600/50"
                          }
                          hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                        `}
                      >
                        <Icon
                          size={20}
                          className={`${
                            isActive
                              ? "text-white drop-shadow-sm"
                              : "text-slate-400 group-hover:text-orange-400"
                          } transition-all duration-300`}
                        />
                        <span className="font-semibold text-sm tracking-wide">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </nav>

        {/* Contact Admin - Footer premium */}
        <div className="px-5 py-6 border-t border-slate-600/30 bg-gradient-to-r from-slate-800 via-slate-900 to-gray-900">
          <h3 className="text-orange-400 font-bold text-xs uppercase tracking-wider mb-4 font-sans">
            Support Admin
          </h3>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-600/50 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-2 bg-orange-500/20 rounded-lg">
                <Phone size={18} className="text-orange-400" />
              </div>
              <div className="font-sans">
                <p className="text-xs text-slate-400 mb-1.5 font-medium tracking-wide">
                  Assistance 24/7
                </p>
                <a
                  href="tel:+22505068326778"
                  className="text-white font-mono text-sm font-semibold hover:text-orange-400 transition-all duration-300 hover:scale-105 inline-block"
                >
                  +225 05 06 83 26 78
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
