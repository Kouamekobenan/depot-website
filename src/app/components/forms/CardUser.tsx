import { CircleUser, EllipsisVertical, LogOut } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
interface Items {
  title: string;
  name: string | null;
  className?: string;
  onLogout: () => void;
}
export const CardUser: React.FC<Items> = ({
  title,
  name,
  className = "",
  onLogout,
}) => {
  const [showLogout, setShowLogout] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer menu logout au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showLogout &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowLogout(false);
      }
    };

    // Fermer au ESC
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLogout]);

  const showToast = () => {
    // Simple toast notification
    const toastElement = document.createElement("div");
    toastElement.textContent = "Vous êtes déconnecté !";
    toastElement.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] transition-all duration-300";
    document.body.appendChild(toastElement);

    setTimeout(() => {
      toastElement.style.opacity = "0";
      setTimeout(() => document.body.removeChild(toastElement), 300);
    }, 3000);
  };

  return (
    <>
      <section
        ref={containerRef}
        className="relative w-full flex flex-col lg:flex-row justify-between items-start lg:items-center 
          gap-3 sm:gap-4 lg:gap-6 xl:gap-8
          bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 
          border border-slate-700/50 backdrop-blur-sm
          rounded-xl sm:rounded-2xl
          p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8
          shadow-2xl shadow-black/20
          before:absolute before:inset-0
          before:bg-gradient-to-r before:from-blue-500/5 before:to-purple-500/5 
          before:pointer-events-none
          hover:shadow-3xl hover:shadow-black/30
          transition-all duration-300 ease-in-out
          max-w-full overflow-hidden"
        style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
        aria-label="User account info"
      >
        {/* Titre - Responsive typography */}
        <div className="flex-1 lg:flex-[2] w-full lg:w-auto">
          <h2
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 
              font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 
              bg-clip-text text-transparent 
              tracking-tight text-center lg:text-left
              leading-tight sm:leading-normal
              break-words hyphens-auto
              max-w-full"
            style={{ fontFamily: "Poppins, Inter, system-ui, sans-serif" }}
          >
            {title}
          </h2>
        </div>

        {/* Bloc utilisateur - Responsive layout */}
        <div
          className={`relative flex items-center justify-center lg:justify-end 
            w-full lg:w-auto lg:flex-shrink-0 ${className}`}
        >
          <div
            className="flex items-center gap-2 sm:gap-3 lg:gap-4 
              bg-slate-800/80 backdrop-blur-sm 
              border border-slate-600/30 rounded-lg sm:rounded-xl
              px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4
              text-white select-none shadow-lg 
              hover:bg-slate-700/80 hover:shadow-xl
              transition-all duration-200 ease-in-out
              hover:scale-[1.02] active:scale-[0.98]
              min-w-0 max-w-full"
          >
            {/* Avatar - Responsive sizes */}
            <div className="relative flex-shrink-0">
              <CircleUser className="text-slate-300 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9" />
              <div
                className="absolute -top-1 -right-1 
                  w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 
                  bg-emerald-500 rounded-full 
                  border-2 border-slate-800
                  animate-pulse"
              ></div>
            </div>

            {/* Nom utilisateur - Responsive text handling */}
            <span
              className="font-semibold text-slate-100 
                text-xs sm:text-sm lg:text-base xl:text-lg
                truncate min-w-0 flex-1
                max-w-[80px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[200px] xl:max-w-[250px]"
              style={{ fontFamily: "Poppins, Inter, system-ui, sans-serif" }}
              title={name ?? "Utilisateur"}
            >
              {name ?? "Utilisateur"}
            </span>

            {/* Bouton menu - Responsive interaction */}
            <button
              aria-label="Afficher les options"
              aria-expanded={showLogout}
              onClick={() => setShowLogout((prev) => !prev)}
              className="flex-shrink-0 ml-1 sm:ml-2 
                rounded-lg p-1 sm:p-1.5 lg:p-2
                hover:bg-slate-600/50 focus:bg-slate-600/50
                focus:outline-none focus:ring-2 focus:ring-cyan-400/50 
                cursor-pointer transition-all duration-200 ease-in-out
                hover:scale-110 active:scale-95
                touch-manipulation"
              title="Options utilisateur"
            >
              <EllipsisVertical
                className={`text-slate-300 transition-transform duration-300 ease-in-out
                  w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6
                  ${showLogout ? "rotate-90 text-cyan-400" : "rotate-0"}`}
              />
            </button>
          </div>

          {/* Menu déroulant - Responsive positioning */}
          {showLogout && (
            <div
              className="absolute top-full lg:bottom-full lg:top-auto 
                right-0 mt-2 lg:mt-0 lg:mb-3 z-50
                animate-in slide-in-from-top-2 lg:slide-in-from-bottom-2 
                fade-in duration-200"
            >
              <button
                onClick={() => {
                  onLogout();
                  showToast();
                  setShowLogout(false);
                }}
                className="flex items-center gap-2 sm:gap-3 
                  px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-3
                  bg-gradient-to-r from-red-600 to-red-700 
                  hover:from-red-500 hover:to-red-600 
                  active:from-red-700 active:to-red-800
                  text-white rounded-lg sm:rounded-xl
                  shadow-xl shadow-red-900/30
                  font-semibold text-xs sm:text-sm lg:text-base
                  transition-all duration-200 ease-in-out
                  hover:scale-105 active:scale-95 
                  border border-red-500/20 backdrop-blur-sm
                  whitespace-nowrap min-w-max
                  focus:outline-none focus:ring-2 focus:ring-red-400/50
                  touch-manipulation"
                style={{ fontFamily: "Poppins, Inter, system-ui, sans-serif" }}
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

// Composant de démonstration - Responsive grid
export default function Demo() {
  const handleLogout = () => {
    console.log("Déconnexion effectuée");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 
      p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12"
    >
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        <CardUser
          title="Dashboard Pro Analytics Suite"
          name="Jean-Baptiste Dubois-Martin"
          onLogout={handleLogout}
        />

        <CardUser
          title="Analytics Suite"
          name="Marie Martin"
          onLogout={handleLogout}
        />

        <CardUser title="Admin Panel" name={null} onLogout={handleLogout} />

        <CardUser
          title="Super Long Dashboard Title That Tests Responsiveness"
          name="Utilisateur Avec Un Très Long Nom"
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
