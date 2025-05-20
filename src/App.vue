<script setup lang="ts">
  import Board from './components/Board.vue'
  import axios from 'axios'
  import { reactive, ref } from 'vue'

  const apiKey = import.meta.env.VITE_API_KEY
  const spreadsheet = import.meta.env.VITE_SPREADSHEET_ID

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
    loaded: false
  })

  axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}/values/B5:N34?key=${apiKey}`).then(res => {
    buildDetails(res.data.values)
    buildBoard(res.data.values, data.details)

    updateTimer()
    setInterval(updateTimer, 10000)

    const fetchStandings = () => {
      const endRange = `N${36 + (data.details.teamCount * 10)}`
      axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}/values/D37:${endRange}?key=${apiKey}`).then(res => {
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
        screenshot: teamTile.screenshot.startsWith("http") ? teamTile.screenshot : ""
      }

      completions.push(completion)
    }

    inspectData.value = {
      show: true,
      inspecting: true,
      image: tile.image,
      name: tile.name,
      description: tile.description,
      points: tile.points,
      completions
    }
  }

  function closeInspect() {
    inspectData.value.inspecting = false
    setTimeout(() => inspectData.value.show = false, 200)
  }

  function mobile() {
    return window.innerWidth > 1400
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
      <img :src="inspectData.image" class="tile-img">
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

  <div v-if="data.loaded" class="boards">
    <template v-if="mobile()">
      <div v-if="data.details.teamCount == 2">
        <!-- TODO: Only 2 teams -->
      </div>
      <div v-else-if="data.details.teamCount > 2" class="top-boards">
        <Board 
          :board="data.board" 
          :details="data.details" 
          :teamboard="data.teamBoards[1]" 
          :boardid="1"
          @inspect="inspectTile"
          style="padding-top:48px" 
        />
        <Board 
          :board="data.board" 
          :details="data.details" 
          :teamboard="data.teamBoards[0]" 
          :boardid="0" 
          @inspect="inspectTile"
          style="transform:scale(1.1)" 
        />
        <Board 
          :board="data.board" 
          :details="data.details" 
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
            :teamboard="board" 
            :boardid="i"
            @inspect="inspectTile"
          />
        </div>
    </template>
  </div>
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
    width: calc(100% - 209px);
    margin-left: 105px;
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
    box-shadow: -5px 0px 0px #161616;
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
    margin-left: 10px;
    font-size: 16px;
  }

  .timer .timer-cap.timer-end .contents {
    margin-left: unset;
    margin-right: 10px;
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

  .inspect-overlay .tile-img {
    width: 15%;
    top: 0;
    position: relative;
    display: block;
    margin: auto;

    padding: 8px;
    border-radius: 5px;
    background: conic-gradient(from var(--a), rgba(0,0,0,0) 0deg, rgba(0,0,0,0) 120deg, #7E0BA8 240deg, rgba(0,0,0,0) 360deg);
    animation: border 4s infinite linear;
    animation-delay: 0ms;
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
  }

  .inspect-overlay .teams-list .team .team-name {
    width: 100%;
    max-width: 200px;
    text-align: center;
  }

  .inspect-overlay .teams-list .team .team-screenshot {
    width: 100%;
    max-width: 200px;
    max-height: 200px;
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
    width: 25%;
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

  @media only screen and (max-width: 600px) {
    .top-bar .contents {
      padding-left: 10px;
    }

    .top-bar .contents .logo {
      width: 200px;
      top: -45px;
    }

    .top-bar .contents .text {
      font-size: 32px !important;
    }

    .inspect-overlay {
      left: -8px;
    }
  }
</style>
