"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Page = {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};

export default function PagesPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.push("/sign-in");
    } else if (session?.user) {
      fetchPages();
    }
  }, [session, isSessionPending, router]);

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pages", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPages(data || []);
      } else {
        setError("Failed to fetch pages.");
      }
    } catch (err) {
      console.error("Error fetching pages:", err);
      setError("Failed to load pages. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deletePage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });
      if (res.ok) {
        toast.success("Page deleted successfully.");
        fetchPages(); // Refresh list
      } else {
        toast.error("Failed to delete page.");
      }
    } catch (err) {
      toast.error("Error deleting page.");
    }
  };

  if (isSessionPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pages</h1>
          <p className="text-muted-foreground">Manage your static pages</p>
        </div>
        <Button onClick={() => router.push("/admin/pages/new")}>
          <Plus className="h-4 w-4 mr-2" /> New Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Page List</CardTitle>
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <CardDescription>
            {filteredPages.length} of {pages.length} pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading pages...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pages found. Create your first page!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell>
                      <Badge variant={page.status === "published" ? "default" : "secondary"}>
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/pages/${page.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/pages/${page.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePage(page.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}