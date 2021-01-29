<template>
  <v-card v-if="isLogin">
    <v-toolbar
      color="orange lighten-4
"
    >
      <v-btn icon @click="closeDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title> 로그인</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text @click="changeForm">
          회원가입
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-form class="pa-6" @submit.prevent="onSubmit">
      <ValidationProvider name="id" rules="required|email" v-slot="{ errors }">
        <v-text-field
          v-model="id"
          :error-messages="errors"
          label="E-mail"
          required
          autocapitalize="off"
        ></v-text-field>
      </ValidationProvider>

      <ValidationProvider
        name="password"
        rules="required|password"
        v-slot="{ errors }"
      >
        <v-text-field
          v-model="password"
          type="password"
          :error-messages="errors"
          label="비밀번호"
          required
        ></v-text-field>
        <br />
      </ValidationProvider>
      <v-btn
        :disabled="!isValid"
        color="orange lighten-4
"
        @click="onSubmit"
        >로그인</v-btn
      >
    </v-form>
    <hr style="height: 15px; " />
    <v-row>
      <v-col>
        <v-btn
          class="ml-6"
          color="#C62828"
          dark
          @click="loginWithGoogle"
          width="183"
          height="45"
        >
          <v-icon class="mr-5" left>mdi-google</v-icon>
          구글 로그인
        </v-btn>
      </v-col>
      <v-col>
        <img
          class="kakao_btn"
          src="@/assets/kakao_login_medium_narrow.png"
          @click="loginWithKakao"
          alt="카카오 로그인"
        />
      </v-col>
    </v-row>
    <v-row class="ma-6">
      <h4>혹시 비밀번호가 기억나지 않으신가요?</h4>
      <h4>그러시다면, <a href="/findpw">비밀번호찾기</a>를 클릭하세요.</h4>
    </v-row>
  </v-card>
</template>

<script>
import { login, socialLogin } from '@/api/user.js';
import { ValidationProvider } from 'vee-validate';
import { extend } from 'vee-validate';
import * as rules from 'vee-validate/dist/rules';
import firebase from 'firebase';
import '@firebase/auth';
import '@firebase/firestore';

Object.keys(rules).forEach((rule) => {
  extend(rule, rules[rule]);
});
extend('password', {
  message:
    'password should include lower-case, numeric digit, special chracter($@$!%*#?&).',
  validate: (value) => {
    return /^.*(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[$@$!%*#?&]).*$/.test(value);
  },
});

export default {
  name: 'Login',
  components: {
    ValidationProvider,
  },
  data() {
    return {
      id: '',
      password: '',
      isLogin: true,
      isValid: false,
    };
  },
  methods: {
    checkForm() {
      if (this.id == '' || this.password == '') this.isValid = false;
      else this.isValid = this.id && this.password;
    },
    onSubmit() {
      if (!this.isValid)
        return alert('내용을 다시 한번 확인해주시길 바랍니다.');
      let { id, password } = this;
      let info = {
        id,
        password,
      };
      localStorage.setItem('access-token', '');
      login(
        info,
        (response) => {
          if (response.data.message === 'success') {
            let token = response.data['access-token'];
            localStorage.setItem('access-token', token);
            localStorage.setItem('id', info.id);
            this.$store.commit('SET_LOGGED', true);
            this.$router.push('/');
          } else {
            this.isLoginError = true;
          }
        },
        (error) => {
          console.error(error);
          alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
      );
    },
    loginWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().languageCode = 'ko';
      firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
          let user = {
            id: result.user.email,
            name: result.user.displayName,
            thumbnail_path: result.user.photoURL,
            tag: null,
          };
          socialLogin(
            user,
            (response) => {
              if (response.data.message === 'success') {
                let token = response.data['access-token'];
                localStorage.setItem('access-token', token);
                localStorage.setItem('id', user.id);
                this.$store.commit('SET_LOGGED', true);
                this.$store.commit('SET_USER', user);
                this.$router.push('/');
              } else {
                this.isLoginError = true;
              }
            },
            (error) => {
              console.error(error);
              alert('아이디 또는 비밀번호가 일치하지 않습니다.');
            }
          );
        });
    },
    loginWithKakao() {
      window.Kakao.Auth.login({
        scope: 'profile, account_email',
        success: this.GetMe,
      });
    },
    GetMe() {
      window.Kakao.API.request({
        url: '/v2/user/me',
        success: async (res) => {
          const kakao_account = res.kakao_account;
          const info = {
            id: kakao_account.email,
            name: kakao_account.profile.nickname,
            thumbnail_path: kakao_account.profile.profile_image_url,
            tags: null,
          };
          if (info.id === undefined) {
            this.changeKakao(info);
          } else {
            this.$store.commit('SET_LOGGED', true);
            this.$store.commit('SET_USER', info);
            localStorage.setItem('id', info.id);
            this.closeDialog();
            socialLogin(
              info,
              (response) => {
                if (response.data.message === 'success') {
                  let token = response.data['access-token'];
                  localStorage.setItem('access-token', token);
                  localStorage.setItem('id', info.id);
                  this.$store.commit('SET_LOGGED', true);
                  this.$store.commit('SET_USER', info);
                  this.$router.push('/');
                } else {
                  this.isLoginError = true;
                }
              },
              (error) => {
                console.error(error);
                alert('아이디 또는 비밀번호가 일치하지 않습니다.');
              }
            );
          }
          // }
        },
      });
    },
    closeDialog() {
      this.$emit('closeDialog');
    },
    changeForm() {
      this.$emit('changeJoin');
    },
    changeKakao(info) {
      this.$emit('changeKakao', info);
    },
  },
  watch: {
    id: function() {
      this.checkForm();
    },
    password: function() {
      this.checkForm();
    },
  },
};
</script>

<style></style>