# Venture Deep Dive Analysis Prompt

## Purpose
Generate comprehensive analysis of venture applications for VSM screening, including business assessment, growth potential, risks, and recommendations.

---

## Input Data Required

- `venture_name` - Company name
- `founder_name` - Founder/owner name
- `description` - What they sell and who they sell to
- `location` - Geographic coverage
- `city` - Primary city
- `revenue_12m` - Current annual revenue
- `full_time_employees` - Team size
- `growth_focus` - Growth areas (product/segment/geography)
- `revenue_potential_3y` - 3-year revenue projection
- `min_investment` - Investment needed
- `incremental_hiring` - Hiring plans
- `blockers` - Current challenges
- `support_request` - Specific support needs
- `growth_current` - Current product/segment/geography details
- `growth_target` - Target product/segment/geography details

---

## Prompt Template

```
You are an expert venture analyst evaluating rural business applications for a growth acceleration program. Analyze the following venture and provide a comprehensive assessment.

VENTURE DETAILS:
- Company: {venture_name}
- Founder: {founder_name}
- Business: {description}
- Location: {location} ({city})
- Current Revenue: {revenue_12m}
- Team Size: {full_time_employees}

GROWTH PLANS:
- Focus Areas: {growth_focus}
- 3-Year Revenue Target: {revenue_potential_3y}
- Investment Needed: {min_investment}
- Hiring Plans: {incremental_hiring}

CURRENT STATE:
- Product/Service: {growth_current.product}
- Customer Segment: {growth_current.segment}
- Geographic Coverage: {growth_current.geography}

TARGET STATE:
- New Product: {growth_target.product}
- New Segment: {growth_target.segment}
- New Geography: {growth_target.geography}

CHALLENGES & NEEDS:
- Blockers: {blockers}
- Support Request: {support_request}

Please provide a structured analysis in the following format:

## EXECUTIVE SUMMARY
A 2-3 sentence overview of the venture and its potential.

## BUSINESS ASSESSMENT
### Strengths
- List 3-5 key strengths
- Focus on competitive advantages and market position

### Weaknesses
- List 3-5 areas of concern
- Highlight gaps or risks

### Market Opportunity
- Assess the market size and growth potential
- Evaluate the venture's positioning

## GROWTH POTENTIAL
### Revenue Trajectory
- Analyze the path from current to target revenue
- Assess feasibility of 3-year projection

### Scalability
- Evaluate ability to scale operations
- Consider infrastructure and team requirements

### Investment Utilization
- Assess if requested investment is appropriate
- Suggest optimal allocation

## RED FLAGS 🚩
List any critical concerns that need immediate attention:
- Financial risks
- Market risks
- Operational risks
- Team/founder risks

## INTERVIEW QUESTIONS
Generate 5-7 targeted questions to ask the founder:
1. [Question about specific aspect]
2. [Question to clarify a concern]
3. [Question about market strategy]
4. [Question about team/execution]
5. [Question about financials]

## RECOMMENDATION
### Program Fit
- Which program is most suitable? (Accelerate Prime/Core/Select, Ignite, Liftoff)
- Why this program?

### Support Priorities
Rank the top 3 support areas needed:
1. [Area] - [Rationale]
2. [Area] - [Rationale]
3. [Area] - [Rationale]

### Next Steps
- Immediate actions for VSM
- Conditions for approval (if any)

## OVERALL SCORE
Rate the venture on a scale of 1-10 for:
- Market Opportunity: X/10
- Team Capability: X/10
- Financial Viability: X/10
- Growth Potential: X/10
- Overall Fit: X/10

---

Be specific, data-driven, and actionable in your analysis. Focus on insights that will help the Success Manager make an informed decision.
```

---

## Expected Output Format

```markdown
## EXECUTIVE SUMMARY
[2-3 sentences]

## BUSINESS ASSESSMENT
### Strengths
- [Strength 1]
- [Strength 2]
...

### Weaknesses
- [Weakness 1]
- [Weakness 2]
...

### Market Opportunity
[Analysis paragraph]

## GROWTH POTENTIAL
### Revenue Trajectory
[Analysis]

### Scalability
[Analysis]

### Investment Utilization
[Analysis]

## RED FLAGS 🚩
- [Flag 1]
- [Flag 2]
...

## INTERVIEW QUESTIONS
1. [Question]
2. [Question]
...

## RECOMMENDATION
### Program Fit
[Program name and rationale]

### Support Priorities
1. [Area] - [Rationale]
2. [Area] - [Rationale]
3. [Area] - [Rationale]

### Next Steps
- [Action 1]
- [Action 2]

## OVERALL SCORE
- Market Opportunity: 8/10
- Team Capability: 7/10
- Financial Viability: 6/10
- Growth Potential: 8/10
- Overall Fit: 7/10
```

---

## Example

