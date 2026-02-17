# Agreement Generation Prompt

## Purpose
Generate customized partnership agreements for approved ventures, including milestones, deliverables, support hours, and terms based on committee decisions.

---

## Input Data Required

- `venture_name` - Company name
- `founder_name` - Founder/owner name
- `program` - Selected program (Accelerate Prime/Core/Select, Ignite, Liftoff)
- `committee_decision` - Approval details and conditions
- `support_hours_allocated` - Total support hours
- `milestones` - Array of milestone objects
- `streams` - Array of stream assignments
- `investment_amount` - If applicable
- `duration_months` - Program duration

---

## Prompt Template

```
You are a legal and business expert drafting a partnership agreement for a venture acceleration program. Generate a professional, clear, and comprehensive agreement based on the following details.

VENTURE INFORMATION:
- Company: {venture_name}
- Founder: {founder_name}
- Program: {program}
- Duration: {duration_months} months

COMMITTEE DECISION:
{committee_decision}

SUPPORT ALLOCATION:
- Total Support Hours: {support_hours_allocated}
- Allocated Streams: {streams}

MILESTONES:
{milestones}

Generate a partnership agreement with the following structure:

# PARTNERSHIP AGREEMENT

**Between:** Wadhwani Foundation ("Foundation")  
**And:** {venture_name} ("Venture")  
**Date:** {current_date}

---

## 1. PROGRAM OVERVIEW

### 1.1 Program Selection
The Venture has been accepted into the **{program}** program for a duration of **{duration_months} months**.

### 1.2 Program Objectives
[Describe the specific objectives based on the program type and venture's goals]

---

## 2. FOUNDATION COMMITMENTS

### 2.1 Support Hours
The Foundation commits to providing **{support_hours_allocated} hours** of expert support across the following streams:

{List each stream with allocated hours and focus areas}

### 2.2 Resources & Access
- Access to Foundation's network of mentors and experts
- Participation in program workshops and events
- Use of Foundation's tools and frameworks
- [Additional resources based on program tier]

### 2.3 Support Streams
{Detail each stream with owner, objectives, and deliverables}

---

## 3. VENTURE COMMITMENTS

### 3.1 Active Participation
The Venture commits to:
- Attend all scheduled mentoring sessions
- Provide timely updates on progress
- Implement agreed-upon recommendations
- Participate in program events and workshops

### 3.2 Milestones & Deliverables
The Venture agrees to achieve the following milestones:

{List each milestone with description, due date, and success criteria}

### 3.3 Reporting Requirements
- Monthly progress reports
- Quarterly business reviews
- Financial updates as requested
- Impact metrics tracking

---

## 4. TERMS & CONDITIONS

### 4.1 Duration
This agreement is effective from {start_date} to {end_date}.

### 4.2 Intellectual Property
- The Venture retains all IP rights to its business
- The Foundation retains IP rights to its methodologies and frameworks
- Any jointly developed IP will be mutually agreed upon

### 4.3 Confidentiality
Both parties agree to maintain confidentiality of sensitive information shared during the program.

### 4.4 Termination
Either party may terminate this agreement with 30 days written notice if:
- Material breach of agreement terms
- Failure to meet milestone commitments
- Mutual agreement to discontinue

### 4.5 No Equity or Financial Obligation
This is a **non-equity partnership**. The Foundation does not take equity in the Venture, and the Venture has no financial obligation to the Foundation.

---

## 5. SUCCESS METRICS

The following metrics will be used to evaluate program success:

{List relevant KPIs based on venture's goals}

---

## 6. SPECIAL CONDITIONS

{Any specific conditions from committee decision}

---

## SIGNATURES

**For Wadhwani Foundation:**

Signature: ___________________  
Name: [Program Director]  
Title: Director, Venture Programs  
Date: ___________________

**For {venture_name}:**

Signature: ___________________  
Name: {founder_name}  
Title: Founder/CEO  
Date: ___________________

---

**Agreement ID:** {generate_unique_id}  
**Program:** {program}  
**Duration:** {duration_months} months  
**Support Hours:** {support_hours_allocated}

---

Make the agreement professional, clear, and actionable. Use specific details from the input data. Ensure all milestones and commitments are measurable and time-bound.
```

