import React from 'react';
import { UserRole, Outlet, DiningTable } from '../types';
import { Coffee, ShieldCheck, CreditCard, ChefHat, UserCircle, LogOut, MapPin, Table, ArrowLeftRight, Sparkles } from 'lucide-react';

interface HeaderSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  outlets: Outlet[];
  selectedOutletId: string;
  onOutletChange: (outletId: string) => void;
  tables: DiningTable[];
  selectedTableId: string;
  onTableChange: (tableId: string) => void;
  onLogout: () => void;
}

export default function HeaderSwitcher({
  currentRole,
  onRoleChange,
  outlets,
  selectedOutletId,
  onOutletChange,
  tables,
  selectedTableId,
  onTableChange,
  onLogout
}: HeaderSwitcherProps) {
  const currentOutlet = outlets.find(o => o.id === selectedOutletId) || outlets[0];
  const currentTable = tables.find(t => t.id === selectedTableId) || tables[0];

  // Role Metadata mapping for header styling
  const ROLE_BADGES = {
    admin: {
      label: 'Pemilik (Administrator)',
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
      color: 'bg-rose-955/65 border-rose-800 text-rose-300'
    },
    kasir: {
      label: 'Staff Kasir',
      icon: <CreditCard className="w-4 h-4 text-blue-400" />,
      color: 'bg-blue-955/65 border-blue-800 text-blue-300'
    },
    barista: {
      label: 'Barista Dapur',
      icon: <ChefHat className="w-4 h-4 text-amber-400" />,
      color: 'bg-amber-955/65 border-amber-800 text-amber-300'
    },
    pelayan: {
      label: 'Staff Pelayan',
      icon: <UserCircle className="w-4 h-4 text-purple-400" />,
      color: 'bg-purple-955/65 border-purple-800 text-purple-300'
    },
    customer: {
      label: `Pelanggan - Meja ${currentTable.code}`,
      icon: <Table className="w-4 h-4 text-emerald-400" />,
      color: 'bg-emerald-955/65 border-emerald-800 text-emerald-300'
    }
  };

  const badge = ROLE_BADGES[currentRole] || ROLE_BADGES.customer;

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      
      {/* Primary Brand Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Brand identity */}
        <div className="flex items-center space-x-2.5 font-mono">
          <div className="p-2 bg-amber-600 rounded-xl text-white shadow-md shadow-amber-500/10">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black tracking-tight text-white block text-sm">KOPI SENJA</span>
            <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest block">POS EKOSISTEM</span>
          </div>
        </div>

        {/* Dynamic Context Details based on Role */}
        <div className="flex items-center space-x-3">
          
          {/* Multi-Outlet Picker shown strictly for Admin or Cashier only */}
          {(currentRole === 'admin' || currentRole === 'kasir') ? (
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-400 text-xs hidden md:inline">Outlet:</span>
              <select 
                value={selectedOutletId}
                onChange={(e) => onOutletChange(e.target.value)}
                className="bg-transparent text-white text-xs font-bold border-none focus:outline-none cursor-pointer pr-1"
              >
                {outlets.map(out => (
                  <option key={out.id} value={out.id} className="bg-slate-800 text-slate-100">
                    {out.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Static location display for production accuracy */
            <div className="flex items-center space-x-1.5 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-800/80 text-xs text-slate-400 font-mono">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span className="font-semibold">{currentOutlet.name}</span>
            </div>
          )}

          {/* Table quick-swap strictly for Customer simulation if they want to sit somewhere else */}
          {currentRole === 'customer' && (
            <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400">Pindah Meja:</span>
              <select 
                value={selectedTableId}
                onChange={(e) => onTableChange(e.target.value)}
                className="bg-transparent text-amber-400 font-extrabold border-none focus:outline-none cursor-pointer"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-800 text-slate-100">
                    {t.code} ({t.status})
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>

        {/* Logged in Badge and Logout Action */}
        <div className="flex items-center space-x-3">
          
          {/* Active Profile Badge */}
          <div className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${badge.color}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </div>

          {/* Secure Logout trigger */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-1.5 px-3 rounded-lg shadow-sm transition-all duration-150"
            title="Keluar dari Akun / Kunci Layar Sesi"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Keluar</span>
          </button>

        </div>

      </div>

      {/* Subheader info block showing server time / telemetry data */}
      <div className="bg-slate-950 px-4 py-1.5 text-[10.5px] font-mono text-slate-500 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
              SESI STATUS: AKTIF
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Otorisasi: {currentRole.toUpperCase()}</span>
          </div>
          <div>
            <span>Kamis, 18 Juni 2026 - 09:39 WIB</span>
          </div>
        </div>
      </div>

    </div>
  );
}
