<template>
  <div class="focus-wrapper">
    <div class="search-box">
      <el-input placeholder="请输入店铺名称/达人昵称" v-model="starName" class="input-with-select" @keyup.enter.native="searchShop">
        <!-- <i class="el-icon-warning" slot="prepend"></i> -->
        <el-button slot="append" icon="el-icon-search" @click.native="searchShop"></el-button>
      </el-input>
    </div>
    <!-- <div class="media" v-if="currentIndex>-1">
      <div class="media-left">
        <img :src="currentShop.avatar" alt="">
      </div>
      <div class="media-body">
        <div>关注：{{currentShop.title}}</div>
      </div>
      <div class="media-right">
        <div @click="addMaterial">
          <el-button type="primary" plain>立即发送</el-button>
        </div>
        <div style="margin-top: 10px;">
          <el-button type="success" plain>开始计时</el-button>
        </div>
      </div>
    </div> -->
    <div class="shop-list-wrapper">

      <el-table class="shop-list" :data="shopList" style="width: 100%" @row-click="setCurrentIndex" :row-key="getRowKeys" :expand-row-keys="expands">
        <el-table-column type="expand" width="10">
          <template slot-scope="scope">
            <div>间隔时间：<el-radio v-model="scope.row.type" :label="1" @change="stopAutoSend(scope.row)">手动</el-radio>
              <el-radio v-model="scope.row.type" :label="2" @change="saveShopList">自动</el-radio>
              <el-input-number size="mini" v-model="scope.row.time" :disabled="scope.row.type==1" :min="300" @change="saveShopList"></el-input-number> 秒
            </div>
          </template>
        </el-table-column>
        <el-table-column label="#" width="40">
          <template slot-scope="scope">
            <i class="el-icon-arrow-right" v-if="scope.row.id!==expands[0]"></i>
            <i class="el-icon-arrow-down" v-if="scope.row.id===expands[0]"></i>
          </template>
        </el-table-column>
        <el-table-column label="卡片" width="50">
          <template slot-scope="scope">
            <img class="shop-img" :src="scope.row.avatar" alt="">
          </template>
        </el-table-column>
        <el-table-column prop="title" label="名称" width="120">
        </el-table-column>
        <el-table-column prop="time" label="间隔时间" align="center">
          <template slot-scope="scope">
            {{scope.row.time>0&&scope.row.type===2?scope.row.time+'秒':'-'}}
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="上次执行" align="center">
        </el-table-column>
        <el-table-column prop="nextPublishTime" label="下次执行" align="center">
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click.stop="addMaterial(scope.$index)" v-if="!scope.row.isSending" :disabled="sendFlag">{{scope.row.type===1?'普通':'定时'}}发送</el-button>
            <el-button size="mini" type="primary" @click.stop="stopSending(scope.row)" v-if="scope.row.isSending">停止发送</el-button>
            <el-button size="mini" type="primary" @click.stop="delItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="tips">
      推送关注最少5分钟,目前定时推送其中一个店铺或主播其他的就会停止推送。
    </div>
  </div>
</template>

