<template>
  <div
    class="player-container"
    :style="{
      height: isExpanded ? '100%' : '',
      position: !playlist.length ? 'absolute' : '',
      visibility: !playlist.length ? 'hidden' : '',
      opacity: !playlist.length ? 0 : '',
    }"
  >
    <div
      class="player-main"
      :style="{
        position: !isExpanded ? 'absolute' : '',
        visibility: !isExpanded ? 'hidden' : '',
        opacity: !isExpanded ? 0 : 1,
      }"
    >
      <div class="player-play-list">
        <div class="player-play-list-container" @click.left="listEvent">
          <Scroller
            :customOption="{
              scrollerBarStyleX: { background: 'transparent' },
              scrollerBarStyleY: { background: 'transparent' },
            }"
            ref="scroller"
          >
          <div
            class="player-play-list-content"
            v-for="({ id, name, singer, album }, index) of playlist2View"
            :key="id + index + name"
            :data-id="id"
          >
            <p
              class="player-play-list-index"
              v-text="index + 1"
            ></p>
            <div class="player-play-list-name">
              <p
                v-text="name" :style="{
                  flex: '0 1 70%',

                  width: 0,
                  overflow: 'hidden',

                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  boxSizing: 'border-box',
                }"
                title="歌曲名"
              ></p>
              <div
                class="player-play-list-button"
                :style="{ opacity: currentPlayID === id ? 1 : '' }"
              >
                <span
                  :class="[
                    'iconfont',
                    'player-button',
                    { 'icon-start': buttonCheck(id) },
                    { 'icon-stop': !buttonCheck(id) },
                  ]"
                  style="font-size: 1rem"
                  :title="MainButtonTitle(buttonCheck(id))"
                ></span>
                <span
                  class="iconfont icon-delete player-button"
                  style="font-size: 1rem"
                  title="删除"
                ></span>
              </div>
            </div>
            <router-link
              class="player-play-list-singer"
              :to="{ name: 'artist', query: { id: singer.id } }"
              v-text="singer.name"
              title="歌手"
            />
            <router-link
              class="player-play-list-album"
              :to="{ name: 'album', query: { id: album.id } }"
              v-text="album.name"
              title="专辑"
            />
          </div>
          </Scroller>
        </div>
      </div>
      <div class="player-lyrics">
        <div
          :style="{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,

            width: '90%',
            height: '90%',
            overflow: 'hidden',

            margin: 'auto',
          }"
          ref="lyrContainer"
        >
          <div :style="lyricsStyle" ref="lyrContent">
            <p v-if="!currentSong.lyr.length">暂无歌词</p>
            <p
              v-for="{ time, lyr, index } in currentSong.lyr"
              :key="time + index"
              v-text="lyr"
              :class="{ 'player-lyr-active': currentLyrIndex === index }"
            ></p>
          </div>
        </div>
      </div>
    </div>
    <div
      class="player-handle"
      :style="{
        position: isExpanded ? 'relative' : ''
      }"
    >
      <img
        :src="currentSong.album.img"
        alt="avatar"
        width="80"
        height="80"
        @click.left="isExpanded = !isExpanded"
        style="cursor: pointer"
        title="专辑封面"
      >
      <div class="player-handle-button-main">
        <span
          class="iconfont icon-prev player-button"
          style="font-size: 2rem"
          @click.left="cut(-1)"
          title="上一首"
        ></span>
        <span
          :class="[
            'iconfont',
            'player-button',
            { 'icon-start': isPaused },
            { 'icon-stop': !isPaused },
          ]"
          style="font-size: 2rem"
          @click.left="isPaused = !isPaused"
          :title="MainButtonTitle()"
        ></span>
        <span
          class="iconfont icon-next player-button"
          style="font-size: 2rem"
          @click.left="cut(1)"
          title="下一首"
        ></span>
      </div>
      <div>
        <p v-text="currentSong.name" class="player-handle-textarea-name" title="歌曲名"></p>
        <p v-text="currentSong.singer.name" class="player-handle-textarea-singer" style="margin: .4rem 0" title="歌手"></p>
      </div>
      <div class="player-button-mobile">
        <span
          :class="[
            'iconfont',
            'player-button',
            { 'icon-start': isPaused },
            { 'icon-stop': !isPaused },
          ]"
          style="font-size: 2rem"
          @click.left="isPaused = !isPaused"
          :title="MainButtonTitle()"
        ></span>
      </div>
      <div class="player-handle-button-sub">
        <span
          class="iconfont icon-play-list player-button"
          @click.left="isExpanded = !isExpanded"
          title="播放列表"
        ></span>
        <span
          :class="[
            'iconfont',
            'player-button',
            { 'icon-list-loop': currentLoopType === 'listLoop' },
            { 'icon-loop': currentLoopType === 'loop' },
            { 'icon-random': currentLoopType === 'random' },
          ]"
          :title="LoopButtonTitle"
          @click.left="triggerLoopType"
        ></span>
        <div class="player-handle-volume">
          <span
            :class="[
              'iconfont',
              'player-button',
              'icon-volume',
              { 'icon-mute': isMuted || !volume },
            ]"
            @click.left="isMuted = !volume ? isMuted : !isMuted"
            title="静音"
          ></span>
          <div class="player-handle-volume-bar" ref="volumeBar" @mousedown.left="volumeSliderMouseDown">
            <div :style="volumeCurrentBarStyle"></div>
            <span class="player-handle-slider" :style="volumeSliderStyle"></span>
          </div>
        </div>
      </div>
      <p class="player-handle-timestamp" v-text="
        `${second2minute(currentTime)} / ${second2minute(duration)}`
      "></p>
      <div class="player-handle-bar" ref="timeStampBar" @mousedown.left="timeStampSliderMouseDown">
        <div :style="timeStampStyle"></div>
        <span class="player-handle-slider" :style="timeStampSliderStyle"></span>
      </div>
    </div>
    <audio
      preload="metadata"
      :src="currentSong.src"
      ref="player"
    ></audio>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Scroller from './Scroller.vue'
