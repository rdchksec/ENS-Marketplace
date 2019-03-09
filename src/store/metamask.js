import { providers } from 'ethers'
import { formatEther } from 'ethers/utils'
export default {
  namespaced: true,
  state: {
    network: undefined,
    address: undefined,
    ethBalance: null
  },
  actions: {
    async getMetamask ({ commit }) {
      if (!window.ethereum) throw new Error('No injected web3 found')
      const address = (await window.ethereum.enable())[0]
      commit('account', address)
      const provider = new providers.Web3Provider(window.ethereum)
      commit('network', (await provider.getNetwork()))
      commit('ethBalance', await provider.getBalance(address))
    }
  },
  mutations: {
    account (state, payload) {
      state.address = payload
    },
    network (state, payload) {
      state.network = payload
    },
    ethBalance (state, payload) {
      state.ethBalance = parseFloat(formatEther(payload)).toFixed(2)
    }
  }
}
