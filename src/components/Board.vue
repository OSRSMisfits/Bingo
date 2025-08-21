<script setup lang="ts">

const emit = defineEmits(['inspect'])

const props = defineProps<{ 
    board: Array<Array<Tile>>,
    details: BoardDetails,
    members: MembersStorage | null,
    teamboard: TeamBoard,
    boardid: number
}>()

function tileHasCompleteStatus(row: number, column: number) {
    return props.teamboard.board[row][column]?.completed || false
}

function tileCompleted(row: number, column: number) {
    return tileHasCompleteStatus(row, column) && !tilePartiallyCompleted(row, column)
}

function tilePartiallyCompleted(row: number, column: number) {
    if (!tileHasCompleteStatus(row, column))
        return false

    if ((props.teamboard.board[row][column]?.customValue || -1) > -1) {
        return true
    }
}

function standingSuper() {
    if (props.teamboard.standing == 1) {
        return "st"
    }
    if (props.teamboard.standing == 2) {
        return "nd"
    }
    if (props.teamboard.standing == 3) {
        return "rd"
    }
    if (props.teamboard.standing > 3) {
        return "th"
    }
}

function standingClass() {
    if (props.teamboard.standing == 1) {
        return { standing: true, first: true }
    }
    if (props.teamboard.standing == 2) {
        return { standing: true, second: true }
    }
    if (props.teamboard.standing == 3) {
        return { standing: true, third: true }
    }

    return { standing: true }
}

function teamInfo() {
    return props.details.teams[props.teamboard.team]
}

function getMemberIcon(name: string) {
    if (props.members == null) return null

    if (name.toLowerCase() == "ellyii") {
        return "Goblin"
    }

    let member = props.members.members.find(x => x.name == name.toLowerCase().replace("_", " ").replace("-", " "))

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
    if (props.members == null) return ""

    let member = props.members.members.find(x => x.name == name.toLowerCase().replace("_", " ").replace("-", " "))

    if (member == null) return ""

    switch(member.type) {
        case "ironman":
            return `https://oldschool.runescape.wiki/images/Ironman_chat_badge.png`
        default:
            return ""
    }
}

function emitInspect(tile: Tile, row: number, column: number) {
    const posTile: PositionedTile = {
        image: tile.image,
        name: tile.name,
        description: tile.description,
        points: tile.points,
        row,
        column
    }

    emit('inspect', posTile)
}

</script>

<template>
    <div class="container">
        <div class="info">
            <span :class="standingClass()">
                {{ teamboard.standing }}<sup>{{ standingSuper() }}</sup>
            </span>
            <span class="team-points">
                {{ teamboard.points }} Points
            </span>
            <span class="team-name">
                Team {{ teamInfo().name }}
            </span>
            <span class="team-members">
                <span class="team-member" v-for="(member, index) in teamInfo().members" :key="`${boardid}-member${index}`">
                    <img v-if="getMemberIcon(member)" :src="getMemberIconImg(member)">
                    <img v-if="getIronmanIcon(member)" :src="getIronmanIcon(member)"  style="margin-left:4px">
                    <span>{{ member }}<span v-if="member == 'Ellyii'"> (Carried)</span></span>
                    
                </span>
            </span>
        </div>
        <div class="board">
            <div v-for="(row, rowIndex) in board" :key="`${boardid}-row${rowIndex}`" class="row">
                <div 
                    v-for="(tile, tileIndex) in row" 
                    :key="`${boardid}-row${rowIndex}-tile${tileIndex}`"
                    :class="{ tile: true, completed: tileCompleted(rowIndex, tileIndex), partcompleted: tilePartiallyCompleted(rowIndex, tileIndex) }"
                    @click="emitInspect(tile, rowIndex, tileIndex)"
                >
                    <img :src="tile.image || 'https://i.imgur.com/rpGJNaE.png'">
                </div>
            </div> 
        </div>
    </div>
</template>

<style scoped>
    .container {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 500px;
    }

    .info .standing {
        font-size: 48px;
        font-weight: 800;
        width: 100%;
        text-align: center;
        display: block;
    }

    .info .standing.first {
        color: transparent;
        background: var(--gold-gradient);
        background-clip: text;
    }

    .info .standing.second {
        color: transparent;
        background: var(--silver-gradient);
        background-clip: text;
    }

    .info .standing.third {
        color: transparent;
        background: var(--bronze-gradient);
        background-clip: text;
    }

    .info .standing sup {
        position: relative;
        top: 3px;
        font-weight: 500;
        background: inherit
    }

    .info .standing.first sup::after {
        background: var(--gold-gradient);
    }

    .info .standing.second sup::after {
        background: var(--silver-gradient);
    }

    .info .standing.third sup::after {
        background: var(--bronze-gradient);
    }

    .info .standing sup::after {
        content: '';
        height: 2px;
        width: 100%;
        display: block;
        position: absolute;
        background-clip: border-box;
        background: #dbdbdb;
        top: 45px;
        left: 0px;
    }

    .info .team-points {
        font-size: 16px;
        width: 100%;
        text-align: center;
        display: block;
        margin-top: -10px;
    }

    .info .team-name {
        font-size: 24px;
        font-weight: bold;
        width: 100%;
        text-align: center;
        display: block;
        margin-top: -12px;
    }

    .info .team-members {
        font-size: 14px;
        width: 100%;
        min-height: 5px;
        text-align: center;
        display: block;
        margin-top: -8px;
        margin-bottom: 2px;
    }

    .info .team-members .team-member {
        margin-left: 5px;
        margin-right: 5px;
        white-space: nowrap;
    }

    .info .team-members .team-member img {
        position: relative;
        top: 1px;
    }

    .board {
        background: #111111;
        padding-top: 4px;
        padding-right: 4px;
    }

    .board .row {
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: space-around;
        margin-bottom: -3px;
    }

    .board .tile {
        width: auto;
        aspect-ratio: 1;
        margin-left: 5px;
        margin-right: 5px;
        flex: 1 1 0px;
        cursor: pointer;

        display: inline-block;
    }

    .board .tile img {
        width: 100%;
        aspect-ratio: 1;
        border: 3px solid #c7c7c7;
        background: #242424;
        object-fit: contain;
    }

    .board .tile.completed img {
        border-color: #7E0BA8;
        opacity: 0.5;
    }

    .board .tile.partcompleted img {
        border-color: #ff1c1c;
        opacity: 0.5;
    }

    .board .tile.completed {
        position: relative;
    }

    .board .tile.partcompleted {
        position: relative;
    }

    .board .tile.completed::after {
        content: '';
        background-image: url("/misfits-logo-alt.png");
        width: 105%;
        aspect-ratio: 1;
        display: block;
        position: absolute;
        background-size: contain;
        background-repeat: no-repeat;
        margin-top: -90%;
        margin-left: 1.5%;
    }

    .board .tile.partcompleted::after {
        content: '';
        background-image: url("/misfits-logo-alt-red.png");
        width: 105%;
        aspect-ratio: 1;
        display: block;
        position: absolute;
        background-size: contain;
        background-repeat: no-repeat;
        margin-top: -90%;
        margin-left: 1.5%;
    }
</style>
