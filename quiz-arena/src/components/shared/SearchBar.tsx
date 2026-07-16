"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

function useDebounce<T>(value: T, delay: number): T {
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

export function SearchBar({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const debouncedSearch = useDebounce(search, 300);

  // Sync local state if the URL param changes externally (e.g. browser back/forward)
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
    const next = `${pathname}?${params.toString()}`;
    // Only navigate when the URL would actually change
    if (next !== `${pathname}?${searchParamsStr}`) {
      router.replace(next);
    }
  }, [debouncedSearch, pathname, router, searchParamsStr]);

  return (
    <div className="relative w-full max-w-md animate-fade-in">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
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
  );
}
