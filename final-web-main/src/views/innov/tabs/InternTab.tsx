import { useState } from 'react';
import { Briefcase, GraduationCap, Star, RefreshCw, CheckCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface Job {
  title: string;
  type: string;
  salary: string;
  skills: string[];
  format: string;
  badge?: string;
}

const allJobs: Job[] = [
  { title: 'Junior Data Analyst', type: 'Аналитика', salary: 'от 800 BYN', skills: ['Excel', 'SQL', 'Python'], format: 'Удалённо', badge: 'Горячая' },
  { title: 'IT-стажёр (Full Stack)', type: 'Разработка', salary: 'Обучение + стипендия', skills: ['React', 'Node.js', 'Git'], format: 'Минск' },
  { title: 'Менеджер инноваций', type: 'Управление', salary: 'Проект 3 мес.', skills: ['Agile', 'Аналитика', 'Презентации'], format: 'Гибрид' },
  { title: 'SMM-специалист', type: 'Маркетинг', salary: 'от 600 BYN', skills: ['Canva', 'Instagram', 'Копирайтинг'], format: 'Гибкий' },
  { title: 'Python разработчик', type: 'Разработка', salary: 'от 1200 BYN', skills: ['Python', 'FastAPI', 'PostgreSQL'], format: 'Удалённо', badge: 'Популярная' },
  { title: 'UX/UI дизайнер', type: 'Дизайн', salary: 'от 900 BYN', skills: ['Figma', 'Prototyping'], format: 'Минск' },
  { title: 'Специалист по безопасности', type: 'ИБ', salary: 'от 1400 BYN', skills: ['Linux', 'Networks', 'SIEM'], format: 'Минск' },
  { title: 'Аналитик по рискам', type: 'Финансы', salary: 'от 1000 BYN', skills: ['Excel', 'Финансы', 'Статистика'], format: 'Гибрид' },
];

const internBenefits = [
  'Онлайн-обучение от топ-менеджеров банка',
  'Официальное трудоустройство',
  '+1% к кешбэку на весь срок',
  'Льготные условия по вкладам и кредитам',
  'Сертификат и рекомендательное письмо',
  'Менторство от ведущих специалистов',
];

const typeColors: Record<string, string> = {
  'Разработка': 'bg-blue-100 text-blue-700',
  'Аналитика': 'bg-green-100 text-green-700',
  'Маркетинг': 'bg-pink-100 text-pink-700',
  'Управление': 'bg-amber-100 text-amber-700',
  'Дизайн': 'bg-purple-100 text-purple-700',
  'ИБ': 'bg-red-100 text-red-700',
  'Финансы': 'bg-teal-100 text-teal-700',
};

export default function InternTab() {
  const { showToast } = useApp();
  const [jobs, setJobs] = useState(allJobs);

  function shuffle() {
    setJobs([...jobs].sort(() => Math.random() - 0.5));
    showToast('Вакансии обновлены');
  }

  return (
    <div className="space-y-4">
      {/* Internship banner */}
      <div className="bg-gradient-to-r from-[#0a2b4e] to-[#1a4a7e] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap size={20} className="text-[#f5a623]" />
          <span className="font-bold text-lg">Стажировка в МТБанке</span>
        </div>
        <p className="text-white/70 text-sm mb-4">Присоединяйтесь к команде инноваций. Реальные задачи, наставник, официальное трудоустройство.</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {internBenefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/80">
              <CheckCircle size={13} className="text-[#f5a623] flex-shrink-0" />
              {b}
            </div>
          ))}
        </div>
        <button
          onClick={() => showToast('Заявка на стажировку принята!')}
          className="bg-[#f5a623] text-[#0a2b4e] font-bold px-6 py-2.5 rounded-2xl hover:bg-amber-400 transition-colors text-sm"
        >
          Подать заявку на стажировку
        </button>
      </div>

      {/* Marketplace */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase size={18} className="text-[#1e6fdf]" />
          <h2 className="font-bold text-gray-800 text-lg">Маркетплейс подработок</h2>
        </div>
        <button onClick={shuffle} className="flex items-center gap-1.5 text-sm text-[#1e6fdf] hover:text-blue-700 transition-colors">
          <RefreshCw size={14} /> Обновить
        </button>
      </div>

      <div className="space-y-3">
        {jobs.map((job, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#eef3fc] rounded-xl flex items-center justify-center text-[#1e6fdf]">
              <Briefcase size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-gray-900 text-sm">{job.title}</span>
                {job.badge && (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    <Star size={10} /> {job.badge}
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>{job.type}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                <span className="font-semibold text-green-600">{job.salary}</span>
                <span>· {job.format}</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {job.skills.map(s => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{s}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => showToast(`Отклик на «${job.title}» отправлен`)}
              className="flex-shrink-0 bg-[#eef3fc] text-[#1e6fdf] font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
            >
              Откликнуться
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
