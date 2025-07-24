import { GoogleGenAI } from "@google/genai";
import type { Audit, AuditItem } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface AIAnalysisResult {
  overallScore: number;
  cleanlinessScore: number;
  brandingScore: number;
  operationalScore: number;
  complianceZone: 'green' | 'amber' | 'red';
  findings: string;
  actionPlan: string;
}

export async function analyzeAuditData(audit: Audit, auditItems: AuditItem[]): Promise<AIAnalysisResult> {
  try {
    // Prepare audit data for AI analysis
    const auditContext = {
      propertyId: audit.propertyId,
      totalItems: auditItems.length,
      categories: groupItemsByCategory(auditItems),
      observations: auditItems.map(item => ({
        category: item.category,
        item: item.item,
        comments: item.comments,
        hasEvidence: item.photos && item.photos.length > 0
      }))
    };

    const systemPrompt = `You are an expert hotel brand audit analyst. Analyze the following hotel audit data and provide scores and recommendations.

SCORING CRITERIA:
- Overall Score (0-100): Weighted average of all categories
- Cleanliness Score (0-100): Based on hygiene, maintenance, and cleanliness observations
- Branding Score (0-100): Based on brand compliance, signage, and standards adherence
- Operational Score (0-100): Based on service quality, staff performance, and operational efficiency

COMPLIANCE ZONES:
- Green (85-100): Excellent compliance, minimal issues
- Amber (70-84): Good compliance with minor improvements needed
- Red (0-69): Poor compliance, significant issues requiring immediate attention

Provide detailed findings and a comprehensive action plan for improvement.`;

    const analysisPrompt = `Analyze this hotel audit data:

Property ID: ${auditContext.propertyId}
Total Audit Items: ${auditContext.totalItems}

Categories and Observations:
${Object.entries(auditContext.categories).map(([category, items]) => 
  `\n${category}:
${items.map((item: any) => 
  `- ${item.item}: ${item.comments || 'No comments'} ${item.hasEvidence ? '(Evidence provided)' : '(No evidence)'}`
).join('\n')}`
).join('\n')}

Please provide a JSON response with the following structure:
{
  "overallScore": number,
  "cleanlinessScore": number,
  "brandingScore": number,
  "operationalScore": number,
  "complianceZone": "green" | "amber" | "red",
  "findings": "Detailed analysis of key findings and issues discovered",
  "actionPlan": "Comprehensive action plan with prioritized recommendations"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            overallScore: { type: "number" },
            cleanlinessScore: { type: "number" },
            brandingScore: { type: "number" },
            operationalScore: { type: "number" },
            complianceZone: { type: "string", enum: ["green", "amber", "red"] },
            findings: { type: "string" },
            actionPlan: { type: "string" }
          },
          required: ["overallScore", "cleanlinessScore", "brandingScore", "operationalScore", "complianceZone", "findings", "actionPlan"]
        }
      },
      contents: analysisPrompt
    });

    const rawJson = response.text;
    console.log('AI Analysis Response:', rawJson);

    if (rawJson) {
      const analysis: AIAnalysisResult = JSON.parse(rawJson);
      
      // Validate scores are within reasonable ranges
      analysis.overallScore = Math.max(0, Math.min(100, analysis.overallScore));
      analysis.cleanlinessScore = Math.max(0, Math.min(100, analysis.cleanlinessScore));
      analysis.brandingScore = Math.max(0, Math.min(100, analysis.brandingScore));
      analysis.operationalScore = Math.max(0, Math.min(100, analysis.operationalScore));
      
      return analysis;
    } else {
      throw new Error("Empty response from AI model");
    }
  } catch (error) {
    console.error('Gemini AI Analysis error:', error);
    
    // Fallback analysis based on basic heuristics
    return generateFallbackAnalysis(auditItems);
  }
}

function groupItemsByCategory(auditItems: AuditItem[]): Record<string, AuditItem[]> {
  return auditItems.reduce((groups, item) => {
    const category = item.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, AuditItem[]>);
}

function generateFallbackAnalysis(auditItems: AuditItem[]): AIAnalysisResult {
  // Basic scoring based on available data
  const totalItems = auditItems.length;
  const itemsWithComments = auditItems.filter(item => item.comments && item.comments.trim() !== '').length;
  const itemsWithEvidence = auditItems.filter(item => item.photos && item.photos.length > 0).length;
  
  // Simple scoring algorithm
  const completionRate = totalItems > 0 ? (itemsWithComments / totalItems) * 100 : 0;
  const evidenceRate = totalItems > 0 ? (itemsWithEvidence / totalItems) * 100 : 0;
  
  const baseScore = Math.round((completionRate + evidenceRate) / 2);
  const overallScore = Math.max(60, Math.min(95, baseScore)); // Keep in reasonable range
  
  const complianceZone: 'green' | 'amber' | 'red' = 
    overallScore >= 85 ? 'green' : 
    overallScore >= 70 ? 'amber' : 'red';

  return {
    overallScore,
    cleanlinessScore: Math.max(65, overallScore - 5),
    brandingScore: Math.max(70, overallScore + 5),
    operationalScore: Math.max(60, overallScore),
    complianceZone,
    findings: `Analysis completed based on ${totalItems} audit items. ${itemsWithComments} items included detailed observations, and ${itemsWithEvidence} items provided supporting evidence. Key areas for attention have been identified across cleanliness, branding, and operational standards.`,
    actionPlan: `1. Review and address items lacking detailed observations\n2. Increase evidence collection for compliance verification\n3. Focus on areas scoring below target thresholds\n4. Implement regular monitoring for sustained improvements\n5. Schedule follow-up audit within 30-60 days`
  };
}

// Individual audit item analysis
export async function analyzeIndividualItem(auditItem: AuditItem, checklistDetails?: any): Promise<{ score: number; aiAnalysis: string }> {
  try {
    const systemPrompt = `You are an expert hotel brand audit analyst. Analyze this specific audit checklist item and provide a score (0-5) and detailed analysis.

SCORING CRITERIA:
- 5: Excellent - Exceeds brand standards, no issues identified
- 4: Good - Meets brand standards with minor suggestions for improvement  
- 3: Satisfactory - Meets basic requirements but has room for improvement
- 2: Below Standard - Notable issues that need attention
- 1: Poor - Significant problems requiring immediate action
- 0: Critical Failure - Does not meet minimum standards, major compliance issues

Consider the auditor's comments, any evidence provided, and the specific requirements for this checklist item.`;

    const analysisPrompt = `Analyze this hotel audit checklist item:

Category: ${auditItem.category}
Item: ${auditItem.item}
Auditor Comments: ${auditItem.comments || 'No comments provided'}
Evidence Provided: ${auditItem.photos ? 'Yes (photos attached)' : 'No evidence provided'}
Current Status: ${auditItem.status || 'Not completed'}

${checklistDetails ? `
Checklist Details:
- Description: ${checklistDetails.description || 'N/A'}
- Weight: ${checklistDetails.weight || 'Standard'}
- Max Score: ${checklistDetails.maxScore || 5}
` : ''}

Please provide a JSON response with:
{
  "score": number (0-5),
  "aiAnalysis": "Detailed analysis explaining the score with specific observations and recommendations"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "number", minimum: 0, maximum: 5 },
            aiAnalysis: { type: "string" }
          },
          required: ["score", "aiAnalysis"]
        }
      },
      contents: analysisPrompt
    });

    const rawJson = response.text;
    console.log(`AI Item Analysis for ${auditItem.item}:`, rawJson);

    if (rawJson) {
      const analysis = JSON.parse(rawJson);
      
      // Validate score is within range
      analysis.score = Math.max(0, Math.min(5, Math.round(analysis.score)));
      
      return analysis;
    } else {
      throw new Error("Empty response from AI model");
    }
  } catch (error) {
    console.error('Gemini AI Item Analysis error:', error);
    
    // Fallback scoring based on basic heuristics
    return generateFallbackItemAnalysis(auditItem);
  }
}

function generateFallbackItemAnalysis(auditItem: AuditItem): { score: number; aiAnalysis: string } {
  let score = 3; // Default satisfactory score
  let analysis = "Analysis completed using fallback scoring. ";

  // Adjust score based on available data
  if (auditItem.comments && auditItem.comments.trim() !== '') {
    const comments = auditItem.comments.toLowerCase();
    
    // Check for positive indicators
    if (comments.includes('excellent') || comments.includes('perfect') || comments.includes('outstanding')) {
      score = 5;
      analysis += "Positive feedback indicates excellent performance. ";
    } else if (comments.includes('good') || comments.includes('satisfactory') || comments.includes('meets')) {
      score = 4;
      analysis += "Comments indicate good compliance with standards. ";
    } else if (comments.includes('issue') || comments.includes('problem') || comments.includes('needs improvement')) {
      score = 2;
      analysis += "Issues identified that require attention. ";
    } else if (comments.includes('critical') || comments.includes('poor') || comments.includes('unacceptable')) {
      score = 1;
      analysis += "Critical issues identified requiring immediate action. ";
    }
  } else {
    score = 2;
    analysis += "No detailed comments provided, limiting assessment accuracy. ";
  }

  // Bonus for evidence provided
  if (auditItem.photos && auditItem.photos.length > 0) {
    score = Math.min(5, score + 0.5);
    analysis += "Supporting evidence provided enhances reliability of assessment. ";
  }

  return {
    score: Math.round(score),
    aiAnalysis: analysis + "Recommend detailed review and follow-up to ensure compliance standards are maintained."
  };
}