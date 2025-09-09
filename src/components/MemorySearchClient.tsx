'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, MessageSquare } from 'lucide-react';

interface SearchResult {
  answer: string;
  source: string;
  confidence: number;
  category: string;
  memory_type?: string;
  sources_count: number;
  related_topics: string[];
  timestamp: string;
}

export default function MemorySearchClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('http://localhost:8006/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          user_id: 'web_user'
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const result: SearchResult = await response.json();
      setSearchResult(result);
      setSearchHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 searches
    } catch (error) {
      console.error('Search error:', error);
      setSearchResult({
        answer: 'Sorry, I encountered an error while searching. Please try again.',
        source: 'error',
        confidence: 0,
        category: 'error',
        sources_count: 0,
        related_topics: [],
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Ask about Imercfy... (e.g., 'What is Imercfy?', 'What products does Imercfy offer?')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !searchQuery.trim()}
            className="px-6"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Search
          </Button>
        </div>
        
        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap gap-2">
          {[
            "What is Imercfy?",
            "What products does Imercfy offer?",
            "What technologies does Imercfy use?",
            "Tell me about Imercfy's case studies"
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery(suggestion)}
              disabled={isSearching}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Result */}
      {searchResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Search Result
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={searchResult.source === 'memory' ? 'default' : 'secondary'}>
                  {searchResult.source === 'memory' ? 'From Memory' : 'From Database'}
                </Badge>
                <Badge variant="outline">
                  {Math.round(searchResult.confidence * 100)}% confidence
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900">{searchResult.answer}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Category: {searchResult.category}</span>
                  <span>Sources: {searchResult.sources_count}</span>
                  {searchResult.memory_type && (
                    <span>Type: {searchResult.memory_type}</span>
                  )}
                </div>
                <span>{new Date(searchResult.timestamp).toLocaleString()}</span>
              </div>

              {searchResult.related_topics.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Related Topics:</p>
                  <div className="flex flex-wrap gap-1">
                    {searchResult.related_topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
            <CardDescription>
              Your recent memory searches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchHistory.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={result.source === 'memory' ? 'default' : 'secondary'}>
                      {result.source === 'memory' ? 'Memory' : 'Database'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {result.answer.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
