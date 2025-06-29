
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface MessageFormProps {
  onMessageSaved: () => void;
}

const MessageForm = ({ onMessageSaved }: MessageFormProps) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !message.trim()) {
      alert('Por favor, preencha seu nome e mensagem!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          name: name.trim(),
          message: message.trim(),
        });
      
      if (error) {
        console.error('Erro ao salvar mensagem:', error);
        alert('Erro ao salvar mensagem. Tente novamente.');
      } else {
        alert('Mensagem enviada com sucesso! Será aprovada em breve. ✨');
        setName('');
        setMessage('');
        onMessageSaved();
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar mensagem. Tente novamente.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white/80 rounded-xl shadow-lg border border-pink-200">
      <h3 className="text-xl font-serif text-gray-800 mb-4 text-center">
        Deixe sua Mensagem
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Seu Nome
          </label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Digite seu nome..."
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Sua Mensagem
          </label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Escreva sua mensagem para Caroline..."
            rows={4}
            disabled={isSubmitting}
          />
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </form>
    </div>
  );
};

export default MessageForm;
