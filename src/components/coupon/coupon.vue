<template>
  <div class="coupon-wrapper">
    <div class="search-box">
      <el-input placeholder="请输入优惠券链接" v-model="noticeContent" class="input-with-select">
        <!-- <i class="el-icon-warning" slot="prepend"></i> -->
        <el-button slot="append" icon="el-icon-search" @click.native="addNotice"></el-button>
      </el-input>
    </div>
    <div class="notice-list-wrapper">
      <el-table class="notice-list" :data="noticeList" style="width: 100%" @row-click="setCurrentIndex" :row-key="getRowKeys" :expand-row-keys="expands">
        <el-table-column type="expand" width="10">
          <template slot-scope="scope">
            <el-input v-model="scope.row.content" size="medium"></el-input>
            <div style="margin-top: 10px;">
              <el-radio v-model="scope.row.type" :label="1">手动</el-radio>
              <el-radio v-model="scope.row.type" :label="2">自动</el-radio>
              <el-input-number size="mini" v-model="scope.row.time" :disabled="scope.row.type==1" :min="10"></el-input-number> 秒
            </div>
          </template>
        </el-table-column>
        <el-table-column label="#" width="40">
          <template slot-scope="scope">
            <i class="el-icon-arrow-right" v-if="scope.row.id!==expands[0]"></i>
            <i class="el-icon-arrow-down" v-if="scope.row.id===expands[0]"></i>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="公告内容">
        </el-table-column>
        <el-table-column prop="before" label="上次发送" width="80">
        </el-table-column>
        <el-table-column prop="after" label="下次发送" width="80">
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click.stop="sendNotice(scope.row)">{{scope.row.type===1?'普通':'定时'}}发送</el-button>
            <el-button size="mini" type="primary" @click.stop="delItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { commonPush } from '@/api'
import { urlParse } from '@/util/tools'
export default {
  name: 'Notice',
  data() {
    return {
      noticeContent: '',
      // 1--手动，2--自动
      noticeType: 1,
      // 自动间隔时间
      noticeTime: 1,
      noticeList: [],
      expands: [],
      feedId: urlParse().id,
      getRowKeys(row) {
        return row.id
      }
    }
  },
  created() {
    // if (localStorage.noticeList) {
    //   this.noticeList = JSON.parse(localStorage.noticeList)
    //   this.setCurrentIndex(this.noticeList[0])
    // }
  },
  methods: {
    // 添加到公告列表
    addNotice() {
      let item = {
        content: this.noticeContent,
        type: this.noticeType,
        time: this.noticeTime,
        before: '',
        after: '',
        id: new Date().getTime()
      }
      this.noticeList.push(item)
      this.currentIndex = this.noticeList.length - 1
      localStorage.noticeList = JSON.stringify(this.noticeList)
      this.$nextTick(() => {
        this.setCurrentIndex(item)
      })
    },
    // 发送公告
    sendNotice(row) {
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
      commonPush(params).then(res => {
        if (res.success) {
          this.$message({
            message: '发送公告成功',
            type: 'success'
          })
          if (row.type === 2) {
            this._runAutoSend(row)
          }
        } else {
          this.$message.error('发送公告失败')
        }
      })
    },
    // 自动发送
    _runAutoSend(row) {
      this.sendTimer = setTimeout(() => {
        this.sendNotice(row)
      }, row.time * 1000)
    },
    // 删除item
    delItem(index) {
      this.$confirm('此操作将删除该公告, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.noticeList.splice(index, 1)
          if (this.noticeList.length > 0) {
            this.currentIndex = 0
          } else {
            this.currentIndex = -1
          }
        })
        .catch(() => {})
    },
    // 点击某一行
    setCurrentIndex(row) {
      this.noticeList.forEach((item, index) => {
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
  components: {}
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
