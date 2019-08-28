<template>
  <div class="home" ref="home">
    <!-- Banner -->
    <el-carousel
      :interval="4000"
      :height="syncImgHeight"
      indicator-position="none"
      arrow="always"
    >
      <el-carousel-item v-for="{ imageUrl } in $store.state.banners" :key="imageUrl">
        <img :src="imageUrl" alt="Banner" width="100%">
      </el-carousel-item>
    </el-carousel>

    <!-- 推荐单曲 -->
    <div class="layout-container">
      <h2>推荐单曲</h2>
      <div class="layout-content" @click.left="startPlay">
        <div
          v-for="{ id, name, album } in newSongs"
          :key="id + name"
          class="main-container"
          title="点击开始播放"
          :data-id="id"
        >
          <Viewer
            :src="album.blurPicUrl + `?param=${getWidth}y${getWidth}`"
            :alt="'专辑封面'"
            :width="getWidth"
          />
          <p v-text="name" class="main-name"></p>
        </div>
      </div>
    </div>

    <!-- 最新专辑 -->
    <div class="layout-container">
      <h2>最新专辑</h2>
      <div class="layout-content">
        <router-link
          class="main-container"
          v-for="{ name, id, blurPicUrl } in newAlbums"
          :to="{ name: 'album', query: { id } }"
          :key="id + name"
        >
          <Viewer
            :src="blurPicUrl + `?param=${getWidth}y${getWidth}`"
            :alt="'专辑封面'"
            :width="getWidth"
          />
          <p v-text="name" class="main-name"></p>
        </router-link>
      </div>
    </div>

    <!-- 热门歌手 -->
    <div class="layout-container">
      <h2>热门歌手</h2>
      <div class="layout-content">
        <router-link
          class="main-container"
          v-for="{ name, id, picUrl } in hotArtists"
          :to="{ name: 'artist', query: { id } }"
          :key="id + name"
        >
          <Viewer
            :src="picUrl + `?param=${getWidth}y${getWidth}`"
            :alt="'专辑封面'"
            :width="getWidth"
          />
          <p v-text="name" class="main-name"></p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Viewer from '@/components/Viewer.vue'
import axios from 'axios'

@Component({
  components: {
    Viewer,
  }
})
export default class Home extends Vue {
  width: number = 0
  imgWidth: number = 1080
  imgHeight: number = 400

  get syncImgHeight (): string {
    let { width, imgWidth, imgHeight } = this

    return `${Math.round(width / imgWidth * imgHeight)}px`
  }

  newSongs: any[] = []
  newAlbums: any[] = []
  hotArtists: any[] = []

  player: any = {}
  getSongDate: Function = () => {}

  startPlay (e: MouseEvent): void {
    let target: any = e.target
    let id: string | number = Infinity

    while (target.parentNode) {
      if (target.hasAttribute('data-id')) {
        id = target.getAttribute('data-id')
        break
      } else {
        target = target.parentNode
      }
    }

    if (typeof id === 'string') {
      let { player, getSongDate } = this
      let self = this
      id = parseInt(id)

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
  }

  get getWidth (): number {
    let { width } = this
    return Math.floor(this.$store.state.isPortrait
      ? width * 0.4
      : width * 0.15)
  }

  mounted (): void {
    let self = this
    let getContainerWidth = () => {
      self.width = (self.$refs.home as any).offsetWidth
    }

    window.addEventListener('resize', getContainerWidth.bind(self))

    getContainerWidth()

    // get banner date
    axios.get('/api/banner?type=0')
      .then(({ data }) => {
        self.$store.commit('updateProperty', {
          newVal: data.banners,
          propName: 'banners'
        })
      })
      .catch(e => self.$message({
        message: e,
        type: 'error',
      }))

    // 获取推荐单曲数据
    axios.get('/api/personalized/newsong')
      .then(({ data }) => {
        self.newSongs = data.result.map(({ song }: any) => song)
      })
      .catch(e => self.$message && self.$message({
        message: '获取 推荐单曲 数据失败',
        type: 'error',
      }))

    // 获取最新专辑数据
    axios.get('/api/album/newest')
      .then(({ data }) => {
        self.newAlbums = data.albums
      })
      .catch(e => self.$message && self.$message({
        message: '获取 最新专辑 数据失败',
        type: 'error',
      }))

    // 获取热门歌手数据
    axios.get('/api/top/artists', { params: { offset: 0, limit: 10 } })
      .then(({ data }) => {
        self.hotArtists = data.artists
      })
      .catch(e => self.$message && self.$message({
        message: '获取 最新专辑 数据失败',
        type: 'error',
      }))
    
    this.$nextTick(() => {
      // 获取根实例方法及子组件引用
      self.player = self.$parent.$parent.$refs.player
      self.getSongDate = (self.$parent.$parent as any).getSongDate
    })
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 80%;
  min-width: 1366px * .8;

  margin: 0 auto;

  @media all and (orientation: portrait) {
    width: 100%;
    min-width: unset;
  }
}

.layout-container {
  width: 100%;
  overflow: hidden;

  padding: 1rem 0;

  h2 {
    padding: 1rem 0;

    border-bottom: 1px solid rgb(153, 153, 153);

    color: rgb(255, 255, 255);

    @media all and (orientation: portrait) {
      padding: 1rem;
    }
  }
}

.layout-content {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  flex-wrap: wrap;

  width: 100%;

}

.main-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;

  flex: 1 0 20%;
  max-width: 20%;

  padding: 1rem;

  text-decoration: none;

  box-sizing: border-box;

  cursor: pointer;

  @media all and (orientation: portrait) {
    flex: 1 0 50%;
    max-width: 50%;
  }

  &:active, &:visited {
    text-decoration: none;
  }
}

img {
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  margin: 0 auto 1rem auto;
}

.main-name {
  color: rgb(255, 255, 255);

  width: 100%;
  overflow: hidden;

  padding: .5rem 0;

  white-space: nowrap;
  text-overflow: ellipsis;

  .main-container:hover & {
    text-decoration: underline;
  }
}
</style>