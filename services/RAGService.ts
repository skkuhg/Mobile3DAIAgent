import { OpenAI } from 'openai';
import axios from 'axios';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  query: string;
}

export class RAGService {
  private openai: OpenAI;
  private tavilyApiKey: string;

  constructor(openaiKey: string, tavilyKey: string) {
    this.openai = new OpenAI({
      apiKey: openaiKey,
    });
    this.tavilyApiKey = tavilyKey;
  }

  async processQuery(userQuery: string): Promise<string> {
    try {
      console.log('Processing query:', userQuery);
      
      // 1. Search for relevant information using Tavily
      const searchResults = await this.searchRelevantInfo(userQuery);
      
      // 2. Create context from search results
      const context = this.formatSearchResults(searchResults);
      
      // 3. Generate response using OpenAI with RAG context
      const response = await this.generateResponse(userQuery, context);
      
      return response;
    } catch (error) {
      console.error('Error processing query:', error);
      throw new Error('Failed to process query. Please try again.');
    }
  }

  private async searchRelevantInfo(query: string): Promise<TavilySearchResult[]> {
    try {
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: this.tavilyApiKey,
          query: query,
          search_depth: 'basic',
          include_answer: true,
          include_raw_content: false,
          max_results: 5,
          include_domains: [],
          exclude_domains: []
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.results || [];
    } catch (error) {
      console.error('Tavily search error:', error);
      return [];
    }
  }

  private formatSearchResults(results: TavilySearchResult[]): string {
    if (results.length === 0) {
      return 'No relevant information found from web search.';
    }

    let context = 'Relevant information from web search:\n\n';
    
    results.forEach((result, index) => {
      context += `${index + 1}. ${result.title}\n`;
      context += `   URL: ${result.url}\n`;
      context += `   Content: ${result.content}\n\n`;
    });

    return context;
  }

  private async generateResponse(query: string, context: string): Promise<string> {
    try {
      const systemPrompt = `You are a helpful AI assistant with access to real-time information. 
      
Use the provided context from web search results to answer the user's question accurately and comprehensively. 
If the context doesn't contain relevant information, acknowledge this and provide general knowledge if appropriate.
Always cite your sources when using information from the search results.
Keep your responses conversational but informative.

Context:
${context}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate response from AI model.');
    }
  }

  async generateStreamingResponse(
    query: string, 
    context: string, 
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const systemPrompt = `You are a helpful AI assistant with access to real-time information. 
      
Use the provided context from web search results to answer the user's question accurately and comprehensively. 
If the context doesn't contain relevant information, acknowledge this and provide general knowledge if appropriate.
Always cite your sources when using information from the search results.
Keep your responses conversational but informative.

Context:
${context}`;

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error('Streaming response error:', error);
      throw new Error('Failed to generate streaming response.');
    }
  }
}