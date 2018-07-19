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
  event.preventDefault()
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
    document.getElementById('speech').addEventListener('click', speechHandler)
  } else {
    console.log('not support speech')
  }
}
main()

// typing game
var score = 0
var data = [
  'Orange',
  'Hello',
  'Apple',
  'banana'
]

const createText = (ls) => {
  const textEl = document.getElementById('word')
  textEl.textContent = ''
  return ls[Math.floor(Math.random() * ls.length)].split('').map(s => {
    var span = document.createElement('span')
    span.textContent = s
    textEl.appendChild(span)
    return span
  })
}

const handleKeydown = (event) => {
  event.preventDefault()
  console.log(currentWord)
  if (currentWord[0].textContent === event.key) {
    currentWord[0].style.color = '#f00'
    currentWord.shift()

    score++
    document.getElementById('scoreText').textContent = score

    if (currentWord.length === 0) {
      currentWord = createText(data)
    }
  }
}

var currentWord
var intervalID
const runTimer = () => {
  var timer = 60
  return setInterval(() => {
    timer--
    document.getElementById('timerText').textContent = timer
    if (timer === 0) {
      clearInterval(intervalID)
    }
  }, 1000)
}

window.onload = (e) => {
  window.onkeydown = handleKeydown
  intervalID = runTimer()
  currentWord = createText(data)
}
