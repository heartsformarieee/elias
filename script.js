// ==========================================
// ELIAS 1.3 - AI CHAT
// ==========================================


// ---------------- ELEMENTS ----------------

const typingIndicator =
  document.getElementById(
    "typingIndicator"
  );

const bubble =
  document.getElementById("speechBubble");

const affectionText =
  document.getElementById("affection");

const moodText =
  document.getElementById("moodText");

const statusText =
  document.getElementById("status");

const character =
  document.getElementById("character");

const eliasSprite =
  document.getElementById("eliasSprite");

const mori =
  document.getElementById("mori");

const pokeButton =
  document.getElementById("pokeButton");

const moriButton =
  document.getElementById("moriButton");

const chatForm =
  document.getElementById("chatForm");

const chatInput =
  document.getElementById("chatInput");

const sendButton =
  document.getElementById("sendButton");

const chatHistory =
  document.getElementById("chatHistory");


// ==========================================
// SPRITES
// ==========================================

const sprites = {

  calm:
    "https://i.postimg.cc/bD4fMZMM/elias-calm.png",

  happy:
    "https://i.postimg.cc/9RsHSDSZ/elias-happy.png",

  annoyed:
    "https://i.postimg.cc/HcF1KrKb/elias-annoyed.png",

  sleepy:
    "https://i.postimg.cc/1nb1T8Tj/elias-sleepy.png",

  affectionate:
    "https://i.postimg.cc/vgCwj4jn/elias-affectionate.png",

  mischievous:
    "https://i.postimg.cc/mzKWqPqX/elias-mischievous.png",

  jealous:
    "https://i.postimg.cc/2b1f2QHL/elias-jealous.png"

};


// preload sprites

Object.values(sprites).forEach(function(source) {

  const image =
    new Image();

  image.src =
    source;

});


// ==========================================
// SAVED DATA
// ==========================================

let affection =
  Number(
    localStorage.getItem(
      "eliasAffection"
    )
  ) || 0;


let currentMood =
  localStorage.getItem(
    "eliasMood"
  ) || "calm";


let conversation =
  JSON.parse(
    localStorage.getItem(
      "eliasConversation"
    ) || "[]"
  );


affectionText.textContent =
  affection;


// ==========================================
// HELPERS
// ==========================================

function randomItem(array) {

  return array[
    Math.floor(
      Math.random() *
      array.length
    )
  ];

}


function saveConversation() {

  // keep only recent messages

  conversation =
    conversation.slice(-20);


  localStorage.setItem(
    "eliasConversation",
    JSON.stringify(
      conversation
    )
  );

}


// ==========================================
// SPEECH
// ==========================================

function showMessage(text) {

  bubble.style.opacity =
    "0";

  bubble.style.transform =
    "translateY(6px)";


  setTimeout(function() {

    bubble.textContent =
      text;

    bubble.style.opacity =
      "1";

    bubble.style.transform =
      "translateY(0)";

  }, 120);

}


// ==========================================
// SPRITE CHANGE
// ==========================================

function changeSprite(mood) {

  if (!sprites[mood]) {
    mood = "calm";
  }


  eliasSprite.style.opacity =
    "0";


  setTimeout(function() {

    eliasSprite.src =
      sprites[mood];

    eliasSprite.style.opacity =
      "1";

  }, 120);

}


// ==========================================
// MOOD
// ==========================================

function setMood(mood) {

  if (!sprites[mood]) {
    mood = "calm";
  }


  currentMood =
    mood;


  localStorage.setItem(
    "eliasMood",
    mood
  );


  moodText.textContent =
    mood;


  changeSprite(
    mood
  );

}


// ==========================================
// AFFECTION
// ==========================================

function increaseAffection(
  amount = 1
) {

  affection +=
    amount;


  localStorage.setItem(
    "eliasAffection",
    affection
  );


  affectionText.textContent =
    affection;

}


// ==========================================
// CHAT UI
// ==========================================

function addChatBubble(
  role,
  text
) {

  const message =
    document.createElement("div");


  message.classList.add(
    "message"
  );


  if (role === "user") {

    message.classList.add(
      "user"
    );

  } else {

    message.classList.add(
      "elias"
    );

  }


  message.textContent =
    text;


  chatHistory.appendChild(
    message
  );


  chatHistory.scrollTop =
    chatHistory.scrollHeight;

}


// restore previous visible chat

conversation.forEach(function(item) {

  addChatBubble(
    item.role,
    item.content
  );

});


