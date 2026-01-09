import React, { useState } from 'react';
import { supabase, getUserId } from '../supabaseClient'; // ✅ getUserId 추가됨

const CATEGORIES = [
  { id: 'food', label: '식비', icon: '🍱' },
  { id: 'transport', label: '교통', icon: '🚌' },
  { id: 'shopping', label: '쇼핑', icon: '🛍️' },
  { id: 'etc', label: '기타', icon: '🎸' },
];

function InputForm({ onClose, onSave, initialDate }) {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('food');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

  const handleSave = async () => {
    if (!amount || !title) return alert('금액과 내용을 입력해주세요!');

    const myId = getUserId();

    const { error } = await supabase
      .from('transactions')
      .insert([
        { 
          date: date,
          type, 
          amount: Number(amount), 
          category, 
          title,
          user_id: myId 
        }
      ]);

    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      if (onSave) onSave(); 
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-[30px] p-8 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600 outline-none"
          />
          <button onClick={onClose} className="text-gray-400 p-2 text-xl">&times;</button>
        </div>

        <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setType('expense')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'
            }`}
          >지출</button>
          <button 
            onClick={() => setType('income')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              type === 'income' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400'
            }`}
          >수입</button>
        </div>

        <input 
          type="number" 
          placeholder="0원" 
          className={`w-full text-4xl font-bold mb-4 outline-none border-b-2 pb-2 transition-colors ${
            type === 'expense' ? 'focus:border-red-500' : 'focus:border-blue-500'
          } border-slate-100`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />

        <input 
          type="text" 
          placeholder="어디에 쓰셨나요?" 
          className="w-full text-lg mb-6 outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-4 gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${
                category === cat.id ? 'border-slate-900 bg-slate-50' : 'border-slate-50 bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-[10px] font-bold">{cat.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform"
        >
          기록하기
        </button>
      </div>
    </div>
  );
}

export default InputForm;