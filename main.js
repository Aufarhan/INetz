const API_KEY = "e02bb07d813f5255844c6d19ab9395ab";

let baseURL = "https://api.themoviedb.org/3/";
let imageURL = "https://image.tmdb.org/t/p/w300";
let recommImageURL = "https://image.tmdb.org/t/p/w185";

$(document).ready(() => {
  sessionStorage.setItem("type", "all");
  sessionStorage.setItem("time", "day");
  showMovieByTypeTime(sessionStorage.getItem("type"), sessionStorage.getItem("time"));

  sessionStorage.removeItem("category");

  showMovieByCategory("upcoming");

  $("#searchForm").on("submit", (e) => {
    let searchText = $("#searchInput").val();

    getMovies(searchText);

    $("#searchInput").val("");
    e.preventDefault();
  });

  const navShow = () => {
    let burger = document.querySelector(".burger");
    let nav = document.querySelector(".nav-links");

    burger.addEventListener("click", (e) => {
      e.preventDefault();

      nav.classList.toggle("active");
      burger.classList.toggle("toggle");
      $("body").toggleClass("no-overflow");
    });
  };

  navShow();
});

function getMovies(searchText, page = 1) {
  let url = `${baseURL}search/movie?api_key=${API_KEY}&query=${searchText}&language=en-US&include_adult=false&page=${page}`;

  $.ajax({
    method: "GET",
    url: url,

    success: function (data) {
      let output = "";
      let pageinate = "";
      let searchfor = "";

      if (data["results"].length > 0) {
        for (let i = 0; i < data["results"].length; i++) {
          let posterPath = data["results"][i]["poster_path"];

          searchfor = `
          <div class="text-white bg-red-500 w-fit ml-20 px-6 py-4 rounded-lg">
          <h1>Search results for : "${searchText}"</h1>
          </div>
      `;
          $(".searchfor").html(searchfor);

          output += `
          <button class="detailsButton m-6" onclick="selectedMovie('${data["results"][i]["id"]}')">
          <div class="movie relative w-min h-full overflow-hidden">
              <img class="image rounded-lg block min-w-[180px] max-h-[250px] text-md text-center" src=${imageURL + String(posterPath)} alt="No image found." loading="lazy">

              <div class="ratingFlex font-bold leading px-2">
                  <h4 class="title pt-2 font-black">${data["results"][i]["title"]}</h4>
                  </div>
              <div class="absolute top-0 left-0 flex bg-black bg-opacity-60 rounded-tl-lg rounded-br-lg py-0.5">
                <span class="text-sm font-bold text-yellow-300 pt-0.5 px-2">★</span>
                  <span class="rating  text-white mr-3">${data["results"][i]["vote_average"]}</span>
                  </div>
          </div>
          </button>
                    `;
          $(".result").html(output);
          $("footer").show();
        }
        pageinate = `
                    <button class="prevBtn my-4 mx-2 px-2 py-1 bg-red-500 text-white font-bold rounded-lg" onclick="prevBtn()">Prev</button>
                    Page <span class="currentPage"></span> of <span class="totalPages"></span>
                    <button class="nextBtn my-4 mx-2 px-2 py-1 bg-red-500 text-white font-bold rounded-lg" onclick="nextBtn()">Next</button>
                `;
        $(".pagination").html(pageinate);
      } else {
        output += `
                    <p class="empty">
                        No such movie found. Try searching other keywords.
                    </p>
                `;
        $(".result").html(output);
      }

      sessionStorage.setItem("searchText", searchText);
      getPagination(data["page"], data["total_pages"]);
    },
  });
}

function getPagination(currentPage, totalPages) {
  if (totalPages == 0) {
    $(".pagination").hide();
  } else {
    if (totalPages == 1) {
      $(".prevBtn").hide();
      $(".nextBtn").hide();
    } else if (currentPage == 1) {
      $(".prevBtn").hide();
    } else if (currentPage == totalPages) {
      $(".nextBtn").hide();
    } else {
      $(".prevBtn").show();
      $(".nextBtn").show();
    }
  }
  $(".currentPage").html(currentPage);
  $(".totalPages").html(totalPages);
}

function prevBtn() {
  $("html, body").animate({ scrollTop: 0 }, "slow");
  let page = $(".currentPage").html();
  let prevPage;

  let searchText = sessionStorage.getItem("searchText");
  let category = sessionStorage.getItem("category");
  let genre = sessionStorage.getItem("genre");

  if (page != 1) {
    prevPage = parseInt(page) - 1;

    if (searchText) {
      getMovies(searchText, prevPage);
    } else if (category) {
      showMovieByCategory(category, prevPage);
    } else if (genre) {
      showMovieByGenre(genre, prevPage);
    }
  }
}

