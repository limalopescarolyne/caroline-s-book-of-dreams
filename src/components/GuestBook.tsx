
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MessageForm from './MessageForm';

interface Message {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

const GuestBook = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('is_approved', true)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setMessages(data);
        console.log(`${data.length} mensagens aprovadas carregadas`);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, [messages.length]);

  const handleMessageSaved = () => {
    loadMessages();
  };

  if (messages.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center text-pink-300">
          <p className="text-lg mb-4">Seja o primeiro a deixar uma mensagem!</p>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="glass-effect elegant-shadow bg-gradient-to-r from-pink-500/80 to-purple-600/80 hover:from-pink-600/90 hover:to-purple-700/90 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 border border-pink-400/30"
          >
            {showForm ? 'Fechar Formulário' : 'Deixar Mensagem'}
          </button>
        </div>

        {showForm && <MessageForm onMessageSaved={handleMessageSaved} />}
      </div>
    );
  }

  const currentMessage = messages[currentMessageIndex];

  return (
    <div className="space-y-8">
      <div className="flex justify-center items-center min-h-[300px]">
        <div
          className={`relative max-w-xl w-full mx-4 transition-all duration-500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="relative glass-effect elegant-shadow text-white p-8 rounded-xl border border-purple-500/30">
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-pink-400/50"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-pink-400/50"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-pink-400/50"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-pink-400/50"></div>

            <div className="text-center mb-6">
              <p className="text-lg leading-relaxed font-serif italic text-gray-100">
                "{currentMessage.message}"
              </p>
            </div>

            <div className="text-right">
              <p className="font-cursive text-xl font-semibold text-pink-300">
                - {currentMessage.name}
              </p>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
            </div>
          </div>

          <div className="absolute inset-0 bg-paper-texture opacity-20 rounded-xl pointer-events-none"></div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="glass-effect elegant-shadow bg-gradient-to-r from-pink-500/80 to-purple-600/80 hover:from-pink-600/90 hover:to-purple-700/90 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 border border-pink-400/30"
        >
          {showForm ? 'Fechar Formulário' : 'Deixar Mensagem'}
        </button>
      </div>

      {showForm && <MessageForm onMessageSaved={handleMessageSaved} />}
    </div>
  );
};

export default GuestBook;
