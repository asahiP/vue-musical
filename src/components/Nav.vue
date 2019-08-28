<template>
  <div class="nav-container">
    <router-link
      class="nav-item"
      exact-active-class="nav-active"
      v-for="({ text, url }, index) in navData"
      :key="text + url + index"
      v-text="text"
      :to="url"
    />
    <SearchBar
      style="flex-grow: 1; margin: 0 0 0 3rem;"
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
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import SearchBar from './SearchBar.vue'

@Component({
  components: {
    SearchBar,
  }
})
export default class Nav extends Vue {
  @Prop({ required: true }) initNavData!: any[]

  get navData (): any[] {
    return this.initNavData.filter(item => item.hasOwnProperty('text') && item.hasOwnProperty('url'))
  }
}
</script>>

<style lang="scss" scoped>
.nav-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;

  width: 80%;
  min-width: 1366px * .8;

  margin: 1rem auto;

  background: rgb(0, 0, 0);
}

.nav-item {
  flex-grow: 1;

  position: relative;

  max-width: 10rem;

  padding: 1rem 0;

  text-align: center;
  text-decoration: none;
  color: rgb(255, 255, 255);

  cursor: pointer;

  &:before {
    position: absolute;
    left: 0;
    bottom: 0;

    width: 0;
    height: .2rem;

    background: rgb(200, 0, 0);

    content: '';
  }
}

.nav-active {
  &:before {
    width: 100%;
  }
}
</style>