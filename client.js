// 音声再生サポートしている場合true
const isSpeechSupport = () => Boolean(window.SpeechSynthesisUtterance)

// 音声再生サポート時は、男性音声、女性音声など複数あるのでそれを選べるように
// select optionタグを作成する
const makeSpeakerListOptions = (lang) => {
  const voices = window.speechSynthesis.getVoices()
  let sl = document.createElement('select')
  sl.id = 'voiceSelect'
  for (let i = 0; i < voices.length; i++) {
    if (lang === voices[i].lang) {
      let opEl = document.createElement('option')
      opEl.text = voices[i].name
      opEl.value = voices[i].name
      sl.appendChild(opEl)
    }
  }
  document.getElementById('opt').appendChild(sl)
}

// 音声再生
const speechHandler = (event) => {
  // event.preventDefault()
  const voiceSelectValue = document.getElementById('voiceSelect').value
  const elTextValue = document.getElementById('text').value
  const utterance = new window.SpeechSynthesisUtterance(elTextValue)
  if (voiceSelectValue) {
    utterance.voice = window.speechSynthesis.getVoices().filter((voice) => voice.name === voiceSelectValue)[0]
    utterance.lang = 'zh-CN'
    window.speechSynthesis.speak(utterance)
  }
}

const main = () => {
  if (isSpeechSupport()) {
    window.speechSynthesis.onvoiceschanged = () => makeSpeakerListOptions('zh-CN')
    const elText = document.getElementById('text')
    elText.addEventListener('compositionend', speechHandler)
    elText.addEventListener('change', speechHandler)
  } else {
    console.log('not support speech')
  }
}
main()

// typing game
let state = {
  'words': [],
  'word': '',
  'score': 0
}

const selectWord = (words) => words[Math.floor(Math.random() * words.length)]

const createText = (ls) => {
  const textEl = document.getElementById('word')
  textEl.textContent = ''
  const w = selectWord(state.words)

  return w.pinyin.split('').map(s => {
    var span = document.createElement('span')
    span.textContent = s
    textEl.appendChild(span)
    return span
  })
}

const handleKeydown = (event) => {
  // event.preventDefault()
  console.log(state.word)
  if (state.word[0].textContent === event.key) {
    state.word[0].style.color = '#f00'
    state.word.shift()

    state.score++
    document.getElementById('scoreText').textContent = state.score

    if (state.word.length === 0) {
      state.word = createText(state.words)
    }
  }
}

class Timer {
  constructor (cb, finish, timer = 5) {
    this.timer = timer
    this.finish = finish
    this.cb = cb
  }
  run () {
    this.intervalID = setInterval(() => {
      this.timer--
      this.cb && this.cb(this.timer)
      if (this.timer === 0) {
        this.finish && this.finish(this.timer)
        clearInterval(this.intervalID)
      }
    }, 1000)
  }
}

window.onload = (e) => {
  window.onkeydown = handleKeydown
  window.fetch('./resource/HSK Official With Definitions 2012 L1 freqorder.json')
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      state.words = json
      state.word = createText(state.words)
    })

  let countdownTimer = new Timer((timer) => { document.getElementById('timerText').textContent = timer }, () => {}, 60)
  countdownTimer.run()
}
