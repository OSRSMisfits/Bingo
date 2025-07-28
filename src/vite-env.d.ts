/// <reference types="vite/client" />

interface GameDetails {
    details: BoardDetails,
    board: Array<Array<Tile>>,
    teamBoards: Array<TeamBoard>,
    loaded: boolean,
    userData: MembersStorage | null
}

interface BoardDetails {
    startTime: Date,
    endTime: Date,
    gameType: number,
    boardSize: number,
    teamCount: number,
    teams: Array<Team>
}

interface Team {
    name: string,
    members: Array<string>
}

interface Tile {
    image: string,
    name: string,
    description: string,
    points: number
}

interface PositionedTile extends Tile {
    row: number,
    column: number
}

interface TeamBoard {
    team: number,
    points: number,
    standing: number,
    board: Array<Array<TeamTile>>
}

interface TeamTile {
    completed: boolean,
    customValue: number,
    screenshot: string
}

interface FullTile {
    tile: Tile,
    teamTile: TeamTile
}

interface InspectData {
    inspecting: boolean,
    show: boolean,
    image: string,
    name: string,
    description: string,
    points: number,
    completions: Array<TeamTileCompletion>
}

interface TeamTileCompletion {
    name: string,
    partialComplete: boolean,
    pointOffset: number,
    screenshot: string
}

interface WOMRawMembership {
    playerId: number,
    role: string,
    player: WOMRawPlayer
}

interface WOMRawPlayer {
    username: string,
    type: string
}

interface MembersStorage {
    members: Array<Member>,
    updated: Date
}

interface Member {
    name: string,
    id: number,
    type: string,
    role: string
}