<template>
  <pre :style="{
    width: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    color: 'rgb(255, 255, 255)',
  }">
    <span
      v-for="({ text, hit }, index) in results"
      :key="index + text"
      v-text="text"
      :style="{
        color: hit ? color : 'rgb(255, 255, 255)'
      }"
    ></span>
  </pre>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class HighLight extends Vue {
  @Prop({ required: true }) sample!: string
  @Prop({ required: true }) target!: string
  @Prop({ required: false, default: 'rgb(200, 0, 0)' }) color!: string

  get results (): any[] {
    let result: any[] = []
    let { sample, target } = this
    let { length } = sample
    let parts = [0, length]
    let keywords = target.split(/\s+/)

    for (let i = 0; i < length; i++) {
      if (sample[i].toLocaleLowerCase() === target[0].toLocaleLowerCase()) {
        let
          tLen = target.length,
          fragment = sample.slice(i, i + tLen)

        if (fragment.toLocaleLowerCase() === target.toLocaleLowerCase()) {
          parts.push(i, i + tLen)
          i = i + tLen - 1
        }
      } else {
        keywords.forEach(keyword => {
          if (sample[i].toLocaleLowerCase() === keyword[0].toLocaleLowerCase()) {
            let
              tLen = keyword.length,
              fragment = sample.slice(i, i + tLen)
    
            if (fragment.toLocaleLowerCase() === keyword.toLocaleLowerCase()) {
              parts.push(i, i + tLen)
              i = i + tLen - 1
            }
          }
        })
      }
    }

    parts = Array.from(new Set(parts)).sort((a, b) => a - b)

    for (let i = 0, len = parts.length; i < len - 1; i++) {
      let fragment = sample.slice(parts[i], parts[i + 1])

      result.push({
        text: fragment,
        hit: fragment.toLocaleLowerCase() === target.toLocaleLowerCase()
          || [
            ...new Set(
              keywords
                .map(keyword => 
                  fragment.toLocaleLowerCase() === keyword.toLocaleLowerCase()
                )
                .filter(boolean => boolean)
            )
          ][0]
      })
    }

    return result
  }
}
</script>

<style lang="scss" scoped>
*:hover > span {
  text-decoration: underline;
}
</style>