// ==========================================
// SEND MESSAGE TO AI
// ==========================================

async function sendMessage(
  message
) {

  const previousConversation =
    [...conversation];


  conversation.push({
    role: "user",
    content: message
  });


  addChatBubble(
    "user",
    message
  );


  saveConversation();


  chatInput.value =
    "";


  sendButton.disabled =
    true;


  chatInput.disabled =
    true;


  statusText.textContent =
    "typing...";


  showMessage(
    "..."
  );


  try {

    const response =
      await fetch(
        "/api/chat",
        {

          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              message:
                message,

              history:
                previousConversation,

              affection:
                affection,

              hour:
                new Date().getHours()
            })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Something went wrong."
      );

    }


    const reply =
      data.reply ||
      "I'm here.";

    const reaction =
      data.reaction ||
      reply;

    const mood =
      data.mood ||
      "calm";


    conversation.push({
      role:
        "assistant",

      content:
        reply
    });


    saveConversation();


    addChatBubble(
      "assistant",
      reply
    );


    showMessage(
      reaction
    );


    setMood(
      mood
    );


    increaseAffection(
      1
    );


    statusText.textContent =
      "online";

  }

  catch (error) {

    console.error(
      error
    );


    showMessage(
      "Something went wrong. Try talking to me again?"
    );


    addChatBubble(
      "assistant",
      "Something went wrong. Try talking to me again?"
    );


    statusText.textContent =
      "connection problem";

  }

  finally {

    sendButton.disabled =
      false;


    chatInput.disabled =
      false;


    chatInput.focus();

  }

}


// ==========================================
// FORM
// ==========================================

chatForm.addEventListener(
  "submit",
  function(event) {

    event.preventDefault();


    const message =
      chatInput.value.trim();


    if (!message) {
      return;
    }


    sendMessage(
      message
    );

  }
);


// ==========================================
// POKE ELIAS
// ==========================================

pokeButton.addEventListener(
  "click",
  function() {

    character.classList.remove(
      "poked"
    );


    void character.offsetWidth;


    character.classList.add(
      "poked"
    );


    increaseAffection(
      1
    );


    const lines = [
      "Marie.",
      "Was that necessary?",
      "You're enjoying this way too much.",
      "Excuse me?",
      "Stop poking me 😭"
    ];


    showMessage(
      randomItem(lines)
    );


    setMood(
      Math.random() < 0.65
        ? "annoyed"
        : "mischievous"
    );

  }
);


// ==========================================
// TAP ELIAS
// ==========================================

character.addEventListener(
  "click",
  function() {

    increaseAffection(
      1
    );


    const lines = [
      "Yes?",
      "You wanted my attention?",
      "I'm right here.",
      "Hey.",
      "You could just text me, you know."
    ];


    showMessage(
      randomItem(lines)
    );


    setMood(
      Math.random() < 0.5
        ? "affectionate"
        : "calm"
    );

  }
);


// ==========================================
// MORI
// ==========================================

moriButton.addEventListener(
  "click",
  function() {

    const hidden =
      mori.classList.contains(
        "hidden"
      );


    if (hidden) {

      mori.classList.remove(
        "hidden"
      );


      setMood(
        "jealous"
      );


      showMessage(
        "Oh. You wanted Mori. Of course."
      );

    }

    else {

      mori.classList.add(
        "hidden"
      );


      setMood(
        "mischievous"
      );


      showMessage(
        "He's wandered off again."
      );

    }

  }
);


// ==========================================
// TIME STARTUP
// ==========================================

function startupGreeting() {

  const hour =
    new Date().getHours();


  if (
    hour >= 0 &&
    hour < 5
  ) {

    statusText.textContent =
      "wondering why you're awake";


    setMood(
      "sleepy"
    );


    showMessage(
      "Marie. It's after midnight."
    );

  }

  else if (
    hour < 10
  ) {

    statusText.textContent =
      "barely awake";


    setMood(
      "sleepy"
    );


    showMessage(
      "Morning."
    );

  }

  else if (
    hour < 18
  ) {

    statusText.textContent =
      "online";


    setMood(
      "calm"
    );


    showMessage(
      "Hey, Marie."
    );

  }

  else {

    statusText.textContent =
      "online";


    setMood(
      "happy"
    );


    showMessage(
      "There you are."
    );

  }

}


// ==========================================
// START
// ==========================================

eliasSprite.src =
  sprites[currentMood] ||
  sprites.calm;


startupGreeting();