function nextBtn() {
  $("html, body").animate({ scrollTop: 0 }, "slow");

  let page = $(".currentPage").html();
  let total = $(".totalPages").html();
  let nextPage;

  let searchText = sessionStorage.getItem("searchText");
  let category = sessionStorage.getItem("category");
  let genre = sessionStorage.getItem("genre");

  if (page != total) {
    nextPage = parseInt(page) + 1;

    if (searchText) {
      getMovies(searchText, nextPage);
    } else if (category) {
      showMovieByCategory(category, nextPage);
    } else if (genre) {
      showMovieByGenre(genre, nextPage);
    }
  }
}

function selectedMovie(movie_id) {
  sessionStorage.setItem("movieId", movie_id);
  window.location = "./moviedetails.html";
}

function selectedTV(tv_id) {
  sessionStorage.setItem("TVId", tv_id);
  window.location = "./tvdetails.html";
}

async function get_movie_trailer(id) {
  const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
  const respData = await resp.json();
  return respData.results[0].key;
}

async function getMovieDetails() {
  let movie_id = sessionStorage.getItem("movieId");
  const movie_trailer = await get_movie_trailer(movie_id);
  let url = `${baseURL}movie/${movie_id}?api_key=${API_KEY}&language=en-US`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (details) {
      let showDetails = "";
      let postPath = details["poster_path"];
      let genres = [];
      let prod_country = [];
      let prod_company = [];
      let language = [];

      for (let j = 0; j < details["genres"].length; j++) {
        genres.push(` ${details["genres"][j]["name"]}`);
      }

      for (let j = 0; j < details["production_countries"].length; j++) {
        prod_country.push(` ${details["production_countries"][j]["name"]}`);
      }

      for (let j = 0; j < details["production_companies"].length; j++) {
        prod_company.push(` ${details["production_companies"][j]["name"]}`);
      }

      for (let j = 0; j < details["spoken_languages"].length; j++) {
        language.push(` ${details["spoken_languages"][j]["english_name"]}`);
      }

      showDetails += `
      
      <div class="bg-black bg-opacity-40 pb-6 bg-gradient-to-t from-black to-transparent">
      <img class="img-fluid absolute -z-10 md:h-[1040px] h-[1210px] w-full truncate" src="https://image.tmdb.org/t/p/original/${details.backdrop_path}" alt="">
      <div class="movieTitle md:text-6xl text-3xl font-extrabold text-white mt-20 px-4 w-full bg-gradient-to-b from-black to-transparent py-8">
          <p class="ml-5">${details["title"]}</p>
      
          <button class="watchButton bg-red-500 rounded-lg ml-5 mt-0 text-base px-2 py-1" 
              onclick="addToWatch('${details["title"]}','${details["id"]}');"
          >
          + Add to Watchlist</button>
      </div>
      <div class="max-w-full mx-8">
  <div class="md:flex">
    <div class="md:shrink-0 md:mr-3 md:mt-32 mb-4">
      <img class="h-56 w-full object-cover md:h-96 md:w-80 rounded-xl" src="${imageURL + String(postPath)}" alt="No image found." loading="lazy">
    </div>
    <div class="p-8 bg-white bg-opacity-10 rounded-xl shadow-md overflow-hidden md:max-w-6xl">
    <iframe class="rounded-xl mx-auto mb-4 w-[560px] md:w-[800px]" width="800" height="315" src="https://www.youtube.com/embed/${movie_trailer}?autoplay=1" title="${
        details["title"]
      }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <div class="uppercase tracking-wide text-sm text-gray-200 mb-2 font-semibold">Details</div>
      <hr class="border-gray-800">
      <div class="text-white">
      <p class="pt-2"><strong>Genre: </strong>${genres}</p>
      <p><strong>Runtime: </strong>${details["runtime"]} min</p>
      <p><strong>Language: </strong>${language}</p>
      <p><strong>Release Date: </strong>${details["release_date"]}</p>
      <p><strong>Average Rating: </strong>${details["vote_average"]}</p>
      <p><strong>Production Country: </strong>${prod_country}</p>
      <p><strong>Production Company: </strong>${prod_company}</p>
      <div class="moviePeople py-2">
          <h2 class="castTitle pb-2 font-extrabold"></h2>
          <hr class="border-gray-800 pt-2">
          <p class="cast"></p>
          <p class="writer"></p>
          <p class="director"></p>
          <p class="producer"></p>
          <p class="music"></p>
      </div>
      
                          <div class="moviePlot pt-2">
                              <h2 class="font-extrabold pb-2">Plot</h2>
                              <hr class="border-gray-800 pt-2">
                              <p>${details["overview"]}</p>
                          </div>
                              </div>
                              </div>
    </div>
  </div>
</div>

            `;

      $(".movieContainer").html(showDetails);
      getCastCrew(movie_id);

      $("title").html(details["title"]);
    },
  });
}