### Input
```json
{
  "venture_name": "Punjab Organic Exports",
  "founder_name": "Rajesh Kumar",
  "description": "Organic basmati rice exports • International distributors and retail chains",
  "location": "Punjab, Haryana, Delhi",
  "city": "Amritsar",
  "revenue_12m": "₹5 Crores",
  "full_time_employees": "25",
  "growth_focus": "product,geography",
  "revenue_potential_3y": "₹20 Crores",
  "min_investment": "₹75 Lakhs",
  "incremental_hiring": "15 people",
  "blockers": "Limited access to international markets, need certifications",
  "support_request": "Help with export compliance, market connections in EU",
  "growth_current": {
    "product": "Organic basmati rice",
    "segment": "B2B distributors in Middle East",
    "geography": "UAE, Saudi Arabia"
  },
  "growth_target": {
    "product": "Organic pulses and millets",
    "segment": "Retail chains and direct consumers",
    "geography": "EU markets (Germany, UK, France)"
  }
}
```

### Output
```markdown
## EXECUTIVE SUMMARY
Punjab Organic Exports is a growing agri-export business with strong fundamentals in organic basmati rice. The venture shows promising expansion potential into EU markets and product diversification, backed by solid current revenue and an experienced team.

## BUSINESS ASSESSMENT
### Strengths
- Established revenue base of ₹5 Crores with proven market fit
- Strong team of 25 FTEs with export experience
- Organic certification provides competitive advantage
- Clear expansion strategy with specific target markets
- Existing Middle East presence demonstrates international capability

### Weaknesses
- Limited product portfolio (single product dependency)
- Lack of EU market experience and connections
- Certification gaps for target markets
- Investment requirement seems high relative to current revenue
- No mention of existing distribution infrastructure in target markets

### Market Opportunity
The organic food export market is experiencing 15-20% annual growth, particularly in EU markets. The venture is well-positioned to capitalize on this trend with their organic certification and quality product. However, EU market entry requires significant compliance and relationship building.

## GROWTH POTENTIAL
### Revenue Trajectory
4x growth from ₹5Cr to ₹20Cr in 3 years is ambitious but achievable with successful EU market entry and product diversification. The timeline aligns with typical market penetration cycles for food exports.

### Scalability
Current team size and infrastructure can support initial expansion. The planned hiring of 15 people is reasonable for the growth targets. Key scalability factor will be securing reliable supply chain for new products (pulses, millets).

### Investment Utilization
₹75L investment appears appropriate for:
- EU certifications and compliance (₹15-20L)
- Market development and trade shows (₹20-25L)
- Product development and testing (₹15-20L)
- Working capital for inventory (₹15-20L)

## RED FLAGS 🚩
- High dependency on single product (basmati rice) for current revenue
- No clear distribution strategy for EU retail chains mentioned
- Investment amount is 15% of current revenue - high leverage
- Founder's experience in target markets unclear
- Supply chain for new products (pulses, millets) not established

## INTERVIEW QUESTIONS
1. What specific EU certifications do you currently have, and which ones are you missing for your target markets?
2. Can you describe your existing relationships or partnerships in EU markets? How do you plan to establish distribution?
3. What is your experience with organic pulses and millets production? Do you have secured supply partnerships?
4. How will you manage the working capital requirements for both Middle East and EU operations simultaneously?
5. What is your contingency plan if EU market entry takes longer than expected?
6. Can you break down the ₹75L investment request into specific allocations?
7. What are your current margins on basmati rice, and what do you project for the new product lines?

## RECOMMENDATION
### Program Fit
**Accelerate Core** - This venture is beyond the early stage (Ignite/Liftoff) with proven revenue and team, but needs structured support for international expansion and product diversification. Core program provides the right level of mentorship and market access support.

### Support Priorities
1. **Market Access & Connections** - Critical for EU market entry; need introductions to distributors and retail buyers
2. **Compliance & Certifications** - Essential for market access; guidance on EU organic standards and export requirements
3. **Financial Modeling** - Help optimize investment allocation and cash flow management during expansion

### Next Steps
- Schedule deep-dive interview to address red flags
- Request detailed financial projections and investment breakdown
- Verify organic certifications and supply chain partnerships
- Conditional approval pending satisfactory answers on EU market strategy

## OVERALL SCORE
- Market Opportunity: 8/10 (Strong market growth, clear demand)
- Team Capability: 7/10 (Good size, but EU experience unclear)
- Financial Viability: 6/10 (Solid revenue, but high investment relative to base)
- Growth Potential: 8/10 (Realistic targets with right support)
- Overall Fit: 7/10 (Good candidate for Accelerate Core program)
```

---

## Implementation Notes

### API Configuration
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.7, // Balanced creativity and consistency
  max_tokens: 2000, // Sufficient for detailed analysis
});
```

### Error Handling
- Validate all input fields before generating prompt
- Handle missing optional fields gracefully
- Implement retry logic for API failures
- Cache results to avoid redundant API calls

### Quality Checks
- Verify output contains all required sections
- Check for hallucinations (made-up data)
- Ensure scores are within valid ranges
- Validate recommendations align with program criteria

---

## Version History
- **v1.0** (2026-02-17): Initial prompt template for venture analysis

---

**Last Updated:** 2026-02-17
