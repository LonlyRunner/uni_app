<template>
	<view class="cart-container" v-if="cart.length !== 0">
		<!-- 使用自定义的 address 组件 -->
		<my-address></my-address>
		<!-- 购物车商品列表的标题区域 -->
		<view class="cart-title">
			<uni-icons type="shop" size="18"></uni-icons>
			<text class="cart-title-text">购物车</text>
		</view>
		<!-- 商品列表区域 -->
		<view v-for="(goods, i) in cart" :key="i" class="cart-item">
			<my-goods :goods="goods" :show-radio="true" :show-num="true" @radio-change="radioChangeHandler" @num-change="numberChangeHandler"></my-goods>
			<button @click="removeGoods(goods.goods_id)" class="delete-btn">删除</button>
		</view>
		<!-- 结算区域 -->
		<my-settle></my-settle>

	</view>
	 <!-- 空白购物车区域 -->
	  <view class="empty-cart" v-else>
	    <image src="/static/cart_empty@2x.png" class="empty-img"></image>
	    <text class="tip-text">空空如也~</text>
	  </view>
</template>

<script>
	import badgeMix from '@/mixins/tabbar-badge.js'
	import {
		mapState,
		mapMutations,
		mapGetters
	} from 'vuex'

	export default {
		mixins: [badgeMix],
		computed: {
			...mapState('m_cart', ['cart']),
			...mapGetters('m_cart', ['total']),
		},
		onShow() {
			this.setBadge()
		},
		methods: {
			...mapMutations('m_cart', ['updateGoodsState', 'updateGoodsCount', 'removeGoodsById']),
			radioChangeHandler(e) {
				this.updateGoodsState(e)
				this.setBadge()
			},
			numberChangeHandler(e) {
				this.updateGoodsCount(e)
				this.setBadge()
			},
			removeGoods(goods_id) {
				this.removeGoodsById(goods_id)
				this.setBadge()
			}
		}
	}
</script>

<style lang="scss">
	.cart-title {
		height: 40px;
		display: flex;
		align-items: center;
		font-size: 14px;
		padding-left: 5px;
		border-bottom: 1px solid #efefef;
	}

	.cart-title-text {
		margin-left: 10px;
	}

	.cart-item {
		display: flex;
		align-items: center;
		padding-right: 10px;
	}

	.delete-btn {
		background-color: #C00000;
		color: #fff;
		font-size: 12px;
		padding: 5px 10px;
		border-radius: 5px;
		margin-left: 5px;
		flex-shrink: 0;
	}

	.empty-cart {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
		color: #999;
	}
	.empty-cart {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  padding-top: 150px;

	  .empty-img {
	    width: 90px;
	    height: 90px;
	  }

	  .tip-text {
	    font-size: 12px;
	    color: gray;
	    margin-top: 15px;
	  }
	}
</style>