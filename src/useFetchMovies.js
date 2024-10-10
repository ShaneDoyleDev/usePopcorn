import { useState, useEffect } from "react";

export default function useFetchMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setErrorMessage("");

          const response = await fetch(
            `http://www.omdbapi.com/?apikey=f18fa495&s=${query}`,
            { signal: controller.signal }
          );
          if (!response.ok)
            throw new Error("Something went wrong with fetching the movies");

          const data = await response.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
        } catch (error) {
          if (error.name !== "AbortError") setErrorMessage(error.message);
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length === 0) {
        setMovies([]);
        setErrorMessage("");
        return;
      }

      fetchMovies();

      return () => controller.abort();
    },
    [query]
  );

  return { movies, isLoading, errorMessage };
}
