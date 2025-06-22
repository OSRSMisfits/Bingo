<script setup lang="ts">
  import Board from './components/Board.vue'
  import axios from 'axios'
  import { computed, reactive, ref } from 'vue'

  const apiKey = import.meta.env.VITE_API_KEY
  const spreadsheet = import.meta.env.VITE_SPREADSHEET_ID
  const womUserAgent = import.meta.env.VITE_WOM_USER_AGENT

  let data: GameDetails = reactive({
    details: {
      startTime: new Date(),
      endTime: new Date(),
      gameType: 0,
      boardSize: 0,
      teamCount: 0,
      teams: []
    },
    board: [[]],
    teamBoards: [],
    loaded: false,
    userData: null
  })

  // Try to fetch user ranks
  let rawUserData: string | null = localStorage.getItem("womdata")
  try {
    data.userData = JSON.parse(rawUserData ?? "")
  } catch(e) {}

  if (data.userData == null || (new Date().getTime() - new Date(data.userData.updated).getTime() > 86400000)) {
    axios.get(
      `https://api.wiseoldman.net/v2/groups/${import.meta.env.VITE_WOM_GROUP_ID}`,
      { headers: { "User-Agent-Is": womUserAgent } }
    ).then(res => {
      buildMembers(res.data.memberships)
    })
  }

  function buildMembers(members: Array<WOMRawMembership>) {
    data.userData = {
      updated: new Date(),
      members: new Array<Member>
    }

    for (let i = 0; i < members.length; i++) {
      const member = {
        name: members[i].player.username,
        id: members[i].playerId,
        type: members[i].player.type,
        role: members[i].role
      }

      data.userData.members.push(member)
    }

    localStorage.setItem("womdata", JSON.stringify(data.userData))
  }

  // Fetch board data
  axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}/values/Data!B5:N34?key=${apiKey}`).then(res => {
    buildDetails(res.data.values)
    buildBoard(res.data.values, data.details)

    updateTimer()
    setInterval(updateTimer, 10000)

    const fetchStandings = () => {
      const endRange = `N${36 + (data.details.teamCount * 10)}`
      axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}/values/Data!D37:${endRange}?key=${apiKey}`).then(res => {
        buildStandings(res.data.values, data.details, data.board)
      })
    }

    fetchStandings()
    setInterval(() => fetchStandings(), 60000)
  })

  function buildDetails(raw: Array<Array<string>>) {
    const teamCount = Math.min(parseInt(raw[3][0]), 8)

    const teams = []
    for(let i = 0; i < teamCount; i++) {
      const teamName = raw[4 + i][1]

      teams.push({
        name: teamName.length > 0 ? teamName : `${i + 1}`,
        members: raw[4 + i][0].split(",")
      })
    }

    data.details = {
      startTime: new Date(raw[0][0]),
      endTime: new Date(raw[1][0]),
      gameType: parseInt(raw[13][0]),
      boardSize: Math.min(parseInt(raw[14][0]), 10),
      teamCount: teamCount,
      teams: teams
    }
  }

  function buildBoard(raw: Array<Array<string>>, details: BoardDetails) {
    const boardSize = details.boardSize
    const board: Array<Array<Tile>> = []

    for (let row = 0; row < boardSize; row++) {
      const builtRow: Array<Tile> = []

      for (let column = 0; column < boardSize; column++) {
        const nameAndDesc = raw[1 + (row * 3)][2 + column]
        const splitNameAndDesc = nameAndDesc.split(/,(.*)/s)

        const tile: Tile = {
          image: raw[row * 3][2 + column],
          name: splitNameAndDesc[0],
          description: splitNameAndDesc[1],
          points: parseInt(raw[2 + (row * 3)][2 + column]) || 0
        }

        builtRow.push(tile)
      }

      board.push(builtRow)
    }

    data.board = board
  }

  function buildStandings(raw: Array<Array<string>>, details: BoardDetails, board: Array<Array<Tile>>) {
    const boardSize = details.boardSize
    const teamBoards: Array<TeamBoard> = []

    for (let i = 0; i < details.teamCount; i++) {
      const teamBoard: TeamBoard = {
        team: i,
        points: 0,
        standing: -1,
        board: []
      }

      for (let row = 0; row < boardSize; row++) {
        const builtRow: Array<TeamTile> = []

        if (raw[row + (10 * i)].length)

        for (let column = 0; column < boardSize; column++) {
          const tile: TeamTile = {
            completed: raw[row + (10 * i)][column]?.length > 0 || false,
            screenshot: raw[row + (10 * i)][column] || ""
          }

          if (tile.completed) {
            teamBoard.points += board[row][column].points
          }

          builtRow.push(tile)
        }

        teamBoard.board.push(builtRow)
      }

      teamBoards.push(teamBoard)
    }

    teamBoards.sort((a, b) => {
      return b.points - a.points
    })

    for (let i = 0; i < details.teamCount; i++) {
      teamBoards[i].standing = i + 1
    }

    data.teamBoards = teamBoards

    data.loaded = true
  }

  let timerPercent = ref(0)

  const updateTimer = () => {
    const start = data.details.startTime.getTime()
    const now = new Date().getTime()
    const end = data.details.endTime.getTime()

    if (start > now) {
      timerPercent.value = 0
      return;
    }

    timerPercent.value = Math.min(((now - start) / (end - start)) * 100, 100)
  }

  function getMonth(month: number) {
    switch(month) {
      case 0:  return "January"
      case 1:  return "February"
      case 2:  return "March"
      case 3:  return "April"
      case 4:  return "May"
      case 5:  return "June"
      case 6:  return "July"
      case 7:  return "August"
      case 8:  return "September"
      case 9: return "October"
      case 10: return "November"
      case 11: return "December"
    }
  }

  function startDay() {
    return data.details.startTime.getDate().toString().padStart(2, "0")
  }

  function startMonth() {
    const month = data.details.startTime.getMonth()

    return getMonth(month)
  }

  function startTime() {
    const hours = data.details.startTime.getHours().toString().padStart(2, "0")
    const minutes = data.details.startTime.getMinutes().toString().padStart(2, "0")

    return `${hours}:${minutes}`
  }

  function endDay() {
    return data.details.endTime.getDate().toString().padStart(2, "0")
  }

  function endMonth() {
    const month = data.details.endTime.getMonth()

    return getMonth(month)
  }

  function endTime() {
    const hours = data.details.endTime.getHours().toString().padStart(2, "0")
    const minutes = data.details.endTime.getMinutes().toString().padStart(2, "0")

    return `${hours}:${minutes}`
  }

  
  const inspectData = ref<InspectData>({
    inspecting: false,
    show: false,
    image: "",
    name: "",
    description: "",
    points: 0,
    completions: []
  })

  function inspectTile(tile: PositionedTile) {
    const completions: Array<TeamTileCompletion> = []
    
    for (let i = 0; i < data.details.teamCount; i++) {
      const board = data.teamBoards[i].board

      if (board == null) continue
      if (board[tile.row] == null) continue
      if (board[tile.row][tile.column] == null) continue
      if (!board[tile.row][tile.column].completed) continue

      const teamTile = board[tile.row][tile.column]

      const completion: TeamTileCompletion = {
        name: data.details.teams[data.teamBoards[i].team].name,
        screenshot: teamTile.screenshot.startsWith("http") ? teamTile.screenshot : "https://i.imgur.com/rpGJNaE.png"
      }

      completions.push(completion)
    }

    inspectData.value = {
      show: true,
      inspecting: true,
      image: tile.image || "https://i.imgur.com/rpGJNaE.png",
      name: tile.name || "Unnamed Tile",
      description: tile.description || "No description",
      points: tile.points,
      completions
    }
  }

  function closeInspect() {
    inspectData.value.inspecting = false
    setTimeout(() => inspectData.value.show = false, 200)
  }

  function mobile() {
    return window.innerWidth <= 1400
  }

  let currentTime = ref(new Date())
  let timerLoaded = ref(false)
  const startsInInterval = setInterval(() => { 
    currentTime.value = new Date()

    if (timerLoaded) timerLoaded.value = true

    if (!renderStartsIn && !renderEndsIn) {
      clearInterval(startsInInterval)
    }
  }, 1000)

  function calcTime(diff: number) {
    const days: number = Math.floor(diff / 86400)
    const afterDays: number = diff % 86400

    const hours: number = Math.floor(afterDays / 3600)
    const afterHours: number = afterDays % 3600

    const minutes: number = Math.floor(afterHours / 60)
    const seconds: number = afterHours % 60

    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  const renderStartsIn = computed(() => {
    return data.details.startTime > currentTime.value
  })

  const startsInTime = computed(() => {
    const diff: number = Math.floor((data.details.startTime.getTime() - currentTime.value.getTime()) / 1000)

    return calcTime(diff)
  })

  const renderEndsIn = computed(() => {
    return data.details.endTime.getTime() < (currentTime.value.getTime() + 86400000)
  })

  const endsInTime = computed(() => {
    const diff: number = Math.floor((data.details.endTime.getTime() - currentTime.value.getTime()) / 1000)

    return calcTime(diff);
  })

  const renderEnded = computed(() => {
    return data.details.endTime < currentTime.value
  })

  const renderRules = ref(false)
  const showRules = ref(false)

  function openRules() {
    if (inspectData.value.inspecting) return

    renderRules.value = true
    showRules.value = true
  }

  function closeRules() {
    renderRules.value = false
    setTimeout(() => showRules.value = false, 200)
  }

  function moveRules() {
    return window.innerWidth <= 725
  }
</script>

<template>
  <div class="top">
    <div class="top-bar">
      <div class="contents">
        <div class="text" style="text-align: right;">Misfits</div>
        <div class="logo">
          <img src="/misfits-logo.png">
        </div>
        <div class="text">Bingo</div>
      </div>
    </div>

    <div class="timer">
      <div class="timer-progress">
        <div class="bar" :style="`width: ${timerPercent}%`"></div>
      </div>
      <div class="timer-cap timer-start">
        <div class="contents">
          <span>Start</span>
          <span class="day">{{ startDay() }}</span>
          <span>{{ startMonth() }}</span>
          <span>{{ startTime() }}</span>
        </div>
      </div>
      <div class="timer-cap timer-end">
        <div class="contents">
          <span>End</span>
          <span class="day">{{ endDay() }}</span>
          <span>{{ endMonth() }}</span>
          <span>{{ endTime() }}</span>
        </div>
      </div>
    </div>
  </div>

  <div :class="{ 'inspect-overlay': true, show: inspectData.inspecting, background: !inspectData.show }" @click="closeInspect">
    <div class="contents">
      <div class="tile-bg">
        <img :src="inspectData.image" class="tile-img">
      </div>
      <span class="name">{{ inspectData.name }}</span>
      <span v-if="data.details.gameType == 2" class="points">{{ inspectData.points }} Points</span>
      <span class="description">{{ inspectData.description }}</span>
      <span v-if="inspectData.completions.length" class="teams-header">Teams that have completed this tile:</span>
      <span v-else class="teams-header">No teams have completed this tile</span>
      <div class="teams-list">
        <div v-for="(team, index) in inspectData.completions" :key="`team${index}-completion`" class="team">
          <span class="team-name">Team {{ team.name }}</span>
          <a v-if="team.screenshot.length" :href="team.screenshot" target="_blank" @click.stop="">
            <img :src="team.screenshot" class="team-screenshot">
          </a>
        </div>
      </div>
    </div>
  </div>

  <div :class="{ 'rules-button': true, 'move': moveRules() }" @click="openRules()">Rules</div>
  <div :class="{ 'rules-overlay': true, show: renderRules, background: !showRules }" @click="closeRules">
    <ul class="rules-list">
      <li class="rule">You will be allowed to use up to 2 accounts for this competition. For example, You have an ironman that I’ve already completed the content/boss that is needed for said tile. You can use the other account to complete the tile. However, multi-logging the same content is not allowed. You cannot be using two separate accounts at the same time trying to get tiles done. This will result in disqualification from bingo.</li>
      <li class="rule">There will be a secret code released when the event starts that must be in all screenshots for them to count. There is a plugin for Wise Old Man that I would highly recommend installing if you do not have it already. This plugin has a section where you insert the codeword and it will stay on screen. This is not needed but very nice to have so you don't have to remember to input the code before taking every screenshot. If the code is not in the screenshot. The drop will not count towards updating your board. “Clan Events” plug-in can also be used.</li>
      <li class="rule">You can run content with other teams and still mark off tiles on your bingo card. For example, Player A is on Team 1 and Player B is on Team 2. They end up doing some type of content together. Player A pulls the drop. Player B can claim the tile completed, but you need a screenshot of you being there with the drop in the chat box. However, If you run content with people from outside of the clan and they pull the drop it does not count</li>
      <li class="rule">Every team will have their own channel in the discord where you can chat about strategies and post drops. You can only use a drop to complete one tile. No drop can be used twice. However, if you repull the same drop it can be used. example: Huey kc 20 - tome, then Huey kc 32- tome you can use both drops.<br/><strong>For tiles like XP gained or Kc. please post a pic of your beginning XP or Kc & ending XP or Kc.</strong></li>
    </ul>
  </div>

  <template v-if="timerLoaded">
    <div v-if="renderStartsIn" class="timer-notice">
      Bingo starts in {{ startsInTime }}
    </div>
    <div v-else-if="renderEnded" class="timer-notice">
      Bingo has ended
    </div>
    <div v-else-if="renderEndsIn" class="timer-notice">
      Bingo ends in {{ endsInTime }}
    </div>
  </template>


  <div v-if="data.loaded" class="boards">
    <template v-if="!mobile()">
      <div v-if="data.details.teamCount == 2">
        <!-- TODO: Only 2 teams -->
      </div>
      <div v-else-if="data.details.teamCount > 2" class="top-boards">
        <Board 
          :board="data.board" 
          :details="data.details"
          :members="data.userData"
          :teamboard="data.teamBoards[1]" 
          :boardid="1"
          @inspect="inspectTile"
          style="padding-top:48px" 
        />
        <Board 
          :board="data.board" 
          :details="data.details" 
          :members="data.userData"
          :teamboard="data.teamBoards[0]" 
          :boardid="0" 
          @inspect="inspectTile"
          style="transform:scale(1.1)" 
        />
        <Board 
          :board="data.board" 
          :details="data.details" 
          :members="data.userData"
          :teamboard="data.teamBoards[2]" 
          :boardid="2"
          @inspect="inspectTile"
          style="padding-top:48px" 
        />
      </div>
      <template v-if="data.details.teamCount > 3">
        <div class="bottom-boards">
          <Board
            v-for="(board, i) in data.teamBoards.slice(3)"
            :key="`board-${i + 3}`"
            :board="data.board" 
            :details="data.details" 
            :members="data.userData"
            :teamboard="board" 
            :boardid="i + 3"
            @inspect="inspectTile"
            style="transform:scale(0.8)" 
          />
        </div>
      </template>
    </template>
    <template v-else>
      <!-- Mobile -->
      <div class="mobile-boards">
          <Board
            v-for="(board, i) in data.teamBoards"
            :key="`board-${i}`"
            :board="data.board" 
            :details="data.details" 
            :members="data.userData"
            :teamboard="board" 
            :boardid="i"
            @inspect="inspectTile"
          />
        </div>
    </template>
  </div>

  <!-- If you're modifying this for your own use, please leave this intact -->
  <span class="attribution">
    Made by RSN: iacto, Discord: left.twix
  </span>
</template>

<style scoped>
  .top {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
  }

  .top-bar {
    width: 100vw;
    height: 70px;
    background: #150223;
    border-bottom: 5px solid #161616;
    display: flex;
    justify-content: center;
  }

  .top-bar .contents {
    text-shadow: 0.5px 2px 1px #9e9e9e;
    margin-top: -8px;
    margin-left: -8px;
    margin-bottom: 150px;
    padding-right: 8px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .top-bar .contents .text {
    font-size: 48px;
    line-height: 65px;
    font-weight: bold;
    width: 150px;
    height: 100px;
  }

  .top-bar .contents .logo {
    width: 250px;
    position: relative;
    top: -65px;
  }

  .top-bar .contents .logo img {
    width: calc(100% - 50px);
    border-radius: 50%;
    border: 5px solid #161616;
    margin-left: 20px;
  }

  .timer {
    background-image: url("https://i.imgur.com/JDwvuI6.jpeg");
    background-size: contain;
    width: calc(100% + 24px);
    height: 100px;
    position: absolute;
    top: 67px;
    left: -16px;
    z-index: -1;
    border-bottom: 5px solid #161616
  }

  .timer .timer-progress {
    height: 100%;
    width: calc(100% - 217px);
    margin-left: 114px;
  }

  .timer .timer-progress div {
    height: 100%;
    background-clip: border-box;
    background: linear-gradient(270deg, rgba(108, 9, 184, 0.5), rgba(47, 4, 80, 0.5));
    border-right: 5px #161616 solid;
    transform: skew(-22deg);
    transition: width 1s ease-in-out;
  }

  .timer .timer-cap {
    position: absolute;
    top: 0;
    left: -19px;
    width: 118px;
    height: 100%;
    background: #cfcfcf;
    transform: skew(-22deg);
    color: #121212;
    text-shadow: 0.5px 0.5px 1px #070707;
    font-weight: bold;
  }

  .timer .timer-start {
    box-shadow: 5px 0px 0px #161616;
  }

  .timer .timer-end {
    box-shadow: -10px 0px 0px #161616;
  }

  .timer .timer-end {
    left: unset;
    right: -19px;
  }

  .timer .timer-cap .contents {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    transform: skew(22deg);
    text-align: center;
    height: 100%;
    margin-top: 2px;
    font-size: 16px;
  }

  .timer .timer-cap.timer-start {
    padding-right: 10px;
  }

  .timer .timer-cap.timer-start .contents {
    margin-left: 25px;
  }

  .timer .timer-cap.timer-end .contents {
    margin-left: unset;
    margin-right: 25px;
  }

  .timer .timer-cap .contents .day {
    font-size: 36px;
    line-height: 20px;
  }

  .inspect-overlay {
    position: fixed;
    top: 172px;
    background: rgba(0, 0, 0, 0.8);
    width: 100%;
    height: 100%;
    left: -16px;
    padding-right: 16px;
    z-index: 500;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  .inspect-overlay .contents {
    top: 0;
    position: relative;
    transition: top 0.2s ease-in-out;

    width: 100%;
    margin-left: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .inspect-overlay.show .contents {
    top: 20px;
  }

  .inspect-overlay.show {
    opacity: 1;
  }

  .inspect-overlay.background {
    z-index: -500;
  }

  @property --a {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }

  .inspect-overlay .tile-bg {
    width: 15%;
    min-width: 150px;
    aspect-ratio: 1;

    position: relative;
    display: block;
    margin: auto;
    border-radius: 5px;

    background: conic-gradient(from var(--a), rgba(0,0,0,0) 0deg, rgba(0,0,0,0) 120deg, #7E0BA8 240deg, rgba(0,0,0,0) 360deg);
    animation: border 4s infinite linear;
    animation-delay: 0ms;
  }

  .inspect-overlay .tile-img {
    width: calc(100% - 35px);
    margin-left: 10px;
    margin-top: 10px;
    aspect-ratio: 1;
    object-fit: contain;
    top: 0;

    padding: 8px;
    border-radius: 5px;
    background: #242424;
  }

  @keyframes border {
    0% {
      --a: 0deg
    }
    100% {
      --a: 360deg
    }
  }

  .inspect-overlay .name {
    display: block;
    text-align: center;
    margin-top: 10px;
    font-size: 32px;
    color: #7E0BA8;
    font-weight: bold;
  }

  .inspect-overlay .points {
    display: block;
    text-align: center;
    font-size: 24px;
  }

  .inspect-overlay .description {
    display: block;
    text-align: center;
    font-size: 18px;
    width: 50%;
    margin: auto;
  }

  .inspect-overlay .teams-header {
    display: block;
    text-align: center;
    font-size: 14px;
    margin-top: 25px;
  }

  .inspect-overlay .teams-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    flex: 0 0 1;
    justify-content: space-around;
    width: 80%;
    margin: auto;
  }

  .inspect-overlay .teams-list .team {
    display: flex;
    flex-direction: column;
    width: 10%;
    min-width: 50px;
    align-self: flex-end;
    border: 2px #8d8d8d solid;
    border-radius: 5px;
    padding-left: 5px;
    padding-right: 5px;
    margin-bottom: 5px;
  }

  .inspect-overlay .teams-list .team .team-name {
    width: 100%;
    max-width: 200px;
    font-size: 20px;
    text-align: center;
  }

  .inspect-overlay .teams-list .team .team-screenshot {
    width: 100%;
    max-width: 200px;
    max-height: 200px;
  }

  .timer-notice {
    position: fixed;
    top: 135px;
    left: -5px;
    height: 0;
    text-align: center;
    z-index: 10000;
    font-size: 20px;
    user-select: none;
    width: 100%;
  }

  .rules-button {
    position: fixed;
    z-index: 10000;
    right: 25px;
    top: 20px;

    height: 25px;
    line-height: 25px;
    padding: 5px 15px;

    background: #460875;
    border: 2px solid #161616;
    border-radius: 5px;

    cursor: pointer;
    transition: background 0.2s ease-in-out;
    user-select: none;
  }

  .rules-button:hover {
    background: #560a91;
  }

  .rules-button.move {
    position: absolute;
    top: 180px;
    background: #161616;
    border: 2px solid #030303;
    z-index: 100;
  }

  .rules-button.move:hover {
    background: #0c0c0c;
  }

  .rules-overlay {
    position: fixed;
    top: 172px;
    background: rgba(0, 0, 0, 0.9);
    width: 100%;
    height: 100%;
    left: -16px;
    padding-right: 16px;
    z-index: 500;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  .rules-overlay .contents {
    top: 0;
    position: relative;
    transition: top 0.2s ease-in-out;

    width: 100%;
    margin-left: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .rules-overlay.show .contents {
    top: 20px;
  }

  .rules-overlay.show {
    opacity: 1;
  }

  .rules-overlay.background {
    z-index: -500;
  }

  .rules-overlay .rules-list {
    width: 50%;
    margin-left: 25%;
    height: calc(90% - 200px);
    overflow-y: auto;
  }

  .rules-overlay .rules-list .rule {
    margin-top: 40px;
  }

  .boards {
    position: absolute;
    left: -4px;
    width: 100%;
  }

  .top-boards {
    margin-left: 5vw;
    margin-top: 155px;
    width: 90vw;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .top-boards div {
    width: 30%;
  }

  .bottom-boards {
    margin-left: 5vw;
    width: 90vw;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }

  .mobile-boards {
    margin-left: 5%;
    width: 90%;
    margin-top: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .attribution {
    position: fixed;
    bottom: 0;
    left: 5;
    color: rgba(172, 172, 172, 0.8);
    user-select: none;
    pointer-events: none;
  }

  @media only screen and (max-width: 600px) {
    .top-bar .contents {
      padding-left: 10px;
    }

    .top-bar .contents .logo {
      width: 200px;
      top: -45px;
    }

    .top-bar .contents .text {
      font-size: 32px;
    }

    .inspect-overlay {
      left: -8px;
    }
    
    .timer-notice {
      font-size: 16px;
    }
  }

  @media only screen and (max-width: 400px) {
    .top-bar .contents .logo {
      width: 200px;
      top: -45px;
    }

    .top-bar .contents .text {
      font-size: 24px;
    }

    .timer-notice {
      font-size: 12px;
    }
  }
</style>
