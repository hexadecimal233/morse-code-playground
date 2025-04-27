<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <input
      v-model="inputText"
      @input="stopMorseScript()"
      placeholder="Hello World" />
    <div>
      <label>打字速度 (WPM)</label>
      <input v-model="playWpm" type="range" min="5" max="30" />
    </div>
    <div>
      <label>音高频率 (Frequency)</label>
      <input v-model="playFreq" type="range" min="50" max="2000" />
    </div>
    <div>
      <label>播出声音前显示文字</label>
      <input v-model="playShowTextBeforeSound" type="checkbox" />
    </div>

    <div @click="playMorseScript()">play</div>
    <div @click="stopMorseScript()">stop</div>

    <!--
    <div>
      什么是摩斯电码 (Morse Code)？ 摩斯电码是一种用于通信的编码方式，使用 "."
      和 "-" 来表示字母和数字。
      在部分ARG，恐怖片或解谜类游戏中，经常使用摩斯电码来表示特殊字符和表情符号。
      同时，摩斯电码也是
    </div>
     -->

    <div class="animator block text-xl">
      <p>{{ typewriterText }}</p>
      <p style="color: red">{{ typewriterTextCurrent }}</p>
    </div>
    <div class="current">{{ currentCharMorseCode }}</div>
  </div>
</template>

<style scoped>
.animator {
  font-family: monospace;
}
</style>

<script setup lang="ts">
// 字符映射表
const morseCode: Record<string, string> = { "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--", "Z": "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.", ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.", "$": "...-..-", "@": ".--.-.", " ": " "}; // prettier-ignore

// 配置
const inputText = ref("Hello World")
const playWpm = ref(15)
const playFreq = ref(490)
const playShowTextBeforeSound = ref(true)

// 状态
const currentIdx = ref(0)
const isPlaying = ref(false)
const typewriterText = ref("")
const typewriterTextCurrent = ref("")
const currentCharMorseCode = ref("")
watchEffect(() => {
  // 更新打字机效果
  typewriterText.value = inputText.value.slice(
    0,
    currentIdx.value - 1 + (isPlaying.value ? 0 : 1)
  )

  let currentChar =
    inputText.value[Math.max(currentIdx.value - 1, 0)].toUpperCase()
  if (isPlaying.value) {
    typewriterTextCurrent.value = currentChar
    currentCharMorseCode.value = morseCode[currentChar]
  } else {
    typewriterTextCurrent.value = ""
    currentCharMorseCode.value = ""
  }
})

// WebAudio的东西
let audioContext: AudioContext | null = null
let gainNode: GainNode | null = null
let oscillator: OscillatorNode | null = null

onMounted(() => {
  initAudioContext()
})

// 初始化音频上下文
function initAudioContext() {
  if (!audioContext) {
    // @ts-ignore
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  if (!gainNode) {
    gainNode = audioContext.createGain()
    gainNode.gain.value = 0
    gainNode.connect(audioContext.destination)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  }

  if (!oscillator) {
    oscillator = audioContext.createOscillator()
    oscillator.type = "sine"
    oscillator.connect(gainNode)
    oscillator.start()
  }
}

// 播放正弦波
function playSine(freq: number, duration: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const attack = 0.005
    const decay = 0.005

    initAudioContext()

    if (!audioContext || !gainNode || !oscillator) {
      return false
    }

    oscillator.frequency.value = freq

    // ATK
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + attack)

    // SUS + DEC
    gainNode.gain.setValueAtTime(
      1,
      audioContext.currentTime + attack + duration - decay
    )
    gainNode.gain.linearRampToValueAtTime(
      0,
      audioContext.currentTime + attack + duration
    )

    // 在音频播放完成后解析 Promise
    setTimeout(() => {
      resolve(true)
    }, (attack + duration) * 1000)

    return true
  })
}

// 播放字符
async function playMorseChar(char: string) {
  // 计算时长 (1 dash = 3 dots)

  const timeUnit = 1.2 / playWpm.value
  const dotDuration = timeUnit
  const dashDuration = 3 * timeUnit
  const symbolSpace = timeUnit
  const letterSpace = 3 * timeUnit - symbolSpace // 3 units total, minus last symbol space
  const wordSpace = 7 * timeUnit - symbolSpace // 7 units total, minus last symbol space

  const convertedChar = morseCode[char]

  // 单词间隔
  if (convertedChar === " ") {
    await new Promise((resolve) => setTimeout(resolve, wordSpace))
    return
  }

  // 播放字符
  for (let i = 0; i < convertedChar.length; i++) {
    const char = convertedChar[i]

    // 不是点就是杠
    await playSine(playFreq.value, char === "." ? dotDuration : dashDuration)

    await new Promise((resolve) => setTimeout(resolve, symbolSpace * 1000))
  }

  // 字母间隔
  await new Promise((resolve) => setTimeout(resolve, letterSpace * 1000))
}

async function playMorseScript() {
  isPlaying.value = true
  currentIdx.value = 0

  while (currentIdx.value < inputText.value.length && isPlaying.value) {
    let char = inputText.value[currentIdx.value].toUpperCase() // 获取当前大写字符

    if (playShowTextBeforeSound.value) currentIdx.value++

    await playMorseChar(char)

    if (!playShowTextBeforeSound.value) currentIdx.value++
  }

  // 确保最后一个字符显示完整
  if (!isPlaying.value && currentIdx.value === inputText.value.length - 1) {
    currentIdx.value++
  }

  isPlaying.value = false
}

function stopMorseScript() {
  isPlaying.value = false
}
</script>
