<template>
  <div id="app">
    <div id="goumee_board" class="interactive-list">
      <el-tabs type="border-card">
        <el-tab-pane label="关注卡片">
           <focus></focus>
        </el-tab-pane>
        <el-tab-pane label="公告发送">
          <notice></notice>
        </el-tab-pane>
        <el-tab-pane label="发送优惠券">发送优惠券</el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import Focus from './components/focus/focus'
import Notice from './components/notice/notice'
export default {
  name: 'App',
  data() {
    return {
      currentIndex: 0
    }
  },
  components: {
    Focus,
    Notice
  }
}
</script>

<style lang="less">
* {
  padding: 0;
  margin: 0;
}
.ext-nav {
  li {
    display: inline-block;
  }
}
</style>
