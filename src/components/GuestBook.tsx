
import React, { useState, useEffect } from 'react';

interface Message {
  name: string;
  message: string;
}

const GuestBook = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Default messages if file is empty
  const defaultMessages: Message[] = [
    { name: "Maria Silva", message: "Que essa nova fase seja repleta de alegrias e conquistas! Feliz aniversário, Caroline!" },
    { name: "João Santos", message: "Aos 15 anos, que você continue brilhando como sempre! Parabéns, querida!" },
    { name: "Ana Costa", message: "Quinze anos de pura doçura! Que seus sonhos se realizem sempre!" },
    { name: "Pedro Lima", message: "Caroline, que essa idade seja o início de grandes aventuras! Felicidades!" },
    { name: "Lucia Oliveira", message: "Uma menina especial que se torna uma jovem ainda mais especial! Parabéns!" },
    { name: "Carlos Ferreira", message: "Que os 15 anos tragam muita felicidade e realizações! Feliz aniversário!" },
    { name: "Beatriz Souza", message: "Caroline, você é luz! Que essa data seja sempre lembrada com carinho!" },
    { name: "Roberto Alves", message: "Quinze anos de alegria! Que venham muitos mais! Parabéns, Caroline!" },
    { name: "Fernanda Ribeiro", message: "Uma data especial para uma pessoa ainda mais especial! Felicidades!" },
    { name: "Gabriel Santos", message: "Aos 15 anos, que cada dia seja uma nova descoberta! Parabéns!" },
    { name: "Isabella Costa", message: "Caroline, que sua juventude seja repleta de sonhos realizados!" },
    { name: "Marcos Silva", message: "Quinze anos de pureza e bondade! Continue sendo essa pessoa maravilhosa!" },
    { name: "Camila Oliveira", message: "Que essa idade seja o portal para grandes conquistas! Feliz aniversário!" },
    { name: "Diego Ferreira", message: "Caroline, você merece todo o amor do mundo! Parabéns pelos 15 anos!" },
    { name: "Leticia Santos", message: "Uma jovem especial que merece toda felicidade! Parabéns, querida!" },
    { name: "André Costa", message: "Que os 15 anos sejam apenas o começo de uma vida incrível!" },
    { name: "Juliana Silva", message: "Caroline, que sua alegria contagie sempre todos ao seu redor!" },
    { name: "Rafael Oliveira", message: "Quinze anos de luz e amor! Que venham muitos mais! Parabéns!" },
    { name: "Mariana Santos", message: "Uma data única para uma pessoa única! Feliz aniversário, Caroline!" },
    { name: "Thiago Costa", message: "Que essa nova fase seja repleta de descobertas maravilhosas! Parabéns!" }
  ];

  useEffect(() => {
    // In production, this would load from /public/texts/mensagens.txt
    // For now, using default messages
    setMessages(defaultMessages);
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  if (messages.length === 0) {
    return <div className="text-center text-gray-500">Carregando mensagens...</div>;
  }

  const currentMessage = messages[currentMessageIndex];

  return (
    <div className="flex justify-center items-center min-h-[300px]">
      <div 
        className={`relative max-w-md w-full mx-4 transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Vintage card background */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-8 rounded-lg shadow-2xl border-4 border-amber-200 relative">
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-400"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-400"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-400"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-400"></div>
          
          {/* Message content */}
          <div className="text-center mb-6">
            <p className="text-gray-700 text-lg leading-relaxed font-serif italic">
              "{currentMessage.message}"
            </p>
          </div>
          
          {/* Signature */}
          <div className="text-right">
            <p className="text-gray-600 font-cursive text-xl font-semibold">
              - {currentMessage.name}
            </p>
          </div>
          
          {/* Decorative flourish */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          </div>
        </div>
        
        {/* Paper texture overlay */}
        <div className="absolute inset-0 bg-paper-texture opacity-20 rounded-lg pointer-events-none"></div>
      </div>
    </div>
  );
};

export default GuestBook;
