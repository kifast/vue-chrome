<template>
  <div class="goods-wrapper">
    <div class="search-box">
      <el-input placeholder="请输入淘宝商品链接" v-model="goodsUrl" class="input-with-select" @keyup.enter.native="addGoods(goodsUrl)">
        <!-- <i class="el-icon-warning" slot="prepend"></i> -->
        <el-button slot="append" icon="el-icon-search" @click.native="addGoods(goodsUrl)"></el-button>
      </el-input>
      <div class="good-detail" v-if="currentGood">
        <img class="img" :src="currentGood.imgUrl + '_160x160.jpg_.webp'" alt="">
        <div class="detail">
          <a :href="currentGood.url" class="link">{{currentGood.itemTitle}}</a>
          <div class="flex">
            <i class="price">¥{{currentGood.itemPrice}}</i>
            <template v-if="!currentGood.isShelves">
              <el-input placeholder="选填宝贝利益点 12字内" v-model="currentGood.right" maxlength="12">
                <template slot="prepend">利益点</template>
              </el-input>
            </template>
            <template v-if="currentGood.isShelves">
              <el-button type="success" size="small" @click="popGoods">弹宝贝</el-button>
            </template>
          </div>
          <div style="margin-top: 10px;">
            <el-input placeholder="请输入此商品优惠券链接" v-model="currentGood.coupon.url" @keyup.enter.native="saveCoupon">
              <el-button slot="append" icon="el-icon-search" @click="saveCoupon"></el-button>
            </el-input>
            <div v-if="currentGood.coupon.shopNick">
              <div class="flex">
                <div style="flex: 1; font-size: 18px;">{{currentGood.coupon.shopNick}}商品优惠券</div>
                <el-button type="primary" size="small" @click="couponAddMaterial(currentGood.coupon)">立即发送</el-button>
                <el-button type="danger" size="small" @click="delCoupon(currentGood.coupon)">删除优惠券</el-button>
              </div>
              <div class="flex" style="margin-top: 10px;">
                <div style="flex: 1; font-size: 12px;">满{{currentGood.coupon.currencyUnit}}{{currentGood.coupon.startFee}}~减{{currentGood.coupon.currencyUnit}}{{currentGood.coupon.discount}}</div>
                <div style="font-size: 12px; color: #999;">有效期： {{currentGood.coupon.startTime}}~{{currentGood.coupon.endTime}}</div>
              </div>
            </div>
          </div>
          <div class="flex" style="margin-top: 10px;" v-if="!currentGood.isShelves">
            <span style="flex: 1;"></span>
            <el-button size="mini" @click="refreshGoods">刷新</el-button>
            <el-button size="mini" :disabled="realIndex===0" @click="prevMove">前移</el-button>
            <el-button size="mini" :disabled="realIndex===goodsList.length-1" @click="nextMove">后移</el-button>
            <el-button type="success" size="small" @click="goodsOnShelvesConfirm">上架</el-button>
            <el-button type="danger" size="small" @click="delGoods">删除商品</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="search-box" style="margin-top: 10px;">
      <div class="goods-list">
        <div class="goods-item" v-for="(item, index) in allGoodsList" :key="index" @click="selectGoods(index)">
          <el-button :type="item.isShelves?'danger':'success'" :plain="!(item.current || currentIndex===index)" :size="currentIndex===index?'':'small'" style="width: 50px; padding: 9px 0; text-align: center;">{{index+1}}</el-button>
          <i v-if="item.right" class="el-icon-circle-check"></i>
          <i v-if="item.coupon&&item.coupon.shopNick" class="el-icon-tickets"></i>
        </div>
        <div class="goods-item">
          <el-button type="primary" :plain="currentIndex!==-1" :size="currentIndex===-1?'':'small'" @click="addNewGoods">{{allGoodsList.length+1}}</el-button>
        </div>
        <div class="goods-item">
          <el-button type="primary" @click="showBatchAdd">批量添加宝贝</el-button>
        </div>
      </div>
    </div>
    <div style="margin-top: 10px; font-size: 13px; color: #666; line-height: 1.5;">
      <span style="font-size: 16px;">使用帮助：</span><br>
      在宝贝列表中，已上线宝贝编号显示为红色、待上线宝贝显示为绿色。选中蓝色按钮可添加新的待上线宝贝。<br>
      已上线（红色）宝贝不可删除、不可移动位置。待上线宝贝（绿色）可删除、可移动位置。<br>
    </div>
    <el-dialog title="批量导入宝贝" :visible.sync="dialogVisible" width="700px">
      <el-steps :active="dialogActive" finish-status="success" simple style="margin-top: 20px">
        <el-step title="输入宝贝链接"></el-step>
        <el-step title="选择导入宝贝"></el-step>
        <el-step title="导入宝贝信息"></el-step>
      </el-steps>
      <el-input v-if="dialogActive===0" type="textarea" v-model="dialogText" :rows="10" style="margin-top: 10px;" placeholder="请输入以换行分隔的宝贝链接
