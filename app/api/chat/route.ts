import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (FREE!)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Knowledge base - Fallback if API not configured
const knowledgeBase = {
  experience: "I have 2+ years of hands-on experience building production-grade web applications. Currently working at 97 Solutions as a Full Stack Developer (Feb 2026 - Present), and previously worked at 360 Xpert Solution (Feb 2025 - Jan 2026). I specialize in Next.js, React, Laravel, and building scalable applications.",
  
  skills: "I'm proficient in:\n\n🎨 Frontend:\n• Next.js & React\n• TypeScript & JavaScript\n• Tailwind CSS\n• Zustand & React Query\n\n⚙️ Backend:\n• Laravel & PHP\n• Node.js\n• RESTful APIs\n\n💾 Databases:\n• MySQL\n• PostgreSQL\n\n🔧 Other:\n• Python\n• Git\n• OpenAI API",
  
  projects: {
    all: "I've worked on several exciting projects:\n\n1. 🎓 LearnBright - EdTech Platform (dev.learnbright.org)\n   Interactive dashboards with custom video engine\n\n2. 🏥 HomaCare - Healthcare Platform (dev.homacare.co)\n   Multilingual healthcare web application\n\n3. 🤖 SochAI - AI Group Platform (sochai.360xpertsolutions.com)\n   Conversational AI with group chat\n\n4. 💼 Conclavity - Business Platform (conclavity.com)\n   Production-grade web application\n\nAsk me about any specific project!",
    
    learnbright: "🎓 LearnBright is an EdTech platform I built at 97 Solutions.\n\nKey Features:\n• Interactive Teacher/Student dashboards\n• Custom video engine with in-video quizzes\n• Real-time grading system\n• Progress tracking\n\nTech Stack: Next.js, TypeScript, Laravel, MySQL\n\nVisit: dev.learnbright.org",
    
    homacare: "🏥 HomaCare is a healthcare platform I developed.\n\nKey Features:\n• Responsive multilingual design\n• Clean UX\n• Healthcare services management\n\nTech Stack: Next.js, Tailwind CSS\n\nVisit: dev.homacare.co",
    
    sochai: "🤖 SochAI is an AI-powered group platform.\n\nKey Features:\n• Conversational AI interface\n• Group chat functionality\n• Enhanced performance\n\nTech Stack: Next.js, AI Integration\n\nVisit: sochai.360xpertsolutions.com",
    
    conclavity: "💼 Conclavity is a production-grade business platform.\n\nKey Features:\n• Modern UI/UX\n• Responsive design\n• Professional features\n\nTech Stack: Next.js, Tailwind CSS\n\nVisit: conclavity.com"
  },
  
  services: "I offer the following services:\n\n💻 Full Stack Development\n• End-to-end web applications\n• Custom solutions\n\n🎨 Frontend Development\n• React & Next.js\n• TypeScript\n• Responsive UI/UX\n\n⚙️ Backend Development\n• Laravel & Node.js\n• RESTful APIs\n• Database design\n\n🔧 Other Services:\n• API Development\n• Database Management\n• Website Optimization\n• Performance Tuning\n\nWant a quote? Try the Project Estimator (purple button)!",
  
  contact: "📞 You can reach me at:\n\n📧 Email: faisalabshar2002@gmail.com\n📱 Phone: 03072173457\n💼 LinkedIn: linkedin.com/in/faisal-abshar-0057b01b1\n💻 GitHub: github.com/MuhammadFaisal2002\n📍 Location: Karachi, Pakistan\n\nFeel free to reach out anytime!",
  
  achievements: "🏆 Key Achievements:\n\n⚡ Reduced load times by 40%\n   Through code optimization and performance enhancements\n\n📈 Decreased bounce rate by 25%\n   Using improved UI/UX design principles\n\n✅ Delivered 10+ successful projects\n   For satisfied clients across different industries",
  
  education: "🎓 Education & Certifications:\n\n📚 BS in Software Engineering\n   Sindh Madressatul Islam University (2025-2028)\n   Currently pursuing while working full-time\n\n🎖️ Certification in WEB 3.0\n   GIAIC (2023)\n\n🎖️ Web and App Development\n   Saylani Mass IT Training (2022)",
  
  availability: "I'm currently working full-time at 97 Solutions but I'm open to:\n\n✅ Freelance projects\n✅ Part-time opportunities\n✅ Consulting work\n✅ Interesting collaborations\n\nFeel free to reach out and let's discuss your project!",
  
  pricing: "💰 Project costs vary based on requirements.\n\nFor an instant estimate:\n👉 Try the AI Project Estimator (purple button)\n\nFor a detailed quote:\n📧 Email: faisalabshar2002@gmail.com\n📱 Phone: 03072173457\n\nI offer competitive rates and flexible payment terms!"
};

function generateResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|salam|assalam)/i)) {
    return "Hi! 👋 I'm Faisal's AI assistant. I can help you learn about:\n\n• Experience & Skills\n• Projects (LearnBright, HomaCare, SochAI, Conclavity)\n• Services Offered\n• Contact Information\n• Pricing & Availability\n\nWhat would you like to know?";
  }
  
  // Thank you
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're welcome! 😊 Feel free to ask anything else or contact Faisal directly if you need more information!";
  }
  
  // Experience
  if (lowerMessage.includes('experience') || lowerMessage.includes('work history') || lowerMessage.includes('background')) {
    return knowledgeBase.experience;
  }
  
  // Skills/Technologies
  if (lowerMessage.includes('skill') || lowerMessage.includes('technolog') || lowerMessage.includes('know') || lowerMessage.includes('stack') || lowerMessage.includes('can you')) {
    return knowledgeBase.skills;
  }
  
  // Projects - Specific
  if (lowerMessage.includes('learnbright')) return knowledgeBase.projects.learnbright;
  if (lowerMessage.includes('homacare')) return knowledgeBase.projects.homacare;
  if (lowerMessage.includes('sochai') || lowerMessage.includes('soch ai')) return knowledgeBase.projects.sochai;
  if (lowerMessage.includes('conclavity')) return knowledgeBase.projects.conclavity;
  
  // Projects - General
  if (lowerMessage.includes('project') || lowerMessage.includes('portfolio') || lowerMessage.includes('work')) {
    return knowledgeBase.projects.all;
  }
  
  // Services
  if (lowerMessage.includes('service') || lowerMessage.includes('offer') || lowerMessage.includes('what do you do') || lowerMessage.includes('what can you do')) {
    return knowledgeBase.services;
  }
  
  // Contact
  if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('call')) {
    return knowledgeBase.contact;
  }
  
  // Pricing
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate') || lowerMessage.includes('charge') || lowerMessage.includes('how much')) {
    return knowledgeBase.pricing;
  }
  
  // Achievements
  if (lowerMessage.includes('achievement') || lowerMessage.includes('accomplish') || lowerMessage.includes('success')) {
    return knowledgeBase.achievements;
  }
  
  // Education
  if (lowerMessage.includes('education') || lowerMessage.includes('study') || lowerMessage.includes('degree') || lowerMessage.includes('certif') || lowerMessage.includes('qualification')) {
    return knowledgeBase.education;
  }
  
  // Availability
  if (lowerMessage.includes('available') || lowerMessage.includes('hire') || lowerMessage.includes('freelance') || lowerMessage.includes('free')) {
    return knowledgeBase.availability;
  }
  
  // Next.js specific
  if (lowerMessage.includes('next') || lowerMessage.includes('nextjs')) {
    return "Yes! I'm an expert in Next.js! 🚀\n\nI've built multiple production applications using:\n• Next.js 14+\n• Server-side rendering\n• API routes\n• TypeScript integration\n• Performance optimization\n\nCheck out my projects like LearnBright and HomaCare built with Next.js!";
  }
  
  // React specific
  if (lowerMessage.includes('react')) {
    return "Absolutely! React is one of my core skills! ⚛️\n\nI'm experienced with:\n• React 18+\n• Hooks & Context\n• State management (Zustand, React Query)\n• Component architecture\n• Performance optimization\n\nAll my projects use React/Next.js!";
  }
  
  // Laravel specific
  if (lowerMessage.includes('laravel') || lowerMessage.includes('php')) {
    return "Yes! I have extensive Laravel experience! 🐘\n\nI've built:\n• RESTful APIs\n• Authentication systems\n• Database architectures\n• Backend services\n\nI'm comfortable with:\n• Eloquent ORM\n• Middleware\n• Laravel best practices\n\nLearnBright's backend is built with Laravel!";
  }
  
  // Database
  if (lowerMessage.includes('database') || lowerMessage.includes('mysql') || lowerMessage.includes('postgres')) {
    return "I work with both MySQL and PostgreSQL! 💾\n\nI can:\n• Design efficient schemas\n• Write optimized queries\n• Handle complex relationships\n• Database migrations\n• Performance tuning\n• Indexing strategies";
  }
  
  // TypeScript
  if (lowerMessage.includes('typescript')) {
    return "TypeScript is my preferred choice! 📘\n\nI use TypeScript in all my modern projects for:\n• Type safety\n• Better IDE support\n• Fewer runtime errors\n• Better code documentation\n\nCheck out LearnBright - fully built with TypeScript!";
  }
  
  // Location
  if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('based')) {
    return "I'm based in Karachi, Pakistan! 🇵🇰\n\nBut I work with clients globally and am comfortable with:\n• Remote work\n• Different time zones\n• Online collaboration\n• Video calls\n\nLocation is not a barrier!";
  }
  
  // Default response
  return "I can help you with information about:\n\n💼 Experience & Skills\n🚀 Projects (LearnBright, HomaCare, SochAI, Conclavity)\n🛠️ Services Offered\n📞 Contact Information\n💰 Pricing & Availability\n🎓 Education & Certifications\n\nWhat would you like to know? Or feel free to contact Faisal directly:\n📧 faisalabshar2002@gmail.com\n📱 03072173457";
}

