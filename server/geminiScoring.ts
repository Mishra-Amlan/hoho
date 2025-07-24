import { GoogleGenAI } from '@google/genai';
import { ChecklistItem, getChecklistItemById } from '@shared/auditChecklist';

interface MediaEvidence {
  type: 'photo' | 'video' | 'text';
  content: string; // For photos/videos: base64 or URL, for text: actual text
  description?: string;
}

interface ScoringInput {
  checklistItemId: string;
  mediaEvidence: MediaEvidence[];
  auditorNotes?: string;
}

interface ScoringResult {
  score: number;
  maxScore: number;
  confidence: number;
  reasoning: string;
  improvements: string[];
  strengths: string[];
}

class GeminiScoringService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async scoreChecklistItem(input: ScoringInput): Promise<ScoringResult> {
    const checklistItem = getChecklistItemById(input.checklistItemId);
    if (!checklistItem) {
      throw new Error(`Checklist item not found: ${input.checklistItemId}`);
    }

    const prompt = this.buildScoringPrompt(checklistItem, input);
    
    try {
      const model = this.ai.models;
      
      // For now, focus on text-based scoring until Gemini multimodal is fully integrated
      const hasVisualEvidence = input.mediaEvidence.some(e => e.type === 'photo' || e.type === 'video');
      const visualEvidenceNote = hasVisualEvidence ? 
        `\nVisual Evidence: ${input.mediaEvidence.filter(e => e.type !== 'text').length} media files provided for analysis` : 
        '\nVisual Evidence: No media files provided';

      const result = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt + visualEvidenceNote
      });
      const responseText = result.text || '';

      return this.parseScoringResponse(responseText, checklistItem.maxScore);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to score item: ${error?.message || 'Unknown error'}`);
    }
  }

  private buildScoringPrompt(item: ChecklistItem, input: ScoringInput): string {
    const textEvidence = input.mediaEvidence
      .filter(e => e.type === 'text')
      .map(e => e.content)
      .join('\n');

    return `
You are an expert hotel audit reviewer for luxury Taj Hotels. Your task is to score the following checklist item based on provided evidence.

CHECKLIST ITEM DETAILS:
- Item: ${item.item}
- Description: ${item.description}
- Category: ${item.category}
- Maximum Score: ${item.maxScore}
- Scoring Criteria: ${item.aiScoringCriteria}

EVIDENCE PROVIDED:
Text Evidence: ${textEvidence || 'None provided'}
Auditor Notes: ${input.auditorNotes || 'None provided'}
Visual Evidence: ${input.mediaEvidence.filter(e => e.type !== 'text').length} media files attached

SCORING INSTRUCTIONS:
1. Evaluate the evidence against the specific scoring criteria
2. Consider Taj Hotels' luxury brand standards and "Tajness" principles
3. Be objective but recognize excellence in hospitality
4. Provide constructive feedback for improvement

Please respond with a JSON object in this exact format:
{
  "score": [number between 0 and ${item.maxScore}],
  "confidence": [number between 0 and 1],
  "reasoning": "[detailed explanation of score reasoning]",
  "improvements": ["improvement suggestion 1", "improvement suggestion 2"],
  "strengths": ["strength 1", "strength 2"]
}

Focus on:
- Accuracy based on evidence provided
- Alignment with luxury hospitality standards
- Constructive feedback for service enhancement
- Recognition of exceptional service elements
`;
  }

  private parseScoringResponse(responseText: string, maxScore: number): ScoringResult {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        score: Math.min(Math.max(parsed.score || 0, 0), maxScore),
        maxScore,
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
        reasoning: parsed.reasoning || 'No reasoning provided',
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : []
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      
      // Fallback scoring if parsing fails
      return {
        score: Math.round(maxScore * 0.7), // Default to 70%
        maxScore,
        confidence: 0.3,
        reasoning: 'Unable to process AI response. Manual review required.',
        improvements: ['Review evidence quality', 'Provide clearer documentation'],
        strengths: ['Evidence submitted for review']
      };
    }
  }

  async batchScoreItems(inputs: ScoringInput[]): Promise<ScoringResult[]> {
    const results: ScoringResult[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchPromises = batch.map(input => 
        this.scoreChecklistItem(input).catch(error => ({
          score: 0,
          maxScore: getChecklistItemById(input.checklistItemId)?.maxScore || 10,
          confidence: 0,
          reasoning: `Error processing item: ${error.message}`,
          improvements: ['Technical issue occurred', 'Manual review required'],
          strengths: []
        }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < inputs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

export { GeminiScoringService, ScoringInput, ScoringResult, MediaEvidence };