async function get_tv_trailer(id) {
  const resp = await fetch(`https://api.themoviedb.org/3/tv/${id}/videos?api_key=${API_KEY}`);
  const respData = await resp.json();
  return respData.results[0].key;
}

async function getTVdetails() {
  let tv_id = sessionStorage.getItem("TVId");
  const tv_trailer = await get_tv_trailer(tv_id);
  url = `${baseURL}tv/${tv_id}?api_key=${API_KEY}&language=en-US`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (tv) {
      let showDetails = "";
      let postPath = tv["poster_path"];
      let genres = [];
      let prod_country = [];
      let prod_company = [];
      let language = [];

      for (let j = 0; j < tv["genres"].length; j++) {
        genres.push(` ${tv["genres"][j]["name"]}`);
      }

      for (let j = 0; j < tv["production_countries"].length; j++) {
        prod_country.push(` ${tv["production_countries"][j]["name"]}`);
      }

      for (let j = 0; j < tv["production_companies"].length; j++) {
        prod_company.push(` ${tv["production_companies"][j]["name"]}`);
      }

      for (let j = 0; j < tv["spoken_languages"].length; j++) {
        language.push(` ${tv["spoken_languages"][j]["english_name"]}`);
      }

      showDetails += `
      <div class="bg-black bg-opacity-40 pb-6 bg-gradient-to-t from-black to-transparent">
      <img class="img-fluid absolute -z-10 md:h-[900px] h-[1210px] w-full truncate" src="https://image.tmdb.org/t/p/original/${tv.backdrop_path}" alt="">
      <div class="movieTitle md:text-6xl text-3xl font-extrabold text-white mt-20 px-4 w-full bg-gradient-to-b from-black to-transparent py-8">
                    <p class="ml-5">${tv["name"]}</p>
                    <button class="watchButton bg-red-500 rounded-lg ml-5 mt-0 text-base px-2 py-1" 
                    onclick="addToWatch('${tv["name"]}','${tv["id"]}');"
                >
                + Add to Watchlist</button>
                    
                </div>

      <div class="max-w-full mx-8">
  <div class="md:flex">
    <div class="md:shrink-0 md:mr-3 md:mt-32 mb-4">
      <img class="h-56 w-full object-cover md:h-96 md:w-80 rounded-xl" src="${imageURL + String(postPath)}" alt="No image found." loading="lazy">
    </div>
    <div class="p-8 bg-white  bg-opacity-10 rounded-xl shadow-md overflow-hidden md:max-w-6xl">
    <iframe class="rounded-xl mx-auto mb-4 w-[560px] md:w-[800px]" width="800" height="315" src="https://www.youtube.com/embed/${tv_trailer}?autoplay=1" title="${
        tv["name"]
      }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <div class="uppercase tracking-wide text-sm text-gray-200 mb-2 font-semibold">Details</div>
      <hr class="border-gray-800 pb-2">
      <div class="text-white">
      <p><strong>Genre: </strong>${genres}</p>
      <p><strong>Aired on: </strong>${tv["first_air_date"]}</p>
      <p><strong>Language: </strong>${language}</p>
      <p><strong>No. of Seasons: </strong>${tv["number_of_seasons"]}</p>
      <p><strong>No. of Episodes: </strong>${tv["number_of_episodes"]}</p>
      <p><strong>Average Rating: </strong>${tv["vote_average"]}</p>
      <p><strong>Production Country: </strong>${prod_country}</p>
      <p><strong>Production Company: </strong>${prod_company}</p>
      
      <div class="moviePeople py-2">
          <h2 class="castTitle pb-2 font-extrabold"></h2>
          <hr class="border-gray-800 pt-2">
          <p class="cast"></p>
          <p class="writer"></p>
          <p class="director"></p>
          <p class="producer"></p>
          <p class="music"></p>
      </div>
      
      <div class="moviePlot pt-2">
      <h2 class="font-extrabold pb-2">Plot</h2>
      <hr class="border-gray-800 pt-2">
      <p>${tv["overview"]}</p>
      </div>
      </div>
                              </div>
                              </div>
    </div>
  </div>
</div>
            `;

      $(".movieContainer").html(showDetails);
      getTVcast(tv_id);

      $("title").html(tv["name"]);
    },
  });
}

