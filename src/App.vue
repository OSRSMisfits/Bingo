<script setup lang="ts">
    import TopBar from './components/TopBar.vue'
    import Inspect from './components/Inspect.vue'
    import Rules from './components/Rules.vue'
    import Bingo from './components/Games/Bingo/Bingo.vue'
    import TileRace from './components/Games/TileRace/TileRace.vue'
    import axios from 'axios'
    import { GameTypes } from './GameTypes.js'
    import { reactive, ref, provide } from 'vue'

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
        userData: null,
        teamBoards: []
    })

    const dataLoaded = ref(false)

    const inspectRef = ref<typeof Inspect | null>(null)
    provide('inspectRef', inspectRef)

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
        dataLoaded.value = true
    }
</script>

<template>
    <TopBar :data="data" />

    <Inspect ref="inspectRef" :data="data" />

    <Rules />
    
    <template v-if="dataLoaded">
        <Bingo 
            v-if="data.details.gameType == GameTypes.STANDARDBINGO || data.details.gameType == GameTypes.POINTSBINGO"
            :data="data" 
            :spreadsheet="spreadsheet" 
            :api-key="apiKey"
        />

        <TileRace
            v-if="data.details.gameType == GameTypes.TILERACE"
            :data="data" 
            :spreadsheet="spreadsheet" 
            :api-key="apiKey"
        />
    </template>

    <!-- If you're modifying this for your own use, please leave this intact -->
    <span class="attribution">
        Made by RSN: iacto, Discord: left.twix
    </span>
</template>

<style lang="scss" scoped>
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

        /* .top-bar .contents .logo {
            width: 200px;
            top: -45px;
        } */

        .top-bar .contents .logo {
            width: 150px;
            top: 7px;
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
        .top-bar .contents .text {
            font-size: 24px;
        }

        .timer-notice {
            font-size: 12px;
        }
    }
</style>
