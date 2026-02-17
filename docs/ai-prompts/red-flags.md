# Red Flags Detection Prompt

## Purpose
Identify potential risks, concerns, and red flags in venture applications that require attention or mitigation before approval.

---

## Input Data Required

- `venture_data` - Complete venture application data
- `financial_data` - Revenue, investment, projections
- `team_data` - Team size, founder background
- `market_data` - Market, competition, growth plans

---

## Prompt Template

```
You are a risk assessment expert evaluating venture applications for an acceleration program. Analyze the following venture and identify any red flags, risks, or concerns that need attention.

VENTURE APPLICATION DATA:
{complete_venture_data}

Analyze for red flags in the following categories:

## FINANCIAL RED FLAGS
Look for:
- Unrealistic revenue projections
- High debt or investment needs relative to current revenue
- Unclear or inconsistent financial data
- Cash flow concerns
- Unsustainable burn rate

## MARKET RED FLAGS
Look for:
- Highly competitive or saturated markets
- Unclear target market or customer segment
- Unproven market demand
- Regulatory or compliance risks
- Market timing concerns

## OPERATIONAL RED FLAGS
Look for:
- Weak or incomplete team
- Lack of relevant experience
- Supply chain vulnerabilities
- Scalability challenges
- Infrastructure gaps

## STRATEGIC RED FLAGS
Look for:
- Unclear business model
- Lack of competitive advantage
- Unfocused or overly ambitious plans
- Dependency on single customer/supplier
- Misalignment with program objectives

## FOUNDER RED FLAGS
Look for:
- Lack of domain expertise
- Poor communication or clarity
- Unrealistic expectations
- Resistance to feedback
- Commitment concerns

For each red flag identified, provide:
1. **Category**: Which category it falls under
2. **Severity**: Critical / High / Medium / Low
3. **Description**: What the concern is
4. **Impact**: Potential consequences if not addressed
5. **Mitigation**: Suggested actions to address the concern

Format output as:

## RED FLAGS SUMMARY

**Total Flags:** X
**Critical:** X | **High:** X | **Medium:** X | **Low:** X

---

## CRITICAL RED FLAGS 🚨
[Flags that could be deal-breakers]

## HIGH PRIORITY RED FLAGS ⚠️
[Significant concerns requiring immediate attention]

## MEDIUM PRIORITY RED FLAGS ⚡
[Notable concerns to monitor]

## LOW PRIORITY RED FLAGS 📋
[Minor concerns or areas for improvement]

---

## OVERALL RISK ASSESSMENT

**Risk Level:** Critical / High / Medium / Low

**Recommendation:**
- [ ] Approve with conditions
- [ ] Request additional information
- [ ] Schedule deep-dive interview
- [ ] Decline application

**Key Mitigation Actions Required:**
1. [Action]
2. [Action]
3. [Action]
```

---

## Expected Output Format

```markdown
## RED FLAGS SUMMARY

**Total Flags:** 8
**Critical:** 1 | **High:** 3 | **Medium:** 3 | **Low:** 1

---

## CRITICAL RED FLAGS 🚨

### 1. Unestablished Supply Chain for New Products
- **Category:** Operational
- **Severity:** Critical
- **Description:** Plans to launch organic pulses and millets but has no confirmed supply partnerships with organic farmers
- **Impact:** Could delay product launch by 6-12 months, jeopardize revenue projections, damage market credibility
- **Mitigation:** Require detailed supply chain plan with confirmed partnerships before approval; consider phased product launch

---

## HIGH PRIORITY RED FLAGS ⚠️

### 2. Unclear EU Distribution Strategy
- **Category:** Market
- **Severity:** High
- **Description:** No specific distribution partnerships or clear path to retail chains in target EU markets
- **Impact:** Market entry could fail or take significantly longer than projected
- **Mitigation:** Develop detailed distribution strategy; leverage program network for introductions; set realistic timeline

[Continue for all flags...]

---

## OVERALL RISK ASSESSMENT

**Risk Level:** High

**Recommendation:**
- [x] Approve with conditions
- [x] Request additional information
- [x] Schedule deep-dive interview
- [ ] Decline application

**Key Mitigation Actions Required:**
1. Provide detailed supply chain plan with confirmed organic farmer partnerships
2. Develop comprehensive EU distribution strategy with specific targets
3. Submit detailed investment allocation breakdown
4. Demonstrate EU market experience through team or advisors
```

---

## Implementation Notes

### API Configuration
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.5, // Balanced for consistent risk assessment
  max_tokens: 1500,
});
```

### Integration
- Run automatically on all applications
- Display in VSM dashboard
- Use for committee decision support
- Track mitigation progress

---

## Version History
- **v1.0** (2026-02-17): Initial red flags detection prompt

---

**Last Updated:** 2026-02-17
