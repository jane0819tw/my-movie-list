(function () {
  const dataPanel = document.getElementById('data-panel')
  const BASE_URL = 'https://movie-list.alphacamp.io/'
  const POSTER_URL = BASE_URL + 'posters/'
  const INEDX_URL = BASE_URL + 'api/v1/movies/'
  const favorite_data = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  favorite_data.forEach(movie => write(movie))

  function write(movie) {
    dataPanel.innerHTML += `
    <div class="movie-box col-12 col-md-6 col-lg-4">
        <img src="${POSTER_URL}${movie.image}" alt="" class="img-fluid">
        
        <div data-id="${movie.id}" class="darken" data-toggle="modal" data-target="#detailModal">
        ${movie.newTitle ? movie.newTitle : movie.title}
        </div>
        <button class="btn btn-danger btn-remove-favorite" data-id="${movie.id}">x</button>
        
      </div>`
  }
  function showDetail(args) {
    console.log(args)
    document.getElementById('image').src = POSTER_URL + args.image
    document.getElementById('detailModalLabel').innerHTML =
      `<i class="fa fa-forward" aria-hidden="true"></i>${args.title}`

    release_date.innerHTML = `<i class="fa fa-calendar" aria-hidden="true"></i> ${args.release_date}`
    director.innerText = args.director
    description.innerText = args.description
    castList.innerHTML = getCasts(args.cast)
  }
  function getCasts(castList) {
    let content = ''
    castList.forEach(cast => content += `
    <li class="list-group-item row d-flex">
      <div class="col-6">${cast.character}</div>
      <div class="col-6"><b>${cast.name}</b></div>
    </li>`)
    return content
  }
  function modalInit() {
    changeBtn.innerText = 'cast'
    director.classList.add('none')
    release_date.classList.remove('none')
    description.classList.remove('none')
    castList.classList.add('none')
  }

  function removeFavorite(id) {
    // 利用findIndex找到陣列的第幾個
    let index = favorite_data.findIndex(movie => movie.id === id)
    console.log(index)
    let movie = favorite_data.find(movie => movie.id === id)
    let i = favorite_data.indexOf(movie)
    console.log(i)
    // 不存在就直接回傳
    if (index === -1) return
    favorite_data.splice(index, 1)
    // 更新localStorage資料
    localStorage.setItem('favoriteMovies', JSON.stringify(favorite_data))
    // write again
    dataPanel.innerHTML = ''
    favorite_data.forEach(movie => write(movie))
  }

  dataPanel.addEventListener('click', evt => {
    if (evt.target.matches('.darken')) {
      modalInit()
      console.log(evt.target.dataset.id)
      let id = evt.target.dataset.id
      axios.get(`${INEDX_URL}${id}`).then(res => {
        showDetail(res.data.results)
      }).catch(e => console.log(e))
    }
    if (evt.target.matches('.btn-remove-favorite')) {
      console.log(evt.target.dataset.id)
      removeFavorite(parseInt(evt.target.dataset.id))

    }
  })
  changeBtn.addEventListener('click', evt => {
    director.classList.toggle('none')
    release_date.classList.toggle('none')
    description.classList.toggle('none')
    castList.classList.toggle('none')
    evt.target.innerText = director.matches('.none') ? 'cast' : 'detail'
  })
})()