<script>
import { getUserInfo, addMaterial, commonPush } from '@/api'
import { urlParse, saveStorage, loadStorage } from '@/util/tools'
export default {
  name: 'Focus',
  data() {
    return {
      starName: '',
      currentIndex: -1,
      feedId: urlParse().id,
      liveId: urlParse().id,
      shopList: [
        // {
        //   avatar: '',
        //   title: '构美官方直播',
        //   time: '5',
        //   before: '14:06:33',
        //   after: '14:11:33'
        // }
      ],
      expands: [],
      getRowKeys(row) {
        return row.id
      },
      // 是否禁用发送按钮
      sendFlag: false
    }
  },
  computed: {
    currentShop() {
      return this.shopList[this.currentIndex] || {}
    }
  },
  created() {
    let key = 'shopList_' + this.liveId
    if (loadStorage(key)) {
      this.shopList = loadStorage(key)
      this.shopList.forEach((item, index) => {
        if (item.isSending) {
          this.setCurrentIndex(item, 1)
          item.publishTime = '-'
          item.nextPublishTime = this.getNextTime()
          this._runAutoSend()
        } else {
          item.publishTime = '-'
          item.nextPublishTime = '-'
        }
      })
      // this.setCurrentIndex(this.shopList[0])
    }
    // this.currentIndex = this.shopList.length - 1
    if (window.pageData && window.pageData.userInfo) {
      this.starName = window.pageData.userInfo.userNick
    }
  },
  methods: {
    // 搜索店铺
    searchShop() {
      if (!this.starName) return
      let params = {
        shopName: this.starName,
        _input_charset: 'utf-8'
      }
      // let res = { shopDO: { title: '构美官方直播', pictureUrl: '//img.alicdn.com/imgextra///img.alicdn.com/imgextra/i4/1950250590/TB2qcbxdbmI.eBjy1zjXXaq5VXa_!!1950250590-0-beehive-scenes.jpg', shopId: 1950250590, userId: 1950250590, isTmall: false } }
      getUserInfo(params).then(res => {
        // console.log(res)
        if (res.isSuccess === false) {
          this.$message.error(`获取关注信息失败，${res.message}!`)
        } else {
          res = res.shopDO
          let isHas = false
          // this.shopList.forEach((item, index) => {
          //   if (item.title === res.title) {
          //     isHas = true
          //     this.currentIndex = index
          //   }
          // })
          if (!isHas) {
            let item = {
              avatar: res.pictureUrl,
              title: res.title,
              type: 2,
              isSending: false,
              time: 300,
              userId: res.userId,
              id: new Date().getTime(),
              publishTime: '-',
              nextPublishTime: '-'
            }
            this.shopList.push(item)
            this.currentIndex = this.shopList.length - 1
            this.saveShopList()
            this.$nextTick(() => {
              this.setCurrentIndex(item, 1)
            })
          }
        }
      })
    },
    // 验证能否发送
    addMaterial(index) {
      if (this.sendFlag) return
      // 其他的type变为1
      this.shopList.forEach((item, shopIndex) => {
        if (index !== shopIndex) {
          item.type = 1
          item.isSending = false
        }
      })
      this.currentIndex = index
      this.setCurrentIndex(this.shopList[index], 1)
      let data = {
        bizType: '7',
        source: 'followcard',
        data: {
          userId: this.currentShop.userId,
          type: 'followcard',
          extendParam: `{'feed_id': ${this.feedId}}`
        }
      }
      let params = {
        skipTitleValidate: false,
        _input_charset: 'utf-8',
        data: JSON.stringify(data)
      }
      // console.log(params)
      // let res = {
      //   content: {
      //     materialName: 'followcard_296519650',
      //     material: {
      //       bizId: '1950250590',
      //       bizType: 7,
      //       componentName: 'followcard',
      //       componentOwnerId: 0,
      //       data: { extendParam: "{'feed_id': 219525889275}", type: 'followcard', userId: 1950250590 },
      //       gmtCreate: '2018-09-03 17:27:59',
      //       gmtModified: '2019-02-18 16:47:33',
      //       id: 296519650,
      //       name: 'followcard_296519650',
      //       source: 'followcard',
      //       status: 1,
      //       title: '关注主播',
      //       userId: 1950250590,
      //       userName: '陈先生_1014'
      //     }
      //   },
      //   message: 'success',
      //   isSuccess: true
      // }
      addMaterial(params).then(res => {
        if (res.isSuccess) {
          this.materialName = res.content.materialName
          sessionStorage.materialName = this.materialName
          this.sendFocus()
        } else {
          this.sendFocus()
          // this.$message.error('间隔时间太短!')
        }
      })
    },
    // 发送关注
    sendFocus() {
      // {"parentId":"219525889275","feedId":"","feedType":"706","interactiveName":"followcard_481798986","title":"主持人陶川","name":"关注小卡"}
      let draft = {
        parentId: this.feedId,
        feedId: '',
        feedType: '706',
        interactiveName: this.materialName || sessionStorage.materialName,
        title: this.currentShop.title,
        name: '关注小卡'
      }
      let params = {
        conditions: 'null',
        _input_charset: 'utf-8',
        draft: encodeURIComponent(JSON.stringify(draft))
      }
      // let res = {
      //   success: true
      // }
      // let res = {"headers":{},"model":{"title":"构美官方直播","publishTime":"14:51"},"httpStatusCode":200,"msgCode":"SUCCESS","msgInfo":"成功","success":true}
      commonPush(params).then(res => {
        if (res.success) {
          //  成功之后禁用发送按钮10秒钟
          this.sendFlag = true
          setTimeout(() => {
            this.sendFlag = false
          }, 300000)
          this.$message({
            message: '发送关注卡片成功',
            type: 'success'
          })

          this.currentShop.publishTime = this.getTime(new Date())
          if (this.currentShop.type === 2) {
            this.currentShop.isSending = true
            this.currentShop.nextPublishTime = this.getNextTime()
          }
        } else {
          this.$message.error(res.msgInfo || '发送关注卡片失败，请稍后再试')
        }
        // 如果是自动发送
        if (this.currentShop.type === 2) {
          this._runAutoSend()
        }
      })
    },
    getTime(myDate) {
      let hour = myDate.getHours()
      let minute = myDate.getMinutes()
      let second = myDate.getSeconds()
      return `${hour}:${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
    },
    getNextTime() {
      let time = new Date().getTime() + this.currentShop.time * 1000
      return this.getTime(new Date(time))
    },
    // 自动发送
    _runAutoSend() {
      clearTimeout(this.sendTimer)
      this.sendTimer = setTimeout(() => {
        this.addMaterial(this.currentIndex)
      }, (this.currentShop.time * 1 + 1) * 1000)
    },
    stopAutoSend(row) {
      this.stopSending(row)
      this.saveShopList()
    },
    // 停止发送
    stopSending(row) {
      clearTimeout(this.sendTimer)
      row.isSending = false
    },
    // 删除item
    delItem(index) {
      this.$confirm('此操作将删除该卡片, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 清除定时器
          clearTimeout(this.sendTimer)
          this.shopList.splice(index, 1)
          this.saveShopList()
          if (this.shopList.length > 0) {
            this.currentIndex = 0
          } else {
            this.currentIndex = -1
          }
        })
        .catch(() => {})
    },
    // 点击某一行
    setCurrentIndex(row, flag) {
      this.shopList.forEach((item, index) => {
        if (row.id === item.id) {
          // console.log(index)
          this.currentIndex = index
          let id = row.id
          if (this.expands.length > 0) {
            if (id !== this.expands[0]) {
              this.expands = []
              this.expands.push(id)
            } else {
              if (flag !== 1) {
                this.expands = []
              }
            }
          } else {
            if (flag !== 1) {
              this.expands.push(id)
            }
          }
        }
      })
    },
    saveShopList() {
      let key = 'shopList_' + this.liveId
      saveStorage(key, this.shopList)
    }
  },
  components: {},
  watch: {
    shopList: {
      handler(val) {
        this.saveShopList()
      },
      deep: true
    }
  }
}
</script>

<style lang="less">
.focus-wrapper {
  .media {
    margin-top: 10px;
    display: flex;
    .media-left {
      width: 96px;
      height: 96px;
      border: 1px solid #ddd;
      img {
        width: 96px;
        height: 96px;
        padding: 4px;
        box-sizing: border-box;
      }
    }
    .media-body {
      flex: 1;
    }
    .media-right {
      width: 100px;
    }
  }
  .shop-list-wrapper {
    margin-top: 10px;
    background: #f5f5f5;
    box-shadow: rgb(220, 216, 216) 0px 0px 10px;
    border: 1px solid rgb(227, 227, 227);
  }
  .tips {
    margin-top: 10px;
    font-size: 12px;
    color: #999;
  }
  .shop-list {
    .shop-img {
      width: 26px;
      height: 26px;
    }
  }
  .el-table__expand-icon {
    display: none;
  }
  .el-icon-arrow-right,
  .el-icon-arrow-down {
    font-size: 12px;
  }
  .el-button--mini,
  .el-button--mini.is-round {
    padding: 7px 10px;
  }
}
</style>
