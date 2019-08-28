<template>
  <div class="category" ref="category">
    <div class="layout-left-side" @click.left="updateCategory">
      <span
        :class="[
          'category-items',
          { 'category-items-active': name === currentCategory }
        ]"
        v-for="(name, index) in category"
        :key="name + index"
        v-text="name"
        :data-tag="name"
      ></span>
    </div>
    <div class="layout-right-side" v-if="result.length" @click.left="startPlay">
      <div class="category-result-profile">
        <Viewer
          :src="profile.coverImgUrl + `?param=${$store.state.isPortrait ? width : 150}y${$store.state.isPortrait ? width : 150}`"
          :width="$store.state.isPortrait ? width : 150"/>
        <div class="category-result-text">
          <p v-text="profile.name" class="category-result-profile-name"></p>
          <p v-text="profile.description" class="category-result-profile-desc"></p>
        </div>
      </div>
      <div
        class="category-result"
        v-for="({ name, id, al, ar }, index) in result"
        :key="name + id + index"
        :data-id="id"
      >
        <span
          v-text="index + 1"
          class="category-result-index"
        ></span>
        <p v-text="name" class="category-result-name"></p>
        <div class="category-result-artist">
          <router-link
            :to="{ name: 'artist', query: { id: artist.id } }"
            v-for="artist in ar"
            :key="artist.id + artist.name"
            v-text="artist.name"
          />
        </div>
        <router-link
          :to="{ name: 'album', query: { id: al.id } }"
          v-text="al.name"
          v-if="!$store.state.isPortrait"
          class="category-result-album"
        />
        <div
          class="category-result-button"
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
    <div v-else style="width: 100%; padding: 2rem;">
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
import { Vue, Component, Watch } from 'vue-property-decorator'
import Viewer from '@/components/Viewer.vue'
import axios from 'axios'

@Component({
  components: {
    Viewer,
  }
})
export default class Category extends Vue {
  category: any[] = [
    '云音乐新歌榜',
    '云音乐热歌榜',
    '网易原创歌曲榜',
    '云音乐飙升榜',
    '云音乐电音榜',
    'UK排行榜周榜',
    '美国Billboard周榜',
    'KTV嗨榜',
    'iTunes榜',
    'HitFMTop榜',
    '日本Oricon周榜',
    '韩国Melon排行榜周榜',
    '韩国Mnet排行榜周榜',
    '韩国Melon原声周榜',
    '中国TOP排行榜(港台榜)',
    '中国TOP排行榜(内地榜)',
    '香港电台中文歌曲龙虎榜',
    '华语金曲榜',
    '中国嘻哈榜',
    '法国NRJEuroHot30周榜',
    '台湾Hito排行榜',
    'Beatport全球电子舞曲榜',
    '云音乐ACG音乐榜',
    '云音乐嘻哈榜',
  ]
  profile: any = {}

  result: any[] = []
  resultMessage: string = ''

  currentCategory: string = ''

  width: number = 0

  @Watch('$route')
  @Watch('currentCategory')
  updateResult (newVal?: any): void {
    let { name } = this.$route
    let self = this

    this.result = []
    this.resultMessage = ''

    if (this.currentCategory === '') {
      this.currentCategory = this.category[0]
    }
    axios.get('/api/top/list', {
      params: {
        idx: Math.max(this.category.indexOf(this.currentCategory), 0)
      }
    })
      .then(({ data }) => {
        let { tracks, ...profile } = data.playlist
        self.result = tracks
        self.profile = profile
        self.resultMessage = '无法找到相关页面'
      })
      .catch(e => {
        self.$message && self.$message({
          message: '无法获取分类数据',
          type: 'error',
        })
        self.resultMessage = '无法找到相关页面'
      })

    this.$nextTick(() => {
      (this.$parent as any).setScrollTop(0)
    })
  }

  updateCategory (e: MouseEvent):void {
    let { target }: any = e

    while (target.parentNode) {
      if (target.hasAttribute('data-tag')) {
        this.currentCategory = target.getAttribute('data-tag')
        break
      }
      target = target.parentNode
    }
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
      self.width = (self.$refs.category as any).offsetWidth
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
.category {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;

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

.layout-left-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  
  flex: 0 0 13%;
  
  width: 0;
  overflow: hidden;

  @media all and (orientation: portrait) {
    visibility: hidden;
    position: absolute;
  }
}

.category-items {
  width: 100%;

  margin: .5rem 0;

  padding: .5rem;

  color: rgb(255, 255, 255);

  box-sizing: border-box;
  
  cursor: pointer;
}

.category-items-active {
  background: rgb(120, 120, 120);
}

.layout-right-side {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;

  flex: 1 1 90%;
  flex-wrap: wrap;
  
  width: 0;
  overflow: hidden;
  
  margin: 0 0 0 1rem;

  & a, & a:active, & a:visited {
    text-decoration: none;
    color: rgb(255, 255, 255);
  }

  @media all and (orientation: portrait) {
    flex: 0 0 100%;
    margin: unset;
  }
}

.category-result-profile {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;

  width: 100%;

  @media all and (orientation: portrait) {
    flex-direction: column;
  }
}

.category-result-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  flex: 0 0 80%;

  width: 0;

  padding: 0 1rem 1rem 1rem;

  box-sizing: border-box;

  @media all and (orientation: portrait) {
    flex: 0 0 100%;
    
    width: 100%;
  }
}

.category-result-profile-name {
  width: 100%;

  font-size: 1.5rem;
  color: rgb(255, 255, 255);
}

.category-result-profile-desc {
  width: 100%;

  margin: .5rem 0;

  color: rgb(153, 153, 153);
}

.category-result {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  width: 100%;

  padding: 1rem;

  border-top: 1px solid rgb(153, 153, 153);

  &:nth-child(2) {
    border: unset;
  }
}
.category-result-index {
  margin: 0 1rem;

  padding: .5rem;

  color: rgb(255, 255, 255);
}

.category-result-name {
  flex: 0 0 25%;

  width: 0;
  overflow: hidden;

  margin: 0 auto;

  font-size: 1rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: rgb(255, 255, 255);
}

.category-result-artist {
  @extend .category-result-name;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  flex: 0 0 20%;

  & *:hover {
    text-decoration: underline;
  }

  & * {
    width: 100%;
    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.category-result-album {
  @extend .category-result-name;

  flex: 0 0 20%;

  &:hover {
    text-decoration: underline;
  }
}

.category-result-button {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: center;

  flex: 0 0 20%;

  width: 0;

  padding: 0 1rem;

  font-size: 2rem;
  color: rgb(200, 200, 200);

  opacity: 0;

  transition: opacity .3s ease-out;

  @media all and (orientation: portrait) {
    flex: 0 0 20%;

    opacity: 1;
  }

  .category-result:hover & {
    opacity: 1;
  }
}
</style>