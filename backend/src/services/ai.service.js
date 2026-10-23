import OpenAI from 'openai';

const categories = ['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry'];
const priorities = ['Critical', 'High', 'Medium', 'Low'];

const knowledgeBase = `BookLeaf Publishing operates in India and the US. Packages: Standard Free and Bestseller Breakthrough. Royalty split is 80% author / 20% BookLeaf of net profit. Net profit = MRP minus printing cost, platform commission, shipping. Royalties calculated quarterly and paid within 45 days of quarter end. Minimum payout ₹1,000; below-threshold balances roll over. Payments use linked bank details. ISBNs are assigned by BookLeaf under its imprint; ISBN errors are high priority and production escalates within 48 hours. Print turnaround is 5–7 business days; verified print defects qualify for a free reprint, often requiring photos. New listings take 7–10 business days. Stock re-sync typically takes 24–48 hours. Production stages: Manuscript Received, Editing, Cover Design, Typesetting, Proofreading, ISBN Assignment, Printing, Distribution Setup, Published & Live. Metadata changes usually reflect in 3–5 business days. Tone: empathetic, professional, specific, own mistakes, provide realistic timelines and clear next steps. Never invent account-specific facts or dates.`;

function fallbackCategory(text) {
  const s = text.toLowerCase();
  if (/royalt|payment|payout|bank|earning|paid|money|profit/.test(s)) return 'Royalty & Payments';
  if (/isbn|metadata|author bio|description/.test(s)) return 'ISBN & Metadata Issues';
  if (/print|printing|binding|misprint|blurry|quality|pages/.test(s)) return 'Printing & Quality';
  if (/amazon|flipkart|unavailable|distribution|listing|stock/.test(s)) return 'Distribution & Availability';
  if (/status|production|typesetting|proof|cover|manuscript|publish/.test(s)) return 'Book Status & Production Updates';
  return 'General Inquiry';
}
function fallbackPriority(text, category) {
  const s = text.toLowerCase();
  if (/fraud|legal|urgent|six months|6 months|duplicate isbn|wrong isbn|incorrect isbn|not received.*royalt/.test(s)) return 'Critical';
  if (category === 'ISBN & Metadata Issues' || /overdue|defect|misprint|not received|missing payment/.test(s)) return 'High';
  if (/when|how|update|question|can i/.test(s)) return 'Low';
  return 'Medium';
}
function client() {
  return process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
}
export async function classifyTicket(subject, description) {
  const fallback = { category: fallbackCategory(`${subject} ${description}`), priority: fallbackPriority(`${subject} ${description}`, fallbackCategory(`${subject} ${description}`)), aiClassified: false };
  const openai = client();
  if (!openai) return fallback;
  try {
    const result = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `Classify BookLeaf support tickets. Return JSON only with category (one of ${categories.join('; ')}) and priority (one of ${priorities.join('; ')}). Use Critical for severe/overdue financial or urgent data integrity issues; High for serious issues requiring escalation; Medium for ordinary help; Low for minor informational requests. Do not answer the ticket.` },
        { role: 'user', content: `Subject: ${subject}\nDescription: ${description}` }
      ]
    });
    const parsed = JSON.parse(result.choices[0].message.content || '{}');
    if (!categories.includes(parsed.category) || !priorities.includes(parsed.priority)) return fallback;
    return { category: parsed.category, priority: parsed.priority, aiClassified: true };
  } catch (error) {
    console.warn('AI classification fallback:', error.message);
    return fallback;
  }
}
export async function draftReply(ticket) {
  const openai = client();
  const fallback = `Hello ${ticket.author?.name || 'there'},\n\nThank you for reaching out to BookLeaf. I understand your concern regarding "${ticket.subject}". Our team will review the details and verify the relevant account or production information before confirming the next steps. If additional information is required, we will contact you. We aim to provide an update within 48 hours where investigation is needed.\n\nNext step: our support team will review this ticket and update you here.\n\nBest regards,\nBookLeaf Author Support`;
  if (!openai) return { draft: fallback, aiGenerated: false, note: 'OpenAI is not configured; a safe editable fallback draft was created.' };
  try {
    const result = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 450,
      messages: [
        { role: 'system', content: `You are a real BookLeaf Publishing support representative. Draft an empathetic, professional reply to the author. Acknowledge their concern first, explain only relevant policy, do not invent dates/account facts or claim an action has happened if it has not. If investigation is needed, give a 48-hour update timeline. End with a clear next step. Keep it concise. Knowledge base:\n${knowledgeBase}` },
        { role: 'user', content: `Author: ${ticket.author?.name || 'Author'}\nCategory: ${ticket.category}\nPriority: ${ticket.priority}\nBook: ${ticket.bookTitle}\nSubject: ${ticket.subject}\nQuery: ${ticket.description}` }
      ]
    });
    const draft = result.choices[0].message.content?.trim();
    return { draft: draft || fallback, aiGenerated: Boolean(draft) };
  } catch (error) {
    console.warn('AI draft fallback:', error.message);
    return { draft: fallback, aiGenerated: false, note: 'AI is temporarily unavailable; you can edit and send this fallback draft.' };
  }
}