// Models to try in order. `gemini-pro` was retired; these are current and work with
// free AI Studio keys. Override with GEMINI_MODEL in .env.local.
const MODELS = [
  ...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []),
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
];

interface ClientMessage { role: 'user' | 'assistant'; content: string }
type GeminiRole = 'user' | 'model';

// Convert chat history into Gemini format: must start with a user turn and alternate roles.
function toGeminiHistory(messages: unknown, currentMessage: string) {
  if (!Array.isArray(messages)) return [];
  const clean = (messages as ClientMessage[])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-12);
  // Drop a trailing copy of the current message if the client included it
  if (clean.length && clean[clean.length - 1]!.role === 'user' && clean[clean.length - 1]!.content.trim() === currentMessage) clean.pop();
  const history: { role: GeminiRole; parts: { text: string }[] }[] = [];
  for (const m of clean) {
    const role: GeminiRole = m.role === 'user' ? 'user' : 'model';
    if (history.length === 0 && role === 'model') continue;
    const last = history[history.length - 1];
    if (last && last.role === role) last.parts[0]!.text += `\n${m.content.trim()}`;
    else history.push({ role, parts: [{ text: m.content.trim().slice(0, 1500) }] });
  }
  // History must end with a model turn so the next user message alternates correctly
  if (history.length && history[history.length - 1]!.role === 'user') history.pop();
  return history;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: unknown; messages?: unknown };
    const raw = typeof body.message === 'string' ? body.message.trim() : '';

    if (!raw) {
      return NextResponse.json({
        message: "Please type a message! I'm here to help. 😊"
      });
    }

    const message = raw.slice(0, 1000);

    // Try Gemini AI first (if API key is configured)
    if (genAI) {
        const systemPrompt = `You are Faisal Abshar's AI assistant. Answer questions about him professionally and friendly.

ABOUT FAISAL:
- Full Stack Developer with 2+ years experience
- Currently at 97 Solutions (Feb 2026 - Present)
- Previously at 360 Xpert Solution (Feb 2025 - Jan 2026)
- Expert in: Next.js, React, TypeScript, Laravel, MySQL, PostgreSQL
- Location: Karachi, Pakistan
- Email: faisalabshar2002@gmail.com
- Phone: 03072173457
- LinkedIn: linkedin.com/in/faisal-abshar-0057b01b1
- GitHub: github.com/MuhammadFaisal2002

PROJECTS:
1. LearnBright (dev.learnbright.org) - EdTech platform with custom video engine
2. HomaCare (dev.homacare.co) - Healthcare platform, multilingual
3. SochAI (sochai.360xpertsolutions.com) - AI group chat platform
4. Conclavity (conclavity.com) - Business web application

SERVICES:
- Full Stack Development
- Frontend Development (React, Next.js)
- Backend Development (Laravel, Node.js)
- API Development
- Database Management
- Website Optimization

ACHIEVEMENTS:
- Reduced load times by 40%
- Decreased bounce rate by 25%
- Delivered 10+ successful projects

EDUCATION:
- BS Software Engineering (Sindh Madressatul Islam University, 2025-2028)
- Web 3.0 Certification (GIAIC, 2023)
- Web & App Development (Saylani Mass IT Training, 2022)

Keep responses concise (2-5 short sentences unless asked for detail), friendly, and helpful. Use emojis sparingly. Only state facts listed above; if unsure, suggest contacting Faisal directly.`;

        const history = toGeminiHistory(body.messages, message);

        for (const modelName of MODELS) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });
            const chat = model.startChat({ history });
            const result = await chat.sendMessage(message);
            const responseText = result.response.text().trim();
            if (responseText) return NextResponse.json({ message: responseText });
          } catch (aiError) {
            console.error(`Gemini (${modelName}) error:`, aiError instanceof Error ? aiError.message : aiError);
            // Try the next model, then fall back to the knowledge base
          }
        }
    }

    // Fallback: Use knowledge base
    const responseMessage = generateResponse(message);
    return NextResponse.json({ message: responseMessage });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      message: "I'm having trouble right now. Please contact Faisal directly:\n📧 faisalabshar2002@gmail.com\n📱 03072173457" 
    });
  }
}

export const runtime = 'nodejs';
