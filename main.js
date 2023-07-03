//宣告狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}


//牌組花色
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

//渲染牌組
const view = {

  //取得目前此index，渲染牌中的內容
  getCardContent(index) {
    const number = this.transfromNumber((index % 13) + 1) //取得數字，記得加上1
    const symbols = Symbols[Math.floor(index / 13)] //取得花色，取得數字後當成Index，在Symbols陣列裡查找

    return `
        <p>${number}</p>
        <img src="${symbols}" alt="">
        <p>${number}</p>
    `
  },
  //渲染牌組背面
  getCardElement(index) {
    return `<div class="card back" data-index=${index}></div>` //建立dataset，去判斷目前這個index是誰
  },

  //處理數字轉成文字(A、J、Q、K)
  transfromNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  //做出翻牌效果
  filpCards(...cards) {
    cards.map(card => {
      //當牌組背面時，翻正面
      if (card.classList.contains('back')) {
        card.classList.remove('back') //去除背面
        card.innerHTML = this.getCardContent(Number(card.dataset.index)) //執行getCardContent取得卡片內容
      } else {
        //當牌組正面時，翻背面
        card.classList.add('back')
        card.innerHTML = null
      }

    })


  },
  //接收隨機數的陣列，進行渲染牌組畫面
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("") //進行getRandomNumberArray洗牌函式，並把函式回傳的陣列內容撈出來執行getCardElement()函式，加入join('')取消陣列化
  },
  //配對成功的牌組增加底色
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerText = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tired').innerText = `You have tried: ${times} times`
  },
  //選錯牌動畫
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      //偵測到動畫，執行取消class wring
      card.addEventListener('animationend', event => {
        event.target.classList.remove('wrong')
      }, {
        once: true //
      })
    })
  },

  //遊戲結束動畫
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Completed!</p>
      <p>Score : ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }

}

//洗牌動作，使用 Fisher-Yates Shuffle洗牌演算法
const utility = {
  //回傳隨機數的陣列
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys()) //先宣告放入數字的陣列
    for (let index = number.length - 1; index > 0; index--) { //使用for迴圈，先取出陣列最後一個數字，與隨機一個數字交換，達成洗牌效果(這裡陣列的index是0-51，總共52個)
      let randomIndex = Math.floor(Math.random() * (index + 1)); //宣告存放隨機數字的值，注意要加上;因使用Math.floor，要與[]分開
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]] //最後一個數與隨機數交換
    }

    return number
  }
}

//建立model，存放兩張卡片進行比較
const model = {
  revealedCards: [],
  //配對revealedCards裡的items是否一樣，回傳true和false
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTimes: 0
}

//建立controller，這邊撈出view或其他程式進行指令
const controller = {
  currentState: GAME_STATE.FirstCardAwaits, //先預設目前遊戲狀態

  //渲染卡片畫面
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //進行翻牌動作
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) return //假如card沒有back這個class停止此程式
    switch (this.currentState) { //選擇狀態
      //第一次翻牌狀態，執行以下指令
      case GAME_STATE.FirstCardAwaits:
        model.revealedCards.push(card) //把card內容放進陣列
        view.filpCards(card) //進行翻牌動作
        this.currentState = GAME_STATE.SecondCardAwaits //狀態改為第二次翻牌
        break
        //第二次翻牌狀態，執行以下指令
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        model.revealedCards.push(card) //把card內容放進陣列
        view.filpCards(card) //進行翻牌動作 
        //進行是否有配對成功動作
        if (model.isRevealedCardsMatched()) { //判斷配對是否成功
          //配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched //狀態更改
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('Game Finished!')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits //回到初始狀態
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed //狀態更改
          //非成功即加入動畫
          view.appendWrongAnimation(...model.revealedCards)
          //給玩家反應時間
          setTimeout(this.resetCards, 1000)
        }
        break

    }
    console.log('currentState:', this.currentState)
    console.log('revealedCards', model.revealedCards)
  },
  resetCards() {
    view.filpCards(...model.revealedCards)
    model.revealedCards = []
    //這裡controller不能打成this，他會指向setTimeout，而不是指向controller，所以要改成controller，是指controller的currentState
    controller.currentState = GAME_STATE.FirstCardAwaits
  }

}




//執行渲染畫面函式
controller.generateCards()

//使用querySelectorAll回傳的是NodeList，算是是類陣列一種不能使用map
document.querySelectorAll('.card').forEach(card => { //使用forEach把類陣列裡的card呼喚出來
  card.addEventListener('click', e => { //並都加入監聽器
    controller.dispatchCardAction(card) //按下的動作執行此函式
  })
})