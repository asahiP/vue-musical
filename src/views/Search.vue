<template>
  <div class="search">
    <div v-if="$store.state.result.length" class="result-container">
      <p class="result-message">
        搜索到"<span v-text="$route.query.kw" style="color: rgb(200, 0, 0)"></span>"相关的歌曲
      </p>
      <div
        class="result-content"
        v-for="({ album, artists, name, id }, index) in $store.state.result"
        :key="name + index"
        :data-id="id"
        @click.left="startPlay"
      >
        <span
          v-text="$store.state.limit * (currentPage - 1) + index + 1"
          class="result-content-index"
        ></span>
        <div class="result-content-name">
          <HighLight :sample="name" :target="target"/>
        </div>
        <div class="result-content-artist">
          <router-link
            :to="{ name: 'artist', query: { id: artist.id } }"
            v-for="artist in artists"
            :key="artist.id + artist.name"
          >
            <HighLight :sample="artist.name" :target="target"/>
          </router-link>
        </div>
        <div class="result-content-album">
          <router-link :to="{ name: 'album', query: { id: album.id } }">
            <HighLight :sample="album.name" :target="target"/>
          </router-link>
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
      <Pagination
        :currentPage.sync="currentPage"
        :totalPage="Math.ceil($store.state.resultCount / $store.state.limit || 0)"
        :length="$store.state.isPortrait ? 3 : 5"
      />
    </div>
    <div v-else style="padding: 2rem;">
      <span class="el-icon-loading unready" v-show="!$store.state.resultMessage"></span>
      <p
        v-show="$store.state.resultMessage"
        v-text="$store.state.resultMessage"
        style="color: rgb(200, 200, 200); text-align: center"
      ></p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import HighLight from '@/components/HighLight.vue'
import Pagination from '@/components/Pagination.vue'
import axios from 'axios'

@Component({
  components: {
    HighLight,
    Pagination,
  }
})
export default class Search extends Vue {
  currentPage: number = 1

  get target (): string {
    let { placeholder, keywords } = this.$store.state

    return keywords || placeholder
  }

  @Watch('currentPage')
  @Watch('$route')
  updateSearchResult (newVal?: any): void {
    let { query, path } = this.$route
    let { currentPage } = this

    if (typeof newVal === 'number') {
      let location = currentPage === 1
        ? {
          path,
          query: {
            kw: query.kw,
          }
        }
        : {
          path,
          query: {
            kw: query.kw,
            page: currentPage.toString()
          }
        }
      
      this.$router.push(
        location,
        () => {},
        () => {},
      )
    } else {
      this.currentPage = parseInt((query.page as string) || '') || 1
    }

    this.$store.commit('updateProperty', {
      propName: 'keywords',
      newVal: query.kw,
    })
    this.$store.commit('updateProperty', {
      propName: 'result',
      newVal: []
    })
    this.$nextTick(() => {
      (this.$parent as any).setScrollTop(0)
      this.$store.dispatch('updateSearchResult', { offset: this.currentPage - 1 })
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
    let { query } = this.$route
    let self = this

    this.updateSearchResult()

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
.search {
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

  border-top: 1px solid rgb(153, 153, 153);

  box-sizing: border-box;

  &:first-child, &:nth-child(2) {
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
  flex: 0 0 10%;

  width: 0;

  padding: 0 1rem;

  color: rgb(255, 255, 255);

  @media all and (orientation: portrait) {
    flex: 0 0 20%;
  }

  & a, & a:active, & a:visited {
    text-decoration: none;
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