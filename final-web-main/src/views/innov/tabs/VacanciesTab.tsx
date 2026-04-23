import { useState } from 'react';
import { Briefcase, Star, X, Link as Linkedin, Send } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface Job {
  title: string;
  type: string;
  salary: string;
  skills: string[];
  format: string;
  badge?: string;
  description: string;
}

const jobs: Job[] = [
  { title: 'Junior Data Analyst', type: 'Аналитика', salary: 'от 800 BYN', skills: ['Excel', 'SQL', 'Python'], format: 'Удалённо', badge: 'Горячая', description: 'Анализ финансовых данных, построение отчётов и дашбордов. Работа с большими объёмами транзакционных данных.' },
  { title: 'Full Stack Developer', type: 'Разработка', salary: 'от 1800 BYN', skills: ['React', 'Node.js', 'PostgreSQL'], format: 'Минск', badge: 'Популярная', description: 'Разработка и поддержка внутренних банковских сервисов. Работа с микросервисной архитектурой.' },
  { title: 'Product Manager', type: 'Управление', salary: 'от 1400 BYN', skills: ['Agile', 'Figma', 'Analytics'], format: 'Гибрид', description: 'Управление продуктами мобильного банка. Работа с командой разработки и дизайна.' },
  { title: 'SMM-специалист', type: 'Маркетинг', salary: 'от 700 BYN', skills: ['Canva', 'Instagram', 'Копирайтинг'], format: 'Гибкий', description: 'Ведение социальных сетей банка, создание контента, взаимодействие с аудиторией.' },
  { title: 'Python Backend', type: 'Разработка', salary: 'от 1500 BYN', skills: ['Python', 'FastAPI', 'Redis'], format: 'Удалённо', badge: 'Новая', description: 'Разработка высоконагруженных backend-сервисов для платёжной инфраструктуры.' },
  { title: 'UX/UI Designer', type: 'Дизайн', salary: 'от 1100 BYN', skills: ['Figma', 'Sketch', 'Prototyping'], format: 'Минск', description: 'Проектирование интерфейсов мобильного приложения и веб-сервисов банка.' },
  { title: 'Security Engineer', type: 'ИБ', salary: 'от 1800 BYN', skills: ['Linux', 'SIEM', 'Pentest'], format: 'Минск', description: 'Обеспечение кибербезопасности банковской инфраструктуры, проведение аудитов.' },
  { title: 'Risk Analyst', type: 'Финансы', salary: 'от 1200 BYN', skills: ['Excel', 'Финансы', 'Статистика'], format: 'Гибрид', description: 'Оценка и управление финансовыми рисками, разработка моделей кредитного скоринга.' },
];

const typeColors: Record<string, string> = {
  'Разработка': 'text-[#0021F3] bg-[#0021F3]/10',
  'Аналитика': 'text-emerald-400 bg-emerald-400/10',
  'Маркетинг': 'text-pink-400 bg-pink-400/10',
  'Управление': 'text-amber-400 bg-amber-400/10',
  'Дизайн': 'text-violet-400 bg-violet-400/10',
  'ИБ': 'text-[#F84B36] bg-[#F84B36]/10',
  'Финансы': 'text-teal-400 bg-teal-400/10',
};

interface ApplyModalProps {
  job: Job;
  onClose: () => void;
}

function ApplyModal({ job, onClose }: ApplyModalProps) {
  const { showToast } = useApp();
  const [name, setName] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!name.trim()) { showToast('Введите ваше имя'); return; }
    setSent(true);
    showToast(`Заявка на "${job.title}" отправлена!`);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadein" onClick={onClose}>
      <div className="bg-[#010615] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-white font-black text-lg">{job.title}</h3>
            <div className="text-white/40 text-sm mt-0.5">{job.salary} · {job.format}</div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white p-1"><X size={18} /></button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-[#0021F3]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send size={20} className="text-[#0021F3]" />
            </div>
            <p className="text-white font-bold">Заявка отправлена!</p>
            <p className="text-white/40 text-sm mt-1">Мы свяжемся с вами</p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ваше имя и фамилия"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#0021F3] transition-colors"
            />
            <div className="relative">
              <Linkedin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="LinkedIn профиль (необязательно)"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#0021F3] transition-colors"
              />
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Сопроводительное письмо (необязательно)"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#0021F3] transition-colors resize-none"
            />
            <button
              onClick={submit}
              className="w-full bg-[#0021F3] hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} /> Отправить заявку
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VacanciesTab() {
  const { showToast } = useApp();
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase size={18} className="text-[#0021F3]" />
        <h2 className="text-white font-black text-lg">Вакансии МТБанка</h2>
      </div>

      {jobs.map((job, i) => (
        <div key={i} className="bg-white/5 border border-white/5 hover:border-[#0021F3]/30 rounded-2xl p-4 transition-all duration-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-[#0021F3]/10 rounded-xl flex items-center justify-center text-[#0021F3]">
              <Briefcase size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-white text-sm">{job.title}</span>
                {job.badge && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#F84B36] bg-[#F84B36]/10 px-2 py-0.5 rounded-full">
                    <Star size={9} /> {job.badge}
                  </span>
                )}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[job.type] ?? 'bg-white/10 text-white/60'}`}>
                  {job.type}
                </span>
              </div>
              <p className="text-white/40 text-xs mb-2 leading-relaxed">{job.description}</p>
              <div className="flex items-center gap-3 text-xs text-white/30 mb-2">
                <span className="text-emerald-400 font-semibold">{job.salary}</span>
                <span>· {job.format}</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {job.skills.map(s => (
                  <span key={s} className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded-lg border border-white/5">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setApplyJob(job)}
              className="flex-shrink-0 bg-[#0021F3]/10 hover:bg-[#0021F3]/20 text-[#0021F3] font-semibold text-xs px-3 py-2 rounded-xl transition-colors border border-[#0021F3]/20"
            >
              Откликнуться
            </button>
          </div>
        </div>
      ))}

      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}

      <div className="text-center text-white/20 text-xs pt-2">
        Не нашли подходящую вакансию?{' '}
        <button onClick={() => showToast('Резюме отправлено в HR')} className="text-[#0021F3] hover:underline">
          Оставьте резюме
        </button>
      </div>
    </div>
  );
}
