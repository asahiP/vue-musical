import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import {
  Carousel,
  CarouselItem,
  Message,
} from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 }
Vue.prototype.$message = Message

Vue.use(Carousel)
Vue.use(CarouselItem)


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
