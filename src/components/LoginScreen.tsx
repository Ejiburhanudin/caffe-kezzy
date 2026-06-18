import React, { useState } from 'react';
import { UserRole, DiningTable } from '../types';
import { Coffee, ShieldCheck, CreditCard, ChefHat, UserCircle, Key, ArrowRight, Table, AlertCircle, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole) => void;
  tables: DiningTable[];
  selectedTableId: string;
  onTableChange: (tableId: string) => void;
}

export default function LoginScreen({
  onLoginSuccess,
  tables,
  selectedTableId,
  onTableChange
}: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Built-in credential PINs
  const ROLE_CONFIGS = {
    admin: {
      name: 'Owner / Administrator',
      icon: <ShieldCheck className="w-5 h-5 text-rose-500" />,
      pin: '1234',
      bg: 'from-rose-500/10 to-rose-600/10 border-rose-200/50',
      tag: 'Akses penuh laporan & manajemen bahan baku'
    },
    kasir: {
      name: 'Staff Kasir (POS Frontline)',
      icon: <CreditCard className="w-5 h-5 text-blue-500" />,
      pin: '2525',
      bg: 'from-blue-500/10 to-blue-600/10 border-blue-200/50',
      tag: 'Input order belanja & mencetak struk thermal'
    },
    barista: {
      name: 'Barista Dapur (Kitchen KDS)',
      icon: <ChefHat className="w-5 h-5 text-amber-500" />,
      pin: '8080',
      bg: 'from-amber-500/10 to-amber-600/10 border-amber-200/50',
      tag: 'Monitor resep antrean produk & set barista'
    },
    pelayan: {
      name: 'Pelayan & Koordinasi Kurir',
      icon: <UserCircle className="w-5 h-5 text-purple-500" />,
      pin: '7777',
      bg: 'from-purple-500/10 to-purple-600/10 border-purple-200/50',
      tag: 'Tugas saji ke meja & konfirmasi delivery kurir'
    },
    customer: {
      name: 'Pelanggan Meja (QR Self-Order)',
      icon: <Table className="w-5 h-5 text-emerald-500" />,
      pin: '', // No pin required
      bg: 'from-emerald-500/10 to-emerald-600/10 border-emerald-200/50',
      tag: 'Pilih meja makanan, pesan mandiri & isi feedback'
    }
  };

  const handleKeyPress = (num: string) => {
    setError('');
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const config = ROLE_CONFIGS[selectedRole];
    
    if (selectedRole === 'customer') {
      onLoginSuccess('customer');
      return;
    }

    if (pin === config.pin) {
      onLoginSuccess(selectedRole);
    } else {
      setError('PIN Kode yang Anda masukkan salah. Gunakan hint di bawah!');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Absolute Ambient Background Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />

      {/* Brand Title Area */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex p-3 bg-amber-600 text-white rounded-2xl shadow-xl shadow-amber-900/30 mb-3 animate-bounce">
          <Coffee className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">KOPI SENJA</h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-sm mx-auto">
          Sistem POS & Ekosistem Digital Kafe Modern. Hubungi Admin atau gunakan panduan PIN demo.
        </p>
      </div>

      {/* Main Container Dual Layout */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl relative z-10 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        
        {/* Left Column: Select login profile role */}
        <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 space-y-4">
          <div>
            <h2 className="text-slate-200 font-bold text-sm md:text-base mb-4 uppercase tracking-wider block">
              1. Pilih Hak Akses Pengguna
            </h2>

            <div className="space-y-2.5">
              {(Object.keys(ROLE_CONFIGS) as Array<UserRole>).map(roleKey => {
                const config = ROLE_CONFIGS[roleKey];
                const isActive = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => {
                      setSelectedRole(roleKey);
                      setPin('');
                      setError('');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start space-x-3 ${
                      isActive 
                        ? 'bg-slate-900 border-amber-600 shadow-md ring-1 ring-amber-600/30' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="mt-1">
                      {config.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs md:text-sm text-slate-100">{config.name}</span>
                        {isActive && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
                      </div>
                      <p className="text-slate-400 text-[10.5px] mt-0.5 line-clamp-1">{config.tag}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Demo Help PINs Box */}
          <div className="bg-slate-900/75 border border-slate-800 p-3.5 rounded-xl space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center text-amber-500 font-bold space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PANDUAN PIN DEMO:</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
              <div>👨‍💼 ADMIN: <span className="font-bold text-slate-200">1234</span></div>
              <div>💵 KASIR: <span className="font-bold text-slate-200">2525</span></div>
              <div>☕ BARISTA: <span className="font-bold text-slate-200">8080</span></div>
              <div>🤵 PELAYAN: <span className="font-bold text-slate-200">7777</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Keypad PIN / Customer Entry */}
        <div className="md:col-span-6 p-6 md:p-8 bg-slate-900/30 flex flex-col justify-center">
          {selectedRole === 'customer' ? (
            <div className="text-center space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-900/35 rounded-2xl max-w-xs mx-auto space-y-2">
                <Table className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-100 text-sm md:text-base">QR Self-Service Dine-In</h3>
                <p className="text-slate-400 text-xs">Simulasi pelanggan memesan langsung dari bar, meja saji, atau makan di tempat.</p>
              </div>

              <div className="space-y-4 max-w-xs mx-auto">
                <div>
                  <label className="text-slate-400 text-xs font-bold block mb-1">Pilih Nomor Kursi Meja Anda:</label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => onTableChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-bold font-mono py-2.5 px-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                  >
                    {tables.map(tbl => (
                      <option key={tbl.id} value={tbl.id}>
                        {tbl.code} - ({tbl.status})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleLoginSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Buka Menu Pemesanan Digital</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-xs mx-auto w-full">
              <div className="text-center">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  2. Ketik Kode Pengaman PIN
                </span>
                
                {/* Dots Display */}
                <div className="flex justify-center space-x-3 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                        i < pin.length
                          ? 'bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-500/20'
                          : 'border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Error Warning */}
              {error && (
                <div className="bg-rose-950/50 border border-rose-900/60 p-2.5 rounded-lg flex items-center space-x-2 text-[11px] text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 animate-pulse" />
                  <span>{error}</span>
                </div>
              )}

              {/* Graphical Numpad */}
              <div className="grid grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeyPress(num)}
                    className="aspect-square bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 font-extrabold text-xl rounded-xl transition duration-100 flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-slate-900/60 hover:bg-slate-900 text-slate-400 font-bold text-xs rounded-xl transition flex items-center justify-center"
                >
                  CLEAR
                </button>
                
                <button
                  type="button"
                  onClick={() => handleKeyPress('0')}
                  className="aspect-square bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 font-extrabold text-xl rounded-xl transition duration-100 flex items-center justify-center"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (pin.length === 4) {
                      handleLoginSubmit();
                    } else {
                      setError('Masukkan 4 digit PIN lengkap!');
                    }
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl transition flex items-center justify-center"
                >
                  ENTER
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
      
    </div>
  );
}
