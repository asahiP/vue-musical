import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('./views/Search.vue'),
    },
    {
      path: '/album',
      name: 'album',
      component: () => import('./views/Details.vue'),
    },
    {
      path: '/artist',
      name: 'artist',
      component: () => import('./views/Details.vue'),
    },
    {
      path: '/artist/list',
      name: 'artistList',
      component: () => import('./views/CategoryArtistList.vue'),
    },
    {
      path: '/playlist',
      name: 'playlist',
      component: () => import('./views/Details.vue'),
    },
    {
      path: '/playlist/list',
      name: 'playlistList',
      component: () => import('./views/CategoryPlaylist.vue'),
    },
    {
      path: '/top',
      name: 'top',
      component: () => import('./views/CategoryTop.vue'),
    },
  ]
})
