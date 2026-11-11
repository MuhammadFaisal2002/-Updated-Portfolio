import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (FREE!)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Smart pricing logic - Fallback if API not configured
function generateEstimate(description: string) {
  const lowerDesc = description.toLowerCase();
  
  // Keywords for different project types
  const keywords = {
    ecommerce: ['ecommerce', 'e-commerce', 'shop', 'store', 'product', 'cart', 'payment', 'checkout', 'inventory'],
    dashboard: ['dashboard', 'admin', 'panel', 'analytics', 'chart', 'report', 'data visualization', 'metrics'],
    landing: ['landing', 'single page', 'one page', 'simple', 'basic', 'portfolio'],
    chat: ['chat', 'messaging', 'real-time', 'socket', 'conversation', 'instant message'],
    auth: ['authentication', 'login', 'signup', 'user management', 'auth', 'register'],
    api: ['api', 'backend', 'rest', 'graphql', 'endpoint', 'microservice'],
    mobile: ['mobile', 'app', 'ios', 'android', 'react native', 'flutter'],
    blog: ['blog', 'cms', 'content', 'article', 'post', 'wordpress'],
    booking: ['booking', 'reservation', 'appointment', 'schedule', 'calendar'],
    social: ['social', 'network', 'feed', 'profile', 'follow', 'like', 'comment']
  };
  
  // Count matches for each project type
  let projectType = 'custom';
  let maxMatches = 0;
  
  for (const [type, words] of Object.entries(keywords)) {
    const matches = words.filter(word => lowerDesc.includes(word)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      projectType = type;
    }
  }
  
  // Complexity factors
  const hasPayment = lowerDesc.includes('payment') || lowerDesc.includes('stripe') || lowerDesc.includes('paypal');
  const hasAuth = lowerDesc.includes('auth') || lowerDesc.includes('login') || lowerDesc.includes('user');
  const hasAdmin = lowerDesc.includes('admin') || lowerDesc.includes('dashboard');
  const hasRealtime = lowerDesc.includes('real-time') || lowerDesc.includes('realtime') || lowerDesc.includes('live');
  const hasMultilingual = lowerDesc.includes('multilingual') || lowerDesc.includes('multi-language') || lowerDesc.includes('translation');
  const hasDatabase = lowerDesc.includes('database') || lowerDesc.includes('data');
  const hasAPI = lowerDesc.includes('api') || lowerDesc.includes('integration');
  
  let complexity = 1;
  if (hasPayment) complexity += 0.3;
  if (hasAuth) complexity += 0.2;
  if (hasAdmin) complexity += 0.3;
  if (hasRealtime) complexity += 0.4;
  if (hasMultilingual) complexity += 0.2;
  if (hasDatabase) complexity += 0.1;
  if (hasAPI) complexity += 0.2;
  
  // Base estimates by project type
  const estimates: Record<string, { baseCost: [number, number]; baseWeeks: [number, number]; techStack: string[]; description: string }> = {
    landing: {
      baseCost: [500, 1000],
      baseWeeks: [1, 2],
      techStack: ['Next.js', 'Tailwind CSS', 'EmailJS'],
      description: 'landing page'
    },
    blog: {
      baseCost: [1500, 3000],
      baseWeeks: [2, 4],
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MySQL'],
      description: 'blog/CMS'
    },
    ecommerce: {
      baseCost: [3000, 5000],
      baseWeeks: [4, 6],
      techStack: ['Next.js', 'TypeScript', 'Stripe', 'MySQL', 'Tailwind CSS'],
      description: 'e-commerce'
    },
    dashboard: {
      baseCost: [2000, 4000],
      baseWeeks: [3, 5],
      techStack: ['Next.js', 'TypeScript', 'Chart.js', 'MySQL', 'Tailwind CSS'],
      description: 'dashboard/admin panel'
    },
    chat: {
      baseCost: [3000, 6000],
      baseWeeks: [4, 7],
      techStack: ['Next.js', 'Socket.io', 'Node.js', 'PostgreSQL'],
      description: 'chat application'
    },
    api: {
      baseCost: [1500, 3000],
      baseWeeks: [2, 4],
      techStack: ['Laravel', 'MySQL', 'RESTful API'],
      description: 'API development'
    },
    mobile: {
      baseCost: [5000, 10000],
      baseWeeks: [8, 12],
      techStack: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL'],
      description: 'mobile application'
    },
    booking: {
      baseCost: [2500, 5000],
      baseWeeks: [3, 6],
      techStack: ['Next.js', 'TypeScript', 'MySQL', 'Calendar API'],
      description: 'booking system'
    },
    social: {
      baseCost: [5000, 12000],
      baseWeeks: [6, 10],
      techStack: ['Next.js', 'TypeScript', 'Socket.io', 'PostgreSQL', 'Redis'],
      description: 'social network'
    },
    custom: {
      baseCost: [2000, 5000],
      baseWeeks: [3, 6],
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MySQL'],
      description: 'custom web application'
    }
  };
  
  const estimate = estimates[projectType] ?? estimates.custom!;
  
  // Apply complexity multiplier
  const minCost = Math.round(estimate.baseCost[0] * complexity);
  const maxCost = Math.round(estimate.baseCost[1] * complexity);
  const minWeeks = Math.ceil(estimate.baseWeeks[0] * complexity);
  const maxWeeks = Math.ceil(estimate.baseWeeks[1] * complexity);
  
  // Build tech stack
  const techStack = [...estimate.techStack];
  if (hasPayment && !techStack.includes('Stripe')) {
    techStack.push('Stripe');
  }
  if (hasAuth && !techStack.includes('NextAuth')) {
    techStack.push('NextAuth');
  }
  if (hasRealtime && !techStack.includes('Socket.io')) {
    techStack.push('Socket.io');
  }
  
  // Generate detailed explanation
  let details = `This estimate is for a ${estimate.description}`;
  
  if (complexity > 1.5) {
    details += ' with advanced features';
  } else if (complexity > 1.2) {
    details += ' with additional features';
  }
  details += '. ';
  
  const features = [];
  if (hasPayment) features.push('payment integration');
  if (hasAuth) features.push('user authentication');
  if (hasAdmin) features.push('admin dashboard');
  if (hasRealtime) features.push('real-time features');
  if (hasMultilingual) features.push('multi-language support');
  
  if (features.length > 0) {
    details += 'Includes: ' + features.join(', ') + '. ';
  }
  
  details += 'This is a preliminary estimate. Final cost may vary based on specific requirements and design complexity. Contact me for a detailed quote!';
  
  return {
    cost: `$${minCost.toLocaleString()} - $${maxCost.toLocaleString()}`,
    timeline: `${minWeeks}-${maxWeeks} weeks`,
    techStack: techStack.slice(0, 5), // Limit to 5 technologies
    details: details
  };
}

