import React, { useState, useEffect } from 'react';
import { readMessagesFromFile, loadFromLocalStorage } from '@/utils/fileStorage';
import MessageForm from './MessageForm';

interface Message {
  name: string;
  message: string;
}

const GuestBook = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [randomizedMessages, setRandomizedMessages] = useState<Message[]>([]);

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

  // Function to shuffle array randomly
  const shuffleArray = (array: Message[]): Message[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadMessages = async () => {
    try {
      console.log('Carregando mensagens automaticamente...');
      
      // Try to read from file first
      const fileMessages = await readMessagesFromFile();
      let allMessages: Message[] = [];
      
      // If no file messages, try localStorage
      if (fileMessages.length === 0) {
        const localData = loadFromLocalStorage();
        if (localData.messages) {
          const localMessages = localData.messages.split('\n').map(line => {
            const [name, ...messageParts] = line.split('|');
            return {
              name: name || 'Anônimo',
              message: messageParts.join('|') || ''
            };
          }).filter(msg => msg.message);
          
          if (localMessages.length > 0) {
            allMessages = [...defaultMessages, ...localMessages];
          } else {
            allMessages = defaultMessages;
          }
        } else {
          allMessages = defaultMessages;
        }
      } else {
        allMessages = [...defaultMessages, ...fileMessages];
      }
      
      // Randomize the order of messages for better user experience
      const randomized = shuffleArray(allMessages);
      
      setMessages(allMessages);
      setRandomizedMessages(randomized);
      
      console.log(`Total de mensagens carregadas: ${allMessages.length} (randomizadas)`);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      const randomized = shuffleArray(defaultMessages);
      setMessages(defaultMessages);
      setRandomizedMessages(randomized);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (randomizedMessages.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % randomizedMessages.length);
        setIsVisible(true);
      }, 500);
    }, 6000); // Slower transition for better reading

    return () => clearInterval(interval);
  }, [randomizedMessages.length]);

  const handleMessageSaved = () => {
    loadMessages(); // Reload and re-randomize messages when a new one is saved
  };

  if (randomizedMessages.length === 0) {
    return (
      <div className="text-center text-pink-300 animate-pulse">
        Carregando mensagens automaticamente...
      </div>
    );
  }

  const currentMessage = randomizedMessages[currentMessageIndex];

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
          {showForm ? 'Fechar Formulário' : 'Adicionar Mensagem'}
        </button>
      </div>

      {showForm && <MessageForm onMessageSaved={handleMessageSaved} />}
    </div>
  );
};

export default GuestBook;
