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

  return (
    <>
      {/* Import des fonts Google */}
      
      <section
        ref={containerRef}
        className="relative w-full flex justify-between items-center gap-6 
        bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 
        border border-slate-700/50 backdrop-blur-sm
        p-6 shadow-2xl shadow-black/20
        before:absolute before:inset-0 before:rounded-xl 
        before:bg-gradient-to-r before:from-blue-500/5 before:to-purple-500/5 
        before:pointer-events-none"
        style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
        aria-label="User account info"
      >
        <h2
          className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 
          bg-clip-text text-transparent flex-[2] tracking-tight"
          style={{ fontFamily: "Poppins, Inter, system-ui, sans-serif" }}
        >
          {title}
        </h2>

        <div className={`relative flex items-center gap-4 ${className}`}>
          <div
            className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm 
          border border-slate-600/30 rounded-lg px-4 py-3 
          text-white select-none shadow-lg hover:bg-slate-700/80 
          transition-all duration-200 ease-in-out"
          >
            <div className="relative">
              <CircleUser size={32} className="text-slate-300" />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 
              rounded-full border-2 border-slate-800"
              ></div>
            </div>

            <span
              className="font-semibold text-slate-100 truncate max-w-xs text-lg"
              style={{ fontFamily: "Poppins, Inter, system-ui, sans-serif" }}
            >
              {name ?? "Utilisateur"}
            </span>
            <button
              aria-label="Afficher les options"
              aria-expanded={showLogout}
              onClick={() => setShowLogout((prev) => !prev)}
              className="ml-2 rounded-lg p-1 hover:bg-slate-600/50 
              focus:outline-none focus:ring-2 focus:ring-cyan-400/50 
              cursor-pointer transition-all duration-200 ease-in-out
              hover:scale-105 active:scale-95"
              title="Options utilisateur"
            >
              <EllipsisVertical
                size={20}
                className={`text-slate-300 transition-transform duration-200 
                ${showLogout ? "rotate-90" : "rotate-0"}`}
              />
            </button>
          </div>

          {/* Menu déroulant amélioré */}
          {showLogout && (
            <div
              className="absolute bottom-full right-0 mt-4 z-50
            animate-in slide-in-from-bottom-2 fade-in duration-200"
            >
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-2 py-2 
                bg-gradient-to-r from-red-600 to-red-700 
                hover:from-red-500 hover:to-red-600 
                text-white rounded-lg shadow-xl shadow-red-900/30
                font-semibold text-sm transition-all duration-200 ease-in-out
                hover:scale-105 active:scale-95 
                border border-red-500/20 backdrop-blur-sm
                whitespace-nowrap min-w-max"
                style={{ fontFamily: "Poppins, Inter, system-ui, sans-serif" }}
              >
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

// Composant de démonstration
export default function Demo() {
  const handleLogout = () => {
    alert("Déconnexion effectuée !");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <CardUser
          title="Dashboard Pro"
          name="Jean Dupont"
          onLogout={handleLogout}
        />

        <CardUser
          title="Analytics Suite"
          name="Marie Martin"
          onLogout={handleLogout}
        />

        <CardUser title="Admin Panel" name={null} onLogout={handleLogout} />
      </div>
    </div>
  );
}
