<template>
  <div class="notice-wrapper">
    <div class="search-box">
      <el-input placeholder="请输入公告内容(70字以内)" v-model="noticeContent" class="input-with-select" maxlength="70">
        <!-- <i class="el-icon-warning" slot="prepend"></i> -->
        <el-button slot="append" icon="el-icon-search" @click.native="addNotice"></el-button>
      </el-input>
      <div style="margin-top: 10px;">
        <el-radio v-model="noticeType" :label="1">手动</el-radio>
        <el-radio v-model="noticeType" :label="2">自动</el-radio>
        <el-input-number size="mini" v-model="noticeTime" :disabled="noticeType==1" :min="1"></el-input-number> 秒
      </div>
    </div>
    <div class="notice-list-wrapper">
      <el-table class="notice-list" :data="noticeList" style="width: 100%" @row-click="setCurrentIndex" :row-key="getRowKeys" :expand-row-keys="expands">
        <el-table-column type="expand" width="10">
          <template slot-scope="scope">
            <el-input v-model="scope.row.content" size="medium"></el-input>
            <div style="margin-top: 10px;">
              <el-radio v-model="scope.row.type" :label="1">手动</el-radio>
              <el-radio v-model="scope.row.type" :label="2">自动</el-radio>
              <el-input-number size="mini" v-model="scope.row.time" :disabled="scope.row.type==1" :min="1"></el-input-number> 秒
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
        <!-- <el-table-column prop="before" label="上次发送" width="80">
        </el-table-column>
        <el-table-column prop="after" label="下次发送" width="80">
        </el-table-column> -->
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click.stop="sendNotice(scope.row)" v-if="!scope.row.isSending">{{scope.row.type===1?'普通':'定时'}}发送</el-button>
            <el-button size="mini" type="primary" @click.stop="stopSending(scope.row)" v-if="scope.row.isSending">停止发送</el-button>
            <el-button size="mini" type="primary" @click.stop="delItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { commonPush } from '@/api'
import { urlParse, saveStorage, loadStorage } from '@/util/tools'
export default {
  name: 'Notice',
  data() {
    return {
      noticeContent: '',
      // 1--手动，2--自动
      noticeType: 1,
      // 自动间隔时间
      noticeTime: 10,
      noticeList: [],
      expands: [],
      feedId: urlParse().id,
      liveId: urlParse().id,
      getRowKeys(row) {
        return row.id
      },
      sendTimers: {}
    }
  },
  created() {
    let key = 'noticeList_' + this.liveId
    if (loadStorage(key)) {
      this.noticeList = loadStorage(key)
      this.setCurrentIndex(this.noticeList[0])
    }
  },
  methods: {
    // 添加到公告列表
    addNotice() {
      if (this.noticeContent === '') {
        return
      }
      let item = {
        content: this.noticeContent,
        type: this.noticeType,
        time: this.noticeTime,
        before: '',
        after: '',
        id: new Date().getTime(),
        isSending: false
      }
      this.noticeList.push(item)
      this.currentIndex = this.noticeList.length - 1
      this.saveNoticeList()
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
          clearTimeout(this.sendTimers[this.noticeList[index].id])
          this.noticeList.splice(index, 1)
          this.saveNoticeList()
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
    },
    saveNoticeList() {
      let key = 'noticeList_' + this.liveId
      saveStorage(key, this.noticeList)
    }
  },
  components: {},
  watch: {
    'noticeList': {
      handler(val) {
        this.saveNoticeList()
      },
      deep: true
    }
  }
}
</script>

<style lang="less">
.notice-wrapper {
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
