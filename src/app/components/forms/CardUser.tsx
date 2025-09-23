import {
  CircleUser,
  EllipsisVertical,
  LogOut,
  Bell,
  Settings,
  User,
  Shield,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

interface Items {
  title: string;
  name: string | null;
  className?: string;
  onLogout: () => void;
  role?: "admin" | "user" | "moderator";
  avatar?: string;
  isOnline?: boolean;
  notificationCount?: number;
  showNotifications?: boolean;
  showSettings?: boolean;
  theme?: "dark" | "light" | "gradient";
  size?: "sm" | "md" | "lg";
}

export const CardUser: React.FC<Items> = ({
  title,
  name,
  className = "",
  onLogout,
  role = "user",
  avatar,
  isOnline = true,
  notificationCount = 0,
  showNotifications = false,
  // showSettings = false,
  theme = "dark",
  size = "md",
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer menu au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMenu]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    const toastElement = document.createElement("div");
    toastElement.textContent = message;

    const bgColor =
      type === "success"
        ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
        : "bg-gradient-to-r from-red-500 to-red-600";

    toastElement.className = `
      fixed top-4 right-4 ${bgColor} text-white 
      px-4 py-3 shadow-2xl z-[9999] 
      font-semibold text-sm
      backdrop-blur-sm border border-white/20
      transition-all duration-300 transform translate-x-0
    `;

    document.body.appendChild(toastElement);

    // Animation d'apparition
    requestAnimationFrame(() => {
      toastElement.style.transform = "translateX(0) scale(1)";
      toastElement.style.opacity = "1";
    });

    setTimeout(() => {
      toastElement.style.transform = "translateX(100%) scale(0.95)";
      toastElement.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(toastElement)) {
          document.body.removeChild(toastElement);
        }
      }, 300);
    }, 3000);
  };

  // Styles selon le thème
  const getThemeStyles = () => {
    switch (theme) {
      case "light":
        return {
          container: "bg-white border-slate-200/50 shadow-slate-200/50",
          title: "from-slate-800 to-slate-900",
          userBlock: "bg-slate-100/80 border-slate-200/50 hover:bg-slate-50",
          text: "text-slate-700",
          icon: "text-slate-600",
        };
      case "gradient":
        return {
          container:
            "bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 border-purple-500/20 shadow-purple-900/20",
          title: "from-purple-400 to-blue-400",
          userBlock:
            "bg-purple-800/30 border-purple-600/30 hover:bg-purple-700/40",
          text: "text-purple-100",
          icon: "text-purple-300",
        };
      default: // dark
        return {
          container: "bg-slate-900/95 border-slate-700/50 shadow-black/20",
          title: "from-emerald-400 to-cyan-400",
          userBlock:
            "bg-slate-800/80 border-slate-600/30 hover:bg-slate-700/80",
          text: "text-slate-100",
          icon: "text-slate-300",
        };
    }
  };

  // Tailles selon le size prop
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          container: "p-3 sm:p-4",
          title: "text-base sm:text-lg md:text-xl",
          userBlock: "px-3 py-2 gap-2",
          avatar: "w-5 h-5 sm:w-6 sm:h-6",
          text: "text-xs sm:text-sm",
          button: "p-1",
        };
      case "lg":
        return {
          container: "p-6 sm:p-8 lg:p-10",
          title: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
          userBlock: "px-5 py-4 gap-4",
          avatar: "w-8 h-8 sm:w-10 sm:h-10",
          text: "text-base sm:text-lg lg:text-xl",
          button: "p-2.5",
        };
      default: // md
        return {
          container: "p-4 sm:p-6 lg:p-8",
          title: "text-lg sm:text-xl md:text-2xl lg:text-3xl",
          userBlock: "px-4 py-3 gap-3",
          avatar: "w-6 h-6 sm:w-8 sm:h-8",
          text: "text-sm sm:text-base",
          button: "p-2",
        };
    }
  };

  const themeStyles = getThemeStyles();
  const sizeStyles = getSizeStyles();

  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return <Shield className="w-3 h-3 text-red-400" />;
      case "moderator":
        return <Settings className="w-3 h-3 text-yellow-400" />;
      default:
        return <User className="w-3 h-3 text-blue-400" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "moderator":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap");

        .card-user-container {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }

        .card-user-title {
          font-family: "Poppins", "Inter", system-ui, sans-serif;
        }

        .menu-animation {
          animation: slideInScale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideInScale {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .status-pulse {
          animation: statusPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes statusPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>

      <section
        ref={containerRef}
        className={`
          card-user-container relative w-full 
          flex flex-col sm:flex-row justify-between items-start sm:items-center 
          gap-4 sm:gap-6 lg:gap-8
          ${themeStyles.container}
          backdrop-blur-xl border
          ${sizeStyles.container}
          shadow-2xl
          hover:shadow-3xl
          transition-all duration-300 ease-out
          hover:scale-[1.01]
          max-w-full overflow-hidden
          ${className}
        `}
        aria-label="User account info"
      >
        {/* Effet de fond animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />

        {/* Titre avec badge de rôle */}
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h2
              className={`
              card-user-title font-bold bg-gradient-to-r ${themeStyles.title}
              bg-clip-text text-transparent tracking-tight
              ${sizeStyles.title}
              leading-tight break-words
            `}
            >
              {title}
            </h2>

            {/* Badge de rôle */}
            <div
              className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 
              rounded-full border backdrop-blur-sm
              ${getRoleBadgeColor()}
              text-xs font-semibold uppercase tracking-wider
              w-fit
            `}
            >
              {getRoleIcon()}
              {role}
            </div>
          </div>
        </div>

        {/* Bloc utilisateur avec menu côte à côte sur mobile */}
        <div
          className={`
          relative flex items-center w-full sm:w-auto sm:flex-shrink-0
          ${showMenu ? "z-50" : "z-10"}
        `}
        >
          {/* Conteneur principal - côte à côte sur mobile */}
          <div className="flex items-center gap-0 w-full sm:w-auto">
            {/* Bloc utilisateur */}
            <div
              className={`
              flex items-center ${sizeStyles.userBlock}
              ${themeStyles.userBlock} backdrop-blur-sm border
              ${themeStyles.text} select-none shadow-lg
              transition-all duration-200 ease-out
              hover:scale-[1.02] active:scale-[0.98]
              min-w-0 flex-1 sm:flex-initial
              ${showMenu ? "rounded-l-xl" : "rounded-xl"}
            `}
            >
              {/* Notifications */}
              {showNotifications && notificationCount > 0 && (
                <div className="relative mr-2">
                  <Bell
                    className={`${sizeStyles.avatar} ${themeStyles.icon}`}
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  </div>
                </div>
              )}

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className={`${sizeStyles.avatar} rounded-full object-cover border-2 border-white/20`}
                  />
                ) : (
                  <CircleUser
                    className={`${themeStyles.icon} ${sizeStyles.avatar}`}
                  />
                )}

                {/* Indicateur de statut */}
                <div
                  className={`
                  absolute -bottom-0.5 -right-0.5 
                  w-2.5 h-2.5 sm:w-3 sm:h-3 
                  ${isOnline ? "bg-emerald-500" : "bg-slate-400"} 
                  rounded-full border-2 
                  ${theme === "light" ? "border-white" : "border-slate-800"}
                  ${isOnline ? "status-pulse" : ""}
                `}
                />
              </div>

              {/* Nom utilisateur */}
              <div className="min-w-0 flex-1">
                <span
                  className={`
                  font-semibold ${themeStyles.text} ${sizeStyles.text}
                  block truncate
                `}
                  title={name ?? "Utilisateur"}
                >
                  {name ?? "Utilisateur"}
                </span>
                {role && (
                  <span
                    className={`
                    text-xs opacity-70 ${themeStyles.text}
                    capitalize
                  `}
                  >
                    {role}
                  </span>
                )}
              </div>
            </div>

            {/* Bouton dynamique - trois points ou déconnexion */}
            {!showMenu ? (
              // Bouton trois points
              <button
                aria-label="Afficher les options"
                onClick={() => setShowMenu(true)}
                className={`
                  flex-shrink-0 ${sizeStyles.button}
                  ${themeStyles.userBlock} backdrop-blur-sm border-l-0 border-y border-r
                  rounded-r-xl
                  hover:bg-opacity-80 focus:bg-opacity-80
                  focus:outline-none focus:ring-2 focus:ring-cyan-400/50 
                  cursor-pointer transition-all duration-200 ease-out
                  hover:scale-110 active:scale-95
                  touch-manipulation
                  ${themeStyles.icon}
                `}
                title="Options utilisateur"
              >
                <EllipsisVertical
                  className="
                  transition-all duration-300 ease-out
                  w-4 h-4 sm:w-5 sm:h-5
                  hover:rotate-90
                "
                />
              </button>
            ) : (
              // Bouton déconnexion qui remplace les trois points
              <button
                onClick={() => {
                  onLogout();
                  showToast("Déconnexion réussie !", "success");
                  setShowMenu(false);
                }}
                onMouseLeave={() => setShowMenu(false)}
                className={`
                  flex items-center justify-center gap-2 ${sizeStyles.button}
                  bg-gradient-to-r from-red-600 to-red-700 
                  hover:from-red-500 hover:to-red-600 
                  active:from-red-700 active:to-red-800
                  text-white rounded-r-xl
                  shadow-lg shadow-red-900/30
                  font-semibold transition-all duration-200 ease-out
                  hover:scale-105 active:scale-95 
                  border-l-0 border-y border-r border-red-500/20
                  backdrop-blur-sm cursor-pointer
                  touch-manipulation min-w-max
                  menu-animation
                `}
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span
                  className={`${sizeStyles.text} hidden sm:inline whitespace-nowrap`}
                >
                  Déconnexion
                </span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// Composant de démonstration avec toutes les options
export default function Demo() {
  const handleLogout = () => {
    console.log("Déconnexion effectuée");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Version Admin avec toutes les options */}
        <CardUser
          title="Admin Dashboard Pro"
          name="Jean-Baptiste Dubois"
          role="admin"
          onLogout={handleLogout}
          isOnline={true}
          notificationCount={5}
          showNotifications={true}
          showSettings={true}
          theme="dark"
          size="lg"
        />

        {/* Version Modérateur */}
        <CardUser
          title="Panel de Modération"
          name="Marie Martin"
          role="moderator"
          onLogout={handleLogout}
          isOnline={true}
          showSettings={true}
          theme="gradient"
          size="md"
        />

        {/* Version Light */}
        <CardUser
          title="Interface Utilisateur"
          name="Pierre Durand"
          role="user"
          onLogout={handleLogout}
          isOnline={false}
          theme="light"
          size="sm"
        />

        {/* Version avec nom très long */}
        <CardUser
          title="Dashboard avec titre très long pour tester la responsivité"
          name="Utilisateur avec un nom extrêmement long qui doit être tronqué"
          role="admin"
          onLogout={handleLogout}
          isOnline={true}
          notificationCount={12}
          showNotifications={true}
          showSettings={true}
          theme="dark"
        />
      </div>
    </div>
  );
}
