
import React, { useState, useEffect } from 'react';

interface Poem {
  title: string;
  content: string;
}

const PoetrySection = () => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [currentPoemIndex, setCurrentPoemIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Default poems if file is empty
  const defaultPoems: Poem[] = [
    { title: "Quinze Primaveras", content: "Quinze anos de sonhos,\nDe risos e esperança,\nCada dia uma descoberta,\nCada momento, uma lembrança." },
    { title: "Juventude Dourada", content: "Como flores que desabrocham,\nTeus quinze anos chegaram,\nTrazendo luz e beleza,\nPara todos que te amaram." },
    { title: "Sonhos de Menina", content: "Aos quinze anos sonhamos,\nCom o futuro brilhante,\nCada estrela no céu,\nÉ um desejo pulsante." },
    { title: "Doce Quinze", content: "Quinze velas no bolo,\nQuinze desejos no ar,\nQuinze anos de alegria,\nPara sempre recordar." },
    { title: "Flor da Idade", content: "Na flor da idade estás,\nRadiante como o sol,\nQuinze anos de pureza,\nComo canto de rouxinol." },
    { title: "Caminhada", content: "Quinze passos já dados,\nNa estrada da vida,\nCada um com sua marca,\nCada um, uma partida." },
    { title: "Esperança", content: "Aos quinze anos a vida,\nSe abre como um livro,\nCada página nova,\nÉ um sonho que vibro." },
    { title: "Borboleta", content: "Como borboleta nova,\nQue aprende a voar,\nAos quinze anos descobres,\nO mundo a explorar." },
    { title: "Estrela Brilhante", content: "És estrela que brilha,\nNo céu da juventude,\nQuinze anos de luz,\nDe amor e gratitude." },
    { title: "Jardim da Alma", content: "No jardim da tua alma,\nFlorescem os quinze anos,\nCom perfume de sonhos,\nE cores de veranios." },
    { title: "Rio da Vida", content: "Como rio que corre,\nPara o mar infinito,\nTeus quinze anos fluem,\nEm canto bendito." },
    { title: "Aurora", content: "És aurora nascente,\nDos teus quinze abriles,\nIluminando o mundo,\nCom sorrisos gentis." },
    { title: "Melodia", content: "Quinze notas musicais,\nCompõem tua canção,\nCada ano uma melodia,\nNo teu coração." },
    { title: "Dança", content: "Dança a vida contigo,\nNos teus quinze anos,\nCada passo é poesia,\nSem medos nem danos." },
    { title: "Cristal", content: "Como cristal puro,\nBrilhas aos quinze anos,\nRefletindo a beleza,\nDos teus sonhos profanos." },
    { title: "Vento", content: "O vento dos quinze anos,\nSopra em teu favor,\nLevando teus sonhos,\nCom todo o amor." },
    { title: "Lua Cheia", content: "Como lua cheia,\nBrilhas na escuridão,\nQuinze anos de luz,\nEm teu coração." },
    { title: "Pássaro", content: "Pássaro livre és,\nAos quinze anos de idade,\nVoando alto,\nRumo à felicidade." },
    { title: "Arco-íris", content: "Arco-íris de sonhos,\nPinta o céu dos quinze,\nCom cores vibrantes,\nQue nunca se extingue." },
    { title: "Fonte", content: "Fonte de alegria,\nBrotas aos quinze anos,\nRegando a vida,\nCom teus encantos vários." }
  ];

  const shuffleArray = (array: Poem[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    // In production, this would load from /public/texts/poemas.txt
    // For now, using default poems
    const shuffledPoems = shuffleArray(defaultPoems);
    setPoems(shuffledPoems);
  }, []);

  useEffect(() => {
    if (poems.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentPoemIndex((prev) => (prev + 1) % poems.length);
        setIsVisible(true);
      }, 600);
    }, 6000);

    return () => clearInterval(interval);
  }, [poems.length]);

  if (poems.length === 0) {
    return <div className="text-center text-gray-500">Carregando poesias...</div>;
  }

  const currentPoem = poems[currentPoemIndex];

  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div 
        className={`relative max-w-lg w-full mx-4 transition-all duration-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="glass-effect elegant-shadow p-8 rounded-xl border border-purple-500/30 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400"></div>
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-60"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-60"></div>
          
          {/* Poem title */}
          <div className="text-center mb-6">
            <h4 className="text-2xl font-serif text-white mb-2 glow-text">
              {currentPoem.title}
            </h4>
            <div className="w-16 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto"></div>
          </div>
          
          {/* Poem content */}
          <div className="text-center">
            <p className="text-gray-100 text-lg leading-relaxed font-serif whitespace-pre-line">
              {currentPoem.content}
            </p>
          </div>
          
          {/* Decorative flourishes */}
          <div className="absolute top-4 right-4 text-pink-300 opacity-50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2L12.09 8.26L18 10L12.09 11.74L10 18L7.91 11.74L2 10L7.91 8.26L10 2Z"/>
            </svg>
          </div>
          
          <div className="absolute bottom-4 left-4 text-purple-300 opacity-50">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2L12.09 8.26L18 10L12.09 11.74L10 18L7.91 11.74L2 10L7.91 8.26L10 2Z"/>
            </svg>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-4 space-x-1">
          {poems.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentPoemIndex % 5
                  ? 'bg-purple-400 scale-125'
                  : 'bg-purple-200/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PoetrySection;
