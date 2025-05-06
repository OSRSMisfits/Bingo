<script setup lang="ts">
  //import Board from './components/Board.vue'
  //import axios from 'axios'
  import { reactive } from 'vue'

  let rawTmp = [["2025-05-02T00:00:00.000Z","","https://cdn.discordapp.com/attachments/771960484534419468/1369165840280457307/image.png?ex=681ade8e&is=68198d0e&hm=6455077cd1c6d7d7996e18495af07db7bb764b497278d40e3cc424b3b501a38a&","https://cdn.discordapp.com/attachments/771960484534419468/1369165872098443336/image.png?ex=681ade95&is=68198d15&hm=0ca3fbc77791cee2296ba5e21f51c545ba7698ef2f5609b89957993402f78fe9&","https://cdn.discordapp.com/attachments/771960484534419468/1369165911822434385/image.png?ex=681ade9f&is=68198d1f&hm=8884acc4a6b15e4835c7c9fd29d771fcf7e6fb30bb7961071ecd1d5303b0b7dd&","https://cdn.discordapp.com/attachments/771960484534419468/1369165938166988880/image.png?ex=681adea5&is=68198d25&hm=423687028683511ec086eef705cebd48b7101e7db3582f6372331ebbb3eb005a&","https://cdn.discordapp.com/attachments/771960484534419468/1369165981729034280/image.png?ex=681adeaf&is=68198d2f&hm=5896ec189403499b19be255908d6ce074c0e2fe65cd022a0d7a022134a698c77&"],["2025-06-01T00:00:00.000Z","","Venator Bow,Get a venator bow","Mega Rare,Get a mega rare","Barrows Set,Finish a barrows set","Ranger Boots,Get rangers","Clue Reward Over 1m,Get a clue reward worth over 1m"],["","","10","20","10","15","5"],["8","","https://cdn.discordapp.com/attachments/771960484534419468/1369167365807280230/image.png?ex=681adff9&is=68198e79&hm=f88ba09e81f8fbf07a023a4b0785e8738e13965a3ce0e7c5fd6325d1a178cf65&","https://cdn.discordapp.com/attachments/771960484534419468/1369167394185941062/image.png?ex=681ae000&is=68198e80&hm=940a5cd64f2b44dd77a9cd6a5033d36123ea63e49308e1d5bda377d2ec4f5b6c&","https://cdn.discordapp.com/attachments/771960484534419468/1369167496514502748/image.png?ex=681ae019&is=68198e99&hm=69d4e006df56a3946e1a7587b830f90ddcdffb7f995d837985428338b3fa712e&","https://cdn.discordapp.com/attachments/771960484534419468/1369167552206606356/image.png?ex=681ae026&is=68198ea6&hm=4f90d62f815f12cfbc0c5e74aa0d1ca1fa876fbc7bea589fd2cf2a8044dd7657&","https://cdn.discordapp.com/attachments/771960484534419468/1369167579851001887/image.png?ex=681ae02c&is=68198eac&hm=e9942730fb04ae49c527470f3d69d7acb3ed8bc1ee40dad0eb4eed4391e839af&"],["player 1,player 2,player 3","Red","Zulrah,Get a zulrah unique","1k Chompies,Kill 1000 chompies","Superiors,Get an imbued heart","Perilous Moons,Get a moons set","Spines,15 Scurrius spines"],["john,james,bob","Blue","5","5","25","10","5"],["bill,tim,timothy,timmy 2 shoes,timmy 3 shoes","Green","https://cdn.discordapp.com/attachments/771960484534419468/1369168261857542225/image.png?ex=681ae0cf&is=68198f4f&hm=98c386045e4ab72faa87af38f8bff8e1d139d07899e2fb4151f6d356aff649fb&","https://cdn.discordapp.com/attachments/771960484534419468/1369168289129042021/image.png?ex=681ae0d6&is=68198f56&hm=3cb95f593af5ba3ac90762ef9b3ddb8bc628734292cd9f571db47ab99c9ba7d1&","https://cdn.discordapp.com/attachments/771960484534419468/1369168314169032734/image.png?ex=681ae0dc&is=68198f5c&hm=c18aca22a8c17d82ba7fdb23766bbf0e0a7582686eaeca11f6939b4314a5efc7&","https://cdn.discordapp.com/attachments/771960484534419468/1369168342107033701/image.png?ex=681ae0e2&is=68198f62&hm=f361bf9f4fe5219ebc152aaf123794c93c9a7ce77f081e7db1467a11bf79b402&","https://cdn.discordapp.com/attachments/771960484534419468/1369168370745872505/image.png?ex=681ae0e9&is=68198f69&hm=9988620d4d982aa0b4e37fb5ad2564e8d1391f485453009f7feee40f0dc76664&"],["player 4,player 5,player 6","Orange","Dfh,Get a dfh","Ward,Complete a ward","Infernal cape,Get an infernal cape","DWH,Get a DWH","Raids set,Complete a raids set"],["player 7,player 8,player 9","Yellow","20","10","5","10","10"],["player 10,player 11,player 12","Purple","https://cdn.discordapp.com/attachments/771960484534419468/1369168695338991687/image.png?ex=681ae136&is=68198fb6&hm=a62e30dd31df43155cf932fc4dfc9e0d386401d94406bb6a8ce2dc6780112dee&","https://cdn.discordapp.com/attachments/771960484534419468/1369168722027085885/image.png?ex=681ae13d&is=68198fbd&hm=8bd9b12ff3bedfd91655436969e66568defc17e7bdc4cdd53e1134e71527db72&","https://cdn.discordapp.com/attachments/771960484534419468/1369168752549040128/image.png?ex=681ae144&is=68198fc4&hm=4a7daf6a43b5ef52d9aeb2229839c513b2d167fa85dbbedbe9bd9d29dd304e6c&","https://cdn.discordapp.com/attachments/771960484534419468/1369168803522678845/image.png?ex=681ae150&is=68198fd0&hm=4024a5888d085e7b2ac10e075b340c9cc00f82aade7459e6bcd40f499ee0d4f4&","https://cdn.discordapp.com/attachments/771960484534419468/1369168832433754163/image.png?ex=681ae157&is=68198fd7&hm=ac3fe1164f04c30c8840664be069e717aad3a4f2e6194c5ff49921787bcbc9c6&"],["player 4,player 5,player 6","White","Nex,Get a Nex unique","GWD hilt,Get a hilt","Elder chaos,Get an elder chaos piece","Vorkath,Get a Vorkath unique","Voidwaker piece,Get a piece of the Voidwaker"],["player 4,player 5,player 6","Black","10","10","5","5","10"],["","","https://cdn.discordapp.com/attachments/771960484534419468/1369169276501622904/image.png?ex=681ae1c1&is=68199041&hm=a9d59604539757ed7991e627902ca67894c62b3da2393916a44a88be611d7b55&","https://cdn.discordapp.com/attachments/771960484534419468/1369169308248313968/image.png?ex=681ae1c9&is=68199049&hm=a4cf773c339694ac0ba129c733cd6b87881f734a6345c5ebad211cd651457ab9&","https://cdn.discordapp.com/attachments/771960484534419468/1369169333225259008/image.png?ex=681ae1ce&is=6819904e&hm=8f4ae84b04fe88000451c75776af743d66e3ea7948dfa54983b045dc6eb10b68&","https://cdn.discordapp.com/attachments/771960484534419468/1369169364338868224/image.png?ex=681ae1d6&is=68199056&hm=277d547948a10621bb84a964586db3266c9e4963f7c402ba2cefeeb0f016d760&","https://cdn.discordapp.com/attachments/771960484534419468/1369169393388486725/image.png?ex=681ae1dd&is=6819905d&hm=da0128d99618420b126119a927324d765c70062ff4dbdede3773052b4e45ff40&"],["2","","Tzhaar Uniques,3 Tzhaar uniques","Dex / Arcane,Get a dex or arcane","Gauntlet,Get an enhanced weapon seed","Virtus Piece,Get a Virtus piece","Zenytes,Get 2 zenytes"],["5","","10","5","10","10","5"]]

  let data: GameDetails = reactive({
    details: {
      startTime: new Date(),
      endTime: new Date(),
      gameType: 0,
      boardSize: 0,
      teamCount: 0,
      teams: []
    },
    board: [[]]
  })

  // axios.get("https://sheets.googleapis.com/v4/spreadsheets/1WGpralI8D2-hygILGLxCRlrX9RnbRBGKsO8qkovRV4Y/values/B5:M34?key=AIzaSyCMngiAP33V16p4zJV9pccuYGfmtD-vpZA").then(res => {
  //   console.log(JSON.stringify(res.data.values))
  // })

  function buildDetails(raw: Array<Array<string>>) {
    const teamCount = Math.min(parseInt(raw[3][0]), 8)

    const teams = []
    for(let i = 0; i < teamCount; i++) {
      teams.push({
        name: raw[4 + i][1],
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

    console.log(boardSize)

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

  buildDetails(rawTmp)
  buildBoard(rawTmp, data.details)
</script>

<template>
  Test
</template>

<style scoped>

</style>
