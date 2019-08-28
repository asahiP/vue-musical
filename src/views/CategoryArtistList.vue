<template>
  <div>
    <div v-if="result.length || category.length"  class="category">
      <div class="layout-left-side" @click.left="updateCategory">
        <span
          :class="[
            'category-items',
            { 'category-items-active': name === currentCategory }
          ]"
          v-for="({ name }, index) in category"
          :key="name + index"
          v-text="name"
          :data-tag="name"
        ></span>
      </div>
      <div class="layout-right-side" v-if="result.length">
        <router-link
          class="category-result"
          v-for="({ name, id, picUrl }, index) in result"
          :key="name + id + index"
          :to="{ name: 'artist', query: { id } }"
        >
          <Viewer :height="150" :src="picUrl + '?param=150y150'" :alt="'avatar'"/>
          <p v-text="name" class="category-result-name"></p>
        </router-link>
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
import { Vue, Component, Watch } from 'vue-property-decorator'
import Viewer from '@/components/Viewer.vue'
import axios from 'axios'

@Component({
  components: {
    Viewer,
  }
})
export default class Category extends Vue {
  category: any[] = []

  result: any[] = []
  resultMessage: string = ''

  currentCategory: string = ''

  @Watch('$route')
  @Watch('currentCategory')
  updateResult (newVal?: any): void {
    let { name } = this.$route
    let self = this
    let categoryMap = new Map([
      ['入驻歌手', 5001],
      ['华语男歌手', 1001],
      ['华语女歌手', 1002],
      ['华语组合/乐队', 1003],
      ['欧美男歌手', 2001],
      ['欧美女歌手', 2002],
      ['欧美组合/乐队', 2003],
      ['日本男歌手', 6001],
      ['日本女歌手', 6002],
      ['日本组合/乐队', 6003],
      ['韩国男歌手', 7001],
      ['韩国女歌手', 7002],
      ['韩国组合/乐队', 7003],
      ['其他男歌手', 4001],
      ['其他女歌手', 4002],
      ['其他组合/乐队', 4003],
    ])

    this.result = []
    this.resultMessage = ''
    if (typeof newVal !== 'string' && typeof newVal !== 'number') this.category = []

    this.category = [...categoryMap.keys()].map(i => ({ name: i }))
    if (this.currentCategory === '') {
      this.currentCategory = this.category[0].name
    }

    axios.get('/api/artist/list', {
      params: {
        cat: categoryMap.get(this.currentCategory)
      }
    })
      .then(({ data }) => {
        self.result = data.artists
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

  get toName (): string {
    let { name } = this.$route
    let result = ''
    
    switch (name) {
      case 'playlistList':
        result = 'playlist'
        break
      case 'artistList':
        break
      case 'top':
    }

    return result
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

  mounted (): void {
    this.updateResult()
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

.category-result {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  flex: 0 0 15%;

  width: 0;

  margin: 0 auto;
  padding: 1rem;

  @media all and (orientation: portrait) {
    flex: 0 0 40%;
  }
}

.category-result-name {
  width: 100%;
  overflow: hidden;

  font-size: 1.3rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>