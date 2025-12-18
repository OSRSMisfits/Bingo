<script setup lang="ts">
    import { ref, inject } from 'vue'

    const inspectRef: any = inject('inspectRef')

    const renderRules = ref(false)
    const showRules = ref(false)

    function openRules() {
        if (inspectRef?.value?.inspectData?.inspecting) return

        renderRules.value = true
        showRules.value = true
    }

    function closeRules() {
        renderRules.value = false
        setTimeout(() => showRules.value = false, 200)
    }

    function moveRules() {
        return window.innerWidth <= 725
    }
</script>

<template>
    <div :class="{ 'rules-button': true, 'move': moveRules() }" @click="openRules()">Rules</div>

    <div :class="{ 'rules-overlay': true, show: renderRules, background: !showRules }" @click="closeRules">
        <ol class="rules-list">
            <li class="rule">All Teams will start the Tile Race on the start tile rolling the dice in the discord bot channel according to the team they are put on. After rolling the dice your team moves to said tile. You must complete said tile before you can roll the dice and move ahead once again. There must be a screenshot posted to the discord channel of your team for the tile to be completed. If your team gets moved back or forward to tiles they have already finished. You MUST do that tile again. (Sorry about your luck, it’s a game, have fun.) Your team will travel across the board ending at the finish line to win the race. All teams must finish the very last tile to win.</li>
            <li class="rule">You will be allowed to use multiple accounts for this race for example I have an ironman that I’ve already completed the content on a tile that my ironman no longer needs. I can log into my Main account and work on said tile. Same works for any alt accounts. The only exception to this rule is multi-logging the same content. If you are caught multi-logging the same content, you will be banned from the tile race with no refund to a buy in.</li>
            <li class="rule">There will be a Secret Code released when the event starts that must be in all screenshots for them to count. There is a plugin for Wise Old Man that I would highly recommend installing if you have not already that will keep the Secret Code on the screen along with the date and time. This is not needed but very nice to have so you don’t have to remember to input the Code every time you get a drop. If the code is not in the screenshot. The screenshot will not count towards updating your board and continuing to the next tile.</li>
            <li class="rule">If your team rolls a tile and goes dry on completing the tile for 24 hours. You have the option to get 50 Last Man Standing points between your members. (before and after screenshots of points for each person contributing) Doing this will not give you a new dice roll, but instead you will be allowed to choose to move ahead one tile or back one tile.</li>
        </ol>
  </div>
</template>

<style lang="scss" scoped>
    .rules-button {
        position: fixed;
        z-index: 10000;
        right: 25px;
        top: 20px;

        height: 25px;
        line-height: 25px;
        padding: 5px 15px;

        background: #460875;
        border: 2px solid #161616;
        border-radius: 5px;

        cursor: pointer;
        transition: background 0.2s ease-in-out;
        user-select: none;

        &:hover {
            background: #560a91;
        }

        &.move {
            position: absolute;
            top: 180px;
            background: #161616;
            border: 2px solid #030303;
            z-index: 100;

            &:hover {
                background: #0c0c0c;
            }
        }
    }

    .rules-overlay {
        position: fixed;
        top: 172px;
        background: rgba(0, 0, 0, 0.9);
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

        .rules-list {
            width: 50%;
            margin-left: 25%;
            height: calc(90% - 200px);
            overflow-y: auto;
        }

        .rules-list {
            .rule {
                margin-top: 40px;
            }
        }
    }
</style>