import '@/assets/iconfont/iconfont.css'

import axios from 'axios'

interface ISongData {
  id: number,
  name: string,
  singer: ISinger,
  album: IAlbum,
  src: string,
  lyr: any[],
  lyrStatus: ILyrStatus,
}

interface IAlbum {
  id: number,
  name: string,
  img: string,
}

interface ISinger {
  id: number,
  name: string,
}

interface ILyrStatus {
  isGetting: boolean,
  getCount: number,
}

@Component({
  components: {
    Scroller,
  }
})
export default class Player extends Vue {
  isMuted: boolean = false
  isPaused: boolean = true

  volumeBarWidth: number = 0
  volumeSliderLeft: number = 0

  setVolumeSliderLeft (newVal: number): void {
    let { volumeBarWidth } = this
    let self = this

    window.requestAnimationFrame(() => {
      self.volumeSliderLeft = Math.min(
        Math.max(
          -6.4,
          newVal
        ),
        volumeBarWidth
      )
    })
  }

  get volumeSliderStyle (): any {
    let { volumeSliderLeft } = this

    return {
      transform: `translate3d(${Math.round(volumeSliderLeft)}px, 0, 0)`
    }
  }

  get volumeCurrentBarStyle (): any {
    let { volumeSliderLeft } = this

    return {
      position: 'absolute',

      width: `${Math.round(volumeSliderLeft + 6.4)}px`,
      height: '100%',

      background: 'rgb(255, 255, 255)',
    }
  }

  get volume (): number {
    let { volumeSliderLeft, volumeBarWidth } = this
    let { player }: any = this.$refs
    let currentVolume = parseFloat(
      ((volumeSliderLeft + 6.4) / (volumeBarWidth + 6.4)).toFixed(2)
    )

    if (player) player.volume = currentVolume
    
    return currentVolume
  }

  startMousePositionX: number = 0

  startSliderLeft: number = 0
  isVolumeSliderEventActive: boolean = false

