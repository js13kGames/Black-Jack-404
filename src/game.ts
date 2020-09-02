import { createCardDeck, shuffleDeck } from './cardUtils';
import { Card } from './Icard';
import { Player } from './player';
export class Game {
    modalEl: HTMLElement;
    gameEl: HTMLElement;
    playerEl: HTMLElement;
    dealerEl: HTMLElement;
    deckEl: HTMLElement;
    betzoneEl: HTMLElement;
    btnHit: HTMLElement;
    btnHold: HTMLElement;
    btnBet: HTMLElement;
    btnNext: HTMLElement;
    totalChipsEl: HTMLElement;
    dealerTotalEl: HTMLElement;
    playerTotalEl: HTMLElement;
    menuEl: HTMLElement;
    mainMenuEl: HTMLElement;
    mainMenuContainerEl: HTMLElement;
    isSubscriber = false;
    deck: Card[];
    originalDeck: Card[];
    player: Player;
    dealer: Player;
    isMenuOpen = false;
    animationTime = 500;
    // playStates: string[] = ["start", "betted", "betted2x", "hold", "playerEnd", "dealerEnd"];
    currentState = "start";
    constructor() {
        this.player = new Player(false);
        this.dealer = new Player(true);
        this.checkForSubscriber();
        this.modalEl = document.getElementById('modal');
        this.gameEl = document.getElementById('game');
        this.dealerEl = document.getElementById('dealer');
        this.playerEl = document.getElementById('player');
        this.deckEl = document.getElementById('deck');
        this.betzoneEl = document.getElementById('betzone');
        this.btnHit = document.getElementById('btnHit');
        this.btnHold = document.getElementById('btnHold');
        this.btnBet = document.getElementById('btnBet');
        this.btnNext = document.getElementById('btnNext');
        this.totalChipsEl = document.getElementById('totalChips');
        this.dealerTotalEl = document.getElementById('dealerTotal');
        this.playerTotalEl = document.getElementById('playerTotal');
        this.menuEl = document.getElementById('menu');
        this.mainMenuEl = document.getElementById('mainMenu');
        this.mainMenuContainerEl = document.getElementById('mainMenuContainer');
        this.deck = createCardDeck();
        this.originalDeck = [...this.deck];
        shuffleDeck(this.deck);
        this.dealStartHand(this.deck);
        this.addEventListeners();
        this.updateButtonStates();
        this.updateChipsText();
    }
    
    addEventListeners(){
      this.btnHit.addEventListener("click", () => {
        this.dealCard(this.player);
        this.updateButtonStates();
      });
      this.btnHold.addEventListener("click", () => {
        this.currentState = "hold";
        this.reveal404Cards(this.player);
        this.currentState = "playerEnd";
        this.updatePlayersTotalSum(true);
        this.updateButtonStates();
        this.updateTurnState();
      });
      this.btnBet.addEventListener("click", () => {
        if(this.currentState === "betted") {
          this.currentState = "betted2x";
        } else {
          this.currentState = "betted";
        }
        this.betzoneEl.appendChild(document.createElement("game-chip", {}));
        this.player.removeChips(10);
        this.updateButtonStates();
        this.updateChipsText();
      });
      this.btnNext.addEventListener("click", () => {
        this.startNextRound();
      });
      this.menuEl.addEventListener("click", () => {
        this.toggleMenu();
      });
    }

    toggleMenu(){
      this.isMenuOpen = !this.isMenuOpen;
      if(this.isMenuOpen) {
        this.mainMenuContainerEl.classList.remove("close");
        this.mainMenuContainerEl.classList.add("open");
      } else {
        this.mainMenuContainerEl.classList.remove("open");
        this.mainMenuContainerEl.classList.add("close");
      }
    }

    startNextRound(){
      this.player.display404Cards = false;
      this.dealer.display404Cards = false;
      this.removeChipsFromDom();
      this.removeCardsFromDom();
      this.player.discardHand();
      this.dealer.discardHand();
      this.currentState = "start";
      this.updatePlayersTotalSum();
      this.dealStartHand(this.deck);
      this.updatePlayerHands();
      this.updateButtonStates();
      this.updateChipsText();
    }

    updateChipsText(){
      this.totalChipsEl.textContent = ""+this.player.totalChips;
    }

