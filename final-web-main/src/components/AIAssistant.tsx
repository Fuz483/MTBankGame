import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader as Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Groq from 'groq-sdk';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Системный промпт с контекстом банка
const SYSTEM_PROMPT = `Ты — AI-ассистент МТБанка (белорусский банк). Твоя задача — помогать клиентам с банковскими вопросами.

О продуктах МТБанка:
- Вклады: "Вклад на обучение" (до 9%), "Стартап-вклад" (6.5%), "Вклад-копилка" (до 8% + бонус), "Пенсионный вклад" (10%), "Семейный" (7.5%)
- Кредиты: "Кредит на обучение" (4.5%), "Микрокредит" (7%), "Молодым семьям" (3.9%), "Автокредит" (5.9%), "Потребительский" (9.9%)
- Акции: театральный кешбэк 10%, Spotify Premium со скидкой 70%, кешбэк на АЗС 3%, на спорт 5%
- В приложении есть: игра Formula 1 Racing (гонки за MTcoin), викторина, копилка с доходностью 3% в месяц, обменник бонусов
- Курсы валют: USD ~ 3.21 BYN (покупка), EUR ~ 3.50 BYN

Отвечай дружелюбно, профессионально, на русском языке. Будь полезным и кратким. Если пользователь спрашивает о продукте — предложи конкретный тариф.`;

export default function AIAssistant() {
  const { showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Здравствуйте! Я AI-ассистент МТБанка. Чем могу помочь? Могу рассказать о вкладах, кредитах, акциях, курсах валют или помочь с навигацией по приложению.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Проверка API ключа при монтировании
  useEffect(() => {
    const key = import.meta.env.VITE_GROQ_API_KEY;
    if (key && key !== 'undefined') {
      setApiKey(key);
    } else {
      console.warn('GROQ API key not found. Add VITE_GROQ_API_KEY to .env file');
    }
  }, []);

  // Авто-скролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!apiKey) {
      showToast('API ключ не настроен. Добавьте VITE_GROQ_API_KEY в .env');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(1).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: input }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 500,
      });

      const reply = chatCompletion.choices[0]?.message?.content || 'Извините, не могу ответить на этот вопрос. Пожалуйста, перефразируйте или обратитесь в поддержку.';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error: any) {
      console.error('Groq API error:', error);
      let errorMessage = 'Ошибка соединения. Попробуйте позже.';
      if (error.message?.includes('API key')) {
        errorMessage = 'Неверный API ключ. Проверьте VITE_GROQ_API_KEY в .env';
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Превышен лимит запросов. Подождите немного.';
      }
      showToast(errorMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    'Курс доллара?',
    'Какой вклад самый выгодный?',
    'Расскажи про кредит для учёбы',
    'Как заработать MTcoin?',
  ];

  return (
    <>
      {/* Кнопка-поплавок */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#0021F3] text-white p-4 rounded-full hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 group"
      >
        <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Модальное окно чата */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadein">
          <div className="bg-[#010615] border border-white/10 rounded-3xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#010615] to-[#071D49] border-b border-white/10 px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0021F3] rounded-xl flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">AI Банковский ассистент</h3>
                  <p className="text-white/40 text-xs">MTBank · Инновации</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#010615]">
              {messages.filter(m => m.role !== 'system').map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-[#0021F3] text-white rounded-br-sm'
                        : 'bg-white/5 border border-white/5 text-white/80 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-[#0021F3]" />
                      <span className="text-sm text-white/40">Ассистент печатает...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            <div className="px-4 py-2 border-t border-white/10 bg-[#010615]">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="flex-shrink-0 text-xs bg-white/5 hover:bg-white/10 text-white/60 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-[#010615]">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Задайте вопрос по банковским услугам..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#0021F3] transition-all"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-[#0021F3] text-white p-3 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-white/20 text-center mt-2">

              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
