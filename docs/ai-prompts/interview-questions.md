# Interview Questions Generation Prompt

## Purpose
Generate targeted, insightful interview questions for venture founders based on their application data and identified gaps or concerns.

---

## Input Data Required

- `venture_name` - Company name
- `founder_name` - Founder/owner name
- `business_summary` - Brief description of the business
- `red_flags` - Array of identified concerns
- `growth_plans` - Growth focus and targets
- `support_needs` - Requested support areas
- `analysis_summary` - Key points from deep dive analysis

---

## Prompt Template

```
You are an expert interviewer preparing questions for a venture founder applying to an acceleration program. Generate thoughtful, probing questions that will help assess the venture's potential and the founder's capabilities.

VENTURE CONTEXT:
- Company: {venture_name}
- Founder: {founder_name}
- Business: {business_summary}

KEY CONCERNS:
{red_flags}

GROWTH PLANS:
{growth_plans}

SUPPORT NEEDS:
{support_needs}

ANALYSIS INSIGHTS:
{analysis_summary}

Generate 8-10 interview questions organized by category. Each question should:
- Be specific to this venture's situation
- Probe deeper into identified concerns or gaps
- Assess founder's strategic thinking and execution capability
- Be open-ended to encourage detailed responses
- Help determine program fit and support needs

## INTERVIEW QUESTIONS

### Business Model & Strategy (2-3 questions)
[Questions about business fundamentals, competitive advantage, market positioning]

### Growth & Scalability (2-3 questions)
[Questions about growth plans, scalability, resource requirements]

### Team & Execution (2 questions)
[Questions about team capability, founder's role, execution track record]

### Financials & Investment (2 questions)
[Questions about financial health, investment utilization, revenue model]

### Risks & Challenges (1-2 questions)
[Questions about identified red flags, mitigation strategies]

For each question, include:
- The question itself
- Why you're asking it (rationale)
- What you're looking for in the answer (success indicators)

Format each question like this:

**Q: [Question]**
- *Rationale:* [Why this question matters]
- *Looking for:* [Key points in a good answer]
```

---

## Expected Output Format

```markdown
## INTERVIEW QUESTIONS FOR {VENTURE_NAME}

### Business Model & Strategy

**Q1: [Question about business model]**
- *Rationale:* [Why asking]
- *Looking for:* [Success indicators]

**Q2: [Question about competitive advantage]**
- *Rationale:* [Why asking]
- *Looking for:* [Success indicators]

### Growth & Scalability

**Q3: [Question about growth plans]**
- *Rationale:* [Why asking]
- *Looking for:* [Success indicators]

[Continue for all categories...]
```

---

## Example

### Input
```json
{
  "venture_name": "Punjab Organic Exports",
  "founder_name": "Rajesh Kumar",
  "business_summary": "Organic basmati rice exports to Middle East, planning EU expansion and product diversification",
  "red_flags": [
    "Limited product portfolio (single product dependency)",
    "No clear distribution strategy for EU retail chains",
    "Investment amount is 15% of current revenue - high leverage",
    "Supply chain for new products not established"
  ],
  "growth_plans": "Expand to EU markets, add organic pulses and millets, grow from ₹5Cr to ₹20Cr in 3 years",
  "support_needs": "Export compliance, market connections in EU, financial modeling"
}
```