function addToWatch(movie_name, movie_id, tv_id, tv_name) {
  localStorage.setItem(movie_name, movie_id, tv_name, tv_id);

  watched = document.querySelector(".watchButton");
  watched.classList.add("watched");
  watched.innerText = "Added to Watchlist";
}

function showWatchlist() {
  for (let name of Object.keys(localStorage)) {
    let movie_id = localStorage.getItem(name);
    let tv_id = localStorage.getItem(name);

    let url = `${baseURL}movie/${movie_id}?api_key=${API_KEY}&language=en-US`;
    let urlTV = `${baseURL}tv/${tv_id}?api_key=${API_KEY}&language=en-US`;

    watch = "";

    $.ajax({
      url: url,
      method: "GET",

      success: function (details) {
        if (details["id"] == movie_id) {
          w_id = details["id"];
          w_poster = details["poster_path"];
          w_title = details["title"];
          w_rating = details["vote_average"];

          watch += `
          <div class="movie relative m-6 mb-4 w-min h-full overflow-hidden">
          <div class=" right-0 absolute top-0 bg-red-500 rounded-tr-lg rounded-bl-lg py-0.5 px-2 shadow-lg text-white">
          <button class="detailsButton" onclick="removeFromWatched('${w_title}')">Remove</button>
          </div>
          <button class="detailsButton" onclick="selectedMovie('${details["id"]}')">
              <img class="image rounded-lg block min-w-[180px] max-h-[250px] text-md text-center" src=${imageURL + String(w_poster)} alt="No image found." loading="lazy">

              <div class="ratingFlex font-bold leading px-2">
                  <h4 class="title">${w_title}</h4>
                  </div>
              <div class="absolute top-0 left-0 flex bg-black bg-opacity-60 rounded-tl-lg rounded-br-lg py-0.5">
                <span class="text-sm font-bold text-yellow-300 pt-0.5 px-2">★</span>
                  <span class="rating  text-white mr-3">${w_rating}</span>
                  </div>
                  </button>
          </div>

                    `;
          $(".watchlist").html(watch);
        }
      },
    });
    $.ajax({
      url: urlTV,
      method: "GET",

      success: function (tv) {
        if (tv["id"] == tv_id) {
          w_id = tv["id"];
          w_poster = tv["poster_path"];
          w_title = tv["name"];
          w_rating = tv["vote_average"];

          watch += `
          <div class="movie relative m-6 mb-4 w-min h-full overflow-hidden">
          <div class=" right-0 absolute top-0 bg-red-500 rounded-tr-lg rounded-bl-lg py-0.5 px-2 shadow-lg text-white">
          <button class="detailsButton" onclick="removeFromWatched('${w_title}')">Remove</button>
          </div>
          <button class="detailsButton" onclick="selectedTV('${tv["id"]}')">
              <img class="image rounded-lg block min-w-[180px] max-h-[250px] text-md text-center" src=${imageURL + String(w_poster)} alt="No image found." loading="lazy">

              <div class="ratingFlex font-bold leading px-2">
                  <h4 class="title">${w_title}</h4>
                  </div>
              <div class="absolute top-0 left-0 flex bg-black bg-opacity-60 rounded-tl-lg rounded-br-lg py-0.5">
                <span class="text-sm font-bold text-yellow-300 pt-0.5 px-2">★</span>
                  <span class="rating  text-white mr-3">${w_rating}</span>
                  </div>
                  </button>
          </div>

                    `;
          $(".watchlist").html(watch);
        }
      },
    });
  }
}

function removeFromWatched(title) {
  localStorage.removeItem(title);
  window.location.reload();
}

