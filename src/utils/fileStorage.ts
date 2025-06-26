
// Utility functions for reading and writing to localStorage with improved performance

export const readMessagesFromFile = async (): Promise<Array<{name: string, message: string}>> => {
  try {
    // Primeiro tenta ler do localStorage
    const localMessages = localStorage.getItem('guestbook_messages');
    if (localMessages) {
      const lines = localMessages.trim().split('\n').filter(line => line.trim());
      const messages = lines.map(line => {
        const [name, ...messageParts] = line.split('|');
        return {
          name: name || 'Anônimo',
          message: messageParts.join('|') || ''
        };
      }).filter(msg => msg.message.trim());
      
      console.log(`Mensagens carregadas do localStorage: ${messages.length}`);
      return messages;
    }

    // Fallback: tenta ler do arquivo
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
    
    console.log(`Mensagens carregadas do arquivo: ${messages.length}`);
    return messages;
  } catch (error) {
    console.error('Erro ao ler mensagens:', error);
    return [];
  }
};

export const saveMessageToFile = async (name: string, message: string): Promise<boolean> => {
  try {
    // Lê mensagens existentes
    const existingMessages = await readMessagesFromFile();
    
    // Adiciona nova mensagem
    const newMessage = { name: name.trim(), message: message.trim() };
    const updatedMessages = [...existingMessages, newMessage];
    
    // Converte para formato de texto
    const textContent = updatedMessages
      .map(msg => `${msg.name}|${msg.message}`)
      .join('\n');
    
    // Salva no localStorage
    localStorage.setItem('guestbook_messages', textContent);
    
    console.log('Mensagem salva com sucesso:', newMessage);
    return true;
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    return false;
  }
};

export const readPoetryFromFile = async (): Promise<Array<{title: string, content: string}>> => {
  try {
    // Primeiro tenta ler do localStorage
    const localPoetry = localStorage.getItem('poetry_content');
    if (localPoetry) {
      const poems = localPoetry.trim().split('---').map(poem => {
        const lines = poem.trim().split('\n');
        const title = lines[0] || 'Sem Título';
        const content = lines.slice(1).join('\n');
        return { title, content };
      }).filter(poem => poem.content.trim());
      
      console.log(`Poesias carregadas do localStorage: ${poems.length}`);
      return poems;
    }

    // Fallback: tenta ler do arquivo
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
    
    console.log(`Poesias carregadas do arquivo: ${poems.length}`);
    return poems;
  } catch (error) {
    console.error('Erro ao ler poesias:', error);
    return [];
  }
};

export const savePoetryToFile = async (title: string, content: string): Promise<boolean> => {
  try {
    // Lê poesias existentes
    const existingPoetry = await readPoetryFromFile();
    
    // Adiciona nova poesia
    const newPoem = { title: title.trim(), content: content.trim() };
    const updatedPoetry = [...existingPoetry, newPoem];
    
    // Converte para formato de texto
    const textContent = updatedPoetry
      .map(poem => `${poem.title}\n${poem.content}`)
      .join('\n---\n');
    
    // Salva no localStorage
    localStorage.setItem('poetry_content', textContent);
    
    console.log('Poesia salva com sucesso:', newPoem);
    return true;
  } catch (error) {
    console.error('Erro ao salvar poesia:', error);
    return false;
  }
};

// Função para carregar dados do localStorage
export const loadFromLocalStorage = () => {
  const messages = localStorage.getItem('guestbook_messages');
  const poetry = localStorage.getItem('poetry_content');
  
  return {
    messages: messages || '',
    poetry: poetry || ''
  };
};

// Função para limpar dados (útil para debug)
export const clearLocalStorage = () => {
  localStorage.removeItem('guestbook_messages');
  localStorage.removeItem('poetry_content');
  console.log('Dados locais limpos');
};
