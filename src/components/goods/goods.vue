<template>
  <div class="goods-wrapper">
    <div class="search-box">
      <el-input placeholder="请输入淘宝商品链接" v-model="goodsUrl" class="input-with-select">
        <i class="el-icon-warning" slot="prepend"></i>
        <el-button slot="append" icon="el-icon-search" @click.native="addGoods(goodsUrl)"></el-button>
      </el-input>
      <div class="good-detail" v-if="currentGood">
        <img class="img" :src="currentGood.imgUrl + '_160x160.jpg_.webp'" alt="">
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
          <el-button :type="item.isShelves?'danger':'success'" :plain="!item.current" :size="currentIndex===index?'':'small'" style="width: 50px; padding: 9px 0; text-align: center;" @click="selectGoods(index)">{{index+1}}</el-button>
        </div>
        <div class="goods-item">
          <el-button type="primary" :plain="currentIndex!==-1" :size="currentIndex===-1?'':'small'" @click="addNewGoods">{{goodsList.length+1}}</el-button>
        </div>
      </div>
    </div>
    <div style="margin-top: 10px;">
      <el-button type="success" size="mini" @click="goodsOnShelves">上架</el-button>
      <el-button size="mini">刷新</el-button>
      <el-button size="mini">前移</el-button>
      <el-button size="mini">后移</el-button>
      <el-button type="danger" size="mini">删除</el-button>
    </div>
  </div>
</template>

<script>
import { liveAction, commonPush, getUpGoodsList } from '@/api'
import { baseImgUrl } from '@/util/config'
import { urlParse, saveStorage, loadStorage } from '@/util/tools'
import { getUserId, getMH5Token } from '@/util/token'
import setPass from '@/util/pass'
export default {
  name: 'App',
  data() {
    return {
      goodsUrl: '',
      currentIndex: -1,
      goodsList: [],
      liveId: urlParse().id || 219685085515,
      creatorId: getUserId() || 1950250590,
      mH5Token: getMH5Token() || 'edbffad6595b5cad86dcc0f9edc430df'
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
    let key = 'goodsList_' + this.liveId
    if (loadStorage(key)) {
      this.goodsList = JSON.parse(loadStorage(key))
      this.resetGoodsList()
    }
    this.getUpGoods()
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
      //       itemId: 5804409546973,
      //       taokprice: '0.00',
      //       itemTitle: '光希 玻尿酸补水初见面膜 补水保湿修护提亮肤色清洁女正品2'
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
          let count = 0
          this.goodsList.forEach(item => {
            if (item.itemId === itemId) {
              count++
            }
          })
          if (count > 0) {
            this.$message.error('宝贝重复添加')
            return
          }
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
            isShelves: false,
            current: true
          }
          this.resetGoodsList()
          this.goodsList.push(item)
          this.saveGoodsList()
          this.currentIndex = this.goodsList.length - 1
        } else {
          this.$message.error(res.msgInfo)
        }
      })
    },
    // 上架宝贝
    goodsOnShelves() {
      if (this.currentIndex < 0) {
        return
      }
      let currentGood = this.goodsList[this.currentIndex]
      let draft = {
        feedType: '502',
        roomType: 0,
        nodes: [
          {
            type: 'picItem',
            path: currentGood.imgUrl,
            content: currentGood.itemTitle,
            bizId: currentGood.itemId,
            right: ''
          }
        ],
        parentId: this.liveId,
        feedId: ''
      }
      let params = {
        _input_charset: 'utf-8',
        draft: encodeURIComponent(JSON.stringify(draft))
      }
      //   let res = { headers: {}, model: { publishTime: '15:12', itemUrl: '//item.taobao.com/item.htm?id=577224665084' }, httpStatusCode: 200, msgCode: 'SUCCESS', msgInfo: '成功', success: true }
      let res = { headers: {}, model: { isDuplicate: 'true', publishTime: '16:08', itemUrl: '//item.taobao.com/item.htm?id=580440954697' }, httpStatusCode: 200, msgCode: 'SUCCESS', msgInfo: '成功', success: true }
      //   commonPush(params).then(res => {
      console.log(res)
      if (res.success) {
        currentGood.isShelves = true
      }
      this.saveGoodsList()
      //   })
    },
    selectGoods(index) {
      this.currentIndex = index
      this.resetGoodsList()
      this.goodsList[index].current = true
      this.goodsUrl = this.goodsList[index].url
    },
    addNewGoods() {
      this.goodsUrl = ''
      this.currentIndex = -1
      this.resetGoodsList()
    },
    // 重置宝贝的current
    resetGoodsList() {
      this.goodsList.forEach(item => {
        item.current = false
      })
    },
    saveGoodsList() {
      let key = 'goodList_' + this.liveId
      saveStorage(key, this.goodsList)
    },
    getUpGoods() {
      let t = new Date().getTime()
      let appKey = '12574478'

      // let nData = '{"pageCode":"mainIndex","ua":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36","params":"{\"url\":\"https://h5.m.taobao.com/\",\"referrer\":\"https://liveplatform.taobao.com/live/live_detail.htm?id=219685085515&openHlvPush=true\",\"oneId\":null,\"fid\":\"dqYCjwrIF0A\"}'
      let data = JSON.stringify({ liveId: this.liveId, creatorId: this.creatorId, n: 20, groupNum: 0 })
      let key = this.mH5Token + '&' + t + '&' + appKey + '&' + data
      console.log(key)
      let sign = setPass(key)
      let params = {
        jsv: '2.4.0',
        appKey: '12574478',
        t,
        sign,
        api: 'mtop.mediaplatform.video.livedetail.itemlist.withpagination',
        v: '2.0',
        type: 'jsonp',
        dataType: 'jsonp',
        // callback: 'mtopjsonp1',
        data,
        _: new Date().getTime()
      }
      console.log(params)
      getUpGoodsList(params).then(res => {
        console.log(res)
        if (res.data && res.data.itemList) {
          this.itemList = res.data.itemList
          console.log(this.itemList)
          this.itemList.forEach((item) => {
            let goods = item.goodsList[0]
            let { itemTitle, itemPrice, itemId, itemPic, itemUrl } = goods
            let goodsItem = {
              itemTitle,
              itemPrice,
              itemId,
              url: itemUrl,
              imgUrl: itemPic,
              // 优惠券链接
              link: '',
              isShelves: true,
              current: true
            }
            this.goodsList.unshift(goodsItem)
          })
        }
      })
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
      height: 34px;
      margin: 5px 5px;
      display: inline-block;
    }
  }
}
</style>
