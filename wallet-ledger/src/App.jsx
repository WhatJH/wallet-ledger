import React, { useState, useEffect, useCallback } from 'react';
import { supabase, getUserId } from './supabaseClient';
import InputForm from './components/InputForm';

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);


  const fetchTransactions = useCallback(async () => {
    try {
      const myId = getUserId(); // 내 기기 고유 ID
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', myId); // 내 데이터만 가져오기
      
      if (error) {
        console.error('수파베이스 에러:', error.message);
        return;
      }
      
      // 최신순 정렬
      const sortedData = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sortedData);
    } catch (error) {
      console.error('데이터 로드 실패:', error.message);
    }
  }, []);


  // 비동기 호출
  useEffect(() => {
  let isMounted = true;

  const loadData = async () => {
    if (isMounted) {
      await fetchTransactions();
    }
  };

  loadData();

  return () => {
    isMounted = false; // 컴포넌트가 언마운트되면 상태 업데이트 방지
  };
}, [fetchTransactions]); // fetchTransactions가 바뀔 때만 실행 (currentMonth는 내부 로직에 이미 반영됨)

  // 3. 삭제 기능
  const handleDelete = async (id) => {
    if (!confirm("이 내역을 삭제할까요?")) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) fetchTransactions();
    else alert("삭제에 실패했습니다.");
  };

  // 날짜 계산 로직
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: new Date(year, month, 1).getDay() }, (_, i) => i);

  // 이번 달 총계
  const currentMonthData = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const totalIncome = currentMonthData.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = currentMonthData.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // 일별 요약
  const getDailySummary = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = transactions.filter(t => t.date === dateStr);
    const income = dayData.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = dayData.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense };
  };

  const selectedDayTransactions = transactions.filter(t => t.date === selectedDate);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans overflow-x-hidden">
      <header className="p-6 bg-white flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="text-gray-300 px-2 text-xl font-bold">◀</button>
        <h1 className="text-lg font-bold">{year}년 {month + 1}월</h1>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="text-gray-300 px-2 text-xl font-bold">▶</button>
      </header>

      <section className="px-6 py-4 bg-white grid grid-cols-3 gap-2 border-b border-slate-100 mb-2 shadow-sm">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold mb-1">이번 달 수입</p>
          <p className="text-xs font-bold text-blue-500">+{totalIncome.toLocaleString()}</p>
        </div>
        <div className="text-center border-x border-slate-50">
          <p className="text-[10px] text-gray-400 font-bold mb-1">이번 달 지출</p>
          <p className="text-xs font-bold text-red-500">-{totalExpense.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold mb-1">남은 금액</p>
          <p className="text-xs font-bold text-slate-800">{balance.toLocaleString()}</p>
        </div>
      </section>

      <div className="bg-white px-2 pt-2 pb-4 shadow-sm">
        <div className="grid grid-cols-7 text-center mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={`text-[10px] font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-300'}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {emptyDays.map(i => <div key={`empty-${i}`} className="h-12" />)}
          {days.map(day => {
            const { income, expense } = getDailySummary(day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            return (
              <div 
                key={day} 
                onClick={() => setSelectedDate(dateStr)}
                className={`h-12 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${isSelected ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50'}`}
              >
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>{day}</span>
                {!isSelected && (income > 0 || expense > 0) && (
                  <div className="flex gap-[2px] mt-1">
                    {income > 0 && <div className="w-1 h-1 bg-blue-500 rounded-full"></div>}
                    {expense > 0 && <div className="w-1 h-1 bg-red-400 rounded-full"></div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-sm font-bold text-slate-400 mb-4">{selectedDate.split('-')[2]}일 상세 내역</h3>
        <div className="space-y-3">
          {selectedDayTransactions.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-300 italic">기록된 내역이 없습니다.</p>
            </div>
          ) : (
            selectedDayTransactions.map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-lg">
                    {t.category === 'food' ? '🍱' : t.category === 'transport' ? '🚌' : t.category === 'shopping' ? '🛍️' : '🎸'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.title}</p>
                    <p className="text-[10px] text-gray-400">#{t.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-bold ${t.type === 'income' ? 'text-blue-500' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                  </p>
                  <button onClick={() => handleDelete(t.id)} className="text-slate-200 hover:text-red-300 px-1">✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button 
        onClick={() => setIsInputOpen(true)}
        className="fixed bottom-8 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light active:scale-95 transition-transform z-30"
      >+</button>

      {isInputOpen && (
        <InputForm onClose={() => setIsInputOpen(false)} onSave={fetchTransactions} initialDate={selectedDate} />
      )}
    </div>
  );
}

export default App;