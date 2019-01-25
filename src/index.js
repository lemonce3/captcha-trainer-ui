import Vue from 'vue';

import App from './App';

const app = new Vue(App);
const appElement = document.createElement('div');
appElement.id = 'app';
document.body.appendChild(appElement);

app.$mount(appElement);