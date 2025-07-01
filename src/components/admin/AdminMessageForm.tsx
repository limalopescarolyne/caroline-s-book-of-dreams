
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminMessageFormProps {
  onMessageSaved: () => void;
}

const AdminMessageForm = ({ onMessageSaved }: AdminMessageFormProps) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !message.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome e a mensagem!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          name: name.trim(),
          message: message.trim(),
          is_approved: true, // Admin pode aprovar diretamente
          is_visible: true,
        });
      
      if (error) {
        console.error('Erro ao salvar mensagem:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar mensagem. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Mensagem criada e aprovada com sucesso!",
        });
        setName('');
        setMessage('');
        onMessageSaved();
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="glass-effect border border-pink-200/30">
      <CardHeader>
        <CardTitle className="text-white">Cadastrar Nova Mensagem</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-name" className="block text-sm font-medium text-gray-300 mb-1">
              Nome
            </label>
            <Input
              type="text"
              id="admin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Digite o nome..."
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="admin-message" className="block text-sm font-medium text-gray-300 mb-1">
              Mensagem
            </label>
            <Textarea
              id="admin-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Escreva a mensagem..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Mensagem'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminMessageForm;