  volumeSliderMouseDown (e: MouseEvent): void {
    let { volumeBar }: any = this.$refs
    let { x } = volumeBar.getClientRects()[0]
    let { pageX } = e
    let left = pageX - x - 6.4

    this.startSliderLeft = left
    this.setVolumeSliderLeft(left)
    this.isVolumeSliderEventActive = true
    this.startMousePositionX = pageX
  }

  volumeSliderMouseMove (e: MouseEvent): void {
    let { isVolumeSliderEventActive } = this
    if (isVolumeSliderEventActive) {
      let { pageX } = e
      let { startMousePositionX, startSliderLeft } = this
      let distance = pageX - startMousePositionX
  
      this.setVolumeSliderLeft(startSliderLeft + distance)
    }
  }
  timeStampBarWidth: number = 0
  timeStampSliderLeft: number = 0

  setTimeStampSliderLeft (newVal: number): void {
    let { timeStampBarWidth } = this
    let self = this

    window.requestAnimationFrame(() => {
      self.timeStampSliderLeft = Math.min(
        Math.max(
          0,
          newVal
        ),
        timeStampBarWidth
      )
    })
  }

  get timeStampStyle (): any {
    let { timeStampSliderLeft } = this

    return {
      width: `${Math.round(timeStampSliderLeft)}px`,
      height: '100%',

      background: 'rgb(200, 0, 0)',
    }
  }

  get timeStampSliderStyle (): any {
    let { timeStampSliderLeft, timeStampBarWidth } = this

    timeStampSliderLeft = Math.min(
      Math.max(
        timeStampSliderLeft,
        0
      ),
      timeStampBarWidth - 12.8
    )

    return {
      transform: `translate3d(${Math.round(timeStampSliderLeft)}px, 0, 0)`,
    }
  }

  isTimeStampSliderEventActive: boolean = false

  timeStampSliderMouseDown (e: MouseEvent): void {
    let { timeStampBar, player }: any = this.$refs
    let { x } = timeStampBar.getClientRects()[0]
    let { pageX } = e
    let left = pageX - x

    this.startSliderLeft = left
    this.startMousePositionX = pageX
    this.isTimeStampSliderEventActive = true
    this.isPaused = true

    this.setTimeStampSliderLeft(left)
    this.syncCurrentTime(left)

    if (player) player.currentTime = this.currentTime
  }

  timeStampSliderMouseMove (e: MouseEvent): void {
    let { isTimeStampSliderEventActive } = this
    if (isTimeStampSliderEventActive) {
      let { pageX } = e
      let { startMousePositionX, startSliderLeft } = this
      let distance = pageX - startMousePositionX
  
      this.setTimeStampSliderLeft(startSliderLeft + distance)
      this.syncCurrentTime()
    }
  }

  @Watch('isVolumeSliderEventActive')
  @Watch('isTimeStampSliderEventActive')
  triggerUserSelect (): void {
    let { isVolumeSliderEventActive, isTimeStampSliderEventActive } = this
    document.body.style.userSelect = isVolumeSliderEventActive || isTimeStampSliderEventActive
      ? 'none'
      : ''
  }

  currentLoopType: string = 'listLoop'

  triggerLoopType (): void {
    let { currentLoopType } = this

    switch (currentLoopType) {
      case 'listLoop':
        this.currentLoopType = 'loop'
        break
      case 'loop':
        this.currentLoopType = 'random'
        break
      case 'random':
        this.currentLoopType = 'listLoop'
    }
  }

  @Watch('isPaused')
  triggerPlayStatus (newVal: boolean): void {
    let { player }: any = this.$refs

    if (newVal) {
      player.pause()
    } else {
      let self = this
      player.play()
        .catch((e: any) => {
          self.isPaused = true
          self.$message && self.$message({
            message: '歌曲无法播放',
            type: 'error',
          })
        })
    }
  }

  @Watch('isMuted')
  triggerMuteStatus (newVal: boolean): void {
    let { player }: any = this.$refs

    player.muted = newVal
  }

  currentTime: number = 0
  duration: number = 0

