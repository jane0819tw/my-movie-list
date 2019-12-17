// Immediately Invoked Functions Expressions 立即調用函式表達式 讓函式被宣告後自動執行
(function () {
  // write code here
  const BASE_URL = 'https://movie-list.alphacamp.io/'
  const INEDX_URL = BASE_URL + 'api/v1/movies/'
  const POSTER_URL = BASE_URL + 'posters/'

  let data = []
  let init_data = []
  const dataPanel = document.getElementById('data-panel')
  const searchPanel = document.getElementById('search-panel')
  const changeBtn = document.getElementById('changeBtn')
  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 6
  const MAX_PAGE = 5

  const director = document.getElementById('director')
  const release_date = document.getElementById('release_date')
  const description = document.getElementById('description')
  const castList = document.getElementById('castList')
  // toturial 
  const searchForm = document.getElementById('search-form')
  const searchInput = document.getElementById('search-input')


  axios.get(INEDX_URL).then(res => {
    // ... 表示將裡面的東西一個一個拿出來來執行
    data.push(...res.data.results)
    getPageData(1, data)

    // 先存起來
    init_data = [...data]
    // const不能用 concat
    console.log(new Date(data[0].release_date))
  }).catch(e => console.log(e))

  function getTotalPage(data, pageNum) {
    let total_page = Math.ceil(data.length / ITEM_PER_PAGE)
    let page_item_content = ''
    let halfNum = parseInt(MAX_PAGE / 2)
    // 想要顯示讓目前頁數在中間 但還有當在12 或倒數12的時候(以顯示五個頁數總共10頁為例子)也要顯示
    // 9 10 例外
    let minPage = (pageNum + halfNum) > total_page ? (total_page - MAX_PAGE + 1) : (pageNum - halfNum)
    // 1 2 例外
    let maxPage = (pageNum + halfNum) < MAX_PAGE ? MAX_PAGE : (pageNum + halfNum)
    for (let i = 1; i <= total_page; i++) {
      if ((i <= maxPage) && (i >= minPage)) {
        // 判斷是否為目前這頁 加上active
        page_item_content += `<li class="page-item ${i === pageNum ? 'active' : ''}">
        <a class="page-link" data-page=${i} href="#">${i}</a>
      </li>`
      }

    }
    // 如果分業太多 加上上下頁
    if (total_page > MAX_PAGE) {
      // 第一頁的話前一夜不用顯示
      let prevPage =
        pageNum === 1 ? '' :
          `<li class="page-item"><a class="page-link" href="#" data-page=${pageNum - 1}>Previous</a></li>`
      page_item_content = prevPage + page_item_content

      // 最後一頁的話下一夜不用顯示
      let nextPage =
        pageNum === total_page ? '' : `
      <li class="page-item"><a class="page-link" href="#" data-page=${pageNum + 1}>Next</a></li>`
      page_item_content += nextPage
    }
    pagination.innerHTML = page_item_content




  }
  function write(data) {
    dataPanel.innerHTML = ''
    data.forEach((movie) => {
      dataPanel.innerHTML += `
    <div class="movie-box col-12 col-md-6 col-lg-4">
        <img src="${POSTER_URL}${movie.image}" alt="" class="img-fluid">
        
        <div data-id="${movie.id}" class="darken" data-toggle="modal" data-target="#detailModal">
        ${movie.newTitle ? movie.newTitle : movie.title}
        </div>
        <button class="btn btn-info btn-add-favorite" data-id="${movie.id}">+</button>
        
      </div>`
    })

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
  function addFavorite(id) {
    // 利用local storage儲存
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = init_data.find(movie => movie.id == id)
    console.log(movie)
    if (list.some(movie => movie.id === id)) {
      console.log('this movie already add into localStorage')
    } else {
      console.log('add first time')
      list.push(movie)
    }
    //由於localStorage裡面放的內容都是string,不是物件，所以需要透過JSON.stringify(list) 以及 JSON.parse()來轉換
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }
  function getPageData(pageNum, data) {
    let start = (pageNum - 1) * ITEM_PER_PAGE
    let pagedata = data.slice(start, start + ITEM_PER_PAGE)
    write(pagedata)
    getTotalPage(data, pageNum)
  }

  pagination.addEventListener('click', evt => {
    if (evt.target.tagName === 'A') {
      // pagination.querySelectorAll('li').forEach(page => {
      //   console.log(page)
      //   page.classList.remove('active')
      // })
      getPageData(Number(evt.target.dataset.page), data)
    }
  })
  dataPanel.addEventListener('click', evt => {
    if (evt.target.matches('.darken')) {
      modalInit()
      console.log(evt.target.dataset.id)
      let id = evt.target.dataset.id
      axios.get(`${INEDX_URL}${id}`).then(res => {
        showDetail(res.data.results)
      }).catch(e => console.log(e))
    }
    if (evt.target.matches('.btn-add-favorite')) {
      console.log(evt.target.dataset.id)
      addFavorite(parseInt(evt.target.dataset.id))

    }
  })

  changeBtn.addEventListener('click', evt => {
    director.classList.toggle('none')
    release_date.classList.toggle('none')
    description.classList.toggle('none')
    castList.classList.toggle('none')
    evt.target.innerText = director.matches('.none') ? 'cast' : 'detail'
  })

  searchPanel.addEventListener('click', evt => {
    if (evt.target.id === 'sortBtn') {
      // 如果結果沒有東西 data重置
      if (dataPanel.children.length === 0) {
        data = [...init_data]
      }
      let s = document.getElementById('select').value
      if (s) {
        if (s === 'early') {
          // 重新排序
          data.sort((a, b) => {
            // 由小到大
            return new Date(a.release_date) > new Date(b.release_date) ? 1 : -1
          })

          getPageData(1, data)
        } else {
          // 重新排序
          data.sort((a, b) => {
            // 由大到小
            return new Date(b.release_date) > new Date(a.release_date) ? 1 : -1
          })

          getPageData(1, data)
        }
      }

    }
    if (evt.target.id === 'sortTextBtn') {
      // 先恢復原狀
      data = [...init_data]
      let s = document.getElementById('textSearch').value.trim().toLowerCase()
      let replaceRegExp = new RegExp(s, 'g')

      data = data.filter(movie => movie.title.toLowerCase().indexOf(s) != -1)

      data.forEach(movie => {
        let text = movie.title
        let textL = text.toLowerCase()
        movie.newTitle = textL.replace(replaceRegExp, `<span class="special">${s}</span>`)
      })
      getPageData(1, data)
    }
  })

  // keyword search
  // 當form接收到提交的時候
  searchForm.addEventListener('submit', evt => {
    evt.preventDefault()
    console.log('click')
    let regex = new RegExp(searchInput.value, 'i')
    data = [...init_data]
    data = data.filter(movie => movie.title.match(regex))
    getPageData(1, data)
  })
})()