---

## Expected Output Format

A complete markdown-formatted agreement document with all sections filled in based on the input data.

---

## Example

### Input
```json
{
  "venture_name": "Punjab Organic Exports",
  "founder_name": "Rajesh Kumar",
  "program": "Accelerate Core",
  "committee_decision": "Approved with focus on EU market entry and product diversification. Requires quarterly financial reviews.",
  "support_hours_allocated": 120,
  "duration_months": 12,
  "streams": [
    {
      "name": "Market Access & Strategy",
      "hours": 40,
      "owner": "International Trade Expert"
    },
    {
      "name": "Financial Planning",
      "hours": 30,
      "owner": "CFO Mentor"
    },
    {
      "name": "Operations & Supply Chain",
      "hours": 30,
      "owner": "Agri-Business Specialist"
    },
    {
      "name": "Compliance & Certifications",
      "hours": 20,
      "owner": "Export Compliance Advisor"
    }
  ],
  "milestones": [
    {
      "category": "Market Entry",
      "description": "Obtain EU organic certifications",
      "due_date": "Month 3",
      "success_criteria": "All required certifications obtained"
    },
    {
      "category": "Product Development",
      "description": "Launch organic pulses product line",
      "due_date": "Month 6",
      "success_criteria": "First shipment to EU distributor"
    },
    {
      "category": "Revenue",
      "description": "Achieve ₹10Cr revenue milestone",
      "due_date": "Month 12",
      "success_criteria": "Audited revenue of ₹10Cr+"
    }
  ]
}
```