  second2minute (second: number): string {
    let minu: number | string = Math.floor(second / 60)
    let sec: number | string = Math.floor(second % 60)

    minu = minu > 9 ? minu : `0${minu}`
    sec = sec > 9 ? sec : `0${sec}`

    return `${minu}:${sec}`
  }

  minute2second (minute: string): number {
    let seconds = minute.split(/\s?:\s?/)
      .map(str => parseInt(str))

    return Math.floor(
      (seconds[0] * 60 || 0)
      + (seconds[1] || 0)
      + (seconds[2] / 1000 || 0)
    )
  }

  syncTimeStampSliderLeft (): void {
    let { currentTime, duration, timeStampBarWidth, setTimeStampSliderLeft } = this

    setTimeStampSliderLeft(
      currentTime / duration * timeStampBarWidth
    )
  }

  syncCurrentTime (sliderLeft?: number): void {
    let { timeStampBarWidth, timeStampSliderLeft, duration } = this

    timeStampSliderLeft = sliderLeft || timeStampSliderLeft

    this.currentTime = timeStampSliderLeft / timeStampBarWidth * duration
  }

  isExpanded: boolean = false

  async getLyr (id: number | string): Promise<any[]> {
    let self = this
    return new Promise((res, rej) => {
      axios.get('/api/lyric', { params: { id } })
        .then(response => {
          if (response.data.lrc) {
            let { lrc } = response.data
            let lyr = lrc.lyric.split(/\r|\n/g)
  
            lyr = lyr
              .map((item: string, index: number) => {
                let time = 0
                let lyr = item.replace(/\[.+\]/gi, fragment => {
                  time = self.minute2second(fragment.slice(1, -1))
          
                  return ''
                })
          
                return { time, lyr }
              })
              .filter(({ lyr }: any) => lyr)
              .sort(({ time: timeA }: any, { time: timeB }: any) => (
                timeA - timeB
              ))
              .map((lyr: any, index: number) => ({ ...lyr, index }))
              res(lyr)
          } else {
            rej('获取歌词数据失败')
          }
        })
        .catch(e => rej('获取歌词数据失败'))
    })
  }

  currentLyrIndex: number = -1

  syncLyrIndex (): void {
    let { currentSong, currentTime } = this
    let { lyr: lyrics } = currentSong
    let { length } = lyrics

    if (length > 0) {
      // 近似数排序
      lyrics = lyrics.concat().sort(({ time: timeA }, { time: timeB }) => (
        Math.abs(timeA - currentTime) - Math.abs(timeB - currentTime)
      ))
  
      let i = 0
  
      while (lyrics[i].time > currentTime) {
        i++

        if (i >= length) {
          this.currentLyrIndex = -1
          return
        }
      }
  
      this.currentLyrIndex = lyrics[i].index
    } else {
      this.currentLyrIndex = -1
    }
  }

  get lyricsStyle (): any {
    let { lyrContent, lyrContainer }: any = this.$refs
    let { currentLyrIndex, currentSong } = this
    let { length } = currentSong.lyr

    if (lyrContent && lyrContainer) {
      let { offsetHeight } = lyrContent
      let { offsetHeight: containerHeight } = lyrContainer
      let lineHeight = offsetHeight / length
      let containerLength = Math.floor(containerHeight / lineHeight) || 0
      let skipLength = Math.floor(containerLength / 2)

      currentLyrIndex = Math.min(
        Math.max(
          currentLyrIndex - skipLength,
          0
        ),
        length - containerLength
      )

      // xxx: 修复无法获取高度导致的位移，修复方法有待商权
      let translateY = Math.min(
        Math.floor(currentLyrIndex * lineHeight) * -1,
        0
      )

      return {
        transform: `translate3d(0, ${translateY}px, 0)`,
        transition: 'transform .4s ease-out'
      }
    }

    return ''
  }

  // MapLike <songID, ISongData>
  songDatas: any = {}
  currentPlayID: number = Infinity

  playlist: number[] = []

