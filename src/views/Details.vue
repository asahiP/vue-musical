<template>
  <div class="details" ref="details">
    <div v-if="result.length" class="result-container">
      <div class="result-profile">
        <Viewer
          v-if="$store.state.isPortrait"
          :src="(profile.picUrl || profile.coverImgUrl) + `?param=${width}y${width}`"
          :width="width"
        />
        <Viewer
          v-else
          :src="(profile.picUrl || profile.coverImgUrl) + '?param=200y200'"
          :height="200"
        />
        <div class="result-profile-text">
          <p v-text="profile.name" class="result-profile-name"></p>
          <Scroller :customOption="{ scrollerBarStyleY: { background: 'transparent' } }">
            <p v-text="profile.briefDesc || profile.description" class="result-profile-desc"></p>
          </Scroller>
        </div>
      </div>
      <div
        class="result-content"
        v-for="({ name, id, al, ar }, index) in result"
        :key="name + index"
        :data-id="id"
        @click.left="startPlay"
      >
        <span
          v-text="index + 1"
          class="result-content-index"
        ></span>
        <div class="result-content-name">
          <p v-text="name"></p>
        </div>
        <div class="result-content-artist">
          <router-link
            :to="{ name: 'artist', query: { id: artist.id } }"
            v-for="artist in (profile.artists || ar)"
            :key="artist.id + artist.name"
            v-text="artist.name"
          />
        </div>
        <div class="result-content-album">
          <router-link :to="{ name: 'album', query: { id: al.id } }" v-text="al.name"/>
        </div>
        <div
          class="result-content-button"
          :style="{ opacity: player.currentPlayID === id ? 1 : '' }"
        >
          <span
            class="el-icon-video-play"
            style="margin: 0 .7rem; cursor: pointer;"
            v-show="buttonCheck(id)"
          ></span>
          <span
            class="el-icon-video-pause"
            style="margin: 0 .7rem; cursor: pointer;"
            v-show="!buttonCheck(id)"
          ></span>
          <span
            class="el-icon-circle-plus-outline"
            style="margin: 0 .7rem; cursor: pointer;"
          ></span>
        </div>
      </div>
    </div>
    <div v-else style="padding: 2rem;">
      <span class="el-icon-loading unready" v-show="!resultMessage"></span>
      <p
        v-show="resultMessage"
        v-text="resultMessage"
        style="color: rgb(200, 200, 200); text-align: center"
      ></p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Viewer from '@/components/Viewer.vue'
import Scroller from '@/components/Scroller.vue'
import axios from 'axios'

@Component({
  components: {
    Viewer,
    Scroller,
  }
})
export default class Details extends Vue {
  width: number = 0

  profile: any = {}

  result: any[] = []
  resultMessage: string = ''

  getData (id: number | string, type: string): void {
    let api = ''
    let self = this

    switch (type) {
      case 'artist':
        api = '/api/artists'
        break
      case 'album':
        api = '/api/album'
        break
      case 'playlist':
        api = '/api/playlist/detail'
        break
      default:
        this.$message && this.$message({
          message: '无效的接口类型',
          type: 'error'
        })
    }

    axios.get(api, { params: { id } })
      .then(({ data }) => {
        if (type === 'artist') {
          self.profile = data.artist
          self.result = data.hotSongs
        } else if (type === 'album') {
          self.profile = data.album
          self.result = data.songs
        } else if (type === 'playlist') {
          let { tracks, ...profile } = data.playlist
          self.profile = profile
          self.result = tracks
        }
        self.resultMessage = '无法找到相关页面'
      })
      .catch(e => self.resultMessage = '无法找到相关页面')
  }


  @Watch('$route')
  updateResult (newVal?: any): void {
    let { query, name } = this.$route
    let { id } = query

    if (id && name) {
      this.profile = {}
      this.result = []
      this.resultMessage = ''
      this.getData((id as string), name)
    } else {
      this.resultMessage = '无法找到相关页面'
    }

    this.$nextTick(() => {
      (this.$parent as any).setScrollTop(0)
    })
  }

  player: any = {}
  getSongDate: Function = () => {}
  buttonCheck: Function = () => {}

