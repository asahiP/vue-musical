<template>
  <div id="app">
    <Scroller :customOption="scrollerOption">
      <!-- Nav -->
      <Nav :initNavData="navData" v-if="!$store.state.isPortrait"/>
      <!-- SearchBar -->
      <SearchBar
        v-else
        style="margin: 1rem .7rem"
        :enterEvent="(val) => {
          $store.commit('updateProperty', {
            propName: 'result',
            newVal: []
          })

          $store.commit('updateProperty', {
            propName: 'keywords',
            newVal: val
          })

          $store.dispatch('updateSearchResult')

          $router.push(
            {
              path: '/search',
              query: { kw: val || $store.state.placeholder }
            },
            () => {},
            () => {},
          )
        }"
        :placeholder="$store.state.placeholder"
      />
      <router-view/>
      <footer>
        本项目仅供学习交流，严禁用作商业用途。
        <br>
        <a href="https://github.com/Binaryify/NeteaseCloudMusicApi">接口项目地址</a>
      </footer>
    </Scroller>
    <Player
      style="z-index: 500"
      ref="player"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'

import Scroller from './components/Scroller.vue'
import Nav from './components/Nav.vue'
import SearchBar from './components/SearchBar.vue'
import Player from './components/Player.vue'

@Component({
  components: {
    Scroller,
    Nav,
    SearchBar,
    Player,
  }
})
export default class App extends Vue {
  scrollerOption: any = {
    scrollerBarStyleX: { background: 'transparent' },
    scrollerBarStyleY: { background: 'transparent' },
  }

  navData: any[] = [
    { text: '首页', url: '/' },
    { text: '歌单分类', url: '/playlist/list' },
    { text: '歌手分类', url: '/artist/list' },
    { text: '排行榜', url: '/top' },
  ]

  async getSongDate (id: number): Promise<any> {
    return new Promise((res, rej) => {
      let data = {
        id,
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
        src: `https://music.163.com/song/media/outer/url?id=${id}.mp3`,
        lyr: [],
        lyrStatus: {
          isGetting: false,
          getCount: 0,
        }
      }

      axios.get('/api/song/detail', { params: { ids: id } })
        .then(response => {
          let { name, al } = response.data.songs[0]
          let { id } = al
          data.name = name
          data.album.id = id

          axios.get('/api/album', { params: { id } })
            .then(response => {
              let { album } = response.data
              let { artist, name, picUrl } = album
              data.singer.name = artist.name
              data.singer.id = artist.id
              data.album.name = name
              data.album.img = picUrl

              res(data)
            })
            .catch(e => rej(e))
        })
        .catch(e => rej(e))
    })
  }

  mounted (): void {
    let self = this

    let isPortraitCheck = () => {
      let { offsetWidth, offsetHeight } = document.body
      this.$store.commit('updateProperty', {
        propName: 'isPortrait',
        newVal: offsetHeight > offsetWidth,
      })
    }

    window.addEventListener('resize', isPortraitCheck.bind(self))

    isPortraitCheck()
    
    // get default keyword
    axios.get('/api/search/default')
      .then(({ data }) => {
        self.$store.commit('updateProperty', {
          newVal: data.data.showKeyword,
          propName: 'placeholder'
        })
      })
      .catch(e => self.$message({
        message: e,
        type: 'error',
      }))
  }
}
</script>>

<style lang="scss">
* {
  margin: 0;
  padding: 0;

  font-family: Arial, Helvetica, sans-serif, 'Source Han Sans', 'Noto Sans', 'Microsoft Yahei', '微软雅黑', STHeiti, '华文黑体';
  -webkit-tap-highlight-color: transparent;
}

html, body, #app {
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;

  background: rgb(0, 0, 0);
}
</style>

<style lang="scss" scoped>
footer {
  padding: 2rem;

  text-align: center;
  text-decoration: none;
  color: rgb(255, 255, 255);

  & a, &:active a, &:visited a {
    text-decoration: none;
    color: rgb(255, 255, 255);
  }

  & a:hover {
    text-decoration: underline;
  }
}
</style>
