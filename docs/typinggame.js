class UserStatus {
  constructor () {
    this.score = 0
    window.localStorage.setItem('score', this.score)
    this.hiscore = window.localStorage.getItem('hiscore') || 0
  }

  setScore (n) {
    this.score = n
    window.localStorage.setItem('score', this.score)

    if (this.hiscore < this.score) {
      this.hiscore = this.score
      window.localStorage.setItem('hiscore', this.hiscore)
    }
  }
}

let userStatus = new UserStatus()

class SceneTitle extends window.Phaser.Scene {
  constructor () {
    super('SceneTitle')
  }

  preload () {
    this.load.image('b_Play1', 'resource/image/Orange/scaled-at-50/b_Play1.png')
    this.load.image('b_Leaderboard', 'resource/image/Orange/scaled-at-50/b_Leaderboard.png')
  }

  create () {
    this.titleText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'タイピングゲーム', { fontSize: '72px', padding: 10 })
    this.titleText.setOrigin(0.5)

    this.add.image(this.sys.game.config.width / 2 + 50, 350, 'b_Play1')
      .setInteractive()
    this.add.image(this.sys.game.config.width / 2 - 50, 350, 'b_Leaderboard')
      .setInteractive()

    this.input.on('gameobjectdown', this.onClick, this)
  }

  onClick (pointer, gameObject) {
    this.scene.start((gameObject.texture.key === 'b_Play1') ? 'SceneGame' : 'SceneResult')
  }
}

class SceneGame extends window.Phaser.Scene {
  constructor () {
    super('SceneGame')
    this.score = 0
    userStatus.setScore(this.score)
    this.timer = 0
    this.word = ''
  }

  preload () {
    this.load.image('b_Parameters', 'resource/image/Orange/scaled-at-50/b_Parameters.png')
  }

  create () {
    window.fetch('./resource/HSK Official With Definitions 2012 L1 freqorder.json')
      .then((response) => {
        return response.json()
      })
      .then((json) => {
        this.words = json
        this.selectWord(this.words)
        console.log('1', this.word.simplified)
        this.wordSimplifiedText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, `${this.word.simplified}`, { fontSize: '72px', padding: 10 })
        this.wordSimplifiedText.setOrigin(0.5)
        this.wordPinyinCurrentText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 50, `${this.word.pinyin_current}`, { fontSize: '24px', padding: 10 })
        this.wordPinyinCurrentText.setOrigin(0.5)
      })

    this.scoreText = this.add.text(10, 5, `score:${this.score}`, { fontSize: '24px', padding: 10 })
    this.scoreText.setOrigin(0)
    this.timeText = this.add.text(10, 30, `timer:${this.timer}`, { fontSize: '24px', padding: 10 })
    this.timeText.setOrigin(0)

    this.add.image(this.sys.game.config.width - 40, 40, 'b_Parameters')
      .setInteractive()

    this.input.on('gameobjectdown', this.onClick, this)

    this.timedEvent = this.time.addEvent({delay: 1000, callback: this.onTime, callbackScope: this, repeat: 60})

    this.input.keyboard.on('keydown', this.onKeydown, this)
  }

  onKeydown (event) {
    event.preventDefault()
    if (this.word.pinyin_current[0] === event.key) {
      this.word.pinyin_current = this.word.pinyin_current.slice(1)

      this.score++

      userStatus.setScore(this.score)

      if (this.word.pinyin_current.length === 0) {
        this.selectWord(this.words)
      }
    }
  }

  selectWord (words) {
    this.word = words[Math.floor(Math.random() * words.length)]
    this.word.pinyin_current = this.word.pinyin.replace(/\d+/g, '')
    /*
    document.getElementById('traditional').textContent = state.word.traditional
    document.getElementById('pinyin').textContent = state.word.pinyin
    document.getElementById('pinyin_current').textContent = state.word.pinyin_current
    document.getElementById('pinyin_tone').textContent = state.word.pinyin_tone
    document.getElementById('definition').textContent = state.word.definition
    */
    this.speech()
  }

  // 音声再生
  speech () {
    console.log(this.word.simplified)
    const voiceSelectValue = document.getElementById('voiceSelect').value
    const utterance = new window.SpeechSynthesisUtterance(this.word.simplified)
    if (voiceSelectValue) {
      utterance.voice = window.speechSynthesis.getVoices().filter((voice) => voice.name === voiceSelectValue)[0]
      utterance.lang = 'zh-CN'
      window.speechSynthesis.speak(utterance)
    }
  }

  onTime () {
    if (this.timedEvent.repeatCount === 0) {
      this.scene.start('SceneResult')
    }
  }

  update (step, dt) {
    this.scoreText.setText(`score:${this.score}`)
    this.timeText.setText(`timer:${this.timedEvent.repeatCount}`)
    this.wordSimplifiedText.setText(`${this.word.simplified}`)
    this.wordPinyinCurrentText.setText(`${this.word.pinyin_current}`)
  }

  onClick (pointer, gameObject) {
    this.scene.start('SceneTitle')
  }
}

class SceneResult extends window.Phaser.Scene {
  constructor () {
    super('SceneResult')
  }

  preload () {
    this.load.image('b_Restart', 'resource/image/Orange/scaled-at-50/b_Restart.png')
    this.load.image('b_Parameters', 'resource/image/Orange/scaled-at-50/b_Parameters.png')
  }

  create () {
    this.titleText = this.add.text(this.sys.game.config.width / 2, 130, '結果', { fontSize: '72px', padding: 10 })
    this.titleText.setOrigin(0.5)

    this.add.image(this.sys.game.config.width / 2, 350, 'b_Restart')
      .setInteractive()

    this.add.image(this.sys.game.config.width - 40, 40, 'b_Parameters')
      .setInteractive()

    this.input.on('gameobjectdown', this.onClick, this)

    this.scoreText = this.add.text(this.sys.game.config.width / 2, 200, `score:${userStatus.score}`, { fontSize: '24px', padding: 10 })
    this.scoreText.setOrigin(0.5)
    this.hiscoreText = this.add.text(this.sys.game.config.width / 2, 230, `hiscore:${userStatus.hiscore}`, { fontSize: '24px', padding: 10 })
    this.hiscoreText.setOrigin(0.5)
  }

  onClick (pointer, gameObject) {
    this.scene.start((gameObject.texture.key === 'b_Restart') ? 'SceneGame' : 'SceneTitle')
  }
}

let config = {
  type: window.Phaser.AUTO,
  width: 720,
  height: 480,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }
    }
  },
  scene: [SceneTitle, SceneGame, SceneResult]
}

let game = new window.Phaser.Game(config) // eslint-disable-line no-unused-vars

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

const main = () => {
  console.log('run main')
  if (isSpeechSupport()) {
    window.speechSynthesis.onvoiceschanged = () => makeSpeakerListOptions('zh-CN')
  } else {
    console.log('not support speech')
  }
}
main()
