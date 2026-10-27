import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Bell, 
  Map, 
  Stethoscope, 
  QrCode, 
  Home, 
  Heart, 
  BookOpen,
  User
} from 'lucide-react';
import { OwnerAccount } from '../types/pet';

export type ActiveTab = 'catalogo' | 'mapa' | 'qr' | 'refugios' | 'adopciones' | 'veterinarias' | 'guias' | 'docs';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenReportModal: () => void;
  currentUser?: OwnerAccount | null;
  onOpenAccountModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenReportModal,
  currentUser,
  onOpenAccountModal,
}) => {
  // Solo se usan iconos limpios y estéticos Lucide sin emojis en los botones superiores
  // El emoji se reserva exclusivamente para el logo oficial de Busca Huella
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'catalogo', label: 'Alertas', icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'mapa', label: 'Mapa & Rutas', icon: <Map className="w-3.5 h-3.5" /> },
    { id: 'veterinarias', label: 'Veterinarias', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'qr', label: 'Placas QR', icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: 'refugios', label: 'Refugios', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'adopciones', label: 'Adopciones', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'guias', label: 'Guías', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-3">
          
          {/* Logotipo de Marca: Único lugar con el emoji característico 🐾 */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => onSelectTab('catalogo')}
            className="text-left group cursor-pointer focus:outline-none flex items-center gap-2.5 shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-rose-100 to-pink-100 text-rose-600 flex items-center justify-center font-bold text-xl shadow-2xs group-hover:from-rose-200 group-hover:to-pink-200 transition-all border border-rose-200/60">
              🐾
            </div>
            <div>
              <span className="font-fredoka text-xl sm:text-2xl font-bold tracking-tight text-slate-800 group-hover:text-rose-600 transition-colors block leading-tight">
                Busca Huella
              </span>
              <span className="text-[10px] font-bold text-rose-500 tracking-wider uppercase block -mt-0.5">
                San Salvador
              </span>
            </div>
          </motion.button>

          {/* Enlaces de Navegación Superiores Estéticos y Llamativos (SIN emojis en los botones) */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70 shadow-2xs">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.94, y: 1 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbarActiveIndicator"
                      className="absolute inset-0 bg-rose-500 rounded-xl"
                      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Botones de Acción: Cuenta de Dueño y Publicar */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={onOpenAccountModal}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-2xl transition-all cursor-pointer min-h-[38px] shrink-0"
              title="Administrar cuenta y mis publicaciones"
            >
              {currentUser?.fotoUrl ? (
                <img
                  src={currentUser.fotoUrl}
                  alt={currentUser.nombre}
                  className="w-6 h-6 rounded-full object-cover border border-rose-300 shadow-2xs shrink-0"
                />
              ) : currentUser ? (
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.avatarEmoji || '🐾'}
                </span>
              ) : (
                <User className="w-4 h-4 text-rose-500" />
              )}
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="font-bold text-slate-800 truncate max-w-[100px]">
                  {currentUser ? currentUser.nombre.split(' ')[0] : 'Ingresar'}
                </span>
                {currentUser && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {currentUser.municipio || 'Apopa'}
                  </span>
                )}
              </div>
              <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-500' : 'bg-amber-400'} shrink-0`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer min-h-[38px] shrink-0"
            >
              <Plus className="w-4 h-4 text-white stroke-[2.5]" />
              <span className="hidden sm:inline">Publicar Mascota</span>
              <span className="sm:hidden">Publicar</span>
            </motion.button>
          </div>
        </div>

        {/* Barra de Navegación Móvil Estética (Sin emojis, solo iconos vectoriales modernos) */}
        <div className="lg:hidden pb-2.5 pt-1.5 overflow-x-auto flex items-center gap-1.5 scrollbar-none border-t border-rose-50">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-rose-50/70 border border-slate-200/70'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
