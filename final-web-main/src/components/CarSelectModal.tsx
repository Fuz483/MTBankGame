import { X, Check } from 'lucide-react';
import { useApp, getCarCoefficient } from '../context/AppContext';

const CAR_NAMES = [
  '', 'MTBank', 'GORIOT', 'Quantum Grip', 'Kinexus Drive', 'Speed',
  'Flow', 'Racing', 'Apex', 'Velocity', 'Cosmic',
  'Rust', 'Motora', 'Flame', 'Dinoco', 'Ignitr Green',
  'Ignitr Gold', 'Ultimate',
];

export default function CarSelectModal() {
  const { carSelectOpen, closeCarSelect, ownedCars, selectedCar, selectCar } = useApp();

  if (!carSelectOpen) return null;

  const sorted = [...new Set(ownedCars)].sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadein">
      <div className="bg-[#010615] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-white font-black text-xl">Выбор болида</h2>
            <p className="text-white/40 text-xs mt-1">Выберите болид для гонки</p>
          </div>
          <button onClick={closeCarSelect} className="text-white/40 hover:text-white p-1"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {sorted.map(carId => {
            const coef = getCarCoefficient(carId);
            const isSelected = selectedCar === carId;
            return (
              <button
                key={carId}
                onClick={() => selectCar(carId)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#0021F3]/20 border-[#0021F3] shadow-lg shadow-[#0021F3]/20'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#0021F3] rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
                <div className="w-16 h-10 bg-gradient-to-br from-[#0021F3]/30 to-[#F84B36]/20 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-lg">#{carId}</span>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm">{CAR_NAMES[carId] ?? `Болид #${carId}`}</div>
                  <div className="text-white/40 text-xs mt-0.5">x{coef.toFixed(2)} коэф.</div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-white/30 text-xs text-center mt-4">
          Чем выше номер болида — тем больше коэффициент наград за гонку
        </p>
      </div>
    </div>
  );
}