    updateButtonStates(){
      this.enableButtons([this.btnHold, this.btnBet, this.btnHit, this.btnNext]);
      if (this.currentState === "start") {
        this.disableButtons([this.btnHold, this.btnHit, this.btnNext]);
      } else if (this.currentState === "hold") {
        this.disableButtons([this.btnHold, this.btnBet, this.btnHit, this.btnNext]);
      } else if (this.currentState === "betted") {
        this.disableButtons([this.btnNext]);
      } else if (this.currentState === "betted2x") {
        this.disableButtons([this.btnBet, this.btnNext]);
      } else if (this.currentState === "playerEnd") {
        this.disableButtons([this.btnHold, this.btnBet, this.btnHit, this.btnNext]);
      } else if (this.currentState === "dealerEnd") {
        this.disableButtons([this.btnHold, this.btnBet, this.btnHit]);
      }
    }

    updateTurnState(){
      if(this.currentState === "playerEnd") {
        this.dealersTurn();
      } else if(this.currentState === "dealerEnd") {
        this.declareWinner();
      }
    }

    declareWinner(){
      const totalSumPlayer = this.getTotalValue(this.player);
      const totalSumDealer = this.getTotalValue(this.dealer);
      let youWin = false;
      if(totalSumPlayer - 21 <= 0) {
        if(totalSumDealer -21 > 0) {
          youWin = true;
        } else if(totalSumPlayer > totalSumDealer && totalSumDealer -21 <= 0) {
          youWin = true;
        }
      }
      if(totalSumPlayer === totalSumDealer) {
        this.player.giveChips(this.player.tmpRemovedChips);
        this.createMessage("It is a DRAW");
      } else if(youWin) {
        this.player.giveChips(this.player.tmpRemovedChips*2.5);
        this.createMessage("You WIN, hurray");
        this.animateChips(this.player);
      } else {
        this.player.giveChips(0);
        this.createMessage("You LOOSE, too bad");
        this.animateChips(this.dealer);
      }
      this.updateChipsText();
    }

    animateChips(winningPlayer: Player){
      const gameChips = document.getElementsByTagName("game-chip");
        for (let chip of gameChips) {
          if(winningPlayer.isDealer) {
            chip.classList.add("move-up");
          } else {
            chip.classList.add("move-down");
          }
        }
    }

    dealersTurn() {
      if(this.checkIfDealerShouldDrawCard()){
        this.dealCard(this.dealer);
        setTimeout(() => {
          this.dealersTurn();
        }, 1000);
      } else {
        this.currentState = "dealerEnd";
        this.dealer.display404Cards = true;
        this.updatePlayerHands();
        this.updatePlayersTotalSum();
        this.updateTurnState();
        this.updateButtonStates();
      }
    }

    checkIfDealerShouldDrawCard(){
      const totalSumPlayer = this.getTotalValue(this.player);
      const totalGuessedSumDealer = this.getGuessedTotalValue(this.dealerEl);
      if(totalSumPlayer > 21){
        return false;
      } else if(totalGuessedSumDealer < 21 && totalGuessedSumDealer < totalSumPlayer) {
        return true;
      }
      return false;
    }
    enableButtons(buttonElements: HTMLElement[]){
      buttonElements.forEach(btnEl => btnEl.removeAttribute("disabled"));
    }

    disableButtons(buttonElements: HTMLElement[]){
      buttonElements.forEach(btnEl => btnEl.setAttribute("disabled", "true"));
    }

    updatePlayersTotalSum(playerOnly = false){
      const totalSumPlayer = this.getTotalValue(this.player);
      const totalSumDealer = this.getTotalValue(this.dealer);
      if(totalSumPlayer && totalSumDealer) {
        if(playerOnly) {
          this.playerTotalEl.textContent = "Sum: " + totalSumPlayer;
        }else{
          this.playerTotalEl.textContent = "Sum: " + totalSumPlayer;
          this.dealerTotalEl.textContent = "Sum: " + totalSumDealer;
        }
      } else {
        this.playerTotalEl.textContent = "";
        this.dealerTotalEl.textContent = "";
      }
    }

