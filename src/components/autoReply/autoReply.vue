<template>
  <div class="reply-wrapper">
    <div class="search-box">
      <!-- <el-input placeholder="请输入关键字" v-model="replyContent" class="input-with-select" maxlength="70" @keyup.enter.native="addNotice">
        <el-button slot="append" @click.native="addNotice">添加</el-button>
      </el-input> -->
      <div class="key-box">
        <div class="tips">
          为回复指定回复关键字，或从已上架宝贝中选择宝贝编号作为关键字，粉丝发送关键字作为评论可获得自动回复
        </div>
        <div class="mt10">
          <el-tag :key="tag" v-for="tag in replyTags" closable :disable-transitions="false" @close="handleClose(tag)">
            {{tag}}
          </el-tag>
          <el-input class="input-new-tag" v-if="replyInputVisible" v-model="replyInputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm">
          </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新增关键字</el-button>
          <el-button size="small" type="primary" @click="lineGoods">关联宝贝编号</el-button>
        </div>
      </div>
    </div>
    <div class="search-box mt10" v-if="replyTags.length>0">
      <div class="reply-content-box">
        <div class="tips">
          输入回复内容并在预览中确定格式，多行回复自动转换为多段发出，请注意每段回复的长度是否超过显示边界
        </div>
        <div class="mt10">
          <el-input type="textarea" :rows="3" placeholder="请输入回复内容，每行内容为一段回复，每段35字以内，最多三段。
回复默认使用私密模式(只对回复用户可见)。" v-model="replyContent">
          </el-input>
        </div>
        <div class="flex mt10">
          <div style="flex: 1;">
            <template v-if="segList.length > 0">
              <p class="p-item" v-for="item in segList" :key="item.idx" v-show="item.msg!=''"><b style="color: rgb(244, 61, 105);">主播回复@用*户</b>{{item.msg}}</p>
            </template>
          </div>
          <div class="text-box">
            <el-button size="small" type="primary">保存设置</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="notice-list-wrapper">
      <el-table class="notice-list" :data="replyList" style="width: 100%" @row-click="setCurrentIndex">
        <el-table-column label="#" width="40">
          <template slot-scope="scope">
            {{scope.$index+1}}
          </template>
        </el-table-column>
        <el-table-column label="关键字">
          <template slot-scope="scope">
            <div>{{scope.row.keyList.join(';')}}</div>
          </template>
        </el-table-column>
        <el-table-column label="回复内容">
          <template slot-scope="scope">
            <div v-for="(item, index) in scope.row.segList" :key="index">{{item.idx + 1}}：{{item.msg}}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div>{{scope.row.replyCount}}次</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click.stop="sendNotice(scope.row)" v-if="!scope.row.isSending">开始执行</el-button>
            <el-button size="mini" type="primary" @click.stop="stopSending(scope.row)" v-if="scope.row.isSending">停止执行</el-button>
            <el-button size="mini" type="primary" @click.stop="delItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog title="关联已上线宝贝" :visible.sync="dialogVisible" width="1100px">
        <ul class="dialog-goods-list">
          <li class="goods-item" v-for="(item, index) in upGoodsList" :key="index" @click="selectGoods(index)">
            <img :src="item.imgUrl+'_100x100.jpg_.webp'" alt="" class="pic">
            <p class="text">{{item.itemTitle}}</p>
            <p class="price">￥{{item.itemPrice}}</p>
            <i class="seq">{{index+1}}</i>
            <div class="icon-box" v-if="checkSelect(index) === 2">
              <i class="el-icon-check"></i>
            </div>
            <div class="tips" v-if="checkSelect(index) === 1">
              自动回复<br>已关联
            </div>
          </li>
        </ul>
        <div class="mt10 flex">
          <span style="flex: 1;"></span>
          <el-button size="small" type="primary">关联</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { commonPush } from '@/api'
