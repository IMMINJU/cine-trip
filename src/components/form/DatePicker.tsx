"use client";

import { useState, useRef, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";

interface DatePickerProps {
  value: string; // yyyy-MM-dd format
  onChange: (value: string) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() =>
    value ? new Date(value) : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 첫 주의 시작 요일 (0: 일요일)
  const startDayOfWeek = monthStart.getDay();

  const handleDateSelect = (date: Date) => {
    onChange(format(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div ref={containerRef} className={`relative inline-block ${className || ""}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer rounded-lg px-2 py-0.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-[12px] text-gray-400">
          {selectedDate
            ? format(selectedDate, "M월 d일", { locale: ko })
            : "날짜 선택"
          }
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] p-2 w-[220px]">
          {/* 헤더: 월 이동 */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-medium text-gray-700">
              {format(currentMonth, "yyyy년 M월", { locale: ko })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-0.5 mb-0.5">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className={`text-center text-[10px] font-medium py-0.5 ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* 빈 칸 (첫 주 시작 전) */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="w-7 h-7" />
            ))}

            {/* 날짜들 */}
            {days.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const dayOfWeek = day.getDay();

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`w-7 h-7 rounded text-xs transition-colors ${
                    isSelected
                      ? "bg-sky-500 text-white font-medium"
                      : isToday
                      ? "bg-sky-50 text-sky-600 font-medium"
                      : dayOfWeek === 0
                      ? "text-red-500 hover:bg-gray-100"
                      : dayOfWeek === 6
                      ? "text-blue-500 hover:bg-gray-100"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* 오늘 버튼 */}
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              setCurrentMonth(today);
              handleDateSelect(today);
            }}
            className="w-full mt-2 py-1.5 text-xs text-sky-600 hover:bg-sky-50 rounded transition-colors"
          >
            오늘
          </button>
        </div>
      )}
    </div>
  );
}
