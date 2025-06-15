export interface SummarizationRequest {
  content: string;
  summaryType: 'short' | 'medium' | 'detailed';
  includeKeyPoints?: boolean;
  includeChapters?: boolean;
  focusArea?: 'general' | 'technical' | 'educational' | 'business';
  language?: 'english' | 'spanish' | 'french' | 'german';
  includeTimestamps?: boolean;
  extractKeyQuotes?: boolean;
  generateTags?: boolean;
  videoDuration?: string; // Add video duration for accurate timestamps
}

export interface SummarizationResponse {
  summary: string;
  keyPoints: string[];
  chapters: Array<{
    title: string;
    timestamp: string;
    summary: string;
  }>;
  tags: string[];
  quotes?: string[]; // Add quotes to response
  wordCount: number;
  readingTime: number;
}

export class AIService {
  private static readonly GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  private static readonly GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  static async summarizeContent(request: SummarizationRequest): Promise<SummarizationResponse> {
    if (!this.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    try {
      const prompt = this.buildPrompt(request);
      
      console.log('Making request to Gemini API...');
      
      const response = await fetch(`${this.GEMINI_API_BASE}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: this.getMaxTokens(request.summaryType),
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        
        let errorMessage = `API request failed with status ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          // If we can't parse the error, use the status text
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        
        throw new Error(`Gemini API Error: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('Gemini API response received:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid Gemini API response structure:', data);
        throw new Error('Invalid response format from Gemini API');
      }

      const content = data.candidates[0].content.parts[0].text;
      console.log('Generated content:', content);
      
      return this.parseAIResponse(content, request.summaryType, request.videoDuration);
    } catch (error) {
      console.error('Error in AI service:', error);
      
      // Re-throw the error instead of falling back to mock data
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to generate AI summary. Please try again.');
      }
    }
  }

  private static buildPrompt(request: SummarizationRequest): string {
    const lengthInstructions = {
      short: 'Create a concise summary in about 100-150 words.',
      medium: 'Create a comprehensive summary in about 300-400 words.',
      detailed: 'Create a detailed summary in about 500-700 words.'
    };

    const focusInstructions = {
      general: 'Focus on the main topics and general insights.',
      technical: 'Emphasize technical details, methodologies, and implementation aspects.',
      educational: 'Highlight learning objectives, key concepts, and educational value.',
      business: 'Focus on business implications, strategies, and actionable insights.'
    };

    const languageInstructions = {
      english: 'Respond in English.',
      spanish: 'Respond in Spanish.',
      french: 'Respond in French.',
      german: 'Respond in German.'
    };

    // Truncate content if it's too long to avoid token limits
    const maxContentLength = 8000; // Conservative limit
    const truncatedContent = request.content.length > maxContentLength 
      ? request.content.substring(0, maxContentLength) + '...[content truncated]'
      : request.content;

    let instructions = `
You are an expert content summarizer analyzing YouTube video content. Please provide a structured response based on the video description and content.

Video Duration: ${request.videoDuration || 'Unknown'}

Instructions:
1. ${lengthInstructions[request.summaryType]}
2. ${focusInstructions[request.focusArea || 'general']}
3. ${languageInstructions[request.language || 'english']}
4. Extract 5-7 key points as bullet points
5. Generate 3-5 relevant tags based on the content
`;

    if (request.includeChapters) {
      instructions += `6. Create realistic chapters with timestamps based on the video duration (${request.videoDuration || 'Unknown'}). 
         - Distribute timestamps evenly across the video duration
         - Use format like "0:00", "2:15", "5:30", etc.
         - Create 3-5 logical chapters that would make sense for this content
         - Each chapter should represent a distinct topic or section\n`;
    }

    if (request.extractKeyQuotes) {
      instructions += `7. Extract 2-3 key quotes or important statements directly from the content provided.
         - Only use actual text from the video description/content
         - Do not create fictional quotes
         - If no clear quotes are available, indicate "No direct quotes available from content"\n`;
    }

    instructions += `
Video Content to Analyze:
${truncatedContent}

Please format your response as valid JSON with the following structure:
{
  "summary": "your detailed summary here (formatted with proper paragraphs)",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "chapters": [
    {"title": "Introduction", "timestamp": "0:00", "summary": "Brief chapter summary"},
    {"title": "Main Topic", "timestamp": "2:30", "summary": "Brief chapter summary"}
  ]${request.extractKeyQuotes ? ',\n  "quotes": ["actual quote from content", "another real quote"]' : ''}
}

CRITICAL REQUIREMENTS:
- Timestamps must be realistic and distributed across the actual video duration
- Quotes must be actual text from the provided content, not generated
- Return ONLY the JSON object, no additional text or formatting
- Format the summary with proper paragraph breaks using \\n\\n
- Make sure all JSON is properly escaped
- Base all analysis on the actual content provided
    `.trim();

    return instructions;
  }

  private static getMaxTokens(summaryType: 'short' | 'medium' | 'detailed'): number {
    const tokenLimits = {
      short: 800,
      medium: 1200,
      detailed: 1800
    };
    return tokenLimits[summaryType];
  }

  private static parseAIResponse(content: string, summaryType: 'short' | 'medium' | 'detailed', videoDuration?: string): SummarizationResponse {
    try {
      // Clean the response to extract JSON
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Remove any leading/trailing whitespace
      cleanContent = cleanContent.trim();
      
      console.log('Attempting to parse JSON:', cleanContent);
      
      const parsed = JSON.parse(cleanContent);
      const summary = parsed.summary || 'Summary not available';
      const wordCount = summary.split(' ').length;
      
      // Validate and fix timestamps if needed
      const validatedChapters = this.validateChapters(parsed.chapters, videoDuration);
      
      return {
        summary: parsed.summary || 'Summary not available',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [
          'Key points extraction failed',
          'Please try again with a different video'
        ],
        chapters: validatedChapters,
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['video', 'content'],
        quotes: Array.isArray(parsed.quotes) ? parsed.quotes : undefined,
        wordCount,
        readingTime: Math.ceil(wordCount / 200) // Average reading speed
      };
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON:', error);
      console.error('Raw content:', content);
      
      // Enhanced fallback parsing if JSON parsing fails
      const wordCount = content.split(' ').length;
      
      // Try to extract key points from text using various patterns
      const keyPoints: string[] = [];
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        // Look for bullet points, numbered lists, or lines starting with key indicators
        if (trimmedLine.match(/^[-•*]\s+/) || 
            trimmedLine.match(/^\d+\.\s+/) ||
            trimmedLine.match(/^(key|main|important)/i)) {
          const cleanPoint = trimmedLine
            .replace(/^[-•*]\s+/, '')
            .replace(/^\d+\.\s+/, '')
            .replace(/^(key|main|important)\s*(point|idea|concept)?:?\s*/i, '');
          
          if (cleanPoint.length > 10 && cleanPoint.length < 200) {
            keyPoints.push(cleanPoint);
          }
        }
      }
      
      // If no key points found, create some from the content
      if (keyPoints.length === 0) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        keyPoints.push(...sentences.slice(0, 5).map(s => s.trim()));
      }
      
      return {
        summary: content,
        keyPoints: keyPoints.slice(0, 7), // Limit to 7 key points
        chapters: this.generateFallbackChapters(videoDuration),
        tags: ['video', 'content', 'summary'],
        wordCount,
        readingTime: Math.ceil(wordCount / 200)
      };
    }
  }

  private static validateChapters(chapters: any[], videoDuration?: string): Array<{title: string; timestamp: string; summary: string}> {
    if (!Array.isArray(chapters) || chapters.length === 0) {
      return this.generateFallbackChapters(videoDuration);
    }

    // Convert video duration to seconds for validation
    const totalSeconds = this.parseDurationToSeconds(videoDuration);
    
    return chapters.map((chapter, index) => {
      let timestamp = chapter.timestamp || '0:00';
      
      // Validate timestamp format and ensure it's within video duration
      if (totalSeconds > 0) {
        const chapterSeconds = Math.floor((index / chapters.length) * totalSeconds);
        timestamp = this.formatSecondsToTimestamp(chapterSeconds);
      }
      
      return {
        title: chapter.title || `Section ${index + 1}`,
        timestamp: timestamp,
        summary: chapter.summary || 'Chapter summary not available'
      };
    });
  }

  private static generateFallbackChapters(videoDuration?: string): Array<{title: string; timestamp: string; summary: string}> {
    const totalSeconds = this.parseDurationToSeconds(videoDuration);
    
    if (totalSeconds <= 0) {
      return [
        {
          title: 'Main Content',
          timestamp: '0:00',
          summary: 'Full content analysis available in summary section'
        }
      ];
    }

    // Generate 3-4 chapters based on video length
    const numChapters = totalSeconds > 600 ? 4 : 3; // 4 chapters for videos > 10 minutes
    const chapters = [];
    
    for (let i = 0; i < numChapters; i++) {
      const chapterSeconds = Math.floor((i / numChapters) * totalSeconds);
      const timestamp = this.formatSecondsToTimestamp(chapterSeconds);
      
      const chapterTitles = [
        'Introduction',
        'Main Content',
        'Key Points',
        'Conclusion'
      ];
      
      chapters.push({
        title: chapterTitles[i] || `Section ${i + 1}`,
        timestamp: timestamp,
        summary: 'Chapter content based on video analysis'
      });
    }
    
    return chapters;
  }

  private static parseDurationToSeconds(duration?: string): number {
    if (!duration) return 0;
    
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      // MM:SS format
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // HH:MM:SS format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    
    return 0;
  }

  private static formatSecondsToTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}