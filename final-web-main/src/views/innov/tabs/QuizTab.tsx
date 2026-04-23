import { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { QuizQuestion } from '../../../types';

const quizBank: QuizQuestion[] = [
  { q: 'Что такое фишинг?', opts: ['Вид рыбалки', 'Мошенничество с целью кражи данных', 'Антивирусная программа'], correct: 1 },
  { q: 'Что делать при подозрительном звонке от "банка"?', opts: ['Назвать CVV-код', 'Положить трубку и перезвонить в банк', 'Перевести деньги на безопасный счёт'], correct: 1 },
  { q: 'Что такое капитализация процентов?', opts: ['Начисление процентов на проценты', 'Снятие процентов', 'Уменьшение процентной ставки'], correct: 0 },
  { q: 'Какой кредит называют микрокредитом?', opts: ['Небольшая сумма до ~1000 BYN', 'Ипотечный кредит', 'Автомобильный кредит'], correct: 0 },
  { q: 'Что такое двухфакторная аутентификация?', opts: ['Один пароль', 'Два способа подтверждения личности', 'Биометрия'], correct: 1 },
  { q: 'Зачем нужна кредитная история?', opts: ['Для скидок в магазинах', 'Банки оценивают надёжность заёмщика', 'Для льготного проезда'], correct: 1 },
  { q: 'Что такое диверсификация?', opts: ['Вид инвестиционного риска', 'Распределение вложений по разным активам', 'Страхование вклада'], correct: 1 },
  { q: 'Что означает ПИН-код?', opts: ['Персональный идентификационный номер', 'Код подтверждения операции', 'Номер карты'], correct: 0 },
];

export default function QuizTab() {
  const { addCoins, showToast } = useApp();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quizBank.length).fill(null));
  const [confirmed, setConfirmed] = useState<boolean[]>(new Array(quizBank.length).fill(false));
  const [done, setDone] = useState(false);

  function selectAnswer(optIdx: number) {
    if (confirmed[idx]) return;
    const next = [...answers];
    next[idx] = optIdx;
    setAnswers(next);
  }

  function confirmAnswer() {
    if (answers[idx] === null) { showToast('Выберите вариант ответа'); return; }
    const nextConfirmed = [...confirmed];
    nextConfirmed[idx] = true;
    setConfirmed(nextConfirmed);
    if (answers[idx] === quizBank[idx].correct) {
      setScore(s => s + 1);
    }
  }

  function next() {
    if (idx < quizBank.length - 1) setIdx(i => i + 1);
    else finish();
  }

  function finish() {
    const earned = (score + (confirmed[idx] && answers[idx] === quizBank[idx].correct ? 1 : 0)) * 20;
    addCoins(earned);
    showToast(`Викторина завершена! +${earned} MTcoin`);
    setDone(true);
  }

  function reset() {
    setIdx(0); setScore(0);
    setAnswers(new Array(quizBank.length).fill(null));
    setConfirmed(new Array(quizBank.length).fill(false));
    setDone(false);
  }

  const q = quizBank[idx];
  const isAnswered = confirmed[idx];
  const isCorrect = isAnswered && answers[idx] === q.correct;
  const earned = score * 20;

  if (done) {
    const totalEarned = score * 20;
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <Trophy size={48} className="text-amber-500 mx-auto mb-4" />
        <h2 className="font-bold text-2xl text-gray-900 mb-2">Викторина завершена!</h2>
        <p className="text-gray-500 mb-4">Правильных ответов: <strong className="text-gray-900">{score}</strong> из {quizBank.length}</p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 inline-block">
          <div className="text-amber-700 font-bold text-2xl">+{totalEarned} MTcoin</div>
          <div className="text-amber-600 text-sm">начислено на счёт</div>
        </div>
        <div className="mb-6">
          {quizBank.map((qb, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 text-sm">
              {answers[i] === qb.correct
                ? <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                : <XCircle size={16} className="text-red-400 flex-shrink-0" />
              }
              <span className="text-gray-600 text-left">{qb.q}</span>
            </div>
          ))}
        </div>
        <button onClick={reset} className="bg-[#1e6fdf] text-white font-semibold px-8 py-3 rounded-2xl hover:bg-blue-700 transition-colors">
          Пройти заново
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle size={18} className="text-[#1e6fdf]" />
        <h2 className="font-bold text-gray-800 text-lg">Недельная викторина</h2>
        <span className="ml-auto text-sm text-gray-400">{idx + 1} / {quizBank.length}</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {quizBank.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i < idx ? (confirmed[i] && answers[i] === quizBank[i].correct ? 'bg-green-400' : 'bg-red-300')
              : i === idx ? 'bg-[#1e6fdf]'
              : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <p className="text-lg font-semibold text-gray-900 mb-5">{q.q}</p>
        <div className="space-y-3 mb-6">
          {q.opts.map((opt, i) => {
            let cls = 'border-gray-200 text-gray-700 hover:border-[#1e6fdf] hover:bg-[#eef3fc] cursor-pointer';
            if (answers[idx] === i && !isAnswered) cls = 'border-[#1e6fdf] bg-[#eef3fc] text-[#1e6fdf]';
            if (isAnswered && i === q.correct) cls = 'border-green-400 bg-green-50 text-green-700 font-semibold';
            if (isAnswered && answers[idx] === i && i !== q.correct) cls = 'border-red-300 bg-red-50 text-red-600';
            return (
              <div key={i} onClick={() => selectAnswer(i)} className={`flex items-center gap-3 p-3.5 border rounded-xl transition-all duration-150 ${cls}`}>
                {isAnswered && i === q.correct && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
                {isAnswered && answers[idx] === i && i !== q.correct && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                {(!isAnswered || (i !== q.correct && answers[idx] !== i)) && <div className="w-4 h-4 rounded-full border-2 border-current flex-shrink-0" />}
                <span className="text-sm">{opt}</span>
              </div>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`rounded-xl p-3 mb-4 text-sm ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {isCorrect ? '✓ Верно! +20 MTcoin' : `✗ Правильный ответ: «${q.opts[q.correct]}»`}
          </div>
        )}

        <div className="flex justify-between">
          <button onClick={() => idx > 0 && setIdx(i => i - 1)} disabled={idx === 0} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors">
            Назад
          </button>
          {!isAnswered ? (
            <button onClick={confirmAnswer} disabled={answers[idx] === null} className="px-6 py-2.5 bg-[#1e6fdf] text-white font-semibold rounded-xl text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors">
              Ответить
            </button>
          ) : (
            <button onClick={next} className="px-6 py-2.5 bg-[#1e6fdf] text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors">
              {idx === quizBank.length - 1 ? 'Завершить' : 'Далее →'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 text-center text-sm text-gray-400">
        Правильных: {score} · Начислено: {earned} MTcoin
      </div>
    </div>
  );
}
