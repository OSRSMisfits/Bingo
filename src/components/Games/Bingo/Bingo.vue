<script setup lang="ts">
    import BingoBoard from './BingoBoard.vue'
    import axios from 'axios'
    import { ref, inject } from 'vue'

    const props = defineProps<{ 
        data: GameDetails,
        spreadsheet: String,
        apiKey: String
    }>()

    let teamBoards: Array<TeamBoard> = []
    const loaded = ref(false)

    const inspectRef: any = inject('inspectRef')
    const inspectTile = (tile: PositionedTile) => {
        if (inspectRef.value) inspectRef.value.inspectTile(tile)
    }

    const fetchStandings = () => {
        const endRange = `N${36 + (props.data.details.teamCount * 10)}`
        axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${props.spreadsheet}/values/Data!D37:${endRange}?key=${props.apiKey}`).then(res => {
            buildStandings(res.data.values, props.data.details, props.data.board)
        })
    }

    fetchStandings()
    setInterval(() => fetchStandings(), 60000)

    function buildStandings(raw: Array<Array<string>>, details: BoardDetails, board: Array<Array<Tile>>) {
        const boardSize = details.boardSize
        const boards: Array<TeamBoard> = []

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
            const rawValue = raw[row + (10 * i)][column] || ""
            const commaSplit = rawValue.split(",")

            const tile: TeamTile = {
                completed: rawValue.length > 0 || false,
                customValue: (commaSplit.length > 1) ? parseInt(commaSplit[0]) : -1,
                screenshot: (commaSplit.length > 1) ? commaSplit[1] : rawValue
            }

            if (tile.completed) {
                if (tile.customValue != -1) {
                teamBoard.points += tile.customValue
                }
                else
                {
                teamBoard.points += board[row][column].points
                }
            }

            builtRow.push(tile)
            }

            teamBoard.board.push(builtRow)
        }

        boards.push(teamBoard)
        }

        boards.sort((a, b) => {
        return b.points - a.points
        })

        for (let i = 0; i < details.teamCount; i++) {
        boards[i].standing = i + 1
        }

        teamBoards = boards

        loaded.value = true
    }

    function mobile() {
        return window.innerWidth <= 1400
    }
</script>

<template>
    <div v-if="loaded" class="boards">
        <template v-if="!mobile()">
        <div v-if="data.details.teamCount == 2">
            <!-- TODO: Only 2 teams -->
        </div>
        <div v-else-if="data.details.teamCount > 2" class="top-boards">
            <BingoBoard 
                :board="data.board" 
                :details="data.details"
                :members="data.userData"
                :teamboard="teamBoards[1]" 
                :boardid="1"
                @inspect="inspectTile"
                style="padding-top:48px" 
            />
            <BingoBoard 
                :board="data.board" 
                :details="data.details" 
                :members="data.userData"
                :teamboard="teamBoards[0]" 
                :boardid="0" 
                @inspect="inspectTile"
                style="transform:scale(1.1)" 
            />
            <BingoBoard 
                :board="data.board" 
                :details="data.details" 
                :members="data.userData"
                :teamboard="teamBoards[2]" 
                :boardid="2"
                @inspect="inspectTile"
                style="padding-top:48px" 
            />
        </div>
        <template v-if="data.details.teamCount > 3">
            <div class="bottom-boards">
            <BingoBoard
                v-for="(board, i) in teamBoards.slice(3)"
                :key="`board-${i + 3}`"
                :board="data.board" 
                :details="data.details" 
                :members="data.userData"
                :teamboard="board" 
                :boardid="i + 3"
                @inspect="inspectTile"
                style="transform:scale(0.9)" 
            />
            </div>
        </template>
        </template>
        <template v-else>
        <!-- Mobile -->
        <div class="mobile-boards">
            <BingoBoard
                v-for="(board, i) in teamBoards"
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
</template>

<style lang="scss" scoped>
    .boards {
        position: absolute;
        left: -4px;
        top: 173px;
        width: 100%;
        overflow-y: scroll;
        height: calc(100vh - 173px);
    }

    .top-boards {
        margin-left: 5vw;
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
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>