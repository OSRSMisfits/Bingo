<script lang="ts" setup>
    import axios from 'axios'
    import { BOARDS } from './Matricies.js'
    import { reactive, inject } from 'vue'

    const props = defineProps<{ 
        data: GameDetails,
        spreadsheet: String,
        apiKey: String
    }>()

    const inspectRef: any = inject('inspectRef')
    const inspectTile = (row: number, column: number) => {
        const tileNumber = tileNumbers[row][column]
        const maxTile = props.data.details.boardSize * props.data.details.boardSize

        if (tileNumber == maxTile) return

        const tile = props.data.board[row][column]

        const positionedTile: PositionedTile = {
            image: tile.image,
            description: tile.description,
            name: tile.name,
            points: tile.points,
            row,
            column
        }

        var teams = []
        for (let i = 1; i <= props.data.details.teams.length; i++) {
            if (teamOnTile(i, tileNumber)) {
                teams.push(i)
            }
        }

        if (inspectRef.value) inspectRef.value.inspectTile(positionedTile, { teams, tileNumber })
    }

    const fetchRolls = () => {
        axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${props.spreadsheet}/values/Data!D38:E300?key=${props.apiKey}`).then(res => {
            updateRolls(res.data.values)
        })
    }

    fetchRolls()
    setInterval(() => fetchRolls(), 60000)

    const standings: TileRaceStandings = reactive({
        teamPositions: [],
        movements: []
    })

    const tileNumbers = BOARDS[props.data.details.boardSize - 1]

    const updateRolls = (raw: Array<Array<string>>) => {
        const positions: Array<number> = []
        const movements: Array<TileRaceMovement> = []

        const maxPosition = props.data.details.boardSize * props.data.details.boardSize

        for (let i = 0; i < props.data.details.teamCount; i++) {
            positions.push(0)
        }

        for (let i = 0; i < raw.length; i++) {
            const team = parseInt(raw[i][0])
            const roll = parseInt(raw[i][1])

            positions[team - 1] += roll
            
            if (positions[team - 1] >= maxPosition) {
                positions[team - 1] = maxPosition
            }

            const tile = tileTeamOn(positions[team - 1])
            const tileMovement = tile?.points ?? 0
            positions[team - 1] += tileMovement

            let win = false
            if (positions[team - 1] == maxPosition) {
                win = true
            }
            
            movements.push({
                team,
                roll,
                newTile: positions[team - 1],
                win,
                tileMovement
            })
        }

        standings.teamPositions = positions
        standings.movements = movements
    }

    const getTileStyle = (rowIndex: number, tileIndex: number) => {
        const totalTiles = props.data.details.boardSize * props.data.details.boardSize
        const tile = tileNumbers[rowIndex][tileIndex]
        let bgColor = Math.round((tile / totalTiles) * 100)

        return `background: rgb(${bgColor},0,${bgColor}); border-color: rgb(${100 - bgColor},0,${100 - bgColor})`
    }

    const getTileClass = (rowIndex: number, tileIndex: number) => {
        const result = { tile: true, wideRight: false, wideLeft: false, tallDown: false, tallUp: false }

        const boardSize = props.data.details.boardSize

        // Top triangle
        if (tileIndex + 1 >= rowIndex && tileIndex < boardSize - rowIndex - 1) {
           //result.white = true
           result.wideRight = true
        }

        // Right triangle
        if (rowIndex < tileIndex && rowIndex > boardSize - tileIndex - 2) {
            //result.red = true
            result.tallDown = true
        }

        // Bottom triangle
        if (tileIndex - 1 < rowIndex && tileIndex > boardSize - rowIndex - 1) {
           //result.blue = true
           result.wideLeft = true
        }

        // Left triangle
        if (rowIndex - 1 > tileIndex && rowIndex < boardSize - tileIndex) {
            //result.yellow = true
            result.tallUp = true
        }

        // if (rowIndex == 0 && tileIndex < boardSize - 1) {
        //     result.wideRight = true
        // }

        // if (tileIndex >= boardSize - rowIndex - 1 && tileIndex < rowIndex) {
        //     result.wideRight = true
        // }

        // if (tileIndex == boardSize - 1 && rowIndex < boardSize - 1) {
        //     result.tallDown = true
        // }

        // if (rowIndex > tileIndex && rowIndex < boardSize - tileIndex - 1) {
        //     result.tallDown = true
        // }

        // if (rowIndex > boardSize - tileIndex - 1 && rowIndex <= tileIndex && tileIndex < boardSize - 1) {
        //     result.tallUp = true
        // }

        // if (tileIndex >= rowIndex && tileIndex < boardSize - rowIndex && rowIndex > 0) {
        //     result.wideLeft = true
        // }

        return result
    }

    const teamOnTile = (teamNumber: number, tileNumber: number) => {
        if (teamNumber > standings.teamPositions.length)
            return false

        if (standings.teamPositions[teamNumber - 1] == tileNumber)
            return true

        return false
    }

    const tileTeamOn = (tileNumber: number) => {
        for (let i = 0; i < tileNumbers.length; i++) {
            for (let j = 0; j < tileNumbers[i].length; j++) {
                if (tileNumbers[i][j] == tileNumber) return props.data.board[i][j]
            }
        }
    }

    function teamInfo(teamNumber: number) {
        return props.data.details.teams[teamNumber - 1]
    }

    function getMemberIcon(name: string) {
        if (props.data.userData == null) return null

        if (name.toLowerCase() == "ellyii") {
            return "Goblin"
        }

        let member = props.data.userData.members.find(x => x.name == name.toLowerCase().replace("_", " ").replace("-", " "))

        return member?.role
    }

    function getMemberIconImg(name: string) {
        const role = getMemberIcon(name)

        if (role == null) return ""

        let adjustedRole = role.charAt(0).toUpperCase() + role.slice(1)

        switch(adjustedRole) {
            case "Tzkal":
                adjustedRole = "TzKal"; break
            case "Tztok":
                adjustedRole = "TzTok"; break
            case "Short_green_guy":
                adjustedRole = "Short_Green_Guy"; break
            default: break
        }

        return `https://oldschool.runescape.wiki/images/Clan_icon_-_${adjustedRole}.png`
    }

    function getIronmanIcon(name: string) {
        if (props.data.userData == null) return ""

        let member = props.data.userData.members.find(x => x.name == name.toLowerCase().replace("_", " ").replace("-", " "))

        if (member == null) return ""

        switch(member.type) {
            case "ironman":
                return `https://oldschool.runescape.wiki/images/Ironman_chat_badge.png`
            default:
                return ""
        }
    }

    const getDieText = (roll: number) => {
        switch(roll) {
            case 1: return "⚀"
            case 2: return "⚁"
            case 3: return "⚂"
            case 4: return "⚃"
            case 5: return "⚄"
            case 6: return "⚅"
            default: return roll
        }
    }

    function teamNumberToColor(number: number) {
        switch(number) {
            case 1: return { red: true }
            case 2: return { orange: true }
            case 3: return { yellow: true }
            case 4: return { green: true }
            case 5: return { blue: true }
            case 6: return { white: true }
            case 7: return { cyan: true }
            case 8: return { brown: true }
        }
    }
