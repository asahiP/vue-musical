import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isPortrait: false,

    placeholder: '',
    banners: [],
    keywords: '',

    result: [],
    resultCount: 0,
    limit: 30,
    resultMessage: '',
  },
  mutations: {
    updateProperty (state: any, { propName, newVal }): void {
      state[propName] = newVal
    },
  },
  actions: {
    updateSearchResult ({ commit, state }, { type = 1, offset = 0 } = {}) :void {
      let { keywords, placeholder, limit } = state

      keywords = keywords || placeholder

      commit('updateProperty', {
        propName: 'resultMessage',
        newVal: ''
      })

      axios.get('/api/search', { params: { type, keywords, limit, offset: offset * limit } })
        .then(({ data }) => {
          let { result } = data
          let { songCount, songs } = result
          
          commit('updateProperty', {
            propName: 'result',
            newVal: songs || []
          })
          commit('updateProperty', {
            propName: 'resultCount',
            newVal: songCount || 0
          })
          commit('updateProperty', {
            propName: 'resultMessage',
            newVal: '未能找到相关搜索结果'
          })
        })
    }
  }
})