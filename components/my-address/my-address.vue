<template>
	<view>

		<!-- 选择收货地址的盒子 -->
		<view class="address-choose-box" v-if="JSON.stringify(address) === '{}'">
			<button type="primary" size="mini" class="btnChooseAddress" @click="chooseAddress">请选择收货地址+</button>
		</view>

		<!-- 渲染收货信息的盒子 -->
		<view class="address-info-box" v-else @click="chooseAddress">
			<view class="row1">
				<view class="row1-left">
					<view class="username">收货人：<text>{{address.userName}}</text></view>
				</view>
				<view class="row1-right">
					<view class="phone">电话：<text>{{address.telNumber}}</text></view>
					<uni-icons type="arrowright" size="16"></uni-icons>
				</view>
			</view>
			<view class="row2">
				<view class="row2-left">收货地址：</view>
				<view class="row2-right">{{addstr}}</view>
			</view>
		</view>

		<!-- 底部的边框线 -->
		<image src="/static/cart_border@2x.png" class="address-border"></image>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations,
		mapGetters
	} from 'vuex'
	export default {
		name: "my-address",
		data() {
			return {
				
			};
		},
		methods: {
			...mapMutations('m_user', ['updateAddress']),
			// 选择收货地址（修复兼容版）
			chooseAddress() {
				uni.chooseAddress({
					success: (succ) => {
						this.updateAddress(succ)
					},
					fail: (err) => {
						if (err.errMsg === 'chooseAddress:fail auth deny' || err.errMsg === 'chooseAddress:fail authorize no response') {
							this.reAuth()
						}
					}
				})
			},
			// 重新授权
			reAuth() {
				uni.showModal({
					content: '检测到您没打开地址权限，是否去设置打开？',
					confirmText: "确认",
					cancelText: "取消",
					success: (confirmResult) => {
						if (confirmResult.cancel) return uni.$showMsg('您取消了地址授权！')
						if (confirmResult.confirm) {
							uni.openSetting({
								success: (settingResult) => {
									if (settingResult.authSetting['scope.address']) {
										uni.$showMsg('授权成功！请选择地址')
									} else {
										uni.$showMsg('您取消了地址授权！')
									}
								}
							})
						}
					}
				})
			}
		},
		computed: {
			...mapState('m_user', ['address']),
			...mapGetters('m_user', ['addstr']),
		}
	}
</script>

<style lang="scss">
	.address-border {
		display: block;
		width: 100%;
		height: 5px;
	}
	.address-choose-box {
		height: 90px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.address-info-box {
		font-size: 12px;
		height: 90px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 5px;
		.row1 {
			display: flex;
			justify-content: space-between;
			.row1-right {
				display: flex;
				align-items: center;
				.phone {
					margin-right: 5px;
				}
			}
		}
		.row2 {
			display: flex;
			align-items: center;
			margin-top: 10px;
			.row2-left {
				white-space: nowrap;
			}
		}
	}
</style>