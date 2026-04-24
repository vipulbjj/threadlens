export function parseWhatsAppChat(text: string) {
  // Matches standard WhatsApp export formats:
  // Android: "12/05/24, 10:14 PM - Vipul: Hello"
  // iOS: "[14/2/26, 10:00:40 PM] Vipul Bajaj: Hello"
  const regex = /(?:\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[A-Z]{2})?)\]|(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?:\s?[A-Z]{2})?)\s-)\s([^:]+):\s([\s\S]*?)(?=(?:\[\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}(?::\d{2})?(?:\s?[A-Z]{2})?\]|\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}(?:\s?[A-Z]{2})?\s-)|$)/g;
  
  const messages = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const date = match[1] || match[3];
    const time = match[2] || match[4];
    const sender = match[5].trim();
    const message = match[6].trim();
    
    // Ignore system messages
    if (!message.includes("Messages and calls are end-to-end encrypted")) {
      messages.push({ date, time, sender, message });
    }
  }

  return messages;
}
