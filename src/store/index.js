import Vue from 'vue'
import Vuex from 'vuex'
import metamask from './metamask'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
      metamask
    }
  })