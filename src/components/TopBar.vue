<script setup lang="ts">
    import { computed, ref, watch } from 'vue'

    const props = defineProps<{ 
        data: GameDetails
    }>()

    let timerPercent = ref(0)

    const updateTimer = () => {
        const start = props.data.details.startTime.getTime()
        const now = new Date().getTime()
        const end = props.data.details.endTime.getTime()

        if (start > now) {
            timerPercent.value = 0
            return
        }

        timerPercent.value = Math.min(((now - start) / (end - start)) * 100, 100)
    }

    watch(props.data, async () => {
        updateTimer()
    })

    setInterval(updateTimer, 10000)

    function getMonth(month: number) {
        switch(month) {
            case 0:  return "Jan."
            case 1:  return "Feb."
            case 2:  return "March"
            case 3:  return "April"
            case 4:  return "May"
            case 5:  return "June"
            case 6:  return "July"
            case 7:  return "Aug."
            case 8:  return "Sept."
            case 9: return "Oct."
            case 10: return "Nov."
            case 11: return "Dec."
        }
    }

    function startDay() {
        return props.data.details.startTime.getDate().toString().padStart(2, "0")
    }

    function startMonth() {
        const month = props.data.details.startTime.getMonth()

        return getMonth(month)
    }

    function startTime() {
        const hours = props.data.details.startTime.getHours().toString().padStart(2, "0")
        const minutes = props.data.details.startTime.getMinutes().toString().padStart(2, "0")

        return `${hours}:${minutes}`
    }

    function endDay() {
        return props.data.details.endTime.getDate().toString().padStart(2, "0")
    }

    function endMonth() {
        const month = props.data.details.endTime.getMonth()

        return getMonth(month)
    }

    function endTime() {
        const hours = props.data.details.endTime.getHours().toString().padStart(2, "0")
        const minutes = props.data.details.endTime.getMinutes().toString().padStart(2, "0")

        return `${hours}:${minutes}`
    }

    let currentTime = ref(new Date())
    let timerLoaded = ref(false)
    const startsInInterval = setInterval(() => { 
        currentTime.value = new Date()

        if (timerLoaded) timerLoaded.value = true

        if (!renderStartsIn && !renderEndsIn) {
            clearInterval(startsInInterval)
        }
    }, 1000)

    function calcTime(diff: number) {
        const days: number = Math.floor(diff / 86400)
        const afterDays: number = diff % 86400

        const hours: number = Math.floor(afterDays / 3600)
        const afterHours: number = afterDays % 3600

        const minutes: number = Math.floor(afterHours / 60)
        const seconds: number = afterHours % 60

        return `${days}d ${hours}h ${minutes}m ${seconds}s`
    }

    const renderStartsIn = computed(() => {
        return props.data.details.startTime > currentTime.value
    })

    const startsInTime = computed(() => {
        const diff: number = Math.floor((props.data.details.startTime.getTime() - currentTime.value.getTime()) / 1000)

        return calcTime(diff)
    })

    const renderEndsIn = computed(() => {
        return props.data.details.endTime.getTime() < (currentTime.value.getTime() + 86400000)
    })

    const endsInTime = computed(() => {
        const diff: number = Math.floor((props.data.details.endTime.getTime() - currentTime.value.getTime()) / 1000)

        return calcTime(diff);
    })

    const renderEnded = computed(() => {
        return props.data.details.endTime < currentTime.value
    })
</script>

