<script setup lang="ts">
    import { ref } from 'vue'
    import { GameTypes } from './../GameTypes.js'

    const props = defineProps<{ 
        data: GameDetails
    }>()

    const inspectData = ref<InspectData>({
        inspecting: false,
        show: false,
        image: "",
        name: "",
        description: "",
        points: 0,
        completions: [],
        teamsOnTile: [],
        tileNumber: 0
    })

    defineExpose({
        inspectTile,
        inspectData
    })

    function inspectTile(tile: PositionedTile, extraInformation: any) {
        const completions: Array<TeamTileCompletion> = []
        let teamsOnTile: Array<number> = []
        let tileNumber: number = 0

        if (props.data.details.gameType == GameTypes.STANDARDBINGO || props.data.details.gameType == GameTypes.POINTSBINGO) {
            if (props.data.teamBoards == null) return
            
            for (let i = 0; i < props.data.details.teamCount; i++) {
                const board = props.data.teamBoards[i].board

                if (board == null) continue
                if (board[tile.row] == null) continue
                if (board[tile.row][tile.column] == null) continue
                if (!board[tile.row][tile.column].completed) continue

                const teamTile = board[tile.row][tile.column]

                const completion: TeamTileCompletion = {
                    name: props.data.details.teams[props.data.teamBoards[i].team].name,
                    partialComplete: teamTile.customValue != -1,
                    pointOffset: props.data.board[tile.row][tile.column].points - teamTile.customValue,
                    screenshot: teamTile.screenshot.startsWith("http") ? teamTile.screenshot : "https://i.imgur.com/rpGJNaE.png"
                }

                completions.push(completion)
            }
        }

        if (props.data.details.gameType == GameTypes.TILERACE) {
            if (extraInformation?.teams != null) {
                teamsOnTile = extraInformation.teams
            }

            if (extraInformation?.tileNumber != null) {
                tileNumber = extraInformation.tileNumber
            }
        }

        inspectData.value = {
            show: true,
            inspecting: true,
            image: tile.image || "https://i.imgur.com/rpGJNaE.png",
            name: tile.name || "Unnamed Tile",
            description: tile.description || "No description",
            points: tile.points,
            completions,
            teamsOnTile,
            tileNumber
        }
    }

    function closeInspect() {
        inspectData.value.inspecting = false
        setTimeout(() => inspectData.value.show = false, 200)
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
    <div :class="{ 'inspect-overlay': true, show: inspectData.inspecting, background: !inspectData.show }" @click="closeInspect">
        <div class="contents">
            <div class="tile-bg">
                <img :src="inspectData.image" class="tile-img">
            </div>
            <span class="name">{{ inspectData.name }}</span>
            <span v-if="inspectData.tileNumber > 0" class="tile-number">Tile #{{ inspectData.tileNumber }}</span>
            <span v-if="data.details.gameType == GameTypes.POINTSBINGO" class="points">{{ inspectData.points }} Points</span>
            <span class="description">{{ inspectData.description }}</span>

            <template v-if="data.details.gameType == GameTypes.STANDARDBINGO || data.details.gameType == GameTypes.POINTSBINGO">
                <span v-if="inspectData.completions.length" class="teams-header">Teams that have completed this tile:</span>
                <span v-else class="teams-header">No teams have completed this tile</span>
                <div class="teams-list">
                    <div v-for="(team, index) in inspectData.completions" :key="`team${index}-completion`" class="team">
                    <span class="team-name">Team {{ team.name }}</span>
                    <span v-if="team.partialComplete">
                        <span class="partial-complete">Partial</span>
                        <span class="partial-complete">-{{ team.pointOffset }} Points</span>
                    </span>
                    <a v-if="team.screenshot.length" :href="team.screenshot" target="_blank" @click.stop="">
                        <img :src="team.screenshot" class="team-screenshot">
                    </a>
                    </div>
                </div>
            </template>
            <template v-else-if="data.details.gameType == GameTypes.TILERACE">
                <span v-if="inspectData.points != 0" class="points">
                    This tile will move the team {{ inspectData.points > 0 ? 'forward' : 'backward' }} {{ Math.abs(inspectData.points) }} tiles upon landing on it.
                </span>
                <span v-if="inspectData.teamsOnTile.length > 0" class="teams-on-tile">
                    <span v-for="(team, index) in inspectData.teamsOnTile" :key="`team-number-${team}`">
                        <span :class="teamNumberToColor(team)">Team {{ data.details.teams[team - 1].name }}</span>{{ index < inspectData.teamsOnTile.length - 1 ? ', ' : '' }}
                        {{ index == inspectData.teamsOnTile.length - 2 ? 'and ' : '' }}
                    </span>
                    {{ inspectData.teamsOnTile.length > 1 ? 'are' : 'is' }} currently working on this tile.
                </span>
                <span v-else-if="inspectData.points == 0" class="teams-on-tile">
                    No teams are currently working on this tile.
                </span>
            </template>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @property --a {
        syntax: '<angle>';
        inherits: false;
        initial-value: 0deg;
    }

    @keyframes border {
        0% {
            --a: 0deg
        }
        100% {
            --a: 360deg
        }
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

        .contents {
            top: 0;
            position: relative;
            transition: top 0.2s ease-in-out;

            width: 100%;
            margin-left: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        &.show {
            opacity: 1;

            .contents {
                top: 20px;
            }
        }

        &.background {
            z-index: -500;
        }

        .tile-bg {
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

        .tile-img {
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

        .name {
            display: block;
            text-align: center;
            margin-top: 10px;
            font-size: 32px;
            color: #7E0BA8;
            font-weight: bold;
        }

        .points {
            display: block;
            text-align: center;
            font-size: 24px;
        }

        .description {
            display: block;
            text-align: center;
            font-size: 18px;
            width: 50%;
            margin: auto;
        }

        .teams-header {
            display: block;
            text-align: center;
            font-size: 14px;
            margin-top: 25px;
        }

        .teams-list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            flex: 0 0 1;
            justify-content: space-around;
            width: 80%;
            margin: auto;

            .team {
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

                .team-name {
                    width: 100%;
                    max-width: 200px;
                    font-size: 20px;
                    text-align: center;
                }

                .partial-complete {
                    width: 100%;
                    max-width: 200px;
                    font-size: 16px;
                    text-align: center;
                    color: #ff1c1c;
                    display: block;
                }

                .team-screenshot {
                    width: 100%;
                    max-width: 200px;
                    max-height: 200px;
                }
            }
        }
    }

    .tile-number {
        display: block;
        text-align: center;
        font-size: 18px;
    }

    .teams-on-tile {
        display: block;
        text-align: center;
        font-size: 18px;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 50px;
    }

    .red {
        color: rgb(185, 28, 0);
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