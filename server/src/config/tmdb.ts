export const TMDB_CONFIG = {
  API_KEY: '9e43f45f94705cc8e1d5a0400d19a7b7',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
};

export const tmdbApi = {
  searchMovies: async (query: string, page: number = 1) => {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/search/movie?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    return response.json();
  },

  getMovieDetails: async (movieId: string) => {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&append_to_response=credits,videos,images`
    );
    return response.json();
  },

  getPopularMovies: async (page: number = 1) => {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/popular?api_key=${TMDB_CONFIG.API_KEY}&page=${page}`
    );
    return response.json();
  },

  getTopRatedMovies: async (page: number = 1) => {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/top_rated?api_key=${TMDB_CONFIG.API_KEY}&page=${page}`
    );
    return response.json();
  },

  getMovieGenres: async () => {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/genre/movie/list?api_key=${TMDB_CONFIG.API_KEY}`
    );
    return response.json();
  },
};
