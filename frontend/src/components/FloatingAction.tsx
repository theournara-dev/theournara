'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Sparkles, X } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function FloatingAction() {
  const [open, setOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<{ questionId: string; optionId: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const { user } = useAuthStore();
  const widgetRef = useRef<HTMLDivElement>(null);

  // Click away listener for support bubble
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/skin-quiz/questions');
      setQuestions(res.data.data || []);
    } catch (error) {
      console.error('Failed to load quiz questions', error);
    }
  };

  const startQuiz = () => {
    setOpen(false);
    setQuizOpen(true);
    setRecommendations(null);
    setCurrentStep(0);
    setResponses([]);
    if (questions.length === 0) {
      fetchQuestions();
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    const newResponses = [...responses];
    const existingIndex = newResponses.findIndex((r) => r.questionId === questionId);
    if (existingIndex > -1) {
      newResponses[existingIndex].optionId = optionId;
    } else {
      newResponses.push({ questionId, optionId });
    }
    setResponses(newResponses);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitQuiz(newResponses);
    }
  };

  const submitQuiz = async (finalResponses: { questionId: string; optionId: string }[]) => {
    if (!user) {
      alert('Please login to save your quiz results.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/skin-quiz/submit', { responses: finalResponses });
      setRecommendations(res.data.data.recommendations || []);
    } catch (error) {
      console.error('Failed to submit quiz', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolveMediaUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/100';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded Menu Options */}
      {open && (
        <div className="flex flex-col gap-2 items-end mb-2 animate-in slide-in-from-bottom duration-200">
          {/* Whatsapp Support */}
          <button
            onClick={() => window.open('https://api.whatsapp.com/send?phone=1234567890', '_blank')}
            className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-[#128C7E] hover:scale-105 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Expert
          </button>

          {/* Skin Quiz Modal Trigger */}
          <button
            onClick={startQuiz}
            className="flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-pink-600 hover:scale-105 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Start Skin Quiz
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${
          open
            ? 'bg-gray-100 text-purple-950 hover:bg-gray-200'
            : 'bg-gradient-to-tr from-purple-950 to-purple-900 text-white hover:from-purple-900 hover:to-purple-850'
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 animate-pulse" />}
      </button>

      {/* Skin Quiz Modal Dialog */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setQuizOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-extrabold text-purple-950">Skin Profile Quiz</h3>
              <p className="text-xs text-gray-400 mt-1">
                Help us understand your skin better to recommend the perfect products.
              </p>
            </div>

            <div className="py-2">
              {recommendations ? (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-pink-500">Your Recommendations are ready!</h4>
                  {recommendations.length > 0 ? (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {recommendations.map((prod: any) => (
                        <div key={prod.id} className="flex gap-3 items-center rounded-xl border border-gray-100 p-2.5 bg-gray-50/50">
                          <img
                            src={resolveMediaUrl(prod.images?.[0]?.url)}
                            alt={prod.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{prod.name}</p>
                            <p className="text-[10px] text-gray-400">${parseFloat(prod.price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">We couldn't find an exact match right now, but stay tuned!</p>
                  )}
                  <button
                    onClick={() => setQuizOpen(false)}
                    className="w-full text-center rounded-xl bg-purple-950 py-2.5 text-xs font-extrabold text-white mt-4"
                  >
                    Close
                  </button>
                </div>
              ) : questions.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-base text-gray-800">
                    {currentStep + 1}. {questions[currentStep].question}
                  </h4>
                  <div className="flex flex-col gap-2">
                    {questions[currentStep].options.map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(questions[currentStep].id, option.id)}
                        disabled={isSubmitting}
                        className="w-full text-left rounded-xl border border-gray-100 bg-white hover:bg-purple-50/20 hover:border-purple-950/20 p-3.5 text-xs font-bold text-gray-700 transition-all cursor-pointer"
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center animate-pulse py-10 text-xs font-semibold text-gray-400">Loading quiz...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
