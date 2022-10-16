const API_KEY = "65d5ca8e4353e4c1561fc76bf319cfb7";
var movie1;
var movie2;
//var randMovie = (Math.random()*99997) + 2;

var movieRatings = {};
var unwatchedIDs = {};

// get list of movies (preferably done once a day on server but alas)
var codes = [];
for (let i = 1; i <= 5; i++) { //temporarily 5, should be 100 but voting would take forever for 1 person
  let page = i;
  let movieListURL = "https://api.themoviedb.org/3/movie/top_rated?api_key="+ API_KEY+ "&language=en-US&page=" + page;
  fetch(movieListURL)
    .then(function(response) {
      // make sure the request was successful
      if (response.status != 200) {
        return {
          text: "Error calling the API service: " + response.statusText
        }
      }
      return response.json();
    }).then(function(json) {
      // update DOM with response
      for (let movie of json.results) {
        if(movie.adult != true) {
          codes.push(movie.id);
        }
      }
    });
}
console.log(codes);

function getMovie(num) {
    let randMovieID
    do {
      randMovieID = codes[Math.floor(Math.random()*codes.length)];
    } while (unwatchedIDs[randMovieID] != null);
    
    let movieURL = "https://api.themoviedb.org/3/movie/" + randMovieID + "?api_key="+ API_KEY+ "&language=en-US";
    // call API
    fetch(movieURL)
      .then(function(response) {
        // make sure the request was successful
        if (response.status != 200) {
          return {
            text: "Error calling the API service: " + response.statusText
          }
        }
        return response.json();
      }).then(function(json) {
        // update DOM with response
        if (num === 1) {
          movie1 = json;
          updatePoster1();
        }
        else if (num === 2) {
          movie2 = json;
          updatePoster2();
        }
      });
}

//new matchup
function onClick(e) {
  e.preventDefault();
  
  newMatchup();
}

function newMatchup() {
  getMovie(1);
  getMovie(2);
  
  updateMargins();
}

function updatePoster1() {
  let posterLink = "https://image.tmdb.org/t/p/w200/" + movie1.poster_path;
  document.getElementById('poster1').src = posterLink;
  document.getElementById('movieTitle1').innerHTML = movie1.title; // TODO: add year and original_title
}

function updatePoster2() {
  let posterLink = "https://image.tmdb.org/t/p/w200/" + movie2.poster_path;
  document.getElementById('poster2').src = posterLink;
  document.getElementById('movieTitle2').innerHTML = movie2.title; 
}

function updateMargins() {
  let movies = document.getElementById('movies');
  movies.style.marginTop = "20px";
  movies.style.marginBottom = "20px";
  movies.style.display = 'grid';
}

function oneSelected(e) {
    e.preventDefault();
    movieSelected(1);
}

function twoSelected(e) {
    e.preventDefault();
    movieSelected(2);
}

function movieSelected(number) {
  let movie;
  let loser;

  if (number === 1) {
    movie = movie1;
    loser = movie2;
  }
  else if (number === 2) {
    movie = movie2;
    loser = movie1;
  }
    
  var values;
  if (movieRatings[movie.id] != null) {
    values = movieRatings[movie.id];
    values.value += 1;
    values.votes += 1;
  }
  else {
    values = {value: 1, votes: 1};
    values.title = movie.title;
  }
  movieRatings[movie.id] = values;
  
  if (movieRatings[loser.id] != null) {
    values = movieRatings[loser.id];
    values.value -= 1;
    values.votes += 1;
  }
  else {
    values = {value: 0, votes: 1};
    values.title = loser.title;
  }
  movieRatings[loser.id] = values;
  
  //console.log(JSON.stringify(toParse));
  console.log(movieRatings);
  updateRatings();
  newMatchup();
}

function sortRatings(obj) {
    var sortedEntries = Object.entries(obj).sort(function(a,b){return b[1].value-a[1].value});
    return sortedEntries;
}

function updateRatings() {
  document.getElementById("ratings").innerHTML = "";
  document.getElementById("ratingTitle").style.marginBottom = "0px";
  
  let sortedRatings = sortRatings(movieRatings);
  console.log(sortedRatings);
  //let end = Math.min(10, sortedRatings.length);
  let end = sortedRatings.length;
  for (let i = 0; i < end; i++) {
      let ratingToAdd = '<p>' + (i+1) + ': ' + sortedRatings[i][1].title + '</p>';
      document.getElementById("ratings").innerHTML += ratingToAdd;
  }
}

function skipMovie1(e) {
  e.preventDefault();
  unwatchedIDs[movie1.id] = 0;
  getMovie(1);
}

function skipMovie2(e) {
  e.preventDefault();
  unwatchedIDs[movie2.id] = 0;
  getMovie(2);
}

document.getElementById('new-matchup').addEventListener('click', onClick);
document.getElementById('movie1').addEventListener('click', oneSelected);
document.getElementById('movie2').addEventListener('click', twoSelected);
document.getElementById('skip1').addEventListener('click', skipMovie1);
document.getElementById('skip2').addEventListener('click', skipMovie2);
