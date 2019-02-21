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
            <template v-if="!currentGood.isShelves">
              <el-input placeholder="选填宝贝利益点 12字内" v-model="currentGood.right">
                <template slot="prepend">利益点</template>
              </el-input>
            </template>
            <template v-if="currentGood.isShelves">
              <el-button type="success" size="small" @click="popGoods">弹宝贝</el-button>
            </template>
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
        <div class="goods-item" v-for="(item, index) in allGoodsList" :key="index">
          <el-button :type="item.isShelves?'danger':'success'" :plain="!item.current" :size="currentIndex===index?'':'small'" style="width: 50px; padding: 9px 0; text-align: center;" @click="selectGoods(index)">{{index+1}}</el-button>
        </div>
        <div class="goods-item">
          <el-button type="primary" :plain="currentIndex!==-1" :size="currentIndex===-1?'':'small'" @click="addNewGoods">{{allGoodsList.length+1}}</el-button>
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
      upGoodsList: [],
      liveId: urlParse().id || 219685085515,
      creatorId: getUserId() || 1950250590,
      mH5Token: getMH5Token() || '9b22671251d623a524b9087970819c20'
    }
  },
  computed: {
    currentGood() {
      let ret = null
      if (this.allGoodsList.length > 0 && this.allGoodsList[this.currentIndex]) {
        ret = this.allGoodsList[this.currentIndex]
      }
      return ret
    },
    // 所有上架和未上架的宝贝
    allGoodsList() {
      return this.upGoodsList.concat(this.goodsList)
    }
  },
  created() {
    let key = 'goodsList_' + this.liveId
    console.log(loadStorage(key))
    if (loadStorage(key)) {
      this.goodsList = loadStorage(key)
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
      let res = {
        headers: {},
        model: {
          imgUrl: 'i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
          extendVal: { useableItem: 'true', isNew: 'false' },
          imgList: [
            '//img.alicdn.com/bao/uploaded/i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
            '//img.alicdn.com/bao/uploaded/i3/4205584633/O1CN01ozoWva1k5xRuTTcVQ_!!4205584633.jpg',
            '//img.alicdn.com/bao/uploaded/i4/4205584633/O1CN01LO2L5d1k5xRtLCaCQ_!!4205584633.jpg',
            '//img.alicdn.com/bao/uploaded/i1/4205584633/O1CN011k5xRd0JLoXObW7_!!4205584633.jpg',
            '//img.alicdn.com/bao/uploaded/i2/4205584633/O1CN01KCiwxv1k5xRnPJG3T_!!4205584633.jpg'
          ],
          height: 0,
          is11: false,
          useable: true,
          width: 0,
          from: 'taobao',
          itemPrice: 156.0,
          itemId: 5804409546973,
          taokprice: '0.00',
          itemTitle: '光希 玻尿酸补水初见面膜 补水保湿修护提亮肤色清洁女正品2'
        },
        httpStatusCode: 200,
        msgCode: 'SUCCESS',
        msgInfo: '成功',
        success: true
      }
      // liveAction(params).then(res => {
      console.log(res)
      if (res.success) {
        let model = res.model
        let { itemTitle, itemPrice, itemId, imgUrl } = model
        let count = 0
        this.allGoodsList.forEach(item => {
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
          // 利益点
          right: '',
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
      // })
    },
    // 上架宝贝
    goodsOnShelves() {
      if (this.currentIndex < 0) {
        return
      }
      let currentGood = this.allGoodsList[this.currentIndex]
      let draft = {
        feedType: '502',
        roomType: 0,
        nodes: [
          {
            type: 'picItem',
            path: currentGood.imgUrl,
            content: currentGood.itemTitle,
            bizId: currentGood.itemId,
            right: currentGood.right
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
      // let res = { headers: {}, model: { isDuplicate: 'true', publishTime: '16:08', itemUrl: '//item.taobao.com/item.htm?id=580440954697' }, httpStatusCode: 200, msgCode: 'SUCCESS', msgInfo: '成功', success: true }
      commonPush(params).then(res => {
        console.log(res)
        if (res.success) {
          currentGood.isShelves = true
        }
        this.saveGoodsList()
      })
    },
    selectGoods(index) {
      this.currentIndex = index
      this.resetGoodsList()
      // this.goodsList[index].current = true
      this.goodsUrl = this.allGoodsList[index].url
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
      let key = 'goodsList_' + this.liveId
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
        // type: 'jsonp',
        // dataType: 'jsonp',
        // callback: 'mtopjsonp1',
        data,
        _: new Date().getTime()
      }
      console.log(params)
      let res = {
        api: 'mtop.mediaplatform.video.livedetail.itemlist.withpagination',
        data: {
          hotList: [],
          subVideoItemList: {},
          totalNum: '3',
          itemList: [
            {
              explained: 'false',
              goodsIndex: '3',
              goodsList: [
                {
                  bulk: 'false',
                  createTime: '1550726727000',
                  duplicate: 'false',
                  extendVal: { isCpc: '0', subTitle: '', customizedItemRights: '号的', defaultRight: '', liveId: 'null', materialName: 'liveItem_486130633' },
                  favored: 'false',
                  goodsIndex: '0',
                  groupNum: '0',
                  hasDiscount: 'false',
                  isCpc: '0',
                  itemH5TaokeUrl: '//h5.m.taobao.com/awp/core/detail.htm?id=566961679422&scm=1007.13381.38597.101200300000000',
                  itemId: '566961679422',
                  itemName: '膜法世家周冬雨定制气垫面膜套装21片深层补水保湿提亮面膜女正品',
                  itemPic: '//gw.alicdn.com/bao/uploaded/i1/368609005/O1CN01T9hPf42GOL4Tr1i5m_!!0-item_pic.jpg',
                  itemPrice: '129.90',
                  itemUrl: '//taoke.mdaren.taobao.com/item.htm?itemId=566961679422&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219685085515_1950250590&spm=a2141.8001249',
                  liveId: '219685085515',
                  sellerId: '0'
                }
              ],
              sliceNum: '0'
            },
            {
              explained: 'false',
              goodsIndex: '2',
              goodsList: [
                {
                  bulk: 'false',
                  createTime: '1550719512000',
                  duplicate: 'false',
                  extendVal: { isCpc: '0', subTitle: '三效合一  以黑吸黑  爆款黑面膜', customizedItemRights: '', defaultRight: '三效合一  以黑吸黑  爆款黑面膜', liveId: 'null', materialName: 'liveItem_486204335' },
                  favored: 'false',
                  goodsIndex: '0',
                  groupNum: '0',
                  hasDiscount: 'false',
                  isCpc: '0',
                  itemH5TaokeUrl: '//h5.m.taobao.com/awp/core/detail.htm?id=44359701868&scm=1007.13381.38597.101200300000000',
                  itemId: '44359701868',
                  itemName: '膜法世家黑面膜21片清洁补水保湿护肤套装提亮肤色嫩肤面膜女正品',
                  itemPic: '//gw.alicdn.com/bao/uploaded/i1/368609005/O1CN01nrw4XV2GOL4StvZxe_!!0-item_pic.jpg',
                  itemPrice: '119.90',
                  itemUrl: '//taoke.mdaren.taobao.com/item.htm?itemId=44359701868&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219685085515_1950250590&spm=a2141.8001249',
                  liveId: '219685085515',
                  sellerId: '0'
                }
              ],
              sliceNum: '0'
            },
            {
              explained: 'false',
              goodsIndex: '1',
              goodsList: [
                {
                  bulk: 'false',
                  createTime: '1550716987000',
                  duplicate: 'false',
                  extendVal: { isCpc: '0', subTitle: '', customizedItemRights: '', defaultRight: '', liveId: 'null', materialName: 'liveItem_489235333' },
                  favored: 'false',
                  goodsIndex: '0',
                  groupNum: '0',
                  hasDiscount: 'false',
                  isCpc: '0',
                  itemH5TaokeUrl: '//h5.m.taobao.com/awp/core/detail.htm?id=580440954697&scm=1007.13381.38597.101200300000000',
                  itemId: '580440954697',
                  itemName: '光希 玻尿酸补水初见面膜 补水保湿修护提亮肤色清洁女正品',
                  itemPic: '//gw.alicdn.com/bao/uploaded/i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
                  itemPrice: '156.00',
                  itemUrl: '//taoke.mdaren.taobao.com/item.htm?itemId=580440954697&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219685085515_1950250590&spm=a2141.8001249',
                  liveId: '219685085515',
                  sellerId: '0'
                }
              ],
              sliceNum: '0'
            }
          ],
          starList: [],
          brandCard: { tmall: 'false' },
          exclusiveIcons: ['//gw.alicdn.com/mt/TB1cUh7b4SYBuNjSsphXXbGvVXa-153-39.png', '//gw.alicdn.com/mt/TB1FKdNeAyWBuNjy0FpXXassXXa-153-39.png']
        },
        ret: ['SUCCESS::调用成功'],
        v: '2.0'
      }
      // getUpGoodsList(params).then(res => {
      console.log(res)
      if (res.data && res.data.itemList) {
        this.itemList = res.data.itemList
        console.log(this.itemList)
        let list = []
        this.itemList.forEach(item => {
          let goods = item.goodsList[0]
          let { itemName, itemPrice, itemId, itemPic, itemUrl } = goods
          let goodsItem = {
            itemTitle: itemName,
            itemPrice,
            itemId,
            url: `https://item.taobao.com/item.htm?id=${itemId}`,
            imgUrl: itemPic,
            // 优惠券链接
            link: '',
            // 利益点
            right: goods.extendVal.customizedItemRights,
            isShelves: true,
            current: false
          }
          list.unshift(goodsItem)
        })
        this.upGoodsList = list
      }
      // })
    },
    // 点击弹宝贝
    popGoods() {
      if (this.currentIndex < 0) {
        return
      }
      let currentGood = this.allGoodsList[this.currentIndex]
      let draft = {
        feedType: '502',
        roomType: 0,
        nodes: [
          {
            type: 'picItem',
            path: currentGood.imgUrl,
            content: currentGood.itemTitle,
            bizId: currentGood.itemId,
            right: currentGood.right
          }
        ],
        parentId: this.liveId,
        feedId: ''
      }
      let params = {
        _input_charset: 'utf-8',
        draft: encodeURIComponent(JSON.stringify(draft))
      }
      commonPush(params).then(res => {
        if (res.success) {
          // 弹宝贝成功，请留意直播间左下角弹出
          this.$message({
            message: '弹宝贝成功，请留意直播间左下角弹出',
            type: 'success'
          })
        } else {
          this.$message.error('弹宝贝失败，' + res.msgInfo);
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
