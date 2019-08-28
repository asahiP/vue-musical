<template>
  <form class="search-bar-container" @submit.prevent="enterEvent(value)">
    <label :for="inputUniqID" class="el-icon-search search-bar-icon"></label>
    <input
      type="text"
      :id="inputUniqID"
      class="search-bar-input"
      v-model="value"
      autocomplete="off"
      :placeholder="placeholder"
    >
    <label
      :for="inputUniqID"
      class="el-icon-close search-bar-icon"
      style="left: unset; right: .65rem; cursor: pointer;"
      @click="value = ''"
      v-show="value"
    ></label>
  </form>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'

@Component({
  inheritAttrs: false
})
export default class SearchBar extends Vue {
  @Prop({ required: false, default: '' }) placeholder!: string
  @Prop({ required: false, default: () => (() => {}) }) enterEvent!: Function

  inputUniqID: string = (Date.now() * Math.random() * 1024).toString(36)
  value: string = ''
}
</script>

<style lang="scss" scoped>
.search-bar-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;

  position: relative;
}
.search-bar-icon {
  position: absolute;
  left: .65rem;

  color: rgb(200, 200, 200);
  font-weight: bold;
  font-size: 1.2rem;
}
.search-bar-input {
  width: 100%;
  
  padding: .5rem 2.5rem .5rem 2.5rem;

  border: none;
  border-radius: .3rem;

  color: rgb(200, 200, 200);

  background: rgb(70, 70, 70);

  outline: none;
}
</style>