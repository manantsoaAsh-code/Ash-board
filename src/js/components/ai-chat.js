export function createAIChat() {
  return {
    sendMessage(message) {
      console.log('Message AI envoyé:', message);
      return { reply: 'Réponse de l’assistant en cours de configuration.' };
    },
  };
}
