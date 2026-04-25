export function parseUniversalChat(text: string) {
  const messages = [];
  
  // 1. Try WhatsApp Format (Android & iOS)
  // Android: "12/05/24, 10:14 PM - Vipul: Hello"
  // iOS: "[14/2/26, 10:00:40 PM] Vipul Bajaj: Hello"
  const waRegex = /(?:\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[A-Z]{2})?)\]|(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?:\s?[A-Z]{2})?)\s-)\s([^:]+):\s([\s\S]*?)(?=(?:\[\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}(?::\d{2})?(?:\s?[A-Z]{2})?\]|\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}(?:\s?[A-Z]{2})?\s-)|$)/g;
  
  let match;
  while ((match = waRegex.exec(text)) !== null) {
    const date = match[1] || match[3];
    const time = match[2] || match[4];
    const sender = match[5].trim();
    const message = match[6].trim();
    
    if (!message.includes("Messages and calls are end-to-end encrypted")) {
      messages.push({ date, time, sender, message });
    }
  }

  // If WhatsApp parser found messages, return them.
  if (messages.length > 0) return messages;

  // 2. Try JSON Parse (Telegram / Instagram)
  try {
    const jsonParsed = JSON.parse(text);
    if (jsonParsed.messages) {
      // Telegram format
      for (const m of jsonParsed.messages) {
        if (m.type === "message" && typeof m.text === "string" && m.text.trim()) {
          const dateObj = new Date(m.date);
          messages.push({
            date: dateObj.toLocaleDateString(),
            time: dateObj.toLocaleTimeString(),
            sender: m.from || "Unknown",
            message: m.text
          });
        }
      }
      if (messages.length > 0) return messages;
    }
  } catch (e) {
    // Not JSON, continue to generic regex
  }

  // 3. Try Telegram TXT Format (Example: "14.02.26 22:00:40 Sender: Message")
  // Or generic "[Date Time] Sender: Message"
  const genericRegex = /\[?(?:\d{2,4}[-./]\d{1,2}[-./]\d{1,2})\s+(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s?[A-Z]{2})?)\]?\s+([^:]+):\s+([\s\S]*?)(?=\[?(?:\d{2,4}[-./]\d{1,2}[-./]\d{1,2})\s+(?:\d{1,2}:\d{2})|$)/g;
  
  while ((match = genericRegex.exec(text)) !== null) {
    messages.push({ 
      date: "Unknown Date", 
      time: "Unknown Time", 
      sender: match[1].trim(), 
      message: match[2].trim() 
    });
  }

  return messages;
}