function getCastCrew(movie_id) {
  let url = `${baseURL}movie/${movie_id}/credits?api_key=${API_KEY}&language=en-US`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (castNcrew) {
      if (castNcrew) {
        let cast = castNcrew["cast"];
        let crew = castNcrew["crew"];

        let showCast = "";
        let castName = [];

        if (cast.length > 0) {
          for (let i = 0; i < 6; i++) {
            castName.push(` ${cast[i]["name"]}`);
          }
          showCast = `
                        <p><strong>Cast: </strong>${castName}</p>
                    `;

          $(".cast").html(showCast);
          $(".castTitle").html("Cast & Crew");
        }

        if (crew.length > 0) {
          let producer,
            writer,
            director,
            music = "";

          for (let j = 0; j < crew.length; j++) {
            if (crew[j]["job"] == "Producer") {
              producer = crew[j]["name"];
            } else if (crew[j]["job"] == "Writer" || crew[j]["job"] == "Story" || crew[j]["job"] == "Screenstory") {
              writer = crew[j]["name"];
            } else if (crew[j]["job"] == "Director") {
              director = crew[j]["name"];
            } else if (crew[j]["job"] == "Music Composer" || crew[j]["job"] == "Music" || crew[j]["job"] == "Original Music Composer") {
              music = crew[j]["name"];
            }
          }

          if (producer) {
            showProd = `
                            <p><strong>Producer: </strong>${producer}</p>
                        `;
            $(".producer").html(showProd);
          }

          if (director) {
            showDir = `
                            <p><strong>Director: </strong>${director}</p>
                        `;
            $(".director").html(showDir);
          }

          if (writer) {
            showWri = `
                            <p><strong>Writer: </strong>${writer}</p>
                        `;
            $(".writer").html(showWri);
          }

          if (music) {
            showMusic = `
                            <p><strong>Music Composer: </strong>${music}</p>
                        `;
            $(".music").html(showMusic);
          }

          $(".castTitle").html("Cast & Crew");
        }
      }
    },
  });
}

function getTVcast(tv_id) {
  let url = `${baseURL}tv/${tv_id}/credits?api_key=${API_KEY}&language=en-US`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (tv_cast) {
      if (tv_cast) {
        let cast = tv_cast["cast"];
        let crew = tv_cast["crew"];

        let showCast = "";
        let castName = [];

        if (cast.length > 0) {
          for (let i = 0; i < 6; i++) {
            castName.push(` ${cast[i]["name"]}`);
          }
          showCast = `
                        <p><strong>Cast: </strong>${castName}</p>
                    `;

          $(".cast").html(showCast);
          $(".castTitle").html("Cast & Crew");
        }

        if (crew.length > 0) {
          let producer,
            writer,
            director,
            music = "";

          for (let j = 0; j < crew.length; j++) {
            if (crew[j]["job"] == "Producer") {
              producer = crew[j]["name"];
            } else if (crew[j]["job"] == "Writer" || crew[j]["job"] == "Story" || crew[j]["job"] == "Screenstory" || crew[j]["job"] == "Writing") {
              writer = crew[j]["name"];
            } else if (crew[j]["job"] == "Director") {
              director = crew[j]["name"];
            } else if (crew[j]["job"] == "Music Composer" || crew[j]["job"] == "Music" || crew[j]["job"] == "Original Music Composer") {
              music = crew[j]["name"];
            }
          }

          if (producer) {
            showProd = `
                            <p><strong>Producer: </strong>${producer}</p>
                        `;
            $(".producer").html(showProd);
          }

          if (director) {
            showDir = `
                            <p><strong>Director: </strong>${director}</p>
                        `;
            $(".director").html(showDir);
          }

          if (writer) {
            showWri = `
                            <p><strong>Writer: </strong>${writer}</p>
                        `;
            $(".writer").html(showWri);
          }

          if (music) {
            showMusic = `
                            <p><strong>Music Composer: </strong>${music}</p>
                        `;
            $(".music").html(showMusic);
          }

          $(".castTitle").html("Cast & Crew");
        }
      }
    },
  });
}

function getMovieRecommendations() {
  let movie_id = sessionStorage.getItem("movieId");

  let url = `${baseURL}movie/${movie_id}/recommendations?api_key=${API_KEY}&language=en-US&include_adult=false&page=1`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (recomm) {
      let showRecomm = "";

      if (recomm["results"].length > 0) {
        for (let i = 0; i < recomm["results"].length; i++) {
          let posterPath = recomm["results"][i]["poster_path"];

          showRecomm += `
          <button class="detailsButton text-white" onclick="selectedMovie('${recomm["results"][i]["id"]}')">
                        <div class="movie text-white">
                            <img class="recommImage w-[160px] h-[200px] rounded-lg" src=${recommImageURL + String(posterPath)} alt="No image found." loading="lazy">
                            <h4 class="title text-sm w-[160px]">${recomm["results"][i]["title"]}</h4>
                            </div>
                            </button>
                    `;
          $(".movieRecommendations").html(showRecomm);
        }
      } else {
        showRecomm += '<p class="text-white">No recommendations available.</p>';
        $(".movieRecommendations").html(showRecomm);
      }
    },
  });
}