    getGuessedTotalValue(aPlayerEl: HTMLElement) {
      let res = 0;
      aPlayerEl.childNodes.forEach(gameCardEl => {
        const cardValue = (<HTMLElement>gameCardEl).getAttribute("value")
        if(cardValue != "404") {
          res += parseInt(cardValue);
        }else{
          // guess the value in the 404 card, random value between 1 and 10
          res += Math.floor(Math.random() * 10)+1;
        }
      });
      return res;
    }
    
    getTotalValue(aPlayere: Player){
      let res = 0;
      aPlayere.hand.forEach(card => {
        res += card.value;
      });
      return res;
    }

    reveal404Cards(aPlayer: Player){
      aPlayer.display404Cards = true;
      this.updatePlayerHands();
    }

    dealCard(toPlayer: Player){
      const card = this.deck.pop()
      toPlayer.giveCards([card]);
      this.addCardToDom(toPlayer, card);
    }

    updatePlayerHands(){
      this.removeCardsFromDom();
      this.addCardsToDom();
    }

    addCardToDom(toPlayer: Player, card: Card) {
      const gameCardEl = this.createGameCardEl(card, toPlayer);
      let playerEl = this.playerEl;
      console.log("toPlayer", toPlayer);
      if(toPlayer.isDealer) {
        playerEl = this.dealerEl;
      }
      playerEl.appendChild(gameCardEl);
      const deckY = this.deckEl.offsetTop;
      const deckX = this.deckEl.offsetLeft;
      console.log("deckY", deckY);
      const y = gameCardEl.offsetTop;
      console.log("y", y);
      const x = gameCardEl.offsetLeft;
      gameCardEl.setAttribute("style", `position: absolute; transform: translate(${deckY}px,${deckX}px); transform: translate(${x-deckX}px,${y-deckY}px); transition: all ${this.animationTime}ms ease-out;`);
      setTimeout( () => {
        gameCardEl.setAttribute("style", "");
      }, this.animationTime);
    }
    addCardsToDom(){
      this.player.hand.forEach(card => {
        const gameCardEl = this.createGameCardEl(card, this.player);
        this.playerEl.appendChild(gameCardEl);
      });
      this.dealer.hand.forEach(card => {        
        const gameCardEl = this.createGameCardEl(card, this.dealer);
        this.dealerEl.appendChild(gameCardEl);
      });
    }

    removeCardsFromDom(){
      while (this.playerEl.firstChild) {
        this.playerEl.removeChild(this.playerEl.firstChild);
      }
      while (this.dealerEl.firstChild) {
        this.dealerEl.removeChild(this.dealerEl.firstChild);
      }
    }

    removeChipsFromDom(){
      while (this.betzoneEl.lastChild) {
        if((<HTMLElement>this.betzoneEl.lastChild).classList.contains("txt-betzone")){
          return;
        }
        this.betzoneEl.removeChild(this.betzoneEl.lastChild);
      }
    }

    createGameCardEl(card: Card, aPlayer: Player): HTMLElement{
      const gameCardEl = document.createElement("game-card", {});
      gameCardEl.setAttribute("face", card.face);
      if(card.is404 && !aPlayer.display404Cards) {
        gameCardEl.setAttribute("value", "404");
      }else{
        gameCardEl.setAttribute("value", ""+card.value);
      }
      return gameCardEl;
    }

    /**
     * The dealer and player gets two cards from the start
     */
    dealStartHand(deck: Card[]){
      let i = 0;
      const drawOrder = [this.player, this.dealer, this.player, this.dealer];
      
      this.dealCard(drawOrder[i++]);
      const drawInterval = setInterval( () => {
        this.dealCard(drawOrder[i++]);
        if(i >= 4) {
          clearInterval(drawInterval);
        }
      }, this.animationTime);
    }
    
    createMessage(msg: string){
        const modalChild = this.modalEl.childNodes[0];
        this.modalEl.classList.add('open');
        this.modalEl.classList.remove('close');
        this.modalEl.replaceChild(document.createTextNode(msg), modalChild);
        setTimeout(() => {
            this.modalEl.classList.remove('open');
            this.modalEl.classList.add('close');
        }, 3000);
    }
    
    checkForSubscriber(){
        const monetization: any = (<any>document).monetization;
        setTimeout(()=> {
            if (monetization && monetization.state === 'started') { 
                this.createMessage('Hello Subscriber!');
                document.getElementById('game').classList.add('subscriber');
            }
        });
    }
}