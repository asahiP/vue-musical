<template>
  <div class="pagination-container">
    <span
      :class="[
        'pagination-number',
        { 'pagination-number-disable': currentPage === 1 }
      ]"
      @click.left="updateCurrentPage('prev')"
    >
    Prev
    </span>
    <span
      v-for="(page, index) in pageNumbers"
      :key="page + index"
      v-text="page"
      :class="[
        'pagination-number',
        { 'pagination-number-active': page === currentPage }
      ]"
      @click.left="updateCurrentPage(page, index)"
    ></span>
    <span
      :class="[
        'pagination-number',
        { 'pagination-number-disable': currentPage === Math.max(totalPage, 1) }
      ]"
      @click.left="updateCurrentPage('next')"
    >
    Next
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class Pagination extends Vue {
  @Prop({ required: true }) currentPage!: number
  @Prop({ required: true }) totalPage!: number
  @Prop({ required: false, default: 5 }) length!: number

  updateCurrentPage (val: number | string, index: number = -1): void {
    let { currentPage, pageNumbers, length, totalPage } = this
    let currentIndex = pageNumbers.indexOf(currentPage)

    let newVal = val
    totalPage = Math.max(totalPage, 1)

    if (typeof val === 'string') {
      switch (val) {
        case '...':
          if (currentIndex > index) {
            newVal = Math.max(currentPage - length, 1)
          } else if (currentIndex < index) {
            newVal = Math.min(currentPage + length, totalPage)
          }
          break
        case 'prev':
          newVal = Math.max(currentPage - 1, 1)
          break
        case 'next':
          newVal = Math.min(currentPage + 1, totalPage)
      }
    }

    this.$emit('update:currentPage', newVal)
  }

  get pageNumbers (): any[] {
    let { currentPage, totalPage, length } = this
    let tmp: any[] = []

    length = length % 2 === 0 ? length - 1 : length
    totalPage = Math.max(totalPage, 1)

    switch (true) {
      case currentPage < length:
        tmp = [...Array(totalPage).keys()].map(i => i + 1).slice(0, length)

        if (Math.abs(tmp.length - totalPage) > 1) {
          tmp.push('...')
        }

        tmp.push(totalPage)
        break

      case totalPage - currentPage < length:
        tmp.push(
          1,
          '...',
          ...[...Array(totalPage).keys()].map(i => i + 1).slice(totalPage - length, totalPage)
        )
        break

      case currentPage >= length:
        tmp.push(1, '...')

        for (let i = Math.floor(length / 2); i > 0; i--) {
          tmp.push(currentPage - i)
        }

        for (let i = 0, len = Math.floor(length / 2); i <= len; i++) {
          tmp.push(currentPage + i)
        }

        tmp.push('...', totalPage)
    }

    let result: any[] = []
    
    for (let i of tmp) {
      if (typeof i === 'string') {
        result.push(i)
      } else {
        if (!result.includes(i)) {
          result.push(i)
        }
      }
    }

    return result
  }
}
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: flex-start;
  
  padding: 0 .5rem;
}

.pagination-number {
  display: flex;
  align-content: center;
  justify-content: center;

  margin: 0 auto;
  padding: .5rem;

  font-family: Arial, Helvetica, sans-serif, 'Source Han Sans', 'Noto Sans', 'Microsoft Yahei', '微软雅黑', STHeiti, '华文黑体';
  color: rgb(255, 255, 255);

  cursor: pointer;

  &:hover {
    @extend .pagination-number-active
  }
}

.pagination-number-active {
  text-shadow: 0 0 5px;
  color: rgb(200, 0, 0);
}

.pagination-number-disable {
  color: rgb(153, 153, 153);

  cursor: not-allowed;

  &:hover {
    text-shadow: unset;
    color: rgb(153, 153, 153);
  }
}
</style>