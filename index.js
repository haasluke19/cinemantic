const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZDJlOTJkZTAxYTc5ZmIyY2UwZTU4NmE0MGUyYTJmMSIsInN1YiI6IjY0YTMyMWVjMTEzODZjMDBjNTkxMmFhMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.QRsBW310t8sTZasX2uRFdRsKwjgQeAQ4xTo8GdCIXSE",
  },
};

const movieListEl = document.querySelector(".movie__list");

async function main() {
  const response = await fetch("https://api.themoviedb.org/3/movie/popular?language=en", options);
  const data = await response.json();
  let movies = data.results;
  movies = movies.slice(0,6)
  const ratingPromises = movies.map((movie) => getMovieRating(movie.id));
  let ratings = await Promise.all(ratingPromises);
  loadInnerHtml(movies, ratings)
}

function movieHTML(movie, rating) {
  return `<li class="movie">
            <img src="https://image.tmdb.org/t/p/original${movie.poster_path}" alt="" class="movie__image">
            <div class="movie__description">
              <h3 class="movie__title">${movie.title}</h3>
            
              <div class="movie__description--wrapper">
                <h3 class="movie__released">${movie.release_date.slice(0, 4)}</h3>

                <div class="movie__rating--wrapper">
                  <h3 class="movie__rating">${Math.round(10*movie.vote_average)/10}/10</h3>
                  <h4 class="movie__rating--label">Rating</h4>
                </div>

                <h3 class="movie__rated ${ratingCheck(rating)}">${rating}</h3>
              </div>

              <button class="movie__button">View More</button>
            </div>
          </li>`;
}

function ratingCheck(rating) {
  if (rating===''){
    return 'no-border'
  }
  return
}

function loadInnerHtml(movies, ratings) {
  const movieHTMLs = movies.map((movie, index) => {
    if (!movie.poster_path){
      return
    } 
    return movieHTML(movie, ratings[index])});
  movieListEl.innerHTML = movieHTMLs.join("");
}

async function getMovieRating(id) {
  const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/release_dates`, options);
  const data = await response.json();
  const releases = data.results;
  const usReleaseData = releases.find((item) => item.iso_3166_1 === "US");

  if (usReleaseData && usReleaseData.release_dates) {
    const certification = usReleaseData.release_dates[0].certification;
    return certification;
  } else {
    return "";
  }
}

async function titleSearch(event) {
  event.preventDefault();
  const searchInput = document.getElementById('searchInput');
  const searchTitle = searchInput.value;
  console.log(searchTitle);
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${searchTitle}`, options);
  const data = await response.json();
  let movies = data.results;
  if (movies.length == 0){
    movieListEl.innerHTML = '<h3 class="no__movies">Oops. We can\'t any movies with that title...</h3>'
    return
  }
  
  const ratingPromises = movies.map((movie) => getMovieRating(movie.id));
  let ratings = await Promise.all(ratingPromises);
  
  loadInnerHtml(movies, ratings);
  searchInput.value = '';
}

main();