### Output
```markdown
# PARTNERSHIP AGREEMENT

**Between:** Wadhwani Foundation ("Foundation")  
**And:** Punjab Organic Exports ("Venture")  
**Date:** February 17, 2026

---

## 1. PROGRAM OVERVIEW

### 1.1 Program Selection
The Venture has been accepted into the **Accelerate Core** program for a duration of **12 months**.

### 1.2 Program Objectives
This partnership aims to support Punjab Organic Exports in:
- Successfully entering EU markets with organic food products
- Diversifying product portfolio beyond basmati rice
- Achieving sustainable revenue growth to ₹10 Crores
- Building operational capacity for international expansion

---

## 2. FOUNDATION COMMITMENTS

### 2.1 Support Hours
The Foundation commits to providing **120 hours** of expert support across the following streams:

1. **Market Access & Strategy** (40 hours)
   - EU market entry strategy
   - Distributor and retail chain connections
   - Trade show and marketing support

2. **Financial Planning** (30 hours)
   - Financial modeling and projections
   - Investment allocation optimization
   - Cash flow management for expansion

3. **Operations & Supply Chain** (30 hours)
   - Supply chain development for new products
   - Quality control and logistics
   - Scaling operational capacity

4. **Compliance & Certifications** (20 hours)
   - EU organic certification guidance
   - Export compliance requirements
   - Documentation and regulatory support

### 2.2 Resources & Access
- Access to Foundation's network of international trade experts and mentors
- Participation in quarterly Accelerate Core cohort workshops
- Use of Foundation's market analysis tools and frameworks
- Introductions to potential EU distributors and partners
- Access to export compliance resources and templates

### 2.3 Support Streams

**Stream 1: Market Access & Strategy**
- Owner: International Trade Expert
- Objective: Establish presence in EU markets
- Deliverables: Market entry plan, distributor connections, trade show participation

**Stream 2: Financial Planning**
- Owner: CFO Mentor
- Objective: Optimize financial management for growth
- Deliverables: 3-year financial model, investment allocation plan, monthly cash flow tracking

**Stream 3: Operations & Supply Chain**
- Owner: Agri-Business Specialist
- Objective: Build capacity for product diversification
- Deliverables: Supply chain partnerships, quality control systems, logistics optimization

**Stream 4: Compliance & Certifications**
- Owner: Export Compliance Advisor
- Objective: Achieve all required EU certifications
- Deliverables: Certification roadmap, compliance documentation, regulatory guidance

---

## 3. VENTURE COMMITMENTS

### 3.1 Active Participation
The Venture commits to:
- Attend all scheduled mentoring sessions (minimum 90% attendance)
- Provide timely updates on progress (monthly reports)
- Implement agreed-upon recommendations in good faith
- Participate in quarterly cohort workshops and events
- Allocate internal resources to support program activities

### 3.2 Milestones & Deliverables
The Venture agrees to achieve the following milestones:

**Milestone 1: EU Organic Certifications**
- Category: Market Entry
- Description: Obtain all required EU organic certifications for basmati rice and planned product lines
- Due Date: Month 3 (May 2026)
- Success Criteria: All required certifications obtained and verified

**Milestone 2: Product Line Launch**
- Category: Product Development
- Description: Launch organic pulses product line with first EU shipment
- Due Date: Month 6 (August 2026)
- Success Criteria: First commercial shipment to EU distributor completed

**Milestone 3: Revenue Growth**
- Category: Financial Performance
- Description: Achieve ₹10 Crore revenue milestone
- Due Date: Month 12 (February 2027)
- Success Criteria: Audited revenue of ₹10 Crores or more

### 3.3 Reporting Requirements
- **Monthly Progress Reports**: Due by 5th of each month, covering activities, challenges, and metrics
- **Quarterly Business Reviews**: In-depth review with program team
- **Financial Updates**: Quarterly revenue, expenses, and cash flow reports
- **Impact Metrics**: Track and report on agreed KPIs (revenue, team size, market expansion)

---

## 4. TERMS & CONDITIONS

### 4.1 Duration
This agreement is effective from **February 17, 2026** to **February 17, 2027** (12 months).

### 4.2 Intellectual Property
- The Venture retains all IP rights to its business, products, and processes
- The Foundation retains IP rights to its methodologies, frameworks, and tools
- Any jointly developed IP will be subject to separate written agreement

### 4.3 Confidentiality
Both parties agree to maintain confidentiality of sensitive business information, financial data, and strategic plans shared during the program. This obligation continues for 2 years after program completion.

### 4.4 Termination
Either party may terminate this agreement with 30 days written notice if:
- Material breach of agreement terms not remedied within 15 days of notice
- Failure to meet milestone commitments without reasonable justification
- Mutual written agreement to discontinue the partnership
- Venture ceases operations or undergoes significant ownership change

### 4.5 No Equity or Financial Obligation
This is a **non-equity partnership**. The Foundation does not take equity in the Venture, and the Venture has no financial obligation to the Foundation for program participation.

---

## 5. SUCCESS METRICS

The following metrics will be used to evaluate program success:

- **Revenue Growth**: Track progress toward ₹10Cr target
- **Market Expansion**: Number of EU markets entered and distributors secured
- **Product Diversification**: Launch of organic pulses and millets product lines
- **Team Growth**: Hiring and retention of planned 15 new employees
- **Certifications**: Completion of all required EU organic certifications
- **Customer Acquisition**: Number of new EU retail and distributor partnerships

---

## 6. SPECIAL CONDITIONS

Based on the Committee's decision, the following special conditions apply:

1. **Quarterly Financial Reviews**: The Venture must participate in detailed quarterly financial reviews with the Foundation's finance team to ensure sustainable growth trajectory.

2. **EU Market Focus**: Priority support will be directed toward EU market entry activities, with regular progress assessments.

3. **Product Diversification Milestones**: Clear timelines and success criteria for launching organic pulses and millets product lines must be established and tracked.

---

## SIGNATURES

**For Wadhwani Foundation:**

Signature: ___________________  
Name: Dr. Ajay Kela  
Title: Director, Venture Programs  
Date: ___________________

**For Punjab Organic Exports:**

Signature: ___________________  
Name: Rajesh Kumar  
Title: Founder & CEO  
Date: ___________________

---

**Agreement ID:** ACC-CORE-2026-001  
**Program:** Accelerate Core  
**Duration:** 12 months  
**Support Hours:** 120

---
```

---

## Implementation Notes

### API Configuration
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.3, // Lower temperature for consistency
  max_tokens: 3000,
});
```

### Post-Processing
- Convert markdown to PDF for official documents
- Store in database with version control
- Send for digital signature via DocuSign or similar
- Archive signed copies securely

---

## Version History
- **v1.0** (2026-02-17): Initial agreement generation prompt

---

**Last Updated:** 2026-02-17
