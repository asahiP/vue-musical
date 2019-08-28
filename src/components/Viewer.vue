<template>
  <div style="overflow: hidden;">
    <img
      :src="readySrc"
      :alt="alt"
      :width="width"
      :height="height"
      v-if="readySrc"
    >
    <div class="image-unready" :style="style" v-if="state !== 'ready'">
      <div class="image-unready-icon el-icon-loading" v-if="state === 'unready'"></div>
      <div class="image-unready-icon el-icon-picture-outline" v-if="state === 'error'"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Image } from 'element-ui';

@Component
export default class Viewer extends Vue {
  @Prop({ required: true }) src!: string
  @Prop({ required: false }) width!: number
  @Prop({ required: false }) height!: number
  @Prop({ required: false }) alt!: string

  state: string = 'unready'
  readySrc: string = ''

  get style (): string {
    let
      width = this.width || this.height || 200,
      height = this.height || this.width || 200

    return `width: ${Math.floor(width)}px; height: ${Math.floor(height)}px`
  }

  mounted (): void {
    let { src } = this
    let self = this
    let img: any = new Image()

    img.onload = () => {
      window.requestAnimationFrame(() => {
        self.readySrc = src
        self.state = 'ready'
      })
    }

    img.onerror = () => { self.state = 'error' }
    img.src = src
  }
}
</script>

<style lang="scss" scoped>
.image-unready {
  position: relative;

  font-size: 3rem;
  color: rgb(170, 170, 170);

  background: rgb(240, 240, 240);
}

.image-unready-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
}
</style>