let cl = console.log;
let ct = console.table;

// ===== Build Deck =====

function buildDeck() {
  let deck = [];
  const suits = ["hearts", "spades", "diamonds", "clubs"];
  for (let i = 2; i <= 14; i++) {
    suits.forEach((suit) => {
      deck.push(createCard(i, suit));
    });
  }
  return deck;
}

function createCard(rank, suit) {
  return {
    rank: rank,
    suit: suit,
    name: getName(rank),
  };
}

function getName(rank) {
  let name = "";
  if (rank === 11) {
    name = "jack";
  } else if (rank === 12) {
    name = "queen";
  } else if (rank === 13) {
    name = "king";
  } else if (rank === 14) {
    name = "ace";
  } else {
    name = rank;
  }
  return name;
}

let deck = buildDeck();

// ===== DOM Elements =====

const startScreen = document.getElementById("start-screen");
const rulesContainer = document.getElementById("rules-container-wrapper");
const closeRulesBtn = document.getElementById("close-rules-btn");
const seeRulesBtn = document.getElementById("see-rules-btn");
const startBtn = document.getElementById("start-game-btn");

const mainScreen = document.getElementById("main-area");
const gameArea = document.getElementById("game-area");
const pokerMsgContainer = document.getElementById("poker-msg-container");
const noStaminaOverlay = document.getElementById("no-stamina-overlay");

const timeWrapper = document.getElementById("time-wrapper");
const scoreWrapper = document.getElementById("score-wrapper");
const staminaWrapper = document.getElementById("stamina-wrapper");
const staminaBar = document.getElementById("stamina-bar");
const staminaLabel = document.getElementById("stamina-label");

const endScreen = document.getElementById("end-screen");

// ===== Game Variables =====
let timeLeft = 10;
let score = 0;
let cardsCount = 0;
let cardsClicked = [];
let stamina = 100;
let noStamina = false;

// ===== Start Screen Event Listeners =====

seeRulesBtn.addEventListener("click", () => {
  rulesContainer.classList.add("show");
  document.addEventListener("click", (e) => {
    if (e.target === rulesContainer) {
      rulesContainer.classList.remove("show");
    }
  });
});

closeRulesBtn.addEventListener("click", () => {
  rulesContainer.classList.remove("show");
});

startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  mainScreen.style.display = "flex";
  startTimer();
  scatterDeck(deck);
});

// ===== Start Timer =====

