export interface YouTubeVideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channelName: string;
  viewCount: string;
  publishedAt: string;
  transcript?: string;
}

export class YouTubeService {
  private static readonly YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  private static readonly YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

  static extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  static async getVideoInfo(videoId: string): Promise<YouTubeVideoInfo> {
    if (!this.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is not configured. Please add VITE_YOUTUBE_API_KEY to your environment variables.');
    }

    try {
      console.log('Fetching video info from YouTube API...');
      
      const response = await fetch(
        `${this.YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${this.YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API error:', errorText);
        
        let errorMessage = `YouTube API request failed with status ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        
        throw new Error(`YouTube API Error: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('YouTube API response:', data);
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found or is not publicly available');
      }

      const video = data.items[0];

      return {
        id: videoId,
        title: video.snippet.title,
        description: video.snippet.description || '',
        thumbnail: video.snippet.thumbnails.maxresdefault?.url || 
                  video.snippet.thumbnails.high?.url || 
                  video.snippet.thumbnails.medium?.url ||
                  `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: this.formatDuration(video.contentDetails.duration),
        channelName: video.snippet.channelTitle,
        viewCount: this.formatViewCount(video.statistics.viewCount || '0'),
        publishedAt: video.snippet.publishedAt,
      };
    } catch (error) {
      console.error('Error fetching video info:', error);
      
      // Re-throw the error instead of falling back to mock data
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to fetch video information from YouTube');
      }
    }
  }

  static async getVideoTranscript(videoId: string): Promise<string> {
    // Note: YouTube's official API doesn't provide transcripts directly
    // We'll use the video description as content for summarization
    // In a production app, you might want to integrate with a transcript service
    
    try {
      const videoInfo = await this.getVideoInfo(videoId);
      
      if (!videoInfo.description || videoInfo.description.length < 50) {
        throw new Error('This video does not have sufficient description content for summarization. Please try a video with a detailed description or transcript.');
      }
      
      return videoInfo.description;
    } catch (error) {
      console.error('Error fetching video content:', error);
      throw error;
    }
  }

  private static formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private static formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return count;
  }
}