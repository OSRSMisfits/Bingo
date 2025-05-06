/// <reference types="vite/client" />

interface GameDetails {
    details: BoardDetails,
    board: Array<Array<Tile>>
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