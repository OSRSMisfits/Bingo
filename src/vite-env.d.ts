/// <reference types="vite/client" />

interface GameDetails {
    details: BoardDetails,
    board: Array<Array<Tile>>,
    teamBoards: Array<TeamBoard>,
    loaded: boolean
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
    screenshot: string
}