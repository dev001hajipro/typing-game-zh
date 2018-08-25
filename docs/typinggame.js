class UserStatus {
    constructor() {
        this.score = 0;
        window.localStorage.setItem('score', this.score);
        this.hiscore = window.localStorage.getItem('hiscore') || 0;
        this.level = 0;
    }

    setScore(n) {
        this.score = n;
        window.localStorage.setItem('score', this.score);

        if (this.hiscore < this.score) {
            this.hiscore = this.score;
            window.localStorage.setItem('hiscore', this.hiscore);
        }
    }
}

let userStatus = new UserStatus();

class SceneTitle extends window.Phaser.Scene {
    constructor() {
        super('SceneTitle');
    }

    preload() {
        this.load.image('b_Play1', 'resource/image/Orange/scaled-at-50/b_Play1.png');
        this.load.image('b_Leaderboard', 'resource/image/Orange/scaled-at-50/b_Leaderboard.png');

        this.load.audio('se_button', 'resource/audio/MenuSelectionClick.wav');
    }

    create() {
        this.titleText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'タイピングゲーム', { fontSize: '72px', padding: 10 });
        this.titleText.setOrigin(0.5);

        this.add.image(this.sys.game.config.width / 2 + 50, 350, 'b_Play1')
            .setInteractive();
        this.add.image(this.sys.game.config.width / 2 - 50, 350, 'b_Leaderboard')
            .setInteractive();

        this.input.on('gameobjectdown', this.onClick, this);

        this.sound.add('se_button');
    }

    onClick(pointer, gameObject) {
        this.scene.start((gameObject.texture.key === 'b_Play1') ? 'SceneSelectLevel' : 'SceneResult');
        this.sound.play('se_button');
    }
}

class SceneSelectLevel extends window.Phaser.Scene {
    constructor() {
        super('SceneSelectLevel');
    }

    preload() {
        this.load.image('b_Play1', 'resource/image/Orange/scaled-at-50/b_Play1.png');
        this.load.image('b_Leaderboard', 'resource/image/Orange/scaled-at-50/b_Leaderboard.png');

        this.load.audio('se_button', 'resource/audio/MenuSelectionClick.wav');
    }

    create() {
        this.titleText = this.add.text(this.sys.game.config.width / 2, 100, 'Select Level', { fontSize: '36px', padding: 10 });
        this.titleText.setOrigin(0.5);

        this.textLevels = [];
        for (let i = 1; i <= 6; i++) {
            let textObject = this.add.text(this.sys.game.config.width / 2, 150 + (30 * i), `Level ${i}`, { fontSize: '24px', padding: 10 });
            textObject.setOrigin(0.5);
            textObject.setInteractive();
            textObject.name = `${i}`;
            this.textLevels.push(textObject);
        }

        this.input.on('gameobjectdown', this.onClick, this);

        this.sound.add('se_button');
    }

    onClick(pointer, gameObject) {
        userStatus.level = Number(gameObject.name);
        console.log(userStatus.level);
        this.scene.start('SceneGame');
        this.sound.play('se_button');
    }
}

class SceneGame extends window.Phaser.Scene {
    constructor() {
        super('SceneGame');
    }

    init() {
        this.score = 0;
        userStatus.setScore(this.score);
        this.timer = 0;
        this.word = '';
        this.lockKeydown = false;
    }

    preload() {
        this.load.image('b_Parameters', 'resource/image/Orange/scaled-at-50/b_Parameters.png');

        this.load.audio('se_button', 'resource/audio/MenuSelectionClick.wav');

    }

