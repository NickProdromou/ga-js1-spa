(function() {

//Create local state object to store and transfer data
var state = {}



//create variables for primary render targets
var appContainer = document.querySelector("#app")
var appBody



//show loader as first screen
renderLoading(appContainer)


//create new userHash for new user
var currentUser = firebase.database().ref('userState/').push({
  detailView: false,
  listView: false,
  settings :{},
  details :{
    currentItemIndex: 0
  }
});

//store new user hash into a variable for easy reference
state.userHash = currentUser.key;open




LoadInitialState()


  firebase.database().ref('userState/' + state.userHash + "/").on('value',function(snapshot){
    var appState = snapshot.val()
    state.appState = appState

    if (appState.detailView === true && appState.listView === false) {
      var index = appState.details.currentItemIndex
      renderDetailView(appBody,index,state.data,appState)
      if(appState.details.currentItemIndex === 0){
        var prevButton = document.querySelector("#prev")
        prevButton.style.color = "#fff"
        prevButton.style.backgroundColor = "#fff"
      }
      var programLength = state.data[state.appState.currentProgram].keyList.length
      if(appState.details.currentItemIndex === programLength-1) {
        var prevButton = document.querySelector("#next")
        prevButton.style.display = "none"
      }
    }

    if(appState.currentProgram === "Photoshop" &&  appState.listView === true) {
      console.log("Current app state is photoshop")
      renderKeyList(appBody,appState,state.data.Photoshop)
      console.log(appState)
    }

    if(appState.currentProgram === "illustrator" &&  appState.listView === true) {
      console.log("current app state is illustrator")

      renderKeyList(appBody,appState,state.data.illustrator)
      console.log(appState)
    }


  if(appState.checkForComments === true && appState.pendingComment !== undefined) {
    var userCurrentIndex = appState.details.currentItemIndex
    var program = appState.currentProgram
    var pendingComment = appState.pendingComment
    var name = pendingComment.name
    var body = pendingComment.body

    firebase.database().ref('programs/' + program + '/keyList/' + userCurrentIndex + "/comments").push({
        comment: {
          name,
          body
        }
  })
  firebase.database().ref('userState/' + state.userHash + "/").update({
    checkForComments:false,
    pendingComment: "waiting"
  })

}



if(appState.checkForRating === true) {
    var userCurrentIndex = appState.details.currentItemIndex
    var program = appState.currentProgram
    var pendingComment = appState.pendingComment
    var  votes = parseInt(state.data[appState.currentProgram].keyList[appState.details.currentItemIndex].votes)
    console.log(votes)
    var votePlus1 = votes +1

    firebase.database().ref('programs/' + program + '/keyList/' + userCurrentIndex + "/").update({
      votes: votePlus1
  })
  firebase.database().ref('userState/' + state.userHash + "/").update({
    checkForRating: "waiting",
  })
  }


if (appState.checkForRating === "waiting"){
  renderLoading(appBody)

  firebase.database().ref('programs/').on('value',function(snapshot){
      state.data = snapshot.val()
      console.log(state.data)
      var index = appState.details.currentItemIndex
      renderDetailView(appBody,index,state.data,appState)
      if(appState.details.currentItemIndex === 0){
        var prevButton = document.querySelector("#prev")
        prevButton.style.display = "none"
      }
      var programLength = state.data[appState.currentProgram].keyList.length
      if(appState.details.currentItemIndex === programLength-1) {
        var prevButton = document.querySelector("#next")
        prevButton.style.display = "none"
      }
      firebase.database().ref('userState/' + state.userHash + "/").update({
        checkForRating: null,
      })
    })
}



if(appState.pendingComment === "waiting") {

  renderLoading(appBody)

  firebase.database().ref('programs/').on('value',function(snapshot){
      state.data = snapshot.val()
      console.log(state.data)
      var index = appState.details.currentItemIndex
      renderDetailView(appBody,index,state.data,appState)
      if(appState.details.currentItemIndex === 0){
        var prevButton = document.querySelector("#prev")
        prevButton.style.display = "none"
      }
      var programLength = state.data[state.appState.currentProgram].keyList.length
      if(appState.details.currentItemIndex === programLength-1) {
        var prevButton = document.querySelector("#next")
        prevButton.style.display = "none"
      }
    })
    firebase.database().ref('userState/' + state.userHash + "/").update({
      pendingComment: "completed",
    })

  }



  if (appState.deleteComment === true ) {


    var userCurrentIndex = appState.details.currentItemIndex
    var program = appState.currentProgram
    var removeComment = appState.commentID

    firebase.database().ref('programs/' + program + '/keyList/' + userCurrentIndex + "/comments/" + removeComment).remove()


    firebase.database().ref('userState/' + state.userHash).update({
      deleteComment: "waiting",
    })
}

if (appState.deleteComment === "waiting") {
  renderLoading(appBody)
  firebase.database().ref('programs/').on('value',function(snapshot){
      state.data = snapshot.val()
      console.log(state.data)
      var index = appState.details.currentItemIndex
      renderDetailView(appBody,index,state.data,appState)
      if(appState.details.currentItemIndex === 0){
        var prevButton = document.querySelector("#prev")
        prevButton.style.display = "none"
      }
      var programLength = state.data[state.appState.currentProgram].keyList.length
      if(appState.details.currentItemIndex === programLength-1) {
        var prevButton = document.querySelector("#next")
        prevButton.style.display = "none"
      }
    })
    firebase.database().ref('userState/' + state.userHash + "/").update({
      deleteComment: null,
      commentID: null
    })

}


if (appState.newsFeed === true){
  console.log("is newsfeed rendering?")
  fetchReddit(appState)

}

})
















//event handlers


var userState = firebase.database().ref('userState/' + state.userHash + "/")

delegate('body','click','button', (event) => {
  var buttonId = event.delegateTarget.id
  var buttonClass = event.delegateTarget.classList[0]

  if (buttonId === "Photoshop" || buttonId === "illustrator"){
    userState.update({
      settings: state.data[buttonId].settings,
      currentProgram: buttonId,
      listView: true
    })
  }

  if(buttonId === "prev") {
    if(state.appState.details.currentItemIndex !== 0) {
      var prevNumber = state.appState.details.currentItemIndex -1
      userState.update({
        details: {
          currentItemIndex : prevNumber
        }
      })
    }
  }


  if(buttonId === "next") {

    var programLength = state.data[state.appState.currentProgram].keyList.length

    if(state.appState.details.currentItemIndex !== programLength -1 ){
      var nextNumber = state.appState.details.currentItemIndex +1
      userState.update({
        details: {
          currentItemIndex : nextNumber
        }
      })
    }
  }

  if (buttonId === "rate") {
    console.log(event.delegateTarget)
    userState.update({
      checkForRating: true
    })
  }


  if(buttonClass === "show-details") {
    userState.update({
      detailView : true,
      listView : false,
      details : {
        currentItemIndex : parseInt(buttonId),
      }
    })
  }

  if(buttonId === "submit-comment") {
    var commentName = document.querySelector("#comment-name").value
    var commentBody = document.querySelector("#comment-body").value

    if (commentName.length !== 0 && commentBody.length !== 0) {
      var newComment = {}
      newComment.name = commentName
      newComment.body = commentBody
      userState.update({
        checkForComments: true,
        pendingComment : newComment
      })
    } else {
      alert("Comment field cannot be empty")
    }
  }

  if (buttonId === "delete") {
    var commentID = event.delegateTarget.getAttribute('data-comment')
    userState.update({
      deleteComment: true,
      commentID: commentID
    })
  }

  if (buttonId === "feedView") {
    userState.update({
      newsFeed : true
    })
  }

});


delegate('body','click','h1', (event)=>{
    if (event.delegateTarget.id === "home"){
      userState.update({
        detailView: false,
        listView: false,
        newsFeed: false
      })
      LoadInitialState()
    }
})

delegate('body','change','input',(event) => {
  if(event.delegateTarget.id === "Mac" && event.delegateTarget.checked) {
    console.log("you clicked the mac input")
    userState.update({
      mac: false
    })
  } else {
    userState.update({
      mac: true
    })
  }
})

delegate('body','click','span',(event)=>{
  if (event.delegateTarget.id === "return" ){
    userState.update({
      detailView: false,
      listView: true,
      newsFeed: false
    })
  }

  if (event.delegateTarget.id === "return-home") {
    userState.update({
      detailView: false,
      listView: false,
    })
    LoadInitialState()
  }

})



//render functions

function logSnapshot(snap){
  console.log(snap.val())
}

function LoadInitialState(){
  if (currentUser.key) {
    firebase.database().ref('programs/').once('value')
      .then((dataSnapshot)=>{
        state.data = dataSnapshot.val()
        var programsArray = Object.keys(dataSnapshot.val())
        state.programs = programsArray
      }).then(()=>{
        renderAppContainer(appContainer)
        appBody = document.querySelector('.main-body-element')
      })
  }
}


function renderAppContainer(into){
  into.innerHTML = `
      ${renderHeader()}
      <section class="main-body-element">
        ${renderIntro()}
        ${renderPrograms(state)}
      </section>
      ${renderFooter()}
    `
}


function renderHeader(){
  return `<section class="header">
        <div class="wrapper">
          <header>
              <h1 id="home"><span style="font-weight:100;">keyfficient.ly</h1>
          </header>
          </div>
      </section>`
}

function renderFooter(){
  return `<section class="footer">
      <div class="wrapper">
        <footer>
            <p>Designed and built with love (and firebase) by <a href="https://github.com/NickProdromou">Nick Prodromou</a> &copy;2016</p>
        </footer>
      </div>
    </section>`
}



function renderIntro(){
  return `  <section class ="nested-page_intro">
      <div class="wrapper">
        <div class="intro inner-content">
          <h2>Welcome</h2>
          <p>Welcome to keyfficient.ly. Where we believe that there's always a faster, more efficient way to do perform your tasks.</p>
        </div>
      </div>
    </section>`
}

function renderPrograms(state){
  return `  <section class ="nested-program-list">
      <div class="wrapper">
        <div class="programs inner-content">
        <h2>Select a program</h2>
          <div class="program-grid">
          ${state.programs.map((item)=>{
          return `${renderProgramList(item)}`
        }).join("")}
          </div>
        </div>
      </div>
    </section>`
}

function renderProgramList(item){
  return `<div>
    <h3>${item}</h2>
    <button id="${item}">View keys</button>
  </div>`
}

function renderDetailView(into,index,state,user) {
  var detail = `<section class="nested-details">
    <div class="wrapper">
    <span class="program" id="return">Return to ${user.currentProgram} list</span>
      <div class="detail-container">
        <div class="detail-header">
          <div class="col">
            <button id="prev">prev</button>
          </div>
          <div class="col details">

            <h2>${state[user.currentProgram].keyList[index].action}</h2>
            <span class="category">category: ${state[user.currentProgram].keyList[index].category}</span>
            <br>
            <h5>Votes ${state[user.currentProgram].keyList[index].votes}</h5>
            <button id="rate">+1 this key</button>
          </div>
          <div class="col">
            <button id="next" class="right">next</button>
          </div>
        </div>
        <div class="key-info">
          <div class="key">
            <h4>Mac</h4>
            <span>${state[user.currentProgram].keyList[index].macKey}</span>
          </div>
          <div class="key">
            <h4>Windows</h4>
            <span>${state[user.currentProgram].keyList[index].winKey}</span>
          </div>
        </div>

          <div class="comments-list">

            <h4>Comments</h4>`

            if (state[user.currentProgram].keyList[index].comments === undefined) {
              detail += `<p>Sorry, nobody has commented yet.</p>`
            } else {
              var arrayComments = Object.keys(state[user.currentProgram].keyList[index].comments)
                arrayComments.forEach((i)=>{
                  detail += `${renderComments(state[user.currentProgram].keyList[index].comments[i],i)}`
                })
            }

          detail += `
          </div>
            <div class="comment-box">
            <h3>Leave a comment</h3>
            <p>Tell us how you feel about this shortcut, or what you map it to in your workflow.</p>
            <div class="comment-form">
              <label>Name</label>
              <input type="textarea" id="comment-name"/>
              <label>Comment</label>
              <textarea rows="4" cols="50" id="comment-body">
              </textarea>
              <button id="submit-comment">Submit</button>
            </div>
            </div>
        <div>
      </div>
    </section>`
  into.innerHTML = detail
}

function renderComments(item,index){
  return `<article class="comment">
        <div class="avatar">
          <img src="images/avatar.jpg" />
        </div>
        <div class="comment-content">
          <p class="username">${item.comment.name}</p>
          <p>${item.comment.body}</p>
          <button id="delete" data-comment="${index}">X</button>
        </div>
      </article>`
}

function renderLoading(into) {
  into.innerHTML = `<div id="pop-up" class="loader"></div>`
}


function renderKeyList(into,state,program,articleData){
  var list = `<section class ="nested-key-list">
    <div class="wrapper">
      <div class="programs inner-content">
      <h2>${state.currentProgram}</h2>
      <div class="nav">
      <span class="program" id="return-home">Return home</span>
      <button id="feedView">See reddit feed</a>
      </div>

        <div class="key-list">
        ${program.keyList.map((item)=>{
          return `${renderKeyItems(item,state)}`
        }).join("")}
    </div>
  </div>
  </section>
`

into.innerHTML = list
}


function renderKeyItems(item,state){
  var list =`<article class="key-item" id="${item.index}">
    <div class="key-info">
      <div class="main-info">
        <h2>${item.action}</h2>
        <p>${item.category}</p>
        <button class="show-details" id="${item.index}">See more</button>
      </div>
      <div class="keyboard-shortcuts">`
      if(state.settings.mac === true){
        list += `
        <div class="result">
          <p>Mac</p>
            <div class="key">
              <p>${item.macKey}</p>
            </div>
        </div>`
      }
      if(state.settings.win === true){
        list += `
        <div class="result">
          <p>Windows</p>
            <div class="key">
              <p>${item.winKey}</p>
            </div>
        </div>`
      }
      list += `
    </div>
  </div>
      <div class="stats">
        <div class="stats-container">
          <p>votes ${item.votes}</p>`
          if( item.comments !== undefined) {
              var arrayOfComments = Object.keys(item.comments)
                list += `<p>comments ${arrayOfComments.length}</p>`
          } else {
            list += `<p>comments 0</p>`
          }
          list+= `</div>
      </div>
</article>`

return list

}

// function renderFilters(item){
//   return `<label><input type="checkbox" checked id="${item}" value="${item}"> ${item}</label>`
// }

var fetchReddit = (appState) =>{
  var fetchUrl = ""
  if(appState.currentProgram === "Photoshop") {
    fetchUrl = "https://www.reddit.com/r/photoshop/top.json"
  } else if (appState.currentProgram === "illustrator") {
    fetchUrl = "https://www.reddit.com/r/AdobeIllustrator/top.json"
  }
renderLoading(appBody)
    fetch(fetchUrl.toString())
      .then((response,err)=> {
        return response.json()
        .then((responseAsJson)=>{

          state.articleFeed = []
          var convertArray = Object.keys(responseAsJson.data.children)
          var itemIndex = 0;
          convertArray.forEach(function(key){
            var articleObject = {}
            articleObject.index = itemIndex;
            articleObject.link = "http://reddit.com" + responseAsJson.data.children[key].data.permalink;
            articleObject.image = responseAsJson.data.children[key].data.url;
            console.log(articleObject.image)
            articleObject.rating = responseAsJson.data.children[key].data.score;
            articleObject.category = responseAsJson.data.children[key].data.subreddit;
            articleObject.name = responseAsJson.data.children[key].data.title;
            articleObject.snippet = responseAsJson.data.children[key].data.subreddit;
            state.articleFeed.push(articleObject)
            itemIndex ++;
          })
            renderNewsFeed(appBody,appState,state.articleFeed)
          console.log(state.articleFeed)
        })
      }).catch((err)=>{
        console.log(err);
      })
}


function renderNewsFeed(into,state,articleData){
  var list = `<section class ="nested-article-list">
    <div class="wrapper">
      <div class="programs inner-content">
      <h2>Top posts from ${state.currentProgram} on reddit</h2>
      <div class="nav">
      <span class="program" id="return">Return to ${state.currentProgram} list</span>
      </div>
        ${renderArticleFeed(articleData)}
  </div>
  </section>`

into.innerHTML = list
}



function renderArticles(item){
  console.log(item.image)
  return `<article class="article">
    <section class="featured-image">
      <img src="${item.image}" onerror="this.src='https://worldvectorlogo.com/logos/reddit-alien.svg'" alt="" />
    </section>
    <section class="article-content">
      <h3>${item.name}</h3>
      <a href="${item.link}" target="_blank">read on Reddit</a>
    </section>
    <section class="impressions">
      ${item.rating} total impressions
    </section>

  </article>`
}

function renderArticleFeed(data) {
  var articleFeed = `<section id="Articles">
    ${state.articleFeed.map((item)=>{
    return `${renderArticles(item)}`
  }).join("")}
    </section>`
    return articleFeed
}


})()