点击下一步预览和编辑宝贝信息"></el-input>
      <div v-if="dialogActive===1" style="overflow-y: auto;overflow-x: hidden; max-height: 600px;">
        <el-table ref="multipleTable" :data="batchGoodsList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column label="宝贝信息">
            <template slot-scope="scope">
              <div class="flex">
                <img style="width: 50px; height: 50px;" :src="scope.row.imgUrl + '_160x160.jpg_.webp'" alt="">
                <div style="flex: 1; margin-left: 10px;">
                  <div>
                    {{scope.row.itemTitle}}
                  </div>
                  <div style="color: rgb(255, 68, 0);">
                    ￥{{scope.row.itemPrice}}
                  </div>
                  <div>
                    <a :href="scope.row.url" class="dialog-link">{{scope.row.url}}</a>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 10px;">提示：不能添加<b style="color: #f00;">已上架、已在列表中、链接错误</b>的宝贝(如有的话会被排除)</div>
      </div>
      <div class="flex" style="margin-top: 10px;">
        <span style="flex: 1;"></span>
        <el-button type="success" size="mini" @click="prevStep" :disabled="dialogActive===0">上一步</el-button>
        <el-button type="success" size="mini" @click="nextStep" v-if="dialogActive===0">下一步</el-button>
        <el-button type="primary" size="mini" @click="nextStep" v-if="dialogActive===1" :disabled="dialogActive===1&&batchSelection.length===0">导入宝贝</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { liveAction, commonPush, getUpGoodsList, getCoupon, addMaterial } from '@/api'
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
      feedId: urlParse().id,
      liveId: urlParse().id, // || 219968464906,
      creatorId: getUserId(), // || 1950250590,
      // mH5Token: getMH5Token() || 'a8326f56f7d93aedb4ed46cca53851df',
      dialogVisible: false,
      // 批量导入步骤
      dialogActive: 0,
      dialogText: '',
      batchGoodsList: [],
      batchSelection: [],
      couponMap: {}
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
    // goodsList的index
    realIndex() {
      return this.currentIndex - this.upGoodsList.length
    },
    // 所有上架和未上架的宝贝
    allGoodsList() {
      let ret = []
      ret = this.upGoodsList.concat(this.goodsList)
      ret.forEach(item => {
        // 添加优惠券
        // console.log(this.couponMap[item.itemId])
        if (this.couponMap[item.itemId]) {
          item.coupon = this.couponMap[item.itemId]
        } else {
          item.coupon = {
            // 店铺名
            url: '',
            shopNick: '',
            startTime: '',
            // 截止时间
            endTime: '',
            // ￥
            currencyUnit: '',
            // "8800"
            startFee: '',
            // 3000
            discount: '',
            couponId: '',
            id: '',
            sellerId: '',
            uuid: ''
          }
        }
      })
      // console.log(ret)
      return ret
    }
  },
  created() {
    let key = 'goodsList_' + this.liveId
    if (loadStorage(key)) {
      this.goodsList = loadStorage(key)
      this.resetGoodsList()
    }
    let keyMap = 'couponMap_' + this.liveId
    if (loadStorage(keyMap)) {
      this.couponMap = loadStorage(keyMap)
    }
    this.getUpGoods()
    this._runGetGoodsTimer()
  },
  methods: {
    // 查询商品
    addGoods(url) {
      if (!url) return
      if ((url.indexOf('taobao') === -1 && url.indexOf('tmall') === -1)) {
        this.$message.error('宝贝链接有误')
        return
      }
      //   if (!url.startWidth('https://')) {
      //       this.$message.error('宝贝链接有误')
      //       return
      //   }
      let params = {
        api: 'item_getItem',
        url: encodeURIComponent(url),
        _: new Date().getTime()
      }
      // let res = {
      //   headers: {},
      //   model: {
      //     imgUrl: 'i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
      //     extendVal: { useableItem: 'true', isNew: 'false' },
      //     imgList: [
      //       '//img.alicdn.com/bao/uploaded/i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i3/4205584633/O1CN01ozoWva1k5xRuTTcVQ_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i4/4205584633/O1CN01LO2L5d1k5xRtLCaCQ_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i1/4205584633/O1CN011k5xRd0JLoXObW7_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i2/4205584633/O1CN01KCiwxv1k5xRnPJG3T_!!4205584633.jpg'
      //     ],
      //     height: 0,
      //     is11: false,
      //     useable: true,
      //     width: 0,
      //     from: 'taobao',
      //     itemPrice: 156.0,
      //     itemId: 5804409546973,
      //     taokprice: '0.00',
      //     itemTitle: '光希 玻尿酸补水初见面膜 补水保湿修护提亮肤色清洁女正品2'
      //   },
      //   httpStatusCode: 200,
      //   msgCode: 'SUCCESS',
      //   msgInfo: '成功',
      //   success: true
      // }
      liveAction(params).then(res => {
        // console.log(res)
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
            url: `${url.split('?')[0]}?id=${itemId}`,
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
          this.$nextTick(() => {
            this.currentIndex = this.allGoodsList.length - 1
          })
        } else {
          this.$message.error(res.msgInfo)
        }
      })
    },
    // 批量添加
    batchAddGoods(url) {
      if (url === '' || (url.indexOf('taobao') === -1 && url.indexOf('tmall') === -1)) {
        return
      }
      let params = {
        api: 'item_getItem',
        url: encodeURIComponent(url),
        _: new Date().getTime()
      }
      // let res = {
      //   headers: {},
      //   model: {
      //     imgUrl: 'i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
      //     extendVal: { useableItem: 'true', isNew: 'false' },
      //     imgList: [
      //       '//img.alicdn.com/bao/uploaded/i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i3/4205584633/O1CN01ozoWva1k5xRuTTcVQ_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i4/4205584633/O1CN01LO2L5d1k5xRtLCaCQ_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i1/4205584633/O1CN011k5xRd0JLoXObW7_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i2/4205584633/O1CN01KCiwxv1k5xRnPJG3T_!!4205584633.jpg'
      //     ],
      //     height: 0,
      //     is11: false,
      //     useable: true,
      //     width: 0,
      //     from: 'taobao',
      //     itemPrice: 156.0,
      //     itemId: 58044095469732,
      //     taokprice: '0.00',
      //     itemTitle: '光希 玻尿酸补水初见面膜 补水保湿修护提亮肤色清洁女正品2'
      //   },
      //   httpStatusCode: 200,
      //   msgCode: 'SUCCESS',
      //   msgInfo: '成功',
      //   success: true
      // }
      liveAction(params).then(res => {
        if (res.success) {
          let model = res.model
          let { itemTitle, itemPrice, itemId, imgUrl } = model
          let count = 0
          this.allGoodsList.forEach(item => {
            if (item.itemId == itemId) {
              count++
            }
          })
          this.batchGoodsList.forEach(item => {
            if (item.itemId === itemId) {
              count++
            }
          })
          if (count > 0) {
            // this.$message.error('宝贝重复添加')
            return
          }
          let item = {
            itemTitle,
            itemPrice,
            itemId,
            // 图片地址
            imgUrl: baseImgUrl + imgUrl,
            // 商品链接
            url: `${url.split('?')[0]}?id=${itemId}`,
            // 利益点
            right: '',
            // 优惠券链接
            link: '',
            isShelves: false,
            current: false
          }
          this.batchGoodsList.push(item)
        }
      })
    },
    handleSelectionChange(val) {
      this.batchSelection = val
    },
    // 上架二次确认框
    goodsOnShelvesConfirm() {
      let currentGood = this.allGoodsList[this.currentIndex]
      this.waitUpList = []
      this.waitUpList.push(currentGood)
      let count = 0
      this.waitUpList.forEach(item => {
        if (item.right === '') {
          count++
        }
      })
      let msg = `将上架所有${this.waitUpList.length}件宝贝。${count > 0 ? `其中${count}件未设置利益点，` : ''} 是否继续？`
      this.$confirm(msg, '提示', {
        confirmButtonText: '是的，立刻上架',
        cancelButtonText: '不要',
        type: 'warning'
      })
        .then(() => {
          this.goodsOnShelves()
        })
        .catch(() => {})
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
        // console.log(res)
        if (res.success) {
          this.goodsList.splice(this.realIndex, 1)
          this.saveGoodsList()
          this.getUpGoods()
        }
      })
    },
    // 删除商品
    delGoods() {
      this.$confirm('此操作将删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.goodsList.splice(this.realIndex, 1)
          this.saveGoodsList()
          // this.$message({
          //   type: 'success',
          //   message: '删除成功!'
          // });
        })
        .catch(() => {})
    },
    urlParse(url) {
      var obj = {}
      var reg = /[?&][^?&]+=[^?&#/]+/g
      var arr = url.match(reg)
      // ['?id=12345', '&a=b']
      if (arr) {
        arr.forEach(function(item) {
          var tempArr = item.substring(1).split('=')
          var key = tempArr[0]
          var val = tempArr[1]
          obj[key] = val
        })
      }
      return obj
    },
    // 获取优惠券信息
    saveCoupon() {
      let url = this.currentGood.coupon.url
      let appKey = '12574478'
      let t = new Date().getTime()
      let sellerId = this.urlParse(url).seller_id || this.urlParse(url).sellerId
      let uuid = this.urlParse(url).activity_id || this.urlParse(url).activityId
      if (!url) return
      if (url.indexOf('taoquan') === -1 && url.indexOf('shop') === -1) {
        this.$message.error('暂不支持此优惠券，请输入以 taoquan 或 shop 开头的优惠券链接')
        return
      }
      if (!(sellerId && uuid)) {
        this.$message.error('优惠券链接错误，请检查你的链接')
        return
      }
      let data = JSON.stringify({ uuid: uuid, sellerId: sellerId, queryShop: true, originalSellerId: '', marketPlace: '' })
      let key = getMH5Token() + '&' + t + '&' + appKey + '&' + data
      let sign = setPass(key)
      let params = {
        jsv: '2.3.22',
        appKey,
        '': '',
        t,
        sign,
        api: 'mtop.taobao.couponMtopReadService.findShopBonusActivitys',
        v: '3.0',
        AntiCreep: true,
        AntiFlood: true,
        ecode: 1,
        H5Request: true,
        type: 'jsonp',
        dataType: 'jsonp',
        data,
        _: new Date().getTime()
      }
      // let res = {"api":"mtop.taobao.couponmtopreadservice.findshopbonusactivitys","data":{"error":"false","haveNextPage":"false","module":[{"activityId":"2507592145","couponId":"1729208859","couponType":"0","currencyUnit":"￥","defaultValidityCopywriter":"2019.02.25前有效","description":"使用说明","discount":"3000","endTime":"2019-02-25 23:59:59","intervalDays":"0","intervalHours":"0","poiShop":"false","sellerId":"1028823445","shopNick":"亚菲儿旗舰店","startFee":"8800","startTime":"2019-02-18 00:00:00","status":"1","transfer":"false","useIntervalMode":"false","uuid":"9bc8ae9ba3684e7fa0714d10527ed643"}],"needInterrupt":"false","totalCount":"0"},"ret":["SUCCESS::调用成功"],"v":"3.0"}
      getCoupon(params).then(res => {
        if (!res.data.module) {
          this.$message.error('优惠券验证失败！')
          // console.log('优惠券验证失败！若确认优惠券正常，可使用强制发送功能')
        } else {
          let couponModule = res.data.module[0]
          let { shopNick, startTime, endTime, currencyUnit, startFee, discount, couponId, sellerId, uuid } = couponModule
          let coupon = {
            url: url,
            // 店铺名
            shopNick,
            startTime: startTime.split(' ')[0],
            // 截止时间
            endTime: endTime.split(' ')[0],
            // ￥
            currencyUnit,
            // "8800"
            startFee: (startFee / 100).toFixed(2),
            // 3000
            discount: (discount / 100).toFixed(2),
            couponId,
            id: couponId,
            sellerId,
            uuid
          }
          // this.couponMap[this.currentGood.itemId] = coupon
          this.$set(this.couponMap, this.currentGood.itemId, coupon)
          this.saveCouponMap()
        }
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
    // 1秒跑一次更新宝贝
    _runGetGoodsTimer() {
      setTimeout(() => {
        this.getUpGoods()
        this._runGetGoodsTimer()
      }, 5000)
    },
    getUpGoods() {
      let t = new Date().getTime()
      let appKey = '12574478'

      // let nData = '{"pageCode":"mainIndex","ua":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36","params":"{\"url\":\"https://h5.m.taobao.com/\",\"referrer\":\"https://liveplatform.taobao.com/live/live_detail.htm?id=219685085515&openHlvPush=true\",\"oneId\":null,\"fid\":\"dqYCjwrIF0A\"}'
      let data = JSON.stringify({ liveId: this.liveId, creatorId: this.creatorId, n: 20, groupNum: 0 })
      let key = getMH5Token() + '&' + t + '&' + appKey + '&' + data
      // console.log(key)
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
        data
        // __: 'ji'
        // _: new Date().getTime()
      }
      // params = {
      //   jsv: '2.4.0',
      //   appKey: 12574478,
      //   t: 1551234882751,
      //   sign: 'c23be5d04984b83491ecedbaa587f39c',
      //   api: 'mtop.mediaplatform.video.livedetail.itemlist.withpagination',
      //   v: 2.0,
      //   data: encodeURIComponent('{"liveId":"219968464906","creatorId":"1950250590","n":20,"groupNum":0}')
      // }
      getUpGoodsList(params).then(res => {
        // console.log(res)
        if (res.data && res.data.itemList) {
          this.itemList = res.data.itemList
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
          saveStorage('upGoodsList', this.upGoodsList)
        }
      })
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
          this.$message.error('弹宝贝失败，' + res.msgInfo)
        }
      })
    },
    // 点击上一步
    prevStep() {
      if (this.dialogActive > 0) {
        this.dialogActive--
      }
    },
    // 点击下一步
    nextStep() {
      if (this.dialogActive === 0) {
        this.batchGoodsList = []
        let arr = this.dialogText.split('\n')
        arr.forEach(url => {
          this.batchAddGoods(url)
        })
      }
      if (this.dialogActive < 1) {
        this.dialogActive++
      } else {
        if (this.batchSelection.length === 0) {
          return
        }
        this.dialogVisible = false
        this.goodsList = this.goodsList.concat(this.batchSelection)
        this.saveGoodsList()
      }
    },
    // 前移
    prevMove() {
      if (this.realIndex > 0) {
        let nowItem = this.goodsList[this.realIndex]
        let prevItem = this.goodsList[this.realIndex - 1]
        this.goodsList.splice(this.realIndex - 1, 1, nowItem)
        this.goodsList.splice(this.realIndex, 1, prevItem)
        this.currentIndex--
      }
    },
    // 后移
    nextMove() {
      if (this.realIndex < this.goodsList.length - 1) {
        let nowItem = this.goodsList[this.realIndex]
        let newxItem = this.goodsList[this.realIndex + 1]
        this.goodsList.splice(this.realIndex + 1, 1, nowItem)
        this.goodsList.splice(this.realIndex, 1, newxItem)
        this.currentIndex++
      }
    },
    // 显示批量导入弹窗
    showBatchAdd() {
      this.dialogVisible = true
      this.dialogText = ''
      this.dialogActive = 0
    },
    // 刷新商品
    refreshGoods() {
      let url = this.currentGood.url
      let params = {
        api: 'item_getItem',
        url: encodeURIComponent(url),
        _: new Date().getTime()
      }
      // let res = {
      //   headers: {},
      //   model: {
      //     imgUrl: 'i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
      //     extendVal: { useableItem: 'true', isNew: 'false' },
      //     imgList: [
      //       '//img.alicdn.com/bao/uploaded/i4/4205584633/O1CN01YKLBvt1k5xTDWcydu_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i3/4205584633/O1CN01ozoWva1k5xRuTTcVQ_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i4/4205584633/O1CN01LO2L5d1k5xRtLCaCQ_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i1/4205584633/O1CN011k5xRd0JLoXObW7_!!4205584633.jpg',
      //       '//img.alicdn.com/bao/uploaded/i2/4205584633/O1CN01KCiwxv1k5xRnPJG3T_!!4205584633.jpg'
      //     ],
      //     height: 0,
      //     is11: false,
      //     useable: true,
      //     width: 0,
      //     from: 'taobao',
      //     itemPrice: 156.0,
      //     itemId: 5804409546973,
      //     taokprice: '0.00',
      //     itemTitle: '光希 玻尿酸补水初见面膜 补水保湿修护提亮肤色清洁女正品2'
      //   },
      //   httpStatusCode: 200,
      //   msgCode: 'SUCCESS',
      //   msgInfo: '成功',
      //   success: true
      // }
      liveAction(params).then(res => {
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
            url: `${url.split('?')[0]}?id=${itemId}`,
            // 利益点
            right: '',
            // 优惠券链接
            link: '',
            isShelves: false,
            current: false
          }
          this.goodsList.splice(this.realIndex, 1, item)
        }
      })
    },
    saveCouponMap() {
      let key = 'couponMap_' + this.liveId
      saveStorage(key, this.couponMap)
    },
    // 验证能否发送
    couponAddMaterial(coupon) {
      // data: {"bizType":2,"data":{"uuid":"9bc8ae9ba3684e7fa0714d10527ed643","supplierId":1028823445,"name":"专属优惠券","threshold":1,"amount":"1","type":"shopCoupon"},"title":"专属优惠券"}
      let data = {
        bizType: '2',
        title: '专属优惠券',
        data: {
          uuid: coupon.uuid,
          supplierId: coupon.sellerId,
          name: '专属优惠券',
          threshold: 1,
          amount: '',
          type: 'shopCoupon'
        }
      }
      let params = {
        _input_charset: 'utf-8',
        data: JSON.stringify(data)
      }
      // let res = {"content":{"materialName":"coupon_486920792","material":{"bizId":"9bc8ae9ba3684e7fa0714d10527ed643","bizType":2,"componentName":"coupon","componentOwnerId":0,"data":{"activityId":2507592145,"amount":"30","applyCount":1278,"couponInstanceSource":20398001,"currentTime":1551066654806,"endTime":"2019.2.25","name":"中单小法","startTime":"2019.2.18","status":1,"supplierId":1028823445,"threshold":88,"totalCount":3000,"type":"shopCoupon","uuid":"9bc8ae9ba3684e7fa0714d10527ed643"},"gmtCreate":"2019-02-22 15:50:24","gmtModified":"2019-02-25 11:50:54","id":486920792,"name":"coupon_486920792","source":"coupon","status":1,"title":"专属优惠券","userId":1950250590,"userName":"陈先生_1014"}},"message":"success","isSuccess":true}
      addMaterial(params).then(res => {
        if (res.isSuccess) {
          this.materialName = res.content.materialName
          this.sendCoupon(coupon)
        } else {
          this.$message.error('发送失败，请过会再发送')
        }
      })
    },
    // 发送优惠券
    sendCoupon(row) {
      // {"parentId":"220028695749","name":"优惠劵","feedId":"","feedType":"702","materialName":"coupon_486920792","interactiveName":"coupon_486920792"}
      let draft = {
        parentId: this.feedId,
        name: '优惠劵',
        feedId: '',
        feedType: '702',
        materialName: this.materialName,
        interactiveName: this.materialName
      }
      let params = {
        _input_charset: 'utf-8',
        draft: encodeURIComponent(JSON.stringify(draft))
      }
      commonPush(params).then(res => {
        if (res.success) {
          this.$message({
            message: '发送优惠券成功',
            type: 'success'
          })
        } else {
          this.$message.error(res.msgInfo || '发送优惠券失败，请过会再发送')
        }
      })
    },
    // 删除优惠券
    delCoupon(coupon) {
      this.$confirm('此操作将删除该优惠券, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          coupon = {
            url: '',
            shopNick: '',
            startTime: '',
            // 截止时间
            endTime: '',
            // ￥
            currencyUnit: '',
            // "8800"
            startFee: '',
            // 3000
            discount: '',
            couponId: '',
            id: '',
            sellerId: '',
            uuid: ''
          }
          this.couponMap[this.currentGood.itemId] = coupon
          this.saveCouponMap()
        })
        .catch(() => {})
    }
  },
  components: {},
  watch: {
    goodsList: {
      handler: function(val) {
        this.saveGoodsList(val)
      },
      deep: true
    }
  }
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
      position: relative;
      .el-icon-circle-check {
        position: absolute;
        top: 2px;
        left: 2px;
        color: #fc6868;
        font-size: 8px;
      }
      .el-icon-tickets {
        position: absolute;
        top: 2px;
        right: 2px;
        color: #67c23a;
        font-size: 8px;
      }
    }
  }
  .el-step.is-simple .el-step__title {
    font-size: 14px;
  }
  .dialog-link {
    color: #0073bd;
  }
}
</style>