  get playlist2View (): ISongData[] {
    return this.playlist.map((id: number) => this.getSongData(id))
  }

  play (id?: number): void {
    let { player }: any = this.$refs
    let self = this
    
    player.currentTime = 0

    if (id) this.currentPlayID = id

    this.$nextTick(() => {
      player.play()
        .then(() => {
          self.isPaused = false
        })
        .catch((e: any) => self.$message && self.$message({
          message: '歌曲无法播放',
          type: 'error',
        }))
    })
  }

  add (song: ISongData): void {
    let { id } = song

    if (!this.playlist.includes(id)) {
      this.playlist.push(id)

      Vue.set(this.songDatas, id, song)
    } else {
      this.$message && this.$message({
        message: '歌曲已存在于播放列表',
        type: 'error'
      })
    }
  }

  async remove (id: number): Promise<void> {
    return new Promise((res, rej) => {
      let targetIndex = this.playlist.indexOf(id)
  
      if (targetIndex >= 0) {
        this.playlist.splice(targetIndex, 1)
        Vue.delete(this.songDatas, id)

        this.$nextTick(res)
      } else {
        rej('无效的id')
      }
    })
  }

  getSongData (id: number): ISongData {
    return this.songDatas[id]
      || {
        id: 0,
        name: 'name',
        singer: {
          id: 0,
          name: 'singer',
        },
        album: {
          id: 0,
          name: 'name',
          img: 'img',
        },
        src: 'src',
        lyr: [],
        lyrStatus: {
          isGetting: false,
          getCount: 0,
        }
      }
  }

  get currentSong (): ISongData {
    let { currentPlayID, getSongData } = this

    return getSongData(currentPlayID)
  }

  listEvent (e: MouseEvent): void {
    let types = new Map([
      ['icon-start', 'play'],
      ['icon-stop', 'stop'],
      ['icon-delete', 'delete'],
      ['player-play-list-singer', 'singer'],
      ['player-play-list-album', 'album'],
    ])

    let target: any = e.target
    let id = 0
    let type: any

    while (target.parentNode) {
      let { className } = target

      className.split(/\s/)
        .forEach((className: string) => {
          if (types.has(className)) type = types.get(className)
        })
      
      if (target.hasAttribute('data-id')) id = parseInt(target.getAttribute('data-id'))

      if (id && type) {
        break
      } else {
        target = target.parentNode
      }
    }

    if (id && type) {
      let { play, remove, currentPlayID } = this
      let { scroller }: any = this.$refs
      let height = scroller.contentHeight
      let translateY = scroller.contentScrollTop
      
      switch (type) {
        case 'play':
          if (currentPlayID === id) {
            this.isPaused = false
          } else {
            play(id)
          }
          break
        case 'stop':
          this.isPaused = true
          break
        case 'delete':
          remove(id)
            .then(() => {
              if (id === this.currentPlayID) {
                this.currentPlayID = this.playlist[0]
                this.isPaused = true
              }

              scroller.setTranslateY(
                Math.abs(height - scroller.contentHeight)
                + translateY
              )
            })
          break
        case 'singer':
        case 'album':
          this.isExpanded = false
      }
    }
  }

  @Watch('playlist')
  changeCurrentPlayID (): void {
    if (this.playlist.length > 0 && !isFinite(this.currentPlayID)) {
      this.currentPlayID = this.playlist[0]
    }
  }

  buttonCheck (id: number): boolean {
    let { currentPlayID, isPaused } = this
    let result: boolean

    if (currentPlayID === id) {
      result = isPaused
    } else {
      result = true
    }
    return result
  }

  cut (step: number): void {
    let { playlist, currentPlayID, play } = this
    let { length } = playlist
    let currentIndex = playlist.indexOf(currentPlayID)

    if (currentIndex >= 0) {
      currentIndex += step

      if (currentIndex >= length) {
        currentIndex = 0
      } else if (currentIndex < 0) {
        currentIndex = length - 1
      }

      play(playlist[currentIndex])
    } else {
      this.currentPlayID = Infinity
      this.isPaused = true
    }
  }