<template>
    <div class="top">
        <div class="top-bar">
            <div class="contents">
                <div class="text" style="text-align: right;">Misfits</div>
                    <div class="logo">
                        <img src="/misfits-pvm.png">
                        <!-- <img src="https://i.imgur.com/bzm3a7H.png"> -->
                    </div>
                <div class="text">Bingo</div>
            </div>
        </div>

        <div class="timer">
            <div class="timer-progress">
                <div class="bar" :style="`width: ${timerPercent}%`"></div>
            </div>
            <div class="timer-cap timer-start">
                <div class="contents">
                <span>Start</span>
                <span class="day">{{ startDay() }}</span>
                <span>{{ startMonth() }}</span>
                <span>{{ startTime() }}</span>
                </div>
            </div>
            <div class="timer-cap timer-end">
                <div class="contents">
                <span>End</span>
                <span class="day">{{ endDay() }}</span>
                <span>{{ endMonth() }}</span>
                <span>{{ endTime() }}</span>
                </div>
            </div>
        </div>
    </div>

    <template v-if="timerLoaded">
        <div v-if="renderStartsIn" class="timer-notice">
            Event starts in {{ startsInTime }}
        </div>
        <div v-else-if="renderEnded" class="timer-notice">
            Event has ended
        </div>
        <div v-else-if="renderEndsIn" class="timer-notice">
            Event ends in {{ endsInTime }}
        </div>
  </template>
</template>

<style lang="scss" scoped>
    .top {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 1000;
    }

    .top-bar {
        width: 100vw;
        height: 70px;
        background: #150223;
        border-bottom: 5px solid #161616;
        display: flex;
        justify-content: center;

        .contents {
            text-shadow: 0.5px 2px 1px #9e9e9e;
            margin-top: -8px;
            margin-left: -8px;
            margin-bottom: 150px;
            padding-right: 8px;
            display: flex;
            flex-direction: row;
            justify-content: center;

            .text {
                font-size: 48px;
                line-height: 65px;
                font-weight: bold;
                width: 150px;
                height: 100px;
                margin-top: 5px;

                text-shadow: 0.5px 2px 1px #481539;
                color: #9C2D7B;
            }

            /*
            .logo {
                width: 250px;
                position: relative;
                top: -65px;
            }
            */

            .logo {
                width: 190px;
                position: relative;
                top: 3px;

                img {
                    width: calc(100% - 50px);
                    border-radius: 50%;
                    border: 5px solid #161616;
                    margin-left: 20px;
                }
            }
        }
    }

    .timer {
        background-image: url("https://i.imgur.com/JDwvuI6.jpeg");
        background-size: contain;
        width: calc(100% + 24px);
        height: 100px;
        position: absolute;
        top: 67px;
        left: -16px;
        z-index: -1;
        border-bottom: 5px solid #161616;

        .timer-progress {
            height: 100%;
            width: calc(100% - 217px);
            margin-left: 114px;

            div {
                height: 100%;
                background-clip: border-box;
                background: linear-gradient(270deg, rgba(108, 9, 184, 0.5), rgba(47, 4, 80, 0.5));
                border-right: 5px #161616 solid;
                transform: skew(-22deg);
                transition: width 1s ease-in-out;
            }
        }

        .timer-cap {
            position: absolute;
            top: 0;
            left: -19px;
            width: 118px;
            height: 100%;
            background: #cfcfcf;
            transform: skew(-22deg);
            color: #121212;
            text-shadow: 0.5px 0.5px 1px #070707;
            font-weight: bold;

            .contents {
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                transform: skew(22deg);
                text-align: center;
                height: 100%;
                margin-top: 2px;
                font-size: 16px;

                .day {
                    font-size: 36px;
                    line-height: 20px;
                }
            }
        }

        .timer-cap.timer-start {
            padding-right: 10px;

            .contents {
                margin-left: 25px;
            }
        }

        .timer-start {
            box-shadow: 5px 0px 0px #161616;
        }

        .timer-cap.timer-end {
            .contents {
                margin-left: unset;
                margin-right: 25px;
            }
        }

        .timer-end {
            box-shadow: -10px 0px 0px #161616;
            left: unset;
            right: -25px;
        }
    }

    .timer-notice {
        position: fixed;
        top: 135px;
        left: -5px;
        height: 0;
        text-align: center;
        z-index: 10000;
        font-size: 20px;
        user-select: none;
        width: 100%;
    }
</style>