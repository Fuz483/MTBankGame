import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toastMsg } = useApp();
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${
        toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className="bg-[#0f1e2d] text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium whitespace-nowrap border border-white/10">
        {toastMsg}
      </div>
    </div>
  );
}
