'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api, { resolveMediaUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Check, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function SkinQuizPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<{ questionId: string; optionId: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState<any[] | null>(null);

  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/skin-quiz/questions');
      setQuestions(res.data.data || []);
    } catch (error) {
      console.error('Failed to load quiz questions', error);
    } finally {
      setLoading(false);
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
    setIsSubmitting(true);
    try {
      const res = await api.post('/skin-quiz/submit', { responses: finalResponses });
      setRecommendations(res.data.data.recommendations || []);
    } catch (error) {
      console.error('Failed to submit quiz', error);
      alert('Failed to submit quiz results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setRecommendations(null);
    setCurrentStep(0);
    setResponses([]);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-20 px-4 max-w-lg text-center space-y-6">
        <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black text-purple-950 tracking-tight">Personalized Skin Quiz</h1>
        <p className="text-sm text-gray-500">
          Find the perfect skincare routine tailored to your unique skin profile. Sign in to start the quiz and unlock expert product matches.
        </p>
        <div className="pt-4">
          <Link href="/auth/login?redirect=/skin-quiz">
            <Button size="lg" className="w-full bg-purple-950 hover:bg-purple-900 rounded-xl font-bold py-6 text-sm">
              Sign In to Start Quiz
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-32 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="text-xs font-semibold">Loading Skin Quiz questions...</span>
      </div>
    );
  }

  const progressPercent = questions.length > 0 ? ((currentStep) / questions.length) * 100 : 0;

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-purple-950 tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-pink-500" />
          Skin Profile Quiz
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Answer the questions below to discover your custom beauty recommendations
        </p>
      </div>

      {recommendations ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <Card className="rounded-3xl border-gray-100 shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-purple-950 to-purple-900 text-white p-8 text-center space-y-2">
              <CardTitle className="text-2xl font-black">Your Recommendations Are Ready!</CardTitle>
              <CardDescription className="text-white/75 text-xs">
                We've selected these product matches based on your answers.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((prod) => {
                    const img = prod.images?.[0]?.url || prod.image || '';
                    return (
                      <Card key={prod.id} className="flex flex-col rounded-2xl border-gray-100 shadow-sm overflow-hidden hover:border-purple-200 transition-colors">
                        <div className="h-48 bg-muted relative overflow-hidden flex items-center justify-center">
                          {img ? (
                            <img src={resolveMediaUrl(img)} alt={prod.name} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-xs text-gray-400">No Image</span>
                          )}
                        </div>
                        <CardHeader className="p-4 flex-grow">
                          <CardTitle className="text-sm font-bold text-gray-800 line-clamp-1">{prod.name}</CardTitle>
                          <CardDescription className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">{prod.brand?.name || 'Skincare'}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                          <span className="text-sm font-black text-purple-950">₹{parseFloat(prod.price).toFixed(2)}</span>
                          <Link href={`/products/${prod.slug}`}>
                            <Button size="sm" className="bg-purple-950 hover:bg-purple-900 rounded-lg text-[10px] font-bold h-8 flex items-center gap-1">
                              View Details
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-gray-500 font-medium">
                  No matches found right now. Try updating your answers or retaking the quiz.
                </div>
              )}
            </CardContent>
            <CardFooter className="p-6 bg-gray-50 border-t flex justify-center">
              <Button onClick={handleRestart} variant="outline" className="rounded-xl font-bold flex items-center gap-2 text-purple-950 border-purple-950/20 hover:bg-purple-50">
                <RefreshCw className="h-4 w-4" />
                Retake Quiz
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : questions.length > 0 ? (
        <Card className="rounded-3xl border-gray-100 shadow-xl overflow-hidden bg-white max-w-xl mx-auto">
          {/* Progress bar */}
          <div className="w-full bg-gray-100 h-1">
            <div 
              className="bg-pink-500 h-1 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <CardHeader className="p-6 border-b border-gray-50 flex flex-row items-center justify-between">
            <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">
              Question {currentStep + 1} of {questions.length}
            </span>
            {currentStep > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="h-8 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Back
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <h3 className="text-lg font-black text-purple-950 leading-snug">
              {questions[currentStep].question}
            </h3>

            <div className="flex flex-col gap-3">
              {questions[currentStep].options.map((option: any) => {
                const isSelected = responses.find(r => r.questionId === questions[currentStep].id)?.optionId === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(questions[currentStep].id, option.id)}
                    disabled={isSubmitting}
                    className={`w-full text-left rounded-2xl border p-4 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-purple-950 bg-purple-50/10 text-purple-950 shadow-sm'
                        : 'border-gray-200 bg-white hover:bg-purple-50/5 hover:border-purple-200 text-gray-700'
                    }`}
                  >
                    <span>{option.text}</span>
                    {isSelected && <Check className="h-4 w-4 text-purple-950" />}
                  </button>
                );
              })}
            </div>
          </CardContent>

          {isSubmitting && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center text-purple-950 font-bold gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span>Analyzing your answers...</span>
            </div>
          )}
        </Card>
      ) : (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold">
          No questions loaded. Please contact support.
        </div>
      )}
    </div>
  );
}
