<template>
  <div id="app">
    <div id="goumee_board" class="interactive-list-jimei">
      <div class="jimei-tips">
        <img class="jimei-logo" src="./assets/images/logo.png">
        <span class="jimei-name">极美插件</span>
        <span class="jimei-version">v1.0</span>
      </div>
      <el-tabs type="border-card">
        <el-tab-pane label="自动回复">
          <autoReply></autoReply>
        </el-tab-pane>
        <el-tab-pane label="宝贝管理">
           <goods></goods>
        </el-tab-pane>
        <el-tab-pane label="发优惠券">
          <coupon></coupon>
        </el-tab-pane>
        <el-tab-pane label="关注卡片">
           <focus></focus>
        </el-tab-pane>
        <el-tab-pane label="公告发送">
          <notice></notice>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import Focus from './components/focus/focus'
import Notice from './components/notice/notice'
import Goods from './components/goods/goods'
import Coupon from './components/coupon/coupon'
import autoReply from './components/autoReply/autoReply'
export default {
  name: 'App',
  data() {
    return {
      currentIndex: 0
    }
  },
  components: {
    Focus,
    Notice,
    Goods,
    Coupon,
    autoReply
  }
}
</script>

<style lang="less">
// body{
//   padding: 0; margin: 0;
// }
.mt10{
  margin-top: 10px;
}
.interactive-list-jimei{
  overflow: hidden;
  background-color: #fff;
  padding: 10px;
  position: relative;
  margin-top: 10px;
  .jimei-tips{
    display: flex;
    padding: 5px 0;
    .jimei-logo{
      display: inline-block;
      width: 22px; height: 22px;
    }
    .jimei-name{
      margin-left: 6px; color: #666; font-size: 14px;
      line-height: 22px;
    }
    .jimei-version{
      margin-left: 6px; color: #999; font-size: 12px;
      line-height: 22px;
    }
  }
  .search-box {
    background: #f5f5f5;
    padding: 10px;
    box-shadow: rgb(220, 216, 216) 0px 0px 10px;
    border: 1px solid rgb(227, 227, 227);
  }
  .flex{
    display: flex;
  }
  .ext-nav {
    li {
      display: inline-block;
    }
  }
}
.el-table__expanded-cell{
  // background: #f5f5f5;
}
</style>
