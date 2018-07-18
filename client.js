document.getElementById("hanziButton").addEventListener('click', (event) => {
    event.preventDefault();
    var hanziText = document.getElementById('hanziText').value;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/hanzi/' + hanziText, true);
    xhr.responseType = 'json';
    xhr.onreadystatechange = function (event2) {
        if (xhr.readyState == xhr.DONE) {
            console.log(this.response);
            document.getElementById('out').innerHTML = JSON.stringify(this.response);
        }
    };
    xhr.send();
});

function makeOptions(lang) {
    var voices = speechSynthesis.getVoices();
    console.log(voices);
    var sl = document.createElement('select');
    sl.id = 'voiceSelect';
    for (i = 0; i < voices.length; i++) {
        if (lang == voices[i].lang) {
            var opEl = document.createElement('option');
            opEl.text = voices[i].name;
            opEl.value = voices[i].name;
            sl.appendChild(opEl);
            console.log(voices[i]);
        }
    }
    document.getElementById('opt').appendChild(sl);
}
speechSynthesis.onvoiceschanged = () => {
    makeOptions('zh-CN');
};

if (!SpeechSynthesisUtterance) {
    document.getElementById('message').innerHTML = "Not Support Speech.";
} else {
    var textEl = document.getElementById('text');
    var btn = document.getElementById('speech');
    const speechHandler = (event) => {
        event.preventDefault();
        var utterance = new SpeechSynthesisUtterance(textEl.value);
        console.log(voiceSelect.value);
        if (voiceSelect.value) {
            utterance.voice = speechSynthesis.getVoices().filter(function (voice) { return voice.name == voiceSelect.value; })[0];

        } utterance.lang = 'zh-CN';
        speechSynthesis.speak(utterance);
    };
    textEl.addEventListener('compositionend', speechHandler);
    textEl.addEventListener('change', speechHandler);
    btn.addEventListener('click', speechHandler);
}



//////////////////////////////////////////
// typing game
var score = 0;
var data = [
    'Orange',
    'Hello',
    'Apple',
    'banana'
];

const createText = (ls) => {
    const textEl = document.getElementById('text');
    textEl.textContent = '';
    return ls[Math.floor(Math.random() * ls.length)].split('').map(s => {
        var span = document.createElement('span');
        span.textContent = s;
        textEl.appendChild(span);
        return span;
    });
}
const handleKeydown = (e) => {
    if (currentWord[0].textContent === e.key) {
        currentWord[0].style.color = '#f00';
        currentWord.shift();

        score++;
        document.getElementById('scoreText').textContent = score;

        if (currentWord.length === 0)
            currentWord = createText(data);
    }
};

var currentWord, intervalID;
const runTimer = () => {
    var timer = 60;
    return setInterval(() => {
        timer--;
        document.getElementById('timerText').textContent = timer;
        if (timer === 0) {
            clearInterval(intervalID)
        }
    }, 1000);
}

window.onload = (e) => {
    window.onkeydown = handleKeydown;
    intervalID = runTimer();
    currentWord = createText(data);
};
