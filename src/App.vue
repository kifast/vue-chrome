<template>
  <div id="app">
    <div id="goumee_board" class="interactive-list">
      <el-tabs type="border-card">
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
    Coupon
  }
}
</script>

<style lang="less">
* {
  padding: 0;
  margin: 0;
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
.el-table__expanded-cell{
  // background: #f5f5f5;
}
</style>
