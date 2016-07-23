/**
 * Project 3: SPA
 * ====
 *
 * See the README.md for instructions
 */

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
  settings :{
  }
});

//store new user hash into a variable for easy reference
state.userHash = currentUser.key;


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

//check if new user created
  //if new user created, pull list of programs into local storage
    //render app container from data pulled in



//store programs into local database

var userState = firebase.database().ref('userState/' + state.userHash + "/")

firebase.database().ref('programs/').on('value',function(snapshot){
  state.data = snapshot.val()
  console.log(state.data)
})


  firebase.database().ref('userState/' + state.userHash + "/").on('value',function(snapshot){
    var appState = snapshot.val()
    state.appState = appState

    if (appState.detailView === false) {
      console.log("detailView is false")
      console.log(appState)
    }

    if (appState.detailView === true && appState.listView === false) {
      var index = appState.details.currentItemIndex
      renderDetailView(appBody,index,state.data,appState)
      if(appState.details.currentItemIndex === 0){
        var prevButton = document.querySelector("#prev")
        prevButton.style.color = "#555"
      }


      console.log(appState)
      console.log(state.data[state.appState.currentProgram].keyList.length)
    }

    if(appState.currentProgram === "Photoshop" &&  appState.listView === true) {
      console.log("Current app state is photoshop")
      renderKeyList(appBody,appState,state.data.Photoshop)
      console.log(appState)
    }

    if(appState.mac === false && appState.listView) {
      renderKeyList(appBody,appState,state.data[appState.currentProgram])
      renderFilteredList()
    }


    if(appState.currentProgram === "illustrator" &&  appState.listView === true) {
      console.log("current app state is illustrator")
      renderKeyList(appBody,appState,state.data.illustrator)
      console.log(appState)
    }



  })



//event handlers

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
    if(state.appState.details.currentItemIndex <= state.data[state.appState.currentProgram].keyList.length ){
      var nextNumber = state.appState.details.currentItemIndex +1
      userState.update({
        details: {
          currentItemIndex : nextNumber
        }
      })
    }
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

});

delegate('body','click','h1', (event)=>{
    if (event.delegateTarget.id === "home"){
      location.reload();
  }
})

delegate('body','change','input',(event) => {
  if(event.delegateTarget.id === "Mac") {
    userState.update({
      mac: false
    })

  }
})

delegate('body','click','span',(event)=>{
  if (event.delegateTarget.id === "return") {
    userState.update({
      detailView: false,
      listView: true
    })
  }
})



//render functions
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
              <h1 id="home"><span style="font-weight:100;">Logo</h1>
          </header>
          </div>
      </section>`
}

function renderFooter(){
  return `<section class="footer">
      <div class="wrapper">
        <footer>
            <p>Footer with credits and link to github &copy;2016</p>
        </footer>
      </div>
    </section>`
}



function renderIntro(){
  return `  <section class ="nested-page_intro">
      <div class="wrapper">
        <div class="intro inner-content">
          <h2>Intro header/welcome</h2>
          <p>Explanation of what this app is</p>
        </div>
      </div>
    </section>`
}

function renderPrograms(state){
  return `  <section class ="nested-program-list">
      <div class="wrapper">
        <div class="programs inner-content">
        <h2>Program list header</h2>
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
  into.innerHTML = `<section class="nested-details">
    <div class="wrapper">
    <span class="program" id="return">Return to ${user.currentProgram} list</span>
      <div class="detail-container">
        <div class="detail-header">
          <div class="col">
            <button id="prev">prev</button>
          </div>
          <div class="col details">
            <h2>${state[user.currentProgram].keyList[index].action}</h2>
            <span class="category">${state[user.currentProgram].keyList[index].category}</span>
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
            <h4>Comments</h4>
          ${renderComments()}
          </div>
            <div class="comment-box">
            <h3>Leave a comment</h3>
            <p>Tell us how you feel about this shortcut, or what you map it to in your workflow.</p>
            <div class="comment-form">
              <label>Name</label>
              <input type="textarea"/>
              <label>Comment</label>
              <textarea rows="4" cols="50">
              </textarea>
              <button>Submit</button>
            </div>
            </div>
      <div>
    </div>
  // </section>`
}

function renderComments(){
  return `<article class="comment">
        <div class="avatar">
          <img src="images/avatar.jpg" />
        </div>
        <div class="comment-content">
          <p class="username">username</p>
          <p>Comment</p>
        </div>
      </article>`
}

function renderLoading(into) {
  into.innerHTML = `<div id="pop-up" class="loader"></div>`
}


function renderKeyList(into,state,program){
  var list = `<section class ="nested-key-list">
    <div class="wrapper">
      <div class="programs inner-content">
      <h2>${state.currentProgram}</h2>
      <div class="filter-controls">
      ${state.settings.platforms.map((item)=>{
      return `${renderFilters(item)}`
    }).join("")}
      </div>
        <div class="key-list">
        ${program.keyList.map((item)=>{
          return `${renderKeyItems(item,state)}`
        }).join("")}
    </div>
  </div>
</section>`

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
        console.log("does this line log?")
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
          <p>likes ${item.votes}</p> <p>comments ${item.comments}</p>
        </div>
      </div>
</article>`

return list

}


function renderFilters(item){
  return `<label><input type="checkbox" checked id="${item}" value="${item}"> ${item}</label>`
}

})()