function startTimer() {
  const timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerWrapper(timeLeft);
    } else {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function updateTimerWrapper(time) {
  timeWrapper.innerHTML = `${time}`;
  timeWrapper.classList.add("scale");
  setTimeout(() => {
    timeWrapper.classList.remove("scale");
  }, 500);
}

// ===== Scatter cards =====

function scatterDeck(deck) {
  deck.forEach((card) => {
    gameArea.innerHTML += `
      <div class="card ${card.suit}-${card.rank}" style="background-image: url(card-images/${card.suit}-${card.rank}.png)">
      </div>`;
    scatterCard(`${card.suit}-${card.rank}`);
  });

  let cards = document.querySelectorAll(".card");

  // pick 4 random cards to rescatter cards
  for (let i = 0; i < 4; i++) {
    let randIndex = Math.floor(Math.random() * deck.length);
    let card = deck[randIndex];
    ct(card);
    let cardElement = document.querySelector(`.${card.suit}-${card.rank}`);
    if (cardElement) {
      cardElement.classList.add("rescatter");
    } else {
      console.error(`Card element not found: ${card.suit}-${card.rank}`);
    }
  }
  document.querySelectorAll(".rescatter").forEach((card) => {
    card.addEventListener("click", reScatterCards);
  });

  // Card click
  function handleCardClick(e) {
    if (noStamina) {
      return;
    }
    const suitRankClass = e.currentTarget.classList[1];
    cardClick(suitRankClass);
    e.currentTarget.removeEventListener("click", handleCardClick);
    e.currentTarget.removeEventListener("touchstart", handleCardClick);
  }

  // Add event listeners
  cards.forEach((card) => {
    card.addEventListener("click", handleCardClick);
    card.addEventListener("touchstart", handleCardClick);
  });
}

function reScatterCards() {
  deck.forEach((card) => {
    scatterCard(`${card.suit}-${card.rank}`);
  });
}

function scatterCard(cardClass) {
  let card = gameArea.querySelector(`.${cardClass}`);
  card.style.left = `${getRandomX(card)}px`;
  card.style.top = `${getRandomY(card)}px`;
  card.style.transform = `rotate(${getRandomAngle()}deg)`;
  card.style.zIndex = `${getRandomIndex()}`;
}

function getRandomX(card) {
  const gameAreaWidth = gameArea.offsetWidth;
  let randNum = Math.floor(Math.random() * gameAreaWidth - card.offsetWidth);
  if (randNum <= 0) {
    randNum = randNum * -1;
  }
  return randNum;
}

function getRandomY(card) {
  const gameAreaHeight = gameArea.offsetHeight;
  let randNum = Math.floor(Math.random() * gameAreaHeight - card.offsetHeight);
  if (randNum <= 0) {
    randNum = randNum * -1;
  }
  return randNum;
}

function getRandomAngle() {
  return Math.floor(Math.random() * 361);
}

function getRandomIndex() {
  let indexes = [];

  for (let i = 0; i < 53; i++) {
    indexes.push(i);
  }

  let randIndex = Math.floor(Math.random() * indexes.length);

  return indexes.splice(randIndex, 1)[0];
}

// ===== Card click =====

function cardClick(suitRankClass) {
  let rank = getCardRank(suitRankClass);
  updateScore(rank);
  updateCardsClicked(suitRankClass);
  checkCardSequence(cardsClicked);
  removeCard(suitRankClass);
  updateClickCount();
  updateStamina();
}

function getCardRank(suitRankClass) {
  let rank = suitRankClass.split("-")[1];
  return Number(rank);
}

function getCardSuit(suitRankClass) {
  return suitRankClass.split("-")[0];
}

// Update score

function updateScore(rank) {
  score += rank;
  updateScoreWrapper(score);
}

function updateScoreWrapper(score) {
  scoreWrapper.innerHTML = score;
  scoreWrapper.classList.add("scale");
  setTimeout(() => {
    scoreWrapper.classList.remove("scale");
  }, 500);
}

// Update card click count

function updateClickCount() {
  cardsCount++;
  if (cardsCount === 52) {
    endGame();
  }
}

// Remove card

function removeCard(suitRankClass) {
  let card = document.querySelector(`.${suitRankClass}`);
  card.classList.add("remove");
  setTimeout(() => {
    card.classList.remove("remove");
    card.style.display = "none";
  }, 300);
}

// Update cards clicked array

function updateCardsClicked(suitRankClass) {
  let cardRank = getCardRank(suitRankClass);
  let cardSuit = getCardSuit(suitRankClass);
  deck.forEach((card) => {
    if (card.rank === cardRank && card.suit === cardSuit) {
      let cardIndex = deck.indexOf(card);
      let cardObject = deck.splice(cardIndex, 1)[0];
      cardsClicked.push(cardObject);
    }
  });
}

// Update stamina variable

function updateStamina() {
  stamina -= 12;
  if (stamina <= 0) {
    stamina = 0;
    noStamina = true;
    noStaminaOverlay.classList.add("no-stamina");
    setTimeout(() => {
      stamina = 50;
      noStamina = false;
      noStaminaOverlay.classList.remove("no-stamina");
    }, 2000);
  }

  updateStaminaBar();
}

function updateStaminaBar() {
  staminaBar.style.width = `${stamina}%`;
  staminaLabel.classList.remove("flash");
  if (stamina >= 75) {
    staminaBar.style.backgroundColor = "rgb(57, 129, 57)";
  } else if (stamina >= 50 && stamina < 75) {
    staminaBar.style.backgroundColor = "#9e983f";
  } else if (stamina >= 25 && stamina < 50) {
    staminaBar.style.backgroundColor = "rgb(163, 106, 0)";
  } else if (stamina >= 0 && stamina < 25) {
    staminaBar.style.backgroundColor = "rgb(160, 52, 52)";
    staminaLabel.classList.add("flash");
  }
}

function regenerateStamina() {
  if (stamina < 100 && !noStamina) {
    stamina += 2;
    updateStaminaBar();
  }
}

setInterval(regenerateStamina, 100);

// Check card click sequence for poker hands

function checkCardSequence(cardsClicked) {
  const len = cardsClicked.length;
  if (len < 2) return;

  const lastCard = cardsClicked[len - 1];
  const secondLastCard = cardsClicked[len - 2];

  if (lastCard.rank === secondLastCard.rank) {
    addBonus("pair");
    pokerHandMsg("pair");
  } else if (len >= 3) {
    const thirdLastCard = cardsClicked[len - 3];
    if (
      lastCard.suit === secondLastCard.suit &&
      lastCard.suit === thirdLastCard.suit
    ) {
      addBonus("flush");
      pokerHandMsg("flush");
    } else if (
      secondLastCard.rank === lastCard.rank - 1 &&
      thirdLastCard.rank === secondLastCard.rank - 1
    ) {
      addBonus("straight");
      pokerHandMsg("straight");
    }
  }
}

// Add poker hand bonus points and time

function addBonus(handType) {
  switch (handType) {
    case "pair":
      score += 15;
      timeLeft += 2;
      break;
    case "flush":
      score += 20;
      timeLeft += 3;
      break;
    case "straight":
      score += 25;
      timeLeft += 4;
      break;
  }

  cardsClicked.length = 0;
}

// Poker Hand Msg Animation

function pokerHandMsg(handType) {
  pokerMsgContainer.innerHTML = `${handType}!`;
  pokerMsgContainer.classList.add("appear");
  setTimeout(() => {
    pokerMsgContainer.classList.remove("appear");
  }, 1000);
}

// ===== End game =====

function endGame() {
  mainScreen.style.display = "none";
  endScreen.style.display = "flex";

  updateFinalData(score, cardsCount);
}

function updateFinalData(score, cardCount) {
  const finalScoreWrapper = document.getElementById("final-score-wrapper");
  const cardsClickedWrapper = document.getElementById("cards-clicked-wrapper");
  finalScoreWrapper.innerHTML = score;
  cardsClickedWrapper.innerHTML = `${cardCount}/52`;
}
