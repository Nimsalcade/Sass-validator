import { useQuery } from "@tanstack/react-query";

export function useExampleQuery() {
  return useQuery({
    queryKey: ["example"],
    queryFn: async () => {
      const response = await fetch("/api/example");
      if (!response.ok) {
        throw new Error("Failed to fetch example data");
      }
      return response.json();
    },
  });
}
