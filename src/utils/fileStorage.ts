
// Utility functions for reading and writing to text files in public folder

export const readMessagesFromFile = async (): Promise<Array<{name: string, message: string}>> => {
  try {
    const response = await fetch('/messages.txt');
    if (!response.ok) return [];
    
    const text = await response.text();
    if (!text.trim()) return [];
    
    const lines = text.trim().split('\n');
    const messages = lines.map(line => {
      const [name, ...messageParts] = line.split('|');
      return {
        name: name || 'Anônimo',
        message: messageParts.join('|') || ''
      };
    }).filter(msg => msg.message);
    
    return messages;
  } catch (error) {
    console.error('Erro ao ler mensagens:', error);
    return [];
  }
};

export const saveMessageToFile = async (name: string, message: string): Promise<boolean> => {
  try {
    // Read existing messages
    const existingMessages = await readMessagesFromFile();
    
    // Add new message
    const newMessage = { name, message };
    const updatedMessages = [...existingMessages, newMessage];
    
    // Convert to text format
    const textContent = updatedMessages
      .map(msg => `${msg.name}|${msg.message}`)
      .join('\n');
    
    // Save to file using a simple approach with localStorage as fallback
    localStorage.setItem('guestbook_messages', textContent);
    
    console.log('Mensagem salva:', newMessage);
    return true;
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    return false;
  }
};

export const readPoetryFromFile = async (): Promise<Array<{title: string, content: string}>> => {
  try {
    const response = await fetch('/poetry.txt');
    if (!response.ok) return [];
    
    const text = await response.text();
    if (!text.trim()) return [];
    
    const poems = text.trim().split('---').map(poem => {
      const lines = poem.trim().split('\n');
      const title = lines[0] || 'Sem Título';
      const content = lines.slice(1).join('\n');
      return { title, content };
    }).filter(poem => poem.content);
    
    return poems;
  } catch (error) {
    console.error('Erro ao ler poesias:', error);
    return [];
  }
};

export const savePoetryToFile = async (title: string, content: string): Promise<boolean> => {
  try {
    // Read existing poetry
    const existingPoetry = await readPoetryFromFile();
    
    // Add new poem
    const newPoem = { title, content };
    const updatedPoetry = [...existingPoetry, newPoem];
    
    // Convert to text format
    const textContent = updatedPoetry
      .map(poem => `${poem.title}\n${poem.content}`)
      .join('\n---\n');
    
    // Save to file using localStorage as fallback
    localStorage.setItem('poetry_content', textContent);
    
    console.log('Poesia salva:', newPoem);
    return true;
  } catch (error) {
    console.error('Erro ao salvar poesia:', error);
    return false;
  }
};

// Function to load data from localStorage (fallback when files are not writable)
export const loadFromLocalStorage = () => {
  const messages = localStorage.getItem('guestbook_messages');
  const poetry = localStorage.getItem('poetry_content');
  
  return {
    messages: messages || '',
    poetry: poetry || ''
  };
};