    create() {
        console.log(`./resource/HSK Official With Definitions 2012 L${userStatus.level} freqorder.json`);
        window.fetch(`./resource/HSK Official With Definitions 2012 L${userStatus.level} freqorder.json`)
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                this.words = json;
                this.selectWord(this.words);
                this.wordSimplifiedText.setText(`${this.word.simplified}`);
                this.wordPinyinCurrentText.setText(`${this.word.pinyin_current}`);
                //this.wordPinyinText.setText(`${this.word.pinyin}`);
                this.wordPinyinToneText.setText(`${this.word.pinyin_tone}`);
                this.wordDefinitionText.setText(`${this.word.definition}`);
            });

        this.scoreText = this.add.text(10, 5, `score:${this.score}`, { fontSize: '24px', padding: 10 });
        this.scoreText.setOrigin(0);
        this.timeText = this.add.text(10, 30, `timer:${this.timer}`, { fontSize: '24px', padding: 10 });
        this.timeText.setOrigin(0);
        this.wordSimplifiedText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, ``, { fontSize: '72px', padding: 10 });
        this.wordSimplifiedText.setOrigin(0.5);
        this.wordPinyinCurrentText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 50, ``, { fontSize: '24px', padding: 10 });
        this.wordPinyinCurrentText.setOrigin(0.5);
        //this.wordPinyinText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 150, ``, { fontSize: '24px', padding: 10 });
        //this.wordPinyinText.setOrigin(0.5);
        this.wordPinyinToneText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 150, ``, { fontSize: '24px', padding: 10 });
        this.wordPinyinToneText.setOrigin(0.5);
        this.wordDefinitionText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 190, ``, { fontSize: '24px', padding: 10 });
        this.wordDefinitionText.setOrigin(0.5);

        this.add.image(this.sys.game.config.width - 40, 40, 'b_Parameters')
            .setInteractive();

        this.input.on('gameobjectdown', this.onClick, this);

        this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onTime, callbackScope: this, repeat: 60 });

        this.input.keyboard.on('keydown', this.onKeydown, this);

        this.sound.add('se_button');
    }

    onKeydown(event) {
        event.preventDefault();
        if (!this.lockKeydown && this.word.pinyin_current[0] === event.key) {
            this.lockKeydown = true;
            this.word.pinyin_current = this.word.pinyin_current.slice(1);

            this.score++;

            userStatus.setScore(this.score);

            if (this.word.pinyin_current.length === 0) {
                this.selectWord(this.words);
            }
            this.lockKeydown = false;
        }
    }

    selectWord(words) {
        this.word = words[Math.floor(Math.random() * words.length)];
        this.word.pinyin_current = this.word.pinyin.replace(/\d+/g, '');
        this.speech();
    }

    // 音声再生
    speech() {
        const voiceSelectValue = document.getElementById('voiceSelect').value;
        const utterance = new window.SpeechSynthesisUtterance(this.word.simplified);
        if (voiceSelectValue) {
            utterance.voice = window.speechSynthesis.getVoices().filter((voice) => voice.name === voiceSelectValue)[0];
            utterance.lang = 'zh-CN';
            window.speechSynthesis.speak(utterance);
        }
    }

    onTime() {
        if (this.timedEvent.repeatCount === 0) {
            this.scene.start('SceneResult');
        }
    }

    update(step, dt) {
        this.scoreText.setText(`score:${this.score}`);
        this.timeText.setText(`timer:${this.timedEvent.repeatCount}`);
        this.wordSimplifiedText.setText(`${this.word.simplified}`);
        this.wordPinyinCurrentText.setText(`${this.word.pinyin_current}`);
        //this.wordPinyinText.setText(`${this.word.pinyin}`);
        this.wordPinyinToneText.setText(`ピンイン:${this.word.pinyin_tone}`);
        this.wordDefinitionText.setText(`意味(英語)：${this.word.definition}`);
    }

    onClick(pointer, gameObject) {
        this.scene.start('SceneTitle');
        this.sound.play('se_button');
    }
}

class SceneResult extends window.Phaser.Scene {
    constructor() {
        super('SceneResult');
    }

    preload() {
        this.load.image('b_Restart', 'resource/image/Orange/scaled-at-50/b_Restart.png');
        this.load.image('b_Parameters', 'resource/image/Orange/scaled-at-50/b_Parameters.png');

        this.load.audio('se_button', 'resource/audio/MenuSelectionClick.wav');

    }

    create() {
        this.titleText = this.add.text(this.sys.game.config.width / 2, 130, '結果', { fontSize: '72px', padding: 10 });
        this.titleText.setOrigin(0.5);

        this.add.image(this.sys.game.config.width / 2, 350, 'b_Restart')
            .setInteractive();

        this.add.image(this.sys.game.config.width - 40, 40, 'b_Parameters')
            .setInteractive();

        this.input.on('gameobjectdown', this.onClick, this);

        this.scoreText = this.add.text(this.sys.game.config.width / 2, 200, `score:${userStatus.score}`, { fontSize: '24px', padding: 10 });
        this.scoreText.setOrigin(0.5);
        this.hiscoreText = this.add.text(this.sys.game.config.width / 2, 230, `hiscore:${userStatus.hiscore}`, { fontSize: '24px', padding: 10 });
        this.hiscoreText.setOrigin(0.5);

        this.sound.add('se_button');
    }

    onClick(pointer, gameObject) {
        this.scene.start((gameObject.texture.key === 'b_Restart') ? 'SceneGame' : 'SceneTitle');
        this.sound.play('se_button');
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
    scene: [SceneTitle, SceneSelectLevel, SceneGame, SceneResult]
};

let game = new window.Phaser.Game(config); // eslint-disable-line no-unused-vars

// 音声再生サポートしている場合true
const isSpeechSupport = () => Boolean(window.SpeechSynthesisUtterance);

// 音声再生サポート時は、男性音声、女性音声など複数あるのでそれを選べるように
// select optionタグを作成する
let sl = document.querySelector('#voiceSelect');
let voices;
const makeSpeakerListOptions = () => {
    const lang = 'zh-CN';
    voices = window.speechSynthesis.getVoices();
    sl.textContent = null;
    for (let i = 0; i < voices.length; i++) {
        if (lang === voices[i].lang) {
            let opEl = document.createElement('option');
            opEl.text = voices[i].name;
            opEl.value = voices[i].name;
            sl.appendChild(opEl);
        }
    }
};

const main = () => {
    if (isSpeechSupport()) {
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            voices = window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = makeSpeakerListOptions;
        } else {
            makeSpeakerListOptions();
        }
    } else {
        console.log('not support speech');
    }
};
main();
