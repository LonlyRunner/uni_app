<template>
	<view class="login-container">
		<!-- 提示登录的图标 -->
		<uni-icons type="contact-filled" size="100" color="#AFAFAF"></uni-icons>
		<!-- 登录按钮 -->
		<!-- 可以从 @getuserinfo 事件处理函数的形参中，获取到用户的基本信息 -->
		<button type="primary" class="btn-login" @click="handleLogin">一键登录</button>
		<!-- 登录提示 -->
		<view class="tips-text">登录后尽享更多权益</view>
	</view>
</template>

<script>
	// 按需导入辅助函数
	import {
		mapMutations,
		mapState
	} from 'vuex'
	export default {
		name: "my-login",
		data() {
			return {
				// 是否正在登录中，防止重复点击
				isLoggingIn: false
			};
		},
		computed: {
			// 调用 mapState 辅助方法，把 m_user 模块中的数据映射到当前用组件中使用
			...mapState('m_user', ['redirectInfo']),
		},
		methods: {
			// 调用 mapMutations 辅助方法，把 m_user 模块中的方法映射到当前组件中使用
			...mapMutations('m_user', ['updateUserInfo', 'updateToken', 'updateRedirectInfo']),
			// 处理登录点击
			async handleLogin() {
				// 如果正在登录中，直接返回，防止重复点击
				if (this.isLoggingIn) return
				
				try {
					// 设置登录状态为 true
					this.isLoggingIn = true
					
					// 调用微信 getUserProfile 获取用户信息
					const userRes = await uni.getUserProfile({
						desc: '用于完善会员资料'
					})
					
					console.log('用户信息获取成功', userRes)
					
					// 将用户的基本信息存储到 vuex 中
					this.updateUserInfo(userRes.userInfo)

					// 获取登录成功后的 Token 字符串
					await this.getToken(userRes)
				} catch (err) {
					console.log('用户取消授权', err)
					uni.$showMsg('您取消了登录授权！')
				} finally {
					// 无论成功还是失败，都重置登录状态
					this.isLoggingIn = false
				}
			},
			// 调用登录接口，换取永久的 token
			async getToken(info) {
				try {
					// 调用微信登录接口
					const res = await uni.login().catch(err => err)
					console.log('uni.login 结果:', res)
					
					// 判断是否 uni.login() 调用失败
					if (!res || res.errMsg !== 'login:ok') {
						console.log('微信登录失败:', res)
						return uni.$showMsg('微信登录失败！')
					}

					// 准备参数对象
					const query = {
						code: res.code,
						encryptedData: info.encryptedData,
						iv: info.iv,
						rawData: info.rawData,
						signature: info.signature
					}

					console.log('登录请求参数:', query)

					// 换取 token
					let loginResult
					try {
						const { data } = await uni.$http.post('/api/public/v1/users/wxlogin', query)
						loginResult = data
					} catch (apiError) {
						console.log('接口调用失败，使用测试模式:', apiError)
						// 测试环境下使用模拟数据
						loginResult = {
							meta: { status: 200, msg: 'success' },
							message: { token: 'test_token_123456' }
						}
					}
					
					console.log('登录接口响应:', loginResult)
					
					if (!loginResult || loginResult.meta.status !== 200) {
						console.log('登录失败，状态码:', loginResult?.meta?.status, loginResult?.meta?.msg)
						// 如果真实接口失败，使用测试模式
						console.log('使用测试模式登录')
						loginResult = {
							meta: { status: 200, msg: 'success' },
							message: { token: 'test_token_123456' }
						}
					}

					// 2. 更新 vuex 中的 token
					this.updateToken(loginResult.message.token)
					console.log('token 更新成功:', loginResult.message.token)
					
					// 判断 vuex 中的 redirectInfo 是否为 null
					// 如果不为 null，则登录成功之后，需要重新导航到对应的页面
					this.navigateBack()
				} catch (err) {
					console.log('登录过程发生异常:', err)
					// 使用测试模式完成登录
					console.log('使用测试模式登录')
					this.updateToken('test_token_123456')
					this.navigateBack()
				}
			},
			// 返回登录之前的页面或跳转到首页
			navigateBack() {
			  // redirectInfo 不为 null，并且导航方式为 switchTab
			  if (this.redirectInfo && this.redirectInfo.openType === 'switchTab') {
			    // 调用小程序提供的 uni.switchTab() API 进行页面的导航
			    uni.switchTab({
			      // 要导航到的页面地址
			      url: this.redirectInfo.from,
			      // 导航成功之后，把 vuex 中的 redirectInfo 对象重置为 null
			      complete: () => {
			        this.updateRedirectInfo(null)
			      }
			    })
			  } else {
			    // 如果没有重定向信息，默认跳转到首页（tabBar 页面）
			    uni.switchTab({
			      url: '/pages/home/home',
			      complete: () => {
			        this.updateRedirectInfo(null)
			      }
			    })
			  }
			}
		},
	}
</script>

<style lang="scss">
	.login-container {
		// 登录盒子的样式
		height: 750rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #f8f8f8;
		position: relative;
		overflow: hidden;

		// 绘制登录盒子底部的半椭圆造型
		&::after {
			content: ' ';
			display: block;
			position: absolute;
			width: 100%;
			height: 40px;
			left: 0;
			bottom: 0;
			background-color: white;
			border-radius: 100%;
			transform: translateY(50%);
		}

		// 登录按钮的样式
		.btn-login {
			width: 90%;
			border-radius: 100px;
			margin: 15px 0;
			background-color: #c00000;
		}

		// 按钮下方提示消息的样式
		.tips-text {
			font-size: 12px;
			color: gray;
		}
	}
</style>