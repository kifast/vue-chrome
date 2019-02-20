<template>
  <div class="goods-wrapper">
    <div class="search-box">
      <el-input placeholder="请输入淘宝商品链接" v-model="goodsUrl" class="input-with-select">
        <i class="el-icon-warning" slot="prepend"></i>
        <el-button slot="append" icon="el-icon-search" @click.native="addGoods(goodsUrl)"></el-button>
      </el-input>
      <div class="good-detail" v-if="currentGood">
        <img class="img" :src="currentGood.imgUrl" alt="">
        <div class="detail">
          <a :href="currentGood.url" class="link">{{currentGood.itemTitle}}</a>
          <div class="flex">
            <i class="price">¥{{currentGood.itemPrice}}</i>
            <el-input placeholder="选填宝贝利益点 12字内">
              <template slot="prepend">利益点</template>
            </el-input>
          </div>
          <div style="margin-top: 10px;">
            <el-input placeholder="请输入此商品优惠券链接">
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>
        </div>
      </div>
    </div>
    <div class="search-box" style="margin-top: 10px;">
      <div class="goods-list">
        <div class="goods-item" v-for="(item, index) in goodsList" :key="index">
          <el-button type="success" :plain="!item.current" :size="currentIndex===index?'':'small'" style="width: 50px; padding: 9px 0; text-align: center;" @click="selectGood(index)">{{index+1}}</el-button>
        </div>
        <div class="goods-item">
          <el-button type="primary" plain size="small">{{goodsList.length+1}}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { liveAction } from '@/api'
import { baseImgUrl } from '@/util/config'
export default {
  name: 'App',
  data() {
    return {
      goodsUrl: '',
      currentIndex: -1,
      goodsList: []
    }
  },
  computed: {
    currentGood() {
      let ret = null
      if (this.goodsList.length > 0 && this.goodsList[this.currentIndex]) {
        ret = this.goodsList[this.currentIndex]
      }
      return ret
    }
  },
  created() {
    if (localStorage.goodsList) {
      this.goodsList = JSON.parse(localStorage.goodsList)
      this.selectGood(this.goodsList[0])
    }
  },
  methods: {
    // 查询商品
    addGoods(url) {
      if (url === '') {
        this.$message.error('宝贝链接有误')
        return
      }
      //   if (!url.startWidth('https://')) {
      //       this.$message.error('宝贝链接有误')
      //       return
      //   }
      let params = {
        api: 'item_getItem',
        url: encodeURI(url),
        _: new Date().getTime()
      }
      //   let res = {
      //     headers: {},
      //     model: {
      //       imgUrl: 'i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
      //       extendVal: { useableItem: 'true', isNew: 'false' },
      //       imgList: [
      //         '//img.alicdn.com/bao/uploaded/i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
      //         '//img.alicdn.com/bao/uploaded/i3/4205584633/O1CN01ozoWva1k5xRuTTcVQ_!!4205584633.jpg',
      //         '//img.alicdn.com/bao/uploaded/i4/4205584633/O1CN01LO2L5d1k5xRtLCaCQ_!!4205584633.jpg',
      //         '//img.alicdn.com/bao/uploaded/i1/4205584633/O1CN011k5xRd0JLoXObW7_!!4205584633.jpg',
      //         '//img.alicdn.com/bao/uploaded/i2/4205584633/O1CN01KCiwxv1k5xRnPJG3T_!!4205584633.jpg'
      //       ],
      //       height: 0,
      //       is11: false,
      //       useable: true,
      //       width: 0,
      //       from: 'taobao',
      //       itemPrice: 156.0,
      //       itemId: 580440954697,
      //       taokprice: '0.00',
      //       itemTitle: '光希 玻尿酸补水初见面膜 补水保湿修护提亮肤色清洁女正品'
      //     },
      //     httpStatusCode: 200,
      //     msgCode: 'SUCCESS',
      //     msgInfo: '成功',
      //     success: true
      //   }
      liveAction(params).then(res => {
        console.log(res)
        if (res.success) {
          let model = res.model
          let { itemTitle, itemPrice, itemId, imgUrl } = model
          let item = {
            itemTitle,
            itemPrice,
            itemId,
            // 图片地址
            imgUrl: baseImgUrl + imgUrl,
            // 商品链接
            url: url,
            // 优惠券链接
            link: '',
            current: true
          }
          this.goodsList.forEach(item => {
            item.current = false
          })
          this.goodsList.push(item)
          localStorage.goodsList = JSON.stringify(this.goodsList)
          this.currentIndex = this.goodsList.length - 1
        } else {
          this.$message.error(res.msgInfo)
        }
      })
    },
    selectGood(index) {
      this.currentIndex = index
      this.goodsList.forEach(item => {
        item.current = false
      })
      this.goodsList[index].current = true
    }
  },
  components: {}
}
</script>

<style lang="less">
.goods-wrapper {
  .good-detail {
    display: flex;
    padding: 5px;
    .img {
      width: 160px;
      height: 160px;
      border: 1px solid #ddd;
      box-sizing: border-box;
      padding: 4px;
      border-radius: 2px;
      background: #fff;
    }
    .detail {
      margin-left: 10px;
      flex: 1;
      .link {
        text-decoration: none;
        color: #0a8fdc;
      }
      .flex {
        margin-top: 10px;
        .price {
          color: rgb(255, 68, 0);
          flex: 1;
        }
        .el-input {
          width: 300px;
        }
      }
    }
  }
  .goods-list {
    .goods-item {
      margin: 5px 5px;
      display: inline-block;
    }
  }
}
</style>