### Output
```markdown
## INTERVIEW QUESTIONS FOR PUNJAB ORGANIC EXPORTS

### Business Model & Strategy

**Q1: You've built a successful business exporting basmati rice to the Middle East. What specific competitive advantages do you have that will translate to the EU market, and how might they differ?**
- *Rationale:* Assess understanding of different market dynamics and whether competitive advantages are transferable
- *Looking for:* Clear articulation of unique value proposition, awareness of EU market differences, specific advantages beyond just "organic certification"

**Q2: Walk me through your distribution strategy for EU retail chains. How do you plan to get your products on shelves in Germany, UK, and France?**
- *Rationale:* Address the red flag about unclear distribution strategy; test strategic thinking
- *Looking for:* Specific partnerships or leads, understanding of retail chain requirements, realistic timeline, backup plans

**Q3: Currently, 100% of your revenue comes from basmati rice. What's your risk mitigation strategy if rice prices fluctuate or Middle East demand drops while you're investing in EU expansion?**
- *Rationale:* Assess risk awareness and business continuity planning
- *Looking for:* Concrete contingency plans, financial buffers, diversification timeline

### Growth & Scalability

**Q4: You plan to add organic pulses and millets to your product line. Do you currently have supply partnerships with organic farmers for these products? If not, how long will it take to establish them?**
- *Rationale:* Address red flag about unestablished supply chain for new products
- *Looking for:* Existing relationships or concrete plans, realistic timelines, quality control measures, understanding of organic farming requirements

**Q5: Your target is 4x revenue growth in 3 years. Can you break down how much of that growth comes from: (a) existing products in existing markets, (b) existing products in new markets (EU), and (c) new products?**
- *Rationale:* Test financial planning rigor and realism of projections
- *Looking for:* Detailed breakdown, realistic assumptions, understanding of market penetration rates, awareness of risks in each category

**Q6: You plan to hire 15 people. What specific roles are these, and how does this hiring plan align with your market expansion timeline?**
- *Rationale:* Assess operational planning and resource allocation
- *Looking for:* Specific role descriptions, hiring timeline tied to milestones, understanding of skills needed for EU market

### Team & Execution

**Q7: What is your personal experience with EU markets? If limited, who on your team or in your network has this experience, and how will you leverage it?**
- *Rationale:* Address concern about EU market experience; assess self-awareness and network
- *Looking for:* Honest assessment of gaps, specific advisors or team members with EU experience, willingness to learn, network strength

**Q8: Tell me about a time when a major expansion or new initiative didn't go as planned. What happened, and what did you learn?**
- *Rationale:* Assess learning ability, resilience, and self-awareness
- *Looking for:* Specific example, honest reflection, concrete learnings applied to current plans, problem-solving approach

### Financials & Investment

**Q9: The ₹75L investment you're requesting is 15% of your current revenue, which is significant leverage. Can you provide a detailed breakdown of how you'll allocate this investment, and what's your contingency if you need more capital?**
- *Rationale:* Address red flag about high investment relative to revenue; test financial planning
- *Looking for:* Detailed allocation plan, justification for each category, understanding of cash flow implications, backup funding sources or ability to scale back

**Q10: What are your current gross margins on basmati rice, and what do you project for organic pulses and millets? How confident are you in these projections?**
- *Rationale:* Assess financial modeling depth and realism
- *Looking for:* Specific margin numbers, basis for projections (market research, comparable products), understanding of cost structure, honest assessment of uncertainty

### Risks & Challenges

**Q11: EU organic certification can take 6-12 months and be complex. What's your specific plan and timeline for obtaining all required certifications, and what happens if it takes longer than expected?**
- *Rationale:* Test planning rigor and risk mitigation for critical path item
- *Looking for:* Detailed certification roadmap, understanding of requirements, contingency timeline, impact on overall plan if delayed

---

## INTERVIEWER NOTES

**Key Areas to Probe Deeper:**
- Distribution strategy for EU retail (biggest gap)
- Supply chain readiness for new products
- Financial planning and cash flow management
- EU market experience and network

**Red Flags to Watch For:**
- Vague answers about distribution or supply chain
- Over-optimistic timelines without contingencies
- Lack of awareness of EU market complexities
- Insufficient financial planning detail

**Positive Signals to Look For:**
- Specific partnerships or leads already in place
- Realistic timelines with buffers
- Clear understanding of market differences
- Strong network or advisors with EU experience
- Detailed financial planning
```

---

## Implementation Notes

### API Configuration
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.8, // Higher creativity for diverse questions
  max_tokens: 1500,
});
```

### Best Practices
- Generate questions before the interview
- Share with interview panel for consistency
- Allow time for follow-up questions
- Document answers for future reference

---

## Version History
- **v1.0** (2026-02-17): Initial interview questions prompt

---

**Last Updated:** 2026-02-17
