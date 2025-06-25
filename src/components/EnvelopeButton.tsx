import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveMessageToFile } from '@/utils/fileStorage';

const EnvelopeButton = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = async () => {
    setIsClicked(true);

    // Save a system message indicating envelope was clicked
    const timestamp = new Date().toLocaleString('pt-BR');
    await saveMessageToFile('Sistema', `Envelope clicado em ${timestamp}`);

    setTimeout(() => {
      alert('Mensagem registrada com sucesso! ✨');
      setIsClicked(false);
    }, 300);
  };

  const glowStyle = {
    boxShadow: isClicked 
      ? '0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(147, 51, 234, 0.4)'
      : '0 0 10px rgba(236, 72, 153, 0.3), 0 0 30px rgba(147, 51, 234, 0.3)',
    animation: isClicked ? 'none' : 'pulse 2s ease-in-out infinite',
  };

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        disabled={isClicked}
        className={`
          relative overflow-hidden isolate
          bg-gradient-to-r from-pink-600 to-purple-700
          text-white font-semibold py-4 px-8 rounded-full
          shadow-lg ring-1 ring-white/10
          hover:scale-105 hover:-translate-y-1 transition-all duration-300
          border border-white/10
        `}
        style={glowStyle}
      >
        <Mail className={`mr-2 h-5 w-5 transition-transform duration-300 ${isClicked ? 'scale-110' : ''}`} />
        {isClicked ? 'Registrando...' : 'Enviar Mensagem'}

        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-full z-[-1]" />

        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-ping" />
      </Button>
    </div>
  );
};

export default EnvelopeButton;