  startPlay (e: MouseEvent): void {
    let types = new Map([
      ['el-icon-video-play', 'play'],
      ['el-icon-video-pause', 'stop'],
      ['el-icon-circle-plus-outline', 'add'],
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
      let { player, getSongDate } = this
      let self = this

      switch (type) {
        case 'play':
          if (player.currentPlayID === id) {
            player.isPaused = false
          } else if (player.playlist.includes(id)) {
            player.play(id)
          } else {
            getSongDate(id)
              .then((val: any) => {
                player.add(val)
                player.play(id)
              })
              .catch((e: any) => self.$message && self.$message({
                message: '获取歌曲数据失败',
                type: 'error'
              }))
          }
          break
        case 'stop':
          player.isPaused = true
          break
        case 'add':
          if (!player.playlist.includes(id)) {
            getSongDate(id)
              .then((val: any) => {
                player.add(val)
                self.$message && self.$message({
                  message: '歌曲已添加',
                  type: 'success'
                })
              })
              .catch((e: any) => self.$message && self.$message({
                message: '获取歌曲数据失败',
                type: 'error'
              }))
          } else {
            self.$message && self.$message({
              message: '歌曲已存在于播放列表',
              type: 'error'
            })
          }
      }
    }
  }

  mounted (): void {
    let self = this
    let getContainerWidth = () => {
      self.width = (self.$refs.details as any).offsetWidth
    }

    window.addEventListener('resize', getContainerWidth.bind(self))

    getContainerWidth()

    this.updateResult()

    this.$nextTick(() => {
      // 获取根实例方法及子组件引用
      self.player = self.$parent.$parent.$refs.player
      self.getSongDate = (self.$parent.$parent as any).getSongDate
      self.buttonCheck = self.player.buttonCheck
    })
  }
}
</script>

<style lang="scss" scoped>
.details {
  width: 80%;
  min-width: 1366px * .8;

  margin: 0 auto;

  @media all and (orientation: portrait) {
    width: 100%;
    min-width: unset;
  }
}

.unready {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  font-size: 2rem;
  color: rgb(200, 200, 200);
}

.result-profile {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: flex-start;

  width: 100%;
  height: 200px;
  overflow: hidden;
  
  margin: 1rem 0;

  @media all and (orientation: portrait) {
    flex-direction: column;
    height: unset;
  }
}

.result-profile-text {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: flex-start;

  flex-grow: 1;
  flex-shrink: 1;

  width: 0;

  margin: 0 2rem;

  @media all and (orientation: portrait) {
    width: 100%;

    margin: 0;
    padding: 1rem;

    box-sizing: border-box;
  }
}

.result-profile-name {
  flex-grow: 1;
  flex-shrink: 0;

  width: 100%;
  overflow: hidden;

  margin: 0 0 .5rem 0;

  font-size: 2.5rem;
  color: rgb(255, 255, 255);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.result-profile-desc {
  padding: 0 1rem 0 0;

  font-size: 1rem;
  color: rgb(153, 153, 153);

  @media all and (orientation: portrait) {
    max-height: 100px;
  }
}

.result-message {
  width: 100%;
  overflow: hidden;

  padding: 1rem 0;

  white-space: nowrap;
  text-overflow: ellipsis;
  color: rgb(200, 200, 200);

  box-sizing: border-box;

  @media all and (orientation: portrait) {
    padding: 1rem;
  }
}

.result-content {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: flex-start;

  padding: 1rem;

  border-bottom: 1px solid rgb(153, 153, 153);

  box-sizing: border-box;

  &:last-child {
    border: unset;
  }
}

.result-content-index {
  flex: 0 0 5%;
  color: rgb(255, 255, 255);
}

.result-content-name {
  flex: 0 0 30%;

  width: 0;

  padding: 0 1rem;

  color: rgb(255, 255, 255);

  @media all and (orientation: portrait) {
    flex: 0 0 35%;
  }
}

.result-content-artist {
  display: flex;
  flex-direction: column;
  flex: 0 0 10%;

  width: 0;

  padding: 0 1rem;

  color: rgb(255, 255, 255);

  @media all and (orientation: portrait) {
    flex: 0 0 20%;
  }

  & a, & a:active, & a:visited {
    width: 100%;
    overflow: hidden;

    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgb(255, 255, 255);
  }

  & a:hover {
    text-decoration: underline;
  }
}

.result-content-album {
  @extend .result-content-artist;

  flex: 0 0 30%;

  width: 0;

  padding: 0 1rem;

  color: rgb(255, 255, 255);

  @media all and (orientation: portrait) {
    display: none;
  }
}

.result-content-button {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: center;

  flex: 0 0 15%;

  width: 0;

  padding: 0 1rem;

  font-size: 2rem;
  color: rgb(200, 200, 200);

  opacity: 0;

  transition: opacity .3s ease-out;

  @media all and (orientation: portrait) {
    flex: 0 0 10%;

    opacity: 1;
  }

  .result-content:hover & {
    opacity: 1;
  }
}
</style>