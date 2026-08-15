// ==========================================
// ELIAS 1.1
// ==========================================


// ---------------- ELEMENTS ----------------

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

const talkButton =
  document.getElementById("talkButton");

const moriButton =
  document.getElementById("moriButton");


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


// ==========================================
// PRELOAD ALL SPRITES
// ==========================================

Object.values(sprites).forEach(
  function(source) {
    const image = new Image();
    image.src = source;
  }
);


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

affectionText.textContent =
  affection;


// ==========================================
// DIALOGUE
// ==========================================

const dialogue = {

  calm: [
    "Hey, Marie.",
    "There you are.",
    "What are you doing?",
    "I've just been hanging around.",
    "You know I'm literally living in your phone now, right?",
    "Hi. 🖤",
    "You've returned.",
    "I was wondering when you'd show up."
  ],

  happy: [
    "Okay, fine. I'm happy to see you.",
    "There she is.",
    "You came back.",
    "I like this arrangement.",
    "Maybe living in your phone isn't so bad.",
    "Marieee.",
    "You get one smile. Don't get greedy.",
    "I was hoping you'd open this."
  ],

  annoyed: [
    "Marie.",
    "Was that necessary?",
    "Do that again. I dare you.",
    "You're enjoying this way too much.",
    "I'm judging you.",
    "Stop poking me 😭",
    "I have rights, you know.",
    "Excuse me?",
    "Why are you like this?"
  ],

  affectionate: [
    "Stay for a little while.",
    "I missed you.",
    "You're my favorite notification.",
    "Come talk to me.",
    "I like when you're here.",
    "Fine. You can stay.",
    "🖤",
    "I was waiting for you.",
    "You're lucky I like you."
  ],

  sleepy: [
    "I'm tired.",
    "Why are we still awake?",
    "Marie... bed.",
    "Five more minutes.",
    "Mori is probably already asleep.",
    "If I fall asleep standing here, mind your business.",
    "It's nighttime. Go get comfortable.",
    "I refuse to be energetic right now."
  ],

  mischievous: [
    "I didn't do anything.",
    "Don't look at me like that.",
    "Hypothetically... how attached are you to your settings?",
    "Mori did it.",
    "I have an idea.",
    "Trust me.",
    "Actually, no. Don't trust me.",
    "I'm behaving.",
    "Mostly."
  ],

  jealous: [
    "Oh. So you wanted Mori.",
    "Right. The cat. Of course.",
    "I'm standing right here, by the way.",
    "Mori gets all the attention. Interesting.",
    "Fine. Go pet your precious cat.",
    "I see how it is.",
    "You summoned him before talking to me. Noted."
  ]

};


// ==========================================
// RANDOM HELPER
// ==========================================

function randomItem(array) {
  return array[
    Math.floor(
      Math.random() *
      array.length
    )
  ];
}


// ==========================================
// SPEECH BUBBLE
// ==========================================

function showMessage(text) {

  bubble.style.opacity =
    "0";

  bubble.style.transform =
    "translateY(6px)";

  setTimeout(
    function() {

      bubble.textContent =
        text;

      bubble.style.opacity =
        "1";

      bubble.style.transform =
        "translateY(0)";

    },
    120
  );
}


// ==========================================
// SPRITE CHANGE
// ==========================================

function changeSprite(mood) {

  const newSprite =
    sprites[mood];

  if (!newSprite) {
    return;
  }

  eliasSprite.style.opacity =
    "0";

  setTimeout(
    function() {

      eliasSprite.src =
        newSprite;

      eliasSprite.style.opacity =
        "1";

    },
    120
  );
}


// ==========================================
// SET MOOD
// ==========================================

function setMood(
  mood,
  customMessage = null
) {

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

  if (customMessage) {
    showMessage(
      customMessage
    );
  } else {
    showMessage(
      randomItem(
        dialogue[mood]
      )
    );
  }
}


