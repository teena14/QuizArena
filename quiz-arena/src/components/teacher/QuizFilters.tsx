"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function QuizFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();

  const initialSearch = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "desc";

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 300);

  // Sync local state when URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    const urlQ = searchParams.get("q") || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsStr]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsStr);
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    
    // Reset to page 1 on new search
    params.delete("cursor");
    
    const next = `${pathname}?${params.toString()}`;
    if (next !== `${pathname}?${searchParamsStr}`) {
      router.replace(next);
    }
  }, [debouncedSearch, pathname, router, searchParamsStr]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", e.target.value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in w-full max-w-2xl">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111111] border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <select
        value={initialSort}
        onChange={handleSortChange}
        className="bg-[#111111] border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors w-full sm:w-auto"
      >
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>
    </div>
  );
}
