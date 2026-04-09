import { useState } from "react";
import { BookOpen, ExternalLink, Globe2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ScholarBook {
  id: string;
  title: string;
  authors: string;
  year: string;
  publisher: string;
  description: string;
  tags: string[];
}

const MOCK_BOOKS: ScholarBook[] = [
  {
    id: "1",
    title: "Computer Science: An Overview",
    authors: "J. Glenn Brookshear, Dennis Brylow",
    year: "2021",
    publisher: "Pearson",
    description:
      "A polished introduction to computer science principles, algorithms, and software design for modern learners.",
    tags: ["Theory", "Programming", "Systems"],
  },
  {
    id: "2",
    title: "Introduction to Computer Systems",
    authors: "Randal E. Bryant, David R. O'Hallaron",
    year: "2023",
    publisher: "MIT Press",
    description:
      "A rigorous yet accessible guide to computer architecture, systems programming, and performance optimization.",
    tags: ["Architecture", "Systems", "Performance"],
  },
  {
    id: "3",
    title: "Computer Science Distilled",
    authors: "Wladston Ferreira Filho",
    year: "2022",
    publisher: "Independently published",
    description:
      "A modern review of the essential concepts every student and professional should know in computer science.",
    tags: ["Concepts", "Review", "Scholarship"],
  },
  {
    id: "4",
    title: "Designing Data-Intensive Applications",
    authors: "Martin Kleppmann",
    year: "2017",
    publisher: "O'Reilly Media",
    description:
      "A professional handbook for building reliable, scalable, and maintainable data systems.",
    tags: ["Data", "Engineering", "Design"],
  },
];

export default function ELibrary() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ScholarBook[]>([]);
  const [source, setSource] = useState<"scholar" | "library">("scholar");
  const [message, setMessage] = useState("Enter a query such as \"what is computer\" to see results.");

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setMessage("Please enter a search phrase.");
      return;
    }

    if (source === "scholar") {
      window.open(`https://scholar.google.com/scholar?q=${encodeURIComponent(trimmed)}`, "_blank");
    }

    if (trimmed.toLowerCase().includes("computer")) {
      setResults(MOCK_BOOKS);
      setMessage(`Showing scholar-style book recommendations for \"${trimmed}\".`);
    } else {
      setResults([]);
      setMessage(`No local results found for \"${trimmed}\". Try a broader search or open Google Scholar.`);
    }
  };

  return (
    <div className="space-y-8 p-5 rounded-lg animate-fade-in bg-orange-50 dark:bg-[#0f0d0b] text-slate-900 dark:text-[#f5efe8]">
      <div className="rounded-[32px] border border-orange-100 bg-orange-50/90 p-8 shadow-[0_30px_90px_-40px_rgba(251,146,60,0.25)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_30px_100px_-40px_rgba(251,146,60,0.35)] dark:border-[#2e2218] dark:bg-[#1a1410]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400">
              <Sparkles className="h-4 w-4" />
              Academic search made simple
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-orange-950 dark:text-[#f5efe8]">
                E-Library with Google Scholar support
              </h1>
              <p className="max-w-2xl text-orange-700 dark:text-[#a89880]">
                Search scholarly book recommendations and open Google Scholar directly for deep research.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4 shadow-sm dark:border-[#2e2218] dark:bg-[#1a1410]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-700 dark:text-orange-500">
              Search options
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  source === "scholar"
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                    : "border border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300 hover:bg-orange-100 dark:border-[#2e2218] dark:bg-[#0f0d0b] dark:text-[#f5efe8]"
                }`}
                onClick={() => setSource("scholar")}
              >
                <Globe2 className="mr-2 inline h-4 w-4" />
                Google Scholar
              </button>
              <button
                type="button"
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  source === "library"
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                    : "border border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300 hover:bg-orange-100 dark:border-[#2e2218] dark:bg-[#0f0d0b] dark:text-[#f5efe8]"
                }`}
                onClick={() => setSource("library")}
              >
                <BookOpen className="mr-2 inline h-4 w-4" />
                E-Library
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.85fr]">
          <Card className="overflow-hidden border border-orange-100 shadow-lg bg-orange-50/90 dark:border-[#2e2218] dark:bg-[#1a1410]">
            <CardHeader className="bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 px-6 py-6 text-white dark:from-[#0f0d0b] dark:via-[#1a1410] dark:to-[#2e2218]">
              <CardTitle className="text-2xl">Search the library</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-orange-50/90 dark:bg-[#1a1410]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-400 dark:text-orange-500" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                  placeholder="Type here: what is computer"
                  className="pl-12 border-orange-100 bg-orange-50 text-orange-950 placeholder:text-orange-500 dark:border-[#2e2218] dark:bg-[#0f0d0b] dark:text-[#f5efe8] dark:placeholder:text-orange-500"
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-orange-700 dark:text-[#a89880]">
                    Search academic keywords like "what is computer" to reveal scholar-style recommendations.
                  </p>
                  <p className="text-sm text-orange-800 dark:text-[#f5efe8]">
                    Selected source: <span className="font-semibold text-orange-950 dark:text-[#f5efe8]">{source === "scholar" ? "Google Scholar" : "E-Library"}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleSearch} className="min-w-[150px]">
                    Search
                  </Button>
                  {source === "scholar" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(`https://scholar.google.com/scholar?q=${encodeURIComponent(query.trim() || "computer")}`, "_blank")
                      }
                      className="min-w-[170px]"
                    >
                      Open Google Scholar
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 rounded-[28px] border border-orange-100 bg-orange-50/80 p-6 shadow-sm dark:border-[#2e2218] dark:bg-[#1a1410]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-900 text-white dark:bg-[#0f0d0b] dark:text-orange-400">
                <Globe2 className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-orange-700 dark:text-orange-500">Research mode</p>
                <h2 className="text-xl font-semibold text-orange-950 dark:text-[#f5efe8]">Google Scholar ready</h2>
              </div>
            </div>
            <p className="text-sm leading-6 text-orange-700 dark:text-[#a89880]">
              Use Google Scholar for academic citations, research papers, and author-aware book recommendations. The search input can also reveal local book results when your query is about core computer science topics.
            </p>
            <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4 text-sm text-orange-900 dark:border-[#2e2218] dark:bg-[#0f0d0b] dark:text-[#a89880]">
              <p className="font-semibold">Tip:</p>
              <p className="mt-2">
                Search exactly "what is computer" and the page will show professional book recommendations from the E-Library collection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-orange-200 bg-orange-50 px-6 py-5 shadow-sm dark:border-[#2e2218] dark:bg-[#1a1410]">
          <div>
            <h2 className="text-2xl font-semibold text-orange-950 dark:text-[#f5efe8]">Search results</h2>
            <p className="text-sm text-orange-700 dark:text-[#a89880]">
              Professional titles appear below when the query includes computer-related research.
            </p>
          </div>
          <Badge className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700 dark:bg-[#0f0d0b] dark:text-orange-400">
            {results.length} results
          </Badge>
        </div>

        {results.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-orange-200 bg-orange-50 p-8 text-center text-orange-600 dark:border-[#2e2218] dark:bg-[#1a1410] dark:text-[#a89880]">
            <p className="text-lg font-semibold text-orange-950 dark:text-[#f5efe8]">{message}</p>
            <p className="mt-2 text-sm">Try searching for "what is computer" or switch to Google Scholar mode for extended results.</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {results.map((book) => (
              <Card
                key={book.id}
                className="overflow-hidden border border-orange-200 bg-orange-50 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-[#2e2218] dark:bg-[#1a1410]"
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-orange-950 dark:text-[#f5efe8]">{book.title}</h3>
                      <p className="text-sm text-orange-700 dark:text-[#a89880]">{book.authors} · {book.year}</p>
                    </div>
                    <Badge className="rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white">
                      Scholar
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-orange-800 dark:text-[#f5efe8]">{book.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="text-xs uppercase tracking-[0.18em] text-orange-700 dark:text-orange-400 border-orange-200 dark:border-[#2e2218]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-3 text-sm text-orange-600 dark:text-orange-500">
                    <BookOpen className="h-4 w-4" />
                    <span>{book.publisher}</span>
                    <ExternalLink className="h-4 w-4" />
                    <span>Google Scholar match</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}