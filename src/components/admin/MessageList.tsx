
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, EyeOff, Check, X } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  message: string;
  created_at: string;
  is_visible: boolean;
  is_approved: boolean;
}

interface MessageListProps {
  messages: Message[];
  onApprove: (id: string, approved: boolean) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
}

const MessageList = ({ messages, onApprove, onToggleVisibility, onDelete }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <Card className="glass-effect border border-pink-200/30">
        <CardContent className="text-center py-8">
          <p className="text-gray-400">Nenhuma mensagem encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id} className="glass-effect border border-pink-200/30">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg text-white">{message.name}</CardTitle>
                <CardDescription className="text-pink-200">
                  {new Date(message.created_at).toLocaleString('pt-BR')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={message.is_approved ? "default" : "secondary"}>
                  {message.is_approved ? "Aprovada" : "Pendente"}
                </Badge>
                <Badge variant={message.is_visible ? "default" : "secondary"}>
                  {message.is_visible ? "Visível" : "Oculta"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 mb-4">{message.message}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onApprove(message.id, !message.is_approved)}
                className={message.is_approved 
                  ? "bg-orange-500 hover:bg-orange-600" 
                  : "bg-green-500 hover:bg-green-600"
                }
              >
                {message.is_approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                {message.is_approved ? "Reprovar" : "Aprovar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleVisibility(message.id, !message.is_visible)}
                className="border-blue-300/30 text-blue-200 hover:bg-blue-500/10"
              >
                {message.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {message.is_visible ? "Ocultar" : "Mostrar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(message.id)}
                className="border-red-300/30 text-red-200 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MessageList;