function getTVrecommendations() {
  let tv_id = sessionStorage.getItem("TVId");

  let url = `${baseURL}tv/${tv_id}/recommendations?api_key=${API_KEY}&language=en-US&include_adult=false&page=1`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (recomm) {
      let showRecomm = "";

      if (recomm["results"].length > 0) {
        for (let i = 0; i < recomm["results"].length; i++) {
          let posterPath = recomm["results"][i]["poster_path"];

          showRecomm += `
          <button class="detailsButton text-white" onclick="selectedTV('${recomm["results"][i]["id"]}')">
          <div class="movie text-white">
              <img class="recommImage w-[160px] h-[200px] rounded-lg" src=${recommImageURL + String(posterPath)} alt="No image found." loading="lazy">
              <h4 class="title text-sm w-[160px]">${recomm["results"][i]["name"]}</h4>
              </div>
              </button>
                    `;
          $(".movieRecommendations").html(showRecomm);
        }
      } else {
        showRecomm += '<p class="text-white">No recommendations available.</p>';
        $(".movieRecommendations").html(showRecomm);
      }
    },
  });
}

function getMovieReviews() {
  let movie_id = sessionStorage.getItem("movieId");

  let url = `${baseURL}movie/${movie_id}/reviews?api_key=${API_KEY}&language=en-US&page=1`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (reviews) {
      let showReview = "";

      if (reviews["results"].length > 0) {
        for (let k = 0; k < reviews["results"].length; k++) {
          let name = reviews["results"][k]["author"];
          let content = reviews["results"][k]["content"];
          let date = reviews["results"][k]["created_at"];

          date = date.split("T");

          showReview += `
                        <div class="reviewDetails text-white md:mx-40 bg-white bg-opacity-10 pb-2 rounded-lg mx-8">
                            <div class="reviewFlex pl-4 py-2 text-black w-full bg-white rounded-lg mb-4">
                                <div class="author font-bold">${name}</div>
                                <div class="date text-sm">${date[0]}</div>
                            </div>

                            <div class="content py-2 px-4">"${content}"</div>
                        </div>
                    `;
        }
        $(".movieReviews").html(showReview);
      } else {
        showReview += '<center class="text-white">No reviews available.</center>';
        $(".movieReviews").html(showReview);
      }
    },
  });
}

function getTVreviews() {
  let tv_id = sessionStorage.getItem("TVId");

  let url = `${baseURL}tv/${tv_id}/reviews?api_key=${API_KEY}&language=en-US&page=1`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (reviews) {
      let showReview = "";

      if (reviews["results"].length > 0) {
        for (let k = 0; k < reviews["results"].length; k++) {
          let name = reviews["results"][k]["author"];
          let content = reviews["results"][k]["content"];
          let date = reviews["results"][k]["created_at"];

          date = date.split("T");

          showReview += `
          <div class="reviewDetails text-white md:mx-40 bg-white bg-opacity-10 pb-2 rounded-lg mx-8">
                            <div class="reviewFlex pl-4 py-2 text-black w-full bg-white rounded-lg mb-4">
                                <div class="author font-bold">${name}</div>
                                <div class="date text-sm">${date[0]}</div>
                            </div>

                            <div class="content py-2 px-4">"${content}"</div>
                        </div>
                    `;
        }
        $(".movieReviews").html(showReview);
      } else {
        showReview += '<center class="text-white">No reviews available.</center>';
        $(".movieReviews").html(showReview);
      }
    },
  });
}

function showHideRecomm() {
  //Show Recommendations first
  $(".reviews").insertAfter(".recommendations");

  recomm = document.querySelector(".recommendations");
  recomm.classList.toggle("hideRecomm");

  recommText = document.querySelector(".recommButton");
  if (recommText.innerHTML === "Show Recommendations") {
    recommText.innerHTML = "Hide Recommendations";
  } else {
    recommText.innerHTML = "Show Recommendations";
  }
}

function showHideReview() {
  // Show Reviews first
  $(".recommendations").insertAfter(".reviews");

  review = document.querySelector(".reviews");
  review.classList.toggle("hideReview");

  reviewText = document.querySelector(".reviewButton");
  if (reviewText.innerHTML === "Show Reviews") {
    reviewText.innerHTML = "Hide Reviews";
  } else {
    reviewText.innerHTML = "Show Reviews";
  }
}