// Models to try in order. `gemini-pro` was retired; override with GEMINI_MODEL in .env.local.
const MODELS = [
  ...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []),
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { description?: unknown };
    const raw = typeof body.description === 'string' ? body.description.trim() : '';

    if (raw.length < 10) {
      return NextResponse.json({
        error: true,
        message: 'Please provide a more detailed project description (at least 10 characters).'
      });
    }

    const description = raw.slice(0, 2000);

    // Try Gemini AI first (if API key is configured)
    if (genAI) {
        const prompt = `You are a professional web development project estimator for Faisal Abshar, a Full Stack Developer.

PRICING GUIDELINES:
- Landing Page: $500-$1,000 (1-2 weeks)
- Blog/CMS: $1,500-$3,000 (2-4 weeks)
- E-commerce: $3,000-$5,000 (4-6 weeks)
- Dashboard: $2,000-$4,000 (3-5 weeks)
- Chat App: $3,000-$6,000 (4-7 weeks)
- API Development: $1,500-$3,000 (2-4 weeks)
- Mobile App: $5,000-$10,000 (8-12 weeks)
- Booking System: $2,500-$5,000 (3-6 weeks)
- Social Network: $5,000-$12,000 (6-10 weeks)

COMPLEXITY FACTORS (add to base cost):
- Payment integration: +30%
- User authentication: +20%
- Admin dashboard: +30%
- Real-time features: +40%
- Multilingual: +20%
- Database: +10%
- API integration: +20%

TECH STACK OPTIONS:
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Laravel, Node.js
- Database: MySQL, PostgreSQL
- Other: Stripe, Socket.io, NextAuth, Redis

PROJECT DESCRIPTION:
"${description}"

Analyze this project and provide a JSON response with:
{
  "cost": "range in dollars (e.g., $3,000 - $5,000)",
  "timeline": "range in weeks (e.g., 4-6 weeks)",
  "techStack": ["array", "of", "5", "technologies"],
  "details": "2-3 sentences explaining the estimate, what's included, and any assumptions"
}

Be realistic, professional, and consider all complexity factors. Only return valid JSON, nothing else.`;

        for (const modelName of MODELS) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const estimate = JSON.parse(jsonMatch[0]) as { cost?: unknown; timeline?: unknown; techStack?: unknown; details?: unknown };
              if (typeof estimate.cost === 'string' && typeof estimate.timeline === 'string') {
                return NextResponse.json({
                  cost: estimate.cost,
                  timeline: estimate.timeline,
                  techStack: Array.isArray(estimate.techStack) ? estimate.techStack.filter((t) => typeof t === 'string').slice(0, 6) : [],
                  details: typeof estimate.details === 'string' ? estimate.details : '',
                });
              }
            }
          } catch (aiError) {
            console.error(`Gemini (${modelName}) error:`, aiError instanceof Error ? aiError.message : aiError);
            // Try the next model, then fall back to rule-based logic
          }
        }
    }

    // Fallback: Use rule-based logic
    const estimate = generateEstimate(description);
    return NextResponse.json(estimate);

  } catch (error) {
    console.error('Estimate API Error:', error);
    return NextResponse.json({
      error: true,
      message: 'Sorry, I couldn\'t generate an estimate. Please contact Faisal directly:\n📧 faisalabshar2002@gmail.com\n📱 03072173457'
    });
  }
}

export const runtime = 'nodejs';
