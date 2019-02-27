<template>
  <div class="coupon-wrapper">
    <div class="search-box">
      <el-input placeholder="请输入优惠券链接" v-model="couponUrl" class="input-with-select">
        <!-- <i class="el-icon-warning" slot="prepend"></i> -->
        <el-button slot="append" icon="el-icon-search" @click.native="getCoupon"></el-button>
      </el-input>
    </div>
    <div class="notice-list-wrapper">
      <el-table class="notice-list" :data="couponList" style="width: 100%" @row-click="setCurrentIndex" :row-key="getRowKeys" :expand-row-keys="expands">
        <el-table-column type="expand" width="10">
          <template slot-scope="scope">
            <div style="margin-top: 10px;">
              <el-radio v-model="scope.row.type" :label="1" @change="saveCouponList">手动</el-radio>
              <el-radio v-model="scope.row.type" :label="2" @change="saveCouponList">自动</el-radio>
              <el-input-number size="mini" v-model="scope.row.time" :disabled="scope.row.type==1" :min="10" @change="saveCouponList"></el-input-number> 秒
            </div>
          </template>
        </el-table-column>
        <el-table-column label="#" width="40">
          <template slot-scope="scope">
            <i class="el-icon-arrow-right" v-if="scope.row.id!==expands[0]"></i>
            <i class="el-icon-arrow-down" v-if="scope.row.id===expands[0]"></i>
          </template>
        </el-table-column>
        <el-table-column label="优惠券信息">
          <template slot-scope="scope">
            <div>{{scope.row.shopNick}}</div>
            <div>满{{scope.row.currencyUnit}}{{scope.row.startFee}}~减{{scope.row.currencyUnit}}{{scope.row.discount}}</div>
            <div style="font-size: 12px; color: #999;">有效期：{{scope.row.startTime}}~{{scope.row.endTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click.stop="addMaterial(scope.row)" v-if="!scope.row.isSending">{{scope.row.type===1?'普通':'定时'}}发送</el-button>
            <el-button size="mini" type="primary" @click.stop="stopSending(scope.row)" v-if="scope.row.isSending">停止发送</el-button>
            <el-button size="mini" type="primary" @click.stop="delItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { commonPush, getCoupon, addMaterial } from '@/api'
import { urlParse, saveStorage, loadStorage } from '@/util/tools'
import setPass from '@/util/pass'
import { getMH5Token } from '@/util/token'
export default {
  name: 'Notice',
  data() {
    return {
      couponUrl: '',
      couponList: [],
      expands: [],
      currentIndex: -1,
      feedId: urlParse().id,
      liveId: urlParse().id,
      mH5Token: getMH5Token(),
      getRowKeys(row) {
        return row.id
      },
      sendTimers: {}
    }
  },
  created() {
    let key = 'couponList_' + this.liveId
    if (loadStorage(key)) {
      this.couponList = loadStorage(key)
      this.couponList.forEach(item => {
        item.isSending = false
      })
    }
  },
  methods: {
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
    getCoupon() {
      let url = this.couponUrl
      let appKey = '12574478'
      let t = new Date().getTime()
      let sellerId = this.urlParse(url).seller_id || this.urlParse(url).sellerId
      let uuid = this.urlParse(url).activity_id || this.urlParse(url).activityId
      if (url.indexOf('taoquan') === -1 && url.indexOf('shop') === -1) {
        this.$message.error('暂不支持此优惠券，请输入以 taoquan 或 shop 开头的优惠券链接')
        return
      }
      if (!(sellerId && uuid)) {
        this.$message.error('优惠券链接错误，请检查你的链接')
        return
      }
      let data = JSON.stringify({ uuid: uuid, sellerId: sellerId, queryShop: true, originalSellerId: '', marketPlace: '' })
      let key = this.mH5Token + '&' + t + '&' + appKey + '&' + data
      // console.log(key)
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
        // callback: 'mtopjsonp1',
        data,
        _: new Date().getTime()
      }
      // let res = {"api":"mtop.taobao.couponmtopreadservice.findshopbonusactivitys","data":{"error":"false","haveNextPage":"false","module":[{"activityId":"2507592145","couponId":"1729208859","couponType":"0","currencyUnit":"￥","defaultValidityCopywriter":"2019.02.25前有效","description":"使用说明","discount":"3000","endTime":"2019-02-25 23:59:59","intervalDays":"0","intervalHours":"0","poiShop":"false","sellerId":"1028823445","shopNick":"亚菲儿旗舰店","startFee":"8800","startTime":"2019-02-18 00:00:00","status":"1","transfer":"false","useIntervalMode":"false","uuid":"9bc8ae9ba3684e7fa0714d10527ed643"}],"needInterrupt":"false","totalCount":"0"},"ret":["SUCCESS::调用成功"],"v":"3.0"}
      getCoupon(params).then(res => {
        if (!res.data.module) {
          this.$message.error('优惠券验证失败！')
          // if (res.ret[0].indexOf('过期') > -1) {
          //    this.$message.error('优惠券验证失败,请检查优惠券是否已过期！')
          // } else {
          //   this.$message.error('优惠券验证失败！')
          // }
          // console.log('优惠券验证失败！若确认优惠券正常，可使用强制发送功能')
        } else {
          let couponModule = res.data.module[0]
          // console.log(couponModule)
          let { shopNick, startTime, endTime, currencyUnit, startFee, discount, couponId, sellerId, uuid } = couponModule
          let coupon = {
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
            // 1--手动 2--自动
            type: 1,
            time: 10,
            isSending: false,
            sellerId,
            uuid
          }
          let count = 0
          this.couponList.forEach(item => {
            if (item.couponId === couponId) {
              count++
              item = coupon
            }
          })
          if (count > 0) {
            this.$message.error('优惠券信息已刷新！')
            return
          }
          this.couponList.push(coupon)
          this.saveCouponList()
        }
      })
    },
    // 验证能否发送
    addMaterial(coupon) {
      // this.currentIndex = index
      // let coupon = this.couponList[index]
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
          if (row.type === 2) {
            row.isSending = true
            this._runAutoSend(row)
          }
        } else {
          this.$message.error('发送优惠券失败')
        }
      })
    },
    // 自动发送
    _runAutoSend(row) {
      clearTimeout(this.sendTimers[row.id])
      this.sendTimers[row.id] = setTimeout(() => {
        this.addMaterial(row)
      }, row.time * 1000)
    },
    stopSending(row) {
      clearTimeout(this.sendTimers[row.id])
      row.isSending = false
    },
    // 删除item
    delItem(index) {
      this.$confirm('此操作将删除该优惠券, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          clearTimeout(this.sendTimers[this.couponList[index].id])
          this.couponList.splice(index, 1)
          this.saveCouponList()
          if (this.couponList.length > 0) {
            this.currentIndex = 0
          } else {
            this.currentIndex = -1
          }
        })
        .catch(() => {})
    },
    saveCouponList() {
      let key = 'couponList_' + this.liveId
      saveStorage(key, this.couponList)
    },
    // 点击某一行
    setCurrentIndex(row) {
      this.couponList.forEach((item, index) => {
        if (row.id === item.id) {
          // console.log(index)
          this.currentIndex = index
          let id = row.id
          if (this.expands.length > 0) {
            if (id !== this.expands[0]) {
              this.expands = []
              this.expands.push(id)
            } else {
              this.expands = []
            }
          } else {
            this.expands.push(id)
          }
        }
      })
    }
  },
  components: {},
  watch: {
    // couponList: {
    //   handler(val) {
    //     console.log('change')
    //     this.saveCouponList()
    //   },
    //   deep: true
    // }
  }
}
</script>

<style lang="less">
.coupon-wrapper {
  .notice-list-wrapper {
    margin-top: 10px;
    background: #f5f5f5;
    box-shadow: rgb(220, 216, 216) 0px 0px 10px;
    border: 1px solid rgb(227, 227, 227);
  }
  .el-table__expand-icon {
    display: none;
  }
}
</style>
