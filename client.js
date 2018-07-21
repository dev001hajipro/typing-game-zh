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
const speech = () => {
  const voiceSelectValue = document.getElementById('voiceSelect').value
  const elTextValue = document.getElementById('simplified').textContent
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

const selectWord = (words) => {
  state.word = words[Math.floor(Math.random() * words.length)]

  state.word.pinyin_current = state.word.pinyin.replace(/\d+/g, '')
  // update ui
  document.getElementById('simplified').textContent = state.word.simplified
  document.getElementById('traditional').textContent = state.word.traditional
  document.getElementById('pinyin').textContent = state.word.pinyin
  document.getElementById('pinyin_current').textContent = state.word.pinyin_current
  document.getElementById('pinyin_tone').textContent = state.word.pinyin_tone
  document.getElementById('definition').textContent = state.word.definition

  speech()
}

const handleKeydown = (event) => {
  // event.preventDefault()
  if (state.word.pinyin_current[0] === event.key) {
    state.word.pinyin_current = state.word.pinyin_current.slice(1)

    // update ui
    document.getElementById('pinyin_current').textContent = state.word.pinyin_current

    state.score++
    document.getElementById('scoreText').textContent = state.score

    if (state.word.pinyin_current.length === 0) {
      selectWord(state.words)
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
      selectWord(state.words)
    })

  let countdownTimer = new Timer((timer) => { document.getElementById('timerText').textContent = timer }, () => {}, 60)
  countdownTimer.run()
}
