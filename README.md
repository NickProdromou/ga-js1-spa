# Keyfficiently

Keyfficiently is a single page application, born from a love of keyboard shortcuts (of which I will henceforth refer to as "Hotkeys"). My idea is essentially a community of people who, like me, have a passion for keyboard shortcuts... They could browse a large variety of hotkeys for various programs, comment on the hotkeys perhaps talk about how they use it in their workflow... leave a vote... create favourites, maybe even build workflows for programs (in the future)... I have very big plans...

## The process

I started on paper... I started by mapping out the data, worked out what my keys my objects would contain, and the best way to store them. Because I had already worked with a JSON object containing hotkeys.. I had a rough idea of how to structure the data... but in this case there were many more keys... back to this later.

After I had worked out what I wanted to do, and the data I was working with, I drew some rough wireframes of screens / views and a typical user flow. I had pretty much worked out what the data I wanted to show was, and how to show it. Being from a design background, I naively had the idea that I would design and build the app.. Oh how wrong I was.

Once I had the views down, and the data mapped... I started to build by views in raw HTML and CSS, I also gave sass a go.. (using SCSS syntax) to streamline styling. I was very much going for speed not best practice, if you look at my styles .scss file, it looks like I've just thrown nested styles on the page, I used flexbox with zero browser prefixing (again, for speed). I still spent too long on the design.

Once I was happy with how the views looked, I started building my JSON file, I started with a single program (Photoshop) The outer object looked like this :

```javascript
		 {
  "programs" : {
    "Photoshop" : {
      "settings" :{
        "mac":true,
        "win":true,
        "categories":["selecting","viewing","layers","type","painting","pen tool and paths","panels","misc good stuff","tools"]
      },
```

I planned on using the settings from the object to control the user state (if a program didn't have keys for mac, then mac would be false by default. I also had an array of categories to potentially filter over...

A typical hotkey inside of the object looked like this:

```javascript

 "keyList" : [
         {
           "category" : "Selecting",
           "action" : "Draw marquee selection from center",
           "shortcut" : "Option–drag selection",
           "comments" : [],
           "votes" : "0"
         },{

```

I had added all the photoshop keys, when I realised that I only had the mac keys here, so my objects morphed into something more like this:

```javascript

"keyList" : [
        {
          "category" : "Selecting",
          "action" : "Draw marquee selection from center",
          "macKey" : "Option–drag selection",
          "winKey" : "Alt-Marquee",
          "comments" : [],
          "votes" : "0"
        }

```

Much better, the languages makes sense, and now there was a key for both Mac and Windows. (yes I know that the votes are a string, I wish I knew at this point)

I don't exactly remember the order, but going from my commits it looks like once I had the data mapped, I had to actually start working with firebase, it was a bit of a trial by _fire_.

In the end I got it working exactly how I wanted:

- User opens app
- A new state is created for that user
- The user interacts with the app
- user interaction sends messages to the uniquekey for the current user inside the userState
- A controller watches for changes to the user state and renders the views conditionally

By this point, I had a few views working, but I realised that if I wanted to make the detail view work, I needed to go back to my JSON file and add an index for every.single.item key... so I did exactly that, my final key structure looked like this:

```javascript

"keyList" : [
        {
          "index" : 0,
          "category" : "Selecting",
          "action" : "Draw marquee selection from center",
          "macKey" : "Option–drag selection",
          "winKey" : "Alt-Marquee",
          "comments" : [],
          "votes" : "0"
        },{
          "index" : 1,
          "category" : "Selecting",
          "action" : "Add to a selection",
          "macKey" : "Shift click",
          "winKey" : "Shift click",
          "comments" : [],
          "votes" : "0"
        },{

```
etc...

(YES, votes are still a string)

Once I had the index's for each key, things got very fun, I could pass the current index to the userState.. which made it so the detailed view worked, the same logic was applied to making commenting and voting work.

The code needs a lot of refactoring, but I have a really good idea of how I can make this work at a production scale
