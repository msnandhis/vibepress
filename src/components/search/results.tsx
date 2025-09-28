"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
  type: 'post' | 'page';
  slug: string;
  score: number;
  categories?: { name: string }[];
}

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ q: query });
      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Searching for "{query}"</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </h2>
      </div>
      {error && <div className="text-destructive mb-4">{error}</div>}
      <div className="space-y-6">
        {results.map((result) => (
          <Card key={result.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  <Link
                    href={result.type === 'post' ? `/blog/${result.slug}` : `/${result.slug}`}
                    className="hover:underline">
                    {result.title}
                  </Link>
                </CardTitle>
                <Badge variant="secondary">{result.type}</Badge>
              </div>
              {result.categories && (
                <div className="flex flex-wrap gap-2">
                  {result.categories.map((cat) => (
                    <Badge key={cat.name} variant="outline">{cat.name}</Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-3">{result.excerpt}</CardDescription>
              <div className="mt-4 text-sm text-muted-foreground">
                Relevance: {(result.score * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {results.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No results found for "{query}". Try different keywords.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}