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
            <li class="rule">All screenshots must include the phrase word that will be given once the event starts. If the phrase isn’t in the screenshot. The drop does not count.  Code Word: Will be released once the bingo begins and updated here 🙂</li>
            <li class="rule">You are allowed to use multiple accounts to participate (e.g. using your main to work on a tile your iron has unlocked already or isn't able to do), however you are only allowed to use a single account at any given time. Usage of alts is not allowed in any way (i.e. Doloing, Resupplying, Energy transfer, etc.) and will get you disqualified from the event. Using services to buy faster kills from other players is also strictly forbidden.</li>
            <li class="rule">Content can be done across teams. If another team pulls a purple at a raid for example. Just screenshot with the item pulled and phrase word, showing that you were there for the drop. The player that pulls the drop MUST be a member of the clan for the drop to count.</li>
            <li class="rule">Everyone participating in Bingo will receive promotion points.</li>
            <li class="rule">If your team pulls a pet after completing the pet tile, every pet pulled after that can be used to instantly finish a tile.</li>
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