import Vue from 'vue';
import Vuex from 'vuex';
import { getInfo } from '@/api/user.js';
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    userProfile: {},
  },
  getters: {
    userProfile: ({ userProfile }) => userProfile,
    loggedIn: ({ loggedIn }) => loggedIn,
  },
  mutations: {
    SET_USER(state, userProfile) {
      state.userProfile = userProfile;
      console.log(state.userProfile);
    },
  },
  actions: {
    getUserInfo({ commit }) {
      if (localStorage['access-token'] && localStorage['access-token'] !== '') {
        getInfo(
          localStorage.id,
          (response) => {
            if (response.data.message === 'success') {
              let user = response.data['userInfo'];
              commit('SET_USER', user);
            } else {
              this.isLoginError = true;
            }
          },
          (error) => {
            console.error(error);
            alert('회원정보를 가져오지 못했습니다.');
          }
        );
      }
    },
    logout({ commit }) {
      localStorage.clear();
      commit('SET_USER', null);
    },
  },
  modules: {},
});

export default store;