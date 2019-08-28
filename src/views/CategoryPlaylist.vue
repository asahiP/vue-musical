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
          v-for="({ name, id, coverImgUrl, description }, index) in result"
          :key="name + id + index"
          :to="{ name: 'playlist', query: { id } }"
        >
          <Viewer :height="100" :src="coverImgUrl + '?param=100y100'" :alt="'cover'"/>
          <div class="category-result-text">
            <p v-text="name" class="category-result-name"></p>
            <p
              v-text="(description && description.length) > ($store.state.isPortrait ? 40 : 150)
                ? description.slice(0, ($store.state.isPortrait ? 40 : 150)) + '...'
                : description
              "
              class="category-result-desc"
            ></p>
          </div>
        </router-link>
        <Pagination
          :currentPage.sync="currentPage"
          :totalPage="Math.ceil(resultCount / limit || 0)"
          :length="$store.state.isPortrait ? 3 : 5"
          style="width: 100%; box-sizing: border-box;"
        />
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
import Pagination from '@/components/Pagination.vue'
import Viewer from '@/components/Viewer.vue'
import axios from 'axios'

@Component({
  components: {
    Pagination,
    Viewer,
  }
})
export default class Category extends Vue {
  category: any[] = []

  result: any[] = []
  resultMessage: string = ''
  resultCount: number = 0

  limit: number = 30
  currentPage: number = 1
  currentCategory: string = ''

  @Watch('$route')
  @Watch('currentPage')
  @Watch('currentCategory')
  updateResult (newVal?: any): void {
    let { name } = this.$route
    let self = this

    this.result = []
    this.resultMessage = ''
    this.resultCount = 0
    if (typeof newVal !== 'string' && typeof newVal !== 'number') this.category = []

    axios.get('/api/playlist/catlist')
      .then(({ data }) => {
        self.category = data.sub
        if (self.currentCategory === '') {
          self.currentCategory = self.category[0].name
        }
        let { limit, currentPage, currentCategory } = self
        
        axios.get('/api/top/playlist', {
          params: {
            cat: currentCategory,
            limit,
            offset: (currentPage - 1) * limit,
          }
        })
          .then(({ data }) => {
            self.result = data.playlists
            self.resultCount = data.total
            self.resultMessage = '无法找到相关页面'
          })
          .catch(e => {
            self.$message && self.$message({
              message: '无法获取分类数据',
              type: 'error',
            })
            self.resultMessage = '无法找到相关页面'
          })
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
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  flex: 1 1 90%;
  
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
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;

  width: 100%;

  padding: 1rem;

  border-top: 1px solid rgb(153, 153, 153);

  &:first-child {
    border: unset;
  }
}

.category-result-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  flex: 0 1 90%;

  width: 0;
  height: 100%;

  padding: 0 1rem 1rem 1rem;

  box-sizing: border-box;

  @media all and (orientation: portrait) {
    flex: 0 1 70%;
  }
}

.category-result-name {
  width: 100%;
  overflow: hidden;

  font-size: 1.5rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.category-result-desc {
  width: 100%;
  overflow: hidden;

  margin: .5rem 0 0 0;

  white-space: normal;
  text-overflow: ellipsis;
  color: rgb(153, 153, 153);
}
</style>