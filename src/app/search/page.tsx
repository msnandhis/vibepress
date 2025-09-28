import { Metadata } from 'next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { SearchResults } from '@/components/search/results';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  return {
    title: query ? `Search: ${query} - Blog` : 'Search',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground">
          <span className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2 inline" />
            Back to Home
          </span>
        </Link>
      </div>
      <div className="max-w-2xl mx-auto mb-12">
        <form className="relative" action="/search">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            placeholder="Search articles, pages..."
            className="pl-10 pr-4"
            defaultValue={query}
          />
          <Button type="submit" variant="ghost" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      {query ? (
        <Suspense fallback={<div className="text-center py-12">Searching...</div>}>
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-display font-semibold mb-2">Start your search</h2>
            <p className="text-muted-foreground">Enter keywords to find articles and pages.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}