'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function SkinQuizModal() {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<{ questionId: string; optionId: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (open && questions.length === 0) {
      fetchQuestions();
    }
  }, [open]);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/skin-quiz/questions');
      setQuestions(res.data.data);
    } catch (error) {
      console.error('Failed to load quiz questions', error);
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
      setRecommendations(res.data.data.recommendations);
    } catch (error) {
      console.error('Failed to submit quiz', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Take the Skin Quiz</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Skin Profile Quiz</DialogTitle>
          <DialogDescription>
            Help us understand your skin better to recommend the perfect products.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {recommendations ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary">Your Recommendations are ready!</h3>
              {recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {recommendations.map((prod: any) => (
                    <li key={prod.id} className="p-3 border rounded-md shadow-sm">
                      <p className="font-medium">{prod.name}</p>
                      <p className="text-sm text-muted-foreground">${prod.price}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>We couldn't find an exact match right now, but stay tuned!</p>
              )}
              <Button onClick={() => setOpen(false)} className="w-full mt-4">Close</Button>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                {currentStep + 1}. {questions[currentStep].question}
              </h3>
              <div className="flex flex-col gap-2">
                {questions[currentStep].options.map((option: any) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => handleOptionSelect(questions[currentStep].id, option.id)}
                    disabled={isSubmitting}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center animate-pulse py-10">Loading quiz...</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