function movieGenre(selectedGenre) {
  let url = `${baseURL}genre/movie/list?api_key=${API_KEY}&language=en-US`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (genres) {
      for (let i in genres.genres) {
        if (genres.genres[i]["name"] === selectedGenre.value) {
          document.querySelector(".changeTitle").innerHTML = genres.genres[i]["name"];
          genre_id = genres.genres[i]["id"];
          showMovieByGenre(genre_id);
          break;
        }
      }
    },
  });
}

function showMovieByGenre(genre_id, page = 1) {
  let url = `${baseURL}discover/movie?api_key=${API_KEY}&with_genres=${genre_id}&language=en-US&sort_by=popularity.desc&include_adult=false&page=${page}`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (discover) {
      let output = "";

      if (discover["results"].length > 0) {
        for (let i = 0; i < discover["results"].length; i++) {
          let posterPath = discover["results"][i]["poster_path"];

          output += `
          <button class="detailsButton m-6" onclick="selectedMovie('${discover["results"][i]["id"]}')">
          <div class="movie relative w-min h-full overflow-hidden">
              <img class="image rounded-lg block min-w-[180px] max-h-[250px] text-md text-center shadow-xl" src=${imageURL + String(posterPath)} alt="No image found." loading="lazy">

              <div class="ratingFlex font-bold leading px-2">
                  <h4 class="title pt-2 font-black">${discover["results"][i]["title"]}</h4>
                  </div>
              <div class="absolute top-0 left-0 flex bg-black bg-opacity-60 rounded-tl-lg rounded-br-lg py-0.5">
                <span class="text-sm font-bold text-yellow-300 pt-0.5 px-2">★</span>
                  <span class="rating  text-white mr-3">${discover["results"][i]["vote_average"]}</span>
                  </div>
          </div>
          </button>
                    `;
          $(".trending").html(output);
        }
      } else {
        output += `
                    <p class="empty">
                        No movie found.
                    </p>
                `;
        $(".trending").html(output);
      }

      $(".pagination").show();

      sessionStorage.setItem("genre", genre_id);
      sessionStorage.removeItem("category");
      getPagination(discover["page"], discover["total_pages"]);
    },
  });
}

function movieCategory(selectedCategory) {
  let appendToURL = "";

  switch (selectedCategory.value) {
    case "now_playing":
      appendToURL = "now_playing";
      break;
    case "popular":
      appendToURL = "popular";
      break;
    case "top_rated":
      appendToURL = "top_rated";
      break;
    case "upcoming":
      appendToURL = "upcoming";
      break;
  }

  showMovieByCategory(appendToURL);
  document.querySelector(".changeTitle").innerHTML = selectedCategory.options[selectedCategory.selectedIndex].text;
}

function showMovieByCategory(category, page = 1) {
  let url = `${baseURL}movie/${category}?api_key=${API_KEY}&language=en-US&include_adult=false&page=${page}`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (cat) {
      let output = "";

      if (cat["results"].length > 0) {
        for (let i = 0; i < cat["results"].length; i++) {
          let posterPath = cat["results"][i]["poster_path"];

          output += `
          <button class="detailsButton m-6" onclick="selectedMovie('${cat["results"][i]["id"]}')">
          <div class="movie relative w-min h-full overflow-hidden">
              <img class="image rounded-lg block min-w-[180px] max-h-[250px] text-md text-center shadow-xl" src=${imageURL + String(posterPath)} alt="No image found." loading="lazy">

              <div class="ratingFlex font-bold leading px-2">
                  <h4 class="title pt-2 font-black">${cat["results"][i]["title"]}</h4>
                  </div>
              <div class="absolute top-0 left-0 flex bg-black bg-opacity-60 rounded-tl-lg rounded-br-lg py-0.5">
                <span class="text-sm font-bold text-yellow-300 pt-0.5 px-2">★</span>
                  <span class="rating  text-white mr-3">${cat["results"][i]["vote_average"]}</span>
                  </div>
          </div>
          </button>
                    `;
          $(".trending").html(output);
        }
      } else {
        output += `
                <p class="empty">
                    No movie found.
                </p>`;
        $(".trending").html(output);
      }
      $(".pagination").show();

      sessionStorage.setItem("category", category);
      sessionStorage.removeItem("genre");
      getPagination(cat["page"], cat["total_pages"]);
    },
  });
}

function movieType(selectedType) {
  let time = sessionStorage.getItem("time");
  let appendType = "";

  switch (selectedType.value) {
    case "all":
      appendType = "all";
      break;
    case "movie":
      appendType = "movie";
      break;
    case "tv":
      appendType = "tv";
      break;
    case "person":
      appendType = "person";
      break;
    default:
      appendType = "all";
      break;
  }
  sessionStorage.setItem("type", appendType);
  showMovieByTypeTime(appendType, time);
}

