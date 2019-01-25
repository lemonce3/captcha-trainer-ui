<template>
	
<div>
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
		<p v-if="valid">符合要求，可以按回车键继续</p>
		<p v-if="!valid">
			请尽力确保正确，在输入正确的值之前限制提交。<br/>
			数字与小写字母，但不包含0, 1, 9, g, l, q, o
		</p>
	</div>
</div>

</template>

<script>
import axios from 'axios';
const THRESHOLD = 150;
const VALUE_REG = /[2-8a-fhijkmnpr-z]{4}/;

export default {
	data() {
		return {
			value: '',
			prevent: false,
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
		async submit() {
			if (!this.valid) {
				return;
			}

			try {
				this.prevent = true;
				await axios.post('/sample', {
					value: this.value,
					captcha: this.$refs.canvas.toDataURL('image/png')
				});
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
		init() {
			this.prevent = true;

			const captchaImage = new Image();
			captchaImage.src = `/captcha?time=${Date.now()}`;
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
	}
}
</script>

<style>
#captcha {
	border: 1px solid #000;
	width: 375px;
	height: 125px;
}

#value {
	width: 3em;
	font-size: 72px;
	font-family: 'consolas';
	text-align: center;
}
</style>
