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
            <li class="rule">You will be allowed to use up to 2 accounts for this competition. For example, You have an ironman that I’ve already completed the content/boss that is needed for said tile. You can use the other account to complete the tile. However, multi-logging the same content is not allowed. You cannot be using two separate accounts at the same time trying to get tiles done. This will result in disqualification from bingo.</li>
            <li class="rule">There will be a secret code released when the event starts that must be in all screenshots for them to count. There is a plugin for Wise Old Man that I would highly recommend installing if you do not have it already. This plugin has a section where you insert the codeword and it will stay on screen. This is not needed but very nice to have so you don't have to remember to input the code before taking every screenshot. If the code is not in the screenshot. The drop will not count towards updating your board. “Clan Events” plug-in can also be used.</li>
            <li class="rule">You may run content with members of other teams and still make progress on your bingo card. If the drop is pulled by a teammate: Your team receives full credit for the tile. However, If the drop is pulled by another team: Your team can still claim the tile as completed, but you will receive 5 fewer points than the team that pulled the drop. This tile will be marked with a red logo on your board (instead of the standard purple) to show that full points were not awarded. However, If your team later pulls the same drop with one of your own members, you will be awarded the remaining 5 points, and the tile logo will be changed to purple. You must provide a screenshot showing that you were present when the drop occurred. This includes your name and the drop in the chat box. Drops pulled by players outside the clan do not count toward tile completion or points.</li>
            <li class="rule">Every team will have their own channel in the discord where you can chat about strategies and post drops. You can only use a drop to complete one tile. No drop can be used twice. However, if you repull the same drop it can be used. example: Huey kc 20 - tome, then Huey kc 32- tome you can use both drops.<br/><strong>For tiles like XP gained or Kc. please post a pic of your beginning XP or Kc & ending XP or Kc.</strong></li>
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