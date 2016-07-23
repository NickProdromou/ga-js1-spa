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




  firebase.database().ref('userState/' + state.userHash + "/").on('value',function(snapshot){
    var appState = snapshot.val()


    if (appState.detailView === false) {
      console.log("detailView is false")
      console.log(appState)
    }

    if (appState.detailView === true && appState.listView === false) {
      console.log("detail view is true")
      renderDetailView(appBody)
      console.log(appState)
    }

    if(appState.currentProgram === "Photoshop" &&  appState.listView === true) {
      console.log("Current app state is photoshop")
      renderKeyList(appBody,appState)
      console.log(appState)
    }


    if(appState.currentProgram === "illustrator") {
      console.log("current app state is illustrator")
      renderKeyList(appBody,appState)
      console.log(appState)
    }


  })



//event handlers

delegate('body','click','button', (event) => {
  var button = event.delegateTarget.id

  if (button === "Photoshop" || button === "illustrator"){
    console.log("this is the " + button + " button")
    userState.update({
      settings: state.data[button].settings,
      currentProgram: button,
      listView: true
    })
  }

  if(button === "show-details") {
    userState.update({
      detailView : true,
      listView : false
    })
  }

});

delegate('body','click','h1', (event)=>{
    if (event.delegateTarget.id === "home"){
      location.reload();
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

function renderDetailView(into) {
  into.innerHTML = `<section class="nested-details">
    <div class="wrapper">
      <div class="detail-container">
        <div class="detail-header">
          <div class="col">
            <button>prev</button>
          </div>
          <div class="col details">
            <h2>Command</h2>
            <span class="program">program</span>
            <span class="category">category</span>
          </div>
          <div class="col">
            <button class="right">next</button>
          </div>
        </div>
        <div class="key-info">
          <div class="key">
            <h4>Platform</h4>
            <span>key</span>
          </div>
          <div class="key">
            <h4>Platform</h4>
            <span>Key</span>
          </div>
        </div>
          <div class="comments-list">
            <h4>Comments</h4>
            <article class="comment">
              <div class="avatar">
                <img src="images/avatar.jpg" />
              </div>
              <div class="comment-content">
                <p class="username">username</p>
                <p>Comment</p>
              </div>
            </article>
            <article class="comment">
              <div class="avatar">
                <img src="images/avatar.jpg" />
              </div>
              <div class="comment-content">
                <p class="username">username</p>
                <p>Comment</p>
              </div>
            </article>
            <article class="comment">
              <div class="avatar">
                <img src="images/avatar.jpg" />
              </div>
              <div class="comment-content">
                <p class="username">username</p>
                <p>Comment</p>
              </div>
            </article>
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
  </section>`
}

function renderLoading(into) {
  into.innerHTML = `<div id="pop-up" class="loader"></div>`
}


function renderKeyList(into,state){
  into.innerHTML = `<section class ="nested-key-list">
    <div class="wrapper">
      <div class="programs inner-content">
      <h2>${state.currentProgram}</h2>
      <div class="filter-controls">
      ${state.settings.categories.map((item)=>{
      return `${renderFilters(item)}`
    }).join("")}
      </div>
        <div class="key-list">
          <article class="key-item" id="index">
            <div class="key-info">
              <div class="main-info">
                <h2>Command</h2>
                <p>Category</p>
                <button id ="show-details">See more</button>
              </div>
              <div class="keyboard-shortcuts">
                <div class="result">
                  <p>platform</p>
                    <div class="key">
                      <p>Hotkey</p>
                    </div>
                </div>
                <div class="result">
                  <p>platform</p>
                    <div class="key">
                      <p>Hotkey</p>
                    </div>
                </div>
              </div>
            </div>
                <div class="stats">
                  <div class="stats-container">
                    <p>likes 4</p> <p>comments 3</p>
                  </div>
                </div>
          </article>
      </div>
    </div>
  </section>
`
}

function renderFilters(item){
  return `<label><input type="checkbox" id="${item}" value="${item}"> ${item}</label>`
}

})()