  get LoopButtonTitle (): string {
    let { currentLoopType } = this
    let title = ''

    switch (currentLoopType) {
      case 'listLoop':
        title = '列表循环'
        break
      case 'loop':
        title = '单曲循环'
        break
      case 'random':
        title = '随机播放'
    }

    return title
  }

  MainButtonTitle (status?: boolean): string {
    status = status || this.isPaused
    return status
      ? '播放'
      : '暂停'
  }

  mounted (): void {
    let { $nextTick, volumeSliderMouseMove, timeStampSliderMouseMove } = this
    let { volumeBar, timeStampBar, player }: any = this.$refs
    let self = this

    $nextTick(() => {
      let { offsetWidth: volumeBarWidth } = volumeBar
      let { offsetWidth: timeStampBarWidth } = timeStampBar

      self.volumeBarWidth = self.volumeSliderLeft = volumeBarWidth - 6.4
      self.timeStampBarWidth = timeStampBarWidth
      self.timeStampSliderLeft = 0
    })

    window.addEventListener('mousemove', volumeSliderMouseMove.bind(self))
    window.addEventListener('mousemove', timeStampSliderMouseMove.bind(self))
    window.addEventListener('mouseup', () => {
      if (self.isTimeStampSliderEventActive) {
        self.isPaused = false
        player.currentTime = self.currentTime
      }
      self.isVolumeSliderEventActive = false
      self.isTimeStampSliderEventActive = false
    })
    window.addEventListener('resize', () => {
      let { offsetWidth: timeStampBarWidth } = timeStampBar

      self.timeStampBarWidth = timeStampBarWidth
      self.syncTimeStampSliderLeft()
    })

    player.addEventListener('loadedmetadata', () => {
      self.duration = player.duration
    })
    player.addEventListener('timeupdate', () => {
      self.currentTime = player.currentTime
      self.syncLyrIndex()

      if (!self.isTimeStampSliderEventActive) self.syncTimeStampSliderLeft()

      let { currentSong, getLyr } = self
      let { id, lyr, lyrStatus } = currentSong
      let { isGetting, getCount } = lyrStatus

      if (lyr.length === 0 && !isGetting && getCount < 5) {
        currentSong.lyrStatus.isGetting = true

        getLyr(id)
          .then(lyr => {
            currentSong.lyr = lyr
            currentSong.lyrStatus.isGetting = false
          })
          .catch(e => {
            self.$message && self.$message({
              message: '获取歌词数据失败',
              type: 'error',
            })
            setTimeout(() => {
              currentSong.lyrStatus.isGetting = false
            }, 10 * 1000)
            currentSong.lyrStatus.getCount++
          })
      }
    })
    player.addEventListener('stalled', () => {
      self.isPaused = true
    })
    player.addEventListener('error', () => {
      self.isPaused = true
    })
    player.addEventListener('ended', () => {
      let { currentLoopType, playlist, cut, play, currentPlayID } = self
      let { length } = playlist
      let random: number

      switch (currentLoopType) {
        case 'listLoop':
          cut(1)
          break
        case 'random':
          while (playlist[(random = Math.floor(Math.random() * length))] === currentPlayID);
          play(playlist[random])
          break
        case 'loop':
          play()
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.player-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  position: fixed;
  bottom: 0;
  left: 0;

  width: 100%;
  height: 80px;
}

.player-main {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  flex-grow: 1;

  width: 100%;
  height: 100%;

  background: rgba(0, 0, 0, .7);
}

.player-play-list {
  flex: 0 1 70%;

  position: relative;

  width: 100%;
  height: 100%;
  overflow: hidden;

  @media all and (orientation: portrait) {
    position: absolute;
    visibility: hidden;
  }
}

.player-play-list-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  width: 90%;
  height: 90%;
  overflow: hidden;

  margin: auto;
}

.player-play-list-content {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  position: relative;

  padding: 1rem 0;

  &:before {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;

    width: 90%;
    height: 1px;

    margin: auto;

    background: rgb(153, 153, 153);

    content: '';
  }

  &:last-child:before {
    display: none;
  }
}

.player-play-list-index {
  flex: 1 0 5%;

  color: rgb(255, 255, 255);

}

.player-play-list-name {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  flex: 1 1 40%;

  padding: 0 1rem;

  color: rgb(255, 255, 255);
}

.player-play-list-button {
  font-size: 1rem;

  opacity: 0;

  transition: opacity .3s ease;

  .player-play-list-content:hover & {
    opacity: 1;
  }
}

.player-play-list-singer {
  flex: 1 0 20%;

  overflow: hidden;

  padding: 0 1rem;

  color: rgb(255, 255, 255);
  white-space: nowrap;
  text-overflow: ellipsis;
  text-decoration: none;

  box-sizing: border-box;

  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.player-play-list-album {
  flex: 1 0 35%;

  overflow: hidden;

  padding: 0 1rem;

  color: rgb(255, 255, 255);
  white-space: nowrap;
  text-overflow: ellipsis;
  text-decoration: none;

  box-sizing: border-box;

  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.player-lyrics {
  flex: 1 0 30%;

  position: relative;

  width: 100%;
  height: 100%;
  overflow: hidden;
  
  p {
    padding: .7rem 0;

    text-align: center;
    color: rgb(153, 153, 153);
    word-wrap: break-word;
    white-space: pre-wrap;

    transition: all .5s ease-out;
  }

  .player-lyr-active {
    font-size: 1.3rem;
    color: rgb(230, 0, 0);

    text-shadow: 0 0 4px;
  }
}

.player-handle {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;

  position: absolute;
  bottom: 0;
  left: 0;

  width: 100%;
  height: 80px;

  background: rgba(0, 0, 0, .7);
}

.player-handle-textarea-name {
  width: 550px;
  overflow: hidden;

  font-size: 1.4rem;
  color: rgb(255, 255, 255);

  white-space: nowrap;
  text-overflow: ellipsis;

  @media all and (orientation: portrait) {
    max-width: 180px;
  }
}

.player-handle-textarea-singer {
  width: 550px;
  overflow: hidden;

  color: rgb(153, 153, 153);

  white-space: nowrap;
  text-overflow: ellipsis;

  @media all and (orientation: portrait) {
    max-width: 180px;
  }
}

.player-handle-timestamp {
  position: relative;
  top: .5rem;
  right: 1rem;

  margin: 0 0 auto auto;

  color: rgb(102, 102, 102);
  white-space: nowrap;

  @media all and (orientation: portrait) {
    position: absolute;
    visibility: hidden;
  }
}

.player-handle-bar {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: .2rem;

  background: rgb(20, 20, 20);

  cursor: pointer;
}

.player-handle-slider {
  position: absolute;
  top: -.3rem;
  left: 0;

  width: .8rem;
  height: .8rem;

  border-radius: 50%;

  background: rgb(255, 255, 255);

  opacity: 0;

  transition: opacity .3s ease;

  .player-handle:hover & {
    opacity: 1;
  }

  @media all and (orientation: portrait) {
    visibility: hidden;
  }
}

.player-handle-button-main {
  @media all and (orientation: portrait) {
    width: .7rem;

    visibility: hidden;
  }
}

.player-handle-button-sub {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  @media all and (orientation: portrait) {
    position: absolute;
    visibility: hidden;
  }
}

.player-handle-volume {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  width: 1.5rem + 1rem + 1.4rem + 10rem;
  height: 1.5rem + 1rem;
}

.player-handle-volume-bar {
  position: relative;
  width: 10rem;
  height: .3rem;

  background: rgba(255, 255, 255, .4);

  cursor: pointer;
}

.player-button {
  margin: 0 .7rem;
  padding: .5rem;

  font-size: 1.5rem;
  color: rgb(255, 255, 255);

  cursor: pointer;
}

.player-button-mobile {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  
  position: absolute;
  visibility: hidden;

  @media all and (orientation: portrait) {
    position: unset;
    visibility: visible;
  }
}
</style>