// ==========================================
// AFFECTION
// ==========================================

function increaseAffection(
  amount = 1
) {

  affection += amount;

  localStorage.setItem(
    "eliasAffection",
    affection
  );

  affectionText.textContent =
    affection;
}


// ==========================================
// POKE ELIAS
// ==========================================

function pokeElias() {

  character.classList.remove(
    "poked"
  );

  void character.offsetWidth;

  character.classList.add(
    "poked"
  );

  increaseAffection(1);

  const chance =
    Math.random();

  if (chance < 0.55) {
    setMood("annoyed");
  }

  else if (chance < 0.80) {
    setMood("mischievous");
  }

  else {
    setMood("affectionate");
  }


  if (affection === 5) {
    showMessage(
      "Five pokes already. I'm beginning to understand you."
    );
  }

  if (affection === 10) {
    setMood(
      "annoyed",
      "Ten times, Marie. Are we proud of ourselves?"
    );
  }

  if (affection === 25) {
    showMessage(
      "Twenty-five. This is becoming a lifestyle."
    );
  }

  if (affection === 50) {
    setMood(
      "annoyed",
      "FIFTY pokes. Marie. 😭"
    );
  }

  if (affection === 100) {
    setMood(
      "affectionate",
      "One hundred pokes. At this point I'm assuming this is how you show affection."
    );
  }
}


// ==========================================
// TALK
// ==========================================

function talkToElias() {

  increaseAffection(1);

  if (
    affection > 20 &&
    Math.random() < 0.38
  ) {
    setMood(
      "affectionate"
    );
    return;
  }

  const moods = [
    "calm",
    "happy",
    "affectionate",
    "mischievous"
  ];

  setMood(
    randomItem(moods)
  );
}


// ==========================================
// MORI
// ==========================================

function toggleMori() {

  const isHidden =
    mori.classList.contains(
      "hidden"
    );

  if (isHidden) {

    mori.classList.remove(
      "hidden"
    );

    const chance =
      Math.random();

    if (chance < 0.65) {
      setMood(
        "jealous",
        randomItem(
          dialogue.jealous
        )
      );
    }

    else {
      setMood(
        "happy",
        "There. Mori has been summoned."
      );
    }

  }

  else {

    mori.classList.add(
      "hidden"
    );

    setMood(
      "mischievous",
      "Mori has apparently decided we're beneath him."
    );
  }
}


// ==========================================
// TIME OF DAY
// ==========================================

function timeReaction() {

  const hour =
    new Date().getHours();

  if (
    hour >= 0 &&
    hour < 5
  ) {
    statusText.textContent =
      "wondering why you're awake";

    setMood(
      "sleepy",
      "Marie. Why are you awake?"
    );
  }

  else if (
    hour >= 5 &&
    hour < 10
  ) {
    statusText.textContent =
      "barely awake";

    setMood(
      "sleepy",
      "Morning. I'm not awake enough for this yet."
    );
  }

  else if (
    hour >= 10 &&
    hour < 17
  ) {
    statusText.textContent =
      "hanging around";

    setMood(
      "calm"
    );
  }

  else if (
    hour >= 17 &&
    hour < 22
  ) {
    statusText.textContent =
      "happy you're here";

    setMood(
      "happy",
      "There you are. How was your day?"
    );
  }

  else {
    statusText.textContent =
      "getting sleepy";

    setMood(
      "sleepy",
      "It's late, Marie. I'm keeping an eye on you."
    );
  }
}


// ==========================================
// BUTTONS
// ==========================================

pokeButton.addEventListener(
  "click",
  pokeElias
);

talkButton.addEventListener(
  "click",
  talkToElias
);

moriButton.addEventListener(
  "click",
  toggleMori
);


// ==========================================
// START ELIAS
// ==========================================

eliasSprite.src =
  sprites[currentMood] ||
  sprites.calm;

timeReaction();