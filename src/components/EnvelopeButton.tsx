
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EnvelopeButton = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    
    // Show success message
    setTimeout(() => {
      alert('Mensagem enviada com sucesso! ✨');
      setIsClicked(false);
    }, 300);
  };

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        disabled={isClicked}
        className={`
          relative overflow-hidden
          bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700
          text-white font-semibold py-4 px-8 rounded-full
          shadow-2xl hover:shadow-3xl
          transform transition-all duration-300
          hover:scale-105 hover:-translate-y-1
          border-2 border-white/20
          ${isClicked ? 'animate-pulse' : 'animate-pulse'}
        `}
        style={{
          boxShadow: '0 20px 40px rgba(219, 39, 119, 0.3), 0 0 20px rgba(147, 51, 234, 0.2)',
          animation: isClicked ? 'none' : 'glow 2s ease-in-out infinite alternate',
        }}
      >
        <Mail className={`mr-2 h-5 w-5 transition-transform duration-300 ${isClicked ? 'scale-110' : ''}`} />
        {isClicked ? 'Enviando...' : 'Enviar Mensagem'}
        
        {/* Floating glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
        
        {/* Sparkle effect */}
        <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-70 animate-ping"></div>
      </Button>
      
      <style jsx>{`
        @keyframes glow {
          0% { box-shadow: 0 20px 40px rgba(219, 39, 119, 0.3), 0 0 20px rgba(147, 51, 234, 0.2); }
          100% { box-shadow: 0 25px 50px rgba(219, 39, 119, 0.4), 0 0 30px rgba(147, 51, 234, 0.3); }
        }
      `}</style>
    </div>
  );
};

export default EnvelopeButton;
