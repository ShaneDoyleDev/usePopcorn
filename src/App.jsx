import { useState, useEffect, useRef } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function ResultsTotal({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length || 0}</strong> results
    </p>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputElement = useRef(null);

  useEffect(() => {
    function focusSearchInput(e) {
      if (document.activeElement === inputElement.current) return;
      if (e.key === "Enter") {
        inputElement.current.focus();
        setQuery("");
      }
    }
    document.addEventListener("keydown", focusSearchInput);
    inputElement.current.focus();
    return () => document.removeEventListener("keydown", focusSearchInput);
  }, [setQuery]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
    />
  );
}

function MovieList({ movies, onMovieSelect }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onMovieSelect={onMovieSelect} />
      ))}
    </ul>
  );
}

function Movie({ movie, onMovieSelect }) {
  return (
    <li
      onClick={() => {
        onMovieSelect(movie.imdbID);
      }}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMoviesSummary({ watchedMovies }) {
  const avgImdbRating = average(watchedMovies.map((movie) => movie.imdbRating));
  const avgUserRating = average(watchedMovies.map((movie) => movie.userRating));
  const avgRuntime = average(watchedMovies.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watchedMovies.length}</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.round(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watchedMovies, onDeleteWatchedMovie }) {
  return (
    <ul className="list">
      {watchedMovies.map((movie) => (
        <WatchedMovie
          key={movie.imdbID}
          movie={movie}
          onDeleteWatchedMovie={onDeleteWatchedMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatchedMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatchedMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && <>{children}</>}
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Loader() {
  return <p className="loader">Loading</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>❌</span> {message}
    </p>
  );
}

function MovieDetails({
  movieId,
  watchedMovies,
  onMovieClose,
  onAddWatchedMovie,
}) {
  const [movie, setmovie] = useState({});
  const [userRating, setUserRating] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const ratingCountRef = useRef(0);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  const previouslyRatedMovie = watchedMovies.find(
    (watchedMovie) => watchedMovie.imdbID === movie.imdbID
  );

  function handelAddMovie() {
    const newWatchedMovie = {
      imdbID: movieId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      ratingDecisionCount: ratingCountRef.current,
    };

    onAddWatchedMovie(newWatchedMovie);
    onMovieClose();
  }

  useEffect(() => {
    if (userRating) ratingCountRef.current += 1;
  }, [userRating]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;
    return () => (document.title = `usePopcorn`);
  }, [title]);

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const response = await fetch(
        `http://www.omdbapi.com/?apikey=f18fa495&i=${movieId}`
      );
      const data = await response.json();
      setmovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [movieId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onMovieClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onMovieClose]);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onMovieClose}>
              &larr;
            </button>
            <img src={poster} alt="movie poster" />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDB Rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {previouslyRatedMovie ? (
                <p>⭐️ {previouslyRatedMovie.userRating} User Rating</p>
              ) : (
                <>
                  <StarRating maxRating={10} onSetRating={setUserRating} />
                  {userRating && (
                    <button className="btn-add" onClick={handelAddMovie}>
                      + Add To List
                    </button>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState(
    () => JSON.parse(localStorage.getItem("watchedMovies")) || []
  );
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleMovieSelect(movieId) {
    setSelectedMovieId((prevMovieId) =>
      prevMovieId === movieId ? null : movieId
    );
  }

  function handleMovieClose() {
    setSelectedMovieId(null);
  }

  function handleAddWatchedMovie(movie) {
    setWatchedMovies((prevWatchedMovies) => [...prevWatchedMovies, movie]);
  }

  function handleDeleteWatchedMovie(movieId) {
    setWatchedMovies((prevWatchedMovies) =>
      prevWatchedMovies.filter(
        (watchedMovie) => watchedMovie.imdbID !== movieId
      )
    );
  }

  useEffect(() => {
    localStorage.setItem("watchedMovies", JSON.stringify(watchedMovies));
  }, [watchedMovies]);

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

      handleMovieClose();
      fetchMovies();

      return () => controller.abort();
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <ResultsTotal movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && errorMessage && (
            <ErrorMessage message={errorMessage} />
          )}
          {!isLoading && !errorMessage && (
            <MovieList
              movies={movies}
              isLoading={isLoading}
              onMovieSelect={handleMovieSelect}
            />
          )}
        </Box>
        <Box>
          {selectedMovieId ? (
            <MovieDetails
              movieId={selectedMovieId}
              watchedMovies={watchedMovies}
              onMovieClose={handleMovieClose}
              onAddWatchedMovie={handleAddWatchedMovie}
            />
          ) : (
            <>
              <WatchedMoviesSummary watchedMovies={watchedMovies} />
              <WatchedMoviesList
                watchedMovies={watchedMovies}
                onDeleteWatchedMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