import { urlParse, saveStorage, loadStorage } from '@/util/tools'
export default {
  name: 'autoReply',
  data() {
    return {
      replyTags: [],
      replyInputVisible: false,
      replyInputValue: '',
      replyContent: '',
      // 所有回复列表
      replyList: [],
      // 当前回复列表
      segList: [],
      itemList: [],
      currentIndex: -1,
      expands: [],
      feedId: urlParse().id,
      liveId: urlParse().id,
      getRowKeys(row) {
        return row.id
      },
      sendTimers: {},
      dialogVisible: false,
      upGoodsList: []
    }
  },
  computed: {
    // 当前的回复
    currentReply() {
      return this.replyList[this.currentIndex] || null
    }
  },
  created() {
    this.replyList = [
      {
        content: '好好啊的\n给你推荐一下\n真的',
        segList: [{ idx: 0, type: 'normal', msg: '好好啊的' }, { idx: 1, type: 'normal', msg: '给你推荐一下' }, { idx: 2, type: 'normal', msg: '真的' }],
        keyList: ['好的', 7, '7号', 8, '8号'],
        itemList: [6, 7],
        setList: [],
        id: '4694217560',
        cmtCount: 0,
        replyCount: 0
      },
      {
        content: '2222\n33333\n真的',
        segList: [{ idx: 0, type: 'normal', msg: '4444' }, { idx: 1, type: 'normal', msg: '1111' }, { idx: 2, type: 'normal', msg: '真的' }],
        keyList: ['好的', 4, '7号', 5, '8号'],
        itemList: [3, 4],
        setList: [],
        id: '4694217561',
        cmtCount: 0,
        replyCount: 0
      }
    ]
    let key = 'replyList_' + this.liveId
    if (loadStorage(key)) {
      this.replyList = loadStorage(key)
      this.replyList.forEach(item => {
        item.isSending = false
      })
      this.setCurrentIndex(this.replyList[0])
    }
  },
  methods: {
    handleClose(tag) {
      this.replyTags.splice(this.replyTags.indexOf(tag), 1)
    },
    showInput() {
      this.replyInputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      let replyInputValue = this.replyInputValue
      if (replyInputValue) {
        this.replyTags.push(replyInputValue)
      }
      this.replyInputVisible = false
      this.replyInputValue = ''
    },
    // 关联商品
    lineGoods() {
      let def = [{"explained":"false","goodsIndex":"8","goodsList":[{"bulk":"false","createTime":"1551409852000","duplicate":"false","extendVal":{"isCpc":"0","subTitle":"活力时尚的风格；适合年轻人穿搭","customizedItemRights":"","defaultRight":"活力时尚的风格；适合年轻人穿搭","liveId":"null","materialName":"liveItem_494592950"},"favored":"false","goodsIndex":"0","groupNum":"0","hasDiscount":"false","isCpc":"0","itemH5TaokeUrl":"//h5.m.taobao.com/awp/core/detail.htm?id=584274708149&scm=1007.13381.38597.101200300000000","itemId":"584274708149","itemName":"Skechers斯凯奇女鞋复古运动鞋 丁泽仁同款增高潮鞋熊猫鞋休闲鞋","itemPic":"//gw.alicdn.com/bao/uploaded/i1/2129855716/O1CN01h6KXqN1s5yOoyqT5s_!!0-item_pic.jpg","itemPrice":"499.00","itemUrl":"//taoke.mdaren.taobao.com/item.htm?itemId=584274708149&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219968464906_1950250590&spm=a2141.8001249","liveId":"219968464906","sellerId":"0"}],"sliceNum":"0"},{"explained":"false","goodsIndex":"7","goodsList":[{"bulk":"false","createTime":"1551329212000","duplicate":"false","extendVal":{"isCpc":"0","subTitle":"3层重磅加厚，克重高达550G","customizedItemRights":"","defaultRight":"3层重磅加厚，克重高达550G","liveId":"null","materialName":"liveItem_497011258"},"favored":"false","goodsIndex":"0","groupNum":"0","hasDiscount":"false","isCpc":"0","itemH5TaokeUrl":"//h5.m.taobao.com/awp/core/detail.htm?id=575804584009&scm=1007.13381.38597.101200300000000","itemId":"575804584009","itemName":"南极人保暖内衣男加绒加厚情侣女加肥加大码秋衣秋裤套装棉毛衫ZB","itemPic":"//gw.alicdn.com/bao/uploaded/i1/738722023/O1CN011QoZhqJ6Npd949m_!!0-item_pic.jpg","itemPrice":"179.00","itemUrl":"//taoke.mdaren.taobao.com/item.htm?itemId=575804584009&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219968464906_1950250590&spm=a2141.8001249","liveId":"219968464906","sellerId":"0"}],"sliceNum":"0"},{"explained":"false","goodsIndex":"6","goodsList":[{"bulk":"false","createTime":"1551329178000","duplicate":"false","extendVal":{"isCpc":"0","subTitle":"3层重磅加厚高达550G【预】","customizedItemRights":"","defaultRight":"3层重磅加厚高达550G【预】","liveId":"null","materialName":"liveItem_497019252"},"favored":"false","goodsIndex":"0","groupNum":"0","hasDiscount":"false","isCpc":"0","itemH5TaokeUrl":"//h5.m.taobao.com/awp/core/detail.htm?id=576878099970&scm=1007.13381.38597.101200300000000","itemId":"576878099970","itemName":"南极人保暖内衣男加绒加厚女士冬季打底秋衣秋裤套装大码棉毛衫ZB","itemPic":"//gw.alicdn.com/bao/uploaded/i3/738722023/O1CN01VxVnCx1QoZiSRDjJC_!!0-item_pic.jpg","itemPrice":"159.00","itemUrl":"//taoke.mdaren.taobao.com/item.htm?itemId=576878099970&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219968464906_1950250590&spm=a2141.8001249","liveId":"219968464906","sellerId":"0"}],"sliceNum":"0"},{"explained":"false","goodsIndex":"5","goodsList":[{"bulk":"false","createTime":"1551324281000","duplicate":"false","extendVal":{"isCpc":"0","subTitle":"四季穿不闷热 亲肤透气不瘙痒 健康优质纯棉","customizedItemRights":"","defaultRight":"四季穿不闷热 亲肤透气不瘙痒 健康优质纯棉","liveId":"null","materialName":"liveItem_496911231"},"favored":"false","goodsIndex":"0","groupNum":"0","hasDiscount":"false","isCpc":"0","itemH5TaokeUrl":"//h5.m.taobao.com/awp/core/detail.htm?id=543229758847&scm=1007.13381.38597.101200300000000","itemId":"543229758847","itemName":"南极人男士内裤男平角裤纯棉青年透气韩版全棉四角裤头短裤衩潮LM","itemPic":"//gw.alicdn.com/bao/uploaded/i1/738722023/O1CN011QoZiThL9G1HglG_!!0-item_pic.jpg","itemPrice":"49.90","itemUrl":"//taoke.mdaren.taobao.com/item.htm?itemId=543229758847&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219968464906_1950250590&spm=a2141.8001249","liveId":"219968464906","sellerId":"0"}],"sliceNum":"0"},{"explained":"false","goodsIndex":"4","goodsList":[{"bulk":"false","createTime":"1551321189000","duplicate":"false","extendVal":{"isCpc":"0","subTitle":"德绒发热纤维，舒适保暖","customizedItemRights":"","defaultRight":"德绒发热纤维，舒适保暖","liveId":"null","materialName":"liveItem_496735810"},"favored":"false","goodsIndex":"0","groupNum":"0","hasDiscount":"false","isCpc":"0","itemH5TaokeUrl":"//h5.m.taobao.com/awp/core/detail.htm?id=575851669945&scm=1007.13381.38597.101200300000000","itemId":"575851669945","itemName":"南极人保暖内衣男加绒加厚德绒自发热女士秋衣秋裤套装棉毛衫ZB","itemPic":"//gw.alicdn.com/bao/uploaded/i2/738722023/O1CN011QoZhr4cqctO5aH_!!0-item_pic.jpg","itemPrice":"119.00","itemUrl":"//taoke.mdaren.taobao.com/item.htm?itemId=575851669945&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219968464906_1950250590&spm=a2141.8001249","liveId":"219968464906","sellerId":"0"}],"sliceNum":"0"},{"explained":"false","goodsIndex":"3","goodsList":[{"bulk":"false","createTime":"1551237021000","duplicate":"false","extendVal":{"isCpc":"0","subTitle":"一脚套设计；彰显时尚休闲","customizedItemRights":"","defaultRight":"一脚套设计；彰显时尚休闲","liveId":"null","materialName":"liveItem_495119595"},"favored":"false","goodsIndex":"0","groupNum":"0","hasDiscount":"false","isCpc":"0","itemH5TaokeUrl":"//h5.m.taobao.com/awp/core/detail.htm?id=586655825409&scm=1007.13381.38597.101200300000000","itemId":"586655825409","itemName":"Skechers斯凯奇男鞋新款橡筋一脚套运动鞋 时尚轻质休闲鞋666082","itemPic":"//gw.alicdn.com/bao/uploaded/i4/2129855716/O1CN01npzrUw1s5yPQv6a0A_!!0-item_pic.jpg","itemPrice":"469.00","itemUrl":"//taoke.mdaren.taobao.com/item.htm?itemId=586655825409&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219968464906_1950250590&spm=a2141.8001249","liveId":"219968464906","sellerId":"0"}],"sliceNum":"0"},{"explained":"false","goodsIndex":"2","goodsList":[{"bulk":"false","createTime":"1551237010000","duplicate":"false","extendVal":{"isCpc":"0","subTitle":"轻质舒适；时尚休闲","customizedItemRights":"","defaultRight":"轻质舒适；时尚休闲","liveId":"null","materialName":"liveItem_492014541"},"favored":"false","goodsIndex":"0","groupNum":"0","hasDiscount":"false","isCpc":"0","itemH5TaokeUrl":"//h5.m.taobao.com/awp/core/detail.htm?id=586656053149&scm=1007.13381.38597.101200300000000","itemId":"586656053149","itemName":"Skechers斯凯奇男鞋新款时尚一脚套运动鞋 轻质舒适跑步鞋 55113","itemPic":"//gw.alicdn.com/bao/uploaded/i2/2129855716/O1CN01GocIL71s5yPNRIyoa_!!0-item_pic.jpg","itemPrice":"539.00","itemUrl":"//taoke.mdaren.taobao.com/item.htm?itemId=586656053149&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219968464906_1950250590&spm=a2141.8001249","liveId":"219968464906","sellerId":"0"}],"sliceNum":"0"},{"explained":"false","goodsIndex":"1","goodsList":[{"bulk":"false","createTime":"1551232375000","duplicate":"false","extendVal":{"isCpc":"0","subTitle":"简洁厚实大底；时尚运动风格","customizedItemRights":"","defaultRight":"简洁厚实大底；时尚运动风格","liveId":"null","materialName":"liveItem_492066235"},"favored":"false","goodsIndex":"0","groupNum":"0","hasDiscount":"false","isCpc":"0","itemH5TaokeUrl":"//h5.m.taobao.com/awp/core/detail.htm?id=584479513020&scm=1007.13381.38597.101200300000000","itemId":"584479513020","itemName":"Skechers斯凯奇男鞋复古运动鞋 跑步鞋厚底增高潮鞋老爹鞋休闲鞋","itemPic":"//gw.alicdn.com/bao/uploaded/i1/2129855716/O1CN01lhBO2T1s5yPDlJg6K_!!0-item_pic.jpg","itemPrice":"569.00","itemUrl":"//taoke.mdaren.taobao.com/item.htm?itemId=584479513020&accountId=1950250590&bizType=taolive&utparam=%7B%22_tbk%22:%221%22%7D&scm=1007.13381.38597.101200300000000&pg1stepk=ucm:219968464906_1950250590&spm=a2141.8001249","liveId":"219968464906","sellerId":"0"}],"sliceNum":"0"}]
      let list = []
      def.forEach(item => {
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
      // this.upGoodsList = loadStorage('upGoodsList') || def
      // if (this.upGoodsList.length === 0) {
      //   this.$message.error('还没有上架宝贝')
      //   return
      // }
      this.dialogVisible = true
    },
    // 检测是否被关联
    checkSelect(index) {
      // 0--正常 1--自动回复已关联 2--已选
      let ret = 0
      this.itemList.forEach((item) => {
        if (item === index) {
          ret = 2
        }
      })
      this.replyList.forEach((reply, replyIndex) => {
        reply.itemList.forEach((item) => {
          if (item === index) {
            ret = 1
          }
        })
      })
      return ret
    },
    selectGoods(index) {
      let type = this.checkSelect(index)
      if (type === 0) {
        this.replyTags.push(index + 1)
        this.itemList.push(index)
      }
      if (type === 2) {
        let tagIndex = 0
        this.replyTags.forEach((item,i) => {
          if (item === index + 1) {
            tagIndex = i
          }
        })
        this.replyTags.splice(tagIndex, 1)
        this.itemList.splice(tagIndex, 1)
      }
    },
    // 添加到公告列表
    addNotice() {
      if (this.replyContent === '') {
        return
      }
      let item = {
        content: this.replyContent,
        type: this.noticeType,
        time: this.noticeTime,
        before: '',
        after: '',
        id: new Date().getTime(),
        isSending: false
      }
      this.replyList.push(item)
      this.currentIndex = this.replyList.length - 1
      this.savereplyList()
      this.$nextTick(() => {
        this.setCurrentIndex(item)
      })
    },
    // 发送公告
    sendNotice(row) {
      if (!row.content) {
        this.$message.error('公告内容不能为空!')
        return
      }
      // {"parentId":"219528268702","feedId":"","interactiveName":"","feedType":707,"title":"好的"}
      let draft = {
        parentId: this.feedId,
        feedId: '',
        feedType: '707',
        interactiveName: '',
        title: row.content
      }
      let params = {
        conditions: 'null',
        _input_charset: 'utf-8',
        draft: encodeURIComponent(JSON.stringify(draft))
      }
      // let res = {
      //   success: true
      // }
      commonPush(params).then(res => {
        if (res.success) {
          this.$message({
            message: '发送公告成功',
            type: 'success'
          })
          if (row.type === 2) {
            row.isSending = true
            this._runAutoSend(row)
          }
        } else {
          this.$message.error('发送公告失败')
        }
      })
    },
    // 自动发送
    _runAutoSend(row) {
      clearTimeout(this.sendTimers[row.id])
      this.sendTimers[row.id] = setTimeout(() => {
        this.sendNotice(row)
      }, row.time * 1000)
    },
    stopSending(row) {
      clearTimeout(this.sendTimers[row.id])
      row.isSending = false
    },
    // 删除item
    delItem(index) {
      this.$confirm('此操作将删除该公告, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          clearTimeout(this.sendTimers[this.replyList[index].id])
          this.replyList.splice(index, 1)
          this.savereplyList()
          if (this.replyList.length > 0) {
            this.currentIndex = 0
          } else {
            this.currentIndex = -1
          }
        })
        .catch(() => {})
    },
    // 点击某一行
    setCurrentIndex(row) {
      this.replyList.forEach((item, index) => {
        if (row.id === item.id) {
          this.currentIndex = index
          this.replyTags = item.keyList
          this.replyContent = item.content
          this.itemList = item.itemList
        }
      })
    },
    savereplyList() {
      let key = 'replyList_' + this.liveId
      saveStorage(key, this.replyList)
    }
  },
  components: {},
  watch: {
    // replyList: {
    //   handler(val) {
    //     console.log('change')
    //     this.savereplyList()
    //   },
    //   deep: true
    // }
    replyContent(val) {
      let list = []
      let arr = val.split('\n')
      arr.forEach((item, index) => {
        if (index < 3) {
          list.push({
            idx: index,
            type: 'normal',
            msg: item
          })
        }
      })
      this.segList = list
    }
  }
}
</script>

<style lang="less">
.reply-wrapper {
  ul,
  li {
    list-style: none;
    padding: 0; margin: 0;
  }
  .dialog-goods-list {
    box-sizing: border-box;
    width: 100%;
    min-height: 370px;
    background-color: rgb(235, 238, 245);
    border-radius: 4px;
    padding: 8px 5px 6px;
    font-size: 0;
    .goods-item {
      box-sizing: border-box;
      display: inline-block;
      width: 95px;
      height: 160px;
      margin: 0px 5px 10px;
      position: relative;
      background-color: #fef0f0;
      border: 1px solid #fbc4c4;
      color: #f56c6c;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      overflow: hidden;
      cursor: pointer;
      .seq {
        position: absolute;
        top: 0;
        left: 0;
        text-align: right;
        background-color: #f86d6d;
        color: #fff;
        height: 17px;
        font-size: 12px;
        padding-left: 6px;
        padding-right: 10px;
        border-bottom-right-radius: 8px;
        font-style: normal;
      }
      .pic {
        width: 93px;
        height: 93px;
      }
      .text {
        height: 36px;
        margin: 2px 0 4px;
        padding: 0 5px;
        overflow: hidden;
      }
      .price {
        margin: 0;
        padding: 0 5px;
        overflow: hidden;
        font-size: 14px;
        text-align: right;
      }
      .icon-box{
        width: 60px; height: 60px;
        position: absolute; top: 50%; left: 50%; margin: -30px 0 0 -30px;
        border-radius: 50%; background: rgba(0,0,0,.5); text-align: center;
        .el-icon-check{
          font-size: 40px; color: #fff; line-height: 60px;
        }
      }
      .tips{
        position: absolute;
        top: 26px;
        left: 8px;
        background-color: rgba(0,0,0,.6);
        color: #fff;
        text-align: center;
        width: 77px;
        height: 48px;
        line-height: 22px;
        font-size: 14px;
        padding-top: 2px;
        border-radius: 4px;
      }
    }
  }
  .search-box {
    .el-tag {
      margin-right: 10px;
    }
    .button-new-tag {
      height: 32px;
      line-height: 30px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .input-new-tag {
      width: 90px;
      vertical-align: bottom;
    }
    .tips {
      font-size: 12px;
      line-height: 20px;
      color: #999;
    }
    .p-item {
      margin-top: 6px;
      background-color: #fff;
      border-radius: 6px;
      padding: 10px;
      font-size: 12px;
      margin-right: 10px;
    }
  }
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
