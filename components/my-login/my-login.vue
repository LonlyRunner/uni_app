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

					// 换取 token - 使用真实接口
					let loginResult
					try {
						const { data } = await uni.$http.post('/api/public/v1/users/wxlogin', query)
						loginResult = data
					} catch (apiError) {
						console.log('接口调用失败:', apiError)
						// 网络错误时使用测试模式
						loginResult = null
					}
					
					console.log('登录接口响应:', loginResult)
					
					// 判断登录是否成功，失败则使用测试模式
					if (!loginResult || loginResult.meta.status !== 200) {
						console.log('真实登录失败，使用演示模式:', loginResult?.meta?.msg || '未知错误')
						uni.showModal({
							title: '提示',
							content: '当前网络环境下无法完成真实登录，是否使用演示模式继续？',
							success: (modalRes) => {
								if (modalRes.confirm) {
									// 使用演示 token
									this.updateToken('demo_token_' + Date.now())
									console.log('使用演示模式登录')
									this.navigateBack()
								}
							}
						})
						return
					}

					// 更新 vuex 中的 token
					this.updateToken(loginResult.message.token)
					console.log('token 更新成功:', loginResult.message.token)
					
					// 判断 vuex 中的 redirectInfo 是否为 null
					// 如果不为 null，则登录成功之后，需要重新导航到对应的页面
					this.navigateBack()
				} catch (err) {
					console.log('登录过程发生异常:', err)
					uni.$showMsg('登录过程发生错误！')
				}
			},
			// 返回登录之前的页面或跳转到首页
			navigateBack() {
			  // 如果有重定向信息，根据 openType 选择正确的导航方式
			  if (this.redirectInfo) {
			    if (this.redirectInfo.openType === 'switchTab') {
			      // switchTab 用于 tabBar 页面
			      uni.switchTab({
			        url: this.redirectInfo.from,
			        complete: () => {
			          this.updateRedirectInfo(null)
			        }
			      })
			    } else if (this.redirectInfo.openType === 'navigateBack') {
			      // navigateBack 返回上一页
			      uni.navigateBack({
			        delta: this.redirectInfo.delta || 1,
			        complete: () => {
			          this.updateRedirectInfo(null)
			        }
			      })
			    } else if (this.redirectInfo.openType === 'redirectTo') {
			      // redirectTo 跳转到非 tabBar 页面
			      uni.redirectTo({
			        url: this.redirectInfo.from,
			        complete: () => {
			          this.updateRedirectInfo(null)
			        }
			      })
			    } else {
			      // 默认使用 switchTab 跳转到首页
			      uni.switchTab({
			        url: '/pages/home/home',
			        complete: () => {
			          this.updateRedirectInfo(null)
			        }
			      })
			    }
			  } else {
			    // 如果没有重定向信息，尝试返回上一页
			    uni.navigateBack({
			      delta: 1,
			      fail: () => {
			        // 如果页面栈为空，跳转到首页
			        uni.switchTab({
			          url: '/pages/home/home',
			          complete: () => {
			            this.updateRedirectInfo(null)
			          }
		        })
			      },
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