function movieTime(selectedTime) {
  let type = sessionStorage.getItem("type");
  let appendTime = "";

  switch (selectedTime.value) {
    case "day":
      appendTime = "day";
      break;
    case "week":
      appendTime = "week";
      break;
    default:
      appendTime = "day";
      break;
  }
  sessionStorage.setItem("time", appendTime);
  showMovieByTypeTime(type, appendTime);
}

function showMovieByTypeTime(appendType, appendTime, page = 1) {
  let url = `${baseURL}trending/${appendType}/${appendTime}?api_key=${API_KEY}&include_adult=false&page=${page}`;

  $.ajax({
    url: url,
    method: "GET",

    success: function (trend) {
      let output = "";

      for (let i = 0; i < trend["results"].length; i++) {
        if (trend["results"][i]["media_type"] == "movie") {
          let title = trend["results"][i]["title"];
          let posterPath = trend["results"][i]["poster_path"];

          output += `
          <button class="detailsButton m-6" onclick="selectedMovie('${trend["results"][i]["id"]}')">
          <div class="movie relative w-min h-full overflow-hidden">
              <img class="image rounded-lg block min-w-[180px] max-h-[250px] text-md text-center shadow-xl" src=${imageURL + String(posterPath)} alt="No image found." loading="lazy">

              <div class="ratingFlex font-bold leading px-2">
                  <h4 class="title pt-2 font-black">${trend["results"][i]["title"]}</h4>
                  </div>
              <div class="absolute top-0 left-0 flex bg-black bg-opacity-60 rounded-tl-lg rounded-br-lg py-0.5">
                <span class="text-sm font-bold text-yellow-300 pt-0.5 px-2">★</span>
                  <span class="rating  text-white mr-3">${trend["results"][i]["vote_average"]}</span>
                  </div>
          </div>
          </button>
                    `;
        } else if (trend["results"][i]["media_type"] == "tv") {
          let name = trend["results"][i]["name"];
          let posterPath = trend["results"][i]["poster_path"];

          output += `
          <button class="detailsButton" onclick="selectedTV('${trend["results"][i]["id"]}')">
          <div class="movie relative m-6 mb-4 w-min h-full overflow-hidden">
              <img class="image rounded-lg block min-w-[180px] max-h-[250px] text-md text-center" src=${imageURL + String(posterPath)} alt="No image found." loading="lazy">

              <div class="ratingFlex font-bold leading px-2">
                  <h4 class="title">${name}</h4>
                  </div>
              <div class="absolute top-0 left-0 flex bg-black bg-opacity-60 rounded-tl-lg rounded-br-lg py-0.5">
                <span class="text-sm font-bold text-yellow-300 pt-0.5 px-2">★</span>
                  <span class="rating  text-white mr-3">${trend["results"][i]["vote_average"]}</span>
                  </div>
          </div>
          </button>
                    `;
        } else if (trend["results"][i]["media_type"] == "person") {
          let name = trend["results"][i]["name"];
          let profilePath = trend["results"][i]["profile_path"];

          output += `
          <button>
          <a href="https://www.google.com/search?q=${name}" target="_blank">
                       <div class="movie relative m-6 mb-4 w-min h-full overflow-hidden">
              <img class="image rounded-lg block min-w-[180px] max-h-[250px] text-md text-center" src=${imageURL + String(profilePath)} alt="No image found." loading="lazy">

              <div class="ratingFlex font-bold leading px-2">
                  <h4 class="title">${name}</h4>
                  </div>
                  </a>
                  </button>
                    `;
        }
        $(".showTrending").html(output);
      }
    },
  });
}

window.load = function () {
  sessionStorage.removeItem("category");

  showMovieByCategory("upcoming");
};

// set the target element that will be collapsed or expanded (eg. navbar menu)
const targetEl = document.getElementById("targetEl");

// optionally set a trigger element (eg. a button, hamburger icon)
const triggerEl = document.getElementById("triggerEl");

// optional options with default values and callback functions
const options = {
  triggerEl: triggerEl,
  onCollapse: () => {
    console.log("element has been collapsed");
  },
  onExpand: () => {
    console.log("element has been expanded");
  },
  onToggle: () => {
    console.log("element has been toggled");
  },
};

/*
 * targetEl: required
 * options: optional
 */
const collapse = new Collapse(targetEl, options);
