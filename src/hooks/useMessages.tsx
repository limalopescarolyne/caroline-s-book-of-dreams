
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  name: string;
  message: string;
  created_at: string;
  is_visible: boolean;
  is_approved: boolean;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('Carregando mensagens...');
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens",
          variant: "destructive",
        });
        setMessages([]);
      } else if (data) {
        console.log(`${data.length} mensagens carregadas`);
        setMessages(data);
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar mensagens:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const approveMessage = async (id: string, approved: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_approved: approved })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar aprovação:', error);
        return false;
      }

      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, is_approved: approved } : msg
      ));
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      return false;
    }
  };

  const toggleVisibility = async (id: string, visible: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_visible: visible })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar visibilidade:', error);
        return false;
      }

      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, is_visible: visible } : msg
      ));
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      return false;
    }
  };

  const deleteMessage = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir mensagem:', error);
        return false;
      }

      setMessages(prev => prev.filter(msg => msg.id !== id));
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      return false;
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return {
    messages,
    loading,
    loadMessages,
    approveMessage,
    toggleVisibility,
    deleteMessage
  };
};
