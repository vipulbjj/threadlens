export function parseWhatsAppChat(text: string) {
  // Matches standard WhatsApp export formats:
  // "12/05/24, 10:14 PM - Vipul: Hello"
  // "12/05/24, 22:14 - Vipul: Hello"
  const regex = /(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?:\s(?:AM|PM))?)\s-\s([^:]+):\s(.+)/g;
  
  const messages = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    messages.push({
      date: match[1],
      time: match[2],
      sender: match[3].trim(),
      message: match[4].trim()
    });
  }

  return messages;
}
