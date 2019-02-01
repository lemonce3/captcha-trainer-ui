<template>
	
<div id="app">
	<div>
		<canvas id="captcha" width="375" height="125"
			ref="canvas" />
	</div>
	<div>
		<input
			v-model="value"
			id="value"
			maxlength="4"
			:disabled="prevent"
			@keyup.enter="submit"
			ref="input" />
		<p v-if="valid">符合要求，按回车键继续</p>
		<p v-if="!valid">数字与小写字母，但不包含0, 1, 9, g, l, q, o, 6, b</p>
	</div>
	<div id="panel">
		<table style="display:inline-block">
			<thead>
				<th>正确</th>
				<th>错误</th>
				<th>总计</th>
			</thead>
			<tbody>
				<td>{{ok}}</td>
				<td>{{error}}</td>
				<td>{{ok+error}}</td>
			</tbody>
		</table>
	</div>
	<div>
		<button @click="reset">重置</button>
	</div>
</div>

</template>

<script>
import axios from 'axios';
import Cookie from 'js-cookie';

const THRESHOLD = 150;
const VALUE_REG = /[234578ac-fhijkmnpr-z]{4}/;

export default {
	data() {
		return {
			value: '',
			prevent: false,
			session: '',
			ok: 0,
			error: 0
		}
	},
	watch: {
		value(value) {
			if (value.length > 4) {
				this.value = value.substr(0, 4);
			}
		}
	},
	computed: {
		context() {
			return this.$refs.canvas.getContext('2d');
		},
		valid() {
			return VALUE_REG.test(this.value);
		}
	},
	methods: {
		setOk() {
			return Cookie.set('ok', ++this.ok);
		},
		setError() {
			return Cookie.set('error', ++this.error);
		},
		reset() {
			Cookie.set('ok', this.ok = 0);
			Cookie.set('error', this.error = 0);
		},
		async submit() {
			if (!this.valid) {
				return;
			}

			try {
				this.prevent = true;
				await axios.post('/sample', {
					value: this.value,
					captcha: this.$refs.canvas.toDataURL('image/png'),
					session: this.session
				});

				this.setOk();
			} catch (error) {
				this.setError();
			} finally {
				this.init();
			}
		},
		focus() {
			setTimeout(() => {
				this.value = '';
				this.$refs.input.focus();
			}, 30);
		},
		async init() {
			this.prevent = true;

			const { data: { captcha, session } } = await axios.get('/captcha');

			this.session = session;

			const captchaImage = new Image();
			captchaImage.src = `data:image/jpeg;base64,${captcha}`;
			captchaImage.onload = () => {
				this.context.drawImage(captchaImage, 0, 0, 375, 125);
				const imageData = this.context.getImageData(0, 0, 375, 125);
				
        for (let i = 0; i < imageData.data.length; i += 4) {
					const R = imageData.data[i]; //R(0-255)
					const G = imageData.data[i + 1]; //G(0-255)
					const B = imageData.data[i + 2]; //B(0-255)
					
					imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] =
						(R + G + B) / 3 > THRESHOLD ? 255 : 0;
				}
				
				this.context.putImageData(imageData, 0, 0);
				this.prevent = false;
				this.focus();
			};
		}
	},
	mounted() {
		this.init();
		window.addEventListener('focus', () => {
			this.focus();
		});

		const ok = Cookie.get('ok');

		if (ok === undefined) {
			Cookie.set('ok', 0);
		}

		this.ok = Number(Cookie.get('ok'));

		const error = Cookie.get('error');

		if (error === undefined) {
			Cookie.set('error', 0);
		}

		this.error = Number(Cookie.get('error'));
	}
}
</script>

<style>
#captcha {
	border: 1px solid #000;
	width: 375px;
	height: 125px;
	display: inline-block;
}

#value {
	display: inline-block;
	width: 3em;
	font-size: 96px;
	font-family: 'consolas';
	text-align: center;
}

body {
	height: 100%;
	overflow: hidden;
	background: #f5f5d5;
}

#app {
	margin-top: 10%;
}

#app > div {
	text-align: center;
}

</style>