</script>

<template>
    <div class="container">
        <div class="board">
            <div v-for="(row, rowIndex) in data.board" :key="`row${rowIndex}`" class="row">
                <div 
                    v-for="(tile, tileIndex) in row" 
                    :key="`row${rowIndex}-tile${tileIndex}`"
                    @click="inspectTile(rowIndex, tileIndex)"
                    :class="getTileClass(rowIndex, tileIndex)"
                    :style="getTileStyle(rowIndex, tileIndex)"
                >
                    <img :src="tile.image || 'https://i.imgur.com/rpGJNaE.png'">
                    <span class="tile-number">{{ tileNumbers[rowIndex][tileIndex] }}</span>
                    <span class="tile-name">{{ tile.name }}</span>

                    <div class="marker-circles">
                        <div v-if="teamOnTile(1, tileNumbers[rowIndex][tileIndex])" class="marker-circle red"></div>
                        <div v-if="teamOnTile(2, tileNumbers[rowIndex][tileIndex])" class="marker-circle orange"></div>
                        <div v-if="teamOnTile(3, tileNumbers[rowIndex][tileIndex])" class="marker-circle yellow"></div>
                        <div v-if="teamOnTile(4, tileNumbers[rowIndex][tileIndex])" class="marker-circle green"></div>
                        <div v-if="teamOnTile(5, tileNumbers[rowIndex][tileIndex])" class="marker-circle blue"></div>
                        <div v-if="teamOnTile(6, tileNumbers[rowIndex][tileIndex])" class="marker-circle white"></div>
                        <div v-if="teamOnTile(7, tileNumbers[rowIndex][tileIndex])" class="marker-circle cyan"></div>
                        <div v-if="teamOnTile(8, tileNumbers[rowIndex][tileIndex])" class="marker-circle brown"></div>
                    </div>
                </div>
            </div> 
        </div>
        <ul class="log">
            <li 
                v-for="(movement, index) in standings.movements"
                :key="`log-entry-${index}`"
                class="log-entry"
            >
                <div class="left-side">
                    <div class="die">
                        <span>{{ getDieText(movement.roll) }}</span>
                    </div>
                </div>
                <div class="right-side">
                    <strong class="team-name">
                        <span :class="teamNumberToColor(movement.team)">Team {{ teamInfo(movement.team).name }}</span>
                    </strong> 
                    <span class="team-members">
                        <span class="team-member" v-for="(member, mindex) in teamInfo(movement.team).members" :key="`member${mindex}`">
                            <img v-if="getMemberIcon(member)" :src="getMemberIconImg(member)">
                            <img v-if="getIronmanIcon(member)" :src="getIronmanIcon(member)"  style="margin-left:4px">
                            <span>{{ member }}<!-- <span v-if="member == 'Ellyii'"> (Carried)</span> --></span>
                        </span>
                    </span>
                    <br/>
                    <span class="roll-text">
                        <span>Rolled a <strong>{{ movement.roll }}</strong>, Moving them to <strong>Tile {{ movement.newTile - movement.tileMovement }}</strong></span>
                        <div v-if="movement.tileMovement > 0"><strong>Tile {{ movement.newTile - movement.tileMovement }}</strong> caused them to <span class="good">advance</span> <strong>{{ movement.tileMovement }} tiles</strong>!</div>
                        <div v-if="movement.tileMovement < 0"><strong>Tile {{ movement.newTile - movement.tileMovement }}</strong> caused them to <span class="bad">backtrack</span> <strong>{{ -1 * movement.tileMovement }} tiles</strong>!</div>
                        <div v-if="movement.tileMovement != 0">They are now on <strong>Tile {{ movement.newTile }}</strong></div>
                        <div v-if="movement.win" style="color: rgb(224, 224, 0);font-weight:bold">Team {{ teamInfo(movement.team).name }} has finished!</div>
                    </span>
                </div>
            </li>
            <li>Roll Log</li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
    .container {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .board {
        margin-top: 250px;
        margin-left: auto;
        margin-right: auto;

        .row {
            margin: -10px;
        }

        .tile {
            width: 60px;
            height: 60px;
            border: 2px black solid;
            display: inline-block;
            padding: 2px;
            margin-top: 10px;
            margin-bottom: 10px;
            margin-left: 5px;
            margin-right: 5px;
            position: relative;
            cursor: pointer;

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .tile-number {
                position: absolute;
                top: -5px;
                left: 3px;
                text-shadow: 
                    -1px -1px 0px black,
                    1px -1px 0px black,
                    -1px 1px 0px black,
                    1px 1px 0px black;
            }

            .tile-name {
                position: absolute;
                font-size: 10px;
                text-align: center;
                bottom: 0px;
                left: 3px;
                text-shadow: 
                    -1px -1px 0px black,
                    1px -1px 0px black,
                    -1px 1px 0px black,
                    1px 1px 0px black;
            }

            &.wideRight {
                width: 72px;
                margin-right: -7px;
            }

            &.wideLeft {
                width: 72px;
                left: -12px;
                margin-right: -7px;
            }

            &.tallDown {
                height: 72px;
                top: 12px;
                margin-top: -2px;
            }

            &.tallUp {
                height: 72px;
                top: 0px;
                margin-top: -2px;
            }
        }
    }

    .log {
        margin-top: 20px;
        margin-bottom: 40px;
        padding: 0;

        width: 100%;

        display: flex;
        flex-direction: column-reverse;

        list-style: none;
        align-items: center;

        .log-entry {
            width: 400px;
            border: 1px #aaaaaa solid;
            margin-bottom: 5px;
            padding: 5px;
            display: flex;

            .left-side {
                margin-right: 10px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            .die {
                width: 80px;
                height: 80px;
                background: white;
                color: black;
                font-weight: bold;
                font-size: 11.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 5px;
                border: 1px black solid;
                overflow: hidden;

                span {
                    margin-top: -20px;
                }
            }

            .team-name {
                width: 100%;
                text-align: center;
                display: block;
                margin-bottom: 5px;
            }

            .team-members {
                font-size: 14px;
                width: 100%;
                min-height: 5px;
                text-align: center;
                display: block;
                margin-top: -8px;
                margin-bottom: 2px;
            }

            .team-members .team-member {
                margin-left: 5px;
                margin-right: 5px;
                white-space: nowrap;
            }

            .roll-text {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;

                strong {
                    text-decoration: underline;
                }
            }
        }
    }

    .marker-circles {
        position: absolute;
        top: 1px;
        right: 1px;

        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: end;
        width: 48px;
    }

    .marker-circle {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-left: 2px;
        margin-bottom: 2px;
        border: 1px black solid;

        &.red {
            background: rgb(207, 34, 34);
        }

        &.orange {
            background: orange;
        }

        &.yellow {
            background: rgb(231, 231, 8);
        }

        &.green {
            background: green;
        }

        &.blue {
            background: rgb(42, 92, 255);
        }

        &.white {
            background: white;
        }

        &.cyan {
            background: cyan;
        }

        &.brown {
            background: brown;
        }
    }

    .good {
        color: rgb(0, 202, 0);
        font-weight: bold;
    }

    .bad {
        color: red;
        font-weight: bold;
    }

    .red {
        color: rgb(207, 34, 34);
        font-weight: bold;
    }

    .orange {
        color: orange;
        font-weight: bold;
    }

    .yellow {
        color: rgb(231, 231, 8);
        font-weight: bold;
    }

    .green {
        color: green;
        font-weight: bold;
    }

    .blue {
        color: rgb(42, 92, 255);
        font-weight: bold;
    }

    .white {
        color: white;
        font-weight: bold;
    }

    .cyan {
        color: cyan;
        font-weight: bold;
    }

    .brown {
        color: brown;
        font-weight: bold;
    }
</style>